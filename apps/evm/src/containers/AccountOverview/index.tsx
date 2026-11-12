import { cn } from '@venusprotocol/ui';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

import {
  type AccountPerformanceHistoryDataPoint,
  type AccountPerformanceHistoryPeriod,
  useGetAccountPerformanceHistory,
  useGetPool,
  useGetTokenUsdPrice,
  useGetVaults,
} from 'clients/api';
import {
  AccordionAnimatedContent,
  ButtonGroup,
  Card,
  CellGroup,
  type CellProps,
  Delimiter,
  Icon,
  InfoIcon,
} from 'components';
import { NULL_ADDRESS } from 'constants/address';
import { HidableUserBalance } from 'containers/HidableUserBalance';
import { useChain } from 'hooks/useChain';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import { useGetToken } from 'libs/tokens';
import { useTranslation } from 'libs/translations';
import { useStore } from 'store';
import type { Pool } from 'types';
import {
  convertDollarsToCents,
  formatCentsToReadableValue,
  formatPercentageToReadableValue,
} from 'utilities';
import type { Address } from 'viem';
import { DollarValueChange } from './DollarValueChange';
import { GridCellGroup } from './GridCellGroup';
import { PerformanceChart } from './PerformanceChart';
import { testIds } from './testIds';
import { type AccountBalanceAdjustment, useExtractData } from './useExtractData';

export interface AccountOverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  showGraph?: boolean;
  accountAddress?: Address;
  previewPool?: Pool;
  balanceAdjustment?: AccountBalanceAdjustment;
  splitLayout?: boolean;
  chartColor?: string;
  chartVariant?: 'area' | 'line';
  netWorthInfoIcon?: React.ReactNode;
  balanceVisibilityIcon?: React.ReactNode;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  showGraph = true,
  accountAddress,
  previewPool,
  balanceAdjustment,
  splitLayout = false,
  chartColor,
  chartVariant,
  netWorthInfoIcon,
  balanceVisibilityIcon,
  ...otherProps
}) => {
  const { t } = useTranslation();
  const ChartContainer = !splitLayout && chartVariant === 'line' ? Card : 'div';

  const isVaiFeatureEnabled = useIsFeatureEnabled({
    name: 'vaiRoute',
  });

  const [userChainSettings] = useUserChainSettings();
  const setUserSettings = useStore(state => state.setUserSettings);

  const toggleShowUserBalances = () =>
    setUserSettings({
      settings: {
        doNotShowUserBalances: !userChainSettings.doNotShowUserBalances,
      },
    });

  const { corePoolComptrollerContractAddress } = useChain();

  const periodOptions: { label: string; value: AccountPerformanceHistoryPeriod }[] = [
    {
      label: t('dashboard.overview.periodOption.thirtyDays'),
      value: 'month',
    },
    {
      label: t('dashboard.overview.periodOption.sixMonths'),
      value: 'halfyear',
    },
    {
      label: t('dashboard.overview.periodOption.oneYear'),
      value: 'year',
    },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<AccountPerformanceHistoryPeriod>(
    periodOptions[0].value,
  );

  const [selectedDataPoint, setSelectedDataPoint] = useState<
    AccountPerformanceHistoryDataPoint | undefined
  >();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Account changes must clear the previous account's hovered chart value.
  useEffect(() => {
    setSelectedDataPoint(undefined);
  }, [accountAddress]);

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const toggleAccordion = () => setIsAccordionOpen(current => !current);

  const { data: getPoolData } = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });
  const pool = previewPool ?? getPoolData?.pool;

  const { data: getVaultsData } = useGetVaults({
    accountAddress,
  });
  const vaults = getVaultsData || [];

  const xvs = useGetToken({
    symbol: 'XVS',
  });
  const { data: getXvsUsdPriceData } = useGetTokenUsdPrice({
    token: xvs,
  });
  const xvsPriceCents =
    getXvsUsdPriceData && convertDollarsToCents(getXvsUsdPriceData.tokenPriceUsd);

  const vai = useGetToken({
    symbol: 'VAI',
  });
  const { data: getVaiUsdPriceData } = useGetTokenUsdPrice({
    token: vai,
  });
  const vaiPriceCents =
    getVaiUsdPriceData && convertDollarsToCents(getVaiUsdPriceData.tokenPriceUsd);

  const {
    data: getAccountPerformanceHistoryData,
    refetch: refetchAccountPerformanceHistoryData,
    error: getAccountPerformanceHistoryError,
  } = useGetAccountPerformanceHistory(
    {
      accountAddress: accountAddress || NULL_ADDRESS,
      period: selectedPeriod,
    },
    {
      enabled: !!accountAddress,
    },
  );
  const accountPerformanceHistory = getAccountPerformanceHistoryData?.performanceHistory || [];

  const { userDailyEarningsCents, userNetApyPercentage, userTotalVaultStakeCents } = useExtractData(
    {
      pool,
      balanceAdjustment,
      vaults,
      xvsPriceCents,
      vaiPriceCents,
    },
  );

  const netWorthCents =
    pool && accountAddress
      ? new BigNumber(pool.userSupplyBalanceCents || 0)
          .plus(userTotalVaultStakeCents || 0)
          .plus(balanceAdjustment?.supplyCents ?? 0)
          .minus(balanceAdjustment?.borrowCents ?? 0)
          .minus(pool.userBorrowBalanceCents || 0)
          .minus(pool.vai?.userBorrowBalanceCents || 0)
          .toNumber()
      : undefined;

  const startOfDayNetWorthCents =
    getAccountPerformanceHistoryData?.startOfDayNetWorthCents !== undefined
      ? getAccountPerformanceHistoryData?.startOfDayNetWorthCents
      : undefined;

  const oldestNetWorthCents =
    accountPerformanceHistory.length > 0
      ? Number(accountPerformanceHistory[0].netWorthCents)
      : undefined;

  const absolutePerformanceCents =
    oldestNetWorthCents !== undefined && netWorthCents !== undefined
      ? netWorthCents - oldestNetWorthCents
      : undefined;

  const dailyChangeCents =
    startOfDayNetWorthCents !== undefined && netWorthCents !== undefined
      ? netWorthCents - startOfDayNetWorthCents
      : undefined;

  const dailyChangePercentage =
    dailyChangeCents !== undefined && netWorthCents !== undefined && netWorthCents !== 0
      ? (dailyChangeCents * 100) / netWorthCents
      : undefined;

  let readableDailyChangePercentage = formatPercentageToReadableValue(dailyChangePercentage);
  // Remove "-" sign
  if (readableDailyChangePercentage[0] === '-') {
    readableDailyChangePercentage = readableDailyChangePercentage.substring(1);
  }

  const graphCells: CellProps[] = [
    {
      label: t('dashboard.overview.todaysChange'),
      value: (
        <div className="dashboard-performance-values space-x-2 flex items-start">
          <HidableUserBalance>
            <DollarValueChange value={dailyChangeCents} />

            {dailyChangeCents !== undefined && dailyChangeCents !== 0 && (
              <div
                className={cn(
                  'dashboard-performance-percentage flex items-center',
                  dailyChangeCents > 0 ? 'text-green' : 'text-red',
                )}
              >
                <Icon
                  name="arrowUpFull2"
                  className={cn('w-4 h-4 text-inherit', dailyChangeCents < 0 && 'rotate-180')}
                />

                <span>{readableDailyChangePercentage}</span>
              </div>
            )}
          </HidableUserBalance>
        </div>
      ),
    },
    {
      label: showGraph
        ? t('dashboard.overview.absolutePerformance')
        : t('dashboard.overview.30DayAbsolutePerformance'),
      value: (
        <HidableUserBalance>
          <DollarValueChange value={absolutePerformanceCents} />
        </HidableUserBalance>
      ),
    },
  ];

  const summaryCells: CellProps[] = [
    {
      label: t('dashboard.overview.summary.cellGroup.netApy'),
      value: formatPercentageToReadableValue(userNetApyPercentage),
      tooltip: vaults
        ? t('dashboard.overview.summary.cellGroup.netApyWithVaultStakeTooltip')
        : t('dashboard.overview.summary.cellGroup.netApyTooltip'),
      className:
        typeof userNetApyPercentage === 'number' && userNetApyPercentage < 0
          ? 'text-red'
          : 'text-green',
    },
    {
      label: t('dashboard.overview.summary.cellGroup.dailyEarnings'),
      value: formatCentsToReadableValue({ value: userDailyEarningsCents }),
    },
    {
      label: t('dashboard.overview.summary.cellGroup.totalSupply'),
      value: formatCentsToReadableValue({
        value: pool?.userSupplyBalanceCents
          ?.plus(balanceAdjustment?.supplyCents ?? 0)
          .plus(balanceAdjustment ? userTotalVaultStakeCents ?? 0 : 0),
      }),
    },
    {
      label: t('dashboard.overview.summary.cellGroup.totalBorrow'),
      value: formatCentsToReadableValue({
        value: pool?.userBorrowBalanceCents?.plus(balanceAdjustment?.borrowCents ?? 0),
      }),
    },
  ];

  if (userTotalVaultStakeCents) {
    summaryCells.push({
      label: t('dashboard.overview.summary.cellGroup.totalVaultStake'),
      value: formatCentsToReadableValue({ value: userTotalVaultStakeCents }),
    });
  }

  const mintedVaiCell: CellProps | undefined = pool?.vai?.userBorrowBalanceCents
    ? {
        label: t('dashboard.overview.summary.cellGroup.mintedVai'),
        value: formatCentsToReadableValue({ value: pool?.vai?.userBorrowBalanceCents }),
      }
    : undefined;

  if (mintedVaiCell) {
    summaryCells.push(mintedVaiCell);
  }

  const showMintedVai = !!accountAddress && !!mintedVaiCell;
  const overviewSummaryCells = summaryCells.slice(0, 2);

  if (showMintedVai && mintedVaiCell) {
    overviewSummaryCells.push({
      ...mintedVaiCell,
      className: 'dashboard-overview-minted-vai',
    });
  }

  const overviewCells = [
    ...graphCells,
    ...overviewSummaryCells.map(cell => ({
      ...cell,
      value: <HidableUserBalance>{cell.value}</HidableUserBalance>,
    })),
  ];

  const readableNetWorth = formatCentsToReadableValue({
    value: selectedDataPoint ? Number(selectedDataPoint.netWorthCents) : netWorthCents,
  });

  const isEmptyPerformance =
    !!accountAddress &&
    !!getAccountPerformanceHistoryData &&
    !getAccountPerformanceHistoryError &&
    accountPerformanceHistory.length === 0;

  const shouldShowAccountBreakdown =
    !!accountAddress && !userChainSettings.doNotShowUserBalances && showGraph;

  return (
    <div {...otherProps}>
      <div
        className={cn(
          splitLayout &&
            'dashboard-overview-layout grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center',
          splitLayout && isEmptyPerformance && 'dashboard-overview-empty',
        )}
      >
        <div className={cn('min-w-0', splitLayout && 'dashboard-overview-summary')}>
          <div className={cn('mb-3 space-y-3', splitLayout && 'dashboard-overview-networth')}>
            {selectedDataPoint ? (
              <p className="text-sm">
                {t('dashboard.performanceChart.dataPoint.date', {
                  date: new Date(selectedDataPoint.blockTimestampMs),
                })}
              </p>
            ) : (
              <div className="flex items-center gap-x-2">
                <p className="text-sm text-grey">{t('dashboard.overview.netWorth.label')}</p>

                <InfoIcon
                  className="inline-flex"
                  icon={netWorthInfoIcon}
                  tooltip={
                    isVaiFeatureEnabled
                      ? t('dashboard.overview.netWorth.tooltipWithVai')
                      : t('dashboard.overview.netWorth.tooltip')
                  }
                />
              </div>
            )}

            <div className="flex items-center gap-x-3">
              <p className={cn('text-3xl', splitLayout && 'dashboard-networth-value')}>
                <HidableUserBalance>{readableNetWorth}</HidableUserBalance>
              </p>

              {accountAddress && (
                <button
                  type="button"
                  onClick={toggleShowUserBalances}
                  className="cursor-pointer p-1"
                  aria-label={
                    userChainSettings.doNotShowUserBalances ? 'Show balances' : 'Hide balances'
                  }
                >
                  {!userChainSettings.doNotShowUserBalances && balanceVisibilityIcon ? (
                    balanceVisibilityIcon
                  ) : (
                    <Icon
                      name={userChainSettings.doNotShowUserBalances ? 'closedEye' : 'eye'}
                      className="size-5"
                    />
                  )}
                </button>
              )}
            </div>
          </div>

          {splitLayout ? (
            <CellGroup
              cells={overviewCells}
              className={cn(
                'venus-account-performance-cells',
                showMintedVai && 'dashboard-overview-with-vai',
              )}
            />
          ) : (
            <button
              className={cn(
                'venus-account-performance-row flex items-center w-full h-15 text-left justify-between gap-x-3',
                shouldShowAccountBreakdown && 'cursor-pointer',
              )}
              type="button"
              disabled={!accountAddress}
              onClick={toggleAccordion}
            >
              <CellGroup cells={graphCells} className="venus-account-performance-cells" />

              {shouldShowAccountBreakdown && !splitLayout && (
                <div
                  className="flex items-center gap-x-3"
                  data-testid={testIds.performanceChartPreview}
                >
                  {!isAccordionOpen && (
                    <PerformanceChart
                      accountPerformanceHistory={accountPerformanceHistory}
                      className="hidden md:block w-49 h-15"
                      displayAxes={false}
                      displayToolTip={false}
                      areaChartMargin={{
                        top: 0,
                      }}
                    />
                  )}

                  <Icon
                    name="chevronDown"
                    className={cn('size-3 text-white', isAccordionOpen && 'rotate-180')}
                  />
                </div>
              )}
            </button>
          )}
        </div>
        {splitLayout && showGraph && !isEmptyPerformance && (
          <ChartContainer className="dashboard-overview-chart min-w-0 space-y-4">
            <ButtonGroup
              buttonLabels={periodOptions.map(p => p.label)}
              className="ml-auto w-fit"
              buttonClassName="h-8 font-normal px-3 aria-pressed:font-semibold"
              activeButtonIndex={periodOptions.findIndex(p => p.value === selectedPeriod)}
              onButtonClick={index => setSelectedPeriod(periodOptions[index].value)}
            />
            {shouldShowAccountBreakdown ? (
              <PerformanceChart
                displayAxes
                variant={chartVariant}
                {...(chartColor && { chartColor })}
                onSelectedDataPointChange={setSelectedDataPoint}
                accountPerformanceHistory={accountPerformanceHistory}
                onRefetch={refetchAccountPerformanceHistoryData}
                error={getAccountPerformanceHistoryError ?? undefined}
              />
            ) : (
              <div className="h-43 flex items-center justify-center text-sm text-grey">
                {accountAddress ? 'Balances hidden' : 'Connect wallet to view performance'}
              </div>
            )}
          </ChartContainer>
        )}
      </div>

      {shouldShowAccountBreakdown && !splitLayout && (
        <AccordionAnimatedContent isOpen={isAccordionOpen} className="pt-6">
          <div className="space-y-6 mb-8">
            <div className="flex flex-col">
              <ButtonGroup
                buttonLabels={periodOptions.map(p => p.label)}
                className="gap-x-1 inline-flex ml-auto w-fit sm:w-auto"
                buttonClassName="h-8 font-normal px-3"
                activeButtonIndex={periodOptions.findIndex(p => p.value === selectedPeriod)}
                onButtonClick={index => setSelectedPeriod(periodOptions[index].value)}
              />

              <PerformanceChart
                displayAxes
                onSelectedDataPointChange={setSelectedDataPoint}
                accountPerformanceHistory={accountPerformanceHistory}
                onRefetch={refetchAccountPerformanceHistoryData}
                error={getAccountPerformanceHistoryError ?? undefined}
                className="shrink-0"
              />
            </div>

            <div className="space-y-3">
              <p className="text-lg">{t('dashboard.overview.summary.title')}</p>

              <GridCellGroup cells={summaryCells} />
            </div>
          </div>

          <Delimiter />
        </AccordionAnimatedContent>
      )}
    </div>
  );
};
