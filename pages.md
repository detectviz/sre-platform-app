# 頁面一致性審查與優化建議

### dashboard-overview-ai-summary.png
總覽卡片僅部分顯示「事件數＋變化百分比」，AI 每日簡報卡片卻只顯示文字，呈現資訊密度落差；建議將 AI 條目改為標題＋副標＋百分比的共用模板。下方「建議操作」按鈕與文案區塊的邊距不一致，右側按鈕略貼齊框線，建議提升間距並統一按鈕尺寸與左側章節內距。

### incidents-list-overview.png
事故統計卡片的紅色卡片帶有「2 嚴重」文字，但其他卡片只保留百分比，建議統一顯示欄位組合以維持閱讀節奏。表格中的狀態膠囊高度與行距不一致，使得複選框與文字未能垂直置中；可調整行高並對齊圖示，使行為操作欄更易讀。

### incidents-detail-ai-analysis.png
詳細側欄的標籤（New、Warning、High）使用英文，而主列表為中文狀態，語言混用；建議統一翻譯或提供多語切換。AI 自動分析區塊的分隔線與標題間距不足，建議加入更明顯的區塊背景或分隔，避免內容看起來擁擠。

### incidents-detail-timeline.png
「建議步驟」區塊比上方卡片窄，導致右側執行按鈕懸浮在外；建議維持與 AI 區塊同寬並拉齊按鈕位置。時間軸文字全部使用英文事件描述，與其他中文敘述不符，可補充中文翻譯與明確的使用者名稱顯示方式。

### incidents-assign-modal.png
彈窗標題與背景列表字體大小差異大，且下方按鈕排列採左右對齊，與其他模態窗的右對齊不一致；建議統一採右側主次按鈕。使用者下拉選單未顯示角色或群組資訊，可在選項後方補充標籤減少指派錯誤。

### incidents-silence-modal.png
靜音時長按鈕使用不同高度的 pill 元件，文字左右 padding 不一；建議改用固定寬高與等距排列。提醒文字「您可以在靜音規則頁面檢視…」顏色過淺，與背景對比不足，應調整為次要文字色或加入提示圖示。

### incidents-alert-rules-list.png
切換分頁標籤的底線顏色與狀態條件顏色不一致，容易誤判狀態；建議以品牌色統一分頁底線。表格內的「自動化」欄位使用勾叉圖示但缺少文字說明，建議加入 Tooltip 或直接顯示「已啟用／未啟用」。

### incidents-alert-rules-column-settings.png
欄位設定彈窗左右欄標題缺乏視覺階層，使用者難以辨別拖曳方向；建議為可選欄位區塊加上背景或邊框。已顯示欄位的上下箭頭與拖曳手柄間距太近，容易誤點，應增加間距或改用統一的排序圖示。

### incidents-alert-rule-wizard-step1.png
步驟導覽使用數字徽章，但完成與未完成的顏色差異不明顯；可加入勾勾圖示強調完成狀態。範本卡片內英文描述未對齊卡片寬度，行距較緊湊，建議增大行距並加上繁體中文簡述，減少語言切換負擔。

### incidents-alert-rule-wizard-step2-basic.png
表單欄位沒有欄位說明文字，部分使用者可能不清楚輸入格式；建議在輸入框下方加上輔助說明。下方監控範圍區塊的背景與主卡同色，容易與其他欄位混淆，可加入淡色分隔或卡片邊框。

### incidents-alert-rule-wizard-step2-scope.png
「附加篩選條件」說明文字過長且缺乏段落分隔，閱讀負擔重；建議使用列表或換行顯示。匹配資源預覽的數字沒有視覺重點，可加入徽章或顏色提示目前符合的資源數。

### incidents-alert-rule-wizard-step3.png
條件群組標題顯示為「條件群組 #1 (OR)」但下方按鈕顯示「新增 AND 條件」，語意較繞；可改為「條件群組 #1（以 OR 串接）」並將新增按鈕排成同一行。事件等級按鈕採用文字背景高亮但缺乏邊框，與其他 pill 元件風格不同，建議統一使用膠囊按鈕樣式。

### incidents-alert-rule-wizard-step4.png
事件標題、內容的模板變數說明只以灰色小字列在下方，易被忽略；建議改為列表加上程式碼背景。Tag 新增連結使用藍色文字但缺少 icon，和其它可操作元素不一致，建議加入「＋」圖示。

### incidents-alert-rule-wizard-step5.png
「啟用自動化響應」勾選框位置偏左，與上方卡片內距不同，視覺上不齊；建議調整左右留白。腳本參數欄位僅顯示「實例數量 *」缺乏單位說明，建議補上輸入範例或限制值。

### incidents-silence-rules-list.png
單一資料列的文字與狀態膠囊之間距離過大，看起來像兩行內容；可縮短欄位間距。操作欄僅提供編輯與刪除圖示，建議與事故列表一樣加上靜音延長或停用操作，維持功能一致性。

### incidents-silence-rule-wizard-step1.png
快速套用範本按鈕樣式與按鈕列不同，使用灰色背景卻沒有 hover 狀態；建議採用按鈕元件統一互動。表單欄位英文字母大小寫混用，建議加上中文標籤與輸入提示。

### incidents-silence-rule-wizard-step2-once.png
時間輸入框只顯示預設日期但無時區資訊，與其他頁面使用 UTC 後綴不一致；建議補上時區或格式提示。分頁切換（單次靜音／週期性靜音）沒有顯示目前選中狀態顏色，需提高對比。

### incidents-silence-rule-wizard-step2-recurring.png
自訂 Cron 選項缺乏說明文字，新手難以理解；建議提供常見範例或使用者可切換的選擇器。執行時間欄位採用下拉但仍顯示文字輸入樣式，可改為時間選擇器提高一致性。

### incidents-silence-rule-wizard-step3.png
靜音條件區塊上下邊距過窄，導致欄位看起來擁擠；建議增加內距並使用卡片背景區隔。預覽區僅顯示「2 條告警規則」文字，建議提供可展開的詳細列表或 Tooltip 強化透明度。

### resources-inventory-list.png
統計卡片顯示英文指標（Healthy、Critical），表格則使用英文狀態徽章，語言一致但標題仍為中文，建議提供雙語或統一中文。表格操作欄僅有「眼睛」與「鉛筆」圖示，建議補充文字 Tooltip 並保持與其他模組相同的圖示排列順序。

### resources-edit-modal.png
表單欄位間距過大，尤其是左右兩欄落差，建議改為單欄排列或縮小水平間距。下拉選單缺少搜尋功能，在選項多時不易使用，建議導入可搜尋的選擇器。

### resources-groups-list.png
卡片統計（狀態燈號）與列表顏色不一致，容易讓使用者誤判健康指標；建議沿用綠橙紅三色。操作欄只有編輯與刪除，缺少快速查看群組成員的入口，建議增加「檢視」行為以與資源列表一致。

### resources-edit-group-modal.png
可用資源與已選資源欄位沒有明顯的拖放提示，建議加上「拖曳以加入」文字或箭頭。搜尋框缺乏邊框高亮，與背景混在一起，可增加邊框與聚焦樣式。

### resources-datasources-list.png
表格顯示的連線狀態圖示（正常、失敗、測試中）與資源列表用色不同，容易混淆；建議共用狀態色票。操作欄缺少「測試連線」的快速按鈕，只能在編輯彈窗中操作，建議加上快捷操作。

### resources-edit-datasource-modal.png
標籤區塊使用 Tag 組件但刪除 icon 與上方表單對齊不佳，可調整為單列顯示。下方操作按鈕與測試連線按鈕混在一起，建議改為左側「測試」右側「取消／儲存」的主次按鈕排列。

### resources-auto-discovery-list.png
排程欄位顯示 Cron 但無翻譯說明，建議加上工具提示協助理解。狀態欄位使用字串「成功／部分失敗／執行中」，建議搭配圖示提升識別度。

### resources-discovery-results-modal.png
模態窗標題顯示「已選擇 1 項」但列表仍可多選，使用者難以理解；建議顯示已勾選數量並鎖定多選或單選行為。列表右側的狀態圖示與文字顏色對比不足，尤其是藍色「新發現」，可提高亮度。

### resources-edit-discovery-task-modal.png
表單長度過長需要大量滾動，建議拆成分步表單或加入側邊導覽。Kubeconfig 區塊缺乏格式說明，易發生貼上錯誤，建議加上簡易範例與驗證提示。

### resources-discovery-task-step3.png
Exporter 模板欄位與自訂 YAML 欄位之間沒有分隔，視覺上容易混淆，建議加入卡片或分隔線。邊緣掃描勾選框的說明僅使用灰色文字，與背景對比不足。

### resources-discovery-task-step5.png
標籤輸入區僅提供 key=value 選項但缺乏提示，建議加入 placeholder 例如「cluster = A」。整體卡片內距不均，上方區塊與下方按鈕距離過近，可增加底部留白。

### resources-topology-view.png
拓撲視圖節點顏色與其他模組狀態顏色不同，建議沿用既有色票。左上角篩選器排列緊貼，缺少標籤或說明，建議加入「視圖模式／類型」文字與一致的下拉選單寬度。

### dashboards-list.png
列表中分類標籤（內建、Grafana）使用英文字與中文混搭；建議在標籤內提供統一語言。操作欄的「星號」收藏圖示沒有填滿狀態提示，建議提供 hover 說明並統一圖示顏色。

### dashboards-template-gallery.png
範本卡片高度不一致，造成排列不齊；建議統一卡片高度並確保按鈕置底。卡片內文字全部使用中文但按鈕是「使用此範本」，與其他模組的主要按鈕顏色不同，可改為品牌主色以吸引用戶。

### dashboards-builder-empty.png
標題「建立儀表板：微服務健康度」與操作按鈕太靠近，缺乏階層；建議插入描述文字或分隔線。空儀表板圖示偏小，可改用更醒目的空狀態插畫並搭配指引文案。

### dashboards-add-widget-modal.png
小工具清單有重複項（例如「待處理事件」出現兩次），易造成選擇困難；建議提供分類或搜尋功能。每個項目只以文字說明，缺乏圖示或圖表預覽，可加入縮圖幫助辨識。

### dashboards-builder-with-widgets.png
已新增的小工具沒有拖曳手柄或重新排序提示，建議加入拖曳區或提供調整按鈕。卡片之間的縱向間距過大，導致折疊頁面需要大量滾動，可縮小間距或允許雙欄排列。

### insights-overview.png
上方統計卡片的單位（GB、%）採英文縮寫，但下方模組標題為中文；建議統一語系。AI 異常偵測與主動化建議卡片缺少更新時間戳，建議在區塊標題旁加入時間資訊。

### automation-scripts-list.png
統計卡片顯示英文描述「Saved 2 hours of toil」，建議提供繁體中文翻譯。表格沒有顯示腳本語言或標籤，建議新增欄位以方便快速篩選。

### automation-edit-script-modal.png
腳本內容編輯區沒有行號與語法高亮，對維護不友善，建議改用程式碼編輯器元件。按鈕「上傳腳本」「使用 AI 生成」放在輸入框內部，與其他模組按鈕位置不同，可移到右上方工具列。

### automation-ai-generate-script-modal.png
生成結果以大量文字呈現但缺乏捲動條提示，建議限制高度並顯示可捲動區域。腳本類型欄位未預設為與來源需求一致，使用者可能忘記切換，建議自動帶入建議型別。

### automation-triggers-list.png
觸發器類型標籤（排程、Webhook）顏色與通知策略不同，建議統一設計系統。表格缺少「上次執行結果」欄位，導致無法快速判斷是否成功，建議新增成功／失敗指標。

### automation-edit-trigger-schedule.png
Cron 字串顯示為純文字，缺乏即時預覽，建議加入「下一次執行時間」提示。模態窗寬度過大但內容偏少，可調整為較窄寬度提升集中度。

### automation-edit-trigger-webhook.png
Webhook URL 欄位未提供驗證提示或範例，容易貼入錯誤格式，建議加入 placeholder。頁面使用與排程相同的說明文字，但缺少對 Webhook 特性（認證、Header）的設定欄位，建議補強。

### automation-edit-trigger-event.png
事件條件僅能新增 AND 條件，若需 OR 必須建立多個觸發器，建議提供條件群組設計以維持一致性。條件欄位下拉選單沒有排序或搜尋，建議按照分類或字母排序。

### automation-run-logs-list.png
表格沒有提供快速篩選成功／失敗的篩選器，只能靠文字搜尋，建議加入狀態篩選。操作欄缺少「查看輸出」入口，只能點整列，建議加上圖示提示。

### automation-run-log-detail.png
標題僅顯示腳本名稱，缺乏執行編號或時間，容易混淆；建議在標題加入完整識別資訊。stdout 區塊背景顏色與主體相同，建議改為深色區塊凸顯程式輸出。

### identity-users-list.png
卡片統計中「登入失敗」使用英文說明 From 3 unique IPs，建議改為中文。操作欄圖示與其他模組不同順序，建議統一為「檢視／編輯／刪除」。

### identity-invite-member-modal.png
角色與團隊下拉缺少描述，容易選錯權限，建議在選項旁加上權限摘要。送出按鈕顏色與其他模態窗不同（偏藍灰），建議統一使用品牌主色。

### identity-edit-member-modal.png
電子郵件欄位不可編輯但樣式與可編輯欄位一致，容易造成誤解，建議使用唯讀樣式。狀態下拉選項只有 Active/Inactive，缺乏顏色標示，建議在列表加入顏色點。

### identity-teams-list.png
表格未顯示成員數量總和與使用中專案等資訊，建議補充概覽數據。操作欄缺乏快速切換擁有者功能，可加入「設定擁有者」操作提高效率。

### identity-edit-team-modal.png
可用成員列表缺乏搜尋或篩選，當成員多時難以尋找，建議加入搜尋框。描述欄位字數限制未提示，建議加入計數器避免超出。

### identity-roles-list.png
開關按鈕與列表行距不一致，導致排版鬆散，建議固定開關寬度。角色描述全部為英文，建議補上中文說明確保一致。

### identity-edit-role-modal.png
權限設定採用折疊面板但展開指示符號過小，建議加大箭頭尺寸。各模組的權限核取方塊排列不齊，建議改為表格形式列出 CRUD 權限。

### identity-audit-log-list.png
表格僅顯示一筆資料，缺乏空狀態指引；建議在資料少時展示提示文案。操作與目標欄位採英文大寫（LOGIN_SUCCESS），建議提供中文翻譯。

### identity-audit-log-detail.png
JSON 文字全部置中顯示，閱讀困難；建議改為等寬字體左對齊。缺少複製按鈕，使用者無法快速複製內容，建議加入。

### insights-log-explorer.png
圖表色彩過於鮮豔且缺乏圖例對應，建議在圖表上方加入顏色說明。下方列表使用英文欄位名稱（Category、Message），建議與整體語系同步。

### insights-capacity-planning.png
預測線使用虛線但顏色與實際值接近，辨識度不足；建議改用明顯的對比色。AI 優化建議卡片文字過多，建議使用分段或折疊功能提升可讀性。

### notifications-strategies-list.png
策略條件膠囊使用英文（severity、service），與主標題中文不一致；建議提供中文標籤。欄位未顯示最後觸發時間，建議加入以利追蹤。

### notifications-strategy-step1.png
策略名稱與描述欄位未提供輸入限制提醒，使用者可能輸入過長文字，建議加入字數顯示。資源群組多選欄顯示純文字，建議改為可刪除的 Tag 以保持一致。

### notifications-strategy-step2.png
通知管道清單僅以勾選方塊呈現，無法顯示管道狀態；建議加入最近發送成功時間或成功率。標題「通知管道」缺少副標說明，建議補充用途。

### notifications-strategy-step3.png
附加條件區塊無分隔線，與上方區域相連，建議加上卡片或背景區隔。條件欄位缺乏預設值，建議提供常用條件快速選擇。

### notifications-channels-list.png
表格僅顯示一個管道，缺乏空狀態說明；建議在列表下方提供新增導引。最新發送結果沒有顏色狀態，建議沿用成功／失敗色彩提示。

### notifications-add-channel-email.png
收件人、抄送、密件欄位缺少輸入格式提示，建議加入 placeholder 例子。儲存按鈕與發送測試並列，容易誤觸，建議將「發送測試」改為次要按鈕或移到左側。

### notifications-add-channel-webhook.png
Webhook 表單沒有驗證方式欄位，與其他系統整合需求不符，建議加入認證設定。名稱欄位與類型欄位高度不同，視覺上不一致，可統一表單控件高度。

### notifications-add-channel-slack.png
Incoming Webhook URL 的 placeholder 使用英文敘述，可在下方補充中文說明。提及對象欄位缺乏範例格式，建議加入說明以避免輸入錯誤。

### notifications-add-channel-line.png
Access Token 欄位缺少顯示／隱藏切換提示，僅有眼睛圖示但無文字，建議加上 Tooltip。整體欄位間距略大，導致視覺焦點分散，可適度縮小。

### notifications-add-channel-sms.png
手機號碼欄位示例使用 +886，但未說明是否支援其他國碼，建議補充說明。名稱欄位與類型欄位寬度過大，內容稀疏，建議縮窄或改為雙欄版面。

### notifications-send-history.png
表格缺少快速篩選（依狀態／管道），操作效率低，建議加入篩選器。內容欄位只顯示簡短文字，建議提供展開或查看詳情的行為與工具提示。

### notifications-history-detail.png
JSON 詳情區同樣缺乏複製功能且行距緊密，建議提供格式化顯示與一鍵複製。右上角提示「無可執行動作」與主要資訊對比過低，建議調整字體或顏色。

### platform-tags-overview.png
標籤管理區塊的警告條顏色偏橘與系統警告黃不同，建議使用一致的警告色。操作欄僅提供編輯／刪除，缺少批次匯入的入口，建議新增與上方按鈕一致的功能。

### platform-email-settings.png
表單欄位無欄位驗證提示，像是「密碼」欄位應提供強度指標。下方「發送測試郵件」按鈕與儲存按鈕同色，建議改為次要按鈕避免誤操作。

### platform-identity-settings.png
敏感設定警示欄顏色與平台其他警示不同，建議統一樣式。欄位名稱使用英文（Client ID、Client Secret），建議提供中文註解或雙語顯示。

### platform-layout-manager.png
版面管理清單折疊箭頭過於靠右，缺乏區塊分隔，建議為每個模組加上卡片背景。列表未顯示卡片順序或使用頁面數量，建議加入指標協助管理。

### platform-layout-edit-kpi-modal.png
可選欄位與已顯示欄位區塊文字對齊不齊且缺乏拖曳指示，建議加入拖曳 icon。上下排序箭頭間距過窄且沒有 disabled 狀態提示，應提供灰階樣式表示不可用。

### platform-grafana-settings.png
Grafana URL 預設為 http://localhost:3000，缺乏說明是否為預設值或實際連線；建議加上提示。API Key 欄位只有眼睛圖示沒有複製按鈕，建議補齊操作。

### platform-license-page.png
商業版功能清單使用項目符號但無圖示，與整體設計不符；可加入核取或勾勾圖示。聯絡按鈕文字為「聯絡我們以升級」但樣式與主要 CTA 相同，建議使用次要按鈕。

### profile-personal-info.png
卡片標題與內容之間缺少分隔線，資訊顯得擁擠，建議加入卡片背景或欄位標籤。個人資訊僅可檢視不可編輯，建議提供跳轉至 Keycloak 的明確按鈕而非小連結。

### profile-security-settings.png
改密碼表單缺乏強度校驗與提示，建議加入強度條與錯誤訊息。最近登入活動表格未提供裝置圖示或地理位置，建議補充資訊增進安全感。

### profile-preferences.png
偏好設定的下拉選單全部使用相同寬度且無說明，建議在下拉內加入選項提示。儲存設定按鈕位置偏右下，與其他頁面主按鈕位置不同，建議統一放在右下且加上次要按鈕。

