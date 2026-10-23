# Lite E 實驗版交付記錄

## 2026-10-23：未連錢包的公開市場瀏覽（最新）

Lite / Pro 是公開市場瀏覽介面，不再以錢包連接狀態決定能否選擇 Pro。市場查詢本來已支援沒有 accountAddress；本次修正 `useInterfaceMode` 強制訪客 Lite、以及 NavBar 隱藏模式切換掣兩個入口限制，沒有修改資料查詢／交易授權或 Design Token。

- O / New / E 都可以在未連錢包時切 Lite ↔ Pro；Connect Wallet 保留。直接 Core Pool / Liquidity Hub 深連結會顯示 Pro 的導覽與標籤，不再在 Pro 頁錯標 Lite。
- Lite 可看 Earn / Borrow、APY、流動性、供應／借款總額及資產來源比較；Pro 可看 Liquidity Hub 和 Core Pool 公開清單。搜尋及一般站內切換不要求連錢包，chainId / 原有參數保留。
- 連接／斷開錢包不再自行改變所選介面。持倉／錢包結餘、MAX、抵押品操作及交易提交仍按原有錢包條件處理；Core / Hub 的訪客 Supply 表單仍只顯示 Connect Wallet，沒有執行任何交易。
- 原 `useUserChainSettings` 已在訪客狀態忽略儲存的 My assets only，亦不刪除連接用戶的偏好；新增測試確認公開清單不因此被隱藏。
- 這仍是現有預覽資料來源：BSC pools / hubs 來自專案 snapshot，本次沒有新增即時 API 或改動利率／資格計算。
- 152 項相關測試、TypeScript、格式／diff 檢查通過。驗證包括 O / New / E 訪客切換、Core 深連結、連接／斷開不變模式、既有首次引導、Footer、ConnectWallet / TxFormSubmitButton 交易前置條件與私人篩選。交易邊界測試只補上 jsdom 缺少的 ResizeObserver stub，未修改共用 mock 或生產交易元件。
- 本地瀏覽器已試未連錢包的 Lite Earn / Borrow、USDT 搜尋、來源比較、Core / Hub 的 APY 與 Connect Wallet 表單、Pro Core 深連結及重新整理、Pro Dark 桌面 1280×800 / 小手機 320×667、Light 手機 397×889。QA：`/tmp/venus-guest-markets/`。
- 本次只有本地修改，未 commit、push 或部署；沒有連接或改動原工作頁的模擬帳戶。按原順序，下一項為 Dark Mode 背景細節，再之後才是小白 / X 入口。

## 2026-10-23：簡潔 Footer + About（最新）

按使用者提供的窄橫欄截圖，Lite 與 Pro 產品頁共用原有簡潔 Footer，而不是 Explorer 多欄大 Footer。依序保留 Documentation、Agent skills、Privacy policy、Terms of use，並在 Agent skills 後新增 `About`，連到既有 `/about-us`、保留 chainId；五個原有社交圖示及目的地不變。About Us 展示頁仍保留既有大型 Footer，沒有刪除元件或更動 Design Token。

- E 不再隱藏 Footer；Safety、audit、Community、Trusted by 仍不加入 E 首頁。Pro 產品頁同樣採簡潔橫欄，不再從 Footer 補入大型品牌／Trusted by 區段。
- 桌面維持原有固定視窗市場框、內部資產捲動和底部橫欄。手機（既有 639px breakpoint 以下）市場保留一個視窗高度，Footer 接在後面，外層可向下捲到 Footer，避免短螢幕資產區被壓到只剩工具列。
- 只沿用既有字體、間距／色彩 token 及 icon；圖示新增輔助名稱，Footer 連結提供獨立 navigation 語意。桌面為既有預覽 launcher 留出一格空間，避免遮住 GitHub 圖示。
- Footer 8 項測試、手機版面回歸 3 項及既有引導／模式相關 105 項測試，共 116 項通過；TypeScript、變更範圍格式檢查通過。原 Footer 測試補上介面模式／預覽工具的邊界 mock，沒有修改共用 Zustand mock。
- 本地已檢查桌面 Dark 1280×800、Light 手機 397×889、Dark 小手機 320×667：Footer 不橫向溢出，短手機市場清單高度回復可用、Footer 可捲到，About 正常開啟既有頁面。QA：`/tmp/venus-compact-footer/`。
- 僅本地修改，未 commit、push、部署或改 Figma。依原工作順序，下一項是檢查未連錢包時 Lite / Pro 的公開市場資料；本次尚未開始該項。

以下保留早期實驗紀錄；Footer 和手機捲動規則以本節為準。

## 完成內容

E 按最新確認改用 O 的元件與材質，保留星空背景與既有 Design Token；O／New 的既有呈現維持不變。本記錄只描述 E，不建立全域設計規則，也不新增圖片資產。

- 預覽識別為 `lite-experiment`；點選 E 會進入首頁並選擇 Lite 介面。
- 首區內容最大寬度為 1080px，E 首頁固定在導覽下方的剩餘視窗高度，禁止頁面捲動，僅表格區域可捲動。Earn／Borrow 為手機 12px、桌面 14px。
- E 暫時不渲染 Safety、audit、Community、Trusted by、footer；元件仍保留給 O／New。表格高度上限為搜尋／表頭加六列 token，矮視窗與手機會顯示較少項目以保持可讀性。
- Earn 改用 Search asset 旁的 O 版 Category 多選選單（Stablecoins、bStocks 等既有資產分類）；不再顯示 All／Venus Core／Liquidity Hub 一行。分類只篩選資產，保留該資產所有市場及原有聚合數值。
- 上方標題縮至既有 text-2xl、總數據 text-xl；副標題 text-sm、數據標籤 text-xs，縮緊間距但保留可讀性與藍色漸變。
- APY 顯示所選來源的實際最低至最高值，保留兩位小數；顯示值相同時只顯示單一百分比，無有效值時顯示 `—`。不將條件式 Prime 模擬收益納入範圍。
- Earn 清單採內部捲動及固定表頭，保留搜尋、排序與資產來源詳情入口；分類及捲動區域提供鍵盤焦點樣式。

## 影響頁面／元件

主要範圍為 `apps/evm/src/pages/LiteMarkets/` 的首頁組合、`experiment.css`、`experiment.ts` 與測試，以及預覽切換／Lite 介面模式整合。E 的樣式映射為 v1，版面仍以 lite-experiment 獨立限定。

## 驗證與限制

主執行代理回報相關測試共 20 項通過，TypeScript 檢查通過。桌面 1440 × 1000 的驗證截圖為 `/tmp/venus-lite-e/desktop.png`，該尺寸的 Earn 清單可見七列。此截圖為本機暫存證據，並非部署或正式資產。

較矮桌面視窗與手機可見列數較少；手機首區可能超過一個視窗高度。七列及單屏呈現不是所有 viewport 的保證。

## Review disposition

建議以目前局部實驗範圍交付（ship），保留上述 viewport 限制。這不代表已部署或使用者已接受，也不將 E 的版面決策提升為全域設計系統規範。
