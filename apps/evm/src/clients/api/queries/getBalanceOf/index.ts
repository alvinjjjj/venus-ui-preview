import BigNumber from 'bignumber.js';
import type { Address, PublicClient } from 'viem';

import type { Token } from 'types';

export interface GetBalanceOfInput {
  accountAddress: Address;
  token: Token;
  publicClient: PublicClient;
}

export type GetBalanceOfOutput = {
  balanceMantissa: BigNumber;
};

export const getBalanceOf = async ({ token }: GetBalanceOfInput): Promise<GetBalanceOfOutput> => {
  return { balanceMantissa: new BigNumber(2000).shiftedBy(token.decimals) };
};
