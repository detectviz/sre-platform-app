# 圖片審查紀錄

## dashboard-overview-main.png

![dashboard-overview-main.png](images/dashboard-overview-main.png)
首頁數據卡片僅「待處理事件」顯示嚴重等級，與其他卡片顯示趨勢的格式不同；建議統一顯示結構，例如為每張卡片加入趨勢與嚴重度標籤，或將嚴重度移至清單區塊。
- [ ] 統一顯示結構，例如為每張卡片加入趨勢與嚴重度標籤，或將嚴重度移至清單區塊。

## incidents-list-default.png

![incidents-list-default.png](images/incidents-list-default.png)
事件列表的狀態與嚴重程度使用英文(New、warning)，與中文欄位標題不一致；建議將標籤本地化或在欄位標題補充英文說明，並確保排序篩選支援中英文值。
- [ ] 將標籤本地化或在欄位標題補充英文說明，並確保排序篩選支援中英文值。

## incidents-alert-rules-list.png

![incidents-alert-rules-list.png](images/incidents-alert-rules-list.png)
表格標題「ENABLED」「TRIGGER CONDITION」等使用全大寫英文且文字對齊偏左；建議改為中文或中英並列，並使用 Ant Design Table 的 align 調整對齊與字級。
- [ ] 改為中文或中英並列，並使用 Ant Design Table 的 align 調整對齊與字級。

## incidents-silence-rules-list.png

![incidents-silence-rules-list.png](images/incidents-silence-rules-list.png)
「類型」欄位顯示 Repeat、env="staging" 等英文字串，且 Cron 語法缺乏易讀格式；建議提供中文標籤與格式化顯示，例如「重複規則」「環境=staging」。
- [ ] 提供中文標籤與格式化顯示，例如「重複規則」「環境=staging」。

## resources-list-overview.png

![resources-list-overview.png](images/resources-list-overview.png)
狀態標籤(Healthy/Critical)與地區、時間欄位(30s ago)為英文，與頁面中文敘述衝突；建議統一語系，並在工具列提供批次操作描述。
- [ ] 統一語系，並在工具列提供批次操作描述。

## resources-groups-overview.png

![resources-groups-overview.png](images/resources-groups-overview.png)
群組名稱與描述為英文，缺乏狀態圖例說明；建議提供中文翻譯並在狀態欄加上「健康/警告/嚴重」圖例。
- [ ] 提供中文翻譯並在狀態欄加上「健康/警告/嚴重」圖例。

## resources-datasource-list.png

![resources-datasource-list.png](images/resources-datasource-list.png)
「Main Grafana」列的狀態文字被截斷成「測試中...」，顯示空間不足；建議調整欄寬或使用 Tooltip 顯示完整狀態。
- [ ] 調整欄寬或使用 Tooltip 顯示完整狀態。

## resources-autodiscovery-list.png

![resources-autodiscovery-list.png](images/resources-autodiscovery-list.png)
「排程」欄以 cron 字串呈現且缺少次數單位說明；建議提供人性化文字，例如「每日 09:00」，並為「部分失敗」加上檢視詳情連結。
- [ ] 提供人性化文字，例如「每日 09:00」，並為「部分失敗」加上檢視詳情連結。

## resources-topology-map.png

![resources-topology-map.png](images/resources-topology-map.png)
選單「Layout」「Type」使用英文且無提示說明；建議改為「版型」「類型」等中文標籤並提供 Tooltip 解釋切換效果。
- [ ] 改為「版型」「類型」等中文標籤並提供 Tooltip 解釋切換效果。

## dashboards-library-list.png

![dashboards-library-list.png](images/dashboards-library-list.png)
列表中的類型標籤(built-in、grafana)為小寫英文且缺乏篩選提示；建議使用中文或首字大寫並加入篩選器圖示。
- [ ] 使用中文或首字大寫並加入篩選器圖示。

## dashboards-templates-market.png

![dashboards-templates-market.png](images/dashboards-templates-market.png)
範本卡片全為英文文案，使在地化不一致；建議提供中英對照或改為中文描述並標示適用場景。
- [ ] 提供中英對照或改為中文描述並標示適用場景。

## warroom-analytics-overview.png

![warroom-analytics-overview.png](images/warroom-analytics-overview.png)
「AI 異常檢測」區塊中的訊息、時間(5 minutes ago)為英文；建議本地化顯示並在卡片上提供快速操作按鈕。
- [ ] 本地化顯示並在卡片上提供快速操作按鈕。

## analysis-logs-explorer.png

![analysis-logs-explorer.png](images/analysis-logs-explorer.png)
圖表圖例與表格欄位(Error、Warning、Info)為英文；建議轉換為「錯誤/警告/資訊」，並調整搜尋框 placeholder 為中文。
- [ ] 轉換為「錯誤/警告/資訊」，並調整搜尋框 placeholder 為中文。

## analysis-capacity-planning.png

![analysis-capacity-planning.png](images/analysis-capacity-planning.png)
圖表圖例文字為英文，AI 優化建議標籤顏色與文字對應不直觀；建議改為中文並在標籤上顯示「待採取」「中風險」等描述。
- [ ] 改為中文並在標籤上顯示「待採取」「中風險」等描述。

## automation-scripts-list.png

![automation-scripts-list.png](images/automation-scripts-list.png)
表格欄位「LASTRUNTIME」為全大寫英文且未加間距；建議改為「上次執行時間」並調整 `space-between` 讓按鈕區對齊。
- [ ] 改為「上次執行時間」並調整 `space-between` 讓按鈕區對齊。

## automation-triggers-list.png

![automation-triggers-list.png](images/automation-triggers-list.png)
觸發器列表的類型顯示「Schedule」英文，目標腳本為「Unknown Playbook」；建議改為「排程型」並提示未綁定腳本時的錯誤狀態。
- [ ] 改為「排程型」並提示未綁定腳本時的錯誤狀態。

## automation-runs-history.png

![automation-runs-history.png](images/automation-runs-history.png)
觸發來源值為英文 event、耗時顯示 5000ms 缺乏單位翻譯；建議改為「事件觸發」「5 秒」，並在表格提供排序圖示。
- [ ] 改為「事件觸發」「5 秒」，並在表格提供排序圖示。

## identity-users-list.png

![identity-users-list.png](images/identity-users-list.png)
使用者狀態標籤 Active/Inactive/Invited 為英文，操作列缺少「重設密碼」等常見動作；建議本地化標籤並加入常用操作按鈕。
- [ ] 本地化標籤並加入常用操作按鈕。

## identity-teams-list.png

![identity-teams-list.png](images/identity-teams-list.png)
描述欄位為英文長句，導致列高不一致；建議提供中文摘要並將詳細說明放 Tooltip。
- [ ] 提供中文摘要並將詳細說明放 Tooltip。

## identity-roles-list.png

![identity-roles-list.png](images/identity-roles-list.png)
角色名稱與描述使用英文，狀態欄僅顯示 Active；建議本地化名稱並補充「已啟用/停用」切換功能。
- [ ] 本地化名稱並補充「已啟用/停用」切換功能。

## identity-audit-log.png

![identity-audit-log.png](images/identity-audit-log.png)
表格欄位如 LOGIN_SUCCESS、SUCCESS 為英文大寫，與中文介面不符；建議轉換為「登入成功」等中文並提供動作篩選。
- [ ] 轉換為「登入成功」等中文並提供動作篩選。

## notifications-policies-list.png

![notifications-policies-list.png](images/notifications-policies-list.png)
策略名稱與條件文字為英文，`severity = critical` 可讀性差；建議改為「嚴重等級=重大」並提供條件標籤化顯示。
- [ ] 改為「嚴重等級=重大」並提供條件標籤化顯示。

## notifications-channels-list.png

![notifications-channels-list.png](images/notifications-channels-list.png)
管道類型「Email」與最新發送結果「Success」為英文；建議加上中文對照並提供測試按鈕位置的一致性。
- [ ] 加上中文對照並提供測試按鈕位置的一致性。

## notifications-history-list.png

![notifications-history-list.png](images/notifications-history-list.png)
歷史列表內容多為英文，如 `DB CPU > 95%`；建議在內容欄加上中文翻譯或欄位標題說明。
- [ ] 在內容欄加上中文翻譯或欄位標題說明。

## platform-tags-overview.png

![platform-tags-overview.png](images/platform-tags-overview.png)
卡片資訊 Keycloak、Healthy 為英文且色塊說明不足；建議加入中文註解及狀態 legend，並為新增標籤按鈕提供描述。
- [ ] 加入中文註解及狀態 legend，並為新增標籤按鈕提供描述。

## platform-email-settings.png

![platform-email-settings.png](images/platform-email-settings.png)
表單 placeholder 為英文，必填星號未與標籤對齊；建議統一中文說明並加強欄位間距。
- [ ] 統一中文說明並加強欄位間距。

## platform-identity-settings.png

![platform-identity-settings.png](images/platform-identity-settings.png)
表單欄位多為英文，如 Realm/Domain、Client Secret；建議提供對應中文說明與安全提示 Tooltip。
- [ ] 提供對應中文說明與安全提示 Tooltip。

## platform-layout-management.png

![platform-layout-management.png](images/platform-layout-management.png)
清單項目多為英文(例如 SREWarRoom)，缺少排序提示；建議顯示中文頁籤名稱並提供拖曳說明文字。
- [ ] 顯示中文頁籤名稱並提供拖曳說明文字。

## platform-grafana-settings.png

![platform-grafana-settings.png](images/platform-grafana-settings.png)
表單欄位為英文(Grafana URL、Org ID)且說明文字較長難讀；建議分段描述並附上測試連線結果提示。
- [ ] 分段描述並附上測試連線結果提示。

## profile-personal-info.png

![profile-personal-info.png](images/profile-personal-info.png)
欄位值維持英文(Admin User、Active)，無明確編輯按鈕；建議以標籤形式顯示並加入「編輯個資」操作。
- [ ] 以標籤形式顯示並加入「編輯個資」操作。

## profile-security-settings.png

![profile-security-settings.png](images/profile-security-settings.png)
登入活動表格欄位(IP 位址、Chrome on macOS)英文；建議本地化並提供匯出按鈕。
- [ ] 本地化並提供匯出按鈕。

## profile-preferences.png

![profile-preferences.png](images/profile-preferences.png)
時區選項為英文字串 Asia/Taipei；建議提供中文顯示並支援搜尋。
- [ ] 提供中文顯示並支援搜尋。

## header-notification-dropdown.png

![header-notification-dropdown.png](images/header-notification-dropdown.png)
通知內容完全為英文，與標題中文不一致；建議顯示中文描述並於設定連結加入圖示。
- [ ] 顯示中文描述並於設定連結加入圖示。

## header-user-menu.png

![header-user-menu.png](images/header-user-menu.png)
使用者菜單標題與 email 為英文且缺少角色資訊；建議加入角色/組織資訊並調整行距。
- [ ] 加入角色/組織資訊並調整行距。

## incidents-mute-modal.png

![incidents-mute-modal.png](images/incidents-mute-modal.png)
時長選項為英文 1 Hour/4 Hours，解除時間顯示下午格式；建議改用「1 小時」「4 小時」並顯示24小時制。
- [ ] 改用「1 小時」「4 小時」並顯示24小時制。

## incidents-advanced-filter-modal.png

![incidents-advanced-filter-modal.png](images/incidents-advanced-filter-modal.png)
下拉預設值「所有嚴重性」「全部」位置對齊不一；建議統一欄位寬度與字體大小。
- [ ] 統一欄位寬度與字體大小。

## incidents-column-settings-modal.png

![incidents-column-settings-modal.png](images/incidents-column-settings-modal.png)
標題區混用英文 Available Columns/Displayed Columns；建議改為「可選欄位/已顯示欄位」並提供拖拉提示。
- [ ] 改為「可選欄位/已顯示欄位」並提供拖拉提示。

## incidents-alert-wizard-step1.png

![incidents-alert-wizard-step1.png](images/incidents-alert-wizard-step1.png)
篩選分類(Host/VM、Application)與範本說明皆英文；建議提供中文翻譯與使用說明 Tooltip。
- [ ] 提供中文翻譯與使用說明 Tooltip。

## incidents-alert-wizard-step2.png

![incidents-alert-wizard-step2.png](images/incidents-alert-wizard-step2.png)
欄位名稱與描述為英文，監控範圍選項缺少翻譯；建議中文化並顯示已選資源數。
- [ ] 中文化並顯示已選資源數。

## incidents-alert-wizard-step2-filters.png

![incidents-alert-wizard-step2-filters.png](images/incidents-alert-wizard-step2-filters.png)
篩選條件 env=production 為英文；建議改為「環境=正式環境」並提供 Token 標籤色彩。
- [ ] 改為「環境=正式環境」並提供 Token 標籤色彩。

## incidents-alert-wizard-step3.png

![incidents-alert-wizard-step3.png](images/incidents-alert-wizard-step3.png)
條件群組標題「OR」英文與百分比符號間距不佳；建議改為「條件群組(任一符合)」並調整輸入框寬度。
- [ ] 改為「條件群組(任一符合)」並調整輸入框寬度。

## incidents-alert-wizard-step4.png

![incidents-alert-wizard-step4.png](images/incidents-alert-wizard-step4.png)
事件標題與內容範本為英文，引導提示不足；建議提供中文預設模板並標示可用變數說明表。
- [ ] 提供中文預設模板並標示可用變數說明表。

## incidents-alert-wizard-step5.png

![incidents-alert-wizard-step5.png](images/incidents-alert-wizard-step5.png)
自動化腳本選單與輸入提示為英文；建議提供中文腳本描述與欄位驗證提示。
- [ ] 提供中文腳本描述與欄位驗證提示。

## incidents-silence-wizard-step1.png

![incidents-silence-wizard-step1.png](images/incidents-silence-wizard-step1.png)
快速套用範本 Staging Maintenance 等為英文；建議提供中文名稱並顯示範本涵蓋對象。
- [ ] 提供中文名稱並顯示範本涵蓋對象。

## incidents-silence-wizard-step2-once.png

![incidents-silence-wizard-step2-once.png](images/incidents-silence-wizard-step2-once.png)
時間輸入以上午/下午顯示，但缺少時區說明；建議提供24小時格式並顯示時區。
- [ ] 提供24小時格式並顯示時區。

## incidents-silence-wizard-step2-recurring.png

![incidents-silence-wizard-step2-recurring.png](images/incidents-silence-wizard-step2-recurring.png)
Cron 文字顯示英文說明；建議加入中文解釋與常用範例選擇。
- [ ] 加入中文解釋與常用範例選擇。

## incidents-silence-wizard-step3.png

![incidents-silence-wizard-step3.png](images/incidents-silence-wizard-step3.png)
條件輸入 env=staging 英文且預覽僅顯示數量；建議加上即時顯示將被靜音的規則列表。
- [ ] 加上即時顯示將被靜音的規則列表。

## resources-edit-resource-modal.png

![resources-edit-resource-modal.png](images/resources-edit-resource-modal.png)
提供商/區域選項為英文 AWS、us-east-1；建議提供對應中文或友善名稱。
- [ ] 提供對應中文或友善名稱。

## resources-edit-group-modal.png

![resources-edit-group-modal.png](images/resources-edit-group-modal.png)
描述與成員列表全英文，左右欄高度差異大；建議加入中文摘要與拖放提示。
- [ ] 加入中文摘要與拖放提示。

## resources-edit-datasource-modal.png

![resources-edit-datasource-modal.png](images/resources-edit-datasource-modal.png)
驗證方式、標籤欄位英文；建議本地化並提供輸入驗證訊息。
- [ ] 本地化並提供輸入驗證訊息。

## resources-scan-results-modal.png

![resources-scan-results-modal.png](images/resources-scan-results-modal.png)
狀態欄顯示圖示但缺乏文字說明，新發現/已匯入混用；建議增加顏色圖例與批次操作按鈕。
- [ ] 增加顏色圖例與批次操作按鈕。

## resources-edit-scan-modal-part1.png

![resources-edit-scan-modal-part1.png](images/resources-edit-scan-modal-part1.png)
區塊標題混用中文與括號英文(Target Configuration)；建議統一語系並使用分隔線強調步驟。
- [ ] 統一語系並使用分隔線強調步驟。

## resources-edit-scan-modal-part2.png

![resources-edit-scan-modal-part2.png](images/resources-edit-scan-modal-part2.png)
標籤與 Metadata 區塊文字英文 Key、Add Tag；建議改為「標籤鍵」「新增標籤」並提供範例。
- [ ] 改為「標籤鍵」「新增標籤」並提供範例。

## dashboards-editor-empty-state.png

![dashboards-editor-empty-state.png](images/dashboards-editor-empty-state.png)
編輯畫面缺少布局提示，唯一卡片無拖曳指引；建議提供網格背景與新增面板指南。
- [ ] 提供網格背景與新增面板指南。

## warroom-ai-analysis-modal.png

![warroom-ai-analysis-modal.png](images/warroom-ai-analysis-modal.png)
雖為中文說明，但缺少與事件連結的操作；建議加上「查看事件詳情」連結並突出風險層級。
- [ ] 加上「查看事件詳情」連結並突出風險層級。

## automation-edit-script-modal.png

![automation-edit-script-modal.png](images/automation-edit-script-modal.png)
類型、使用 AI 生成等按鈕為英文，參數欄位 Default Value、Placeholder 未翻譯；建議全介面中文化並加入語法高亮提示。
- [ ] 全介面中文化並加入語法高亮提示。

## automation-edit-trigger-schedule.png

![automation-edit-trigger-schedule.png](images/automation-edit-trigger-schedule.png)
Cron 表達式僅英文說明「範例: '0 3 * * *'」；建議提供中文範例與時間預覽。
- [ ] 提供中文範例與時間預覽。

## automation-edit-trigger-event.png

![automation-edit-trigger-event.png](images/automation-edit-trigger-event.png)
條件欄位使用 severity=Critical 英文；建議改為「嚴重等級=重大」並允許多條件組合視覺化標籤。
- [ ] 改為「嚴重等級=重大」並允許多條件組合視覺化標籤。

## automation-run-log-modal.png

![automation-run-log-modal.png](images/automation-run-log-modal.png)
Standard Output (stdout) 為英文且版面左右分割未對齊；建議改為「標準輸出」並調整為響應式雙欄。
- [ ] 改為「標準輸出」並調整為響應式雙欄。

## identity-edit-user-modal.png

![identity-edit-user-modal.png](images/identity-edit-user-modal.png)
角色、狀態選單為英文(Administrator、Active)；建議改為中文並提供角色描述 Tooltip。
- [ ] 改為中文並提供角色描述 Tooltip。

## identity-invite-member-modal.png

![identity-invite-member-modal.png](images/identity-invite-member-modal.png)
角色下拉選單英文且缺少輸入提示；建議列出角色權限摘要並強調必填欄位。
- [ ] 列出角色權限摘要並強調必填欄位。

## identity-edit-team-modal.png

![identity-edit-team-modal.png](images/identity-edit-team-modal.png)
描述「Manages the SRE platform itself.」英文且區塊間距擁擠；建議提供中文與增加邊距。
- [ ] 提供中文與增加邊距。

## identity-edit-role-modal.png

![identity-edit-role-modal.png](images/identity-edit-role-modal.png)
權限區塊標題 Incidents、Resources 為英文；建議以中文分類並提供全選/清除控制。
- [ ] 以中文分類並提供全選/清除控制。

## identity-audit-log-detail.png

![identity-audit-log-detail.png](images/identity-audit-log-detail.png)
JSON 內容未格式化翻譯，使用者不易解讀；建議提供 key 的中文映射與可折疊節點。
- [ ] 提供 key 的中文映射與可折疊節點。

## notifications-edit-policy-step1.png

![notifications-edit-policy-step1.png](images/notifications-edit-policy-step1.png)
策略名稱、優先級選項英文；建議中文化並提供優先級說明。
- [ ] 中文化並提供優先級說明。

## notifications-create-policy-step2.png

![notifications-create-policy-step2.png](images/notifications-create-policy-step2.png)
通道名稱 SRE On-call Email 英文且 checkbox 與文字距離過近；建議提供中文別名與對齊。
- [ ] 提供中文別名與對齊。

## notifications-create-policy-step3.png

![notifications-create-policy-step3.png](images/notifications-create-policy-step3.png)
條件欄位 severity=warning 英文；建議提供下拉選單中文值與條件說明。
- [ ] 提供下拉選單中文值與條件說明。

## notifications-edit-channel-modal.png

![notifications-edit-channel-modal.png](images/notifications-edit-channel-modal.png)
收件人欄位標籤 To/CC/BCC 英文；建議改為「收件人/副本/密件副本」並提供格式提示。
- [ ] 改為「收件人/副本/密件副本」並提供格式提示。

## notifications-history-detail-modal.png

![notifications-history-detail-modal.png](images/notifications-history-detail-modal.png)
JSON 內容為英文 key，缺乏格式化；建議以表格顯示並附上中文欄位。
- [ ] 以表格顯示並附上中文欄位。

## platform-manage-tag-values-modal.png

![platform-manage-tag-values-modal.png](images/platform-manage-tag-values-modal.png)
值列表僅顯示英文 production；建議加入中文顯示與使用次數說明。
- [ ] 加入中文顯示與使用次數說明。

## platform-edit-tag-modal.png

![platform-edit-tag-modal.png](images/platform-edit-tag-modal.png)
分類、描述英文；建議提供中文描述與必要性說明。
- [ ] 提供中文描述與必要性說明。

## dashboard-custom-overview.png

![dashboard-custom-overview.png](images/dashboard-custom-overview.png)
標題與描述為英文，四個指標卡也未翻譯；建議改為中文標題並允許自訂說明。
- [ ] 改為中文標題並允許自訂說明。

## dashboard-home-assets.png

![dashboard-home-assets.png](images/dashboard-home-assets.png)
圖例與最新資源區塊顯示英文字樣(AWS、Kubernetes Pod)；建議提供中文圖例與狀態標籤。
- [ ] 提供中文圖例與狀態標籤。

