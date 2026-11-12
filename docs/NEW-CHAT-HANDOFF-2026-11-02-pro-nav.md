# Venus Pro UI：新 Chat 交接

更新日期：2026-11-02（香港時間）

## 目前目標與狀態

目前正在逐頁整理 **Pro 版介面**，由 Liquidity Hub 與共用導覽開始，將已確認的 Lite／Final 元件質感對應到 Pro。Figma 是指定設計參考；使用者最新的明確修改要求優先。

最新完成項目是 **Final 的 Earn 產品選單**。本次只更新本機程式碼，沒有 commit、push、部署或修改 Figma。使用者已要求建立本交接文件並開新 Chat；新 Chat 先讀文件並回覆已準備好，等待下一個具體設計要求，不要自行開始下一頁或發布。

## 專案與本機預覽

| 項目 | 位置／狀態 |
| --- | --- |
| Codex 專案目錄 | `/Users/alvin/Documents/Claude/Projects/Venus project` |
| Git repository | `/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview` |
| 前端 app | `/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview/apps/evm` |
| 技術 | React、TypeScript、Vite、Tailwind CSS、共用 UI 元件 |
| 本機網址 | `http://127.0.0.1:5176` |
| 當前頁面 | `http://127.0.0.1:5176/#/liquidity-hubs?chainId=56&tab=supply` |
| Git 分支 | 交接時為 `main`，working tree 有大量既有修改及未追蹤檔案 |
| 預覽版本 | UI 選 **Final**；`data-glass-variant='lite-experiment-v2'` |
| 本機服務 | 寫文件時已確認 127.0.0.1:5176 有 Node listener；新 Chat 應重新確認 |

若服務已關閉，在前端 app 目錄執行：

```sh
node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5176 --strictPort
```

先檢查 port 的既有服務，不要重複啟動。不要輸出 `.env`、API keys 或其他憑證。

## 最新需求：Earn 選單

使用者指定的 Figma：

[Venus UI Kits — node 5549:6445](https://www.figma.com/design/ffh5VFqviRERdBN5rhJkgv/Venus-UI-Kits_new?node-id=5549-6445)

使用者要求網站跟返這個設計，先修正 Venus Vault 的顏色，並且**不要選單外框 stroke**。Figma 原節點仍有 stroke，但這項使用者要求覆蓋該設定。

### 完成內容

- 桌面 Earn 面板為 **300 × 200px**；外層 padding **12px**，兩個產品 row 的 gap **24px**，每 row padding **8px**。尺寸使用現有 spacing token 計算。
- 桌面面板在 Light／Dark 都是 **0px border**；保留磨砂、輕微內高光與柔和陰影。沒有移除按鈕的鍵盤 focus 樣式。
- Light 面板依 Figma 使用 **白色 64%**。取代這個 Earn 面板先前接近不透明、偏藍邊框的舊 Light 覆寫。
- Light hover／focus-visible row 使用 Figma 的 **#F3F4F6**。
- Venus Vault tile 使用固定的 Figma 金色漸層，兩種主題一致：**#F7D979 → #F0B90B → #D39E09**。不再用會隨 Light 主題變成啡色的 semantic yellow token。
- 金色背景亦套用手機導覽內的 Earn 區塊；手機 Liquidity Hub 補上原有藍色 tile，避免白色 glyph 在 Light 底色消失。
- 保留既有 hover 圖示動態、選單展開互動、文案、動態 APY 與路由。Figma 範例 APY 不可硬寫取代網站資料。
- 桌面的 300 × 200px 是目前兩個 row／文案的實測結果，CSS 沒有鎖死面板高度。

### 規格對照

| 項目 | Light | Dark |
| --- | --- | --- |
| 桌面面板外框 | 無 | 無 |
| 面板 fill | `rgba(255,255,255,.64)` | 保留共用深色玻璃：`rgba(20,24,31,.58)` 與原輕微漸層 |
| blur | 共用 `12px`、saturate 120% | 共用 `12px`、saturate 120% |
| 外陰影 | x 0、y 12、blur 32、`rgba(30,40,55,.12)` | 保留共用 x 0、y 12、blur 32、黑色 18% |
| Vault tile | 同一金色漸層 | 同一金色漸層 |
| 文字 | 沿用現有主題文字 token | 沿用現有主題文字 token |

Figma 讀取到標題為 Proxima Nova Semibold 16／24，描述為 Regular 12／18；這次沿用既有文字元件，沒有另換整站字體。

### 主要修改位置

本次最新選單樣式集中在：

`apps/evm/src/containers/Layout/NavBar/figma-header.css`

搜尋註解 `Earn menu: Figma 5549:6445`、`Figma icon's asset colours`、`Match Figma's Light surface/dropdown/fill`。

只對 Final 的導覽做局部覆寫；桌面面板透過 `:has([data-earn-motion='vault'])` 限定 Earn，沒有把其他所有 dropdown 一併去框或改尺寸。

相關既有元件／樣式（新 Chat 修改前應先讀）：

- `apps/evm/src/containers/Layout/NavBar/MenuItem/SubMenuContent/index.tsx`
- `apps/evm/src/containers/Layout/NavBar/MenuItem/SubMenuContent/SubMenuItem/index.tsx`
- `apps/evm/src/containers/Layout/NavBar/MenuItem/SubMenuContent/SubMenuItem/governance-motion.css`
- `apps/evm/src/components/Dropdown/index.tsx`
- `apps/evm/src/components/Dropdown/glass.css`
- `apps/evm/src/demo/LiquidityLightPreview/e-light.css`
- `apps/evm/src/demo/GlassVersions/v5-button-refresh.css`

## 本段工作其他需要保留的改動

### Pro 星塵背景

Final 的 Lite 星塵背景已延伸到 Pro，重用同一個背景元件，不另加一套動畫。相關位置：

- `apps/evm/src/containers/Layout/index.tsx`：`fullBleedSky = showStardust && (isE3 || isFinal)`，Final 共用 `lite-full-bleed-sky`。
- `apps/evm/src/pages/LiteMarkets/ghost-background.css`。

這不是將 Lite 的互動 token 星球移植到 Pro。About Us 原有背景例外、Lite Dashboard 較低星塵密度的安排亦應保留。

### Header／玻璃結構

既有 Pro header 設計是頁面最頂透明，scroll 後才顯示玻璃層。背景玻璃放在 header 偽元素，不把 backdrop-filter 直接套在選單祖先，避免 dropdown 無法正確模糊頁面內容。不要為修選單而重新把 blur 加到整個 header／row。

目前範圍之外的 Settings、Wallet、button material、Select 等也有既有未提交修改；不能視為本次新增，亦不能任意還原或刪除。

## 驗證紀錄與範圍

最新 Earn 選單變更已檢查：

- 桌面 **1440 × 900**，Light／Dark：選單尺寸、0px border、金色 Vault、文字及磨砂外觀。
- 手機 **375 × 812**，Light／Dark：Vault 同色、Hub 藍色背景，沒有橫向溢出。手機原有 inline menu 排版保留。
- Stylelint 與指定檔案的 `git diff --check` 通過。

```sh
# 在 repository 根目錄
node node_modules/stylelint/bin/stylelint.mjs apps/evm/src/containers/Layout/NavBar/figma-header.css
git diff --check -- apps/evm/src/containers/Layout/NavBar/figma-header.css
```

前一項 Pro 星塵背景調整曾有 Layout／GhostBackground 合共 19 項測試通過；不是為最新純 CSS 選單變更重跑的測試，也不代表整站或線上驗收。

若測試在目前 Node 環境出現 `localStorage.getItem is not a function`／`window.localStorage.clear is not a function`，本段工作使用以下環境設定解決 worker webstorage 相容問題：

```sh
# 在 apps/evm 目錄；以實際需要的測試檔案取代下列目標
env NODE_OPTIONS=--no-experimental-webstorage TZ=UTC VITE_NETWORK=testnet VITE_ENV=ci \
node ../../node_modules/vitest/vitest.mjs run \
src/containers/Layout/__tests__/index.spec.tsx \
src/pages/LiteMarkets/GhostBackground.spec.tsx
```

沒有確認這批修改已在 Vercel 出現；本次沒有部署。

## 畫面證據

以下為本機截圖，不是 Figma export 或線上部署證據：

- [Light 桌面完成圖](</Users/alvin/Documents/Claude/Projects/Venus project/exports/earn-menu-2026-11-02/light-desktop.png>)
- [Dark 桌面完成圖](</Users/alvin/Documents/Claude/Projects/Venus project/exports/earn-menu-2026-11-02/dark-desktop.png>)
- [Light 手機檢查圖](</Users/alvin/Documents/Claude/Projects/Venus project/exports/earn-menu-2026-11-02/light-mobile.png>)
- [Dark 手機檢查圖](</Users/alvin/Documents/Claude/Projects/Venus project/exports/earn-menu-2026-11-02/dark-mobile.png>)

本機 browser screenshot 的 `clip` 模式曾出現玻璃合成層截圖異常；完整 viewport 的 `screenshot({fullPage:false})` 才取得正確完成外觀。不要將 `light-detail.png` 的舊中途截圖當作驗收圖。

## 新 Chat 工作界線與下一步

1. 先讀本文件、使用者最新訊息及適用 AGENTS.md，再確認 checkout／服務／Final／主題／頁面狀態。不要單憑舊交接文件宣稱當前實作已驗證。
2. 本專案使用繁體中文溝通；保留既有 token、8px 元件圓角、可複用元件與既有動態。小型局部修改可直接做；跨頁面／新元件先說明計畫；設計系統與導覽架構變更需使用者確認。
3. 使用者目前只要求交接及開新 Chat，沒有指定下一個要改的頁面；先回覆已準備好，等待使用者下一步。
4. 未經本次發布要求，不要自行 commit、push、部署或重寫 Figma。若需要發布，先辨認要包含的 dirty files，避免將其他工作混入。
5. 本次沒有建立新 worktree；新 Chat 應沿用同一份 checkout，保留所有既有修改與未追蹤檔案。不要 reset、clean 或大量刪除元件。

