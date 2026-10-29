import { fireEvent, screen, within } from '@testing-library/react';
import { poolData } from '__mocks__/models/pools';
import { vUsdtCorePool } from '__mocks__/models/vTokens';
import { useGetAccountTransactionHistory } from 'clients/api';
import { demoAddresses } from 'demo/state';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useSearchParams } from 'react-router';
import { renderComponent } from 'testUtils/render';
import { ChainId, type Tx } from 'types';
import { Transactions } from '..';

vi.mock('demo/GlassVersions/store', () => ({
  isNewDesignMode: () => false,
  useGlassPreview: (selector: (state: { mode: string }) => unknown) =>
    selector({ mode: 'lite-experiment-v2' }),
}));
vi.mock('demo/state', async importOriginal => ({
  ...(await importOriginal<typeof import('demo/state')>()),
  useDemo: (selector: (state: { loggedIn: boolean }) => unknown) => selector({ loggedIn: true }),
}));
vi.mock('hooks/responsive', async importOriginal => ({
  ...(await importOriginal<typeof import('hooks/responsive')>()),
  useBreakpointUp: () => true,
}));
vi.mock('components', async importOriginal => ({
  ...(await importOriginal<typeof import('components')>()),
  TransactionsList: ({ transactions }: { transactions: Tx[] }) => (
    <ul aria-label="Filtered transactions">
      {transactions.map(transaction => (
        <li key={transaction.hash}>{transaction.hash}</li>
      ))}
    </ul>
  ),
}));
vi.mock('clients/api', async () => {
  const { poolData } = await import('__mocks__/models/pools');
  const { liquidityHubs } = await import('__mocks__/models/liquidityHubs');
  const { vBnb } = await import('__mocks__/models/vTokens');
  const pools = [
    { ...poolData[0], assets: [...poolData[0].assets, { ...poolData[0].assets[0], vToken: vBnb }] },
    ...poolData.slice(1),
  ];
  return {
    useGetAccountTransactionHistory: vi.fn(() => ({
      data: { transactions: [], count: 0 },
      isLoading: false,
    })),
    useGetPools: vi.fn(() => ({ data: { pools }, isLoading: false })),
    useGetLiquidityHubs: vi.fn(() => ({ data: { liquidityHubs }, isLoading: false })),
  };
});

function LocationProbe() {
  const [params] = useSearchParams();
  return <output aria-label="Filters URL">{params.toString()}</output>;
}
const renderTransactions = (query = '') =>
  renderComponent(
    <>
      <Transactions allowDemoPreview />
      <LocationProbe />
    </>,
    {
      accountAddress: demoAddresses.normal,
      chainId: ChainId.BSC_MAINNET,
      routerInitialEntries: [`/?interface=lite&chainId=56${query}`],
    },
  );
const menu = () => within(document.querySelector('.venus-multiselect-panel') as HTMLElement);
const results = () =>
  within(screen.getByRole('list', { name: 'Filtered transactions' })).queryAllByRole('listitem');
const currentParams = () =>
  new URLSearchParams(screen.getByLabelText('Filters URL').textContent ?? '');
const usdtAddress = vUsdtCorePool.address;

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
  vi.clearAllMocks();
  vi.mocked(useIsFeatureEnabled).mockReturnValue(true);
});

it('combines transaction types, keeps the menu open and restores all on reset', () => {
  renderTransactions('&page=3');
  fireEvent.click(screen.getByRole('button', { name: 'All transactions' }));
  fireEvent.click(menu().getByRole('button', { name: 'Repay • Venus Core' }));
  fireEvent.click(menu().getByRole('button', { name: 'Opened • Trade' }));
  expect(screen.getByRole('button', { name: '2 transaction types' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(results()).toHaveLength(3);
  expect(currentParams().getAll('txType')).toEqual(['repay', 'positionOpened']);
  expect(currentParams().get('page')).toBe('1');
  expect(currentParams().get('interface')).toBe('lite');
  expect(currentParams().get('chainId')).toBe('56');
  fireEvent.click(menu().getByRole('button', { name: 'Reset' }));
  expect(results()).toHaveLength(6);
});

it('combines source choices and intersects them with transaction types', () => {
  renderTransactions('&txType=repay&txType=positionOpened');
  fireEvent.click(screen.getByRole('button', { name: 'All sources' }));
  fireEvent.click(menu().getByRole('button', { name: 'Trade' }));
  expect(results()).toHaveLength(2);
  const sourceOption = document.querySelector(
    `.venus-multiselect-panel .venus-multiselect-option:has(img[alt="USDT - ${poolData[0].name}"])`,
  );
  if (!sourceOption) throw new Error('USDT source option is required');
  fireEvent.click(sourceOption);
  expect(screen.getByRole('button', { name: '2 sources' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(results()).toHaveLength(3);
  expect(currentParams().getAll('contractAddress')).toEqual(['trade', usdtAddress]);
  expect(currentParams().getAll('txType')).toEqual(['repay', 'positionOpened']);
  fireEvent.click(menu().getByRole('button', { name: 'Trade', pressed: true }));
  expect(results()).toHaveLength(1);
  fireEvent.click(menu().getByRole('button', { name: 'Reset' }));
  expect(results()).toHaveLength(3);
});

it('restores repeated source values and keeps legacy single-value links usable', () => {
  renderTransactions(`&txType=repay&contractAddress=trade&contractAddress=${usdtAddress}`);
  expect(results()).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: '2 sources' }));
  expect(menu().getAllByRole('button', { pressed: true })).toHaveLength(2);
});

it('passes source selections and the matching page size to the local account-history query', () => {
  renderComponent(<Transactions allowDemoPreview />, {
    accountAddress: '0x1111111111111111111111111111111111111111',
    chainId: ChainId.BSC_MAINNET,
    routerInitialEntries: [`/?txType=supply&txType=borrow&contractAddress=${usdtAddress}&page=2`],
  });
  expect(useGetAccountTransactionHistory).toHaveBeenCalledWith(
    expect.objectContaining({
      types: ['supply', 'borrow'],
      sourceFilters: [usdtAddress],
      page: 1,
      pageSize: 20,
    }),
    expect.any(Object),
  );
});
