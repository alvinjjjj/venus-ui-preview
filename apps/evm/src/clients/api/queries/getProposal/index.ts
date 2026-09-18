import { proposals as demoProposals } from '__mocks__/models/proposals';
import type BigNumber from 'bignumber.js';
import type { ChainId, Proposal } from 'types';

export interface GetProposalInput {
  proposalId: number;
  chainId: ChainId;
  currentBlockNumber: number;
  proposalMinQuorumVotesMantissa: BigNumber;
  accountAddress?: string;
}

export type GetProposalOutput = {
  proposal?: Proposal;
};

export const getProposal = async ({
  proposalId,
}: GetProposalInput): Promise<GetProposalOutput> => ({
  proposal: demoProposals.find(proposal => proposal.proposalId === proposalId),
});
