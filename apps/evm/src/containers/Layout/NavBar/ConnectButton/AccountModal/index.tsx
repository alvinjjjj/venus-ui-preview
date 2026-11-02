import { Button, ButtonWrapper } from '@venusprotocol/ui';
import { routes } from 'constants/routing';
import { Link } from 'containers/Link';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useDemo } from 'demo/state';
import { useInterfaceMode } from 'demo/useInterfaceMode';
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
  const { logout } = useDemo();
  const { isLite, setMode } = useInterfaceMode();
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const handleDisconnect = () => {
    logout();
    setMode('lite');

    onClose?.();
  };

  return createPortal(
    <>
      <BodyBackdrop onClick={onClose} className="venus-popup-backdrop" />

      <div className="venus-account-popover fixed top-20 left-4 right-4 z-99999 sm:left-auto sm:right-6">
        <div role="dialog" aria-label="Account" aria-modal="true">
          <div className="venus-account-panel venus-popup-panel w-full max-h-[calc(100dvh-6rem)] bg-background-active p-6 flex flex-col gap-y-6 overflow-auto sm:w-123 rounded-lg border border-blue">
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

              <ClaimRewardsButton
                className={
                  isLite ? 'h-12 bg-dark-blue-active' : 'h-12 bg-dark-blue-active sm:hidden'
                }
              />
            </div>

            <AccountOverview accountAddress={address} showGraph={false} />

            <div className="venus-account-settings flex flex-col gap-y-6">
              <Settings />
              <div className="flex flex-col gap-y-3">
                {isVip && <VipTelegramGroupButton />}

                {isLite && (
                  <ButtonWrapper
                    variant={isFinal ? 'secondary' : 'primary'}
                    material={isFinal ? 'glass' : undefined}
                    className="venus-account-action w-full"
                    asChild
                  >
                    <Link
                      to={{ pathname: routes.dashboard.path, search: '?interface=lite' }}
                      state={{ interfaceMode: 'lite' }}
                      onClick={onClose}
                      noStyle
                    >
                      View Dashboard
                    </Link>
                  </ButtonWrapper>
                )}

                {/* When running in Safe Wallet app, user's wallet should be kept connected at all time */}
                {!config.isSafeApp && (
                  <Button
                    variant="secondary"
                    onClick={handleDisconnect}
                    className="venus-account-action w-full"
                  >
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
      </div>
    </>,
    document.body,
  );
};
