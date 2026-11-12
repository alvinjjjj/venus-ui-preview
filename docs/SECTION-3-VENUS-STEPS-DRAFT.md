# Explorer Section 3 — "How Venus works" in six steps (2026-10-07)

Explorer (`E`) only, desktop first. Replaces the product-orbit draft in E (`ProductOrbit/` stays in the repo, unrendered). New keeps the Venus Stack.

## Structure (Alvin's three levels)

Full width with the Hero's side margins, `max(5.75vw, 24px)` (same as `.landing-mockup__details`), so edges line up with Section 1.

1. **Left:** the six steps, `01`–`06` (mono numbers, uppercase labels). Click or arrow keys switch steps (ARIA tablist).
2. **Middle:** the active step's title, one sentence, four synchronized points, product CTAs (E glass button, 8px).
3. **Right:** a UI visual that acts the step out, in a dotted panel (16px radius, E dark-glass cards).

## The six steps

| # | Step | Folds in | Right-hand UI (visual) | CTA |
| --- | --- | --- | --- | --- |
| 01 | Supply — "Supply once." | Liquidity Hub, chains & assets | **Built.** Human: supply form, 0 → 10,000 USDT, Supply → Supplied; a vhUSDT position card slides in, value ticks up, sparkline draws, "Collateral · 80% factor". Agent: prompt bubble → Approve USDT → Supply to Liquidity Hub → done → same position card. Footer: Pause / Play and Replay. | Explore Liquidity Hub → `/liquidity-hubs` |
| 02 | Allocate — "One deposit. More possibilities." | Spoke Markets, Core, Vaults | **Built.** Hub → Destinations → Allocation → Overview; mock split 50/30/20 with mock limits; Human/Agent, pause/play/replay. | Explore Spoke markets → in-preview Spoke details; Explore vaults → `/vaults` |
| 03 | Borrow — "Borrow against what you hold." | Borrowing | Planned: Collateral → Amount → Review → Manage. | Explore borrowing → `/dashboard` |
| 04 | Earn more — "Earn more for staying." | Vaults, Prime | Stat card in the Loops style: Prime score (big number) with a rising line; leaderboard rows with one highlighted "You"; XVS staked progress bar; a fixed-term vault row with lock and claim dates. | See the Prime leaderboard → `/prime-leaderboard` |
| 05 | Trade — "Trade your market view." | Leveraged positions | Planned: Market → Leverage → Review → Position. | Explore Trade → `/trade` |
| 06 | Protect — "Run by its users." | Governance, oracle, risk fund | Proposal list: rows moving Active → Queued (timelock) → Executed; an oracle card with Chainlink, Pyth and TWAP feeding one price; risk fund and audits row. | View governance → `/governance` |

App and Agent Skills are not a separate step. Supply shows the flow as UI or conversation; Allocate shows a direct diagram in Human mode and an explanatory conversation in Agent mode.

## Files

- `apps/evm/src/pages/Landing/VenusSteps/index.tsx` — layout, tabs, step detail.
- `.../VenusSteps/SupplyVisual.tsx` — step 01 visual (`motion/react`), plays when the step is active and on screen; reduced motion shows the final state.
- `.../VenusSteps/copy.ts` — EN / zh-Hant / zh-Hans for all six steps and the 01 visual. Move to the translation files once approved.
- `.../VenusSteps/styles.css`.
- `Landing/index.tsx` — E renders `VenusSteps`.

## Facts and wording

- vhToken collateral factor 80% and the USDT/USDC/U-on-BNB-Chain launch set: Liquidity Hub launch coverage (31 Aug 2026). Allocation order Core → Flux, fixed-rate vaults as a further source.
- Prime on Hub deposits: Alvin's rule, not in this repo. Confirm before launch.
- All amounts in the visuals are illustrative and labelled so.

## Revisions (Alvin, 2026-10-07)

- Section header: "How Venus works" eyebrow and the subtitle removed; title "From one deposit to every market." is white, weight 400, words rise in one after another.
- Blue rule: the active step's title (e.g. "Supply once.") is the one blue line in the section, with a light sweep each time a step opens.
- One screen tall (`100svh - 64px`). Scroll snap on `#page-container` (E landing only, `proximity`): Section 3's top and Section 2's last frame (end of `.horizontal-flow-track`) both use `scroll-snap-stop: always`, so a fling stops at the boundary and needs a second, firmer scroll to cross. Verified with real wheel input at 1440×900: 2 ticks up stay on Section 3, 6 ticks reach Section 2's final frame exactly.
- Type system for E in `Landing/explorer-typography.css` (one family, weights 400/600, scale 60/48/32/20/16/14/12).

## Step 01 v2 — four screens, live Hub rates (2026-10-07)

- Modes: **Human** / **Venus AI Agent** (中文：親自操作 / Venus AI 代理).
- Four screens play in order, controlled by the corresponding sentence in the left copy: **Choose → Supply → Route → Hold**. Human shows the app UI; Venus AI Agent shows the same four beats as a chat (prompt, pick, approve + supply, done).
- Data (`VenusSteps/useTopHub.ts`): `useGetLiquidityHubs`, APY via `getCombinedApy` exactly as the Liquidity Hub table sorts it; highest first. In this preview repo the query reads `demo/hubs.json` (snapshot: vhUSDT 2.98%, 1 vhUSDT = 1.002176 USDT, allocation Core 80% / Flux 0% / Fixed Rate 20%). Falls back to that snapshot if the query fails.
- Shares, not 1:1: 10,000 USDT → 10,000 / pricePerShare ≈ 9,978.29 vhUSDT. Shares stay fixed; value grows at the real APY in real time (six decimals, ~$0.0000094/s at 2.98%), plus "≈ +$298 a year".
- Route screen = the main flow line: You → Liquidity Hub → Spokes (particle density = live allocation; a 0% Spoke is a dashed line with no particles), and vhUSDT flowing back to You.
- The 10,000 amount and wallet balance are illustrative and labelled so.

## Step 01 v3 (7 Oct 2026)

- **Live data**: `useTopHub.ts` reads `https://api.venus.io/liquidity-hub/hubs?chainId=56` and formats it with `formatToLiquidityHub`. It only falls back to the preview snapshot (`demo/hubs.json`) if that call fails. Top asset today: USDC 3.71%, then USDT 3.58% and U 1.78%.
- **vhToken icons**: the real `vhUSDC.png`, `vhUSDT.png` and `vhU.png`, read from the BSC token list, rendered with `TokenIcon`.
- **Value first**: "$10,000.00 of vhUSDC". The rate shows as "1 vhUSDC ≈ 1.00 USDC". The share count appears only in the small print on Hold.
- **Stacked deck**: all 4 cards (Choose, Supply, Route, Hold) are visible at once. The front card is sharp; the back cards are smaller, blurred and dimmer. The deck loops automatically and pauses on hover; click a card to bring it forward. One hairline thread with a slow light runs under the front card and over the rest.
- **Route**: 1px hairlines and one soft light (in to the Hub, then out to the Spokes in proportion to the live allocation). Spoke nodes use the yield group icons. Thin allocation bars use the system `ProgressBar`. An empty Spoke is drawn dashed.
- **Hold**: $10,000.00, "≈ +$371 a year · 3.71% APY", and a calm sparkline.
- **System components**: `Card`, `TokenIcon`, `TokenTextField`, `YieldGroups`, `ProgressBar`, `Icon`.
- **Agent mode**: same deck. Card 01 is the ask and the pick; card 02 is approve then supply; cards 03 and 04 are shared with Human, and Hold adds the agent's "Done" line.


## Approved revision — synchronized copy and cards (2026-10-07)

- Supply description: “Deposit once and hold a yield-bearing vhToken.”
- Allocate description: “Your deposit connects to Spoke markets and vaults.”
- Both decks share `StepVisualDeck`. Parent-owned screen state drives the active left sentence and the front card. Autoplay, clicking a sentence, clicking a background card and replay use that same state. Duplicate bottom progress/navigation is removed; Pause/Play and Replay remain.
- Allocate CTAs use the same glass button style. Explore Spoke markets opens the preview's Spoke destination details; Explore vaults goes to all `/vaults`, without a fixed-term filter. A production Spoke route remains to be connected.
- Allocate's toolbar no longer has a Liquidity Hub badge. The Hub stays inside the diagram as the funding origin. Destination three is labelled Vaults in all three languages.
- Human mode presents the deposit diagram, destination details, allocation bars and overview. Agent mode presents a question and a summarized explanation of the same mock 50/30/20 allocation; it does not submit transactions or change allocation policy.
- Card content is in normal flow below the header. Short desktop windows reserve more height for the deck, with contained overflow as a fallback; SVG labels have bottom clearance and the connector stays continuous beneath the animated trace.
- Supply transaction/value counters retain elapsed time when paused.
- Verified locally at 1440×900 and 1280×720. At the shorter size, all four Supply cards and all eight Human/Agent Allocate views fit without internal overflow. Click-to-card synchronization, autoplay synchronization and replay were checked. TypeScript, scoped Biome and scoped Stylelint pass.
- Pending: final Spoke icon and production Spoke destination; allocation amounts and caps remain mock data. Mobile remains outside this draft's acceptance scope.


### Latest revision — pinned six-step desktop flow

- One native-scroll viewport per major step in a sticky stage: Supply → Allocate → Borrow → Earn more → Trade → Protect. Reverse scrolling returns through the same order to Supply and then the asset orbit. Sidebar and arrow-key navigation seek the same scroll positions; no wheel interception. Mobile retains the existing non-pinned layout.
- Removed the lower Pause/Replay section. A single accessible icon button in the illustration toggles Play/Pause; its tooltip and aria-label follow the site language. Clicking the current left sentence can replay that card.
- Active synchronized sentence is bold (600) and white; inactive sentences stay muted, with a pointer and underline on hover.
- Card bodies no longer scroll. Reclaimed footer space lets all four Supply and Allocate cards fit completely, including Agent views, at 1280×720.
- Allocate no longer displays “Example allocation”, the allocation-limit footer or the Hub's explanatory footer. Amounts and limits remain illustrative prototype values in source, not a live allocation feed.
- Hub tree uses one symmetric connector path; it avoids repeated strokes at the junction. The moving trace uses a consistent non-scaling stroke.
- Spoke SVG supplied as `/Users/alvin/Desktop/Слой 3.svg` was unavailable at that path and was not found among SVGs in Desktop, Downloads or project folders. Existing placeholder retained until the file is available; do not describe it as replaced.
- Browser acceptance: real mouse scrolling advances all six steps, reverses all six and returns to the asset orbit. Sticky stage stays below the 64px navigation. Human and Agent card heights were checked at 1280×720; every card's scrollHeight equals clientHeight. Active font weight is 600. TypeScript, scoped Biome and scoped Stylelint pass. This is local preview work.
