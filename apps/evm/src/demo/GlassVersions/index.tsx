import { Icon } from 'components/Icon';
import { useId, useLayoutEffect, useRef, useState } from 'react';
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
import './e2.css';
import './e3.css';
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
import './form-segments.css';
import './lite-neutral-surfaces.css';
import './lite-mobile.css';
import './lite-form-spacing.css';
import './final-button-material.css';
import {
  beforeVersions,
  currentVersions,
  getPreviewStudy,
  isLiteExperimentMode,
  previewVersions,
} from './variants';

const collections = [
  { id: 'preview', label: 'Final', versions: currentVersions },
  { id: 'before', label: 'Test', versions: beforeVersions },
] as const;
type PreviewCollection = (typeof collections)[number]['id'];

// Explicit non-button opt-in: these informational totals share the existing
// component glass spotlight, while other Lite controls retain their own states.
const TOTAL_LIGHT_SELECTOR =
  ':is([data-glass-revision="lite-experiment-v2"], [data-glass-revision="lite-experiment-v3"]) .lite-e2-market-total';
const LITE_ICE_POINTER_SELECTOR =
  ".venus-connected-wallet:not([data-prime-account='true']), .venus-mode-switch, [data-rewards-button]";

export const GlassVersions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notes, setNotes] = useState(false);
  const [motionOpen, setMotionOpen] = useState(false);
  const [collection, setCollection] = useState<PreviewCollection>('preview');
  const collectionId = useId();
  const collectionTabs = useRef<Partial<Record<PreviewCollection, HTMLButtonElement | null>>>({});
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
  const isComponentRoute = location.pathname.startsWith('/component');
  const selectCollection = (next: PreviewCollection) => {
    setCollection(next);
    if (next === 'preview') setVersion('lite-experiment-v2');
    if (isComponentRoute) navigate({ pathname: '/', search: location.search }, { state: { interfaceMode: 'lite' } });
  };
  const styleVersion = previewDesignByMode[version];
  const landingVersion = landingDesignByMode[version];
  const currentVersion = previewVersions.find(item => item.id === version);
  const experimental = isLiteExperimentMode(version);
  const selectVersion = (next: GlassPreviewMode) => {
    setVersion(next);
    // Compare E revisions in place, including token forms and Pro deep links.
    // Entering E from an older design retains the existing Lite entry behavior.
    if (isLiteExperimentMode(next) && !experimental) {
      navigate({ pathname: '/', search: location.search }, { state: { interfaceMode: 'lite' } });
    }
  };
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
    // Share E's initial materials, but retain an independent revision selector.
    document.documentElement.dataset.glassChoice = styleVersion;
    document.documentElement.dataset.glassStudy = getPreviewStudy(version);
    document.documentElement.dataset.glassRevision = version === 'lite-experiment-v2-legacy' ? 'lite-experiment-v2' : version;
    document.documentElement.dataset.glassVariant = version;
    document.documentElement.toggleAttribute('data-glass-landing', isLandingRoute);
    try {
      localStorage.setItem('venus-glass-version', version);
    } catch {
      // Session switching still works when browser storage is unavailable.
    }
    return () => {
      delete document.documentElement.dataset.glassVersion;
      delete document.documentElement.dataset.glassPreview;
      delete document.documentElement.dataset.glassMode;
      delete document.documentElement.dataset.glassChoice;
      delete document.documentElement.dataset.glassStudy;
      delete document.documentElement.dataset.glassRevision;
      delete document.documentElement.dataset.glassVariant;
      document.documentElement.removeAttribute('data-glass-landing');
    };
  }, [version, styleVersion, isLandingRoute]);
  // E keeps O's materials, but its header (except logo, Pro/Lite label and the Lite switch) and
  // its Pro buttons / segmented controls mirror New's styles.
  useLayoutEffect(() => {
    if (!experimental) return;
    return mountEHeaderMirror();
  }, [experimental]);
  const isEHeaderLight = experimental;
  useLayoutEffect(() => {
    if (styleVersion !== 'v5' && !isEHeaderLight) return;
    const icyLite = version === 'lite-experiment-v2' && isLight && isLite;
    const updateLight = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLElement>(
        `[data-venus-button-variant="primary"], [data-venus-button-variant="secondary"], .venus-text-field [data-venus-button-variant], .lite-e3-card [data-select-trigger], .lite-e3-card .lite-e3-market-option, ${TOTAL_LIGHT_SELECTOR}${icyLite ? `, ${LITE_ICE_POINTER_SELECTOR}` : ''}`,
      );
      const icyControl = icyLite && button?.matches(LITE_ICE_POINTER_SELECTOR);
      if (
        !button ||
        (isEHeaderLight &&
          !icyControl &&
          !button.closest(`.lite-e3-card, ${TOTAL_LIGHT_SELECTOR}`) &&
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
  }, [styleVersion, isEHeaderLight, version, isLight, isLite]);
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
            {currentVersion?.label}
          </button>
        ) : (
          <>
            <div className="preview-controller-heading">
              <div
                className="preview-collection-tabs"
                role="tablist"
                aria-label="Preview collections"
              >
                {collections.map(item => (
                  <button
                    key={item.id}
                    ref={button => {
                      collectionTabs.current[item.id] = button;
                    }}
                    type="button"
                    role="tab"
                    id={`${collectionId}-${item.id}-tab`}
                    className="preview-collection-tab"
                    aria-controls={`${collectionId}-${item.id}-panel`}
                    aria-selected={!isComponentRoute && collection === item.id}
                    tabIndex={collection === item.id ? 0 : -1}
                    onClick={() => selectCollection(item.id)}
                    onKeyDown={event => {
                      const next =
                        event.key === 'Home'
                          ? 'preview'
                          : event.key === 'End'
                            ? 'before'
                            : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
                              ? item.id === 'preview'
                                ? 'before'
                                : 'preview'
                              : undefined;
                      if (!next) return;
                      event.preventDefault();
                      selectCollection(next);
                      collectionTabs.current[next]?.focus();
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Link
                className="preview-component-link"
                to={`/component/buttons${location.search}`}
                aria-current={location.pathname.startsWith('/component') ? 'page' : undefined}
              >
                Com.
              </Link>
              <button
                type="button"
                aria-label="Collapse design preview"
                title="Collapse"
                onClick={() => setCollapsed(true)}
              >
                <Icon name="close" />
              </button>
            </div>
            {isComponentRoute && (
              <div className="preview-dpad preview-dpad--before" role="group" aria-label="Component design">
                <button type="button" aria-pressed={version === 'v1'} onClick={() => setVersion('v1')}>Original</button>
                <button type="button" aria-pressed={version === 'lite-experiment-v2'} onClick={() => setVersion('lite-experiment-v2')}>Final</button>
                <span className="preview-current" aria-live="polite">{version === 'v1' ? 'Original' : currentVersion?.label}</span>
              </div>
            )}
            {collections.map(group => (
              <div
                key={group.id}
                id={`${collectionId}-${group.id}-panel`}
                role="tabpanel"
                aria-labelledby={`${collectionId}-${group.id}-tab`}
                hidden={isComponentRoute || collection !== group.id}
              >
                <div
                  className={`preview-dpad${group.id === 'before' ? ' preview-dpad--before' : ''}`}
                  role="group"
                  aria-label={group.id === 'preview' ? 'Style preview' : 'Previous styles'}
                >
                  {group.versions.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={version === item.id}
                      title={item.description}
                      aria-label={item.description}
                      onClick={() => selectVersion(item.id)}
                      className={`preview-version preview-${item.id}`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <span className="preview-current" aria-live="polite">
                    {currentVersion?.label}
                  </span>
                </div>
              </div>
            ))}
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
        modeLabel={currentVersion?.description ?? 'Original'}
        enabled={notes}
      />
    </>,
    document.body,
  );
};
