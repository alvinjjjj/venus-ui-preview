import { PAGE_CONTAINER_ID } from 'constants/layout';
import { isExplorerMode, useGlassPreview } from 'demo/GlassVersions/store';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { AssetOrbit } from '../AssetOrbit';
import { LandingMockup } from '../LandingMockup';
import { useLandingMotion } from '../LandingMockup/motionStore';
import { getFlowTiming } from '../LandingMockup/motionTimeline';
import '../explorer-typography.css';
import './styles.css';

const smooth = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

// A short native-scroll track pins the stage. Wheel input is never intercepted.
export const HorizontalFlow: React.FC<{ heroKey: string }> = ({ heroKey }) => {
  const trackRef = useRef<HTMLElement>(null);
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const [progress, setProgress] = useState(0);
  const orbit = useLandingMotion(state => state.orbit);
  const explorer = useGlassPreview(state => isExplorerMode(state.mode));
  const [distances, setDistances] = useState({ travel: 1340, hold: 320 });

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const scroller = document.getElementById(PAGE_CONTAINER_ID);
    if (!desktop || !track || !scroller) return;
    let frame = 0;
    let travel = 1340;
    let playback = 0;
    let targetProgress = 0;
    let displayedProgress = 0;
    let lastFrameTime = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stopPlayback = () => {
      cancelAnimationFrame(playback);
      playback = 0;
    };
    const read = (time: number) => {
      frame = 0;
      const top = track.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      targetProgress = Math.max(0, Math.min(100, (-top / travel) * 100));
      // A short, time-based catch-up smooths wheel steps without intercepting scroll.
      const delta = Math.min(64, Math.max(0, time - lastFrameTime));
      lastFrameTime = time;
      displayedProgress =
        reducedMotion.matches || document.hidden
          ? targetProgress
          : displayedProgress + (targetProgress - displayedProgress) * (1 - Math.exp(-delta / 60));
      if (Math.abs(targetProgress - displayedProgress) < 0.03) displayedProgress = targetProgress;
      setProgress(displayedProgress);
      const motion = useLandingMotion.getState();
      const activeFrame = displayedProgress >= getFlowTiming(motion.orbit).burst * 100 ? 2 : 1;
      if (motion.previewFrame !== activeFrame) motion.setPreviewFrame(activeFrame);
      if (displayedProgress !== targetProgress) frame = requestAnimationFrame(read);
    };
    const update = () => {
      if (!frame) {
        lastFrameTime = performance.now();
        frame = requestAnimationFrame(read);
      }
    };
    const resize = new ResizeObserver(() => {
      // Scene pacing is measured against the viewport, not a global spacing token.
      travel = Math.max(640, scroller.clientHeight * orbit.travel);
      setDistances({ travel, hold: scroller.clientHeight * 0.4 });
      update();
    });
    resize.observe(scroller);
    scroller.addEventListener('scroll', update, { passive: true });
    // Preview-only seeking uses the same native scroll track as the wheel.
    const seek = (event: Event) => {
      const detail = (
        event as CustomEvent<{ progress?: number; replay?: boolean; pause?: boolean }>
      ).detail;
      stopPlayback();
      if (detail.pause) return;
      const origin =
        scroller.scrollTop +
        track.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      if (!detail.replay) {
        scroller.scrollTo({
          top:
            origin + Math.ceil((travel * Math.max(0, Math.min(100, detail.progress ?? 0))) / 100),
          behavior: 'instant',
        });
        return;
      }
      const start = performance.now();
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : orbit.travel * 3000;
      const replay = (time: number) => {
        const position = duration ? Math.min(1, (time - start) / duration) : 1;
        scroller.scrollTo({ top: origin + Math.ceil(travel * position), behavior: 'instant' });
        if (position < 1) playback = requestAnimationFrame(replay);
        else playback = 0;
      };
      playback = requestAnimationFrame(replay);
    };
    window.addEventListener('flow-preview-seek', seek);
    scroller.addEventListener('wheel', stopPlayback, { passive: true });
    scroller.addEventListener('touchstart', stopPlayback, { passive: true });
    scroller.addEventListener('keydown', stopPlayback);
    reducedMotion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    // Mount directly at the current scroll position; smooth subsequent wheel input.
    const initialTop = track.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    displayedProgress = Math.max(0, Math.min(100, (-initialTop / travel) * 100));
    read(performance.now());
    return () => {
      cancelAnimationFrame(frame);
      stopPlayback();
      window.removeEventListener('flow-preview-seek', seek);
      scroller.removeEventListener('wheel', stopPlayback);
      scroller.removeEventListener('touchstart', stopPlayback);
      scroller.removeEventListener('keydown', stopPlayback);
      resize.disconnect();
      scroller.removeEventListener('scroll', update);
      reducedMotion.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [desktop, orbit.travel]);

  // Mobile keeps the established vertical draft; this study is desktop only.
  if (!desktop)
    return (
      <>
        <LandingMockup key={heroKey} />
        <AssetOrbit />
      </>
    );

  const timing = getFlowTiming(orbit);
  const pan = smooth(0, timing.arrival * 100, progress);
  const contentStart = timing.expanded * 100;
  const contentReveal = (delay: number) =>
    smooth(contentStart + (100 - contentStart) * delay, 100, progress);
  const style = {
    '--flow-travel': `${distances.travel}px`,
    '--flow-hold': `${distances.hold}px`,
    '--flow-pan': pan,
    '--flow-hero-opacity': 1 - smooth(0, 30, progress),
    '--flow-core-opacity': smooth(timing.burst * 100, timing.expanded * 100, progress),
    '--flow-core-scale': 0.35 + smooth(timing.burst * 100, timing.expanded * 100, progress) * 0.65,
    '--flow-title-opacity': contentReveal(0.15),
    // Explorer: the Section 2 heading takes over while the Hero text leaves (22-42%),
    // so the beam, contraction and burst always play under readable text instead of
    // an empty frame. New keeps the heading with the rest of the content.
    '--flow-header-opacity': explorer ? smooth(22, 42, progress) : contentReveal(0.15),
    '--flow-proof-opacity': contentReveal(0.55),
    '--flow-usdc': contentReveal(0),
    '--flow-usdt': contentReveal(0.15),
    '--flow-u': contentReveal(0.3),
    '--flow-eth': contentReveal(0.45),
  } as CSSProperties;

  return (
    <section ref={trackRef} className="horizontal-flow-track" style={style}>
      <div className="horizontal-flow" data-study={!orbit.showContent}>
        <LandingMockup key={heroKey} transitionProgress={progress / 100} />
        <AssetOrbit transitionProgress={progress / 100} study={!orbit.showContent} abstractAssets />
      </div>
    </section>
  );
};
