import BigNumber from 'bignumber.js';

/** Illustrative account balances for non-tradable layout fixtures only.
 * Never construct transaction Assets or change live market/risk data here. */
export function getPreviewBalances(priceCents: BigNumber) {
  const price = priceCents.isFinite() && priceCents.gt(0) ? priceCents : new BigNumber(100);
  const tokens = (cents: number) =>
    new BigNumber(cents).div(price).decimalPlaces(18, BigNumber.ROUND_DOWN);
  return {
    walletTokens: tokens(200_000),
    supplyTokens: tokens(150_000),
    borrowTokens: tokens(25_000),
    availableTokens: tokens(218_000),
    healthFactor: '9.75',
  };
}

/** Fixed design fixtures, not price quotes or supported collateral parameters. */
export function getPreviewCollateral(symbol: string) {
  const prices: Record<string, number> = {
    QQQB: 50_000,
    SPYB: 60_000,
    SPCXB: 20_000,
    TSLAB: 25_000,
    NVDAB: 12_000,
    SKHYB: 14_000,
  };
  return {
    ...getPreviewBalances(new BigNumber(prices[symbol] ?? 10_000)),
    maxLtvPercentage: 75,
    liquidationThresholdPercentage: 80,
    liquidationPenaltyPercentage: 10,
  };
}
