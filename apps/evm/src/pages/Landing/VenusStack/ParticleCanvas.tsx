import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  HUB_CENTER,
  fitStory,
  makeStoryParticle,
  spokeCenter,
  storyFrame,
  writeStoryPose,
} from './particleStory';
import { SPOKES, STACK_LAYERS } from './stackData';

type ElementRef<T extends HTMLElement> = { current: T | null };

interface ParticleCanvasProps {
  wrapperRef: ElementRef<HTMLElement>;
  pinRef: ElementRef<HTMLDivElement>;
  barRef: ElementRef<HTMLDivElement>;
  names: string[];
  reduceMotion: boolean;
  onActive: (index: number) => void;
}

/** Explorer's alternative story: point clouds and curved exchanges, never stack geometry. */
export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  wrapperRef,
  pinRef,
  barRef,
  names,
  reduceMotion,
  onActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef(names);
  const activeRef = useRef(onActive);
  const smoothRef = useRef(0);
  const namesKey = names.join('|');
  namesRef.current = names;
  activeRef.current = onActive;

  // biome-ignore lint/correctness/useExhaustiveDependencies: translated texture-free labels rebuild on namesKey
  useEffect(() => {
    const canvas = canvasRef.current;
    const pin = pinRef.current;
    const wrapper = wrapperRef.current;
    const labels = labelsRef.current;
    if (!canvas || !pin || !wrapper || !labels) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      // The ordinary text rail remains available without WebGL.
      return;
    }
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -20, 20);
    camera.position.z = 10;
    // More fine points define a contour without the old oversized sparkle dots.
    const count = 2400;
    const seeds = Array.from({ length: count }, (_, i) => makeStoryParticle(i));
    const positions = new Float32Array(count * 3);
    const strengths = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const palette = document.createElement('canvas').getContext('2d');
    const blue = new THREE.Color();
    if (palette) {
      palette.fillStyle = getComputedStyle(wrapper).getPropertyValue('--vs-blue').trim();
      palette.fillRect(0, 0, 1, 1);
      const [r, g, b] = palette.getImageData(0, 0, 1, 1).data;
      blue.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }
    const tint = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const bright = i % 61 === 0;
      sizes[i] = bright ? 3.2 : 1.7 + seeds[i].radius * 0.6;
      tint.copy(blue).lerp(new THREE.Color(0xffffff), bright ? 0.8 : 0.55);
      tint.toArray(colors, i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aStrength', new THREE.BufferAttribute(strengths, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.ShaderMaterial({
      uniforms: { uDpr: { value: dpr } },
      vertexShader: `
        attribute float aStrength;
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uDpr;
        varying float vStrength;
        varying vec3 vColor;
        void main() {
          vStrength = aStrength;
          vColor = aColor;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uDpr * (1.0 + position.z * 0.15);
        }
      `,
      fragmentShader: `
        varying float vStrength;
        varying vec3 vColor;
        void main() {
          vec2 p = gl_PointCoord - vec2(0.5);
          float r = dot(p, p);
          float alpha = (exp(-r * 16.0) + exp(-r * 8.0) * 0.12) * vStrength;
          if (alpha < 0.005) discard;
          gl_FragColor = vec4(vColor, alpha);
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const labelNodes = Array.from(labels.children) as HTMLDivElement[];
    const sampleA = new Float32Array(4);
    const sampleB = new Float32Array(4);
    let width = 1;
    let height = 1;
    let visible = false;
    let frameId = 0;
    let lastActive = -2;
    const rail = pin.querySelector<HTMLElement>('.venus-stack__rail');
    const navigation = pin.querySelector<HTMLElement>('.venus-stack__under');
    let gutter = 0;

    const renderFrame = (now: number) => {
      frameId = 0;
      if (!visible || document.visibilityState !== 'visible') return;
      const wrapperBounds = wrapper.getBoundingClientRect();
      const pinBounds = pin.getBoundingClientRect();
      const target = THREE.MathUtils.clamp(
        (pinBounds.top - wrapperBounds.top) / Math.max(wrapperBounds.height - pinBounds.height, 1),
        0,
        1,
      );
      smoothRef.current += (target - smoothRef.current) * (reduceMotion ? 1 : 0.1);
      const progress = smoothRef.current * STACK_LAYERS.length;
      const active = smoothRef.current > 0.001 ? Math.min(6, Math.floor(progress)) : -1;
      if (active !== lastActive) {
        lastActive = active;
        activeRef.current(active);
      }
      if (barRef.current) barRef.current.style.width = `${smoothRef.current * 100}%`;
      const { from, to, blend } = storyFrame(progress);
      const narrow = width < 760;
      const railBounds = rail?.getBoundingClientRect();
      const railBottom = railBounds ? railBounds.bottom - pinBounds.top : 0;
      const artLeft = narrow ? gutter : (railBounds?.right ?? pinBounds.left) - pinBounds.left;
      const artTop = narrow ? railBottom + gutter / 2 : height * 0.16;
      const artBottom =
        (navigation?.getBoundingClientRect().top ?? pinBounds.bottom) - pinBounds.top;
      const {
        x: centerX,
        y: centerY,
        scale: radius,
      } = fitStory(
        artLeft + gutter / 2,
        artTop,
        Math.max(0, width - artLeft - gutter * 1.5),
        Math.max(0, artBottom - gutter / 2 - artTop),
      );
      const particleCount = narrow ? count / 2 : count;
      const time = reduceMotion ? 0 : now / 1000;
      geometry.setDrawRange(0, particleCount);
      for (let i = 0; i < particleCount; i++) {
        writeStoryPose(from, seeds[i], time, sampleA);
        writeStoryPose(to, seeds[i], time, sampleB);
        positions[i * 3] = centerX + THREE.MathUtils.lerp(sampleA[0], sampleB[0], blend) * radius;
        positions[i * 3 + 1] =
          centerY + THREE.MathUtils.lerp(sampleA[1], sampleB[1], blend) * radius;
        positions[i * 3 + 2] = THREE.MathUtils.lerp(sampleA[2], sampleB[2], blend);
        strengths[i] = THREE.MathUtils.lerp(sampleA[3], sampleB[3], blend);
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aStrength.needsUpdate = true;
      const fromNetwork = from === 2 || from === 3;
      const toNetwork = to === 2 || to === 3;
      const spokeVisibility = (fromNetwork ? 1 - blend : 0) + (toNetwork ? blend : 0);
      labelNodes.forEach((node, index) => {
        const isHub = index === 0;
        const [x, y] = isHub ? [HUB_CENTER[0] * spokeVisibility, 0] : spokeCenter(index - 1);
        // Names sit clear of each contour. The Hub's name has the strongest hierarchy.
        const captionY = isHub ? (1 - spokeVisibility) * 1.4 + spokeVisibility * 0.65 : 0.3;
        node.style.transform = `translate(${centerX + x * radius}px, ${
          centerY + (y + captionY) * radius
        }px) translate(-50%, 0)`;
        node.style.opacity = `${isHub ? 1 : spokeVisibility}`;
      });
      labelNodes[0].textContent =
        active === 6
          ? 'VENUS'
          : active === 2 || active === 3
            ? namesRef.current[1]
            : namesRef.current[Math.max(0, active)];
      renderer.render(scene, camera);
      if (!reduceMotion) frameId = requestAnimationFrame(renderFrame);
    };
    const requestRender = () => {
      if (!frameId && visible && document.visibilityState === 'visible')
        frameId = requestAnimationFrame(renderFrame);
    };
    const resize = () => {
      width = pin.clientWidth;
      height = pin.clientHeight;
      if (!width || !height) return;
      gutter = rail ? Number.parseFloat(getComputedStyle(rail).paddingLeft) : 0;
      renderer.setSize(width, height, false);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      requestRender();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(pin);
    if (rail) resizeObserver.observe(rail);
    const intersectionObserver = new IntersectionObserver(
      entries => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) requestRender();
        else {
          cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { rootMargin: '100px' },
    );
    intersectionObserver.observe(pin);
    const handleVisibility = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      requestRender();
    };
    document.addEventListener('scroll', requestRender, true);
    document.addEventListener('visibilitychange', handleVisibility);
    resize();
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('scroll', requestRender, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [wrapperRef, pinRef, barRef, namesKey, reduceMotion]);

  return (
    <>
      <canvas ref={canvasRef} className="venus-stack__canvas" />
      <div ref={labelsRef} className="venus-particles__labels" aria-hidden="true">
        <div className="venus-particles__label text-sm md:text-base font-semibold">{names[0]}</div>
        {SPOKES.map(name => (
          <div className="venus-particles__label text-xs md:text-sm" key={name}>
            {name}
          </div>
        ))}
      </div>
    </>
  );
};
