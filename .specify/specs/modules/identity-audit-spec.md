# Feature Specification: 稽核日誌 (Audit Trails)

**Feature Branch**: `[identity-audit-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/identity-spec-pages.md` → ``identity-audit-log-list.png``、 `docs/specs/identity-spec-pages.md` → ``identity-audit-log-detail.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/identity-audit-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `identity-audit-log-list.png`

**現況描述**
- **頁面導覽**: 位於「身份與存取」下的「審計日誌」頁籤。
- **工具列**:
    - **左側**: 檢索和篩選按鈕。
    - **右側**: 欄位設定、匯出。
- **日誌列表**:
    - 以表格形式呈現，包含欄位：時間、使用者、操作、目標、結果。
    - **可排序欄位**: 列表的表頭（時間、使用者、操作、目標、結果）旁有排序圖示，表示可以點擊進行升序或降序排序。
    - **結果**: 使用不同顏色標示，例如 `SUCCESS` (綠色)。
- **列表功能**:
    - 點擊任一列會觸發開啟日誌詳情側邊欄。
    - 底部提供分頁控制。

**互動流程**
- **檢視詳情**:
    - 使用者點擊任一列日誌。
    - 系統從右側滑出 `identity-audit-log-detail.png` 詳情抽屜 (Drawer)。
- **排序**:
    - 使用者點擊可排序的欄位標題。
    - 列表會根據該欄位進行升序或降序排序，並向後端發送對應的 API 請求。
- **檢索與篩選**:
    - 使用者點擊「檢索和篩選」按鈕。
    - 系統彈出 `UnifiedSearchModal` 視窗，提供基於多個條件的日誌搜尋功能（例如：時間範圍、使用者、操作類型）。
- **匯出**:
    - 使用者點擊「匯出」按鈕。
    - 系統會將當前列表中的資料匯出為 CSV 檔案。

### `identity-audit-log-detail.png`

**現況描述**
- **類型**: 側邊抽屜 (Drawer)。
- **標題**: 日誌詳情: [log-001]
- **內容**:
    - 以 `pre` 和 `code` 標籤格式化的 JSON 物件，顯示該筆日誌的完整原始資料。
    - JSON 內容包含 `id`, `timestamp`, `user` (物件), `action`, `target` (物件), `result`, `ip`, `details` (物件) 等欄位。

**互動流程**
- **開啟**: 在日誌列表頁點擊任一筆日誌時，此抽屜從右側滑出。
- **關閉**:
    - 點擊抽屜右上角的 "X" 按鈕。
    - 點擊抽屜外的遮罩區域。
    - 按下 `Escape` 鍵。

## Requirements *(mandatory)*
**API 與資料流**
- **載入日誌列表**:
    - **API**: `GET /api/v1/iam/audit-logs`
    - **傳入參數**:
        - `page`: 當前頁碼
        - `page_size`: 每頁數量
        - `filters`: (可選) 篩選條件
        - `sort_by`: (可選) 排序欄位 (例如 `timestamp`)
        - `sort_order`: (可選) 排序方向 (`asc` 或 `desc`)
    - **傳出資料**: `{ "items": AuditLog[], "total": number }`
    - **流程**: 頁面載入時，預設按時間降序呼叫此 API，獲取日誌資料並渲染列表。
- **匯出日誌**:
    - **前端實作**: `exportToCsv` 服務。
    - **流程**: 點擊匯出按鈕時，前端會收集當前 `logs` 陣列中的資料，轉換成 CSV 格式並觸發瀏覽器下載。

**需求與規格定義**
- **需求 1**: 系統必須記錄所有重要的使用者活動與系統事件，並以列表形式展示。
- **規格 1.1**: 日誌列表應至少包含時間、執行操作的使用者、操作類型、操作目標和結果。
- **規格 1.2**: 結果欄位應使用顏色區分成功 (`success`) 與失敗 (`failure`)，方便快速識別。
- **需求 2**: 使用者應能夠方便地檢視單筆日誌的完整詳細資訊。
- **規格 2.1**: 點擊列表中的任一項目，應以側邊抽屜 (Drawer) 或類似方式顯示該日誌的原始 JSON 資料。
- **需求 3**: 使用者應能夠對日誌進行排序與篩選。
- **規格 3.1**: 列表應支援按主要欄位（如時間、使用者）進行升序和降序排序。
- **規格 3.2**: 需提供強大的篩選功能，允許使用者根據時間範圍、使用者、操作類型等條件進行檢索。
- **需求 4**: 使用者應能夠將日誌匯出存檔。
- **規格 4.1**: 需提供匯出功能，支援將當前檢視的日誌匯出為 CSV 格式。

---

**API 與資料流**
- **資料來源**: 無獨立 API 呼叫。
- **流程**:
    1. `AuditLogsPage` 透過 `GET /api/v1/iam/audit-logs` 獲取日誌列表資料。
    2. 使用者點擊某一列，觸發 `setSelectedLog(log)`。
    3. `Drawer` 元件根據 `selectedLog` 的狀態變為可見，並將 `selectedLog` 物件的內容格式化為 JSON 顯示。

**需求與規格定義**
- **需求 1**: 系統必須提供一個介面，以易於閱讀的方式展示單筆日誌的完整、未經修改的原始資料。
- **規格 1.1**: 應使用抽屜 (Drawer) 或彈出視窗 (Modal) 來展示詳情，避免跳轉頁面。
- **規格 1.2**: 日誌詳情應以格式化的 JSON 或等效的鍵值對形式呈現，確保所有資訊都被完整揭露。
- **規格 1.3**: 標題應清晰標示正在檢視的日誌 ID。

## Source Evidence
- ### `identity-audit-log-list.png` （來源：`docs/specs/identity-spec-pages.md`）
- ### `identity-audit-log-detail.png` （來源：`docs/specs/identity-spec-pages.md`）

## Review & Acceptance Checklist
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness Checklist
- [x] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

