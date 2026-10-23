// Preview-only session: never read or write storage, wallet state or real routes.
export type PreviewMode = 'lite' | 'pro';
export type PreviewScenario = 'first-home' | 'first-pro' | 'return-home' | 'return-pro';
export interface PreviewSession {
  mode: PreviewMode;
  introOpen: boolean;
  preference: PreviewMode | null;
  hasSeenIntro: boolean;
  visit: 'first' | 'returning';
  entry: 'home' | 'core';
  comment: string;
}

export const initialPreviewSession: PreviewSession = {
  mode: 'pro',
  introOpen: true,
  preference: null,
  hasSeenIntro: true,
  visit: 'first',
  entry: 'core',
  comment: '首次由 Core pool 連結進入：先睇引導。關閉會留喺 Pro，撳 Try Lite 先記住 Lite。',
};

export type PreviewAction =
  | { type: 'scenario'; scenario: PreviewScenario }
  | { type: 'choose'; mode: PreviewMode }
  | { type: 'home' }
  | { type: 'dismiss' }
  | { type: 'replay' };

export function previewSessionReducer(
  state: PreviewSession,
  action: PreviewAction,
): PreviewSession {
  switch (action.type) {
    case 'choose':
      return {
        ...state,
        mode: action.mode,
        introOpen: false,
        preference: action.mode,
        entry: action.mode === 'lite' ? 'home' : 'core',
        comment: `已選擇 ${
          action.mode === 'lite' ? 'Lite' : 'Pro'
        }。試「重訪首頁」睇記住選擇嘅效果；Pro 深連結仍會保留原頁。`,
      };
    case 'dismiss':
      return {
        ...state,
        introOpen: false,
        hasSeenIntro: true,
        comment: '已關閉引導，留喺 Pro，唔會自動改偏好。再訪同一個 Pro 連結唔會重複彈窗。',
      };
    case 'home':
      return { ...state, introOpen: false, entry: state.mode === 'lite' ? 'home' : 'core' };
    case 'replay':
      return {
        ...state,
        mode: 'pro',
        entry: 'core',
        introOpen: true,
        hasSeenIntro: true,
        comment:
          '只重播引導，保留目前嘅模擬偏好。想由零開始，揀「首次進入首頁」或「首次進入 Pro」。',
      };
    case 'scenario':
      switch (action.scenario) {
        case 'first-pro':
          return { ...initialPreviewSession };
        case 'first-home':
          return {
            ...initialPreviewSession,
            mode: 'lite',
            introOpen: false,
            hasSeenIntro: false,
            entry: 'home',
            comment: '首次打開 Venus.io：直接睇 Lite，唔彈引導，亦未設定任何偏好。',
          };
        case 'return-home':
          return {
            ...state,
            mode: state.preference ?? 'lite',
            introOpen: false,
            visit: 'returning',
            entry: 'home',
            comment: state.preference
              ? `重訪 Venus.io：跟隨上次明確選擇，顯示 ${
                  state.preference === 'lite' ? 'Lite' : 'Pro'
                }。`
              : '未有已選模式，首頁預設 Lite。單純關閉引導唔等於選擇 Pro。',
          };
        case 'return-pro':
          return {
            ...state,
            mode: 'pro',
            introOpen: !state.hasSeenIntro,
            hasSeenIntro: true,
            visit: 'returning',
            entry: 'core',
            comment: state.hasSeenIntro
              ? '保留 Core pool 深連結；已睇過引導，今次唔再彈窗，亦唔會強制跳去 Lite。'
              : '保留 Core pool 深連結。因為未睇過 Pro 引導，今次先顯示一次；仍然可以關閉。',
          };
      }
  }
}
