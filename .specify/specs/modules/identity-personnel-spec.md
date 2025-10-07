# 功能規格書（Feature Specification）

**模組名稱 (Module)**: identity-personnel
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/identity-access/PersonnelManagementPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員或團隊主管，我需要能夠管理我所在組織的人員帳號。我希望能邀請新成員加入平台、為他們分配角色和團隊、更新他們的資訊，並在他們離職或不再需要存取權限時停用或刪除他們的帳號。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要邀請一位新的 SRE 加入我的團隊。
    **When** 我在「人員管理」頁面點擊「邀請人員」，輸入新成員的 Email、姓名、角色和團隊，然後送出邀請。
    **Then** 該新成員應出現在人員列表中，其狀態應為「待啟用 (Pending)」，直到他們接受邀請並首次登入。

2.  **Given** 一名員工從「維運團隊」轉到了「開發團隊」。
    **When** 我在列表中找到該名員工，點擊「編輯」，並將其「所屬團隊」欄位更新為「開發團隊」。
    **Then** 該員工的團隊歸屬應被成功更新。

3.  **Given** 一名實習生已結束實習。
    **When** 我在列表中找到該實習生的帳號，點擊「刪除」，並在確認對話框中進行確認。
    **Then** 該實習生的帳號應被從系統中移除。

### 邊界案例（Edge Cases）
- 當邀請一個已經存在的 Email 時，系統應給出明確的錯誤提示。
- 當使用者嘗試刪除自己的帳號時，刪除按鈕應被禁用或隱藏。
- 當使用者嘗試停用系統中最後一個管理員帳號時，系統應阻止此操作並給出警告。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理所有人員帳號。
- **FR-002**：系統必須（MUST）提供一個「邀請人員」的功能，允許管理員透過 Email 邀請新使用者，並預先設定其角色和團隊。
- **FR-003**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有人員。
- **FR-004**：系統必須（MUST）在表格中以標籤形式清晰地展示每位人員的狀態（如：啟用、停用、待啟用）。
- **FR-005**：系統必須（MUST）允許使用者點擊任一人員以在抽屜（Drawer）中查看其詳細資訊。
- **FR-006**：系統必須（MUST）支援對人員的批次操作，包括批次停用和批次刪除。
- **FR-007**：系統必須（MUST）支援從 CSV 檔案匯入人員列表以及將現有列表匯出為 CSV 檔案。
- **FR-008**：系統必須（MUST）支援自訂表格顯示的欄位。
- **FR-009**: 使用者狀態的變更流程定義如下：
  - **邀請後**: 狀態為 `invited`。
  - **首次登入**: 狀態由後端自動變更為 `active`。
  - **停用操作**: 管理員在 UI 上操作後，狀態變為 `inactive`。
- **FR-010**: 邀請新成員時，後端**必須**負責產生一個帶有唯一 token 的註冊連結，並透過郵件（使用 `platform-mail` 設定）發送給被邀請者。該連結應有時效性。
- **FR-011**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **User** | 核心資料實體，代表一個平台使用者及其所有屬性。 | Role, Team |
| **Role** | 使用者的角色，定義了其在平台中的權限集合。 | User |
| **Team** | 使用者所屬的團隊。 | User |
| **PersonnelFilters**| 用於篩選人員列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `users:read` | 允許使用者查看人員列表與詳情。 |
| `users:create` | 允許使用者邀請新成員。 |
| `users:update` | 允許使用者修改使用者資訊（角色、團隊、狀態）。 |
| `users:delete` | 允許使用者刪除使用者。 |
| `users:config` | 允許使用者管理頁面設定，如「匯入/匯出」、「欄位設定」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `PersonnelManagementPage` 的根元件需由 `<RequirePermission permission="users:read">` 包裹。
- **工具列按鈕**:
  - 「邀請人員」按鈕需具備 `users:create` 權限。
  - 「匯入」、「匯出」、「欄位設定」按鈕均需具備 `users:config` 權限。
- **批次操作按鈕**:
  - 「停用」按鈕需具備 `users:update` 權限。
  - 「刪除」按鈕需具備 `users:delete` 權限。
- **表格內行內操作**:
  - 「編輯」按鈕需具備 `users:update` 權限。
  - 「刪除」按鈕需具備 `users:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/identity-access/PersonnelManagementPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
| 指標與告警 (Metrics & Alerts) | ❌ | 頁面缺少 OpenTelemetry 或自訂指標，所有 API 呼叫僅透過共享客戶端發送。 |
| RBAC 權限與審計 | ❌ | UI 未使用 `usePermissions` 或 `<RequirePermission>`，所有操作目前對所有登入者可見，需依《common/rbac-observability-audit-governance.md》導入守衛。 |
| i18n 文案 | ⚠️ | 主要字串透過內容 context 取得，但錯誤與提示訊息仍有中文 fallback，需要補強內容來源。 |
| Theme Token 使用 | ⚠️ | 介面混用 `app-*` 樣式與 Tailwind 色票（如 `bg-slate-*`），尚未完全以設計 token 命名。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。