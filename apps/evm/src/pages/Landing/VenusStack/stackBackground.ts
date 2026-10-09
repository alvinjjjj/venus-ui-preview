import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import type { StackStudio } from './stackView';

// The installed addon exposes this shader at runtime; its bundled typings omit the static.
const reflectorShader = (
  Reflector as typeof Reflector & {
    ReflectorShader: {
      uniforms: Record<string, THREE.IUniform>;
      vertexShader: string;
      fragmentShader: string;
    };
  }
).ReflectorShader;

/** Neutral seamless stage. These values describe physical scene lighting, not UI tokens. */
export const createStackBackground = (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  base: THREE.Color,
  light: boolean,
) => {
  const grey = (base.r + base.g + base.b) / 3;
  const studio = new THREE.Color().setRGB(grey, grey, grey);
  if (light) studio.lerp(new THREE.Color(0xffffff), 0.92);
  scene.background = studio;
  scene.fog = new THREE.Fog(studio, 16, 38);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const key = scene.children.find(
    (item): item is THREE.DirectionalLight => item instanceof THREE.DirectionalLight,
  );
  if (key) {
    key.position.set(-3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -5,
      right: 5,
      top: 5,
      bottom: -5,
      near: 0.1,
      far: 24,
    });
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 22;
    key.shadow.blurSamples = 12;
  }

  const geometry = new THREE.PlaneGeometry(100, 100);
  // A low-resolution planar reflection is deliberately subdued and softened.
  // A broad neutral light pool gives depth without a visible horizon or coloured glow.
  const shader = {
    ...reflectorShader,
    uniforms: {
      ...reflectorShader.uniforms,
      strength: { value: 0.06 },
      isLight: { value: light ? 1 : 0 },
    },
    vertexShader: reflectorShader.vertexShader
      .replace('varying vec4 vUv;', 'varying vec4 vUv; varying vec3 stagePosition;')
      .replace(
        'vUv = textureMatrix * vec4( position, 1.0 );',
        'vUv = textureMatrix * vec4( position, 1.0 ); stagePosition = (modelMatrix * vec4(position, 1.0)).xyz;',
      ),
    fragmentShader: reflectorShader.fragmentShader
      .replace(
        'uniform vec3 color;',
        'uniform vec3 color; uniform float strength; uniform float isLight; varying vec3 stagePosition;',
      )
      .replace(
        'gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',
        `
        vec2 uv = vUv.xy / vUv.w;
        vec3 reflected = texture2D(tDiffuse, uv).rgb * 0.4;
        reflected += texture2D(tDiffuse, uv + vec2(0.002, 0.0)).rgb * 0.15;
        reflected += texture2D(tDiffuse, uv - vec2(0.002, 0.0)).rgb * 0.15;
        reflected += texture2D(tDiffuse, uv + vec2(0.0, 0.002)).rgb * 0.15;
        reflected += texture2D(tDiffuse, uv - vec2(0.0, 0.002)).rgb * 0.15;
        float pool = exp(-dot(stagePosition.xz, stagePosition.xz) / 34.0);
        vec3 ground = color + vec3(pool * mix(0.012, 0.025, isLight));
        gl_FragColor = vec4(mix(ground, min(reflected, vec3(1.0)), strength), 1.0);
      `,
      ),
  };
  const floor = new Reflector(geometry, {
    textureWidth: 512,
    textureHeight: 512,
    color: studio,
    shader,
  });
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.405;
  scene.add(floor);

  const shadowMaterial = new THREE.ShadowMaterial({
    color: 0x000000,
    opacity: 0.22,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(geometry, shadowMaterial);
  shadow.rotation.copy(floor.rotation);
  shadow.position.y = floor.position.y + 0.002;
  shadow.receiveShadow = true;
  scene.add(shadow);
  const floorMaterial = floor.material as THREE.ShaderMaterial;
  // Match the scene background at the horizon; only the product uses exposure tonemapping.
  floorMaterial.toneMapped = false;
  const renderReflection = floor.onBeforeRender;
  floor.onBeforeRender = function (...args) {
    if (floorMaterial.uniforms.strength.value > 0) renderReflection.apply(this, args);
  };

  return {
    update: (settings: StackStudio, cameraY: number) => {
      renderer.toneMappingExposure = settings.exposure;
      shadowMaterial.opacity = settings.shadow * (light ? 0.7 : 1);
      floorMaterial.uniforms.strength.value = settings.reflection;
      // Inspection may orbit underneath the stage; never let the floor obscure the model.
      floor.visible = shadow.visible = cameraY > floor.position.y;
    },
    dispose: () => {
      geometry.dispose();
      floor.dispose();
      shadowMaterial.dispose();
      key?.shadow.map?.dispose();
      key?.shadow.mapPass?.dispose();
    },
  };
};
