# Feature Specification: 個人偏好設定 (Profile Preferences)

**Feature Branch**: `[profile-preference-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/profile-spec-pages.md` → ``profile-preferences.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/profile-preference-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `profile-preferences.png`

**現況描述**
- 此頁面為「偏好設定」分頁，允許使用者自訂其介面偏好。
- 可設定的選項包含：介面主題、預設首頁、語言、時區。
- 每個選項都是一個下拉選單。
- 頁面底部提供三個操作按鈕：「重置為預設」、「儲存設定」和「匯出偏好設定」。

**互動流程**
- **資料載入**：
  - 進入頁面時，系統會並行發出三個請求：獲取使用者當前的偏好設定、獲取所有下拉選單的可用選項、獲取儀表板列表。
  - 載入期間應顯示載入指示器。
  - 若資料獲取失敗，應顯示錯誤訊息。
- **修改設定**：
  - 使用者可以從每個下拉選單中選擇不同的值。
  - 選擇後，前端狀態會更新，但不會立即儲存。
- **儲存設定**：
  - 使用者點擊「儲存設定」按鈕。
  - 系統會發出 `PUT` 請求，將當前的設定狀態傳送到後端。
  - 成功後，應顯示成功提示（Toast），例如「偏好設定已成功儲存」。
  - 失敗後，應顯示錯誤提示，例如「無法儲存偏好設定」。
- **重置設定**：
  - 使用者點擊「重置為預設」按鈕。
  - 前端會將所有設定選項恢復為從 `GET /settings/preferences/options` 獲取的預設值。
  - 應顯示成功提示，例如「偏好設定已重置為預設值」。
- **匯出設定**：
  - 使用者點擊「匯出偏好設定」按鈕。
  - 系統會發出 `POST` 請求來啟動匯出程序。
  - 成功後，應顯示成功提示，並自動觸發下載 `download_url` 對應的檔案。
  - 匯出過程中，按鈕應處於禁用狀態並顯示載入指示器。

## Requirements *(mandatory)*
**API 與資料流**
1.  **獲取偏好設定**
    - **API**: `GET /api/v1/me/preferences`
    - **傳入資料 (Response)**: `UserPreferences` 物件。
      ```json
      {
        "theme": "dark",
        "language": "zh-TW",
        "timezone": "Asia/Taipei",
        "default_page": "dashboard-sre-war-room"
      }
      ```
    - **資料流**: 用於填充表單的初始值。

2.  **獲取設定選項**
    - **API**: `GET /api/v1/settings/preferences/options`
    - **傳入資料 (Response)**: `PreferenceOptions` 物件。
      ```json
      {
        "defaults": { "...UserPreferences" },
        "timezones": ["Asia/Taipei", "UTC"],
        "languages": [{ "value": "en", "label": "English" }],
        "themes": [{ "value": "dark", "label": "深色" }]
      }
      ```
    - **資料流**: 用於填充各個下拉選單的選項，以及「重置為預設」時的資料來源。

3.  **獲取儀表板列表**
    - **API**: `GET /api/v1/dashboards`
    - **傳入資料 (Response)**: `{ "items": [Dashboard] }`
    - **資料流**: 用於填充「預設首頁」的下拉選單。

4.  **儲存偏好設定**
    - **API**: `PUT /api/v1/me/preferences`
    - **傳出資料 (Request Body)**: `UserPreferences` 物件。
    - **資料流**: 將使用者修改後的設定傳送至後端儲存。

5.  **匯出偏好設定**
    - **API**: `POST /api/v1/me/preferences/export`
    - **傳出資料 (Request Body)**: `{ "format": "json" }`
    - **傳入資料 (Response)**:
      ```json
      {
        "download_url": "string",
        "expires_at": "string"
      }
      ```
    - **資料流**: 後端處理匯出並回傳檔案下載連結，前端觸發下載。

**需求與規格定義**
- **使用者需求**
  - **UR-03**: 作為一名使用者，我希望能更改介面主題（如深色/淺色），以符合我的視覺偏好。
  - **UR-04**: 作為一名使用者，我希望能設定我的預設登入首頁，以便快速進入我最關心的儀表板。
  - **UR-05**: 作為一名使用者，我希望能切換介面語言和時區。
  - **UR-06**: 作為一名使用者，我希望能將所有偏好設定還原為系統預設值。
  - **UR-07**: 作為一名使用者，我希望能將我的偏好設定匯出成一個檔案，以便備份或遷移。
- **功能規格**
  - **FS-07**: 系統必須提供「介面主題」、「預設首頁」、「語言」和「時區」的下拉選單供使用者修改。
  - **FS-08**: 選單選項必須分別由 `GET /settings/preferences/options` 和 `GET /dashboards` API 動態載入。
  - **FS-09**: 點擊「儲存設定」後，系統必須透過 `PUT /api/v1/me/preferences` 提交所有變更。
  - **FS-10**: 點擊「重置為預設」後，系統必須將所有表單欄位恢復到 `PreferenceOptions.defaults` 中定義的值。
  - **FS-11**: 點擊「匯出偏好設定」後，系統必須透過 `POST /api/v1/me/preferences/export` 請求一個下載連結，並自動開始下載。
  - **FS-12**: 所有 API 操作（儲存、重置、匯出）後，都必須提供成功或失敗的視覺回饋（Toast）。

---

## Source Evidence
- ### `profile-preferences.png` （來源：`docs/specs/profile-spec-pages.md`）

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

