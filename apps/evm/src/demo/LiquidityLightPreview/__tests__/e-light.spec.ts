import { readFileSync } from 'node:fs';

// The app's test pipeline intentionally stubs CSS imports, including ?raw.
const css = readFileSync('src/demo/LiquidityLightPreview/e-light.css', 'utf8');

const gate = ":root[data-glass-study='lite-experiment'][data-liquidity-theme='light']";
const colors = new Map(
  [...css.matchAll(/--e-light-([\w-]+):\s*(#[\da-f]{6});/gi)].map(([, name, value]) => [
    name,
    value,
  ]),
);
const color = (name: string) => {
  const hex = colors.get(name);
  if (!hex) throw new Error(`Missing E Light color role: ${name}`);
  return hex;
};
const luminance = (hex: string) => {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map(channel => Number.parseInt(channel, 16) / 255);
  const linear = rgb.map(value =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
};
const contrast = (foreground: string, background: string) => {
  const values = [luminance(color(foreground)), luminance(color(background))];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
};

it('gates every E Light rule so Dark, O and New are unaffected', () => {
  const selectors = css
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.endsWith('{') && !line.startsWith('@'));
  expect(selectors.length).toBeGreaterThan(20);
  for (const selector of selectors) expect(selector.startsWith(gate)).toBe(true);
});

it.each(['surface-canvas', 'surface-panel', 'surface-field', 'surface-control', 'surface-hover'])(
  'keeps readable text on %s',
  surface => {
    for (const text of ['text-primary', 'text-secondary', 'text-muted']) {
      expect(contrast(text, surface), `${text} / ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
  },
);

it.each(['accent-start', 'accent-middle', 'accent-end', 'accent-highlight', 'accent-hover'])(
  'keeps on-accent text readable on the %s gradient stop',
  stop => {
    expect(contrast('text-on-accent', stop)).toBeGreaterThanOrEqual(4.5);
  },
);

it.each(['label-start', 'label-end', 'prime-start', 'prime-end'])(
  'keeps small decorative text readable at %s',
  stop => {
    expect(contrast(stop, 'surface-panel')).toBeGreaterThanOrEqual(4.5);
  },
);

it.each(['heading-start', 'heading-end'])('keeps large title stop %s readable', stop => {
  expect(contrast(stop, 'surface-canvas')).toBeGreaterThanOrEqual(3);
});

it.each(['success', 'warning', 'danger'])('keeps on-fill text readable on %s', status => {
  expect(contrast('text-on-accent', status)).toBeGreaterThanOrEqual(4.5);
});

it('restores field focus, error and disabled states after the default rule', () => {
  const base = css.indexOf('.venus-text-field {');
  for (const state of [
    ':focus-within',
    '[data-has-error]',
    ':is([data-disabled], :has(input:disabled))',
  ]) {
    expect(css.indexOf(`.venus-text-field${state}`)).toBeGreaterThan(base);
  }
});

it('keeps market search neutral without changing the transactional field surface', () => {
  const base = css.match(/\.venus-text-field \{([^}]+)\}/)?.[1];
  const search = css.match(/\.venus-text-field\.venus-market-search-surface \{([^}]+)\}/)?.[1];
  const focused = css.match(
    /\.venus-text-field\.venus-market-search-surface:focus-within \{([^}]+)\}/,
  )?.[1];
  expect(base).toContain('background: var(--e-light-surface-field)');
  for (const state of [search, focused]) {
    expect(state).toContain('background: var(--e-light-surface-control)');
    expect(state).toContain('box-shadow: none');
  }
  expect(focused).toContain('border-color: var(--e-light-border-focus)');
});

it('uses existing title leading to leave room for descenders', () => {
  const title = css.match(/\.lite-market-title \{([^}]+)\}/)?.[1];
  expect(title).toContain('line-height: var(--text-3xl--line-height)');
});

it('leaves the Prime disc to the Figma refresh instead of forcing a white disc', () => {
  expect(css).not.toMatch(/\.venus-prime-token-icon circle \{/);
  expect(css).not.toMatch(/\.venus-prime-token-icon path \{/);
});
