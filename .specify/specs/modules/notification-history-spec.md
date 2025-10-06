# Feature Specification: 通知紀錄 (Notification History)

**Feature Branch**: `[notification-history-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/notifications-spec-pages.md` → ``notifications-send-history.png``、 `docs/specs/notifications-spec-pages.md` → ``notifications-history-detail.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/notification-history-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `notifications-send-history.png`

**現況描述**
- 此頁面為「發送歷史」，以表格形式展示所有已發送或嘗試發送的通知記錄。
- 頁面頂部有一個工具列，包含「搜尋與篩選」、「欄位設定」和「匯出」按鈕。
- 表格主要欄位包括：時間戳、策略、管道、收件人、狀態、內容。
- 「管道」欄位會根據管道類型 (Email, Slack 等) 顯示對應的圖示和名稱。
- 「狀態」欄位會以不同顏色 (成功為綠色，失敗為紅色) 標示 `SENT` 或 `FAILED`。
- 頁面底部有分頁控制器，用於瀏覽大量歷史記錄。

**互動流程**
- **查看詳情**：使用者點擊任一筆歷史記錄，會從右側滑出一個抽屜 (Drawer) 面板，顯示該筆記錄的完整 JSON 格式內容。
- **搜尋與篩選**：使用者點擊「搜尋與篩選」按鈕，會開啟一個模態視窗，可根據關鍵字、狀態、管道類型、日期範圍等條件篩選歷史記錄。
- **匯出**：使用者點擊「匯出」按鈕，會將目前篩選結果下的所有歷史記錄匯出為 CSV 檔案。
- **欄位設定**：使用者點擊「欄位設定」，可以自訂表格中要顯示或隱藏的欄位。
- **分頁**：使用者可以透過底部的分頁元件切換頁面或更改每頁顯示的項目數量。

### `notifications-history-detail.png`

**現況描述**
- 此畫面為一個從右側滑出的抽屜 (Drawer) 面板，用於顯示單筆通知發送歷史的完整詳情。
- 抽屜標題會顯示該筆記錄的 ID。
- 抽屜的主要內容區域以 `JSON` 格式完整呈現 `NotificationHistoryRecord` 物件的所有欄位與值。
- 如果該筆記錄的發送狀態為 `failed`，抽屜的標題列右側會出現一個「重新發送」按鈕。

**互動流程**
- **開啟**：在發送歷史列表頁點擊任一筆記錄即可開啟此抽屜。
- **關閉**：點擊抽屜右上角的關閉圖示，或點擊抽屜外的遮罩區域，即可關閉。
- **重新發送**：
    1. 當一筆失敗 (`failed`) 的記錄被點開時，「重新發送」按鈕會呈現可點擊狀態。
    2. 使用者點擊此按鈕，系統會向後端發起一個重新發送的請求。
    3. 按鈕會顯示為「重送中...」的載入狀態。
    4. 請求完成後，系統會顯示成功或失敗的提示訊息，並自動關閉抽屜、刷新背景的歷史記錄列表以顯示最新狀態。

## Requirements *(mandatory)*
**API 與資料流**
- **載入頁面**：
    - `GET /settings/notification-history`：向後端請求歷史記錄列表。
    - **傳入**：可傳入分頁參數 (`page`, `page_size`) 和篩選參數 (`filters`)。
    - **回傳**：回傳一個包含 `items` (歷史記錄陣列) 和 `total` (總數) 的物件。每個記錄物件的結構遵循 `NotificationHistoryRecord` 型別。
- **匯出**：
    - 此為前端功能，`exportToCsv` 服務會將當前載入的 `history` 陣列資料轉換為 CSV 格式並觸發下載。
    - [NEEDS CLARIFICATION: 目前的實作是僅匯出當前頁面，還是會匯出所有符合篩選條件的資料？規格上應定義清楚。]

**需求與規格定義**
- **使用者需求**
    - 作為系統管理員，我需要能夠查看所有通知的發送歷史，以便追蹤與稽核。
    - 我希望能快速篩選出特定時間範圍內、特定狀態 (如失敗) 或特定管道的通知。
    - 我希望能查看每一筆通知的詳細內容。
    - 我希望能將查詢結果匯出存檔。
- **功能規格**
    - **[R-NH-01]** 系統必須提供一個頁面，以表格形式展示所有通知的發送歷史。
    - **[R-NH-02]** 表格必須顯示關鍵資訊，包括：發送時間、關聯的策略、使用的管道、收件人、發送狀態及內容摘要。
    - **[R-NH-03]** 系統必須支援分頁瀏覽歷史記錄。
    - **[R-NH-04]** 使用者點擊任一筆記錄，系統必須以抽屜 (Drawer) 或其他形式展示該記錄的完整詳情。
    - **[R-NH-05]** 系統必須提供篩選功能，至少應支援：
        - **[R-NH-05-01]** 依狀態 (成功/失敗) 篩選。
        - **[R-NH-05-02]** 依管道類型篩選。
        - **[R-NH-05-03]** 依日期範圍篩選。
        - **[R-NH-05-04]** 依關鍵字篩選。
    - **[R-NH-06]** 系統必須提供將當前檢視的歷史記錄列表匯出為 CSV 檔案的功能。
    - **[R-NH-07]** 系統必須允許使用者自訂表格顯示的欄位。

---

**API 與資料流**
- **顯示資料**：
    - 資料來源於歷史列表頁已載入的 `NotificationHistoryRecord` 物件，無需額外的 API 請求。
- **重新發送**：
    - `POST /settings/notification-history/:id/resend`：向後端請求重新發送指定 ID 的通知。
    - **回傳**：成功或失敗的狀態。前端收到成功回應後會刷新列表。

**需求與規格定義**
- **使用者需求**
    - 我希望能看到每一筆通知發送的完整原始資料，以便於排查問題。
    - 當一個通知發送失敗時，我希望能有一個簡單的方式手動觸發重送。
- **功能規格**
    - **[R-NH-08]** 系統必須在使用者點擊歷史記錄時，以抽屜 (Drawer) 形式顯示該記錄的完整詳情。
    - **[R-NH-09]** 詳情內容必須以易於閱讀的 JSON 格式呈現。
    - **[R-NH-10]** 對於發送失敗 (`failed`) 的記錄，系統必須在詳情畫面中提供「重新發送」功能。
    - **[R-NH-11]** 「重新發送」功能僅對失敗的記錄可見且可用。
    - **[R-NH-12]** 執行重新發送時，UI 必須有明確的載入中狀態提示。
    - **[R-NH-13]** 重新發送成功後，系統應自動刷新歷史記錄列表。

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 目前的實作是僅匯出當前頁面，還是會匯出所有符合篩選條件的資料？規格上應定義清楚。

## Source Evidence
- ### `notifications-send-history.png` （來源：`docs/specs/notifications-spec-pages.md`）
- ### `notifications-history-detail.png` （來源：`docs/specs/notifications-spec-pages.md`）

## Review & Acceptance Checklist
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness Checklist
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [ ] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

