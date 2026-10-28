import {
  INTRODUCTION_SEEN_KEYS,
  createIntroductionHistory,
  getAutomaticIntroduction,
  isProEntryPath,
  isProPage,
} from '../policy';

it.each([
  '/liquidity-hubs',
  '/liquidity-hubs/0x123',
  '/markets/0x123/0x456',
  '/dashboard',
  '/vaults',
  '/governance/proposal/123',
  '/spoke/0x123/0x456',
  '/prime-leaderboard',
])('recognizes the Pro product page %s', pathname => {
  expect(isProPage(pathname)).toBe(true);
});

it.each(['/', '/about-us', '/skills', '/privacy-policy', '/terms-of-use', '/component/buttons'])(
  'does not treat %s as a Pro product page',
  pathname => expect(isProPage(pathname)).toBe(false),
);

it.each(['/account', '/account/positions', '/pool/0x123', '/staking/xvs'])(
  'recognizes the external legacy Pro link %s without presenting before redirect',
  pathname => {
    expect(isProEntryPath(pathname)).toBe(true);
    expect(isProPage(pathname)).toBe(false);
  },
);

it.each([
  ['external Pro', '/liquidity-hubs', 'pro', undefined, true, 'lite'],
  ['external guest Pro', '/dashboard', 'pro', undefined, true, 'lite'],
  [
    'explicit Lite Dashboard has no arrival invitation',
    '/dashboard',
    'lite',
    undefined,
    true,
    null,
  ],
  [
    'Lite to Pro is not an arrival invitation',
    '/liquidity-hubs',
    'pro',
    'lite-to-pro',
    false,
    null,
  ],
  [
    'old transition state does not trigger Pro',
    '/liquidity-hubs',
    'pro',
    'lite-to-pro',
    true,
    null,
  ],
  ['uncommitted Pro transition', '/liquidity-hubs', 'lite', 'lite-to-pro', true, null],
  ['internal Pro navigation', '/dashboard', 'pro', undefined, false, null],
  ['manual preview is separate', '/liquidity-hubs', 'pro', 'introduction-preview', true, null],
  ['direct Lite introduces Pro', '/', 'lite', undefined, true, 'pro'],
  ['internal Lite navigation is not a fresh arrival', '/', 'lite', undefined, false, null],
  ['Pro-mode root waits for the existing Pro redirect', '/', 'pro', undefined, true, null],
  [
    'Try Pro does not chain a Lite popup',
    '/liquidity-hubs',
    'pro',
    'introduction-switch',
    true,
    null,
  ],
  ['Try Lite does not chain a Pro popup', '/', 'lite', 'introduction-switch', true, null],
  ['marketing page', '/about-us', 'pro', undefined, true, null],
] as const)(
  '%s selects only the intended introduction',
  (_, pathname, mode, transition, direct, expected) => {
    expect(getAutomaticIntroduction({ pathname, mode, transition, directEntry: direct })).toBe(
      expected,
    );
  },
);

it('persists the two shown flags independently across history instances', () => {
  const first = createIntroductionHistory();
  expect(first.hasSeen('lite')).toBe(false);
  expect(first.hasSeen('pro')).toBe(false);
  first.markSeen('pro');
  const second = createIntroductionHistory();
  expect(second.hasSeen('pro')).toBe(true);
  expect(second.hasSeen('lite')).toBe(false);
  second.markSeen('lite');
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.pro)).toBe('true');
  expect(localStorage.getItem(INTRODUCTION_SEEN_KEYS.lite)).toBe('true');
});

it('does not infer shown introductions from the wallet, mode or old preview state', () => {
  localStorage.setItem('venus-glass-version', 'lite-experiment');
  localStorage.setItem('interfaceMode', 'pro');
  localStorage.setItem(INTRODUCTION_SEEN_KEYS.pro, 'invalid');
  const history = createIntroductionHistory();
  expect(history.hasSeen('pro')).toBe(false);
  expect(history.hasSeen('lite')).toBe(false);
  history.markSeen('lite');
  expect(localStorage.getItem('interfaceMode')).toBe('pro');
  expect(localStorage.getItem('venus-glass-version')).toBe('lite-experiment');
});

it('does not reuse the old acknowledgement shown after already entering Pro', () => {
  localStorage.setItem('venus-interface-intro-pro-seen-v1', 'true');
  expect(createIntroductionHistory().hasSeen('pro')).toBe(false);
});

it('keeps a document-level fallback if storage access is blocked', () => {
  const history = createIntroductionHistory(() => {
    throw new Error('Storage blocked');
  });
  expect(history.hasSeen('lite')).toBe(false);
  expect(() => history.markSeen('lite')).not.toThrow();
  expect(history.hasSeen('lite')).toBe(true);
  expect(history.hasSeen('pro')).toBe(false);
});

it('keeps a document-level fallback if the storage quota is exhausted', () => {
  const history = createIntroductionHistory(() => ({
    getItem: () => null,
    setItem: () => {
      throw new Error('Quota exceeded');
    },
  }));
  history.markSeen('pro');
  expect(history.hasSeen('pro')).toBe(true);
  expect(history.hasSeen('lite')).toBe(false);
});
