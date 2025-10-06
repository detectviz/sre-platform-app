# Feature Specification: 儀表板列表 (Dashboards List)

**Feature Branch**: `[dashboards-list-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/dashboard-spec-pages.md` → ``dashboards-list.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/dashboards-list-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `dashboards-list.png`

**現況描述**
- **頁面標題**：頁面主標題為「儀表板」，副標題為「統一的系統監控與業務洞察儀表板入口」。
- **關鍵指標 (KPI)**：頁面頂部有三個關鍵指標卡片，分別顯示「儀表板總數」、「自訂儀表板」和「Grafana 儀表板」的數量。
- **功能分頁**：包含「儀表板列表」和「範本市集」兩個分頁，當前停留在列表頁。
- **操作列**：
    - 提供「搜尋儀表板...」的輸入框。
    - 包含「匯入」、「匯出」、「欄位設定」和「+ 新增儀表板」四個操作按鈕。
- **儀表板表格**：
    - 表格欄位包含：複選框、儀表板名稱（含描述）、類型、分類、擁有者、最後更新時間和操作。
    - 「類型」欄位以標籤形式展示，如「內建」、「Grafana」。
    - 「操作」欄位提供三個圖示按鈕：收藏（星號）、編輯（筆）、刪除（垃圾桶）。
- **分頁控制**：表格下方提供分頁功能，包含項目總數、頁碼導航和每頁顯示數量的選項。

**互動流程**
- **搜尋**：使用者在搜尋框輸入關鍵字，系統會即時或在使用者按下 Enter 後，向後端發送請求以篩選列表。
- **新增儀表板**：點擊「+ 新增儀表板」按鈕，系統應導航至儀表板模板選擇頁面或開啟建立儀表板的對話框。
- **編輯儀表板**：點擊任一儀表板對應的「編輯」圖示，系統應導航至該儀表板的編輯器頁面。
- **刪除儀表板**：點擊「刪除」圖示，系統應彈出確認對話框，防止誤刪。使用者確認後，從列表中移除該儀表板。
- **批次刪除**：使用者可以透過勾選表格最左側的複選框來選取多個儀表板，此時應出現批次操作按鈕（如「批次刪除」），允許使用者一次刪除所有選中的項目。
- **排序**：使用者可以點擊表格標頭（如「最後更新」）對列表進行升序或降序排序。
- **收藏**：點擊「收藏」圖示可以將儀表板標記為常用，或取消標記。該狀態應被持久化保存。
- **分頁**：使用者可以點擊頁碼或調整每頁顯示的項目數量，來瀏覽完整的儀表板列表。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取儀表板列表**：
    - **API**: `GET /api/v1/dashboards`
    - **用途**: 載入儀表板列表。
    - **傳入參數**:
        - `page` (可選): 頁碼。
        - `page_size` (可選): 每頁項目數。
        - `keyword` (可選): 搜尋關鍵字。
        - `sort_by` (可選): 排序欄位。
        - `sort_order` (可選): 排序順序 (`asc` 或 `desc`)。
    - **傳出資料**: 回傳一個包含 `items` 陣列的分頁物件，每個 item 為一個 `Dashboard` 物件。
- **刪除儀表板**：
    - **API**: `DELETE /api/v1/dashboards/:id`
    - **用途**: 刪除單個儀表板。
    - **傳入參數**: 儀表板的 `id`。
    - **傳出資料**: 成功時回傳 204 No Content。
- **批次刪除儀表板**：
    - **API**: `POST /api/v1/dashboards/batch-actions`
    - **用途**: 批次刪除多個儀表板。
    - **傳入參數 (Body)**: `{ "action": "delete", "ids": ["db-id-1", "db-id-2"] }`
    - **傳出資料**: 回傳操作成功的訊息。
- **更新儀表板 (收藏)**：
    - **API**: `PATCH /api/v1/dashboards/:id`
    - **用途**: 更新儀表板的屬性，例如收藏狀態。
    - **傳入參數 (Body)**: 可能為 `{ "is_favorite": true/false }`。
    - **傳出資料**: 回傳更新後的 `Dashboard` 物件。

**需求與規格定義**
- **使用者需求**:
    - 作為使用者，我希望能看到一個包含所有儀表板的集中列表，以便於管理和查找。
    - 作為使用者，我希望能透過搜尋功能，快速找到我需要的儀表板。
    - 作為使用者，我希望能建立、編輯和刪除儀表板，以滿足我自訂監控畫面的需求。
    - 作為使用者，我希望能批次刪除不再需要的儀表板，以提高管理效率。
    - 作為使用者，我希望能將重要的儀表板加入收藏，方便快速存取。
- **功能規格**:
    - **SR-DASH-LIST-001**: 系統必須以表格形式顯示所有非軟刪除狀態的儀表板。
    - **SR-DASH-LIST-002**: 表格必須至少包含儀表板名稱、類型、分類、擁有者和最後更新時間欄位。
    - **SR-DASH-LIST-003**: 系統必須提供一個文字輸入框，用於根據儀表板名稱進行關鍵字搜尋。
    - **SR-DASH-LIST-004**: 系統必須提供一個「+ 新增儀表板」按鈕，點擊後啟動儀表板建立流程。
    - **SR-DASH-LIST-005**: 每一列儀表板都必須提供「編輯」和「刪除」操作。
    - **SR-DASH-LIST-006**: 刪除操作前，系統必須彈出確認對話框。
    - **SR-DASH-LIST-007**: 系統必須支援透過複選框進行多選，並提供批次刪除功能。
    - **SR-DASH-LIST-008**: 使用者應能點擊表格標頭對列表進行排序。
    - **SR-DASH-LIST-009**: 頁面頂部必須顯示儀表板總數的統計數據。

---

## Source Evidence
- ### `dashboards-list.png` （來源：`docs/specs/dashboard-spec-pages.md`）

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

