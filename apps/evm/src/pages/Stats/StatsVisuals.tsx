import { theme } from '@venusprotocol/ui';
import { AreaChart } from 'components';
import 'components/Card/panel.css';
import { Icon } from 'components/Icon';
import { TableHeadCell } from 'components/Table/TableHeadCell';
import { TableHeader } from 'components/Table/TableHeader';
import { TableRow } from 'components/Table/TableRow';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatMarketUsd } from './statsMarketData';
import type { StatsMetric, StatsPoint, StatsTableData } from './statsPreviewData';

type StatsTone = 'green' | 'red' | 'blue' | 'neutral';

const chartColors: Record<StatsTone, string> = {
  green: theme.colors.green,
  red: theme.colors.red,
  blue: theme.colors.blue,
  neutral: theme.colors['light-grey'],
};

const compositionColors = [
  theme.colors.blue,
  theme.colors.green,
  theme.colors.yellow,
  theme.colors.orange,
  theme.colors['light-grey'],
];

const formatCompact = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatUsdBillions = (billions: number) =>
  billions >= 1
    ? `$${billions.toFixed(2).replace(/\.?0+$/, '')}B`
    : `$${Math.round(billions * 1000)}M`;

const parseSortableValue = (value: string): number | undefined => {
  const amount = value
    .split('\n')[0]
    .trim()
    .replace(/\s+(?:USDT|USDC|U)$/i, '');
  const match = amount.replaceAll(',', '').match(/^[-−]?(?:\$)?(\d+(?:\.\d+)?)([KMB])?%?$/i);
  if (!match) return undefined;
  const sign = value.startsWith('-') || value.startsWith('−') ? -1 : 1;
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase() as 'K' | 'M' | 'B'] ?? 1;
  return sign * Number(match[1]) * scale;
};

export const StatsPanel = ({
  title,
  description,
  children,
  className = '',
  surface = true,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  surface?: boolean;
}) => (
  <section className={`stats-panel ${className}`} data-venus-panel={surface || undefined}>
    {(title || description) && (
      <header className="stats-panel-heading">
        {title && <h3>{title}</h3>}
        {description && <p>{description}</p>}
      </header>
    )}
    {children}
  </section>
);

export const StatsMetricCard = ({
  metric,
  prominent = false,
  variant = 'default',
  accent,
}: {
  metric: StatsMetric;
  prominent?: boolean;
  variant?: 'default' | 'summary';
  accent?: 'green' | 'blue' | 'yellow';
}) => {
  // Rebase the sparkline only; tooltips and displayed values retain the source amount.
  const values = metric.points?.map(point => point.value) ?? [];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = Math.max(maximum - minimum, maximum * 0.01);
  const chartPoints = metric.points?.map(point => ({
    ...point,
    chartValue: point.value - minimum + spread * 0.2,
  }));

  return (
    <article
      className={`stats-metric-card${prominent ? ' stats-metric-card--prominent' : ''}${
        variant === 'summary' ? ' stats-metric-card--summary' : ''
      }${accent ? ` stats-metric-card--accent-${accent}` : ''}`}
      data-venus-panel
    >
      <span className="stats-metric-label">{metric.label}</span>
      <strong className="stats-metric-value">{metric.value}</strong>
      {metric.change && (
        <span className={`stats-metric-change stats-tone-${metric.tone ?? 'blue'}`}>
          {metric.change} <span>{metric.comparisonLabel ?? 'vs 30 days ago'}</span>
        </span>
      )}
      {chartPoints && (
        <div
          className="stats-metric-chart stats-chart"
          role="img"
          aria-label={`${metric.label} trend`}
        >
          <AreaChart
            data={chartPoints}
            xAxisDataKey="date"
            yAxisDataKey="chartValue"
            chartColor={chartColors[metric.tone ?? 'blue']}
            formatXAxisValue={String}
            formatYAxisValue={formatCompact}
            areaChartMargin={{ left: 0, right: 0 }}
            formatTooltipItems={point => [
              { label: 'Date', value: point.date },
              {
                label: metric.label,
                value:
                  metric.pointUnit === 'usd-billions'
                    ? formatUsdBillions(point.value)
                    : metric.pointUnit === 'usd-millions'
                      ? formatMarketUsd(point.value)
                      : metric.pointUnit === 'percentage'
                        ? `${point.value.toFixed(2)}%`
                        : point.value,
              },
            ]}
            displayAxes={false}
            className="stats-metric-chart-inner"
          />
        </div>
      )}
    </article>
  );
};

export const StatsMetricGrid = ({
  metrics,
  prominent = false,
}: {
  metrics: StatsMetric[];
  prominent?: boolean;
}) => (
  <div className={`stats-metric-grid${prominent ? ' stats-metric-grid--hero' : ''}`}>
    {metrics.map(metric => (
      <StatsMetricCard key={metric.label} metric={metric} prominent={prominent} />
    ))}
  </div>
);

export const StatsTrendPanel = ({
  title,
  description,
  data,
  tone = 'blue',
  unit = '',
  unitSuffix = '',
  className = '',
  yAxisDomain,
  yAxisTicks,
}: {
  title: string;
  description?: string;
  data: StatsPoint[];
  tone?: StatsTone;
  unit?: string;
  unitSuffix?: string;
  className?: string;
  yAxisDomain?: [number, number];
  yAxisTicks?: number[];
}) => (
  <StatsPanel title={title} description={description} className={`stats-trend-panel ${className}`}>
    <div className="stats-trend-chart stats-chart" role="img" aria-label={`${title} over time`}>
      <AreaChart
        data={data}
        xAxisDataKey="date"
        yAxisDataKey="value"
        chartColor={chartColors[tone]}
        interval={5}
        xAxisTickInterval="preserveStartEnd"
        yAxisDomain={yAxisDomain}
        yAxisTicks={yAxisTicks}
        formatXAxisValue={String}
        formatYAxisValue={value =>
          unit === '$' && unitSuffix === 'B'
            ? Number(value) === 0
              ? '$0'
              : yAxisTicks && Number(value) >= 1
                ? `$${Number(value).toFixed(1)}B`
                : formatUsdBillions(Number(value))
            : `${unit}${formatCompact(Number(value))}${unitSuffix}`
        }
        formatTooltipItems={point => [
          { label: 'Date', value: point.date },
          {
            label: title,
            value: `${unit}${Number(point.value).toLocaleString('en', {
              maximumFractionDigits: 2,
            })}${unitSuffix}`,
          },
        ]}
        displayHorizontalGrid
        className="stats-trend-chart-inner"
      />
    </div>
  </StatsPanel>
);

export const StatsCompositionPanel = ({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
}) => (
  <StatsPanel title={title} description={description} className="stats-composition-panel">
    <div className="stats-composition-body">
      <div className="stats-donut stats-chart" role="img" aria-label={`${title} chart`}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="85%"
              stroke="none"
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((item, index) => (
                <Cell key={item.name} fill={compositionColors[index % compositionColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}%`, String(name)]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="stats-legend" aria-label={`${title} values`}>
        {data.map((item, index) => (
          <li key={item.name}>
            <span
              className="stats-legend-dot"
              style={{ backgroundColor: compositionColors[index % compositionColors.length] }}
            />
            <span>{item.name}</span>
            <strong>{item.value}%</strong>
          </li>
        ))}
      </ul>
    </div>
  </StatsPanel>
);

export const StatsBarPanel = ({
  title,
  description,
  data,
  tone = 'blue',
  suffix = '%',
}: {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
  tone?: StatsTone;
  suffix?: string;
}) => (
  <StatsPanel title={title} description={description} className="stats-bar-panel">
    <div className="stats-bar-chart stats-chart" role="img" aria-label={`${title} bar chart`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 12, right: 12, bottom: 2, left: -18 }}>
          <CartesianGrid vertical={false} stroke={theme.colors['dark-blue-hover']} />
          <XAxis
            dataKey="name"
            stroke={theme.colors['light-grey']}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={theme.colors['light-grey']}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => `${value}${suffix}`}
          />
          <Tooltip formatter={value => `${value}${suffix}`} />
          <Bar
            dataKey="value"
            fill={chartColors[tone]}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </StatsPanel>
);

export const StatsPagination = ({
  label,
  currentPage,
  pageCount,
  pageSize,
  total,
  onPageChange,
}: {
  label: string;
  currentPage: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) => (
  <nav className="stats-table-pagination" aria-label={`${label} pages`}>
    <span>
      {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, total)} of {total}
    </span>
    <div>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="Previous page"
      />
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-current={currentPage === index ? 'page' : undefined}
          onClick={() => onPageChange(index)}
        >
          {index + 1}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === pageCount - 1}
        aria-label="Next page"
      />
    </div>
  </nav>
);

export const StatsDataTable = ({
  table,
  query = '',
  dense = false,
  pageSize,
  className = '',
  renderCell,
}: {
  table: StatsTableData;
  query?: string;
  dense?: boolean;
  pageSize?: number;
  className?: string;
  renderCell?: (
    cell: string,
    column: number,
    row: StatsTableData['rows'][number],
  ) => React.ReactNode;
}) => {
  const [sort, setSort] = useState<{ column: number; descending: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const rows = useMemo(() => {
    const filtered = table.rows.filter(row =>
      row.cells.some(cell => cell.toLowerCase().includes(query.trim().toLowerCase())),
    );
    if (!sort) return filtered;
    return [...filtered].sort((left, right) => {
      const a = left.cells[sort.column] ?? '';
      const b = right.cells[sort.column] ?? '';
      const numberA = parseSortableValue(a);
      const numberB = parseSortableValue(b);
      const order =
        numberA !== undefined && numberB !== undefined
          ? numberA - numberB
          : a.localeCompare(b, 'en', { numeric: true });
      return sort.descending ? -order : order;
    });
  }, [query, sort, table.rows]);
  const pageCount = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount - 1);
  const visibleRows = pageSize
    ? rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : rows;

  return (
    <StatsPanel
      title={table.title}
      description={table.description}
      className={`stats-table-panel${dense ? ' stats-table-panel--dense' : ''} ${className}`}
      surface={!dense}
    >
      <div className="stats-table-scroll">
        <table className="stats-table">
          <TableHeader>
            <TableRow>
              {table.columns.map((column, index) => (
                <TableHeadCell
                  key={`${column}-${index}`}
                  scope="col"
                  aria-sort={
                    sort?.column === index ? (sort.descending ? 'descending' : 'ascending') : 'none'
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPage(0);
                      setSort(current => ({
                        column: index,
                        descending: current?.column === index ? !current.descending : false,
                      }));
                    }}
                  >
                    {column}
                    <span className="stats-table-sort-controls" aria-hidden="true">
                      <Icon
                        name="sort"
                        className={`stats-table-sort-icon${
                          sort?.column === index && !sort.descending
                            ? ' stats-table-sort-icon--active'
                            : ''
                        }`}
                      />
                      <Icon
                        name="sort"
                        className={`stats-table-sort-icon stats-table-sort-icon--desc${
                          sort?.column === index && sort.descending
                            ? ' stats-table-sort-icon--active'
                            : ''
                        }`}
                      />
                    </span>
                  </button>
                </TableHeadCell>
              ))}
            </TableRow>
          </TableHeader>
          <tbody>
            {visibleRows.map(row => (
              <tr key={row.id}>
                {row.cells.map((cell, index) =>
                  index === 0 ? (
                    <th key={`${row.id}-${index}`} scope="row">
                      {renderCell ? renderCell(cell, index, row) : cell}
                    </th>
                  ) : (
                    <td key={`${row.id}-${index}`}>
                      {renderCell ? renderCell(cell, index, row) : cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="stats-table-empty">No matching positions.</p>}
      </div>
      {pageSize && rows.length > 0 && (
        <StatsPagination
          label={table.title}
          currentPage={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          total={rows.length}
          onPageChange={setPage}
        />
      )}
    </StatsPanel>
  );
};
