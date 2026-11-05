import { create } from 'zustand';

// Lite borrow modal: the collateral list offers "BNB (WBNB market)" next to WBNB (same as FE).
// Picking it keeps WBNB as the collateral market but makes the Supply form start on native BNB.
export const useLiteNativeCollateralStore = create<{
  nativeForVToken?: string;
  set: (nativeForVToken?: string) => void;
}>()(set => ({
  set: nativeForVToken => set({ nativeForVToken }),
}));

export const NATIVE_SUFFIX = '#native';
