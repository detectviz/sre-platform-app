# 通知模組頁面功能規格

以下內容依據 `images/` 目錄的通知相關截圖、React 元件以及 `mock-server` 行為進行逆向規格撰寫。每個段落對應一張截圖，涵蓋現況描述、互動流程、API 與資料流、需求與規格定義。

### notifications-add-channel-email.png

**現況描述**  
- Modal 標題顯示「新增通知管道」或「編輯通知管道」，主體以 `FormRow` 呈現「名稱」、「管道類型」與 Email 專用的收件人欄位，整體背景採用 `bg-slate-800` 深色系並維持平台一致的 12px 圓角。  
- Email 類型的動態區塊包含 To / CC / BCC，皆使用 tag 樣式列出已輸入郵件並提供 `Icon[x]` 移除按鈕。  
- Footer 提供「取消」、「發送測試」、「儲存」三個按鈕；「發送測試」預設禁用且顯示提示（未先儲存無法測試）。

**互動流程**  
- 開啟 Modal 時會重置 `formData` 與 `isTokenVisible`，並預設為第一個 `channel_types`（Email）。  
- 使用者輸入名稱（必填）後，可透過多郵件輸入元件：在欄位中按 Enter / 逗號 / 空白會自動建立標籤，Blur 時也會自動補上最後一筆，貼上多筆時會依分隔符拆解。  
- MultiEmailInput 會檢查基本郵件格式，不合法時以 toast 顯示錯誤訊息且不納入列表。  
- 「發送測試」會驗證 `formData.id` 是否存在；新建狀態需先儲存才可測試。測試成功／失敗時以 toast 呈現訊息並更新 `last_test_result` / `last_tested_at`。  
- 「儲存」僅呼叫 `onSave(formData)`，目前未針對必填欄位做前端驗證或錯誤顯示。`[NEEDS CLARIFICATION: 是否需要在儲存前阻擋空白名稱與空的 To?]`

**API 與資料流**  
- 開啟時透過 `OptionsContext` 預先載入 `/options` 內的 `notification_channels.channel_types` 與 `http_methods` 作為下拉選項。  
- 儲存新建：`POST /settings/notification-channels`；編輯：`PATCH /settings/notification-channels/:id`。  
- 發送測試：`POST /settings/notification-channels/:id/test`，payload 包含自動組成的 `message` 以及可選的 `recipients`。  
- 儲存與測試成功後會由父層重新呼叫 `GET /settings/notification-channels` 以刷新列表。

**需求與規格定義**
- 使用者必須能在單一 Modal 新增或編輯 Email 管道，並以標籤型輸入快速管理多位收件者。  
- 系統須阻擋無效郵件格式並提供即時錯誤提示。  
- 測試功能需在管道已存在（有 `id`）時才開放，並回寫最近測試結果。  
- 儲存後應自動關閉 Modal 並刷新列表；若後端回傳錯誤需顯示提示並保留輸入值。`[NEEDS CLARIFICATION: 儲存失敗時是否以 toast 或 inline error 呈現?]`

### notifications-add-channel-line.png

**現況描述**  
- 與 Email Modal 共用外觀，切換到「LINE Notify」類型時，主體僅顯示「存取權杖 (Access Token)」欄位並提供眼睛圖示切換明碼／隱藏。  
- 欄位背景延續深色系，提示文字採 `text-slate-400`。

**互動流程**  
- 變更 `管道類型` 下拉選單會重置 `config`，確保不同類型的殘留欄位不互相影響。  
- 「存取權杖」欄位可透過右側按鈕在 `password` / `text` 間切換，避免複製時的誤植。  
- 儲存、測試流程與 Email 類型一致；測試時會沿用前述 `message`/`recipients` 邏輯，但 LINE Notify 預期 recipients 為空，由後端依 token 推播。

**API 與資料流**  
- 儲存／測試均對應同樣的 REST 端點。`config.access_token` 以純字串儲存，未加密顯示。  
- 切換類型會透過 `setFormData` 清空 `config`，避免殘留其他類型欄位值。

**需求與規格定義**  
- 使用者可於 Modal 中輸入 LINE Notify Token 並檢視其內容。  
- 明碼切換需維持焦點且不觸發表單提交。  
- Token 欄位為必填；若空白儲存須提示錯誤並阻擋。`[NEEDS CLARIFICATION: 是否要遮罩 token 並提供複製按鈕?]`

### notifications-add-channel-slack.png

**現況描述**  
- Slack 類型會顯示「Incoming Webhook URL」及「提及對象 (Mention)」兩個欄位，皆為一般單行輸入框。  
- Mention 欄位 Placeholder 提示支援 `@channel`, `@here`, `user_id` 等格式。

**互動流程**  
- 使用者需先貼上 Slack Webhook URL；欄位目前未做格式檢查。  
- Mention 欄位非必填，可輸入文字以便後端在訊息前加入提及。  
- 儲存／測試與其他類型一致，測試訊息會透過 Webhook 發送。

**API 與資料流**  
- `config.webhook_url`、`config.mention` 會被送往 `POST/PATCH /settings/notification-channels`。  
- 測試 API 會根據 `recipients` 是否存在決定 payload；Slack 通常僅依 webhook URL。

**需求與規格定義**  
- Modal 需支援輸入 Slack Webhook 並允許可選的 Mention。  
- 保存前應檢查 URL 格式避免空值。`[NEEDS CLARIFICATION: 是否支援 Bot Token 或 Block Kit 設定?]`

### notifications-add-channel-sms.png

**現況描述**  
- 選擇 SMS 類型時僅顯示「收件人手機號碼」欄位，Placeholder 示範國碼格式 `+886...`。  
- 欄位使用 `type="tel"` 提供行動裝置鍵盤優化。

**互動流程**  
- 使用者輸入單一電話號碼；當前不支援多筆。  
- 儲存時 `config.phone_number` 會隨整體 payload 提交；測試訊息同樣依據 `recipients` 清單（若未提供則可能由後端判斷）。

**API 與資料流**  
- 與其他類型共用 REST 端點；電話格式未在前端驗證。  
- 測試 API 發送時會把 `recipients` 視為一維陣列，需要後端處理短信閘道。

**需求與規格定義**  
- 支援輸入國際格式手機號碼並儲存。  
- 若需多收件者，應提供陣列輸入或標註僅支援單一對象。`[NEEDS CLARIFICATION: 是否需要 SMS 供應商/簡訊模板設定?]`

### notifications-add-channel-webhook.png

**現況描述**  
- 「Webhook (通用)」類型顯示兩個欄位：「Webhook URL」及「HTTP 方法」，後者以下拉選單呈現並自動載入 `GET/POST/PUT/...` 等選項。  
- 版面延續深色表單設計，欄位間距以 `space-y-4` 維持一致節奏。

**互動流程**  
- 修改 HTTP 方法會即時更新 `config.http_method`，並允許在 options 尚未載入時顯示「載入中...」。  
- URL 欄位必填，未輸入仍可按儲存（缺少前端驗證）。

**API 與資料流**  
- 儲存與測試端點同前，payload 會包含 `webhook_url` 與 `http_method`。  
- 測試通知將以所選 HTTP 方法呼叫 Webhook，預期後端會模擬發送。

**需求與規格定義**  
- 需支援多種 HTTP 方法供自訂 Webhook 使用。  
- 系統應在儲存前檢查 URL 格式與方法是否可用。`[NEEDS CLARIFICATION: 是否需要自訂 Header 或驗證機制?]`

### notifications-channels-list.png

**現況描述**  
- 通知管道列表頁採工具列 + 表格結構：左側提供「搜尋和篩選」，右側有「欄位設定」與「新增管道」。  
- 表頭第一欄為全選核取方塊，資料列顯示啟用開關、名稱、類型 pill、最新測試結果 pill、最新測試時間等欄位。操作列包含編輯、刪除圖示按鈕。  
- 選取多筆後，工具列切換為批次模式顯示「啟用／停用／刪除」按鈕。

**互動流程**  
- 頁面初始會同時載入 `/settings/notification-channels`、`/ui/icons-config`、欄位設定與欄位定義；若欄位設定為空則使用預設欄位。  
- 切換篩選條件或變更欄位設定後會重新發送 API 取得最新資料並更新 `visibleColumns`。  
- 單筆切換啟用開關會 PATCH 更新，成功後刷新列表。  
- 「新增管道」與「編輯」皆開啟共用 Modal；刪除按鈕會先開啟確認彈窗。  
- 批次操作會 POST `/settings/notification-channels/batch-actions` 並於完成後清空選取。  
- 刪除確認 Modal 提醒此動作無法復原且可能影響策略。

**API 與資料流**  
- 主要 API：`GET /settings/notification-channels`、`GET /ui/icons-config`、`GET/PUT /settings/column-config/{pageKey}`、`GET /pages/columns/{pageKey}`。  
- 單筆操作：`PATCH /settings/notification-channels/:id`、`DELETE /settings/notification-channels/:id`、`POST /settings/notification-channels/:id/test`。  
- 批次操作：`POST /settings/notification-channels/batch-actions`，body 包含 `action` 與 `ids` 陣列。  
- Unified Search Modal 會回傳複合篩選參數寫回 `filters`。

**需求與規格定義**  
- 提供清楚的列表檢視與圖示/顏色提示，讓使用者能快速辨識管道狀態與類型。  
- 需支援欄位自訂與批次操作，並在操作成功後自動刷新資料。  
- 刪除操作須經過確認並顯示受影響風險警語。  
- 若 API 失敗要顯示 `TableError` 並提供重試。

### notifications-history-detail.png

**現況描述**  
- 點擊通知歷史列表列後，右側以 Drawer 彈出「通知詳情: {id}」，內容使用 `pre` 呈現完整 JSON。  
- Drawer Header 右側 `extra` 區域會顯示「重新發送」按鈕（限狀態為 failed 時）或「無可執行動作」。

**互動流程**  
- 使用者選取資料列即開啟 Drawer，`selectedRecord` 狀態更新。  
- 若狀態為 failed，按下「重新發送」會禁用按鈕並顯示 loading icon；成功後關閉 Drawer 並刷新列表。  
- Drawer 可透過 X 或背景遮罩關閉，`selectedRecord` 會重設為 null。

**API 與資料流**  
- 重新發送：`POST /settings/notification-history/:id/resend`。  
- 成功後觸發 `fetchHistory()` 重新呼叫 `GET /settings/notification-history`。

**需求與規格定義**  
- Drawer 需顯示完整通知 payload 以利除錯，並提供失敗通知的重送入口。  
- 重送成功須顯示 toast，失敗亦需提示錯誤。  
- JSON 區域需支援水平滾動避免換行破壞可讀性。

### notifications-send-history.png

**現況描述**  
- 發送歷史主頁面包含工具列（搜尋、欄位設定、匯出）、表格、分頁器。  
- 表格欄位預設顯示時間、策略、管道、接收者、狀態、內容；狀態欄以顏色區分成功 (綠)、失敗 (紅)。  
- 行高與顏色與其他設定頁一致，支援 hover 高亮與點擊開 Drawer。

**互動流程**  
- 初始化時透過 `fetchHistory` 取得列表、欄位設定；若欄位設定為空則使用預設欄位。  
- 搜尋 Modal 回傳的篩選條件會合併 page/page_size 再查詢；切換分頁或每頁筆數時即重新發送 API。  
- 匯出按鈕使用 `exportToCsv`，若列表為空會顯示 toast 提醒。  
- 點擊任一列會開啟上一節描述的 Drawer。

**API 與資料流**  
- `GET /settings/notification-history` 支援 `page`、`page_size` 與篩選參數。  
- 欄位設定 API 同通知管道頁（`GET/PUT /settings/column-config/{pageKey}`、`GET /pages/columns/{pageKey}`）。  
- 匯出流程在前端本地處理，不向後端請求新資料。

**需求與規格定義**  
- 必須提供可篩選、分頁的歷史記錄列表，並支援 CSV 匯出。  
- 匯出功能需避免空檔案並提示使用者。  
- 點擊列需開啟詳情 Drawer，顯示完整 JSON。  
- 若 API 失敗需提供重試入口。

### notifications-strategies-list.png

**現況描述**  
- 通知策略列表結構與管道頁相似：工具列、表格、批次操作。欄位含啟用開關、策略名稱、觸發條件（以標籤組合顯示 AND/OR）、管道數、嚴重度/影響範圍徽章、創建者、最後更新。  
- 操作欄提供編輯、複製、刪除按鈕；複製會以「Copy of {name}」作為預設名稱。  
- 選取多筆後顯示批次啟用/停用/刪除。

**互動流程**  
- 初始載入 `GET /settings/notification-strategies` 與欄位設定。  
- 切換篩選、更新欄位設定會重新查詢。  
- 啟用開關、刪除、批次操作流程與管道頁相同，但端點改為 `/settings/notification-strategies`。  
- 「新增策略」或編輯既有策略會開啟三步驟 Wizard Modal。  
- 刪除前會跳出確認視窗。

**API 與資料流**  
- 主要 API：`GET /settings/notification-strategies`、`GET/PUT /settings/column-config/{pageKey}`、`GET /pages/columns/{pageKey}`。  
- 單筆操作：`PATCH /settings/notification-strategies/:id`、`DELETE /settings/notification-strategies/:id`。  
- 批次操作：`POST /settings/notification-strategies/batch-actions`。  
- 複製功能於前端將原策略資料帶入 Modal，未直接呼叫 API（儲存時才送出）。

**需求與規格定義**  
- 必須提供策略狀態、條件、適用嚴重度/影響的清楚視覺標示。  
- 需支援欄位自訂、批次操作、複製策略、刪除確認。  
- 開啟 Modal 後需載入所有步驟所需選項，避免切換步驟時中斷體驗。

### notifications-strategy-step1.png

**現況描述**  
- Wizard Step1 標題為 `stepTitles[0]`（預設「基本資訊」），表單包含策略名稱、多選嚴重度、多選影響範圍、多選資源群組。  
- 多選使用自訂 `MultiSelectDropdown`，按鈕狀態會顯示已選標籤，展開後呈現核取方塊清單。  
- 上方缺省時顯示 loading 或 placeholder，整體以深色背景與 `border-slate-700`。

**互動流程**  
- Modal 開啟時會呼叫 `/resource-groups` 載入可選清單；載入失敗會顯示 toast。  
- 多選元件支援點擊展開、核取切換、點擊外部自動關閉。  
- 嚴重度 / 影響預設帶入 options 的第一筆值。  
- `selectedGroups` 會同步到父層並在 Step2 推薦通知團隊。  
- 未實作必填驗證：空白仍可下一步。`[NEEDS CLARIFICATION: 是否需阻擋空白策略名稱與未選群組?]`

**API 與資料流**  
- 選項來源：`OptionsContext` (`notification_strategies.severity_levels` / `impact_levels` / `default_condition` 等) + `GET /resource-groups`。  
- 下一步前資料暫存於 `formData` 狀態，尚未送往後端。

**需求與規格定義**  
- 使用者需能指定策略名稱、適用的嚴重度/影響層級與資源群組。  
- 系統需提供資源群組清單並處理載入失敗訊息。  
- 若策略需至少一個資源群組與嚴重度，應在切換步驟前驗證。

### notifications-strategy-step2.png

**現況描述**  
- Step2 主要內容：系統根據 Step1 選定的資源群組顯示建議通知團隊、提供團隊下拉選單、列出可勾選的通知管道。  
- 通知管道以卡片式 checkbox 呈現，顯示名稱與類型。  
- 上方資訊條以 `bg-sky-900/50` 顯示「系統建議」字樣與推薦團隊。

**互動流程**  
- 進入 Step2 時會呼叫 `/iam/teams`、`/settings/notification-channels`、`/resource-groups` 載入團隊、管道與群組資訊。  
- 當所有選取群組的 `owner_team` 相同時顯示建議；否則不顯示。  
- 團隊下拉與管道 checkbox 目前尚未寫回 `formData` 或 `channel_ids`，需補強。`[NEEDS CLARIFICATION: 是否應將選取結果寫入策略以便後端建立 channel_ids 與通知團隊?]`  
- 使用者可勾選多個管道，但缺少 state 綁定導致結果未被保存。

**API 與資料流**  
- 選項 API：`GET /iam/teams`、`GET /settings/notification-channels`、`GET /resource-groups`。  
- 建議團隊為前端依 `owner_team` 判斷，不向後端請求。  
- 目前未將勾選結果寫入 `formData`，提交時 `channel_ids` 仍為原值。

**需求與規格定義**  
- Step2 需允許選擇通知團隊與對應管道，並在完成時寫回策略設定。  
- 系統應根據資源群組自動推薦團隊。  
- 若需支援多管道選取，必須在前端儲存勾選結果並提交至後端。  
- 應提供載入中／失敗提示與重試機制。

### notifications-strategy-step3.png

**現況描述**  
- Step3 命名為「附加條件 (可選)」，提供多組條件列：選擇標籤鍵、運算子 (= / != / ~=)、輸入值，右側有刪除按鈕，下方可「新增 AND 條件」。  
- 內容區塊以 `border-slate-700` 邊框包覆，說明文字提醒需符合所有條件。

**互動流程**  
- 條件列表預設繼承自既有策略的 `trigger_condition`（排除資源群組條件）。  
- 選擇 Key 會清空 Value；若 Options 提供對應值則顯示下拉選項，否則為自由輸入。  
- 點擊垃圾桶移除條件，點擊「新增 AND 條件」會 append 新空白列。  
- 完成後點擊「完成」按鈕會序列化條件並與 Step1 資源群組條件合併為 `trigger_condition`，再透過 `onSave` 傳回父層。

**API 與資料流**  
- 條件鍵值與標籤選項來自 `notification_strategies.condition_keys` 與 `tag_keys/tag_values`。  
- 完成時尚未呼叫後端，需待父層提交 `/settings/notification-strategies`。  
- 若無任何條件，序列化結果為空字串，後端需接受空值或提供預設。

**需求與規格定義**  
- 需支援多組 AND 條件與多種運算子，並於保存時正確序列化。  
- 若引用 Options 中的枚舉值，應自動顯示下拉選單；否則提供自由輸入。  
- 點擊完成後必須將 Step1/Step2/Step3 的設定整合並提交，確保策略的 `trigger_condition` 正確。

