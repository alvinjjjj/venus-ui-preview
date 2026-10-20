import BigNumber from 'bignumber.js';
import type { Asset, LiquidityHub, Token } from 'types';
import getCombinedApy from 'utilities/getCombinedApy';

export interface LiteMarket {
  asset?: Asset;
  hub?: LiquidityHub;
  id: string;
  name: string;
  path: string;
  apy: BigNumber;
  supply: BigNumber;
  supplyUsd: BigNumber;
  liquidity: BigNumber;
  liquidityUsd: BigNumber;
}
export interface LiteAsset {
  key: string;
  token: Token;
  markets: LiteMarket[];
  supply: BigNumber;
  supplyUsd: BigNumber;
  liquidity: BigNumber;
  liquidityUsd: BigNumber;
}

export function aggregateLiteAssets(assets: Asset[], hubs: LiquidityHub[], comptroller: string) {
  const rows = new Map<string, LiteAsset>();
  const seen = new Set<string>();
  const add = (token: Token, market: LiteMarket, overlap?: Partial<LiteMarket>) => {
    const key = `${token.chainId}:${token.address.toLowerCase()}`;
    const sourceKey = `${key}:${market.id.toLowerCase()}`;
    if (seen.has(sourceKey)) return;
    seen.add(sourceKey);
    const row = rows.get(key) ?? {
      key,
      token,
      markets: [],
      supply: new BigNumber(0),
      supplyUsd: new BigNumber(0),
      liquidity: new BigNumber(0),
      liquidityUsd: new BigNumber(0),
    };
    row.markets.push(market);
    for (const field of ['supply', 'supplyUsd', 'liquidity', 'liquidityUsd'] as const) {
      row[field] = row[field].plus(
        BigNumber.maximum(0, market[field].minus(overlap?.[field] ?? 0)),
      );
    }
    rows.set(key, row);
  };
  const apy = (source: Asset | LiquidityHub) =>
    getCombinedApy({
      type: 'supply',
      baseApyPercentage: source.supplyApyPercentage,
      tokenDistributions: source.supplyTokenDistributions,
    }).totalApyPercentage;

  for (const asset of assets) {
    add(asset.vToken.underlyingToken, {
      asset,
      id: asset.vToken.address,
      name: 'Venus Core',
      path: `/markets/${comptroller}/${asset.vToken.address}`,
      apy: apy(asset),
      supply: asset.supplyBalanceTokens,
      supplyUsd: asset.supplyBalanceCents,
      liquidity: asset.cashTokens,
      liquidityUsd: asset.liquidityCents,
    });
  }
  for (const hub of hubs) {
    const token = hub.vhToken.underlyingToken;
    const matchingAssets = assets.filter(
      a =>
        a.vToken.underlyingToken.chainId === token.chainId &&
        a.vToken.underlyingToken.address.toLowerCase() === token.address.toLowerCase(),
    );
    const overlap = {
      supply: new BigNumber(0),
      supplyUsd: new BigNumber(0),
      liquidity: new BigNumber(0),
      liquidityUsd: new BigNumber(0),
    };
    for (const source of hub.yieldGroups.flatMap(group => group.sources)) {
      if (
        !matchingAssets.some(a => a.vToken.address.toLowerCase() === source.address.toLowerCase())
      )
        continue;
      overlap.supply = overlap.supply.plus(source.allocationTokens);
      overlap.supplyUsd = overlap.supplyUsd.plus(source.allocationCents);
      overlap.liquidity = overlap.liquidity.plus(source.liquidityTokens);
      overlap.liquidityUsd = overlap.liquidityUsd.plus(source.liquidityCents);
    }
    add(
      token,
      {
        hub,
        id: hub.vhToken.address,
        name: 'Liquidity Hub – Venus',
        path: `/liquidity-hubs/${hub.vhToken.address}`,
        apy: apy(hub),
        supply: hub.supplyBalanceTokens,
        supplyUsd: hub.supplyBalanceCents,
        liquidity: hub.liquidityTokens,
        liquidityUsd: hub.liquidityCents,
      },
      overlap,
    );
  }
  return [...rows.values()].sort(
    (a, b) =>
      BigNumber.maximum(...b.markets.map(m => m.apy)).comparedTo(
        BigNumber.maximum(...a.markets.map(m => m.apy)),
      ) ||
      b.supplyUsd.comparedTo(a.supplyUsd) ||
      a.key.localeCompare(b.key),
  );
}
