import { Spinner, cn, theme } from '@venusprotocol/ui';

import type { AccountPerformanceHistoryDataPoint } from 'clients/api';
import { ErrorState } from 'components';
import { AreaChart, type AreaChartProps } from 'components';
import { format } from 'date-fns';
import { useBreakpointUp } from 'hooks/responsive';
import { useTranslation } from 'libs/translations';
import { formatCentsToReadableValue } from 'utilities';
import { getLineChartYAxis } from './getLineChartYAxis';

export interface PerformanceChartProps
  extends Partial<AreaChartProps<AccountPerformanceHistoryDataPoint>> {
  accountPerformanceHistory: AccountPerformanceHistoryDataPoint[];
  onSelectedDataPointChange?: (dataPoint: AccountPerformanceHistoryDataPoint | undefined) => void;
  onRefetch?: () => void;
  error?: Error;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  className,
  onSelectedDataPointChange,
  onRefetch,
  accountPerformanceHistory,
  error,
  variant = 'area',
  ...areaChartProps
}) => {
  const { t } = useTranslation();
  const isSmOrUp = useBreakpointUp('sm');

  const isLine = variant === 'line';
  const chartInterval = isLine ? 7 : isSmOrUp ? 5 : 3;
  const lineYAxis = isLine
    ? getLineChartYAxis(accountPerformanceHistory.map(point => point.netWorthCents))
    : undefined;

  return (
    <div className={cn('h-43', isLine && 'dashboard-performance-chart', className)}>
      {accountPerformanceHistory.length > 0 && (
        <AreaChart
          data={accountPerformanceHistory}
          variant={variant}
          xAxisDataKey="blockTimestampMs"
          yAxisDataKey="netWorthCents"
          yAxisTickCount={5}
          onDataPointHover={payload => onSelectedDataPointChange?.(payload)}
          onMouseLeave={() => onSelectedDataPointChange?.(undefined)}
          formatXAxisValue={timestampMs =>
            isLine
              ? format(new Date(timestampMs), 'dd.MM')
              : t('dashboard.performanceChart.xAxisValue', { date: new Date(timestampMs) })
          }
          formatYAxisValue={value => formatCentsToReadableValue({ value })}
          interval={chartInterval}
          chartColor={theme.colors['blue-active']}
          className="h-full"
          {...(isLine && {
            // Keep the 171px frame. Add the requested 12px to the original
            // 45px label column. Reserve date text (18px), its gap (12px),
            // and tick/baseline room (12px) below the plot to avoid clipping.
            showGradient: true,
            areaChartMargin: { top: 9, left: 0, right: 0, bottom: 0 },
            yAxisDomain: lineYAxis?.domain,
            yAxisTicks: lineYAxis?.ticks,
            yAxisProps: { width: 45 + 12, interval: 0 },
            xAxisProps: {
              height: 18 + 12 + 12,
              padding: { left: 0, right: 0 },
              tickMargin: 18,
              tick: ({ x, y, index, visibleTicksCount, payload }) => (
                <text
                  x={x}
                  y={y}
                  dominantBaseline="hanging"
                  textAnchor={
                    index === 0 ? 'start' : index === visibleTicksCount - 1 ? 'end' : 'middle'
                  }
                >
                  {format(new Date(payload.value), 'dd.MM')}
                </text>
              ),
            },
          })}
          {...areaChartProps}
        />
      )}

      {accountPerformanceHistory.length === 0 && onRefetch && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-y-3">
          {error ? (
            <ErrorState
              message={t('dashboard.overview.performanceChart.errorState.failedToFetchMessage')}
              button={{
                label: t('dashboard.overview.performanceChart.errorState.refetchButtonLabel'),
                onClick: onRefetch,
              }}
            />
          ) : (
            <>
              <Spinner className="h-auto" />

              <p className="text-sm text-grey">
                {t('dashboard.overview.performanceChart.placeholderText')}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
