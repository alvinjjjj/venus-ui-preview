import { create } from 'zustand';
import type { InterfaceIntroduction } from './policy';

// Transient replay requests survive Footer/controller remounts. No persistence.
export const useIntroductionPreview = create<{
  request: { variant: InterfaceIntroduction } | null;
  preview: (variant: InterfaceIntroduction) => void;
  clear: () => void;
}>(set => ({
  request: null,
  preview: variant => set({ request: { variant } }),
  clear: () => set({ request: null }),
}));
