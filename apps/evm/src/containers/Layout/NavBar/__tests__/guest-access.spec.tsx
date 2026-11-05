import { fireEvent, screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import type { Mock } from 'vitest';

import { PAGE_CONTAINER_ID } from 'constants/layout';
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
vi.mock('../SettingsButton', () => ({
  SettingsButton: () => <button type="button" aria-label="Settings" />,
}));
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

describe.each(['v1', 'v5', 'lite-experiment', 'lite-experiment-v2', 'lite-experiment-v3'])(
  '%s guest navigation',
  previewMode => {
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
  },
);

describe('Final Pro scroll glass', () => {
  beforeEach(() => {
    preview.mode = 'lite-experiment-v2';
    (useAccountAddress as Mock).mockReturnValue({ accountAddress: undefined });
    useInterfaceModeStore.getState().setMode('pro');
    useStore.setState({ openModal: undefined });
  });

  it.each(['lite', 'pro'] as const)(
    'keeps the shared dashboard and filters when leaving %s',
    mode => {
      renderComponent(
        <>
          <NavBar />
          <Location />
        </>,
        {
          routerInitialEntries: [`/dashboard?interface=${mode}&chainId=56&page=2&txType=repay`],
          routePath: '*',
        },
      );
      const target = mode === 'lite' ? 'Pro' : 'Lite';
      fireEvent.click(screen.getByRole('button', { name: `Switch to ${target}` }));
      expect(screen.getByTestId('current-page').textContent).toContain(
        `/dashboard?interface=${target.toLowerCase()}&chainId=56&page=2&txType=repay`,
      );
    },
  );

  it.each(['lite', 'pro'] as const)('offers Settings before connecting a wallet in %s', mode => {
    useInterfaceModeStore.getState().setMode(mode);
    renderComponent(<NavBar />, {
      routerInitialEntries: ['/?chainId=56'],
      routePath: '*',
    });
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('keeps chain and settings out of the connected responsive menu', () => {
    (useAccountAddress as Mock).mockReturnValue({
      accountAddress: '0x000000000000000000000000000000000000dEaD',
    });
    const { container } = renderComponent(<NavBar />, {
      routerInitialEntries: ['/liquidity-hubs?chainId=56'],
      routePath: '*',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(container.querySelector('.venus-mobile-menu-footer')).toBeNull();
    expect(container.querySelector('.venus-mobile-chain')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Settings' })).toBeNull();
  });

  it('keeps Dashboard out of both the desktop bar and mobile menu in Final', () => {
    renderComponent(<NavBar />, {
      routerInitialEntries: ['/markets/0x123?chainId=56'],
      routePath: '*',
    });

    expect(screen.queryByText('Dashboard')).toBeNull();
    expect(screen.getByRole('button', { name: 'Switch to Lite' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Choose chain' })).toBeTruthy();
  });

  it('tracks the app scroll container and clears the glass when returning to the top', () => {
    renderComponent(
      <>
        <NavBar />
        <div id={PAGE_CONTAINER_ID} data-testid="page-scroll" />
      </>,
      {
        routerInitialEntries: ['/markets/0x123?chainId=56'],
        routePath: '*',
      },
    );
    const header = screen.getByRole('navigation');
    const page = screen.getByTestId('page-scroll');
    expect(header).toHaveAttribute('data-header-scrolled', 'false');
    fireEvent.scroll(window);
    expect(header).toHaveAttribute('data-header-scrolled', 'false');
    fireEvent.scroll(page, { target: { scrollTop: 96 } });
    expect(header).toHaveAttribute('data-header-scrolled', 'true');
    fireEvent.scroll(page, { target: { scrollTop: 0 } });
    expect(header).toHaveAttribute('data-header-scrolled', 'false');
  });

  it('reads a restored scroll offset on mount', () => {
    const page = document.createElement('div');
    page.id = PAGE_CONTAINER_ID;
    page.scrollTop = 96;
    document.body.appendChild(page);
    try {
      renderComponent(<NavBar />, {
        routerInitialEntries: ['/liquidity-hubs?chainId=56'],
        routePath: '*',
      });
      expect(screen.getByRole('navigation')).toHaveAttribute('data-header-scrolled', 'true');
    } finally {
      page.remove();
    }
  });

  it('marks the Lite header as scrolled so its approved subtle blur can appear', () => {
    useInterfaceModeStore.getState().setMode('lite');
    renderComponent(
      <>
        <NavBar />
        <div id={PAGE_CONTAINER_ID} data-testid="page-scroll" />
      </>,
      {
        routerInitialEntries: ['/?chainId=56'],
        routePath: '*',
      },
    );
    fireEvent.scroll(screen.getByTestId('page-scroll'), { target: { scrollTop: 96 } });
    expect(screen.getByRole('navigation')).toHaveAttribute('data-header-scrolled', 'true');
  });
});
