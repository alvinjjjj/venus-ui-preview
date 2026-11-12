import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import './ascii-starfield.css';

type Star = { x: number; y: number; opacity: number };

/** Fixed numeric dust. Only a sparse subset changes brightness, never the page. */
export function AsciiStarfield({ stars, light }: { stars: Star[]; light: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = getComputedStyle(canvas).color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const scale = Math.max(width / 1440, height / 900);
      const offsetX = (width - 1440 * scale) / 2;
      const offsetY = (height - 900 * scale) / 2;
      stars.forEach((star, index) => {
        if (index % (light ? 2 : 1) !== 0) return;
        const side = star.x < 340 || star.x > 1100;
        const base = (light ? .13 : .18) + star.opacity * (light ? .28 : .45);
        // Independent, slow cycles (7–15s), bounded away from invisible.
        const pulse = !reduced && index % 7 === 0
          ? .8 + .2 * Math.sin(elapsed / (7 + index % 9) * Math.PI * 2 + index * 2.399)
          : .85;
        ctx.globalAlpha = base * pulse * (side ? 1 : .55);
        ctx.font = `${index % 19 === 0 ? 9 : index % 3 === 0 ? 7 : 6}px monospace`;
        ctx.fillText(String((index * 7 + 3) % 10), Math.round(star.x * scale + offsetX), Math.round(star.y * scale + offsetY));
      });
      ctx.globalAlpha = 1;
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const tick = (time: number) => {
      if (time - last >= 80) {
        elapsed += Math.min((time - last) / 1000, .1);
        last = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      if (!document.hidden && !reduced) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [stars, light, reduced]);
  return <canvas ref={ref} className="lite-ascii-starfield" data-light={light} aria-hidden="true" />;
}
