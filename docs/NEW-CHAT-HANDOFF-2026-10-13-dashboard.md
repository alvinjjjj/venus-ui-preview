# Venus New Dashboard — 新對話交接（2026-10-13）

## 工作範圍

- 專案：`/Users/alvin/Documents/Claude/Projects/Venus project/venus-ui-preview`
- 本機頁面：`http://127.0.0.1:5176/#/dashboard?chainId=56&tab=pools`
- 目前重點：Dashboard 的 **New** 預覽模式（`v5`），包括 Markets、Vaults、Hubs、Transactions。使用者希望先在現有網站版面調整、看效果，再決定是否同步 Figma；不要另外建立測試元件。
- 溝通用繁體中文／廣東話。保留現有設計 token、Original 模式與卡片流動光邊。

## 最新本機 mockup

1. **Vaults／Hubs 留白**：共用的 `PositionCardsTab` 卡片網格在 New 模式由 16px gap 增至 28px，即多 12px；桌面雙欄與 390px 手機單欄均已量度。Hubs 卡片原有漏光框與藍色 hover 邊線仍在。
2. **Transactions 外框**：New 模式的交易列表使用現有 `data-venus-panel` 流動光邊（`panel-travel`）；窄於列表 `@2xl` 容器斷點時移除外層框，保留每筆交易本來的卡片邊界，避免手機出現雙層框。
3. **逐筆交易 hover**：New 示例交易恢復原有 `hover:bg-background-hover`，示例行以 200ms 色彩過渡；示例行仍不可點開區塊瀏覽器，避免假交易連結。

相關檔案：

- `apps/evm/src/pages/Dashboard/PositionCardsTab/index.tsx`
- `apps/evm/src/pages/Dashboard/styles.css`
- `apps/evm/src/components/TransactionsList/index.tsx`
- `apps/evm/src/components/TransactionsList/TransactionRow/index.tsx`
- `apps/evm/src/pages/Dashboard/Transactions/index.tsx`

本機截圖（`/private/tmp`，可能不會長期保留）：

- `/private/tmp/venus-dashboard-vaults-28px-mockup.png`
- `/private/tmp/venus-dashboard-hubs-28px-mockup.png`
- `/private/tmp/venus-dashboard-transactions-glow-hover-mockup.png`

## 示例資料與邊界

- New 的持倉與交易示例只在 BSC 主網、New 模式及本機 demo 帳戶條件成立時顯示；不是實際錢包持倉或鏈上交易。
- 示例來源：`apps/evm/src/pages/Dashboard/Markets/getNewPreviewPool.ts`、`apps/evm/src/pages/Dashboard/Transactions/getNewPreviewTransactions.ts`。
- 公開官網 `https://venus.io/#/dashboard?chainId=56&tab=transactions` 在未連錢包時只顯示空狀態，因此未能在官網直接觀察單筆交易 hover；本機調整對照現有 `TransactionRow` hover 樣式。

## 已做驗證

- 桌面 1280px：Vaults／Hubs 網格實測 gap 28px；Transactions 外框偽元素運行 `panel-travel`；示例交易 hover 底色有生效。
- 手機 390px：Hubs 單欄 gap 28px，沒有水平溢出；Transactions 外層框取消，逐筆卡片邊界保留。
- `tsc --noEmit`、涉及檔案的 Biome／Stylelint、`git diff --check` 在最近一次修改後通過。
- 目前 `main` 的 HEAD 為 `5f79b5c`；工作樹已有多項未提交改動，包含本次及更早工作。**先看 diff，勿 reset 或清除其他改動。**
- 2026-10-13 再次啟動本機 Vite；當時 `127.0.0.1:5176` 有程序監聽。服務狀態會變，進入新對話後先檢查。上一次 App 內置瀏覽器拒絕代為重載本機分頁，因此重新啟動後的畫面未獲瀏覽器驗證。

## 下一步

1. 請使用者在本機 New Dashboard 看 28px 留白與 Transactions 的動態光邊，確認疏密是否合適。
2. 若要繼續改，直接修改現有 Vaults／Hubs／Transactions 版面；不要建立另一套測試組件。
3. Figma、Git 提交、Vercel 部署尚未由這次 Dashboard mockup 執行；執行前重新核對目標與目前狀態。
