# Venus Lite E 設計交接

更新日期：2026-10-21（香港時間）。本文件記錄本輪最後確認的設計及目前本地實作；早期試版不代表目前方向。

## 版本與入口

- 專案：`venus-ui-preview`，應用：`apps/evm`，分支：`main`。
- 本地：<http://127.0.0.1:5176/#/?chainId=56>，右下角 Preview 選 **E**。
- 正式網站：<https://venus-ui-preview-orcin.vercel.app/#/?chainId=56>。
- 本對話最後確認上線的版本：`c3d59fe`，Vercel 當時顯示 Ready，已驗證 Loan assets 多選。
- 本文件所述後續排版、按鈕及排序修改仍在本地，尚未提交或部署。
- `docs/LITE-E-EXPERIMENT.md` 是較早的實驗紀錄，其中 1080px、列數及字級描述不再代表目前設計。

## 目前主列表排版

```text
                  Universal Money Markets

                 Total Supply   Available Liquidity
                    $1.65B            $1.25B

┌─────────────────────────────────────────────────────────┐
│ [ Earn | Borrow ]       [ Search asset ] [ Filter ▾ ]     │
│                                                         │
│ 資產／Loan       APY ↕       Liquidity ↕       Total … ↕  │
│                    資產列表，框內捲動                     │
└─────────────────────────────────────────────────────────┘
                          12px
 Simple yet powerful lending and borrowing for any DeFi yield strategy.
```

數值僅示意，實際顯示沿用現有查詢與聚合邏輯。

- 標題置中，保留原有藍色、粗體及 `text-3xl`，行高為 100%。
- Total Supply、Available Liquidity 放在標題下方，整組置中；標籤在上、白色金額在下。
- 金額沿用 Pro 共用的 `MarketTotals` 與字體，E 使用 Regular（400）、`text-2xl`，比上一版縮細一級。
- Earn／Borrow 位於主列表框內左邊；Search asset 與篩選位於右邊。
- 切換控制整體高度為 36px，與搜尋輸入框一致；每邊寬 80px，外框有內邊距。
- Earn 右側篩選為 **All Categories**；Borrow 為 **All loan assets**。
- 介紹句移至整個市場框下方置中，與框的排版間距為 12px。
- 市場框最大寬度為 768px，內容高度上限為 488px，較矮視窗會受可用空間限制。
- 桌面維持框內列表捲動、表頭固定；手機依現有 Table 響應式顯示卡片，工具列可換行。

## 切換按鈕與其他材質

- Earn／Borrow、Supply／Withdraw、Borrow／Repay 都採共用外框的分段切換設計。
- 選中區保留 Pro 藍色漸層與白字；未選中區使用深色底及次要文字色。
- 灰色立體邊框放在整個切換控制的最外層，使用與錢包按鈕相同的內側高光／陰影。
- 不使用新增的銀色漸層描邊，也不加入旋轉邊框或大範圍光暈。
- 頂部已連接錢包、獎勵按鈕使用 New 灰色玻璃材質；一般錢包地址為白字。
- Connect Wallet 延續 New 藍色按鈕樣式。

## Dropdown 最後確認方向

- **觸發按鈕使用舊款**：保留原本搜尋旁的按鈕外觀。
- **展開選單使用 New 款**：漸層反光、半透明玻璃背景、灰色細邊與陰影。
- All Categories 使用 Regular 字重。
- Loan assets 支援多選；選中一項後選單保持開啟，可繼續勾選其他資產。
- 未選擇任何項目代表全部；選單內的 All loan assets 可清除選擇，重設為顯示全部。
- 選中一項時顯示資產名稱，多項時顯示數量，例如 `2 loan assets`。
- Category 多選與 Loan assets 多選保留各自的篩選狀態與資料邏輯。

## 排序規則

| 列表 | 可排序欄位 | 預設 |
| --- | --- | --- |
| Earn 資產列表 | APY、Liquidity、Total Supply | APY 降序 |
| Earn 市場來源 | Yield、APY、Liquidity、Total Supply | APY 降序 |
| Borrow 資產列表 | APY、Liquidity、Total Borrow | Total Borrow 降序 |
| Borrow 市場來源 | Yield、APY、Liquidity、Collateral、Total Borrow | Total Borrow 降序 |

- Asset／Loan 資產名稱欄不提供排序按鈕。
- 再次點擊同一欄位可切換升序／降序。
- 金額按未格式化的美元價值比較，避免直接比較不同 token 的數量。
- APY 按數值比較；Earn 的區間排序使用該資產的最高市場 APY。
- Yield 按市場名稱字母排序；Collateral 按支援的抵押資產數量排序，同數量以名稱決定次序。
- Earn APY 區間繼續排除條件式 Prime 模擬加成。

## Token 明細與交易彈窗

- 點選 token 進入市場來源列表，再點選市場開啟交易彈窗。
- 保留 popup 流程；不恢復早前將整份表單嵌入主框的試版。
- Borrow popup 的 Collateral／Loan 各佔一半；E 不顯示 Info 頁籤。
- 抵押品只保留輸入框內的一個選擇入口，沒有上方重複 dropdown。
- Borrow Loan 頁以所選抵押品的 Liquidation penalty 取代 Daily earnings；Supply 本身的 Daily earnings 不屬於此移除範圍。
- 預覽市場沿用非可交易狀態，不把展示數值當成真實交易能力。

### 明細頁待整理

最新一次只調整主列表的「切換在左、搜尋／篩選在右」。使用者表示先完成主列表，進入 token 後的排法留待下一步。

- Earn 來源頁目前仍是 breadcrumb 在左、模式切換在右。
- Borrow 來源頁目前是 breadcrumb 上方，搜尋／Collateral 篩選在左、模式切換在右。
- 尚未將這兩個明細頁同步成主列表的新左右順序；不要將此差異誤寫成已完成。

## 背景最終方向

- 使用最初較慢、較淡的 E 線條；不再與 About Us 完全相同。
- 線條設定：20 條線、80 粒子、速度 0.2；背景整體 opacity 0.4。
- 線條無額外 Gaussian blur；星層保留在上方。
- 手機／偏好減少動態時沿用既有靜態星空處理。
- 彈窗與展開選單自身的玻璃 blur 保留，與背景線條 blur 分開處理。

## 主要程式位置

- `apps/evm/src/pages/LiteMarkets/index.tsx`：Earn 列表、主視覺、介紹文字與模式組合。
- `apps/evm/src/pages/LiteMarkets/MarketModeSwitch.tsx`：框內模式切換元件；目前為新增未追蹤檔案，提交時必須包含。
- `apps/evm/src/pages/LiteMarkets/BorrowMarkets.tsx`：Borrow 主列表、Loan assets 多選與排序。
- `apps/evm/src/pages/LiteMarkets/BorrowSources.tsx`：市場來源、抵押品篩選與排序。
- `apps/evm/src/pages/LiteMarkets/experiment.css`：E 限定排版、字級、材質及響應式樣式。
- `apps/evm/src/pages/LiteMarkets/MarketTotals.tsx`：Lite／Pro 共用總數據元件。
- `apps/evm/src/components/Tabs/index.tsx`：新增可選的 `activeTabId` 與 `hideHeader`，供 E 將切換控制放入各列表工具列；其他呼叫端保留原有預設行為。
- `apps/evm/src/pages/LiteMarkets/GhostBackground.tsx`、`ghost-background.css`：已上線的慢速淡線背景。

## 驗證與交付狀態

- 本輪已實際操作 Earn／Borrow 切換、主列表排序、多選篩選、返回資產列表與交易彈窗。
- 新工具列已檢視桌面 1440×1000、手機 390×844；之後的左右對調與介紹文字 12px 修訂已重新檢視桌面，手機尚未重跑。
- 交付前重新執行 TypeScript 檢查及 17 項既有測試，全部通過。測試檔為 `experiment.spec.ts`、`useInterfaceMode.spec.tsx`，不等同完整的排序／所有斷點覆蓋。
- 未執行真實錢包交易；帳戶外觀驗證使用示範帳戶。
- 後續提交只包含相關程式與本交接文件，保留工作目錄中其他草稿及既有未追蹤文件。
- 本次寫文件不包含 Git push 或 Vercel 部署。

本地截圖僅作臨時核對：`/tmp/venus-lite-e/left-mode-right-filters.png`。此檔案不是正式資產，也不是線上部署證據。
