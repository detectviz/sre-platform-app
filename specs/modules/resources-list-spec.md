# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-list
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/ResourceListPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或系統維運人員，我需要一個統一的資產清單來查看、管理和監控我們所有的基礎設施和應用資源。我希望能快速地從列表中了解每個資源的當前狀態、關鍵效能指標（如 CPU/記憶體使用率）和近期事件數量。我還需要能夠對資源進行新增、修改、刪除等生命週期管理，並能深入鑽取查看單一資源的完整詳情。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看「資源列表」頁面。
    **When** 我看到一個資源的 CPU 使用率顯示為紅色，表示過高。
    **Then** 我應該能夠點擊該資源列，從右側滑出的抽屜中查看其詳細的效能指標圖表和日誌，以進行問題診斷。

2.  **Given** 我發現一個資源的「事件計數」顯示為一個高數值。
    **When** 我點擊該事件計數徽章。
    **Then** 系統必須滑出一個專門的抽屜，顯示該資源在最近 24 小時內發生的具體事件列表（包含嚴重性、標題和時間）。

3.  **Given** 我需要下線一批舊的伺服器。
    **When** 我使用篩選功能找到這些伺服器，將它們全部選中，然後點擊批次「刪除」按鈕。
    **Then** 所有被選中的資源都應被刪除，並在操作成功後收到提示。

### 邊界案例（Edge Cases）
- 當一個資源沒有任何效能指標資料時，其使用率欄位應顯示為 "--" 或 "N/A"，而不是 0% 或錯誤。
- 當一個資源在近期沒有任何事件時，其「事件計數」徽章應為禁用狀態且不可點擊。
- 當使用者嘗試刪除一個資源時，系統必須彈出一個確認對話框以防止誤刪。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理所有獨立資源。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有資源。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯資源的屬性（如名稱、類型、擁有者等）。
- **FR-004**：系統必須（MUST）在表格中以視覺化方式展示關鍵效能指標，例如 CPU 和記憶體的使用率條。
- **FR-005**：系統必須（MUST）顯示每個資源在特定時間範圍內（如 24 小時）的事件計數，並提供鑽取查看事件詳情的功能。
- **FR-006**：系統必須（MUST）在使用者點擊資源時，在一個寬抽屜（Drawer）中顯示該資源的完整詳細頁面 (`ResourceDetailPage`)。
- **FR-007**：系統必須（MUST）支援對多個選中資源的批次操作，包括：AI 分析、刪除、匯入/匯出。
- **FR-008**：系統必須（MUST）提供一個統一的搜尋模態框，允許使用者基於多個維度（如：類型、狀態、提供商、地區等）篩選資源。
- **FR-009**：系統必須（MUST）允許使用者自訂表格顯示的欄位，並保存其設定。
- **FR-010**：系統應該（SHOULD）根據效能指標的數值（如 CPU 使用率）和預設的閾值（`utilization_bands`）來改變指標條的顏色，以達到預警效果。
- **FR-011**: **[VIOLATION FIXED]** 獲取單一資源的近期事件列表**必須**透過一個真實的後端 API 端點（如 `GET /api/v1/resources/{id}/events`）來實現。前端**嚴禁**使用任何模擬資料產生函式。
- **FR-012**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-013**: 對資源的「AI 分析」功能觸發後，後端 API (`/ai/resources/analyze`) **必須**回傳一份結構化的分析報告。報告中應包含但不限於以下維度：
    - `cost_optimization`: (array) 成本優化建議。
    - `security_vulnerabilities`: (array) 已發現的安全漏洞。
    - `performance_bottlenecks`: (array) 潛在的效能瓶頸分析。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Resource** | 核心資料實體，代表一個可監控的獨立資產。 | ResourceGroup, Team (Owner) |
| **ResourceEvent** | 與特定資源關聯的事件，如告警觸發、設定變更等。 | Resource |
| **ResourceMetrics** | 資源的量化效能指標集合，如 CPU/記憶體使用率。 | Resource |
| **ResourceFilters** | 用於篩選資源列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resources:read` | 允許使用者查看資源列表及資源詳情頁面。 |
| `resources:create` | 允許使用者建立新的資源。 |
| `resources:update` | 允許使用者修改現有的資源。 |
| `resources:delete` | 允許使用者刪除資源。 |
| `resources:analyze` | 允許使用者觸發「AI 分析」功能。 |
| `resources:config` | 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `ResourceListPage` 的根元件需由 `<RequirePermission permission="resources:read">` 包裹。
- **工具列按鈕**:
  - 「新增資源」按鈕需具備 `resources:create` 權限。
  - 「匯入」、「匯出」、「欄位設定」按鈕均需具備 `resources:config` 權限。
- **批次操作按鈕**:
  - 「AI 分析」按鈕需具備 `resources:analyze` 權限。
  - 「刪除」按鈕需具備 `resources:delete` 權限。
- **表格內行內操作**:
  - 「查看詳情」按鈕需具備 `resources:read` 權限。
  - 「編輯資源」按鈕需具備 `resources:update` 權限。
  - 「刪除資源」按鈕需具備 `resources:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對資源的 CUD 操作（建立、更新、刪除）產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增資源"、"無法獲取資源列表。"、"您確定要刪除資源...嗎？" 等。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `useDesignSystemClasses` hook 和狀態描述符 (`statusDescriptors`) 來管理樣式，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

（無）