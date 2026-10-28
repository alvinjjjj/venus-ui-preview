import { useEffect, useRef, useState } from 'react';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { useReducedMotion } from 'motion/react';
import { asciiInteractionStepMs, getAsciiInteractionGlyph } from './ascii-interaction';

/** Sample the actual token artwork so its distinctive glyph stays recognizable. */
export function AsciiTokenMark({ src, symbol, color, highlight, glyphScale = 1, active = false, replayToken = 0 }: {
  src: string; symbol: string; color: string; highlight: string; glyphScale?: number; active?: boolean; replayToken?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const light = useLiquidityLightPreview();
  const reduced = useReducedMotion();
  const drawRef = useRef<((elapsed: number) => void) | null>(null);
  useEffect(() => {
    if (!ready || !drawRef.current || !ref.current) return;
    if (!active || reduced) { drawRef.current(Number.POSITIVE_INFINITY); return; }
    let frame = 0;
    let last = 0;
    let visible = false;
    const start = performance.now();
    const tick = (time: number) => {
      const elapsed = time - start;
      if (time - last >= asciiInteractionStepMs) { drawRef.current?.(elapsed); last = time; }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
      else drawRef.current?.(Number.POSITIVE_INFINITY);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(ref.current);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      drawRef.current?.(Number.POSITIVE_INFINITY);
    };
  }, [active, replayToken, ready, reduced]);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (cancelled || !ref.current) return;
      const source = document.createElement('canvas');
      const grid = Math.round(48 / glyphScale);
      source.width = source.height = grid;
      const sample = source.getContext('2d', { willReadFrequently: true });
      const canvas = ref.current;
      const ctx = canvas.getContext('2d');
      if (!sample || !ctx) return;
      try {
        sample.drawImage(image, 0, 0, grid, grid);
        const { data } = sample.getImageData(0, 0, grid, grid);
        const size = 288;
        const step = size / grid;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.height = size * ratio;
        ctx.scale(ratio, ratio);
        ctx.font = `bold ${7 * glyphScale}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = light ? color : highlight;
        const darkGlyph = symbol === 'sUSDe' || symbol === 'ETH';
        const glyphs: { x: number; y: number; strength: number; char: string }[] = [];
        for (let y = 0; y < grid; y++) {
          for (let x = 0; x < grid; x++) {
            const i = (y * grid + x) * 4;
            const luminance = (data[i] + data[i + 1] + data[i + 2]) / 765;
            const strength = darkGlyph ? 1 - luminance : luminance;
            if (data[i + 3] < 100 || strength < .82) continue;
            glyphs.push({ x: (x + .5) * step, y: (y + .5) * step, strength, char: (x + y) % 3 === 0 ? '@' : '#' });
          }
        }
        drawRef.current = elapsed => {
          ctx.clearRect(0, 0, size, size);
          glyphs.forEach((glyph, index) => {
            ctx.globalAlpha = .85 + .15 * glyph.strength;
            ctx.fillText(getAsciiInteractionGlyph(glyph.char, index, elapsed), glyph.x, glyph.y);
          });
          ctx.globalAlpha = 1;
        };
        drawRef.current(Number.POSITIVE_INFINITY);
        setReady(true);
      } catch {
        // A non-readable remote image retains its original accessible artwork.
        setReady(false);
      }
    };
    image.src = src;
    return () => { cancelled = true; image.onload = null; drawRef.current = null; };
  }, [src, symbol, light, color, highlight, glyphScale]);
  return <>
    <canvas ref={ref} className="lite-ascii-token-mark" role="img" aria-label={symbol} style={{ opacity: ready ? 1 : 0 }} />
    {!ready && <img className="lite-token-original-mark" src={src} alt={symbol} />}
  </>;
}
