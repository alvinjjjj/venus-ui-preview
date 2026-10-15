import { ChainId, type Pool } from 'types';

import { isNewDesignMode, useGlassPreview } from 'demo/GlassVersions/store';
import { isDemoAddress, useDemo } from 'demo/state';
import { useGetMarketsPagePath } from 'hooks/useGetMarketsPagePath';
import { useTranslation } from 'libs/translations';
import { useAccountAddress, useChainId } from 'libs/wallet';
import { Placeholder } from '../Placeholder';
import { IsolatedPoolsDeprecationNotice } from './IsolatedPoolsDeprecationNotice';
import { Positions } from './Positions';
import { getNewPreviewPool } from './getNewPreviewPool';

export interface MarketsProps {
  pool: Pool;
}

export const Markets: React.FC<MarketsProps> = ({ pool }) => {
  const { t } = useTranslation();
  const { marketsPagePath } = useGetMarketsPagePath();
  const isNewMode = useGlassPreview(state => isNewDesignMode(state.mode));
  const isDemoLoggedIn = useDemo(state => state.loggedIn);
  const { accountAddress } = useAccountAddress();
  const { chainId } = useChainId();
  const isNewPreview =
    chainId === ChainId.BSC_MAINNET && isNewMode && isDemoLoggedIn && isDemoAddress(accountAddress);
  const displayedPool = isNewPreview ? getNewPreviewPool(pool) : pool;

  const userHasPositions = displayedPool.assets.some(
    asset =>
      asset.userSupplyBalanceTokens.isGreaterThan(0) ||
      asset.userBorrowBalanceTokens.isGreaterThan(0) ||
      asset.isCollateralOfUser,
  );

  return (
    <>
      <IsolatedPoolsDeprecationNotice className="mb-4" />

      {userHasPositions ? (
        <Positions pools={[displayedPool]} previewInteractions={isNewPreview} />
      ) : (
        <Placeholder
          iconName="venus"
          title={t('account.pools.placeholder.title')}
          to={marketsPagePath}
          buttonSize="sm"
        />
      )}
    </>
  );
};
