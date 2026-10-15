import { useGetAccountTransactionHistory, useGetLiquidityHubs, useGetPools } from 'clients/api';
import {
  Pagination,
  Select,
  type SelectOption,
  TokenIconWithSymbol,
  TransactionsList,
} from 'components';
import { NULL_ADDRESS } from 'constants/address';
import { TX_TYPES } from 'constants/marketTxTypes';
import { isNewDesignMode, useGlassPreview } from 'demo/GlassVersions/store';
import { isDemoAddress, useDemo } from 'demo/state';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useTranslation } from 'libs/translations';
import { useAccountAddress, useChainId } from 'libs/wallet';
import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { ChainId, type Token } from 'types';
import { getTransactionName } from 'utilities';
import { isAddress } from 'viem';
import { getNewPreviewTransactions } from './getNewPreviewTransactions';

const FIRST_PAGE = 1;
const ITEMS_PER_PAGE_COUNT = 20;
const ALL_OPTION_VALUE = 'all';
const PAGE_PARAM_KEY = 'page';
const TX_TYPE_PARAM_KEY = 'txType';
const CONTRACT_ADDRESS_PARAM_KEY = 'contractAddress';

export const Transactions: React.FC = () => {
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
  const selectedTransactionTypes = txType ? [txType] : TX_TYPES;

  const selectedContractAddress = searchParams.get(CONTRACT_ADDRESS_PARAM_KEY) ?? ALL_OPTION_VALUE;

  const setTxType = (newTxType: string) =>
    setSearchParams(currentSearchParams => ({
      ...Object.fromEntries(currentSearchParams),
      [TX_TYPE_PARAM_KEY]: newTxType,
      // Reset page
      [PAGE_PARAM_KEY]: String(FIRST_PAGE),
    }));

  const setSelectedContractAddress = (newContractAddress: string) =>
    setSearchParams(currentSearchParams => ({
      ...Object.fromEntries(currentSearchParams),
      [CONTRACT_ADDRESS_PARAM_KEY]: newContractAddress,
      // Reset page
      [PAGE_PARAM_KEY]: String(FIRST_PAGE),
    }));

  const setPage = (newPage: string) =>
    setSearchParams(currentSearchParams => ({
      ...Object.fromEntries(currentSearchParams),
      [PAGE_PARAM_KEY]: newPage,
    }));

  // Fall back to the first page when the page param is present but invalid (e.g. 0 or negative)
  useEffect(() => {
    if (pageStr !== null && !isValidPage) {
      setSearchParams(
        currentSearchParams => ({
          ...Object.fromEntries(currentSearchParams),
          [PAGE_PARAM_KEY]: String(FIRST_PAGE),
        }),
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
  const isDemoLoggedIn = useDemo(state => state.loggedIn);
  const isNewPreview =
    chainId === ChainId.BSC_MAINNET && isNewMode && isDemoLoggedIn && isDemoAddress(accountAddress);
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

    return [allOption, ...otherOptions];
  }, [t, poolData, liquidityHubs, isLiquidityHubFeatureEnabled, isNewPreview]);

  // Reset contract address filter if the value in the URL is incorrect
  useEffect(() => {
    if (!sourceSelectOptions.find(option => option.value === selectedContractAddress)) {
      setSearchParams(currentSearchParams => {
        currentSearchParams.delete(CONTRACT_ADDRESS_PARAM_KEY);

        return Object.fromEntries(currentSearchParams);
      });
    }
  }, [selectedContractAddress, sourceSelectOptions, setSearchParams]);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewTransactions = useMemo(
    () =>
      isNewPreview && accountAddress && poolData
        ? getNewPreviewTransactions({ accountAddress, pools: poolData.pools })
        : [],
    [isNewPreview, accountAddress, poolData],
  );
  const filteredPreviewTransactions = previewTransactions.filter(transaction => {
    const matchesType =
      selectedTxType === ALL_OPTION_VALUE || transaction.txType === selectedTxType;
    const matchesSource =
      selectedContractAddress === ALL_OPTION_VALUE ||
      (selectedContractAddress === 'trade'
        ? 'cycleId' in transaction
        : transaction.contractAddress.toLowerCase() === selectedContractAddress.toLowerCase());

    return matchesType && matchesSource;
  });
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

  return (
    <div ref={containerRef} className="dashboard-transactions grid grid-cols-1 gap-4">
      {accountAddress && (
        <div className="flex flex-row gap-3 md:gap-4">
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
        </div>
      )}

      {isNewPreview && transactionsCount > 0 && (
        <p className="dashboard-preview-label text-sm text-grey">
          {t('account.transactions.previewData')}
        </p>
      )}

      <TransactionsList
        transactions={transactions}
        isLoading={isLoading}
        isPreview={isNewPreview}
        glowFrame={isNewMode}
      />

      {!isLoading && (
        <Pagination
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
