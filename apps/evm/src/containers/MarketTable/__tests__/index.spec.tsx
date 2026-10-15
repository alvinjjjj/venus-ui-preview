import { fireEvent, screen, waitFor } from '@testing-library/react';
import fakeAccountAddress from '__mocks__/models/address';
import { poolData } from '__mocks__/models/pools';
import BigNumber from 'bignumber.js';
import { useCollateral } from 'hooks/useCollateral';
import { defaultUserChainSettings, useUserChainSettings } from 'hooks/useUserChainSettings';
import { en } from 'libs/translations';
import { Route } from 'react-router';
import type { UserChainSettings } from 'store';
import { renderComponent } from 'testUtils/render';
import type { Pool, TokenAction } from 'types';
import type { Mock } from 'vitest';
import { MarketTable } from '../index';
import type { ColumnKey } from '../types';

vi.mock('hooks/useCollateral');
vi.mock('containers/MarketForm', () => ({
  MarketForm: () => <div data-testid="operation-form">Operation form</div>,
}));

const columns: ColumnKey[] = ['asset', 'supplyApy', 'borrowApy', 'collateral', 'userWalletBalance'];

const fakePausedPool: Pool = {
  ...poolData[0],
  assets: poolData[0].assets.map(asset => ({
    ...asset,
    disabledTokenActions: ['supply', 'borrow'] as TokenAction[],
  })),
};

describe('MarketTable', () => {
  beforeEach(() => {
    (useUserChainSettings as Mock).mockReturnValue([defaultUserChainSettings, vi.fn()]);
  });

  it('renders with pool data', () => {
    const { container } = renderComponent(
      <MarketTable
        assets={poolData[0].assets}
        poolName={poolData[0].name}
        poolComptrollerContractAddress={poolData[0].comptrollerAddress}
        columns={columns}
        marketType="supply"
      />,
    );

    expect(container.textContent).toMatchSnapshot();
  });

  it('hides controls when they are disabled', () => {
    renderComponent(
      <MarketTable
        assets={poolData[0].assets}
        poolName={poolData[0].name}
        poolComptrollerContractAddress={poolData[0].comptrollerAddress}
        columns={columns}
        marketType="supply"
        controls={false}
      />,
    );

    expect(screen.queryByPlaceholderText(en.marketTable.search.placeholder)).toBeNull();
  });

  it('keeps collateral switch clicks in the table and calls the collateral action', async () => {
    const toggleCollateral = vi.fn();
    (useCollateral as Mock).mockReturnValue({ toggleCollateral });
    const asset = {
      ...poolData[0].assets[0],
      isCollateralOfUser: false,
      disabledTokenActions: [] as TokenAction[],
      userCollateralFactor: 1,
    };

    const { container } = renderComponent(
      <MarketTable
        assets={[asset]}
        poolName={poolData[0].name}
        poolComptrollerContractAddress={poolData[0].comptrollerAddress}
        columns={['asset', 'collateral']}
        marketType="supply"
        controls={false}
        rowControl={false}
      />,
      {
        accountAddress: fakeAccountAddress,
        otherRoutes: <Route path="*" element={<div data-testid="navigated">Navigated</div>} />,
      },
    );

    const toggle = container.querySelector('tbody label.venus-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle?.querySelector('input')).not.toBeDisabled();

    fireEvent.click(toggle as HTMLLabelElement);

    await waitFor(() =>
      expect(toggleCollateral).toHaveBeenCalledWith({
        asset,
        poolName: poolData[0].name,
        comptrollerAddress: poolData[0].comptrollerAddress,
      }),
    );
    expect(screen.queryByTestId('navigated')).not.toBeInTheDocument();
  });

  it('changes collateral locally in the New Dashboard demo without calling the contract action', () => {
    const toggleCollateral = vi.fn();
    (useCollateral as Mock).mockReturnValue({ toggleCollateral });
    const asset = {
      ...poolData[0].assets[0],
      isCollateralOfUser: false,
      disabledTokenActions: [] as TokenAction[],
      userCollateralFactor: 1,
    };

    const { container } = renderComponent(
      <MarketTable
        assets={[asset]}
        poolName={poolData[0].name}
        poolComptrollerContractAddress={poolData[0].comptrollerAddress}
        columns={['asset', 'collateral']}
        marketType="supply"
        previewInteractions
        controls={false}
        rowControl={false}
      />,
      { accountAddress: fakeAccountAddress },
    );

    const toggle = container.querySelector<HTMLInputElement>('tbody label.venus-toggle input');
    expect(toggle).not.toBeNull();
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle as HTMLInputElement);

    expect(toggle).toBeChecked();
    expect(toggleCollateral).not.toHaveBeenCalled();
  });

  it('filters by search input', () => {
    const { container } = renderComponent(
      <MarketTable
        assets={poolData[0].assets}
        poolName={poolData[0].name}
        poolComptrollerContractAddress={poolData[0].comptrollerAddress}
        columns={columns}
        marketType="supply"
      />,
    );

    const searchInput = screen.getByPlaceholderText(en.marketTable.search.placeholder);

    fireEvent.change(searchInput, { target: { value: 'busd' } });

    expect(container.textContent).toMatchSnapshot();
  });

  it('shows paused assets toggle if controls are enabled and any asset is paused', () => {
    renderComponent(
      <MarketTable
        assets={fakePausedPool.assets}
        poolName={fakePausedPool.name}
        poolComptrollerContractAddress={fakePausedPool.comptrollerAddress}
        columns={columns}
        marketType="supply"
      />,
    );

    expect(screen.getByText(en.controls.pausedAssetsToggle.label)).toBeInTheDocument();

    // Check empty state is displayed
    expect(screen.getByText(en.marketTable.pausedAssetsPlaceholder.title)).toBeInTheDocument();
  });

  it('shows paused assets if controls are enabled and corresponding toggle is enabled', () => {
    const fakeUserChainSettings: UserChainSettings = {
      ...defaultUserChainSettings,
      showPausedAssets: true,
    };
    (useUserChainSettings as Mock).mockReturnValue([fakeUserChainSettings, vi.fn()]);

    const { container } = renderComponent(
      <MarketTable
        assets={fakePausedPool.assets}
        poolName={fakePausedPool.name}
        poolComptrollerContractAddress={fakePausedPool.comptrollerAddress}
        columns={columns}
        marketType="supply"
      />,
    );

    expect(container.textContent).toMatchSnapshot();
  });

  it('shows user assets only if controls are enabled and corresponding toggle is enabled', () => {
    const mockSetUserChainSettings = vi.fn();

    const fakeUserChainSettings: UserChainSettings = {
      ...defaultUserChainSettings,
      showUserAssetsOnly: true,
    };

    (useUserChainSettings as Mock).mockReturnValue([
      fakeUserChainSettings,
      mockSetUserChainSettings,
    ]);

    // Patch asset to change user wallet balance to 0
    const fakePool: Pool = {
      ...poolData[0],
      assets: poolData[0].assets.map((asset, index) =>
        index === 0
          ? {
              ...asset,
              userWalletBalanceTokens: new BigNumber(0),
              userWalletBalanceCents: new BigNumber(0),
            }
          : asset,
      ),
    };

    const { container } = renderComponent(
      <MarketTable
        assets={fakePool.assets}
        poolName={fakePool.name}
        poolComptrollerContractAddress={fakePool.comptrollerAddress}
        columns={columns}
        marketType="supply"
      />,
      {
        accountAddress: fakeAccountAddress,
      },
    );

    expect(screen.getByText(en.controls.userAssetsOnlyToggle.label)).toBeInTheDocument();

    expect(container.textContent).toMatchSnapshot();

    // Check switching off toggle calls callback correctly
    const [userAssetsOnlyToggle] = screen.getAllByRole('checkbox');

    fireEvent.click(userAssetsOnlyToggle);

    expect(mockSetUserChainSettings).toHaveBeenCalledTimes(1);
    expect(mockSetUserChainSettings).toHaveBeenCalledWith({
      showUserAssetsOnly: !fakeUserChainSettings.showUserAssetsOnly,
    });
  });

  it('opens operation modal when clicking on row control button', async () => {
    const { container } = renderComponent(
      <MarketTable
        assets={poolData[0].assets}
        poolName={poolData[0].name}
        poolComptrollerContractAddress={poolData[0].comptrollerAddress}
        columns={columns}
        marketType="supply"
      />,
    );

    expect(screen.queryByTestId('operation-form')).toBeNull();

    const rowControlButton = container.querySelector('tbody button');
    expect(rowControlButton).not.toBeNull();

    fireEvent.click(rowControlButton as HTMLButtonElement);

    expect(await screen.findByTestId('operation-form')).toBeInTheDocument();
  });

  it('opens the acknowledgement modal instead of the operation form for gated assets', async () => {
    const gatedAssets = poolData[0].assets.map((asset, index) =>
      index === 0
        ? {
            ...asset,
            isGated: true,
          }
        : asset,
    );

    const { container } = renderComponent(
      <MarketTable
        assets={gatedAssets}
        poolName={poolData[0].name}
        poolComptrollerContractAddress={poolData[0].comptrollerAddress}
        columns={columns}
        marketType="supply"
      />,
    );

    fireEvent.click(container.querySelector('tbody button') as HTMLButtonElement);

    expect(await screen.findByText(en.gatedAssetAcknowledgementModal.title)).toBeInTheDocument();
    expect(screen.queryByTestId('operation-form')).not.toBeInTheDocument();
  });
});
