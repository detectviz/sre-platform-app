# Feature Specification: 靜默規則管理 (Silence Rules)

**Feature Branch**: `[incidents-silence-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/incidents-spec-pages.md` → `靜默規則管理 (Silence Rules)`

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/incidents-silence-spec.md`。

## User Scenarios & Testing *(mandatory)*
### 靜默規則管理 (Silence Rules)

此功能區塊包含靜默規則的列表管理以及建立/編輯規則的精靈。

#### `incidents-silence-rules-list.png`

**現況描述**
- **頁面標題**: 「靜默規則」。
- **操作按鈕**: 包含「新增規則」按鈕。
- **篩選與搜尋**: 提供「啟用狀態」、「類型」的下拉篩選器，以及一個文字搜尋框。
- **規則列表**:
    - 以表格呈現，欄位包含：`名稱`, `類型`, `條件`, `排程`, `啟用狀態`, `最後更新時間`。
    - 支援透過核取方塊進行批次操作，如「啟用」、「停用」、「刪除」。

**互動流程**
- **新增規則**: 點擊「新增規則」按鈕，開啟靜默規則建立精靈 (`incidents-silence-rule-wizard-step1.png`)。
- **編輯規則**: 點擊任一規則的名稱，開啟同樣的精靈，但會預先填入該規則的現有設定。
- **批次操作**: 使用者勾選多個規則後，點擊對應的批次操作按鈕來一次修改多個規則。

## Requirements *(mandatory)*
**API 與資料流**
- **取得規則列表**: `GET /api/v1/silence-rules`
    - **參數**: `page`, `page_size`, `sort_by`, `sort_order`, `keyword`, `type`, `enabled`。
- **批次操作**: `POST /api/v1/silence-rules/batch-actions`
    - **參數**: `{ action: 'enable' | 'disable' | 'delete', ids: string[] }`。

**需求與規格定義**
- **使用者需求**:
    - 我希望能預先設定一些規則，在特定時間（例如計畫性維護期間）自動靜默某些告警，避免不必要的通知。
- **功能規格**:
    - **[Spec-SR-List-001]** 系統必須提供一個可搜尋、篩選、排序及分頁的靜默規則列表。
    - **[Spec-SR-List-002]** 系統必須支援對靜默規則進行批次的「啟用」、「停用」和「刪除」操作。

---

#### `incidents-silence-rule-wizard-step1.png` to `step3.png`

**現況描述**
這是一個三步驟的精靈，用於引導使用者建立或編輯一條靜默規則。

- **步驟 1: 基本資訊 (`step1`)**
    - 讓使用者填寫 `規則名稱` 和 `描述`。
- **步驟 2: 靜默排程 (`step2-once`, `step2-recurring`)**
    - **排程類型**: 提供「單次生效」和「週期性生效」兩種模式。
    - **單次生效**: 使用者需選擇 `開始時間` 和 `結束時間`。
    - **週期性生效**: 使用者需設定 `重複頻率`（如每日、每週）、`星期幾`（若為每週）、以及每日生效的 `時間區間`。
- **步驟 3: 靜默條件 (`step3`)**
    - 讓使用者定義要靜默哪些事件的匹配條件。
    - 使用者可以新增一或多條匹配條件，每條條件由 `標籤 (Label)`、`運算子 (Operator)` 和 `值 (Value)` 組成。
    - 例如：`severity = critical`。

**互動流程**
1. 使用者依序填寫步驟 1 到 3 的表單內容。
2. 在步驟 2，介面會根據選擇的排程類型（單次/週期性）動態切換對應的表單欄位。
3. 在步驟 3，使用者可以動態新增或移除匹配條件。
4. 在最後一步點擊「完成」或「儲存」按鈕，系統將所有設定提交給後端。

**API 與資料流**
- **建立新規則**: `POST /api/v1/silence-rules`
    - **傳入參數**: 一個 `SilenceRule` 物件，其結構需能表達所有精靈中的設定。
        ```typescript
        // 註解：建立靜默規則的請求
        {
          "name": "string",
          "description": "string",
          "schedule": {
            "type": "'once' | 'recurring'",
            // 若為 once
            "start_time": "ISO_date_string",
            "end_time": "ISO_date_string",
            // 若為 recurring
            "frequency": "'daily' | 'weekly'",
            "days_of_week": "number[]", // 0=Sun, 1=Mon...
            "time_from": "HH:mm",
            "time_to": "HH:mm",
            "timezone": "string" // 例如 "Asia/Taipei"
          },
          "matchers": [
            { "key": "string", "operator": "'=' | '!=' | 'contains'", "value": "string" }
          ]
        }
        ```
- **更新現有規則**: `PATCH /api/v1/silence-rules/:id`
    - **傳入參數**: 同上，但包含要更新的規則 ID。
- **資料流**: 使用者完成所有步驟並儲存時，前端將彙整所有狀態，透過單一的 `POST` 或 `PATCH` 請求發送給後端。

**需求與規格定義**
- **使用者需求**:
    - 我希望能建立一個在特定時間範圍內生效的單次靜默規則。
    - 我希望能建立一個週期性（例如每週二）生效的靜默規則，以應對固定的維護作業。
    - 我希望能精確定義要靜默的告警條件，例如只靜默來自某個特定服務的、等級為警告的告警。
- **功能規格**:
    - **[Spec-SR-Wiz-001]** 系統必須提供一個多步驟精靈，用於建立和編輯靜默規則。
    - **[Spec-SR-Wiz-002]** 規則的排程必須支援「單次」和「週期性」兩種模式。
    - **[Spec-SR-Wiz-003]** 週期性排程必須支援至少以「日」或「週」為單位的重複。
    - **[Spec-SR-Wiz-004]** 規則的匹配條件必須支援基於事件標籤的多條件組合。
    - **[Spec-SR-Wiz-005]** `[NEEDS CLARIFICATION: 匹配條件的邏輯]` 需明確多個匹配條件之間是 AND 還是 OR 邏輯。

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 匹配條件的邏輯

## Source Evidence
- ### 靜默規則管理 (Silence Rules) （來源：`docs/specs/incidents-spec-pages.md`）

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

