import * as THREE from 'three';
import venusMark from '../LandingMockup/assets/venus-mark-white.svg';

/**
 * Explorer Section 3: the Venus product system, driven by scroll progress (0-1).
 * Screen-space orthographic scene, y up, origin at the stage centre, units in px.
 * Lighting, halo and starfield follow Section 2 (LandingMockup/FlowFieldThree)
 * so the two sections read as one world.
 */

export type NodeId =
  | 'venus'
  | 'hub'
  | 'core'
  | 'flux'
  | 'fixed'
  | 'next'
  | 'vaults'
  | 'prime'
  | 'trade';

export interface NodeScreenState {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

export interface FrameState {
  progress: number;
  nodes: Record<NodeId, NodeScreenState>;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const smooth = (start: number, end: number, value: number) => {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/** Scroll beats, as shares of the pinned track. */
export const BEATS = {
  introOut: [0.08, 0.18],
  push: [0.12, 0.34],
  hubCard: [0.24, 0.34],
  spokes: [0.36, 0.62],
  spokeCard: [0.42, 0.5],
  apps: [0.68, 0.86],
} as const;

const SPOKES = [
  // Angles keep the three Spokes apart on screen: right, left-front, front-right.
  { id: 'core', color: '#3d8bff', ring: 0.24, angle: 0.3, radius: 0.027, weight: 1 },
  { id: 'flux', color: '#22d3c5', ring: 0.34, angle: 3.6, radius: 0.025, weight: 0.7 },
  { id: 'fixed', color: '#7457ff', ring: 0.44, angle: 4.95, radius: 0.023, weight: 0.45 },
] as const;
const NEXT_RING = 0.54;
const APPS = [
  // Kept clear of the copy column on the left: lower-left, top, right.
  { id: 'vaults', color: '#ff8a1c', angle: 4.1, radius: 0.03 },
  { id: 'prime', color: '#f5c84b', angle: 1.45, radius: 0.03 },
  { id: 'trade', color: '#1fbf8f', angle: 5.95, radius: 0.03 },
] as const;
const APP_RING = 0.66;
/** Rings are circles seen at an angle. */
const TILT = 0.42;
const VENUS_RADIUS = 0.078; // matches Section 2's centre sphere
const HUB_RADIUS = 0.04;

const sphereVertex = `
  varying vec3 vViewNormal;
  varying vec3 vSurfaceNormal;
  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    vSurfaceNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Same planet look as Section 2's Explorer spheres: saturated body lit top-left,
// limb darkening, a thin lit rim, a soft sheen, fine grain and slow surface bands
// that turn with the sphere's spin.
const sphereFragment = `
  uniform vec3 uColor;
  uniform vec3 uLight;
  uniform float uOpacity;
  uniform float uGlow;
  varying vec3 vViewNormal;
  varying vec3 vSurfaceNormal;
  float hash12(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 light = normalize(uLight);
    float facing = clamp(normal.z, 0.0, 1.0);
    vec3 surface = normalize(vSurfaceNormal);
    float wrap = clamp((dot(normal, light) + 0.3) / 1.3, 0.0, 1.0);
    vec3 color = mix(uColor * 0.3, uColor * 1.12 + vec3(0.02), smoothstep(0.0, 1.0, wrap));
    float longitude = atan(surface.z, surface.x);
    float bands = sin(surface.y * 5.0 + sin(longitude * 2.0) * 0.9) * 0.5 + 0.5;
    float swirl = sin(longitude * 3.0 + surface.y * 4.0) * 0.5 + 0.5;
    color *= 0.9 + (bands * 0.7 + swirl * 0.3) * 0.2;
    color *= mix(0.6, 1.0, pow(facing, 0.45));
    vec3 halfLight = normalize(light + vec3(0.0, 0.0, 1.0));
    float sheen = pow(max(dot(normal, halfLight), 0.0), 9.0);
    color += mix(uColor, vec3(1.0), 0.5) * sheen * 0.3;
    float rim = pow(1.0 - facing, 3.0) * clamp(dot(normal, light) + 0.4, 0.0, 1.0);
    color += mix(uColor, vec3(1.0), 0.45) * rim * 0.6;
    // inner light, for the Hub
    color += mix(uColor, vec3(1.0), 0.6) * uGlow * pow(facing, 1.5);
    color *= 1.0 + (hash12(floor(gl_FragCoord.xy)) - 0.5) * 0.05;
    gl_FragColor = vec4(color * uOpacity, uOpacity);
    #include <colorspace_fragment>
  }
`;

// Premultiplied output with alpha that follows the light: the canvas is
// transparent over the section, so corners must stay clear (see Section 2).
const premultipliedBlend = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
} as const;

const glowVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const glowFragment = `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float glow = pow(1.0 - smoothstep(0.32, 1.0, d), 1.6) * uStrength;
    gl_FragColor = vec4(uColor * glow, glow);
  }
`;

const pointsVertex = `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const pointsFragment = `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = (1.0 - smoothstep(0.2, 1.0, d)) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export interface ProductOrbitScene {
  dispose: () => void;
  setHighlight: (id: NodeId | null) => void;
}

export function createProductOrbitScene(
  mount: HTMLDivElement,
  options: {
    readTarget: () => number;
    onFrame: (state: FrameState) => void;
    reducedMotion: () => boolean;
  },
): ProductOrbitScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    return null;
  }
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearAlpha(0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.appendChild(renderer.domElement);

  let width = Math.max(mount.clientWidth, 1);
  let height = Math.max(mount.clientHeight, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    -4000,
    4000,
  );
  camera.position.z = 1000;

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const sphereGeometry = track(new THREE.SphereGeometry(1, 64, 48));
  const glowGeometry = track(new THREE.PlaneGeometry(1, 1));

  const makeSphere = (color: string, transparent = false) => {
    const material = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uLight: { value: new THREE.Vector3(-0.45, 0.6, 0.9) },
          uOpacity: { value: 1 },
          uGlow: { value: 0 },
        },
        vertexShader: sphereVertex,
        fragmentShader: sphereFragment,
        ...(transparent
          ? premultipliedBlend
          : {
              blending: THREE.CustomBlending,
              blendSrc: THREE.OneFactor,
              blendDst: THREE.OneMinusSrcAlphaFactor,
            }),
      }),
    );
    const mesh = new THREE.Mesh(sphereGeometry, material);
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  };
  const makeGlow = (color: string) => {
    const material = track(
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: 0 } },
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        ...premultipliedBlend,
      }),
    );
    const mesh = new THREE.Mesh(glowGeometry, material);
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  };
  const makePoints = (count: number) => {
    const geometry = track(new THREE.BufferGeometry());
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    const material = track(
      new THREE.ShaderMaterial({
        uniforms: { uPixelRatio: { value: pixelRatio } },
        vertexShader: pointsVertex,
        fragmentShader: pointsFragment,
        ...premultipliedBlend,
      }),
    );
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    return { points, positions, sizes, alphas, colors, geometry };
  };
  const linear = (hex: string) => new THREE.Color(hex);

  // Starfield, shared look with Section 2. Parallax follows the camera push.
  const STARS = 520;
  const stars = makePoints(STARS);
  const starSeeds = Array.from({ length: STARS }, (_, i) => ({
    x: hash(i) - 0.5,
    y: hash(i + 1000) - 0.5,
    size: 0.8 + hash(i + 2000) * 1.6,
    alpha: 0.18 + hash(i + 3000) * 0.55,
    twinkle: hash(i + 4000) * Math.PI * 2,
    warm: hash(i + 5000) > 0.93,
  }));
  starSeeds.forEach((seed, i) => {
    const c = seed.warm ? linear('#ffcf9a') : linear('#dfe8ff');
    stars.colors.set([c.r, c.g, c.b], i * 3);
    stars.sizes[i] = seed.size;
  });

  // The Venus shell we push into, the Hub inside it, Spokes and apps around it.
  const system = new THREE.Group();
  scene.add(system);
  const venus = makeSphere('#1f6fe6', true);
  venus.renderOrder = 5;
  const venusGlow = makeGlow('#2f80ff');
  // Re-upload once the image arrives: without it the mark stayed blank on first load.
  const logoTexture = track(
    new THREE.TextureLoader().load(venusMark, texture => {
      texture.needsUpdate = true;
      logoMaterial.needsUpdate = true;
    }),
  );
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  const logoMaterial = track(
    new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  const logo = new THREE.Mesh(glowGeometry, logoMaterial);
  logo.renderOrder = 6;
  scene.add(logo);

  const hub = makeSphere('#4d8dff');
  const hubGlow = makeGlow('#4d9bff');
  const spokeMeshes = SPOKES.map(spoke => ({
    ...spoke,
    mesh: makeSphere(spoke.color),
    glow: makeGlow(spoke.color),
  }));
  const appMeshes = APPS.map(app => ({
    ...app,
    mesh: makeSphere(app.color),
    glow: makeGlow(app.color),
  }));
  for (const item of [hub, ...spokeMeshes.map(s => s.mesh), ...appMeshes.map(a => a.mesh)])
    system.add(item);
  for (const glow of [hubGlow, ...spokeMeshes.map(s => s.glow), ...appMeshes.map(a => a.glow)])
    system.add(glow);

  // Orbit rings: one per Spoke, a dashed one for the next Spoke, one for the apps.
  const SEGMENTS = 160;
  const ringGeometry = track(new THREE.BufferGeometry());
  const ringPoints = new Float32Array((SEGMENTS + 1) * 3);
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = (i / SEGMENTS) * Math.PI * 2;
    ringPoints.set([Math.cos(t), Math.sin(t) * TILT, -1], i * 3);
  }
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPoints, 3));
  const makeRing = (color: string, dashed = false) => {
    const material = track(
      dashed
        ? new THREE.LineDashedMaterial({
            color,
            transparent: true,
            opacity: 0,
            dashSize: 0.02,
            gapSize: 0.02,
          })
        : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }),
    );
    const line = new THREE.Line(ringGeometry, material);
    if (dashed) line.computeLineDistances();
    system.add(line);
    return line;
  };
  const spokeRings = SPOKES.map(spoke => makeRing(spoke.color));
  const nextRing = makeRing('#8ea2c8', true);
  const appRing = makeRing('#5b6b8a');

  // Liquidity streams: particles leave the Hub and travel to each Spoke.
  const streamCounts = SPOKES.map(spoke => Math.round(70 + spoke.weight * 110));
  const STREAM_TOTAL = streamCounts.reduce((sum, n) => sum + n, 0);
  const streams = makePoints(STREAM_TOTAL);
  const streamSeeds = Array.from({ length: STREAM_TOTAL }, (_, i) => ({
    offset: hash(i + 7000),
    lateral: hash(i + 8000) * 2 - 1,
    speed: 0.16 + hash(i + 9000) * 0.12,
    size: 2 + hash(i + 9500) * 3,
  }));
  {
    let cursor = 0;
    SPOKES.forEach((spoke, s) => {
      const color = linear(spoke.color).lerp(new THREE.Color(1, 1, 1), 0.25);
      for (let k = 0; k < streamCounts[s]; k++) {
        streams.colors.set([color.r, color.g, color.b], (cursor + k) * 3);
      }
      cursor += streamCounts[s];
    });
  }
  // A small swarm around the Hub: liquidity gathering before it is routed.
  const SWARM = 110;
  const swarm = makePoints(SWARM);
  const swarmSeeds = Array.from({ length: SWARM }, (_, i) => ({
    radius: 1.5 + hash(i + 11000) * 1.9,
    phase: hash(i + 12000) * Math.PI * 2,
    speed: 0.25 + hash(i + 13000) * 0.5,
    lift: hash(i + 14000) * 2 - 1,
    size: 1 + hash(i + 15000) * 2,
  }));
  {
    const swarmColor = linear('#9cc7ff');
    for (let i = 0; i < SWARM; i++)
      swarm.colors.set([swarmColor.r, swarmColor.g, swarmColor.b], i * 3);
  }

  let highlight: NodeId | null = null;
  const highlightAmount: Partial<Record<NodeId, number>> = {};

  const resize = () => {
    width = Math.max(mount.clientWidth, 1);
    height = Math.max(mount.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);

  let visible = true;
  const intersection = new IntersectionObserver(
    entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) start();
    },
    { rootMargin: '120px' },
  );
  intersection.observe(mount);

  let frame = 0;
  let last = 0;
  let clock = 0;
  let progress = options.readTarget();
  const empty = { x: 0, y: 0, radius: 0, opacity: 0 };
  const nodes: Record<NodeId, NodeScreenState> = {
    venus: { ...empty },
    hub: { ...empty },
    core: { ...empty },
    flux: { ...empty },
    fixed: { ...empty },
    next: { ...empty },
    vaults: { ...empty },
    prime: { ...empty },
    trade: { ...empty },
  };
  const toScreen = (
    state: NodeScreenState,
    x: number,
    y: number,
    radius: number,
    opacity: number,
  ) => {
    state.x = width / 2 + x;
    state.y = height / 2 - y;
    state.radius = radius;
    state.opacity = opacity;
  };

  const render = (delta: number) => {
    const reduced = options.reducedMotion();
    const target = options.readTarget();
    progress = reduced ? target : progress + (target - progress) * (1 - Math.exp(-delta / 0.09));
    if (Math.abs(target - progress) < 0.0004) progress = target;
    if (!reduced) clock += delta;
    const p = progress;
    const unit = Math.min(width * 0.85, height);

    const push = smooth(BEATS.push[0], BEATS.push[1], p);
    const spokesIn = smooth(BEATS.spokes[0], BEATS.spokes[1], p);
    const appsIn = smooth(BEATS.apps[0], BEATS.apps[1], p);
    const settle = smooth(0.66, 0.8, p);

    // The system slides right to make room for the copy, then eases back a little
    // and shrinks so the outer app ring fits.
    const shiftX = width * (0.12 * smooth(0.1, 0.3, p));
    const scale = 1 - settle * 0.15;
    system.position.set(shiftX, 0, 0);
    system.scale.setScalar(scale);

    // Venus shell: grows past the screen edge while it fades, revealing the Hub.
    const venusRadius = unit * VENUS_RADIUS * (1 + push * push * 12);
    const venusOpacity = 1 - smooth(BEATS.push[0] + 0.06, BEATS.push[1], p);
    venus.visible = venusOpacity > 0.002;
    venus.position.set(shiftX, 0, 0);
    venus.scale.setScalar(venusRadius);
    venus.rotation.set(0.16, clock * 0.12, -0.08);
    venus.material.uniforms.uOpacity.value = venusOpacity;
    venusGlow.visible = venus.visible;
    venusGlow.position.set(shiftX, 0, -venusRadius * 1.2);
    venusGlow.scale.setScalar(venusRadius * 3);
    venusGlow.material.uniforms.uStrength.value = 0.42 * venusOpacity;
    logo.visible = venus.visible;
    logo.position.set(shiftX, 0, venusRadius + 1);
    logo.scale.set(venusRadius * 0.82, venusRadius * 0.82 * (34 / 38), 1);
    logoMaterial.opacity = venusOpacity * (1 - push * 1.4);
    toScreen(nodes.venus, shiftX, 0, venusRadius, venusOpacity);

    // Hub: appears inside the shell, breathing slowly.
    const hubIn = smooth(BEATS.push[0] + 0.04, BEATS.push[1] - 0.02, p);
    const hubRadius = unit * HUB_RADIUS * (0.6 + hubIn * 0.4) * (1 + Math.sin(clock * 1.6) * 0.02);
    hub.visible = hubIn > 0.001;
    hub.scale.setScalar(hubRadius);
    hub.rotation.set(0.2, clock * 0.25, -0.1);
    hub.material.uniforms.uGlow.value = 0.55;
    hubGlow.visible = hub.visible;
    hubGlow.position.set(0, 0, -hubRadius * 1.2);
    hubGlow.scale.setScalar(hubRadius * 6.5);
    hubGlow.material.uniforms.uStrength.value = 0.6 * hubIn;
    toScreen(nodes.hub, shiftX, 0, hubRadius * scale, hubIn);

    // Hub swarm
    for (let i = 0; i < SWARM; i++) {
      const seed = swarmSeeds[i];
      const angle = seed.phase + clock * seed.speed;
      const r = hubRadius * seed.radius;
      swarm.positions.set(
        [
          shiftX + Math.cos(angle) * r * scale,
          (Math.sin(angle) * TILT + seed.lift * 0.35) * r * scale,
          -Math.sin(angle) * r,
        ],
        i * 3,
      );
      swarm.alphas[i] =
        hubIn *
        (0.35 + 0.4 * (0.5 + 0.5 * Math.sin(clock * 2 + seed.phase))) *
        (1 - spokesIn * 0.4);
      swarm.sizes[i] = seed.size;
    }
    swarm.geometry.attributes.position.needsUpdate = true;
    swarm.geometry.attributes.aAlpha.needsUpdate = true;
    swarm.geometry.attributes.aSize.needsUpdate = true;

    // Spokes: rings draw in, then nodes arrive, one after another.
    let cursor = 0;
    spokeMeshes.forEach((spoke, s) => {
      const local = smooth(BEATS.spokes[0] + s * 0.06, BEATS.spokes[0] + s * 0.06 + 0.14, p);
      const ringRadius = unit * spoke.ring * (0.6 + local * 0.4);
      const ring = spokeRings[s];
      ring.scale.set(ringRadius, ringRadius, 1);
      (ring.material as THREE.LineBasicMaterial).opacity = 0.4 * local;
      // A gentle sway, not a full orbit: labels and cards keep a stable layout.
      const angle = spoke.angle + Math.sin(clock * 0.18 + s * 2) * 0.1;
      const x = Math.cos(angle) * ringRadius;
      const y = Math.sin(angle) * ringRadius * TILT;
      const z = -Math.sin(angle) * ringRadius * 0.6;
      const lift = highlightAmount[spoke.id as NodeId] ?? 0;
      const radius = unit * spoke.radius * local * (1 + lift * 0.18);
      spoke.mesh.visible = local > 0.001;
      spoke.mesh.position.set(x, y, z);
      spoke.mesh.scale.setScalar(radius);
      spoke.mesh.rotation.set(0.12, clock * 0.5 + s, -0.16);
      spoke.glow.visible = spoke.mesh.visible;
      spoke.glow.position.set(x, y, z - radius * 1.2);
      spoke.glow.scale.setScalar(radius * 3.4);
      spoke.glow.material.uniforms.uStrength.value = (0.34 + lift * 0.3) * local;
      toScreen(nodes[spoke.id as NodeId], shiftX + x * scale, y * scale, radius * scale, local);

      // stream from the Hub to this Spoke along a gentle curve
      const flow = local * (1 - appsIn * 0.35);
      const dx = x;
      const dy = y;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      const bend = length * 0.18;
      for (let k = 0; k < streamCounts[s]; k++) {
        const i = cursor + k;
        const seed = streamSeeds[i];
        const t = (seed.offset + clock * seed.speed * (0.6 + spoke.weight * 0.6)) % 1;
        const u = reduced ? seed.offset : t;
        const curve = 4 * u * (1 - u);
        const spread = (4 + 12 * spoke.weight) * Math.sin(Math.PI * u) * seed.lateral;
        const px = dx * u + nx * (bend * curve + spread);
        const py = dy * u + ny * (bend * curve + spread);
        const pz = z * u;
        streams.positions.set([shiftX + px * scale, py * scale, pz], i * 3);
        streams.alphas[i] = flow * Math.min(1, Math.sin(Math.PI * u) * 1.6);
        streams.sizes[i] = seed.size * (0.7 + spoke.weight * 0.4);
      }
      cursor += streamCounts[s];
    });
    streams.geometry.attributes.position.needsUpdate = true;
    streams.geometry.attributes.aAlpha.needsUpdate = true;
    streams.geometry.attributes.aSize.needsUpdate = true;

    // The dashed ring: room for the next Spoke.
    const nextIn = smooth(BEATS.spokes[0] + 0.2, BEATS.spokes[1], p);
    const nextRadius = unit * NEXT_RING;
    nextRing.scale.set(nextRadius, nextRadius, 1);
    (nextRing.material as THREE.LineDashedMaterial).opacity = 0.4 * nextIn;
    (nextRing.material as THREE.LineDashedMaterial).dashSize = 0.018;
    (nextRing.material as THREE.LineDashedMaterial).gapSize = 0.022;
    toScreen(
      nodes.next,
      shiftX + Math.cos(-2.2) * nextRadius * scale,
      Math.sin(-2.2) * nextRadius * TILT * scale,
      0,
      nextIn * (1 - appsIn),
    );

    // Apps on the outer ring.
    const appRadius = unit * APP_RING;
    appRing.scale.set(appRadius, appRadius, 1);
    (appRing.material as THREE.LineBasicMaterial).opacity = 0.28 * appsIn;
    appMeshes.forEach((app, a) => {
      const local = smooth(BEATS.apps[0] + a * 0.04, BEATS.apps[0] + a * 0.04 + 0.12, p);
      const angle = app.angle + Math.sin(clock * 0.14 + a * 2.4) * 0.07;
      const x = Math.cos(angle) * appRadius;
      const y = Math.sin(angle) * appRadius * TILT;
      const z = -Math.sin(angle) * appRadius * 0.6;
      const lift = highlightAmount[app.id as NodeId] ?? 0;
      const radius = unit * app.radius * local * (1 + lift * 0.18);
      app.mesh.visible = local > 0.001;
      app.mesh.position.set(x, y, z);
      app.mesh.scale.setScalar(radius);
      app.mesh.rotation.set(0.12, clock * 0.45 + a * 2, -0.16);
      app.glow.visible = app.mesh.visible;
      app.glow.position.set(x, y, z - radius * 1.2);
      app.glow.scale.setScalar(radius * 3.4);
      app.glow.material.uniforms.uStrength.value = (0.34 + lift * 0.35) * local;
      toScreen(nodes[app.id as NodeId], shiftX + x * scale, y * scale, radius * scale, local);
    });

    // Highlight easing (card hover lifts its sphere).
    for (const id of ['core', 'flux', 'fixed', 'vaults', 'prime', 'trade'] as NodeId[]) {
      const goal = highlight === id ? 1 : 0;
      const current = highlightAmount[id] ?? 0;
      highlightAmount[id] = reduced
        ? goal
        : current + (goal - current) * (1 - Math.exp(-delta / 0.12));
    }

    // Stars drift towards the viewer during the push.
    const zoom = 1 + push * 0.35;
    for (let i = 0; i < STARS; i++) {
      const seed = starSeeds[i];
      stars.positions.set(
        [seed.x * width * 1.1 * zoom, seed.y * height * 1.1 * zoom, -1500],
        i * 3,
      );
      stars.alphas[i] =
        seed.alpha * (reduced ? 1 : 0.75 + 0.25 * Math.sin(clock * 1.3 + seed.twinkle));
    }
    stars.geometry.attributes.position.needsUpdate = true;
    stars.geometry.attributes.aAlpha.needsUpdate = true;

    renderer.render(scene, camera);
    options.onFrame({ progress: p, nodes });
  };

  const loop = (time: number) => {
    frame = 0;
    if (!visible || document.hidden) return;
    const delta = last ? Math.min(0.05, (time - last) / 1000) : 0.016;
    last = time;
    render(delta);
    frame = requestAnimationFrame(loop);
  };
  function start() {
    if (frame) return;
    last = 0;
    frame = requestAnimationFrame(loop);
  }
  const onVisibility = () => {
    if (!document.hidden) start();
  };
  document.addEventListener('visibilitychange', onVisibility);
  render(0.016);
  start();

  return {
    setHighlight: id => {
      highlight = id;
    },
    dispose: () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      for (const item of disposables) item.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
