# 儀表板功能規格整理

### dashboard-overview-ai-summary.png

**現況描述**  
- SRE War Room 總覽分為 KPI 卡、AI 每日簡報三卡區塊與兩張圖表。AI 區塊內含「穩定度摘要」「關鍵異常」「建議操作」三張等寬卡片，右上角提供重新整理按鈕。下方圖表為服務健康度熱圖與資源群組堆疊長條圖，皆以玻璃態卡片呈現。【F:pages/SREWarRoomPage.tsx†L177-L220】【F:pages/SREWarRoomPage.tsx†L221-L276】
- 依據既有審查，AI 卡片的邊距與 CTA 按鈕尺寸需與其他統計卡一致，避免資訊密度落差；右側按鈕與容器邊線需保留一致留白。【F:pages.md†L5-L12】

**互動流程**  
- 初次載入同時觸發 `GET /ai/briefing` 與兩個 dashboard 資料 API，呈現 skeleton 後更新卡片與圖表；失敗時顯示錯誤訊息並保留重試按鈕。【F:pages/SREWarRoomPage.tsx†L43-L79】【F:pages/SREWarRoomPage.tsx†L188-L205】
- 使用者可點擊重新整理按鈕觸發 `POST /ai/briefing/generate` 以重新產生摘要；期間按鈕進入 loading 狀態避免重複送出。【F:pages/SREWarRoomPage.tsx†L82-L93】【F:pages/SREWarRoomPage.tsx†L183-L187】
- 服務健康度與資源群組圖表點擊資料列時，分別導向資源清單與資源群組頁面，延續使用者調查流程。【F:pages/SREWarRoomPage.tsx†L95-L109】
- KPI 列由 `PageKPIs` 元件載入 widget 與 KPI 資料，若尚未設定會顯示引導空狀態。【F:components/PageKPIs.tsx†L23-L74】【F:components/PageKPIs.tsx†L96-L118】

**API 與資料流**  
- AI 簡報：`GET /ai/briefing`、`POST /ai/briefing/generate` 回傳摘要、異常與建議文字；資料來源為 mock DB 的 `ai_briefing`。【F:mock-server/handlers.ts†L462-L470】【F:mock-server/db.ts†L3122-L3134】
- 服務健康與資源狀態：`GET /dashboards/sre-war-room/service-health`、`GET /dashboards/sre-war-room/resource-group-status` 取得圖表資料，失敗時顯示錯誤並允許重試。【F:pages/SREWarRoomPage.tsx†L56-L74】【F:mock-server/handlers.ts†L534-L538】
- KPI 區塊：`PageKPIs` 會呼叫 `GET /kpi-data`、`GET /settings/widgets` 與 `GET /settings/layouts`，並緩存於元件狀態；缺資料時改顯示缺少設定的提示卡。【F:components/PageKPIs.tsx†L29-L59】【F:mock-server/handlers.ts†L3200-L3244】【F:mock-server/handlers.ts†L3880-L3902】

**需求與規格定義**  
- 使用者進入頁面時，系統必須在 3 秒內顯示 loading 狀態並於 API 成功後更新三張 AI 卡與兩張圖表；失敗時顯示錯誤文字與重試行為。  
- 重整 AI 簡報時需鎖定按鈕並於完成後還原；若 API 失敗顯示錯誤訊息並保留舊資料供參考。  
- 點擊異常資源名稱或圖表列需導向對應資源頁並自動套用來源條件。  
- KPI 資料缺漏時應顯示導引空狀態並提示至版面設定頁配置。  
- [NEEDS CLARIFICATION] AI 卡片是否需顯示生成時間戳與資料來源？若需，需在 API 或內容模型補充欄位。

---

### dashboards-list.png

**現況描述**  
- 頁面由工具列（搜尋、匯入、匯出、欄位設定、新增儀表板）與表格組成。表格包含多選框、類型膠囊、分類 pill、擁有者、更新時間與操作按鈕（設為首頁、編輯、刪除）。【F:pages/dashboards/DashboardListPage.tsx†L254-L349】
- 頁面審查指出分類膠囊與語系需統一、星號收藏圖示需一致 hover 提示；可納入 UI 改善需求。【F:pages.md†L132-L139】

**互動流程**  
- 初始化會根據分頁與篩選參數同時取得列表資料、已儲存欄位組合與可用欄位，並於載入完成後渲染表格；錯誤時顯示重試元件。【F:pages/dashboards/DashboardListPage.tsx†L58-L91】【F:pages/dashboards/DashboardListPage.tsx†L311-L320】
- 工具列按鈕：搜尋開啟 `UnifiedSearchModal` 套用條件；匯入開啟 CSV 匯入模態；匯出依勾選輸出 CSV；欄位設定儲存後即刻更新表頭；新增開啟 `AddDashboardModal`。【F:pages/dashboards/DashboardListPage.tsx†L254-L389】
- 列表支援單列點擊導向儀表板路徑、勾選多筆後顯示批次工具列並執行刪除；刪除與單筆刪除皆在成功後重載資料與清空選取。【F:pages/dashboards/DashboardListPage.tsx†L119-L195】【F:pages/dashboards/DashboardListPage.tsx†L267-L279】
- 設為首頁會更新 localStorage，維持預設儀表板狀態；內建儀表板的編輯會導向編輯頁，Grafana 型則開啟編輯模態。【F:pages/dashboards/DashboardListPage.tsx†L114-L174】【F:pages/dashboards/DashboardListPage.tsx†L339-L347】

**API 與資料流**  
- 列表資料：`GET /dashboards` 依分頁、分類、關鍵字傳回 `items` 與 `total`；支援排序。欄位設定分別呼叫 `GET /settings/column-config/{pageKey}`、`GET /pages/columns/{pageKey}` 並以 `PUT /settings/column-config/{pageKey}` 儲存。【F:pages/dashboards/DashboardListPage.tsx†L58-L112】【F:mock-server/handlers.ts†L533-L560】【F:mock-server/handlers.ts†L355-L362】【F:mock-server/handlers.ts†L3223-L3299】
- 建立／更新／刪除：`POST /dashboards` 需帶入名稱、類型、分類；`PATCH /dashboards/{id}`、`DELETE /dashboards/{id}` 與 `POST /dashboards/batch-actions`（action=delete）完成維護。後端自動填入 path、resource_ids 與時間戳並寫入審計紀錄。【F:pages/dashboards/DashboardListPage.tsx†L123-L195】【F:mock-server/handlers.ts†L562-L680】
- 新增模態：內建類型導向 `/dashboards/new`；Grafana 類型需先呼叫 `GET /dashboards/available-grafana` 取得清單，再將選定資訊透過 onSave 交由列表頁呼叫 `POST /dashboards`。【F:components/AddDashboardModal.tsx†L45-L109】【F:mock-server/handlers.ts†L533-L545】
- 匯入：前端設定匯入端點為 `/dashboards/import`，但 mock server 尚未實作相應路由，需確認後端支援或移除入口。[NEEDS CLARIFICATION]。【F:pages/dashboards/DashboardListPage.tsx†L381-L389】【F:mock-server/handlers.ts†L533-L680】

**需求與規格定義**  
- 需提供分頁、分類、關鍵字與欄位設定的狀態記憶，重新整理後維持上一個條件。  
- 新增儀表板時應在成功後自動刷新列表並關閉模態；若失敗顯示錯誤 Toast。  
- 批次刪除需在確認後呼叫 API 並清空選取狀態；刪除預設儀表板時應回退至系統預設 ID。  
- 匯出須支援全列表與僅匯出選取列，無資料時顯示錯誤提示。  
- [NEEDS CLARIFICATION] 匯入功能需確認後端是否支援檔案上傳與格式驗證。

---

### dashboards-template-gallery.png

**現況描述**  
- 範本市集以 1-3 欄自適應卡片呈現，每張卡片包含圖示、分類徽章、名稱、描述與置底的「使用此範本」按鈕；載入中顯示旋轉圖示。【F:pages/dashboards/DashboardTemplatesPage.tsx†L24-L58】
- 既有審查指出卡片高度需統一並將主要按鈕改為品牌主色，以維持與其他模組一致性。【F:pages.md†L140-L147】

**互動流程**  
- 頁面掛載時呼叫 `GET /dashboards/templates`，成功後渲染卡片；失敗目前僅列印 console error，需補上 UI 錯誤提示。【F:pages/dashboards/DashboardTemplatesPage.tsx†L12-L18】
- 點擊「使用此範本」按鈕會攜帶 `template` 狀態導向 `/dashboards/new`，供編輯器預填名稱與佈局。【F:pages/dashboards/DashboardTemplatesPage.tsx†L20-L48】

**API 與資料流**  
- `GET /dashboards/templates` 回傳範本列表；資料儲存在 mock DB `dashboard_templates` 集合。【F:mock-server/handlers.ts†L533-L546】【F:mock-server/db.ts†L3047-L3055】
- 編輯器接收的 `location.state.template` 由範本卡片帶入後續流程，無額外 API 呼叫。【F:pages/dashboards/DashboardEditorPage.tsx†L80-L92】

**需求與規格定義**  
- 範本列表需在 2 秒內完成載入或顯示錯誤提示；卡片高度需固定確保按鈕置底。  
- 需支援最少 3 種分類徽章並沿用設計系統色票。  
- 點擊範本後必須攜帶 template 物件至編輯器頁面，若帶入失敗需顯示錯誤並維持在市集頁。  
- [NEEDS CLARIFICATION] 是否需提供範本搜尋或篩選條件以支援大量範本管理？

---

### dashboards-builder-empty.png

**現況描述**  
- 編輯器頁面包含標題列（頁面標題、名稱輸入、撤銷、取消、儲存按鈕）、「新增小工具」按鈕以及玻璃態編輯畫布。空狀態顯示大型圖示、標題與指引文字。【F:pages/dashboards/DashboardEditorPage.tsx†L286-L317】
- 審查建議標題與操作按鈕需保持層級、空狀態圖示應放大並提供操作指引，可納入 UI 調整需求。【F:pages.md†L148-L155】

**互動流程**  
- 初次載入呼叫 `/settings/widgets` 與 `/kpi-data` 取得可用小工具與 KPI 資料；新建模式會預設名稱與空佈局，模板模式則以 `location.state` 帶入名稱。【F:pages/dashboards/DashboardEditorPage.tsx†L60-L92】
- 使用者可更改名稱，首次 focus 會清除預設值避免覆寫模板名稱；撤銷從歷史堆疊回復前一步。取消按鈕返回列表。【F:pages/dashboards/DashboardEditorPage.tsx†L262-L305】
- 儲存時驗證名稱必填與類別已載入；新建會補齊描述、擁有者、更新時間再呼叫 `POST /dashboards`，成功後返回列表；失敗顯示 toast。【F:pages/dashboards/DashboardEditorPage.tsx†L139-L168】

**API 與資料流**  
- `GET /settings/widgets`、`GET /kpi-data` 提供可用小工具與 KPI 值；資料來源為 mock DB `layout_widgets` 與 `kpi_data`。【F:pages/dashboards/DashboardEditorPage.tsx†L60-L72】【F:mock-server/handlers.ts†L3200-L3244】【F:mock-server/handlers.ts†L3880-L3902】
- 儲存流程：新建呼叫 `POST /dashboards`，後端自動產生 `id`、`path`、`resource_ids`、時間戳並寫入審計；編輯模式則呼叫 `PATCH /dashboards/{id}` 更新佈局。【F:pages/dashboards/DashboardEditorPage.tsx†L150-L168】【F:mock-server/handlers.ts†L562-L663】
- 預設分類來自 Options Context 的 `dashboards.categories`，來源為 mock DB `MOCK_DASHBOARD_OPTIONS`。【F:pages/dashboards/DashboardEditorPage.tsx†L54-L57】【F:mock-server/db.ts†L2804-L2814】

**需求與規格定義**  
- 編輯器在資料載入前需顯示 loading 狀態並禁止儲存；錯誤時顯示錯誤訊息與重試指引。  
- 使用者必須能透過撤銷回復至少 10 步操作歷史。  
- 儲存成功後導回列表並顯示成功 toast；若預設分類載入失敗需阻止儲存並提示。  
- 空狀態需提供新增小工具指引與呼叫行為以降低探索成本。

---

### dashboards-add-widget-modal.png

**現況描述**  
- 「新增小工具」模態以兩欄卡片列出可用 widget，每項顯示名稱、描述與右側新增按鈕；標題為動態內容設定的字串。【F:pages/dashboards/DashboardEditorPage.tsx†L307-L375】
- 審查發現小工具清單可能含重複項且缺乏分類或預覽，可列入後續優化需求。【F:pages.md†L156-L163】

**互動流程**  
- 開啟模態時使用 `availableWidgets` 陣列（已排除已加入項目），點擊「+」會尋找空白位置、推入歷史堆疊後加入佈局並關閉模態。【F:pages/dashboards/DashboardEditorPage.tsx†L108-L131】【F:pages/dashboards/DashboardEditorPage.tsx†L340-L350】
- 模態關閉時會保留當前佈局狀態；新增後畫布立即更新並可撤銷。  
- 小工具資料來自初始載入的 `/settings/widgets`，描述文案直接顯示於卡片。【F:pages/dashboards/DashboardEditorPage.tsx†L60-L72】【F:pages/dashboards/DashboardEditorPage.tsx†L367-L375】

**API 與資料流**  
- 無額外 API 呼叫；所有資料在編輯器載入時一次取得。新增後的佈局僅存於前端狀態直到使用者按下儲存，再透過 `POST`/`PATCH /dashboards` 一併提交。【F:pages/dashboards/DashboardEditorPage.tsx†L60-L168】

**需求與規格定義**  
- 模態需根據當前佈局即時更新可選列表，避免重複加入同一 widget。  
- 點擊新增需自動計算不重疊的位置並關閉模態；若無空間需提示使用者調整佈局。  
- [NEEDS CLARIFICATION] 是否需提供搜尋、分類或預覽圖以改善大量小工具瀏覽體驗？  
- 需確保螢幕閱讀器可辨識按鈕用途並提供可見焦點樣式。

---

### dashboards-builder-with-widgets.png

**現況描述**  
- 畫布內已放置多個 Contextual KPI 卡，支援拖曳、調整大小與移除；滑鼠懸停顯示刪除按鈕與調整角標記。操作中會出現彩色 Ghost 區塊提示是否重疊。【F:pages/dashboards/DashboardEditorPage.tsx†L318-L363】
- 既有審查提到卡片縱向間距較大、缺乏拖曳手柄提示，可視情況調整 spacing 與加入顯性手柄。【F:pages.md†L164-L171】

**互動流程**  
- 拖曳／縮放會推入歷史堆疊並透過滑鼠事件更新佈局；若移動後與其他卡片重疊會顯示錯誤訊息並回退到前一狀態。【F:pages/dashboards/DashboardEditorPage.tsx†L172-L239】【F:pages/dashboards/DashboardEditorPage.tsx†L340-L350】
- 刪除按鈕移除 widget 並更新佈局；撤銷可復原刪除或位置調整。名稱輸入變更與佈局調整都會在儲存時打包進 payload。【F:pages/dashboards/DashboardEditorPage.tsx†L123-L183】【F:pages/dashboards/DashboardEditorPage.tsx†L340-L347】
- 儲存時依模式呼叫 `POST` 或 `PATCH /dashboards`，成功後顯示成功訊息並返回列表。【F:pages/dashboards/DashboardEditorPage.tsx†L150-L168】

**API 與資料流**  
- 佈局資料持續保存在前端狀態，直到呼叫儲存 API；後端會更新 `layout` 並自動刷新 `updated_at`。【F:pages/dashboards/DashboardEditorPage.tsx†L150-L168】【F:mock-server/handlers.ts†L562-L663】
- KPI 顯示需要 `kpi_data` 與 `ContextualKPICard` 描述轉換，確保百分比或「嚴重」關鍵字突出顯示。【F:pages/dashboards/DashboardEditorPage.tsx†L269-L282】【F:components/PageKPIs.tsx†L70-L116】

**需求與規格定義**  
- 拖曳與縮放必須避免重疊並提供即時視覺提示，重疊時顯示錯誤並還原。  
- 刪除與撤銷需支援鍵盤操作（tab+enter）並維持可及性。  
- 儲存前需驗證至少存在一個 widget，否則提醒使用者新增內容。[NEEDS CLARIFICATION: 是否允許儲存空儀表板？]  
- 需在視覺上提供拖曳手柄或游標提示，改善使用者對可拖曳區域的認知。
