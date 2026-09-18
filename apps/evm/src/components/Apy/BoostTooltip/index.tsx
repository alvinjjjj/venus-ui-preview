import { cn } from '@venusprotocol/ui';
import { Tooltip, type TooltipProps } from 'components';
import { DistributionList, type DistributionListProps } from '../DistributionList';
import { RewardStars } from './RewardStars';

export interface BoostTooltipProps
  extends Omit<TooltipProps, 'content'>,
    Omit<DistributionListProps, 'showEstimatedRewards'> {}

export const BoostTooltip: React.FC<BoostTooltipProps> = ({
  className,
  type,
  token,
  baseApyPercentage,
  userBalanceTokens,
  primeApyPercentage,
  primeSimulationDistribution,
  tokenDistributions,
  pointDistributions,
  vTokenAddress,
  children,
  ...otherProps
}) => {

  return (
    <Tooltip
      triggerTabIndex={0}
      className={cn('venus-apy-boost inline-flex items-center gap-1', className)}
      content={
        <DistributionList
          type={type}
          token={token}
          baseApyPercentage={baseApyPercentage}
          userBalanceTokens={userBalanceTokens}
          primeApyPercentage={primeApyPercentage}
          primeSimulationDistribution={primeSimulationDistribution}
          tokenDistributions={tokenDistributions}
          pointDistributions={pointDistributions}
          vTokenAddress={vTokenAddress}
        />
      }
      {...otherProps}
    >
      <RewardStars />

      {children}
    </Tooltip>
  );
};
