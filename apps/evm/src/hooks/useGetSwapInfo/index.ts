import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import type { UseGetSwapInfoInput, UseGetSwapInfoOptions, UseGetSwapInfoOutput } from './types';
export * from './types';

// Design-preview quote: deterministic 1:1 token amounts, not an executable market quote.
const useGetSwapInfo = (
  input: UseGetSwapInfoInput,
  options?: UseGetSwapInfoOptions,
): UseGetSwapInfoOutput =>
  useMemo<UseGetSwapInfoOutput>(() => {
    const amount = new BigNumber(
      (input.direction === 'exactAmountIn'
        ? input.fromTokenAmountTokens
        : input.toTokenAmountTokens) || 0,
    );
    if (options?.enabled === false || !amount.isFinite() || !amount.isGreaterThan(0)) {
      return { swap: undefined, error: undefined, isLoading: false };
    }
    const base = {
      fromToken: input.fromToken,
      toToken: input.toToken,
      exchangeRate: new BigNumber(1),
      priceImpactPercentage: 0.1,
      routePath: [input.fromToken.address, input.toToken.address],
    };
    const fromAmount = amount.shiftedBy(input.fromToken.decimals);
    const toAmount = amount.shiftedBy(input.toToken.decimals);
    if (input.direction === 'exactAmountIn') {
      return {
        error: undefined,
        isLoading: false,
        swap: {
          ...base,
          direction: 'exactAmountIn',
          fromTokenAmountSoldMantissa: fromAmount,
          expectedToTokenAmountReceivedMantissa: toAmount,
          minimumToTokenAmountReceivedMantissa: toAmount.times(0.995),
        },
      };
    }
    return {
      error: undefined,
      isLoading: false,
      swap: {
        ...base,
        direction: 'exactAmountOut',
        expectedFromTokenAmountSoldMantissa: fromAmount,
        maximumFromTokenAmountSoldMantissa: fromAmount.times(1.005),
        toTokenAmountReceivedMantissa: toAmount,
      },
    };
  }, [
    input.direction,
    input.fromToken,
    input.toToken,
    input.fromTokenAmountTokens,
    input.toTokenAmountTokens,
    options?.enabled,
  ]);
export default useGetSwapInfo;
