import { poolData } from '__mocks__/models/pools';
import BigNumber from 'bignumber.js';
import { getPreviewBalances, getPreviewCollateral } from './preview-data';

it('provides finite positive preview balances for every token in the market fixtures', () => {
  for (const pool of poolData) {
    for (const asset of pool.assets) {
      const balances = getPreviewBalances(asset.tokenPriceCents);
      for (const value of [
        balances.walletTokens,
        balances.supplyTokens,
        balances.borrowTokens,
        balances.availableTokens,
      ]) {
        expect(value.isFinite()).toBe(true);
        expect(value.gt(0)).toBe(true);
      }
    }
  }
});

it.each([100, 10_000, 70_000, 250_000, 7_000_000])(
  'keeps the illustrative account value consistent at a token price of %i cents',
  price => {
    const balances = getPreviewBalances(new BigNumber(price));
    expect(balances.walletTokens.times(price).toNumber()).toBeCloseTo(200_000, 5);
    expect(balances.borrowTokens.times(price).toNumber()).toBeCloseTo(25_000, 5);
  },
);

it.each(['0', 'NaN', '-1'])(
  'handles an unavailable price of %s without invalid display data',
  price => {
    expect(getPreviewBalances(new BigNumber(price)).walletTokens.toFixed()).toBe('2000');
  },
);

it('keeps preview collateral data separate from transaction assets', () => {
  const fixture = getPreviewCollateral('SPYB');
  expect(fixture.walletTokens.toFixed()).toBe('3.333333333333333333');
  expect(fixture.maxLtvPercentage).toBeLessThan(fixture.liquidationThresholdPercentage);
  expect(fixture).not.toHaveProperty('asset');
  expect(getPreviewCollateral('ANY_TOKEN').supplyTokens.isFinite()).toBe(true);
});
