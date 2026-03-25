# 📜 Project Protocol

## 執行流程
1. 接收任務後，立即呼叫 `brain` (Gemini CLI) 並傳送當前 Context。
2. 讀取 `brain` 回傳的「Action Spec (執行指令)」。
3. 按照 Action Spec 進行實作。
4. 將過程記錄至 `./logs/session.log`。

## 本地限制
- 僅限修改當前目錄及其子目錄。
- 嚴禁修改未經 `brain` 審核的邏輯。

## 日誌讀取協議 
- **優先權**：除非特別說明，否則僅以 `./logs/brain.log` 中最後一個 `[TASK-ID]` 作為執行標準。
- **存檔機制**：當日誌超過 1000 行時，主動將舊紀錄移至 `./logs/archive/`。