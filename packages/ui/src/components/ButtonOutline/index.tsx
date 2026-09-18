import { useEffect, useRef, useState } from 'react';

/** Decorative outline; stays hidden unless the host application enables it. */
export const ButtonOutline = () => {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const { width, height } = size;
  const cut = Math.min(12, height / 2);
  const points = `${cut},1 ${width - 1},1 ${width - 1},${height - cut} ${width - cut},${
    height - 1
  } 1,${height - 1} 1,${cut}`;
  return (
    <svg ref={ref} className="button-bevel-outline hidden" aria-hidden="true" focusable="false">
      <polygon points={points} />
      <polygon className="button-bevel-trace" points={points} pathLength="100" />
      <rect
        className="button-rounded-trace"
        x="1"
        y="1"
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        rx="7"
        pathLength="100"
      />
    </svg>
  );
};
