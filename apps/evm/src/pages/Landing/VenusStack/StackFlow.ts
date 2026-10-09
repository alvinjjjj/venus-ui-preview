import * as THREE from 'three';
import { SPOKES } from './stackData';

interface StackFlowOptions {
  plateWidth: number;
  plateDepth: number;
  labelLift: number;
  gap: number;
  pixelRatio: number;
  color: THREE.Color;
}

const smoothstep = (from: number, to: number, value: number) => {
  const t = THREE.MathUtils.clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Decorative paths explain Hub aggregation and its three active Spokes, not live allocations. */
export const createStackFlow = ({
  plateWidth,
  plateDepth,
  labelLift,
  gap,
  pixelRatio,
  color,
}: StackFlowOptions) => {
  const group = new THREE.Group();
  const particleCount = 180;
  const trailSteps = 4;
  const routeSegments = 64;
  const routeCount = 2 + SPOKES.length;
  const hubY = gap + labelLift;
  const spokeY = gap * 2 + labelLift;
  const hub = new THREE.Vector3(0, hubY, 0);
  const entry = new THREE.Vector3();
  const sample = new THREE.Vector3();
  const control = new THREE.Vector3();
  const source = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const ray = new THREE.Vector3();

  const incoming = new THREE.CubicBezierCurve3(entry, control, source, hub);
  const rimX = plateWidth * 0.38;
  const rimZ = plateDepth * 0.38;
  const orbit = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-rimX, hubY, -rimZ),
      new THREE.Vector3(rimX, hubY, -rimZ),
      new THREE.Vector3(rimX, hubY, rimZ),
      new THREE.Vector3(-rimX, hubY, rimZ),
    ],
    true,
    'catmullrom',
    0.12,
  );
  const branches = SPOKES.map((_, index) => {
    const x = (index % 2 ? 1 : -1) * plateWidth * 0.24;
    const z = (index < 2 ? -1 : 1) * plateDepth * 0.24;
    // End alongside the tile label; the fourth, open slot receives no stream.
    return new THREE.CubicBezierCurve3(
      hub.clone(),
      new THREE.Vector3(x * 0.2, hubY + gap * 0.4, z * 0.2),
      new THREE.Vector3(x * 0.7, spokeY + gap, z - plateDepth * 0.1),
      new THREE.Vector3(x, spokeY, z - plateDepth * 0.1),
    );
  });
  const routes: THREE.Curve<THREE.Vector3>[] = [incoming, orbit, ...branches];
  const routePositions = new Float32Array(routeCount * routeSegments * 6);
  const routeColors = new Float32Array(routePositions.length);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(routePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(routeColors, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  lines.frustumCulled = false;
  lines.renderOrder = 500;
  group.add(lines);

  const positions = new Float32Array(particleCount * trailSteps * 3);
  const intensities = new Float32Array(particleCount * trailSteps);
  const sizes = new Float32Array(particleCount * trailSteps);
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensities, 1));
  pointGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  for (let i = 0; i < sizes.length; i++) sizes[i] = i % trailSteps === 0 ? 7 : 4;
  const pointMaterial = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: pixelRatio }, uColor: { value: color } },
    vertexShader: `
      attribute float aIntensity;
      attribute float aSize;
      uniform float uPixelRatio;
      varying float vIntensity;
      void main() {
        vIntensity = aIntensity;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vIntensity;
      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        float radius = dot(p, p);
        float core = exp(-radius * 60.0);
        float glow = exp(-radius * 14.0);
        float alpha = (core + glow * 0.3) * vIntensity;
        if (alpha < 0.005) discard;
        gl_FragColor = vec4(mix(uColor, vec3(0.85, 0.95, 1.0), core * 0.5), alpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const points = new THREE.Points(pointGeometry, pointMaterial);
  points.frustumCulled = false;
  points.renderOrder = 501;
  group.add(points);

  let lastProgress = -1;
  const weights = new Float32Array(routeCount);
  const update = (
    progress: number,
    time: number,
    reducedMotion: boolean,
    narrow: boolean,
    targetY: number,
  ) => {
    hub.y = targetY;
    orbit.points.forEach(point => {
      point.y = hub.y;
    });
    source.set(plateWidth * 0.65, hub.y + gap * 4, -plateDepth * 0.6);
    weights[0] = 0.7 * (1 - smoothstep(2.4, 3.2, progress));
    weights[1] = smoothstep(0.8, 1.55, progress) * (1 - smoothstep(2, 3, progress));
    const branchWeight = smoothstep(1.9, 2.55, progress) * (1 - smoothstep(5.7, 6.7, progress));
    for (let i = 2; i < routeCount; i++) weights[i] = branchWeight;

    if (progress !== lastProgress) {
      lastProgress = progress;
      routes.forEach((route, index) => {
        for (let segment = 0; segment < routeSegments; segment++) {
          const offset = (index * routeSegments + segment) * 6;
          route.getPoint(segment / routeSegments, sample).toArray(routePositions, offset);
          route.getPoint((segment + 1) / routeSegments, sample).toArray(routePositions, offset + 3);
          const intensity = weights[index] * (index === 0 ? 0.35 : 0.65);
          for (let end = 0; end < 2; end++) {
            routeColors.set(
              [color.r * intensity, color.g * intensity, color.b * intensity],
              offset + end * 3,
            );
          }
        }
      });
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;
    }
    const count = narrow ? particleCount / 2 : particleCount;
    pointGeometry.setDrawRange(0, count * trailSteps);
    for (let i = 0; i < count; i++) {
      const routeIndex = i % routeCount;
      const phase =
        (((i * 0.61803398875) % 1) + (reducedMotion ? 0 : time * (routeIndex === 1 ? 0.06 : 0.1))) %
        1;
      for (let trail = 0; trail < trailSteps; trail++) {
        const at = (phase - trail * 0.008 + 1) % 1;
        const index = i * trailSteps + trail;
        routes[routeIndex].getPoint(at, sample).toArray(positions, index * 3);
        intensities[index] =
          weights[routeIndex] *
          smoothstep(0, 0.06, at) *
          (1 - smoothstep(0.9, 1, at)) *
          (trail === 0 ? 1 : 0.35 / trail);
      }
    }
    pointGeometry.attributes.position.needsUpdate = true;
    pointGeometry.attributes.aIntensity.needsUpdate = true;
    group.visible = progress < 6.7;
  };

  const frame = (camera: THREE.PerspectiveCamera, model: THREE.Group) => {
    // Align the entrance with the hero's exit (78% across the viewport).
    camera.updateMatrixWorld();
    model.updateMatrixWorld();
    forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    ray.set(0.56, 1.04, 0.5).unproject(camera).sub(camera.position).normalize();
    const distance = camera.position.length() / Math.max(ray.dot(forward), 0.1);
    entry.copy(camera.position).addScaledVector(ray, distance);
    model.worldToLocal(entry);
    control.copy(entry).lerp(hub, 0.4);
    control.x += plateWidth * 0.25;
    lastProgress = -1;
  };

  return {
    group,
    update,
    frame,
    dispose: () => {
      lineGeometry.dispose();
      lineMaterial.dispose();
      pointGeometry.dispose();
      pointMaterial.dispose();
    },
  };
};
