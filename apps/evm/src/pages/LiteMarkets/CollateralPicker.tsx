import { InfoIcon, Modal, TextField, TokenIcon } from 'components';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useState } from 'react';
import type { Asset } from 'types';
import type { BorrowSource } from './BorrowSources';
import type { LiteAsset } from './data';
import { getPreviewCollateral } from './preview-data';

export interface CollateralChoice {
  symbol: string;
  iconSrc?: string;
  asset?: Asset;
  /** WBNB market supplied with native BNB: "BNB (WBNB market)". */
  native?: boolean;
}

/** A preview source must never borrow Core risk values or transaction assets. */
export function getSourceCollateral(source: BorrowSource, rows: LiteAsset[]): CollateralChoice[] {
  const assets =
    source.apy === undefined
      ? rows.flatMap(row => row.markets.flatMap(market => (market.asset ? [market.asset] : [])))
      : [];
  return source.collateral.flatMap(item => {
    const asset = assets.find(
      a => a.collateralFactor > 0 && a.vToken.underlyingToken.symbol === item.symbol,
    );
    const choice: CollateralChoice = { ...item, asset };
    const native = asset?.vToken.underlyingToken.tokenWrapped;
    return native
      ? [choice, { symbol: `${native.symbol} (${item.symbol} market)`, asset, native: true }]
      : [choice];
  });
}

const percent = (value?: number) =>
  value !== undefined && Number.isFinite(value) ? `${Number(value.toFixed(2))}%` : '—';

export function CollateralPicker({
  source,
  rows,
  onClose,
  onSelect,
  compact = false,
}: {
  source: BorrowSource;
  rows: LiteAsset[];
  onClose: () => void;
  onSelect: (choice: CollateralChoice) => void;
  compact?: boolean;
}) {
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const [search, setSearch] = useState('');
  const choices = getSourceCollateral(source, rows).filter(choice =>
    choice.symbol.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const content = (
    <>
      {!compact && (
        <TextField
          aria-label="Search collateral"
          placeholder="Search collateral"
          size="sm"
          leftIconSrc="magnifier"
          inputContainerClassName="venus-market-search-surface"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      )}
      {!isFinal && source.apy !== undefined && (
        <p className="lite-e2-preview-source-label my-3">
          Preview market · Transactions unavailable
        </p>
      )}
      <table
        aria-label={`${source.name} collaterals`}
        className={`lite-mobile-collateral-table w-full text-right ${
          compact ? 'lite-collateral-preview-table' : 'mt-4'
        }`}
      >
        <thead>
          <tr>
            {/* The compact asset preview only needs the asset and borrowing limit. */}
            <th scope="col">{compact ? 'Asset' : 'Assets'}</th>
            <th scope="col">
              <span className="inline-flex items-center justify-end gap-1">
                Max LTV
                {!compact && (
                  <InfoIcon tooltip="The maximum you can borrow against this collateral, as a percentage of its value." />
                )}
              </span>
            </th>
            {!compact && (
              <th scope="col">
                <span className="inline-flex items-center justify-end gap-1">
                  LT
                  <InfoIcon tooltip="If your borrowed amount reaches this percentage of your collateral value, your position can be liquidated." />
                </span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {choices.map(choice => {
            const fixture =
              isFinal && source.apy !== undefined ? getPreviewCollateral(choice.symbol) : undefined;
            return (
              <tr key={choice.symbol} onClick={() => onSelect(choice)}>
                <td>
                  <button
                    type="button"
                    aria-label={`Use ${choice.symbol} collateral`}
                    onClick={event => {
                      event.stopPropagation();
                      onSelect(choice);
                    }}
                  >
                    {choice.asset ? (
                      <TokenIcon
                        token={
                          choice.native && choice.asset.vToken.underlyingToken.tokenWrapped
                            ? choice.asset.vToken.underlyingToken.tokenWrapped
                            : choice.asset.vToken.underlyingToken
                        }
                        size="md"
                      />
                    ) : choice.iconSrc ? (
                      <img src={choice.iconSrc} alt="" className="size-5" />
                    ) : null}
                    <span>{choice.symbol}</span>
                  </button>
                </td>
                <td>
                  {percent(
                    choice.asset ? choice.asset.collateralFactor * 100 : fixture?.maxLtvPercentage,
                  )}
                </td>
                {!compact && (
                  <td>
                    {percent(
                      choice.asset?.liquidationThresholdPercentage ??
                        fixture?.liquidationThresholdPercentage,
                    )}
                  </td>
                )}
              </tr>
            );
          })}
          {choices.length === 0 && (
            <tr>
              <td colSpan={compact ? 2 : 3} className="py-6 text-center text-light-grey">
                No collateral matches this search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
  return compact ? (
    content
  ) : (
    <Modal
      isOpen
      title={`${source.name} Collaterals`}
      handleClose={onClose}
      className="lite-mobile-collateral-dialog"
    >
      {content}
    </Modal>
  );
}
