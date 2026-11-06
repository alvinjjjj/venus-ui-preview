import { type SpokeMarket, useGetSpokePools } from 'clients/api';
import {
  type CellProps,
  InfoIcon,
  LayeredValues,
  Page,
  PageStatHeader,
  Select,
  Table,
  type TableColumn,
  TextField,
  Toggle,
  TokenIconWithSymbol,
  Tooltip,
  Wrapper,
} from 'components';
import { routes } from 'constants/routing';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useTranslation } from 'libs/translations';
import { useMemo, useState } from 'react';
import {
  compareBigNumbers,
  compareNumbersWithMissingLast,
  formatCentsToReadableValue,
  formatPercentageToReadableValue,
  formatTokensToReadableValue,
} from 'utilities';
import { type SpokeLoanAsset, type SpokeOverviewPool, getSpokeOverview } from './overview';
import './styles.css';

const ALL = 'all';
// Hero stats show one decimal: $160.8K, not $160.86K.
const oneDecimal = (value: string) => value.replace(/(\.\d)\d+(?=[KMBT]?$)/, '$1');
const MAX_STACKED_ICONS = 4;

export const getSpokeMarketPath = (market: SpokeMarket) =>
  routes.spokeMarket.path
    .replace(':spokePoolAddress', market.poolAddress)
    .replace(':spokeMarketAddress', market.address);

const SpokePoolTable: React.FC<{ pool: SpokeOverviewPool; markets: SpokeLoanAsset[] }> = ({
  pool,
  markets,
}) => {
  const { t } = useTranslation();

  const tokenValue = (market: SpokeMarket, tokens: SpokeMarket['borrowTokens']) =>
    formatTokensToReadableValue({ value: tokens, token: market.token, addSymbol: false });

  // Same tooltip component; long lists (20 bStocks) scroll inside it.
  const collateralInfo = (
    <div className="overflow-auto pr-1">
    <table className="w-full text-b1r">
      <thead className="text-grey">
        <tr>
          <th className="pb-3 pr-8 text-left font-normal">
            {t('liquidityHubs.table.columns.asset')}
          </th>
          <th className="pb-3 text-right font-normal">{t('spoke.market.maxLtv')}</th>
        </tr>
      </thead>
      <tbody>
        {pool.collateralAssets.map(collateral => (
          <tr key={collateral.symbol}>
            <td className="py-2 pr-8">
              <span className="inline-flex items-center gap-x-3">
                <img
                  src={collateral.iconSrc}
                  alt={collateral.symbol}
                  width={20}
                  height={20}
                  className="spoke-collateral-icon rounded-full"
                />
                {collateral.symbol}
              </span>
            </td>
            <td className="py-2 text-right">
              {formatPercentageToReadableValue(collateral.maxLtvPercentage)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );

  const columns: TableColumn<SpokeLoanAsset>[] = [
    {
      key: 'asset',
      label: t('spoke.table.loanAsset'),
      selectOptionLabel: t('spoke.table.loanAsset'),
      renderCell: ({ token }) => <TokenIconWithSymbol token={token} size="xl" />,
    },
    {
      key: 'borrowed',
      label: t('spoke.table.borrowed'),
      selectOptionLabel: t('spoke.table.borrowed'),
      align: 'right',
      renderCell: ({ token, preview }) =>
        preview ? (
          <LayeredValues
            topValue={formatTokensToReadableValue({
              value: preview.borrowedTokens,
              token,
              addSymbol: false,
            })}
            // Preview stablecoin examples use $1 per token.
            bottomValue={formatCentsToReadableValue({
              value: preview.borrowedTokens.multipliedBy(100),
            })}
          />
        ) : (
          <span className="text-grey">-</span>
        ),
    },
    {
      key: 'borrowApy',
      label: t('spoke.table.borrowApy'),
      selectOptionLabel: t('spoke.table.borrowApy'),
      align: 'right',
      sortRows: (a, b, direction) =>
        compareNumbersWithMissingLast(
          a.preview?.borrowApyPercentage ?? a.market?.borrowApyPercentage,
          b.preview?.borrowApyPercentage ?? b.market?.borrowApyPercentage,
          direction,
        ),
      renderCell: ({ market, preview }) =>
        formatPercentageToReadableValue(
          preview?.borrowApyPercentage ?? market?.borrowApyPercentage,
        ),
    },
    {
      key: 'liquidity',
      label: t('spoke.table.liquidity'),
      selectOptionLabel: t('spoke.table.liquidity'),
      align: 'right',
      sortRows: (a, b, direction) =>
        compareBigNumbers(a.market?.liquidityCents, b.market?.liquidityCents, direction),
      renderCell: ({ market }) =>
        market ? (
          <LayeredValues
            topValue={tokenValue(market, market.cashTokens)}
            bottomValue={formatCentsToReadableValue({ value: market.liquidityCents })}
          />
        ) : (
          '-'
        ),
    },
    {
      key: 'collateral',
      label: (
        <span className="inline-flex items-center gap-x-1">
          {t('spoke.table.collateral')}
          <InfoIcon tooltip={t('spoke.table.collateralTooltip')} />
        </span>
      ),
      selectOptionLabel: t('spoke.table.collateral'),
      align: 'right',
      renderCell: () => (
        <Tooltip content={collateralInfo} triggerTabIndex={0} className="inline-flex">
          <div className="spoke-collateral-group inline-flex items-center">
            {pool.collateralAssets.slice(0, MAX_STACKED_ICONS).map(({ symbol, iconSrc }, index) => (
              <img
                key={symbol}
                src={iconSrc}
                alt={symbol}
                width={20}
                height={20}
                className={
                  index > 0
                    ? 'spoke-collateral-icon -ml-1 rounded-full'
                    : 'spoke-collateral-icon rounded-full'
                }
              />
            ))}
            {pool.collateralAssets.length > MAX_STACKED_ICONS ? (
              <span className="spoke-collateral-more">
                +{pool.collateralAssets.length - MAX_STACKED_ICONS}
              </span>
            ) : null}
          </div>
        </Tooltip>
      ),
    },
    {
      key: 'totalBorrow',
      label: t('spoke.table.totalBorrow'),
      selectOptionLabel: t('spoke.table.totalBorrow'),
      align: 'right',
      sortRows: (a, b, direction) =>
        compareBigNumbers(a.market?.borrowCents, b.market?.borrowCents, direction),
      renderCell: ({ market }) =>
        market ? (
          <LayeredValues
            topValue={tokenValue(market, market.borrowTokens)}
            bottomValue={formatCentsToReadableValue({ value: market.borrowCents })}
          />
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Table
      className="spoke-pool-table"
      data={markets}
      columns={columns}
      rowKeyExtractor={({ token }) => token.address}
      tableLayout="auto"
      breakpoint="md"
      hideCardDelimiter
      getRowHref={({ market }) => (market ? getSpokeMarketPath(market) : '')}
      header={
        <div className="spoke-pool-table__title">
          <h3>{pool.name}</h3>
          {pool.description ? <p>{pool.description}</p> : null}
        </div>
      }
    />
  );
};

const Spoke: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetSpokePools();
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');

  const [search, setSearch] = useState('');
  const [loanAsset, setLoanAsset] = useState<string>(ALL);
  const [collateral, setCollateral] = useState<string>(ALL);
  const [poolAddress, setPoolAddress] = useState<string>(ALL);
  const [showPaused, setShowPaused] = useState(false);

  const overview = useMemo(() => getSpokeOverview(data?.pools ?? []), [data]);
  const pools = overview.pools;

  const { loanSymbols, collateralSymbols } = useMemo(() => {
    const loans = new Set<string>();
    const collaterals = new Set<string>();
    for (const pool of pools) {
      for (const { token } of pool.loanAssets) loans.add(token.symbol);
      for (const asset of pool.collateralAssets) collaterals.add(asset.symbol);
    }
    return { loanSymbols: [...loans].sort(), collateralSymbols: [...collaterals].sort() };
  }, [pools]);

  const filteredPools = pools
    .filter(pool => poolAddress === ALL || pool.address === poolAddress)
    .filter(
      pool =>
        collateral === ALL || pool.collateralAssets.some(asset => asset.symbol === collateral),
    )
    .map(pool => ({
      pool,
      markets: pool.loanAssets.filter(
        ({ token, market }) =>
          (showPaused || !market?.isPaused) &&
          (loanAsset === ALL || token.symbol === loanAsset) &&
          (!search || token.symbol.toLowerCase().includes(search.toLowerCase())),
      ),
    }))
    .filter(({ markets }) => markets.length > 0);

  const cells: CellProps[] = [
    {
      label: t('spoke.stats.totalBorrow'),
      value: oneDecimal(
        formatCentsToReadableValue({ value: data ? overview.totalBorrowCents : undefined }),
      ),
    },
    {
      label: t('spoke.stats.availableLiquidity'),
      value: oneDecimal(
        formatCentsToReadableValue({ value: data ? overview.availableLiquidityCents : undefined }),
      ),
    },
    { label: t('spoke.stats.pools'), value: data ? pools.length : '-' },
  ];

  const option = (value: string, label: string) => ({ value, label });

  return (
    <Page>
      <Wrapper className="pt-5 sm:pt-10">
        <div className="spoke-page space-y-5 sm:space-y-10">
          {isFinal ? (
            // Final: same hero as Liquidity Hub / Venus Core — plain stats, no dividers.
            <div className="venus-core-final-header spoke-stat-header flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="xl:max-w-140">
                <h1 className="venus-page-title">{t('spoke.header')}</h1>
                <p className="venus-page-subtitle">{t('spoke.description')}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-8 sm:gap-12">
                {cells.map(cell => (
                  <div key={String(cell.label)}>
                    <p className="mb-3 text-light-grey text-sm">{cell.label}</p>
                    <p className="text-xl xl:text-2xl font-normal tabular-nums">{cell.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <PageStatHeader
              className="spoke-stat-header"
              title={t('spoke.header')}
              description={t('spoke.description')}
              cells={cells}
            />
          )}

          <div className="space-y-4 sm:space-y-6">
            <div className="spoke-filters">
              <div className="spoke-filters__fields">
                <TextField
                  inputContainerClassName="venus-market-search-surface"
                  size="sm"
                  value={search}
                  onChange={event => setSearch(event.currentTarget.value)}
                  placeholder={t('spoke.filters.search')}
                  leftIconSrc="magnifier"
                  className="spoke-filters__search"
                />
                <Select
                  size="medium"
                  variant="primary"
                  className="spoke-filters__select"
                  buttonClassName={loanAsset === ALL ? 'spoke-filters__placeholder' : undefined}
                  value={loanAsset}
                  onChange={value => setLoanAsset(String(value))}
                  options={[
                    option(ALL, t('spoke.filters.allLoanAssets')),
                    ...loanSymbols.map(s => option(s, s)),
                  ]}
                />
                <Select
                  size="medium"
                  variant="primary"
                  className="spoke-filters__select"
                  buttonClassName={collateral === ALL ? 'spoke-filters__placeholder' : undefined}
                  value={collateral}
                  onChange={value => setCollateral(String(value))}
                  options={[
                    option(ALL, t('spoke.filters.allCollaterals')),
                    ...collateralSymbols.map(s => option(s, s)),
                  ]}
                />
                <Select
                  size="medium"
                  variant="primary"
                  className="spoke-filters__select spoke-filters__select--pool"
                  buttonClassName={poolAddress === ALL ? 'spoke-filters__placeholder' : undefined}
                  value={poolAddress}
                  onChange={value => setPoolAddress(String(value))}
                  options={[
                    option(ALL, t('spoke.filters.allPools')),
                    ...pools.map(pool => option(pool.address, pool.name)),
                  ]}
                />
              </div>
              <div className="spoke-filters__toggles">
                <Toggle
                  value={showPaused}
                  onChange={() => setShowPaused(!showPaused)}
                  label={t('spoke.filters.pausedAssets')}
                />
              </div>
            </div>

            {isLoading ? null : filteredPools.length > 0 ? (
              filteredPools.map(({ pool, markets }) => (
                <SpokePoolTable key={pool.address} pool={pool} markets={markets} />
              ))
            ) : (
              <p className="spoke-empty">{t('spoke.table.empty')}</p>
            )}
          </div>
        </div>
      </Wrapper>
    </Page>
  );
};

export default Spoke;
