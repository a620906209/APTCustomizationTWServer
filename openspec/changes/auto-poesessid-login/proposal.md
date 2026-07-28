## Why

Today the user must manually retrieve their `POESESSID` by opening browser DevTools (F12 → Application → Cookies → `pathofexile.tw`) and pasting the value into the settings screen. This is a high-friction, technical step that confuses non-technical players and is a common source of "查價沒有資料" (no price data) support requests when the value is missing, stale, or mistyped. Electron already lets us open an embedded login window and read cookies from its session, so we can remove this manual step entirely for users who prefer it.

## What Changes

- Add a "登入" (Log in) button next to the existing POESESSID field in settings that opens an embedded `BrowserWindow` navigated to the `pathofexile.tw` login page.
- After the user completes login in that window, the main process reads the `POESESSID` cookie from the window's session (`session.cookies.get`), sends it back to the renderer over IPC, and the window closes automatically.
- The retrieved value populates the same `poesessid` config field used today, so `httpProxy.updatePoesessid` and all existing cookie-injection behavior are unchanged.
- The manual paste-a-value input SHALL remain visible and functional as a fallback (e.g., for users who already have the cookie, or if the embedded login window fails).
- Add a status indicator (success/failure/timeout) for the login attempt so the user isn't left staring at a closed window with no feedback.

## Capabilities

### New Capabilities
- `poesessid-auto-login`: Embedded-browser login flow that captures the `POESESSID` cookie from the user's own `pathofexile.tw` login session and writes it into app config, as an alternative to manual DevTools copy-paste.

### Modified Capabilities
- `tw-localization`: The "POESESSID Session Injection" requirement gains a scenario covering session values obtained via the new auto-login flow (in addition to the existing manually-entered value) — the injection behavior itself (Cookie header attachment) does not change.

## Impact

- **Main process**: `main/src/main.ts` (new IPC handler to launch/manage the login `BrowserWindow`), likely a new file (e.g. `main/src/PoesessidLogin.ts`) to keep the window/cookie logic isolated. No change to `proxy.ts` — it keeps reading `poesessid` from config exactly as today.
- **Shared types**: `ipc/types.ts` — new IPC message(s) for "start login" / "login result".
- **Renderer**: `renderer/src/web/settings/general.vue` — add login button, loading/success/error state; existing manual input and `configModelValue(... 'poesessid')` binding untouched.
- **Locale strings**: new i18n keys in `renderer/public/data/cmn-Hant/app_i18n.json` (and stub entries in `en`/`ko`/`ru` for consistency with existing key coverage).
- **No dependency changes**: uses Electron's built-in `BrowserWindow` and `session` APIs already available to the app.
