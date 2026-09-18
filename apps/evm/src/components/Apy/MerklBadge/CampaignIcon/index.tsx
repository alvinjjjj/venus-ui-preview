import { cn } from '@venusprotocol/ui';
import { useTranslation } from 'libs/translations';
import campaignLogoSrc from './campaignLogo.svg';
import campaignLogoV5Src from './campaignLogoV5.svg';
import './campaign-icon.css';

export type CampaignIconProps = Omit<React.HTMLAttributes<HTMLImageElement>, 'alt' | 'src'>;

export const CampaignIcon: React.FC<CampaignIconProps> = ({ className, ...otherProps }) => {
  const { t } = useTranslation();

  return (
    <>
    <img
      {...otherProps}
      src={campaignLogoSrc}
      alt={t('apy.merklBadge.logoAlt')}
      className={cn('venus-campaign-icon venus-campaign-icon-original h-4', className)}
    />
    <img {...otherProps} src={campaignLogoV5Src} alt={t('apy.merklBadge.logoAlt')} className={cn('venus-campaign-icon venus-campaign-icon-v5 h-4', className)} />
    </>
  );
};
