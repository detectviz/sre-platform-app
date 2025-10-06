# 功能規格書（Feature Specification）

**模組名稱 (Module)**: Pagination
**類型 (Type)**: Component
**來源路徑 (Source Path)**: `components/Pagination.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名在瀏覽長列表的使用者，當資料無法在一頁內完全顯示時，我需要一個清晰的分頁控制項。我希望能看到目前的總項目數、我正在查看的是第幾頁，並且能夠輕鬆地跳轉到前一頁或後一頁，以及調整每頁顯示的項目數量以符合我的瀏覽習慣。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我正在一個有 100 個項目的列表頁，目前在第 1 頁，每頁顯示 10 項。
    **When** 我點擊「下一頁」按鈕。
    **Then** `onPageChange(2)` 回呼函式必須被觸發，父元件應更新狀態，使 Pagination 元件顯示為第 2 頁，且文字更新為「第 11-20 項, 共 100 項」。

2.  **Given** 我覺得每頁顯示 10 項太少。
    **When** 我點擊每頁數量的下拉選單，並選擇「50 / 頁」。
    **Then** `onPageSizeChange(50)` 回呼函式必須被觸發，父元件應更新狀態並重新獲取資料。

3.  **Given** 我目前在列表的第一頁。
    **When** 我查看分頁控制項。
    **Then** 「上一頁」按鈕必須處於禁用（disabled）狀態且不可點擊。

### 邊界案例（Edge Cases）
- 當總項目數 (`total`) 為 0 時，元件應顯示「第 0-0 項, 共 0 項」。
- 當總頁數只有一頁時，「上一頁」和「下一頁」按鈕都應被禁用。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：元件必須（MUST）顯示當前顯示的項目範圍和總項目數（例如，「第 1-10 項, 共 100 項」）。
- **FR-002**：元件必須（MUST）提供「上一頁」和「下一頁」的按鈕，用於頁面導航。
- **FR-003**：當處於第一頁或最後一頁時，對應的導航按鈕必須（MUST）被禁用。
- **FR-004**：元件必須（MUST）提供一個下拉選單，允許使用者更改每頁顯示的項目數量（`pageSize`）。
- **FR-005**：元件必須（MUST）是一個完全的「受控元件」，其所有狀態（`page`, `pageSize`）由 props 決定，所有變更透過回呼函式（`onPageChange`, `onPageSizeChange`）通知父元件。
- **FR-006**：下拉選單必須（MUST）提供 10、20、50 作為可選項。

---

## 三、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `total` | `number` | 是 | 所有頁面的總項目數量。 |
| `page` | `number` | 是 | 當前顯示的頁碼（1-based）。 |
| `pageSize` | `number` | 是 | 每頁顯示的項目數量。 |
| `onPageChange` | `(page: number) => void` | 是 | 當使用者點擊上一頁/下一頁時觸發的回呼函式。 |
| `onPageSizeChange`| `(pageSize: number) => void`| 是 | 當使用者從下拉選單選擇新的每頁數量時觸發的回呼函式。 |

---

## 四、關聯模組（Associated Modules）

此元件為平台級的基礎元件，被所有包含可分頁資料表格的模組頁面使用。它通常作為 `TableContainer` 元件的 `footer` 部分出現。
- `TableContainer`
- 所有列表頁面 (`...ListPage.tsx`)。