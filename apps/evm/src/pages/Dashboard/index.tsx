import { useGetLiquidityHubs, useGetPool, useGetVaults } from 'clients/api';
import { Page, Spinner, Tabs } from 'components';
import { AdBanner } from 'containers/AdBanner';
import { isNewDesignMode, useGlassPreview } from 'demo/GlassVersions/store';
import { isDemoAddress, useDemo } from 'demo/state';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { useChain } from 'hooks/useChain';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import type { Tab } from 'hooks/useTabs';
import { PAGE_PARAM_DEFAULT_KEY } from 'hooks/useUrlPagination';
import { useTranslation } from 'libs/translations';
import { useAccountAddress, useChainId } from 'libs/wallet';
import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { ChainId } from 'types';
import { AccountOverview } from '../../containers/AccountOverview';
import { Guide } from './Guide';
import { Hubs } from './Hubs';
import { LitePositions } from './LitePositions';
import { Markets } from './Markets';
import { getNewPreviewPool } from './Markets/getNewPreviewPool';
import { Settings } from './Settings';
import { Transactions } from './Transactions';
import { Vaults } from './Vaults';
import './styles.css';
import './typography-study.css';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isLite } = useInterfaceMode();
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

  const isGaslessTransactionsFeatureEnabled = useIsFeatureEnabled({
    name: 'gaslessTransactions',
  });
  const isHistoricalTransactionsFeatureEnabled = useIsFeatureEnabled({
    name: 'transactionHistory',
  });
  const isLiquidityHubFeatureEnabled = useIsFeatureEnabled({
    name: 'liquidityHub',
  });

  const { accountAddress } = useAccountAddress();
  const { data: getPoolData, isLoading: isGetPoolLoading } = useGetPool({
    poolComptrollerAddress: corePoolComptrollerContractAddress,
    accountAddress,
  });
  const pool = getPoolData?.pool;
  const isNewMode = useGlassPreview(state => isNewDesignMode(state.mode));
  const isDemoLoggedIn = useDemo(state => state.loggedIn);
  const previewPool = useMemo(
    () =>
      pool &&
      chainId === ChainId.BSC_MAINNET &&
      isNewMode &&
      isDemoLoggedIn &&
      isDemoAddress(accountAddress)
        ? getNewPreviewPool(pool)
        : undefined,
    [pool, chainId, isNewMode, isDemoLoggedIn, accountAddress],
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

  const tabs: Tab[] = [
    {
      title: t('account.tabs.markets'),
      id: 'pools',
      content: pool && <Markets pool={pool} />,
    },
    {
      title: t('account.tabs.vaults'),
      id: 'vaults',
      content: isGetVaultsLoading ? <Spinner /> : <Vaults vaults={vaults} />,
    },
  ];

  if (isLiquidityHubFeatureEnabled) {
    tabs.push({
      title: t('account.tabs.hubs'),
      id: 'hub',
      content: isGetLiquidityHubsLoading ? <Spinner /> : <Hubs liquidityHubs={liquidityHubs} />,
    });
  }

  if (isHistoricalTransactionsFeatureEnabled) {
    tabs.push({
      title: t('account.tabs.transactions'),
      id: 'transactions',
      content: <Transactions />,
    });
  }

  if (isGaslessTransactionsFeatureEnabled) {
    tabs.push({
      title: t('account.tabs.settings'),
      id: 'settings',
      content: <Settings />,
    });
  }

  const isFetching = isGetPoolLoading;

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <Page>
      <div className={`dashboard-page contents${isLite ? ' lite-dashboard' : ''}`}>
        {!isLite && (
          <div className="dashboard-ad-banner mt-2 mb-12">
            <AdBanner />
          </div>
        )}

        <div className={isLite ? 'space-y-12 mb-24' : 'space-y-12 mb-12'}>
          <AccountOverview
            className="venus-glass-card glass-dashboard-overview w-full"
            accountAddress={accountAddress}
            previewPool={previewPool}
            splitLayout={isLite}
          />

          <Guide />
        </div>

        <div className="venus-glass-card glass-dashboard-tabs">
          {isLite ? (
            <LitePositions
              corePool={pool}
              liquidityHubs={liquidityHubs}
              isHubsLoading={isGetLiquidityHubsLoading}
            />
          ) : (
            <Tabs
              tabs={tabs}
              navType="searchParam"
              variant="tertiary"
              headerClassName="dashboard-main-tabs"
            />
          )}
        </div>
        {isLite && (
          <section aria-labelledby="lite-transactions-title" className="mt-12 mb-10 space-y-6">
            <h2 id="lite-transactions-title" className="text-lg font-semibold">
              Transaction
            </h2>
            <Transactions allowDemoPreview />
          </section>
        )}
      </div>
    </Page>
  );
};

export default Dashboard;
