import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type GlassFinish = 'smoke' | 'pearl' | 'navy';
export type StackAngle = 'perspective' | 'top' | 'front' | 'side' | 'bottom';

/** All finishes use native Standard transmission; Smoke keeps the approved study. */
export const createGlassMaterial = (
  blue: THREE.Color,
  edge = false,
  finish: GlassFinish = 'smoke',
) => {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: edge ? 0.025 : 0.11,
    transmission: 1,
    thickness: 0.2,
    ior: 1.47,
    attenuationColor: blue.clone().lerp(new THREE.Color(0xffffff), 0.92),
    attenuationDistance: 2.8,
    envMapIntensity: edge ? 0.7 : 0.38,
    clearcoat: edge ? 0.5 : 0.1,
    clearcoatRoughness: 0.04,
    dispersion: 0.035,
  });
  if (finish === 'pearl') {
    material.roughness = edge ? 0.08 : 0.32;
    material.transmission = 0.68;
    material.attenuationColor.set(0xffffff);
    material.envMapIntensity = 0.55;
  } else if (finish === 'navy') {
    // Tint derives from the existing blue, rather than adding a brand colour token.
    material.color.copy(blue).multiplyScalar(0.055);
    material.roughness = edge ? 0.04 : 0.16;
    material.transmission = 0.4;
    material.attenuationColor.copy(blue);
    material.attenuationDistance = 0.8;
    material.envMapIntensity = edge ? 0.7 : 0.4;
  }
  return material;
};

export const setupGlassLighting = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  background: THREE.Color,
  blue: THREE.Color,
) => {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.025);
  scene.environment = environment.texture;
  generator.dispose();
  room.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, background, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(-2, 6, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(blue, 0.8);
  fill.position.set(4, 2, -3);
  scene.add(fill);
  return environment;
};
