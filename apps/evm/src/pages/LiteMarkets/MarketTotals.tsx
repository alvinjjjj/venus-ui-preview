import BigNumber from 'bignumber.js';
import { useGetLiquidityHubs, useGetPool } from 'clients/api';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useChain } from 'hooks/useChain';
import { useAccountAddress } from 'libs/wallet';
import { formatCentsToReadableValue } from 'utilities';
import { SimulatedMarketTotal } from './SimulatedMarketTotal';
import { aggregateLiteAssets } from './data';

/** Shared protocol totals for the Lite home and Pro Hub, using the same query cache. */
export const MarketTotals = ({
  variant = 'default',
  supplyUpdateIntervalMs,
}: { variant?: 'default' | 'inline'; supplyUpdateIntervalMs?: number }) => {
  const inline = variant === 'inline';
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const { accountAddress } = useAccountAddress();
  const { corePoolComptrollerContractAddress } = useChain();
  const poolQuery = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });
  const hubsQuery = useGetLiquidityHubs({ accountAddress });
  const ready = !!poolQuery.data?.pool && !!hubsQuery.data;
  const rows = aggregateLiteAssets(
    poolQuery.data?.pool.assets ?? [],
    hubsQuery.data?.liquidityHubs ?? [],
    corePoolComptrollerContractAddress,
  );

  return (
    <div
      className={`flex shrink-0 flex-wrap gap-8 sm:gap-12${inline ? ' lite-e2-market-totals' : ''}`}
      role={inline ? 'group' : undefined}
      aria-label={inline ? 'Preview market totals — simulated values' : undefined}
    >
      {(
        [
          ['Total Supply', 'supplyUsd'],
          ['Available Liquidity', 'liquidityUsd'],
        ] as const
      ).map(([label, field]) => (
        <div key={field} className={inline ? 'lite-e2-market-total' : undefined}>
          <p className="mb-3 text-light-grey text-sm">{label}</p>
          <p
            className={`${inline ? 'text-3xl xl:text-4xl' : 'text-xl xl:text-2xl'} font-normal tabular-nums`}
          >
            {ready ? (
              inline ? (
                <SimulatedMarketTotal
                  valueCents={rows.reduce((sum, row) => sum.plus(row[field]), new BigNumber(0))}
                  field={field}
                  decimalPlaces={0}
                  animateDigits={supplyUpdateIntervalMs !== undefined}
                  updateIntervalMs={supplyUpdateIntervalMs}
                  sleepBetweenUpdates={isFinal}
                />
              ) : (
                formatCentsToReadableValue({
                  value: rows.reduce((sum, row) => sum.plus(row[field]), new BigNumber(0)),
                }).replace(/(\.\d)\d+(?=[KMBT]?$)/, '$1')
              )
            ) : (
              '—'
            )}
          </p>
        </div>
      ))}
    </div>
  );
};
