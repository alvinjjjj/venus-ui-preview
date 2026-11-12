import BigNumber from 'bignumber.js';
import type { Pool, PrimeSimulationDistribution } from 'types';
import getCombinedApy from 'utilities/getCombinedApy';
import { demoAddresses, isDemoAddress } from './state';

/** An explicit preview offer. Live accounts retain their API-supplied eligibility. */
export function withDemoPrimeDistributions(pool: Pool, accountAddress?: string): Pool {
  if (accountAddress && !isDemoAddress(accountAddress)) return pool;
  const prime = accountAddress?.toLowerCase() === demoAddresses.prime.toLowerCase();
  return {
    ...pool,
    assets: pool.assets.map(asset => {
      if (asset.vToken.underlyingToken.symbol !== 'USDT') return asset;
      const distributions = asset.supplyTokenDistributions.filter(
        distribution => distribution.type !== 'prime' && distribution.type !== 'primeSimulation',
      );
      const base = getCombinedApy({
        type: 'supply',
        baseApyPercentage: asset.supplyApyPercentage,
        tokenDistributions: distributions,
      }).totalApyPercentage;
      const simulation: PrimeSimulationDistribution = {
        type: 'primeSimulation',
        token: asset.vToken.underlyingToken,
        isActive: true,
        apyPercentage: BigNumber.maximum(0, new BigNumber('9.82').minus(base)),
        referenceValues: {
          userSupplyBalanceTokens: new BigNumber(10000),
          userBorrowBalanceTokens: new BigNumber(0),
          userXvsStakedTokens: new BigNumber(1000),
        },
      };
      return {
        ...asset,
        supplyTokenDistributions: [
          ...distributions,
          prime ? { ...simulation, type: 'prime' as const } : simulation,
        ],
      };
    }),
  };
}
