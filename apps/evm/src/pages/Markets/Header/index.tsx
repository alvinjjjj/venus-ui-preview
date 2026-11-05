import { PageStatHeader } from 'components';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useChain } from 'hooks/useChain';
import { usePoolStats } from 'hooks/usePoolStats';
import { useTranslation } from 'libs/translations';
import type { Pool } from 'types';
import { areAddressesEqual } from 'utilities';

export interface HeaderProps {
  pool: Pool;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ pool, className }) => {
  const { t } = useTranslation();

  const { corePoolComptrollerContractAddress } = useChain();
  const isCorePool = areAddressesEqual(pool.comptrollerAddress, corePoolComptrollerContractAddress);

  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');

  const cells = usePoolStats({
    pools: [pool],
    stats: ['supply', 'borrow', 'liquidity', 'assetCount'],
  });

  const title = isCorePool ? t('markets.header.venusCore.title') : pool.name;
  const description = isCorePool ? t('markets.header.venusCore.description') : undefined;

  // Final: same header as the Liquidity Hub list — gradient title, subtitle, and
  // three plain stats (Total supply · Available liquidity · Assets; no Total borrow).
  if (isFinal) {
    const finalCells = [cells[0], cells[2], cells[3]].filter(Boolean);
    return (
      <div
        className={`venus-core-final-header lite-enter flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between ${className ?? ''}`}
      >
        <div className="xl:max-w-140">
          <h1 className="venus-page-title">{title}</h1>
          {description && <p className="venus-page-subtitle">{description}</p>}
        </div>

        <div className="flex shrink-0 flex-wrap gap-8 sm:gap-12">
          {finalCells.map(cell => (
            <div key={String(cell.label)}>
              <p className="mb-3 text-light-grey text-sm">{cell.label}</p>
              <p className="text-3xl xl:text-4xl font-normal tabular-nums">{cell.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageStatHeader title={title} description={description} cells={cells} className={`venus-markets-stats ${className ?? ''}`} />
  );
};
