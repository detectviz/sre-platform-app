### profile-personal-info.png

**現況描述**
- 頁面以單一卡片呈現個人資料，欄位包含「名稱」、「電子郵件」、「角色」、「團隊」、「狀態」，透過 `FormRow` 元件顯示唯讀文字區塊。
- 右下角提供「在 {IdP} 中管理」外部連結，僅在取得 `authSettings.idp_admin_url` 時顯示，圖示採用 `Icon` 元件並維持輕量文字按鈕樣式。
- 載入期間顯示中央旋轉圖示，錯誤時顯示紅色提示文字。
- UI 稍缺少分隔線與欄位標籤強調，與整體設計系統的資訊密度存在落差（同 pages.md 評語）。

**互動流程**
- 初次載入觸發 `fetchPageData`，同時呼叫 `/me` 與 `/settings/auth`；`isLoading` 控制骨架顯示，錯誤時設定 `error` 並終止流程。
- 取得 `User` 成功後將資料儲存於 `currentUser`，以純文字顯示；無編輯表單或儲存互動。
- 若 `AuthSettings.idp_admin_url` 存在，顯示可開新視窗的管理連結；此連結無額外權限檢查 `[NEEDS CLARIFICATION: 是否需依角色權限決定是否顯示連結？]`。
- 當 API 回應錯誤或使用者不存在時，頁面僅顯示錯誤訊息，缺乏重試按鈕與重新整理引導。

**API 與資料流**
- `GET /api/v1/me`：由 Axios 包裝器自動加上 `/api/v1` 前綴，回傳 `User` 物件（`id`, `name`, `email`, `role`, `team`, `status`, `last_login_at`, `created_at`, `updated_at`）。Mock Server 以 `DB.users[0]` 回應，對應 `Admin User`。
- `GET /api/v1/settings/auth`：回傳 `AuthSettings`（`provider`, `enabled`, `idp_admin_url` 等）。Mock Server 直接回傳 `DB.auth_settings`，預設為 Keycloak 並含 `DEFAULT_IDP_ADMIN_URL`。
- 兩筆資料透過 `useState` 保存在頁面狀態；若任一請求失敗即設定錯誤訊息且不再顯示後續內容。
- 無後送請求，資料流為單向讀取。

**需求與規格定義**
- 使用者需要能在平台內檢視自身基本資訊，並了解資料來源與最後更新狀態。
- 系統必須在 3 秒內完成 `/me` 與 `/settings/auth` 併行請求，成功後顯示所有欄位值；若失敗需顯示可理解錯誤訊息並提供重試。
- 當 `AuthSettings.idp_admin_url` 存在時，需顯示清楚可點擊的主要動作，於新分頁開啟身分提供者管理介面；若連結缺失應提供替代說明。
- 唯讀欄位必須與可編輯欄位樣式區隔，並應提供 `status` 欄位的顏色或標籤強調。[NEEDS CLARIFICATION: 是否需顯示角色／團隊描述或最後更新時間？]

---

### profile-preferences.png

**現況描述**
- 卡片內包含 4 個下拉選單：介面主題、預設首頁、語言、時區；採一致寬度與 `FormRow` 標籤。
- 下方操作列提供「匯出偏好設定」次要按鈕、「重置為預設」次要按鈕、「儲存設定」主按鈕。匯出按鈕在進行中顯示旋轉圖示並禁用。
- 介面缺乏欄位提示文字，與頁面標題之間透過分隔線區隔但左右間距略大。
- 與設計系統相比，操作按鈕群組置於卡片右下，需確認是否符合跨頁一致性。

**互動流程**
- 初次載入呼叫 `fetchPageData`，一次取得偏好值、可選項目以及儀表板清單；載入期間顯示旋轉圖示。
- `handleChange` 依欄位更新 `preferences` 狀態；未實作即時驗證，假設後端處理。
- `handleSave` 以 `PUT /me/preferences` 將目前 `preferences` 物件送回；成功顯示成功 Toast，失敗顯示錯誤 Toast。
- `handleReset` 若 `options.defaults` 存在則回寫預設值並提示成功，否則顯示錯誤 Toast。
- `handleExport` 呼叫 `POST /me/preferences/export`（固定 `format: 'json'`），過程中 `isExporting` 禁用按鈕；成功後顯示成功 Toast 並於新視窗開啟 `download_url`，同時 Mock Server 更新 `last_exported_at` 與 `last_export_format`。
- 錯誤狀態僅顯示文字提示，缺乏重試按鈕。 `[NEEDS CLARIFICATION: 重置後是否需立即儲存或自動同步？]`

**API 與資料流**
- `GET /api/v1/me/preferences`：取得 `UserPreferences`（`theme`, `language`, `timezone`, `default_page`, `last_exported_at`, `last_export_format`）。
- `GET /api/v1/settings/preferences/options`：提供 `PreferenceOptions`，含 `defaults`、`timezones`、`languages`、`themes`。Mock Server 回傳 `MOCK_PREFERENCE_OPTIONS`，僅提供部分選項。
- `GET /api/v1/dashboards?page_size=100`：回傳 `{ items: Dashboard[], total, ... }`，用於組成「預設首頁」選項。
- `PUT /api/v1/me/preferences`：送出整個 `preferences` 狀態物件，後端需回寫最新設定並回應成功。
- `POST /api/v1/me/preferences/export`：請求匯出作業，回傳 `UserPreferenceExportResponse`（含 `download_url`, `expires_at`, `job` 狀態）；Mock Server 同時建立 `UserPreferenceExportJob` 並更新偏好資料。
- Toast 提示透過 `showToast` 注入 DOM，全域顯示。

**需求與規格定義**
- 使用者需能調整介面主題、預設首頁、語言與時區，並立即預覽變更（至少於儲存後生效）。
- 系統須在頁面載入時完成三個 API 的併行請求並將結果整合；若任一失敗需提示並允許重試。
- 儲存操作需確保傳送完整偏好設定並在後端驗證；成功後需刷新本地狀態與顯示成功提示。
- 匯出功能應支援多種格式（目前固定 json，需評估 UI 選項），並確保連結於 1 小時內有效；若匯出失敗，應顯示具體原因與重新嘗試選項。
- 重置動作需確認是否自動儲存或需再按儲存按鈕，並提示使用者後果。 `[NEEDS CLARIFICATION: 預設首頁是否應允許非儀表板頁面？]`

---

### profile-security-settings.png

**現況描述**
- 上半部為變更密碼區塊，包含三個密碼輸入欄位與主要行動按鈕；按鈕於更新中顯示旋轉圖示與「更新中...」文字。
- 下半部顯示最近登入活動表格，欄位含「時間」、「IP 位址」、「裝置」、「狀態」，成功狀態以綠色文字標示，失敗則為紅色。
- 表格下方採用共用 `Pagination` 元件顯示目前頁次及每頁筆數切換；但初始 `pageSize` 設為 5，與下拉選單僅提供 10/20/50 項不一致，造成顯示值與選單不符（需修正）。
- 目前缺少裝置圖示、地理位置等安全提示訊息，與 pages.md 所建議一致。

**互動流程**
- 頁面載入或分頁變動時透過 `fetchLoginHistory` 呼叫 `/me/login-history`，載入期間 `TableLoader` 於表格內顯示進度，錯誤時顯示 `TableError` 並提供「重試」按鈕。
- 使用者輸入密碼時更新本地狀態；按下「更新密碼」會先檢查欄位是否填寫、確認密碼一致及新密碼長度 ≥ 6。任一條件未滿足時以錯誤 Toast 提示並阻止送出。
- 驗證通過後呼叫 `POST /me/change-password`，期間 `isUpdating` 會停用按鈕並顯示載入狀態；成功後清空三個欄位並顯示成功 Toast，失敗則顯示錯誤訊息（採後端回傳或預設文案）。
- 分頁控制：`Pagination` 於切換頁次或每頁筆數時呼叫對應 `setCurrentPage`、`setPageSize`，觸發 `useEffect` 重新抓取資料。 `[NEEDS CLARIFICATION: 是否需於密碼更新後要求重新登入或提供 MFA 驗證？]`

**API 與資料流**
- `GET /api/v1/me/login-history?page={page}&page_size={pageSize}`：回傳 `{ items: LoginHistoryRecord[], total }`。Mock Server 回傳 `paginate(DB.login_history, ...)`，目前資料量僅 1 筆，需確認真實服務是否支援排序與篩選。
- `POST /api/v1/me/change-password`：接收 `old_password`, `new_password`。Mock Server 針對錯誤密碼或長度不足回傳 400；成功回傳空物件。
- `showToast` 於前端顯示錯誤／成功提示；`TableLoader`、`TableError` 分別代表載入與失敗 UI 狀態。
- 分頁元件以總筆數計算頁數並驅動再次請求，資料流為前端查詢參數控制 → 後端分頁 → 前端渲染。

**需求與規格定義**
- 使用者必須能在平台上安全更新密碼，並在欄位驗證失敗時立即收到明確提示；提交成功後需清空欄位並確認更新結果。
- 系統需支援登入活動分頁瀏覽、重試與狀態顏色標示，並保留未來擴充欄位（例如裝置指紋、地理位置）。
- API 必須回傳分頁資訊（`total`、`items`），並允許依時間排序；若資料量為 0，表格需顯示空狀態提示。
- 更新密碼流程應考慮多因素驗證、錯誤重試限制及通知機制。 `[NEEDS CLARIFICATION: 成功更新密碼後是否需強制登出其他裝置？]`
