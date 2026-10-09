export interface ChartTooltipContentItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface ChartTooltipContentProps {
  items: ChartTooltipContentItem[];
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({ items }) => (
  <div
    className="venus-chart-tooltip space-y-1 sm:space-y-2 p-3 bg-background rounded-lg"
    data-venus-chart-tooltip="true"
  >
    {items.map(item => (
      <div className="flex items-center mr-auto" key={`tooltip-content-item-${item.label}`}>
        {item.color && (
          <span
            className="mr-2 size-2 shrink-0 rounded-sm"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
        )}
        <span className="mr-2 text-grey text-xs">{item.label}</span>

        <span className="text-white text-sm font-semibold">{item.value}</span>
      </div>
    ))}
  </div>
);
