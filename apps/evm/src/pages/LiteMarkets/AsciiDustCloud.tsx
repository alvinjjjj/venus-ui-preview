import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import './ascii-dust-cloud.css';

// Fixed particles form a soft spiral cloud; no per-frame random characters.
const particles = Array.from({ length: 180 }, (_, i) => {
  const sample = (salt: number) => { const value = Math.sin((i + 1) * salt) * 43758.5453; return value - Math.floor(value); };
  return { radius: Math.sqrt(sample(12.9898)), angle: sample(78.233) * Math.PI * 2, depth: sample(39.425), digit: String(i % 10) };
});

/** A single light-mode illustration, isolated from the interface paint layer. */
export function AsciiDustCloud() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 280 * ratio;
    canvas.height = 180 * ratio;
    ctx.scale(ratio, ratio);
    const color = getComputedStyle(canvas).color;
    let phase = 0;
    let last = 0;
    let frame = 0;
    let visible = false;
    const draw = () => {
      ctx.clearRect(0, 0, 280, 180);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const p of particles) {
        const angle = p.angle + phase * (.15 + (1 - p.radius) * .1);
        const swirl = angle + p.radius * 2;
        const x = Math.cos(swirl) * p.radius * 108;
        const y = Math.sin(swirl) * p.radius * 43;
        ctx.font = `${p.depth > .8 ? 9 : 7}px monospace`;
        ctx.globalAlpha = (.18 + p.depth * .2) * (1 - p.radius * .6);
        ctx.fillText(p.digit, 140 + x + Math.sin(phase * .17) * 7, 90 + y - x * .22 + Math.cos(phase * .2) * 4);
      }
    };
    const tick = (time: number) => {
      if (time - last >= 32) {
        phase += Math.min((time - last) / 1000, .05);
        last = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    draw();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, [reduced]);
  return <canvas className="lite-ascii-dust-cloud" ref={ref} aria-hidden="true" />;
}
