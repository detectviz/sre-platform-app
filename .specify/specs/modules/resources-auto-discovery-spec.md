# 功能規格書（Feature Specification）

**模組名稱 (Module)**: resources-auto-discovery
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/resources/AutoDiscoveryPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名雲端管理員或平台維運人員，我需要能夠設定自動化的掃描任務，來定期發現我們在不同雲端提供商或網路區段中的新資源。這將確保我們的資產清單始終保持最新，無需手動添加，從而實現對資源的全面監控和治理。我需要能夠管理這些掃描任務的排程、查看它們的執行歷史和狀態，並審閱每次掃描所發現的結果。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要每天凌晨 2 點掃描我們的 AWS VPC 以發現新的 EC2 實例。
    **When** 我在「自動發現」頁面點擊「新增掃描」，設定任務名稱、選擇掃描類型為 "AWS EC2"，並輸入對應的 CRON 排程 `0 2 * * *`。
    **Then** 新的掃描任務應出現在列表中，並顯示其排程為「於 02:00 執行」。

2.  **Given** 一個掃描任務剛剛執行完畢，其狀態顯示為「成功」。
    **When** 我點擊該任務列的「查看結果」按鈕。
    **Then** 系統必須從右側滑出一個抽屜，其中詳細列出了本次掃描所發現的新資源、變更的資源以及可能已移除的資源。

3.  **Given** 我需要立即重新掃描一個特定區域，而不是等待下一次排程。
    **When** 我找到對應的掃描任務，並點擊「手動執行」按鈕。
    **Then** 該任務的狀態應立即變為「執行中」，並在執行完畢後更新其「最後執行時間」和狀態。

### 邊界案例（Edge Cases）
- 當使用者輸入一個無效的 CRON 表達式時，系統應在儲存時給出錯誤提示。
- 當一個任務正在執行中時，其「手動執行」按鈕應被禁用，以防止重複觸發。
- 如果一個任務從未執行過，其「最後執行時間」欄位應顯示為 "N/A" 或 "從未"。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理自動發現的掃描任務。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有掃描任務。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯掃描任務，包括其名稱、掃描類型和 CRON 排程。
- **FR-004**：系統必須（MUST）能夠將 CRON 表達式轉換為人類可讀的描述文字。
- **FR-005**：系統必須（MUST）在表格中清晰地展示每個任務的執行狀態（例如：等待中、執行中、成功、失敗）。
- **FR-006**：系統必須（MUST）提供手動觸發任何已設定掃描任務的功能。
- **FR-007**：系統必須（MUST）提供一個抽屜（Drawer）視圖，用於顯示特定掃描任務的執行結果詳情。
- **FR-008**: 為確保全平台對 CRON 表達式的解釋一致，從 CRON 到人類可讀描述的轉換邏輯**必須**由後端 API 或共享函式庫提供，前端**不應**自行實現。
- **FR-009**: 「查看結果」抽屜中顯示的掃描結果（`DiscoveryJobResult`）**必須**包含一個清晰的結構化物件，至少應有以下欄位：
    - `status`: (string) 該次執行的最終狀態。
    - `error_message`: (string, optional) 如果執行失敗，此處應包含錯誤訊息。
    - `new_resources`: (array) 本次掃描發現的新資源列表。
    - `changed_resources`: (array) 本次掃描發現狀態有變更的資源列表。
    - `deleted_resources`: (array) 本次掃描發現可能已被移除的資源列表。
- **FR-010**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-011**: 所有支援的掃描類型（`job_kinds`）及其所需的具體配置參數綱要（schema），**必須**由一個專門的後端 API 動態提供。前端**必須**根據此綱要動態渲染新增/編輯表單。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **DiscoveryJob** | 核心資料實體，定義了一個自動發現掃描任務的設定與狀態。 | Datasource (Target) |
| **DiscoveryJobResult** | 一次掃描任務執行後產生的結果，包含了發現的資源列表等資訊。 | DiscoveryJob |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `auto-discovery:read` | 允許使用者查看自動發現任務列表。 |
| `auto-discovery:create` | 允許使用者建立新的掃描任務。 |
| `auto-discovery:update` | 允許使用者修改現有掃描任務的設定。 |
| `auto-discovery:delete` | 允許使用者刪除掃描任務。 |
| `auto-discovery:execute` | 允許使用者手動執行一個掃描任務。 |
| `auto-discovery:results:read` | 允許使用者查看掃描任務的執行結果。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AutoDiscoveryPage` 的根元件需由 `<RequirePermission permission="auto-discovery:read">` 包裹。
- **工具列按鈕**:
  - 「新增掃描」按鈕需具備 `auto-discovery:create` 權限。
- **表格內行內操作**:
  - 「查看結果」按鈕需具備 `auto-discovery:results:read` 權限。
  - 「手動執行」按鈕需具備 `auto-discovery:execute` 權限。
  - 「編輯掃描」按鈕需具備 `auto-discovery:update` 權限。
  - 「刪除掃描」按鈕需具備 `auto-discovery:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/resources/AutoDiscoveryPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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