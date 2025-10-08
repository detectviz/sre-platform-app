# 功能規格書（Feature Specification）

**模組名稱 (Module)**: notification-history
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或平台管理員，我需要能夠追蹤所有從平台發送出去的通知的歷史紀錄。我希望能有一個介面，讓我能確認關鍵告警是否已成功送達、調查通知發送失敗的原因，並在必要時能手動重新發送失敗的通知，以確保資訊傳遞的可靠性。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想確認昨晚的資料庫嚴重告警是否已成功透過 PagerDuty 通知給值班人員。
    **When** 我在「通知歷史」頁面，使用快速篩選器選擇管道類型為 "PagerDuty"。
    **Then** 我應該能看到對應的通知紀錄，並且其狀態顯示為「已送達」。

2.  **Given** 我發現一條發送到 Slack 的通知狀態為「失敗」。
    **When** 我點擊該筆紀錄，在滑出的抽屜中查看其詳細資料。
    **Then** 我應該能看到結構化的摘要資訊以及完整的 JSON 資料。

3.  **Given** 我已經修復了導致通知失敗的管道設定，並需要重新發送該通知。
    **When** 我在該筆失敗紀錄的詳情抽屜中，點擊「重新發送」按鈕。
    **Then** 系統應嘗試重新發送該通知，且按鈕會顯示載入中狀態。

### 邊界案例（Edge Cases）
- 對於正在處理中的通知（狀態為 `pending`），「重新發送」按鈕應被禁用。
- 頁面應每 60 秒自動刷新一次，以獲取最新的通知歷史紀錄。
- 當使用者嘗試匯出一個空的歷史紀錄列表時，系統應給出提示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有通知的發送歷史。
- **FR-002**：每條歷史紀錄必須（MUST）包含關鍵資訊，如：時間戳、觸發策略、目標管道、收件人、狀態和內容摘要。
- **FR-003**：系統必須（MUST）提供 `QuickFilterBar`，允許使用者根據「狀態」和「管道類型」過濾列表。
- **FR-004**：系統必須（MUST）允許使用者點擊任一筆紀錄，以在抽屜（Drawer）中查看該次通知的完整詳細資訊，包括結構化摘要和完整 JSON。
- **FR-005**：系統必須（MUST）為發送失敗的通知提供「重新發送」功能。
- **FR-006**：系統必須（MUST）支援將歷史紀錄匯出為 CSV 檔案。
- **FR-007**：系統必須（MUST）支援自訂表格顯示的欄位 (`ColumnSettingsModal`) 和進階篩選 (`UnifiedSearchModal`)。
- **FR-008 (AS-IS)**：頁面每 60 秒自動刷新一次資料。
- **FR-009 (AS-IS)**：`content` 欄位目前以純文字摘要呈現。
- **FR-010 (FUTURE)**：列表頂部應呈現批次/群組成功率摘要。
- **FR-011 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **NotificationHistoryRecord** | 核心資料實體，代表一次通知發送的歷史紀錄。 | NotificationStrategy, NotificationChannel |
| **NotificationHistoryFilters** | 用於篩選通知歷史列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `notification-history:read` | 允許使用者查看通知歷史。 |
| `notification-history:resend` | 允許使用者重新發送失敗的通知。 |
| `notification-history:export` | 允許使用者匯出通知歷史。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `NotificationHistoryPage` 的根元件需由 `<RequirePermission permission="notification-history:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/settings/notification-history`) **必須**根據發起請求的使用者權限，來過濾其可見的通知歷史。
- **抽屜內操作**:
  - 「重新發送」按鈕需具備 `notification-history:resend` 權限。
- **工具列按鈕**:
  - 「匯出」按鈕需具備 `notification-history:export` 權限。

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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'通知已成功重新發送。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `bg-slate-700/50`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Success Rate Summary**: 成功率摘要功能 (FR-010) 未在當前 MVP 中實現，是未來監控通知可靠性的關鍵部分。

---

## 八、依賴關係（Dependencies）

| 模組名稱 | 關聯類型 | 說明 |
|-----------|-----------|------|
| `notification-strategy` | 接收 (Input) | 此模組接收來自「通知策略」模組的發送結果事件，負責記錄每一次通知任務的執行結果、成功與失敗狀態，以支援後續的稽核與回溯分析。 |