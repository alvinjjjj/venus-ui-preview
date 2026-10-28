import type { Ref } from 'react';
import { Icon, TokenIcon } from 'components';
import type { Token } from 'types';
import './market-breadcrumb.css';

interface LiteMarketBreadcrumbProps {
  mode: 'Earn' | 'Borrow';
  token: Token;
  onBackToAssets: () => void;
  onBackToSources?: () => void;
  marketName?: string;
  backButtonRef?: Ref<HTMLButtonElement>;
}

/** One mobile path for both the source list and its existing market form. */
export function LiteMarketBreadcrumb({
  mode,
  token,
  onBackToAssets,
  onBackToSources,
  marketName,
  backButtonRef,
}: LiteMarketBreadcrumbProps) {
  const isMarket = !!marketName && !!onBackToSources;
  const backLabel = isMarket
    ? mode === 'Earn'
      ? 'Back to Earn sources'
      : `Back to ${token.symbol} borrowing markets`
    : `Back to ${mode} assets from ${token.symbol}`;
  const tokenLabel = (
    <>
      <span aria-hidden="true" className="inline-flex">
        <TokenIcon token={token} className="lite-breadcrumb-token-icon size-4 shrink-0" />
      </span>
      <span>{token.symbol}</span>
    </>
  );

  return (
    <nav
      className="lite-market-breadcrumb"
      aria-label={`${mode} navigation`}
      data-market-depth={isMarket ? 'form' : 'sources'}
    >
      <button
        ref={backButtonRef}
        type="button"
        className="lite-market-breadcrumb-back"
        aria-label={backLabel}
        onClick={isMarket ? onBackToSources : onBackToAssets}
      >
        <Icon name="chevronLeft" className="size-4" />
      </button>
      <ol className="lite-market-breadcrumb-items" role="list">
        <li>
          <button type="button" onClick={onBackToAssets}>{mode}</button>
        </li>
        <li>
          <span aria-hidden="true">/</span>
          {isMarket ? (
            <button
              type="button"
              className="lite-market-breadcrumb-token"
              aria-label={`Back to ${token.symbol} ${mode} markets`}
              onClick={onBackToSources}
            >
              {tokenLabel}
            </button>
          ) : (
            <span className="lite-market-breadcrumb-token" aria-current="page">
              {tokenLabel}
            </span>
          )}
        </li>
        {isMarket && (
          <li>
            <span aria-hidden="true">/</span>
            <span className="lite-market-breadcrumb-current" aria-current="page">{marketName}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
