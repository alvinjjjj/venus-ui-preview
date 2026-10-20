import { useEffect, useState } from 'react';
import {
  AssetApy,
  Select,
  Table,
  type TableColumn,
  TextField,
  TokenIcon,
  TokenIconWithSymbol,
} from 'components';
import { PAGE_CONTAINER_ID } from 'constants/layout';
import type { Asset } from 'types';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import getCombinedApy from 'utilities/getCombinedApy';
import type { LiteAsset } from './data';
import { BorrowSources } from './BorrowSources';
import './borrow-filter.css';

const borrowApy = (asset: Asset) =>
  getCombinedApy({
    type: 'borrow',
    baseApyPercentage: asset.borrowApyPercentage,
    tokenDistributions: asset.borrowTokenDistributions,
  }).totalApyPercentage;

export function BorrowMarkets({
  rows,
  loading,
  ready,
  selected,
  onSelect: setSelected,
}: {
  rows: LiteAsset[];
  loading: boolean;
  ready: boolean;
  selected?: string;
  onSelect: (address: string | undefined) => void;
}) {
  const [search, setSearch] = useState('');
  const [tokenFilter, setTokenFilter] = useState('');
  useEffect(() => {
    if (selected) document.getElementById(PAGE_CONTAINER_ID)?.scrollTo({ top: 0 });
  }, [selected]);
  const assets = rows.flatMap(row =>
    row.markets.flatMap(market =>
      market.asset?.isBorrowable && !market.asset.disabledTokenActions.includes('borrow')
        ? [market.asset]
        : [],
    ),
  );
  const active = assets.find(asset => asset.vToken.address === selected);
  const filtered = assets.filter(
    asset =>
      (!tokenFilter || asset.vToken.address === tokenFilter) &&
      asset.vToken.underlyingToken.symbol.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const columns: TableColumn<Asset>[] = [
    {
      key: 'loan',
      label: 'Loan',
      selectOptionLabel: 'Loan',
      renderCell: asset => (
        <button
          type="button"
          className="text-left cursor-pointer font-semibold hover:text-blue focus-visible:outline-2 focus-visible:outline-blue"
          aria-label={`Compare ${asset.vToken.underlyingToken.symbol} borrowing`}
          onClick={() => setSelected(asset.vToken.address)}
        >
          <TokenIconWithSymbol token={asset.vToken.underlyingToken} size="xl" />
        </button>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: asset => <AssetApy asset={asset} type="borrow" />,
      sortRows: (a, b, direction) =>
        (borrowApy(a).comparedTo(borrowApy(b)) ?? 0) * (direction === 'asc' ? 1 : -1),
    },
    ...(['liquidity', 'borrow'] as const).map(field => ({
      key: field,
      label: field === 'borrow' ? 'Total Borrow' : 'Liquidity',
      selectOptionLabel: field === 'borrow' ? 'Total Borrow' : 'Liquidity',
      align: 'right' as const,
      renderCell: (asset: Asset) => (
        <div className="tabular-nums">
          {formatTokensToReadableValue({
            value: field === 'borrow' ? asset.borrowBalanceTokens : asset.cashTokens,
            token: asset.vToken.underlyingToken,
          })}
          <p className="text-light-grey">
            {formatCentsToReadableValue({
              value: field === 'borrow' ? asset.borrowBalanceCents : asset.liquidityCents,
            })}
          </p>
        </div>
      ),
    })),
  ];

  return (
    <>
      {active ? (
        <BorrowSources asset={active} rows={rows} onBack={() => setSelected(undefined)} />
      ) : (
        <Table
          data={ready ? filtered : []}
          columns={columns}
          rowKeyExtractor={asset => asset.vToken.address}
          rowOnClick={(_, asset) => setSelected(asset.vToken.address)}
          initialOrder={{ orderBy: columns[1], orderDirection: 'asc' }}
          tableLayout="auto"
          breakpoint="md"
          hideCardDelimiter
          isFetching={loading}
          placeholder={
            !ready
              ? 'Market data is unavailable. Please refresh to try again.'
              : 'No borrowable assets found.'
          }
          header={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <TextField
                aria-label="Search loan assets"
                placeholder="Search asset"
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
                aria-label="Filter loan assets"
                value={tokenFilter}
                onChange={value => setTokenFilter(String(value))}
                options={[
                  { label: 'All loan assets', value: '' },
                  ...assets.map(asset => ({
                    label: (
                      <span className="inline-flex items-center gap-2 font-normal">
                        <TokenIcon token={asset.vToken.underlyingToken} size="md" />
                        {asset.vToken.underlyingToken.symbol}
                      </span>
                    ),
                    value: asset.vToken.address,
                  })),
                ]}
              />
            </div>
          }
        />
      )}
    </>
  );
}
