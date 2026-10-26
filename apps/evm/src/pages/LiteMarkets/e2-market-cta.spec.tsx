import type { Mock } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { liquidityHubs } from '__mocks__/models/liquidityHubs';
import { poolData } from '__mocks__/models/pools';
import { useGetLiquidityHubs, useGetPool } from 'clients/api';
import { useAccountAddress } from 'libs/wallet';
import { renderComponent } from 'testUtils/render';
import LiteMarkets from '.';

vi.unmock('zustand');
const preview = vi.hoisted(() => ({ mode: 'lite-experiment-v2' }));
vi.mock('demo/GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) => selector(preview),
}));
vi.mock('./GhostBackground', () => ({ GhostBackground: () => null }));
vi.mock('./E3ActionCard', () => ({ E3ActionCard: () => <div>E3 reference</div> }));
vi.mock('hooks/responsive', async importOriginal => ({
  ...(await importOriginal<typeof import('hooks/responsive')>()),
  useBreakpointUp: () => true,
}));
vi.mock('../Landing/SafetyExplorer', () => ({ SafetyExplorer: () => null }));
vi.mock('../Landing/CommunityExplorer', () => ({ CommunityExplorer: () => null }));

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
  preview.mode = 'lite-experiment-v2';
  (useAccountAddress as Mock).mockReturnValue({ accountAddress: undefined });
  // The shared USDC fixture is paused; keep this rendering test's USDC visible.
  const pool = {
    ...poolData[0],
    assets: poolData[0].assets.map(asset =>
      asset.vToken.underlyingToken.symbol === 'USDC'
        ? { ...asset, disabledTokenActions: [] }
        : asset,
    ),
  };
  (useGetPool as Mock).mockReturnValue({ data: { pool }, isLoading: false });
  (useGetLiquidityHubs as Mock).mockReturnValue({ data: { liquidityHubs }, isLoading: false });
});

it('keeps four Final columns and asset selection without Earn buttons', () => {
  renderComponent(<LiteMarkets />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
  expect(within(table).getByRole('button', { name: 'Compare USDT markets' })).toBeEnabled();
  expect(within(table).queryByRole('button', { name: /Earn with/ })).toBeNull();
});

it('uses the existing asset-source flow rather than submitting a transaction', () => {
  renderComponent(<LiteMarkets />);
  fireEvent.click(
    within(screen.getByRole('table')).getByRole('button', { name: 'Compare USDT markets' }),
  );
  expect(screen.getByRole('button', { name: 'Back to Earn assets from USDT' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Compare USDT markets' })).toBeNull();
  expect(
    screen.queryByText('Simple yet powerful lending and borrowing for any DeFi yield strategy.'),
  ).toBeVisible();
  expect(useAccountAddress().accountAddress).toBeUndefined();
});

it('routes a planet Earn now from Borrow back to that asset Earn source selection', async () => {
  renderComponent(<LiteMarkets />);
  fireEvent.click(screen.getByRole('button', { name: 'Borrow' }));
  expect(screen.getByRole('region', { name: 'Borrow markets' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'View USDT supply APY' }));
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'USDT supply APY' })).getByRole('button', {
      name: 'Earn now',
    }),
  );
  expect(screen.getByRole('button', { name: 'Back to Earn assets from USDT' })).toBeVisible();
  expect(screen.queryByRole('region', { name: 'Borrow markets' })).toBeNull();
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(useAccountAddress().accountAddress).toBeUndefined();
});

it.each([
  ['lite-experiment-v2', true],
  ['lite-experiment-v3', false],
  ['lite-experiment', true],
  ['v1', true],
  ['v5', true],
] as const)('preserves the requested supporting copy for %s', (mode, visible) => {
  preview.mode = mode;
  renderComponent(<LiteMarkets />);
  const tagline = screen.queryByText(
    'Simple yet powerful lending and borrowing for any DeFi yield strategy.',
  );
  if (visible) expect(tagline).toBeVisible();
  else expect(tagline).toBeNull();
  if (mode !== 'lite-experiment-v2') {
    expect(document.querySelector('.lite-e2-token-planets')).toBeNull();
  }
});

it('places the E2 supporting sentence under the heading and keeps totals with the hero outside the changing market step', () => {
  renderComponent(<LiteMarkets />);
  const subtitle = screen.queryByText(
    'Simple yet powerful lending and borrowing for any DeFi yield strategy.',
  );
  expect(subtitle).toBeVisible();
  expect(subtitle?.closest('.lite-market-hero')).toContainElement(
    screen.getByRole('heading', { name: 'Universal Money Markets' }),
  );
  const stage = document.querySelector('.lite-e2-market-stage');
  const totals = document.querySelector<HTMLElement>('.lite-experiment-top-totals');
  expect(document.querySelector('.lite-market-hero')).not.toContainElement(totals);
  expect(stage).toContainElement(totals);
  expect(stage).toContainElement(screen.getByRole('region', { name: 'Earn markets' }));
  expect(screen.getByRole('heading', { name: 'Universal Money Markets' })).toBeVisible();
});

it('removes the USDC fire and shows one APY instead of a range', () => {
  renderComponent(<LiteMarkets />);
  expect(document.querySelector('.lite-e2-promoted-fire')).toBeNull();
  const row = within(screen.getByRole('table')).getByRole('button', { name: 'Compare USDT markets' }).closest('tr');
  expect(row?.querySelector('.lite-base-apy')).toHaveTextContent(/^\d+\.\d{2}%$/);
});

it('targets APY and Liquidity main numbers without changing the USD or Total Supply hooks', () => {
  renderComponent(<LiteMarkets />);
  const row = within(screen.getByRole('table'))
    .getByRole('button', { name: 'Compare USDT markets' })
    .closest('tr');
  expect(row?.querySelector('.lite-base-apy')).toHaveTextContent('%');
  expect(row?.querySelector('td:nth-child(3) .lite-amount')).toHaveClass('lite-liquidity-amount');
  expect(row?.querySelector('td:nth-child(3) p')).not.toHaveClass('lite-liquidity-amount');
  expect(row?.querySelector('td:nth-child(4) .lite-amount')).not.toHaveClass(
    'lite-liquidity-amount',
  );
});

it.each(['lite-experiment', 'lite-experiment-v3', 'v1', 'v5'])(
  'does not add the new action to %s',
  mode => {
    preview.mode = mode;
    renderComponent(<LiteMarkets />);
    expect(screen.queryByRole('button', { name: 'Earn with USDT' })).toBeNull();
    expect(document.querySelector('.lite-e2-promoted-fire')).toBeNull();
    // E3 independently opted into shared inline totals; preserve that work.
    if (mode !== 'lite-experiment-v3') {
      expect(document.querySelector('.lite-e2-market-totals')).toBeNull();
    }
  },
);

it('preserves the original E2 controls independently from Final', () => {
  preview.mode = 'lite-experiment-v2-legacy';
  renderComponent(<LiteMarkets />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
  expect(within(table).getByRole('button', { name: 'Earn with USDC' })).toBeVisible();
  expect(document.querySelector('.lite-e2-promoted-fire')).not.toBeNull();
});
