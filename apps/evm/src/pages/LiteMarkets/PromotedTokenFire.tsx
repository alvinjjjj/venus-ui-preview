import { Icon } from 'components/Icon';
import { useEffect, useRef, useState } from 'react';

/** Shared visibility budget for the promoted flame and its Earn border. */
export const observePromotedMotion = (
  element: HTMLElement | null,
  onActive: (active: boolean) => void,
) => {
  onActive(false);
  if (!element || typeof IntersectionObserver === 'undefined') return;
  let intersecting = false;
  const update = () => onActive(intersecting && !document.hidden);
  const observer = new IntersectionObserver(([entry]) => {
    intersecting = entry?.isIntersecting ?? false;
    update();
  });
  observer.observe(element);
  document.addEventListener('visibilitychange', update);
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', update);
  };
};

/** Two-tone promotional flame; only animates while the icon and page are visible. */
export function PromotedTokenFire() {
  const ref = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => observePromotedMotion(ref.current, setActive), []);

  return (
    <span
      ref={ref}
      className="lite-e2-promoted-fire inline-flex size-4 shrink-0"
      data-motion-active={active}
      aria-hidden="true"
    >
      <span className="lite-e2-flame-body relative inline-flex size-full">
        <Icon name="fire" className="lite-e2-flame-outer size-full" aria-hidden="true" />
        <Icon name="fire" className="lite-e2-flame-inner" aria-hidden="true" />
      </span>
    </span>
  );
}
