# Feature Specification: 回測分析 (Insights Backtesting)

**Feature Branch**: `[insights-backtesting-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/insights-spec-pages.md` → ``images/insights-backtesting.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/insights-backtesting-spec.md`。

## User Scenarios & Testing *(mandatory)*
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

## Requirements *(mandatory)*
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

## Source Evidence
- ### `images/insights-backtesting.png` （來源：`docs/specs/insights-spec-pages.md`）

## Review & Acceptance Checklist
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness Checklist
- [x] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

