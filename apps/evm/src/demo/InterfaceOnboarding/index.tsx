import { PAGE_CONTAINER_ID } from 'constants/layout';
import { routes } from 'constants/routing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useNavigationType } from 'react-router';
import { InterfaceWelcomeDialog } from '../LiteIntroPreview';
import { useInterfaceMode } from '../useInterfaceMode';
import { useLiquidityLightPreview } from '../useLiquidityLightPreview';
import {
  type InterfaceIntroduction,
  createIntroductionHistory,
  getAutomaticIntroduction,
  getDocumentEntryType,
  isProEntryPath,
} from './policy';
import { useIntroductionPreview } from './previewStore';

interface IntroductionRequest {
  variant: InterfaceIntroduction;
  source: 'automatic' | 'manual';
  pathname: string;
}

const pageCanShowIntroduction = () => {
  const page = document.getElementById(PAGE_CONTAINER_ID);
  if (!page || page.querySelector('[aria-label="Loading page"]')) return false;
  return !Array.from(document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"]')).some(
    element =>
      !element.closest('[data-interface-onboarding]') &&
      !element.hidden &&
      element.getAttribute('aria-hidden') !== 'true' &&
      getComputedStyle(element).display !== 'none' &&
      getComputedStyle(element).visibility !== 'hidden',
  );
};

// Mounted once beside AppRoutes, not inside the Footer's changing Lite/Pro tree.
export const InterfaceOnboarding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { mode, supportsModes } = useInterfaceMode();
  const isLight = useLiquidityLightPreview();
  const [history] = useState(() => createIntroductionHistory());
  const [entry] = useState(() => ({
    identity: `${location.key}:${location.pathname}`,
    direct:
      location.key === 'default' &&
      getDocumentEntryType() === 'navigate' &&
      (location.pathname === '/' || isProEntryPath(location.pathname)),
  }));
  const visitedLocations = useRef(new Set<string>());
  const addressBarEntries = useRef(new Set<string>());
  const attemptedTriggers = useRef(new Set<string>());
  const [pending, setPending] = useState<IntroductionRequest | null>(null);
  const [active, setActive] = useState<IntroductionRequest | null>(null);
  const previewRequest = useIntroductionPreview(state => state.request);
  const clearPreview = useIntroductionPreview(state => state.clear);

  useEffect(() => {
    if (!previewRequest) return;
    // Explicit replay must not be followed immediately by a second automatic card.
    attemptedTriggers.current.add('direct-entry');
    setActive(null);
    setPending({ variant: previewRequest.variant, source: 'manual', pathname: location.pathname });
    clearPreview();
  }, [previewRequest, clearPreview, location.pathname]);

  useEffect(() => {
    const identity = `${location.key}:${location.pathname}`;
    const newAddressBarEntry =
      navigationType === 'POP' &&
      location.key === 'default' &&
      identity !== entry.identity &&
      !visitedLocations.current.has(identity);
    visitedLocations.current.add(identity);
    if (newAddressBarEntry) addressBarEntries.current.add(identity);
    const addressBarEntry = addressBarEntries.current.has(identity);
    if (!supportsModes || previewRequest || pending || active) return;

    const variant = getAutomaticIntroduction({
      pathname: location.pathname,
      mode,
      transition: location.state?.interfaceEntry,
      directEntry: entry.direct || addressBarEntry,
    });
    if (!variant) return;
    const trigger = addressBarEntry ? `external:${identity}` : 'direct-entry';
    if (attemptedTriggers.current.has(trigger)) return;
    attemptedTriggers.current.add(trigger);
    if (!history.hasSeen(variant)) {
      setPending({ variant, source: 'automatic', pathname: location.pathname });
    }
  }, [
    location.key,
    location.pathname,
    location.state,
    navigationType,
    mode,
    supportsModes,
    entry,
    history,
    previewRequest,
    pending,
    active,
  ]);

  useEffect(() => {
    setActive(current => (current?.pathname !== location.pathname ? null : current));
    // Runs only when the route commits, not while a replay is queued on the old page.
    setPending(current => (current?.pathname !== location.pathname ? null : current));
  }, [location.pathname]);

  useEffect(() => {
    if (!pending || pending.pathname !== location.pathname) return;
    const showWhenReady = () => {
      if (pending.source === 'automatic' && history.hasSeen(pending.variant)) {
        setPending(null);
        return;
      }
      if (!pageCanShowIntroduction()) return;
      setActive(pending);
      setPending(null);
    };
    showWhenReady();
    const observer = new MutationObserver(showWhenReady);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open', 'hidden', 'aria-hidden', 'style', 'class'],
    });
    window.addEventListener('storage', showWhenReady);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', showWhenReady);
    };
  }, [pending, location.pathname, history]);

  const markPresented = useCallback(() => {
    if (active?.source === 'automatic') history.markSeen(active.variant);
  }, [active, history]);

  if (!active || active.pathname !== location.pathname) return null;
  return createPortal(
    <div
      className="lite-intro-preview intro-live-preview"
      data-theme={isLight ? 'light' : 'dark'}
      data-interface-onboarding={active.source}
    >
      <InterfaceWelcomeDialog
        open
        variant={active.variant}
        onShown={markPresented}
        onDismiss={() => setActive(null)}
        onTry={() => {
          const target = active.variant;
          setActive(null);
          setPending(null);
          navigate(
            {
              pathname: target === 'pro' ? routes.liquidityHubs.path : '/',
              search: location.search,
            },
            { state: { interfaceMode: target, interfaceEntry: 'introduction-switch' } },
          );
        }}
      />
    </div>,
    document.body,
  );
};
