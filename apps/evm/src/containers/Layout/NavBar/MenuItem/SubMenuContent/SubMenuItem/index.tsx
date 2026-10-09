import { cn } from '@venusprotocol/ui';

import { Icon } from 'components';
import LiquidityHubIcon from 'assets/img/liquidityHubIcon.svg?react';
import VaultsIcon from 'assets/img/vaultsIcon.svg?react';
import { CoreMenuIcon } from './CoreMenuIcon';
import { SpokeMenuIcon } from './SpokeMenuIcon';
import { routes } from 'constants/routing';
import './governance-motion.css';
import { Link } from 'containers/Link';
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
  const { pathname } = useLocation();

  const isActive = to && !!matchPath(to, pathname);

  const linkNavProps = to ? { to } : { href };

  return (
    <Link
      data-submenu-variant={variant}
      data-governance-preview={to === routes.governance.path || undefined}
      data-earn-motion={
        to === routes.liquidityHubs.path
          ? 'hub'
          : to === routes.vaults.path
            ? 'vault'
            : to === routes.spoke.path
              ? 'spoke'
              : to?.startsWith('/markets')
                ? 'core'
                : undefined
      }
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
        // Product menus: no "Get started" button; the whole row lights up on hover instead.
        variant === 'secondary'
          ? 'px-3 hover:bg-background-hover focus-visible:bg-background-hover'
          : 'px-4 bg-background-active hover:bg-background-hover',
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
            ) : to === routes.spoke.path ? (
              <SpokeMenuIcon role="img" aria-label={label} className="size-12 venus-earn-icon" />
            ) : to?.startsWith('/markets') ? (
              <CoreMenuIcon role="img" aria-label={label} className="size-12 venus-earn-icon" />
            ) : (
              <img src={imgSrc} alt={label} className="size-12" />
            )}
          </div>
        )}

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={cn(
                'font-semibold whitespace-nowrap',
                iconName
                  ? 'text-light-grey transition-colors group-hover:text-white'
                  : 'text-white',
                isActive && 'text-white',
              )}
            >
              {label}
            </p>

            {!!tagLabel && <Tag className="whitespace-nowrap">{tagLabel}</Tag>}
          </div>

          {!!description && <p className="text-light-grey text-xs">{description}</p>}
        </div>
      </div>

    </Link>
  );
};
