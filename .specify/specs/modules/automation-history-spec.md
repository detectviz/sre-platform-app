# 功能規格書（Feature Specification）

**模組名稱 (Module)**: automation-history
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/automation/AutomationHistoryPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或平台管理員，我需要能夠追蹤和審計所有自動化腳本的執行歷史。我希望能有一個集中的地方來查看哪個腳本在什麼時候被觸發、由誰或哪個事件觸發、執行的結果是什麼，並能深入查看每一次執行的詳細日誌，以便於問題排查、效能分析和合規性審查。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看「自動化執行歷史」頁面。
    **When** 我想快速找出所有失敗的任務，於是我點擊狀態篩選器中的「失敗」按鈕。
    **Then** 列表應立即更新，只顯示所有執行失敗的紀錄。

2.  **Given** 我看到一筆執行失敗的紀錄，並想了解失敗的具體原因。
    **When** 我點擊該筆紀錄的資料列。
    **Then** 系統必須從右側滑出一個抽屜，其中包含該次執行的完整日誌輸出。

3.  **Given** 我在日誌中發現失敗的原因是一個暫時性的網路問題，並希望重試該任務。
    **When** 我在該筆失敗紀錄的操作欄，點擊「重試」按鈕。
    **Then** 系統應重新觸發一次該腳本的執行，並在列表中出現一筆新的、狀態為「執行中」的紀錄。

4.  **Given** 我需要根據腳本名稱和觸發者進行組合查詢。
    **When** 我點擊「搜索和篩選」按鈕，在彈出的模態框中輸入條件並執行搜尋。
    **Then** 列表應更新為符合所有篩選條件的結果。

### 邊界案例（Edge Cases）
- 當一個執行紀錄的日誌內容非常龐大時，抽屜中的日誌檢視器應能正常渲染，不會導致頁面卡頓。
- 對於正在執行中的任務，其「重試」按鈕應被禁用或不顯示。
- 當 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個可分頁、可排序的表格，來展示所有自動化腳本的執行歷史。
- **FR-002**：表格必須（MUST）包含關鍵資訊，如：腳本名稱、執行狀態、觸發來源、觸發者、開始時間和執行時長。
- **FR-003**：系統必須（MUST）提供快速篩選器 (`QuickFilterBar`) 和進階搜尋 (`UnifiedSearchModal`) 功能。
- **FR-004**：系統必須（MUST）允許使用者點擊任一筆執行紀錄，以在抽屜（Drawer）中查看該次執行的詳細日誌。
- **FR-005**：對於執行失敗的任務，系統必須（MUST）提供一個「重試」功能。點擊後應彈出一個模態框，允許使用者調整輸入參數並填寫重試原因，以供審計。
- **FR-006**：系統必須（MUST）支援將執行歷史列表匯出為 CSV 檔案及自訂表格顯示欄位。
- **FR-007**：後端 API 回傳的 `AutomationExecution` 物件中，`triggered_by` 欄位**必須**為結構化物件，前端應據此渲染使用者頭像或觸發器圖示。
- **FR-008**：`ExecutionLogDetail` 抽屜**必須**能呈現結構化的步驟 (steps) 與日誌，而不僅是原始字串。
- **FR-009**：所有 UI 文字（包括 Toast 訊息）**必須**使用 i18n Key 進行渲染。
- **FR-010**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token，禁止直接使用 Tailwind 色票。
- **FR-011**：系統應根據使用者的權限，動態顯示或禁用對應的操作介面，並在後端過濾可見的歷史紀錄。
- **FR-012**：根據平台資料治理策略，執行歷史紀錄的線上資料保留期限為 90 天。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AutomationExecution** | 核心資料實體，代表一次自動化腳本的執行紀錄。 | AutomationPlaybook, AutomationTrigger |
| **AutomationHistoryFilters** | 用於篩選執行歷史列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `automation:history:read` | 允許使用者查看執行歷史列表和單次執行的詳細日誌。 |
| `automation:history:retry` | 允許使用者重試一個執行失敗的任務。 |
| `automation:history:export` | 允許使用者匯出執行歷史資料。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `AutomationHistoryPage` 的根元件需由 `<RequirePermission permission="automation:history:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/automation/executions`) **必須**根據發起請求的使用者權限，來過濾其可見的執行歷史。
- **表格內行內操作**:
  - 「重試」按鈕需具備 `automation:history:retry` 權限。
- **工具列按鈕**:
  - 「匯出」按鈕需具備 `automation:history:export` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 使用者執行「重試」等操作時，必須產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與任務執行成功率、失敗率相關的指標。 |
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