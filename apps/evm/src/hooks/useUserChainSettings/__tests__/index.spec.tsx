import fakeAccountAddress from '__mocks__/models/address';
import { useAccountAddress } from 'libs/wallet';
import type { UserChainSettings } from 'store';
import { renderHook as renderHookWithContext } from 'testUtils/render';
import { ChainId } from 'types';
import type { Mock } from 'vitest';
import { useUserChainSettings } from '..';

vi.unmock('hooks/useUserChainSettings');

const mockSetUserSettings = vi.fn();
const mockStoreState = {
  setUserSettings: mockSetUserSettings,
  userSettings: {} as Partial<Record<ChainId, Partial<UserChainSettings>>>,
};

vi.mock('store', () => ({
  useStore: vi.fn((selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
  ),
}));

describe('useUserChainSettings', () => {
  it('does not hide public markets behind a saved My assets filter when disconnected', () => {
    (useAccountAddress as Mock).mockReturnValue({ accountAddress: undefined });
    mockStoreState.userSettings = {
      [ChainId.BSC_TESTNET]: { showUserAssetsOnly: true },
    };
    const { result } = renderHookWithContext(() => useUserChainSettings());
    expect(result.current[0].showUserAssetsOnly).toBe(false);
    expect(mockStoreState.userSettings[ChainId.BSC_TESTNET]?.showUserAssetsOnly).toBe(true);
  });

  it('retains the saved My assets preference for connected users', () => {
    mockStoreState.userSettings = {
      [ChainId.BSC_TESTNET]: { showUserAssetsOnly: true },
    };
    const { result } = renderHookWithContext(() => useUserChainSettings(), {
      accountAddress: fakeAccountAddress,
    });
    expect(result.current[0].showUserAssetsOnly).toBe(true);
  });

  it('returns correct settings from the store', () => {
    mockStoreState.userSettings = {
      [ChainId.BSC_TESTNET]: {
        gaslessTransactions: true,
      },
    };

    const {
      result: {
        current: [userChainSettings],
      },
    } = renderHookWithContext(() => useUserChainSettings());

    expect(userChainSettings).toMatchSnapshot();
  });

  it('calls setState when updating settings', () => {
    mockSetUserSettings.mockReset();

    const {
      result: {
        current: [_userChainSettings, setUserChainSettings],
      },
    } = renderHookWithContext(() => useUserChainSettings());

    setUserChainSettings({ gaslessTransactions: false });

    expect(mockSetUserSettings).toHaveBeenCalledWith({
      settings: {
        gaslessTransactions: false,
      },
      chainIds: [ChainId.BSC_TESTNET],
    });
  });
});
