export type StackLayerId =
  | 'chains'
  | 'liquidityHub'
  | 'spokes'
  | 'borrowTrade'
  | 'vaultsPrime'
  | 'appSkills'
  | 'governance';

export interface StackLayer {
  id: StackLayerId;
  /** Rendered as separate tiles instead of one solid plate. */
  tiles?: boolean;
}

/**
 * Listed bottom of the stack first: 01 is the plate everything rests on,
 * the last entry is the cover that carries the Venus mark.
 * Names and copy live in the translation files (`landing.venusStack.*`),
 * read through `useStackCopy`, so they follow the site language.
 */
export const STACK_LAYERS: StackLayer[] = [
  { id: 'chains' },
  { id: 'liquidityHub' },
  { id: 'spokes', tiles: true },
  { id: 'borrowTrade' },
  { id: 'vaultsPrime' },
  { id: 'appSkills' },
  { id: 'governance' },
];

/**
 * Spoke markets the Liquidity Hub allocates into (the Hub's allocation
 * details list these three). Product names, so not translated.
 * Remaining tiles render as unlabelled open slots on purpose.
 */
export const SPOKES = ['Venus Core', 'Venus Flux', 'Fixed Rate'];

/** Total tiles on the spoke layer, live plus open. */
export const SPOKE_SLOTS = 4;

export const TILE_LAYER_INDEX = STACK_LAYERS.findIndex(layer => layer.tiles);
export const LID_INDEX = STACK_LAYERS.length - 1;

/**
 * Scroll distance per layer. The reference runs at ~580px per layer (368px per second);
 * 520 keeps seven layers at about the same total length the six had at 600.
 */
export const PX_PER_LAYER = 520;
