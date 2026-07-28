## Context

`POESESSID` today is a plain string in `HostConfig` (`ipc/types.ts:11`), entered by the user in `general.vue` and pushed to the main process via the existing `CLIENT->MAIN::update-host-config` event. `HttpProxy.updatePoesessid` (`main/src/proxy.ts`) stores that string and manually sets `Cookie: POESESSID=<value>` on outbound `pathofexile.tw` requests. **The proxy never reads Electron's cookie jar** — it only knows the string it was handed. This decoupling is important: whatever mechanism captures the cookie just needs to produce a string and feed it through the same config path; it does not need to change `proxy.ts` at all.

The app's IPC is not Electron's `ipcMain`/`ipcRenderer` — it's a custom WebSocket event pipe (`main/src/server.ts`) typed by `IpcEvent` in `ipc/types.ts`. The renderer is a normal web page (Vue3) loaded either in the overlay `BrowserWindow` or a plain browser tab, talking to the local WebSocket server. Any new interaction between renderer and main must be a new `IpcEvent` variant, not a direct Electron API call from the renderer.

`OverlayWindow` (`main/src/windowing/OverlayWindow.ts`) shows the existing pattern for constructing a `BrowserWindow`: default (no custom partition) `session`, `webviewTag`/`spellcheck` prefs, devtools menu entry. No existing code creates a second, disposable `BrowserWindow` — this will be the first.

## Goals / Non-Goals

**Goals:**
- Let the user obtain a valid `POESESSID` by logging in through an embedded window, without touching DevTools.
- Reuse the existing `poesessid` config field and injection path unchanged (`proxy.ts` stays untouched).
- Give the renderer clear success/failure/timeout feedback for the login attempt.
- Keep the manual paste field fully functional as a fallback.

**Non-Goals:**
- Do not persist or expose the raw Electron cookie jar to the renderer — only the extracted `POESESSID` string crosses the IPC boundary.
- Do not attempt to handle CAPTCHA/2FA flows specially — the user completes whatever `pathofexile.tw`'s login page requires inside the embedded window, same as they would in a normal browser.
- Do not change the trade-request injection mechanism in `proxy.ts`.
- Not building a general-purpose "webview login" framework for other sites — this is specific to `pathofexile.tw`.

## Decisions

**1. New disposable `BrowserWindow` per login attempt, created in main process, closed automatically on success/cancel.**
Alternative considered: reuse the overlay window's `webviewTag` to embed the login page inside the existing settings UI. Rejected because the overlay window's `webContents` already hosts the app's own renderer; embedding a cross-origin login page as a `<webview>` inside it is harder to sandbox cleanly and to guarantee closes/cleans up than a dedicated top-level `BrowserWindow` the main process fully owns.

**2. Cookie captured via `session.cookies.get({ domain: 'pathofexile.tw', name: 'POESESSID' })` polled on `did-navigate` / `did-navigate-in-page`, not by reading `document.cookie` inside the page.**
`POESESSID` is (like most PoE session cookies) `HttpOnly`, so `document.cookie` in the page's own JS context cannot see it — only Electron's `session.cookies` API (main-process-side) can. This also avoids injecting any script into a third-party login page.

**3. New `HostConfig`-independent IPC events, not a new `HostConfig` field.**
Add `CLIENT->MAIN::user-action` variant `{ action: 'poesessid-login' }` (extends the existing `IpcUserAction` union used for `stash-search`, `check-for-update`, etc.) to start the flow, and a new `MAIN->CLIENT::poesessid-login-result` event carrying `{ status: 'success', value: string } | { status: 'cancelled' | 'timeout' | 'error' }` to report the outcome. The renderer then writes `value` into the same `poesessid` config field used by the manual input and lets the existing `save-config` / `update-host-config` path push it to `HttpProxy` — no change to how the proxy receives the value.

**4. Default (shared) Electron session, not an isolated partition.**
Alternative: a fresh `partition: 'poesessid-login'` session so the login window can't see/leave other app cookies. Rejected for v1 — the app has no other `pathofexile.tw` cookie usage to isolate from, and a fresh partition would force the user to log in every single time (no persisted session), defeating some of the convenience. Revisit if the app later adds other cross-site embedded content.

**5. Timeout, not indefinite wait.**
The login window auto-fails with `status: 'timeout'` if no `POESESSID` cookie appears within a bounded window (e.g. 5 minutes) after the window is closed by the user, or if the user closes the window manually before completing login — reported as `status: 'cancelled'`.

## Risks / Trade-offs

- **[Risk]** `pathofexile.tw`'s login page markup/flow changes and breaks navigation detection → **Mitigation**: detection only depends on the `POESESSID` cookie appearing for the `pathofexile.tw` domain, not on page structure/selectors, so it's resilient to most front-end changes on Hotcool's side.
- **[Risk]** User closes the login window without logging in, main process left waiting → **Mitigation**: `window.on('closed', ...)` always resolves the flow with `cancelled` if no cookie was captured first.
- **[Risk]** Shared (non-isolated) session means the login window also carries any other cookies/state the app's `defaultSession` has → **Mitigation**: acceptable since the app has no other embedded browsing surface today (see Decision 4); documented as a revisit item if that changes.
- **[Trade-off]** This only covers `pathofexile.tw` (Hotcool/TW realm), matching the existing scope of the `poesessid` feature — no equivalent flow is added for `pathofexile.com`, since upstream doesn't use `POESESSID` at all (confirmed: no references in `awakened-poe-trade-master`).

## Open Questions

- Exact login URL to navigate to (`pathofexile.tw` root vs. a dedicated `/login` path) — to confirm against the live site during implementation.
- Whether to show the embedded window's own devtools/menu (like `OverlayWindow` does) or lock it down to a bare window for a cleaner "login" feel.
