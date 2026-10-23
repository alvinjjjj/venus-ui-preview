import { initialPreviewSession, previewSessionReducer } from './scenario';

it('starts a fresh homepage visit in Lite without choosing a preference', () => {
  const chosen = previewSessionReducer(initialPreviewSession, { type: 'choose', mode: 'pro' });
  const next = previewSessionReducer(chosen, { type: 'scenario', scenario: 'first-home' });
  expect(next).toMatchObject({
    mode: 'lite',
    introOpen: false,
    preference: null,
    hasSeenIntro: false,
    visit: 'first',
    entry: 'home',
  });
});

it('resets a first Pro visit to the dismissible introduction', () => {
  const chosen = previewSessionReducer(initialPreviewSession, { type: 'choose', mode: 'lite' });
  expect(previewSessionReducer(chosen, { type: 'scenario', scenario: 'first-pro' })).toEqual(
    initialPreviewSession,
  );
});

it.each(['lite', 'pro'] as const)('revisits the homepage in explicitly chosen %s mode', mode => {
  const chosen = previewSessionReducer(initialPreviewSession, { type: 'choose', mode });
  expect(
    previewSessionReducer(chosen, { type: 'scenario', scenario: 'return-home' }),
  ).toMatchObject({ mode, preference: mode, introOpen: false, visit: 'returning', entry: 'home' });
});

it('does not infer a Pro preference from dismissing the introduction', () => {
  const dismissed = previewSessionReducer(initialPreviewSession, { type: 'dismiss' });
  expect(dismissed).toMatchObject({ mode: 'pro', preference: null, introOpen: false });
  expect(previewSessionReducer(dismissed, { type: 'scenario', scenario: 'return-home' }).mode).toBe(
    'lite',
  );
});

it('honors a Pro deep link even if the saved preview preference is Lite', () => {
  const chosen = previewSessionReducer(initialPreviewSession, { type: 'choose', mode: 'lite' });
  expect(previewSessionReducer(chosen, { type: 'scenario', scenario: 'return-pro' })).toMatchObject(
    { mode: 'pro', preference: 'lite', introOpen: false, entry: 'core' },
  );
});

it('introduces Pro only once when entering from a fresh Lite homepage', () => {
  const fresh = previewSessionReducer(initialPreviewSession, {
    type: 'scenario',
    scenario: 'first-home',
  });
  const pro = previewSessionReducer(fresh, { type: 'scenario', scenario: 'return-pro' });
  expect(pro.introOpen).toBe(true);
  const dismissed = previewSessionReducer(pro, { type: 'dismiss' });
  expect(
    previewSessionReducer(dismissed, { type: 'scenario', scenario: 'return-pro' }).introOpen,
  ).toBe(false);
});

it('replays and logo navigation do not overwrite a chosen preference', () => {
  const chosen = previewSessionReducer(initialPreviewSession, { type: 'choose', mode: 'lite' });
  const replayed = previewSessionReducer(chosen, { type: 'replay' });
  expect(replayed).toMatchObject({ mode: 'pro', preference: 'lite', introOpen: true });
  expect(previewSessionReducer(chosen, { type: 'home' }).preference).toBe('lite');
});
