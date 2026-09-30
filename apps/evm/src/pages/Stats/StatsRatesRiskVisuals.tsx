import { ChainId, tokens } from '@venusprotocol/chains';
import { theme } from '@venusprotocol/ui';
import { ChartTooltipContent } from 'components/ChartTooltipContent';
import { TokenListWrapper } from 'containers/TokenListWrapper';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatsDropdownTrigger } from './StatsDropdownTrigger';
import { StatsDataTable, StatsPanel, StatsTrendPanel } from './StatsVisuals';
import {
  type ChartRow,
  type DeepDiveRange,
  badDebtWallets,
  drawdownCurve,
  makeBadDebtHistory,
  makeRates,
  makeStableDominance,
  makeStableTotals,
  makeWeightedRates,
  riskAssets,
  riskCollateral,
  riskDebtMix,
} from './statsDeepDiveData';

const axisColor = theme.colors['light-grey'];
const gridColor = theme.colors['dark-blue-hover'];
const rateColors: Record<string, string> = {
  BNB: theme.colors.yellow,
  USDT: theme.colors.green,
  FDUSD: theme.colors['blue-active'],
  USDC: theme.colors.red,
  THE: theme.colors.blue,
  DAI: theme.colors.orange,
  Other: theme.colors['light-grey'],
  APY: theme.colors.green,
};

const dateTicks = (data: ChartRow[]) => {
  const tickCount = Math.min(5, data.length);
  return Array.from(
    { length: tickCount },
    (_, index) => data[Math.round((index * (data.length - 1)) / Math.max(1, tickCount - 1))].date,
  );
};

const RateBarPanel = ({
  title,
  description,
  data,
  keys,
  max = 7,
  percentage = false,
}: {
  title: string;
  description: string;
  data: ChartRow[];
  keys: string[];
  max?: number;
  percentage?: boolean;
}) => (
  <StatsPanel title={title} description={description} className="stats-deep-chart-panel">
    <div className="stats-deep-chart stats-chart" role="img" aria-label={`${title} chart`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="date"
            ticks={dateTicks(data)}
            interval={0}
            tickLine={false}
            axisLine={false}
            stroke={axisColor}
          />
          <YAxis
            domain={[0, max]}
            ticks={percentage ? [0, 25, 50, 75, 100] : [0, 1.8, 3.5, 5.3, 7]}
            tickFormatter={value => `${Number(value).toFixed(value === 0 || percentage ? 0 : 1)}%`}
            tickLine={false}
            axisLine={false}
            width={54}
            stroke={axisColor}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipContent
                  items={[
                    { label: 'Date', value: String(label ?? '') },
                    ...payload.map(item => ({
                      label: String(item.name),
                      value: `${Number(item.value).toFixed(2)}%`,
                    })),
                  ]}
                />
              ) : null
            }
          />
          {keys.map(key => (
            <Bar
              key={key}
              dataKey={key}
              stackId={keys.length > 1 ? 'rates' : undefined}
              fill={rateColors[key]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
    {keys.length > 1 && (
      <ul className="stats-deep-legend" aria-label="Chart series">
        {keys.map(key => (
          <li key={key}>
            <i style={{ backgroundColor: rateColors[key] }} />
            {key}
          </li>
        ))}
      </ul>
    )}
  </StatsPanel>
);

const StableTotalsPanel = ({ range }: { range: DeepDiveRange }) => {
  const data = makeStableTotals(range);
  return (
    <StatsPanel
      title="Total Stablecoin Supply vs Borrows"
      className="stats-deep-chart-panel stats-stable-totals"
    >
      <div
        className="stats-deep-chart stats-chart"
        role="img"
        aria-label="Stablecoin supply and borrow history"
      >
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="date"
              ticks={dateTicks(data)}
              interval={0}
              tickLine={false}
              axisLine={false}
              stroke={axisColor}
            />
            <YAxis
              domain={[0, 360]}
              ticks={[0, 60, 120, 180, 240, 300, 360]}
              tickFormatter={value => `$${value}M`}
              tickLine={false}
              axisLine={false}
              width={58}
              stroke={axisColor}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltipContent
                    items={[
                      { label: 'Date', value: String(label ?? '') },
                      ...payload.map(item => ({
                        label: String(item.name),
                        value: `$${Number(item.value).toFixed(1)}M`,
                      })),
                    ]}
                  />
                ) : null
              }
            />
            <Area
              dataKey="supplied"
              name="Total Supplied"
              type="monotone"
              stroke={theme.colors.blue}
              fill={theme.colors.blue}
              fillOpacity={0.12}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Area
              dataKey="borrowed"
              name="Total Borrowed"
              type="monotone"
              stroke={theme.colors.red}
              fill={theme.colors.red}
              fillOpacity={0.12}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ul className="stats-deep-legend" aria-label="Chart series">
        <li>
          <i style={{ backgroundColor: theme.colors.blue }} />
          Total Supplied
        </li>
        <li>
          <i style={{ backgroundColor: theme.colors.red }} />
          Total Borrowed
        </li>
      </ul>
    </StatsPanel>
  );
};

export const StatsRatesPage = ({ range }: { range: DeepDiveRange }) => (
  <div className="stats-content stats-deep-content">
    <div className="stats-two-column">
      <RateBarPanel
        title="Supply Rates"
        description="APY % · USDT, USDC, FDUSD, BNB, THE"
        data={makeRates(range, 'supply')}
        keys={['BNB', 'USDT', 'FDUSD', 'USDC', 'THE']}
      />
      <RateBarPanel
        title="Borrow Rates"
        description="APY % · USDT, USDC, FDUSD, BNB, THE"
        data={makeRates(range, 'borrow')}
        keys={['BNB', 'USDT', 'FDUSD', 'USDC', 'THE']}
      />
    </div>
    <div className="stats-section-heading">
      <h2>Stablecoin Deep Dive</h2>
      <p>Weighted average supply and borrow APY across stablecoins.</p>
    </div>
    <div className="stats-two-column">
      <RateBarPanel
        title="Stablecoin Weighted Avg Supply Rate"
        description="Weighted avg Supply APY %"
        data={makeWeightedRates(range, 'supply')}
        keys={['APY']}
      />
      <RateBarPanel
        title="Stablecoin Weighted Avg Borrow Rate"
        description="Weighted avg Borrow APY %"
        data={makeWeightedRates(range, 'borrow')}
        keys={['APY']}
      />
    </div>
    <div className="stats-section-heading">
      <h2>Stablecoin Dominance</h2>
      <p>Which stablecoins are primarily lent and borrowed across Venus</p>
    </div>
    <div className="stats-two-column">
      <RateBarPanel
        title="Supply Dominance"
        description="Supply share"
        data={makeStableDominance(range, 'supply')}
        keys={['USDT', 'USDC', 'FDUSD', 'DAI', 'Other']}
        max={100}
        percentage
      />
      <RateBarPanel
        title="Borrow Dominance"
        description="Borrow share"
        data={makeStableDominance(range, 'borrow')}
        keys={['USDT', 'USDC', 'FDUSD', 'DAI', 'Other']}
        max={100}
        percentage
      />
    </div>
    <StableTotalsPanel range={range} />
  </div>
);

const RiskDrawdownChart = ({
  title,
  data = drawdownCurve,
  marker,
}: {
  title: string;
  data?: typeof drawdownCurve;
  marker?: number;
}) => {
  const axisMax = Math.max(900, Math.ceil(Math.max(...data.map(point => point.value)) / 300) * 300);
  return (
    <StatsPanel
      title={title}
      description="Collateral at risk"
      className="stats-risk-drawdown-panel"
    >
      <div
        className="stats-risk-drawdown-chart stats-chart"
        role="img"
        aria-label={`${title} chart`}
      >
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -5 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="date"
              ticks={['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%']}
              interval={0}
              tickLine={false}
              axisLine={false}
              stroke={axisColor}
            />
            <YAxis
              domain={[0, axisMax]}
              ticks={Array.from({ length: 6 }, (_, index) => Math.round((axisMax * index) / 5))}
              tickFormatter={value => (value === 0 ? '$0' : `$${value}M`)}
              tickLine={false}
              axisLine={false}
              width={62}
              stroke={axisColor}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltipContent
                    items={[
                      { label: 'Price drawdown', value: String(label ?? '') },
                      {
                        label: 'Collateral at risk',
                        value: `$${Number(payload[0].value).toFixed(0)}M`,
                      },
                    ]}
                  />
                ) : null
              }
            />
            <Area
              dataKey="value"
              type="stepAfter"
              stroke={theme.colors.red}
              fill={theme.colors.red}
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={false}
            />
            {marker !== undefined && (
              <ReferenceLine x={`${marker}%`} stroke={theme.colors.blue} strokeDasharray="4 4" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </StatsPanel>
  );
};

const RiskHorizontalBars = () => (
  <StatsPanel
    title="Share of Stablecoin Debt Within 10% of Liquidation by Collateral"
    className="stats-risk-bars"
  >
    <div
      className="stats-risk-bars-list"
      role="list"
      aria-label="Stablecoin debt close to liquidation by collateral"
    >
      {riskCollateral.map((asset, index) => (
        <div className="stats-risk-bars-row" role="listitem" key={asset.name}>
          <span>{asset.name}</span>
          <div className="stats-risk-bars-track">
            <div
              style={{
                width: `${asset.value}%`,
                backgroundColor: Object.values(rateColors)[index % 7],
              }}
            />
            <strong>${asset.value}M</strong>
          </div>
        </div>
      ))}
    </div>
  </StatsPanel>
);

const RiskDebtDonut = () => (
  <StatsPanel title="Stablecoin Debt by Collateral" className="stats-risk-donut-panel">
    <div
      className="stats-risk-donut stats-chart"
      role="img"
      aria-label="Stablecoin debt by collateral donut chart"
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={riskDebtMix}
            dataKey="value"
            nameKey="name"
            innerRadius="53%"
            outerRadius="88%"
            stroke={theme.colors.background}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {riskDebtMix.map((item, index) => (
              <Cell key={item.name} fill={Object.values(rateColors)[index % 7]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <ChartTooltipContent
                  items={[
                    { label: 'Collateral', value: String(payload[0].name) },
                    { label: 'Share', value: `${Number(payload[0].value)}%` },
                  ]}
                />
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <ul className="stats-deep-legend" aria-label="Collateral assets">
      {riskDebtMix.map((item, index) => (
        <li key={item.name}>
          <i style={{ backgroundColor: Object.values(rateColors)[index % 7] }} />
          {item.name}
        </li>
      ))}
    </ul>
  </StatsPanel>
);

const riskTokens = tokens[ChainId.BSC_MAINNET].filter(token => riskAssets.includes(token.symbol));

const RiskAssetPicker = ({
  value,
  onChange,
}: { value: string; onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);
  const selectedToken = riskTokens.find(token => token.symbol === value) ?? riskTokens[0];
  return (
    <TokenListWrapper
      className="stats-deep-asset-picker"
      tokenBalances={riskTokens.map(token => ({ token }))}
      selectedToken={selectedToken}
      isListShown={open}
      displayCommonTokenButtons={false}
      onClose={() => setOpen(false)}
      onTokenClick={token => onChange(token.symbol)}
    >
      <StatsDropdownTrigger
        label={value}
        ariaLabel={`Risk asset: ${value}`}
        expanded={open}
        onClick={() => setOpen(current => !current)}
      />
    </TokenListWrapper>
  );
};

export const StatsRiskPage = () => {
  const [asset, setAsset] = useState('BNB');
  const [drawdown, setDrawdown] = useState(20);
  const multiplier =
    (
      { BNB: 1, BTCB: 1.45, ETH: 0.85, USDT: 0.44, USDC: 0.38, CAKE: 0.62, XRP: 0.51 } as Record<
        string,
        number
      >
    )[asset] ?? 1;
  const simulated = useMemo(
    () =>
      drawdownCurve.map(point => ({
        ...point,
        value: Math.round(point.value * multiplier),
      })),
    [multiplier],
  );
  const atRisk = simulated[drawdown].value;
  const eligible = Math.round(145 + drawdown * 74 * multiplier);

  return (
    <div className="stats-content stats-deep-content">
      <RiskDrawdownChart title="Collateral at Risk by Drawdown" />
      <div className="stats-two-column">
        <RiskHorizontalBars />
        <RiskDebtDonut />
      </div>
      <div className="stats-section-heading">
        <h2>Risk Explorer — Per-Asset Drawdown Calculator</h2>
        <p>
          Simulate a price drop for one asset to see collateral at risk, wallets eligible for
          liquidation, and estimated bad debt.
        </p>
      </div>
      <div className="stats-risk-controls">
        <RiskAssetPicker value={asset} onChange={setAsset} />
        <label className="stats-risk-slider">
          <span>Price Drawdown ({drawdown}%)</span>
          <input
            type="range"
            min="0"
            max="80"
            step="1"
            value={drawdown}
            onChange={event => setDrawdown(Number(event.target.value))}
          />
          <span className="stats-risk-slider-ticks">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
          </span>
        </label>
      </div>
      <RiskDrawdownChart
        title={`${asset} — Collateral at Risk by Drawdown`}
        data={simulated}
        marker={drawdown}
      />
      <div className="stats-risk-results" aria-live="polite">
        <article className="stats-risk-result" data-venus-panel>
          <span>Estimated Bad Debt</span>
          <strong>${Math.round(atRisk * 0.09)}M</strong>
          <small>At {drawdown}% drawdown</small>
        </article>
        <article className="stats-risk-result" data-venus-panel>
          <span>Collateral at Risk</span>
          <strong>${atRisk}M</strong>
          <small>{asset} collateral</small>
        </article>
        <article className="stats-risk-result" data-venus-panel>
          <span>Wallets Eligible for Liquidation</span>
          <strong>{eligible.toLocaleString('en')}</strong>
          <small>Estimated wallets</small>
        </article>
      </div>
    </div>
  );
};

export const StatsBadDebtPage = ({ range }: { range: DeepDiveRange }) => (
  <div className="stats-content stats-deep-content">
    <div className="stats-bad-debt-metrics">
      <article className="stats-risk-result stats-risk-result--red" data-venus-panel>
        <span>Wallets with Bad Debt (&gt;$10)</span>
        <strong>1</strong>
      </article>
      <article className="stats-risk-result stats-risk-result--red" data-venus-panel>
        <span>Total Bad Debt</span>
        <strong>$71.64</strong>
      </article>
    </div>
    <StatsDataTable table={badDebtWallets} dense className="stats-bad-debt-table" />
    <StatsPanel title="Bad Debt by Token" description="USDT" className="stats-bad-debt-token-panel">
      <div
        className="stats-bad-debt-token-chart"
        role="img"
        aria-label="USDT bad debt of 71.64 dollars"
      >
        <div className="stats-bad-debt-token-bar" />
        <span>$71.64</span>
      </div>
      <div className="stats-bad-debt-token-axis" aria-hidden="true">
        <span>$0</span>
        <span>$20</span>
        <span>$40</span>
        <span>$60</span>
        <span>$80</span>
      </div>
    </StatsPanel>
    <StatsTrendPanel
      title="Bad Debt over Time"
      data={makeBadDebtHistory(range)}
      tone="red"
      unit="$"
      className="stats-bad-debt-history"
    />
  </div>
);
