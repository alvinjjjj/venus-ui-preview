import { type SpokeMarket, type SpokePool, useGetSpokePools } from 'clients/api';
import {
  type CellProps,
  ImgGroup,
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
  Wrapper,
} from 'components';
import { routes } from 'constants/routing';
import { HubApyBanner } from 'containers/HubApyBanner';
import { useTranslation } from 'libs/translations';
import { useMemo, useState } from 'react';
import {
  compareBigNumbers,
  compareNumbers,
  formatCentsToReadableValue,
  formatPercentageToReadableValue,
  formatTokensToReadableValue,
} from 'utilities';
import './styles.css';

const ALL = 'all';

export const getSpokeMarketPath = (market: SpokeMarket) =>
  routes.spokeMarket.path
    .replace(':spokePoolAddress', market.poolAddress)
    .replace(':spokeMarketAddress', market.address);

const SpokePoolTable: React.FC<{ pool: SpokePool; markets: SpokeMarket[] }> = ({
  pool,
  markets,
}) => {
  const { t } = useTranslation();

  const tokenValue = (market: SpokeMarket, tokens: SpokeMarket['borrowTokens']) =>
    formatTokensToReadableValue({ value: tokens, token: market.token, addSymbol: false });

  const columns: TableColumn<SpokeMarket>[] = [
    {
      key: 'asset',
      label: t('spoke.table.loanAsset'),
      selectOptionLabel: t('spoke.table.loanAsset'),
      renderCell: market => <TokenIconWithSymbol token={market.token} />,
    },
    {
      key: 'borrowed',
      label: t('spoke.table.borrowed'),
      selectOptionLabel: t('spoke.table.borrowed'),
      align: 'right',
      // User positions need a connected wallet on testnet; the preview has none.
      renderCell: () => <span className="text-grey">-</span>,
    },
    {
      key: 'borrowApy',
      label: t('spoke.table.borrowApy'),
      selectOptionLabel: t('spoke.table.borrowApy'),
      align: 'right',
      sortRows: (a, b, direction) =>
        compareNumbers(a.borrowApyPercentage, b.borrowApyPercentage, direction),
      renderCell: market => formatPercentageToReadableValue(market.borrowApyPercentage),
    },
    {
      key: 'liquidity',
      label: t('spoke.table.liquidity'),
      selectOptionLabel: t('spoke.table.liquidity'),
      align: 'right',
      sortRows: (a, b, direction) =>
        compareBigNumbers(a.liquidityCents, b.liquidityCents, direction),
      renderCell: market => (
        <LayeredValues
          topValue={tokenValue(market, market.cashTokens)}
          bottomValue={formatCentsToReadableValue({ value: market.liquidityCents })}
        />
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
        <ImgGroup
          className="spoke-collateral-group"
          imgSrcs={pool.collateralMarkets.map(collateral => collateral.token.iconSrc)}
        />
      ),
    },
    {
      key: 'totalBorrow',
      label: t('spoke.table.totalBorrow'),
      selectOptionLabel: t('spoke.table.totalBorrow'),
      align: 'right',
      sortRows: (a, b, direction) => compareBigNumbers(a.borrowCents, b.borrowCents, direction),
      renderCell: market => (
        <LayeredValues
          topValue={tokenValue(market, market.borrowTokens)}
          bottomValue={formatCentsToReadableValue({ value: market.borrowCents })}
        />
      ),
    },
  ];

  return (
    <Table
      className="spoke-pool-table"
      data={markets}
      columns={columns}
      rowKeyExtractor={market => market.address}
      tableLayout="auto"
      breakpoint="md"
      hideCardDelimiter
      getRowHref={getSpokeMarketPath}
      initialOrder={{ orderBy: columns[5], orderDirection: 'desc' }}
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

  const [search, setSearch] = useState('');
  const [loanAsset, setLoanAsset] = useState<string>(ALL);
  const [collateral, setCollateral] = useState<string>(ALL);
  const [poolAddress, setPoolAddress] = useState<string>(ALL);
  const [showPaused, setShowPaused] = useState(false);

  const pools = data?.pools ?? [];

  const { loanSymbols, collateralSymbols } = useMemo(() => {
    const loans = new Set<string>();
    const collaterals = new Set<string>();
    for (const pool of data?.pools ?? []) {
      for (const market of pool.loanMarkets) loans.add(market.token.symbol);
      for (const market of pool.collateralMarkets) collaterals.add(market.token.symbol);
    }
    return { loanSymbols: [...loans].sort(), collateralSymbols: [...collaterals].sort() };
  }, [data]);

  const filteredPools = pools
    .filter(pool => poolAddress === ALL || pool.address === poolAddress)
    .filter(
      pool => collateral === ALL || pool.collateralMarkets.some(m => m.token.symbol === collateral),
    )
    .map(pool => ({
      pool,
      markets: pool.loanMarkets.filter(
        market =>
          (showPaused || !market.isPaused) &&
          (loanAsset === ALL || market.token.symbol === loanAsset) &&
          (!search || market.token.symbol.toLowerCase().includes(search.toLowerCase())),
      ),
    }))
    .filter(({ markets }) => markets.length > 0);

  const cells: CellProps[] = [
    {
      label: t('spoke.stats.totalBorrow'),
      value: formatCentsToReadableValue({ value: data?.totalBorrowCents }),
    },
    {
      label: t('spoke.stats.availableLiquidity'),
      value: formatCentsToReadableValue({ value: data?.availableLiquidityCents }),
    },
    { label: t('spoke.stats.pools'), value: data?.poolCount ?? '-' },
  ];

  const option = (value: string, label: string) => ({ value, label });

  return (
    <Page>
      <HubApyBanner />

      <Wrapper className="pt-5 sm:pt-10">
        <div className="spoke-page space-y-5 sm:space-y-10">
          <PageStatHeader
            className="spoke-stat-header"
            title={t('spoke.header')}
            description={t('spoke.description')}
            cells={cells}
          />

          <div className="space-y-4">
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
                  className="spoke-filters__select"
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
