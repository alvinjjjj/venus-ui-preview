import { type ReactNode, useState } from 'react';

export const EarnDetails = ({
  yieldContent,
  position,
  risk,
  health,
}: {
  yieldContent: ReactNode;
  position: ReactNode;
  risk: ReactNode;
  health?: ReactNode | ((active: string) => ReactNode);
}) => {
  const [active, setActive] = useState('Yield');
  return (
    <aside className="lite-supply-details" aria-label="Market information">
      <div className="lite-supply-detail-tabs" aria-label="Information categories">
        {['Yield', 'Position', 'Risk'].map(label => (
          <button
            type="button"
            key={label}
            aria-pressed={active === label}
            onClick={() => setActive(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="lite-supply-detail-content">
        {active === 'Yield' ? yieldContent : active === 'Position' ? position : risk}
      </div>
      {health && (
        <div className="lite-supply-health">
          {typeof health === 'function' ? health(active) : health}
        </div>
      )}
    </aside>
  );
};
