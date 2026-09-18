import { Slot } from '@radix-ui/react-slot';
import { cn } from '@venusprotocol/ui';
import './panel.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  panel?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, asChild = false, panel = true, ...otherProps }) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-venus-panel={panel || undefined}
      className={cn(
        'venus-glass-card block w-full rounded-lg p-4 border border-dark-blue-hover',
        className,
      )}
      {...otherProps}
    />
  );
};
