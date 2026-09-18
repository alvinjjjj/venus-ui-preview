import type { Address, PublicClient } from 'viem';

export interface GetVoteDelegateAddressInput {
  publicClient: PublicClient;
  xvsVaultAddress: Address;
  accountAddress: Address;
}

export type GetVoteDelegateAddressOutput = {
  delegateAddress: Address | undefined;
};

export const getVoteDelegateAddress = async ({
  accountAddress,
}: GetVoteDelegateAddressInput): Promise<GetVoteDelegateAddressOutput> => ({
  delegateAddress: accountAddress,
});
