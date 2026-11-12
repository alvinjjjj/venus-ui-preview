import BigNumber from 'bignumber.js';
import { Select, Spinner, cn } from 'components';
import { routes } from 'constants/routing';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { isFundedDemoAddress, useDemo } from 'demo/state';
import { useAccountAddress } from 'libs/wallet';
import { type ReactNode, useEffect, useState } from 'react';
import type { LiquidityHub, Pool, Vault } from 'types';
import { getCombinedApy } from 'utilities';
import { BStockPositions, bStockPreviewHealthFactor } from './BStockPositions';
import { DashboardEmptyState } from './EmptyState';
import { Hubs } from './Hubs';
import { Positions } from './Markets/Positions';
import { Placeholder } from './Placeholder';
import { PositionHealthIndicator } from './PositionHealthIndicator';
import { Vaults } from './Vaults';

type PositionChoice = {
  id: string;
  label: string;
  content: ReactNode;
  hasPositions: boolean;
  healthFactor?: number;
};

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

export function getDashboardHubs(
  liquidityHubs: LiquidityHub[],
  connected: boolean,
  fundedDemo: boolean,
) {
  let activeHubs = connected
    ? liquidityHubs.filter(
        hub => hub.userSupplyBalanceTokens?.gt(0) || hub.userSupplyBalanceCents?.gt(0),
      )
    : [];
  // One display-only holding for the demo wallet; never modify fetched wallet data.
  const showcaseHub = liquidityHubs.find(hub => hub.vhToken.underlyingToken.symbol === 'USDT');
  if (fundedDemo && showcaseHub) {
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
  return activeHubs;
}

export function LitePositions({
  corePool,
  previewInteractions,
  liquidityHubs,
  isHubsLoading,
  vaults = [],
  isVaultsLoading = false,
}: {
  corePool?: Pool;
  previewInteractions?: boolean;
  liquidityHubs: LiquidityHub[];
  isHubsLoading: boolean;
  vaults?: Vault[];
  isVaultsLoading?: boolean;
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
        // Membership with no supplied/borrowed balance is not a holding.
        // Keep the earlier previews' membership behavior outside Final.
        (!isFinal && asset.isCollateralOfUser),
    );
  const choices: PositionChoice[] = [
    {
      id: 'venus-core',
      label: 'Venus Core',
      hasPositions: !!hasCorePositions,
      healthFactor:
        accountAddress && corePool?.userBorrowBalanceCents?.gt(0)
          ? corePool.userHealthFactor
          : undefined,
      content:
        hasCorePositions && corePool ? (
          <Positions pools={[corePool]} previewInteractions={previewInteractions} />
        ) : isFinal ? (
          <DashboardEmptyState message="No positions yet" to={routes.landing.path} />
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
  const activeHubs = getDashboardHubs(
    liquidityHubs,
    !!accountAddress,
    demoLoggedIn && isFundedDemoAddress(accountAddress),
  );
  choices.push({
    id: 'liquidity-hub',
    label: 'Liquidity Hub',
    hasPositions: activeHubs.length > 0,
    content: isHubsLoading ? <Spinner /> : <Hubs liquidityHubs={activeHubs} />,
  });
  if (isFinal) {
    choices.push({
      id: 'vaults',
      label: 'Vaults',
      hasPositions: !!accountAddress && vaults.some(vault => vault.userStakeBalanceMantissa?.gt(0)),
      content: isVaultsLoading ? <Spinner /> : <Vaults vaults={vaults} />,
    });
  }
  for (const variant of ['index', 'growth'] as const) {
    choices.push({
      id: `bstock-${variant}`,
      label: `bStock ${variant}`,
      // The current bStock cards contain fixtures only for the demo wallet.
      // Ordinary wallets have no bStock position data to display here yet.
      hasPositions: !!(demoLoggedIn && isFundedDemoAddress(accountAddress)),
      healthFactor:
        demoLoggedIn && isFundedDemoAddress(accountAddress) && corePool
          ? bStockPreviewHealthFactor
          : undefined,
      content:
        demoLoggedIn && isFundedDemoAddress(accountAddress) ? (
          <BStockPositions variant={variant} corePool={corePool} />
        ) : isFinal ? (
          <DashboardEmptyState message="No positions yet" to={routes.landing.path} />
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
  // Lite tab order: Liquidity Hub, Venus Core, bStock index, bStock growth, Vaults.
  const tabOrder = ['liquidity-hub', 'venus-core', 'bstock-index', 'bstock-growth', 'vaults'];
  choices.sort((a, b) => tabOrder.indexOf(a.id) - tabOrder.indexOf(b.id));
  const availableChoices = isFinal ? choices.filter(choice => choice.hasPositions) : choices;
  const active = availableChoices.find(choice => choice.id === selected) ?? availableChoices[0];
  const activeId = active?.id;
  useEffect(() => {
    // Commit the fallback so a vanished market cannot steal the selection
    // again if its holdings arrive in a later refresh or account switch.
    if (selected && selected !== activeId) setSelected(activeId);
  }, [selected, activeId]);
  return (
    <section aria-label="Positions" className={cn('space-y-8', isFinal && 'dashboard-positions')}>
      <div className={cn('space-y-8', isFinal && active && 'dashboard-position-picker')}>
        <h2 className={cn(isFinal ? 'dashboard-section-title' : 'text-lg', 'font-semibold')}>
          Positions
        </h2>
        {isFinal && active && (
          <div className="sm:hidden">
            <Select
              name="position-market"
              buttonClassName="p-3 h-auto"
              optionClassName="p-3 h-auto"
              dropdownClassName="dashboard-position-options"
              value={active.id}
              onChange={value => setSelected(String(value))}
              options={availableChoices.map(choice => ({
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
        {active && (
          <div
            className={cn('flex flex-wrap gap-3', isFinal && 'hidden sm:flex')}
            role="group"
            aria-label="Position market"
          >
            {availableChoices.map(choice => (
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
      {active?.content ??
        (isHubsLoading || isVaultsLoading ? (
          <Spinner />
        ) : isFinal ? (
          <DashboardEmptyState message="No positions yet" to={routes.landing.path} />
        ) : (
          <Placeholder
            iconName="venus"
            title="No active positions"
            to={routes.markets.path}
            buttonSize="sm"
          />
        ))}
    </section>
  );
}
