/** Slow digit cycling remains active only while its planet is engaged. */
export const asciiInteractionStepMs = 160;

export function getAsciiInteractionGlyph(original: string, index: number, elapsed: number) {
  if (elapsed < 0 || !Number.isFinite(elapsed)) return original;
  return String((index + Math.floor(elapsed / asciiInteractionStepMs)) % 10);
}
