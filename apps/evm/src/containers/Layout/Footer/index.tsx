import { GlassVersions } from 'demo/GlassVersions';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useGetToken } from 'libs/tokens';
import { useTranslation } from 'libs/translations';
import { useChainId } from 'libs/wallet';
import { generateExplorerUrl } from 'utilities';

import { Icon, type IconName, cn } from 'components';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import {
  VENUS_DISCORD_URL,
  VENUS_DOC_URL,
  VENUS_FLUX_URL,
  VENUS_GITHUB_URL,
  VENUS_TELEGRAM_URL,
} from 'constants/production';
import { routes } from 'constants/routing';
import { Link } from 'containers/Link';
import { forwardRef } from 'react';
import { FooterExplorer } from 'pages/Landing/FooterExplorer';
import { TrustedWallets } from 'pages/Landing/LandingMockup';
import { useLocation } from 'react-router';
import { useStore as useLayoutStore } from '../store';

interface SocialLink {
  iconName: IconName;
  href?: string;
}

interface LinkConfig {
  label: string;
  href?: string;
  to?: string;
}

export const Footer = forwardRef<HTMLDivElement>((_, ref) => {
  const { chainId } = useChainId();
  const { isLite, supportsModes } = useInterfaceMode();
  const isExperiment = useGlassPreview(state => state.mode === 'lite-experiment');
  const { pathname } = useLocation();
  const isAbout = pathname.replace(/\/$/, '') === routes.aboutUs.path;
  const isLiteMarketDetail = useLayoutStore(state => state.isLiteMarketDetail);
  const showLiteFooter = (pathname === '/' || pathname === '') && !isLiteMarketDetail;
  const isPro = supportsModes && !isLite;
  const isProHub = isPro && pathname.replace(/\/$/, '') === routes.liquidityHubs.path;
  const { t } = useTranslation();

  const xvs = useGetToken({
    symbol: 'XVS',
  });

  const socialLinks: SocialLink[] = [
    {
      iconName: 'venus',
      href:
        xvs &&
        generateExplorerUrl({
          hash: xvs.address,
          urlType: 'token',
          chainId,
        }),
    },
    {
      iconName: 'discord',
      href: VENUS_DISCORD_URL,
    },
    {
      iconName: 'telegram',
      href: VENUS_TELEGRAM_URL,
    },
    {
      iconName: 'x',
      href: VENUS_FLUX_URL,
    },
    {
      iconName: 'github',
      href: VENUS_GITHUB_URL,
    },
  ];

  const footerLinks: LinkConfig[] = [
    {
      label: t('footer.links.documentation'),
      href: VENUS_DOC_URL,
    },
    {
      label: t('footer.links.skills'),
      to: routes.skills.path,
    },
    {
      label: t('footer.links.privacyPolicy'),
      to: routes.privacyPolicy.path,
    },
    {
      label: t('footer.links.termsOfUse'),
      to: routes.termsOfUse.path,
    },
  ];

  if (isExperiment && isLite && !isAbout) return <GlassVersions />;

  // Every Pro page now ends with the same Explorer footer as the Liquidity Hub
  // ("Trusted by many" stays on the Hub and Lite only).
  if (isLite || isPro || isAbout) {
    return (
      <div ref={ref} className="w-full shrink-0">
        {!isAbout && (isLite || isProHub) && <TrustedWallets />}
        {(isPro || showLiteFooter || isAbout) && <FooterExplorer lite={isLite} hideDividers />}
        <GlassVersions />
      </div>
    );
  }

  return (
    <footer
      ref={ref}
      className={cn(
        'bg-background-active mt-10 p-5 space-y-4 sm:flex sm:flex-wrap sm:gap-4 sm:justify-between sm:items-center sm:space-y-0 md:px-6 xl:px-10',
        isLite && 'mt-0 mb-0 w-full shrink-0 border-0',
      )}
    >
      <div className="flex items-center gap-4 flex-wrap">
        {footerLinks.map(footerLink => {
          const { label, ...restProps } = footerLink;

          return (
            <Link className="text-grey text-sm" key={label} {...restProps}>
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-none items-center">
        {socialLinks.map(socialLink => (
          <a
            className="bg-lightGrey hover:bg-blue active:bg-darkBlue ml-4 flex h-6 w-6 items-center justify-center rounded-sm transition-colors first-of-type:ml-0"
            href={socialLink.href}
            key={socialLink.href}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name={socialLink.iconName} className="text-white h-3 w-3" />
          </a>
        ))}
      </div>
      <div
        className={cn(
          'venus-footer-preview w-full border-t border-dark-blue-hover pt-4',
          isLite && 'hidden',
        )}
      >
        <GlassVersions />
      </div>
    </footer>
  );
});
