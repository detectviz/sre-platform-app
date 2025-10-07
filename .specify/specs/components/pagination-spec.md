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
- **FR-007**：元件必須（MUST）支援跨頁面持久化策略：預設同步 `page` 與 `pageSize` 至 URL Query，並可透過 `persistKey` 啟用 localStorage 儲存以便跨 session 還原。
- **FR-008**：當資料筆數超過 `virtualizationThreshold` 時，元件必須（MUST）改以後端分頁為主，並透過 `onLoadMore` 通知父層啟用虛擬滾動/無限捲動策略，界線與 `TableDesignSystem` 保持一致（預設 200 筆）。

---

## 三、關鍵資料實體（Key Entities）

| 實體名稱 | 描述 | 關聯 |
|---|---|---|
| **PaginationState** | 描述目前頁碼、每頁數量與總筆數，用於同步父層資料來源。 | 列表模組 |
| **PaginationPreference** | 用戶自訂的每頁顯示筆數偏好。 | UserPreferences |

---

## 四、可配置屬性（Props）

| 屬性名 | 類型 | 必填 | 描述 |
|---|---|---|---|
| `total` | `number` | 是 | 所有頁面的總項目數量。 |
| `page` | `number` | 是 | 當前顯示的頁碼（1-based）。 |
| `pageSize` | `number` | 是 | 每頁顯示的項目數量。 |
| `onPageChange` | `(page: number) => void` | 是 | 當使用者點擊上一頁/下一頁時觸發的回呼函式。 |
| `onPageSizeChange`| `(pageSize: number) => void`| 是 | 當使用者從下拉選單選擇新的每頁數量時觸發的回呼函式。 |
| `persistKey` | `string` | 否 | 啟用跨 session 儲存時使用的 localStorage key。未提供時僅同步 URL。 |
| `virtualizationThreshold` | `number` | 否 | 指定改用後端分頁與虛擬滾動策略的資料筆數門檻，預設為 `200`。 |
| `onLoadMore` | `() => void` | 否 | 當超過閾值時觸發，以便父層啟動虛擬滾動或額外資料載入。 |

---

## 五、關聯模組（Associated Modules）

此元件為平台級的基礎元件，被所有包含可分頁資料表格的模組頁面使用。它通常作為 `TableContainer` 元件的 `footer` 部分出現。
- `TableContainer`
- 所有列表頁面 (`...ListPage.tsx`)。

---

## 六、觀測性與治理檢查（Observability & Governance Checklist）

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | ✅ | 分頁切換行為應透過父層追蹤，以分析熱門頁碼與轉換率。 |
| 指標與告警 (Metrics & Alerts) | ✅ | 透過統一遙測檢視分頁 API 的回應時間與成功率。 |
| RBAC 權限與審計 | ✅ | 分頁為檢視操作，不涉及權限控制，但需遵循審計策略記錄與其他操作的關聯。 |
| i18n 文案 | ✅ | 分頁文字與每頁選項說明須由內容字典提供。 |
| Theme Token 使用 | ✅ | 控制項顏色與尺寸需沿用設計系統，不得硬編碼。 |

---

## 七、審查與驗收清單（Review & Acceptance Checklist）

- [x] 無技術實作語句。
- [x] 所有必填段落皆存在。
- [x] 所有 FR 可測試且明確。
- [x] 無未標註的模糊需求。
- [x] 符合 `.specify/memory/constitution.md`。

---

## 八、模糊與待確認事項（Clarifications）

- 分頁狀態預設同步至 URL Query；若傳入 `persistKey`，需額外寫入 localStorage 以支援跨 session 還原，並於使用者登出時清除。
- 大量資料時維持 200 筆閾值：超出時啟用後端分頁與虛擬滾動模式，並透過 `onLoadMore` 與 `TableDesignSystem` 的虛擬滾動實作協調載入節奏。