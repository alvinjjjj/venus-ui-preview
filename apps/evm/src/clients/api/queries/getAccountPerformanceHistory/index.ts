import type {
  GetAccountPerformanceHistoryInput,
  GetAccountPerformanceHistoryOutput,
} from './types';
export * from './types';
export const getAccountPerformanceHistory = async ({
  period,
}: GetAccountPerformanceHistoryInput): Promise<GetAccountPerformanceHistoryOutput> => {
  const days = period === 'month' ? 30 : 180;
  return {
    startOfDayNetWorthCents: 412000,
    performanceHistory: Array.from({ length: 31 }, (_, i) => ({
      blockNumber: 121232000 + i,
      blockTimestampMs: Date.now() - (((30 - i) * days) / 30) * 86400000,
      netWorthCents: 400000 + i * 420 + Math.sin(i) * 800,
    })),
  };
};
