import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { poolData } from '__mocks__/models/pools';
import BigNumber from 'bignumber.js';
import { renderComponent } from 'testUtils/render';
import { TokenPlanetBackdrop } from './TokenPlanetBackdrop';
import { aggregateLiteAssets } from './data';
import { getE2ListToken } from './e2TokenIcons';

const viewport = vi.hoisted(() => ({ wide: true }));
vi.mock('hooks/responsive', async importOriginal => ({
  ...(await importOriginal<typeof import('hooks/responsive')>()),
  useBreakpointUp: (breakpoint: string) => breakpoint !== 'xl' || viewport.wide,
}));

const pool = poolData[0];
const rows = aggregateLiteAssets(pool.assets, [], pool.comptrollerAddress);
const getUsdt = () => {
  const row = rows.find(item => item.token.symbol === 'USDT');
  if (!row) throw new Error('USDT fixture is required');
  return row;
};
beforeEach(() => {
  viewport.wide = true;
});
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

it('reuses the current E2 icon without modifying shared token data', () => {
  const original = getUsdt().token;
  const originalSrc = original.iconSrc;
  const { container } = renderComponent(<TokenPlanetBackdrop rows={rows} onEarn={vi.fn()} />);
  const image = container.querySelector('[data-token="USDT"] img');
  expect(image).toHaveAttribute('src', getE2ListToken(original).iconSrc);
  expect(image).toHaveAttribute('alt', '');
  expect(original.iconSrc).toBe(originalSrc);
  expect(screen.getByRole('button', { name: 'View USDT supply APY' })).toHaveAttribute(
    'aria-haspopup',
    'dialog',
  );
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('opens a shared frosted surface with the list APY and one Earn now action', () => {
  renderComponent(<TokenPlanetBackdrop rows={rows} onEarn={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'View USDT supply APY' }));
  const card = screen.getByRole('dialog', { name: 'USDT supply APY' });
  expect(card.closest('.venus-dropdown-surface')).toHaveClass('lite-e2-planet-popover');
  expect(within(card).getByText('Supply APY')).toBeVisible();
  for (const market of getUsdt().markets) {
    expect(within(card).getAllByText(`${market.apy.toFixed(2)}%`).length).toBeGreaterThan(0);
  }
  expect(within(card).getByRole('button', { name: 'Earn now' })).toHaveAttribute(
    'data-venus-button-variant',
    'primary',
  );
  expect(within(card).getByRole('button', { name: 'Earn now' })).toHaveAttribute(
    'data-venus-button-material',
    'blue-glass',
  );
  expect(within(card).queryByText(/APR/)).toBeNull();
  expect(screen.getByRole('button', { name: 'Close USDT APY' })).toHaveFocus();
});

it('passes only the selected asset to the existing Earn flow and closes the popover', async () => {
  const onEarn = vi.fn();
  renderComponent(<TokenPlanetBackdrop rows={rows} onEarn={onEarn} />);
  fireEvent.click(screen.getByRole('button', { name: 'View USDT supply APY' }));
  fireEvent.click(screen.getByRole('button', { name: 'Earn now' }));
  expect(onEarn).toHaveBeenCalledExactlyOnceWith(getUsdt());
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('closes with the close control or Escape and restores the planet focus', async () => {
  renderComponent(<TokenPlanetBackdrop rows={rows} onEarn={vi.fn()} />);
  const trigger = screen.getByRole('button', { name: 'View USDT supply APY' });
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Close USDT APY' }));
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(trigger);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(trigger).toHaveFocus();
});

it('uses the existing click-away dismissal without changing the page', async () => {
  const onEarn = vi.fn();
  renderComponent(<TokenPlanetBackdrop rows={rows} onEarn={onEarn} />);
  fireEvent.click(screen.getByRole('button', { name: 'View USDT supply APY' }));
  const backdrop = document.querySelector('body > .fixed.inset-0');
  if (!backdrop) throw new Error('Dropdown backdrop is required');
  fireEvent.click(backdrop);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(onEarn).not.toHaveBeenCalled();
});

it('does not invent an APR or a rate when APY is unavailable', () => {
  const row = getUsdt();
  const invalid = {
    ...row,
    markets: row.markets.map(market => ({ ...market, apy: new BigNumber(Number.NaN) })),
  };
  renderComponent(<TokenPlanetBackdrop rows={[invalid]} onEarn={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'View USDT supply APY' }));
  expect(within(screen.getByRole('dialog')).getByText('—')).toBeVisible();
});

it('unmounts an open portal when resizing to a list-only screen', () => {
  const onEarn = vi.fn();
  const { rerender } = renderComponent(<TokenPlanetBackdrop rows={rows} onEarn={onEarn} />);
  fireEvent.click(screen.getByRole('button', { name: 'View USDT supply APY' }));
  viewport.wide = false;
  rerender(<TokenPlanetBackdrop rows={rows} onEarn={onEarn} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.queryByRole('complementary', { name: 'Explore Earn APYs' })).toBeNull();
});

it('does not invent unavailable assets or duplicate planets for repeated market rows', () => {
  const row = getUsdt();
  const onEarn = vi.fn();
  const { container, rerender } = renderComponent(
    <TokenPlanetBackdrop rows={[row, row]} onEarn={onEarn} />,
  );
  expect(container.querySelectorAll('.lite-e2-token-planet')).toHaveLength(1);
  rerender(<TokenPlanetBackdrop rows={[]} onEarn={onEarn} />);
  expect(container.querySelectorAll('.lite-e2-token-planet')).toHaveLength(0);
});
