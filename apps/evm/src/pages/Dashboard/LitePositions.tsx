import BigNumber from 'bignumber.js';
import { Select, Spinner, cn } from 'components';
import { routes } from 'constants/routing';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { isDemoAddress, useDemo } from 'demo/state';
import { useAccountAddress } from 'libs/wallet';
import { type ReactNode, useState } from 'react';
import type { LiquidityHub, Pool } from 'types';
import { getCombinedApy } from 'utilities';
import { BStockPositions, bStockPreviewHealthFactor } from './BStockPositions';
import { Hubs } from './Hubs';
import { Positions } from './Markets/Positions';
import { Placeholder } from './Placeholder';
import { PositionHealthIndicator } from './PositionHealthIndicator';

type PositionChoice = { id: string; label: string; content: ReactNode; healthFactor?: number };

function PositionChoiceLabel({
  choice,
  showHealth,
}: { choice: PositionChoice; showHealth: boolean }) {
  const factor = choice.healthFactor;
  return (
    <span className="inline-flex items-center gap-3">
      <span>{choice.label}</span>
      {showHealth && factor !== undefined && Number.isFinite(factor) && factor >= 0 && (
        <PositionHealthIndicator factor={factor} />
      )}
    </span>
  );
}

export function LitePositions({
  corePool,
  previewInteractions,
  liquidityHubs,
  isHubsLoading,
}: {
  corePool?: Pool;
  previewInteractions?: boolean;
  liquidityHubs: LiquidityHub[];
  isHubsLoading: boolean;
}) {
  const { accountAddress } = useAccountAddress();
  const demoLoggedIn = useDemo(state => state.loggedIn);
  const [selected, setSelected] = useState<string>();
  // New and E: the market chips use New's glass button material (blue glass when selected,
  // grey glass otherwise), like the 30D / 6M / 1Y group. O keeps its flat chips.
  const glassChips = useGlassPreview(state => state.mode !== 'v1');
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const hasCorePositions =
    accountAddress &&
    corePool?.assets.some(
      asset =>
        asset.userSupplyBalanceTokens.gt(0) ||
        asset.userBorrowBalanceTokens.gt(0) ||
        asset.isCollateralOfUser,
    );
  const choices: PositionChoice[] = [
    {
      id: 'venus-core',
      label: 'Venus Core',
      healthFactor:
        accountAddress && corePool?.userBorrowBalanceCents?.gt(0)
          ? corePool.userHealthFactor
          : undefined,
      content:
        hasCorePositions && corePool ? (
          <Positions pools={[corePool]} previewInteractions={previewInteractions} />
        ) : (
          <Placeholder
            iconName="venus"
            title="No active positions"
            to={routes.markets.path}
            buttonSize="sm"
          />
        ),
    },
  ];
  let activeHubs = accountAddress
    ? liquidityHubs.filter(
        hub => hub.userSupplyBalanceTokens?.gt(0) || hub.userSupplyBalanceCents?.gt(0),
      )
    : [];
  // One display-only holding for the demo wallet; never modify fetched wallet data.
  const showcaseHub = liquidityHubs.find(hub => hub.vhToken.underlyingToken.symbol === 'USDT');
  if (demoLoggedIn && isDemoAddress(accountAddress) && showcaseHub) {
    const balance = new BigNumber('1.000018');
    const balanceCents = balance.times(showcaseHub.tokenPriceCents);
    const { totalApyPercentage } = getCombinedApy({
      type: 'supply',
      baseApyPercentage: showcaseHub.supplyApyPercentage,
      tokenDistributions: showcaseHub.supplyTokenDistributions,
    });
    activeHubs = [
      {
        ...showcaseHub,
        userSupplyBalanceTokens: balance,
        userSupplyBalanceCents: balanceCents,
        userYearlyEarningsCents: balanceCents.times(totalApyPercentage).div(100),
      },
    ];
  }
  choices.push({
    id: 'liquidity-hub',
    label: 'Liquidity Hub',
    content: isHubsLoading ? <Spinner /> : <Hubs liquidityHubs={activeHubs} />,
  });
  for (const variant of ['index', 'growth'] as const) {
    choices.push({
      id: `bstock-${variant}`,
      label: `bStock ${variant}`,
      healthFactor:
        demoLoggedIn && isDemoAddress(accountAddress) && corePool
          ? bStockPreviewHealthFactor
          : undefined,
      content:
        demoLoggedIn && isDemoAddress(accountAddress) ? (
          <BStockPositions variant={variant} corePool={corePool} />
        ) : (
          <Placeholder
            iconName="venus"
            title="No active positions"
            to={routes.markets.path}
            buttonSize="sm"
          />
        ),
    });
  }
  const active = choices.find(choice => choice.id === selected) ?? choices[0];
  return (
    <section aria-label="Positions" className="space-y-8">
      <div className={cn('space-y-8', isFinal && 'dashboard-position-picker')}>
        <h2 className="text-lg font-semibold">Positions</h2>
        {isFinal && (
          <div className="sm:hidden">
            <Select
              name="position-market"
              value={active.id}
              onChange={value => setSelected(String(value))}
              options={choices.map(choice => ({
                value: choice.id,
                label: ({ isRenderedInButton }) => (
                  <PositionChoiceLabel
                    choice={choice}
                    showHealth={!isRenderedInButton && choice.id !== active.id}
                  />
                ),
              }))}
              menuTitle="Positions"
            />
          </div>
        )}
        {choices.length > 0 && (
          <div
            className={cn('flex flex-wrap gap-3', isFinal && 'hidden sm:flex')}
            role="group"
            aria-label="Position market"
          >
            {choices.map(choice => (
              <button
                key={choice.id}
                type="button"
                aria-pressed={active?.id === choice.id}
                onClick={() => setSelected(choice.id)}
                {...(glassChips
                  ? {
                      'data-venus-button-material': 'glass',
                      'data-venus-button-variant': 'secondary',
                      'data-venus-button-size': 'md',
                      ...(active?.id === choice.id ? { 'data-venus-button-active': 'true' } : {}),
                    }
                  : {})}
                className={cn(
                  'rounded-lg px-6 py-3 text-sm font-normal cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2',
                  glassChips
                    ? cn(
                        'relative border',
                        active?.id === choice.id
                          ? 'text-white font-semibold'
                          : 'text-light-grey hover:text-white',
                      )
                    : active?.id === choice.id
                      ? 'bg-blue text-white font-semibold'
                      : 'bg-dark-blue text-light-grey hover:text-white',
                )}
              >
                <PositionChoiceLabel choice={choice} showHealth={active.id !== choice.id} />
              </button>
            ))}
          </div>
        )}
      </div>
      {active?.content}
    </section>
  );
}
