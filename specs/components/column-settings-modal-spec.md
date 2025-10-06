# 功能規格書（Feature Specification）

**模組名稱 (Module)**: ColumnSettingsModal
**類型 (Type)**: Component
**來源路徑 (Source Path)**: `components/ColumnSettingsModal.tsx`
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v1.2.0)

---

## 一、主要使用者情境（User Scenarios & Testing）

### 主要使用者故事（Primary User Story）
作為一名使用者，在查看一個包含大量欄位的複雜表格時，我希望能隱藏我不關心的欄位，並將我最關心的欄位排在前面，以建立一個更簡潔、更符合我個人工作流程的資料視圖。

### 驗收情境（Acceptance Scenarios）
1.  **Given** 我打開「欄位設定」模態框。
    **When** 我從左側的「可用欄位」列表中點擊一個欄位旁的「加入」按鈕。
    **Then** 該欄位應從左側列表消失，並出現在右側的「已顯示欄位」列表的底部。

2.  **Given** 我在右側的「已顯示欄位」列表中看到一個我想往上移動的欄位。
    **When** 我點擊該欄位旁的「上移」箭頭按鈕。
    **Then** 該欄位應與其上方的欄位交換位置。

3.  **Given** 我已經完成了我的欄位配置。
    **When** 我點擊「儲存」按鈕。
    **Then** `onSave` 回呼函式必須被觸發，並傳出一個包含所有已顯示欄位 `key` 的陣列，且陣列的順序必須與我在 UI 中調整的順序完全一致。

### 邊界案例（Edge Cases）
- 當所有可用欄位都已被選中時，左側列表應顯示「所有欄位皆已顯示」的提示。
- 當沒有選擇任何欄位時，右側列表應顯示「目前未選擇任何欄位」的提示。
- 對於已顯示列表中的第一個項目，其「上移」按鈕應被禁用；對於最後一個項目，其「下移」按鈕應被禁用。

---

## 二、功能需求（Functional Requirements）

- **FR-001**：元件必須（MUST）提供一個雙欄選擇器介面，包含「可用欄位」和「已顯示欄位」兩個列表。
- **FR-002**：使用者必須（MUST）能夠將欄位從「可用」列表移動到「已顯示」列表。
- **FR-003**：使用者必須（MUST）能夠將欄位從「已顯示」列表移回到「可用」列表。
- **FR-004**：使用者必須（MUST）能夠調整「已顯示欄位」列表中各個欄位的順序。
- **FR-005**：元件必須（MUST）是一個受控元件，其開啟/關閉狀態由 `isOpen` 和 `onClose` props 控制。
- **FR-006**：當使用者點擊儲存時，元件必須（MUST）透過 `onSave` 回呼函式回傳一個包含最終可見欄位 `key` 的有序陣列。
- **FR-007**：元件應該（SHOULD）支援透過拖曳來對「已顯示欄位」進行排序。

---

## 三、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `isOpen` | `boolean` | 是 | 控制模態框的開啟或關閉狀態。 |
| `onClose` | `() => void` | 是 | 當使用者請求關閉模態框時觸發的回呼函式。 |
| `onSave` | `(newColumnKeys: string[]) => void` | 是 | 當使用者點擊儲存時觸發的回呼函式，傳出最終的欄位鍵陣列。 |
| `allColumns` | `TableColumn[]` | 是 | 包含所有可用欄位定義的完整列表。 |
| `visibleColumnKeys`| `string[]` | 是 | 當前可見欄位的鍵的陣列，用於初始化模態框的狀態。 |

---

## 四、關聯模組（Associated Modules）

此元件為平台級的基礎元件，被所有提供可自訂欄位表格的模組頁面使用，是 `table-design-system` 的一個重要組成部分。
- 所有列表頁面 (`...ListPage.tsx`, `...HistoryPage.tsx`, etc.)
- `TableContainer` (概念上關聯)