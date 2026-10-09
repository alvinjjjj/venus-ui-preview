import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@venusprotocol/chains';
import { useGetTokens } from 'libs/tokens';
import { useMemo } from 'react';
import type {
  ApiLiquidityHub,
  LiquidityHub,
  LiquidityHubYieldGroup,
  LiquidityHubYieldGroupType,
  Token,
} from 'types';
import { getCombinedApy, restService } from 'utilities';
import { formatToLiquidityHub } from 'utilities/formatToLiquidityHub';

export interface HubAsset {
  symbol: string;
  vhSymbol: string;
  /** The underlying token, for system components such as TokenIcon. */
  token?: Token;
  /** The vhToken as a Token, so its own icon (vhUSDC.png …) can be shown. */
  vhToken?: Token;
  /** Total supply APY in percent, computed the way the Liquidity Hub table sorts it. */
  apy: number;
  /** Underlying tokens per vhToken share. */
  pricePerShare: number;
  /** Collateral factor of the vhToken's Core Pool market, in percent. */
  collateralFactor: number;
  /** Spokes this Hub can route to, with their live allocation (0-1). */
  spokes: { type: LiquidityHubYieldGroupType; share: number; group?: LiquidityHubYieldGroup }[];
}

/** Used while the Hub data loads, or if both sources fail: the live values on 7 Oct 2026. */
const FALLBACK: HubAsset[] = [
  {
    symbol: 'USDC',
    vhSymbol: 'vhUSDC',
    apy: 3.71,
    pricePerShare: 1.004842,
    collateralFactor: 82.5,
    spokes: [
      { type: 'core', share: 1 },
      { type: 'flux', share: 0 },
    ],
  },
  {
    symbol: 'USDT',
    vhSymbol: 'vhUSDT',
    apy: 3.58,
    pricePerShare: 1.004171,
    collateralFactor: 80,
    spokes: [],
  },
  {
    symbol: 'U',
    vhSymbol: 'vhU',
    apy: 1.78,
    pricePerShare: 1.003183,
    collateralFactor: 75,
    spokes: [],
  },
];

/** Core Pool collateral factors for the vhTokens on 7 Oct 2026, used until /markets answers. */
const COLLATERAL_FALLBACK: Record<string, number> = { vhUSDC: 82.5, vhUSDT: 80, vhU: 75 };

const LANDING_CHAIN_ID = ChainId.BSC_MAINNET;
const LIVE_API = 'https://api.venus.io';
const KNOWN_KINDS: LiquidityHubYieldGroupType[] = ['core', 'flux', 'frv'];

/**
 * The preview build's getLiquidityHubs reads an old snapshot (11 Sep), so the
 * landing visual asks the live endpoint itself, the one the Hub page uses in
 * production. If that fails it shows FALLBACK (7 Oct), never the older snapshot.
 */
const useLiveLiquidityHubs = (tokens: Token[]) =>
  useQuery({
    queryKey: ['landing-venus-steps-live-hubs', LANDING_CHAIN_ID],
    queryFn: async () => {
      const response = await restService<{ result?: ApiLiquidityHub[] }>({
        baseUrl: LIVE_API,
        endpoint: '/liquidity-hub/hubs',
        method: 'GET',
        params: { chainId: LANDING_CHAIN_ID },
      });
      const result = response.data && 'result' in response.data ? response.data.result : undefined;
      if (!result?.length) throw new Error('No live Liquidity Hub data');
      return result.reduce<LiquidityHub[]>((acc, apiLiquidityHub) => {
        // The live USDT Hub also routes to a 'centrifuge' yield group this
        // build has no metadata for; formatting it throws, so keep known kinds.
        const known = {
          ...apiLiquidityHub,
          yieldGroups: apiLiquidityHub.yieldGroups.filter(group =>
            KNOWN_KINDS.includes(group.kind as LiquidityHubYieldGroupType),
          ),
        };
        try {
          const hub = formatToLiquidityHub({ apiLiquidityHub: known, tokens });
          if (hub) acc.push(hub);
        } catch {
          // skip a Hub this build cannot format rather than drop them all
        }
        return acc;
      }, []);
    },
    staleTime: 60_000,
    retry: 1,
  });

const CORE_POOL = '0xfd36e2c2a6789db23113685031d7f16329158384';

interface CoreMarkets {
  /** underlying address → collateral factor, percent */
  factors: Record<string, number>;
  /** underlying address → Core Pool borrow APY, percent (borrowable markets only) */
  borrowApy: Record<string, number>;
  /** underlying address → Core Pool supply APY, percent */
  supplyApy: Record<string, number>;
  /** underlying address → estimated average Prime supply boost, percent (Core Pool) */
  primeSupplyBoost: Record<string, number>;
  /** underlying address → price, USD cents */
  priceCents: Record<string, number>;
  /** underlying address → Core Pool liquidation threshold, percent */
  liquidationThreshold: Record<string, number>;
}

/** Live Core Pool markets: vhToken collateral factors (Supply, Borrow) and borrow rates (Borrow). */
export const useCoreMarkets = () =>
  useQuery({
    queryKey: ['landing-venus-steps-core-markets', LANDING_CHAIN_ID],
    queryFn: async (): Promise<CoreMarkets> => {
      const response = await restService<{
        result?: {
          underlyingAddress?: string;
          collateralFactorMantissa?: string;
          liquidationThresholdMantissa?: string;
          borrowApy?: string;
          supplyApy?: string;
          estimatedPrimeSupplyApyBoost?: string | number | null;
          tokenPriceCents?: string;
          isBorrowable?: boolean;
          poolComptrollerAddress?: string;
        }[];
      }>({
        baseUrl: LIVE_API,
        endpoint: '/markets',
        method: 'GET',
        params: { chainId: LANDING_CHAIN_ID, limit: 300 },
      });
      const result = response.data && 'result' in response.data ? response.data.result : undefined;
      const markets: CoreMarkets = {
        factors: {},
        borrowApy: {},
        supplyApy: {},
        primeSupplyBoost: {},
        priceCents: {},
        liquidationThreshold: {},
      };
      result?.forEach(market => {
        const address = market.underlyingAddress?.toLowerCase();
        if (!address) return;
        if (market.collateralFactorMantissa) {
          markets.factors[address] = Number(market.collateralFactorMantissa) / 1e16;
        }
        if (market.tokenPriceCents) markets.priceCents[address] = Number(market.tokenPriceCents);
        const core = market.poolComptrollerAddress?.toLowerCase() === CORE_POOL;
        if (core && market.supplyApy) markets.supplyApy[address] = Number(market.supplyApy);
        if (core && market.liquidationThresholdMantissa) {
          markets.liquidationThreshold[address] =
            Number(market.liquidationThresholdMantissa) / 1e16;
        }
        const boost = Number(market.estimatedPrimeSupplyApyBoost);
        if (core && Number.isFinite(boost) && boost > 0) markets.primeSupplyBoost[address] = boost;
        if (
          market.isBorrowable &&
          market.borrowApy &&
          market.poolComptrollerAddress?.toLowerCase() === CORE_POOL
        ) {
          markets.borrowApy[address] = Number(market.borrowApy);
        }
      });
      return markets;
    },
    staleTime: 300_000,
    retry: 1,
  });

/** Core Pool borrow APYs on 8 Oct 2026, used until /markets answers. */
const BORROW_FALLBACK: Record<string, number> = { USDT: 5.24, USDC: 5.16, U: 3.52 };

export interface BorrowAsset {
  symbol: string;
  token?: Token;
  /** Core Pool borrow APY, percent */
  borrowApy: number;
}

/** Stablecoins to borrow in the Borrow step, with live Core Pool rates. */
export const useBorrowAssets = (symbols: string[]): BorrowAsset[] => {
  const tokens = useGetTokens({ chainId: LANDING_CHAIN_ID });
  const { data } = useCoreMarkets();
  return useMemo(
    () =>
      symbols.map(symbol => {
        const token = tokens.find(item => item.symbol === symbol);
        const live = token ? data?.borrowApy[token.address.toLowerCase()] : undefined;
        return { symbol, token, borrowApy: live ?? BORROW_FALLBACK[symbol] ?? 0 };
      }),
    [symbols, tokens, data],
  );
};

const toAsset = (
  hub: LiquidityHub,
  tokens: Token[],
  factors: Record<string, number> | undefined,
): HubAsset => {
  const apy = getCombinedApy({
    type: 'supply',
    baseApyPercentage: hub.supplyApyPercentage,
    tokenDistributions: hub.supplyTokenDistributions,
  }).totalApyPercentage.toNumber();
  const total = hub.yieldGroups.reduce((sum, group) => sum + group.allocationCents.toNumber(), 0);
  return {
    symbol: hub.vhToken.underlyingToken.symbol,
    vhSymbol: hub.vhToken.symbol,
    token: hub.vhToken.underlyingToken,
    vhToken: tokens.find(token => token.symbol === hub.vhToken.symbol),
    apy,
    pricePerShare: hub.pricePerShare.toNumber() || 1,
    collateralFactor:
      factors?.[hub.vhToken.address.toLowerCase()] ?? COLLATERAL_FALLBACK[hub.vhToken.symbol] ?? 0,
    spokes: hub.yieldGroups.map(group => ({
      type: group.type,
      share: total > 0 ? group.allocationCents.toNumber() / total : 0,
      group,
    })),
  };
};

/**
 * Liquidity Hub assets for the step 01 visual, highest APY first. Rates, share
 * prices and allocations are live; amounts in the visual stay illustrative.
 */
export const useHubAssets = (): { assets: HubAsset[]; live: boolean } => {
  const tokens = useGetTokens({ chainId: LANDING_CHAIN_ID });
  const live = useLiveLiquidityHubs(tokens);
  const { data: markets } = useCoreMarkets();
  const factors = markets?.factors;

  return useMemo(() => {
    const hubs = live.data ?? [];
    if (!hubs.length) {
      return {
        assets: FALLBACK.map(asset => ({
          ...asset,
          token: tokens.find(token => token.symbol === asset.symbol),
          vhToken: tokens.find(token => token.symbol === asset.vhSymbol),
        })),
        live: false,
      };
    }
    return {
      assets: hubs.map(hub => toAsset(hub, tokens, factors)).sort((a, b) => b.apy - a.apy),
      live: !!live.data,
    };
  }, [live.data, tokens, factors]);
};
