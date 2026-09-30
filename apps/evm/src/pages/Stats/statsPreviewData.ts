import { type StatsOverviewDetails, overviewPreviewDetails } from './statsOverviewData';

/**
 * Illustrative values from the Stats design, kept separate from the view so the
 * future Venus risk API can replace this adapter without changing the page.
 */
export interface StatsPoint {
  date: string;
  value: number;
}

export interface StatsMetric {
  label: string;
  value: string;
  change?: string;
  comparisonLabel?: string;
  tone?: 'green' | 'red' | 'blue' | 'neutral';
  points?: StatsPoint[];
  pointUnit?: 'usd-billions' | 'usd-millions' | 'percentage';
}

export interface StatsRow {
  id: string;
  cells: string[];
}

export interface StatsTableData {
  title: string;
  description?: string;
  columns: string[];
  rows: StatsRow[];
}

export interface StatsDashboardData {
  asOf: string;
  overview: {
    hero: StatsMetric[];
    kpis: StatsMetric[];
    tvl: StatsPoint[];
    deposits: { name: string; value: number }[];
    borrows: { name: string; value: number }[];
    topPositions: StatsTableData;
    details: StatsOverviewDetails;
  };
  markets: {
    metrics: StatsMetric[];
    supply: StatsPoint[];
    borrow: StatsPoint[];
    table: StatsTableData;
  };
  liquidations: {
    metrics: StatsMetric[];
    volume: StatsPoint[];
    assets: { name: string; value: number }[];
    table: StatsTableData;
  };
  rates: {
    metrics: StatsMetric[];
    supply: StatsPoint[];
    borrow: StatsPoint[];
    table: StatsTableData;
  };
  risk: {
    metrics: StatsMetric[];
    exposure: StatsPoint[];
    buckets: { name: string; value: number }[];
    table: StatsTableData;
  };
  badDebt: {
    metrics: StatsMetric[];
    history: StatsPoint[];
    table: StatsTableData;
  };
  users: StatsTableData;
  wallets: {
    metrics: StatsMetric[];
    distribution: { name: string; value: number }[];
    table: StatsTableData;
  };
  collateral: {
    metrics: StatsMetric[];
    history: StatsPoint[];
    mix: { name: string; value: number }[];
    table: StatsTableData;
  };
}

const dates = [
  'Sep 1, 2025',
  'Oct 1, 2025',
  'Nov 1, 2025',
  'Dec 1, 2025',
  'Jan 1, 2026',
  'Feb 1, 2026',
  'Mar 1, 2026',
  'Apr 1, 2026',
  'May 1, 2026',
  'Jun 1, 2026',
  'Jul 1, 2026',
  'Aug 1, 2026',
];

const trend = (values: number[]): StatsPoint[] =>
  values.map((value, index) => ({ date: dates[index], value }));

const supply = trend([1.42, 1.47, 1.43, 1.5, 1.48, 1.54, 1.51, 1.57, 1.55, 1.63, 1.6, 1.69]);
const borrow = trend([0.47, 0.45, 0.46, 0.44, 0.42, 0.43, 0.41, 0.4, 0.42, 0.39, 0.4, 0.4]);
const tvl = trend([1.18, 1.21, 1.2, 1.24, 1.27, 1.25, 1.29, 1.31, 1.3, 1.34, 1.33, 1.36]);

export const statsPreviewData: StatsDashboardData = {
  asOf: 'Illustrative design data · Aug 2026',
  overview: {
    hero: [
      {
        label: 'Total Supply',
        value: '$1.69B',
        change: '+10.43%',
        tone: 'green',
        points: supply,
        pointUnit: 'usd-billions',
      },
      {
        label: 'Total Borrows',
        value: '$400M',
        change: '−10.43%',
        tone: 'red',
        points: borrow,
        pointUnit: 'usd-billions',
      },
      {
        label: 'Total Value Locked',
        value: '$1.36B',
        change: '+5.92%',
        tone: 'blue',
        points: tvl,
        pointUnit: 'usd-billions',
      },
    ],
    kpis: [
      { label: 'Utilization Rate', value: '28.5%' },
      { label: 'Value Eligible for Liquidations', value: '$2K' },
      { label: 'Total Collateral at Risk', value: '$42.97M' },
      { label: 'Wallets at Risk', value: '398' },
      { label: 'Wallets Eligible for Liquidations', value: '363' },
      { label: 'Bad Debt', value: '$336' },
      { label: 'Borrowers > $10', value: '5,298' },
      { label: 'Total Suppliers', value: '134,194' },
      { label: 'Total Borrowers', value: '28,659' },
      { label: 'Suppliers > $10', value: '22,843' },
    ],
    tvl,
    deposits: [
      { name: 'BNB', value: 36 },
      { name: 'USDT', value: 24 },
      { name: 'BTCB', value: 16 },
      { name: 'ETH', value: 13 },
      { name: 'Other', value: 11 },
    ],
    borrows: [
      { name: 'USDT', value: 42 },
      { name: 'BNB', value: 24 },
      { name: 'USDC', value: 17 },
      { name: 'BTCB', value: 10 },
      { name: 'Other', value: 7 },
    ],
    topPositions: {
      title: 'Top Borrowers & Suppliers',
      description: 'Largest positions by supply and borrow value.',
      columns: ['Wallet', 'Total supply', 'Total borrow', 'Health factor', 'Main asset'],
      rows: [
        { id: 'position-1', cells: ['0x71b4…9c28', '$12.8M', '$8.4M', '1.82', 'BNB'] },
        { id: 'position-2', cells: ['0x204e…3af7', '$10.2M', '$7.1M', '1.46', 'BTCB'] },
        { id: 'position-3', cells: ['0x8d90…741e', '$8.7M', '$4.8M', '2.03', 'ETH'] },
        { id: 'position-4', cells: ['0x5a12…6e94', '$6.3M', '$3.6M', '1.63', 'USDT'] },
      ],
    },
    details: overviewPreviewDetails,
  },
  markets: {
    metrics: [
      { label: 'Total Supply', value: '$1.69B' },
      { label: 'Total Borrows', value: '$400M' },
      { label: 'Available Liquidity', value: '$1.29B' },
      { label: 'Active Markets', value: '28' },
    ],
    supply,
    borrow,
    table: {
      title: 'Market Overview',
      description: 'Supply, borrow and utilization by asset.',
      columns: ['Asset', 'Total supply', 'Total borrow', 'Utilization', 'Supply APY', 'Borrow APY'],
      rows: [
        { id: 'bnb', cells: ['BNB', '$609.4M', '$143.8M', '23.6%', '2.14%', '5.78%'] },
        { id: 'usdt', cells: ['USDT', '$405.8M', '$168.2M', '41.4%', '3.76%', '7.12%'] },
        { id: 'btcb', cells: ['BTCB', '$270.4M', '$40.8M', '15.1%', '0.62%', '3.24%'] },
        { id: 'eth', cells: ['ETH', '$219.7M', '$29.6M', '13.5%', '0.89%', '3.81%'] },
        { id: 'usdc', cells: ['USDC', '$115.2M', '$17.6M', '15.3%', '2.08%', '5.48%'] },
      ],
    },
  },
  liquidations: {
    metrics: [
      { label: 'Value Eligible for Liquidations', value: '$2K' },
      { label: 'Wallets Eligible', value: '363' },
      { label: 'Liquidation Volume · 30D', value: '$3.82M' },
      { label: 'Liquidation Events · 30D', value: '1,024' },
    ],
    volume: trend([180, 235, 210, 265, 230, 410, 290, 305, 275, 360, 340, 420]),
    assets: [
      { name: 'BNB', value: 42 },
      { name: 'BTCB', value: 26 },
      { name: 'ETH', value: 18 },
      { name: 'Other', value: 14 },
    ],
    table: {
      title: 'Recent Liquidations',
      columns: ['Wallet', 'Collateral asset', 'Debt asset', 'Repaid', 'Seized'],
      rows: [
        { id: 'liquidation-1', cells: ['0x17a3…c251', 'BNB', 'USDT', '$92.4K', '$97.1K'] },
        { id: 'liquidation-2', cells: ['0x6e21…d0a8', 'BTCB', 'USDC', '$65.8K', '$69.1K'] },
        { id: 'liquidation-3', cells: ['0xb30f…82a1', 'ETH', 'USDT', '$40.2K', '$42.2K'] },
      ],
    },
  },
  rates: {
    metrics: [
      { label: 'Highest Supply APY', value: '5.81%' },
      { label: 'Lowest Borrow APY', value: '3.24%' },
      { label: 'Median Utilization', value: '28.5%' },
      { label: 'Markets Tracked', value: '28' },
    ],
    supply: trend([2.1, 2.15, 2.13, 2.3, 2.4, 2.37, 2.48, 2.52, 2.49, 2.59, 2.55, 2.71]),
    borrow: trend([6.4, 6.35, 6.44, 6.2, 6.1, 6.18, 6.05, 6.12, 6.0, 5.92, 6.01, 5.85]),
    table: {
      title: 'Rates by Asset',
      columns: ['Asset', 'Supply APY', 'Borrow APY', 'Utilization', 'Borrow cap'],
      rows: [
        { id: 'rate-usdt', cells: ['USDT', '3.76%', '7.12%', '41.4%', '$450M'] },
        { id: 'rate-bnb', cells: ['BNB', '2.14%', '5.78%', '23.6%', '$300M'] },
        { id: 'rate-usdc', cells: ['USDC', '2.08%', '5.48%', '15.3%', '$260M'] },
        { id: 'rate-eth', cells: ['ETH', '0.89%', '3.81%', '13.5%', '$180M'] },
      ],
    },
  },
  risk: {
    metrics: [
      { label: 'Total Collateral at Risk', value: '$42.97M' },
      { label: 'Wallets at Risk', value: '398' },
      { label: 'Wallets Eligible', value: '363' },
      { label: 'Bad Debt', value: '$336' },
    ],
    exposure: trend([32, 34, 33, 36, 37, 36, 40, 39, 43, 41, 42, 42.97]),
    buckets: [
      { name: '< 1.0', value: 8 },
      { name: '1.0–1.2', value: 21 },
      { name: '1.2–1.5', value: 31 },
      { name: '1.5–2.0', value: 26 },
      { name: '> 2.0', value: 14 },
    ],
    table: {
      title: 'Positions Closest to Liquidation',
      columns: ['Wallet', 'Collateral', 'Borrow', 'Health factor', 'Primary collateral'],
      rows: [
        { id: 'risk-1', cells: ['0x63e2…ac11', '$182.4K', '$145.9K', '1.01', 'BNB'] },
        { id: 'risk-2', cells: ['0x741a…f903', '$96.2K', '$76.6K', '1.04', 'ETH'] },
        { id: 'risk-3', cells: ['0x9d40…d2b8', '$75.8K', '$58.1K', '1.08', 'BTCB'] },
      ],
    },
  },
  badDebt: {
    metrics: [
      { label: 'Total Bad Debt', value: '$336' },
      { label: 'Users with Bad Debt', value: '12' },
      { label: 'Largest Position', value: '$84' },
      { label: 'Markets Affected', value: '4' },
    ],
    history: trend([180, 180, 205, 205, 240, 250, 250, 280, 300, 300, 328, 336]),
    table: {
      title: 'Bad Debt Users',
      columns: ['Wallet', 'Bad debt', 'Debt asset', 'Collateral left', 'Market'],
      rows: [
        { id: 'bad-debt-1', cells: ['0x312c…e871', '$84', 'USDT', '$0', 'Core Pool'] },
        { id: 'bad-debt-2', cells: ['0x61c2…e7a0', '$72', 'BNB', '$0', 'Core Pool'] },
        { id: 'bad-debt-3', cells: ['0x99ae…c278', '$61', 'USDC', '$0', 'Core Pool'] },
      ],
    },
  },
  users: {
    title: 'User Position Explorer',
    description: 'Search a wallet in this illustrative dataset to inspect its position.',
    columns: ['Wallet', 'Total supply', 'Total borrow', 'Health factor', 'Collateral assets'],
    rows: [
      { id: 'user-1', cells: ['0x71b4…9c28', '$12.8M', '$8.4M', '1.82', 'BNB, BTCB'] },
      { id: 'user-2', cells: ['0x204e…3af7', '$10.2M', '$7.1M', '1.46', 'BTCB, ETH'] },
      { id: 'user-3', cells: ['0x63e2…ac11', '$182.4K', '$145.9K', '1.01', 'BNB'] },
      { id: 'user-4', cells: ['0x741a…f903', '$96.2K', '$76.6K', '1.04', 'ETH'] },
    ],
  },
  wallets: {
    metrics: [
      { label: 'Total Suppliers', value: '134,194' },
      { label: 'Total Borrowers', value: '28,659' },
      { label: 'Suppliers > $10', value: '22,843' },
      { label: 'Borrowers > $10', value: '5,298' },
    ],
    distribution: [
      { name: '< $100', value: 38 },
      { name: '$100–$1K', value: 27 },
      { name: '$1K–$10K', value: 19 },
      { name: '$10K–$100K', value: 11 },
      { name: '> $100K', value: 5 },
    ],
    table: {
      title: 'Largest Wallets',
      columns: ['Wallet', 'Supply', 'Borrow', 'Net position', 'Health factor'],
      rows: [
        { id: 'wallet-1', cells: ['0x71b4…9c28', '$12.8M', '$8.4M', '$4.4M', '1.82'] },
        { id: 'wallet-2', cells: ['0x204e…3af7', '$10.2M', '$7.1M', '$3.1M', '1.46'] },
        { id: 'wallet-3', cells: ['0x8d90…741e', '$8.7M', '$4.8M', '$3.9M', '2.03'] },
      ],
    },
  },
  collateral: {
    metrics: [
      { label: 'Total Collateral', value: '$1.36B' },
      { label: 'Collateral at Risk', value: '$42.97M' },
      { label: 'Active Collateral Assets', value: '18' },
      { label: 'Top Asset Share', value: '36%' },
    ],
    history: trend([36, 36.5, 37, 36.8, 38, 39, 38.6, 40, 40.5, 41, 42, 42.97]),
    mix: [
      { name: 'BNB', value: 36 },
      { name: 'BTCB', value: 24 },
      { name: 'ETH', value: 18 },
      { name: 'USDT', value: 12 },
      { name: 'Other', value: 10 },
    ],
    table: {
      title: 'Collateral by Asset',
      columns: ['Asset', 'Total collateral', 'At risk', 'At risk wallets', 'Share'],
      rows: [
        { id: 'col-bnb', cells: ['BNB', '$489.6M', '$18.4M', '154', '36%'] },
        { id: 'col-btcb', cells: ['BTCB', '$326.4M', '$11.2M', '92', '24%'] },
        { id: 'col-eth', cells: ['ETH', '$244.8M', '$7.7M', '73', '18%'] },
        { id: 'col-usdt', cells: ['USDT', '$163.2M', '$4.2M', '51', '12%'] },
      ],
    },
  },
};
