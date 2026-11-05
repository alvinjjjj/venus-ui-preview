vi.unmock('zustand');
import { getAccountPerformanceHistory } from 'clients/api/queries/getAccountPerformanceHistory';
import { getAccountTransactionHistory } from 'clients/api/queries/getAccountTransactionHistory';
import { demoAddresses, isEmptyDemoAddress, isFundedDemoAddress, useDemo } from '../state';

it('persists an empty demo session separately from funded accounts', () => {
  useDemo.getState().login('empty');
  expect(useDemo.getState().loggedIn).toBe(true);
  expect(sessionStorage.getItem('venus-demo-session')).toBe('empty');
  expect(isEmptyDemoAddress(demoAddresses.empty)).toBe(true);
  expect(isFundedDemoAddress(demoAddresses.empty)).toBe(false);
  useDemo.getState().login('normal');
  expect(isFundedDemoAddress(demoAddresses.normal)).toBe(true);
  useDemo.getState().logout();
});

it('has no chart history in any period while normal accounts retain data', async () => {
  for (const period of ['month', 'halfyear', 'year'] as const) {
    const input = { accountAddress: demoAddresses.empty, chainId: 56 as const, period };
    expect(await getAccountPerformanceHistory(input)).toEqual({
      startOfDayNetWorthCents: 0,
      performanceHistory: [],
    });
    expect(
      (await getAccountPerformanceHistory({ ...input, accountAddress: demoAddresses.normal }))
        .performanceHistory.length,
    ).toBeGreaterThan(0);
  }
});

it('does not leak sample transactions into an empty account', async () => {
  expect(
    await getAccountTransactionHistory({
      accountAddress: demoAddresses.empty,
      chainId: 56,
      pools: [],
      liquidityHubs: [],
      types: ['supply'],
    }),
  ).toEqual({ transactions: [], count: 0 });
});
