import { fireEvent, screen, within } from '@testing-library/react';
import { poolData } from '__mocks__/models/pools';
import { MarketForm } from 'containers/MarketForm';
import { useState } from 'react';
import { renderComponent } from 'testUtils/render';
import { BorrowMarkets } from './BorrowMarkets';
import { aggregateLiteAssets } from './data';

const preview = vi.hoisted(() => ({ mode: 'lite-experiment-v2' }));
vi.mock('demo/GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) => selector(preview),
}));
vi.mock('containers/MarketForm', () => ({
  MarketForm: vi.fn((props: { borrowOnly?: boolean; earnOnly?: boolean }) => (
    <div data-testid="market-form">
      {props.borrowOnly ? 'Borrow / Repay form' : 'Supply / Withdraw form'}
    </div>
  )),
}));

const pool = poolData[0];
// Exercise an acknowledged market without changing production access checks.
const assets = pool.assets.map(asset => ({
  ...asset,
  isGated: false,
  isBorrowable: true,
  disabledTokenActions: [],
}));
const rows = aggregateLiteAssets(assets, [], pool.comptrollerAddress);

function BorrowHarness({ ready = true, loading = false }: { ready?: boolean; loading?: boolean }) {
  const [selected, setSelected] = useState<string>();
  return (
    <BorrowMarkets
      rows={rows}
      ready={ready}
      loading={loading}
      experimental
      selected={selected}
      onSelect={setSelected}
    />
  );
}

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
  vi.clearAllMocks();
});

it('matches Final Earn with four data columns and selectable assets without promoted actions', () => {
  renderComponent(<BorrowHarness />);
  const table = screen.getByRole('table');
  const headers = within(table).getAllByRole('columnheader');
  expect(headers).toHaveLength(4);
  expect(headers[0]).toHaveTextContent('Loan');
  expect(headers[3]).toHaveTextContent('Total Borrow');
  expect(within(table).queryByRole('button', { name: 'Borrow USDC' })).toBeNull();
  const asset = within(table).getByRole('button', { name: 'Compare USDC borrowing' });
  expect(document.querySelector('.lite-e2-promoted-fire')).toBeNull();
  expect(document.querySelector('.lite-e2-borrow-list')).toHaveClass('lite-e2-asset-list');
  expect(asset.closest('tr')?.querySelector('.lite-borrow-apy')).toHaveClass('lite-base-apy');
});

it('opens source selection from the asset without submitting a loan', () => {
  renderComponent(<BorrowHarness />);
  fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: 'Compare USDT borrowing' }));
  expect(screen.getByRole('button', { name: 'Back to Borrow assets from USDT' })).toBeVisible();
  expect(document.querySelector('.lite-e2-borrow-sources')).toBeInTheDocument();
  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(5);
  expect(headers[3]).toHaveTextContent('Collateral');
  expect(headers[4]).toHaveTextContent('Total Borrow');
  expect(screen.queryByText('Preview · Not tradable')).toBeNull();
  expect(MarketForm).not.toHaveBeenCalled();
});

it('retains real Core Borrow and Collateral form routing and adds only a scoped visual hook', () => {
  renderComponent(<BorrowHarness />);
  fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: 'Compare USDT borrowing' }));
  fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: 'Venus Core' }));
  const dialog = screen.getByRole('dialog');
  expect(dialog.querySelector('.lite-e2-borrow-modal')).toHaveClass('venus-popup-panel');
  expect(screen.getByTestId('market-form')).toHaveTextContent('Borrow / Repay form');
  expect(vi.mocked(MarketForm).mock.lastCall?.[0]).toMatchObject({
    borrowOnly: true,
    initialActiveTabId: 'borrow',
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Collateral' }));
  expect(screen.getByTestId('market-form')).toHaveTextContent('Supply / Withdraw form');
  expect(vi.mocked(MarketForm).mock.lastCall?.[0]).toMatchObject({
    earnOnly: true,
    initialActiveTabId: 'supply',
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('keeps preview Borrow / Repay / Collateral disabled after removing Final preview captions', () => {
  renderComponent(<BorrowHarness />);
  fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: 'Compare USDT borrowing' }));
  fireEvent.click(within(screen.getByRole('table')).getByRole('button', { name: 'bStock index' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).queryByText('Preview market · Transactions unavailable')).toBeNull();
  expect(
    within(dialog)
      .getAllByRole('button', { name: 'Borrow' })
      .some(button => button.hasAttribute('disabled')),
  ).toBe(true);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Repay' }));
  expect(
    within(dialog)
      .getAllByRole('button', { name: 'Repay' })
      .some(button => button.hasAttribute('disabled')),
  ).toBe(true);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Collateral' }));
  expect(within(dialog).getByRole('button', { name: 'Supply' })).toBeDisabled();
  expect(MarketForm).not.toHaveBeenCalled();
});

it('preserves the earlier E2 action column under Before', () => {
  preview.mode = 'lite-experiment-v2-legacy';
  renderComponent(<BorrowHarness />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
  expect(within(table).getByRole('button', { name: 'Borrow USDC' })).toHaveAttribute('data-promoted', 'true');
  fireEvent.click(within(table).getByRole('button', { name: 'Borrow USDT' }));
  expect(screen.getByRole('button', { name: 'Back to Borrow assets from USDT' })).toBeVisible();
  expect(screen.getAllByText('Preview · Not tradable').length).toBeGreaterThan(0);
});

it.each(['lite-experiment', 'lite-experiment-v3', 'v1', 'v5'])(
  'keeps the existing four-column Borrow list for %s',
  mode => {
    preview.mode = mode;
    renderComponent(<BorrowHarness />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'Borrow USDT' })).toBeNull();
    expect(document.querySelector('.lite-e2-asset-list')).toBeNull();
  },
);

it('preserves the unavailable and empty result states without fake actions', () => {
  const { unmount } = renderComponent(<BorrowHarness ready={false} />);
  expect(
    screen.getByText('Market data is unavailable. Please refresh to try again.'),
  ).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Borrow USDT' })).toBeNull();
  unmount();
  renderComponent(<BorrowHarness />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Search loan assets' }), {
    target: { value: 'not-a-token' },
  });
  expect(screen.getByText('No borrowable assets found.')).toBeVisible();
});
