# 功能規格書（Feature Specification）

**模組名稱 (Module)**: profile-info
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/profile/PersonalInfoPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台使用者，我希望能有一個地方可以查看我自己的個人資料，確認我的帳號狀態、所屬的角色和團隊，以及我的登入活動記錄。如果我的帳號是由公司的統一身份驗證系統（如 Google Workspace）管理的，我希望能被引導到正確的地方去修改我的個人資訊。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我登入平台後，導航到我的個人資料頁面。
    **When** 頁面載入完成。
    **Then** 我應該能看到我的姓名、Email、目前狀態（如「啟用」）、角色和團隊。

2.  **Given** 我的帳號是透過外部身份提供商（IdP）進行管理的。
    **When** 我查看我的個人資料頁面。
    **Then** 頁面上應顯示一條提示訊息，告知我此帳號由外部系統管理，並提供一個連結讓我能跳轉到該系統的管理介面。

3.  **Given** 我想確認我的帳號建立時間。
    **When** 我查看我的個人資料頁面。
    **Then** 「建立時間」欄位應顯示一個易於理解的相對時間（例如，「2 年前」）和一個精確的日期時間。

### 邊界案例（Edge Cases）
- 如果使用者是首次登入，其「最近登入」欄位應顯示為「尚未登入」或類似的提示。
- 如果後端 API 無法獲取使用者資料，頁面應顯示一個清晰的錯誤訊息。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：頁面必須（MUST）從 `/me` API 端點獲取當前登入使用者的個人資料。
- **FR-002**：頁面必須（MUST）以**唯讀**形式展示使用者的核心資訊，包括：姓名、Email、ID、狀態、角色和團隊。
- **FR-003**：頁面必須（MUST）展示關鍵的時間戳，包括帳號的建立時間、最近更新時間和最近登入時間，並以使用者友好的相對時間格式呈現。
- **FR-004**：如果平台設定了外部身份提供商（IdP），頁面必須（MUST）顯示一條提示訊息，並提供一個指向該 IdP 管理主控台的連結。
- **FR-005**: 為保持此頁面職責單一（僅供檢視），對於未使用外部 IdP 的本地使用者，系統**應**提供指引或連結，將其導向一個獨立的流程來修改個人資訊（例如，聯繫管理員或跳轉至一個專門的編輯頁面）。本頁面本身**不得**包含編輯功能。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **User** | 核心資料實體，代表當前登入的使用者。 | Role, Team |
| **AuthSettings** | 平台的身份驗證設定，用於判斷是否啟用外部 IdP。 | - |

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/profile/PersonalInfoPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
| 指標與告警 (Metrics & Alerts) | ❌ | 頁面缺少 OpenTelemetry 或自訂指標，所有 API 呼叫僅透過共享客戶端發送。 |
| RBAC 權限與審計 | ❌ | UI 未使用 `usePermissions` 或 `<RequirePermission>`，所有操作目前對所有登入者可見，需依《common/rbac-observability-audit-governance.md》導入守衛。 |
| i18n 文案 | ⚠️ | 主要字串透過內容 context 取得，但錯誤與提示訊息仍有中文 fallback，需要補強內容來源。 |
| Theme Token 使用 | ⚠️ | 介面混用 `app-*` 樣式與 Tailwind 色票（如 `bg-slate-*`），尚未完全以設計 token 命名。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 六、模糊與待確認事項（Clarifications）

