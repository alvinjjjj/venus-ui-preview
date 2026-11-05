import { useState } from 'react';
import { InfoIcon, Modal, TextField, TokenIcon } from 'components';
import type { Asset } from 'types';
import type { BorrowSource } from './BorrowSources';
import type { LiteAsset } from './data';
import { useGlassPreview } from 'demo/GlassVersions/store';
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
}: {
  source: BorrowSource;
  rows: LiteAsset[];
  onClose: () => void;
  onSelect: (choice: CollateralChoice) => void;
}) {
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  const [search, setSearch] = useState('');
  const choices = getSourceCollateral(source, rows).filter(choice =>
    choice.symbol.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <Modal
      isOpen
      title={`${source.name} Collaterals`}
      handleClose={onClose}
      className="lite-mobile-collateral-dialog"
    >
      <TextField
        aria-label="Search collateral"
        placeholder="Search collateral"
        size="sm"
        leftIconSrc="magnifier"
        inputContainerClassName="venus-market-search-surface"
        value={search}
        onChange={event => setSearch(event.target.value)}
      />
      {!isFinal && source.apy !== undefined && (
        <p className="lite-e2-preview-source-label my-3">
          Preview market · Transactions unavailable
        </p>
      )}
      <table className="lite-mobile-collateral-table w-full mt-4 text-right">
        <thead>
          <tr>
            {/* Same columns and tooltips as the desktop "Select collateral" dropdown.
                Liquidation penalty is shown on the Loan tab instead. */}
            <th scope="col">Assets</th>
            <th scope="col">
              <span className="inline-flex items-center justify-end gap-1">
                Max LTV
                <InfoIcon tooltip="The maximum you can borrow against this asset, as a share of its value." />
              </span>
            </th>
            <th scope="col">
              <span className="inline-flex items-center justify-end gap-1">
                LT
                <InfoIcon tooltip="Liquidation threshold: when your debt reaches this share of the collateral value, the position can be liquidated." />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {choices.map(choice => {
            const fixture = isFinal && source.apy !== undefined ? getPreviewCollateral(choice.symbol) : undefined;
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
              <td>{percent(choice.asset ? choice.asset.collateralFactor * 100 : fixture?.maxLtvPercentage)}</td>
              <td>{percent(choice.asset?.liquidationThresholdPercentage ?? fixture?.liquidationThresholdPercentage)}</td>
            </tr>
            );
          })}
          {choices.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-light-grey">
                No collateral matches this search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Modal>
  );
}
