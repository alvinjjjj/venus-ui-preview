import type { QueryObserverOptions } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import type { GetHypotheticalPrimeApysOutput } from 'clients/api/queries/getHypotheticalPrimeApys';
import type FunctionKey from 'constants/functionKey';
import type { VToken } from 'types';
import type { Address } from 'viem';

interface UseGetPrimeEstimationInput {
  accountAddress?: Address;
  suppliedAmountMantissa: BigNumber;
  borrowedAmountMantissa: BigNumber;
  stakedAmountXvsMantissa: BigNumber;
  vToken: VToken | undefined;
}

interface UseGetPrimeEstimationOutput {
  dailyTokensDistributedAmount: BigNumber | undefined;
  borrowedTokens: BigNumber | undefined;
  borrowApyPercentage: BigNumber | undefined;
  borrowCapTokens: BigNumber | undefined;
  borrowCapCents: BigNumber | undefined;
  suppliedTokens: BigNumber | undefined;
  supplyApyPercentage: BigNumber | undefined;
  supplyCapTokens: BigNumber | undefined;
  supplyCapCents: BigNumber | undefined;
  userDailyPrimeRewards: BigNumber | undefined;
}

export type UseGetPrimeEstimationQueryKey = [
  FunctionKey.GET_PRIME_ESTIMATION,
  UseGetPrimeEstimationInput,
];

type Options = QueryObserverOptions<
  GetHypotheticalPrimeApysOutput,
  Error,
  GetHypotheticalPrimeApysOutput,
  GetHypotheticalPrimeApysOutput,
  UseGetPrimeEstimationQueryKey
>;

export const useGetPrimeEstimation = (
  { suppliedAmountMantissa, borrowedAmountMantissa, vToken }: UseGetPrimeEstimationInput,
  _options?: Partial<Options>,
): { data: UseGetPrimeEstimationOutput } => {
  const decimals = vToken?.underlyingToken.decimals ?? 18;
  const suppliedTokens = suppliedAmountMantissa.shiftedBy(-decimals);
  const borrowedTokens = borrowedAmountMantissa.shiftedBy(-decimals);
  return {
    data: {
      suppliedTokens,
      borrowedTokens,
      dailyTokensDistributedAmount: new BigNumber(500),
      userDailyPrimeRewards: suppliedTokens.multipliedBy(0.01).dividedBy(365),
      supplyApyPercentage: new BigNumber(3.8),
      borrowApyPercentage: new BigNumber(4.2),
      supplyCapTokens: new BigNumber(1000000),
      supplyCapCents: new BigNumber(100000000),
      borrowCapTokens: new BigNumber(800000),
      borrowCapCents: new BigNumber(80000000),
    },
  };
};
