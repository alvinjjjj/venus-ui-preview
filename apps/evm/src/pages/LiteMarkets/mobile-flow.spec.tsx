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

it('keeps the asset entry Prime-only and compares ordinary and Prime APY inside its sources', () => {
  const primePool = {
    ...pool,
    assets: pool.assets.map(asset => asset.vToken.underlyingToken.symbol === 'USDT'
      ? { ...asset, vToken: { ...asset.vToken, address: '0xfd5840cd36d94d7229439859c0112a4185bc0255' as const } }
      : asset),
  };
  (useGetPool as Mock).mockReturnValue({ data: { pool: primePool }, isLoading: false });
  renderComponent(<LiteMarkets />);
  const row = table().getByRole('button', { name: 'Compare USDT markets' }).closest('tr');
  expect(row).not.toBeNull();
  expect(row?.querySelector('.lite-base-apy')).toBeNull();
  const primeEntry = within(row!).getByLabelText('Prime APY on Venus Core');
  expect(primeEntry.querySelector('[data-apy-badge="prime"]')).toBeVisible();
  expect(primeEntry.querySelector('[data-apy-badge-text="prime"]')).toHaveTextContent('%');
  expect(document.querySelector('.lite-mobile-table .lite-base-apy')).toBeVisible();
  fireEvent.click(within(row!).getByRole('button', { name: 'Compare USDT markets' }));
  const coreSource = table().getByRole('button', { name: 'Core Pool' }).closest('tr');
  expect(coreSource?.querySelector('.lite-base-apy')).toBeVisible();
  expect(coreSource?.querySelector('[data-apy-badge-text="prime"]')).toHaveTextContent('%');
  expect(screen.queryByTitle('Total value locked')).toBeNull();
  const hubSource = table().getByRole('button', { name: 'Liquidity Hub – Venus' }).closest('tr');
  expect(hubSource?.querySelector('.lite-base-apy')).toBeVisible();
});

it('uses two-column Earn tables and opens the existing hub form inline with working breadcrumbs', () => {
  renderComponent(<LiteMarkets />);
  expect(table().getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(table().getByRole('button', { name: 'Compare USDT markets' }));
  expect(table().getAllByRole('columnheader')).toHaveLength(2);
  expect(within(screen.getByRole('navigation', { name: 'Earn navigation' })).getAllByRole('listitem')).toHaveLength(2);
  fireEvent.click(table().getByRole('button', { name: 'Liquidity Hub – Venus' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByTestId('hub-form')).toBeVisible();
  const marketNavigation = screen.getByRole('navigation', { name: 'Earn navigation' });
  expect(within(marketNavigation).getAllByRole('listitem')).toHaveLength(3);
  expect(within(marketNavigation).getByText('Liquidity Hub – Venus')).toHaveAttribute('aria-current', 'page');
  expect(vi.mocked(LiquidityHubForm).mock.lastCall?.[0]).toMatchObject({ inlineHeader: false, actionTabsVariant: 'secondary' });
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Earn navigation' })).getByRole('button', {
      name: 'Back to USDT Earn markets',
    }),
  );
  expect(table().getByRole('button', { name: 'Core Pool' })).toBeVisible();
  fireEvent.click(table().getByRole('button', { name: 'Core Pool' }));
  expect(vi.mocked(MarketForm).mock.lastCall?.[0]).toMatchObject({ earnOnly: true, actionTabsVariant: 'secondary' });
  fireEvent.click(screen.getByRole('button', { name: 'Back to Earn sources' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back to Earn assets from USDT' }));
  expect(table().getByRole('button', { name: 'Compare USDT markets' })).toBeVisible();
});

it('opens Core loans inline and returns through the source and asset steps', () => {
  openBorrowSources();
  const headers = table().getAllByRole('columnheader');
  expect(headers).toHaveLength(3);
  expect(headers[0]).toHaveTextContent('Pool');
  expect(headers[1]).toHaveTextContent('Collateral');
  expect(headers[2]).toHaveTextContent('APY');
  const coreRow = table().getByRole('button', { name: 'Venus Core' }).closest('tr');
  if (!coreRow) throw new Error('Core source row is required');
  const cells = within(coreRow).getAllByRole('cell');
  expect(within(cells[0]).queryByRole('button', { name: 'View Venus Core collaterals' })).toBeNull();
  expect(within(cells[1]).getByRole('button', { name: 'View Venus Core collaterals' })).toBeVisible();
  expect(cells[2]).toHaveTextContent('%');
  expect(within(screen.getByRole('navigation', { name: 'Borrow navigation' })).getAllByRole('listitem')).toHaveLength(2);
  expect(screen.queryByTitle('Available liquidity')).toBeNull();
  fireEvent.click(table().getByRole('button', { name: 'Venus Core' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByTestId('real-market-form')).toBeVisible();
  const marketNavigation = screen.getByRole('navigation', { name: 'Borrow navigation' });
  expect(within(marketNavigation).getAllByRole('listitem')).toHaveLength(3);
  expect(within(marketNavigation).getByText('Venus Core')).toHaveAttribute('aria-current', 'page');
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
  expect(within(dialog).queryByText('Preview market · Transactions unavailable')).toBeNull();
  expect(within(dialog).getAllByRole('columnheader')).toHaveLength(4);
  expect(within(dialog).queryByText('—')).toBeNull();
  expect(within(dialog).getAllByText('75%')).toHaveLength(2);
  expect(within(dialog).getAllByText('80%')).toHaveLength(2);
  expect(within(dialog).getAllByText('10%')).toHaveLength(2);
  fireEvent.change(within(dialog).getByRole('textbox', { name: 'Search collateral' }), {
    target: { value: 'spy' },
  });
  expect(within(dialog).queryByRole('button', { name: 'Use QQQB collateral' })).toBeNull();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Use SPYB collateral' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'Choose SPYB collateral' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Supply' })).toBeDisabled();
  expect(screen.queryByText('Preview market · Transactions unavailable')).toBeNull();
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
