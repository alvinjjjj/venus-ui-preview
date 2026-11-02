import { Outlet, matchPath, useLocation } from 'react-router';

import { BODY_PORTAL_ID, PAGE_CONTAINER_ID } from 'constants/layout';

import { Wrapper, cn } from 'components';
import { Subdirectory, routes } from 'constants/routing';
import { useLayoutEffect, useRef } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { NavBar } from './NavBar';
import ScrollToTop from './ScrollToTop';
import { useStore } from './store';
import { useInterfaceMode, useInterfaceModeStore } from 'demo/useInterfaceMode';
import { GhostBackground } from 'pages/LiteMarkets/GhostBackground';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { isLiteExperimentMode } from 'demo/GlassVersions/variants';

// Pages here render their own Wrapper so a full-bleed promo banner can sit above it.
const NO_WRAPPER_PATHNAMES = [
  Subdirectory.LANDING,
  routes.markets.path,
  routes.liquidityHubs.path,
  routes.aboutUs.path,
  routes.spoke.path,
] as string[];

export const Layout: React.FC = () => {
  const scrollToTopRef = useRef<HTMLButtonElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const { pathname } = useLocation();
  const { isLite, supportsModes, mode } = useInterfaceMode();
  const isE3 = useGlassPreview(state => state.mode === 'lite-experiment-v3');
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const isExperiment = useGlassPreview(state => isLiteExperimentMode(state.mode));
  const fixedLite = isExperiment && isLite && (pathname === '/' || pathname === '');
  // Preserve the committed selection for ordinary links without mode state.
  // Layout effects run before paint, after the destination has committed.
  useLayoutEffect(() => {
    if (useInterfaceModeStore.getState().mode !== mode) {
      useInterfaceModeStore.getState().setMode(mode);
    }
  }, [mode]);
  const showStardust = supportsModes && pathname.replace(/\/$/, '') !== routes.aboutUs.path;
  const fullBleedSky = showStardust && (isE3 || isFinal);
  const quietDashboard = isFinal && isLite && pathname.replace(/\/$/, '') === routes.dashboard.path;

  const isCloseToBottomState = useStore(state => state.isCloseToBottom);
  const setIsCloseToBottom = useStore(state => state.setIsCloseToBottom);
  const setScrollToTopVisible = useStore(state => state.setScrollToTopVisible);
  const isScrollToTopVisible = useStore(state => state.isScrollToTopVisible);
  const viewportHeight = window.innerHeight;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollElem = event.currentTarget;
    const shouldShowScrollToTopVisible =
      scrollElem?.scrollTop && scrollElem.scrollTop > viewportHeight;

    const scrollToTopRect = scrollToTopRef.current?.getBoundingClientRect();
    const footerRect = footerRef.current?.getBoundingClientRect();
    const footerTopPos = footerRect ? footerRect.top - footerRect.height : undefined;

    // if the state is already flagged, it means we the scroll pos has already gone up
    // which in turn will make the bottom position move up
    // causing the next values of `isCloseToBottom` to switch between true and false until they settle
    // we treat this case by calculating a reference position
    const scrollBtnBottom = scrollToTopRect?.bottom ?? 0;
    const scrollBtnHeight = scrollToTopRect?.height ?? 0;
    // 1.25 is not arbitrary, it's related to the the styling of ScrollToTop
    // it's currently moving up by 125% of its height
    const scrollBtnDisplacement = isCloseToBottomState ? scrollBtnHeight * 1.25 : 0;
    const actualBottomReference = scrollBtnBottom + scrollBtnDisplacement;
    const isCloseToBottom = footerTopPos ? actualBottomReference >= footerTopPos : false;

    if (isCloseToBottomState !== isCloseToBottom) {
      setIsCloseToBottom(isCloseToBottom);
    }

    if (shouldShowScrollToTopVisible && !isScrollToTopVisible) {
      setScrollToTopVisible(true);
    } else if (!shouldShowScrollToTopVisible && isScrollToTopVisible) {
      setScrollToTopVisible(false);
    }
  };

  const noWrapper = NO_WRAPPER_PATHNAMES.some(noWrapperPath => matchPath(noWrapperPath, pathname));
  const contentDom = (
    <>
      <Outlet />
      <ScrollToTop ref={scrollToTopRef} />
    </>
  );

  const WrapperComp = noWrapper ? 'div' : Wrapper;

  return (
    <>
      <div
        className={cn(
          'h-dvh flex flex-col',
          isE3 && showStardust && 'lite-e3-sky-layout',
          isFinal && fullBleedSky && 'lite-full-bleed-sky',
          quietDashboard && 'lite-dashboard-layout',
        )}
      >
        {fullBleedSky && (
          <GhostBackground
            shared
            layeredLines={!isE3 && fixedLite}
            starDensity={quietDashboard ? 1 / 3 : 1}
          />
        )}
        <NavBar className="shrink-0" />


        <div
          className={cn(
            'flex flex-col grow overflow-x-hidden',
            supportsModes && 'bg-background-active',
            showStardust && 'original-stardust-layout',
            fixedLite && 'lite-experiment-layout',
          )}
          id={PAGE_CONTAINER_ID}
          onScroll={handleScroll}
        >
          {showStardust && !fullBleedSky && <GhostBackground shared layeredLines={fixedLite} />}
          <Header />

          <div className={cn('relative flex grow flex-col', isLite && 'shrink-0')}>
            <WrapperComp
              className={cn('relative w-full shrink-0 grow', !noWrapper && 'pt-5 sm:pt-10')}
            >
              {contentDom}
            </WrapperComp>

            <div id={BODY_PORTAL_ID} />

            <Footer ref={footerRef} />
          </div>
        </div>
      </div>
    </>
  );
};
