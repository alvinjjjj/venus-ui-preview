import BigNumber from 'bignumber.js';
import type { LiteAsset } from './data';

export const earnCategories = ['All', 'Venus Core', 'Liquidity Hub'] as const;
export type EarnCategory = (typeof earnCategories)[number];

export function filterEarnCategory(rows: LiteAsset[], category: EarnCategory) {
  if (category === 'All') return rows;
  return rows.flatMap(row => {
    const markets = row.markets.filter(market =>
      category === 'Venus Core' ? !!market.asset : !!market.hub,
    );
    if (!markets.length) return [];
    return [
      {
        ...row,
        markets,
        ...Object.fromEntries(
          (['supply', 'supplyUsd', 'liquidity', 'liquidityUsd'] as const).map(field => [
            field,
            markets.reduce((sum, market) => sum.plus(market[field]), new BigNumber(0)),
          ]),
        ),
      },
    ];
  });
}

export function formatEarnApyRange(row: LiteAsset) {
  const rates = row.markets.map(market => market.apy).filter(rate => rate.isFinite());
  if (!rates.length) return '—';
  const low = BigNumber.minimum(...rates).toFixed(2);
  const high = BigNumber.maximum(...rates).toFixed(2);
  return low === high ? `${low}%` : `${low}%–${high}%`;
}

export function matchesEarnCategories(row: LiteAsset, selected: string[]) {
  if (!selected.length) return true;
  const tags = row.markets.flatMap(market => {
    const tag = market.asset?.marketCategory?.tag ?? market.asset?.category;
    return tag ? [tag] : [];
  });
  return (tags.length ? tags : ['others']).some(tag => selected.includes(tag));
}
