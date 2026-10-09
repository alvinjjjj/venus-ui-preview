import { TokenIcon, TokenTextField } from 'components';
import { motion } from 'motion/react';
import { useProgress } from './BorrowVisual';
import { StepVisualDeck } from './StepVisualDeck';
import { AgentHead, bubble, fill, money, useBeats } from './SupplyVisual';
import type { EarnVisualCopy } from './earnCopy';
import { type PrimeSnapshot, usePrimeSnapshot } from './usePrime';

/** Illustrative stake; the cut-off, cycle, pool and rates are live. */
const STAKE_XVS = 2_000;
/** Illustrative climb over the cycle, as a share of the board and of the seats. */
const START_SHARE = 0.44;
const END_SHARE = 0.64;
const DAYS = 45;
export const SCREEN_MS = [4600, 5600, 6000] as const;

type Values = Record<string, string>;

/**
 * Step 04 visual: three cards. Stake (XVS into the vault, with voting power and
 * today's top-N cut-off), Rank (the score grows with time, the rank climbs past
 * the Prime seats before the cycle ends), Boost (what Prime adds on a Core Pool
 * market, and this cycle's reward pool).
 */
export const EarnVisual: React.FC<{
  copy: EarnVisualCopy;
  screen: number;
  onScreenChange: (screen: number) => void;
  requestRun: number;
}> = ({ copy, screen, onScreenChange, requestRun }) => {
  const prime = usePrimeSnapshot();
  const days = Math.max(0, Math.ceil((prime.endsAt.getTime() - Date.now()) / 86_400_000));
  const total = prime.usdtSupplyApy + prime.usdtPrimeBoost;
  const values: Values = {
    seats: String(prime.seats),
    min: money(prime.minimumStakeXvs, 0),
    cycle: String(prime.cycleIndex),
    days: String(days),
    pool: `$${money(prime.cyclePoolUsd, 0)}`,
    base: `${prime.usdtSupplyApy.toFixed(2)}%`,
    boost: `+${prime.usdtPrimeBoost.toFixed(2)}%`,
    total: `${total.toFixed(2)}%`,
    xvs: money(STAKE_XVS, 0),
  };

  return (
    <StepVisualDeck
      copy={copy}
      durations={SCREEN_MS}
      screen={screen}
      onScreenChange={onScreenChange}
      requestRun={requestRun}
      variant="borrow"
      showHub
      renderScreen={(index, play, agent, settled) => {
        const props = { copy, play, settled, prime, values };
        if (agent) return <AgentEarn {...props} index={index} />;
        if (index === 0) return <StakeScreen {...props} />;
        if (index === 1) return <RankScreen {...props} />;
        return <BoostScreen {...props} />;
      }}
    />
  );
};

interface ScreenProps {
  copy: EarnVisualCopy;
  play: boolean;
  settled: boolean;
  prime: PrimeSnapshot;
  values: Values;
}

/* 01 · Stake: XVS into the vault; voting power follows; today's cut-off for Prime. */
const StakeScreen: React.FC<ScreenProps> = ({ copy, play, settled, prime, values }) => {
  const amount = useProgress(play, settled, 1300, 500);
  return (
    <div className="venus-steps__borrow">
      <span className="venus-steps__label">{copy.stakeTitle}</span>
      {prime.xvs ? (
        <TokenTextField
          className="venus-steps__field"
          token={prime.xvs}
          value={String(Math.round(STAKE_XVS * amount))}
          onChange={() => undefined}
          displayTokenIcon
          tokenPriceCents={prime.xvsPriceUsd * 100}
          readOnly
          tabIndex={-1}
        />
      ) : null}
      <dl className="venus-steps__stats">
        <div>
          <dt>{copy.votingPower}</dt>
          <dd className="venus-steps__stats-hero">
            {money(STAKE_XVS * amount, 0)} <small>{copy.votes}</small>
          </dd>
        </div>
        <div>
          <dt>{fill(copy.cutoff, values)}</dt>
          <dd>{values.min} XVS</dd>
        </div>
      </dl>
      <p className="venus-steps__borrow-note">{copy.votingNote}</p>
    </div>
  );
};

/* 02 · Rank: days pass, the score grows, the rank climbs past the Prime seats. */
const RankScreen: React.FC<ScreenProps> = ({ copy, play, settled, prime, values }) => {
  const progress = useProgress(play, settled, 2600, 400);
  const start = Math.round(prime.ranked * START_SHARE);
  const end = Math.round(prime.seats * END_SHARE);
  const rank = Math.round(start + (end - start) * progress);
  // Position on the board, last place on the left and #1 on the right, on a
  // square-root scale: linear leaves the top 500 of ~4,000 a sliver at the end,
  // log overstates it; this keeps the seats about a third of the bar.
  const at = (value: number) =>
    1 - Math.sqrt(Math.max(0, value - 1) / Math.max(1, prime.ranked - 1));
  const inside = rank <= prime.seats;
  return (
    <div className="venus-steps__borrow">
      <div className="venus-steps__row">
        <span className="venus-steps__label">{fill(copy.cycle, values)}</span>
        <span className="venus-steps__countdown">{fill(copy.endsIn, values)}</span>
      </div>
      <div className="venus-steps__row venus-steps__rank-head">
        <div>
          <span className="venus-steps__label">{copy.yourRank}</span>
          <strong className="venus-steps__value">#{money(rank, 0)}</strong>
        </div>
        <div className="venus-steps__rank-days">
          <span className="venus-steps__label">{copy.daysStaked}</span>
          <strong>{Math.round(DAYS * progress)}</strong>
        </div>
      </div>
      <div className="venus-steps__board" data-inside={inside}>
        <span className="venus-steps__board-fill" style={{ width: `${at(rank) * 100}%` }} />
        <span className="venus-steps__board-seats" style={{ left: `${at(prime.seats) * 100}%` }} />
        <span className="venus-steps__board-label" style={{ left: `${at(prime.seats) * 100}%` }}>
          {fill(copy.topSeats, values)}
        </span>
        <span className="venus-steps__board-dot" style={{ left: `${at(rank) * 100}%` }} />
      </div>
      <div className="venus-steps__health-scale">
        <span>#{money(prime.ranked, 0)}</span>
        <span>#1</span>
      </div>
      <p className="venus-steps__borrow-note">
        {copy.scoreRule}
        <br />
        {fill(copy.rankNote, values)}
      </p>
    </div>
  );
};

/* 03 · Boost: lead with this cycle's reward pool for the top seats; the rate detail follows. */
const BoostScreen: React.FC<ScreenProps> = ({ copy, play, settled, prime, values }) => {
  const progress = useProgress(play, settled, 1800, 300);
  const total = prime.usdtSupplyApy + prime.usdtPrimeBoost;
  const scale = Math.max(total, 0.01);
  return (
    <div className="venus-steps__borrow">
      <div className="venus-steps__row">
        <span className="venus-steps__label">{copy.pool}</span>
        <span className="venus-steps__countdown">{fill(copy.topSeats, values)}</span>
      </div>
      <strong className="venus-steps__value">${money(prime.cyclePoolUsd * progress, 0)}</strong>
      <p className="venus-steps__borrow-note venus-steps__pool-note">
        {fill(copy.poolNote, values)}
      </p>
      <span className="venus-steps__vh-name venus-steps__boost-market">
        {prime.usdt ? <TokenIcon token={prime.usdt} size="lg" /> : null}
        {copy.marketTitle}
      </span>
      <div className="venus-steps__boost-bar" aria-hidden="true">
        <span style={{ width: `${(prime.usdtSupplyApy / scale) * 100 * progress}%` }} />
        <span
          className="is-prime"
          style={{ width: `${(prime.usdtPrimeBoost / scale) * 100 * progress}%` }}
        />
      </div>
      <dl className="venus-steps__ledger">
        <div>
          <dt>{copy.supplyApy}</dt>
          <dd>{values.base}</dd>
        </div>
        <div>
          <dt>
            {copy.primeBoost} · {copy.estimated}
          </dt>
          <dd className="is-up">≈ {values.boost}</dd>
        </div>
      </dl>
    </div>
  );
};

/* Agent: the same three beats as a conversation. */
const AgentEarn: React.FC<ScreenProps & { index: number }> = ({
  copy,
  play,
  settled,
  index,
  values,
}) => {
  const animate = play && !settled;
  const beat = useBeats(animate, [1200]);
  const shown = settled ? 1 : beat;
  return (
    <div className="venus-steps__chat">
      <AgentHead copy={copy} />
      <motion.p className="venus-steps__bubble" {...bubble(animate, 0.1)}>
        {copy.agentPrompts[index]}
      </motion.p>
      {shown >= 1 ? (
        <motion.p className="venus-steps__reply" {...bubble(animate)}>
          {fill(copy.agentReplies[index], values)}
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
