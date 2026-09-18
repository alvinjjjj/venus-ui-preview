import { useSearchParams } from 'react-router';
export const useAccountChainId = () => {
  const [params] = useSearchParams();
  return { chainId: Number(params.get('chainId') || 56) };
};
