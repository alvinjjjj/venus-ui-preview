import { type CellProps, TokenIcon } from 'components';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useTranslation } from 'libs/translations';
import { useSpokeMarket } from 'pages/SpokeMarket/useSpokeMarket';
import { formatCentsToReadableValue } from 'utilities';
import { TokenInfo } from '../TokenInfo';

export const SpokeMarketInfo = () => {
  const { t } = useTranslation();
  const { pool, market } = useSpokeMarket();
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');

  const cells: CellProps[] = [
    {
      label: t('spoke.market.supply'),
      value: formatCentsToReadableValue({ value: market?.supplyCents }),
    },
    {
      label: t('spoke.market.liquidity'),
      value: formatCentsToReadableValue({ value: market?.liquidityCents }),
    },
    {
      label: t('spoke.market.price'),
      value: formatCentsToReadableValue({
        value: market?.tokenPriceCents,
        shorten: false,
        maxDecimalPlaces: 6,
      }),
    },
    {
      label: t('spoke.market.collateral'),
      value: (
        <div className="inline-flex items-center" aria-label={t('spoke.market.collateral')}>
          {pool?.collateralMarkets.slice(0, 5).map((collateral, index) => (
            <span key={collateral.address} title={collateral.token.symbol} className={index > 0 ? '-ml-1' : undefined}>
              <TokenIcon token={collateral.token} className="shrink-0 overflow-hidden rounded-full" />
            </span>
          ))}
          {(pool?.collateralMarkets.length ?? 0) > 5 && (
            <span className="ml-2 text-sm text-white font-normal">+{pool!.collateralMarkets.length - 5}</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <TokenInfo
      token={market?.token}
      tokenPriceOracleAddress={pool?.priceOracleAddress}
      relatedTokens={market ? [market.token] : undefined}
      cells={cells}
      actionVariant={isFinal ? 'secondary' : undefined}
    />
  );
};
