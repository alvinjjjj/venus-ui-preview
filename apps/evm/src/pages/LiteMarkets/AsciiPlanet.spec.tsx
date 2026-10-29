import { act, cleanup, render } from '@testing-library/react';
import { AsciiPlanet } from './AsciiPlanet';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('motion/react', () => ({ useReducedMotion: () => motion.reduced }));
vi.mock('demo/useLiquidityLightPreview', () => ({ useLiquidityLightPreview: () => false }));

let now = 0;
let hidden = false;
let nextFrame = 0;
let frames: Map<number, FrameRequestCallback>;
let visible: (entries: { isIntersecting: boolean }[]) => void;
let contexts: ReturnType<typeof context>[];
const context = () => ({
  scale: vi.fn(), clearRect: vi.fn(), fillText: vi.fn((_text: string, _x: number, _y: number) => {}), drawImage: vi.fn(),
  createLinearGradient: () => ({ addColorStop: vi.fn() }),
  createRadialGradient: () => ({ addColorStop: vi.fn() }),
});
const props = { color: '#259e83', highlight: '#b4f1dc', shadow: '#103e49', surface: 'rim' as const, glyphScale: 1.1 };

beforeEach(() => {
  now = 0; hidden = false; motion.reduced = false; frames = new Map(); contexts = [];
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    const result = context(); contexts.push(result);
    return result as unknown as CanvasRenderingContext2D;
  });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++nextFrame, callback); return nextFrame; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof visible) { visible = callback; }
    observe() {} disconnect() {}
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const advance = (time: number) => act(() => {
  now = time;
  const callbacks = [...frames.values()]; frames.clear();
  callbacks.forEach(callback => callback(time));
});

it('reuses the stationary rim glyphs while still painting the moving ring each frame', () => {
  render(<AsciiPlanet {...props} active={false} />);
  const [main, body] = contexts;
  const glyphCount = body.fillText.mock.calls.length;
  expect(glyphCount).toBeGreaterThan(800);
  const initialRing = main.fillText.mock.calls.length;
  act(() => visible([{ isIntersecting: true }]));
  advance(50); advance(100); advance(150);
  expect(body.fillText).toHaveBeenCalledTimes(glyphCount);
  expect(main.drawImage).toHaveBeenCalledTimes(4);
  expect(main.fillText.mock.calls.length).toBeGreaterThan(initialRing * 3);
});

it('refreshes the body on each approved digit step and restores original glyphs on exit', () => {
  const { rerender } = render(<AsciiPlanet {...props} active={false} />);
  const body = contexts[1];
  const glyphCount = body.fillText.mock.calls.length;
  act(() => visible([{ isIntersecting: true }]));
  rerender(<AsciiPlanet {...props} active />);
  advance(50);
  expect(body.fillText).toHaveBeenCalledTimes(glyphCount * 2);
  expect(body.fillText.mock.calls.slice(-glyphCount).every(call => /^\d$/.test(String(call[0])))).toBe(true);
  advance(100);
  expect(body.fillText).toHaveBeenCalledTimes(glyphCount * 2);
  advance(200);
  expect(body.fillText).toHaveBeenCalledTimes(glyphCount * 3);
  rerender(<AsciiPlanet {...props} active={false} />);
  advance(250);
  expect(body.fillText).toHaveBeenCalledTimes(glyphCount * 4);
  expect(body.fillText.mock.calls.slice(-glyphCount).every(call => !/^\d$/.test(String(call[0])))).toBe(true);
});

it('stops frames when the page is hidden or the planet is offscreen and cleans up', () => {
  const { unmount } = render(<AsciiPlanet {...props} active={false} />);
  act(() => visible([{ isIntersecting: true }]));
  expect(frames.size).toBe(1);
  hidden = true;
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(frames.size).toBe(0);
  hidden = false;
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(frames.size).toBe(1);
  act(() => visible([{ isIntersecting: false }]));
  expect(frames.size).toBe(0);
  unmount();
  expect(frames.size).toBe(0);
});

it('keeps a static cached illustration for reduced motion', () => {
  motion.reduced = true;
  render(<AsciiPlanet {...props} active />);
  act(() => visible([{ isIntersecting: true }]));
  expect(contexts[0].drawImage).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(0);
});
