import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 38;

export const ParticleGlints: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let previousFrame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      frame = window.requestAnimationFrame(draw);
      if (!visible || (time - previousFrame < 32 && !motionPreference.matches)) return;
      previousFrame = time;
      context.clearRect(0, 0, width, height);

      const progressTime = motionPreference.matches ? 0 : time * 0.000045;
      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        const seed = ((index * 73 + 29) % 101) / 101;
        const band = ((index * 47 + 11) % 97) / 97;
        const progress = (seed + progressTime * (0.65 + band * 0.7)) % 1;
        const x = progress * width * 0.82;
        const depth = 1 - progress;
        const y = height * 0.44 + (band - 0.5) * height * 0.8 * depth * depth;
        const opacity = Math.sin(progress * Math.PI) * (0.2 + 0.65 * band);
        const radius = 0.6 + depth * 1.1;

        context.beginPath();
        context.fillStyle = `rgba(25, 145, 255, ${opacity})`;
        context.shadowColor = '#168dff';
        context.shadowBlur = radius * 7;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
    });
    visibilityObserver.observe(canvas);
    resize();
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-mockup__particles" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};
