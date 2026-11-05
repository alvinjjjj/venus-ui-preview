import { Modal, type ModalProps, Tabs, TokenIcon } from 'components';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { VaultName } from 'containers/VaultCard/VaultName';
import { useTranslation } from 'libs/translations';
import { VaultCategory, type VenusVault } from 'types';
import { StakeForm } from './StakeForm';
import { WithdrawTab } from './WithdrawTab';
import './slider.css';

export interface VenusVaultModalProps {
  vault: VenusVault;
  handleClose: () => void;
  initialMode?: 'deposit' | 'withdraw';
  isOpen: boolean;
  hidePrimeLeaderboardLink?: boolean;
  title?: ModalProps['title'];
  tabsVariant?: 'primary' | 'secondary';
}

export const VenusVaultModal: React.FC<VenusVaultModalProps> = ({
  vault,
  handleClose,
  isOpen,
  hidePrimeLeaderboardLink,
  title,
  tabsVariant,
}) => {
  const { t } = useTranslation();
  // Lite (Earn and Dashboard): "XVS / XVS Vault" title and underline tabs, like the other Lite modals.
  const { isLite } = useInterfaceMode();
  const liteTitle =
    isLite && vault.category === VaultCategory.GOVERNANCE ? (
      <span className="inline-flex items-center gap-2 font-normal">
        <TokenIcon token={vault.stakedToken} size="md" />
        {vault.stakedToken.symbol} / XVS Vault
      </span>
    ) : undefined;

  const tabs = [
    {
      id: 'stake',
      title: t('vault.modals.stakeTab'),
      content: (
        <StakeForm
          vault={vault}
          onClose={handleClose}
          hidePrimeLeaderboardLink={hidePrimeLeaderboardLink}
        />
      ),
    },
    {
      id: 'withdraw',
      title: t('vault.modals.withdrawTab'),
      content: <WithdrawTab vault={vault} onClose={handleClose} />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      title={title ?? liteTitle ?? <VaultName vault={vault} />}
      className={isLite ? 'venus-lite-vault-modal' : undefined}
    >
      <Tabs tabs={tabs} variant={tabsVariant ?? (isLite ? 'secondary' : undefined)} />
    </Modal>
  );
};
