import type BigNumber from 'bignumber.js';
import { useGetLiquidityHubs, useGetPool, useGetVaults } from 'clients/api';
import {
  Apy,
  Icon,
  MultiSelect,
  Page,
  type TableColumn,
  Tabs,
  TextField,
  TokenIcon,
  TokenIconWithSymbol,
  Wrapper,
} from 'components';
import { GatedAssetAcknowledgementModal } from 'containers/GatedAssetAcknowledgementModal';
import { useStore as useLayoutStore } from 'containers/Layout/store';
import { LiquidityHubForm } from 'containers/LiquidityHubForm';
import { LiquidityHubFormModal } from 'containers/LiquidityHubFormModal';
import { MarketForm } from 'containers/MarketForm';
import { MarketFormModal } from 'containers/MarketFormModal';
import { VenusVaultModal } from 'containers/VenusVaultModal';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { isLiteExperimentMode } from 'demo/GlassVersions/variants';
import { useDemoVhMarketStore } from 'demo/demoVhMarket';
import { withDemoPrimeDistributions } from 'demo/withDemoPrimeDistributions';
import { useBreakpointUp } from 'hooks/responsive';
import { useChain } from 'hooks/useChain';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import { useTranslation } from 'libs/translations';
import { useAccountAddress } from 'libs/wallet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import { CommunityExplorer } from '../Landing/CommunityExplorer';
import { SafetyExplorer } from '../Landing/SafetyExplorer';
import { BorrowMarkets } from './BorrowMarkets';
import { E3ActionCard } from './E3ActionCard';
import { GhostBackground } from './GhostBackground';
import { LegacyEarnPrimeEntry } from './LegacyEarnPrimeEntry';
import { LiteMarketAction } from './LiteMarketAction';
import { LiteMarketAmount } from './LiteMarketAmount';
import { LiteMarketBreadcrumb } from './LiteMarketBreadcrumb';
import { LiteMarketStage } from './LiteMarketStage';
import { LiteMarketTable } from './LiteMarketTable';
import { MarketModeSwitch } from './MarketModeSwitch';
import { MarketTotals } from './MarketTotals';
import { PromotedTokenFire } from './PromotedTokenFire';
import { TokenPlanets } from './TokenPlanets';
import { getBestEarnMarket, getEarnOffer } from './apy';
import { aggregateLiteAssets } from './data';
import type { LiteAsset, LiteMarket } from './data';
import './empty-state.css';
import './entrance.css';
import { formatEarnApyRange } from './experiment';
import { matchesEarnCategories } from './experiment';
import './experiment.css';
import './trust-sections.css';
import { useLiteFlow } from './useLiteFlow';
import { isVisibleLiteAsset } from './visibility';

function MarketApy({ market, badgeOnly = false }: { market: LiteMarket; badgeOnly?: boolean }) {
  const source = market.asset ?? market.hub;
  const token =
    market.asset?.vToken.underlyingToken ??
    market.hub?.vhToken.underlyingToken ??
    market.vault?.stakedToken;
  if (!token) return null;
  const offer = getEarnOffer(market);
  return (
    <Apy
      type="supply"
      token={token}
      baseApyPercentage={source?.supplyApyPercentage ?? market.apy}
      tokenDistributions={offer.tokenDistributions}
      userBalanceTokens={source?.userSupplyBalanceTokens}
      vTokenAddress={market.asset?.vToken.address}
      badgeOnlyEstimate={badgeOnly}
      className="lite-base-apy"
    />
  );
}

const usd = (value: BigNumber) => formatCentsToReadableValue({ value });
const amount = (value: BigNumber, token: LiteAsset['token']) =>
  formatTokensToReadableValue({ value, token, addSymbol: false });

function BestMarketApy({ row }: { row: LiteAsset; plain?: boolean }) {
  return <MarketApy market={getBestEarnMarket(row)} badgeOnly />;
}

function AssetSources({
  row,
  onBack,
  inline = false,
  framed = false,
  mobile = false,
  modeSwitch,
}: {
  row: LiteAsset;
  onBack: () => void;
  inline?: boolean;
  framed?: boolean;
  mobile?: boolean;
  modeSwitch?: React.ReactNode;
}) {
  const { corePoolComptrollerContractAddress } = useChain();
  const [userChainSettings] = useUserChainSettings();
  const isFinalSources = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const singleMarket = isFinalSources && row.markets.length === 1 ? row.markets[0] : undefined;
  const [sourceId, setSourceId] = useLiteFlow('earnSource');
  const openedMarket = row.markets.find(market => market.id === sourceId) ?? singleMarket;
  const setOpenedMarket = (market?: LiteMarket) => setSourceId(market?.id);
  const setVhMarket = useDemoVhMarketStore(state => state.set);
  useEffect(() => {
    const hub = openedMarket?.vhHub;
    setVhMarket({
      vhToken: hub ? openedMarket?.asset?.vToken.underlyingToken : undefined,
      underlyingToken: hub?.vhToken.underlyingToken,
      underlyingBalanceTokens: hub?.userWalletBalanceTokens,
    });
    return () => setVhMarket({});
  }, [openedMarket, setVhMarket]);
  const closeMarket = useCallback(() => {
    if (singleMarket) onBack();
    else setSourceId(undefined);
  }, [singleMarket, onBack, setSourceId]);
  const mobileFormRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (mobile && openedMarket) {
      mobileFormRef.current?.scrollIntoView?.({ block: 'start' });
    }
  }, [mobile, openedMarket]);
  const isE2Sources = useGlassPreview(
    state => state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy',
  );
  useEffect(() => {
    if (!openedMarket || inline) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMarket();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openedMarket, inline, closeMarket]);
  const columns: TableColumn<LiteMarket>[] = [
    {
      key: 'yield',
      label: 'Market',
      selectOptionLabel: 'Market',
      sortRows: (a, b, direction) => a.name.localeCompare(b.name) * (direction === 'asc' ? 1 : -1),
      renderCell: market => (
        <button
          type="button"
          onClick={() => setOpenedMarket(market)}
          aria-haspopup={inline ? undefined : 'dialog'}
          className="font-normal text-white hover:text-blue text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
        >
          {isE2Sources ? (market.asset ? 'Venus Core' : market.name) : market.name}
        </button>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: market => {
        return (
          <div className="lite-source-apy">
            <MarketApy market={market} />
          </div>
        );
      },
      sortRows: (a, b, direction) =>
        (getEarnOffer(a).rankingApy.comparedTo(getEarnOffer(b).rankingApy) ?? 0) *
        (direction === 'desc' ? -1 : 1),
    },
    ...(['liquidity', 'supply'] as const).map(field => ({
      key: field,
      label: field === 'supply' ? 'Total Supply' : 'Liquidity',
      selectOptionLabel: field === 'supply' ? 'Total Supply' : 'Liquidity',
      align: 'right' as const,
      sortRows: (a: LiteMarket, b: LiteMarket, direction: 'asc' | 'desc') =>
        (a[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'].comparedTo(
          b[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'],
        ) ?? 0) * (direction === 'asc' ? 1 : -1),
      renderCell: (market: LiteMarket) => (
        <LiteMarketAmount
          value={amount(market[field], row.token)}
          usdValue={usd(market[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'])}
          symbol={row.token.symbol}
        />
      ),
    })),
  ];

  // XVS Vault always opens its own supply modal (no inline form), on desktop and mobile.
  if (inline && openedMarket && !openedMarket.vault) {
    return (
      <section
        ref={mobileFormRef}
        className={`lite-inline-market${mobile && isFinalSources ? ' venus-form-surface' : ''}`}
        aria-label={`${row.token.symbol} ${openedMarket.name} form`}
      >
        {mobile ? (
          <LiteMarketBreadcrumb
            mode="Earn"
            token={row.token}
            onBackToAssets={onBack}
            onBackToSources={singleMarket ? undefined : closeMarket}
            marketName={isFinalSources && openedMarket.asset ? 'Venus Core' : openedMarket.name}
          />
        ) : (
          <nav aria-label="Earn navigation" className="lite-inline-market-path">
            <button type="button" onClick={onBack}>
              Earn
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              onClick={closeMarket}
              aria-label={`Back to ${row.token.symbol} Earn markets`}
              className="inline-flex items-center gap-2"
            >
              <TokenIcon
                token={row.token}
                size="md"
                className="lite-breadcrumb-token-icon size-4"
              />
              {row.token.symbol}
            </button>
            <span aria-hidden="true">/</span>
            <span aria-current="page">
              {isFinalSources && openedMarket.asset ? 'Venus Core' : openedMarket.name}
            </span>
          </nav>
        )}
        <div className="lite-inline-market-body" key={openedMarket.id}>
          <div className="lite-inline-market-form">
            {openedMarket.asset ? (
              openedMarket.asset.isGated && !userChainSettings.doNotShowGatedAssetModal ? (
                <GatedAssetAcknowledgementModal inline onReject={closeMarket} />
              ) : (
                <MarketForm
                  inlineHeader={!mobile}
                  actionTabsVariant="secondary"
                  vToken={openedMarket.asset.vToken}
                  poolComptrollerAddress={corePoolComptrollerContractAddress}
                  initialActiveTabId="supply"
                  earnOnly
                  onSubmitSuccess={closeMarket}
                />
              )
            ) : openedMarket.hub ? (
              <LiquidityHubForm
                inlineHeader={!mobile}
                actionTabsVariant="secondary"
                vhToken={openedMarket.hub.vhToken}
                initialActiveTabId="supply"
                onSubmitSuccess={closeMarket}
              />
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <LiteMarketTable
        className={
          inline || framed
            ? `lite-inline-sources${isE2Sources ? ' lite-e2-earn-sources' : ''}${
                mobile ? ' lite-mobile-table' : ''
              }`
            : undefined
        }
        data={row.markets}
        columns={mobile ? columns.slice(0, 2) : columns}
        rowKeyExtractor={market => market.id}
        rowOnClick={(_, market) => setOpenedMarket(market)}
        initialOrder={{ orderBy: columns[1], orderDirection: 'desc' }}
        tableLayout="auto"
        breakpoint={mobile ? undefined : 'md'}
        hideCardDelimiter
        header={
          <div className={framed ? 'lite-market-toolbar' : undefined}>
            {mobile ? (
              <LiteMarketBreadcrumb mode="Earn" token={row.token} onBackToAssets={onBack} />
            ) : (
              <button
                type="button"
                onClick={onBack}
                aria-label={`Back to Earn assets from ${row.token.symbol}`}
                className="inline-flex items-center gap-2 text-sm text-light-grey hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
              >
                <Icon name="chevronLeft" className="size-4 text-inherit" />
                <span>Earn /</span>
                <span className="inline-flex items-center gap-1">
                  <TokenIcon
                    token={row.token}
                    size="md"
                    className="lite-breadcrumb-token-icon size-4 shrink-0"
                  />
                  <span>{row.token.symbol}</span>
                </span>
              </button>
            )}
            {modeSwitch}
          </div>
        }
      />
      {openedMarket?.asset && (
        <MarketFormModal
          asset={openedMarket.asset}
          poolComptrollerAddress={corePoolComptrollerContractAddress}
          initialActiveTabId="supply"
          earnOnly
          marketName={isFinalSources ? 'Venus Core' : undefined}
          onClose={closeMarket}
        />
      )}
      {openedMarket?.vault && (
        <VenusVaultModal
          isOpen
          vault={openedMarket.vault}
          handleClose={closeMarket}
          tabsVariant="secondary"
          title={
            <span className="inline-flex items-center gap-2 font-normal">
              <TokenIcon token={row.token} size="md" />
              {row.token.symbol} / {openedMarket.name}
            </span>
          }
        />
      )}
      {openedMarket?.hub && (
        <LiquidityHubFormModal
          vhToken={openedMarket.hub.vhToken}
          title={
            <span className="inline-flex items-center gap-2 font-normal">
              <TokenIcon token={row.token} size="md" />
              {row.token.symbol} / {openedMarket.name}
            </span>
          }
          handleClose={closeMarket}
        />
      )}
    </>
  );
}

export default function LiteMarkets() {
  const { t } = useTranslation();
  const isLegacyE2 = useGlassPreview(state => state.mode === 'lite-experiment-v2-legacy');
  const experimental = useGlassPreview(state => isLiteExperimentMode(state.mode));
  const isE2 = useGlassPreview(
    state => state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy',
  );
  const isE3 = useGlassPreview(state => state.mode === 'lite-experiment-v3');
  const desktop = useBreakpointUp('md');
  const mobile = isE2 && !isLegacyE2 && !desktop;
  const [exploreMarkets, setExploreMarkets] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const { corePoolComptrollerContractAddress } = useChain();
  const { accountAddress } = useAccountAddress();
  const poolQuery = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });
  const hubsQuery = useGetLiquidityHubs({ accountAddress });
  const vaultsQuery = useGetVaults({ accountAddress });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useLiteFlow('earnAsset');
  const [selectedBorrow, setSelectedBorrow] = useLiteFlow('borrowAsset');
  const [tabId, setTabId] = useLiteFlow('tab');
  const marketTab = tabId === 'borrow' ? 1 : 0;
  const setMarketTab = (index: number) => setTabId(index === 1 ? 'borrow' : 'markets');
  const modeSwitch = experimental ? (
    <MarketModeSwitch activeIndex={marketTab} onChange={setMarketTab} />
  ) : undefined;
  const setIsLiteMarketDetail = useLayoutStore(state => state.setIsLiteMarketDetail);
  const isMarketDetail = !!(marketTab === 0 ? selected : selectedBorrow);
  useEffect(() => {
    setIsLiteMarketDetail(isMarketDetail);
    return () => setIsLiteMarketDetail(false);
  }, [isMarketDetail, setIsLiteMarketDetail]);
  const rows = aggregateLiteAssets(
    poolQuery.data?.pool
      ? (isE2 && !isLegacyE2
          ? withDemoPrimeDistributions(poolQuery.data.pool, accountAddress)
          : poolQuery.data.pool
        ).assets
      : [],
    hubsQuery.data?.liquidityHubs ?? [],
    corePoolComptrollerContractAddress,
    vaultsQuery.data ?? [],
  );
  const categoryOptions = [
    ...new Map(
      (poolQuery.data?.pool.assets ?? []).flatMap(asset =>
        asset.marketCategory ? [[asset.marketCategory.tag, asset.marketCategory] as const] : [],
      ),
    ).values(),
  ]
    .sort((a, b) => a.order - b.order)
    .map(item => ({ value: item.tag, label: item.label }));
  if (!categoryOptions.some(item => item.value === 'others'))
    categoryOptions.push({ value: 'others', label: 'Others' });
  const categoryFilter = (
    <MultiSelect
      options={categoryOptions}
      value={categories}
      onChange={setCategories}
      placeholder={mobile ? 'Filter' : 'All categories'}
      title="Category"
      searchPlaceholder={t('lite.filters.searchCategory')}
      resetLabel="Reset"
      renderCount={count => (mobile ? `Filter (${count})` : `${count} categories`)}
      className="sm:w-52 shrink-0"
    />
  );
  const active = rows.find(row => row.key === selected);
  const filtered = rows.filter(
    row =>
      (!experimental || matchesEarnCategories(row, categories)) &&
      isVisibleLiteAsset(row, poolQuery.data?.pool.eModeGroups ?? []) &&
      row.token.symbol.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const loading = poolQuery.isLoading || hubsQuery.isLoading;
  const ready = !!poolQuery.data?.pool && !!hubsQuery.data;
  const columns: TableColumn<LiteAsset>[] = [
    {
      key: 'asset',
      label: 'Asset',
      selectOptionLabel: 'Asset',
      renderCell: row => (
        <button
          type="button"
          onClick={() => setSelected(row.key)}
          className={`cursor-pointer hover:text-blue focus-visible:outline-2 focus-visible:outline-blue${
            isE2 && row.token.symbol === 'USDC' ? ' inline-flex items-center gap-1.5' : ''
          }`}
          aria-label={`Compare ${row.token.symbol} markets`}
        >
          <TokenIconWithSymbol token={row.token} size="xl" />
          {isLegacyE2 && row.token.symbol === 'USDC' && <PromotedTokenFire />}
        </button>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: row =>
        experimental && !(isE2 && !isLegacyE2) ? (
          <div className="lite-earn-apy flex justify-end items-center gap-2 whitespace-nowrap">
            <span className="lite-base-apy tabular-nums">{formatEarnApyRange(row)}</span>
            <LegacyEarnPrimeEntry row={row} />
          </div>
        ) : (
          <BestMarketApy row={row} />
        ),
      sortRows: (a, b, direction) =>
        (getEarnOffer(getBestEarnMarket(a)).rankingApy.comparedTo(
          getEarnOffer(getBestEarnMarket(b)).rankingApy,
        ) ?? 0) * (direction === 'desc' ? -1 : 1),
    },
    ...(['liquidity', 'supply'] as const).map(field => ({
      key: field,
      label: field === 'supply' ? 'Total Supply' : 'Liquidity',
      selectOptionLabel: field === 'supply' ? 'Total Supply' : 'Liquidity',
      align: 'right' as const,
      sortRows: (a: LiteAsset, b: LiteAsset, direction: 'asc' | 'desc') =>
        (a[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'].comparedTo(
          b[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'],
        ) ?? 0) * (direction === 'asc' ? 1 : -1),
      renderCell: (row: LiteAsset) => (
        <LiteMarketAmount
          value={amount(row[field], row.token)}
          usdValue={usd(row[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'])}
          symbol={row.token.symbol}
          liquidity={field === 'liquidity'}
        />
      ),
    })),
    ...(isLegacyE2
      ? [
          {
            key: 'earnAction',
            label: <span className="sr-only">Action</span>,
            selectOptionLabel: 'Action',
            align: 'right' as const,
            renderCell: (row: LiteAsset) => (
              <LiteMarketAction
                action="Earn"
                symbol={row.token.symbol}
                promoted={row.token.symbol === 'USDC'}
                onSelect={() => setSelected(row.key)}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <Page>
      <div
        className={`lite-markets${experimental ? ' lite-experiment' : ''}`}
        data-mobile-detail={mobile && isMarketDetail ? 'true' : undefined}
      >
        <GhostBackground />
        {isE2 && (
          <TokenPlanets
            rows={rows.filter(row =>
              isVisibleLiteAsset(row, poolQuery.data?.pool.eModeGroups ?? []),
            )}
            onSelect={row => {
              setSelected(row.key);
            }}
          />
        )}
        <Wrapper className="lite-market-container w-full py-10 sm:py-16">
          <div className="flex flex-col gap-10 sm:gap-12">
            <div className="lite-market-hero lite-enter flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="lite-market-heading">
                <div>
                  <h1 className="venus-interface-mode-label lite-market-title font-bold">
                    Universal Money Markets
                  </h1>
                </div>
                {isE2 && (
                  <p className="lite-e2-hero-subtitle text-light-grey">
                    Simple yet powerful lending and borrowing for any DeFi yield strategy.
                  </p>
                )}
                {!experimental && (
                  <p className="text-light-grey">
                    Simple yet powerful lending and borrowing for any DeFi yield strategy.
                  </p>
                )}
              </div>
              {!isE2 &&
                (experimental ? (
                  <div className="lite-experiment-top-totals">
                    <MarketTotals
                      variant={isE2 || isE3 ? 'inline' : undefined}
                      supplyUpdateIntervalMs={isE3 ? 5000 : undefined}
                    />
                  </div>
                ) : (
                  <MarketTotals />
                ))}
            </div>
            <LiteMarketStage enabled={isE2}>
              {isE2 && (
                <div className="lite-experiment-top-totals">
                  <MarketTotals variant="inline" supplyUpdateIntervalMs={5000} />
                </div>
              )}
              <section
                aria-label={marketTab === 1 ? 'Borrow markets' : 'Earn markets'}
                className="lite-enter lite-enter--markets space-y-6"
              >
                {isE3 && !exploreMarkets && marketTab === 0 ? (
                  <E3ActionCard
                    rows={rows.filter(row =>
                      isVisibleLiteAsset(row, poolQuery.data?.pool.eModeGroups ?? []),
                    )}
                    loading={loading}
                    ready={ready}
                    onExplore={() => setExploreMarkets(true)}
                  />
                ) : (
                  <>
                    {isE3 && (
                      <button
                        type="button"
                        className="text-blue text-sm"
                        onClick={() => {
                          setExploreMarkets(false);
                          setMarketTab(0);
                        }}
                      >
                        Back to quick supply
                      </button>
                    )}
                    <Tabs
                      className={
                        experimental
                          ? `lite-experiment-tabs lite-experiment-tabs--embedded${
                              marketTab === 1 ? ' lite-borrow-selected' : ''
                            }`
                          : undefined
                      }
                      activeTabId={experimental ? (marketTab === 1 ? 'borrow' : 'earn') : undefined}
                      hideHeader={experimental}
                      headerClassName={experimental ? 'lite-mode-pills' : undefined}
                      buttonClassName={experimental ? 'text-xs sm:text-sm' : undefined}
                      activeOnlySemibold
                      variant="tertiary"
                      initialActiveTabId="earn"
                      onTabChange={setMarketTab}
                      tabs={[
                        {
                          id: 'earn',
                          title: 'Earn',
                          content: (
                            <>
                              {active ? (
                                <AssetSources
                                  key={active.key}
                                  row={active}
                                  framed={experimental}
                                  mobile={mobile}
                                  inline={mobile}
                                  // Inside a token the breadcrumb is the way back, so no Earn/Borrow switch here.
                                  onBack={() => setSelected(undefined)}
                                />
                              ) : (
                                <div className={experimental ? 'lite-experiment-earn' : undefined}>
                                  <div
                                    className={
                                      experimental
                                        ? `lite-experiment-scroll${
                                            isE2 ? ' lite-e2-asset-list lite-e2-earn-list' : ''
                                          }`
                                        : undefined
                                    }
                                    data-loading={experimental && loading ? 'true' : undefined}
                                    role={experimental ? 'region' : undefined}
                                    aria-label={
                                      experimental
                                        ? 'Earn token list, scroll for more assets'
                                        : undefined
                                    }
                                    tabIndex={experimental ? 0 : undefined}
                                  >
                                    <LiteMarketTable
                                      data={ready ? filtered : []}
                                      className={mobile ? 'lite-mobile-table' : undefined}
                                      columns={mobile ? columns.slice(0, 2) : columns}
                                      rowKeyExtractor={row => row.key}
                                      rowOnClick={(_, row) => setSelected(row.key)}
                                      initialOrder={{ orderBy: columns[1], orderDirection: 'desc' }}
                                      isFetching={loading}
                                      tableLayout="auto"
                                      breakpoint={mobile ? undefined : 'md'}
                                      hideCardDelimiter
                                      // While loading, keep the table (header + spinner) instead of the
                                      // "unavailable" placeholder, so the card doesn't flash a different layout.
                                      placeholder={
                                        loading ? undefined : !ready ? (
                                          <div className="lite-empty-state" role="status">
                                            <p className="lite-empty-state__title">Market data is unavailable</p>
                                            <p className="lite-empty-state__hint">Please refresh to try again.</p>
                                          </div>
                                        ) : (
                                          <div className="lite-empty-state" role="status">
                                            <svg className="lite-empty-state__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                                              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                            </svg>
                                            <p className="lite-empty-state__title">
                                              {search.trim() ? (
                                                <>No results for <span className="lite-empty-state__query">"{search.trim()}"</span></>
                                              ) : (
                                                'No assets found'
                                              )}
                                            </p>
                                            <p className="lite-empty-state__hint">Try another symbol or clear your search.</p>
                                            {(search || categories.length > 0) && (
                                              <button
                                                type="button"
                                                className="lite-empty-state__clear"
                                                onClick={() => {
                                                  setSearch('');
                                                  setCategories([]);
                                                }}
                                              >
                                                Clear search
                                              </button>
                                            )}
                                          </div>
                                        )
                                      }
                                      header={
                                        <div
                                          className={
                                            experimental ? 'lite-market-toolbar' : undefined
                                          }
                                        >
                                          {modeSwitch}
                                          <div
                                            className={
                                              experimental ? 'lite-experiment-controls' : undefined
                                            }
                                          >
                                            <TextField
                                              aria-label="Search assets"
                                              placeholder="Search asset"
                                              size="sm"
                                              inputContainerClassName="venus-market-search-surface"
                                              leftIconSrc="magnifier"
                                              value={search}
                                              onChange={event => setSearch(event.target.value)}
                                              className="sm:max-w-75"
                                            />
                                            {experimental && categoryFilter}
                                          </div>
                                        </div>
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          ),
                        },
                        {
                          id: 'borrow',
                          title: 'Borrow',
                          content: (
                            <BorrowMarkets
                              mobile={mobile}
                              modeSwitch={modeSwitch}
                              categoryFilter={categoryFilter}
                              experimental={experimental}
                              selected={selectedBorrow}
                              onSelect={setSelectedBorrow}
                              rows={rows.filter(
                                row =>
                                  isVisibleLiteAsset(row, poolQuery.data?.pool.eModeGroups ?? []) &&
                                  matchesEarnCategories(row, categories),
                              )}
                              loading={poolQuery.isLoading}
                              ready={!!poolQuery.data?.pool}
                            />
                          ),
                        },
                      ]}
                    />
                  </>
                )}
                {experimental && !isE2 && !isE3 && (
                  <p className="lite-market-description text-light-grey">
                    Simple yet powerful lending and borrowing for any DeFi yield strategy.
                  </p>
                )}
              </section>
            </LiteMarketStage>
          </div>
        </Wrapper>
        {!experimental && !isMarketDetail && (
          <div className="lite-trust-sections">
            <SafetyExplorer />
            <CommunityExplorer showJoinBanner={false} />
          </div>
        )}
      </div>
    </Page>
  );
}
