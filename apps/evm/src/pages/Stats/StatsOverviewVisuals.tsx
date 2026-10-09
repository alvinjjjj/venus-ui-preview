import { theme } from '@venusprotocol/ui';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartTooltipContent } from 'components/ChartTooltipContent';
import { StatsPanel } from './StatsVisuals';
import { type StatsCategoryRow, type StatsSeriesRow, chartAssets } from './statsOverviewData';

// Each series uses existing Venus palette tokens or a scoped mix of those tokens.
const assetColors: Record<string, string> = {
  BTCB: 'var(--stats-asset-btcb)',
  BNB: 'var(--stats-asset-bnb)',
  USDT: 'var(--stats-asset-usdt)',
  SolvBTC: 'var(--stats-asset-solvbtc)',
  asBNB: 'var(--stats-asset-asbnb)',
  USDC: 'var(--stats-asset-usdc)',
  xSolvBTC: 'var(--stats-asset-xsolvbtc)',
  WBNB: 'var(--stats-asset-wbnb)',
  ETH: 'var(--stats-asset-eth)',
  U: 'var(--stats-asset-u)',
};

const volumeColors = [theme.colors.green, theme.colors.blue, theme.colors.orange, theme.colors.red];
const marketVolumeColors = [theme.colors.yellow, theme.colors.orange];

const formatMillions = (value: number) => {
  if (value === 0) return '$0';
  if (value < 1) return `$${Math.round(value * 1000)}K`;
  if (value < 10) return `$${Number(value.toFixed(2))}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${Math.round(value)}M`;
};

// The reference uses a unit label for billions and currency only for the lower ticks.
const formatVolumeAxis = (value: number) =>
  value >= 1000 ? `${Number((value / 1000).toFixed(1))}B` : formatMillions(value);

const getDateTicks = (data: StatsSeriesRow[], count = 5) => {
  if (data.length <= count) return data.map(row => row.date);

  const referenceDates = [
    'Jun 1, 2025',
    'Jun 22, 2025',
    'Jul 13, 2025',
    'Aug 3, 2025',
    'Aug 24, 2025',
  ];
  const availableDates = new Set(data.map(row => row.date));
  const referenceTicks = referenceDates.filter(date => availableDates.has(date));
  if (referenceTicks.length === count) return referenceTicks;

  return Array.from(
    { length: count },
    (_, index) => data[Math.round((index * (data.length - 1)) / (count - 1))].date,
  );
};

const chartTooltip = (
  {
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: readonly { name?: string; value?: number | string; color?: string; fill?: string }[];
    label?: string | number;
  },
  labelHeading = 'Date',
  showZero = false,
) =>
  active && payload?.length ? (
    <ChartTooltipContent
      items={[
        { label: labelHeading, value: String(label ?? '') },
        ...payload
          .filter(item => showZero || Number(item.value) > 0)
          .map(item => ({
            label: item.name ?? '',
            value: formatMillions(Number(item.value)),
            color: assetColors[item.name ?? ''] ?? item.color ?? item.fill,
          })),
      ]}
    />
  ) : null;

const marketVolumeTooltip = (props: Parameters<typeof chartTooltip>[0]) =>
  chartTooltip(props, 'Asset', true);

const getMarketVolumeTicks = (data: StatsCategoryRow[], keys: string[]) => {
  const maxTotal = Math.max(
    0,
    ...data.map(row => keys.reduce((total, key) => total + Number(row[key] ?? 0), 0)),
  );
  const targetStep = Math.max(maxTotal / 4, 1);
  const magnitude = 10 ** Math.floor(Math.log10(targetStep));
  const step =
    ([1, 1.5, 2, 2.5, 5, 10].find(value => value * magnitude >= targetStep) ?? 10) * magnitude;
  return Array.from({ length: 5 }, (_, index) => index * step);
};

const SeriesLegend = ({
  labels,
  colors,
  heading,
}: { labels: string[]; colors: string[]; heading?: string }) => (
  <div className="stats-series-key">
    {heading && <span className="stats-series-key-heading">{heading}</span>}
    <ul className="stats-series-legend" aria-label="Chart series">
      {labels.map((label, index) => (
        <li key={label}>
          <span style={{ backgroundColor: colors[index % colors.length] }} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  </div>
);

export const StatsStackedAreaPanel = ({
  title,
  data,
}: {
  title: string;
  data: StatsSeriesRow[];
}) => {
  const keys = Object.keys(data[0] ?? {}).filter(key => key !== 'date');

  return (
    <StatsPanel title={title} className="stats-overview-chart-panel">
      <div
        className="stats-overview-chart stats-chart"
        role="img"
        aria-label={`${title} by asset over time`}
      >
        <ResponsiveContainer>
          <RechartsAreaChart data={data} margin={{ top: 12, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={theme.colors['dark-blue-hover']} />
            <XAxis
              dataKey="date"
              stroke={theme.colors['light-grey']}
              tickLine={false}
              axisLine={false}
              ticks={getDateTicks(data)}
              interval={0}
            />
            <YAxis
              stroke={theme.colors['light-grey']}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={formatVolumeAxis}
              domain={[0, 3500]}
              ticks={[0, 500, 1000, 1500, 2000, 2500, 3000, 3500]}
            />
            <Tooltip content={chartTooltip} />
            {keys.map(key => (
              <Area
                key={key}
                dataKey={key}
                stackId="assets"
                type="linear"
                stroke={assetColors[key]}
                fill={assetColors[key]}
                fillOpacity={1}
                strokeWidth={0}
                isAnimationActive={false}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
      <SeriesLegend
        labels={chartAssets}
        colors={chartAssets.map(asset => assetColors[asset])}
        heading="Asset"
      />
    </StatsPanel>
  );
};

export const StatsStackedBarPanel = ({
  title,
  data,
  keys,
  transaction = false,
  yAxisDomain,
  yAxisTicks,
}: {
  title: string;
  data: StatsSeriesRow[] | StatsCategoryRow[];
  keys: string[];
  transaction?: boolean;
  yAxisDomain?: [number, number];
  yAxisTicks?: number[];
}) => {
  const colors = transaction ? volumeColors : marketVolumeColors;
  const marketTicks = transaction
    ? undefined
    : getMarketVolumeTicks(data as StatsCategoryRow[], keys);

  return (
    <StatsPanel title={title} className="stats-overview-chart-panel">
      {!transaction && <p className="stats-chart-unit">Volume (USD)</p>}
      <div
        className="stats-overview-chart stats-chart"
        role="img"
        aria-label={`${title} stacked bar chart`}
      >
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 12, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={theme.colors['dark-blue-hover']} />
            <XAxis
              dataKey={transaction ? 'date' : 'name'}
              stroke={theme.colors['light-grey']}
              tickLine={false}
              axisLine={false}
              ticks={transaction ? getDateTicks(data as StatsSeriesRow[]) : undefined}
              interval={0}
            />
            <YAxis
              stroke={theme.colors['light-grey']}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={formatVolumeAxis}
              {...(!transaction
                ? {
                    domain: yAxisDomain ?? [0, marketTicks?.at(-1) ?? 0],
                    ticks: yAxisTicks ?? marketTicks,
                  }
                : {})}
            />
            <Tooltip content={transaction ? chartTooltip : marketVolumeTooltip} cursor={false} />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="volume"
                fill={colors[index % colors.length]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SeriesLegend labels={keys} colors={colors} />
    </StatsPanel>
  );
};
