import type { StatsSeriesRow } from './statsOverviewData';
import type { StatsPoint, StatsTableData } from './statsPreviewData';

type TimeRange = '1D' | '1W' | '1M' | '1Y';

// Preview data mirrors the Figma information model. The backend can replace this
// adapter without changing the section's components or table interactions.
export const liquidationMetrics = [
  { label: 'Number of Liquidations', value: '187' },
  { label: 'Collateral Seized', value: '$143K' },
  { label: 'Debt Repaid', value: '$132K' },
  { label: 'Liquidation Bonus Paid', value: '$11K' },
  { label: 'Active Liquidators', value: '23' },
  { label: 'Wallets with Bad Debt (>$10)', value: '12' },
];

const historyShape = [
  1.12, 1.28, 1.21, 1.24, 1.28, 1.15, 1.17, 1.19, 1.23, 1.08, 1.35, 1.29, 1.41, 1.3, 1.32, 0.59,
  0.51, 0.47, 0.43, 0.61, 0.56, 0.57, 0.36, 0.46, 0.71, 0.6, 0.58, 0.44, 0.68, 0.82, 1.02, 0.93,
  0.89, 0.84, 1.18, 1.39, 1.33, 1.54, 1.83, 1.77, 1.87, 2.0, 1.48,
];

export const getLiquidationHistory = (range: TimeRange): StatsPoint[] => {
  const intervals: Record<TimeRange, { count: number; hours: number }> = {
    '1D': { count: 24, hours: 1 },
    '1W': { count: 21, hours: 8 },
    '1M': { count: 30, hours: 24 },
    '1Y': { count: historyShape.length, hours: 7 * 24 },
  };
  const { count, hours } = intervals[range];
  const end = Date.UTC(2026, 2, 1, 12);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end - (count - index - 1) * hours * 60 * 60 * 1000);
    const shapeIndex = Math.round((index * (historyShape.length - 1)) / (count - 1));
    const label =
      range === '1D'
        ? new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: true, timeZone: 'UTC' }).format(
            date,
          )
        : new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            ...(range === '1Y' ? { year: 'numeric' } : {}),
            timeZone: 'UTC',
          }).format(date);

    return { date: label, value: historyShape[shapeIndex] };
  });
};

export const collateralDistribution = [
  { name: 'BTCB', value: 80_000 },
  { name: 'USDT', value: 12_000 },
  { name: 'ETH', value: 8_000 },
  { name: 'Cake', value: 3_000 },
  { name: 'XVS', value: 3_000 },
  { name: 'THE', value: 2_000 },
  { name: 'XRP', value: 2_000 },
  { name: 'USDC', value: 2_000 },
  { name: 'BNB', value: 1_000 },
  { name: 'DOT', value: 800 },
  { name: 'AAVE', value: 600 },
  { name: 'U', value: 400 },
  { name: 'FIL', value: 300 },
  { name: 'MATIC', value: 200 },
  { name: 'LTC', value: 150 },
  { name: 'Other', value: 67 },
];

const collateralAssets = [
  'AAVE',
  'SXP',
  'USDT',
  'BNB',
  'ETH',
  'BTCB',
  'FIL',
  'THE',
  'MATIC',
  'XRP',
  'DOT',
];
const debtAssets = ['BNB', 'USDT', 'WBNB', 'USDC', 'BTCB', 'ETH', 'DAI'];
const hexAddress = (index: number, salt: number) =>
  `0x${((index + 1) * 0x31f5a2 + salt).toString(16).padStart(8, '0')}${'0'.repeat(28)}`;
const shortAddress = (index: number, salt: number) => `${hexAddress(index, salt).slice(0, 15)}…`;
const usd = (amount: number) =>
  `$${amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const recentLiquidations: StatsTableData = {
  title: 'Recent Liquidation Events',
  columns: [
    '#',
    'Event Date',
    'Chain',
    'Collateral',
    'Debt Asset',
    'Borrower',
    'Debt Repaid',
    'Col. Seized',
    'TX Hash',
  ],
  rows: Array.from({ length: 150 }, (_, index) => {
    const repaid = Number(
      (index < 8 ? 1.14 + index * 3.8 : 0.12 + ((index * 41) % 2400) / 10).toFixed(2),
    );
    const date = new Date(Date.UTC(2026, 4, 14) - Math.floor(index / 3) * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return {
      id: `liquidation-${index}`,
      cells: [
        String(index),
        date,
        'BNB',
        collateralAssets[index % collateralAssets.length],
        debtAssets[index % debtAssets.length],
        shortAddress(index, 0x312),
        repaid.toFixed(2),
        (repaid * 1.1).toFixed(2),
        shortAddress(index, 0x881),
      ],
    };
  }),
};

export const eligibleWallets: StatsTableData = {
  title: 'Wallets Eligible for Liquidation',
  columns: [
    '#',
    'Wallet',
    'Mode',
    'Collateral (USD)',
    'Debt (USD)',
    'Health Factor',
    'Shortfall (USD)',
  ],
  rows: Array.from({ length: 50 }, (_, index) => {
    const debt = Number((10.16 / (1 + index * 0.045)).toFixed(2));
    const health = Number((index % 9 === 0 ? 0.0002 : (index % 24) / 25).toFixed(4));
    const collateral = Number((debt * health).toFixed(2));
    return {
      id: `eligible-${index}`,
      cells: [
        String(index),
        shortAddress(index, 0x4a7),
        'Standard',
        collateral.toFixed(2),
        debt.toFixed(2),
        health.toFixed(4),
        (collateral - debt).toFixed(2),
      ],
    };
  }),
};

export const topLiquidators: StatsTableData = {
  title: 'Top Liquidators',
  columns: [
    '#',
    'Liquidator',
    'Liquidations',
    'Debt Repaid (USD)',
    'Collateral Seized (USD)',
    'Profit (USD)',
    'Unique Borrowers',
    'First Liq.',
    'Last Liq.',
  ],
  rows: Array.from({ length: 23 }, (_, index) => {
    const count = index === 0 ? 65 : Math.max(1, 18 - index);
    const repaid = 49_258.79 / (1 + index * 0.55);
    const seized = repaid * 1.105;
    return {
      id: `liquidator-${index}`,
      cells: [
        String(index),
        shortAddress(index, 0x219),
        String(count),
        usd(repaid),
        usd(seized),
        usd(seized - repaid),
        String(Math.min(count, Math.max(1, Math.ceil(count * 0.75)))),
        `2026-04-${String(14 + (index % 16)).padStart(2, '0')}`,
        `2026-05-${String(1 + (index % 14)).padStart(2, '0')}`,
      ],
    };
  }),
};

export const liquidationAssets = [
  'BTCB',
  'BNB',
  'USDT',
  'SolvBTC',
  'asBNB',
  'USDC',
  'xSolvBTC',
  'WBNB',
  'ETH',
  'U',
];

export const liquidationWalletChart = Array.from({ length: 5 }, (_, index) => {
  const row: StatsSeriesRow = { date: shortAddress(index, 0x120).slice(0, 8) };
  liquidationAssets.forEach((asset, assetIndex) => {
    row[asset] = Math.round(((index * 7 + assetIndex * 11) % 29) * (index === 0 ? 1.7 : 1));
  });
  return row;
});

export const liquidationVolumeChart = Array.from({ length: 26 }, (_, index) => ({
  date: String(index + 1),
  'Debt Repaid': Math.max(12, 140 - index * 5),
  'Collateral Seized': Math.max(2, 18 - index * 0.45),
  Bonus: Math.max(1, 5 - index * 0.12),
}));
