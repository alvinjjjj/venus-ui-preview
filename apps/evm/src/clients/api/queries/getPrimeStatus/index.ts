import BigNumber from 'bignumber.js';
import type { Address, PublicClient } from 'viem';

export interface GetPrimeStatusInput {
  accountAddress?: Address;
  primeContractAddress: Address;
  publicClient: PublicClient;
}

export interface GetPrimeStatusOutput {
  claimWaitingPeriodSeconds: number;
  claimedPrimeTokenCount: number;
  primeTokenLimit: number;
  primeMarkets: Address[];
  primeMaximumStakedXvsMantissa: BigNumber;
  primeMinimumStakedXvsMantissa: BigNumber;
  xvsVault: Address;
  xvsVaultPoolId: number;
  rewardTokenAddress: Address;
  userClaimTimeRemainingSeconds: number;
}

export const getPrimeStatus = async ({
  primeContractAddress,
}: GetPrimeStatusInput): Promise<GetPrimeStatusOutput> => ({
  claimWaitingPeriodSeconds: 7776000,
  claimedPrimeTokenCount: 450,
  primeTokenLimit: 500,
  primeMarkets: [],
  primeMaximumStakedXvsMantissa: new BigNumber(10000).shiftedBy(18),
  primeMinimumStakedXvsMantissa: new BigNumber(1000).shiftedBy(18),
  xvsVault: primeContractAddress,
  xvsVaultPoolId: 0,
  rewardTokenAddress: primeContractAddress,
  userClaimTimeRemainingSeconds: 0,
});
