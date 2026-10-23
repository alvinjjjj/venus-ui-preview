import type { PreviewScenario, PreviewSession } from './scenario';
import './scenario-remote.css';

const scenarios: { value: PreviewScenario; label: string; description: string }[] = [
  { value: 'first-home', label: '首次進入首頁', description: 'Venus.io → Lite，冇彈窗' },
  { value: 'first-pro', label: '首次進入 Pro', description: 'Core pool → 引導，可關閉' },
  { value: 'return-home', label: '重訪首頁', description: '跟隨模擬嘅已選模式' },
  { value: 'return-pro', label: '重訪 Pro 連結', description: '保留原頁，未睇過先提示' },
];

interface ScenarioRemoteProps {
  session: PreviewSession;
  expanded: boolean;
  theme: 'light' | 'dark';
  onExpand: (expanded: boolean) => void;
  onScenario: (scenario: PreviewScenario) => void;
  onReplay: () => void;
  onTheme: () => void;
}

export function ScenarioRemote({
  session,
  expanded,
  theme,
  onExpand,
  onScenario,
  onReplay,
  onTheme,
}: ScenarioRemoteProps) {
  return (
    <aside
      className="intro-scenario-remote"
      data-expanded={expanded}
      aria-label="情境遙控器"
      lang="zh-Hant"
      onKeyDown={event => {
        if (event.key === 'Escape' && expanded) {
          event.preventDefault();
          event.stopPropagation();
          onExpand(false);
        }
      }}
    >
      <button
        className="intro-remote-toggle"
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? '收起情境遙控器' : '開啟情境遙控器'}
        onClick={() => onExpand(!expanded)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7h7m4 0h5M4 17h3m4 0h9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>
          <strong>情境遙控器</strong>
          <small>
            {session.visit === 'first' ? '首次' : '重訪'} ·{' '}
            {session.mode === 'lite' ? 'Lite' : 'Pro'} ·{' '}
            {session.preference
              ? `已選 ${session.preference === 'lite' ? 'Lite' : 'Pro'}`
              : '未選模式'}
          </small>
        </span>
        <svg className="intro-remote-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path
            d="m7 14 5-5 5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {expanded && (
        <div className="intro-remote-body">
          <div className="intro-remote-scenarios" role="group" aria-label="模擬進站情境">
            {scenarios.map(scenario => (
              <button type="button" key={scenario.value} onClick={() => onScenario(scenario.value)}>
                <strong>{scenario.label}</strong>
                <small>{scenario.description}</small>
              </button>
            ))}
          </div>
          <div className="intro-remote-comment">
            <dl>
              <div>
                <dt>入口</dt>
                <dd>{session.entry === 'home' ? 'Venus.io' : 'Core pool 連結'}</dd>
              </div>
              <div>
                <dt>已選模式</dt>
                <dd>
                  {session.preference === null
                    ? '未選擇'
                    : session.preference === 'lite'
                      ? 'Lite'
                      : 'Pro'}
                </dd>
              </div>
              <div>
                <dt>引導</dt>
                <dd>{session.introOpen ? '顯示中' : session.hasSeenIntro ? '已睇過' : '未顯示'}</dd>
              </div>
            </dl>
            <p role="status">{session.comment}</p>
          </div>
          <div className="intro-remote-actions">
            <span>只作模擬，重新整理即重設</span>
            <div>
              <button type="button" onClick={onReplay}>
                重播引導
              </button>
              <button
                type="button"
                aria-label={`遙控器切換至 ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                onClick={onTheme}
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
