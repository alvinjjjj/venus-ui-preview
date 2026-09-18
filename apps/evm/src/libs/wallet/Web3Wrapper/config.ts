import type { Chain } from 'viem';
import { http, type CreateConnectorFn, createConfig, fallback } from 'wagmi';

import localConfig from 'config';
import type { ChainId } from 'types';
import { chains } from '../chains';

const connectors: CreateConnectorFn[] = [];

const config = createConfig({
  chains: chains as [Chain, ...Chain[]],
  connectors,
  multiInjectedProviderDiscovery: false,
  transports: chains.reduce((acc, chain) => {
    const urls = localConfig.rpcUrls[chain.id as ChainId];

    return {
      ...acc,
      [chain.id]: fallback([
        ...urls.map(url => http(url)),
        // Add public RPC Node as a last resort solution
        http(),
      ]),
    };
  }, {}),
  batch: {
    multicall: {
      wait: 50,
    },
  },
});

export default config;
