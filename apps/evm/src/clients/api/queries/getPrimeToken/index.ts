import { demoAddresses } from 'demo/state';
import type { Address, PublicClient } from 'viem';

import { primeAbi } from 'libs/contracts';

export interface GetPrimeTokenInput {
  accountAddress: Address;
  primeContractAddress: Address;
  publicClient: PublicClient;
}

export type GetPrimeTokenOutput = {
  exists: boolean;
  isIrrevocable: boolean;
};

export const getPrimeToken = async ({
  publicClient,
  primeContractAddress,
  accountAddress,
}: GetPrimeTokenInput): Promise<GetPrimeTokenOutput> => {
  if (
    Object.values(demoAddresses).some(
      address => address.toLowerCase() === accountAddress.toLowerCase(),
    )
  ) {
    return { exists: accountAddress === demoAddresses.prime, isIrrevocable: false };
  }

  const [exists, isIrrevocable] = await publicClient.readContract({
    address: primeContractAddress,
    abi: primeAbi,
    functionName: 'tokens',
    args: [accountAddress],
  });

  return {
    exists,
    isIrrevocable,
  };
};
