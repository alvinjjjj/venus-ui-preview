import BigNumber from 'bignumber.js';
import type { Asset, LiquidityHub } from 'types';
import { describe, expect, it } from 'vitest';
import { aggregateLiteAssets } from './data';

const n = (value: number) => new BigNumber(value);
const token = { address: '0xabc', chainId: 56, symbol: 'USDT' };
const asset = {
  vToken: { address: '0xcore', underlyingToken: token },
  supplyApyPercentage: n(2),
  supplyTokenDistributions: [],
  supplyBalanceTokens: n(100),
  supplyBalanceCents: n(10000),
  cashTokens: n(60),
  liquidityCents: n(6000),
} as unknown as Asset;
const hub = {
  vhToken: { address: '0xhub', underlyingToken: token },
  supplyApyPercentage: n(3),
  supplyTokenDistributions: [],
  supplyBalanceTokens: n(50),
  supplyBalanceCents: n(5000),
  liquidityTokens: n(35),
  liquidityCents: n(3500),
  yieldGroups: [
    {
      sources: [
        {
          address: '0xCORE',
          allocationTokens: n(40),
          allocationCents: n(4000),
          liquidityTokens: n(30),
          liquidityCents: n(3000),
        },
      ],
    },
  ],
} as unknown as LiquidityHub;

describe('Lite market aggregation', () => {
  it('sums every token source without removing allocations from token rows', () => {
    const [row] = aggregateLiteAssets([asset], [hub], '0xpool');
    expect(row.supply.toNumber()).toBe(150);
    expect(row.supplyUsd.toNumber()).toBe(15000);
    expect(row.liquidity.toNumber()).toBe(95);
    expect(row.liquidityUsd.toNumber()).toBe(9500);
    expect(row.markets.map(m => m.apy.toNumber())).toEqual([2, 3]);
  });
  it('does not merge the same symbol at different token addresses', () => {
    const other = {
      ...hub,
      vhToken: { ...hub.vhToken, underlyingToken: { ...token, address: '0xdef' } },
    } as unknown as LiquidityHub;
    expect(aggregateLiteAssets([asset], [other], '0xpool')).toHaveLength(2);
  });
  it('does not count a duplicate source twice', () => {
    const [row] = aggregateLiteAssets([asset, asset], [hub, hub], '0xpool');
    expect(row.markets).toHaveLength(2);
    expect(row.supply.toNumber()).toBe(150);
  });
  it('removes internal allocation overlap only from protocol totals', () => {
    const [row] = aggregateLiteAssets([asset], [hub], '0xpool', [], { protocolTotals: true });
    expect(row.supplyUsd.toNumber()).toBe(11000);
    expect(row.liquidityUsd.toNumber()).toBe(6500);
  });
  it('handles no data', () => {
    expect(aggregateLiteAssets([], [], '0xpool')).toEqual([]);
  });
});
