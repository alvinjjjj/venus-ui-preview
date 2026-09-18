import BigNumber from 'bignumber.js';
import { demoAddresses } from 'demo/state';
import type { Address, PublicClient } from 'viem';

export interface GetXvsVaultUserInfoInput {
  publicClient: PublicClient;
  xvsVaultContractAddress: Address;
  rewardTokenAddress: Address;
  poolIndex: number;
  accountAddress: Address;
}

export interface GetXvsVaultUserInfoOutput {
  stakedAmountMantissa: BigNumber;
  pendingWithdrawalsTotalAmountMantissa: BigNumber;
  rewardDebtAmountMantissa: BigNumber;
}

export const getXvsVaultUserInfo = async (
  _input: GetXvsVaultUserInfoInput,
): Promise<GetXvsVaultUserInfoOutput> => ({
  stakedAmountMantissa: new BigNumber(
    _input.accountAddress === demoAddresses.prime ? 5000 : 250,
  ).shiftedBy(18),
  pendingWithdrawalsTotalAmountMantissa: new BigNumber(0),
  rewardDebtAmountMantissa: new BigNumber(0),
});
