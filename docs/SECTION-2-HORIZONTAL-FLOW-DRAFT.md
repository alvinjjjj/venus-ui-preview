# Hero → Section 2 motion study

Date: 2026-10-06
Surface: local :5175 landing, New / Explorer. Desktop study only (at least 1024px).

## Approved direction

Keep the original full-screen Hero, moving starfield and converging fan paths. Native downward wheel scrolling moves the Hero text away and leads a horizontal straight beam into the center. The trailing end then catches up and collapses into a point. Nearby particles contract, the point gathers energy, and a separate galaxy bursts out, overshoots slightly and settles. The incoming beam and stream are gone before the rings appear. The larger Venus sphere grows during the burst; four anonymous gradient spheres, text and proof metrics reveal after the rings settle.

The scroll prompt is removed; Trusted by many remains at the bottom of the Hero. Default Frame 2 includes the spheres, heading and four proof metrics. The preview controller can hide content for a motion-only study.

## Independent frame controls

The existing Preview → Motion panel has Frame 1 and Frame 2 controls. Clicking either jumps to that frame. Native scrolling and replay also select the matching control group automatically.

- Frame 1 preserves Lines, Particles and Speed, plus the previous Stars, Warm accents, Brightness, Size, Twinkle and Movement controls. Background stars remain shared across the transition for continuity.
- Frame 2 separately controls rotation (-180° to 180°), tilt, ring size/count, ring particle count/size, orbit speed, ring brightness, contraction time, charge hold, burst strength and scroll distance.
- Each frame has its own reset. Resetting Frame 2 does not reset Frame 1's settings.
- Replay transition and Pause transition stay visible below the scrollable fields. Pause stops preview seeking while ambient particles keep flowing. Manual wheel or keyboard input cancels replay.
- Show spheres and text toggles the desktop Section 2 content; hidden content remains excluded from focus/accessibility navigation.
- Controls use the site's English or Chinese language setting. Values remain local in-memory preview settings, not a published user preference.

## Choreography and implementation

HorizontalFlow reuses LandingMockup and AssetOrbit in a sticky stage of 100svh minus the existing 64px navigation. It observes native scroll through a passive listener and animation-frame updates; no wheel interception or bottom progress slider.

Default transition travel is 1.0 times the content viewport height (minimum 640px), followed by a 40% viewport hold before Section 3. Default relative beats: arrival 0–24%, tail contraction 24–47%, brief energy hold 47–50%, burst 50–64%, settle 64–84%, content 84–100%. Contraction/hold controls renormalize those weights while preserving their order and room for content.

Frame 1 fan paths translate without morphing and fade as the beam arrives. Both beam vertices share the same Y coordinate. The fan and its particles translate vertically by the same amount, keeping their convergence seam connected to the beam. Frame 2 uses separate ring/point geometry and a separate elapsed clock, so its count and speed are independent of the Hero stream. Rotation, tilt, size and brightness update existing buffers; count changes rebuild bounded geometry. Default burst grows to 1.15 times final size then settles to 1.0. Star buffers remain mounted, with existing offscreen/background/reduced-motion handling. Reduced-motion preview replay seeks directly to the endpoint.

No new dependencies or global design tokens. The scoped preview composition and controller styles reuse existing palette, typography and spacing tokens. Below the desktop breakpoint, the established vertical landing draft remains; no mobile acceptance work was done.

Desktop uses four decorative gradient spheres without asset logos, names or APY popups. The center sphere retains the Venus logo. The standalone/mobile asset interaction remains unchanged. Proof values remain the previous illustrative draft values. No new financial/product claims or live data integration in this pass.

## Verification before the latest refinement

Local New preview at 1440×900:

- The stage stayed at top 64px, height 836px.
- Changed Frame 1 Particles to 120 and Stars to 900: Frame 2 retained 370 ring particles. Reset Frame 2, returned to Frame 1, and confirmed 120/900 were preserved; then restored defaults.
- Changed Frame 2 rotation to 45°, size to 0.7, rings to 3 and ring particles to 0. Visually confirmed a smaller tilted three-ring geometry; restored defaults.
- At native scroll 360px, the beam was horizontal and its tip was centered. At approximately 630px, the beam was gone and only the concentrated particle nucleus remained. Final Frame 2 showed the centered galaxy with no incoming line.
- Enabled tokens/text and selected USDC: example Supply APY 5.24% remained functional. Restored motion-only view.
- Replay returned to Hero and automatically selected Frame 1; progressed to Frame 2. Pause stopped an early replay at scroll 74px.
- TypeScript, scoped Biome and scoped Stylelint passed.

Local draft only. No production build, deployment or GitHub push. Animation appearance/tuning remains for user review.

## 2026-10-06 connection and sphere refinement

- Removed cross-star generation and its controller option; ambient round stardust remains.
- Shortened default travel from 1.6 to 1.0 viewport heights (836px at 1440×900), and the charge hold to approximately 3% of the timeline.
- Verified an intermediate native-scroll frame: the converging fan meets the straight beam at the same height, with no former step between them.
- Verified the burst frame: the enlarged Venus sphere is visible inside the expanding rings, before the final content.
- Verified the final frame: four gradient spheres (violet, aqua, amber and blue), Venus center, heading/subtitle and four mock proof values are present. No satellite token logos/names or cross stars.
- Computed metric typography is 40px / weight 600, matching Hero TVL; metric labels and subtitle are 20px. Reuses existing type and palette tokens.
- TypeScript, scoped Biome and scoped Stylelint passed; browser warning/error log was empty.

Local desktop draft only; no production deployment or mobile acceptance in this refinement.

## Linked Three.js sphere draft — 2026-10-06

- Desktop now renders five real sphere meshes in the existing Three.js canvas, with normal-based gradient lighting. The center carries the existing Venus mark in white. A shared sphere geometry and locally derived theme colors avoid new dependencies/global tokens.
- Sphere positions, ring segments and ring particles use the same orbit projection and radii. Rotation, tilt, System size and Orbit speed control the complete scene; spheres retain a round silhouette. Changing ring count reassigns satellite paths to existing rings.
- Formation first expands face-on (90-degree tilt), then smoothly turns to the controller's selected angle between expansion and settlement. Native scrolling is deterministic and reversible; reduced motion uses the final orientation directly.
- Added Face-on rings / Galaxy view shortcuts within Frame 2. Existing independent Frame 1 stardust controls, replay/pause/reset and content toggle remain.
- Incoming fan stays visible until its seam has left the viewport. The straight beam stays lit while its tail catches the nucleus, rather than fading prematurely. The transition geometry draws exactly one segment; legacy connected-stream updates cannot overwrite it.
- Sphere/particle depth now hides background dust and rear orbital segments behind the models. The DOM center remains a stable measuring anchor and accessible label, with the existing gradient fallback when WebGL is unavailable.
- Desktop proof values/copy remain mock layout content, unchanged in this pass. No mobile work or deployment.

Verification: orbit projection preserves circular 3D distance at 756 arbitrary angle/phase samples; front/tilted endpoints, inner-orbit clearance and deterministic rewind checks pass. Scoped formatting/style checks and TypeScript pass. Desktop visual acceptance covers white logo, formation, linked rotation/size and the initial line seam.

Final desktop check at 1440×900: inspected the joined fan/beam at 72px native scroll, face-on formation via shortcut, and a 35° / 0.8× controller test with shared movement. Restored defaults. Browser warning/error log empty; saved final scene and formation screenshots.


## Desktop layout refinement — 2026-10-06

- Preserved the linked animation and both frame controllers. Center radius is now 0.065 scene units (half its previous value); all four satellites share half that radius, keeping the diameter ratio exactly 2:1. DOM fallback sizes follow the same ratio.
- Section 2 heading starts at the same height as Hero. The scoped inset follows the existing Hero headline padding, font size, offer row and 25% offset; no global token was changed. English subtitle is shortened to “Explore assets and yields through Venus.”, with matching Traditional/Simplified Chinese copy.
- At a 1440×900 viewport, Section 2 content is 1280px wide. Both heading boxes start at y=129px.
- Removed the proof divider; all four proof numerals use 40px / weight 500 and their labels use half the existing 20px token (10px), as requested. Proof values remain illustrative.
- Scoped Biome, Stylelint and TypeScript checks pass. Local desktop preview only; no deployment or mobile acceptance.


## Hierarchy, logo and orbital lighting — 2026-10-06

- Proof numerals now use 1.5× the existing 40px display token (60px / weight 500). Four columns remain within 1280px; captions use the existing 12px token, improving the previous 10px readability. No divider or global token change.
- Removed the visible Hub caption from the desktop abstract scene; the center retains an accessible Venus Liquidity Hub label. Standalone asset views keep their original label.
- Five sphere diameters increase 20%, retaining the center-to-satellite ratio of 2:1. The center's white logo reuses the existing path with a 608×544 intrinsic SVG raster size, replacing the magnified 38×34 texture. Tone mapping is disabled for the white mark.
- Frame 2 exposes Galaxy zoom (0.4–2×, whole scene) and Orbit spread (0.75–1.8×, orbit paths and satellite positions only). Both use the shared projection, so moving satellites stay on their rings. Reset restores both to 1×.
- A fixed point light above-left of the Hub now supplies each satellite's light direction from its current 3D orbital position. Diffuse light, highlights and shadow sides change continuously through orbital motion and rotation; no extra geometry or shadow-map pass. The stationary center retains a stable highlight.
- Observing the scene layout keeps the WebGL center aligned when typography or the caption changes. Existing scroll formation, independent Frame 1 controls and reduced-motion handling are preserved.
- Local desktop draft only. Mock proof values are unchanged; no publication or mobile acceptance.

Verification: scoped TypeScript/Biome/Stylelint and the existing 756-sample projection check passed. Keyboard slider input confirmed Galaxy zoom reaches 2× and visibly scales the complete scene; Orbit spread at 1.15× increases paths while retaining sphere sizes. Preserved the 1280px content width and aligned headings. Added a fallback for live-preview settings that predate Orbit spread after observing transient NaN geometry during hot reload.

Fresh-page confirmation after the fallback: no browser errors. Vite reports a buffer-module compatibility warning from a dependency; it did not block the preview. Final review capture uses Galaxy zoom 1× and Orbit spread 1.15×.


## Four-token brand mock-up and trust-row grouping — 2026-10-06

- Adopted the accepted reference defaults: rotation −8°, tilt 15°, Galaxy zoom 1.6×, Orbit spread 1.5×, five rings. Reset now returns to these values; existing controllers remain available.
- Sphere logo mock-up uses USDC (blue/white), USDT (green/white), U (gold/silver mark on smoke grey), and BNB (yellow mark on charcoal). Marks are reused from packages/chains: SVG disc backgrounds are removed for transparent high-resolution brand marks; U PNG is copied unchanged. One shared mark source map serves WebGL and the CSS fallback.
- All satellite logo planes use the sphere's projected position/depth and size, so rotation and both zoom controls stay connected. Allocated textures/materials are disposed with the existing scene; plane geometry is shared with the center logo.
- Satellites occupy inner ring paths to keep complete spheres inside the viewport at the chosen wide default. BNB uses a lower specular highlight, retaining its dark charcoal surface.
- Kept numerals at 60px and mock values unchanged. Labels move above the figures in their existing DOM order, at 14px. A centered 1056px trust row groups the four facts more tightly inside the 1280px content area. No new cards, dividers, or global token changes.
- Local desktop layout/brand mock-up only; no rates, on-chain market additions, deployment or mobile acceptance.

Desktop confirmation at 1440×900: 1280px content / 1056px trust row, labels 14px above 60px values, four clear token marks, charcoal/yellow BNB and all complete spheres on inner paths. Scoped Biome/Stylelint, TypeScript and the 756-sample projection check pass. No browser errors since the fresh-page baseline. Saved /tmp/venus-section2-token-logo-mockup.png.

## First-entry proof animation and sphere depth — 2026-10-06

- Replaced the illustrative plus-suffixed proof values with the user's supplied draft figures: 2020, 41, 623 and 123. These await confirmed data; labels and accessible preview-value descriptions remain.
- The year has a 650ms reveal on its numeral alone. The other three figures count to their targets over 900ms on first viewport entry after Section 2 settles. Returning between frames does not reset them. Reduced motion displays final figures immediately; hiding the document finishes the count. Screen readers receive final values without repeated announcements.
- Reduced U's logo span and slightly adjusted USDC's span to balance the four marks visually while retaining equal satellite diameters and the accepted scene size.
- Brand marks now follow a subdivided spherical patch and share the sphere's light direction. Stronger diffuse contrast, a broad reflection and a smaller specular highlight give the balls curved, shaded surfaces; the light changes with orbital position. BNB retains its darker charcoal treatment.
- No global design tokens, navigation or controller changes. Local desktop draft only; no deployment or mobile acceptance.

Verification: scoped Biome/Stylelint and TypeScript pass. Desktop preview at 1440×900 confirms all four final values, the year animation class, clearer curved marks and light/dark hemispheres. A Frame 1 → Frame 2 revisit retains the entered state and final figures. Intermediate count frames were not captured by the browser inspection tool. Saved /tmp/venus-section2-countup-depth.png.

## Sphere texture choices and yield reveal — 2026-10-06

- Added three Frame 2 surface presets: Satin (existing soft specular finish), Frost (broader matte reflection with subtle procedural grain), and Polished (narrower, stronger highlight). Shared shader uniforms change the finish without new textures, dependencies or global tokens. All retain the fixed point light and moving shadow side.
- The four satellite spheres initially show their colored surfaces. Pointer entry or keyboard focus reveals the token's curved mark and a compact yield label above it. Supply APYs are explicitly examples: USDC 5.24%, USDT 4.86%, U 6.12%, BNB 2.38%; no live API or product-yield claim is added.
- Native button targets use the same projection and radius as WebGL, including angle, zoom, orbital movement and center occlusion. Hover/focus holds the orbital phase while reading, and leaving/blurring/Escape releases it. The center Venus mark stays visible.
- Lifted the desktop proof row by 24px using the existing spacing token. At 99.5% transition completion, the four facts rise in a short stagger and the three counts begin after the entrance starts. The year remains 2020 throughout. First-entry-only and reduced-motion behavior remain.
- Desktop draft only. Kept the selected galaxy proportions, typography, existing Frame 1 controls and mobile composition.

Verification: scoped Biome/Stylelint and TypeScript passed. At 1440×900, observed intermediate figures 2020 / 1 / 0 / 0 followed by 2020 / 41 / 623 / 123, compared all three material presets, and verified the USDT mark + example yield through pointer/click and keyboard focus. The held target retained identical projected coordinates across captures, and Escape dismissed it. Browser error log empty. Saved Satin/Frost/Polished comparison screenshots under /tmp/venus-orbit-*.png.


## Frost default, self rotation and independent interactions — 2026-10-06

- Frost is now the default finish. Object-space surface grain and broad wisps rotate with each sphere mesh, while lighting remains fixed in world space. Frame 2 adds Self rotation (0–2×), independently of orbital speed; the white center mark stays readable.
- Center Venus uses a dark blend of the existing blue and active-background tokens, separated from the lighter USDC blue. No global palette change.
- Each satellite owns its orbital phase and spin phase. Hover/focus holds only that satellite; clicking pins its example yield until another selection, an outside click or Escape. The remaining satellites and ring dust continue moving, and the held sphere resumes without a phase jump.
- 41 / 623 / 123 replay their own 900ms count on pointer entry or visible keyboard focus. Independent animation frames prevent one figure from restarting the other two. The 2020 reveal and first-entry group animation remain unchanged. Reduced motion shows final figures and screen readers receive stable final labels.
- Desktop preview only. The proof figures remain user-supplied draft values, and all Supply APYs remain explicitly examples.

Verification: scoped Biome, Stylelint, TypeScript and the existing 756-sample projection check pass. At 1440×900, observed an isolated 41 replay with the other values remaining 2020 / 623 / 123. Selected USDT held identical projected coordinates across captures while the other three coordinates changed. Compared surface wisps with orbital speed 0 and self rotation 2×, then restored the accepted defaults. Browser error log empty. Final screenshot: /tmp/venus-section2-frost-spin.png.


## Quiet Frost, varied sizes and pointer hit repair — 2026-10-06

- Replaced repeating latitude wisps with broad, low-contrast object-space haze and reduced the grain strength. Frost lighting and self rotation remain; no global materials or palette changes.
- Kept the accepted Venus center size. Satellite diameter multipliers now use U 0.90, USDC 1.00, USDT 1.08 and BNB 1.17; the largest is 30% wider than the smallest. WebGL geometry, logo patches, hit targets and DOM fallbacks derive from the same radius values.
- Fixed numeric pointer input: the desktop AssetOrbit overlay intentionally passes through pointers, but its numeric dd elements also inherited pointer-events:none. Scoped pointer-events:auto to the three focusable numerals in the non-inert scene, allowing genuine hover without blocking the rest of the canvas. The previous keyboard-only replay verification missed this defect.
- Local desktop preview only; data and example yield content unchanged.

Verification: TypeScript, scoped Biome/Stylelint and 756 projection samples pass. At 1440×900, observed the pointer hovering the actual 41 numeral and its intermediate value 4 while 2020 / 623 / 123 stayed final. Read-only DOM hit testing now resolves to each numeral, and projected satellite widths measured U 93.90 / USDC 104.33 / USDT 112.67 / BNB 122.06px (ratio 1.30).


## Count hover stability and transition pacing — 2026-10-06

- Reserve each counter's final tabular numeral width with an aria-hidden sizing span; the animated numeral overlays it. A cursor near the outside of 41 now remains on the same hit target while the value is one digit. Active counts cannot restart mid-run. Retained a restrained, single 3.5% scale feedback on pointer entry/visible focus, disabled for reduced motion.
- Gathering dust tightens continuously during contraction and charge, with smaller/dimmer nearby particles and a restrained nucleus flash. Shortened contraction/charge weights and gave ring expansion more of the unchanged total scroll distance; preserved the face-on expansion to tilted galaxy, both controllers, Frost and satellite sizes.
- Added a 60ms time-constant catch-up of scene progress for wheel steps; native scroll itself is never intercepted. DOM content and WebGL use the same displayed progress. It settles exactly to the target in both directions, stops its own extra frames at rest, and jumps directly for reduced motion/hidden documents.
- Desktop refinement only; mock figures and APY examples unchanged.

Verification: TypeScript, scoped Biome/Stylelint and the existing 756-sample projection check pass. Native desktop wheel input verified the joined beam, compact nucleus, face-on expansion, final galaxy and reverse transition. At 1440×900, the sticky scene remains at y=64 with height 836; hovering the left edge of 41 shows intermediate 5 while its width remains 63.74px and 623/123 stay final.

Confirmation: at a stationary pointer near 41’s left edge, the value returned to 41 without another restart and kept its 63.74px hit width. All four metrics fit at 1280×900 and 1440×900; browser error log empty. Saved nucleus and completed-scene screenshots under /tmp/venus-nucleus-refined.png and /tmp/venus-scroll-hover-refined.png.
