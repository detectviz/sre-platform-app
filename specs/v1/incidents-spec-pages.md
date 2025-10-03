### incidents-alert-rule-wizard-step1.png

**現況描述**  
- 精靈首步呈現雙欄版面：左側依監控目標類型列出篩選按鈕，右側顯示可捲動的範本卡片清單，卡片內容含概要、預設條件與通知示例，並以顏色框線高亮已選範本，符合整體藍灰配色規範。【F:components/AlertRuleEditModal.tsx†L73-L200】

**互動流程**  
- 初次開啟會同時載入監控資源類型與可用範本，載入完成前使用骨架畫面；使用者可透過左側類型切換、右上搜尋框即時縮小結果，再以按鈕選定範本以啟用「下一步」。【F:components/AlertRuleEditModal.tsx†L31-L137】【F:components/AlertRuleEditModal.tsx†L970-L1000】
- 若尚未選取範本便嘗試前進，系統會以 toast 阻擋並提醒使用者完成選取，確保流程完整性。【F:components/AlertRuleEditModal.tsx†L970-L1000】

**API 與資料流**  
- 進入步驟時同步呼叫 `GET /alert-rules/resource-types` 與 `GET /alert-rules/templates` 取得篩選條件與範本資料，並於 Mock Server 端提供對應資料來源。【F:components/AlertRuleEditModal.tsx†L31-L137】【F:mock-server/handlers.ts†L1152-L1183】
- 若為新增流程，下一步會預先取得 `GET /alert-rules/templates/default` 以併入範本預設值，並於狀態中保存後續步驟所需的基礎設定。【F:components/AlertRuleEditModal.tsx†L907-L998】【F:mock-server/handlers.ts†L1152-L1183】

**需求與規格定義**  
- 使用者必須能依資源類型與關鍵字即時篩選範本，結果需即時反應且保留一致的載入指示。【F:components/AlertRuleEditModal.tsx†L73-L200】
- 精靈於未選取範本時禁止前進並顯示提示，避免生成無內容的規則草稿。【F:components/AlertRuleEditModal.tsx†L970-L1000】
- 範本卡片需顯示條件與自動化提示文字，確保不同設計語系時版面仍維持一致寬度與配色；如需更多欄位應先評估卡片高度的一致性。[NEEDS CLARIFICATION: 範本摘要是否需支援多語或超連結內容]

---

### incidents-alert-rule-wizard-step2-basic.png

**現況描述**  
- 第二步聚焦規則基本資料：上方提供名稱與描述欄位，下方以卡片呈現監控範圍設定、附加標籤篩選與符合資源預覽，整體採一致的卡片陰影與標題樣式。【F:components/AlertRuleEditModal.tsx†L308-L399】

**互動流程**  
- 進入步驟即載入資源群組與資源列表，使用者可依「全部／群組／特定資源」模式切換；每次切換會重設已選清單，避免過期條件殘留。【F:components/AlertRuleEditModal.tsx†L231-L367】
- 標籤篩選器採 Key-Value 動態列，支援多值以逗號分隔並轉為 `=~` 正則；任何變更會即時拼接到 `target` 字串並於 500ms 後觸發資源數量預覽，若 API 失敗則顯示 `N/A`。【F:components/AlertRuleEditModal.tsx†L243-L299】【F:components/AlertRuleEditModal.tsx†L379-L399】

**API 與資料流**  
- 需求資源群組與實例清單時分別呼叫 `GET /resource-groups` 與 `GET /resources?page_size=1000`，由 Mock Server 提供分頁資料。【F:components/AlertRuleEditModal.tsx†L231-L238】【F:mock-server/handlers.ts†L2210-L2215】【F:mock-server/handlers.ts†L1564-L1599】
- 預覽符合資源數量透過 `GET /resources/count?query=...` 完成，伺服端會回傳符合條件的模擬數值以支援即時回饋。【F:components/AlertRuleEditModal.tsx†L293-L296】【F:mock-server/handlers.ts†L1595-L1599】

**需求與規格定義**  
- 範圍切換與篩選變更須即時同步更新 `target` 字串並重新計算預覽數量，避免提交時產生與 UI 不一致的查詢條件。【F:components/AlertRuleEditModal.tsx†L243-L299】
- 多選清單需支援大量資源時的捲動與搜尋，並保證切換模式時會清除舊資料以維持一致性。【F:components/AlertRuleEditModal.tsx†L347-L365】
- 若後端未在 1 秒內回應預覽數量，前端應保持載入狀態，避免顯示錯誤數據。[NEEDS CLARIFICATION: 是否需增加逾時提示或重試機制]

---

### incidents-alert-rule-wizard-step2-scope.png

**現況描述**  
- 畫面延續第二步，強調標籤條件與預覽資訊：使用者可透過 Key-Value 輸入元件增加多組標籤、以小圓點列出使用說明，並於底部顯示預估影響的資源數量徽章。【F:components/AlertRuleEditModal.tsx†L369-L399】

**互動流程**  
- 每新增或移除標籤條件即重新組合 `target` 字串，並觸發 debounce 預覽；空白鍵值會被濾除，確保查詢語句有效。【F:components/AlertRuleEditModal.tsx†L256-L299】【F:components/AlertRuleEditModal.tsx†L379-L385】
- 預覽徽章會根據 API 反應顯示數字或 `N/A`，若仍載入則顯示旋轉圖示，保持操作的一致視覺語言。【F:components/AlertRuleEditModal.tsx†L391-L399】

**API 與資料流**  
- 與前一螢幕共用 `GET /resources` 及 `GET /resources/count` 端點；多筆標籤轉換後透過查詢字串傳入後端，預計由 Mock Server 以隨機或範本值回傳。【F:components/AlertRuleEditModal.tsx†L243-L299】【F:mock-server/handlers.ts†L1564-L1599】

**需求與規格定義**  
- Key-Value 控制需支援多值與正則語法，並在 UI 上標記其會以 OR 邏輯解讀，確保使用者理解查詢結果。【F:components/AlertRuleEditModal.tsx†L256-L385】
- 當後端回傳 `N/A` 或失敗時，應顯示明確提示並允許重試，避免使用者誤認預覽數量為 0。[NEEDS CLARIFICATION: 預覽失敗是否需阻擋下一步]

---

### incidents-alert-rule-wizard-step3.png

**現況描述**  
- 第三步（程式內 Step2）呈現條件群組列表，上方顯示事件等級切換，群組內以行內表單配置指標、運算子、閾值與持續時間欄位，整體對齊且維持深色主題對比。【F:components/AlertRuleEditModal.tsx†L406-L549】

**互動流程**  
- 使用者可新增 OR 群組或在群組內加入 AND 條件，每個欄位都提供下拉或數字輸入，刪除按鈕會即時移除該條件並更新狀態。【F:components/AlertRuleEditModal.tsx†L438-L548】
- 事件等級按鈕使用 options 提供的枚舉，切換時會以不同底色表示當前選擇，確保一致的視覺語言。【F:components/AlertRuleEditModal.tsx†L478-L496】

**API 與資料流**  
- 指標下拉於進入步驟時呼叫 `GET /alert-rules/metrics` 取得可選列表，Mock Server 亦支援 `GET /alert-rules` 的 `metrics` 特殊 ID 提供靜態資料。【F:components/AlertRuleEditModal.tsx†L414-L423】【F:mock-server/handlers.ts†L1152-L1183】
- AI 分析按鈕於稍後列表頁統一觸發 `POST /ai/alert-rules/analyze`，不在此步執行，但應確保條件資料在保存時同步回傳。【F:pages/incidents/AlertRulePage.tsx†L188-L205】【F:mock-server/handlers.ts†L468-L498】

**需求與規格定義**  
- 至少需保有一個條件群組及一筆 AND 條件；刪除最後一筆應禁用以避免空集合導致後端錯誤。[NEEDS CLARIFICATION: 是否需新增最少條件的驗證提示]
- 閾值輸入須支援單位顯示（如指標單位），確保顯示文字不與輸入框重疊。【F:components/AlertRuleEditModal.tsx†L528-L537】

---

### incidents-alert-rule-wizard-step4.png

**現況描述**  
- 第四步（程式內 Step3）提供通知內容編輯：標題與內容欄位採 Monospace 風格，旁邊以卡片列出可插入的變數並附說明；底部還可維護規則與事件標籤集合。【F:components/AlertRuleEditModal.tsx†L554-L657】

**互動流程**  
- 焦點位於標題或內容時，點擊變數清單會直接插入對應 token；標籤輸入亦支援多值並序列化為 `key:value` 陣列，以保持事件中繼資料一致。【F:components/AlertRuleEditModal.tsx†L571-L657】
- 鍵入過程會即時更新狀態，返回上一步時仍保留內容，確保跨步驟一致性。【F:components/AlertRuleEditModal.tsx†L907-L963】

**API 與資料流**  
- 變數列表取自 `options.alert_rules.variables` 或內容設定檔；標籤結果會在保存時併入 `labels` 陣列並提交至 `POST/PATCH /alert-rules`。【F:components/AlertRuleEditModal.tsx†L562-L657】【F:pages/incidents/AlertRulePage.tsx†L119-L135】

**需求與規格定義**  
- 變數面板需支援 tooltip 說明，並確保未聚焦時點擊不會插入文字以避免誤操作。【F:components/AlertRuleEditModal.tsx†L571-L640】
- 標籤輸入欄必須驗證 key 與 value 非空，並將逗號拆解為多值；UI 應提示分隔規則以維持資料一致性。【F:components/AlertRuleEditModal.tsx†L603-L657】

---

### incidents-alert-rule-wizard-step5.png

**現況描述**  
- 最後一步顯示自動化設定卡片，頂部提供啟用切換並以資訊欄描述用途；若啟用則展開腳本下拉、參數表單與提示文字，延續深色卡片風格。【F:components/AlertRuleEditModal.tsx†L662-L829】

**互動流程**  
- 切換啟用後自動載入腳本列表，選取腳本時依其參數型別渲染對應輸入元件（布林、列舉、數字等），並寫回 `automation.parameters`。【F:components/AlertRuleEditModal.tsx†L678-L821】
- 若切換為停用，系統會清除 `script_id` 與參數，避免提交冗餘設定。【F:components/AlertRuleEditModal.tsx†L678-L706】

**API 與資料流**  
- 腳本列表透過 `GET /automation/scripts` 取得；Mock Server 指南亦列出該端點供整合，需確認實作對應資料。【F:components/AlertRuleEditModal.tsx†L668-L772】【F:docs/MOCK_SERVER_GUIDE.md†L93-L97】
- 儲存時會將 `automation_enabled` 旗標與參數一併送至 `POST/PATCH /alert-rules`，後端須能處理 boolean 與多型別參數。【F:components/AlertRuleEditModal.tsx†L946-L957】【F:pages/incidents/AlertRulePage.tsx†L119-L135】

**需求與規格定義**  
- 啟用狀態需即時反映在 UI 上並控制表單可編輯性，確保關閉時不會殘留舊值。【F:components/AlertRuleEditModal.tsx†L678-L707】
- 參數輸入需支援單位與提示文本，並於送出前驗證必填參數不可空白。[NEEDS CLARIFICATION: Mock Server 是否提供腳本參數結構以進行前端驗證]

---

### incidents-alert-rules-column-settings.png

**現況描述**  
- 欄位設定彈窗以雙欄布局呈現可用欄位與已顯示欄位，每列提供拖拉圖示、上下移按鈕與加入/移除控制，色系與其他模態一致。【F:components/ColumnSettingsModal.tsx†L16-L200】

**互動流程**  
- 開啟時會根據目前可見欄位初始化狀態，使用者可將欄位加入或移除，並調整順序後點擊儲存寫回設定；取消則關閉且不改動狀態。【F:components/ColumnSettingsModal.tsx†L28-L117】
- 儲存成功會透過回呼回寫新欄位順序並關閉彈窗，同時顯示成功訊息。【F:components/ColumnSettingsModal.tsx†L90-L117】

**API 與資料流**  
- 目前列表頁會向後端請求 `/pages/columns/{pageKey}` 與 `/settings/column-config/{pageKey}` 取得預設欄位與個人化設定，但 Mock Server 尚未實作該端點，需補足或於規格中明確定義。【F:pages/incidents/AlertRulePage.tsx†L50-L93】【F:pages/incidents/IncidentListPage.tsx†L67-L127】

**需求與規格定義**  
- 欄位設定應保存使用者順序並於重新載入時套用，建議後端提供 GET/PUT 端點支援；未實作前需標註為待開發。[NEEDS CLARIFICATION: Mock Server 需補齊 /settings/column-config 與 /pages/columns 端點以利測試]
- 若可用欄位為空時應顯示說明文字，維持一致的空狀態樣式。【F:components/ColumnSettingsModal.tsx†L98-L116】

---

### incidents-alert-rules-list.png

**現況描述**  
- 告警規則列表包含工具列、表格與彈窗：提供批次操作（AI 分析、啟用/停用、刪除、匯入/匯出）、單筆操作按鈕及欄位設定入口；表格欄位含啟用切換、嚴重性膠囊與自動化狀態徽章。【F:pages/incidents/AlertRulePage.tsx†L279-L348】

**互動流程**  
- 勾選列後可觸發批次 API，單筆操作則開啟編輯、複製或刪除彈窗；AI 分析會開啟模態並於載入時顯示旋轉圖示。【F:pages/incidents/AlertRulePage.tsx†L168-L205】【F:pages/incidents/AlertRulePage.tsx†L307-L399】
- 新增或編輯規則會開啟多步驟精靈，保存成功後重新載入列表並顯示 toast。【F:pages/incidents/AlertRulePage.tsx†L98-L135】

**API 與資料流**  
- 列表初始化會同時取得 `GET /alert-rules`、欄位設定與欄位定義；批次操作則使用 `POST /alert-rules/batch-actions`，刪除/更新分別對應 `DELETE` 與 `PATCH` 端點，Mock Server 均已實作。【F:pages/incidents/AlertRulePage.tsx†L50-L177】【F:mock-server/handlers.ts†L1152-L1440】
- AI 分析呼叫 `POST /ai/alert-rules/analyze`，伺服器會回傳模擬報告並支援無選取時的錯誤訊息。【F:pages/incidents/AlertRulePage.tsx†L188-L205】【F:mock-server/handlers.ts†L468-L498】
- 匯入匯出透過 `/alert-rules/import` 與 CSV 產生，需確保資料欄位與後端欄位名稱一致。【F:pages/incidents/AlertRulePage.tsx†L208-L232】【F:mock-server/handlers.ts†L1244-L1296】

**需求與規格定義**  
- 欄位顯示需依個人設定維持順序，啟用切換要即時更新狀態並顯示失敗提示。【F:pages/incidents/AlertRulePage.tsx†L234-L277】
- 批次操作需處理零選取情境並給出清楚提示，AI 分析應顯示錯誤訊息與重試入口。【F:pages/incidents/AlertRulePage.tsx†L188-L205】
- 刪除操作必須以彈窗再次確認，並將操作紀錄寫入審計日誌以利追蹤。【F:pages/incidents/AlertRulePage.tsx†L365-L379】【F:mock-server/handlers.ts†L1400-L1419】

---

### incidents-assign-modal.png

**現況描述**  
- 指派模態顯示標題、下拉選單與被選工程師的詳細資訊標籤，並於底部提供取消與確認按鈕，維持統一的深色主題與圓角樣式。【F:components/AssignIncidentModal.tsx†L15-L95】

**互動流程**  
- 開啟時會載入可用使用者並預設選中目前指派者；選擇不同成員時會即時顯示其電子郵件、團隊、角色與啟用狀態，確認後觸發父層回呼提交指派操作。【F:components/AssignIncidentModal.tsx†L20-L95】【F:pages/incidents/IncidentListPage.tsx†L226-L236】

**API 與資料流**  
- 需求依賴 `GET /iam/users?page_size=1000` 取得候選清單，並於確認時送出 `POST /incidents/{id}/actions` 帶入 `assign` 參數；Mock Server 說明文件列出對應 IAM 端點，但實際 handlers 需補完人員 API。【F:components/AssignIncidentModal.tsx†L20-L38】【F:pages/incidents/IncidentDetailPage.tsx†L96-L103】【F:docs/MOCK_SERVER_GUIDE.md†L93-L103】【F:mock-server/handlers.ts†L993-L1054】

**需求與規格定義**  
- 模態需處理無使用者時的空狀態與載入指示，並提供顯示錯誤資訊的機制避免空白畫面。【F:components/AssignIncidentModal.tsx†L62-L74】
- 提交後應在列表與詳情頁重新載入資料，確保指派結果立即反映；未載入 IAM 端點前需標示為待串接。[NEEDS CLARIFICATION: Mock Server 需補上 `/iam/users` 端點以進行整合測試]

---

### incidents-detail-ai-analysis.png

**現況描述**  
- 事故詳情中的 AI 分析卡片顯示標題、重新分析按鈕與內容區塊：無分析時提供行動呼籲，有分析時使用 `AIAnalysisDisplay` 組件依報告型別呈現摘要、根因與建議列表。【F:pages/incidents/IncidentDetailPage.tsx†L247-L278】【F:components/AIAnalysisDisplay.tsx†L11-L125】

**互動流程**  
- 使用者點擊「生成/重新分析」會切換載入動畫，完成後更新事件的 `ai_analysis` 屬性並刷新畫面；錯誤時以 toast 呈現失敗資訊。【F:pages/incidents/IncidentDetailPage.tsx†L105-L118】【F:components/AIAnalysisDisplay.tsx†L82-L124】

**API 與資料流**  
- 分析流程呼叫 `POST /ai/incidents/analyze`，Mock Server 會依傳入 ID 數量回傳單筆或多筆分析結果；完成後回寫至事件狀態供後續顯示。【F:pages/incidents/IncidentDetailPage.tsx†L105-L118】【F:mock-server/handlers.ts†L468-L519】
- 詳情頁初始資料來自 `GET /incidents/{id}`，同時利用 options 解析狀態、嚴重性等枚舉顯示對應徽章。【F:pages/incidents/IncidentDetailPage.tsx†L40-L213】【F:mock-server/handlers.ts†L683-L748】

**需求與規格定義**  
- 無分析結果時必須提供明確 CTA 並保持一致的留白；分析結果需支援建議動作按鈕導向自動化或其他頁面。【F:components/AIAnalysisDisplay.tsx†L45-L78】
- 再次分析應避免重複提交，建議於載入時停用按鈕並提示使用者等待。【F:pages/incidents/IncidentDetailPage.tsx†L247-L278】

---

### incidents-detail-timeline.png

**現況描述**  
- 時間軸段落使用垂直線與節點呈現事件歷史，節點圖示顏色依動作類型變化，右側顯示標題、時間、操作者與詳情卡片，長文會包在有捲動的區塊中。【F:pages/incidents/IncidentDetailPage.tsx†L281-L365】

**互動流程**  
- 使用者可於底部輸入備註並送出；若為本人新增的備註，滑鼠懸停卡片時會顯示刪除按鈕以移除該筆記錄。【F:pages/incidents/IncidentDetailPage.tsx†L286-L335】
- 點擊刪除會開啟確認模態，確認後透過 `delete_note` 動作更新歷史並重新整理畫面。【F:pages/incidents/IncidentDetailPage.tsx†L336-L364】【F:mock-server/handlers.ts†L993-L1054】

**API 與資料流**  
- 歷史列表源自 `GET /incidents/{id}`；新增、刪除備註與其他操作統一透過 `POST /incidents/{id}/actions` 傳遞 `action` 參數，Mock Server 會更新狀態與歷史紀錄。【F:pages/incidents/IncidentDetailPage.tsx†L40-L118】【F:mock-server/handlers.ts†L993-L1054】

**需求與規格定義**  
- 每個歷史節點需顯示標準化中文動作名稱，並透過 `translateAction/Details` 確保字詞一致；若未提供對應翻譯應標記為原始字串。【F:pages/incidents/IncidentDetailPage.tsx†L120-L160】
- 備註刪除必須檢查權限（目前限定本人），未來若加入角色權限需更新邏輯與提示。[NEEDS CLARIFICATION: 是否允許管理員刪除他人備註]

---

### incidents-list-overview.png

**現況描述**  
- 事件列表頁包含 KPI 區、工具列與表格；表格支援選取列、狀態/嚴重性徽章、指派按鈕與快速靜音操作，整體延續平台色彩與陰影設計。【F:pages/incidents/IncidentListPage.tsx†L348-L393】

**互動流程**  
- 工具列提供搜尋、匯入/匯出與欄位設定；勾選列後顯示批次 AI 分析、認領、解決等按鈕，點擊列可開啟右側抽屜顯示詳情。【F:pages/incidents/IncidentListPage.tsx†L328-L405】
- 認領/解決/指派/靜音均透過模態確認並於完成後刷新列表，同時顯示成功或失敗提示。【F:pages/incidents/IncidentListPage.tsx†L147-L198】【F:pages/incidents/IncidentListPage.tsx†L401-L432】

**API 與資料流**  
- 載入列表時同時取得 `GET /incidents`、欄位設定、欄位定義與 `GET /iam/users`；批次操作與個別操作皆送至 `POST /incidents/{id}/actions` 或批次端點，Mock Server 已支援相關行為。【F:pages/incidents/IncidentListPage.tsx†L67-L198】【F:mock-server/handlers.ts†L683-L1054】
- 匯入模態使用 `/incidents/import`，匯出則於前端根據選取列產出 CSV。【F:pages/incidents/IncidentListPage.tsx†L130-L145】【F:mock-server/handlers.ts†L954-L955】

**需求與規格定義**  
- 表格需支援分頁與每頁筆數調整，並在換頁時清空選取狀態以避免誤操作。【F:pages/incidents/IncidentListPage.tsx†L41-L110】
- 快速靜音按鈕應開啟對應模態並預填事件資訊，批次選取為零時需停用 AI 分析按鈕以符合使用預期。【F:pages/incidents/IncidentListPage.tsx†L167-L217】

---

### incidents-silence-modal.png

**現況描述**  
- 快速靜音模態顯示事件摘要、資源與可選的靜音時長按鈕，底部提供預估解除時間與提醒文字，整體維持玻璃質感視覺。【F:components/QuickSilenceModal.tsx†L45-L108】

**互動流程**  
- 開啟時會預設第一個可用時長，使用者可點選不同時段按鈕，按下「建立靜音」後將事件 ID 與時數回傳給呼叫方。【F:components/QuickSilenceModal.tsx†L19-L84】
- 若尚未選取事件或 options 尚未載入則停用確認按鈕，並顯示對應的骨架或錯誤訊息。【F:components/QuickSilenceModal.tsx†L15-L84】

**API 與資料流**  
- 保存時列表頁會建立靜音規則 `POST /silence-rules`，同時對事件送出 `action: silence` 以更新歷史紀錄並反映狀態。【F:pages/incidents/IncidentListPage.tsx†L172-L197】【F:mock-server/handlers.ts†L1441-L1521】【F:mock-server/handlers.ts†L993-L1042】
- 靜音時長選項來自 Options Context，需要確保後端配置與前端枚舉一致。【F:components/QuickSilenceModal.tsx†L15-L84】

**需求與規格定義**  
- 模態必須顯示靜音解除時間的在地化格式，並於時長變更時即時計算，避免使用者誤判。【F:components/QuickSilenceModal.tsx†L33-L96】
- 若後端建立靜音規則失敗需顯示錯誤並保留模態開啟狀態以便重試。【F:pages/incidents/IncidentListPage.tsx†L189-L197】

---

### incidents-silence-rule-wizard-step1.png

**現況描述**  
- 靜音規則精靈第一步提供快速套用範本的按鈕列以及名稱、描述欄位，維持簡潔表單版面。【F:components/SilenceRuleEditModal.tsx†L170-L214】

**互動流程**  
- 進入時呼叫 `GET /silence-rules/templates` 取得範本並允許點擊套用，套用後會覆寫目前表單值且標記已選範本，使用者仍可調整名稱與描述。【F:components/SilenceRuleEditModal.tsx†L174-L214】

**API 與資料流**  
- 範本資料由 Mock Server 端 `GET /silence-rules` 的 `templates` 特殊路徑提供；保存時依據是否為編輯決定使用 `POST` 或 `PATCH`。【F:components/SilenceRuleEditModal.tsx†L174-L214】【F:mock-server/handlers.ts†L1422-L1561】

**需求與規格定義**  
- 套用範本後應明確標示已套用的樣式，並允許再次套用覆寫；若範本缺少名稱則保留使用者輸入值。【F:components/SilenceRuleEditModal.tsx†L180-L205】
- 名稱欄位為必填，需在儲存前驗證不可為空字串。【F:components/SilenceRuleEditModal.tsx†L208-L214】

---

### incidents-silence-rule-wizard-step2-once.png

**現況描述**  
- 單次靜音排程顯示在第二步的卡片中，包含排程類型切換與開始/結束時間欄位，維持雙欄輸入布局。【F:components/SilenceRuleEditModal.tsx†L218-L258】

**互動流程**  
- 切換為單次模式會顯示 datetime-local 欄位並移除 cron 設定；切換動作會自動填入預設開始與結束時間並清除重複排程欄位。【F:components/SilenceRuleEditModal.tsx†L227-L256】

**API 與資料流**  
- 排程資料儲存於 `schedule` 物件並於送出時一併提交至 `/silence-rules`，後端負責轉換為最終時間窗；Mock Server 會驗證必填欄位並產生 ID。【F:components/SilenceRuleEditModal.tsx†L223-L290】【F:mock-server/handlers.ts†L1441-L1521】

**需求與規格定義**  
- 當排程類型切換時需清理不適用欄位（例如 cron），避免送出混合資料；開始時間必須早於結束時間。[NEEDS CLARIFICATION: 是否需在前端加入時間驗證提示]

---

### incidents-silence-rule-wizard-step2-recurring.png

**現況描述**  
- 週期性靜音模式提供頻率下拉、執行時間、星期選擇與 Cron 欄位，支援多種重複設定並使用卡片收納說明文字。【F:components/SilenceRuleEditModal.tsx†L259-L288】

**互動流程**  
- 選擇週期類型時會顯示對應的互動元件（例如星期按鈕），點選多日會自動轉為 `~=` 運算表示 OR 條件；Cron 欄位支援手動輸入並顯示範例說明。【F:components/SilenceRuleEditModal.tsx†L259-L288】

**API 與資料流**  
- 週期設定同樣包在 `schedule` 物件中提交；Mock Server 目前僅檢查欄位是否存在，建議後續加入 Cron 驗證以避免錯誤時間窗。【F:components/SilenceRuleEditModal.tsx†L223-L288】【F:mock-server/handlers.ts†L1441-L1521】

**需求與規格定義**  
- UI 需指示週期欄位的優先順序（例如 Cron 將覆寫前兩個欄位），以免造成認知落差。[NEEDS CLARIFICATION: 是否需自動同步 Cron 與頻率設定]
- 星期選擇按鈕需支援多選狀態顯示並提供可視化反饋。【F:components/SilenceRuleEditModal.tsx†L273-L281】

---

### incidents-silence-rule-wizard-step3.png

**現況描述**  
- 第三步聚焦靜音條件：以表格樣式列出匹配條件（標籤鍵、運算子、值）並提供新增/刪除控制，下方另有預覽卡片顯示預計靜音的告警規則數量與立即啟用開關。【F:components/SilenceRuleEditModal.tsx†L293-L409】

**互動流程**  
- 選擇允許值時會顯示多選下拉，支援自動切換為正則運算子；任何欄位變更皆觸發 500ms 延遲後重新呼叫預覽 API。【F:components/SilenceRuleEditModal.tsx†L339-L399】
- 勾選「立即啟用」會更新 `enabled` 狀態並反映在最終 payload。【F:components/SilenceRuleEditModal.tsx†L404-L407】

**API 與資料流**  
- 預覽使用 `GET /alert-rules/count?matchers=...` 計算受影響規則數；Mock Server 會解析傳入 matchers 並回傳計數。【F:components/SilenceRuleEditModal.tsx†L328-L355】【F:mock-server/handlers.ts†L1152-L1196】
- 儲存時將 matchers 與 schedule 一併送至 `/silence-rules`，Mock Server 會驗證必要欄位並產生 ID。【F:components/SilenceRuleEditModal.tsx†L293-L409】【F:mock-server/handlers.ts†L1441-L1521】

**需求與規格定義**  
- 匹配條件需避免空白 key/value，前端應提供錯誤提示；多值應使用 `|` 串接並自動切換運算子，維持查詢一致性。【F:components/SilenceRuleEditModal.tsx†L339-L370】
- 預覽失敗時需顯示錯誤或 `N/A` 並允許重試，避免誤判靜音範圍過廣或過窄。【F:components/SilenceRuleEditModal.tsx†L328-L399】

---

### incidents-silence-rules-list.png

**現況描述**  
- 靜音規則列表延續 Alert Rule 表格樣式，提供批次操作、欄位設定與單筆編輯/刪除；欄位包含啟用切換、規則類型膠囊、條件摘要與排程描述。【F:pages/incidents/SilenceRulePage.tsx†L211-L304】

**互動流程**  
- 工具列與批次操作與告警規則相同，支援 AI 分析、啟用/停用、匯入/匯出；新增或編輯會開啟對應精靈，刪除時顯示確認彈窗。【F:pages/incidents/SilenceRulePage.tsx†L130-L333】
- 選取列後可點擊啟用切換立即更新狀態，並在成功時重新載入列表。【F:pages/incidents/SilenceRulePage.tsx†L148-L177】【F:pages/incidents/SilenceRulePage.tsx†L222-L254】

**API 與資料流**  
- 列表資料來自 `GET /silence-rules`；批次行為對應 `POST /silence-rules/batch-actions`，單筆更新使用 `PATCH`，刪除則為 `DELETE`；AI 分析呼叫 `POST /ai/silence-rules/analyze`，Mock Server 皆已提供模擬邏輯。【F:pages/incidents/SilenceRulePage.tsx†L48-L360】【F:mock-server/handlers.ts†L1422-L1561】【F:mock-server/handlers.ts†L468-L519】
- 匯出功能於前端產製 CSV，匯入呼叫 `/silence-rules/import` 取得回應訊息。【F:pages/incidents/SilenceRulePage.tsx†L199-L218】【F:mock-server/handlers.ts†L1441-L1521】

**需求與規格定義**  
- 列表需顯示排程摘要與匹配條件，若資料量過長應提供 tooltip 或換行處理以維持表格寬度。【F:pages/incidents/SilenceRulePage.tsx†L222-L247】
- AI 分析彈窗需支援錯誤訊息顯示並允許重試；批次動作執行完畢應清除勾選狀態以避免重複操作。【F:pages/incidents/SilenceRulePage.tsx†L168-L187】

