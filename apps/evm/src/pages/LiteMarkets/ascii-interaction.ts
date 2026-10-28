/** Staggered crossfades retain the slow cycle without a whole-sphere jump. */
export const asciiInteractionStepMs = 240;
export const asciiInteractionFrameMs = 1000 / 30;
const fadeMs = 120;

export function getAsciiInteractionFrame(original: string, index: number, elapsed: number) {
  const local = elapsed - ((index * 37) % asciiInteractionStepMs);
  if (local < 0 || !Number.isFinite(local)) return { current: original, next: original, mix: 0 };
  const cycle = Math.floor(local / asciiInteractionStepMs);
  const progress = Math.min(1, (local % asciiInteractionStepMs) / fadeMs);
  return {
    current: cycle === 0 ? original : String((index + cycle - 1) % 10),
    next: String((index + cycle) % 10),
    mix: progress * progress * (3 - 2 * progress),
  };
}

export function drawAsciiInteractionGlyph(
  ctx: CanvasRenderingContext2D,
  original: string,
  index: number,
  elapsed: number,
  x: number,
  y: number,
) {
  if (elapsed < 0 || !Number.isFinite(elapsed)) {
    ctx.fillText(original, x, y);
    return;
  }
  const { current, next, mix } = getAsciiInteractionFrame(original, index, elapsed);
  const alpha = ctx.globalAlpha;
  if (mix < 1) {
    ctx.globalAlpha = alpha * (1 - mix);
    ctx.fillText(current, x, y);
  }
  if (mix > 0) {
    ctx.globalAlpha = alpha * mix;
    ctx.fillText(next, x, y);
  }
  ctx.globalAlpha = alpha;
}
