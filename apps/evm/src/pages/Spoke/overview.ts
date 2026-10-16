import { ChainId, tokens } from '@venusprotocol/chains';
import qqqbIcon from 'assets/img/spoke/qqqb.png';
import spybIcon from 'assets/img/spoke/spyb.png';
import BigNumber from 'bignumber.js';
import type { SpokeMarket, SpokePool } from 'clients/api';
import type { Token } from 'types';

const BSTOCK_POOL_ADDRESS = '0x11960c84d6c4f2a978a12372721c3a6a88c78f4c';
const QA_POOL_ADDRESS = '0xb084b5af4a040933790cdc1b2d15ac7bb3514e50';
// Requested design-preview values; keep them separate from live market data.
const BSTOCK_LOAN_PREVIEWS = [
  { symbol: 'USDC', borrowApyPercentage: 3.42, borrowedTokens: new BigNumber('12500.25') },
  { symbol: 'USDT', borrowApyPercentage: 4.34, borrowedTokens: new BigNumber('8450.75') },
  { symbol: 'U', borrowApyPercentage: 3.42, borrowedTokens: new BigNumber('6250.50') },
];

export interface SpokeLoanAsset {
  token: Token;
  // A listed asset can precede its testnet market. Keep its live metrics and link absent.
  market?: SpokeMarket;
  preview?: {
    borrowApyPercentage: number;
    borrowedTokens: BigNumber;
  };
}

export interface SpokeCollateralAsset {
  symbol: string;
  iconSrc: string;
  maxLtvPercentage?: number;
}

export interface SpokeOverviewPool {
  address: string;
  name: string;
  description: string;
  loanAssets: SpokeLoanAsset[];
  collateralAssets: SpokeCollateralAsset[];
}

// Presentation metadata only: do not assign new symbols to existing market addresses.
const bStockCollaterals: SpokeCollateralAsset[] = [
  { symbol: 'QQQB', iconSrc: qqqbIcon },
  { symbol: 'SPYB', iconSrc: spybIcon },
];

export const getSpokeOverview = (pools: SpokePool[]) => {
  const visiblePools = pools
    .filter(pool => pool.address.toLowerCase() !== QA_POOL_ADDRESS)
    .map<SpokeOverviewPool>(pool => {
      const isBStockPool = pool.address.toLowerCase() === BSTOCK_POOL_ADDRESS;
      const loanAssets = isBStockPool
        ? BSTOCK_LOAN_PREVIEWS.flatMap(({ symbol, ...preview }) => {
            const market = pool.loanMarkets.find(market => market.token.symbol === symbol);
            const token =
              market?.token ?? tokens[ChainId.BSC_TESTNET].find(token => token.symbol === symbol);
            return token ? [{ token, market, preview }] : [];
          })
        : pool.loanMarkets.map(market => ({ token: market.token, market }));

      return {
        address: pool.address,
        name: isBStockPool ? 'bStock index' : pool.name,
        description: isBStockPool ? 'Borrow against bStock index.' : pool.description,
        loanAssets,
        collateralAssets: isBStockPool
          ? bStockCollaterals
          : pool.collateralMarkets.map(({ token, collateralFactorPercentage }) => ({
              symbol: token.symbol,
              iconSrc: token.iconSrc,
              maxLtvPercentage: collateralFactorPercentage,
            })),
      };
    });

  const markets = visiblePools.flatMap(pool =>
    pool.loanAssets.flatMap(({ market }) => (market ? [market] : [])),
  );

  return {
    pools: visiblePools,
    totalBorrowCents: markets.reduce(
      (sum, market) => sum.plus(market.borrowCents),
      new BigNumber(0),
    ),
    availableLiquidityCents: markets.reduce(
      (sum, market) => sum.plus(market.liquidityCents),
      new BigNumber(0),
    ),
  };
};
