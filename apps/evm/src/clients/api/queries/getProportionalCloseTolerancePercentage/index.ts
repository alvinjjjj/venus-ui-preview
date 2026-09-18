import type { Address, PublicClient } from 'viem';

export interface GetProportionalCloseTolerancePercentageInput {
  publicClient: PublicClient;
  relativePositionManagerAddress: Address;
}

export type GetProportionalCloseTolerancePercentageOutput = {
  proportionalCloseTolerancePercentage: number;
};

export const getProportionalCloseTolerancePercentage = async (
  _input: GetProportionalCloseTolerancePercentageInput,
): Promise<GetProportionalCloseTolerancePercentageOutput> => ({
  proportionalCloseTolerancePercentage: 1,
});
