import { useQuery } from '@tanstack/react-query';
import { ChainId, tokens } from '@venusprotocol/chains';
import BigNumber from 'bignumber.js';
import type { Token } from 'types';
import type { Address } from 'viem';

/**
 * Venus Spoke: isolated borrow markets. Each pool lists collateral markets (e.g. bStock
 * tokens) and loan markets funded by the Liquidity Hub.
 *
 * Preview note: the Spoke API only exists on testnet for now (mainnet returns 503), so this
 * reads BSC testnet whatever chain the app is on. FE: move to restService + the current
 * chain once /spoke ships on mainnet.
 */
export const SPOKE_API_CHAIN_ID = ChainId.BSC_TESTNET;
const SPOKE_API_URL = 'https://testnetapi.venus.io';

// Comptroller action indices in pausedActionsBitmap.
const MINT_ACTION = 0;
const BORROW_ACTION = 2;

export type SpokeMarketSide = 'collateral' | 'liquidity' | 'inactive';
export type SpokeHistoryRange = '1w' | '1m' | '3m' | '1y' | 'all';

export interface SpokeMarket {
  address: Address;
  poolAddress: Address;
  poolName: string;
  side: SpokeMarketSide;
  token: Token;
  tokenPriceCents: BigNumber;
  supplyTokens: BigNumber;
  supplyCents: BigNumber;
  supplyCapTokens: BigNumber;
  borrowTokens: BigNumber;
  borrowCents: BigNumber;
  borrowCapTokens: BigNumber;
  cashTokens: BigNumber;
  liquidityCents: BigNumber;
  hubSuppliedTokens: BigNumber;
  borrowApyPercentage: number;
  supplyApyPercentage: number;
  collateralFactorPercentage: number;
  liquidationThresholdPercentage: number;
  liquidationPenaltyPercentage: number;
  reserveFactorPercentage: number;
  borrowerCount: number;
  supplierCount: number;
  suppliable: boolean;
  isPaused: boolean;
}

export interface SpokePool {
  address: Address;
  name: string;
  description: string;
  priceOracleAddress: Address;
  collateralMarkets: SpokeMarket[];
  loanMarkets: SpokeMarket[];
}

export interface GetSpokePoolsOutput {
  pools: SpokePool[];
  totalBorrowCents: BigNumber;
  availableLiquidityCents: BigNumber;
  poolCount: number;
}

interface ApiSpokeMarket {
  address: Address;
  underlyingAddress: Address;
  symbol: string;
  side: SpokeMarketSide;
  suppliable: boolean;
  underlyingPriceMantissa: string;
  totalSupplyUsdCents: string;
  totalBorrowsMantissa: string;
  totalBorrowsUsdCents: string;
  cashMantissa: string;
  hubSuppliedMantissa: string;
  supplyCapsMantissa: string;
  borrowCapsMantissa: string;
  borrowApyDecimal: number;
  supplyApyDecimal: number;
  collateralFactorMantissa: string;
  liquidationThresholdMantissa: string;
  liquidationIncentiveMantissa: string;
  reserveFactorMantissa: string;
  borrowerCount: number;
  supplierCount: number;
  pausedActionsBitmap: number;
}

interface ApiSpokePool {
  address: Address;
  name: string;
  description: string;
  priceOracleAddress: Address;
  markets: ApiSpokeMarket[];
}

interface ApiTokenMetadata {
  address: Address;
  symbol: string;
  decimals: number;
}

interface ApiSpokePoolsResponse {
  result: ApiSpokePool[];
  tokens: ApiTokenMetadata[];
  totals: { availableLiquidityUsdCents: string; poolCount: number; totalBorrowsUsdCents: string };
}

const fromMantissa = (value: string, decimals: number) => new BigNumber(value).shiftedBy(-decimals);
const mantissaToPercentage = (value: string) => new BigNumber(value).shiftedBy(-16).toNumber();

const resolveToken = (address: Address, metadata?: ApiTokenMetadata): Token => {
  const known = tokens[SPOKE_API_CHAIN_ID].find(
    token => token.address.toLowerCase() === address.toLowerCase(),
  );

  return (
    known ?? {
      chainId: SPOKE_API_CHAIN_ID,
      address,
      decimals: metadata?.decimals ?? 18,
      symbol: metadata?.symbol ?? '?',
      iconSrc: '',
    }
  );
};

const formatMarket = (
  market: ApiSpokeMarket,
  pool: ApiSpokePool,
  tokenMetadata: ApiTokenMetadata[],
): SpokeMarket => {
  const token = resolveToken(
    market.underlyingAddress,
    tokenMetadata.find(t => t.address.toLowerCase() === market.underlyingAddress.toLowerCase()),
  );
  const { decimals } = token;
  // Oracle prices are scaled by 1e(36 - decimals).
  const tokenPriceCents = fromMantissa(market.underlyingPriceMantissa, 36 - decimals).times(100);
  const supplyCents = new BigNumber(market.totalSupplyUsdCents);
  const cashTokens = fromMantissa(market.cashMantissa, decimals);
  const paused = (action: number) => (market.pausedActionsBitmap & (1 << action)) !== 0;

  return {
    address: market.address,
    poolAddress: pool.address,
    poolName: pool.name,
    side: market.side,
    token,
    tokenPriceCents,
    supplyTokens: tokenPriceCents.gt(0) ? supplyCents.div(tokenPriceCents) : new BigNumber(0),
    supplyCents,
    supplyCapTokens: fromMantissa(market.supplyCapsMantissa, decimals),
    borrowTokens: fromMantissa(market.totalBorrowsMantissa, decimals),
    borrowCents: new BigNumber(market.totalBorrowsUsdCents),
    borrowCapTokens: fromMantissa(market.borrowCapsMantissa, decimals),
    cashTokens,
    liquidityCents: cashTokens.times(tokenPriceCents),
    hubSuppliedTokens: fromMantissa(market.hubSuppliedMantissa, decimals),
    borrowApyPercentage: market.borrowApyDecimal * 100,
    supplyApyPercentage: market.supplyApyDecimal * 100,
    collateralFactorPercentage: mantissaToPercentage(market.collateralFactorMantissa),
    liquidationThresholdPercentage: mantissaToPercentage(market.liquidationThresholdMantissa),
    liquidationPenaltyPercentage: Math.max(
      mantissaToPercentage(market.liquidationIncentiveMantissa) - 100,
      0,
    ),
    reserveFactorPercentage: mantissaToPercentage(market.reserveFactorMantissa),
    borrowerCount: market.borrowerCount,
    supplierCount: market.supplierCount,
    suppliable: market.suppliable,
    isPaused: market.side === 'liquidity' ? paused(BORROW_ACTION) : paused(MINT_ACTION),
  };
};

export const getSpokePools = async (): Promise<GetSpokePoolsOutput> => {
  const response = await fetch(
    `${SPOKE_API_URL}/spoke/pools?chainId=${SPOKE_API_CHAIN_ID}&limit=500`,
  );
  const data = (await response.json()) as ApiSpokePoolsResponse;

  const pools = data.result.map<SpokePool>(pool => {
    const markets = pool.markets.map(market => formatMarket(market, pool, data.tokens));

    return {
      address: pool.address,
      name: pool.name,
      description: pool.description,
      priceOracleAddress: pool.priceOracleAddress,
      collateralMarkets: markets.filter(market => market.side === 'collateral'),
      loanMarkets: markets.filter(market => market.side === 'liquidity'),
    };
  });

  return {
    pools,
    totalBorrowCents: new BigNumber(data.totals.totalBorrowsUsdCents),
    availableLiquidityCents: new BigNumber(data.totals.availableLiquidityUsdCents),
    poolCount: data.totals.poolCount,
  };
};

export const useGetSpokePools = () =>
  useQuery({
    queryKey: ['GET_SPOKE_POOLS', SPOKE_API_CHAIN_ID],
    queryFn: getSpokePools,
    refetchInterval: 30_000,
  });

export interface SpokeHistoryPoint {
  blockTimestamp: number;
  borrowApyPercentage: number;
  totalBorrowCents: number;
}

export const useGetSpokeMarketHistory = ({
  marketAddress,
  range,
}: {
  marketAddress?: Address;
  range: SpokeHistoryRange;
}) =>
  useQuery({
    queryKey: ['GET_SPOKE_MARKET_HISTORY', SPOKE_API_CHAIN_ID, marketAddress, range],
    enabled: !!marketAddress,
    queryFn: async () => {
      const response = await fetch(
        `${SPOKE_API_URL}/spoke/markets/${marketAddress}/history?chainId=${SPOKE_API_CHAIN_ID}&range=${range}`,
      );
      const data = (await response.json()) as {
        averageBorrowApyDecimal: number;
        result: {
          blockTimestamp: number;
          borrowApyDecimal: number;
          totalBorrowsUsdCents: string;
        }[];
      };

      return {
        averageBorrowApyPercentage: data.averageBorrowApyDecimal * 100,
        points: data.result.map<SpokeHistoryPoint>(point => ({
          // API timestamps are seconds; charts expect milliseconds.
          blockTimestamp: point.blockTimestamp * 1000,
          borrowApyPercentage: point.borrowApyDecimal * 100,
          totalBorrowCents: Number(point.totalBorrowsUsdCents),
        })),
      };
    },
  });
