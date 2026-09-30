import { ButtonGroup, Page, Select } from 'components';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useTranslation } from 'libs/translations';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { StatsLiquidationPage } from './StatsLiquidationVisuals';
import { StatsLiquidityHubPage } from './StatsLiquidityHubVisuals';
import { MarketAssetSelect, StatsMarketPage } from './StatsMarketVisuals';
import { StatsStackedAreaPanel, StatsStackedBarPanel } from './StatsOverviewVisuals';
import {
  StatsCollateralPage,
  StatsPositionExplorerPage,
  StatsWalletsPage,
} from './StatsPositionsVisuals';
import { StatsBadDebtPage, StatsRatesPage, StatsRiskPage } from './StatsRatesRiskVisuals';
import { StatsDataTable, StatsMetricGrid, StatsTrendPanel } from './StatsVisuals';
import { type StatsMarketAsset, statsMarketAssets } from './statsMarketData';
import { chartAssets } from './statsOverviewData';
import { type StatsDashboardData, statsPreviewData } from './statsPreviewData';
import './styles.css';

const views = [
  { id: 'overview', label: 'Overview' },
  { id: 'market', label: 'Market' },
  { id: 'liquidations', label: 'Liquidations' },
  { id: 'rates', label: 'Rates' },
  { id: 'risk', label: 'Risk' },
  { id: 'bad-debt', label: 'Bad Debt Users' },
  { id: 'users', label: 'User Position Explorer' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'collateral', label: 'Collateral' },
  { id: 'liquidity-hub', label: 'Liquidity Hub' },
] as const;

type StatsView = (typeof views)[number]['id'];
type StatsTimeRange = '1D' | '1W' | '1M' | '1Y';
const timeRanges: StatsTimeRange[] = ['1D', '1W', '1M', '1Y'];

const rangeLengths: Record<StatsTimeRange, number> = {
  '1D': 3,
  '1W': 8,
  '1M': 20,
  '1Y': Number.POSITIVE_INFINITY,
};
const visiblePoints = <T,>(points: T[], range: StatsTimeRange): T[] =>
  points.slice(-rangeLengths[range]);

const isStatsView = (value: string | null): value is StatsView =>
  views.some(view => view.id === value);

const viewDescriptions: Record<StatsView, string> = {
  overview: 'The protocol at a glance: supply, debt, liquidation exposure and positions.',
  market: 'Supply, borrow, utilization and pricing across Venus BNB Core Pool markets.',
  liquidations: 'Liquidation activity, collateral seized, and debt repaid',
  rates: 'Borrow and supply APY trends for top stablecoins and BNB',
  risk: 'Collateral exposure under hypothetical price drawdowns',
  'bad-debt': 'Wallets with borrows exceeding collateral value',
  users: 'Look up supply, borrow, and health factor by wallet address',
  wallets: 'Filterable view of all wallet positions and liquidation risk',
  collateral: 'Protocol-wide collateral and debt attribution by asset',
  'liquidity-hub': '',
};

const StatsContent = ({
  view,
  data,
  range,
  marketAsset,
}: {
  view: StatsView;
  data: StatsDashboardData;
  range: StatsTimeRange;
  marketAsset: StatsMarketAsset;
}) => {
  const points = <T,>(values: T[]) => visiblePoints(values, range);

  if (view === 'overview') {
    return (
      <div className="stats-content">
        <StatsMetricGrid
          metrics={data.overview.hero.map(metric => ({
            ...metric,
            points: metric.points ? points(metric.points) : undefined,
          }))}
          prominent
        />
        <StatsMetricGrid metrics={data.overview.kpis} />
        <StatsTrendPanel
          title="Total value locked over time"
          data={points(data.overview.tvl)}
          tone="blue"
          unit="$"
          unitSuffix="B"
          yAxisDomain={[0, 2]}
          yAxisTicks={[0, 0.5, 1, 1.5, 2]}
          className="stats-trend-panel--overview"
        />
        <div className="stats-section-heading">
          <h2>Protocol Composition</h2>
          <p>Deposits and borrows by asset</p>
        </div>
        <div className="stats-two-column">
          <StatsStackedAreaPanel
            title="Deposits by asset"
            data={points(data.overview.details.depositsHistory)}
          />
          <StatsStackedAreaPanel
            title="Borrows by asset"
            data={points(data.overview.details.borrowsHistory)}
          />
        </div>
        <div className="stats-section-heading">
          <h2>Total Supply and Debt as a Percentage of TVL</h2>
          <p>Protocol breakdown</p>
        </div>
        <div className="stats-two-column">
          <StatsTrendPanel
            title="Supply Dominance Chart"
            data={points(data.overview.details.supplyDominance)}
            tone="red"
            unitSuffix="%"
            yAxisDomain={[28, 48]}
            yAxisTicks={[28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48]}
            className="stats-trend-panel--dominance"
          />
          <StatsTrendPanel
            title="Debt Dominance Chart"
            data={points(data.overview.details.debtDominance)}
            tone="red"
            unitSuffix="%"
            yAxisDomain={[28, 48]}
            yAxisTicks={[28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48]}
            className="stats-trend-panel--dominance"
          />
        </div>
        <div className="stats-section-heading">
          <h2>Top Borrowers &amp; Suppliers</h2>
          <p>Largest individual positions on Venus BNB Core Pool by supply and borrow value</p>
        </div>
        <div className="stats-two-column">
          <StatsStackedBarPanel
            title="Top Suppliers - Supply vs Borrows"
            data={data.overview.details.topSuppliers}
            keys={chartAssets}
          />
          <StatsStackedBarPanel
            title="Top Borrowers - Supply vs Borrows"
            data={data.overview.details.topBorrowers}
            keys={chartAssets}
          />
        </div>
        <StatsDataTable table={data.overview.details.marketTable} dense />
        <StatsDataTable table={data.overview.details.riskTable} dense />
        <StatsDataTable table={data.overview.details.emodeTable} dense />
        <StatsStackedBarPanel
          title="Transaction Volumes by Type (30d)"
          data={data.overview.details.transactions}
          keys={['Supply', 'Withdraw', 'Borrow', 'Repay']}
          transaction
        />
      </div>
    );
  }

  if (view === 'market') {
    return <StatsMarketPage asset={marketAsset} range={range} />;
  }

  if (view === 'liquidations') {
    return <StatsLiquidationPage range={range} />;
  }

  if (view === 'rates') {
    return <StatsRatesPage range={range} />;
  }

  if (view === 'risk') {
    return <StatsRiskPage />;
  }

  if (view === 'bad-debt') {
    return <StatsBadDebtPage range={range} />;
  }

  if (view === 'users') {
    return <StatsPositionExplorerPage />;
  }

  if (view === 'wallets') {
    return <StatsWalletsPage />;
  }

  if (view === 'liquidity-hub') {
    return <StatsLiquidityHubPage />;
  }

  return <StatsCollateralPage />;
};

/** All views share this contract; the Venus risk API can provide data here later. */
export const StatsDashboard = ({ data = statsPreviewData }: { data?: StatsDashboardData }) => {
  const { t } = useTranslation();
  const isNew = useGlassPreview(state => state.mode === 'v5');
  const [searchParams, setSearchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState<StatsTimeRange>('1Y');
  const [marketAsset, setMarketAsset] = useState(statsMarketAssets[0]);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const viewParam = searchParams.get('view');
  const activeView: StatsView = isStatsView(viewParam) ? viewParam : 'overview';
  const activeViewLabel = views.find(view => view.id === activeView)?.label ?? 'Overview';

  useEffect(() => {
    const strip = tabsScrollRef.current;
    const activeTab = document.getElementById(`stats-tab-${activeView}`);
    if (!strip || !activeTab) return;
    strip.scrollLeft += activeTab.getBoundingClientRect().left - strip.getBoundingClientRect().left;
  }, [activeView]);

  const changeView = (view: StatsView) => {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      if (view === 'overview') next.delete('view');
      else next.set('view', view);
      return next;
    });
  };

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + direction + views.length) % views.length;
    changeView(views[nextIndex].id);
    document.getElementById(`stats-tab-${views[nextIndex].id}`)?.focus();
  };

  return (
    <Page>
      <main className={`stats-page stats-page--${activeView}`}>
        <div className="stats-shell">
          {activeView !== 'overview' && (
            <Select
              className="stats-mobile-view-select"
              value={activeView}
              onChange={value => {
                if (isStatsView(String(value))) changeView(String(value) as StatsView);
              }}
              options={views.map(view => ({ label: view.label, value: view.id }))}
              size="medium"
            />
          )}
          <div className="stats-tabs-scroll" ref={tabsScrollRef}>
            <div className="stats-tabs" role="tablist" aria-label="Stats sections">
              {views.map((view, index) => (
                <button
                  key={view.id}
                  id={`stats-tab-${view.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeView === view.id}
                  aria-controls="stats-active-panel"
                  tabIndex={activeView === view.id ? 0 : -1}
                  onClick={() => changeView(view.id)}
                  onKeyDown={event => onTabKeyDown(event, index)}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          <header className="stats-page-header">
            <div>
              <div className="stats-page-title-row">
                <h1>{activeView === 'overview' ? t('statsPage.title') : activeViewLabel}</h1>
                {activeView === 'market' && (
                  <MarketAssetSelect asset={marketAsset} onChange={setMarketAsset} />
                )}
              </div>
              {activeView !== 'liquidity-hub' && (
                <p>
                  {activeView === 'overview'
                    ? 'Key risk metrics for Venus BNB Core Pool — total supply, borrows, TVL, liquidation exposure, wallets at risk, and bad debt.'
                    : viewDescriptions[activeView]}
                </p>
              )}
            </div>
            {activeView !== 'liquidity-hub' && (
              <div className="stats-header-actions">
                {isNew ? (
                  <ButtonGroup
                    ariaLabel="Chart time range"
                    className="stats-time-range"
                    buttonLabels={timeRanges}
                    activeButtonIndex={timeRanges.indexOf(timeRange)}
                    onButtonClick={index => setTimeRange(timeRanges[index])}
                    buttonSize="xs"
                  />
                ) : (
                  <div className="stats-time-range" role="group" aria-label="Chart time range">
                    {timeRanges.map(range => (
                      <button
                        key={range}
                        type="button"
                        aria-pressed={timeRange === range}
                        onClick={() => setTimeRange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </header>

          <div id="stats-active-panel" role="tabpanel" aria-labelledby={`stats-tab-${activeView}`}>
            <StatsContent
              view={activeView}
              data={data}
              range={timeRange}
              marketAsset={marketAsset}
            />
          </div>
        </div>
      </main>
    </Page>
  );
};

export default StatsDashboard;
