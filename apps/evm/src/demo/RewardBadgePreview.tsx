import BigNumber from 'bignumber.js';
import { PrimeBadge } from 'components/Apy/PrimeBadge';
import { MerklBadge } from 'components/Apy/MerklBadge';
import type { Token, MerklDistribution } from 'types';
import './reward-badge-preview.css';

const marketAddress = '0xfD5840Cd36d94D7229439859C0112a4185BC0255' as const;

// Screenshot fixtures only: these do not enter account balances, sorting or reward calculations.
export function RewardBadgePreview({ token, type }: { token: Token; type: 'supply' | 'borrow' }) {
  const campaign: MerklDistribution = {
    type: 'merkl', token, isActive: true,
    apyPercentage: new BigNumber(0), dailyDistributedTokens: new BigNumber(0),
    collateralGate: { isUserEligible: false, maxApyPercentage: new BigNumber(74.63) },
    rewardDetails: {
      appName: 'Merkl', claimUrl: 'https://app.merkl.xyz/', marketAddress,
      merklCampaignIdentifier: 'design-preview', description: 'Merkl campaign',
      tags: [], eligibleBorrowAmountUsd: 69800,
    },
  };

  return (
    <span className="venus-reward-preview inline-flex items-center gap-1" aria-label="Reward badge design preview">
      {type === 'supply' ? (
        <PrimeBadge token={token} type="supply" vTokenAddress={marketAddress}
          simulatedApyPercentage={new BigNumber(13.48)}
          simulationReferenceValues={{ userSupplyBalanceTokens: new BigNumber(4460), userBorrowBalanceTokens: new BigNumber(0), userXvsStakedTokens: new BigNumber(4000) }} />
      ) : (
        <MerklBadge token={token} type="borrow" vTokenAddress={marketAddress}
          baseApyPercentage={new BigNumber(4.62)} simulatedApyPercentage={new BigNumber(-70.01)}
          tokenDistributions={[campaign]} pointDistributions={[]} />
      )}
    </span>
  );
}
