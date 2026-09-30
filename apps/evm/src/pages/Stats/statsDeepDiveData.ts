import type { StatsPoint, StatsTableData } from './statsPreviewData';

export type DeepDiveRange = '1D' | '1W' | '1M' | '1Y';
export type ChartRow = { date: string; [key: string]: string | number };

// Illustrative adapters for the Figma flow. Replace these values with the risk
// API response while keeping the filters, charts and tables unchanged.
const rateShape = [
  0.3, 0.4, 0.35, 0.55, 0.62, 0.58, 0.72, 0.9, 1.05, 1.16, 1.1, 1.32, 1.55, 2.05, 2.48, 2.84, 3.1,
  2.9, 2.74, 2.61, 2.52, 2.68, 2.78, 2.96, 3.12, 3.52, 4.08, 3.65, 3.38, 3.2, 3.02, 2.86, 2.67,
  2.43, 2.17, 1.98,
];

const rangeSteps: Record<DeepDiveRange, { count: number; hours: number }> = {
  '1D': { count: 24, hours: 1 },
  '1W': { count: 21, hours: 8 },
  '1M': { count: 30, hours: 24 },
  '1Y': { count: rateShape.length, hours: 10 * 24 },
};

export const makeRangeLabels = (range: DeepDiveRange) => {
  const { count, hours } = rangeSteps[range];
  const end = Date.UTC(2026, 4, 16, 12);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end - (count - index - 1) * hours * 60 * 60 * 1000);
    return range === '1D'
      ? new Intl.DateTimeFormat('en', { hour: 'numeric', timeZone: 'UTC' }).format(date)
      : new Intl.DateTimeFormat('en', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }).format(date);
  });
};

const shapeAt = (index: number, count: number) =>
  rateShape[Math.round((index * (rateShape.length - 1)) / Math.max(1, count - 1))];

export const makeRates = (range: DeepDiveRange, kind: 'supply' | 'borrow'): ChartRow[] => {
  const labels = makeRangeLabels(range);
  const multiplier = kind === 'supply' ? 1.65 : 1.72;
  return labels.map((date, index) => {
    const base = shapeAt(index, labels.length) * multiplier;
    return {
      date,
      BNB: Number((base * 0.27 + 0.12).toFixed(2)),
      USDT: Number((base * 0.16 + 0.13).toFixed(2)),
      FDUSD: Number((base * 0.11 + 0.08).toFixed(2)),
      USDC: Number((base * 0.1 + 0.09).toFixed(2)),
      THE: Number((base * 0.08 + 0.05).toFixed(2)),
    };
  });
};

export const makeWeightedRates = (range: DeepDiveRange, kind: 'supply' | 'borrow'): ChartRow[] => {
  const labels = makeRangeLabels(range);
  return labels.map((date, index) => ({
    date,
    APY: Number(
      (2.25 + shapeAt(index, labels.length) * (kind === 'supply' ? 0.64 : 0.88)).toFixed(2),
    ),
  }));
};

export const makeStableDominance = (range: DeepDiveRange, kind: 'supply' | 'borrow'): ChartRow[] =>
  makeRangeLabels(range).map((date, index) => {
    const USDT = 58 + index * 0.25 + (kind === 'borrow' ? 2 : 0);
    const USDC = 19 - index * 0.13;
    const FDUSD = 12 - index * 0.06;
    const DAI = 7 - index * 0.03;
    return { date, USDT, USDC, FDUSD, DAI, Other: 100 - USDT - USDC - FDUSD - DAI };
  });

export const makeStableTotals = (range: DeepDiveRange): ChartRow[] =>
  makeRangeLabels(range).map((date, index) => ({
    date,
    supplied: 335 - index * 0.45 + Math.sin(index / 4) * 1.3,
    borrowed: 185 - index * 0.34 + Math.sin(index / 5) * 1.4,
  }));

const rawDrawdown = (drawdown: number) => 1 / (1 + Math.exp(-(drawdown - 17) / 8));
const drawdownStart = rawDrawdown(0);
const drawdownSpan = rawDrawdown(80) - drawdownStart;
export const drawdownCurve = Array.from({ length: 81 }, (_, drawdown) => ({
  date: `${drawdown}%`,
  drawdown,
  value: Math.round(((rawDrawdown(drawdown) - drawdownStart) / drawdownSpan) * 890),
}));

export const riskCollateral = [
  { name: 'BTCB', value: 74.4 },
  { name: 'USDT', value: 36.1 },
  { name: 'ETH', value: 28 },
  { name: 'wBNB', value: 10.5 },
  { name: 'CAKE', value: 5.8 },
  { name: 'XRP', value: 5 },
  { name: 'USDC', value: 3.5 },
  { name: 'Other', value: 4.7 },
];

export const riskDebtMix = [
  { name: 'BTCB', value: 43 },
  { name: 'BNB', value: 23 },
  { name: 'USDT', value: 16 },
  { name: 'ETH', value: 8 },
  { name: 'USDC', value: 4 },
  { name: 'CAKE', value: 3 },
  { name: 'XRP', value: 2 },
  { name: 'Other', value: 1 },
];

export const riskAssets = ['BNB', 'BTCB', 'ETH', 'USDT', 'USDC', 'CAKE', 'XRP'];

export const badDebtWallets: StatsTableData = {
  title: '',
  columns: [
    '#',
    'Wallet',
    'Bad Debt (USD)',
    'Total Debt (USD)',
    'Total Collateral (USD)',
    'Health Factor',
    'Debt Breakdown',
    'Collateral Breakdown',
  ],
  rows: [
    {
      id: 'bad-debt-wallet-1',
      cells: [
        '0',
        '0xc48214f2d5071dc6bc…',
        '$71.64',
        '$91.71',
        '$20.07',
        '0.22',
        'BTCB · $51.15, USDT · $40.56',
        'BTCB · $20.07',
      ],
    },
  ],
};

export const makeBadDebtHistory = (range: DeepDiveRange): StatsPoint[] =>
  makeRangeLabels(range).map((date, index, labels) => ({
    date,
    value: Number((280 + shapeAt(index, labels.length) * 16 + index * 0.9).toFixed(2)),
  }));

export interface PositionSample {
  address: string;
  supply: number;
  collateral: number;
  borrowPower: number;
  debt: number;
  healthFactor: number | null;
  deposits: { name: string; value: number }[];
  borrows: { name: string; value: number }[];
}

export const positionSamples: PositionSample[] = [
  {
    address: '0x71b4c48a528c54c423b0c78af1d38b49a0929c28',
    supply: 3470,
    collateral: 3470,
    borrowPower: 2770,
    debt: 0,
    healthFactor: null,
    deposits: [
      { name: 'BTCB', value: 44 },
      { name: 'BNB', value: 23 },
      { name: 'USDT', value: 16 },
      { name: 'ETH', value: 8 },
      { name: 'USDC', value: 5 },
      { name: 'Other', value: 4 },
    ],
    borrows: [],
  },
  {
    address: '0x204e970da3e932f6d767eef4326745268c13af71',
    supply: 8420,
    collateral: 7250,
    borrowPower: 5800,
    debt: 3120,
    healthFactor: 1.86,
    deposits: [
      { name: 'BNB', value: 51 },
      { name: 'BTCB', value: 27 },
      { name: 'USDT', value: 22 },
    ],
    borrows: [
      { name: 'USDT', value: 68 },
      { name: 'USDC', value: 32 },
    ],
  },
  {
    address: '0x8d90a0741e579f330f8ca39649e48b33e1173cd2',
    supply: 4620,
    collateral: 3980,
    borrowPower: 3180,
    debt: 2810,
    healthFactor: 1.13,
    deposits: [
      { name: 'ETH', value: 62 },
      { name: 'BNB', value: 38 },
    ],
    borrows: [{ name: 'USDT', value: 100 }],
  },
];

export type WalletRisk = 'No Risk' | 'At Risk' | 'Eligible' | 'Bad Debt';
export interface WalletRecord {
  address: string;
  market: string;
  suppliedAsset: string;
  borrowedAsset: string;
  risk: WalletRisk;
  supply: number;
  collateral: number;
  borrowPower: number;
  debt: number;
  healthFactor: number;
}

const walletAssets = ['BTCB', 'BNB', 'USDT', 'ETH', 'USDC', 'CAKE', 'XVS'];
const walletMarkets = ['Core', 'Stablecoins', 'DeFi'];
const walletRisk: WalletRisk[] = ['No Risk', 'At Risk', 'Eligible', 'Bad Debt'];

export const walletRecords: WalletRecord[] = Array.from({ length: 75 }, (_, index) => {
  const risk = walletRisk[index % 11 === 0 ? 3 : index % 7 === 0 ? 2 : index % 3 === 0 ? 1 : 0];
  const supply = Math.round(18_000_000 / (1 + index * 0.13));
  const debtRatio = risk === 'No Risk' ? 0.14 : risk === 'At Risk' ? 0.68 : 0.94;
  const debt = Math.round(supply * debtRatio);
  const address = `0x${((index + 1) * 0x9d51feab).toString(16).padStart(8, '0')}${(
    (index + 3) *
    0x41f0a9
  )
    .toString(16)
    .padStart(8, '0')}${'0'.repeat(24)}`;
  return {
    address,
    market: walletMarkets[index % walletMarkets.length],
    suppliedAsset: walletAssets[index % walletAssets.length],
    borrowedAsset: walletAssets[(index + 2) % walletAssets.length],
    risk,
    supply,
    collateral: Math.round(supply * 0.93),
    borrowPower: Math.round(supply * 0.76),
    debt,
    healthFactor:
      risk === 'Bad Debt' ? 0.53 : risk === 'Eligible' ? 0.93 : risk === 'At Risk' ? 1.18 : 2.64,
  };
});

export const walletFilterAssets = walletAssets;
export const walletFilterMarkets = walletMarkets;

export const collateralPairs = [
  { name: 'SolvBTC → BTCB', value: 57.8 },
  { name: 'BTCB → USDT', value: 49.9 },
  { name: 'xSolvBTC → BTCB', value: 41.3 },
  { name: 'asBNB → BNB', value: 38 },
  { name: 'BTCB → BNB', value: 32.2 },
  { name: 'SolvBTC → USDT', value: 26.1 },
  { name: 'BTCB → BTCB', value: 24.1 },
  { name: 'USDT → BNB', value: 22.1 },
  { name: 'BNB → USDT', value: 17.8 },
  { name: 'BTCB → USDC', value: 14.7 },
];

export const collateralDebtAssets = ['U', 'USDT', 'BTCB', 'BNB', 'USDC', 'ETH'];
export const collateralAssetOptions = [
  'BTCB',
  'SolvBTC',
  'asBNB',
  'xSolvBTC',
  'USDT',
  'BNB',
  'USDC',
  'ETH',
];

const matrixAssets = collateralAssetOptions.concat('Other');
const baseMatrixValues = matrixAssets.map((_, index) =>
  Array.from({ length: 11 }, (_, debtIndex) =>
    Number(
      Math.max(0, (68 - index * 7 - debtIndex * 2) * (debtIndex % 3 === 0 ? 0.46 : 0.17)).toFixed(
        1,
      ),
    ),
  ),
);
const btcbRowTotal = baseMatrixValues[0].reduce((sum, value) => sum + value, 0);
const rowAdjustedMatrix = baseMatrixValues.map((row, index) =>
  index === 0 ? row.map(value => (value * 108) / btcbRowTotal) : row,
);
const uColumnTotal = rowAdjustedMatrix.reduce((sum, row) => sum + row[7], 0);
const matrixValues = rowAdjustedMatrix.map(row =>
  row.map((value, index) => Number((index === 7 ? (value * 13) / uColumnTotal : value).toFixed(1))),
);
const matrixColumns = Array.from({ length: 11 }, (_, debtIndex) =>
  matrixValues.reduce((sum, row) => sum + row[debtIndex], 0),
);
const matrixCell = (value: number) => (value === 0 ? '—' : `$${Number(value.toFixed(1))}M`);
export const collateralMatrixDebtTotals: Record<string, number> = Object.fromEntries(
  collateralDebtAssets.map(asset => {
    const columns = [
      'BNB',
      'BTCB',
      'DAI',
      'ETH',
      'FDUSD',
      'Other',
      'SolvBTC',
      'U',
      'USDC',
      'USDT',
      'wBNB',
    ];
    return [asset, matrixColumns[columns.indexOf(asset)]];
  }),
);
export const collateralMatrixCollateralTotals: Record<string, number> = Object.fromEntries(
  matrixAssets.map((asset, index) => [
    asset,
    matrixValues[index].reduce((sum, value) => sum + value, 0),
  ]),
);

export const collateralMatrix: StatsTableData = {
  title: '',
  columns: [
    'Collateral',
    'BNB',
    'BTCB',
    'DAI',
    'ETH',
    'FDUSD',
    'Other',
    'SolvBTC',
    'U',
    'USDC',
    'USDT',
    'wBNB',
    'Total ↓',
  ],
  rows: [
    ...matrixAssets.map((asset, index) => ({
      id: `collateral-matrix-${asset}`,
      cells: [
        asset,
        ...matrixValues[index].map(matrixCell),
        matrixCell(matrixValues[index].reduce((sum, value) => sum + value, 0)),
      ],
    })),
    {
      id: 'collateral-matrix-total',
      cells: [
        'Total',
        ...matrixColumns.map(matrixCell),
        matrixCell(matrixColumns.reduce((sum, value) => sum + value, 0)),
      ],
    },
  ],
};

export const collateralSuppliers = [
  { name: 'wBETH', value: 5.2 },
  { name: 'USDT', value: 2.6 },
  { name: 'SolvBTC', value: 2.2 },
  { name: 'FDUSD', value: 0.75 },
  { name: 'USDC', value: 0.5 },
  { name: 'ETH', value: 0.37 },
  { name: 'BNB', value: 0.33 },
  { name: 'asBNB', value: 0.17 },
  { name: 'xSolvBTC', value: 0.11 },
  { name: 'BTCB', value: 0.11 },
];
