import snapshot from 'demo/pools.json';
import type { Address, PublicClient } from 'viem';

import type { ImportableProtocol, ImportableSupplyPosition } from 'types';

export interface GetImportablePositionsInput {
  accountAddress: Address;
  publicClient: PublicClient;
  protocols: ImportableProtocol[];
  aaveUiPoolDataProviderContractAddress?: Address;
  aavePoolAddressesProviderContractAddress?: Address;
}

export type GetImportablePositionsOutput = {
  [protocol in ImportableProtocol]: ImportableSupplyPosition[];
};

export const getImportablePositions = async (
  _input: GetImportablePositionsInput,
): Promise<GetImportablePositionsOutput> => ({
  aave:
    snapshot.result
      .find(pool => pool.name === 'Core Pool')
      ?.markets.filter(market => ['USDT', 'USDC'].includes(market.underlyingSymbol))
      .map(market => ({
        protocol: 'aave',
        aTokenAddress: market.address as Address,
        tokenAddress: market.underlyingAddress as Address,
        supplyApyPercentage: 0.1,
        userATokenBalanceMantissa: 500n * 10n ** BigInt(market.underlyingDecimal),
        userATokenBalanceWithInterestsMantissa: 510n * 10n ** BigInt(market.underlyingDecimal),
        userSupplyBalanceMantissa: 510n * 10n ** BigInt(market.underlyingDecimal),
      })) ?? [],
});
