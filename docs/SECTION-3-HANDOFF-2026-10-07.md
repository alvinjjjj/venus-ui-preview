# Section 3「Venus 怎樣運作」：目前做了什麼（2026-10-07）

範圍：只改 Explorer（E）模式，New（v5）和 Original（v1）沒有動。先做 desktop 版，所有改動都**未 commit**。
預覽：`http://127.0.0.1:5175/#/?chainId=56`（`cd apps/evm && yarn start --port 5175`），切到 E 模式。

---

## 1. 結構

- 取代原本的 `ProductOrbit` 草稿（檔案仍在 repo，但沒有渲染）。`pages/Landing/index.tsx` 在 E 模式改為渲染 `<VenusSteps />`。
- 版面跟 hero 一樣的左右邊距 `max(5.75vw, 24px)`，滿寬，不用 1280 的 Wrapper。
- 高度一個畫面（`calc(100svh - 64px)`，最少 680px）。
- 三欄：
  - 左：步驟導覽 01–05（tablist，可用方向鍵切換）
  - 中：文案
  - 右：UI 示意圖
- 六個步驟：Supply / Allocate / Borrow / Earn more / Trade / Protect，每步有自己的 CTA 連結。目前 **01 Supply** 與 **02 Allocate** 有示意圖，其餘顯示「示意圖製作中」。

## 2. 字型與顏色規則

- 全頁只用一種字型。標題用細體（400），段落標題 `clamp(36px, 3.33vw, 48px)`。
- 大標題全白，標題字逐字浮入。
- 只有目前步驟的標題（例如 **Supply once.**）是藍色：
  - 粗體 600。
  - 藍色漸層流光持續循環（4.5 秒）；系統開了「減少動態」時改為靜態漸層。
- 按鈕 8px 圓角，不用全圓角；用 New 的玻璃材質和 repo 的 `Icon`。

## 3. 捲動

- 第 2 → 第 3 段之間加了 scroll snap（`proximity`），並在第 3 段開頭和第 2 段的結尾加上 `scroll-snap-stop: always`。
- 效果：捲過去要多用一點力，第 3 段會剛好對齊畫面；往回捲會停在第 2 段的最後一格。

## 4. Step 01 示意圖（`SupplyVisual.tsx`）

### 4.1 版面：四張卡片疊放

- Choose → Supply → Route → Hold 四張卡同時出現，斜向往右上疊。
- 最前面那張清楚；後面的卡逐層縮小、模糊、變暗。
- 自動輪播並循環，每張停留：Choose 2.6 秒、Supply 4.2 秒、Route 5.2 秒、Hold 6.4 秒。
- 點後面的卡或下方進度條，可以把那張拉到前面。
- 卡片外框用系統 `Card`。
- 上方切換「Human / Venus AI Agent」（中文暫定：親自操作 / Venus AI 代理）。

### 4.2 四張卡的內容

| 卡 | 內容 | 用到的系統元件 |
| --- | --- | --- |
| 01 Choose | Hub 三個資產依 APY 排序，第一名標「最高 APY」，每列附 Spoke 曝險圖示 | `TokenIcon`、`YieldGroups` |
| 02 Supply | 金額從 0 數到 10,000；「你會收到 $10,000.00 of vhUSDC」，匯率 `1 vhUSDC ≈ 1.00 USDC`（2 位小數）；授權 → 存入兩步 | `TokenTextField`、`TokenIcon`（vhToken 圖） |
| 03 Route | 你 → Liquidity Hub → 三個 Spoke（Core 55% / Flux 30% / Fixed Rate 15%，**示意比例**）；1px 細線，一道柔光沿線走；Spoke 用統一的 8px 圓角方塊圖示 | `ProgressBar`（細分配條） |
| 04 Hold | 「一年後的價值」從 $10,000.00 用 ease-in-out 數到一年後的金額，同時畫線（底線、季度虛線、跟著跑的發光點、「今天 / 一年後」）；標籤「可作抵押 · 82.5%」「不用領取」 | `TokenIcon` |

- 原則是**先講價值，不講份額**：份額數量已從畫面拿掉，避免看起來像「錢被換走」。
- Agent 模式用同一疊卡片：
  - 01：你的提問加上 Agent 的推薦（用即時利率）。
  - 02：先授權，再存入。
  - 03、04：與 Human 共用，Hold 多一句完成訊息。

### 4.3 資料（`useTopHub.ts`）

- **利率、份額價格和分配直接讀正式 API**：
  - `https://api.venus.io/liquidity-hub/hubs?chainId=56`
  - 用 `formatToLiquidityHub` 轉換，再用 `getCombinedApy` 計算 APY，跟 Hub 頁的排序方式一樣。
  - 原因：preview repo 的 `getLiquidityHubs` 讀的是 11 Sep 的快照，會跟 Hub 頁不一致。
- **抵押率讀即時的 Core Pool 市場**（`/markets?chainId=56`），用 vhToken 地址對應。目前：
  - vhUSDC 82.5%
  - vhUSDT 80%
  - vhU 75%
- 讀不到時退回 7 Oct 的數字，不會退回舊快照：
  - USDC 3.71%、USDT 3.58%、U 1.78%
  - 抵押率同上
- 目前排第一：**USDC ≈ 3.72%**。
- 金額 10,000 和 Route 的分配比例是示意，底部註明「金額與分配為示意 · 利率即時取自 Hub」。

## 5. 給 FE 的發現（重要）

- 正式的 USDT Hub 有一個 yield group 是 `kind: 'centrifuge'`，preview repo 沒有這個類型的資料。`formatToLiquidityHubYieldGroup` 遇到它會報錯，**整個 Hub 列表因此讀取失敗**。
- 示意圖已經自己處理：先略過不認識的類型，單一 Hub 出錯只略過那一個。
- 正式 app 很可能有同樣的問題，建議 FE 檢查。
- 抵押率：vhToken 的 Core Pool 市場不可借款，清算線等於抵押率，所以借滿到上限就剛好在清算線上。

## 6. 檔案

`apps/evm/src/pages/Landing/VenusSteps/`

- `index.tsx`：段落、導覽、文案面板、CTA
- `SupplyVisual.tsx`：Step 01 的卡片疊放與四張卡、Agent 版本
- `useTopHub.ts`：即時 Hub 資料、抵押率、備用數字
- `copy.ts`：en / zh-Hant / zh-Hans 文案（ja / vi / th / tr 退回英文）
- `styles.css`：全部樣式，包含 scroll snap

另外：`pages/Landing/index.tsx`（改為渲染 VenusSteps）、`pages/Landing/explorer-typography.css`（E 的單一字型規則）。
文件：`docs/SECTION-3-VENUS-STEPS-DRAFT.md`（六步流程表和各版筆記）。

檢查：tsc、biome、stylelint 全部通過。

## 7. 還沒做 / 待確認

- Step 02–06 的示意圖。
- Mobile 版。
- 中文模式名稱：親自操作 / Venus AI 代理，待確認。
- Prime 在 Hub 的說法，需跟產品確認。
- 「Active markets」用 66（可存入）還是 44（可存可借）。
- 待在可見的瀏覽器裡實測：重新整理後自動輪播、Hold 的動畫、新的圖示樣式。


## Allocate draft — 2026-10-07

- Order: 01 Supply / 02 Allocate / 03 Borrow / 04 Earn more / 05 Trade / 06 Protect.
- Allocate headline: “One deposit. More possibilities.” EN / zh-Hant / zh-Hans.
- Four centred stacked cards: Hub → Destinations → Allocation → Overview. Same accepted deck styling as Supply; playback is reusable in `StepVisualDeck.tsx`.
- Destinations: Venus Core, Spoke Markets, Fixed Term Vaults. No Flux in Allocate copy or visual. Spoke is included on Alvin’s premise that it ships before the website.
- Mock-up scenario: 10,000 USDC, allocation 50% / 30% / 20%, share limits 60% / 35% / 25%. These are illustrative, not API values or confirmed governance limits. The numeric cards say “Example allocation”.
- Human / Agent modes; Agent explains the allocation rather than pretending to submit transactions. Pause/play, replay, individual card selection; background and reduced-motion cards show settled values. Playback pauses offscreen and when the document is hidden.
- CTA 1 opens the Spoke destination details inside the preview and pauses the deck. There is no dedicated Spoke route in this checkout yet; connect the production route when available.
- CTA 2 opens `/vaults?venue=institution`, the existing institution-filtered fixed-term vault list.
- New files: `AllocateVisual.tsx`, `StepVisualDeck.tsx`, `allocateCopy.ts` alongside `SupplyVisual.tsx`. Scoped changes in `copy.ts`, `index.tsx`, `styles.css`.
- Supply’s existing four cards remain intact in this change. Moving its Route card to Allocate was discussed but not performed as part of this draft.


### Latest approved desktop refinement

Supply and Allocate now share a deck controller; the four left sentences are clickable and light up with the active visual card. The duplicate lower progress strip is removed. Descriptions are shortened, Allocate CTAs have equal styling, and Vaults is no longer qualified as fixed-term. Allocate Human mode uses direct diagrams and tables; Agent mode uses an explanatory question/answer summary. Header overlap and bottom clipping are fixed with normal-flow card content and short-desktop sizing. See `SECTION-3-VENUS-STEPS-DRAFT.md` for current copy, routing and verification. Final Spoke icon and production route are pending.


### Latest revision — pinned six-step desktop flow

- One native-scroll viewport per major step in a sticky stage: Supply → Allocate → Borrow → Earn more → Trade → Protect. Reverse scrolling returns through the same order to Supply and then the asset orbit. Sidebar and arrow-key navigation seek the same scroll positions; no wheel interception. Mobile retains the existing non-pinned layout.
- Removed the lower Pause/Replay section. A single accessible icon button in the illustration toggles Play/Pause; its tooltip and aria-label follow the site language. Clicking the current left sentence can replay that card.
- Active synchronized sentence is bold (600) and white; inactive sentences stay muted, with a pointer and underline on hover.
- Card bodies no longer scroll. Reclaimed footer space lets all four Supply and Allocate cards fit completely, including Agent views, at 1280×720.
- Allocate no longer displays “Example allocation”, the allocation-limit footer or the Hub's explanatory footer. Amounts and limits remain illustrative prototype values in source, not a live allocation feed.
- Hub tree uses one symmetric connector path; it avoids repeated strokes at the junction. The moving trace uses a consistent non-scaling stroke.
- Spoke SVG supplied as `/Users/alvin/Desktop/Слой 3.svg` was unavailable at that path and was not found among SVGs in Desktop, Downloads or project folders. Existing placeholder retained until the file is available; do not describe it as replaced.
- Browser acceptance: real mouse scrolling advances all six steps, reverses all six and returns to the asset orbit. Sticky stage stays below the 64px navigation. Human and Agent card heights were checked at 1280×720; every card's scrollHeight equals clientHeight. Active font weight is 600. TypeScript, scoped Biome and scoped Stylelint pass. This is local preview work.
