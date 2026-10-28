import { useState } from 'react';
import { Modal, TextField, TokenIcon } from 'components';
import type { Asset } from 'types';
import type { BorrowSource } from './BorrowSources';
import type { LiteAsset } from './data';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { getPreviewCollateral } from './preview-data';

export interface CollateralChoice {
  symbol: string;
  iconSrc?: string;
  asset?: Asset;
}

/** A preview source must never borrow Core risk values or transaction assets. */
export function getSourceCollateral(source: BorrowSource, rows: LiteAsset[]): CollateralChoice[] {
  const assets =
    source.apy === undefined
      ? rows.flatMap(row => row.markets.flatMap(market => (market.asset ? [market.asset] : [])))
      : [];
  return source.collateral.map(item => ({
    ...item,
    asset: assets.find(
      asset => asset.collateralFactor > 0 && asset.vToken.underlyingToken.symbol === item.symbol,
    ),
  }));
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
            {['Assets', 'Max LTV', 'LT', 'Penalty'].map(label => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
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
                    <TokenIcon token={choice.asset.vToken.underlyingToken} size="md" />
                  ) : choice.iconSrc ? (
                    <img src={choice.iconSrc} alt="" className="size-5" />
                  ) : null}
                  <span>{choice.symbol}</span>
                </button>
              </td>
              <td>{percent(choice.asset ? choice.asset.collateralFactor * 100 : fixture?.maxLtvPercentage)}</td>
              <td>{percent(choice.asset?.liquidationThresholdPercentage ?? fixture?.liquidationThresholdPercentage)}</td>
              <td>{percent(choice.asset?.liquidationPenaltyPercentage ?? fixture?.liquidationPenaltyPercentage)}</td>
            </tr>
            );
          })}
          {choices.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-light-grey">
                No collateral matches this search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Modal>
  );
}
