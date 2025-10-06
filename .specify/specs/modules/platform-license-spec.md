# Feature Specification: 授權管理 (Platform License)

**Feature Branch**: `[platform-license-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/platform-spec-pages.md` → ``platform-license-page.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/platform-license-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `platform-license-page.png`

**現況描述**
- 此頁面為一個靜態資訊頁面，用於展示當前的軟體版本（社群版）並推廣商業版。
- 頁面內容包含版本標題、功能描述、商業版功能列表以及一個聯絡升級的郵件連結。
- 此頁面沒有任何表單或可供使用者設定的選項。

**互動流程**
1.  **載入頁面**：
    -   使用者點擊 "License" 頁籤後，系統會直接渲染靜態內容。
    -   頁面內容是預先定義好的，不涉及後端 API 呼叫來獲取頁面資料。
2.  **聯絡升級**：
    -   使用者點擊「聯絡我們以升級」連結。
    -   系統會觸發一個 `mailto:` 動作，開啟使用者本地的郵件客戶端，並預填好銷售團隊的郵件地址。

## Requirements *(mandatory)*
**API 與資料流**
- **頁面內容**:
    -   此頁面內容為靜態，不透過 API 獲取。
    -   所有文字內容定義在前端的 `ContentContext` 中，其資料來源為 `mock-server/db.ts` 內的 `PAGE_CONTENT.LICENSE_PAGE` 物件。
- **頁籤可見性**:
    -   **API**: `GET /api/v1/ui/tabs`
    -   **說明**: License 頁籤是否可見（或是否被禁用）是由後端根據平台版本（例如 `SRE_PLATFORM_EDITION` 環境變數）決定的。在社群版中，此頁籤可能會被禁用。

**需求與規格定義**
- **USR-PLATFORM-LICENSE-001**: 作為平台使用者，我想了解我目前使用的版本資訊以及如何升級到功能更完整的商業版。
- **SPEC-PLATFORM-LICENSE-001.1**: 系統必須提供一個靜態的 License 頁面，清楚地標示目前為「社群版」。
- **SPEC-PLATFORM-LICENSE-001.2**: 頁面必須條列商業版的主要功能，以吸引使用者升級。
- **SPEC-PLATFORM-LICENSE-001.3**: 頁面必須提供一個有效的聯絡方式（例如 `mailto:` 連結），方便使用者洽詢升級事宜。
- **SPEC-PLATFORM-LICENSE-002.1**: 此頁面的可見性應由後端配置控制。若為商業版，此頁面應顯示對應的商業授權資訊 `[NEEDS CLARIFICATION: 商業版的 License 頁面外觀與內容為何？需要提供對應的截圖與規格]`。

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 商業版的 License 頁面外觀與內容為何？需要提供對應的截圖與規格

## Source Evidence
- ### `platform-license-page.png` （來源：`docs/specs/platform-spec-pages.md`）

## Review & Acceptance Checklist
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness Checklist
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [ ] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

