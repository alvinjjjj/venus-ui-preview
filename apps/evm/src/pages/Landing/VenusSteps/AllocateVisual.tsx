import venusCoreIcon from 'assets/img/venusCoreIcon.png';
import venusLogo from 'assets/img/venusLogo.svg';
import { Icon, ProgressBar } from 'components';
import { useEffect, useRef, useState } from 'react';
import { StepVisualDeck } from './StepVisualDeck';
import type { AllocateVisualCopy } from './allocateCopy';
import spokeMarketsIcon from './assets/spokeMarketsIcon.png';
import vaultsIcon from './assets/vaultsIcon.png';

export const durations = [4400, 5200, 5600, 6000] as const;
// One coherent mock-up scenario: all splits and limits are illustrative, not live policy.
const amount = 10_000;
const sources = [
  { id: 'core', share: 50, limit: 60 },
  { id: 'spoke', share: 30, limit: 35 },
  { id: 'vault', share: 20, limit: 25 },
] as const;
const formatAmount = (value: number) => Math.round(value).toLocaleString('en-US');

/** The three destinations share one look: app tiles (Core, Spoke Markets, Vaults). */
const destinationIcons = [venusCoreIcon, spokeMarketsIcon, vaultsIcon] as const;

const SourceIcon: React.FC<{ index: number }> = ({ index }) => (
  <span className="venus-steps__destination-icon" aria-hidden="true">
    <img src={destinationIcons[index]} alt="" />
  </span>
);

export const AllocateVisual: React.FC<{
  copy: AllocateVisualCopy;
  exploreSpoke?: boolean;
  screen: number;
  onScreenChange: (screen: number) => void;
  requestRun: number;
}> = ({ copy, screen, onScreenChange, requestRun, exploreSpoke = false }) => {
  const [selected, setSelected] = useState(exploreSpoke ? 1 : 0);
  return (
    <StepVisualDeck
      copy={copy}
      durations={durations}
      screen={screen}
      onScreenChange={onScreenChange}
      requestRun={requestRun}
      initialPaused={exploreSpoke}
      showHub
      renderScreen={(screen, play, agent, settled, paused) => (
        <>
          {agent ? (
            <AgentAllocation
              copy={copy}
              screen={screen}
              play={play}
              settled={settled}
              initiallyComplete={paused}
            />
          ) : screen === 0 ? (
            <HubScene copy={copy} play={play} settled={settled} />
          ) : screen === 1 ? (
            <div className="venus-steps__destinations">
              <div className="venus-steps__destination-list">
                {sources.map((source, index) => (
                  <button
                    key={source.id}
                    type="button"
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                    className="venus-steps__destination"
                  >
                    <SourceIcon index={index} />
                    <span>
                      <strong>{copy.sourceNames[index]}</strong>
                      <small>{copy.sourceDescriptions[index]}</small>
                    </span>
                    <Icon name="arrowRight" />
                  </button>
                ))}
              </div>
              <p className="venus-steps__destination-detail" aria-live="polite">
                {copy.sourceDetails[selected]}
              </p>
            </div>
          ) : (
            <AllocationScene
              copy={copy}
              play={play}
              settled={settled}
              initiallyComplete={paused}
              overview={screen === 3}
            />
          )}
        </>
      )}
    />
  );
};

const HubScene: React.FC<{
  copy: AllocateVisualCopy;
  play: boolean;
  settled: boolean;
}> = ({ copy, play, settled }) => {
  return (
    <div className="venus-steps__hub-scene" data-playing={play} data-settled={settled}>
      <span className="venus-steps__label">{copy.deposit}</span>
      <strong className="venus-steps__allocation-total">
        10,000 <small>USDC</small>
      </strong>
      <svg
        viewBox="0 0 420 212"
        role="img"
        aria-label={`Liquidity Hub → ${copy.sourceNames.join(', ')}`}
      >
        <defs>
          <clipPath id="venus-steps-dest-tile" clipPathUnits="objectBoundingBox">
            <rect width="1" height="1" rx="0.22" />
          </clipPath>
        </defs>
        <path d="M210 60V94 M70 120V94H350V120 M210 94V120" className="venus-steps__hair" />
        {[70, 210, 350].map((x, index) => (
          <g key={x}>
            {!settled && (
              <path
                d={`M210 60 L210 94 L${x} 94 L${x} 120`}
                pathLength="100"
                className="venus-steps__allocation-light"
                style={{
                  animationDelay: `${index * 0.18}s`,
                  animationPlayState: play ? 'running' : 'paused',
                }}
              />
            )}
            {/* one tile style for all three destinations */}
            <image
              href={destinationIcons[index]}
              x={x - 28}
              y="120"
              width="56"
              height="56"
              clipPath="url(#venus-steps-dest-tile)"
            />
            <rect
              x={x - 28}
              y="120"
              width="56"
              height="56"
              rx="12"
              className="venus-steps__node-ring"
            />
            <text x={x} y="200" textAnchor="middle" className="venus-steps__svg-label">
              {copy.sourceNames[index]}
            </text>
          </g>
        ))}
        <rect x="126" y="6" width="168" height="54" rx="12" className="venus-steps__node is-hub" />
        <image href={venusLogo} x="146" y="21" width="24" height="24" />
        <text x="180" y="39" className="venus-steps__svg-label is-hub">
          Liquidity Hub
        </text>
      </svg>
    </div>
  );
};

/** Pause retains the counter; background cards and reduced motion show the completed split. */
const useAllocationProgress = (play: boolean, settled: boolean, initiallyComplete: boolean) => {
  const elapsed = useRef(settled || initiallyComplete ? 1800 : 0);
  const [progress, setProgress] = useState(settled || initiallyComplete ? 1 : 0);
  useEffect(() => {
    if (settled) {
      elapsed.current = 1800;
      setProgress(1);
      return;
    }
    if (!play) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current = Math.min(1800, elapsed.current + now - previous);
      previous = now;
      const t = elapsed.current / 1800;
      setProgress(1 - (1 - t) ** 3);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [play, settled]);
  return progress;
};

const AllocationScene: React.FC<{
  copy: AllocateVisualCopy;
  play: boolean;
  settled: boolean;
  overview: boolean;
  initiallyComplete: boolean;
}> = ({ copy, play, settled, overview, initiallyComplete }) => {
  const progress = useAllocationProgress(play, settled, initiallyComplete);
  return (
    <div className="venus-steps__allocation-scene">
      {overview && <span className="venus-steps__label">vhUSDC</span>}
      {overview && (
        <strong className="venus-steps__allocation-total">
          {formatAmount(amount * progress)} <small>USDC</small>
        </strong>
      )}
      {overview && (
        <div
          className="venus-steps__allocation-summary-bar"
          role="img"
          aria-label={sources
            .map((source, index) => `${copy.sourceNames[index]} ${source.share}%`)
            .join(', ')}
        >
          {sources.map(source => (
            <span
              key={source.id}
              className={`venus-steps__segment is-${source.id}`}
              style={{ width: `${source.share * progress}%` }}
            />
          ))}
        </div>
      )}
      <ul className="venus-steps__allocation-list">
        {sources.map((source, index) => (
          <li key={source.id}>
            <div className="venus-steps__row">
              <span className="venus-steps__allocation-name">
                <SourceIcon index={index} />
                {copy.sourceNames[index]}
              </span>
              <strong>{Math.round(source.share * progress)}%</strong>
            </div>
            {overview ? (
              <span className="venus-steps__allocation-amount">
                {formatAmount(((amount * source.share) / 100) * progress)} USDC
              </span>
            ) : (
              <>
                <ProgressBar
                  min={0}
                  max={100}
                  progressBars={[
                    {
                      value: source.share * progress,
                      className: `venus-steps__segment is-${source.id}`,
                    },
                  ]}
                  marks={[{ value: source.limit, className: 'venus-steps__limit-mark' }]}
                  className="venus-steps__allocation-bar"
                />
                <div className="venus-steps__row venus-steps__label">
                  <span>{formatAmount(((amount * source.share) / 100) * progress)} USDC</span>
                  <span>
                    {copy.limit} {source.limit}%
                  </span>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Agent interprets the same mock allocation in conversation rather than operating it. */
const AgentAllocation: React.FC<{
  copy: AllocateVisualCopy;
  screen: number;
  play: boolean;
  settled: boolean;
  initiallyComplete: boolean;
}> = ({ copy, screen, play, settled, initiallyComplete }) => {
  const progress = useAllocationProgress(play, settled, initiallyComplete);
  return (
    <div className="venus-steps__allocation-chat">
      <p className="venus-steps__bubble">{copy.agentPrompts[screen]}</p>
      <div className="venus-steps__reply">
        <p className="venus-steps__allocation-agent">
          <Icon name="star" />
          {copy.agentNotes[screen]}
        </p>
        <ul className="venus-steps__agent-summary">
          {sources.map((source, index) => (
            <li key={source.id}>
              <SourceIcon index={index} />
              <span>
                {copy.sourceNames[index]}
                <small>
                  {screen === 1
                    ? copy.sourceDescriptions[index]
                    : `${formatAmount(((amount * source.share) / 100) * progress)} USDC`}
                </small>
              </span>
              <strong>
                {screen === 2
                  ? `${copy.limit} ${source.limit}%`
                  : `${Math.round(source.share * progress)}%`}
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
