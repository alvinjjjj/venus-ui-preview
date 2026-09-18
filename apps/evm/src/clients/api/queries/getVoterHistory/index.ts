import type { VoterHistory } from 'types';

export interface GetVoterHistoryInput {
  page?: number;
  address: string;
}

export interface GetVoterHistoryOutput {
  voterHistory: VoterHistory[];
  limit: number;
  total: number;
}

export const getVoterHistory = async ({
  page = 0,
}: GetVoterHistoryInput): Promise<GetVoterHistoryOutput> => {
  const { default: mockData } = await import('__mocks__/models/voterHistory');
  return {
    ...mockData,
    voterHistory: mockData.voterHistory.slice(page * 6, (page + 1) * 6),
    total: mockData.voterHistory.length,
  };
};
