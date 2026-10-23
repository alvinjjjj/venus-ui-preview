import { useLocation } from 'react-router';
import { create } from 'zustand';
import { useGlassPreview } from './GlassVersions/store';
import { isProPage } from './InterfaceOnboarding/policy';

export const useInterfaceModeStore = create<{
  mode: 'lite' | 'pro';
  setMode: (mode: 'lite' | 'pro') => void;
}>(set => ({
  mode: 'lite',
  setMode: mode => set({ mode }),
}));

// Lite / Pro select a public browsing surface, independently of wallet access.
export const useInterfaceMode = () => {
  const preview = useGlassPreview(state => state.mode);
  const supportsModes = preview === 'v1' || preview === 'v5' || preview === 'lite-experiment';
  const { mode, setMode } = useInterfaceModeStore();
  const { state, pathname } = useLocation();
  // The destination and its mode commit in the same router update. Never mutate
  // the visible page's mode while React is still preparing the next route.
  const routeMode = state?.interfaceMode;
  const committedMode =
    routeMode === 'lite' || routeMode === 'pro' ? routeMode : isProPage(pathname) ? 'pro' : mode;
  return {
    supportsModes,
    isNew: preview === 'v5',
    mode: committedMode,
    isLite: supportsModes && committedMode === 'lite',
    setMode,
  };
};
