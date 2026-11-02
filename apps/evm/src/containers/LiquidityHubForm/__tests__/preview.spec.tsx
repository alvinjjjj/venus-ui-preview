import { fireEvent, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';

import fakeAccountAddress from '__mocks__/models/address';
import { assetData } from '__mocks__/models/asset';
import { liquidityHubs } from '__mocks__/models/liquidityHubs';
import { poolData } from '__mocks__/models/pools';
import { useGetLiquidityHub, useGetPool } from 'clients/api';
import { useDemo } from 'demo/state';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { useGetContractAddress } from 'hooks/useGetContractAddress';
import { renderComponent } from 'testUtils/render';
import type { LiquidityHub } from 'types';
import { LiquidityHubForm } from '..';

vi.mock('demo/isLocalPreview', () => ({ isLocalPreview: false }));
vi.mock('demo/useInterfaceMode', () => ({ useInterfaceMode: vi.fn() }));
vi.unmock('zustand');

const baseHub = liquidityHubs[0];
const makeHub = (symbol = 'USDT', decimals = 18): LiquidityHub => ({
  ...baseHub,
  vhToken: {
    ...baseHub.vhToken,
    underlyingToken: { ...baseHub.vhToken.underlyingToken, symbol, decimals },
  },
  userWalletBalanceTokens: new BigNumber(100),
  userSupplyBalanceTokens: new BigNumber(20),
  userSupplyCapTokens: new BigNumber(1000),
  userWithdrawCapTokens: new BigNumber(20),
  liquidityTokens: new BigNumber(1000),
  withdrawCapTokens: new BigNumber(1000),
});

const configureHub = (hub: LiquidityHub, coreBalance = 50) => {
  vi.mocked(useGetLiquidityHub).mockReturnValue({ data: { liquidityHub: hub } } as ReturnType<typeof useGetLiquidityHub>);
  vi.mocked(useGetPool).mockReturnValue({
    isLoading: false,
    data: { pool: {
      ...poolData[0],
      assets: [{
        ...assetData[0],
        vToken: { ...assetData[0].vToken, underlyingToken: hub.vhToken.underlyingToken },
        userSupplyBalanceTokens: new BigNumber(coreBalance),
        isCollateralOfUser: false,
      }],
    } },
  });
};

const renderHub = (hub = makeHub()) => {
  configureHub(hub);
  return renderComponent(<LiquidityHubForm vhToken={hub.vhToken} />, { accountAddress: fakeAccountAddress });
};
const amountInput = () => screen.getByRole('spinbutton', { name: 'Token amount' });
const submit = (name = 'Supply') => {
  const button = screen.getAllByRole('button', { name })
    .find(element => element.getAttribute('type') === 'submit');
  if (!button) throw new Error(`Missing ${name} submit button`);
  return button;
};

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});
afterAll(() => vi.unstubAllGlobals());

beforeEach(() => {
  useDemo.setState({ loggedIn: true, loginOpen: false });
  vi.mocked(useInterfaceMode).mockReturnValue({ isLite: true } as ReturnType<typeof useInterfaceMode>);
  vi.mocked(useGetContractAddress).mockReturnValue({ address: fakeAccountAddress });
});

it.each(['USDT', 'USDC', 'U'])('uses both levels of existing tabs for %s and resets amounts between sources', symbol => {
  renderHub(makeHub(symbol));
  expect(screen.getByRole('button', { name: 'Withdraw' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Wallet' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText(`100 ${symbol}`)).toBeVisible();
  fireEvent.change(amountInput(), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Collateral' }));
  expect(amountInput()).toHaveValue(null);
  expect(screen.getByText(`50 ${symbol}`)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'SAFE MAX' }));
  expect(amountInput()).toHaveValue(50);
  fireEvent.click(screen.getByRole('button', { name: 'Withdraw' }));
  expect(screen.queryByRole('button', { name: 'Collateral' })).toBeNull();
  expect(amountInput()).toHaveValue(null);
  expect(screen.getByText(`20 ${symbol}`)).toBeVisible();
});

it('updates separate wallet, Core and Hub simulated balances without a transaction', () => {
  renderHub();
  fireEvent.change(amountInput(), { target: { value: '5' } });
  fireEvent.click(submit());
  expect(screen.getByRole('status')).toHaveTextContent('No transaction was sent.');
  expect(screen.getByText('95 USDT')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Collateral' }));
  fireEvent.change(amountInput(), { target: { value: '3' } });
  fireEvent.click(submit());
  expect(screen.getByText('47 USDT')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Withdraw' }));
  expect(screen.getByText('28 USDT')).toBeVisible();
  fireEvent.change(amountInput(), { target: { value: '8' } });
  fireEvent.click(submit('Withdraw'));
  expect(screen.getByText('20 USDT')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Supply' }));
  expect(screen.getByText('103 USDT')).toBeVisible();
});

it('keeps zero-balance collateral visible but disables SAFE MAX and supply', () => {
  const hub = makeHub('U');
  configureHub(hub, 0);
  renderComponent(<LiquidityHubForm vhToken={hub.vhToken} />, { accountAddress: fakeAccountAddress });
  fireEvent.click(screen.getByRole('button', { name: 'Collateral' }));
  expect(screen.getByText('0 U')).toBeVisible();
  expect(screen.getByRole('button', { name: 'SAFE MAX' })).toBeDisabled();
  fireEvent.change(amountInput(), { target: { value: '1' } });
  expect(submit()).toBeDisabled();
  expect(screen.getByText('Enter an amount within your available balance.')).toBeVisible();
});

it('keeps guest tabs available and opens connection before a simulated action', () => {
  useDemo.setState({ loggedIn: false });
  renderHub();
  fireEvent.click(screen.getByRole('button', { name: 'Collateral' }));
  expect(amountInput()).toBeDisabled();
  expect(screen.getByRole('button', { name: 'SAFE MAX' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }));
  expect(useDemo.getState().loginOpen).toBe(true);
});

it('clears amount and simulated balances when changing token', () => {
  const hub = makeHub();
  const view = renderHub(hub);
  fireEvent.change(amountInput(), { target: { value: '5' } });
  fireEvent.click(submit());
  fireEvent.change(amountInput(), { target: { value: '2' } });
  const nextHub = makeHub('USDC', 6);
  nextHub.vhToken = { ...nextHub.vhToken, address: '0x0000000000000000000000000000000000000002' };
  configureHub(nextHub);
  view.rerender(<LiquidityHubForm vhToken={nextHub.vhToken} />);
  expect(amountInput()).toHaveValue(null);
  expect(screen.getByText('100 USDC')).toBeVisible();
  fireEvent.change(amountInput(), { target: { value: '0.0000001' } });
  expect(amountInput()).toHaveValue(null);
});

it('preserves the Pro preview source layout', () => {
  vi.mocked(useInterfaceMode).mockReturnValue({ isLite: false } as ReturnType<typeof useInterfaceMode>);
  renderHub();
  expect(screen.queryByRole('button', { name: 'Collateral' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Withdraw' })).toBeVisible();
});
