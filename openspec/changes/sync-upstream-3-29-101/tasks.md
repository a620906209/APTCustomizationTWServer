## 1. Bulk-adopt non-customized files

- [x] 1.1 `git checkout upstream/master -- .github/workflows/main.yml .gitignore docs/.vitepress/config.js`
- [x] 1.2 Add new upstream files: `DEVELOPING.md`, `main/build/app-builder-lib+26.8.1.patch`, `main/build/apprun-patch.test.mjs` (`git checkout upstream/master -- <path>`)
- [x] 1.3 Confirm no other files outside the customized list (§ config.yaml context) were missed by re-running `git diff HEAD upstream/master --stat` and cross-checking against the customized-file list
- [x] 1.4 Commit as "Bulk-adopt non-customized upstream files (v3.29.101)"

## 2. Parser localization (Parser.ts, magic-name.ts)

- [x] 2.1 Diff `renderer/src/parser/Parser.ts` (fork vs `upstream/master`) and identify upstream's functional changes independent of TW logic
- [x] 2.2 ~~Re-apply TW regex/dictionary rules~~ — **Finding**: no literal TW regex/dictionary logic exists in `Parser.ts`. The field-label/regex mappings (`稀有度:`, `物品等級:`, `品質:`, `插槽:`, Superior-prefix handling) live entirely in `renderer/public/data/cmn-Hant/client_strings.js`, which is byte-identical to upstream's stock `cmn-Hant` locale data (never TW-customized). The fork's only prior Parser.ts difference was an `ITEM_BY_REF`→`ITEM_BY_TRANSLATED` fix needed for translated-text matching, which upstream v3.29.101 generalized for all locales — fully subsuming it. Adopted upstream wholesale.
- [x] 2.3 Same finding for `renderer/src/parser/magic-name.ts` — adopted upstream wholesale
- [x] 2.4 Verified field-label mappings still present in `cmn-Hant/client_strings.js` (`RARITY: '稀有度: '`, `ITEM_LEVEL: '物品等級: '`, `QUALITY: '品質: '`, `SOCKETS: '插槽: '`) — parsing behavior for the sample TW item text is unaffected by this change
- [x] 2.5 Commit as "Reconcile parser localization with upstream v3.29.101"

## 3. Network / auth (Config.ts, IPC.ts, Leagues.ts)

- [x] 3.1 Diff `renderer/src/web/Config.ts`, `background/IPC.ts`, `background/Leagues.ts` against `upstream/master`
- [x] 3.2 **Decision (user-confirmed)**: kept POESESSID cookie injection + custom User-Agent logic as-is, did NOT adopt upstream's removal of it (upstream replaced it with `useSessionCookies`-only auth, but `pathofexile.tw` is modeled as a separate `pc-garena` realm and it's unverified whether upstream's built-in-browser session-cookie login actually works for that realm — kept the working mechanism rather than risk breaking TW auth). Custom User-Agent confirmed not causing blocking issues in practice, kept as-is. Also merged unrelated upstream fixes: Korean domain rename (`poe.game.daum.net`→`poe.kakaogames.com`) in `Config.ts`/`proxy.ts`, ws/wss protocol fix in `IPC.ts`. `pathofexile.tw` domain routing itself was already identical to upstream (upstream has it as an official proxy host too) — nothing to reconcile there.
- [x] 3.3 `Leagues.ts` TW league/stats sync branch (`isTwGarena`, TW trade-data-leagues endpoint, default league = 標準模式) had zero unrelated upstream changes to merge — left untouched
- [x] 3.4 Commit as "Reconcile network/auth localization with upstream v3.29.101" (includes `main/src/proxy.ts`, originally slated under §5 — done here since it's part of the same POESESSID/UA decision)

## 4. UI / settings

- [x] 4.1 `WidgetItemCheck.vue` — no TW content found; adopted upstream wholesale (stat matcher text update)
- [x] 4.2 `FilterModifier.vue` — no TW content found; adopted upstream wholesale (CSS overflow fixes)
- [x] 4.3 `create-item-filters.ts` — no TW content found; adopted upstream wholesale (whiteSockets filter removal)
- [x] 4.4 `general.vue` — no change needed; POESESSID field kept per §3.2 decision
- [x] 4.5 Commit as "Reconcile UI/settings localization with upstream v3.29.101"

## 5. Main process

- [x] 5.1 `main.ts` — no change needed; already correct (keeps `httpProxy.updatePoesessid()` call per §3.2 decision)
- [x] 5.2 `proxy.ts` — handled in §3 commit (POESESSID/UA logic kept, Korean domain rename merged)
- [x] 5.3 `HostClipboard.ts`, `Shortcuts.ts` — no TW content found; adopted upstream wholesale
- [x] 5.4 Commit as "Reconcile main-process localization with upstream v3.29.101"

## 6. Shared types

- [x] 6.1 Diffed `ipc/types.ts` — the 1 line upstream removed (`poesessid: string`) is exactly the TW-added field being kept per §3.2 decision; no other upstream changes to this file
- [x] 6.2 No commit needed — file already correct, no changes required

## 7. Locale data merge

- [x] 7.1 Diffed `cmn-Hant/app_i18n.json` vs upstream's `en/app_i18n.json` — `en/app_i18n.json` is byte-identical between fork and upstream (0 new keys this sync), so no new translation was needed. Left `cmn-Hant/app_i18n.json` untouched (already 338 keys, fully covering en's 312 keys — verified programmatically, 0 missing).
- [x] 7.2 **Revised finding**: `items.ndjson`/`stats.ndjson` are official PoE game-data extracts, not hand-authored fork translations — `cmn-Hant` icon URLs already point at `webtw.poecdn.com` (official Taiwan CDN) natively in upstream. Upstream already ships complete official Traditional Chinese translations for all new v3.29.101 content. Adopted wholesale instead of manual translation (see commit message for full reasoning).
- [x] 7.3 Adopted `renderer/public/data/{en,ko,ru}/items.ndjson`, `{en,ko,ru}/stats.ndjson`, and `patrons.json` wholesale from `upstream/master`
- [x] 7.4 Spot-check via script: 0 of 312 `en/app_i18n.json` keys missing from `cmn-Hant/app_i18n.json`. `items.ndjson`/`stats.ndjson` adopted wholesale from upstream's own complete cmn-Hant data, so no gaps possible.
- [x] 7.5 Commit as "Merge locale data with upstream v3.29.101"

## 8. Build tooling: main/ yarn → npm migration

- [x] 8.1 Adopted `main/package-lock.json`, deleted `main/yarn.lock`, adopted upstream's `main/package.json`, `main/tsconfig.json`, `main/electron-builder.yml` — confirmed no TW branding/appId present to protect
- [x] 8.2 Updated `scripts/setup.mjs`: removed the `yarn -v`/`npm install -g yarn` check entirely (npm ships bundled with Node, no separate check needed), changed install loop to `spawnSync('npm', ['install'], ...)`
- [x] 8.3 **Correction**: `renderer/` was NOT already npm-only as originally assumed — `scripts/dev.mjs` was spawning `yarn dev` for *both* `main/` and `renderer/`. Updated both to `spawn('npm', ['run', 'dev'], ...)`. Also deleted `renderer/yarn.lock` (stale; `renderer/package-lock.json` already existed and is upstream's authoritative one, confirmed via CI using `npm ci` for renderer too)
- [x] 8.4 Updated `scripts/package.mjs` (`yarn.cmd`/`yarn` → `npm.cmd`/`npm`, `['package']` → `['run', 'package']`)
- [x] 8.5 Inspected `main/build/script.mjs` — no yarn references found, no change needed
- [x] 8.6 Clean-install verification: ran `npm run setup` from repo root (no pre-existing `node_modules`) — completed successfully for main (incl. new `postinstall` patch-package step), renderer, and docs, plus `make-index-files` generation. Reverted the locally-regenerated `main/package-lock.json` back to upstream's exact committed version afterward (keep the reproducible/authoritative lockfile, not a local npm-version-dependent regeneration). Left `docs/package-lock.json` untracked (upstream doesn't commit one either).
- [x] 8.7 Commit as "Migrate main/ package management from yarn to npm (upstream v3.29.101)"

## 9. Version metadata

- [x] 9.1 Confirmed `main/package.json` version is `3.29.101` (already adopted wholesale in §8). `main/electron-builder.yml` has no TW-specific branding/appId to preserve (`productName: "Awakened PoE Trade"` is generic, unchanged) — nothing to protect there.
- [x] 9.2 No separate commit needed — version bump already included in the §8 commit (`main/package.json` was adopted wholesale as part of the yarn→npm migration)

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
