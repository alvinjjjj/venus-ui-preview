import BigNumber from 'bignumber.js';
import { useGetLiquidityHubs, useGetPool } from 'clients/api';
import { useChain } from 'hooks/useChain';
import { useAccountAddress } from 'libs/wallet';
import { formatCentsToReadableValue } from 'utilities';
import { aggregateLiteAssets } from './data';

/** Shared protocol totals for the Lite home and Pro Hub, using the same query cache. */
export const MarketTotals = () => {
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
    <div className="flex shrink-0 flex-wrap gap-8 sm:gap-12">
      {(
        [
          ['Total Supply', 'supplyUsd'],
          ['Available Liquidity', 'liquidityUsd'],
        ] as const
      ).map(([label, field]) => (
        <div key={field}>
          <p className="mb-3 text-light-grey text-sm">{label}</p>
          <p className="text-3xl xl:text-4xl font-normal tabular-nums">
            {ready
              ? formatCentsToReadableValue({
                  value: rows.reduce((sum, row) => sum.plus(row[field]), new BigNumber(0)),
                })
              : '—'}
          </p>
        </div>
      ))}
    </div>
  );
};
