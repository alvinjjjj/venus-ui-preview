import BigNumber from 'bignumber.js';
import type { Address, PublicClient } from 'viem';

export interface GetProposalMinQuorumVotesInput {
  publicClient: PublicClient;
  governorBravoDelegateContractAddress: Address;
}

export interface GetProposalMinQuorumVotesOutput {
  proposalMinQuorumVotesMantissa: BigNumber;
}

export const getProposalMinQuorumVotes = async (
  _input: GetProposalMinQuorumVotesInput,
): Promise<GetProposalMinQuorumVotesOutput> => ({
  proposalMinQuorumVotesMantissa: new BigNumber(300000).shiftedBy(18),
});
