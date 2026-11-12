# Section 3 — 桌面六步流程交接

整理日期：2026-10-08。最近一次介面實作及桌面驗證：2026-10-07。

本文件整理目前本地 Explorer 預覽的狀態，供後續設計與前端接手。舊版筆記保留於 `SECTION-3-HANDOFF-2026-10-07.md`；若有衝突，以本文件記錄的最新介面為準。這不是正式部署或產品規則的核准紀錄。

## 1. 整體流程

| 步驟 | 名稱 | 目前英文標題 | 示意圖狀態 |
| --- | --- | --- | --- |
| 01 | Supply | Supply once. | 已實作四張卡，含 Human／Agent 模式 |
| 02 | Allocate | One deposit. More possibilities. | 已實作四張卡，含 Human／Agent 模式 |
| 03 | Borrow | Borrow against what you hold. | 已實作三張卡，含 Human／Agent 模式（2026-10-08） |
| 04 | Earn more | Earn more for staying. | 已實作三張卡，含 Human／Agent 模式（2026-10-08） |
| 05 | Trade | Trade your market view. | 已實作三張卡，含 Human／Agent 模式（2026-10-08） |
| 06 | Protect | Run by its users. | 待實作 |

Earn more 排在 Trade 前面。後四步已有文案與導覽，但不能把六步捲動完成等同於六步示意圖完成。現有產品文案仍需在上線前核對。

## 2. 桌面捲動與導覽

- 桌面寬度從 1024px 起使用原生捲動軌道與 sticky 畫面，每個主要步驟佔一個內容視窗。
- 畫面高度扣除 64px 頂部導覽；整段保持在導覽下方。
- 向下依序前進：Supply → Allocate → Borrow → Earn more → Trade → Protect。
- 向上沿同一順序返回；從 Supply 再向上會回到星球畫面。
- 左側主要步驟與鍵盤方向鍵會對應到同一個原生捲動位置，不攔截滑鼠滾輪。
- 主要步驟的捲動，與該步驟內四張卡的自動輪播是兩套互動：捲動切換產品步驟；輪播或點選句子切換示意卡。
- 手機保留原有非固定版面，本次沒有重新設計或驗收手機版。

## 3. 文字與示意圖同步

- Description 保持簡短，最多兩句。
- 左側四句文字直接對應右側四張卡，不再保留重複的底部進度列。
- 當前句子以白色、600 字重顯示；其他句子維持灰色。
- 四句都可點選；hover 提供底線，鍵盤 focus 保留可見提示。
- 點選句子切換卡片；點選當前句子可以重播該卡。
- 文案支援英文、繁體中文與簡體中文，沿用網站語言設定。

### Supply

Description：`Deposit once and hold a yield-bearing vhToken.`

| 左側句子 | 對應卡片 |
| --- | --- |
| Compare assets and APYs | Choose：比較資產與 APY |
| Supply and receive a vhToken | Supply：存入及收到 vhToken |
| Let the Hub route your liquidity | Route：Hub 分配流向 |
| Hold your vhToken as yield builds up | Hold：價值與圖表動畫 |

CTA：`Explore Liquidity Hub` → `/liquidity-hubs`。

### Allocate

Description：`Your deposit connects to Spoke markets and vaults.`

| 左側句子 | 對應卡片 |
| --- | --- |
| Start with your Hub deposit | Hub：顯示存款與目的地連接 |
| Explore Spoke markets and vaults | Destinations：瀏覽目的地 |
| Review allocation shares and limits | Allocation：分配比例與額度 |
| Track your single Hub position | Overview：單一 Hub 持倉 |

兩個 CTA 使用同等樣式：`Explore Spoke markets` 與 `Explore vaults`。Vaults 不再冠以 fixed-term。

目前 Spoke CTA 打開本地示意的目的地資訊並暫停輪播，尚未接正式 Spoke 路由。Vaults CTA 目前直接連到 `/vaults`；正式目的地仍需產品確認。

## 4. 示意圖與播放控制

- Supply 與 Allocate 共用 `StepVisualDeck.tsx`：前卡清晰，後卡縮小、變暗與模糊，保留已接受的疊卡風格。
- Human 模式以操作介面、圖表與表格呈現；Allocate Agent 模式改成說明式問答，不模擬提交分配交易。
- 移除整個底部 Pause／Replay 區塊。
- 改成圖內單一播放／暫停 icon 按鈕，包含依語言切換的 tooltip 與無障礙名稱。
- 暫停與恢復沿用輪播狀態；離開可見範圍或切換背景分頁時暫停，保留 reduced-motion 處理。
- 卡片不再有內部捲軸，透過正常內容流與短桌面尺寸調整讓內容完整容納。
- Allocate 移除可見的 `Example allocation`、`Each source has its own allocation limit` 及多餘底部說明。
- Hub 連接圖改成單一對稱樹狀線，避免中心重複描線；三個分支均衡排列，流動線段使用一致線寬。

## 5. 資料與產品確認

- Supply 的 Hub APY、份額價格與抵押率沿用 `useTopHub.ts` 的讀取方式及 fallback；本次沒有重新驗證即時數值。
- Allocate 的 10,000 USDC、50%／30%／20% 分配，以及 60%／35%／25% 額度仍是原型示意資料，未串接即時分配資料。
- 移除畫面上的 Example 文字，不代表這些數字已成為正式產品資料。
- Allocate 文案與圖中不提 Venus Flux。Supply 舊 Route 卡仍有 Flux／Fixed Rate；與不提 Flux 的方向尚未完全一致，上線前需統一。
- 先前記錄的 `centrifuge` yield-group 解析問題仍需正式 app 前端確認；不能把預覽的容錯視為正式 app 已修復。
- Prime、Vaults、Trade 與治理的描述、可用路由及產品規則需在正式上線前確認。

## 6. 待補 Spoke 圖示

提供的檔案：`/Users/alvin/Desktop/Слой 3.svg`。

2026-10-07 未能在指定路徑讀取，也未在 Desktop、Downloads 或專案的 SVG 搜尋中找到相符檔案。因此目前仍保留既有 Spoke placeholder，沒有完成圖示替換。需要重新附上 SVG 或提供可讀取的位置。

## 7. 已完成的驗證

以下為 2026-10-07 的本地測試紀錄，並非今天重新執行的完整回歸測試：

- 1440×900：六步向下／向上原生捲動、返回星球、sidebar 導覽、sticky 畫面位置及圖內播放／暫停。
- 1280×720：Supply 與 Allocate 的 Human／Agent 各四張卡，共 16 個畫面，內容高度均完整容納，無內部捲動。
- 當前句子字重 600；卡片與句子同步。
- TypeScript、限定變更範圍的 Biome 與 Stylelint 通過。
- 沒有手機驗收，也沒有正式部署。

## 8. 主要檔案

元件目錄：`apps/evm/src/pages/Landing/VenusSteps/`。

| 檔案 | 用途 |
| --- | --- |
| `index.tsx` | 六步導覽、文案、CTA、卡片同步與主要步驟切換 |
| `useStepScroll.ts` | 原生捲動軌道、步驟索引與位置定位 |
| `StepVisualDeck.tsx` | 共用疊卡、輪播、Human／Agent 與播放控制 |
| `SupplyVisual.tsx` | Supply 四張卡與圖表 |
| `AllocateVisual.tsx` | Allocate 四張卡、連接圖、分配與概覽 |
| `copy.ts` | 六步與 Supply 的多語文案 |
| `allocateCopy.ts` | Allocate 多語文案 |
| `useTopHub.ts` | Hub 資料與 fallback |
| `styles.css` | Section 3 局部樣式、桌面固定畫面與卡片尺寸 |

本次沒有更動全域 Design Token。

## 9. 本地預覽

專案：`/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview`。

預覽網址：`http://127.0.0.1:5175/#/?chainId=56`。切換到 Explorer（E）查看此版本。

從專案根目錄啟動：

```sh
cd apps/evm
node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175 --strictPort
```

後續順序：補 Spoke SVG → 統一 Supply 的目的地文案 → 確認正式路由及數據 → 製作 Borrow／Earn more／Trade／Protect 示意圖。

## 10. Borrow（2026-10-08 新增）

三張卡，延續 Supply 的同一個持倉：$10,000 的最高 APY vhToken。

Description 沿用：`Use eligible assets as collateral to borrow another asset. Review the borrowing rate and your position’s health before you confirm.`

| 左側句子 | 對應卡片 |
| --- | --- |
| Use your vhToken as collateral | Collateral：開關切到「用作抵押品」，抵押率顯示後，可借上限從 $0 數到上限金額 |
| Borrow at the live rate | Borrow：可借穩定幣與即時借款 APY、金額欄、已用借款額度條 |
| Keep an eye on your position health | Health：已用額度百分比、綠→橙→紅的健康度條（100% 為清算）、抵押品／已借款／收益／利息、每年淨額 |

Agent 模式三段問答：

- 「可以用 vhToken 抵押借款嗎？」
- 「幫我借 4,000」：附「啟用抵押品 → 借款」兩步。
- 「我的持倉安全嗎？」：附健康度條。

資料：

- 抵押率和 Hub APY 沿用 `useTopHub.ts`。
- 借款 APY 讀即時的 Core Pool `/markets`，只取可借的市場。讀不到時退回 8 Oct 的數字：USDT 5.24%、USDC 5.16%、U 3.52%。
- `/markets` 與 Supply 的抵押率共用同一個請求（`useCoreMarkets`）。
- 借入的資產會排除抵押的同一種幣。例如今天最高 APY 是 vhUSDT（3.66%），所以借的是 USDC。
- 4,000 的借款金額是示意。

共用元件改動：

- `StepVisualDeck` 改為支援三或四張卡，張數取 `copy.screens` 的長度，原有兩步不受影響。
- `SupplyVisual` 匯出 `money`、`fill`、`useBeats`、`VhIcon`、`TxSteps`、`AgentHead`、`bubble` 給 Borrow 共用。

新檔案：`BorrowVisual.tsx`、`borrowCopy.ts`（en／zh-Hant／zh-Hans）。

驗證：

- 1280×720 下，Human／Agent 共六個畫面都完整容納，沒有內部捲動。
- TypeScript、Biome、Stylelint 通過。
- 動畫尚未在可見的瀏覽器中實測。

待確認：

- vhToken 作抵押時仍賺 Hub 收益的說法。
- 「清算從 100% 開始」：vhToken 市場的清算線等於抵押率。
- 借款入口目前連到 `/dashboard`。

## 11. Earn more（2026-10-08 新增）

三張卡：質押 XVS → 進入前 500 名 → Core Pool 市場的 Prime 加成。依產品方向，**不提 Hub 存款的 Prime 加成**。

Description：`Stake XVS for voting power and a Prime score that grows with amount and time. Each month the top 500 earn boosted rates on Core Pool markets.`

| 左側句子 | 對應卡片 |
| --- | --- |
| Stake XVS in the vault | Stake：XVS 金額從 0 數到 2,000（附美元價值），投票權同步增加；顯示「前 500 名門檻」（即時） |
| Climb into the top 500 | Rank：Prime 第 N 週期與剩餘天數（即時）；排名從約 #1,858 爬到 #430，已質押天數 0 → 45；排名條右側藍色區段代表前 500 名 |
| Earn boosted rates on Core Pool markets | Boost：Core Pool USDT 存款 APY + Prime 平均估算加成（兩段長條）；本週期 Prime 獎勵總額 |

- 拿掉了原本的「Fixed-term vaults」。
- 新增第二個 CTA：`Prime calculator` → `/prime-calculator`。

Agent 模式：三段問答，分別是「怎樣賺更多」「怎樣拿到 Prime」「Prime 給我甚麼」。

即時資料：

- 從 `api.venus.io` 讀取：`/prime/minimum-stake`、`/prime/cycle/current`、`/prime/leaderboard`，以及共用的 `/markets`。
- 8 Oct 的即時數值：
  - 名額 500，第 500 名約 1,044 XVS。
  - 排行榜共 4,222 人。
  - 第 4 週期（10/1–11/1）。
  - 本週期 Prime 獎勵約 $51,624。
  - XVS ≈ $3.13。
  - USDT 存款 3.67%，Prime 平均估算加成 +0.12%。
- 讀不到時退回上述數字。

示意資料：

- 質押 2,000 XVS。
- 排名爬升的過程和 45 天。

核對過的規則：Prime 分數等於「質押量 × 質押秒數」。用 API 的 effective stake ÷ staked 驗證，結果約為質押天數。

注意事項：

- 預覽 repo 的 `useGetPrimeEstimation` 是假資料，所以 Boost 卡改用 `/markets` 的 `estimatedPrimeSupplyApyBoost`，並標示「平均估算」。
- 個人的實際加成可能更高，需要用正式的 Prime 計算器確認。

新檔案：`EarnVisual.tsx`、`earnCopy.ts`、`usePrime.ts`。

- `useTopHub.ts` 的 `useCoreMarkets` 新增：存款 APY、Prime 加成、價格。
- `BorrowVisual.tsx` 匯出 `useProgress` 給 Earn 共用。

驗證：

- 1280×720 下，Human／Agent 共六個畫面都完整容納。
- TypeScript、Biome、Stylelint 通過。
- 動畫尚未在可見的瀏覽器中實測。

## 12. Trade（2026-10-08 新增）

參考 venus.io 的 Trade 頁面操作流程：

1. 選做多和做空的代幣。
2. 放入抵押品（例如 USDC），選槓桿。
3. 系統借入做空的代幣，換成做多的代幣並存入。
4. 查看開倉價、清算價、淨 APY、健康因子。
5. 之後可以加倉、減倉或平倉。

示意情境：用 1,000 USDC 開 2x，做多 WBNB、做空 USDT，也就是看漲 BNB。

| 左側句子 | 對應卡片 |
| --- | --- |
| Pick a pair and a direction | Pair：Long／Short 標籤、WBNB/USDT 即時價格、平穩的價格線、WBNB 存款 APY 與 USDT 借款 APY |
| Set collateral and leverage | Open：槓桿選 2x，USDC 抵押品從 0 數到 1,000，做多與做空兩邊數上去，下方顯示開倉價、清算價、淨 APY |
| Watch PnL and the health factor | Position：價格上漲 8% 的過程中，盈虧與健康因子同步變化；圖上標出開倉價線和清算價線；加倉／減倉／平倉三個標籤 |

Description：`Pick what to long and what to short, add collateral and choose leverage. Venus borrows the short asset and swaps it into the long one for you.`

計算方式（示意模型，未經正式合約試算）：

- 部位大小 = 抵押品 × 槓桿 = $2,000。借入同等價值的 USDT。
- 健康因子 = (USDC × 清算線 + 做多部位 × 清算線) ÷ 借款。
- 清算價 = 健康因子剛好等於 1 時的價格。
- 淨 APY = (做多部位 × 存款 APY + 抵押品 × 存款 APY − 借款 × 借款 APY) ÷ 抵押品。

8 Oct 的數值：

- WBNB 價格 $769.70。
- 清算線：USDC 82.5%、WBNB 80%。
- 開倉時：健康因子 1.21，清算價約 $565，淨 APY −6.84%。
- 上漲 8% 後：盈虧 +$160，健康因子 1.28。

即時資料：價格、存款／借款 APY、清算線都來自 `/markets`。`useCoreMarkets` 新增了 `liquidationThreshold`。

示意資料：1,000 USDC、2x、上漲 8%、價格線形狀。

待確認：

- 正式 Trade 的「2x」是否等於「借入 = 抵押品 × 2」。程式中最大借款 = 未使用抵押值 × 槓桿，方向一致，但未逐項核對。
- 開倉是否為單一交易。文案已避免寫「一筆交易完成」。

新檔案：`TradeVisual.tsx`、`tradeCopy.ts`。

驗證：

- 1280×720 下，Human／Agent 共六個畫面都完整容納。
- TypeScript、Biome、Stylelint 通過。

## 13. 整體優化（2026-10-08）

結構：

- 移除 06 Protect，Section 3 收成五步：Supply → Allocate → Borrow → Earn more → Trade。
- 治理和安全移到 Section 4（尚未製作）。

Supply：

- 拿掉 Route 卡，改為三張卡：Choose、Supply、Hold。
- 分配的故事只由 Allocate 講，因此 Flux／Fixed Rate 的命名衝突一併消失。

標題（en／zh-Hant）：

| 步驟 | en | zh-Hant |
| --- | --- | --- |
| Supply | Supply once. | 存一次就好。 |
| Allocate | Reach every market. | 連接每一個市場。 |
| Borrow | Borrow without selling. | 不用賣出也能借款。 |
| Earn more | Earn more for staying. | 留得越久，賺得越多。 |
| Trade | Trade your view. | 交易你的觀點。 |

- Description 全部收成一句。
- 不額外加白話解釋，改由動畫交代專有名詞。

Human／Agent：

- 改成整段共用的一個切換，放在段落標題右側，透過 `visualMode.ts` 的 context 傳給每個 deck。
- Agent 模式下，主要按鈕變成「Set up Agent skills」→ `/skills`，原本的 CTA 改成文字連結。

自動輪播提示：

- 左側「目前那句」下方加一條細進度線，時間與卡片停留時間一致。
- 暫停時進度線停住，恢復後重新開始。

CTA：

- 每步只有一個主要按鈕，其他改為文字連結。
- Borrow 的 CTA 改連 Core Pool 市場頁：`/markets/0xfD36…8384`。

數字主打：

- Trade：開倉卡的「淨 APY」改為「USDT 借款 APY」。
- Earn：Boost 卡改為主打「本週期 Prime 獎勵約 $51,624，由前 500 名分享」，利率加成放到次要位置。

之後交給 FE 處理：

- 全段統一主角和金額，例如同一筆 $10,000、同一種幣，可以做成設定檔。

驗證（1440×900）：

- 五步的文案、卡數、進度線、CTA 層級都正確。
- Agent 切換在不同步驟之間會保留，CTA 也會切換。
- TypeScript、Biome、Stylelint 通過。

