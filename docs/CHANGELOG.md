# Design Change Index

Dates reflect recorded review sessions, not reconstructed commit timestamps.
This clean public snapshot starts a new Git history, excluding private local history.
On-page notes: `apps/evm/src/demo/GlassVersions/ChangeNotes.tsx`.

## 2026-09-22

- V5 only, existing topics #10/#11/#25: shared dark/light five-stop Prime colors;
  persistent copper ring on Prime wallet and APY badge; 24px pill exception.
- Selected date/percentage buttons retain blue glass, white text and border after
  pointer release. Selection no longer applies the held-down transform.
- Light glass hover retains 55% fill and default shadows, using pointer highlight.
- Press 100ms, release 420ms; reduced motion includes body-portaled controls.
- Original grey retained; the #1E2431 50% mock-up was rejected and removed.
- Production publication and QA outcomes must be checked separately from these source changes.

## 2026-09-23

- Removed the shared red test-environment banner and its link to the official
  Venus site from the design-review preview layout. Environment configuration
  and the retained warning component are unchanged.
- V5 light-mode Liquidity Hub detail now uses one neutral grey page gradient.
  Its supply-cap circle uses a visible light-grey rail, charts add the Figma
  quieter horizontal grid, the disabled Supply CTA keeps the blue-glass material
  with a fully white label in light and dark modes,
  and chart hover content uses the approved 12px blur, 64% light popup surface
  with 2.5% grain.
- Removed visible prototype-only `Demo` labels across the site while retaining
  simulated-account and no-transaction safeguards. Liquidity Hub cards now use
  a softer, downward cool-grey shadow in both themes instead of an even halo.
- V5 account popup: changed the Theme switch from a capsule to 8px corners in
  both themes and removed the redundant Prime/Normal account status line. The
  non-interactive Prime address control now retains the same full-opacity copper
  identity and glass shadow as the header control.
- The update is page-scoped. Chart data, form behavior, V4, V3 and Original are
  unchanged. V5 dark mode only receives the disabled blue-glass CTA treatment.
- V5 light mode: removed the shared ButtonGroup track fill so the existing 4px
  gap is visibly open between controls. Individual white-glass buttons, the blue
  selected state, 8px corners and the dark-mode shared fill are unchanged.
- V5 only: extended the approved Core Market row typography to Core Markets,
  E-mode, Isolation mode and Liquidity Hubs. Column headings remain 14px; asset
  names, main values, APY and risk values use 15px; secondary USD values use 12px.
- Icons, reward badges, numeric meaning and inactive states are unchanged. V4,
  V3 and Original remain untouched.
- Later local V5 refinement, not yet published: the Liquidity Hub Supply/Withdraw
  CTA starts as dark glass in both themes and turns blue glass only for a valid
  positive amount. Both history charts omit horizontal grid lines while keeping
  their data curves and axes. Resilient Oracle uses 8px corners. Liquidity Hub
  card shadows use neutral grey in light mode and black in dark mode, with
  0px X / 12px Y / 32px blur and no blue tint.
- Follow-up local V5 refinement, not yet published: Resilient Oracle now uses
  the existing glass-button material while retaining its 8px shape and external
  link. The approved neutral shadow extends to shared cards across V5 pages;
  mobile table row cards receive the shadow without duplicating it on their
  enclosing panel. The dark/blue amount-dependent CTA states are unchanged.

## 2026-09-18

- Independent public collaboration snapshot, upstream license retained; private account
  tool, environment and deployment files excluded. Existing hosted deployment unchanged.
- README, review workflow and templates added. Multica and automatic deployment not configured.
- Production perimeter-mask hotfix: embed `exclude` / `xor` in mask shorthand so CSS
  processing cannot reset composition to `add`. Panels and gallery example fixed.
  Panel cycle remains 18000ms linear; reduced-motion disables it.
- Documentation expanded through #25 without renumbering #1-17.

## Implemented / Reviewed by 2026-09-17

| ID | Topic | Current decision |
| --- | --- | --- |
| 1 | Header | Glass opening; opacity on surface, no backdrop jump |
| 2 | Panels | Perimeter light; V4 24px / V5 8px corners |
| 3 | Tab spacing | 16px tabs-to-content gap |
| 4 | Search/category | Matched treatment, trigger-aligned dropdown |
| 5 | Typography | Table headers/search 14px, main values/APY 15px, USD 12px |
| 6 | Row feedback | Neutral grey hover, 140ms; no asset arrow |
| 7 | Summary | Summary label hierarchy retained |
| 8 | Dropdown | 12px blur, dark 58% / light 64%, 2.5% grain; 220/140ms |
| 9 | APY stars | Hover/focus only, staggered one-shot animation |
| 10 | Reward badges | Coordinated copper/gold gradients; no Preview label |
| 11 | Prime identity | Standalone copper logo synchronized with badge |
| 12 | Supply/Borrow | Independent selected blue / unselected grey controls |
| 13 | Chart | Muted bars distinguishable from panel, selected month blue |
| 14 | Icon library | Static/Animated filters, theme-aware tiles, vTokens excluded |
| 15 | Popup shape | Shared treatment with version-specific corners |
| 16 | Tooltip | No scale/slide bounce; existing 200ms trigger delay |
| 17 | Prime glow | Hidden in light mode, retained in dark mode |
| 18 | Vault lock | 600ms one-shot rotation |
| 19 | Liquidity Hub | 600ms total center/node pulse |
| 20 | Governance | 640ms total staggered bar movement |
| 21 | VAI | 560ms subtle scale |
| 22 | Bridge | 600ms total endpoint pulse |
| 23 | Stats | 560ms short-line movement and subtle scale |
| 24 | Trade | 600ms vertical movement |
| 25 | Buttons | Shared material and interaction states |

See the handoff motion table for easing, delays and keyframes. #18-25 were documented
on September 18; that date is not a claim that implementation began then.

## 2026-09-16 Retrospective

On-page history includes retrospective entries for header, panels, search/category
and popup shape. These are not a complete forensic record.

## Rejected / Superseded Trials

- 12px table headings: restored to 14px.
- 16px market values: settled on 15px.
- Forced APY/reward stacking: restored inline with natural wrapping.
- Blue row hover and arrow: grey hover, no arrow.
- Continuous APY blinking: hover/focus playback instead.
- 24px dropdown blur: 12px for current V4/V5 floating dropdowns.

Append dated revisions to an existing topic. Allocate #26 onward only for new topics.
# 2026-09-23: V5 Figma-aligned button groups

- Corrected the earlier interpretation after inspecting Figma node `3212:68614`: the switch container uses 0px padding, a 4px token gap and 8px corners without an outer border. In light mode, the track is transparent so the gaps remain visually open; dark mode retains its shared fill.
- Covers chart ranges, Wallet/Collateral, Markets, Dashboard, landing and modal controls through the shared component. Groups remain on one line. Selected blue styling and existing interaction timing are retained.
- Scoped to V5; V4, V3 and O keep their existing group layout.
- Publication status: local only. The public site remains on the prior stable release after the earlier deployment was rolled back.
