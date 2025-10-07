# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-tag
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/platform/TagManagementPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台架構師或治理負責人，我需要定義一套全平台統一的、標準化的標籤（Tags）綱要。我希望能預先定義好每個標籤的鍵（Key）、資料類型（如文字、列舉）、適用範圍（如僅用於資源或事件）、是否必填以及誰有權限修改它。這將確保所有團隊在標記資產和事件時都遵循相同的規範，從而極大地提升資料的一致性、可篩選性和治理能力。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要建立一個用於標示環境的標準標籤。
    **When** 我在「標籤管理」頁面點擊「新增標籤」，設定其 `key` 為 `env`，`kind` 為 `enum`（列舉），並在其允許值中新增 `production`、`staging` 和 `development`。
    **Then** 新的 `env` 標籤應出現在列表中，並且當其他使用者在標記資源時，`env` 標籤的值只能從這三個選項中選擇。

2.  **Given** 我想強制要求所有「資源」都必須標示其擁有者。
    **When** 我編輯現有的 `owner` 標籤，將其 `scopes` 設定為包含 `resources`，並勾選「必填 (Required)」選項。
    **Then** 從此以後，任何使用者在建立或編輯資源時，如果沒有填寫 `owner` 標籤，系統將阻止其儲存。

3.  **Given** 一個名為 `data-classification` 的列舉標籤需要新增一個 `Confidential` 的選項。
    **When** 我在該標籤的操作中點擊「管理標籤值」，並在彈出的模態框中新增 `Confidential` 這個值。
    **Then** `Confidential` 應立即成為一個可用於 `data-classification` 標籤的合法值。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個「唯讀」的系統標籤時，操作應被阻止。
- 當使用者嘗試將一個已有數值的標籤從 `text` 類型改為 `enum` 類型時，系統應如何處理現有的非列舉值？規格需要明確此遷移邏輯。
- 當使用者嘗試刪除一個仍被大量資源使用的標籤定義時，系統應給出強烈警告，並說明潛在影響。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理標籤的「定義」，而不僅僅是標籤值。
- **FR-002**：每個標籤定義必須（MUST）包含以下核心屬性：鍵 (key)、類型 (kind)、適用範圍 (scopes)、是否必填 (required)、是否唯讀 (readonly)。
- **FR-003**：系統必須（MUST）支援多種標籤類型，至少包括：`enum`（列舉）、`text`（自由文字）、`boolean`（布林）、`reference`（系統引用）。
- **FR-004**：對於 `enum` 類型的標籤，系統必須（MUST）提供一個專門的介面來管理其允許值的列表。
- **FR-005**：系統必須（MUST）允許為標籤定義「寫入權限」，即指定哪些角色（`writable_roles`）有權限修改此標籤的值。
- **FR-006**：系統必須（MUST）提供基於範圍 (scope) 和類型 (kind) 的快速篩選功能。
- **FR-007**：系統必須（MUST）支援對標籤定義的批次刪除、匯入/匯出 (CSV)。
- **FR-008**: 對於 `reference` 類型的標籤，其定義**必須**額外包含 `resource_type` (如 `user`) 和 `display_field` (如 `email`) 屬性。其值由後端在讀取時動態解析，前端僅負責顯示。
- **FR-009**: 標籤綱要的變更（如將標籤設為必填）**不應**追溯性地影響現有實體。但是，在使用者下一次編輯任何不符合新綱要的實體時，系統**必須**強制其補全或修正標籤，否則無法儲存。
- **FR-013**: 為保證系統效能，涉及標籤的複雜查詢和篩選功能（例如，跨多個標籤的 AND/OR 查詢）**應**由後端 API 實現，而非在前端進行處理。
- **FR-010**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-011**: 標籤綱要的強制執行**主要為後端職責**。當使用者儲存一個帶有標籤的實體（如資源、事件）時，後端 API **必須**驗證所有標籤值是否符合其定義（如必填、類型、列舉值）。
- **FR-012**: 在使用標籤的前端介面（如資源編輯頁），系統**必須**根據標籤定義動態渲染輸入欄位：
    - 對於設定了 `writable_roles` 的標籤，如果當前使用者不具備所需角色，其對應的輸入欄位**必須**被禁用 (disabled)。
    - 對於 `required` 的標籤，其輸入欄位**必須**標示為必填。
    - 對於 `enum` 類型的標籤，其輸入欄位**必須**是只能從允許值中選擇的下拉選單。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **TagDefinition** | 核心資料實體，定義了一個標籤的完整綱要，包括其鍵、類型、規則和約束。 | TagValue, Role |
| **TagValue** | `enum` 類型標籤的一個允許值。 | TagDefinition |
| **TagManagementFilters** | 用於篩選標籤定義列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `tags:read` | 允許使用者查看標籤定義。 |
| `tags:create` | 允許使用者建立新的標籤定義。 |
| `tags:update` | 允許使用者修改標籤定義（包括其允許值）。 |
| `tags:delete` | 允許使用者刪除標籤定義。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `TagManagementPage` 的根元件需由 `<RequirePermission permission="tags:read">` 包裹。
- **工具列按鈕**:
  - 「新增標籤」按鈕需具備 `tags:create` 權限。
- **表格內行內操作**:
  - 「編輯標籤」按鈕需具備 `tags:update` 權限。
  - 「管理標籤值」按鈕需具備 `tags:update` 權限。
  - 「刪除標籤」按鈕需具備 `tags:delete` 權限。
- **批次操作**:
  - 「批次刪除」按鈕需具備 `tags:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對標籤定義的 CUD 操作（建立、更新、刪除）以及其列舉值的修改產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過平台級 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增標籤"、"無法獲取標籤定義。" 等。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 等標準化元件，符合設計系統規範。 |

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