# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-group
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/ResourceGroupPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名團隊負責人或平台管理員，我需要能夠將一組相關的資源（例如屬於同一個微服務的所有伺服器和資料庫）組織成一個「資源群組」。這使我能夠從一個更高維度的視角來監控這個服務的整體健康狀況，快速查看其成員狀態摘要，並將其作為一個單一實體進行管理。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在「資源群組」管理頁面。
    **When** 我點擊「新增群組」按鈕，填寫群組名稱、描述，並從資源列表中選擇多個成員。
    **Then** 新的群組應出現在列表中，並且「成員數量」和「狀態摘要」欄位應正確反映其成員情況。

2.  **Given** 我想快速了解一個名為 "payment-service" 的資源群組的詳細資訊。
    **When** 我在該群組的資料列上點擊「檢視」按鈕。
    **Then** 系統必須從右側滑出一個抽屜（Drawer），顯示該群組的描述、負責團隊、以及其所有成員資源的列表和各自的狀態。

3.  **Given** 一個資源群組的負責團隊發生了變更。
    **When** 我點擊該群組的「編輯」按鈕，並更新「擁有團隊」欄位。
    **Then** 該群組的資訊應被成功更新。

### 邊界案例（Edge Cases）
- 當檢視一個不包含任何成員的資源群組時，抽屜中應顯示「尚未加入任何資源」的提示。
- 當使用者嘗試刪除一個資源群組時，系統必須彈出一個確認對話框以防止誤刪。
- 當載入群組成員列表失敗時，抽屜中應顯示明確的錯誤訊息。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理資源群組。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有資源群組。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯資源群組，包括其名稱、描述、負責團隊和成員列表。
- **FR-004**：系統必須（MUST）在表格中為每個群組顯示其成員資源的狀態摘要（例如：健康、警告、嚴重 的數量）。
- **FR-005**：系統必須（MUST）提供一個抽屜（Drawer）視圖，用於顯示特定資源群組的詳細資訊及其所有成員資源的列表。
- **FR-006**：系統必須（MUST）提供一個統一的搜尋模態框，允許使用者基於關鍵字或標籤等條件篩選資源群組。
- **FR-007**：系統必須（MUST）允許使用者自訂表格中顯示的欄位，並保存其個人化設定。
- **FR-008**: 資源群組的 `status_summary` 欄位**必須**由後端 API 在回傳 `ResourceGroup` 物件時提供，前端不應自行計算。後端應明確其更新頻率。
- **FR-009**: 為了避免效能問題，前端**必須**透過一個專門的、可分頁的 API 端點（例如 `GET /api/v1/resource-groups/{id}/members`）來獲取群組成員，而非在客戶端進行過濾。
- **FR-010**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **ResourceGroup** | 核心資料實體，代表一組資源的邏輯集合。 | Resource (Members), Team (Owner) |
| **Resource** | 獨立的基礎設施或應用實體，可作為群組的成員。 | ResourceGroup |
| **Team** | 系統中的團隊，可作為資源群組的擁有者。 | ResourceGroup |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `resource-groups:read` | 允許使用者查看資源群組列表及其詳細資訊。 |
| `resource-groups:create` | 允許使用者建立新的資源群組。 |
| `resource-groups:update` | 允許使用者修改現有的資源群組（包括編輯名稱、描述、成員）。 |
| `resource-groups:delete` | 允許使用者刪除資源群組。 |
| `resource-groups:config` | 允許使用者管理頁面設定，如「欄位設定」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `ResourceGroupPage` 的根元件需由 `<RequirePermission permission="resource-groups:read">` 包裹。
- **工具列按鈕**:
  - 「新增群組」按鈕需具備 `resource-groups:create` 權限。
  - 「欄位設定」按鈕需具備 `resource-groups:config` 權限。
- **表格內行內操作**:
  - 「檢視群組」按鈕需具備 `resource-groups:read` 權限。
  - 「編輯群組」按鈕需具備 `resource-groups:update` 權限。
  - 「刪除群組」按鈕需具備 `resource-groups:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對資源群組的 CUD 操作（建立、更新、刪除、成員變更）產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增群組"、"無法獲取資源群組。"、"您確定要刪除資源群組...嗎？" 等。 |
| Theme Token 使用 | ✅ | 程式碼主要使用 Tailwind CSS class，並透過 `statusColorLookup` 變數來動態設定狀態顏色，符合設計系統規範。 |

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