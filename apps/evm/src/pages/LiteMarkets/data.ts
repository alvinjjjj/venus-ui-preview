import BigNumber from 'bignumber.js';
import { type Asset, type LiquidityHub, type Token, type Vault, VaultCategory, type VenusVault } from 'types';
import { convertMantissaToTokens } from 'utilities';
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
  /** Core market whose underlying is a Liquidity Hub vhToken (Lite selector: vhToken or underlying). */
  vhHub?: LiquidityHub;
  /** Lite Earn: XVS Vault next to Venus Core under XVS (opens the XVS Vault supply modal). */
  vault?: VenusVault;
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

export function aggregateLiteAssets(
  assets: Asset[],
  hubs: LiquidityHub[],
  comptroller: string,
  vaults: Vault[] = [],
) {
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
    const vhHub = hubs.find(
      hub => hub.vhToken.address.toLowerCase() === asset.vToken.underlyingToken.address.toLowerCase(),
    );
    add(asset.vToken.underlyingToken, {
      asset,
      vhHub,
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
        name: 'Liquidity Hub',
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
  // XVS Vault (governance staking) as a second XVS source, like FE's Lite Earn.
  const xvsVault = vaults.find(
    vault => vault.category === VaultCategory.GOVERNANCE && vault.stakedToken.symbol === 'XVS',
  ) as VenusVault | undefined;
  const xvsAsset = assets.find(asset => asset.vToken.underlyingToken.symbol === 'XVS');
  if (xvsVault) {
    add(xvsAsset?.vToken.underlyingToken ?? xvsVault.stakedToken, {
      vault: xvsVault,
      id: `vault-${xvsVault.key}`,
      name: 'XVS Vault',
      path: '/vaults',
      apy: new BigNumber(xvsVault.stakeAprPercentage),
      supply: convertMantissaToTokens({ value: xvsVault.stakeBalanceMantissa, token: xvsVault.stakedToken }),
      supplyUsd: new BigNumber(xvsVault.stakeBalanceCents),
      liquidity: new BigNumber(0),
      liquidityUsd: new BigNumber(0),
    });
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
