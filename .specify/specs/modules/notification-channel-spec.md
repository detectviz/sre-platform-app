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
    **Then** 新的 Slack 管道應出現在列表中。

2.  **Given** 我不確定一個新設定的 PagerDuty 管道是否配置正確。
    **When** 我在該管道的操作中點擊「測試管道」按鈕。
    **Then** 系統應向該管道發送一條測試通知，且 UI 會樂觀地更新狀態，並在短時間後獲取最終測試結果。

3.  **Given** 頁面上沒有任何通知管道。
    **When** 我訪問「通知管道」頁面。
    **Then** 頁面應顯示一個清晰的「尚未建立任何通知管道」的空狀態提示，並提供一個「新增管道」的快捷按鈕。

### 邊界案例（Edge Cases）
- 當使用者嘗試刪除一個正在被某個「通知策略」使用的管道時，後端**必須**回傳 `409 Conflict` 錯誤，前端需據此顯示清晰的提示。
- 當一個管道的測試正在進行中時，其「測試管道」按鈕應被暫時禁用。
- 頁面應每 30 秒自動刷新一次，以獲取最新的管道狀態和測試結果。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理通知管道，並支援批次操作。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已設定的通知管道。
- **FR-003**：新增/編輯管道的表單**必須**根據後端 API 提供的 JSON Schema 動態產生，以支援不同類型的管道。
- **FR-004**：系統必須（MUST）為每個管道提供一個「測試」功能，並在 UI 上清晰地展示測試結果。
- **FR-005**：系統必須（MUST）支援進階篩選、欄位自訂、以及從 CSV 檔案匯入/匯出。
- **FR-006**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-007**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-008**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **NotificationChannel** | 核心資料實體，代表一個通知發送的端點設定。 | NotificationStrategy |
| **JsonSchema** | 用於定義不同通知管道類型所需設定欄位的綱要。 | NotificationChannel |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `notification-channels:read` | 允許使用者查看通知管道列表。 |
| `notification-channels:create` | 允許使用者建立新的通知管道。 |
| `notification-channels:update` | 允許使用者修改現有通知管道的設定（包括啟用/停用）。 |
| `notification-channels:delete` | 允許使用者刪除通知管道。 |
| `notification-channels:test` | 允許使用者觸發「測試管道」功能。 |
| `notification-channels:config` | 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `NotificationChannelPage` 的根元件需由 `<RequirePermission permission="notification-channels:read">` 包裹。
- **工具列按鈕**: 「新增管道」、「匯入」、「匯出」、「欄位設定」等按鈕需根據各自的權限進行渲染。
- **批次操作按鈕**: 「啟用」、「停用」、「刪除」按鈕需根據各自的權限進行渲染。
- **表格內行內操作**: 所有操作（如測試、編輯、刪除）均需根據對應的權限進行渲染。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 和測試操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與管道測試成功率、失敗率、通知發送延遲相關的指標。 |
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