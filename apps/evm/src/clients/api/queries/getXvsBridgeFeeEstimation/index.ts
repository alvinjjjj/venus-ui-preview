import BigNumber from 'bignumber.js';
import type { ChainId } from 'types';
import type { Address, PublicClient } from 'viem';

export interface GetXvsBridgeEstimationInput {
  accountAddress: Address;
  destinationChain: ChainId;
  amountMantissa: bigint;
  publicClient: PublicClient;
  tokenBridgeContractAddress: Address;
}

export interface GetXvsBridgeEstimationOutput {
  estimationFeeMantissa: BigNumber;
}

export const getXvsBridgeFeeEstimation = async (
  _input: GetXvsBridgeEstimationInput,
): Promise<GetXvsBridgeEstimationOutput> => ({
  estimationFeeMantissa: new BigNumber('1000000000000000'),
});
