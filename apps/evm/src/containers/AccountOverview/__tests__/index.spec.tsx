import { fireEvent, waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';

import fakeAccountAddress from '__mocks__/models/address';
import { legacyCorePool } from '__mocks__/models/pools';
import { useGetAccountPerformanceHistory } from 'clients/api';
import { defaultUserChainSettings, useUserChainSettings } from 'hooks/useUserChainSettings';
import { en } from 'libs/translations';
import * as storeModule from 'store';
import { renderComponent } from 'testUtils/render';
import { AccountOverview } from '..';
import { testIds } from '../testIds';

vi.mock('hooks/useUserChainSettings');

describe('AccountOverview', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
  });

  it('displays correctly when user is not connected', async () => {
    const { container } = renderComponent(<AccountOverview />);

    expect(container.textContent).toMatchSnapshot();
  });

  it('displays correctly when user is connected', async () => {
    const { container, queryByTestId } = renderComponent(
      <AccountOverview accountAddress={fakeAccountAddress} />,
      {
        accountAddress: fakeAccountAddress,
      },
    );

    await waitFor(() => expect(queryByTestId(testIds.performanceChartPreview)).toBeInTheDocument());

    expect(container.textContent).toMatchSnapshot();
  });

  it('displays correctly when user is connected and accordion is expanded', async () => {
    const { container, queryByTestId, getByText } = renderComponent(
      <AccountOverview accountAddress={fakeAccountAddress} />,
      {
        accountAddress: fakeAccountAddress,
      },
    );

    await waitFor(() => expect(queryByTestId(testIds.performanceChartPreview)).toBeInTheDocument());

    // Expand accordion
    fireEvent.click(getByText(en.dashboard.overview.absolutePerformance).closest('button')!);

    expect(container.textContent).toMatchSnapshot();
  });

  it('hides user balances when doNotShowUserBalances setting is true', async () => {
    const mockSetUserSettings = vi.fn();

    vi.mocked(useUserChainSettings).mockReturnValue([
      { ...defaultUserChainSettings, doNotShowUserBalances: true },
      vi.fn(),
    ]);

    vi.spyOn(storeModule, 'useStore').mockImplementation((selector: any) =>
      selector({
        userSettings: {},
        setUserSettings: mockSetUserSettings,
      }),
    );

    const { container, queryAllByRole } = renderComponent(
      <AccountOverview accountAddress={fakeAccountAddress} />,
      {
        accountAddress: fakeAccountAddress,
      },
    );

    expect(container.textContent).toMatchSnapshot();

    const toggleBalancesButton = queryAllByRole('button').find(
      button => !button.hasAttribute('disabled'),
    );

    if (!toggleBalancesButton) {
      throw new Error('Expected balance visibility toggle button to be enabled');
    }

    fireEvent.click(toggleBalancesButton);

    expect(mockSetUserSettings).toHaveBeenCalledTimes(1);
    expect(mockSetUserSettings.mock.calls[0]).toMatchInlineSnapshot(`
      [
        {
          "settings": {
            "doNotShowUserBalances": false,
          },
        },
      ]
    `);
  });

  it('shows VAI debt beside the other metrics in the split overview without an accordion button', () => {
    const { container } = renderComponent(
      <AccountOverview accountAddress={fakeAccountAddress} splitLayout chartVariant="line" />,
      { accountAddress: fakeAccountAddress },
    );
    const metrics = container.querySelector('.venus-account-performance-cells');
    if (!metrics) throw new Error('Expected overview metrics');

    expect(Array.from(metrics.children).map(cell => cell.firstElementChild?.textContent)).toEqual([
      en.dashboard.overview.todaysChange,
      en.dashboard.overview.absolutePerformance,
      en.dashboard.overview.summary.cellGroup.netApy,
      en.dashboard.overview.summary.cellGroup.dailyEarnings,
      en.dashboard.overview.summary.cellGroup.mintedVai,
    ]);
    expect(metrics.querySelector('.dashboard-overview-minted-vai')).toHaveTextContent('$10');
    expect(metrics.closest('button')).toBeNull();
    expect(metrics.querySelector('[data-tooltip-trigger]')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-overview-chart')).not.toHaveClass(
      'venus-glass-card',
    );
  });

  it('masks both new summary values together with performance values in split layout', () => {
    vi.mocked(useUserChainSettings).mockReturnValue([
      { ...defaultUserChainSettings, doNotShowUserBalances: true },
      vi.fn(),
    ]);
    const { container } = renderComponent(
      <AccountOverview accountAddress={fakeAccountAddress} splitLayout />,
      { accountAddress: fakeAccountAddress },
    );
    const values = container.querySelectorAll('.venus-account-performance-cells > div > .text-p2s');

    expect(values).toHaveLength(5);
    expect(new Set(Array.from(values).map(value => value.textContent)).size).toBe(1);
    expect(values[2].textContent).toMatch(/^\*+$/);
    expect(values[4].textContent).toMatch(/^\*+$/);
  });

  it('shows zero minted VAI when the account has no VAI debt', () => {
    const { container } = renderComponent(
      <AccountOverview
        accountAddress={fakeAccountAddress}
        splitLayout
        previewPool={{
          ...legacyCorePool,
          vai: legacyCorePool.vai && {
            ...legacyCorePool.vai,
            userBorrowBalanceCents: new BigNumber(0),
          },
        }}
      />,
      { accountAddress: fakeAccountAddress },
    );

    expect(container.querySelector('.dashboard-overview-minted-vai')).toHaveTextContent('$0');
  });

  it('keeps the four-metric layout when VAI balances are unavailable', () => {
    const { container, queryByText } = renderComponent(
      <AccountOverview
        accountAddress={fakeAccountAddress}
        splitLayout
        previewPool={{
          ...legacyCorePool,
          vai: undefined,
        }}
      />,
      { accountAddress: fakeAccountAddress },
    );

    expect(queryByText(en.dashboard.overview.summary.cellGroup.mintedVai)).toBeNull();
    expect(container.querySelector('.venus-account-performance-cells')?.children).toHaveLength(4);
  });

  it('uses the compact overview only after connected empty history is confirmed', () => {
    vi.mocked(useGetAccountPerformanceHistory, { partial: true }).mockReturnValueOnce({
      data: { performanceHistory: [], startOfDayNetWorthCents: 0 },
      error: null,
      refetch: vi.fn(),
    });

    const { container, queryByText } = renderComponent(
      <AccountOverview
        accountAddress={fakeAccountAddress}
        splitLayout
        previewPool={{ ...legacyCorePool, vai: undefined }}
      />,
      { accountAddress: fakeAccountAddress },
    );

    expect(container.querySelector('.dashboard-overview-layout')).toHaveClass(
      'dashboard-overview-empty',
    );
    expect(container.querySelector('.venus-account-performance-cells')?.children).toHaveLength(4);
    expect(container.querySelector('.dashboard-overview-chart')).not.toBeInTheDocument();
    expect(queryByText('No performance data yet')).not.toBeInTheDocument();
  });

  it.each([
    { name: 'loading', data: undefined, error: null },
    {
      name: 'error',
      data: { performanceHistory: [], startOfDayNetWorthCents: 0 },
      error: new Error('Performance history unavailable'),
    },
  ])('preserves the chart region during $name instead of treating it as empty', result => {
    vi.mocked(useGetAccountPerformanceHistory, { partial: true }).mockReturnValueOnce({
      data: result.data,
      error: result.error,
      refetch: vi.fn(),
    });

    const { container } = renderComponent(
      <AccountOverview accountAddress={fakeAccountAddress} splitLayout />,
      { accountAddress: fakeAccountAddress },
    );

    expect(container.querySelector('.dashboard-overview-layout')).not.toHaveClass(
      'dashboard-overview-empty',
    );
    expect(container.querySelector('.dashboard-overview-chart')).toBeInTheDocument();
  });
});
