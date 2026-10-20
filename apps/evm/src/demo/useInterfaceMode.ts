import { create } from 'zustand';
import { useLocation } from 'react-router';
import { useAccountAddress } from 'libs/wallet';
import { useGlassPreview } from './GlassVersions/store';

export const useInterfaceModeStore = create<{
  mode: 'lite' | 'pro';
  setMode: (mode: 'lite' | 'pro') => void;
}>(set => ({
  mode: 'lite',
  setMode: mode => set({ mode }),
}));

// O and New share the interface mode. E retains its existing navigation.
export const useInterfaceMode = () => {
  const preview = useGlassPreview(state => state.mode);
  const supportsModes = preview === 'v1' || preview === 'v5';
  const { accountAddress } = useAccountAddress();
  const { mode, setMode } = useInterfaceModeStore();
  const { state } = useLocation();
  // The destination and its mode commit in the same router update. Never mutate
  // the visible page's mode while React is still preparing the next route.
  const routeMode = state?.interfaceMode;
  const committedMode = routeMode === 'lite' || routeMode === 'pro' ? routeMode : mode;
  const effectiveMode = accountAddress ? committedMode : 'lite';
  return {
    supportsModes,
    isNew: preview === 'v5',
    mode: effectiveMode,
    isLite: supportsModes && effectiveMode === 'lite',
    setMode,
  };
};
