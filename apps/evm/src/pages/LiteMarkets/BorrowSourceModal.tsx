import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { AssetApy, Modal, Select, Tabs, TokenIcon } from 'components';
import { MarketForm } from 'containers/MarketForm';
import { GatedAssetAcknowledgementModal } from 'containers/GatedAssetAcknowledgementModal';
import { useChain } from 'hooks/useChain';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import type { Asset } from 'types';
import { formatCentsToReadableValue, formatTokensToReadableValue } from 'utilities';
import type { LiteAsset } from './data';
import type { BorrowSource } from './BorrowSources';
import { useGlassPreview } from 'demo/GlassVersions/store';

export function BorrowSourceModal({
  asset,
  source,
  rows,
  onClose,
}: {
  asset: Asset;
  source: BorrowSource;
  rows: LiteAsset[];
  onClose: () => void;
}) {
  const { corePoolComptrollerContractAddress } = useChain();
  const experimental = useGlassPreview(state => state.mode === 'lite-experiment');
  const [settings] = useUserChainSettings();
  const isPreview = source.apy !== undefined;
  const token = asset.vToken.underlyingToken;
  const collateralAssets = rows.flatMap(row =>
    row.markets.flatMap(market =>
      market.asset && market.asset.collateralFactor > 0 ? [market.asset] : [],
    ),
  );
  const [selectedCollateral, setSelectedCollateral] = useState(collateralAssets[0]?.vToken.address);
  const collateral = collateralAssets.find(item => item.vToken.address === selectedCollateral);
  const collateralSelector = (
    <Select
      aria-label="Collateral asset"
      className="w-36 shrink-0"
      value={selectedCollateral ?? ''}
      onChange={value => setSelectedCollateral(String(value) as typeof selectedCollateral)}
      options={collateralAssets.map(item => ({
        value: item.vToken.address,
        label: <span className="inline-flex items-center gap-2"><TokenIcon token={item.vToken.underlyingToken} size="md" />{item.vToken.underlyingToken.symbol}</span>,
      }))}
    />
  );
  const penalty = (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-light-grey">Liquidation penalty{collateral ? ` (${collateral.vToken.underlyingToken.symbol})` : ''}</span>
      <span>{collateral && Number.isFinite(collateral.liquidationPenaltyPercentage) ? `${collateral.liquidationPenaltyPercentage}%` : '—'}</span>
    </div>
  );
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);
  if (!isPreview && asset.isGated && !settings.doNotShowGatedAssetModal) {
    return <GatedAssetAcknowledgementModal onReject={onClose} />;
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
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-lg border border-light-grey/20 p-4">
        <span className="inline-flex items-center gap-2">
          {action === 'Collateral' ? (
            <>
              {source.collateral[0]?.iconSrc && (
                <img src={source.collateral[0].iconSrc} alt="" className="size-5 rounded-full" />
              )}
              {source.collateral[0]?.symbol ?? 'Collateral'}
            </>
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
              ['Wallet balance', '—'],
              ['Supply balance', '—'],
            ]
          : [
              ['Available to borrow', '—'],
              ['Borrow balance', '—'],
              ['Total borrow APY', `${source.apy}%`],
              ['Health factor', '—'],
            ]
        ).map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 border-b border-light-grey/20 pb-3"
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
  return (
    <Modal
      isOpen
      handleClose={onClose}
      title={
        <span className="inline-flex items-center gap-2 font-normal">
          <TokenIcon token={token} size="md" />
          {token.symbol} / {source.name}
        </span>
      }
    >
      <Tabs
        headerClassName={experimental ? 'lite-borrow-popup-tabs' : undefined}
        variant="secondary"
        initialActiveTabId="loan"
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
                      <p className="text-sm text-light-grey">Open this asset from Earn to review its access requirements.</p>
                    </div>
                  ) : (
                    <MarketForm
                      collateralSelector={experimental ? collateralSelector : undefined}
                      key={collateral.vToken.address}
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
          ...(!experimental ? [{ id: 'info', title: <span className="font-normal">Info</span>, content: info }] : []),
        ]}
      />
    </Modal>
  );
}
