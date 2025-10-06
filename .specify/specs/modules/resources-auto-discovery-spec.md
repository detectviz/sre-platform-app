# Feature Specification: 自動發現任務 (Auto Discovery)

**Feature Branch**: `[resources-auto-discovery-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/resources-spec-pages.md` → ``resources-auto-discovery-list.png``、 `docs/specs/resources-spec-pages.md` → ``resources-edit-discovery-task-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/resources-auto-discovery-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `resources-auto-discovery-list.png`

**現況描述**
- 此頁面為「自動發現 (Auto Discovery)」管理介面，以表格形式呈現所有設定的掃描任務。
- **工具列**：
    - 右側提供一個「新增掃描」按鈕。
- **表格**：
    - 欄位包含：名稱、掃描類型、排程、最後執行、狀態。
    - 「掃描類型」使用帶樣式的標籤區分 (如 Kubernetes, VMWare)。
    - 「排程」欄位使用 `cron` 表達式格式。
    - 「狀態」欄位使用圖示和文字顯示任務的執行狀態 (如等待中、執行中、成功、失敗)。
    - 每行提供「查看結果」、「手動執行」、「編輯」、「刪除」的操作按鈕。

**互動流程**
- **載入頁面**：
    1. 頁面載入時，呼叫 API 獲取所有自動發現任務的列表。
    2. 若 API 呼叫失敗，顯示錯誤訊息。
- **新增掃描任務**：
    1. 使用者點擊「新增掃描」按鈕。
    2. 系統彈出「自動發現編輯 (AutoDiscoveryEditModal)」視窗。
    3. 使用者填寫任務名稱、選擇掃描類型、設定目標與排程後儲存。
    4. 系統呼叫 API 建立新任務，成功後刷新列表。
- **編輯掃描任務**：
    1. 使用者點擊任一任務的「編輯」按鈕。
    2. 系統彈出編輯視窗，並載入該任務的現有設定。
    3. 使用者修改後儲存，系統呼叫 API 更新任務，並刷新列表。
- **刪除掃描任務**：
    1. 使用者點擊「刪除」按鈕。
    2. 系統彈出確認對話框。
    3. 確認後，系統呼叫 API 刪除該任務，並刷新列表。
- **手動執行**：
    1. 使用者點擊「手動執行」按鈕。
    2. 前端顯示提示，並呼叫 API 觸發一次性的任務執行。
    3. 列表中的任務狀態會更新為「執行中」。
- **查看結果**：
    1. 使用者點擊「查看結果」按鈕。
    2. 系統從右側滑出一個抽屜 (Drawer)，其中包含 `DiscoveryJobResultDrawer` 元件，顯示該次任務掃描到的資源列表。

### `resources-edit-discovery-task-modal.png`

**現況描述**
- 此為「新增/編輯自動掃描任務」的彈出式視窗，採用多區段長表單的設計。
- **表單結構**：
    - **1. 基本資訊**：設定任務名稱、掃描類型（下拉選單）、掃描排程（Cron 表達式）。
    - **2. 目標配置**：此區塊內容根據「掃描類型」動態變化。例如，選擇 `K8s` 會顯示 `kubeconfig` 的文字輸入區；選擇 `SNMP` 則顯示 `Community String` 和 `IP 範圍` 輸入框。
    - **3. Exporter 綁定**：設定發現資源後要如何監控。包含 `Exporter 模板` 下拉選單，並可能根據模板顯示 `MIB Profile` 下拉選單或 `自訂覆寫 YAML` 輸入區。
    - **4. 邊緣掃描**：透過核取方塊和下拉選單，設定是否經由 Edge Gateway 執行掃描。
    - **5. 標籤與分類**：提供鍵值對輸入元件，用於為此任務本身加上標籤。
- **操作按鈕**：
    - 左下角有「測試掃描」按鈕。
    - 右下角有「取消」和「儲存」按鈕。

**互動流程**
- **開啟視窗**：
    1. 在自動發現列表頁點擊「新增掃描」或「編輯」。
    2. 視窗彈出，並根據模式顯示標題。在編輯模式下，會載入任務現有設定。
    3. 系統從 API 獲取所有下拉選單的選項（掃描類型、模板、MIB Profiles 等）。
- **動態表單互動**：
    1. 當使用者在「掃描類型」下拉選單中選擇不同選項時，「2. 目標配置」區塊的表單欄位會隨之改變。
    2. 當使用者在「Exporter 模板」下拉選單中選擇不同選項時，「3. Exporter 綁定」區塊的附加選項（如 MIB Profile）會動態顯示或隱藏。
- **測試掃描**：
    1. 使用者填寫完必要資訊後，點擊「測試掃描」。
    2. 系統呼叫測試 API，將當前表單配置送往後端進行預掃描。
    3. 後端返回測試結果（成功/失敗、預計發現資源數、警告訊息）後，系統以提示框（Toast）顯示結果。此操作不儲存資料。
- **儲存**：
    1. 使用者點擊「儲存」。
    2. 系統根據模式呼叫 `POST` (新增) 或 `PATCH` (編輯) API。
    3. 成功後關閉視窗並刷新列表。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取掃描任務列表**：
    - `GET /api/v1/resources/discovery-jobs`
    - **傳出資料**：`{ items: DiscoveryJob[], total: number }`
    - **實現細節**：前端使用 `fetchJobs` 函數依目前 `filters` 狀態呼叫 API 【F:pages/resources/AutoDiscoveryPage.tsx†L21-L84】

- **新增掃描任務**：
    - `POST /api/v1/resources/discovery-jobs`
    - **傳入資料**：`DiscoveryJob` 物件
    - **實現細節**：點擊「新增掃描」或「編輯」會開啟 `AutoDiscoveryEditModal`，Modal 送出後依據是否含 `id` 決定 POST 或 PATCH 【F:pages/resources/AutoDiscoveryPage.tsx†L46-L111】

- **更新掃描任務**：
    - `PATCH /api/v1/resources/discovery-jobs/{id}`
    - **傳入資料**：部分更新的 `DiscoveryJob` 物件
    - **實現細節**：編輯模式下載入現有資料並提供完整表單更新 【F:pages/resources/AutoDiscoveryPage.tsx†L46-L111】

- **刪除掃描任務**：
    - `DELETE /api/v1/resources/discovery-jobs/{id}`
    - **實現細節**：刪除按鈕先顯示警示 Modal，再於確認時呼叫 DELETE，成功或失敗皆以 toast 回饋 【F:pages/resources/AutoDiscoveryPage.tsx†L52-L84】

- **手動執行掃描**：
    - `POST /api/v1/resources/discovery-jobs/{id}/run`
    - **實現細節**：即時呼叫 `/run` 端點並重新整理列表；「查看結果」開啟抽屜供後續批次匯入或標籤處理 【F:pages/resources/AutoDiscoveryPage.tsx†L101-L176】

- **獲取掃描結果**：
    - `GET /api/v1/resources/discovery-jobs/:id/results`
    - **傳出資料**：`DiscoveredResource[]`，包含發現的資源列表。
    - **實現細節**：結果抽屜使用 `DiscoveryJobResultDrawer` 組件顯示掃描資源清單 【F:components/DiscoveryJobResultDrawer.tsx†L15-L69】

**需求與規格定義**
- **使用者需求**：
    - 作為平台管理員，我希望能設定自動化任務，定期掃描我的環境（如 K8s, VMWare）並發現新的資源，無需手動逐一添加。
    - 我需要能管理這些掃描任務，包括建立、修改、刪除和設定排程。
    - 我希望能隨時手動觸發一次掃描。
    - 我需要能查看每次掃描的結果，並決定要將哪些發現的資源正式納管。
- **功能規格**：
    - **R-AD-001**：系統必須提供一個自動發現任務管理頁面，以列表展示所有已設定的任務。
    - **R-AD-002**：列表應包含任務名稱、類型、排程、最後執行時間與執行狀態。
    - **R-AD-003**：系統必須提供新增和編輯掃描任務的功能。表單應允許使用者設定任務名稱、掃描類型 (K8s/VMWare等)、掃描目標 (如 Namespace)、排程 (cron)。
    - **R-AD-004**：使用者可以刪除一個掃描任務，刪除前需有確認提示。
    - **R-AD-005**：使用者可對任一任務觸發「手動執行」。
    - **R-AD-006**：使用者可查看任一任務的「掃描結果」，結果應以列表形式展示所有發現的資源。

---

**API 與資料流**
- **獲取表單選項**：
    - `GET /api/v1/ui/options`
    - **傳出資料**：在 `auto_discovery` 欄位中提供 `job_kinds`, `exporter_templates`, `mib_profiles`, `edge_gateways` 等選項。
- **測試掃描 (不儲存)**：
    - `POST /api/v1/resources/discovery-jobs/test`
    - **傳入參數**：包含當前表單所有配置的 `DiscoveryJob` 物件。
    - **傳出資料**：`{ success: boolean, message: string, discovered_count: number, warnings: string[] }`。
- **新增掃描任務**：
    - `POST /api/v1/resources/discovery-jobs`
    - **傳入參數**：完整的 `DiscoveryJob` 物件。
- **更新掃描任務**：
    - `PATCH /api/v1/resources/discovery-jobs/:id`
    - **傳入參數**：完整的 `DiscoveryJob` 物件。

**需求與規格定義**
- **使用者需求**：
    - 我希望能有一個引導清晰的介面來設定一個完整的自動發現任務，從如何找到資源到如何監控它們。
    - 我需要能根據不同的環境（K8s, SNMP 等）提供不同的掃描參數。
    - 在正式建立任務前，我希望能先測試我的設定是否能成功掃描到東西。
- **功能規格**：
    - **R-DMOD-001**：系統必須提供一個多區段的彈出式視窗，用於新增和編輯自動發現任務。
    - **R-DMOD-002**：「目標配置」區塊的表單欄位必須根據所選的「掃描類型」動態生成。
    - **R-DMOD-003**：「Exporter 綁定」區塊的選項必須根據所選的「Exporter 模板」動態生成。
    - **R-DMOD-004**：必須提供一個「測試掃描」按鈕，能在不儲存任務的情況下，對當前配置進行預掃描驗證。
    - **R-DMOD-005**：測試結果應包含成功與否、預計發現的資源數量，並以提示框形式回饋給使用者。
    - **R-DMOD-006**：對於 Kubernetes 掃描類型，必須支援直接貼上或上傳 `kubeconfig` 檔案。

---

## Source Evidence
- ### `resources-auto-discovery-list.png` （來源：`docs/specs/resources-spec-pages.md`）
- ### `resources-edit-discovery-task-modal.png` （來源：`docs/specs/resources-spec-pages.md`）

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

