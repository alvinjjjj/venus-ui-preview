import { Typography } from '@mui/material';
import { Card } from 'components';
import { useState } from 'react';

import { ButtonGroup } from 'components';
import { MarketFormModal } from 'containers/MarketFormModal';
import { MarketTable, type MarketTableProps } from 'containers/MarketTable';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { BorrowSourceModal } from 'pages/LiteMarkets/BorrowSourceModal';
import { aggregateLiteAssets } from 'pages/LiteMarkets/data';
import { useIsSmDown } from 'hooks/responsive';
import { useTranslation } from 'libs/translations';
import type { Asset, Pool } from 'types';
import { positionTableColumnWidths } from '../../../positionTableLayout';

import { EModeHeader } from './EModeHeader';
import { IsolatedModeHeader } from './IsolatedModeHeader';
import { useStyles } from './styles';

export interface TablesProps {
  pool: Pool;
  previewInteractions?: boolean;
}

export const Tables: React.FC<TablesProps> = ({ pool, previewInteractions }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const isMobile = useIsSmDown();
  // Lite: rows open the Lite modals in place instead of the Core market detail page.
  // Supplied row -> Lite Core supply modal; Borrowed row -> Lite Core borrow modal. Pro unchanged.
  const { isLite } = useInterfaceMode();
  const [liteSupplyAsset, setLiteSupplyAsset] = useState<Asset>();
  const [liteBorrowAsset, setLiteBorrowAsset] = useState<Asset>();
  const liteRowClick = (open: (asset: Asset) => void) =>
    isLite
      ? (e: React.MouseEvent<HTMLDivElement>, row: Asset) => {
          e.preventDefault();
          open(row);
        }
      : undefined;

  const marketTableProps: {
    supply: MarketTableProps;
    borrow: MarketTableProps;
  } = {
    supply: {
      assets: pool.assets.filter(
        asset => asset.userSupplyBalanceTokens.isGreaterThan(0) || asset.isCollateralOfUser,
      ),
      poolName: pool.name,
      poolComptrollerContractAddress: pool.comptrollerAddress,
      userEModeGroup: pool.userEModeGroup,
      marketType: 'supply',
      rowOnClick: liteRowClick(setLiteSupplyAsset),
      previewInteractions,
      className: previewInteractions
        ? 'dashboard-position-table dashboard-position-preview-table dashboard-supplied-table'
        : 'dashboard-position-table',
      controls: false,
      rowControl: false,
      breakpoint: 'sm',
      columns: ['asset', 'supplyApy', 'userSupplyBalance', 'collateral'],
      columnWidths: previewInteractions ? positionTableColumnWidths : undefined,
      initialOrder: {
        orderBy: 'userSupplyBalance',
        orderDirection: 'desc',
      },
      variant: 'primary',
    },
    borrow: {
      assets: pool.assets.filter(asset => asset.userBorrowBalanceTokens.isGreaterThan(0)),
      poolName: pool.name,
      poolComptrollerContractAddress: pool.comptrollerAddress,
      userEModeGroup: pool.userEModeGroup,
      marketType: 'borrow',
      rowOnClick: liteRowClick(setLiteBorrowAsset),
      previewInteractions,
      className: previewInteractions
        ? 'dashboard-position-table dashboard-position-preview-table'
        : 'dashboard-position-table',
      controls: false,
      rowControl: false,
      breakpoint: 'sm',
      columns: ['asset', 'borrowApy', 'userBorrowBalance', 'userBorrowLimitSharePercentage'],
      columnWidths: previewInteractions ? positionTableColumnWidths : undefined,
      initialOrder: {
        orderBy: 'userBorrowBalance',
        orderDirection: 'desc',
      },
      variant: 'primary',
    },
  };

  return (
    <>
      {/* Desktop view */}
      {!isMobile ? (
        <div
          className={
            previewInteractions
              ? 'dashboard-position-tables flex flex-col gap-6 2xl:grid 2xl:grid-cols-2'
              : 'dashboard-position-tables flex flex-col gap-6 xl:grid xl:grid-cols-2'
          }
        >
          <MarketTable
            {...marketTableProps.supply}
            title={t('account.marketBreakdown.tables.supplyTableTitle')}
          />

          <MarketTable
            {...marketTableProps.borrow}
            title={
              <div className="flex gap-x-2">
                {t('account.marketBreakdown.tables.borrowTableTitle')}

                {pool.userEModeGroup &&
                  (pool.userEModeGroup.isIsolated ? (
                    <IsolatedModeHeader
                      groupName={pool.userEModeGroup.name}
                      poolComptrollerContractAddress={pool.comptrollerAddress}
                    />
                  ) : (
                    <EModeHeader
                      eModeGroupName={pool.userEModeGroup.name}
                      poolComptrollerContractAddress={pool.comptrollerAddress}
                    />
                  ))}
              </div>
            }
          />
        </div>
      ) : (
        <Card css={[styles.tabletContainer]} className="dashboard-mobile-assets border-0">
          <div css={styles.tabletHeader} className="dashboard-mobile-assets-header">
            <div className="items-center gap-x-2">
              <Typography variant="h4" css={styles.tabletHeaderTitle}>
                {t('account.marketBreakdown.tables.tabletTitle')}
              </Typography>
            </div>

            <ButtonGroup
              fullWidth={previewInteractions}
              buttonSize="sm"
              css={styles.tabletHeaderButtonGroup}
              buttonLabels={[
                t('account.marketBreakdown.tables.tabletSupplyTabTitle'),
                t('account.marketBreakdown.tables.tabletBorrowTabTitle'),
              ]}
              activeButtonIndex={activeTabIndex}
              onButtonClick={setActiveTabIndex}
            />
          </div>

          {activeTabIndex === 0 ? (
            <MarketTable
              key="supply-market-table"
              header={
                pool.userEModeGroup &&
                (pool.userEModeGroup.isIsolated ? (
                  <IsolatedModeHeader
                    groupName={pool.userEModeGroup.name}
                    poolComptrollerContractAddress={pool.comptrollerAddress}
                    className="max-sm:hidden"
                  />
                ) : (
                  <EModeHeader
                    eModeGroupName={pool.userEModeGroup.name}
                    poolComptrollerContractAddress={pool.comptrollerAddress}
                    className="max-sm:hidden"
                  />
                ))
              }
              {...marketTableProps.supply}
              css={styles.tabletMarketTable}
              className={previewInteractions ? 'dashboard-supplied-table border-0' : 'border-0'}
            />
          ) : (
            <MarketTable
              key="borrow-market-table"
              header={
                pool.userEModeGroup &&
                (pool.userEModeGroup.isIsolated ? (
                  <IsolatedModeHeader
                    groupName={pool.userEModeGroup.name}
                    poolComptrollerContractAddress={pool.comptrollerAddress}
                    className="max-sm:hidden"
                  />
                ) : (
                  <EModeHeader
                    eModeGroupName={pool.userEModeGroup.name}
                    poolComptrollerContractAddress={pool.comptrollerAddress}
                    className="max-sm:hidden"
                  />
                ))
              }
              {...marketTableProps.borrow}
              css={styles.tabletMarketTable}
              className="border-0"
            />
          )}
        </Card>
      )}
      {liteSupplyAsset && (
        <MarketFormModal
          asset={liteSupplyAsset}
          poolComptrollerAddress={pool.comptrollerAddress}
          initialActiveTabId="supply"
          earnOnly
          marketName="Venus Core"
          onClose={() => setLiteSupplyAsset(undefined)}
        />
      )}
      {liteBorrowAsset && (
        <BorrowSourceModal
          asset={liteBorrowAsset}
          source={{ name: 'Venus Core', collateral: [] }}
          rows={aggregateLiteAssets(pool.assets, [], pool.comptrollerAddress)}
          onClose={() => setLiteBorrowAsset(undefined)}
        />
      )}
    </>
  );
};

export default Tables;
