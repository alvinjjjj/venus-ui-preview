import { useEffect, useRef, useState } from 'react';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { useReducedMotion } from 'motion/react';
import { asciiInteractionFrameMs, asciiInteractionStepMs, drawAsciiInteractionGlyph } from './ascii-interaction';

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
    let lastGlyphStep = -1;
    let visible = false;
    const start = performance.now();
    const tick = (time: number) => {
      const elapsed = time - start;
      if (time - last >= asciiInteractionFrameMs) {
        const step = Math.floor(elapsed / asciiInteractionStepMs);
        if (step !== lastGlyphStep) { drawRef.current?.(elapsed); lastGlyphStep = step; }
        last = time;
      }
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
      const simplified = ['XVS', 'BNB', 'WBNB', 'U', 'ETH', 'USD1'].includes(symbol);
      const grid = simplified ? 24 : Math.round(48 / glyphScale);
      const sourceSize = simplified ? 128 : grid;
      source.width = source.height = sourceSize;
      const sample = source.getContext('2d', { willReadFrequently: true });
      const canvas = ref.current;
      const ctx = canvas.getContext('2d');
      if (!sample || !ctx) return;
      try {
        const darkGlyph = symbol === 'sUSDe' || symbol === 'ETH';
        // ETH's two gray diamond faces and USD1's gold numeral need their
        // own foreground cutoff; the white-logo cutoff loses most of both.
        const threshold = symbol === 'ETH' ? .3 : symbol === 'USD1' ? .72 : symbol === 'XVS' ? .25 : symbol === 'U' ? .5 : .82;
        const strengthAt = (pixels: Uint8ClampedArray, i: number) => {
          const luminance = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 765;
          return darkGlyph ? 1 - luminance : luminance;
        };
        sample.drawImage(image, 0, 0, sourceSize, sourceSize);
        if (simplified) {
          // Fit the original foreground silhouette, excluding the token disk.
          // A coarse, larger-character mark reads separately from the sphere.
          const pixels = sample.getImageData(0, 0, sourceSize, sourceSize).data;
          let left = sourceSize; let top = sourceSize; let right = -1; let bottom = -1;
          for (let y = 0; y < sourceSize; y++) {
            for (let x = 0; x < sourceSize; x++) {
              const i = (y * sourceSize + x) * 4;
              if (pixels[i + 3] < 100 || strengthAt(pixels, i) < threshold) continue;
              left = Math.min(left, x); right = Math.max(right, x);
              top = Math.min(top, y); bottom = Math.max(bottom, y);
            }
          }
          if (right < left) { setReady(false); return; }
          const span = Math.max(right - left + 1, bottom - top + 1) * 1.12;
          const sx = ((left + right + 1 - span) / 2) / sourceSize * image.naturalWidth;
          const sy = ((top + bottom + 1 - span) / 2) / sourceSize * image.naturalHeight;
          source.width = source.height = grid;
          sample.drawImage(image, sx, sy, span / sourceSize * image.naturalWidth, span / sourceSize * image.naturalHeight, 0, 0, grid, grid);
        }
        const { data } = sample.getImageData(0, 0, grid, grid);
        const size = 288;
        const step = size / grid;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.height = size * ratio;
        ctx.scale(ratio, ratio);
        const markWeight = symbol === 'ETH' ? 1.4 : 1.2;
        ctx.font = `bold ${simplified ? step * markWeight : 7 * glyphScale}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = light ? color : highlight;
        const glyphs: { x: number; y: number; strength: number; char: string }[] = [];
        for (let y = 0; y < grid; y++) {
          for (let x = 0; x < grid; x++) {
            const i = (y * grid + x) * 4;
            const strength = strengthAt(data, i);
            if (data[i + 3] < 100 || strength < threshold) continue;
            glyphs.push({ x: (x + .5) * step, y: (y + .5) * step, strength, char: (x + y) % 3 === 0 ? '@' : '#' });
          }
        }
        canvas.dataset.glyphCount = String(glyphs.length);
        if (!glyphs.length) { setReady(false); return; }
        drawRef.current = elapsed => {
          ctx.clearRect(0, 0, size, size);
          glyphs.forEach((glyph, index) => {
            ctx.globalAlpha = .85 + .15 * glyph.strength;
            drawAsciiInteractionGlyph(ctx, glyph.char, index, elapsed, glyph.x, glyph.y);
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
