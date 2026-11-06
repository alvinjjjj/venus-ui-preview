import BigNumber from 'bignumber.js';
import type { SpokeMarket, SpokePool } from 'clients/api';
import {
  ApyBreakdown,
  ButtonGroup,
  Delimiter,
  LabeledInlineContent,
  PrimaryButton,
  QuaternaryButton,
  SelectTokenTextField,
  Tabs,
  TokenTextField,
} from 'components';
import { useTranslation } from 'libs/translations';
import { useState } from 'react';
import type { Token } from 'types';
import { formatPercentageToReadableValue, formatTokensToReadableValue } from 'utilities';

interface SpokeFormProps {
  pool: SpokePool;
  market: SpokeMarket;
}

/**
 * Preview of the Spoke operation panel, mirroring the live venus.io form fields.
 * Design preview: assumes a connected account that has supplied collateral, so the
 * balances below are illustrative. FE: wire to the Spoke comptroller actions.
 */
const PREVIEW = {
  availableToBorrowTokens: new BigNumber('1250'),
  borrowBalanceTokens: new BigNumber('500'),
  loanWalletBalanceTokens: new BigNumber('2000'),
  collateralWalletBalanceTokens: new BigNumber('5'),
  collateralSupplyBalanceTokens: new BigNumber('10'),
};
const PRESET_PERCENTAGES = [25, 50, 75, 100];

const tokens = (value: BigNumber, token: Token) =>
  formatTokensToReadableValue({ value, token });

// Preview: the CTA turns on for any amount within the limit; submitting is a no-op.
const SubmitButton: React.FC<{ amount: string; limit: BigNumber; label: string }> = ({
  amount,
  limit,
  label,
}) => {
  const { t } = useTranslation();
  const value = new BigNumber(amount || 0);
  const isValid = value.isGreaterThan(0) && value.isLessThanOrEqualTo(limit);
  return (
    <PrimaryButton className="w-full" disabled={!isValid} type="button">
      {isValid ? label : t('spoke.form.enterValidAmount')}
    </PrimaryButton>
  );
};

const toInput = (value: BigNumber) => value.decimalPlaces(6, BigNumber.ROUND_DOWN).toFixed();

const CollateralForm: React.FC<SpokeFormProps> = ({ pool }) => {
  const { t } = useTranslation();
  const [action, setAction] = useState(0);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState<string>(pool.collateralMarkets[0]?.address ?? '');
  const collateral =
    pool.collateralMarkets.find(market => market.address === address) ?? pool.collateralMarkets[0];

  if (!collateral) return null;
  const collateralLimit =
    action === 0 ? PREVIEW.collateralWalletBalanceTokens : PREVIEW.collateralSupplyBalanceTokens;

  return (
    <div className="spoke-form__body">
      <ButtonGroup
        fullWidth
        buttonSize="sm"
        buttonLabels={[t('spoke.form.supply'), t('spoke.form.withdraw')]}
        activeButtonIndex={action}
        onButtonClick={index => {
          setAction(index);
          setAmount('');
        }}
      />
      {/* Same token-select field as the Core / Hub forms: the pill opens the token list. */}
      <SelectTokenTextField
        selectedToken={collateral.token}
        onChangeSelectedToken={token => {
          const next = pool.collateralMarkets.find(market => market.token.address === token.address);
          if (next) setAddress(next.address);
          setAmount('');
        }}
        tokenBalances={pool.collateralMarkets.map(market => ({
          token: market.token,
          balanceMantissa: PREVIEW.collateralWalletBalanceTokens.shiftedBy(market.token.decimals),
        }))}
        value={amount}
        onChange={setAmount}
        rightMaxButton={{ label: t('spoke.form.max'), onClick: () => setAmount(toInput(collateralLimit)) }}
      />
      <div className="spoke-form__rows">
        <LabeledInlineContent label={t('spoke.form.walletBalance')}>
          {tokens(PREVIEW.collateralWalletBalanceTokens, collateral.token)}
        </LabeledInlineContent>
        <Delimiter />
        <LabeledInlineContent label={t('spoke.form.supplyBalance')} iconSrc={collateral.token}>
          {tokens(PREVIEW.collateralSupplyBalanceTokens, collateral.token)}
        </LabeledInlineContent>
        <Delimiter />
        <LabeledInlineContent label={t('spoke.form.maxLtv')}>
          {formatPercentageToReadableValue(collateral.collateralFactorPercentage)}
        </LabeledInlineContent>
        <LabeledInlineContent label={t('spoke.form.liquidationThreshold')}>
          {formatPercentageToReadableValue(collateral.liquidationThresholdPercentage)}
        </LabeledInlineContent>
      </div>
      <SubmitButton
        amount={amount}
        limit={collateralLimit}
        label={action === 0 ? t('spoke.form.supply') : t('spoke.form.withdraw')}
      />
    </div>
  );
};

const LoanForm: React.FC<SpokeFormProps> = ({ market }) => {
  const { t } = useTranslation();
  const [action, setAction] = useState(0);
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState<number>();
  const isBorrow = action === 0;
  // SAFE MAX keeps a 20% buffer below the available amount.
  const loanLimit = isBorrow
    ? PREVIEW.availableToBorrowTokens
    : BigNumber.minimum(PREVIEW.loanWalletBalanceTokens, PREVIEW.borrowBalanceTokens);
  const maxTokens = isBorrow ? PREVIEW.availableToBorrowTokens.times(0.8) : loanLimit;

  return (
    <div className="spoke-form__body">
      <ButtonGroup
        fullWidth
        buttonSize="sm"
        buttonLabels={[t('spoke.form.borrow'), t('spoke.form.repay')]}
        activeButtonIndex={action}
        onButtonClick={index => {
          setAction(index);
          setAmount('');
          setPercentage(undefined);
        }}
      />
      <TokenTextField
        token={market.token}
        value={amount}
        onChange={value => {
          setAmount(value);
          setPercentage(undefined);
        }}
        displayTokenIcon
        rightMaxButton={{
          label: isBorrow ? t('spoke.form.safeMax') : t('spoke.form.max'),
          onClick: () => {
            setAmount(toInput(maxTokens));
            setPercentage(isBorrow ? undefined : 100);
          },
        }}
      />

      {!isBorrow && (
        <div className="flex gap-x-2">
          {PRESET_PERCENTAGES.map(value => (
            <QuaternaryButton
              key={value}
              className="flex-1"
              size="xs"
              rounded
              active={value === percentage}
              onClick={() => {
                setPercentage(value);
                setAmount(toInput(PREVIEW.borrowBalanceTokens.times(value).div(100)));
              }}
            >
              {formatPercentageToReadableValue(value)}
            </QuaternaryButton>
          ))}
        </div>
      )}

      <div className="spoke-form__rows">
        {isBorrow ? (
          <LabeledInlineContent label={t('spoke.form.available')}>
            {tokens(PREVIEW.availableToBorrowTokens, market.token)}
          </LabeledInlineContent>
        ) : (
          <LabeledInlineContent label={t('spoke.form.walletBalance')}>
            {tokens(PREVIEW.loanWalletBalanceTokens, market.token)}
          </LabeledInlineContent>
        )}
        <Delimiter />
        <LabeledInlineContent label={t('spoke.form.borrowBalance')} iconSrc={market.token}>
          {formatTokensToReadableValue({
            value: PREVIEW.borrowBalanceTokens,
            token: market.token,
            addSymbol: false,
          })}
        </LabeledInlineContent>
        <Delimiter />
        <ApyBreakdown
          renderType="accordion"
          items={[
            {
              type: 'borrow',
              token: market.token,
              baseApyPercentage: new BigNumber(market.borrowApyPercentage),
              tokenDistributions: [],
            },
          ]}
        />
      </div>
      <SubmitButton
        amount={amount}
        limit={loanLimit}
        label={isBorrow ? t('spoke.form.borrow') : t('spoke.form.repay')}
      />
    </div>
  );
};

export const SpokeForm: React.FC<SpokeFormProps> = props => {
  const { t } = useTranslation();

  return (
    <Tabs
      // Hub tab class: tab bar → action switch is 12px, like the Hub/Lite forms.
      className="venus-liquidity-hub-tabs"
      variant="secondary"
      navType="searchParam"
      initialActiveTabId="loan"
      tabs={[
        {
          id: 'collateral',
          title: t('spoke.form.collateral'),
          content: <CollateralForm {...props} />,
        },
        { id: 'loan', title: t('spoke.form.loan'), content: <LoanForm {...props} /> },
      ]}
    />
  );
};
