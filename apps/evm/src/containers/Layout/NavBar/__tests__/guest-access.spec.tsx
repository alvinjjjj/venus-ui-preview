import { fireEvent, screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import type { Mock } from 'vitest';

import { useStore } from 'containers/Layout/store';
import { useInterfaceModeStore } from 'demo/useInterfaceMode';
import { useAccountAddress } from 'libs/wallet';
import { renderComponent } from 'testUtils/render';
import { NavBar } from '..';

vi.unmock('zustand');
const preview = vi.hoisted(() => ({ mode: 'lite-experiment' }));
vi.mock('demo/GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) => selector(preview),
}));
vi.mock('demo/useLiquidityLightPreview', () => ({ useLiquidityLightPreview: () => false }));
vi.mock('../ChainSelect', () => ({
  ChainSelect: () => <button type="button">Choose chain</button>,
}));
vi.mock('../ClaimRewardsButton', () => ({ ClaimRewardsButton: () => null }));
vi.mock('../ConnectButton', () => ({
  ConnectButton: () => <button type="button">Connect Wallet</button>,
}));
vi.mock('../Settings', () => ({ Settings: () => null }));
vi.mock('../SettingsButton', () => ({ SettingsButton: () => null }));
vi.mock('../useMenuItems', () => ({
  useMenuItems: () => [],
  useDashboardMenuItem: () => ({ label: 'Dashboard' }),
}));
vi.mock('../MenuItem', () => ({
  MenuItem: ({ item }: { item: { label: string } }) => <span>{item.label}</span>,
}));

const Location = () => {
  const location = useLocation();
  return (
    <output data-testid="current-page">
      {location.pathname}
      {location.search} {JSON.stringify(location.state)}
    </output>
  );
};

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterAll(() => vi.unstubAllGlobals());

describe.each(['v1', 'v5', 'lite-experiment'])('%s guest navigation', previewMode => {
  beforeEach(() => {
    preview.mode = previewMode;
    (useAccountAddress as Mock).mockReturnValue({ accountAddress: undefined });
    useInterfaceModeStore.getState().setMode('lite');
    useStore.setState({ openModal: undefined });
  });

  it('lets a guest switch both public surfaces while retaining Connect Wallet and URL parameters', () => {
    renderComponent(
      <>
        <NavBar />
        <Location />
      </>,
      {
        routerInitialEntries: ['/?chainId=56&asset=USDT'],
        routePath: '*',
      },
    );
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Pro' }));
    expect(screen.getByTestId('current-page').textContent).toContain(
      '/liquidity-hubs?chainId=56&asset=USDT',
    );
    expect(screen.getByTestId('current-page').textContent).toContain('"interfaceMode":"pro"');
    expect(screen.getByRole('button', { name: 'Choose chain' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Lite' }));
    expect(screen.getByTestId('current-page').textContent).toContain('/?chainId=56&asset=USDT');
    expect(screen.getByTestId('current-page').textContent).toContain('"interfaceMode":"lite"');
    expect(screen.queryByRole('button', { name: 'Choose chain' })).toBeNull();
    expect(useAccountAddress().accountAddress).toBeUndefined();
  });

  it('opens a direct Pro link with the Pro label, public navigation and a Lite return button', () => {
    renderComponent(
      <>
        <NavBar />
        <Location />
      </>,
      {
        routerInitialEntries: ['/markets/0x123?chainId=56'],
        routePath: '*',
      },
    );
    expect(screen.getByText('Pro', { selector: '.venus-interface-mode-label' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Switch to Lite' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Choose chain' })).toBeTruthy();
    expect(useAccountAddress().accountAddress).toBeUndefined();
  });
});
