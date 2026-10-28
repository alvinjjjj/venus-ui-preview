import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useInterfaceMode, useInterfaceModeStore } from '../useInterfaceMode';

vi.unmock('zustand');
const wallet = vi.hoisted(() => ({ accountAddress: '0x123' as string | undefined }));
const preview = vi.hoisted(() => ({ mode: 'v1' }));
vi.mock('libs/wallet', () => ({ useAccountAddress: () => wallet }));
vi.mock('../GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) => selector(preview),
}));

describe.each(['v1', 'v5', 'lite-experiment', 'lite-experiment-v2', 'lite-experiment-v3'])(
  '%s interface mode commits with navigation',
  previewMode => {
    beforeEach(() => {
      preview.mode = previewMode;
      wallet.accountAddress = '0x123';
      useInterfaceModeStore.getState().setMode('lite');
    });

    it.each([
      ['pro', 'lite', '/'],
      ['lite', 'pro', '/liquidity-hubs'],
    ] as const)('uses destination mode instead of the previous %s mode', (previous, next, path) => {
      useInterfaceModeStore.getState().setMode(previous);
      const { result } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={[{ pathname: path, state: { interfaceMode: next } }]}>
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.mode).toBe(next);
      expect(result.current.isLite).toBe(next === 'lite');
      // Rendering the destination must not eagerly mutate the external store.
      expect(useInterfaceModeStore.getState().mode).toBe(previous);
    });

    it('retains the committed mode on ordinary inner-page links', () => {
      useInterfaceModeStore.getState().setMode('pro');
      const { result } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>
        ),
      });
      expect(result.current.mode).toBe('pro');
    });

    it('recognizes a direct Pro deep link without requiring old in-memory mode state', () => {
      const { result } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/markets/0x123?chainId=56']}>{children}</MemoryRouter>
        ),
      });
      expect(result.current.mode).toBe('pro');
      expect(result.current.isLite).toBe(false);
      expect(useInterfaceModeStore.getState().mode).toBe('lite');
    });

    it.each([
      ['/dashboard?chainId=56&interface=lite', 'lite'],
      ['/dashboard?chainId=56&interface=lite&txType=borrow&page=2', 'lite'],
      ['/dashboard?chainId=56&interface=pro', 'pro'],
      ['/dashboard?chainId=56', 'pro'],
      ['/dashboard?interface=invalid', 'pro'],
      ['/liquidity-hubs?interface=lite', 'pro'],
    ] as const)('retains the correct dashboard surface for %s', (path, expected) => {
      const { result } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>,
      });
      expect(result.current.mode).toBe(expected);
      expect(result.current.isLite).toBe(expected === 'lite');
    });

    it('honors explicit navigation state over a carried dashboard query', () => {
      const { result } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => (
          <MemoryRouter
            initialEntries={[
              {
                pathname: '/dashboard',
                search: '?interface=lite',
                state: { interfaceMode: 'pro' },
              },
            ]}
          >
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.mode).toBe('pro');
    });

    it('honors a guest choosing Pro without treating them as connected', () => {
      wallet.accountAddress = undefined;
      const { result } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => (
          <MemoryRouter
            initialEntries={[{ pathname: '/liquidity-hubs', state: { interfaceMode: 'pro' } }]}
          >
            {children}
          </MemoryRouter>
        ),
      });
      expect(result.current.mode).toBe('pro');
      expect(result.current.isLite).toBe(false);
      expect(wallet.accountAddress).toBeUndefined();
    });

    it.each([
      ['/', 'lite'],
      ['/liquidity-hubs', 'pro'],
      ['/markets/0x123', 'pro'],
    ] as const)('opens guest entry %s in its public %s surface', (path, expected) => {
      wallet.accountAddress = undefined;
      const { result } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>,
      });
      expect(result.current.mode).toBe(expected);
      expect(wallet.accountAddress).toBeUndefined();
      expect(useInterfaceModeStore.getState().mode).toBe('lite');
    });

    it('does not change the selected Pro surface when a wallet disconnects or reconnects', () => {
      useInterfaceModeStore.getState().setMode('pro');
      const { result, rerender } = renderHook(() => useInterfaceMode(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>
        ),
      });
      expect(result.current.mode).toBe('pro');
      wallet.accountAddress = undefined;
      rerender();
      expect(result.current.mode).toBe('pro');
      wallet.accountAddress = '0x456';
      rerender();
      expect(result.current.mode).toBe('pro');
    });
  },
);
