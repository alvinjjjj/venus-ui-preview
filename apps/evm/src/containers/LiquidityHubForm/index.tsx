import { ApyBreakdown, Button, Delimiter, Tabs, TokenTextField } from 'components';
import LiquidityHubAccessor from 'containers/LiquidityHubAccessor';
import { useDemo } from 'demo/state';
import type { TabNavType } from 'hooks/useTabs';
import { useState } from 'react';
import type { VhToken } from 'types';

export interface LiquidityHubFormProps {
  vhToken: VhToken;
  initialActiveTabId?: string;
  onSubmitSuccess?: () => void;
  navType?: TabNavType;
}

export const LiquidityHubForm = ({
  vhToken,
  initialActiveTabId,
  navType,
}: LiquidityHubFormProps) => {
  const { loggedIn, setLoginOpen } = useDemo();
  const [amount, setAmount] = useState('');
  const [supplied, setSupplied] = useState(500);
  const [message, setMessage] = useState('');
  return (
    <LiquidityHubAccessor vhToken={vhToken}>
      {({ liquidityHub }) => (
        <Tabs
          variant="secondary"
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
                  className="space-y-4"
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
                      <p className="text-light-grey text-b1r">
                        {action === 'supply' ? 'Wallet balance' : 'Supplied balance'}:{' '}
                        {balance.toLocaleString()} {vhToken.underlyingToken.symbol}
                      </p>
                      <Delimiter />
                    </>
                  )}
                  <ApyBreakdown
                    items={[
                      {
                        type: 'supply',
                        token: vhToken.underlyingToken,
                        baseApyPercentage: liquidityHub.supplyApyPercentage,
                        tokenDistributions: liquidityHub.supplyTokenDistributions,
                      },
                    ]}
                    renderType="block"
                  />
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
                </form>
              ),
            };
          })}
        />
      )}
    </LiquidityHubAccessor>
  );
};
