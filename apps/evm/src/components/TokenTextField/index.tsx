import { type ButtonProps, TertiaryButton } from '@venusprotocol/ui';
import BigNumber from 'bignumber.js';
import { createContext, useContext, forwardRef, type ReactNode } from 'react';

import type { Token } from 'types';

import { useTranslation } from 'libs/translations';
import formatCentsToReadableValue from 'utilities/formatCentsToReadableValue';
import { getDecimals } from 'utilities/getDecimals';
import { TextField, type TextFieldProps } from '../TextField';
import { getStep } from './getStep';

/** Optional composition slot for asset-first forms; absent in existing forms. */
export const TokenAmountLayout = createContext<{ selector?: ReactNode; afterInput?: ReactNode; token?: Token; guestPreview?: { value: string; onChange: (value: string) => void; details: ReactNode } } | undefined>(undefined);

export interface RightMaxButton extends Omit<ButtonProps, 'variant' | 'children' | 'small'> {
  label: string;
}

// Note: although we display all the values in tokens (equivalent of ether for the given token) to
// the user, the underlying values (maxMantissa, value) are expressed in mantissa to make them
// easier to use with contracts
export interface TokenTextFieldProps
  extends Omit<TextFieldProps, 'onChange' | 'value' | 'max' | 'min'> {
  token: Token;
  value: string;
  onChange: (newValue: string) => void;
  rightMaxButton?: RightMaxButton;
  displayTokenIcon?: boolean;
  tokenPriceCents?: number;
  max?: string;
}

export const TokenTextField: React.FC<TokenTextFieldProps> = forwardRef<
  HTMLInputElement,
  TokenTextFieldProps
>(
  (
    {
      token,
      rightMaxButton,
      onChange,
      disabled,
      max,
      displayTokenIcon = true,
      topRightAdornment,
      tokenPriceCents,
      value,
      placeholder,
      ...otherProps
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const layoutContext = useContext(TokenAmountLayout);
    const layout = !layoutContext?.token || (layoutContext.token.chainId === token.chainId && layoutContext.token.address.toLowerCase() === token.address.toLowerCase()) ? layoutContext : undefined;
    const step = getStep({ decimals: token.decimals });

    const handleChange: TextFieldProps['onChange'] = ({ currentTarget: { value: newValue } }) => {
      // Forbid values with more decimals than the token provided supports
      const valueDecimals = getDecimals({ value: newValue });

      if (valueDecimals <= token.decimals) {
        (layout?.guestPreview?.onChange ?? onChange)(newValue);
      }
    };

    const readableValueDollars =
      value && typeof tokenPriceCents === 'number'
        ? formatCentsToReadableValue({
            value: new BigNumber(value).multipliedBy(tokenPriceCents),
          })
        : undefined;

    return (
      <>
      <TextField
        inputMode="decimal"
        ref={ref}
        placeholder={placeholder ?? '0.00'}
        min={0}
        max={max}
        step={step}
        onChange={handleChange}
        type="number"
        value={layout?.guestPreview?.value ?? value}
        topRightAdornment={
          topRightAdornment || typeof tokenPriceCents === 'number' ? (
            <div className="flex items-center gap-x-2">
              {tokenPriceCents && readableValueDollars ? (
                <p className="text-light-grey text-b1r">
                  {t('tokenTextField.valueDollars', {
                    value: readableValueDollars,
                  })}
                </p>
              ) : (
                <div className="h-5.25" />
              )}

              {topRightAdornment}
            </div>
          ) : undefined
        }
        rightAdornment={
          rightMaxButton ? (
            <TertiaryButton size="sm" className="px-2" {...rightMaxButton} disabled={layout?.guestPreview ? true : rightMaxButton.disabled ?? disabled}>
              {rightMaxButton.label}
            </TertiaryButton>
          ) : undefined
        }
        disabled={layout?.guestPreview ? false : disabled}
        {...otherProps}
        aria-label={layout?.guestPreview ? 'Supply amount' : otherProps['aria-label']}
        leftIconSrc={layout?.selector ? undefined : otherProps.leftIconSrc ?? (displayTokenIcon ? token : undefined)}
        leftAdornment={layout?.selector ? <>{layout.selector}</> : otherProps.leftAdornment}
      />
      {layout?.afterInput}
      {layout?.guestPreview?.details}
      </>
    );
  },
);
