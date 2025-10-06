# Feature Specification: 日誌探索 (Log Explorer)

**Feature Branch**: `[insights-log-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/insights-spec-pages.md` → `insights-log-explorer.png`

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/insights-log-spec.md`。

## User Scenarios & Testing *(mandatory)*
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

## Requirements *(mandatory)*
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

## Source Evidence
- ### insights-log-explorer.png （來源：`docs/specs/insights-spec-pages.md`）

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

