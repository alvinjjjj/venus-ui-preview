import { PromotedTokenFire } from './PromotedTokenFire';
import { LiteMarketAction } from './LiteMarketAction';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetPool, useGetLiquidityHubs, useGetVaults } from 'clients/api';
import { VenusVaultModal } from 'containers/VenusVaultModal';
import {
  Apy,
  AssetApy,
  Icon,
  Tabs,
  Page,
  type TableColumn,
  TextField,
  Tooltip,
  TokenIconWithSymbol,
  TokenIcon,
  MultiSelect,
  Wrapper,
} from 'components';
import { MarketFormModal } from 'containers/MarketFormModal';
import { MarketForm } from 'containers/MarketForm';
import { LiquidityHubForm } from 'containers/LiquidityHubForm';
import { GatedAssetAcknowledgementModal } from 'containers/GatedAssetAcknowledgementModal';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import { LiquidityHubFormModal } from 'containers/LiquidityHubFormModal';
import { PrimeBadge } from 'components/Apy/PrimeBadge';
import { PrimeApy } from 'components/Apy/PrimeBadge/PrimeApy';
import { useChain } from 'hooks/useChain';
import { useBreakpointUp } from 'hooks/responsive';
import { useAccountAddress } from 'libs/wallet';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import { useDemoVhMarketStore } from 'demo/demoVhMarket';
import { aggregateLiteAssets } from './data';
import type { LiteAsset, LiteMarket } from './data';
import { E3ActionCard } from './E3ActionCard';
import { LiteMarketStage } from './LiteMarketStage';
import { TokenPlanets } from './TokenPlanets';
import { GhostBackground } from './GhostBackground';
import { isVisibleLiteAsset } from './visibility';
import { BorrowMarkets } from './BorrowMarkets';
import { MarketTotals } from './MarketTotals';
import { MarketModeSwitch } from './MarketModeSwitch';
import { LiteMarketBreadcrumb } from './LiteMarketBreadcrumb';
import { LiteMarketAmount } from './LiteMarketAmount';
import { LiteMarketTable } from './LiteMarketTable';
import { useStore as useLayoutStore } from 'containers/Layout/store';
import { SafetyExplorer } from '../Landing/SafetyExplorer';
import { CommunityExplorer } from '../Landing/CommunityExplorer';
import './entrance.css';
import './trust-sections.css';
import './experiment.css';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { isLiteExperimentMode } from 'demo/GlassVersions/variants';
import { formatEarnApyRange, matchesEarnCategories } from './experiment';
import getCombinedApy from 'utilities/getCombinedApy';

function MarketApy({ market }: { market: LiteMarket }) {
  if (market.asset) return <AssetApy asset={market.asset} type="supply" />;
  if (market.hub)
    return (
      <Apy
        type="supply"
        token={market.hub.vhToken.underlyingToken}
        baseApyPercentage={market.hub.supplyApyPercentage}
        tokenDistributions={market.hub.supplyTokenDistributions}
        userBalanceTokens={market.hub.userSupplyBalanceTokens}
      />
    );
  return null;
}

const usd = (value: BigNumber) => formatCentsToReadableValue({ value });
const amount = (value: BigNumber, token: LiteAsset['token']) =>
  formatTokensToReadableValue({ value, token, addSymbol: false });
const highestApyMarket = (row: LiteAsset) =>
  row.markets.reduce((best, market) => (market.apy.gt(best.apy) ? market : best));
const hasUsdtCoreMarket = (row: LiteAsset) => row.markets.some(
  market => market.asset?.vToken.address.toLowerCase() === '0xfd5840cd36d94d7229439859c0112a4185bc0255',
);

function BestMarketApy({ row, plain = false, primeOnly = false }: { row: LiteAsset; plain?: boolean; primeOnly?: boolean }) {
  if (primeOnly) return <EarnPrimeEntry row={row} />;
  const best = highestApyMarket(row);
  // Keep the highest market's APY, but do not lose a different market's Prime offer.
  // The badge uses that Core market's total, never Hub APY plus Core rewards.
  const bestHasPrime = best.asset?.supplyTokenDistributions.some(
    d => d.isActive && (d.type === 'prime' || d.type === 'primeSimulation'),
  );
  const primeOptions = row.markets
    .flatMap(market => {
      const asset = market.asset;
      if (!asset || market.id === best.id) return [];
      const simulation = asset.supplyTokenDistributions.find(
        d => d.type === 'primeSimulation' && d.isActive,
      );
      const earned = asset.supplyTokenDistributions.some(d => d.type === 'prime' && d.isActive);
      if (!simulation && !earned) return [];
      return [
        {
          asset,
          apy: market.apy.plus(simulation?.apyPercentage ?? 0),
          references:
            simulation?.type === 'primeSimulation' ? simulation.referenceValues : undefined,
        },
      ];
    })
    .sort((a, b) => b.apy.comparedTo(a.apy) ?? 0);
  const prime = primeOptions[0];
  // User-provided screenshot reference; display only, never used in market calculations.
  const hasUsdtCore = hasUsdtCoreMarket(row);
  return (
    <div className="flex justify-end items-center gap-1 flex-wrap">
      {plain && !bestHasPrime ? <span className="lite-base-apy tabular-nums font-semibold">{best.apy.isFinite() ? `${best.apy.toFixed(2)}%` : '—'}</span> : <MarketApy market={best} />}
      {!bestHasPrime && !prime && hasUsdtCore && (
        <Tooltip content="Prime APY reference from supplied screenshot; not a live rate.">
          <PrimeApy
            apyPercentage={new BigNumber(9.82)}
            aria-label="Prime APY reference: 9.82%, not a live rate"
          />
        </Tooltip>
      )}
      {!bestHasPrime && prime && (
        <span
          aria-label="Prime APY on Venus Core"
          title="Prime APY on Venus Core — a separate market from the displayed highest APY"
        >
          <PrimeBadge
            type="supply"
            token={row.token}
            vTokenAddress={prime.asset.vToken.address}
            simulatedApyPercentage={prime.apy}
            simulationReferenceValues={prime.references}
          />
        </span>
      )}
    </div>
  );
}

// E: the APY range is plain text, so show the Prime entry point next to it whenever any of the
// asset's markets offers Prime (same badge and tooltip as the other modes).
function EarnPrimeEntry({ row }: { row: LiteAsset }) {
  const options = row.markets
    .flatMap(market => {
      const asset = market.asset;
      if (!asset) return [];
      const simulation = asset.supplyTokenDistributions.find(
        d => d.type === 'primeSimulation' && d.isActive,
      );
      const earned = asset.supplyTokenDistributions.some(d => d.type === 'prime' && d.isActive);
      if (!simulation && !earned) return [];
      return [
        {
          asset,
          apy: market.apy.plus(simulation?.apyPercentage ?? 0),
          references:
            simulation?.type === 'primeSimulation' ? simulation.referenceValues : undefined,
        },
      ];
    })
    .sort((a, b) => b.apy.comparedTo(a.apy) ?? 0);
  const prime = options[0];
  const hasUsdtCore = hasUsdtCoreMarket(row);
  if (prime) {
    return (
      <span aria-label="Prime APY on Venus Core" title="Prime APY on Venus Core">
        <PrimeBadge
          type="supply"
          token={row.token}
          vTokenAddress={prime.asset.vToken.address}
          simulatedApyPercentage={prime.apy}
          simulationReferenceValues={prime.references}
        />
      </span>
    );
  }
  if (hasUsdtCore) {
    return (
      <Tooltip content="Prime APY reference from supplied screenshot; not a live rate.">
        <PrimeApy
          apyPercentage={new BigNumber(9.82)}
          aria-label="Prime APY reference: 9.82%, not a live rate"
        />
      </Tooltip>
    );
  }
  return null;
}

function AssetSources({
  row,
  onBack,
  inline = false,
  framed = false,
  mobile = false,
  modeSwitch,
}: { row: LiteAsset; onBack: () => void; inline?: boolean; framed?: boolean; mobile?: boolean; modeSwitch?: React.ReactNode }) {
  const { corePoolComptrollerContractAddress } = useChain();
  const [userChainSettings] = useUserChainSettings();
  const isFinalSources = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const singleMarket = isFinalSources && row.markets.length === 1 ? row.markets[0] : undefined;
  const [openedMarket, setOpenedMarket] = useState<LiteMarket | undefined>(singleMarket);
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
    else setOpenedMarket(undefined);
  }, [singleMarket, onBack]);
  const mobileFormRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (mobile && openedMarket) {
      mobileFormRef.current?.scrollIntoView?.({ block: 'start' });
    }
  }, [mobile, openedMarket]);
  const isE2Sources = useGlassPreview(state => (state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy'));
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
        const sourceRow = { ...row, markets: [market] };
        const showPrimeComparison = mobile && (hasUsdtCoreMarket(sourceRow) || market.asset?.supplyTokenDistributions.some(
          distribution => distribution.isActive && (distribution.type === 'prime' || distribution.type === 'primeSimulation'),
        ));
        const ordinaryApy = showPrimeComparison && market.asset
          ? getCombinedApy({
              type: 'supply',
              baseApyPercentage: market.asset.supplyApyPercentage,
              tokenDistributions: market.asset.supplyTokenDistributions.filter(
                distribution => distribution.type !== 'prime' && distribution.type !== 'primeSimulation',
              ),
            }).totalApyPercentage
          : market.apy;
        return (
          <div className="lite-source-apy">
            <div className="lite-source-apy-value">
              {showPrimeComparison ? (
                <div className="lite-source-apy-rates">
                  <span className="lite-base-apy tabular-nums font-semibold">{ordinaryApy.isFinite() ? `${ordinaryApy.toFixed(2)}%` : '—'}</span>
                  <EarnPrimeEntry row={sourceRow} />
                </div>
              ) : (
                <BestMarketApy row={sourceRow} plain={isE2Sources} />
              )}
            </div>
          </div>
        );
      },
      sortRows: (a, b, direction) =>
        (a.apy.comparedTo(b.apy) ?? 0) * (direction === 'desc' ? -1 : 1),
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
            <TokenIcon token={row.token} size="md" className="lite-breadcrumb-token-icon size-4" />
            {row.token.symbol}
          </button>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{isFinalSources && openedMarket.asset ? 'Venus Core' : openedMarket.name}</span>
        </nav>
        )}
        <div className="lite-inline-market-body" key={openedMarket.id}>
          <div className="lite-inline-market-form">
            {openedMarket.asset ? (
              openedMarket.asset.isGated && !userChainSettings.doNotShowGatedAssetModal ? (
                <GatedAssetAcknowledgementModal
                  inline
                  onReject={closeMarket}
                />
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
        className={inline || framed ? `lite-inline-sources${isE2Sources ? ' lite-e2-earn-sources' : ''}${mobile ? ' lite-mobile-table' : ''}` : undefined}
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
              <TokenIcon token={row.token} size="md" className="lite-breadcrumb-token-icon size-4 shrink-0" />
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
  const isLegacyE2 = useGlassPreview(state => state.mode === 'lite-experiment-v2-legacy');
  const experimental = useGlassPreview(state => isLiteExperimentMode(state.mode));
  const isE2 = useGlassPreview(state => (state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy'));
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
  const [selected, setSelected] = useState<string>();
  const [selectedBorrow, setSelectedBorrow] = useState<string>();
  const [marketTab, setMarketTab] = useState(0);
  const modeSwitch = experimental ? <MarketModeSwitch activeIndex={marketTab} onChange={setMarketTab} /> : undefined;
  const setIsLiteMarketDetail = useLayoutStore(state => state.setIsLiteMarketDetail);
  const isMarketDetail = !!(marketTab === 0 ? selected : selectedBorrow);
  useEffect(() => {
    setIsLiteMarketDetail(isMarketDetail);
    return () => setIsLiteMarketDetail(false);
  }, [isMarketDetail, setIsLiteMarketDetail]);
  const rows = aggregateLiteAssets(
    poolQuery.data?.pool.assets ?? [],
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
      resetLabel="Reset"
      renderCount={count => mobile ? `Filter (${count})` : `${count} categories`}
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
          className={`cursor-pointer hover:text-blue focus-visible:outline-2 focus-visible:outline-blue${isE2 && row.token.symbol === 'USDC' ? ' inline-flex items-center gap-1.5' : ''}`}
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
        experimental ? (
          <div className="lite-earn-apy flex justify-end items-center gap-2 whitespace-nowrap">
            {!(isE2 && !isLegacyE2 && hasUsdtCoreMarket(row)) && <span
              className="lite-base-apy tabular-nums"
              title="Current APY across the selected markets; excludes conditional Prime simulations."
            >
              {isE2 && !isLegacyE2 ? `${highestApyMarket(row).apy.toFixed(2)}%` : formatEarnApyRange(row)}
            </span>}
            <EarnPrimeEntry row={row} />
          </div>
        ) : (
          <BestMarketApy row={row} />
        ),
      sortRows: (a, b, direction) =>
        (BigNumber.maximum(...a.markets.map(m => m.apy)).comparedTo(
          BigNumber.maximum(...b.markets.map(m => m.apy)),
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
    ...(isLegacyE2 ? [{
      key: 'earnAction', label: <span className="sr-only">Action</span>, selectOptionLabel: 'Action', align: 'right' as const,
      renderCell: (row: LiteAsset) => <LiteMarketAction action="Earn" symbol={row.token.symbol} promoted={row.token.symbol === 'USDC'} onSelect={() => setSelected(row.key)} />,
    }] : []),
  ];

  return (
    <Page>
      <div className={`lite-markets${experimental ? ' lite-experiment' : ''}`} data-mobile-detail={mobile && isMarketDetail ? 'true' : undefined}>
        <GhostBackground />
        {isE2 && <TokenPlanets
          rows={rows.filter(row => isVisibleLiteAsset(row, poolQuery.data?.pool.eModeGroups ?? []))}
          onSelect={row => { setMarketTab(0); setSelected(row.key); }}
        />}
        <Wrapper className="lite-market-container w-full py-10 sm:py-16">
          <div className="flex flex-col gap-10 sm:gap-12">
            <div className="lite-market-hero lite-enter flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="lite-market-heading">
                <div>
                  <h1 className="venus-interface-mode-label lite-market-title font-bold">
                    Universal Money Markets
                  </h1>
                </div>
                {isE2 && <p className="lite-e2-hero-subtitle text-light-grey">Simple yet powerful lending and borrowing for any DeFi yield strategy.</p>}
                {!experimental && <p className="text-light-grey">
                  Simple yet powerful lending and borrowing for any DeFi yield strategy.
                </p>}
              </div>
              {!isE2 && (experimental ? (
                <div className="lite-experiment-top-totals"><MarketTotals variant={isE2 || isE3 ? 'inline' : undefined} supplyUpdateIntervalMs={isE3 ? 5000 : undefined} /></div>
              ) : <MarketTotals />)}
            </div>
            <LiteMarketStage enabled={isE2}>
            {isE2 && <div className="lite-experiment-top-totals"><MarketTotals variant="inline" supplyUpdateIntervalMs={5000} /></div>}
            <section aria-label={marketTab === 1 ? 'Borrow markets' : 'Earn markets'} className="lite-enter lite-enter--markets space-y-6">
              {isE3 && !exploreMarkets && marketTab === 0 ? (
                <E3ActionCard
                  rows={rows.filter(row => isVisibleLiteAsset(row, poolQuery.data?.pool.eModeGroups ?? []))}
                  loading={loading}
                  ready={ready}
                  onExplore={() => setExploreMarkets(true)}
                />
              ) : (
              <>
              {isE3 && <button type="button" className="text-blue text-sm" onClick={() => { setExploreMarkets(false); setMarketTab(0); }}>Back to quick supply</button>}
              <Tabs
                className={experimental ? `lite-experiment-tabs lite-experiment-tabs--embedded${marketTab === 1 ? ' lite-borrow-selected' : ''}` : undefined}
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
                              className={experimental ? `lite-experiment-scroll${isE2 ? ' lite-e2-asset-list lite-e2-earn-list' : ''}` : undefined}
                              data-loading={experimental && loading ? 'true' : undefined}
                              role={experimental ? 'region' : undefined}
                              aria-label={
                                experimental ? 'Earn token list, scroll for more assets' : undefined
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
                                  loading
                                    ? undefined
                                    : !ready
                                      ? 'Market data is unavailable. Please refresh to try again.'
                                      : 'No assets found. Try another symbol.'
                                }
                                header={
                                  <div className={experimental ? 'lite-market-toolbar' : undefined}>
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
                        rows={rows.filter(row =>
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
