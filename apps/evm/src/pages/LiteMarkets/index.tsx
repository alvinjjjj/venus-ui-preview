import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useGetPool, useGetLiquidityHubs } from 'clients/api';
import {
  Apy,
  AssetApy,
  Icon,
  Tabs,
  Page,
  Table,
  type TableColumn,
  TextField,
  Tooltip,
  TokenIconWithSymbol,
  TokenIcon,
  Wrapper,
} from 'components';
import { MarketFormModal } from 'containers/MarketFormModal';
import { LiquidityHubFormModal } from 'containers/LiquidityHubFormModal';
import { PrimeBadge } from 'components/Apy/PrimeBadge';
import { PrimeApy } from 'components/Apy/PrimeBadge/PrimeApy';
import { useChain } from 'hooks/useChain';
import { useAccountAddress } from 'libs/wallet';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import { aggregateLiteAssets } from './data';
import type { LiteAsset, LiteMarket } from './data';
import { GhostBackground } from './GhostBackground';
import { isVisibleLiteAsset } from './visibility';
import { BorrowMarkets } from './BorrowMarkets';
import { MarketTotals } from './MarketTotals';
import { useStore as useLayoutStore } from 'containers/Layout/store';
import { SafetyExplorer } from '../Landing/SafetyExplorer';
import { CommunityExplorer } from '../Landing/CommunityExplorer';
import './entrance.css';
import './trust-sections.css';

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

function BestMarketApy({ row }: { row: LiteAsset }) {
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
  const hasUsdtCore = row.markets.some(
    market =>
      market.asset?.vToken.address.toLowerCase() === '0xfd5840cd36d94d7229439859c0112a4185bc0255',
  );
  return (
    <div className="flex justify-end items-center gap-1 flex-wrap">
      <MarketApy market={best} />
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

function AssetSources({ row, onBack }: { row: LiteAsset; onBack: () => void }) {
  const { corePoolComptrollerContractAddress } = useChain();
  const [openedMarket, setOpenedMarket] = useState<LiteMarket>();
  useEffect(() => {
    if (!openedMarket) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenedMarket(undefined);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openedMarket]);
  const columns: TableColumn<LiteMarket>[] = [
    {
      key: 'yield',
      label: 'Yield',
      selectOptionLabel: 'Yield',
      renderCell: market => (
        <button
          type="button"
          onClick={() => setOpenedMarket(market)}
          aria-haspopup="dialog"
          className="font-normal text-white hover:text-blue text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
        >
          {market.name}
        </button>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: market => <BestMarketApy row={{ ...row, markets: [market] }} />,
      sortRows: (a, b, direction) =>
        (a.apy.comparedTo(b.apy) ?? 0) * (direction === 'desc' ? -1 : 1),
    },
    ...(['liquidity', 'supply'] as const).map(field => ({
      key: field,
      label: field === 'supply' ? 'Total Supply' : 'Liquidity',
      selectOptionLabel: field === 'supply' ? 'Total Supply' : 'Liquidity',
      align: 'right' as const,
      renderCell: (market: LiteMarket) => (
        <div className="tabular-nums">
          {amount(market[field], row.token)} {row.token.symbol}
          <p className="text-light-grey">
            {usd(market[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'])}
          </p>
        </div>
      ),
    })),
  ];

  return (
    <>
      <Table
        data={row.markets}
        columns={columns}
        rowKeyExtractor={market => market.id}
        rowOnClick={(_, market) => setOpenedMarket(market)}
        initialOrder={{ orderBy: columns[1], orderDirection: 'desc' }}
        tableLayout="auto"
        breakpoint="md"
        hideCardDelimiter
        header={
          <button
            type="button"
            onClick={onBack}
            aria-label={`Back to Earn assets from ${row.token.symbol}`}
            className="inline-flex items-center gap-2 text-sm text-light-grey hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
          >
            <Icon name="chevronLeft" className="size-4 text-inherit" />
            <span>Earn /</span>
            <span className="inline-flex items-center gap-1">
              <TokenIcon token={row.token} size="md" className="size-4 shrink-0" />
              <span>{row.token.symbol}</span>
            </span>
          </button>
        }
      />
      {openedMarket?.asset && (
        <MarketFormModal
          asset={openedMarket.asset}
          poolComptrollerAddress={corePoolComptrollerContractAddress}
          initialActiveTabId="supply"
          earnOnly
          onClose={() => setOpenedMarket(undefined)}
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
          handleClose={() => setOpenedMarket(undefined)}
        />
      )}
    </>
  );
}

export default function LiteMarkets() {
  const { corePoolComptrollerContractAddress } = useChain();
  const { accountAddress } = useAccountAddress();
  const poolQuery = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });
  const hubsQuery = useGetLiquidityHubs({ accountAddress });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>();
  const [selectedBorrow, setSelectedBorrow] = useState<string>();
  const [marketTab, setMarketTab] = useState(0);
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
  );
  const active = rows.find(row => row.key === selected);
  const filtered = rows.filter(
    row =>
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
          className="cursor-pointer hover:text-blue focus-visible:outline-2 focus-visible:outline-blue"
          aria-label={`Compare ${row.token.symbol} markets`}
        >
          <TokenIconWithSymbol token={row.token} size="xl" />
        </button>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: row => <BestMarketApy row={row} />,
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
      renderCell: (row: LiteAsset) => (
        <div className="tabular-nums">
          {amount(row[field], row.token)} {row.token.symbol}
          <p className="text-light-grey">
            {usd(row[field === 'supply' ? 'supplyUsd' : 'liquidityUsd'])}
          </p>
        </div>
      ),
    })),
  ];

  return (
    <Page>
      <div className="lite-markets">
        <GhostBackground />
        <Wrapper className="lite-market-container w-full py-10 sm:py-16">
          <div className="flex flex-col gap-10 sm:gap-12">
            <div className="lite-enter flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="lite-market-heading">
                <div>
                  <h1 className="venus-interface-mode-label lite-market-title font-bold">
                    Universal Money Markets
                  </h1>
                </div>
                <p className="text-light-grey">
                  Simple yet powerful lending and borrowing for any DeFi yield strategy.
                </p>
              </div>
              <MarketTotals />
            </div>
            <section aria-label="Earn markets" className="lite-enter lite-enter--markets space-y-6">
              <Tabs
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
                          <AssetSources row={active} onBack={() => setSelected(undefined)} />
                        ) : (
                          <>
                            <Table
                              data={ready ? filtered : []}
                              columns={columns}
                              rowKeyExtractor={row => row.key}
                              rowOnClick={(_, row) => setSelected(row.key)}
                              initialOrder={{ orderBy: columns[1], orderDirection: 'desc' }}
                              isFetching={loading}
                              tableLayout="auto"
                              breakpoint="md"
                              hideCardDelimiter
                              placeholder={
                                !ready
                                  ? 'Market data is unavailable. Please refresh to try again.'
                                  : 'No assets found. Try another symbol.'
                              }
                              header={
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
                              }
                            />
                          </>
                        )}
                      </>
                    ),
                  },
                  {
                    id: 'borrow',
                    title: 'Borrow',
                    content: (
                      <BorrowMarkets
                        selected={selectedBorrow}
                        onSelect={setSelectedBorrow}
                        rows={rows.filter(row =>
                          isVisibleLiteAsset(row, poolQuery.data?.pool.eModeGroups ?? []),
                        )}
                        loading={poolQuery.isLoading}
                        ready={!!poolQuery.data?.pool}
                      />
                    ),
                  },
                ]}
              />
            </section>
          </div>
        </Wrapper>
        {!isMarketDetail && (
          <div className="lite-trust-sections">
            <SafetyExplorer />
            <CommunityExplorer showJoinBanner={false} />
          </div>
        )}
      </div>
    </Page>
  );
}
