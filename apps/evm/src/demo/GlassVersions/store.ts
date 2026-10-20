import { create } from 'zustand';

export type GlassPreviewMode = 'v1' | 'v5' | 'explorer';

// E inherits the current New design and demo behaviour. Individual studies use
// data-glass-study, so the baseline stays shared as New continues to evolve.
export const isNewDesignMode = (mode: GlassPreviewMode) => mode === 'v5' || mode === 'explorer';
export const isExplorerMode = isNewDesignMode;

export const previewDesignByMode: Record<GlassPreviewMode, 'v1' | 'v5'> = {
  v1: 'v1',
  v5: 'v5',
  explorer: 'v5',
};

// New and Explorer use their landing compositions while Original keeps the existing page.
export const landingDesignByMode: Record<GlassPreviewMode, 'v1' | 'v5'> = {
  v1: 'v1',
  v5: 'v5',
  explorer: 'v5',
};

const getInitialMode = (): GlassPreviewMode => {
  const saved = localStorage.getItem('venus-glass-version');
  // O2 is now the approved Original design; keep previously saved selections on O.
  if (saved === 'o2') return 'v1';
  if (saved === 'explorer') return 'v5';
  if (saved === 'v1' || saved === 'v5') return saved;
  // Previously selected V3/V4 now open in New instead of a removed preview mode.
  return saved === 'v3' || saved === 'v6' ? 'v5' : 'v1';
};

export const useGlassPreview = create<{
  mode: GlassPreviewMode;
  setMode: (mode: GlassPreviewMode) => void;
}>(set => ({
  mode: getInitialMode(),
  setMode: mode => set({ mode: mode === 'explorer' ? 'v5' : mode }),
}));
