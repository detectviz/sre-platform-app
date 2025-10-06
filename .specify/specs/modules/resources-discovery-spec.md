# Feature Specification: 資源發現流程 (Discovery Workflow)

**Feature Branch**: `[resources-discovery-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/resources-spec-pages.md` → ``resources-discovery-results-modal.png``、 `docs/specs/resources-spec-pages.md` → ``resources-discovery-task-step3.png``、 `docs/specs/resources-spec-pages.md` → ``resources-discovery-task-step5.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/resources-discovery-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `resources-discovery-results-modal.png`

**現況描述**
- 此畫面為「掃描結果」抽屜，在自動發現列表頁點擊「查看結果」後從右側滑出。
- **頂部摘要**：以三個卡片顯示執行該次掃描的任務設定：掃描類型、Exporter 模板、Edge Gateway。
- **工具列**：
    - 當使用者勾選列表中的資源後，工具列會變為批次操作模式。
    - 提供「匯入到資源清單」、「批次加標籤」、「忽略 (黑名單)」三個主要操作。
- **結果表格**：
    - 欄位包含：複選框、名稱/IP、類型、標籤、狀態。
    - 「狀態」欄位以圖示和文字標示每個資源的狀態（新發現、已匯入、已忽略）。
    - 只有狀態為「新發現」的資源才能被勾選。

**互動流程**
- **開啟抽屜**：
    1. 在自動發現列表頁點擊某任務的「查看結果」按鈕。
    2. 此抽屜從右側滑出，並呼叫 API 獲取該任務的掃描結果。
- **選取資源**：
    1. 使用者可以勾選一個或多個狀態為「新發現」的資源。
    2. 已匯入或已忽略的資源，其複選框為禁用狀態。
- **批次匯入**：
    1. 使用者勾選資源後，點擊「匯入到資源清單」。
    2. 系統彈出一個匯入確認視窗 (`ImportResourceModal`)，其中可能包含部署監控代理等選項。
    3. 確認後，系統呼叫 API 將選定資源正式納管，成功後刷新結果列表，對應資源的狀態變為「已匯入」。
- **批次加標籤**：
    1. 使用者勾選資源後，點擊「批次加標籤」。
    2. 系統彈出標籤編輯視窗 (`BatchTagModal`)。
    3. 使用者輸入要添加的標籤後儲存，系統呼叫 API 為這些資源添加標籤，成功後刷新列表。
- **批次忽略**：
    1. 使用者勾選資源後，點擊「忽略 (黑名單)」。
    2. 系統呼叫 API 將這些資源的狀態更新為「已忽略」，成功後刷新列表。

### `resources-discovery-task-step3.png`

**現況描述**
- 此畫面為「新增/編輯自動掃描任務」視窗中的第三個區段：「**3. Exporter 綁定**」。
- 此區段的目的是定義在發現資源後，要用何種方式（Exporter）來持續監控它。
- **主要欄位**：
    - **Exporter 模板**：一個下拉選單，提供多種預設的監控模板（如 `node_exporter`, `snmp_exporter`）。
    - **MIB Profile**：一個下拉選單，此欄位只在選擇了支援 MIB 的 Exporter 模板（如 `snmp_exporter`）時才會出現。
    - **自訂覆寫 YAML**：一個文字輸入區，此欄位只在選擇了支援覆寫的 Exporter 模板時才會出現，允許使用者提供更進階的自訂設定。

**互動流程**
- **選擇 Exporter 模板**：
    1. 使用者從「Exporter 模板」下拉選單中選擇一個選項。
    2. 選擇後，下方的「MIB Profile」或「自訂覆寫 YAML」欄位會根據該模板的設定動態顯示或隱藏。
    3. 如果選擇了新的模板，系統可能會清空或重設相關的子選項（如 MIB Profile）。
- **選擇 MIB Profile**：
    1. 如果「MIB Profile」欄位可見，使用者可以從下拉選單中選擇一個預先定義好的 MIB 設定檔。
    2. 這些選項會根據所選的 Exporter 模板進行過濾。
- **填寫自訂 YAML**：
    1. 如果「自訂覆寫 YAML」欄位可見，使用者可以在其中貼上 YAML 格式的設定，來覆寫模板的預設行為。

### `resources-discovery-task-step5.png`

**現況描述**
- 此畫面為「新增/編輯自動掃描任務」視窗中的第五個，也是最後一個區段：「**5. 標籤與分類 (Metadata)**」。
- 此區段用於為這個掃描任務本身附加標籤。
- **主要元件**：
    - **標籤 (Tags)**：一個可動態增減的鍵值對 (Key-Value) 輸入區域。
    - **鍵 (Key)**：這不是一個自由輸入的文字框，而是一個下拉選單，其選項來自系統中預先定義好的標籤。
    - **值 (Value)**：這是一個動態元件。根據所選的「鍵」，它可以是一個自由輸入的文字框，也可以是一個多選下拉選單（如果該標籤有預設的可選值）。
    - **新增標籤按鈕**：允許使用者增加一組新的鍵值對輸入框。

**互動流程**
- **新增標籤**：
    1. 使用者點擊「新增標籤」按鈕。
    2. 列表下方會出現一組新的、空的鍵值輸入框。
- **選擇標籤鍵**：
    1. 使用者點擊「鍵」的下拉選單。
    2. 系統顯示從 API (`GET /settings/tags`) 獲取的所有可用標籤鍵。
    3. 使用者選擇一個鍵。
- **填寫標籤值**：
    1. 系統根據所選的「鍵」是否有預設的 `allowed_values`，來決定「值」輸入框的形態。
    2. **(情況A：文字輸入)** 如果沒有預設值，使用者可以直接在文字框中輸入。
    3. **(情況B：多選)** 如果有預設值，使用者可以點擊下拉選單，在彈出的列表中勾選一個或多個值。
- **移除標籤**：
    1. 使用者點擊任一標籤行最右側的「刪除」按鈕。
    2. 該行標籤即被移除。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取掃描結果**：
    - `GET /api/v1/resources/discovery-jobs/:id/results`
    - **傳出資料**：`DiscoveredResource[]`，包含該次掃描發現的所有資源及其狀態。
- **批次加標籤**：
    - `POST /api/v1/resources/batch-tags`
    - **傳入參數**：`{ resource_ids: string[], tags: KeyValueTag[] }`。
- **批次忽略**：
    - `POST /api/v1/discovery/batch-ignore`
    - **傳入參數**：`{ resource_ids: string[] }`。
- **批次匯入 (由 ImportResourceModal 觸發)**：
    - `POST /api/v1/resources/import-discovered` (推測)
    - **傳入參數**：`{ discovered_resource_ids: string[], job_id: string, deploy_agent: boolean }`。

**需求與規格定義**
- **使用者需求**：
    - 我需要能清楚地看到每次自動掃描發現了哪些新資源。
    - 我希望能對這些新發現的資源進行處理，例如決定要正式納管（匯入）、暫時忽略、或是在匯入前先統一加上標籤。
- **功能規格**：
    - **R-DRES-001**：系統必須提供一個抽屜或彈窗，用於展示指定掃描任務的結果。
    - **R-DRES-002**：結果列表必須清楚標示每個已發現資源的狀態（新發現、已匯入、已忽略）。
    - **R-DRES-003**：使用者只能對「新發現」狀態的資源進行操作。
    - **R-DRES-004**：系統必須提供「批次匯入」功能，允許使用者將選中的新資源正式納入平台管理。
    - **R-DRES-005**：系統必須提供「批次加標籤」功能，允許使用者在匯入前為選中的新資源統一添加標籤。
    - **R-DRES-006**：系統必須提供「批次忽略」功能，讓使用者可以將暫時不想處理的新資源加入黑名單，避免在下次掃描時重複出現。

---

**API 與資料流**
- **獲取表單選項**：
    - `GET /api/v1/ui/options`
    - **傳出資料**：在 `auto_discovery` 欄位中，`exporter_templates` 提供了模板列表及其元數據（如是否支援 MIB），`mib_profiles` 提供了可用的 MIB 設定檔。
- **儲存資料**：
    - 使用者在此區塊的所有操作，都會更新 `AutoDiscoveryEditModal` 元件內部的 `formData` 狀態。
    - 最終點擊「儲存」時，這些設定會被包含在 `exporter_binding` 物件中，隨整個任務的設定一同提交至 `POST /resources/discovery-jobs` 或 `PATCH /resources/discovery-jobs/:id` API。

**需求與規格定義**
- **使用者需求**：
    - 我希望在設定自動發現時，就能一併指定未來要如何監控這些被發現的資源。
    - 系統應該根據我選擇的掃描方式，推薦給我合適的監控模板。
    - 對於特殊設備（如 SNMP），我希望能選擇特定的 MIB 設定檔。
- **功能規格**：
    - **R-DT3-001**：在自動發現任務設定中，必須提供一個「Exporter 綁定」區段。
    - **R-DT3-002**：此區段的核心是一個「Exporter 模板」下拉選單，其選項必須由後端 API 提供。
    - **R-DT3-003**：表單必須是動態的，能夠根據所選模板的 `supports_mib_profile` 和 `supports_overrides` 屬性，來決定是否顯示「MIB Profile」和「自訂覆寫 YAML」欄位。
    - **R-DT3-004**：「MIB Profile」下拉選單中的選項，必須根據當前選擇的「Exporter 模板」進行過濾。

---

**API 與資料流**
- **獲取標籤定義**：
    - `GET /api/v1/settings/tags`
    - **傳出資料**：`TagDefinition[]`，包含所有已定義標籤的元數據，如 `key` 和 `allowed_values`。
- **儲存資料**：
    - 使用者在此區塊的所有操作，都會更新 `AutoDiscoveryEditModal` 元件內部的 `formData` 狀態。
    - 最終點擊「儲存」時，這些標籤會被包含在 `tags` 陣列中，隨整個任務的設定一同提交。

**需求與規格定義**
- **使用者需求**：
    - 我希望能為我建立的掃描任務加上一些標籤，方便我未來對任務本身進行分類和搜尋。
    - 為了保持一致性，我希望系統能提示我有哪些可用的標籤，而不是讓我憑記憶輸入。
- **功能規格**：
    - **R-DT5-001**：在自動發現任務設定中，必須提供一個「標籤與分類」區段。
    - **R-DT5-002**：此區段必須允許使用者為任務附加一或多個標籤。
    - **R-DT5-003**：標籤的「鍵」必須從一個預先定義的列表中選擇，該列表由 `GET /settings/tags` API 提供。
    - **R-DT5-004**：標籤的「值」輸入框必須是動態的：若對應的標籤鍵有 `allowed_values`，則必須呈現為多選下拉選單；否則，呈現為一般文字輸入框。

---

## Source Evidence
- ### `resources-discovery-results-modal.png` （來源：`docs/specs/resources-spec-pages.md`）
- ### `resources-discovery-task-step3.png` （來源：`docs/specs/resources-spec-pages.md`）
- ### `resources-discovery-task-step5.png` （來源：`docs/specs/resources-spec-pages.md`）

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

