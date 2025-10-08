# 功能規格書（Feature Specification）

**模組名稱 (Module)**: automation-trigger
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Final
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或平台管理員，我希望能將事件與自動化操作連結起來。我需要建立「觸發器」，來定義自動執行某個腳本（Playbook）的具體條件。例如，我希望設定一個觸發器，當某個特定的告警規則被觸發時，就自動執行「重啟服務」的腳本；或者設定一個排程觸發器，在每天午夜定時執行「備份資料庫」的腳本。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想設定一個每日報告的自動化任務。
    **When** 我在「自動化觸發器」頁面點擊「新增觸發器」，設定觸發類型為「排程」，輸入 CRON 表達式，並將其綁定到一個腳本。
    **Then** 新的觸發器應出現在列表中。

2.  **Given** 我想批次停用多個觸發器。
    **When** 我在觸發器列表中勾選多個項目，並點擊批次操作欄中的「停用」按鈕。
    **Then** 所有被選中的觸發器狀態應變為「停用」。

3.  **Given** 我想確認一個觸發器最近是否成功執行了其腳本。
    **When** 我查看列表中的「上次執行結果」欄位。
    **Then** 我應該能看到由該特定觸發器觸發的最近一次執行狀態（如：成功、失敗）以及相對執行時間。

### 邊界案例（Edge Cases）
- 當使用者嘗試建立一個觸發器但未綁定任何腳本時，系統應在儲存時給出錯誤提示。
- 當一個觸發器所綁定的腳本被刪除時，後端應自動禁用該觸發器，並在 UI 上顯示其為無效狀態。
- 當使用者嘗試刪除一個被其他設定（如通知策略）依賴的觸發器時，後端**必須**回傳一個 `409 Conflict` 錯誤，前端需據此顯示清晰的提示。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理自動化觸發器。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有觸發器。
- **FR-003**：系統必須（MUST）允許使用者在建立或編輯觸發器時，從現有的自動化腳本庫中選擇一個進行綁定。
- **FR-004**：對於「事件」類型的觸發器，編輯模態框中**必須**提供一個結構化的條件產生器。
- **FR-005**：系統必須（MUST）允許使用者單獨或批次地啟用/停用一個觸發器。
- **FR-006**：後端 API 回傳的 `AutomationTrigger` 物件**必須**包含 `last_execution` 物件，紀錄由該特定觸發器觸發的最近一次執行狀態與時間。
- **FR-007**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-008**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AutomationTrigger** | 核心資料實體，定義了觸發一個自動化腳本的條件，並包含 `last_execution` 物件。 | AutomationPlaybook |
| **AutomationExecution**| 一次自動化腳本的執行紀錄，用於在本模組中展示執行狀態。 | AutomationPlaybook, AutomationTrigger |
| **AutomationTriggerFilters** | 用於篩選觸發器列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `automation:triggers:read` | 允許使用者查看觸發器列表。 |
| `automation:triggers:create` | 允許使用者建立新的觸發器。 |
| `automation:triggers:update` | 允許使用者修改現有觸發器的設定（包括啟用/停用）。 |
| `automation:triggers:delete` | 允許使用者刪除觸發器。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AutomationTriggersPage` 的根元件需由 `<RequirePermission permission="automation:triggers:read">` 包裹。
- **工具列按鈕**: 「新增觸發器」按鈕需具備 `automation:triggers:create` 權限。
- **批次操作按鈕**: 「啟用」、「停用」、「刪除」按鈕需根據各自的權限 (`update`, `delete`) 進行渲染。
- **表格內行內操作**: 所有操作（如編輯、刪除、啟用/停用）均需根據對應的權限進行渲染。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與觸發器執行成功率、失敗率相關的指標。 |
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