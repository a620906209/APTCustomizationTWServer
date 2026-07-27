## Why

The TW fork (APTCustomizationTWServer) is pinned to upstream `v3.28.103` while `awakened-poe-trade` has released `v3.29.101`. Staying behind means missing upstream bug fixes, parser/data updates, and build tooling improvements (the diff shows a likely yarn→npm migration and new build patches). Without a deliberate sync, the gap only grows and each future sync gets riskier. There is currently no documented, repeatable process for pulling upstream changes into this fork while preserving the TW customizations — this change establishes both the updated codebase and that process artifact (a formal spec of what "TW customized" means).

## What Changes

- Adopt upstream `v3.29.101` as the new base for all files the fork has **not** customized (bulk replace via `git checkout upstream/master -- <file>`), covering `.github/workflows/main.yml`, `.gitignore`, `docs/.vitepress/config.js`, and the new upstream files `DEVELOPING.md`, `main/build/app-builder-lib+26.8.1.patch`, `main/build/apprun-patch.test.mjs`.
- Reconcile the ~13 TW-customized source files (parser, network/config, UI, main-process, shared types — see Impact) by re-applying the TW customization logic on top of upstream's new version of each file, using `TWServer.md` as the behavioral spec.
- Merge locale data (`renderer/public/data/cmn-Hant/app_i18n.json`, `items.ndjson`, `stats.ndjson`, `patrons.json`, and the `en`/`ko`/`ru` ndjson files) so new upstream keys are picked up without discarding existing TW (`cmn-Hant`) translations.
- **BREAKING (build tooling)**: investigate and handle the apparent yarn→npm migration upstream (`main/yarn.lock` / `renderer/yarn.lock` removed, `main/package-lock.json` heavily changed, `main/package.json`/`tsconfig.json`/`electron-builder.yml` changed) and its compatibility impact on fork-only scripts (`scripts/setup.mjs`, `dev.mjs`, `package.mjs`, `main/build/script.mjs`) and the root `package.json`.
- Bump fork version metadata to track the new upstream base while keeping TW build identity (app name/id, `electron-builder.yml` branding) intact.
- Leave fork-only files untouched: `TWServer.md`, `scripts/setup.mjs`/`dev.mjs`/`package.mjs`, root `package.json` (unless required by the yarn→npm change above).
- Formalize `TWServer.md` into an OpenSpec capability spec (`tw-localization`) so future upstream syncs have a written acceptance baseline instead of relying on institutional memory.

## Capabilities

### New Capabilities
- `tw-localization`: The set of behavioral requirements that make this fork "the TW server build" — Traditional-Chinese item-text parsing (dictionary/regex rules), pathofexile.tw domain routing, POESESSID session injection, custom User-Agent, and league/stat data sourced from the TW server API. Derived from `TWServer.md`. Used going forward as the compliance check after any upstream sync.

### Modified Capabilities
(none — no pre-existing `openspec/specs/` capabilities in this project yet)

## Impact

- **Code**: `renderer/src/parser/{Parser.ts,magic-name.ts}`, `renderer/src/web/{Config.ts,background/IPC.ts,background/Leagues.ts}`, `renderer/src/web/item-check/WidgetItemCheck.vue`, `renderer/src/web/price-check/filters/{FilterModifier.vue,create-item-filters.ts}`, `renderer/src/web/settings/general.vue`, `main/src/{main.ts,proxy.ts,shortcuts/HostClipboard.ts,shortcuts/Shortcuts.ts}`, `ipc/types.ts`.
- **Data**: `renderer/public/data/cmn-Hant/*` (app_i18n.json, items.ndjson, stats.ndjson), `renderer/public/data/{en,ko,ru}/*.ndjson`, `renderer/public/data/patrons.json`.
- **Build/tooling**: `main/package.json`, `main/tsconfig.json`, `main/electron-builder.yml`, `main/package-lock.json`, lockfile strategy (yarn vs npm), `scripts/*.mjs`, `main/build/script.mjs`.
- **Docs**: `README.md` (keep TW version), `TWServer.md` (superseded by `openspec/specs/tw-localization/spec.md` as the living reference, but kept in place as human-readable onboarding doc).
- **No changes** to: fork-only dev scripts' external interface, TW server domain/session behavior (must be preserved, not altered).
