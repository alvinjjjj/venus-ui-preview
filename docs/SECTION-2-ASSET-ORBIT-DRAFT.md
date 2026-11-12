# Venus Section 2 — asset yield draft

Status: local New/Explorer landing draft, 6 October 2026. This is a scoped extension of the existing Venus UI, not a replacement product design or a deployment.

## Approved brief

The user approved inserting this draft between the current hero and the seven-layer Venus model. The model consequently becomes Section 3. Use asset symbols and gradient discs based on the supplied references; do not use literal planets or rocky surfaces. The headline must describe assets generally, rather than only stablecoins.

English copy: **Put your assets to work.** / **Explore assets and yields through Venus Liquidity Hub.** Traditional and simplified Chinese versions follow the selected site language.

USDC, USDT, U and ETH are illustrative selectable nodes. Their rates are explicitly labelled Example Supply APY. These sample assets/rates are not a claim of live market availability or current returns. Following the user's afternoon revision, four proof slots show operating since, active markets, executed governance proposals and published audit reports, with layout-preview values `2020 / 60+ / 600+ / 100+`. Both visible draft/pending captions were removed at the user's request; numeric title/accessibility labels identify the values as layout previews. Do not repeat the hero TVL or substitute a total proposal count for executed proposals.

## Built direction and boundary

- World: existing Venus semantic charcoal/light palette, official logo and token assets, gradients derived from existing tokens. No global token or global style edits.
- Composition: centered title, Venus disc, four stationary asset nodes, faint elliptical ripples and sparse particle strand from the upper left. This visually relates to the hero; it is a separate canvas, not one shared particle simulation across sections.
- Type: existing site font and type tokens, desktop headline 60px and mobile 40px.
- Interaction: focus/hover/click selects an asset; Enter activates it, Escape or the close button dismisses its details. The CTA navigates to the existing Liquidity Hub route while preserving the selected chain.
- Responsive: four proof columns on desktop, two on mobile. Details sit beside the scene at large widths and beneath the graphic on smaller screens. Canvas stops offscreen, in hidden tabs and for reduced motion.

Files: `apps/evm/src/pages/Landing/AssetOrbit/{index.tsx,RippleField.tsx,styles.css}`; only insertion in `Landing/index.tsx`. Original landing and existing model implementation are outside the change boundary.

## Quality bar and verification

Readable hierarchy, no token occlusion, no horizontal overflow at 336px, loaded official icons, clearly illustrative data, keyboard operation, light/dark themes, preserved incumbent model. Browser captures are scoped views of Section 2; mobile upper/lower views together cover the section.

No publication, GitHub push or Vercel deployment is included. Exact metric definitions, final asset selection and live APY integration remain design/content decisions after this draft is reviewed. The follow-up research snapshot and proposed animation/material direction are recorded in `SECTION-2-TRUST-METRICS-2026-10-06.md`.

## Implementation record

The New and Explorer preview branch renders the existing hero, `AssetOrbit`, then the existing `VenusStack`. New retains the acrylic stack variant; Explorer retains the particle variant. The Original landing branch does not render this section.

The initial selection is USDC. Selection updates on pointer hover, keyboard focus or click; native button activation supports Enter. Escape is handled while focus is on an asset button or inside the details panel. Closing the panel replaces its contents with the asset-selection instruction. Asset buttons expose their selected state with `aria-pressed`, and the details region uses `aria-live="polite"`. The CTA uses the incumbent `Link` container to reach `/liquidity-hubs` with the current chain query parameter and the existing `arrowRight` icon.

| Draft asset | Example Supply APY |
| --- | --- |
| USDC | 5.24% |
| USDT | 4.86% |
| U | 6.12% |
| ETH | 2.38% |

These values are hardcoded interaction examples. Token artwork comes from the existing BSC token registry, and the central mark uses the existing Venus SVG. Selecting an asset does not filter the destination Hub list or fetch an APY. English, Traditional Chinese and Simplified Chinese copy are provided; other language values fall back to English.

Section-local colour aliases reference the incumbent semantic palette. Light appearance relies on the existing palette switching; this section does not define a separate light palette. The asset discs and labels stay stationary while the canvas draws the ripples and incoming particle strand. The strand is a visual continuation of the hero, with its own animation state. Canvas rendering respects reduced motion and pauses when offscreen or the document is hidden.

At widths below 768px, the details panel sits beneath the asset graphic and proof slots use two columns. From 768px, proof slots use four columns. From 1024px, the details panel floats to the corresponding side of the scene for the selected asset. Reduced motion also removes the disc state transition.

## Recorded verification — 6 October 2026

Source inspection confirms the implementation record above. The following results were reported by the implementation session:

- Final TypeScript validation after the CTA icon replacement, scoped Biome, Stylelint and production build passed. The final build completed in 15.13 seconds. The Impeccable detector returned no findings (`[]`).
- Browser checks covered a 1280 × 1000 dark viewport and 390 × 844 and 336 × 844 light viewports. All token icons loaded; the 336px view had no horizontal overflow.
- Asset switching, Enter activation, Escape dismissal and the Liquidity Hub CTA were exercised. The destination route opened and its Hub list loaded.
- Follow-up captures confirmed the CTA uses the existing icon and the mobile details panel clears the proof divider.
- The independent finish reviewer returned a ship disposition for the local Section 2 draft, with no outstanding material fixes; the reviewed screenshots matched the source.

The reduced-motion/offscreen/hidden-tab behaviour is established in source; no separate runtime measurement of those pause states is recorded here. The supplied browser results do not constitute a complete locale, browser or device matrix. The finish disposition applies to this local draft and does not confirm publication or live financial data.

No additional global product or design-system context was created. The remaining contextual inputs are confirmed proof data, the final asset set and a decision on live rate integration.
