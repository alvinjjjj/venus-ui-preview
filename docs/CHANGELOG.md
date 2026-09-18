# Design Change Index

Dates reflect recorded review sessions, not reconstructed commit timestamps.
This clean public snapshot starts a new Git history, excluding private local history.
On-page notes: `apps/evm/src/demo/GlassVersions/ChangeNotes.tsx`.

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
