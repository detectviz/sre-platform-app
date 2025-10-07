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
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對郵件設定的更新操作（`settings:mail:update`）以及執行測試的操作（`settings:mail:test`）產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過平台級 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "無法載入郵件設定。"、"請輸入 SMTP 伺服器位址。" 等。 |
| Theme Token 使用 | ✅ | 程式碼符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION: Password Storage]** 密碼是敏感資訊，需要確認後端是如何安全地儲存它的（例如，使用加密儲存）。