### automation-ai-generate-script-modal.png

**現況描述**  
- 模態窗提供提示輸入區、生成按鈕與結果區塊，結果區支援腳本類型、內容與參數列表，但目前僅以長文區塊呈現且高度依賴使用者自行捲動。 【F:components/GeneratePlaybookWithAIModal.tsx†L75-L145】
- 截圖審查建議指出結果缺乏明顯的捲動提示，且生成的腳本類型未自動帶入來源需求。 【F:pages.md†L177-L179】

**互動流程**  
- 使用者輸入提示並點擊「生成」後會呼叫 AI 生成 API，期間顯示 loading 狀態並清空上次結果。 【F:components/GeneratePlaybookWithAIModal.tsx†L33-L116】
- 生成完成後可檢視結果並點選「套用」將腳本帶回腳本編輯模態，套用時同步關閉視窗。 【F:components/GeneratePlaybookWithAIModal.tsx†L86-L145】

**API 與資料流**  
- 透過 `POST /ai/automation/generate-script` 取得建議腳本，mock server 直接回傳預生成腳本範本。 【F:components/GeneratePlaybookWithAIModal.tsx†L33-L41】【F:mock-server/handlers.ts†L521-L523】
- 回傳結構包含 `type`, `content`, `parameters`，其範例定義於 mock DB。 【F:mock-server/db.ts†L2103-L2109】
- 套用結果後回傳資料會傳遞至父層腳本編輯模態並覆寫目前的類型、內容與參數。 【F:components/AutomationPlaybookEditModal.tsx†L106-L112】

**需求與規格定義**  
- 使用者需求：
  - 需要明確的捲動提示與可視高度限制，以避免長內容造成閱讀負擔。 【F:pages.md†L177-L179】
  - 希望 AI 推薦自動套用與當前情境相符的腳本類型，降低遺漏設定風險。 【F:pages.md†L177-L179】【F:components/AutomationPlaybookEditModal.tsx†L106-L112】
- 系統必須提供的功能：
  - 在結果區加上固定高度與可見捲動條提示，並標示內容長度或提供「複製」操作。 【F:components/GeneratePlaybookWithAIModal.tsx†L95-L145】
  - 生成結果回傳時，同步帶出建議的腳本類型並顯示差異，必要時提示使用者確認覆寫。 【F:components/AutomationPlaybookEditModal.tsx†L106-L112】
- [NEEDS CLARIFICATION: AI 產生內容是否需要顯示模型版本與token成本資訊，以符合可追蹤性需求？]

---

### automation-edit-script-modal.png

**現況描述**  
- 模態窗包含基本資訊欄位、腳本內容 textarea、檔案上傳與 AI 生成按鈕，以及動態參數編輯器。 【F:components/AutomationPlaybookEditModal.tsx†L194-L307】
- UI 審查指出 textarea 缺乏行號與語法高亮，且工具按鈕置於輸入框內部影響一致性。 【F:pages.md†L173-L176】

**互動流程**  
- 開啟時會以現有腳本或預設值初始化表單，並載入可用腳本類型與參數型別。 【F:components/AutomationPlaybookEditModal.tsx†L29-L43】【F:mock-server/db.ts†L2730-L2742】
- 使用者可上傳檔案自動辨識腳本類型、啟動 AI 生成覆寫內容，或動態新增／刪除參數與選項。 【F:components/AutomationPlaybookEditModal.tsx†L115-L299】
- 儲存時透過父層頁面決定是新增或更新腳本並關閉模態。 【F:pages/automation/AutomationPlaybooksPage.tsx†L95-L112】

**API 與資料流**  
- 新增腳本呼叫 `POST /automation/scripts`，更新則使用 `PATCH /automation/scripts/{id}`，mock server 進行欄位驗證與審計記錄。 【F:pages/automation/AutomationPlaybooksPage.tsx†L100-L108】【F:mock-server/handlers.ts†L2366-L2450】
- 儲存成功後重新讀取腳本列表資料與欄位設定。 【F:pages/automation/AutomationPlaybooksPage.tsx†L37-L66】

**需求與規格定義**  
- 使用者需求：
  - 需要具備語法高亮、行號與縮排輔助的編輯體驗，以提升腳本可讀性。 【F:pages.md†L173-L176】
  - 需要一致位置的工具按鈕與更清楚的操作提示，避免遮擋輸入區域。 【F:pages.md†L173-L176】【F:components/AutomationPlaybookEditModal.tsx†L223-L238】
- 系統必須提供的功能：
  - 將 textarea 替換為支援語法高亮的編輯元件（例如 Monaco），並保留目前的上傳、AI 生成流程。 【F:components/AutomationPlaybookEditModal.tsx†L217-L239】
  - 於儲存前驗證必填欄位（名稱、類型、內容）與參數格式，並於錯誤時提示可修正欄位。 【F:mock-server/handlers.ts†L2424-L2438】
- [NEEDS CLARIFICATION: 是否需支援腳本版本註記與變更追蹤，以符合審計要求？]

---

### automation-edit-trigger-event.png

**現況描述**  
- 事件型觸發器提供條件編輯器，可設定鍵、運算子與值，並允許新增／刪除條件。 【F:components/AutomationTriggerEditModal.tsx†L237-L258】
- 目前僅支援以 AND 連結的條件，缺乏 OR 群組或搜尋排序等增強功能。 【F:pages.md†L193-L195】

**互動流程**  
- 切換觸發器類型時會載入預設設定並重設條件集合；事件型會將條件序列化儲存在 `config.event_conditions`。 【F:components/AutomationTriggerEditModal.tsx†L105-L137】
- 鍵為 `severity` 時會載入可選列表，若為標籤鍵則動態載入允許的值。 【F:components/AutomationTriggerEditModal.tsx†L140-L170】【F:mock-server/db.ts†L2776-L2788】

**API 與資料流**  
- 儲存時透過父層呼叫 `POST` 或 `PATCH /automation/triggers/{id}`，後端會驗證名稱、類型與目標腳本存在性。 【F:pages/automation/AutomationTriggersPage.tsx†L102-L125】【F:mock-server/handlers.ts†L2471-L2537】【F:mock-server/db.ts†L1520-L1523】
- 條件字串會以 `A AND B` 格式儲存，供執行時解析。 【F:components/AutomationTriggerEditModal.tsx†L34-L139】

**需求與規格定義**  
- 使用者需求：
  - 需要支援條件群組 (AND/OR) 與搜尋排序，才能覆蓋較複雜的事件判斷。 【F:pages.md†L193-L195】
- 系統必須提供的功能：
  - 於條件編輯器提供群組化 UI 與 JSON 結構儲存，並確保序列化後仍可回填。 【F:components/AutomationTriggerEditModal.tsx†L34-L139】
  - 在鍵選單中提供搜尋與分類，並允許自訂標籤鍵排序。 【F:components/AutomationTriggerEditModal.tsx†L243-L247】
- [NEEDS CLARIFICATION: 事件條件是否需要測試功能以便立即驗證條件是否命中？]

---

### automation-edit-trigger-schedule.png

**現況描述**  
- 排程型觸發器提供 Cron 字串輸入與說明文字，但缺乏下一次執行預覽。 【F:components/AutomationTriggerEditModal.tsx†L222-L228】【F:pages.md†L185-L187】
- 模態寬度固定為 `w-1/2 max-w-2xl`，對於單欄表單可能顯得寬鬆。 【F:components/AutomationTriggerEditModal.tsx†L182-L200】

**互動流程**  
- 當使用者切換至排程類型時，系統會套用預設的 Cron 配置並允許編輯。 【F:components/AutomationTriggerEditModal.tsx†L105-L111】【F:mock-server/db.ts†L2776-L2787】
- 儲存流程同事件型，提交後回到列表刷新資料。 【F:pages/automation/AutomationTriggersPage.tsx†L112-L125】

**API 與資料流**  
- 使用 `POST/PUT` 觸發器 API，mock server 驗證 `type` 是否在 `['schedule','webhook','event']` 並寫入 Cron 設定。 【F:mock-server/handlers.ts†L2471-L2537】
- 預設 Cron 值由 options 服務提供，確保前端有一致的初始化資料。 【F:mock-server/db.ts†L2776-L2787】

**需求與規格定義**  
- 使用者需求：
  - 需要即時看到下一次執行時間與語意化描述以避免 Cron 填寫錯誤。 【F:pages.md†L185-L187】
- 系統必須提供的功能：
  - 整合 Cron 解析器，在輸入後顯示下一次執行時間與錯誤提示；若字串無效需阻擋儲存。 【F:components/AutomationTriggerEditModal.tsx†L222-L228】
  - 調整模態寬度或提供雙欄排版設定，讓排程設定更集中易讀。 【F:components/AutomationTriggerEditModal.tsx†L182-L200】
- [NEEDS CLARIFICATION: Cron 是否需支援語系 (如中文關鍵字) 或預設範本快捷？]

---

### automation-edit-trigger-webhook.png

**現況描述**  
- Webhook 類型顯示唯讀的 URL 與複製按鈕，未提供格式驗證或安全設定。 【F:components/AutomationTriggerEditModal.tsx†L229-L235】
- UI 審查指出缺少 placeholder 與進階設定（Header、驗證等）。 【F:pages.md†L189-L191】

**互動流程**  
- 切換為 Webhook 類型時會載入預設 URL，需要儲存後才真正生成。 【F:components/AutomationTriggerEditModal.tsx†L105-L111】【F:mock-server/db.ts†L2776-L2787】
- 使用者可點擊複製按鈕，若尚未生成會顯示錯誤提示。 【F:components/AutomationTriggerEditModal.tsx†L172-L179】【F:components/AutomationTriggerEditModal.tsx†L229-L235】

**API 與資料流**  
- 儲存時將 Webhook URL 一併寫入 `config.webhook_url`，後端需驗證字串與目標腳本。 【F:mock-server/handlers.ts†L2471-L2537】
- 觸發器列表刷新依舊透過 `/automation/triggers`。 【F:pages/automation/AutomationTriggersPage.tsx†L42-L74】

**需求與規格定義**  
- 使用者需求：
  - 需要清楚的 URL 格式提示與安全選項（簽章、Header）以便整合外部系統。 【F:pages.md†L189-L191】
- 系統必須提供的功能：
  - 在模態中加入 Placeholder、格式驗證、測試 Webhook 的能力，以及可選擇啟用 Secret/Headers。 【F:components/AutomationTriggerEditModal.tsx†L229-L235】
- [NEEDS CLARIFICATION: Webhook URL 是否由後端生成？若需手動指定是否要支援多個 URL 或 IP 白名單？]

---

### automation-run-log-detail.png

**現況描述**  
- 詳細檢視抽屜顯示狀態、腳本名稱、觸發來源、耗時，並分為 stdout/stderr 區塊，但標題僅包含腳本名稱。 【F:components/ExecutionLogDetail.tsx†L42-L80】
- UI 審查建議補充執行編號或時間並調整輸出背景對比。 【F:pages.md†L201-L203】

**互動流程**  
- 於執行歷史列表點選任一列會開啟抽屜，關閉抽屜會重置 `selectedExecution`。 【F:pages/automation/AutomationHistoryPage.tsx†L206-L238】
- `ExecutionLogDetail` 依內容動態顯示參數與 stderr，無內容時顯示預設訊息。 【F:components/ExecutionLogDetail.tsx†L55-L79】

**API 與資料流**  
- 抽屜資料來源於列表載入的執行記錄，包含觸發來源、參數與日誌。 【F:pages/automation/AutomationHistoryPage.tsx†L45-L195】【F:mock-server/db.ts†L1524-L1616】
- Mock API 支援重試 (`POST /automation/executions/{id}/retry`)，成功後可從抽屜重新檢閱結果。 【F:pages/automation/AutomationHistoryPage.tsx†L128-L136】【F:mock-server/handlers.ts†L2452-L2469】

**需求與規格定義**  
- 使用者需求：
  - 需要在標題或概要顯示執行 ID、開始時間與觸發來源，方便對照稽核紀錄。 【F:pages.md†L201-L203】【F:mock-server/db.ts†L1524-L1616】
  - 希望 stderr 與 stdout 有更明顯的視覺差異並支援搜尋/複製。 【F:pages.md†L201-L203】【F:components/ExecutionLogDetail.tsx†L64-L79】
- 系統必須提供的功能：
  - 調整抽屜標題模板（例如 `執行 #{id} - {start_time}`）並加入快速複製連結。 【F:components/ExecutionLogDetail.tsx†L42-L53】
  - 在日誌區塊加入複製按鈕與篩選 (stdout/stderr) 切換，並確保大字串仍能順暢捲動。 【F:components/ExecutionLogDetail.tsx†L64-L79】
- [NEEDS CLARIFICATION: 是否需要與事件/規則詳情連結，提供跨頁導覽？]

---

### automation-run-logs-list.png

**現況描述**  
- 執行歷史頁面以表格呈現腳本名稱、狀態、觸發來源、觸發者、開始時間與耗時，支援排序與批次選取。 【F:pages/automation/AutomationHistoryPage.tsx†L149-L213】
- 截圖指出缺少快速狀態篩選與明顯的「查看輸出」操作圖示。 【F:pages.md†L197-L199】

**互動流程**  
- 使用者可透過工具列開啟搜尋模態、匯出 CSV、調整欄位，或勾選列進行批次匯出。 【F:pages/automation/AutomationHistoryPage.tsx†L197-L213】
- 點擊列會開啟執行詳情抽屜，失敗紀錄可直接在行內點擊重試按鈕。 【F:pages/automation/AutomationHistoryPage.tsx†L166-L238】

**API 與資料流**  
- 主要資料由 `GET /automation/executions` 取得並支援分頁、排序與篩選參數。 【F:pages/automation/AutomationHistoryPage.tsx†L45-L80】【F:mock-server/handlers.ts†L2334-L2361】
- 匯出與重試分別呼叫本地匯出服務與 `POST /automation/executions/{id}/retry`。 【F:pages/automation/AutomationHistoryPage.tsx†L111-L136】【F:mock-server/handlers.ts†L2452-L2469】

**需求與規格定義**  
- 使用者需求：
  - 需要快速依狀態（成功/失敗）或觸發來源篩選，減少開啟搜尋模態的成本。 【F:pages.md†L197-L199】
  - 希望在表格中直接有「查看輸出」圖示提示抽屜存在。 【F:pages.md†L197-L199】【F:pages/automation/AutomationHistoryPage.tsx†L166-L238】
- 系統必須提供的功能：
  - 在工具列新增狀態與來源的快速下拉篩選，並與現有 API 參數整合。 【F:pages/automation/AutomationHistoryPage.tsx†L45-L80】
  - 在操作列或腳本名稱旁加入「查看日誌」按鈕，點擊後觸發抽屜開啟。 【F:pages/automation/AutomationHistoryPage.tsx†L166-L238】
- [NEEDS CLARIFICATION: 是否需支援自動刷新與背景輪詢以監控長時間執行？]

---

### automation-scripts-list.png

**現況描述**  
- 腳本列表表格預設欄位為名稱、觸發來源、最近狀態、最近時間與運行次數，缺少腳本語言或標籤資訊。 【F:pages/automation/AutomationPlaybooksPage.tsx†L165-L188】
- 審查意見指出統計卡片仍為英文文案且表格難以辨識腳本類型。 【F:pages.md†L169-L172】

**互動流程**  
- 工具列提供欄位設定、新增腳本按鈕，以及批次刪除已勾選項目。 【F:pages/automation/AutomationPlaybooksPage.tsx†L192-L213】
- 列操作包含執行、編輯、刪除；執行會開啟執行模態並在成功後刷新列表。 【F:pages/automation/AutomationPlaybooksPage.tsx†L214-L261】【F:components/RunPlaybookModal.tsx†L47-L88】
- 刪除支援單筆與批次刪除，均於完成後重新載入資料。 【F:pages/automation/AutomationPlaybooksPage.tsx†L114-L140】

**API 與資料流**  
- 列表透過 `GET /automation/scripts` 取得資料與欄位設定，並以 `/settings/column-config/{key}` 儲存顯示欄位。 【F:pages/automation/AutomationPlaybooksPage.tsx†L37-L83】【F:mock-server/handlers.ts†L2334-L2350】
- 執行腳本呼叫 `POST /automation/scripts/{id}/execute`，mock server 會立即新增一筆執行紀錄並在背景更新狀態。 【F:components/RunPlaybookModal.tsx†L47-L55】【F:mock-server/handlers.ts†L2393-L2421】
- 刪除與批次刪除分別對應 `DELETE /automation/scripts/{id}` 與 `POST /automation/scripts/batch-actions`。 【F:pages/automation/AutomationPlaybooksPage.tsx†L119-L140】【F:mock-server/handlers.ts†L2366-L2412】

**需求與規格定義**  
- 使用者需求：
  - 需要快速辨別腳本語言、擁有者或標籤，以利搜尋和治理。 【F:pages.md†L169-L172】
  - 需要在統計卡片中使用本地化文字以保持一致性。 【F:pages.md†L169-L172】
- 系統必須提供的功能：
  - 新增 `type`、`owner` 或標籤欄位並支援快速篩選，資料來源來自腳本定義。 【F:pages/automation/AutomationPlaybooksPage.tsx†L165-L188】【F:mock-server/db.ts†L1520-L1523】
  - 將統計卡片文案加入多語系資源並支援自訂描述。 【F:pages.md†L169-L172】
- [NEEDS CLARIFICATION: 是否需支援腳本狀態（啟用/停用）欄位與批次啟停功能？]

---

### automation-triggers-list.png

**現況描述**  
- 觸發器列表顯示啟用切換、名稱、類型 Pill、目標腳本與最後觸發時間；缺少最近結果指標。 【F:pages/automation/AutomationTriggersPage.tsx†L195-L219】
- 審查建議統一 Pill 顏色並顯示上次執行結果。 【F:pages.md†L181-L183】

**互動流程**  
- 工具列支援搜尋、欄位設定、新增觸發器與批次啟用/停用/刪除。 【F:pages/automation/AutomationTriggersPage.tsx†L171-L183】
- 列操作允許編輯與刪除；啟用切換立即呼叫 API 更新狀態。 【F:pages/automation/AutomationTriggersPage.tsx†L193-L220】
- 儲存與刪除後會重新載入觸發器與腳本清單。 【F:pages/automation/AutomationTriggersPage.tsx†L42-L125】

**API 與資料流**  
- 列表資料來自 `GET /automation/triggers`，同時載入 `/automation/scripts` 以顯示目標腳本名稱。 【F:pages/automation/AutomationTriggersPage.tsx†L42-L74】【F:mock-server/handlers.ts†L2334-L2351】
- 新增／更新透過 `POST` 或 `PATCH /automation/triggers/{id}`，批次動作呼叫 `/automation/triggers/batch-actions`。 【F:pages/automation/AutomationTriggersPage.tsx†L102-L175】【F:mock-server/handlers.ts†L2471-L2537】
- Mock 資料目前僅有單一觸發器範例，可作為欄位範本。 【F:mock-server/db.ts†L1618-L1620】

**需求與規格定義**  
- 使用者需求：
  - 需要直接看到最近一次觸發結果與成功/失敗狀態，便於快速巡檢。 【F:pages.md†L181-L183】【F:mock-server/db.ts†L1524-L1616】
  - 需要一致的色彩語言，與其他模組共用設計系統。 【F:pages.md†L181-L183】
- 系統必須提供的功能：
  - 新增「上次執行狀態」欄位並顯示對應色彩，同步串接執行歷史資料。 【F:pages/automation/AutomationTriggersPage.tsx†L195-L219】【F:mock-server/db.ts†L1524-L1616】
  - Pill 樣式改為共用樣式表並支援主題設定。 【F:pages/automation/AutomationTriggersPage.tsx†L185-L212】
- [NEEDS CLARIFICATION: 列表是否需支援依觸發條件/腳本分類的群組檢視？]

