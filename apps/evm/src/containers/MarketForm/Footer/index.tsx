import { useState } from 'react';
import { BalanceUpdates, Delimiter } from 'components';
import { AccountPoolDailyEarnings } from 'containers/AccountPoolDailyEarnings';
import { AccountPoolHealth } from 'containers/AccountPoolHealth';
import { TxFormSubmitButton } from 'containers/TxFormSubmitButton';
import { useAccountAddress } from 'libs/wallet';
import type { BalanceMutation, Pool, SwapQuote, Token } from 'types';
import { shouldShowAccountHealth } from 'utilities';
import { ApyBreakdown } from '../ApyBreakdown';
import type { Approval } from './types';
import { InlineSubmit } from '../InlineSubmit';

export interface FooterProps {
  penalty?: React.ReactNode;
  beforeSubmit?: React.ReactNode;
  collapseApy?: boolean;
  compact?: boolean;
  streamlined?: boolean;
  analyticVariant: string;
  balanceMutations: BalanceMutation[];
  pool: Pool;
  submitButtonLabel: string;
  isFormValid: boolean;
  approval?: Approval;
  isLoading?: boolean;
  swapFromToken?: Token;
  swapToToken?: Token;
  swapQuote?: SwapQuote;
  simulatedPool?: Pool;
  showApyBreakdown?: boolean;
  isUserAcknowledgingRisk?: boolean;
  setAcknowledgeRisk?: (checked: boolean) => void;
  isUserAcknowledgingHighPriceImpact?: boolean;
  setAcknowledgeHighPriceImpact?: (checked: boolean) => void;
}

export const Footer: React.FC<FooterProps> = ({
  compact = false,
  streamlined = false,
  penalty,
  beforeSubmit,
  collapseApy = false,
  balanceMutations,
  pool,
  simulatedPool,
  submitButtonLabel,
  swapFromToken,
  swapToToken,
  isLoading = false,
  analyticVariant,
  isFormValid,
  swapQuote,
  showApyBreakdown = true,
  approval,
  isUserAcknowledgingRisk,
  setAcknowledgeRisk,
  isUserAcknowledgingHighPriceImpact,
  setAcknowledgeHighPriceImpact,
}) => {
  const { accountAddress } = useAccountAddress();
  const isUserConnected = !!accountAddress;
  const [detail, setDetail] = useState('Yield');

  return (
    <div
      className={compact ? 'lite-supply-footer' : streamlined ? 'lite-metric-grid' : 'space-y-4'}
    >
      {compact ? (
        <aside className="lite-supply-details" aria-label="Market information">
          <div className="lite-supply-detail-tabs" aria-label="Information categories">
            {['Yield', 'Position', 'Risk'].map(label => (
              <button
                key={label}
                type="button"
                aria-pressed={detail === label}
                onClick={() => setDetail(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="lite-supply-detail-content">
            {detail === 'Yield' && (
              <>
                <ApyBreakdown
                  renderType="accordion"
                  pool={pool}
                  simulatedPool={simulatedPool}
                  balanceMutations={balanceMutations}
                />
                {isUserConnected && (
                  <AccountPoolDailyEarnings pool={pool} simulatedPool={simulatedPool} />
                )}
              </>
            )}
            {detail === 'Position' &&
              (isUserConnected ? (
                <BalanceUpdates pool={pool} balanceMutations={balanceMutations} />
              ) : (
                <p>Connect your wallet to see your position.</p>
              ))}
            {detail === 'Risk' && (
              <p>
                Collateral supports your borrowing position. Review your account health before
                confirming.
              </p>
            )}
          </div>
          {isUserConnected && shouldShowAccountHealth({ pool, simulatedPool }) && (
            <div className="lite-supply-health">
              <AccountPoolHealth
                pool={pool}
                simulatedPool={simulatedPool}
                compact={detail !== 'Risk'}
              />
            </div>
          )}
        </aside>
      ) : streamlined && isUserConnected ? (
        <div className="lite-info-stack">
          <ApyBreakdown
            pool={pool}
            simulatedPool={simulatedPool}
            balanceMutations={balanceMutations}
            renderType="block"
          />
          <BalanceUpdates pool={pool} balanceMutations={balanceMutations} />
          {penalty ?? <AccountPoolDailyEarnings pool={pool} simulatedPool={simulatedPool} />}
        </div>
      ) : isUserConnected ? (
        <>
          <BalanceUpdates pool={pool} balanceMutations={balanceMutations} />

          {showApyBreakdown && (
            <>
              <Delimiter />

              <ApyBreakdown
                pool={pool}
                simulatedPool={simulatedPool}
                balanceMutations={balanceMutations}
                renderType="accordion"
              />
            </>
          )}

          <Delimiter />

          {shouldShowAccountHealth({ pool, simulatedPool }) && (
            <AccountPoolHealth pool={pool} simulatedPool={simulatedPool} />
          )}

          {penalty ?? <AccountPoolDailyEarnings pool={pool} simulatedPool={simulatedPool} />}
        </>
      ) : (
        <>
          <ApyBreakdown
            pool={pool}
            balanceMutations={balanceMutations}
            renderType={streamlined || collapseApy ? 'accordion' : 'block'}
          />
          {penalty}
        </>
      )}

      {beforeSubmit}
      <InlineSubmit>
        {streamlined && isUserConnected && shouldShowAccountHealth({pool, simulatedPool}) && (
          <div className="lite-action-health"><AccountPoolHealth pool={pool} simulatedPool={simulatedPool} /></div>
        )}
        <TxFormSubmitButton
          approval={approval}
          submitButtonLabel={submitButtonLabel}
          isFormValid={isFormValid}
          simulatedPool={simulatedPool}
          balanceMutations={balanceMutations}
          isUserAcknowledgingRisk={isUserAcknowledgingRisk}
          setAcknowledgeRisk={setAcknowledgeRisk}
          isUserAcknowledgingHighPriceImpact={isUserAcknowledgingHighPriceImpact}
          setAcknowledgeHighPriceImpact={setAcknowledgeHighPriceImpact}
          isLoading={isLoading}
          swapFromToken={swapFromToken}
          swapToToken={swapToToken}
          swapPriceImpactPercentage={swapQuote?.priceImpactPercentage}
          analyticVariant={analyticVariant}
        />
      </InlineSubmit>
    </div>
  );
};
