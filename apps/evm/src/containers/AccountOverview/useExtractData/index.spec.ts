import BigNumber from 'bignumber.js';
import type { Pool } from 'types';
import { expect, it } from 'vitest';
import { useExtractData } from '.';
it('uses all supplied balances as the Net APY denominator and includes other-product earnings', () => {
  const result = useExtractData({
    pool: {
      userSupplyBalanceCents: new BigNumber(10000),
      userYearlyEarningsCents: new BigNumber(300),
    } as Pool,
    vaults: [],
    balanceAdjustment: {
      supplyCents: new BigNumber(5000),
      borrowCents: new BigNumber(1000),
      yearlyEarningsCents: new BigNumber(-100),
    },
  });
  expect(result.userNetApyPercentage).toBe(1.33);
  expect(result.userDailyEarningsCents.toNumber()).toBeCloseTo(200 / 365);
});
