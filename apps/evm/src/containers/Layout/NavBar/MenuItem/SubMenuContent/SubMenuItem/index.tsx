import { ButtonWrapper, cn } from '@venusprotocol/ui';

import { Icon } from 'components';
import LiquidityHubIcon from 'assets/img/liquidityHubIcon.svg?react';
import VaultsIcon from 'assets/img/vaultsIcon.svg?react';
import { routes } from 'constants/routing';
import './governance-motion.css';
import { Link } from 'containers/Link';
import { useTranslation } from 'libs/translations';
import { matchPath, useLocation } from 'react-router';
import { Tag } from '../../../Tag';
import type { MenuItem, SubMenu } from '../../../types';

export interface SubMenuItemProps extends MenuItem {
  variant?: SubMenu['variant'];
  onClick?: () => void;
}

export const SubMenuItem: React.FC<SubMenuItemProps> = ({
  to,
  href,
  label,
  description,
  imgSrc,
  iconName,
  tagLabel,
  onClick,
  variant,
}) => {
  const { t } = useTranslation();

  const { pathname } = useLocation();

  const isActive = to && !!matchPath(to, pathname);

  const linkNavProps = to ? { to } : { href };

  return (
    <Link
      data-submenu-variant={variant}
      data-governance-preview={to === routes.governance.path || undefined}
      data-earn-motion={to === routes.liquidityHubs.path ? 'hub' : to === routes.vaults.path ? 'vault' : undefined}
      data-menu-motion={
        to === routes.vai.path ? 'vai' :
        to === routes.bridge.path ? 'bridge' :
        to === routes.stats.path ? 'stats' :
        to === routes.trade.path ? 'trade' : undefined
      }
      {...linkNavProps}
      onClick={onClick}
      className={cn(
        'block py-3 space-y-6 rounded-lg group transition-colors hover:no-underline',
        variant === 'secondary' ? 'px-6' : 'px-4 bg-background-active hover:bg-background-hover',
        isActive && variant === 'primary' && 'bg-background-hover',
      )}
    >
      <div className="flex gap-x-3">
        {(iconName || imgSrc) && (
          <div
            className={cn(
              'venus-submenu-icon rounded-lg size-12 shrink-0 flex items-center justify-center',
              !!iconName && 'bg-dark-blue',
            )}
          >
            {iconName ? (
              <Icon
                name={iconName}
                className={cn(
                  'text-light-grey size-6 transition-colors group-hover:text-white',
                  isActive && 'text-white',
                )}
              />
            ) : to === routes.liquidityHubs.path ? (
              <LiquidityHubIcon role="img" aria-label={label} className="size-12 venus-earn-icon" />
            ) : to === routes.vaults.path ? (
              <VaultsIcon role="img" aria-label={label} className="size-12 venus-earn-icon" />
            ) : (
              <img src={imgSrc} alt={label} className="size-12" />
            )}
          </div>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-x-2">
            <p
              className={cn(
                'font-semibold',
                iconName
                  ? 'text-light-grey transition-colors group-hover:text-white'
                  : 'text-white',
                isActive && 'text-white',
              )}
            >
              {label}
            </p>

            {!!tagLabel && <Tag>{tagLabel}</Tag>}
          </div>

          {!!description && <p className="text-light-grey text-xs">{description}</p>}
        </div>
      </div>

      {variant === 'secondary' && (
        <ButtonWrapper
          asChild
          variant="secondary"
          material="glass"
          size="xs"
          className="px-3 text-sm font-medium [&>span]:font-medium"
          type={undefined}
        >
          <span>{t('layout.menu.subMenuItem.button.label')}</span>
        </ButtonWrapper>
      )}
    </Link>
  );
};
