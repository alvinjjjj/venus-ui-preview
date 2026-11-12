# Dashboard / Lite UI 交接 — 2026-11-04

對象：Fun N／前端團隊。以下保留本日各輪修改紀錄；較早段落的「本機／未部署」是當時狀態，最終以以下發布摘要及獨立交接規格為準。

## 2026-11-05：Lite Light Vault slider 修正

- 依 Figma `557:3185`（Light `557:3207`／`1418:24037`）修正 XVS Vault Supply／Withdraw slider：白色20px thumb、12px刻度、已經過的刻度白色、0%／100%端點及淺色凹槽。重用原 Slider 互動，使用本地 Figma SVG，沒有調整全域 token、Dark 或 Pro 樣式。Prime 卡數值及外框未改。
- 影響 `containers/VenusVaultModal/index.tsx`、局部 `slider.css` 及3個SVG；Dashboard／Earn 共用的 Lite Vault modal 適用。
- 本機 Light 0／58／100%、375px、鍵盤 End、Dark 樣式檢查通過；375px modal343px，無橫向溢出。TypeScript、Stylelint、build、diff check通過。
- 已發布 `dpl_35SRP5epou33yiVSE6w8V4ReXvoG`，HTTP 200；線上入口 `./assets/index-DAhSKKSR.js` 與本機一致。線上 Lite Light 58%已核對thumb、刻度及凹槽；沒有真實交易。
- 證據 `exports/vault-slider-light-20261105/`。未修改Figma、未建立Git commit，本次未同步Notion。

## 本次追加發布與 Notion 更新

- 已重新發布目前 checkout 的 Lite 流程與 Dashboard 更新至 https://venus-ui-preview.vercel.app 。部署 `dpl_DvhRLbTdNbTSwiSLQvkmC6JGJDbG`，READY；入口 `assets/index-DrmT9mI2.js`，HTTP 200、HTML 與本機 build 完全一致。
- Dashboard 分類目前次序：Liquidity Hub → Venus Core → bStock index → bStock growth → Vaults；手機 Select 同步，仍只顯示有持倉類別。
- Lite Core 持倉列直接開 modal：Supplied 開 Supply／Withdraw，標題「資產 / Venus Core」；Borrowed 開 Borrow modal，預設 Loan。Pro 持倉行仍沿用原導航。
- 共用表單更新及已提供的375px手機檢查範圍、未驗項目，已補到同一 Notion 交接頁並重載確認保存；詳見 UNIFIED-DASHBOARD-NOTION-2026-11-04.md 頁首與6.1／6.2。
- 本輪 51 tests／7 files、TypeScript、production build、git diff --check 通過；線上桌面抽查 Hub 首位及 USDT Supply／Borrow modal，沒有重跑手機全矩陣。
- 未建立 Git commit／PR，未修改或發布 Figma。較早發布編號及檢查結果保留作歷史記錄。

## 最終發布與Notion同步（19:47回饋後完成）

- 已部署正式分享預覽：[Lite Dashboard](https://venus-ui-preview.vercel.app/#/dashboard?interface=lite&chainId=56)／[Pro Dashboard](https://venus-ui-preview.vercel.app/#/dashboard?interface=pro&chainId=56)。
- Vercel：`dpl_B4D36nuXub6VFAZGHNqAyhvPy6Uu`，`READY`；入口`assets/index-6tyKnsi7.js`，本機／線上HTML SHA256相同、HTTP 200。
- 最新Figma `417:50196`：手機資產卡內線延伸到左右內緣，內容保留16px；窄版交易卡內容12px、內線全寬。內線離外框外緣1px，即外框內緣；沿用Dark白8%／Light黑6%。
- 此發布包含以下全部17:36–19:47本機修訂：四項Summary、透明無框Chart、空Summary橫排、48px控件、60px桌面交易行、手機字級及區塊線、交易窄版無框中框。
- 最新重跑：42 tests／6 files、TypeScript、Dashboard Stylelint、`git diff --check`、production build通過。非全repo／真機／真實交易驗收。
- 線上抽查：1440px Pro Dark、390px Lite Dark／Light卡片與Summary、Empty account 390／640／1440px、guest離開Dashboard；無橫向溢出。
- [指定Notion PRD](https://app.notion.com/p/Venus-Dashboard-QC-2026-11-04-40eb4e5771bb80688fabe8112b9e6009)已替換為最終12節規格，加入3張本次線上截圖，重新載入確認保存；沿用私人Dashboard下的位置及原分享權限。
- 最終規格：[UNIFIED-DASHBOARD-NOTION-2026-11-04.md](UNIFIED-DASHBOARD-NOTION-2026-11-04.md)。證據：`exports/dashboard-final-release-20261104/`。
- 未修改／發布Figma，未建立Git commit／PR。下列15:57發布、較早數值及「尚未部署」字句為歷史紀錄，不代表本次狀態。

## 歷史 Overview 修訂（17:36後，現已包含於最終發布）
- 19:06 Mobile回饋（Figma `1828:129419`，本機完成）：小於640px的Summary主要數值由16px改為20px／600／30px行高；標籤14px／400／21px，百分比保留16px／400／24px，Net worth維持40px／600。Summary標題24px／36px，取消手機48px最小標題行，標題→內容12px、指標兩行gap12px。兩欄用min-content適應真實金額，欄gap20px；375px以上金額與百分比同列，小於375px必要時讓百分比整組換行，保持字級而非縮字。
- 手機移除Summary→Positions及Positions→Transaction兩條橫向區塊線，區塊gap24px；保留四項指標中間的直線與卡片內線。640px起仍為原本分隔線、上下各48px總留白，沒有更改共用線色token。
- 手機Core持倉摘要標籤14px／400、值20px／600；Health factor pill12px／600。資產卡名稱16px／600（hover仍700），APY及Balance／Collateral欄內容14px／400；交易本身已符合14px文字／12px時間，日期16px／600，保留原樣。保留網站既有市場名稱、Assets小標及實際資料，不複製Figma的Summer、Text等示例。
- 本輪QC：Lite Dark／Pro Light各320、375、390、576、639、640、768、1440px共16狀態；手機無橫向或指標溢出，375／390px實際負值同列、Summary→Positions24px，639px兩條橫線隱藏、640px恢復。390px Borrowed卡、Supplied切換及交易文字亦核對；5項Dashboard測試、Stylelint、Biome通過。證據`exports/mobile-dashboard-typography-20261104/`。本機未重新部署、未改Figma／線上Notion。
- 19:02補充：Today’s change旁的箭頭／百分比組改為16px Regular（400）、150%行高24px；只調整百分比層級。金額及另外三項數值維持原字級／600字重，正負顏色與計算不變。沿用`--text-base`及`--font-weight-normal`，無新增token；Lite／Pro共用。Pro Light及Lite Dark各1440／640／390px實測百分比16px／400／24px，手機金額與百分比同列且無溢出。Stylelint及Biome通過；證據`exports/overview-percentage-16px-20261104/`。本機尚未部署／同步線上Notion。
- 18:47補充（Transaction窄版修正）：交易響應式依列表容器寬度672px切換，並非固定576／768px viewport。小於672px：日期在框外，每筆交易獨立實心卡，列表本身無border／底色／shadow；672px起：共用一個列表外框、每筆60px行。原窄版規則因共用卡片`:is(...:not(...))`權重較高被覆蓋，造成框中框；已提高Dashboard交易範圍的局部規則權重，未改全域token或其他列表。
- 此輪QC：Lite Dark／Pro Light各390、576、640、739、740、768、1024、1440px，16個狀態無橫向溢出。Lite Dark實測容器671px時外框0／內卡1px，672px時外框1px／內行0px；768px兩模式皆為60px桌面行。Theme／模式的scrollbar可影響實際可用容器寬度，交接請以容器672px判斷。Stylelint通過；證據`exports/transaction-frame-fix-20261104/`。本次仍未重新部署／同步線上Notion。
- 18:28補充：依 Figma `189:25990` 的空帳戶 Summary，已連接且績效查詢成功、歷史為空時，640px起四項數據橫排（Today’s change／Absolute performance／Net APY／Daily earnings）；手機維持2×2。移除無資料的圖表容器、訊息及預留右欄，不再以242px空圖表撐高Summary。Positions／Transaction空狀態卡片的框仍保留。沿用原本0／-數值及Hide balances，未改動未連錢包時回Landing的行為。
- 上述版型只在已確認空歷史時啟用；Loading／Error保留圖表區，有績效歷史的帳戶繼續原本2×2指標＋Chart。Lite／Pro共用，沒有新增全域token或修改Figma。
- 此輪本機QC：Pro Dark及Lite Light各1440／1280／1024／768／640／390px，12種狀態皆無橫向溢出；640px起四項同Y，390px兩行。兩張空卡仍為242px／1px框；390px Hide balances四項遮蔽且不改版型。有資產Pro帳戶確認圖表仍在。截圖及幾何數據：`exports/empty-summary-20261104/`。本機修訂尚未部署／同步線上Notion。
- 18:25補充：桌面Transaction每筆交易行由71px收至60px（spacing×15），與持倉表資料行一致。日期分組留白、文字字級、整行hover及欄位對齊維持；列表容器小於672px時仍使用內容自動增高的手機卡片，避免壓縮多行資料。
- 18:14補充：新增Overview上方「Summary」。Summary／Positions／Transaction改用同一個`dashboard-section-title`樣式：24px字、36px行高、600字重，標題區最少48px高，靠頁面同一左邊界；各區標題列至下方內容24px。手機Transaction標題／CSV至下一行filters亦用24px，篩選器仍48px；手機Positions仍由市場Select開頭。六種寬度已核對三標題字級及各24px間距、25項相關測試通過。
- 18:00更正（取代52px試版）：Positions分類按鈕／手機Select及Transaction篩選器統一min-height48px（spacing×12）；仍用12px padding、14px／21px文字，長標籤可增高。Positions標題維持24px／36px、600，與Transaction標題一致。
- 17:55補充（取代17:51隱藏線試版）：恢復 Positions 上方分隔線並保留原有上下各48px留白。1024px起 Positions標題靠左、分類按鈕靠右，同列垂直置中；640／768px仍上下排列，390px維持手機下拉選單。Lite／Pro共用，分類／持倉條件不變。
- Chart 移除容器背景、stroke 及卡片陰影；保留藍色折線、下方20%→0漸淡面積、12px inset／switch gap、171px plot 高度及 Dark 星空。
- Net worth 下方改為兩欄兩行：Today’s change／Absolute performance，其下 Net APY／Daily earnings。新增數值沿用 AccountOverview 既有計算與 tooltip，不套用截圖中的示例數字，也不更改市場摘要的計算範圍。
- 指標垂直 gap24px；手機兩欄間16px、值16px／24px行高，640px起欄間40px、值20px／30px行高。Today’s change 金額＋箭頭＋百分比同一行，手機元素間4px、較寬畫面8px。
- 只在第二／第四項前畫中間分隔線，避免第二行第一項多一條線；內線繼續沿用 Light黑6%／Dark白8%。Hide balances 同時遮蔽四項值。
- 本機 QC：Pro Dark 及 Lite Light 各1440／1280／1024／768／640／390px；12種狀態皆無橫向溢出，四項呈2×2，當前示範帳戶的金額和百分比同列。390px餘額遮蔽已核對。11項相關測試、TypeScript、build 通過。
- 證據：`exports/overview-metrics-20261104/`。此修訂及上一輪 collateral 欄位對齊尚未重新部署；下面發布紀錄是較早版本，Notion 線上文件仍為先前發布規格。

## 範圍與狀態
- Final Lite 與 Pro 現在使用同一個 Dashboard；保留現有市場、資料邏輯及 Dark 星空背景。
- 已部署至 https://venus-ui-preview.vercel.app，部署 READY 並完成線上抽查；未提交 Git，沒有修改 Figma。
- Demo 資料及展示 APY 不應當作真實收益或資格。

## 本次共用 Dashboard 發布摘要
- 唯一 Dashboard：Lite／Pro 共用 Overview、Positions、Transaction；切換模式留在原頁及保留 query。
- 最終規格與 7 張截圖：[完整交接文件](UNIFIED-DASHBOARD-NOTION-2026-11-04.md)。
- Notion：私人 Dashboard 下的獨立子頁，https://www.notion.so/40eb4e5771bb80688fabe8112b9e6009 。
- QC：Lite／Pro × Light／Dark × 六種 viewport，24 狀態 DOM 檢查無橫向溢出；64 項相關測試、TypeScript、build 通過。
- 加修 Modal Escape／Tab 焦點限制及關閉後焦點還原。
- 發布：dpl_2LYrg3bGon6YgMraLhEZzyTTTCEX，線上與本機入口 JS hash 相同（index-Ch-l5zTy.js）。
- 不包含真實錢包交易、所有鏈或實機 Safari／Android 完整驗收。

## 最終設計規則（以此取代今日較早試驗值）
| 項目 | 最終設定 | 適用範圍 |
|---|---|---|
| Dark 內線、區塊分隔線 | 白色 8% opacity；Dark card 上約 #222329 | Final Lite 共用分隔線及 Dashboard |
| Light 內線、區塊分隔線 | 黑色 6% opacity；#FBFCFE card 上約 #ECEDEF、#F4F7FB 頁面上約 #E5E8EC | 同上 |
| 外框 | 保留獨立 token：Dark #30354A、Light #D4DDE8 | 不要跟內線混用 |
| 行項目 hover | 沿用外面 Lite 市場中性灰色漸層；Light 為既有 e-light-text-primary 6%→7%，Dark 為既有 color-white 5%→4% | Dashboard 持倉、交易行；不再用舊偏藍底 |
| 資產名稱 hover | font-weight bold（700）；只加粗名稱，金額及 APY 不隨整行加粗 | Core、bStock 的 Supplied/Borrowed、手機資產卡 |
| Summary／Positions／Transaction 標題 | 24px、600、150%行高=36px，標題區最少48px高 | 共用標題樣式；手機Positions維持原本隱藏標題及Select入口 |
| Positions 標題→分類按鈕 | 1024px起左右同列；640／768px上下排列gap16px | 390px使用下拉Select |
| 分類按鈕 | 四邊 padding12px、按鈕間 gap12px | 桌面及手機選單沿用現有樣式 |
| 分類區→摘要 | 24px gap | Positions |
| Positions／Transaction 上方分隔線 | 上下各48px總留白 | 不是單一48px padding |
| 標題列→下方內容 | 24px gap | Summary、Positions、Transaction一致 |
| Supplied／Borrowed 標題及交易日期 | Proxima Nova、16px、600、24px行高 | 規格一致，並非同一元件 |
| Asset 表頭行 | 還原共用 Table 56px（取代壓縮40px） | Dashboard 持倉表；外面市場有自身表頭樣式，不宣稱所有表頭相同 |
| 持倉資料行 | 60px行高；桌面左右cell padding24px | Core、bStock Supplied/Borrowed |
| 資料字級 | 14px／21px；APY600，Balance400 | Dashboard 持倉；Hub指標亦同步 |
| Lite Header 捲動 | 頁頂透明；捲動後20%半透明底、4px blur、無底線、無漸層 | 取代先前80%底／12px blur的較強版本；Pro原樣式保留 |

## Chart
- 直線連接數據點，保留下方藍色漸淡陰影（20%→0）。
- 30D／6M／1Y switch 與圖表 gap12px。
- 日期 dd.MM、7個刻度；金額5個刻度，兩軸標籤分開。
- Plot高171px；1440px畫面圖表區寬628px，靠右與下方卡片對齊；較窄畫面堆疊。最新試版已移除圖表容器底色／外框，詳見上方修訂。
- 保留 Dark 星空，不以實色頁面遮蓋。

## Positions 內容與互動
- 保留 Venus Core、Liquidity Hub、bStock index、bStock growth，新增 Vaults。
- 沒有該市場持倉則隱藏分類；不是KYC／白名單條件。
- Core以正數Supply或Borrow判斷；單獨零餘額Collateral membership不算。
- Hub以正數持倉判斷；bStock仍為既有demo限定。
- Vaults沿用既有Vaults／VaultCard、useGetVaults資料；userStakeBalanceMantissa > 0且有帳戶才顯示分類，手機Select同步。
- 類別消失時切至可用類別，資料回來不搶回選擇。
- USDC綠星2.65%、USDT基礎2.71%+Prime9.77%僅為demo供應表的排版展示；重用現有APY組件，不改真實資格、數值計算或Borrow資料。
- Figma APY元件VIP=true Hover兩個圖示曾發現交換（Prime3760:95907、Borrow3760:95915），本輪未修改Figma。

## Transaction
- 桌面交易行 hover 背景必須由卡片左內邊緣延伸至右內邊緣；16px水平留白放在每行內容及日期標題，不放在列表外層，避免hover兩側被截短。手機卡片布局以文末「手機版元件與 Transaction」更新為準。
- 標題左、filters與CSV右，下方獨立交易卡片。
- 桌面>=1024 filters各280px；640–1023各240px；手機彈性等寬。
- Trigger至少48px，可隨文字增高；選項至少48px、padding12px，長文可換行。
- 保留篩選、Reset、URL狀態及分頁；CSV目前匯出當頁已篩選資料，並非全部歷史。

## 驗證與限制
- Core、Hub、bStock曾完成六種寬度及Light/Dark共50種狀態檢查；當時無溢出，資料行60px。
- 後續表頭改56px、內線8%：瀏覽器核對Core兩表；Lite市場Light/Dark線色亦核對。
- Vaults：19個Positions測試、TypeScript與lint通過；桌面與390px手機已檢查，demo顯示XVS/VAI卡片。
- 最新hover加粗：CSS／程式碼檢查；尚未重新跑完整六尺寸視覺矩陣。
- Header最初12px blur的scroll狀態已驗證；後續4px淡化版及最新hover仍需整體視覺驗收。
- 先前MarketTable單測有ResizeObserver環境問題（3通過7失敗），不能將整個專案測試宣稱全綠。

## 主要實作位置
- assets/styles/lite-dividers.css：Lite共用分隔線token與套用。
- pages/Dashboard/figma-dashboard.css：Dashboard布局、行高、字級、hover。
- demo/GlassVersions/e2.css：Lite市場與Dashboard共用row feedback配方。
- pages/Dashboard/LitePositions.tsx：分類、持倉可見性、手機選單、Vaults。
- containers/Layout/NavBar/figma-header.css、index.tsx：Header捲動效果。
- exports/dashboard-chart-20261104/：各次QA數據及預覽截圖；留意截圖對應時間，不同版本並非全部最終值。

## Footer 補充
- Lite Footer 上方內距48px，桌面及手機一致。
- 社交icon保留中性預設狀態；Light／Dark hover及鍵盤focus以現有品牌藍色底、白色圖示回饋。

- Positions 分類順序確認：Venus Core → Liquidity Hub → Vaults → bStock index → bStock growth；桌面及手機共用，仍隱藏無持倉分類。

- Borrow 外層維持 Search asset；資產內頁改 Search collateral，搜尋抵押品symbol。
- Light Footer hover 白色使用 e-light-text-on-accent，避免 color-white 在 Light 被映射成深色。市場卡片完整框線在捲動內容上層繪製，保留底邊。

- Market totals：最新修訂已移除 Available Liquidity 黃點及 Total Supply 綠點；所有版本共用此顯示規則。

## 已連接但未有資產：Empty account
- Figma參考 Dashboard `189:28604`；今次只修改本機網站，未修改Figma或部署。
- Choose an account 新增 **Use Empty account**；獨立模擬地址 `0x0000000000000000000000000000000000000002`，session刷新可保留。Normal/Prime原有範例持倉保留。
- Empty account：wallet/supply/borrow/collateral、XVS/VAI stake歸零，不注入bStock/Hub範例持倉；performance history及transactions為空。只影響本機模擬資料。
- 未連接直接開Dashboard或在Dashboard登出，replace返回Landing，保留interface/chainId，移除交易篩選/分頁參數。
- 已連接無performance history：**No performance data yet** / **Your performance will appear after you supply assets.**，不顯示無效時間切換。
- Positions：**No positions yet** + **Explore markets**（回到Lite首頁市場）；無持倉分類不顯示。
- Transaction：**No transactions yet**；無歷史且無篩選時收起filters/CSV；有篩選但沒結果保留控制，方便Reset。
- 空白卡片沿用Card/token、Figma 242px高度；Final Lite不用舊Guide三卡，直接由Overview到Positions。Dark星空保留。
- 已驗證：登出redirect、guest直接網址redirect、Empty account選取及刷新、Explore markets導向；390px Dark/Light三卡皆242px高，無橫向溢出。桌面Dark已截圖。
- 33個相關測試通過（帳戶/持倉/歷史/guest redirect/demo不送真交易）；TypeScript及樣式檢查另行執行。未驗證所有鏈及全部六個尺寸。
- 截圖：`exports/dashboard-chart-20261104/empty-account-dark.png`、`empty-account-mobile-light.png`。

## 手機版元件與 Transaction（本輪更新）
- 參考 UI Kits `2459:22457`：連結實際指向 Operation history。取用其 popup/card 材質與分頁規格；Positions/Sources 的內容及選取邏輯仍沿用現有 Select/MultiSelect。
- Final 的中性 popup 材質移至共用 Modal CSS，直接載入 Dashboard 也可生效，不再依賴先進 Lite 市場載入 route CSS。沿用現有 popup fill、border、shadow、20px blur、8px radius；Light 使用已核對 Figma 的 `#FBFDFF` 96% fill、既有 `#D4DDE8` 邊框與 overlay shadow。未改 Figma 或全域 token 定義。
- Positions、Transactions、Sources 手機選單採此共用材質；取消舊藍色外框。長列表內容獨立捲動，Close 保持可見；選項 hover/pressed 使用既有中性 `surface/dropdown/item-hover`，不使用舊 Light 藍底。
- Supplied/Borrowed 改回完整單一底槽 ButtonGroup；Supply/Withdraw、Borrow/Repay 使用現有 primary Tabs。Hub 的 Wallet/Collateral 第二層保留。Final 手機 inline form 與 Market/Hub modal 共用同一方案；沒有重寫交易操作。
- Transaction + Download .CSV 同一行，兩個 filters 排下一行；桌面 >=1024px 保留標題、filters、CSV 同行。
- 交易列表容器小於672px（對應原本 row/card 切換點）移除外框、padding、底色、陰影；日期置於框外，每筆交易保留獨立卡片。390/640px 確認不再框中框；768px 起沿用原桌面列表框。
- 分頁仍為 **每頁20筆**，按交易筆數而非日期分頁。Final 的單頁非空資料也顯示筆數及目前頁碼；無資料則隱藏。前後頁/首尾頁按可用頁數顯示；可輸入頁碼，超出範圍會收斂到有效頁。原 URL page、篩選及 Reset 邏輯保留。
- 現有 Normal demo 為6筆，所以瀏覽器顯示 `Items 1 - 6 out of 6`、第1頁；不是固定只有6筆。Repay 篩選實測剩1筆，Reset 後回6筆。CSV仍只匯出當頁篩選結果。
- 驗證：390px Light/Dark 的選單、資產切換、交易卡片、頁碼；USDT Core Supply/Withdraw、Hub Supply/Withdraw（Wallet/Collateral存在）、Core Borrow/Repay切換。未送出任何真實交易。
- 390/640/768/1024/1280/1440px 的 Dark DOM 測量：無頁面橫向溢出，Transaction與CSV垂直中心差0px；1440px桌面已視覺回歸。Light 390px已視覺檢查，未宣稱所有尺寸雙主題及真機完整矩陣。
- 16個相關測試通過（含45筆的分頁/手動頁碼上限、交易篩選、Lite手機流程）；TypeScript、變更檔案 Biome、三份CSS Stylelint通過。舊 Transactions snapshot已按現行 Final標題/CSV/空狀態及單頁筆數更新。
- 截圖與量測：`exports/dashboard-chart-20261104/mobile-transactions-dark.png`、`mobile-transactions-light.png`、`mobile-positions-menu-dark.png`、`mobile-sources-menu-dark.png`、`mobile-core-actions-dark.png`、`mobile-borrow-repay-dark.png`、`transactions-desktop-regression-dark.png`、`mobile-layout-breakpoints.json`。
- 狀態：本機 `127.0.0.1:5176` 已更新；本輪未部署 server，未修改 Figma。

## 14:30 後修正：實心卡片、切換底槽及裝飾清理
- Final 的 Supplied/Borrowed、Supply/Withdraw、Borrow/Repay 等 ButtonGroup 底槽改回與外面 Earn/Borrow 共用的實心配方，取消 fullWidth 的半透明 glass override。Dark 底槽 `#1E2431`；Light 底槽 `#EDF2F8`。藍色選中狀態、字色、幾何尺寸及操作邏輯不變。
- Final Lite Dashboard 的 chart、Supplied/Borrowed 表格、手機資產卡、Hub/Vault 持倉卡、empty state 及 Transaction 卡片均不再透出星星。保留既有 card tint，疊在既有 page 色上作實心底：Dark 是黑色10%疊 `#101218`（合成約 `#0E1016`），Light 是 `#FBFCFE`。沒有新增全域顏色或修改 Figma variable。
- 手機資產卡及 Transaction 卡片的 hover/focus 回饋仍用既有中性灰配方，但疊於實心卡底，不會因 hover 而重新透出星星。卡片以外保留星空。手機日期維持框外，列表不加回外框。
- Total Supply 綠點從共用 MarketTotals 元件移除，與已移除的 Available Liquidity 黃點一致，適用所有預覽版本與尺寸；數值及刷新邏輯不變。
- Layout 暫時不 render 返回頂部浮動箭頭；保留 ScrollToTop 元件及程式，方便之後重開，沒有刪除元件。
- 本輪驗證：390px Dark/Light、640px Dark、1440px Dark 無頁面橫向溢出；手機 Supplied/Borrowed 切換、卡片 hover 實心、Transaction 無外框、桌面 Vaults 卡片及沒有返回頂部 DOM 已核對。未重跑全部六尺寸雙主題矩陣，非真機驗收。
- 7項相關測試（MarketTotals/Layout）、TypeScript、Stylelint 及變更 TS/TSX 的 Biome 通過。
- 截圖：`exports/dashboard-chart-20261104/solid-mobile-borrow-dark.png`、`solid-mobile-transactions-dark.png`、`solid-mobile-transactions-light.png`。
- 本輪只更新本機網站，未部署 server，未修改 Figma。

## Supplied／Borrowed 欄位對齊早期試版（APY 預留槽已由下一節取代）
- Core 與 bStock 兩張持倉表共用 `positionTableColumnWidths`：Asset 24%、APY 32%、Balance 20%、Collateral／% of limit 24%，取代兩張表各自不同的比例。
- 640px 起 APY 欄分成基本利率及 reward 兩格；右方保留72px（既有 spacing × 18）獎勵槽、4px gap。沒有 badge 的行同樣預留空間，基本利率右端及 APY 表頭對齊；Prime badge 放在獨立槽內。
- 使用既有 AssetApy／Prime／Campaign 組件。原生 reward 沿用同一槽，存在時優先於 demo badge。沒有更改利率計算、獎勵資格、資料或顏色 token。
- 兩表依實際容器寬度排列，每張表以600px（spacing × 150）為並排最低寬度；空間不足改為上下排列。此次1280px viewport 為上下表、1440px 為兩張628px並排；390px維持原本手機資產卡。
- % of limit 保留完整百分比，進度條可縮短，避免被固定80px rail 迫出或截走文字。
- 已驗證：640／768／1024／1280／1440px Dark 的上下兩表欄寬相同，所有基本 APY 右端相同，百分比在格內；390px卡片、1024px Light表頭及 APY 對齊。六尺寸無頁面橫向溢出；bStock 1440px同樣核對。非全部尺寸雙主題或真機完整驗收。
- 20項現有 Positions 測試、TypeScript、Biome及Stylelint通過。
- 試版截圖：`exports/dashboard-chart-20261104/aligned-position-tables-1024-dark.png`、`aligned-position-tables-1440-dark.png`、`aligned-position-tables-1024-light.png`、`aligned-position-mobile-light.png`。量測：`position-alignment-breakpoints.json`。
- 本機試版，待 Alvin 視覺確認；未部署、未修改 Figma。

## 15:00 修正：APY 必須靠右（目前採用）
- 移除 APY 右方72px獎勵預留槽及表頭偏移。沒有 reward 時利率直接靠 APY 欄右邊；有 Prime／Campaign badge 時，利率與 badge 作一組靠右。空白 reward 槽不再保留。
- 保留 Core／bStock 上下表共用欄寬（24%／32%／20%／24%）、按容器寬度並排、完整借款百分比及可縮短進度條。
- 沿用現有 APY／reward 組件與手機排法；沒有更改資料、利率計算或顏色。
- Dark 390／640／768／1024／1280／1440px 無頁面橫向溢出；各表 APY 表頭、普通利率及可見 reward 組合的右邊界已量測一致。Stylelint、git diff whitespace check 通過。
- 截圖：`exports/dashboard-chart-20261104/apy-right-aligned-1024-dark.png`；量測：`apy-right-alignment-breakpoints.json`。上一節的預留槽截圖屬歷史試版。
- 本機網站已更新；未部署、未修改 Figma。
