import { useQuery } from '@tanstack/react-query';
import { ChainId, chains as chainMetadata, getBlockTimeByChainId } from '@venusprotocol/chains';
import { useChainId } from 'libs/wallet';

// Public, CORS-friendly endpoints. Chains not listed show the status without a block.
const PUBLIC_RPCS: Partial<Record<ChainId, string>> = {
  [ChainId.BSC_MAINNET]: 'https://bsc-dataseed.bnbchain.org',
  [ChainId.OPBNB_MAINNET]: 'https://opbnb-mainnet-rpc.bnbchain.org',
  [ChainId.ARBITRUM_ONE]: 'https://arb1.arbitrum.io/rpc',
};

/**
 * Latest block on the current chain via a plain eth_blockNumber call (the app's
 * useGetBlockNumber and public client are stubbed in this preview). Polls at the
 * chain's block time, floored at 3s so the footer ticks without hammering the RPC.
 * FE: swap for useGetBlockNumber once it is live.
 */
export const useLiveBlock = () => {
  const { chainId } = useChainId();
  const { blockTimeMs } = getBlockTimeByChainId({ chainId }) ?? {};
  const rpcUrl = PUBLIC_RPCS[chainId];

  const { data } = useQuery({
    queryKey: ['landing-footer-block', chainId],
    queryFn: async () => {
      const response = await fetch(rpcUrl as string, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
      });
      const { result } = (await response.json()) as { result?: string };
      return result ? Number.parseInt(result, 16) : undefined;
    },
    enabled: !!rpcUrl,
    refetchInterval: Math.max(blockTimeMs ?? 3000, 3000),
  });

  return { blockNumber: data, chainName: chainMetadata[chainId]?.name ?? 'BNB Chain' };
};
