import { createContext, useContext } from 'react';
import { useGlassPreview } from 'demo/GlassVersions/store';

// A local design override keeps About Us independent of the app's preview mode.
export const LandingDesignContext = createContext(false);
export function useLandingDesignMode() {
  const about = useContext(LandingDesignContext);
  const mode = useGlassPreview(state => state.mode);
  return about ? 'v5' : mode;
}
