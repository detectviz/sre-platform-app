# 功能規格書（Feature Specification）

**模組名稱 (Module)**: identity-team
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/identity-access/TeamManagementPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Final
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員或部門主管，我需要能夠建立和管理「團隊」，將具有相同職責或屬於同一專案的人員組織在一起。這使我能夠將資源、告警或儀表板的存取權限直接授予整個團隊，而不是逐一為每個成員進行設定，從而簡化權限管理並確保責任歸屬清晰。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我們成立了一個新的「資料庫管理」團隊。
    **When** 我在「團隊管理」頁面點擊「新增團隊」，輸入團隊名稱和描述，並從人員列表中選擇多位 DBA 作為團隊成員。
    **Then** 新的團隊應出現在列表中，其「成員數量」應正確顯示。

2.  **Given** 一個團隊的原負責人（Owner）已離職。
    **When** 我在該團隊的操作中點擊「變更擁有者」，在彈出的模態框中選擇一位新的負責人。
    **Then** 該團隊的擁有者應被成功更新。

3.  **Given** 我想快速了解「平台工程」團隊有哪些成員。
    **When** 我在列表中點擊「檢視團隊」圖示按鈕。
    **Then** 系統必須從右側滑出一個抽屜，其中列出了該團隊的所有成員姓名和聯絡方式。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個仍擁有資源或被其他設定依賴的團隊時，後端必須回傳 `409 Conflict` 錯誤，前端需據此顯示清晰的提示。
- 當一個團隊的擁有者帳號被刪除或停用時，系統應將團隊標示為「無擁有者」狀態並提示管理員重新指派。
- 團隊的成員列表必須支援分頁，以處理大量成員的情況。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理團隊，並支援批次刪除。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已建立的團隊。
- **FR-003**：系統必須（MUST）允許使用者在建立或編輯團隊時，設定其名稱、描述、擁有者、成員以及關聯的角色。
- **FR-004**：系統必須（MUST）在表格中顯示每個團隊的成員數量。
- **FR-005**：系統必須（MUST）提供一個抽屜（Drawer）視圖，用於顯示特定團隊的詳細資訊及其所有成員資源的列表。
- **FR-006**：為避免效能問題，群組成員列表**必須**透過一個專門的、可分頁的 API 端點來獲取。
- **FR-007**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-008**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Team** | 核心資料實體，代表一組使用者的集合。 | User (Owner), User (Members), Role[] |
| **User** | 平台使用者，可作為團隊的擁有者或成員。 | Team |
| **Role** | 系統中的角色，可被指派給團隊。 | Team[] |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `teams:read` | 允許使用者查看團隊列表與詳情。 |
| `teams:create` | 允許使用者建立新團隊。 |
| `teams:update` | 允許使用者修改團隊（名稱、成員、擁有者、角色）。 |
| `teams:delete` | 允許使用者刪除團隊。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `TeamManagementPage` 的根元件需由 `<RequirePermission permission="teams:read">` 包裹。
- **工具列按鈕**: 「新增團隊」按鈕需具備 `teams:create` 權限。
- **表格內行內操作**: 所有操作（如檢視、編輯、刪除、變更擁有者）均需根據對應的權限進行渲染。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與團隊數量、成員變動相關的指標。 |
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