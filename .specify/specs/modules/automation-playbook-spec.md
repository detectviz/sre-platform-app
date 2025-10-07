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
    **When** 我在「自動化腳本」頁面點擊「新增腳本」，於彈出的模態框輸入名稱、描述，並貼上 Shell 腳本與一組參數定義。
    **Then** 新的腳本會透過 `/automation/scripts` API 儲存，列表重新載入並顯示腳本類型、參數數量與預設觸發標籤。

2.  **Given** 一台伺服器的磁碟空間告急，我需要立即執行既有腳本。
    **When** 我在腳本列上點擊「執行腳本」，於 `RunPlaybookModal` 內填寫必要參數並送出。
    **Then** UI 會呼叫 `/automation/scripts/{id}/execute` 端點並提示成功；列表重新整理後顯示最新的執行狀態與時間戳。

3.  **Given** 我想調整表格呈現的欄位以便審閱。
    **When** 我開啟「欄位設定」模態並勾選欲顯示的欄位，然後儲存設定。
    **Then** 頁面會透過 `/settings/column-config/{pageKey}` 更新偏好並即時套用新的欄位順序。

### 邊界案例（Edge Cases）
- 當使用者嘗試執行一個需要參數但未提供參數的腳本時，系統應在執行模態框中給出明確的錯誤提示，並阻止執行。
- 當使用者嘗試刪除一個腳本時，系統必須彈出一個確認對話框以防止誤刪。
- 如果一個腳本從未被執行過，其「最後執行時間」和「最後執行狀態」欄位應顯示為 "N/A" 或 "從未"。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：列表頁面必須（MUST）透過 `/automation/scripts` 取得腳本清單，支援分頁、排序與選取列，以提供批次操作與細節檢閱。
- **FR-002**：系統必須（MUST）在表格中顯示腳本名稱、類型、參數數量、最近執行狀態／時間與執行次數，並以 `StatusTag` 呈現狀態樣式。
- **FR-003**：系統必須（MUST）提供 `AutomationPlaybookEditModal` 以建立或編輯腳本，允許調整名稱、描述、類型、腳本內容與參數結構。
- **FR-004**：使用者在編輯模態中必須（MUST）能透過 `CodeEditor` 編輯腳本內容、上傳檔案或使用 AI 產生腳本，並維護參數的型別、預設值、選項與必填設定。
- **FR-005**：系統必須（MUST）提供 `RunPlaybookModal` 讓使用者輸入參數並執行腳本，成功時顯示 toast 並重新整理列表資料。
- **FR-006**：刪除操作必須（MUST）以確認模態確認個別刪除，且支援 `/automation/scripts/batch-actions` 的批次刪除請求。
- **FR-007**：使用者必須（MUST）能開啟欄位設定模態並儲存可見欄位至 `/settings/column-config/{pageKey}`，若後端尚未設定欄位需顯示錯誤訊息。
- **FR-008**：頁面必須（MUST）允許重新排序欄位透過 `SortableColumnHeaderCell`，並使用 `useTableSorting` 產生查詢參數。
- **FR-009**：所有操作按鈕目前（AS-IS）對所有登入使用者可見且可用，前端未實作權限檢查或狀態限制。
- **FR-010**：當 API 呼叫失敗時，系統必須（MUST）透過 toast 呈現錯誤訊息並維持既有視圖；匯入欄位設定缺失時顯示 fallback 字串。
- **FR-011**：所有腳本的建立、更新、刪除與手動執行成功後，後端必須回傳 `auditId` 以記錄操作人與內容，前端需依《common/rbac-observability-audit-governance.md》在成功訊息中顯示該識別碼。
- **FR-012**：列表中的觸發器標籤必須（MUST）連結至 `automation-trigger` 模組並帶入 `triggerId` 查詢參數；若腳本未綁定觸發器則顯示 "未綁定" 並提供快速建立捷徑。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **AutomationPlaybook** | 核心資料實體，定義了一個自動化腳本的元數據、參數和內容。 | AutomationTrigger[], AutomationHistory |
| **PlaybookParameter** | 腳本所需的一個輸入參數，包含 `name`, `type`, `required`, `default_value` 等欄位。 | AutomationPlaybook |

---

## 四、權限控制 (Role-Based Access Control)

根據平台級的 RBAC 設計，此模組原始規格定義了細緻的權限需求；然而目前 MVP 並未套用任何前端守衛。

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `automation:playbooks:read` | 預期用於限制列表與欄位設定存取。 |
| `automation:playbooks:create` | 預期用於控制新增腳本的入口。 |
| `automation:playbooks:update` | 預期用於控制編輯腳本與變更欄位設定。 |
| `automation:playbooks:delete` | 預期用於控制刪除與批次刪除。 |
| `automation:playbooks:execute`| 預期用於控制執行腳本與執行模態。 |

### 4.2. 目前實作現況
- `AutomationPlaybooksPage` 尚未包裹 `<RequirePermission>` 或呼叫 `usePermissions`，所有操作對所有登入者開放。
- 前端僅透過 `/automation/scripts` API 回傳資料，未檢查回傳權限範圍；需要後續決議是否由 API 過濾或於 UI 隱藏操作。
- 權限字串維持於規格作為目標狀態，後續計畫需補上守衛與審計記錄。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/automation/AutomationPlaybooksPage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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

- [RESOLVED - 2025-10-07] 此模組將依《common/rbac-observability-audit-governance.md》導入 `automation:playbooks:*` 守衛與 `<RequirePermission>`，並統一使用 `usePermissions` 控制可視性。
- [RESOLVED - 2025-10-07] 審計軌跡採後端產生 `auditId` 的方案，前端僅需在成功訊息中帶出識別碼並於 API 請求傳遞必要上下文。
- 所有成功與錯誤訊息需改由內容系統提供：前端僅傳遞錯誤碼與 `auditId`，禁止硬寫中文 fallback。