import { useLayoutEffect, useRef } from 'react';

/** Keep the header outside the scrolling body; measure rows so mobile cards and
 * wrapped text still show exactly the requested number of complete entries. */
export const useTableBodyScroll = (
  rowCount: number,
  visibleRows = 5,
  resetKey?: string,
  scrollCards = true,
) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const body = root.querySelector('tbody');
    const cards = root.querySelector('[data-table-card-row]')?.parentElement;
    const regions = [body, scrollCards ? cards : undefined].filter(
      (element): element is HTMLElement => !!element,
    );
    const measure = () => {
      if (body)
        root.style.setProperty(
          '--table-scrollbar-width',
          `${body.offsetWidth - body.clientWidth}px`,
        );
      for (const region of regions) {
        const rows = Array.from(region.children) as HTMLElement[];
        if (rows.length <= visibleRows) {
          region.style.maxHeight = 'none';
          continue;
        }
        const first = rows[0].getBoundingClientRect();
        const last = rows[visibleRows - 1].getBoundingClientRect();
        if (last.bottom > first.top) region.style.maxHeight = `${last.bottom - first.top}px`;
      }
    };
    const observer = new ResizeObserver(measure);
    for (const region of regions) {
      region.scrollTop = 0;
      region.tabIndex = 0;
      region.style.overflowY = 'auto';
      region.style.overscrollBehaviorY = 'contain';
      observer.observe(region);
      for (const row of Array.from(region.children)) observer.observe(row);
    }
    measure();
    return () => {
      observer.disconnect();
      for (const region of regions) {
        region.style.removeProperty('max-height');
        region.style.removeProperty('overflow-y');
        region.style.removeProperty('overscroll-behavior-y');
        region.removeAttribute('tabindex');
      }
    };
  }, [rowCount, visibleRows, resetKey, scrollCards]);
  return ref;
};
