import { cn } from '@venusprotocol/ui';

import type { SubMenu } from '../../types';
import { SubMenuItem, type SubMenuItemProps } from './SubMenuItem';

export interface SubMenuContentProps extends Omit<SubMenu, 'items'> {
  items: SubMenuItemProps[];
}

// Product menus (secondary: Earn, Borrow) stack their items in one column, matching the live app.
export const SubMenuContent: React.FC<SubMenuContentProps> = ({ variant = 'primary', items }) => (
  <div
    className={cn(
      'venus-submenu-content rounded-lg',
      variant === 'primary' ? 'min-w-83' : 'p-2 bg-background-active sm:w-79',
    )}
  >
    <div className={cn(variant === 'primary' ? 'space-y-3' : 'space-y-1')}>
      {items.map(subItem => (
        <SubMenuItem {...subItem} variant={variant} key={subItem.label} />
      ))}
    </div>
  </div>
);
