import { ChainId, getToken } from '@venusprotocol/chains';
import venusLogo from 'assets/img/venusLogo.svg';
import { Icon } from 'components';
import { PAGE_CONTAINER_ID } from 'constants/layout';
import { Link } from 'containers/Link';
import { useTranslation } from 'libs/translations';
import { useEffect, useRef, useState } from 'react';
import { productCopyByLanguage } from './copy';
import {
  BEATS,
  type FrameState,
  type NodeId,
  type ProductOrbitScene,
  createProductOrbitScene,
  smooth,
} from './scene';
import './styles.css';

/** Pinned scroll distance, in stage heights. Four beats need room to breathe. */
const TRAVEL = 3.2;
const LABELS: NodeId[] = ['hub', 'core', 'flux', 'fixed', 'next', 'vaults', 'prime', 'trade'];
const usdt = getToken({ chainId: ChainId.BSC_MAINNET, symbol: 'USDT' });

/**
 * Explorer Section 3 (desktop): push into the Venus sphere, find the Liquidity Hub,
 * watch it route liquidity to the Spoke markets, then pull back to the products
 * built around it. Native scroll only; nothing intercepts the wheel.
 */
export const ProductOrbit: React.FC = () => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const copy = productCopyByLanguage[language] ?? productCopyByLanguage.en;
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<Partial<Record<NodeId, HTMLSpanElement | null>>>({});
  const sceneRef = useRef<ProductOrbitScene | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const mount = mountRef.current;
    const scroller = document.getElementById(PAGE_CONTAINER_ID);
    if (!desktop || !track || !stage || !mount || !scroller) return;
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const readTarget = () => {
      const travel = Math.max(track.offsetHeight - stage.offsetHeight, 1);
      const top = track.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, -top / travel));
    };

    const onFrame = ({ progress: p, nodes }: FrameState) => {
      const intro = 1 - smooth(BEATS.introOut[0], BEATS.introOut[1], p);
      const panels = [
        smooth(BEATS.hubCard[0], BEATS.hubCard[1], p) * (1 - smooth(0.36, 0.41, p)),
        smooth(BEATS.spokeCard[0], BEATS.spokeCard[1], p) * (1 - smooth(0.64, 0.69, p)),
        smooth(0.74, 0.84, p),
      ];
      stage.style.setProperty('--po-intro', intro.toFixed(3));
      panels.forEach((value, index) => {
        const panel = panelRefs.current[index];
        if (!panel) return;
        panel.style.setProperty('--po-panel', value.toFixed(3));
        // Hidden panels leave the tab order and the accessibility tree.
        const hidden = value < 0.5;
        if (panel.inert !== hidden) panel.inert = hidden;
      });
      for (const id of LABELS) {
        const label = labelRefs.current[id];
        if (!label) continue;
        const node = nodes[id];
        label.style.opacity = node.opacity.toFixed(3);
        label.style.transform = `translate(${node.x.toFixed(1)}px, ${(
          node.y +
          node.radius +
          10
        ).toFixed(1)}px) translateX(-50%)`;
      }
    };

    sceneRef.current = createProductOrbitScene(mount, {
      readTarget,
      onFrame,
      reducedMotion: () => reducedQuery.matches,
    });
    return () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [desktop]);

  const highlight = (id: NodeId | null) => sceneRef.current?.setHighlight(id);
  const hoverProps = (id: NodeId) => ({
    onPointerEnter: () => highlight(id),
    onPointerLeave: () => highlight(null),
    onFocus: () => highlight(id),
    onBlur: () => highlight(null),
  });

  const hubPanel = (
    <>
      <p className="product-orbit__eyebrow">{copy.hub.eyebrow}</p>
      <h3>{copy.hub.title}</h3>
      <p className="product-orbit__body">{copy.hub.body}</p>
      <div className="product-orbit__card product-orbit__swap">
        <div>
          <span className="product-orbit__muted">{copy.hub.from}</span>
          <span className="product-orbit__token">
            {usdt ? <img src={usdt.iconSrc} alt="" /> : null}
            USDT
          </span>
        </div>
        <Icon name="arrowRight" className="product-orbit__swap-arrow" />
        <div>
          <span className="product-orbit__muted">{copy.hub.to}</span>
          <span className="product-orbit__token">
            <span className="product-orbit__vh">
              <img src={venusLogo} alt="" />
            </span>
            vhUSDT
          </span>
        </div>
        <ul className="product-orbit__tags">
          {copy.hub.tags.map(tag => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
      <Link to="/liquidity-hubs" className="product-orbit__cta">
        {copy.hub.cta}
        <Icon name="arrowRight" className="product-orbit__cta-icon" />
      </Link>
    </>
  );

  const spokesPanel = (
    <>
      <p className="product-orbit__eyebrow">{copy.spokes.eyebrow}</p>
      <h3>{copy.spokes.title}</h3>
      <p className="product-orbit__body">{copy.spokes.body}</p>
      <div className="product-orbit__card">
        <span className="product-orbit__muted">{copy.spokes.order}</span>
        <ol className="product-orbit__order">
          {copy.spokes.items.map((item, index) => (
            <li key={item.id} data-node={item.id} {...hoverProps(item.id as NodeId)}>
              <span className="product-orbit__rank">{index + 1}</span>
              <span className="product-orbit__dot" />
              <span>
                <strong>{item.name}</strong>
                <small>{item.note}</small>
              </span>
            </li>
          ))}
          <li data-node="next" className="product-orbit__order-next">
            <span className="product-orbit__rank">+</span>
            <span className="product-orbit__dot" />
            <span>
              <strong>{copy.spokes.next.name}</strong>
              <small>{copy.spokes.next.note}</small>
            </span>
          </li>
        </ol>
      </div>
    </>
  );

  const appsPanel = (
    <>
      <p className="product-orbit__eyebrow">{copy.apps.eyebrow}</p>
      <h3>{copy.apps.title}</h3>
      <div className="product-orbit__apps">
        {copy.apps.items.map(item => (
          <Link
            key={item.id}
            to={item.to}
            className="product-orbit__card product-orbit__app"
            data-node={item.id}
            {...hoverProps(item.id as NodeId)}
          >
            <span className="product-orbit__dot" />
            <span>
              <strong>{item.name}</strong>
              <small>{item.note}</small>
              <span className="product-orbit__app-cta">
                {item.cta}
                <Icon name="arrowRight" className="product-orbit__cta-icon" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );

  // Below the desktop breakpoint, the same content reads as a simple stack.
  if (!desktop)
    return (
      <section className="product-orbit-stack" aria-label={copy.section}>
        <header>
          <h2>{copy.intro.title}</h2>
          <p>{copy.intro.body}</p>
        </header>
        <div className="product-orbit__panel-static">{hubPanel}</div>
        <div className="product-orbit__panel-static">{spokesPanel}</div>
        <div className="product-orbit__panel-static">{appsPanel}</div>
      </section>
    );

  return (
    <section
      ref={trackRef}
      className="product-orbit-track"
      aria-label={copy.section}
      style={{ '--po-travel': TRAVEL } as React.CSSProperties}
    >
      <div ref={stageRef} className="product-orbit">
        <div ref={mountRef} className="product-orbit__canvas" />
        <header className="product-orbit__intro">
          <h2>{copy.intro.title}</h2>
          <p>{copy.intro.body}</p>
        </header>
        <div className="product-orbit__labels" aria-hidden="true">
          {LABELS.map(id => (
            <span
              key={id}
              data-node={id}
              ref={element => {
                labelRefs.current[id] = element;
              }}
            >
              {copy.labels[id as keyof typeof copy.labels]}
            </span>
          ))}
        </div>
        {[hubPanel, spokesPanel, appsPanel].map((panel, index) => (
          <div
            key={index}
            className="product-orbit__panel"
            ref={element => {
              panelRefs.current[index] = element;
            }}
          >
            {panel}
          </div>
        ))}
      </div>
    </section>
  );
};
