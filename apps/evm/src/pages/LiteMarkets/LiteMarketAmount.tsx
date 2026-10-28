import { cn } from '@venusprotocol/ui';
import './market-amount.css';

/** One numeric hierarchy for asset lists and their Earn/Borrow source tables. */
export function LiteMarketAmount({
  value,
  usdValue,
  symbol,
  liquidity = false,
}: {
  value: string;
  usdValue: string;
  symbol: string;
  liquidity?: boolean;
}) {
  return (
    <div data-lite-market-amount className="tabular-nums">
      <span className={cn('lite-amount', liquidity && 'lite-liquidity-amount')}>{value}</span>
      <span className="lite-amount-symbol"> {symbol}</span>
      <p className="text-light-grey">{usdValue}</p>
    </div>
  );
}
