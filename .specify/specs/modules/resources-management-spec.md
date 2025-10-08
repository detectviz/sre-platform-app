# Feature Specification: Resources Management

**Feature Branch**: `[resources-management]`  
**Created**: 2025-10-10  
**Status**: Draft  
**Input**: "整合資源清單、群組與資料源設定，提供統一的資源管理與觀測介面。"

---

## 一、主要使用者情境（User Scenarios & Testing）

### Primary User Story
作為平台管理員，我需要在同一介面中查看所有資源（伺服器、應用、資料源等），將它們分組管理、設定資料連接來源，並能快速檢視健康狀態與資源標籤，以確保系統穩定運作。

### Acceptance Scenarios
1. **Given** 我在資源管理頁面，  
   **When** 我展開「全部資源清單」，  
   **Then** 系統應顯示所有資源及其群組、狀態、標籤與最後更新時間。

2. **Given** 我想建立新的資源群組，  
   **When** 我點擊「新增群組」並輸入群組名稱與描述，  
   **Then** 系統應建立群組並允許拖曳資源至該群組。

3. **Given** 我需要連接外部資料源（如 Prometheus 或 VictoriaMetrics），  
   **When** 我於「資料源設定」頁新增一筆連線資訊，  
   **Then** 系統應驗證連線並在成功後顯示「啟用中」狀態。

4. **Given** 我希望僅檢視特定標籤的資源，  
   **When** 我於篩選器中輸入標籤條件，  
   **Then** 清單應立即過濾出符合條件的項目。

5. **Given** 我在群組視圖中點擊特定資源，  
   **When** 詳情面板打開，  
   **Then** 系統應顯示資源監控指標、關聯資料源與設定摘要。

---

## 二、功能需求（Functional Requirements）

| 編號 | 說明 |
|------|------|
| **FR-001** | 系統必須（MUST）提供整合的「資源清單」檢視，支援搜尋、篩選、分頁與排序。 |
| **FR-002** | 系統必須（MUST）提供資源群組管理功能，可建立、編輯、刪除群組並支援拖曳資源分配。 |
| **FR-003** | 系統必須（MUST）顯示每個資源的健康狀態（健康、警告、離線）並以顏色區分。 |
| **FR-004** | 系統必須（MUST）支援標籤篩選、狀態篩選及多條件搜尋。 |
| **FR-005** | 系統必須（MUST）提供資料源設定頁，支援新增、編輯、刪除外部資料源。 |
| **FR-006** | 系統必須（MUST）於資料源設定時驗證連線可用性。 |
| **FR-007** | 系統必須（MUST）將資料源與資源對應關聯（多對多關係）。 |
| **FR-008** | 群組與清單檢視應可切換（Tab 或切換按鈕）。 |
| **FR-009** | 詳情面板必須（MUST）顯示資源屬性、關聯群組、資料源與最近健康指標。 |
| **FR-010** | 所有操作（新增、刪除、變更）須寫入稽核日誌。 |
| **FR-011** | 所有文字、標籤名稱應支援 i18n。 |
| **FR-012** | 所有顏色、狀態樣式應遵循 Theme Token。 |
| **FR-013** | [FUTURE] 支援批次標籤管理與標籤繼承。 |
| **FR-014** | [FUTURE] 支援從 Discovery 自動導入新資源並自動建立群組。 |

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Resource** | 單一受監控實體，含名稱、類型、狀態、標籤與關聯資料源。 | 屬於 ResourceGroup，可連結多個 Datasource。 |
| **ResourceGroup** | 管理多個 Resource 的集合，提供邏輯分群。 | 擁有多個 Resource。 |
| **Datasource** | 定義監控資料來源（如 Prometheus、Elasticsearch）。 | 可連結多個 Resource。 |

---

## 四、權限控制（RBAC）

| 權限字串 | 描述 |
|-----------|------|
| `resources:read` | 檢視資源清單與群組。 |
| `resources:edit` | 編輯資源資訊與分組。 |
| `resources:datasource` | 管理資料源設定。 |
| `resources:group` | 新增、刪除、修改群組。 |

---

## 五、觀測性與治理檢查（Observability & Governance）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Logging / Audit | ✅ | 所有操作均應記錄於稽核日誌。 |
| Metrics | ✅ | 記錄資源數量、群組數量與資料源健康狀態。 |
| RBAC | ✅ | 操作按角色權限區分。 |
| Theme / i18n | ✅ | 採用統一樣式與國際化設計。 |
| [FUTURE] Integration | ⚙️ | 後續整合自動化模組以支援自動偵測。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 文件結構符合模板。  
- [x] 無實作語句。  
- [x] 所有功能皆可測試。  
- [x] 與憲法條款 (v1.3.0) 一致。  
- [x] 已整合原 `resources-list`、`resources-group`、`resources-datasource` 三份規格。  

---

## 七、模糊與待確認事項（Clarifications）

| 項目 | 狀態 | 備註 |
|------|------|------|
| 資料源驗證機制 | [NEEDS CLARIFICATION] | 驗證是否採 ping、API health check 或憑證認證方式。 |
| 資源狀態更新頻率 | [NEEDS CLARIFICATION] | 須確認健康狀態刷新頻率與更新事件來源。 |
| 自動化導入流程 | [FUTURE] | 是否與 Discovery 模組直接整合。 |