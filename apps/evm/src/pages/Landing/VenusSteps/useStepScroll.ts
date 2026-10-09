import { PAGE_CONTAINER_ID } from 'constants/layout';
import { useCallback, useEffect, useRef } from 'react';

/** A reversible native-scroll track, with one viewport for each product step. */
export const useStepScroll = (count: number, onChange: (index: number) => void) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const current = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const scroller = document.getElementById(PAGE_CONTAINER_ID);
    if (!track || !scroller) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    let frame = 0;
    const read = () => {
      frame = 0;
      if (!desktop.matches) return;
      const offset = scroller.getBoundingClientRect().top - track.getBoundingClientRect().top;
      const index = Math.max(0, Math.min(count - 1, Math.round(offset / scroller.clientHeight)));
      if (index === current.current) return;
      current.current = index;
      onChange(index);
    };
    const update = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    const resize = new ResizeObserver(update);
    resize.observe(scroller);
    scroller.addEventListener('scroll', update, { passive: true });
    desktop.addEventListener('change', update);
    read();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      scroller.removeEventListener('scroll', update);
      desktop.removeEventListener('change', update);
    };
  }, [count, onChange]);

  const seek = useCallback(
    (index: number) => {
      current.current = index;
      onChange(index);
      const track = trackRef.current;
      const scroller = document.getElementById(PAGE_CONTAINER_ID);
      if (!track || !scroller || !window.matchMedia('(min-width: 1024px)').matches) return;
      const origin =
        scroller.scrollTop +
        track.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      // Jump to the corresponding native position; the content supplies the transition.
      scroller.scrollTo({ top: origin + index * scroller.clientHeight, behavior: 'instant' });
    },
    [onChange],
  );

  return { trackRef, seek };
};
