import { Card } from 'components';
import { VENUS_DOC_URL } from 'constants/production';
import { Link } from 'containers/Link';
import { useTranslation } from 'libs/translations';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import CantinaLogo from '../Safety/assets/cantinaLogo.svg?react';
import CantinaLogoGray from '../Safety/assets/cantinaLogoGray.svg?react';
import CertikLogo from '../Safety/assets/certikLogo.svg?react';
import CertikLogoGray from '../Safety/assets/certikLogoGray.svg?react';
import Code4renaLogo from '../Safety/assets/code4renaLogo.svg?react';
import Code4renaLogoGray from '../Safety/assets/code4renaLogoGray.svg?react';
import OpenZeppelinLogo from '../Safety/assets/openZeppelinLogo.svg?react';
import OpenZeppelinLogoGray from '../Safety/assets/openZeppelinLogoGray.svg?react';
import PeckShieldLogo from '../Safety/assets/peckShieldLogo.svg?react';
import PeckShieldLogoGray from '../Safety/assets/peckShieldLogoGray.svg?react';
import PessimisticLogo from '../Safety/assets/pessimisticLogo.svg?react';
import PessimisticLogoGray from '../Safety/assets/pessimisticLogoGray.svg?react';
import QuantstampLogo from '../Safety/assets/quantstampLogo.svg?react';
import QuantstampLogoGray from '../Safety/assets/quantstampLogoGray.svg?react';
import { safetyCopyByLanguage } from './copy';
import './styles.css';

const SECURITY_DOC_URL = `${VENUS_DOC_URL}/links/security-and-audits`;
const SKYNET_URL = 'https://skynet.certik.com/projects/venus';
const ease = [0.22, 1, 0.36, 1] as const;

/** Static until FE serves the audit list from an API. */
const auditors = [
  {
    name: 'OpenZeppelin',
    count: 8,
    Logo: OpenZeppelinLogoGray,
    LogoOn: OpenZeppelinLogo,
    href: SECURITY_DOC_URL,
  },
  {
    name: 'Quantstamp',
    count: 11,
    Logo: QuantstampLogoGray,
    LogoOn: QuantstampLogo,
    href: 'https://certificate.quantstamp.com/',
  },
  {
    name: 'PeckShield',
    count: 21,
    Logo: PeckShieldLogoGray,
    LogoOn: PeckShieldLogo,
    href: SECURITY_DOC_URL,
  },
  { name: 'CertiK', count: 24, Logo: CertikLogoGray, LogoOn: CertikLogo, href: SKYNET_URL },
  {
    name: 'Code4rena',
    count: 2,
    Logo: Code4renaLogoGray,
    LogoOn: Code4renaLogo,
    href: 'https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools',
  },
  {
    name: 'Cantina',
    count: 1,
    Logo: CantinaLogoGray,
    LogoOn: CantinaLogo,
    href: 'https://cantina.xyz/competitions/ddf86a5c-6f63-430f-aadc-d8742b4b1bcf',
  },
  {
    name: 'Pessimistic',
    count: 2,
    Logo: PessimisticLogoGray,
    LogoOn: PessimisticLogo,
    href: 'https://github.com/pessimistic-io/audits',
  },
] as const;
/** Fairyproof, Hacken and HashEx together. */
const OTHER_AUDITS = 14;
const OTHER_FIRMS = 3;
const TOTAL_AUDITS = auditors.reduce((sum, item) => sum + item.count, 0) + OTHER_AUDITS;
const FIRMS = auditors.length + OTHER_FIRMS;
/** CertiK Skynet, checked 8 Oct 2026. */
const SCORE = 93.14;
const GRADE = 'AAA';

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));

/** 0 → 1 with an ease-in-out curve once `start` turns true; 1 straight away under reduced motion. */
const useEased = (start: boolean, duration: number, delay = 0) => {
  const reduceMotion = useReducedMotion() ?? false;
  const [value, setValue] = useState(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!start || reduceMotion) {
      if (reduceMotion) setValue(1);
      return;
    }
    let frame = 0;
    const begin = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - begin) / duration));
      setValue(t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, duration, delay, reduceMotion]);
  return value;
};

const AuditorTile: React.FC<{
  item: (typeof auditors)[number];
  index: number;
  start: boolean;
  unit: (count: number) => string;
}> = ({ item, index, start, unit }) => {
  const progress = useEased(start, 1400, 250 + index * 70);
  const { Logo, LogoOn } = item;
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={start ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease, delay: index * 0.07 }}
    >
      {/* System Card: its glass edge and travelling light, as on the app's panels */}
      <Card asChild>
        <Link href={item.href} noStyle className="venus-safety__auditor" aria-label={item.name}>
          <span className="venus-safety__logo">
            <Logo className="venus-safety__logo-off" />
            <LogoOn className="venus-safety__logo-on" />
          </span>
          <span className="venus-safety__count">
            <strong>{Math.round(item.count * progress)}</strong>
            {unit(item.count)}
            <svg viewBox="0 0 12 12" aria-hidden="true" className="venus-safety__arrow">
              <path d="M4 2 8 6 4 10" />
            </svg>
          </span>
        </Link>
      </Card>
    </motion.li>
  );
};

/** The score ring draws to the score while the number counts up; a light then sweeps it once. */
const ScoreCard: React.FC<{ start: boolean; copy: (typeof safetyCopyByLanguage)['en'] }> = ({
  start,
  copy,
}) => {
  const progress = useEased(start, 2000, 400);
  const r = 88;
  const length = 2 * Math.PI * r;
  return (
    <Card asChild>
      <Link href={SKYNET_URL} noStyle className="venus-safety__score">
        <span className="venus-safety__ring">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="venus-safety-ring" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#3ad9c0" />
                <stop offset="1" stopColor="#2f80ff" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r={r} className="venus-safety__ring-track" />
            <circle
              cx="100"
              cy="100"
              r={r}
              className="venus-safety__ring-value"
              stroke="url(#venus-safety-ring)"
              strokeDasharray={`${length * (SCORE / 100) * progress} ${length}`}
            />
            {progress >= 1 ? (
              <circle
                cx="100"
                cy="100"
                r={r}
                pathLength={100}
                className="venus-safety__ring-sweep"
                style={{ strokeDasharray: `6 ${100 - 6}` }}
              />
            ) : null}
          </svg>
          <span className="venus-safety__score-value">
            <strong>{(SCORE * progress).toFixed(2)}</strong>
            <small>
              {copy.scoreLabel} · {GRADE}
            </small>
          </span>
        </span>
        <span className="venus-safety__rank">{copy.rank}</span>
        <span className="venus-safety__source">
          {copy.source}
          <svg viewBox="0 0 12 12" aria-hidden="true" className="venus-safety__arrow">
            <path d="M4 2 8 6 4 10" />
          </svg>
        </span>
      </Link>
    </Card>
  );
};

/**
 * Explorer Section 4, "Safety before all": the auditors and their audit counts,
 * and CertiK Skynet's public score. Same margins, type and materials as
 * Sections 1–3; everything counts up once when the section comes into view.
 */
export const SafetyExplorer: React.FC = () => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const copy = safetyCopyByLanguage[language] ?? safetyCopyByLanguage.en;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const total = useEased(inView, 1600, 150);
  const unit = (count: number) => (count === 1 ? copy.audit : copy.audits);

  return (
    <section ref={ref} className="venus-safety" aria-labelledby="venus-safety-title">
      <div className="venus-safety__inner">
        <header className="venus-safety__header">
          <motion.h2
            id="venus-safety-title"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease }}
          >
            {copy.title}
          </motion.h2>
          <p>
            {fill(copy.body, {
              audits: Math.round(TOTAL_AUDITS * total),
              firms: FIRMS,
            })}
          </p>
        </header>

        <div className="venus-safety__grid">
          <ul className="venus-safety__auditors">
            {auditors.map((item, index) => (
              <AuditorTile key={item.name} item={item} index={index} start={inView} unit={unit} />
            ))}
            <motion.li
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease, delay: auditors.length * 0.07 }}
            >
              <Link href={SECURITY_DOC_URL} noStyle className="venus-safety__auditor is-more">
                {fill(copy.more, { count: OTHER_AUDITS })}
              </Link>
            </motion.li>
          </ul>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
          >
            <ScoreCard start={inView} copy={copy} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
