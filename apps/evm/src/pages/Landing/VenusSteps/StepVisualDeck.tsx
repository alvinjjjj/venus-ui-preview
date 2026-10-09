import { cn } from '@venusprotocol/ui';
import venusLogo from 'assets/img/venusLogo.svg';
import { Card } from 'components';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { VisualModeContext } from './visualMode';

const ease = [0.22, 1, 0.36, 1] as const;
const depthStyles = [
  { x: '0%', y: '0%', scale: 1, opacity: 1, blur: 0 },
  { x: '13%', y: '-13%', scale: 0.93, opacity: 0.55, blur: 1.5 },
  { x: '25%', y: '-25%', scale: 0.86, opacity: 0.3, blur: 3 },
  { x: '35%', y: '-35%', scale: 0.8, opacity: 0.16, blur: 4.5 },
] as const;

export interface VisualDeckCopy {
  human: string;
  agent: string;
  hub: string;
  /** One label per card; the deck takes three or four. */
  screens: readonly string[];
  pause: string;
  resume: string;
  replay: string;
}

/** Shared stacked-card visual shell (three or four cards), using Supply's accepted depth treatment. */
export const StepVisualDeck: React.FC<{
  copy: VisualDeckCopy;
  durations: readonly number[];
  screen: number;
  onScreenChange: (screen: number) => void;
  requestRun: number;
  showHub?: boolean;
  variant?: 'supply' | 'allocate' | 'borrow';
  initialPaused?: boolean;
  renderScreen: (
    screen: number,
    play: boolean,
    agent: boolean,
    settled: boolean,
    paused: boolean,
  ) => ReactNode;
}> = ({
  copy,
  durations,
  screen,
  onScreenChange,
  requestRun,
  showHub = false,
  variant = 'allocate',
  initialPaused = false,
  renderScreen,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const reduceMotion = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(!document.hidden);
  const [paused, setPaused] = useState(initialPaused);
  const { agent, onPlayingChange } = useContext(VisualModeContext);
  const [run, setRun] = useState(0);
  const playing = inView && visible && !paused && !reduceMotion;
  const count = copy.screens.length;

  // A mode switch in the section header restarts the current card.
  const firstMode = useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: agent is the trigger
  useEffect(() => {
    if (firstMode.current) {
      firstMode.current = false;
      return;
    }
    setRun(current => current + 1);
  }, [agent]);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run restarts playback after a replay or a mode change
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => onScreenChange((screen + 1) % count), durations[screen]);
    return () => window.clearTimeout(timer);
  }, [playing, screen, run, requestRun, durations, onScreenChange, count]);

  const jump = (index: number) => {
    onScreenChange(index);
    setRun(current => current + 1);
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        'venus-steps__supply',
        variant === 'allocate' && 'venus-steps__allocation-deck',
        variant === 'borrow' && 'venus-steps__borrow-deck',
      )}
    >
      <div className="venus-steps__visual-bar">
        {showHub && (
          <span className="venus-steps__hub-chip">
            <img src={venusLogo} alt="" />
            {copy.hub}
          </span>
        )}
      </div>
      <div className="venus-steps__stage venus-steps__deck">
        <button
          type="button"
          className="venus-steps__play-toggle"
          aria-label={paused ? copy.resume : copy.pause}
          title={paused ? copy.resume : copy.pause}
          aria-pressed={paused}
          onClick={() => setPaused(current => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {paused ? (
              <path d="M9 5.5 19 12 9 18.5Z" />
            ) : (
              <>
                <path d="M8 6V18" />
                <path d="M16 6V18" />
              </>
            )}
          </svg>
        </button>
        <div className="venus-steps__deck-frame">
          {copy.screens.map((label, index) => {
            const depth = (index - screen + count) % count;
            const look = depthStyles[depth];
            const front = depth === 0;
            return (
              <Card key={label} asChild>
                <motion.div
                  className={cn('venus-steps__deck-card', front && 'is-front')}
                  style={{ zIndex: 10 - depth * 2, transformOrigin: '0% 100%' }}
                  initial={false}
                  animate={{
                    x: look.x,
                    y: look.y,
                    scale: look.scale,
                    opacity: look.opacity,
                    filter: `blur(${look.blur}px)`,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease }}
                  role={front ? undefined : 'button'}
                  tabIndex={front ? undefined : 0}
                  aria-label={front ? undefined : label}
                  onClick={front ? undefined : () => jump(index)}
                  onKeyDown={
                    front
                      ? undefined
                      : event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            jump(index);
                          }
                        }
                  }
                >
                  <div className="venus-steps__card-head">
                    <span className="venus-steps__card-num">0{index + 1}</span>
                    {label}
                  </div>
                  <div className="venus-steps__card-body" inert={!front}>
                    <div
                      key={`${front ? 'front' : 'back'}-${run}-${requestRun}-${agent}`}
                      className={cn(
                        'venus-steps__card-content',
                        variant !== 'supply' && 'venus-steps__allocation-content',
                        variant === 'supply' && index === count - 1 && 'is-hold',
                      )}
                    >
                      {renderScreen(index, front && playing, agent, !front || reduceMotion, paused)}
                    </div>
                  </div>
                </motion.div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
