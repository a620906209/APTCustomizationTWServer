## Context

The fork has no shared git history with upstream (both were freshly `git init`'d from extracted snapshots), so a normal three-way `git merge`/rebase cannot resolve the customized files automatically — there is no common ancestor to diff against. `git diff HEAD upstream/master --stat` (two-dot diff, doesn't require ancestry) enumerates 42 changed paths, which is the authoritative work list for this change.

Two categories of file exist:
1. **Not TW-customized** — safe to take upstream's version wholesale.
2. **TW-customized** (~13 source files + locale data, see `openspec/config.yaml` context) — upstream's new content must be reconciled *by hand*, guided by `TWServer.md`, because there is no automated way to separate "upstream's changes since fork point" from "TW's changes since fork point" without the original fork-point snapshot (which doesn't exist).

Investigation of the actual diffs surfaced one additional cross-cutting issue not visible from the file list alone: **upstream's `main/` package appears to have moved off yarn**. `main/yarn.lock` is deleted, `main/package-lock.json` changed extensively, `main/package.json` gained a `postinstall: patch-package --patch-dir build` script + `patch-package` devDependency + `allowScripts.electron: true`, and `.github/workflows/main.yml` now runs `npm ci` / `npm run ...` instead of yarn. Meanwhile the fork's own dev tooling (`scripts/setup.mjs`, `dev.mjs`, `package.mjs`) hard-codes `yarn` (`spawn('yarn', ...)`, `yarn.cmd`, `npm install -g yarn` bootstrap, `yarn -v` version check). `renderer/` was already on npm in both versions (`renderer/package.json` has zero diff; only its stale `yarn.lock` was deleted upstream) — the migration is `main/`-specific.

## Goals / Non-Goals

**Goals:**
- Bring the fork's codebase to parity with upstream `v3.29.101` for every non-customized file.
- Preserve all TW-customized behavior (parser dictionary, `pathofexile.tw` routing, POESESSID injection, custom User-Agent, league/stat sync) on top of the new upstream code.
- Keep the fork's own dev workflow (`npm run setup` / `dev` / `package` at repo root) working after the sync.
- Produce `openspec/specs/tw-localization/spec.md` as a durable, checkable definition of "TW customized," derived from `TWServer.md`, for future syncs.

**Non-Goals:**
- Not attempting to fabricate a synthetic shared git history or force a `git merge` — two-dot diff + manual reconciliation is the accepted approach for this sync (and likely future ones, given no upstream fork relationship exists).
- Not switching `renderer/`'s package manager — it's unaffected by the yarn→npm signal.
- Not chasing every upstream dependency bump blindly if it doesn't affect TW-customized files (e.g., unrelated devDependency version bumps are accepted as-is via the wholesale-adopt path).

## Decisions

1. **Two-tier file handling.** Files absent from the TW-customized list (`openspec/config.yaml` context) are copied wholesale from `upstream/master` via `git checkout upstream/master -- <path>`. Files present on that list are opened side-by-side (fork version vs. `upstream/master` version) and the TW-specific logic is manually re-applied to the new upstream structure. Rationale: the customized set is small and well-known; blanket-copying everything would silently delete TW logic, while manually diffing all 42 files would be needless overhead for files nobody touched.

2. **`main/` package manager: follow upstream to npm.** Adopt `main/package-lock.json`, the new `postinstall`/`patch-package`/`allowScripts` config from upstream `main/package.json`, and delete `main/yarn.lock`. Update the fork's own `scripts/setup.mjs`, `dev.mjs`, `package.mjs` to invoke `npm` instead of `yarn` for the `main/` workspace specifically. *Alternative considered*: keep `main/` on yarn by re-adding a yarn.lock and ignoring upstream's package-lock.json — rejected, because upstream's new `main/build/app-builder-lib+26.8.1.patch` is applied via `patch-package`, which expects npm's install semantics; fighting that indefinitely would mean re-deriving every future upstream `main/` dependency bump by hand.

3. **Locale data merge is additive, not overwrite.** For `cmn-Hant/app_i18n.json`, `items.ndjson`, `stats.ndjson`: diff upstream's key set against the fork's, add any new keys (translated to Traditional Chinese where the key is UI copy; carried from upstream's `en` value as a placeholder if a human translation isn't available yet, flagged in tasks.md), but never let an upstream key overwrite an existing TW translation for a key that already exists in `cmn-Hant`. `en`/`ko`/`ru` ndjson files are not TW-customized — adopt wholesale. `patrons.json` is data-only (no TW customization) — adopt wholesale.

4. **`TWServer.md` stays; `tw-localization` spec is the new machine-checkable counterpart.** Rather than replacing `TWServer.md` (it's useful prose onboarding for humans/AI), this change adds `openspec/specs/tw-localization/spec.md` with structured requirements (derived from the same content) that future sync changes can diff against via OpenSpec's delta-spec mechanism, instead of re-deriving "was this intentional?" from scratch each time.

5. **Version metadata.** Bump `main/package.json` version to `3.29.101`-based (matching upstream numbering) while keeping `main/electron-builder.yml` product name/appId/branding as the existing TW identity — confirmed unchanged by this sync (electron-builder.yml diff is dependency-version-only, not branding).

## Risks / Trade-offs

- **[Risk] Manual reconciliation of the ~13 customized files can silently drop upstream fixes or TW logic.** → Mitigation: each file gets its own task in `tasks.md` with an explicit checklist item to diff against `upstream/master`; verification step re-runs the `TWServer.md` sample item text through the parser and re-checks POESESSID/domain/User-Agent behavior end-to-end (see proposal Impact / tasks.md).
- **[Risk] yarn→npm switch for `main/` breaks local dev environments that still have `yarn` global installs or stale `node_modules`.** → Mitigation: `scripts/setup.mjs` bootstrap logic is updated in the same change (not left half-migrated); task list includes a clean-install verification (`npm run setup` from scratch).
- **[Risk] `patch-package` patch (`app-builder-lib+26.8.1.patch`) may conflict with any fork-specific build patches under `main/build/`.** → Mitigation: `main/build/script.mjs` and existing patch files are inspected during the build/version-bump task before assuming a clean adopt.
- **[Trade-off] No automated 3-way merge means this process doesn't scale well to very frequent upstream syncs.** Accepted for now since customization is small and stable; if upstream cadence increases, a follow-up change should consider re-forking with real git ancestry (e.g., `git clone` upstream + reapply TW commits) instead of snapshot diffing.

## Migration Plan

1. Bulk-adopt non-customized files from `upstream/master` (single commit).
2. Reconcile customized source files one module at a time (parser → network/auth → UI/settings → main process → shared types), each as its own commit for auditability.
3. Merge locale data.
4. Handle `main/` yarn→npm migration and version bump.
5. Update docs (`README.md` stays TW; add `openspec/specs/tw-localization/spec.md`).
6. Verify (build, parser sample text, POESESSID/domain/UA/league sync smoke test).
7. Archive the change; the resulting `openspec/specs/tw-localization/spec.md` becomes the baseline for the *next* sync.

No production rollback concerns — this is a source-tree sync in a desktop app repo; if something regresses post-sync, revert the sync commits (they're isolated per step above) rather than a live-system rollback.

## Open Questions

- Should `renderer`/`ko`/`ru`/`en` locale data really be adopted wholesale, or does the fork ever divert from upstream for non-`cmn-Hant` locales? (Assumed no divergence based on Explore findings; confirm during the locale-data task.)
- Is there a target date/version cadence for future syncs, or is this a one-off? Affects whether the `tw-localization` spec/process investment pays off — proceeding on the assumption it will be reused.
