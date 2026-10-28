type Bounds = { top: number; right: number; bottom: number; left: number };

/** Fit the APY card to the visible viewport, preferring the roomier side. */
export function getPlanetPopupPosition({
  anchor,
  panel,
  viewport,
  gutter,
  gap,
}: {
  anchor: Bounds;
  panel: { width: number; height: number };
  viewport: { width: number; height: number };
  gutter: number;
  gap: number;
}) {
  const maxHeight = Math.max(0, viewport.height - gutter * 2);
  const height = Math.min(panel.height, maxHeight);
  const width = Math.min(panel.width, Math.max(0, viewport.width - gutter * 2));
  const below = viewport.height - gutter - anchor.bottom - gap;
  const above = anchor.top - gutter - gap;
  const top = below >= height || below >= above ? anchor.bottom + gap : anchor.top - gap - height;
  const left =
    anchor.left + (anchor.right - anchor.left) / 2 > viewport.width / 2
      ? anchor.right - width
      : anchor.left;
  return {
    top: Math.max(gutter, Math.min(top, viewport.height - height - gutter)),
    left: Math.max(gutter, Math.min(left, viewport.width - width - gutter)),
    maxHeight,
  };
}
