# 通用規範: CRUD 基礎需求

**類型 (Type)**: Common
**適用範圍**: 所有包含增刪改查操作的模組
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、設計原則

所有包含 CRUD(Create, Read, Update, Delete)操作的模組必須遵循以下統一原則,確保使用者體驗一致性與系統可維護性。

---

## 二、通用功能需求

### 2.1 列表顯示 (List/Read)

- **FR-CRUD-001**: 系統必須(MUST)提供列表檢視,顯示核心欄位資訊。
- **FR-CRUD-002**: 系統必須(MUST)支援分頁功能,含頁碼切換與每頁筆數調整。
- **FR-CRUD-003**: 系統必須(MUST)支援排序功能,至少包含建立時間或更新時間排序。
- **FR-CRUD-004**: 系統應該(SHOULD)支援欄位自訂顯示,允許使用者選擇顯示欄位與順序。
- **FR-CRUD-005**: 系統應該(SHOULD)支援搜尋與篩選功能,含關鍵字與條件組合。
- **FR-CRUD-006**: 系統可以(MAY)支援批次選取,提供全選、反選、清除選取功能。

### 2.2 新增 (Create)

- **FR-CRUD-007**: 系統必須(MUST)提供新增功能,透過模態框或獨立頁面。
- **FR-CRUD-008**: 系統必須(MUST)驗證必填欄位,標記錯誤並阻止提交。
- **FR-CRUD-009**: 系統必須(MUST)驗證欄位格式(如郵箱、URL、數字範圍)。
- **FR-CRUD-010**: 系統應該(SHOULD)提供表單預填功能,使用範本或預設值。
- **FR-CRUD-011**: 系統應該(SHOULD)在新增成功後,跳轉至列表首頁或新建項目詳情。
- **FR-CRUD-012**: 系統可以(MAY)支援批次新增,透過 CSV 匯入或複製貼上。

### 2.3 編輯 (Update)

- **FR-CRUD-013**: 系統必須(MUST)提供編輯功能,載入現有資料並允許修改。
- **FR-CRUD-014**: 系統必須(MUST)驗證修改內容,與新增驗證規則一致。
- **FR-CRUD-015**: 系統應該(SHOULD)標記已修改欄位,提供變更預覽。
- **FR-CRUD-016**: 系統應該(SHOULD)在編輯成功後,返回列表並保持當前頁碼與篩選條件。
- **FR-CRUD-017**: 系統可以(MAY)支援版本控制,記錄變更歷史並允許復原。

### 2.4 刪除 (Delete)

- **FR-CRUD-018**: 系統必須(MUST)提供刪除功能,單筆刪除需二次確認。
- **FR-CRUD-019**: 系統必須(MUST)在確認對話框中顯示刪除項目名稱,避免誤刪。
- **FR-CRUD-020**: 系統應該(SHOULD)檢查依賴關係,若有關聯資料應提示影響範圍。
- **FR-CRUD-021**: 系統應該(SHOULD)支援批次刪除,需明確提示刪除數量。
- **FR-CRUD-022**: 系統可以(MAY)支援軟刪除(標記為已刪除但保留資料)。

---

## 三、使用者體驗規範

### 3.1 操作回饋

- 新增/編輯/刪除成功後,必須顯示成功提示訊息(Toast)。
- 操作失敗時,必須顯示明確錯誤訊息,說明失敗原因。
- 長時間操作(如匯入、批次刪除)需顯示進度指示器。

### 3.2 資料載入

- 列表載入時顯示骨架屏或載入動畫(TableLoader)。
- 載入失敗時顯示錯誤訊息與重試按鈕(TableError)。
- 空資料時顯示友善提示,引導使用者建立第一筆資料。

### 3.3 表單互動

- 必填欄位必須標記紅色星號(*)。
- 欄位驗證即時進行,錯誤訊息顯示於欄位下方。
- 提交按鈕在驗證失敗時應禁用或標記錯誤。

---

## 四、技術實作標準

### 4.1 API 規範

- 列表 API: `GET /api/v1/{resource}?page={page}&page_size={pageSize}&{filters}`
- 新增 API: `POST /api/v1/{resource}` (Body: 資料物件)
- 編輯 API: `PATCH /api/v1/{resource}/{id}` (Body: 部分或完整資料)
- 刪除 API: `DELETE /api/v1/{resource}/{id}`
- 批次操作: `POST /api/v1/{resource}/batch-actions` (Body: `{action, ids}`)

### 4.2 狀態管理

- 使用 `useState` 管理列表資料、分頁、篩選條件。
- 使用 `useCallback` 包裝 API 呼叫函式,避免不必要的重新渲染。
- 使用 `useEffect` 監聽分頁、篩選條件變更,自動重新載入資料。

### 4.3 錯誤處理

- API 錯誤統一透過 `showToast` 顯示。
- 網路錯誤提供重試選項。
- 驗證錯誤標記於表單欄位,不阻擋頁面渲染。

---

## 五、觀測性與治理

### 5.1 記錄與追蹤

- 記錄所有 CRUD 操作,含操作者、時間戳記、操作類型、目標物件 ID。
- 關鍵操作(刪除、批次操作)需記錄詳細資訊,用於審計。

### 5.2 權限控制

- 依 RBAC 控制 CRUD 操作權限,未授權操作應隱藏或禁用按鈕。
- 刪除操作需額外權限檢查,避免誤刪關鍵資料。

### 5.3 i18n 與主題

- 所有文案透過 `useContent` 存取,無硬編碼。
- 狀態標籤、按鈕使用 Theme Token,支援深淺色主題。

---

## 六、採用此模式的模組清單

以下模組應遵循此規範:

- incidents-list
- incidents-alert
- incidents-silence
- resources-list
- resources-group
- resources-datasource
- resources-auto-discovery
- dashboards-list
- dashboards-template
- automation-playbook
- automation-trigger
- automation-history
- identity-personnel
- identity-role
- identity-team
- identity-audit
- notification-channel
- notification-strategy
- notification-history
- platform-tag

---

## 七、刪除確認 UI 設計

### 7.1 前端 UI/UX 設計 (已確認)

根據資料重要性與可恢復性，系統提供兩種刪除模式的 UI 設計：

#### 軟刪除 (可恢復) UI

**單筆刪除確認 Modal**:
- 標題: "確認刪除"
- 內容: 顯示刪除項目名稱與 ID
- 提示: 使用 Info Alert 提示「此項目將被移至回收站，30 天內可恢復」
- 按鈕: 「刪除」(danger) + 「取消」(default)

**批次刪除確認 Modal**:
- 標題: "批次刪除"
- 內容: 顯示「即將刪除 X 筆資料」
- 提示: Info Alert 提示恢復期限
- 確認機制: Checkbox「我了解此操作的影響」
- 按鈕: 「確認刪除」(danger, 需勾選才啟用) + 「取消」

**回收站功能**:
- 獨立頁面或 Tab，顯示已刪除項目清單
- 每筆資料顯示: 名稱、刪除時間、剩餘天數
- 操作按鈕: 「恢復」+ 「永久刪除」
- 警告提示: 「X 天後自動永久刪除」

#### 硬刪除 (永久刪除) UI

**永久刪除確認 Modal**:
- 標題: "永久刪除警告" (加警告圖示)
- Error Alert: 「此操作無法復原」+ 「資料將被永久刪除，無法恢復」
- 輸入確認: 要求輸入 "DELETE" 確認操作
- Input placeholder: "輸入 DELETE 確認"
- 按鈕: 「永久刪除」(danger, 輸入正確才啟用) + 「取消」
- Modal 不可點擊外部關閉 (closable: false)

**前端決策**: Modal 佈局、確認機制 (Checkbox vs 輸入文字)、警告樣式
**後端參數**: 軟刪除保留期 (softDeleteRetention)、刪除模式判斷邏輯

### 7.2 前後端分工

| 職責 | 前端 | 後端 |
|------|------|------|
| **UI 設計** | ✅ Modal 樣式、確認流程、提示訊息 | - |
| **刪除模式** | 📥 根據 API 回傳的 `deleteMode` 顯示對應 UI | ✅ 判斷軟刪除或硬刪除 |
| **保留期限** | 📥 顯示「X 天內可恢復」(由 API 提供) | ✅ 提供保留天數參數 |
| **依賴檢查** | 📥 顯示影響範圍 (由 API 提供) | ✅ 檢查關聯資料並回傳 |

---

## 八、待確認事項

- ✅ ~~[NEEDS CLARIFICATION: 軟刪除與硬刪除的選擇標準]~~ → **已解決: 前端 UI 設計已確認，刪除模式與保留期由 API 提供**
- [NEEDS CLARIFICATION: 批次操作的並行數量限制] → 由後端 API 提供 maxConcurrent 參數
- [NEEDS CLARIFICATION: 列表資料的快取策略與失效機制] → 由後端 API 提供 cacheTTL 參數

---

## 九、決策記錄

### DR-001: 刪除確認 UI 設計

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan.md` 5.2 節

**決策內容**:
- 軟刪除使用簡單確認 + Checkbox 機制
- 硬刪除使用輸入 "DELETE" 強確認機制
- 提供回收站功能供軟刪除資料恢復

**前後端分工**:
- 前端: Modal UI 設計、確認流程、視覺化提示
- 後端: 刪除模式判斷、保留期設定、依賴關係檢查
