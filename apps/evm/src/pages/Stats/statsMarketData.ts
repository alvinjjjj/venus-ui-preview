import type { StatsPoint } from './statsPreviewData';

/** Illustrative Market adapter. The risk API can replace these records and histories. */
export interface StatsMarketAsset {
  symbol: string;
  supplyMillions: number;
  borrowMillions: number;
  supplyApy: number;
  borrowApy: number;
  utilization: number;
}

export interface StatsMarketHistoryPoint {
  date: string;
  supply: number;
  borrow: number;
  liquidity: number;
}

export type StatsMarketRange = '1D' | '1W' | '1M' | '1Y';
export type StatsMarketSparklineShape = 'rate' | 'debt' | 'capacity' | 'concentration';

export const statsMarketAssets: StatsMarketAsset[] = [
  {
    symbol: 'BTCB',
    supplyMillions: 1690,
    borrowMillions: 482,
    supplyApy: 8.86,
    borrowApy: 8.86,
    utilization: 28.5,
  },
  {
    symbol: 'asBNB',
    supplyMillions: 872,
    borrowMillions: 196,
    supplyApy: 5.42,
    borrowApy: 7.91,
    utilization: 22.5,
  },
  {
    symbol: 'BNB',
    supplyMillions: 609,
    borrowMillions: 144,
    supplyApy: 2.14,
    borrowApy: 5.78,
    utilization: 23.6,
  },
  {
    symbol: 'BCH',
    supplyMillions: 410,
    borrowMillions: 137,
    supplyApy: 3.24,
    borrowApy: 6.42,
    utilization: 33.4,
  },
  {
    symbol: 'BETH',
    supplyMillions: 180,
    borrowMillions: 60,
    supplyApy: 2.91,
    borrowApy: 5.31,
    utilization: 33.3,
  },
  {
    symbol: 'LTC',
    supplyMillions: 55,
    borrowMillions: 14,
    supplyApy: 1.84,
    borrowApy: 4.27,
    utilization: 25.5,
  },
  {
    symbol: 'ETH',
    supplyMillions: 220,
    borrowMillions: 30,
    supplyApy: 0.89,
    borrowApy: 3.81,
    utilization: 13.6,
  },
  {
    symbol: 'CAKE',
    supplyMillions: 120,
    borrowMillions: 24,
    supplyApy: 2.16,
    borrowApy: 5.08,
    utilization: 20,
  },
  {
    symbol: 'USDT',
    supplyMillions: 406,
    borrowMillions: 168,
    supplyApy: 3.76,
    borrowApy: 7.12,
    utilization: 41.4,
  },
  {
    symbol: 'USDC',
    supplyMillions: 115,
    borrowMillions: 18,
    supplyApy: 2.08,
    borrowApy: 5.48,
    utilization: 15.3,
  },
];

const profile = [1.04, 1.19, 1.13, 1.3, 1.25, 1.38, 0.67, 0.56, 0.75, 0.69, 0.97, 1.15, 1.02, 1.43];
const interpolateProfile = (index: number, length: number) => {
  const position = (index / (length - 1)) * (profile.length - 1);
  const segment = Math.min(Math.floor(position), profile.length - 2);
  const fraction = position - segment;
  return profile[segment] * (1 - fraction) + profile[segment + 1] * fraction;
};

const historyIntervals: Record<StatsMarketRange, { count: number; milliseconds: number }> = {
  '1D': { count: 25, milliseconds: 60 * 60 * 1000 },
  '1W': { count: 8, milliseconds: 24 * 60 * 60 * 1000 },
  '1M': { count: 31, milliseconds: 24 * 60 * 60 * 1000 },
  '1Y': { count: 52, milliseconds: 7 * 24 * 60 * 60 * 1000 },
};

export const makeMarketHistory = (
  asset: StatsMarketAsset,
  range: StatsMarketRange = '1Y',
): StatsMarketHistoryPoint[] => {
  const { count, milliseconds } = historyIntervals[range];
  const endTime = Date.UTC(2026, 3, 27);
  return Array.from({ length: count }, (_, index) => {
    const instant = new Date(endTime - (count - 1 - index) * milliseconds);
    const date =
      range === '1D'
        ? instant.toLocaleString('en', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            timeZone: 'UTC',
          })
        : instant.toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
            ...(range === '1Y' ? { year: 'numeric' } : {}),
            timeZone: 'UTC',
          });
    const amplitude = { '1D': 0.04, '1W': 0.12, '1M': 0.3, '1Y': 1 }[range];
    const envelope = 1 + (interpolateProfile(index, count) - 1) * amplitude;
    const movement = 1 + amplitude * (0.035 * Math.sin(index * 1.7) + 0.02 * Math.sin(index * 3.1));
    const supply = asset.supplyMillions * envelope * movement;
    const borrow =
      asset.borrowMillions * envelope * (1 + amplitude * 0.07 * Math.sin(index * 0.31));
    return {
      date,
      supply: Math.round(supply),
      borrow: Math.round(borrow),
      liquidity: Math.round(Math.max(0, supply - borrow)),
    };
  });
};

// Separate illustrative trajectories mirror the Figma card families. The risk API
// will supply each metric's actual history when the Market endpoint is ready.
const sparklineProfiles: Record<StatsMarketSparklineShape, number[]> = {
  rate: [0.99, 1.03, 0.98, 1.02, 1.01, 1.04, 0.82, 0.77, 0.85, 0.79, 0.91, 0.95, 0.86, 0.98, 1.08],
  debt: [0.99, 1.04, 1.0, 1.05, 1.02, 1.08, 0.78, 0.81, 0.75, 0.88, 0.83, 0.96, 0.91, 1.03, 1.1],
  capacity: [
    0.96, 1.0, 0.98, 0.99, 1.01, 0.98, 0.94, 0.88, 0.92, 0.89, 0.97, 0.95, 1.0, 1.02, 1.06,
  ],
  concentration: [
    0.97, 1.02, 1.0, 0.99, 1.03, 1.01, 0.9, 0.86, 0.89, 0.93, 0.97, 0.94, 1.01, 1.03, 1.08,
  ],
};

export const makeMarketSparkline = (
  asset: StatsMarketAsset,
  value: number,
  shape: StatsMarketSparklineShape,
  range: StatsMarketRange,
): StatsPoint[] => {
  const history = makeMarketHistory(asset, range);
  const profile = sparklineProfiles[shape];
  const count = Math.min(profile.length, history.length);
  const amplitude = { '1D': 0.1, '1W': 0.25, '1M': 0.6, '1Y': 1 }[range];
  return Array.from({ length: count }, (_, index) => {
    const position = (index / (count - 1)) * (profile.length - 1);
    const segment = Math.min(Math.floor(position), profile.length - 2);
    const fraction = position - segment;
    const multiplier = profile[segment] * (1 - fraction) + profile[segment + 1] * fraction;
    return {
      date: history[Math.round((index / (count - 1)) * (history.length - 1))].date,
      value: Number((value * (1 + (multiplier - 1) * amplitude)).toFixed(4)),
    };
  });
};

export const formatMarketUsd = (millions: number) =>
  millions === 0
    ? '$0'
    : millions >= 1000
      ? `$${(millions / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}B`
      : `$${Math.round(millions)}M`;
