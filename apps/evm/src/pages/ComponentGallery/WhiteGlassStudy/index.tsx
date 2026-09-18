import { WhiteGlassButton } from 'components/WhiteGlassButton';
import { useState } from 'react';
import './study.css';

export const WhiteGlassStudy = () => {
  const [count, setCount] = useState(0);
  return (
    <section className="white-glass-study space-y-4" aria-label="White button states">
      <h2 className="text-p1s">V4 / White button states</h2>
      <div className="rounded-xl bg-white p-6 text-black space-y-4">
        <p className="text-sm">
          Default: clean white → Hover: subtle highlight → Active: fine grain and immediate press
          feedback
        </p>
        <WhiteGlassButton onClick={() => setCount(value => value + 1)}>
          Press to try
        </WhiteGlassButton>
        <p className="text-sm">
          Press and hold to try the active state. Release to return to white.
        </p>
      </div>
      <p role="status" className="text-sm text-light-grey">
        Clicks: {count}
      </p>
    </section>
  );
};
