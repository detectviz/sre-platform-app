# 功能規格書（Feature Specification）

**模組名稱 (Module)**: automation-trigger
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/automation/AutomationTriggersPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或平台管理員，我希望能將事件與自動化操作連結起來。我需要建立「觸發器」，來定義自動執行某個腳本（Playbook）的具體條件。例如，我希望設定一個觸發器，當某個特定的告警規則被觸發時，就自動執行「重啟服務」的腳本；或者設定一個排程觸發器，在每天午夜定時執行「備份資料庫」的腳本。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我想設定一個每日報告的自動化任務。
    **When** 我在「自動化觸發器」頁面點擊「新增觸發器」，設定觸發類型為「排程」，輸入 CRON 表達式 `0 9 * * *`，並將其綁定到「生成每日報告」這個腳本。
    **Then** 新的觸發器應出現在列表中，並顯示其將在每天早上 9 點執行指定的腳本。

2.  **Given** 一個事件觸發器過於頻繁地執行了某個腳本，我想暫時禁用它。
    **When** 我在觸發器列表中找到它，並點擊其「啟用」狀態的開關。
    **Then** 該觸發器的狀態應變為「停用」，並且它將不再因新的事件而執行其綁定的腳本。

3.  **Given** 我想確認一個觸發器最近是否成功執行了其腳本。
    **When** 我查看列表中的「上次執行結果」欄位。
    **Then** 我應該能看到該觸發器所綁定腳本的最近一次執行狀態（如：成功、失敗）以及執行時間。

### 邊界案例（Edge Cases）
- 當使用者嘗試建立一個觸發器但未綁定任何腳本時，系統應在儲存時給出錯誤提示。
- 當一個觸發器所綁定的腳本被刪除時，該觸發器應如何處理？是應被自動禁用還是標示為無效？規格需要明確此行為。
- 當多個觸發器綁定同一個腳本時，「上次執行結果」欄位應能正確反映是哪個觸發器導致了該次執行。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理自動化觸發器。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有觸發器。
- **FR-003**：系統必須（MUST）允許使用者在建立或編輯觸發器時，從現有的自動化腳本庫中選擇一個進行綁定。
- **FR-004**：系統必須（MUST）支援不同類型的觸發器，至少包括：基於時間的「排程」觸發器和基於系統事件的「事件」觸發器。
- **FR-005**：系統必須（MUST）允許使用者啟用或禁用一個觸發器，以控制其是否生效。支援單獨和批次操作。
- **FR-006**：系統必須（MUST）在表格中展示與該觸發器關聯的腳本的「最近一次執行狀態」。
- **FR-007**: 後端 API 回傳的 `AutomationTrigger` 物件中，**必須**包含一個 `last_execution` 物件，其中包含由**該特定觸發器**所觸發的最近一次執行的狀態和時間，以避免混淆。
- **FR-008**: 對於「事件」類型的觸發器，編輯模態框中**必須**提供一個結構化的條件產生器，允許使用者選擇事件來源（如 `AlertRule`）並設定過濾條件（如 `rule_id`, `severity`）。
- **FR-009**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AutomationTrigger** | 核心資料實體，定義了觸發一個自動化腳本的條件。包含結構化的 `conditions` 和 `last_execution` 物件。 | AutomationPlaybook |
| **AutomationExecution**| 一次自動化腳本的執行紀錄，用於在本模組中展示執行狀態。 | AutomationPlaybook, AutomationTrigger |
| **AutomationTriggerFilters** | 用於篩選觸發器列表的一組條件集合。 | - |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `automation:triggers:read` | 允許使用者查看觸發器列表。 |
| `automation:triggers:create` | 允許使用者建立新的觸發器。 |
| `automation:triggers:update` | 允許使用者修改現有觸發器的設定（包括啟用/停用）。 |
| `automation:triggers:delete` | 允許使用者刪除觸發器。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AutomationTriggersPage` 的根元件需由 `<RequirePermission permission="automation:triggers:read">` 包裹。
- **工具列按鈕**:
  - 「新增觸發器」按鈕需具備 `automation:triggers:create` 權限。
- **批次操作按鈕**:
  - 「啟用」、「停用」按鈕需具備 `automation:triggers:update` 權限。
  - 「刪除」按鈕需具備 `automation:triggers:delete` 權限。
- **表格內行內操作**:
  - 行內的「啟用/停用」開關需具備 `automation:triggers:update` 權限。
  - 「編輯觸發器」按鈕需具備 `automation:triggers:update` 權限。
  - 「刪除觸發器」按鈕需具備 `automation:triggers:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對觸發器的 CUD 操作（建立、更新、刪除、啟用/停用）產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ❌ | **[VIOLATION: `constitution.md`]** 程式碼中存在大量硬式編碼的英文字串，例如 `'Failed to fetch triggers or playbooks.'`、`'欄位定義缺失'` 等。 |
| Theme Token 使用 | ✅ | 程式碼使用了 `StatusTag` 和中央化的 `options` 來管理狀態和類型顯示，符合設計系統規範。 |

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