# Feature Specification: 通知通道 (Notification Channels)

**Feature Branch**: `[notification-channel-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/notifications-spec-pages.md` → ``notifications-channels-list.png``、 `docs/specs/notifications-spec-pages.md` → ``notifications-add-channel-email.png``、 `docs/specs/notifications-spec-pages.md` → ``notifications-add-channel-webhook.png``、 `docs/specs/notifications-spec-pages.md` → ``notifications-add-channel-slack.png``、 `docs/specs/notifications-spec-pages.md` → ``notifications-add-channel-line.png``、 `docs/specs/notifications-spec-pages.md` → ``notifications-add-channel-sms.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/notification-channel-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `notifications-channels-list.png`

**現況描述**
- 此頁面為「通知管道」的管理中心，以表格形式展示所有已設定的通知管道。
- 頁面頂部有一個工具列，包含左側的「搜尋與篩選」按鈕，以及右側的「欄位設定」和「新增管道」按鈕。
- 表格支援多選功能，選取項目後，工具列會顯示批次操作按鈕，包括「啟用」、「停用」和「刪除」。
- 表格主要欄位包括：啟用狀態 (開關)、管道名稱、類型、上次測試結果、上次測試時間。
- 每一列末端都有「編輯」和「刪除」的獨立操作按鈕。
- 「類型」欄位會根據管道類型 (Email, Slack 等) 顯示對應的圖示和名稱。
- 「上次測試結果」欄位會以不同顏色的藥丸 (Pill) 樣式顯示 `success`、`failed` 或 `not_tested` 狀態。

**互動流程**
- **新增管道**：使用者點擊「新增管道」按鈕，會開啟一個模態視窗 (Modal) 讓使用者設定新的通知管道。
- **編輯管道**：使用者點擊任一管道旁的「編輯」圖示，會開啟同一個模態視窗，並載入該管道的現有設定以供修改。
- **刪除管道**：使用者點擊「刪除」圖示，會跳出一個確認對話框，提醒操作無法復原。確認後，該管道將被刪除。
- **啟用/停用**：使用者可以直接點擊「啟用」欄位下的開關 (Toggle)，即時切換該管道的啟用狀態。
- **批次操作**：
    1. 使用者透過勾選表格每一列的核取方塊 (Checkbox) 來選取多個管道。
    2. 選取後，工具列會顯示已選取的項目數量及批次操作按鈕。
    3. 使用者可點擊「啟用」、「停用」或「刪除」按鈕，對所有選取的管道執行相應操作。
- **搜尋與篩選**：使用者點擊「搜尋與篩選」按鈕，會開啟一個搜尋模態視窗，可根據關鍵字、類型等條件篩選管道列表。
- **欄位設定**：使用者點擊「欄位設定」，可以自訂表格中要顯示或隱藏的欄位。

### `notifications-add-channel-email.png`

**現況描述**
- 此為新增/編輯「Email」類型通知管道的表單。
- 包含通用欄位：「名稱」和「管道類型」(已選定為 Email)。
- 專屬欄位包括：「收件人 (To)」、「副本 (CC)」、「密件副本 (BCC)」。
- 這些收件人欄位都支援多個電子郵件地址輸入，輸入後會以標籤 (Tag) 形式呈現。

**互動流程**
- **輸入**：使用者在「名稱」欄位輸入管道的自訂名稱。
- **新增收件人**：
    1. 在 To/CC/BCC 輸入框中輸入一個完整的電子郵件地址。
    2. 按下 `Enter`, `Space` 或 `,` 鍵，或在輸入框失焦 (onBlur) 時，系統會驗證郵件格式。
    3. 若格式有效，該郵件地址會變成一個標籤，並清空輸入框以便繼續輸入。
    4. 若格式無效，系統會提示錯誤。
    5. 使用者可直接貼上一串以逗號或分號分隔的郵件地址，系統會自動將其轉換為多個標籤。
- **移除收件人**：點擊郵件地址標籤旁邊的 `x` 圖示即可移除。
- **儲存**：點擊「儲存」按鈕，會將表單資料送出。
- **測試**：
    1. 管道必須先儲存 (獲得 `id`) 才能進行測試。
    2. 點擊「發送測試」按鈕，系統會向後端發起測試請求。
    3. 前端應顯示測試中的狀態，並在收到結果後以提示訊息 (Toast) 顯示成功或失敗。

### `notifications-add-channel-webhook.png`

**現況描述**
- 此為新增/編輯「Webhook (通用)」類型通知管道的表單。
- 包含通用欄位：「名稱」和「管道類型」。
- 專屬欄位包括：「Webhook URL」和「HTTP 方法 (Method)」。

**互動流程**
- **輸入**：使用者在「名稱」和「Webhook URL」欄位輸入對應資訊。
- **選擇方法**：使用者可從下拉選單中選擇 HTTP 方法 (如 POST, GET, PUT)。預設為 POST。
- **儲存與測試**：流程同 Email 管道。

### `notifications-add-channel-slack.png`

**現況描述**
- 此為新增/編輯「Slack」類型通知管道的表單。
- 專屬欄位包括：「Incoming Webhook URL」和「提及對象 (Mention)」。

**互動流程**
- **輸入**：使用者填寫 Slack 提供的 Webhook URL，並可選擇性地填寫要提及的對象 (如 `@channel`)。
- **儲存與測試**：流程同 Email 管道。

### `notifications-add-channel-line.png`

**現況描述**
- 此為新增/編輯「LINE Notify」類型通知管道的表單。
- 專屬欄位為「存取權杖 (Access Token)」。
- 該欄位為密碼輸入框，右側有可切換顯示/隱藏內容的眼睛圖示。

**互動流程**
- **輸入**：使用者將從 LINE Notify 取得的權杖貼入輸入框。
- **切換可見度**：點擊眼睛圖示，可以在明文和密文之間切換，方便使用者確認輸入是否正確。
- **儲存與測試**：流程同 Email 管道。

### `notifications-add-channel-sms.png`

**現況描述**
- 此為新增/編輯「SMS」類型通知管道的表單。
- 專屬欄位為「收件人手機號碼」。

**互動流程**
- **輸入**：使用者輸入目標手機號碼。輸入框中有提示文字 `例如: +886912345678`，引導使用者輸入包含國碼的完整號碼。
- **儲存與測試**：流程同 Email 管道。

## Requirements *(mandatory)*
**API 與資料流**
- **載入頁面**：
    - `GET /settings/notification-channels`：向後端請求通知管道列表。可傳入篩選參數 (如 `filters`)。
    - **回傳**：後端回傳一個包含 `items` (管道陣列) 和 `total` (總數) 的物件。每個管道物件的結構遵循 `NotificationChannel` 型別。
    - `GET /ui/icons-config`：獲取管道類型的圖示設定。
    - `GET /settings/column-config/:pageKey`：獲取使用者自訂的表格欄位顯示設定。
- **切換啟用狀態**：
    - `PATCH /settings/notification-channels/:id`：傳送一個僅包含 `enabled` 欄位的物件來更新該管道的狀態。
- **儲存 (新增/編輯)**：
    - **新增**：`POST /settings/notification-channels`，Body 中包含完整的 `NotificationChannel` 物件。
    - **編輯**：`PATCH /settings/notification-channels/:id`，Body 中包含被修改的 `NotificationChannel` 物件欄位。
- **刪除**：
    - `DELETE /settings/notification-channels/:id`：刪除指定 ID 的管道。
- **批次操作**：
    - `POST /settings/notification-channels/batch-actions`：
    - **傳入**：`{ action: 'enable' | 'disable' | 'delete', ids: string[] }`。
    - **流程**：前端收集所有選取管道的 ID，連同指定的操作名稱一次性傳送給後端。

**需求與規格定義**
- **使用者需求**
    - 作為系統管理員，我需要一個集中的地方來查看、管理我所有的通知發送管道。
    - 我希望能快速新增不同類型的通知管道 (例如 Email、Slack)。
    - 我希望能方便地啟用或停用特定管道，而不需要刪除它。
    - 我希望能對不再使用的管道進行刪除。
    - 當管道數量多時，我需要能夠搜尋和篩選，以快速找到目標。
    - 我希望能一次對多個管道進行相同的操作 (如全部啟用或刪除)。
- **功能規格**
    - **[R-NC-01]** 系統必須提供一個頁面，以表格形式展示所有已設定的通知管道。
    - **[R-NC-02]** 表格必須顯示以下預設欄位：啟用狀態、管道名稱、類型、上次測試結果、上次測試時間。
    - **[R-NC-03]** 系統必須提供「新增管道」功能，點擊後應彈出設定視窗。
    - **[R-NC-04]** 每一筆管道記錄都必須提供「編輯」和「刪除」操作。
        - **[R-NC-04-01]** 刪除操作前，必須有再次確認的提示。
    - **[R-NC-05]** 系統必須支援對單一管道的「啟用/停用」操作，且操作應即時生效。
    - **[R-NC-06]** 系統必須支援批次選取功能。
        - **[R-NC-06-01]** 使用者選取後，必須能對選取的管道執行批次「啟用」、「停用」及「刪除」操作。
    - **[R-NC-07]** 系統必須提供搜尋與篩選功能。
    - **[R-NC-08]** 系統必須允許使用者自訂表格顯示的欄位，並保存其設定。

---

**API 與資料流**
- **儲存**：
    - `POST` 或 `PATCH /settings/notification-channels`
    - **傳入**：Body 中包含 `NotificationChannel` 物件，其 `type` 為 `email`，`config` 物件包含 `to`, `cc`, `bcc` 欄位，值為逗號分隔的郵件地址字串。
- **測試**：
    - `POST /settings/notification-channels/:id/test`
    - **回傳**：`NotificationChannelTestResponse` 物件，包含成功/失敗狀態與訊息。

**需求與規格定義**
- **使用者需求**
    - 我希望能設定透過 Email 發送通知，並能指定多個主要收件人、副本和密件副本收件人。
- **功能規格**
    - **[R-NC-09]** 系統必須提供 Email 類型的通知管道設定。
    - **[R-NC-10]** Email 管道設定必須包含「名稱」、「收件人 (To)」、「副本 (CC)」、「密件副本 (BCC)」欄位。
    - **[R-NC-11]** 「名稱」與「收件人 (To)」為必填欄位。
    - **[R-NC-12]** 收件人、副本、密件副本欄位必須支援輸入多個有效的電子郵件地址。
    - **[R-NC-13]** 系統必須在使用者新增郵件地址時驗證其格式。
    - **[R-NC-14]** 系統必須提供「發送測試」功能，以驗證 Email 管道設定是否正確。
        - **[R-NC-14-01]** 只有已儲存的管道才能進行測試。

---

**API 與資料流**
- **儲存**：
    - `POST` 或 `PATCH /settings/notification-channels`
    - **傳入**：`config` 物件包含 `webhook_url` 和 `http_method`。
- **測試**：`POST /settings/notification-channels/:id/test`

**需求與規格定義**
- **使用者需求**
    - 我希望能設定一個通用的 Webhook，將通知發送到任何支援 Webhook 的第三方服務。
- **功能規格**
    - **[R-NC-15]** 系統必須提供 Webhook (通用) 類型的通知管道設定。
    - **[R-NC-16]** Webhook 管道設定必須包含「名稱」、「Webhook URL」、「HTTP 方法」欄位。
    - **[R-NC-17]** 「名稱」與「Webhook URL」為必填欄位。
    - **[R-NC-18]** 「HTTP 方法」應為下拉選單，預設值為 `POST`。
    - **[R-NC-19]** 系統必須提供「發送測試」功能。

---

**API 與資料流**
- **儲存**：
    - `POST` 或 `PATCH /settings/notification-channels`
    - **傳入**：`config` 物件包含 `webhook_url` 和 `mention`。
- **測試**：`POST /settings/notification-channels/:id/test`

**需求與規格定義**
- **使用者需求**
    - 我希望能將通知直接發送到指定的 Slack 頻道，並能 at 特定的人或群組。
- **功能規格**
    - **[R-NC-20]** 系統必須提供 Slack 類型的通知管道設定。
    - **[R-NC-21]** Slack 管道設定必須包含「Incoming Webhook URL」欄位，此為必填。
    - **[R-NC-22]** Slack 管道設定可選填「提及對象」欄位。
    - **[R-NC-23]** 系統必須提供「發送測試」功能。

---

**API 與資料流**
- **儲存**：
    - `POST` 或 `PATCH /settings/notification-channels`
    - **傳入**：`config` 物件包含 `access_token`。
- **測試**：`POST /settings/notification-channels/:id/test`

**需求與規格定義**
- **使用者需求**
    - 我希望能透過 LINE Notify 服務接收通知。
- **功能規格**
    - **[R-NC-24]** 系統必須提供 LINE Notify 類型的通知管道設定。
    - **[R-NC-25]** LINE Notify 管道設定必須包含「存取權杖」欄位，此為必填。
    - **[R-NC-26]** 「存取權杖」輸入框必須預設為密文顯示，並提供可切換為明文的選項。
    - **[R-NC-27]** 系統必須提供「發送測試」功能。

---

**API 與資料流**
- **儲存**：
    - `POST` 或 `PATCH /settings/notification-channels`
    - **傳入**：`config` 物件包含 `phone_number`。
- **測試**：`POST /settings/notification-channels/:id/test`

**需求與規格定義**
- **使用者需求**
    - 我希望能透過手機簡訊 (SMS) 接收重要通知。
- **功能規格**
    - **[R-NC-28]** 系統必須提供 SMS 類型的通知管道設定。
    - **[R-NC-29]** SMS 管道設定必須包含「收件人手機號碼」欄位，此為必填。
    - **[R-NC-30]** 系統應提示使用者輸入包含國碼的正確手機號碼格式。
    - **[R-NC-31]** 系統必須提供「發送測試」功能。
        - [NEEDS CLARIFICATION: SMS 測試是否會產生實際費用？若會，應在 UI 上有明確提示。]

---

## Outstanding Clarifications
- [NEEDS CLARIFICATION] SMS 測試是否會產生實際費用？若會，應在 UI 上有明確提示。

## Source Evidence
- ### `notifications-channels-list.png` （來源：`docs/specs/notifications-spec-pages.md`）
- ### `notifications-add-channel-email.png` （來源：`docs/specs/notifications-spec-pages.md`）
- ### `notifications-add-channel-webhook.png` （來源：`docs/specs/notifications-spec-pages.md`）
- ### `notifications-add-channel-slack.png` （來源：`docs/specs/notifications-spec-pages.md`）
- ### `notifications-add-channel-line.png` （來源：`docs/specs/notifications-spec-pages.md`）
- ### `notifications-add-channel-sms.png` （來源：`docs/specs/notifications-spec-pages.md`）

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

