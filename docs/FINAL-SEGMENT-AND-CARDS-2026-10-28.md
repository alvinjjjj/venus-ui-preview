# Final（E）更新：Segmented 同 Dashboard 卡（2026-10-28）

只改咗 Final（E / `lite-experiment-v2`），O、New 冇郁。所有改動未 commit。

## 1. Segmented（30D / 6M / 1Y 等）跟 Figma

Figma 參考：node `3973:1293`（Venus-UI-Kits_new）

| 項目 | 數值 |
|---|---|
| Container 底色 | `#1E2431` |
| Container 邊線 | 1px `#30354A` |
| Container 圓角 | 8px |
| Container padding | 4px（CSS 寫 3px + 1px 邊線） |
| Container 內陰影 | 上白 27%、下白 9% |
| Container 總高 | 41px |
| Tab 高度 | 33px |
| Tab padding | 6px / 12px |
| Tab 圓角 | 8px |
| Tab 間距 | 0 |
| 未選中字 | 14px、400、`#AAB3CA` |
| 選中字 | 14px、600、白色 |
| 選中 tab | 藍色漸變，邊線 `#0D88E0` |
| Focus ring | 拎走 |

範圍：Final 入面所有 `[data-venus-button-group]`，包括 Dashboard、popup 入面嘅 Supply/Withdraw 等。

## 2. Dashboard 卡加黑底

- 有邊框嘅卡（Supplied、Borrowed、Transaction、No active positions）：10% 黑色 + 50px 模糊，同 Markets 列表張卡一樣。
- 冇邊框嘅區域（Net worth 頂部、圖表、Positions 嗰行、Health factor 數字）：保持透明。

## 改咗嘅檔案

- `apps/evm/src/demo/GlassVersions/form-segments.css`：segmented 樣式、Dashboard 卡底色
- `apps/evm/src/demo/GlassVersions/eHeaderMirror.ts`：唔再將 New 嘅樣式複製去 button group（之前佢嘅 `padding: 0 !important` 蓋咗 Figma 嘅 4px）

## 未做 / 待確認

- Light mode：segmented container 喺白底上面好淡，可能要調深。
- Markets 頁嘅 Earn / Borrow 同其他 segmented 位，未逐個核對。
- Liquidity Hub、bStock index、bStock growth 三個分頁嘅卡，未逐個撳入去睇。
- Figma 3973:1293 入面 6M、1Y 仲係 `Button / Secondary`，未換成 Tab。

## 待做方向：Pro mode 跟 Lite mode 玻璃風格（2026-11-03 記低）

以 Lite（Final）嘅 popup 做標準，Pro mode 逐步改：

1. 卡外框：Pro 同 Lite 統一用灰色邊線（`surface/popup/border`），唔再用藍色。藍色只留俾選中狀態同主要按鈕。
2. Supply / Withdraw：Pro 改用 Figma Button switch（3966:47455），選中 = `State=Active, Style=Filled`，未選中 = `Style=Ghost`。
3. 入面其他部分（輸入框、MAX、餘額行、Supply 按鈕）跟 Lite 樣式。
4. Figma 變數 `surface/pop-up/stroke`（Dark = `blue/500`）逐步淘汰或改灰；改之前先查邊啲 component 用緊。
5. 未決定：Pro 獨有排位（例如表單固定喺頁面右邊）係保留排位只換樣式，定係跟 Lite 排位。

已完成（Figma）：Button / Secondary（3966:47297）Style=Filled/Ghost、Disabled = Default 樣 + 邊線 + opacity 60%；Button switch 用新按鈕，Light 色跟網站（`surface/switch/track`、`border/switch/track`、`border/switch/selected`）。
網站顏色變數：`apps/evm/src/assets/styles/venus-tokens.css`（由 Figma 匯出，新變數要重新匯出）。
