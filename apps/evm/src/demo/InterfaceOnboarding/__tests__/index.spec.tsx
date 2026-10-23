import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PAGE_CONTAINER_ID } from 'constants/layout';
import { StrictMode, useState } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { InterfaceOnboarding } from '..';
import { useInterfaceModeStore } from '../../useInterfaceMode';
import { INTRODUCTION_SEEN_KEYS } from '../policy';
import { useIntroductionPreview } from '../previewStore';

vi.unmock('zustand');
const wallet = vi.hoisted(() => ({ accountAddress: '0x123' as string | undefined }));
const documentEntry = vi.hoisted(() => ({ type: 'navigate' }));
vi.mock('libs/wallet', () => ({ useAccountAddress: () => wallet }));
vi.mock('../../GlassVersions/store', () => ({
  useGlassPreview: (selector: (state: { mode: string }) => unknown) =>
    selector({ mode: 'lite-experiment' }),
}));
vi.mock('../../useLiquidityLightPreview', () => ({ useLiquidityLightPreview: () => false }));
vi.mock('../policy', async () => ({
  ...(await vi.importActual<typeof import('../policy')>('../policy')),
  getDocumentEntryType: () => documentEntry.type,
}));

const TestPage = ({ initiallyLoading = false, otherDialog = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(initiallyLoading);
  const [blocking, setBlocking] = useState(otherDialog);
  return (
    <>
      <div id={PAGE_CONTAINER_ID}>
        {loading && <div role="status" aria-label="Loading page" />}
        <button type="button" onClick={() => setLoading(false)}>
          Finish loading
        </button>
        <output data-testid="location">
          {location.pathname}
          {location.search}
        </output>
        <output data-testid="route-state">{JSON.stringify(location.state)}</output>
        <button
          type="button"
          onClick={() =>
            navigate('/liquidity-hubs?chainId=56', {
              state: { interfaceMode: 'pro' },
            })
          }
        >
          Enter Pro
        </button>
        <button
          type="button"
          onClick={() =>
            navigate('/?chainId=56', {
              state: { interfaceMode: 'lite' },
            })
          }
        >
          Enter Lite
        </button>
        <button type="button" onClick={() => navigate('/dashboard?chainId=56')}>
          Internal dashboard
        </button>
        <button type="button" onClick={() => useIntroductionPreview.getState().preview('pro')}>
          Replay Pro
        </button>
        <button type="button" onClick={() => useIntroductionPreview.getState().preview('lite')}>
          Replay Lite
        </button>
      </div>
      {blocking && (
        <div role="dialog" aria-modal="true" aria-label="Existing task">
          <button type="button" onClick={() => setBlocking(false)}>
            Close existing task
          </button>
        </div>
      )}
    </>
  );
};

const renderFlow = ({
  path = '/',
  state,
  initiallyLoading = false,
  otherDialog = false,
  strict = false,
}: {
  path?: string;
  state?: unknown;
  initiallyLoading?: boolean;
  otherDialog?: boolean;
  strict?: boolean;
} = {}) => {
  const flow = (
    <MemoryRouter
      initialEntries={[
        {
          pathname: path.split('?')[0],
          search: path.includes('?') ? `?${path.split('?')[1]}` : '',
          state,
        },
      ]}
    >
      <TestPage initiallyLoading={initiallyLoading} otherDialog={otherDialog} />
      <InterfaceOnboarding />
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{flow}</StrictMode> : flow);
};

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterAll(() => vi.unstubAllGlobals());
beforeEach(() => {
  wallet.accountAddress = '0x123';
  documentEntry.type = 'navigate';
  useInterfaceModeStore.getState().setMode('lite');
  useIntroductionPreview.setState({ request: null });
});

it('introduces Pro while remaining on a direct Lite entry', async () => {
  renderFlow();
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Pro.' })).toBeTruthy();
  expect(screen.getByTestId('location').textContent).toBe('/');
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.pro)).toBe('true');
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBeNull();
});

it('can introduce Pro on the Lite page before a wallet is connected', async () => {
  wallet.accountAddress = undefined;
  renderFlow();
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Pro.' })).toBeTruthy();
  expect(screen.getByTestId('location').textContent).toBe('/');
});

it.each(['close', 'cancel', 'backdrop'])(
  'keeps the Lite URL, query and state when the Pro invitation is dismissed via %s',
  async action => {
    renderFlow({
      path: '/?chainId=56&asset=USDT',
      state: { interfaceMode: 'lite', from: 'saved' },
    });
    const dialog = await screen.findByRole('dialog', { name: 'Meet Venus Pro.' });
    const before = screen.getByTestId('route-state').textContent;
    if (action === 'close') {
      fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
    } else if (action === 'cancel') {
      fireEvent(dialog, new Event('cancel', { cancelable: true }));
    } else {
      fireEvent.click(dialog);
    }
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe('/?chainId=56&asset=USDT');
    expect(screen.getByTestId('route-state').textContent).toBe(before);
  },
);

it.each(['Try Pro now', 'Try Venus Pro'])(
  'enters Pro only through %s without chaining another invitation',
  async name => {
    renderFlow({ path: '/?chainId=56' });
    await screen.findByRole('dialog', { name: 'Meet Venus Pro.' });
    fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe('/liquidity-hubs?chainId=56');
    expect(screen.getByTestId('route-state').textContent).toContain('"interfaceMode":"pro"');
    expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBeNull();
  },
);

it('does not introduce Pro after the user has already switched to Pro', async () => {
  renderFlow();
  await screen.findByRole('dialog', { name: 'Meet Venus Pro.' });
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  fireEvent.click(screen.getByRole('button', { name: 'Enter Pro' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBeNull();
});

it('remembers the Pro invitation across fresh direct Lite visits', async () => {
  const first = renderFlow();
  await screen.findByRole('dialog', { name: 'Meet Venus Pro.' });
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  first.unmount();
  renderFlow();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('introduces Lite on an external Pro deep link without redirecting', async () => {
  renderFlow({ path: '/markets/0x123/0x456?chainId=56&asset=USDT' });
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Lite.' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  expect(screen.getByTestId('location').textContent).toBe(
    '/markets/0x123/0x456?chainId=56&asset=USDT',
  );
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBe('true');
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.pro)).toBeNull();
});

it('introduces Lite on a direct Pro guest entry while leaving the wallet disconnected', async () => {
  wallet.accountAddress = undefined;
  renderFlow({ path: '/liquidity-hubs?chainId=56' });
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Lite.' })).toBeTruthy();
  expect(wallet.accountAddress).toBeUndefined();
});

it('remembers Lite across document remounts and different external Pro links', async () => {
  const first = renderFlow({ path: '/liquidity-hubs?chainId=56' });
  await screen.findByRole('dialog', { name: 'Meet Venus Lite.' });
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  first.unmount();
  renderFlow({ path: '/dashboard?chainId=56' });
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('keeps the two automatic introductions independent', async () => {
  const first = renderFlow();
  await screen.findByRole('dialog', { name: 'Meet Venus Pro.' });
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  first.unmount();
  renderFlow({ path: '/dashboard?chainId=56' });
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Lite.' })).toBeTruthy();
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBe('true');
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.pro)).toBe('true');
});

it.each(['Try Lite now', 'Try Venus Lite'])(
  'enters Lite through %s without immediately showing the opposite introduction',
  async name => {
    renderFlow({ path: '/dashboard?chainId=56' });
    await screen.findByRole('dialog', { name: 'Meet Venus Lite.' });
    fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.getByTestId('location').textContent).toBe('/?chainId=56');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.pro)).toBeNull();
  },
);

it.each([
  ['reload', '/'],
  ['back_forward', '/'],
  ['reload', '/liquidity-hubs'],
  ['back_forward', '/liquidity-hubs'],
])('does not mistake %s on %s for a fresh arrival', (entryType, path) => {
  documentEntry.type = entryType;
  renderFlow({ path });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBeNull();
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.pro)).toBeNull();
});

it('does not treat ordinary internal Lite or Pro links as fresh arrivals', () => {
  renderFlow({ path: '/about-us' });
  fireEvent.click(screen.getByRole('button', { name: 'Enter Lite' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Internal dashboard' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('waits for the page to load before marking an introduction shown', async () => {
  renderFlow({ path: '/liquidity-hubs', initiallyLoading: true });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Finish loading' }));
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Lite.' })).toBeTruthy();
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBe('true');
});

it('waits for an existing dialog instead of stacking a second modal', async () => {
  renderFlow({ path: '/liquidity-hubs', otherDialog: true });
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Close existing task' }));
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Lite.' })).toBeTruthy();
});

it('replays either introduction without consuming either automatic shown flag', async () => {
  renderFlow({ state: { interfaceEntry: 'introduction-preview' } });
  fireEvent.click(screen.getByRole('button', { name: 'Replay Pro' }));
  await screen.findByRole('dialog', { name: 'Meet Venus Pro.' });
  expect(screen.getByTestId('location').textContent).toBe('/');
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  fireEvent.click(screen.getByRole('button', { name: 'Replay Lite' }));
  await screen.findByRole('dialog', { name: 'Meet Venus Lite.' });
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.pro)).toBeNull();
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBeNull();
});

it('keeps a replay available after both automatic introductions have been shown', async () => {
  localStorage.setItem(INTRODUCTION_SEEN_KEYS.lite, 'true');
  localStorage.setItem(INTRODUCTION_SEEN_KEYS.pro, 'true');
  renderFlow();
  act(() => useIntroductionPreview.getState().preview('pro'));
  expect(await screen.findByRole('dialog', { name: 'Meet Venus Pro.' })).toBeTruthy();
});

it.each([
  ['/', 'Pro'],
  ['/liquidity-hubs', 'Lite'],
])('does not duplicate automatic presentation under Strict Mode on %s', async (path, variant) => {
  renderFlow({ path, strict: true });
  await screen.findByRole('dialog', { name: `Meet Venus ${variant}.` });
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
