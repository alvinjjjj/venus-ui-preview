import { getPlanetPopupPosition } from './planet-popup-position';

const defaults = {
  panel: { width: 256, height: 192 },
  viewport: { width: 1440, height: 900 },
  gutter: 16,
  gap: 8,
};

it('opens a lower-right planet card above its trigger without cropping', () => {
  const position = getPlanetPopupPosition({
    ...defaults,
    anchor: { left: 1240, right: 1368, top: 585, bottom: 713 },
  });
  expect(position).toMatchObject({ top: 385, left: 1112 });
  expect(position.top + defaults.panel.height).toBeLessThanOrEqual(884);
});

it('keeps an upper planet card below its trigger', () => {
  expect(
    getPlanetPopupPosition({
      ...defaults,
      anchor: { left: 72, right: 216, top: 210, bottom: 354 },
    }),
  ).toMatchObject({ top: 362, left: 72 });
});

it.each([
  { left: -20, right: 108, expectedLeft: 16 },
  { left: 1330, right: 1458, expectedLeft: 1168 },
])('keeps a card inside the horizontal viewport edge at $left', anchor => {
  const position = getPlanetPopupPosition({
    ...defaults,
    anchor: { ...anchor, top: 210, bottom: 354 },
  });
  expect(position.left).toBe(anchor.expectedLeft);
});

it('limits a long market card to a short viewport so its contents can scroll', () => {
  const position = getPlanetPopupPosition({
    ...defaults,
    panel: { width: 256, height: 600 },
    viewport: { width: 1440, height: 400 },
    anchor: { left: 1240, right: 1368, top: 180, bottom: 308 },
  });
  expect(position).toMatchObject({ top: 16, maxHeight: 368 });
});
