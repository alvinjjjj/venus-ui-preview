import { create } from 'zustand';

export type GlassPreviewMode = 'v1' | 'v5' | 'explorer';

// Keep preview materials and page compositions independent. New uses the
// existing component material system while Explorer retains Original.
export const previewDesignByMode: Record<GlassPreviewMode, 'v1' | 'v5'> = {
  v1: 'v1',
  v5: 'v5',
  explorer: 'v1',
};

// New and Explorer use their landing compositions while Original keeps the existing page.
export const landingDesignByMode: Record<GlassPreviewMode, 'v1' | 'v5'> = {
  v1: 'v1',
  v5: 'v5',
  explorer: 'v5',
};

const getInitialMode = (): GlassPreviewMode => {
  const saved = localStorage.getItem('venus-glass-version');
  if (saved === 'v1' || saved === 'v5' || saved === 'explorer') return saved;
  // Previously selected V3/V4 now open in New instead of a removed preview mode.
  return saved === 'v3' || saved === 'v6' ? 'v5' : 'v1';
};

export const useGlassPreview = create<{
  mode: GlassPreviewMode;
  setMode: (mode: GlassPreviewMode) => void;
}>(set => ({
  mode: getInitialMode(),
  setMode: mode => set({ mode }),
}));
