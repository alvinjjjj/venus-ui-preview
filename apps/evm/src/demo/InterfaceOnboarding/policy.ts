import { routes } from 'constants/routing';

export type InterfaceIntroduction = 'lite' | 'pro';
export type DocumentEntryType = 'navigate' | 'reload' | 'back_forward';

export const INTRODUCTION_SEEN_KEYS = {
  lite: 'venus-interface-intro-lite-seen-v1',
  // v1 presented Pro after leaving Lite. That is not the cross-version invitation.
  pro: 'venus-interface-intro-pro-seen-v2',
} as const;

const proPagePrefixes = new Set(
  [
    routes.markets,
    routes.liquidityHubs,
    routes.spoke,
    routes.dashboard,
    routes.port,
    routes.vaults,
    routes.governance,
    routes.primeCalculator,
    routes.primeLeaderboard,
    routes.swap,
    routes.vai,
    routes.bridge,
    routes.stats,
    routes.trade,
  ].map(route => route.path.split('/')[1]),
);

export const isProPage = (pathname: string) =>
  proPagePrefixes.has(pathname.toLowerCase().split('/')[1]);

// Legacy product links redirect to a canonical Pro page before showing a card.
export const isProEntryPath = (pathname: string) =>
  isProPage(pathname) || /^\/(account|staking|pool)(\/|$)/i.test(pathname);

export const getDocumentEntryType = (): DocumentEntryType => {
  const entry = performance.getEntriesByType?.('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type === 'reload' || entry?.type === 'back_forward' ? entry.type : 'navigate';
};

export const getAutomaticIntroduction = ({
  pathname,
  mode,
  transition,
  directEntry,
}: {
  pathname: string;
  mode: InterfaceIntroduction;
  transition: unknown;
  directEntry: boolean;
}): InterfaceIntroduction | null => {
  if (!directEntry || transition === 'introduction-switch') return null;
  if (transition === 'introduction-preview' || transition === 'lite-to-pro') return null;
  if (pathname === '/' && mode === 'lite') return 'pro';
  // An explicit Lite Dashboard is an account page, not an external Pro arrival.
  if (pathname === routes.dashboard.path && mode === 'lite') return null;
  return isProPage(pathname) ? 'lite' : null;
};

type IntroductionStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const createIntroductionHistory = (
  getStorage: () => IntroductionStorage = () => window.localStorage,
) => {
  const shownInThisDocument = new Set<InterfaceIntroduction>();
  return {
    hasSeen: (variant: InterfaceIntroduction) => {
      if (shownInThisDocument.has(variant)) return true;
      try {
        if (getStorage().getItem(INTRODUCTION_SEEN_KEYS[variant]) === 'true') {
          shownInThisDocument.add(variant);
          return true;
        }
      } catch {
        // Storage may be unavailable. The in-memory record still prevents repeats.
      }
      return false;
    },
    markSeen: (variant: InterfaceIntroduction) => {
      shownInThisDocument.add(variant);
      try {
        getStorage().setItem(INTRODUCTION_SEEN_KEYS[variant], 'true');
      } catch {
        // Never block navigation because a preference cannot be persisted.
      }
    },
  };
};
