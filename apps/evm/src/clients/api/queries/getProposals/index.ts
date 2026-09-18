import { proposals as demoProposals } from '__mocks__/models/proposals';
import type BigNumber from 'bignumber.js';
import type { ChainId, Proposal, ProposalState } from 'types';

export interface GetProposalsInput {
  chainId: ChainId;
  currentBlockNumber: number;
  proposalMinQuorumVotesMantissa: BigNumber;
  accountAddress?: string;
  proposalState?: ProposalState;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetProposalsOutput {
  proposals: Proposal[];
  total: number;
}

export const getProposals = async ({
  page = 0,
  limit = 10,
  search,
  proposalState,
}: GetProposalsInput): Promise<GetProposalsOutput> => {
  const filtered = demoProposals.filter(
    proposal =>
      (proposalState === undefined || proposal.state === proposalState) &&
      (!search || proposal.description.title.toLowerCase().includes(search.toLowerCase())),
  );
  return { proposals: filtered.slice(page * limit, (page + 1) * limit), total: filtered.length };
};
