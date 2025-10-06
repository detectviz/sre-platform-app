# Feature Specification: 資料來源管理 (Datasources)

**Feature Branch**: `[resources-datasource-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/resources-spec-pages.md` → ``resources-datasources-list.png``、 `docs/specs/resources-spec-pages.md` → ``resources-edit-datasource-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/resources-datasource-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `resources-datasources-list.png`

**現況描述**
- 此頁面為「資料來源 (Datasources)」管理介面，以表格形式列出所有已設定的資料來源。
- **工具列**：
    - 僅在右側提供一個「新增 Datasource」的主要操作按鈕。
- **表格**：
    - 欄位包括：名稱、類型、連線狀態、建立時間。
    - 「類型」欄位使用帶有樣式的標籤來區分不同的資料來源類型 (如 VictoriaMetrics, Grafana)。
    - 「連線狀態」欄位使用圖示和文字顯示連線結果（正常、失敗、測試中）。
    - 每行最右側提供「測試連線」、「編輯」、「刪除」三個操作按鈕。

**互動流程**
- **載入頁面**：
    1. 頁面載入時，呼叫 API 獲取所有資料來源的列表。
    2. 若 API 呼叫失敗，顯示錯誤訊息。
- **新增資料來源**：
    1. 使用者點擊「新增 Datasource」按鈕。
    2. 系統彈出「編輯資料來源 (DatasourceEditModal)」視窗。
    3. 使用者填寫名稱、選擇類型、輸入 URL 及配置驗證方式後儲存。
    4. 系統呼叫 API 建立新的資料來源，成功後刷新列表。
- **編輯資料來源**：
    1. 使用者點擊任一資料來源的「編輯」按鈕。
    2. 系統彈出「編輯資料來源」視窗，並載入該資料來源的現有設定。
    3. 使用者修改後儲存，系統呼叫 API 更新設定，並刷新列表。
- **刪除資料來源**：
    1. 使用者點擊「刪除」按鈕。
    2. 系統彈出確認對話框。
    3. 確認後，系統呼叫 API 刪除該資料來源，並刷新列表。
- **測試連線**：
    1. 使用者點擊任一資料來源的「測試連線」按鈕。
    2. 前端顯示提示訊息，告知使用者正在測試連線。
    3. 系統呼叫 API 對指定的資料來源進行連線測試。
    4. API 返回測試結果（成功或失敗）後，前端會顯示相應的提示訊息，並更新表格中的「連線狀態」欄位。

### `resources-edit-datasource-modal.png`

**現況描述**
- 此為「新增/編輯 Datasource」的彈出式視窗。截圖顯示的是「新增」時的狀態。
- **表單欄位**：
    - **名稱**：文字輸入框。
    - **類型**：下拉選單。
    - **驗證方式**：下拉選單。
    - **URL / Endpoint**：文字輸入框。
    - **標籤**：鍵值對 (Key-Value) 輸入元件。
- **操作按鈕**：
    - 左下角有「測試連線」按鈕。
    - 右下角有「取消」和「儲存」按鈕。

**互動流程**
- **開啟視窗**：
    1. 在資料來源列表頁點擊「新增」或「編輯」。
    2. 視窗彈出，並根據模式顯示對應標題。
    3. 系統從 API 獲取「類型」和「驗證方式」的下拉選單選項。
    4. 在編輯模式下，表單會預先填入該資料來源的現有設定。
- **測試連線**：
    1. 使用者填寫完 URL 等必要資訊後，點擊「測試連線」按鈕。
    2. 按鈕變為「測試中...」並顯示載入中圖示。
    3. 系統呼叫測試專用 API，將當前表單資料送往後端進行驗證。
    4. 後端返回測試結果後，系統會彈出一個提示框（Toast）告知使用者成功或失敗的訊息。此操作不會關閉視窗或儲存資料。
- **儲存**：
    1. 使用者點擊「儲存」。
    2. 系統根據模式呼叫 `POST` (新增) 或 `PATCH` (編輯) API。
    3. 成功後關閉視窗並刷新列表。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取資料來源列表**：
    - `GET /api/v1/resources/datasources`
    - **傳出資料**：`{ items: Datasource[], total: number }`。
- **新增資料來源**：
    - `POST /api/v1/resources/datasources`
    - **傳入參數**：`Partial<Datasource>`，包含新資料來源的設定。
- **更新資料來源**：
    - `PATCH /api/v1/resources/datasources/:id`
    - **傳入參數**：`Partial<Datasource>`，包含要更新的欄位。
- **刪除資料來源**：
    - `DELETE /api/v1/resources/datasources/:id`
- **測試連線**：
    - `POST /api/v1/resources/datasources/:id/test`
    - **傳出資料**：`{ success: boolean, message: string, ... }`，包含測試結果與訊息。

**需求與規格定義**
- **使用者需求**：
    - 作為平台管理員，我需要能夠設定與管理平台所依賴的外部資料來源 (如監控系統、日誌系統)。
    - 我希望能驗證我所提供的設定是否正確，確保平台能成功連線。
    - 我需要能隨時新增、修改或移除這些資料來源設定。
- **功能規格**：
    - **R-DS-001**：系統必須提供一個資料來源管理頁面，以列表展示所有已設定的資料來源。
    - **R-DS-002**：列表應包含每個資料來源的名稱、類型及最後一次的連線狀態。
    - **R-DS-003**：系統必須提供新增和編輯資料來源的功能。表單應包含名稱、類型、URL、驗證方式等必要欄位。
    - **R-DS-004**：使用者可以刪除一個資料來源，刪除前需有確認提示。
    - **R-DS-005**：使用者必須能夠對任一已設定的資料來源觸發一次性的「連線測試」。
    - **R-DS-006**：系統在收到連線測試請求後，應執行測試並將結果（成功/失敗）回饋給使用者，並更新該資料來源的狀態。

---

**API 與資料流**
- **獲取表單選項**：
    - `GET /api/v1/ui/options`
    - **傳出資料**：在 `datasources` 欄位中提供 `types` 和 `auth_methods` 的選項。
- **測試連線 (不儲存)**：
    - `POST /api/v1/resources/datasources/test`
    - **傳入參數**：包含當前表單所有內容的 `Datasource` 物件。
    - **傳出資料**：`{ success: boolean, message: string, latency_ms?: number }`，包含測試結果。
- **新增資料來源**：
    - `POST /api/v1/resources/datasources`
    - **傳入參數**：`Partial<Datasource>`。
- **更新資料來源**：
    - `PATCH /api/v1/resources/datasources/:id`
    - **傳入參數**：`Partial<Datasource>`。

**需求與規格定義**
- **使用者需求**：
    - 我希望能有一個表單來設定新的資料來源。
    - 在儲存之前，我希望能先測試一下我填寫的設定是否正確。
    - 我希望能為資料來源加上自訂標籤，方便分類。
- **功能規格**：
    - **R-DMOD-001**：系統必須提供一個彈出式視窗，用於新增和編輯資料來源。
    - **R-DMOD-002**：表單應包含名稱、URL、類型、驗證方式和標籤等欄位。
    - **R-DMOD-003**：必須提供一個「測試連線」按鈕，該按鈕能在不儲存資料的情況下，將當前表單配置發送至後端進行驗證。
    - **R-DMOD-004**：連線測試的結果（成功/失敗/延遲）必須以清晰的方式（如 Toast 通知）回饋給使用者。
    - **R-DMOD-005**：儲存時，根據模式呼叫對應的 `POST` 或 `PATCH` API。
    - **R-DMOD-006**：標籤輸入必須支援鍵值對 (Key-Value) 形式。

---

## Source Evidence
- ### `resources-datasources-list.png` （來源：`docs/specs/resources-spec-pages.md`）
- ### `resources-edit-datasource-modal.png` （來源：`docs/specs/resources-spec-pages.md`）

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

