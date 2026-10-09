const TAU = Math.PI * 2;

export interface StoryParticle {
  phase: number;
  angle: number;
  latitude: number;
  radius: number;
  branch: number;
  cohort: number;
}

const hash = (index: number, salt: number) => {
  let value = Math.imul(index + salt * 1013, 0x9e3779b1);
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b);
  value ^= value >>> 13;
  return (value >>> 0) / 0x100000000;
};

export const makeStoryParticle = (index: number): StoryParticle => ({
  phase: hash(index, 1),
  angle: hash(index, 2) * TAU,
  latitude: hash(index, 3) * 2 - 1,
  radius: hash(index, 4),
  branch: index % 3,
  cohort: index % 10,
});

/** A dominant Hub on the left, with three smaller venues fanning out to the right. */
export const HUB_CENTER = [-0.7, 0] as const;
const SPOKE_CENTERS = [
  [1, -0.95],
  [1.38, 0],
  [1, 0.95],
] as const;
export const spokeCenter = (branch: number) => SPOKE_CENTERS[branch % 3];

/** Frame all scenes inside one stable art area; never size against the full viewport. */
export const fitStory = (left: number, top: number, width: number, height: number) => ({
  x: left + width / 2,
  y: top + height / 2,
  scale: Math.max(1, Math.min(width / 3.8, height / 3.4)),
});

export const storyFrame = (progress: number) => {
  const position = Math.min(6, Math.max(0, progress - 0.55));
  const from = Math.floor(position);
  const t = position - from;
  return { from, to: Math.min(6, from + 1), blend: t * t * (3 - 2 * t) };
};

/** Writes normalized x / y / z / intensity into a reusable sample. */
export const writeStoryPose = (
  stage: number,
  seed: StoryParticle,
  time: number,
  output: Float32Array,
) => {
  const phase = (seed.phase + time * 0.065) % 1;
  const azimuth = seed.angle + time * 0.08;
  const radial = Math.cbrt(seed.radius);
  const equator = Math.sqrt(1 - seed.latitude ** 2);
  const sphereX = Math.cos(azimuth) * equator * radial;
  const sphereY = Math.sin(azimuth) * equator * radial;
  const sphereZ = seed.latitude * radial;
  const branchAngle = ((seed.branch - 1) * TAU) / 3;
  const ring = 0.38 + seed.radius ** 2 * 0.13;
  const ringX = Math.cos(azimuth) * ring;
  const ringY = Math.sin(azimuth) * ring * 0.8;
  let x = 0;
  let y = 0;
  let z = 0;
  let intensity = 0.65;

  if (stage === 0) {
    // Distinct sources gather across the screen, sharing the hero's direction.
    x = -1.5 + phase * 2.5;
    y = (seed.branch - 1) * 0.65 * (1 - phase) ** 2 + sphereY * 0.035;
    z = sphereZ * 0.16;
    intensity = Math.sin(Math.PI * phase) * 0.65;
  } else if (stage === 1) {
    // A thick, slow vortex of liquidity, made only from points.
    const radius = 0.35 + seed.radius ** 0.7 * 0.65;
    const angle = branchAngle + radius * 4.5 + (seed.angle / TAU - 0.5) * 0.28 + time * 0.12;
    x = Math.cos(angle) * radius;
    y = Math.sin(angle) * radius * 0.78;
    z = sphereZ * 0.14;
    intensity = 0.35 + (1 - radius) * 0.45;
  } else if (stage === 2 || stage === 3) {
    if (seed.cohort < 4) {
      x = HUB_CENTER[0] + ringX;
      y = ringY;
      z = sphereZ * 0.12;
      intensity = 0.65;
    } else if (seed.cohort < 7) {
      const returning = stage === 3 && seed.cohort % 2 === 0;
      const travel = returning ? 1 - phase : phase;
      const [endX, endY] = spokeCenter(seed.branch);
      // Tangential paths leave the Hub rim, keeping its centre open and legible.
      const startX = HUB_CENTER[0] + 0.48;
      const startY = (seed.branch - 1) * 0.14;
      const bow = Math.sin(travel * Math.PI) * (returning ? -0.13 : 0.13);
      x = startX + (endX - startX) * travel + sphereX * 0.012;
      y = startY + (endY - startY) * travel + bow + sphereY * 0.012;
      z = Math.sin(travel * Math.PI) * (returning ? -0.12 : 0.12);
      intensity = Math.sin(Math.PI * travel) * 0.65;
    } else {
      const [centerX, centerY] = spokeCenter(seed.branch);
      const radius = 0.16 + seed.radius ** 2 * 0.065;
      x = centerX + Math.cos(azimuth) * radius;
      y = centerY + Math.sin(azimuth) * radius * 0.8;
      z = sphereZ * 0.08;
      intensity = 0.55;
    }
  } else if (stage === 4) {
    if (seed.cohort < 3) {
      x = ringX * 0.8;
      y = ringY * 0.8;
      z = sphereZ * 0.1;
    } else if (seed.cohort < 7) {
      const angle = seed.angle + time * (seed.cohort % 2 ? 0.12 : -0.1);
      const radius = 1.12 + sphereZ * 0.025;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius * 0.43 + x * (seed.cohort % 2 ? 0.12 : -0.12);
      z = Math.sin(angle) * radius * (seed.cohort % 2 ? 0.55 : -0.55);
      intensity = 0.5;
    } else {
      const side = seed.cohort % 2 ? 1 : -1;
      x = side * 1.04 + Math.cos(azimuth) * 0.14;
      y = side * 0.32 + Math.sin(azimuth) * 0.11;
      z = sphereZ * 0.08;
    }
  } else if (stage === 5) {
    if (seed.cohort < 4) {
      x = ringX;
      y = ringY;
      z = sphereZ * 0.12;
    } else {
      const lane = (seed.cohort - 4) * (TAU / 6);
      const radius = 0.48 + phase * 0.82;
      const angle = lane + Math.sin(phase * Math.PI) * 0.65;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      z = Math.sin(phase * TAU + seed.angle) * 0.14;
      intensity = Math.sin(Math.PI * phase) * 0.6;
    }
  } else {
    // A porous spherical envelope contains the network; no solid case or plate.
    const inner = seed.cohort < 4;
    const radius = inner ? 0.55 + seed.radius * 0.12 : 1.22 + (seed.radius - 0.5) * 0.025;
    x = Math.cos(azimuth) * equator * radius;
    y = Math.sin(azimuth) * equator * radius * 0.9;
    z = seed.latitude * radius;
    intensity = inner ? 0.4 : 0.32 + (1 - Math.abs(seed.latitude)) * 0.5;
  }
  output[0] = x;
  output[1] = y;
  output[2] = z;
  output[3] = intensity;
};
