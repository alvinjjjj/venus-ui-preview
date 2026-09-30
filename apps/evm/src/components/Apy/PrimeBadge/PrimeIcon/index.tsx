import { cn } from '@venusprotocol/ui';
import { useTranslation } from 'libs/translations';
import primeLogoSrc from './primeLogo.svg';
import primeLogoDarkSrc from './primeLogoDark.svg';
import primeLogoLightSrc from './primeLogoLight.svg';
import PrimeTokenIcon from './primeLogoDark.svg?react';
import './prime-icon.css';

export type PrimeIconProps = Omit<React.HTMLAttributes<HTMLImageElement>, 'alt' | 'src'>;

export const PrimeIcon: React.FC<PrimeIconProps> = ({ className, ...otherProps }) => {
  const { t } = useTranslation();

  return (
    <>
    <PrimeTokenIcon className={cn('venus-prime-token-icon', className)} role="img" aria-label={t('apy.primeBadge.logoAlt')} />
    <img
      {...otherProps}
      src={primeLogoSrc}
      alt={t('apy.primeBadge.logoAlt')}
      className={cn('venus-prime-icon-original h-4', className)}
    />
    <img {...otherProps} src={primeLogoDarkSrc} alt={t('apy.primeBadge.logoAlt')} className={cn('venus-prime-icon-dark', className)} />
    <img {...otherProps} src={primeLogoLightSrc} alt={t('apy.primeBadge.logoAlt')} className={cn('venus-prime-icon-light', className)} />
    </>
  );
};
