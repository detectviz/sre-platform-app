# Feature Specification: Automation Management

**Created**: 2025-10-08
**Status**: Draft
**Based on**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story
作為一名 SRE 或平台管理員，我需要一個統一的自動化管理平台，讓我能夠：
1. **建立與維護可重複使用的自動化腳本（Playbooks）**，例如「重啟服務」、「清理日誌檔案」或「擴展資料庫容量」
2. **設定觸發條件（Triggers）** 將事件與自動化操作連結，如告警觸發自動修復、排程執行定期任務
3. **追蹤與稽核所有執行歷史（History）**，包含每次任務的觸發來源、執行者、結果與詳細日誌

以便我能快速回應系統事件、減少重複性手動操作，並確保所有自動化活動可追溯、可審計，符合合規性要求。

### Acceptance Scenarios

#### 場景群組 A：腳本管理（Playbook Management）
1. **Given** 我需要建立一個用於清理磁碟空間的新腳本，
   **When** 我在「自動化管理」頁面點擊「新增腳本」，於彈出的模態框輸入名稱、描述，並貼上 Shell 腳本與參數定義，
   **Then** 新的腳本應被儲存，且列表重新載入後會顯示這個新腳本。

2. **Given** 一台伺服器的磁碟空間告急，我需要立即執行既有腳本，
   **When** 我在腳本列表上點擊「執行腳本」，於執行模態框內填寫必要參數並送出，
   **Then** 腳本應被執行，UI 會提示成功，且列表重新整理後顯示最新的執行狀態與時間戳。

3. **Given** 我想一次刪除多個過時的腳本，
   **When** 我在表格中勾選多個腳本，並點擊出現的「刪除」批次操作按鈕，
   **Then** 系統應彈出確認對話框，確認後所有被選中的腳本都應被刪除。

#### 場景群組 B：觸發器管理（Trigger Management）
4. **Given** 我想設定一個每日報告的自動化任務，
   **When** 我在「觸發器」頁籤點擊「新增觸發器」，設定觸發類型為「排程」，輸入 CRON 表達式，並將其綁定到一個腳本，
   **Then** 新的觸發器應出現在列表中，狀態為「啟用」。

5. **Given** 我希望設定一個觸發器，當某個特定的告警規則被觸發時，自動執行「重啟服務」的腳本，
   **When** 我建立觸發器時選擇觸發類型為「事件」，使用結構化條件產生器設定告警條件，並綁定對應腳本，
   **Then** 當告警規則觸發時，系統應自動執行綁定的腳本並記錄執行歷史。

6. **Given** 我想批次停用多個觸發器以進行系統維護，
   **When** 我在觸發器列表中勾選多個項目，並點擊批次操作欄中的「停用」按鈕，
   **Then** 所有被選中的觸發器狀態應變為「停用」，且不再執行自動化任務。

#### 場景群組 C：執行歷史追蹤（Execution History）
7. **Given** 我正在查看「執行歷史」頁籤，
   **When** 我使用快速篩選器選擇「失敗」狀態，
   **Then** 系統應立即更新列表，只顯示失敗的執行紀錄。

8. **Given** 我想了解某次執行失敗的詳細原因，
   **When** 我點擊該筆紀錄，
   **Then** 系統應打開右側詳情面板，顯示結構化日誌、執行步驟摘要、觸發來源與執行者資訊。

9. **Given** 一筆任務執行失敗且屬暫時性錯誤（如網路逾時），
   **When** 我在操作列點擊「重試」按鈕，
   **Then** 系統應開啟重試確認框，允許輸入重試原因與自訂參數；
   **And Then** 點擊確認後，新增一筆狀態為「執行中」的紀錄並開始追蹤執行進度。

10. **Given** 我想將最近 7 天的執行紀錄用於報告分析，
    **When** 我點擊「匯出」按鈕並選擇時間範圍，
    **Then** 系統應生成一份 CSV 檔案供下載，包含目前篩選條件下的所有紀錄（腳本名稱、狀態、觸發來源、執行者、開始時間、時長、結果）。

#### 場景群組 D：整合情境（Integrated Scenarios）
11. **Given** 我想確認一個觸發器最近是否成功執行了其腳本，
    **When** 我查看觸發器列表中的「上次執行結果」欄位，
    **Then** 我應該能看到由該特定觸發器觸發的最近一次執行狀態（如：成功、失敗）以及相對執行時間，
    **And Then** 點擊該欄位應導航至執行歷史頁面並自動篩選該觸發器的所有執行紀錄。

12. **Given** 一筆任務正在執行中，
    **When** 我查看執行狀態欄位，
    **Then** 系統應每隔固定間隔更新狀態，直到任務完成或失敗。
    → [FUTURE] 此功能需依後端事件流整合完成。

### 邊界案例（Edge Cases）
- 當使用者嘗試執行一個需要參數但未提供參數的腳本時，系統應在執行模態框中給出明確的錯誤提示，並阻止執行。
- 當使用者嘗試建立一個觸發器但未綁定任何腳本時，系統應在儲存時給出錯誤提示。
- 當一個觸發器所綁定的腳本被刪除時，後端應自動禁用該觸發器，並在 UI 上顯示其為無效狀態。
- 當使用者嘗試刪除一個被其他設定（如通知策略）依賴的觸發器時，後端必須回傳 `409 Conflict` 錯誤，前端需據此顯示清晰的提示。
- 巨量日誌內容（>10MB）仍可逐段載入與虛擬化顯示。
- 執行中任務不應允許重試操作。
- 若 API 錯誤，應顯示明確錯誤提示並允許重新整理。
- 如果一個腳本從未被執行過，其「最後執行時間」和「最後執行狀態」欄位應顯示為 "從未" 或 "--"。
- [FUTURE] 支援使用者選擇多筆歷史紀錄進行批次重試。

---

## 二、功能需求（Functional Requirements）

### 2.1. 腳本管理（Playbook Management）
- **FR-PM-001**: 系統必須（MUST）提供完整的 CRUD 介面來管理自動化腳本，並支援分頁、排序、搜尋與批次操作。
- **FR-PM-002**: 系統必須（MUST）在表格中顯示腳本的複合資訊，包括：名稱、描述、腳本類型標籤、參數數量標籤、關聯觸發器數量、最近執行狀態和時間。
- **FR-PM-003**: 使用者必須（MUST）能透過腳本編輯模態框進行腳本的新增與編輯，包含名稱、描述、腳本內容與參數定義。
- **FR-PM-004**: 使用者必須（MUST）能透過執行模態框手動觸發腳本執行，並輸入必要參數。
- **FR-PM-005**: 列表中的觸發器標籤必須（MUST）是可互動的連結，能導航至觸發器管理頁面並應用篩選。
- **FR-PM-006**: 腳本參數定義必須（MUST）包含 `name`、`type`、`required`、`default_value` 等欄位。
- **FR-PM-007**: 當腳本被刪除時，系統必須（MUST）自動禁用所有關聯的觸發器，並在觸發器列表中標示為無效狀態。

### 2.2. 觸發器管理（Trigger Management）
- **FR-TM-001**: 系統必須（MUST）提供完整的 CRUD 介面來管理自動化觸發器，並支援分頁、排序、搜尋與批次操作。
- **FR-TM-002**: 系統必須（MUST）支援至少兩種觸發類型：「排程」（CRON 表達式）與「事件」（基於系統事件或告警）。
- **FR-TM-003**: 系統必須（MUST）允許使用者在建立或編輯觸發器時，從現有的自動化腳本庫中選擇一個進行綁定。
- **FR-TM-004**: 對於「事件」類型的觸發器，編輯模態框中必須（MUST）提供結構化的條件產生器以設定觸發條件。
- **FR-TM-005**: 系統必須（MUST）允許使用者單獨或批次地啟用/停用觸發器。
- **FR-TM-006**: 觸發器物件必須（MUST）包含 `last_execution` 物件，記錄由該特定觸發器觸發的最近一次執行狀態與時間。
- **FR-TM-007**: 觸發器列表中的「上次執行結果」欄位必須（MUST）是可互動的連結，能導航至執行歷史頁面並自動篩選該觸發器的執行紀錄。

### 2.3. 執行歷史追蹤（Execution History）
- **FR-EH-001**: 系統必須（MUST）提供可分頁、可排序的執行歷史表格。
- **FR-EH-002**: 表格中須包含：腳本名稱、狀態、觸發來源（手動/觸發器名稱）、執行者、開始時間、執行時長。
- **FR-EH-003**: 使用者可透過快速篩選與進階搜尋組合查詢紀錄（狀態、執行者、時間範圍、腳本名稱、觸發來源）。
- **FR-EH-004**: 點擊任一紀錄可開啟詳細面板檢視結構化日誌內容、執行步驟摘要、觸發來源與執行者資訊。
- **FR-EH-005**: 對失敗任務提供「重試」操作，並記錄重試原因與輸入參數。
- **FR-EH-006**: 支援將執行紀錄匯出為 CSV，包含使用中篩選條件。
- **FR-EH-007**: 執行者欄位應渲染結構化資訊（例如使用者名稱、觸發器名稱、觸發來源類型）。
- **FR-EH-008**: 詳細日誌需顯示分段步驟、時間戳、執行結果與錯誤訊息。
- **FR-EH-009**: 資料保留期限為 90 天，逾期自動清除。
- **FR-EH-010**: [FUTURE] 支援實時狀態更新（基於事件流或輪詢）。
- **FR-EH-011**: [FUTURE] 支援批次匯出與批次重試操作。

### 2.4. 整合與治理需求（Integration & Governance）
- **FR-IG-001**: 所有 UI 文字（包括 Toast 通知）必須（MUST）使用 i18n Key 進行渲染。
- **FR-IG-002**: 所有 UI 元件的顏色必須（MUST）使用語義化的 Theme Token，禁止直接使用 Tailwind 色票或自訂 class。
- **FR-IG-003**: 所有 state-changing 操作（建立、更新、刪除、執行）成功後，後端必須（MUST）回傳 `auditId`，前端需在提示訊息中顯示此 ID 以利追蹤。
- **FR-IG-004**: 系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。
- **FR-IG-005**: 所有 CUD（建立、更新、刪除）和執行操作，都必須（MUST）產生包含操作上下文的審計日誌。
- **FR-IG-006**: 應上報與腳本執行成功率、失敗率、平均執行時間、觸發器執行頻率相關的指標至監控系統。

---

## 三、權限控制 (RBAC)

### 3.1. 權限定義 (Permissions)
- `automation:playbooks:read`: 檢視腳本列表與詳情。
- `automation:playbooks:create`: 建立新腳本。
- `automation:playbooks:update`: 修改腳本內容與參數定義。
- `automation:playbooks:delete`: 刪除腳本。
- `automation:playbooks:execute`: 手動執行腳本。
- `automation:triggers:read`: 檢視觸發器列表與詳情。
- `automation:triggers:create`: 建立新觸發器。
- `automation:triggers:update`: 修改觸發器設定（包括啟用/停用）。
- `automation:triggers:delete`: 刪除觸發器。
- `automation:history:read`: 檢視執行歷史與詳細日誌。
- `automation:history:retry`: 允許重試執行失敗的任務。
- `automation:history:export`: 允許匯出執行歷史資料。

### 3.2. UI 控制映射 (UI Mapping)
- **頁面存取**: 整個「自動化管理」頁面需由 `<RequirePermission permission="automation:playbooks:read">` 包裹（最低權限）。
- **頁籤存取**:
  - 腳本管理頁籤: `automation:playbooks:read`
  - 觸發器管理頁籤: `automation:triggers:read`
  - 執行歷史頁籤: `automation:history:read`
- **操作按鈕**:
  - 「新增腳本」: `automation:playbooks:create`
  - 「編輯腳本」: `automation:playbooks:update`
  - 「刪除腳本」: `automation:playbooks:delete`
  - 「執行腳本」: `automation:playbooks:execute`
  - 「新增觸發器」: `automation:triggers:create`
  - 「編輯觸發器」: `automation:triggers:update`
  - 「啟用/停用觸發器」: `automation:triggers:update`
  - 「刪除觸發器」: `automation:triggers:delete`
  - 「重試執行」: `automation:history:retry`
  - 「匯出歷史」: `automation:history:export`
- **批次操作**: 所有批次操作均需根據對應的權限進行渲染。
- **後端 API**: 需依權限過濾可見紀錄與可操作項目。

---

{{specs/common.md}}

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可以在 10 分鐘內建立完整的自動化工作流程
- **SC-002**: 支援同時執行 50 個自動化任務，平均執行時間低於 2 分鐘
- **SC-003**: 自動化成功率達到 95%，減少 80% 的重複人工操作

---

## 四、審查與驗收清單（Review & Acceptance Checklist）

- [x] 所有段落齊備且結構正確。
- [x] 無技術語句。
- [x] 所有 FR 具可測試性。
- [x] 無模糊或重疊需求。
- [x] 與 `.specify/memory/constitution.md` (v1.3.0) 一致。
- [x] 模板結構完整。
- [x] 已整合 `automation-history-spec.md`、`automation-playbook-spec.md`、`automation-trigger-spec.md` 三份規格。

---

## 五、模糊與待確認事項（Clarifications）

- **日誌匯出格式**: [CLARIFY] : 預期為 CSV，需確定欄位順序與內容格式。
- **即時狀態更新頻率**: [NEEDS CLARIFICATION] : 需確認事件流或輪詢週期，以及對前端效能的影響。
- **批次重試行為**: [FUTURE] : 將於後期版本開放，需確認批次重試的失敗處理邏輯。
- **觸發器條件產生器**: [NEEDS CLARIFICATION] : 需確認事件類型觸發器的條件語法與支援的事件來源（告警、系統事件、外部 webhook 等）。
- **腳本參數類型**: [NEEDS CLARIFICATION] : 需確認支援的參數類型範圍（string、number、boolean、select、multi-select 等）。
- **執行中任務取消**: [FUTURE] : 需確認是否支援取消執行中的任務，以及取消後的狀態處理。

---
