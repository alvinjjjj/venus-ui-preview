import { create } from 'zustand';
import explorerStars from './explorer-stars.json';

export type FlowSettings = {
  lines: number;
  particles: number;
  speed: number;
};

// Frame 2 is independent of the original Hero stream and star settings.
export type OrbitSettings = {
  rotation: number;
  tilt: number;
  size: number;
  ringScale: number;
  rings: number;
  particles: number;
  particleSize: number;
  speed: number;
  brightness: number;
  spinSpeed: number;
  burst: number;
  contraction: number;
  hold: number;
  travel: number;
  showContent: boolean;
  texture: 'satin' | 'frost' | 'polished';
};
export const defaultOrbitSettings: OrbitSettings = {
  rotation: -8,
  tilt: 15,
  size: 1.6,
  ringScale: 1.5,
  rings: 5,
  particles: 370,
  particleSize: 1,
  speed: 0.7,
  brightness: 1,
  spinSpeed: 0.7,
  burst: 1.15,
  contraction: 1,
  hold: 0.5,
  travel: 1,
  showContent: true,
  texture: 'frost',
};

export type ExplorerStarTuning = {
  stars: number;
  brightness: number;
  size: number;
  twinkle: number;
  drift: number;
  warmth: number;
};

export const defaultFlowSettings: FlowSettings = { lines: 32, particles: 370, speed: 0.7 };
export const defaultExplorerStarTuning: ExplorerStarTuning = {
  stars: Object.values(explorerStars.settings.counts).reduce((total, count) => total + count, 0),
  brightness: 1,
  size: 1,
  twinkle: explorerStars.settings.twinkle.share,
  drift: explorerStars.settings.drift.speed,
  warmth: explorerStars.settings.colors.warmShare,
};

export const useLandingMotion = create<{
  previewFrame: 1 | 2;
  setPreviewFrame: (frame: 1 | 2) => void;
  flow: FlowSettings;
  stars: ExplorerStarTuning;
  orbit: OrbitSettings;
  setOrbit: (orbit: OrbitSettings) => void;
  resetOrbit: () => void;
  setFlow: (flow: FlowSettings) => void;
  setStars: (stars: ExplorerStarTuning) => void;
  reset: () => void;
}>(set => ({
  previewFrame: 1,
  setPreviewFrame: previewFrame => set({ previewFrame }),
  orbit: defaultOrbitSettings,
  setOrbit: orbit => set({ orbit }),
  resetOrbit: () => set({ orbit: defaultOrbitSettings }),
  flow: defaultFlowSettings,
  stars: defaultExplorerStarTuning,
  setFlow: flow => set({ flow }),
  setStars: stars => set({ stars }),
  reset: () => set({ flow: defaultFlowSettings, stars: defaultExplorerStarTuning }),
}));
