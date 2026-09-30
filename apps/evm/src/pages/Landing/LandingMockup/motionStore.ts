import { create } from 'zustand';
import explorerStars from './explorer-stars.json';

export type FlowSettings = {
  lines: number;
  particles: number;
  speed: number;
};

export type ExplorerStarTuning = {
  stars: number;
  brightness: number;
  size: number;
  twinkle: number;
  drift: number;
  crossStars: number;
  warmth: number;
};

export const defaultFlowSettings: FlowSettings = { lines: 32, particles: 370, speed: 0.7 };
export const defaultExplorerStarTuning: ExplorerStarTuning = {
  stars: Object.values(explorerStars.settings.counts).reduce((total, count) => total + count, 0),
  brightness: 1,
  size: 1,
  twinkle: explorerStars.settings.twinkle.share,
  drift: explorerStars.settings.drift.speed,
  crossStars: explorerStars.settings.crossStars.count,
  warmth: explorerStars.settings.colors.warmShare,
};

export const useLandingMotion = create<{
  flow: FlowSettings;
  stars: ExplorerStarTuning;
  setFlow: (flow: FlowSettings) => void;
  setStars: (stars: ExplorerStarTuning) => void;
  reset: () => void;
}>(set => ({
  flow: defaultFlowSettings,
  stars: defaultExplorerStarTuning,
  setFlow: flow => set({ flow }),
  setStars: stars => set({ stars }),
  reset: () => set({ flow: defaultFlowSettings, stars: defaultExplorerStarTuning }),
}));
