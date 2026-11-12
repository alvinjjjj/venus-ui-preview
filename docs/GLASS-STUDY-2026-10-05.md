# Two-layer glass material study

Local preview: `http://127.0.0.1:5175/#/?chainId=56&glassStudy=1`

This isolated study tests mutual refraction between two glass plates and readable surface lettering. Existing New acrylic and E particle renderers remain intact.

Controls: Clear glass / Soft frost, Split / Join / Box, Standard / Layered refraction, and Reset view. Drag the model to inspect its edges. Layer names use the existing stack translations.

## Square case closure update

Inspected the Blender reference frames 0240 and 0470 at `/Users/alvin/Desktop/Venus/Venus Website/Spoke marketing video 01/`. Frame 0470 shows a square lid over continuous glass sidewalls, with the layer edges visible inside the case. Frame 0480 is blank; 0470 is the useful closed-box reference.

The study now uses square 3.2 × 3.2 plates. Box first compacts the plates, then lowers a slightly larger square lid and hollow rounded sleeve around them. Reopening lifts the enclosure before separating the plates. The accepted face/edge glass parameters remain unchanged. The case has an additional scene capture for refraction through the enclosure. This is a visual enclosure over distinct layers, not a mesh union or a reproduction of offline Blender light transport.

Square/Box update checks: TypeScript, targeted Biome and production build pass. The existing narrow in-app viewport showed the closed case and reversible state controls. Viewport override calls timed out, so desktop breakpoint confirmation for this update remains incomplete. The original New and E components were not edited.

Layered refraction captures the lower scene before rendering the upper plate, so the upper plate can refract lower glass, lettering, and the blue marker. Upper surface lettering is rendered separately to preserve clarity. This adds framebuffer passes and memory compared with Standard.

Rendering uses capped pixel density, demand-based frames, offscreen/hidden-page suspension, reduced-motion support, and disposal on unmount. It does not establish an absolute Three.js quality ceiling or seven-layer performance.

Validation: TypeScript passed; Biome checks passed for the changed files; production build passed. Browser confirmation covered 1280 × 820 and 390 × 844, finishes, separation, refraction toggles, and orbit interaction. No browser error logs were recorded during confirmation.

Visual limitation: overlapping glass still appears grey under this lighting. Review this two-layer material direction before applying it to the full New stack. No deployment was performed.

## Applied to full New stack

Alvin selected Soft frost + Standard for the full seven-chapter design. `VenusStack/glassMaterial.ts` now shares the approved material and lighting with this study. The full New stack uses native transmission only, clear translated surface print, and a full-height sleeve on the closing VENUS cover. E retains its separate particle renderer. The current full-stack selection supersedes the earlier review-pending note above.

Full-stack checks: TypeScript, targeted Biome, section Stylelint and production build pass. Local browser QA covered 1280 × 820 and 390 × 844, chapter navigation, Spoke tiles, long Hub text, final case and surface lettering. No console errors were recorded during confirmation. New pauses GPU redraws when scroll easing settles. No production deployment was performed.

## Three material choices and simple view controls

New now offers Smoke (approved Soft frost baseline), Pearl (softer white frost), and Deep blue (tinted using the existing primary blue). Each uses Standard native transmission and is available in both site themes. Light mode updates the scene background and exposed lettering; the label rail retains its dark glass and readable foreground.

The compact controller offers 80–200% zoom, 3D/Top/Front camera presets, and Reset for the view. Camera changes update the existing scene; material/theme changes preserve the scroll chapter. E and the isolated glass study keep their existing rendering. The camera reserves room for the controller on desktop and mobile.


## Dark backdrop and full rotation

Dark mode now uses a static blue studio background derived from the existing site background and primary blue. It is a scene texture, so Standard glass can refract the backdrop, and is disposed with the scene. Light mode retains its plain background.

New supports horizontal dragging to rotate through 360°, plus a keyboard-accessible 0–360° range control. Angle presets keep their elevation while rotating; Reset returns to 3D, 0° and 100%. Maximum zoom is 200%; near views centre on the visible model. Mobile canvas gestures allow vertical touch scrolling. Desktop dragging, range endpoints, zoom limit, reset and responsive controls were exercised in the in-app browser; actual device touch input has not been tested.


## Reference correction: neutral physical studio and two-axis orbit

The user rejected the blue glow and clarified that the supplied reference means a natural 3D studio with a floor and soft contact/cast shadows. This supersedes the previous blue-backdrop selection. `stackBackground.ts` now creates a world-space matte floor, neutral fog and a VSM shadow receiver; full New uses neutral white fill rather than blue light. Dark mode has neutral grey ground, Light mode has a pale ground. The three model material choices remain selectable.

The user also clarified that horizontal rotation alone cannot reach the desired reference view. Camera elevation is now adjustable from -80° to 85°, alongside 0–360° yaw. Dragging horizontally changes yaw and vertically changes elevation. Both axes have keyboard-accessible sliders. Ref resets to azimuth 45° / elevation 40°; Front uses azimuth 0° / elevation 10°; Top uses elevation 85°. Maximum zoom remains 200%. Mobile canvas touch gestures orbit in both axes; scroll the copy rail or outside the canvas to move through the page. Actual device touch input has not been tested.

Validation for the studio correction: in-app browser at 1280×820 and 390×844; diagonal model dragging updated yaw and elevation together (87° / 67°), range endpoints reached 360° / 85°, Front returned 315° relative yaw / 10° elevation, and Reset returned 0° / 40° / 100%. Dark and light ground/shadows were visually checked, mobile controls did not overflow horizontally, and no browser error logs were captured. Final screenshot evidence is in `/tmp/venus-studio-review/`.

### 2026-10-06 New preview: free composition and studio experiments

New's full stack now offers Rotate/Move, pan, full vertical/horizontal turns, independent roll, five camera presets, Center/Reset view and 80–200% zoom. More opens three neutral studio lighting presets and independent brightness, shadow and floor-reflection settings. Ground hides for underside inspection. This extends the full New stack; the separate `glassStudy=1` study route and Explorer particles are unchanged. See the 2026-10-06 section in `NEW-CHAT-HANDOFF-2026-10-05-venus-stack.md` for validation and interaction limits.
