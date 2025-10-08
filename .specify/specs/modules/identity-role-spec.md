# 功能規格書（Feature Specification）

**模組名稱 (Module)**: identity-role
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/identity-access/RoleManagementPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Final
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要能夠定義和管理一組「角色」，每個角色都對應一組特定的平台操作權限。這樣，我就可以透過將使用者指派到不同角色，來精細化地控制他們能做什麼、不能做什麼，從而實現最小權限原則並確保系統安全。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要為新來的實習生建立一個只能查看資料的「唯讀」角色。
    **When** 我在「角色管理」頁面點擊「新增角色」，在彈出的模態框中輸入角色名稱和權限。
    **Then** 新的「唯讀」角色應出現在列表中。

2.  **Given** 我發現「開發者」這個角色的權限過高，需要移除他們刪除資源的權限。
    **When** 我在列表中找到「開發者」角色，點擊「編輯」，並在模態框中更新其權限。
    **Then** 該角色的權限應被更新。

3.  **Given** 我想了解有多少人是「管理員」。
    **When** 我查看角色列表。
    **Then** 我應該能在「管理員」角色旁邊的「使用者數量」欄位中看到對應的人數。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個仍有使用者在使用的角色時，後端**必須**回傳 `409 Conflict` 錯誤，前端需據此顯示清晰的提示。
- 系統的核心角色（如「超級管理員」）**必須**被保護，不允許被編輯或刪除。前端應根據後端提供的 `readonly` 旗標禁用相關操作。
- 當一個角色被停用時，所有擁有該角色的使用者應立即失去該角色所賦予的權限。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理角色。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已定義的角色。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯角色，其中包含一個分組的權限選擇器。
- **FR-004**：可用的權限點列表**必須**由後端 API (`/options/permissions`) 動態提供。
- **FR-005**：系統必須（MUST）允許使用者啟用或禁用一個角色，並支援批次刪除。
- **FR-006**：系統必須（MUST）在表格中顯示每個角色目前被多少使用者所擁有。
- **FR-007**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-008**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Role** | 核心資料實體，代表一組權限的集合。 | Permission, User |
| **Permission** | 一個獨立的操作權限點，例如 `resource:delete`。 | Role |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `roles:read` | 允許使用者查看角色列表。 |
| `roles:create` | 允許使用者建立新角色。 |
| `roles:update` | 允許使用者修改角色（名稱、權限、啟用狀態）。 |
| `roles:delete` | 允許使用者刪除角色。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `RoleManagementPage` 的根元件需由 `<RequirePermission permission="roles:read">` 包裹。
- **工具列按鈕**: 「新增角色」按鈕需具備 `roles:create` 權限。
- **表格內行內操作**: 所有操作（如編輯、刪除、啟用/停用）均需根據對應的權限進行渲染。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與角色數量、權限變更相關的指標。 |
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