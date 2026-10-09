/** Local preview state; pan is a fraction of the canvas, independent of screen size. */
export type StackInteraction = 'rotate' | 'move';
export interface StackPan {
  x: number;
  y: number;
}
export interface StackStudio {
  exposure: number;
  shadow: number;
  reflection: number;
}
export const DEFAULT_STUDIO: StackStudio = { exposure: 1, shadow: 0.22, reflection: 0.06 };
export const STUDIO_PRESETS = {
  soft: DEFAULT_STUDIO,
  contrast: { exposure: 0.8, shadow: 0.34, reflection: 0.025 },
  bright: { exposure: 1.25, shadow: 0.14, reflection: 0.1 },
} satisfies Record<string, StackStudio>;
