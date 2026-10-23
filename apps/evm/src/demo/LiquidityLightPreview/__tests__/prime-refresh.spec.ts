import { readFileSync } from 'node:fs';

// CSS imports are stubbed by the app test pipeline; inspect the source contract.
const css = readFileSync('src/demo/LiquidityLightPreview/prime-refresh.css', 'utf8');
const gate = ":root[data-glass-study='lite-experiment']";
const lightCss = readFileSync('src/demo/LiquidityLightPreview/e-light.css', 'utf8');
const rgb = (hex: string) =>
  hex
    .slice(1)
    .match(/../g)!
    .map(value => Number.parseInt(value, 16));
const contrast = (foreground: number[], background: number[]) => {
  const luminance = (channels: number[]) =>
    channels.reduce((sum, channel, index) => {
      const value = channel / 255;
      const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      return sum + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
};

it('keeps the copper refresh within the E preview', () => {
  const selectors = css
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.endsWith('{') && !line.startsWith('@'));
  expect(selectors.length).toBeGreaterThan(10);
  for (const selector of selectors) expect(selector.startsWith(gate)).toBe(true);
});

it('uses the existing vector with a copper disc in both themes', () => {
  expect(css).toContain('--lite-prime-disc-fill: linear-gradient(');
  expect(css).toContain('background: var(--lite-prime-disc-fill)');
  expect(css).toContain('width: calc(var(--spacing) * 4)');
  expect(css).toContain('height: calc(var(--spacing) * 4)');
  expect(css).toMatch(/\.venus-prime-token-icon circle \{\s*fill: none;/);
  expect(css).toMatch(/\.venus-prime-token-icon path \{\s*fill: var\(--lite-prime-mark\);/);
});

it('matches the Figma geometry without adding border height', () => {
  expect(css).toContain('padding: calc(var(--spacing) / 2) var(--spacing)');
  expect(css).toContain('font-size: var(--text-sm)');
  expect(css).toContain('font-weight: var(--font-weight-semibold)');
  expect(css).toContain('line-height: var(--text-sm--line-height)');
  expect(css).toContain('border: 0 !important');
  expect(css).toMatch(/\[data-apy-badge='prime'\] > span \{\s*gap: var\(--spacing\);/);
  expect(css).toMatch(/::after \{[^}]*inset: 0;[^}]*padding: 1px;/);
});

it('uses separate neutral hover and pressed surfaces for each theme', () => {
  expect(css.match(/--lite-prime-hover:/g)).toHaveLength(2);
  expect(css.match(/--lite-prime-active:/g)).toHaveLength(2);
  expect(css).toContain(':is(:hover, :focus-visible):not(:disabled)');
  expect(css).toContain('background: var(--lite-prime-hover) !important');
  expect(css).toContain(":is(:active, [data-venus-button-active='true']):not(:disabled)");
  expect(css).toContain('background: var(--lite-prime-active) !important');
});

it('keeps readable light copper text and visible keyboard focus', () => {
  expect(css).toContain('var(--e-light-prime-start)');
  expect(css).toContain('var(--e-light-prime-end)');
  expect(css).toContain('outline: 2px solid var(--color-blue)');
  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  expect(css).toContain('transition: none !important');
});

it('keeps dark copper numeral stops readable on hover and pressed surfaces', () => {
  const stopNames = ['start', 'highlight', 'end'];
  const surfaces = [...css.matchAll(/--lite-prime-(?:hover|active):\s*(#[\da-f]{6});/gi)]
    .slice(0, 2)
    .map(([, hex]) => rgb(hex));
  for (const name of stopNames) {
    const stop = rgb(
      css.match(new RegExp(`--lite-prime-text-${name}:\\s*(#[\\da-f]{6});`, 'i'))![1],
    );
    for (const surface of surfaces) expect(contrast(stop, surface)).toBeGreaterThanOrEqual(4.5);
  }
});

it('keeps the derived light highlight readable on hover and pressed surfaces', () => {
  const start = rgb(lightCss.match(/--e-light-prime-start:\s*(#[\da-f]{6});/i)![1]);
  const end = rgb(lightCss.match(/--e-light-prime-end:\s*(#[\da-f]{6});/i)![1]);
  const mix = Number(css.match(/color-mix\(in srgb, var\(--e-light-prime-end\) (\d+)%/i)![1]) / 100;
  const highlight = end.map((channel, index) => channel * mix + start[index] * (1 - mix));
  const surfaces = [...css.matchAll(/--lite-prime-(?:hover|active):\s*(#[\da-f]{6});/gi)]
    .slice(2)
    .map(([, hex]) => rgb(hex));
  for (const stop of [start, highlight]) {
    for (const surface of surfaces) expect(contrast(stop, surface)).toBeGreaterThanOrEqual(4.5);
  }
});
