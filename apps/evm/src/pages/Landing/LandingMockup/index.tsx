import { Link } from 'containers/Link';
import { useGlassPreview } from 'demo/GlassVersions/store';
import { useGetMarketsPagePath } from 'hooks/useGetMarketsPagePath';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import coinIconRowSrc from '../Hero/coinIconRow.svg';
import braveSrc from '../Wallets/assets/brave.svg';
import foxWalletSrc from '../Wallets/assets/foxWallet.svg';
import gateSrc from '../Wallets/assets/gate.svg';
import infinityWalletSrc from '../Wallets/assets/infinityWallet.svg';
import ledgerSrc from '../Wallets/assets/ledger.svg';
import metaMaskSrc from '../Wallets/assets/metaMask.svg';
import okxSrc from '../Wallets/assets/okx.svg';
import rabbyWalletSrc from '../Wallets/assets/rabbyWallet.svg';
import safePalSrc from '../Wallets/assets/safePal.svg';
import trustSrc from '../Wallets/assets/trust.svg';
import arrowSrc from './assets/arrow.svg';
import borrowIconSrc from './assets/borrow-icon.svg';
import earnIconSrc from './assets/earn-icon.svg';
import particleFieldSrc from './assets/particle-field.png';
import { useLandingMotion } from './motionStore';
import './styles.css';

const states = [
  { label: 'Earn', value: '9.60%', icon: earnIconSrc, next: 'Borrow' },
  { label: 'Borrow', value: '4.60%', icon: borrowIconSrc, next: 'Earn' },
] as const;

const walletLogos = [
  { name: 'Trust Wallet', src: trustSrc },
  { name: 'Rabby Wallet', src: rabbyWalletSrc },
  { name: 'MetaMask', src: metaMaskSrc },
  { name: 'Fox Wallet', src: foxWalletSrc },
  { name: 'SafePal', src: safePalSrc },
  { name: 'Ledger', src: ledgerSrc },
  { name: 'OKX', src: okxSrc },
  { name: 'Infinity Wallet', src: infinityWalletSrc },
  { name: 'Brave Wallet', src: braveSrc },
  { name: 'Gate.io', src: gateSrc },
];

const FlowFieldThree = lazy(() =>
  import('./FlowFieldThree').then(module => ({ default: module.FlowFieldThree })),
);

const LandingTvl = () => (
  <div className="landing-mockup__tvl">
    <span>Venus TVL</span>
    <strong>$1,188,319,197.22</strong>
  </div>
);

const LandingIntro = () => (
  <div className="landing-mockup__intro">
    <img className="landing-mockup__chain-logos" src={coinIconRowSrc} alt="Supported chains" />
    <p>Simple yet powerful lending and borrowing for any DeFi yield strategy.</p>
  </div>
);

export const LandingMockup: React.FC = () => {
  const { search } = useLocation();
  const pinnedOffer = new URLSearchParams(search).get('offer');
  const [activeIndex, setActiveIndex] = useState(pinnedOffer === 'borrow' ? 1 : 0);
  const flowSettings = useLandingMotion(state => state.flow);
  const starTuning = useLandingMotion(state => state.stars);
  const isNew = useGlassPreview(state => state.mode === 'v5');
  const reduceMotion = useReducedMotion();
  const { marketsPagePath } = useGetMarketsPagePath();
  const active = states[activeIndex];

  useEffect(() => {
    if (reduceMotion || pinnedOffer) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible')
        setActiveIndex(current => (current + 1) % states.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [pinnedOffer, reduceMotion]);

  return (
    <main className="landing-mockup" aria-label="Landing page design preview">
      <Suspense
        fallback={
          <img className="landing-mockup__field" src={particleFieldSrc} alt="" aria-hidden="true" />
        }
      >
        <FlowFieldThree
          settings={flowSettings}
          starTuning={starTuning}
          variant="depth-pulse"
          interactive={!isNew}
        />
      </Suspense>

      <div className="landing-mockup__headline">
        <h1>Universal Money Markets</h1>
        <div className="landing-mockup__offer-row">
          <button
            className="landing-mockup__offer-switch"
            type="button"
            onClick={() => setActiveIndex(current => (current + 1) % states.length)}
            aria-label={`Preview ${active.next} state`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active.label}
                className={`landing-mockup__offer landing-mockup__offer--${active.label.toLowerCase()}`}
                initial={reduceMotion ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{
                  duration: reduceMotion ? 0 : 0.36,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span className="landing-mockup__offer-icon">
                  <img src={active.icon} alt="" />
                </span>
                <span className="landing-mockup__offer-copy">
                  <span className="landing-mockup__offer-verb">{active.label}</span> up to{' '}
                  {active.value}
                </span>
              </motion.span>
            </AnimatePresence>
          </button>
          <Link
            className="landing-mockup__offer-link"
            to={marketsPagePath}
            aria-label={`Explore ${active.label} markets`}
          >
            <img src={arrowSrc} alt="" />
          </Link>
        </div>
      </div>

      {isNew ? (
        <div className="landing-mockup__new-layout">
          <div className="landing-mockup__new-summary">
            <LandingTvl />
            <LandingIntro />
          </div>
          <a
            className="landing-mockup__news-card"
            href="https://community.venus.io/latest"
            target="_blank"
            rel="noreferrer"
            aria-label="Read Venus company news"
          >
            <div className="landing-mockup__news-meta">
              <span>Company news</span>
              <span>Latest</span>
            </div>
            <div className="landing-mockup__news-bottom">
              <p>Discover the latest news and updates from Venus.</p>
              <img src={arrowSrc} alt="" />
            </div>
          </a>
        </div>
      ) : (
        <>
          <div className="landing-mockup__details">
            <LandingIntro />
            <LandingTvl />
          </div>
          <div className="landing-mockup__trusted">
            <p>
              <em>Trusted</em> by many
            </p>
            <div
              className="landing-mockup__logo-viewport"
              aria-label="Supported wallets and partners"
            >
              <div className="landing-mockup__logo-track">
                {[0, 1].map(copy => (
                  <div className="landing-mockup__logo-group" key={copy} aria-hidden={copy === 1}>
                    {walletLogos.map(wallet => (
                      <img key={wallet.name} src={wallet.src} alt={copy === 0 ? wallet.name : ''} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};
