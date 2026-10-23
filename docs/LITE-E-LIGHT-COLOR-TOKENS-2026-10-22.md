# E Light — 冷灰白色調與 Figma 對照

2026-10-22。使用者已選擇冷灰白方向；本次只修改 E 的 Light 外觀，不改 Dark、O、New、排版或交易邏輯。以下是本地實作的對照，不代表已建立或更新 Figma Variables。

## Source of truth

`apps/evm/src/demo/LiquidityLightPreview/e-light.css`

全部規則受 `:root[data-glass-study='lite-experiment'][data-liquidity-theme='light']` 限定。`--e-light-*` 是此實驗的局部語意角色；沒有更改 `packages/ui/src/theme.css`。舊的 `--color-white` 仍作主要前景的 compatibility alias，不應在 Figma 被命名為 White primitive。

## 建議對照現有 Figma Semantic Color collection

先核對目前 library 是否已有相同用途的變數；有的話沿用，不重建重複 collection。表內 CSS 值以 source 為準。

| Figma 語意用途 | E Light CSS 角色 | 本地 Light 值 |
| --- | --- | --- |
| surface/page | surface-canvas | #F4F7FB |
| surface/panel | surface-panel | #FBFCFE |
| surface/raised | surface-raised | #FFFFFF |
| surface/subtle | surface-subtle | #EDF2F8 |
| surface/field | surface-field | #EAF0F7 |
| surface/control | surface-control | #F7F9FC |
| surface/hover | surface-hover | #E6EEF9 |
| surface/disabled | surface-disabled | #E4EAF2 |
| text/primary | text-primary | #17263D |
| text/secondary | text-secondary | #53627A |
| text/muted | text-muted | #5B6B83 |
| text/on-accent | text-on-accent | #FFFFFF |
| border/subtle | border-subtle | #D4DDE8 |
| border/control | border-control | #B7C4D5 |
| border/focus | border-focus | #2464CB |
| border/error | border-error | #B72C45 |
| action/primary/{start,middle,end,highlight,hover} | accent-* | 見 CSS；白字與各色點一起驗證 |
| text/brand/{start,end} | heading-* | #2664BD / #3B76CF |
| text/mode-label/{start,end} | label-* | #405A7A / #5E7594 |
| text/prime/{start,end} | prime-* | #72452E / #986447 |
| status/success/fill | success | #00815E |
| status/warning/fill | warning | #926109 |
| status/danger/fill | danger | #BF3045 |
| ambient/line | ambient-line | #8398B4 |
| ambient/dust | ambient-dust | #7890AE |
| ambient/particle | ambient-particle | #4D89C5 |

Dark mode 應把同一語意角色綁到目前 Dark 的對應值，而不是把 Dark 改成上述 Light 值。現有 Dark 值需以各元件實際樣式核對；本次沒有替 Dark 新建一套外觀。

## 材質不等於一個 Color variable

- Panel：近白實心底，冷色、低強度、向下偏移陰影。
- Popup／Dropdown：冷白半透明底，保留目前的 blur／圓角，減輕遮罩及黑色投影。
- Field：藍灰凹槽，default／focus／error／disabled 分別有明確設定。
- Search：使用現有 surface/control 灰白底，移除凹槽陰影；聚焦不換底色，只保留細藍框。此例外不影響金額 input。
- Primary／Selected：同一藍色漸層，前景固定使用 text/on-accent；不要使用會隨 mode 反轉的 legacy white。
- 將漸層每個 stop、shadow color 綁到 Variables；複合 Fill／Effect 結構用 Styles 保存。能用 Number variables 的效果參數亦可獨立綁定。

## 驗證界線

自動測試檢查規則的 E Light scope、主要實色前景／背景配對，以及漸層各個 stop。它不是完整逐像素可及性認證；半透明合成、背景 blur、動態反光仍須實際畫面檢查。

本次不包含 Git commit、push、Vercel 部署或 Figma 寫入。

表單與切換細修：E 的 Light / Dark 交易表單分隔線使用現有 border token 的 40% 強度，不影響輸入框、風險條、分頁選中線。Earn/Borrow 不重播整張列表卡片的淡入動畫（原本 remount 會短暫讓背景透出）；仍保留首次頁面進場。

Prime 後續以 Figma `3212:68745` 取代之前的白色圓底試版：Light / Dark 均用銅色金屬圓章、深色標誌及金屬細框；Light 小字保留現有深銅色，避免淺金屬高光影響可讀性。只實作銅色，金色 VIP 之後再接；詳見 [Prime 元件對照](./PRIME-FIGMA-SYNC-2026-10-22.md)。

後續細修：E Light 的 Universal Money Markets 標題沿用 `--text-3xl--line-height`（1.2），修正原本行高 1 導致漸層字尾被截斷；不更動字型、字級、Dark、O 或 New。

## Light 背景試版

只限 E Light：銀藍灰線、疏落藍灰星塵、少量藍色流動粒子，保持現有線路與 speed 0.2。星塵重用原位置，但密度為原本六分之一，使用靜態 SVG；手機與 reduced motion 亦使用靜態星塵，不新增背景動畫迴圈。桌面繼續用現有 renderer 畫線及流動粒子。

`ambient/*` 是本地背景專用語意色，新增原因是 UI 主色不應同時控制背景裝飾。整層 opacity 0.6、星塵層 0.35，中心徑向 mask 淡出，讓背景主要留在左右空間。renderer 的 E Light opt-in 採低透明度細線、關閉寬光帶、縮短粒子；上述是局部視覺校準，不修改共享 Design Token 或 Dark 設定。Figma 對照可使用 ambient 三個 Color variables；opacity / mask 為 Effect 與結構設定，不是一個 Color variable。
