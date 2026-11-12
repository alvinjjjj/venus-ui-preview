// Archived E/E2/E3 presentations retain their original reference badge.
import BigNumber from 'bignumber.js';
import { Tooltip } from 'components';
import { PrimeBadge } from 'components/Apy/PrimeBadge';
import { PrimeApy } from 'components/Apy/PrimeBadge/PrimeApy';
import type { LiteAsset } from './data';
const hasUsdtCoreMarket = (row: LiteAsset) =>
  row.markets.some(
    market =>
      market.asset?.vToken.address.toLowerCase() === '0xfd5840cd36d94d7229439859c0112a4185bc0255',
  );

export function LegacyEarnPrimeEntry({ row }: { row: LiteAsset }) {
  const options = row.markets
    .flatMap(market => {
      const asset = market.asset;
      if (!asset) return [];
      const simulation = asset.supplyTokenDistributions.find(
        d => d.type === 'primeSimulation' && d.isActive,
      );
      const earned = asset.supplyTokenDistributions.some(d => d.type === 'prime' && d.isActive);
      if (!simulation && !earned) return [];
      return [
        {
          asset,
          apy: market.apy.plus(simulation?.apyPercentage ?? 0),
          references:
            simulation?.type === 'primeSimulation' ? simulation.referenceValues : undefined,
        },
      ];
    })
    .sort((a, b) => b.apy.comparedTo(a.apy) ?? 0);
  const prime = options[0];
  const hasUsdtCore = hasUsdtCoreMarket(row);
  if (prime) {
    return (
      <span aria-label="Prime APY on Venus Core" title="Prime APY on Venus Core">
        <PrimeBadge
          type="supply"
          token={row.token}
          vTokenAddress={prime.asset.vToken.address}
          simulatedApyPercentage={prime.apy}
          simulationReferenceValues={prime.references}
        />
      </span>
    );
  }
  if (hasUsdtCore) {
    return (
      <Tooltip content="Prime APY reference from supplied screenshot; not a live rate.">
        <PrimeApy
          apyPercentage={new BigNumber(9.82)}
          aria-label="Prime APY reference: 9.82%, not a live rate"
        />
      </Tooltip>
    );
  }
  return null;
}
