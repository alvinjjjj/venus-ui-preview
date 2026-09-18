import type { Address, PublicClient } from 'viem';

import BigNumber from 'bignumber.js';
import type { Token, VToken } from 'types';

export interface GetAllowanceInput {
  publicClient: PublicClient;
  token: Token | VToken;
  accountAddress: Address;
  spenderAddress: Address;
}

export type GetAllowanceOutput = {
  allowanceMantissa: BigNumber;
};

export const getAllowance = async ({ token }: GetAllowanceInput): Promise<GetAllowanceOutput> => ({
  allowanceMantissa: new BigNumber(1000000).shiftedBy(token.decimals),
});
