import { usdt } from '__mocks__/models/tokens';
import { vUsdtCorePool } from '__mocks__/models/vTokens';
import BigNumber from 'bignumber.js';
import { NULL_ADDRESS } from 'constants/address';
import { ChainId, type TradeTx, type Tx } from 'types';
import { createTransactionsCsv } from '../createTransactionsCsv';

const transaction: TradeTx = {
  txType: 'positionOpened',
  hash: 'test-hash',
  blockNumber: '1',
  blockTimestamp: new Date('2026-11-03T10:00:00Z'),
  accountAddress: NULL_ADDRESS,
  contractAddress: NULL_ADDRESS,
  chainId: ChainId.BSC_MAINNET,
  cycleId: 'test-cycle',
};

it('exports every token amount without losing precision and converts cents to dollars', () => {
  const csv = createTransactionsCsv(
    [
      {
        ...transaction,
        amounts: [
          { token: usdt, amountTokens: new BigNumber('123456789.000001'), amountCents: 12345 },
          { token: usdt, amountTokens: new BigNumber('-2.5'), amountCents: -250 },
        ],
      },
    ],
    () => 'Opened',
  );
  expect(csv.startsWith('\uFEFF')).toBe(true);
  expect(csv).toContain(
    '"2026-11-03T10:00:00.000Z","Opened","Trade","USDT","123456789.000001","123.45","test-hash","56"',
  );
  expect(csv).toContain('"-2.5","-2.50"');
  expect(csv.trimEnd().split('\r\n')).toHaveLength(3);
});

it('quotes commas, quotes and newlines while treating formula prefixes as literal text', () => {
  const market: Tx = {
    ...transaction,
    txType: 'supply',
    poolName: '=SUM(1,2)',
    vToken: vUsdtCorePool,
    amounts: [
      { token: { ...usdt, symbol: '@token' }, amountTokens: new BigNumber(1), amountCents: 100 },
    ],
  };
  const csv = createTransactionsCsv([market], () => 'Supply, "quoted"\nlabel');
  expect(csv).toContain('"Supply, ""quoted""\nlabel"');
  expect(csv).toContain('"\'=SUM(1,2)"');
  expect(csv).toContain('"\'@token"');
});

it('keeps transactions without amounts and exports just a header for an empty result', () => {
  const csv = createTransactionsCsv([transaction], () => 'Opened');
  expect(csv).toContain('"Opened","Trade","","","","test-hash"');
  expect(
    createTransactionsCsv([], () => 'unused')
      .trimEnd()
      .split('\r\n'),
  ).toHaveLength(1);
});
