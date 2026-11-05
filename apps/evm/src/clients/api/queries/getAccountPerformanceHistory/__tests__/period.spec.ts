import { NULL_ADDRESS } from 'constants/address';
import { ChainId } from 'types';
import { getAccountPerformanceHistory } from '..';

it.each([
  ['month', 30],
  ['halfyear', 180],
  ['year', 365],
] as const)('uses the selected %s date range in the preview history', async (period, days) => {
  const now = new Date('2026-11-04T03:30:00Z').getTime();
  const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
  try {
    const { performanceHistory } = await getAccountPerformanceHistory({
      period,
      accountAddress: NULL_ADDRESS,
      chainId: ChainId.BSC_MAINNET,
    });
    expect(performanceHistory).toHaveLength(31);
    expect(performanceHistory[0].blockTimestampMs).toBe(now - days * 86_400_000);
    expect(performanceHistory[30].blockTimestampMs).toBe(now);
  } finally {
    clock.mockRestore();
  }
});
