import { StatsStackedBarPanel } from './StatsOverviewVisuals';
import { StatsDataTable, StatsPanel, StatsTrendPanel } from './StatsVisuals';
import {
  collateralDistribution,
  eligibleWallets,
  getLiquidationHistory,
  liquidationAssets,
  liquidationMetrics,
  liquidationVolumeChart,
  liquidationWalletChart,
  recentLiquidations,
  topLiquidators,
} from './statsLiquidationData';
import type { StatsMarketRange } from './statsMarketData';

const formatUsd = (value: number) =>
  value >= 1_000 ? `$${Math.round(value / 1_000)}K` : `$${value}`;

const CollateralDistribution = () => (
  <StatsPanel
    title="Collateral Distribution (Last 30 Days)"
    description="Collateral Seized (USD)"
    className="stats-liquidation-distribution"
  >
    <div
      className="stats-liquidation-bar-list"
      role="list"
      aria-label="Collateral seized by asset in the last 30 days"
    >
      {collateralDistribution.map((asset, index) => (
        <div className="stats-liquidation-bar-row" role="listitem" key={asset.name}>
          <span>{asset.name}</span>
          <div className="stats-liquidation-bar-track">
            <div
              className={`stats-liquidation-bar-fill${
                index === 0 ? ' stats-liquidation-bar-fill--leading' : ''
              }`}
              style={{
                width: `${Math.max((asset.value / collateralDistribution[0].value) * 100, 1)}%`,
              }}
            />
            <strong>{formatUsd(asset.value)}</strong>
          </div>
        </div>
      ))}
    </div>
    <div className="stats-liquidation-bar-axis" aria-hidden="true">
      {['$0', '$20K', '$40K', '$60K', '$80K'].map(tick => (
        <span key={tick}>{tick}</span>
      ))}
    </div>
  </StatsPanel>
);

export const StatsLiquidationPage = ({ range }: { range: StatsMarketRange }) => {
  const collateralByWallet = liquidationWalletChart.map(row => ({
    ...row,
    ...Object.fromEntries(liquidationAssets.map(asset => [asset, Number(row[asset]) * 1.1])),
  }));
  const collateralVolume = liquidationVolumeChart.map(row => ({
    ...row,
    'Debt Repaid': row['Debt Repaid'] * 0.87,
    'Collateral Seized': row['Collateral Seized'] * 1.18,
  }));

  return (
    <div className="stats-content stats-liquidation-content">
      <div className="stats-liquidation-metrics">
        {liquidationMetrics.map(metric => (
          <article className="stats-metric-card" data-venus-panel key={metric.label}>
            <span className="stats-metric-label">{metric.label}</span>
            <strong className="stats-metric-value">{metric.value}</strong>
          </article>
        ))}
      </div>

      <StatsTrendPanel
        title="Liquidation Volume Over Time"
        data={getLiquidationHistory(range)}
        tone="red"
        unit="$"
        unitSuffix="M"
        yAxisDomain={[0, 2]}
        yAxisTicks={[0, 0.5, 1, 1.5, 2]}
        className="stats-liquidation-trend"
      />

      <CollateralDistribution />
      <StatsDataTable
        table={recentLiquidations}
        pageSize={50}
        dense
        className="stats-liquidation-events"
      />

      <div className="stats-two-column stats-liquidation-chart-pair">
        <StatsStackedBarPanel
          title="Top Liquidators — Debt Repaid by Asset"
          data={liquidationWalletChart}
          keys={liquidationAssets}
          yAxisDomain={[0, 240]}
          yAxisTicks={[0, 60, 120, 180, 240]}
        />
        <StatsStackedBarPanel
          title="Top Liquidators — Collateral Seized by Asset"
          data={collateralByWallet}
          keys={liquidationAssets}
          yAxisDomain={[0, 240]}
          yAxisTicks={[0, 60, 120, 180, 240]}
        />
      </div>

      <div className="stats-two-column stats-liquidation-chart-pair">
        <StatsStackedBarPanel
          title="Liquidation Volume by Type (30d)"
          data={liquidationVolumeChart}
          keys={['Debt Repaid', 'Collateral Seized', 'Bonus']}
          transaction
        />
        <StatsStackedBarPanel
          title="Collateral Seized by Type (30d)"
          data={collateralVolume}
          keys={['Debt Repaid', 'Collateral Seized', 'Bonus']}
          transaction
        />
      </div>

      <StatsDataTable
        table={eligibleWallets}
        pageSize={50}
        dense
        className="stats-liquidation-wallets"
      />
      <StatsDataTable
        table={topLiquidators}
        pageSize={10}
        dense
        className="stats-liquidation-leaders"
      />
    </div>
  );
};
