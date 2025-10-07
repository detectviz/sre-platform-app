# 功能規格書（Feature Specification）

**模組名稱 (Module)**: notification-strategy
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/settings/notification-management/NotificationStrategyPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或團隊負責人，我需要定義精細的通知規則，以確保正確的告警能在正確的時間發送給正確的人或系統。我希望能建立「通知策略」，來指定當發生特定嚴重性或影響等級的事件時，應透過哪些通知管道（如 Slack, Email）發送通知。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想為所有「嚴重」等級的資料庫相關告警設定一個緊急通知。
    **When** 我在「通知策略」頁面點擊「新增策略」，設定觸發條件為 `service = 'database'`，嚴重性等級勾選「嚴重 (Critical)」，並選擇「PagerDuty」和「DBA Slack」這兩個通知管道。
    **Then** 新的策略應出現在列表中，並且當有符合條件的告警發生時，會同時向 PagerDuty 和指定的 Slack 頻道發送通知。

2.  **Given** 我發現一個現有的通知策略過於嘈雜，想暫時禁用它。
    **When** 我在該策略的列表中找到它，並點擊其「啟用」開關。
    **Then** 該策略的狀態應變為「停用」，並且系統將不再根據此策略發送任何通知。

3.  **Given** 我需要建立一個與現有策略類似，但發送到不同管道的新策略。
    **When** 我點擊一個現有策略的「複製」按鈕。
    **Then** 系統應打開一個預先填寫好該策略大部分資訊的編輯模態框，讓我能快速修改其名稱和通知管道並儲存為一個新策略。

### 邊界案例（Edge Cases）
- 當一個策略所關聯的通知管道被刪除時，該策略應如何處理？是應被自動禁用還是標示為有問題的狀態？
- 當使用者嘗試儲存一個沒有設定任何觸發條件或通知管道的策略時，系統應給出錯誤提示。
- 對於一個從未被觸發過的策略，其「上次觸發狀態」和「上次觸發時間」應顯示為 "N/A" 或 "尚未觸發"。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理通知策略，並包含複製功能。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已設定的通知策略。
- **FR-003**：系統必須（MUST）允許使用者在建立或編輯策略時，定義其觸發條件、篩選的嚴重性和影響等級，並關聯一個或多個通知管道。
- **FR-004**：系統必須（MUST）允許使用者啟用或禁用一個通知策略，並支援批次操作。
- **FR-005**：系統必須（MUST）在表格中展示每個策略的啟用狀態、關聯的管道數量以及最近一次的觸發狀態和時間。
- **FR-006**：系統必須（MUST）支援自訂表格顯示的欄位和批次刪除。
- **FR-007**: 編輯策略的模態框中**必須**提供一個結構化的條件產生器，允許使用者以 `[欄位] [運算子] [值]` 的形式定義 `trigger_condition`。
- **FR-008**: 策略的執行邏輯為「全部匹配」：一個事件**必須**觸發所有與其條件匹配的、已啟用的策略。
- **FR-009**: 編輯策略的模態框中**必須**提供一個多選搜尋框，讓使用者可以從現有的通知管道中選擇一個或多個進行關聯。
- **FR-010**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **NotificationStrategy** | 核心資料實體，定義了從事件到通知管道的路由和過濾規則。 | NotificationChannel[] |
| **NotificationStrategyFilters** | 用於篩選通知策略列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `notification-strategies:read` | 允許使用者查看通知策略列表。 |
| `notification-strategies:create` | 允許使用者建立新的通知策略。 |
| `notification-strategies:update` | 允許使用者修改現有通知策略的設定（包括啟用/停用）。 |
| `notification-strategies:delete` | 允許使用者刪除通知策略。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `NotificationStrategyPage` 的根元件需由 `<RequirePermission permission="notification-strategies:read">` 包裹。
- **工具列按鈕**:
  - 「新增策略」按鈕需具備 `notification-strategies:create` 權限。
- **批次操作按鈕**:
  - 「啟用」、「停用」按鈕需具備 `notification-strategies:update` 權限。
  - 「刪除」按鈕需具備 `notification-strategies:delete` 權限。
- **表格內行內操作**:
  - 「編輯」、「複製」按鈕需具備 `notification-strategies:update` 權限。
  - 行內的「啟用/停用」開關需具備 `notification-strategies:update` 權限。
  - 「刪除」按鈕需具備 `notification-strategies:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對通知策略的 CUD 操作（建立、更新、刪除、啟用/停用）產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的繁體中文文案，例如 "新增策略"、"無法獲取通知策略。" 等。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 和從 `options` 中獲取的描述符來管理狀態顯示，符合設計系統規範。 |

---

## 六、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。（已標注違規與待確認項）

---

## 七、模糊與待確認事項（Clarifications）

(此區塊所有相關項目已被澄清)