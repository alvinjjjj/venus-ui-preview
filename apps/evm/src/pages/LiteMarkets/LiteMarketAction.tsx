import { SecondaryButton } from 'components';
import { observePromotedMotion } from './PromotedTokenFire';

const promotedBorderRef = (element: HTMLSpanElement | null) =>
  observePromotedMotion(element, active => {
    if (!element) return;
    element.dataset.motionActive = String(active);
    element.style.animationPlayState = active ? 'running' : 'paused';
  });

/** Shared E2 list action: opens sources, never submits a transaction. */
export function LiteMarketAction({
  action,
  symbol,
  onSelect,
  promoted = false,
}: {
  action: 'Earn' | 'Borrow';
  symbol: string;
  onSelect: () => void;
  promoted?: boolean;
}) {
  const isPromotedAction = promoted;
  return (
    <SecondaryButton
      size="xs"
      className={`lite-e2-market-action lite-e2-${action.toLowerCase()}-action`}
      data-promoted={isPromotedAction || undefined}
      aria-label={action === 'Earn' ? `Earn with ${symbol}` : `Borrow ${symbol}`}
      onClick={event => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {action}
      <span
        aria-hidden="true"
        className="venus-mode-border-flow lite-e2-action-border"
        ref={isPromotedAction ? promotedBorderRef : undefined}
      />
    </SecondaryButton>
  );
}
