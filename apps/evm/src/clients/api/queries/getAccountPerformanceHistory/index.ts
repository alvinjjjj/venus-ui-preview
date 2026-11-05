import { isEmptyDemoAddress } from 'demo/state';
import type {
  GetAccountPerformanceHistoryInput,
  GetAccountPerformanceHistoryOutput,
} from './types';
export * from './types';
export const getAccountPerformanceHistory = async ({
  period,
  accountAddress,
}: GetAccountPerformanceHistoryInput): Promise<GetAccountPerformanceHistoryOutput> => {
  if (isEmptyDemoAddress(accountAddress))
    return { startOfDayNetWorthCents: 0, performanceHistory: [] };
  const days = period === 'month' ? 30 : period === 'halfyear' ? 180 : 365;
  return {
    startOfDayNetWorthCents: 412000,
    performanceHistory: Array.from({ length: 31 }, (_, i) => ({
      blockNumber: 121232000 + i,
      blockTimestampMs: Date.now() - (((30 - i) * days) / 30) * 86400000,
      netWorthCents: 400000 + i * 420 + Math.sin(i) * 800,
    })),
  };
};
