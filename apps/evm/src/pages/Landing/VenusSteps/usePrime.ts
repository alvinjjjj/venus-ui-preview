import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@venusprotocol/chains';
import { useGetTokens } from 'libs/tokens';
import { useMemo } from 'react';
import type { Token } from 'types';
import { restService } from 'utilities';
import { useCoreMarkets } from './useTopHub';

const LIVE_API = 'https://api.venus.io';
const CHAIN_ID = ChainId.BSC_MAINNET;

export interface PrimeSnapshot {
  /** Prime seats per cycle (the top N of the leaderboard). */
  seats: number;
  /** XVS staked by the account at the last seat. */
  minimumStakeXvs: number;
  /** Accounts on the leaderboard. */
  ranked: number;
  cycleIndex: number;
  endsAt: Date;
  /** Prime rewards estimated for the current cycle, USD. */
  cyclePoolUsd: number;
  xvs?: Token;
  xvsPriceUsd: number;
  usdt?: Token;
  /** Core Pool USDT supply APY and its estimated average Prime boost, percent. */
  usdtSupplyApy: number;
  usdtPrimeBoost: number;
  live: boolean;
}

/** Values on 8 Oct 2026, used until the API answers. */
const FALLBACK = {
  seats: 500,
  minimumStakeXvs: 1043.8,
  ranked: 4222,
  cycleIndex: 4,
  endsAt: '2026-11-01T00:00:00.000Z',
  cyclePoolUsd: 51_624,
  xvsPriceUsd: 3.13,
  usdtSupplyApy: 3.67,
  usdtPrimeBoost: 0.12,
};

const get = async <T>(endpoint: string, params: Record<string, unknown> = {}) => {
  const response = await restService<T>({
    baseUrl: LIVE_API,
    endpoint,
    method: 'GET',
    params: { chainId: CHAIN_ID, ...params },
  });
  if (!response.data || 'error' in (response.data as object)) throw new Error(endpoint);
  return response.data as T;
};

/** Live Prime figures for the Earn step: seats, the cut-off stake, the cycle and its pool. */
export const usePrimeSnapshot = (): PrimeSnapshot => {
  const tokens = useGetTokens({ chainId: CHAIN_ID });
  const { data: markets } = useCoreMarkets();
  const { data } = useQuery({
    queryKey: ['landing-venus-steps-prime', CHAIN_ID],
    queryFn: async () => {
      const [cycle, minimum, board] = await Promise.all([
        get<{
          cycle?: { cycleIndex?: number; endsAt?: string };
          pendingPool?: { currentEstimatedTotalUsdCents?: string };
        }>('/prime/cycle/current'),
        get<{ tokenLimit?: number; minimumStakeMantissa?: string }>('/prime/minimum-stake'),
        get<{ total?: number }>('/prime/leaderboard', { page: 1, limit: 1 }),
      ]);
      return { cycle, minimum, board };
    },
    staleTime: 300_000,
    retry: 1,
  });

  return useMemo(() => {
    const xvs = tokens.find(token => token.symbol === 'XVS');
    const usdt = tokens.find(token => token.symbol === 'USDT');
    const at = (token?: Token) => token?.address.toLowerCase() ?? '';
    const pool = Number(data?.cycle.pendingPool?.currentEstimatedTotalUsdCents);
    const minimum = Number(data?.minimum.minimumStakeMantissa);
    const price = markets?.priceCents[at(xvs)];
    return {
      seats: data?.minimum.tokenLimit ?? FALLBACK.seats,
      minimumStakeXvs: minimum > 0 ? minimum / 1e18 : FALLBACK.minimumStakeXvs,
      ranked: data?.board.total ?? FALLBACK.ranked,
      cycleIndex: data?.cycle.cycle?.cycleIndex ?? FALLBACK.cycleIndex,
      endsAt: new Date(data?.cycle.cycle?.endsAt ?? FALLBACK.endsAt),
      cyclePoolUsd: pool > 0 ? pool / 100 : FALLBACK.cyclePoolUsd,
      xvs,
      xvsPriceUsd: price ? price / 100 : FALLBACK.xvsPriceUsd,
      usdt,
      usdtSupplyApy: markets?.supplyApy[at(usdt)] ?? FALLBACK.usdtSupplyApy,
      usdtPrimeBoost: markets?.primeSupplyBoost[at(usdt)] ?? FALLBACK.usdtPrimeBoost,
      live: !!data,
    };
  }, [data, markets, tokens]);
};
