import BigNumber from 'bignumber.js';
import type { TokenDistribution } from 'types';
import { describe, expect, it } from 'vitest';
import { getApyOffer } from './apy';
const n = (v: number) => new BigNumber(v);
const distributions = (prime: boolean, campaign: boolean) =>
  [
    { type: prime ? 'prime' : 'primeSimulation', apyPercentage: n(2), isActive: true },
    {
      type: 'merkl',
      apyPercentage: n(3),
      isActive: true,
      collateralGate: { isUserEligible: campaign, maxApyPercentage: n(3) },
    },
  ] as TokenDistribution[];

describe('Lite eligibility and ranking', () => {
  it.each([
    [false, false, 10],
    [true, false, 12],
    [false, true, 13],
    [true, true, 15],
  ])(
    'Earn Prime=%s campaign=%s excludes unearned rewards while ranking the full offer',
    (prime, campaign, actual) => {
      const offer = getApyOffer('supply', n(10), distributions(!!prime, !!campaign));
      expect(offer.actualApy.toNumber()).toBe(actual);
      expect(offer.rankingApy.toNumber()).toBe(15);
      expect(offer.estimated).toBe(!prime || !campaign);
    },
  );
  it.each([
    [false, false, 10],
    [true, false, 8],
    [false, true, 7],
    [true, true, 5],
  ])(
    'Borrow Prime=%s campaign=%s subtracts only eligible rewards from actual APY',
    (prime, campaign, actual) => {
      const offer = getApyOffer('borrow', n(10), distributions(!!prime, !!campaign));
      expect(offer.actualApy.toNumber()).toBe(actual);
      expect(offer.rankingApy.toNumber()).toBe(5);
    },
  );
  it('ignores inactive and zero estimates', () => {
    const ds = distributions(false, false).map(d => ({ ...d, isActive: false }));
    expect(getApyOffer('supply', n(1), ds).rankingApy.toNumber()).toBe(1);
    expect(
      getApyOffer('supply', n(1), [{ ...ds[0], isActive: true, apyPercentage: n(0) }]).estimated,
    ).toBe(false);
  });
});
