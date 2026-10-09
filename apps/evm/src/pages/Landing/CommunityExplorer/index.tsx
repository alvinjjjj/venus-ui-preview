import { useQuery } from '@tanstack/react-query';
import { Card, Icon } from 'components';
import { VENUS_TELEGRAM_URL } from 'constants/production';
import { useTranslation } from 'libs/translations';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { restService } from 'utilities';
import venusMarkWhite from '../LandingMockup/assets/venus-mark-white.svg';
import { usePrimeSnapshot } from '../VenusSteps/usePrime';
import { useHubAssets } from '../VenusSteps/useTopHub';
import { contracts } from './contracts';
import { type CommunityCopy, communityCopyByLanguage } from './copy';
import './styles.css';

const ease = [0.22, 1, 0.36, 1] as const;
const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));

/** One review cycle per contract: scan, found, reported, rewarded, then the next window. */
const BEATS = [2200, 3300, 4400, 6600] as const;
const LINE = 20;
const depth = [
  { x: 0, y: 0, scale: 1, opacity: 1, blur: 0 },
  { x: 28, y: -22, scale: 0.94, opacity: 0.5, blur: 1.5 },
  { x: 54, y: -42, scale: 0.88, opacity: 0.25, blur: 3 },
] as const;
const GLYPHS = '{}[]();=<>/_*#&$%!?01';

/** Elapsed beats of the current cycle; loops while `play`. */
const useCycle = (play: boolean) => {
  const [cycle, setCycle] = useState(0);
  const [beat, setBeat] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: cycle restarts the schedule
  useEffect(() => {
    if (!play) return;
    setBeat(0);
    const timers = BEATS.map((ms, index) =>
      window.setTimeout(() => {
        if (index === BEATS.length - 1) setCycle(current => current + 1);
        else setBeat(index + 1);
      }, ms),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [play, cycle]);
  return { cycle, beat };
};

/** Briefly scrambles code characters while `active`, settling back from left to right. */
const useScramble = (active: boolean) => {
  const [tick, setTick] = useState(-1);
  useEffect(() => {
    if (!active) return;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setTick(step);
      if (step > 12) {
        window.clearInterval(timer);
        setTick(-1);
      }
    }, 45);
    return () => window.clearInterval(timer);
  }, [active]);
  return (text: string, row: number) =>
    tick < 0
      ? text
      : text
          .split('')
          .map((char, index) =>
            char === ' ' || index < tick * 5 - row * 2
              ? char
              : GLYPHS[(index * 7 + row * 3 + tick) % GLYPHS.length],
          )
          .join('');
};

const BountyCard: React.FC<{ copy: CommunityCopy; play: boolean }> = ({ copy, play }) => {
  const { cycle, beat } = useCycle(play);
  const [hover, setHover] = useState(0);
  const scramble = useScramble(hover > 0);
  const front = cycle % contracts.length;
  const contract = contracts[front];
  const labels = [copy.found, copy.reported, copy.rewarded];
  const terminal = [
    fill(copy.terminal.review, { file: contract.file }),
    fill(copy.terminal.finding, { line: contract.flag + 1 }),
    copy.terminal.report,
    copy.terminal.reward,
  ];
  return (
    <Card asChild>
      <article
        className="venus-community__card venus-community__bounty"
        onMouseEnter={() => setHover(current => current + 1)}
      >
        <header>
          <h3>{copy.bountyTitle}</h3>
          <p>{copy.bountyBody}</p>
        </header>

        <div className="venus-community__stage" aria-hidden="true">
          {/* the flowing light behind the code */}
          <span className="venus-community__beam" />
          <div className="venus-community__windows">
            {contracts.map((item, index) => {
              const d = (index - front + contracts.length) % contracts.length;
              const look = depth[d];
              const isFront = d === 0;
              return (
                <motion.div
                  key={item.file}
                  className="venus-community__window"
                  style={{ zIndex: 10 - d }}
                  initial={false}
                  animate={{
                    x: look.x,
                    y: look.y,
                    scale: look.scale,
                    opacity: look.opacity,
                    filter: `blur(${look.blur}px)`,
                  }}
                  transition={{ duration: 0.9, ease }}
                >
                  <div className="venus-community__window-bar">
                    <i />
                    <i />
                    <i />
                    <span>{item.file}</span>
                  </div>
                  <div className="venus-community__code">
                    {item.lines.map((line, row) => (
                      <div
                        key={row}
                        className="venus-community__line"
                        data-flag={isFront && row === item.flag && beat >= 1}
                      >
                        <span className="venus-community__ln">{row + 1}</span>
                        <code>{isFront ? scramble(line, row) : line}</code>
                      </div>
                    ))}
                    {isFront && play && beat === 0 ? (
                      <span
                        key={cycle}
                        className="venus-community__scan"
                        style={{ '--scan-to': `${item.flag * LINE}px` } as React.CSSProperties}
                      />
                    ) : null}
                    {isFront && beat >= 1 ? (
                      <motion.span
                        key={`${cycle}-tag`}
                        className="venus-community__tag"
                        data-step={beat}
                        style={{ top: item.flag * LINE + 12 }}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease }}
                      >
                        {labels[Math.min(beat, 3) - 1]}
                      </motion.span>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="venus-community__terminal">
            {terminal.map((line, index) =>
              index <= beat ? (
                <motion.div
                  key={`${cycle}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  data-done={index === 3}
                >
                  <span>{index === 0 ? '$' : index === 3 ? '✓' : '›'}</span>
                  {line}
                </motion.div>
              ) : null,
            )}
          </div>
        </div>
      </article>
    </Card>
  );
};

interface Vip {
  id: number;
  /** Governor Bravo state: 0 pending, 1 active, 2 canceled, 3 defeated, 4 succeeded, 5 queued, 6 expired, 7 executed */
  state: number;
  title: string;
  forVotes: number;
  againstVotes: number;
  endsAt: number;
}

type Tone = 'executed' | 'closed' | 'live';
const toneOf = (state: number): Tone =>
  state === 7
    ? 'executed'
    : state === 0 || state === 1 || state === 4 || state === 5
      ? 'live'
      : 'closed';

const parseTitle = (description: string) => {
  let title = '';
  try {
    title = JSON.parse(description).title ?? '';
  } catch {
    title = description.split('\n')[0];
  }
  // "VIP-665 [BNB Chain] Prime Rewards…" → "Prime Rewards…"
  return title.replace(/^VIP-\d+\s*(\[[^\]]*\]\s*)?/, '');
};

/** Every proposal since the first, oldest first, from the live governance API (two pages of 500). */
const useProposalHistory = () =>
  useQuery({
    queryKey: ['landing-community-proposal-history'],
    queryFn: async () => {
      const pages = await Promise.all(
        [0, 1].map(page =>
          restService<{
            total?: number;
            result?: {
              proposalId: string;
              description: string;
              state: string | number;
              forVotesMantissa: string;
              againstVotesMantissa: string;
              endTimestamp: string;
            }[];
          }>({
            baseUrl: 'https://api.venus.io',
            endpoint: '/governance/proposals',
            method: 'GET',
            params: { limit: 500, page },
          }),
        ),
      );
      const rows = pages.flatMap(response =>
        response.data && 'result' in response.data ? response.data.result ?? [] : [],
      );
      if (!rows.length) throw new Error('no proposals');
      return rows
        .map<Vip>(row => ({
          id: Number(row.proposalId),
          state: Number(row.state),
          title: parseTitle(row.description),
          forVotes: Number(row.forVotesMantissa) / 1e18,
          againstVotes: Number(row.againstVotesMantissa) / 1e18,
          endsAt: Number(row.endTimestamp) * 1000,
        }))
        .sort((a, b) => a.id - b.id);
    },
    staleTime: 300_000,
    retry: 1,
  });

/** Counts on 8 Oct 2026, shown while the API loads or if it fails. */
const FALLBACK_TOTAL = 666;
const FALLBACK_EXECUTED = 628;

const compact = (value: number) =>
  value >= 1e6
    ? `${(value / 1e6).toFixed(2)}M`
    : value >= 1e3
      ? `${(value / 1e3).toFixed(1)}K`
      : `${Math.round(value)}`;

const timeLeft = (endsAt: number) => {
  const ms = Math.max(0, endsAt - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
};

/** 0 → 1 on an ease-in-out curve once `start` is true. */
const useEased = (start: boolean, duration: number, delay = 0) => {
  const reduceMotion = useReducedMotion() ?? false;
  const [value, setValue] = useState(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!start || reduceMotion) return;
    let frame = 0;
    const begin = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - begin) / duration));
      setValue(t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, duration, delay, reduceMotion]);
  return value;
};

/** How long the tiles take to fill, in ms; the counter runs on the same clock. */
const FILL_MS = 2400;

/**
 * Governance as a record: one tile per proposal since 2021, filled in order and
 * coloured by outcome, with the live vote (if any) pinned underneath.
 */
const GovernanceCard: React.FC<{ copy: CommunityCopy; start: boolean }> = ({ copy, start }) => {
  const { data } = useProposalHistory();
  const vips = data ?? [];
  const total = vips.length || FALLBACK_TOTAL;
  const executed = vips.length ? vips.filter(vip => vip.state === 7).length : FALLBACK_EXECUTED;
  const count = useEased(start, FILL_MS, 200);
  const [hovered, setHovered] = useState<Vip | undefined>();
  const live = [...vips].reverse().find(vip => vip.state === 1) ?? vips[vips.length - 1];
  const liveTotal = live ? live.forVotes + live.againstVotes || 1 : 1;
  const tiles = vips.length ? vips : Array.from({ length: FALLBACK_TOTAL }, () => undefined);

  return (
    <Card asChild>
      <article className="venus-community__card venus-community__gov">
        <header>
          <h3>{copy.govTitle}</h3>
          <p>{copy.govBody}</p>
        </header>

        <div className="venus-community__count">
          <strong>{Math.round(total * count)}</strong>
          <span>
            {copy.proposals}
            <small>{fill(copy.executedCount, { n: executed })}</small>
          </span>
        </div>

        <div
          className="venus-community__tiles"
          data-on={start}
          style={{ '--fill-ms': `${FILL_MS}ms`, '--n': tiles.length } as React.CSSProperties}
          onMouseLeave={() => setHovered(undefined)}
        >
          {tiles.map((vip, index) => (
            <span
              key={index}
              className="venus-community__tile"
              data-tone={vip ? toneOf(vip.state) : 'executed'}
              data-active={vip?.state === 1 || undefined}
              style={{ '--i': index } as React.CSSProperties}
              onMouseEnter={vip ? () => setHovered(vip) : undefined}
            />
          ))}
        </div>

        <div className="venus-community__tiles-foot">
          {hovered ? (
            <span className="venus-community__tile-info">
              <b>VIP-{hovered.id}</b> {hovered.title}
            </span>
          ) : (
            <>
              <span>{copy.since}</span>
              <span className="venus-community__legend">
                <i data-tone="executed" />
                {copy.executed}
                <i data-tone="closed" />
                {copy.closed}
                <i data-tone="live" />
                {copy.voting}
              </span>
            </>
          )}
        </div>

        {live ? (
          <div className="venus-community__live">
            <div className="venus-community__proposal-head">
              <span className="venus-community__vip">VIP-{live.id}</span>
              <span
                className="venus-community__state"
                data-stage={
                  live.state === 1
                    ? 'voting'
                    : toneOf(live.state) === 'executed'
                      ? 'executed'
                      : 'closed'
                }
              >
                {live.state === 1
                  ? `${copy.voting} · ${fill(copy.left, { time: timeLeft(live.endsAt) })}`
                  : toneOf(live.state) === 'executed'
                    ? copy.executed
                    : copy.closed}
              </span>
            </div>
            <p className="venus-community__proposal-title">{live.title}</p>
            <div className="venus-community__vote-row">
              <span>
                {copy.forLabel} {compact(live.forVotes)} XVS
              </span>
              <span>
                {copy.againstLabel} {compact(live.againstVotes)} XVS
              </span>
            </div>
            <span className="venus-community__bar is-split">
              <span style={{ width: `${(live.forVotes / liveTotal) * 100 * count}%` }} />
            </span>
          </div>
        ) : null}
      </article>
    </Card>
  );
};

/** The system Telegram icon's outline (components/Icon/icons/telegram). */
const TELEGRAM_PATH =
  'M46.137,6.552c-0.75-0.636-1.928-0.727-3.146-0.238l-0.002,0C41.708,6.828,6.728,21.832,5.304,22.445 c-0.259,0.09-2.521,0.934-2.288,2.814c0.208,1.695,2.026,2.397,2.248,2.478l8.893,3.045c0.59,1.964,2.765,9.21,3.246,10.758 c0.3,0.965,0.789,2.233,1.646,2.494c0.752,0.29,1.5,0.025,1.984-0.355l5.437-5.043l8.777,6.845l0.209,0.125 c0.596,0.264,1.167,0.396,1.712,0.396c0.421,0,0.825-0.079,1.211-0.237c1.315-0.54,1.841-1.793,1.896-1.935l6.556-34.077 C47.231,7.933,46.675,7.007,46.137,6.552z M22,32l-3,8l-3-10l23-17L22,32z';

/** Messages rotate through the channel preview, newest at the bottom. */
const MESSAGE_MS = 3200;

/**
 * Closing banner: the same card, edge light and blue beam as the bounty card,
 * with a Telegram channel preview whose posts are written from live data
 * (the open vote, the Prime cycle, the Hub rate). The button is a placeholder
 * until the official link is confirmed.
 */
const JoinBanner: React.FC<{ copy: CommunityCopy; play: boolean }> = ({ copy, play }) => {
  const { data } = useProposalHistory();
  const prime = usePrimeSnapshot();
  const { assets } = useHubAssets();
  const vote = [...(data ?? [])].reverse().find(vip => vip.state === 1);
  const days = Math.max(0, Math.ceil((prime.endsAt.getTime() - Date.now()) / 86_400_000));
  const messages = [
    vote
      ? fill(copy.msgVote, { id: vote.id, title: vote.title, time: timeLeft(vote.endsAt) })
      : undefined,
    fill(copy.msgPrime, { cycle: prime.cycleIndex, days, seats: prime.seats }),
    assets[0]
      ? fill(copy.msgHub, { sym: assets[0].symbol, apy: `${assets[0].apy.toFixed(2)}%` })
      : undefined,
  ].filter((message): message is string => !!message);

  const [shown, setShown] = useState(1);
  useEffect(() => {
    if (!play) return;
    const timer = window.setInterval(() => setShown(current => current + 1), MESSAGE_MS);
    return () => window.clearInterval(timer);
  }, [play]);
  // the last three posts of an endless feed
  const feed = Array.from({ length: Math.min(shown, 3) }, (_, index) => {
    const n = shown - Math.min(shown, 3) + index;
    return { n, text: messages[n % messages.length] };
  });

  return (
    <Card asChild>
      <article className="venus-community__card venus-community__join">
        {/* The Telegram mark, oversized and drawn only as a dashed outline; it lifts on hover. */}
        <svg className="venus-community__plane" viewBox="0 0 50 50" aria-hidden="true">
          <path d={TELEGRAM_PATH} />
        </svg>
        <div className="venus-community__join-copy">
          <h3>{copy.joinTitle}</h3>
          <p>{copy.joinBody}</p>
          {/* VENUS_TELEGRAM_URL is the link the app footer already uses. */}
          <a
            href={VENUS_TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="venus-community__join-cta"
          >
            <Icon name="telegram" className="venus-community__join-icon" />
            {copy.joinCta}
          </a>
        </div>
        <div className="venus-community__chat" aria-hidden="true">
          <div className="venus-community__window-bar">
            <i />
            <i />
            <i />
            <span>Telegram · {copy.channel}</span>
          </div>
          <div className="venus-community__feed">
            {feed.map(item => (
              <motion.div
                key={item.n}
                layout
                className="venus-community__post"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
              >
                <span className="venus-community__post-avatar">
                  <img src={venusMarkWhite} alt="" />
                </span>
                <span className="venus-community__post-body">
                  <b>
                    {copy.channel}
                    <small>{copy.now}</small>
                  </b>
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </article>
    </Card>
  );
};

/**
 * Explorer Section 5: the community side of safety. A bounty card where a scan
 * runs over Venus's contracts and turns a finding into a reward, and a
 * governance card with the live proposal count and the latest vote.
 */
export const CommunityExplorer: React.FC = () => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const copy = communityCopyByLanguage[language] ?? communityCopyByLanguage.en;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const seen = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <section ref={ref} className="venus-community" aria-label={copy.bountyTitle}>
      <div className="venus-community__inner">
        <BountyCard copy={copy} play={inView && !reduceMotion} />
        <GovernanceCard copy={copy} start={seen} />
        <JoinBanner copy={copy} play={inView && !reduceMotion} />
      </div>
    </section>
  );
};
