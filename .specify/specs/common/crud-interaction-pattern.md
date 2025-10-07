# 功能規格書（Feature Specification）

**模組名稱 (Module)**: CRUD Interaction Pattern
**類型 (Type)**: Common
**來源路徑 (Source Path)**: `pages/incidents/AlertRulePage.tsx`, `pages/settings/identity-access/PersonnelManagementPage.tsx`, etc.
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，我期望在平台上管理不同類型的資源（如告警規則、使用者、通知管道）時，能有一套一致且可預測的操作流程。無論我管理的是什麼資源，新增、編輯、刪除和搜尋的操作方式都應該是相同的，這樣我就不需要為每個頁面重新學習如何使用。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我在任何一個資源管理頁面。
    **When** 我點擊工具列上的「新增」按鈕。
    **Then** 系統必須彈出一個用於建立該資源的模態框。

2.  **Given** 我在任何一個資源列表的某一行上。
    **When** 我點擊該行的「刪除」按鈕。
    **Then** 系統必須彈出一個標準的確認對話框，詢問我是否確定要刪除。

3.  **Given** 我在任何一個資源列表中勾選了多個項目。
    **When** 我查看工具列。
    **Then** 工具列必須切換到批次操作模式，並提供「批次刪除」等相關操作。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：所有 CRUD 頁面必須（MUST）提供一個包含建立、讀取、更新和刪除功能的完整生命週期管理介面。
- **FR-002**：**建立 (Create)** 操作必須（MUST）透過點擊工具列上的「新增」按鈕來觸發，並在一個模態框中完成。
- **FR-003**：**讀取 (Read)** 操作必須（MUST）在一個遵循 `table-design-system.md` 規範的標準化表格中展示資源列表。
- **FR-004**：**更新 (Update)** 操作必須（MUST）透過點擊表格行中的「編輯」按鈕來觸發，並應盡可能複用與「建立」操作相同的模態框。
- **FR-005**：**刪除 (Delete)** 操作必須（MUST）在點擊後彈出一個標準的確認模態框，以防止使用者誤操作。
- **FR-006**：所有 CRUD 頁面應該（SHOULD）支援對列表項目的批次操作，特別是批次刪除。
- **FR-007**：所有 CRUD 頁面應該（SHOULD）使用 `UnifiedSearchModal` 提供統一的進階搜尋和篩選功能。
- **FR-008**：在新增項目成功後，列表應自動刷新，並且如果使用者不在第一頁，應考慮跳轉回第一頁以顯示新項目。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **Toolbar** | 提供「新增」和「篩選」等主要操作的入口。 | - |
| **TableContainer** | 承載列表資料的標準容器。 | - |
| **...EditModal** | 用於建立和編輯資源的標準模態框。 | - |
| **Modal (for Delete)** | 用於刪除確認的標準模態框。 | - |
| **UnifiedSearchModal** | 用於進階搜尋和篩選的標準模態框。 | - |

---

## 四、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CRUD 操作都應在後端產生詳細的審計日誌。此要求應在具體的模組級規格中被再次強調。 |
| 指標與告警 (Metrics & Alerts) | ⚠️ | 已採納《common/rbac-observability-audit-governance.md》，需以 API 攔截器上報延遲、成功率與 requestId，並建立儀表板追蹤。 |
| RBAC 權限與審計 | ✅ | 對 CRUD 的權限控制應在每個具體的模組中根據業務需求進行定義，並在後端強制執行。 |
| i18n 文案 | ✅ | 所有構成此模式的共享元件都應使用 `useContent` hook 獲取文案。 |
| Theme Token 使用 | ✅ | 所有構成此模式的共享元件都應遵循 `constitution.md` 的主題和樣式規範。 |

---

## 五、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項（Clarifications）

- [RESOLVED - 2025-10-07] CRUD 操作採「先等待 API 成功再刷新」策略，僅對具立即回饋需求的操作於模組層另行定義；若要顯示暫存結果，須於模組規格明載樂觀更新規則。
- [RESOLVED - 2025-10-07] 當 CRUD 操作失敗時，需同時顯示全域 Toast 與欄位錯誤（若適用），Toast 中應包含 requestId 或 auditId 以便追蹤；錯誤訊息來源統一交由內容系統管理。