# E2 厚玻璃 Token 圖示試驗

日期：2026-10-23

## 範圍

只套用於 Lite E2（lite-experiment-v2）Universal Money Markets 主頁的 Earn / Borrow 資產列表。市場來源、交易表單、E / E3、Pro、其他頁面及全域 TokenIcon 均保留原圖示。

## 素材與接線

- 123 份 v3 圖示置於 apps/evm/public/images/experiments/e2-thick-glass/。
- e2TokenIcons.json 以 chainId + address 優先配對，只有名稱無歧義的 symbol 才作後備。未找到時保留原圖。
- e2TokenIcons.ts 只產生顯示用 token 副本；沒有修改資料物件、APY、地址或交易功能。
- LiteMarkets/index.tsx 及 BorrowMarkets.tsx 只有主列表儲存格在 E2 呼叫轉換。

## Figma

獨立試驗檔：Venus · Thick Glass Tokens · E2 Trial
https://www.figma.com/design/4iVg6O6ThhA7ogkuYRhjCT/

頁面：E2 Trial · Thick Glass Icons。已匯入 123 份圖示整合 SVG，確認可見向量圖層。91 份純向量，32 份保留原有點陣部分。

本機單一 .fig 備份：../output/thick-glass-reviewed-v3/Venus · Thick Glass Tokens · E2 Trial.fig（相對專案上層輸出目錄）。

## 驗證

- 兩個既有 E2 相關測試檔共 11 項通過。
- Node Web Storage 與測試環境 localStorage 衝突，以 NODE_OPTIONS=--no-experimental-webstorage 執行測試；沒有更動測試設定。
- tsc --noEmit 通過；新增 TS / JSON 的 Biome 檢查通過。
- 本機 5176：E2 Earn 26 款圖示全部載入成功；Borrow 抽查 USDT / BTCB / BNB / USDC / ETH 成功。
- 切至 E：USDT 保持原 SVG；E3 沒有載入厚玻璃圖示；E2 USDT 市場來源內頁亦沒有載入厚玻璃圖示。
- 390px 手機確認圖示載入，document scrollWidth = innerWidth = 390，臨時 viewport 已還原。
- 已儲存桌面、手機及 Figma 畫面於專案上層 output/thick-glass-reviewed-v3/。

此為本機試驗，沒有 commit、push 或部署。
