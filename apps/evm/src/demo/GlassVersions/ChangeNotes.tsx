import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import './change-notes.css';

type Note = { id?: number; selector: string; title: string; detail: string };
type Pin = Note & { x: number; y: number };

const additions: Record<number, string> = {
  1: 'Chevron rotation: 220ms ease-out. Opening translates -4px to 0; closing 0 to -2px. Opacity animates on the glass surface, not its ancestor, preventing the backdrop jump.',
  2: '2026-09-18 production hotfix: mask composition is now embedded in the mask shorthand, preventing production CSS processing from filling the panel with light. Panel perimeter light still travels once every 18 seconds, linearly. Reduced-motion stops the traveling edge. V4 retains 24px panel corners, V5 8px.',
  4: 'Dark search: white 4% fill / 13% edge, hover 6% / 22%. Light: black 2% fill / 10% edge, hover 3% / 16%. Focus: blue edge and 2px ring at 18%. Transition 140ms ease-out. No input backdrop blur.',
  10: 'Prime tooltip explains the supply-based APY boost and links to the calculator. Campaign tooltip separates borrow interest and maximum campaign rewards, including collateral eligibility. These are demo values, not guaranteed yields.',
  11: 'Copper stops at 0/25/50/75/100%: #9B6850 / #CEA58B / #F2D8C4 / #D4AB90 / #A77359, top-left to bottom-right. Standalone logo silhouette unchanged.',
};

// Append new IDs; never renumber existing entries when targets are hidden.
const history: Record<number, { date: string; detail: string }[]> = {
  1: [{ date: '2026-09-16', detail: 'Header glass and version-specific control shapes established (retrospective summary).' }],
  2: [{ date: '2026-09-16', detail: 'Panel borders, shadows and corner treatments established (retrospective summary).' }],
  4: [{ date: '2026-09-16', detail: 'Search/category sizing and rounded-control trials (retrospective summary).' }],
  15: [{ date: '2026-09-16', detail: 'Popup corner hierarchy established (retrospective summary).' }],
};

// Keep notes beside the version preview so future changes can update this registry.
const notesFor = (version: string): Note[] => {
  if (version === 'v1') return [];
  const apple = version === 'v6';
  if (version === 'v5' || apple) return [
    { id: 16, selector: '.venus-tooltip-content', title: 'Tooltip motion', detail: 'Removed scale and slide entry/exit animations in V4/V5. Tooltip appears without a bounce; existing delay and collision-aware positioning remain unchanged.' },
    { id: 17, selector: '.venus-prime-hero-glow, .venus-prime-hero-glow + *', title: 'Prime background', detail: 'Prime leaderboard blue glow is hidden in light mode only, for V4/V5. Dark-mode glow is retained; page content and reward panels are unchanged.' },
    { id: 18, selector: "[data-earn-motion='vault']", title: 'Vaults lock animation', detail: 'Hover/focus once: lock rotates 0 to 20deg at 45%, then returns to 0. Duration 600ms ease-in-out, no delay. Frame stays still. Reduced-motion disables animation.' },
    { id: 19, selector: "[data-earn-motion='hub']", title: 'Liquidity Hub animation', detail: 'Center and nodes scale 1 to 1.12 at 45%, then return. 320ms each; delays 0/100/160/220/280ms, 600ms total. Hover/focus once; reduced-motion disables animation.' },
    { id: 20, selector: '[data-governance-preview]', title: 'Governance animation', detail: 'Bars scaleY 1/.78/1.04/1 from their bottom edge. 480ms each, delays 0/80/160ms, total 640ms, ease-in-out. Hover/focus once; reduced-motion disables animation.' },
    { id: 21, selector: "[data-menu-motion='vai']", title: 'VAI animation', detail: 'Hover/focus once: scale 1/.9/1.04/1 over 560ms ease-in-out. No delay; reduced-motion disables animation.' },
    { id: 22, selector: "[data-menu-motion='bridge']", title: 'Bridge animation', detail: 'Endpoints scale 1/.9/1.06/1 and opacity 1/.5/1/1. 460ms each, delays 0/140ms, total 600ms ease-in-out. Hover/focus once; reduced-motion disables animation.' },
    { id: 23, selector: "[data-menu-motion='stats']", title: 'Stats animation', detail: 'Short line moves +1px while whole icon scales to 1.05 at 45%, then both return. 560ms ease-in-out, no delay. Hover/focus once; reduced-motion disables animation.' },
    { id: 24, selector: "[data-menu-motion='trade']", title: 'Trade animation', detail: 'Icon moves vertically 0/-2px/+0.5px/0 at 0/40/75/100%. 600ms ease-in-out, no delay. Hover/focus once; reduced-motion disables animation.' },
    { id: 25, selector: '[data-venus-button-variant]', title: 'Button material and states', detail: 'Shared glass actions retain hover, pressed, disabled and loading states. Blue-glass identifies selected Supply/Borrow; grey identifies unselected. V4 retains rounded controls, V5 8px. Loading demonstrations live in Components; individual asynchronous workflows require separate functional QA.' },
    { id: 1, selector: '.venus-header-row', title: 'Header and motion', detail: 'Shared V4/V5 navigation. Opens in 220ms, closes in 140ms; no delayed backdrop jump. Icon motion plays on hover/focus, not continuously. Reduced-motion support retained.' },
    { id: 2, selector: '.venus-v5-market-panel, .venus-mode-panel', title: 'Markets / E-mode / Isolation mode', detail: `Shared neutral panel and light-mode shadow. ${apple ? 'V4 keeps 24px panel corners and rounded controls.' : 'V5 keeps 8px corners.'} Risk notices and inactive E-mode states are preserved.` },
    { id: 3, selector: '.venus-markets-tabs', title: 'Tab spacing', detail: 'Markets, E-mode and Isolation mode use a 16px gap between the tab controls and their content.' },
    { id: 4, selector: '.venus-table-controls', title: 'Search and categories', detail: 'Matching controls: 39px desktop / 48px mobile, 14px text. Neutral inset search material, 140ms hover/focus transition. Categories menu aligns with its trigger.' },
    { id: 5, selector: '.venus-markets-page thead', title: 'Table typography', detail: '14px column headings; 15px main amounts and APY; 12px secondary USD values. E-mode risk percentages use 15px. Numeric meaning and inactive-state styling are unchanged.' },
    { id: 6, selector: '.venus-markets-page tbody', title: 'Row feedback', detail: 'Neutral grey hover/focus: 5% white in dark mode, 4% black in light mode. Markets transition 140ms; no additional arrow. APY and rewards remain inline when space permits.' },
    { id: 7, selector: '.venus-markets-stats', title: 'Summary labels', detail: '14px labels; summary amounts retain their existing larger size. No clipping panel around Total supply / borrow / liquidity / assets.' },
    { id: 8, selector: '.venus-dropdown-surface', title: 'Dropdown glass', detail: '12px blur, 120% saturation, dark tint 58% / light tint 64% opacity, 2.5% monochrome grain. Open 220ms / close 140ms. Text remains opaque.' },
    { id: 9, selector: '.venus-apy-boost', title: 'APY reward stars', detail: 'Stars and APY share the theme colour. Hover/focus plays one 800ms sequence, with 0/180/360ms stagger; no continuous flashing.' },
    { id: 10, selector: '.venus-market-reward-preview, .venus-reward-preview', title: 'Prime and campaign rewards', detail: 'Matched badge proportions and glass treatment; copper/gold gradient text, readable light-mode colours, black symbols, explanatory reward tooltips. No Preview label.' },
    { id: 11, selector: '.venus-user-button', title: 'Prime identity', detail: 'Standalone Prime logo now uses the same five-stop copper palette as the APY badge. Header & VIP library uses the actual account button.' },
    { id: 12, selector: '.venus-hero-independent-actions', title: 'Supply / Borrow', detail: 'Two independent buttons: selected blue glass, unselected grey. Removed the enclosing panel and track.' },
    { id: 13, selector: '.venus-hero-earnings-chart', title: 'Earnings chart', detail: 'Muted bars use the neutral light-grey token at 40% opacity. Blue highlight and month/earnings tooltip remain available after hover.' },
    { id: 14, selector: '.icon-library-modes', title: 'Icon library', detail: 'All / Static / Animated grouping. APY is included with animated icons; stages follow the theme instead of using black tiles in light mode. Search and category controls match in height.' },
    { id: 15, selector: '.venus-popup-panel', title: 'Popup shape', detail: 'Shared popup material and consistent internal spacing. V4 retains its rounded style; V5 retains its existing shape treatment.' },
  ];
  return [
    { selector: '.venus-header-row', title: 'Header', detail: version === 'v3' ? 'V3 clean-glass navigation and 8px actions.' : `V4 compact header and glass material${version === 'v5' ? ', adapted to 8px actions for V5' : ' with capsule actions'}.` },
    { selector: '.venus-v5-market-panel', title: 'Panel', detail: apple ? '24px corners, soft shadow and an 18-second traveling edge, disabled with reduced motion. Panels library and Markets share the same page background.' : `8px corners and an 18-second traveling edge, disabled with reduced motion. ${version === 'v3' ? 'Shared subdued page background; frosted surface with a clearer light-mode edge.' : 'Dark surface retained; stronger light-mode border and lower shadow.'}` },
    { selector: '.venus-v5-market-panel .venus-table-controls', title: 'Search and categories', detail: `Height matches Markets: 39px desktop, 48px mobile. ${apple ? 'Capsule search and category controls.' : '8px control corners.'}` },
    { selector: '.venus-dropdown-surface', title: 'Dropdown', detail: apple ? '24px outer corners, 16px option corners and 8px panel inset.' : '8px outer corners with the shared glass backdrop.' },
    { selector: '.venus-popup-panel', title: 'Popup', detail: apple ? '24px outer corners and 16px inner cards/options. Text spacing retained; selection lists use 8px padding.' : version === 'v3' ? 'Clean-glass popup with 8px outer corners.' : 'V4 popup material retained; V5 actions use 8px corners.' },
    { selector: '.venus-markets-stats', title: 'Market statistics', detail: 'Removed the V3 glass-card background and corner clipping from the statistics group.' },
    { selector: '[data-venus-button-variant]', title: 'Shared buttons', detail: apple ? 'Capsule glass buttons with hover, active, disabled and loading states.' : '8px shared buttons with hover, active, disabled and loading states.' },
  ].filter(note => note.selector !== '.venus-markets-stats' || version === 'v3');
};

export function ChangeNotes({ version, enabled }: { version: string; enabled: boolean }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showIndex, setShowIndex] = useState(false);
  const location = useLocation();
  useEffect(() => { setSelected(null); }, [version, location.pathname, enabled]);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      const next: Pin[] = [];
      const obstacles = [...document.querySelectorAll('.preview-controller, .change-note-detail')]
        .map(el => el.getBoundingClientRect());
      for (const note of notesFor(version)) {
        const target = [...document.querySelectorAll(note.selector)].find(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
        });
        if (!target) continue;
        const rect = target.getBoundingClientRect();
        let x = Math.max(8, Math.min(innerWidth - 36, rect.right - 28));
        let y = Math.max(8, Math.min(innerHeight - 36, rect.top + 8));
        const blocked = (px: number, py: number) =>
          next.some(pin => Math.abs(pin.x - px) < 32 && Math.abs(pin.y - py) < 32) ||
          obstacles.some(r => px < r.right + 8 && px + 28 > r.left - 8 && py < r.bottom + 8 && py + 28 > r.top - 8);
        if (blocked(x, y)) {
          const candidates: { x: number; y: number }[] = [];
          for (let cy = 8; cy <= innerHeight - 36; cy += 34) {
            for (let cx = 8; cx <= innerWidth - 36; cx += 34) {
              if (!blocked(cx, cy)) candidates.push({ x: cx, y: cy });
            }
          }
          candidates.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
          if (candidates[0]) ({ x, y } = candidates[0]);
        }
        next.push({ ...note, x, y });
      }
      setPins(next);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    const observer = new MutationObserver(records => {
      if (records.some(record => !(record.target instanceof Element) || !record.target.closest('[data-change-notes]'))) schedule();
    });
    observer.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
    const timer = window.setInterval(schedule, 500);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', escape);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); clearInterval(timer);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('keydown', escape);
    };
  }, [enabled, version, location.pathname, selected]);
  const active = notesFor(version).find(pin => pin.selector === selected);
  return <>
    {enabled && createPortal(<div data-change-notes className="change-notes-layer">
      {(version === 'v5' || version === 'v6') && <button className="change-notes-index-toggle" onClick={() => { setShowIndex(!showIndex); setSelected(null); }}>All change notes</button>}
      {showIndex && !active && <section className="change-note-detail" aria-label="All change notes"><div><strong>Change log</strong><button aria-label="Close change log" onClick={() => setShowIndex(false)}>×</button></div><p>Implemented by Sep 17. Details audited / documented Sep 18. Earlier history is reconstructed only where confirmed.</p>{notesFor(version).sort((a,b) => (a.id ?? 0) - (b.id ?? 0)).map(note => <button className="change-note-index-item" key={note.selector} onClick={() => setSelected(note.selector)}>{note.id}. {note.title}</button>)}</section>}
      {pins.map((pin, i) => <button key={pin.selector} type="button" className="change-note-pin" style={{ left: pin.x, top: pin.y }} aria-label={`Change note: ${pin.title}`} aria-expanded={selected === pin.selector} onClick={() => setSelected(selected === pin.selector ? null : pin.selector)}>{pin.id ?? i + 1}</button>)}
      {active && <section className="change-note-detail" aria-label={active.title}>
        <div><strong>{active.id ? `${active.id}. ` : ''}{active.title}</strong><button type="button" aria-label="Close change note" onClick={() => setSelected(null)}>×</button></div>
        {active.id ? <ol className="change-note-history">
          {(history[active.id] ?? []).map(entry => <li key={entry.date}><time dateTime={entry.date}>{entry.date}</time><p>{entry.detail}</p></li>)}
          <li><time dateTime="2026-09-17">2026-09-17</time><p>{active.detail}</p></li>
          <li><time dateTime="2026-09-18">2026-09-18 · Documentation review</time><p>{additions[active.id] ?? 'Specification documented / reviewed. This date records the annotation update, not a new visual change.'}</p></li>
        </ol> : <p>{active.detail}</p>}
        <small>Local preview · {version === 'v6' ? 'V4' : version.toUpperCase()}</small>
      </section>}
    </div>, document.body)}
  </>;
}
