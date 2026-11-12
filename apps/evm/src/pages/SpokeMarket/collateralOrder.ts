import BigNumber from 'bignumber.js';
import type { SpokeMarket } from 'clients/api';

// Account-position data must come from the connected account, never pool totals.
export type CollateralRow = SpokeMarket & { userSupplyTokens?: BigNumber };
export const getUserSupplyCents = (row: CollateralRow) =>
  (row.userSupplyTokens ?? new BigNumber(0)).times(row.tokenPriceCents);

export const sortCollateralRows = (rows: CollateralRow[], connected: boolean) => {
  if (!connected) return rows;
  return [...rows].sort((a, b) => {
    const aSupplied = a.userSupplyTokens?.gt(0) ?? false;
    const bSupplied = b.userSupplyTokens?.gt(0) ?? false;
    if (aSupplied !== bSupplied) return aSupplied ? -1 : 1;
    // Stable sort preserves API order for blank amounts and equal USD values.
    return aSupplied ? getUserSupplyCents(b).comparedTo(getUserSupplyCents(a)) ?? 0 : 0;
  });
};
