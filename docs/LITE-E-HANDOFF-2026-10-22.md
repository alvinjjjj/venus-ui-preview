# Venus Preview 交接：E 設計統一與本地真實交易

更新日期：2026-10-22（香港時間）。接續 `docs/LITE-E-DESIGN-HANDOFF-2026-10-21.md`。

## 2026-10-23 補充：訪客可瀏覽 Lite / Pro

- `useInterfaceMode` 與 NavBar 不再以 wallet 是否連接限制公開版本選擇；未連錢包亦可切 Lite / Pro，Pro 深連結及重新整理會保持正確介面。
- APY、流動性、供應／借款總額及市場搜尋沿用既有公開查詢。BSC 預覽仍用 snapshot，不是新接即時資料。
- 沒有放開持倉、餘額或交易操作；Core / Hub 訪客表單仍顯示 Connect Wallet。沒有送出交易或改動原本工作頁的帳戶。
- 152 項相關測試及 TypeScript 通過；詳見 `docs/LITE-E-EXPERIMENT.md` 最新章節。尚未 commit、push 或部署。
- 最新順序：首次引導 → 簡潔 Footer + About → 訪客公開市場資料，三項已在本地完成；下一項是 Dark 背景細節，小白 / X 入口仍待處理。

## 2026-10-23 補充：Footer + About

- Lite / Pro 產品頁按使用者新截圖改用原有簡潔連結／社交橫欄，加入 `About` → `/about-us`；About Us 展示頁本身的 Explorer 大 Footer 保留。因此下方「所有 Pro 頁用 Explorer 大 footer」屬歷史 commit 狀態，不是目前本地呈現。
- 手機 Footer 接在完整市場視窗後，可向下捲到；桌面仍是原有框內清單捲動與最底窄橫欄。沒有全域 token 修改，沒有刪除 FooterExplorer 或 TrustedWallets 元件。
- 116 項相關測試與 TypeScript 通過；本地未部署。詳見 `docs/LITE-E-EXPERIMENT.md` 最新章節。
- 原定順序：首次引導（本地已完成）→ 簡潔 Footer + About（本次完成）→ 未連錢包公開資料 → Dark 背景細節 → 小白 / X 入口。後三項本次未開始。

## 版本狀態

- 專案：`venus-ui-preview`，應用：`apps/evm`，分支：`main`。
- 最後 commit：`bdc29f0`（已 commit，**未 push**，需要喺本機 Terminal 自行 `git push origin main`，Vercel 會自動部署）。
- `bdc29f0` 之後嘅修改全部仍喺本地，未 commit（見文末「未 commit 檔案」）。

## 本地 server

```bash
cd ~/Documents/Claude/Projects/"Venus project"/venus-ui-preview/apps/evm
../../node_modules/.bin/vite --host 127.0.0.1 --port 5176
```

- 本機 Terminal 冇 `yarn`，直接用專案自帶 vite。
- 如果出現 `node: command not found`：`source ~/.nvm/nvm.sh && nvm use 22`（`.nvmrc` 為 v22.22.0）。
- 開啟：<http://127.0.0.1:5176/#/?chainId=56>，右下角 Preview 選 **E**。

## 已 commit（`bdc29f0`）

### Lite E
- 主列表：Earn／Borrow 切換喺框內左邊；搜尋同篩選喺右邊；入 token 後靠 breadcrumb 返回。
- 金額欄只顯示數字（唔重複 token 名）。
- USDT 加返 Prime 入口。
- Borrow 抵押品選單改為 Asset／Max LTV／LT 表格。
- 彈窗輸入框、health bar 用 New 嘅凹槽材質。
- 輸入框內嘅 token 掣同 MAX 統一 40px 高，四邊留白一致。

### E 套用 New
- Header：除 logo、Pro/Lite 標籤、Lite 掣、header 高度同底色外，全部跟 New。
- Pro 頁按鈕、分段按鈕（30D/6M/1Y 等）、開關、progress bar 跟 New。
- 做法係 runtime 鏡像：`demo/GlassVersions/eHeaderMirror.ts` 喺 E 模式自動將 New 嘅 CSS 規則套落指定範圍，New 改設計時 E 會自動跟住。

### Pro 頁
- Liquidity Hub、Vaults、Venus Core、Spoke 用同一標題設計（藍色漸層、48px），副標題 16px 灰色。
- Liquidity Hub 副標題縮短為「One supply, auto-routed across Venus yield sources.」（只改英文）。
- Liquidity Hub 左右 margin 同 Core 一致。
- Liquidity Hub 移除 Safety／Community 兩段；「Trusted by many」推到第一個畫面以下。
- 所有 Pro 頁用 Explorer 大 footer。
- Vaults 移除夾萬插圖。
- Lite Dashboard 市場分頁改玻璃按鈕。

## 未 commit（`bdc29f0` 之後）

### 設計
- **Theme 切換**（Settings）：New／E 改為玻璃分段按鈕；O 不變。
- **MAX／SAFE MAX**（E 彈窗）：平時 Regular 400，hover 變 600。
- **彈窗輸入框內嘅掣**：token 選擇掣同 MAX 有同錢包掣一樣嘅玻璃同跟滑鼠光效，撳落輕微縮放。
- **列表 hover**：
  - 主列表：浮卡式，左右縮入 8px、8px 圓角、4% 白底、細邊、150ms 淡入，冇箭咀。
  - Token 市場來源表：每格染淡底，兩邊圓角。表格行加隱藏背景層會令 Chrome 當多一格，令欄位錯位，所以用另一種做法。
- **Loan assets／Categories 多選選單**：token 圖示同名同剔格垂直置中。
- **載入期間**：表格保持表頭同載入圈，唔再閃「Market data is unavailable」；框保持 488px 高。
- **進場動畫**：E 市場區只做向上浮起，淡入改放喺卡片本身，修正卡片由透明跳去實心嘅問題。
  - 副作用：每次切換 Earn／Borrow 或入出 token，卡片都會重新淡入 0.6 秒。

### 本地真實交易
- 判斷條件喺 `demo/isLocalPreview.ts`：只係 dev server 而且網址係 `127.0.0.1` 或 `localhost` 先開。
- **本地**：
  - `useSendTransaction` 用 Venus 官方版本（`hooks/useSendTransaction/useRealSendTransaction.ts`，取自 `VenusProtocol/venus-protocol-interface` main）。
  - Liquidity Hub 彈窗用官方表格（SupplyTabs／WithdrawForm），有真實結餘、Approve 同交易。
- **Vercel 公開網站**：照舊全部模擬，彈「Preview」視窗，唔會送任何交易。
- **試用注意**：
  - 要登出示範帳戶（0x00...dEaD），連自己錢包，切去 BNB Chain。示範帳戶入面嘅結餘係假數字，亦簽唔到名。
  - 第一次 Supply 要先 Approve，再確認存入。
  - 先用細額試，係真資金。
- `demo/__tests__/transactions.spec.tsx` 改為測模擬版本。

## 未解決／待確認

- **Collateral 開關撳唔到**：程式喺以下情況會停用開關：未連錢包、錢包唔喺 BNB Chain、資產不可做抵押、E-mode 下該資產唔計抵押。用真錢包喺 BNB Chain 再確認。
- **Vitest**：Linux VM 跑唔到，因為 rollup 原生組件係 Mac 版本；要喺本機跑測試。
- **TypeScript**：`tsc --noEmit` 通過。
- **翻譯**：Liquidity Hub 新副標題只有英文，其他語言仲係舊句子。

## 未 commit 檔案

```
apps/evm/src/containers/LiquidityHubForm/index.tsx
apps/evm/src/demo/GlassVersions/eHeaderMirror.ts
apps/evm/src/demo/GlassVersions/index.tsx
apps/evm/src/demo/ThemeSetting/index.tsx
apps/evm/src/demo/__tests__/transactions.spec.tsx
apps/evm/src/demo/isLocalPreview.ts                          (新)
apps/evm/src/hooks/useSendTransaction/index.ts
apps/evm/src/hooks/useSendTransaction/useRealSendTransaction.ts (新)
apps/evm/src/pages/LiteMarkets/BorrowMarkets.tsx
apps/evm/src/pages/LiteMarkets/experiment.css
apps/evm/src/pages/LiteMarkets/index.tsx
docs/LITE-E-HANDOFF-2026-10-22.md                            (新)
```
