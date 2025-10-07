# 功能規格書（Feature Specification）

**模組名稱 (Module)**: identity-audit
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/identity-access/AuditLogsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名安全管理員或合規稽核人員，我需要能夠追蹤和審查在平台上發生的所有關鍵操作，以確保系統安全並滿足合規要求。我希望能有一個不可變的審計日誌，記錄下「誰 (Who)」、「在什麼時候 (When)」、「從哪裡 (Where)」、「對什麼 (What)」、「做了什麼 (Action)」，以及「結果如何 (Result)」。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要調查一次最近的角色權限變更。
    **When** 我在「審計日誌」頁面，使用篩選器篩選出動作類型為「角色更新 (ROLE_UPDATED)」的日誌。
    **Then** 列表應顯示所有角色更新的操作紀錄，包含操作者、時間和目標角色。

2.  **Given** 我在列表中看到一筆「刪除使用者」的紀錄，並想了解其詳細資訊。
    **When** 我點擊該筆紀錄。
    **Then** 系統必須從右側滑出一個抽屜，其中以 JSON 格式顯示該次操作的完整細節，例如被刪除使用者的 ID 和相關元數據。

3.  **Given** 我需要為每季度的安全審查提供一份所有登入失敗的紀錄。
    **When** 我篩選出動作為「登入失敗 (LOGIN_FAILURE)」且時間範圍為上一季度的所有日誌，並點擊「匯出」按鈕。
    **Then** 系統應下載一個 CSV 檔案，其中包含所有符合條件的登入失敗紀錄。

### 邊界案例（Edge Cases）
- 即使操作的目標物件（如使用者、角色）已被刪除，審計日誌中仍應保留其名稱或 ID 等識別資訊。
- 當一筆審計日誌的 `details` 欄位為空或格式不正確時，JSON 檢視器應能優雅地處理，而不是顯示錯誤。
- 對於系統自動執行的操作（例如，由排程觸發的任務），其「操作人員」欄位應清晰地標示為「系統 (System)」或類似的識別符。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有審計日誌。
- **FR-002**：每條日誌必須（MUST）至少包含以下核心欄位：時間戳、操作人員、動作、目標物件、結果和來源 IP。
- **FR-003**：系統必須（MUST）允許使用者點擊任一筆日誌，以在抽屜（Drawer）中查看該次操作的完整詳細資訊（`details`）。
- **FR-004**：系統必須（MUST）提供一個統一的搜尋模態框，允許使用者基於多個維度（如：時間範圍、使用者、動作類型、目標 ID）進行篩選。
- **FR-005**：系統必須（MUST）支援將篩選後的審計日誌匯出為 CSV 檔案。
- **FR-006**：系統必須（MUST）支援自訂表格顯示的欄位。
- **FR-007**: 根據平台資料治理策略，審計日誌**必須**在線上熱儲存中保留 365 天，之後歸檔至離線冷儲存至少 7 年。
- **FR-008**: 為了確保審計日誌的可用性與一致性，後端**必須**維護一份公開的「審計事件綱要 (Audit Event Schema)」文件，該文件需詳細定義每種 `action` 所對應的 `details` 物件的具體結構。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面，並在後端過濾可見的日誌。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-010**: 為確保審計日誌的不可篡改性，後端**必須**採用如日誌簽名 (Log Signing) 或寫入一次、讀取多次 (WORM) 儲存等技術機制。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AuditLog** | 核心資料實體，代表一筆不可變的系統操作紀錄。 | User (Actor), Generic (Target) |
| **AuditLogFilters**| 用於篩選審計日誌的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `audit-logs:read` | 允許使用者查看審計日誌。 |
| `audit-logs:export` | 允許使用者匯出審計日誌。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `AuditLogsPage` 的根元件需由 `<RequirePermission permission="audit-logs:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/iam/audit-logs`) **必須**根據發起請求的使用者權限，來過濾其可見的審計日誌範圍。例如，一個團隊主管可能只能看到其團隊成員的操作日誌。
- **工具列按鈕**:
  - 「匯出」按鈕需具備 `audit-logs:export` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/identity-access/AuditLogsPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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