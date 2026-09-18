# Public Snapshot Scope

Prepared 2026-09-18 from the working Venus UI preview. This is a new source snapshot,
not a fork carrying the full local Git history. The upstream MIT notice is preserved.

Included: apps/evm UI, shared packages/configs, generated contract/chain records,
design assets, dependency lockfile, version selector, dated notes and handoff.
The prebuilt `packages/chains/build` is an intentional exception to the build-output
exclusion: the working preview depends on that snapshot and lacks some generator inputs.

Excluded: private account-preview page and its route, PDF account assets, populated
environment files, original Git history, old deployment copies/watchers, local agent
configuration, upstream CI credentials/workflows, dependencies and build output.
Only the public copy removes the account-preview route; the working demo is untouched.

The deployed site remains managed by the existing deployment repository. This public
repository has no deployment hook yet. No existing live URL is changed by this task.

## Security Review

Gitleaks scanning of the staged source produced 890 generic-key findings: 881
40-character EVM addresses and 9 test fixture identifiers. All were classified;
none remained unexplained. Populated env files and private account code are absent
from the staged file list. A scan is not a guarantee of absence of secrets.
Never put secrets in VITE variables: their values are exposed to the browser bundle.

## Verification

Public-copy production build passed. Playwright with installed Chrome (Browser plugin
not available) checked Liquidity Hubs at 1440x1000: V5 dark, then V4 light; three hub
rows rendered, version/theme controls worked, and no page exceptions were recorded.
Default preview environment intentionally displays the upstream testing warning banner.
Full cross-browser, mobile, animation and transaction acceptance remain separate checks.

A clean staged-source copy installed successfully using Yarn 4.14.1 with the immutable
lockfile and VENUS_SKIP_GENERATE_AFTER_INSTALL=1 on Node 25.9.0. Existing peer warnings
remain. Optional node-libcurl native compilation failed, but installation exited 0;
this dependency is not required for the Vite UI build. Recommended Node baseline is 22.22+.
The clean-copy production build also passed (12.36 seconds), without sharing the
original working project's node_modules or populated environment files.
