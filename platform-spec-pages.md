### platform-email-settings.png

**現況描述**
- 版面採用玻璃擬物卡片與資訊提示列，提供 SMTP 主機、埠號、加密、認證與寄件人欄位，預設值由伺服器端載入 `smtp_server`、`port`、`username` 等欄位。表單欄位統一使用 `FormRow` 包裝並套用暗色輸入樣式。【F:pages/settings/platform/MailSettingsPage.tsx†L7-L121】【F:mock-server/db.ts†L1770-L1771】
- 頁面在載入時顯示旋轉圖示，若後端回傳錯誤則以紅色文字顯示；成功載入後會在頂部顯示藍色資訊橫幅說明設定用途。【F:pages/settings/platform/MailSettingsPage.tsx†L62-L76】
- 測試結果以綠/紅色訊息框呈現，但儲存成功/失敗仍使用 `alert`，與其他頁面採用 toast 的方式不同，顯示出提醒風格不一致。【F:pages/settings/platform/MailSettingsPage.tsx†L51-L127】【F:services/toast.ts†L15-L60】

**互動流程**
- 首次進入頁面觸發 `fetchSettings()` 呼叫 API 載入當前設定，根據回應刷新狀態或顯示錯誤訊息。【F:pages/settings/platform/MailSettingsPage.tsx†L15-L30】
- 使用者修改欄位時透過 `handleChange` 即時更新本地 state，密碼欄位僅變更遮罩字串，不會寫回設定物件。【F:pages/settings/platform/MailSettingsPage.tsx†L32-L107】
- 點擊「發送測試郵件」會在按鈕上顯示載入狀態，收到回應後顯示成功/失敗訊息與時間戳。【F:pages/settings/platform/MailSettingsPage.tsx†L114-L127】
- 儲存流程直接將目前 `settings` 物件送出；若請求失敗則跳出 alert，未使用頁面統一的 toast 機制。【F:pages/settings/platform/MailSettingsPage.tsx†L51-L121】

**API 與資料流**
- `GET /settings/mail`：讀取 SMTP 設定，mock server 自動補上 `encryption_modes` 供前端下拉選單使用。【F:pages/settings/platform/MailSettingsPage.tsx†L19-L20】【F:mock-server/handlers.ts†L3222-L3272】
- `POST /settings/mail/test`：觸發測試郵件；若伺服器地址或收件人包含 `invalid`/`fail` 會回傳失敗訊息。【F:pages/settings/platform/MailSettingsPage.tsx†L38-L47】【F:mock-server/handlers.ts†L3533-L3542】
- `PUT /settings/mail`：儲存更新後的設定，mock server 直接覆寫並回傳最新資料。【F:pages/settings/platform/MailSettingsPage.tsx†L51-L55】【F:mock-server/handlers.ts†L3300-L3303】

**需求與規格定義**
- 平台管理者需要能夠檢視並更新 SMTP 主機、埠號、加密模式、登入帳號、寄件人資訊，以確保通知郵件可正常發送。【F:pages/settings/platform/MailSettingsPage.tsx†L77-L110】
- 系統必須在載入失敗時提供明確錯誤提示，並於測試流程呈現進度與結果訊息；測試結果需顯示時間戳供稽核。【F:pages/settings/platform/MailSettingsPage.tsx†L62-L127】
- 儲存時應改用全站一致的 toast 提示，避免與其他設定頁面體驗不一致。【F:pages/settings/platform/MailSettingsPage.tsx†L51-L58】【F:services/toast.ts†L15-L60】
- [NEEDS CLARIFICATION] 密碼欄位未隨 `settings` 一同送出，需確認是否應新增密碼欄位或支援專屬 API 以便更新憑證。【F:pages/settings/platform/MailSettingsPage.tsx†L9-L55】

---

### platform-grafana-settings.png

**現況描述**
- 頁面顯示 Grafana 整合資訊，包括啟用開關、URL、API Key、Org ID，搭配資訊橫幅提醒權限需求。API Key 欄位預設以 `**********` 顯示並提供眼睛圖示切換可視狀態。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L9-L115】
- 儲存與取消按鈕採用玻璃卡片底部工具列，保存時會出現載入圖示；測試結果以綠/紅訊息框顯示偵測版本與時間。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L127-L141】
- 頁面採用 `showToast` 呈現儲存結果，與其他平台設定保持一致。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L60-L139】【F:services/toast.ts†L15-L60】

**互動流程**
- 進入頁面後透過 `fetchSettings()` 取得現行設定並掩碼 API Key；若載入失敗則顯示錯誤訊息。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L18-L37】【F:pages/settings/platform/GrafanaSettingsPage.tsx†L75-L81】
- 使用者可切換整合開關、更新 URL 或 Org ID；API Key 欄位在未顯示實際值時會沿用伺服器端現有值。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L39-L114】
- 點擊「測試連線」會攜帶最新欄位值呼叫測試 API 並依結果顯示資訊，期間按鈕呈現載入狀態以避免重複送出。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L45-L132】
- 儲存操作會組合目前欄位與 API Key 後送出，成功時重新載入設定以重置遮罩狀態；取消按鈕會重新取回伺服器資料以捨棄編輯。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L60-L140】

**API 與資料流**
- `GET /settings/grafana`：取得 Grafana 整合設定；mock server 以預設值回傳並在初次載入時將 API Key 掩碼顯示於前端。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L18-L27】【F:mock-server/db.ts†L1771-L1776】
- `POST /settings/grafana/test`：帶入 URL、API Key、Org ID 進行驗證；若 URL 含 `fail` 或 API Key 為 `invalid-key` 則回傳失敗訊息，成功時提供偵測版本。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L45-L125】【F:mock-server/handlers.ts†L3544-L3557】
- `PUT /settings/grafana`：儲存設定並於伺服器端覆寫；若成功則回傳更新後資料。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L60-L71】【F:mock-server/handlers.ts†L3304-L3306】

**需求與規格定義**
- 使用者需要能啟用/停用 Grafana 整合並更新連線參數，系統須在欄位輸入與測試流程中提供即時回饋。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L91-L132】
- API Key 必須在 UI 層提供顯示/隱藏切換，並在未輸入新值時沿用原本密鑰避免非預期清空。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L102-L109】
- 測試流程需阻止空白 URL 並在失敗時顯示具體原因，以利偵錯與權限驗證。【F:mock-server/handlers.ts†L3545-L3554】
- 儲存成功後應自動重新載入資料，以確保畫面與後端狀態同步並重設掩碼狀態。【F:pages/settings/platform/GrafanaSettingsPage.tsx†L64-L139】

---

### platform-identity-settings.png

**現況描述**
- 身份驗證頁面以警示色資訊框提醒設定風險，所有欄位均為唯讀顯示，包括 Provider、Realm、Client ID、Client Secret 及 OIDC 端點 URL。【F:pages/settings/platform/AuthSettingsPage.tsx†L43-L100】
- OIDC 開關以禁用狀態呈現，僅顯示目前是否啟用，符合「IdP 管理員專責調整」的定位。【F:pages/settings/platform/AuthSettingsPage.tsx†L51-L56】

**互動流程**
- 進入頁面即呼叫 API 取得設定；若失敗則顯示錯誤訊息。頁面僅支援檢視，未提供編輯或儲存操作。【F:pages/settings/platform/AuthSettingsPage.tsx†L12-L40】
- 載入階段顯示旋轉圖示，成功後以自訂 `ReadOnlyInput` 元件呈現文字，確保無法修改敏感資料。【F:pages/settings/platform/AuthSettingsPage.tsx†L29-L100】

**API 與資料流**
- `GET /settings/auth`：載入 OIDC 設定，mock server 提供 Keycloak 預設值及 IdP 管理端 URL，無更新端點。【F:pages/settings/platform/AuthSettingsPage.tsx†L12-L40】【F:mock-server/db.ts†L1782-L1782】【F:mock-server/handlers.ts†L3274-L3274】

**需求與規格定義**
- 系統需提供唯讀檢視以供平台管理者查驗當前 OIDC 設定並提醒風險；任何修改應另行透過 IdP 管理流程完成。【F:pages/settings/platform/AuthSettingsPage.tsx†L43-L100】
- 若後端無法取得設定，前端必須顯示錯誤訊息並避免顯示過期資料，以免產生誤解。【F:pages/settings/platform/AuthSettingsPage.tsx†L35-L40】
- [NEEDS CLARIFICATION] 是否需提供「下載 metadata」或「跳轉至 IdP 管理端」的快捷連結，以支援跨系統對照。【F:mock-server/db.ts†L1782-L1782】

---

### platform-layout-manager.png

**現況描述**
- 版面管理頁以資訊橫幅說明用途，下方為折疊式清單列出各中心頁面目前顯示的 KPI 卡片與最後更新資訊，並提供「Edit」按鈕開啟編輯 Modal。【F:pages/settings/platform/LayoutSettingsPage.tsx†L249-L279】
- 若資料載入中或 Content 未就緒則顯示全頁載入圖示；錯誤時以紅色圖示與 Retry 按鈕提示使用者重試。【F:pages/settings/platform/LayoutSettingsPage.tsx†L229-L247】

**互動流程**
- 進入頁面後同時呼叫 `GET /settings/layouts` 與 `GET /settings/widgets` 載入佈局與可用卡片，並依內容中心語系化文本決定是否顯示頁面。【F:pages/settings/platform/LayoutSettingsPage.tsx†L170-L191】【F:mock-server/handlers.ts†L3222-L3226】
- 使用者展開單一頁面後可檢視目前順序；點擊「Edit」會儲存當前頁名並打開 Modal。【F:pages/settings/platform/LayoutSettingsPage.tsx†L123-L147】【F:pages/settings/platform/LayoutSettingsPage.tsx†L195-L205】
- 儲存時將新的 `widget_ids` 陣列送至後端，成功後更新本地狀態、寫入 localStorage 並觸發 `storage` 事件，確保其他頁面即時刷新卡片顯示。【F:pages/settings/platform/LayoutSettingsPage.tsx†L203-L220】

**API 與資料流**
- `GET /settings/layouts`：載入所有頁面的已選 KPI 卡片與更新資訊。【F:mock-server/handlers.ts†L3222-L3225】【F:mock-server/db.ts†L1841-L1896】
- `GET /settings/widgets`：取得全域可用的卡片清單及支援頁面，用於 Modal 中的候選列表。【F:mock-server/handlers.ts†L3222-L3226】【F:mock-server/db.ts†L1783-L1804】
- `PUT /settings/layouts`：儲存最新配置並在伺服器端更新 `updated_at`、`updated_by` 欄位；回傳最新佈局供前端同步。【F:pages/settings/platform/LayoutSettingsPage.tsx†L203-L220】【F:mock-server/handlers.ts†L3282-L3293】

**需求與規格定義**
- 平台管理者需能快速檢視每個頁面的 KPI 卡片清單與更新記錄，並可觸發編輯流程調整順序。【F:pages/settings/platform/LayoutSettingsPage.tsx†L123-L205】
- 儲存操作應立即反映至其他頁面，因此必須同步寫入 localStorage 並廣播 `storage` 事件供 KPI 元件監聽。【F:pages/settings/platform/LayoutSettingsPage.tsx†L213-L216】
- 錯誤狀態需提供 Retry 操作，確保在 API 失敗時仍能重試載入。【F:pages/settings/platform/LayoutSettingsPage.tsx†L237-L245】

---

### platform-layout-edit-kpi-modal.png

**現況描述**
- 編輯 Modal 採 2 欄雙列表設計，左側為可選卡片、右側為已顯示卡片，提供箭頭按鈕新增/移除、上下移動調整順序。【F:pages/settings/platform/LayoutSettingsPage.tsx†L43-L91】
- Modal 頁尾提供取消與儲存按鈕，沿用全域文案 `CANCEL`、`SAVE` 確保語系一致；內容未載入時顯示載入訊息。【F:pages/settings/platform/LayoutSettingsPage.tsx†L260-L279】

**互動流程**
- Modal 打開時會根據目前頁面的 `widget_ids` 篩選出已選卡片，並利用 `supported_pages` 過濾可用列表，避免加入不支援的 KPI。【F:pages/settings/platform/LayoutSettingsPage.tsx†L195-L227】
- 新增/移除操作透過 `onChange` 更新本地 `modalWidgets`；上下移動透過交換陣列元素改變順序。【F:pages/settings/platform/LayoutSettingsPage.tsx†L47-L64】【F:pages/settings/platform/LayoutSettingsPage.tsx†L85-L88】
- 點擊儲存時會重組選擇結果並呼叫前述 `PUT /settings/layouts`，成功後關閉 Modal 並更新父層狀態。【F:pages/settings/platform/LayoutSettingsPage.tsx†L203-L220】【F:pages/settings/platform/LayoutSettingsPage.tsx†L260-L278】

**API 與資料流**
- Modal 不額外呼叫 API，改用父層已載入的 `allWidgets` 與 `layouts` 資料；儲存沿用父層 `handleSaveLayout` 的 `PUT /settings/layouts` 流程。【F:pages/settings/platform/LayoutSettingsPage.tsx†L203-L279】

**需求與規格定義**
- 使用者需要直觀方式調整 KPI 卡片顯示順序與清單，Modal 必須防止加入不支援該頁面的卡片並支援上下排序。【F:pages/settings/platform/LayoutSettingsPage.tsx†L43-L205】
- 儲存前應明確標示當前頁面名稱並允許取消退出，以避免誤修改其他頁面配置。【F:pages/settings/platform/LayoutSettingsPage.tsx†L260-L278】

---

### platform-license-page.png

**現況描述**
- 頁面以大型獎章圖示與卡片呈現目前授權等級（社群版）、升級說明與商業版功能清單，底部提供 `mailto` 連結以聯絡銷售。【F:pages/settings/platform/LicensePage.tsx†L18-L41】【F:mock-server/db.ts†L846-L858】
- 若內容尚未載入則顯示中央載入圖示，維持與其他 Content 依賴頁面一致的骨架行為。【F:pages/settings/platform/LicensePage.tsx†L10-L16】

**互動流程**
- 頁面依賴 `ContentContext` 呼叫 `/ui/content` 取得多語系字串；若尚未載入則顯示 loading。內容僅供瀏覽，無其他互動。【F:pages/settings/platform/LicensePage.tsx†L6-L24】【F:contexts/ContentContext.tsx†L14-L39】
- 點擊「聯絡我們以升級」會開啟預設郵件客戶端並帶入銷售信箱地址。【F:pages/settings/platform/LicensePage.tsx†L35-L41】【F:mock-server/db.ts†L857-L858】

**API 與資料流**
- `GET /ui/content`：取得頁面文案（TITLE、DESCRIPTION、FEATURES_LIST、CONTACT_EMAIL）；若失敗則頁面保持 loading 狀態或顯示錯誤（待另外處理）。【F:contexts/ContentContext.tsx†L14-L39】【F:mock-server/db.ts†L846-L858】

**需求與規格定義**
- 頁面需清楚告知目前授權狀態並列出升級價值主張，提供明確的聯絡行動按鈕。【F:pages/settings/platform/LicensePage.tsx†L18-L41】
- 應維持 Content 未載入時的 loading 體驗，並考慮補上錯誤提示以避免使用者長時間等待。【F:pages/settings/platform/LicensePage.tsx†L10-L16】

---

### platform-tags-overview.png

**現況描述**
- 標籤管理頁包含治理提示、工具列（搜尋/匯入/匯出/欄位設定/新增）、可多選的表格與批次操作，支援換頁與欄位顯示設定。【F:pages/settings/platform/TagManagementPage.tsx†L343-L516】
- 表格列出標籤鍵、描述、適用範圍、可寫入角色等資料，系統標籤以鎖頭與灰色文字標示唯讀狀態。【F:pages/settings/platform/TagManagementPage.tsx†L248-L441】
- 若讀取中或錯誤會顯示 `TableLoader` 或 `TableError`；選取列時以底色高亮並顯示批次工具列。【F:pages/settings/platform/TagManagementPage.tsx†L390-L441】

**互動流程**
- 頁面初始化會透過 `usePageMetadata` 取得欄位設定鍵，再同時呼叫 `GET /settings/tags`、`GET /settings/column-config/{pageKey}`、`GET /pages/columns/{pageKey}` 載入資料與欄位清單；資料載入後會根據伺服器設定決定預設顯示欄位。【F:pages/settings/platform/TagManagementPage.tsx†L51-L88】【F:mock-server/handlers.ts†L3222-L3243】【F:mock-server/db.ts†L949-L1117】
- 搜尋條件變更時會重置頁碼與選取清單；批次刪除前透過 `window.confirm` 二次確認，成功後刷新資料並顯示 toast。【F:pages/settings/platform/TagManagementPage.tsx†L89-L127】【F:pages/settings/platform/TagManagementPage.tsx†L110-L126】
- 單筆操作可開啟編輯、管理標籤值或刪除 Modal。新增/編輯時使用 `TagDefinitionEditModal` 驗證至少選一個範圍與可寫入角色；管理值時 `TagValuesManageModal` 僅允許 `enum` 類型新增/刪除值。【F:pages/settings/platform/TagManagementPage.tsx†L148-L203】【F:components/TagDefinitionEditModal.tsx†L16-L98】【F:components/TagValuesManageModal.tsx†L14-L78】
- 匯入操作透過 `ImportFromCsvModal` 支援拖放或範本下載；匯出則以 `exportToCsv` 根據目前篩選結果輸出。【F:pages/settings/platform/TagManagementPage.tsx†L231-L245】【F:components/ImportFromCsvModal.tsx†L19-L120】
- 欄位設定按鈕開啟 `ColumnSettingsModal`，儲存後呼叫 `PUT /settings/column-config/{pageKey}` 並更新 `visibleColumns`。【F:pages/settings/platform/TagManagementPage.tsx†L132-L146】【F:pages/settings/platform/TagManagementPage.tsx†L489-L504】
- 頁面底部顯示 `Pagination` 控制頁碼與每頁筆數，呼叫相同查詢邏輯更新列表。【F:pages/settings/platform/TagManagementPage.tsx†L505-L516】

**API 與資料流**
- `GET /settings/tags`：支援分頁與排序，回傳 `{ items, total }`；後端以 `getActive` 過濾軟刪除資料。【F:pages/settings/platform/TagManagementPage.tsx†L51-L80】【F:mock-server/handlers.ts†L3226-L3239】
- `PUT /settings/tags/{id}/values`：儲存標籤值集合；若標籤不存在回傳 404。【F:pages/settings/platform/TagManagementPage.tsx†L153-L163】【F:mock-server/handlers.ts†L3308-L3315】
- `POST /settings/tags` / `PATCH /settings/tags/{id}`：建立或更新標籤定義並寫入稽核記錄，包含欄位驗證與重複鍵檢查。【F:pages/settings/platform/TagManagementPage.tsx†L165-L191】【F:mock-server/handlers.ts†L3470-L3505】【F:mock-server/handlers.ts†L3704-L3819】
- `DELETE /settings/tags/{id}`：前端逐一呼叫刪除 API；mock server 會標記並回傳成功訊息。【F:pages/settings/platform/TagManagementPage.tsx†L193-L211】【F:mock-server/handlers.ts†L3822-L3840】
- `PUT /settings/column-config/{pageKey}` 與 `GET /pages/columns/{pageKey}`：管理欄位顯示設定與欄位定義，結合 `PageMetadataContext` 取得頁面鍵值。【F:pages/settings/platform/TagManagementPage.tsx†L51-L146】【F:mock-server/handlers.ts†L3241-L3243】【F:contexts/PageMetadataContext.tsx†L5-L42】
- `POST /settings/tags/import`：匯入 CSV，回傳統計摘要與訊息；mock options 提供可選範圍與角色清單。【F:components/ImportFromCsvModal.tsx†L75-L120】【F:mock-server/handlers.ts†L3636-L3668】【F:mock-server/db.ts†L2834-L2838】
- `GET /ui/options`：提供 `tag_management` 的範圍與角色選項，供 `TagDefinitionEditModal` 使用。【F:components/TagDefinitionEditModal.tsx†L16-L66】【F:contexts/OptionsContext.tsx†L14-L36】【F:mock-server/db.ts†L2834-L2918】

**需求與規格定義**
- 系統需提供標籤定義的 CRUD、值域管理、匯入/匯出與欄位自訂，並於操作後顯示 toast 回饋與更新表格資料。【F:pages/settings/platform/TagManagementPage.tsx†L132-L516】
- 管理者在儲存標籤定義時必須至少勾選一個範圍與可寫入角色，違反條件需透過 toast 阻擋送出。【F:components/TagDefinitionEditModal.tsx†L35-L76】
- 匯入流程需提供範本下載、拖放/點選上傳與結果摘要，成功後要自動刷新列表並清空檔案快取。【F:components/ImportFromCsvModal.tsx†L45-L118】
- 系統標籤 (readonly) 禁止編輯/刪除並明顯標示，以防破壞核心治理規則。【F:pages/settings/platform/TagManagementPage.tsx†L248-L441】【F:tag-registry.ts†L30-L56】
- 當搜尋條件改變時，自動重置頁碼與選取狀態以避免批次操作套用在過時資料上。【F:pages/settings/platform/TagManagementPage.tsx†L89-L123】

