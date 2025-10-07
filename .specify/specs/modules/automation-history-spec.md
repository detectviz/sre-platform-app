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
    **Then** 系統必須從右側滑出一個抽屜，其中包含該次執行的完整日誌輸出，並高亮顯示錯誤訊息。

3.  **Given** 我在日誌中發現失敗的原因是一個暫時性的網路問題，並希望重試該任務。
    **When** 我在該筆失敗紀錄的狀態旁，點擊「重試」按鈕。
    **Then** 系統應重新觸發一次該腳本的執行，並在列表中出現一筆新的、狀態為「執行中」的紀錄。

### 邊界案例（Edge Cases）
- 當一個執行紀錄的日誌內容非常龐大時，抽屜中的日誌檢視器應能正常渲染，不會導致頁面卡頓。
- 對於正在執行中的任務，其「重試」按鈕應被禁用。
- 當 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個可分頁、可排序的表格，來展示所有自動化腳本的執行歷史。
- **FR-002**：表格必須（MUST）包含關鍵資訊，如：腳本名稱、執行狀態、觸發來源、觸發者、開始時間和執行時長。
- **FR-003**：系統必須（MUST）提供一個快速篩選器，允許使用者根據執行狀態（如：成功、失敗、執行中）來過濾列表。
- **FR-004**：系統必須（MUST）允許使用者點擊任一筆執行紀錄，以在抽屜（Drawer）中查看該次執行的詳細日誌（`ExecutionLogDetail`）。
- **FR-005**：系統必須（MUST）為執行失敗的任務提供一個「重試」功能。
- **FR-006**：系統必須（MUST）支援將執行歷史列表匯出為 CSV 檔案。
- **FR-007**：系統必須（MUST）支援自訂表格顯示的欄位。
- **FR-008 (AS-IS)**：後端 API 回傳的 `AutomationExecution` 物件中，`triggered_by` 欄位為一個描述觸發者的字串（例如使用者名稱或觸發器識別字），前端必須直接渲染此字串；目前沒有結構化的 `type/name` 物件。
- **FR-009 (AS-IS)**：`ExecutionLogDetail` 抽屜僅顯示 `logs.stdout` 與 `logs.stderr` 內容；不存在 `exit_code` 或 `steps` 陣列，前端必須依原始字串呈現執行輸出。
- **FR-010 (FUTURE)**：系統應根據使用者的權限，動態顯示或禁用對應的操作介面，並在後端過濾可見的歷史紀錄。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-011 (FUTURE)**：根據平台資料治理策略，執行歷史紀錄的線上資料保留期限為 90 天。後端應自動清除所有超過 90 天的歷史紀錄。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AutomationExecution** | 核心資料實體，代表一次自動化腳本的執行紀錄。MVP 僅提供字串型 `triggered_by` 與 `logs.stdout/stderr`。 | AutomationPlaybook, AutomationTrigger |
| **AutomationHistoryFilters** | 用於篩選執行歷史列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `automation:history:read` | 允許使用者查看執行歷史列表和單次執行的詳細日誌。 |
| `automation:history:retry` | 允許使用者重試一個執行失敗的任務。 |
| `automation:history:export` | 允許使用者匯出執行歷史資料。 |

### 4.2. UI 控制與後端資料過濾
- **頁面存取**: `AutomationHistoryPage` 的根元件需由 `<RequirePermission permission="automation:history:read">` 包裹。
- **資料過濾 (後端核心職責)**: 後端 API (`/automation/executions`) **必須**根據發起請求的使用者權限，來過濾其可見的執行歷史。例如，一個使用者可能只能看到由他自己或他所在團隊觸發的執行紀錄。
- **表格內行內操作**:
  - 點擊查看詳情（打開抽屜）需具備 `automation:history:read` 權限。
  - 「重試」按鈕需具備 `automation:history:retry` 權限。
- **工具列按鈕**:
  - 「匯出」按鈕需具備 `automation:history:export` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/automation/AutomationHistoryPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

- [RESOLVED - 2025-10-07] 已採納《common/rbac-observability-audit-governance.md》定義的權限守衛與審計方案；此模組必須導入 `usePermissions`/`<RequirePermission>` 並依規範等待後端審計 API。
- `/automation/executions` 需回傳結構化觸發來源（`trigger_id`, `trigger_name`, `actor`）與步驟時間軸，抽屜以時間線呈現並支援依步驟展開日誌。
- 重試功能須在彈出視窗允許調整輸入參數並要求填寫重試原因，提交時呼叫 `/automation/executions/{id}/retry` 並傳遞 `override_parameters` 與審批 metadata，以利後端記錄。