import { type ReactNode, useLayoutEffect, useRef } from 'react';

/** Keep the action inside its original form while docking it in the E frame. */
export const InlineSubmit = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    const frame = node?.closest<HTMLElement>('.lite-inline-market');
    if (!node || !frame) return;
    const update = () =>
      frame.style.setProperty('--inline-submit-height', `${node.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      observer.disconnect();
      frame.style.removeProperty('--inline-submit-height');
    };
  }, []);
  return (
    <div ref={ref} className="inline-submit-dock">
      {children}
    </div>
  );
};
