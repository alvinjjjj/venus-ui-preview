import { useState } from 'react';
import BigNumber from 'bignumber.js';
import { TokenAmountLayout } from 'components/TokenTextField';
import { Button } from '@venusprotocol/ui';
import { Select, TokenIconWithSymbol, TokenTextField } from 'components';
import { ConnectWallet } from 'containers/ConnectWallet';
import { useAccountAddress } from 'libs/wallet';
import { MarketForm } from 'containers/MarketForm';
import { LiquidityHubForm } from 'containers/LiquidityHubForm';
import { GatedAssetAcknowledgementModal } from 'containers/GatedAssetAcknowledgementModal';
import { useChain } from 'hooks/useChain';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import type { LiteAsset } from './data';
import { TokenPlanets } from './TokenPlanets';
import { PromotedTokenFire } from './PromotedTokenFire';
import { formatEarnApyRange } from './experiment';

/** E3 composes the existing transaction forms; amounts and wallet logic remain owned by them. */
export function E3ActionCard({
  rows,
  loading,
  ready,
  onExplore,
}: {
  rows: LiteAsset[];
  loading: boolean;
  ready: boolean;
  onExplore: () => void;
}) {
  const { corePoolComptrollerContractAddress } = useChain();
  const [settings] = useUserChainSettings();
  const { accountAddress } = useAccountAddress();
  const actions = ['Supply', 'Withdraw', 'Borrow', 'Repay'] as const;
  const [action, setAction] = useState<'supply' | 'withdraw' | 'borrow' | 'repay'>('supply');
  const [assetKey, setAssetKey] = useState<string>();
  const [guestAmount, setGuestAmount] = useState({ assetKey: '', value: '' });
  const [marketId, setMarketId] = useState<string>();
  const [borrowSource, setBorrowSource] = useState<'core' | 'spoke'>('core');
  const positionRows = accountAddress && (action === 'withdraw' || action === 'repay')
    ? rows.map(item => ({ ...item, markets: item.markets.filter(source => action === 'withdraw'
      ? (source.asset?.userSupplyBalanceTokens ?? source.hub?.userSupplyBalanceTokens)?.gt(0)
      : source.asset?.userBorrowBalanceTokens.gt(0)) })).filter(item => item.markets.length > 0)
    : rows;
  const row =
    positionRows.find(item => item.key === assetKey) ??
    positionRows.find(item => item.token.symbol === 'USDC') ??
    positionRows[0] ?? rows[0];
  const isLoanAction = action === 'borrow' || action === 'repay';
  const selectedMarket = row?.markets.find(item => item.id === marketId) ?? row?.markets[0];
  const market = isLoanAction && !selectedMarket?.asset
    ? row?.markets.find(item => item.asset) ?? selectedMarket
    : selectedMarket;

  const assetSelector = row ? (
    <Select
      dropdownClassName="lite-e3-asset-options"
      buttonClassName={action === 'repay' ? 'lite-e3-asset-trigger' : 'lite-e3-inline-asset-trigger'}
      menuTitle={<div className="lite-e3-asset-menu-head"><span>{action === 'repay' ? 'Select loan to repay' : `Select asset to ${action}`}</span>{(action === 'supply' || action === 'borrow') && <span>{action === 'supply' ? 'Supply APY' : 'Borrow APY'}</span>}</div>}
      value={row.key}
      options={positionRows.map(item => ({
        value: item.key,
        label: ({ isRenderedInButton }: { isRenderedInButton: boolean }) => (
          <span className={isRenderedInButton ? "inline-flex items-center gap-1.5" : "lite-e3-asset-option-content"}>
            <span className="inline-flex items-center gap-1.5">
            <TokenIconWithSymbol token={item.token} />
            {item.token.symbol === 'USDC' && <PromotedTokenFire />}
            </span>
            {!isRenderedInButton && (action === 'supply' || action === 'borrow') && <span className="tabular-nums font-normal">{action === 'supply' ? formatEarnApyRange(item) : (() => { const rate = item.markets.find(source => source.asset)?.asset?.borrowApyPercentage; return rate?.isFinite() ? `${rate.toFixed(2)}%` : '—'; })()}</span>}
          </span>
        ),
      }))}
      onChange={value => {
        setAssetKey(String(value));
        setMarketId(undefined);
      }}
      size="small"
    />
  ) : undefined;
  const marketDetails =
    row && market ? (
      <div className="lite-e3-market-row lite-e3-market-comparison">
          <div className="lite-e3-market-options" role="group" aria-label={`Select ${action} market`}>
            {isLoanAction ? (['core', 'spoke'] as const).map(source => (
              <button
                key={source}
                type="button"
                className="lite-e3-market-option"
                aria-pressed={borrowSource === source}
                onClick={() => setBorrowSource(source)}
              >
                <span className="lite-e3-market-option-name">
                  <span className="lite-e3-market-indicator" aria-hidden="true" />
                  <span>{source === 'core' ? 'Core Pool' : 'Spoke Markets'}</span>
                </span>
                {source === 'core' && action === 'borrow' && <span className="lite-e3-market-option-rate"><strong>{market.asset?.borrowApyPercentage.isFinite() ? `${market.asset.borrowApyPercentage.toFixed(2)}%` : '—'}</strong></span>}
                {borrowSource === source && <span aria-hidden="true" className="venus-mode-border-flow" />}
              </button>
            )) : row.markets.map(item => (
              <button
                key={item.id}
                type="button"
                className="lite-e3-market-option"
                aria-pressed={market.id === item.id}
                disabled={isLoanAction && !item.asset}
                onClick={() => setMarketId(item.id)}
              >
                <span className="lite-e3-market-option-name">
                  <span className="lite-e3-market-indicator" aria-hidden="true" />
                  <span>{item.asset ? 'Core Pool' : row.markets.filter(option => option.hub).length === 1 ? 'Liquidity Hub' : item.name}</span>
                </span>
                <span className="lite-e3-market-option-rate">
                  {isLoanAction && !item.asset ? <span>Coming Soon</span> : action === 'supply' ? (
                    <strong>{item.apy.isFinite() ? `${item.apy.toFixed(2)}%` : '—'}</strong>
                  ) : null}
                </span>
                {market.id === item.id && <span aria-hidden="true" className="venus-mode-border-flow" />}
              </button>
            ))}
            {!isLoanAction && !row.markets.some(item => item.hub) && (
              <button type="button" className="lite-e3-market-option" aria-pressed={false} disabled>
                <span className="lite-e3-market-option-name">
                  <span className="lite-e3-market-indicator" aria-hidden="true" />
                  <span>Liquidity Hub</span>
                </span>
                <span className="lite-e3-market-option-rate"><span>Coming Soon</span></span>
              </button>
            )}
          </div>
      </div>
    ) : null;

  const guestSupply = !accountAddress && action === 'supply' && row && market;
  const amount = guestAmount.assetKey === row?.key ? guestAmount.value : '';
  const monthlyRate = market ? Math.expm1(Math.log1p(market.apy.toNumber() / 100) / 12) : NaN;
  const principal = new BigNumber(amount || 0);
  const monthlyEarnings = principal.times(monthlyRate);
  const validEstimate = principal.isFinite() && principal.gte(0) && monthlyEarnings.isFinite();
  const guestPreview = guestSupply ? {
    value: amount,
    onChange: (value: string) => setGuestAmount({ assetKey: row.key, value }),
    details: (
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-light-grey" title="Estimated from current APY over one twelfth of a year. Rates may change.">Estimated monthly earnings</span>
        <output className="text-right tabular-nums" aria-live="polite">{validEstimate ? `${monthlyEarnings.toFormat(monthlyEarnings.gt(0) && monthlyEarnings.lt(0.01) ? 8 : 2)} ${row.token.symbol}` : '—'}</output>
      </div>
    ),
  } : undefined;

  return (
    <>
    <div className="lite-e3-action">
      {ready && !loading && <TokenPlanets rows={rows} onSelect={(item, id) => {
        setAction('supply');
        setAssetKey(item.key);
        setMarketId(id);
        requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.lite-e3-inline-asset-trigger')?.focus());
      }} />}
      <div className="lite-e3-action-tabs" role="tablist" aria-label="Transaction action">
        {actions.map((label, index) => {
          const id = label.toLowerCase() as typeof action;
          return (
            <Button
              size="sm"
              variant="secondary"
              material="glass"
              key={id}
              type="button"
              role="tab"
              id={`e3-tab-${id}`}
              aria-selected={action === id}
              aria-controls="e3-action-panel"
              tabIndex={action === id ? 0 : -1}
              onClick={() => setAction(id)}
              onKeyDown={event => {
                let next = index;
                if (event.key === 'ArrowRight') next = (index + 1) % actions.length;
                else if (event.key === 'ArrowLeft')
                  next = (index + actions.length - 1) % actions.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = actions.length - 1;
                else return;
                event.preventDefault();
                setAction(actions[next].toLowerCase() as typeof action);
                const buttons =
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                    '[role="tab"]',
                  );
                buttons?.[next]?.focus();
              }}
            >
              {label}
              <span aria-hidden="true" className="venus-mode-border-flow" />
            </Button>
          );
        })}
      </div>
      <section
        className="venus-glass-card venus-popup-panel lite-e3-card"
        role="tabpanel"
        id="e3-action-panel"
        aria-labelledby={`e3-tab-${action}`}
      >
        <div className="lite-e3-card-scroll">
        {!accountAddress && (action === 'withdraw' || action === 'repay') ? (
          <div className="lite-e3-connect-state">
            <div>
              <h2 className="text-xl font-normal">{action === 'withdraw' ? 'Withdraw' : 'Repay'}</h2>
              <p className="text-light-grey text-sm mt-2">
                {action === 'withdraw'
                  ? 'Connect your wallet to view your supplied assets.'
                  : 'Connect your wallet to view your outstanding loans.'}
              </p>
            </div>
            <ConnectWallet analyticVariant={`e3_${action}`} />
          </div>
        ) : loading ? (
          <p role="status">Loading markets…</p>
        ) : !ready || !row || !market ? (
          <p role="status">Market data is unavailable. Please refresh to try again.</p>
        ) : (
          <div className="lite-e3-original-form" key={`${row.key}:${!accountAddress && action === 'supply' ? 'preview' : market.id}:${action}`}>
            <div className="lite-e3-context">
              {action !== 'supply' && marketDetails}
              {action === 'repay' && borrowSource === 'core' && positionRows.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm leading-normal text-light-grey">Loan to repay</span>
                  {assetSelector}
                  <p className="m-0 text-sm leading-normal text-light-grey">Outstanding: {market.asset?.userBorrowBalanceTokens.toFormat()} {row.token.symbol}</p>
                </div>
              )}
            </div>
            <TokenAmountLayout.Provider value={action !== 'repay' ? { token: row.token, selector: assetSelector, afterInput: action === 'supply' ? marketDetails : undefined, guestPreview } : undefined}>
            {isLoanAction && borrowSource === 'spoke' ? (
              <div className="lite-e3-context">
                <Select
                  buttonClassName="lite-e3-asset-trigger"
                  menuTitle={action === 'repay' ? 'Select loan to repay' : 'Select Spoke market'}
                  value="unselected"
                  options={[{ value: 'unselected', label: 'Select a market' }]}
                  onChange={() => {}}
                  size="small"
                />
                {action === 'repay' && <p className="text-sm text-light-grey">Select a loan to view repayment details.</p>}
                <TokenTextField token={row.token} value="" onChange={() => {}} disabled aria-label={action === 'repay' ? 'Repay amount' : 'Borrow amount'} />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-light-grey">{action === 'repay' ? 'Outstanding debt' : 'Borrow APY'}</span>
                  <span>—</span>
                </div>
                <Button className="w-full" disabled>Select a market</Button>
              </div>
            ) : accountAddress && (action === 'withdraw' || action === 'repay') && positionRows.length === 0 ? (
              <p className="text-sm text-light-grey">{action === 'withdraw' ? 'You have no supplied assets to withdraw.' : 'You have no outstanding loans to repay.'}</p>
            ) : market.asset ? (
              market.asset.isGated && !settings.doNotShowGatedAssetModal ? (
                <GatedAssetAcknowledgementModal inline onReject={onExplore} />
              ) : (
                <MarketForm
                  actionOnly={action}
                  collateralSelector={action === 'repay' ? undefined : assetSelector}
                  supplyAssetSelector={assetSelector}
                  supplyMarketName={market.name}
                  vToken={market.asset.vToken}
                  poolComptrollerAddress={corePoolComptrollerContractAddress}
                  initialActiveTabId={action}
                />
              )
            ) : market.hub && (action === 'borrow' || action === 'repay') ? (
              <p role="status" className="text-light-grey text-sm">
                This Liquidity Hub supports Supply and Withdraw. Select Venus Core for Borrow or
                Repay.
              </p>
            ) : market.hub ? (
              <>
                <LiquidityHubForm
                  walletFirst
                  supplyOnly
                  vhToken={market.hub.vhToken}
                  initialActiveTabId={action}
                />
              </>
            ) : (
              <p>This market is preview-only and cannot accept deposits.</p>
            )}
            </TokenAmountLayout.Provider>
          </div>
        )}
        </div>
      </section>
    </div>
    </>
  );
}
