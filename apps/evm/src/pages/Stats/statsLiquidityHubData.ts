/** Illustrative design data. Replace this adapter with the Venus liquidity hub API. */
export type LiquidityHubAsset = 'USDT' | 'USDC' | 'U';

export interface LiquidityHubCollateral {
  symbol: string;
  allocationUsd: number;
}

export interface LiquidityHubAllocation {
  id: string;
  name: string;
  allocatedUsd: number;
  availableUsd: number;
  collateral: LiquidityHubCollateral[];
}

export interface LiquidityHubOperation {
  id: string;
  eventDate: string;
  action: string;
  from: string;
  fromValue: string;
  to: string;
  toValue: string;
  transaction: string;
}

export interface LiquidityHubAssetData {
  history: { date: string; supply: number; allocation: number; liquidity: number }[];
  totalSupplyUsd: number;
  totalAllocationUsd: number;
  totalLiquidityUsd: number;
  allocations: LiquidityHubAllocation[];
  operations: LiquidityHubOperation[];
}

const usdtAllocations: LiquidityHubAllocation[] = [
  {
    id: 'core',
    name: 'Venus core',
    allocatedUsd: 496_800_000,
    availableUsd: 109_200_000,
    collateral: [
      ['BTCB', 178],
      ['BNB', 121],
      ['USDT', 78],
      ['USDC', 57],
      ['ETH', 32],
      ['XVS', 18],
      ['wBNB', 5],
      ['FDUSD', 4],
      ['TUSD', 2],
      ['Other', 1.8],
    ].map(([symbol, millions]) => ({
      symbol: String(symbol),
      allocationUsd: Number(millions) * 1_000_000,
    })),
  },
  {
    id: 'spoke',
    name: 'Venus spoke',
    allocatedUsd: 318_400_000,
    availableUsd: 94_600_000,
    collateral: [
      ['USDC', 102],
      ['USDT', 76],
      ['BTCB', 58],
      ['ETH', 37],
      ['BNB', 23],
      ['XVS', 14],
      ['wBNB', 4],
      ['FDUSD', 2],
      ['TUSD', 1],
      ['Other', 1.4],
    ].map(([symbol, millions]) => ({
      symbol: String(symbol),
      allocationUsd: Number(millions) * 1_000_000,
    })),
  },
  {
    id: 'fixed-rate-vault',
    name: 'Fixed rate vault',
    allocatedUsd: 164_920_000,
    availableUsd: 66_080_000,
    collateral: [
      ['USDT', 57],
      ['USDC', 43],
      ['BTCB', 27],
      ['BNB', 17],
      ['ETH', 10],
      ['XVS', 7],
      ['wBNB', 1.8],
      ['FDUSD', 1],
      ['TUSD', 0.7],
      ['Other', 0.42],
    ].map(([symbol, millions]) => ({
      symbol: String(symbol),
      allocationUsd: Number(millions) * 1_000_000,
    })),
  },
];

const operations: LiquidityHubOperation[] = [
  [
    '2026-09-29    3:22 PM',
    'Reallocate',
    'Core pool',
    '1,000,000 USDT',
    'bStock Pool\nGold Pool\nRWA Pool',
    '800,000 USDT\n100,000 USDT\n100,000 USDT',
    '0xasdf...JHsj3g',
  ],
  [
    '2026-09-29    3:22 PM',
    'raiseYieldGroupCap',
    'Venus spoke',
    '10,000,000 USDT',
    'Venus spoke',
    '11,000,000 USDT',
    '0xaOsj4...Jd8Hk1',
  ],
  ['2026-09-29    3:22 PM', 'pauseHub', 'Liquidity hub - USDT', '', '', '', '0xaOsj4...Jd8Hk1'],
  ['2026-09-29    3:22 PM', 'pauseYieldGroup', 'Venus spoke', '', '', '', '0xaOsj4...Jd8Hk1'],
  [
    '2026-09-29    3:22 PM',
    'lowerMaxWithdrawalSize',
    'Liquidity hub - USDT',
    '10,000,000 USDT',
    'Liquidity hub - USDT',
    '900,000 USDT',
    '0xaOsj4...Jd8Hk1',
  ],
  [
    '2026-09-29    3:22 PM',
    'setOuterDepositQueue',
    'Venus core\nVenus Flux\nVenus spoke\nCentrifuge',
    '',
    'Venus core\nVenus spoke\nCentrifuge\nVenus Flux',
    '\n\nVenus Flux\n',
    '0xaOsj4...Jd8Hk1',
  ],
].map(([eventDate, action, from, fromValue, to, toValue, transaction], index) => ({
  id: `hub-operation-${index}`,
  eventDate,
  action,
  from,
  fromValue,
  to,
  toValue,
  transaction,
}));

const operationValue = (value: string, scale: number, asset: LiquidityHubAsset) =>
  value
    .replace(/\d[\d,]*(?= USDT)/g, amount =>
      Math.round(Number(amount.replaceAll(',', '')) * scale).toLocaleString('en-US'),
    )
    .replaceAll('USDT', asset);

const makeAssetData = (scale: number, asset: LiquidityHubAsset): LiquidityHubAssetData => ({
  // Illustrative monthly history for the design preview; final point matches the summary.
  history: [
    ['2026-04-30', 0.86, 0.82],
    ['2026-05-31', 0.91, 0.88],
    ['2026-06-30', 0.89, 0.85],
    ['2026-07-31', 0.95, 0.93],
    ['2026-08-31', 0.94, 0.91],
    ['2026-09-30', 1, 1],
  ].map(([date, supplyRatio, allocationRatio]) => {
    const supply = 1_250_000_000 * Number(supplyRatio) * scale;
    const allocation = 980_120_000 * Number(allocationRatio) * scale;
    return { date: String(date), supply, allocation, liquidity: supply - allocation };
  }),
  totalSupplyUsd: 1_250_000_000 * scale,
  totalAllocationUsd: 980_120_000 * scale,
  totalLiquidityUsd: 269_880_000 * scale,
  allocations: usdtAllocations.map(group => ({
    ...group,
    allocatedUsd: group.allocatedUsd * scale,
    availableUsd: group.availableUsd * scale,
    collateral: group.collateral.map(asset => ({
      ...asset,
      allocationUsd: asset.allocationUsd * scale,
    })),
  })),
  operations: operations.map(operation => ({
    ...operation,
    id: `${asset}-${operation.id}`,
    from: operation.from.replaceAll('USDT', asset),
    fromValue: operationValue(operation.fromValue, scale, asset),
    to: operation.to.replaceAll('USDT', asset),
    toValue: operationValue(operation.toValue, scale, asset),
  })),
});

export const liquidityHubPreviewData: Record<LiquidityHubAsset, LiquidityHubAssetData> = {
  USDT: makeAssetData(1, 'USDT'),
  USDC: makeAssetData(0.8, 'USDC'),
  U: makeAssetData(0.4, 'U'),
};
