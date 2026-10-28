import type { Address } from 'viem';

import { Modal, type ModalProps, ProtectionModeIndicator, TokenIcon } from 'components';
import { GatedAssetAcknowledgementModal } from 'containers/GatedAssetAcknowledgementModal';
import { MarketForm } from 'containers/MarketForm';
import { useUserChainSettings } from 'hooks/useUserChainSettings';
import type { Asset } from 'types';

export interface MarketFormModalProps {
  asset: Asset;
  poolComptrollerAddress: Address;
  initialActiveTabId?: string;
  onClose: ModalProps['handleClose'];
  earnOnly?: boolean;
  borrowOnly?: boolean;
  marketName?: string;
}

export const MarketFormModal: React.FC<MarketFormModalProps> = ({
  asset,
  poolComptrollerAddress,
  initialActiveTabId,
  onClose,
  earnOnly,
  borrowOnly,
  marketName,
}) => {
  const [userChainSettings] = useUserChainSettings();

  if (asset.isGated && !userChainSettings.doNotShowGatedAssetModal) {
    return <GatedAssetAcknowledgementModal onReject={onClose} />;
  }

  return (
    <Modal
      isOpen
      title={
        <span
          className={`inline-flex items-center gap-x-2 ${
            earnOnly || borrowOnly ? 'font-normal' : ''
          }`}
        >
          {(earnOnly || borrowOnly) && <TokenIcon token={asset.vToken.underlyingToken} size="md" />}
          {asset.isProtectionModeEnabled && (
            <ProtectionModeIndicator
              variant="icon"
              tokenName={asset.vToken.underlyingToken.symbol}
              tokenSupplyPriceCents={asset.tokenSupplyPriceCents}
              tokenBorrowPriceCents={asset.tokenBorrowPriceCents}
            />
          )}
          {asset.vToken.underlyingToken.symbol}
          {marketName && ` / ${marketName}`}
        </span>
      }
      handleClose={onClose}
    >
      <MarketForm
        vToken={asset.vToken}
        poolComptrollerAddress={poolComptrollerAddress}
        initialActiveTabId={initialActiveTabId}
        onSubmitSuccess={onClose}
        earnOnly={earnOnly}
        borrowOnly={borrowOnly}
      />
    </Modal>
  );
};
