import BigNumber from 'bignumber.js';
import type { Pool } from 'types';
import { addUserBorrowLimitShares, calculateUserPoolValues } from 'utilities';

// Extend the existing simulated account only for the New Dashboard preview.
const previewSupplyBalances: Record<string, string> = {
  'PT-clisBNB-25JUN2026': '0.001263',
  BNB: '0.001001',
  BETH: '0',
  WBNB: '0',
};
const previewBorrowBalances: Record<string, string> = {
  USDT: '750',
};

export const getNewPreviewPool = (pool: Pool): Pool => {
  const assets = pool.assets.map(asset => {
    const symbol = asset.vToken.underlyingToken.symbol;
    const previewSupplyBalance = previewSupplyBalances[symbol];
    const previewBorrowBalance = previewBorrowBalances[symbol];
    const userSupplyBalanceTokens = previewSupplyBalance
      ? new BigNumber(previewSupplyBalance)
      : asset.userSupplyBalanceTokens;
    const userBorrowBalanceTokens = previewBorrowBalance
      ? new BigNumber(previewBorrowBalance)
      : asset.userBorrowBalanceTokens;

    return {
      ...asset,
      userSupplyBalanceTokens,
      userSupplyBalanceCents: userSupplyBalanceTokens.multipliedBy(asset.tokenPriceCents),
      userBorrowBalanceTokens,
      userBorrowBalanceCents: userBorrowBalanceTokens.multipliedBy(asset.tokenPriceCents),
      isCollateralOfUser: previewSupplyBalance
        ? symbol !== 'PT-clisBNB-25JUN2026'
        : asset.isCollateralOfUser,
    };
  });

  const userPoolValues = calculateUserPoolValues({
    assets,
    userVaiBorrowBalanceCents: pool.vai?.userBorrowBalanceCents,
    vaiBorrowAprPercentage: pool.vai?.borrowAprPercentage,
  });

  return {
    ...pool,
    ...userPoolValues,
    ...addUserBorrowLimitShares({
      assets,
      userBorrowLimitCents: userPoolValues.userBorrowLimitCents,
    }),
  };
};
