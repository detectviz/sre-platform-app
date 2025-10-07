# 功能規格書（Feature Specification）

**模組名稱 (Module)**: Toolbar
**類型 (Type)**: Component
**來源路徑 (Source Path)**: `components/Toolbar.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，我希望在所有列表和管理頁面上都能看到一個位置固定、外觀和行為一致的工具列。這個工具列應該能提供當前頁面的核心操作（如新增、篩選）。當我選中列表中的項目時，我希望工具列能自動切換為批次操作模式，提供針對所選項目的操作（如批次刪除），並清晰地告訴我選中了多少項目。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看一個列表頁面。
    **When** 我沒有選中任何項目。
    **Then** 工具列應顯示標準的左側和右側操作按鈕（例如「搜尋」和「新增」）。

2.  **Given** 我在列表中勾選了 5 個項目。
    **When** `Toolbar` 元件的 `selectedCount` 屬性更新為 5。
    **Then** 工具列必須自動切換為批次操作模式，顯示「已選擇 5 個項目」的訊息，並提供一組新的批次操作按鈕（例如「批次刪除」）。

3.  **Given** 我正處於批次操作模式。
    **When** 我點擊「清除選擇」按鈕（'X' 圖示）。
    **Then** `onClearSelection` 回呼函式必須被觸發，`selectedCount` 應變為 0，且工具列必須恢復到標準模式。

### 邊界案例（Edge Cases）
- 如果 `selectedCount` 大於 0，但沒有提供 `onClearSelection` 或 `batchActions` 屬性，工具列應保持在標準模式，以避免出現不完整的 UI。
- `ToolbarButton` 在被禁用 (disabled) 時，應有明顯的視覺變化且不可點擊。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：元件必須（MUST）提供一個標準的工具列佈局，分為左側操作區和右側操作區。
- **FR-002**：元件必須（MUST）支援「批次操作模式」。當 `selectedCount` 屬性大於 0 時，自動切換到此模式。
- **FR-003**：在批次操作模式下，元件必須（MUST）顯示已選中的項目數量，並提供一個用於清除選擇的按鈕。
- **FR-004**：元件必須（MUST）匯出一個名為 `ToolbarButton` 的子元件，用於在工具列中建立帶有圖示和文字的標準化按鈕。
- **FR-005**：`ToolbarButton` 必須（MUST）支援多種視覺樣式，至少包括 `primary`（主要操作）、`danger`（危險操作）和 `ai`（AI 功能）。
- **FR-006**：元件應使用 `useContent` hook 來獲取國際化的 UI 字串，例如「已選擇 {count} 個項目」。
- **FR-007**：元件必須（MUST）支援權限態顯示策略：預設隱藏未授權操作，若父層傳入 `showDisabledFor` 名稱陣列，則需顯示禁用狀態並附上由父層提供的 Tooltip 文案。
- **FR-008**：當視窗寬度小於 992px 時，元件必須（MUST）自動將非主要操作折疊至「更多」選單，僅保留最多兩個主要按鈕在工具列上。

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **ToolbarState** | 代表工具列當前呈現的模式與狀態，涵蓋標準模式與批次操作模式的切換。 | 列表頁面的選取狀態 |
| **ToolbarAction** | 抽象化的操作描述，包含主操作、批次操作與 AI 操作等語義。 | ToolbarButton |

---

## 四、可配置屬性（Props）

### Toolbar Props
| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `leftActions` | `React.ReactNode` | 否 | 顯示在工具列左側的內容。 |
| `rightActions` | `React.ReactNode` | 否 | 顯示在工具列右側的內容。 |
| `selectedCount` | `number` | 否 | 當前選中的項目數量。預設為 0。 |
| `onClearSelection`| `() => void` | 否 | 清除選擇時觸發的回呼函式。 |
| `batchActions` | `React.ReactNode` | 否 | 在批次操作模式下顯示的內容。 |
| `showDisabledFor` | `string[]` | 否 | 指定仍需顯示為禁用狀態的操作鍵值。 |
| `moreMenuLabel` | `string` | 否 | 小螢幕折疊後顯示於「更多」選單的標籤文案。預設取自內容字典。 |

### ToolbarButton Props
| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `icon` | `string` | 是 | 按鈕上顯示的圖示名稱。 |
| `text` | `string` | 是 | 按鈕的文字標籤。 |
| `primary` | `boolean` | 否 | 是否為主要按鈕樣式。 |
| `danger` | `boolean` | 否 | 是否為危險操作按鈕樣式。 |
| `ai` | `boolean` | 否 | 是否為 AI 功能按鈕樣式。 |
| `...props` | `ButtonHTMLAttributes` | 否 | 其他所有標準 HTML button 屬性（如 `onClick`, `disabled`）。 |

---

## 五、關聯模組（Associated Modules）

此元件為高度可重用的基礎元件，幾乎被所有包含列表的管理頁面所使用，包括：
- `incidents-list`
- `incidents-alert`
- `incidents-silence`
- `resources-group`
- `resources-list`
- `automation-playbook`
- `automation-trigger`
- `identity-personnel`
- ... 以及其他所有列表頁。

---

## 六、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 操作按鈕的觸發事件應透過父層模組的遙測紀錄（例如 `onActionClick`），以便回溯使用者操作。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 透過平台統一的 OpenTelemetry 設定收集互動耗時與錯誤率，無需為元件額外定義。 |
| RBAC 權限與審計 | ✅ | 預設隱藏未授權操作；如父層要求顯示禁用狀態，需搭配內容字典提供的 Tooltip 並沿用模組審計紀錄。 |
| i18n 文案 | ✅ | 按鈕標籤必須由父層透過 `useContent` 提供，不得硬寫字串。 |
| Theme Token 使用 | ✅ | 需沿用設計系統提供的語義色票與尺寸，不得覆寫 CSS。 |

---

## 七、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 八、模糊與待確認事項（Clarifications）

- [RESOLVED - 2025-10-07] 依《common/rbac-observability-audit-governance.md》，無權限按鈕預設不渲染；如需顯示 disabled 並搭配 Tooltip，須於各模組規格額外註明。]
- 小螢幕（< 992px）時採用折疊式「更多」選單模式，僅保留最多兩個主要操作顯示於工具列，其餘操作收合並透過 `moreMenuLabel` 提供存取。