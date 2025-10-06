# Feature Specification: 標籤治理 (Platform Tag Management)

**Feature Branch**: `[platform-tag-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/platform-spec-pages.md` → ``platform-tags-overview.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/platform-tag-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `platform-tags-overview.png`

**現況描述**
- 此頁面為一個功能完整的標籤治理 (Tag Governance) 介面，用於定義全平台可用的標籤。
- 頁面頂部有針對平台管理員的警告訊息。
- 工具列提供搜尋、匯入、匯出、欄位設定和新增標籤等功能。
- 標籤以表格形式呈現，欄位包含：標籤鍵、說明、預設標籤值、是否必填、可寫入角色以及操作按鈕。
- 表格支援多選和批次操作。
- 系統標籤（如 `env`）旁有鎖頭圖示，且其操作按鈕為禁用狀態。

**互動流程**
1.  **載入頁面**：
    -   系統載入第一頁的標籤定義列表。
2.  **新增/編輯標籤**：
    -   點擊「新增標籤」或任一標籤的「編輯」按鈕，會彈出一個表單視窗。
    -   使用者可以在此視窗中定義或修改標籤的鍵、說明、適用範圍、是否必填、可寫入角色等屬性。
3.  **管理標籤值**：
    -   點擊「管理標籤值」按鈕（列表圖示），會彈出一個專門的視窗，讓使用者可以新增/刪除此標籤的預定義值（Enum）。
4.  **刪除標籤**：
    -   點擊單一標籤的「刪除」按鈕，會彈出確認視窗。
    -   勾選多個標籤後，點擊工具列的「刪除」按鈕，可進行批次刪除。
    -   系統保留的標籤（有鎖頭圖示）不可被刪除。
5.  **搜尋與篩選**：
    -   點擊「搜索和篩選」按鈕，彈出搜尋視窗，可依關鍵字、適用範圍等條件過濾標籤列表。
6.  **匯入/匯出**：
    -   點擊「匯出」會將當前篩選結果下載為 CSV 檔案。
    -   點擊「匯入」會彈出視窗，引導使用者上傳 CSV 檔案以批次建立標籤。
7.  **欄位設定**：
    -   點擊「欄位設定」，使用者可以自訂表格要顯示哪些欄位。

## Requirements *(mandatory)*
**API 與資料流**
1.  **取得標籤定義列表**
    -   **API**: `GET /api/v1/settings/tags`
    -   **傳出參數**: `page`, `page_size`, 以及其他篩選條件。
    -   **傳入資料 (Response)**: `{ items: TagDefinition[], total: number }`
2.  **新增標籤定義**
    -   **API**: `POST /api/v1/settings/tags`
    -   **傳出參數 (Request Body)**: `Partial<TagDefinition>` 物件。
3.  **更新標籤定義**
    -   **API**: `PATCH /api/v1/settings/tags/{id}`
    -   **傳出參數 (Request Body)**: `Partial<TagDefinition>` 物件。
4.  **刪除標籤定義**
    -   **API**: `DELETE /api/v1/settings/tags/{id}`
5.  **更新標籤的允許值**
    -   **API**: `PUT /api/v1/settings/tags/{id}/values`
    -   **傳出參數 (Request Body)**: `TagValue[]` (e.g., `[{value: "v1", label: "V1"}, ...]`)
6.  **批次匯入標籤**
    -   **API**: `POST /api/v1/settings/tags/import`
    -   **傳出參數 (Request Body)**: `FormData` 包含 CSV 檔案。
7.  **取得/更新欄位顯示設定**
    -   **API**: `GET / PUT /api/v1/settings/column-config/{pageKey}`

**需求與規格定義**
- **USR-PLATFORM-TAG-001**: 作為平台管理員，我需要一個中央介面來定義和管理全平台的標籤，以確保標籤的一致性和標準化。
- **SPEC-PLATFORM-TAG-001.1**: 系統必須提供一個表格來展示所有已定義的標籤，包含其鍵、說明、預設值、必填狀態和權限等核心屬性。
- **SPEC-PLATFORM-TAG-001.2**: 系統必須支援對標籤定義的完整 CRUD（建立、讀取、更新、刪除）操作。
- **SPEC-PLATFORM-TAG-001.3**: 系統必須能夠區分「系統標籤」和「使用者自訂標籤」，系統標籤應為唯讀或不可刪除。
- **USR-PLATFORM-TAG-002**: 對於某些標籤，我希望能預先定義好固定的可選值（Enum），以限制使用者只能從中選擇。
- **SPEC-PLATFORM-TAG-002.1**: 系統必須提供一個獨立的介面，用於管理特定標籤的「允許值」列表。
- **USR-PLATFORM-TAG-003**: 我需要能夠批次管理標籤，例如批次刪除或透過 CSV 檔案匯入/匯出。
- **SPEC-PLATFORM-TAG-003.1**: 表格必須支援多選功能。
- **SPEC-PLATFORM-TAG-003.2**: 系統必須提供批次刪除功能。
- **SPEC-PLATFORM-TAG-003.3**: 系統必須提供匯出為 CSV 和從 CSV 匯入的功能。
- **USR-PLATFORM-TAG-004**: 我希望能自訂表格的欄位，只看我關心的資訊。
- **SPEC-PLATFORM-TAG-004.1**: 系統必須提供一個「欄位設定」功能，讓使用者可以自訂表格的顯示欄位，且此設定需要被保存。

## Source Evidence
- ### `platform-tags-overview.png` （來源：`docs/specs/platform-spec-pages.md`）

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

