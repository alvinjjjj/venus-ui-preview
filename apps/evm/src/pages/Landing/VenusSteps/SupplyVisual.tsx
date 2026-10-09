import { Icon, TokenIcon, TokenTextField, YieldGroups } from 'components';
import { motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import venusMarkWhite from '../LandingMockup/assets/venus-mark-white.svg';
import { StepVisualDeck, type VisualDeckCopy } from './StepVisualDeck';
import type { SupplyVisualCopy } from './copy';
import { type HubAsset, useHubAssets } from './useTopHub';

const AMOUNT = 10_000;
const ease = [0.22, 1, 0.36, 1] as const;
/** How long each card stays in front before the next one comes forward. */
export const SCREEN_MS = [2600, 4200, 6400] as const;

export const money = (value: number, digits = 2) =>
  value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);

type Values = Record<string, string>;

/**
 * Step 01 visual. Choose, Supply and Hold sit together as a stacked deck: the
 * current card is in front and sharp, the others wait behind it, smaller and
 * softer. Where the deposit goes is Allocate's story (step 02). Rates and share
 * prices come live from the Liquidity Hub, highest APY first; the 10,000 is illustrative.
 */
export const SupplyVisual: React.FC<{
  copy: SupplyVisualCopy;
  playback: Pick<VisualDeckCopy, 'pause' | 'resume' | 'replay'>;
  screen: number;
  onScreenChange: (screen: number) => void;
  requestRun: number;
}> = ({ copy, playback, screen, onScreenChange, requestRun }) => {
  const { assets } = useHubAssets();
  const top = assets[0];
  const shares = AMOUNT / top.pricePerShare;
  const values: Values = {
    sym: top.symbol,
    vh: top.vhSymbol,
    apy: `${top.apy.toFixed(2)}%`,
    shares: money(shares),
    pps: top.pricePerShare.toFixed(2),
    value: `$${money(AMOUNT)}`,
    year: `$${money((AMOUNT * top.apy) / 100, 0)}`,
    cf: `${Number(top.collateralFactor.toFixed(1))}%`,
  };

  return (
    <StepVisualDeck
      copy={{ ...copy, pause: playback.pause, resume: playback.resume, replay: playback.replay }}
      durations={SCREEN_MS}
      screen={screen}
      onScreenChange={onScreenChange}
      requestRun={requestRun}
      variant="supply"
      showHub
      renderScreen={(index, play, agent) => {
        const props = { copy, values, top, play };
        if (agent && index === 0) return <AgentAsk {...props} assets={assets} />;
        if (agent && index === 1) return <AgentSupply {...props} />;
        if (index === 0) return <ChooseScreen {...props} assets={assets} />;
        if (index === 1) return <SupplyScreen {...props} />;
        return <HoldScreen {...props} agent={agent} />;
      }}
    />
  );
};

interface ScreenProps {
  copy: SupplyVisualCopy;
  values: Values;
  top: HubAsset;
  /** True while this card is in front and the section is on screen. */
  play: boolean;
}

/** Preserve elapsed time when playback pauses instead of restarting the transaction beats. */
export const useBeats = (play: boolean, times: number[]) => {
  const [beat, setBeat] = useState(play ? 0 : times.length);
  const elapsed = useRef(play ? 0 : times[times.length - 1]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: schedule is static per screen
  useEffect(() => {
    if (!play) return;
    const started = performance.now();
    const timers = times.map((ms, index) =>
      window.setTimeout(() => setBeat(index + 1), Math.max(0, ms - elapsed.current)),
    );
    return () => {
      elapsed.current += performance.now() - started;
      timers.forEach(window.clearTimeout);
    };
  }, [play]);
  return beat;
};

export const VhIcon: React.FC<{ asset: HubAsset }> = ({ asset }) =>
  asset.vhToken ? (
    <TokenIcon token={asset.vhToken} size="lg" />
  ) : (
    <span className="venus-steps__token-fallback" />
  );

export const TxSteps: React.FC<{ labels: string[]; step: number }> = ({ labels, step }) => (
  <ul className="venus-steps__tx">
    {labels.map((label, index) => {
      const state = step > index ? 'done' : step === index ? 'running' : 'waiting';
      return (
        <li key={label} data-state={state}>
          <span className="venus-steps__agent-dot" aria-hidden="true">
            {state === 'done' ? <Icon name="mark" className="venus-steps__check" /> : null}
          </span>
          {label}
        </li>
      );
    })}
  </ul>
);

/* 01 · Choose: the Hub's assets, live APY, highest first. */
const ChooseScreen: React.FC<ScreenProps & { assets: HubAsset[] }> = ({ copy, assets, play }) => (
  <>
    <span className="venus-steps__label">{copy.choose}</span>
    <ul className="venus-steps__assets-list">
      {assets.slice(0, 3).map((asset, index) => (
        <motion.li
          key={asset.symbol}
          data-top={index === 0}
          initial={play ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.05 + index * 0.06 }}
        >
          {asset.token ? <TokenIcon token={asset.token} size="lg" /> : null}
          <span className="venus-steps__asset-name">
            <strong>{asset.symbol}</strong>
            {index === 0 ? <span className="venus-steps__badge">{copy.highest}</span> : null}
          </span>
          {asset.spokes.some(spoke => spoke.group) ? (
            <YieldGroups
              className="venus-steps__exposure"
              yieldGroups={asset.spokes.flatMap(spoke => (spoke.group ? [spoke.group] : []))}
            />
          ) : null}
          <span className="venus-steps__apy">
            {asset.apy.toFixed(2)}% <small>{copy.apy}</small>
          </span>
        </motion.li>
      ))}
    </ul>
  </>
);

/* 02 · Supply: the amount in, a vhToken worth the same out. */
const SupplyScreen: React.FC<ScreenProps> = ({ copy, values, top, play }) => {
  const [amount, setAmount] = useState(play ? 0 : AMOUNT);
  const elapsed = useRef(play ? 0 : 1100);
  const step = useBeats(play, [1700, 2900]);
  useEffect(() => {
    if (!play) return;
    let frame = 0;
    const started = performance.now();
    const start = started - elapsed.current;
    const tick = (time: number) => {
      const t = Math.min(1, (time - start) / 1100);
      setAmount(Math.round(AMOUNT * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      elapsed.current += performance.now() - started;
      cancelAnimationFrame(frame);
    };
  }, [play]);
  return (
    <>
      {top.token ? (
        <TokenTextField
          className="venus-steps__field"
          token={top.token}
          value={String(amount)}
          onChange={() => undefined}
          displayTokenIcon
          tokenPriceCents={100}
          readOnly
          tabIndex={-1}
        />
      ) : null}
      <div className="venus-steps__receive">
        <span className="venus-steps__label">{copy.receive}</span>
        <span className="venus-steps__vh-name">
          <VhIcon asset={top} />
          <span>
            {fill(copy.receiveValue, { ...values, value: `$${money(amount)}` })}
            <small>{fill(copy.rate, values)}</small>
          </span>
        </span>
      </div>
      <TxSteps labels={[fill(copy.approve, values), copy.supplyStep]} step={step} />
    </>
  );
};

/** The Hold chart: one year of growth at the Hub's APY (APY already includes compounding). */
const CHART_W = 320;
const CHART_H = 88;
const CHART_STEPS = 48;
const chartPoint = (t: number, apy: number) => {
  const target = AMOUNT * (1 + apy / 100);
  const value = AMOUNT * (1 + apy / 100) ** t;
  // y spans the year's gain, with room above for the end dot and below for the base
  const y = CHART_H - 10 - ((value - AMOUNT) / (target - AMOUNT || 1)) * (CHART_H - 26);
  return { x: t * CHART_W, y, value };
};

/* 03 · Hold: the value in a year counts up while the line draws, both on one ease. */
const HoldScreen: React.FC<ScreenProps & { agent: boolean }> = ({
  copy,
  values,
  top,
  play,
  agent,
}) => {
  const chartId = useId();
  const fillId = `${chartId}-fill`;
  const clipId = `${chartId}-clip`;
  const [progress, setProgress] = useState(play ? 0 : 1);
  const elapsed = useRef(play ? 0 : 3050);
  useEffect(() => {
    if (!play) return;
    let frame = 0;
    const started = performance.now();
    const start = started + 450 - elapsed.current;
    const tick = (time: number) => {
      const t = Math.min(1, Math.max(0, (time - start) / 2600));
      // ease in-out cubic: the year starts slowly, gathers, then settles
      setProgress(t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      elapsed.current += performance.now() - started;
      cancelAnimationFrame(frame);
    };
  }, [play]);

  const points = Array.from({ length: CHART_STEPS + 1 }, (_, index) =>
    chartPoint(index / CHART_STEPS, top.apy),
  );
  const line = points.map((p, index) => `${index ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`;
  const now = chartPoint(progress, top.apy);

  return (
    <>
      <div className="venus-steps__row">
        <span className="venus-steps__vh-name">
          <VhIcon asset={top} />
          {fill(copy.position, values)}
        </span>
        <span className="venus-steps__earning">
          <span aria-hidden="true" />
          {copy.earning}
        </span>
      </div>
      <span className="venus-steps__label venus-steps__value-label">{copy.afterYear}</span>
      <strong className="venus-steps__value">${money(now.value)}</strong>
      <p className="venus-steps__per-year">{fill(copy.perYear, values)}</p>

      <div className="venus-steps__chart" aria-hidden="true">
        <div className="venus-steps__chart-plot">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--color-blue)" stopOpacity="0.28" />
                <stop offset="1" stopColor="var(--color-blue)" stopOpacity="0" />
              </linearGradient>
              <clipPath id={clipId}>
                <rect width={CHART_W * progress} height={CHART_H} />
              </clipPath>
            </defs>
            {/* quarter guides */}
            {[0.25, 0.5, 0.75].map(t => (
              <line
                key={t}
                x1={t * CHART_W}
                x2={t * CHART_W}
                y1="0"
                y2={CHART_H}
                className="venus-steps__chart-guide"
              />
            ))}
            <line
              x1="0"
              x2={CHART_W}
              y1={CHART_H - 10}
              y2={CHART_H - 10}
              className="venus-steps__chart-base"
            />
            <g clipPath={`url(#${clipId})`}>
              <path d={area} fill={`url(#${fillId})`} />
              <path d={line} className="venus-steps__chart-line" />
            </g>
          </svg>
          {/* the dot is HTML so it stays round while the chart stretches */}
          <span
            className="venus-steps__chart-dot"
            style={{ left: `${progress * 100}%`, top: `${(now.y / CHART_H) * 100}%` }}
          />
        </div>
        <div className="venus-steps__chart-axis">
          <span>{copy.today}</span>
          <span>{copy.inYear}</span>
        </div>
      </div>

      <div className="venus-steps__pills">
        <span className="venus-steps__pill">{fill(copy.collateral, values)}</span>
        <span className="venus-steps__pill">{copy.noClaim}</span>
      </div>
      {agent ? <p className="venus-steps__agent-note">{fill(copy.agentDone, values)}</p> : null}
    </>
  );
};

export const AgentHead: React.FC<{ copy: { agentName: string } }> = ({ copy }) => (
  <div className="venus-steps__chat-head">
    <span className="venus-steps__agent-avatar">
      <img src={venusMarkWhite} alt="" />
    </span>
    {copy.agentName}
    <span className="venus-steps__beta">beta</span>
  </div>
);

export const bubble = (play: boolean, delay = 0) => ({
  initial: play ? { opacity: 0, y: 6 } : false,
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease, delay },
});

/* Agent 01: the ask, and the pick from the live Hub rates. */
const AgentAsk: React.FC<ScreenProps & { assets: HubAsset[] }> = ({ copy, values, play }) => {
  const beat = useBeats(play, [1300]);
  return (
    <div className="venus-steps__chat">
      <AgentHead copy={copy} />
      <motion.p className="venus-steps__bubble" {...bubble(play, 0.1)}>
        {copy.prompt}
      </motion.p>
      {beat >= 1 ? (
        <motion.p className="venus-steps__reply" {...bubble(play)}>
          {fill(copy.agentPick, values)}
        </motion.p>
      ) : (
        <span className="venus-steps__typing" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </div>
  );
};

/* Agent 02: the same two transactions, signed once. */
const AgentSupply: React.FC<ScreenProps> = ({ copy, values, play }) => {
  const step = useBeats(play, [1500, 2800]);
  return (
    <div className="venus-steps__chat">
      <AgentHead copy={copy} />
      <motion.p className="venus-steps__reply" {...bubble(play)}>
        {copy.agentWorking}
      </motion.p>
      <TxSteps labels={[fill(copy.approve, values), copy.supplyStep]} step={step} />
    </div>
  );
};
