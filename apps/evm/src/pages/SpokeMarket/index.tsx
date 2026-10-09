import { type SpokeHistoryRange, type SpokeMarket, useGetSpokeMarketHistory } from 'clients/api';
import {
  LayeredValues,
  MarketHistoryCard,
  MarketInfo,
  MarketPageGrid,
  Page,
  ProgressBar,
  Spinner,
  Table,
  type TableColumn,
  TokenIconWithSymbol,
} from 'components';
import { routes } from 'constants/routing';
import { Redirect } from 'containers/Redirect';
import { useTranslation } from 'libs/translations';
import { useState } from 'react';
import {
  formatCentsToReadableValue,
  formatPercentageToReadableValue,
  formatTokensToReadableValue,
  truncateAddress,
} from 'utilities';
import { SpokeForm } from './SpokeForm';
import './styles.css';
import { useSpokeMarket } from './useSpokeMarket';

const DAYS_PER_YEAR = 365;

const SpokeMarketPage: React.FC = () => {
  const { t } = useTranslation();
  const { pool, market, isLoading } = useSpokeMarket();
  const [range, setRange] = useState<SpokeHistoryRange>('1m');
  const { data: history, isLoading: isHistoryLoading } = useGetSpokeMarketHistory({
    marketAddress: market?.address,
    range,
  });

  if (isLoading) {
    return (
      <Page>
        <Spinner />
      </Page>
    );
  }

  if (!pool || !market) {
    return <Redirect to={routes.spoke.path} />;
  }

  const collateralColumns: TableColumn<SpokeMarket>[] = [
    {
      key: 'collateral',
      label: t('spoke.market.collateral'),
      selectOptionLabel: t('spoke.market.collateral'),
      renderCell: collateral => <TokenIconWithSymbol token={collateral.token} />,
    },
    {
      key: 'supplied',
      label: t('spoke.market.supplied'),
      selectOptionLabel: t('spoke.market.supplied'),
      align: 'right',
      renderCell: () => <span className="text-grey">-</span>,
    },
    {
      key: 'maxLtv',
      label: t('spoke.market.maxLtv'),
      selectOptionLabel: t('spoke.market.maxLtv'),
      align: 'right',
      renderCell: collateral =>
        formatPercentageToReadableValue(collateral.collateralFactorPercentage),
    },
    {
      key: 'lt',
      label: t('spoke.market.lt'),
      selectOptionLabel: t('spoke.market.lt'),
      align: 'right',
      renderCell: collateral =>
        formatPercentageToReadableValue(collateral.liquidationThresholdPercentage),
    },
    {
      key: 'penalty',
      label: t('spoke.market.penalty'),
      selectOptionLabel: t('spoke.market.penalty'),
      align: 'right',
      renderCell: collateral =>
        formatPercentageToReadableValue(collateral.liquidationPenaltyPercentage),
    },
    {
      key: 'capacity',
      label: t('spoke.market.capacityFilled'),
      selectOptionLabel: t('spoke.market.capacityFilled'),
      align: 'right',
      renderCell: collateral => {
        const ratio = collateral.supplyCapTokens.gt(0)
          ? collateral.supplyTokens.div(collateral.supplyCapTokens).times(100).toNumber()
          : 0;
        const format = (value: SpokeMarket['supplyTokens']) =>
          formatTokensToReadableValue({ value, token: collateral.token, addSymbol: false });

        return (
          <div className="spoke-capacity">
            <span>
              {format(collateral.supplyTokens)}/{format(collateral.supplyCapTokens)}
            </span>
            <ProgressBar
              className="spoke-capacity__bar"
              progressBars={[{ value: Math.min(ratio, 100) }]}
              min={0}
              max={100}
            />
          </div>
        );
      },
    },
  ];

  const dailyInterestCents = market.borrowCents
    .times(market.borrowApyPercentage / 100)
    .div(DAYS_PER_YEAR);

  return (
    <Page>
      <MarketPageGrid
        form={<SpokeForm pool={pool} market={market} />}
        content={
          <div className="spoke-market space-y-6">
            <MarketHistoryCard<SpokeHistoryRange>
              title={t('spoke.market.borrowInfo')}
              cells={[
                {
                  label: t('spoke.market.currentApy'),
                  value: formatPercentageToReadableValue(market.borrowApyPercentage),
                },
              ]}
              cap={{
                token: market.token,
                title: t('spoke.market.totalBorrowed'),
                tokenPriceCents: market.tokenPriceCents,
                limitTokens: market.supplyTokens,
                valueTokens: market.borrowTokens,
              }}
              history={{
                type: 'borrow',
                data: history?.points ?? [],
                isLoading: isHistoryLoading,
                selectedPeriod: range,
                setSelectedPeriod: setRange,
                periodOptions: (['1w', '1m', '3m', '1y', 'all'] as const).map(value => ({
                  value,
                  label: value.toUpperCase(),
                })),
              }}
            />

            <Table
              className="spoke-collateral-table"
              title={t('spoke.market.supportedCollateral')}
              data={pool.collateralMarkets}
              columns={collateralColumns}
              rowKeyExtractor={collateral => collateral.address}
              tableLayout="auto"
              breakpoint="md"
              hideCardDelimiter
            />

            <MarketInfo
              title={t('spoke.market.loanInfo')}
              items={[
                { label: t('spoke.market.borrowers'), children: market.borrowerCount },
                {
                  label: t('spoke.market.marketContract'),
                  children: truncateAddress(market.address),
                },
                {
                  label: t('spoke.market.reserveFactor'),
                  children: formatPercentageToReadableValue(market.reserveFactorPercentage),
                },
                {
                  label: t('spoke.market.dailyInterests'),
                  children: formatCentsToReadableValue({ value: dailyInterestCents }),
                },
                {
                  label: t('spoke.market.fundedByHub'),
                  children: (
                    <LayeredValues
                      topValue={formatTokensToReadableValue({
                        value: market.hubSuppliedTokens,
                        token: market.token,
                      })}
                    />
                  ),
                },
                {
                  label: t('spoke.market.suppliable'),
                  children: market.suppliable ? t('spoke.market.yes') : t('spoke.market.no'),
                },
              ]}
            />
          </div>
        }
      />
    </Page>
  );
};

export default SpokeMarketPage;
