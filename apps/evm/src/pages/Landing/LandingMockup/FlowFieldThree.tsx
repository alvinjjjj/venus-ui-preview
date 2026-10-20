import { PAGE_CONTAINER_ID } from 'constants/layout';
import { isExplorerMode, isNewDesignMode } from 'demo/GlassVersions/store';
import { useLandingDesignMode } from '../designContext';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import particleFieldSrc from './assets/particle-field.png';
import colorVenusMark from './assets/venus-mark-color.svg';
import whiteVenusMark from './assets/venus-mark-white.svg';
import explorerStars from './explorer-stars.json';
import { type ExplorerStarTuning, type FlowSettings, useLandingMotion } from './motionStore';
import { getFlowTiming } from './motionTimeline';
import { orbitBrandMarks } from './orbitBrands';
import { orbitProducts } from './orbitProducts';
import {
  getOrbitPose,
  getOrbitRadius,
  getOrbitSatellites,
  orbitCoreRadius,
  orbitEase,
  projectOrbit,
} from './orbitScene';

export type FlowVariant = 'prism' | 'depth-pulse' | 'milky-way';

const MERGE_AT = 0.64;
const HORIZON = 0.51;
// Light theme ("paper and ink"): lines and particles are drawn as Venus-blue ink on the
// pale page instead of additive light, which disappears on white.
const LIGHT_PAPER = new THREE.Color('#f7f9fc');
const LIGHT_INK = new THREE.Color('#0085e3');
// Track lines stay neutral slate; colour is reserved for what moves (blue comets) and for
// the destination (the blue spine and haze), as in animated-beam style references.
const LIGHT_TRACK = new THREE.Color('#5b6b82');
// Light comets: fewer than the dark theme's sparks, so the flow reads as direction, not dust.
const LIGHT_PARTICLE_SHARE = 0.55;
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
  connectedFlow?: boolean;
  transitionProgress?: number;
}> = ({
  settings,
  starTuning,
  variant,
  interactive,
  connectedFlow = false,
  transitionProgress,
}) => {
  const orbitSettings = useLandingMotion(state => state.orbit);
  const orbitRef = useRef(orbitSettings);
  const mountRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  const starTuningRef = useRef(starTuning);
  const variantRef = useRef(variant);
  const interactiveRef = useRef(interactive);
  // Explorer-only sphere material and palette. HorizontalFlow is keyed by mode,
  // so the scene is rebuilt when the preview mode changes.
  const mode = useLandingDesignMode();
  const explorer = isExplorerMode(mode);
  const explorerRef = useRef(explorer);
  explorerRef.current = explorer;
  // New: face-on orbit with a smaller core; the spheres turn together as one ring
  // (same pace, spacing kept) and pause while one is hovered to show its APY.
  const calm = isNewDesignMode(mode);
  const calmRef = useRef(calm);
  calmRef.current = calm;
  // The landing is keyed by theme, so the scene is rebuilt when light/dark changes.
  const light = useLiquidityLightPreview();
  const lightRef = useRef(light);
  lightRef.current = light;
  const connectedRef = useRef(connectedFlow);
  const transitionRef = useRef(transitionProgress);
  connectedRef.current = connectedFlow;
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
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 2000);
    camera.position.z = 1000;
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
      depthTest: true,
    });

    // Light comets: a short streak per particle, rotated to its direction of travel, fading
    // from a transparent tail to a solid head.
    const cometMaterial = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: pixelRatio }, uColor: { value: LIGHT_INK.clone() } },
      vertexShader: `
        attribute float aSize;
        attribute float aIntensity;
        attribute float aAngle;
        uniform float uPixelRatio;
        varying float vIntensity;
        varying float vAngle;

        void main() {
          vIntensity = aIntensity;
          vAngle = aAngle;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vIntensity;
        varying float vAngle;

        void main() {
          vec2 point = gl_PointCoord - vec2(0.5);
          point.y = -point.y;
          float c = cos(vAngle);
          float s = sin(vAngle);
          vec2 local = vec2(c * point.x + s * point.y, -s * point.x + c * point.y);
          float along = smoothstep(-0.48, 0.42, local.x) * (1.0 - smoothstep(0.42, 0.5, local.x));
          float across = 1.0 - smoothstep(0.018, 0.05, abs(local.y));
          float head = 1.0 - smoothstep(0.0, 0.06, length(local - vec2(0.42, 0.0)));
          float alpha = max(along * across, head) * vIntensity;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
    });

    if (lightRef.current) {
      lineMaterial.opacity = 1;
      foregroundMaterial.blending = THREE.NormalBlending;
      foregroundMaterial.opacity = 0.1;
      particleMaterial.blending = THREE.NormalBlending;
    }

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
    let orbitElapsed = 0;
    let centerSpin = 0;
    // New: shared rotation (radians) applied to every sphere, so they move as one ring.
    let calmOrbit = 0;
    // New: hexagon order, clockwise from the top. Same-family products sit opposite each
    // other (Hub/Vault, Prime/Trade, Spoke/Flux) so colours stay balanced.
    const CALM_HEX_ORDER = ['USDC', 'BTC', 'USDT', 'BNB', 'U', 'ETH'];
    const CALM_HEX_START = -Math.PI / 2;
    const CALM_RING = 0.75;
    // One size for every product sphere (about the old average).
    const CALM_SATELLITE_SCALE = 0.38;
    // New: four spheres. Explorer: six (adds BTC and ETH), 30% smaller.
    const orbitSatellites = getOrbitSatellites(explorerRef.current);
    const satelliteOrbits = new Float64Array(orbitSatellites.length);
    const satelliteSpins = new Float64Array(orbitSatellites.length);
    let starElapsed = 0;
    let frame = 0;
    let reducedMotion = false;
    let hoverTarget = 0;
    let hoverAmount = 0;
    let handoff = 0;
    let orbitCenter = { x: 0, y: 0 };
    let activeAsset: string | null = null;
    let targetOrigin = { x: 0, y: 0 };
    let assetTargets: (HTMLButtonElement | null)[] = [];

    let galaxyMesh: THREE.Points | undefined;
    let galaxyLines: THREE.LineSegments | undefined;
    const galaxyLineMaterial = spineMaterial.clone();
    galaxyLineMaterial.opacity = 0;
    galaxyLineMaterial.depthTest = true;
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 48);
    const theme = getComputedStyle(mount);
    const tokenColor = (name: string) => {
      const value = theme.getPropertyValue(name).trim();
      const channels = value.startsWith('rgb') ? value.match(/[\d.]+/g)?.map(Number) : undefined;
      return channels && channels.length >= 3
        ? new THREE.Color().setRGB(
            channels[0] / 255,
            channels[1] / 255,
            channels[2] / 255,
            THREE.SRGBColorSpace,
          )
        : new THREE.Color(value);
    };
    const blue = tokenColor('--color-blue');
    const green = tokenColor('--color-green');
    const newPalette = {
      smoke: tokenColor('--color-light-grey').lerp(tokenColor('--color-background-active'), 0.6),
      green,
      charcoal: tokenColor('--color-background').lerp(tokenColor('--color-light-grey'), 0.08),
      blue,
    };
    // Explorer: saturated brand hues, as in Alvin's mock-up. USDC blue, BTC orange,
    // U pearl (its mark is gold), USDT Tether green, BNB amber, ETH violet.
    const sphereColors: Record<(typeof orbitSatellites)[number]['color'], THREE.Color> = {
      ...newPalette,
      blue: explorerRef.current ? new THREE.Color('#3d8bff') : blue,
      green: explorerRef.current ? new THREE.Color('#1fbf8f') : green,
      pearl: new THREE.Color('#e8e1cf'),
      amber: new THREE.Color('#f5b82e'),
      orange: new THREE.Color('#ff8a1c'),
      violet: new THREE.Color('#7457ff'),
    };
    // New: spheres are coloured by product family, matching the nav menu tiles.
    // Earn (Liquidity Hub, Vaults) is Venus blue; Borrow (Spoke, Flux) is graphite;
    // Prime is a premium gold and Trade is Venus green.
    const CALM_PRODUCT_COLORS: Record<string, THREE.Color> = {
      USDC: new THREE.Color('#2a9df4'),
      BNB: new THREE.Color('#2a9df4'),
      USDT: new THREE.Color('#3a424d'),
      ETH: new THREE.Color('#3a424d'),
      BTC: new THREE.Color('#e3b04b'),
      U: new THREE.Color('#1fbf8f'),
    };
    const satelliteColor = (item: (typeof orbitSatellites)[number]) =>
      (calmRef.current && CALM_PRODUCT_COLORS[item.symbol]) || sphereColors[item.color];
    const makeSphere = (color: THREE.Color, highlight = 0.48) => {
      const material = new THREE.ShaderMaterial({
        // The screen-space camera flips Y, reversing projected winding.
        side: THREE.BackSide,
        uniforms: {
          uColor: { value: color },
          uHighlight: { value: highlight },
          uLight: { value: new THREE.Vector3(-0.45, -0.6, 0.9) },
          uFinish: { value: 0 },
          uFrostGlass: { value: explorerRef.current ? 1 : 0 },
        },
        vertexShader: `
          varying vec3 vSphereNormal;
          varying vec3 vSurfaceNormal;
          void main() {
            vSphereNormal = normalize(normalMatrix * normal);
            vSurfaceNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uHighlight;
          uniform vec3 uLight;
          uniform float uFinish;
          uniform float uFrostGlass;
          varying vec3 vSphereNormal;
          varying vec3 vSurfaceNormal;
          float hash12(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }
          // Explorer: a luminous, satin-frosted planet in its brand hue (Alvin's mock-up).
          // Lit top-left with a soft falloff, limb-darkened edges, a thin bright rim on
          // the lit side, a broad sheen, fine sand grain, and slow cloud bands fixed to
          // the surface so the self-rotation reads.
          vec3 frostedGlass(vec3 normal, vec3 light) {
            float facing = clamp(normal.z, 0.0, 1.0);
            vec3 surface = normalize(vSurfaceNormal);
            float wrap = clamp((dot(normal, light) + 0.3) / 1.3, 0.0, 1.0);
            // Keep the hue saturated: brighten by gain, not by mixing toward white.
            vec3 lit = uColor * 1.12 + vec3(0.02);
            vec3 shade = uColor * 0.3;
            vec3 color = mix(shade, lit, smoothstep(0.0, 1.0, wrap));
            // bands follow longitude, so they turn with the sphere's spin
            float longitude = atan(surface.z, surface.x);
            float bands = sin(surface.y * 5.0 + sin(longitude * 2.0) * 0.9) * 0.5 + 0.5;
            float swirl = sin(longitude * 3.0 + surface.y * 4.0) * 0.5 + 0.5;
            color *= 0.9 + (bands * 0.7 + swirl * 0.3) * 0.2;
            color *= mix(0.6, 1.0, pow(facing, 0.45));
            vec3 halfLight = normalize(light + vec3(0.0, 0.0, 1.0));
            float sheen = pow(max(dot(normal, halfLight), 0.0), 9.0);
            color += mix(uColor, vec3(1.0), 0.5) * sheen * 0.16 * uHighlight * 2.0;
            float rim = pow(1.0 - facing, 3.0) * clamp(dot(normal, light) + 0.4, 0.0, 1.0);
            color += mix(uColor, vec3(1.0), 0.45) * rim * 0.6;
            float sand = hash12(floor(gl_FragCoord.xy)) - 0.5;
            color *= 1.0 + sand * 0.05;
            return color;
          }
          void main() {
            vec3 normal = normalize(vSphereNormal);
            if (uFrostGlass > 0.5) {
              gl_FragColor = vec4(frostedGlass(normal, normalize(uLight)), 1.0);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
              return;
            }
            vec3 light = normalize(uLight);
            float diffuse = pow(max(dot(normal, light), 0.0), 1.15);
            vec3 halfLight = normalize(light + vec3(0.0, 0.0, 1.0));
            float polished = step(1.5, uFinish);
            float frost = step(0.5, uFinish) * (1.0 - polished);
            float specular = pow(max(dot(normal, halfLight), 0.0), mix(48.0, 110.0, polished));
            float softReflection = pow(max(dot(normal, halfLight), 0.0), mix(10.0, 4.0, frost));
            vec3 surface = normalize(vSurfaceNormal);
            float grain = fract(sin(dot(surface.xy, vec2(127.1, 311.7))) * 43758.5453) - 0.5;
            // Broad, low-contrast surface variation turns with the mesh.
            // Avoid repeating latitude bands that look painted onto Frost.
            float haze = sin(dot(surface, vec3(2.1, 1.3, 0.8))) *
              sin(dot(surface, vec3(-0.7, 1.9, 1.6)) + 1.2);
            float edge = pow(1.0 - max(normal.z, 0.0), 3.0);
            vec3 color = uColor * (0.07 + diffuse * 0.86);
            color += vec3(0.9) * (specular * mix(1.0, 0.12, frost) * mix(1.0, 1.6, polished) + softReflection * mix(0.24, 0.4, frost)) * uHighlight;
            color *= 1.0 + grain * frost * 0.018;
            color *= 1.0 + haze * mix(0.015, 0.035, frost);
            color += mix(uColor, vec3(0.4), 0.18) * edge * 0.10;
            gl_FragColor = vec4(color, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      });
      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    };
    // Explorer: a vivid Venus-blue planet with the same lighting as the satellites.
    // New: a white planet carrying the full-colour Venus mark.
    const centerSphere = makeSphere(
      calmRef.current
        ? new THREE.Color('#eef2f8')
        : explorerRef.current
          ? new THREE.Color('#1f6fe6')
          : tokenColor('--color-blue').lerp(tokenColor('--color-background-active'), 0.78),
      explorerRef.current ? 0.4 : 0.28,
    );
    const satellites = orbitSatellites.map(item =>
      makeSphere(
        satelliteColor(item),
        item.color === 'charcoal' && !explorerRef.current ? 0.18 : 0.48,
      ),
    );
    const logoGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
    const textureLoader = new THREE.TextureLoader();
    const makeMark = (src: string, span = 1.5, aspect = 1) => {
      const texture = textureLoader.load(src, () => {
        if (mount.isConnected) renderer.render(scene, camera);
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: texture },
          // Explorer engraves the idle mark in a darker tone of its sphere.
          uTint: { value: new THREE.Color(1, 1, 1) },
          uTintMix: { value: 0 },
          uOpacity: { value: 1 },
          uSpan: { value: new THREE.Vector2(span, span * aspect) },
          uLight: { value: new THREE.Vector3(-0.45, -0.6, 0.9) },
        },
        vertexShader: `
          uniform vec2 uSpan;
          varying vec2 vUv;
          varying vec3 vMarkNormal;
          void main() {
            vUv = uv;
            vec2 angle = position.xy * uSpan;
            vec3 surface = vec3(sin(angle.x) * cos(angle.y), -sin(angle.y), cos(angle.x) * cos(angle.y));
            vMarkNormal = surface;
            vec3 curved = vec3(surface.x / uSpan.x, -surface.y / uSpan.y, surface.z + 0.008);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(curved, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uMap;
          uniform vec3 uLight;
          uniform vec3 uTint;
          uniform float uTintMix;
          uniform float uOpacity;
          varying vec2 vUv;
          varying vec3 vMarkNormal;
          void main() {
            vec4 mark = texture2D(uMap, vUv);
            if (mark.a < 0.01) discard;
            float shade = 0.70 + 0.30 * max(dot(normalize(vMarkNormal), normalize(uLight)), 0.0);
            vec3 rgb = mix(mark.rgb * shade, uTint * shade, uTintMix);
            gl_FragColor = vec4(rgb, mark.a * uOpacity);
            #include <colorspace_fragment>
          }
        `,
        toneMapped: false,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(logoGeometry, material);
      mesh.visible = false;
      scene.add(mesh);
      return { texture, material, mesh };
    };
    // Reuse brand paths at high intrinsic resolution, never a magnified 24px map.
    // The mark is curved onto the sphere using its span, so the span and the mesh
    // scale must be the same number; a smaller scale with the old span sank the mark
    // under the surface. Explorer uses a smaller mark so the sphere reads around it.
    const venusLogoScale = explorerRef.current ? 0.82 : 1.05;
    const {
      texture: logoTexture,
      material: logoMaterial,
      mesh: logoMesh,
    } = makeMark(calmRef.current ? colorVenusMark : whiteVenusMark, venusLogoScale, 34 / 38);
    // New shows products on the spheres; the other modes keep the token marks. Product
    // glyphs share tight square viewBoxes, so one scale gives every sphere the same icon size.
    const PRODUCT_MARK_SCALE = 1.05;
    const satelliteMarks = orbitSatellites.map(item =>
      calmRef.current
        ? makeMark(orbitProducts[item.symbol].mark, PRODUCT_MARK_SCALE)
        : makeMark(orbitBrandMarks[item.symbol], item.markScale),
    );
    // Explorer: a soft halo in each sphere's hue. It sits behind the sphere, so the
    // depth test hides it inside the disc and only the outer glow shows.
    const glowGeometry = new THREE.PlaneGeometry(1, 1);
    const makeGlow = (color: THREE.Color) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: color.clone() },
          uStrength: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uStrength;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float glow = pow(1.0 - smoothstep(0.42, 1.0, d), 1.6) * uStrength;
            // Premultiplied: alpha follows the glow, so the square's corners stay clear.
            gl_FragColor = vec4(uColor * glow, glow);
          }
        `,
        transparent: true,
        depthWrite: false,
        // The canvas is transparent over the page's starfield. AdditiveBlending also
        // added to the canvas alpha and painted each square opaque black; this adds
        // light to the colour while alpha only grows with the glow itself.
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
        toneMapped: false,
        // The screen-space camera flips Y, so the plane's front faces away from it.
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(glowGeometry, material);
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    };
    const satelliteGlows = explorerRef.current
      ? orbitSatellites.map(item => makeGlow(satelliteColor(item)))
      : [];
    // New keeps the white Venus Core planet clean: no blue halo behind it.
    const centerGlow =
      explorerRef.current && !calmRef.current ? makeGlow(new THREE.Color('#2f80ff')) : null;
    const engraveTints = orbitSatellites.map(item =>
      satelliteColor(item).clone().multiplyScalar(0.55),
    );

    const panAmount = () =>
      smoothstep(0, getFlowTiming(orbitRef.current).arrival, transitionRef.current ?? 0);
    const beamState = () => {
      const p = transitionRef.current ?? 0;
      const timing = getFlowTiming(orbitRef.current);
      const arrival = smoothstep(0, timing.arrival, p);
      const tip = {
        x: width + (orbitCenter.x - width) * arrival,
        y: height * HORIZON + (orbitCenter.y - height * HORIZON) * arrival,
      };
      const tail = width * MERGE_AT - panAmount() * width;
      return {
        tip,
        tail: tail + (tip.x - tail) * smoothstep(timing.arrival, timing.contracted, p),
      };
    };

    // Preserve the fan paths. The horizontal beam closes before the galaxy opens.
    const updateTransitionLines = () => {
      if (transitionRef.current === undefined) return;
      const p = transitionRef.current;
      const orbit = orbitRef.current;
      const timing = getFlowTiming(orbit);
      const offset = -panAmount() * width;
      const beam = beamState();
      // Translate the fan and its particles to the same seam as the beam.
      const offsetY = beam.tip.y - height * HORIZON;
      const incoming = 1 - smoothstep(timing.arrival, timing.contracted, p);
      if (lineMesh) {
        lineMesh.position.set(offset, offsetY, 0);
        lineMesh.visible = p < timing.contracted;
      }
      lineMaterial.opacity = 0.8 * incoming;
      if (foregroundMesh) {
        foregroundMesh.position.set(offset, offsetY, 0);
        foregroundMesh.visible = p < timing.contracted;
      }
      foregroundMaterial.opacity = 0.48 * incoming;
      if (particleMesh) {
        particleMesh.position.set(offset, offsetY, 0);
        particleMesh.frustumCulled = false;
        particleMesh.visible = p < timing.contracted;
      }
      if (spineMesh) {
        const positions = spineMesh.geometry.attributes.position.array as Float32Array;
        positions.set([beam.tail, beam.tip.y, 0, beam.tip.x, beam.tip.y, 0]);
        spineMesh.geometry.attributes.position.needsUpdate = true;
        spineMesh.geometry.computeBoundingSphere();
        spineMesh.geometry.setDrawRange(0, 2);
        spineMesh.position.x = 0;
        spineMesh.visible = p < timing.contracted;
        spineMaterial.opacity = 0.65;
      }
      if (!galaxyMesh || !galaxyLines) return;
      const charge = smoothstep(timing.arrival, timing.contracted, p);
      const burst = smoothstep(timing.burst, timing.expanded, p);
      const settle = smoothstep(timing.expanded, timing.settled, p);
      // One controlled overshoot, followed by a slower settle. Seek-safe both ways.
      const expansion = burst * (orbit.burst - (orbit.burst - 1) * settle);
      const reveal = smoothstep(timing.burst, timing.burst + 0.03, p);
      const cx = beam.tip.x;
      const cy = beam.tip.y;
      const count = galaxyMesh.geometry.attributes.aIntensity.count - 1;
      const positions = galaxyMesh.geometry.attributes.position.array as Float32Array;
      const intensities = galaxyMesh.geometry.attributes.aIntensity.array as Float32Array;
      const sizes = galaxyMesh.geometry.attributes.aSize.array as Float32Array;
      positions.set([cx, cy, 1], 0);
      // The nucleus contracts during charging, then flashes at the burst.
      const compression = smoothstep(timing.contracted, timing.burst - 0.02, p);
      const flash =
        smoothstep(timing.burst - 0.02, timing.burst, p) *
        (1 - smoothstep(timing.burst, timing.expanded, p));
      sizes[0] = (12 + charge * 14 - compression * 6 + flash * 60) * orbit.particleSize;
      intensities[0] =
        smoothstep(0.14, 0.24, p) *
        (0.65 + charge * 0.6 + flash * 1.6) *
        (orbit.showContent ? 1 - smoothstep(timing.settled, 1, p) : 1) *
        orbit.brightness;
      // New: the orbit sits in the left column, so the spheres are a little smaller and
      // the rings tighter, keeping every planet inside that column.
      const unit = Math.min(width * 0.85, height) * orbit.size * (calmRef.current ? 0.85 : 1);
      // Older live-preview settings can survive a hot update without the new field.
      const ringUnit = unit * (orbit.ringScale ?? 1) * (calmRef.current ? 0.54 : 1);
      // New keeps the face-on view (round rings, spheres all around the core): no turn or tilt.
      const pose = calmRef.current
        ? { rotation: 0, tilt: Math.PI / 2 }
        : getOrbitPose(orbit, p, reducedMotion);
      const coreReveal = orbitEase(timing.burst, timing.expanded, p);
      // New: the Venus core is drawn about 16% smaller than Explorer (0.7 × 1.2).
      const coreRadius =
        unit * orbitCoreRadius * (0.35 + coreReveal * 0.65) * (calmRef.current ? 0.84 : 1);
      centerSphere.visible = orbit.showContent && coreReveal > 0;
      centerSphere.position.set(cx, cy, 0);
      centerSphere.scale.setScalar(coreRadius);
      centerSphere.rotation.set(0.16, centerSpin, -0.08);
      const finish = { satin: 0, frost: 1, polished: 2 }[orbit.texture ?? 'frost'];
      centerSphere.material.uniforms.uFinish.value = finish;
      logoMesh.visible = centerSphere.visible;
      logoMesh.position.set(cx, cy, 0);
      logoMesh.scale.set(
        coreRadius * venusLogoScale,
        -coreRadius * venusLogoScale * (34 / 38),
        coreRadius,
      );
      if (centerGlow) {
        centerGlow.visible = centerSphere.visible;
        centerGlow.position.set(cx, cy, -coreRadius * 1.2);
        // New: about 10% more halo than Explorer, just enough to read as a soft glow.
        centerGlow.scale.setScalar(coreRadius * (calmRef.current ? 3.3 : 3));
        centerGlow.material.uniforms.uStrength.value = (calmRef.current ? 0.46 : 0.42) * coreReveal;
      }
      orbitSatellites.forEach((item, index) => {
        // New: all six products share one ring as a hexagon (60 degrees apart, same size),
        // still turning together.
        const ring = Math.round((calmRef.current ? CALM_RING : item.ring) * (orbit.rings - 1));
        // Explorer keeps every satellite moving one way so none passes through another.
        const direction = explorerRef.current || ring % 2 === 0 ? 1 : -1;
        // New: evenly spread around the core, all turning together at one pace.
        const phase = calmRef.current
          ? CALM_HEX_START + (CALM_HEX_ORDER.indexOf(item.symbol) * Math.PI) / 3 + calmOrbit
          : item.phase + satelliteOrbits[index] * 0.16 * direction;
        const point = projectOrbit(
          getOrbitRadius(ringUnit, ring, orbit.rings) * expansion,
          phase,
          pose,
        );
        const appear = orbitEase(
          timing.burst + (timing.expanded - timing.burst) * 0.5,
          timing.expanded,
          p,
        );
        satellites[index].visible = orbit.showContent && appear > 0;
        satellites[index].position.set(cx + point.x, cy + point.y, point.z);
        const radius =
          unit * (calmRef.current ? orbitCoreRadius * CALM_SATELLITE_SCALE : item.radius) * appear;
        satellites[index].scale.setScalar(radius);
        satellites[index].rotation.set(0.12, satelliteSpins[index], -0.16);
        satellites[index].material.uniforms.uFinish.value = finish;
        const mark = satelliteMarks[index].mesh;
        const markActive = activeAsset === item.symbol && p >= 0.99;
        if (explorerRef.current) {
          // Engraved tone-on-tone at rest, the full white mark on hover/focus.
          mark.visible = satellites[index].visible;
          const uniforms = satelliteMarks[index].material.uniforms;
          uniforms.uTint.value.copy(engraveTints[index]);
          // New: product icons stay white so they read at a glance.
          uniforms.uTintMix.value = markActive || calmRef.current ? 0 : 1;
          uniforms.uOpacity.value = markActive ? 1 : (calmRef.current ? 0.92 : 0.7) * appear;
          const glow = satelliteGlows[index];
          // Light page: no coloured halo behind the spheres.
          glow.visible = satellites[index].visible && !lightRef.current;
          glow.position.set(cx + point.x, cy + point.y, point.z - radius * 1.2);
          glow.scale.setScalar(radius * 3.2);
          glow.material.uniforms.uStrength.value = (markActive ? 0.55 : 0.32) * appear;
        } else {
          mark.visible = satellites[index].visible && markActive;
        }
        mark.position.set(cx + point.x, cy + point.y, point.z);
        const markScale = calmRef.current ? PRODUCT_MARK_SCALE : item.markScale;
        mark.scale.set(radius * markScale, -radius * markScale, radius);
        // One fixed point light above-left of the Hub. The same world position
        // lights every sphere; highlights and shadow sides follow their orbit.
        satellites[index].material.uniforms.uLight.value.set(
          -unit * 0.45 - point.x,
          -unit * 0.6 - point.y,
          unit * 0.9 - point.z,
        );
        satelliteMarks[index].material.uniforms.uLight.value.copy(
          satellites[index].material.uniforms.uLight.value,
        );
        // React can replace these buttons during a live preview refresh.
        if (assetTargets[index] && !assetTargets[index]?.isConnected) {
          assetTargets[index] =
            mount
              .closest('.horizontal-flow')
              ?.querySelector<HTMLButtonElement>(
                `.asset-orbit__target[data-symbol="${item.symbol}"]`,
              ) ?? null;
        }
        const target = assetTargets[index];
        if (target) {
          target.style.left = `${cx + point.x - targetOrigin.x}px`;
          target.style.top = `${cy + point.y - targetOrigin.y}px`;
          target.style.width = `${radius * 2}px`;
          target.style.height = `${radius * 2}px`;
          target.style.zIndex = String(Math.round(point.z + unit));
          // The center sphere occludes a satellite on the far side of its orbit.
          const occluded = point.z < 0 && Math.hypot(point.x, point.y) < coreRadius + radius * 0.5;
          target.style.visibility =
            p >= 0.99 && orbit.showContent && !occluded ? 'visible' : 'hidden';
        }
      });
      // New: a hit target over the centre sphere (Venus Core).
      const coreTarget = mount
        .closest('.horizontal-flow')
        ?.querySelector<HTMLButtonElement>('.asset-orbit__target[data-symbol="CORE"]');
      if (coreTarget) {
        coreTarget.style.left = `${cx - targetOrigin.x}px`;
        coreTarget.style.top = `${cy - targetOrigin.y}px`;
        coreTarget.style.width = `${coreRadius * 2}px`;
        coreTarget.style.height = `${coreRadius * 2}px`;
        coreTarget.style.zIndex = String(Math.round(unit));
        coreTarget.style.visibility = p >= 0.99 && orbit.showContent ? 'visible' : 'hidden';
      }
      for (let index = 0; index < count; index++) {
        const ring = index % orbit.rings;
        const phase = hash(index, 17) * Math.PI * 2 + orbitElapsed * 0.16 * (ring % 2 ? -1 : 1);
        const ringRadius = getOrbitRadius(ringUnit, ring, orbit.rings);
        // Tighten the gathering dust continuously, rather than holding a fuzzy ball.
        const inward = (6 + hash(index, 20) * 16) * (1 - charge * 0.6) * (1 - compression * 0.55);
        const radius = ringRadius * expansion + inward * (1 - burst);
        const point = projectOrbit(radius, phase, pose);
        positions.set([cx + point.x, cy + point.y, point.z], (index + 1) * 3);
        intensities[index + 1] =
          (reveal + charge * (1 - reveal) * 0.28) *
          (0.35 + hash(index, 19) * 0.5) *
          orbit.brightness;
        sizes[index + 1] =
          (2 + hash(index + 1, 21) * 3) * orbit.particleSize * (0.65 + burst * 0.35);
      }
      galaxyMesh.geometry.attributes.position.needsUpdate = true;
      galaxyMesh.geometry.attributes.aIntensity.needsUpdate = true;
      galaxyMesh.geometry.attributes.aSize.needsUpdate = true;
      galaxyMesh.frustumCulled = false;
      const vertices = galaxyLines.geometry.attributes.position.array as Float32Array;
      for (let ring = 0; ring < orbit.rings; ring++) {
        const radius = getOrbitRadius(ringUnit, ring, orbit.rings) * expansion;
        for (let segment = 0; segment < SEGMENTS; segment++) {
          for (let end = 0; end < 2; end++) {
            const angle = ((segment + end) / SEGMENTS) * Math.PI * 2;
            const point = projectOrbit(radius, angle, pose);
            vertices.set(
              [cx + point.x, cy + point.y, point.z],
              (ring * SEGMENTS + segment) * 6 + end * 3,
            );
          }
        }
      }
      galaxyLines.geometry.attributes.position.needsUpdate = true;
      galaxyLines.frustumCulled = false;
      galaxyLines.visible = p >= timing.burst;
      galaxyLineMaterial.opacity = reveal * 0.3 * orbit.brightness;
    };

    const connectedPoint = (lane: number, progress: number, depth: number) => {
      const point = pathPoint(lane, progress, width, height, variantRef.current, depth);
      if (!connectedRef.current || progress <= MERGE_AT) return point;
      const t = (progress - MERGE_AT) / (1 - MERGE_AT);
      // Open the converged stream sideways into a field; never route it down the page.
      const angle = (lane - 0.5) * Math.PI * 0.9;
      const x = MERGE_AT + Math.cos(angle) * t * 0.3;
      const y = HORIZON + Math.sin(angle) * t * 0.4;
      return {
        x: point.x + (x * width - point.x) * handoff,
        y: point.y + (y * height - point.y) * handoff,
      };
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const syncMotion = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) {
        hoverTarget = 0;
        hoverAmount = 0;
      }
      lastFrameDelta = 0;
      updateTransitionLines();
      updateParticles();
      updateStars();
      renderer.render(scene, camera);
      updateLoop();
    };

    const clearGeometry = () => {
      if (galaxyMesh) {
        scene.remove(galaxyMesh);
        galaxyMesh.geometry.dispose();
        galaxyMesh = undefined;
      }
      if (galaxyLines) {
        scene.remove(galaxyLines);
        galaxyLines.geometry.dispose();
        galaxyLines = undefined;
      }
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
      const { lines } = settingsRef.current;
      const particles = lightRef.current
        ? Math.round(settingsRef.current.particles * LIGHT_PARTICLE_SHARE)
        : settingsRef.current.particles;
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
        const glintCount = Math.max(
          1,
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
          const upperRight =
            isExplorer && hash(index, 15) < explorerStarSettings.distribution.upperRightShare;
          const x = upperRight
            ? explorerStarSettings.distribution.upperRightStartX +
              hash(index, 19) * (1 - explorerStarSettings.distribution.upperRightStartX)
            : hash(index, 11);
          const seedY = hash(index, 12);
          // New keeps its diagonal dust band; Explorer fills its quieter upper-right sky.
          const y =
            isMilkyWay && hash(index, 15) < 0.76
              ? Math.min(Math.max(0.1 + x * 0.5 + (seedY - 0.5) * 0.44, 0.03), 0.94)
              : upperRight
                ? explorerStarSettings.distribution.upperRightTopY +
                  seedY * explorerStarSettings.distribution.upperRightHeight
                : seedY;
          starPositions.set([x * width, y * height, -800], index * 3);
          const isDust = isExplorer && index < dustCount;
          const isBright = isExplorer && index >= dustCount && index < dustCount + brightCount;
          const isWarm = isExplorer && (isDust || isBright) && hash(index, 26) < tuning.warmth;
          starShapeFlags[index] = 0;
          starSizes[index] =
            (isMilkyWay
              ? 2 + hash(index, 13) * 2.7
              : isDust
                ? sampleRange(explorerStarSettings.size.dust, hash(index, 13))
                : isBright
                  ? sampleRange(explorerStarSettings.size.bright, hash(index, 13))
                  : sampleRange(explorerStarSettings.size.glints, hash(index, 13))) *
            (isExplorer ? tuning.size : 1);
          // Leave the headline and lower content quieter than the open sky.
          const behindContent = isMilkyWay
            ? (x > 0.23 && x < 0.78 && y > 0.08 && y < 0.32) ||
              (x > 0.57 && y > 0.72) ||
              (x < 0.34 && y > 0.68)
            : (x > 0.25 && x < 0.76 && y > 0.08 && y < 0.35) ||
              (x > 0.68 && y > 0.66) ||
              (x < 0.34 && y > 0.68) ||
              (x > 0.55 && y > 0.46 && y < 0.56);
          const baseIntensity = isMilkyWay
            ? 0.22 + hash(index, 14) * 0.4
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
        // Stars do not read on paper; the light page shows a dot grid in CSS instead.
        distantStarsMesh.visible = !lightRef.current;
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
          if (lightRef.current)
            lineColor
              .copy(LIGHT_PAPER)
              .lerp(LIGHT_TRACK, Math.min(0.34, 0.08 + intensity * 0.45 * fade));
          else
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
            const glow = lightRef.current
              ? [LIGHT_TRACK.r, LIGHT_TRACK.g, LIGHT_TRACK.b]
              : [0.1 * fade, 0.44 * fade, 0.78 * fade];
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
          connectedRef.current
            ? new Float32Array(SEGMENTS * 6)
            : [width * MERGE_AT, height * HORIZON, 0, width, height * HORIZON, 0],
          3,
        ),
      );
      spineMesh = new THREE.LineSegments(spineGeometry, spineMaterial);
      // A zero-line ambient configuration must also omit the outgoing beam.
      spineMesh.visible = lines > 0;
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
        particleSizes[index] = lightRef.current
          ? (tier < 0.72 ? 18 : 24) * (hasDepth ? [0.8, 1, 1.15][depth] : 1)
          : (tier < 0.72 ? 4.5 : tier < 0.96 ? 6.8 : 10.5) * (hasDepth ? [0.82, 1, 1.2][depth] : 1);
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
      particleGeometry.setAttribute(
        'aAngle',
        new THREE.BufferAttribute(new Float32Array(particles), 1),
      );
      particleMesh = new THREE.Points(
        particleGeometry,
        lightRef.current ? cometMaterial : particleMaterial,
      );
      scene.add(particleMesh);

      if (transitionRef.current !== undefined) {
        const count = orbitRef.current.particles + 1;
        const geometry = new THREE.BufferGeometry();
        const sizes = new Float32Array(count);
        const tones = new Float32Array(count * 3);
        for (let index = 0; index < count; index++) {
          sizes[index] = index === 0 ? 42 : 2 + hash(index, 21) * 3;
          tones.set(index % 5 === 0 ? [0.45, 0.78, 1] : [0.28, 0.55, 0.85], index * 3);
        }
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(count * 3), 3),
        );
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aIntensity', new THREE.BufferAttribute(new Float32Array(count), 1));
        geometry.setAttribute('aShape', new THREE.BufferAttribute(new Float32Array(count), 1));
        geometry.setAttribute('aColor', new THREE.BufferAttribute(tones, 3));
        galaxyMesh = new THREE.Points(geometry, particleMaterial);
        scene.add(galaxyMesh);
        const rings = new THREE.BufferGeometry();
        rings.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(orbitRef.current.rings * SEGMENTS * 6), 3),
        );
        galaxyLines = new THREE.LineSegments(rings, galaxyLineMaterial);
        scene.add(galaxyLines);
      }

      updateTransitionLines();
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
          variantRef.current === 'depth-pulse'
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
      if (connectedRef.current && transitionRef.current === undefined) {
        const bounds = mount.getBoundingClientRect();
        const scroller = document.getElementById(PAGE_CONTAINER_ID);
        const top = scroller?.getBoundingClientRect().top ?? 0;
        handoff =
          0.2 + smoothstep(0.08, 0.68, (top - bounds.top) / Math.max(bounds.height, 1)) * 0.8;
        if (spineMesh) {
          spineMaterial.opacity = 0.32 * (1 - handoff);
          const positions = spineMesh.geometry.attributes.position.array as Float32Array;
          for (let segment = 0; segment < SEGMENTS; segment++) {
            const from = connectedPoint(0.5, MERGE_AT + (segment / SEGMENTS) * (1 - MERGE_AT), 1);
            const to = connectedPoint(
              0.5,
              MERGE_AT + ((segment + 1) / SEGMENTS) * (1 - MERGE_AT),
              1,
            );
            positions.set([from.x, from.y, 0, to.x, to.y, 0], segment * 6);
          }
          spineMesh.geometry.attributes.position.needsUpdate = true;
        }
      }
      const angles = particleMesh.geometry.attributes.aAngle.array as Float32Array;
      for (let index = 0; index < particleSeeds.length; index++) {
        const seed = particleSeeds[index];
        const phase = (seed.phase + elapsed * seed.velocity) % 1;
        // The curve starts gently, then gathers speed as separate lanes converge.
        const progress = phase < MERGE_AT ? MERGE_AT * (phase / MERGE_AT) ** 1.12 : phase;
        let point = connectedPoint(seed.lane, progress, seed.depth);
        if (transitionRef.current !== undefined && progress > MERGE_AT) {
          const beam = beamState();
          const t = (progress - MERGE_AT) / (1 - MERGE_AT);
          point = {
            x: beam.tail + (beam.tip.x - beam.tail) * t + panAmount() * width,
            y: height * HORIZON,
          };
        }
        const convergence =
          smoothstep(MERGE_AT - 0.14, MERGE_AT - 0.015, progress) *
          (1 - smoothstep(MERGE_AT + 0.015, MERGE_AT + 0.12, progress));
        const afterMerge = hasDepth
          ? smoothstep(MERGE_AT - 0.01, MERGE_AT + 0.11, progress)
          : smoothstep(MERGE_AT, 0.91, progress);
        const fade = connectedRef.current
          ? (1 - afterMerge * 0.2) * (1 - smoothstep(0.93, 1, progress))
          : hasDepth
            ? 1 - afterMerge * 0.97
            : 1 - afterMerge * (seed.weight > 1 ? 0.8 : 0.96);
        const beamReveal = smoothstep(0, 0.25, transitionRef.current ?? 0) * afterMerge;
        particleIntensities[index] =
          seed.weight *
          (0.84 + convergence * 0.45) *
          (fade + (0.6 - fade) * beamReveal) *
          (transitionRef.current === undefined
            ? 1
            : 1 -
              smoothstep(
                getFlowTiming(orbitRef.current).arrival,
                getFlowTiming(orbitRef.current).contracted,
                transitionRef.current,
              ));
        if (lightRef.current) {
          // Comets gather strength on the way in: faint at the far left, clearest where the
          // lanes meet. Each streak points along its lane's direction of travel.
          particleIntensities[index] *= 0.2 + 0.8 * smoothstep(0.04, MERGE_AT, progress);
          const ahead = connectedPoint(seed.lane, Math.min(progress + 0.004, 1), seed.depth);
          angles[index] =
            progress > MERGE_AT ? 0 : -Math.atan2(ahead.y - point.y, ahead.x - point.x);
        }
        particlePositions[index * 3] = point.x;
        particlePositions[index * 3 + 1] = point.y;
        particlePositions[index * 3 + 2] = 1;
      }
      if (lightRef.current) particleMesh.geometry.attributes.aAngle.needsUpdate = true;
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
      orbitElapsed += lastFrameDelta * orbitRef.current.speed;
      centerSpin += lastFrameDelta * (orbitRef.current.spinSpeed ?? 0.7) * 0.18;
      if (calmRef.current && !activeAsset) {
        calmOrbit += lastFrameDelta * orbitRef.current.speed * 0.16;
      }
      orbitSatellites.forEach((item, index) => {
        if (item.symbol === activeAsset) return;
        satelliteOrbits[index] += lastFrameDelta * orbitRef.current.speed;
        // Explorer spins a little faster so the surface bands visibly turn.
        satelliteSpins[index] +=
          lastFrameDelta *
          (orbitRef.current.spinSpeed ?? 0.7) *
          (explorerRef.current ? 0.55 : 0.32);
      });
      lastTime = time;
      updateTransitionLines();
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
          (transitionRef.current !== undefined && orbitRef.current.speed > 0) ||
          (transitionRef.current !== undefined && (orbitRef.current.spinSpeed ?? 0.7) > 0) ||
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
      const mountBounds = mount.getBoundingClientRect();
      const targetScene = mount.closest('.horizontal-flow')?.querySelector('.asset-orbit__scene');
      const sceneBounds = targetScene?.getBoundingClientRect();
      targetOrigin = sceneBounds
        ? { x: sceneBounds.left - mountBounds.left, y: sceneBounds.top - mountBounds.top }
        : { x: 0, y: 0 };
      assetTargets = orbitSatellites.map(
        item =>
          targetScene?.querySelector<HTMLButtonElement>(
            `.asset-orbit__target[data-symbol="${item.symbol}"]`,
          ) ?? null,
      );
      const core = mount
        .closest('.horizontal-flow')
        ?.querySelector('.asset-orbit__core-disc')
        ?.getBoundingClientRect();
      orbitCenter = core
        ? {
            x: core.left + core.width / 2 - mountBounds.left,
            y: core.top + core.height / 2 - mountBounds.top,
          }
        : { x: width * 0.5, y: height * 0.5 };
      buildGeometry();
      updateTransitionLines();
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    const orbitLayout = mount.closest('.horizontal-flow')?.querySelector('.asset-orbit__scene');
    if (orbitLayout) resizeObserver.observe(orbitLayout);
    const handleSettingsChange = () => {
      buildGeometry();
      updateLoop();
    };
    const handleDriftChange = () => {
      updateLoop();
    };
    const handleTransitionChange = () => {
      updateTransitionLines();
      updateParticles();
      renderer.render(scene, camera);
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
    const handleOrbitChange = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) buildGeometry();
      updateTransitionLines();
      updateLoop();
      renderer.render(scene, camera);
    };
    const handleAssetHover = (event: Event) => {
      activeAsset = (event as CustomEvent<string | null>).detail;
      updateParticles();
      renderer.render(scene, camera);
    };
    window.addEventListener('flow-asset-hover', handleAssetHover);
    mount.addEventListener('flow-orbit-change', handleOrbitChange);
    mount.addEventListener('flow-settings-change', handleSettingsChange);
    mount.addEventListener('flow-transition-change', handleTransitionChange);
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
    const handleScroll = () => {
      if (!connectedRef.current || !visible || !reducedMotion) return;
      updateParticles();
      renderer.render(scene, camera);
    };
    document.addEventListener('scroll', handleScroll, true);
    motionQuery.addEventListener('change', syncMotion);
    resize();
    syncMotion();
    setReady(true);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('flow-asset-hover', handleAssetHover);
      mount.removeEventListener('flow-orbit-change', handleOrbitChange);
      mount.removeEventListener('flow-settings-change', handleSettingsChange);
      mount.removeEventListener('flow-transition-change', handleTransitionChange);
      mount.removeEventListener('flow-drift-change', handleDriftChange);
      mount.removeEventListener('flow-interactivity-change', handleInteractivityChange);
      hero?.removeEventListener('pointermove', handlePointerMove);
      hero?.removeEventListener('pointerleave', resetHover);
      window.removeEventListener('blur', resetHover);
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', updateLoop);
      document.removeEventListener('scroll', handleScroll, true);
      motionQuery.removeEventListener('change', syncMotion);
      clearGeometry();
      lineMaterial.dispose();
      spineMaterial.dispose();
      galaxyLineMaterial.dispose();
      foregroundMaterial.dispose();
      particleMaterial.dispose();
      cometMaterial.dispose();
      sphereGeometry.dispose();
      centerSphere.material.dispose();
      for (const satellite of satellites) satellite.material.dispose();
      for (const glow of satelliteGlows) glow.material.dispose();
      centerGlow?.material.dispose();
      glowGeometry.dispose();
      logoGeometry.dispose();
      logoMaterial.dispose();
      logoTexture.dispose();
      for (const mark of satelliteMarks) {
        mark.material.dispose();
        mark.texture.dispose();
      }
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

  useEffect(() => {
    const previous = orbitRef.current;
    orbitRef.current = orbitSettings;
    mountRef.current?.dispatchEvent(
      new CustomEvent('flow-orbit-change', {
        detail:
          previous.particles !== orbitSettings.particles || previous.rings !== orbitSettings.rings,
      }),
    );
  }, [orbitSettings]);

  useEffect(() => {
    transitionRef.current = transitionProgress;
    mountRef.current?.dispatchEvent(new Event('flow-transition-change'));
  }, [transitionProgress]);

  return (
    <div className="landing-mockup__flow-field" data-ready={ready} aria-hidden="true">
      {!ready && <img src={particleFieldSrc} alt="" />}
      <div ref={mountRef} className="landing-mockup__flow-canvas" />
    </div>
  );
};
