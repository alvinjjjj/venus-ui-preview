import { screen } from '@testing-library/react';
import { liquidityHubs } from '__mocks__/models/liquidityHubs';
import { poolData } from '__mocks__/models/pools';
import BigNumber from 'bignumber.js';
import { useGetLiquidityHubs, useGetPool } from 'clients/api';
import { useAccountAddress } from 'libs/wallet';
import { renderComponent } from 'testUtils/render';
import type { Mock } from 'vitest';
import { MarketTotals } from './MarketTotals';
import { aggregateLiteAssets } from './data';

vi.mock('./data', () => ({ aggregateLiteAssets: vi.fn() }));

beforeEach(() => {
  (useAccountAddress as Mock).mockReturnValue({ accountAddress: undefined });
  (useGetPool as Mock).mockReturnValue({ data: { pool: poolData[0] }, isLoading: false });
  (useGetLiquidityHubs as Mock).mockReturnValue({ data: { liquidityHubs }, isLoading: false });
  (aggregateLiteAssets as Mock).mockReturnValue([
    { supplyUsd: new BigNumber('150000000000'), liquidityUsd: new BigNumber('100000000000') },
    { supplyUsd: new BigNumber('15012345678'), liquidityUsd: new BigNumber('25087654321') },
  ]);
});

it('renders full whole-dollar totals without enabling rolling digits in the inline variant', () => {
  renderComponent(<MarketTotals variant="inline" />);
  expect(screen.getByText('$1,650,123,456')).toBeVisible();
  expect(screen.getByText('$1,250,876,543')).toBeVisible();
  expect(document.querySelector('.lite-e3-rolling-total')).toBeNull();
  expect(document.querySelectorAll('.lite-e2-market-total')).toHaveLength(2);
  expect(screen.queryByText('Preview · Simulated values')).toBeNull();
  expect(
    screen.getByRole('group', { name: 'Preview market totals — simulated values' }),
  ).toBeVisible();
  const supplyMarker = screen.getByText('Total Supply').firstElementChild;
  const liquidityMarker = screen.getByText('Available Liquidity').firstElementChild;
  expect(supplyMarker).toBeNull();
  expect(liquidityMarker).toBeNull();
  expect(document.querySelector('.lite-e2-total-dot')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});

it.each([undefined, 'default'] as const)(
  'preserves shortened totals for the %s variant',
  variant => {
    renderComponent(<MarketTotals variant={variant} />);
    expect(screen.getByText('$1.6B')).toBeVisible();
    expect(screen.getByText('$1.2B')).toBeVisible();
    expect(document.querySelector('.lite-e2-market-totals')).toBeNull();
    expect(document.querySelector('.lite-e2-total-dot')).toBeNull();
    expect(screen.queryByText('Preview · Simulated values')).toBeNull();
  },
);

it.each(['pool', 'hubs'])('does not present a partial total while %s is unavailable', missing => {
  if (missing === 'pool') (useGetPool as Mock).mockReturnValue({ data: undefined });
  else (useGetLiquidityHubs as Mock).mockReturnValue({ data: undefined });
  renderComponent(<MarketTotals variant="inline" />);
  expect(screen.getAllByText('—')).toHaveLength(2);
  expect(screen.queryByText('$1,650,123,456')).toBeNull();
});

it('renders known zero totals without inventing a value', () => {
  (aggregateLiteAssets as Mock).mockReturnValue([]);
  renderComponent(<MarketTotals variant="inline" />);
  expect(screen.getAllByText('$0')).toHaveLength(2);
});
