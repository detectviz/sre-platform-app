# Feature Specification: 資源清單 (Resource Inventory)

**Feature Branch**: `[resources-list-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/resources-spec-pages.md` → ``resources-inventory-list.png``、 `docs/specs/resources-spec-pages.md` → ``resources-edit-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/resources-list-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `resources-inventory-list.png`

**現況描述**
- 此頁面為「資源總覽 (Resource Inventory)」，以表格形式呈現所有受納管的資源。
- 主要元件包含：頂部工具列、資源列表表格、底部分頁控制器。
- **工具列**：
    - 左側提供「搜索和篩選」按鈕。
    - 右側提供「匯入」、「匯出」、「欄位設定」、「新增資源」等主要操作按鈕。
    - 當使用者在表格中勾選資源後，工具列會切換為批次操作模式，顯示已選項目數量，並提供「AI 分析」、「刪除」、「匯入」、「匯出」等批次操作按鈕。
- **表格**：
    - 採用多欄位設計，預設顯示：狀態、名稱、類型、提供者、地區、擁有者、最後上報時間等。
    - 每行最左側有複選框，供使用者選取資源進行批次操作。
    - 每行最右側提供「查看詳情」、「編輯」、「刪除」的獨立操作按鈕。
    - 「狀態」欄位使用帶有顏色和圖示的標籤，以視覺化方式呈現資源健康度（例如：綠色代表 Healthy、紅色代表 Critical）。
    - 「類型」欄位也使用不同顏色的標籤，方便快速識別資源種類。

**互動流程**
- **載入頁面**：
    1. 頁面首次載入時，會同時呼叫 API 獲取資源列表、所有可用欄位、及使用者自訂的欄位顯示設定。
    2. 顯示載入中動畫，直到資料返回。若獲取失敗，則顯示錯誤訊息與重試按鈕。
- **篩選與搜尋**：
    1. 使用者點擊「搜索和篩選」按鈕。
    2. 系統彈出「統一搜尋 (UnifiedSearchModal)」視窗。
    3. 使用者在視窗中設定篩選條件後，點擊「搜尋」。
    4. 頁面使用新的篩選條件重新呼叫 API 獲取資源列表。
- **新增資源**：
    1. 使用者點擊「新增資源」按鈕。
    2. 系統彈出「編輯資源 (ResourceEditModal)」視窗（此時為新增模式）。
    3. 使用者填寫表單後儲存，系統呼叫 API 建立新資源，成功後刷新列表。
- **編輯資源**：
    1. 使用者點擊任一資源列的「編輯」按鈕。
    2. 系統彈出「編輯資源 (ResourceEditModal)」視窗，並帶入該資源的現有資料。
    3. 使用者修改後儲存，系統呼叫 API 更新資源，成功後刷新列表。
- **刪除資源**：
    1. 使用者點擊任一資源列的「刪除」按鈕。
    2. 系統彈出確認對話框，提示此操作無法復原。
    3. 使用者確認後，系統呼叫 API 刪除該資源，成功後刷新列表。
- **批次刪除**：
    1. 使用者在表格中勾選一個或多個資源。
    2. 頂部工具列顯示批次操作按鈕。
    3. 使用者點擊「刪除」按鈕。
    4. 系統呼叫批次刪除 API，成功後刷新列表。
- **查看詳情**：
    1. 使用者點擊任一資源列的「查看詳情」按鈕。
    2. 系統從右側滑出一個抽屜 (Drawer)，顯示該資源的詳細資訊頁面 (`ResourceDetailPage`)。
- **欄位設定**：
    1. 使用者點擊「欄位設定」按鈕。
    2. 系統彈出「欄位設定 (ColumnSettingsModal)」視窗，列出所有可顯示的欄位。
    3. 使用者勾選或取消勾選欄位，點擊儲存。
    4. 系統呼叫 API 儲存使用者的偏好設定，並在前端即時更新表格顯示的欄位。
- **匯入/匯出**：
    - **匯入**：點擊「匯入」按鈕，彈出 `ImportFromCsvModal` 視窗，使用者可上傳 CSV 檔案來批次建立資源。
    - **匯出**：點擊「匯出」按鈕，系統會將當前列表（若無勾選則為全部，若有勾選則為選中部分）的資料匯出為 CSV 檔案。

### `resources-edit-modal.png`

**現況描述**
- 此為「新增/編輯資源」的彈出式視窗 (Modal)。截圖顯示的是「新增資源」時的狀態。
- 視窗標題會根據情境變為「新增資源」或「編輯資源」。
- **表單欄位**：
    - **資源名稱**：文字輸入框，為必填項。
    - **類型**：下拉選單。
    - **提供商**：下拉選單。
    - **區域**：下拉選單。
    - **擁有者**：下拉選單。
- **操作按鈕**：
    - **取消**：關閉視窗，不儲存任何變更。
    - **儲存**：提交表單資料。

**互動流程**
- **開啟視窗（新增模式）**：
    1. 在資源列表頁點擊「新增資源」。
    2. 系統彈出此視窗，標題為「新增資源」，所有欄位為空或預設值。
    3. 下拉選單的選項透過 API 載入。
- **開啟視窗（編輯模式）**：
    1. 在資源列表頁點擊某資源的「編輯」按鈕。
    2. 系統彈出此視窗，標題為「編輯資源」。
    3. 表單欄位會自動填入該資源的現有資料。
- **資料填寫**：
    1. 使用者在「資源名稱」欄位輸入文字。
    2. 使用者從各個下拉選單中選擇對應的選項。
- **儲存**：
    1. 使用者點擊「儲存」按鈕。
    2. 如果是新增模式，系統會呼叫 `POST /resources` API。
    3. 如果是編輯模式，系統會呼叫 `PATCH /resources/:id` API。
    4. API 呼叫成功後，視窗關閉，並刷新後方的資源列表。
    5. 若呼叫失敗，應提示錯誤訊息。
- **取消**：
    1. 使用者點擊「取消」按鈕。
    2. 視窗直接關閉，所有變更都不會被儲存。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取資源列表**：
    - `GET /api/v1/resources`
    - **傳入參數**：`page`, `page_size`, 以及各種篩選條件 (filters)。
    - **傳出資料**：`{ items: Resource[], total: number }`，包含當前頁的資源物件陣列與總資源數量。
- **獲取頁面欄位設定**：
    - `GET /api/v1/pages/columns/resources`：獲取此頁面所有可用的欄位定義。
    - `GET /api/v1/settings/column-config/resources`：獲取使用者儲存的顯示欄位鍵值陣列。
- **儲存頁面欄位設定**：
    - `PUT /api/v1/settings/column-config/resources`
    - **傳入參數**：`string[]`，包含使用者選擇要顯示的欄位鍵值。
- **新增資源**：
    - `POST /api/v1/resources`
    - **傳入參數**：`Partial<Resource>`，包含新資源的資料。
- **更新資源**：
    - `PATCH /api/v1/resources/:id`
    - **傳入參數**：`Partial<Resource>`，包含要更新的資源欄位。
- **刪除資源**：
    - `DELETE /api/v1/resources/:id`
- **批次操作**：
    - `POST /api/v1/resources/batch-actions`
    - **傳入參數**：`{ action: 'delete', ids: string[] }`。
- **AI 分析**：
    - `POST /api/v1/ai/resources/analyze`
    - **傳入參數**：`{ resource_ids: string[] }`。

**需求與規格定義**
- **使用者需求**：
    - 作為系統管理員，我希望能有一個集中的地方查看所有納管的資源。
    - 我需要能快速地搜尋和篩選出我關心的特定資源。
    - 我希望能自訂列表要顯示哪些資訊，以符合我的使用習慣。
    - 我需要能方便地對資源進行新增、修改、刪除等基本管理操作。
    - 對於重複性的刪除工作，我希望能一次選取多個資源進行批次處理。
    - 我希望能將資源列表匯出，以便進行離線分析或報告。
- **功能規格**：
    - **R-INV-001**：系統必須提供一個資源總覽頁面，以分頁表格形式展示所有資源。
    - **R-INV-002**：表格必須支援後端分頁、排序與篩選功能。
    - **R-INV-003**：系統必須提供彈窗或獨立頁面，讓使用者能新增、編輯資源。表單需包含名稱、類型、擁有者等必要欄位。
    - **R-INV-004**：使用者可對單一資源執行刪除操作，執行前需有確認提示。
    - **R-INV-005**：使用者可勾選多個資源，並執行批次刪除。
    - **R-INV-006**：使用者可自訂表格要顯示的欄位，此設定需與使用者帳號綁定並永久保存。
    - **R-INV-007**：系統必須提供匯出功能，可將選定或所有資源匯出為 CSV 格式。
    - **R-INV-008**：系統必須提供匯入功能，允許使用者透過上傳 CSV 檔案批次新增資源。
    - **R-INV-009**：點擊資源的「詳情」應以不離開當前頁面的方式（如抽屜）展示詳細資訊。
    - **R-INV-010**：使用者可勾選多個資源，並觸發 AI 分析功能。

---

**API 與資料流**
- **獲取表單選項**：
    - `GET /api/v1/ui/options`
    - **傳出資料**：`{ resources: { types: string[], providers: string[], ... } }`，提供所有下拉選單的選項內容。
- **新增資源**：
    - `POST /api/v1/resources`
    - **傳入參數**：`Partial<Resource>`，包含表單中所有欄位的資料。
- **更新資源**：
    - `PATCH /api/v1/resources/:id`
    - **傳入參數**：`Partial<Resource>`，包含表單中被修改的欄位資料。

**需求與規格定義**
- **使用者需求**：
    - 我希望能有一個清晰、簡單的表單來新增資源。
    - 當我需要修改一個資源的資訊時，我也希望能使用同樣的介面，並且能看到它目前的設定。
- **功能規格**：
    - **R-MOD-001**：系統必須提供一個彈出式視窗，用於新增和編輯資源。
    - **R-MOD-002**：視窗的標題必須能根據當前是「新增」還是「編輯」操作動態變化。
    - **R-MOD-003**：在「編輯」模式下，表單必須預先填入所選資源的當前資料。
    - **R-MOD-004**：「資源名稱」為必填欄位，儲存時應有基本驗證。
    - **R-MOD-005**：「類型」、「提供商」、「區域」、「擁有者」等欄位必須是下拉選單，其選項應由後端 API 提供，以保持一致性。
    - **R-MOD-006**：點擊「儲存」按鈕時，必須根據模式（新增/編輯）觸發對應的 `POST` 或 `PATCH` API 請求。

---

## Source Evidence
- ### `resources-inventory-list.png` （來源：`docs/specs/resources-spec-pages.md`）
- ### `resources-edit-modal.png` （來源：`docs/specs/resources-spec-pages.md`）

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

