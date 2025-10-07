# 功能規格書（Feature Specification）

**模組名稱 (Module)**: notification-channel
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/notification-management/NotificationChannelPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名平台管理員，我需要設定和管理平台發送通知的各種管道，例如設定一個 Slack Webhook 來接收告警，或設定一個 SMTP 伺服器來發送Email報告。我希望能方便地新增、編輯這些管道的設定，並能測試它們是否能成功發送訊息，以確保我們的告警和通知能夠可靠地送達。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要新增一個 Slack 通知管道。
    **When** 我在「通知管道」頁面點擊「新增管道」，選擇類型為 "Slack"，並填寫其名稱和 Webhook URL。
    **Then** 新的 Slack 管道應出現在列表中，其「上次測試結果」應為「尚未測試」。

2.  **Given** 我不確定一個新設定的 PagerDuty 管道是否配置正確。
    **When** 我在該管道的操作中點擊「測試管道」按鈕。
    **Then** 系統應向該管道發送一條測試通知，並在短時間後將該管道的「上次測試結果」更新為「測試成功」或「測試失敗」。

3.  **Given** 一個 Email 管道因為 SMTP 伺服器變更而需要更新。
    **When** 我點擊該管道的「編輯」按鈕，並在模態框中更新其 SMTP 主機和認證資訊。
    **Then** 該管道的設定應被成功儲存，以便後續的通知能透過新的伺服器發送。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個正在被某個「通知策略」使用的管道時，系統應彈出警告，提示此操作可能導致通知發送失敗。
- 當一個管道的測試正在進行中時，其「測試管道」按鈕應被暫時禁用。
- 頁面應每 30 秒自動刷新一次，以獲取最新的管道狀態和測試結果。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理通知管道。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已設定的通知管道。
- **FR-003**：系統必須（MUST）提供新增/編輯模態框，並依管道類型顯示預先定義的欄位群組（Email 多收件人、Webhook URL、Slack Mention、LINE Token、SMS 電話等）。
- **FR-004**：系統必須（MUST）為每個管道提供一個「測試」功能，用於驗證其連線和配置的正確性。
- **FR-005**：系統必須（MUST）在表格中清晰地展示每個管道的啟用狀態、類型和最近一次的測試結果（成功/失敗/未測試）。
- **FR-006**：系統必須（MUST）支援對管道的批次啟用、禁用和刪除。
- **FR-007**：系統必須（MUST）支援自訂表格顯示的欄位並透過 `/settings/column-config/{pageKey}` 儲存偏好。
- **FR-008**：頁面必須（MUST）每 30 秒自動重新取得列表資料，以反映外部變更。
- **FR-009**：系統必須（MUST）在工具列提供搜尋模態，以設定 `NotificationChannelFilters` 並重新載入資料。
- **FR-010**：「測試管道」功能必須（MUST）呼叫 `/settings/notification-channels/{id}/test`，並在提交後暫時標記狀態為 `pending`。
- **FR-011**：批次操作 API (`/settings/notification-channels/batch-actions`) 必須（MUST）支援啟用、停用與刪除選取的管道。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **NotificationChannel** | 核心資料實體，代表一個通知發送的端點設定。 | NotificationStrategy |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `notification-channels:read` | 允許使用者查看通知管道列表。 |
| `notification-channels:create` | 允許使用者建立新的通知管道。 |
| `notification-channels:update` | 允許使用者修改現有通知管道的設定（包括啟用/停用）。 |
| `notification-channels:delete` | 允許使用者刪除通知管道。 |
| `notification-channels:test` | 允許使用者觸發「測試管道」功能。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `NotificationChannelPage` 的根元件需由 `<RequirePermission permission="notification-channels:read">` 包裹。
- **工具列按鈕**:
  - 「新增管道」按鈕需具備 `notification-channels:create` 權限。
- **批次操作按鈕**:
  - 「啟用」、「停用」按鈕需具備 `notification-channels:update` 權限。
  - 「刪除」按鈕需具備 `notification-channels:delete` 權限。
- **表格內行內操作**:
  - 「測試管道」按鈕需具備 `notification-channels:test` 權限。
  - 「編輯管道」按鈕需具備 `notification-channels:update` 權限。
  - 「刪除管道」按鈕需具備 `notification-channels:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/notification-management/NotificationChannelPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

- **[CLARIFICATION]** 模態欄位為前端硬編排邏輯，尚未導入 JSON Schema；若需全動態欄位需重新設計 `options` API 與表單組件。
- **[CLARIFICATION]** 刪除前未檢查與通知策略的關聯，僅顯示靜態警告文字；若需實際阻擋需整合依賴檢查。
- **[CLARIFICATION]** 測試通知訊息僅帶入固定文字與可選收件人，不會產生唯一測試 ID；若有稽核需求需擴充 payload。
- **[CLARIFICATION]** 批次操作缺少成功/失敗逐項回饋，目前僅顯示整體錯誤提示。
- **[CLARIFICATION]** 欄位設定與自動刷新皆未考量 RBAC，權限表目前僅為目標狀態。
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。