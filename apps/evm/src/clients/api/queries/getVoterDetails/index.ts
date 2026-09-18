import type { Voter } from 'types';

export interface GetVoterDetailsInput {
  address: string;
}

export type GetVoterDetailsOutput = Voter;

export const getVoterDetails = async (
  _input: GetVoterDetailsInput,
): Promise<GetVoterDetailsOutput> => {
  const { default: mockData } = await import('__mocks__/models/voterDetails');
  return mockData;
};
