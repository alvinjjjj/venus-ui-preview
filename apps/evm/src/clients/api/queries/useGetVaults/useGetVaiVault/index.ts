import BigNumber from 'bignumber.js';
import { useGetToken } from 'libs/tokens';
import type { Address } from 'viem';
import { formatToVenusVault } from '../formatToVenusVault';
export const useGetVaiVault = (input?: { accountAddress?: Address }) => {
  const stakedToken = useGetToken({ symbol: 'VAI' });
  const rewardToken = useGetToken({ symbol: 'XVS' });
  const vault =
    stakedToken && rewardToken
      ? formatToVenusVault({
          stakedToken,
          rewardToken,
          isPaused: false,
          lockingPeriodMs: 0,
          stakedTokenPriceCents: new BigNumber(100),
          rewardTokenPriceCents: new BigNumber(500),
          stakeBalanceMantissa: new BigNumber(1200000).shiftedBy(stakedToken.decimals),
          stakeBalanceCents: 120000000,
          dailyEmissionMantissa: new BigNumber(250).shiftedBy(rewardToken.decimals),
          dailyEmissionCents: 125000,
          stakeAprPercentage: 3.2,
          userStakeBalanceMantissa: new BigNumber(input?.accountAddress ? 250 : 0).shiftedBy(
            stakedToken.decimals,
          ),
          userStakeBalanceCents: input?.accountAddress ? 25000 : 0,
        })
      : undefined;
  return { isLoading: false, data: vault };
};
