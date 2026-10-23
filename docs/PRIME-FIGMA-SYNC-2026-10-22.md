# Prime 銅色元件對照 — 2026-10-22

## 來源與範圍

- Figma：[Venus UI Kits_new / 3212:68745](https://www.figma.com/design/ffh5VFqviRERdBN5rhJkgv/Venus-UI-Kits_new?node-id=3212-68745)。
- 已讀本機 Figma 元件：Prime / Borrow、Default / Hover / Avtive、VIP Off / On，共 12 variants。
- Figma 當時顯示未能同步提示；本次依據本機可見設計，不代表已驗證雲端保存。
- 使用者確認暫時只做銅色，金色之後再接。
- 只影響目前 E 預覽 Light / Dark；不調整共享 Button、O / New、APY 計算、資格、交易或路由。

## 視覺對照

- 沿用現有向量 Prime 標誌，圓章 16px，深色標誌配銅色金屬漸層。
- 膠囊：14px Semibold / 150%、水平 padding 4px、垂直 2px、icon 與數字 gap 4px。
- 1px 內框不增加高度；Default 透明底，Hover / Active 使用各 theme 的中性底。
- 保留鍵盤 focus outline 及 reduced-motion 支援。
- Figma 可見樣式名稱為 `VIP/Fill`、`VIP/Ring/Default`；本地漸層屬視覺對照，並非從 Figma 匯出的完整 stops / positions。
- 數字的銅色漸層為可讀性微調：Dark 使用同一套金屬色中較亮的 stops；Light 使用現有深銅色角色及兩者混色，避免 hover / pressed 中性底讓小字對比不足。圓章仍保留完整金屬色階。
- 已啟用 Prime 加成的既有綠色 APY / 星星語意不變。

## 實作位置

- `apps/evm/src/demo/LiquidityLightPreview/prime-refresh.css`：E 範圍內的局部材質角色，避免更動全域 Design Token。
- 同資料夾 `index.tsx` 載入樣式；舊 E Light 白圓底移除。
- E popup 的一般按鈕材質排除 Prime，讓 Prime 細框及狀態不被覆蓋。

## 下一步建議

先確認 Figma 已重新同步，再把 Prime 的銅色材質與 Light / Dark 狀態整理成元件規格。產品下一步優先做可點擊的 Lite / Pro 首次進站引導：保留 Pro 深連結、彈窗可關閉，只記錄使用者明確選擇；Pro Logo 的固定目的頁仍需確認。金色 VIP 的資格與資料接線另外安排。

## 本地驗證

- 45 項相關測試通過，包括 E scope、元件規格、Light / Dark hover 與 pressed 色階對比。
- TypeScript 檢查及 production build 通過；Sentry 因沒有 auth token 未建立 release / 上傳 source maps，與本次樣式無關。
- 1440px 桌面 Light / Dark、Hover、390px Light 手機已檢查；膠囊實測 25px 高、圓章 16px，手機沒有頁面水平溢出。
- 重新載入後仍套用新版。USDT 列表與來源列表的參考 APY 保持既有數字及非即時資料提示；目前示範帳號的 Core 表單未顯示 Prime 加成，因此不聲稱完成已啟用 Prime 資料狀態的端到端驗證。

本次不包含 Figma 寫入、Git commit / push 或部署。
