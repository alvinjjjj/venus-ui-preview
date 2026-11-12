import BigNumber from 'bignumber.js';
import type { TokenDistribution } from 'types';
import getCombinedApy from 'utilities/getCombinedApy';
import type { LiteAsset, LiteMarket } from './data';

/** The displayed source and its sort value always describe the same offer. */
export function getApyOffer(
  type: 'supply' | 'borrow',
  baseApyPercentage: BigNumber,
  distributions: TokenDistribution[],
) {
  const active = distributions.filter(distribution => distribution.isActive);
  const earnedPrime = active.some(distribution => distribution.type === 'prime');
  const tokenDistributions = active.map(distribution =>
    distribution.type === 'merkl' && distribution.collateralGate?.isUserEligible === false
      ? { ...distribution, apyPercentage: new BigNumber(0) }
      : distribution,
  );
  const { totalApyPercentage } = getCombinedApy({ type, baseApyPercentage, tokenDistributions });
  const missingRewards = active.reduce((sum, distribution) => {
    if (distribution.type === 'primeSimulation' && !earnedPrime) {
      return sum.plus(BigNumber.maximum(0, distribution.apyPercentage));
    }
    if (distribution.type === 'merkl' && distribution.collateralGate?.isUserEligible === false) {
      return sum.plus(BigNumber.maximum(0, distribution.collateralGate.maxApyPercentage));
    }
    return sum;
  }, new BigNumber(0));
  return {
    tokenDistributions,
    actualApy: totalApyPercentage,
    rankingApy:
      type === 'supply'
        ? totalApyPercentage.plus(missingRewards)
        : totalApyPercentage.minus(missingRewards),
    estimated: missingRewards.gt(0),
  };
}

export function getEarnOffer(market: LiteMarket) {
  const source = market.asset ?? market.hub;
  return getApyOffer(
    'supply',
    source?.supplyApyPercentage ?? market.apy,
    source?.supplyTokenDistributions ?? [],
  );
}

export function getBestEarnMarket(row: LiteAsset) {
  return row.markets.reduce((best, market) =>
    getEarnOffer(market).rankingApy.gt(getEarnOffer(best).rankingApy) ? market : best,
  );
}
