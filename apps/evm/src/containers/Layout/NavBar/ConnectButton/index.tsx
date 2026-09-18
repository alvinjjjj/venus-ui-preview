import { Button } from 'components';
import { useStore } from 'containers/Layout/store';
import { useDemo } from 'demo/state';
import { useAccountAddress } from 'libs/wallet';
import { AccountModal } from './AccountModal';
import { UserButton } from './UserButton';
export const ConnectButton = () => {
  const { accountAddress } = useAccountAddress();
  const { profile, setLoginOpen } = useDemo();
  const openModal = useStore(state => state.openModal);
  const setOpenModal = useStore(state => state.setOpenModal);
  const isOpen = openModal === 'accountModal';
  if (accountAddress) {
    return (
      <div className="flex items-center gap-2">
        <UserButton
          className="venus-connected-wallet"
          address={accountAddress}
          isPrime={profile === 'prime'}
          isVip={false}
          onClick={() => setOpenModal(isOpen ? undefined : 'accountModal')}
        />
        {isOpen && (
          <AccountModal
            address={accountAddress}
            isPrime={profile === 'prime'}
            isVip={false}
            onClose={() => setOpenModal(undefined)}
          />
        )}
      </div>
    );
  }
  return (
    <Button
      material="blue-glass"
      className="venus-demo-login h-10 px-3 sm:h-12"
      onClick={() => setLoginOpen(true)}
    >
      Connect Wallet
    </Button>
  );
};
