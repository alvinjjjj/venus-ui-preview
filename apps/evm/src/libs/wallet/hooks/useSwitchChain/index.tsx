import { useUpdateUrlChainId } from 'libs/wallet/hooks/useUpdateUrlChainId';
import type { ChainId } from 'types';
export const useSwitchChain = () => {
  const { updateUrlChainId } = useUpdateUrlChainId();
  return {
    switchChain: async (input: { chainId: ChainId; callback?: () => void }) => {
      updateUrlChainId(input);
      input.callback?.();
    },
  };
};
