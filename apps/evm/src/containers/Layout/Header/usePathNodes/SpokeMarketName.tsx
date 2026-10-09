import { useTranslation } from 'libs/translations';
import { useSpokeMarket } from 'pages/SpokeMarket/useSpokeMarket';

const SpokeMarketName: React.FC = () => {
  const { t } = useTranslation();
  const { pool, market } = useSpokeMarket();

  if (!pool || !market) return null;

  return <>{t('spoke.market.breadcrumb', { symbol: market.token.symbol, poolName: pool.name })}</>;
};

export default SpokeMarketName;
