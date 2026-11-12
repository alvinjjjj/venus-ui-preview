import nvdab from 'assets/img/spoke/nvdab.png';
import qqqb from 'assets/img/spoke/qqqb.png';
import skhyb from 'assets/img/spoke/skhyb.png';
import spcxb from 'assets/img/spoke/spcxb.png';
import spyb from 'assets/img/spoke/spyb.png';
import tslab from 'assets/img/spoke/tslab.png';
import BigNumber from 'bignumber.js';
import type { Asset } from 'types';
import { getApyOffer } from './apy';
import type { LiteAsset } from './data';
export type Collateral = { symbol: string; iconSrc?: string };
export type BorrowSource = {
  name: string;
  apy?: number;
  liquidity?: number;
  borrowed?: number;
  collateral: Collateral[];
};
// User-requested layout fixtures only. Never pass these into a transaction form.
const mockSources: BorrowSource[] = [
  {
    name: 'bStock index',
    apy: 4.26,
    liquidity: 4140000,
    borrowed: 5140000,
    collateral: [
      { symbol: 'QQQB', iconSrc: qqqb },
      { symbol: 'SPYB', iconSrc: spyb },
    ],
  },
  {
    name: 'bStock growth',
    apy: 5.25,
    liquidity: 3140000,
    borrowed: 6640000,
    collateral: [
      { symbol: 'SPCXB', iconSrc: spcxb },
      { symbol: 'TSLAB', iconSrc: tslab },
    ],
  },
  {
    name: 'bStock bluechips',
    apy: 3.66,
    liquidity: 1140000,
    borrowed: 15760000,
    collateral: [
      { symbol: 'NVDAB', iconSrc: nvdab },
      { symbol: 'SKHYB', iconSrc: skhyb },
    ],
  },
];

export function getBorrowSources(asset: Asset, rows: LiteAsset[]): BorrowSource[] {
  const core: BorrowSource = {
    name: 'Venus Core',
    collateral: rows
      .filter(row => row.markets.some(m => m.asset && m.asset.collateralFactor > 0))
      .map(row => ({ symbol: row.token.symbol, iconSrc: row.token.iconSrc })),
  };
  // Only the stablecoin loans supported by this preview have Spoke fixtures.
  return [
    core,
    ...(['USDT', 'USDC', 'U'].includes(asset.vToken.underlyingToken.symbol) ? mockSources : []),
  ];
}

export function getBorrowSourceMetrics(asset: Asset, source: BorrowSource) {
  const coreOffer = getApyOffer(
    'borrow',
    asset.borrowApyPercentage,
    asset.borrowTokenDistributions,
  );
  const liquidity =
    source.liquidity === undefined ? asset.cashTokens : new BigNumber(source.liquidity);
  const borrowed =
    source.borrowed === undefined ? asset.borrowBalanceTokens : new BigNumber(source.borrowed);
  return {
    apy: source.apy === undefined ? coreOffer.rankingApy : new BigNumber(source.apy),
    liquidity,
    borrowed,
    liquidityCents:
      source.liquidity === undefined
        ? asset.liquidityCents
        : liquidity.times(asset.tokenPriceCents),
    borrowedCents:
      source.borrowed === undefined
        ? asset.borrowBalanceCents
        : borrowed.times(asset.tokenPriceCents),
  };
}

export function getBorrowAssetMetrics(asset: Asset, rows: LiteAsset[]) {
  const sources = getBorrowSources(asset, rows);
  const best = sources.reduce((a, b) =>
    getBorrowSourceMetrics(asset, b).apy.lt(getBorrowSourceMetrics(asset, a).apy) ? b : a,
  );
  const totals = sources.reduce(
    (sum, source) => {
      const metric = getBorrowSourceMetrics(asset, source);
      return {
        liquidity: sum.liquidity.plus(metric.liquidity),
        borrowed: sum.borrowed.plus(metric.borrowed),
        liquidityCents: sum.liquidityCents.plus(metric.liquidityCents),
        borrowedCents: sum.borrowedCents.plus(metric.borrowedCents),
      };
    },
    {
      liquidity: new BigNumber(0),
      borrowed: new BigNumber(0),
      liquidityCents: new BigNumber(0),
      borrowedCents: new BigNumber(0),
    },
  );
  return { ...totals, best, apy: getBorrowSourceMetrics(asset, best).apy };
}
