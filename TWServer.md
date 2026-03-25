🛠️ Awakened PoE Trade 台服重構任務說明書
🎯 專案目標
將 Awakened PoE Trade 核心邏輯從國際服（en）重構為流亡黯道台服 (PoE 1 Taiwan)。目前台服由 Hotcool 營運，網域為 pathofexile.tw。

1️⃣ 第一階段：核心解析器在地化 (Parser Localization)
任務： 修改 renderer/src/parser/ 目錄下的解析邏輯，使其能讀懂台服按下 Ctrl + C 噴出的繁體中文物品文字。

修改重點檔案：dictionary.ts 與相關的解析類別。

正則表達式 (Regex) 轉換規則：

Rarity: ➡️ 稀有度: 

Item Level: ➡️ 物品等級:  或 物品等級：（需同時相容全形與半形冒號）

Quality: ➡️ 品質: 

Requirements: ➡️ 需求: 

Sockets: ➡️ 插槽: 

處理細節：

請使用 \s+ 處理所有空格，確保相容性。

中文版物品名稱不包含 "Superior" 前綴，請調整 BaseType 的判斷邏輯。

2️⃣ 第二階段：網路請求與驗證 (Network & Auth)
任務： 將所有 API 請求導向台服，並實作 POESESSID 注入機制。

修改重點檔案：renderer/src/web/background/Prices.ts、Trade.ts。

網域替換：

將所有 pathofexile.com 替換為 pathofexile.tw。

Session 注入：

在請求 Header 中加入 Cookie 欄位。

格式：POESESSID=用戶提供的ID。

User-Agent 必須設定為自定義字串（例如：Awakened-PoE-Trade-Taiwan-Mod/1.0）以避免被防火牆攔截。

3️⃣ 第三階段：資料映射與聯盟同步 (Data Mapping)
任務： 確保詞綴 ID 與台服的中文描述正確對應。

API 參考路徑：

聯盟列表：https://pathofexile.tw/api/trade/data/leagues

詞綴數據：https://pathofexile.tw/api/trade/data/stats

靜態數據：https://pathofexile.tw/api/trade/data/static

任務要求：

讓工具啟動時自動從台服 API 更新 stats.json。

預設聯盟強制設定為 標準模式 用於初步測試。

📋 測試用台服物品範例 (Sample Text)
請 AI 根據此範例進行解析器測試：

Plaintext
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
(敘述略)
💡 開發指南 (AI Instructions)
發散優先：先分析 dictionary.ts 的結構，列出所有需要替換的英文關鍵字，再進行代碼修改。

不確定時明說：如果發現台服文字格式與國際服結構有重大差異（如 Base64 編碼部分），請先向我說明並討論解決方案。

事實在地化：所有輸出的日誌與 UI 文字，請優先轉換為繁體中文。