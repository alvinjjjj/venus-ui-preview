import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import particleFieldSrc from './assets/particle-field.png';
import explorerStars from './explorer-stars.json';
import type { ExplorerStarTuning, FlowSettings } from './motionStore';

export type FlowVariant = 'prism' | 'depth-pulse' | 'milky-way';

const MERGE_AT = 0.64;
const HORIZON = 0.51;
const SEGMENTS = 56;
const HOVER_HIT_RADIUS = 48;
const HOVER_SPEED_MULTIPLIER = 2.15;
const HOVER_ACCELERATION_TIME = 0.18;
const HOVER_DECELERATION_TIME = 0.42;
const explorerStarSettings = explorerStars.settings;

type ParticleSeed = {
  lane: number;
  depth: number;
  phase: number;
  velocity: number;
  weight: number;
};

function hash(index: number, salt: number) {
  let value = Math.imul(index + salt * 1013, 0x9e3779b1);
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b);
  value ^= value >>> 13;
  return (value >>> 0) / 0x100000000;
}

function smoothstep(start: number, end: number, value: number) {
  const t = Math.min(Math.max((value - start) / (end - start), 0), 1);
  return t * t * (3 - 2 * t);
}

function sampleRange(range: number[], seed: number) {
  return range[0] + (range[1] - range[0]) * seed;
}

function pathPoint(
  lane: number,
  progress: number,
  width: number,
  height: number,
  variant: FlowVariant,
  depth = 1,
) {
  const x = progress * width;
  const sourceY = height * (0.07 + lane * 0.88);
  const mergeProgress = Math.min(progress / MERGE_AT, 1);
  const curve = variant !== 'prism' ? [1.75, 2.15, 2.55][depth] : 2.15;
  const separation = (1 - mergeProgress) ** curve;
  // Explorer's paths bend gently toward the shared horizon before they meet.
  const gravitationalPull =
    variant !== 'prism' ? 1 - 0.06 * Math.sin(Math.PI * smoothstep(0.28, 1, mergeProgress)) : 1;
  const lensProgress = Math.min(Math.max((progress - 0.48) / 0.16, 0), 1);
  const refraction =
    variant === 'prism' ? Math.sin(lensProgress * Math.PI) * (lane - 0.5) * height * 0.035 : 0;
  const y =
    height * HORIZON + (sourceY - height * HORIZON) * separation * gravitationalPull + refraction;
  return { x, y };
}

export const FlowFieldThree: React.FC<{
  settings: FlowSettings;
  starTuning: ExplorerStarTuning;
  variant: FlowVariant;
  interactive: boolean;
}> = ({ settings, starTuning, variant, interactive }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  const starTuningRef = useRef(starTuning);
  const variantRef = useRef(variant);
  const interactiveRef = useRef(interactive);
  const appliedRef = useRef({ settings, starTuning, variant });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearAlpha(0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const spineMaterial = new THREE.LineBasicMaterial({
      color: 0x167ac0,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const foregroundMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: pixelRatio } },
      vertexShader: `
        attribute float aSize;
        attribute float aIntensity;
        attribute float aShape;
        attribute vec3 aColor;
        uniform float uPixelRatio;
        varying float vIntensity;
        varying float vShape;
        varying vec3 vColor;

        void main() {
          vIntensity = aIntensity;
          vShape = aShape;
          vColor = aColor;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio;
        }
      `,
      fragmentShader: `
        varying float vIntensity;
        varying float vShape;
        varying vec3 vColor;

        void main() {
          vec2 point = gl_PointCoord - vec2(0.5);
          float radius = length(point);
          float core = 1.0 - smoothstep(0.04, 0.2, radius);
          float halo = 1.0 - smoothstep(0.12, 0.5, radius);
          float roundStar = core * 0.78 + halo * 0.22;
          float horizontal = (1.0 - smoothstep(0.015, 0.055, abs(point.y))) *
            (1.0 - smoothstep(0.22, 0.5, abs(point.x)));
          float vertical = (1.0 - smoothstep(0.015, 0.055, abs(point.x))) *
            (1.0 - smoothstep(0.22, 0.5, abs(point.y)));
          float crossStar = max(core * 0.85, max(horizontal, vertical) * 0.75) + halo * 0.1;
          float alpha = mix(roundStar, crossStar, step(0.5, vShape)) * vIntensity;
          if (alpha < 0.004) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    let lineMesh: THREE.LineSegments | undefined;
    let foregroundMesh: THREE.Mesh | undefined;
    let spineMesh: THREE.LineSegments | undefined;
    let particleMesh: THREE.Points | undefined;
    let distantStarsMesh: THREE.Points | undefined;
    let starIntensities: Float32Array | undefined;
    let starBaseIntensities: Float32Array | undefined;
    let starTwinkleRates: Float32Array | undefined;
    let starTwinklePhases: Float32Array | undefined;
    let starShapeFlags: Float32Array | undefined;
    let starBasePositions: Float32Array | undefined;
    let starDriftPhases: Float32Array | undefined;
    let starDriftVelocities: Float32Array | undefined;
    let starVerticalAmplitudes: Float32Array | undefined;
    let starVerticalWavelengths: Float32Array | undefined;
    let starTravel: Float32Array | undefined;
    let particlePositions: Float32Array | undefined;
    let particleIntensities: Float32Array | undefined;
    let particleSeeds: ParticleSeed[] = [];
    let width = 1;
    let height = 1;
    let visible = true;
    let lastTime = 0;
    let lastFrameDelta = 0;
    let elapsed = 0;
    let starElapsed = 0;
    let frame = 0;
    let reducedMotion = false;
    let hoverTarget = 0;
    let hoverAmount = 0;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const syncMotion = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) {
        hoverTarget = 0;
        hoverAmount = 0;
      }
      lastFrameDelta = 0;
      updateParticles();
      updateStars();
      renderer.render(scene, camera);
      updateLoop();
    };

    const clearGeometry = () => {
      if (lineMesh) {
        scene.remove(lineMesh);
        lineMesh.geometry.dispose();
      }
      if (foregroundMesh) {
        scene.remove(foregroundMesh);
        foregroundMesh.geometry.dispose();
        foregroundMesh = undefined;
      }
      if (spineMesh) {
        scene.remove(spineMesh);
        spineMesh.geometry.dispose();
      }
      if (particleMesh) {
        scene.remove(particleMesh);
        particleMesh.geometry.dispose();
      }
      if (distantStarsMesh) {
        scene.remove(distantStarsMesh);
        distantStarsMesh.geometry.dispose();
        distantStarsMesh = undefined;
      }
    };

    const buildGeometry = () => {
      lastFrameDelta = 0;
      clearGeometry();
      const { lines, particles } = settingsRef.current;
      const currentVariant = variantRef.current;
      const hasDepth = currentVariant !== 'prism';
      const isMilkyWay = currentVariant === 'milky-way';
      const isExplorer = currentVariant === 'depth-pulse';
      if (hasDepth) {
        const tuning = starTuningRef.current;
        const density =
          tuning.stars /
          (explorerStarSettings.counts.dust +
            explorerStarSettings.counts.bright +
            explorerStarSettings.counts.glints);
        const referenceArea =
          explorerStarSettings.referenceViewport.width *
          explorerStarSettings.referenceViewport.height;
        const explorerScale = Math.min(
          explorerStarSettings.areaScale.max,
          Math.max(explorerStarSettings.areaScale.min, (width * height) / referenceArea),
        );
        const dustCount = Math.round(
          explorerStarSettings.counts.dust * explorerScale * (isExplorer ? density : 1),
        );
        const brightCount = Math.max(
          3,
          Math.round(
            explorerStarSettings.counts.bright * explorerScale * (isExplorer ? density : 1),
          ),
        );
        const crossStarCount =
          isExplorer && tuning.crossStars > 0
            ? Math.min(
                tuning.crossStars,
                Math.max(1, Math.round(tuning.crossStars * explorerScale)),
              )
            : 0;
        const glintCount = Math.max(
          1,
          crossStarCount,
          Math.round(
            explorerStarSettings.counts.glints * explorerScale * (isExplorer ? density : 1),
          ),
        );
        const starCount = isExplorer ? dustCount + brightCount + glintCount : 176;
        const starPositions = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        starIntensities = new Float32Array(starCount);
        starBaseIntensities = new Float32Array(starCount);
        starTwinkleRates = new Float32Array(starCount);
        starTwinklePhases = new Float32Array(starCount);
        starShapeFlags = new Float32Array(starCount);
        starDriftPhases = new Float32Array(starCount);
        starDriftVelocities = new Float32Array(starCount);
        starVerticalAmplitudes = new Float32Array(starCount);
        starVerticalWavelengths = new Float32Array(starCount);
        const previousStarTravel = starTravel;
        starTravel = new Float32Array(starCount);
        if (previousStarTravel) {
          starTravel.set(
            previousStarTravel.subarray(0, Math.min(starCount, previousStarTravel.length)),
          );
        }
        const starColors = new Float32Array(starCount * 3);
        for (let index = 0; index < starCount; index++) {
          const crossStarIndex = index - dustCount - brightCount;
          const isCrossStar = isExplorer && crossStarIndex >= 0 && crossStarIndex < crossStarCount;
          const crossStarPosition = isCrossStar
            ? explorerStarSettings.crossStars.positions[crossStarIndex]
            : undefined;
          const upperRight =
            isExplorer && hash(index, 15) < explorerStarSettings.distribution.upperRightShare;
          const x = crossStarPosition
            ? crossStarPosition[0]
            : upperRight
              ? explorerStarSettings.distribution.upperRightStartX +
                hash(index, 19) * (1 - explorerStarSettings.distribution.upperRightStartX)
              : hash(index, 11);
          const seedY = hash(index, 12);
          // New keeps its diagonal dust band; Explorer fills its quieter upper-right sky.
          const y = crossStarPosition
            ? crossStarPosition[1]
            : isMilkyWay && hash(index, 15) < 0.76
              ? Math.min(Math.max(0.1 + x * 0.5 + (seedY - 0.5) * 0.44, 0.03), 0.94)
              : upperRight
                ? explorerStarSettings.distribution.upperRightTopY +
                  seedY * explorerStarSettings.distribution.upperRightHeight
                : seedY;
          starPositions.set([x * width, y * height, -1], index * 3);
          const isDust = isExplorer && index < dustCount;
          const isBright = isExplorer && index >= dustCount && index < dustCount + brightCount;
          const isWarm = isExplorer && (isDust || isBright) && hash(index, 26) < tuning.warmth;
          starShapeFlags[index] = isCrossStar ? 1 : 0;
          starSizes[index] =
            (isMilkyWay
              ? 2 + hash(index, 13) * 2.7
              : isCrossStar
                ? sampleRange(explorerStarSettings.crossStars.sizePixels, hash(index, 13))
                : isDust
                  ? sampleRange(explorerStarSettings.size.dust, hash(index, 13))
                  : isBright
                    ? sampleRange(explorerStarSettings.size.bright, hash(index, 13))
                    : sampleRange(explorerStarSettings.size.glints, hash(index, 13))) *
            (isExplorer ? tuning.size : 1);
          // Leave the headline and lower content quieter than the open sky.
          const behindContent = isCrossStar
            ? false
            : isMilkyWay
              ? (x > 0.23 && x < 0.78 && y > 0.08 && y < 0.32) ||
                (x > 0.57 && y > 0.72) ||
                (x < 0.34 && y > 0.68)
              : (x > 0.25 && x < 0.76 && y > 0.08 && y < 0.35) ||
                (x > 0.68 && y > 0.66) ||
                (x < 0.34 && y > 0.68) ||
                (x > 0.55 && y > 0.46 && y < 0.56);
          const baseIntensity = isMilkyWay
            ? 0.22 + hash(index, 14) * 0.4
            : isCrossStar
              ? sampleRange(explorerStarSettings.crossStars.brightness, hash(index, 14))
              : isDust
                ? sampleRange(explorerStarSettings.brightness.dust, hash(index, 14))
                : isBright
                  ? sampleRange(explorerStarSettings.brightness.bright, hash(index, 14))
                  : sampleRange(explorerStarSettings.brightness.glints, hash(index, 14));
          const intensity =
            (behindContent
              ? isMilkyWay
                ? 0.055
                : baseIntensity * explorerStarSettings.distribution.contentDim
              : baseIntensity) * (isExplorer ? tuning.brightness : 1);
          starIntensities[index] = intensity;
          starBaseIntensities[index] = intensity;
          starTwinkleRates[index] =
            isMilkyWay && hash(index, 16) < 0.26
              ? 0.1 + hash(index, 17) * 0.12
              : isCrossStar && tuning.twinkle > 0
                ? sampleRange(explorerStarSettings.crossStars.cyclesPerSecond, hash(index, 17))
                : isExplorer && hash(index, 16) < tuning.twinkle
                  ? sampleRange(explorerStarSettings.twinkle.cyclesPerSecond, hash(index, 17))
                  : 0;
          starTwinklePhases[index] = hash(index, 18);
          // Different velocities give the sky depth while its overall drift
          // follows the flow's left-to-right direction.
          starDriftPhases[index] = hash(index, 22) * Math.PI * 2;
          starDriftVelocities[index] = sampleRange(
            explorerStarSettings.drift.pixelsPerSecond,
            hash(index, 23),
          );
          starVerticalAmplitudes[index] = sampleRange(
            explorerStarSettings.drift.verticalAmplitudePixels,
            hash(index, 24),
          );
          starVerticalWavelengths[index] = sampleRange(
            explorerStarSettings.drift.verticalWavelengthPixels,
            hash(index, 25),
          );
          starColors.set(
            isMilkyWay
              ? [0.46, 0.68, 0.94]
              : isCrossStar
                ? explorerStarSettings.crossStars.color
                : isWarm && isBright
                  ? explorerStarSettings.colors.warmBright
                  : isWarm
                    ? explorerStarSettings.colors.warmDust
                    : isDust && hash(index, 21) < explorerStarSettings.colors.blueDustShare
                      ? explorerStarSettings.colors.blueDust
                      : isDust
                        ? explorerStarSettings.colors.dust
                        : explorerStarSettings.colors.bright,
            index * 3,
          );
        }
        starBasePositions = new Float32Array(starPositions);
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
        starGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(starIntensities, 1));
        starGeometry.setAttribute('aShape', new THREE.BufferAttribute(starShapeFlags, 1));
        starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));
        distantStarsMesh = new THREE.Points(starGeometry, particleMaterial);
        distantStarsMesh.renderOrder = -1;
        scene.add(distantStarsMesh);
      }
      const vertices = new Float32Array(lines * SEGMENTS * 6);
      const colors = new Float32Array(vertices.length);
      const foregroundVertices: number[] = [];
      const foregroundColors: number[] = [];
      const lineColor = new THREE.Color();

      for (let lane = 0; lane < lines; lane++) {
        const normalizedLane = lines === 1 ? 0.5 : lane / (lines - 1);
        const depth = lane % 3;
        const distanceFromCenter = Math.abs(normalizedLane - 0.5) * 2;
        const intensity =
          (0.22 + (1 - distanceFromCenter) * 0.21) * (hasDepth ? [0.54, 0.9, 1.36][depth] : 1);
        for (let segment = 0; segment < SEGMENTS; segment++) {
          const index = (lane * SEGMENTS + segment) * 6;
          const start = pathPoint(
            normalizedLane,
            (segment / SEGMENTS) * MERGE_AT,
            width,
            height,
            currentVariant,
            depth,
          );
          const end = pathPoint(
            normalizedLane,
            ((segment + 1) / SEGMENTS) * MERGE_AT,
            width,
            height,
            currentVariant,
            depth,
          );
          vertices.set([start.x, start.y, 0, end.x, end.y, 0], index);
          const fade = 1 - 0.53 * (segment / SEGMENTS);
          lineColor.setRGB(
            0.19 * intensity * fade,
            0.31 * intensity * fade,
            0.43 * intensity * fade,
          );
          colors.set(
            [lineColor.r, lineColor.g, lineColor.b, lineColor.r, lineColor.g, lineColor.b],
            index,
          );
          if (hasDepth && depth === 2) {
            const halfWidth = Math.min(1.3, Math.max(0.7, width / 1200));
            foregroundVertices.push(
              start.x,
              start.y - halfWidth,
              0.3,
              end.x,
              end.y - halfWidth,
              0.3,
              end.x,
              end.y + halfWidth,
              0.3,
              start.x,
              start.y - halfWidth,
              0.3,
              end.x,
              end.y + halfWidth,
              0.3,
              start.x,
              start.y + halfWidth,
              0.3,
            );
            const glow = [0.1 * fade, 0.44 * fade, 0.78 * fade];
            for (let vertex = 0; vertex < 6; vertex++) foregroundColors.push(...glow);
          }
        }
      }

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lineMesh);

      if (foregroundVertices.length) {
        const foregroundGeometry = new THREE.BufferGeometry();
        foregroundGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(foregroundVertices, 3),
        );
        foregroundGeometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(foregroundColors, 3),
        );
        foregroundMesh = new THREE.Mesh(foregroundGeometry, foregroundMaterial);
        scene.add(foregroundMesh);
      }

      spineMaterial.color.setHex(hasDepth ? 0x167ac0 : 0x48bcff);
      spineMaterial.opacity = hasDepth ? 0.48 : 0.72;
      const spineGeometry = new THREE.BufferGeometry();
      spineGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [width * MERGE_AT, height * HORIZON, 0, width, height * HORIZON, 0],
          3,
        ),
      );
      spineMesh = new THREE.LineSegments(spineGeometry, spineMaterial);
      scene.add(spineMesh);

      particlePositions = new Float32Array(particles * 3);
      particleIntensities = new Float32Array(particles);
      particleSeeds = [];
      const particleSizes = new Float32Array(particles);
      const particleColors = new Float32Array(particles * 3);
      for (let index = 0; index < particles; index++) {
        const tier = hash(index, 4);
        const laneIndex = Math.floor(hash(index, 1) * lines);
        const depth = laneIndex % 3;
        const depthScale = hasDepth ? [0.7, 1, 1.24][depth] : 1;
        const weight = (tier < 0.72 ? 0.58 : tier < 0.96 ? 0.85 : 1.04) * depthScale;
        particleSeeds.push({
          lane: lines < 2 ? 0.5 : laneIndex / (lines - 1),
          depth,
          phase: hash(index, 2),
          velocity: (0.043 + hash(index, 3) * 0.052) * (hasDepth ? [0.76, 1, 1.28][depth] : 1),
          weight,
        });
        particleSizes[index] =
          (tier < 0.72 ? 4.5 : tier < 0.96 ? 6.8 : 10.5) * (hasDepth ? [0.82, 1, 1.2][depth] : 1);
        particleColors.set(
          tier < 0.72 ? [0.25, 0.58, 0.9] : tier < 0.96 ? [0.13, 0.68, 1] : [0.45, 0.85, 1],
          index * 3,
        );
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute(
        'aIntensity',
        new THREE.BufferAttribute(particleIntensities, 1),
      );
      particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));
      particleGeometry.setAttribute(
        'aShape',
        new THREE.BufferAttribute(new Float32Array(particles), 1),
      );
      particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(particleColors, 3));
      particleMesh = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleMesh);

      updateParticles();
      updateStars();
      renderer.render(scene, camera);
    };

    const updateStars = () => {
      if (
        variantRef.current === 'prism' ||
        !distantStarsMesh ||
        !starIntensities ||
        !starBaseIntensities ||
        !starTwinkleRates ||
        !starTwinklePhases ||
        !starShapeFlags
      )
        return;
      for (let index = 0; index < starIntensities.length; index++) {
        const rate = starTwinkleRates[index];
        const minimumBrightness =
          starShapeFlags[index] === 1
            ? explorerStarSettings.crossStars.minimumBrightness
            : variantRef.current === 'depth-pulse'
              ? explorerStarSettings.twinkle.minimumBrightness
              : 0.44;
        const midpoint = (1 + minimumBrightness) / 2;
        const amplitude = (1 - minimumBrightness) / 2;
        starIntensities[index] =
          rate && !reducedMotion
            ? starBaseIntensities[index] *
              (midpoint +
                amplitude *
                  Math.sin(
                    ((variantRef.current === 'depth-pulse' ? starElapsed : elapsed) * rate +
                      starTwinklePhases[index]) *
                      Math.PI *
                      2,
                  ))
            : starBaseIntensities[index];
      }
      distantStarsMesh.geometry.attributes.aIntensity.needsUpdate = true;
      if (
        variantRef.current === 'depth-pulse' &&
        !reducedMotion &&
        starBasePositions &&
        starDriftPhases &&
        starDriftVelocities &&
        starVerticalAmplitudes &&
        starVerticalWavelengths &&
        starTravel
      ) {
        const positions = distantStarsMesh.geometry.attributes.position.array as Float32Array;
        const movement = starTuningRef.current.drift;
        const margin = explorerStarSettings.drift.wrapMarginPixels;
        const span = width + margin * 2;
        for (let index = 0; index < starIntensities.length; index++) {
          starTravel[index] =
            (starTravel[index] + lastFrameDelta * starDriftVelocities[index] * movement) % span;
          const travel = starTravel[index];
          positions[index * 3] = ((starBasePositions[index * 3] + travel + margin) % span) - margin;
          positions[index * 3 + 1] =
            starBasePositions[index * 3 + 1] +
            starVerticalAmplitudes[index] *
              (Math.sin(
                (travel / starVerticalWavelengths[index]) * Math.PI * 2 + starDriftPhases[index],
              ) -
                Math.sin(starDriftPhases[index]));
        }
        distantStarsMesh.geometry.attributes.position.needsUpdate = true;
      }
    };

    const updateParticles = () => {
      if (!particlePositions || !particleIntensities || !particleMesh) return;
      const hasDepth = variantRef.current !== 'prism';
      for (let index = 0; index < particleSeeds.length; index++) {
        const seed = particleSeeds[index];
        const phase = (seed.phase + elapsed * seed.velocity) % 1;
        // The curve starts gently, then gathers speed as separate lanes converge.
        const progress = phase < MERGE_AT ? MERGE_AT * (phase / MERGE_AT) ** 1.12 : phase;
        const point = pathPoint(seed.lane, progress, width, height, variantRef.current, seed.depth);
        const convergence =
          smoothstep(MERGE_AT - 0.14, MERGE_AT - 0.015, progress) *
          (1 - smoothstep(MERGE_AT + 0.015, MERGE_AT + 0.12, progress));
        const afterMerge = hasDepth
          ? smoothstep(MERGE_AT - 0.01, MERGE_AT + 0.11, progress)
          : smoothstep(MERGE_AT, 0.91, progress);
        const fade = hasDepth
          ? 1 - afterMerge * 0.97
          : 1 - afterMerge * (seed.weight > 1 ? 0.8 : 0.96);
        particleIntensities[index] = seed.weight * (0.84 + convergence * 0.45) * fade;
        particlePositions[index * 3] = point.x;
        particlePositions[index * 3 + 1] = point.y;
        particlePositions[index * 3 + 2] = 1;
      }
      particleMesh.geometry.attributes.position.needsUpdate = true;
      particleMesh.geometry.attributes.aIntensity.needsUpdate = true;
    };

    const animate = (time: number) => {
      lastFrameDelta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      const hoverResponse =
        hoverTarget > hoverAmount ? HOVER_ACCELERATION_TIME : HOVER_DECELERATION_TIME;
      hoverAmount += (hoverTarget - hoverAmount) * (1 - Math.exp(-lastFrameDelta / hoverResponse));
      elapsed +=
        lastFrameDelta *
        settingsRef.current.speed *
        (1 + hoverAmount * (HOVER_SPEED_MULTIPLIER - 1));
      starElapsed += lastFrameDelta;
      lastTime = time;
      updateParticles();
      updateStars();
      renderer.render(scene, camera);
    };

    const updateLoop = () => {
      const shouldAnimate =
        visible &&
        document.visibilityState === 'visible' &&
        !reducedMotion &&
        (settingsRef.current.speed > 0 ||
          (variantRef.current === 'depth-pulse' &&
            (starTuningRef.current.drift > 0 || starTuningRef.current.twinkle > 0)));
      if (shouldAnimate && !frame) {
        const tick = (time: number) => {
          frame = window.requestAnimationFrame(tick);
          animate(time);
        };
        lastTime = 0;
        frame = window.requestAnimationFrame(tick);
      } else if (!shouldAnimate && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }
    };

    const resize = () => {
      width = Math.max(mount.clientWidth, 1);
      height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      buildGeometry();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    const handleSettingsChange = () => {
      buildGeometry();
      updateLoop();
    };
    const handleDriftChange = () => {
      updateLoop();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (
        !interactiveRef.current ||
        reducedMotion ||
        !hoverQuery.matches ||
        event.pointerType === 'touch'
      ) {
        hoverTarget = 0;
        return;
      }
      if (event.target instanceof Element && event.target.closest('button, a')) {
        hoverTarget = 0;
        return;
      }
      const bounds = mount.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      if (x < 0 || x > width || y < 0 || y > height) {
        hoverTarget = 0;
        return;
      }

      const lineCount = Math.max(settingsRef.current.lines, 1);
      const progress = Math.min(x / width, MERGE_AT);
      let distance = Number.POSITIVE_INFINITY;
      for (let lane = 0; lane < lineCount; lane++) {
        const lanePosition = lineCount === 1 ? 0.5 : lane / (lineCount - 1);
        const point = pathPoint(
          lanePosition,
          progress,
          width,
          height,
          variantRef.current,
          lane % 3,
        );
        distance = Math.min(distance, Math.abs(y - point.y));
        if (distance <= HOVER_HIT_RADIUS) break;
      }
      hoverTarget = distance <= HOVER_HIT_RADIUS ? 1 : 0;
    };
    const resetHover = () => {
      hoverTarget = 0;
    };
    const handleInteractivityChange = () => {
      hoverTarget = 0;
      hoverAmount = 0;
    };
    mount.addEventListener('flow-settings-change', handleSettingsChange);
    mount.addEventListener('flow-drift-change', handleDriftChange);
    mount.addEventListener('flow-interactivity-change', handleInteractivityChange);
    const hero = mount.closest<HTMLElement>('.landing-mockup');
    hero?.addEventListener('pointermove', handlePointerMove);
    hero?.addEventListener('pointerleave', resetHover);
    window.addEventListener('blur', resetHover);
    const intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      updateLoop();
    });
    intersectionObserver.observe(mount);
    document.addEventListener('visibilitychange', updateLoop);
    motionQuery.addEventListener('change', syncMotion);
    resize();
    syncMotion();
    setReady(true);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mount.removeEventListener('flow-settings-change', handleSettingsChange);
      mount.removeEventListener('flow-drift-change', handleDriftChange);
      mount.removeEventListener('flow-interactivity-change', handleInteractivityChange);
      hero?.removeEventListener('pointermove', handlePointerMove);
      hero?.removeEventListener('pointerleave', resetHover);
      window.removeEventListener('blur', resetHover);
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', updateLoop);
      motionQuery.removeEventListener('change', syncMotion);
      clearGeometry();
      lineMaterial.dispose();
      spineMaterial.dispose();
      foregroundMaterial.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    const previous = appliedRef.current;
    if (
      previous.settings === settings &&
      previous.starTuning === starTuning &&
      previous.variant === variant
    )
      return;
    const driftOnly =
      previous.settings === settings &&
      previous.variant === variant &&
      previous.starTuning.stars === starTuning.stars &&
      previous.starTuning.brightness === starTuning.brightness &&
      previous.starTuning.size === starTuning.size &&
      previous.starTuning.twinkle === starTuning.twinkle &&
      previous.starTuning.crossStars === starTuning.crossStars &&
      previous.starTuning.warmth === starTuning.warmth;
    appliedRef.current = { settings, starTuning, variant };
    settingsRef.current = settings;
    starTuningRef.current = starTuning;
    variantRef.current = variant;
    mountRef.current?.dispatchEvent(
      new Event(driftOnly ? 'flow-drift-change' : 'flow-settings-change'),
    );
  }, [settings, starTuning, variant]);

  useEffect(() => {
    if (interactiveRef.current === interactive) return;
    interactiveRef.current = interactive;
    mountRef.current?.dispatchEvent(new Event('flow-interactivity-change'));
  }, [interactive]);

  return (
    <div className="landing-mockup__flow-field" aria-hidden="true">
      {!ready && <img src={particleFieldSrc} alt="" />}
      <div ref={mountRef} className="landing-mockup__flow-canvas" />
    </div>
  );
};
