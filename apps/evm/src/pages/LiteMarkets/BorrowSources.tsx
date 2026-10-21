import { useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  AssetApy,
  Icon,
  Select,
  Table,
  type TableColumn,
  TextField,
  TokenIcon,
  Tooltip,
} from 'components';
import type { Asset } from 'types';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import qqqb from 'assets/img/spoke/qqqb.png';
import spyb from 'assets/img/spoke/spyb.png';
import spcxb from 'assets/img/spoke/spcxb.png';
import tslab from 'assets/img/spoke/tslab.png';
import nvdab from 'assets/img/spoke/nvdab.png';
import skhyb from 'assets/img/spoke/skhyb.png';
import type { LiteAsset } from './data';
import { BorrowSourceModal } from './BorrowSourceModal';

type Collateral = { symbol: string; iconSrc?: string };
export type BorrowSource = {
  name: string;
  apy?: number;
  liquidity?: number;
  borrowed?: number;
  collateral: Collateral[];
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
}: {
  asset: Asset;
  rows: LiteAsset[];
  onBack: () => void;
  experimental?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [openedSource, setOpenedSource] = useState<BorrowSource>();
  const [collateralFilter, setCollateralFilter] = useState('');
  const token = asset.vToken.underlyingToken;
  const coreCollateral = rows
    .filter(row => row.markets.some(m => m.asset && m.asset.collateralFactor > 0))
    .map(row => ({ symbol: row.token.symbol, iconSrc: row.token.iconSrc }));
  const sources: BorrowSource[] = [
    { name: 'Venus Core', collateral: coreCollateral },
    ...mockSources,
  ];
  const collateralOptions = [
    ...new Map(sources.flatMap(source => source.collateral).map(c => [c.symbol, c])).values(),
  ];
  const filtered = sources.filter(
    source =>
      source.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!collateralFilter || source.collateral.some(c => c.symbol === collateralFilter)),
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
      <div className="tabular-nums">
        {formatTokensToReadableValue({ value, token })}
        <p className="text-light-grey">{formatCentsToReadableValue({ value: cents })}</p>
      </div>
    );
  };
  const columns: TableColumn<BorrowSource>[] = [
    {
      key: 'yield',
      label: 'Yield',
      selectOptionLabel: 'Yield',
      renderCell: source => (
        <button
          type="button"
          onClick={() => setOpenedSource(source)}
          aria-haspopup="dialog"
          className="font-normal hover:text-blue cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
        >
          {source.name}
        </button>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: source =>
        source.apy === undefined ? (
          <AssetApy asset={asset} type="borrow" />
        ) : (
          <span className="tabular-nums">{source.apy}%</span>
        ),
    },
    {
      key: 'liquidity',
      label: 'Liquidity',
      selectOptionLabel: 'Liquidity',
      align: 'right',
      renderCell: source => renderAmount(source, 'liquidity'),
    },
    {
      key: 'collateral',
      label: 'Collateral',
      selectOptionLabel: 'Collateral',
      align: 'right',
      renderCell: source => (
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
      renderCell: source => renderAmount(source, 'borrowed'),
    },
  ];
  return (
    <>
      <Table
        data={filtered}
        columns={columns}
        rowKeyExtractor={source => source.name}
        rowOnClick={(_, source) => setOpenedSource(source)}
        tableLayout="auto"
        breakpoint="md"
        hideCardDelimiter
        placeholder="No markets match these filters."
        header={
          <div className={experimental ? 'lite-borrow-source-header' : 'space-y-5'}>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-light-grey hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-blue"
            >
              <Icon name="chevronLeft" className="size-4 text-inherit" />
              <span>Borrow /</span>
              <TokenIcon token={token} size="md" className="size-4" />
              {token.symbol}
            </button>
            <div className={experimental ? 'lite-experiment-controls' : 'flex flex-col gap-3 sm:flex-row sm:items-center'}>
              <TextField
                aria-label="Search borrowing markets"
                placeholder="Search market"
                size="sm"
                inputContainerClassName="venus-market-search-surface"
                leftIconSrc="magnifier"
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="sm:max-w-75"
              />
              <Select
                className="lite-loan-filter w-full sm:w-60 shrink-0"
                buttonClassName="rounded-lg h-12"
                dropdownClassName="lite-loan-options"
                optionClassName="px-4 h-12 font-normal"
                value={collateralFilter}
                onChange={value => setCollateralFilter(String(value))}
                options={[
                  { value: '', label: 'All collaterals' },
                  ...collateralOptions.map(item => ({
                    value: item.symbol,
                    label: <CollateralLabel item={item} />,
                  })),
                ]}
              />
            </div>
          </div>
        }
      />
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
