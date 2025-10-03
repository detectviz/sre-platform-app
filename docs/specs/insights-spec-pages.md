# 智慧排查 (Insights / Analysis) 功能規格

### insights-overview.png

**現況描述**
- 此頁面為「智慧排查」的總覽儀表板，整合了系統健康度、事件關聯、異常偵測、優化建議及重要日誌等多個維度的資訊。
- **版面佈局**：採用多卡片式網格佈局。頂部為「系統總體健康評分」和「事件關聯分析」，中部為「AI 異常檢測」和「主動優化建議」，底部為「重要日誌快照」。
- **UI 元件**：
    - **圖表**：使用 ECharts 實現「健康評分」儀表圖及「事件關聯」力導向圖。
    - **列表**：異常、建議、日誌均以列表形式呈現，具備良好的可讀性。
    - **篩選器**：提供時間範圍下拉選單，用於篩選日誌快照的顯示區間。
    - **按鈕**：「重新分析」與「匯出報表」按鈕位於頂部工具列。

**互動流程**
- **頁面載入**：
    1. 首次載入時，頁面會呼叫 API 獲取預設時間範圍（`15m`）的總覽資料。
    2. 載入期間，會顯示骨架屏 (Skeleton) 動畫。
    3. 若資料載入失敗，則顯示錯誤訊息。
- **重新整理資料**：
    1. 使用者點擊工具列上的「重新分析」按鈕。
    2. 系統會根據當前選定的時間範圍重新呼叫 `GET /analysis/overview` API。
    3. 刷新頁面上所有資料。
- **時間範圍切換**：
    1. 使用者在「重要日誌快照」區塊的下拉選單中選擇新的時間範圍（例如「最近 1 小時」）。
    2. 頁面會觸發 API 呼叫，傳入新的 `time_range` 參數。
    3. API 回傳該時間範圍內的資料，並更新頁面內容，特別是「重要日誌快照」區塊。
- **事件關聯圖互動**：
    1. 使用者可以拖曳、縮放「事件關聯分析」圖中的節點。
    2. 使用者點擊圖中的節點（事件或資源）。
    3. 系統會根據節點 ID 前綴（`INC-` 或 `res-`）導向至對應的「事件詳情」或「資源詳情」頁面。
- **匯出報表**：
    1. 使用者點擊「匯出報表」按鈕。
    2. 系統會將當前顯示的「AI 異常檢測」與「主動優化建議」內容匯總，並產生一個 CSV 檔案供使用者下載。
- **查看更多日誌**：
    1. 使用者點擊「重要日誌快照」區塊底部的「前往日誌探索」連結。
    2. 系統導向至「日誌探索」頁面 (`/analyzing/logs`)。

**API 與資料流**
- **API 端點**：`GET /api/v1/analysis/overview`
- **傳入參數**：
    - `time_range` (string, optional): 時間範圍字串，例如 `15m`, `1h`, `6h`。用於篩選「重要日誌快照」的資料。若不提供，則使用後端預設值。
- **傳出資料** (`AnalysisOverviewData`):
    - `health_score`: `{ score: number, summary: string }` - 系統健康度分數與摘要。
    - `event_correlation_data`: `{ nodes: Array, links: Array, categories: Array }` - 事件關聯圖的節點、連結與分類資料。
    - `anomalies`: `Array<{ severity: string, description: string, timestamp: string }>` - AI 偵測到的異常事件列表。
    - `suggestions`: `Array<{ title: string, details: string, impact: string, effort: string }>` - 系統優化建議列表。
    - `recent_logs`: `Array<LogEntry>` - 根據時間範圍篩選出的重要日誌列表。
- **資料流向**：
    1. 前端 `AnalysisOverviewPage.tsx` 元件透過 `api.get('/analysis/overview', { params: { time_range } })` 向後端發起請求。
    2. Mock Server (`handlers.ts`) 接收請求，過濾 `DB.analysis_overview_data` 中的 `recent_logs`，然後回傳完整的 `AnalysisOverviewData` 物件。
    3. 前端收到資料後，透過 `setOverviewData` 更新 state，並將資料分別渲染至各個 UI 卡片中。

**需求與規格定義**
- **使用者需求**：
    - 作為一名 SRE，我希望能有一個集中的儀表板，快速掌握系統當前的整體健康狀況。
    - 我需要能一眼看出系統是否存在異常，以及有哪些潛在的風險或優化機會。
    - 我希望能看到關鍵事件之間的關聯性，以便快速定位問題根源。
    - 我希望能快速查閱近期發生的重要日誌，而無需深入到完整的日誌系統中。
- **功能規格**：
    - **R-1 (系統健康評分)**：系統必須顯示一個 0-100 的總體健康分數，並附帶一段文字摘要說明分數的意義。
    - **R-2 (事件關聯分析)**：系統必須提供一個互動式圖表，視覺化地展示事件、資源之間的關聯。節點必須是可點擊的，並能連結到其詳細頁面。
    - **R-3 (AI 異常與建議)**：系統必須展示由 AI 分析產生的異常偵測結果與主動優化建議列表。
    - **R-4 (日誌快照與篩選)**：系統必須顯示一個重要日誌的快照列表，並提供至少三種時間範圍選項（例如：15 分鐘、1 小時、6 小時）供使用者篩選。
    - **R-5 (資料刷新)**：系統必須提供一個手動刷新按鈕，讓使用者能立即獲取最新的總覽資料。
    - **R-6 (資料匯出)**：系統必須提供匯出功能，允許使用者將異常與建議列表下載為 CSV 格式的檔案。
    - **R-7 (導航)**：系統必須提供清晰的導航連結，讓使用者可以從日誌快照區塊跳轉至功能更完整的日誌探索頁面。

### insights-capacity-planning.png

**現況描述**
- 此頁面提供資源容量的分析與預測功能，幫助使用者了解目前與未來的資源使用狀況。
- **版面佈局**：頂部為工具列，包含時間範圍選擇與操作按鈕。主要內容區域分為兩行，第一行是「資源使用趨勢」與「CPU 容量預測模型」圖表，第二行是「AI 優化建議」列表與「詳細分析」表格。
- **UI 元件**：
    - **圖表**：使用 ECharts 繪製趨勢預測折線圖與容量預測模型圖。
    - **表格**：以表格形式展示各項資源的詳細分析數據，包含目前用量、預測用量、建議等。
    - **列表**：卡片式列表用於展示 AI 優化建議。
    - **下拉選單**：提供時間範圍選項，但目前僅用於顯示，未與資料查詢掛鉤。
- **一致性審查**：
    - 「時間範圍」下拉選單目前僅在頁面載入時設定預設值，後續變更選項並不會觸發資料重新查詢，此互動行為與使用者預期不符，建議修正。

**互動流程**
- **頁面載入**：
    1. 頁面載入時，呼叫 `GET /analysis/capacity-planning` API 獲取所有資料。
    2. 載入期間顯示讀取中動畫，若失敗則顯示錯誤訊息及重試按鈕。
    - **實現細節**: 初次載入呼叫 `fetchData()` 取得容量資料並設定預設時間範圍；若 API 回傳 `default` 選項，會自動帶入該值 【F:pages/analysis/CapacityPlanningPage.tsx†L41-L66】
- **觸發分析**：
    1. 使用者點擊「觸發 AI 分析」按鈕。
    2. 系統重新呼叫 `GET /analysis/capacity-planning` API 以獲取最新的分析資料。
    3. 頁面資料會全部刷新。
    - **實現細節**: 以 `isRefresh=true` 重新呼叫同一 GET API，顯示載入指示並防止重複點擊；錯誤時提供重試按鈕 【F:pages/analysis/CapacityPlanningPage.tsx†L41-L61】【F:pages/analysis/CapacityPlanningPage.tsx†L212-L217】
- **匯出報表**：
    1. 使用者點擊「匯出報表」按鈕。
    2. 系統會將「詳細分析」表格中的資料轉換為 CSV 格式並下載。
    - **實現細節**: 會檢查 `resource_analysis` 是否有資料，若為空則以 `alert` 告知，否則依序輸出 CSV 【F:pages/analysis/CapacityPlanningPage.tsx†L155-L172】【F:services/export.ts†L1-L37】
- **時間範圍選擇**：
    1. 使用者點擊下拉選單可選擇不同的時間範圍。
    2. **[INCONSISTENCY]** 目前版本的選擇操作僅更新 UI 狀態，並未觸發任何資料查詢。

**API 與資料流**
- **API 端點**：`GET /api/v1/analysis/capacity-planning`
- **傳入參數**：無。
- **傳出資料** (`CapacityPlanningData`):
    - `trends`: `{ cpu: Trend, memory: Trend, storage: Trend }` - 主要資源（CPU、記憶體、儲存）的歷史與預測趨勢資料。
    - `forecast_model`: `{ prediction: Array, confidence_band: Array }` - 特定資源（如 CPU）的深度預測模型資料，包含預測值與信賴區間。
    - `suggestions`: `Array<{ id: string, title: string, details: string, impact: string, effort: string, detected_at: string }>` - AI 產生的優化建議列表。
    - `resource_analysis`: `Array<{ id: string, resource_name: string, current_utilization: number, forecast_utilization: number, recommendation: object, cost_impact: object, last_evaluated_at: string }>` - 各項資源的詳細分析列表。
    - `options`: `{ time_range_options: Array }` - 可用的時間範圍選項。
- **資料流向**：
    1. 前端 `CapacityPlanningPage.tsx` 元件呼叫 API 獲取資料。
    2. Mock Server (`handlers.ts`) 回傳 `DB` 中預定義的容量規劃資料。
    3. 前端收到資料後，透過 `setData` 更新 state，並將資料渲染至圖表、列表與表格中。
- **實現細節**:
  - 主要資料來源為 `GET /analysis/capacity-planning`，回傳趨勢、預測模型、建議、資源分析與時間範圍選項，伺服器端動態生成趨勢並回傳預設選項 【F:pages/analysis/CapacityPlanningPage.tsx†L41-L55】【F:mock-server/handlers.ts†L2960-L3004】
  - AI 建議與資源分析資料由 `DB.capacity_suggestions`、`DB.capacity_resource_analysis` 提供，包含嚴重度、成本影響與 `last_evaluated_at` 時戳 【F:mock-server/db.ts†L2176-L2240】【F:mock-server/db.ts†L2242-L2277】
  - 匯出流程透過 `exportToCsv` 產生檔案並觸發瀏覽器下載 【F:services/export.ts†L1-L37】

**需求與規格定義**
- **使用者需求**：
    - 作為一名平台維運者，我需要預測未來的資源需求，以避免服務中斷或資源浪費。
    - 我希望能看到目前資源使用的趨勢，並了解基於此趨勢的未來預測。
    - 我希望能獲得關於如何優化資源配置的具體建議。
- **功能規格**：
    - **R-1 (趨勢與預測圖)**：系統必須以圖表展示主要資源（CPU、記憶體、儲存）的歷史使用趨勢與未來 30 天的預測趨勢。
    - **R-2 (深度預測模型)**：系統必須提供至少一項核心資源（如 CPU）的詳細預測模型圖，包含信賴區間，以展示預測的可靠性。
    - **R-3 (AI 優化建議)**：系統必須基於容量分析，提供具體的優化建議列表，說明其影響與投入成本。
    - **R-4 (詳細資源分析)**：系統必須以表格形式，條列各個資源的目前用量、預測用量、系統建議與預估成本影響。
    - **R-5 (手動觸發分析)**：系統必須提供一個按鈕，讓使用者可以手動觸發一次新的 AI 分析。
    - **R-6 (報表匯出)**：系統必須提供匯出功能，將詳細的資源分析表格下載為 CSV 檔案。
    - **R-7 (時間範圍過濾)**：**[NEW REQUIREMENT]** 系統應允許使用者透過時間範圍下拉選單篩選圖表和分析資料。API `GET /analysis/capacity-planning` 需支援 `time_range` 參數。

### insights-log-explorer.png

**現況描述**
- 此頁面為「日誌探索」工具，提供日誌的查詢、篩選、視覺化及 AI 分析功能。
- **版面佈局**：頂部為工具列，包含「搜尋和篩選」、「即時日誌」開關、「AI 總結」及「匯出報表」按鈕。下方是時間範圍快速選擇按鈕，然後是日誌直方圖，最下方是日誌列表。
- **UI 元件**：
    - **日誌列表**：以表格形式顯示日誌，包含時間戳、級別、服務和訊息。
    - **直方圖**：使用 ECharts 繪製的條形圖，顯示不同日誌級別（Error, Warning, Info）在時間上的分佈。
    - **篩選器**：提供一個彈出式視窗（Modal）讓使用者設定關鍵字和時間範圍。
    - **開關**：提供「即時日誌」切換開關，啟用後會定期刷新日誌。
    - **JSON 檢視器**：點擊單筆日誌可展開詳細的 JSON 內容。
    - **AI 分析彈窗**：點擊「AI 總結」後，會在彈窗中顯示分析報告。

**互動流程**
- **頁面載入/篩選**：
    1. 使用者透過「搜尋和篩選」彈窗設定條件（關鍵字、時間範圍）並執行搜尋。
    2. 頁面呼叫 `GET /logs` API，傳入 `keyword` 和 `time_range` 參數。
    3. 系統回傳符合條件的日誌列表，並更新日誌列表與上方的直方圖。
- **即時日誌**：
    1. 使用者啟用「即時日誌」開關。
    2. 系統會每 5 秒呼叫一次 `GET /logs` API，獲取最新的日誌並將其添加到列表頂部。
    3. 再次點擊開關可停止即時刷新。
- **查看日誌詳情**：
    1. 使用者點擊日誌列表中的任一筆日誌。
    2. 該日誌下方會展開一個 JSON 檢視器，顯示該日誌的完整詳細資訊。再次點擊可收合。
- **AI 日誌總結**：
    1. 使用者點擊「AI 總結」按鈕。
    2. 系統會呼叫 `POST /ai/logs/summarize` API，並將當前的查詢關鍵字 (`filters.keyword`) 作為參數發送。
    3. API 回傳 AI 生成的日誌分析報告。
    4. 報告會顯示在一個彈出式視窗中，載入期間會顯示讀取中狀態。
- **匯出報表**：
    1. 使用者點擊「匯出報表」按鈕。
    2. 系統會將當前日誌列表中的資料轉換為 CSV 格式並提供下載。

**API 與資料流**
- **API 端點 1**：`GET /api/v1/logs`
    - **傳入參數**：
        - `keyword` (string, optional): 篩選日誌訊息或服務的關鍵字。
        - `time_range` (string, optional): 時間範圍。
        - `page` (number, optional): 頁碼。
        - `page_size` (number, optional): 每頁筆數。
    - **傳出資料**：一個包含 `items` (日誌陣列) 和分頁資訊的物件。
- **API 端點 2**：`POST /api/v1/ai/logs/summarize`
    - **傳入參數**：`{ query: string }` - 用於分析的查詢語句或關鍵字。
    - **傳出資料** (`LogAnalysis`):
        - `summary`: AI 生成的日誌總結。
        - `top_errors`: 偵測到的主要錯誤類型。
        - `patterns`: 識別出的日誌模式。
- **資料流向**：
    1. **查詢日誌**：`LogExplorerPage.tsx` 根據使用者篩選條件，呼叫 `GET /logs` API。後端回傳日誌資料，前端更新日誌列表與直方圖。
    2. **AI 分析**：使用者點擊按鈕，`LogExplorerPage.tsx` 呼叫 `POST /ai/logs/summarize` API。後端回傳分析報告，前端在 `LogAnalysisModal` 元件中顯示報告。

**需求與規格定義**
- **使用者需求**：
    - 作為一名開發者或維運人員，我需要一個強大的工具來查詢和探索系統日誌，以便進行問題排查。
    - 我希望能根據關鍵字和時間範圍快速篩選出我需要的日誌。
    - 我希望能有一個視覺化的圖表來幫助我快速了解日誌在時間上的分佈情況。
    - 當日誌量太大時，我希望能透過 AI 幫我總結關鍵問題和模式。
- **功能規格**：
    - **R-1 (日誌查詢與篩選)**：系統必須提供基於關鍵字和預設時間範圍的日誌篩選功能。
    - **R-2 (日誌直方圖)**：系統必須提供一個日誌直方圖，以視覺化方式展示不同級別日誌隨時間的分佈。
    - **R-3 (即時模式)**：系統必須提供一個「即時日誌」模式，啟用後能自動載入最新的日誌。
    - **R-4 (日誌詳情檢視)**：系統必須允許使用者點擊單筆日誌，以展開並查看其完整的 JSON 格式內容。
    - **R-5 (AI 日誌總結)**：系統必須提供 AI 總結功能，能根據目前的查詢條件，生成一份包含問題摘要、主要錯誤和日誌模式的分析報告。
    - **R-6 (資料匯出)**：系統必須提供匯出功能，允許使用者將當前檢視的日誌列表下載為 CSV 檔案。


### `images/insights-backtesting.png`

**現況描述**
- **頁面佈局**：頁面主要分為左右兩欄。左欄為「設定回放任務」區塊，右欄為「數據趨勢與告警觸發」的視覺化結果區塊。
- **任務設定 (左欄)**：
    - **告警規則選擇**：一個下拉式選單，用於讓使用者從既有的告警規則中選擇一項進行回測。
    - **時間段選擇**：使用 Ant Design 的 `DatePicker.RangePicker` 元件，讓使用者可以選擇回測的開始與結束時間，並提供常用的預設時間範圍（如：最近 7 天、最近 30 天）。
    - **執行按鈕**：一個「開始回放」按鈕，用於提交回測任務。
    - **實際事件比對**：一個可展開的區塊，允許使用者手動新增「實際事件」。每個事件包含一個可選的文字說明和一個時間範圍。新增的事件會被列出，並可被刪除。
- **結果顯示 (右欄)**：
    - **任務狀態**：在執行過程中，會顯示任務的目前狀態（如：準備中、模擬執行中、模擬完成、模擬失敗）。
    - **圖表**：使用 ECharts 繪製的折線圖，用於視覺化展示以下數據：
        - **指標序列**：主要監控指標的時間序列數據（例如：CPU 使用率）。
        - **告警閾值**：一條虛線，表示觸發告警的門檻值。
        - **模擬告警觸發點**：在圖表上以特殊符號（如倒三角形）標示出模擬過程中告警被觸發的時間點。
        - **實際事件區間**：將使用者手動標記的事件以背景高亮區域（`markArea`）的方式呈現在圖表上，方便與模擬結果比對。
    - **統計指標**：以卡片形式展示回測結果的關鍵統計數據，包括：總數據點、觸發次數、觸發率、告警閾值。
    - **進階指標**：預留了 Precision、Recall、F1 Score 等進階指標的顯示區域，但目前為停用狀態。
    - **觸發詳情**：一個列表，詳細展示每一次模擬觸發的確切時間點與當時的指標數值。

**互動流程**
1.  **頁面載入**：
    - 系統自動發送 `GET /alert-rules` 請求，獲取所有可用的告警規則，並填充到「選擇告警規則」的下拉選單中。
    - 時間選擇器預設為「最近 7 天」。
2.  **使用者設定任務**：
    - 使用者從下拉選單中選擇一條要回測的告警規則。
    - 使用者透過 `DatePicker` 選擇或自訂回測的時間範圍。
3.  **（可選）標記實際事件**：
    - 使用者展開「實際事件比對」區塊。
    - 輸入事件說明（可選），並使用另一個 `DatePicker` 選擇事件的發生時間段。
    - 點擊「標記事件」按鈕，前端進行表單驗證（如結束時間需晚於開始時間），驗證通過後將事件加入列表。
    - 已標記的事件會顯示在列表中，並可隨時點擊「刪除」按鈕移除。
4.  **執行回測**：
    - 使用者點擊「開始回放」按鈕。
    - 前端進行表單驗證：
        - 必須選擇一條告警規則。
        - 必須選擇時間範圍。
        - 回測的開始時間必須早于結束時間。
        - 所有手動標記的事件必須落在回測的時間範圍內。
    - 驗證通過後，按鈕變為「回放中...」並禁用，同時發送 `POST /backtesting/run` 請求。
5.  **輪詢與結果展示**：
    - `POST` 請求成功後，後端返回一個 `task_id`。
    - 前端開始以固定的時間間隔（例如 5 秒）輪詢 `GET /backtesting/results/{task_id}` API。
    - 在輪詢過程中，頁面右上角會顯示任務的即時狀態（`running`, `queued` 等）。
    - 當 API 返回的狀態為 `completed` 時，停止輪詢。
    - 前端將收到的 `BacktestingResultsResponse` 資料渲染到右欄的圖表和統計卡片中。
    - 若 API 返回 `failed`，則停止輪詢並在頁面頂部顯示錯誤訊息。

**API 與資料流**
-   **1. 獲取告警規則**
    - **API**: `GET /api/v1/alert-rules`
    - **傳入參數**:
        - `page`: `1`
        - `page_size`: `100`
        - `include_disabled`: `true`
    - **傳出資料 (Response Body)**: `Paginated<AlertRule>`
        ```json
        {
          "items": [
            {
              "id": "string",
              "name": "string",
              "conditions_summary": "string"
            }
          ],
          "total": "number"
        }
        ```
    - **資料流**: 後端返回告警規則列表，前端將 `id` 和 `name` 填充至下拉選單中。

-   **2. 執行回測任務**
    - **API**: `POST /api/v1/backtesting/run`
    - **傳入資料 (Request Body)**: `BacktestingRunRequest`
        ```json
        {
          "rule_id": "string",
          "time_range": {
            "start_time": "string (ISO 8601)",
            "end_time": "string (ISO 8601)"
          },
          "actual_events": [
            {
              "label": "string",
              "start_time": "string (ISO 8601)",
              "end_time": "string (ISO 8601)"
            }
          ]
        }
        ```
    - **傳出資料 (Response Body)**: `BacktestingRunResponse`
        ```json
        {
          "task_id": "string",
          "status": "running",
          "submitted_at": "string (ISO 8601)",
          "rule_count": "number",
          "estimated_completion_time": "string (ISO 8601) | null"
        }
        ```
    - **資料流**: 前端收集使用者輸入，組裝成請求，發送給後端。後端建立一個非同步任務，並立即返回 `task_id`。

-   **3. 輪詢回測結果**
    - **API**: `GET /api/v1/backtesting/results/{task_id}`
    - **傳入參數**: `task_id` (路徑參數)
    - **傳出資料 (Response Body)**: `BacktestingResultsResponse`
        ```json
        {
          "task_id": "string",
          "status": "BacktestingTaskStatus ('running' | 'completed' | 'failed')",
          "requested_at": "string (ISO 8601)",
          "completed_at": "string (ISO 8601) | null",
          "duration_seconds": "number | null",
          "message": "string | null",
          "rule_results": [
            {
              "rule_id": "string",
              "rule_name": "string",
              "triggered_count": "number",
              "trigger_points": [
                {
                  "timestamp": "string (ISO 8601)",
                  "value": "number",
                  "condition_summary": "string"
                }
              ],
              "metric_series": [
                {
                  "timestamp": "string (ISO 8601)",
                  "value": "number",
                  "threshold": "number | null"
                }
              ],
              "actual_events": [
                {
                  "label": "string",
                  "start_time": "string (ISO 8601)",
                  "end_time": "string (ISO 8601)"
                }
              ]
            }
          ]
        }
        ```
    - **資料流**: 前端使用 `task_id` 定期請求此 API。在任務完成前，後端返回 `status: 'running'`。任務完成後，返回 `status: 'completed'` 及完整的結果資料。前端解析這些資料並更新 UI。

**需求與規格定義**
- **使用者需求 (User Stories)**:
    - USR-1: 作為一名 SRE，我希望能選擇一條告警規則並指定一個過去的時間段，來模擬這條規則在當時會觸發多少次，以便評估其準確性。
    - USR-2: 作為一名維運人員，我希望能在我已知發生過真實事件的時間點上做標記，並在回測圖表上看到這些標記，以便將模擬觸發結果與真實情況進行比對。
    - USR-3: 作為一名平台管理者，我希望能看到回測任務的執行進度，並在任務完成後獲得清晰的統計摘要與視覺化圖表。
- **功能規格 (Functional Specifications)**:
    - SPEC-1: 系統必須提供一個介面，允許使用者從所有（包含已停用）告警規則中選擇一項進行回測。
    - SPEC-2: 系統必須提供一個時間範圍選擇器，支援使用者選擇預設範圍（如過去 7/14/30/90 天）或自訂開始與結束時間（精確到分鐘）。
    - SPEC-3: 系統必須允許使用者新增一或多個「實際事件」，每個事件包含一個可選的標籤與一個時間範圍。
        - SPEC-3.1: 新增的實際事件時間範圍必須在主回測時間範圍之內，否則系統應提示錯誤且不允許執行。
    - SPEC-4: 系統在執行回測時，必須將選擇的規則 ID、時間範圍和實際事件列表透過 `POST /backtesting/run` API 提交至後端。
    - SPEC-5: 系統提交任務後，必須透過輪詢 `GET /backtesting/results/{task_id}` API 來監控任務狀態，並在 UI 上顯示即時狀態。
    - SPEC-6: 當回測完成後，系統必須在圖表上同時繪製：
        - 指標時間序列（線圖）
        - 告警閾值（虛線）
        - 模擬觸發點（散點）
        - 使用者標記的實際事件（背景高亮區域）
    - SPEC-7: 系統必須提供回測結果的統計數據，至少包含：總數據點、模擬觸發次數、觸發率（觸發次數 / 總數據點）、告警閾值。
    - SPEC-8: 系統必須提供一個詳細列表，展示所有模擬觸發點的時間和數值。
    - SPEC-9: 若回測任務執行失敗，系統必須在 UI 上顯示明確的錯誤訊息。