# Awakened PoE Trade — 台灣服務器版

[![License](https://img.shields.io/github/license/SnosMe/awakened-poe-trade)](./LICENSE)

基於 [SnosMe/awakened-poe-trade](https://github.com/SnosMe/awakened-poe-trade) 的分支修改版，**專為流亡黯道台灣服務器 (pathofexile.tw)** 在地化。

---

## 台服適配重點

- **繁體中文物品解析** — 解析器完整支援台服 Ctrl+C 複製的繁中物品文字（稀有度、物品等級、品質、插槽等）
- **API 導向台服** — 所有交易請求導向 `pathofexile.tw`，使用台服專屬聯盟端點 `/api/trade/data/leagues`
- **POESESSID 注入** — 設定頁面可輸入 POESESSID，自動注入至台服請求的 Cookie 中
- **自訂 User-Agent** — 台服請求使用 `Awakened-PoE-Trade-Taiwan-Mod/1.0` 避免防火牆攔截
- **預設聯盟** — 台服預設聯盟為「標準模式」

## 功能總覽

| 功能 | 說明 |
|------|------|
| 即時價格查詢 | 遊戲內直接查詢物品市場價格 |
| 地圖詞綴檢查 | 快速辨識地圖危險詞綴 |
| 倉庫搜尋 | 進階篩選條件搜尋倉庫物品 |
| 圖像辨識 | OCR 寶石辨識（劫盜寶石搜尋器） |
| 遊戲內覆蓋 | 透明 UI 浮於遊戲畫面之上 |

## 技術棧

| 類別 | 技術 | 版本 |
|------|------|------|
| 桌面框架 | Electron | 40.8.0 |
| 前端框架 | Vue 3 | 3.2.37 |
| CSS 框架 | Tailwind CSS | 3.x |
| 構建工具 | Vite + esbuild | 5.x |
| 語言 | TypeScript | 5.6+ |
| 套件管理器 | Yarn | 1.x (Classic) |

## 開發環境設定

### 需求

- Node.js 18+
- Yarn 1.x
- Git 2.x
- Python 3.x（編譯原生模組需要）

### 首次設定

```bash
# 渲染進程
cd renderer
yarn install
yarn make-index-files

# 主進程
cd ../main
yarn install
```

### 啟動開發模式

開啟兩個終端：

```bash
# 終端 1：Vite 開發伺服器 (port 5173)
cd renderer
yarn dev

# 終端 2：Electron 主進程
cd main
yarn dev
```

### 生產構建

```bash
cd renderer && yarn make-index-files && yarn build
cd ../main && yarn build && yarn package
```

## 使用方式（台服）

1. 在設定頁面將語言切換為「正體中文」
2. Realm 選擇「Hotcool」
3. 填入你的 POESESSID（從瀏覽器 Cookie 取得）
4. 聯盟會自動載入台服聯盟列表，預設為「標準模式」

## 專案架構

```
awakened-poe-trade/
├── main/                    # Electron 主進程
│   └── src/
│       ├── main.ts          # 應用入口
│       ├── server.ts        # HTTP + WebSocket 伺服器
│       ├── proxy.ts         # HTTP 代理（含台服 POESESSID 注入）
│       ├── windowing/       # 遊戲視窗偵測、覆蓋視窗
│       ├── shortcuts/       # 全域快捷鍵
│       └── vision/          # OCR 圖像辨識
├── renderer/                # Vue 3 渲染進程
│   └── src/
│       ├── parser/          # 物品文字解析器（支援繁中）
│       ├── web/
│       │   ├── Config.ts    # 全域設定（含 poesessid）
│       │   ├── background/  # 聯盟/價格資料載入
│       │   ├── price-check/ # 價格查詢核心
│       │   └── settings/    # 設定頁面
│       └── assets/          # 靜態資源與遊戲資料
├── ipc/                     # 主進程與渲染進程共享型別
└── docs/                    # 文件
```

## 文件參考

- [開發流程詳解](./DEVELOPMENT_GUIDE.md)
- [構建指南](./DEVELOPING.md)
- [台服重構任務說明](./TWServer.md)
- [快速入門](./docs/quick-start.md)
- [常見問題](./docs/faq.md)

---

*本工具非 Grinding Gear Games 或 Hotcool 官方產品。*
