import { useState } from 'react';
import './liquid-glass-study.css';

/** Isolated material study: optical values stay local until the design is approved. */
export function LiquidGlassStudy() {
  const [pressed, setPressed] = useState(false);

  return (
    <section className="liquid-glass-study space-y-4" aria-label="V4 Liquid Glass study">
      <div className="space-y-2">
        <h2 className="text-p1s">V4 / Liquid Glass study</h2>
        <p className="text-b1r text-light-grey">
          Move the pointer to explore the soft light, then press and release. Tap on mobile.
        </p>
      </div>
      <div className="liquid-glass-study__stage">
        <button
          type="button"
          className="liquid-glass-study__button"
          data-pressed={pressed}
          onPointerMove={event => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--glass-x', `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty('--glass-y', `${event.clientY - rect.top}px`);
          }}
          onPointerDown={event => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--glass-x', `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty('--glass-y', `${event.clientY - rect.top}px`);
            event.currentTarget.setPointerCapture(event.pointerId);
            setPressed(true);
          }}
          onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onLostPointerCapture={() => setPressed(false)}
          onBlur={() => setPressed(false)}
        >
          <span>Try Liquid Glass</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}
