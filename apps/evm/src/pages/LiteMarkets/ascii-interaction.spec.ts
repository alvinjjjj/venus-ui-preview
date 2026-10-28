import { getAsciiInteractionGlyph } from './ascii-interaction';

it('cycles digits slowly enough to hold each glyph beyond 100ms', () => {
  for (let index = 0; index < 100; index++) {
    expect(getAsciiInteractionGlyph('@', index, 0)).toMatch(/^\d$/);
    expect(getAsciiInteractionGlyph('@', index, 0)).toBe(getAsciiInteractionGlyph('@', index, 100));
    expect(getAsciiInteractionGlyph('@', index, 0)).not.toBe(
      getAsciiInteractionGlyph('@', index, 200),
    );
  }
});

it('continues cycling during a longer hover instead of settling after an entrance', () => {
  expect(getAsciiInteractionGlyph('#', 3, 10000)).toMatch(/^\d$/);
  expect(getAsciiInteractionGlyph('#', 3, 10000)).not.toBe(getAsciiInteractionGlyph('#', 3, 10200));
});

it('restores the original glyph when interaction is inactive or reduced', () => {
  for (let index = 0; index < 100; index++) {
    expect(getAsciiInteractionGlyph('#', index, -1)).toBe('#');
    expect(getAsciiInteractionGlyph('+', index, Number.POSITIVE_INFINITY)).toBe('+');
  }
});
