import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

// Scene coordinates are normalized to the artwork, independent of layout tokens.
export const RippleField: React.FC<{ light: boolean }> = ({ light }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    let visible = false;
    let elapsed = 0;
    let previous = 0;
    const style = getComputedStyle(canvas);
    const ink = style.getPropertyValue('--orbit-ink').trim().split(/\s+/).join(',');
    const blue = style.getPropertyValue('--color-blue-rgb').trim().split(/\s+/).join(',');

    const paint = (time: number) => {
      context.clearRect(0, 0, width, height);
      const cx = width * 0.5;
      const cy = height * 0.43;
      const unit = Math.min(width, height * 1.6);
      // Circular ripples seen obliquely, rather than planetary orbits.
      for (let ring = 0; ring < 6; ring++) {
        const radius = unit * (0.13 + ring * 0.065);
        context.beginPath();
        context.ellipse(cx, cy, radius, radius * 0.7, -0.16, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${ink},${light ? 0.11 : 0.1})`;
        context.lineWidth = 0.8;
        context.stroke();
        const count = 32 + ring * 18;
        for (let dot = 0; dot < count; dot++) {
          const angle = (dot / count) * Math.PI * 2 + time * 0.012 * (ring % 2 ? -1 : 1);
          const x = radius * Math.cos(angle);
          const y = radius * 0.7 * Math.sin(angle);
          const shimmer = 0.18 + 0.3 * (0.5 + 0.5 * Math.sin(angle * 3 + time * 0.35 + ring));
          context.fillStyle =
            dot % 7 === 0 ? `rgba(${blue},${shimmer})` : `rgba(${ink},${shimmer})`;
          context.beginPath();
          context.arc(
            cx + x * Math.cos(-0.16) - y * Math.sin(-0.16),
            cy + x * Math.sin(-0.16) + y * Math.cos(-0.16),
            dot % 7 === 0 ? 1.4 : 0.75,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      }
      // A sparse incoming strand gives the hero's particles a continuation.
      for (let point = 0; point < 44; point++) {
        const progress = point / 44;
        const x = cx - unit * 0.48 + progress * unit * 0.33;
        const y = cy - unit * 0.39 + progress * progress * unit * 0.23;
        context.fillStyle = `rgba(${blue},${0.08 + progress * 0.28})`;
        context.beginPath();
        context.arc(x, y + Math.sin(point * 2.3 + time * 0.2) * unit * 0.008, 1, 0, Math.PI * 2);
        context.fill();
      }
    };
    const tick = (now: number) => {
      if (previous) elapsed += Math.min(now - previous, 50) / 1000;
      previous = now;
      paint(elapsed);
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      paint(elapsed);
      if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      update();
    });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    resize.observe(canvas);
    visibility.observe(canvas);
    document.addEventListener('visibilitychange', update);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [light, reduced]);

  return (
    <div aria-hidden="true">
      <canvas ref={ref} className="asset-orbit__field" />
    </div>
  );
};
