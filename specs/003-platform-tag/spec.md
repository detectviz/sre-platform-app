# Feature Specification: Platform Tag

**Created**: 2025-10-08
**Status**: Ready for Technical Review
**Based on**: `.specify/memory/constitution.md` (v1.3.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story

作為一名平台架構師或治理負責人，我需要一個集中化的標籤治理介面，讓我能夠：
1. **定義統一標籤體系** — 建立、修改、刪除全平台統一的標籤定義，確保跨模組的一致性。
2. **靈活管理標籤值** — 對於列舉類型的標籤，能夠動態新增、修改、刪除其允許值，快速響應業務變化。
3. **實施權限控制** — 限制關鍵標籤（如合規標籤）僅特定角色可修改，避免誤操作。

以便在整個平台上實施一致的資源分類、成本追蹤和權限控制策略，提升系統的可治理性與自動化潛力。

### 具體情境（Specific Scenarios）
- **資源分類**: 為所有雲資源（VM、資料庫、網路）打上 `environment` (dev/staging/prod) 和 `business_unit` (ecommerce/logistics) 標籤，以便快速篩選與管理。
- **成本追蹤**: 為每個專案的資源打上 `cost_center` 標籤，以便財務部門進行精確的成本分攤。
- **權限控制**: 建立基於標籤的權限策略，例如「僅允許 `Developer` 角色存取帶有 `environment=dev` 標籤的資源」。
- **批次操作**: 在自動化腳本中，使用標籤篩選器 `environment=staging` 選中所有測試環境伺服器，一鍵執行安全補丁。

### 現有痛點（Pain Points）
- **標籤不一致**: 缺乏統一規範，導致 `env` 和 `environment` 等多種拼寫並存，難以查詢。
- **標籤值混亂**: 使用者隨意輸入 `prod` 或 `production`，導致數據不一致。
- **權限風險**: 任何人都可以修改關鍵標籤（如 `cost_center`），可能導致成本計算錯誤。
- **管理效率低**: 新增標籤或修改允許值需要開發人員修改代碼，響應緩慢。

### Acceptance Scenarios

### 場景群組 A：標籤定義管理
1.  **Given** 我在標籤管理頁面, **When** 我點擊「新增標籤」並輸入標籤鍵 `app`、類型 `text`, **Then** 新標籤應成功建立並出現在列表中。
2.  **Given** 一個現有的 `status` 標籤, **When** 我編輯它，將其從「選填」改為「必填」, **Then** 系統應提示影響範圍並在確認後更新。
3.  **Given** 我嘗試刪除一個正在被資源使用的 `owner` 標籤, **When** 我點擊「刪除」, **Then** 系統應警告影響並要求二次確認。

### 場景群組 B：標籤值管理
4.  **Given** 一個類型為 `enum` 的 `region` 標籤, **When** 我進入其「管理標籤值」頁面並新增一個值 `us-west-2`, **Then** 該值應出現在允許值列表中。
5.  **Given** `region` 標籤的一個允許值 `eu-central-1` 已過時, **When** 我嘗試刪除它, **Then** 系統應檢查其使用情況並提示遷移。
6.  **Given** 我需要批次建立多個標籤值, **When** 我上傳 CSV 檔案, **Then** 系統應驗證並批次新增。

### 場景群組 C：權限控制
7.  **Given** 我編輯 `cost_center` 標籤, **When** 我將其「寫入權限」設定為僅限 `Finance` 角色, **Then** 其他角色將無法修改此標籤。
8.  **Given** 一個普通使用者嘗試修改受限的 `cost_center` 標籤, **When** 他點擊儲存, **Then** 系統應顯示權限不足的錯誤。
9.  **Given** 我查看一個系統內建的唯讀標籤（如 `creation_date`）, **When** 我嘗試編輯或刪除它, **Then** 對應的操作按鈕應被禁用或操作被拒絕。

### 場景群組 D：整合情境
10. **Given** 我在資源管理頁面新增標籤, **When** 我點擊標籤鍵的下拉選單, **Then** 系統應顯示所有已定義的標籤鍵供我選擇。
11. **Given** 我選擇了一個 `enum` 類型的 `environment` 標籤, **When** 我點擊標籤值的輸入框, **Then** 系統應顯示一個包含 `dev`, `staging`, `production` 的下拉選單。
12. **Given** 我在儀表板中建立一個圖表, **When** 我選擇按 `business_unit` 標籤分組, **Then** 圖表應按業務單位顯示數據。

---

## 二、功能需求（Functional Requirements）

### 2.1. 標籤定義 (Tag Definition)
- **FR-TD-001**: 系統必須（MUST）提供標籤定義的 CRUD 功能。
- **FR-TD-002**: 每個標籤定義必須（MUST）包含：標籤鍵、類型（enum/text）、是否必填、寫入權限。
- **FR-TD-003**: 系統必須（MUST）支援批次匯入/匯出標籤定義。

### 2.2. 標籤值 (Tag Value)
- **FR-TV-001**: 對於 `enum` 類型的標籤，系統必須（MUST）提供允許值的 CRUD 功能。
- **FR-TV-002**: 刪除被使用的允許值時，系統應該（SHOULD）提供遷移選項。

### 2.3. 權限控制 (Permission Control)
- **FR-PC-001**: 系統必須（MUST）支援為每個標籤定義設定「寫入權限」，限制可修改的角色。
- **FR-PC-002**: 系統必須（MUST）在使用者修改標籤時，強制執行權限檢查。

### 2.4. 整合 (Integration)
- **FR-I-001**: 所有使用標籤的模組（如資源管理、成本分析）必須（MUST）從本模組讀取標籤定義。
- **FR-I-002**: 在為實體（如資源）新增或編輯標籤時，UI 必須（MUST）基於標籤定義提供智能提示和輸入驗證。

---

{{specs/common.md}}

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可以在 1 分鐘內建立新標籤並設定基本屬性
- **SC-002**: 系統支援至少 1000 個標籤並維持良好的搜尋效能
- **SC-003**: 95% 的標籤搜尋能在 200 毫秒內完成
- **SC-004**: 標籤使用率達到 80%，減少 60% 的重複標籤建立 |