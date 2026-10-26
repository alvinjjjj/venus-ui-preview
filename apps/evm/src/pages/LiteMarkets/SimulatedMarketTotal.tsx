import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';

// Presentation-only offsets in cents, never written to queries or transaction data.
const PREVIEW_OFFSETS = [0, 200000, 100000, 700000, 400000, 1400000];
// E3 randomizes within the same hundred-million-dollar band, presentation only.
const E3_BAND_CENTS = 10000000000;
const STEP_CENTS = 100000; // Only whole $1,000 steps; cents / small digits stay readable.
const HOLD_MS = 15000;
const TRANSITION_MS = 45000;
const CYCLE_MS = HOLD_MS + TRANSITION_MS;

// Keep unchanged places still; only a changed numeral gets a new animation key.
const RollingDigit = ({ character }: { character: string }) => {
  const [snapshot, setSnapshot] = useState({ current: character, previous: character });
  if (snapshot.current !== character) {
    setSnapshot({ current: character, previous: snapshot.current });
  }
  const changed = /[0-9]/.test(character) && snapshot.previous !== character;
  return (
    <span className="lite-e3-digit" data-changing={changed || undefined}>
      {changed && <span key={`old-${character}`} className="lite-e3-digit-out">{snapshot.previous}</span>}
      <span key={character} className={changed ? 'lite-e3-digit-in' : undefined}>{character}</span>
    </span>
  );
};

export const SimulatedMarketTotal = ({
  valueCents,
  field,
  updateIntervalMs,
  animateDigits = false,
  decimalPlaces = animateDigits ? 0 : 2,
}: {
  valueCents: BigNumber;
  field: 'supplyUsd' | 'liquidityUsd';
  updateIntervalMs?: number;
  animateDigits?: boolean;
  decimalPlaces?: 0 | 2;
}) => {
  const node = useRef<HTMLSpanElement>(null);
  const [offsetCents, setOffsetCents] = useState(0);
  const baseKey = valueCents.toFixed();

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const hasObserver = typeof IntersectionObserver === 'function';
    let visible = !hasObserver;
    let frame: number | undefined;
    let previousTime: number | undefined;
    let elapsed = 0;
    let lastRandomStep = 0;
    const positiveBase = new BigNumber(baseKey).isGreaterThan(0);
    const running = () => !!media && !media.matches && visible && !document.hidden && positiveBase;
    const tick = (time: number) => {
      frame = undefined;
      if (!running()) return;
      if (previousTime !== undefined) elapsed += time - previousTime;
      previousTime = time;
      if (updateIntervalMs && updateIntervalMs > 0) {
        const step = Math.floor(elapsed / updateIntervalMs);
        if (step !== lastRandomStep) {
          lastRandomStep = step;
          const randomRemainder = Math.floor(Math.random() * 100000000) * 100;
          setOffsetCents(randomRemainder - new BigNumber(baseKey).modulo(E3_BAND_CENTS).toNumber());
        }
        frame = requestAnimationFrame(tick);
        return;
      }
      const segment = Math.floor(elapsed / CYCLE_MS) % PREVIEW_OFFSETS.length;
      const progress = Math.max(0, Math.min(((elapsed % CYCLE_MS) - HOLD_MS) / TRANSITION_MS, 1));
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      const from = PREVIEW_OFFSETS[segment];
      const to = PREVIEW_OFFSETS[(segment + 1) % PREVIEW_OFFSETS.length];
      const direction = field === 'supplyUsd' ? 1 : -1;
      const drift = (from + (to - from) * eased) * direction;
      setOffsetCents(Math.sign(drift) * Math.round(Math.abs(drift) / STEP_CENTS) * STEP_CENTS);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (running()) {
        if (frame === undefined) {
          previousTime = undefined;
          frame = requestAnimationFrame(tick);
        }
      } else {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        previousTime = undefined;
        if (media?.matches) {
          elapsed = 0;
          lastRandomStep = 0;
          setOffsetCents(0);
        }
      }
    };
    setOffsetCents(0);
    const observer = hasObserver
      ? new IntersectionObserver(([entry]) => {
          visible = !!entry?.isIntersecting;
          sync();
        })
      : undefined;
    if (node.current) observer?.observe(node.current);
    document.addEventListener('visibilitychange', sync);
    media?.addEventListener('change', sync);
    sync();
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
      media?.removeEventListener('change', sync);
    };
  }, [baseKey, field, updateIntervalMs]);

  const displayCents = BigNumber.maximum(0, valueCents.plus(offsetCents));
  // Display precision is independent of motion; underlying cents remain intact.
  const displayValue = displayCents.isZero() ? '$0' : `$${displayCents.shiftedBy(-2).toFormat(decimalPlaces, BigNumber.ROUND_DOWN)}`;

  return (
    <span ref={node} className="lite-e2-preview-total" aria-live="off">
      {animateDigits ? (
        <>
          <span className="sr-only">{displayValue}</span>
          <span className="lite-e3-rolling-total" aria-hidden="true">
            {Array.from(displayValue).map((character, index) => (
              <RollingDigit key={displayValue.length - index} character={character} />
            ))}
          </span>
        </>
      ) : displayValue}
    </span>
  );
};
