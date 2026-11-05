import { useGetAccountTransactionHistory, useGetLiquidityHubs, useGetPools } from 'clients/api';
import {
  Button,
  MultiSelect,
  Pagination,
  Select,
  type SelectOption,
  TokenIconWithSymbol,
  TransactionsList,
} from 'components';
import { NULL_ADDRESS } from 'constants/address';
import { TX_TYPES } from 'constants/marketTxTypes';
import { isNewDesignMode, useGlassPreview } from 'demo/GlassVersions/store';
import { isFundedDemoAddress, useDemo } from 'demo/state';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useTranslation } from 'libs/translations';
import { useAccountAddress, useChainId } from 'libs/wallet';
import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { ChainId, type Token, type TxType } from 'types';
import { getTransactionName } from 'utilities';
import { matchesTransactionFilters } from 'utilities/matchesTransactionFilters';
import { isAddress } from 'viem';
import { DashboardEmptyState } from '../EmptyState';
import DownloadCsvIcon from '../assets/download-csv.svg?react';
import { createTransactionsCsv } from './createTransactionsCsv';
import { getNewPreviewTransactions } from './getNewPreviewTransactions';

const FIRST_PAGE = 1;
const ITEMS_PER_PAGE_COUNT = 20;
const ALL_OPTION_VALUE = 'all';
const PAGE_PARAM_KEY = 'page';
const TX_TYPE_PARAM_KEY = 'txType';
const CONTRACT_ADDRESS_PARAM_KEY = 'contractAddress';

export const Transactions: React.FC<{ allowDemoPreview?: boolean }> = ({
  allowDemoPreview = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { chainId } = useChainId();

  // The URL page is 1-based and user-editable, so we guard against invalid values
  // (non-numeric, non-integer, below 1) and fall back to the first page. The upper
  // bound (page above the total) is handled by the Pagination component.
  const pageStr = searchParams.get(PAGE_PARAM_KEY);
  const parsedPage = pageStr === null ? undefined : Number(pageStr);
  const isValidPage =
    parsedPage !== undefined && Number.isInteger(parsedPage) && parsedPage >= FIRST_PAGE;
  const page = isValidPage ? parsedPage : FIRST_PAGE;

  const txTypeStr = searchParams.get(TX_TYPE_PARAM_KEY) ?? ALL_OPTION_VALUE;
  const txType = TX_TYPES.find(type => type === txTypeStr);
  const selectedTxType = txType ?? ALL_OPTION_VALUE;
  const selectedTxTypes = allowDemoPreview
    ? [...new Set(searchParams.getAll(TX_TYPE_PARAM_KEY))].filter((type): type is TxType =>
        TX_TYPES.some(supportedType => supportedType === type),
      )
    : txType
      ? [txType]
      : [];
  const selectedTransactionTypes = selectedTxTypes.length > 0 ? selectedTxTypes : TX_TYPES;

  const selectedContractAddress = searchParams.get(CONTRACT_ADDRESS_PARAM_KEY) ?? ALL_OPTION_VALUE;
  const selectedSources = allowDemoPreview
    ? [...new Set(searchParams.getAll(CONTRACT_ADDRESS_PARAM_KEY))].filter(
        source => isAddress(source) || source === 'trade',
      )
    : selectedContractAddress === ALL_OPTION_VALUE
      ? []
      : [selectedContractAddress];

  const setFilter = (key: string, values: string[]) =>
    setSearchParams(currentSearchParams => {
      const next = new URLSearchParams(currentSearchParams);
      next.delete(key);
      if (values.length === 0) next.set(key, ALL_OPTION_VALUE);
      else values.forEach(value => next.append(key, value));
      next.set(PAGE_PARAM_KEY, String(FIRST_PAGE));
      return next;
    });

  const setTxType = (newTxType: string) => setFilter(TX_TYPE_PARAM_KEY, [newTxType]);

  const setSelectedContractAddress = (newContractAddress: string) =>
    setFilter(CONTRACT_ADDRESS_PARAM_KEY, [newContractAddress]);

  const setPage = (newPage: string) =>
    setSearchParams(currentSearchParams => {
      const next = new URLSearchParams(currentSearchParams);
      next.set(PAGE_PARAM_KEY, newPage);
      return next;
    });

  // Fall back to the first page when the page param is present but invalid (e.g. 0 or negative)
  useEffect(() => {
    if (pageStr !== null && !isValidPage) {
      setSearchParams(
        currentSearchParams => {
          const next = new URLSearchParams(currentSearchParams);
          next.set(PAGE_PARAM_KEY, String(FIRST_PAGE));
          return next;
        },
        { replace: true },
      );
    }
  }, [pageStr, isValidPage, setSearchParams]);

  // Reset search params when detecting chain switch.
  const chainIdRef = useRef(chainId);
  useEffect(() => {
    if (chainId !== chainIdRef.current) {
      setSearchParams(currentSearchParams => ({
        ...Object.fromEntries(currentSearchParams),
        [TX_TYPE_PARAM_KEY]: ALL_OPTION_VALUE,
        [CONTRACT_ADDRESS_PARAM_KEY]: ALL_OPTION_VALUE,
        [PAGE_PARAM_KEY]: ALL_OPTION_VALUE,
      }));

      chainIdRef.current = chainId;
    }
  }, [chainId, setSearchParams]);

  const { t } = useTranslation();
  const { accountAddress } = useAccountAddress();
  const isNewMode = useGlassPreview(state => isNewDesignMode(state.mode));
  const isFinalDashboard = useGlassPreview(
    state => allowDemoPreview && state.mode === 'lite-experiment-v2',
  );
  const isDemoLoggedIn = useDemo(state => state.loggedIn);
  const isNewPreview =
    chainId === ChainId.BSC_MAINNET &&
    (isNewMode || allowDemoPreview) &&
    isDemoLoggedIn &&
    isFundedDemoAddress(accountAddress);
  const { data: poolData } = useGetPools({
    accountAddress,
    includeIsolatedPools: true,
  });
  const isTransactionHistoryFeatureEnabled = useIsFeatureEnabled({
    name: 'transactionHistory',
  });
  const isLiquidityHubFeatureEnabled = useIsFeatureEnabled({
    name: 'liquidityHub',
  });

  const {
    data: getLiquidityHubsData = {
      liquidityHubs: [],
    },
  } = useGetLiquidityHubs(
    {
      accountAddress,
    },
    {
      enabled: isLiquidityHubFeatureEnabled,
    },
  );
  const { liquidityHubs } = getLiquidityHubsData;

  const { data: historicalTxsData, isLoading: areHistoricalTxsLoading } =
    useGetAccountTransactionHistory(
      {
        accountAddress: accountAddress || NULL_ADDRESS,
        page,
        contractAddress: isAddress(selectedContractAddress) ? selectedContractAddress : undefined,
        types: selectedTransactionTypes,
        ...(allowDemoPreview && {
          sourceFilters: selectedSources,
          page: page - FIRST_PAGE,
          pageSize: ITEMS_PER_PAGE_COUNT,
        }),
      },
      {
        enabled: !!accountAddress && isTransactionHistoryFeatureEnabled && !isNewPreview,
      },
    );

  const txTypeSelectOptions: SelectOption<string>[] = [
    {
      label: t('account.transactions.selects.txType.all'),
      value: ALL_OPTION_VALUE,
    },
    ...TX_TYPES.map(type => ({
      label: getTransactionName({
        type,
        t,
      }),
      value: type,
    })),
  ];

  const sourceSelectOptions = useMemo(() => {
    const allOption: SelectOption<string> = {
      label: t('account.transactions.selects.source.all'),
      value: ALL_OPTION_VALUE,
    };

    const allAssets =
      poolData?.pools.flatMap(p =>
        p.assets.map(a => ({
          ...a,
          poolName: p.name,
        })),
      ) || [];

    const otherOptions: SelectOption<string>[] = [];

    if (isNewPreview) {
      otherOptions.push({
        label: t('account.transactions.txSource.trade'),
        value: 'trade',
      });
    }
    const tokenOptions: Token[] = allAssets
      .map(a => ({
        symbol: `${a.vToken.underlyingToken.symbol} - ${a.poolName}`,
        iconSrc: a.vToken.underlyingToken.iconSrc,
        address: a.vToken.address,
        decimals: a.vToken.decimals,
        chainId: a.vToken.chainId,
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    if (isLiquidityHubFeatureEnabled) {
      const liquidityHubLabel = t('layouts.menu.markets.liquidityHub.label');

      liquidityHubs.forEach(liquidityHub => {
        const { vhToken } = liquidityHub;

        tokenOptions.push({
          symbol: `${vhToken.underlyingToken.symbol} - ${liquidityHubLabel}`,
          iconSrc: vhToken.underlyingToken.iconSrc,
          address: vhToken.address,
          decimals: vhToken.decimals,
          chainId: vhToken.chainId,
        });
      });

      tokenOptions.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    for (const tokenOption of tokenOptions) {
      otherOptions.push({
        label: <TokenIconWithSymbol token={tokenOption} />,
        value: tokenOption.address,
      });
    }

    return [allOption, ...new Map(otherOptions.map(option => [option.value, option])).values()];
  }, [t, poolData, liquidityHubs, isLiquidityHubFeatureEnabled, isNewPreview]);

  // Reset contract address filter if the value in the URL is incorrect
  useEffect(() => {
    // Keep URL selections until the available sources have loaded.
    if (allowDemoPreview) {
      if (!poolData) return;
      const values = searchParams.getAll(CONTRACT_ADDRESS_PARAM_KEY);
      const validValues = values.filter(value =>
        sourceSelectOptions.some(option => option.value === value),
      );
      if (validValues.length !== values.length) {
        setSearchParams(
          current => {
            const next = new URLSearchParams(current);
            next.delete(CONTRACT_ADDRESS_PARAM_KEY);
            validValues.forEach(value => next.append(CONTRACT_ADDRESS_PARAM_KEY, value));
            next.set(PAGE_PARAM_KEY, String(FIRST_PAGE));
            return next;
          },
          { replace: true },
        );
      }
      return;
    }
    if (!sourceSelectOptions.find(option => option.value === selectedContractAddress)) {
      setSearchParams(currentSearchParams => {
        currentSearchParams.delete(CONTRACT_ADDRESS_PARAM_KEY);

        return Object.fromEntries(currentSearchParams);
      });
    }
  }, [
    allowDemoPreview,
    poolData,
    searchParams,
    selectedContractAddress,
    sourceSelectOptions,
    setSearchParams,
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewTransactions = useMemo(
    () =>
      isNewPreview && accountAddress && poolData
        ? getNewPreviewTransactions({ accountAddress, pools: poolData.pools })
        : [],
    [isNewPreview, accountAddress, poolData],
  );
  const filteredPreviewTransactions = previewTransactions.filter(transaction =>
    matchesTransactionFilters(transaction, { types: selectedTxTypes, sources: selectedSources }),
  );
  const transactions = isNewPreview
    ? filteredPreviewTransactions.slice(
        (page - FIRST_PAGE) * ITEMS_PER_PAGE_COUNT,
        page * ITEMS_PER_PAGE_COUNT,
      )
    : historicalTxsData?.transactions || [];
  const transactionsCount = isNewPreview
    ? filteredPreviewTransactions.length
    : historicalTxsData?.count || 0;
  const isLoading = !isNewPreview && areHistoricalTxsLoading;

  const isEmptyHistory =
    isFinalDashboard &&
    !isLoading &&
    transactionsCount === 0 &&
    selectedTxTypes.length === 0 &&
    selectedSources.length === 0;

  const downloadCsv = () => {
    const csv = createTransactionsCsv(transactions, type => getTransactionName({ type, t }));
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `venus-${isNewPreview ? 'demo-' : ''}transactions-page-${page}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div ref={containerRef} className="dashboard-transactions grid grid-cols-1 gap-4">
      <div className={isFinalDashboard ? 'dashboard-transaction-header' : 'contents'}>
        {isFinalDashboard && (
          <h2 id="lite-transactions-title" className="dashboard-section-title">
            Transaction
          </h2>
        )}
        {accountAddress && !isEmptyHistory && (
          <div
            className={
              isFinalDashboard
                ? 'dashboard-transaction-toolbar flex flex-wrap items-center justify-between gap-3'
                : allowDemoPreview
                  ? 'flex flex-col sm:flex-row gap-3 md:gap-4'
                  : 'flex flex-row gap-3 md:gap-4'
            }
          >
            <div className={isFinalDashboard ? 'dashboard-transaction-filters' : 'contents'}>
              {allowDemoPreview ? (
                <>
                  <MultiSelect
                    className="lite-transaction-filter w-full sm:w-60"
                    menuClassName="lite-transaction-multiselect"
                    optionsClassName={
                      isFinalDashboard ? 'dashboard-transaction-options' : undefined
                    }
                    size="small"
                    placeholder={t('account.transactions.selects.txType.all')}
                    title="Transactions"
                    resetLabel="Reset"
                    renderCount={count => `${count} transaction types`}
                    value={selectedTxTypes}
                    onChange={values => setFilter(TX_TYPE_PARAM_KEY, values)}
                    options={txTypeSelectOptions
                      .filter(option => option.value !== ALL_OPTION_VALUE)
                      .map(option => ({
                        value: option.value,
                        label:
                          typeof option.label === 'function'
                            ? option.label({ isRenderedInButton: false })
                            : option.label,
                      }))}
                  />
                  <MultiSelect
                    className="lite-transaction-filter w-full sm:w-60"
                    menuClassName="lite-transaction-multiselect"
                    optionsClassName={
                      isFinalDashboard ? 'dashboard-transaction-options' : undefined
                    }
                    size="small"
                    placeholder={t('account.transactions.selects.source.all')}
                    title="Sources"
                    resetLabel="Reset"
                    renderCount={count => `${count} sources`}
                    value={selectedSources}
                    onChange={values => setFilter(CONTRACT_ADDRESS_PARAM_KEY, values)}
                    options={sourceSelectOptions
                      .filter(option => option.value !== ALL_OPTION_VALUE)
                      .map(option => ({
                        value: option.value,
                        label:
                          typeof option.label === 'function'
                            ? option.label({ isRenderedInButton: false })
                            : option.label,
                      }))}
                  />
                </>
              ) : (
                <>
                  <Select
                    className="flex-1 md:flex-none"
                    size="small"
                    variant="tertiary"
                    placeLabelToLeft
                    options={txTypeSelectOptions}
                    optionClassName="px-3 h-10 scrollbar-track-cards"
                    dropdownClassName="overflow-auto max-h-70 scrollbar-thin scrollbar-track-cards scrollbar-thumb-grey"
                    buttonClassName="min-w-1/2 sm:min-w-45"
                    value={selectedTxType}
                    onChange={newValue => setTxType(newValue.toString())}
                  />

                  <Select
                    className="flex-1 md:flex-none"
                    size="small"
                    variant="tertiary"
                    placeLabelToLeft
                    options={sourceSelectOptions}
                    optionClassName="px-3 h-10 scrollbar-track-cards"
                    dropdownClassName={
                      isNewMode
                        ? 'dashboard-source-options'
                        : 'overflow-y-auto max-h-70 scrollbar-thin scrollbar-track-cards scrollbar-thumb-grey sm:min-w-68'
                    }
                    buttonClassName="m-w-1/2 sm:min-w-45"
                    value={selectedContractAddress}
                    onChange={newValue => setSelectedContractAddress(newValue.toString())}
                  />
                </>
              )}
            </div>
            {isFinalDashboard && (
              <Button
                variant="text"
                className="dashboard-download-csv"
                contentClassName="gap-1"
                aria-label="Download displayed transactions as CSV"
                title="Download this filtered page as CSV"
                disabled={isLoading || transactions.length === 0}
                onClick={downloadCsv}
              >
                Download .CSV
                <DownloadCsvIcon aria-hidden="true" className="dashboard-static-icon" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isNewPreview && !allowDemoPreview && transactionsCount > 0 && (
        <p className="dashboard-preview-label text-sm text-grey">
          {t('account.transactions.previewData')}
        </p>
      )}

      {isEmptyHistory ? (
        <DashboardEmptyState message="No transactions yet" />
      ) : (
        <TransactionsList
          transactions={transactions}
          isLoading={isLoading}
          isPreview={isNewPreview}
          glowFrame={isNewMode}
        />
      )}

      {!isLoading && transactionsCount > 0 && (
        <Pagination
          showSinglePage={isFinalDashboard}
          className={isFinalDashboard ? 'dashboard-transaction-pagination' : undefined}
          initialPageIndex={FIRST_PAGE}
          itemsCount={transactionsCount}
          itemsPerPageCount={ITEMS_PER_PAGE_COUNT}
          onChange={newValue => setPage(newValue.toString())}
          scrollToRef={containerRef}
        />
      )}
    </div>
  );
};
