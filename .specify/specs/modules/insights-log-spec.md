# 功能規格書（Feature Specification）

**模組名稱 (Module)**: insights-log
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/analysis/LogExplorerPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或開發人員，在進行問題排查時，我需要一個強大的日誌探索工具。我希望能根據關鍵字和時間範圍快速篩選出相關的日誌，並透過日誌量的分佈圖快速定位問題高發時段。對於大量的日誌，我希望能利用 AI 功能為我生成摘要和模式分析，以加速問題定位。在監控線上發佈時，我還需要能夠切換到「即時」模式，持續觀察最新的日誌輸出。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在排查一個使用者回報的訂單失敗問題。
    **When** 我在搜尋框中輸入訂單 ID，並選擇時間範圍為「過去 1 小時」。
    **Then** 頁面應顯示所有包含該訂單 ID 的日誌，並且頂部的直方圖也應更新以反映篩選後日誌的分佈。

2.  **Given** 我正在監控一個新功能的上線過程。
    **When** 我開啟「即時日誌」開關。
    **Then** 頁面應每隔數秒自動載入新的日誌並顯示在列表頂部，讓我能夠觀察即時的系統行為。

3.  **Given** 我面對成千上萬條錯誤日誌，難以快速找到根本原因。
    **When** 我點擊「AI 總結」按鈕。
    **Then** 系統應彈出一個模態框，其中包含對這些日誌的 AI 分析結果，例如「發現 80% 的錯誤與資料庫連線逾時有關」以及相關的日誌範例。

### 邊界案例（Edge Cases）
- 當「即時日誌」模式開啟時，如果 API 請求失敗，不應彈出錯誤訊息中斷畫面，而是應在背景靜默重試。
- 當使用者點擊展開一條日誌查看其詳細 JSON 內容時，即使 JSON 結構非常複雜或龐大，頁面也應能正常渲染。
- 當沒有任何日誌符合篩選條件時，列表區域應顯示一個清晰的「無結果」提示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個介面，用於搜尋、篩選和瀏覽日誌資料。
- **FR-002**：系統必須（MUST）在頁面頂部提供一個時間序列直方圖，以視覺化方式展示不同級別（錯誤、警告、資訊）日誌在時間上的分佈。
- **FR-003**：系統必須（MUST）提供一個「即時日誌 (Live Tailing)」模式，在該模式下，前端應定期（如每 5 秒）自動獲取並展示最新的日誌。
- **FR-004**：系統必須（MUST）允許使用者點擊單筆日誌，以展開並查看其完整的、結構化的 JSON 內容。
- **FR-005**：系統必須（MUST）提供一個「AI 總結」功能，能夠對當前篩選出的日誌觸發後端分析，並在模態框中展示分析結果。
- **FR-006**：系統必須（MUST）支援透過 URL 查詢參數（`?q=`）來預先填寫搜尋關鍵字。
- **FR-007**：系統必須（MUST）提供將當前檢視的日誌匯出為 CSV 檔案的功能。
- **FR-008**：系統必須（MUST）以客戶端聚合方式，根據目前載入的日誌計算每分鐘的錯誤/警告/資訊數量並繪製堆疊直方圖。
- **FR-009**：「AI 總結」功能觸發後端 `/ai/logs/summarize` 時，回傳的 `LogAnalysis` 物件至少須包含 `summary`、`patterns`（描述、次數、等級）與 `recommendations` 字串陣列。
- **FR-010**：系統必須（MUST）維持工具列「搜尋和篩選」模態，允許使用者調整 `keyword` 與 `time_range`，並在套用後重新載入資料。
- **FR-011**：「即時日誌」模式使用 5 秒輪詢刷新最新五筆資料並插入列表頂端，同時保留最多 200 筆記錄。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **LogEntry** | 核心資料實體，代表一筆獨立的日誌紀錄，包含時間戳、級別、訊息和詳細結構化資料。 | - |
| **LogExplorerFilters** | 用於篩選日誌的一組條件集合，如關鍵字、時間範圍、日誌級別等。 | - |
| **LogAnalysis** | 對目前查詢結果進行 AI 分析後的報告，包含 `summary`、`patterns`（描述/次數/級別）與 `recommendations`。 | LogEntry |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `logs:read` | 允許使用者查看日誌探索頁面並執行查詢。 |
| `logs:analyze` | 允許使用者觸發「AI 總結」功能。 |
| `logs:export` | 允許使用者匯出日誌資料。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `LogExplorerPage` 的根元件需由 `<RequirePermission permission="logs:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/logs`) **必須**根據發起請求的使用者權限，來過濾其可查詢的日誌範圍。例如，一個使用者可能只能看到特定服務或命名空間的日誌。前端只負責渲染後端回傳的結果。
- **工具列按鈕**:
  - 「AI 總結」按鈕需具備 `logs:analyze` 權限。
  - 「匯出報表」按鈕需具備 `logs:export` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/analysis/LogExplorerPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

- **[CLARIFICATION]** 直方圖資料由前端對目前載入的最多 200 筆日誌重新分組，若要支援更大資料量需導入伺服器端聚合。 
- **[CLARIFICATION]** 當查詢結果為空時列表區域沒有「無結果」提示；若需更佳 UX 需補上空狀態。 
- **[CLARIFICATION]** `LogAnalysis.patterns` 僅含描述/計數/等級，缺乏具體樣本；若要提供範例需擴充 API。
- **[CLARIFICATION]** 即時模式在 API 失敗時靜默忽略錯誤；若需提示或退回策略需再決策。
- **[CLARIFICATION]** RBAC 與審計目前未落地，權限表僅代表目標設計。
- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。