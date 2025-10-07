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
- **FR-008**：元件必須（MUST）支援 `allowedScopes` 設定，預設僅允許個人（`"personal"`）儲存；當提供 `"team"` 或 `"global"` 時需在 UI 中讓使用者選擇並檢查對應權限。
- **FR-009**：儲存流程必須（MUST）採用顯式確認按鈕並以樂觀更新回寫列表，如 API 失敗需回滾至上一個成功狀態並顯示錯誤提示。

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **ColumnDefinition** | 代表可供選擇的欄位定義，包含欄位識別與語義資訊。 | TableDesignSystem |
| **ColumnVisibilityPreference** | 描述使用者最後儲存的欄位順序與顯示狀態。 | UserPreferences |

---

## 四、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `isOpen` | `boolean` | 是 | 控制模態框的開啟或關閉狀態。 |
| `onClose` | `() => void` | 是 | 當使用者請求關閉模態框時觸發的回呼函式。 |
| `onSave` | `(newColumnKeys: string[]) => void` | 是 | 當使用者點擊儲存時觸發的回呼函式，傳出最終的欄位鍵陣列。 |
| `allColumns` | `TableColumn[]` | 是 | 包含所有可用欄位定義的完整列表。 |
| `visibleColumnKeys`| `string[]` | 是 | 當前可見欄位的鍵的陣列，用於初始化模態框的狀態。 |
| `allowedScopes` | `Array<'personal' \| 'team' \| 'global'>` | 否 | 指定可用的儲存作用域，預設僅提供 `['personal']`。 |
| `defaultScope` | `'personal' \| 'team' \| 'global'` | 否 | 預設選取的儲存作用域，未提供時為 `'personal'`。 |

---

## 五、關聯模組（Associated Modules）

此元件為平台級的基礎元件，被所有提供可自訂欄位表格的模組頁面使用，是 `table-design-system` 的一個重要組成部分。
- 所有列表頁面 (`...ListPage.tsx`, `...HistoryPage.tsx`, etc.)
- `TableContainer` (概念上關聯)

---

## 六、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 儲存欄位設定時需由對應模組記錄審計，包含來源頁面與欄位調整結果。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 使用統一遙測追蹤模態開啟時間及儲存 API 成功率。 |
| RBAC 權限與審計 | ✅ | 欄位偏好預設儲存為個人範圍；如頁面提供團隊或全域共享選項，需在模態中透過 `allowedScopes` 驗證使用者權限並呼叫具體偏好 API，所有儲存操作交由模組審計記錄。 |
| i18n 文案 | ✅ | 所有欄位名稱與提示文字必須透過內容字典提供，不得硬寫。 |
| Theme Token 使用 | ✅ | 模態框與拖曳排序樣式需沿用設計系統。 |

---

## 七、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 八、模糊與待確認事項（Clarifications）

- 欄位設定預設僅針對個人儲存；若模組傳入 `allowedScopes` 含 `team` 或 `global`，模態需顯示作用域選單並於儲存前檢查使用者擁有對應權限。
- 排序與顯示調整僅在使用者按下「儲存」後提交；若 API 失敗，需回復至上一次成功儲存的狀態並顯示錯誤訊息，同時保留在模態中供再次編輯。