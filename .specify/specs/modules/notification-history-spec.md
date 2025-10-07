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
- **FR-005 (AS-IS)**：系統必須（MUST）為發送失敗的通知提供「重新發送」功能；MVP 僅在狀態為 `failed` 時顯示按鈕，重送成功後會關閉抽屜並重新整理列表。
- **FR-006**：系統必須（MUST）支援將歷史紀錄匯出為 CSV 檔案。
- **FR-007**：系統必須（MUST）支援自訂表格顯示的欄位。
- **FR-008 (AS-IS)**：頁面每 60 秒自動刷新一次資料，使用 `setInterval` 重新呼叫 `/settings/notification-history`；未實作瀏覽器背景時的降頻控制。
- **FR-009**：`NotificationHistoryRecord.content` 目前以純文字摘要呈現，匯出時需直接輸出該字串。
- **FR-010**：抽屜需顯示完整紀錄 JSON，並在重新發送成功後關閉抽屜並重新載入列表。
- **FR-011**：頁面必須（MUST）在工具列提供搜尋模態與欄位設定模態，以調整 `NotificationHistoryFilters` 與可見欄位。
- **FR-012**：列表頂部需呈現批次/群組成功率摘要（成功筆數、失敗筆數、成功率百分比），資料由後端依策略或群組聚合提供。

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
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/settings/notification-management/NotificationHistoryPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

- **[CLARIFICATION]** `content` 為純文字欄位，抽屜顯示完整 JSON 亦僅含原字串；若需結構化標題/連結需後端調整資料模型。
- **[CLARIFICATION]** 抽屜中的事件 ID 僅為文字，尚未提供導向詳細頁的超連結。
- **[CLARIFICATION]** 重新發送僅呼叫 `/resend` 並不重新計算策略內容；若需策略重跑需由後端支援。
- **[CLARIFICATION]** 頁面未套用 RBAC，權限表目前為目標狀態。
- **[CLARIFICATION]** 匯出僅輸出目前頁面資料，無 server-side 分頁或篩選對齊。
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。
- 列表需新增批次/群組成功率摘要，後端 API 提供聚合資料，前端在列表與抽屜呈現分母與成功率。