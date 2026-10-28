import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { Button } from '@venusprotocol/ui';
import { createPortal } from 'react-dom';
import { useIsMdDown } from 'hooks/responsive';
import { AsciiTokenMark } from './AsciiTokenMark';
import { AsciiPlanet } from './AsciiPlanet';
import { palettes, PlanetSurface } from './PlanetSurface';
import wbethPlanetMark from './wbeth-planet-mark.svg';
import type { LiteAsset } from './data';
import { getPlanetPopupPosition } from './planet-popup-position';

const preferred = ['USDT', 'USDC', 'sUSDe', 'DAI', 'BTCB', 'WBNB', 'ETH', 'WBETH'];

/** Discovery shortcuts use the same asset/market data as the transaction form. */
export function TokenPlanets({ rows, onSelect }: {
  rows: LiteAsset[];
  onSelect: (row: LiteAsset, marketId: string) => void;
}) {
  const ascii = useGlassPreview(state => state.mode === 'lite-experiment-v2-legacy' || state.mode === 'lite-experiment-v2');
  const compact = useIsMdDown();
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const [open, setOpen] = useState<string>();
  const [replay, setReplay] = useState({ key: '', count: 0 });
  const [popupPosition, setPopupPosition] = useState<CSSProperties>();
  const planetRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelClose = () => clearTimeout(closeTimer.current);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useLayoutEffect(() => {
    if (!open || !ascii) return;
    const planet = planetRefs.current[open];
    const orb = planet?.querySelector<HTMLButtonElement>('.lite-token-planet-orb');
    const panel = planet?.querySelector<HTMLDivElement>('.lite-token-planet-detail');
    if (!orb || !panel) return;
    const update = () => {
      const style = getComputedStyle(panel);
      // The existing compact card padding is one spacing step for the gap,
      // and two steps for the viewport safety gutter.
      const gap = Number.parseFloat(style.paddingInlineStart);
      const position = getPlanetPopupPosition({
        anchor: orb.getBoundingClientRect(),
        panel: {
          width: panel.getBoundingClientRect().width,
          height: panel.scrollHeight + Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth),
        },
        viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
        gutter: gap * 2,
        gap,
      });
      setPopupPosition({ position: 'fixed', right: 'auto', bottom: 'auto', ...position, overflowY: 'auto' });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    observer.observe(orb);
    orb.addEventListener('transitionend', update);
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); orb.removeEventListener('transitionend', update); window.removeEventListener('resize', update); };
  }, [open, ascii]);
  const assets = [...rows].sort((a, b) => {
    const rank = (symbol: string) => preferred.includes(symbol) ? preferred.indexOf(symbol) : preferred.length;
    return rank(a.token.symbol) - rank(b.token.symbol);
  }).slice(0, compact ? 4 : 8);
  const content = (
    <aside className="lite-token-planets" aria-label="Explore Earn APYs">
      {assets.map((row, index) => (
        <div key={row.key} ref={node => { planetRefs.current[row.key] = node; }} className={`lite-token-planet lite-token-planet--${index + 1}`} data-open={open === row.key} data-planet-surface="true" data-token={row.token.symbol} data-ring={row.token.symbol === 'USDC' || row.token.symbol === 'DAI'}
          onMouseEnter={() => { cancelClose(); setOpen(row.key); }}
          onMouseLeave={() => { closeTimer.current = setTimeout(() => setOpen(undefined), 150); }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(undefined); }}
          onKeyDown={event => { if (event.key === 'Escape') { setOpen(undefined); event.stopPropagation(); } }}>
          <button className="lite-token-planet-orb" type="button" aria-label={`View ${row.token.symbol} supply APY`}
            aria-expanded={open === row.key} aria-controls={`planet-${index}`}
            onFocus={() => { cancelClose(); setOpen(row.key); }} onClick={() => { cancelClose(); setOpen(row.key); setReplay(previous => ({ key: row.key, count: previous.count + 1 })); }}>
            <span className="lite-token-ring lite-token-ring--back" aria-hidden="true" />
            {ascii ? <AsciiPlanet color={(palettes[row.token.symbol] ?? palettes.USDC)[1]} highlight={(palettes[row.token.symbol] ?? palettes.USDC)[0]} shadow={(palettes[row.token.symbol] ?? palettes.USDC)[2]} active={open === row.key} replayToken={replay.key === row.key ? replay.count : 0} surface="rim" glyphScale={1.1} /> : <PlanetSurface symbol={row.token.symbol} />}
            {ascii ? <AsciiTokenMark src={row.token.symbol === 'WBETH' ? wbethPlanetMark : row.token.iconSrc} symbol={row.token.symbol} color={(palettes[row.token.symbol] ?? palettes.USDC)[2]} highlight={(palettes[row.token.symbol] ?? palettes.USDC)[0]} glyphScale={1.1} active={open === row.key} replayToken={replay.key === row.key ? replay.count : 0} /> : <img className="lite-token-original-mark" src={row.token.symbol === 'WBETH' ? wbethPlanetMark : row.token.iconSrc} alt={row.token.symbol} />}
            <span className="lite-token-ring lite-token-ring--front" aria-hidden="true" />
          </button>
          {open === row.key && <div id={`planet-${index}`} className="lite-token-planet-detail" role="dialog" aria-label={`${row.token.symbol} supply APY`} style={ascii ? popupPosition : undefined}>
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
