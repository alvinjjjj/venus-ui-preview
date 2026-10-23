import { lazy, Suspense } from 'react';
import { useReducedMotion } from 'motion/react';
import { useIsMdDown } from 'hooks/responsive';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import {
  defaultExplorerStarTuning,
  defaultFlowSettings,
} from '../Landing/LandingMockup/motionStore';
import particleFieldSrc from '../Landing/LandingMockup/assets/particle-field.png';
import './ghost-background.css';

const FlowField = lazy(() =>
  import('../Landing/LandingMockup/FlowFieldThree').then(module => ({
    default: module.FlowFieldThree,
  })),
);

// Local ambient tuning: fewer particles and slower travel than the hero.
const flow = { ...defaultFlowSettings, lines: 20, particles: 80, speed: 0.2 };
const stars = {
  ...defaultExplorerStarTuning,
  stars: Math.round(defaultExplorerStarTuning.stars * 1.2),
  drift: defaultExplorerStarTuning.drift * 0.35,
  twinkle: defaultExplorerStarTuning.twinkle * 0.5,
};

// O and New share the approved star-only treatment; Explorer keeps its tuning.
const originalFlow = { ...flow, lines: 0, particles: 0 };
const originalStars = {
  stars: 2200,
  warmth: 0.12,
  brightness: 2.4,
  size: 0.9,
  twinkle: 0.8,
  drift: 1,
};
const lineOnlyStars = { ...originalStars, stars: 0 };

// Deterministic, line-free still sky for compact/reduced-motion rendering.
const stillStars = Array.from({ length: originalStars.stars }, (_, index) => {
  const sample = (salt: number) => {
    const value = Math.sin((index + 1) * salt) * 43758.5453;
    return value - Math.floor(value);
  };
  return {
    x: sample(12.9898) * 1440,
    y: sample(78.233) * 900,
    radius: (0.4 + sample(39.425) * 1.1) * originalStars.size,
    opacity: Math.min(1, (0.15 + sample(93.131) * 0.25) * originalStars.brightness),
    warm: sample(56.713) < originalStars.warmth,
  };
});

// E Light reuses the sky's deterministic positions at one sixth of its density.
// This static distant layer costs no animation loop and also serves compact /
// reduced-motion views; only the existing line particles need to move.
const lightDust = stillStars.filter((_, index) => index % 6 === 0);

export function GhostBackground({ shared = false, layeredLines = false }: { shared?: boolean; layeredLines?: boolean }) {
  const mode = useGlassPreview(state => state.mode);
  const original = mode !== 'explorer';
  const light = useLiquidityLightPreview();
  const lightAmbient = mode === 'lite-experiment' && light && layeredLines;
  const reducedMotion = useReducedMotion();
  const compact = useIsMdDown();
  const still = original ? (
    <svg
      className="lite-ghost__still"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {stillStars.map((star, index) => (
        <circle
          key={index}
          cx={star.x}
          cy={star.y}
          r={star.radius}
          fill={star.warm ? '#ffc28c' : '#b8d8ff'}
          opacity={star.opacity}
        />
      ))}
    </svg>
  ) : (
    <img src={particleFieldSrc} alt="" className="lite-ghost__still" />
  );

  // O/New use one persistent background in Layout, never one per page.
  if (original && !shared) return null;

  return (
    <div
      className={`lite-ghost${original ? ' lite-ghost--stars' : ''}${
        shared ? ' lite-ghost--shared' : ''
      }${lightAmbient ? ' lite-ghost--light-ambient' : ''}`}
      aria-hidden="true"
    >
      {layeredLines && !reducedMotion && !compact && (
        <div className="lite-ghost__hero-field">
          <Suspense fallback={null}>
            <FlowField key={lightAmbient ? 'e-light-lines' : 'ambient-lines'} settings={flow} starTuning={lineOnlyStars} variant="depth-pulse" interactive={false} ambientLight={lightAmbient} />
          </Suspense>
        </div>
      )}
      {lightAmbient && (
        <svg className="lite-ghost__light-dust lite-ghost__still" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {lightDust.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.radius} opacity={star.opacity} />
          ))}
        </svg>
      )}
      {!lightAmbient && (!original || reducedMotion || compact) && (
        <div className="lite-ghost__still-layer">{still}</div>
      )}
      {!lightAmbient && !reducedMotion && !compact && (
        <div className="lite-ghost__motion">
          <Suspense fallback={null}>
            <FlowField
              key={original ? 'original-stars' : 'ambient'}
              settings={original ? originalFlow : flow}
              starTuning={original ? originalStars : stars}
              variant="depth-pulse"
              interactive={false}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
