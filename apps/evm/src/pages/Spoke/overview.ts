import { ChainId, tokens } from '@venusprotocol/chains';
import nvdabIcon from 'assets/img/spoke/nvdab.png';
import tslabIcon from 'assets/img/spoke/tslab.png';
import spcxbIcon from 'assets/img/spoke/spcxb.png';
import skhybIcon from 'assets/img/spoke/skhyb.png';
import crclbIcon from 'assets/img/spoke/crclb.png';
import googlbIcon from 'assets/img/spoke/googlb.png';
import aaplbIcon from 'assets/img/spoke/aaplb.png';
import mstrbIcon from 'assets/img/spoke/mstrb.png';
import sndkbIcon from 'assets/img/spoke/sndkb.png';
import metabIcon from 'assets/img/spoke/metab.png';
import msftbIcon from 'assets/img/spoke/msftb.png';
import nbisbIcon from 'assets/img/spoke/nbisb.png';
import bebIcon from 'assets/img/spoke/beb.png';
import amdbIcon from 'assets/img/spoke/amdb.png';
import mrnabIcon from 'assets/img/spoke/mrnab.png';
import mubIcon from 'assets/img/spoke/mub.png';
import intcbIcon from 'assets/img/spoke/intcb.png';
import drambIcon from 'assets/img/spoke/dramb.png';
import tsmbIcon from 'assets/img/spoke/tsmb.png';
import coinbIcon from 'assets/img/spoke/coinb.png';
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

// Draft listing: Notion "bStock mainstream spoke pool listing" (CF used as Max LTV).
const MAINSTREAM_POOL_ADDRESS = 'preview-bstock-mainstream';
const mainstreamCollaterals: SpokeCollateralAsset[] = [
  { symbol: 'NVDAB', iconSrc: nvdabIcon, maxLtvPercentage: 75 },
  { symbol: 'TSLAB', iconSrc: tslabIcon, maxLtvPercentage: 75 },
  { symbol: 'SPCXB', iconSrc: spcxbIcon, maxLtvPercentage: 50 },
  { symbol: 'SKHYB', iconSrc: skhybIcon, maxLtvPercentage: 55 },
  { symbol: 'CRCLB', iconSrc: crclbIcon, maxLtvPercentage: 60 },
  { symbol: 'GOOGLB', iconSrc: googlbIcon, maxLtvPercentage: 70 },
  { symbol: 'AAPLB', iconSrc: aaplbIcon, maxLtvPercentage: 70 },
  { symbol: 'MSTRB', iconSrc: mstrbIcon, maxLtvPercentage: 60 },
  { symbol: 'SNDKB', iconSrc: sndkbIcon, maxLtvPercentage: 50 },
  { symbol: 'METAB', iconSrc: metabIcon, maxLtvPercentage: 70 },
  { symbol: 'MSFTB', iconSrc: msftbIcon, maxLtvPercentage: 75 },
  { symbol: 'NBISB', iconSrc: nbisbIcon, maxLtvPercentage: 50 },
  { symbol: 'BEB', iconSrc: bebIcon, maxLtvPercentage: 50 },
  { symbol: 'AMDB', iconSrc: amdbIcon, maxLtvPercentage: 65 },
  { symbol: 'MRNAB', iconSrc: mrnabIcon, maxLtvPercentage: 50 },
  { symbol: 'MUB', iconSrc: mubIcon, maxLtvPercentage: 65 },
  { symbol: 'INTCB', iconSrc: intcbIcon, maxLtvPercentage: 65 },
  { symbol: 'DRAMB', iconSrc: drambIcon, maxLtvPercentage: 55 },
  { symbol: 'TSMB', iconSrc: tsmbIcon, maxLtvPercentage: 65 },
  { symbol: 'COINB', iconSrc: coinbIcon, maxLtvPercentage: 50 },
];
const MAINSTREAM_LOAN_PREVIEWS = [
  { symbol: 'USDT', borrowApyPercentage: 1.5, borrowedTokens: new BigNumber('0') },
  { symbol: 'USDC', borrowApyPercentage: 1.5, borrowedTokens: new BigNumber('0') },
  { symbol: 'U', borrowApyPercentage: 1.5, borrowedTokens: new BigNumber('0') },
];

const getMainstreamPool = (): SpokeOverviewPool => ({
  address: MAINSTREAM_POOL_ADDRESS,
  name: 'bStock mainstream',
  description: 'Borrow against mainstream bStocks.',
  loanAssets: MAINSTREAM_LOAN_PREVIEWS.flatMap(({ symbol, ...preview }) => {
    const token = tokens[ChainId.BSC_TESTNET].find(token => token.symbol === symbol);
    return token ? [{ token, preview }] : [];
  }),
  collateralAssets: mainstreamCollaterals,
});

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
        name: isBStockPool ? 'Hub-funded spoke' : pool.name,
        description: isBStockPool ? 'Borrow against bStock assets.' : pool.description,
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
  if (pools.length > 0) visiblePools.push(getMainstreamPool());

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
