# Explorer Section 3 — product orbit draft (2026-10-07)

Explorer (`E`) only, desktop first (>= 1024px). New keeps the Venus Stack section.

## Story (native scroll, pinned stage, 3.2 stage heights of travel)

1. **Intro (0–0.18):** "Inside Venus" over the Venus sphere, same size and material as Section 2's centre.
2. **Push in (0.12–0.34):** the shell grows past the screen and fades; the Liquidity Hub glows inside with a small particle swarm. Card: USDT → vhUSDT, tags (earns automatically, usable as collateral, nothing to claim), CTA to `/liquidity-hubs`.
3. **Spokes (0.36–0.66):** rings for Venus Core, Venus Flux and Fixed Rate, a dashed ring for the next Spoke. Particles stream from the Hub to each Spoke; stream density follows the allocation order (Core, then Flux, then Fixed Rate). Card: the allocation order.
4. **Apps (0.68–1):** the system shrinks a little; Vaults, Prime and Trade arrive on an outer ring. Cards link to `/vaults`, `/prime-leaderboard`, `/trade`. Hovering a card (or an allocation row) lifts and brightens its sphere.

Below 1024px the same three panels render as a plain stack (no canvas).

## Files

- `apps/evm/src/pages/Landing/ProductOrbit/scene.ts` — three.js scene (screen-space orthographic, y up). Planet shader, premultiplied halo blending and starfield follow `LandingMockup/FlowFieldThree.tsx` (Explorer branch). Beats in `BEATS`; layout constants (`SPOKES`, `APPS`, rings, `TILT`) at the top.
- `.../ProductOrbit/index.tsx` — track, sticky stage, copy panels, labels that follow the spheres. Panels below 50% opacity are `inert`.
- `.../ProductOrbit/copy.ts` — EN / zh-Hant / zh-Hans. Prototype only; move into the translation files once approved.
- `.../ProductOrbit/styles.css`.
- `Landing/index.tsx` — Explorer renders `ProductOrbit` instead of `VenusStack`.

## Facts used (no rates or counts in this section)

- Liquidity Hub: one deposit, ERC-4626 vhToken that grows in value and can be used as collateral; launched 31 Aug 2026 with USDT, USDC and U on BNB Chain; routes to Venus Core first, then Venus Flux; fixed-rate vaults are an allocation source.
- Prime on Hub deposits: Alvin's rule; not documented in this repo. Confirm wording before launch.

## Known gaps / next

- Section 2's Venus sphere and Section 3's are separate canvases, so both are briefly visible at the hand-off. A shared sphere would make it one continuous push.
- The Hub reads slightly white; could be bluer.
- Mobile layout not designed yet (plain stack).
- Testing note: the in-app browser stops painting when the Claude window is hidden, and `requestAnimationFrame` pauses, so screenshots can show a stale first frame.
