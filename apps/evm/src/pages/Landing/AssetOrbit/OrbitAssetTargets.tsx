import { isExplorerMode, useGlassPreview } from 'demo/GlassVersions/store';
import { useNavigate } from 'hooks/useNavigate';
import { useEffect, useState } from 'react';
import { type OrbitProduct, orbitCoreProduct, orbitProducts } from '../LandingMockup/orbitProducts';
import { getOrbitSatellites } from '../LandingMockup/orbitScene';

// Interaction mock-up only. Replace with asset-specific live Supply APY later.
// BTC and ETH appear in Explorer only.
const exampleRates = {
  USDC: '5.24%',
  USDT: '4.86%',
  U: '6.12%',
  BNB: '2.38%',
  BTC: '0.42%',
  ETH: '2.15%',
};

export const OrbitAssetTargets: React.FC<{
  selectLabel: string;
  rateLabel: string;
  /** New: hint under a product name, e.g. "Double-click to open". */
  hintLabel: string;
  ready: boolean;
}> = ({ selectLabel, rateLabel, hintLabel, ready }) => {
  const explorer = useGlassPreview(state => isExplorerMode(state.mode));
  // New: the spheres are Venus products (plus Venus Core in the centre). Hover shows the
  // name; double-click opens the product.
  const products = useGlassPreview(state => state.mode === 'v5');
  const { navigate } = useNavigate();
  const orbitSatellites = getOrbitSatellites(explorer);
  const openProduct = (product: OrbitProduct) => {
    if (product.to) navigate(product.to);
    else if (product.href) window.open(product.href, '_blank', 'noopener,noreferrer');
  };
  const targets = [
    ...orbitSatellites.map(item => ({
      symbol: item.symbol as string,
      product: products ? orbitProducts[item.symbol] : undefined,
    })),
    ...(products ? [{ symbol: 'CORE', product: orbitCoreProduct }] : []),
  ];
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = ready ? hovered ?? focused ?? pinned : null;
  useEffect(() => {
    if (!ready) {
      setHovered(null);
      setFocused(null);
      setPinned(null);
    }
  }, [ready]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('flow-asset-hover', { detail: active }));
    return () => {
      window.dispatchEvent(new CustomEvent('flow-asset-hover', { detail: null }));
    };
  }, [active]);
  useEffect(() => {
    const clearSelection = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.asset-orbit__target'))
        setPinned(null);
    };
    window.addEventListener('pointerdown', clearSelection);
    return () => window.removeEventListener('pointerdown', clearSelection);
  }, []);
  return (
    <div className="asset-orbit__targets" role="group" aria-label={selectLabel}>
      {targets.map(({ symbol, product }) => (
        <button
          type="button"
          key={symbol}
          className="asset-orbit__target"
          data-symbol={symbol}
          data-active={active === symbol}
          aria-pressed={pinned === symbol}
          aria-label={
            product
              ? `${product.name}: ${hintLabel}`
              : `${selectLabel} ${symbol}: ${rateLabel} ${
                  exampleRates[symbol as keyof typeof exampleRates]
                }`
          }
          onPointerEnter={() => setHovered(symbol)}
          onPointerLeave={() => setHovered(null)}
          onPointerDown={() => setFocused(null)}
          onClick={() => setPinned(previous => (previous === symbol ? null : symbol))}
          onDoubleClick={product ? () => openProduct(product) : undefined}
          onFocus={event => {
            if (event.currentTarget.matches(':focus-visible')) setFocused(symbol);
          }}
          onBlur={() => setFocused(null)}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              setHovered(null);
              setFocused(null);
              setPinned(null);
            }
            if (product && event.key === 'Enter') openProduct(product);
          }}
        >
          <span className="asset-orbit__yield" aria-hidden="true">
            {product ? (
              <>
                <strong>{product.name}</strong>
                <small>{hintLabel}</small>
              </>
            ) : (
              <>
                <strong>
                  {symbol} <span>{exampleRates[symbol as keyof typeof exampleRates]}</span>
                </strong>
                <small>{rateLabel}</small>
              </>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};
