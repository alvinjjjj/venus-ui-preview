import BigNumber from 'bignumber.js';
import type { LiquidityHub } from 'types';
import { isFundedDemoAddress } from './state';

/** UI-only demo funds. Never override balances for a real wallet. */
export const withDemoLiquidityHubBalance = (
  liquidityHub: LiquidityHub,
  accountAddress?: string,
): LiquidityHub => {
  if (!isFundedDemoAddress(accountAddress) || liquidityHub.vhToken.underlyingToken.symbol !== 'USDT') {
    return liquidityHub;
  }

  const walletBalanceTokens = new BigNumber(2000);
  return {
    ...liquidityHub,
    userWalletBalanceTokens: walletBalanceTokens,
    userWalletBalanceCents: walletBalanceTokens.multipliedBy(liquidityHub.tokenPriceCents),
    userSupplyCapTokens: walletBalanceTokens,
  };
};
