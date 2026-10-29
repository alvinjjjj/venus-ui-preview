import type { Tx, TxType } from 'types';

/** Selections within a filter are ORed; transaction type and source are ANDed. */
export const matchesTransactionFilters = (
  transaction: Tx,
  { types = [], sources = [] }: { types?: readonly TxType[]; sources?: readonly string[] },
) =>
  (types.length === 0 || types.includes(transaction.txType)) &&
  (sources.length === 0 ||
    sources.some(source =>
      source === 'trade'
        ? 'cycleId' in transaction
        : transaction.contractAddress.toLowerCase() === source.toLowerCase(),
    ));
