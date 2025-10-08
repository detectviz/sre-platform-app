# 功能規格書（Feature Specification）

**模組名稱 (Module)**: platform-mail
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要設定一個全局的 SMTP 郵件伺服器，以便平台能夠可靠地發送所有系統通知，包括告警郵件、使用者邀請和定時報告。我希望能方便地配置伺服器位址、埠號、加密方式和認證資訊，並能在儲存前進行測試，以確保設定無誤。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在設定平台的郵件功能。
    **When** 我在「SMTP 郵件伺服器」頁面填寫了所有必要的伺服器資訊，然後點擊「發送測試郵件」。
    **Then** 系統應顯示「測試郵件已成功發送」的提示。

2.  **Given** 我確認測試成功後。
    **When** 我點擊「儲存變更」按鈕。
    **Then** 系統應保存我的 SMTP 設定。

3.  **Given** 我輸入了一個無效的寄件人 Email 地址。
    **When** 我嘗試儲存或測試連線。
    **Then** 系統應在該輸入框下方顯示錯誤訊息。

### 邊界案例（Edge Cases）
- 當 SMTP 伺服器需要驗證但使用者未提供密碼時，測試和儲存操作應被阻止。
- 當使用者修改了設定但尚未儲存時，點擊「還原為已儲存設定」按鈕應能撤銷所有未儲存的變更。
- 對於一個從未測試過的設定，連線健康狀態應顯示為「尚未測試」。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個表單介面，允許管理員設定和編輯平台的全局 SMTP 郵件伺服器參數。
- **FR-002**：設定參數必須（MUST）包括：SMTP 伺服器位址、埠號、加密方式、寄件人名稱、寄件人 Email、以及用於驗證的使用者名稱和密碼。
- **FR-003**：系統必須（MUST）提供一個「發送測試郵件」功能。
- **FR-004**：系統必須（MUST）在 UI 上清晰地展示最近一次連線測試的結果。
- **FR-005**：系統必須（MUST）對輸入的欄位進行客戶端基本驗證。
- **FR-006**：系統必須（MUST）為敏感的密碼欄位提供遮蔽和臨時顯示的功能。
- **FR-007 (AS-IS)**：「發送測試郵件」功能會將測試郵件發送到**當前登入使用者**的電子郵件地址。
- **FR-008 (AS-IS)**：密碼欄位使用佔位符 `••••••••••`，只有在使用者輸入新值時，才會在 API 請求中傳遞密碼。
- **FR-009 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **MailSettings** | 核心資料實體，包含了平台用於發送郵件的全局 SMTP 設定。 | - |
| **MailTestResponse** | 執行郵件測試後，API 回傳的結果，包含成功狀態和訊息。 | - |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

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

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🔴 | 未實現。此頁面所有 UI 文字均為硬編碼的中文，未接入 i18n 內容管理系統。 |
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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在此頁面完全使用硬編碼中文，例如 `'無法載入郵件設定，請稍後再試。'`，未來需全面遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-sky-900/30`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Password Handling**: 密碼仍以明文形式在 API 請求中傳輸，未來應評估在後端進行加密儲存。