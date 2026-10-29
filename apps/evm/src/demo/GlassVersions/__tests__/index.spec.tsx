import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { GlassVersions } from '..';
import { useInterfaceModeStore } from '../../useInterfaceMode';
import { mountEHeaderMirror } from '../eHeaderMirror';
import { useGlassPreview } from '../store';

vi.unmock('zustand');
vi.mock('components/Icon', () => ({ Icon: () => <span aria-hidden="true" /> }));
vi.mock('../ChangeNotes', () => ({ ChangeNotes: () => null }));
vi.mock('../MotionControls', () => ({ MotionControls: () => null }));
vi.mock('../eHeaderMirror', () => ({ mountEHeaderMirror: vi.fn(() => vi.fn()) }));
vi.mock('../../useLiquidityLightPreview', () => ({
  useLiquidityLightPreview: () => false,
  useDemoTheme: (selector: (state: { setTheme: () => void }) => unknown) =>
    selector({ setTheme: vi.fn() }),
}));

const Location = () => {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search} {JSON.stringify(location.state)}
    </output>
  );
};

const renderController = (path = '/?chainId=56', state = { interfaceMode: 'lite' }) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: path.split('?')[0],
          search: path.includes('?') ? `?${path.split('?')[1]}` : '',
          state,
        },
      ]}
    >
      <Location />
      <GlassVersions />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  useGlassPreview.getState().setMode('lite-experiment-v2');
  useInterfaceModeStore.getState().setMode('lite');
  vi.clearAllMocks();
});
afterEach(cleanup);

it.each(['lite-experiment-v2', 'lite-experiment-v3'] as const)(
  'tracks the component glass light independently on the two %s informational totals',
  revision => {
    useGlassPreview.getState().setMode(revision);
    const controller = renderController();
    render(
      <div className="lite-markets">
        <div className="lite-e2-market-total">
          <span>Supply amount</span>
        </div>
        <div className="lite-e2-market-total">
          <span>Liquidity amount</span>
        </div>
      </div>,
    );
    const supplyText = screen.getByText('Supply amount');
    const liquidityText = screen.getByText('Liquidity amount');
    const supply = supplyText.parentElement;
    const liquidity = liquidityText.parentElement;
    if (!supply || !liquidity) throw new Error('Expected informational total wrappers');
    vi.spyOn(supply, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 200, 300, 36));
    vi.spyOn(liquidity, 'getBoundingClientRect').mockReturnValue(new DOMRect(420, 200, 300, 36));

    fireEvent(
      supplyText,
      new MouseEvent('pointermove', { bubbles: true, clientX: 125, clientY: 212 }),
    );
    expect(supply.style.getPropertyValue('--glass-x')).toBe('25px');
    expect(supply.style.getPropertyValue('--glass-y')).toBe('12px');
    expect(liquidity.style.getPropertyValue('--glass-x')).toBe('');

    fireEvent(
      liquidityText,
      new MouseEvent('pointermove', { bubbles: true, clientX: 640, clientY: 224 }),
    );
    expect(liquidity.style.getPropertyValue('--glass-x')).toBe('220px');
    expect(liquidity.style.getPropertyValue('--glass-y')).toBe('24px');
    expect(supply.style.getPropertyValue('--glass-x')).toBe('25px');
    expect(supply).not.toHaveAttribute('role', 'button');
    expect(supply).not.toHaveAttribute('tabindex');

    controller.unmount();
    fireEvent(
      supplyText,
      new MouseEvent('pointermove', { bubbles: true, clientX: 160, clientY: 220 }),
    );
    expect(supply.style.getPropertyValue('--glass-x')).toBe('25px');
  },
);

it.each(['v1'] as const)(
  'does not opt other %s totals into the new pointer binding',
  revision => {
    useGlassPreview.getState().setMode(revision);
    renderController();
    render(
      <div className="lite-markets">
        <div className="lite-e2-market-total">Other total</div>
      </div>,
    );
    const total = screen.getByText('Other total');
    fireEvent(total, new MouseEvent('pointermove', { bubbles: true, clientX: 20, clientY: 12 }));
    expect(total.style.getPropertyValue('--glass-x')).toBe('');
    expect(total.style.getPropertyValue('--glass-y')).toBe('');
  },
);

it('keeps the white pointer light off E2 actions, which use the Pro border orbit instead', () => {
  useGlassPreview.getState().setMode('lite-experiment-v2');
  renderController();
  render(
    <div className="lite-markets">
      <button type="button" className="lite-e2-earn-action" data-venus-button-variant="secondary">
        Earn with USDT
      </button>
      <button type="button" data-venus-button-variant="secondary">
        Other Lite control
      </button>
      <button
        type="button"
        disabled
        className="lite-e2-earn-action"
        data-venus-button-variant="secondary"
      >
        Disabled action
      </button>
    </div>,
  );
  const action = screen.getByRole('button', { name: 'Earn with USDT' });
  fireEvent(action, new MouseEvent('pointermove', { bubbles: true, clientX: 20, clientY: 12 }));
  expect(action.style.getPropertyValue('--glass-x')).toBe('');
  expect(action.style.getPropertyValue('--glass-y')).toBe('');
  for (const name of ['Other Lite control', 'Disabled action']) {
    const button = screen.getByRole('button', { name });
    fireEvent(button, new MouseEvent('pointermove', { bubbles: true, clientX: 20, clientY: 12 }));
    expect(button.style.getPropertyValue('--glass-x')).toBe('');
    expect(button.style.getPropertyValue('--glass-y')).toBe('');
  }
});

it('shows only Final initially and keeps earlier experiments inside Test', () => {
  renderController();
  expect(screen.getByRole('button', { name: 'Final' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('button', { name: 'Lite experiment' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Lite experiment 3' })).toBeNull();
  expect(screen.getByRole('tab', { name: 'Final' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'Test' })).toHaveAttribute('aria-selected', 'false');
  expect(screen.queryByRole('button', { name: 'Original' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'New' })).toBeNull();
});

it('opens Test without changing the selected version or URL and returns to Final', () => {
  renderController('/?chainId=56&asset=USDT');
  const before = screen.getByTestId('location').textContent;
  fireEvent.click(screen.getByRole('tab', { name: 'Test' }));
  expect(screen.getByRole('tab', { name: 'Test' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('button', { name: 'Lite experiment 3' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Original' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'E2 original experiment' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Lite experiment' })).toBeNull();
  expect(screen.getByRole('group', { name: 'Previous styles' }).querySelectorAll('.preview-version')).toHaveLength(3);
  expect(useGlassPreview.getState().mode).toBe('lite-experiment-v2');
  expect(screen.getByTestId('location').textContent).toBe(before);

  fireEvent.click(screen.getByRole('button', { name: 'Original' }));
  expect(useGlassPreview.getState().mode).toBe('v1');
  fireEvent.click(screen.getByRole('tab', { name: 'Final' }));
  expect(screen.queryByRole('button', { name: 'Original' })).toBeNull();
  expect(useGlassPreview.getState().mode).toBe('lite-experiment-v2');
});

it.each([
  ['Final', 'lite-experiment-v2'],
  ['Lite experiment 3', 'lite-experiment-v3'],
])('persists %s separately and exposes an isolated revision scope', (name, revision) => {
  const { unmount } = renderController();
  if (name !== 'Final') fireEvent.click(screen.getByRole('tab', { name: 'Test' }));
  fireEvent.click(screen.getByRole('button', { name }));
  expect(localStorage.getItem('venus-glass-version')).toBe(revision);
  expect(document.documentElement.dataset.glassStudy).toBe('lite-experiment');
  expect(document.documentElement.dataset.glassRevision).toBe(revision);
  expect(document.documentElement.dataset.glassPreview).toBe('v1');
  // E revision comparisons do not restart the common material mirror.
  expect(mountEHeaderMirror).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole('tab', { name: 'Test' }));
  fireEvent.click(screen.getByRole('button', { name: 'E2 original experiment' }));
  expect(localStorage.getItem('venus-glass-version')).toBe('lite-experiment-v2-legacy');
  expect(document.documentElement.dataset.glassRevision).toBe('lite-experiment-v2');
  unmount();
  expect(document.documentElement.dataset.glassRevision).toBeUndefined();
});

it.each([
  ['/?chainId=56&asset=USDT', 'lite'],
  ['/markets/0x123?chainId=56&tab=markets', 'pro'],
] as const)(
  'compares E2 / E3 at %s without resetting the page or route state',
  (path, mode) => {
    renderController(path, { interfaceMode: mode });
    const before = screen.getByTestId('location').textContent;
    fireEvent.click(screen.getByRole('tab', { name: 'Test' }));
    for (const name of ['E2 original experiment', 'Lite experiment 3']) {
      fireEvent.click(screen.getByRole('button', { name }));
      expect(screen.getByTestId('location').textContent).toBe(before);
    }
  },
);

it.each(['E2 original experiment', 'Lite experiment 3'])(
  'keeps the original Lite entry behavior when selecting %s from Before',
  name => {
    useGlassPreview.getState().setMode('v1');
    renderController('/markets/0x123?chainId=56&asset=USDT', { interfaceMode: 'pro' });
    fireEvent.click(screen.getByRole('tab', { name: 'Test' }));
    fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.getByTestId('location').textContent).toBe(
      '/?chainId=56&asset=USDT {"interfaceMode":"lite"}',
    );
  },
);

it.each([
  ['Final', 'Final'],
  ['Lite experiment 3', 'E3'],
])('keeps the %s label and selection when collapsed and reopened', (name, label) => {
  renderController();
  if (name !== 'Final') fireEvent.click(screen.getByRole('tab', { name: 'Test' }));
  fireEvent.click(screen.getByRole('button', { name }));
  fireEvent.click(screen.getByRole('button', { name: 'Collapse design preview' }));
  expect(screen.getByRole('button', { name: 'Expand design preview' }).textContent).toBe(label);
  fireEvent.click(screen.getByRole('button', { name: 'Expand design preview' }));
  expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
});

it('still switches revisions when browser preference storage is blocked', () => {
  renderController();
  fireEvent.click(screen.getByRole('tab', { name: 'Test' }));
  const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new Error('Storage unavailable');
  });
  try {
    fireEvent.click(screen.getByRole('button', { name: 'Lite experiment 3' }));
    expect(useGlassPreview.getState().mode).toBe('lite-experiment-v3');
    expect(document.documentElement.dataset.glassRevision).toBe('lite-experiment-v3');
  } finally {
    setItem.mockRestore();
  }
});

it('supports arrow, Home and End keys between Final and Test', () => {
  renderController();
  const preview = screen.getByRole('tab', { name: 'Final' });
  const before = screen.getByRole('tab', { name: 'Test' });
  fireEvent.keyDown(preview, { key: 'ArrowRight' });
  expect(before).toHaveAttribute('aria-selected', 'true');
  expect(document.activeElement).toBe(before);
  fireEvent.keyDown(before, { key: 'ArrowLeft' });
  expect(preview).toHaveAttribute('aria-selected', 'true');
  expect(document.activeElement).toBe(preview);
  fireEvent.keyDown(preview, { key: 'End' });
  expect(before).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(before, { key: 'Home' });
  expect(preview).toHaveAttribute('aria-selected', 'true');
  expect(useGlassPreview.getState().mode).toBe('lite-experiment-v2');
});

it('redirects the retired New selection to Final', () => {
  useGlassPreview.getState().setMode('v5');
  expect(useGlassPreview.getState().mode).toBe('lite-experiment-v2');
});
