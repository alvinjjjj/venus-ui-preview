import { lazy, Suspense, useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import { useIsMdDown } from 'hooks/responsive';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { isLiteExperimentMode } from 'demo/GlassVersions/variants';
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
// E2 borrows the layered star renderer, with a cooler, quieter horizon palette.
const e2Stars = { ...originalStars, warmth: 0.02, brightness: 1.8, twinkle: 0.3, drift: 0.45 };
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

// E3 Light: project deterministic stars into a curved galactic dust lane.
// Reuse the same seed field, with a sparse foreground and two depth layers.
const lightGalaxy = stillStars.slice(0, 1600).map((star, index) => {
  const t = star.x / 1440;
  const spread = (star.y / 900 - 0.5) * (65 + 110 * Math.sin(t * Math.PI) ** 2);
  return {
    ...star,
    x: star.x,
    y: 740 - 580 * t + 95 * Math.sin(t * Math.PI * 2) + spread,
    radius: index % 37 === 0 ? star.radius * 1.5 : star.radius * 0.65,
  };
});

export function GhostBackground({
  shared = false,
  layeredLines = false,
  starDensity = 1,
}: {
  shared?: boolean;
  layeredLines?: boolean;
  starDensity?: number;
}) {
  const mode = useGlassPreview(state => state.mode);
  const original = mode !== 'explorer';
  const isE2 = mode === 'lite-experiment-v2' || mode === 'lite-experiment-v2-legacy';
  const isE3 = mode === 'lite-experiment-v3';
  const light = useLiquidityLightPreview();
  const lightAmbient = isLiteExperimentMode(mode) && light && (layeredLines || isE3);
  const reducedMotion = useReducedMotion();
  const compact = useIsMdDown();
  const density = Math.max(0, Math.min(1, starDensity));
  const visibleStars = useMemo(
    () => stillStars.filter((_, index) =>
      Math.floor((index + 1) * density) > Math.floor(index * density)),
    [density],
  );
  const baseTuning = isE2 ? e2Stars : original ? originalStars : stars;
  const starTuning = useMemo(
    () => density === 1
      ? baseTuning
      : { ...baseTuning, stars: Math.round(baseTuning.stars * density) },
    [baseTuning, density],
  );
  const still = original ? (
    <svg
      className="lite-ghost__still"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {visibleStars.map((star, index) => (
        <circle
          key={index}
          cx={star.x}
          cy={star.y}
          r={star.radius}
          fill={!isE2 && star.warm ? '#ffc28c' : '#b8d8ff'}
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
      }${lightAmbient ? ' lite-ghost--light-ambient' : ''}${isE3 ? ' lite-ghost--e3' : ''}${isE2 ? ' lite-ghost--e2-horizon' : ''}`}
      aria-hidden="true"
      data-star-density={density}
    >
      {layeredLines && !isE3 && (!isE2 || lightAmbient) && !reducedMotion && !compact && (
        <div className="lite-ghost__hero-field">
          <Suspense fallback={null}>
            <FlowField key={lightAmbient ? 'e-light-lines' : 'ambient-lines'} settings={flow} starTuning={lineOnlyStars} variant="depth-pulse" interactive={false} ambientLight={lightAmbient} />
          </Suspense>
        </div>
      )}
      {isE3 && lightAmbient && (
        <svg className="lite-ghost__light-galaxy" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g className="lite-ghost__galaxy-drift">
            <path className="lite-ghost__galaxy-haze" d="M -100 770 C 280 950 450 430 720 450 S 1100 30 1540 120" fill="none" />
            {lightGalaxy.map((star, index) => (
              <circle key={index} cx={star.x} cy={star.y} r={star.radius} opacity={star.opacity * (index % 37 === 0 ? 0.9 : 0.55)} />
            ))}
          </g>
        </svg>
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
              starTuning={starTuning}
              variant="depth-pulse"
              interactive={false}
            />
          </Suspense>
        </div>
      )}
      {isE3 && !lightAmbient && (
        <svg className="lite-ghost__near-stars" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {stillStars.filter((star, index) => index % 91 === 0 && (star.x < 340 || star.x > 1100)).map((star, index) => (
            <g key={index}>
              <circle cx={star.x} cy={star.y} r={star.radius * 7} fill="url(#e3-star-halo)" />
              <circle cx={star.x} cy={star.y} r={star.radius} fill="#e4f1ff" opacity="0.85" />
            </g>
          ))}
          <defs>
            <radialGradient id="e3-star-halo">
              <stop stopColor="#b8d8ff" stopOpacity="0.45" />
              <stop offset="0.3" stopColor="#8bbcff" stopOpacity="0.12" />
              <stop offset="1" stopColor="#8bbcff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      )}
      {isE3 && !reducedMotion && (
        <div className="lite-ghost__meteors">
          <span className="lite-ghost__meteor" />
          <span className="lite-ghost__meteor" />
          <span className="lite-ghost__meteor" />
        </div>
      )}
    </div>
  );
}
