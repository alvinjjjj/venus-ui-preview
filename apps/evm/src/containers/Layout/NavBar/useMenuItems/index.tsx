import { routes } from 'constants/routing';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useAccountAddress } from 'libs/wallet';

import liquidityHubIconSrc from 'assets/img/liquidityHubIcon.svg';
import vaultsIconSrc from 'assets/img/vaultsIcon.svg';
import venusCoreIconSrc from 'assets/img/venusCoreIcon.png';
import venusSpokeIconSrc from 'assets/img/venusSpokeIcon.png';
import { VENUS_FLUX_URL } from 'constants/production';
import { useGetMarketsPagePath } from 'hooks/useGetMarketsPagePath';
import { useTranslation } from 'libs/translations';
import { useHubAssets } from 'pages/Landing/VenusSteps/useTopHub';
import { formatPercentageToReadableValue } from 'utilities';
import type { MenuItem, SubMenu } from '../types';

export const useDashboardMenuItem = (): MenuItem => {
  const { t } = useTranslation();

  return {
    to: routes.dashboard.path,
    label: t('layout.menu.dashboard.label'),
  };
};

export const useMenuItems = () => {
  const { t } = useTranslation();
  const { accountAddress } = useAccountAddress();
  const vaiRouteEnabled = useIsFeatureEnabled({ name: 'vaiRoute' });
  const bridgeRouteEnabled = useIsFeatureEnabled({ name: 'bridgeRoute' });
  const statsRouteEnabled = useIsFeatureEnabled({ name: 'statsRoute' });
  const tradeRouteEnabled = useIsFeatureEnabled({ name: 'trade' });
  const primeLeaderboardEnabled = useIsFeatureEnabled({ name: 'primeLeaderboard' });
  const liquidityHubEnabled = useIsFeatureEnabled({ name: 'liquidityHub' });
  const { marketsPagePath } = useGetMarketsPagePath();
  // PM trial: the best live Liquidity Hub APY, as a bare figure ("3.54%"), replaces "New" on Earn
  // and on the Liquidity Hub item inside the dropdown, in every preview mode. Borrow carries
  // no header tag in any mode (Venus Spoke keeps its own "New" inside the dropdown).
  const topHubApy = useHubAssets().assets[0]?.apy;
  const apyTagLabel =
    topHubApy === undefined ? undefined : formatPercentageToReadableValue(topHubApy);
  const earnTagLabel = apyTagLabel ?? t('layout.menu.new');
  const liquidityHubTagLabel = apyTagLabel ?? t('layout.menu.new');

  const menu: Array<MenuItem | SubMenu> = [];

  const borrowSubMenu: SubMenu = {
    label: t('layout.menu.borrow.label'),
    variant: 'secondary',
    items: [
      {
        to: marketsPagePath,
        imgSrc: venusCoreIconSrc,
        label: t('layouts.menu.markets.venusCore.label'),
        description: t('layouts.menu.markets.venusCore.description'),
      },
      {
        to: routes.spoke.path,
        imgSrc: venusSpokeIconSrc,
        label: t('layouts.menu.markets.venusSpoke.label'),
        tagLabel: t('layout.menu.new'),
        description: t('layouts.menu.markets.venusSpoke.description'),
      },
    ],
  };

  if (liquidityHubEnabled) {
    menu.push(
      {
        label: t('layout.menu.earn.label'),
        variant: 'secondary',
        tagLabel: earnTagLabel,
        items: [
          {
            to: routes.liquidityHubs.path,
            imgSrc: liquidityHubIconSrc,
            label: t('layouts.menu.markets.liquidityHub.label'),
            tagLabel: liquidityHubTagLabel,
            description: t('layouts.menu.markets.liquidityHub.description'),
          },
          {
            to: routes.vaults.path,
            imgSrc: vaultsIconSrc,
            label: t('layouts.menu.markets.vaults.label'),
            description: t('layouts.menu.markets.vaults.description'),
          },
        ],
      },
      borrowSubMenu,
    );
  } else {
    menu.push(borrowSubMenu, {
      to: routes.vaults.path,
      label: t('layout.menu.vaults.label'),
    });
  }

  const othersSubMenuItems: MenuItem[] = [
    {
      to: routes.governance.path,
      iconName: 'market',
      label: t('layout.menu.others.governance.label'),
      description: t('layout.menu.others.governance.description'),
    },
  ];

  if (vaiRouteEnabled) {
    othersSubMenuItems.push({
      to: routes.vai.path,
      iconName: 'vaiOutline',
      label: t('layout.menu.others.vai.label'),
      description: t('layout.menu.others.vai.description'),
    });
  }

  if (bridgeRouteEnabled) {
    othersSubMenuItems.push({
      to: routes.bridge.path,
      iconName: 'bridge',
      label: t('layout.menu.others.bridge.label'),
      description: t('layout.menu.others.bridge.description'),
    });
  }

  if (accountAddress) {
    othersSubMenuItems.push({
      to: routes.port.path,
      iconName: 'download',
      label: t('layout.menu.others.port.label'),
      description: t('layout.menu.others.port.description'),
    });
  }

  if (primeLeaderboardEnabled) {
    menu.push({
      to: routes.primeLeaderboard.path,
      label: t('layout.menu.prime.label'),
    });
  }

  // Flux sits in the top bar (external site) instead of inside the Borrow menu.
  menu.push({
    href: VENUS_FLUX_URL,
    label: 'Flux',
  });

  if (statsRouteEnabled) {
    othersSubMenuItems.push({
      to: routes.stats.path,
      iconName: 'stats',
      label: t('layout.menu.others.stats.label'),
      description: t('layout.menu.others.stats.description'),
    });
  }

  if (tradeRouteEnabled) {
    othersSubMenuItems.push({
      to: routes.trade.path,
      iconName: 'trade',
      label: t('layout.menu.others.trade.label'),
      description: t('layout.menu.others.trade.description'),
      tagLabel: t('layout.menu.beta'),
    });
  }

  menu.push({
    label: t('layout.menu.others.label'),
    items: othersSubMenuItems,
  });

  return menu;
};
