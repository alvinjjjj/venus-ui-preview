import { Table, type TableProps } from 'components/Table';
import './market-table.css';

/** Asset and source views keep the same table geometry and numeric hierarchy. */
export function LiteMarketTable<R>(props: TableProps<R>) {
  return <Table {...props} data-lite-market-table="true" />;
}
