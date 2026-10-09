import type { OrbitSettings } from './motionStore';

// Relative choreography weights keep every beat ordered when tuning the study.
// These are scene timing values, not global design tokens.
export function getFlowTiming(orbit: OrbitSettings) {
  const weights = [0.22, 0.16 * orbit.contraction, 0.04 * orbit.hold, 0.18, 0.18, 0.14];
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;
  const ends = weights.map(weight => {
    cursor += weight / total;
    return cursor;
  });
  return {
    arrival: ends[0],
    contracted: ends[1],
    burst: ends[2],
    expanded: ends[3],
    settled: ends[4],
  };
}
