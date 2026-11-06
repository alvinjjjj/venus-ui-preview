import { useGetPrimeCurrentCycle } from 'clients/api';
import { Icon, Page, Tabs } from 'components';
import { useBreakpointUp } from 'hooks/responsive';
import type { Tab } from 'hooks/useTabs';
import { useTranslation } from 'libs/translations';
import { useEffect } from 'react';

import { EndOfCycle } from './EndOfCycle';
import { Hero } from './Hero';
import { RankingPanel } from './RankingPanel';
import { RefreshNote } from './RefreshNote';
import { RewardsPanel } from './RewardsPanel';
import { useRefreshOnNewCycle } from './useRefreshOnNewCycle';
import './preview.css';

const PrimeLeaderboard: React.FC = () => {
  const { t } = useTranslation();
  const isSideBySide = useBreakpointUp('2xl');
  const { data: currentCycle, isLoading: isCurrentCycleLoading } = useGetPrimeCurrentCycle();

  useRefreshOnNewCycle();

  // Side by side, the summary cards of both panels share one height (the tallest
  // card's content), so the two table headers ("Wallet …") sit on the same line.
  useEffect(() => {
    if (!isSideBySide) return;
    const cards = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.venus-prime-page .bg-background-active'));
    const sync = () => {
      const list = cards();
      list.forEach(card => card.style.removeProperty('min-height'));
      const tallest = Math.max(0, ...list.map(card => card.getBoundingClientRect().height));
      list.forEach(card => card.style.setProperty('min-height', `${tallest}px`));
    };
    const observer = new ResizeObserver(() => requestAnimationFrame(sync));
    const mutation = new MutationObserver(() => {
      observer.disconnect();
      cards().forEach(card => observer.observe(card));
      requestAnimationFrame(sync);
    });
    const root = document.querySelector('.venus-prime-page');
    if (root) mutation.observe(root, { childList: true, subtree: true });
    cards().forEach(card => observer.observe(card));
    sync();
    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [isSideBySide]);

  const endOfCycleDate = currentCycle?.cycle?.endsAt;
  const currentCycleIndex = currentCycle?.cycle?.cycleIndex;
  const lastCycleIndex = currentCycleIndex !== undefined ? currentCycleIndex - 1 : undefined;

  const tabs: Tab[] = [
    {
      id: 'rewards',
      title: (
        <span className="flex items-center gap-x-1">
          <Icon name="medal" className="size-5 text-inherit" />

          {t('primeLeaderboard.tabs.rewards')}
        </span>
      ),
      content: (
        <div className="space-y-3">
          <RefreshNote />

          <RewardsPanel />
        </div>
      ),
    },
    {
      id: 'ranking',
      title: (
        <span className="flex items-center gap-x-1">
          <Icon name="trophy" className="size-5 text-inherit" />

          {t('primeLeaderboard.tabs.ranking')}
        </span>
      ),
      content: (
        <div className="space-y-3">
          <RefreshNote />

          <RankingPanel />
        </div>
      ),
    },
  ];

  return (
    <Page>
      <div className="venus-prime-page">
      <div
        aria-hidden
        className="venus-prime-hero-glow pointer-events-none absolute left-1/2 top-[200px] aspect-square w-[1200px] max-w-[150vw] -translate-x-1/2 -translate-y-1/2 bg-[url('/images/prime-leaderboard-bg.webp')] bg-contain bg-center bg-no-repeat"
      />

      <Hero />

      <EndOfCycle
        endDate={endOfCycleDate}
        lastCycleIndex={lastCycleIndex}
        isLoading={isCurrentCycleLoading}
        className="relative mx-auto mt-8 w-full max-w-[467px]"
      />

      {isSideBySide ? (
        <div className="relative mt-10 space-y-3">
          <RefreshNote />

          <div className="flex gap-3">
            <div className="min-w-0 grow">
              <RewardsPanel />
            </div>

            <div className="w-107 shrink-0">
              <RankingPanel />
            </div>
          </div>
        </div>
      ) : (
        <Tabs
          className="relative mt-10 space-y-3"
          variant="tertiary"
          headerClassName="justify-center"
          tabs={tabs}
        />
      )}
      </div>
    </Page>
  );
};

export default PrimeLeaderboard;
