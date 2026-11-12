import BigNumber from 'bignumber.js';
import {
  AssetApy,
  Icon,
  InfoIcon,
  Modal,
  SecondaryButton,
  Select,
  Tabs,
  TokenIcon,
} from 'components';
import { GatedAssetAcknowledgementModal } from 'containers/GatedAssetAcknowledgementModal';
import { MarketForm } from 'containers/MarketForm';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { isLiteExperimentMode } from 'demo/GlassVersions/variants';
import { NATIVE_SUFFIX, useLiteNativeCollateralStore } from 'demo/liteNativeCollateral';
import { useChain } from 'hooks/useChain';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import { useEffect, useRef, useState } from 'react';
import type { Asset } from 'types';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import type { BorrowSource } from './BorrowSources';
import { CollateralPicker } from './CollateralPicker';
import { LiteMarketBreadcrumb } from './LiteMarketBreadcrumb';
import type { LiteAsset } from './data';
import { getPreviewBalances, getPreviewCollateral } from './preview-data';

export function BorrowSourceModal({
  asset,
  source,
  rows,
  onClose,
  inline = false,
  initialCollateralSymbol,
  onBackAssets,
}: {
  asset: Asset;
  source: BorrowSource;
  rows: LiteAsset[];
  onClose: () => void;
  inline?: boolean;
  initialCollateralSymbol?: string;
  onBackAssets?: () => void;
}) {
  const { corePoolComptrollerContractAddress } = useChain();
  const experimental = useGlassPreview(state => isLiteExperimentMode(state.mode));
  const isE2 = useGlassPreview(
    state => state.mode === 'lite-experiment-v2' || state.mode === 'lite-experiment-v2-legacy',
  );
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const [settings] = useUserChainSettings();
  const isPreview = source.apy !== undefined;
  const token = asset.vToken.underlyingToken;
  const collateralAssets = rows.flatMap(row =>
    row.markets.flatMap(market =>
      market.asset && market.asset.collateralFactor > 0 ? [market.asset] : [],
    ),
  );
  const [selectedCollateral, setSelectedCollateral] = useState(
    collateralAssets.find(item => item.vToken.underlyingToken.symbol === initialCollateralSymbol)
      ?.vToken.address ?? collateralAssets[0]?.vToken.address,
  );
  const [previewCollateralSymbol, setPreviewCollateralSymbol] = useState(
    initialCollateralSymbol ?? source.collateral[0]?.symbol,
  );
  // Borrow modal always opens on Loan (Borrow / Repay); a picked collateral stays preselected.
  const [activeTab, setActiveTab] = useState('loan');
  const [pickerOpen, setPickerOpen] = useState(false);
  const backRef = useRef<HTMLButtonElement>(null);
  // "address#native" = WBNB market, supplied with native BNB ("BNB (WBNB market)").
  const [selectedCollateralAddress, selectedNativeFlag] = (selectedCollateral ?? '').split(
    NATIVE_SUFFIX,
  );
  const isNativeCollateral = selectedNativeFlag !== undefined;
  const collateral = collateralAssets.find(
    item => item.vToken.address === selectedCollateralAddress,
  );
  const setLiteNativeCollateral = useLiteNativeCollateralStore(state => state.set);
  useEffect(() => {
    setLiteNativeCollateral(isNativeCollateral ? collateral?.vToken.address : undefined);
    return () => setLiteNativeCollateral(undefined);
  }, [isNativeCollateral, collateral, setLiteNativeCollateral]);
  const nativeLabel = (item: Asset) =>
    `${item.vToken.underlyingToken.tokenWrapped?.symbol} (${item.vToken.underlyingToken.symbol} market)`;
  const previewCollateral = source.collateral.find(item => item.symbol === previewCollateralSymbol);
  const previewBalances = getPreviewBalances(asset.tokenPriceCents);
  const previewCollateralBalances = getPreviewCollateral(previewCollateralSymbol ?? '');
  const previewAmount = (value: BigNumber) =>
    formatTokensToReadableValue({ value, token, addSymbol: false });
  const mobileCollateralSelector = (
    <SecondaryButton
      size="sm"
      className="px-3"
      aria-label={`Choose ${
        isPreview ? previewCollateralSymbol ?? '' : collateral?.vToken.underlyingToken.symbol ?? ''
      } collateral`}
      aria-haspopup="dialog"
      onClick={() => setPickerOpen(true)}
    >
      <span className="inline-flex items-center gap-2">
        {!isPreview && collateral ? (
          <TokenIcon
            token={
              isNativeCollateral && collateral.vToken.underlyingToken.tokenWrapped
                ? collateral.vToken.underlyingToken.tokenWrapped
                : collateral.vToken.underlyingToken
            }
            size="md"
          />
        ) : previewCollateral?.iconSrc ? (
          <img src={previewCollateral.iconSrc} alt="" className="size-5" />
        ) : null}
        {isPreview
          ? previewCollateralSymbol
          : collateral && isNativeCollateral
            ? collateral.vToken.underlyingToken.tokenWrapped?.symbol
            : collateral?.vToken.underlyingToken.symbol}
        <Icon name="chevronDown" className="size-3" />
      </span>
    </SecondaryButton>
  );
  const percent = (value: number | undefined) =>
    value !== undefined && Number.isFinite(value) ? `${Number(value.toFixed(2))}%` : '—';
  const collateralSelector = (
    <Select
      aria-label="Collateral asset"
      className="w-36 shrink-0"
      dropdownClassName={experimental ? 'lite-collateral-options' : undefined}
      // E: a small table — the asset with its Max LTV and Liquidation threshold side by side.
      menuTitle={
        experimental ? (
          <div className="lite-collateral-head">
            <p className="lite-collateral-title">Select collateral</p>
            <div className="lite-collateral-row lite-collateral-cols">
              <span>Asset</span>
              <span>
                Max LTV{' '}
                <InfoIcon tooltip="The maximum you can borrow against this collateral, as a percentage of its value." />
              </span>
              <span>
                LT{' '}
                <InfoIcon tooltip="If your borrowed amount reaches this percentage of your collateral value, your position can be liquidated." />
              </span>
            </div>
          </div>
        ) : undefined
      }
      value={selectedCollateral ?? ''}
      onChange={value => setSelectedCollateral(String(value) as typeof selectedCollateral)}
      options={collateralAssets.flatMap(item => {
        const build = (value: string, token: Asset['vToken']['underlyingToken'], text: string) => {
          const name = (
            <span className="inline-flex items-center gap-2 min-w-0">
              <TokenIcon token={token} size="md" />
              <span className="truncate">{text}</span>
            </span>
          );
          return {
            value,
            label: experimental
              ? ({ isRenderedInButton }: { isRenderedInButton: boolean }) =>
                  isRenderedInButton ? (
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <TokenIcon token={token} size="md" />
                      <span className="truncate">{token.symbol}</span>
                    </span>
                  ) : (
                    <span className="lite-collateral-row">
                      {name}
                      <span>{percent(item.collateralFactor * 100)}</span>
                      <span>{percent(item.liquidationThresholdPercentage)}</span>
                    </span>
                  )
              : name,
          };
        };
        const underlying = item.vToken.underlyingToken;
        const options = [build(item.vToken.address, underlying, underlying.symbol)];
        // WBNB market: also offer native BNB, labelled "BNB (WBNB market)".
        if (underlying.tokenWrapped)
          options.push(
            build(
              `${item.vToken.address}${NATIVE_SUFFIX}`,
              underlying.tokenWrapped,
              nativeLabel(item),
            ),
          );
        return options;
      })}
    />
  );
  const penalty = (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-light-grey">
        Liquidation penalty{collateral ? ` (${collateral.vToken.underlyingToken.symbol})` : ''}
      </span>
      <span>
        {collateral && Number.isFinite(collateral.liquidationPenaltyPercentage)
          ? `${collateral.liquidationPenaltyPercentage}%`
          : '—'}
      </span>
    </div>
  );
  useEffect(() => {
    if (inline) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, inline]);
  useEffect(() => {
    if (inline) {
      backRef.current?.focus({ preventScroll: true });
      backRef.current?.closest('.lite-inline-market')?.scrollIntoView?.({ block: 'start' });
    }
  }, [inline]);
  if (!isPreview && asset.isGated && !settings.doNotShowGatedAssetModal) {
    return <GatedAssetAcknowledgementModal inline={inline} onReject={onClose} />;
  }
  const money = (value: BigNumber) => formatCentsToReadableValue({ value });
  const liquidity = isPreview
    ? new BigNumber(source.liquidity ?? 0).times(asset.tokenPriceCents)
    : asset.liquidityCents;
  const borrowed = isPreview
    ? new BigNumber(source.borrowed ?? 0).times(asset.tokenPriceCents)
    : asset.borrowBalanceCents;
  const info = (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-5 text-sm">
        {[
          ['Price', money(asset.tokenPriceCents)],
          ['Liquidity', money(liquidity)],
          ['30D average APY', '—'],
          ['Current APY', isPreview ? `${source.apy}%` : <AssetApy asset={asset} type="borrow" />],
          ['Total borrowed', money(borrowed)],
          [
            'Utilization',
            !isPreview && asset.supplyBalanceTokens.gt(0)
              ? `${asset.borrowBalanceTokens.div(asset.supplyBalanceTokens).times(100).toFixed(2)}%`
              : '—',
          ],
        ].map(([label, value]) => (
          <div key={String(label)} className="space-y-2">
            <dt className="text-light-grey">{label}</dt>
            <dd className="font-normal tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-3">
        <h3 className="font-normal">Supported collateral</h3>
        <div className="overflow-x-auto rounded-lg border border-light-grey/20">
          <table className="w-full text-xs text-right">
            <thead className="text-light-grey">
              <tr>
                {['Collateral', 'Supplied', 'Max LTV', 'LT', 'Penalty', 'Capacity filled'].map(
                  label => (
                    <th key={label} className="p-3 font-normal whitespace-nowrap first:text-left">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {source.collateral.map(item => {
                const match = !isPreview
                  ? collateralAssets.find(a => a.vToken.underlyingToken.symbol === item.symbol)
                  : undefined;
                return (
                  <tr key={item.symbol} className="border-t border-light-grey/20">
                    <td className="p-3 text-left">
                      <span className="inline-flex items-center gap-2">
                        {item.iconSrc && (
                          <img src={item.iconSrc} alt="" className="size-5 rounded-full" />
                        )}
                        {item.symbol}
                      </span>
                    </td>
                    <td className="p-3">
                      {match
                        ? formatTokensToReadableValue({
                            value: match.supplyBalanceTokens,
                            token: match.vToken.underlyingToken,
                          })
                        : '—'}
                    </td>
                    <td className="p-3">{match ? `${match.collateralFactor * 100}%` : '—'}</td>
                    <td className="p-3">
                      {match ? `${match.liquidationThresholdPercentage}%` : '—'}
                    </td>
                    <td className="p-3">
                      {match ? `${match.liquidationPenaltyPercentage}%` : '—'}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {match?.supplyCapTokens.gt(0)
                        ? `${match.supplyBalanceTokens
                            .div(match.supplyCapTokens)
                            .times(100)
                            .toFixed(2)}%`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-light-grey">Unavailable metrics are shown as —.</p>
      </div>
    </div>
  );
  const previewForm = (action: string) => (
    <div className={isFinal ? 'lite-preview-form space-y-4' : 'space-y-5'}>
      <div className="flex items-center justify-between rounded-lg border border-light-grey/20 p-4">
        <span className="inline-flex items-center gap-2">
          {action === 'Collateral' ? (
            mobileCollateralSelector
          ) : (
            <>
              <TokenIcon token={token} size="md" />
              {token.symbol}
            </>
          )}
        </span>
        <span className="text-light-grey">0.00</span>
      </div>
      <dl className="space-y-4 text-sm">
        {(action === 'Collateral'
          ? [
              [
                'Wallet balance',
                isFinal ? previewCollateralBalances.walletTokens.decimalPlaces(4).toFormat() : '—',
              ],
              [
                'Supply balance',
                isFinal ? previewCollateralBalances.supplyTokens.decimalPlaces(4).toFormat() : '—',
              ],
            ]
          : [
              [
                action === 'Repay' ? 'Wallet balance' : 'Available to borrow',
                isFinal
                  ? `${previewAmount(
                      action === 'Repay'
                        ? previewBalances.walletTokens
                        : previewBalances.availableTokens,
                    )} ${token.symbol}`
                  : '—',
              ],
              ['Borrow balance', isFinal ? previewAmount(previewBalances.borrowTokens) : '—'],
              ['Total borrow APY', `${source.apy}%`],
              ['Health factor', isFinal ? previewBalances.healthFactor : '—'],
            ]
        ).map(([label, value]) => (
          <div
            key={label}
            className={`flex justify-between gap-4 border-b border-light-grey/20 pb-3${
              isFinal ? ' last:border-b-0 last:pb-0' : ''
            }`}
          >
            <dt className="text-light-grey">{label}</dt>
            <dd className="tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        disabled
        className="w-full rounded-lg bg-grey/20 p-3 text-light-grey font-normal"
      >
        {action === 'Collateral' ? 'Supply' : action}
      </button>
    </div>
  );
  const content = (
    <>
      {isE2 && !isFinal && isPreview && (
        <p className="lite-e2-preview-source-label mb-4">
          Preview market · Transactions unavailable
        </p>
      )}
      <Tabs
        className={isFinal ? 'lite-borrow-action-tabs space-y-3' : undefined}
        headerClassName={experimental ? 'lite-borrow-popup-tabs' : undefined}
        variant="secondary"
        activeTabId={activeTab}
        initialActiveTabId="loan"
        onTabChange={index => setActiveTab(['collateral', 'loan', 'info'][index] ?? 'loan')}
        tabs={[
          {
            id: 'collateral',
            title: <span className="font-normal">Collateral</span>,
            content: isPreview ? (
              previewForm('Collateral')
            ) : (
              <div className="space-y-5">
                {!experimental && collateralSelector}
                {collateral ? (
                  collateral.isGated && !settings.doNotShowGatedAssetModal ? (
                    <div className="space-y-3">
                      {experimental && collateralSelector}
                      <p className="text-sm text-light-grey">
                        Open this asset from Earn to review its access requirements.
                      </p>
                    </div>
                  ) : (
                    <MarketForm
                      collateralSelector={
                        experimental
                          ? inline
                            ? mobileCollateralSelector
                            : collateralSelector
                          : undefined
                      }
                      key={`${collateral.vToken.address}${isNativeCollateral ? NATIVE_SUFFIX : ''}`}
                      vToken={collateral.vToken}
                      poolComptrollerAddress={corePoolComptrollerContractAddress}
                      earnOnly
                      initialActiveTabId="supply"
                      onSubmitSuccess={onClose}
                    />
                  )
                ) : (
                  <p>No supported collateral available.</p>
                )}
              </div>
            ),
          },
          {
            id: 'loan',
            title: <span className="font-normal">Loan</span>,
            content: isPreview ? (
              <Tabs
                tabs={['Borrow', 'Repay'].map(action => ({
                  id: action.toLowerCase(),
                  title: <span className="font-normal">{action}</span>,
                  content: previewForm(action),
                }))}
              />
            ) : (
              <MarketForm
                borrowPenalty={experimental ? penalty : undefined}
                vToken={asset.vToken}
                poolComptrollerAddress={corePoolComptrollerContractAddress}
                borrowOnly
                initialActiveTabId="borrow"
                onSubmitSuccess={onClose}
              />
            ),
          },
          ...(!experimental
            ? [{ id: 'info', title: <span className="font-normal">Info</span>, content: info }]
            : []),
        ]}
      />
    </>
  );
  const picker = pickerOpen && (
    <CollateralPicker
      source={source}
      rows={rows}
      onClose={() => setPickerOpen(false)}
      onSelect={choice => {
        if (choice.asset)
          setSelectedCollateral(
            `${choice.asset.vToken.address}${choice.native ? NATIVE_SUFFIX : ''}`,
          );
        setPreviewCollateralSymbol(choice.symbol);
        setActiveTab('collateral');
        setPickerOpen(false);
      }}
    />
  );
  if (inline)
    return (
      <section
        className={`lite-inline-market lite-mobile-borrow-form${
          isFinal ? ' venus-form-surface' : ''
        }`}
        aria-label={`${token.symbol} ${source.name} form`}
      >
        <LiteMarketBreadcrumb
          mode="Borrow"
          token={token}
          onBackToAssets={onBackAssets ?? onClose}
          onBackToSources={onClose}
          marketName={source.name}
          backButtonRef={backRef}
        />
        <div className="lite-inline-market-body">
          <div className="lite-inline-market-form">{content}</div>
        </div>

        {picker}
      </section>
    );
  return (
    <>
      <Modal
        isOpen
        className={isE2 ? 'lite-e2-borrow-modal' : undefined}
        handleClose={onClose}
        title={
          <span className="inline-flex items-center gap-2 font-normal">
            <TokenIcon token={token} size="md" />
            {token.symbol} / {source.name}
          </span>
        }
      >
        {content}
      </Modal>
      {picker}
    </>
  );
}
