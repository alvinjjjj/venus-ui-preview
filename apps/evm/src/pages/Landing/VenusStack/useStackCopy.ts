import { useTranslation } from 'libs/translations';

import type { StackLayerId } from './stackData';

export interface StackLayerCopy {
  name: string;
  body: string;
}

/**
 * Layer copy for the current site language. Keys are written out in full so
 * `yarn extract-translations` can find them.
 */
export const useStackCopy = (): Record<StackLayerId, StackLayerCopy> => {
  const { t } = useTranslation();

  return {
    chains: {
      name: t('landing.venusStack.chains.name'),
      body: t('landing.venusStack.chains.body'),
    },
    liquidityHub: {
      name: t('landing.venusStack.liquidityHub.name'),
      body: t('landing.venusStack.liquidityHub.body'),
    },
    spokes: {
      name: t('landing.venusStack.spokes.name'),
      body: t('landing.venusStack.spokes.body'),
    },
    borrowTrade: {
      name: t('landing.venusStack.borrowTrade.name'),
      body: t('landing.venusStack.borrowTrade.body'),
    },
    vaultsPrime: {
      name: t('landing.venusStack.vaultsPrime.name'),
      body: t('landing.venusStack.vaultsPrime.body'),
    },
    appSkills: {
      name: t('landing.venusStack.appSkills.name'),
      body: t('landing.venusStack.appSkills.body'),
    },
    governance: {
      name: t('landing.venusStack.governance.name'),
      body: t('landing.venusStack.governance.body'),
    },
  };
};
