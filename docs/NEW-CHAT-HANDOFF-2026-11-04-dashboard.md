# Venus Dashboard：新 Chat 交接

更新日期：2026-11-04（香港時間）

## 1. 新 Chat 的任務

使用者要求將這個長對話整理成 Markdown，並建立另一個 **chat** 繼續；「chart box」是口誤，已明確更正為「chat box」。**沒有新增圖表、圖表卡片或恢復 Chart 外框的要求。**

新 Chat 先閱讀本文件及下方最終規格，簡短回覆已接上目前版本，等待使用者下一個具體要求。這次移交不需要重新修改網站、Figma、Notion或再次部署。

## 2. 目前交付狀態

2026-11-04 最後一輪已完成網站修改、正式分享預覽部署及既有 Notion PRD 更新。本文件依據目前 repository 文件與發布紀錄整理；整理交接時沒有重新執行完整 QC、沒有建立新的部署。

| 項目 | 已核對的紀錄 |
| --- | --- |
| 專案目錄 | `/Users/alvin/Documents/Claude/Projects/Venus project` |
| Repository | `/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview` |
| 前端 app | `/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview/apps/evm` |
| 技術 | React、TypeScript、Vite、Tailwind CSS、既有共用元件 |
| 本機 | `http://127.0.0.1:5176`；下一次使用前先確認服務仍在 |
| 最新正式預覽 | `https://venus-ui-preview.vercel.app` |
| 部署 ID | `dpl_B4D36nuXub6VFAZGHNqAyhvPy6Uu`，當輪回傳 `READY` |
| 唯一部署網址 | `https://venus-ui-preview-5dt9a008g-alvin-edec.vercel.app` |
| 入口 JS | `assets/index-6tyKnsi7.js` |
| 發布紀錄時間 | `2026-11-04T20:05:47+08:00`，來自 release manifest |
| Notion | 原有 Dashboard 子頁已更新，重新載入確認保存，加入3張最新線上截圖 |
| Figma | 最後這輪只讀取指定設計，沒有修改或發布 Figma |
| Git | 工作目錄有大量既有修改及未追蹤檔；沒有為本輪建立 commit／PR |

### 直接連結

- [Lite Dashboard](https://venus-ui-preview.vercel.app/#/dashboard?interface=lite&chainId=56)
- [Pro Dashboard](https://venus-ui-preview.vercel.app/#/dashboard?interface=pro&chainId=56)
- [Notion PRD／QC](https://app.notion.com/p/Venus-Dashboard-QC-2026-11-04-40eb4e5771bb80688fabe8112b9e6009)
- [Notion 上層 Dashboard](https://app.notion.com/p/Dashboard-40eb4e5771bb80ec9a74da120497aab5)

使用者的瀏覽器可能仍停在 `venus-ui-preview-orcin.vercel.app`。本輪實際部署及核對的是上面的 `venus-ui-preview.vercel.app`；不要把舊網址當成這次發布的驗證證據，也不要未經檢查更改另一個專案的 alias。

## 3. 文件優先順序

1. 使用者最新的明確要求。
2. 最終一致規格：`/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview/docs/UNIFIED-DASHBOARD-NOTION-2026-11-04.md`。
3. 本日修改歷史：`/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview/docs/DASHBOARD-HANDOFF-2026-11-04.md`。文件頂部最終發布摘要優先；較早的數值、15:57部署及「本機未部署」字句是歷史狀態。
4. 最新發布證據：`/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview/exports/dashboard-final-release-20261104/`。

不可用較早的試版值蓋掉最後決定。特別是：手機 Summary 數值最終是20px，不是16px；百分比才是16px Regular；桌面交易行最終60px；Chart最終透明無外框。

## 4. 必須保留的產品及資料規則

- **只有一個 Dashboard**：Lite／Pro 共用同一頁內容、元件、資料及響應式規則。模式只改外層導覽及模式入口，不另建第二套 Dashboard。
- Dashboard 內切換 Lite／Pro 留在同一路由，保留 chain及篩選／分頁 query。
- 保留現有市場名稱及資料，不直接換成 Figma 的 Core Pool／Bluechips／RWA 等示例名稱。
- 分類順序：Venus Core → Liquidity Hub → Vaults → bStock index → bStock growth。
- 沒有該市場持倉便隱藏分類，Desktop與手機共用條件；這不是KYC或白名單。
- Core有正數 Supply／Borrow才算持倉；單獨零餘額的Collateral membership不算。Vaults使用既有stake資料。
- USDC綠星及USDT Prime badge是demo版面示例；保留現有真實reward優先邏輯，不硬寫收益或資格。
- Dark保留星空，持倉／交易／空狀態卡片保持實心。
- 未連接直接開 Dashboard、或從 Dashboard登出，都離開Dashboard，保留模式與chain；Pro循現有首頁導航可到Liquidity Hub。
- 已連接但無資產，不顯示Connect wallet空狀態。Empty account為獨立demo地址 `0x0000000000000000000000000000000000000002`。
- Normal／Prime／Empty均為模擬帳戶；不把demo預覽或本輪QC寫成真實錢包交易驗收。

### 操作彈窗的討論與實作要分開

使用者貼出的團隊討論，最後傾向兩種模式的Dashboard快捷操作一致：Supplied側開Lite Supply／Withdraw、Borrowed側開Lite Borrow／Repay，複雜操作去detail page。

若後續要求處理這項互動，先檢查當前Core／Hub／Spoke的實際click handler並在瀏覽器重播，再判斷差距。**不要單憑討論紀錄宣稱所有協議已完成統一彈窗，也不要在這次建立新Chat時自行新增這項工作。**

## 5. 最終視覺規格摘要

### Summary及Chart

- Summary／Positions／Transaction標題：24px、600、36px行高；桌面標題列最少48px。
- Net worth：40px、600、60px行高。
- 有績效歷史：四項指標2×2，Today’s change／Absolute performance，其下Net APY／Daily earnings。沿用原本計算及tooltip。
- Today’s change百分比：16px、Regular400、24px行高；金額及其他主要值20px、600、30px行高。
- 桌面標題列至內容24px；手機Summary至內容12px。
- 1280px起Summary與Chart兩欄，較窄堆疊。1440px時Chart628px寬，右邊與下方卡片對齊。
- Chart容器**透明、無背景、無stroke、無卡片陰影**。保留藍色直線折線與20%→0漸淡面積。
- Chart inset12px、switch至chart gap12px、plot171px高；日期dd.MM共7個tick、金額5個tick，各有標籤區。
- 已確認無歷史時，不渲染Chart、空Chart提示、switch或預留右欄。640px起Summary四項橫排；手機2×2。Loading／Error不當作無歷史。

### Positions及表格

- 1024px起標題左、分類按鈕右同列；640／768px堆疊，間距16px；手機使用Select。
- 分類按鈕、手機Select、Transaction篩選器最少48px高；padding12px、分類gap12px；文字長可增高。
- Core／bStock Supplied與Borrowed使用共同欄寬：Asset24%／APY32%／Balance20%／最後一欄24%。
- 表頭56px、資料行60px；桌面cell水平padding24px。資料14px／21px，APY600、Balance400。
- **APY及reward整組靠右**，沒有badge時不要預留空槽。
- Supplied／Borrowed標題及交易日期為16px、600、24px行高，規格一致但資料邏輯不同。

### 顏色、線及Hover

| 用途 | Light | Dark |
| --- | --- | --- |
| 頁面 | `#F4F7FB` | `#101218` |
| 實心Card視覺 | `#FBFCFE` | 黑10%疊於頁面，約`#0E1016` |
| 外框 | `#D4DDE8` | `#30354A` |
| 內線／區塊分隔線 | 黑6% | 白8% |
| Card上內線約值 | `#ECEDEF` | `#222329` |

- 沿用現有語意token；合成色是比對值，不要另造一批硬編碼顏色。
- 640px起兩條區塊分隔線上下各48px總留白；小於640px隱藏這兩條橫線，區塊gap24px。指標中間直線及卡片內線保留。
- Hover為中性灰色，保留Light深色／Dark白色文字；資產名稱hover700，不整行改藍色。
- 按住不代表長期selected，實際狀態仍由Tabs／ButtonGroup決定。
- Header捲動玻璃效果要淡，Lite目前20%半透明底／4px blur、沒有突然出現的底線。

### 手機（小於640px）

- Summary標籤14px／400／21px；值20px／600／30px；百分比16px／400／24px。
- 四項指標2×2，row gap12px、column gap20px。375px起示範金額＋百分比同列；更窄允許百分比整組換行，不縮字。
- 資產卡名稱16px／600（hover700）；APY／Balance14px／400；Health pill12px／600。
- 資產卡內線延伸至左右卡片內緣，**內容仍留16px水平padding**。
- 最新分隔線修正對照Figma `417:50196`；實測線端距外框外緣1px，即內緣，不把文字貼邊，也不改內線顏色。

### Transaction

- Desktop交易行60px；hover填滿列表內緣，行內容及日期水平padding16px。
- 列表容器小於672px時：外層列表無框／底色／陰影；日期在框外、每筆獨立實心卡，依內容增高。
- 窄版交易卡內容水平padding12px，內線延伸至左右內緣。**672px是container條件，不是viewport斷點。**
- 手機Transaction與Download .CSV同行、filters下一行。
- 每頁20筆交易；保留多選篩選、Reset及URL狀態。CSV只匯出目前篩選後的當頁資料，多資產交易可產生多行CSV。
- Empty account無交易時顯示No transactions yet，收起filters／CSV／分頁；篩選後無結果仍保留Reset。
- Footer間距48px、social icon hover品牌藍底白圖示；totals彩點及返回頂部浮動箭頭已移除／暫停render。

## 6. 最後一輪QC證據

下列是前一輪已執行的紀錄，不是這次寫MD時重新跑的結果。

- 相關測試：42項／6檔通過；AccountOverview、Dashboard、LitePositions、guest、Empty account、CSV。
- TypeScript、Dashboard Stylelint、production build、`git diff --check`通過。
- Vercel READY、HTTP200；本機／線上入口JS及HTML SHA256一致。
- 線上1440px Pro Dark：Chart透明無框628px、百分比16px／400／24px、6筆交易各60px、無溢出。
- 線上390px Lite Dark／Light：資產及交易卡全寬內線、原內容padding、區塊橫線隱藏。
- 線上Empty account390／640／1440px：無Chart、無溢出，640px起四項橫排，手機2×2。
- 本機另有完整24狀態全頁矩陣，以及手機字級16狀態、交易容器671／672px邊界專項。
- Notion最終12節正文及3張截圖已重新載入確認保存，原私人位置／分享權限不變。

證據路徑（均在repository下）：

- `exports/dashboard-final-release-20261104/release-manifest.json`
- `exports/dashboard-final-release-20261104/http-verification.json`
- `exports/dashboard-final-release-20261104/live-verification.json`
- `exports/dashboard-final-release-20261104/divider-local-geometry.json`
- `exports/dashboard-final-release-20261104/live-pro-dark-desktop.png`
- `exports/dashboard-final-release-20261104/live-lite-dark-mobile-transactions.png`
- `exports/dashboard-final-release-20261104/live-lite-light-mobile-transactions.png`
- `exports/dashboard-final-release-20261104/notion-top-saved.png`
- `exports/mobile-dashboard-typography-20261104/geometry.json`
- `exports/transaction-frame-fix-20261104/`
- `exports/empty-summary-20261104/`

仍未宣稱完成：實機iOS／Android／Safari完整矩陣、真實錢包交易、所有鏈／真實收益及Prime資格、全面WCAG稽核、Figma回寫發布。

## 7. 下一輪讀程式的位置

以下均相對 `/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview/apps/evm/src/`：

| 路徑 | 責任 |
| --- | --- |
| `pages/Dashboard/index.tsx` | 唯一頁面、Summary／Positions／Transaction、guest redirect |
| `pages/Dashboard/figma-dashboard.css` | 最終局部排版、字級、卡片、內線及responsive |
| `pages/Dashboard/LitePositions.tsx` | 分類可見性、Vaults、手機Select及資產切換 |
| `pages/Dashboard/positionTableLayout.ts` | 共同表格欄寬 |
| `pages/Dashboard/Markets/Positions/Tables/index.tsx` | Core持倉表／操作 |
| `pages/Dashboard/Transactions/index.tsx` | 篩選、CSV、空狀態、布局 |
| `components/TransactionsList/TransactionRow/index.tsx` | 交易行與窄版卡片 |
| `containers/AccountOverview/index.tsx` | 四項指標與空歷史Summary |
| `containers/AccountOverview/PerformanceChart/` | Chart、日期／金額軸、期間 |
| `assets/styles/lite-dividers.css` | 共用內線規則 |
| `containers/Layout/NavBar/` | Header、模式入口、帳戶／Settings |
| `components/Modal/` | 既有共用彈窗及鍵盤焦點處理 |
| `demo/state.ts`、`demo/DemoLogin/` | Normal／Prime／Empty模擬帳戶 |

### 本機啟動與檢查

先確認5176沒有既有服務；不要重複啟動。在前端app目錄：

```sh
node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5176 --strictPort
```

相關測試使用目前Node環境相容設定：

```sh
TZ=UTC VITE_NETWORK=testnet VITE_ENV=ci NODE_OPTIONS=--no-experimental-webstorage ../../node_modules/.bin/vitest run src/containers/AccountOverview/__tests__/index.spec.tsx src/pages/Dashboard/__tests__/index.spec.tsx src/pages/Dashboard/LitePositions.spec.tsx src/pages/Dashboard/__tests__/guest.spec.tsx src/demo/__tests__/emptyAccount.spec.ts src/pages/Dashboard/Transactions/__tests__/createTransactionsCsv.spec.ts --reporter=dot
```

`LitePositions.spec.tsx`直接位於Dashboard目錄，並非其`__tests__`下。只有真的改動才按範圍重跑必要檢查，不要為讀交接文件重跑整套測試。

### 部署備註

- 已發布的是Vercel `alvin-edec / venus-ui-preview`的prebuilt靜態產物。
- 先前staging：`/private/tmp/venus-dashboard-release-final-20261104`；臨時目錄可能失效，將來發布前必須重新確認產物來源及project binding。
- 本輪沒有Git push；不要以新部署為理由清掉dirty checkout，亦不要沿用舊build宣稱已包含未來修改。
- 不要輸出`.env`、API key、Vercel憑證或其他私密資料。

## 8. 合作規則

- 以繁體中文／廣東話溝通。使用者希望精準延續已確認設計，少重複確認。
- 單一元件小改動直接執行；新元件／跨頁影響先列計畫確認；設計系統／導覽變更等待確認。已授權的同一工作不要重複問權限。
- 沿用現有token及元件，沒有確認不要更改全域token／樣式，也不要刪除既有產品元件。
- 工作目錄有大量既有修改；先讀diff，不要reset／clean／覆蓋不相關內容。
- 清楚區分source、本機QC、線上部署、Notion保存及Figma發布；測試通過不代表真機或真實交易驗收。
- 使用者要求記錄今日Dashboard及color所有改變，方便向Fun N交接；後續決定應更新最終規格及歷史記錄。
- 本次新Chat尚無新修改範圍；先回覆接上交接，等待下一步。
