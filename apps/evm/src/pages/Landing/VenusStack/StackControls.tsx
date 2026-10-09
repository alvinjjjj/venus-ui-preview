import { Icon } from 'components';
import { useTranslation } from 'libs/translations';
import { useId, useState } from 'react';
import type { GlassFinish, StackAngle } from './glassMaterial';
import {
  DEFAULT_STUDIO,
  STUDIO_PRESETS,
  type StackInteraction,
  type StackPan,
  type StackStudio,
} from './stackView';

interface StackControlsProps {
  finish: GlassFinish;
  onFinish: (finish: GlassFinish) => void;
  zoom: number;
  onZoom: (zoom: number) => void;
  rotation: number;
  onRotation: (rotation: number) => void;
  elevation: number;
  onElevation: (elevation: number) => void;
  angle: StackAngle;
  onAngle: (angle: StackAngle) => void;
  pan: StackPan;
  onPan: (pan: StackPan) => void;
  interaction: StackInteraction;
  onInteraction: (value: StackInteraction) => void;
  roll: number;
  onRoll: (value: number) => void;
  studio: StackStudio;
  onStudio: (value: StackStudio) => void;
}

export const StackControls = (props: StackControlsProps) => {
  const {
    finish,
    onFinish,
    zoom,
    onZoom,
    rotation,
    onRotation,
    elevation,
    onElevation,
    onAngle,
    pan,
    onPan,
    interaction,
    onInteraction,
    roll,
    onRoll,
    studio,
    onStudio,
  } = props;
  const { i18n } = useTranslation();
  const chinese = i18n.resolvedLanguage?.startsWith('zh');
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const text = chinese
    ? {
        material: '材質',
        smoke: '煙灰玻璃',
        pearl: '乳白磨砂',
        navy: '深藍玻璃',
        perspective: '參考',
        top: '俯視',
        front: '正面',
        side: '側面',
        bottom: '底部',
        rotate: '旋轉',
        move: '移動',
        zoomIn: '放大',
        zoomOut: '縮小',
        reset: '重設視角',
        center: '回到中心',
        more: '更多',
        close: '收起',
        view: '模型控制',
        rotation: '左右旋轉',
        elevation: '上下旋轉',
        roll: '傾斜',
        x: '左右位置',
        y: '上下位置',
        studio: '攝影棚',
        soft: '柔光',
        contrast: '明暗',
        bright: '通透',
        exposure: '亮度',
        shadow: '陰影',
        reflection: '地面反射',
        resetStudio: '重設光線',
        hint: '拖曳旋轉；Shift／右鍵拖曳移動。Alt＋滾輪縮放。',
        moveHint: '拖曳移動位置；「回到中心」可找回模型。',
        underside: '看底部時地面自動隱藏，讓模型保持可見。',
      }
    : {
        material: 'Material',
        smoke: 'Smoke',
        pearl: 'Pearl',
        navy: 'Deep blue',
        perspective: 'Ref',
        top: 'Top',
        front: 'Front',
        side: 'Side',
        bottom: 'Bottom',
        rotate: 'Rotate',
        move: 'Move',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        reset: 'Reset view',
        center: 'Center',
        more: 'More',
        close: 'Less',
        view: 'Model controls',
        rotation: 'Horizontal rotation',
        elevation: 'Vertical rotation',
        roll: 'Roll',
        x: 'Horizontal position',
        y: 'Vertical position',
        studio: 'Studio',
        soft: 'Soft',
        contrast: 'Contrast',
        bright: 'Airy',
        exposure: 'Brightness',
        shadow: 'Shadow',
        reflection: 'Floor reflection',
        resetStudio: 'Reset lighting',
        hint: 'Drag to rotate. Shift / right-drag to move. Alt + wheel to zoom.',
        moveHint: 'Drag to move. Center brings the model back into view.',
        underside: 'The floor hides automatically when viewing the underside.',
      };
  if (i18n.resolvedLanguage === 'zh-Hans') {
    Object.assign(text, {
      material: '材质',
      smoke: '烟灰玻璃',
      navy: '深蓝玻璃',
      top: '俯视',
      side: '侧面',
      rotate: '旋转',
      move: '移动',
      zoomOut: '缩小',
      reset: '重设视角',
      rotation: '左右旋转',
      elevation: '上下旋转',
      roll: '倾斜',
      studio: '摄影棚',
      shadow: '阴影',
      reflection: '地面反射',
      resetStudio: '重设光线',
      hint: '拖动旋转；Shift／右键拖动移动。Alt＋滚轮缩放。',
      moveHint: '拖动移动位置；「回到中心」可找回模型。',
      underside: '看底部时地面自动隐藏，让模型保持可见。',
    });
  }
  const range = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    change: (value: number) => void,
    suffix = '°',
  ) => (
    <label className="venus-stack__rotation">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => change(Number(event.target.value))}
      />
      <output>
        {suffix === '%' ? Math.round(value * 100) : value}
        {suffix}
      </output>
    </label>
  );
  return (
    <div className="venus-stack__controls" aria-label={text.view}>
      <div className="venus-stack__toolbar">
        <div className="venus-stack__control-row" role="group" aria-label={text.view}>
          {(['rotate', 'move'] as const).map(mode => (
            <button
              type="button"
              key={mode}
              aria-pressed={interaction === mode}
              onClick={() => onInteraction(mode)}
            >
              {text[mode]}
            </button>
          ))}
          <button
            type="button"
            aria-label={text.zoomOut}
            disabled={zoom <= 0.8}
            onClick={() => onZoom(Math.max(0.8, +(zoom - 0.1).toFixed(1)))}
          >
            <Icon name="innerArrows" className="size-4" />
          </button>
          <output aria-label={`${Math.round(zoom * 100)}%`}>{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            aria-label={text.zoomIn}
            disabled={zoom >= 2}
            onClick={() => onZoom(Math.min(2, +(zoom + 0.1).toFixed(1)))}
          >
            <Icon name="outerArrows" className="size-4" />
          </button>
          <button type="button" onClick={() => onPan({ x: 0, y: 0 })}>
            {text.center}
          </button>
          <button
            type="button"
            onClick={() => {
              onZoom(1);
              onAngle('perspective');
              onPan({ x: 0, y: 0 });
              onRoll(0);
            }}
          >
            {text.reset}
          </button>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? text.close : text.more}
            <Icon name="chevronDown" className="size-4" />
          </button>
        </div>
        <span className="venus-stack__drag-hint">
          {interaction === 'move' ? text.moveHint : text.hint}
        </span>
      </div>
      {expanded && (
        <div className="venus-stack__adjustments" id={panelId}>
          <div className="venus-stack__control-row" role="group" aria-label={text.material}>
            {(['smoke', 'pearl', 'navy'] as const).map(value => (
              <button
                key={value}
                type="button"
                aria-pressed={finish === value}
                onClick={() => onFinish(value)}
              >
                <span
                  className={`venus-stack__swatch venus-stack__swatch--${value}`}
                  aria-hidden="true"
                />
                {text[value]}
              </button>
            ))}
          </div>
          <div className="venus-stack__control-row" role="group" aria-label={text.view}>
            {(['perspective', 'front', 'side', 'top', 'bottom'] as const).map(value => (
              <button key={value} type="button" onClick={() => onAngle(value)}>
                {text[value]}
              </button>
            ))}
          </div>
          {range(text.rotation, rotation, 0, 360, 1, onRotation)}
          {range(text.elevation, elevation, -180, 180, 1, onElevation)}
          {range(text.roll, roll, -180, 180, 1, onRoll)}
          <div className="venus-stack__position">
            {(['x', 'y'] as const).map(axis => (
              <label key={axis}>
                <span>{text[axis]}</span>
                <input
                  type="number"
                  step="1"
                  value={Math.round(pan[axis] * 100)}
                  onChange={event => onPan({ ...pan, [axis]: Number(event.target.value) / 100 })}
                />
                <span>%</span>
              </label>
            ))}
          </div>
          <div className="venus-stack__control-row" role="group" aria-label={text.studio}>
            <span className="venus-stack__drag-hint">{text.studio}</span>
            {(['soft', 'contrast', 'bright'] as const).map(value => (
              <button
                key={value}
                type="button"
                aria-pressed={Object.keys(studio).every(
                  key =>
                    studio[key as keyof StackStudio] ===
                    STUDIO_PRESETS[value][key as keyof StackStudio],
                )}
                onClick={() => onStudio({ ...STUDIO_PRESETS[value] })}
              >
                {text[value]}
              </button>
            ))}
            <button type="button" onClick={() => onStudio({ ...DEFAULT_STUDIO })}>
              {text.resetStudio}
            </button>
          </div>
          {range(
            text.exposure,
            studio.exposure,
            0.5,
            1.5,
            0.05,
            value => onStudio({ ...studio, exposure: value }),
            '%',
          )}
          {range(
            text.shadow,
            studio.shadow,
            0,
            0.5,
            0.01,
            value => onStudio({ ...studio, shadow: value }),
            '%',
          )}
          {range(
            text.reflection,
            studio.reflection,
            0,
            0.2,
            0.01,
            value => onStudio({ ...studio, reflection: value }),
            '%',
          )}
          <span className="venus-stack__drag-hint">{text.underside}</span>
        </div>
      )}
    </div>
  );
};
