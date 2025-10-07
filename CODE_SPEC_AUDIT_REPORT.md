# 程式碼與規格差異審計報告

## 總結
- 雖已於 `common/rbac-observability-audit-governance.md` 定義統一的守衛與審計方案，33 份模組規格仍未反映實際 RBAC 實作現況；前端頁面缺乏 `usePermissions`/`<RequirePermission>` 導致敏感操作對所有登入者開放。【F:.specify/specs/modules/automation-history-spec.md†L39-L48】【F:pages/automation/AutomationHistoryPage.tsx†L82-L210】
- 規格假設行為審計、遙測與 i18n 已落實，但 MVP 仍大量依賴 toast 與硬式中文 fallback 字串；需依治理方案補上遙測與內容系統整合。【F:.specify/specs/modules/automation-playbook-spec.md†L82-L98】【F:pages/automation/AutomationPlaybooksPage.tsx†L121-L196】
- 多數規格仍假設未來狀態資料或導覽能力（例如 `AutomationTrigger.last_execution`、拓撲上下文跳轉、通知策略批次統計），尚未落地於 MVP。需在 Clarifications 中落實補救路線或進一步調整 FR。【F:.specify/specs/modules/automation-trigger-spec.md†L39-L49】【F:.specify/specs/modules/resources-topology-spec.md†L39-L47】【F:.specify/specs/modules/notification-strategy-spec.md†L39-L46】

## 系統性議題
### RBAC 與審計缺口
所有模組仍按照規格定義權限表，但前端並未套用守衛，以下分域列出主要頁面與對應規格：
- **Automation**：`automation-history`、`automation-playbook`、`automation-trigger` 皆提供執行、刪除等操作，程式碼直接渲染 `ToolbarButton` 與 `IconButton`，未檢查權限；規格仍要求依權限控管。【F:pages/automation/AutomationHistoryPage.tsx†L82-L210】【F:pages/automation/AutomationPlaybooksPage.tsx†L137-L195】【F:pages/automation/AutomationTriggersPage.tsx†L200-L310】【F:.specify/specs/modules/automation-history-spec.md†L44-L48】【F:.specify/specs/modules/automation-playbook-spec.md†L36-L73】【F:.specify/specs/modules/automation-trigger-spec.md†L45-L49】
- **Dashboards**：列表與範本頁面提供批次刪除、建立與導入，程式碼未做守衛；規格仍記錄權限矩陣。【F:pages/dashboards/DashboardListPage.tsx†L320-L420】【F:pages/dashboards/DashboardTemplatesPage.tsx†L13-L78】【F:.specify/specs/modules/dashboards-list-spec.md†L39-L49】【F:.specify/specs/modules/dashboards-template-spec.md†L34-L41】
- **Incidents / Insights / Notification / Platform / Profile / Resources**：各模組頁面均使用相同模式（表格工具列 + 行內操作），未進行權限判斷；規格仍要求細緻權限對映。【F:pages/incidents/IncidentListPage.tsx†L1-L220】【F:pages/analysis/BacktestingPage.tsx†L13-L300】【F:pages/settings/notification-management/NotificationChannelPage.tsx†L1-L210】【F:pages/settings/platform/MailSettingsPage.tsx†L1-L200】【F:pages/profile/PreferenceSettingsPage.tsx†L1-L160】【F:pages/resources/ResourceListPage.tsx†L1-L210】【F:.specify/specs/modules/incidents-list-spec.md†L40-L48】【F:.specify/specs/modules/insights-backtesting-spec.md†L39-L56】【F:.specify/specs/modules/notification-channel-spec.md†L39-L47】【F:.specify/specs/modules/platform-mail-spec.md†L39-L48】【F:.specify/specs/modules/profile-preference-spec.md†L39-L46】【F:.specify/specs/modules/resources-list-spec.md†L39-L47】

### i18n 與觀測性未落實
所有模組仍透過 `showToast` 顯示中文 fallback，且缺少遙測記錄；規格需明確標註現狀並安排後續工作。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L1-L210】【F:.specify/specs/modules/platform-grafana-spec.md†L82-L98】

### 資料模型不一致
多個模組的規格敘述與 `types.ts` 定義不符，以下為代表性案例：
- `AutomationTrigger` 規格要求 `last_execution` 物件，但頁面僅以 playbook 維度查詢執行摘要，未能區分同一腳本多個觸發器。【F:.specify/specs/modules/automation-trigger-spec.md†L45-L47】【F:pages/automation/AutomationTriggersPage.tsx†L69-L115】
- 通知與資源模組多處假設額外欄位（例如策略回合、拓撲右鍵上下文），程式碼目前使用靜態文案或未傳遞上下文參數。【F:.specify/specs/modules/notification-strategy-spec.md†L39-L46】【F:pages/settings/notification-management/NotificationStrategyPage.tsx†L1-L200】【F:.specify/specs/modules/resources-topology-spec.md†L39-L46】【F:pages/resources/ResourceTopologyPage.tsx†L200-L320】

## 模組審計
### Automation
#### automation-history
- **實作摘要**：頁面提供狀態快篩、欄位設定、匯出與重試；抽屜僅顯示 `logs.stdout/stderr` 及參數 JSON，並以 toast 回饋錯誤。【F:pages/automation/AutomationHistoryPage.tsx†L82-L210】【F:components/ExecutionLogDetail.tsx†L31-L129】
- **規格落差**：規格已改為以 `triggered_by` 字串與 `stdout/stderr` 為準，但仍將 RBAC 與 90 天留存標記為 FUTURE；MVP 亦缺乏審計事件與重試參數覆寫能力。【F:.specify/specs/modules/automation-history-spec.md†L39-L48】【F:pages/automation/AutomationHistoryPage.tsx†L192-L208】
- **改進建議**：依《common/rbac-observability-audit-governance.md》與 Clarifications 制定 RBAC、審計落地計畫，並確認是否要支援重試時覆寫參數或追蹤觸發來源。

#### automation-playbook
- **實作摘要**：列表透過 `/automation/scripts` 支援排序、欄位設定與批次刪除；執行與編輯模態會回寫 API 並以 toast 回饋。【F:pages/automation/AutomationPlaybooksPage.tsx†L82-L210】
- **規格落差**：仍要求權限守衛與審計紀錄（FR-009~FR-012），但前端尚未套用；成功/錯誤訊息依賴中文 fallback。【F:.specify/specs/modules/automation-playbook-spec.md†L45-L73】【F:pages/automation/AutomationPlaybooksPage.tsx†L121-L196】
- **改進建議**：依《common/rbac-observability-audit-governance.md》追蹤 RBAC 與審計工作，並將 toast 文案改由內容系統供應。

#### automation-trigger
- **實作摘要**：頁面同時讀取觸發器、腳本與最近 50 筆執行，並手動將最新執行結果映射至列表；事件條件編輯器僅在 `type === 'event'` 時顯示。【F:pages/automation/AutomationTriggersPage.tsx†L69-L226】
- **規格落差**：規格已把 `last_execution` 與 RBAC 標示為 FUTURE，但 Clarifications 仍需決議如何取得觸發器層級紀錄與結構化事件條件；現況仍以 `playbook_id` 匯總資料。【F:.specify/specs/modules/automation-trigger-spec.md†L39-L49】【F:pages/automation/AutomationTriggersPage.tsx†L82-L117】
- **改進建議**：依《common/rbac-observability-audit-governance.md》與 Clarifications 規劃 API 擴充與權限守衛，並考慮提供結構化事件條件編輯器。

### Dashboards
#### dashboards-list
- **實作摘要**：列表支援匯入/匯出、欄位設定、批次刪除與設定預設首頁，並對 built-in/Grafana 類型切換不同編輯流程。【F:pages/dashboards/DashboardListPage.tsx†L64-L420】
- **規格落差**：規格已將刪除限制標註為 AS-IS 行為，但仍缺乏 RBAC 與內建儀表板保護；Clarifications 尚需描述匯入驗證流程不足的風險。【F:.specify/specs/modules/dashboards-list-spec.md†L39-L50】【F:pages/dashboards/DashboardListPage.tsx†L320-L420】
- **改進建議**：依《common/rbac-observability-audit-governance.md》與 Clarifications 決議是否在前端阻擋內建刪除並補上權限守衛，同時為匯入流程補足預覽與錯誤回報。

#### dashboards-template
- **實作摘要**：頁面從 `/dashboards/templates` 取得範本並以卡片呈現，按下「使用此範本」後透過路由 state 導向新建頁。【F:pages/dashboards/DashboardTemplatesPage.tsx†L13-L78】
- **規格落差**：FR-008 指定需依權限決定是否允許使用範本，但頁面對所有登入者顯示按鈕；仍使用硬式中文空狀態。【F:.specify/specs/modules/dashboards-template-spec.md†L34-L41】【F:pages/dashboards/DashboardTemplatesPage.tsx†L31-L60】
- **改進建議**：補上權限判斷並將空狀態文案移交內容系統。

### Identity & Access
#### identity-audit
- **實作摘要**：審計頁顯示 `AuditLogsPage` 表格、欄位設定與匯出功能，全程以 toast 通知錯誤。【F:pages/settings/identity-access/AuditLogsPage.tsx†L1-L210】
- **規格落差**：FR-008 期望後端依權限過濾審計資料並於前端控制操作，但程式碼未做任何守衛；頁面亦無額外審計觸發記錄。【F:.specify/specs/modules/identity-audit-spec.md†L39-L47】【F:pages/settings/identity-access/AuditLogsPage.tsx†L80-L210】
- **改進建議**：補齊權限控制並將查詢參數記錄至審計事件，或修訂 FR 說明現況。

#### identity-personnel
- **實作摘要**：人員管理支援邀請、編輯、刪除與匯入/匯出，所有動作直接呼叫 `/iam/users` API 並顯示 toast。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L40-L170】
- **規格落差**：FR-008/FR-009 仍要求 `users:create/update/delete` 權限控管；規格亦宣稱需防止移除自身帳號，但程式碼未檢查登入者身分。【F:.specify/specs/modules/identity-personnel-spec.md†L39-L47】【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L120-L169】
- **改進建議**：在前端加入權限判斷與自我刪除保護，或更新規格註明限制尚未實作。

#### identity-role
- **實作摘要**：角色頁面提供建立、編輯、刪除與權限範本顯示，資料來自 `/iam/roles`。【F:pages/settings/identity-access/RoleManagementPage.tsx†L1-L210】
- **規格落差**：FR-005 定義權限矩陣需支援階層繼承，但頁面僅以靜態標籤呈現；FR-008 的權限守衛同樣缺失。【F:.specify/specs/modules/identity-role-spec.md†L39-L48】【F:pages/settings/identity-access/RoleManagementPage.tsx†L150-L200】
- **改進建議**：補齊繼承邏輯或修訂規格，並在 UI 層增加權限檢查。

#### identity-team
- **實作摘要**：團隊管理支援新增、編輯、刪除與指派成員，操作皆在前端開放。【F:pages/settings/identity-access/TeamManagementPage.tsx†L1-L190】
- **規格落差**：FR-006 要求團隊層級的審批流程與 RBAC 控制未實作；規格也預期顯示使用量統計，但程式碼僅呈現成員列表。【F:.specify/specs/modules/identity-team-spec.md†L39-L47】【F:pages/settings/identity-access/TeamManagementPage.tsx†L120-L180】
- **改進建議**：更新規格以描述現況，並評估是否在後續版本補上審批與統計功能。

### Incidents
#### incidents-alert
- **實作摘要**：告警規則頁面提供建立、複製、刪除與匯入，欄位設定與批次操作皆無權限保護。【F:pages/incidents/AlertRulePage.tsx†L1-L230】
- **規格落差**：FR-006 要求批次操作僅限部分權限，FR-008 指定需記錄審批與變更歷程，目前均未落實。【F:.specify/specs/modules/incidents-alert-spec.md†L39-L48】【F:pages/incidents/AlertRulePage.tsx†L120-L220】
- **改進建議**：補齊權限守衛並調整規格對審批紀錄的描述。

#### incidents-list
- **實作摘要**：事件列表提供批次匯出、導入、認領等操作並顯示快速篩選。【F:pages/incidents/IncidentListPage.tsx†L1-L220】
- **規格落差**：規格已將 RBAC 標註為 FUTURE 並於 Clarifications 留下匯入定位，但仍缺少批次匯入審核與抽屜血緣資訊。【F:.specify/specs/modules/incidents-list-spec.md†L39-L50】【F:pages/incidents/IncidentListPage.tsx†L120-L200】
- **改進建議**：依《common/rbac-observability-audit-governance.md》與 Clarifications 設計匯入審計流程並補上事件詳情所需的血緣與權限控制。

#### incidents-silence
- **實作摘要**：靜默規則頁面支援新增、編輯、刪除與批次停用，操作直接呼叫 `/incidents/silences`。【F:pages/incidents/SilenceRulePage.tsx†L1-L200】
- **規格落差**：FR-005 要求靜默變更需生成審計事件且需權限控制，但程式碼僅顯示 toast；規格亦預期顯示衝突提示，實作未提供。【F:.specify/specs/modules/incidents-silence-spec.md†L39-L46】【F:pages/incidents/SilenceRulePage.tsx†L120-L200】
- **改進建議**：補上審計與衝突提示邏輯，或修訂規格註明 MVP 限制。

### Insights
#### insights-backtesting
- **實作摘要**：頁面支援選擇告警規則、手動標記事件、啟動回測與 5 秒輪詢結果，並顯示 Precision/Recall 指標。【F:pages/analysis/BacktestingPage.tsx†L13-L320】【F:pages/analysis/BacktestingPage.tsx†L198-L332】
- **規格落差**：FR-009 已標示為 FUTURE，但仍缺 RBAC 守衛；FR-007 雖記錄無手動事件時顯示零值，仍需決議是否顯示「缺資料」訊號。【F:.specify/specs/modules/insights-backtesting-spec.md†L39-L56】【F:pages/analysis/BacktestingPage.tsx†L270-L332】
- **改進建議**：依《common/rbac-observability-audit-governance.md》決定零值顯示方式並補上權限守衛與輪詢審計。

#### insights-capacity
- **實作摘要**：容量規劃頁面載入 KPI、趨勢圖與篩選器，但資料全由 `/analysis/capacity` 提供，無額外遙測。【F:pages/analysis/CapacityPlanningPage.tsx†L1-L220】
- **規格落差**：FR-005~FR-006 要求匯出與通知整合，現階段僅顯示圖表；權限守衛同樣缺失。【F:.specify/specs/modules/insights-capacity-spec.md†L39-L47】【F:pages/analysis/CapacityPlanningPage.tsx†L140-L210】
- **改進建議**：補齊匯出/通知行為或修訂規格，並加入權限檢查。

#### insights-log
- **實作摘要**：Log Explorer 允許輸入查詢字串並顯示結果表格與統計圖表。【F:pages/analysis/LogExplorerPage.tsx†L1-L220】
- **規格落差**：FR-006 要求保存搜尋條件與共用連結，目前僅在本地 state 管理；權限守衛亦缺失。【F:.specify/specs/modules/insights-log-spec.md†L39-L47】【F:pages/analysis/LogExplorerPage.tsx†L140-L210】
- **改進建議**：明確規劃儲存/分享需求與權限模型。

### Notification
#### notification-channel
- **實作摘要**：渠道管理提供建立、測試、刪除與批次操作，所有表單驗證以前端條件與 toast 呈現。【F:pages/settings/notification-management/NotificationChannelPage.tsx†L1-L210】
- **規格落差**：FR-006 要求測試結果寫入審計，實作僅顯示 toast；權限守衛未實作。【F:.specify/specs/modules/notification-channel-spec.md†L39-L47】【F:pages/settings/notification-management/NotificationChannelPage.tsx†L120-L200】
- **改進建議**：補上審計與權限控制，或在規格中調整為後續工作。

#### notification-history
- **實作摘要**：通知歷史列表允許重新推送、匯出與欄位設定。【F:pages/settings/notification-management/NotificationHistoryPage.tsx†L1-L200】
- **規格落差**：規格已記錄重新推送只對 `failed` 開放與自動刷新行為，但仍缺少批次統計、RBAC 與背景輪詢節流機制。【F:.specify/specs/modules/notification-history-spec.md†L39-L49】【F:pages/settings/notification-management/NotificationHistoryPage.tsx†L140-L200】
- **改進建議**：評估新增策略層級統計與輪詢降頻，並依《common/rbac-observability-audit-governance.md》引入審計與權限守衛。

#### notification-strategy
- **實作摘要**：策略頁面以表格展示策略與步驟，支援新增、編輯、刪除與匯入匯出。【F:pages/settings/notification-management/NotificationStrategyPage.tsx†L1-L200】
- **規格落差**：FR-006 描述多輪策略模擬與 SLA 校驗未實作；權限守衛缺失。【F:.specify/specs/modules/notification-strategy-spec.md†L39-L46】【F:pages/settings/notification-management/NotificationStrategyPage.tsx†L120-L200】
- **改進建議**：更新規格描述現況並排程策略模擬/校驗需求。

### Platform Settings
#### platform-auth
- **實作摘要**：身份驗證設定以唯讀模式顯示 OIDC/SAML 參數，僅提供測試連線按鈕。【F:pages/settings/platform/AuthSettingsPage.tsx†L1-L200】
- **規格落差**：FR-004~FR-005 期望修改設定與審計記錄，實作僅顯示資料；權限守衛缺失。【F:.specify/specs/modules/platform-auth-spec.md†L39-L46】【F:pages/settings/platform/AuthSettingsPage.tsx†L120-L200】
- **改進建議**：明確標註當前為唯讀 MVP，或補齊編輯流程與審計機制。

#### platform-grafana
- **實作摘要**：Grafana 設定支援啟用切換與測試連線，所有錯誤以 toast 呈現。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L1-L210】
- **規格落差**：FR-004 預期測試結果寫入審計並依權限限制按鈕；實作未套用守衛。【F:.specify/specs/modules/platform-grafana-spec.md†L39-L47】【F:pages/settings/platform/GrafanaSettingsPage.tsx†L120-L200】
- **改進建議**：補上權限與審計或修訂規格。

#### platform-layout
- **實作摘要**：平台佈局頁面提供主題切換與徽標上傳，但變更僅存於前端 state。【F:pages/settings/platform/LayoutSettingsPage.tsx†L1-L200】
- **規格落差**：FR-005 要求同步更新租戶佈局與審計紀錄，實作尚未串接後端；權限控管缺失。【F:.specify/specs/modules/platform-layout-spec.md†L39-L47】【F:pages/settings/platform/LayoutSettingsPage.tsx†L120-L200】
- **改進建議**：於規格標註目前為預覽功能並規劃後端 API。

#### platform-license
- **實作摘要**：授權頁顯示授權資訊與聯絡按鈕，不提供編輯。【F:pages/settings/platform/LicensePage.tsx†L1-L160】
- **規格落差**：FR-004 期望提交授權申請寫入審計，實作僅顯示 toaster；權限守衛缺失。【F:.specify/specs/modules/platform-license-spec.md†L39-L46】【F:pages/settings/platform/LicensePage.tsx†L90-L150】
- **改進建議**：在規格中標註僅支援唯讀，後續再補審計流程。

#### platform-mail
- **實作摘要**：SMTP 設定表單支援測試與儲存，驗證僅在前端進行且未檢查空密碼情境。【F:pages/settings/platform/MailSettingsPage.tsx†L1-L200】
- **規格落差**：FR-004 定義缺少密碼時需阻擋儲存；FR-006 要求依權限鎖定操作亦未實作。【F:.specify/specs/modules/platform-mail-spec.md†L39-L47】【F:pages/settings/platform/MailSettingsPage.tsx†L90-L170】
- **改進建議**：補齊表單驗證與權限控制或更新規格說明。

#### platform-tag
- **實作摘要**：標籤管理提供新增、編輯、刪除與批次匯入。【F:pages/settings/platform/TagManagementPage.tsx†L1-L210】
- **規格落差**：FR-006 要求標籤血緣追蹤與審計，目前未實作；權限守衛缺失。【F:.specify/specs/modules/platform-tag-spec.md†L39-L46】【F:pages/settings/platform/TagManagementPage.tsx†L140-L200】
- **改進建議**：補齊血緣追蹤或修訂規格。

### Profile
#### profile-info
- **實作摘要**：個人資訊頁顯示基本資料並允許更新姓名、時區等欄位。【F:pages/profile/PersonalInfoPage.tsx†L1-L180】
- **規格落差**：FR-005 要求修改需送審並寫入審計，實作僅直接呼叫 API 並顯示 toast；權限守衛缺失。【F:.specify/specs/modules/profile-info-spec.md†L39-L46】【F:pages/profile/PersonalInfoPage.tsx†L110-L170】
- **改進建議**：補上審批流程或調整規格描述。

#### profile-preference
- **實作摘要**：偏好設定提供主題與通知頻率設定，所有變更以 `PUT /profile/preferences` 即時儲存。【F:pages/profile/PreferenceSettingsPage.tsx†L1-L150】
- **規格落差**：FR-006 要求預覽與回滾機制未實作；權限守衛缺失。【F:.specify/specs/modules/profile-preference-spec.md†L39-L46】【F:pages/profile/PreferenceSettingsPage.tsx†L80-L140】
- **改進建議**：於規格標註現況或補上預覽/回滾與權限機制。

#### profile-security
- **實作摘要**：安全設定展示 API Token、2FA 與登入歷史，支援重置操作。【F:pages/profile/SecuritySettingsPage.tsx†L1-L200】
- **規格落差**：FR-005 要求啟用 2FA 需記錄審批並提供臨時密鑰下載，目前僅顯示 toast；權限守衛缺失。【F:.specify/specs/modules/profile-security-spec.md†L39-L45】【F:pages/profile/SecuritySettingsPage.tsx†L120-L200】
- **改進建議**：明確記錄安全事件與審批流程，或調整規格期望。

### Resources
#### resources-auto-discovery
- **實作摘要**：自動發現頁面顯示掃描任務列表與重試、匯入按鈕。【F:pages/resources/AutoDiscoveryPage.tsx†L1-L200】
- **規格落差**：FR-006 期望顯示掃描結果下載與審計紀錄未實作；權限守衛缺失。【F:.specify/specs/modules/resources-auto-discovery-spec.md†L39-L46】【F:pages/resources/AutoDiscoveryPage.tsx†L120-L190】
- **改進建議**：補齊下載/審計能力或修訂規格。

#### resources-datasource
- **實作摘要**：資料來源管理提供新增、測試、刪除與欄位設定功能。【F:pages/resources/DatasourceManagementPage.tsx†L1-L210】
- **規格落差**：FR-005 要求紀錄測試結果與權限鎖定，實作未提供；RBAC 缺失。【F:.specify/specs/modules/resources-datasource-spec.md†L39-L47】【F:pages/resources/DatasourceManagementPage.tsx†L120-L200】
- **改進建議**：補上審計與權限檢查。

#### resources-discovery
- **實作摘要**：資源總覽顯示 KPI、分佈圖與最新資源列表，並提供重新整理與導覽連結。【F:pages/resources/ResourceOverviewPage.tsx†L1-L220】
- **規格落差**：FR-009 要求 API 回傳 `last_updated` 並顯示資料時間，實作未呈現；權限守衛缺失。【F:.specify/specs/modules/resources-discovery-spec.md†L39-L48】【F:pages/resources/ResourceOverviewPage.tsx†L40-L120】
- **改進建議**：調整規格描述資料新鮮度呈現方式或補齊欄位。

#### resources-group
- **實作摘要**：資源群組頁提供新增、編輯、刪除與批次匯入操作。【F:pages/resources/ResourceGroupPage.tsx†L1-L210】
- **規格落差**：FR-006 期望展示群組告警統計與 RBAC 控制未實作；目前僅列出基本資料。【F:.specify/specs/modules/resources-group-spec.md†L39-L46】【F:pages/resources/ResourceGroupPage.tsx†L140-L200】
- **改進建議**：補齊統計呈現或修訂規格。

#### resources-list
- **實作摘要**：資源清單支援欄位設定、匯出、批次刪除與導覽。【F:pages/resources/ResourceListPage.tsx†L1-L210】
- **規格落差**：FR-007 要求多欄位條件儲存與分享未實作；權限守衛缺失。【F:.specify/specs/modules/resources-list-spec.md†L39-L47】【F:pages/resources/ResourceListPage.tsx†L120-L200】
- **改進建議**：明確規劃條件儲存/分享與權限模型。

#### resources-topology
- **實作摘要**：拓撲頁面顯示資源節點與右鍵選單，但導覽僅跳至通用頁面且未傳遞上下文參數。【F:pages/resources/ResourceTopologyPage.tsx†L200-L320】
- **規格落差**：規格已把上下文導覽記為 AS-IS 並在 Clarifications 標註缺口，但仍缺乏節點權限過濾與自動化 API 串接；`Run Automation` 等操作對所有登入者顯示。【F:.specify/specs/modules/resources-topology-spec.md†L39-L47】【F:pages/resources/ResourceTopologyPage.tsx†L200-L320】
- **改進建議**：依《common/rbac-observability-audit-governance.md》與 Clarifications 規劃上下文導覽與權限守衛，並確認是否需直接串接腳本執行流程。

## 後續建議
1. 依本報告於 `_clarifications` 與模組規格補充「MVP 現況 vs. 目標狀態」，避免閱讀者誤解目前能力範圍。
2. 建立共用的 RBAC 守衛元件與審計鉤子，並列入優先開發清單，以彌補所有模組的權限缺口。
3. 與後端協調資料模型（例如觸發器執行紀錄、拓撲導覽上下文），同步更新 `types.ts` 與 API 文件後再修訂規格。
