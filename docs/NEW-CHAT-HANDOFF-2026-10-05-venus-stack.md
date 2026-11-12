# Venus Stack section - new chat handoff (2026-10-05)

## Start here

- Goal: Section 2 directly under the hero. New retains its frosted acrylic stack; E presents the same seven-part narrative as an entirely separate particle animation with no plates or tiled model.
- Communication: Traditional Chinese/Cantonese. This is a mock-up; copy is **not final**, so layer text must stay runtime data, never baked into an asset.
- Source workspace: `/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview`.
- Local preview: `http://127.0.0.1:5175/` (served from `apps/evm`). Switch the Preview panel to **E** and scroll past the hero.
- Current approved scope: **New (`v5`) preserves the acrylic baseline; Explorer (`E`) uses a pure particle narrative.** Original (`v1`) keeps its existing landing.
- Reference page: `https://legora.com/product/aos`.
- Reference render (Alvin's target look): 480 RGBA PNG frames, 1080 x 1080, 16 s, in `/Users/alvin/Desktop/Spoke marketing video 01`.
- Standalone prototype: `docs/prototypes/venus-stack-scroll.html` (open directly in a browser).

## Latest approved comparison (2026-10-05)

- New has Smoke, Pearl and Deep blue finishes, 80–200% zoom, Ref/Top/Front presets, Reset, 0–360° yaw and -80–85° elevation. Desktop and touch model dragging adjust both axes; page scrolling on touch remains available outside the canvas. The rejected blue/green glow has been removed. New now has neutral studio illumination, a physical ground plane and softly filtered cast shadows in both themes. Ref starts at 45° azimuth and 40° elevation, with zoom 100%; manual angle changes retain exact displayed degrees. E and the isolated glass study remain separate.

- Latest material selection: Alvin approved **Soft frost + Standard** from the square glass study for the full New stack. `glassMaterial.ts` shares the exact study face/edge material and RoomEnvironment lighting with `GlassStudy/scene.ts`. New uses native transmission, without the study's extra layer captures.
- New's seventh chapter lowers a square lid with a continuous sleeve spanning all six internal layers. Surface lettering is a separate render pass and remains translated; buried labels fade away. Clicking the final chapter reaches the closed case. Stationary New scenes stop redrawing after scroll easing settles.
- New's camera frames the model in the space left by the actual rail and navigation bounds. Mobile uses a two-column chapter rail with an expanded full-width chapter. E's particle implementation is unchanged.

- New now contains the previous Explorer hero composition and acrylic stack, without model particles.
- E uses the same copy but a separate point-cloud scene. Source streams gather horizontally into a rotating Hub, branch into Venus Core / Venus Flux / Fixed Rate, become bidirectional exchanges, then yield orbits, agent dispatch streams, and a porous safety envelope. No acrylic plates, squares, or vertical hero exit are drawn in E. These are conceptual paths, not live allocation data.
- `VenusStack/ParticleCanvas.tsx` renders E's scene and `particleStory.ts` defines its seven poses. `VenusStack/index.tsx` selects the acrylic or particle renderer through `variant`. `LandingMockup/FlowFieldThree.tsx` opens E's hero flow sideways into a fan; its centre spine dissolves during the transition. `StackFlow.ts` belongs to the earlier, unused model-particle prototype.
- Mesh faces and polished edges have separate physical materials. The studio backdrop is a Three texture sampled from the section's existing colors. Plate extrusions and labels no longer have a duplicate thickness offset.
- New retains its portrait acrylic camera. E positions the field below the mobile rail; collapsed mobile chapters use two columns, and the expanded copy occupies a full row. E draws 2,400 fine points on desktop and 1,200 on mobile, pauses offscreen / in hidden tabs, and uses stationary particles under reduced motion.
- Particle refinement: the Hub is a larger, open particle ring on the left, with three smaller Spoke rings branching to the right. Labels sit outside contours, and only the Hub label is emphasized. The renderer fits every scene into the space left by the rail and navigation using their existing padding. Point sizes are finer, accent points rarer, and the safety envelope / agent routes share the same framing budget. No global tokens or New materials changed.
- Verification is local on `:5175`: desktop 1280 × 720 and mobile 390 × 844. TypeScript, targeted Biome, changed-section Stylelint, and the production build pass. Pure-math checks cover all seven finite poses, moving normal particles, stationary reduced motion, distinct scene transitions, exactly three Spokes, and every particle fitting within desktop / portrait / short art areas.

The material details further below record earlier iterations; the current implementation and this latest comparison take precedence.

## Status at handoff

The scroll-driven build-up is **ported and running** on `:5175` in E mode. Alvin confirmed layer 01 enters with its label visible and the first chip opens from scroll.

Second session (2026-10-05, afternoon): `tsc` passes, biome passes, the open-chip header is fixed and the plate material was retuned on Alvin's own GPU against the Blender frames (240, 470).

How the checks were run from the remote-device shell: `node_modules` is a symlink to `../venus-earn-demo/node_modules`, so that folder must be connected too. `tsc` needs `NODE_OPTIONS=--max-old-space-size=3072`. The repo's biome is the darwin binary; the Linux VM used `@biomejs/cli-linux-arm64@1.6.4` installed outside the repo. **stylelint fails repo-wide** (`Unknown rule selector-list-comma-newline-after` on any inline `style={{}}`, e.g. `components/Dropdown`): a config/version mismatch with stylelint 16, not this section.

## Files

- `apps/evm/src/pages/Landing/index.tsx` - renders the shared hero and selects New's acrylic renderer or E's particle renderer; hero `connectedFlow` is enabled only in E.
- `apps/evm/src/pages/Landing/VenusStack/stackData.ts` - layer order and ids, `SPOKES`, `SPOKE_SLOTS`, `PX_PER_LAYER` (520).
- `apps/evm/src/pages/Landing/VenusStack/useStackCopy.ts` - reads layer names/bodies from i18n. **Copy lives in the translation files** under `landing.venusStack.*` (`en`, `zh-Hant`, `zh-Hans`; ja/vi/th/tr fall back to English, the repo's convention). Plate labels in the 3D scene follow the language too (the scene rebuilds on change; scroll progress is kept in a ref so it does not replay).
- `apps/evm/src/pages/Landing/VenusStack/StackCanvas.tsx` - three.js scene (`three@^0.186.0`), scroll progress, layer animation.
- `apps/evm/src/pages/Landing/VenusStack/ParticleCanvas.tsx` - E's separate Three Points scene, responsive framing, DOM labels, rendering lifecycle.
- `apps/evm/src/pages/Landing/VenusStack/particleStory.ts` - deterministic seeds, seven normalized particle poses, eased scene interpolation.
- `apps/evm/src/pages/Landing/VenusStack/index.tsx` - tall wrapper, sticky stage, chip rail, prev/next, progress bar.
- `apps/evm/src/pages/Landing/VenusStack/styles.css`.
- Mode store: `apps/evm/src/demo/GlassVersions/store.ts` (`'v1' | 'v5' | 'explorer'`). **Since 2026-10-05 Explorer uses New's component materials** (`previewDesignByMode.explorer = 'v5'`, so `<html data-glass-preview="v5" data-glass-version="v6">` in E). Both modes share the hero composition and seven chapters, with separate acrylic / particle renderers. Stats checks `previewDesignByMode[mode] === 'v5'` instead of `mode === 'v5'`, so E gets New's Stats layout too.

## How it works

- The page scrolls inside `#PAGE_CONTAINER_ID` (see `containers/Layout`), not `window`. The section is a tall wrapper (`PX_PER_LAYER * STACK_LAYERS.length + 100svh - 64px`) with a `position: sticky` stage inside. The wrapper must not have `overflow: hidden`, or sticky breaks.
- Progress = how far the sticky stage has been pushed down its wrapper: `(pinRect.top - wrapperRect.top) / (wrapperHeight - pinHeight)`. This works whatever element scrolls.
- Progress is smoothed each frame: `smooth += (target - smooth) * 0.1` (instant under reduced motion).
- Plate `i` enters over the first 72% of its slot with `easeOutCubic`, dropping from `+1.9`. The cover drops from `+2.4` last. The group drifts `rotation.y` from -0.1 to +0.1 across the section.
- The open chip is `floor(progress * STACK_LAYERS.length)`. React state only updates when that index changes; the progress bar width is written directly to the DOM.
- Clicking a chip (or prev/next) scrolls the page container to that layer's slot.

## Reference measurements (Legora, 1440 x 900, 2026-10-05)

- **No WebGL on the page**: zero `<canvas>`. The stack is one paused MP4 (8.1 MB, 1920 x 1245, 11.03 s, no alpha, Framer) whose `currentTime` follows scroll.
- ~368 px of scroll per second of video; 7 layers, so ~1.58 s / ~580 px per layer. `currentTime` is smoothed, never set directly.
- Layer names are baked into that video. We draw live instead because copy is not final.

## Done

- [x] Scroll-driven, pinned build-up replaces click-to-explode.
- [x] Pacing: `PX_PER_LAYER = 600`, smoothing `0.1`, enter share `0.72`.
- [x] Chips open from scroll; staggered title / label / body animation; click scrolls to the layer.
- [x] White frosted acrylic on black; env-strip lighting; camera pulled back.
- [x] Text visible on plates; buried labels ghost to ~16%.
- [x] Off-screen pause (`IntersectionObserver`), `ResizeObserver` sizing, full dispose on unmount.
- [x] Explorer-only.

## Next - visible in Alvin's 2026-10-05 screenshot

- [x] **Open chip header.** The title no longer fades: when open it turns into the small grey label top-left and `×` is pushed right (`margin-left: auto`). The separate `.venus-stack__chip-label` was removed. `.venus-stack__chip-body` is `width: 0; min-width: 100%` so closed chips hug their title.
- [x] **Plates read flat grey.** Fixes: `NeutralToneMapping` (ACES was greying the whites), cooler body `0xf3f5f8`, transmission 0.5, a float HDR env strip (`ENV_STRIP = 6`) for the bevel glint, and an overhead `PointLight` (`GLOW_INTENSITY = 14`) behind the stack for the top-face falloff. The cover is rougher/less clear and hides the labels inside (`LID_BURY = 0.85`). Tuning constants sit at the top of `StackCanvas.tsx`.
- [x] **Chip icon + motion (Alvin, 2026-10-05).** `+`/`×` now use the repo `Icon name="close"` (rotated 45deg = plus). The odd drop-down came from the closing chip snapping to its narrow width, reflowing its text to ~117 px and shooting to ~394 px tall before collapsing, plus a `999px` radius that stayed a blob mid-animation. Now: chip `width: fit-content` <-> `100%` animated via `interpolate-size: allow-keywords`, radius 19px <-> 20px, and `.venus-stack__chip-inner { width: 100cqi }` (rail is the container) so text never reflows. Browsers without `interpolate-size` (Safari, Firefox) snap the width but the text still does not reflow.
- [x] **Background** is the hero's end colour (`color-mix(... --color-background-active 88%, --color-dark-blue)`), not black.
- [x] **Buttons match the site (Alvin).** Chips, open card and prev/next use the header-button tokens: `--color-dark-blue` fill, 1px `dark-blue-hover / 0.5` border, **8px radius (no pills)**, `dark-blue-hover` on hover. Plus badge is a 4px square; only its svg rotates. Prev/next use `Icon` `chevronLeft` / `chevronRight`. Progress bar is `--color-blue` and stays pill-shaped (not a button).
- [x] **E = New components (Alvin).** Before, E kept Original's materials (`explorer: 'v1'`). Checked Markets in E vs New: identical. Venus Stack buttons now use New's glass material (values copied from `v5-button-refresh.css`, as the Oracle link does): prev/next = clear glass (7% white, inset highlights, `blur(12px) saturate(130%)`); chips + open card = New's fixed dark glass (7% over `rgb(24 26 32 / 94%)`) because they sit over the white plates, where clear glass made white text unreadable. 8px radius throughout.
- [ ] Material, still short of Blender: bevel rims are not yet the thin bright lines of frame 240; cover top reads a little too white. Next knobs: `ENV_STRIP` up, strip narrower, `GLOW_INTENSITY` down.
- [ ] Check the full sequence: layers 02-06, the spoke tiles (4 slots), and the `VENUS` cover landing.
- [ ] Check the hand-off from the hero: the section starts on the hero's sky colour and fades to black within ~9% of its height.
- [ ] Mobile 390 x 844: the rail overlays the canvas; confirm the model is still readable.
- [x] `tsc` and biome pass in `apps/evm` (stylelint: see Status).
- [ ] At ~800 px wide the open chip covers the left of the model; consider a narrower rail or shifting the camera target right.
- [ ] Dated entry in `docs/CHANGELOG.md`.

## Gotchas

1. **High transmission on a black ground renders black plates.** Real-time transmission only passes the background through. Treat frosted acrylic as a bright diffuse body with modest transmission (plates 0.5, cover 0.3; above that the empty black behind starts to show).
2. **Text disappears under transmissive plates.** The transmission pass draws after the label whatever its `renderOrder`. Labels use `depthTest: false`, `depthWrite: false`, `renderOrder: 999`; burial is the explicit ghosting rule `labelOpacity = local_i * (1 - 0.84 * local_{i+1})`.
3. **`bevelThickness` makes the plate thicker than `depth`.** Labels sit at `PLATE_T + 0.03` to clear the bevel.
4. **Do not run `git` from the remote-device shell without delete permission.** It leaves `.git/index.lock` behind and blocks the next commit. One was left and removed on 2026-10-05. (`git status` was run once on the afternoon pass; no lock was left, but avoid it.)
5. **A 1 px wide equirect DataTexture breaks PMREM** (cube size = width / 4 → shader compile error, plates vanish). Keep the env texture ≥ 256 wide.

## Copy (agreed with Alvin, 2026-10-05)

Seven layers, bottom to top: Chains & Assets, **Liquidity Hub**, **Spoke Markets** (tiles: Venus Core, Venus Flux, Fixed Rate + 1 open slot), Borrow & Trade, Vaults & Prime, App & Agent Skills, Governance & Safety (cover). The story centres on Liquidity Hub + Spokes. Rules from Alvin: **do not mention VAI** (being delisted); **Hub depositors who hold Prime still earn Prime rewards** (stated in the Hub and Prime layers; not found anywhere in this repo, so confirm wording with the product side before launch). No hard numbers (chain count, proposal count, years): they go stale.

## Open decisions (ask Alvin)

- **Spoke slots, 4 or 6.** Currently 4 (3 live + 1 open). Open slots stay unlabelled: naming an unshipped venue (e.g. Phase 2 tokenised-equity spoke pools) would put the page ahead of the contracts.
- **Section length.** Hero plus ~3,600 px of pinned scroll may feel long; lower `PX_PER_LAYER` if it drags.
- **Glass fidelity.** Real-time reaches roughly 80% of the offline look. If that gap matters once copy is final: a text-free Blender render plus per-frame plate matrices in JSON, with DOM labels placed by `matrix3d`.

## 2026-10-06 — New model exploration controls

User approved free placement/full rotation and a neutral product-studio background, with the priority being more room to experiment. Implemented only in New's VenusStack; Explorer particles and global design tokens are untouched.

- Rotate/Move modes; Shift or right-drag also pans. Pan is screen-relative composition positioning (not lifting the object off the floor). Center restores placement; Reset view restores 100%/reference angle/zero roll, without resetting the chosen material or lighting.
- Horizontal rotation wraps through 360°, vertical rotation wraps through a full turn (-180° to 180°), and Roll is independently adjustable. Ref/Front/Side/Top/Bottom presets recenter the view. The ground hides when the camera is below it so the underside remains inspectable.
- Zoom remains 80–200%; Alt/Ctrl/Meta + wheel zooms while ordinary wheel scrolling continues the seven-layer story.
- More expands material, angle, position and studio controls. Soft/Contrast/Airy presets plus brightness/shadow/reflection sliders. When editing, the copy rail temporarily hides; closing More restores it. Desktop settings sit beside the model; mobile settings sit above it and scroll internally.
- Neutral seamless ground, cast soft shadows, subdued 512px planar reflection; no blue/green background glow. Shader ground does not tone-map, preventing a visible horizon caused by a mismatch with scene background. Reflection strength zero skips its additional render pass. Existing on-demand rendering and cleanup remain.

Verification: TypeScript, targeted Biome and Stylelint passed; production build passed. In-app browser checked at 1280×820 and 390×844, dark/light, pan drag (8%/-9%), rotation drag (322°/-150°), underside, roll, studio preset, recenter/reset and 200% disabled zoom-in. No browser error logs during the checks. Physical touch-device gestures and modifier-wheel shortcut were not exercised. On narrow screens, collapse the existing floating Preview panel to expose the model controls fully.

Screenshots: `/tmp/venus-free-view-dark.png`, `/tmp/venus-free-view-light.png`, `/tmp/venus-free-view-mobile.png`. These are local preview checks, not a deployment.
