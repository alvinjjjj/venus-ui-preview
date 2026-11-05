import { fireEvent, screen, within } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { vaults as vaultFixtures } from '__mocks__/models/vaults';
import { poolData } from '__mocks__/models/pools';
import { liquidityHubs as hubFixtures } from '__mocks__/models/liquidityHubs';
import { demoAddresses } from 'demo/state';
import { renderComponent } from 'testUtils/render';
import { LitePositions } from './LitePositions';

const preview = vi.hoisted(() => ({ mode: 'lite-experiment-v2', loggedIn: true }));
vi.mock('demo/GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: typeof preview) => unknown) => selector(preview),
}));
vi.mock('demo/state', async importOriginal => ({
  ...(await importOriginal<typeof import('demo/state')>()),
  useDemo: (selector: (state: typeof preview) => unknown) => selector(preview),
}));

vi.mock('./Markets/Positions', () => ({ Positions: () => <div>Core positions</div> }));
vi.mock('./Vaults', () => ({ Vaults: () => <div>Vault positions</div> }));
vi.mock('./Hubs', () => ({ Hubs: () => <div>Hub positions</div> }));
vi.mock('./BStockPositions', () => ({
  bStockPreviewHealthFactor: 4.2,
  BStockPositions: () => <div>bStock positions</div>,
}));

const core = { ...poolData[0], userHealthFactor: 3.25 };
const heldHub = hubFixtures[0];
const ordinaryWallet = '0x1111111111111111111111111111111111111111';
const emptyCore = {
  ...core,
  userSupplyBalanceCents: new BigNumber(0),
  userBorrowBalanceCents: new BigNumber(0),
  assets: core.assets.map(asset => ({
    ...asset,
    userSupplyBalanceTokens: new BigNumber(0),
    userBorrowBalanceTokens: new BigNumber(0),
    isCollateralOfUser: false,
  })),
};
const markets = () => within(screen.getByRole('group', { name: 'Position market' }));

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
beforeEach(() => {
  preview.mode = 'lite-experiment-v2';
  preview.loggedIn = true;
});

it('shows Core and bStock risk indicators when Liquidity Hub is the first active market', () => {
  renderComponent(
    <LitePositions corePool={core} liquidityHubs={[heldHub]} isHubsLoading={false} />,
    {
      accountAddress: demoAddresses.normal,
    },
  );
  const picker = markets();
  expect(picker.getAllByRole('img')).toHaveLength(3);
  expect(picker.getByRole('button', { name: /Venus Core.*Health factor: 3.25/ })).toBeTruthy();
  expect(
    within(picker.getByRole('button', { name: 'Liquidity Hub' })).queryByRole('img'),
  ).toBeNull();
  expect(picker.getByRole('button', { name: /^bStock index/ })).toHaveAccessibleName(
    /Health factor: 4.2/,
  );
});

it('moves the hidden indicator with the active pool and retains the Core risk value', () => {
  renderComponent(
    <LitePositions corePool={core} liquidityHubs={[heldHub]} isHubsLoading={false} />,
    {
      accountAddress: demoAddresses.normal,
    },
  );
  const picker = markets();
  fireEvent.click(picker.getByRole('button', { name: /^bStock growth/ }));
  const selected = picker.getByRole('button', { name: 'bStock growth' });
  expect(selected).toHaveAttribute('aria-pressed', 'true');
  expect(within(selected).queryByRole('img')).toBeNull();
  expect(picker.getByRole('button', { name: /^Venus Core/ })).toHaveAccessibleName(
    /Health factor: 3.25/,
  );
  expect(picker.getAllByRole('img')).toHaveLength(2);
});

it.each([undefined, Number.NaN, Number.POSITIVE_INFINITY])(
  'omits an unavailable Core health factor (%s)',
  factor => {
    renderComponent(
      <LitePositions
        corePool={{ ...core, userHealthFactor: factor }}
        liquidityHubs={[heldHub]}
        isHubsLoading={false}
      />,
      {
        accountAddress: demoAddresses.normal,
      },
    );
    const picker = markets();
    fireEvent.click(picker.getByRole('button', { name: 'Liquidity Hub' }));
    expect(
      within(picker.getByRole('button', { name: 'Venus Core' })).queryByRole('img'),
    ).toBeNull();
  },
);

it('does not imply borrowing risk for a supply-only Core position', () => {
  renderComponent(
    <LitePositions
      corePool={{ ...core, userBorrowBalanceCents: new BigNumber(0) }}
      liquidityHubs={[heldHub]}
      isHubsLoading={false}
    />,
    {
      accountAddress: demoAddresses.normal,
    },
  );
  const picker = markets();
  fireEvent.click(picker.getByRole('button', { name: 'Liquidity Hub' }));
  expect(within(picker.getByRole('button', { name: 'Venus Core' })).queryByRole('img')).toBeNull();
});

it('does not attach the simulated bStock risk to an ordinary wallet', () => {
  renderComponent(
    <LitePositions corePool={core} liquidityHubs={[heldHub]} isHubsLoading={false} />,
    {
      accountAddress: '0x1111111111111111111111111111111111111111',
    },
  );
  expect(markets().queryAllByRole('img')).toHaveLength(1);
  expect(markets().getByRole('button', { name: /Venus Core.*Health factor: 3.25/ })).toBeTruthy();
  expect(markets().queryByRole('button', { name: /^bStock/ })).toBeNull();
});

it('hides markets with no holdings from both desktop buttons and phone options', () => {
  const { container } = renderComponent(
    <LitePositions corePool={core} liquidityHubs={[]} isHubsLoading={false} />,
    { accountAddress: ordinaryWallet },
  );
  expect(markets().getAllByRole('button')).toHaveLength(1);
  expect(markets().getByRole('button', { name: 'Venus Core' })).toBeTruthy();

  fireEvent.click(container.querySelector('[data-select-trigger]') as HTMLElement);
  const options = within(document.querySelector('.venus-select-options') as HTMLElement);
  expect(options.getByText('Venus Core')).toBeTruthy();
  expect(options.queryByText('Liquidity Hub')).toBeNull();
  expect(options.queryByText('bStock index')).toBeNull();
  expect(options.queryByText('bStock growth')).toBeNull();
});

it('shows just the Hub when Core has no supplied, borrowed or collateral positions', () => {
  renderComponent(
    <LitePositions corePool={emptyCore} liquidityHubs={[heldHub]} isHubsLoading={false} />,
    { accountAddress: ordinaryWallet },
  );
  expect(markets().getAllByRole('button')).toHaveLength(1);
  expect(markets().getByRole('button', { name: 'Liquidity Hub' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.getByText('Hub positions')).toBeTruthy();
});

it.each(['supply', 'borrow', 'collateral'] as const)('retains a %s-only Core position', type => {
  const asset = {
    ...emptyCore.assets[0],
    userSupplyBalanceTokens: new BigNumber(type === 'borrow' ? 0 : 1),
    userBorrowBalanceTokens: new BigNumber(type === 'borrow' ? 1 : 0),
    isCollateralOfUser: type === 'collateral',
  };
  renderComponent(
    <LitePositions
      corePool={{ ...emptyCore, assets: [asset] }}
      liquidityHubs={[]}
      isHubsLoading={false}
    />,
    { accountAddress: ordinaryWallet },
  );
  expect(markets().getByRole('button', { name: 'Venus Core' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

it('shows the empty state without market controls when balances exist only in the wallet', () => {
  renderComponent(
    <LitePositions
      corePool={emptyCore}
      liquidityHubs={[
        {
          ...heldHub,
          userSupplyBalanceTokens: new BigNumber(0),
          userSupplyBalanceCents: new BigNumber(0),
          userWalletBalanceTokens: new BigNumber(100),
        },
      ]}
      isHubsLoading={false}
    />,
    { accountAddress: ordinaryWallet },
  );
  expect(screen.queryByRole('group', { name: 'Position market' })).toBeNull();
  expect(screen.getByText('No positions yet')).toBeTruthy();
  expect(document.querySelector('[data-select-trigger]')).toBeNull();
});

it('does not treat an empty collateral membership as a funded position', () => {
  renderComponent(
    <LitePositions
      corePool={{
        ...emptyCore,
        assets: emptyCore.assets.map(asset => ({ ...asset, isCollateralOfUser: true })),
      }}
      liquidityHubs={[]}
      isHubsLoading={false}
    />,
    { accountAddress: ordinaryWallet },
  );
  expect(screen.queryByRole('group', { name: 'Position market' })).toBeNull();
  expect(screen.getByText('No positions yet')).toBeTruthy();
});

it('waits for Hub holdings before declaring the account empty', () => {
  const { rerender } = renderComponent(
    <LitePositions corePool={emptyCore} liquidityHubs={[]} isHubsLoading />,
    { accountAddress: ordinaryWallet },
  );
  expect(screen.queryByText('No positions yet')).toBeNull();
  rerender(<LitePositions corePool={emptyCore} liquidityHubs={[]} isHubsLoading={false} />);
  expect(screen.getByText('No positions yet')).toBeTruthy();
});

it('falls back safely when the selected market loses its holdings and keeps that selection', () => {
  const { rerender } = renderComponent(
    <LitePositions corePool={core} liquidityHubs={[heldHub]} isHubsLoading={false} />,
    { accountAddress: ordinaryWallet },
  );
  fireEvent.click(markets().getByRole('button', { name: 'Liquidity Hub' }));
  rerender(<LitePositions corePool={core} liquidityHubs={[]} isHubsLoading={false} />);
  expect(markets().getByRole('button', { name: 'Venus Core' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  rerender(<LitePositions corePool={core} liquidityHubs={[heldHub]} isHubsLoading={false} />);
  expect(markets().getByRole('button', { name: 'Venus Core' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  rerender(<LitePositions corePool={emptyCore} liquidityHubs={[]} isHubsLoading={false} />);
  expect(screen.getByText('No positions yet')).toBeTruthy();
});

it('retains the earlier preview behavior outside Final', () => {
  preview.mode = 'v1';
  renderComponent(<LitePositions corePool={emptyCore} liquidityHubs={[]} isHubsLoading={false} />, {
    accountAddress: ordinaryWallet,
  });
  expect(markets().getAllByRole('button')).toHaveLength(4);
});

it('shows held Vaults and opens their existing cards', () => {
  renderComponent(
    <LitePositions
      corePool={emptyCore}
      liquidityHubs={[]}
      isHubsLoading={false}
      vaults={vaultFixtures}
    />,
    { accountAddress: ordinaryWallet },
  );
  fireEvent.click(markets().getByRole('button', { name: 'Vaults' }));
  expect(screen.getByText('Vault positions')).toBeTruthy();
});

it('hides Vaults when the wallet has no stake', () => {
  renderComponent(
    <LitePositions
      corePool={core}
      liquidityHubs={[]}
      isHubsLoading={false}
      vaults={vaultFixtures.map(vault => ({
        ...vault,
        userStakeBalanceMantissa: new BigNumber(0),
      }))}
    />,
    { accountAddress: ordinaryWallet },
  );
  expect(screen.queryByRole('button', { name: 'Vaults' })).toBeNull();
});

it('does not inject demo bStock or Hub positions for the empty account', () => {
  renderComponent(<LitePositions corePool={emptyCore} liquidityHubs={[]} isHubsLoading={false} />, {
    accountAddress: demoAddresses.empty,
  });
  expect(screen.getByText('No positions yet')).toBeTruthy();
  expect(screen.queryByRole('group', { name: 'Position market' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Explore markets' })).toBeTruthy();
});
