import { PrimaryButton } from '@venusprotocol/ui';
import { Card } from 'components/Card';
import { Dropdown } from 'components/Dropdown';
import { Icon } from 'components/Icon';
import { TokenIcon } from 'components/TokenIcon';
import { useBreakpointUp } from 'hooks/responsive';
import { useEffect, useId, useRef } from 'react';
import type { LiteAsset } from './data';
import { getE2ListToken } from './e2TokenIcons';


const composition = [
  { symbol: 'USDT', position: 'near-left', ring: false },
  { symbol: 'USDC', position: 'near-right', ring: true },
  { symbol: 'sUSDe', position: 'lower-left', ring: false },
  { symbol: 'DAI', position: 'lower-right', ring: true },
  { symbol: 'BTCB', position: 'far-left', ring: false },
  { symbol: 'ETH', position: 'far-right', ring: false },
] as const;

function PlanetApyCard({
  row,
  id,
  onClose,
  onEarn,
}: {
  row: LiteAsset;
  id: string;
  onClose: (restoreFocus: boolean) => void;
  onEarn: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <Card
      panel={false}
      id={id}
      role="dialog"
      aria-label={`${row.token.symbol} supply APY`}
      className="lite-e2-planet-card border-0 bg-transparent p-4"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose(false);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <TokenIcon token={row.token} size="md" />
          <h2 className="text-base font-semibold">{row.token.symbol}</h2>
        </div>
        <button
          ref={closeRef}
          type="button"
          aria-label={`Close ${row.token.symbol} APY`}
          className="lite-e2-planet-close inline-flex size-8 items-center justify-center rounded-lg text-light-grey cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
          onClick={() => onClose(true)}
        >
          <Icon name="close" className="size-4" />
        </button>
      </div>
      <div className="my-4">
        <div className="flex justify-between text-xs text-light-grey mb-2"><span>Market</span><span>Supply APY</span></div>
        {row.markets.map(market => (
          <div key={market.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>{market.asset ? 'Core Pool' : 'Liquidity Hub'}</span>
            <strong className="font-semibold tabular-nums">{market.apy.isFinite() ? `${market.apy.toFixed(2)}%` : '—'}</strong>
          </div>
        ))}
      </div>
      <PrimaryButton
        size="sm"
        material="blue-glass"
        className="w-full"
        onClick={onEarn}
        disabled={!row.markets.length}
      >
        Earn now
      </PrimaryButton>
    </Card>
  );
}

function PlanetEntry({
  row,
  position,
  ring,
  onEarn,
}: {
  row: LiteAsset;
  position: string;
  ring: boolean;
  onEarn: (row: LiteAsset) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  return (
    <div
      className={`lite-e2-token-planet lite-e2-token-planet--${position}`}
      data-token={row.token.symbol}
      data-ring={ring}
    >
      <Dropdown
        menuClassName="lite-e2-planet-popover"
        menuPosition={position.endsWith('right') ? 'right' : 'left'}
        optionsDom={({ setIsDropdownOpen }) => (
          <PlanetApyCard
            row={row}
            id={id}
            onClose={restoreFocus => {
              setIsDropdownOpen(false);
              if (restoreFocus) triggerRef.current?.focus();
            }}
            onEarn={() => {
              setIsDropdownOpen(false);
              onEarn(row);
            }}
          />
        )}
      >
        {({ isDropdownOpen, handleToggleDropdown }) => (
          <button
            ref={triggerRef}
            type="button"
            className="lite-e2-planet-trigger"
            aria-label={`View ${row.token.symbol} supply APY`}
            aria-haspopup="dialog"
            aria-expanded={isDropdownOpen}
            aria-controls={isDropdownOpen ? id : undefined}
            onClick={handleToggleDropdown}
          >
            {ring && (
              <span className="lite-e2-planet-ring lite-e2-planet-ring--back" aria-hidden="true" />
            )}
            <img
              src={getE2ListToken(row.token).iconSrc}
              alt=""
              width={256}
              height={256}
              decoding="async"
              draggable={false}
            />
            {ring && (
              <span className="lite-e2-planet-ring lite-e2-planet-ring--front" aria-hidden="true" />
            )}
          </button>
        )}
      </Dropdown>
    </div>
  );
}

/** Alternative E2 discovery: same artwork, rates and source-selection flow as the list. */
export function TokenPlanetBackdrop({
  rows,
  onEarn,
}: {
  rows: LiteAsset[];
  onEarn: (row: LiteAsset) => void;
}) {
  const wide = useBreakpointUp('xl');
  const bySymbol = new Map(rows.map(row => [row.token.symbol, row]));
  // Unmount the shared Dropdown too, so an open portal cannot outlive its
  // trigger when resizing to the list-only tablet/phone layout.
  if (!wide) return null;

  return (
    <aside className="lite-e2-token-planets" aria-label="Explore Earn APYs">
      {composition.map(({ symbol, position, ring }) => {
        const row = bySymbol.get(symbol);
        if (!row) return null;
        return (
          <PlanetEntry key={symbol} row={row} position={position} ring={ring} onEarn={onEarn} />
        );
      })}
    </aside>
  );
}
