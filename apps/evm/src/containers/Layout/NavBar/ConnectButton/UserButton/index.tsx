import { type ButtonProps, ButtonWrapper, cn } from '@venusprotocol/ui';

import primeLogoSrc from 'assets/img/primeLogo.svg';
import PrimeLogo from 'assets/img/primeLogo.svg?react';
import { Icon, Username } from 'components';
import { useTranslation } from 'libs/translations';
import { truncateAddress } from 'utilities';
import type { Address } from 'viem';
import expandSrc from '../../assets/expand.svg';
import userSrc from '../../assets/user.svg';
import vipLogoSrc from './vipLogo.svg';

export interface UserButtonProps extends Pick<ButtonProps, 'onClick' | 'disabled' | 'className'> {
  address: Address;
  isPrime: boolean;
  isVip: boolean;
  figmaHeader?: boolean;
}

export const UserButton: React.FC<UserButtonProps> = ({
  address,
  isPrime,
  isVip,
  disabled,
  className,
  figmaHeader = false,
  ...otherProps
}) => {
  const { t } = useTranslation();

  return (
    <ButtonWrapper
      variant="secondary"
      material="glass"
      data-prime-account={isPrime || undefined}
      aria-label={figmaHeader ? truncateAddress(address) : undefined}
      disabled={disabled}
      type="button"
      className={cn(
        'venus-user-button group h-10 text-b1s rounded-lg p-px sm:h-12',
        !disabled && 'cursor-pointer',
        isPrime ? 'bg-[linear-gradient(135deg,#FFECE3,#6D4637,#674031)]' : 'bg-dark-blue-hover',
        className,
      )}
      {...otherProps}
    >
      <div
        className={cn(
          'relative px-3 flex items-center gap-x-3 bg-background-active h-full rounded-[7px] transition-colors',
          !disabled && 'group-hover:bg-dark-blue-hover',
        )}
      >
        {isPrime ? (
          <>
            <img
              className="venus-prime-account-original h-4"
              src={primeLogoSrc}
              alt={t('primeButton.primeLogoAlt')}
            />
            <PrimeLogo
              className="venus-prime-account-token h-4 w-auto"
              role="img"
              aria-label={t('primeButton.primeLogoAlt')}
            />
          </>
        ) : figmaHeader ? (
          <img className="venus-header-account-icon" src={userSrc} alt="" aria-hidden="true" />
        ) : (
          <Icon name="user" className="h-4 text-light-grey mb-1" />
        )}

        <Username
          className="venus-user-address max-w-30 sm:max-w-full"
          showProvider={false}
          showTooltip={false}
          address={address}
          shouldEllipseAddress
        >
          {figmaHeader && !disabled
            ? ({ innerContent }) => (
                <>
                  <span className="venus-user-address-full">{innerContent}</span>
                  <span className="venus-user-address venus-user-address-compact">
                    {`${address.slice(0, 2)}...${address.slice(-2)}`}
                  </span>
                </>
              )
            : undefined}
        </Username>

        {isVip && <img src={vipLogoSrc} alt={t('connectButton.vipLogoAlt')} className="size-4.5" />}

        {!isVip &&
          !disabled &&
          (figmaHeader ? (
            <img
              className="venus-header-account-icon venus-wallet-expand"
              src={expandSrc}
              alt=""
              aria-hidden="true"
            />
          ) : (
            <Icon name="expand" className="text-light-grey" />
          ))}
      </div>
    </ButtonWrapper>
  );
};
