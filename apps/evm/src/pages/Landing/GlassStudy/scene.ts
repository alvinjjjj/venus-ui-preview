import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createGlassMaterial, setupGlassLighting } from '../VenusStack/glassMaterial';

interface StudyOptions {
  frost: boolean;
  joined: boolean;
  boxed: boolean;
  layered: boolean;
}

// Scene dimensions are model units, independent of the site's layout tokens.
const PLATE_SIZE = 3.2;
const CASE_SIZE = 3.4;
const CASE_HEIGHT = 0.66;
const roundedShape = (size: number, r = 0.23) => {
  const shape = new THREE.Shape();
  const w = size;
  const d = size;
  const x = -w / 2;
  const y = -d / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + d - r);
  shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  shape.lineTo(x + r, y + d);
  shape.quadraticCurveTo(x, y + d, x, y + d - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
};

const roundedPlate = (size = PLATE_SIZE, depth = 0.18) => {
  const shape = roundedShape(size);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 5,
    curveSegments: 24,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
};

/** A continuous hollow sleeve hides the individual plate seams, as in frame 0470. */
const caseSleeve = () => {
  const shape = roundedShape(CASE_SIZE);
  shape.holes.push(new THREE.Path(roundedShape(PLATE_SIZE + 0.08, 0.2).getPoints(24)));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CASE_HEIGHT,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -CASE_HEIGHT, 0);
  return geometry;
};

const lettering = (text: string, font: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = `600 220px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(10,18,30,0.65)';
    ctx.lineWidth = 3;
    ctx.strokeText(text, 1024, 256, 1740);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 1024, 256, 1740);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const material = new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.675), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
};

/** Back-to-front scene captures make one glass layer visible through the other. */
export const createGlassStudy = (mount: HTMLElement, names: string[], reduced: boolean) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const textScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reduced;
  controls.enablePan = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.25;
  controls.minDistance = 6;
  controls.maxDistance = 15;
  const sample = document.createElement('canvas').getContext('2d');
  const token = (name: string) => {
    const color = new THREE.Color();
    if (sample) {
      sample.fillStyle = getComputedStyle(mount).getPropertyValue(name).trim();
      sample.fillRect(0, 0, 1, 1);
      const [r, g, b] = sample.getImageData(0, 0, 1, 1).data;
      color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }
    return color;
  };
  const background = token('--color-background-active');
  const blue = token('--color-blue');
  scene.background = background;
  const environment = setupGlassLighting(renderer, scene, background, blue);

  const targets = [0, 1, 2].map(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        samples: 2,
      }),
  );
  const bufferSize = new THREE.Vector2();
  const captures = targets.map(target => ({ value: target.texture }));
  let options: StudyOptions = { frost: true, joined: false, boxed: false, layered: true };
  const material = (index: number, edge: boolean) => {
    const m = createGlassMaterial(blue, edge);
    m.onBeforeCompile = shader => {
      if (!options.layered) return;
      shader.uniforms.studyBuffer = captures[index];
      shader.uniforms.studyBufferSize = { value: bufferSize };
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_pars_fragment>',
        THREE.ShaderChunk.transmission_pars_fragment
          .replaceAll('transmissionSamplerMap', 'studyBuffer')
          .replaceAll('transmissionSamplerSize', 'studyBufferSize'),
      );
    };
    m.customProgramCacheKey = () =>
      options.layered ? 'venus-layered-glass' : 'venus-standard-glass';
    return m;
  };
  const geometry = roundedPlate();
  const materials = [0, 1].map(i => [material(i, false), material(i, true)]);
  const plates = materials.map(m => new THREE.Mesh(geometry, m));
  plates[0].position.y = 0;
  plates[1].position.y = 1.05;
  scene.add(...plates);
  const caseMaterials = [material(2, false), material(2, true)];
  const lidGeometry = roundedPlate(CASE_SIZE, 0.12);
  const sleeveGeometry = caseSleeve();
  const lid = new THREE.Mesh(lidGeometry, caseMaterials);
  const sleeve = new THREE.Mesh(sleeveGeometry, caseMaterials);
  const enclosure = new THREE.Group();
  enclosure.add(lid, sleeve);
  enclosure.visible = false;
  scene.add(enclosure);
  const font = getComputedStyle(mount).fontFamily;
  const lowerText = lettering(names[0], font);
  const upperText = lettering(names[1], font);
  lowerText.position.y = 0.212;
  lowerText.position.z = 0.55;
  upperText.position.y = 1.262;
  upperText.position.z = -0.35;
  upperText.material.depthTest = false;
  scene.add(lowerText);
  textScene.add(upperText);
  const lidText = lettering('VENUS', font);
  lidText.material.depthTest = false;
  lidText.visible = false;
  textScene.add(lidText);

  // A quiet Venus-blue insert provides a visible subject to refract below the stack.
  const insertGeometry = new THREE.BoxGeometry(1.9, 0.035, 0.055);
  const insertMaterial = new THREE.MeshBasicMaterial({ color: blue });
  const insert = new THREE.Mesh(insertGeometry, insertMaterial);
  insert.position.set(-0.55, -0.09, -0.95);
  insert.scale.x = 0.6;
  scene.add(insert);
  const groundGeometry = new THREE.PlaneGeometry(30, 30);
  const groundMaterial = new THREE.MeshBasicMaterial({ color: background });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.16;
  scene.add(ground);
  // Static contact shadow grounds the study without a costly realtime shadow pass.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const shadowCtx = shadowCanvas.getContext('2d');
  if (shadowCtx) {
    const g = shadowCtx.createRadialGradient(128, 128, 0, 128, 128, 125);
    g.addColorStop(0, 'rgba(0,0,0,0.7)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    shadowCtx.fillStyle = g;
    shadowCtx.fillRect(0, 0, 256, 256);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  });
  const shadowGeometry = new THREE.PlaneGeometry(5, 4);
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.15;
  scene.add(shadow);

  let frame = 0;
  let visible = false;
  let separation = 1.05;
  let closure = 0;
  let lastTime = 0;
  const render = (time: number) => {
    frame = 0;
    if (!visible || document.visibilityState !== 'visible') return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = time;
    const ease = reduced ? 1 : 1 - Math.exp(-9 * dt);
    // Closing compacts the plates first; reopening lifts the case before splitting.
    const desired = options.joined || options.boxed || closure > 0.02 ? 0.24 : 1.05;
    separation += (desired - separation) * ease;
    const desiredClosure = options.boxed && separation < 0.255 ? 1 : 0;
    closure += (desiredClosure - closure) * ease;
    if (Math.abs(desiredClosure - closure) < 0.001) closure = desiredClosure;
    plates[1].position.y = separation;
    upperText.position.y = separation + 0.212;
    enclosure.visible = closure > 0.001;
    enclosure.position.y = CASE_HEIGHT + (1 - closure) * 1.6;
    const printedOpacity = 1 - THREE.MathUtils.smoothstep(closure, 0.3, 0.85);
    lowerText.material.opacity = printedOpacity;
    upperText.material.opacity = printedOpacity;
    lidText.visible = enclosure.visible;
    lidText.position.y = enclosure.position.y + 0.15;
    lidText.material.opacity = THREE.MathUtils.smoothstep(closure, 0.15, 0.75);
    const moving = controls.update();
    if (options.layered) {
      plates[0].visible = false;
      plates[1].visible = false;
      lowerText.visible = false;
      enclosure.visible = false;
      renderer.setRenderTarget(targets[0]);
      renderer.render(scene, camera);
      plates[0].visible = true;
      lowerText.visible = true;
      renderer.setRenderTarget(targets[1]);
      renderer.render(scene, camera);
      plates[1].visible = true;
      if (closure > 0.001) {
        // Include the upper printed surface in the case's refraction capture.
        textScene.remove(upperText);
        scene.add(upperText);
        renderer.setRenderTarget(targets[2]);
        renderer.render(scene, camera);
        scene.remove(upperText);
        textScene.add(upperText);
        enclosure.visible = true;
      }
    }
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    // Surface printing stays sharp, rather than being fed back through refraction.
    renderer.autoClear = false;
    renderer.render(textScene, camera);
    renderer.autoClear = true;
    if (
      moving ||
      Math.abs(desired - separation) > 0.001 ||
      Math.abs(desiredClosure - closure) > 0.001 ||
      (options.boxed && closure < 1)
    )
      requestRender();
  };
  const requestRender = () => {
    if (!frame && visible && document.visibilityState === 'visible')
      frame = requestAnimationFrame(render);
  };
  const reset = () => {
    camera.position.set(5.5, 5.3, 7.2);
    controls.target.set(0, 0.45, 0);
    controls.update();
    requestRender();
  };
  const resize = () => {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.zoom = Math.min(1.5, Math.max(0.6, camera.aspect * 1.12));
    camera.updateProjectionMatrix();
    const scale = Math.min(renderer.getPixelRatio(), width < 760 ? 1 : 1.5);
    bufferSize.set(Math.round(width * scale), Math.round(height * scale));
    targets.forEach(target => target.setSize(bufferSize.x, bufferSize.y));
    requestRender();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    if (visible) requestRender();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(mount);
  const visibility = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    requestRender();
  };
  document.addEventListener('visibilitychange', visibility);
  controls.addEventListener('change', requestRender);
  reset();
  resize();
  return {
    reset,
    configure: (next: StudyOptions) => {
      const changed = options.layered !== next.layered;
      options = next;
      [...materials, caseMaterials].forEach(group =>
        group.forEach((m, index) => {
          m.roughness = index ? 0.025 : next.frost ? 0.11 : 0.025;
          if (changed) m.needsUpdate = true;
        }),
      );
      requestRender();
    },
    dispose: () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      controls.dispose();
      targets.forEach(target => target.dispose());
      environment.dispose();
      geometry.dispose();
      lidGeometry.dispose();
      sleeveGeometry.dispose();
      [...materials.flat(), ...caseMaterials].forEach(m => m.dispose());
      [lowerText, upperText, lidText].forEach(text => {
        text.geometry.dispose();
        text.material.map?.dispose();
        text.material.dispose();
      });
      insertGeometry.dispose();
      insertMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      shadowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};
