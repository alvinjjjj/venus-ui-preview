import { cn } from '@venusprotocol/ui';

export interface LayeredValuesProps {
  topValue: React.ReactNode;
  bottomValue?: string | number;
  className?: string;
  bottomValueClassName?: string;
  topValueClassName?: string;
}

export const LayeredValues: React.FC<LayeredValuesProps> = ({
  topValue,
  bottomValue,
  className,
  topValueClassName,
  bottomValueClassName,
}) => (
  <div className={className}>
    <p data-layered-value="primary" className={topValueClassName}>{topValue}</p>
    {bottomValue && <p data-layered-value="secondary" className={cn('text-grey', bottomValueClassName)}>{bottomValue}</p>}
  </div>
);

export default LayeredValues;
