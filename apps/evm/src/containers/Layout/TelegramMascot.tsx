import { useEffect, useId, useRef, useState } from 'react';
import { VENUS_TELEGRAM_URL } from 'constants/production';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useStore as useLayoutStore } from './store';

// Two continuous displacement fields keep the original transparent artwork
// connected at the neck and cuffs. Coordinates are in the 100-unit artwork.
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

const makeMotionMap = (part: 'head' | 'badge') => {
  const cells: string[] = [];
  const grid = 32;
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      const x = (col + 0.5) / grid;
      const y = (row + 0.5) / grid;
      const head = 1 - smooth((y - 0.34) / 0.2);
      // Local cuff motion only; preserve the lower badge, robe and boots.
      const leftHand = Math.exp(-(((x - 0.25) / 0.08) ** 2 + ((y - 0.67) / 0.07) ** 2));
      const rightHand = Math.exp(-(((x - 0.77) / 0.08) ** 2 + ((y - 0.67) / 0.07) ** 2));
      const badge = (leftHand + rightHand) * (1 - smooth((y - 0.73) / 0.05));
      const dx = part === 'head' ? (y - 0.48) * 10 * head : 0;
      const dy = part === 'head' ? -(x - 0.5) * 10 * head : 0.8 * badge;
      const red = Math.round(128 + dx * 255 / 16);
      const green = Math.round(128 + dy * 255 / 16);
      cells.push(`<rect x="${col * 100 / grid}" y="${row * 100 / grid}" width="${100 / grid}" height="${100 / grid}" fill="rgb(${red},${green},128)"/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><filter id="soft"><feGaussianBlur stdDeviation="1.5"/></filter></defs><rect width="100" height="100" fill="rgb(128,128,128)"/><g filter="url(#soft)">${cells.join('')}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const headMap = makeMotionMap('head');
const badgeMap = makeMotionMap('badge');
const duration = 1050;

export const TelegramMascot = () => {
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const nearFooter = useLayoutStore(state => state.isCloseToBottom);
  const filterId = `telegram-greeting-${useId().replace(/:/g, '')}`;
  const headRef = useRef<SVGFEDisplacementMapElement>(null);
  const badgeRef = useRef<SVGFEDisplacementMapElement>(null);
  const frameRef = useRef<number | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // App-level state survives navigation, but resets on refresh.
  const [dismissed, setDismissed] = useState(false);
  const popupId = `${filterId}-popup`;

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !widgetRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const dismiss = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setOpen(false);
    setDismissed(true);
  };

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  const greet = () => {
    if (frameRef.current !== null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Tilt, a small answering nod, then settle; the badge follows slightly later.
      const head = t < 0.32 ? smooth(t / 0.32)
        : t < 0.68 ? 1 - 1.18 * smooth((t - 0.32) / 0.36)
        : -0.18 * (1 - smooth((t - 0.68) / 0.32));
      const badge = t < 0.5 ? smooth((t - 0.12) / 0.38)
        : 1 - smooth((t - 0.5) / 0.5);
      headRef.current?.setAttribute('scale', String(16 * head));
      badgeRef.current?.setAttribute('scale', String(16 * badge));
      frameRef.current = t < 1 ? requestAnimationFrame(tick) : null;
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  if (dismissed || isFinal) return null;

  const closeButton = (
    <button type="button" aria-label="Hide Telegram widget until refresh" onClick={dismiss}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-grey hover:text-white focus-visible:outline-2 focus-visible:outline-blue">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 3 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    </button>
  );

  return (
    <div ref={widgetRef} className={`fixed ${nearFooter ? 'bottom-40 md:bottom-20' : 'bottom-20'} right-4 z-30 w-[calc(var(--spacing)*20*1.05)] sm:w-[calc(var(--spacing)*32*1.05)] md:w-[calc(var(--spacing)*32*0.7)]`}>
      {open ? (
        <div id={popupId} role="dialog" aria-label="Join our Telegram"
          className="absolute bottom-full right-0 mb-3 w-60 max-w-[calc(100vw-var(--spacing)*8)] rounded-xl border border-dark-blue-hover bg-background p-4 text-white shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">Join our Telegram</p>
            {closeButton}
          </div>
          <p className="mt-1 text-xs text-grey">Get updates. Join the conversation.</p>
          <a href={VENUS_TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex min-h-10 items-center justify-center rounded-lg bg-blue px-3 text-sm font-semibold text-white hover:bg-darkBlue focus-visible:outline-2 focus-visible:outline-blue">
            Open Telegram
          </a>
        </div>
      ) : <div className="absolute -right-1 -top-4">{closeButton}</div>}
      <button ref={triggerRef} type="button" aria-label="Open Telegram community popup"
        aria-expanded={open} aria-controls={open ? popupId : undefined} aria-haspopup="dialog"
        onClick={() => setOpen(value => !value)}
        onPointerEnter={event => { if (event.pointerType === 'mouse') greet(); }}
        onFocus={greet}
        className="block w-full cursor-pointer rounded-lg border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-blue">
      <svg viewBox="0 0 100 100" className="block h-auto w-full overflow-visible" role="img" aria-label="Xiaobai holding Telegram, tilting its head to say hello">
        <defs>
          {/* Keep the lower silhouette pixel-stable, outside every motion filter. */}
          <clipPath id={`${filterId}-upper`}><rect width="100" height="78" /></clipPath>
          <clipPath id={`${filterId}-lower`}><rect y="78" width="100" height="22" /></clipPath>
          <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={headMap} x="0" y="0" width="100" height="100" result="head-map" />
            <feDisplacementMap ref={headRef} in="SourceGraphic" in2="head-map" scale="0" xChannelSelector="R" yChannelSelector="G" result="head-motion" />
            <feImage href={badgeMap} x="0" y="0" width="100" height="100" result="badge-map" />
            <feDisplacementMap ref={badgeRef} in="head-motion" in2="badge-map" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g clipPath={`url(#${filterId}-upper)`}>
          <image href="/images/xiaobai-telegram-v3.png" width="100" height="100" filter={`url(#${filterId})`} />
        </g>
        <image href="/images/xiaobai-telegram-v3.png" width="100" height="100" clipPath={`url(#${filterId}-lower)`} />
      </svg>
      </button>
    </div>
  );
};
