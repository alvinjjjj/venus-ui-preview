import { create } from 'zustand';

export type GlassPreviewMode = 'v1' | 'v5' | 'explorer';

// Keep preview materials and page compositions independent. Explorer shares
// New's component material system (buttons, cards, dropdowns); it only differs
// in page composition: New keeps the acrylic stack; Explorer tells the story with particle fields.
// New now mirrors Explorer: both render the Explorer landing and Explorer component accents.
// The two buttons stay so the switcher keeps its layout; Original remains the baseline.
export const isExplorerMode = (mode: GlassPreviewMode) => mode === 'explorer' || mode === 'v5';

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
