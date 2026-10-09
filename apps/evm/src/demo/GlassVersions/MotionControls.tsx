import { useTranslation } from 'libs/translations';
import { defaultOrbitSettings, useLandingMotion } from 'pages/Landing/LandingMockup/motionStore';
import { getFlowTiming } from 'pages/Landing/LandingMockup/motionTimeline';

const flowControls = [
  { key: 'lines', en: 'Lines', zh: '線條數量', min: 16, max: 144, step: 8 },
  { key: 'particles', en: 'Particles', zh: '流動粒子', min: 0, max: 400, step: 10 },
  { key: 'speed', en: 'Speed', zh: '流動速度', min: 0, max: 2, step: 0.1 },
] as const;
const starControls = [
  { key: 'stars', en: 'Stars', zh: '星塵數量', min: 100, max: 1100, step: 1 },
  { key: 'warmth', en: 'Warm accents', zh: '暖色比例', min: 0, max: 0.12, step: 0.01 },
  { key: 'brightness', en: 'Brightness', zh: '星塵亮度', min: 0.2, max: 1.6, step: 0.1 },
  { key: 'size', en: 'Size', zh: '星塵大小', min: 0.5, max: 1.8, step: 0.1 },
  { key: 'twinkle', en: 'Twinkle', zh: '閃爍比例', min: 0, max: 0.8, step: 0.02 },
  { key: 'drift', en: 'Movement', zh: '星塵移動', min: 0, max: 2, step: 0.1 },
] as const;
const orbitControls = [
  { key: 'rotation', en: 'Rotation', zh: '星環旋轉角度', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'tilt', en: 'Tilt', zh: '星環傾斜角度', min: 15, max: 90, step: 1, unit: '°' },
  { key: 'size', en: 'Galaxy zoom', zh: '整組星系放大', min: 0.4, max: 2, step: 0.05, unit: '×' },
  {
    key: 'ringScale',
    en: 'Orbit spread',
    zh: '星環範圍',
    min: 0.75,
    max: 1.8,
    step: 0.05,
    unit: '×',
  },
  { key: 'rings', en: 'Rings', zh: '星環數量', min: 1, max: 10, step: 1, unit: '' },
  { key: 'particles', en: 'Ring particles', zh: '星環粒子', min: 0, max: 800, step: 10, unit: '' },
  {
    key: 'particleSize',
    en: 'Particle size',
    zh: '粒子大小',
    min: 0.5,
    max: 2,
    step: 0.1,
    unit: '×',
  },
  { key: 'speed', en: 'Orbit speed', zh: '環繞速度', min: 0, max: 2, step: 0.1, unit: '×' },
  {
    key: 'spinSpeed',
    en: 'Self rotation',
    zh: '球體自轉速度',
    min: 0,
    max: 2,
    step: 0.1,
    unit: '×',
  },
  {
    key: 'brightness',
    en: 'Ring brightness',
    zh: '星環亮度',
    min: 0.2,
    max: 2,
    step: 0.1,
    unit: '×',
  },
  {
    key: 'contraction',
    en: 'Contraction time',
    zh: '收縮時間',
    min: 0.5,
    max: 2,
    step: 0.1,
    unit: '×',
  },
  { key: 'hold', en: 'Charge hold', zh: '蓄能停留', min: 0.5, max: 2, step: 0.1, unit: '×' },
  { key: 'burst', en: 'Burst strength', zh: '爆發力度', min: 1, max: 1.4, step: 0.05, unit: '×' },
  {
    key: 'travel',
    en: 'Scroll distance',
    zh: '轉場捲動距離',
    min: 0.8,
    max: 3,
    step: 0.1,
    unit: '×',
  },
] as const;

export const MotionControls: React.FC = () => {
  const { i18n } = useTranslation();
  const chinese = (i18n.resolvedLanguage ?? i18n.language).startsWith('zh');
  const label = (en: string, zh: string) => (chinese ? zh : en);
  const frame = useLandingMotion(state => state.previewFrame);
  const setFrame = useLandingMotion(state => state.setPreviewFrame);
  const { flow, stars, orbit, setFlow, setStars, setOrbit, reset, resetOrbit } = useLandingMotion();
  const seek = (progress: number) =>
    window.dispatchEvent(new CustomEvent('flow-preview-seek', { detail: { progress } }));

  return (
    <div className="preview-motion-panel" id="preview-motion-panel">
      <div
        className="preview-frame-tabs"
        role="group"
        aria-label={label('Frame controls', '畫面控制')}
      >
        {([1, 2] as const).map(value => (
          <button
            key={value}
            type="button"
            aria-pressed={frame === value}
            onClick={() => {
              setFrame(value);
              seek(value === 1 ? 0 : 100);
            }}
          >
            {label(`Frame ${value}`, `畫面 ${value}`)}
          </button>
        ))}
      </div>
      <div className="preview-motion-fields" key={frame}>
        {frame === 1 ? (
          <>
            <p className="preview-motion-caption">{label('Converging lines', '匯聚線條')}</p>
            {flowControls.map(control => (
              <label className="preview-motion-slider" key={control.key}>
                <span>
                  {label(control.en, control.zh)}
                  <output>
                    {control.key === 'speed' ? `${flow.speed.toFixed(1)}×` : flow[control.key]}
                  </output>
                </span>
                <input
                  type="range"
                  aria-label={label(control.en, control.zh)}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={flow[control.key]}
                  onChange={event =>
                    setFlow({ ...flow, [control.key]: Number(event.target.value) })
                  }
                />
              </label>
            ))}
            <p className="preview-motion-caption preview-motion-caption--stars">
              {label('Background stardust', '背景星塵')}
            </p>
            {starControls.map(control => (
              <label className="preview-motion-slider" key={control.key}>
                <span>
                  {label(control.en, control.zh)}
                  <output>
                    {control.key === 'stars'
                      ? stars[control.key]
                      : control.key === 'twinkle' || control.key === 'warmth'
                        ? `${Math.round(stars[control.key] * 100)}%`
                        : `${stars[control.key].toFixed(1)}×`}
                  </output>
                </span>
                <input
                  type="range"
                  aria-label={label(control.en, control.zh)}
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
        ) : (
          <>
            <p className="preview-motion-caption">
              {label('Spheres + rings · linked controls', '球體 + 星環・連動控制')}
            </p>
            <div
              className="preview-frame-tabs"
              role="group"
              aria-label={label('Sphere texture', '星球材質')}
            >
              {(
                [
                  { key: 'satin', en: 'Satin', zh: '柔光' },
                  { key: 'frost', en: 'Frost', zh: '微霧' },
                  { key: 'polished', en: 'Polished', zh: '亮面' },
                ] as const
              ).map(texture => (
                <button
                  key={texture.key}
                  type="button"
                  aria-pressed={(orbit.texture ?? 'frost') === texture.key}
                  onClick={() => setOrbit({ ...orbit, texture: texture.key })}
                >
                  {label(texture.en, texture.zh)}
                </button>
              ))}
            </div>
            <div
              className="preview-frame-tabs"
              role="group"
              aria-label={label('Orbit views', '星系視角')}
            >
              <button type="button" onClick={() => seek(getFlowTiming(orbit).expanded * 100)}>
                {label('Face-on rings', '正面圓環')}
              </button>
              <button type="button" onClick={() => seek(100)}>
                {label('Galaxy view', '銀河視角')}
              </button>
            </div>
            {orbitControls.map(control => (
              <label className="preview-motion-slider" key={control.key}>
                <span>
                  {label(control.en, control.zh)}
                  <output>
                    {Number((orbit[control.key] ?? defaultOrbitSettings[control.key]).toFixed(2))}
                    {control.unit}
                  </output>
                </span>
                <input
                  type="range"
                  aria-label={label(control.en, control.zh)}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={orbit[control.key] ?? defaultOrbitSettings[control.key]}
                  onChange={event =>
                    setOrbit({ ...orbit, [control.key]: Number(event.target.value) })
                  }
                />
              </label>
            ))}
            <label className="preview-content-toggle">
              <input
                type="checkbox"
                checked={orbit.showContent}
                onChange={event => setOrbit({ ...orbit, showContent: event.target.checked })}
              />
              {label('Show spheres and text', '顯示漸變球同文字')}
            </label>
          </>
        )}
      </div>
      <div className="preview-frame-actions">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('flow-preview-seek', { detail: { replay: true } }))
          }
        >
          {label('Replay transition', '重播轉場')}
        </button>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('flow-preview-seek', { detail: { pause: true } }))
          }
        >
          {label('Pause transition', '暫停轉場')}
        </button>
      </div>
      <button
        className="preview-motion-reset"
        type="button"
        onClick={frame === 1 ? reset : resetOrbit}
      >
        {label(`Reset Frame ${frame}`, `重設畫面 ${frame}`)}
      </button>
    </div>
  );
};
