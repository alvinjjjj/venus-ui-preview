import type { CSSProperties } from 'react';
import { useTranslation } from 'libs/translations';
import starsIconSrc from './stars.svg';
import './reward-motion.css';

export function RewardStars() {
  const { t } = useTranslation();
  return (
    <span className="venus-apy-boost-stars" role="img" aria-label={t('apy.boost.iconAlt')}
      style={{ '--reward-star-image': `url("${starsIconSrc}")` } as CSSProperties}>
      <span aria-hidden="true" className="venus-reward-star venus-reward-star-large" />
      <span aria-hidden="true" className="venus-reward-star venus-reward-star-medium" />
      <span aria-hidden="true" className="venus-reward-star venus-reward-star-small" />
    </span>
  );
}
