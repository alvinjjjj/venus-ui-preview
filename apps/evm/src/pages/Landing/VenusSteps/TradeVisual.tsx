import { ChainId } from '@venusprotocol/chains';
import { TokenIcon, TokenTextField } from 'components';
import { useGetTokens } from 'libs/tokens';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import type { Token } from 'types';
import { useProgress } from './BorrowVisual';
import { StepVisualDeck } from './StepVisualDeck';
import { AgentHead, bubble, fill, money, useBeats } from './SupplyVisual';
import type { TradeVisualCopy } from './tradeCopy';
import { useCoreMarkets } from './useTopHub';

/** Illustrative position: 1,000 USDC of collateral at 2x, long WBNB against USDT. */
const COLLATERAL = 1_000;
const LEVERAGE = 2;
const LEVERAGES = [1.5, 2, 3, 5];
/** Illustrative move shown on the Position card. */
const MOVE = 0.08;
export const SCREEN_MS = [4600, 5800, 6200] as const;

/** Core Pool values on 8 Oct 2026, used until /markets answers. */
const FALLBACK = {
  price: 769.65,
  longSupplyApy: 0.06,
  shortBorrowApy: 5.25,
  collateralSupplyApy: 3.55,
  longLt: 80,
  collateralLt: 82.5,
};

interface TradeModel {
  long?: Token;
  short?: Token;
  collateralToken?: Token;
  longSymbol: string;
  shortSymbol: string;
  price: number;
  size: number;
  longTokens: number;
  liq: number;
  netApy: number;
  longSupplyApy: number;
  shortBorrowApy: number;
  hf: (priceRatio: number) => number;
}

const useTradeModel = (): TradeModel => {
  const tokens = useGetTokens({ chainId: ChainId.BSC_MAINNET });
  const { data: markets } = useCoreMarkets();
  return useMemo(() => {
    const find = (symbol: string) => tokens.find(token => token.symbol === symbol);
    const long = find('WBNB');
    const short = find('USDT');
    const collateralToken = find('USDC');
    const at = (token?: Token) => token?.address.toLowerCase() ?? '';
    const price = (markets?.priceCents[at(long)] ?? FALLBACK.price * 100) / 100;
    const longSupplyApy = markets?.supplyApy[at(long)] ?? FALLBACK.longSupplyApy;
    const shortBorrowApy = markets?.borrowApy[at(short)] ?? FALLBACK.shortBorrowApy;
    const collateralSupplyApy =
      markets?.supplyApy[at(collateralToken)] ?? FALLBACK.collateralSupplyApy;
    const longLt = (markets?.liquidationThreshold[at(long)] ?? FALLBACK.longLt) / 100;
    const collateralLt =
      (markets?.liquidationThreshold[at(collateralToken)] ?? FALLBACK.collateralLt) / 100;
    // Long exposure is collateral × leverage, funded by borrowing the same value of USDT.
    const size = COLLATERAL * LEVERAGE;
    const borrowed = size;
    const hf = (ratio: number) => (COLLATERAL * collateralLt + size * ratio * longLt) / borrowed;
    // Liquidation when the health factor reaches 1.
    const liqRatio = (borrowed - COLLATERAL * collateralLt) / (size * longLt);
    const netApy =
      (size * longSupplyApy + COLLATERAL * collateralSupplyApy - borrowed * shortBorrowApy) /
      COLLATERAL;
    return {
      long,
      short,
      collateralToken,
      longSymbol: long?.symbol ?? 'WBNB',
      shortSymbol: short?.symbol ?? 'USDT',
      price,
      size,
      longTokens: size / price,
      liq: price * liqRatio,
      netApy,
      longSupplyApy,
      shortBorrowApy,
      hf,
    };
  }, [tokens, markets]);
};

type Values = Record<string, string>;

/**
 * Step 05 visual: three cards. Pair (what goes long, what goes short, the
 * live price and rates), Open (collateral, leverage, the long and short legs,
 * entry and liquidation price), Position (the price moves, PnL and the health
 * factor follow, with increase, reduce and close at hand).
 */
export const TradeVisual: React.FC<{
  copy: TradeVisualCopy;
  screen: number;
  onScreenChange: (screen: number) => void;
  requestRun: number;
}> = ({ copy, screen, onScreenChange, requestRun }) => {
  const model = useTradeModel();
  const pnl = model.size * MOVE;
  const values: Values = {
    long: model.longSymbol,
    short: model.shortSymbol,
    price: `$${money(model.price)}`,
    liq: `$${money(model.liq)}`,
    lev: `${LEVERAGE}x`,
    collateral: money(COLLATERAL, 0),
    size: `$${money(model.size, 0)}`,
    net: `${model.netApy < 0 ? '−' : ''}${Math.abs(model.netApy).toFixed(2)}%`,
    hf: model.hf(1 + MOVE).toFixed(2),
    move: `${(MOVE * 100).toFixed(0)}%`,
    pnl: `+$${money(pnl, 0)}`,
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
        const props = { copy, play, settled, model, values };
        if (agent) return <AgentTrade {...props} index={index} />;
        if (index === 0) return <PairScreen {...props} />;
        if (index === 1) return <OpenScreen {...props} />;
        return <PositionScreen {...props} />;
      }}
    />
  );
};

interface ScreenProps {
  copy: TradeVisualCopy;
  play: boolean;
  settled: boolean;
  model: TradeModel;
  values: Values;
}

/** A calm, fixed price path (illustrative), ending at `end` × the start. */
const pricePath = (points: number, end: number) =>
  Array.from({ length: points + 1 }, (_, index) => {
    const t = index / points;
    const wave = Math.sin(t * 9.4) * 0.012 + Math.sin(t * 23) * 0.005;
    return 1 + (end - 1) * t ** 1.4 + wave * (1 - t * 0.4);
  });

const PriceLine: React.FC<{
  path: number[];
  min: number;
  max: number;
  progress: number;
  marks?: { ratio: number; label: string; tone: 'entry' | 'liq' }[];
}> = ({ path, min, max, progress, marks = [] }) => {
  const w = 320;
  const h = 96;
  const y = (ratio: number) => h - ((ratio - min) / (max - min)) * h;
  const shown = path.slice(0, Math.max(2, Math.round(path.length * progress)));
  const line = shown
    .map((ratio, index) => `${index ? 'L' : 'M'}${(index / (path.length - 1)) * w} ${y(ratio)}`)
    .join(' ');
  const last = shown[shown.length - 1];
  return (
    <div className="venus-steps__trade-chart" aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {marks.map(mark => (
          <line
            key={mark.tone}
            x1="0"
            x2={w}
            y1={y(mark.ratio)}
            y2={y(mark.ratio)}
            className={`venus-steps__trade-mark is-${mark.tone}`}
          />
        ))}
        <path d={line} className="venus-steps__chart-line" />
      </svg>
      {marks.map(mark => (
        <span
          key={mark.tone}
          className={`venus-steps__trade-mark-label is-${mark.tone}`}
          style={{ top: `${(y(mark.ratio) / h) * 100}%` }}
        >
          {mark.label}
        </span>
      ))}
      <span
        className="venus-steps__chart-dot"
        style={{
          left: `${((shown.length - 1) / (path.length - 1)) * 100}%`,
          top: `${(y(last) / h) * 100}%`,
        }}
      />
    </div>
  );
};

const Leg: React.FC<{ side: 'long' | 'short'; label: string; token?: Token; symbol: string }> = ({
  side,
  label,
  token,
  symbol,
}) => (
  <span className={`venus-steps__leg is-${side}`}>
    <span className="venus-steps__leg-side">{label}</span>
    {token ? <TokenIcon token={token} /> : null}
    {symbol}
  </span>
);

/* 01 · Pair: long WBNB, short USDT; the live price and the two rates that matter. */
const PairScreen: React.FC<ScreenProps> = ({ copy, play, settled, model, values }) => {
  const progress = useProgress(play, settled, 2400, 300);
  const path = useMemo(() => pricePath(60, 1.004), []);
  return (
    <div className="venus-steps__borrow">
      <div className="venus-steps__legs">
        <Leg side="long" label={copy.long} token={model.long} symbol={model.longSymbol} />
        <Leg side="short" label={copy.short} token={model.short} symbol={model.shortSymbol} />
      </div>
      <div className="venus-steps__row">
        <span className="venus-steps__label">{fill(copy.pair, values)}</span>
        <strong className="venus-steps__trade-price">{values.price}</strong>
      </div>
      <PriceLine path={path} min={0.975} max={1.02} progress={progress} />
      <dl className="venus-steps__ledger">
        <div>
          <dt>{fill(copy.supplyApy, values)}</dt>
          <dd>{model.longSupplyApy.toFixed(2)}%</dd>
        </div>
        <div>
          <dt>{fill(copy.borrowApy, values)}</dt>
          <dd>{model.shortBorrowApy.toFixed(2)}%</dd>
        </div>
      </dl>
      <p className="venus-steps__borrow-note">{copy.pairNote}</p>
    </div>
  );
};

/* 02 · Open: collateral and leverage in; the long and short legs, entry and liquidation out. */
const OpenScreen: React.FC<ScreenProps> = ({ copy, play, settled, model, values }) => {
  const amount = useProgress(play, settled, 1100, 300);
  const legs = useProgress(play, settled, 1300, 1700);
  const pickedLeverage = useBeats(play, [1300]) >= 1;
  return (
    <div className="venus-steps__borrow">
      <div className="venus-steps__row">
        <span className="venus-steps__label">{copy.collateral}</span>
        <span className="venus-steps__levers" role="presentation">
          {LEVERAGES.map(item => (
            <span key={item} data-on={pickedLeverage && item === LEVERAGE}>
              {item}x
            </span>
          ))}
        </span>
      </div>
      {model.collateralToken ? (
        <TokenTextField
          className="venus-steps__field"
          token={model.collateralToken}
          value={String(Math.round(COLLATERAL * amount))}
          onChange={() => undefined}
          displayTokenIcon
          tokenPriceCents={100}
          readOnly
          tabIndex={-1}
        />
      ) : null}
      <dl className="venus-steps__ledger is-legs">
        <div>
          <dt>
            <Leg side="long" label={copy.long} token={model.long} symbol={model.longSymbol} />
          </dt>
          <dd>
            {(model.longTokens * legs).toFixed(3)} <small>${money(model.size * legs, 0)}</small>
          </dd>
        </div>
        <div>
          <dt>
            <Leg side="short" label={copy.short} token={model.short} symbol={model.shortSymbol} />
          </dt>
          <dd>{money(model.size * legs, 0)}</dd>
        </div>
      </dl>
      <dl className="venus-steps__trade-summary">
        <div>
          <dt>{copy.entryPrice}</dt>
          <dd>{values.price}</dd>
        </div>
        <div>
          <dt>{copy.liqPrice}</dt>
          <dd>{values.liq}</dd>
        </div>
        <div>
          {/* The carry cost of the loan; a landing page shows the cost, not a net figure. */}
          <dt>{fill(copy.borrowApy, values)}</dt>
          <dd>{model.shortBorrowApy.toFixed(2)}%</dd>
        </div>
      </dl>
      <p className="venus-steps__borrow-note">{fill(copy.openNote, values)}</p>
    </div>
  );
};

/* 03 · Position: the price moves; PnL and the health factor follow. */
const PositionScreen: React.FC<ScreenProps> = ({ copy, play, settled, model, values }) => {
  const progress = useProgress(play, settled, 3000, 300);
  const path = useMemo(() => pricePath(60, 1 + MOVE), []);
  const liqRatio = model.liq / model.price;
  const ratio = path[Math.round((path.length - 1) * progress)];
  const pnl = model.size * (ratio - 1);
  return (
    <div className="venus-steps__borrow">
      <div className="venus-steps__row">
        <span className="venus-steps__vh-name">
          {model.long ? <TokenIcon token={model.long} size="lg" /> : null}
          {fill(copy.position, values)}
        </span>
        <span className="venus-steps__status">
          <span aria-hidden="true" />
          {copy.healthy}
        </span>
      </div>
      <div className="venus-steps__row venus-steps__rank-head">
        <div>
          <span className="venus-steps__label">{copy.pnl}</span>
          <strong className={`venus-steps__value ${pnl >= 0 ? 'is-up' : 'is-down'}`}>
            {pnl >= 0 ? '+' : '−'}${money(Math.abs(pnl))}
          </strong>
        </div>
        <div className="venus-steps__rank-days">
          <span className="venus-steps__label">{copy.healthFactor}</span>
          <strong>{model.hf(ratio).toFixed(2)}</strong>
        </div>
      </div>
      <PriceLine
        path={path}
        min={liqRatio - 0.04}
        max={1 + MOVE + 0.03}
        progress={progress}
        marks={[
          { ratio: 1, label: `${copy.entry} ${values.price}`, tone: 'entry' },
          { ratio: liqRatio, label: `${copy.liquidation} ${values.liq}`, tone: 'liq' },
        ]}
      />
      <div className="venus-steps__pills">
        <span className="venus-steps__pill">{copy.increase}</span>
        <span className="venus-steps__pill">{copy.reduce}</span>
        <span className="venus-steps__pill">{copy.close}</span>
      </div>
    </div>
  );
};

/* Agent: the same three beats as a conversation. */
const AgentTrade: React.FC<ScreenProps & { index: number }> = ({
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
    </div>
  );
};
