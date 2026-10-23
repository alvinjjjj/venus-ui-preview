import { Icon } from 'components/Icon';
import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router';
import { useIntroductionPreview } from '../InterfaceOnboarding/previewStore';
import lightIcon from '../ThemeSetting/dark.svg';
import darkIcon from '../ThemeSetting/light.svg';
import { useInterfaceMode } from '../useInterfaceMode';
import { useDemoTheme, useLiquidityLightPreview } from '../useLiquidityLightPreview';
import { ChangeNotes } from './ChangeNotes';
import { MotionControls } from './MotionControls';
import './button-materials.css';
import './controller.css';
import { mountEHeaderMirror } from './eHeaderMirror';
import {
  type GlassPreviewMode,
  isExplorerMode,
  landingDesignByMode,
  previewDesignByMode,
  useGlassPreview,
} from './store';
import './styles.css';
import './v5-button-refresh.css';
import './v5-buttons.css';

const versions: { id: GlassPreviewMode; label: string; description: string }[] = [
  { id: 'v1', label: 'O', description: 'Original' },
  { id: 'v5', label: 'New', description: 'New' },
  { id: 'lite-experiment', label: 'E', description: 'Lite experiment' },
];

export const GlassVersions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notes, setNotes] = useState(false);
  const [motionOpen, setMotionOpen] = useState(false);
  const previewIntroduction = useIntroductionPreview(state => state.preview);
  const { isLite } = useInterfaceMode();
  const isLight = useLiquidityLightPreview();
  const saveTheme = useDemoTheme(state => state.setTheme);
  const toggleTheme = () => {
    saveTheme(isLight ? 'dark' : 'light');
    const params = new URLSearchParams(location.search);
    params.delete('theme');
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };
  const version = useGlassPreview(state => state.mode);
  const setVersion = useGlassPreview(state => state.setMode);
  const styleVersion = previewDesignByMode[version];
  const landingVersion = landingDesignByMode[version];
  // O/New now enter the product; their marketing composition lives at About Us.
  // Keep Explorer's existing landing and its landing-specific materials intact.
  const isLandingRoute = isExplorerMode(version)
    ? location.pathname.replace(/\/$/, '') === '/about-us'
    : location.pathname === '/';
  useLayoutEffect(() => {
    // V5 shares V4 materials, with a separate button shape override.
    document.documentElement.dataset.glassVersion = styleVersion === 'v5' ? 'v6' : styleVersion;
    document.documentElement.dataset.glassPreview = styleVersion;
    // New mirrors Explorer, so it carries Explorer's mode attribute for the shared CSS.
    document.documentElement.dataset.glassMode = isExplorerMode(version)
      ? 'explorer'
      : styleVersion;
    // Keep E's exact selection in glassStudy while inheriting O's materials.
    document.documentElement.dataset.glassChoice = styleVersion;
    document.documentElement.dataset.glassStudy = version;
    document.documentElement.toggleAttribute('data-glass-landing', isLandingRoute);
    localStorage.setItem('venus-glass-version', version);
    return () => {
      delete document.documentElement.dataset.glassVersion;
      delete document.documentElement.dataset.glassPreview;
      delete document.documentElement.dataset.glassMode;
      delete document.documentElement.dataset.glassChoice;
      delete document.documentElement.dataset.glassStudy;
      document.documentElement.removeAttribute('data-glass-landing');
    };
  }, [version, styleVersion, isLandingRoute]);
  // E keeps O's materials, but its header (except logo, Pro/Lite label and the Lite switch) and
  // its Pro buttons / segmented controls mirror New's styles.
  useLayoutEffect(() => {
    if (version !== 'lite-experiment') return;
    return mountEHeaderMirror();
  }, [version]);
  const isEHeaderLight = version === 'lite-experiment';
  useLayoutEffect(() => {
    if (styleVersion !== 'v5' && !isEHeaderLight) return;
    const updateLight = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLElement>(
        '[data-venus-button-variant="primary"], [data-venus-button-variant="secondary"], .venus-text-field [data-venus-button-variant]',
      );
      if (
        !button ||
        (isEHeaderLight &&
          (!!button.closest('.venus-mode-switch, .lite-markets') ||
            (!!button.closest('.venus-popup-panel') && !button.closest('.venus-text-field')))) ||
        button.matches(':disabled, [aria-disabled="true"]') ||
        button.closest('.account-preview')
      )
        return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--glass-x', `${event.clientX - rect.left}px`);
      button.style.setProperty('--glass-y', `${event.clientY - rect.top}px`);
    };
    document.addEventListener('pointermove', updateLight, { passive: true });
    document.addEventListener('pointerdown', updateLight, { passive: true });
    return () => {
      document.removeEventListener('pointermove', updateLight);
      document.removeEventListener('pointerdown', updateLight);
    };
  }, [styleVersion, isEHeaderLight]);
  return createPortal(
    <>
      <aside className="preview-controller" aria-label="Design preview" data-collapsed={collapsed}>
        {collapsed ? (
          <button
            className="preview-launcher"
            type="button"
            aria-label="Expand design preview"
            onClick={() => setCollapsed(false)}
          >
            {versions.find(item => item.id === version)?.label}
          </button>
        ) : (
          <>
            <div className="preview-controller-heading">
              <span>Preview</span>
              <button
                type="button"
                aria-label="Collapse design preview"
                title="Collapse"
                onClick={() => setCollapsed(true)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="preview-dpad" role="group" aria-label="Style preview">
              {versions.map(item => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={version === item.id}
                  title={item.description}
                  aria-label={item.description}
                  onClick={() => {
                    setVersion(item.id);
                    if (item.id === 'lite-experiment') {
                      navigate(
                        { pathname: '/', search: location.search },
                        { state: { interfaceMode: 'lite' } },
                      );
                    }
                  }}
                  className={`preview-version preview-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
              <span className="preview-current" aria-live="polite">
                {versions.find(item => item.id === version)?.label}
              </span>
            </div>
            {location.pathname === '/' && landingVersion !== 'v1' && (
              <div className="preview-motion">
                <button
                  className="preview-motion-tab"
                  type="button"
                  aria-controls="preview-motion-panel"
                  aria-expanded={motionOpen}
                  onClick={() => setMotionOpen(open => !open)}
                >
                  Motion <span aria-hidden="true">{motionOpen ? '−' : '+'}</span>
                </button>
                {motionOpen && <MotionControls />}
              </div>
            )}
            <div className="preview-tools">
              <Link
                to={`/component/buttons${location.search}`}
                aria-label="Components"
                aria-current={location.pathname.startsWith('/component') ? 'page' : undefined}
                data-tip="Components"
              >
                <Icon name="dashboard" />
              </Link>
              <button
                type="button"
                aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                data-tip={isLight ? 'Dark mode' : 'Light mode'}
                onClick={toggleTheme}
              >
                <img src={isLight ? lightIcon : darkIcon} alt="" />
              </button>
              <button
                type="button"
                aria-label="Change notes"
                aria-pressed={notes}
                data-tip="Change notes"
                onClick={() => setNotes(!notes)}
              >
                <Icon name="comment" />
              </button>
              <button
                type="button"
                aria-label={`Preview ${isLite ? 'Pro' : 'Lite'} introduction`}
                aria-haspopup="dialog"
                data-tip={isLite ? 'Pro 引導預覽' : 'Lite 引導預覽'}
                onClick={() => previewIntroduction(isLite ? 'pro' : 'lite')}
              >
                <Icon name="eye" />
              </button>
            </div>
          </>
        )}
      </aside>
      <ChangeNotes
        version={styleVersion}
        modeLabel={versions.find(item => item.id === version)?.description ?? 'Original'}
        enabled={notes}
      />
    </>,
    document.body,
  );
};
