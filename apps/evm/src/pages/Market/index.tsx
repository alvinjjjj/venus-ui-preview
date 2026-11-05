import '../LiquidityHub/detail.css';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useParams } from 'react-router';
import type { Address } from 'viem';

import { MarketPageGrid, Page as PageComp } from 'components';
import { routes } from 'constants/routing';
import { GatedAssetAcknowledgementModal } from 'containers/GatedAssetAcknowledgementModal';
import { MarketForm } from 'containers/MarketForm';
import MarketLoader from 'containers/MarketLoader';
import { useNavigate } from 'hooks/useNavigate';
import AssetWarning from './AssetWarning';
import { EModeInfo } from './EModeInfo';
import { InterestRateChart } from './InterestRateChart';
import { MarketHistory } from './MarketHistory';
import MarketInfo from './MarketInfo';

const Page: React.FC = () => {
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const { vTokenAddress, poolComptrollerAddress } = useParams<{
    vTokenAddress: Address;
    poolComptrollerAddress: Address;
  }>();

  const { navigate } = useNavigate();

  return (
    <PageComp>
      <MarketLoader poolComptrollerAddress={poolComptrollerAddress} vTokenAddress={vTokenAddress}>
        {({ asset, pool }) => (
          <div className={!pool.isIsolated ? 'venus-core-market-page' : undefined}>
            <AssetWarning
              token={asset.vToken.underlyingToken}
              pool={pool}
              asset={asset}
              className="mb-6"
            />

            <MarketPageGrid
              form={
                <MarketForm
                  poolComptrollerAddress={pool.comptrollerAddress}
                  vToken={asset.vToken}
                  navType="searchParam"
                  actionTabsVariant={isFinal && !pool.isIsolated ? 'secondary' : undefined}
                />
              }
              content={
                <div className="space-y-6">
                  <MarketHistory asset={asset} />

                  <InterestRateChart asset={asset} isIsolatedPoolMarket={pool.isIsolated} />

                  <EModeInfo
                    eModeGroups={pool.eModeGroups}
                    token={asset.vToken.underlyingToken}
                    pool={pool}
                  />

                  <MarketInfo asset={asset} />
                </div>
              }
            />

            {asset.isGated && (
              <GatedAssetAcknowledgementModal onReject={() => navigate(routes.landing.path)} />
            )}
          </div>
        )}
      </MarketLoader>
    </PageComp>
  );
};

export default Page;
