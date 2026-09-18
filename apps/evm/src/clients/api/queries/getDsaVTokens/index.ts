import snapshot from 'demo/pools.json';
import type { Address, PublicClient } from 'viem';

export interface GetDsaVTokensInput {
  publicClient: PublicClient;
  relativePositionManagerAddress: Address;
}

export type GetDsaVTokensOutput = {
  dsaVTokenAddresses: Address[];
};

export const getDsaVTokens = async (_input: GetDsaVTokensInput): Promise<GetDsaVTokensOutput> => ({
  dsaVTokenAddresses: snapshot.result.flatMap(pool =>
    pool.markets.map(market => market.address as Address),
  ),
});
