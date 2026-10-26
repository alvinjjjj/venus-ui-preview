import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PromotedTokenFire } from './PromotedTokenFire';

vi.mock('components/Icon', () => ({
  Icon: ({ className }: { className?: string }) => (
    <svg data-testid="fire-icon" className={className} />
  ),
}));

let callback: IntersectionObserverCallback;
let hidden = false;
const observe = vi.fn();
const disconnect = vi.fn();
const intersect = (visible: boolean) =>
  act(() =>
    callback(
      [{ isIntersecting: visible } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
const fire = () => screen.getAllByTestId('fire-icon')[0].closest('.lite-e2-promoted-fire');

beforeEach(() => {
  hidden = false;
  vi.clearAllMocks();
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(handler: IntersectionObserverCallback) {
        callback = handler;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('only runs while the fire intersects the viewport', () => {
  render(<PromotedTokenFire />);
  expect(fire()).toHaveAttribute('data-motion-active', 'false');
  expect(fire()).toHaveAttribute('aria-hidden', 'true');
  expect(observe).toHaveBeenCalledWith(fire());
  intersect(true);
  expect(fire()).toHaveAttribute('data-motion-active', 'true');
  intersect(false);
  expect(fire()).toHaveAttribute('data-motion-active', 'false');
});

it('reuses the flame icon for distinct outer and inner layers in a fixed size', () => {
  render(<PromotedTokenFire />);
  expect(fire()).toHaveClass('size-4');
  expect(fire()?.querySelector('.lite-e2-flame-outer')).toBeInTheDocument();
  expect(fire()?.querySelector('.lite-e2-flame-inner')).toBeInTheDocument();
  expect(screen.getAllByTestId('fire-icon')).toHaveLength(2);
});

it('pauses in a hidden tab and resumes only if still in view', () => {
  render(<PromotedTokenFire />);
  intersect(true);
  hidden = true;
  fireEvent(document, new Event('visibilitychange'));
  expect(fire()).toHaveAttribute('data-motion-active', 'false');
  hidden = false;
  fireEvent(document, new Event('visibilitychange'));
  expect(fire()).toHaveAttribute('data-motion-active', 'true');
  intersect(false);
  fireEvent(document, new Event('visibilitychange'));
  expect(fire()).toHaveAttribute('data-motion-active', 'false');
});

it('disconnects the observer on unmount', () => {
  const { unmount } = render(<PromotedTokenFire />);
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

it('keeps the icon static when visibility observation is unavailable', () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  render(<PromotedTokenFire />);
  expect(fire()).toBeVisible();
  expect(fire()).toHaveAttribute('data-motion-active', 'false');
});
