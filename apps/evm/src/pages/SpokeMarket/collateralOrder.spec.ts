import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { type CollateralRow, sortCollateralRows } from './collateralOrder';
const row = (address: string, tokens?: number, price = 100) =>
  ({
    address,
    userSupplyTokens: tokens === undefined ? undefined : new BigNumber(tokens),
    tokenPriceCents: new BigNumber(price),
  }) as CollateralRow;
describe('Supported collateral default order', () => {
  it('orders USD rather than token units and preserves the input', () => {
    const rows = [row('blank'), row('cheap', 100, 1), row('expensive', 2, 1000), row('zero', 0)];
    expect(sortCollateralRows(rows, true).map(r => r.address)).toEqual([
      'expensive',
      'cheap',
      'blank',
      'zero',
    ]);
    expect(rows[0].address).toBe('blank');
  });
  it('keeps API order when disconnected with stale positions', () => {
    const rows = [row('blank'), row('supplied', 10)];
    expect(sortCollateralRows(rows, false)).toBe(rows);
  });
  it('keeps API order for ties and blank values', () => {
    const rows = [row('a', 2, 100), row('b', 1, 200), row('c'), row('d', 0)];
    expect(sortCollateralRows(rows, true)).toEqual(rows);
  });
  it('reorders refreshed positions', () => {
    expect(sortCollateralRows([row('a', 2), row('b', 1)], true)[0].address).toBe('a');
    expect(sortCollateralRows([row('a', 0), row('b', 3)], true)[0].address).toBe('b');
  });
});
