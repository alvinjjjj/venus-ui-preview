import { useEffect, useState } from 'react';
import './ascii-sky.css';

/** E2-only ambient illustration; never intercepts market or planet controls. */
export function AsciiSky() {
  const [paused, setPaused] = useState(document.hidden);
  useEffect(() => {
    const update = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return <div className="lite-ascii-sky" data-paused={paused} aria-hidden="true">
    <span className="lite-ascii-comet lite-ascii-comet--left">· · : ─ ─ ✦</span>
    <span className="lite-ascii-comet lite-ascii-comet--right">· · : ─ ─ +</span>
    <span className="lite-ascii-sky-star lite-ascii-sky-star--one">+</span>
    <span className="lite-ascii-sky-star lite-ascii-sky-star--two">*</span>
    <span className="lite-ascii-sky-star lite-ascii-sky-star--three">+</span>
  </div>;
}
