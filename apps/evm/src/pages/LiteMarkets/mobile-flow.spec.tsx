import { fireEvent, screen, within } from '@testing-library/react';
import { liquidityHubs } from '__mocks__/models/liquidityHubs';
import { poolData } from '__mocks__/models/pools';
import { useGetLiquidityHubs, useGetPool } from 'clients/api';
import { LiquidityHubForm } from 'containers/LiquidityHubForm';
import { MarketForm } from 'containers/MarketForm';
import { useAccountAddress } from 'libs/wallet';
import { renderComponent } from 'testUtils/render';
import type { Mock } from 'vitest';
import LiteMarkets from '.';
import { getSourceCollateral } from './CollateralPicker';
import { aggregateLiteAssets } from './data';

const preview = vi.hoisted(() => ({ mode: 'lite-experiment-v2' }));
vi.mock('demo/GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) => selector(preview),
}));
vi.mock('hooks/responsive', async importOriginal => ({
  ...(await importOriginal<typeof import('hooks/responsive')>()),
  useBreakpointUp: () => false,
}));
vi.mock('./GhostBackground', () => ({ GhostBackground: () => null }));
vi.mock('./TokenPlanets', () => ({ TokenPlanets: () => null }));
vi.mock('containers/MarketForm', () => ({
  MarketForm: vi.fn(() => <div data-testid="real-market-form">Existing market form</div>),
}));
vi.mock('containers/LiquidityHubForm', () => ({
  LiquidityHubForm: vi.fn(() => <div data-testid="hub-form">Existing liquidity hub form</div>),
}));

const pool = {
  ...poolData[0],
  assets: poolData[0].assets.map(asset => ({
    ...asset,
    isGated: false,
    isBorrowable: true,
    disabledTokenActions: [],
  })),
};
const rows = aggregateLiteAssets(pool.assets, [], pool.comptrollerAddress);

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
  vi.clearAllMocks();
  (useAccountAddress as Mock).mockReturnValue({ accountAddress: undefined });
  (useGetPool as Mock).mockReturnValue({ data: { pool }, isLoading: false });
  (useGetLiquidityHubs as Mock).mockReturnValue({ data: { liquidityHubs }, isLoading: false });
});

const table = () => within(screen.getByRole('table'));
const openBorrowSources = () => {
  renderComponent(<LiteMarkets />);
  fireEvent.click(screen.getByRole('button', { name: /^Borrow$/ }));
  expect(table().getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(table().getByRole('button', { name: 'Compare USDT borrowing' }));
};

it('uses two-column Earn tables and opens the existing hub form inline with working breadcrumbs', () => {
  renderComponent(<LiteMarkets />);
  expect(table().getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(table().getByRole('button', { name: 'Compare USDT markets' }));
  expect(table().getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(table().getByRole('button', { name: 'Liquidity Hub – Venus' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByTestId('hub-form')).toBeVisible();
  expect(vi.mocked(LiquidityHubForm).mock.lastCall?.[0]).toMatchObject({ inlineHeader: false });
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Earn navigation' })).getByRole('button', {
      name: 'Back to USDT Earn markets',
    }),
  );
  expect(table().getByRole('button', { name: 'Core Pool' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Back to Earn assets from USDT' }));
  expect(table().getByRole('button', { name: 'Compare USDT markets' })).toBeVisible();
});

it('opens Core loans inline and returns through the source and asset steps', () => {
  openBorrowSources();
  expect(table().getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(table().getByRole('button', { name: 'Venus Core' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByTestId('real-market-form')).toBeVisible();
  expect(vi.mocked(MarketForm).mock.lastCall?.[0]).toMatchObject({ borrowOnly: true });
  fireEvent.click(screen.getByRole('button', { name: 'Back to USDT borrowing markets' }));
  expect(table().getByRole('button', { name: 'Venus Core' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Back to Borrow assets from USDT' }));
  expect(table().getByRole('button', { name: 'Compare USDT borrowing' })).toBeVisible();
});

it('searches source collaterals, retains the chosen preview token and prevents transactions', () => {
  openBorrowSources();
  fireEvent.click(table().getByRole('button', { name: 'View bStock index collaterals' }));
  const dialog = screen.getByRole('dialog', { name: 'bStock index Collaterals' });
  expect(within(dialog).getAllByRole('columnheader')).toHaveLength(4);
  expect(within(dialog).getAllByText('—')).toHaveLength(6);
  fireEvent.change(within(dialog).getByRole('textbox', { name: 'Search collateral' }), {
    target: { value: 'spy' },
  });
  expect(within(dialog).queryByRole('button', { name: 'Use QQQB collateral' })).toBeNull();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Use SPYB collateral' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'Choose SPYB collateral' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Supply' })).toBeDisabled();
  expect(screen.getByText('Preview market · Transactions unavailable')).toBeVisible();
  expect(MarketForm).not.toHaveBeenCalled();
});

it('passes the chosen Core collateral to its existing form and correct pool', () => {
  openBorrowSources();
  const chosen = pool.assets.find(asset => asset.collateralFactor > 0);
  if (!chosen) throw new Error('Core collateral fixture is required');
  fireEvent.click(table().getByRole('button', { name: 'View Venus Core collaterals' }));
  const dialog = screen.getByRole('dialog', { name: 'Venus Core Collaterals' });
  fireEvent.click(
    within(dialog).getByRole('button', {
      name: `Use ${chosen.vToken.underlyingToken.symbol} collateral`,
    }),
  );
  expect(vi.mocked(MarketForm).mock.lastCall?.[0]).toMatchObject({
    earnOnly: true,
    vToken: chosen.vToken,
  });
  expect(vi.mocked(MarketForm).mock.lastCall?.[0].poolComptrollerAddress.toLowerCase()).toBe(
    pool.comptrollerAddress.toLowerCase(),
  );
});

it('does not attach Core risk figures to a preview pool with a matching token name', () => {
  const chosen = pool.assets.find(asset => asset.collateralFactor > 0);
  if (!chosen) throw new Error('Core collateral fixture is required');
  const choices = getSourceCollateral(
    {
      name: 'Preview pool',
      apy: 4,
      collateral: [{ symbol: chosen.vToken.underlyingToken.symbol }],
    },
    rows,
  );
  expect(choices[0].asset).toBeUndefined();
});
