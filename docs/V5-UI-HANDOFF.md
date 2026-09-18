# V4 / V5 UI handoff

Updated: 2026-09-18. Design-review prototype published at https://hkcardcoll.hk/venus/ (not the Venus financial application).

## 2026-09-18 perimeter-light production hotfix

Production CSS processing reset the two-layer mask composition to `add`, allowing the conic light to fill panels. Embed `exclude` in the standard mask shorthand (and `xor` in the legacy WebKit shorthand) for shared panels, market panels and the component-gallery perimeter example. Preserve all visual parameters, including the 18-second panel cycle and reduced-motion behavior. Verify the built CSS in-browser, not only the development server.
This is a living record. Values below were checked against current source for motion.
Earlier design iterations are not a complete audited site-wide changelog.

## Current acceptance baseline

- V4 and V5 share the approved materials, typography and motion; V4 preserves rounded controls / 24px panels, V5 8px. O and V3 are excluded from the September 18 documentation update.
- Dropdown: 12px blur, 120% saturation, 58% dark / 64% light tint opacity, 2.5% grain, 220ms open / 140ms close. Tooltips have no scale/slide animation; their existing 200ms trigger delay remains.
- Markets / E-mode / Isolation: 14px search and headings, 15px main values, 12px secondary USD, 16px tab-to-content gap. Search height: 39px desktop / 48px mobile. Neutral grey hover replaces blue row hover.
- Search inset material is implemented, not a pending proposal. Prime blue glow is hidden in light mode only. Copper identity, reward badges and icon library are synchronized.
- Permanent annotation IDs 1-17 are retained; 18-25 document individual navigation icons and button states. All change notes provides a complete index even when a target is offscreen or its menu is closed.
- Dates distinguish implementation by September 17 from documentation review on September 18. September 16 entries are retrospective summaries, not exact event timestamps. This is not a complete forensic history of every iteration.
- Deployment is not performed by this documentation pass. Use the generated build only after checking hosting base path, environment and existing deployment procedure. Wallet/transaction workflows and Safari remain separate acceptance checks.

## Scope and interaction

- Motion is scoped to V4 (`data-glass-preview='v6'`) and V5.
- Icon motion starts on item hover or keyboard focus-visible, plays once, and resets after leaving. Re-entry replays it.
- Opening the menu itself is not an icon animation trigger. Pointer landing directly over an item can still activate hover.
- Reduced-motion disables icon animation and navigation motion.
- Dark/light themes share motion. Monochrome navigation icons become blue with a 12% blue background mix. Background transition: 180ms ease-out.
- Earn artwork preserves its blue tile and white symbol. Text and buttons do not animate with the icon.

## Motion specification

| Element | Duration | Delay | Values | Easing |
| --- | --- | --- | --- | --- |
| Navigation open | 220ms | 0 | opacity 0 to 1; y -4px to 0 | easeOut (Motion) |
| Navigation close | 140ms | 0 | opacity 1 to 0; y 0 to -2px | easeOut (Motion) |
| Navigation chevron | 220ms | 0 | 0 to 180deg and reverse | ease-out |
| APY stars | 800ms per star; 1160ms total | 0/180/360ms | opacity 1/.65/1/.65/1 at 0/25/50/75/100% | ease-in-out |
| Governance bars | 480ms per bar; 640ms total | 0/80/160ms | scaleY 1/.78/1.04/1 at 0/30/65/100%; bottom origin | ease-in-out |
| VAI | 560ms | 0 | scale 1/.9/1.04/1 at 0/35/70/100% | ease-in-out |
| Bridge endpoints | 460ms each; 600ms total | 0/140ms | scale 1/.9/1.06/1; opacity 1/.5/1/1 at 0/40/70/100% | ease-in-out |
| Stats short line | 560ms | 0 | x 0 to .25 spacing unit at 45%, then 0 | ease-in-out |
| Stats whole icon | 560ms | 0 | scale 1 to 1.05 at 45%, then 1 | ease-in-out |
| Trade | 600ms | 0 | y 0/-.5/+.125/0 spacing units at 0/40/75/100% | ease-in-out |
| Liquidity Hub | 320ms per path; 600ms total | center 0; nodes 100/160/220/280ms | scale 1 to 1.12 at 45%, then 1 | ease-in-out |
| Vaults lock | 600ms | 0 | rotation 0 to 20deg at 45%, then 0 | ease-in-out |

Spacing-based offsets use `--spacing`; at 4px these are Stats +1px and Trade -2px/+0.5px.
Hub center path includes the connecting spokes. Vault lock path was separated from its fixed frame without changing the artwork.
Exit presence keeps the menu mounted briefly; exiting content is inert and pointer-disabled.
Backdrop flicker fix: translate the outer presence wrapper, but animate opacity on the backdrop-filter surface itself. An opacity-animated ancestor can establish a backdrop root and prevent the child glass from sampling page content until the ancestor reaches opacity 1. Timing and material values are unchanged; visual regression verification is pending.
Desktop navigation uses this entry/exit animation; mobile retains its existing accordion.

## Historical design iterations (superseded by baseline above)

- Search asset material trial, pending approval: V5 Markets only; dimensions/type unchanged. Dark: white 4% fill, 13% border, inset black 16% top shadow and white 4% bottom highlight; hover fill 6%, border 22%. Light: black 2% fill, 10% border, inset black 4% top shadow and white 75% bottom highlight; hover fill 3%, border 16%. Focus: blue border with 2px/18% blue ring. Transitions 140ms ease-out, disabled for reduced-motion. No actual backdrop blur on the input. Remove the marked search material trial block in `panel-preview.css` to restore the previous style.

- Table comparison trial (item 2) rejected and reverted: removed tabular numeral override, 24px line-height overrides, forced column APY/reward layout and 48px reserved area. Original alignment and wrapping restored: APY/reward sit side by side when space permits, wrapping only when needed.
- Final row affordance decision: remove asset chevron and all associated motion/emphasis rules. Neutral-grey hover/focus trial replaces blue: dark mode white at 5% opacity over the panel; light mode black at 4% opacity. Transition remains 140ms ease-out, disabled under reduced-motion. These local overlay values avoid adding a blue tint without changing global tokens. Existing row navigation and three-dot action remain. 15px numbers and 16px tabs-to-panel spacing are preserved.

- Reversible spacing trial (not yet approved): V5 Markets/E-mode/Isolation tabs to content panel gap reduced from 24px (6 spacing units) to 16px (4 units). Other versions retain 24px. Remove the `.venus-markets-tabs` V5 gap override in `panel-preview.css` to revert; no typography or table-interaction changes are part of this trial.

- Markets V5 main supply, borrow, liquidity and APY values: 15px local study token (0.9375rem), not a global typography change.
- Layered main balances retain medium weight. Supporting USD values: 12px. Table-heading 12px trial rejected: restored 14px; page-top summary labels unchanged.
- V5 MultiSelect alignment fix: dropdown matches trigger width instead of minimum 240px with right alignment, which previously extended left of the approximately 208px trigger. Viewport edge clamping retained. Option rows remain 48px. MultiSelect chevron now shares the 220ms transition. Search-field neutral inset treatment is a proposal only, not implemented.
- Swap removed from navigation only; route not deleted.
- Icons library: search and category controls at top, both 48px high; All/Static/Animated filters.
- Eight animated examples: APY, Governance, VAI, Bridge, Stats, Trade, Liquidity Hub, Vaults. They reuse production animation selectors.
- APY no longer has a separate introductory section. Static Figma artwork remains separately searchable.
- vTokens excluded from gallery/filter, source assets preserved; vhTokens retained.
- Icons align left with names. Preview background follows theme instead of a fixed dark tile. Light-mode static images currently have a subtle drop-shadow for white artwork visibility.

## Historical material trials and reference

Current shared popup material: dark rgb(25 30 40 / 80%); light rgb(255 255 255 / 80%); backdrop blur 24px, saturation 120%.
Artlist reference: https://artlist.io/
User requests a translucent opening/material feel, not merely fading an opaque panel in.
Observed in the narrow-screen Artlist menu: underlying color regions remain visible through a blurred dark surface, with readable foreground text.
Desktop interaction, exact Artlist opacity, duration and blur have NOT been measured. Do not attribute our timings to Artlist.
V5 header trial approved by user, including the backdrop flicker fix. Now rolled out to the shared desktop Dropdown/Select: navigation, All Categories, icon categories, chain selection and other consumers. This is inspired by the observed translucent treatment, not a measured reproduction of Artlist desktop behavior.
Dark fill: rgb(20 24 31 / 58%). Light fill: rgb(255 255 255 / 64%). Blur stays 24px, saturation 120%. Grain opacity reduced to .015. Text opacity stays 1 after entry.
Dark border: white 12%; inset highlight white 14%; shadow 0 12px 32px black 18%.
Light border: rgb(30 40 55 / 10%); inset highlight white 80%; shadow 0 12px 32px rgb(30 40 55 / 12%).
Without backdrop-filter support, use 96% opaque matching fill for readability.
Previous navigation timing was 180ms/-6px entry and 120ms/-3px exit; approved shared dropdown timing is 220ms/-4px entry and 140ms/-2px exit. Select chevrons use 220ms ease-out. V3/V4 and general modals are unchanged. Small-screen Dropdowns keep their existing Modal presentation; this rollout applies to floating dropdown surfaces.
Click menus use a fixed positioning wrapper with a separate animated glass surface, preserving above/below placement without opacity on an ancestor. Exiting surfaces are inert and pointer-disabled; Escape returns focus to the trigger. Reduced-motion skips entry/exit.

## Source and verification

- `apps/evm/src/components/Dropdown/index.tsx`: navigation presence, entry/exit.
- `apps/evm/src/components/Dropdown/glass.css`: shared popup material.
- `apps/evm/src/containers/Layout/NavBar/MenuItem/dashboard-glass.css`: chevron.
- `apps/evm/src/containers/Layout/NavBar/MenuItem/SubMenuContent/SubMenuItem/governance-motion.css`: navigation/earn icons.
- `apps/evm/src/components/Apy/BoostTooltip/reward-motion.css`: APY.
- `apps/evm/src/pages/Markets/Tabs/Markets/panel-preview.css`: typography.
- `apps/evm/src/pages/ComponentGallery/IconExamples.tsx` and `icons.css`: library.

Build passed after recent changes. Gallery search/filter and light appearance inspected.
Full desktop/mobile, dark/light, reduced-motion, keyboard, and rapid reopen motion QA is still pending. Earlier screenshot checks are not frame-by-frame animation verification.

### V4/V5 synchronization - September 17
- Added permanent points 16 (tooltip motion) and 17 (Prime background), dated September 17. V4/V5 tooltip scale/slide enter/exit animations are disabled; original 200ms trigger delay and Radix positioning remain. Prime leaderboard blue background glow is hidden only in light mode; dark mode is unchanged.
- Annotation follow-up: V4/V5 notes use explicit permanent IDs 1-15, independent of visibility and page order. Future topics must append IDs, never reuse or renumber them. Dated history is shown in the detail panel; September 16 entries are labelled retrospective summaries, not fabricated timestamps. No unverified clock times were added.
- Preserve existing dated entries when editing a point: move the previous current detail into its history and append the new dated revision. The existing registry and history are source-controlled, not reset per browser session.
- Pin placement now avoids the Preview controller and the open detail panel as well as other pins. Verified fixed point 8 opens the dropdown detail, point 1 shows September 16/17, and visible pin centres are not occluded on desktop. V3/O note behavior is retained.
- This section supersedes earlier V5-only scope statements for the listed features. V4 (`v6` internally) now shares the approved V5 treatment; V4 capsule controls/24px panels and V5 8px shape remain distinct. O and V3 are excluded from the new selectors.
- Reviewed Markets, E-mode and Isolation mode. Both latter tabs share EMode; added scoped neutral panel treatment, matched search size/material, 14px desktop headings, 15px risk values on desktop/mobile, and neutral row hover (140ms). Risk text, disabled states and underlying values remain unchanged.
- Markets typography: search and headings 14px, primary amounts/APY 15px, secondary USD 12px, summary labels 14px. Desktop search is 39px high, mobile 48px. Tabs-to-content gap is 16px.
- Synced panel material, search interaction, dropdown 12px blur and grain, trigger-width alignment, 220ms/140ms opening/closing, reward star motion, copper/gold icons/text, reward previews, navigation icon motion, and landing Supply/Borrow + muted chart bars to V4.
- Change notes registry now covers tab spacing, all three mode panels, controls, typography, row feedback, summary, dropdown material/timings, rewards, Prime identity, icon library, landing buttons/chart, and popup shape. Enable Change notes in the preview controller to inspect the relevant visible targets.
- Browser validation: desktop 1440x1000, both versions and both themes across all three tabs; 390px mobile Isolation mode has no horizontal overflow and 48px search. Notes rendered and the typography note opened. No page exceptions in that validation run. Full wallet/transaction workflows and Safari remain untested.

### Historical V5 dropdown blur trial: 12px
- Latest trial supersedes the earlier 24px V5 dropdown blur: both standard and Safari backdrop filters now use 12px in dark and light modes.
- Tint opacity (58% dark / 64% light), 2.5% grain, dimensions, and 220ms open / 140ms close timings are unchanged. V3/V4 and mobile modals remain unchanged.

### Prime copper logo synchronization
- V5 earnings chart muted bars now use the existing light-grey token at 40% opacity instead of fixed #181D27, so they remain distinguishable from the panel in both themes. Blue selection and chart interaction are unchanged.
- Landing follow-up: V5 Supply/Borrow now use separate blue-glass selected / grey glass unselected buttons without an enclosing panel or track. Earnings chart retains the latest highlighted month and tooltip after pointer exit; Month 11/12 remain selectable. Chart behavior fix is shared across versions.
- Shared standalone Prime logo now matches the approved APY coin copper stops: #9B6850, #CEA58B, #F2D8C4, #D4AB90, #A77359 at 0/25/50/75/100%, running top-left to bottom-right.
- Original silhouette and dimensions remain unchanged; APY badges and gold rewards are unchanged. The shared asset updates all existing consumers, including wallet and Prime pages, across preview versions.
- Components Header & VIP Prime-account state now renders the real UserButton with the updated logo instead of a text-only placeholder.

### Historical subtle dropdown frost trial
- V5 shared desktop dropdown surfaces now use one monochrome grain background at 2.5% alpha, replacing the separate navigation/select grain overlays.
- Existing 24px backdrop blur, dark/light tint opacity, sizing, and 220ms open / 140ms close timings remain unchanged. V3/V4 and mobile modals are unchanged.
- Visual approval pending; remove the local grain rule to reverse this trial.
