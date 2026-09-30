import { useLandingMotion } from 'pages/Landing/LandingMockup/motionStore';

const flowControls = [
  { key: 'lines', label: 'Lines', min: 16, max: 144, step: 8 },
  { key: 'particles', label: 'Particles', min: 0, max: 400, step: 10 },
  { key: 'speed', label: 'Speed', min: 0, max: 2, step: 0.1 },
] as const;

const starControls = [
  { key: 'stars', label: 'Stars', min: 100, max: 1100, step: 10 },
  { key: 'crossStars', label: 'Cross stars', min: 0, max: 8, step: 1 },
  { key: 'warmth', label: 'Warm accents', min: 0, max: 0.12, step: 0.01 },
  { key: 'brightness', label: 'Brightness', min: 0.2, max: 1.6, step: 0.1 },
  { key: 'size', label: 'Size', min: 0.5, max: 1.8, step: 0.1 },
  { key: 'twinkle', label: 'Twinkle', min: 0, max: 0.8, step: 0.02 },
  { key: 'drift', label: 'Movement', min: 0, max: 2, step: 0.1 },
] as const;

export const MotionControls: React.FC<{ explorer: boolean }> = ({ explorer }) => {
  const flow = useLandingMotion(state => state.flow);
  const stars = useLandingMotion(state => state.stars);
  const setFlow = useLandingMotion(state => state.setFlow);
  const setStars = useLandingMotion(state => state.setStars);
  const reset = useLandingMotion(state => state.reset);

  return (
    <div className="preview-motion-panel" id="preview-motion-panel">
      <p className="preview-motion-caption">Converging lines</p>
      {flowControls.map(control => (
        <label className="preview-motion-slider" key={control.key}>
          <span>
            {control.label}
            <output>
              {control.key === 'speed' ? `${flow.speed.toFixed(1)}×` : flow[control.key]}
            </output>
          </span>
          <input
            type="range"
            aria-label={control.label}
            min={control.min}
            max={control.max}
            step={control.step}
            value={flow[control.key]}
            onChange={event => setFlow({ ...flow, [control.key]: Number(event.target.value) })}
          />
        </label>
      ))}
      {explorer && (
        <>
          <p className="preview-motion-caption preview-motion-caption--stars">Explorer starfield</p>
          {starControls.map(control => (
            <label className="preview-motion-slider" key={control.key}>
              <span>
                {control.label}
                <output>
                  {control.key === 'stars' || control.key === 'crossStars'
                    ? stars[control.key]
                    : control.key === 'twinkle' || control.key === 'warmth'
                      ? `${Math.round(stars[control.key] * 100)}%`
                      : `${stars[control.key].toFixed(1)}×`}
                </output>
              </span>
              <input
                type="range"
                aria-label={control.label}
                min={control.min}
                max={control.max}
                step={control.step}
                value={stars[control.key]}
                onChange={event =>
                  setStars({ ...stars, [control.key]: Number(event.target.value) })
                }
              />
            </label>
          ))}
        </>
      )}
      <button className="preview-motion-reset" type="button" onClick={reset}>
        Reset motion
      </button>
    </div>
  );
};
