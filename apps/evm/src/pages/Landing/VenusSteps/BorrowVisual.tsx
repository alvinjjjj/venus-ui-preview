import { ProgressBar, TokenIcon, TokenTextField } from 'components';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { StepVisualDeck } from './StepVisualDeck';
import { AgentHead, TxSteps, VhIcon, bubble, fill, money, useBeats } from './SupplyVisual';
import type { BorrowVisualCopy } from './borrowCopy';
import { type BorrowAsset, type HubAsset, useBorrowAssets, useHubAssets } from './useTopHub';

/** Same position as the Supply step: $10,000 of the top Hub's vhToken. */
const COLLATERAL = 10_000;
/** Illustrative loan; the rate is live. */
const BORROW = 4_000;
const BORROW_SYMBOLS = ['USDT', 'USDC', 'U'];
export const SCREEN_MS = [4600, 5600, 6400] as const;
const ease = [0.22, 1, 0.36, 1] as const;

type Values = Record<string, string>;

/**
 * Eased 0 → 1 over `duration` after `delay`. Keeps its elapsed time across a
 * pause; cards behind the front one, and reduced motion, show the end state.
 */
export const useProgress = (play: boolean, settled: boolean, duration: number, delay = 0) => {
  const total = delay + duration;
  const elapsed = useRef(settled ? total : 0);
  const [value, setValue] = useState(settled ? 1 : 0);
  useEffect(() => {
    if (settled) {
      elapsed.current = total;
      setValue(1);
      return;
    }
    if (!play) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current = Math.min(total, elapsed.current + now - previous);
      previous = now;
      const t = Math.max(0, elapsed.current - delay) / duration;
      // ease in-out cubic
      setValue(t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
      if (elapsed.current < total) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [play, settled, total, delay, duration]);
  return value;
};

/**
 * Step 03 visual: three cards. Collateral (the vhToken from Supply backs a
 * loan), Borrow (pick an asset at its live Core Pool rate, the limit fills),
 * Health (how much of the limit is used, what the position earns and pays).
 */
export const BorrowVisual: React.FC<{
  copy: BorrowVisualCopy;
  screen: number;
  onScreenChange: (screen: number) => void;
  requestRun: number;
}> = ({ copy, screen, onScreenChange, requestRun }) => {
  const { assets } = useHubAssets();
  const top = assets[0];
  // Borrow a different stablecoin from the one backing the loan.
  const borrowAssets = useBorrowAssets(BORROW_SYMBOLS).filter(asset => asset.symbol !== top.symbol);
  const loan = borrowAssets[0];
  const limit = (COLLATERAL * top.collateralFactor) / 100;
  const used = limit ? BORROW / limit : 0;
  const earn = (COLLATERAL * top.apy) / 100;
  const pay = (BORROW * loan.borrowApy) / 100;
  const values: Values = {
    vh: top.vhSymbol,
    cf: `${Number(top.collateralFactor.toFixed(1))}%`,
    value: `$${money(COLLATERAL)}`,
    limit: `$${money(limit)}`,
    sym: loan.symbol,
    amount: money(BORROW, 0),
    rate: `${loan.borrowApy.toFixed(2)}%`,
    used: `${Math.round(used * 100)}%`,
    apy: `${top.apy.toFixed(2)}%`,
  };
  const model = { top, loan, borrowAssets, limit, used, earn, pay, values };

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
        const props = { copy, play, settled, ...model };
        if (agent) return <AgentBorrow {...props} index={index} />;
        if (index === 0) return <CollateralScreen {...props} />;
        if (index === 1) return <BorrowScreen {...props} />;
        return <HealthScreen {...props} />;
      }}
    />
  );
};

interface ScreenProps {
  copy: BorrowVisualCopy;
  play: boolean;
  settled: boolean;
  top: HubAsset;
  loan: BorrowAsset;
  borrowAssets: BorrowAsset[];
  limit: number;
  used: number;
  earn: number;
  pay: number;
  values: Values;
}

/* 01 · Collateral: switch the vhToken on as collateral; the borrow limit counts up. */
const CollateralScreen: React.FC<ScreenProps> = ({ copy, play, settled, top, limit, values }) => {
  // back cards and reduced motion start switched on (useBeats settles when not playing)
  const on = useBeats(play, [900]) >= 1;
  const count = useProgress(play, settled, 1600, 1100);
  return (
    <div className="venus-steps__borrow">
      <span className="venus-steps__label">{copy.collateralTitle}</span>
      <div className="venus-steps__collateral">
        <span className="venus-steps__vh-name">
          <VhIcon asset={top} />
          <span>
            ${money(COLLATERAL)}
            <small>{top.vhSymbol}</small>
          </span>
        </span>
        <span className="venus-steps__switch-label">
          {copy.useAsCollateral}
          <span className="venus-steps__switch" data-on={on} aria-hidden="true">
            <span />
          </span>
        </span>
      </div>
      <dl className="venus-steps__stats">
        <div>
          <dt>{copy.collateralFactor}</dt>
          <dd>{values.cf}</dd>
        </div>
        <div>
          <dt>{copy.borrowLimit}</dt>
          <dd className="venus-steps__stats-hero">${money(limit * count)}</dd>
        </div>
      </dl>
      <p className="venus-steps__borrow-note">{fill(copy.stillEarning, values)}</p>
    </div>
  );
};

/* 02 · Borrow: assets at live rates, the amount, and the limit it uses. */
const BorrowScreen: React.FC<ScreenProps> = ({
  copy,
  play,
  settled,
  borrowAssets,
  loan,
  limit,
  used,
}) => {
  const amount = useProgress(play, settled, 1300, 700);
  return (
    <div className="venus-steps__borrow">
      <span className="venus-steps__label">{copy.borrowTitle}</span>
      <ul className="venus-steps__assets-list is-compact">
        {borrowAssets.map((asset, index) => (
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
            </span>
            <span className="venus-steps__apy">
              {asset.borrowApy.toFixed(2)}% <small>{copy.borrowApy}</small>
            </span>
          </motion.li>
        ))}
      </ul>
      {loan.token ? (
        <TokenTextField
          className="venus-steps__field"
          token={loan.token}
          value={String(Math.round(BORROW * amount))}
          onChange={() => undefined}
          displayTokenIcon
          tokenPriceCents={100}
          readOnly
          tabIndex={-1}
        />
      ) : null}
      <div className="venus-steps__limit">
        <div className="venus-steps__row">
          <span className="venus-steps__label">{copy.limitUsed}</span>
          <span className="venus-steps__limit-value">{Math.round(used * 100 * amount)}%</span>
        </div>
        <ProgressBar
          min={0}
          max={100}
          progressBars={[{ value: used * 100 * amount, className: 'bg-blue' }]}
          className="venus-steps__limit-bar"
        />
        <div className="venus-steps__row venus-steps__label">
          <span>${money(BORROW * amount)}</span>
          <span>${money(limit)}</span>
        </div>
      </div>
    </div>
  );
};

/** Limit used on a calm scale: green to 60%, amber to 80%, red to liquidation at 100%. */
const HealthBar: React.FC<{ copy: BorrowVisualCopy; used: number }> = ({ copy, used }) => (
  <div className="venus-steps__health">
    <div className="venus-steps__health-track">
      <span
        className="venus-steps__health-marker"
        style={{ left: `${Math.min(used, 1) * 100}%` }}
      />
    </div>
    <div className="venus-steps__health-scale">
      <span>0%</span>
      <span>{copy.liquidation} · 100%</span>
    </div>
  </div>
);

/* 03 · Health: how much of the limit is used, and what the position earns and pays. */
const HealthScreen: React.FC<ScreenProps> = ({
  copy,
  play,
  settled,
  loan,
  used,
  earn,
  pay,
  values,
}) => {
  const progress = useProgress(play, settled, 1800, 300);
  const net = earn - pay;
  return (
    <div className="venus-steps__borrow">
      <div className="venus-steps__row">
        <span className="venus-steps__label">{copy.limitUsed}</span>
        <span className="venus-steps__status">
          <span aria-hidden="true" />
          {copy.safe}
        </span>
      </div>
      <strong className="venus-steps__value">{Math.round(used * 100 * progress)}%</strong>
      <HealthBar copy={copy} used={used * progress} />
      <dl className="venus-steps__ledger">
        <div>
          <dt>{copy.collateral}</dt>
          <dd>${money(COLLATERAL)}</dd>
        </div>
        <div>
          <dt>{copy.borrowed}</dt>
          <dd>
            ${money(BORROW)} <small>{loan.symbol}</small>
          </dd>
        </div>
        <div>
          <dt>
            {copy.earn} · {values.apy}
          </dt>
          <dd className="is-up">+${money(earn, 0)}</dd>
        </div>
        <div>
          <dt>
            {copy.pay} · {values.rate}
          </dt>
          <dd className="is-down">−${money(pay, 0)}</dd>
        </div>
      </dl>
      <div className="venus-steps__row venus-steps__net">
        <span>{copy.net}</span>
        <strong className={net >= 0 ? 'is-up' : 'is-down'}>
          {net >= 0 ? '+' : '−'}${money(Math.abs(net) * progress, 0)}
        </strong>
      </div>
      <p className="venus-steps__borrow-note">{copy.healthNote}</p>
    </div>
  );
};

/* Agent: the same three beats as a conversation. */
const AgentBorrow: React.FC<ScreenProps & { index: number }> = ({
  copy,
  play,
  settled,
  index,
  used,
  values,
}) => {
  const animate = play && !settled;
  const beat = useBeats(animate, [1200, 2500, 3700]);
  const shown = settled ? 3 : beat;
  return (
    <div className="venus-steps__chat">
      <AgentHead copy={copy} />
      <motion.p className="venus-steps__bubble" {...bubble(animate, 0.1)}>
        {fill(copy.agentPrompts[index], values)}
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
      {index === 1 && shown >= 1 ? (
        <TxSteps
          labels={[fill(copy.enableStep, values), fill(copy.borrowStep, values)]}
          step={settled ? 2 : Math.max(0, shown - 1)}
        />
      ) : null}
      {index === 2 && shown >= 1 ? (
        <motion.div {...bubble(animate, 0.2)}>
          <HealthBar copy={copy} used={used} />
        </motion.div>
      ) : null}
    </div>
  );
};
