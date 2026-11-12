import BigNumber from 'bignumber.js';
import {
  AssetApy,
  Dropdown,
  Icon,
  MultiSelect,
  type TableColumn,
  TextField,
  TokenIcon,
} from 'components';
import { useTranslation } from 'libs/translations';
import { useState } from 'react';
import type { Asset } from 'types';
import {
  type BorrowSource,
  type Collateral,
  getBorrowSourceMetrics,
  getBorrowSources,
} from './borrow-data';
import { useLiteFlow } from './useLiteFlow';
export type { BorrowSource } from './borrow-data';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import { BorrowSourceModal } from './BorrowSourceModal';
import { CollateralPicker } from './CollateralPicker';
import { LiteMarketAmount } from './LiteMarketAmount';
import { LiteMarketBreadcrumb } from './LiteMarketBreadcrumb';
import { LiteMarketTable } from './LiteMarketTable';
import './collateral-preview.css';
import type { LiteAsset } from './data';

function CollateralLabel({ item }: { item: Collateral }) {
  return (
    <span className="inline-flex items-center gap-2 font-normal">
      {item.iconSrc && <img src={item.iconSrc} alt="" className="size-5 rounded-full" />}
      {item.symbol}
    </span>
  );
}

export function BorrowSources({
  asset,
  rows,
  onBack,
  experimental = false,
  mobile = false,
  modeSwitch,
}: {
  asset: Asset;
  rows: LiteAsset[];
  onBack: () => void;
  experimental?: boolean;
  mobile?: boolean;
  modeSwitch?: React.ReactNode;
}) {
  const isE2 = useGlassPreview(
    state => state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy',
  );
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const showMobileCollateralColumn = mobile && isFinal;
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [sourceName, setSourceName] = useLiteFlow('borrowSource');
  const setOpenedSource = (source?: BorrowSource) => setSourceName(source?.name);
  const [pickerSource, setPickerSource] = useState<BorrowSource>();
  const [initialCollateral, setInitialCollateral] = useState<string>();
  const openSource = (source: BorrowSource, collateral?: string) => {
    setInitialCollateral(collateral);
    setOpenedSource(source);
  };
  const [collateralFilter, setCollateralFilter] = useState<string[]>([]);
  const token = asset.vToken.underlyingToken;
  const sources = getBorrowSources(asset, rows);
  const sortableSources = sources.map(source => {
    const metric = getBorrowSourceMetrics(asset, source);
    return {
      ...source,
      sortApy: metric.apy,
      sortLiquidity: metric.liquidityCents,
      sortBorrowed: metric.borrowedCents,
    };
  });
  const collateralOptions = [
    ...new Map(sources.flatMap(source => source.collateral).map(c => [c.symbol, c])).values(),
  ];
  const filtered = sortableSources.filter(
    source =>
      source.collateral.some(collateral =>
        collateral.symbol.toLowerCase().includes(search.trim().toLowerCase()),
      ) &&
      (collateralFilter.length === 0 ||
        source.collateral.some(c => collateralFilter.includes(c.symbol))),
  );
  const renderAmount = (source: BorrowSource, field: 'liquidity' | 'borrowed') => {
    const value =
      source[field] === undefined
        ? field === 'liquidity'
          ? asset.cashTokens
          : asset.borrowBalanceTokens
        : new BigNumber(source[field] ?? 0);
    const cents =
      source[field] === undefined
        ? field === 'liquidity'
          ? asset.liquidityCents
          : asset.borrowBalanceCents
        : value.multipliedBy(asset.tokenPriceCents);
    return (
      <LiteMarketAmount
        value={formatTokensToReadableValue({ value, token, addSymbol: false })}
        usdValue={formatCentsToReadableValue({ value: cents })}
        symbol={token.symbol}
      />
    );
  };
  const renderCollateralTrigger = (
    source: BorrowSource,
    showLabel: boolean,
    onOpen: () => void,
    expanded?: boolean,
  ) => (
    <button
      type="button"
      className="lite-mobile-collateral-trigger"
      aria-label={`View ${source.name} collaterals`}
      aria-haspopup={isFinal && !mobile ? 'true' : 'dialog'}
      aria-expanded={expanded}
      onClick={event => {
        event.stopPropagation();
        onOpen();
      }}
    >
      {showLabel && <span>Collateral</span>}
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span className="inline-flex items-center -space-x-1">
          {source.collateral
            .slice(0, 3)
            .map(item =>
              item.iconSrc ? (
                <img
                  key={item.symbol}
                  src={item.iconSrc}
                  alt={item.symbol}
                  className="size-5 rounded-full"
                />
              ) : (
                <span key={item.symbol}>{item.symbol}</span>
              ),
            )}
        </span>
        {source.collateral.length > 3 && <span>+{source.collateral.length - 3}</span>}
      </span>
    </button>
  );
  const renderCollateralButton = (source: BorrowSource, showLabel = false) =>
    isFinal && !mobile ? (
      <Dropdown
        className="lite-collateral-preview-anchor inline-flex align-middle"
        menuClassName="lite-collateral-preview-panel"
        menuPosition="right"
        menuPlacement="top"
        optionsDom={({ setIsDropdownOpen }) => (
          <CollateralPicker
            compact
            source={source}
            rows={rows}
            onClose={() => setIsDropdownOpen(false)}
            onSelect={choice => {
              setIsDropdownOpen(false);
              openSource(source, choice.symbol);
            }}
          />
        )}
      >
        {({ isDropdownOpen, handleToggleDropdown }) =>
          renderCollateralTrigger(source, showLabel, handleToggleDropdown, isDropdownOpen)
        }
      </Dropdown>
    ) : (
      renderCollateralTrigger(source, showLabel, () => setPickerSource(source))
    );
  const columns: TableColumn<(typeof sortableSources)[number]>[] = [
    {
      key: 'yield',
      label: 'Market',
      selectOptionLabel: 'Market',
      sortRows: (a, b, direction) => a.name.localeCompare(b.name) * (direction === 'asc' ? 1 : -1),
      renderCell: source => (
        <div className={isE2 ? 'lite-e2-source-name' : undefined}>
          <button
            type="button"
            onClick={() => openSource(source)}
            aria-haspopup={mobile ? undefined : 'dialog'}
            aria-label={mobile ? source.name : undefined}
            className="font-normal hover:text-blue cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
          >
            {mobile ? <span>{source.name}</span> : source.name}
            {mobile && isE2 && !isFinal && source.apy !== undefined && (
              <span className="lite-e2-preview-source-label">Preview · Not tradable</span>
            )}
          </button>
          {!mobile && isE2 && !isFinal && source.apy !== undefined && (
            <span className="lite-e2-preview-source-label">Preview · Not tradable</span>
          )}
          {mobile && !showMobileCollateralColumn && renderCollateralButton(source, true)}
        </div>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      sortRows: (a, b, direction) =>
        (a.sortApy.comparedTo(b.sortApy) ?? 0) * (direction === 'asc' ? 1 : -1),
      renderCell: source => (
        <div className="lite-source-apy">
          <div className="lite-source-apy-value">
            {source.apy === undefined ? (
              <AssetApy
                asset={asset}
                type="borrow"
                className={isE2 ? 'lite-e2-source-apy lite-borrow-apy' : undefined}
              />
            ) : (
              <span className={isE2 ? 'lite-e2-source-apy tabular-nums' : 'tabular-nums'}>
                {source.apy}%
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'liquidity',
      label: 'Liquidity',
      selectOptionLabel: 'Liquidity',
      align: 'right',
      sortRows: (a, b, direction) =>
        (a.sortLiquidity.comparedTo(b.sortLiquidity) ?? 0) * (direction === 'asc' ? 1 : -1),
      renderCell: source => renderAmount(source, 'liquidity'),
    },
    {
      key: 'collateral',
      label: 'Collateral',
      selectOptionLabel: 'Collateral',
      align: showMobileCollateralColumn ? 'center' : 'right',
      sortRows: (a, b, direction) =>
        (a.collateral.length - b.collateral.length || a.name.localeCompare(b.name)) *
        (direction === 'asc' ? 1 : -1),
      renderCell: source => renderCollateralButton(source),
    },
    {
      key: 'borrow',
      label: 'Total Borrow',
      selectOptionLabel: 'Total Borrow',
      align: 'right',
      sortRows: (a, b, direction) =>
        (a.sortBorrowed.comparedTo(b.sortBorrowed) ?? 0) * (direction === 'asc' ? 1 : -1),
      renderCell: source => renderAmount(source, 'borrowed'),
    },
  ];
  const selectedSource =
    sources.find(source => source.name === sourceName) ??
    (sources.length === 1 ? sources[0] : undefined);
  const closeSource = () => (sources.length === 1 ? onBack() : setOpenedSource(undefined));
  if (mobile && selectedSource) {
    return (
      <BorrowSourceModal
        inline
        asset={asset}
        source={selectedSource}
        rows={rows}
        initialCollateralSymbol={initialCollateral}
        onBackAssets={onBack}
        onClose={closeSource}
      />
    );
  }
  return (
    <>
      <LiteMarketTable
        key={mobile ? 'mobile' : 'desktop'}
        className={
          mobile
            ? `lite-mobile-table lite-mobile-source-table${
                showMobileCollateralColumn ? ' lite-mobile-borrow-source-table' : ''
              }`
            : undefined
        }
        data={filtered}
        columns={
          showMobileCollateralColumn
            ? [columns[0], columns[3], columns[1]]
            : mobile
              ? columns.slice(0, 2)
              : columns
        }
        initialOrder={{ orderBy: columns[1], orderDirection: 'asc' }}
        rowKeyExtractor={source => source.name}
        rowOnClick={(_, source) => openSource(source)}
        tableLayout="auto"
        breakpoint={mobile ? undefined : 'md'}
        hideCardDelimiter
        placeholder="No markets match these filters."
        header={
          <div className={experimental ? 'lite-borrow-source-header' : 'space-y-5'}>
            {mobile ? (
              <LiteMarketBreadcrumb mode="Borrow" token={token} onBackToAssets={onBack} />
            ) : (
              <button
                type="button"
                onClick={onBack}
                aria-label={`Back to Borrow assets from ${token.symbol}`}
                className="inline-flex items-center gap-2 text-sm text-light-grey hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
              >
                <Icon name="chevronLeft" className="size-4 text-inherit" />
                <span>Borrow /</span>
                <TokenIcon token={token} size="md" className="lite-breadcrumb-token-icon size-4" />
                {token.symbol}
              </button>
            )}
            <div
              className={
                experimental
                  ? 'lite-experiment-controls'
                  : 'flex flex-col gap-3 sm:flex-row sm:items-center'
              }
            >
              <TextField
                aria-label="Search collateral"
                placeholder="Search collateral"
                size="sm"
                inputContainerClassName="venus-market-search-surface"
                leftIconSrc="magnifier"
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="sm:max-w-75"
              />
              <MultiSelect
                className="lite-loan-filter w-full sm:w-60 shrink-0"
                placeholder={mobile ? 'Filter' : 'All collaterals'}
                title="Select collaterals"
                searchPlaceholder={t('lite.filters.searchCollateral')}
                resetLabel={t('vault.filter.reset')}
                renderCount={count => (mobile ? `Filter (${count})` : `${count} collaterals`)}
                value={collateralFilter}
                onChange={setCollateralFilter}
                options={collateralOptions.map(item => ({
                  value: item.symbol,
                  searchText: item.symbol,
                  label: <CollateralLabel item={item} />,
                }))}
              />
            </div>
            {modeSwitch}
          </div>
        }
      />
      {pickerSource && (
        <CollateralPicker
          source={pickerSource}
          rows={rows}
          onClose={() => setPickerSource(undefined)}
          onSelect={choice => {
            openSource(pickerSource, choice.symbol);
            setPickerSource(undefined);
          }}
        />
      )}
      {selectedSource && (
        <BorrowSourceModal
          asset={asset}
          source={selectedSource}
          initialCollateralSymbol={initialCollateral}
          rows={rows}
          onClose={closeSource}
        />
      )}
    </>
  );
}
