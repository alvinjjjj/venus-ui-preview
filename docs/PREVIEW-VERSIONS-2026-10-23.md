# Preview / Before：E / E2 / E3

## 2026-10-26：Final（原 E2）市場主卡短單層陰影

- 使用者確認中間市場大卡要加返輕微浮起感。實看發現 Final Light 另有較後的雙層 `--e-light-shadow-panel` 覆寫，並非所有狀態都沒有陰影；已向使用者更正前一次僅根據前段樣式的判讀。
- 只替換 Final 精確 variant 的主卡陰影，列表／來源／inline step 共用單層 `0 4px 12px -4px`：Dark 黑色 18%，Light 沿用現有冷灰色 10%。距離重用 spacing scale，沒有新增全域 token。移除 Final Light 原本雙層覆寫；Test／legacy E2、E／E3、星球 APY 彈卡、獨立交易彈窗與材質不變。
- 桌面實測 Light / Dark 及 USDT 來源頁均得到指定單層值，沒有修改排版、利率或交易邏輯。3 項新增樣式測試及 2 項既有陰影回歸測試通過，格式及 diff 檢查通過；未重跑整個專案 TypeScript（此次只有 CSS／樣式測試變動）。
- 390px 窄畫面另發現主容器橫向偏移（container x240、卡 x260 / width346，root 隱藏水平溢出），此輪未擴大更動既有佈局，不能宣稱手機版驗收通過。桌面已還原正常尺寸及 Light。
- 僅本地更新，未 commit / push / 部署，未連錢包或交易；此項取代舊版 Final Light 主卡雙層陰影設定。

## 2026-10-24：E2 星球 APY 磨砂卡／Earn now

- 使用者修訂方向：保留同款漸變星球，但允許點擊查看 APY，作為表格以外的 Earn 入口。E2 六個星球改為有可存取名稱的 button；hover / focus / 開啟時清晰顯示，仍沒有新增持續動畫。E3 原有星球與流程不改。
- 卡片直接組合現有 `Dropdown`、`Card`、`Icon`、`TokenIcon`、`PrimaryButton`，磨砂材質來自既有 `venus-dropdown-surface`：125° 反光漸變、12px / 120% blur、8px 圓角與原有 Light 白色玻璃。只補局部間距／字級，沒有新增色票或另一套 panel 材質。CTA 用既有 `blue-glass`，內容只有 token、Supply APY、關閉及 Earn now。
- APY 使用與主列表完全相同的 `formatEarnApyRange`，多市場顯示範圍；不把 APY 改叫 APR、不估算新利率、不把條件式 Prime 模擬加進去。無有效利率顯示破折號，缺少／不適用 token 不建立捷徑。星球來源沿用 `isVisibleLiteAsset` 過濾。
- Earn now 只將既有 marketTab 切到 Earn 並選中同一 LiteAsset，進入原市場比較／選擇；從 Borrow 頁點亦回到 Earn，沒有自動挑最高 APY 市場、連錢包或交易。關閉／按外面不改市場狀態，Escape 由原 Dropdown 還焦點至星球。
- 重用 Dropdown 的 portal、左右對齊、上下翻轉、視窗邊界與 click-away；開卡聚焦關閉掣，Tab 離開卡會收起。桌面保留點擊入口；1280px 以下以既有 breakpoint 卸載整組，連開著的 portal 也移除，不遮手機／平板列表。星球層 pointer-events none，只有觸發按鈕可點。
- Impeccable 一致性檢查用於選擇現有磨砂元件、清楚區分 APY 與行動，以及避免擴大交易範圍。手動已驗證 1920px Dark、1280px Dark / Light、390px Light：USDT / USDC APY 與表格一致、Earn now 路由正確、Escape 還焦點、右側避邊、縮窄移除 portal，無水平溢出。79 項相關測試、TypeScript、格式與 diff 檢查通過；首輪受到環境負載及測試 observer／退場時機影響，補齊測試支援後單工重跑，各項均在 5s 內完成。既有 Borrow 預覽 Tabs 的重複 key 警告未擴大處理。
- 本地試稿，未 commit / push / 部署，未連接錢包或交易；此項取代下方「星球純背景／無 APY 入口」設定。

## 2026-10-24：E2 漸變 icon 星球試稿

- 使用者要求借用 E3 星球概念，試用 E2 現有 gradient token icon；表格已有 APY，因此這次星球只做背景，不再加入 APY popover、按鈕、供應捷徑或交易動作。E3 原有互動星球完全不改。
- 新增 E2-only `TokenPlanetBackdrop`，以頁面已有 token 資料挑選 USDT / USDC / sUSDe / DAI / BTCB / ETH；直接使用與主列表相同的 `getE2ListToken` SVG，不重繪球體、不改共享 token 資料、不加圖片生成或額外查詢。缺少 token 就不顯示，重複市場不重複畫星球。
- 借用 E3 近大遠細與兩側構圖，保留 E2 的冰藍地平線及中間操作區。USDC / DAI 加細星環，遠景降低透明度及輕微 blur；Light 整層再淡化。裝飾置於內容後方、pointer-events none、aria-hidden，沒有焦點或 hover 狀態；保持靜態，不加持續動畫循環。1024px 以下及 forced-colors 收起，不佔手機市場高度。
- Impeccable 一致性檢查促成重用同一套圖示與集中 APY 的選擇，沒有改 Design Token、表格、文字、置中分組或 Earn / Borrow 行為。
- 驗證：73 項相關測試、TypeScript 及元件／測試格式檢查通過。1920×1080 Dark 六張 SVG 均成功載入，原操作組仍 y277；1280×800 Dark / Light 的 Earn / Borrow 可操作、無水平溢出，Light 背景 opacity .42；390×844 Light 背景隱藏、標題／副標題與市場捲動保留。沒有連接錢包、交易、commit / push / 部署；目前是本地試稿，等待使用者評估。

## 2026-10-24：E2 加回副標題／高屏操作區置中

- 按最新要求，在 Universal Money Markets 正下方恢復原句 `Simple yet powerful lending and borrowing for any DeFi yield strategy.`，使用既有 16px / 24px 字級，標題至副標題 4px。只限 E2；E3 目前仍不顯示副標題。
- 新增小型呈現容器 `LiteMarketStage`，只在 E2 包住統計及原市場 section，其他版本回傳 Fragment、保留原 DOM。統計移出 hero，與列表／來源／當前市場步驟保持 12px 同組間距。
- E2 桌面父級改用三列 grid：上、下對稱彈性空間，中間為操作組；標題留在上列頂部。沿用現有 header / footer 分出的可用高度，不新增 100vh、固定 top 或 transform 置中。較矮視窗先收回空白，列表保留內捲動；loading 最小高度亦受現有可用空間限制。手機仍是自然 flex 排版，不增加上下置中空白。
- Impeccable 的版面／機械檢查用於確認分組、視線順序及短屏邊界；沒有改色票、玻璃材質、字體、交易邏輯或 E / E3 視覺。
- 驗證：72 項相關測試、TypeScript、格式與 diff 檢查通過。1920×1080 Dark 標題 y80、副標題 y156，統計＋市場組 y277 / 高518、中心 y536（畫面中心 y540）；統計到主框 12px。390×844 自然排列、副標題完整、無水平溢出；1280×720 Borrow 組 y192 / 高428，表身可內捲動，Footer 保留。Light 的 Borrow 來源與 USDT Core 供應彈窗亦已檢查，未交易；不把桌面窄 viewport 說成實機觸控測試。
- 只在本地，未 commit / push / 部署。此項取代先前 E2 移除副標題及統計固定上排的位置設定。

## 2026-10-24：E2 Borrow 同步 Earn 視覺

- 使用者確認同步列表／來源頁／Collateral、Loan、Borrow、Repay 視覺；USDC 火焰與長駐繞框只留 Earn。抽出 `LiteMarketAction`，Earn / Borrow 共用既有黑底框、普通字重及 hover / focus 的 Pro 藍色繞框；不新增動畫。`promoted` 同時受 Earn action 條件限制，Borrow 不會誤開推廣。
- E2 Borrow 主列表沿用 Loan / APY / Liquidity / Total Borrow 四個資料欄，在最後加 Borrow 動作。與 Earn 共用緊湊欄距、APY 桌面 14px / 手機 12px 加粗、Liquidity normal 400 及 hover 框內左右 16px 留白；Borrow 字較長，獨立保留 72px 按鈕／120px 桌面動作欄，避免沿用 Earn 尺寸後出現省略號。其他版本保留原四欄。
- 借款來源保留 Yield / APY / Liquidity / Collateral / Total Borrow 五欄及原來排序／市場選擇；預覽來源明示 `Preview · Not tradable`。真實 Core 表單的借款、還款、抵押、利率與風控條件不變；預覽彈窗明示不可交易，Borrow / Repay / Collateral 操作仍停用。
- 獨立表單只在 E2 借款彈窗加 scoped class，Dark / Light 均 8px 圓角、無外投影，沿用既有字體／分隔線 token。沒有改全域 token、交易流程或其他版本。Impeccable 的一致性檢查用於共用控件與層次，不另造視覺配方。
- 驗證：96 項相關測試及 TypeScript 通過，新元件／測試格式及 diff 檢查通過。1280px Dark 列表的 Borrow 按鈕實測 72px／normal 400，動作欄 120px，沒有水平溢出或推廣標記；來源五欄、Core Borrow / Repay / Collateral 及不可交易預覽已實看。390px Light 列表按鈕 72×44px、來源無水平溢出，Core 彈窗寬 358px／8px 圓角／無投影。這是桌面窄 viewport 檢查，不是實機觸控測試。
- 既有共用 Tabs 的 ReactNode title key 警告仍會在預覽表單切頁測試出現，沒有擴大改動共用 Tabs。只在本地，未 commit / push / 部署，未連接錢包或發送交易。

## 2026-10-24：E2 火標記 USDC Earn 長駐 Pro 繞框

- 使用者要求有火的 USDC Earn 不需 hover，持續播放 Pro 同款動畫。只為 E2 的 USDC 主列表動作加入 `data-promoted=true`，長駐黑底、藍邊及既有 `venus-mode-border-orbit`（4.5s / linear / infinite）；不新增 keyframes 或改其他 token。Earn 平時仍 normal 400，hover / focus 才加粗，沿用先前要求。
- 抽出現有火焰的 `observePromotedMotion` 可視範圍 / 分頁隱藏管理，火焰行為不變。USDC Earn 的實際 border 透過 React 19 ref cleanup 個別觀察桌面與手機副本；離屏 / 隱藏分頁暫停，回到畫面才播放，沒有每幀 React state。既有 reduced-motion 將動態改靜態藍邊，forced-colors 後備不變。
- 右上角 Pro 原本已持續循環，沒有另改共用導航樣式；實測與 USDC Earn 同時為 running，兩次觀察角度分別有變化。其他 token 的 ring opacity 0 / paused，仍然只由 hover / focus 啟動；交易與市場資料不變。
- 驗證：58 項相關測試、TypeScript、格式及 diff 檢查通過。1280px Dark 在 USDC 無 hover 時 opacity 1 / running，其他動作 paused；390px Light 離屏 y1263.5 時 paused，搜尋 USDC 後進入畫面 y617.5 時 running，按鈕維持 44px，無水平溢出。沒有連接錢包或發送交易。
- 只在本地，未 commit / push / 部署。

## 2026-10-24：E2 統計接回 Components 滑鼠追光磨砂

- 使用者補充所指是滑鼠移動時跟隨指標的 Components 玻璃反光，不只是靜態 backdrop blur。檢查發現共用 `updateLight` 只明確 opt-in E3 統計；E2 雖有同款 radial-gradient / hover 淡入 CSS，未寫入 `--glass-x` / `--glass-y`，因此光感停在中央。
- 在既有被動 pointermove / pointerdown handler 為 E2 兩個統計框加入明確 opt-in，與 E3 沿用同一條路徑；沒有新增全域 listener、React 逐幀 state 或另一套視覺配方。其餘 Lite 控件及 Earn 的 Pro 藍色繞框排除規則保留。
- 統計仍是資訊框，不加 role=button、tabindex 或點擊動作；數字、整數格式、8px 圓角、原有 reduced-motion CSS 及表面材質不變。移開由原有 260ms CSS 將光層淡至 0。
- 驗證：66 項相關測試與 TypeScript 通過。1280px Dark 實測 Supply 框指標位置由 x130→239px，Liquidity 框 x16px；hover 框 opacity 0.65，另一框 0。390px Light 以滑鼠驗證 x8px / opacity 0.65，無水平溢出；未將桌面縮窄測試誤稱為實機觸控測試。新測試覆蓋 E2 / E3、兩框獨立、卸載清理、O / New / E 不 opt-in 及 Earn 不受影響。
- 只在本地，未 commit / push / 部署，未連接錢包或交易。

## 2026-10-24：E2 統計跟 E3 整數 / 玻璃，另議數字更新方式

- E2 inline totals 改成完整整數美元，不顯示尾後兩位小數，沿用 E3 的 ROUND_DOWN 顯示方式。`decimalPlaces` 與 rolling digits 選項分開：保留底層 cents 精度及原本千元級慢速展示偏移，沒有為了整數而開啟 E3 的逐位滾動或五秒隨機更新。E3 現有動態及其他頁面的縮寫金額不變。
- E2 / E3 的統計玻璃底、12px / 130% blur 及 8px 圓角原本已一致；E2 金額補上與 E3 相同的 semibold 600 字重。保留綠黃標記、hover 光感、間距及非按鈕語意。
- 前一項頂部橫帶修正亦已驗證：透明導航原本透出 body 舊底色 `rgb(24 26 32)`，與 page 的 `rgb(16 18 24)` 不同。僅在 E2 Lite 的 root 底層重用 `--color-background-active`，Dark / Light 與內容區一致，沒有重加 header 背景或改全域 token。
- 新動畫仍只是建議，未實作：「局部淡換」，保持未變動位與逗號不動，變動位短暫淡入、不上下捲，約 20–30 秒才更新一次。待使用者確認；目前仍為原本慢速升跌展示，不是即時市場數據。
- 驗證：69 項相關測試、TypeScript 及 diff 檢查通過；1280px Dark / 390px Light 已實看，整數金額、字重 600、12px blur / 8px 圓角正確，無水平溢出，頂欄與頁面底色一致。只在本地，未 commit / push / 部署，未連接錢包或交易。

## E2 主框不留投影 / 標題再提高

- 按最新回饋，連短單層陰影也取消：E2 列表、來源選擇及 inline 表單框在 Dark / Light 均為 `box-shadow: none`，保留原本表面及邊線。統計框玻璃、控件及獨立彈窗不受影響。
- 主標題再上移一個既有 spacing（4px）：container 頂部 padding 改 0，hero gap 同時由 20→24px 作補償，因此統計及主框位置保持不動。1280px Dark 實測 title y80、totals y176、frame y224。
- 40 項 E2 / Light 樣式測試通過。1280px Dark 與 390px Light 檢查無水平溢出，主框實測 shadow none，手機標題完整。只在本地，未 push / 部署；此項取代下方單層淡影設定。

## E2 取消頂欄磨砂 / 拉開標題層次 / 減淡框影

- 按最新回饋移除最頂 Logo / Connect Wallet 導航列的底色、兩種 backdrop-filter、底線及陰影；Light 與不支援 blur 時亦不再補回磨砂底。導航高度仍為 80px，Logo / 控件尺寸、層級及 forced-colors 的 Canvas 後備保留。
- 只在 E2 把 container 頂部 padding 8→4px，hero gap 8→20px，沿用既有 spacing scale。1280px 實測主標題 y88→84，統計 y168→176，市場框 y216→224；統計至市場框仍為 12px，標題大小不變。
- 主列表 / 來源選擇 / inline 表單的框影限定在 E2 覆寫：原本長距離雙層黑影改成單層 `0 4px 12px -4px`，Dark 12%、Light 用現有冷灰色 7%。不改統計框玻璃、表面、邊線、圓角或獨立彈窗。
- 驗證：54 項 E2 / Light / CTA 回歸測試及測試檔格式 / diff 檢查通過。1280px Dark、390px Dark / Light 實看無水平溢出，頂欄實測 transparent / blur none；列表與 USDT 來源框實測淡陰影。USDT Core 目前沿用原有獨立彈窗，僅開啟後關閉，未連接錢包或交易；未將此狀態誤報為 inline 表單視覺測試。
- Impeccable 的節奏檢查只用於間距與深度微調，保留既有視覺系統與其他版本。只在本地，未 commit / push / 部署；此項取代下方「透光頂欄」設計。

## E2 冰藍地平線 / Soft-glass / 透光頂欄

- 使用者已確認 EV 指 E3，直接在 E2 做不同風格，不另開 E4。借用 E3 的星塵深度，改成低位冰藍霧光及弧形地平線；不複製 E3 的紫色邊緣星雲或流星。E2 Dark 移除舊直線光束，重用既有星塵 renderer，沒有增加 canvas 或持續動畫。Light 保留原本稀疏環境背景。
- 兩個統計資訊框改用 E3 最新 soft-glass 材質：12px blur / 130% saturation、現有 surface alias 及柔和內反光，hover 淡入局部光感。保留 E2 的 8px 圓角、36px 高度、綠黃標記、完整金額及既有慢速模擬跳數；不是可點擊按鈕，不增加焦點或交易動作。
- 按最新要求再次移除整句 `Simple yet powerful…`。E3 同時進行中的副標題移除及 inline totals opt-in 保留，沒有回復或覆蓋其他版本的工作。
- 使用者確認 header 是最頂 Venus Logo / Connect Wallet 導航列。只限 E2 Lite 頁，改為半透明底及 12px / 120% blur，取消重陰影；Dark 底色 52%、Light 72%，保留 80px 高度、Logo、按鈕尺寸及選單層級。沒有修改全域 token、Pro 頁或其他預覽版本；不支援 blur / forced-colors 時有實色後備。
- 驗證：79 項相關測試、TypeScript、測試檔格式檢查及 diff 檢查通過。1280px Dark、390px Dark / Light 已實看，無水平溢出，標題完整，導航仍為 80px。統計框實測 8px 圓角 / 12px blur，只有被 hover 的一框光層為 0.65，另一框為 0，沒有高度變動。reduced-motion、窄畫面背景後備及 E3 隔離另由測試覆蓋，未宣稱實機模擬。
- 只在本地預覽，未 commit / push / 部署；未連接錢包或發送交易。此項取代下方「背景版本待確認」狀態。

## E2 跳數放慢 / 移除可見模擬標示（背景版本待確認）

- 按使用者要求移除畫面上的 `Preview · Simulated values` 文字及其空白列；保留讀屏群組的模擬說明。仍僅是本地展示，不是實時協議數值，不改查詢、錢包或交易資料。
- 每段改為 60s：15s 靜止，再以 45s easing 推進；只以整 $1,000 為步階，展示偏移範圍約千至萬美元。個位 / 百位 / 小數沿用基準，不再每幀不停跳尾數。保留上下走勢、離屏 / 分頁暫停、reduced-motion 靜態與清理。
- 24 項針對測試通過；1280px 實測基準 `$1,659,795,776.68` 之後緩變為 `$1,659,797,776.68`，另一欄反向變化，尾數 `.68` / `.16` 保持不動，沒有可見模擬標示或水平溢出。
- 已讀取 E3 最新邊緣星雲 / 星塵 / 流星背景與 soft-glass hover 材質；尚未套入 E2 或開 E4。已向使用者確認「EV」是否指 E3，以及直接套 E2 或另開 E4，避免覆蓋錯誤版本。只在本地，未 push / 部署。

## E2 主副標題 / 緊湊統計 / 模擬跳數

- 使用者確認今次加回副標題。E2 主標題採參考圖的 Proxima Nova Regular：桌面 60px、手機保留 40px；Gradient A 不變。原句置中、16px / 24px leading，與主標題相隔 4px。
- 數據欄改為 36px 高、欄間 8px，保留 8px 圓角磨砂與綠黃小點；統計區與市場框實測相隔 12px，hero 分組間距 8px。沒有更改 E / E3 的標題佈局或全域 token。
- 使用者選擇先看模擬升跌。只在 E2 inline totals 顯示 `Preview · Simulated values`；新增 `SimulatedMarketTotal` 在既有總額上施加小額展示偏移，2.4s 平滑過渡、3s 一段、方向有上有落。金額固定兩位小數與 tabular numerals，避免尾數為零時跳位；不寫入 query cache、APY、餘額、交易表單或鏈上資料。
- 離屏及隱藏分頁停止排程，恢復時不跨過暫停時間；reduced-motion 顯示靜態基準，已知零值保持零，卸載清理 frame / observer / listeners。未載入時保留原破折號。
- 62 項 totals / motion / E2 / Light 測試、TypeScript 與格式 / diff 檢查通過。1280px Dark 實測 Regular 60px、subtitle 4px、框距 12px、統計 36px；不同觀察時刻確認升跌。390px Dark / Light 及 320px 窄手機無水平溢出，標題不裁切。
- 保留並行工作已存在的 E2/E3 火焰共用 opt-in；layout scope 測試只允許此明確火焰例外，其餘仍限定 E2。只在本地，未 push / 部署。

## E2 數據欄：8px 磨砂 / 綠黃標記

- 取代下方膠囊試稿：兩個數據欄回到既有 `--radius-lg`（8px），重用現有 New dropdown 的 125° 淡反光、半透明灰底與 12px / 120% 磨砂配方；Light 採原有白色磨砂配方，無 backdrop-filter 時採接近實色的後備。只改 E2 元件範圍，不改全域 token。
- Total Supply 標籤前加 6px 綠點；Available Liquidity 加亮黃色點。沿用現有 palette / spacing；黃點使用 primitive，避免 Light 的 warning 別名轉棕。標記 aria-hidden、靜態、沒有互動或狀態承諾；其他版本沒有標記。
- 保留 60px 標題、Gradient A、完整金額、原字體與兩欄 / 手機單欄佈局。使用者撤回加回副標題的要求，沒有加入該句文字。
- 54 項 E2 / totals / Light 回歸測試及 TypeScript、格式 / diff 檢查通過。1280px Dark 實測 8px radius、6px 綠黃點、12px 磨砂；390px Dark / Light 兩欄各 44px 高、無水平溢出，黃點仍為黃色。只在本地，未 push / 部署。

## E2 標題 60px / 完整金額資訊膠囊

- 按使用者參考圖，將 Total Supply / Available Liquidity 改為兩個並排、中性灰底的資訊膠囊，標籤與金額同行，沿用現有 surface、border、spacing 與 24px radius token。它們不是操作，不新增 click / hover 或假按鈕語意；手機改成單欄，極窄畫面容許膠囊內文字換行。
- 在原有 `MarketTotals` 加入可選 inline 變體，只由 E2 呼叫。沿用同一 Core / Hub 查詢及去重加總，透過既有 formatter 的 `shorten: false` 顯示完整逗號金額及最多兩位小數，例如 `$1,659,795,776.68`；不是把原本 1.65B 補零。未載入時仍顯示破折號，已知零值為 `$0`；其他版本 / Pro 保留原格式。
- 冰藍白 Gradient A 不變；桌面標題再由 48px 增至既有 `--text-h3`（60px），手機保留 40px / 1.2 leading，Light 保留深藍色對比。不改全域 token、交易或其他實驗版本。
- 61 項相關測試及 TypeScript、格式 / diff 檢查通過；修正 radius token 後重跑 11 項 E2 測試通過。1280px / 768px 雙欄每欄 44px 高；390px Dark / Light 與 320px 窄手機無水平溢出、標題不裁切，圓角實測 24px。只在本地，未 push / 部署。

## E2 標題：冰藍白 Gradient A / 放大

- 使用者在三張靜態試色圖中選擇 A，改成由上至下 `#d9edff → #99c8ff → #598eff` 的冰藍白。以原生 CSS 重現，沒有引入生成圖片、紋理或光暈；僅 E2 Dark，顏色限在元件選擇器，不改全域 token。
- 桌面標題沿用 Proxima Nova / bold，從既有 40px 增至 `--text-h4`（48px，+20%）。手機維持 40px，使用既有 1.2 leading 與 balanced wrapping，避免字尾裁切。
- Dark 的 A 停在完整靜態漸變，不沿用 mode-label 的 200% 流動背景；Light 保留原本較深的藍色對比，高對比模式仍採既有文字後備。沒有改其他版本、Logo 或模式按鈕。
- 34 項 E2 / Light CSS 測試、格式與 diff 檢查通過。1280px Dark 實測 48px / 57.6px leading，390px Dark / Light 不切字、不水平溢出；最深 gradient stop 對既有暗底約 6.02:1。只在本地，未 push / 部署。

## E2 Hover 左右留白

- 按 Impeccable 的 rendered spacing 檢查，原本浮動框 inset 8px、內容 padding 12px，導致左右框內只剩 4px，比按鈕上下 16px 明顯擠迫。
- 只調整 E2 Earn 主列表的桌面外側儲存格至既有 spacing × 6（24px），框內左右各留 16px；Action 欄增至 104px，保留 56px 按鈕與兩側 padding。表頭同步套用，hover 前後內容位置不變，行高仍為 72px；不改全域 token、E / E3 或手機卡片。
- 9 項 CSS 回歸測試通過。1280px 實測左右／按鈕上下皆 16px；768px 儲存格內容無溢出；390px 手機無水平溢出、Earn 保留 44px 高。只在本地，未 push / 部署。

## E2 火焰再修訂：雙色 / 更清晰動態

- 上一版 14px、±2° 的搖曳幅度太細；而原本開著的預覽當時為 E3（火焰僅在 E2）。這次另開 E2 示範分頁，搜尋 USDC，方便直接觀察，原分頁保留。
- 固定外框改用既有 size-4（16px），重用兩層原火焰圖示：橙色外焰、亮金黃內焰。使用既有橙色與 yellow-hover RGB 色票，避開 Light 的棕色 warning 語意別名；不改全域 token。
- 動態加清晰至 1.2s、約 ±5° 外焰搖曳，加內焰伸縮。只有圖示內部變形，不移動名稱或表格；保留離屏／隱藏分頁暫停、reduced-motion 靜態及無 IntersectionObserver 的靜態後備。
- 25 項相關測試、TypeScript、格式／diff 檢查通過；1280px Dark / 390px Light 實測雙色一致，外框固定 16px，兩層 transform 隨時間改變，手機無水平溢出。只在本地，未 push / 部署。

## E2 USDC 火焰小動畫

- USDC 後方的現有火焰加入 2.4s 輕微搖曳，旋轉約 ±2°、少量形變，固定 14px 外框不動；不閃爍、不加光暈，也不改文字、APY 或 CTA。
- `PromotedTokenFire` 只在既有 E2 / USDC 條件渲染，使用 IntersectionObserver 與頁面 visibility 暫停離屏／隱藏分頁的動畫；沒有觀察能力時採靜態後備。`prefers-reduced-motion` 保持靜止。
- 24 項相關測試與 TypeScript、格式／diff 檢查通過。1280px Dark 實測 SVG transform 隨時間改變、外框仍 14px；390px Light 確認 USDC 離屏暫停、搜尋後恢復，沒有水平溢出。
- 這項取代下方火焰試稿的靜態描述；只在本地，未 commit / push / 部署。

## E2 Liquidity 回復字級 / 移除底部說明

- Liquidity 主數字回復繼承原本 amount 字級，與 Total Supply 相同（桌面／手機皆 14px）；最新調整改為 normal 400，不再加粗。APY 的縮小加粗維持不變，美元副數字不變。
- 只在 E2 移除框下方「Simple yet powerful lending and borrowing for any DeFi yield strategy.」；E / O / New 原本說明保留，不改 E3 正在進行的設計。
- 1280px 桌面與 390px 手機已確認 Liquidity / Total Supply 同字級，說明文字不再渲染，沒有水平溢出。此項取代下方紀錄中 Liquidity 12px 的設計。只在本地，未 push / 部署。

## E2 USDC 火焰試稿

- 只在 E2 Earn 資產主列表的 USDC 名稱後面加一粒現有 `fire` 圖示（14px，間距使用既有 spacing）。不加 Featured market 文案、title 或 Tooltip；圖示為靜態、aria-hidden，不改比較按鈕的讀屏名稱。
- 不改 APY、排序、資格、市場／交易資料，亦不加入其他 token 或預覽版本。只是本地主推標記試稿。
- 15 項針對測試及格式／diff 檢查通過；1280px Dark、390px Light 已確認名稱後方對齊、沒有水平溢出。未 commit / push / 部署。

## E2 Earn 字重互動

- 每行 Earn 預設改為既有 normal 400；只有該 token 行 hover 或鍵盤 focus-within 時使用 bold 700，沿用藍色 Pro 繞框。APY / Liquidity 的加粗不變。
- 按鈕最小闊度沿用 spacing × 14（56px），預留粗體文字空間，避免 hover 時按鈕／欄位跳位。其他版本及全域字體規則不變。

## E2 APY / Liquidity 字級修訂

- 只針對 E2 Earn 資產主列表的基礎 APY 與 Liquidity 主數字（例如 1.7M）細一級、改為 bold 700。保留 Proxima Nova，沿用既有 `--text-sm` / `--text-xs` / `--font-weight-bold`，不新增全域字級。
- 桌面：APY 16 → 14px，Liquidity 14 → 12px；手機兩者 14 → 12px。Prime 徽章、美元副數字、Total Supply、表頭、來源頁及其他預覽版本不變。
- 13 項針對測試通過；1280px Dark 與 390px Light 實測字級／字重符合，手機沒有水平溢出。只在本地，未 push / 部署。

## E2 CTA 再修訂：Token 行 hover → Pro 藍色繞框

- 使用者所指的 Pro 效果是右上角 Lite / Pro 黑底按鈕的藍白繞框，不是 New secondary 的白色指標光。此項取代下方「Earn / 中性材質」的互動描述。
- E2 預設仍為中性框及單字 `Earn`；在可 hover 的裝置，滑鼠移到該 token 的整行／手機卡片時，只有該行 Earn 顯示黑底、藍框與 Pro 同款繞框。鍵盤 focus-within 提供等效提示。移開且失焦後隱藏並暫停。
- 直接重用 `.venus-mode-border-flow`、`venus-mode-border-orbit` 及現有 reduced-motion / forced-colors 規則，不新增動畫、全域 token 或依賴。E2 不再加入 New 白色 pointer-light 鏡像；E3 既有 opt-in 保留。
- 81 項相關測試、TypeScript、格式及 diff 檢查通過；1280px 桌面實測 USDT 行 hover 時只有 USDT 的 ring 為 running / opacity 1，相鄰行 paused / opacity 0。390px Light 無水平溢出，按鈕 44px，Earn → 市場來源 → 返回正常。
- 只在本地；未 commit / push / 部署，未連接錢包或交易。

## E2 CTA 修訂：Earn / 中性材質

- 取代下方第一版 CTA 試稿：可見文字只保留 `Earn`，預設為中性灰黑玻璃框；Light 沿用 Pro 的白灰材質，不再每行常亮藍色。
- 使用共用 SecondaryButton，透過現有 Pro 樣式鏡像，僅讓 `.lite-e2-earn-action` 與其子元素加入相同材質、hover / focus-visible 光感及指標追蹤。其他 Lite 控件、E / E3、全域 token 均不修改。
- 桌面動作欄縮至既有 spacing 的 20 倍（80px），按鈕 32px 高；手機保留 44px 觸控高度。點擊依然只開該 token 的市場來源選擇，不發交易。
- 驗證：80 項相關測試、TypeScript、production build、格式及 diff 檢查通過。1280px Dark 桌面及 390px Light 手機沒有水平溢出；實測 Earn → USDT 來源 → 返回正常。鍵盤 focus-visible 顯示同一 Pro 光層，指標追蹤與禁用／其他 Lite 控件排除另有測試覆蓋。
- 最後留在 E2 / Dark，臨時 viewport 已還原；未連接錢包、未交易、未 commit / push / 部署。效果待使用者確認。

## E2 密度 / CTA 試稿

- 只在 E2 Earn 資產主列表，把四個資料欄改為等寬緊湊排列，另留一欄給細的藍色 `Enter market`。表頭沒有新增排序項，原本四欄排序不變。
- CTA 沿用共用 PrimaryButton / blue-glass；點擊只開該資產現有的市場來源列表，並非直接 Supply 或發交易。手機卡片把同一按鈕放在 Total Supply 之後，保留 44px 觸控高度。
- 小字 CTA 改用既有 Intro / E Light 深藍 action stops，而非原本高亮藍底，以保留白字對比。Dark fallback 是同一套已用色值，不修改全域 token。
- 這是比較稿，不代表接受每行 CTA 的最終方向；E / E3 / O / New 不加此按鈕。E3 其他正在進行的改動保留。
- CSS 仍限定 E2 revision 與 Earn 主列表，Borrow 及 Token 來源頁不受此欄寬修改影響。沒有新增全域 token、沒有改動 APY 或市場資料。
- 驗證：134 項相關測試、TypeScript 及 production build 通過。實測 CTA → USDT 市場來源 → 返回、搜尋 USDT 均正常。1280px 桌面 CTA 為 32px 高；768px 沒有超出儲存格或頁面，390px 手機卡片 CTA 為 44px 高、位於 Total Supply 之後。沒有連接錢包或提交交易。只在本地，未 commit / push / 部署。

## E2 第一項設計調整：APY 上下排列

- 只在 E2 的 Earn 資產列表，基礎 APY / 區間放上面，Prime 入口放下面，兩者靠右對齊。
- 字體、Prime 銅色、數字、提示、資格及 APY 計算不變；E / E3 / O / New 仍沿用原本橫排。
- 規則放在 `GlassVersions/e2.css`，限定 `data-glass-revision='lite-experiment-v2'`，間距沿用 `--spacing`。新增的 `lite-earn-apy` 只是樣式掛點，不改資料與互動。
- 67 項相關測試與 TypeScript 通過。1280px Dark 桌面及 390px Light 手機已確認上下排列、靠右對齊；E / E3 實測仍是橫排。最後停在 E2 / Light，臨時 viewport 已還原；未 push / 部署。

## 最新更新：E3

- Preview / Before 改為控制器頂部的分頁；Preview 放 E / E2 / E3，Before 放 O / New。只切分頁不會換設計、網址或錢包。
- E3 由目前 E2 的外觀開始，新增獨立 `lite-experiment-v3` 選項、重新載入記憶及 `GlassVersions/e3.css` 設計入口。
- E3-only 規則使用 `:root[data-glass-revision='lite-experiment-v3']`；E / E2 / E3 暫時外觀完全相同，市場資料、APY 與交易功能繼續共用。
- 分頁支援左右方向鍵、Home / End；控制器收起後顯示實際選中的 E / E2 / E3 / O / New。
- 下方記錄是前一次 E2 實作；新的 Preview / Before 分頁取代原本的 Before 展開／收起入口。此次同樣沒有 push 或部署。
- E3 本次驗證：205 項相關測試（12 個檔案）、TypeScript、production build 及格式／diff 檢查通過。實測重新載入保持 E3；Preview / Before 的方向鍵切換不會換版本或 URL；390px 手機控制器留在畫面內，頁面沒有水平溢出。最後還原 Light / Preview、選中 E3。

## 使用方式

- 上層版本：E、E2；Before 只展開／收起舊版本，不會自行切換設計。
- Before 裏保留 O / New，原有頁面、元件與樣式沒有刪除。
- E 保留現況作對照；E2 是從同一個 E 基準開始的新修訂。今次沒有改 landing 設計。
- E / E2 互切保留原頁、query、Lite / Pro 狀態及頁內表單，方便比較。
- 從 O / New 進入 E / E2 沿用原本返回 Lite 首頁的行為。
- 選擇獨立記錄在既有 `venus-glass-version`；之前的 O / New / E 選擇與舊版遷移規則保留。未新增錢包或首次引導紀錄。

## 新版設計邊界

- `GlassVersions/variants.ts`：版本清單、分組、版本識別與舊偏好解析。
- E 是 `lite-experiment`；E2 是 `lite-experiment-v2`，不是同一個 store 選項。
- `data-glass-study="lite-experiment"` 是共用 E 材質家族；`data-glass-revision` 才是目前確切修訂。
- `GlassVersions/e2.css` 是新版樣式入口。E2-only 規則必須以 `:root[data-glass-revision='lite-experiment-v2']` 限定，不要為了新版去改 E 基準樣式。
- 需要不同結構時，在元件用確切 E2 revision 分支；資料查詢、APY、錢包與交易元件繼續共用，不複製業務邏輯。
- 沒有凍結整個 App 或複製成另一個網站；共用功能修復仍會影響兩版。這次建立的是可獨立迭代設計的預覽版本。

## 驗證

- 248 項相關測試（20 個檔案）、TypeScript 與格式／diff 檢查通過。
- 1280px 桌面 Light / Dark 與 390px 手機 Light 已檢查。手機頁寬 390px，控制器寬 202px，沒有水平溢出。
- Before 可用鍵盤展開／收起；O / New 均可選取。E2 重新載入後仍保持選中，Before 預設收起。
- E / E2 在 Pro 的 Liquidity Hub 頁互切保留原 URL；Lite 的 USDT Core 表單互切亦保持開啟。沒有連接真實錢包或發送交易。
- 預覽最後停留在 E2、Light、Before 收起；臨時 viewport 已還原。

今次只在本地實作，沒有 commit / push / Vercel 部署。
