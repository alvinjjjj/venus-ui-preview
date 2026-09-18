import { Button } from 'components';
import './study.css';

export function ButtonMotionStudy() {
  return (
    <>
      {[
        {
          id: 'blue-v2',
          title: 'V2 / Line trace study',
          description:
            'Hover or focus to trace the button edge with light. Press to try its feedback.',
          label: 'Try Line Trace',
        },
        {
          id: 'v3',
          title: 'V3 / Glass sweep study',
          description:
            'Hover to sweep light across the blue glass surface. Move away and hover again to replay.',
          label: 'Try Glass Sweep',
        },
      ].map(study => (
        <section
          key={study.id}
          data-motion-study={study.id}
          className="space-y-4"
          aria-label={study.title}
        >
          <div className="space-y-2">
            <h2 className="text-p1s">{study.title}</h2>
            <p className="text-b1r text-light-grey">{study.description}</p>
          </div>
          <div className="liquid-glass-study__stage">
            <Button material="blue-glass">{study.label} ↗</Button>
          </div>
        </section>
      ))}
    </>
  );
}
