# Venus V5 UI preview - new chat handoff (2026-09-23)

## Start here

- Goal: continue Alvin's Venus Protocol UI/UX design-review prototype, especially the V5 button system and Liquidity Hub pages. This is a public review site, not the official Venus app.
- Communication: Traditional Chinese/Cantonese. Check screenshots and the selected Figma node before changing visual details. Preserve V4, V3 and Original unless a request explicitly includes them.
- Source workspace: `/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview`.
- Local preview: `http://127.0.0.1:5175/` (check that the server is still running).
- Public preview: `https://hkcardcoll.hk/venus/`.
- Representative route: `https://hkcardcoll.hk/venus/#/liquidity-hubs/0x0e5AA174d4F31b757a237eb1999DE151596788B0?chainId=56&tab=supply`.

## Current verified release

- On 2026-09-23, the public site was updated through Cloudflare Pages via `alvinjjjj/potodesign-site` `main`, commit `22c9329` (`Publish latest Venus V5 design review`). Release marker: `venus-v5-prime-solid-20260923` at `/venus/demo-release.json`.
- A fresh Chrome session loaded the exact public Liquidity Hub route without a host-side asset failure. In the V5 light-mode Prime demo, the header account control and the account-modal control both had `opacity: 1` and the same computed shadow. The inner control remained disabled/non-interactive.
- The public page was opened in the in-app browser. A normal browser session may open in V4 or without a demo account because version, theme and account are browser-local settings.
- The source repository is separate from the deployed site. Source changes do not publish automatically. At handoff, the source working tree contains many uncommitted V5 changes; inspect `git status` before editing, committing or deploying. Do not discard those changes.

## Latest design decisions

- V5 uses 8px button corners. Shared ButtonGroup controls use 0px outer padding, a 4px gap and no outer border; the light-mode group track is transparent so the buttons read separately. The selected control remains blue glass. V4 keeps its earlier shape.
- Core Market row typography extends across V5 Core Markets, E-mode, Isolation and Liquidity Hubs: 14px headings, 15px names/main values/APY/risk, 12px secondary USD values.
- V5 Liquidity Hub light detail uses a neutral grey page gradient, quieter chart grid, a visible light-grey supply-cap rail and the approved blurred chart tooltip. The disabled Supply CTA retains blue glass and white text in both themes.
- The account modal Theme switch has 8px corners; the redundant Prime/Normal account line was removed. The inner Prime address control is visually full-strength like the header control, while remaining non-interactive.
- Visible prototype-only `Demo` labels and the shared red test-environment banner were removed from the review UI. Demo balances and transaction safeguards remain.

## Files and review references

- Current design specification: `docs/V5-UI-HANDOFF.md`.
- Dated changes: `docs/CHANGELOG.md`.
- Review workflow: `docs/REVIEW.md`.
- V5 button styles and latest Prime fix: `apps/evm/src/demo/GlassVersions/v5-button-refresh.css`.
- Figma button system: `https://www.figma.com/design/ffh5VFqviRERdBN5rhJkgv/Venus-UI-Kits_new?node-id=1-2631`.
- Figma button group: `https://www.figma.com/design/ffh5VFqviRERdBN5rhJkgv/Venus-UI-Kits_new?node-id=3212-68613`.
- Figma Liquidity Hub: `https://www.figma.com/design/3VOuExbBmrfCj0DKKqeQuX/Liquidity-Hub?node-id=1254-131208`.

## Build and deployment boundary

- Build from the source repo with the `/venus/` base path. The last successful production build used Node 22.22 and `yarn workspace @venusprotocol/evm build --base=/venus/`.
- The hosting repo is `/Users/alvin/potodesign-webflow-mirror-try1`, remote `https://github.com/alvinjjjj/potodesign-site.git`. Cloudflare Pages deploys its `main` branch. On 2026-09-23, deployment used an isolated worktree at `/tmp/potodesign-venus-deploy` based on latest `origin/main` because the regular hosting checkout had unrelated changes. Check whether that temporary worktree still exists before using it.
- Publish only the `venus/` directory for Venus changes. Keep existing hashed assets available for cached pages. Do not overwrite `account/` or `venus-world/` as part of this UI work.
- After publication, verify the release marker, load the exact public route in a fresh browser context, and test the affected interaction in both relevant themes. A successful Git push alone is not live verification.

## Remaining checks

- Safari, full mobile/keyboard/reduced-motion review and real wallet/transaction workflows were not established by the latest release check. The prototype should not be treated as transaction-ready.
- Some older sections of `docs/V5-UI-HANDOFF.md` and `docs/CHANGELOG.md` describe earlier publication states. Use the dated supplements and this verified release section for current deployment status, and update older wording when maintaining those documents.
- If Alvin requests a further design change, inspect the current route and screenshots first, make the scoped change, then build and compare the production output before publishing.
