import venusLogoWithText from 'assets/img/venusLogoWithText.svg';
import VenusWordmark from 'assets/img/venusLogoWithText.svg?react';
import { Icon, type IconName } from 'components';
import {
  VENUS_COMMUNITY_URL,
  VENUS_DISCORD_URL,
  VENUS_DOC_URL,
  VENUS_GITHUB_URL,
  VENUS_TELEGRAM_URL,
} from 'constants/production';
import { routes } from 'constants/routing';
import { Link } from 'containers/Link';
import { useTranslation } from 'libs/translations';
import { useRef } from 'react';
import { footerCopyByLanguage } from './copy';
import './styles.css';
import { useLiveBlock } from './useLiveBlock';

const CORE_POOL = '0xfD36E2c2a6789Db23113685031d7F16329158384';
// The app footer's X icon points at flux.venus.io; this uses the X account itself.
const VENUS_X_URL = 'https://x.com/VenusProtocol';

interface FooterLink {
  label: string;
  to?: string;
  href?: string;
}

/**
 * Explorer landing footer: brand and tagline, four link columns on a hairline grid,
 * a live chain status and legal line, then the Venus wordmark edge to edge, cropped
 * by the page bottom. The wordmark is a dashed outline (the Telegram mark's style);
 * the pointer lights it up, joining the dashes into a solid blue line around it.
 */
export const FooterExplorer: React.FC = () => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const copy = footerCopyByLanguage[language] ?? footerCopyByLanguage.en;
  const l = copy.links;
  const { blockNumber, chainName } = useLiveBlock();
  const wordmarkRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const node = wordmarkRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--vf-x', `${event.clientX - rect.left}px`);
    node.style.setProperty('--vf-y', `${event.clientY - rect.top}px`);
  };

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: copy.columns.products,
      links: [
        { label: l.liquidityHub, to: routes.liquidityHubs.path },
        { label: l.corePool, to: `/markets/${CORE_POOL}` },
        { label: l.vaults, to: routes.vaults.path },
        { label: l.prime, to: routes.primeLeaderboard.path },
        { label: l.trade, to: routes.trade.path },
        { label: l.bridge, to: routes.bridge.path },
      ],
    },
    {
      title: copy.columns.governance,
      links: [
        { label: l.proposals, to: routes.governance.path },
        { label: l.voters, to: routes.governanceLeaderBoard.path },
        { label: l.forum, href: VENUS_COMMUNITY_URL },
      ],
    },
    {
      title: copy.columns.developers,
      links: [
        { label: l.docs, href: VENUS_DOC_URL },
        { label: l.skills, to: routes.skills.path },
        { label: l.audits, href: `${VENUS_DOC_URL}/links/security-and-audits` },
        { label: l.github, href: VENUS_GITHUB_URL },
      ],
    },
    {
      title: copy.columns.community,
      links: [
        { label: l.telegram, href: VENUS_TELEGRAM_URL },
        { label: l.discord, href: VENUS_DISCORD_URL },
        { label: l.x, href: VENUS_X_URL },
      ],
    },
  ];

  const socials: { icon: IconName; href: string; label: string }[] = [
    { icon: 'telegram', href: VENUS_TELEGRAM_URL, label: l.telegram },
    { icon: 'discord', href: VENUS_DISCORD_URL, label: l.discord },
    { icon: 'x', href: VENUS_X_URL, label: l.x },
    { icon: 'github', href: VENUS_GITHUB_URL, label: l.github },
  ];

  return (
    <footer className="venus-footer" onPointerMove={handlePointerMove}>
      <div className="venus-footer__inner">
        <div className="venus-footer__top">
          <div className="venus-footer__brand">
            <img src={venusLogoWithText} alt="Venus" className="venus-footer__logo" />
            <p>{copy.tagline}</p>
            <div className="venus-footer__socials">
              {socials.map(social => (
                <a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="venus-footer__social"
                >
                  <Icon name={social.icon} className="venus-footer__social-icon" />
                </a>
              ))}
            </div>
          </div>
          <nav className="venus-footer__columns" aria-label="Footer">
            {columns.map(column => (
              <div key={column.title} className="venus-footer__column">
                <h4>{column.title}</h4>
                <ul>
                  {column.links.map(link => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to} noStyle className="venus-footer__link">
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="venus-footer__link"
                        >
                          {link.label}
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="venus-footer__bottom">
          <span className="venus-footer__status">
            <span className="venus-footer__pulse" aria-hidden="true" />
            {copy.live.replace('{chain}', chainName)}
            {blockNumber ? (
              <span className="venus-footer__block">
                · {copy.block} #
                <span key={blockNumber} className="venus-footer__block-number">
                  {blockNumber.toLocaleString('en-US')}
                </span>
              </span>
            ) : null}
          </span>
          <span className="venus-footer__legal">
            <span>{copy.rights.replace('{year}', String(new Date().getFullYear()))}</span>
            <Link to={routes.privacyPolicy.path} noStyle className="venus-footer__link">
              {copy.privacy}
            </Link>
            <Link to={routes.termsOfUse.path} noStyle className="venus-footer__link">
              {copy.terms}
            </Link>
          </span>
        </div>
      </div>
      <div ref={wordmarkRef} className="venus-footer__wordmark" aria-hidden="true">
        <VenusWordmark className="venus-footer__wordmark-base" />
        <VenusWordmark className="venus-footer__wordmark-lit" />
      </div>
    </footer>
  );
};
