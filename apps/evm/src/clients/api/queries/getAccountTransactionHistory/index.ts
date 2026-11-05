import { isEmptyDemoAddress } from 'demo/state';
import { transactions as mockData } from '__mocks__/models/transactions';
import type { TxType } from 'types';
import { matchesTransactionFilters } from 'utilities/matchesTransactionFilters';
import type {
  GetAccountTransactionHistoryInput,
  GetAccountTransactionHistoryOutput,
} from './types';

export * from './types';

export const TX_TYPE_TO_API_FILTER: Record<TxType, number> = {
  supply: 0,
  borrow: 1,
  withdraw: 2,
  repay: 3,
  enterMarket: 4,
  exitMarket: 5,
  principalSupplied: 9,
  principalWithdrawn: 10,
  positionIncreased: 15,
  positionOpened: 16,
  positionReducedWithProfit: 18,
  positionReducedWithLoss: 19,
  positionClosedWithProfit: 20,
  positionClosedWithLoss: 21,
  profitConverted: 13,
  hubSupply: 39,
  hubWithdraw: 40,
  hubSupplyFromCollateral: 41,
};

export const getAccountTransactionHistory = async ({
  accountAddress,
  types,
  page = 0,
  sourceFilters,
  pageSize = 10,
}: GetAccountTransactionHistoryInput): Promise<GetAccountTransactionHistoryOutput> => {
  if (isEmptyDemoAddress(accountAddress)) return { transactions: [], count: 0 };
  const data = (mockData.transactions as GetAccountTransactionHistoryOutput['transactions']).filter(
    tx => matchesTransactionFilters(tx, { types, sources: sourceFilters }),
  );
  return { transactions: data.slice(page * pageSize, (page + 1) * pageSize), count: data.length };
};
