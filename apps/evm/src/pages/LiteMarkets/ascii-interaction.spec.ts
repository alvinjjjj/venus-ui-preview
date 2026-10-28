import { asciiInteractionStepMs, getAsciiInteractionGlyph } from './ascii-interaction';

it('holds each digit at the approved slow cadence', () => {
  for (let index = 0; index < 100; index++) {
    expect(getAsciiInteractionGlyph('@', index, 0)).toMatch(/^\d$/);
    expect(getAsciiInteractionGlyph('@', index, 0)).toBe(getAsciiInteractionGlyph('@', index, 100));
    expect(getAsciiInteractionGlyph('@', index, 0)).not.toBe(
      getAsciiInteractionGlyph('@', index, asciiInteractionStepMs),
    );
  }
});

it('continues cycling during a longer hover instead of settling after an entrance', () => {
  expect(getAsciiInteractionGlyph('#', 3, 10000)).toMatch(/^\d$/);
  expect(getAsciiInteractionGlyph('#', 3, 10000)).not.toBe(
    getAsciiInteractionGlyph('#', 3, 10000 + asciiInteractionStepMs),
  );
});

it('restores static artwork when inactive or reduced', () => {
  for (const elapsed of [-1, Number.POSITIVE_INFINITY]) {
    expect(getAsciiInteractionGlyph('#', 3, elapsed)).toBe('#');
  }
});
