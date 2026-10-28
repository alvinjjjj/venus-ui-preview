/** Preserve the approved synchronized digit cycle; render motion at 30fps. */
export const asciiInteractionStepMs = 160;
export const asciiInteractionFrameMs = 1000 / 30;

export function getAsciiInteractionGlyph(original: string, index: number, elapsed: number) {
  if (elapsed < 0 || !Number.isFinite(elapsed)) return original;
  return String((index + Math.floor(elapsed / asciiInteractionStepMs)) % 10);
}

export function drawAsciiInteractionGlyph(
  ctx: CanvasRenderingContext2D,
  original: string,
  index: number,
  elapsed: number,
  x: number,
  y: number,
) {
  ctx.fillText(getAsciiInteractionGlyph(original, index, elapsed), x, y);
}
