# 功能規格書（Feature Specification）

**模組名稱 (Module)**: identity-audit
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/identity-access/AuditLogsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Final
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名安全管理員或合規稽核人員，我需要能夠追蹤和審查在平台上發生的所有關鍵操作，以確保系統安全並滿足合規要求。我希望能有一個不可變的審計日誌，記錄下「誰 (Who)」、「在什麼時候 (When)」、「從哪裡 (Where)」、「對什麼 (What)」、「做了什麼 (Action)」，以及「結果如何 (Result)」。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要調查一次最近的角色權限變更。
    **When** 我在「審計日誌」頁面，使用篩選器篩選出動作類型為「角色更新」的日誌。
    **Then** 列表應顯示所有角色更新的操作紀錄，包含操作者、時間和目標角色。

2.  **Given** 我在列表中看到一筆「刪除使用者」的紀錄，並想了解其詳細資訊。
    **When** 我點擊該筆紀錄。
    **Then** 系統必須從右側滑出一個抽屜，其中包含結構化的摘要資訊以及一個用於顯示完整細節的 JSON 檢視器。

3.  **Given** 我需要為每季度的安全審查提供一份所有登入失敗的紀錄。
    **When** 我篩選出動作為「登入失敗」且時間範圍為上一季度的所有日誌，並點擊「匯出」按鈕。
    **Then** 系統應下載一個 CSV 檔案，其中包含所有符合條件的登入失敗紀錄。

### 邊界案例（Edge Cases）
- 即使操作的目標物件（如使用者、角色）已被刪除，審計日誌中仍應保留其名稱或 ID 等識別資訊。
- 當一筆審計日誌的 `details` 欄位為空或格式不正確時，JSON 檢視器應能優雅地處理，而不是顯示錯誤。
- 當篩選後沒有任何日誌時，表格應顯示一個清晰的「目前尚無審計紀錄」的空狀態提示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有審計日誌。
- **FR-002**：每條日誌必須（MUST）至少包含以下核心欄位：時間戳、操作人員、動作、目標物件、結果和來源 IP。
- **FR-003**：系統必須（MUST）允許使用者點擊任一筆日誌，以在抽屜（Drawer）中查看該次操作的完整詳細資訊，包括結構化摘要和完整 JSON。
- **FR-004**：系統必須（MUST）提供進階篩選、欄位自訂和匯出為 CSV 的功能。
- **FR-005**：所有 UI 文字（包括 `action` 和 `result` 的顯示標籤）**必須**使用 i18n Key 進行渲染。
- **FR-006**：所有 UI 元件的顏色（包括狀態標籤）**必須**使用語義化的 Theme Token。
- **FR-007**：後端**必須**維護一份公開的「審計事件綱要 (Audit Event Schema)」文件，定義每種 `action` 的 `details` 結構。
- **FR-008**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。
- **FR-009 (FUTURE)**：為確保審計日誌的不可篡改性，後端**必須**採用如日誌簽名等技術機制。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AuditLog** | 核心資料實體，代表一筆不可變的系統操作紀錄。 | User (Actor), Generic (Target) |
| **AuditLogFilters**| 用於篩選審計日誌的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `audit-logs:read` | 允許使用者查看審計日誌。 |
| `audit-logs:export` | 允許使用者匯出審計日誌。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `AuditLogsPage` 的根元件需由 `<RequirePermission permission="audit-logs:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/iam/audit-logs`) **必須**根據發起請求的使用者權限，來過濾其可見的審計日誌範圍。
- **工具列按鈕**: 「匯出」按鈕需具備 `audit-logs:export` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有被審計的操作均需產生可追蹤的日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與日誌查詢、匯出相關的指標。 |
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