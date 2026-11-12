# Landing hero mock-up design QA

Final result: passed (mock-up scope)

## Compared evidence

- Source: Figma `1494:9191` (Earn) and `1516:15254` (Borrow), exported at 1440 × 900.
- Render: local production preview at `/#/?chainId=56&landingMockup=1`, captured at 1440 × 900; Earn and Borrow states were compared in paired images at `/tmp/venus-landing-compare-final.png` and `/tmp/venus-landing-borrow-compare.png`.
- Responsive checks: 1280 × 720 and 390 × 844 in the Codex in-app browser. The Figma file supplied desktop frames only, so mobile follows the same hierarchy rather than claiming pixel parity.

## Fidelity checks

| Surface | Result |
| --- | --- |
| Fonts and typography | Pass: existing Proxima Nova and the Figma heading/offer hierarchy, sizes, weight, wrapping, and color are close at the source viewport. |
| Spacing and layout | Pass: headline/offer, lower-left chain/copy block, TVL, separator, and trusted strip align with the two Figma states. |
| Colors and tokens | Pass: black field, Venus blue Earn accent, gray Borrow accent, white copy, and muted partner logos match the source. |
| Image and asset fidelity | Pass: the actual Figma particle-field PNG and Earn/Borrow icon SVGs are used; existing Venus SVGs provide the chain and wallet marks. |
| Copy and content | Pass: headline, both offer strings, subtitle, TVL example, and trusted title match Figma. The numbers are intentionally visual mock data, not live rates or TVL. |
| Interaction and accessibility | Pass: offer changes on click and cycles automatically; market arrow has a valid destination; reduced-motion users do not get automatic cycling or marquee movement; focus styling and image alternative text are present. |

## Intentional mock-up differences / next iteration

- The existing application navbar is retained, so its labels, language, and 64px height differ from the Figma header. The current landing page and global header were not replaced.
- The local V5 design-preview control remains visible in the corner; it is developer preview chrome, not part of the landing design.
- The particle mock-up uses the exported Figma field plus lightweight animated blue canvas glints, not a final Three.js scene. Production shader/performance work should follow visual approval.
- The exact Legend text-transition behavior was unavailable on its current public site; the prototype uses a restrained blur/vertical crossfade between the two approved Figma states.
- Moving wallet-logo positions differ from a static Figma frame by design.

No remaining P0, P1, or P2 visual issues within the agreed mock-up scope.
