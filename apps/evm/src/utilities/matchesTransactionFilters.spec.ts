import { transactions } from '__mocks__/models/transactions';
import { getAccountTransactionHistory } from 'clients/api/queries/getAccountTransactionHistory';
import { ChainId, type Tx } from 'types';
import { matchesTransactionFilters } from './matchesTransactionFilters';

const records = transactions.transactions as Tx[];

it('matches either selected source and type, excluding other types', () => {
  const sources = [...new Set(records.map(transaction => transaction.contractAddress))];
  const matches = records.filter(transaction =>
    matchesTransactionFilters(transaction, {
      types: ['supply', 'hubSupply'],
      sources,
    }),
  );
  expect(matches.map(transaction => transaction.txType)).toEqual(['hubSupply', 'supply']);
  expect(
    matchesTransactionFilters(records[0], { sources: [records[0].contractAddress.toUpperCase()] }),
  ).toBe(true);
});

it('filters the local history before paginating and counts the combined results', async () => {
  const input = {
    accountAddress: records[0].accountAddress,
    chainId: ChainId.BSC_TESTNET,
    pools: [],
    liquidityHubs: [],
    types: ['supply', 'hubSupply'] as const,
    sourceFilters: [...new Set(records.map(transaction => transaction.contractAddress))],
    pageSize: 1,
  };
  const first = await getAccountTransactionHistory({ ...input, page: 0 });
  const second = await getAccountTransactionHistory({ ...input, page: 1 });
  expect(first.count).toBe(2);
  expect(second.count).toBe(2);
  expect(first.transactions[0].txType).toBe('hubSupply');
  expect(second.transactions[0].txType).toBe('supply');
});
