import { Modal, type ModalProps } from 'components';
import { LiquidityHubForm } from 'containers/LiquidityHubForm';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import type { VhToken } from 'types';

export interface LiquidityHubFormModalProps extends Omit<ModalProps, 'children' | 'isOpen'> {
  vhToken: VhToken;
}

export const LiquidityHubFormModal: React.FC<LiquidityHubFormModalProps> = ({
  vhToken,
  handleClose,
  ...otherProps
}) => {
  const isFinal = useGlassPreview(state => state.mode === 'lite-experiment-v2');
  // Lite, and Pro in Final: Supply / Withdraw always use underline tabs.
  const { isLite } = useInterfaceMode();
  return (
    <Modal isOpen handleClose={handleClose} {...otherProps}>
      <LiquidityHubForm
        vhToken={vhToken}
        onSubmitSuccess={handleClose}
        actionTabsVariant={isLite || isFinal ? 'secondary' : undefined}
      />
    </Modal>
  );
};
