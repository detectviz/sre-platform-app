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
    **When** 我在「資料來源」管理頁面點擊「新增資料來源」，選擇類型為 "Prometheus"，並填寫其名稱、URL 和認證資訊。
    **Then** 新的資料來源應出現在列表中，其初始狀態應為 "待定 (Pending)"。

2.  **Given** 我懷疑某個 Grafana 資料來源的 API token 已過期。
    **When** 我找到該資料來源，點擊「編輯」，更新其認證資訊，並觸發「連線測試」。
    **Then** 系統應回報測試成功，且該資料來源的狀態應更新為 "正常 (OK)"。

3.  **Given** 我只想查看所有目前連線失敗的資料來源。
    **When** 我使用篩選功能，選擇狀態為 "錯誤 (Error)"。
    **Then** 表格中應只顯示連線狀態為錯誤的資料來源。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個資料來源時，系統必須彈出一個確認對話框以防止誤刪。
- 當連線測試正在進行時，對應的操作按鈕應顯示為載入中狀態，防止重複觸發。
- 當後端 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理資料來源。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已設定的資料來源。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯資料來源，包括其名稱、類型、URL 和認證方式等。
- **FR-004**：系統必須（MUST）能夠觸發對指定資料來源的非同步「連線測試」，並在測試完成後透過 Toast 訊息回報結果（成功/失敗及延遲）。
- **FR-005**：系統必須（MUST）在表格中清晰地以標籤形式展示每個資料來源的連線狀態（例如：正常、待定、錯誤）。
- **FR-006**：系統必須（MUST）提供一個統一的搜尋模態框，允許使用者基於關鍵字、類型、狀態等多個維度篩選資料來源。
- **FR-007**：系統應該（SHOULD）提供一個快速複製資料來源 URL 的功能。
- **FR-008**: 系統**必須**在編輯模態框的頁腳和表格的每一行操作中，都提供「連線測試」按鈕。
- **FR-009**: 後端 API **必須**提供一個端點或在 `options` hook 中返回所有支援的資料來源類型及其所需設定欄位的綱要（Schema），前端應根據此綱要動態產生表單。
- **FR-010**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Datasource** | 核心資料實體，代表一個到外部監控系統的連線設定。 | - |
| **DatasourceFilters** | 用於篩選資料來源列表的一組條件集合。 | - |
| **DatasourceTestResponse**| 執行連線測試後，API 回傳的結果，包含成功狀態、訊息和延遲。 | Datasource |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

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
- **工具列按鈕**:
  - 「新增資料來源」按鈕需具備 `datasources:create` 權限。
- **表格內行內操作**:
  - 「編輯」按鈕需具備 `datasources:update` 權限。
  - 「刪除」按鈕需具備 `datasources:delete` 權限。
  - 「測試連線」按鈕需具備 `datasources:test` 權限。
- **編輯模態框**:
  - 「儲存」按鈕在新增時需要 `datasources:create` 權限，在編輯時需要 `datasources:update` 權限。
  - 「測試連線」按鈕需具備 `datasources:test` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對資料來源的 CUD 操作（建立、更新、刪除）及連線測試產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增資料來源"、"無法取得資料來源列表。"、"您確定要刪除...嗎？" 等。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 元件及中央化的 `DATASOURCE_STATUS_META` 來管理狀態顯示，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

(此區塊所有相關項目已被澄清)