import { cn } from '@venusprotocol/ui';
import { useState } from 'react';

import { Icon, Modal } from 'components';
import { useTranslation } from 'libs/translations';
import { NavButtonWrapper, type NavButtonWrapperProps } from '../NavButtonWrapper';
import { Settings } from '../Settings';
import './settings-glass.css';

export interface SettingsButtonProps {
  className?: string;
  variant?: NavButtonWrapperProps['variant'];
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ className, variant }) => {
  const { t } = useTranslation();

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  return (
    <>
      <NavButtonWrapper
        variant={variant}
        className={cn('size-9 sm:size-12 lg:hidden', className)}
        aria-label="Settings"
        onClick={openSettingsModal}
      >
        <Icon name="gearFull" className={variant === 'secondary' ? 'text-current' : 'text-light-grey'} />
      </NavButtonWrapper>

      <Modal
        isOpen={isSettingsModalOpen}
        handleClose={closeSettingsModal}
        title={t('layout.settingsModal.title')}
        className="venus-settings-modal overflow-visible"
        backdropClassName="venus-settings-backdrop"
      >
        <Settings />
      </Modal>
    </>
  );
};
