import { cn } from '@venusprotocol/ui';

import type { SubMenu } from '../../types';
import { SubMenuItem, type SubMenuItemProps } from './SubMenuItem';

export interface SubMenuContentProps extends Omit<SubMenu, 'items'> {
  items: SubMenuItemProps[];
  inline?: boolean;
}

// Reuse the same product rows in desktop dropdowns and responsive navigation cards.
export const SubMenuContent: React.FC<SubMenuContentProps> = ({ variant = 'primary', items, inline = false }) => {
  const content = (
    <div
      className={cn(
        'venus-submenu-content rounded-lg',
        variant === 'primary' ? 'min-w-83' : 'p-2 bg-background-active sm:w-79',
        inline && 'venus-inline-submenu',
      )}
    >
      <div className={cn(variant === 'primary' ? 'space-y-3' : 'space-y-1')}>
        {items.map(subItem => (
          <SubMenuItem {...subItem} variant={variant} key={subItem.label} />
        ))}
      </div>
    </div>
  );

  return inline && variant === 'secondary' ? (
    <div className="venus-inline-product-menu venus-navigation-menu venus-dropdown-surface">
      {content}
    </div>
  ) : content;
};
