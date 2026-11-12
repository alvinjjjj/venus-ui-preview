# Section 2 trust metrics research — 6 October 2026

This is a research snapshot for the local landing draft, not a claim of safety or live UI integration.

## Results and counting definitions

| Metric | Researched value | Source and boundary |
| --- | --- | --- |
| Operating since | 2020 | Official [overview](https://docs-v4.venus.io/). The [fourth anniversary post](https://community.venus.io/t/celebrating-4-years-of-defi-excellence-with-venus/4740) is dated November 2024. Prefer the stable year to a rounded elapsed-year claim. |
| Supply-enabled markets | 66 | Official API on the eight mainnet chain IDs below, deduplicated by chain ID + vToken address, isListed=true, MINT pause bit=0. This is a defined supply-enabled count, not all historical listings, and does not guarantee capacity, valid oracle or access for every user. |
| Supply and borrow both enabled | 44 | Same snapshot, additionally BORROW pause bit=0. |
| Executed proposals | 628 | Official governance API: fetched all seven pages, 665 distinct governorName+proposalId entries, state=7 (Executed). Total proposals 665 must not be labelled executed proposals. |
| Published audit reports | 101 | All 746 lines of the official [Security & Audits catalog](https://docs-v4.venus.io/links/security-and-audits) were covered by the research retrieval. Counted unique PDF URLs linked with an audit-report label; 101 distinct PDF filenames as well. This counts published report artifacts, not independent auditors, audit cycles or complete coverage of all live deployments. |

| Mainnet | Chain ID | Unique listed markets | Supply enabled | Supply and borrow enabled |
| --- | --- | --- | --- | --- |
| BNB Chain | 56 | 51 | 37 | 24 |
| Ethereum | 1 | 23 | 13 | 9 |
| Arbitrum | 42161 | 7 | 7 | 4 |
| Base | 8453 | 5 | 4 | 3 |
| ZKsync | 324 | 9 | 5 | 4 |
| Optimism | 10 | 5 | 0 | 0 |
| opBNB | 204 | 5 | 0 | 0 |
| Unichain | 130 | 7 | 0 | 0 |
| Total | | 112 | 66 | 44 |

API: [BNB pools example](https://api.venus.io/pools?chainId=56), replacing chainId for the other seven chains; [governance page](https://api.venus.io/governance/proposals?limit=100&page=0), pages 0–6. Pause-bit/state definitions verified against current local source. Snapshot queries were not taken at one atomic on-chain block. Do not treat the local BNB pools.json or mock proposals as current research data.

The current visual preview uses 2020 / 60+ / 600+ / 100+ for layout. The user requested removing the two visible draft/pending captions; numeric title/accessibility labels still describe them as layout-preview values. Example Supply APY remains visibly marked. Number type is 72px desktop / 48px mobile, using existing tokens; labels are 16px / 14px.

## Animation direction for discussion — not implemented

1. Hero exit: the hero headline, yield button and partner row fade over the first scroll interval while the existing particle line narrows toward the future Section 2 center. Navigation remains legible.
2. Convergence: particles form a compact luminous point; a faint Venus silhouette gives orientation. Never leave an empty black interval.
3. Expansion: the point opens into two or three ripples with staggered depth. The Venus gradient disc settles at the center; four symbol discs appear at offset intervals on their fixed interaction positions.
4. Reading state: the Section 2 headline settles, then the four proof values appear together. Nodes drift only minimally in depth; their selection targets stay stable. Hover raises and tilts the selected disc slightly while one short particle trace connects it to the Hub. User-selected APY stays legible.
5. Reverse scrolling retraces progress. Reduced motion directly reveals the final composition. Do not use timed animation that runs independently of scroll through the transition.

Material proposal: layered token-derived gradients rather than literal planets. A directional upper-left soft highlight, midtone body, darker lower-right edge and narrow rim distinguish the discs. Vary circle size, apparent depth and ripple opacity; keep the Venus disc strongest. USDC blue/silver, USDT restrained mint, U pearl/silver with its supplied gold symbol, ETH cool lavender/blue. Rear arcs dim and slightly soften, foreground points sharpen; avoid giving every circle the same glow. These gradients and motion changes are discussion only.

## Local verification

The refreshed New preview at :5175 shows all four mock values and neither removed caption. Desktop 1280px and mobile 390px were inspected; mobile proof values use 48px and document width equals viewport width, with no horizontal overflow. TypeScript and scoped Biome/Stylelint checks passed. No deployment was performed.
