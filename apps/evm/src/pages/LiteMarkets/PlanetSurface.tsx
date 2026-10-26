import type { CSSProperties } from 'react';

// Local token illustration palettes, separate from interface design tokens.
const palettes: Record<string, [string, string, string]> = {
  USDT: ['#b4f1dc', '#259e83', '#103e49'],
  USDC: ['#c3e9ff', '#428bcc', '#172e5c'],
  sUSDe: ['#f5f4ef', '#a6b5c3', '#394858'],
  DAI: ['#fff0ba', '#d9aa52', '#76522f'],
  BTCB: ['#ffe3bb', '#d99b58', '#754235'],
  WBNB: ['#fff2bc', '#d4b44b', '#665432'],
  ETH: ['#e0defa', '#9398ce', '#393858'],
  WBETH: ['#f8e4c2', '#b79c68', '#575273'],
};

/** Pure gradient surface: no texture, canvas loop or bitmap planet assets. */
export function PlanetSurface({ symbol }: { symbol: string }) {
  const [light, mid, dark] = palettes[symbol] ?? palettes.USDC;
  return <span className="lite-token-sphere" aria-hidden="true" style={{
    '--planet-light': light, '--planet-mid': mid, '--planet-dark': dark,
  } as CSSProperties} />;
}
