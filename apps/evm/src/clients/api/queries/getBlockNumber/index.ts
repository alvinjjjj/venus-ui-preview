import type { PublicClient } from 'viem';

export interface GetBlockNumberInput {
  publicClient: PublicClient;
}

export interface GetBlockNumberOutput {
  blockNumber: number;
}

export const getBlockNumber = async (
  _input: GetBlockNumberInput,
): Promise<GetBlockNumberOutput> => ({ blockNumber: 121232897 });
