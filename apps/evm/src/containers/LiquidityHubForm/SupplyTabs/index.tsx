import { useState } from 'react';
import { useGetPool } from 'clients/api';
import { Spinner, Tabs } from 'components';
import { useChain } from 'hooks/useChain';
import { useGetContractAddress } from 'hooks/useGetContractAddress';
import type { Tab } from 'hooks/useTabs';
import { useTranslation } from 'libs/translations';
import { useAccountAddress } from 'libs/wallet';
import type { LiquidityHub } from 'types';
import { areTokensEqual, calculateCollateralWithdrawLimits } from 'utilities';
import { SupplyWithCollateralForm } from './SupplyWithCollateralForm';
import { SupplyWithWalletForm } from './SupplyWithWalletForm';

export interface SupplyTabsProps {
  liquidityHub: LiquidityHub;
  walletFirst?: boolean;
  onSubmitSuccess?: () => void;
}

export const SupplyTabs: React.FC<SupplyTabsProps> = ({ liquidityHub, onSubmitSuccess, walletFirst = false }) => {
  const [useCoreSupply, setUseCoreSupply] = useState(false);
  const { t } = useTranslation();

  const { accountAddress } = useAccountAddress();
  const { corePoolComptrollerContractAddress } = useChain();

  const { address: liquidityHubMigratorContractAddress } = useGetContractAddress({
    name: 'LiquidityHubMigrator',
  });

  const { data: getPools, isLoading: isGetPoolLoading } = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });

  const corePool = getPools?.pool;

  const corePoolAsset = corePool?.assets.find(asset =>
    areTokensEqual(asset.vToken.underlyingToken, liquidityHub.vhToken.underlyingToken),
  );

  if (isGetPoolLoading) {
    return <Spinner />;
  }

  // TODO: add content
  const walletTabDom = (
    <SupplyWithWalletForm liquidityHub={liquidityHub} onSubmitSuccess={onSubmitSuccess} />
  );

  // Only render the "Supply with wallet balance" tab if there's no corresponding Core pool market
  // or the Liquidity Hub Migrator contract isn't supported on this chain
  if (!corePool || !corePoolAsset || !liquidityHubMigratorContractAddress) {
    return walletTabDom;
  }

  if (walletFirst) {
    const { limitTokens } = calculateCollateralWithdrawLimits({ asset: corePoolAsset, pool: corePool });
    const canTransfer = !!accountAddress && corePoolAsset.userSupplyBalanceTokens.gt(0) && limitTokens.gt(0);
    const showingCoreSupply = canTransfer && useCoreSupply;
    return (
      <div className="space-y-4">
        {canTransfer && (
          <div className="lite-e3-funding-source">
            <span className="text-light-grey">{showingCoreSupply ? 'From Core Pool' : 'From wallet'}</span>
            <button type="button" className="text-blue text-sm" onClick={() => setUseCoreSupply(value => !value)}>
              {showingCoreSupply ? 'Use wallet balance' : 'Transfer from Core Pool'}
            </button>
          </div>
        )}
        {showingCoreSupply ? (
          <SupplyWithCollateralForm
            liquidityHub={liquidityHub}
            onSubmitSuccess={onSubmitSuccess}
            liquidityHubMigratorContractAddress={liquidityHubMigratorContractAddress}
            corePool={corePool}
            corePoolAsset={corePoolAsset}
          />
        ) : walletTabDom}
      </div>
    );
  }

  const tabs: Tab[] = [
    {
      id: 'wallet',
      title: t('liquidityHubForm.supplyTab.walletTabTitle'),
      content: walletTabDom,
    },
    {
      id: 'collateral',
      title: t('liquidityHubForm.supplyTab.collateralTabTitle'),
      content: (
        <SupplyWithCollateralForm
          liquidityHub={liquidityHub}
          onSubmitSuccess={onSubmitSuccess}
          liquidityHubMigratorContractAddress={liquidityHubMigratorContractAddress}
          corePool={corePool}
          corePoolAsset={corePoolAsset}
        />
      ),
    },
  ];

  return <Tabs tabs={tabs} />;
};
