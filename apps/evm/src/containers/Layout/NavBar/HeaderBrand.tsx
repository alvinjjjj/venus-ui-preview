import { useTranslation } from 'libs/translations';
import venusSymbolSrc from './assets/venus-symbol.svg';
import venusWordmarkSrc from './assets/venus-wordmark.svg';

/** Header / 1:21034: keep the exported Figma assets at their intrinsic sizes. */
export const HeaderBrand = ({ mode }: { mode: 'lite' | 'pro' }) => {
  const { t } = useTranslation();

  return (
    <span className="venus-header-brand">
      <span className="venus-header-brand-mark">
        <img
          className="venus-header-brand-symbol"
          src={venusSymbolSrc}
          alt={t('layout.menu.venusLogoAlt')}
        />
        <img
          className="venus-header-brand-wordmark"
          src={venusWordmarkSrc}
          alt=""
          aria-hidden="true"
        />
      </span>
      <span className="venus-interface-mode-label">{mode === 'lite' ? 'Lite' : 'Pro'}</span>
    </span>
  );
};
