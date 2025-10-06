# Feature Specification: 事件列表 (Incidents List)

**Feature Branch**: `[incidents-list-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/incidents-spec-pages.md` → ``incidents-list-overview.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/incidents-list-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `incidents-list-overview.png`

**現況描述**
- **頁面標題**：頁面主標題為「事件列表」。
- **頂部操作區**：包含「匯入」與「新增事件」兩個主要按鈕。
- **篩選與搜尋**：
    - 提供一個文字搜尋框，提示使用者「搜尋事件摘要...」。
    - 提供多個下拉式篩選器，包括「狀態」、「等級」、「指派對象」。
    - 提供一個日期範圍選擇器來篩選事件發生時間。
- **批次操作工具列**：當使用者勾選列表中的項目時出現，顯示已選取的項目數量，並提供「批次關閉」和「指派」操作。
- **事件列表**：以表格形式呈現，欄位包含：
    - `摘要`：事件的主要描述。
    - `資源`：與事件相關的資源名稱。
    - `等級`：以不同顏色的標籤顯示，例如 `Critical` (紅色)、`Warning` (橘色)。
    - `狀態`：以標籤顯示，例如 `New`、`Acknowledged`。
    - `指派對象`：顯示被指派處理此事件的人員或團隊。
    - `發生時間`：事件首次發生的時間戳。
    - `關聯規則`：觸發此事件的告警規則名稱。
- **分頁控制**：表格右下方提供分頁功能，用於瀏覽大量事件。

**互動流程**
- **搜尋**：使用者在搜尋框輸入關鍵字並按下 Enter 或點擊搜尋按鈕後，列表應僅顯示摘要欄位匹配關鍵字的事件。
- **篩選**：使用者可透過下拉選單選擇特定狀態、等級或指派對象，列表會即時更新以符合篩選條件。使用者也可以透過日期選擇器篩選特定時間範圍內的事件。
- **排序**：使用者可點擊表格標頭（例如「發生時間」）對事件列表進行升序或降序排序。
- **批次操作**：
    1. 使用者勾選列表項目左側的核取方塊。
    2. 批次操作工具列出現。
    3. 使用者點擊「批次關閉」，會彈出一個確認視窗，要求填寫解決方案說明。
    4. 使用者點擊「指派」，會彈出 `incidents-assign-modal.png` 所示的指派視窗。
- **新增事件**：點擊「新增事件」按鈕，應開啟一個表單或精靈，讓使用者手動建立新事件。
- **查看詳情**：點擊任一事件的「摘要」連結，應導向至該事件的詳情頁 (`incidents-detail-timeline.png`)。

## Requirements *(mandatory)*
**API 與資料流**
- **取得事件列表**
    - **Endpoint**: `GET /api/v1/incidents`
    - **傳入參數 (Query Params)**:
        - `page: number` (分頁頁碼)
        - `page_size: number` (每頁項目數)
        - `sort_by: string` (排序欄位，例如 `occurred_at`)
        - `sort_order: 'asc' | 'desc'` (排序方向)
        - `search: string` (搜尋關鍵字)
        - `status: string` (狀態篩選)
        - `severity: string` (等級篩選)
        - `assignee_id: string` (指派對象篩選)
        - `start_date: string` (ISO 格式日期)
        - `end_date: string` (ISO 格式日期)
    - **傳出資料 (Response Body)**: `Paginated<Incident>`
        ```typescript
        // 註解：分頁後的事件列表回應
        {
          items: Incident[], // 事件物件陣列
          total: number,     // 總項目數
          page: number,      // 目前頁碼
          page_size: number  // 每頁大小
        }
        ```
    - **資料流**：頁面載入時，前端呼叫此 API 取得第一頁資料。當使用者進行搜尋、篩選、排序或換頁時，前端會帶上對應的查詢參數重新呼叫此 API，並更新表格內容。

- **批次關閉事件**
    - **Endpoint**: `POST /api/v1/incidents/batch-close`
    - **傳入參數 (Request Body)**:
        ```typescript
        // 註解：批次關閉事件的請求
        {
          incident_ids: string[], // 要關閉的事件 ID 陣列
          resolution_note: string // 解決方案說明
        }
        ```
    - **資料流**：使用者選擇事件並點擊「批次關閉」後，前端收集所選事件的 ID，並將其與解決方案說明一同發送到此 API。成功後，前端應重新整理事件列表或更新對應事件的狀態為 `resolved`。

- **批次指派事件**
    - **Endpoint**: `POST /api/v1/incidents/batch-assign`
    - **傳入參數 (Request Body)**:
        ```typescript
        // 註解：批次指派事件的請求
        {
          incident_ids: string[], // 要指派的事件 ID 陣列
          assignee_id: string,    // 被指派者的使用者 ID
          assignee_name: string   // 被指派者的名稱
        }
        ```
    - **資料流**：在指派視窗中選擇指派對象並確認後，前端將所選事件 ID 和指派對象資訊發送到此 API。成功後，前端應重新整理列表或更新對應事件的「指派對象」欄位。

**需求與規格定義**
- **使用者需求**
    - 作為一名 SRE/維運人員，我希望能快速瀏覽所有進行中的事件，以便了解系統的整體健康狀況。
    - 我希望能根據事件的嚴重等級進行篩選，以便優先處理最緊急的問題。
    - 我希望能將多個相關的事件一次性指派給特定人員，以提升處理效率。
    - 我希望能搜尋特定關鍵字，以便快速找到與某個服務或錯誤訊息相關的事件。
- **功能規格**
    - **[Spec-INC-List-001]** 系統必須提供一個事件列表頁，預設按「發生時間」降序顯示所有「未解決」的事件。
    - **[Spec-INC-List-002]** 系統必須支援依據「狀態」、「等級」、「指派對象」和「發生時間範圍」對事件進行篩選。
    - **[Spec-INC-List-003]** 系統必須提供關鍵字搜尋功能，該功能應匹配事件的「摘要」欄位。
    - **[Spec-INC-List-004]** 系統必須支援對列表中的多個事件進行「批次關閉」操作，並記錄解決方案。
    - **[Spec-INC-List-005]** 系統必須支援對列表中的多個事件進行「批次指派」操作。
    - **[Spec-INC-List-006]** 系統必須支援對所有可見欄位進行升序或降序排序。
    - **[Spec-INC-List-007]** 當事件數量超過單頁顯示上限時，系統必須提供分頁功能。
    - **[Spec-INC-List-008]** `[NEEDS CLARIFICATION: 「匯入」按鈕的具體功能]` 需定義匯入的檔案格式（例如 CSV, JSON）以及對應的欄位。

---

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 「匯入」按鈕的具體功能

## Source Evidence
- ### `incidents-list-overview.png` （來源：`docs/specs/incidents-spec-pages.md`）

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

