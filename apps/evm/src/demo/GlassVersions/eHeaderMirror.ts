/**
 * E (lite-experiment) keeps O's page materials, but its header and its Pro buttons should look
 * exactly like New's.
 *
 * Rather than hand-copying every New rule (and letting the copies drift), this mirrors them at
 * runtime: every CSS rule whose `:root` condition matches New but not E is re-emitted for E,
 * limited to
 *  - elements inside the header (`.venus-navigation`), and
 *  - buttons, button groups (segmented controls such as 30D / 6M / 1Y), toggles, progress /
 *    health bars and the Settings theme switch, anywhere outside the Lite E market pages and
 *    popups.
 * The logo, the Pro/Lite label, the Lite/Pro switch and the header row (height, background) keep
 * E's own design, as do the Lite E market pages and transaction popups.
 */

const STYLE_ID = 'venus-e-header-mirror';
const E_ROOT = ":root[data-glass-study='lite-experiment']";
const BUTTONS = [
  '[data-venus-button-group]',
  '[data-venus-button-group] *',
  '[data-venus-button-variant]',
  '[data-venus-button-variant] *',
  ".venus-settings [role='group'][aria-label='Theme']",
  ".venus-settings [role='group'][aria-label='Theme'] *",
  // Toggles and progress / health bars (track, fill, liquidation-threshold mark).
  '.venus-toggle',
  '.venus-toggle *',
  '.venus-progress-rail',
  '.venus-progress-rail *',
  '.venus-progress-mark',
].join(', ');
const SCOPE = `:is(.venus-navigation *, ${BUTTONS})`;
const KEEP_E =
  ':not(.venus-header-row, .venus-header-logo, .venus-header-logo *, .venus-interface-mode-label, .venus-mode-switch, .venus-mode-switch *, .lite-markets *, .venus-popup-panel *)';

const NEW_ATTRS: Record<string, string> = {
  glassVersion: 'v6',
  glassPreview: 'v5',
  glassMode: 'explorer',
  glassChoice: 'v5',
  glassStudy: 'v5',
};
const E_ATTRS: Record<string, string> = {
  glassVersion: 'v1',
  glassPreview: 'v1',
  glassMode: 'v1',
  glassChoice: 'v1',
  glassStudy: 'lite-experiment',
};

// Root conditions that are not about the design version (theme, landing route) are carried over.
const PRESERVED_ROOT_BITS =
  /:not\(\[data-(?:liquidity-theme|glass-landing)[^\]]*\]\)|\[data-(?:liquidity-theme|glass-landing)[^\]]*\]/g;

const makeProbe = (attrs: Record<string, string>) => {
  const el = document.createElement('div');
  el.className = '__venus-mirror-root';
  Object.entries(attrs).forEach(([key, value]) => {
    el.dataset[key] = value;
  });
  return el;
};

/** Split a selector list on top-level commas. */
const splitList = (selector: string) => {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (quote) {
      if (ch === quote && selector[i - 1] !== '\\') quote = '';
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selector.slice(start).trim());
  return parts;
};

/** Length of the leading compound selector (up to the first top-level combinator). */
const firstCompoundLength = (selector: string) => {
  let depth = 0;
  let quote = '';
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if (quote) {
      if (ch === quote && selector[i - 1] !== '\\') quote = '';
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (depth === 0 && /[\s>+~]/.test(ch)) return i;
  }
  return selector.length;
};

const PSEUDO_ELEMENT_TAIL =
  /((?:::?(?:before|after|placeholder|selection|marker|backdrop|first-line|first-letter|-webkit-[\w-]+|-moz-[\w-]+))+)$/;

const rewriteSelector = (selector: string, probeNew: HTMLElement, probeE: HTMLElement) => {
  let rootCompound: string;
  let rest: string;
  if (/^(:root|html)/.test(selector) || selector.startsWith('[data-glass')) {
    const length = firstCompoundLength(selector);
    rootCompound = selector.slice(0, length);
    rest = selector.slice(length).trim();
  } else return null;
  if (!/data-glass/.test(rootCompound)) return null;

  const preserved = rootCompound.match(PRESERVED_ROOT_BITS)?.join('') ?? '';
  const testable = rootCompound
    .replace(PRESERVED_ROOT_BITS, '')
    .replace(/^(:root|html)/, '.__venus-mirror-root');
  const probeSelector = testable.startsWith('.__venus-mirror-root')
    ? testable
    : `.__venus-mirror-root${testable}`;
  try {
    if (!probeNew.matches(probeSelector) || probeE.matches(probeSelector)) return null;
  } catch {
    return null;
  }

  const root = `${E_ROOT}${preserved}`;
  // A rule on the root itself: only its custom properties are useful, re-homed on the header.
  if (!rest) return { selector: `${root} .venus-navigation`, rootOnly: true };

  const tail = rest.match(PSEUDO_ELEMENT_TAIL)?.[1] ?? '';
  const subject = tail ? rest.slice(0, -tail.length) : rest;
  return { selector: `${root} ${subject}${SCOPE}${KEEP_E}${tail}`, rootOnly: false };
};

const mirrorRules = (
  rules: CSSRuleList,
  probeNew: HTMLElement,
  probeE: HTMLElement,
  out: string[],
) => {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const declarations = rule.style.cssText;
      if (!declarations) continue;
      const rewritten = splitList(rule.selectorText)
        .map(part => rewriteSelector(part, probeNew, probeE))
        .filter((item): item is { selector: string; rootOnly: boolean } => !!item);
      const scoped = rewritten.filter(item => !item.rootOnly).map(item => item.selector);
      if (scoped.length) out.push(`${scoped.join(',\n')} { ${declarations} }`);
      const rootOnly = rewritten.filter(item => item.rootOnly).map(item => item.selector);
      if (rootOnly.length) {
        const customProperties = Array.from(rule.style)
          .filter(name => name.startsWith('--'))
          .map(
            name =>
              `${name}: ${rule.style.getPropertyValue(name)}${
                rule.style.getPropertyPriority(name) ? ' !important' : ''
              };`,
          )
          .join(' ');
        if (customProperties) out.push(`${rootOnly.join(',\n')} { ${customProperties} }`);
      }
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      const inner: string[] = [];
      mirrorRules(rule.cssRules, probeNew, probeE, inner);
      if (inner.length) {
        const prelude =
          rule instanceof CSSMediaRule
            ? `@media ${rule.conditionText}`
            : `@supports ${rule.conditionText}`;
        out.push(`${prelude} {\n${inner.join('\n')}\n}`);
      }
    } else if (typeof CSSLayerBlockRule !== 'undefined' && rule instanceof CSSLayerBlockRule) {
      const inner: string[] = [];
      mirrorRules(rule.cssRules, probeNew, probeE, inner);
      if (inner.length) out.push(`@layer ${rule.name} {\n${inner.join('\n')}\n}`);
    }
  }
};

const buildMirrorCss = () => {
  const probeNew = makeProbe(NEW_ATTRS);
  const probeE = makeProbe(E_ATTRS);
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    if (sheet.ownerNode instanceof HTMLElement && sheet.ownerNode.id === STYLE_ID) continue;
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet (fonts)
    }
    mirrorRules(rules, probeNew, probeE, out);
  }
  return out.join('\n');
};

/** Start mirroring New's header styles into E. Returns a cleanup function. */
export const mountEHeaderMirror = () => {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  document.head.appendChild(style);

  let frame = 0;
  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const css = buildMirrorCss();
      if (style.textContent !== css) style.textContent = css;
    });
  };
  refresh();

  // Route chunks load their CSS lazily; rebuild when new stylesheets arrive (HMR included).
  const observer = new MutationObserver(mutations => {
    // Ignore the mirror's own writes; anything else in <head> may be a new or updated sheet.
    if (mutations.some(mutation => mutation.target !== style && mutation.target.parentNode !== style)) {
      refresh();
    }
  });
  observer.observe(document.head, { childList: true, subtree: true, characterData: true });

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    style.remove();
  };
};
