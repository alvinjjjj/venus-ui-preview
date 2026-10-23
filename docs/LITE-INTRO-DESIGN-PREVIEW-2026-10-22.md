# Lite 首次進站引導 — 設計預覽與首次顯示

2026-10-23 訪客公開瀏覽補充：Lite / Pro 現在可在未連錢包時選擇，取代下方歷史段落的「訪客強制 Lite」限制；這不是自動連錢包或放開交易。首次直接 Lite 介紹 Pro、外部 Pro 介紹 Lite、各自一次及關閉留原頁的規則不變，詳見 `docs/LITE-E-EXPERIMENT.md`。

## 2026-10-23：更正為「在原頁介紹另一個版本」（最新）

使用者已再次確認：不是先進 Pro 再介紹 Pro，而是首次停留在 Lite 時介紹 Pro。此節取代下方之前的觸發規則。

| 首次直接入口 | 留在哪一頁介紹 | 明確試用操作 |
| --- | --- | --- |
| Lite | Lite 上介紹 Pro | Pro / Try Pro now → Pro Liquidity Hub |
| 外部 Pro 深連結 | 原 Pro 頁上介紹 Lite | Lite / Try Lite now → Lite |

- 兩款各自只自動顯示一次；X / Escape / 卡外只關閉，不修改原頁路由、參數、模式或 state。
- Pro 卡片右上角改為 Pro、主按鈕改為 `Try Pro now`；不再使用留在 Pro 的 Got it，也不會指向 Lite。
- 一般站內 Lite / Pro 切換不作新的直接入口。從介紹卡按 Try 切換後，不會立即連環彈出另一款介紹。
- 原有眼睛手動重播現在同樣留在當前頁，不再先跳到 Pro；重播不消耗自動首次記錄。
- Lite 的既有 `venus-interface-intro-lite-seen-v1` 保留；Pro 改用 `venus-interface-intro-pro-seen-v2`，避免「已進 Pro 後才顯示」的舊 v1 記錄阻擋新的 Pro 邀請。沒有清除任何舊記錄或其他使用者設定。
- 延用下方載入／其他彈窗等待、儲存失敗回退、非產品頁排除、深連結及錢包政策保護。未調整全域樣式或 Design Token；獨立 HTML 仍保留作舊設計實驗，不是自動顯示規則來源。

### 更正後驗證

- 105 項相關測試通過：首次規則 / 儲存 36、主 App 整合 26、模式判斷 15、共用卡片 20、既有獨立情境 8；TypeScript、變更範圍格式 / lint、diff 空白檢查通過。
- `localhost:5176` 作獨立測試 origin：首次 Lite 原頁自動介紹 Pro；Escape 留 Lite；重新整理不重彈；重播不換頁；Try Pro now 才進 Liquidity Hub，無連環彈窗；新開 Core pool 深連結仍可獨立自動介紹 Lite，X 保留該深連結及 `tab=markets`。
- 原 `127.0.0.1:5176` Lite E / Light 的模擬 Normal account：手動重播 Pro 留在 Lite，Try Pro now 進 Pro；手動 Lite 介紹的 Try Lite now 返回 Lite，兩次均無自動連環彈窗。未在此 origin 消耗新的 Pro v2 自動記錄。
- 已檢查桌面 Dark（1280×720）和原工作頁 Light 手機闊度（397×889），沿用已確認的卡片外觀。QA 圖片：`/tmp/venus-corrected-onboarding/lite-invites-pro-dark.png`、`/tmp/venus-corrected-onboarding/pro-invites-lite-dark.png`、`/tmp/venus-corrected-onboarding/lite-invites-pro-light-mobile.png`。
- 未重新執行下方已記錄的舊 AppRoutes / NavBar 模擬工具問題測試；不宣稱整個專案測試全綠。
- 只有本地修改，未 commit、push、部署或寫入 Figma。

## 2026-10-23：首次自動顯示初版（規則已由上節更正）

此節取代下方設計歷史中的「尚未接自動顯示／storage」描述；保留已確認的卡片外觀，未更動全域 Design Token。

| 入口 | 首次自動介紹 | 關閉後 |
| --- | --- | --- |
| Lite 的 Pro 切換掣進入 Pro | Pro | 留在剛進入的 Pro 頁 |
| 外部連結／新開網址直接進 Pro 產品頁 | Lite | 保留原 Pro 深層連結及參數 |
| 直接進 Lite | 不彈 | 保持 Lite |

- Lite / Pro 各自只自動顯示一次。記錄按同一個瀏覽器、同一個網站 origin 保存，不按錢包或帳戶保存；本地和 Vercel 互不共用。
- localStorage key：`venus-interface-intro-lite-seen-v1`、`venus-interface-intro-pro-seen-v1`。只有卡片實際 `showModal()` 後才記為已顯示，並非點擊模式掣便消耗；顯示後即使重新整理亦算已看過。
- 關閉（X / Escape / 卡外）與 Pro 的 Got it 都只收起介紹，不修改當前路由、查詢參數或模式。只有明確按 Lite / Try Lite now 才返回 Lite。
- 重新整理、瀏覽器返回及一般站內 Pro 頁連結不當成新的外部入口。About Us、條款、Skills 和元件展示頁不自動介紹；舊 `/account`、`/staking`、`/pool` 入口先跟隨既有重導向再介紹。
- 頁面載入完成、其他彈窗關閉後才顯示。換去不同頁面會取消尚未呈現的請求，避免覆蓋其他操作。
- 控制器仍只有原本眼睛 icon，可隨時手動重播；重播不消耗任何首次記錄。已將主 App 的卡片宿主移出會隨 Lite / Pro 重建的 Footer，使用不持久化的預覽請求；舊 `interfaceIntroPreview` 交接方式已取代。
- 已連錢包時，無明確模式 state 的 Pro 深連結會由實際路徑判定 Pro；未連錢包的既有模式限制不變。本次未新增自動選擇 Lite 的偏好、域名跳轉、analytics 或錢包操作。
- 儲存被封鎖／容量不足時，降級為本次文件生命週期內只彈一次；跨重新整理的去重需要 localStorage 可用。

### 本次驗證

- 89 項專項測試通過：首次規則 / 儲存 31、主 App 引導整合 16、模式判斷 15、共用卡片 19、既有獨立情境 8。
- TypeScript 及變更範圍格式 / lint 通過。
- 本地瀏覽器實測：直接 Lite 不彈；真正 Lite → Pro 自動介紹 Pro；Got it 留在 Liquidity Hub；重訪與重新整理不重彈；另一分頁 Core pool 深連結自動介紹 Lite；X 保留同一深連結（包含該頁原有的 `tab=markets`）；其後開另一 Pro 連結不再介紹；眼睛仍可重播，Escape 留在原頁。已觀察手機及桌面闊度呈現。
- QA 圖片：`/tmp/venus-interface-onboarding/lite-to-pro-auto.png`、`/tmp/venus-interface-onboarding/external-pro-lite-auto.png`。
- 本機 in-app browser 已在上述實測寫入兩款首次記錄，所以這個瀏覽器不會再自動彈；仍可用原有眼睛 icon 重播。測試分頁已關閉，保留原本工作頁。
- 額外執行舊 AppRoutes（38 項）及 NavBar（5 項）測試未通過：目前測試工具的 Zustand curried-create mock 報 `store.getState is not a function`，以及真實錢包 connector 為空／測試環境缺少 ResizeObserver。未為本任務修改共用測試工具，亦不把這兩組算入已通過測試。
- 僅本地修改；沒有 commit、push、部署或 Figma 寫入。

## 2026-10-23：Pro 介紹版本

新增共用 `InterfaceWelcomeDialog` 的 Lite / Pro 內容；保留 `LiteWelcomeDialog` 作現有 Lite-only 實驗入口。兩款沿用同一張右上角卡片、VIP 品牌 banner、公司字體、共用按鈕及連續尖角輪廓。

- Pro：`Meet Venus Pro.`、Venus Pro banner、個別市場及較詳細供應 / 借貸控制的介紹，CTA 為 `Got it`。Got it / X / Escape / 卡外只關閉，留在 Pro；右上角 Lite 掣仍可明確返回 Lite，不把 Got it 當作切換版本。
- Lite：保留 `Meet Venus Lite.`、現有文字及 `Try Lite now`；關閉保持原 Pro 頁，只有明確按 Lite 才切去 Lite。
- 主 App 仍只用原本眼睛 icon，不加選單：Lite 時標籤 `Preview Pro introduction`，按下走原有 Pro 導航後顯示 Pro 卡；Pro 時標籤 `Preview Lite introduction`，按下在原頁顯示 Lite 卡。
- 這是手動設計預覽，不接自動首次顯示、按域名判斷、已看過記錄或偏好儲存。正式 Lite / Pro 訪客存取規則、錢包權限與一般模式切換均未更改，未部署。

預覽交接透過一次性 router state `interfaceIntroPreview: 'pro'` 傳到 Pro 頁，避免換頁重建控制器時丟失彈窗；Got it / 關閉會移除該標記，不改 interfaceMode。此標記不是正式「已看過」記錄。27 項測試（19 項元件、8 項既有情境）及 TypeScript 通過；本地模擬 Normal account 已檢查 Pro Light / Dark 的 1440×1000、320×667、字體載入、無橫向溢出、Got it / Escape 留在 Pro、關閉後重新整理不重播，以及 Lite CTA 返回真實 Lite 頁。

## 現有版本的簡單入口（最新）

使用者修正要求：不要另一套遙控器。主 App `http://127.0.0.1:5176/#/?chainId=56` 右下角原有 Preview 控制器，Components / 月亮 / Change notes 後加一個眼睛 icon（`Preview Lite introduction`，提示「首次引導預覽」）。按一下在當前真實畫面重播同一張介紹卡；關閉留在原頁，Try Lite 使用既有 Lite 路由。沒有情境選單、自動進站判斷或偏好寫入。Light / Dark 沿用當前主題，無共享 token 改動。

最新調整：保留右上角提示卡，不改成中央彈窗。新增沿用 VIP 彈窗 `background.jpg` 的藍黑品牌 banner，配現有 Venus logo 及 Lite 字樣；標題仍用 Proxima Nova / 20px Semibold / 150%，正文 14px 並補充資產瀏覽、比較利率的介紹。CTA 改為純文字「Try Lite now」，移除箭嘴；不加 Stay on Pro 或「Pro is always one click away」。引導中的 Lite 與獨立預覽 Lite / Pro 入口保留 UI kit 黑底、白字及幼藍框，取消額外發光外圈。上方 16×8px 小三角加同色接駁層，避免卡片頂線穿過。原有 X、Escape、路由與預覽入口不變。此處取代下方初版的展示圖與次要行動描述。

主 App Lite E 的 Lite / Pro 切換掣亦在兩種主題固定黑底、白字及藍框，保留原本外框流動效果；只限此元件，不改 O / New 或全域 token。此版已檢查桌面 1440×1000、手機 320×667 的 Light / Dark、圖片載入、無橫向溢出、Escape 留在原 Pro 頁及 Try Lite now 進入真實 Lite 頁。未接自動首次顯示、storage 或部署。

字體與尖角修正：標題沿用 P2 Semibold（20/30）、正文 P3 Regular（16/24），CTA 直接使用共用 `PrimaryButton`（14/21 Semibold、48px 高度）。取消會覆蓋字重的 `font: inherit`，標題 / X 改為同一個置中 header，主要區塊統一 20px 間距。卡片與尖角的外輪廓由合併後透明度一起投影，不再加 inset 頂線或遮線補片。另以只供此介面使用的 `VenusIntroProxima` 引用本專案現有 Regular / Semibold 字檔，避開 UI dependency 指向另一個 checkout 的字體路徑，不改全站字體或 Design Token。

以下獨立 mock-up 只保留作之前的設計實驗，不再是主要操作入口。

本地入口：`http://127.0.0.1:5176/lite-intro-preview.html`。

獨立 React entry，不載入主 App、錢包初始化或正式路由，不讀寫使用者偏好。不影響既有 E / O / New。

## 設計

- Pro 背景保留原頁脈絡，輕微 blur / 遮罩。
- 右上角 Lite 保持清晰並高亮；介紹卡貼近按鈕，用小尖角連結。
- 一張卡說明簡化介面，用市場畫面示意，不做多步導覽。
- Try Lite / 高亮 Lite：在預覽內切至 Lite。
- Stay on Pro / X / Escape / 卡外：關閉並留在 Pro。
- Lite 內按 Pro 可返回；底部可重播及切換 Light / Dark。
- Native dialog 提供 modal 語意、焦點限制及背景 inert。

## 界線

所有市場數據為示範，不是即時利率或可交易市場。可搜尋、篩選及切換 Earn / Borrow，不能連接錢包或執行交易。

只示範體驗：首次、dismiss 與偏好現在由遙控器於記憶體內模擬，不接正式使用者判斷、根域名跳轉、storage、analytics、footer 或真實 Lite / Pro 導航。Pro Logo 在此預覽回到 Core pool，正式目的頁仍待確認。介紹文案為試稿，未接翻譯。

樣式沿用現有 Proxima Nova、UI kit 及 E Light 冷灰白 palette；新增的 `--intro-*` 只限此獨立容器，不修改全域 Design Token。

確認設計後，下一步才把可複用 `LiteWelcomeDialog` 接到實際 Pro / Lite 控制與首次顯示策略。

## 情境遙控器

右下角可開啟；彈窗顯示時遙控器放在同一個 native dialog top layer，避免被 blur / inert 擋住。每次揀完情境會自動收起，亦可隨時切換主題及重播。

- 首次進入首頁：清空模擬偏好，直接顯示 Lite，沒有彈窗。
- 首次進入 Pro：清空模擬偏好，Core pool 顯示可關閉的引導。
- 重訪首頁：跟隨明確選擇的 Lite / Pro；未選擇則預設 Lite。
- 重訪 Pro 連結：保留 Core pool；若尚未看過引導才顯示一次。
- 關閉引導只標記已看過，不自動選擇 Pro；Try Lite / 模式切換才改模擬偏好。
- 重播保留模擬偏好；Logo 也不覆寫偏好。
- 下方顯示入口、已選模式、引導狀態及中文備註。重新整理即重設，沒有 localStorage / cookie / 錢包寫入。

## 驗證

- 遙控器版共 21 項測試通過（13 項元件互動、8 項情境規則），包括初版互動回歸。
- TypeScript 與新檔案格式 / lint 通過。
- 指定此 HTML 為入口的獨立 production build 通過；主 App 預設 build 不包含此頁，部署前須另行安排入口。
- 瀏覽器已檢查 1440×1000 Dark / Light、390×844 及 320×667 手機。短手機使用較緊湊間距，兩個主要選擇完整可見，無頁面水平溢出。
- 已實際試 Try Lite、返回 Pro、Stay on Pro、Escape、重播及搜尋 / Borrow。
- 遙控器版另檢查 1440×1000 Dark / Light、320×667 手機展開 / 收起；實試首次首頁、首次 Pro、選 Lite 後重訪首頁、保留 Pro 深連結，以及在遙控器內按 Escape 只收起工具、不關閉引導。
- 沒有 commit、push、部署或 Figma 寫入。
