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
    **When** 我在「標籤管理」頁面點擊「新增標籤」，設定其 `key` 為 `env`，`kind` 為 `enum`，並在其允許值中新增 `production`、`staging` 和 `development`。
    **Then** 新的 `env` 標籤應出現在列表中。

2.  **Given** 我想強制要求所有「資源」都必須標示其擁有者。
    **When** 我編輯現有的 `owner` 標籤，將其 `scopes` 設定為包含 `resources`，並勾選「必填」選項。
    **Then** 該標籤的設定應被更新。

3.  **Given** 一個名為 `data-classification` 的列舉標籤需要新增一個 `Confidential` 的選項。
    **When** 我在該標籤的操作中點擊「管理標籤值」，並在彈出的模態框中新增 `Confidential` 這個值。
    **Then** `Confidential` 應成為一個可用於 `data-classification` 標籤的合法值。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個「唯讀」的系統標籤時，操作應被阻止。
- 當使用者嘗試將一個已有數值的標籤從 `text` 類型改為 `enum` 類型時，系統應如何處理？[NEEDS CLARIFICATION]
- 當使用者嘗試刪除一個仍被大量資源使用的標籤定義時，系統應給出警告。[NEEDS CLARIFICATION]

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理標籤的「定義」。
- **FR-002**：每個標籤定義必須（MUST）包含以下核心屬性：鍵 (key)、類型 (kind)、適用範圍 (scopes)、是否必填 (required)、是否唯讀 (readonly)。
- **FR-003**：系統必須（MUST）支援多種標籤類型，至少包括：`enum`、`text`、`boolean`、`reference`。
- **FR-004**：對於 `enum` 類型的標籤，系統必須（MUST）提供一個專門的介面 (`TagValuesManageModal`) 來管理其允許值的列表。
- **FR-005**：系統必須（MUST）允許為標籤定義「寫入權限」，即指定哪些角色有權限修改此標籤的值。
- **FR-006**：系統必須（MUST）提供基於範圍 (scope) 和類型 (kind) 的快速篩選功能 (`QuickFilterBar`)。
- **FR-007**：系統必須（MUST）支援對標籤定義的批次刪除、匯入/匯出 (CSV) 和進階篩選 (`UnifiedSearchModal`)。
- **FR-008 (AS-IS)**：對於 `reference` 類型的標籤，其值由後端動態解析，前端僅負責顯示。
- **FR-009 (AS-IS)**：標籤綱要的變更（如設為必填）僅對後續操作生效，不追溯現有實體。
- **FR-010 (AS-IS)**：篩選功能目前在客戶端進行。
- **FR-011 (FUTURE)**：標籤綱要的強制執行（如必填）應由後端 API 進行驗證。
- **FR-012 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **TagDefinition** | 核心資料實體，定義了一個標籤的完整綱要，包括其鍵、類型、規則和約束。 | TagValue, Role |
| **TagValue** | `enum` 類型標籤的一個允許值。 | TagDefinition |
| **TagManagementFilters** | 用於篩選標籤定義列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

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

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。Toast 訊息等處存在硬編碼的中文 fallback。 |
| Theme Token 使用 | 🟡 | 部分實現。UI 混用預定義樣式與直接的 Tailwind 色票。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'標籤已儲存。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-sky-900/50`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Deletion Logic**: 當前 MVP 未實作刪除前的依賴檢查，未來需確認是否要在前端或後端加入此邏輯以防止意外刪除使用中的標籤。