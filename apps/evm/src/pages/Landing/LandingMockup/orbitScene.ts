import type { OrbitSettings } from './motionStore';
import { getFlowTiming } from './motionTimeline';

// Rings, particles and sphere meshes share this screen-space projection.
export function orbitEase(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
export function getOrbitPose(orbit: OrbitSettings, progress: number, reducedMotion = false) {
  const timing = getFlowTiming(orbit);
  const turn = reducedMotion ? 1 : orbitEase(timing.expanded, timing.settled, progress);
  return {
    rotation: (orbit.rotation * turn * Math.PI) / 180,
    tilt: ((90 + (orbit.tilt - 90) * turn) * Math.PI) / 180,
  };
}
export function getOrbitRadius(unit: number, ring: number, rings: number) {
  // The innermost orbit stays outside the physical center sphere.
  return unit * (0.16 + (ring / Math.max(rings - 1, 1)) * 0.19);
}
export function projectOrbit(
  radius: number,
  phase: number,
  pose: { rotation: number; tilt: number },
) {
  const x = Math.cos(phase) * radius;
  const y = Math.sin(phase) * radius * Math.sin(pose.tilt);
  return {
    x: x * Math.cos(pose.rotation) - y * Math.sin(pose.rotation),
    y: x * Math.sin(pose.rotation) + y * Math.cos(pose.rotation),
    z: Math.sin(phase) * radius * Math.cos(pose.tilt),
  };
}
// Preserve the accepted center size. Satellite sizes span 30% largest-to-smallest.
export const orbitCoreRadius = 0.078;
const satelliteRadius = orbitCoreRadius / 2;
// Use the inner paths so the approved wide orbit leaves room for complete spheres.
export const orbitSatellites = [
  {
    phase: 3.9,
    ring: 0.5,
    radius: satelliteRadius * 0.9,
    color: 'smoke',
    symbol: 'U',
    markScale: 1.12,
  },
  {
    phase: 5.55,
    ring: 0.75,
    radius: satelliteRadius * 1.08,
    color: 'green',
    symbol: 'USDT',
    markScale: 1.5,
  },
  {
    phase: 0.75,
    ring: 0.75,
    radius: satelliteRadius * 1.17,
    color: 'charcoal',
    symbol: 'BNB',
    markScale: 1.5,
  },
  {
    phase: 2.25,
    ring: 0.5,
    radius: satelliteRadius,
    color: 'blue',
    symbol: 'USDC',
    markScale: 1.4,
  },
] as const;

export type OrbitSatellite = {
  phase: number;
  ring: number;
  radius: number;
  color: 'smoke' | 'green' | 'charcoal' | 'blue' | 'pearl' | 'amber' | 'orange' | 'violet';
  symbol: 'U' | 'USDT' | 'BNB' | 'USDC' | 'BTC' | 'ETH';
  markScale: number;
};

/**
 * Explorer: six assets, each in its own brand hue, 30% smaller than New's spheres
 * so the Venus core stays the focal point. Spaced 60deg apart; Explorer moves every
 * satellite in the same direction at the same angular speed, so they never pass
 * through one another.
 */
const explorerSatelliteRadius = satelliteRadius * 0.7;
export const explorerOrbitSatellites: readonly OrbitSatellite[] = [
  {
    phase: 0.3,
    ring: 0.5,
    radius: explorerSatelliteRadius,
    color: 'blue',
    symbol: 'USDC',
    markScale: 1.4,
  },
  {
    phase: 1.35,
    ring: 0.75,
    radius: explorerSatelliteRadius * 1.1,
    color: 'orange',
    symbol: 'BTC',
    markScale: 1.5,
  },
  {
    phase: 2.4,
    ring: 0.5,
    radius: explorerSatelliteRadius * 0.9,
    color: 'pearl',
    symbol: 'U',
    markScale: 1.12,
  },
  {
    phase: 3.45,
    ring: 0.75,
    radius: explorerSatelliteRadius * 1.05,
    color: 'green',
    symbol: 'USDT',
    markScale: 1.5,
  },
  {
    phase: 4.5,
    ring: 0.5,
    radius: explorerSatelliteRadius * 1.15,
    color: 'amber',
    symbol: 'BNB',
    markScale: 1.5,
  },
  {
    phase: 5.55,
    ring: 0.75,
    radius: explorerSatelliteRadius,
    color: 'violet',
    symbol: 'ETH',
    markScale: 1.45,
  },
];

export const getOrbitSatellites = (explorer: boolean): readonly OrbitSatellite[] =>
  explorer ? explorerOrbitSatellites : orbitSatellites;
