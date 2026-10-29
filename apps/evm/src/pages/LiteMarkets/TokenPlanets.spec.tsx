import { fireEvent, screen } from '@testing-library/react';
import { poolData } from '__mocks__/models/pools';
import { renderComponent } from 'testUtils/render';
import { TokenPlanets } from './TokenPlanets';
import { aggregateLiteAssets } from './data';
import venusPlanetMark from '../Landing/LandingMockup/assets/venus-mark-white.svg';

const viewport = vi.hoisted(() => ({ wide: true, compact: false, mode: 'lite-experiment-v2' }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => viewport.wide }));
vi.mock('hooks/responsive', () => ({ useIsMdDown: () => viewport.compact }));
vi.mock('demo/GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) => selector(viewport),
}));
vi.mock('./AsciiPlanet', () => ({ AsciiPlanet: () => <canvas data-testid="ascii-planet" /> }));
vi.mock('./AsciiTokenMark', () => ({
  AsciiTokenMark: ({ src, symbol }: { src: string; symbol: string }) =>
    <img src={src} alt={symbol} data-testid="ascii-mark" />,
}));
vi.mock('./planet-popup-position', () => ({
  getPlanetPopupPosition: () => ({ left: 16, top: 16, maxHeight: 600 }),
}));

const pool = poolData[0];
const base = aggregateLiteAssets(pool.assets, [], pool.comptrollerAddress)[0];
const symbols = [
  'USDT',
  'USDC',
  'U',
  'XVS',
  'BTCB',
  'BNB',
  'WBNB',
  'ETH',
  'USD1',
  'sUSDe',
  'DAI',
  'WBETH',
];
const rows = symbols.map(symbol => ({
  ...base,
  key: symbol,
  token: { ...base.token, symbol },
}));
const visibleTokens = () =>
  [...document.querySelectorAll('.lite-token-planet')].map(element =>
    element.getAttribute('data-token'),
  );

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterAll(() => vi.unstubAllGlobals());
beforeEach(() => {
  viewport.wide = true;
  viewport.compact = false;
  viewport.mode = 'lite-experiment-v2';
});

it.each(['lite-experiment-v2', 'lite-experiment-v2-legacy', 'lite-experiment-v3'])('shows the eight requested wide-screen assets in %s with USDT and USDC in foreground slots', mode => {
  viewport.mode = mode;
  renderComponent(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  expect(visibleTokens()).toEqual(['USDT', 'USDC', 'U', 'XVS', 'BTCB', 'WBNB', 'ETH', 'USD1']);
});

it.each(['lite-experiment-v2', 'lite-experiment-v2-legacy', 'lite-experiment-v3'])('uses the six compact-desktop assets and the native BNB row in %s', mode => {
  viewport.mode = mode;
  viewport.wide = false;
  renderComponent(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  expect(visibleTokens()).toEqual(['USDT', 'USDC', 'U', 'XVS', 'BTCB', 'BNB']);
  expect(screen.queryByRole('button', { name: 'View WBNB supply APY' })).toBeNull();
});

it('dismisses a removed satellite popup when resizing between compositions', () => {
  const { rerender } = renderComponent(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'View WBNB supply APY' }));
  expect(screen.getByRole('dialog', { name: 'WBNB supply APY' })).toBeVisible();
  viewport.wide = false;
  rerender(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'View BNB supply APY' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

it.each(['lite-experiment-v2', 'lite-experiment-v2-legacy', 'lite-experiment-v3'])('routes a new satellite to its own existing market through Earn now in %s', mode => {
  viewport.mode = mode;
  const onSelect = vi.fn();
  renderComponent(<TokenPlanets rows={rows} onSelect={onSelect} />);
  const xvs = rows.find(row => row.token.symbol === 'XVS');
  if (!xvs) throw new Error('XVS fixture is required');
  fireEvent.click(screen.getByRole('button', { name: 'View XVS supply APY' }));
  fireEvent.click(screen.getByRole('button', { name: 'Earn now' }));
  expect(onSelect).toHaveBeenCalledExactlyOnceWith(xvs, xvs.markets[0].id);
});

it('omits unavailable assets instead of filling their slots with another token', () => {
  renderComponent(<TokenPlanets rows={[rows[0], rows[0]]} onSelect={vi.fn()} />);
  expect(visibleTokens()).toEqual(['USDT']);
});

it.each(['lite-experiment-v2-legacy', 'lite-experiment-v3'])('shares gradient spheres and complete Venus emblems in %s', mode => {
  viewport.mode = mode;
  renderComponent(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  expect(visibleTokens()).toEqual(['USDT', 'USDC', 'U', 'XVS', 'BTCB', 'WBNB', 'ETH', 'USD1']);
  expect(document.querySelectorAll('.lite-token-sphere')).toHaveLength(8);
  expect(screen.getByRole('img', { name: 'USD1' })).toHaveClass('lite-token-original-mark');
  expect(screen.getByRole('img', { name: 'XVS' })).toHaveClass('lite-token-original-mark');
  expect(screen.getByRole('img', { name: 'XVS' })).toHaveAttribute('src', venusPlanetMark);
  expect(screen.queryAllByTestId('ascii-planet')).toHaveLength(0);
});

it('preserves Final ASCII rendering and its existing token artwork', () => {
  renderComponent(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  expect(screen.getAllByTestId('ascii-planet')).toHaveLength(8);
  expect(document.querySelectorAll('.lite-token-sphere')).toHaveLength(0);
  expect(screen.getByRole('img', { name: 'XVS' })).toHaveAttribute('src', base.token.iconSrc);
});

it('does not mount invisible Final canvases on mobile and restores them on desktop', () => {
  viewport.compact = true;
  const { rerender } = renderComponent(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  expect(screen.queryByLabelText('Explore Earn APYs')).toBeNull();
  expect(screen.queryAllByTestId('ascii-planet')).toHaveLength(0);
  viewport.compact = false;
  rerender(<TokenPlanets rows={rows} onSelect={vi.fn()} />);
  expect(screen.getAllByTestId('ascii-planet')).toHaveLength(8);
});
