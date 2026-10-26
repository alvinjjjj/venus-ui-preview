import { readFileSync } from 'node:fs';

const css = readFileSync('src/demo/GlassVersions/e2.css', 'utf8');

it('applies title study A only to E2 Dark with existing responsive type and accessible fallbacks', () => {
  const title = css.match(/#root \.lite-market-title \{[^}]+\}/)?.[0] ?? '';
  expect(title).toContain('font-weight: var(--font-weight-normal);');
  expect(css).toContain('line-height: var(--text-3xl--line-height);');
  expect(css).toContain('text-wrap: balance;');
  expect(css).toMatch(
    /@media \(min-width: 768px\) \{\s*:root\[data-glass-revision='lite-experiment-v2'\] #root \.lite-market-title \{\s*font-size: var\(--text-h3\);/,
  );
  expect(css).toContain('@media (forced-colors: none)');
  expect(css).toContain(
    ":root[data-glass-revision='lite-experiment-v2']:not([data-liquidity-theme='light']) #root .lite-market-title",
  );
  const gradient = css.match(/background-image: linear-gradient\(180deg, #d9edff[^}]+/)?.[0] ?? '';
  expect(gradient).toContain('#99c8ff 50%, #598eff 100%');
  expect(gradient).toContain('background-size: 100% 100%;');
  expect(gradient).toContain('animation: none;');
});

it('restores the supporting copy and centers the grouped market stage only on desktop', () => {
  expect(css).toContain('#root .lite-market-heading > p {');
  expect(css).toMatch(/#root \.lite-market-container \{\s*padding-top: 0;/);
  expect(css).toMatch(
    /#root \.lite-market-container > div \{\s*gap: calc\(var\(--spacing\) \* 3\);/,
  );
  expect(css).toMatch(/#root \.lite-e2-market-stage \{[^}]*gap: calc\(var\(--spacing\) \* 3\);/);
  expect(css).toMatch(/#root \.lite-e2-market-stage > section \{[^}]*min-height: 0;/);
  expect(css).toMatch(
    /@media \(min-width: 768px\) \{[\s\S]*?grid-template-rows: minmax\(min-content, 1fr\) minmax\(0, auto\) minmax\(0, 1fr\);/,
  );
  const layout = css.slice(0, css.indexOf('/* No navigation surface:'));
  expect(layout).not.toMatch(/100[vds]*vh|position: absolute|translateY/);
  expect(layout).toContain("#root .lite-experiment-scroll[data-loading='true'] {");
  expect(layout).toContain('min-height: min(calc(var(--spacing) * 122), 100%);');
});

it('removes the Lite navigation surface without changing controls or other preview headers', () => {
  expect(css).toMatch(
    /:root\[data-glass-revision='lite-experiment-v2'\] #root:has\(\.lite-markets\) \{\s*background-color: var\(--color-background-active\);/,
  );
  const header =
    css.match(/#root:has\(\.lite-markets\) \.venus-navigation \.venus-header-row \{[^}]+\}/)?.[0] ??
    '';
  expect(header).toContain('background: transparent;');
  expect(header).toContain('backdrop-filter: none;');
  expect(header).toContain('-webkit-backdrop-filter: none;');
  expect(header).toContain('border-bottom: 0;');
  expect(header).toContain('box-shadow: none;');
  expect(header).not.toMatch(/height:|padding:|position:|z-index:/);
  const allHeaderRules =
    css.match(/#root:has\(\.lite-markets\) \.venus-navigation \.venus-header-row \{[^}]+\}/g) ?? [];
  expect(allHeaderRules).toHaveLength(2);
  expect(allHeaderRules[1]).toContain('background: Canvas;');
  for (const rule of allHeaderRules) expect(rule).not.toContain('blur(');
});

it('keeps the earlier E2 revision fallback flat while Final owns its shadow', () => {
  const selector =
    '#root .lite-experiment :is(.lite-experiment-scroll, .lite-inline-sources, .lite-inline-market)';
  const rules = [
    ...css.matchAll(/(:root\[data-glass-revision='lite-experiment-v2'\][^{]+)\{([^}]+)\}/g),
  ]
    .filter(([, ruleSelector]) => ruleSelector.includes(selector))
    .map(([, , declarations]) => declarations);
  expect(rules).toHaveLength(2);
  for (const rule of rules) {
    expect(rule).toContain('box-shadow: none;');
    expect(rule).not.toMatch(/background:|border:|backdrop-filter:|!important/);
  }
});

it('keeps the two totals frosted, 8px-framed and responsive without a button affordance', () => {
  expect(css).toContain('.lite-e2-market-totals {');
  expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
  expect(css).toContain('grid-template-columns: minmax(0, 1fr);');
  expect(css).toContain('border-radius: var(--radius-lg);');
  expect(css).not.toContain('border-radius: var(--radius-3xl);');
  expect(css).toContain(
    'background: color-mix(in srgb, var(--color-dark-blue-active) 78%, transparent);',
  );
  expect(css).toContain('backdrop-filter: blur(12px) saturate(130%);');
  expect(css).toContain('background-color: rgb(20 24 31 / 96%);');
  expect(css).toContain('background-color: rgb(255 255 255 / 96%);');
  expect(css).toContain('flex-wrap: wrap;');
  expect(css).toContain('.lite-e2-market-total:is(:hover, :focus-within)::before');
  expect(css).toContain('transition: opacity 260ms ease-out;');
  const total = css.match(/\.lite-e2-market-totals > \.lite-e2-market-total \{[^}]+\}/)?.[0] ?? '';
  expect(total).not.toContain('cursor: pointer');
});

it('matches E3 soft-glass totals and number emphasis without opting into its rolling animation', () => {
  const e3Css = readFileSync('src/demo/GlassVersions/e3.css', 'utf8');
  for (const recipe of [
    'background: color-mix(in srgb, var(--color-dark-blue-active) 78%, transparent)',
    'backdrop-filter: blur(12px) saturate(130%);',
    'font-weight: var(--font-weight-semibold);',
  ]) {
    expect(css).toContain(recipe);
    expect(e3Css).toContain(recipe);
  }
  const amount = css.match(/#root \.lite-e2-market-total p:last-child \{[^}]+\}/)?.[0] ?? '';
  expect(amount).toContain('font-weight: var(--font-weight-semibold);');
  expect(css).not.toContain('lite-e3-digit-in');
});

it('makes the E2 horizon distinct from E3 without new animation loops or Light sky changes', () => {
  const horizon = css.slice(
    css.indexOf('/* E2 horizon study:'),
    css.indexOf('/* E2 planet discovery:'),
  );
  expect(horizon).toContain('.lite-ghost--e2-horizon:not(.lite-ghost--light-ambient)');
  expect(horizon).toContain('radial-gradient(ellipse 58% 34% at 8% 104%');
  expect(horizon).toContain('bottom: -70%;');
  expect(horizon).toContain('@media (forced-colors: active)');
  expect(horizon).not.toContain('animation:');
  expect(horizon).not.toContain('.lite-ghost--e3');
});

it('uses static green / yellow total markers with existing palette and spacing', () => {
  expect(css).toContain(
    ".lite-e2-total-dot[data-total-kind='supplyUsd'] {\n  background: var(--color-green);",
  );
  expect(css).toContain(".lite-e2-total-dot[data-total-kind='liquidityUsd'] {");
  expect(css).toContain('background: rgb(var(--color-yellow-hover-rgb));');
  expect(css).toContain('width: calc(var(--spacing) * 1.5);');
  const marker = css.match(/#root \.lite-e2-total-dot \{[^}]+\}/)?.[0] ?? '';
  expect(marker).not.toContain('animation');
});

it('uses shared Dropdown glass for interactive planets without adding a loop or covering narrow-screen controls', () => {
  const planets = css.slice(
    css.indexOf('/* E2 planet discovery:'),
    css.indexOf('/* Informational totals'),
  );
  expect(planets).toContain('pointer-events: none;');
  expect(planets).toContain('z-index: 20;');
  expect(planets).toContain('pointer-events: auto;');
  expect(planets).toContain('object-fit: contain;');
  expect(planets).toContain('@media (max-width: 1279px), (forced-colors: active)');
  expect(planets).toContain('display: none;');
  expect(planets).toContain("[data-liquidity-theme='light'] .lite-e2-token-planets");
  expect(planets).toContain('.venus-dropdown-surface.lite-e2-planet-popover');
  expect(planets).not.toMatch(/animation:|backdrop-filter:|\.lite-token-planet\b/);
});

it('stacks the Earn APY and Prime entry only in E2, with existing spacing', () => {
  const rules =
    css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .match(/:root\[data-glass-revision='lite-experiment-v2'\] \.lite-earn-apy \{[^}]+\}/)?.[0] ??
    '';
  expect(rules).toMatch(/^:root\[data-glass-revision='lite-experiment-v2'\] \.lite-earn-apy \{/);
  expect(rules).toContain('flex-direction: column;');
  expect(rules).toContain('align-items: flex-end;');
  expect(rules).toContain('gap: var(--spacing);');
  expect(rules).not.toContain('data-glass-study');
  expect(rules).not.toMatch(/font|color|background|order:/);
});

it('keeps E2 layout isolated while preserving the existing shared form and flame opt-ins', () => {
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = rules
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.endsWith('{') && !line.startsWith('@') && !/^[\d.% ,]+\s*\{$/.test(line));
  expect(selectors.length).toBeGreaterThan(3);
  for (const selector of selectors) {
    if (
      selector.startsWith(
        ":root:is([data-glass-revision='lite-experiment-v2'], [data-glass-revision='lite-experiment-v3'])",
      )
    ) {
      expect(selector).toMatch(
        /\s\.(?:lite-e2-(?:flame|promoted-fire)|inline-submit-dock|venus-text-field)\b/,
      );
    } else {
      const rootScope = selector.split(' ')[0];
      expect(rootScope).toMatch(/^:root/);
      expect(rootScope).toMatch(
        /\[data-glass-(?:revision|variant)='lite-experiment-v2(?:-legacy)?'\]/,
      );
    }
  }
});

it('reserves a compact action track only on desktop and keeps mobile targets touch-sized', () => {
  expect(css).toContain('@media (min-width: 768px)');
  expect(css).toContain('repeat(4, minmax(0, 1fr)) calc(var(--spacing) * 26)');
  expect(css).toContain('@media (max-width: 767px)');
  expect(css).toContain('min-height: calc(var(--spacing) * 11)');
});

it('gives both row edges stable breathing room inside the hover rim, including headers', () => {
  const desktopRules = css.slice(css.indexOf('@media (min-width: 768px)'));
  expect(desktopRules).toMatch(
    /\.lite-e2-asset-list :is\(td, th\):first-child \{\s*padding-inline-start: calc\(var\(--spacing\) \* 6\);/,
  );
  expect(desktopRules).toMatch(
    /\.lite-e2-asset-list :is\(td, th\):last-child \{\s*padding-inline: calc\(var\(--spacing\) \* 6\);/,
  );
  expect(desktopRules).not.toMatch(/:hover[^}]*padding/);
});

it('keeps APY smaller and bold while Liquidity matches the normal Total Supply size and weight', () => {
  const rules = css.match(/\.lite-e2-asset-list \.lite-base-apy \{[^}]+\}/)?.[0] ?? '';
  expect(rules).toContain('font-weight: var(--font-weight-bold);');
  expect(css).toMatch(/\.lite-base-apy \{\s*font-size: var\(--text-xs\);/);
  expect(css).toMatch(
    /\.lite-liquidity-amount \{\s*font-size: inherit;\s*font-weight: var\(--font-weight-normal\);/,
  );
  expect(css).toMatch(
    /@media \(min-width: 768px\)\s*\{[\s\S]*?\.lite-base-apy \{\s*font-size: var\(--text-sm\);/,
  );
  expect(rules).not.toMatch(/lite-amount-symbol|text-light-grey|prime|td:nth-child/);
});

it('uses the actual Pro border orbit instead of the white pointer spotlight', () => {
  const mirror = readFileSync('src/demo/GlassVersions/eHeaderMirror.ts', 'utf8');
  const modeCss = readFileSync('src/containers/Layout/NavBar/interface-mode.css', 'utf8');
  expect(mirror).not.toContain('.lite-e2-market-action');
  expect(modeCss).toContain('animation: venus-mode-border-orbit 4.5s linear infinite');
  expect(modeCss).toContain(
    '.venus-interface-mode-label, .venus-mode-border-flow { animation: none; }',
  );
  expect(css).toContain('animation-play-state: paused');
  expect(css).toContain('animation-play-state: running');
  expect(css).not.toContain('@keyframes venus-mode-border-orbit');
});

it('keeps only the promoted Earn border visible without changing its normal label or creating a new animation', () => {
  const promoted =
    css.match(/\.lite-e2-market-action\[data-promoted='true'\] \{[^}]+\}/)?.[0] ?? '';
  expect(promoted).toContain('background: rgb(16 18 24) !important;');
  expect(promoted).toContain('border-color: var(--color-blue) !important;');
  expect(promoted).not.toContain('font-weight:');
  expect(css).toMatch(
    /\.lite-e2-market-action\[data-promoted='true'\] \.lite-e2-action-border \{\s*opacity: 1;/,
  );
  expect(css).not.toContain('@keyframes venus-mode-border-orbit');
});

it('keeps the two-tone flame isolated, pausable and static with reduced motion', () => {
  expect(css).toContain('fill: var(--color-orange);');
  expect(css).toContain('fill: rgb(var(--color-yellow-hover-rgb));');
  expect(css).toContain('animation: lite-e2-flame-sway 1.2s ease-in-out infinite;');
  expect(css).toContain('animation-name: lite-e2-flame-core;');
  expect(css).toContain('transform-origin: 50% 100%;');
  expect(css).toContain(
    ".lite-e2-promoted-fire[data-motion-active='true'] :is(.lite-e2-flame-body, .lite-e2-flame-inner)",
  );
  expect(css).toMatch(
    /prefers-reduced-motion: reduce[\s\S]*?\.lite-e2-promoted-fire :is\(\.lite-e2-flame-body, \.lite-e2-flame-inner\) \{\s*animation: none;\s*transform: none;/,
  );
});

it('activates the token row or mobile card, with a keyboard equivalent and hover-capable gating', () => {
  expect(css).toContain('@media (hover: hover)');
  expect(css).toContain(':is(tbody tr, [data-table-card-row]):hover');
  expect(css).toContain(':is(tbody tr, [data-table-card-row]):focus-within');
  expect(css).toContain('.lite-e2-market-action:not(:disabled) .lite-e2-action-border');
});

it('keeps Earn regular until its row is hovered or keyboard-focused without changing width', () => {
  const buttonRule = css.match(/#root \.lite-e2-market-action \{[^}]+\}/)?.[0] ?? '';
  expect(buttonRule).toContain('font-weight: var(--font-weight-normal);');
  expect(buttonRule).toContain('min-width: calc(var(--spacing) * 14);');
  for (const state of ['hover', 'focus-within']) {
    const selector = `:is(tbody tr, [data-table-card-row]):${state} .lite-e2-market-action:not(:disabled) {`;
    const rule = css.slice(css.indexOf(selector)).split('}')[0];
    expect(rule).toContain('font-weight: var(--font-weight-bold);');
  }
});

it('extends the shared asset-list/action styling to Borrow without dropping its extra source column', () => {
  expect(css).toContain('.lite-e2-asset-list tr {');
  expect(css).toContain('#root .lite-e2-market-action {');
  expect(css).toContain('#root .lite-e2-borrow-sources tr {');
  expect(css).toContain(
    'minmax(0, 1.1fr) minmax(0, .8fr) minmax(0, 1fr) minmax(0, .9fr) minmax(0, 1fr)',
  );
  expect(css).toContain('.lite-borrow-apy > p {');
  expect(css).toContain('.lite-e2-preview-source-label {');
  expect(css).toMatch(/\.lite-e2-borrow-action \{\s*min-width: calc\(var\(--spacing\) \* 18\);/);
  expect(css).toMatch(
    /\.lite-e2-borrow-list tr \{\s*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\) calc\(var\(--spacing\) \* 30\);/,
  );
});

it('keeps the Borrow modal refinement scoped, 8px-framed and without a new cast shadow', () => {
  const modal = css.match(/\.venus-popup-panel\.lite-e2-borrow-modal \{[^}]+\}/)?.[0] ?? '';
  expect(modal).toContain('border-radius: var(--radius-lg);');
  expect(modal).toContain('box-shadow: none;');
  expect(modal).not.toMatch(/position:|display:|opacity:|pointer-events:/);
  expect(css).toContain('.lite-e2-borrow-modal dl > div {');
});
