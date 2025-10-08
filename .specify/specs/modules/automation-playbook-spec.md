# 功能規格書（Feature Specification）

**模組名稱 (Module)**: automation-playbook
**類型 (Type)**: Module
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或維運工程師，我需要一個地方來集中管理和維護我們所有可重複使用的自動化腳本（Playbooks），例如「重啟服務」、「清理日誌檔案」或「擴展資料庫容量」。我希望能方便地新增、編輯這些腳本，並在需要時能手動觸發它們，輸入必要的參數來執行一次性的維運任務。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我需要建立一個用於清理磁碟空間的新腳本。
    **When** 我在「自動化腳本」頁面點擊「新增腳本」，於彈出的模態框輸入名稱、描述，並貼上 Shell 腳本與一組參數定義。
    **Then** 新的腳本應被儲存，且列表重新載入後會顯示這個新腳本。

2.  **Given** 一台伺服器的磁碟空間告急，我需要立即執行既有腳本。
    **When** 我在腳本列上點擊「執行腳本」，於 `RunPlaybookModal` 內填寫必要參數並送出。
    **Then** 腳本應被執行，UI 會提示成功，且列表重新整理後顯示最新的執行狀態與時間戳。

3.  **Given** 我想一次刪除多個過時的腳本。
    **When** 我在表格中勾選多個腳本，並點擊出現的「刪除」批次操作按鈕。
    **Then** 所有被選中的腳本都應被刪除。

### 邊界案例（Edge Cases）
- 當使用者嘗試執行一個需要參數但未提供參數的腳本時，系統應在執行模態框中給出明確的錯誤提示，並阻止執行。
- 當使用者嘗試刪除一個腳本時，系統必須彈出一個確認對話框以防止誤刪。
- 如果一個腳本從未被執行過，其「最後執行時間」和「最後執行狀態」欄位應顯示為 "從未" 或 "--"。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理自動化腳本，並支援分頁、排序和批次操作。
- **FR-002**：系統必須（MUST）在表格中顯示腳本的複合資訊，包括：名稱、描述、腳本類型標籤、參數數量標籤、最近執行狀態和時間等。
- **FR-003**：使用者必須（MUST）能透過 `AutomationPlaybookEditModal` 和 `RunPlaybookModal` 進行腳本的編輯與執行。
- **FR-004**：列表中的觸發器標籤必須（MUST）是可互動的連結，能導航至觸發器管理頁面並應用篩選。
- **FR-005**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-006**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token，禁止直接使用 Tailwind 色票或自訂 class。
- **FR-007**：所有 state-changing 操作（建立、更新、刪除、執行）成功後，後端**必須**回傳 `auditId`，前端需在提示訊息中顯示此 ID 以利追蹤。
- **FR-008**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AutomationPlaybook** | 核心資料實體，定義了一個自動化腳本的元數據、參數和內容。 | AutomationTrigger[], AutomationHistory |
| **PlaybookParameter** | 腳本所需的一個輸入參數，包含 `name`, `type`, `required`, `default_value` 等欄位。 | AutomationPlaybook |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `automation:playbooks:read` | 允許使用者查看腳本列表與詳情。 |
| `automation:playbooks:create` | 允許使用者建立新腳本。 |
| `automation:playbooks:update` | 允許使用者修改腳本。 |
| `automation:playbooks:delete` | 允許使用者刪除腳本。 |
| `automation:playbooks:execute`| 允許使用者執行腳本。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `AutomationPlaybooksPage` 的根元件需由 `<RequirePermission permission="automation:playbooks:read">` 包裹。
- **工具列按鈕**: 「新增腳本」按鈕需具備 `automation:playbooks:create` 權限。
- **表格內行內操作**: 所有操作（如編輯、執行、刪除）均需根據對應的權限 (`update`, `execute`, `delete`) 進行渲染。
- **批次操作**: 所有批次操作均需根據對應的權限進行渲染。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD（建立、更新、刪除）和執行操作，都必須產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與腳本執行成功率、失敗率、平均執行時間相關的指標。 |
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