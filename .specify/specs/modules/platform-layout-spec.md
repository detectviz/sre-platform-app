# Feature Specification: 平台佈局設定 (Platform Layout)

**Feature Branch**: `[platform-layout-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/platform-spec-pages.md` → ``platform-layout-manager.png` & `platform-layout-edit-kpi-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/platform-layout-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `platform-layout-manager.png` & `platform-layout-edit-kpi-modal.png`

**現況描述**
- 此頁面用於管理平台內各個主要頁面頂部顯示的 KPI (Key Performance Indicator) 卡片。
- 主畫面是一個可折疊的列表 (Accordion)，每個項目代表一個可設定的頁面（例如 SREWarRoom, 事件, 資源等）。
- 展開一個項目後，會顯示該頁面「目前顯示的卡片」列表，以及最後更新的資訊。
- 每個項目都有一個「Edit」按鈕，點擊後會彈出一個雙欄選擇器 (Dual Listbox) 的編輯視窗。
- 編輯視窗左側為「可選欄位」，右側為「已顯示欄位」。

**互動流程**
1.  **載入頁面**：
    -   使用者進入頁面時，系統會自動載入所有頁面的佈局設定和所有可用的小工具 (Widgets) 定義。
2.  **檢視佈局**：
    -   使用者可以點擊任一頁面標題來展開或收合，以檢視其目前配置的 KPI 卡片。
3.  **編輯佈局**：
    -   使用者點擊任一頁面旁的「Edit」按鈕，開啟編輯視窗。
    -   在視窗中，使用者可以：
        -   從左側「可選欄位」點擊項目，將其新增至右側「已顯示欄位」。
        -   從右側「已顯示欄位」點擊項目，將其移回左側。
        -   使用右側項目旁的上下箭頭，調整卡片的顯示順序。
4.  **儲存變更**：
    -   使用者在編輯視窗中點擊「儲存」按鈕。
    -   系統會將**所有頁面**的完整佈局設定一次性發送到後端進行儲存。
    -   儲存成功後，視窗關閉，主畫面的列表會更新以反映變更。
5.  **取消變更**：
    -   使用者在編輯視窗中點擊「取消」或關閉按鈕，所有在該視窗中的變更都會被捨棄。

## Requirements *(mandatory)*
**API 與資料流**
1.  **取得所有頁面佈局**
    -   **API**: `GET /api/v1/settings/layouts`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: 一個物件，鍵為頁面名稱，值為該頁面的佈局設定。
        ```json
        {
          "SREWarRoom": {
            "widget_ids": ["sre_pending_incidents", "sre_in_progress"],
            "updated_at": "2025-09-24T10:30:00Z",
            "updated_by": "Admin User"
          },
          "事件": { ... }
        }
        ```
2.  **取得所有可用的小工具 (Widgets)**
    -   **API**: `GET /api/v1/settings/widgets`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: `LayoutWidget` 物件的陣列。
        ```json
        [
          {
            "id": "incident_pending_count",
            "name": "待處理事件",
            "description": "...",
            "supported_pages": ["事件"]
          },
          ...
        ]
        ```
3.  **更新所有頁面佈局**
    -   **API**: `PUT /api/v1/settings/layouts`
    -   **傳出參數 (Request Body)**: 與 `GET /api/v1/settings/layouts` 格式相同的完整佈局物件。
    -   **傳入資料 (Response)**: 更新後的完整佈局物件。

**需求與規格定義**
- **USR-PLATFORM-LAYOUT-001**: 作為平台管理員，我需要能夠自訂各個主要頁面頂部顯示的 KPI 卡片，以便快速掌握我最關心的指標。
- **SPEC-PLATFORM-LAYOUT-001.1**: 系統必須提供一個介面，列出所有可設定 KPI 卡片的頁面。
- **SPEC-PLATFORM-LAYOUT-001.2**: 對於每個頁面，使用者必須能夠檢視目前已選的 KPI 卡片及其順序。
- **USR-PLATFORM-LAYOUT-002**: 我需要能夠為每個頁面獨立新增、移除和排序 KPI 卡片。
- **SPEC-PLATFORM-LAYOUT-002.1**: 系統必須提供一個編輯介面 (Modal)，其中包含「可選欄位」和「已顯示欄位」兩個列表。
- **SPEC-PLATFORM-LAYOUT-002.2**: 「可選欄位」列表必須根據當前編輯的頁面進行過濾，只顯示該頁面支援的小工具。
- **SPEC-PLATFORM-LAYOUT-002.3**: 使用者必須能夠調整「已顯示欄位」中卡片的順序。
- **SPEC-PLATFORM-LAYOUT-002.4**: 儲存時，系統必須透過 `PUT /api/v1/settings/layouts` API 提交完整的佈局設定。

## Source Evidence
- ### `platform-layout-manager.png` & `platform-layout-edit-kpi-modal.png` （來源：`docs/specs/platform-spec-pages.md`）

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

