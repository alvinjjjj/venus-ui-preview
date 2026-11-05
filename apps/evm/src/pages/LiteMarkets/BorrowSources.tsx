import { useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  AssetApy,
  Icon,
  MultiSelect,
  type TableColumn,
  TextField,
  TokenIcon,
  Tooltip,
} from 'components';
import type { Asset } from 'types';
import getCombinedApy from 'utilities/getCombinedApy';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import qqqb from 'assets/img/spoke/qqqb.png';
import spyb from 'assets/img/spoke/spyb.png';
import spcxb from 'assets/img/spoke/spcxb.png';
import tslab from 'assets/img/spoke/tslab.png';
import nvdab from 'assets/img/spoke/nvdab.png';
import skhyb from 'assets/img/spoke/skhyb.png';
import type { LiteAsset } from './data';
import { BorrowSourceModal } from './BorrowSourceModal';
import { CollateralPicker } from './CollateralPicker';
import { LiteMarketTable } from './LiteMarketTable';
import { LiteMarketBreadcrumb } from './LiteMarketBreadcrumb';
import { LiteMarketAmount } from './LiteMarketAmount';
import { useGlassPreview } from 'demo/GlassVersions/store';

type Collateral = { symbol: string; iconSrc?: string };
export type BorrowSource = {
  name: string;
  apy?: number;
  liquidity?: number;
  borrowed?: number;
  collateral: Collateral[];
};
type SortableBorrowSource = BorrowSource & {
  sortApy: BigNumber;
  sortLiquidity: BigNumber;
  sortBorrowed: BigNumber;
};

// User-requested layout fixtures only. Never pass these into a transaction form.
const mockSources: BorrowSource[] = [
  {
    name: 'bStock index',
    apy: 4.26,
    liquidity: 4140000,
    borrowed: 5140000,
    collateral: [
      { symbol: 'QQQB', iconSrc: qqqb },
      { symbol: 'SPYB', iconSrc: spyb },
    ],
  },
  {
    name: 'bStock growth',
    apy: 5.25,
    liquidity: 3140000,
    borrowed: 6640000,
    collateral: [
      { symbol: 'SPCXB', iconSrc: spcxb },
      { symbol: 'TSLAB', iconSrc: tslab },
    ],
  },
  {
    name: 'bStock bluechips',
    apy: 3.66,
    liquidity: 1140000,
    borrowed: 15760000,
    collateral: [
      { symbol: 'NVDAB', iconSrc: nvdab },
      { symbol: 'SKHYB', iconSrc: skhyb },
    ],
  },
  { name: 'BPN', apy: 6, liquidity: 132400, borrowed: 2100000, collateral: [{ symbol: 'BPN' }] },
];

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
  const isE2 = useGlassPreview(state => (state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy'));
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const showMobileCollateralColumn = mobile && isFinal;
  const [search, setSearch] = useState('');
  const [openedSource, setOpenedSource] = useState<BorrowSource>();
  const [pickerSource, setPickerSource] = useState<BorrowSource>();
  const [initialCollateral, setInitialCollateral] = useState<string>();
  const openSource = (source: BorrowSource, collateral?: string) => {
    setInitialCollateral(collateral);
    setOpenedSource(source);
  };
  const [collateralFilter, setCollateralFilter] = useState<string[]>([]);
  const token = asset.vToken.underlyingToken;
  const coreCollateral = rows
    .filter(row => row.markets.some(m => m.asset && m.asset.collateralFactor > 0))
    .map(row => ({ symbol: row.token.symbol, iconSrc: row.token.iconSrc }));
  const sources: BorrowSource[] = [
    { name: 'Venus Core', collateral: coreCollateral },
    ...mockSources,
  ];
  // Resolve live Core values on each render so sorting follows refreshed data.
  const sortableSources: SortableBorrowSource[] = sources.map(source => ({
    ...source,
    sortApy: source.apy === undefined
      ? getCombinedApy({
          type: 'borrow',
          baseApyPercentage: asset.borrowApyPercentage,
          tokenDistributions: asset.borrowTokenDistributions,
        }).totalApyPercentage
      : new BigNumber(source.apy),
    sortLiquidity: source.liquidity === undefined
      ? asset.liquidityCents
      : new BigNumber(source.liquidity).times(asset.tokenPriceCents),
    sortBorrowed: source.borrowed === undefined
      ? asset.borrowBalanceCents
      : new BigNumber(source.borrowed).times(asset.tokenPriceCents),
  }));
  const collateralOptions = [
    ...new Map(sources.flatMap(source => source.collateral).map(c => [c.symbol, c])).values(),
  ];
  const filtered = sortableSources.filter(
    source =>
      source.collateral.some(collateral => collateral.symbol.toLowerCase().includes(search.trim().toLowerCase())) &&
      (collateralFilter.length === 0 || source.collateral.some(c => collateralFilter.includes(c.symbol))),
  );
  const renderAmount = (source: BorrowSource, field: 'liquidity' | 'borrowed') => {
    const value =
      source[field] === undefined
        ? field === 'liquidity'
          ? asset.cashTokens
          : asset.borrowBalanceTokens
        : new BigNumber(source[field]!);
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
  const renderCollateralButton = (source: BorrowSource, showLabel = false) => (
    <button
      type="button"
      className="lite-mobile-collateral-trigger"
      aria-label={`View ${source.name} collaterals`}
      aria-haspopup="dialog"
      onClick={event => { event.stopPropagation(); setPickerSource(source); }}
    >
      {showLabel && <span>Collateral</span>}
      <span className="inline-flex items-center -space-x-1">
        {source.collateral.slice(0, 3).map(item => item.iconSrc
          ? <img key={item.symbol} src={item.iconSrc} alt={item.symbol} className="size-5 rounded-full" />
          : <span key={item.symbol}>{item.symbol}</span>)}
      </span>
      {source.collateral.length > 3 && <span>+{source.collateral.length - 3}</span>}
    </button>
  );
  const columns: TableColumn<SortableBorrowSource>[] = [
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
          aria-description={mobile && isE2 && source.apy !== undefined ? 'Preview market. Transactions unavailable.' : undefined}
          className="font-normal hover:text-blue cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
        >
          {mobile ? <span>{source.name}</span> : source.name}
          {mobile && isE2 && !isFinal && source.apy !== undefined && <span className="lite-e2-preview-source-label">Preview · Not tradable</span>}
        </button>
        {!mobile && isE2 && !isFinal && source.apy !== undefined && <span className="lite-e2-preview-source-label">Preview · Not tradable</span>}
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
          <AssetApy asset={asset} type="borrow" className={isE2 ? 'lite-e2-source-apy lite-borrow-apy' : undefined} />
        ) : (
          <span className={isE2 ? 'lite-e2-source-apy tabular-nums' : 'tabular-nums'}>{source.apy}%</span>
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
      renderCell: source => showMobileCollateralColumn ? renderCollateralButton(source) : (
        <div className="flex justify-end items-center gap-1">
          <div className="flex items-center -space-x-2">
            {source.collateral.slice(0, 3).map(item => (
              <span key={item.symbol} className="relative shrink-0">
                <Tooltip content={item.symbol}>
                  {item.iconSrc ? (
                    <img src={item.iconSrc} alt={item.symbol} className="size-6 rounded-full" />
                  ) : (
                    <span className="text-sm text-light-grey">{item.symbol}</span>
                  )}
                </Tooltip>
              </span>
            ))}
          </div>
          {source.collateral.length > 3 && (
            <Tooltip
              content={source.collateral
                .slice(3)
                .map(c => c.symbol)
                .join(', ')}
            >
              <span className="text-xs text-light-grey">+{source.collateral.length - 3}</span>
            </Tooltip>
          )}
        </div>
      ),
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
  if (mobile && openedSource) {
    return <BorrowSourceModal
      inline
      asset={asset}
      source={openedSource}
      rows={rows}
      initialCollateralSymbol={initialCollateral}
      onBackAssets={onBack}
      onClose={() => setOpenedSource(undefined)}
    />;
  }
  return (
    <>
      <LiteMarketTable
        key={mobile ? 'mobile' : 'desktop'}
        className={mobile ? `lite-mobile-table lite-mobile-source-table${showMobileCollateralColumn ? ' lite-mobile-borrow-source-table' : ''}` : undefined}
        data={filtered}
        columns={showMobileCollateralColumn ? [columns[0], columns[3], columns[1]] : mobile ? columns.slice(0, 2) : columns}
        initialOrder={{ orderBy: columns[mobile ? 1 : 4], orderDirection: 'desc' }}
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
            <div className={experimental ? 'lite-experiment-controls' : 'flex flex-col gap-3 sm:flex-row sm:items-center'}>
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
                title="Collaterals"
                resetLabel="All collaterals"
                renderCount={count => mobile ? `Filter (${count})` : `${count} collaterals`}
                value={collateralFilter}
                onChange={setCollateralFilter}
                options={collateralOptions.map(item => ({
                  value: item.symbol,
                  label: <CollateralLabel item={item} />,
                }))}
              />
            </div>
            {modeSwitch}
          </div>
        }
      />
      {pickerSource && <CollateralPicker
        source={pickerSource}
        rows={rows}
        onClose={() => setPickerSource(undefined)}
        onSelect={choice => { openSource(pickerSource, choice.symbol); setPickerSource(undefined); }}
      />}
      {openedSource && (
        <BorrowSourceModal
          asset={asset}
          source={openedSource}
          rows={rows}
          onClose={() => setOpenedSource(undefined)}
        />
      )}
    </>
  );
}
