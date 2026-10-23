import { GlassVersions } from 'demo/GlassVersions';
import { useGetToken } from 'libs/tokens';
import { useTranslation } from 'libs/translations';
import { useChainId } from 'libs/wallet';
import { generateExplorerUrl } from 'utilities';

import { Icon, type IconName, cn } from 'components';
import {
  VENUS_DISCORD_URL,
  VENUS_DOC_URL,
  VENUS_FLUX_URL,
  VENUS_GITHUB_URL,
  VENUS_TELEGRAM_URL,
} from 'constants/production';
import { routes } from 'constants/routing';
import { Link } from 'containers/Link';
import { useInterfaceMode } from 'demo/useInterfaceMode';
import { FooterExplorer } from 'pages/Landing/FooterExplorer';
import { forwardRef } from 'react';
import { useLocation } from 'react-router';

interface SocialLink {
  iconName: IconName;
  label: string;
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
  const { pathname } = useLocation();
  const isAbout = pathname.replace(/\/$/, '') === routes.aboutUs.path;
  const { t } = useTranslation();

  const xvs = useGetToken({
    symbol: 'XVS',
  });

  const socialLinks: SocialLink[] = [
    {
      iconName: 'venus',
      label: 'Venus token explorer',
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
      label: 'Discord',
      href: VENUS_DISCORD_URL,
    },
    {
      iconName: 'telegram',
      label: 'Telegram',
      href: VENUS_TELEGRAM_URL,
    },
    {
      iconName: 'x',
      label: 'X',
      href: VENUS_FLUX_URL,
    },
    {
      iconName: 'github',
      label: 'GitHub',
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
      label: 'About',
      to: routes.aboutUs.path,
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

  // Product pages use the original compact link/social bar. Keep the large
  // brand footer on the About presentation only; do not delete that component.
  if (isAbout) {
    return (
      <div ref={ref} className="w-full shrink-0">
        <FooterExplorer lite={isLite} hideDividers />
        <GlassVersions />
      </div>
    );
  }

  return (
    <footer
      ref={ref}
      className={cn(
        'venus-compact-footer bg-background-active mt-10 p-5 space-y-4 sm:flex sm:flex-wrap sm:gap-4 sm:justify-between sm:items-center sm:space-y-0 md:px-6 xl:px-10',
        isLite && 'mt-0 mb-0 w-full shrink-0 border-0',
        // Leave the existing preview launcher's slot clear of the GitHub link.
        supportsModes && 'sm:pr-20 xl:pr-20',
      )}
    >
      <nav className="flex items-center gap-4 flex-wrap" aria-label="Footer">
        {footerLinks.map(footerLink => {
          const { label, ...restProps } = footerLink;

          return (
            <Link className="text-grey text-sm" key={label} {...restProps}>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-none items-center">
        {socialLinks.map(socialLink => (
          <a
            className="bg-lightGrey hover:bg-blue active:bg-darkBlue ml-4 flex h-6 w-6 items-center justify-center rounded-sm transition-colors first-of-type:ml-0"
            href={socialLink.href}
            key={socialLink.href}
            target="_blank"
            rel="noreferrer"
            aria-label={socialLink.label}
          >
            <Icon name={socialLink.iconName} className="text-white h-3 w-3" />
          </a>
        ))}
      </div>
      <div
        className={cn(
          'venus-footer-preview w-full border-t border-dark-blue-hover pt-4',
          supportsModes && 'hidden',
        )}
      >
        <GlassVersions />
      </div>
    </footer>
  );
});
