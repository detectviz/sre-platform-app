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
- **FR-007**：編輯策略模態採三步驟精靈，第一步設定名稱、描述、嚴重度、影響與資源群組，並以簡易輸入欄補充條件字串（支援 `=`、`!=`、`~=`）。
- **FR-008**：第二步需列出所有通知管道並以核取方塊選擇，顯示最近測試結果與建議接收團隊。
- **FR-009**：第三步提供條件細部欄位，可新增/移除多組 `[欄位][運算子][值]` 條件並序列化為 `trigger_condition` 字串。
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
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/notification-management/NotificationStrategyPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

- **[CLARIFICATION]** 條件輸入僅提供字串拼接，未提供欄位/運算子選單或語法驗證；複雜條件需由使用者自行輸入正確格式。
- **[CLARIFICATION]** 通知管道選取清單不支援搜尋或分頁；當管道數量增加時可能需要強化 UI。
- **[CLARIFICATION]** 複製策略僅在前端複製欄位，未檢查與管道/團隊之間的存活性或權限。
- **[CLARIFICATION]** RBAC 尚未實作，權限表為目標狀態。
- **[CLARIFICATION]** 精靈中顯示的建議團隊僅依據資源群組擁有者推測，未強制套用。
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。