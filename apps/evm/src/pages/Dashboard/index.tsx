import BigNumber from 'bignumber.js';
import { useGetLiquidityHubs, useGetPool, useGetVaults } from 'clients/api';
import { Delimiter, Page, Spinner } from 'components';
import { routes } from 'constants/routing';
import { isNewDesignMode, useGlassPreview } from 'demo/GlassVersions/store';
import { isFundedDemoAddress, useDemo } from 'demo/state';
import { useChain } from 'hooks/useChain';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { PAGE_PARAM_DEFAULT_KEY } from 'hooks/useUrlPagination';
import { useAccountAddress, useChainId } from 'libs/wallet';
import { useEffect, useMemo, useRef } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { ChainId } from 'types';
import { AccountOverview } from '../../containers/AccountOverview';
import { bStockPreviewBalances } from './BStockPositions';
import { Guide } from './Guide';
import { LitePositions, getDashboardHubs } from './LitePositions';
import { getNewPreviewPool } from './Markets/getNewPreviewPool';
import { Transactions } from './Transactions';
import DashboardEyeIcon from './assets/eye.svg?react';
import DashboardInfoIcon from './assets/info.svg?react';
import './figma-dashboard.css';
import './styles.css';
import './typography-study.css';

export const Dashboard: React.FC = () => {
  const { accountAddress } = useAccountAddress();
  const [searchParams] = useSearchParams();
  if (!accountAddress) {
    const next = new URLSearchParams();
    for (const key of ['interface', 'chainId']) {
      const value = searchParams.get(key);
      if (value) next.set(key, value);
    }
    return <Navigate to={{ pathname: routes.landing.path, search: next.toString() }} replace />;
  }
  return <DashboardContent />;
};

export const DashboardContent = ({ embedded = false }: { embedded?: boolean }) => {
  const Container = embedded ? 'div' : Page;
  const { corePoolComptrollerContractAddress } = useChain();
  const { chainId } = useChainId();
  const [, setSearchParams] = useSearchParams();

  const chainIdRef = useRef(chainId);
  useEffect(() => {
    if (chainId !== chainIdRef.current) {
      chainIdRef.current = chainId;
      setSearchParams(currentSearchParams => {
        currentSearchParams.delete(PAGE_PARAM_DEFAULT_KEY);
        return Object.fromEntries(currentSearchParams);
      });
    }
  }, [chainId, setSearchParams]);

  const isLiquidityHubFeatureEnabled = useIsFeatureEnabled({
    name: 'liquidityHub',
  });

  const { accountAddress } = useAccountAddress();
  const { data: getPoolData, isLoading: isGetPoolLoading } = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });
  const pool = getPoolData?.pool;
  const isPreviewMode = useGlassPreview(
    state => isNewDesignMode(state.mode) || state.mode === 'lite-experiment-v2',
  );
  const isFinalDashboard = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const isDemoLoggedIn = useDemo(state => state.loggedIn);
  const previewPool = useMemo(
    () =>
      pool &&
      chainId === ChainId.BSC_MAINNET &&
      isPreviewMode &&
      isDemoLoggedIn &&
      isFundedDemoAddress(accountAddress)
        ? getNewPreviewPool(pool)
        : undefined,
    [pool, chainId, isPreviewMode, isDemoLoggedIn, accountAddress],
  );

  const { data: getVaultsData, isLoading: isGetVaultsLoading } = useGetVaults({
    accountAddress,
  });
  const vaults = getVaultsData || [];

  const {
    data: getLiquidityHubsData = {
      liquidityHubs: [],
    },
    isLoading: isGetLiquidityHubsLoading,
  } = useGetLiquidityHubs(
    {
      accountAddress,
    },
    {
      enabled: isLiquidityHubFeatureEnabled,
    },
  );
  const { liquidityHubs } = getLiquidityHubsData;

  const isFetching = isGetPoolLoading;

  if (isFetching) {
    return <Spinner />;
  }

  const summaryHubs = getDashboardHubs(
    liquidityHubs,
    !!accountAddress,
    isDemoLoggedIn && isFundedDemoAddress(accountAddress),
  );
  const fundedDemo = isDemoLoggedIn && isFundedDemoAddress(accountAddress);
  const spokePreviewTotals = Object.values(bStockPreviewBalances).reduce(
    (sum, position) => ({
      supplyCents: sum.supplyCents.plus(position.supplyCents),
      borrowCents: sum.borrowCents.plus(position.borrowCents),
      yearlyEarningsCents: sum.yearlyEarningsCents.plus(position.yearlyEarningsCents),
    }),
    {
      supplyCents: new BigNumber(0),
      borrowCents: new BigNumber(0),
      yearlyEarningsCents: new BigNumber(0),
    },
  );
  const balanceAdjustment = isFinalDashboard
    ? {
        supplyCents: summaryHubs.reduce(
          (sum, hub) => sum.plus(hub.userSupplyBalanceCents ?? 0),
          new BigNumber(fundedDemo ? spokePreviewTotals.supplyCents : 0),
        ),
        borrowCents: new BigNumber(fundedDemo ? spokePreviewTotals.borrowCents : 0),
        yearlyEarningsCents: summaryHubs.reduce(
          (sum, hub) => sum.plus(hub.userYearlyEarningsCents ?? 0),
          new BigNumber(fundedDemo ? spokePreviewTotals.yearlyEarningsCents : 0),
        ),
      }
    : undefined;
  const accountOverview = (
    <AccountOverview
      className="venus-glass-card glass-dashboard-overview w-full"
      accountAddress={accountAddress}
      previewPool={previewPool}
      balanceAdjustment={balanceAdjustment}
      splitLayout
      chartColor={isFinalDashboard ? 'var(--color-blue)' : undefined}
      chartVariant={isFinalDashboard ? 'line' : undefined}
      netWorthInfoIcon={
        isFinalDashboard ? (
          <DashboardInfoIcon className="dashboard-static-icon" aria-hidden="true" />
        ) : undefined
      }
      balanceVisibilityIcon={
        isFinalDashboard ? (
          <DashboardEyeIcon className="dashboard-static-icon" aria-hidden="true" />
        ) : undefined
      }
    />
  );

  return (
    <Container>
      <div className="dashboard-page contents lite-dashboard">
        <div
          className={
            isFinalDashboard ? 'dashboard-overview-section space-y-6 mb-6' : 'space-y-12 mb-24'
          }
        >
          {isFinalDashboard && <h2 className="dashboard-section-title">Summary</h2>}
          {accountOverview}

          {!isFinalDashboard && <Guide />}
        </div>

        {isFinalDashboard && <Delimiter className="dashboard-positions-divider" />}

        <div className="venus-glass-card glass-dashboard-tabs">
          <LitePositions
            corePool={previewPool ?? pool}
            previewInteractions={!!previewPool}
            liquidityHubs={liquidityHubs}
            isHubsLoading={isGetLiquidityHubsLoading}
            vaults={vaults}
            isVaultsLoading={isGetVaultsLoading}
          />
        </div>
        {isFinalDashboard && <Delimiter className="dashboard-transactions-divider" />}

        <section aria-labelledby="lite-transactions-title" className="mt-12 mb-10 space-y-6">
          {!isFinalDashboard && (
            <h2 id="lite-transactions-title" className="text-lg font-semibold">
              Transaction
            </h2>
          )}
          <Transactions allowDemoPreview />
        </section>
      </div>
    </Container>
  );
};

export default Dashboard;
