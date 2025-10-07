# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-mail
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/platform/MailSettingsPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要設定一個全局的 SMTP 郵件伺服器，以便平台能夠可靠地發送所有系統通知，包括告警郵件、使用者邀請和定時報告。我希望能方便地配置伺服器位址、埠號、加密方式和認證資訊，並能在儲存前進行測試，以確保設定無誤。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在設定平台的郵件功能。
    **When** 我在「SMTP 郵件伺服器」頁面填寫了我們公司的 SMTP 主機、埠號、一個專用的發信帳號和密碼，然後點擊「發送測試郵件」。
    **Then** 系統應顯示「測試郵件已成功發送」的提示，並且我的信箱應能收到一封來自該寄件人地址的測試郵件。

2.  **Given** 我確認測試成功後。
    **When** 我點擊「儲存變更」按鈕。
    **Then** 系統應保存我的 SMTP 設定，並在後續的通知流程中使用這些設定。

3.  **Given** 我輸入了一個無效的寄件人 Email 地址。
    **When** 我嘗試儲存或測試連線。
    **Then** 系統應在該輸入框下方顯示一條錯誤訊息，提示我修正 Email 格式，並阻止我繼續操作。

### 邊界案例（Edge Cases）
- 當 SMTP 伺服器需要驗證但使用者未提供密碼時，測試和儲存操作應被阻止。
- 當使用者修改了設定但尚未儲存時，點擊「還原為已儲存設定」按鈕應能撤銷所有未儲存的變更。
- 對於一個從未測試過的設定，連線健康狀態應顯示為「尚未測試」。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個表單介面，允許管理員設定和編輯平台的全局 SMTP 郵件伺服器參數。
- **FR-002**：設定參數必須（MUST）包括：SMTP 伺服器位址、埠號、加密方式（無、TLS、SSL）、寄件人名稱、寄件人 Email、以及用於驗證的使用者名稱和密碼。
- **FR-003**：系統必須（MUST）提供一個「發送測試郵件」功能，用於即時驗證當前輸入的設定是否能成功連接 SMTP 伺服器並發送郵件。
- **FR-004**：系統必須（MUST）在 UI 上清晰地展示最近一次連線測試的結果（成功/失敗）、訊息和測試時間。
- **FR-005**：系統必須（MUST）對輸入的伺服器位址、埠號、Email 格式等進行客戶端基本驗證。
- **FR-006**：系統必須（MUST）為敏感的密碼欄位提供遮蔽（masking）和臨時顯示（unmasking）的功能。
- **FR-007**: 「發送測試郵件」功能**必須**將測試郵件發送到**當前登入使用者**的電子郵件地址，以確保安全並防止濫用。
- **FR-008**: 密碼欄位的更新邏輯**必須**遵循以下規則：
    - 如果前端傳送的密碼欄位為空或值為預設佔位符（如 `••••••••••`），後端**必須**將其視為「不變更密碼」。
    - 只有當使用者在欄位中輸入了新值時，才應觸發密碼更新流程。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **MailSettings** | 核心資料實體，包含了平台用於發送郵件的全局 SMTP 設定。 | - |
| **MailTestResponse** | 執行郵件測試後，API 回傳的結果，包含成功狀態和訊息。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `settings:mail:read` | 允許使用者查看郵件設定。 |
| `settings:mail:update` | 允許使用者修改並儲存郵件設定。 |
| `settings:mail:test` | 允許使用者發送測試郵件。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `MailSettingsPage` 的根元件需由 `<RequirePermission permission="settings:mail:read">` 包裹。
- **表單欄位**: 整個表單的編輯功能需具備 `settings:mail:update` 權限，否則應為唯讀狀態。
- **操作按鈕**:
  - 「儲存變更」按鈕需具備 `settings:mail:update` 權限。
  - 「發送測試郵件」按鈕需具備 `settings:mail:test` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/platform/MailSettingsPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

- 密碼需由後端以 KMS 加密儲存並僅於新增/更新時傳入，前端僅顯示遮蔽狀態與「已設定」提示，不再回傳明文。
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。