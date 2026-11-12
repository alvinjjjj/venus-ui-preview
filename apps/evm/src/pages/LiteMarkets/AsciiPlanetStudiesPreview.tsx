import { useDemoTheme, useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import btcb from '../../../../../packages/chains/src/images/tokens/btcb.svg';
import susde from '../../../../../packages/chains/src/images/tokens/sUsdE.svg';
import usdc from '../../../../../packages/chains/src/images/tokens/usdc.svg';
import usdt from '../../../../../packages/chains/src/images/tokens/usdt.svg';
import '../../assets/styles/index.css';
import { AsciiPlanet } from './AsciiPlanet';
import { AsciiTokenMark } from './AsciiTokenMark';
import { palettes } from './PlanetSurface';
import { asciiPlanetStudies } from './ascii-planet-studies';
import './ascii-planet-studies.css';

const tokenArt: Record<string, string> = { USDT: usdt, sUSDe: susde, BTCB: btcb, USDC: usdc };

/** Comparison-only entry: reuse the actual E2 renderers at the same size. */
function AsciiPlanetStudiesPreview() {
  const light = useLiquidityLightPreview();
  const setTheme = useDemoTheme(state => state.setTheme);
  useLayoutEffect(() => {
    document.documentElement.dataset.liquidityTheme = light ? 'light' : 'dark';
  }, [light]);
  return (
    <main className="ascii-gradient-study" data-theme={light ? 'light' : 'dark'}>
      <header className="ascii-gradient-study-header">
        <div>
          <h1>ASCII 星球 · 四款方向</h1>
          <p>保留字元、Logo 同星環，只比較漸層同光源。</p>
        </div>
        <nav aria-label="Preview controls">
          <button type="button" onClick={() => setTheme(light ? 'dark' : 'light')}>
            {light ? 'Dark Mode' : 'Light Mode'}
          </button>
          <a href="/#/?chainId=56">返回 E2</a>
        </nav>
      </header>
      <div className="ascii-gradient-study-options">
        {Object.entries(asciiPlanetStudies).map(([symbol, study]) => (
          <figure key={symbol}>
            <div
              className="ascii-gradient-study-orb"
              role="img"
              aria-label={`${symbol} ${study.name}`}
            >
              <AsciiPlanet
                surface={study.surface}
                color={palettes[symbol][1]}
                highlight={palettes[symbol][0]}
                shadow={palettes[symbol][2]}
                active
                glyphScale={1.1}
              />
              <AsciiTokenMark
                src={tokenArt[symbol]}
                symbol={symbol}
                color={palettes[symbol][2]}
                highlight={palettes[symbol][0]}
                glyphScale={1.1}
              />
            </div>
            <figcaption>
              <span className="ascii-gradient-study-token">{symbol}</span>
              <h2>
                {study.id} · {study.name}
              </h2>
              <p>{study.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="ascii-gradient-study-note">
        四款表面都冇波紋；保留星環慢速運行。可揀一款，再統一套用。
      </p>
    </main>
  );
}

const root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <HashRouter>
      <AsciiPlanetStudiesPreview />
    </HashRouter>,
  );
