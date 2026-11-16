# 同步原作者新版流程

當 [SnosMe/awakened-poe-trade](https://github.com/SnosMe/awakened-poe-trade) 發佈新版時，依本文件把新版合併進台服版。
上次同步：**v3.29.108**。

## 觀念

- `upstream` 分支：只放原作者的**純淨版本**（每個版本一個 commit），不放台服修改。僅存在於本機/你自己的 repo，不會影響原作者。
- `master` 分支：台服版。每次用 `git merge upstream` 吸收新版，git 只會比對「上一版 → 新版」的差異。
- 台服客製化只有少數檔案，只有這些檔案可能出現衝突：

| 類型 | 檔案 |
|---|---|
| 修改 upstream 檔案 | `ipc/types.ts`、`main/src/main.ts`、`main/src/proxy.ts`、`main/package.json`、`renderer/src/web/Config.ts`、`renderer/src/web/background/Leagues.ts`、`renderer/src/web/settings/general.vue`、`renderer/public/data/cmn-Hant/app_i18n.json` |
| 台服新增檔案 | `main/src/PoesessidLogin.ts`、`scripts/`、根目錄 `package.json`、`TWServer.md`、本文件、`openspec/` |

上表是 v3.29.108 當時的狀態，客製化檔案增減後可能過期。要確認目前的實際清單，用這個指令（`upstream` 分支就是原作者純淨版本，差異即台服客製化）：

```shell
git diff upstream --stat -- . ':!openspec' ':!.claude' ':!*lock*'
```

衝突時的原則：**保留 upstream 的新結構，把台服邏輯重新套上去**。台服行為的驗收基準見 `TWServer.md` 與 `openspec/specs/tw-localization/spec.md`。

## 步驟

以下以 `NEW=awakened-poe-trade-master`（下載/解壓的新版資料夾，放在本專案旁邊）為例。

### 1. 取得新版

下載原作者新版原始碼，解壓到本專案旁（例如 `../awakened-poe-trade-master/`）。這個資料夾只當暫放區，不要在裡面改東西。

### 2. 更新 `upstream` 分支

用獨立的 worktree 操作，不會動到目前的工作目錄：

```shell
cd APTCustomizationTWServer
git worktree add ../_up upstream

# 清空後複製新版（排除 .git）
cd ../_up
git rm -rq --cached .
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
(cd ../awakened-poe-trade-master && tar -c --exclude=.git .) | tar -x -C .

# 加入時把換行統一成 LF（必要，否則每個檔案都會顯示被改過）
git -c core.autocrlf=input add -A
git commit -m "upstream: awakened-poe-trade vX.Y.Z（原作者純淨版本）"

cd ../APTCustomizationTWServer
git worktree remove ../_up
```

確認這個 commit 只包含原作者真正改動的檔案：

```shell
git diff --stat upstream~1 upstream
```

（檔案數應該是幾十個；如果是兩百多個，代表換行沒有正規化。）

### 3. 合併進台服版

```shell
git checkout master
git checkout -b sync-upstream-X-Y-Z     # 建議用分支，出錯可丟棄
git merge upstream
```

- 沒有衝突的檔案自動更新。
- 有衝突就解（見上方表格，通常只有那幾個檔案）。解完 `git add` 後 `git commit`。
- 如果 `main/package.json` 衝突：版本號跟著 upstream，但保留 `repository.url`（指向你自己的 repo）與其他台服設定。

### 4. 補翻譯

```shell
npm run i18n:check
```

列出「`en/app_i18n.json` 有、`cmn-Hant/app_i18n.json` 缺少」的 key，補翻譯到 `renderer/public/data/cmn-Hant/app_i18n.json`。用詞對照檔案內既有翻譯（例如「側廂」、「批量」、「傭兵」）。

另外請手動檢查 upstream 這次**修改過**的英文字串（`git diff upstream~1 upstream -- renderer/public/data/en/app_i18n.json`），語意有變的要同步改中文。

遊戲資料（`cmn-Hant/items.ndjson`、`stats.ndjson`、`client_strings.js`）是官方台服繁中，由 upstream 提供，不用手動翻。

### 5. 檢查 upstream 的建置變動

```shell
git diff upstream~1 upstream -- main/package.json renderer/package.json main/build .github/workflows/main.yml
```

留意 npm script、建置流程有沒有被改名或移除，並確認 `scripts/setup.mjs`、`dev.mjs`、`package.mjs` 還能用（例如上次 upstream 移除了 `make-index-files`，`setup.mjs` 就需要跟著改）。

### 6. 驗證

```shell
cd renderer && npx vue-tsc --noEmit
cd ../main && npx tsc --noEmit
cd .. && npm run dev
```

在 app 內確認：

1. 貼上 `TWServer.md` 的範例物品（獵首腰帶）能正確解析
2. 聯盟列表從台服載入，預設為「標準模式」
3. POESESSID 登入/注入正常，請求導向 `pathofexile.tw`
4. 新增的介面文字有顯示繁中

### 7. 更新文件與版本

- `main/package.json` 版本號 = upstream 版本。
- `README.md` 的「目前對應原作者版本」與翻譯鍵數量。
- 本文件開頭的「上次同步」版本。
- 建議在 `openspec/changes/archive/` 補一份同步紀錄（可參考 `2026-11-16-sync-upstream-3-29-108`）。

合併回 `master`：

```shell
git checkout master
git merge --ff-only sync-upstream-X-Y-Z
```

### 8. 打包

```shell
cd renderer && npm ci && npm run build
cd ../main && npm ci && npm run build
npm run package -- --win -p never      # -p never：只在本機打包，不發佈
```

產物在 `main/dist/`：

- `Awakened PoE Trade Setup X.Y.Z.exe`（安裝版）
- `Awakened PoE Trade X.Y.Z.exe`（免安裝版）

先開免安裝版，跑一遍步驟 6 的檢查。

### 9. 發佈 Release

```shell
git push origin master

cd main/dist
gh release create VX.Y.Z -R a620906209/APTCustomizationTWServer --target master \
  --title "VX.Y.Z - 說明" --notes "更新內容..." \
  "Awakened PoE Trade Setup X.Y.Z.exe" "Awakened PoE Trade X.Y.Z.exe"
```

注意：

- Tag 命名沿用既有格式：大寫 `V` 開頭（例如 `V3.29.108`）。
- 不上傳 `latest.yml` 與 `.blockmap`：`latest.yml` 內的檔名用連字號，GitHub 上傳後檔名會變成點號，自動更新會對不上。
- `main/dist/` 已在 `.gitignore`，打包完可以清掉舊版安裝檔。

## 常見狀況

| 狀況 | 處理 |
|---|---|
| merge 後幾乎每個檔案都顯示被修改 | 換行不一致。確認步驟 2 有用 `core.autocrlf=input`；`git config core.autocrlf` 在 Windows 應為 `true` |
| merge 出現大量 add/add 衝突 | `upstream` 分支與 `master` 沒接上歷史。確認 `git merge-base master upstream` 有輸出 |
| `npm run dev` 啟動失敗 | 先 `npm run setup` 重新安裝依賴，再看 upstream 是否改了建置腳本（步驟 5） |
| 新版 upstream 改了台服客製化的檔案結構 | 以 upstream 新結構為主，重新套用台服邏輯；行為以 `TWServer.md` 為準 |
