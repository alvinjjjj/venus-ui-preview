import { Icon } from 'components';
import { Link } from 'containers/Link';
import { useTranslation } from 'libs/translations';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type CSSProperties, useCallback, useMemo, useRef, useState } from 'react';
import { AllocateVisual, durations as allocateDurations } from './AllocateVisual';
import { BorrowVisual, SCREEN_MS as borrowDurations } from './BorrowVisual';
import { EarnVisual, SCREEN_MS as earnDurations } from './EarnVisual';
import { SupplyVisual, SCREEN_MS as supplyDurations } from './SupplyVisual';
import { TradeVisual, SCREEN_MS as tradeDurations } from './TradeVisual';
import { venusStepsCopyByLanguage } from './copy';
import './styles.css';
import { useStepScroll } from './useStepScroll';
import { VisualModeContext } from './visualMode';

const ease = [0.22, 1, 0.36, 1] as const;
/** How long each card of each step stays in front; drives the progress line under the current point. */
const stepDurations: Record<string, readonly number[]> = {
  supply: supplyDurations,
  allocate: allocateDurations,
  borrow: borrowDurations,
  earn: earnDurations,
  trade: tradeDurations,
};
/** Title words rise in one after another; the accent finishes with a light sweep (CSS). */
const wordVariants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

/**
 * Explorer Section 3: how Venus works in five steps. Three levels, as in the
 * agreed structure: the step list (left), the step's detail (middle) and a UI
 * visual that acts it out (right). Same side margins as the Hero
 * (`max(5.75vw, 24px)`, full width), so the edges line up section to section.
 */
export const VenusSteps: React.FC = () => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const copy = venusStepsCopyByLanguage[language] ?? venusStepsCopyByLanguage.en;
  const [active, setActive] = useState(0);
  const [screen, setScreen] = useState(0);
  const [requestRun, setRequestRun] = useState(0);
  const [allocatePreview, setAllocatePreview] = useState(0);
  const [agent, setAgent] = useState(false);
  const [playing, setPlaying] = useState(false);
  const mode = useMemo(() => ({ agent, onPlayingChange: setPlaying }), [agent]);
  const reduceMotion = useReducedMotion() ?? false;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = copy.steps[active];
  // Steps whose points drive the cards of their visual.
  const durations = stepDurations[step.id];
  const hasVisual = !!durations;

  const changeStep = useCallback((index: number) => {
    setActive(index);
    setScreen(0);
    setAllocatePreview(0);
  }, []);
  const { trackRef, seek } = useStepScroll(copy.steps.length, changeStep);

  const focusTab = (index: number) => {
    const next = (index + copy.steps.length) % copy.steps.length;
    seek(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      ref={trackRef}
      className="venus-steps-track"
      data-step={step.id}
      style={{ '--vs3-step-count': copy.steps.length } as CSSProperties}
    >
      {copy.steps.map((item, index) => (
        <div
          key={item.id}
          className="venus-steps__scroll-stop"
          aria-hidden="true"
          style={{ '--vs3-step-index': index } as CSSProperties}
        />
      ))}
      <section className="venus-steps" aria-labelledby="venus-steps-title">
        <div className="venus-steps__inner">
          <header className="venus-steps__header">
            {/* One mode for the whole section: every step's visual follows it. */}
            <div
              className="venus-steps__mode venus-steps__mode--header"
              role="tablist"
              aria-label={`${copy.supply.human} / ${copy.supply.agent}`}
            >
              {[false, true].map(isAgent => (
                <button
                  key={String(isAgent)}
                  type="button"
                  role="tab"
                  aria-selected={agent === isAgent}
                  className="venus-steps__mode-btn"
                  onClick={() => setAgent(isAgent)}
                >
                  <Icon name={isAgent ? 'star' : 'person'} className="venus-steps__mode-icon" />
                  {isAgent ? copy.supply.agent : copy.supply.human}
                </button>
              ))}
            </div>
            <motion.h2
              id="venus-steps-title"
              initial={reduceMotion ? false : 'hidden'}
              whileInView="shown"
              viewport={{ once: true, amount: 0.6 }}
              transition={{ staggerChildren: 0.08 }}
            >
              {`${copy.titleLead} ${copy.titleAccent}`.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  className="venus-steps__word"
                  variants={wordVariants}
                  transition={{ duration: 0.6, ease }}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </motion.h2>
          </header>

          <div className="venus-steps__grid">
            <div className="venus-steps__nav-col">
              <div
                className="venus-steps__nav"
                role="tablist"
                aria-orientation="vertical"
                aria-label={copy.eyebrow}
              >
                {copy.steps.map((item, index) => (
                  <button
                    key={item.id}
                    ref={element => {
                      tabRefs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    id={`venus-steps-tab-${item.id}`}
                    aria-selected={active === index}
                    aria-controls="venus-steps-panel"
                    tabIndex={active === index ? 0 : -1}
                    className="venus-steps__tab"
                    onClick={() => seek(index)}
                    onKeyDown={event => {
                      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                        event.preventDefault();
                        focusTab(index + 1);
                      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                        event.preventDefault();
                        focusTab(index - 1);
                      }
                    }}
                  >
                    <span className="venus-steps__num">{String(index + 1).padStart(2, '0')}</span>
                    <span className="venus-steps__tab-label">{item.nav}</span>
                  </button>
                ))}
              </div>
              <div className="venus-steps__dots" aria-hidden="true" />
            </div>

            <div
              id="venus-steps-panel"
              role="tabpanel"
              aria-labelledby={`venus-steps-tab-${step.id}`}
              className="venus-steps__copy"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
                >
                  {/* Blue rule: the active step's title is the one blue line in the section. */}
                  <h3 className="venus-steps__accent">{step.title}</h3>
                  <p className="venus-steps__body">{step.body}</p>
                  <ul className="venus-steps__points">
                    {step.points.map((point, index) => (
                      <li key={point} data-current={screen === index} data-interactive={hasVisual}>
                        {hasVisual ? (
                          <button
                            type="button"
                            aria-current={screen === index ? 'step' : undefined}
                            onClick={() => {
                              setScreen(index);
                              setRequestRun(current => current + 1);
                            }}
                          >
                            {point}
                          </button>
                        ) : (
                          point
                        )}
                        {hasVisual && screen === index ? (
                          <span className="venus-steps__point-progress" aria-hidden="true">
                            <span
                              key={`${step.id}-${screen}-${requestRun}-${agent}-${playing}`}
                              style={{
                                animationDuration: `${durations[index] ?? 0}ms`,
                                animationPlayState: playing ? 'running' : 'paused',
                              }}
                            />
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <div className="venus-steps__actions">
                    {/* One primary action per step; the rest are text links. In Agent
                        mode the primary action is setting up Agent skills. */}
                    {agent ? (
                      <Link to={copy.agentCta.to} className="venus-steps__cta">
                        {copy.agentCta.label}
                        <Icon name="arrowRight" className="venus-steps__cta-icon" />
                      </Link>
                    ) : null}
                    {step.id === 'allocate' ? (
                      <button
                        type="button"
                        className={agent ? 'venus-steps__cta-link' : 'venus-steps__cta'}
                        aria-controls="venus-steps-allocation-preview"
                        onClick={() => {
                          setScreen(1);
                          setAllocatePreview(current => current + 1);
                        }}
                      >
                        {step.cta.label}
                        <Icon name="arrowRight" className="venus-steps__cta-icon" />
                      </button>
                    ) : (
                      <Link
                        to={step.cta.to}
                        className={agent ? 'venus-steps__cta-link' : 'venus-steps__cta'}
                      >
                        {step.cta.label}
                        <Icon name="arrowRight" className="venus-steps__cta-icon" />
                      </Link>
                    )}
                    {step.secondaryCta && (
                      <Link to={step.secondaryCta.to} className="venus-steps__cta-link">
                        {step.secondaryCta.label}
                        <Icon name="arrowRight" className="venus-steps__cta-icon" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <VisualModeContext.Provider value={mode}>
              <div className="venus-steps__visual">
                {step.id === 'supply' ? (
                  <SupplyVisual
                    copy={copy.supply}
                    playback={copy.allocate}
                    screen={screen}
                    onScreenChange={setScreen}
                    requestRun={requestRun}
                  />
                ) : step.id === 'allocate' ? (
                  <div id="venus-steps-allocation-preview">
                    <AllocateVisual
                      key={allocatePreview}
                      copy={copy.allocate}
                      screen={screen}
                      onScreenChange={setScreen}
                      requestRun={requestRun}
                      exploreSpoke={allocatePreview > 0}
                    />
                  </div>
                ) : step.id === 'borrow' ? (
                  <BorrowVisual
                    copy={copy.borrow}
                    screen={screen}
                    onScreenChange={setScreen}
                    requestRun={requestRun}
                  />
                ) : step.id === 'earn' ? (
                  <EarnVisual
                    copy={copy.earn}
                    screen={screen}
                    onScreenChange={setScreen}
                    requestRun={requestRun}
                  />
                ) : step.id === 'trade' ? (
                  <TradeVisual
                    copy={copy.trade}
                    screen={screen}
                    onScreenChange={setScreen}
                    requestRun={requestRun}
                  />
                ) : (
                  <div className="venus-steps__placeholder">
                    <span className="venus-steps__num">{String(active + 1).padStart(2, '0')}</span>
                    <span>{step.nav}</span>
                    <small>{copy.comingSoon}</small>
                  </div>
                )}
              </div>
            </VisualModeContext.Provider>
          </div>
        </div>
      </section>
    </div>
  );
};
