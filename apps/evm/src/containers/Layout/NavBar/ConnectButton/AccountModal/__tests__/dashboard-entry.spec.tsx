import { cleanup, fireEvent } from '@testing-library/react';
import fakeAccountAddress from '__mocks__/models/address';
import { BODY_PORTAL_ID } from 'constants/layout';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useInterfaceMode, useInterfaceModeStore } from 'demo/useInterfaceMode';
import { Route } from 'react-router';
import { renderComponent } from 'testUtils/render';
import { AccountModal } from '..';

vi.unmock('zustand');
vi.mock('containers/AccountOverview', () => ({
  AccountOverview: () => <p>Compact account overview</p>,
}));
vi.mock('containers/CopyAddressButton', () => ({ CopyAddressButton: () => null }));
vi.mock('containers/VipTelegramGroupButton', () => ({ VipTelegramGroupButton: () => null }));
vi.mock('containers/Layout/NavBar/ClaimRewardsButton', () => ({
  ClaimRewardsButton: () => <button type="button">Claim rewards</button>,
}));
vi.mock('containers/Layout/NavBar/Settings', () => ({ Settings: () => null }));
vi.mock('containers/Layout/NavBar/ChainSelect', () => ({
  ChainSelect: () => <button type="button">Choose chain</button>,
}));
vi.mock('containers/Layout/NavBar/ConnectButton/UserButton', () => ({ UserButton: () => null }));

beforeEach(() => {
  useGlassPreview.getState().setMode('lite-experiment-v2');
  useInterfaceModeStore.getState().setMode('lite');
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
  cleanup();
  useGlassPreview.getState().setMode('v1');
  useInterfaceModeStore.getState().setMode('lite');
  document.getElementById(BODY_PORTAL_ID)?.remove();
  vi.unstubAllGlobals();
});

it.each([
  { mode: 'lite' as const, isPrime: false, isVip: false },
  { mode: 'pro' as const, isPrime: false, isVip: false },
  { mode: 'lite' as const, isPrime: true, isVip: true },
  { mode: 'pro' as const, isPrime: true, isVip: true },
])(
  'keeps $mode Account separate and links to the Dashboard for Prime=$isPrime',
  ({ mode, isPrime, isVip }) => {
    useInterfaceModeStore.getState().setMode(mode);
    const onClose = vi.fn();
    const DashboardSurface = () => {
      const { mode } = useInterfaceMode();
      return <h1>{mode} Dashboard page</h1>;
    };
    const { getByRole, queryByRole, getByText } = renderComponent(
      <AccountModal
        address={fakeAccountAddress}
        isPrime={isPrime}
        isVip={isVip}
        onClose={onClose}
      />,
      {
        accountAddress: fakeAccountAddress,
        routePath: '*',
        routerInitialEntries: [mode === 'pro' ? '/liquidity-hubs?chainId=56' : '/?chainId=56'],
        otherRoutes: <Route path="/dashboard" element={<DashboardSurface />} />,
      },
    );
    const panel = getByRole('dialog', { name: 'Account' });
    expect(panel).toContainElement(getByText('Compact account overview'));
    expect(queryByRole('heading', { name: 'Summary' })).toBeNull();
    expect(panel.querySelector('.lite-dashboard')).toBeNull();
    expect(panel.querySelector('.venus-account-panel')).toHaveClass('sm:w-123');
    expect(getByRole('button', { name: 'Choose chain' })).toBeInTheDocument();
    expect(queryByRole('button', { name: 'Claim rewards' })).toBeNull();
    const link = getByRole('link', { name: 'View Dashboard' });
    expect(link.getAttribute('href')).toContain(`interface=${mode}`);
    fireEvent.click(link);
    expect(getByRole('heading', { name: `${mode} Dashboard page` })).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useInterfaceModeStore.getState().mode).toBe(mode);
  },
);
