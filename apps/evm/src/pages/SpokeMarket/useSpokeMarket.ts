import { useGetSpokePools } from 'clients/api';
import { useParams } from 'react-router';

/** The pool and loan market addressed by /spoke/:spokePoolAddress/:spokeMarketAddress. */
export const useSpokeMarket = () => {
  const { spokePoolAddress, spokeMarketAddress } = useParams<{
    spokePoolAddress: string;
    spokeMarketAddress: string;
  }>();
  const { data, isLoading } = useGetSpokePools();

  const pool = data?.pools.find(
    candidate => candidate.address.toLowerCase() === spokePoolAddress?.toLowerCase(),
  );
  const market = pool?.loanMarkets.find(
    candidate => candidate.address.toLowerCase() === spokeMarketAddress?.toLowerCase(),
  );

  return { pool, market, isLoading };
};
