import { fireEvent } from '@testing-library/react';
import fakeAccountAddress from '__mocks__/models/address';
import { BODY_PORTAL_ID } from 'constants/layout';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { Route } from 'react-router';
import { renderComponent } from 'testUtils/render';
import { AccountModal } from '..';

vi.unmock('zustand');
vi.mock('containers/AccountOverview', () => ({ AccountOverview: () => null }));
vi.mock('containers/CopyAddressButton', () => ({ CopyAddressButton: () => null }));
vi.mock('containers/VipTelegramGroupButton', () => ({ VipTelegramGroupButton: () => null }));
vi.mock('containers/Layout/NavBar/ClaimRewardsButton', () => ({ ClaimRewardsButton: () => null }));
vi.mock('containers/Layout/NavBar/Settings', () => ({ Settings: () => null }));
vi.mock('containers/Layout/NavBar/ConnectButton/UserButton', () => ({ UserButton: () => null }));

beforeEach(() => {
  const portal = document.createElement('div');
  portal.id = BODY_PORTAL_ID;
  document.body.appendChild(portal);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  document.getElementById(BODY_PORTAL_ID)?.remove();
  vi.unstubAllGlobals();
});

it('opens the Lite Dashboard from the account link without switching to Pro', () => {
  const onClose = vi.fn();
  const DashboardSurface = () => {
    const { mode } = useInterfaceMode();
    return <h1>{mode} Dashboard</h1>;
  };
  const { getByRole } = renderComponent(
    <AccountModal address={fakeAccountAddress} isPrime={false} isVip={false} onClose={onClose} />,
    {
      accountAddress: fakeAccountAddress,
      otherRoutes: <Route path="/dashboard" element={<DashboardSurface />} />,
    },
  );
  const link = getByRole('link', { name: 'View Dashboard' });
  expect(link.getAttribute('href')).toContain('interface=lite');
  fireEvent.click(link);
  expect(getByRole('heading', { name: 'lite Dashboard' })).toBeInTheDocument();
  expect(onClose).toHaveBeenCalledTimes(1);
});
