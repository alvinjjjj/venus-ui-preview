import { Button } from '@venusprotocol/ui';
import { useDemo } from 'demo/state';
import { createPortal } from 'react-dom';
import type { Address } from 'viem';

import { BodyBackdrop, Icon } from 'components';
import config from 'config';
import { AccountOverview } from 'containers/AccountOverview';
import { CopyAddressButton } from 'containers/CopyAddressButton';
import { VipTelegramGroupButton } from 'containers/VipTelegramGroupButton';
import { ClaimRewardsButton } from '../../ClaimRewardsButton';
import { Settings } from '../../Settings';
import { UserButton } from '../UserButton';
import './address-glass.css';

export interface AccountModalProps {
  address: Address;
  isVip: boolean;
  isPrime: boolean;
  onClose?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ address, isVip, isPrime, onClose }) => {
  const { logout, setLoginOpen, profile } = useDemo();
  const handleDisconnect = () => {
    logout();

    onClose?.();
  };

  return createPortal(
    <>
      <BodyBackdrop onClick={onClose} className="venus-popup-backdrop" />

      <div className="fixed top-20 left-4 right-4 z-99999 sm:left-auto sm:right-6">
        <div role="dialog" aria-label="Account" aria-modal="true">
          <div className="venus-popup-panel w-full max-h-[calc(100dvh-6rem)] bg-background-active p-6 flex flex-col gap-y-6 overflow-auto sm:w-123 rounded-lg border border-blue">
            <div className="flex flex-col gap-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-x-3">
                  <UserButton
                    address={address}
                    isVip={isVip}
                    isPrime={isPrime}
                    disabled
                    className="venus-account-address-study h-12"
                  />

                  <CopyAddressButton className="shrink-0 text-light-grey" address={address} />
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close account"
                  type="button"
                  className="cursor-pointer text-light-grey hover:text-light-grey-hover"
                >
                  <Icon name="close" className="size-5 text-inherit transition-colors" />
                </button>
              </div>

              <ClaimRewardsButton className="h-12 bg-dark-blue-active sm:hidden" />
            </div>

            <AccountOverview accountAddress={address} showGraph={false} />

            <p className="text-light-grey">
              Demo · {profile === 'prime' ? 'Prime' : 'Normal'} account
            </p>
            <Settings />
            <div className="flex flex-col gap-y-3">
              <Button
                variant="secondary"
                onClick={() => {
                  onClose?.();
                  setLoginOpen(true);
                }}
              >
                Switch demo account
              </Button>

              {isVip && <VipTelegramGroupButton />}

              {/* When running in Safe Wallet app, user's wallet should be kept connected at all time */}
              {!config.isSafeApp && (
                <Button variant="secondary" onClick={handleDisconnect} className="w-full">
                  <div className="flex items-center gap-x-2">
                    <Icon name="connect" className="size-5 text-inherit transition-colors" />

                    <span>Disconnect</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};
