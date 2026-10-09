import type { SpokeMarket, SpokePool } from 'clients/api';
import { ButtonGroup, LabeledInlineContent, Select, Tabs, TokenTextField } from 'components';
import { ConnectWallet } from 'containers/ConnectWallet';
import { useTranslation } from 'libs/translations';
import { useState } from 'react';
import { formatPercentageToReadableValue } from 'utilities';

interface SpokeFormProps {
  pool: SpokePool;
  market: SpokeMarket;
}

/**
 * Preview of the Spoke operation panel: Collateral (supply / withdraw a pool collateral)
 * and Loan (borrow / repay the loan asset). Inputs are live; submitting needs a wallet on
 * BNB testnet. FE: wire to the Spoke comptroller actions.
 */
const CollateralForm: React.FC<SpokeFormProps> = ({ pool }) => {
  const { t } = useTranslation();
  const [action, setAction] = useState(0);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState<string>(pool.collateralMarkets[0]?.address ?? '');
  const collateral =
    pool.collateralMarkets.find(market => market.address === address) ?? pool.collateralMarkets[0];

  if (!collateral) return null;

  return (
    <div className="spoke-form__body">
      <ButtonGroup
        fullWidth
        buttonSize="sm"
        buttonLabels={[t('spoke.form.supply'), t('spoke.form.withdraw')]}
        activeButtonIndex={action}
        onButtonClick={setAction}
      />
      <Select
        size="medium"
        variant="tertiary"
        value={collateral.address}
        onChange={value => setAddress(String(value))}
        options={pool.collateralMarkets.map(market => ({
          value: market.address,
          label: (
            <span className="spoke-form__token">
              <img src={market.token.iconSrc} alt="" />
              {market.token.symbol}
            </span>
          ),
        }))}
      />
      <TokenTextField
        token={collateral.token}
        value={amount}
        onChange={setAmount}
        displayTokenIcon
        rightMaxButton={{ label: t('spoke.form.max'), onClick: () => setAmount('') }}
      />
      <div className="spoke-form__rows">
        <LabeledInlineContent label={t('spoke.form.maxLtv')}>
          {formatPercentageToReadableValue(collateral.collateralFactorPercentage)}
        </LabeledInlineContent>
        <LabeledInlineContent label={t('spoke.form.liquidationThreshold')}>
          {formatPercentageToReadableValue(collateral.liquidationThresholdPercentage)}
        </LabeledInlineContent>
      </div>
      <ConnectWallet />
    </div>
  );
};

const LoanForm: React.FC<SpokeFormProps> = ({ market }) => {
  const { t } = useTranslation();
  const [action, setAction] = useState(0);
  const [amount, setAmount] = useState('');

  return (
    <div className="spoke-form__body">
      <ButtonGroup
        fullWidth
        buttonSize="sm"
        buttonLabels={[t('spoke.form.borrow'), t('spoke.form.repay')]}
        activeButtonIndex={action}
        onButtonClick={setAction}
      />
      <TokenTextField
        token={market.token}
        value={amount}
        onChange={setAmount}
        displayTokenIcon
        rightMaxButton={{
          label: action === 0 ? t('spoke.form.safeMax') : t('spoke.form.max'),
          onClick: () => setAmount(''),
        }}
      />
      <div className="spoke-form__rows">
        <LabeledInlineContent label={t('spoke.form.borrowApy')} iconSrc={market.token}>
          {formatPercentageToReadableValue(market.borrowApyPercentage)}
        </LabeledInlineContent>
        <LabeledInlineContent label={t('spoke.form.totalBorrowApy')}>
          {formatPercentageToReadableValue(market.borrowApyPercentage)}
        </LabeledInlineContent>
      </div>
      <ConnectWallet />
    </div>
  );
};

export const SpokeForm: React.FC<SpokeFormProps> = props => {
  const { t } = useTranslation();

  return (
    <Tabs
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
