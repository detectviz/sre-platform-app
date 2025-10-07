# 功能規格書（Feature Specification）

**模組名稱 (Module)**: identity-team
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/identity-access/TeamManagementPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
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
    **When** 我在該團隊的操作中點擊「變更擁有者」，並從人員列表中選擇一位新的負責人。
    **Then** 該團隊的擁有者應被成功更新。

3.  **Given** 我想快速了解「平台工程」團隊有哪些成員。
    **When** 我在列表中點擊「平台工程」團隊。
    **Then** 系統必須從右側滑出一個抽屜，其中列出了該團隊的所有成員姓名和聯絡方式。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個仍擁有資源（如儀表板、告警規則）的團隊時，系統應給出警告，並建議先將資源所有權轉移。
- 當一個團隊的擁有者帳號被刪除或停用時，系統應如何處理？是否應將團隊標示為「無擁有者」狀態並提示管理員重新指派？
- 團隊的成員列表應能處理大量成員的情況，而不會導致 UI 卡頓。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理團隊。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已建立的團隊。
- **FR-003**：系統必須（MUST）允許使用者在建立或編輯團隊時，設定其名稱、描述，並關聯一組使用者作為其成員。
- **FR-004**：系統必須（MUST）允許使用者為每個團隊指派一位「擁有者 (Owner)」。
- **FR-005**：系統必須（MUST）在表格中顯示每個團隊的成員數量。
- **FR-006**：系統必須（MUST）提供一個抽屜（Drawer）視圖，用於顯示特定團隊的詳細資訊，包括其成員列表。
- **FR-007**：系統必須（MUST）支援對團隊的批次刪除。
- **FR-008**: 編輯團隊的模態框中**必須**提供一個多選搜尋框（`SearchableSelect`），讓管理者可以方便地從現有使用者列表中新增或移除團隊成員。
- **FR-009**: 團隊與角色之間的關係比照 Grafana 模型：一個角色可以被指派給一個團隊，團隊中的所有成員將繼承該角色的權限。使用者的最終權限是其個人角色權限與其所屬所有團隊角色權限的聯集。
- **FR-010**: 為避免前端效能瓶頸，後端 API 在回傳團隊列表時，**必須**直接包含擁有者的簡化資訊（如 `owner_name`）。在請求單一團隊詳情時，也應直接回傳其成員的簡化資訊列表。
- **FR-011**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **Team** | 核心資料實體，代表一組使用者的集合。 | User (Owner), User (Members), Role[] |
| **User** | 平台使用者，可作為團隊的擁有者或成員。 | Team |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `teams:read` | 允許使用者查看團隊列表與詳情。 |
| `teams:create` | 允許使用者建立新團隊。 |
| `teams:update` | 允許使用者修改團隊（名稱、成員、擁有者、角色）。 |
| `teams:delete` | 允許使用者刪除團隊。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `TeamManagementPage` 的根元件需由 `<RequirePermission permission="teams:read">` 包裹。
- **工具列按鈕**:
  - 「新增團隊」按鈕需具備 `teams:create` 權限。
- **表格內行內操作**:
  - 「檢視團隊」按鈕需具備 `teams:read` 權限。
  - 「變更擁有者」按鈕需具備 `teams:update` 權限。
  - 「編輯團隊」按鈕需具備 `teams:update` 權限。
  - 「刪除團隊」按鈕需具備 `teams:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/identity-access/TeamManagementPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

(此區塊所有相關項目已被澄清)
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。