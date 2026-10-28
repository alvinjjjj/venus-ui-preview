import { ApyBreakdown, Button, Delimiter, Tabs, TokenTextField } from 'components';
import LiquidityHubAccessor from 'containers/LiquidityHubAccessor';
import { useDemo } from 'demo/state';
import type { TabNavType } from 'hooks/useTabs';
import { useState } from 'react';
import type { VhToken } from 'types';
import { EarnDetails } from 'containers/MarketForm/EarnDetails';
import { InlineSubmit } from 'containers/MarketForm/InlineSubmit';
import { isLocalPreview } from 'demo/isLocalPreview';
import { useTranslation } from 'libs/translations';
import { SupplyTabs } from './SupplyTabs';
import { WithdrawForm } from './WithdrawForm';

export interface LiquidityHubFormProps {
  supplyOnly?: boolean;
  walletFirst?: boolean;
  compactEarn?: boolean;
  inlineHeader?: boolean;
  actionTabsVariant?: 'primary' | 'secondary';
  vhToken: VhToken;
  initialActiveTabId?: string;
  onSubmitSuccess?: () => void;
  navType?: TabNavType;
}

export const LiquidityHubForm = (props: LiquidityHubFormProps) =>
  isLocalPreview ? <RealLiquidityHubForm {...props} /> : <PreviewLiquidityHubForm {...props} />;

/** Upstream Venus form (real balances, approvals and transactions). Local dev server only. */
const RealLiquidityHubForm = ({
  vhToken,
  initialActiveTabId,
  navType,
  onSubmitSuccess,
  compactEarn = false,
  inlineHeader = false,
  supplyOnly = false,
  walletFirst = false,
  actionTabsVariant,
}: LiquidityHubFormProps) => {
  const { t } = useTranslation();
  return (
    <Tabs
      hideHeader={supplyOnly}
      variant={actionTabsVariant ?? (compactEarn || inlineHeader ? 'primary' : 'secondary')}
      className={
        compactEarn
          ? 'lite-compact-market-tabs'
          : inlineHeader
            ? 'lite-single-market-tabs'
            : undefined
      }
      headerClassName={compactEarn || inlineHeader ? 'lite-compact-market-switch' : undefined}
      initialActiveTabId={initialActiveTabId}
      navType={navType}
      tabs={[
        {
          id: 'supply',
          title: t('liquidityHubForm.supplyTabTitle'),
          content: (
            <LiquidityHubAccessor vhToken={vhToken}>
              {({ liquidityHub }) => (
                <SupplyTabs liquidityHub={liquidityHub} onSubmitSuccess={onSubmitSuccess} walletFirst={walletFirst} />
              )}
            </LiquidityHubAccessor>
          ),
        },
        {
          id: 'withdraw',
          title: t('liquidityHubForm.withdrawTabTitle'),
          content: (
            <LiquidityHubAccessor vhToken={vhToken}>
              {({ liquidityHub }) => (
                <WithdrawForm liquidityHub={liquidityHub} onSubmitSuccess={onSubmitSuccess} />
              )}
            </LiquidityHubAccessor>
          ),
        },
      ]}
    />
  );
};

/** Simulated form used on deployed previews: no wallet transaction is ever sent. */
const PreviewLiquidityHubForm = ({
  vhToken,
  initialActiveTabId,
  navType,
  compactEarn = false,
  inlineHeader = false,
  supplyOnly = false,
  actionTabsVariant,
}: LiquidityHubFormProps) => {
  const { loggedIn, setLoginOpen } = useDemo();
  const [amount, setAmount] = useState('');
  const [supplied, setSupplied] = useState(500);
  const [message, setMessage] = useState('');
  return (
    <LiquidityHubAccessor vhToken={vhToken}>
      {({ liquidityHub }) => (
        <Tabs
      hideHeader={supplyOnly}
          variant={actionTabsVariant ?? (compactEarn || inlineHeader ? 'primary' : 'secondary')}
          className={
            compactEarn
              ? 'lite-compact-market-tabs'
              : inlineHeader
                ? 'lite-single-market-tabs'
                : undefined
          }
          headerClassName={compactEarn || inlineHeader ? 'lite-compact-market-switch' : undefined}
          initialActiveTabId={initialActiveTabId}
          navType={navType}
          tabs={['supply', 'withdraw'].map(action => {
            const balance = action === 'supply' ? 2500 - supplied : supplied;
            const valid =
              Number.isFinite(Number(amount)) && Number(amount) > 0 && Number(amount) <= balance;
            return {
              id: action,
              title: action === 'supply' ? 'Supply' : 'Withdraw',
              content: (
                <form
                  className={
                    compactEarn ? 'lite-hub-grid' : inlineHeader ? 'lite-simple-hub' : 'space-y-4'
                  }
                  onSubmit={event => {
                    event.preventDefault();
                    if (!loggedIn) {
                      setLoginOpen(true);
                      return;
                    }
                    if (!valid) return;
                    setSupplied(value => value + Number(amount) * (action === 'supply' ? 1 : -1));
                    setMessage(
                      `${
                        action === 'supply' ? 'Supply' : 'Withdraw'
                      } preview updated. No transaction was sent.`,
                    );
                    setAmount('');
                  }}
                >
                  <TokenTextField
                    aria-label="Token amount"
                    token={vhToken.underlyingToken}
                    value={amount}
                    onChange={value => {
                      setAmount(value);
                      setMessage('');
                    }}
                    disabled={!loggedIn}
                    rightMaxButton={{ label: 'MAX', onClick: () => setAmount(String(balance)) }}
                    hasError={!!amount && !valid}
                    description={
                      !!amount && !valid
                        ? 'Enter an amount within your available balance.'
                        : undefined
                    }
                  />
                  {loggedIn && (
                    <>
                      <p data-lite-balance-row="true" className="text-light-grey text-b1r">
                        <span>{action === 'supply' ? 'Wallet balance' : 'Supplied balance'}</span>{' '}
                        <span>
                          {balance.toLocaleString()} {vhToken.underlyingToken.symbol}
                        </span>
                      </p>
                      {!inlineHeader && <Delimiter />}
                    </>
                  )}
                  {compactEarn ? (
                    <EarnDetails
                      yieldContent={
                        <ApyBreakdown
                          items={[
                            {
                              type: 'supply',
                              token: vhToken.underlyingToken,
                              baseApyPercentage: liquidityHub.supplyApyPercentage,
                              tokenDistributions: liquidityHub.supplyTokenDistributions,
                            },
                          ]}
                          renderType="accordion"
                        />
                      }
                      position={
                        loggedIn ? (
                          <p>
                            Supplied balance: {supplied.toLocaleString()}{' '}
                            {vhToken.underlyingToken.symbol}
                          </p>
                        ) : (
                          <p>Connect your wallet to see your position.</p>
                        )
                      }
                      risk={<p>This is a preview. No transaction will be sent.</p>}
                    />
                  ) : (
                    <ApyBreakdown
                      items={[
                        {
                          type: 'supply',
                          token: vhToken.underlyingToken,
                          baseApyPercentage: liquidityHub.supplyApyPercentage,
                          tokenDistributions: liquidityHub.supplyTokenDistributions,
                        },
                      ]}
                      renderType={inlineHeader ? 'accordion' : 'block'}
                    />
                  )}
                  <InlineSubmit>
                    <Button
                      type="submit"
                      className="w-full"
                      data-liquidity-hub-submit="true"
                      data-liquidity-hub-amount-valid={loggedIn && valid}
                      disabled={loggedIn && !valid}
                    >
                      {loggedIn ? (action === 'supply' ? 'Supply' : 'Withdraw') : 'Connect Wallet'}
                    </Button>
                    {message && (
                      <p className="text-light-grey text-b1r" role="status">
                        {message}
                      </p>
                    )}
                  </InlineSubmit>
                </form>
              ),
            };
          })}
        />
      )}
    </LiquidityHubAccessor>
  );
};
