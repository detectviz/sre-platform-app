# Resources 功能規格（依截圖）

### resources-auto-discovery-list.png

**現況描述**
- 頁面上方為僅含「新增掃描」按鈕的 Toolbar，缺少對應的篩選器 UI，表格區域置於 `TableContainer` 內並套用固定表頭樣式。 【F:pages/resources/AutoDiscoveryPage.tsx†L46-L118】
- 表格欄位為「名稱 / 掃描類型 / 排程 / 最後執行 / 狀態 / 操作」，掃描類型顯示為色塊標籤，狀態則附帶對應圖示與色彩。 【F:pages/resources/AutoDiscoveryPage.tsx†L88-L141】
- 操作欄提供「查看結果」抽屜、「手動執行」、「編輯」、「刪除」四個圖示按鈕；刪除會觸發確認 Modal。 【F:pages/resources/AutoDiscoveryPage.tsx†L117-L165】
- 抽屜載入 `DiscoveryJobResultDrawer` 組件顯示掃描結果清單，維持頁面右側滑出的互動模式。 【F:pages/resources/AutoDiscoveryPage.tsx†L166-L176】

**互動流程**
- 進入頁面即透過 `fetchJobs` 依目前 `filters` 呼叫 API 取得掃描任務並更新列表，失敗時顯示 `TableError`。 【F:pages/resources/AutoDiscoveryPage.tsx†L21-L84】
- 點擊「新增掃描」或「編輯」會開啟 `AutoDiscoveryEditModal`，Modal 送出後依據是否含 `id` 決定 POST 或 PATCH。 【F:pages/resources/AutoDiscoveryPage.tsx†L46-L111】
- 「手動執行」即時呼叫 `/run` 端點並重新整理列表；「查看結果」開啟抽屜供後續批次匯入或標籤處理。 【F:pages/resources/AutoDiscoveryPage.tsx†L112-L176】
- 刪除按鈕先顯示警示 Modal，再於確認時呼叫 DELETE，成功或失敗皆以 toast 回饋。 【F:pages/resources/AutoDiscoveryPage.tsx†L52-L84】

**API 與資料流**
- 主要資料源為 `GET /resources/discovery-jobs`，篩選參數來自 `filters` 狀態；掃描種類等展示資訊取自 `GET /ui/options` 中的 `auto_discovery.job_kinds`。 【F:pages/resources/AutoDiscoveryPage.tsx†L21-L112】【F:contexts/OptionsContext.tsx†L3-L34】【F:mock-server/handlers.ts†L1565-L1614】
- 新增或更新任務分別對應 `POST /resources/discovery-jobs` 與 `PATCH /resources/discovery-jobs/{id}`；刪除對應 `DELETE /resources/discovery-jobs/{id}`。 【F:pages/resources/AutoDiscoveryPage.tsx†L46-L84】【F:mock-server/handlers.ts†L1896-L2062】
- 手動執行呼叫 `POST /resources/discovery-jobs/{id}/run`，結果抽屜再以 `GET /resources/discovery-jobs/{id}/results` 取得掃描資源。 【F:pages/resources/AutoDiscoveryPage.tsx†L101-L176】【F:mock-server/handlers.ts†L1863-L1894】【F:components/DiscoveryJobResultDrawer.tsx†L15-L69】

**需求與規格定義**
- 使用者必須能在單頁檢視所有掃描任務、識別狀態、快速開啟結果抽屜或觸發手動掃描。系統須在載入時即呼叫清單 API，並於錯誤時提供重試。 【F:pages/resources/AutoDiscoveryPage.tsx†L21-L118】
- 點擊編輯、新增需以 Modal 多步表單呈現，儲存成功後刷新列表；未儲存應保留原狀。 【F:pages/resources/AutoDiscoveryPage.tsx†L46-L111】
- 手動執行需即時觸發 API 並於狀態更新後重新整理，避免狀態卡在舊值。 【F:pages/resources/AutoDiscoveryPage.tsx†L101-L118】
- [NEEDS CLARIFICATION: `filters` 狀態目前缺乏對應 UI，是否需補齊搜尋/篩選控制項？]
- [NEEDS CLARIFICATION: 列表缺少分頁或排序 UI，但 `mock-server` 已支援，是否需納入？] 【F:mock-server/handlers.ts†L1565-L1614】

---

### resources-datasources-list.png

**現況描述**
- 頁面使用 Toolbar 僅呈現「新增 Datasource」，缺乏篩選或搜尋操作；表格顯示名稱、類型、連線狀態、建立時間與操作欄。 【F:pages/resources/DatasourceManagementPage.tsx†L16-L107】
- 類型欄透過 `options.datasources.types` 決定顏色與標籤文字；狀態欄以顏色與圖示回饋測試結果。 【F:pages/resources/DatasourceManagementPage.tsx†L37-L81】
- 操作包含測試連線、編輯、刪除；刪除需透過 Modal 確認。 【F:pages/resources/DatasourceManagementPage.tsx†L82-L145】

**互動流程**
- 進入頁面即發送 `GET /resources/datasources` 載入資料，失敗時顯示錯誤與重試按鈕。 【F:pages/resources/DatasourceManagementPage.tsx†L21-L57】
- 點擊新增或編輯會開啟 `DatasourceEditModal`，表單提交後決定 POST 或 PATCH，成功即重新載入列表。 【F:pages/resources/DatasourceManagementPage.tsx†L58-L107】
- 測試按鈕同步呼叫 `/test` 端點並以 toast 呈現結果，無額外確認視窗。 【F:pages/resources/DatasourceManagementPage.tsx†L94-L112】
- 刪除按鈕先顯示確認 Modal，再於確認後呼叫 DELETE。 【F:pages/resources/DatasourceManagementPage.tsx†L107-L145】

**API 與資料流**
- 列表：`GET /resources/datasources`（支援過濾參數但 UI 未提供）；類型顯示倚賴 `GET /ui/options`。 【F:pages/resources/DatasourceManagementPage.tsx†L16-L57】【F:contexts/OptionsContext.tsx†L3-L34】【F:mock-server/handlers.ts†L1565-L1603】
- 新增、更新、刪除分別對應 `POST /resources/datasources`、`PATCH /resources/datasources/{id}`、`DELETE /resources/datasources/{id}`。 【F:pages/resources/DatasourceManagementPage.tsx†L58-L107】【F:mock-server/handlers.ts†L1896-L2058】
- 測試功能使用 `POST /resources/datasources/{id}/test`，Modal 內另有 `POST /resources/datasources/test` 供尚未建立前先測試。 【F:pages/resources/DatasourceManagementPage.tsx†L94-L112】【F:components/DatasourceEditModal.tsx†L19-L93】【F:mock-server/handlers.ts†L1896-L2058】

**需求與規格定義**
- 使用者需能快速檢視 Datasource 狀態並發起測試；系統應即時呈現測試結果與更新狀態欄。 【F:pages/resources/DatasourceManagementPage.tsx†L37-L112】
- 編輯、新增流程需在 Modal 完成，保存成功後刷新列表；未通過驗證時需顯示錯誤訊息。 【F:components/DatasourceEditModal.tsx†L19-L118】
- 刪除操作必須有二次確認，避免誤刪重要連線。 【F:pages/resources/DatasourceManagementPage.tsx†L107-L145】
- [NEEDS CLARIFICATION: 是否需要搜尋與篩選功能對應 `DatasourceFilters`？] 【F:pages/resources/DatasourceManagementPage.tsx†L19-L23】
- [NEEDS CLARIFICATION: 測試成功後是否要立即更新狀態欄為最新值？目前僅重新讀取列表。]

---

### resources-discovery-results-modal.png

**現況描述**
- 抽屜上方顯示掃描任務摘要卡（掃描類型、Exporter 模板、Edge Gateway），下方為含批次工具列的表格，僅允許 `status === 'new'` 的項目被勾選。 【F:components/DiscoveryJobResultDrawer.tsx†L70-L156】
- 批次操作含「匯入到資源清單」、「批次加標籤」、「忽略 (黑名單)」，當前無選取或處理中時會停用。 【F:components/DiscoveryJobResultDrawer.tsx†L96-L134】
- 點擊匯入會開啟 `ImportResourceModal`，可覆寫 Exporter 設定並顯示逐筆進度；批次標籤則開啟 `BatchTagModal`。 【F:components/DiscoveryJobResultDrawer.tsx†L135-L201】【F:components/ImportResourceModal.tsx†L1-L135】

**互動流程**
- 抽屜開啟即呼叫 `/results` 載入列表，錯誤時顯示重試；成功後重置勾選狀態。 【F:components/DiscoveryJobResultDrawer.tsx†L21-L69】
- 匯入流程：使用者選取項目→點擊「匯入」→在 Modal 中確認並可調整 Exporter 設定→提交後逐筆標記進度，完成後關閉並刷新抽屜列表。 【F:components/DiscoveryJobResultDrawer.tsx†L96-L201】【F:components/ImportResourceModal.tsx†L46-L129】
- 批次標籤與忽略皆需至少選取一筆，提交後會重置選取並重新載入資料。 【F:components/DiscoveryJobResultDrawer.tsx†L96-L134】

**API 與資料流**
- 抽屜資料：`GET /resources/discovery-jobs/{id}/results`。 【F:components/DiscoveryJobResultDrawer.tsx†L21-L69】【F:mock-server/handlers.ts†L1565-L1614】
- 匯入：`POST /resources/import-discovered`，完成後刷新結果；批次標籤使用 `POST /resources/batch-tags`；忽略使用 `POST /discovery/batch-ignore`。 【F:components/ImportResourceModal.tsx†L46-L129】【F:components/DiscoveryJobResultDrawer.tsx†L104-L132】【F:mock-server/handlers.ts†L1680-L1760】
- Exporter、MIB Profile、Edge Gateway 選項皆由 `GET /ui/options` 提供。 【F:components/DiscoveryJobResultDrawer.tsx†L25-L37】【F:contexts/OptionsContext.tsx†L3-L34】

**需求與規格定義**
- 使用者需能從掃描結果中挑選資源並批次匯入、標籤或忽略；系統需阻擋非 `new` 狀態的項目被勾選。 【F:components/DiscoveryJobResultDrawer.tsx†L96-L156】
- 匯入時需提供 Exporter 覆寫能力並顯示逐筆進度與最終結果提示。 【F:components/ImportResourceModal.tsx†L46-L129】
- 批次操作完成後必須自動刷新列表並回饋成功或失敗訊息。 【F:components/DiscoveryJobResultDrawer.tsx†L96-L132】
- [NEEDS CLARIFICATION: 抽屜是否需顯示分頁或搜尋，避免結果過多時操作困難？]

---

### resources-discovery-task-step3.png

**現況描述**
- `AutoDiscoveryEditModal` 第三步「Exporter 綁定」提供模板下拉、可選的 MIB Profile 下拉與覆寫 YAML 欄位，說明文案提示用途。 【F:components/AutoDiscoveryEditModal.tsx†L214-L294】
- 當模板支援 MIB Profile 或 overrides 時才顯示對應欄位，避免出現無效選項。 【F:components/AutoDiscoveryEditModal.tsx†L236-L294】
- 現行 `kind` 值為小寫（如 `k8s`），但 `renderConfigFields` 內比較字串時使用 `K8s`，導致 Kubernetes 類型不會顯示專屬設定欄位。 【F:components/AutoDiscoveryEditModal.tsx†L140-L213】【F:types.ts†L12-L29】

**互動流程**
- 使用者選擇模板後若切換至另一模板，系統會清除 overrides 與 MIB Profile，避免舊設定遺留。 【F:components/AutoDiscoveryEditModal.tsx†L104-L129】
- 下拉資料皆依賴 Options Context，載入中會顯示 `載入中...` 選項。 【F:components/AutoDiscoveryEditModal.tsx†L41-L62】【F:components/AutoDiscoveryEditModal.tsx†L230-L294】
- 使用者可於此步驟輸入 YAML 覆寫，提交時與其他欄位一起打包送出。 【F:components/AutoDiscoveryEditModal.tsx†L260-L294】

**API 與資料流**
- 儲存或測試掃描時會包含 `exporter_binding` 欄位，對應 `POST/PATCH /resources/discovery-jobs` 及 `POST /resources/discovery-jobs/test`。 【F:components/AutoDiscoveryEditModal.tsx†L130-L209】【F:mock-server/handlers.ts†L1896-L2054】
- 選項資料源自 `GET /ui/options` 的 `auto_discovery.exporter_templates` 與 `mib_profiles`。 【F:components/AutoDiscoveryEditModal.tsx†L36-L62】【F:mock-server/db.ts†L2878-L2920】

**需求與規格定義**
- 系統需根據掃描類型給出預設模板並允許使用者覆寫；切換模板時應重置互斥欄位。 【F:components/AutoDiscoveryEditModal.tsx†L63-L129】
- UI 必須根據模板能力顯示/隱藏 MIB Profile 與 YAML 覆寫區塊，並在提交時帶入。 【F:components/AutoDiscoveryEditModal.tsx†L230-L294】
- [NEEDS CLARIFICATION: `k8s` 類型未顯示對應輸入欄位，應確認是否改為大小寫一致或調整資料來源。]

---

### resources-discovery-task-step5.png

**現況描述**
- 第五步「標籤與分類」使用 `KeyValueInput`，左側選擇標籤 Key，右側根據定義顯示多選或自由輸入欄位，並提供新增、刪除列的按鈕。 【F:components/AutoDiscoveryEditModal.tsx†L295-L312】【F:components/KeyValueInput.tsx†L1-L126】
- 預設無標籤時顯示空列表，使用者需手動新增；刪除鍵為紅色垃圾桶圖示。 【F:components/KeyValueInput.tsx†L68-L111】

**互動流程**
- Modal 開啟時載入標籤定義 (`GET /settings/tags`)，選擇 Key 後自動重置 Value，避免舊值殘留。 【F:components/KeyValueInput.tsx†L37-L89】
- 若標籤定義提供 `allowed_values`，則顯示多選清單，否則為文字輸入。多選時可以即時反選。 【F:components/KeyValueInput.tsx†L13-L67】
- `AutoDiscoveryEditModal` 提交時會將標籤陣列一併送出。 【F:components/AutoDiscoveryEditModal.tsx†L130-L209】

**API 與資料流**
- 標籤定義：`GET /settings/tags`；最終提交時隨 `tags` 欄位送往掃描任務建立/更新端點。 【F:components/KeyValueInput.tsx†L37-L89】【F:components/AutoDiscoveryEditModal.tsx†L130-L209】

**需求與規格定義**
- 使用者需能為掃描任務新增多組標籤，並以定義表限制可選值。 【F:components/KeyValueInput.tsx†L13-L111】
- 系統應在切換 Key 時清空 Value、避免資料錯配；未填完整的列應在儲存前提示或過濾。 【F:components/KeyValueInput.tsx†L68-L111】
- [NEEDS CLARIFICATION: 是否需驗證至少填寫一組標籤或禁止空值提交？]

---

### resources-edit-datasource-modal.png

**現況描述**
- Modal 包含名稱、類型、驗證方式、URL/Endpoint、標籤欄位，下方提供「測試連線」與「儲存」按鈕，左側保留取消。 【F:components/DatasourceEditModal.tsx†L1-L118】
- 下拉選項由 Options Context 提供，載入中顯示「載入中...」。標籤使用 `KeyValueInput` 支援多組 Key-Value。 【F:components/DatasourceEditModal.tsx†L19-L118】

**互動流程**
- Modal 開啟時預設資料來源於現有 Datasource 或 Options 內的第一筆項目。 【F:components/DatasourceEditModal.tsx†L24-L44】
- 「測試連線」會驗證 URL 是否存在，然後呼叫 `POST /resources/datasources/test`，期間按鈕進入 `disabled` 狀態並顯示轉圈圖示。 【F:components/DatasourceEditModal.tsx†L45-L93】
- 儲存按鈕直接呼叫父層提供的 `onSave`；目前未檢查必填欄位是否為空。 【F:components/DatasourceEditModal.tsx†L31-L44】

**API 與資料流**
- 測試端點：`POST /resources/datasources/test`，回傳成功與延遲資訊並以 toast 呈現。 【F:components/DatasourceEditModal.tsx†L45-L93】【F:mock-server/handlers.ts†L1896-L2058】
- 儲存：父層根據是否有 `id` 決定調用 `POST` 或 `PATCH /resources/datasources/{id}`。 【F:pages/resources/DatasourceManagementPage.tsx†L58-L107】

**需求與規格定義**
- Modal 必須支援在儲存前先測試連線，並於測試期間避免重複提交。 【F:components/DatasourceEditModal.tsx†L45-L93】
- 系統應至少驗證名稱與 URL 非空，缺乏欄位驗證需補完。 【F:components/DatasourceEditModal.tsx†L31-L44】
- [NEEDS CLARIFICATION: 測試結果是否需寫回主表狀態欄，而不只 toast 呈現？]

---

### resources-edit-discovery-task-modal.png

**現況描述**
- `AutoDiscoveryEditModal` 以五段式卡片呈現：基本資訊、目標配置、Exporter 綁定、邊緣掃描、標籤與分類；底部提供「測試掃描」與「儲存」。 【F:components/AutoDiscoveryEditModal.tsx†L41-L312】
- 基本資訊區含名稱、掃描類型、Cron 排程；目標配置會依類型載入不同欄位（但 Kubernetes 目前顯示預設訊息）。 【F:components/AutoDiscoveryEditModal.tsx†L140-L213】【F:components/AutoDiscoveryEditModal.tsx†L214-L249】
- 邊緣掃描區提供勾選啟用與 Gateway 下拉，說明文字提示使用情境。 【F:components/AutoDiscoveryEditModal.tsx†L295-L312】

**互動流程**
- Modal 開啟時載入預設或既有資料，切換掃描類型會重置 `target_config` 與 Exporter 設定。 【F:components/AutoDiscoveryEditModal.tsx†L41-L129】
- 「測試掃描」需至少填寫名稱與類型，按鈕按下後呼叫測試 API 並顯示成功/警告訊息。 【F:components/AutoDiscoveryEditModal.tsx†L130-L209】
- 「儲存」將組合所有段落資料後回傳父層；Modal 關閉時會重置狀態。 【F:components/AutoDiscoveryEditModal.tsx†L41-L136】

**API 與資料流**
- 測試：`POST /resources/discovery-jobs/test`；儲存：`POST /resources/discovery-jobs` 或 `PATCH /resources/discovery-jobs/{id}`。 【F:components/AutoDiscoveryEditModal.tsx†L130-L209】【F:mock-server/handlers.ts†L1896-L2054】
- 選項：`GET /ui/options` 的 `auto_discovery` 節點提供所有下拉內容。 【F:components/AutoDiscoveryEditModal.tsx†L41-L62】【F:mock-server/db.ts†L2878-L2920】

**需求與規格定義**
- Modal 必須支援五步資訊的整合提交，並提供測試掃描以預估發現數與警告。 【F:components/AutoDiscoveryEditModal.tsx†L130-L209】
- 切換掃描類型需重置不相容設定並顯示相應欄位；需修正 Kubernetes 設定未顯示的問題。 【F:components/AutoDiscoveryEditModal.tsx†L140-L213】
- [NEEDS CLARIFICATION: 是否需要強制檢查必填欄位（例如 schedule 或 target_config）？]

---

### resources-edit-group-modal.png

**現況描述**
- Modal 包含群組名稱、擁有團隊、描述，並提供左右兩欄管理成員資源；標題會依新增或編輯切換。 【F:components/ResourceGroupEditModal.tsx†L1-L117】
- 可用資源與已選資源以捲動清單呈現，每列附帶切換按鈕；載入中顯示旋轉圖示。 【F:components/ResourceGroupEditModal.tsx†L17-L108】

**互動流程**
- 開啟 Modal 時同時抓取資源與團隊清單，若原資料無 owner_team 則預設第一個團隊。 【F:components/ResourceGroupEditModal.tsx†L33-L72】
- 按下儲存會組合欄位並附帶 `member_ids` 清單，返回父層由父層負責呼叫 API。 【F:components/ResourceGroupEditModal.tsx†L73-L117】
- 移除成員時即時更新右側清單；新增則將項目從左側移至右側。 【F:components/ResourceGroupEditModal.tsx†L17-L108】

**API 與資料流**
- Modal 本身不直接呼叫 API，資料載入使用 `GET /resources`、`GET /iam/teams`；儲存由父層呼叫 `POST/PUT /resource-groups`。 【F:components/ResourceGroupEditModal.tsx†L33-L117】【F:pages/resources/ResourceGroupPage.tsx†L21-L139】

**需求與規格定義**
- 必須驗證群組名稱、擁有團隊、成員列表皆已填寫；保存時需更新 `updated_at`。 【F:components/ResourceGroupEditModal.tsx†L73-L117】【F:mock-server/handlers.ts†L2210-L2305】
- 成員清單應支援大量資源（目前一次抓 1000 筆），必要時需分頁或搜尋。 【F:components/ResourceGroupEditModal.tsx†L49-L65】
- [NEEDS CLARIFICATION: 是否需要在 Modal 內提供資源搜尋？現行僅靠手動捲動挑選。]

---

### resources-edit-modal.png

**現況描述**
- `ResourceEditModal` 提供資源名稱、類型、提供商、區域、擁有者欄位，並依 Options 預設第一筆值。 【F:components/ResourceEditModal.tsx†L1-L82】
- Modal 底部僅有取消與儲存按鈕，未整合標籤或其他欄位。 【F:components/ResourceEditModal.tsx†L31-L77】

**互動流程**
- Modal 開啟時將現有資源或預設值寫入 `formData`；變更欄位即更新狀態。 【F:components/ResourceEditModal.tsx†L19-L44】
- 儲存按鈕觸發 `onSave`，父層負責決定 POST 或 PATCH。 【F:components/ResourceEditModal.tsx†L31-L44】

**API 與資料流**
- Options：`GET /ui/options` 的 `resources` 節點提供所有下拉列表。 【F:components/ResourceEditModal.tsx†L16-L44】【F:contexts/OptionsContext.tsx†L3-L34】
- 儲存：父層 `ResourceListPage` 呼叫 `POST /resources` 或 `PATCH /resources/{id}`。 【F:pages/resources/ResourceListPage.tsx†L58-L147】

**需求與規格定義**
- Modal 需檢查必填欄位（名稱、類型、提供商）是否為空，並在錯誤時提示使用者。 【F:components/ResourceEditModal.tsx†L31-L77】
- 建議補強標籤、描述等欄位以對齊資源清單可用資訊。 [NEEDS CLARIFICATION]

---

### resources-groups-list.png

**現況描述**
- Toolbar 左側提供「搜尋和篩選」，右側有「欄位設定」與「新增群組」；表格欄位可透過 Column Settings 自訂。 【F:pages/resources/ResourceGroupPage.tsx†L17-L142】
- 清單顯示群組名稱/描述、擁有團隊、成員數、狀態摘要等欄位，操作列提供編輯與刪除。 【F:pages/resources/ResourceGroupPage.tsx†L60-L132】
- 刪除流程包含確認 Modal。 【F:pages/resources/ResourceGroupPage.tsx†L133-L171】

**互動流程**
- 載入時同時取得群組資料、欄位設定與全部欄位定義；若無儲存過顯示全部欄位。 【F:pages/resources/ResourceGroupPage.tsx†L33-L91】
- 搜尋按鈕開啟 `UnifiedSearchModal`，提交後更新 `filters` 並重新載入。 【F:pages/resources/ResourceGroupPage.tsx†L24-L65】【F:components/UnifiedSearchModal.tsx†L1-L147】
- 欄位設定 Modal 儲存後透過 `PUT /settings/column-config/{key}` 更新後端設定。 【F:pages/resources/ResourceGroupPage.tsx†L92-L128】【F:mock-server/handlers.ts†L2030-L2062】

**API 與資料流**
- 清單：`GET /resource-groups`，支援排序；欄位設定透過 `GET /settings/column-config/{key}` 與 `GET /pages/columns/{key}`。 【F:pages/resources/ResourceGroupPage.tsx†L33-L91】【F:mock-server/handlers.ts†L2210-L2305】
- 新增/更新/刪除群組分別對應 `POST`、`PUT`、`DELETE /resource-groups`。 【F:pages/resources/ResourceGroupPage.tsx†L92-L171】【F:mock-server/handlers.ts†L2210-L2318】

**需求與規格定義**
- 需支援依照欄位設定儲存使用者偏好，並在重新開啟頁面時套用。 【F:pages/resources/ResourceGroupPage.tsx†L92-L128】
- 搜尋條件應完整覆蓋 `ResourceGroupFilters`（目前僅 keyword），必要時需擴充 UI。 【F:pages/resources/ResourceGroupPage.tsx†L24-L65】
- 刪除需二次確認並提示不可復原。 【F:pages/resources/ResourceGroupPage.tsx†L133-L171】

---

### resources-inventory-list.png

**現況描述**
- Toolbar 左側為「搜索和篩選」，右側依序為「匯入」「匯出」「欄位設定」「新增資源」，並在選取資料列時顯示批次動作（AI 分析、刪除、匯入、匯出）。 【F:pages/resources/ResourceListPage.tsx†L49-L121】
- 表格支援多選、欄位自訂，顯示狀態標籤、名稱、類型等欄位；底部附帶 `Pagination`。 【F:pages/resources/ResourceListPage.tsx†L121-L226】
- 點擊「查看詳情」會以 Drawer 呈現資源詳情頁；另有 `ResourceAnalysisModal`、`ImportFromCsvModal` 等輔助功能。 【F:pages/resources/ResourceListPage.tsx†L122-L211】【F:pages/resources/ResourceListPage.tsx†L226-L271】

**互動流程**
- 初次載入時同時取得資源列表、欄位配置、欄位定義；若未有儲存過則顯示全部欄位。 【F:pages/resources/ResourceListPage.tsx†L61-L116】
- 搜尋 Modal 回傳條件後會重設頁碼並重新載入資料；欄位設定儲存後更新 `visibleColumns`。 【F:pages/resources/ResourceListPage.tsx†L226-L257】【F:components/ColumnSettingsModal.tsx†L1-L160】
- 匯入按鈕開啟 `ImportFromCsvModal`；匯出依照選取狀態輸出 CSV；AI 分析會開啟 `ResourceAnalysisModal`。 【F:pages/resources/ResourceListPage.tsx†L147-L206】
- 刪除按鈕會顯示確認 Modal，確認後呼叫刪除 API 並重新載入。 【F:pages/resources/ResourceListPage.tsx†L147-L206】

**API 與資料流**
- 清單：`GET /resources`（含分頁、篩選參數）；欄位設定：`GET/PUT /settings/column-config/{key}` 與 `GET /pages/columns/{key}`；匯入：`POST /resources/import`；批次刪除：`POST /resources/batch-actions`。 【F:pages/resources/ResourceListPage.tsx†L61-L211】【F:mock-server/handlers.ts†L1565-L1760】
- 詳情 Drawer 透過 `ResourceDetailPage` 內部再次呼叫單一資源 API；AI 分析、CSV 匯出在前端處理。 【F:pages/resources/ResourceListPage.tsx†L121-L211】【F:services/export.ts†L1-L60】

**需求與規格定義**
- 須支援批次操作與個別操作共存，選取列時顯示批次工具列。 【F:pages/resources/ResourceListPage.tsx†L122-L206】
- 欄位設定需與使用者設定同步儲存並於後續載入時復原。 【F:pages/resources/ResourceListPage.tsx†L61-L211】
- 匯入/匯出應回饋成功訊息與錯誤處理；批次刪除需提示不可復原。 【F:pages/resources/ResourceListPage.tsx†L147-L211】
- [NEEDS CLARIFICATION: 是否需提供快速標籤或批次標籤功能與掃描結果保持一致？]

---

### resources-topology-view.png

**現況描述**
- 頁面上方提供布局（force、circular 等）與類型篩選下拉，並顯示說明提示。 【F:pages/resources/ResourceTopologyPage.tsx†L15-L112】【F:pages/resources/ResourceTopologyPage.tsx†L200-L235】
- 主視圖為 `ECharts` Graph，支援拖曳、縮放，節點依狀態著色，右鍵節點會開啟自訂快捷選單。 【F:pages/resources/ResourceTopologyPage.tsx†L40-L199】
- 快捷選單包含「查看資源詳情」「檢視相關事件」「執行腳本」三項。 【F:pages/resources/ResourceTopologyPage.tsx†L199-L235】

**互動流程**
- 載入時呼叫 `GET /resources/topology` 取得節點與連線資料，若失敗顯示錯誤卡片並提供重試。 【F:pages/resources/ResourceTopologyPage.tsx†L40-L96】【F:pages/resources/ResourceTopologyPage.tsx†L235-L260】
- 篩選選單改變時重新計算 `chartOption`，不需再次呼叫 API。 【F:pages/resources/ResourceTopologyPage.tsx†L40-L199】
- 右鍵選單點擊後依選項導向對應路由並關閉選單。 【F:pages/resources/ResourceTopologyPage.tsx†L199-L235】

**API 與資料流**
- 拓撲資料：`GET /resources/topology`；布局選項則來自 `GET /ui/options` 的 `topology.layouts`。 【F:pages/resources/ResourceTopologyPage.tsx†L15-L96】【F:mock-server/handlers.ts†L1565-L1614】【F:mock-server/db.ts†L2906-L2920】
- 狀態顏色依據 `options.resources.status_colors` 計算。 【F:pages/resources/ResourceTopologyPage.tsx†L24-L42】【F:mock-server/db.ts†L2806-L2875】

**需求與規格定義**
- 必須提供即時互動拓撲視覺化，支援布局切換與類型篩選；若資料載入失敗需有重試與錯誤提示。 【F:pages/resources/ResourceTopologyPage.tsx†L40-L260】
- 右鍵選單需維持與其他頁面路由一致並可快速導向詳細操作。 【F:pages/resources/ResourceTopologyPage.tsx†L199-L235】
- [NEEDS CLARIFICATION: 是否需支援節點搜尋或高亮功能，以便在大量節點時快速定位？]

