# Awakened PoE Trade — 開發指南

> 本文件為專案開發相關文檔，涵蓋架構分析、技術棧、環境設定及開發流程。

---

## 1. 專案概述

**Awakened PoE Trade** 是一個基於 Electron 的桌面覆蓋工具，專為 Path of Exile (PoE) 遊戲設計。它提供即時價格查詢、物品分析、地圖檢查等功能，透過透明覆蓋窗口浮於遊戲畫面之上。

- **作者**: Alexander Drozdov
- **授權**: MIT License
- **版本**: v3.28.103 (主進程)

---

## 2. 技術棧

| 類別 | 技術 | 版本 |
|------|------|------|
| 桌面框架 | Electron | 40.8.0 |
| 前端框架 | Vue 3 | 3.2.37 |
| CSS 框架 | Tailwind CSS | 3.x |
| 前端構建工具 | Vite | 5.x |
| 主進程打包 | esbuild | 0.27.2 |
| 語言 | TypeScript | 5.6 ~ 5.9 |
| 套件管理器 | Yarn | 1.x (Classic) |
| 國際化 | vue-i18n | 10.x |
| Linting | ESLint | 9.x (Flat Config) |
| 桌面打包 | electron-builder | 26.4.0 |
| 自動更新 | electron-updater | 6.x |

---

## 3. 專案架構

```
awakened-poe-trade/
├── main/                    # Electron 主進程
│   ├── src/
│   │   ├── main.ts          # 應用入口，Electron 生命週期管理
│   │   ├── server.ts        # HTTP + WebSocket 伺服器
│   │   ├── proxy.ts         # HTTP 代理
│   │   ├── AppTray.ts       # 系統匣圖示
│   │   ├── AppUpdater.ts    # 自動更新邏輯
│   │   ├── host-files/      # 配置儲存、遊戲設定讀取、日誌監控
│   │   ├── windowing/       # 遊戲視窗偵測、覆蓋視窗管理
│   │   ├── shortcuts/       # 全域快捷鍵、剪貼簿操作
│   │   └── vision/          # 圖像辨識 (OCR/CV)，以 Worker 執行
│   ├── build/
│   │   └── script.mjs       # esbuild 構建腳本
│   ├── package.json
│   └── electron-builder.yml # 打包設定
│
├── renderer/                # Vue 3 渲染進程 (前端 UI)
│   ├── src/
│   │   ├── main.ts          # Vue app 初始化
│   │   ├── web/
│   │   │   ├── App.vue      # 根元件
│   │   │   ├── Config.ts    # 全域設定管理
│   │   │   ├── background/  # IPC 通訊、價格資料、聯賽資料
│   │   │   ├── overlay/     # 覆蓋層 UI 元件
│   │   │   ├── price-check/ # 價格查詢功能（核心功能）
│   │   │   ├── item-check/  # 物品檢查
│   │   │   ├── map-check/   # 地圖詞綴檢查
│   │   │   ├── stash-search/# 倉庫搜尋
│   │   │   ├── settings/    # 設定頁面
│   │   │   └── ui/          # 共用 UI 元件
│   │   ├── parser/          # 物品文字解析器
│   │   └── assets/          # 靜態資源與遊戲資料
│   ├── public/data/         # 多語言遊戲資料檔案
│   ├── vite.config.mts      # Vite 設定
│   ├── tailwind.config.js   # Tailwind 設定
│   └── package.json
│
├── ipc/                     # 主進程與渲染進程的共享型別
│   ├── types.ts             # IPC 事件型別定義
│   └── KeyToCode.ts         # 鍵盤鍵碼對應表
│
├── docs/                    # VitePress 文件站
└── .github/workflows/       # CI/CD 設定
```

---

## 4. 核心模組說明

### 4.1 主進程 (main/)

- **server.ts** — 在本地啟動 HTTP + WebSocket 伺服器 (port 8584)，供渲染進程通訊
- **windowing/** — 透過 `electron-overlay-window` 將透明視窗覆蓋在 PoE 遊戲視窗上
- **shortcuts/** — 使用 `uiohook-napi` 監聽全域鍵盤事件，實現遊戲內快捷鍵
- **vision/** — 圖像辨識模組，以獨立 Worker 執行，用於寶石辨識等功能
- **host-files/** — 讀取 PoE 客戶端設定、監控遊戲日誌檔案

### 4.2 渲染進程 (renderer/)

- **price-check/** — 核心功能：解析物品文字 → 篩選詞綴 → 查詢交易網站 → 顯示價格
- **parser/** — 將遊戲內複製的物品文字解析為結構化資料
- **overlay/** — 管理各個浮動小工具的定位、拖曳與顯示
- **Config.ts** — 全域設定狀態管理

### 4.3 IPC 通訊

主進程與渲染進程透過 WebSocket 進行事件驅動通訊，事件型別定義於 `ipc/types.ts`：

- `IpcItemText` — 遊戲內複製物品文字
- `IpcOcrText` — OCR 辨識結果
- `IpcFocusChange` — 視窗焦點變更
- `IpcVisibility` — 覆蓋視窗顯示/隱藏
- `IpcGameLog` — 遊戲日誌事件

---

## 5. 開發環境需求

| 工具 | 最低版本 | 說明 |
|------|---------|------|
| Node.js | 18+ | JavaScript 執行環境 |
| Yarn | 1.x (Classic) | 套件管理器 |
| Git | 2.x | 版本控制 |
| Python | 3.x | 編譯原生模組 (node-gyp) 時需要 |

### 5.1 本機環境檢查結果

| 工具 | 狀態 | 版本 |
|------|------|------|
| Node.js | ✅ 已安裝 | v22.16.0 |
| npm | ✅ 已安裝 | 10.9.2 |
| Yarn | ✅ 已安裝 | 1.22.22 |
| Git | ✅ 已安裝 | 2.37.3 |
| Python | ✅ 已安裝 | 3.13.5 |

---

## 6. 開發流程

### 6.1 首次設定

```bash
# 安裝渲染進程依賴並生成資料索引
cd renderer
yarn install
yarn make-index-files

# 安裝主進程依賴
cd ../main
yarn install
```

### 6.2 啟動開發模式

需要開啟**兩個終端**，分別啟動渲染進程和主進程：

```bash
# 終端 1：啟動 Vite 開發伺服器 (port 5173)
cd renderer
yarn dev

# 終端 2：啟動 Electron 主進程 (esbuild watch 模式)
cd main
yarn dev
```

渲染進程啟動後，Vite 會在 `http://localhost:5173` 提供 HMR 熱更新。主進程的 esbuild 會監控檔案變更並自動重啟 Electron。

### 6.3 生產構建

```bash
# 構建渲染進程
cd renderer
yarn make-index-files
yarn build

# 構建主進程並打包
cd ../main
yarn build
yarn package          # 生成安裝程式 (NSIS / AppImage / DMG)
```

---

## 7. 構建系統詳解

### 7.1 渲染進程 (Vite)

- **設定檔**: `renderer/vite.config.mts`
- **路徑別名**: `@/*` → `src/`、`@ipc/*` → `../ipc/`
- **開發代理**: API 請求代理到 `http://127.0.0.1:8584`
- **WebSocket**: `/events` 路徑代理到主進程 WebSocket 伺服器
- **PostCSS**: Tailwind CSS nesting → Tailwind → Autoprefixer

### 7.2 主進程 (esbuild)

- **設定檔**: `main/build/script.mjs`
- **入口點**:
  - `src/main.ts` → `dist/main.js` (主進程)
  - `src/vision/link-worker.ts` → `dist/vision.js` (OCR Worker)
- **外部依賴**: `electron`、`uiohook-napi`、`electron-overlay-window` (不打包)
- **開發模式**: 檔案變更 → 自動重新構建 → 重啟 Electron

### 7.3 打包 (electron-builder)

- **設定檔**: `main/electron-builder.yml`
- **支援平台**: Windows (NSIS + Portable)、Linux (AppImage)、macOS (DMG)
- **發佈**: GitHub Releases
- **自動更新**: electron-updater 整合

---

## 8. 程式碼規範

### 8.1 TypeScript

- 嚴格模式 (`strict: true`)
- 主進程目標: ES2021
- 渲染進程目標: ESNext

### 8.2 ESLint

- 使用 ESLint 9.x Flat Config (`renderer/eslint.config.mjs`)
- Vue 3 + TypeScript 規則集
- 執行檢查: `cd renderer && yarn lint`

### 8.3 Tailwind CSS

- 自訂色板定義於 `renderer/tailwind.config.js`
- 掃描範圍: `src/**/*.{ts,vue}`

---

## 9. 多語言支援

- 使用 `vue-i18n` 進行國際化
- 翻譯管理: Crowdin 平台
- 翻譯檔案位置: `renderer/public/data/{語言代碼}/app_i18n.json`
- 遊戲資料按語言分目錄存放於 `renderer/public/data/`

---

## 10. 關鍵功能模組

| 功能 | 位置 | 說明 |
|------|------|------|
| 價格查詢 | `renderer/src/web/price-check/` | 核心功能，物品價格即時查詢 |
| 物品解析 | `renderer/src/parser/` | 將遊戲物品文字解析為結構化資料 |
| 地圖檢查 | `renderer/src/web/map-check/` | 地圖詞綴危險度分析 |
| 倉庫搜尋 | `renderer/src/web/stash-search/` | 遊戲倉庫快速搜尋 |
| 覆蓋窗口 | `main/src/windowing/` | 透明覆蓋 UI 管理 |
| 快捷鍵 | `main/src/shortcuts/` | 全域鍵盤快捷鍵 |
| 圖像辨識 | `main/src/vision/` | OCR/CV 寶石辨識 |
| 自動更新 | `main/src/AppUpdater.ts` | 應用程式自動更新 |
