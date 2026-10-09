import { isExplorerMode, useGlassPreview } from 'demo/GlassVersions/store';
import { useCallback, useEffect, useRef, useState } from 'react';

// User-supplied draft values; replace these when the confirmed data is supplied.
const proofValues = [2020, 41, 623, 123] as const;
/**
 * Explorer: checked against the official sources on 7 Oct 2026.
 * - 66 markets: listed and open for supply on the 8 mainnets (api.venus.io/pools,
 *   MINT pause bit off), deduplicated by chain + vToken. 44 also allow borrowing.
 * - 628 proposals in state Executed (api.venus.io/governance/proposals, 665 total).
 * - 101 published audit report PDFs (docs-v4.venus.io Security & Audits catalog).
 * See docs/SECTION-2-TRUST-METRICS-2026-10-06.md for the counting rules.
 */
// Audits: 83, the sum of the Section 4 auditor list (FE to serve from an API).
const explorerProofValues = [2020, 66, 628, 83] as const;
const COUNT_DURATION_MS = 900;
/** Explorer counts slower, easing in and out, so the number settles instead of stopping. */
const EXPLORER_COUNT_DURATION_MS = 1600;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

const ProofValue: React.FC<{
  target: number;
  index: number;
  entered: boolean;
  ready: boolean;
  placeholderLabel: string;
  explorer: boolean;
  unit?: string;
}> = ({ target, index, entered, ready, placeholderLabel, explorer, unit }) => {
  const [value, setValue] = useState(target);
  const frameRef = useRef(0);
  const animate = useCallback(
    (delay = 0) => {
      cancelAnimationFrame(frameRef.current);
      if (index === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setValue(target);
        return;
      }
      setValue(0);
      const start = performance.now() + delay;
      const duration = explorer ? EXPLORER_COUNT_DURATION_MS : COUNT_DURATION_MS;
      const ease = explorer ? easeInOutCubic : easeOutCubic;
      const tick = (time: number) => {
        const progress = Math.max(0, Math.min(1, (time - start) / duration));
        setValue(Math.round(target * ease(progress)));
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        else frameRef.current = 0;
      };
      frameRef.current = requestAnimationFrame(tick);
    },
    [target, index, explorer],
  );
  useEffect(() => {
    if (entered) animate(160 + index * 80);
  }, [entered, animate, index]);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      setValue(target);
    };
    const onVisibility = () => {
      if (document.hidden) finish();
    };
    motion.addEventListener('change', finish);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frameRef.current);
      motion.removeEventListener('change', finish);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [target]);
  const replay = () => {
    if (entered && ready && index > 0 && !frameRef.current) animate();
  };
  return (
    <dd
      aria-label={`${target}${unit ? ` ${unit}` : ''} · ${placeholderLabel}`}
      title={placeholderLabel}
      tabIndex={index > 0 ? 0 : undefined}
      onPointerEnter={replay}
      onFocus={event => {
        if (event.currentTarget.matches(':focus-visible')) replay();
      }}
    >
      {index > 0 && (
        <span className="asset-orbit__count-width" aria-hidden="true">
          {target}
        </span>
      )}
      <span className={index === 0 ? 'asset-orbit__year' : 'asset-orbit__count'} aria-hidden="true">
        {value}
      </span>
      {unit ? (
        <span className="asset-orbit__unit" aria-hidden="true">
          {unit}
        </span>
      ) : null}
    </dd>
  );
};

export const ProofMetrics: React.FC<{
  labels: readonly string[];
  placeholderLabel: string;
  ready: boolean;
  /** New split layout: accent unit after each figure, and an eyebrow. */
  units?: readonly string[];
  eyebrow?: string;
}> = ({ labels, placeholderLabel, ready, units, eyebrow }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const explorer = useGlassPreview(state => isExplorerMode(state.mode));
  const values = explorer ? explorerProofValues : proofValues;
  useEffect(() => {
    if (!ready || entered || !rootRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [ready, entered]);
  return (
    <div ref={rootRef} className="asset-orbit__proof" data-entered={entered}>
      {eyebrow ? <p className="asset-orbit__eyebrow">{eyebrow}</p> : null}
      <dl>
        {labels.map((label, index) => (
          <div key={label}>
            <dt>{label}</dt>
            <ProofValue
              target={values[index]}
              index={index}
              entered={entered}
              ready={ready}
              placeholderLabel={placeholderLabel}
              explorer={explorer}
              unit={units?.[index]}
            />
          </div>
        ))}
      </dl>
    </div>
  );
};
