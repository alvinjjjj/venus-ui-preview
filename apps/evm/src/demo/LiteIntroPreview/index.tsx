import { PrimaryButton } from '@venusprotocol/ui';
import venusMark from 'assets/img/venusLogo.svg';
import venusLogo from 'assets/img/venusLogoWithText.svg';
import CloseIcon from 'components/Icon/icons/close';
import introBannerBackground from 'containers/VipModal/Modal/background.jpg';
import venusLogoLight from 'demo/LiquidityLightPreview/venusLogoLight.svg';
import { type ReactNode, useEffect, useReducer, useRef, useState } from 'react';
import dai from '../../../../../packages/chains/src/images/tokens/dai.svg';
import eth from '../../../../../packages/chains/src/images/tokens/eth.svg';
import susde from '../../../../../packages/chains/src/images/tokens/sUsdE.svg';
import usdc from '../../../../../packages/chains/src/images/tokens/usdc.svg';
import usdt from '../../../../../packages/chains/src/images/tokens/usdt.svg';
import { ScenarioRemote } from './ScenarioRemote';
import {
  type PreviewMode,
  type PreviewScenario,
  initialPreviewSession,
  previewSessionReducer,
} from './scenario';
import './styles.css';

const markets = [
  {
    symbol: 'sUSDe',
    icon: susde,
    supplyApy: '4.95%',
    borrowApy: '—',
    liquidity: '1.7M',
    supply: '1.7M',
    borrowed: '0',
  },
  {
    symbol: 'USDT',
    icon: usdt,
    supplyApy: '2.71%–2.98%',
    borrowApy: '3.84%',
    liquidity: '62.82M',
    supply: '194.22M',
    borrowed: '131.4M',
  },
  {
    symbol: 'USDC',
    icon: usdc,
    supplyApy: '2.62%–2.65%',
    borrowApy: '3.69%',
    liquidity: '15.42M',
    supply: '46.34M',
    borrowed: '30.92M',
  },
  {
    symbol: 'ETH',
    icon: eth,
    supplyApy: '0.44%',
    borrowApy: '1.85%',
    liquidity: '10.8K',
    supply: '18.96K',
    borrowed: '8.16K',
  },
  {
    symbol: 'DAI',
    icon: dai,
    supplyApy: '2.40%',
    borrowApy: '3.72%',
    liquidity: '781.61K',
    supply: '1.61M',
    borrowed: '828.39K',
  },
];

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const welcomeContent = {
  lite: {
    name: 'Lite',
    description:
      'Supply and borrow, with less to navigate. Explore assets and compare rates in one simple view.',
    action: 'Try Lite now',
  },
  pro: {
    name: 'Pro',
    description:
      'Explore individual markets and manage your positions with more detailed controls for supplying and borrowing.',
    action: 'Try Pro now',
  },
} as const;

export interface InterfaceWelcomeDialogProps {
  open: boolean;
  onDismiss: () => void;
  onTry: () => void;
  onShown?: () => void;
  variant?: PreviewMode;
  controller?: ReactNode;
}

export function InterfaceWelcomeDialog({
  open,
  onDismiss,
  onTry,
  onShown,
  variant = 'lite',
  controller,
}: InterfaceWelcomeDialogProps) {
  const content = welcomeContent[variant];
  const dialog = useRef<HTMLDialogElement>(null);
  const spotlight = useRef<HTMLButtonElement>(null);
  const welcome = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) {
      // Match the actual header control rather than drawing a larger substitute.
      const source = document.querySelector<HTMLButtonElement>(`button[aria-label="Switch to ${content.name}"]`);
      if (source && spotlight.current) {
        const bounds = source.getBoundingClientRect();
        const style = getComputedStyle(source);
        for (const property of ['background', 'color', 'border', 'border-radius', 'box-shadow', 'font-family', 'font-size', 'font-weight', 'line-height', 'padding', 'box-sizing']) {
          spotlight.current.style.setProperty(property, style.getPropertyValue(property));
        }
        const originalRing = source.querySelector<HTMLElement>('.venus-mode-border-flow');
        const previewRing = spotlight.current.querySelector<HTMLElement>('.venus-mode-border-flow');
        if (originalRing && previewRing) {
          const ringStyle = getComputedStyle(originalRing);
          previewRing.style.display = ringStyle.display;
          previewRing.style.opacity = ringStyle.opacity;
          previewRing.style.animation = ringStyle.animation;
        }
        Object.assign(spotlight.current.style, {
          top: `${bounds.top}px`, left: `${bounds.left}px`, right: 'auto',
          width: `${bounds.width}px`, height: `${bounds.height}px`, minWidth: '0', minHeight: '0',
        });
      }
      element.showModal();
      if (source && welcome.current) {
        const anchor = source.getBoundingClientRect();
        const panel = welcome.current.getBoundingClientRect();
        welcome.current.style.setProperty('--intro-arrow-left', `${anchor.left + anchor.width / 2 - panel.left}px`);
      }
      // Initial dialog focus belongs to its content; keyboard controls retain focus rings.
      welcome.current?.focus({ preventScroll: true });
      onShown?.();
    }
    if (!open && element?.open) element.close();
  }, [open, onShown, content.name]);

  return (
    <dialog
      className="intro-dialog"
      data-intro-variant={variant}
      ref={dialog}
      aria-labelledby="intro-title"
      aria-describedby="intro-description"
      onCancel={event => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <button
        ref={spotlight}
        className="intro-button intro-spotlight"
        type="button"
        onClick={onTry}
        aria-label={`Try Venus ${content.name}`}
      >
        {content.name}
        <span aria-hidden="true" className="venus-mode-border-flow" />
      </button>
      <section ref={welcome} tabIndex={-1} className="intro-welcome" style={{ outline: 'none' }}>
        <div className="intro-welcome-header">
          <h1 id="intro-title">
            Meet Venus <span>{content.name}.</span>
          </h1>
          <button
            className="intro-close"
            type="button"
            aria-label="Close introduction"
            onClick={onDismiss}
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>
        <div className="intro-banner">
          <img className="intro-banner-background" src={introBannerBackground} alt="" />
          <div className="intro-banner-lockup">
            <img src={venusLogo} alt="Venus" />
            <span>{content.name}</span>
          </div>
        </div>
        <p id="intro-description">{content.description}</p>
        <div className="intro-welcome-actions">
          <PrimaryButton className="intro-primary" material="blue-glass" onClick={onTry}>
            {content.action}
          </PrimaryButton>
        </div>
      </section>
      {open && controller}
    </dialog>
  );
}

// Preserve the existing Lite-only entry used by the standalone experiment.
export type LiteWelcomeDialogProps = Omit<InterfaceWelcomeDialogProps, 'variant' | 'onTry'> & {
  onTryLite: () => void;
};
export function LiteWelcomeDialog({ onTryLite, ...props }: LiteWelcomeDialogProps) {
  return <InterfaceWelcomeDialog {...props} variant="lite" onTry={onTryLite} />;
}

function MarketTable({
  mode,
  query,
  stableOnly,
  borrowing,
}: { mode: 'lite' | 'pro'; query: string; stableOnly: boolean; borrowing: boolean }) {
  const shown = markets.filter(
    market =>
      market.symbol.toLowerCase().includes(query.toLowerCase()) &&
      (!stableOnly || ['USDT', 'USDC', 'DAI'].includes(market.symbol)),
  );
  return (
    <div className="intro-market-scroll">
      <table className="intro-market-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>{borrowing ? 'Borrow APY' : mode === 'pro' ? 'Supply APY' : 'APY'}</th>
            <th>Liquidity</th>
            <th>{borrowing ? 'Total Borrowed' : 'Total Supply'}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map(market => (
            <tr key={market.symbol}>
              <th scope="row">
                <span>
                  <img src={market.icon} alt="" />
                  {market.symbol}
                </span>
              </th>
              <td>{borrowing ? market.borrowApy : market.supplyApy}</td>
              <td>{market.liquidity}</td>
              <td>{borrowing ? market.borrowed : market.supply}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {shown.length === 0 && (
        <p className="intro-empty">No matching assets. Try a different search.</p>
      )}
    </div>
  );
}

export function LiteIntroPreview() {
  const [session, dispatch] = useReducer(previewSessionReducer, initialPreviewSession);
  const { mode, introOpen } = session;
  const [remoteExpanded, setRemoteExpanded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [borrowing, setBorrowing] = useState(false);
  const [query, setQuery] = useState('');
  const [stableOnly, setStableOnly] = useState(false);
  const resetMarketControls = () => {
    setQuery('');
    setStableOnly(false);
    setBorrowing(false);
  };
  const switchMode = (next: PreviewMode) => {
    dispatch({ type: 'choose', mode: next });
    resetMarketControls();
  };
  const replayIntro = () => {
    dispatch({ type: 'replay' });
    resetMarketControls();
    setRemoteExpanded(false);
  };
  const runScenario = (scenario: PreviewScenario) => {
    dispatch({ type: 'scenario', scenario });
    resetMarketControls();
    setRemoteExpanded(false);
  };
  const remote = (
    <ScenarioRemote
      session={session}
      expanded={remoteExpanded}
      theme={theme}
      onExpand={setRemoteExpanded}
      onScenario={runScenario}
      onReplay={replayIntro}
      onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  );

  return (
    <div className="lite-intro-preview" data-theme={theme} data-preview-mode={mode}>
      <header className="intro-header">
        <button
          className="intro-logo"
          type="button"
          aria-label={`Venus ${mode === 'lite' ? 'Lite markets' : 'Pro Core pool'} home`}
          onClick={() => {
            dispatch({ type: 'home' });
            resetMarketControls();
          }}
        >
          <img
            className="intro-logo-full"
            src={theme === 'light' ? venusLogoLight : venusLogo}
            alt="Venus"
          />
          <img className="intro-logo-mark" src={venusMark} alt="Venus" />
          <span>{mode === 'lite' ? 'Lite' : 'Pro'}</span>
        </button>
        {mode === 'pro' && (
          <nav className="intro-pro-nav" aria-label="Pro preview navigation">
            <span className="intro-nav-current">Markets</span>
            <span>Vaults</span>
            <span>Governance</span>
            <span>More</span>
          </nav>
        )}
        <div className="intro-header-actions">
          <span className="intro-wallet-status">Wallet not connected</span>
          <button
            className="intro-button intro-mode-button"
            type="button"
            onClick={() => switchMode(mode === 'lite' ? 'pro' : 'lite')}
          >
            {mode === 'lite' ? 'Pro' : 'Lite'}
          </button>
        </div>
      </header>

      <main className={`intro-main intro-main--${mode}`}>
        {mode === 'lite' ? (
          <>
            <div className="intro-lite-heading">
              <h1>Universal Money Markets</h1>
              <div className="intro-lite-stats">
                <span>
                  Total Supply<strong>$1.65B</strong>
                </span>
                <span>
                  Available Liquidity<strong>$1.25B</strong>
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="intro-pro-heading">
              <div>
                <p>Markets / BNB Chain</p>
                <h1>Core pool</h1>
                <p>Supply and borrow assets on Venus.</p>
              </div>
              <span className="intro-chain">BNB Chain</span>
            </div>
            <div className="intro-pro-stats">
              <span>
                Total Supply<strong>$1.65B</strong>
              </span>
              <span>
                Total Borrowed<strong>$401.8M</strong>
              </span>
              <span>
                Available Liquidity<strong>$1.25B</strong>
              </span>
              <span>
                Assets<strong>24</strong>
              </span>
            </div>
          </>
        )}
        <section
          className="intro-market-panel"
          aria-label={`${mode === 'lite' ? 'Lite' : 'Pro'} market preview`}
        >
          <div className="intro-market-toolbar">
            <div className="intro-mode-segment" aria-label="Market action">
              <button type="button" aria-pressed={!borrowing} onClick={() => setBorrowing(false)}>
                {mode === 'lite' ? 'Earn' : 'Supply'}
              </button>
              <button type="button" aria-pressed={borrowing} onClick={() => setBorrowing(true)}>
                Borrow
              </button>
            </div>
            <div className="intro-market-filters">
              <label className="intro-search">
                <SearchIcon />
                <input
                  aria-label="Search assets"
                  placeholder="Search asset"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />
              </label>
              <select
                aria-label="Asset category"
                value={stableOnly ? 'stable' : 'all'}
                onChange={event => setStableOnly(event.target.value === 'stable')}
              >
                <option value="all">All Categories</option>
                <option value="stable">Stablecoins</option>
              </select>
            </div>
          </div>
          <MarketTable mode={mode} query={query} stableOnly={stableOnly} borrowing={borrowing} />
        </section>
        {mode === 'lite' && (
          <p className="intro-tagline">
            Simple yet powerful lending and borrowing for any DeFi yield strategy.
          </p>
        )}
      </main>

      <footer className="intro-preview-tools">
        <span>
          Design preview <span aria-hidden="true">·</span> Sample data. No transactions.
        </span>
        <div>
          <button type="button" onClick={replayIntro}>
            Replay introduction
          </button>
          <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </footer>
      <LiteWelcomeDialog
        open={introOpen}
        onDismiss={() => dispatch({ type: 'dismiss' })}
        onTryLite={() => switchMode('lite')}
        controller={remote}
      />
      {!introOpen && remote}
    </div>
  );
}
