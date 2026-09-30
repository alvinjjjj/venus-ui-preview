import { SelectButton, cn } from '@venusprotocol/ui';
import { Icon } from 'components/Icon';

interface StatsDropdownTriggerProps {
  label: string;
  ariaLabel?: string;
  expanded: boolean;
  onClick: () => void;
  className?: string;
}

export const StatsDropdownTrigger = ({
  label,
  ariaLabel,
  expanded,
  onClick,
  className,
}: StatsDropdownTriggerProps) => (
  <SelectButton
    data-select-trigger
    aria-label={ariaLabel ?? label}
    aria-expanded={expanded}
    onClick={onClick}
    className={cn('stats-dropdown-trigger', className)}
    contentClassName="stats-dropdown-trigger-content"
  >
    <span className="stats-dropdown-trigger-label">{label}</span>
    <Icon
      name="chevronDown"
      className={cn(
        'venus-dropdown-chevron stats-dropdown-trigger-chevron',
        expanded && 'rotate-180',
      )}
    />
  </SelectButton>
);
