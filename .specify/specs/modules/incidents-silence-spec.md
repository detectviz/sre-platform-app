# 功能規格書（Feature Specification）

**模組名稱 (Module)**: incidents-silence
**類型 (Type)**: Module
**來源路徑 (Source Path)**: `pages/incidents/SilenceRulePage.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名 SRE 或系統維運人員，在進行計劃性維護或處理已知問題時，我需要能夠建立「靜音規則」來暫時抑制相關的告警，以避免不必要的告警風暴並減少團隊干擾。我希望能方便地管理這些規則，包括設定其生效時間、匹配條件，並能在需要時快速延長一個即將到期的臨時靜音。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我即將進行資料庫升級。
    **When** 我點擊「新增規則」，建立一條匹配特定資料庫資源的靜音規則，並設定其生效時間為接下來的 2 小時。
    **Then** 新的規則應被儲存，並顯示在列表中。

2.  **Given** 一個臨時的靜音規則即將到期，但相關問題尚未完全解決。
    **When** 我在該規則列點擊「延長」按鈕，在彈出的模態框中選擇或輸入延長的時間。
    **Then** 該規則的結束時間應被更新。

3.  **Given** 我需要清理所有已過期且不再需要的靜音規則。
    **When** 我使用篩選器找到所有狀態為「已過期」的規則，將它們全部選中，然後點擊批次「刪除」按鈕。
    **Then** 所有選中的過期規則都應被從系統中移除。

### 邊界案例（Edge Cases）
- 當使用者嘗試延長一個「週期性」的靜音規則時，系統應提示此類規則需透過編輯排程來修改。
- 當使用者在「延長靜音」模態框中輸入無效的時間（如 0 或負數）時，系統應給出錯誤提示。
- 當 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理靜音規則。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有靜音規則。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯靜音規則，包括其名稱、匹配器和排程。
- **FR-004**：系統必須（MUST）為「單次」類型的有效靜音規則提供一個快速「延長」時間的功能。
- **FR-005**：系統必須（MUST）允許使用者單獨或批次地啟用/停用靜音規則。
- **FR-006**：系統必須（MUST）支援批次刪除選定的靜音規則。
- **FR-007**：系統必須（MUST）提供進階篩選、欄位自訂、匯入/匯出功能。
- **FR-008**：系統必須（MUST）能夠對選中的規則觸發 AI 分析，並在模態框中展示報告。
- **FR-009**：後端 API 回傳的 `SilenceRule` 物件中，**必須**包含一個 `status` 欄位（如：`active`, `expired`），前端應直接使用此欄位來顯示狀態。
- **FR-010**：所有 UI 文字（包括 Toast 通知）**必須**使用 i18n Key 進行渲染。
- **FR-011**：所有 UI 元件的顏色**必須**使用語義化的 Theme Token。
- **FR-012**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。

---

## 三、關鍵資料實體（Key Entities）
| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| **SilenceRule** | 核心資料實體，定義了抑制告警的條件與時間排程。 | Incident |
| **Matcher** | 靜音規則的一部分，定義了匹配告警的具體條件（key, operator, value）。 | SilenceRule |
| **Schedule** | 靜音規則的一部分，定義了其生效的時間範圍（單次或週期性）。 | SilenceRule |
| **RuleAnalysisReport** | AI 對靜音規則進行分析後產生的報告。 | SilenceRule |

---

## 四、權限控制 (Role-Based Access Control)

### 4.1. 權限定義 (Permissions)
| 權限字串 | 描述 |
|---|---|
| `silence-rules:read` | 允許使用者查看靜音規則列表。 |
| `silence-rules:create` | 允許使用者建立新的靜音規則。 |
| `silence-rules:update` | 允許使用者修改現有的靜音規則（包括編輯、延長、啟用/停用）。 |
| `silence-rules:delete` | 允許使用者刪除靜音規則。 |
| `silence-rules:analyze` | 允許使用者觸發「AI 分析」功能。 |
| `silence-rules:config` | 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。 |

### 4.2. UI 控制映射 (UI Mapping)
- **頁面存取**: `SilenceRulePage` 的根元件需由 `<RequirePermission permission="silence-rules:read">` 包裹。
- **工具列按鈕**:
  - 「新增規則」按鈕需具備 `silence-rules:create` 權限。
  - 「匯入」、「匯出」、「欄位設定」按鈕均需具備 `silence-rules:config` 權限。
- **批次操作按鈕**:
  - 「AI 分析」按鈕需具備 `silence-rules:analyze` 權限。
  - 「啟用」、「停用」按鈕需具備 `silence-rules:update` 權限。
  - 「刪除」按鈕需具備 `silence-rules:delete` 權限。
- **表格內行內操作**:
  - 「延長」、「編輯」按鈕需具備 `silence-rules:update` 權限。
  - 行內的「啟用/停用」開關需具備 `silence-rules:update` 權限。
  - 「刪除」按鈕需具備 `silence-rules:delete` 權限。

---

## 五、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 所有 CUD 操作均需產生包含操作上下文的審計日誌。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 應上報與靜音規則建立、啟用/停用相關的指標。 |
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