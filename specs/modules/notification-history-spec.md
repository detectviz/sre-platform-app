# 功能規格書（Feature Specification）

**模組名稱 (Module)**: notification-history
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/notification-management/NotificationHistoryPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或平台管理員，我需要能夠追蹤所有從平台發送出去的通知的歷史紀錄。我希望能有一個介面，讓我能確認關鍵告警是否已成功送達、調查通知發送失敗的原因，並在必要時能手動重新發送失敗的通知，以確保資訊傳遞的可靠性。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想確認昨晚的資料庫嚴重告警是否已成功透過 PagerDuty 通知給值班人員。
    **When** 我在「通知歷史」頁面，使用篩選器篩選出管道類型為 "PagerDuty" 且時間範圍為昨晚的紀錄。
    **Then** 我應該能看到對應的通知紀錄，並且其狀態顯示為「已送達 (Sent)」。

2.  **Given** 我發現一條發送到 Slack 的通知狀態為「失敗 (Failed)」。
    **When** 我點擊該筆紀錄，在滑出的抽屜中查看其詳細資料。
    **Then** 我應該能看到導致失敗的錯誤訊息（例如，無效的 Webhook URL）以及完整的通知內容。

3.  **Given** 我已經修復了導致通知失敗的管道設定，並需要重新發送該通知。
    **When** 我在該筆失敗紀錄的詳情抽屜中，點擊「重新發送」按鈕。
    **Then** 系統應嘗試重新發送該通知，並在成功後，我能在歷史紀錄中看到一筆新的、狀態為「已送達」的紀錄。

### 邊界案例（Edge Cases）
- 對於正在處理中的通知（狀態為 `pending`），「重新發送」按鈕應被禁用。
- 頁面應每 60 秒自動刷新一次，以獲取最新的通知歷史紀錄。
- 當使用者嘗試匯出一個空的歷史紀錄列表時，系統應給出提示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有通知的發送歷史。
- **FR-002**：每條歷史紀錄必須（MUST）包含關鍵資訊，如：時間戳、觸發策略、目標管道、收件人、狀態和內容摘要。
- **FR-003**：系統必須（MUST）提供快速篩選器，允許使用者根據「狀態」和「管道類型」過濾列表。
- **FR-004**：系統必須（MUST）允許使用者點擊任一筆紀錄，以在抽屜（Drawer）中查看該次通知的完整詳細資訊。
- **FR-005**：系統必須（MUST）為發送失敗的通知提供一個「重新發送」的功能。
- **FR-006**：系統必須（MUST）支援將歷史紀錄匯出為 CSV 檔案。
- **FR-007**：系統必須（MUST）支援自訂表格顯示的欄位。
- **FR-008**：頁面必須（MUST）每 60 秒自動刷新一次資料。
- **FR-009**：[NEEDS CLARIFICATION: 通知的 `content` 欄位應包含哪些資訊？是純文字訊息，還是包含指向相關事件的連結？]
- **FR-010**：[NEEDS CLARIFICATION: 一個通知紀錄與觸發它的原始事件（如 `incident`）之間的關聯應如何呈現？目前僅有一個 `incident_id` 欄位。]
- **FR-011**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面，並在後端過濾可見的歷史紀錄。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **NotificationHistoryRecord** | 核心資料實體，代表一次通知發送的歷史紀錄。 | NotificationStrategy, NotificationChannel |
| **NotificationHistoryFilters** | 用於篩選通知歷史列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `notification-history:read` | 允許使用者查看通知歷史。 |
| `notification-history:resend` | 允許使用者重新發送失敗的通知。 |
| `notification-history:export` | 允許使用者匯出通知歷史。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `NotificationHistoryPage` 的根元件需由 `<RequirePermission permission="notification-history:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/settings/notification-history`) **必須**根據發起請求的使用者權限，來過濾其可見的通知歷史。例如，一個使用者可能只能看到發送給自己或自己團隊的通知。
- **抽屜內操作**:
  - 「重新發送」按鈕需具備 `notification-history:resend` 權限。
- **工具列按鈕**:
  - 「匯出」按鈕需具備 `notification-history:export` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 此模組本身即為通知發送的審計日誌，滿足了對通知行為的追蹤要求。 |
| 指標與告警 (Metrics & Alerts) | ❌ | [NEEDS CLARIFICATION: 未見前端性能指標採集。] |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型與後端資料過濾原則。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "重新發送"、"無法獲取通知歷史。" 等。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 和動態圖示設定，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

- **[NEEDS CLARIFICATION: Resend Logic]** 「重新發送」是完全複製原始通知內容進行發送，還是會基於當前的事件狀態生成新的內容？
- **[NEEDS CLARIFICATION: Data Retention Policy]** 通知歷史的資料保留策略是什麼？
- **[NEEDS CLARIFICATION: Notification Content Schema]** 需要為不同類型的通知定義其 `content` 的結構和範本。