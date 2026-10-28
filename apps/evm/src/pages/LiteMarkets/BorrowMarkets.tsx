import { useEffect, useState } from 'react';
import {
  AssetApy,
  MultiSelect,
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
import { useGlassPreview } from 'demo/GlassVersions/store';
import type { LiteAsset } from './data';
import { BorrowSources } from './BorrowSources';
import { LiteMarketAction } from './LiteMarketAction';
import { LiteMarketAmount } from './LiteMarketAmount';
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
  experimental = false,
  mobile = false,
  modeSwitch,
  selected,
  onSelect: setSelected,
}: {
  rows: LiteAsset[];
  loading: boolean;
  ready: boolean;
  experimental?: boolean;
  mobile?: boolean;
  modeSwitch?: React.ReactNode;
  selected?: string;
  onSelect: (address: string | undefined) => void;
}) {
  const isE2 = useGlassPreview(state => (state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy'));
  const isLegacyE2 = useGlassPreview(state => state.mode === 'lite-experiment-v2-legacy');
  const [search, setSearch] = useState('');
  const [tokenFilter, setTokenFilter] = useState<string[]>([]);
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
      (tokenFilter.length === 0 || tokenFilter.includes(asset.vToken.address)) &&
      asset.vToken.underlyingToken.symbol.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const columns: TableColumn<Asset>[] = [
    {
      key: 'loan',
      label: mobile ? 'Asset' : 'Loan',
      selectOptionLabel: 'Loan',
      renderCell: asset => (
        <button
          type="button"
          className={`text-left cursor-pointer ${isE2 ? 'font-normal' : 'font-semibold'} hover:text-blue focus-visible:outline-2 focus-visible:outline-blue`}
          aria-label={`Compare ${asset.vToken.underlyingToken.symbol} borrowing`}
          onClick={() => setSelected(asset.vToken.address)}
        >
          <TokenIconWithSymbol
            token={asset.vToken.underlyingToken}
            size="xl"
          />
        </button>
      ),
    },
    {
      key: 'apy',
      label: 'APY',
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: asset => <AssetApy asset={asset} type="borrow" className={isE2 ? 'lite-base-apy lite-borrow-apy' : undefined} />,
      sortRows: (a, b, direction) =>
        (borrowApy(a).comparedTo(borrowApy(b)) ?? 0) * (direction === 'asc' ? 1 : -1),
    },
    ...(['liquidity', 'borrow'] as const).map(field => ({
      key: field,
      label: field === 'borrow' ? 'Total Borrow' : 'Liquidity',
      selectOptionLabel: field === 'borrow' ? 'Total Borrow' : 'Liquidity',
      align: 'right' as const,
      sortRows: (a: Asset, b: Asset, direction: 'asc' | 'desc') =>
        (a[field === 'borrow' ? 'borrowBalanceCents' : 'liquidityCents'].comparedTo(
          b[field === 'borrow' ? 'borrowBalanceCents' : 'liquidityCents'],
        ) ?? 0) * (direction === 'asc' ? 1 : -1),
      renderCell: (asset: Asset) => (
        <LiteMarketAmount
          value={formatTokensToReadableValue({
            value: field === 'borrow' ? asset.borrowBalanceTokens : asset.cashTokens,
            token: asset.vToken.underlyingToken,
            addSymbol: false,
          })}
          usdValue={formatCentsToReadableValue({
            value: field === 'borrow' ? asset.borrowBalanceCents : asset.liquidityCents,
          })}
          symbol={asset.vToken.underlyingToken.symbol}
          liquidity={field === 'liquidity'}
        />
      ),
    })),
    ...(isLegacyE2 ? [{
      key: 'borrowAction',
      label: <span className="sr-only">Action</span>,
      selectOptionLabel: 'Action',
      align: 'right' as const,
      renderCell: (asset: Asset, rowIndex: number) => (
        <LiteMarketAction
          action="Borrow"
          promoted={rowIndex === 0}
          symbol={asset.vToken.underlyingToken.symbol}
          onSelect={() => setSelected(asset.vToken.address)}
        />
      ),
    }] : []),
  ];

  return (
    <div className={experimental ? 'lite-experiment-earn' : undefined}>
      <div className={experimental ? `lite-experiment-scroll${active ? ` lite-borrow-sources${isE2 ? ' lite-e2-borrow-sources' : ''}` : isE2 ? ' lite-e2-asset-list lite-e2-borrow-list' : ''}` : undefined}
        data-loading={experimental && loading && !active ? 'true' : undefined}
        role={experimental ? 'region' : undefined}
        aria-label={experimental ? 'Borrow markets, scroll for more assets' : undefined}
        tabIndex={experimental ? 0 : undefined}>
      {active ? (
        <BorrowSources mobile={mobile} experimental={experimental} asset={active} rows={rows} onBack={() => setSelected(undefined)} />
      ) : (
        <Table
          data={ready ? filtered : []}
          key={mobile ? 'mobile' : 'desktop'}
          className={mobile ? 'lite-mobile-table' : undefined}
          columns={mobile ? columns.slice(0, 2) : columns}
          rowKeyExtractor={asset => asset.vToken.address}
          rowOnClick={(_, asset) => setSelected(asset.vToken.address)}
          initialOrder={{ orderBy: columns[mobile ? 1 : 3], orderDirection: 'desc' }}
          tableLayout="auto"
          breakpoint={mobile ? undefined : 'md'}
          hideCardDelimiter
          isFetching={loading}
          placeholder={
            loading
              ? undefined
              : !ready
                ? 'Market data is unavailable. Please refresh to try again.'
                : 'No borrowable assets found.'
          }
          header={
            <div className={experimental ? 'lite-market-toolbar' : undefined}>
            {modeSwitch}
            <div className={experimental ? 'lite-experiment-controls' : 'flex flex-col gap-3 sm:flex-row sm:items-center'}>
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
              <MultiSelect
                className="lite-loan-filter w-full sm:w-60 shrink-0"
                placeholder={mobile ? 'Filter' : 'All loan assets'}
                title="Loan assets"
                resetLabel="All loan assets"
                renderCount={count => mobile ? `Filter (${count})` : `${count} loan assets`}
                value={tokenFilter}
                onChange={setTokenFilter}
                options={[
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
            </div>
          }
        />
      )}
      </div>
    </div>
  );
}
