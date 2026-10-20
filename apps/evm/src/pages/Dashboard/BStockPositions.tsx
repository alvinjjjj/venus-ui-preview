import { Table, type TableColumn, Toggle, ProgressBar, InfoIcon } from 'components';
import BigNumber from 'bignumber.js';
import { Summary } from './Markets/Positions/Summary';
import qqqb from 'assets/img/spoke/qqqb.png';
import spyb from 'assets/img/spoke/spyb.png';
import spcxb from 'assets/img/spoke/spcxb.png';
import tslab from 'assets/img/spoke/tslab.png';
import type { Pool } from 'types';

type Position = {
  symbol: string;
  icon?: string;
  apy: string;
  balance: string;
  value: string;
  limit?: string;
};

// Display-only fixtures: no market links, collateral mutations or transaction forms.
export function BStockPositions({
  variant,
  corePool,
}: { variant: 'index' | 'growth'; corePool?: Pool }) {
  const supplied: Position[] =
    variant === 'index'
      ? [
          { symbol: 'QQQB', icon: qqqb, apy: '0%', balance: '2', value: '$400.00' },
          { symbol: 'SPYB', icon: spyb, apy: '0%', balance: '1', value: '$300.00' },
        ]
      : [
          { symbol: 'SPCXB', icon: spcxb, apy: '0%', balance: '2', value: '$300.00' },
          { symbol: 'TSLAB', icon: tslab, apy: '0%', balance: '1', value: '$400.00' },
        ];
  const borrowed: Position[] = [
    {
      symbol: 'USDT',
      icon: corePool?.assets.find(a => a.vToken.underlyingToken.symbol === 'USDT')?.vToken
        .underlyingToken.iconSrc,
      apy: variant === 'index' ? '4.26%' : '5.25%',
      balance: '100',
      value: '$100.00',
      limit: '28.57%',
    },
  ];
  const columns: TableColumn<Position>[] = [
    {
      key: 'asset',
      label: 'Asset',
      selectOptionLabel: 'Asset',
      renderCell: row => (
        <span className="inline-flex items-center gap-3 font-normal">
          {row.icon && <img src={row.icon} alt="" className="size-8 rounded-full" />}
          {row.symbol}
        </span>
      ),
    },
    {
      key: 'apy',
      label: (
        <span className="inline-flex items-center gap-2">
          APY <InfoIcon tooltip="Annual percentage yield" />
        </span>
      ),
      selectOptionLabel: 'APY',
      align: 'right',
      renderCell: row => row.apy,
    },
    {
      key: 'balance',
      label: 'Balance',
      selectOptionLabel: 'Balance',
      align: 'right',
      renderCell: row => (
        <div className="tabular-nums">
          <p data-layered-value="primary">{row.balance}</p>
          <p data-layered-value="secondary">{row.value}</p>
        </div>
      ),
    },
  ];
  const summaryPool = corePool
    ? {
        ...corePool,
        vai: undefined,
        userHealthFactor: 4.2,
        userSupplyBalanceCents: new BigNumber(70000),
        userBorrowBalanceCents: new BigNumber(10000),
        userBorrowBalanceProtectedCents: new BigNumber(10000),
        userBorrowLimitCents: new BigNumber(35000),
        userBorrowLimitProtectedCents: new BigNumber(35000),
        userLiquidationThresholdCents: new BigNumber(42000),
        userYearlyEarningsCents: new BigNumber(variant === 'index' ? -426 : -525),
        assets: [],
      }
    : undefined;
  return (
    <div className="space-y-6">
      {summaryPool && <Summary pool={summaryPool} displayHealthFactor displayAccountHealth />}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Table
          title="Supplied"
          className="dashboard-position-table pt-4 sm:pt-4"
          data={supplied}
          columns={[
            ...columns,
            {
              key: 'collateral',
              label: 'Collateral',
              selectOptionLabel: 'Collateral',
              align: 'right',
              renderCell: row => (
                <Toggle
                  aria-label={`${row.symbol} collateral`}
                  className="py-1"
                  value
                  onChange={() => {}}
                  disabled
                />
              ),
            },
          ]}
          rowKeyExtractor={row => row.symbol}
          breakpoint="sm"
        />
        <Table
          title="Borrowed"
          className="dashboard-position-table pt-4 sm:pt-4"
          data={borrowed}
          columns={[
            ...columns,
            {
              key: 'limit',
              label: '% of limit',
              selectOptionLabel: '% of limit',
              align: 'right',
              renderCell: row => (
                <div className="flex items-center justify-start sm:justify-end [&>:first-of-type]:mr-2">
                  <span>{row.limit}</span>
                  <ProgressBar
                    min={0}
                    max={100}
                    progressBars={[{ value: Number.parseFloat(row.limit ?? '0') }]}
                    className="w-13"
                  />
                </div>
              ),
            },
          ]}
          rowKeyExtractor={row => row.symbol}
          breakpoint="sm"
        />
      </div>
    </div>
  );
}
