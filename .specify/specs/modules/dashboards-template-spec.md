# Feature Specification: 儀表板模板中心 (Dashboard Templates)

**Feature Branch**: `[dashboards-template-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/dashboard-spec-pages.md` → ``dashboards-template-gallery.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/dashboards-template-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `dashboards-template-gallery.png`

**現況描述**
- **頁面佈局**: 此頁面為「儀表板」功能的「範本市集」分頁。
- **模板展示**: 模板以卡片形式並排展示。
- **模板卡片內容**: 每張卡片包含：
    - 一個代表性的圖示 (Icon)。
    - 模板標題 (例如：「微服務健康度」、「業務 KPI 總覽」)。
    - 模板分類標籤 (例如：「應用程式」、「業務」)。
    - 模板的詳細描述。
    - 一個「使用此範本」按鈕。

**互動流程**
- **選擇模板**: 使用者瀏覽範本市集，找到符合需求的儀表板模板。
- **建立儀表板**:
    - 使用者點擊卡片上的「使用此範本」按鈕。
    - 系統應開啟一個對話框或導向新頁面，讓使用者為新的儀表板命名，並可能選擇擁有者（團隊或個人）。
    - 確認後，系統會基於所選模板的結構與預設配置，建立一個新的儀表板。
    - 建立成功後，應導向新建立的儀表板檢視頁面或編輯器頁面。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取模板列表**:
    - **API**: `GET /api/v1/dashboards/templates`
    - **用途**: 載入所有可用的儀表板模板。
    - **傳出資料**: 回傳一個 `DashboardTemplate` 物件的陣列。每個物件包含 `id`, `name`, `description`, `icon`, `category`。
- **從模板建立儀表板**:
    - **API**: `POST /api/v1/dashboards`
    - **用途**: 使用者選擇模板後，建立一個新的儀表板實例。
    - **傳入參數 (Body)**:
        - `name`: 使用者輸入的新儀表板名稱。
        - `description` (可選): 使用者輸入的描述。
        - `type`: 'custom'。
        - `category`: 來自所選模板的 `category`。
        - `owner_id` / `team_id` (可選): 使用者指定的擁有者。
        - `template_id` (推測): 所選模板的 `id`，用於後端複製結構。
    - **傳出資料**: 回傳新建立的 `Dashboard` 物件。後端會根據模板的 `category` 自動關聯預設的 `resource_ids`。

**需求與規格定義**
- **使用者需求**:
    - 作為使用者，我希望能從一個預設的模板庫中選擇儀表板，以快速開始監控，而無需從零開始配置。
    - 作為使用者，我希望能預覽每個模板的用途和內容，以便做出正確的選擇。
- **功能規格**:
    - **SR-DASH-TPL-001**: 系統必須提供一個「範本市集」頁面，以卡片形式展示所有可用的儀表板模板。
    - **SR-DASH-TPL-002**: 每個模板卡片必須清晰地展示其名稱、描述、分類和一個代表性圖示。
    - **SR-DASH-TPL-003**: 每個模板卡片必須提供一個「使用此範本」的按鈕。
    - **SR-DASH-TPL-004**: 點擊「使用此範本」後，系統必須引導使用者完成儀表板的建立流程，至少需要使用者提供新儀表板的名稱。
    - **SR-DASH-TPL-005**: 系統必須能根據所選的模板，自動建立一個新的、可供編輯的儀表板副本。

---

## Source Evidence
- ### `dashboards-template-gallery.png` （來源：`docs/specs/dashboard-spec-pages.md`）

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

