import { cn } from '@venusprotocol/ui';
import type { ReactNode } from 'react';
import { Icon } from '../../Icon';

export const SelectOptionRow = ({
  children,
  selected = false,
  disabled = false,
  onClick,
  className,
  previewState,
}: {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  previewState?: string;
}) => (
  <button
    type="button"
    data-select-option
    data-preview-state={previewState}
    aria-pressed={selected}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'hover:bg-lightGrey active:bg-lightGrey flex min-w-full items-center justify-between py-3 text-left text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
      className,
    )}
  >
    <span className="grow whitespace-nowrap">{children}</span>
    {selected && <Icon name="mark" className="text-green ml-4 w-5 h-5 shrink-0" />}
  </button>
);
