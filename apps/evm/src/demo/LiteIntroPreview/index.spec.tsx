import { fireEvent, render, screen, within } from '@testing-library/react';
import { InterfaceWelcomeDialog, LiteIntroPreview, LiteWelcomeDialog } from './index';

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  // jsdom has no native top layer; browser QA covers modal focus and Escape.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

afterAll(() => vi.unstubAllGlobals());

it('opens the dismissible introduction over Pro without requiring a wallet', () => {
  render(<LiteIntroPreview />);
  expect(screen.getByRole('dialog', { name: 'Meet Venus Lite.' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Core pool' })).toBeTruthy();
  expect(screen.getByText('Wallet not connected')).toBeTruthy();
  expect(screen.getByText('Sample data. No transactions.', { exact: false })).toBeTruthy();
});

it('dismisses via the close icon without changing the destination', () => {
  render(<LiteIntroPreview />);
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Core pool' })).toBeTruthy();
});

it('reuses the Venus banner with one text-only CTA and no secondary action', () => {
  render(<LiteWelcomeDialog open onDismiss={vi.fn()} onTryLite={vi.fn()} />);
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByRole('img', { name: 'Venus' })).toBeTruthy();
  expect(dialog.querySelector('.intro-banner-background')?.getAttribute('src')).toContain(
    'background.jpg',
  );
  expect(within(dialog).getByText(/Explore assets and compare rates/)).toBeTruthy();
  const cta = within(dialog).getByRole('button', { name: 'Try Lite now' });
  expect(cta.getAttribute('data-venus-button-variant')).toBe('primary');
  expect(cta.getAttribute('data-venus-button-material')).toBe('blue-glass');
  expect(cta.querySelector('span svg')).toBeNull();
  expect(dialog.querySelector('.intro-showcase')).toBeNull();
  expect(within(dialog).queryByText('Stay on Pro')).toBeNull();
  expect(within(dialog).queryByText('Pro is always one click away.')).toBeNull();
  expect(within(dialog).getAllByRole('button')).toHaveLength(3);
});

it('invites the Lite user to try Pro with the same welcome design', () => {
  render(<InterfaceWelcomeDialog open variant="pro" onDismiss={vi.fn()} onTry={vi.fn()} />);
  const dialog = screen.getByRole('dialog', { name: 'Meet Venus Pro.' });
  expect(dialog.getAttribute('data-intro-variant')).toBe('pro');
  expect(dialog.querySelector('.intro-banner-lockup')?.textContent).toContain('Pro');
  expect(
    within(dialog).getByText(/more detailed controls for supplying and borrowing/),
  ).toBeTruthy();
  expect(within(dialog).getByRole('button', { name: 'Try Pro now' })).toBeTruthy();
  expect(within(dialog).getByRole('button', { name: 'Try Venus Pro' }).textContent).toBe('Pro');
  expect(within(dialog).queryByRole('button', { name: /Got it|Try Lite now/ })).toBeNull();
});

it.each(['Try Pro now', 'Try Venus Pro'])(
  'tries Pro only through the explicit %s control',
  name => {
    const onDismiss = vi.fn();
    const onTry = vi.fn();
    render(<InterfaceWelcomeDialog open variant="pro" onDismiss={onDismiss} onTry={onTry} />);
    fireEvent.click(screen.getByRole('button', { name }));
    expect(onTry).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();
  },
);

it.each(['close', 'cancel', 'backdrop'])(
  'dismisses the Pro invitation through %s without switching interfaces',
  action => {
    const onDismiss = vi.fn();
    const onTry = vi.fn();
    render(<InterfaceWelcomeDialog open variant="pro" onDismiss={onDismiss} onTry={onTry} />);
    if (action === 'close') {
      fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
    } else if (action === 'cancel') {
      fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    } else {
      fireEvent.click(screen.getByRole('dialog'));
    }
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onTry).not.toHaveBeenCalled();
  },
);

it('does not point a Pro invitation back to the Lite page underneath it', () => {
  render(<InterfaceWelcomeDialog open variant="pro" onDismiss={vi.fn()} onTry={vi.fn()} />);
  expect(screen.queryByRole('button', { name: 'Return to Venus Lite' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Try Venus Lite' })).toBeNull();
});

it('handles the native Escape cancel event without switching modes', () => {
  render(<LiteIntroPreview />);
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Core pool' })).toBeTruthy();
});

it.each(['Try Lite now', 'Try Venus Lite'])(
  'enters Lite through %s and can return to Pro',
  name => {
    render(<LiteIntroPreview />);
    fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Universal Money Markets' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Pro' }));
    expect(screen.getByRole('heading', { name: 'Core pool' })).toBeTruthy();
  },
);

it('can replay the introduction after entering Lite', () => {
  render(<LiteIntroPreview />);
  fireEvent.click(screen.getByRole('button', { name: 'Try Lite now' }));
  fireEvent.click(screen.getByRole('button', { name: 'Replay introduction' }));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Core pool' })).toBeTruthy();
});

it('provides working search, empty state, categories and Earn/Borrow in the Lite sample', () => {
  render(<LiteIntroPreview />);
  fireEvent.click(screen.getByRole('button', { name: 'Try Lite now' }));
  const panel = screen.getByRole('region', { name: 'Lite market preview' });
  fireEvent.change(screen.getByRole('textbox', { name: 'Search assets' }), {
    target: { value: 'no-token' },
  });
  expect(within(panel).getByText('No matching assets. Try a different search.')).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search assets' }), {
    target: { value: '' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: 'Asset category' }), {
    target: { value: 'stable' },
  });
  expect(within(panel).queryByRole('rowheader', { name: 'ETH' })).toBeNull();
  expect(within(panel).getByRole('rowheader', { name: 'USDT' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Borrow' }));
  expect(within(panel).getByRole('columnheader', { name: 'Borrow APY' })).toBeTruthy();
});

it('switches themes only in this preview and does not persist a preference', () => {
  const storage = vi.spyOn(Storage.prototype, 'setItem');
  const { container } = render(<LiteIntroPreview />);
  fireEvent.click(screen.getByRole('button', { name: 'Close introduction' }));
  fireEvent.click(screen.getByRole('button', { name: 'Light mode' }));
  expect(container.querySelector('[data-theme="light"]')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Replay introduction' }));
  fireEvent.click(screen.getByRole('button', { name: 'Try Lite now' }));
  expect(storage).not.toHaveBeenCalled();
});

it('offers scenario controls inside the open introduction, then collapses after selection', () => {
  render(<LiteIntroPreview />);
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: '開啟情境遙控器' }));
  expect(within(dialog).getByRole('status').textContent).toContain('首次由 Core pool');
  fireEvent.click(within(dialog).getByRole('button', { name: /^首次進入首頁/ }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Universal Money Markets' })).toBeTruthy();
  expect(screen.getByRole('button', { name: '開啟情境遙控器' })).toBeTruthy();
});

it('lets the remote simulate preference-based return and a Pro deep link', () => {
  render(<LiteIntroPreview />);
  fireEvent.click(screen.getByRole('button', { name: 'Try Lite now' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟情境遙控器' }));
  fireEvent.click(screen.getByRole('button', { name: /^重訪首頁/ }));
  expect(screen.getByRole('heading', { name: 'Universal Money Markets' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '開啟情境遙控器' }));
  fireEvent.click(screen.getByRole('button', { name: /^重訪 Pro 連結/ }));
  expect(screen.getByRole('heading', { name: 'Core pool' })).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('can reset a first Pro visit and switch theme from the remote without dismissing', () => {
  const { container } = render(<LiteIntroPreview />);
  fireEvent.click(screen.getByRole('button', { name: 'Try Lite now' }));
  fireEvent.click(screen.getByRole('button', { name: '開啟情境遙控器' }));
  fireEvent.click(screen.getByRole('button', { name: /^首次進入 Pro/ }));
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: '開啟情境遙控器' }));
  fireEvent.click(within(dialog).getByRole('button', { name: '遙控器切換至 Light mode' }));
  expect(container.querySelector('[data-theme="light"]')).toBeTruthy();
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(within(dialog).getByRole('status').textContent).toContain('首次由 Core pool');
});

it('closes only the expanded remote when Escape is pressed inside it', () => {
  render(<LiteIntroPreview />);
  fireEvent.click(screen.getByRole('button', { name: '開啟情境遙控器' }));
  fireEvent.keyDown(screen.getByRole('complementary', { name: '情境遙控器' }), { key: 'Escape' });
  expect(screen.getByRole('button', { name: '開啟情境遙控器' })).toBeTruthy();
  expect(screen.getByRole('dialog')).toBeTruthy();
});
