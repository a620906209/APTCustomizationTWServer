## 1. Bulk-adopt non-customized files

- [ ] 1.1 `git checkout upstream/master -- .github/workflows/main.yml .gitignore docs/.vitepress/config.js`
- [ ] 1.2 Add new upstream files: `DEVELOPING.md`, `main/build/app-builder-lib+26.8.1.patch`, `main/build/apprun-patch.test.mjs` (`git checkout upstream/master -- <path>`)
- [ ] 1.3 Confirm no other files outside the customized list (§ config.yaml context) were missed by re-running `git diff HEAD upstream/master --stat` and cross-checking against the customized-file list
- [ ] 1.4 Commit as "Bulk-adopt non-customized upstream files (v3.29.101)"

## 2. Parser localization (Parser.ts, magic-name.ts)

- [ ] 2.1 Diff `renderer/src/parser/Parser.ts` (fork vs `upstream/master`) and identify upstream's functional changes independent of TW logic
- [ ] 2.2 Re-apply TW regex/dictionary rules (`稀有度:`, `物品等級:`/`物品等級：`, `品質:`, `需求:`, `插槽:`, `\s+`-tolerant matching, no-"Superior"-prefix base type logic — per `specs/tw-localization/spec.md`) onto the new upstream file structure
- [ ] 2.3 Same reconciliation for `renderer/src/parser/magic-name.ts`
- [ ] 2.4 Manually verify against the sample TW item text in `specs/tw-localization/spec.md` (獵首 / 皮革腰帶 example)
- [ ] 2.5 Commit as "Reconcile parser localization with upstream v3.29.101"

## 3. Network / auth (Config.ts, IPC.ts, Leagues.ts)

- [ ] 3.1 Diff `renderer/src/web/Config.ts`, `background/IPC.ts`, `background/Leagues.ts` against `upstream/master`
- [ ] 3.2 Re-apply `pathofexile.tw` domain routing, POESESSID cookie injection, and custom User-Agent logic on top of upstream's changes
- [ ] 3.3 Re-apply league/stats sync behavior (TW API endpoints, default league = Standard) in `Leagues.ts`
- [ ] 3.4 Commit as "Reconcile network/auth localization with upstream v3.29.101"

## 4. UI / settings

- [ ] 4.1 Diff and reconcile `renderer/src/web/item-check/WidgetItemCheck.vue`
- [ ] 4.2 Diff and reconcile `renderer/src/web/price-check/filters/FilterModifier.vue`
- [ ] 4.3 Diff and reconcile `renderer/src/web/price-check/filters/create-item-filters.ts`
- [ ] 4.4 Diff and reconcile `renderer/src/web/settings/general.vue` (POESESSID field, TW server picker)
- [ ] 4.5 Commit as "Reconcile UI/settings localization with upstream v3.29.101"

## 5. Main process

- [ ] 5.1 Diff and reconcile `main/src/main.ts`
- [ ] 5.2 Diff and reconcile `main/src/proxy.ts`
- [ ] 5.3 Diff and reconcile `main/src/shortcuts/HostClipboard.ts` and `main/src/shortcuts/Shortcuts.ts`
- [ ] 5.4 Commit as "Reconcile main-process localization with upstream v3.29.101"

## 6. Shared types

- [ ] 6.1 Diff and reconcile `ipc/types.ts` (note: upstream removed 1 line — confirm it isn't a TW-added field before dropping it)
- [ ] 6.2 Commit as "Reconcile ipc/types.ts with upstream v3.29.101"

## 7. Locale data merge

- [ ] 7.1 Diff `renderer/public/data/cmn-Hant/app_i18n.json` keys against upstream's `en/app_i18n.json`; for every new key upstream introduced, write a real Traditional Chinese translation (translate from the `en` source text — no English left as a placeholder) and merge it in; do not overwrite existing `cmn-Hant` values
- [ ] 7.2 Same additive-merge-with-translation process for `renderer/public/data/cmn-Hant/items.ndjson` and `stats.ndjson` (translate any new item/stat names and descriptions into Traditional Chinese)
- [ ] 7.3 Adopt `renderer/public/data/{en,ko,ru}/items.ndjson`, `{en,ko,ru}/stats.ndjson`, and `patrons.json` wholesale from `upstream/master` (not TW-customized, left in their original language)
- [ ] 7.4 Spot-check: confirm no untranslated English strings remain in `cmn-Hant/app_i18n.json`, `items.ndjson`, or `stats.ndjson` after the merge
- [ ] 7.5 Commit as "Merge locale data with upstream v3.29.101 (incl. new-content translation)"

## 8. Build tooling: main/ yarn → npm migration

- [ ] 8.1 Adopt `main/package-lock.json`, delete `main/yarn.lock`, adopt upstream's `main/package.json` (`postinstall`/`patch-package`/`allowScripts` additions + dependency bumps), `main/tsconfig.json`, `main/electron-builder.yml` (verify TW branding/appId untouched)
- [ ] 8.2 Update `scripts/setup.mjs` to bootstrap/install `main/` via `npm` instead of `yarn` (replace `yarn -v` check, `npm install -g yarn` fallback, `spawnSync('yarn', ['install'], ...)`)
- [ ] 8.3 Update `scripts/dev.mjs` to spawn `npm run dev` instead of `yarn dev` for the `main/` process (verify `renderer/` side, already npm-based, is unaffected)
- [ ] 8.4 Update `scripts/package.mjs` (`yarn.cmd`/`yarn` invocation) to use `npm`
- [ ] 8.5 Inspect `main/build/script.mjs` for any yarn-specific assumptions and adjust if needed
- [ ] 8.6 Clean-install verification: remove `main/node_modules`, run `npm run setup` from repo root, confirm it completes without yarn
- [ ] 8.7 Commit as "Migrate main/ package management from yarn to npm (upstream v3.29.101)"

## 9. Version metadata

- [ ] 9.1 Confirm `main/package.json` version reflects the new upstream base (`3.29.101`-derived) while `main/electron-builder.yml` product identity remains TW-branded
- [ ] 9.2 Commit as "Bump version metadata to v3.29.101 base"

## 10. Verification

- [ ] 10.1 `npm run setup` completes cleanly from a fresh checkout
- [ ] 10.2 `npm run dev` starts the app without errors
- [ ] 10.3 Parse the `specs/tw-localization/spec.md` sample item text and confirm correct rarity/base-type/item-level/mods extraction
- [ ] 10.4 Confirm requests target `pathofexile.tw` (not `.com`) — inspect network calls during a price check
- [ ] 10.5 Confirm POESESSID cookie header and custom User-Agent are present on authenticated requests
- [ ] 10.6 Confirm league list/default (Standard) and stats sync populate correctly from the TW API on startup
- [ ] 10.7 Confirm Traditional Chinese UI strings render correctly (spot-check settings screen)
- [ ] 10.7a Confirm no untranslated English strings remain for newly-synced content (new items/mods/UI text introduced by v3.29.101) — cross-check against task 7.4
- [ ] 10.8 Full `git diff` review of the final state against the pre-sync baseline commit to confirm no unintended regressions

## 11. Archive

- [ ] 11.1 Run `/opsx:archive` (or `openspec archive`) for `sync-upstream-3-29-101`, promoting `specs/tw-localization/spec.md` into `openspec/specs/tw-localization/spec.md` as the baseline for the next upstream sync
