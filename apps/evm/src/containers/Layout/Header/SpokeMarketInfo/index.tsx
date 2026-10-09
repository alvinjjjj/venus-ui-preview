import { type CellProps, ImgGroup } from 'components';
import { useTranslation } from 'libs/translations';
import { useSpokeMarket } from 'pages/SpokeMarket/useSpokeMarket';
import { formatCentsToReadableValue } from 'utilities';
import { TokenInfo } from '../TokenInfo';

export const SpokeMarketInfo = () => {
  const { t } = useTranslation();
  const { pool, market } = useSpokeMarket();

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
        <ImgGroup
          className="h-full"
          imgSrcs={pool?.collateralMarkets.map(collateral => collateral.token.iconSrc) ?? []}
        />
      ),
    },
  ];

  return (
    <TokenInfo
      token={market?.token}
      tokenPriceOracleAddress={pool?.priceOracleAddress}
      relatedTokens={market ? [market.token] : undefined}
      cells={cells}
    />
  );
};
