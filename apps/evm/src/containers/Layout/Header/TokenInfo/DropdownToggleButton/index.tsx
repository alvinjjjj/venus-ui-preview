import { cn } from '@venusprotocol/ui';
import { Button, type ButtonProps } from 'components';

interface DropdownToggleButtonProps {
  className?: string;
  handleToggleDropdown: () => void;
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
}

export const DropdownToggleButton = ({
  className,
  handleToggleDropdown,
  children,
  variant,
}: DropdownToggleButtonProps) => (
  <Button
    variant={variant}
    onClick={handleToggleDropdown}
    className={cn(
      'p-0 border-transparent hover:border-transparent h-8 w-8 bg-background/40 hover:bg-background',
      className,
    )}
  >
    {children}
  </Button>
);
