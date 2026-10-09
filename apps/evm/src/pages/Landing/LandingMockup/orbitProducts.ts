// New (split Section 2): the orbit shows Venus products instead of tokens. Each satellite
// slot keeps its sphere colour and takes a product; the centre sphere is Venus Core.
import { VENUS_FLUX_URL } from 'constants/production';
import { routes } from 'constants/routing';
import fluxMark from './assets/product-flux.svg';
import hubMark from './assets/product-hub.svg';
import primeMark from './assets/product-prime.svg';
import spokeMark from './assets/product-spoke.svg';
import tradeMark from './assets/product-trade.svg';
import vaultMark from './assets/product-vault.svg';
import type { orbitBrandMarks } from './orbitBrands';

export interface OrbitProduct {
  name: string;
  mark: string;
  /** In-app route; `href` is used for products that live on another site. */
  to?: string;
  href?: string;
}

const CORE_POOL = '0xfD36E2c2a6789Db23113685031d7F16329158384';

export const orbitCoreProduct: OrbitProduct = {
  name: 'Venus Core',
  mark: '',
  to: `/markets/${CORE_POOL}`,
};

export const orbitProducts: Record<keyof typeof orbitBrandMarks, OrbitProduct> = {
  USDC: { name: 'Liquidity Hub', mark: hubMark, to: routes.liquidityHubs.path },
  BNB: { name: 'Vaults', mark: vaultMark, to: routes.vaults.path },
  USDT: { name: 'Venus Spoke', mark: spokeMark, to: routes.spoke.path },
  ETH: { name: 'Venus Flux', mark: fluxMark, href: VENUS_FLUX_URL },
  BTC: { name: 'Prime', mark: primeMark, to: routes.primeLeaderboard.path },
  U: { name: 'Trade', mark: tradeMark, to: routes.trade.path },
};
