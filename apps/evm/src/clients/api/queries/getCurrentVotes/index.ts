import BigNumber from 'bignumber.js';

import type { Address, PublicClient } from 'viem';

export interface GetCurrentVotesInput {
  publicClient: PublicClient;
  xvsVaultContractAddress: Address;
  accountAddress: Address;
}

export type GetCurrentVotesOutput = {
  votesMantissa: BigNumber;
};

export const getCurrentVotes = async (
  _input: GetCurrentVotesInput,
): Promise<GetCurrentVotesOutput> => ({ votesMantissa: new BigNumber(350000).shiftedBy(18) });
