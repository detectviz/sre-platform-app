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
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯管道，其設定欄位應根據所選的管道類型（如 Slack, Email, Webhook）動態變化。
- **FR-004**：系統必須（MUST）為每個管道提供一個「測試」功能，用於驗證其連線和配置的正確性。
- **FR-005**：系統必須（MUST）在表格中清晰地展示每個管道的啟用狀態、類型和最近一次的測試結果（成功/失敗/未測試）。
- **FR-006**：系統必須（MUST）支援對管道的批次啟用、禁用和刪除。
- **FR-007**：系統必須（MUST）支援自訂表格顯示的欄位。
- **FR-008**：頁面必須（MUST）每 30 秒自動刷新一次資料。
- **FR-009**: 後端 API **必須**透過一個專門的端點（如 `/options/notification-channel-types`）提供所有可用通知管道的綱要。
    - 此 API 回應的列表中，每個物件**必須**包含：
        - `type`: (string) 唯一的類型識別碼，如 "slack" 或 "email"。
        - `name`: (string) 用於在 UI 上顯示的類型名稱，如 "Slack"。
        - `schema`: (JSON Schema) 一個定義了該類型所需設定欄位的標準 JSON Schema，包含欄位名、類型、標籤、是否必填、預設值等資訊。
    - 前端的新增/編輯模態框**必須**完全基於此動態獲取的綱要來動態渲染表單欄位。
- **FR-010**: 「測試管道」功能**必須**發送一條標準化、不可自訂的測試訊息，其內容應包含固定的標題和一個唯一的測試 ID。
- **FR-011**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

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
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對通知管道的 CUD 操作及測試操作產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增管道"、"無法獲取通知管道。"、"您確定要刪除管道...嗎？" 等。 |
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

（無）