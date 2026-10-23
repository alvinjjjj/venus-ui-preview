import { readFileSync } from 'node:fs';

const css = readFileSync('src/pages/LiteMarkets/experiment.css', 'utf8');

it('puts the compact footer below the phone market viewport without collapsing the token body', () => {
  expect(css).toContain('.lite-experiment-layout { overflow-y: auto !important; }');
  expect(css).toContain(
    '.lite-experiment-layout > .relative { flex: 0 0 auto; overflow: visible; }',
  );
  expect(css).toContain(
    '.lite-experiment-layout > .relative > .relative { flex: 0 0 auto; height: 100svh; }',
  );
});

it('keeps remounted Earn/Borrow list surfaces solid instead of replaying a card fade', () => {
  const card = css.match(/\.lite-enter--markets \.lite-experiment-scroll \{([^}]+)\}/)?.[1];
  expect(card).toContain('animation: none');
  const fadeSelectors = [...css.matchAll(/([^{}]+)\{[^{}]*animation: lite-e-fade[^{}]*\}/g)];
  expect(fadeSelectors.length).toBeGreaterThan(0);
  for (const [, selector] of fadeSelectors) {
    expect(selector).not.toContain('.lite-experiment-scroll');
  }
});

it('quiets only E transactional form dividers in both themes', () => {
  const rule = css.match(
    /(:root\[data-glass-study='lite-experiment'\] :is\(\.venus-popup-panel, \.lite-inline-market\) form hr) \{([^}]+)\}/,
  );
  expect(rule).not.toBeNull();
  expect(rule?.[1]).not.toContain('data-liquidity-theme');
  expect(rule?.[2]).toContain('var(--color-dark-blue-hover) 40%, transparent');
});
