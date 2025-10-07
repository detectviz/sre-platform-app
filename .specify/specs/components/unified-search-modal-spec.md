# 功能規格書（Feature Specification）

**模組名稱 (Module)**: UnifiedSearchModal
**類型 (Type)**: Component
**來源路徑 (Source Path)**: `components/UnifiedSearchModal.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，當我需要在任何一個列表頁面進行複雜的資料篩選時，我希望能有一個功能強大且體驗一致的進階搜尋介面。我希望點擊「搜尋」按鈕後，能彈出一個針對當前頁面內容的、包含多個篩選條件的表單，讓我可以精確地定位到我需要的資料。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在「事件列表」頁面。
    **When** 我點擊工具列上的「搜尋和篩選」按鈕。
    **Then** 系統必須彈出一個模態框，其中包含專門用於篩選**事件**的欄位，例如「狀態」、「嚴重性」和「指派人」。

2.  **Given** 我正在「審計日誌」頁面。
    **When** 我點擊工具列上的「檢索和篩選」按鈕。
    **Then** 系統必須彈出同一個模態框，但其內容應變為專門用於篩選**審計日誌**的欄位，例如「操作人員」、「動作類型」和「時間範圍」。

3.  **Given** 我在搜尋模態框中設定了多個篩選條件。
    **When** 我點擊模態框右下角的「搜尋」按鈕。
    **Then** `onSearch` 回呼函式必須被觸發，並傳出一個包含我所設定的所有篩選條件的物件，同時模態框應自動關閉。

### 邊界案例（Edge Cases）
- 如果 `useOptions` hook 尚未載入完成，模態框應顯示一個載入中狀態，而不是顯示空的下拉選單。
- 如果為某個 `page` 傳入了 `initialFilters`，模態框打開時應正確地預先填寫這些篩選條件。
- 點擊「清除篩選」按鈕應能將表單內所有欄位重設為空值。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：元件必須（MUST）是一個模態框（Modal）對話方塊。
- **FR-002**：元件必須（MUST）接受一個 `page` 屬性，並根據此屬性的值，動態地渲染出對應的篩選表單。
- **FR-003**：元件必須（MUST）為不同的 `page` 提供不同的、上下文感知的篩選欄位集合。
- **FR-004**：元件必須（MUST）從 `useOptions` hook 或其他 API 獲取篩選欄位的下拉選單選項，以確保選項的中心化管理。
- **FR-005**：當使用者確認搜尋時，元件必須（MUST）透過 `onSearch` 回呼函式將當前的篩選條件物件傳遞給父元件。
- **FR-006**：元件必須（MUST）提供一個「清除篩選」按鈕，用於重設當前模態框內的篩選條件。
- **FR-007**：元件必須（MUST）改採可注入的 `FilterSchema` 設計，透過外部註冊表（例如 `registerFilterSchema(page, schema)`）載入欄位設定，不得在元件內硬寫 `render...Filters`。
- **FR-008**：元件必須（MUST）支援布林邏輯（AND/OR/NOT）與群組條件，並透過結構化輸出（`{ clauses: Array<{ operator: 'AND'|'OR', conditions: [...] }>, not: [...] }`）回傳，以供後端解析。

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **FilterSchema** | 定義特定頁面的篩選欄位結構與型別，建議以 JSON Schema 或等級相當的設定描述。 | TableDesignSystem |
| **SearchFormState** | 模態框目前所有篩選欄位的值集合。 | 各模組查詢 API |

---

## 四、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `page` | `string` | 是 | 指定當前頁面的標識符，用於決定渲染哪一套篩選欄位。 |
| `isOpen` | `boolean` | 是 | 控制模態框的開啟或關閉狀態。 |
| `onClose` | `() => void` | 是 | 當使用者請求關閉模態框時觸發的回呼函式。 |
| `onSearch` | `(filters: Filters) => void`| 是 | 當使用者點擊「搜尋」按鈕時觸發的回呼函式，傳出最終的篩選條件物件。 |
| `initialFilters` | `Filters` | 是 | 用於初始化模態框內表單的篩選條件。 |
| `schema` | `FilterSchema` | 否 | 覆寫外部註冊表的欄位定義，常用於動態頁面。 |
| `allowedOperators` | `Array<'AND' \| 'OR' \| 'NOT'>` | 否 | 限制可用的布林運算子，預設啟用全部。 |

---

## 五、關聯模組（Associated Modules）

此元件是平台級的搜尋解決方案，被絕大多數的管理和列表頁面所使用，是確保篩選體驗一致性的核心。
- 所有 `...ListPage.tsx` 頁面
- 所有 `...HistoryPage.tsx` 頁面
- 所有 `...ManagementPage.tsx` 頁面

---

## 六、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 搜尋提交與清除行為需記錄在模組審計中，並標示篩選條件摘要。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 需透過遙測觀察搜尋提交成功率與 API 延遲。 |
| RBAC 權限與審計 | ✅ | 搜尋屬於查詢操作，仍須與模組權限及審計策略對齊。 |
| i18n 文案 | ✅ | 篩選欄位標籤與說明須透過內容字典或 schema 提供。 |
| Theme Token 使用 | ✅ | 模態框樣式與欄位間距需沿用設計系統。 |

---

## 七、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 八、模糊與待確認事項（Clarifications）

- 篩選欄位由外部註冊表或 `schema` prop 提供，支援 JSON Schema 風格定義，禁止在元件內硬寫欄位渲染函式。
- 進階搜尋已納入 AND/OR/NOT 布林邏輯，UI 需支援條件群組化與否定（NOT）標記，回傳結構化條件以利後端解析。