import type BigNumber from 'bignumber.js';
import type { VoterAccount } from 'types';

export interface GetVoterAccountsInput {
  totalStakedXvs: BigNumber;
  limit?: number;
  page?: number;
}

export interface GetVoterAccountsOutput {
  voterAccounts: VoterAccount[];
  limit: number;
  offset: number;
  total: number;
}

export const getVoterAccounts = async ({
  page = 0,
  limit = 16,
}: GetVoterAccountsInput): Promise<GetVoterAccountsOutput> => {
  const { default: mockData } = await import('__mocks__/models/voterAccounts');
  return {
    ...mockData,
    voterAccounts: mockData.voterAccounts.slice(page * limit, (page + 1) * limit),
    limit,
    offset: page * limit,
    total: mockData.voterAccounts.length,
  };
};
