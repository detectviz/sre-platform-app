# 功能規格書（Feature Specification）

**模組名稱 (Module)**: automation-playbook
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/automation/AutomationPlaybooksPage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或維運工程師，我需要一個地方來集中管理和維護我們所有可重複使用的自動化腳本（Playbooks），例如「重啟服務」、「清理日誌檔案」或「擴展資料庫容量」。我希望能方便地新增、編輯這些腳本，並在需要時能手動觸發它們，輸入必要的參數來執行一次性的維運任務。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要建立一個用於清理磁碟空間的新腳本。
    **When** 我在「自動化腳本」頁面點擊「新增腳本」，在彈出的模態框中填寫腳本名稱、描述、腳本內容，並定義一個 `target_host` 參數。
    **Then** 新的腳本應出現在列表中，並顯示其需要 1 個參數。

2.  **Given** 一台伺服器的磁碟空間告急，我需要立即執行「清理日誌檔案」這個腳本。
    **When** 我在腳本列表中找到它，並點擊「執行」按鈕。在彈出的模態框中，我輸入目標伺服器的 IP 作為參數，然後確認執行。
    **Then** 系統應開始執行該腳本，並在執行完成後更新該腳本的「最後執行時間」和「最後執行狀態」。

3.  **Given** 我想刪除一個已經過時的腳本。
    **When** 我在腳本列表中找到它，點擊「刪除」按鈕，並在確認對話框中進行確認。
    **Then** 該腳本應被從列表中移除。

### 邊界案例（Edge Cases）
- 當使用者嘗試執行一個需要參數但未提供參數的腳本時，系統應在執行模態框中給出明確的錯誤提示，並阻止執行。
- 當使用者嘗試刪除一個腳本時，系統必須彈出一個確認對話框以防止誤刪。
- 如果一個腳本從未被執行過，其「最後執行時間」和「最後執行狀態」欄位應顯示為 "N/A" 或 "從未"。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理自動化腳本（Playbooks）。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有腳本。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯腳本的元數據（如名稱、描述）和腳本內容。
- **FR-004**：系統必須（MUST）提供一個介面，讓使用者可以為腳本定義輸入參數。
- **FR-005**：系統必須（MUST）提供一個手動執行腳本的功能，並在執行前彈出一個模態框讓使用者填寫必要的參數。
- **FR-006**：系統必須（MUST）在表格中展示每個腳本的最後一次執行狀態和執行時間。
- **FR-007**：系統必須（MUST）支援批次刪除、欄位自訂等標準表格操作。
- **FR-008**: 系統必須（MUST）提供一個 `CodeEditor` 介面，讓使用者可以在編輯模態框中直接編寫或貼上腳本內容（如 Bash, Python），該內容將作為字串儲存。
- **FR-009**: 腳本參數的定義必須（MUST）是結構化的，至少包含 `name`, `type` (`string`\|`number`\|`boolean`), `required`, `default_value` 等欄位。
- **FR-010**: `trigger` 欄位僅作為腳本的資訊標籤，用於描述其預期的主要觸發來源，不具備實際的功能性連結。
- **FR-011**: 一個自動化腳本（Playbook）可以被多個觸發器（Triggers）所關聯，實現「一次定義，多處觸發」。
- **FR-012**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AutomationPlaybook** | 核心資料實體，定義了一個自動化腳本的元數據、參數和內容。 | AutomationTrigger[], AutomationHistory |
| **PlaybookParameter** | 腳本所需的一個輸入參數，包含 `name`, `type`, `required`, `default_value` 等欄位。 | AutomationPlaybook |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `automation:playbooks:read` | 允許使用者查看自動化腳本列表。 |
| `automation:playbooks:create` | 允許使用者建立新的腳本。 |
| `automation:playbooks:update` | 允許使用者修改現有腳本的定義（如名稱、描述、內容）。 |
| `automation:playbooks:delete` | 允許使用者刪除腳本。 |
| `automation:playbooks:execute`| 允許使用者手動執行一個腳本。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AutomationPlaybooksPage` 的根元件需由 `<RequirePermission permission="automation:playbooks:read">` 包裹。
- **工具列按鈕**:
  - 「新增腳本」按鈕需具備 `automation:playbooks:create` 權限。
- **批次操作按鈕**:
  - 「刪除」按鈕需具備 `automation:playbooks:delete` 權限。
- **表格內行內操作**:
  - 「執行腳本」按鈕需具備 `automation:playbooks:execute` 權限。
  - 「編輯腳本」按鈕需具備 `automation:playbooks:update` 權限。
  - 「刪除腳本」按鈕需具備 `automation:playbooks:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 後端 API **必須**為所有對腳本的 CUD 操作及每一次執行產生詳細的審計日誌，遵循平台級審計日誌方案。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 前端應透過 OpenTelemetry SDK 自動收集頁面載入性能指標（LCP, FID, CLS）和 API 呼叫遙測（延遲、狀態碼），無需為此模組單獨配置。 |
| RBAC 權限與審計 | ✅ | 系統已定義詳細的前端權限控制模型。詳見上方的「權限控制」章節。 |
| i18n 文案 | ⚠️ | **[PARTIAL VIOLATION: `constitution.md`]** 此頁面已廣泛使用 `useContentSection` hook，是個好的實踐。但程式碼中仍存在後備的硬式編碼字串，例如 `'無法獲取自動化腳本。'`，應將其完全移除並統一由內容管理系統提供。 |
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