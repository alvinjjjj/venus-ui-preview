import { ButtonWrapper, cn } from '@venusprotocol/ui';

import venusLogoSrc from 'assets/img/venusLogo.svg';
import venusLogoWithTextSrc from 'assets/img/venusLogoWithText.svg';
import { Delimiter, Icon } from 'components';
import { PAGE_CONTAINER_ID } from 'constants/layout';
import { routes } from 'constants/routing';
import { Link } from 'containers/Link';
import venusLogoLightSrc from 'demo/LiquidityLightPreview/venusLogoLight.svg';
import { useLiquidityLightPreview } from 'demo/useLiquidityLightPreview';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { useTranslation } from 'libs/translations';
import { useAccountAddress } from 'libs/wallet';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useStore } from '../store';
import TEST_IDS from '../testIds';
import { ChainSelect } from './ChainSelect';
import { ClaimRewardsButton } from './ClaimRewardsButton';
import { ConnectButton } from './ConnectButton';
import { MenuItem } from './MenuItem';
import { NavButtonWrapper } from './NavButtonWrapper';
import { Settings } from './Settings';
import { SettingsButton } from './SettingsButton';
import { useDashboardMenuItem, useMenuItems } from './useMenuItems';
import './interface-mode.css';

export type NavBarProps = React.HTMLAttributes<HTMLDivElement>;

export const NavBar: React.FC<NavBarProps> = ({ className, ...containerProps }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const isLightPreview = useLiquidityLightPreview();
  const { supportsModes: original, isNew, mode, isLite } = useInterfaceMode();
  const ModeButton = isNew ? ButtonWrapper : 'button';
  const { accountAddress } = useAccountAddress();
  const openModal = useStore(state => state.openModal);
  const isMobileMenuOpen = openModal === 'mobileMenu';

  const isUserConnected = !!accountAddress;

  const closeMobileMenu = () => {
    useStore.setState({ openModal: undefined });
  };

  const toggleMobileMenu = () => {
    useStore.setState({
      openModal: isMobileMenuOpen ? undefined : 'mobileMenu',
    });
  };

  useEffect(() => {
    const pageContainerDom = document.getElementById(PAGE_CONTAINER_ID);

    if (isMobileMenuOpen) {
      pageContainerDom?.classList.add('overflow-hidden');
      document.body.classList.add('overflow-hidden');
    } else {
      pageContainerDom?.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      pageContainerDom?.classList.remove('overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  const menuItems = useMenuItems();
  const dashboardMenuItem = useDashboardMenuItem();

  return (
    <nav className="venus-navigation relative z-50 isolate">
      <div
        className={cn(
          'venus-header-row group/navbar bg-background-active h-20 pr-5 flex items-center justify-between',
          original && 'pr-2 sm:pr-5',
          className,
        )}
        {...containerProps}
      >
        <div
          className={cn('venus-header-leading flex items-center', !original && 'xl:gap-x-1')}
          style={original ? { columnGap: 0 } : undefined}
        >
          <Link
            className={cn(
              'venus-header-logo flex h-full flex-none items-center justify-center px-5 py-6',
              original && 'pl-2 pr-0 sm:pl-5',
            )}
            to={routes.landing.path}
            onClick={closeMobileMenu}
          >
            <img src={venusLogoSrc} alt={t('layout.menu.venusLogoAlt')} className="h-8 sm:hidden" />

            <img
              src={isLightPreview ? venusLogoLightSrc : venusLogoWithTextSrc}
              alt={t('layout.menu.venusLogoAlt')}
              className="h-8 hidden sm:block"
            />
          </Link>

          {original && (
            <span className="venus-interface-mode-label ml-2 text-sm">
              {mode === 'lite' ? 'Lite' : 'Pro'}
            </span>
          )}

          {/* LG and up menu */}
          {!isLite && (
            <div
              className={cn(
                'venus-header-links hidden items-center lg:flex xl:gap-x-3',
                original && 'ml-4',
              )}
              data-testid={TEST_IDS.navBarMenu}
            >
              {menuItems.map(item => (
                <MenuItem key={item.label} item={item} onClick={closeMobileMenu} />
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            'venus-header-actions flex items-center gap-x-3 h-9 sm:h-12',
            original &&
              'gap-x-2 sm:gap-x-3 [&_.venus-connected-wallet_svg]:max-sm:hidden [&_.venus-connected-wallet>div]:max-sm:px-2',
          )}
          data-testid={TEST_IDS.navBarActions}
        >
          {/* Sits to the left of the reward claim button, and only from the breakpoint the desktop
              menu appears at: below that, the dashboard is reachable from the mobile menu */}
          {!isLite && (
            <div className="hidden items-center lg:flex">
              <MenuItem item={dashboardMenuItem} onClick={closeMobileMenu} />
            </div>
          )}

          <ClaimRewardsButton className="h-full hidden sm:flex" data-rewards-button="true" />

          {!isLite && (
            <ChainSelect buttonClassName="h-10 px-3 py-0 bg-dark-blue border-dark-blue-disabled/50 hover:bg-dark-blue-hover hover:border-dark-blue-disabled/50 hover:no-underline active:bg-dark-blue-hover sm:h-12" />
          )}

          <ConnectButton />

          {original && isUserConnected && (
            <div
              role="group"
              aria-label="Interface mode"
              className={cn('flex h-full shrink-0', isNew && 'gap-2')}
            >
              {[mode === 'lite' ? ('pro' as const) : ('lite' as const)].map(option => (
                <ModeButton
                  key={option}
                  type="button"
                  {...(isNew
                    ? {
                        variant: 'secondary' as const,
                        material: 'blue-glass' as const,
                      }
                    : {})}
                  aria-label={`Switch to ${option === 'lite' ? 'Lite' : 'Pro'}`}
                  onClick={() => {
                    closeMobileMenu();
                    navigate(
                      {
                        pathname: option === 'pro' ? routes.liquidityHubs.path : '/',
                        search,
                      },
                      { state: { interfaceMode: option } },
                    );
                  }}
                  className={cn(
                    'relative flex items-center justify-center rounded-lg px-3 text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-blue sm:px-4',
                    !isNew
                      ? 'venus-mode-switch bg-background-active text-white border border-dark-blue-hover'
                      : 'venus-mode-switch bg-blue text-white',
                  )}
                >
                  {option === 'lite' ? 'Lite' : 'Pro'}
                  <span aria-hidden="true" className="venus-mode-border-flow" />
                </ModeButton>
              ))}
            </div>
          )}

          {!isLite && (
            <NavButtonWrapper
              className="size-10 px-0 sm:size-12 lg:hidden"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <Icon
                name={isMobileMenuOpen ? 'closeRounded' : 'burger'}
                className={cn(isMobileMenuOpen ? 'text-light-grey size-3' : 'text-white')}
              />
            </NavButtonWrapper>
          )}

          {!isLite && !isUserConnected && <SettingsButton className="h-full px-0 hidden lg:flex" />}
        </div>
      </div>

      {/* Mobile/tablet menu */}
      <div
        className={cn(
          !isLite && isMobileMenuOpen ? 'fixed' : 'hidden',
          'venus-mobile-navigation top-20 bottom-0 left-0 right-0 z-40 p-5 bg-background overflow-y-auto lg:hidden',
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <p>{t('layout.menu.label')}</p>
        </div>

        <div className="mb-2">
          {[dashboardMenuItem, ...menuItems].map(item => (
            <MenuItem key={item.label} item={item} onClick={closeMobileMenu} />
          ))}
        </div>

        <Delimiter className="mb-6" />

        <Settings />
      </div>
    </nav>
  );
};
