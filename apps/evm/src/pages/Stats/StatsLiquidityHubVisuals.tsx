import { ButtonGroup, Icon, Tabs } from 'components';
import { ChartTooltipContent } from 'components/ChartTooltipContent';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { StatsDataTable, StatsMetricCard, StatsPagination, StatsPanel } from './StatsVisuals';
import {
  type LiquidityHubAllocation,
  type LiquidityHubAsset,
  type LiquidityHubAssetData,
  liquidityHubPreviewData,
} from './statsLiquidityHubData';

const hubAssets: LiquidityHubAsset[] = ['USDT', 'USDC', 'U'];
const animateCharts =
  typeof window === 'undefined' ||
  !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
// The shared Figma chart component assigns color by row, across all three groups.
const allocationColors = [
  'var(--color-yellow-hover)',
  'var(--color-orange)',
  'color-mix(in srgb, var(--color-red) 62%, var(--color-blue))',
  'var(--color-blue-active)',
  'var(--color-green)',
  'color-mix(in srgb, var(--color-blue-active) 55%, var(--color-red))',
  'color-mix(in srgb, var(--color-blue-active) 65%, var(--color-white))',
  'var(--stats-muted)',
  'var(--stats-asset-u)',
  'var(--stats-asset-asbnb)',
];

const usd = (value: number) => {
  if (value >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  return `$${(value / 1_000).toFixed(2).replace(/\.?0+$/, '')}K`;
};

const AllocationDonut = ({ group }: { group: LiquidityHubAllocation }) => {
  const data = group.collateral.map((item, index) => ({
    name: item.symbol,
    value: item.allocationUsd,
    color: allocationColors[index],
  }));

  return (
    <StatsPanel title="Allocation backed by collateral" className="stats-hub-donut-panel">
      <div
        className="stats-hub-donut stats-chart"
        role="img"
        aria-label={`${group.name}: ${usd(group.allocatedUsd)} allocation backed by ${
          group.collateral.length
        } collateral assets`}
      >
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="54%"
              outerRadius="82%"
              stroke="var(--color-background)"
              strokeWidth={3}
              isAnimationActive={animateCharts}
              animationDuration={500}
            >
              {data.map(item => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <ChartTooltipContent
                    items={[
                      { label: String(payload[0].name), value: usd(Number(payload[0].value)) },
                    ]}
                  />
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="stats-hub-donut-center" aria-hidden="true">
          <strong>{usd(group.allocatedUsd)}</strong>
          <span>allocated</span>
        </div>
      </div>
      <div className="stats-hub-donut-legend">
        {data.map(item => (
          <div key={item.name}>
            <span className="stats-hub-legend-name">
              <i style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </StatsPanel>
  );
};

const AllocationBars = ({ group }: { group: LiquidityHubAllocation }) => {
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const pageCount = Math.ceil(group.collateral.length / pageSize);
  const max = Math.max(...group.collateral.map(item => item.allocationUsd));

  return (
    <StatsPanel
      title={
        group.id === 'core'
          ? `Allocation backed by ${group.collateral.length} collateral`
          : 'Allocation backed by collateral'
      }
      className="stats-hub-bars-panel"
    >
      <div
        className="stats-hub-bars"
        role="list"
        aria-label={`${group.name} collateral allocation`}
      >
        {group.collateral.slice(page * pageSize, (page + 1) * pageSize).map((item, index) => (
          <div className="stats-hub-bar-row" role="listitem" key={item.symbol}>
            <span>{item.symbol}</span>
            <div className="stats-hub-bar-track">
              <div
                className="stats-hub-bar-fill"
                aria-hidden="true"
                style={{
                  width: `${Math.max(0, item.allocationUsd / max) * 75}%`,
                  backgroundColor:
                    allocationColors[(page * pageSize + index) % allocationColors.length],
                }}
              />
              <strong style={{ left: `${(item.allocationUsd / max) * 75}%` }}>
                {usd(item.allocationUsd)}
              </strong>
            </div>
          </div>
        ))}
      </div>
      {group.collateral.length > pageSize && (
        <StatsPagination
          label={`${group.name} collateral allocation`}
          currentPage={page}
          pageCount={pageCount}
          pageSize={pageSize}
          total={group.collateral.length}
          onPageChange={setPage}
        />
      )}
    </StatsPanel>
  );
};

const OperationHistory = ({ data }: { data: LiquidityHubAssetData }) => (
  <StatsDataTable
    table={{
      title: 'Operation history',
      columns: ['Event Date', 'Action', 'From', 'Value', 'To', 'Value', 'Transaction'],
      rows: data.operations.map(operation => ({
        id: operation.id,
        cells: [
          operation.eventDate,
          operation.action,
          operation.from,
          operation.fromValue,
          operation.to,
          operation.toValue,
          operation.transaction,
        ],
      })),
    }}
    pageSize={20}
    dense
    className="stats-hub-history"
    renderCell={(cell, column, row) => {
      const lineCount = Math.max(...row.cells.map(value => value.split('\n').length));
      const lines = cell.split('\n');
      return Array.from({ length: lineCount }, (_, index) => (
        <span className="stats-hub-history-line" key={`${row.id}-${column}-${index}`}>
          {lines[index] || '\u00a0'}
          {column === 6 && lines[index] && (
            <Icon
              name="open"
              className="stats-hub-transaction-icon"
              aria-label="Transaction external link (design placeholder)"
            />
          )}
        </span>
      ));
    }}
  />
);

export const StatsLiquidityHubPage = ({
  data = liquidityHubPreviewData,
}: {
  data?: Record<LiquidityHubAsset, LiquidityHubAssetData>;
}) => {
  const [asset, setAsset] = useState<LiquidityHubAsset>('USDT');
  const selected = data[asset];
  const summary = [
    ['Total supply', selected.totalSupplyUsd, 'green', 'supply'],
    ['Total allocation', selected.totalAllocationUsd, 'red', 'allocation'],
    ['Total liquidity', selected.totalLiquidityUsd, 'blue', 'liquidity'],
  ] as const;

  return (
    <div className="stats-content stats-hub-page">
      <div className="stats-hub-summary">
        {summary.map(([label, value, tone, series]) => {
          const latestDate = selected.history.at(-1)?.date;
          const comparisonDate = latestDate ? new Date(`${latestDate}T00:00:00Z`) : undefined;
          comparisonDate?.setUTCDate(comparisonDate.getUTCDate() - 30);
          const previous = selected.history.find(
            point => point.date === comparisonDate?.toISOString().slice(0, 10),
          )?.[series];
          const change = previous ? ((value - previous) / previous) * 100 : undefined;
          return (
            <StatsMetricCard
              key={label}
              metric={{
                label,
                value: usd(value),
                tone,
                change:
                  change === undefined
                    ? undefined
                    : `${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(2)}%`,
                comparisonLabel: 'vs 30 days ago',
                pointUnit: 'usd-billions',
                points: selected.history.map(point => ({
                  date: point.date,
                  value: point[series] / 1_000_000_000,
                })),
              }}
              prominent
            />
          );
        })}
      </div>

      <div className="stats-hub-asset-control">
        <span>Liquidity hub</span>
        <ButtonGroup
          ariaLabel="Liquidity hub asset"
          className="stats-hub-assets"
          buttonLabels={hubAssets}
          activeButtonIndex={hubAssets.indexOf(asset)}
          onButtonClick={index => setAsset(hubAssets[index])}
          buttonSize="sm"
        />
      </div>

      <Tabs
        variant="tertiary"
        className="stats-hub-detail-tabs"
        headerClassName="stats-hub-detail-tab-list"
        tabs={[
          {
            id: 'collateral',
            title: 'Collateral details',
            content: (
              <div
                className="stats-hub-allocation-list"
                role="tabpanel"
                aria-label="Collateral details"
              >
                {selected.allocations.map(group => (
                  <section className="stats-hub-allocation" key={group.id}>
                    <h2>{group.name}</h2>
                    <div className="stats-hub-allocation-grid">
                      <AllocationDonut group={group} />
                      <AllocationBars group={group} />
                    </div>
                  </section>
                ))}
              </div>
            ),
          },
          {
            id: 'history',
            title: 'Operation history',
            content: (
              <div role="tabpanel" aria-label="Operation history">
                <OperationHistory data={selected} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
