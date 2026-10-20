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

describe.each(['v1', 'v5'])('%s interface mode commits with navigation', previewMode => {
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

  it('keeps disconnected users in Lite despite Pro navigation state', () => {
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
    expect(result.current.mode).toBe('lite');
  });
});
