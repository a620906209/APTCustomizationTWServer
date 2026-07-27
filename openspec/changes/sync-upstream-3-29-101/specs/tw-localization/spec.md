## ADDED Requirements

### Requirement: Traditional Chinese Item Text Parsing
The parser SHALL correctly recognize item text copied (Ctrl+C) from the Taiwan game client, which uses Traditional Chinese field labels instead of the international client's English labels.

The parser SHALL recognize the following field label mappings, tolerating one or more whitespace characters (`\s+`) around labels and values, and accepting both full-width（：）and half-width（:）colons:
- `Rarity:` → `稀有度:`
- `Item Level:` → `物品等級:` or `物品等級：`
- `Quality:` → `品質:`
- `Requirements:` → `需求:`
- `Sockets:` → `插槽:`

The parser SHALL determine an item's base type correctly for Traditional Chinese item names, which do not carry the `"Superior"` prefix present in the international client.

#### Scenario: Parsing a TW-client rare belt
- **WHEN** the parser receives the sample TW item text:
  ```
  稀有度: 傳奇
  獵首
  皮革腰帶
  --------
  需求:
  等級: 40
  --------
  物品等級: 75
  --------
  +40 最大生命
  --------
  +42 力量
  +47 敏捷
  +53 最大生命
  擊中稀有怪物增加 30% 傷害
  當你擊殺稀有怪物時，獲得它的詞綴 60 秒
  --------
  ```
- **THEN** the parser identifies rarity as Legendary/Rare-equivalent, base type as "皮革腰帶" (Leather Belt) without requiring a "Superior" prefix match, item level as 75, and extracts the listed modifier lines without error.

#### Scenario: Item level line uses full-width colon
- **WHEN** an item text contains `物品等級：75` (full-width colon)
- **THEN** the parser extracts item level 75 identically to the half-width form `物品等級: 75`.

### Requirement: Taiwan Server API Routing
All outbound trade/price-check/session API requests SHALL target `pathofexile.tw` instead of `pathofexile.com`.

#### Scenario: Trade search request
- **WHEN** the app performs a trade search or price check
- **THEN** the HTTP request is sent to a `pathofexile.tw` endpoint, not `pathofexile.com`.

### Requirement: POESESSID Session Injection
The app SHALL allow the user to supply a POESESSID value and SHALL attach it as a `Cookie` header (`POESESSID=<value>`) on requests that require authentication.

#### Scenario: Authenticated request with configured session
- **WHEN** the user has entered a POESESSID in settings and the app makes a request requiring authentication
- **THEN** the request includes a `Cookie: POESESSID=<value>` header.

### Requirement: Custom User-Agent for TW Requests
The app SHALL send a custom, non-default User-Agent string (e.g. `Awakened-PoE-Trade-Taiwan-Mod/1.0`) on requests to the TW server, to avoid being blocked by server-side filtering.

#### Scenario: Request to pathofexile.tw
- **WHEN** the app sends any request to a `pathofexile.tw` endpoint
- **THEN** the request's `User-Agent` header is the custom TW mod string, not the upstream default.

### Requirement: League and Stat Data Sync from TW Server
The app SHALL fetch league list, modifier ("stats"), and static item data from the TW server's API rather than the international server's.

Reference endpoints:
- Leagues: `https://pathofexile.tw/api/trade/data/leagues`
- Stats: `https://pathofexile.tw/api/trade/data/stats`
- Static: `https://pathofexile.tw/api/trade/data/static`

On startup, the app SHALL refresh its local stats data from the TW API. The default/preselected league SHALL be Standard.

#### Scenario: App startup data refresh
- **WHEN** the app starts
- **THEN** it requests league, stats, and static data from the `pathofexile.tw` endpoints and updates local data used for modifier matching.

#### Scenario: Default league selection
- **WHEN** no league has been previously selected by the user
- **THEN** the app defaults the selected league to Standard.

### Requirement: Traditional Chinese UI Text
User-facing log output and UI text SHALL be presented in Traditional Chinese wherever the fork provides a translation (`renderer/public/data/cmn-Hant/app_i18n.json`).

#### Scenario: Settings screen text
- **WHEN** a user opens a settings panel with an existing `cmn-Hant` translation entry
- **THEN** the panel renders the Traditional Chinese text rather than falling back to English.

### Requirement: New Upstream Content Is Translated, Not Left in English
When an upstream sync introduces new UI strings, item names/descriptions, or modifier ("stats") text that did not previously exist in the fork's `cmn-Hant` locale data, the sync SHALL include a Traditional Chinese translation of that new content before the sync is considered complete. Untranslated English placeholders SHALL NOT remain in `cmn-Hant` data files after a sync.

#### Scenario: Upstream adds a new UI string
- **WHEN** an upstream sync adds a new key to `en/app_i18n.json` that has no corresponding entry in `cmn-Hant/app_i18n.json`
- **THEN** the sync adds a Traditional Chinese translation for that key to `cmn-Hant/app_i18n.json`, not the raw English text.

#### Scenario: Upstream adds a new item or modifier
- **WHEN** an upstream sync adds new entries to `en/items.ndjson` or `en/stats.ndjson` with no `cmn-Hant` counterpart
- **THEN** the sync adds Traditional Chinese translations for those entries to `cmn-Hant/items.ndjson` / `stats.ndjson`.
