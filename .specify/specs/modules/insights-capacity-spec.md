# Feature Specification: 容量規劃 (Capacity Planning)

**Feature Branch**: `[insights-capacity-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/insights-spec-pages.md` → `insights-capacity-planning.png`

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/insights-capacity-spec.md`。

## User Scenarios & Testing *(mandatory)*
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

## Requirements *(mandatory)*
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

## Source Evidence
- ### insights-capacity-planning.png （來源：`docs/specs/insights-spec-pages.md`）

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

