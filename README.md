# Venus UI Preview

Public design-review source for PM, design and frontend collaboration. Based on
[Venus Protocol Interface](https://github.com/VenusProtocol/venus-protocol-interface).
This is a modified prototype, not the official Venus application or a place to transact.
Demo login and the shared transaction hook simulate actions; other views may fetch public data.
Do not enter secrets, connect funded wallets, or treat displayed yields as offers.

## Review Links

- [Liquidity Hubs preview](https://hkcardcoll.hk/venus/#/liquidity-hubs?chainId=56)
- [Current UI specification](docs/V5-UI-HANDOFF.md)
- [Dated change index](docs/CHANGELOG.md)
- [Review workflow and acceptance checklist](docs/REVIEW.md)
- [Publication scope and provenance](docs/PUBLICATION.md)

The hosted preview is currently deployed separately. A commit here does NOT update it.
Deployment integration and Multica setup are subsequent steps, not enabled in this repository.

## Versions

Use the on-page Preview controller. O (original baseline) and V3 are comparison
references. V4 and V5 share the current treatments; V4 keeps rounded controls and
24px panels, V5 uses 8px corners. Internal V4 selector is `v6`.
Enable Change notes, then All change notes, for permanent IDs 1-25 and dates.
Never renumber existing review IDs.

## Local Setup

Prerequisites: Node 22.22+ and Corepack with Yarn 4.14.1 (see packageManager).

```sh
corepack enable
VENUS_SKIP_GENERATE_AFTER_INSTALL=1 yarn install --immutable
yarn workspace @venusprotocol/evm start --host 127.0.0.1 --port 5175
```

Open http://127.0.0.1:5175/#/liquidity-hubs?chainId=56.
The generated contract records and prebuilt chains package are included in this snapshot. Skipping
post-install generation avoids unnecessary live network/code-generation dependencies.
Do not run the upstream chains regeneration for UI-only changes: the original local
preview uses a prebuilt chain snapshot, and not all generator inputs are present.
No API key is required for the UI snapshot; some upstream data integrations are unavailable
without their own configuration. Optional variables are in `apps/evm/.env.example`.
Never commit a populated environment file; VITE-prefixed variables are browser-visible.

```sh
yarn workspace @venusprotocol/evm build --base=/venus/ --sourcemap=false
yarn workspace @venusprotocol/evm serve --base=/venus/ --port 5186
```

Preview the production build at http://127.0.0.1:5186/venus/.
Always check built CSS, especially backdrop filters and perimeter masks; dev-only checks
missed the September 18 mask regression.

## Contribution

Open an issue with a change ID, version, theme, route, screenshot and acceptance
criteria. Reference that issue in the PR. Design confirms appearance, PM confirms
scope and priority, frontend confirms implementation. See [review workflow](docs/REVIEW.md).
Do not modify O/V3 for V4/V5 requests without explicitly describing shared effects.

## License

The upstream MIT license and copyright are retained in [LICENSE](LICENSE).
Third-party dependencies keep their own licenses. Logos and trademarks do not imply
endorsement or grant trademark rights. This independent review snapshot is not an
official product release.
