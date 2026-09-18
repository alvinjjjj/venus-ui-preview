import type { GetRawTradePositionsInput, GetRawTradePositionsOutput } from './types';
export * from './types';
export const getRawTradePositions = async (
  _input: GetRawTradePositionsInput,
): Promise<GetRawTradePositionsOutput> => ({ positions: [] });
