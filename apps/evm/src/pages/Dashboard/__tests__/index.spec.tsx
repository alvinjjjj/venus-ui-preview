import { screen } from '@testing-library/react';
import fakeAccountAddress from '__mocks__/models/address';
import { useGetPool } from 'clients/api';
import { demoAddresses } from 'demo/state';
import { renderComponent } from 'testUtils/render';
import { ChainId } from 'types';
import type { Mock } from 'vitest';
import { Dashboard } from '..';

const views = vi.hoisted(() => ({ overview: vi.fn(), positions: vi.fn(), transactions: vi.fn() }));

vi.mock('demo/GlassVersions/store', async importOriginal => ({
  ...(await importOriginal<typeof import('demo/GlassVersions/store')>()),
  useGlassPreview: (selector: (state: { mode: string }) => unknown) =>
    selector({ mode: 'lite-experiment-v2' }),
}));
vi.mock('demo/state', async importOriginal => ({
  ...(await importOriginal<typeof import('demo/state')>()),
  useDemo: (selector: (state: { loggedIn: boolean }) => unknown) => selector({ loggedIn: true }),
}));
vi.mock('containers/AccountOverview', () => ({
  AccountOverview: (props: unknown) => {
    views.overview(props);
    return <div>Shared account overview</div>;
  },
}));
vi.mock('../LitePositions', () => ({
  LitePositions: (props: unknown) => {
    views.positions(props);
    return <h2>Positions</h2>;
  },
}));
vi.mock('../Transactions', () => ({
  Transactions: (props: unknown) => {
    views.transactions(props);
    return <h2 id="lite-transactions-title">Transaction</h2>;
  },
}));

beforeEach(() => vi.clearAllMocks());

it.each(['lite', 'pro'])('uses the same dashboard in %s mode without legacy tabs', mode => {
  renderComponent(<Dashboard />, {
    accountAddress: fakeAccountAddress,
    routerInitialEntries: [`/dashboard?interface=${mode}&chainId=56`],
    routePath: '/dashboard',
  });
  expect(screen.getAllByRole('heading', { name: 'Positions' })).toHaveLength(1);
  expect(screen.getAllByRole('heading', { name: 'Transaction' })).toHaveLength(1);
  expect(screen.queryByRole('tab')).toBeNull();
  expect(views.overview).toHaveBeenCalledWith(
    expect.objectContaining({ splitLayout: true, chartVariant: 'line' }),
  );
  expect(views.transactions).toHaveBeenCalledWith({ allowDemoPreview: true });
  expect(views.overview.mock.lastCall?.[0].previewPool).toBeUndefined();
});

it.each(['lite', 'pro'])('keeps the same funded demo positions in %s mode', mode => {
  renderComponent(<Dashboard />, {
    accountAddress: demoAddresses.normal,
    chainId: ChainId.BSC_MAINNET,
    routerInitialEntries: [`/dashboard?interface=${mode}&chainId=56`],
    routePath: '/dashboard',
  });
  expect(views.overview.mock.lastCall?.[0].previewPool).toBeDefined();
  expect(views.positions).toHaveBeenCalledWith(
    expect.objectContaining({ previewInteractions: true }),
  );
});

it('waits for account data before displaying positions', () => {
  (useGetPool as Mock).mockReturnValue({ data: undefined, isLoading: true });
  renderComponent(<Dashboard />, { accountAddress: fakeAccountAddress });
  expect(views.overview).not.toHaveBeenCalled();
  expect(views.positions).not.toHaveBeenCalled();
});
