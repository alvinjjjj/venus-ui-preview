import BigNumber from 'bignumber.js';

import { NULL_ADDRESS } from 'constants/address';
import { ChainId, type Pool, type TradeTx, type Tx } from 'types';
import type { Address } from 'viem';

// Illustrative records for the New Dashboard demo account only.
export const getNewPreviewTransactions = ({
  accountAddress,
  pools,
}: {
  accountAddress: Address;
  pools: Pool[];
}): Tx[] => {
  const assets = pools.flatMap(pool => pool.assets);
  const usdtAsset = assets.find(asset => asset.vToken.underlyingToken.symbol === 'USDT');
  const bnbAsset = assets.find(asset =>
    ['WBNB', 'BNB'].includes(asset.vToken.underlyingToken.symbol),
  );

  if (!usdtAsset || !bnbAsset) {
    return [];
  }

  const usdt = usdtAsset.vToken.underlyingToken;
  const bnb = bnbAsset.vToken.underlyingToken;
  const base = {
    accountAddress,
    chainId: ChainId.BSC_MAINNET,
    contractAddress: NULL_ADDRESS,
  };
  const amount = (token: typeof usdt, amountTokens: string, amountCents: number) => ({
    token,
    amountTokens: new BigNumber(amountTokens),
    amountCents,
  });
  const trade = (
    txType: TradeTx['txType'],
    id: number,
    timestamp: string,
    amounts: TradeTx['amounts'],
  ): TradeTx => ({
    ...base,
    txType,
    hash: `preview-trade-${id}`,
    blockNumber: String(id),
    blockTimestamp: new Date(timestamp),
    cycleId: `preview-cycle-${id}`,
    amounts,
  });

  return [
    trade('positionClosedWithProfit', 5, '2026-10-12T11:25:00+08:00', [
      amount(bnb, '0.18', 10800),
      amount(usdt, '126.40', 12640),
      amount(usdt, '18.20', 1820),
    ]),
    trade('positionReducedWithProfit', 4, '2026-10-12T09:40:00+08:00', [
      amount(bnb, '0.08', 4800),
      amount(usdt, '55.60', 5560),
      amount(usdt, '5.60', 560),
    ]),
    trade('positionIncreased', 3, '2026-10-10T16:18:00+08:00', [
      amount(usdt, '85', 8500),
      amount(usdt, '76.50', 7650),
      amount(bnb, '0.12', 7200),
    ]),
    trade('positionOpened', 2, '2026-10-09T19:10:00+08:00', [
      amount(usdt, '150', 15000),
      amount(usdt, '135', 13500),
      amount(bnb, '0.22', 13200),
    ]),
    {
      ...base,
      contractAddress: usdtAsset.vToken.address,
      txType: 'repay',
      hash: 'preview-market-1',
      blockNumber: '1',
      blockTimestamp: new Date('2026-10-08T11:25:00+08:00'),
      poolName: pools.find(pool => pool.assets.includes(usdtAsset))?.name ?? 'Venus Core',
      vToken: usdtAsset.vToken,
      amounts: [amount(usdt, '25', 2500)],
    },
    trade('positionOpened', 1, '2026-10-05T14:35:00+08:00', [
      amount(usdt, '100', 10000),
      amount(usdt, '89.80', 8980),
      amount(bnb, '0.15', 9000),
    ]),
  ];
};
