# Team Review

Start with Liquidity Hubs. Keep one issue per change and link its PR and preview.
Suggested states: Discussion -> Approved -> In progress -> Review -> Done.
These states describe the workflow; no external project board is configured yet.

## Responsibilities

- Design: intended appearance, motion and dark/light behavior.
- PM: scope, priority and acceptance criteria.
- Frontend: implementation, accessibility, performance and integration.
- An assistant may prepare changes and evidence; human review approves integration.

## Required Issue Context

Change ID, version, theme, route, viewport/browser, screenshot, actual behavior,
expected behavior, acceptance criteria and owner. Link an existing ID instead of
creating a duplicate topic. Include animation duration, delay, easing and trigger.
Do not post customer data, private keys, environment files or internal credentials.

## Acceptance Checklist

- [ ] Correct route and version; O/V3 preserved where requested.
- [ ] V4/V5 dark and light checked.
- [ ] Desktop and mobile fit without text overlap or horizontal overflow.
- [ ] Pointer hover, keyboard focus, Escape and repeat opening checked.
- [ ] Reduced-motion preference respected.
- [ ] Dropdown blur works from the first frame, without backdrop jump.
- [ ] Tooltip does not bounce; icons animate only on intended triggers.
- [ ] Production build checked, not just Vite development mode.
- [ ] No new console exceptions or failed required assets.
- [ ] Screenshots and exact commit included; spec/changelog updated.
- [ ] Design, PM and frontend acceptance recorded before integration.

## Current Verification Limits

Previous production hotfix checks covered V4/V5 home and Markets in desktop Chrome.
Those checks do not establish full Safari/mobile/keyboard/transaction coverage.
The chart's selected-month/tooltip consistency needs a dedicated follow-up review.
No financial correctness or live transaction safety certification is implied.
See PUBLICATION.md for checks performed specifically on the public snapshot.

## Multica (Later Step)

Create a team project, link this repository and preview, then copy the issue context
and acceptance criteria. Do not enable autonomous publishing by default. This repo
does not automatically sync the current chat or any external task system.
