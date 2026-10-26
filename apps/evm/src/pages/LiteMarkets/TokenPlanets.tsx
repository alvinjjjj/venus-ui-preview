import { useState } from 'react';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { Button } from '@venusprotocol/ui';
import { createPortal } from 'react-dom';
import { useIsMdDown } from 'hooks/responsive';
import { PlanetSurface } from './PlanetSurface';
import wbethPlanetMark from './wbeth-planet-mark.svg';
import type { LiteAsset } from './data';

const preferred = ['USDT', 'USDC', 'sUSDe', 'DAI', 'BTCB', 'WBNB', 'ETH', 'WBETH'];

/** Discovery shortcuts use the same asset/market data as the transaction form. */
export function TokenPlanets({ rows, onSelect }: {
  rows: LiteAsset[];
  onSelect: (row: LiteAsset, marketId: string) => void;
}) {
  const compact = useIsMdDown();
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const [open, setOpen] = useState<string>();
  const assets = [...rows].sort((a, b) => {
    const rank = (symbol: string) => preferred.includes(symbol) ? preferred.indexOf(symbol) : preferred.length;
    return rank(a.token.symbol) - rank(b.token.symbol);
  }).slice(0, compact ? 4 : 8);
  const content = (
    <aside className="lite-token-planets" aria-label="Explore Earn APYs">
      {assets.map((row, index) => (
        <div key={row.key} className={`lite-token-planet lite-token-planet--${index + 1}`} data-open={open === row.key} data-planet-surface="true" data-token={row.token.symbol} data-ring={row.token.symbol === 'USDC' || row.token.symbol === 'DAI'}
          onMouseEnter={() => setOpen(row.key)}
          onMouseLeave={() => setOpen(undefined)}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(undefined); }}
          onKeyDown={event => { if (event.key === 'Escape') { setOpen(undefined); event.stopPropagation(); } }}>
          <button className="lite-token-planet-orb" type="button" aria-label={`View ${row.token.symbol} supply APY`}
            aria-expanded={open === row.key} aria-controls={`planet-${index}`}
            onFocus={() => setOpen(row.key)} onClick={() => setOpen(row.key)}>
            <span className="lite-token-ring lite-token-ring--back" aria-hidden="true" />
            <PlanetSurface symbol={row.token.symbol} />
            <img className="lite-token-original-mark" src={row.token.symbol === 'WBETH' ? wbethPlanetMark : row.token.iconSrc} alt={row.token.symbol} />
            <span className="lite-token-ring lite-token-ring--front" aria-hidden="true" />
          </button>
          {open === row.key && <div id={`planet-${index}`} className="lite-token-planet-detail" role="dialog" aria-label={`${row.token.symbol} supply APY`}>
            <strong className="lite-token-planet-title">{row.token.symbol}</strong>
            {!isFinal && <button className="lite-token-planet-close" type="button" aria-label="Close asset details" onClick={() => setOpen(undefined)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>}
            <div className="lite-token-planet-columns"><span>Market</span><span>Supply APY</span></div>
            {row.markets.map(market => (
              <div className="lite-token-planet-market" key={market.id}>
                <span>{market.asset ? 'Core Pool' : row.markets.filter(item => item.hub).length === 1 ? 'Liquidity Hub' : market.name}</span>
                <span className="lite-token-planet-rate"><strong>{market.apy.isFinite() ? `${market.apy.toFixed(2)}%` : '—'}</strong></span>
              </div>
            ))}
            <Button material="blue-glass" className="lite-token-planet-earn" onClick={() => {
              const initialMarket = row.markets.find(market => market.asset) ?? row.markets[0];
              if (initialMarket) onSelect(row, initialMarket.id);
              setOpen(undefined);
            }}>Earn now</Button>
          </div>}
        </div>
      ))}
    </aside>
  );
  return compact ? content : createPortal(content, document.body);
}
