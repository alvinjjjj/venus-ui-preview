import snapshot from 'demo/hubs.json';
import type { Address } from 'viem';

import { VError } from 'libs/errors';
import type { ApiLiquidityHub, ChainId, LiquidityHub, Token } from 'types';
import { formatToLiquidityHub } from 'utilities/formatToLiquidityHub';

export interface GetLiquidityHubsInput {
  chainId: ChainId;
  tokens: Token[];
  accountAddress?: Address;
}

export interface GetLiquidityHubsOutput {
  liquidityHubs: LiquidityHub[];
}

export interface GetLiquidityHubsResponse {
  result?: ApiLiquidityHub[];
}

export const getLiquidityHubs = async ({
  tokens,
}: GetLiquidityHubsInput): Promise<GetLiquidityHubsOutput> => {
  const payload = snapshot as unknown as GetLiquidityHubsResponse;

  if (payload && 'error' in payload) {
    throw new VError({
      type: 'unexpected',
      code: 'somethingWentWrong',
      data: { exception: payload.error },
    });
  }

  if (!payload) {
    throw new VError({ type: 'unexpected', code: 'somethingWentWrong' });
  }

  const liquidityHubs =
    payload.result?.reduce<GetLiquidityHubsOutput['liquidityHubs']>((acc, apiLiquidityHub) => {
      const liquidityHub = formatToLiquidityHub({ apiLiquidityHub, tokens });

      if (liquidityHub) {
        acc.push(liquidityHub);
      }

      return acc;
    }, []) ?? [];

  return {
    liquidityHubs,
  };
};
