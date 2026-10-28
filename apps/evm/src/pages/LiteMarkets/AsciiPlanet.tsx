import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { asciiInteractionFrameMs, drawAsciiInteractionGlyph } from './ascii-interaction';
import './ascii-planet.css';

export type AsciiPlanetSurface = 'waves' | 'diagonal' | 'horizon' | 'rim' | 'ribbon';

/** Small, bounded character renderer. Geometry is illustration data, not UI spacing. */
export function AsciiPlanet({ color, highlight, shadow = color, active, surface = 'waves', glyphScale = 1, replayToken = 0 }: {
  color: string; highlight: string; shadow?: string; active: boolean;
  surface?: AsciiPlanetSurface; glyphScale?: number; replayToken?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const light = useLiquidityLightPreview();
  const interaction = useRef(0);
  const gestureStart = useRef(Number.NEGATIVE_INFINITY);
  useEffect(() => {
    interaction.current = active ? 1 : 0;
    if (active) gestureStart.current = performance.now();
  }, [active, replayToken]);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const size = 360;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    let frame = 0;
    let visible = false;
    let last = 0;
    let phase = 0;
    const chars = '.:+*oO#@';
    // Retain each token's hue in dark mode instead of using its pale highlight.
    const channels = [1, 3, 5].map(offset => Math.round(
      Number.parseInt(color.slice(offset, offset + 2), 16) * .7
      + Number.parseInt(highlight.slice(offset, offset + 2), 16) * .3,
    ));
    const darkColor = `rgb(${channels.join(',')})`;
    // On a pale sky, the illuminated region uses the palette's ink tone.
    const lit = light ? shadow : highlight;
    const unlit = light ? highlight : shadow;
    const rimAmbient = light ? unlit : `rgb(${[1, 3, 5].map(offset => Math.round(
      Number.parseInt(shadow.slice(offset, offset + 2), 16) * .7
      + Number.parseInt(color.slice(offset, offset + 2), 16) * .3,
    )).join(',')})`;
    // Study only the lighting model. All four use the same glyph renderer,
    // token palette and sphere geometry, with no travelling surface texture.
    const surfaceGradient = (() => {
      if (surface === 'waves') return null;
      if (surface === 'diagonal') {
        const gradient = ctx.createLinearGradient(80, 80, 275, 280);
        gradient.addColorStop(0, lit);
        gradient.addColorStop(.32, lit);
        gradient.addColorStop(.58, color);
        gradient.addColorStop(1, unlit);
        return gradient;
      }
      if (surface === 'horizon') {
        const gradient = ctx.createLinearGradient(180, 65, 180, 295);
        gradient.addColorStop(0, lit);
        gradient.addColorStop(.38, lit);
        gradient.addColorStop(.56, color);
        gradient.addColorStop(.78, unlit);
        gradient.addColorStop(1, color);
        return gradient;
      }
      if (surface === 'rim') {
        if (light) {
          // Pearl lighting is authored for a pale canvas rather than inverting
          // the dark crescent: a soft center, colored edge, and ink lower rim.
          const ink = `rgb(${[1, 3, 5].map(offset => Math.round(
            Number.parseInt(shadow.slice(offset, offset + 2), 16) * .6
            + Number.parseInt(color.slice(offset, offset + 2), 16) * .4,
          )).join(',')})`;
          const gradient = ctx.createRadialGradient(142, 128, 12, 188, 182, 164);
          gradient.addColorStop(0, highlight);
          gradient.addColorStop(.32, color);
          gradient.addColorStop(.72, ink);
          gradient.addColorStop(1, shadow);
          return gradient;
        }
        const gradient = ctx.createLinearGradient(60, 220, 290, 110);
        gradient.addColorStop(0, rimAmbient);
        gradient.addColorStop(.3, rimAmbient);
        gradient.addColorStop(.76, color);
        gradient.addColorStop(1, lit);
        return gradient;
      }
      const gradient = ctx.createLinearGradient(65, 180, 295, 180);
      gradient.addColorStop(0, unlit);
      gradient.addColorStop(.3, color);
      gradient.addColorStop(.47, lit);
      gradient.addColorStop(.56, lit);
      gradient.addColorStop(.72, color);
      gradient.addColorStop(1, unlit);
      return gradient;
    })();
    const surfaceDensity = (nx: number, ny: number, z: number, shade: number) => {
      switch (surface) {
        case 'diagonal': return Math.max(.08, Math.min(1, (.7 - nx * .5 - ny * .5) * (.55 + z * .45)));
        case 'horizon': return Math.max(.12, Math.min(1, (.55 - ny * .65) * (.6 + z * .4)));
        case 'rim': {
          // Keep the crescent, with soft ambient light revealing the round body.
          const edge = (1 - z) ** 1.4;
          const facing = Math.max(0, nx * .8 - ny * .5);
          if (light) return Math.min(1, .3 + shade * .45 + edge * .12);
          return Math.min(1, .22 + z * .15 + edge * .24 + facing * .65);
        }
        case 'ribbon': {
          const band = Math.exp(-(((nx + ny * .24) / .42) ** 2));
          return Math.min(1, .14 + band * .8 + z * .06);
        }
        default: return Math.min(1, shade * .92 + z * .08);
      }
    };
    const draw = () => {
      const scrambling = !reduced && interaction.current === 1;
      const elapsed = scrambling ? performance.now() - gestureStart.current : Number.POSITIVE_INFINITY;
      if (canvas.dataset.scrambling !== String(scrambling)) canvas.dataset.scrambling = String(scrambling);
      const glyph = (original: string, index: number, x: number, y: number) =>
        drawAsciiInteractionGlyph(ctx, original, index, elapsed, x, y);
      ctx.clearRect(0, 0, size, size);
      ctx.font = `${9 * glyphScale}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = light ? color : darkColor;
      const ring = (front: boolean) => {
        for (let i = 0; i < 150; i++) {
          const a = i / 150 * Math.PI * 2 + phase * .35;
          const x = Math.cos(a) * 170;
          const y = Math.sin(a) * 43;
          if ((Math.sin(a) > 0) !== front) continue;
          ctx.globalAlpha = (light ? .55 : .7) + interaction.current * .15;
          glyph(i % 5 === 0 ? '+' : '.', i + 2000, 180 + x * .94 + y * .34, 180 - x * .34 + y * .94);
        }
      };
      ring(false);
      ctx.fillStyle = surfaceGradient ?? (light ? color : darkColor);
      // Center the character grid so both sides have the same curved outline.
      const stepY = 7 * glyphScale;
      const stepX = 6 * glyphScale;
      let glyphIndex = 0;
      for (let y = -Math.floor(119 / stepY) * stepY; y <= 119; y += stepY) {
        for (let x = -Math.floor(119 / stepX) * stepX; x <= 119; x += stepX) {
          const nx = x / 120;
          const ny = y / 120;
          const radius = nx * nx + ny * ny;
          if (radius > 1) continue;
          const z = Math.sqrt(1 - radius);
          const longitude = Math.atan2(nx, z);
          const latitude = Math.asin(ny);
          const shade = Math.max(0, -.45 * nx - .4 * ny + .75 * z);
          const density = surface === 'waves'
            ? Math.min(1, shade * .7 + (.5 + .5 * Math.sin((longitude + phase) * 9 + Math.sin(latitude * 7) * 2)) * .3)
            : surfaceDensity(nx, ny, z, shade);
          ctx.globalAlpha = surface === 'waves'
            ? (light ? .38 : .44) + density * .65
            : .18 + density * .82;
          glyph(chars[Math.min(7, Math.floor(density * 8))], glyphIndex++, 180 + x, 180 + y);
        }
      }
      ctx.fillStyle = light ? color : darkColor;
      ring(true);
      // A few bright particles share the orbital plane, with a short fading wake.
      for (let star = 0; star < 3; star++) {
        for (let tail = 0; tail < 4; tail++) {
          const a = phase * .65 + star * Math.PI * 2 / 3 - tail * .045;
          const x = Math.cos(a) * 170;
          const y = Math.sin(a) * 43;
          if (Math.sin(a) < 0 && Math.abs(x) < 115) continue;
          ctx.globalAlpha = (1 - tail / 4) * (.65 + interaction.current * .3);
          glyph(tail === 0 ? '+' : '.', star * 4 + tail + 3000, 180 + x * .94 + y * .34, 180 - x * .34 + y * .94);
        }
      }
      ctx.globalAlpha = 1;
    };
    const tick = (time: number) => {
      if (time - last >= (interaction.current === 1 ? asciiInteractionFrameMs : 50)) {
        const delta = Math.min((time - last) / 1000, .1);
        phase += delta * (.16 + (surface === 'waves' ? interaction.current * .1 : 0));
        draw();
        last = time;
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
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [color, highlight, shadow, light, reduced, surface, glyphScale]);
  return <canvas ref={ref} className="lite-ascii-planet" data-surface={surface} aria-hidden="true" />;
}
