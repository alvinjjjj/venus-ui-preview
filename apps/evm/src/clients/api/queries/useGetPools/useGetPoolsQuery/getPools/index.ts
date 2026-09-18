import BigNumber from 'bignumber.js';
import snapshot from 'demo/pools.json';
import type { GetPoolsInput, GetPoolsOutput } from '../../types';
import { formatOutput } from './formatOutput';
import { type ApiTokenMetadata, type GetApiPoolsResponse, getApiPools } from './getApiPools';
export interface GetPoolsQueryOutput extends GetPoolsOutput {
  tokenMetadataMapping: Record<string, ApiTokenMetadata>;
}
export const getPools = async ({
  chainId,
  tokens,
  accountAddress,
}: GetPoolsInput): Promise<GetPoolsQueryOutput> => {
  const payload = snapshot as unknown as GetApiPoolsResponse;
  const source =
    chainId === 56
      ? {
          pools: payload.result,
          tokenMetadataMapping: Object.fromEntries(
            payload.tokens.map(token => [token.address.toLowerCase(), token]),
          ),
        }
      : await getApiPools({ chainId });
  const markets = source.pools.flatMap(pool => pool.markets);
  return {
    tokenMetadataMapping: source.tokenMetadataMapping,
    pools: formatOutput({
      chainId,
      tokens,
      apiPools: source.pools,
      tokenMetadataMapping: source.tokenMetadataMapping,
      currentBlockNumber: 121232897n,
      isUserConnected: !!accountAddress,
      userPoolEModeGroupIdMapping: {},
      vaiPriceMantissa: 1000000000000000000n,
      vaiRepayRateMantissa: 10000000000000000n,
      userTokenBalances: accountAddress
        ? tokens.map(token => ({
            token,
            balanceMantissa: new BigNumber(2000).shiftedBy(token.decimals),
          }))
        : [],
      userVTokenBalances: accountAddress
        ? markets.map(market => ({
            vTokenAddress: market.address,
            underlyingTokenSupplyBalanceMantissa: new BigNumber(
              ['USDT', 'USDC'].includes(market.underlyingSymbol) ? 1500 : 0,
            ).shiftedBy(market.underlyingDecimal),
            underlyingTokenBorrowBalanceMantissa: new BigNumber(
              market.underlyingSymbol === 'USDT' ? 250 : 0,
            ).shiftedBy(market.underlyingDecimal),
          }))
        : [],
      userCollateralVTokenAddresses: accountAddress
        ? markets
            .filter(market => ['USDT', 'USDC'].includes(market.underlyingSymbol))
            .map(market => market.address)
        : [],
    }),
  };
};
