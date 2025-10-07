# 功能規格書（Feature Specification）

**模組名稱 (Module)**: TableContainer
**類型 (Type)**: Component
**來源路徑 (Source Path)**: `components/TableContainer.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名開發者，我希望在建立新的列表頁面時，能夠輕鬆地實現平台統一的表格佈局，而無需手動編寫重複的 CSS 或 HTML 結構。我希望能有一個容器元件，它能自動處理好表格的滾動行為和頁腳（如分頁控制項）的固定佈局，讓我能專注於表格本身的內容和邏輯。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在建立一個新的列表頁面。
    **When** 我將我的 `<table>` 元件和 `<Pagination>` 元件作為子項放入 `TableContainer` 中。
    **Then** 頁面應正確渲染出一個帶有滾動條的表格區域和一個固定在底部的頁腳區域，且兩者之間有標準的間距。

2.  **Given** 我有一個自訂的表格元件，它內部已經處理了滾動。
    **When** 我將這個自訂元件傳遞給 `TableContainer`。
    **Then** `TableContainer` 應能識別出我的元件已具備滾動容器，並避免添加額外的滾動層，防止出現雙重滾動條。

### 邊界案例（Edge Cases）
- 如果只向 `TableContainer` 提供一個子元件（表格），則頁腳區域不應被渲染。
- 如果不向 `TableContainer` 提供任何子元件，它應能優雅地處理，顯示為一個空的容器。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：元件必須（MUST）提供一個標準化的容器，用於包裹表格及其相關的頁腳元件。
- **FR-002**：容器必須（MUST）包含一個主要內容區域和一個頁腳區域。
- **FR-003**：主要內容區域必須（MUST）在內容超出時提供垂直滾動條。
- **FR-004**：頁腳區域必須（MUST）固定在容器底部。
- **FR-005**：元件必須（MUST）能接受 `table` 和 `footer` 屬性來分別定義其內容。
- **FR-006**：元件必須（MUST）支援將子元件（children）作為內容，並將第一個子元件視為表格，其餘子元件視為頁腳。
- **FR-007**：元件應該（SHOULD）能智慧判斷傳入的表格是否已包含滾動容器，以避免重複包裹。
- **FR-008**：元件必須（MUST）支援自適應高度，預設透過 `ResizeObserver` 將表格內容高度調整為 `viewportHeight - viewportOffset`，並允許透過 `viewportOffset` prop 調整預設 240px 的保留空間。
- **FR-009**：當渲染資料筆數超過 `virtualizationThreshold`（預設 200 筆）時，需透過 `TableDesignSystem` 提供的虛擬滾動策略包裹表格內容，並將閾值以 prop 形式允許各頁調整。

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **TableShell** | 表格容器的結構描述，包含滾動區域與頁腳。 | TableDesignSystem |
| **TableViewportPreference** | 表格高度與滾動行為的配置偏好。 | LayoutSettings |

---

## 四、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `table` | `React.ReactNode` | 否 | 明確指定表格內容。 |
| `footer` | `React.ReactNode` | 否 | 明確指定頁腳內容。 |
| `className` | `string` | 否 | 附加到主容器上的額外 CSS class。 |
| `children` | `React.ReactNode` | 否 | 另一種提供內容的方式，第一個子項為表格，其餘為頁腳。 |
| `viewportOffset` | `number` | 否 | 自適應高度計算時保留的像素值，預設為 `240`。 |
| `virtualizationThreshold` | `number` | 否 | 觸發虛擬滾動的資料筆數門檻，預設為 `200`。 |

---

## 五、關聯模組（Associated Modules）

此元件為平台級的基礎佈局元件，被所有包含資料表格的模組頁面使用，是構成 `table-design-system` 的基石。它通常與以下元件組合使用：
- `Pagination` (作為 footer)
- `TableLoader` (作為 table 內容)
- `TableError` (作為 table 內容)
- 所有列表頁面 (`...ListPage.tsx`)。

---

## 六、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 表格呈現狀態與滾動互動應交由各模組的遙測紀錄，以評估資料量與載入時間。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 透過平台遙測監控大表格渲染耗時與錯誤率。 |
| RBAC 權限與審計 | ✅ | 容器本身不處理權限，但需確保內嵌操作沿用模組權限。 |
| i18n 文案 | ✅ | 提示文字與空狀態需由內容字典提供。 |
| Theme Token 使用 | ✅ | 邊距、背景與滾動條樣式需沿用設計系統 token。 |

---

## 七、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 八、模糊與待確認事項（Clarifications）

- 表格高度採用自適應策略，透過 `ResizeObserver` 計算 `viewportHeight - viewportOffset (240px)`，並允許頁面視情況調整 offset。
- 當資料筆數超過 200 筆（可透過 `virtualizationThreshold` 調整）時必須啟用 `TableDesignSystem` 指定的虛擬滾動容器，以確保效能與可用性。