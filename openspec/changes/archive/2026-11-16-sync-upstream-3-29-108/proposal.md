## Why

Fork was pinned to upstream v3.29.101; upstream released v3.29.108.

## What Changes

- Adopt upstream v3.29.108 for all non-customized files (63 source files, locale data, new files such as `vite-plugin-make-indexes.ts`, `expected-value/`, `FilterGroup.vue`).
- Three-way merge (base = upstream v3.29.101 git HEAD, theirs = v3.29.108 working tree, ours = fork) for TW-customized files: `Leagues.ts`, `proxy.ts`, `Config.ts`, `main/package.json` (version -> 3.29.108). TW logic (pathofexile.tw, POESESSID, User-Agent, 標準模式 default league) preserved.
- `scripts/setup.mjs`: removed the obsolete `make-index-files` step (upstream replaced it with a vite plugin).

## Verification

- `vue-tsc --noEmit` (renderer) and `tsc --noEmit` (main) pass.
- Not done: in-app run and TWServer.md sample-item parse check.

## Capabilities

No spec changes; `tw-localization` requirements unchanged.
