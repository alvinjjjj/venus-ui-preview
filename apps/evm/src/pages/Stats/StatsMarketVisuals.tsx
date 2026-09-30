import { ChainId, tokens } from '@venusprotocol/chains';
import { theme } from '@venusprotocol/ui';
import { ChartTooltipContent } from 'components/ChartTooltipContent';
import { Dropdown } from 'components/Dropdown';
import { TokenListWrapper } from 'containers/TokenListWrapper';
import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatsDropdownTrigger } from './StatsDropdownTrigger';
import { StatsMetricCard } from './StatsVisuals';
import {
  type StatsMarketAsset,
  formatMarketUsd,
  makeMarketHistory,
  makeMarketSparkline,
  statsMarketAssets,
} from './statsMarketData';
import type { StatsMetric } from './statsPreviewData';

type MarketRange = '1D' | '1W' | '1M' | '1Y';
type MarketSeries = 'supply' | 'borrow' | 'liquidity';

const series: { key: MarketSeries; label: string; color: string }[] = [
  { key: 'supply', label: 'Total Supply', color: theme.colors.green },
  { key: 'borrow', label: 'Total Borrow', color: theme.colors.red },
  { key: 'liquidity', label: 'Liquidity', color: theme.colors.blue },
];

const marketTokens = tokens[ChainId.BSC_MAINNET].filter(token =>
  statsMarketAssets.some(asset => asset.symbol === token.symbol),
);

const comparisonLabels: Record<MarketRange, string> = {
  '1D': 'over 1 day',
  '1W': 'over 1 week',
  '1M': 'over 1 month',
  '1Y': 'over 1 year',
};

export const MarketAssetSelect = ({
  asset,
  onChange,
}: { asset: StatsMarketAsset; onChange: (asset: StatsMarketAsset) => void }) => {
  const [open, setOpen] = useState(false);
  const selectedToken =
    marketTokens.find(token => token.symbol === asset.symbol) ?? marketTokens[0];

  return (
    <TokenListWrapper
      className="stats-market-asset-select"
      tokenBalances={marketTokens.map(token => ({ token }))}
      selectedToken={selectedToken}
      isListShown={open}
      displayCommonTokenButtons={false}
      onClose={() => setOpen(false)}
      onTokenClick={token => {
        const nextAsset = statsMarketAssets.find(item => item.symbol === token.symbol);
        if (nextAsset) onChange(nextAsset);
      }}
    >
      <StatsDropdownTrigger
        label={asset.symbol}
        ariaLabel={`Market asset: ${asset.symbol}`}
        expanded={open}
        onClick={() => setOpen(current => !current)}
      />
    </TokenListWrapper>
  );
};

const MarketHistoryChart = ({ asset, range }: { asset: StatsMarketAsset; range: MarketRange }) => {
  const [visible, setVisible] = useState<MarketSeries[]>(['supply', 'borrow', 'liquidity']);
  const data = useMemo(() => makeMarketHistory(asset, range), [asset, range]);
  const tickCount = Math.min(5, data.length);
  const dateTicks = Array.from(
    { length: tickCount },
    (_, index) => data[Math.round((index * (data.length - 1)) / Math.max(1, tickCount - 1))].date,
  );

  const toggleSeries = (key: MarketSeries) => {
    setVisible(current =>
      current.includes(key)
        ? current.length === 1
          ? current
          : current.filter(item => item !== key)
        : [...current, key],
    );
  };

  return (
    <section
      className="stats-market-history"
      data-venus-panel
      aria-label={`${asset.symbol} market history`}
    >
      <div className="stats-market-history-heading">
        <div>
          <p>{asset.symbol} data</p>
          <strong>{formatMarketUsd(asset.supplyMillions)}</strong>
          <div className="stats-market-series-key" aria-label="Visible chart series">
            {series
              .filter(item => visible.includes(item.key))
              .map(item => (
                <span key={item.key}>
                  <i style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
          </div>
        </div>
        <Dropdown
          className="stats-market-filter"
          menuPosition="right"
          matchTriggerWidth
          menuClassName="stats-market-filter-menu"
          optionsDom={() => (
            <div className="stats-market-filter-options" aria-label="Chart series filter">
              {series.map(item => (
                <label key={item.key}>
                  <input
                    type="checkbox"
                    checked={visible.includes(item.key)}
                    onChange={() => toggleSeries(item.key)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          )}
        >
          {({ isDropdownOpen, handleToggleDropdown }) => (
            <StatsDropdownTrigger
              label="Filter"
              ariaLabel="Chart series filter"
              expanded={isDropdownOpen}
              onClick={handleToggleDropdown}
            />
          )}
        </Dropdown>
      </div>
      <div
        className="stats-market-history-chart stats-chart"
        role="img"
        aria-label={`${asset.symbol} supply, borrow and liquidity over time`}
      >
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 12, right: 24, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="stats-market-liquidity-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.colors.blue} stopOpacity={0.26} />
                <stop offset="100%" stopColor={theme.colors.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={theme.colors['dark-blue-hover']} />
            <XAxis
              dataKey="date"
              ticks={dateTicks}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
              stroke={theme.colors['light-grey']}
            />
            <YAxis
              tickFormatter={formatMarketUsd}
              tickLine={false}
              axisLine={false}
              width={58}
              stroke={theme.colors['light-grey']}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltipContent
                    items={[
                      { label: 'Date', value: String(label ?? '') },
                      ...series
                        .filter(item => visible.includes(item.key))
                        .map(item => ({
                          label: item.label,
                          value: formatMarketUsd(
                            Number(payload.find(point => point.dataKey === item.key)?.value ?? 0),
                          ),
                        })),
                    ]}
                  />
                ) : null
              }
            />
            {visible.includes('liquidity') && (
              <Area
                type="monotone"
                dataKey="liquidity"
                legendType="none"
                tooltipType="none"
                stroke="none"
                fill="url(#stats-market-liquidity-fill)"
                isAnimationActive={false}
              />
            )}
            {visible.includes('liquidity') && (
              <Line
                type="monotone"
                dataKey="liquidity"
                name="Liquidity"
                stroke={theme.colors.blue}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {visible.includes('borrow') && (
              <Line
                type="monotone"
                dataKey="borrow"
                name="Total Borrow"
                stroke={theme.colors.red}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {visible.includes('supply') && (
              <Line
                type="monotone"
                dataKey="supply"
                name="Total Supply"
                stroke={theme.colors.green}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

const interestRateData = Array.from({ length: 21 }, (_, index) => {
  const utilization = index * 5;
  const excess = Math.max(0, utilization - 75);
  const borrowApy = 1.5 + utilization * 0.07 + excess * 3.1;
  return { utilization, borrowApy, supplyApy: (borrowApy * utilization) / 100 };
});

const MarketInterestRateModel = ({ asset }: { asset: StatsMarketAsset }) => (
  <section className="stats-market-rate-model" data-venus-panel>
    <h2>{asset.symbol} Interest Rate Model</h2>
    <div className="stats-market-rate-legend">
      <span>
        <i className="stats-market-legend-blue" />
        Utilization rate
      </span>
      <span>
        <i className="stats-market-legend-red" />
        Borrow APY
      </span>
      <span>
        <i className="stats-market-legend-green" />
        Supply APY
      </span>
    </div>
    <div
      className="stats-market-rate-chart stats-chart"
      role="img"
      aria-label={`${asset.symbol} interest rate model`}
    >
      <ResponsiveContainer>
        <LineChart data={interestRateData} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={theme.colors['dark-blue-hover']} />
          <XAxis
            dataKey="utilization"
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={value => `${value}%`}
            tickLine={false}
            axisLine={false}
            stroke={theme.colors['light-grey']}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 10, 30, 50, 70, 90]}
            tickFormatter={value => `${value}%`}
            tickLine={false}
            axisLine={false}
            width={42}
            stroke={theme.colors['light-grey']}
          />
          <ReferenceLine
            x={Math.round(asset.utilization / 5) * 5}
            stroke={theme.colors.blue}
            strokeDasharray="4 4"
            label={{
              value: `Current (${asset.utilization}%)`,
              position: 'top',
              fill: theme.colors['light-grey'],
            }}
          />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipContent
                  items={[
                    { label: 'Utilization', value: `${label}%` },
                    ...payload.map(item => ({
                      label: String(item.name),
                      value: `${Number(item.value).toFixed(1)}%`,
                    })),
                  ]}
                />
              ) : null
            }
          />
          <Line
            dataKey="borrowApy"
            name="Borrow APY"
            stroke={theme.colors.red}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Line
            dataKey="supplyApy"
            name="Supply APY"
            stroke={theme.colors.green}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </section>
);

const MarketMetric = ({
  metric,
  color,
}: { metric: StatsMetric; color: 'green' | 'red' | 'blue' | 'neutral' }) => (
  <div className={`stats-market-metric stats-market-metric--${color}`}>
    <StatsMetricCard metric={metric} prominent />
  </div>
);

export const StatsMarketPage = ({
  asset,
  range,
}: { asset: StatsMarketAsset; range: MarketRange }) => {
  const miniMetric = (
    label: string,
    value: string,
    amount: number,
    tone: 'green' | 'red' | 'blue' | 'neutral',
    shape: 'rate' | 'debt' | 'capacity' | 'concentration',
  ): StatsMetric => {
    const points = makeMarketSparkline(asset, amount, shape, range);
    const firstValue = points[0].value;
    const lastValue = points[points.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      label: `${asset.symbol} ${label}`,
      value,
      tone,
      change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
      comparisonLabel: comparisonLabels[range],
      points,
      pointUnit: value.endsWith('%') ? 'percentage' : 'usd-millions',
    };
  };
  const debt = asset.borrowMillions;
  const cap = asset.supplyMillions * 1.18;
  const borrowCap = asset.borrowMillions * 1.35;
  const summary = [
    miniMetric('Supply APY', `${asset.supplyApy.toFixed(2)}%`, asset.supplyApy, 'green', 'rate'),
    miniMetric('Borrow APY', `${asset.borrowApy.toFixed(2)}%`, asset.borrowApy, 'red', 'rate'),
    miniMetric(
      'Utilization',
      `${asset.utilization.toFixed(2)}%`,
      asset.utilization,
      'blue',
      'rate',
    ),
  ];
  const debtMetrics = [
    miniMetric('Total Debt Against (USD)', formatMarketUsd(debt), debt, 'neutral', 'debt'),
    miniMetric(
      'Stablecoin Debt (USD)',
      formatMarketUsd(debt * 0.62),
      debt * 0.62,
      'neutral',
      'debt',
    ),
    miniMetric('BNB Debt (USD)', formatMarketUsd(debt * 0.23), debt * 0.23, 'neutral', 'debt'),
    miniMetric('Other Debt (USD)', formatMarketUsd(debt * 0.15), debt * 0.15, 'neutral', 'debt'),
  ];
  const capMetrics = [
    miniMetric('Supply Cap', formatMarketUsd(cap), cap, 'green', 'capacity'),
    miniMetric(
      'Supply % Filled',
      `${((asset.supplyMillions / cap) * 100).toFixed(1)}%`,
      (asset.supplyMillions / cap) * 100,
      'green',
      'capacity',
    ),
    miniMetric('Borrow Cap', formatMarketUsd(borrowCap), borrowCap, 'red', 'capacity'),
    miniMetric(
      'Borrow % Filled',
      `${((debt / borrowCap) * 100).toFixed(1)}%`,
      (debt / borrowCap) * 100,
      'red',
      'capacity',
    ),
  ];
  const concentrationMetrics = [
    miniMetric('Top Supplier %', '28.6%', 28.6, 'green', 'concentration'),
    miniMetric('Top Borrower %', '21.4%', 21.4, 'red', 'concentration'),
  ];

  return (
    <div className="stats-content stats-market-content">
      <MarketHistoryChart asset={asset} range={range} />
      <div className="stats-market-summary-grid">
        {summary.map(metric => (
          <MarketMetric key={metric.label} metric={metric} color={metric.tone ?? 'blue'} />
        ))}
      </div>
      <MarketInterestRateModel asset={asset} />
      <div className="stats-market-details-grid">
        {debtMetrics.map(metric => (
          <MarketMetric key={metric.label} metric={metric} color="neutral" />
        ))}
        {capMetrics.map(metric => (
          <MarketMetric key={metric.label} metric={metric} color={metric.tone ?? 'green'} />
        ))}
      </div>
      <div className="stats-market-concentration-grid">
        {concentrationMetrics.map(metric => (
          <MarketMetric key={metric.label} metric={metric} color={metric.tone ?? 'green'} />
        ))}
      </div>
    </div>
  );
};
