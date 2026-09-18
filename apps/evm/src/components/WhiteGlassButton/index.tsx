import { cn } from '@venusprotocol/ui';
import type { ButtonHTMLAttributes } from 'react';
import './white-glass.css';

export const WhiteGlassButton = ({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    className={cn(
      'venus-white-glass px-6 py-3 text-sm font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-blue disabled:opacity-50 disabled:pointer-events-none',
      className,
    )}
  >
    <span>{children}</span>
  </button>
);
