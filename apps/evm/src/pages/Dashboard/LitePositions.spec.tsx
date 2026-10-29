import { fireEvent, screen, within } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { poolData } from '__mocks__/models/pools';
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
vi.mock('./Hubs', () => ({ Hubs: () => <div>Hub positions</div> }));
vi.mock('./BStockPositions', () => ({
  bStockPreviewHealthFactor: 4.2,
  BStockPositions: () => <div>bStock positions</div>,
}));

const core = { ...poolData[0], userHealthFactor: 3.25 };
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

it('shows indicators on unselected borrowed pools, leaving the active pool and Hub plain', () => {
  renderComponent(<LitePositions corePool={core} liquidityHubs={[]} isHubsLoading={false} />, {
    accountAddress: demoAddresses.normal,
  });
  const picker = markets();
  expect(picker.getAllByRole('img')).toHaveLength(2);
  expect(within(picker.getByRole('button', { name: 'Venus Core' })).queryByRole('img')).toBeNull();
  expect(
    within(picker.getByRole('button', { name: 'Liquidity Hub' })).queryByRole('img'),
  ).toBeNull();
  expect(picker.getByRole('button', { name: /^bStock index/ })).toHaveAccessibleName(
    /Health factor: 4.2/,
  );
});

it('moves the hidden indicator with the active pool and retains the Core risk value', () => {
  renderComponent(<LitePositions corePool={core} liquidityHubs={[]} isHubsLoading={false} />, {
    accountAddress: demoAddresses.normal,
  });
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
        liquidityHubs={[]}
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
      liquidityHubs={[]}
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
  renderComponent(<LitePositions corePool={core} liquidityHubs={[]} isHubsLoading={false} />, {
    accountAddress: '0x1111111111111111111111111111111111111111',
  });
  expect(markets().queryAllByRole('img')).toHaveLength(0);
});
