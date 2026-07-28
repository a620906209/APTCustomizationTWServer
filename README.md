# Awakened PoE Trade — 台灣伺服器在地化版本

[![License](https://img.shields.io/github/license/SnosMe/awakened-poe-trade)](./LICENSE)
[![Based On](https://img.shields.io/badge/based%20on-awakened--poe--trade-blue)](https://github.com/SnosMe/awakened-poe-trade)
[![Server](https://img.shields.io/badge/server-pathofexile.tw-green)](https://pathofexile.tw)

> 基於 [SnosMe/awakened-poe-trade](https://github.com/SnosMe/awakened-poe-trade) 的分支，**專為流亡黯道台灣伺服器 (pathofexile.tw / Hotcool)** 深度在地化。

---

## 一般玩家使用（不需要程式基礎）

### 你需要準備什麼

- Windows 10/11（64 位元）
- 流亡黯道已安裝並可正常進入遊戲

### 下載與啟動

你拿到的檔案通常會是以下其中一種（或兩種都有）：

- 安裝版：`Awakened PoE Trade Setup x.y.z.exe`
- 免安裝版：`Awakened PoE Trade x.y.z.exe`

建議先用「免安裝版」測試：

1. 建一個資料夾（例如 `D:\Tools\AwakenedPoeTradeTW\`）
2. 把 `Awakened PoE Trade x.y.z.exe` 放進去
3. 直接雙擊執行

如果你要讓一般使用者安裝、更像正式軟體，再用「安裝版」：

1. 雙擊 `Awakened PoE Trade Setup x.y.z.exe`
2. 照畫面下一步完成安裝

### Windows 跳出「已保護你的電腦」怎麼辦

第一次執行如果遇到 Windows SmartScreen：

1. 點「更多資訊」
2. 點「仍要執行」

### 首次設定（台服）

1. 在程式內開啟設定（預設 `Ctrl + Space` → 齒輪圖示）
2. 語言選「**正體中文**」、伺服器選「**Hotcool**」
3. 取得 **POESESSID**（點「登入」按鈕，或參考下方手動方式）
4. 聯盟會自動載入，切換到當前賽季聯盟即可使用

取得 POESESSID（台服）：

- **登入按鈕（建議）**：點 POESESSID 欄位旁的「登入」按鈕，在跳出的視窗內登入 `pathofexile.tw`，登入成功後會自動關閉視窗並填入 POESESSID
- **手動輸入（備用）**：
  1. 用瀏覽器登入 `pathofexile.tw`
  2. 按 `F12` 開啟開發者工具
  3. Application（應用程式）→ Cookies → `pathofexile.tw`
  4. 找到 `POESESSID` 並複製其值，貼到設定頁的欄位中

### 常見問題

- 程式打不開/閃退
  - 先嘗試用「免安裝版」執行
  - 先關掉防毒/白名單測試（部分環境會誤判）
  - 請確認你是 Windows 64 位元
- 查價沒有資料
  - 請確認伺服器選的是「Hotcool」且 POESESSID 有填
  - 請確認目前選的聯盟正確

### 回報問題（請附上）

- 你的 Windows 版本（Windows 10/11）
- 你使用的是安裝版還是免安裝版
- `main/dist` 內檔名版本（例如 `3.28.103`）
- 問題發生步驟與截圖（如果可以）

## 功能總覽

| 功能 | 說明 |
|------|------|
| 即時詢價 | 遊戲內直接查詢物品市場價格，對應台服交易網站 |
| 地圖詞綴檢查 | 快速辨識地圖危險詞綴 |
| 倉庫搜尋 | 進階篩選條件搜尋倉庫物品 |
| 圖像辨識 | OCR 寶石辨識（劫盜寶石搜尋器） |
| 遊戲內覆蓋 | 透明 UI 浮於遊戲畫面之上，不影響遊戲操作 |

---

## 台服在地化重點

- **繁體中文物品解析** — 解析器完整支援台服 `Ctrl+C` 複製的繁中物品文字
- **API 全面導向台服** — 所有交易請求導向 `pathofexile.tw`，使用台服聯盟端點
- **POESESSID 注入** — 設定頁面可一鍵登入自動取得，或手動輸入 POESESSID，自動注入至台服請求 Cookie
- **自訂 User-Agent** — 台服請求使用 `Awakened-PoE-Trade-Taiwan-Mod/1.0`
- **繁中 UI 全翻譯** — 介面、設定、詞綴標籤等 306 個翻譯鍵全數本地化
- **台服聯盟自動偵測** — 啟動時自動載入台服聯盟列表，預設「標準模式」

---

## 使用方式

1. 開啟設定（`Ctrl + Space` → 齒輪圖示）
2. 語言選「**正體中文**」、伺服器選「**Hotcool**」
3. 取得 **POESESSID**（點欄位旁的「登入」按鈕自動取得，或從瀏覽器 F12 → Application → Cookies → `pathofexile.tw` 手動取得）
4. 聯盟會自動載入，切換到當前賽季聯盟即可使用

---

## 技術棧

| 類別 | 技術 |
|------|------|
| 桌面框架 | Electron 40 |
| 前端框架 | Vue 3 + Vite |
| 樣式 | Tailwind CSS |
| 語言 | TypeScript |
| 套件管理 | npm |

---

## 致謝

本專案站在巨人的肩膀上，向以下開源作者與服務致上誠摯謝意：

| 對象 | 貢獻 |
|------|------|
| [SnosMe](https://github.com/SnosMe/awakened-poe-trade) | 原始專案作者，提供完整的 Awakened PoE Trade 核心架構 |
| [poe.ninja](https://poe.ninja) | 提供即時市場匯率與物品價格資料 |
| [poeprices.info](https://www.poeprices.info) | 提供 AI 物品價格預測服務 |
| [Grinding Gear Games](https://www.pathofexile.com) | 開發 Path of Exile 遊戲本體與提供開放的交易 API |
| [Hotcool](https://pathofexile.tw) | 提供台灣/香港地區的 PoE 代理服務與 API 端點 |

---

*本工具為非官方社群作品，與 Grinding Gear Games 及 Hotcool 無從屬關係。*
