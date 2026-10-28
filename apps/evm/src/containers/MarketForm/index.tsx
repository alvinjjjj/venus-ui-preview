import type { Address } from 'viem';

import { type ModalProps, Tabs } from 'components';
import AssetAccessor from 'containers/AssetAccessor';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import type { Tab, TabNavType } from 'hooks/useTabs';
import { useTranslation } from 'libs/translations';
import type { VToken } from 'types';
import BoostForm from './BoostForm';
import BorrowForm from './BorrowForm';
import { Repay } from './Repay';
import SupplyForm from './SupplyForm';
import WithdrawForm from './WithdrawForm';
import rocketIconSrc from './rocket.svg';

export interface MarketFormProps {
  collateralSelector?: React.ReactElement;
  supplyAssetSelector?: React.ReactElement;
  supplyMarketDetails?: React.ReactNode;
  supplyCardLayout?: boolean;
  supplyMarketName?: string;
  supplyOnly?: boolean;
  actionOnly?: 'supply' | 'withdraw' | 'borrow' | 'repay';
  borrowPenalty?: React.ReactNode;
  vToken: VToken;
  poolComptrollerAddress: Address;
  initialActiveTabId?: string;
  onSubmitSuccess?: ModalProps['handleClose'];
  navType?: TabNavType;
  earnOnly?: boolean;
  borrowOnly?: boolean;
  compactEarn?: boolean;
  inlineHeader?: boolean;
  actionTabsVariant?: 'primary' | 'secondary';
}

export const MarketForm: React.FC<MarketFormProps> = ({
  onSubmitSuccess,
  vToken,
  poolComptrollerAddress,
  initialActiveTabId,
  navType,
  earnOnly = false,
  borrowOnly = false,
  compactEarn = false,
  inlineHeader = false,
  actionTabsVariant,
  collateralSelector,
  supplyAssetSelector,
  supplyMarketDetails,
  supplyCardLayout = false,
  supplyMarketName,
  supplyOnly = false,
  actionOnly,
  borrowPenalty,
}) => {
  const { t } = useTranslation();

  const isLeveragedPositionsFeatureEnabled = useIsFeatureEnabled({
    name: 'leveragedPositions',
  });

  const tabs: Tab[] = [
    {
      id: 'supply',
      title: t('marketForm.supplyTabTitle'),
      content: (
        <AssetAccessor
          vToken={vToken}
          poolComptrollerAddress={poolComptrollerAddress}
          action="supply"
        >
          {({ asset, pool }) => (
            <SupplyForm
              collateralSelector={supplyAssetSelector ?? collateralSelector}
              marketDetails={supplyMarketDetails}
              cardLayout={supplyCardLayout}
              marketName={supplyMarketName}
              asset={asset}
              pool={pool}
              onSubmitSuccess={onSubmitSuccess}
              compact={compactEarn}
              streamlined={inlineHeader}
            />
          )}
        </AssetAccessor>
      ),
    },
    {
      id: 'withdraw',
      title: t('marketForm.withdrawTabTitle'),
      content: (
        <AssetAccessor
          vToken={vToken}
          poolComptrollerAddress={poolComptrollerAddress}
          action="withdraw"
        >
          {({ asset, pool }) => (
            <WithdrawForm
              collateralSelector={collateralSelector}
              asset={asset}
              pool={pool}
              onSubmitSuccess={onSubmitSuccess}
              compact={compactEarn}
            />
          )}
        </AssetAccessor>
      ),
    },
    {
      id: 'borrow',
      title: t('marketForm.borrowTabTitle'),
      content: (
        <AssetAccessor
          vToken={vToken}
          poolComptrollerAddress={poolComptrollerAddress}
          action="borrow"
        >
          {({ asset, pool }) => (
            <BorrowForm
              penalty={borrowPenalty}
              asset={asset}
              pool={pool}
              onSubmitSuccess={onSubmitSuccess}
              hideEModeBanner={borrowOnly}
            />
          )}
        </AssetAccessor>
      ),
    },
  ];

  if (isLeveragedPositionsFeatureEnabled) {
    tabs.push({
      id: 'boost',
      title: (
        <div className="flex items-center gap-x-1">
          <img src={rocketIconSrc} className="size-4" alt={t('marketForm.boostTabAltText')} />

          <span className="text-[#65EEE0]">{t('marketForm.boostTabTitle')}</span>
        </div>
      ),
      content: (
        <AssetAccessor
          vToken={vToken}
          poolComptrollerAddress={poolComptrollerAddress}
          action="boost"
        >
          {({ asset, pool }) => (
            <BoostForm asset={asset} pool={pool} onSubmitSuccess={onSubmitSuccess} />
          )}
        </AssetAccessor>
      ),
    });
  }

  tabs.push({
    id: 'repay',
    title: t('marketForm.repayTab.title'),
    content: (
      <AssetAccessor vToken={vToken} poolComptrollerAddress={poolComptrollerAddress} action="repay">
        {({ asset, pool }) => (
          <Repay
            pool={pool}
            asset={asset}
            onSubmitSuccess={onSubmitSuccess}
            compactSourceSelector={borrowOnly || actionOnly === 'repay'}
          />
        )}
      </AssetAccessor>
    ),
  });

  return (
    <Tabs
      hideHeader={supplyOnly || !!actionOnly}
      className={compactEarn ? 'lite-compact-market-tabs' : inlineHeader ? 'lite-single-market-tabs' : undefined}
      headerClassName={compactEarn || inlineHeader ? 'lite-compact-market-switch' : undefined}
      tabs={
        actionOnly ? tabs.filter(tab => tab.id === actionOnly) : supplyOnly ? tabs.filter(tab => tab.id === 'supply') : earnOnly
          ? tabs.filter(tab => tab.id === 'supply' || tab.id === 'withdraw')
          : borrowOnly
            ? tabs.filter(tab => tab.id === 'borrow' || tab.id === 'repay')
            : tabs
      }
      initialActiveTabId={initialActiveTabId}
      navType={navType}
      variant={actionTabsVariant ?? (earnOnly || borrowOnly ? 'primary' : 'secondary')}
      buttonClassName={earnOnly || borrowOnly ? 'font-normal' : undefined}
    />
  );
};
