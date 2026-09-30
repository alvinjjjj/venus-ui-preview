import type { StatsPoint, StatsTableData } from './statsPreviewData';

export type StatsSeriesRow = { date: string } & Record<string, string | number>;
export type StatsCategoryRow = { name: string } & Record<string, string | number>;

export interface StatsOverviewDetails {
  depositsHistory: StatsSeriesRow[];
  borrowsHistory: StatsSeriesRow[];
  supplyDominance: StatsPoint[];
  debtDominance: StatsPoint[];
  topSuppliers: StatsSeriesRow[];
  topBorrowers: StatsSeriesRow[];
  marketTable: StatsTableData;
  riskTable: StatsTableData;
  emodeTable: StatsTableData;
  transactions: StatsSeriesRow[];
}

const marketAssets = [
  'BTCB',
  'BNB',
  'USDT',
  'SolvBTC',
  'asBNB',
  'wBNB',
  'USDC',
  'xSolvBTC',
  'ETH',
  'U',
  'wBETH',
  'CAKE',
  'FDUSD',
  'DOGE',
  'XRP',
  'UNI',
  'ADA',
  'LTC',
  'XVS',
  'DAI',
  'SOL',
  'sUSDe',
  'LINK',
  'USD1',
  'FIL',
  'lisUSD',
  'TRX',
  'BUSD',
  'BCH',
  'PT-clisBNB',
  'DOT',
  'AAVE',
  'TWT',
  'BETH',
  'slisBNB',
  'THE',
  'MATIC',
];

const marketSupply = [417, 388, 219, 199, 87.2, 64.8, 62.3, 59.8, 45.4, 26.5, 23.5, 20.1];
const marketBorrow = [137, 112, 123, 0.799, 0, 11.2, 32.2, 0, 25.9, 13.5, 0.271, 0.106];
const formatUsdMillions = (millions: number) => {
  if (millions === 0) return '$0';
  if (millions < 1) return `$${Math.round(millions * 1000)}K`;
  if (millions >= 1000) return `$${(millions / 1000).toFixed(2)}B`;
  return `$${millions.toFixed(millions < 10 ? 2 : 1).replace(/\.0$/, '')}M`;
};

const marketRows = marketAssets.map((asset, index) => {
  const supply = marketSupply[index] ?? Math.max(0.18, 17.8 * 0.79 ** (index - 12));
  const borrow = marketBorrow[index] ?? supply * (0.08 + (index % 5) * 0.085);
  const utilization = supply ? (borrow / supply) * 100 : 0;
  return {
    id: `overview-market-${asset}`,
    cells: [
      String(index + 1),
      asset,
      formatUsdMillions(supply),
      formatUsdMillions(borrow),
      `${utilization.toFixed(2)}%`,
      `${(utilization * 0.13).toFixed(2)}%`,
      `${(3.2 + utilization * 0.22).toFixed(2)}%`,
      formatUsdMillions(supply * (0.16 + (index % 4) * 0.06)),
      formatUsdMillions(supply * 4.8),
    ],
  };
});

const riskRows = marketAssets.map((asset, index) => {
  const supply = marketSupply[index] ?? Math.max(0.18, 17.8 * 0.79 ** (index - 12));
  const borrow = marketBorrow[index] ?? supply * (0.08 + (index % 5) * 0.085);
  const factor = index < 3 ? 80 : Math.max(43, 80 - (index % 7) * 5);
  return {
    id: `overview-risk-${asset}`,
    cells: [
      String(index + 1),
      asset,
      index < 3 ? ['$79.8K', '$670', '$1'][index] : '—',
      formatUsdMillions(supply),
      formatUsdMillions(borrow),
      `${factor}%`,
      `${factor}%`,
      '110%',
      `${index % 3 === 0 ? 30 : 20}%`,
      formatUsdMillions(supply * 4.8),
    ],
  };
});

const emodePools = [
  { name: 'Stablecoins', assets: ['vUSDe', 'vUSDC', 'vUSDT'], ltv: '90%', threshold: '92.5%' },
  { name: 'BTC', assets: ['vSolvBTC', 'vxSolvBTC'], ltv: '83%', threshold: '85%' },
  { name: 'BNB', assets: ['vBNB', 'vasBNB', 'vslisBNB'], ltv: '89%', threshold: '92%' },
  { name: 'LINK', assets: ['vLINK', 'vUSDC', 'vUSDT'], ltv: '63%', threshold: '63%' },
  { name: 'UNI', assets: ['vUNI', 'vUSDC', 'vUSDT'], ltv: '80%', threshold: '80%' },
  { name: 'AAVE', assets: ['vAAVE', 'vUSDC', 'vUSDT'], ltv: '82.5%', threshold: '85%' },
  { name: 'DOGE', assets: ['vDOGE', 'vUSDC', 'vUSDT'], ltv: '43%', threshold: '43%' },
  { name: 'BCH', assets: ['vBCH', 'vUSDC', 'vUSDT'], ltv: '80%', threshold: '80%' },
  { name: 'TWT', assets: ['vTWT', 'vUSDC', 'vUSDT'], ltv: '80%', threshold: '80%' },
  { name: 'ADA', assets: ['vADA', 'vUSDC', 'vUSDT'], ltv: '63%', threshold: '63%' },
  { name: 'LTC', assets: ['vLTC', 'vUSDC', 'vUSDT'], ltv: '80%', threshold: '80%' },
  { name: 'FIL', assets: ['vFIL', 'vUSDC', 'vUSDT'], ltv: '63%', threshold: '63%' },
  { name: 'TRX', assets: ['vTRX', 'vUSDC', 'vUSDT'], ltv: '52.5%', threshold: '52.5%' },
  { name: 'DOT', assets: ['vDOT', 'vUSDC', 'vUSDT'], ltv: '80%', threshold: '80%' },
  { name: 'THE', assets: ['vTHE', 'vUSDC'], ltv: '53%', threshold: '53%' },
];

const emodeRows = emodePools
  .flatMap((pool, poolIndex) =>
    pool.assets.map((asset, assetIndex) => ({
      id: `emode-${poolIndex}-${asset}`,
      cells: [
        String(poolIndex * 3 + assetIndex),
        String(poolIndex + 1),
        pool.name,
        'True',
        poolIndex < 3 ? 'True' : 'False',
        asset,
        assetIndex === 0 ? pool.ltv : '82.5%',
        assetIndex === 0 ? pool.threshold : '82.5%',
        poolIndex < 3 ? '4%' : '10%',
        assetIndex === 0 ? 'True' : 'False',
      ],
    })),
  )
  .map((row, index) => ({ ...row, cells: [String(index), ...row.cells.slice(1)] }));

// The chart data is deliberately synthetic. These shapes follow the Figma
// composition so BE can replace the data contract without rebuilding charts.
export const chartAssets = [
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
const areaStackOrder = [
  'asBNB',
  'BNB',
  'USDC',
  'BTCB',
  'WBNB',
  'ETH',
  'xSolvBTC',
  'SolvBTC',
  'USDT',
  'U',
];
const shares: Record<string, number> = {
  asBNB: 0.15,
  BNB: 0.24,
  USDC: 0.16,
  BTCB: 0.13,
  WBNB: 0.08,
  ETH: 0.07,
  xSolvBTC: 0.055,
  SolvBTC: 0.055,
  USDT: 0.04,
  U: 0.02,
};
const profile = [
  2250, 1920, 2050, 1880, 2020, 2550, 2250, 2670, 2470, 2940, 2790, 3360, 2930, 1800, 1960, 1880,
  2440, 1570,
];
const areaHistory = Array.from({ length: 112 }, (_, index) => {
  const position = (index / 111) * (profile.length - 1);
  const segment = Math.min(Math.floor(position), profile.length - 2);
  const fraction = position - segment;
  const envelope = profile[segment] * (1 - fraction) + profile[segment + 1] * fraction;
  const detail = 52 * Math.sin(index * 1.67) + 35 * Math.sin(index * 3.11);
  const total = envelope + detail;
  const date = new Date(Date.UTC(2025, 4, 11 + index)).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const row: StatsSeriesRow = { date };
  areaStackOrder.forEach((asset, assetIndex) => {
    const drift = 1 + 0.055 * Math.sin(index * 0.13 + assetIndex * 0.8);
    row[asset] = Math.round(total * shares[asset] * drift);
  });
  return row;
});

const barDates = [
  'Jun 1, 2025',
  'Jun 12, 2025',
  'Jun 22, 2025',
  'Jul 3, 2025',
  'Jul 13, 2025',
  'Jul 24, 2025',
  'Aug 3, 2025',
  'Aug 14, 2025',
  'Aug 24, 2025',
];
const barProfiles: Record<string, number>[] = [
  { ETH: 2450 },
  { ETH: 1540 },
  { SolvBTC: 1160, asBNB: 190 },
  { USDC: 1220, BTCB: 80 },
  { asBNB: 900, SolvBTC: 280 },
  { ETH: 590, USDC: 760, BTCB: 390, U: 80 },
  { BTCB: 1080 },
  { BNB: 920, USDC: 560 },
  { ETH: 520, USDC: 210, asBNB: 510, BTCB: 180 },
];
const supplierBars: StatsSeriesRow[] = barDates.map((date, index) => ({
  date,
  ...barProfiles[index],
}));
const borrowerBars: StatsSeriesRow[] = barDates.map((date, index) => ({
  date,
  ...Object.fromEntries(
    Object.entries(barProfiles[index]).map(([asset, value]) => [
      asset,
      Math.round(value * (0.91 + (index % 3) * 0.025)),
    ]),
  ),
}));

export const overviewPreviewDetails: StatsOverviewDetails = {
  depositsHistory: areaHistory,
  borrowsHistory: areaHistory.map((row, index) => {
    const next: StatsSeriesRow = { date: row.date };
    areaStackOrder.forEach((asset, assetIndex) => {
      next[asset] = Math.round(
        Number(row[asset]) * (0.94 + assetIndex * 0.004 + 0.015 * Math.sin(index * 0.3)),
      );
    });
    return next;
  }),
  supplyDominance: areaHistory.map((row, index) => ({
    date: row.date,
    value:
      37 +
      4.3 * Math.sin(index * 0.09) +
      2.1 * Math.sin(index * 0.32) +
      0.7 * Math.sin(index * 1.41),
  })),
  debtDominance: areaHistory.map((row, index) => ({
    date: row.date,
    value:
      36 +
      4.1 * Math.sin(index * 0.09 + 0.2) +
      2.3 * Math.sin(index * 0.34) +
      0.6 * Math.sin(index * 1.31),
  })),
  topSuppliers: supplierBars,
  topBorrowers: borrowerBars,
  marketTable: {
    title: 'Current state of all Venus BNB Core Pool markets',
    columns: [
      '#',
      'Asset',
      'Total Supply (USD)',
      'Total Borrow (USD)',
      'Utilization',
      'Supply APY',
      'Borrow APY',
      'Total Debt Against (USD)',
      'Supply Cap',
    ],
    rows: marketRows,
  },
  riskTable: {
    title: 'Risk Parameters by Market',
    columns: [
      '#',
      'Asset',
      'Price (USD)',
      'Total Supply (USD)',
      'Total Borrow (USD)',
      'Collateral Factor',
      'Liq Threshold',
      'Liq Incentive',
      'Reserve Factor',
      'Supply Cap',
    ],
    rows: riskRows,
  },
  emodeTable: {
    title: 'E-Mode Groups',
    columns: [
      '#',
      'Pool ID',
      'Pool',
      'Active',
      'Core Fallback',
      'Asset',
      'LTV',
      'Liq Threshold',
      'Liq Incentive',
      'Borrow Allowed',
    ],
    rows: emodeRows,
  },
  transactions: Array.from({ length: 30 }, (_, index) => ({
    date: `${index + 1} Aug`,
    Supply: Math.round(Math.max(340, 2850 - index * 84)),
    Withdraw: Math.round(155 + 32 * Math.sin(index * 0.65)),
    Borrow: Math.round(180 + 75 * Math.sin(index * 0.3 + 1)),
    Repay: index === 29 ? 2900 : Math.round(70 + 48 * Math.sin(index * 0.44)),
  })),
};
