import { cn } from '@venusprotocol/ui';

import { useGetPool } from 'clients/api';
import { Button, ButtonGroup } from 'components';
import './hero-tabs.css';
import { useChain } from 'hooks/useChain';
import { type Tab, useTabs } from 'hooks/useTabs';
import { useTranslation } from 'libs/translations';
import { useAccountAddress, useChainId } from 'libs/wallet';
import type { Asset } from 'types';
import { getBestDistributionApys } from 'utilities';
import { isSunsetChain } from 'utilities/isSunsetChain';
import { GlassCard } from './GlassCard';
import { TabContent } from './TabContent';

export const HeroTabs: React.FC = () => {
  const { t } = useTranslation();

  const { corePoolComptrollerContractAddress } = useChain();
  const { chainId } = useChainId();
  const ignoreDisabledActions = isSunsetChain(chainId);

  // TODO: update to fetch top markets across chains
  const { accountAddress } = useAccountAddress();

  const { data: getPoolData } = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });
  const poolAssets = getPoolData?.pool.assets ?? [];

  let topSupplyAsset: Asset | undefined;
  let topSupplyAssetApys: ReturnType<typeof getBestDistributionApys> | undefined;

  let topBorrowAsset: Asset | undefined;
  let topBorrowAssetApys: ReturnType<typeof getBestDistributionApys> | undefined;

  poolAssets.forEach(asset => {
    const assetApys = getBestDistributionApys({ asset });

    if (
      (ignoreDisabledActions || !asset.disabledTokenActions.includes('supply')) &&
      assetApys.totalSupplyApyPercentage.isGreaterThan(
        topSupplyAssetApys?.totalSupplyApyPercentage || Number.NEGATIVE_INFINITY,
      )
    ) {
      topSupplyAsset = asset;
      topSupplyAssetApys = assetApys;
    }

    if (
      asset.isBorrowable &&
      (ignoreDisabledActions || !asset.disabledTokenActions.includes('borrow')) &&
      assetApys.totalBorrowApyPercentage.isLessThan(
        topBorrowAssetApys?.totalBorrowApyPercentage || Number.POSITIVE_INFINITY,
      )
    ) {
      topBorrowAsset = asset;
      topBorrowAssetApys = assetApys;
    }
  });

  const tabs: Tab[] = [
    {
      title: t('landing.hero.supply'),
      id: 'supply',
      content: topSupplyAsset && <TabContent asset={topSupplyAsset} type="supply" />,
    },
    {
      title: t('landing.hero.borrow'),
      id: 'borrow',
      content: topBorrowAsset && <TabContent asset={topBorrowAsset} type="borrow" />,
    },
  ];

  const { activeTab, setActiveTab } = useTabs({
    tabs,
  });

  return (
    <div className={cn('hidden sm:flex flex-col w-full gap-3 sm:max-w-135.75')}>
      <div className="venus-hero-independent-actions">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            className="flex-1"
            variant={activeTab.id === tab.id ? 'primary' : 'secondary'}
            material={activeTab.id === tab.id ? 'blue-glass' : 'glass'}
            aria-pressed={activeTab.id === tab.id}
            onClick={() => setActiveTab(tab)}
          >
            {tab.title}
          </Button>
        ))}
      </div>
      <GlassCard className="venus-hero-legacy-actions">
        <ButtonGroup
          buttonLabels={tabs.map(({ title }) => title)}
          activeButtonIndex={tabs.findIndex(tab => activeTab.id === tab.id)}
          onButtonClick={index => setActiveTab(tabs[index])}
          fullWidth
          buttonSize="md"
        />
      </GlassCard>

      <GlassCard className="sm:p-6">{activeTab.content}</GlassCard>
    </div>
  );
};
