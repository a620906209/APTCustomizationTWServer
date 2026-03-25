# Awakened PoE Trade — 台灣伺服器在地化版本

[![License](https://img.shields.io/github/license/SnosMe/awakened-poe-trade)](./LICENSE)
[![Based On](https://img.shields.io/badge/based%20on-awakened--poe--trade-blue)](https://github.com/SnosMe/awakened-poe-trade)
[![Server](https://img.shields.io/badge/server-pathofexile.tw-green)](https://pathofexile.tw)

> 基於 [SnosMe/awakened-poe-trade](https://github.com/SnosMe/awakened-poe-trade) 的分支，**專為流亡黯道台灣伺服器 (pathofexile.tw / Hotcool)** 深度在地化。

---

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
- **POESESSID 注入** — 設定頁面可輸入 POESESSID，自動注入至台服請求 Cookie
- **自訂 User-Agent** — 台服請求使用 `Awakened-PoE-Trade-Taiwan-Mod/1.0`
- **繁中 UI 全翻譯** — 介面、設定、詞綴標籤等 306 個翻譯鍵全數本地化
- **台服聯盟自動偵測** — 啟動時自動載入台服聯盟列表，預設「標準模式」

---

## 使用方式

1. 開啟設定（`Ctrl + Space` → 齒輪圖示）
2. 語言選「**正體中文**」、伺服器選「**Hotcool**」
3. 填入你的 **POESESSID**（從瀏覽器 F12 → Application → Cookies → `pathofexile.tw` 取得）
4. 聯盟會自動載入，切換到當前賽季聯盟即可使用

---

## 開發環境

### 需求

- Node.js 18+、Yarn 1.x、Git 2.x、Python 3.x（編譯原生模組）

### 一鍵啟動（推薦）

```bash
# 1. 首次安裝：檢查環境 + 安裝所有依賴 + 產生索引檔
yarn setup

# 2. 啟動開發環境（自動依序啟動 Renderer → Electron）
yarn dev
```

> `yarn dev` 會先等待 Vite 就緒，再自動啟動 Electron，無需手動分兩個終端。

附加選項：

| 指令 | 說明 |
|------|------|
| `yarn dev:renderer` | 只啟動 Vite（純前端開發） |
| `yarn dev:main` | 只啟動 Electron（後端除錯） |

### 手動啟動（進階）

```bash
# 終端 1：渲染進程
cd renderer
yarn install && yarn make-index-files && yarn dev

# 終端 2：主進程（待 renderer 啟動後）
cd main
yarn install && yarn dev
```

### 生產構建

```bash
cd renderer && yarn make-index-files && yarn build
cd ../main && yarn build && yarn package
```

---

## 技術棧

| 類別 | 技術 |
|------|------|
| 桌面框架 | Electron 40 |
| 前端框架 | Vue 3 + Vite |
| 樣式 | Tailwind CSS |
| 語言 | TypeScript |
| 套件管理 | Yarn 1.x |

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
