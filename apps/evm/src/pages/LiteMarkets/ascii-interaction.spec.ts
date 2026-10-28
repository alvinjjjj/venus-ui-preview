import { asciiInteractionStepMs, getAsciiInteractionFrame } from './ascii-interaction';

it('crossfades from the original artwork before holding the next digit', () => {
  expect(getAsciiInteractionFrame('@', 0, 0)).toEqual({ current: '@', next: '0', mix: 0 });
  expect(getAsciiInteractionFrame('@', 0, 60).mix).toBeCloseTo(0.5);
  expect(getAsciiInteractionFrame('@', 0, 180).mix).toBe(1);
});

it('staggers neighboring cells so the entire planet does not jump at once', () => {
  expect(getAsciiInteractionFrame('@', 0, 60).mix).not.toBe(
    getAsciiInteractionFrame('@', 1, 60).mix,
  );
});

it('keeps adjacent cycles continuous and continues during a long hover', () => {
  const before = getAsciiInteractionFrame('#', 0, asciiInteractionStepMs - 1);
  const after = getAsciiInteractionFrame('#', 0, asciiInteractionStepMs);
  expect(before.next).toBe(after.current);
  expect(before.mix).toBe(1);
  expect(after.mix).toBe(0);
  expect(getAsciiInteractionFrame('#', 3, 10000).next).not.toBe(
    getAsciiInteractionFrame('#', 3, 10000 + asciiInteractionStepMs).next,
  );
});

it('restores static artwork when inactive or reduced', () => {
  for (const elapsed of [-1, Number.POSITIVE_INFINITY]) {
    expect(getAsciiInteractionFrame('#', 3, elapsed)).toEqual({ current: '#', next: '#', mix: 0 });
  }
});
