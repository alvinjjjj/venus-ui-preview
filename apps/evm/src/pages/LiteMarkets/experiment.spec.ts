import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import type { LiteAsset, LiteMarket } from './data';
import { filterEarnCategory, formatEarnApyRange, matchesEarnCategories } from './experiment';

const market = (apy: number, source: 'asset' | 'hub'): LiteMarket =>
  ({
    id: source,
    name: source,
    path: '/',
    [source]: {},
    apy: new BigNumber(apy),
    supply: new BigNumber(10),
    supplyUsd: new BigNumber(1000),
    liquidity: new BigNumber(5),
    liquidityUsd: new BigNumber(500),
  }) as LiteMarket;
const row = {
  markets: [market(2.71, 'asset'), market(2.98, 'hub')],
  supply: new BigNumber(15),
} as LiteAsset;

describe('Lite E earn categories and APY range', () => {
  it('uses asset categories without classifying a matching hub as Others', () => {
    const stable = {
      ...row,
      markets: [{ ...row.markets[0], asset: { category: 'stablecoins' } }, row.markets[1]],
    } as LiteAsset;
    expect(matchesEarnCategories(stable, ['stablecoins'])).toBe(true);
    expect(matchesEarnCategories(stable, ['others'])).toBe(false);
    expect(matchesEarnCategories(row, ['others'])).toBe(true);
    expect(matchesEarnCategories(stable, [])).toBe(true);
  });
  it('shows the actual minimum and maximum across markets', () => {
    expect(formatEarnApyRange(row)).toBe('2.71%–2.98%');
  });
  it('preserves aggregate overlap accounting in All', () => {
    expect(filterEarnCategory([row], 'All')[0]).toBe(row);
  });
  it('scopes the rates and totals to the selected source without mutating All', () => {
    const [hub] = filterEarnCategory([row], 'Liquidity Hub');
    expect(formatEarnApyRange(hub)).toBe('2.98%');
    expect(hub.supply.toNumber()).toBe(10);
    expect(row.markets).toHaveLength(2);
    expect(filterEarnCategory([hub], 'Venus Core')).toEqual([]);
  });
  it('handles unavailable rates', () => {
    expect(formatEarnApyRange({ ...row, markets: [] })).toBe('—');
  });
});
