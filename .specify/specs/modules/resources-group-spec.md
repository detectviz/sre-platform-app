# Feature Specification: 資源群組管理 (Resource Groups)

**Feature Branch**: `[resources-group-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/resources-spec-pages.md` → ``resources-groups-list.png``、 `docs/specs/resources-spec-pages.md` → ``resources-edit-group-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/resources-group-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `resources-groups-list.png`

**現況描述**
- 此頁面為「資源群組 (Resource Groups)」，以表格形式呈現所有定義好的資源群組。
- **工具列**：
    - 左側提供「搜索和篩選」按鈕。
    - 右側提供「欄位設定」與「新增群組」按鈕。
- **表格**：
    - 列表欄位包含：群組名稱與描述、負責團隊、成員數量、狀態總覽。
    - 「狀態總覽」欄位以不同顏色（綠、黃、紅）的計數器，直觀地展示了群組內各狀態資源的數量。
    - 每行最右側提供「編輯」和「刪除」操作按鈕。
    - 此頁面沒有提供批次選擇與操作的功能。

**互動流程**
- **載入頁面**：
    1. 頁面載入時，呼叫 API 獲取資源群組列表、所有可用欄位、及使用者自訂的欄位設定。
    2. 若 API 呼叫失敗，顯示錯誤訊息。
- **搜尋群組**：
    1. 使用者點擊「搜索和篩選」按鈕。
    2. 系統彈出搜尋視窗，使用者可輸入關鍵字。
    3. 點擊搜尋後，帶上關鍵字參數重新獲取群組列表。
- **新增群組**：
    1. 使用者點擊「新增群組」按鈕。
    2. 系統彈出「編輯資源群組 (ResourceGroupEditModal)」視窗。
    3. 使用者需填寫群組名稱、選擇負責團隊，並從資源列表中選取成員。
    4. 儲存後，系統呼叫 API 建立新群組，並刷新列表。
- **編輯群組**：
    1. 使用者點擊任一群組的「編輯」按鈕。
    2. 系統彈出「編輯資源群組」視窗，並載入該群組的現有資料。
    3. 使用者可修改群組資訊後儲存，系統呼叫 API 更新群組，並刷新列表。
- **刪除群組**：
    1. 使用者點擊任一群組的「刪除」按鈕。
    2. 系統彈出確認對話框。
    3. 確認後，系統呼叫 API 刪除該群組，並刷新列表。
- **欄位設定**：
    1. 使用者點擊「欄位設定」按鈕。
    2. 系統彈出「欄位設定」視窗。
    3. 使用者可自訂表格要顯示的欄位，儲存後前端即時更新，並將設定保存至後端。

### `resources-edit-group-modal.png`

**現況描述**
- 此為「新增/編輯資源群組」的彈出式視窗。截圖顯示的是「新增資源群組」時的狀態。
- **表單欄位**：
    - **群組名稱**：文字輸入框。
    - **擁有團隊**：下拉選單。
    - **描述**：多行文字輸入框。
- **成員管理**：
    - 採用左右雙欄佈局的「成員管理」區塊。
    - 左欄為「可用的資源」列表，右欄為「已選擇的資源」列表。
    - 每個資源旁有箭頭按鈕，可將其在兩欄之間移動。
- **操作按鈕**：
    - **取消**：關閉視窗。
    - **儲存**：提交表單。

**互動流程**
- **開啟視窗**：
    1. 在資源群組列表頁點擊「新增群組」或某群組的「編輯」。
    2. 系統彈出此視窗，並根據情境顯示「新增」或「編輯」標題。
    3. 系統會並行呼叫 API，獲取所有資源列表和所有團隊列表，以填充「擁有團隊」下拉選單和「成員管理」區塊。
    4. 在編輯模式下，表單會填入該群組的現有資料，且「成員管理」區塊會正確劃分已選和可用的資源。
- **填寫/修改資料**：
    1. 使用者填寫群組名稱、描述，並選擇擁有團隊。
    2. 使用者在「成員管理」區塊點擊箭頭按鈕，將資源在「可用」和「已選」列表間移動。
- **儲存**：
    1. 使用者點擊「儲存」按鈕。
    2. 系統根據模式呼叫 `POST /resource-groups` (新增) 或 `PUT /resource-groups/:id` (編輯) API，並傳入包含 `member_ids` 陣列的群組資料。
    3. 成功後關閉視窗並刷新列表。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取資源群組列表**：
    - `GET /api/v1/resource-groups`
    - **傳入參數**：`keyword` (可選) 等篩選條件。
    - **傳出資料**：`{ items: ResourceGroup[], total: number }`。
- **新增資源群組**：
    - `POST /api/v1/resource-groups`
    - **傳入參數**：`{ name: string, description: string, owner_team: string, member_ids: string[] }`。
- **更新資源群組**：
    - `PUT /api/v1/resource-groups/:id`
    - **傳入參數**：包含群組 ID 及要更新的欄位資料。
- **刪除資源群組**：
    - `DELETE /api/v1/resource-groups/:id`
- **批次刪除** (雖然 UI 上沒有直接觸發點，但程式碼中有此邏輯)：
    - `POST /api/v1/resource-groups/batch-actions`
    - **傳入參數**：`{ action: 'delete', ids: string[] }`。
- **欄位設定相關 API**：
    - `GET /api/v1/pages/columns/resource_groups`
    - `GET /api/v1/settings/column-config/resource_groups`
    - `PUT /api/v1/settings/column-config/resource_groups`

**需求與規格定義**
- **使用者需求**：
    - 作為 SRE 或團隊負責人，我希望能將有關聯的資源組織成一個群組，方便統一監控與管理。
    - 我需要能快速查看某個群組下所有資源的整體健康狀況。
    - 我需要能方便地建立、修改和刪除這些群組。
- **功能規格**：
    - **R-GRP-001**：系統必須提供一個資源群組管理頁面，以表格形式展示所有群組。
    - **R-GRP-002**：表格中必須包含一個「狀態總覽」欄位，顯示群組內正常、警告、嚴重狀態的資源數量。
    - **R-GRP-003**：系統必須提供新增和編輯群組的功能。表單應允許使用者定義群組名稱、描述、負責團隊，並能從現有資源中挑選成員。
    - **R-GRP-004**：使用者可以刪除一個已存在的資源群組，刪除前需有確認提示。
    - **R-GRP-005**：使用者可以透過關鍵字搜尋來篩選資源群組列表。
    - **R-GRP-006**：使用者可以自訂列表顯示的欄位，此設定需與使用者帳號綁定。

---

**API 與資料流**
- **獲取表單所需資料 (在 Modal 內部觸發)**：
    - `GET /api/v1/resources`: 獲取所有資源，用於成員選擇。
    - `GET /api/v1/iam/teams`: 獲取所有團隊，用於「擁有團隊」下拉選單。
- **新增資源群組**：
    - `POST /api/v1/resource-groups`
    - **傳入參數**：`{ name: string, description: string, owner_team: string, member_ids: string[] }`。
- **更新資源群組**：
    - `PUT /api/v1/resource-groups/:id`
    - **傳入參數**：包含群組 ID 及更新後的所有欄位資料。

**需求與規格定義**
- **使用者需求**：
    - 我希望能有一個介面來定義一個資源群組，包含它的基本資訊和成員。
    - 我需要能從一個完整的資源列表中，方便地挑選成員加入群組。
- **功能規格**：
    - **R-GMOD-001**：系統必須提供一個彈出式視窗，用於新增和編輯資源群組。
    - **R-GMOD-002**：表單應包含群組名稱、描述和擁有團隊。
    - **R-GMOD-003**：表單必須提供一個雙列表（Picklist）介面，讓使用者可以從「可用資源」列表中將資源新增至「已選資源」列表，反之亦然。
    - **R-GMOD-004**：「擁有團隊」和「可用資源」列表的內容必須從後端 API 動態獲取。
    - **R-GMOD-005**：在編輯模式下，表單必須預載群組的現有資料，包括其成員列表。
    - **R-GMOD-006**：儲存時，系統需將 `member_ids` (已選資源的 ID 陣列) 連同其他表單資料一併提交。

---

## Source Evidence
- ### `resources-groups-list.png` （來源：`docs/specs/resources-spec-pages.md`）
- ### `resources-edit-group-modal.png` （來源：`docs/specs/resources-spec-pages.md`）

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

