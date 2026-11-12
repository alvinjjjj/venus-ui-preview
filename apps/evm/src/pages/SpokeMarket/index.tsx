import BigNumber from 'bignumber.js';
import { useSearchParams } from 'react-router';
import { mainstreamCollaterals } from '../Spoke/overview';
import '../LiquidityHub/detail.css';
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
import { useAccountAddress } from 'libs/wallet';
import { useTableBodyScroll } from 'hooks/useTableBodyScroll';
import { sortCollateralRows, getUserSupplyCents, type CollateralRow } from './collateralOrder';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { accountAddress } = useAccountAddress();
  const [collateralSelection, setCollateralSelection] = useState<{
    address: string;
    revision: number;
  }>();
  const { pool, market, isLoading, isPreview } = useSpokeMarket();
  const collateralScrollRef = useTableBodyScroll(
    pool?.collateralMarkets.length ?? 0,
    5,
    `${pool?.address}-${accountAddress}`,
    false, // Mobile cards scroll with the page, without a nested scroll area.
  );
  const [range, setRange] = useState<SpokeHistoryRange>('1m');
  const { data: history, isLoading: isHistoryLoading } = useGetSpokeMarketHistory({
    marketAddress: isPreview ? undefined : market?.address,
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

  // Layout-only scenario: never pass synthetic collateral to the action form.
  const previewCollateral = searchParams.get('previewCollateral') === '16';
  const collateralRows =
    previewCollateral && pool.collateralMarkets[0]
      ? mainstreamCollaterals.slice(0, 16).map((asset, index) => ({
          ...pool.collateralMarkets[0],
          token: {
            ...pool.collateralMarkets[0].token,
            symbol: asset.symbol,
            iconSrc: asset.iconSrc,
          },
          supplyTokens: new BigNumber(index === 0 ? 10000 : index === 1 ? 2890 : 15 + index),
          supplyCapTokens: new BigNumber(10000),
        }))
      : pool.collateralMarkets;

  // Illustrative positions are restricted to the dedicated design preview route.
  // Production: hydrate userSupplyTokens from the connected Spoke account query.
  const demoPositionsEnabled = isPreview;
  const demoSupplyTokens: Record<string, number> = { SKHYB: 750, TSLAB: 120, MRNAB: 50, NVDAB: 20 };
  const positionRows: CollateralRow[] = demoPositionsEnabled
    ? collateralRows.map(row => ({
        ...row,
        userSupplyTokens: new BigNumber(demoSupplyTokens[row.token.symbol] ?? 0),
      }))
    : collateralRows;
  const sortedCollateralRows = sortCollateralRows(
    positionRows,
    demoPositionsEnabled || !!accountAddress,
  );

  const collateralColumns: TableColumn<CollateralRow>[] = [
    {
      key: 'collateral',
      label: t('spoke.market.collateral'),
      selectOptionLabel: t('spoke.market.collateral'),
      renderCell: collateral => (
        <TokenIconWithSymbol token={collateral.token} className="[&_img]:rounded-full" />
      ),
    },
    {
      key: 'supplied',
      label: t('spoke.market.supplied'),
      selectOptionLabel: t('spoke.market.supplied'),
      align: 'right',
      renderCell: collateral =>
        (demoPositionsEnabled || accountAddress) && collateral.userSupplyTokens?.gt(0) ? (
          <LayeredValues
            topValue={formatTokensToReadableValue({
              value: collateral.userSupplyTokens,
              token: collateral.token,
              addSymbol: false,
            })}
            bottomValue={formatCentsToReadableValue({ value: getUserSupplyCents(collateral) })}
          />
        ) : (
          <span className="text-grey">-</span>
        ),
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
      <div className="venus-liquidity-hub-page venus-spoke-market-page">
        <MarketPageGrid
          form={<SpokeForm pool={pool} market={market} collateralSelection={collateralSelection} />}
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

              <div ref={collateralScrollRef}>
                <Table
                  className="spoke-collateral-table spoke-collateral-table--scroll"
                  title={t('spoke.market.supportedCollateral')}
                  data={sortedCollateralRows}
                  rowOnClick={(_event, collateral) => {
                    setCollateralSelection(previous => ({
                      address: collateral.address,
                      revision: (previous?.revision ?? 0) + 1,
                    }));
                    setSearchParams(
                      previous => {
                        const next = new URLSearchParams(previous);
                        next.set('tab', 'collateral');
                        return next;
                      },
                      { replace: true },
                    );
                  }}
                  columns={collateralColumns}
                  rowKeyExtractor={collateral =>
                    previewCollateral ? collateral.token.symbol : collateral.address
                  }
                  tableLayout="auto"
                  breakpoint="md"
                  hideCardDelimiter
                />
              </div>

              <MarketInfo
                title={t('spoke.market.loanInfo')}
                items={[
                  { label: t('spoke.market.borrowers'), children: market.borrowerCount },
                  {
                    label: t('spoke.market.marketContract'),
                    children: isPreview ? '—' : truncateAddress(market.address),
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
      </div>
    </Page>
  );
};

export default SpokeMarketPage;
