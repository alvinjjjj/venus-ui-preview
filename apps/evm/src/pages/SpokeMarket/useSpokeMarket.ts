import BigNumber from 'bignumber.js';
import { tokens, ChainId } from '@venusprotocol/chains';
import { mainstreamCollaterals } from '../Spoke/overview';
import { useGetSpokePools } from 'clients/api';
import { useParams } from 'react-router';

/** The pool and loan market addressed by /spoke/:spokePoolAddress/:spokeMarketAddress. */
export const useSpokeMarket = () => {
  const { spokePoolAddress, spokeMarketAddress } = useParams<{
    spokePoolAddress: string;
    spokeMarketAddress: string;
  }>();
  const { data, isLoading } = useGetSpokePools();

  let pool = data?.pools.find(
    candidate => candidate.address.toLowerCase() === spokePoolAddress?.toLowerCase(),
  );
  const isPreview = spokePoolAddress === 'preview-bstock-mainstream';
  if (isPreview && data?.pools.length) {
    const base = data.pools.find(p => p.collateralMarkets.length && p.loanMarkets.length);
    const template = base?.loanMarkets[0];
    if (base && template) {
      // Dedicated design-only route; no addresses are used for transactions.
      const makeMarket = (symbol: string, index: number, iconSrc?: string) => ({
        ...template,
        address: `preview-${symbol}` as typeof template.address,
        poolName: 'bStock mainstream',
        tokenPriceCents: new BigNumber(100),
        token: { ...(tokens[ChainId.BSC_TESTNET].find(t => t.symbol === symbol) ?? template.token), symbol, ...(iconSrc ? { iconSrc } : {}) },
        borrowTokens: new BigNumber(0), borrowCents: new BigNumber(0),
        supplyTokens: new BigNumber(index === 0 ? 10000 : 150 + index),
        supplyCapTokens: new BigNumber(10000),
        supplyCents: new BigNumber(1000000), liquidityCents: new BigNumber(1000000),
        borrowApyPercentage: 1.5,
      });
      pool = { ...base, name: 'bStock mainstream',
        collateralMarkets: mainstreamCollaterals.slice(0, 16).map((a, i) => ({
          ...makeMarket(a.symbol, i, a.iconSrc),
          collateralFactorPercentage: a.maxLtvPercentage ?? 50,
          liquidationThresholdPercentage: (a.maxLtvPercentage ?? 50) + 5,
          liquidationPenaltyPercentage: 10,
        })),
        loanMarkets: ['USDT', 'USDC', 'U'].map((s, i) => makeMarket(s, i)),
      };
    }
  }
  const market = pool?.loanMarkets.find(
    candidate => isPreview ? candidate.token.symbol.toLowerCase() === spokeMarketAddress?.toLowerCase() : candidate.address.toLowerCase() === spokeMarketAddress?.toLowerCase(),
  );

  return { pool, market, isLoading, isPreview };
};
