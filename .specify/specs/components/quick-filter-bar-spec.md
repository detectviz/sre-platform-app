# 功能規格書（Feature Specification）

**模組名稱 (Module)**: QuickFilterBar
**類型 (Type)**: Component
**來源路徑 (Source Path)**: `components/QuickFilterBar.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，在瀏覽列表頁面時，我希望能直接在頁面上看到最常用的篩選選項（例如「狀態」或「類型」），並能一鍵點擊進行快速篩選，而不需要每次都打開一個複雜的進階搜尋視窗。我希望這些篩選按鈕能清晰地顯示當前的選中狀態。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在查看一個支援「單選」模式的狀態篩選列，其選項有「全部」、「成功」、「失敗」。
    **When** 我點擊「成功」按鈕。
    **Then** 「成功」按鈕應變為高亮選中狀態，其他按鈕保持未選中狀態，並且 `onChange` 回呼函式必須被觸發，並傳出 `['success']`。

2.  **Given** 我正在查看一個支援「多選」模式的類型篩選列。
    **When** 我先後點擊了「類型 A」和「類型 B」。
    **Then** 「類型 A」和「類型 B」應同時處於高亮選中狀態，並且 `onChange` 回呼函式在第二次點擊後應傳出 `['type-a', 'type-b']`。

3.  **Given** 我正在查看一個單選篩選列，且「成功」按鈕已被選中。
    **When** 我再次點擊「成功」按鈕。
    **Then** 「成功」按鈕應取消選中，恢復為未選中狀態，並且 `onChange` 回呼函式應傳出一個空陣列 `[]`，相當於清除了篩選。

### 邊界案例（Edge Cases）
- 如果傳入的 `options` 陣列為空，元件應顯示一個「目前沒有可用的篩選項目」的提示文字。
- 元件應能同時作為「受控」和「非受控」元件使用。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：元件必須（MUST）將傳入的 `options` 渲染為一組可點擊的篩選按鈕。
- **FR-002**：元件必須（MUST）支援 `single`（單選）和 `multiple`（多選）兩種選擇模式。
- **FR-003**：在 `single` 模式下，再次點擊已選中的選項應取消選擇。
- **FR-004**：元件必須（MUST）能同時作為受控（通過 `value` prop）和非受控（通過 `defaultValue` prop）元件運作。
- **FR-005**：當選項被點擊時，必須（MUST）觸發 `onChange` 回呼函式，並傳出包含所有選中項 `value` 的陣列。
- **FR-006**：每個篩選按鈕可以選擇性地顯示圖示（`icon`）和統計數量（`count`）。
- **FR-007**：元件可以選擇性地在左側顯示一個標籤（`label`）。
- **FR-008**：元件必須（MUST）提供 `syncToUrl` 設定，預設開啟時會將目前選中值同步至共享查詢狀態與 URL Query，並支援個別頁面關閉 URL 序列化但保留共享狀態同步。

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **QuickFilterOption** | 快速篩選按鈕的語義定義，包含值、標籤、圖示與計數。 | UnifiedSearchSchema |
| **QuickFilterState** | 目前已啟用的快速篩選集合，需與進階搜尋狀態協調。 | UnifiedSearchModal |

---

## 四、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `options` | `QuickFilterOption[]` | 是 | 定義所有篩選按鈕的資料陣列。 |
| `mode` | `'single' \| 'multiple'` | 否 | 設定選擇模式。預設為 `'single'`。 |
| `value` | `string[]` | 否 | （受控模式）當前選中的值陣列。 |
| `defaultValue` | `string[]` | 否 | （非受控模式）預設選中的值陣列。 |
| `onChange` | `(value: string[]) => void` | 否 | 當選擇項發生變化時觸發的回呼函式。 |
| `showCount` | `boolean` | 否 | 是否在按鈕上顯示 `count` 數值。預設為 `true`。 |
| `label` | `React.ReactNode` | 否 | 顯示在篩選列左側的標籤。 |
| `className` | `string` | 否 | 附加到主容器上的額外 CSS class。 |
| `emptyText` | `string` | 否 | 當 `options` 為空時顯示的提示文字。 |
| `syncToUrl` | `boolean` | 否 | 是否將目前選中值序列化至 URL Query。預設為 `true`。 |

---

## 五、關聯模組（Associated Modules）

此元件通常用於提供主要篩選維度的快速存取，是對 `UnifiedSearchModal` 的補充。
- `AutomationHistoryPage`
- `NotificationHistoryPage`
- `TagManagementPage`
- ... 以及其他需要快速篩選功能的列表頁。

---

## 六、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 快速篩選變更需與進階搜尋共用遙測欄位，以追蹤常用條件與轉換。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 透過平台遙測監控篩選 API 失敗率與回應時間。 |
| RBAC 權限與審計 | ✅ | 篩選為查詢行為，仍需保留與模組審計記錄的關聯識別。 |
| i18n 文案 | ✅ | 選項標籤與提示文字必須源自內容字典或後端設定。 |
| Theme Token 使用 | ✅ | 按鈕樣式與狀態顏色需沿用設計系統提供的 token。 |

---

## 七、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 八、模糊與待確認事項（Clarifications）

- 快速篩選與進階搜尋使用共享狀態容器；當任何快速篩選值變更時，必須立即反映於進階搜尋表單並觸發共用查詢更新事件。
- 篩選狀態需透過 `syncToUrl` 設定控制：預設開啟時會將目前快速篩選值序列化到 URL Query，頁面重新整理或分享連結時需還原；若個別頁面關閉此設定，仍須保留與進階搜尋的同步但不寫入 URL。