import { create } from 'zustand';
import { type GlassPreviewMode, resolveSavedPreviewMode } from './variants';

export type { GlassPreviewMode } from './variants';

// E inherits Original materials; its Lite layout remains independently scoped.
export const isNewDesignMode = (mode: GlassPreviewMode) => mode === 'v5' || mode === 'explorer';
export const isExplorerMode = isNewDesignMode;

export const previewDesignByMode: Record<GlassPreviewMode, 'v1' | 'v5'> = {
  v1: 'v1',
  v5: 'v5',
  explorer: 'v5',
  'lite-experiment': 'v1',
  'lite-experiment-v2': 'v1',
  'lite-experiment-v2-legacy': 'v1',
  'lite-experiment-v3': 'v1',
};

// New and Explorer use their landing compositions while Original keeps the existing page.
export const landingDesignByMode: Record<GlassPreviewMode, 'v1' | 'v5'> = {
  v1: 'v1',
  v5: 'v5',
  explorer: 'v5',
  'lite-experiment': 'v1',
  'lite-experiment-v2': 'v1',
  'lite-experiment-v2-legacy': 'v1',
  'lite-experiment-v3': 'v1',
};

const getInitialMode = (): GlassPreviewMode => {
  try {
    return resolveSavedPreviewMode(localStorage.getItem('venus-glass-version'));
  } catch {
    return 'v1';
  }
};

export const useGlassPreview = create<{
  mode: GlassPreviewMode;
  setMode: (mode: GlassPreviewMode) => void;
}>(set => ({
  mode: getInitialMode(),
  setMode: mode => set({ mode: mode === 'lite-experiment' || mode === 'explorer' || mode === 'v5' ? 'lite-experiment-v2' : mode }),
}));
