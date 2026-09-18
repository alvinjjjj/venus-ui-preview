import type { GetVotersInput, GetVotersOutput } from './types';

export * from './types';

export const getVoters = async (_input: GetVotersInput): Promise<GetVotersOutput> => {
  const { default: mockData } = await import('__mocks__/models/voters');
  return mockData;
};
