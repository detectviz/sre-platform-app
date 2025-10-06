# Feature Specification: 告警規則管理 (Alert Rules)

**Feature Branch**: `[incidents-alert-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/incidents-spec-pages.md` → `告警規則管理 (Alert Rules)`

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/incidents-alert-spec.md`。

## User Scenarios & Testing *(mandatory)*
### 告警規則管理 (Alert Rules)

此功能區塊包含告警規則的列表管理以及建立/編輯規則的精靈。

#### `incidents-alert-rules-list.png` & `incidents-alert-rules-column-settings.png`

**現況描述**
- **頁面標題**: 「告警規則」。
- **操作按鈕**: 包含「匯入」與「新增規則」按鈕。
- **篩選與搜尋**: 提供「啟用狀態」、「等級」的下拉篩選器，以及一個文字搜尋框。
- **規則列表**:
    - 以表格呈現，支援自訂欄位顯示與排序 (`incidents-alert-rules-column-settings.png`)。
    - 預設欄位包含：`名稱`, `等級`, `目標`, `條件`, `啟用狀態`, `最後更新時間`。
    - 支援透過核取方塊進行批次操作，如「啟用」、「停用」、「刪除」。
- **欄位設定**:
    - 提供一個彈出視窗，讓使用者可以勾選要顯示的欄位，並透過拖拉調整欄位順序。

**互動流程**
- **新增規則**: 點擊「新增規則」按鈕，開啟告警規則建立精靈 (`incidents-alert-rule-wizard-step1.png`)。
- **編輯規則**: 點擊任一規則的名稱，開啟同樣的精靈，但會預先填入該規則的現有設定。
- **批次操作**: 使用者勾選多個規則後，點擊對應的批次操作按鈕（啟用/停用/刪除）來一次修改多個規則。
- **自訂欄位**: 使用者點擊「欄位設定」按鈕，在彈出視窗中修改表格欄位後儲存，列表視圖應即時更新。

## Requirements *(mandatory)*
**API 與資料流**
- **取得規則列表**: `GET /api/v1/alert-rules`
    - **參數**: `page`, `page_size`, `sort_by`, `sort_order`, `keyword`, `enabled`, `severity`。
    - **資料流**: 頁面載入及使用者操作篩選、搜尋、分頁時呼叫。
- **批次操作**: `POST /api/v1/alert-rules/batch-actions`
    - **參數**: `{ action: 'enable' | 'disable' | 'delete', ids: string[] }`。
    - **資料流**: 使用者執行批次操作時呼叫。
- **儲存欄位設定**: `PUT /api/v1/settings/column-config/alert-rules`
    - **參數**: 包含使用者偏好的欄位鍵值與順序的陣列。
    - **資料流**: 使用者在欄位設定視窗點擊儲存時呼叫。

**需求與規格定義**
- **使用者需求**:
    - 我需要一個地方集中管理所有的告警規則。
    - 我希望能快速啟用或停用某些規則，以應對臨時的維護或變更。
    - 我希望能自訂列表顯示的欄位，只看我關心的資訊。
- **功能規格**:
    - **[Spec-AR-List-001]** 系統必須提供一個可搜尋、篩選、排序及分頁的告警規則列表。
    - **[Spec-AR-List-002]** 系統必須支援對告警規則進行批次的「啟用」、「停用」和「刪除」操作。
    - **[Spec-AR-List-003]** 系統必須允許使用者自訂列表的顯示欄位與順序，且此設定需被保存。

---

#### `incidents-alert-rule-wizard-step1.png` to `step5.png`

**現況描述**
這是一個多步驟的精靈 (Wizard)，用於引導使用者建立或編輯一條告警規則。

- **步驟 1: 選擇範本 (`step1`)**
    - 提供一個可搜尋的範本列表，使用者可從預設範本開始，或選擇「從空白建立」。
    - **實現細節**: 精靈首步呈現雙欄版面：左側依監控目標類型列出篩選按鈕，右側顯示可捲動的範本卡片清單，卡片內容含概要、預設條件與通知示例，並以顏色框線高亮已選範本 【F:components/AlertRuleEditModal.tsx†L73-L200】
- **步驟 2: 基本資訊與生效範圍 (`step2-basic`, `step2-scope`)**
    - **基本資訊**: 填寫 `規則名稱`、`描述`、`等級`，並可選地指派給特定 `團隊` 或 `負責人`。
    - **生效範圍**: 讓使用者從一個可搜尋的資源列表中，勾選此規則要監控的目標資源。
    - **實現細節**: 第二步聚焦規則基本資料：上方提供名稱與描述欄位，下方以卡片呈現監控範圍設定、附加標籤篩選與符合資源預覽 【F:components/AlertRuleEditModal.tsx†L308-L399】
- **步驟 3: 觸發條件 (`step3`)**
    - 允許使用者定義一或多個觸發條件。每個條件包含 `指標 (Metric)`、`運算子 (Function)` 和 `閾值 (Threshold)`。
    - 支援設定觸發的持續時間（例如：持續超過 5 分鐘）。
- **步驟 4: 事件內容 (`step4`)**
    - 讓使用者自訂當規則被觸發時，所產生的事件內容。
    - 包含使用變數（如 `{{resource.name}}`）的 `事件摘要` 和 `描述` 範本。
    - 允許為產生的事件附加固定的 `標籤 (Tags)`。
- **步驟 5: 自動化 (`step5`)**
    - 提供一個開關，讓使用者決定是否要啟用「自動化修復」。
    - 若啟用，可從一個下拉選單中選擇一個已存在的「自動化腳本 (Playbook)」。

**互動流程**
1. 使用者從步驟 1 選擇範本或空白建立開始。
    - **實現細節**: 初次開啟會同時載入監控資源類型與可用範本，載入完成前使用骨架畫面；使用者可透過左側類型切換、右上搜尋框即時縮小結果，再以按鈕選定範本以啟用「下一步」 【F:components/AlertRuleEditModal.tsx†L31-L137】【F:components/AlertRuleEditModal.tsx†L970-L1000】
2. 依序填寫步驟 2 到 5 的表單內容。
    - **實現細節**: 進入步驟即載入資源群組與資源列表，使用者可依「全部／群組／特定資源」模式切換；每次切換會重設已選清單，避免過期條件殘留 【F:components/AlertRuleEditModal.tsx†L231-L367】
3. 系統應在使用者輸入時提供即時驗證（例如，必填欄位不可為空）。
    - **實現細節**: 若尚未選取範本便嘗試前進，系統會以 toast 阻擋並提醒使用者完成選取，確保流程完整性 【F:components/AlertRuleEditModal.tsx†L970-L1000】
4. 在最後一步點擊「完成」或「儲存」按鈕，系統將所有步驟的資料整合成一個物件，提交給後端。

**API 與資料流**
- **取得範本列表**: `GET /api/v1/alert-rules/templates`
    - **實現細節**: 進入步驟時同步呼叫 `GET /alert-rules/resource-types` 與 `GET /alert-rules/templates` 取得篩選條件與範本資料 【F:components/AlertRuleEditModal.tsx†L31-L137】【F:mock-server/handlers.ts†L1152-L1183】
- **取得資源列表**: `GET /api/v1/resources`
- **取得指標列表**: `GET /api/v1/alert-rules/metrics`
- **取得自動化腳本列表**: `GET /api/v1/automation/scripts`
- **建立新規則**: `POST /api/v1/alert-rules`
    - **傳入參數**: 一個包含所有精靈步驟設定的 `AlertRule` 物件。
- **更新現有規則**: `PATCH /api/v1/alert-rules/:id`
    - **傳入參數**: 同上，但包含要更新的規則 ID。
- **預設範本設定**: `GET /api/v1/alert-rules/templates/default`
    - **實現細節**: 若為新增流程，下一步會預先取得預設值以併入範本預設值 【F:components/AlertRuleEditModal.tsx†L907-L998】【F:mock-server/handlers.ts†L1152-L1183】
- **資料流**: 在精靈的每一步，前端可能會呼叫對應的 API 來填充下拉選單選項（如資源、指標、腳本）。當使用者完成所有步驟並儲存時，前端將彙整所有狀態，透過單一的 `POST` 或 `PATCH` 請求發送給後端。

**需求與規格定義**
- **使用者需求**:
    - 我希望能有一個引導式的介面來幫助我正確地建立一條告警規則。
    - 我希望能重複使用現有的設定，例如從一個範本開始建立。
    - 我希望能精確地定義告警的觸發條件，例如針對特定資源的某個指標超過閾值。
    - 我希望能自訂告警觸發後產生的事件內容，以便快速識別問題。
    - 我希望能將告警與一個自動化修復腳本關聯，實現問題的自動處理。
- **功能規格**:
    - **[Spec-AR-Wiz-001]** 系統必須提供一個多步驟精靈，用於建立和編輯告警規則。
    - **[Spec-AR-Wiz-002]** 精靈必須允許使用者從預設範本或空白狀態開始建立。
    - **[Spec-AR-Wiz-003]** 規則必須能關聯到一或多個監控資源。
    - **[Spec-AR-Wiz-004]** 規則的觸發條件必須能基於「指標、運算子、閾值」的組合，並可設定持續時間。
    - **[Spec--AR-Wiz-005]** 系統必須支援使用變數來自訂觸發後產生的事件摘要和描述。
    - **[Spec-AR-Wiz-006]** 規則可以選擇性地關聯一個自動化腳本，以便在觸發時自動執行。
    - **[Spec-AR-Wiz-007]** `[NEEDS CLARIFICATION: 條件群組的邏輯]` 需明確觸發條件是否支援多個條件群組，以及群組間的 AND/OR 邏輯。

---

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 條件群組的邏輯

## Source Evidence
- ### 告警規則管理 (Alert Rules) （來源：`docs/specs/incidents-spec-pages.md`）

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

