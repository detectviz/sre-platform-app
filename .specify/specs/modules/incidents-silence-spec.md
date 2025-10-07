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
    **Then** 在此期間，所有符合該匹配條件的告警都不會生成新的事件。

2.  **Given** 一個臨時的靜音規則即將到期，但相關問題尚未完全解決。
    **When** 我在該規則列點擊「延長」按鈕，並選擇延長 1 小時。
    **Then** 該規則的結束時間應被更新，以確保告警繼續被抑制。

3.  **Given** 我需要清理所有已過期且不再需要的靜音規則。
    **When** 我使用篩選器找到所有狀態為「已過期」的規則，將它們全部選中，然後點擊批次「刪除」按鈕。
    **Then** 所有選中的過期規則都應被從系統中移除。

### 邊界案例（Edge Cases）
- 當使用者嘗試延長一個「週期性」的靜音規則時，系統應提示此類規則需透過編輯排程來修改，而非使用快速延長功能。
- 當使用者在「延長靜音」模態框中輸入無效的時間（如 0 或負數）時，系統應給出錯誤提示。
- 當 API 請求失敗時，表格區域應顯示錯誤訊息及「重試」按鈕。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：系統必須（MUST）提供一個完整的 CRUD 介面來管理靜音規則。
- **FR-002**：系統必須（MUST）在一個可分頁、可排序的表格中展示所有靜音規則。
- **FR-003**：系統必須（MUST）允許使用者透過一個模態框來新增或編輯靜音規則，包括定義名稱、匹配器（Matchers）和排程（Schedule）。
- **FR-004**：系統必須（MUST）支援兩種排程類型：單次（有起訖時間）和週期性（基於 CRON 表達式）。
- **FR-005**：系統必須（MUST）為「單次」類型的有效靜音規則提供一個快速「延長」時間的功能。
- **FR-006**：系統必須（MUST）允許使用者單獨或批次地啟用/停用靜音規則。
- **FR-007**：系統必須（MUST）支援批次刪除選定的靜音規則。
- **FR-008**：系統必須（MUST）提供一個統一的搜尋模態框，允許使用者基於多個維度（如：關鍵字、狀態、類型）篩選規則。
- **FR-009**：系統必須（MUST）允許使用者自訂表格顯示的欄位，並保存其設定。
- **FR-010**：系統必須（MUST）提供從 CSV 檔案匯入及將規則匯出為 CSV 檔案的功能。
- **FR-011**：系統必須（MUST）能夠對選中的規則觸發 AI 分析，並在模態框中展示分析報告。
- **FR-012**：系統應該（SHOULD）在表格中清晰地展示每條規則的狀態（啟用/停用、有效/已過期）、類型、匹配條件和排程資訊。
- **FR-013**: 後端 API 回傳的 `SilenceRule` 物件中，**必須**包含一個 `status` 欄位（其值如：`active`, `expiring_soon`, `expired`），前端直接使用此欄位來顯示狀態，不應自行計算。
- **FR-014**: 系統必須（MUST）從後端 API 或 `options` hook 獲取所有可用的匹配器運算子（Matcher Operators）列表，並在編輯模態框中動態生成對應的選項。
- **FR-015**：系統必須（MUST）根據使用者的權限，動態顯示或禁用對應的操作介面。詳細的權限對應關係請參閱下方的「權限控制」章節。
- **FR-016**: 編輯模態框中的匹配器（Matchers）設定介面**必須**為一個結構化的條件產生器。對於每一條匹配條件，使用者應能輸入「欄位名 (key)」、從動態列表中選擇「運算子 (operator)」，並輸入「值 (value)」。

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

根據平台級的 RBAC 設計，此模組的 UI 應根據後端提供的權限列表進行動態渲染。

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
| 記錄與追蹤 (Logging/Tracing) | ❌ | `pages/incidents/SilenceRulePage.tsx` 未串接遙測或審計 API，僅以本地狀態與 toast 呈現結果。 |
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