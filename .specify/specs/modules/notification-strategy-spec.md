# 功能規格書（Feature Specification）

**模組名稱 (Module)**: notification-strategy
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或團隊負責人，我需要定義精細的通知規則，以確保正確的告警能在正確的時間發送給正確的人或系統。我希望能建立「通知策略」，來指定當發生特定嚴重性或影響等級的事件時，應透過哪些通知管道（如 Slack, Email）發送通知。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想為所有「嚴重」等級的資料庫相關告警設定一個緊急通知。
    **When** 我在「通知策略」頁面點擊「新增策略」，在彈出的模態框中設定觸發條件和通知管道。
    **Then** 新的策略應出現在列表中。

2.  **Given** 我發現一個現有的通知策略過於嘈雜，想暫時禁用它。
    **When** 我在該策略的列表中找到它，並點擊其「啟用」開關。
    **Then** 該策略的狀態應變為「停用」。

3.  **Given** 我需要建立一個與現有策略類似，但發送到不同管道的新策略。
    **When** 我點擊一個現有策略的「複製」按鈕。
    **Then** 系統應打開一個預先填寫好該策略資訊的編輯模態框，其名稱會被加上「策略複本 - 」前綴。

### 邊界案例（Edge Cases）
- 當一個策略所關聯的通知管道被刪除時，該策略應如何處理？[NEEDS CLARIFICATION]
- 當使用者嘗試儲存一個沒有設定任何觸發條件或通知管道的策略時，系統應給出錯誤提示。
- 對於一個從未被觸發過的策略，其「上次觸發狀態」和「上次觸發時間」應顯示為「尚未觸發」。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理通知策略，並包含複製功能。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有已設定的通知策略。
- **FR-003**：系統必須（MUST）允許使用者透過 `NotificationStrategyEditModal` 模態框來新增或編輯策略。
- **FR-004**：系統必須（MUST）允許使用者啟用或禁用一個通知策略，並支援批次操作。
- **FR-005**：系統必須（MUST）在表格中展示每個策略的啟用狀態、關聯的管道數量以及最近一次的觸發狀態和時間。
- **FR-006**：系統必須（MUST）支援自訂表格顯示的欄位 (`ColumnSettingsModal`) 和批次刪除。
- **FR-007 (AS-IS)**：前端透過 `renderConditionTags` 函式將後端回傳的 `trigger_condition` 字串解析並美化為一組標籤。
- **FR-008 (FUTURE)**：編輯策略的模態框應提供一個結構化的條件產生器，以取代目前的純字串輸入。
- **FR-009 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **NotificationStrategy** | 核心資料實體，定義了從事件到通知管道的路由和過濾規則。 | NotificationChannel[] |
| **NotificationStrategyFilters** | 用於篩選通知策略列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

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

此部分描述當前 MVP 的狀態，作為未來迭代的基準。

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | 🟡 | 未實現。 |
| 指標與告警 (Metrics & Alerts) | 🟡 | 未實現。 |
| RBAC 權限與審計 | 🟡 | 未實現。所有操作對任何登入使用者均可見。 |
| i18n 文案 | 🟡 | 部分實現。Toast 訊息等處存在硬編碼的中文 fallback。 |
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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'儲存通知策略失敗，請稍後再試。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-sky-900/50`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Condition Input**: 當前 MVP 的條件輸入為純字串，易用性較差，未來應改為結構化的條件產生器 (FR-008)。

---

## 八、依賴關係（Dependencies）

| 模組名稱 | 關聯類型 | 說明 |
|-----------|-----------|------|
| `notification-channel` | 依賴 (Dependency) | 此模組依賴通知管道模組以獲取可用的傳輸設定（如 Slack、Email、Webhook 等）。策略執行時必須引用至少一個啟用的通知管道。 |
| `notification-history` | 輸出 (Output) | 此模組執行後會產生通知事件記錄，並寫入通知歷史模組，以供後續查詢、稽核與回溯。 |