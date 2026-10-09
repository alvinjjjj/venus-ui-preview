import { createContext } from 'react';

/**
 * Section-wide state shared with every step's card deck: the Human / Venus AI
 * Agent mode is chosen once in the section header, and each deck reports
 * whether it is playing so the current point can show its progress.
 */
export const VisualModeContext = createContext<{
  agent: boolean;
  onPlayingChange?: (playing: boolean) => void;
}>({ agent: false });
