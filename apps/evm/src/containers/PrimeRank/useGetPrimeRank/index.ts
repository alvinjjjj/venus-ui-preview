import { useDemo } from 'demo/state';
import { useAccountAddress } from 'libs/wallet';

export interface PrimeRankData {
  hasStakedXvs: boolean;
  isCandidate: boolean;
  rank: number;
  primeScore: number;
  gapXvsTokens: number;
}

export const useGetPrimeRank = (): PrimeRankData & { isLoading: boolean } => {
  const { accountAddress } = useAccountAddress();
  const isPrime = useDemo(state => state.loggedIn && state.profile === 'prime');
  if (isPrime)
    return {
      isLoading: false,
      hasStakedXvs: true,
      isCandidate: false,
      rank: 42,
      primeScore: 5000,
      gapXvsTokens: 0,
    };
  return {
    isLoading: false,
    hasStakedXvs: !!accountAddress,
    isCandidate: false,
    rank: accountAddress ? 618 : 0,
    primeScore: accountAddress ? 250 : 0,
    gapXvsTokens: accountAddress ? 750 : 0,
  };
};
