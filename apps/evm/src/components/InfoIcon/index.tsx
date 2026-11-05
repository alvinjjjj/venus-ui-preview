import { cn } from '@venusprotocol/ui';

import { Icon, type IconName } from '../Icon';
import { Tooltip } from '../Tooltip';

export interface InfoIconProps {
  tooltip: string | React.ReactNode;
  iconName?: IconName;
  iconClassName?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const InfoIcon = ({
  tooltip,
  className,
  iconName = 'info',
  iconClassName,
  icon,
}: InfoIconProps) => (
  <Tooltip className={cn('inline-flex align-sub', className)} content={tooltip}>
    {icon ?? <Icon className={iconClassName} name={iconName} />}
  </Tooltip>
);
