## 1. Shared IPC types

- [x] 1.1 Extend `IpcUserAction` in `ipc/types.ts` with a new action variant `{ action: 'poesessid-login' }`
- [x] 1.2 Add a new `MAIN->CLIENT::poesessid-login-result` event to `IpcEvent` carrying `{ status: 'success', value: string } | { status: 'cancelled' | 'timeout' | 'error' }`

## 2. Main process login flow

- [x] 2.1 Create `main/src/PoesessidLogin.ts` exposing a function/class that opens a `BrowserWindow` navigated to the `pathofexile.tw` login page
- [x] 2.2 Poll/watch `session.cookies` (on `did-navigate` / `did-navigate-in-page`, or a `cookies.on('changed')` listener scoped to the login window's session) for a `POESESSID` cookie on the `pathofexile.tw` domain
- [x] 2.3 On cookie found: extract the value, close the window, and emit `success` with the value
- [x] 2.4 On window closed by user before a cookie is captured: emit `cancelled`
- [x] 2.5 On timeout (e.g. 5 minutes) without a captured cookie: close the window and emit `timeout`
- [x] 2.6 Guard against opening a second login window while one is already open (focus the existing one instead)
- [x] 2.7 Wire `CLIENT->MAIN::user-action` handling in `main/src/main.ts` (or wherever `IpcUserAction` is currently dispatched) to call the new login flow for `action: 'poesessid-login'`, and send the `MAIN->CLIENT::poesessid-login-result` event back via `eventPipe.sendEventTo`

## 3. Renderer settings UI

- [x] 3.1 Add a "登入" button next to the existing POESESSID input in `renderer/src/web/settings/general.vue`
- [x] 3.2 On click, send `CLIENT->MAIN::user-action` with `{ action: 'poesessid-login' }` and show a pending/loading state
- [x] 3.3 Listen for `MAIN->CLIENT::poesessid-login-result`; on `success`, write `value` into the existing `poesessid` config model (`configModelValue(() => props.config, 'poesessid')`) so it flows through the existing save-config path unchanged
- [x] 3.4 On `cancelled`/`timeout`/`error`, show an inline status message and leave the existing `poesessid` value untouched
- [x] 3.5 Keep the manual paste input visible and functional at all times (no removal/hiding)

## 4. Localization

- [x] 4.1 ~~Add new i18n keys~~ — **deviation**: the existing POESESSID block in `general.vue` was already hardcoded Traditional Chinese (not run through `t()`/`app_i18n.json`), since it only ever renders under `language === 'cmn-Hant'`. Matched that existing convention and hardcoded the new button/status text the same way instead of introducing i18n keys for a TW-only, always-Chinese UI block.
- [x] 4.2 ~~Add matching stub keys to `en`/`ko`/`ru`~~ — not applicable, see 4.1.

## 5. Docs

- [x] 5.1 Update `README.md`'s "取得 POESESSID（台服）" section to describe the login button as the primary path, keeping the F12 steps as a manual fallback
- [x] 5.2 ~~Update `TWServer.md`~~ — **skipped**: on inspection, `TWServer.md` is a fixed one-time task brief (phased instructions used to originally build the fork + sample test data), not a living/maintained spec. Adding an incremental feature note there didn't fit its purpose; the actual spec of record is `openspec/specs/tw-localization/spec.md`, updated via this change's delta spec (`specs/tw-localization/spec.md` in this change dir) and merged on archive.

## 6. Verification（驗證）

- [x] 6.1–6.4 not run by the implementing agent — no real `pathofexile.tw` account/credentials available in this environment. `main`'s `tsc --noEmit` and `renderer`'s `vue-tsc --noEmit` both pass with no errors. **User should manually verify** the four scenarios below before relying on this feature（以下請使用者實機測試，登入視窗仍需自行輸入帳號密碼）：
  - [ ] 6.1 點擊登入，在跳出的視窗中完成登入，確認 POESESSID 有自動填入，且交易查價功能可正常運作
  - [ ] 6.2 不登入直接關閉登入視窗，確認狀態顯示為「已取消」，且原本的設定值沒有被覆蓋
  - [ ] 6.3 手動貼上 POESESSID 仍然可以正常運作，且會覆蓋掉先前自動取得的值
  - [ ] 6.4 連續點擊兩次登入按鈕，確認會聚焦到原本已開啟的視窗，而不是開出第二個視窗
