import BigNumber from 'bignumber.js';
import './materials.css';
import './original.css';
import '../LiteMarkets/entrance.css';
import './pro.css';
import '../LiteMarkets/trust-sections.css';

import { useGetLiquidityHubs } from 'clients/api';
import { type CellProps, Page, PageStatHeader, Wrapper } from 'components';
import { useTranslation } from 'libs/translations';
import { useAccountAddress } from 'libs/wallet';
import { formatCentsToReadableValue } from 'utilities';
import { LiquidityHubTable } from './LiquidityHubTable';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { GhostBackground } from '../LiteMarkets/GhostBackground';
import { MarketTotals } from '../LiteMarkets/MarketTotals';

const LiquidityHubs: React.FC = () => {
  const { accountAddress } = useAccountAddress();
  const { supportsModes, isLite } = useInterfaceMode();
  const isPro = supportsModes && !isLite;

  const { t } = useTranslation();
  const {
    data: getLiquidityHubsData = {
      liquidityHubs: [],
    },
    isLoading,
  } = useGetLiquidityHubs({
    accountAddress,
  });
  const { liquidityHubs } = getLiquidityHubsData;

  const { supplyBalanceCents, liquidityCents, count } = liquidityHubs.reduce(
    (acc, liquidityHub) => ({
      ...acc,
      supplyBalanceCents: acc.supplyBalanceCents.plus(liquidityHub.supplyBalanceCents),
      liquidityCents: acc.liquidityCents.plus(liquidityHub.liquidityCents),
      count: acc.count + 1,
    }),
    {
      supplyBalanceCents: new BigNumber(0),
      liquidityCents: new BigNumber(0),
      count: 0,
    },
  );

  const cells: CellProps[] = [
    {
      label: t('liquidityHubs.stats.totalSupply'),
      value: formatCentsToReadableValue({
        value: supplyBalanceCents,
      }),
    },
    {
      label: t('liquidityHubs.stats.totalLiquidity'),
      value: formatCentsToReadableValue({
        value: liquidityCents,
      }),
    },
    {
      label: t('liquidityHubs.stats.hubs'),
      value: count,
    },
  ];

  return (
    <Page>
      <div className={isPro ? 'pro-hub-ambient' : undefined}>
        {isPro && <GhostBackground />}
        {/* Pro uses the default Wrapper (max-w-7xl + responsive px) so its side margins match Venus Core. */}
        <Wrapper className="pt-5 sm:pt-10">
          <div
            className={`liquidity-hubs-page space-y-5 sm:space-y-12${
              isPro ? ' liquidity-hubs-pro' : ''
            }`}
          >
            {isPro ? (
              <div className="liquidity-hubs-stat-header lite-enter flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                <div className="xl:max-w-140">
                  <h1 className="venus-page-title">{t('liquidityHubs.header')}</h1>
                  <p className="venus-page-subtitle">{t('liquidityHubs.description')}</p>
                </div>
                <MarketTotals />
              </div>
            ) : (
              <PageStatHeader
                className="liquidity-hubs-stat-header"
                title={t('liquidityHubs.header')}
                description={t('liquidityHubs.description')}
                cells={cells}
              />
            )}

            <LiquidityHubTable
              className={`liquidity-hubs-table${isPro ? ' lite-enter lite-enter--markets' : ''}`}
              data={liquidityHubs}
              isFetching={isLoading}
            />
          </div>
        </Wrapper>
      </div>
      {/* Safety / Community sections live on About Us; Pro keeps only Trusted by many + footer. */}
    </Page>
  );
};

export default LiquidityHubs;
