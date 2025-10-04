# 頁面一致性審查與優化建議

### 1.dashboard-overview-ai-summary.png ✅ **已完成**
![dashboard-overview-ai-summary.png](images/dashboard-overview-ai-summary.png)
總覽卡片僅部分顯示「事件數＋變化百分比」，AI 每日簡報卡片卻只顯示文字，呈現資訊密度落差；建議將 AI 條目改為標題＋副標＋百分比的共用模板。下方「建議操作」按鈕與文案區塊的邊距不一致，右側按鈕略貼齊框線，建議提升間距並統一按鈕尺寸與左側章節內距。
- **實現狀態**: AI 簡報以三張等寬卡片呈現重點數據、嚴重度標籤與操作按鈕，並保持一致留白與按鈕樣式。

### 2.incidents-list-overview.png ✅ **已完成**
![incidents-list-overview.png](images/incidents-list-overview.png)
事故統計卡片的紅色卡片帶有「2 嚴重」文字，但其他卡片只保留百分比，建議統一顯示欄位組合以維持閱讀節奏。表格中的狀態膠囊高度與行距不一致，使得複選框與文字未能垂直置中；可調整行高並對齊圖示，使行為操作欄更易讀。
- **實現狀態**: 表格狀態、嚴重度與影響欄統一使用 StatusTag，並調整列內元件垂直對齊與字距以符合設計系統。

### 3.incidents-detail-ai-analysis.png ✅ **已完成**
![incidents-detail-ai-analysis.png](images/incidents-detail-ai-analysis.png)
詳細側欄的標籤（New、Warning、High）使用英文，而主列表為中文狀態，語言混用；建議統一翻譯或提供多語切換。AI 自動分析區塊的分隔線與標題間距不足，建議加入更明顯的區塊背景或分隔，避免內容看起來擁擠。
- **實現狀態**: AI 分析區塊採卡片化分段與共用 AIAnalysisDisplay，新增區塊標題、提示與 CTA 提升可讀性與層次。

### 4.incidents-detail-timeline.png ✅ **已完成**
![incidents-detail-timeline.png](images/incidents-detail-timeline.png)
「建議步驟」區塊比上方卡片窄，導致右側執行按鈕懸浮在外；建議維持與 AI 區塊同寬並拉齊按鈕位置。時間軸文字全部使用英文事件描述，與其他中文敘述不符，可補充中文翻譯與明確的使用者名稱顯示方式。
- **實現狀態**: 時間軸事件標題改為繁中、顯示用戶名稱並提供翻譯後的詳細敘述，同時調整節點樣式與操作按鈕位置。

### 5.incidents-assign-modal.png ✅ **已完成**
![incidents-assign-modal.png](images/incidents-assign-modal.png)
彈窗標題與背景列表字體大小差異大，且下方按鈕排列採左右對齊，與其他模態窗的右對齊不一致；建議統一採右側主次按鈕。使用者下拉選單未顯示角色或群組資訊，可在選項後方補充標籤減少指派錯誤。
- **實現狀態**: 指派彈窗加入欄位說明、使用 StatusTag 呈現團隊／角色／狀態並統一按鈕置右，提高資訊透明度。

### 6.incidents-silence-modal.png ✅ **已完成**
![incidents-silence-modal.png](images/incidents-silence-modal.png)
靜音時長按鈕使用不同高度的 pill 元件，文字左右 padding 不一；建議改用固定寬高與等距排列。提醒文字「您可以在靜音規則頁面檢視…」顏色過淺，與背景對比不足，應調整為次要文字色或加入提示圖示。
- **實現狀態**: 指派彈窗加入欄位說明、使用 StatusTag 呈現團隊／角色／狀態並統一按鈕置右，提高資訊透明度。

### 7.incidents-alert-rules-list.png ✅ **已完成**
![incidents-alert-rules-list.png](images/incidents-alert-rules-list.png)
切換分頁標籤的底線顏色與狀態條件顏色不一致，容易誤判狀態；建議以品牌色統一分頁底線。表格內的「自動化」欄位使用勾叉圖示但缺少文字說明，建議加入 Tooltip 或直接顯示「已啟用／未啟用」。
- **實現狀態**: 
- 導覽分頁底線統一使用品牌色強調作用中狀態。
- 自動化欄位改用具 Tooltip 的 StatusTag 並將錯誤訊息改為共用 toast，以繁中描述批次操作或匯出失敗原因。

### 8.incidents-alert-rules-column-settings.png ✅ **已完成**
![incidents-alert-rules-column-settings.png](images/incidents-alert-rules-column-settings.png)
欄位設定彈窗左右欄標題缺乏視覺階層，使用者難以辨別拖曳方向；建議為可選欄位區塊加上背景或邊框。已顯示欄位的上下箭頭與拖曳手柄間距太近，容易誤點，應增加間距或改用統一的排序圖示。
- **實現狀態**: 欄位設定彈窗以框線／背景區分可選與已顯示欄位，加入拖曳提示、排序按鈕與空狀態描述強化操作指引。

### 9.incidents-alert-rule-wizard-step1.png ✅ **已完成**
![incidents-alert-rule-wizard-step1.png](images/incidents-alert-rule-wizard-step1.png)
步驟導覽使用數字徽章，但完成與未完成的顏色差異不明顯；可加入勾勾圖示強調完成狀態。範本卡片內英文描述未對齊卡片寬度，行距較緊湊，建議增大行距並加上繁體中文簡述，減少語言切換負擔。
- **實現狀態**: 範本卡片提供繁中簡述、條列重點與預覽膠囊，並支援依類型篩選與搜尋，提升選取效率。

### 10.incidents-alert-rule-wizard-step2-basic.png ✅ **已完成**
![incidents-alert-rule-wizard-step2-basic.png](images/incidents-alert-rule-wizard-step2-basic.png)
表單欄位沒有欄位說明文字，部分使用者可能不清楚輸入格式；建議在輸入框下方加上輔助說明。下方監控範圍區塊的背景與主卡同色，容易與其他欄位混淆，可加入淡色分隔或卡片邊框。
- **實現狀態**: 附加篩選提示改為項目列表，並在匹配資源預覽區顯示醒目的徽章與載入狀態，提供即時回饋。

### 11.incidents-alert-rule-wizard-step2-scope.png ✅ **已完成**
![incidents-alert-rule-wizard-step2-scope.png](images/incidents-alert-rule-wizard-step2-scope.png)
「附加篩選條件」說明文字過長且缺乏段落分隔，閱讀負擔重；建議使用列表或換行顯示。匹配資源預覽的數字沒有視覺重點，可加入徽章或顏色提示目前符合的資源數。
- **實現狀態**: 附加篩選提示改為項目列表，並在匹配資源預覽區顯示醒目的徽章與載入狀態，提供即時回饋。

### 12.incidents-alert-rule-wizard-step3.png ✅ **已完成**
![incidents-alert-rule-wizard-step3.png](images/incidents-alert-rule-wizard-step3.png)
條件群組標題顯示為「條件群組 #1 (OR)」但下方按鈕顯示「新增 AND 條件」，語意較繞；可改為「條件群組 #1（以 OR 串接）」並將新增按鈕排成同一行。事件等級按鈕採用文字背景高亮但缺乏邊框，與其他 pill 元件風格不同，建議統一使用膠囊按鈕樣式。
- **實現狀態**: 改為膠囊按鈕並將條件行改成具標籤、提示與無障礙標記的多欄排版，維持語意清晰且操作節奏一致。

### 13.incidents-alert-rule-wizard-step4.png ✅ **已完成**
![incidents-alert-rule-wizard-step4.png](images/incidents-alert-rule-wizard-step4.png)
事件標題、內容的模板變數說明只以灰色小字列在下方，易被忽略；建議改為列表加上程式碼背景。Tag 新增連結使用藍色文字但缺少 icon，和其它可操作元素不一致，建議加入「＋」圖示。
- **實現狀態**: 變數與標籤維持卡片化列表、程式碼樣式與即時插入／管理體驗，符合建議的可視化與說明需求。

### 14.incidents-alert-rule-wizard-step5.png ✅ **已完成**
![incidents-alert-rule-wizard-step5.png](images/incidents-alert-rule-wizard-step5.png)
「啟用自動化響應」勾選框位置偏左，與上方卡片內距不同，視覺上不齊；建議調整左右留白。腳本參數欄位僅顯示「實例數量 *」缺乏單位說明，建議補上輸入範例或限制值。
- **實現狀態**: 自動化區塊加入啟用說明、腳本選單、參數提示與布林標籤本地化，確保腳本參數輸入有單位與輔助文案。

### 15.incidents-silence-rules-list.png ✅ **已完成**
![incidents-silence-rules-list.png](images/incidents-silence-rules-list.png)
單一資料列的文字與狀態膠囊之間距離過大，看起來像兩行內容；可縮短欄位間距。操作欄僅提供編輯與刪除圖示，建議與事故列表一樣加上靜音延長或停用操作，維持功能一致性。
- **實現狀態**: 表格欄寬、狀態標籤與操作群組遵循一致樣式，並新增延長靜音彈窗與快速操作流程。

### 16.incidents-silence-rule-wizard-step1.png ✅ **已完成**
![incidents-silence-rule-wizard-step1.png](images/incidents-silence-rule-wizard-step1.png)
快速套用範本按鈕樣式與按鈕列不同，使用灰色背景卻沒有 hover 狀態；建議採用按鈕元件統一互動。表單欄位英文字母大小寫混用，建議加上中文標籤與輸入提示。
- **實現狀態**: 範本選取採多欄按鈕、加入骨架載入與繁中文案提示，欄位描述與預設提示完整呈現。

### 17.incidents-silence-rule-wizard-step2-once.png ✅ **已完成**
![incidents-silence-rule-wizard-step2-once.png](images/incidents-silence-rule-wizard-step2-once.png)
時間輸入框只顯示預設日期但無時區資訊，與其他頁面使用 UTC 後綴不一致；建議補上時區或格式提示。分頁切換（單次靜音／週期性靜音）沒有顯示目前選中狀態顏色，需提高對比。
- **實現狀態**: 開始與結束時間具時區描述、Placeholder 與一致輸入樣式，分頁高亮強化目前狀態。

### 18.incidents-silence-rule-wizard-step2-recurring.png ✅ **已完成**
![incidents-silence-rule-wizard-step2-recurring.png](images/incidents-silence-rule-wizard-step2-recurring.png)
自訂 Cron 選項缺乏說明文字，新手難以理解；建議提供常見範例或使用者可切換的選擇器。執行時間欄位採用下拉但仍顯示文字輸入樣式，可改為時間選擇器提高一致性。
- **實現狀態**: 提供按鈕式頻率選擇、Cron 範例列表與自訂輸入提示，並導入時間／星期高亮設定。

### 19.incidents-silence-rule-wizard-step3.png ✅ **已完成**
![incidents-silence-rule-wizard-step3.png](images/incidents-silence-rule-wizard-step3.png)
靜音條件區塊上下邊距過窄，導致欄位看起來擁擠；建議增加內距並使用卡片背景區隔。預覽區僅顯示「2 條告警規則」文字，建議提供可展開的詳細列表或 Tooltip 強化透明度。
- **實現狀態**: 靜音條件卡片化、支援多選與範例提示，並新增告警預覽清單、狀態標籤與啟用切換提示載入／錯誤狀態。

### 20.resources-inventory-list.png ✅ **已完成**
![resources-inventory-list.png](images/resources-inventory-list.png)
統計卡片顯示英文指標（Healthy、Critical），表格則使用英文狀態徽章，語言一致但標題仍為中文，建議提供雙語或統一中文。表格操作欄僅有「眼睛」與「鉛筆」圖示，建議補充文字 Tooltip 並保持與其他模組相同的圖示排列順序。
- **實現狀態**: 資源列表的狀態標籤改用 StatusTag 呈現繁中主標與英文 Tooltip，操作按鈕採 IconButton 搭配雙語提示並依檢視/編輯/刪除順序排列。

### 21.resources-edit-modal.png ✅ **已完成**
![resources-edit-modal.png](images/resources-edit-modal.png)
表單欄位間距過大，尤其是左右兩欄落差，建議改為單欄排列或縮小水平間距。下拉選單缺少搜尋功能，在選項多時不易使用，建議導入可搜尋的選擇器。
- **實現狀態**: 編輯彈窗改用單欄 4px grid 與 SearchableSelect，可搜尋類型/提供商/區域/擁有者並加入 placeholder、輔助說明與繁中提示。

### 22.resources-groups-list.png ✅ **已完成**
![resources-groups-list.png](images/resources-groups-list.png)
卡片統計（狀態燈號）與列表顏色不一致，容易讓使用者誤判健康指標；建議沿用綠橙紅三色。操作欄只有編輯與刪除，缺少快速查看群組成員的入口，建議增加「檢視」行為以與資源列表一致。
- **實現狀態**: 群組列表沿用資源狀態色票輸出統計標籤並新增檢視抽屜，提供成員狀態摘要與資源清單，同步調整操作列為查看/編輯/刪除。

### 23.resources-edit-group-modal.png ✅ **已完成**
![resources-edit-group-modal.png](images/resources-edit-group-modal.png)
可用資源與已選資源欄位沒有明顯的拖放提示，建議加上「拖曳以加入」文字或箭頭。搜尋框缺乏邊框高亮，與背景混在一起，可增加邊框與聚焦樣式。
- **實現狀態**: 群組編輯彈窗新增搜尋輸入與提示說明、優化箭頭操作與 hover 樣式，並以可搜尋下拉選擇擁有團隊，強化資訊層次。

### 24.resources-datasources-list.png ✅ **已完成**
![resources-datasources-list.png](images/resources-datasources-list.png)
表格顯示的連線狀態圖示（正常、失敗、測試中）與資源列表用色不同，容易混淆；建議共用狀態色票。操作欄缺少「測試連線」的快速按鈕，只能在編輯彈窗中操作，建議加上快捷操作。

- **實現狀態**: 已添加測試連線快捷按鈕，支援快速測試已儲存資料來源連線狀態。

### 25.resources-edit-datasource-modal.png ✅ **已完成**
![resources-edit-datasource-modal.png](images/resources-edit-datasource-modal.png)
標籤區塊使用 Tag 組件但刪除 icon 與上方表單對齊不佳，可調整為單列顯示。下方操作按鈕與測試連線按鈕混在一起，建議改為左側「測試」右側「取消／儲存」的主次按鈕排列。

- **實現狀態**: 已調整按鈕排列為左側「測試」右側「取消／儲存」，並支援編輯前測試連線功能。

### 26.resources-auto-discovery-list.png ✅ **已完成**
![resources-auto-discovery-list.png](images/resources-auto-discovery-list.png)
排程欄位顯示 Cron 但無翻譯說明，建議加上工具提示協助理解。狀態欄位使用字串「成功／部分失敗／執行中」，建議搭配圖示提升識別度。
- **實現狀態**: 排程欄位顯示 Cron 與繁中文解說、操作按鈕統一改用 IconButton，並以 StatusTag 呈現任務狀態與掃描類型。

### 27.resources-discovery-results-modal.png ✅ **已完成**
![resources-discovery-results-modal.png](images/resources-discovery-results-modal.png)
模態窗標題顯示「已選擇 1 項」但列表仍可多選，使用者難以理解；建議顯示已勾選數量並鎖定多選或單選行為。列表右側的狀態圖示與文字顏色對比不足，尤其是藍色「新發現」，可提高亮度。
- **實現狀態**: 抽屜頂端新增任務狀態卡、顯示多選提示並將各資源狀態改為高對比 StatusTag，含勾選無障礙說明。

### 28.resources-edit-discovery-task-modal.png ✅ **已完成**
![resources-edit-discovery-task-modal.png](images/resources-edit-discovery-task-modal.png)
表單長度過長需要大量滾動，建議拆成分步表單或加入側邊導覽。Kubeconfig 區塊缺乏格式說明，易發生貼上錯誤，建議加上簡易範例與驗證提示。
- **實現狀態**: 掃描設定彈窗新增步驟導覽、滾動錨點與 kubeconfig 範例；SNMP、靜態與雲端欄位皆補充 placeholder 與說明。

### 29.resources-discovery-task-step3.png ✅ **已完成**
![resources-discovery-task-step3.png](images/resources-discovery-task-step3.png)
Exporter 模板欄位與自訂 YAML 欄位之間沒有分隔，視覺上容易混淆，建議加入卡片或分隔線。邊緣掃描勾選框的說明僅使用灰色文字，與背景對比不足。
- **實現狀態**: Exporter 綁定內容以虛線框包覆並補充模板描述，邊緣掃描區塊改用卡片化與高對比輔助文字。

### 30.resources-discovery-task-step5.png ✅ **已完成**
![resources-discovery-task-step5.png](images/resources-discovery-task-step5.png)
標籤輸入區僅提供 key=value 選項但缺乏提示，建議加入 placeholder 例如「cluster = A」。整體卡片內距不均，上方區塊與下方按鈕距離過近，可增加底部留白。
- **實現狀態**: 標籤步驟加入中文提示、鍵值 placeholder 與「新增標籤條目」操作，區塊留白與導覽同步調整。

### 31.resources-topology-view.png ✅ **已完成**
![resources-topology-view.png](images/resources-topology-view.png)
拓撲視圖節點顏色與其他模組狀態顏色不同，建議沿用既有色票。左上角篩選器排列緊貼，缺少標籤或說明，建議加入「視圖模式／類型」文字與一致的下拉選單寬度。
- **實現狀態**: 拓撲篩選區採 4px 間距與標籤化 select，新增狀態圖例並將節點 Tooltip/Legend 全改為繁中文案。

### 32.dashboards-list.png ✅ **已完成**
![dashboards-list.png](images/dashboards-list.png)
列表中分類標籤（內建、Grafana）使用英文字與中文混搭；建議在標籤內提供統一語言。操作欄的「星號」收藏圖示沒有填滿狀態提示，建議提供 hover 說明並統一圖示顏色。
- **實現狀態**: 儀表板列表的類型與分類欄改用 StatusTag 呈現繁中字面與英文 Tooltip，操作列換成 IconButton 並補上收藏狀態提示與共用 hover 樣式。

### 33.dashboards-template-gallery.png ✅ **已完成**
![dashboards-template-gallery.png](images/dashboards-template-gallery.png)
範本卡片高度不一致，造成排列不齊；建議統一卡片高度並確保按鈕置底。卡片內文字全部使用中文但按鈕是「使用此範本」，與其他模組的主要按鈕顏色不同，可改為品牌主色以吸引用戶。
- **實現狀態**: 範本卡片改為等高卡片與分類 StatusTag，說明採 4px 間距排列並將 CTA 按鈕統一為品牌主色與鍵盤可聚焦樣式，補充空狀態指引。

### 34.dashboards-builder-empty.png ✅ **已完成**
![dashboards-builder-empty.png](images/dashboards-builder-empty.png)
標題「建立儀表板：微服務健康度」與操作按鈕太靠近，缺乏階層；建議插入描述文字或分隔線。空儀表板圖示偏小，可改用更醒目的空狀態插畫並搭配指引文案。
- **實現狀態**: 儀表板編輯器的空狀態改以品牌插圖、標題與說明三段式呈現並加入主要 CTA，維持 4px 網格與清楚層級。

### 35.dashboards-add-widget-modal.png ✅ **已完成**
![dashboards-add-widget-modal.png](images/dashboards-add-widget-modal.png)
小工具清單有重複項（例如「待處理事件」出現兩次），易造成選擇困難；建議提供分類或搜尋功能。每個項目只以文字說明，缺乏圖示或圖表預覽，可加入縮圖幫助辨識。
- **實現狀態**: 新增搜尋、適用頁面篩選與結果空狀態，卡片呈現支援頁面 StatusTag 與 ID 輔助資訊，並以 IconButton 控制加入動作。

### 36.dashboards-builder-with-widgets.png ✅ **已完成**
![dashboards-builder-with-widgets.png](images/dashboards-builder-with-widgets.png)
已新增的小工具沒有拖曳手柄或重新排序提示，建議加入拖曳區或提供調整按鈕。卡片之間的縱向間距過大，導致折疊頁面需要大量滾動，可縮小間距或允許雙欄排列。
- **實現狀態**: 小工具卡片覆蓋拖曳提示徽章、統一邊框與移除 IconButton，並重新調整卡片陰影與操作區間距以維持緊湊佈局。

### 37.insights-overview.png ✅ **已完成**
![insights-overview.png](images/insights-overview.png)
上方統計卡片的單位（GB、%）採英文縮寫，但下方模組標題為中文；建議統一語系。AI 異常偵測與主動化建議卡片缺少更新時間戳，建議在區塊標題旁加入時間資訊。

- **實現狀態**: 異常與建議卡片提供繁中嚴重度標籤、相對時間與資料更新說明，並以繁中單位與提示同步統計卡資訊。

### 38.automation-scripts-list.png ✅ **已完成**
![automation-scripts-list.png](images/automation-scripts-list.png)
統計卡片顯示英文描述「Saved 2 hours of toil」，建議提供繁體中文翻譯。表格沒有顯示腳本語言或標籤，建議新增欄位以方便快速篩選。
- **實現狀態**: KPI 卡片改為繁中描述並保留趨勢說明，表格在腳本名稱旁展示類型與參數標籤且操作列改用 IconButton，維持與資源模組一致的語系與交互。

### 39.automation-edit-script-modal.png ✅ **已完成**
![automation-edit-script-modal.png](images/automation-edit-script-modal.png)
腳本內容編輯區沒有行號與語法高亮，對維護不友善，建議改用程式碼編輯器元件。按鈕「上傳腳本」「使用 AI 生成」放在輸入框內部，與其他模組按鈕位置不同，可移到右上方工具列。
- **實現狀態**: 模態導入帶行號的 CodeEditor 與置頂工具列（上傳/AI 生成），參數區提供繁中提示與欄位說明，整體按鈕間距依 4px 網格重排。

### 40.automation-ai-generate-script-modal.png ✅ **已完成**
![automation-ai-generate-script-modal.png](images/automation-ai-generate-script-modal.png)
生成結果以大量文字呈現但缺乏捲動條提示，建議限制高度並顯示可捲動區域。腳本類型欄位未預設為與來源需求一致，使用者可能忘記切換，建議自動帶入建議型別。
- **實現狀態**: AI 生成器提供類型預設值、結果區高度與捲動提示、複製套用行為及錯誤提示，並以繁中文案引導輸入。

### 41.automation-triggers-list.png ✅ **已完成**
![automation-triggers-list.png](images/automation-triggers-list.png)
觸發器類型標籤（排程、Webhook）顏色與通知策略不同，建議統一設計系統。表格缺少「上次執行結果」欄位，導致無法快速判斷是否成功，建議新增成功／失敗指標。
- **實現狀態**: 清單沿用 StatusTag 色票顯示觸發類型與上次執行狀態，新增自動化結果欄與 IconButton 操作，並將播放本資訊與時間改為繁中樣式。

### 42.automation-edit-trigger-schedule.png ✅ **已完成**
![automation-edit-trigger-schedule.png](images/automation-edit-trigger-schedule.png)
Cron 字串顯示為純文字，缺乏即時預覽，建議加入「下一次執行時間」提示。模態窗寬度過大但內容偏少，可調整為較窄寬度提升集中度。
- **實現狀態**: 排程設定提供即時計算的下一次執行時間、時區提示與預設 Cron，表單寬度調整為中型並補充繁中說明。

### 43.automation-edit-trigger-webhook.png ✅ **已完成**
![automation-edit-trigger-webhook.png](images/automation-edit-trigger-webhook.png)
Webhook URL 欄位未提供驗證提示或範例，容易貼入錯誤格式，建議加入 placeholder。頁面使用與排程相同的說明文字，但缺少對 Webhook 特性（認證、Header）的設定欄位，建議補強。
- **實現狀態**: Webhook 分頁新增 HTTP 方法、驗證方式、憑證欄位與 Header JSON 編輯區，並提供複製 URL 與繁中指引說明。

### 44.automation-edit-trigger-event.png ✅ **已完成**
![automation-edit-trigger-event.png](images/automation-edit-trigger-event.png)
事件條件僅能新增 AND 條件，若需 OR 必須建立多個觸發器，建議提供條件群組設計以維持一致性。條件欄位下拉選單沒有排序或搜尋，建議按照分類或字母排序。
- **實現狀態**: 事件觸發改用群組化條件編輯器，支援 AND/OR 群組、欄位排序與允許值下拉提示，輸入區一致採 4px 間距。

### 45.automation-run-logs-list.png ✅ **已完成**
![automation-run-logs-list.png](images/automation-run-logs-list.png)
表格沒有提供快速篩選成功／失敗的篩選器，只能靠文字搜尋，建議加入狀態篩選。操作欄缺少「查看輸出」入口，只能點整列，建議加上圖示提示。
- **實現狀態**: 執行歷史新增狀態快速篩選膠囊、IconButton 操作欄與重試按鈕，同步在時間與來源欄位顯示繁中時間戳與 Tooltip。

### 46.automation-run-log-detail.png ✅ **已完成**
![automation-run-log-detail.png](images/automation-run-log-detail.png)
標題僅顯示腳本名稱，缺乏執行編號或時間，容易混淆；建議在標題加入完整識別資訊。stdout 區塊背景顏色與主體相同，建議改為深色區塊凸顯程式輸出。
- **實現狀態**: 執行詳情改為多卡片摘要含執行編號、開始/結束時間與狀態標籤，stdout/stderr 區段採深色程式碼底與複製按鈕，並提供參數 JSON 一鍵複製。

### 47.identity-users-list.png ✅ **已完成**
![identity-users-list.png](images/identity-users-list.png)
卡片統計中「登入失敗」使用英文說明 From 3 unique IPs，建議改為中文。操作欄圖示與其他模組不同順序，建議統一為「檢視／編輯／刪除」。
- **實現狀態**: 新增身份模組 KPI 卡與狀態摘要，統一 IconButton 順序與詳情抽屜，並將統計文案改為繁中文字與相對時間顯示。

### 48.identity-invite-member-modal.png ✅ **已完成**
![identity-invite-member-modal.png](images/identity-invite-member-modal.png)
角色與團隊下拉缺少描述，容易選錯權限，建議在選項旁加上權限摘要。送出按鈕顏色與其他模態窗不同（偏藍灰），建議統一使用品牌主色。
- **實現狀態**: 角色與團隊欄位改用可搜尋下拉顯示中文描述，按鈕採品牌主色並提供權限說明與團隊提示文字。

### 49.identity-edit-member-modal.png ✅ **已完成**
![identity-edit-member-modal.png](images/identity-edit-member-modal.png)
電子郵件欄位不可編輯但樣式與可編輯欄位一致，容易造成誤解，建議使用唯讀樣式。狀態下拉選項只有 Active/Inactive，缺乏顏色標示，建議在列表加入顏色點。
- **實現狀態**: 唯讀欄位改用灰底鎖定樣式並加上提醒，角色/團隊支援搜尋挑選，狀態改為 StatusTag 按鈕群含顏色標註與說明。

### 50.identity-teams-list.png ✅ **已完成**
![identity-teams-list.png](images/identity-teams-list.png)
表格未顯示成員數量總和與使用中專案等資訊，建議補充概覽數據。操作欄缺乏快速切換擁有者功能，可加入「設定擁有者」操作提高效率。
- **實現狀態**: 團隊頁新增總覽卡片、平均成員與未指派指標，操作列統一為檢視/變更擁有者/編輯/刪除並提供快速變更彈窗與詳情抽屜。

### 51.identity-edit-team-modal.png ✅ **已完成**
![identity-edit-team-modal.png](images/identity-edit-team-modal.png)
可用成員列表缺乏搜尋或篩選，當成員多時難以尋找，建議加入搜尋框。描述欄位字數限制未提示，建議加入計數器避免超出。
- **實現狀態**: 成員管理面板加入雙向搜尋欄位與拖曳提示，描述欄提供 200 字計數與 Placeholders，維持 4px 網格與可讀提示。

### 52.identity-roles-list.png ✅ **已完成**
![identity-roles-list.png](images/identity-roles-list.png)
開關按鈕與列表行距不一致，導致排版鬆散，建議固定開關寬度。角色描述全部為英文，建議補上中文說明確保一致。

- **實現狀態**: 角色列表改用固定寬度切換與繁中描述映射，補強角色摘要與更新時間並於空狀態提供新增引導。

### 53.identity-edit-role-modal.png ✅ **已完成**
![identity-edit-role-modal.png](images/identity-edit-role-modal.png)
權限設定採用折疊面板但展開指示符號過小，建議加大箭頭尺寸。各模組的權限核取方塊排列不齊，建議改為表格形式列出 CRUD 權限。

- **實現狀態**: 角色編輯彈窗導入行列對齊的權限表格、放大指示圖示並新增欄位字數提示與全選捷徑。

### 54.identity-audit-log-list.png ✅ **已完成**
![identity-audit-log-list.png](images/identity-audit-log-list.png)
表格僅顯示一筆資料，缺乏空狀態指引；建議在資料少時展示提示文案。操作與目標欄位採英文大寫（LOGIN_SUCCESS），建議提供中文翻譯。

- **實現狀態**: 審計列表提供繁中動作標籤、結果狀態 Tag 與空狀態指引，並加入相對時間顯示與重新整理操作。

### 55.identity-audit-log-detail.png ✅ **已完成**
![identity-audit-log-detail.png](images/identity-audit-log-detail.png)
JSON 文字全部置中顯示，閱讀困難；建議改為等寬字體左對齊。缺少複製按鈕，使用者無法快速複製內容，建議加入。

- **實現狀態**: 審計詳情以卡片化摘要呈現動作、時間與來源資訊，搭配 JsonPreview 提供等寬格式與一鍵複製。

### 56.insights-log-explorer.png ✅ **已完成**
![insights-log-explorer.png](images/insights-log-explorer.png)
圖表色彩過於鮮豔且缺乏圖例對應，建議在圖表上方加入顏色說明。下方列表使用英文欄位名稱（Category、Message），建議與整體語系同步。

**具體優化建議：**
- 調整圖表色彩飽和度，使用較柔和的調色板 (#38bdf8, #a78bfa, #34d399 替換過度鮮豔的顏色)
- 在圖表上方添加圖例說明區域，明確標示顏色與日誌等級的對應關係
- 將表格欄位名稱翻譯為中文：Category → 類別, Message → 訊息, Timestamp → 時間戳, Level → 等級
- 統一字體樣式，使用系統預設的中文字體確保整體視覺一致性

- **實現狀態**: 直方圖換用柔和色票與自訂圖例、Tooltip 顯示繁中層級，並將列表等級膠囊本地化為繁中標籤搭配英文 Tooltip。

### 57.insights-capacity-planning.png ✅ **已完成**
![insights-capacity-planning.png](images/insights-capacity-planning.png)
預測線使用虛線但顏色與實際值接近，辨識度不足；建議改用明顯的對比色。AI 優化建議卡片文字過多，建議使用分段或折疊功能提升可讀性。

**具體優化建議：**
- 將預測線改為 #f59e0b (橙色) 或 #ef4444 (紅色)，與實際數據線形成明顯對比
- 為預測線增加圖例說明：「預測趨勢」與實際數據區分標識
- 實作卡片內容折疊功能，超過3行自動顯示「展開詳情」按鈕
- 為長文本內容添加捲軸容器，限制卡片最大高度為200px
- 在卡片右上角添加「展開/收起」控制按鈕，提升使用者體驗

- **實現狀態**: 預測圖改用品牌橙色實線與高對比虛線並附說明文字，AI 建議卡支援 3 行摺疊、展開切換與 200px 捲動容器。

### 58.notifications-strategies-list.png ✅ **已完成**
![notifications-strategies-list.png](images/notifications-strategies-list.png)
策略條件膠囊使用英文（severity、service），與主標題中文不一致；建議提供中文標籤。欄位未顯示最後觸發時間，建議加入以利追蹤。

**具體優化建議：**
- 將條件膠囊標籤翻譯為中文：severity → 嚴重度, service → 服務, resource → 資源
- 為膠囊按鈕添加工具提示，顯示完整的中英文對應說明
- 在表格中新增「最後觸發」欄位，顯示最近一次策略執行的時間戳
- 為「最後觸發」欄位添加相對時間顯示（如「2小時前」、「昨天」）
- 實作欄位排序功能，讓使用者可以按觸發時間排序查看最新活動

- **實現狀態**: 策略清單改用繁中條件標籤、顯示最後觸發狀態與相對時間，並新增空狀態引導與 IconButton 操作。

### 59.notifications-strategy-step1.png ✅ **已完成**
![notifications-strategy-step1.png](images/notifications-strategy-step1.png)
策略名稱與描述欄位未提供輸入限制提醒，使用者可能輸入過長文字，建議加入字數顯示。資源群組多選欄顯示純文字，建議改為可刪除的 Tag 以保持一致。

**具體優化建議：**
- 為策略名稱欄位設置50字元上限，描述欄位設置200字元上限
- 在輸入框右下角顯示即時字數計數（如「23/50」）
- 當接近字數上限時變更計數器顏色為警告色（黃色→橙色→紅色）
- 將資源群組多選改為 Tag 組件，每個選項顯示為可刪除的膠囊按鈕
- 為 Tag 組件添加「全部清除」功能按鈕，方便使用者快速重置選擇

- **實現狀態**: 步驟一補上名稱/描述字數提示、資源群組可移除膠囊與繁中輔助文案，維持 4px 間距排版。

### 60.notifications-strategy-step2.png ✅ **已完成**
![notifications-strategy-step2.png](images/notifications-strategy-step2.png)
通知管道清單僅以勾選方塊呈現，無法顯示管道狀態；建議加入最近發送成功時間或成功率。標題「通知管道」缺少副標說明，建議補充用途。

**具體優化建議：**
- 在勾選方塊旁添加小徽章顯示「成功率：95%」或「最近發送：2小時前」
- 為不同狀態設置顏色編碼：成功（綠色）、失敗（紅色）、未知（灰色）
- 在標題下方添加副標題：「選擇接收警報的通知管道，系統將依據嚴重程度發送對應訊息」
- 為每個管道選項添加說明文字，顯示支援的通知類型（Email、Slack、Webhook等）
- 實作滑鼠懸停時顯示詳細統計資訊的功能

- **實現狀態**: 通知管道面板顯示測試結果、相對時間與建議團隊，選取後自動同步管道數量並支援快速測試。

### 61.notifications-strategy-step3.png ✅ **已完成**
![notifications-strategy-step3.png](images/notifications-strategy-step3.png)
附加條件區塊無分隔線，與上方區域相連，建議加上卡片或背景區隔。條件欄位缺乏預設值，建議提供常用條件快速選擇。

**具體優化建議：**
- 為附加條件區塊添加淺色背景 (`bg-slate-800/30`) 和圓角邊框，形成視覺分隔
- 在區塊頂部添加分隔線 (`border-t border-slate-700`) 與上方內容區分
- 提供常用條件快速選擇按鈕：「嚴重度 >= 高」、「服務 = 關鍵服務」、「時間範圍 = 營業時間」
- 為條件欄位添加智慧預設值，根據歷史策略自動建議常用條件
- 實作條件預覽功能，讓使用者在選擇時即時預覽影響的警報數量

- **實現狀態**: 附加條件改用卡片化背景並提供快速套用按鈕、條件統計與可搜尋的欄位選擇器。

### 62.notifications-channels-list.png ✅ **已完成**
![notifications-channels-list.png](images/notifications-channels-list.png)
表格僅顯示一個管道，缺乏空狀態說明；建議在列表下方提供新增導引。最新發送結果沒有顏色狀態，建議沿用成功／失敗色彩提示。

**具體優化建議：**
- 設計空狀態頁面，包含說明文字「尚未設定通知管道」和醒目的「新增管道」按鈕
- 為空狀態區域添加圖示插畫，提升視覺吸引力和指引性
- 在「最新發送結果」欄位使用狀態指示器：成功（綠色勾勾）、失敗（紅色叉叉）、進行中（黃色時鐘）
- 為發送結果添加懸停工具提示，顯示詳細的發送時間和錯誤訊息
- 實作自動重新整理功能，每30秒更新發送狀態，保持資訊即時性

- **實現狀態**: 管道列表提供狀態 Tag、相對時間與空狀態說明，並加入測試按鈕、重新整理及 30 秒自動輪詢。

### 63.notifications-add-channel-email.png ✅ **已完成**
![notifications-add-channel-email.png](images/notifications-add-channel-email.png)
收件人、抄送、密件欄位缺少輸入格式提示，建議加入 placeholder 例子。儲存按鈕與發送測試並列，容易誤觸，建議將「發送測試」改為次要按鈕或移到左側。

**具體優化建議：**
- 為收件人欄位添加 placeholder：「user@example.com, admin@company.com」
- 為抄送欄位添加 placeholder：「cc@example.com」和說明「選用，多個地址請用逗號分隔」
- 為密件欄位添加 placeholder：「bcc@example.com」和說明「收件人不可見」
- 將「發送測試」按鈕改為次要樣式（灰色背景），與主要「儲存」按鈕區分
- 在「發送測試」按鈕旁添加說明文字：「先發送測試郵件確認設定正確」
- 實作郵件地址格式驗證，輸入時即時檢查格式正確性

- **實現狀態**: Email 管道支援多筆輸入提醒、繁中 placeholder 與次要測試按鈕，並於欄位下方顯示輔助說明。

### 64.notifications-add-channel-webhook.png ✅ **已完成**
![notifications-add-channel-webhook.png](images/notifications-add-channel-webhook.png)
Webhook 表單沒有驗證方式欄位，與其他系統整合需求不符，建議加入認證設定。名稱欄位與類型欄位高度不同，視覺上不一致，可統一表單控件高度。

- **實現狀態**: 已支援通知管道測試功能，僅允許已儲存管道呼叫測試 API 並回寫最新測試結果。

### 65.notifications-add-channel-slack.png ✅ **已完成**
![notifications-add-channel-slack.png](images/notifications-add-channel-slack.png)
Incoming Webhook URL 的 placeholder 使用英文敘述，可在下方補充中文說明。提及對象欄位缺乏範例格式，建議加入說明以避免輸入錯誤。

**具體優化建議：**
- 將Incoming Webhook URL的placeholder從英文改為中文：「請貼上來自Slack的Webhook URL」
- 在URL欄位下方添加說明：「從Slack App設定頁面複製完整的Webhook URL」
- 為提及對象欄位添加placeholder：「@username, #channel」和說明範例
- 添加「測試訊息」按鈕，發送測試訊息到指定頻道驗證設定
- 實作Webhook URL格式驗證，檢查是否包含正確的Slack網域
- 在提及對象欄位旁添加說明連結，指向Slack提及語法說明文件

- **實現狀態**: Slack 表單改用繁中 placeholder、補充提及格式說明並沿用測試流程以驗證設定。

### 66.notifications-add-channel-line.png ✅ **已完成**
![notifications-add-channel-line.png](images/notifications-add-channel-line.png)
Access Token 欄位缺少顯示／隱藏切換提示，僅有眼睛圖示但無文字，建議加上 Tooltip。整體欄位間距略大，導致視覺焦點分散，可適度縮小。

**具體優化建議：**
- 為Access Token欄位的眼睛圖示添加工具提示：「點擊顯示/隱藏Token內容」
- 將欄位間距從 `gap-6` 調整為 `gap-4`，使表單更緊湊
- 統一所有輸入欄位的高度為 `h-10`，避免視覺差異
- 為Access Token欄位添加placeholder：「請貼上LINE Notify的Access Token」
- 添加「取得Token說明」連結，指向LINE Notify設定教學
- 實作Token格式驗證，檢查是否為正確的LINE Token格式

- **實現狀態**: LINE Notify 欄位提供顯示/隱藏提示、輔助文字並維持 4px 間距，強化輸入指引。

### 67.notifications-add-channel-sms.png ✅ **已完成**
![notifications-add-channel-sms.png](images/notifications-add-channel-sms.png)
手機號碼欄位示例使用 +886，但未說明是否支援其他國碼，建議補充說明。名稱欄位與類型欄位寬度過大，內容稀疏，建議縮窄或改為雙欄版面。

**具體優化建議：**
- 在手機號碼欄位下方添加說明：「支援國際格式，如：+1 234-567-8900, +886 912-345-678」
- 為手機號碼欄位添加國碼選擇下拉選單，預設為台灣(+886)
- 將表單佈局從單欄改為雙欄，名稱和類型欄位並排顯示
- 為雙欄佈局設置響應式設計，小螢幕時自動堆疊
- 添加手機號碼格式驗證，檢查號碼長度和格式正確性
- 實作「發送測試簡訊」功能，驗證號碼可接收訊息

- **實現狀態**: SMS 表單新增國碼選擇、基本格式驗證與輸入說明，保持表單緊湊排版。

### 68.notifications-send-history.png ✅ **已完成**
![notifications-send-history.png](images/notifications-send-history.png)
表格缺少快速篩選（依狀態／管道），操作效率低，建議加入篩選器。內容欄位只顯示簡短文字，建議提供展開或查看詳情的行為與工具提示。

**具體優化建議：**
- 在表格上方添加篩選器列，包含狀態篩選（全部、成功、失敗、重試）和管道篩選
- 為篩選器添加「清除篩選」按鈕，一鍵重置所有篩選條件
- 為內容欄位添加展開/收起功能，顯示完整通知內容
- 在內容欄位添加懸停工具提示，預覽完整內容
- 為發送狀態添加圖示指示器：成功（綠勾）、失敗（紅叉）、重試中（黃時鐘）
- 實作自動重新整理功能，每60秒更新發送歷史狀態

- **實現狀態**: 發送歷史支援狀態/管道快速篩選、狀態 Tag 與 60 秒自動輪詢，並提供空狀態說明。

### 69.notifications-history-detail.png ✅ **已完成**
![notifications-history-detail.png](images/notifications-history-detail.png)
JSON 詳情區同樣缺乏複製功能且行距緊密，建議提供格式化顯示與一鍵複製。右上角提示「無可執行動作」與主要資訊對比過低，建議調整字體或顏色。

**具體優化建議：**
- 將JSON內容改為等寬字體（`font-mono`）並增加行距為 `leading-6`
- 為JSON區域添加語法高亮，按鍵值對顯示不同顏色
- 在JSON區域右上角添加「複製內容」按鈕，一鍵複製格式化後的JSON
- 將「無可執行動作」提示改為較大的字體（`text-base`）和對比色（`text-slate-300`）
- 為提示文字添加背景色塊，提升視覺分離度
- 添加「重新發送」按鈕，讓使用者可以對失敗的通知進行重試

- **實現狀態**: 詳情抽屜改用卡片化摘要與 JsonPreview 呈現完整資料，並保留重新發送操作與繁中標籤。

### 70.platform-tags-overview.png ✅ **已完成**
![platform-tags-overview.png](images/platform-tags-overview.png)
標籤管理區塊的警告條顏色偏橘與系統警告黃不同，建議使用一致的警告色。操作欄僅提供編輯／刪除，缺少批次匯入的入口，建議新增與上方按鈕一致的功能。

- **實現狀態**: 標籤頁提供 KPI 摘要卡、治理提示與快速篩選籤，並支援批次匯入/刪除流程與列舉值鎖定管理。

### 71.platform-email-settings.png ✅ **已完成**
![platform-email-settings.png](images/platform-email-settings.png)
表單欄位無欄位驗證提示，像是「密碼」欄位應提供強度指標。下方「發送測試郵件」按鈕與儲存按鈕同色，建議改為次要按鈕避免誤操作。

- **實現狀態**: 郵件設定改為卡片化表單與連線狀態標籤，提供欄位驗證、遮罩密碼、快速測試與還原操作並顯示最近測試結果。

### 72.platform-identity-settings.png ✅ **已完成**
![platform-identity-settings.png](images/platform-identity-settings.png)
敏感設定警示欄顏色與平台其他警示不同，建議統一樣式。欄位名稱使用英文（Client ID、Client Secret），建議提供中文註解或雙語顯示。

**具體優化建議：**
- 將敏感設定警示欄顏色統一為系統標準的黃色 (`bg-yellow-500/10 border-yellow-500`)
- 為欄位名稱提供雙語顯示：Client ID (客戶端識別碼)、Client Secret (客戶端密鑰)
- 在英文名稱旁添加隱藏式中文提示，滑鼠懸停時顯示
- 為敏感欄位添加額外的安全提示，說明這些資訊的保護重要性
- 實作欄位值的部分遮罩顯示，保護敏感資訊不被意外暴露
- **實現狀態**: 警示橫幅改用統一黃系樣式，欄位標籤提供中英雙語與說明文字，並加入 Client Secret 局部遮罩、顯示/複製控制與安全建議卡片。

### 73.platform-layout-manager.png ✅ **已完成**
![platform-layout-manager.png](images/platform-layout-manager.png)
版面管理清單折疊箭頭過於靠右，缺乏區塊分隔，建議為每個模組加上卡片背景。列表未顯示卡片順序或使用頁面數量，建議加入指標協助管理。

**具體優化建議：**
- 為每個模組項目添加卡片背景 (`bg-slate-800/50`) 和圓角邊框，形成視覺分組
- 將折疊箭頭移至項目左側，與內容保持適當間距
- 在每個模組項目中顯示統計資訊：顯示頁面數量、最近更新時間
- 為模組項目添加拖拽手柄圖示，表示支援重新排序功能
- 實作模組項目的上下移動按鈕，方便使用者調整顯示順序
- 添加「預覽版面」按鈕，讓使用者預覽當前版面配置效果
- **實現狀態**: 每個頁籤改為卡片化手風琴，顯示已顯示/可用統計與最後更新資訊，並在項目清單加入拖曳手柄、排序控制與空狀態提示。

### 74.platform-layout-edit-kpi-modal.png ✅ **已完成**
![platform-layout-edit-kpi-modal.png](images/platform-layout-edit-kpi-modal.png)
可選欄位與已顯示欄位區塊文字對齊不齊且缺乏拖曳指示，建議加入拖曳 icon。上下排序箭頭間距過窄且沒有 disabled 狀態提示，應提供灰階樣式表示不可用。

**具體優化建議：**
- 為可選欄位和已顯示欄位項目添加拖拽手柄圖示（六點圖示）
- 統一兩個區域的欄位文字對齊方式，使用相同的縮進和字體樣式
- 為上下排序箭頭增加間距，避免誤觸相鄰項目
- 為到達頂部/底部的項目顯示灰階樣式的禁用箭頭
- 添加「自動排序」按鈕，按字母順序或使用頻率自動排列欄位
- 實作拖拽過程中的視覺回饋，顯示允許放置的區域
- **實現狀態**: 雙欄面板提供統計徽章、拖曳圖示與禁用狀態樣式，並加入加入/移除空狀態與操作說明以利快速配置。

### 75.platform-grafana-settings.png ✅ **已完成**
![platform-grafana-settings.png](images/platform-grafana-settings.png)
Grafana URL 預設為 http://localhost:3000，缺乏說明是否為預設值或實際連線；建議加上提示。API Key 欄位只有眼睛圖示沒有複製按鈕，建議補齊操作。

- **實現狀態**: Grafana 整合頁提供狀態標籤、欄位驗證與 API Key 遮罩，支援測試連線、版本提示與快速還原/儲存流程。

### 76.platform-license-page.png ✅ **已完成**
![platform-license-page.png](images/platform-license-page.png)
商業版功能清單使用項目符號但無圖示，與整體設計不符；可加入核取或勾勾圖示。聯絡按鈕文字為「聯絡我們以升級」但樣式與主要 CTA 相同，建議使用次要按鈕。

**具體優化建議：**
- 為商業版功能清單中的每個項目添加勾勾圖示 (✓)，表示包含的功能
- 為開源版功能清單添加半透明的禁用勾勾圖示，區分功能可用性
- 將「聯絡我們以升級」按鈕改為次要樣式（灰色背景），避免與主要功能混淆
- 添加功能比較表格，清楚顯示開源版與商業版的差異
- 為升級按鈕添加醒目的價格標籤或「熱門推薦」標籤
- 實作功能試用按鈕，允許使用者體驗部分商業版功能
- **實現狀態**: 新增社群/商業版對照卡與功能比較表，列表採勾勾圖示並將聯絡按鈕調整為次要樣式，補充升級說明與提示文字。

### 77.profile-personal-info.png ✅ **已完成**
![profile-personal-info.png](images/profile-personal-info.png)
卡片標題與內容之間缺少分隔線，資訊顯得擁擠，建議加入卡片背景或欄位標籤。個人資訊僅可檢視不可編輯，建議提供跳轉至 Keycloak 的明確按鈕而非小連結。

**具體優化建議：**
- 為每個資訊欄位添加明確的欄位標籤（如「姓名」、「電子郵件」、「部門」）
- 在標題與內容之間添加分隔線 (`border-b border-slate-700`)
- 將「編輯個人資訊」改為主要樣式的按鈕，連結至Keycloak進行編輯
- 為唯讀欄位使用灰色文字樣式，與可編輯欄位區分
- 添加「最後更新時間」顯示，告知使用者資訊的新鮮度
- 為重要欄位（如電子郵件、手機號碼）添加驗證狀態指示器
- **實現狀態**: 個人資訊改為卡片化摘要與狀態標籤，欄位提供時間軸格式與相對時間並新增 IdP 管理連結提示。

### 78.profile-security-settings.png ✅ **已完成**
![profile-security-settings.png](images/profile-security-settings.png)
改密碼表單缺乏強度校驗與提示，建議加入強度條與錯誤訊息。最近登入活動表格未提供裝置圖示或地理位置，建議補充資訊增進安全感。

**具體優化建議：**
- 添加密碼強度指示器，顯示弱/中/強三個等級和具體要求
- 實作即時密碼驗證，確認密碼與確認密碼欄位一致
- 為最近登入活動表格添加裝置類型圖示（電腦、手机、平板）
- 在登入活動中顯示地理位置資訊（國家、城市）
- 添加登入活動的風險評估，標記可疑登入行為
- 實作「強制登出其他裝置」功能按鈕，提升帳戶安全性
- **實現狀態**: 密碼區加入強度計與錯誤提示、可強制登出其他裝置，登入歷史改用狀態標籤、裝置圖示與相對時間顯示並支援重新整理。

### 79.profile-preferences.png ✅ **已完成**
![profile-preferences.png](images/profile-preferences.png)
偏好設定的下拉選單全部使用相同寬度且無說明，建議在下拉內加入選項提示。儲存設定按鈕位置偏右下，與其他頁面主按鈕位置不同，建議統一放在右下且加上次要按鈕。

- **實現狀態**: 偏好設定頁改為卡片化兩段式表單，提供可搜尋下拉、欄位說明、匯出狀態標籤與重設/儲存控制並顯示最後匯出資訊。

### 80.insights-backtesting.png ✅ **已完成**
![insights-backtesting.png](images/insights-backtesting.png)
歷史數據回放頁面沿用英文預設區間、規則下拉缺乏搜尋與嚴重度提示，實際事件區塊也缺少操作指引，造成語系混用與操作門檻偏高；建議統一繁中文案、提供可搜尋規則清單、清楚顯示模擬狀態與實際事件資訊。

- **實現狀態**: 回放頁面改用可搜尋選擇器與繁中預設區間，顯示嚴重度/啟用標籤與任務狀態 Tag，並為實際事件比對區補充提示、快速新增/刪除控制與時間段驗證引導。
## 平台一致性二次審查補充

### 審查方法與全域原則
- 依照設計系統 `SRE DS v0.8` 的核心原則重新比對每張截圖，著重於語系一致、間距網格（4px 倍數）、元件狀態樣式以及互動層級。
- 建議中若提及 Token，沿用現有命名：顏色（如 `color.intent.warning`）、文字（如 `font.body.sm`）、按鈕尺寸（如 `button.md`）、間距（如 `spacing.16`）。
- 所有彈窗、列表與卡片建議統一使用 `Card/Base` 框架（內距 `spacing.24`、標題字重 `font.heading.sm`、分隔線 `divider.subtle`）。

### 各頁面一致性調整建議
- **dashboard-overview-ai-summary.png**
  - 問題：AI 摘要卡片未沿用指標卡資訊層級，建議與總覽卡同步呈現主指標＋差異值。
  - 調整：採用 `MetricCard` 模板（標題 `font.heading.xs`、副標 `font.body.sm`、差異值 `badge.delta`），並將右側 `建議操作` 按鈕改用 `button.md` 與 `spacing.16` 邊距。
- **incidents-list-overview.png**
  - 問題：狀態卡與表格行距不一致造成閱讀節奏中斷。
  - 調整：卡片改用同一 `StatusSummary` 資料骨架，表格行高統一為 `table.rowHeight.lg` 並讓膠囊使用 `Chip/Status` 樣式。
- **incidents-detail-ai-analysis.png**
  - 問題：語系混用與分隔不足導致語意跳躍。
  - 調整：狀態標籤使用 `Chip/Status` 並套用繁體中文 label，AI 區塊加上 `Card/Subsection` 背景與 `spacing.20` 分隔線。
- **incidents-detail-timeline.png**
  - 問題：AI 建議與時間軸寬度不一、文字語系不一致。
  - 調整：統一卡片寬度採 `layout.column.6`，時間軸文字改用雙語欄位並標示觸發者 `Avatar/with-label`。
- **incidents-assign-modal.png**
  - 問題：按鈕排列與模態窗標題字階與其他模組不同。
  - 調整：套用 `Modal/L` 模板（標題 `font.heading.sm`、主次按鈕右對齊 `button.primary` / `button.tertiary`），指派清單加上 `Tag/Role` 標籤。
- **incidents-silence-modal.png**
  - 問題：靜音時長 pill 與提醒文字色彩未遵循規格。
  - 調整：pill 改用 `SegmentedControl` 元件（高度 40px，間距 `spacing.12`），提醒文字採 `text.secondary` 並附 `Icon/info`。
- **incidents-alert-rules-list.png**
  - 問題：分頁底線與自動化欄位 icon 表達不一致。
  - 調整：分頁採 `Tab/underline` 並使用 `color.intent.primary`，自動化欄位改為 `Chip/Toggle` 搭配 Tooltip。
- **incidents-alert-rules-column-settings.png**
  - 問題：拖曳指示不足且按鈕間距過緊。
  - 調整：可選／已選區域使用 `Card/Subtle` 背景，項目左側加入 `Icon/DragHandle`，上下箭頭採 `button.icon.sm` 與 `spacing.12`。
- **incidents-alert-rule-wizard-step1.png**
  - 問題：步驟顯示狀態不明與卡片行距偏緊。
  - 調整：導覽改用 `Stepper` 元件（完成態顯示勾勾），範本卡採 `Card/Selectable` 並補繁中描述。
- **incidents-alert-rule-wizard-step2-basic.png**
  - 問題：表單缺乏輔助說明與區塊層級。
  - 調整：各欄位加入 `Field/Description`，監控範圍區塊採 `Card/Subsection` 背景與 `spacing.16` 內距。
- **incidents-alert-rule-wizard-step2-scope.png**
  - 問題：說明文字過長與數字缺少視覺重點。
  - 調整：使用 `RichText/list` 拆分段落，匹配資源數改用 `Badge/count` 顯示品牌色。
- **incidents-alert-rule-wizard-step3.png**
  - 問題：OR/AND 敘述混淆與事件等級樣式不符。
  - 調整：標題文案改為「條件群組 #1｜串接方式：OR」，事件等級改用 `Pill/Filter` 與 `button.toggle` 樣式。
- **incidents-alert-rule-wizard-step4.png**
  - 問題：模板變數與 Tag 操作未依設計系統呈現。
  - 調整：變數說明改為 `CodeBlock/inline` 列表，新增 Tag 改用 `Button/icon`（含「＋」圖示）。
- **incidents-alert-rule-wizard-step5.png**
  - 問題：勾選框與腳本欄位內距不齊。
  - 調整：表單使用 `Form/TwoColumn` 模板，勾選框左邊保留 `spacing.24`，腳本參數加上 `Field/HelpText`。
- **incidents-silence-rules-list.png**
  - 問題：欄位間距與操作項目不足。
  - 調整：表格欄距使用 `table.gap.md`，操作欄加入與事件列表一致的 `ActionMenu`（延長靜音、停用）。
- **incidents-silence-rule-wizard-step1.png**
  - 問題：快速套用樣式不符與欄位語系混用。
  - 調整：按鈕套用 `Button/secondary` 並提供 hover，欄位加上繁中標籤與 `Field/Placeholder` 指引。
- **incidents-silence-rule-wizard-step2-once.png**
  - 問題：日期格式未標示時區且分頁選態不明。
  - 調整：時間欄位加入 `Suffix` 顯示 UTC+8，分頁使用 `Tab/Segmented` 並加粗選中狀態。
- **incidents-silence-rule-wizard-step2-recurring.png**
  - 問題：Cron 選項缺少輔助敘述與時間選擇不一致。
  - 調整：新增 `HelperPanel` 提供 Cron 範例，執行時間改用 `TimePicker` 元件。
- **incidents-silence-rule-wizard-step3.png**
  - 問題：條件區塊擁擠與預覽資訊不足。
  - 調整：靜音條件套用 `Card/Subsection` 與 `spacing.20` 內距，預覽改為可展開的 `Disclosure` 列表。
- **resources-inventory-list.png**
  - 問題：語系混搭與操作圖示缺乏說明。
  - 調整：指標/狀態統一繁中標籤並附英文 Tooltip，操作欄使用 `IconButton` 搭配 Tooltip。
- **resources-edit-modal.png**
  - 問題：雙欄間距過大與下拉不可搜尋。
  - 調整：採 `Form/Responsive` 單欄模式（間距 `spacing.24`），下拉改用 `Combobox/searchable`。
- **resources-groups-list.png**
  - 問題：卡片色票與列表狀態不一致、缺少查看入口。
  - 調整：狀態燈號沿用 `StatusLegend` 三色，操作欄加入 `View` 行為與共用圖示排序。
- **resources-edit-group-modal.png**
  - 問題：拖放提示不足與搜尋框缺乏聚焦樣式。
  - 調整：可用/已選區域加入 `IllustrationArrow` 及「拖曳加入」文案，搜尋框使用 `Input/focus` 邊框色。
- **resources-datasources-list.png** ✅ **已完成**
  - 問題：狀態顏色未與資源列表對齊、缺少快捷操作。
  - 調整：狀態 icon 採用共用 `StatusDot` 色票，操作欄新增 `Button/link`「測試連線」。
  - **實現狀態**: 資料來源列表改用 StatusTag 呈現類型與連線狀態、提供搜尋/類型/狀態篩選並以 IconButton 集中測試、編輯、刪除操作，空狀態附引導說明。
- **resources-edit-datasource-modal.png**
  - 問題：Tag 與按鈕對齊不佳。
  - 調整：標籤區塊採單列 `TagGroup`，操作區採 `ButtonGroup` 左測試右主次按鈕。
  - **實現狀態**: 資料來源編輯彈窗採搜尋式下拉與輔助說明、標籤區塊改為卡片化佈局，並加入目前狀態標籤與測試/儲存一致間距的操作列。
- **resources-auto-discovery-list.png**
  - 問題：Cron 資訊不易理解與狀態缺少圖示。
  - 調整：排程欄位提供 `InfoTooltip` 說明，狀態改用 `StatusChip`。
- **resources-discovery-results-modal.png**
  - 問題：標題資訊與可選行為不匹配，狀態顏色對比不足。
  - 調整：標題顯示「已勾選 X 項 / 全部 Y 項」，狀態使用 `color.intent.info` 提升對比。
- **resources-edit-discovery-task-modal.png**
  - 問題：表單過長與 kubeconfig 缺乏格式提示。
  - 調整：拆為 `Stepper` 子流程或加右側錨點，kubeconfig 欄位附 `CodeEditor` 範例與驗證。
- **resources-discovery-task-step3.png**
  - 問題：模板與 YAML 欄位未分隔、說明色彩過淡。
  - 調整：兩區使用 `Card/Duo` 分欄，邊緣掃描說明採 `text.secondary` 並加 `Icon/info`。
- **resources-discovery-task-step5.png**
  - 問題：標籤輸入缺少提示與底部留白不足。
  - 調整：改用 `TagInput`（placeholder「cluster = A」），底部內距增加至 `spacing.32`。
- **resources-topology-view.png**
  - 問題：節點色票不一致與篩選器缺乏標籤。
  - 調整：拓撲節點沿用 `StatusPalette`，左上篩選採 `FilterGroup` 並加「視圖模式」標籤。
- **dashboards-list.png**
  - 問題：分類標籤語系混用與收藏 icon 沒有狀態提示。
  - 調整：標籤採繁中主語系搭配 Tooltip，收藏圖示使用 `Icon/star-filled` 與 hover 說明。
- **resources-detail-page**
  - 問題：詳細資訊區塊仍為英文狀態 pill、缺少標籤與相對時間說明，操作控制零散。
  - 調整：頁首導入 StatusTag、重新整理按鈕與 4px 卡片化資訊欄，相關事件以繁中標籤、Tooltip 與空狀態呈現。
  - **實現狀態**: 資源詳情提供可重整的狀態摘要、標籤區與繁中事件卡片，所有欄位均顯示本地化時間與提示說明。
- **resources-overview-page**
  - 問題：總覽缺少操作回饋、圖表空狀態與最新掃描提示，易造成資訊落差。
  - 調整：新增總覽摘要卡、重新整理 IconButton、空狀態說明與 StatusTag 標示最近發現與告警群組。
  - **實現狀態**: 資源總覽支援一鍵刷新、空狀態提醒與本地化的掃描結果/群組列表，維持 4px 間距與設計語系一致。
- **dashboards-template-gallery.png**
  - 問題：卡片高度不齊與主按鈕色彩不一致。
  - 調整：套用 `Card/Template` 固定高度並將主按鈕使用品牌 `button.primary`。
- **dashboards-builder-empty.png**
  - 問題：標題階層不足與空狀態指引不明。
  - 調整：插入 `Description` 副標與 `EmptyState` 插畫（尺寸 200px）。
- **dashboards-add-widget-modal.png**
  - 問題：小工具重複與缺乏辨識輔助。
  - 調整：清單支援 `Search` 與 `Category` 過濾，每項加上 `Thumbnail`。
- **dashboard-view-runtime.png**
  - 問題：儀表板檢視頁僅提供英文錯誤訊息並缺少卡片化資訊回饋。
  - 調整：導入卡片化載入/錯誤狀態、繁中說明、資源摘要與 Grafana 快捷控制，統一互動間距。
  - **實現狀態**: 儀表板檢視頁顯示更新時間、類型/資源標籤與描述卡片，並提供重新載入與在 Grafana 開啟操作維持語系一致。
- **sre-war-room-overview.png**
  - 問題：AI 簡報與健康度圖表缺少更新時間與範圍控制，錯誤狀態僅顯示純文字提示。
  - 調整：為 AI 簡報與圖表加入可重整按鈕、時間區間 Segmented 控制、狀態統計標籤與空狀態指引。
  - **實現狀態**: SRE War Room 介面提供本地化範圍切換、摘要標籤、最新資料時間戳與錯誤/空資料卡片，並支援個別重新整理行為。
- **dashboards-builder-with-widgets.png**
  - 問題：已新增小工具無排序提示且間距過大。
  - 調整：每張卡加入 `DragHandle`，縱向間距降至 `spacing.16` 並支援雙欄。
- **insights-overview.png**
  - 問題：語系與時間戳缺失。
  - 調整：統一指標單位語言，AI 模組標題旁加入 `Timestamp/badge`。
- **automation-scripts-list.png** ✅
  - 問題：英文描述與缺乏篩選欄位。
  - 調整：KPI 文案改為繁中趨勢描述，腳本列表於名稱旁顯示類型/參數標籤並以 IconButton 操作維持一致的互動樣式。
- **automation-edit-script-modal.png** ✅
  - 問題：程式區無行號與操作按鈕位置不一。
  - 調整：嵌入帶行號的 `CodeEditor` 與右上 `Toolbar`，欄位與提示改用繁中說明並依 4px 網格重排。
- **automation-ai-generate-script-modal.png** ✅
  - 問題：生成結果缺少滾動指示與型別預設。
  - 調整：結果區限制高度並加入捲動提示，產出提供類型預設值與套用按鈕提示。
- **automation-triggers-list.png** ✅
  - 問題：類型標籤顏色不一致與缺少執行狀態。
  - 調整：標籤採共用色票顯示類型與執行狀態，表格補上「上次執行」欄位與 IconButton 操作。
- **automation-edit-trigger-schedule.png** ✅
  - 問題：Cron 字串缺少預覽且模態寬度過大。
  - 調整：提供下一次執行時間預覽與時區提示，模態改為中寬度並加上繁中指引。
- **automation-edit-trigger-webhook.png** ✅
  - 問題：缺少 webhook 專屬設定。
  - 調整：新增 HTTP 方法、驗證方式與自訂 Header 欄位，並提供 Webhook URL 複製與錯誤提示。
- **automation-edit-trigger-event.png** ✅
  - 問題：僅支援 AND 條件與下拉排序混亂。
  - 調整：以條件群組編輯器支援 AND/OR 組合並排序欄位，輸入區統一採 4px 間距與 Tooltip。
- **automation-run-logs-list.png** ✅
  - 問題：缺乏狀態篩選與操作提示。
  - 調整：加入狀態快速篩選膠囊、IconButton 操作與重試按鈕，並本地化時間欄位。
- **automation-run-log-detail.png** ✅
  - 問題：標題資訊不足與 stdout 顏色不夠突出。
  - 調整：詳情抽屜提供多卡片摘要、程式碼底色與 stdout/stderr/參數複製按鈕，強化可讀性。
- **identity-users-list.png**
  - 問題：統計卡英文文案、操作圖示順序不一。
  - 調整：文案提供繁中主語系並保留英文 Tooltip，操作按鈕依平台順序排列。
- **identity-invite-member-modal.png**
  - 問題：角色/團隊無權限摘要、主按鈕色彩不同。
  - 調整：下拉選項附 `Caption` 描述權限，送出按鈕改用 `button.primary`。
- **identity-edit-member-modal.png**
  - 問題：唯讀欄位樣式與可編輯欄位相同，狀態缺少顏色。
  - 調整：電子郵件改用 `Input/readonly` 樣式，狀態下拉搭配 `StatusDot`。
- **identity-teams-list.png**
  - 問題：缺乏關鍵統計與快速操作。
  - 調整：表格新增成員總數、使用中專案欄位，操作欄加入「設定擁有者」選項。
- **identity-edit-team-modal.png**
  - 問題：可用成員缺搜尋、描述欄位無字數提示。
  - 調整：加入 `SearchInput` 與描述 `CharacterCounter`。
- **identity-roles-list.png**
  - 問題：開關與行距不齊、描述為英文。
  - 調整：使用 `Switch` 標準寬度，描述提供繁中正文並保留英文 Tooltip。
- **identity-edit-role-modal.png**
  - 問題：折疊指示與核取對齊不佳。
  - 調整：展開箭頭放大至 16px 並使用 `Accordion`，權限勾選改為 `Table/PermissionMatrix`。
- **identity-audit-log-list.png**
  - 問題：缺乏空狀態指引與語系一致性。
  - 調整：表格加入 `EmptyState` 指示與繁中欄位標題。
- **identity-audit-log-detail.png**
  - 問題：JSON 置中且無複製功能。
  - 調整：採 `CodeViewer`（等寬字體、左對齊、Copy 按鈕）。
- **insights-log-explorer.png**
  - 問題：圖表缺圖例、表格英文欄位。
  - 調整：使用 `ChartLegend` 標示顏色，欄位名稱翻譯為繁中並統一字體。
- **insights-capacity-planning.png**
  - 問題：預測線辨識度低與 AI 卡片文字過長。
  - 調整：預測線採 `color.intent.warning` 並更新圖例，卡片提供折疊 `ReadMore` 與 200px 高度限制。
- **notifications-strategies-list.png**
  - 問題：條件膠囊英文與缺少最後觸發欄位。
  - 調整：膠囊改為繁中標籤並附 Tooltip，新增「最後觸發」欄位與排序功能。
- **notifications-strategy-step1.png**
  - 問題：欄位缺字數限制提示、Tag 表現不一致。
  - 調整：加入 `CharacterCounter` 與 `TagInput`（含「全部清除」）。
- **notifications-strategy-step2.png**
  - 問題：通知管道缺狀態資訊與說明。
  - 調整：勾選項目顯示成功率徽章，標題下加副標說明與 Hover 詳情。
- **notifications-strategy-step3.png**
  - 問題：附加條件無分隔與預設。
  - 調整：區塊套 `Card/Subtle`，提供常用條件快捷與即時預覽。
- **notifications-channels-list.png**
  - 問題：空狀態與發送結果缺視覺提示。
  - 調整：新增空狀態插畫與 CTA，發送結果使用 `StatusIcon`。
- **notifications-add-channel-email.png**
  - 問題：欄位缺格式提示、測試/儲存按鈕過近。
  - 調整：提供 placeholder 與格式說明，按鈕採主次樣式分離並加入格式驗證。
- **notifications-add-channel-webhook.png**
  - 問題：無認證設定且欄位高度不一。
  - 調整：新增認證區（含顯示/隱藏切換與測試按鈕），所有輸入統一高度 40px。
- **notifications-add-channel-slack.png**
  - 問題：placeholder 為英文且缺測試功能。
  - 調整：改為繁中提示、提供 `測試訊息` 按鈕與 URL 格式驗證。
- **notifications-add-channel-line.png**
  - 問題：Access Token 提示不足、欄距過大。
  - 調整：眼睛圖示加 Tooltip，欄位間距調整為 `spacing.16` 並加取得教學連結。
- **notifications-add-channel-sms.png**
  - 問題：國碼支援不明與佈局鬆散。
  - 調整：加入國碼下拉、雙欄響應式佈局與測試簡訊功能。
- **notifications-send-history.png**
  - 問題：缺篩選與內容預覽。
  - 調整：表頭提供狀態/管道篩選，內容欄加展開/Tooltip。
- **notifications-history-detail.png**
  - 問題：JSON 區缺複製、提示不明顯。
  - 調整：採 `CodeViewer` 與 Copy 按鈕，提示文字使用 `text.emphasis` 背景。
- **platform-tags-overview.png**
  - 問題：警告色票不一致與缺批次功能。
  - 調整：警示沿用 `color.intent.warning`，操作欄加入「批次匯入/刪除」與搜尋。
- **platform-email-settings.png**
  - 問題：欄位缺驗證與按鈕樣式不分。
  - 調整：密碼欄顯示強度條與即時驗證，測試按鈕使用次要樣式。
- **platform-identity-settings.png**
  - 問題：警示色票與欄位語系不一致。
  - 調整：套用標準警示樣式並提供雙語標籤與遮罩顯示。
- **platform-layout-manager.png**
  - 問題：折疊箭頭位置與資訊密度不足。
  - 調整：模組使用 `Card/List` 背景，左側顯示 `DragHandle` 與統計指標。
- **platform-layout-edit-kpi-modal.png**
  - 問題：對齊不齊與排序狀態不明。
  - 調整：項目使用 `ListItem/draggable` 模式，禁用箭頭顯示灰階並加入自動排序。
- **platform-grafana-settings.png**
  - 問題：URL 說明不足與 API Key 缺複製。
  - 調整：新增預設值說明與格式驗證，提供 `Copy` 與「測試連線」按鈕。
- **platform-license-page.png**
  - 問題：功能清單視覺弱與 CTA 分層不明。
  - 調整：使用核取圖示展示功能差異，升級按鈕改為次要樣式並提供比較表。
- **profile-personal-info.png**
  - 問題：卡片缺分隔與編輯入口不明。
  - 調整：欄位加 `Label`、分隔線，提供主要按鈕連結至 Keycloak。
- **profile-security-settings.png**
  - 問題：缺密碼強度與登入活動資訊不足。
  - 調整：新增強度條、即時驗證，登入紀錄加裝置圖示與地理位置。
- **profile-preferences.png**
  - 問題：下拉缺說明與主按鈕位置不一致。
  - 調整：為選項加入描述文字與即時預覽，按鈕改用右下主/次按鈕並提供「重設預設值」。
