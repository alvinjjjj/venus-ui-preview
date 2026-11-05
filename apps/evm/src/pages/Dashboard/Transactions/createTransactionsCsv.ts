import type { Tx, TxType } from 'types';

const csvCell = (value: string | number) => {
  let text = String(value);
  // Token/market names can come from outside the app. Keep spreadsheet
  // formula prefixes as literal text while preserving ordinary signed numbers.
  if (/^[=+\-@\t\r]/.test(text) && !/^-?\d+(?:\.\d+)?$/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

export const createTransactionsCsv = (
  transactions: readonly Tx[],
  getLabel: (type: TxType) => string,
) => {
  const rows: (string | number)[][] = [
    ['Date (UTC)', 'Transaction', 'Market', 'Token', 'Amount', 'Value (USD)', 'Hash', 'Chain ID'],
  ];
  for (const transaction of transactions) {
    const market =
      'poolName' in transaction
        ? transaction.poolName
        : 'vhToken' in transaction
          ? 'Liquidity Hub'
          : 'Trade';
    const amounts = transaction.amounts?.length ? transaction.amounts : [undefined];
    for (const amount of amounts) {
      rows.push([
        new Date(transaction.blockTimestamp).toISOString(),
        getLabel(transaction.txType),
        market,
        amount?.token.symbol ?? '',
        amount?.amountTokens.toFixed() ?? '',
        amount ? (amount.amountCents / 100).toFixed(2) : '',
        transaction.hash,
        transaction.chainId,
      ]);
    }
  }
  return `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
};
