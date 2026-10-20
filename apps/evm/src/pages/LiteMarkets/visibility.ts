import type { Asset, EModeGroup } from 'types';
import { isAssetPaused } from 'utilities/isAssetPaused';
import { areTokensEqual } from 'utilities/areTokensEqual';
import type { LiteAsset } from './data';

// Match MarketTable's warning and Isolated indicators without changing source data.
export function isRestrictedLiteAsset(asset: Asset, groups: EModeGroup[]) {
  return (
    isAssetPaused({ disabledTokenActions: asset.disabledTokenActions }) ||
    (asset.collateralFactor === 0 &&
      !asset.isBorrowable &&
      groups.some(
        group =>
          group.isIsolated &&
          group.assetSettings.some(settings => areTokensEqual(settings.vToken, asset.vToken)),
      ))
  );
}

export function isVisibleLiteAsset(row: LiteAsset, groups: EModeGroup[]) {
  // The supplied 2026-10-20 production screenshot flags lisUSD, but the local
  // September snapshot predates that warning. Keep this exception display-only.
  const screenshotFlagged =
    row.token.chainId === 56 &&
    row.token.address.toLowerCase() === '0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5';
  return (
    !screenshotFlagged &&
    !row.token.symbol.toLowerCase().startsWith('vh') &&
    !row.markets.some(market => market.asset && isRestrictedLiteAsset(market.asset, groups))
  );
}
