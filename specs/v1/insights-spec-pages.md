### insights-capacity-planning.png

**現況描述**  
- 頁面置頂工具列提供時間範圍下拉選單與兩個操作按鈕：「觸發 AI 分析」與「匯出報表」，分別對應 `Dropdown` 與 `ToolbarButton` 元件，並會套用 AI 樣式以凸顯自動分析入口。 【F:pages/analysis/CapacityPlanningPage.tsx†L200-L219】
- 主要內容區塊包含左側 3 欄寬的「資源使用趨勢 (含預測)」折線圖與右側 2 欄寬的「CPU 容量預測模型」折線圖，皆透過 EChartsReact 顯示並使用 ChartTheme 配色。 【F:pages/analysis/CapacityPlanningPage.tsx†L224-L235】
- 下方兩個玻璃卡片分別呈現 AI 建議清單與詳細分析表格；建議區塊顯示影響與投入標籤，表格則列出資源名稱、目前/預測用量、建議與成本估算，並針對建議嚴重度套用色彩樣式。 【F:pages/analysis/CapacityPlanningPage.tsx†L239-L292】
- 後端假資料定義了三筆 AI 建議、四筆資源分析記錄與時間範圍選項，確保畫面有預設內容。 【F:mock-server/db.ts†L2176-L2240】【F:mock-server/db.ts†L2242-L2283】

**互動流程**  
- 初次載入呼叫 `fetchData()` 取得容量資料並設定預設時間範圍；若 API 回傳 `default` 選項，會自動帶入該值。 【F:pages/analysis/CapacityPlanningPage.tsx†L41-L66】
- 使用者切換下拉選單僅更新 `timeRange` 狀態，但目前未觸發重新請求；需確認是否應在變更時呼叫 API（[NEEDS CLARIFICATION]）。 【F:pages/analysis/CapacityPlanningPage.tsx†L200-L207】【F:pages/analysis/CapacityPlanningPage.tsx†L41-L66】
- 「觸發 AI 分析」按鈕會以 `isRefresh=true` 重新呼叫同一 GET API，顯示載入指示並防止重複點擊；錯誤時提供重試按鈕。 【F:pages/analysis/CapacityPlanningPage.tsx†L41-L61】【F:pages/analysis/CapacityPlanningPage.tsx†L212-L217】【F:pages/analysis/CapacityPlanningPage.tsx†L182-L190】
- 「匯出報表」會檢查 `resource_analysis` 是否有資料，若為空則以 `alert` 告知，否則依序輸出 CSV。 【F:pages/analysis/CapacityPlanningPage.tsx†L155-L172】【F:services/export.ts†L1-L37】

**API 與資料流**  
- 主要資料來源為 `GET /analysis/capacity-planning`，回傳趨勢、預測模型、建議、資源分析與時間範圍選項，伺服器端動態生成趨勢並回傳預設選項。 【F:pages/analysis/CapacityPlanningPage.tsx†L41-L55】【F:mock-server/handlers.ts†L2960-L3004】
- AI 建議與資源分析資料由 `DB.capacity_suggestions`、`DB.capacity_resource_analysis` 提供，包含嚴重度、成本影響與 `last_evaluated_at` 時戳。 【F:mock-server/db.ts†L2176-L2240】【F:mock-server/db.ts†L2242-L2277】
- `Dropdown` 讀取 `options.time_range_options`，但目前未將所選值回傳給 API；若未來後端支援需補上查詢參數。 【F:pages/analysis/CapacityPlanningPage.tsx†L194-L207】
- 匯出流程透過 `exportToCsv` 產生檔案並觸發瀏覽器下載。 【F:services/export.ts†L1-L37】

**需求與規格定義**  
- 使用者需能在單一畫面瀏覽容量趨勢、預測模型、AI 建議與資源表格，保有與設計稿一致的雙圖＋雙卡配置。 【F:pages/analysis/CapacityPlanningPage.tsx†L224-L299】
- 觸發 AI 分析時必須重新抓取最新資料並顯示載入狀態；若 API 失敗要出現錯誤訊息與重試控制。 【F:pages/analysis/CapacityPlanningPage.tsx†L41-L61】【F:pages/analysis/CapacityPlanningPage.tsx†L182-L190】
- 匯出功能需避免空資料，並以 CSV 格式輸出表格欄位（資源、用量、建議、成本、時間）。 【F:pages/analysis/CapacityPlanningPage.tsx†L155-L170】
- 時間範圍選單需與後端回傳選項同步，並釐清是否需要觸發查詢或僅作展示（[NEEDS CLARIFICATION]）。 【F:pages/analysis/CapacityPlanningPage.tsx†L194-L207】
- 型別定義 `lastEvaluated_at` 與回傳的 `last_evaluated_at` 命名不一致，需統一為 snake_case 以避免型別錯誤。 【F:types.ts†L896-L913】【F:mock-server/db.ts†L2206-L2276】

---

### insights-log-explorer.png

**現況描述**  
- 頁面頂部工具列左側提供「搜尋和篩選」按鈕、右側為即時切換、AI 總結與匯出報表按鈕，分別控制搜尋 modal、直播更新、AI 總結 modal 與 CSV 輸出。 【F:pages/analysis/LogExplorerPage.tsx†L174-L189】
- 工具列下方顯示時間範圍快捷按鈕與堆疊長條圖，統計不同級別的日誌量；資料由前端依照目前載入的日誌重新彙總。 【F:pages/analysis/LogExplorerPage.tsx†L200-L219】【F:pages/analysis/LogExplorerPage.tsx†L92-L134】
- 主要列表使用 12 欄格線呈現時間戳、級別、服務與訊息，點擊可展開 `JsonViewer` 顯示原始細節，並以左側彩色邊線突顯選取。 【F:pages/analysis/LogExplorerPage.tsx†L221-L253】
- 當前日誌資料與時間選項來自後端假資料；時間範圍選項定義於 `MOCK_LOG_TIME_OPTIONS`。 【F:mock-server/db.ts†L1754-L1769】【F:mock-server/db.ts†L2818-L2820】

**互動流程**  
- 初次載入會根據 URL 查詢字串 `q` 帶入關鍵字，並以 `filters` 狀態預設 15 分鐘時間範圍後呼叫 `fetchData()`。 【F:pages/analysis/LogExplorerPage.tsx†L24-L72】
- 切換即時模式時，建立 5 秒輪詢並限制回傳數量為 5 筆，插入後保留最多 200 筆；關閉即時模式或卸載時會清除計時器。 【F:pages/analysis/LogExplorerPage.tsx†L47-L90】
- 快捷時間按鈕更新 `filters.time_range` 並觸發重新取數；進階搜尋 modal (`UnifiedSearchModal`) 亦能調整時間範圍後回填 `filters`。 【F:pages/analysis/LogExplorerPage.tsx†L200-L273】【F:components/UnifiedSearchModal.tsx†L300-L323】
- 「AI 總結」打開 `LogAnalysisModal` 並以 Loading 狀態等待 `POST /ai/logs/summarize` 回傳摘要、模式與建議；錯誤時保持空狀態。 【F:pages/analysis/LogExplorerPage.tsx†L140-L153】【F:components/LogAnalysisModal.tsx†L8-L74】
- 匯出按鈕在無資料時使用 `alert` 提示，否則輸出目前列表的基礎欄位 CSV。 【F:pages/analysis/LogExplorerPage.tsx†L156-L171】【F:services/export.ts†L1-L37】

**API 與資料流**  
- 日誌列表透過 `GET /logs` 取得，支援 `keyword`、`time_range` 等查詢參數並回傳分頁結構；程式碼將頁面固定為 1、每次最多 200 筆。 【F:pages/analysis/LogExplorerPage.tsx†L47-L66】【F:mock-server/handlers.ts†L3207-L3219】
- AI 總結呼叫 `POST /ai/logs/summarize`，伺服器回傳固定的 `DB.log_analysis` 報告。 【F:pages/analysis/LogExplorerPage.tsx†L140-L147】【F:mock-server/handlers.ts†L520-L524】
- 時間範圍選項透過 `useLogOptions` 取得 `GET /api/v1/ui/options` 結果，但 API 服務會再自動加上 `/api/v1`，導致實際請求為 `/api/v1/api/v1/ui/options`，需調整為相對路徑（[NEEDS CLARIFICATION]）。 【F:hooks/useLogOptions.ts†L21-L45】【F:services/api.ts†L26-L56】
- `OptionsContext` 同步載入 `/ui/options` 供搜尋 modal 其他選項使用，避免重複請求。 【F:contexts/OptionsContext.tsx†L14-L37】
- 假資料中的 `MOCK_LOGS`、`MOCK_LOG_ANALYSIS` 提供列表內容與 AI 報告。 【F:mock-server/db.ts†L1754-L1769】【F:mock-server/db.ts†L2112-L2126】

**需求與規格定義**  
- 頁面需支援即時模式、快捷時間範圍、進階搜尋與 JSON 展開等操作，確保使用者可快速鎖定日誌並檢視細節。 【F:pages/analysis/LogExplorerPage.tsx†L33-L273】
- AI 總結需在按下後顯示分析中狀態並於完成時顯示摘要、模式、建議；失敗時提供友善訊息。 【F:pages/analysis/LogExplorerPage.tsx†L140-L153】【F:components/LogAnalysisModal.tsx†L18-L70】
- 匯出功能要能輸出當前篩選結果，並在無資料時提示使用者。 【F:pages/analysis/LogExplorerPage.tsx†L156-L171】
- API 需支援依 `keyword`、`time_range` 分頁查詢；若未來加入排序要與前端參數名稱一致。 【F:mock-server/handlers.ts†L3207-L3219】
- 修正 `useLogOptions` 的請求路徑或攔截器判斷，以避免向不存在的 `/api/v1/api/v1/ui/options` 發送請求。 【F:hooks/useLogOptions.ts†L25-L33】【F:services/api.ts†L26-L56】

---

### insights-overview.png

**現況描述**  
- 頂部工具列提供「重新分析」與「匯出報表」按鈕，前者套用 AI 樣式並會根據載入狀態停用；整體頁面採分區玻璃卡片呈現。 【F:pages/analysis/AnalysisOverviewPage.tsx†L294-L308】
- 左側顯示系統健康儀表，右側為事件關聯圖，可拖曳節點並顯示提示；底部標註互動說明。 【F:pages/analysis/AnalysisOverviewPage.tsx†L298-L312】
- 中段列出 AI 異常檢測與主動優化建議清單，分別顯示嚴重度與影響/投入標籤。 【F:pages/analysis/AnalysisOverviewPage.tsx†L315-L344】
- 底部「重要日誌快照」區塊內含時間範圍下拉選單、載入/錯誤狀態、日誌列表與導向「日誌探索」的連結。 【F:pages/analysis/AnalysisOverviewPage.tsx†L347-L399】
- 假資料提供健康分數、異常、建議、事件節點及日誌樣本。 【F:mock-server/db.ts†L2304-L2315】

**互動流程**  
- 初次載入會套用 `DEFAULT_TIME_RANGE` 並呼叫 `fetchOverviewData`；若時間範圍選項更新，會自動帶入預設值。 【F:pages/analysis/AnalysisOverviewPage.tsx†L15-L74】
- 「重新分析」按鈕再次呼叫相同 API，並在執行期間顯示 `isRefreshing` 狀態。 【F:pages/analysis/AnalysisOverviewPage.tsx†L110-L115】【F:pages/analysis/AnalysisOverviewPage.tsx†L294-L297】
- 時間範圍下拉選單更新 `selectedTimeRange` 後觸發 `fetchOverviewData`，同時顯示載入指示或錯誤標籤。 【F:pages/analysis/AnalysisOverviewPage.tsx†L52-L115】【F:pages/analysis/AnalysisOverviewPage.tsx†L347-L369】
- 點擊事件關聯圖節點會依 ID 前綴導向事件或資源詳細頁。 【F:pages/analysis/AnalysisOverviewPage.tsx†L117-L125】
- 匯出報表將異常與建議合併為 CSV；若資料為空則不做任何事。 【F:pages/analysis/AnalysisOverviewPage.tsx†L242-L251】【F:services/export.ts†L1-L37】

**API 與資料流**  
- 主要資料來自 `GET /analysis/overview`，支援 `time_range` 查詢並於伺服器端依時距篩選 `recent_logs`。 【F:pages/analysis/AnalysisOverviewPage.tsx†L37-L57】【F:mock-server/handlers.ts†L2961-L2978】
- 時間範圍選項透過 `useLogOptions` 取得 `logs.time_range_options`，並在載入失敗時顯示錯誤徽章。 【F:pages/analysis/AnalysisOverviewPage.tsx†L24-L94】【F:pages/analysis/AnalysisOverviewPage.tsx†L353-L359】
- 事件關聯資料、異常與建議由 mock DB 提供，節點分類與樣式與 ChartTheme 對應。 【F:mock-server/db.ts†L2170-L2314】
- 匯出功能共享 `exportToCsv` 實作。 【F:services/export.ts†L1-L37】

**需求與規格定義**  
- 頁面需同時呈現健康儀表、事件關聯、異常清單、建議與關鍵日誌，確保洞察總覽體驗符合設計。 【F:pages/analysis/AnalysisOverviewPage.tsx†L294-L399】
- 時間範圍切換必須重新載入資料並維持使用者選擇，即使後端暫無預設選項也要保留前一次選取值。 【F:pages/analysis/AnalysisOverviewPage.tsx†L52-L115】
- 事件節點點擊需導向相符的事件或資源頁，並保證節點資料含 ID 與類別資訊。 【F:pages/analysis/AnalysisOverviewPage.tsx†L117-L125】
- 匯出報表需整合異常與建議內容，供使用者分享分析結果。 【F:pages/analysis/AnalysisOverviewPage.tsx†L242-L251】
- 應對 `useLogOptions` 的請求路徑與 API 攔截器進行一致性檢查，避免多重前綴影響時間選項載入（同上議題）。 【F:hooks/useLogOptions.ts†L21-L45】【F:services/api.ts†L26-L56】
