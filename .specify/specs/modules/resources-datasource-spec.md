# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-datasource
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/DatasourceManagementPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要能夠將我們的 SRE 平台連接到各種外部監控系統（如 Prometheus, Grafana, Loki），以便集中收集和分析來自不同來源的遙測資料。我希望有一個統一的介面來管理這些資料來源的連線設定，並能夠驗證它們的連線狀態是否正常。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要將一個新的 Prometheus 實例納入監控。
    **When** 我在「資料來源」管理頁面點擊「新增資料來源」，在彈出的模態框中填寫其名稱、URL 等資訊。
    **Then** 新的資料來源應出現在列表中。

2.  **Given** 我懷疑某個 Grafana 資料來源的 API token 已過期。
    **When** 我找到該資料來源，在編輯模態框中更新其認證資訊，並觸發「連線測試」。
    **Then** 系統應回報測試成功。

3.  **Given** 我只想查看所有目前連線失敗的資料來源。
    **When** 我使用快速篩選器，選擇狀態為 "錯誤 (Error)"。
    **Then** 表格中應只顯示連線狀態為錯誤的資料來源。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個資料來源時，系統必須彈出一個確認對話框。
- 當連線測試正在進行時，對應的操作按鈕應顯示為載入中狀態。
- 當後端 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理資料來源。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已設定的資料來源。
- **FR-003**：新增/編輯資料來源的表單**必須**根據後端 API 提供的 JSON Schema 動態產生，以支援不同類型的資料來源。
- **FR-004**：系統必須（MUST）提供「連線測試」功能，並在表格內和編輯模態框中均可觸發。
- **FR-005**：系統必須（MUST）在表格中清晰地以標籤形式展示每個資料來源的連線狀態。
- **FR-006**：系統必須（MUST）提供進階篩選 (`UnifiedSearchModal`) 和快速篩選 (`QuickFilterBar`) 功能。
- **FR-007**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-008**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Datasource** | 核心資料實體，代表一個到外部監控系統的連線設定。 | - |
| **DatasourceFilters** | 用於篩選資料來源列表的一組條件集合。 | - |
| **DatasourceTestResponse**| 執行連線測試後，API 回傳的結果，包含成功狀態、訊息和延遲。 | Datasource |
| **JsonSchema** | 用於定義不同資料來源類型所需設定欄位的綱要。 | Datasource |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `datasources:read` | 允許使用者查看已設定的資料來源列表。 |
| `datasources:create` | 允許使用者建立新的資料來源。 |
| `datasources:update` | 允許使用者修改現有資料來源的設定。 |
| `datasources:delete` | 允許使用者刪除資料來源。 |
| `datasources:test` | 允許使用者觸發「連線測試」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `DatasourceManagementPage` 的根元件需由 `<RequirePermission permission="datasources:read">` 包裹。
- **工具列按鈕**: 「新增資料來源」按鈕需具備 `datasources:create` 權限。
- **表格內行內操作**: 「編輯」、「刪除」、「測試連線」等按鈕需根據各自的權限 (`update`, `delete`, `test`) 進行渲染。
- **編輯模態框**: 「儲存」按鈕在新增時需要 `datasources:create` 權限，在編輯時需要 `datasources:update` 權限。「測試連線」按鈕需具備 `datasources:test` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 和測試操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與資料來源連線成功率、失敗率、測試延遲相關的指標。 |
| RBAC 權限與審計 | ✅ | 所有操作均由 `<RequirePermission>` 或 `usePermissions` hook 進行權限檢查。 |
| i18n 文案 | ✅ | 所有 UI 字串均由 i18n 內容管理系統提供。 |
| Theme Token 使用 | ✅ | 所有顏色均使用標準化的 Theme Token。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 七、模糊與待確認事項（Clarifications）

(此模組的所有待辦事項均已整合至功能需求中。)