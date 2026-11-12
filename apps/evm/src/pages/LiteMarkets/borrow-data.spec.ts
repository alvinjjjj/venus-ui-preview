import BigNumber from 'bignumber.js';
import type { Asset } from 'types';
import { describe, expect, it } from 'vitest';
import { getBorrowAssetMetrics, getBorrowSources } from './borrow-data';
const n = (v: number) => new BigNumber(v);
const asset = {
  vToken: { underlyingToken: { symbol: 'U' } },
  borrowApyPercentage: n(4.04),
  borrowTokenDistributions: [],
  cashTokens: n(10240000),
  liquidityCents: n(1024000000),
  borrowBalanceTokens: n(17980000),
  borrowBalanceCents: n(1798000000),
  tokenPriceCents: n(100),
} as unknown as Asset;
describe('Borrow aggregate offers', () => {
  it('uses the lowest source rate and sums the same sources shown in the picker', () => {
    const result = getBorrowAssetMetrics(asset, []);
    expect(result.best.name).toBe('bStock bluechips');
    expect(result.apy.toNumber()).toBe(3.66);
    expect(result.liquidity.toNumber()).toBe(18660000);
    expect(result.borrowed.toNumber()).toBe(45520000);
    expect(getBorrowSources(asset, []).map(source => source.name)).toEqual([
      'Venus Core',
      'bStock index',
      'bStock growth',
      'bStock bluechips',
    ]);
  });
  it('has one Core source for loans without Spoke preview support', () => {
    const coreOnly = {
      ...asset,
      vToken: {
        ...asset.vToken,
        underlyingToken: { ...asset.vToken.underlyingToken, symbol: 'BTCB' },
      },
    };
    expect(getBorrowSources(coreOnly, [])).toHaveLength(1);
    expect(getBorrowAssetMetrics(coreOnly, []).liquidity.eq(asset.cashTokens)).toBe(true);
  });
});
