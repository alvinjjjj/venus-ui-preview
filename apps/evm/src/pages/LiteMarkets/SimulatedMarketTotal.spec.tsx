import { act, cleanup, render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { SimulatedMarketTotal } from './SimulatedMarketTotal';

let visible: (entries: { isIntersecting: boolean }[]) => void;
let hidden = false;
let reduced = false;
let frameId = 0;
let frames: Map<number, FrameRequestCallback>;
let mediaChange: () => void;
const disconnect = vi.fn();

beforeEach(() => {
  hidden = false;
  reduced = false;
  frames = new Map();
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_event: string, callback: () => void) => {
      mediaChange = callback;
    },
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof visible) {
        visible = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('lets Final sleep between five-second updates and cancels pending work while hidden', () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  vi.spyOn(performance, 'now').mockReturnValue(0);
  vi.spyOn(Math, 'random').mockReturnValue(0.12345678);
  const { container, unmount } = render(<SimulatedMarketTotal valueCents={new BigNumber('165979577668')} field="supplyUsd" updateIntervalMs={5000} animateDigits sleepBetweenUpdates />);
  act(() => visible([{ isIntersecting: true }]));
  advance(0);
  expect(frames.size).toBe(0);
  act(() => vi.advanceTimersByTime(4999));
  expect(frames.size).toBe(0);
  act(() => vi.advanceTimersByTime(1));
  expect(frames.size).toBe(1);
  advance(5000);
  expect(container.querySelector('.sr-only')).toHaveTextContent('$1,612,345,678');
  hidden = true;
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(vi.getTimerCount()).toBe(0);
  expect(frames.size).toBe(0);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

const advance = (time: number) =>
  act(() => {
    const callbacks = [...frames.values()];
    frames.clear();
    for (const callback of callbacks) callback(time);
  });

it('holds the amount steady, then changes thousands slowly without moving small digits or the base', () => {
  const base = new BigNumber('100000000');
  render(<SimulatedMarketTotal valueCents={base} field="supplyUsd" />);
  expect(screen.getByText('$1,000,000.00')).toBeVisible();
  expect(frames.size).toBe(0);
  act(() => visible([{ isIntersecting: true }]));
  advance(0);
  advance(10000);
  expect(screen.getByText('$1,000,000.00')).toBeVisible();
  advance(37500);
  expect(screen.getByText('$1,001,000.00')).toBeVisible();
  advance(60000);
  expect(screen.getByText('$1,002,000.00')).toBeVisible();
  advance(105000);
  expect(screen.getByText('$1,001,000.00')).toBeVisible();
  expect(base.toFixed()).toBe('100000000');
});

it('gives the second total an independent downward phase', () => {
  render(<SimulatedMarketTotal valueCents={new BigNumber('100000000')} field="liquidityUsd" />);
  act(() => visible([{ isIntersecting: true }]));
  advance(0);
  advance(37500);
  expect(screen.getByText('$999,000.00')).toBeVisible();
});

it('shows whole dollars independently of digit rolling without changing cents or slow updates', () => {
  const base = new BigNumber('165979577668');
  const { container } = render(
    <SimulatedMarketTotal valueCents={base} field="supplyUsd" decimalPlaces={0} />,
  );
  expect(screen.getByText('$1,659,795,776')).toBeVisible();
  expect(container.querySelector('.lite-e3-rolling-total')).toBeNull();
  act(() => visible([{ isIntersecting: true }]));
  advance(0);
  advance(37500);
  expect(screen.getByText('$1,659,796,776')).toBeVisible();
  reduced = true;
  act(() => mediaChange());
  expect(screen.getByText('$1,659,795,776')).toBeVisible();
  expect(base.toFixed()).toBe('165979577668');
});

it('pauses outside the viewport and in hidden tabs, then resumes without a time jump', () => {
  render(<SimulatedMarketTotal valueCents={new BigNumber('100000000')} field="supplyUsd" />);
  act(() => visible([{ isIntersecting: true }]));
  advance(0);
  advance(37500);
  act(() => visible([{ isIntersecting: false }]));
  expect(frames.size).toBe(0);
  act(() => visible([{ isIntersecting: true }]));
  hidden = true;
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(frames.size).toBe(0);
  hidden = false;
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  advance(300000);
  expect(screen.getByText('$1,001,000.00')).toBeVisible();
});

it('uses the static base for reduced motion and cleans up on unmount', () => {
  const { unmount } = render(
    <SimulatedMarketTotal valueCents={new BigNumber('100000000')} field="supplyUsd" />,
  );
  act(() => visible([{ isIntersecting: true }]));
  advance(0);
  advance(37500);
  reduced = true;
  act(() => mediaChange());
  expect(frames.size).toBe(0);
  expect(screen.getByText('$1,000,000.00')).toBeVisible();
  unmount();
  expect(disconnect).toHaveBeenCalled();
});

it('keeps a known zero static', () => {
  render(<SimulatedMarketTotal valueCents={new BigNumber(0)} field="supplyUsd" />);
  act(() => visible([{ isIntersecting: true }]));
  expect(screen.getByText('$0')).toBeVisible();
  expect(frames.size).toBe(0);
});

it.each([
  ['supplyUsd', '165979577668', '$1,612,345,678', '$1,687,654,321'],
  ['liquidityUsd', '125215958116', '$1,212,345,678', '$1,287,654,321'],
] as const)('randomizes %s every five seconds within its original hundred-million band', (field, cents, first, second) => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0.12345678).mockReturnValueOnce(0.87654321);
  const base = new BigNumber(cents);
  const { container } = render(<SimulatedMarketTotal valueCents={base} field={field} updateIntervalMs={5000} animateDigits />);
  act(() => visible([{ isIntersecting: true }]));
  advance(0);
  const initial = container.querySelector('.sr-only')?.textContent;
  advance(4999);
  expect(container.querySelector('.sr-only')?.textContent).toBe(initial);
  advance(5000);
  expect(container.querySelector('.sr-only')).toHaveTextContent(first);
  advance(9999);
  expect(container.querySelector('.sr-only')).toHaveTextContent(first);
  advance(10000);
  expect(container.querySelector('.sr-only')).toHaveTextContent(second);
  expect(base.toFixed()).toBe(cents);
  expect(container.querySelector('.lite-e3-rolling-total')).toHaveAttribute('aria-hidden', 'true');
});
