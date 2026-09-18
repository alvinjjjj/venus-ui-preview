import BigNumber from 'bignumber.js';
import { demoAddresses } from 'demo/state';
import { useGetToken } from 'libs/tokens';
import type { Address } from 'viem';
import { formatToVenusVault } from '../formatToVenusVault';
export const useGetVestingVaults = (input?: { accountAddress?: Address }) => {
  const stakeAmount = input?.accountAddress === demoAddresses.prime ? 5000 : 250;
  const stakedToken = useGetToken({ symbol: 'XVS' });
  const rewardToken = useGetToken({ symbol: 'XVS' });
  const vault =
    stakedToken && rewardToken
      ? formatToVenusVault({
          stakedToken,
          rewardToken,
          poolIndex: 0,
          isPaused: false,
          lockingPeriodMs: 604800000,
          stakedTokenPriceCents: new BigNumber(500),
          rewardTokenPriceCents: new BigNumber(500),
          stakeBalanceMantissa: new BigNumber(1200000).shiftedBy(stakedToken.decimals),
          stakeBalanceCents: 600000000,
          dailyEmissionMantissa: new BigNumber(250).shiftedBy(rewardToken.decimals),
          dailyEmissionCents: 125000,
          stakeAprPercentage: 8.6,
          userStakeBalanceMantissa: new BigNumber(
            input?.accountAddress ? stakeAmount : 0,
          ).shiftedBy(stakedToken.decimals),
          userStakeBalanceCents: input?.accountAddress ? stakeAmount * 500 : 0,
        })
      : undefined;
  return { isLoading: false, data: vault ? [vault] : [] };
};
