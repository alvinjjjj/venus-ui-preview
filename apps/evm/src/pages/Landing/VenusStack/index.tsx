import { useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

import { Icon } from 'components';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { useTranslation } from 'libs/translations';
import { ParticleCanvas } from './ParticleCanvas';
import { StackCanvas } from './StackCanvas';
import { StackControls } from './StackControls';
import type { GlassFinish, StackAngle } from './glassMaterial';
import { PX_PER_LAYER, SPOKE_SLOTS, STACK_LAYERS } from './stackData';
import {
  DEFAULT_STUDIO,
  type StackInteraction,
  type StackPan,
  type StackStudio,
} from './stackView';
import './styles.css';
import { useStackCopy } from './useStackCopy';

const getScrollParent = (element: HTMLElement | null): HTMLElement | Window => {
  let node = element?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
};

export const VenusStack: React.FC<{ variant?: 'acrylic' | 'particles' }> = ({
  variant = 'acrylic',
}) => {
  const [active, setActive] = useState(-1);
  const [finish, setFinish] = useState<GlassFinish>('smoke');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [elevation, setElevation] = useState(40);
  const [pan, setPan] = useState<StackPan>({ x: 0, y: 0 });
  const [interaction, setInteraction] = useState<StackInteraction>('rotate');
  const [roll, setRoll] = useState(0);
  const [studio, setStudio] = useState<StackStudio>(DEFAULT_STUDIO);
  const [angle, setAngle] = useState<StackAngle>('perspective');
  const light = useLiquidityLightPreview();
  const reduceMotion = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const copy = useStackCopy();
  const names = STACK_LAYERS.map(layer => copy[layer.id].name);

  // Chips follow the scroll; clicking one scrolls to that layer's slot.
  const goTo = (index: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const clamped = Math.max(0, Math.min(STACK_LAYERS.length - 1, index));
    const parent = getScrollParent(wrapper);
    const isWindow = parent instanceof Window;
    const parentTop = isWindow ? 0 : parent.getBoundingClientRect().top;
    const scrollTop = isWindow ? window.scrollY : parent.scrollTop;
    // wrapper position in the scroller's own coordinates; the stage pins at the scroller's top
    const wrapperStart = wrapper.getBoundingClientRect().top - parentTop + scrollTop;
    const top =
      wrapperStart +
      clamped * PX_PER_LAYER +
      PX_PER_LAYER * (clamped === STACK_LAYERS.length - 1 ? 0.95 : 0.55);
    parent.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      ref={wrapperRef}
      className={`venus-stack ${variant === 'particles' ? 'venus-particles' : 'venus-glass-stack'}`}
      aria-label={t('landing.venusStack.a11y.section')}
      style={{ height: `calc(${PX_PER_LAYER * STACK_LAYERS.length}px + 100svh - 64px)` }}
    >
      <div ref={pinRef} className="venus-stack__pin">
        {variant === 'particles' ? (
          <ParticleCanvas
            wrapperRef={wrapperRef}
            pinRef={pinRef}
            barRef={barRef}
            names={names}
            reduceMotion={reduceMotion}
            onActive={setActive}
          />
        ) : (
          <StackCanvas
            wrapperRef={wrapperRef}
            pinRef={pinRef}
            barRef={barRef}
            pan={pan}
            onPan={setPan}
            interaction={interaction}
            roll={roll}
            studio={studio}
            onZoom={setZoom}
            finish={finish}
            light={light}
            zoom={zoom}
            rotation={rotation}
            onRotation={setRotation}
            elevation={elevation}
            onElevation={setElevation}
            angle={angle}
            slots={SPOKE_SLOTS}
            names={names}
            reduceMotion={reduceMotion}
            onActive={setActive}
          />
        )}

        <div className="venus-stack__rail">
          {STACK_LAYERS.map((layer, index) => (
            <div
              key={layer.id}
              className={`venus-stack__chip${active === index ? ' is-open' : ''}`}
            >
              <button
                className="venus-stack__chip-btn"
                type="button"
                aria-expanded={active === index}
                onClick={() => goTo(index)}
              >
                <span className="venus-stack__chip-name">{copy[layer.id].name}</span>
                <span className="venus-stack__chip-plus" aria-hidden="true">
                  <Icon name="close" className="size-[11px] text-white" />
                </span>
              </button>
              <div className="venus-stack__chip-body">
                <div>
                  <div className="venus-stack__chip-inner">
                    <p>{copy[layer.id].body}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {variant === 'acrylic' && (
          <StackControls
            pan={pan}
            onPan={setPan}
            interaction={interaction}
            onInteraction={setInteraction}
            roll={roll}
            onRoll={setRoll}
            studio={studio}
            onStudio={setStudio}
            finish={finish}
            onFinish={setFinish}
            zoom={zoom}
            rotation={rotation}
            onRotation={setRotation}
            elevation={elevation}
            onElevation={setElevation}
            onZoom={setZoom}
            angle={angle}
            onAngle={value => {
              setAngle(value);
              setPan({ x: 0, y: 0 });
              setRoll(0);
              setRotation(value === 'front' ? 315 : value === 'side' ? 45 : 0);
              setElevation(
                value === 'top'
                  ? 89
                  : value === 'bottom'
                    ? -89
                    : value === 'front' || value === 'side'
                      ? 10
                      : 40,
              );
            }}
          />
        )}
        <div className="venus-stack__under">
          <button
            className="venus-stack__nav"
            type="button"
            aria-label={t('landing.venusStack.a11y.previous')}
            onClick={() => goTo(active - 1)}
          >
            <Icon name="chevronLeft" className="size-4 text-white" />
          </button>
          <button
            className="venus-stack__nav"
            type="button"
            aria-label={t('landing.venusStack.a11y.next')}
            onClick={() => goTo(active + 1)}
          >
            <Icon name="chevronRight" className="size-4 text-white" />
          </button>
          <div className="venus-stack__track">
            <div ref={barRef} className="venus-stack__bar" />
          </div>
        </div>
      </div>
    </section>
  );
};
