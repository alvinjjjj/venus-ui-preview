import BigNumber from 'bignumber.js';
import { Button } from '@venusprotocol/ui';
import { ApyBreakdown } from '../ApyBreakdown';
import { useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';

import { useGetSwapQuote, useSupply, useSwapTokensAndSupply } from 'clients/api';
import {
  Delimiter,
  LabeledInlineContent,
  SelectTokenTextField,
  SpendingLimit,
  Toggle,
  TokenTextField,
} from 'components';
import { NULL_ADDRESS } from 'constants/address';
import { SwitchChainNotice } from 'containers/SwitchChainNotice';
import { useCollateral } from 'hooks/useCollateral';
import useDebounceValue from 'hooks/useDebounceValue';
import { useGetContractAddress } from 'hooks/useGetContractAddress';
import { useGetUserSlippageTolerance } from 'hooks/useGetUserSlippageTolerance';
import { useIsFeatureEnabled } from 'hooks/useIsFeatureEnabled';
import { useSimulatePoolMutations } from 'hooks/useSimulatePoolMutations';
import useTokenApproval from 'hooks/useTokenApproval';
import { useAnalytics } from 'libs/analytics';
import { VError, handleError } from 'libs/errors';
import { useTranslation } from 'libs/translations';
import { useAccountAddress, useAccountChainId, useChainId } from 'libs/wallet';
import type { Asset, AssetBalanceMutation, Pool } from 'types';
import {
  areTokensEqual,
  convertMantissaToTokens,
  convertTokensToMantissa,
  formatTokensToReadableValue,
  getSwapToTokenAmount,
  isCollateralActionDisabled,
} from 'utilities';
import { Footer } from '../Footer';
import type { Approval } from '../Footer/types';
import { calculateAmountDollars } from '../calculateAmountDollars';
import { useGetOperationFormTokenBalances } from '../useGetOperationFormTokenBalances';
import { useDemoVhMarketStore } from 'demo/demoVhMarket';
import { useLiteNativeCollateralStore } from 'demo/liteNativeCollateral';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import TEST_IDS from './testIds';
import useForm, { type FormValues } from './useForm';

export interface SupplyFormProps {
  collateralSelector?: React.ReactElement;
  asset: Asset;
  pool: Pool;
  onSubmitSuccess?: () => void;
  compact?: boolean;
  streamlined?: boolean;
  marketDetails?: React.ReactNode;
  cardLayout?: boolean;
  marketName?: string;
}

const SupplyForm: React.FC<SupplyFormProps> = ({
  asset,
  pool,
  onSubmitSuccess,
  compact = false,
  streamlined = false,
  collateralSelector,
  marketDetails,
  cardLayout = false,
  marketName,
}) => {
  const { t } = useTranslation();
  const [reviewing, setReviewing] = useState(false);
  const { captureAnalyticEvent } = useAnalytics();

  const { chainId: accountChainId } = useAccountChainId();
  const { chainId } = useChainId();

  const { accountAddress } = useAccountAddress();
  const isUserConnected = !!accountAddress;

  const isWrapUnwrapNativeTokenEnabled = useIsFeatureEnabled({
    name: 'wrapUnwrapNativeToken',
  });
  const isIntegratedSwapEnabled = useIsFeatureEnabled({
    name: 'integratedSwap',
  });
  // Lite rule: the Supply modal only supplies the token of the row the user opened.
  // Exception: WBNB in Core (WBNB or BNB, via canWrapNativeToken). Pro is unchanged.
  const { isLite } = useInterfaceMode();
  const isIntegratedSwapFeatureEnabled =
    !isLite &&
    isIntegratedSwapEnabled &&
    // Check swap and supply action is enabled for underlying token
    !asset.disabledTokenActions.includes('swapAndSupply');

  const { address: nativeTokenGatewayContractAddress } = useGetContractAddress({
    name: 'NativeTokenGateway',
    poolComptrollerContractAddress: pool.comptrollerAddress,
  });

  const { address: swapRouterV2ContractAddress } = useGetContractAddress({
    name: 'SwapRouterV2',
  });

  const { toggleCollateral } = useCollateral();

  const canWrapNativeToken =
    isWrapUnwrapNativeTokenEnabled && !!asset.vToken.underlyingToken.tokenWrapped;

  const { tokenBalances, userWalletNativeTokenBalanceTokens } = useGetOperationFormTokenBalances({
    poolComptrollerContractAddress: pool.comptrollerAddress,
    accountAddress,
    underlyingToken: asset.vToken.underlyingToken,
    isIntegratedSwapFeatureEnabled,
    canWrapNativeToken,
    action: 'supply',
  });

  // Lite borrow modal: "BNB (WBNB market)" picked as collateral -> start on native BNB.
  const liteNativeCollateralVToken = useLiteNativeCollateralStore(state => state.nativeForVToken);
  const isLiteNativeCollateral =
    isLite && canWrapNativeToken && liteNativeCollateralVToken === asset.vToken.address;
  const shouldSelectNativeToken =
    isLiteNativeCollateral ||
    (!collateralSelector && canWrapNativeToken && userWalletNativeTokenBalanceTokens?.gt(asset.userWalletBalanceTokens));

  const initialFormValues: FormValues = useMemo(
    () => ({
      amountTokens: '',
      fromToken:
        shouldSelectNativeToken && asset.vToken.underlyingToken.tokenWrapped
          ? asset.vToken.underlyingToken.tokenWrapped
          : asset.vToken.underlyingToken,
      acknowledgeHighPriceImpact: false,
    }),
    [asset.vToken.underlyingToken, shouldSelectNativeToken],
  );

  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

  // Lite only: in the WBNB market, label native BNB as "BNB (WBNB market)" so users can tell it
  // apart from the standalone BNB market (agreed with Zed Liang / Cuzz). Display only.
  const liteLabelNative = <T extends { isNative?: boolean; symbol: string }>(token: T): T =>
    isLite && canWrapNativeToken && token.isNative
      ? { ...token, symbol: `${token.symbol} (${asset.vToken.underlyingToken.symbol} market)` }
      : token;
  const selectTokenBalances = useMemo(
    () => tokenBalances.map(item => ({ ...item, token: liteLabelNative(item.token) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenBalances, isLite, canWrapNativeToken, asset.vToken.underlyingToken.symbol],
  );

  // Lite only: Core market whose underlying is a vhToken. The selector offers the vhToken and
  // its underlying; the default is whichever has the higher wallet balance (UI only here).
  const demoVhToken = useDemoVhMarketStore(state => state.vhToken);
  const demoVhUnderlying = useDemoVhMarketStore(state => state.underlyingToken);
  const demoVhUnderlyingBalance = useDemoVhMarketStore(state => state.underlyingBalanceTokens);
  const isDemoVhMarket =
    isLite && !collateralSelector && !!demoVhToken && !!demoVhUnderlying &&
    areTokensEqual(demoVhToken, asset.vToken.underlyingToken);
  const vhWalletBalance = asset.userWalletBalanceTokens ?? new BigNumber(0);
  const underlyingWalletBalance = demoVhUnderlyingBalance ?? new BigNumber(0);
  const demoVhTokenBalances = useMemo(
    () =>
      demoVhToken && demoVhUnderlying
        ? [
            {
              token: demoVhToken,
              balanceMantissa: convertTokensToMantissa({ value: vhWalletBalance, token: demoVhToken }),
            },
            {
              token: demoVhUnderlying,
              balanceMantissa: convertTokensToMantissa({
                value: underlyingWalletBalance,
                token: demoVhUnderlying,
              }),
            },
          ]
        : [],
    [demoVhToken, demoVhUnderlying, vhWalletBalance, underlyingWalletBalance],
  );
  const [demoVhSelected, setDemoVhSelected] = useState<typeof demoVhToken>();
  const demoVhSelectedToken =
    demoVhSelected ??
    (underlyingWalletBalance.gt(vhWalletBalance) ? demoVhUnderlying : demoVhToken);

  // Reset form when user disconnects their wallet
  useEffect(() => {
    if (!accountAddress) {
      setFormValues(initialFormValues);
    }
  }, [accountAddress, initialFormValues]);

  // Reset form when initial values change, which indicates the base asset was changed
  useEffect(() => {
    setFormValues(initialFormValues);
  }, [initialFormValues]);

  // a user is trying to wrap the chain's native token if
  // 1) the wrap/unwrap feature is enabled
  // 2) the selected form token is the native token
  // 3) the market's underlying token wraps the native token
  const isWrappingNativeToken = canWrapNativeToken && !!formValues.fromToken.isNative;

  const isUsingSwap =
    isIntegratedSwapFeatureEnabled &&
    !isWrappingNativeToken &&
    !areTokensEqual(asset.vToken.underlyingToken, formValues.fromToken);

  let spenderAddress: undefined | Address = asset.vToken.address;

  if (isWrappingNativeToken) {
    spenderAddress = nativeTokenGatewayContractAddress;
  } else if (isUsingSwap) {
    spenderAddress = swapRouterV2ContractAddress;
  }

  const {
    isTokenApproved: isFromTokenApproved,
    isApproveTokenLoading: isApproveFromTokenLoading,
    walletSpendingLimitTokens: fromTokenWalletSpendingLimitTokens,
    revokeWalletSpendingLimit: revokeFromTokenWalletSpendingLimit,
    isRevokeWalletSpendingLimitLoading: isRevokeFromTokenWalletSpendingLimitLoading,
  } = useTokenApproval({
    token: formValues.fromToken,
    spenderAddress,
    accountAddress,
  });

  const { mutateAsync: supply, isPending: isSupplyLoading } = useSupply();

  const { mutateAsync: swapExactTokensForTokensAndSupply, isPending: isSwapAndSupplyLoading } =
    useSwapTokensAndSupply({
      poolName: pool.name,
      poolComptrollerAddress: pool.comptrollerAddress,
      vToken: asset.vToken,
      isSwappingNative: !!formValues.fromToken.isNative,
    });

  const isSubmitting = isSupplyLoading || isSwapAndSupplyLoading;

  const onSubmit = async () => {
    const amountMantissa = convertTokensToMantissa({
      value: new BigNumber(formValues.amountTokens.trim()),
      token: formValues.fromToken,
    });

    // Handle supply flow
    if (!isUsingSwap && !isWrappingNativeToken) {
      return supply({
        amountMantissa,
        poolName: pool.name,
        vToken: asset.vToken,
      });
    }

    if (isWrappingNativeToken) {
      return supply({
        poolName: pool.name,
        vToken: asset.vToken,
        amountMantissa,
        wrap: true,
        poolComptrollerContractAddress: pool.comptrollerAddress,
      });
    }

    // Throw an error if we're meant to execute a swap but no swap was
    // passed through props. This should never happen since the form is
    // disabled while swap infos are being fetched, but we add this logic
    // as a safeguard
    if (!swapQuote) {
      throw new VError({ type: 'unexpected', code: 'somethingWentWrong' });
    }

    return swapExactTokensForTokensAndSupply({
      swapQuote,
    });
  };

  const debouncedFormAmountTokens = useDebounceValue(formValues.amountTokens);
  const fromTokenAmountTokens = new BigNumber(debouncedFormAmountTokens || 0);

  const { userSlippageTolerancePercentage } = useGetUserSlippageTolerance();
  const {
    data: getSwapQuoteData,
    error: getSwapQuoteError,
    isLoading: isGetSwapQuoteLoading,
  } = useGetSwapQuote(
    {
      fromToken: formValues.fromToken,
      fromTokenAmountTokens,
      toToken: asset.vToken.underlyingToken,
      direction: 'exact-in',
      recipientAddress: swapRouterV2ContractAddress || NULL_ADDRESS,
      slippagePercentage: userSlippageTolerancePercentage,
    },
    {
      enabled:
        isUsingSwap && !!swapRouterV2ContractAddress && fromTokenAmountTokens.isGreaterThan(0),
    },
  );
  const swapQuote = getSwapQuoteData?.swapQuote;

  const approval: Approval | undefined = spenderAddress
    ? {
        type: 'token',
        token: formValues.fromToken,
        spenderAddress,
      }
    : undefined;

  const fromTokenUserWalletBalanceTokens = useMemo(() => {
    const tokenBalance = tokenBalances.find(item =>
      areTokensEqual(item.token, formValues.fromToken),
    );

    return (
      tokenBalance?.balanceMantissa &&
      convertMantissaToTokens({
        value: tokenBalance.balanceMantissa,
        token: tokenBalance.token,
      })
    );
  }, [tokenBalances, formValues.fromToken]);

  // Determine the amount of tokens the user can supply, taking the supply cap, their wallet
  // balance and spending limit in consideration
  const limitTokens = useMemo(() => {
    // If user is using swap, we fill the input with the user's wallet balance as we don't have a
    // way to know in advance exactly how much of the fromToken they can supply to
    let amountTokens = new BigNumber(fromTokenUserWalletBalanceTokens || 0);

    // If user has set a spending limit for fromToken, then we take it in consideration
    if (fromTokenWalletSpendingLimitTokens?.isGreaterThan(0)) {
      amountTokens = BigNumber.min(amountTokens, fromTokenWalletSpendingLimitTokens);
    }

    // Take supply cap in consideration, if user is not swapping
    if (!isUsingSwap) {
      const marginWithSupplyCapTokens = asset.supplyCapTokens.isEqualTo(0)
        ? new BigNumber(0)
        : asset.supplyCapTokens
            .minus(asset.supplyBalanceTokens)
            // supplyBalanceTokens is derived from a division, so it carries more decimals than the
            // token supports. Round down to keep the amount representable and under the cap.
            .dp(asset.vToken.underlyingToken.decimals, BigNumber.ROUND_DOWN);

      amountTokens = BigNumber.min(amountTokens, marginWithSupplyCapTokens);
    }

    return amountTokens;
  }, [
    isUsingSwap,
    asset.supplyBalanceTokens,
    fromTokenUserWalletBalanceTokens,
    fromTokenWalletSpendingLimitTokens,
    asset.supplyCapTokens,
    asset.vToken.underlyingToken.decimals,
  ]);

  let toTokenAmountTokens =
    isUsingSwap && swapQuote ? getSwapToTokenAmount(swapQuote) : debouncedFormAmountTokens;
  toTokenAmountTokens = new BigNumber(toTokenAmountTokens || 0);

  const balanceMutations: AssetBalanceMutation[] = [
    {
      type: 'asset',
      vTokenAddress: asset.vToken.address,
      action: 'supply',
      amountTokens: toTokenAmountTokens,
    },
  ];

  const { data: getSimulatedPoolData } = useSimulatePoolMutations({
    pool,
    balanceMutations,
  });
  const simulatedPool = getSimulatedPoolData?.pool;

  const { handleSubmit, isFormValid, formError } = useForm({
    asset,
    simulatedPool,
    balanceMutations,
    fromTokenUserWalletBalanceTokens,
    pool,
    fromTokenWalletSpendingLimitTokens,
    isFromTokenApproved,
    swapQuote,
    swapQuoteErrorCode: getSwapQuoteError?.code,
    onSubmit,
    formValues,
    setFormValues,
    onSubmitSuccess,
  });

  const readableFromTokenUserWalletBalanceTokens = formatTokensToReadableValue({
    value: fromTokenUserWalletBalanceTokens,
    token: formValues.fromToken,
  });

  const isAccountOnWrongChain = accountChainId !== chainId;
  const isCollateralToggleDisabled = isCollateralActionDisabled({
    disabledTokenActions: asset.disabledTokenActions,
    isCollateralOfUser: asset.isCollateralOfUser,
  });

  const captureAmountSetAnalyticEvent = ({
    amountTokens,
    maxSelected,
  }: {
    amountTokens: BigNumber | string;
    maxSelected: boolean;
  }) => {
    if (Number(formValues.amountTokens) > 0) {
      captureAnalyticEvent(
        'supply_amount_set',
        {
          poolName: pool.name,
          assetSymbol: asset.vToken.underlyingToken.symbol,
          usdAmount: calculateAmountDollars({
            amountTokens,
            tokenPriceCents: asset.tokenPriceCents,
          }),
          maxSelected,
        },
        {
          debounced: true,
        },
      );
    }
  };

  const handleToggleCollateral = async () => {
    try {
      await toggleCollateral({
        asset,
        poolName: pool.name,
        comptrollerAddress: pool.comptrollerAddress,
      });
    } catch (error) {
      handleError({ error });
    }
  };

  const handleRightMaxButtonClick = () => {
    captureAmountSetAnalyticEvent({
      amountTokens: limitTokens,
      maxSelected: true,
    });

    setFormValues(currentFormValues => ({
      ...currentFormValues,
      amountTokens: limitTokens.toFixed(),
    }));
  };

  const collateralControl = (
<LabeledInlineContent
        className={compact || streamlined ? 'lite-collateral-control' : undefined}
        label={t('marketForm.collateral')}
      >
        <Toggle
          onChange={handleToggleCollateral}
          value={
            asset.isCollateralOfUser && (!pool.userEModeGroup || asset.userCollateralFactor > 0)
          }
          disabled={
            !isUserConnected ||
            isAccountOnWrongChain ||
            isCollateralToggleDisabled ||
            (pool.userEModeGroup && asset.userCollateralFactor === 0)
          }
        />
      </LabeledInlineContent>
  );

  const inputFields = (
    <>
      {!cardLayout && collateralControl}

      {isDemoVhMarket && demoVhSelectedToken ? (
        <SelectTokenTextField
          data-testid={TEST_IDS.selectTokenTextField}
          selectedToken={demoVhSelectedToken}
          value={formValues.amountTokens}
          disabled={!isUserConnected || isSubmitting}
          onChange={amountTokens =>
            setFormValues(currentFormValues => ({ ...currentFormValues, amountTokens }))
          }
          onChangeSelectedToken={token => {
            setDemoVhSelected(token);
            setFormValues(currentFormValues => ({
              ...currentFormValues,
              amountTokens: initialFormValues.amountTokens,
            }));
          }}
          rightMaxButton={{
            label: t('marketForm.rightMaxButtonLabel'),
            onClick: handleRightMaxButtonClick,
          }}
          tokenBalances={demoVhTokenBalances}
        />
      ) : !collateralSelector && (isIntegratedSwapFeatureEnabled || canWrapNativeToken) ? (
        <SelectTokenTextField
          data-testid={TEST_IDS.selectTokenTextField}
          selectedToken={formValues.fromToken}
          value={formValues.amountTokens}
          hasError={!isSubmitting && !!formError && Number(formValues.amountTokens) > 0}
          disabled={
            !isUserConnected ||
            isSubmitting ||
            isApproveFromTokenLoading ||
            formError?.code === 'SUPPLY_CAP_ALREADY_REACHED'
          }
          onChange={amountTokens => {
            captureAmountSetAnalyticEvent({
              amountTokens,
              maxSelected: false,
            });

            setFormValues(currentFormValues => ({
              ...currentFormValues,
              amountTokens,
            }));
          }}
          onChangeSelectedToken={selected => {
            // Map the display-labelled token back to the original token object.
            const fromToken =
              tokenBalances.find(item => areTokensEqual(item.token, selected))?.token ?? selected;
            setFormValues(currentFormValues => ({
              ...currentFormValues,
              amountTokens: initialFormValues.amountTokens,
              fromToken,
            }));
          }}
          rightMaxButton={{
            label: t('marketForm.rightMaxButtonLabel'),
            onClick: handleRightMaxButtonClick,
          }}
          tokenBalances={selectTokenBalances}
          description={
            !isSubmitting && !!formError?.message ? (
              <p className="text-red">{formError.message}</p>
            ) : undefined
          }
        />
      ) : (
        <TokenTextField
          id={cardLayout ? "e3-supply-amount" : undefined}
          label={cardLayout ? "You supply" : undefined}
          className={cardLayout ? "lite-e3-amount" : undefined}
          leftAdornment={collateralSelector}
          displayTokenIcon={!collateralSelector}
          data-testid={TEST_IDS.tokenTextField}
          name="amountTokens"
          token={asset.vToken.underlyingToken}
          value={formValues.amountTokens}
          onChange={amountTokens => {
            captureAmountSetAnalyticEvent({
              amountTokens,
              maxSelected: false,
            });

            setFormValues(currentFormValues => ({
              ...currentFormValues,
              amountTokens,
            }));
          }}
          disabled={
            (!cardLayout && !isUserConnected) ||
            isSubmitting ||
            isApproveFromTokenLoading ||
            formError?.code === 'SUPPLY_CAP_ALREADY_REACHED'
          }
          rightMaxButton={{
            label: t('marketForm.rightMaxButtonLabel'),
            disabled: !isUserConnected,
            onClick: handleRightMaxButtonClick,
          }}
          hasError={
            isUserConnected && !isSubmitting && !!formError && Number(formValues.amountTokens) > 0
          }
          description={
            isUserConnected && !isSubmitting && !!formError?.message ? (
              <p className="text-red">{formError.message}</p>
            ) : undefined
          }
        />
      )}

      {streamlined && !isUserConnected && (
        <div className="lite-wallet-stat">
          <LabeledInlineContent label={t('marketForm.walletBalance')}>—</LabeledInlineContent>
        </div>
      )}
      {isUserConnected && (
        <>
          <div className={streamlined ? 'lite-wallet-stat space-y-2' : 'space-y-2'}>
            <LabeledInlineContent label={t('marketForm.walletBalance')}>
              {readableFromTokenUserWalletBalanceTokens}
            </LabeledInlineContent>

            <SpendingLimit
              token={formValues.fromToken}
              walletBalanceTokens={fromTokenUserWalletBalanceTokens}
              walletSpendingLimitTokens={fromTokenWalletSpendingLimitTokens}
              onRevoke={revokeFromTokenWalletSpendingLimit}
              isRevokeLoading={isRevokeFromTokenWalletSpendingLimitLoading}
              data-testid={TEST_IDS.spendingLimit}
            />
          </div>

          {!compact && !streamlined && <Delimiter />}
        </>
      )}
    </>
  );

  return (
    <form onSubmit={event => {
      if (cardLayout && !reviewing) {
        event.preventDefault();
        if (new BigNumber(formValues.amountTokens).isFinite() && new BigNumber(formValues.amountTokens).gt(0)) setReviewing(true);
        return;
      }
      return handleSubmit(event);
    }} className={cardLayout ? "lite-e3-supply-card" : undefined}>
      <div
        className={compact ? 'lite-supply-grid' : streamlined ? 'lite-simple-fields' : 'space-y-4'}
      >
        <SwitchChainNotice />
        {cardLayout && <div className="lite-e3-step-heading" aria-live="polite"><span>{reviewing ? 'Review supply' : 'Supply'}</span><span className="text-light-grey text-sm">{reviewing ? '2 / 2' : '1 / 2'}</span></div>}
        {cardLayout && reviewing ? (
          <>
            <Button type="button" size="sm" variant="secondary" disabled={isSubmitting || isApproveFromTokenLoading} onClick={() => setReviewing(false)}>Back to edit</Button>
            <div className="lite-e3-review-summary">
              <div className="lite-e3-review-amount">{new BigNumber(formValues.amountTokens).toFormat()} <span>{asset.vToken.underlyingToken.symbol}</span></div>
              <p className="text-light-grey">Supply to {marketName}</p>
            </div>
            <LabeledInlineContent label="Network fee">Shown in wallet before confirmation</LabeledInlineContent>
            {formError?.message && isUserConnected && <p role="alert" className="text-red">{formError.message}</p>}
          </>
        ) : (
          <>
            {streamlined ? <div className="lite-input-group">{inputFields}</div> : inputFields}
            {!cardLayout && marketDetails}
          </>
        )}
        {cardLayout && !reviewing ? (
          <>
            <div className="lite-e3-destination-summary">
              {marketDetails}
              <ApyBreakdown pool={pool} balanceMutations={balanceMutations} renderType="accordion" />
            </div>
            <Button type="submit" variant="secondary" className="w-full lite-e3-review-button" disabled={!new BigNumber(formValues.amountTokens).isFinite() || !new BigNumber(formValues.amountTokens).gt(0)}>Review supply</Button>
          </>
        ) : (
        <Footer
          beforeSubmit={cardLayout ? collateralControl : undefined}
          collapseApy={cardLayout}
          streamlined={streamlined}
          compact={compact}
          analyticVariant="supply_form"
          balanceMutations={balanceMutations}
          pool={pool}
          submitButtonLabel={t('marketForm.submitButtonLabel.supply')}
          isFormValid={isFormValid}
          approval={approval}
          simulatedPool={simulatedPool}
          swapFromToken={isUsingSwap ? formValues.fromToken : undefined}
          swapToToken={isUsingSwap ? asset.vToken.underlyingToken : undefined}
          swapQuote={swapQuote}
          isUserAcknowledgingHighPriceImpact={formValues.acknowledgeHighPriceImpact}
          setAcknowledgeHighPriceImpact={acknowledgeHighPriceImpact =>
            setFormValues(currentFormValues => ({
              ...currentFormValues,
              acknowledgeHighPriceImpact,
            }))
          }
          isLoading={isSubmitting || isGetSwapQuoteLoading}
        />
        )}
      </div>
    </form>
  );
};

export default SupplyForm;
