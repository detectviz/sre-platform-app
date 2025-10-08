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
    **When** 我在搜尋框中輸入訂單 ID，並點擊快速時間範圍按鈕「過去 1 小時」。
    **Then** 頁面應顯示所有包含該訂單 ID 的日誌，並且頂部的直方圖也應更新。

2.  **Given** 我正在監控一個新功能的上線過程。
    **When** 我開啟「即時日誌」開關。
    **Then** 頁面應每隔 5 秒自動載入新的日誌並顯示在列表頂部。

3.  **Given** 我面對成千上萬條錯誤日誌，難以快速找到根本原因。
    **When** 我點擊「AI 總結」按鈕。
    **Then** 系統應彈出一個模態框，其中包含對這些日誌的 AI 分析結果。

### 邊界案例（Edge Cases）
- 當「即時日誌」模式開啟時，如果 API 請求失敗，應在背景靜默重試，不中斷使用者介面。
- 當使用者點擊展開一條日誌查看其詳細 JSON 內容時，即使 JSON 結構非常複雜，頁面也應能正常渲染。
- 當沒有任何日誌符合篩選條件時，列表區域是空白的。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個介面，用於搜尋、篩選和瀏覽日誌資料。
- **FR-002**：系統必須（MUST）在頁面頂部提供一個時間序列直方圖，以視覺化方式展示日誌分佈。
- **FR-003**：系統必須（MUST）提供一個「即時日誌 (Live Tailing)」模式。
- **FR-004**：系統必須（MUST）允許使用者點擊單筆日誌，以展開並查看其完整的、結構化的 JSON 內容。
- **FR-005**：系統必須（MUST）提供一個「AI 總結」功能，並在 `LogAnalysisModal` 中展示分析結果。
- **FR-006**：系統必須（MUST）支援透過 URL 查詢參數（`?q=`）來預先填寫搜尋關鍵字。
- **FR-007**：系統必須（MUST）提供將當前檢視的日誌匯出為 CSV 檔案的功能。
- **FR-008 (AS-IS)**：直方圖是透過客戶端對已載入的日誌（最多 200 筆）進行聚合來計算和渲染的。
- **FR-009 (AS-IS)**：「即時日誌」模式採用 5 秒輪詢機制，每次獲取最新的 5 筆資料。
- **FR-010 (FUTURE)**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **LogEntry** | 核心資料實體，代表一筆獨立的日誌紀錄。 | - |
| **LogExplorerFilters** | 用於篩選日誌的一組條件集合。 | - |
| **LogAnalysis** | 對目前查詢結果進行 AI 分析後的報告。 | LogEntry |

---

## 四、權限控制 (Role-Based Access Control)

**[FUTURE REQUIREMENT]** 以下權限模型描述了產品的最終設計目標，尚未在當前 MVP 中實現。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `logs:read` | 允許使用者查看日誌探索頁面並執行查詢。 |
| `logs:analyze` | 允許使用者觸發「AI 總結」功能。 |
| `logs:export` | 允許使用者匯出日誌資料。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `LogExplorerPage` 的根元件需由 `<RequirePermission permission="logs:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/logs`) **必須**根據發起請求的使用者權限，來過濾其可查詢的日誌範圍。
- **工具列按鈕**:
  - 「AI 總結」按鈕需具備 `logs:analyze` 權限。
  - 「匯出報表」按鈕需具備 `logs:export` 權限。

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

- **[NEEDS CLARIFICATION] i18n**: 目前 MVP 在多處使用硬編碼中文，例如 `showToast` 的訊息 (`'沒有可匯出的資料。'`)，未來需完全遷移至 i18n 內容管理系統。
- **[NEEDS CLARIFICATION] Theming**: MVP 廣泛使用 Tailwind CSS 的原子化 class (如 `text-purple-300`) 來定義語義顏色和樣式，未來需重構為使用中央設計系統的 Theme Token。
- **[NEEDS CLARIFICATION] Histogram Aggregation**: 直方圖資料由前端對目前載入的日誌重新分組，這在大資料量下可能存在效能瓶頸和代表性問題。未來應考慮由後端進行聚合。