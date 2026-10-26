import { readFileSync } from 'node:fs';

const css = readFileSync('src/demo/GlassVersions/e2.css', 'utf8');
const finalShadow = css.slice(css.indexOf('/* Final market frame:'));
const selector =
  '#root .lite-experiment :is(.lite-experiment-scroll, .lite-inline-sources, .lite-inline-market)';

it('adds one short downward shadow to the Final main frame in each theme', () => {
  const shadows = [...finalShadow.matchAll(/box-shadow:\s*([^;]+);/g)].map(([, value]) => value);
  expect(shadows).toEqual([
    '0 var(--spacing) calc(var(--spacing) * 3) calc(var(--spacing) * -1) rgb(0 0 0 / 18%) !important',
    '0 var(--spacing) calc(var(--spacing) * 3) calc(var(--spacing) * -1) rgb(31 53 83 / 10%) !important',
  ]);
  for (const shadow of shadows) expect(shadow).not.toMatch(/,|inset/);
});

it('limits the new shadow to Final lists, sources and inline forms', () => {
  expect(finalShadow).toContain(`:root[data-glass-variant='lite-experiment-v2'] ${selector}`);
  expect(finalShadow).toContain(
    `:root[data-glass-variant='lite-experiment-v2'][data-liquidity-theme='light'] ${selector}`,
  );
  expect(finalShadow).not.toMatch(
    /lite-experiment-v2-legacy|lite-experiment-v3|planet|venus-popup-panel/,
  );
});

it('does not change the main frame material, spacing or shared design tokens', () => {
  expect(finalShadow).not.toMatch(
    /background:|border:|backdrop-filter:|padding:|margin:|--[\w-]+\s*:/,
  );
  expect(finalShadow).not.toContain('var(--e-light-shadow-panel)');
});
