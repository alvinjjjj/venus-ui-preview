import { ChainId, tokens } from '@venusprotocol/chains';
import { theme } from '@venusprotocol/ui';
import { Dropdown, Select, TextField } from 'components';
import { ChartTooltipContent } from 'components/ChartTooltipContent';
import { TokenIconWithSymbol } from 'components/TokenIconWithSymbol';
import { TokenListWrapper } from 'containers/TokenListWrapper';
import { previewDesignByMode, useGlassPreview } from 'demo/GlassVersions/store';
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

import { StatsDropdownTrigger } from './StatsDropdownTrigger';
import { StatsDataTable, StatsPanel } from './StatsVisuals';
import {
  type PositionSample,
  collateralAssetOptions,
  collateralDebtAssets,
  collateralMatrix,
  collateralMatrixCollateralTotals,
  collateralMatrixDebtTotals,
  collateralPairs,
  collateralSuppliers,
  positionSamples,
  walletFilterAssets,
  walletFilterMarkets,
  walletRecords,
} from './statsDeepDiveData';
import type { StatsTableData } from './statsPreviewData';

const assetPalette = [
  theme.colors.yellow,
  theme.colors.orange,
  theme.colors.red,
  theme.colors.blue,
  theme.colors.green,
  theme.colors['blue-active'],
  theme.colors['light-grey'],
];
const usd = (value: number) =>
  value === 0
    ? '$0.00'
    : value >= 1_000_000
      ? `$${(value / 1_000_000).toFixed(2)}M`
      : value >= 1_000
        ? `$${(value / 1_000).toFixed(2)}K`
        : `$${value.toFixed(2)}`;

const MetricTile = ({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'green' | 'red' | 'neutral';
}) => (
  <article className={`stats-deep-metric stats-deep-metric--${tone}`} data-venus-panel>
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

const AssetDonut = ({
  title,
  data,
  emptyText,
}: {
  title: string;
  data: { name: string; value: number }[];
  emptyText?: string;
}) => (
  <StatsPanel title={title} className="stats-position-donut-panel">
    {data.length ? (
      <>
        <div className="stats-position-donut stats-chart" role="img" aria-label={`${title} chart`}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="88%"
                stroke={theme.colors.background}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((item, index) => (
                  <Cell key={item.name} fill={assetPalette[index % assetPalette.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <ChartTooltipContent
                      items={[
                        { label: 'Asset', value: String(payload[0].name) },
                        { label: 'Share', value: `${Number(payload[0].value)}%` },
                      ]}
                    />
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="stats-deep-legend" aria-label={`${title} assets`}>
          {data.map((item, index) => (
            <li key={item.name}>
              <i style={{ backgroundColor: assetPalette[index % assetPalette.length] }} />
              {item.name}
            </li>
          ))}
        </ul>
      </>
    ) : (
      <div className="stats-position-empty" role="status">
        <strong>No data found</strong>
        <span>{emptyText ?? 'No assets for this wallet'}</span>
      </div>
    )}
  </StatsPanel>
);

export const StatsPositionExplorerPage = () => {
  const [query, setQuery] = useState('');
  // Explorer shares New's components, so it gets New's Stats layout too.
  const isNew = useGlassPreview(state => previewDesignByMode[state.mode] === 'v5');
  const normalized = query.trim().toLowerCase();
  const selected: PositionSample | undefined = normalized
    ? positionSamples.find(sample => sample.address.toLowerCase().includes(normalized))
    : positionSamples[0];

  return (
    <div className="stats-content stats-deep-content">
      {isNew ? (
        <TextField
          type="search"
          size="sm"
          aria-label="User address"
          placeholder="User address"
          leftIconSrc="magnifier"
          value={query}
          onChange={event => setQuery(event.target.value)}
          autoComplete="off"
        />
      ) : (
        <label className="stats-position-search">
          <span className="sr-only">User address</span>
          <span aria-hidden="true" className="stats-position-search-icon" />
          <input
            type="search"
            placeholder="User address"
            value={query}
            onChange={event => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>
      )}
      {selected ? (
        <>
          <div className="stats-position-metrics" aria-live="polite">
            <MetricTile label="Total Supply" value={usd(selected.supply)} tone="green" />
            <MetricTile label="Total Collateral" value={usd(selected.collateral)} tone="green" />
            <MetricTile label="Total Borrow Power" value={usd(selected.borrowPower)} tone="red" />
            <MetricTile label="Total Debt" value={usd(selected.debt)} tone="red" />
            <MetricTile
              label="Available Borrow Power"
              value={usd(Math.max(0, selected.borrowPower - selected.debt))}
              tone="green"
            />
            <MetricTile label="Health Factor" value={selected.healthFactor?.toFixed(2) ?? '—'} />
            <MetricTile
              label="Borrow Limit Used"
              value={
                selected.debt ? `${Math.round((selected.debt / selected.borrowPower) * 100)}%` : '—'
              }
              tone="red"
            />
          </div>
          <div className="stats-two-column">
            <AssetDonut title="Deposits by Token" data={selected.deposits} />
            <AssetDonut
              title="Borrows by Token"
              data={selected.borrows}
              emptyText="This wallet has no active borrows"
            />
          </div>
          {query && <p className="stats-position-address">Showing {selected.address}</p>}
        </>
      ) : (
        <StatsPanel className="stats-position-no-match">
          <p role="status">No matching wallet found.</p>
          <p>Try {positionSamples[0].address.slice(0, 12)}…</p>
        </StatsPanel>
      )}
    </div>
  );
};

const knownTokens = tokens[ChainId.BSC_MAINNET];

const SearchableTokenFilter = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const [search, setSearch] = useState('');
  const tokenOptions = knownTokens.filter(token => walletFilterAssets.includes(token.symbol));
  const visible = tokenOptions.filter(token =>
    token.symbol.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Dropdown
      className="stats-wallet-filter"
      label={label}
      matchTriggerWidth
      menuClassName="stats-wallet-filter-menu"
      optionsDom={() => (
        <div className="stats-wallet-token-options">
          <TextField
            size="xs"
            variant="secondary"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search asset"
            leftIconSrc="magnifier"
          />
          <button type="button" className="stats-wallet-token-option" onClick={() => onChange([])}>
            <span>All assets</span>
            <span aria-hidden="true">{value.length === 0 ? '✓' : ''}</span>
          </button>
          {visible.map(token => (
            <button
              key={token.address}
              type="button"
              className="stats-wallet-token-option"
              onClick={() =>
                onChange(
                  value.includes(token.symbol)
                    ? value.filter(item => item !== token.symbol)
                    : [...value, token.symbol],
                )
              }
            >
              <TokenIconWithSymbol token={token} />
              <span aria-hidden="true">{value.includes(token.symbol) ? '✓' : ''}</span>
            </button>
          ))}
          {!visible.length && <p className="stats-wallet-filter-empty">No matching asset</p>}
        </div>
      )}
    >
      {({ isDropdownOpen, handleToggleDropdown }) => (
        <StatsDropdownTrigger
          label={value.length ? value.join(', ') : 'Search'}
          ariaLabel={`${label}: ${value.length ? value.join(', ') : 'Search'}`}
          expanded={isDropdownOpen}
          onClick={handleToggleDropdown}
        />
      )}
    </Dropdown>
  );
};

const walletRiskOptions = ['All', 'No Risk', 'At Risk', 'Eligible', 'Bad Debt'];

export const StatsWalletsPage = () => {
  const [risk, setRisk] = useState('All');
  const [market, setMarket] = useState('All');
  const [supplied, setSupplied] = useState<string[]>([]);
  const [borrowed, setBorrowed] = useState<string[]>([]);
  const filtered = useMemo(
    () =>
      walletRecords.filter(
        wallet =>
          (risk === 'All' || wallet.risk === risk) &&
          (market === 'All' || wallet.market === market) &&
          (!supplied.length || supplied.includes(wallet.suppliedAsset)) &&
          (!borrowed.length || borrowed.includes(wallet.borrowedAsset)),
      ),
    [risk, market, supplied, borrowed],
  );
  const table: StatsTableData = {
    title: '',
    columns: [
      '#',
      'Wallet',
      'Total Supply (USD)',
      'Collateral (USD)',
      'Borrow Power (USD)',
      'Liquidation Risk',
      'Total Debt (USD)',
      'Health Factor',
      'Market',
      'Supplied Asset',
      'Borrowed Asset',
    ],
    rows: filtered.map((wallet, index) => ({
      id: wallet.address,
      cells: [
        String(index),
        `${wallet.address.slice(0, 18)}…`,
        usd(wallet.supply),
        usd(wallet.collateral),
        usd(wallet.borrowPower),
        wallet.risk,
        usd(wallet.debt),
        wallet.healthFactor.toFixed(2),
        wallet.market,
        wallet.suppliedAsset,
        wallet.borrowedAsset,
      ],
    })),
  };

  return (
    <div className="stats-content stats-deep-content">
      <div className="stats-wallet-filters">
        <div className="stats-wallet-filter">
          <span className="stats-wallet-filter-label">Liquidation Risk Filter</span>
          <Select
            value={risk}
            onChange={value => setRisk(String(value))}
            size="medium"
            options={walletRiskOptions.map(option => ({ label: option, value: option }))}
          />
        </div>
        <div className="stats-wallet-filter">
          <span className="stats-wallet-filter-label">Market Filter</span>
          <Select
            value={market}
            onChange={value => setMarket(String(value))}
            size="medium"
            options={['All', ...walletFilterMarkets].map(option => ({
              label: option,
              value: option,
            }))}
          />
        </div>
        <SearchableTokenFilter
          label="Supplied Assets Filter"
          value={supplied}
          onChange={setSupplied}
        />
        <SearchableTokenFilter
          label="Borrowed Assets Filter"
          value={borrowed}
          onChange={setBorrowed}
        />
      </div>
      <StatsDataTable table={table} dense pageSize={50} className="stats-wallet-table" />
    </div>
  );
};

const collateralTokens = knownTokens.filter(token =>
  [...collateralDebtAssets, ...collateralAssetOptions].includes(token.symbol),
);

const SpotlightAssetPicker = ({
  label,
  value,
  options,
  onChange,
  open,
  onToggle,
  onClose,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  const tokenOptions = collateralTokens.filter(token => options.includes(token.symbol));
  const selectedToken = tokenOptions.find(token => token.symbol === value) ?? tokenOptions[0];
  return (
    <div className="stats-spotlight-picker">
      <span>{label}</span>
      <TokenListWrapper
        className="stats-deep-asset-picker"
        tokenBalances={tokenOptions.map(token => ({ token }))}
        selectedToken={selectedToken}
        isListShown={open}
        displayCommonTokenButtons={false}
        onClose={onClose}
        onTokenClick={token => onChange(token.symbol)}
      >
        <StatsDropdownTrigger
          label={value}
          ariaLabel={`${label}: ${value}`}
          expanded={open}
          onClick={onToggle}
        />
      </TokenListWrapper>
    </div>
  );
};

const PairBars = ({ title, reverse = false }: { title: string; reverse?: boolean }) => (
  <StatsPanel title={title} className="stats-collateral-pair-panel">
    <div className="stats-collateral-pair-list" role="list" aria-label={title}>
      {collateralPairs.map((pair, index) => (
        <div className="stats-collateral-pair-row" role="listitem" key={pair.name}>
          <span>{reverse ? pair.name.split(' → ').reverse().join(' → ') : pair.name}</span>
          <div className="stats-collateral-pair-track">
            <div
              style={{
                width: `${(pair.value / 60) * 100}%`,
                backgroundColor: assetPalette[index % assetPalette.length],
              }}
            />
            <strong>${pair.value}M</strong>
          </div>
        </div>
      ))}
    </div>
    <div className="stats-collateral-pair-axis" aria-hidden="true">
      <span>$0</span>
      <span>$20M</span>
      <span>$40M</span>
      <span>$60M</span>
    </div>
  </StatsPanel>
);

const SupplierBars = () => (
  <StatsPanel title="Top Collateral Suppliers by Asset" className="stats-collateral-supplier-panel">
    <div
      className="stats-collateral-supplier-chart stats-chart"
      role="img"
      aria-label="Top collateral suppliers by asset chart"
    >
      <ResponsiveContainer>
        <BarChart data={collateralSuppliers} margin={{ top: 20, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={theme.colors['dark-blue-hover']} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            stroke={theme.colors['light-grey']}
            interval={0}
          />
          <YAxis
            tickFormatter={value => `$${value}M`}
            tickLine={false}
            axisLine={false}
            stroke={theme.colors['light-grey']}
            width={55}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipContent
                  items={[
                    { label: 'Asset', value: String(label ?? '') },
                    { label: 'Supply', value: `$${Number(payload[0].value).toFixed(2)}M` },
                  ]}
                />
              ) : null
            }
          />
          <Bar dataKey="value" isAnimationActive={false}>
            {collateralSuppliers.map((item, index) => (
              <Cell key={item.name} fill={assetPalette[index % assetPalette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </StatsPanel>
);

export const StatsCollateralPage = () => {
  const [debtAsset, setDebtAsset] = useState('U');
  const [collateralAsset, setCollateralAsset] = useState('BTCB');
  const [openPicker, setOpenPicker] = useState<'debt' | 'collateral' | null>(null);
  const debtIndex = collateralDebtAssets.indexOf(debtAsset);
  const collateralIndex = collateralAssetOptions.indexOf(collateralAsset);
  const attributedDebt = collateralMatrixDebtTotals[debtAsset] ?? 0;
  const deposited = 203 - Math.max(collateralIndex, 0) * 17;
  const debtSupported = collateralMatrixCollateralTotals[collateralAsset] ?? 0;

  return (
    <div className="stats-content stats-deep-content">
      <StatsPanel className="stats-collateral-guide">
        <p>
          Protocol-wide charts show all assets. Use the selectors below to inspect one debt asset or
          one collateral asset.
        </p>
        <p>
          The debt asset filters Debt Spotlight; the collateral asset filters Collateral Spotlight.
        </p>
      </StatsPanel>
      <div className="stats-two-column">
        <PairBars title="Top 10 Collateral → Debt Pairs" />
        <PairBars title="Top 10 Debt → Collateral Pairs" reverse />
      </div>
      <StatsDataTable table={collateralMatrix} dense className="stats-collateral-matrix" />
      <div className="stats-spotlight-heading">
        <div className="stats-section-heading">
          <h2>Debt Spotlight</h2>
          <p>Get stats on a given debt asset</p>
        </div>
        <SpotlightAssetPicker
          label="Selected Debt Asset"
          value={debtAsset}
          options={collateralDebtAssets}
          onChange={setDebtAsset}
          open={openPicker === 'debt'}
          onToggle={() => setOpenPicker(current => (current === 'debt' ? null : 'debt'))}
          onClose={() => setOpenPicker(null)}
        />
      </div>
      <div className="stats-spotlight-metrics" aria-live="polite">
        <MetricTile
          label="Total Attributed Debt"
          value={`$${Number(attributedDebt.toFixed(1))}M`}
        />
        <MetricTile label="Collateral Sources" value={String(21 + Math.max(debtIndex, 0) * 2)} />
      </div>
      <div className="stats-spotlight-heading">
        <div className="stats-section-heading">
          <h2>Collateral Spotlight</h2>
          <p>Get stats on a given collateral asset</p>
        </div>
        <SpotlightAssetPicker
          label="Selected Collateral Asset"
          value={collateralAsset}
          options={collateralAssetOptions}
          onChange={setCollateralAsset}
          open={openPicker === 'collateral'}
          onToggle={() =>
            setOpenPicker(current => (current === 'collateral' ? null : 'collateral'))
          }
          onClose={() => setOpenPicker(null)}
        />
      </div>
      <div
        className="stats-spotlight-metrics stats-spotlight-metrics--collateral"
        aria-live="polite"
      >
        <MetricTile label="Total Deposited" value={`$${deposited}M`} />
        <MetricTile label="Collateral Enabled" value={`$${Math.round(deposited * 0.96)}M`} />
        <MetricTile label="Debt Supported" value={`$${Number(debtSupported.toFixed(1))}M`} />
        <MetricTile label="Debt Assets" value={String(29 - Math.max(collateralIndex, 0))} />
        <MetricTile label="User Pairs" value={String(197 - Math.max(collateralIndex, 0) * 12)} />
      </div>
      <SupplierBars />
      <div className="stats-section-heading">
        <h2>Collateral &amp; Debt Attribution</h2>
        <p>
          Collateral is attributed to debt pro rata by USD value and weighted by collateral factor.
          This is an analytical model, not an on-chain link between a specific deposit and borrow.
        </p>
      </div>
    </div>
  );
};
