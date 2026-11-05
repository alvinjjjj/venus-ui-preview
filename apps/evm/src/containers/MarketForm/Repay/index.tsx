import { useState } from 'react';
import { NoticeWarning, Select, Tabs } from 'components';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import type { Tab } from 'hooks/useTabs';
import { useTranslation } from 'libs/translations';
import type { Asset, Pool } from 'types';
import { RepayWithCollateralForm } from './RepayWithCollateralForm';
import RepayWithWalletBalanceForm from './RepayWithWalletBalanceForm';

export interface RepayProps {
  asset: Asset;
  pool: Pool;
  onSubmitSuccess?: () => void;
  compactSourceSelector?: boolean;
}

export const Repay: React.FC<RepayProps> = ({
  asset,
  pool,
  onSubmitSuccess,
  compactSourceSelector = false,
}) => {
  const { t } = useTranslation();
  const [source, setSource] = useState('repayWithWalletBalance');

  const isRepayWithCollateralFeatureEnabled = useIsFeatureEnabled({
    name: 'repayWithCollateral',
  });

  // Lite: repay only the token of the row the user opened, from the wallet.
  // No "Repay from" selector and no repay-with-collateral. Pro unchanged.
  const { isLite } = useInterfaceMode();

  const displayTabs =
    !isLite &&
    isRepayWithCollateralFeatureEnabled &&
    !asset.disabledTokenActions.includes('repayWithCollateral');

  const repayWithWalletBalanceFormDom = (
    <RepayWithWalletBalanceForm asset={asset} pool={pool} onSubmitSuccess={onSubmitSuccess} />
  );

  if (!displayTabs) {
    return repayWithWalletBalanceFormDom;
  }

  const hasCollateral = pool.userBorrowLimitCents?.isGreaterThan(0);

  const tabs: Tab[] = [
    {
      id: 'repayWithWalletBalance',
      title: t('marketForm.repayTab.walletBalanceTabTitle'),
      content: repayWithWalletBalanceFormDom,
    },
    {
      id: 'repayWithCollateral',
      title: t('marketForm.repayTab.collateralTabTitle'),
      content: hasCollateral ? (
        <RepayWithCollateralForm pool={pool} asset={asset} onSubmitSuccess={onSubmitSuccess} />
      ) : (
        <NoticeWarning description={t('marketForm.repayTab.noCollateralWarning')} />
      ),
    },
  ];

  if (compactSourceSelector) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-normal text-light-grey">Repay from</span>
          <Select
            aria-label="Repay from"
            menuPosition="right"
            className="lite-loan-filter w-40"
            buttonClassName="h-10 rounded-lg font-normal"
            dropdownClassName="lite-loan-options"
            optionClassName="px-4 h-10 font-normal"
            value={source}
            onChange={value => setSource(String(value))}
            options={tabs.map(tab => ({ value: tab.id, label: tab.title }))}
          />
        </div>
        {tabs.find(tab => tab.id === source)?.content}
      </div>
    );
  }

  return <Tabs tabs={tabs} className="space-y-4" />;
};
