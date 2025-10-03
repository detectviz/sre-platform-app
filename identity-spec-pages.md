### identity-users-list.png

**現況描述**
- 人員列表以表格呈現，支援多選核取方塊、欄位抬頭固定與懸浮列操作區，預設欄位為姓名（含頭像與電子郵件）、角色、團隊、狀態與上次登入時間。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L230-L307】【F:mock-server/db.ts†L1023-L1049】
- 工具列左側提供「搜尋和篩選」入口，右側提供匯入、匯出、欄位設定與「邀請人員」按鈕；當有勾選時改顯示批次操作工具列（停用、刪除、匯入、匯出）。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L230-L258】
- 空狀態／錯誤狀態採用共用元件顯示載入動畫或錯誤提示，底部顯示頁碼統計與每頁筆數選單。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L280-L315】【F:components/TableLoader.tsx†L4-L22】【F:components/TableError.tsx†L4-L30】【F:components/Pagination.tsx†L12-L48】
- 頁面掛載時會依據 Page Metadata 取得欄位定義與使用者自訂欄位設定，並以 Toast 告知欄位設定儲存結果。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L52-L108】【F:mock-server/db.ts†L949-L1120】
- 列表下方掛載「邀請成員」、「編輯成員」、「刪除確認」、「匯入 CSV」與「進階搜尋」等多個模態元件以支援不同操作流程。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L317-L371】

**互動流程**
- 使用者可透過「搜尋和篩選」開啟統一搜尋模態，目前僅支援關鍵字過濾；清除篩選會將頁碼重置至第一頁。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L361-L371】【F:components/UnifiedSearchModal.tsx†L317-L358】
- 勾選列後顯示批次操作工具列，可停用或刪除多筆使用者，或直接啟動匯入／匯出；未勾選時匯入按鈕同時存在於主要工具列與批次工具列，易造成操作重複。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L230-L258】
- 點選編輯圖示開啟「編輯成員」模態，顯示不可變更的電子郵件與姓名欄位，並允許調整角色、團隊與狀態；儲存後觸發 API 更新並關閉模態。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L317-L329】【F:components/UserEditModal.tsx†L16-L101】
- 點選「邀請人員」按鈕開啟邀請模態，必填電子郵件與角色，提交後會重置表單欄位；若缺少必填欄位則不送出。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L120-L131】【F:components/InviteUserModal.tsx†L21-L117】
- 點選垃圾桶圖示或批次刪除會先顯示確認對話框，確認後才呼叫刪除 API；取消則維持原狀。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L330-L344】
- 點擊匯出時若無可匯出資料會以 `alert` 提示；成功時透過瀏覽器下載 CSV。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L192-L207】【F:services/export.ts†L7-L46】

**API 與資料流**
- 讀取流程會同時呼叫 `GET /api/v1/iam/users`（支援 `page`、`page_size`、`keyword` 與後端排序參數）、`GET /api/v1/settings/column-config/{pageKey}` 與 `GET /api/v1/pages/columns/{pageKey}`，其中 `pageKey` 由 PageMetadata 提供。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L52-L90】【F:mock-server/handlers.ts†L2680-L2703】【F:contexts/PageMetadataContext.tsx†L18-L37】
- 狀態標籤的樣式與標籤文字來自 `GET /api/v1/ui/options` 取得的 `options.personnel.statuses`，在 OptionsContext 中快取並注入。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L110-L118】【F:contexts/OptionsContext.tsx†L14-L36】【F:types.ts†L1097-L1099】
- 邀請流程呼叫 `POST /api/v1/iam/users`，傳入 `email`、`name`、`role`、`team` 等欄位；成功後重新整理列表並於 Mock Server 產生日誌紀錄。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L120-L133】【F:components/InviteUserModal.tsx†L54-L63】【F:mock-server/handlers.ts†L2715-L2782】
- 編輯流程呼叫 `PATCH /api/v1/iam/users/{id}`，刪除則呼叫 `DELETE /api/v1/iam/users/{id}`；批次停用／刪除使用 `POST /api/v1/iam/users/batch-actions`。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L132-L190】【F:mock-server/handlers.ts†L2716-L2956】
- 匯入流程透過共用模態上傳檔名並呼叫 `POST /api/v1/iam/users/import`，成功後顯示 Toast 並重新讀取列表。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L352-L358】【F:components/ImportFromCsvModal.tsx†L83-L132】【F:mock-server/handlers.ts†L2749-L2752】
- 匯出資料於前端組裝後透過 `exportToCsv` 產生 CSV 並觸發下載，不需經過後端額外處理。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L192-L207】【F:services/export.ts†L7-L46】

**需求與規格定義**
- 使用者需要透過統一搜尋、欄位設定與分頁快速整理人員清單；系統必須在載入時同步取得欄位定義與個人化設定，並在儲存失敗時透過 Toast 顯示錯誤。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L52-L108】
- 使用者需能批次停用或刪除帳號並立即看到結果；系統需在批次 API 完成後重刷列表並清空已選取的項目。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L182-L190】
- 邀請新成員時，系統必須驗證電子郵件與角色欄位必填，成功後清空表單並允許連續邀請；未通過驗證時不得送出 API。【F:components/InviteUserModal.tsx†L42-L63】
- 編輯成員流程需在開啟模態時預先載入角色與團隊選項，並允許更新角色、團隊與狀態；儲存後需觸發 `PATCH /iam/users/{id}` 並關閉模態。【F:components/UserEditModal.tsx†L25-L98】【F:mock-server/handlers.ts†L2875-L2956】
- 匯入與匯出功能需提供模板下載、拖曳上傳與狀態提示；若後端回傳錯誤訊息需透過 Toast 呈現。【F:components/ImportFromCsvModal.tsx†L75-L131】【F:services/toast.ts†L15-L63】
- [NEEDS CLARIFICATION: 匯入操作同時出現在主要工具列與批次工具列，是否需要整併以避免操作混淆？]
- [NEEDS CLARIFICATION: 列表匯出／匯入採用 `alert` 與 `Toast` 混合提示，是否需統一成 Toast 通知？]

---

### identity-invite-member-modal.png

**現況描述**
- 模態視窗提供電子郵件、姓名（選填）、角色與團隊欄位，角色與團隊欄位具說明圖示與下拉選單，底部提供取消與發送邀請按鈕。【F:components/InviteUserModal.tsx†L66-L114】
- 開啟模態時同步載入可選角色與團隊清單，完成後自動預選列表的第一個項目；載入期間下拉選單顯示「載入中...」。【F:components/InviteUserModal.tsx†L31-L49】
- 電子郵件欄位必填並即時更新本地狀態，提交時若未填電子郵件或角色將不呼叫 `onInvite`。【F:components/InviteUserModal.tsx†L54-L62】【F:components/InviteUserModal.tsx†L85-L107】

**互動流程**
- 開啟模態觸發 `Promise.all` 取得 `/iam/roles` 與 `/iam/teams`，完成後更新下拉選單與預設值；失敗時目前僅吞掉錯誤，未提供 UI 提示。【F:components/InviteUserModal.tsx†L31-L49】
- 使用者編輯欄位後按「發送邀請」即觸發 `onInvite` 回呼，父層會呼叫 `POST /iam/users` 建立邀請並關閉模態；提交成功後模態重置欄位，以便連續邀請。【F:components/InviteUserModal.tsx†L54-L63】【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L120-L131】
- 取消按鈕立即關閉模態但不重置欄位狀態，除非再次開啟時初始化流程重新執行。【F:components/InviteUserModal.tsx†L66-L77】

**API 與資料流**
- `GET /api/v1/iam/roles` 與 `GET /api/v1/iam/teams` 透過查詢參數 `page=1&page_size=1000` 取得完整清單，Mock Server 回傳 `items` 陣列與 `total` 計數。【F:components/InviteUserModal.tsx†L31-L37】【F:mock-server/handlers.ts†L2680-L2703】
- 提交時父層呼叫 `POST /api/v1/iam/users`，Mock Server 會驗證必填欄位與角色是否合法，建立成功後返回新使用者並寫入稽核日誌。【F:mock-server/handlers.ts†L2715-L2781】

**需求與規格定義**
- 必須驗證電子郵件格式與角色必填，失敗時提供明確錯誤訊息（目前僅阻擋送出，無 UI 提示）。【F:components/InviteUserModal.tsx†L54-L63】
- 載入角色與團隊失敗時需提示使用者，避免出現空白選單；建議使用 Toast 或錯誤訊息顯示。【F:components/InviteUserModal.tsx†L31-L49】
- 成功邀請後需要回饋使用者（如 Toast 或行內訊息）並刷新列表，現況僅重新載入資料，建議補充成功提示。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L120-L133】
- [NEEDS CLARIFICATION: 是否允許一次邀請多位人員或支援批次匯入？目前僅支援逐筆邀請。]

---

### identity-edit-member-modal.png

**現況描述**
- 編輯成員模態展示電子郵件與姓名（唯讀）、角色、團隊、狀態三個可選欄位，以及取消／儲存變更按鈕。【F:components/UserEditModal.tsx†L50-L99】
- 開啟時同步載入全量團隊與角色資料，並透過 OptionsContext 取得狀態下拉選項；載入期間會顯示「載入中...」。【F:components/UserEditModal.tsx†L25-L37】【F:components/UserEditModal.tsx†L82-L97】【F:contexts/OptionsContext.tsx†L14-L36】
- `handleSubmit` 僅在 `user` 存在時才觸發 `onSave`，避免非預期儲存動作。【F:components/UserEditModal.tsx†L40-L44】

**互動流程**
- 每當模態開啟會將 `user` 內容寫入本地 `formData`，修改下拉選項即更新對應欄位；電子郵件與姓名為唯讀，避免錯誤修改身份資訊。【F:components/UserEditModal.tsx†L25-L71】
- 儲存時父層 `onSave` 呼叫 `PATCH /iam/users/{id}`，成功後關閉模態並刷新列表；失敗時以 `alert` 提示錯誤，需要與其他流程一致化。【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L132-L144】
- 狀態下拉選單的選項標籤與 class 由 `options.personnel.statuses` 提供，確保狀態顯示與主列表一致。【F:components/UserEditModal.tsx†L93-L97】【F:types.ts†L1097-L1099】

**API 與資料流**
- `GET /api/v1/iam/teams` 與 `GET /api/v1/iam/roles` 每次開啟時重新抓取，確保最新列表；若來源大量成長需考量快取或分頁策略。【F:components/UserEditModal.tsx†L25-L37】【F:mock-server/handlers.ts†L2680-L2703】
- 儲存呼叫 `PATCH /api/v1/iam/users/{id}`，Mock Server 會更新欄位、寫入 `updated_at` 並產生稽核日誌。【F:mock-server/handlers.ts†L2875-L2956】

**需求與規格定義**
- 系統必須在開啟模態時載入最新的團隊與角色資料；若載入失敗需明確提示與重試機制。【F:components/UserEditModal.tsx†L25-L37】
- 需允許調整使用者狀態並同步顯示在列表的樣式標籤；儲存時更新 `updated_at` 以利審計。【F:components/UserEditModal.tsx†L93-L101】【F:mock-server/handlers.ts†L2875-L2956】
- [NEEDS CLARIFICATION: 是否允許修改姓名或電子郵件？目前為唯讀欄位，如需支援應補上驗證流程。]
- [NEEDS CLARIFICATION: 失敗時僅使用 `alert` 提示，是否需改為 Toast 與重試選項？]

---

### identity-teams-list.png

**現況描述**
- 團隊列表顯示團隊名稱、擁有者、成員數與建立時間欄位，並支援多選核取方塊與列內編輯／刪除按鈕。【F:pages/settings/identity-access/TeamManagementPage.tsx†L202-L235】【F:mock-server/db.ts†L1030-L1035】
- 工具列提供搜尋入口、欄位設定與「新增團隊」，選取列時顯示批次刪除按鈕。【F:pages/settings/identity-access/TeamManagementPage.tsx†L187-L200】
- 頁面初始化時同時抓取團隊與使用者列表，以便將擁有者 ID 對應為名稱並顯示在表格中。【F:pages/settings/identity-access/TeamManagementPage.tsx†L42-L82】
- 列表下方掛載團隊編輯模態、刪除確認模態、欄位設定與統一搜尋模態（目前僅支援關鍵字）。【F:pages/settings/identity-access/TeamManagementPage.tsx†L242-L283】

**互動流程**
- 「新增團隊」與列內編輯皆開啟相同的 TeamEditModal；刪除流程先跳出確認視窗才呼叫 API。【F:pages/settings/identity-access/TeamManagementPage.tsx†L99-L125】【F:pages/settings/identity-access/TeamManagementPage.tsx†L242-L264】
- 選取列後批次工具列僅提供刪除，操作後會重新整理資料並清除選取狀態。【F:pages/settings/identity-access/TeamManagementPage.tsx†L165-L200】
- 欄位設定與搜尋邏輯與其他列表一致，可自訂顯示欄位與關鍵字查詢。【F:pages/settings/identity-access/TeamManagementPage.tsx†L83-L97】【F:pages/settings/identity-access/TeamManagementPage.tsx†L265-L283】

**API 與資料流**
- 讀取流程同時呼叫 `GET /api/v1/iam/teams`、`GET /api/v1/iam/users`、`GET /api/v1/settings/column-config/{pageKey}` 與 `GET /api/v1/pages/columns/{pageKey}`；團隊 API 支援 `keyword` 篩選與排序參數。【F:pages/settings/identity-access/TeamManagementPage.tsx†L42-L65】【F:mock-server/handlers.ts†L2688-L2703】
- 新增／更新團隊分別呼叫 `POST /api/v1/iam/teams` 與 `PATCH /api/v1/iam/teams/{id}`，Mock Server 會驗證擁有者與成員 ID 是否存在並記錄稽核日誌。【F:pages/settings/identity-access/TeamManagementPage.tsx†L109-L121】【F:mock-server/handlers.ts†L2784-L2949】
- 刪除與批次刪除皆轉為軟刪除並寫入審計日誌，回傳空物件。【F:pages/settings/identity-access/TeamManagementPage.tsx†L126-L164】【F:mock-server/handlers.ts†L2784-L2956】

**需求與規格定義**
- 系統需確保擁有者與成員 ID 在提交時有效，若有缺失需回傳 404 與明確錯誤訊息。【F:mock-server/handlers.ts†L2784-L2822】
- 列表需反映最新的擁有者名稱與成員數，故在讀取時必須同時取得使用者資料並建構快取以便顯示。【F:pages/settings/identity-access/TeamManagementPage.tsx†L42-L82】
- [NEEDS CLARIFICATION: 批次刪除僅提供刪除一種操作，是否需要批次更新成員或擁有者？]

---

### identity-edit-team-modal.png

**現況描述**
- 模態包含團隊名稱、擁有者、描述欄位，以及左右雙欄的成員管理介面（可用人員 vs 團隊成員），底部提供取消／儲存按鈕。【F:components/TeamEditModal.tsx†L83-L133】
- 開啟時載入所有使用者清單並自動帶入原始資料，若新建團隊且尚未指定擁有者會預設為第一筆使用者。【F:components/TeamEditModal.tsx†L39-L64】
- 成員列表透過按鈕將使用者移動至另一側，並即時更新成員 ID 陣列；載入中顯示旋轉圖示。【F:components/TeamEditModal.tsx†L80-L129】

**互動流程**
- 儲存時組合 `Team` 物件（若為新建則 `id` 為空字串，後端會重新產生），並將 `updated_at` 設為現在時間；提交後由父層決定呼叫新增或更新 API。【F:components/TeamEditModal.tsx†L67-L78】【F:pages/settings/identity-access/TeamManagementPage.tsx†L109-L121】
- 點擊可用人員或成員的箭頭按鈕即可將使用者加入／移出團隊；所有操作皆只更新本地狀態，實際提交需按下儲存。【F:components/TeamEditModal.tsx†L118-L127】
- 模態關閉後父層不會自動重置狀態，下一次開啟時會依照 `team` prop 重新初始化欄位。【F:components/TeamEditModal.tsx†L39-L64】

**API 與資料流**
- 模態開啟時呼叫 `GET /api/v1/iam/users` 取得全量使用者；Mock Server 以 `page_size=1000` 回傳，不支援即時搜尋，若使用者數量成長需規劃延伸設計。【F:components/TeamEditModal.tsx†L54-L63】【F:mock-server/handlers.ts†L2680-L2703】
- 儲存後由父層呼叫 `POST /api/v1/iam/teams` 或 `PATCH /api/v1/iam/teams/{id}`，Mock Server 驗證擁有者與成員 IDs。【F:pages/settings/identity-access/TeamManagementPage.tsx†L109-L121】【F:mock-server/handlers.ts†L2784-L2956】

**需求與規格定義**
- 成員清單須顯示電子郵件與姓名並支援大量滾動；若使用者數量超過預設 `page_size` 需提供搜尋或分頁機制。【F:components/TeamEditModal.tsx†L80-L129】
- 儲存時需確保 `member_ids` 與 `owner_id` 不重複或遺漏；應在前端加上基本驗證，例如團隊至少需要一位擁有者。【F:components/TeamEditModal.tsx†L67-L103】
- [NEEDS CLARIFICATION: 新增團隊時先送出 `id: ''`，需確認後端是否允許或應於前端去除該欄位。]

---

### identity-roles-list.png

**現況描述**
- 角色列表顯示啟用開關、角色名稱（含描述）、使用者數量與建立時間，並提供多選、批次刪除與列內編輯／刪除操作。【F:pages/settings/identity-access/RoleManagementPage.tsx†L194-L243】
- 工具列提供搜尋、欄位設定與新增角色；選取列時顯示批次刪除工具列。【F:pages/settings/identity-access/RoleManagementPage.tsx†L195-L207】
- 資料載入同樣依賴 Page Metadata 與欄位設定服務，並於錯誤或載入時顯示共用元件。【F:pages/settings/identity-access/RoleManagementPage.tsx†L41-L88】【F:components/TableLoader.tsx†L4-L22】

**互動流程**
- 點擊新增或編輯開啟 RoleEditModal；刪除前會出現確認視窗提示刪除後權限將失效。【F:pages/settings/identity-access/RoleManagementPage.tsx†L91-L114】【F:pages/settings/identity-access/RoleManagementPage.tsx†L248-L271】
- 列表中的啟用欄位提供切換開關，觸發 `PATCH /iam/roles/{id}` 以更新狀態並顯示 Toast 成功／失敗訊息。【F:pages/settings/identity-access/RoleManagementPage.tsx†L118-L138】
- 批次刪除使用 `POST /iam/roles/batch-actions`，完成後清除選取並重新讀取資料。【F:pages/settings/identity-access/RoleManagementPage.tsx†L108-L114】【F:mock-server/handlers.ts†L2820-L2956】

**API 與資料流**
- 列表讀取與欄位設定流程與其他列表相同，依序呼叫 `GET /iam/roles`、`GET /settings/column-config/{pageKey}`、`GET /pages/columns/{pageKey}`。【F:pages/settings/identity-access/RoleManagementPage.tsx†L41-L61】
- 新增角色呼叫 `POST /api/v1/iam/roles`，編輯則呼叫 `PATCH /api/v1/iam/roles/{id}`；Mock Server 會寫入審計日誌並維持軟刪除策略。【F:pages/settings/identity-access/RoleManagementPage.tsx†L101-L114】【F:mock-server/handlers.ts†L2820-L2956】

**需求與規格定義**
- 系統需提供角色啟用／停用即時回饋，並在 API 失敗時提示使用者；目前使用 Toast 完成此需求。【F:pages/settings/identity-access/RoleManagementPage.tsx†L118-L138】
- 批次刪除需提示不可復原並更新相關使用者權限，建議在後端同步處理與回傳影響範圍。【F:pages/settings/identity-access/RoleManagementPage.tsx†L248-L271】【F:mock-server/handlers.ts†L2715-L2956】
- [NEEDS CLARIFICATION: 是否需提供批次啟用／停用？目前僅支援刪除。]

---

### identity-edit-role-modal.png

**現況描述**
- 模態使用 ContentContext 提供在地化字詞，包含角色名稱、描述與權限設定區塊，權限以模組為單位展開／收合並列出所有可勾選動作。【F:components/RoleEditModal.tsx†L22-L169】
- 開啟時呼叫 `/iam/permissions` 取得模組與動作清單，並依現有角色權限預先勾選；載入中顯示等待提示。【F:components/RoleEditModal.tsx†L35-L52】
- 每個模組提供「全選」與個別勾選選項，支援變更時即時更新本地 `permissions` 狀態；底部操作按鈕提供取消與儲存。【F:components/RoleEditModal.tsx†L68-L158】

**互動流程**
- 展開／收合模組透過 `toggleModule` 控制 `openModules` 陣列；全選按鈕會一次覆寫該模組的動作集合。【F:components/RoleEditModal.tsx†L68-L89】【F:components/RoleEditModal.tsx†L137-L161】
- 儲存時組合 `Role` 物件，若為新增則 `id` 為空字串並預設 `enabled: true`；父層負責決定呼叫新增或更新 API。【F:components/RoleEditModal.tsx†L54-L66】【F:pages/settings/identity-access/RoleManagementPage.tsx†L101-L114】
- 若 ContentContext 尚未載入則顯示 loading 模態，避免閃爍。【F:components/RoleEditModal.tsx†L91-L105】

**API 與資料流**
- 權限列表透過 `GET /api/v1/iam/permissions` 取得，Mock Server 回傳模組描述與動作對應；此清單用於初始化 `permissions` 狀態。【F:components/RoleEditModal.tsx†L35-L52】【F:mock-server/handlers.ts†L2680-L2705】
- 儲存結果由父層呼叫 `POST /api/v1/iam/roles` 或 `PATCH /api/v1/iam/roles/{id}`，Mock Server 會更新 `permissions` 陣列與稽核日誌。【F:pages/settings/identity-access/RoleManagementPage.tsx†L101-L114】【F:mock-server/handlers.ts†L2820-L2956】

**需求與規格定義**
- 模態需確保每個模組的動作集合在勾選／取消時維持資料一致，並在儲存前驗證角色名稱必填；目前尚未提供前端驗證，需補強。【F:components/RoleEditModal.tsx†L54-L123】
- 需支援權限列表過長時的滾動與區塊視覺提示（目前提供 `max-h` 與滾動容器）。【F:components/RoleEditModal.tsx†L120-L169】
- [NEEDS CLARIFICATION: 若角色停用是否需在模態中顯示狀態切換？目前僅可在列表切換。]

---

### identity-audit-log-list.png

**現況描述**
- 審計日誌列表提供可排序的欄位抬頭、行點擊開啟詳情的互動，以及統一搜尋與欄位設定按鈕；右側工具列另提供匯出功能。【F:pages/settings/identity-access/AuditLogsPage.tsx†L143-L207】
- 預設欄位包含時間、使用者、操作、目標、結果與 IP 位址，欄位資訊由欄位設定服務提供；結果欄以顏色區分成功／失敗。【F:pages/settings/identity-access/AuditLogsPage.tsx†L126-L140】【F:mock-server/db.ts†L1042-L1049】
- 透過 `SortableHeader` 顯示排序圖示，並在查詢參數帶入 `sort_by` 與 `sort_order`。【F:pages/settings/identity-access/AuditLogsPage.tsx†L34-L87】【F:components/SortableHeader.tsx†L4-L27】
- 點擊列會開啟右側 Drawer 顯示完整 JSON，ESC 或點擊背景可關閉。【F:pages/settings/identity-access/AuditLogsPage.tsx†L197-L208】【F:components/Drawer.tsx†L13-L54】

**互動流程**
- 搜尋按鈕開啟統一搜尋模態，支援關鍵字、使用者、操作類型與時間區間過濾；選擇完成後重新載入並重置頁碼。【F:pages/settings/identity-access/AuditLogsPage.tsx†L209-L219】【F:components/UnifiedSearchModal.tsx†L64-L75】【F:components/UnifiedSearchModal.tsx†L200-L235】
- 欄位設定儲存後更新可見欄位並透過 Toast 提示結果；若儲存失敗也會顯示錯誤訊息。【F:pages/settings/identity-access/AuditLogsPage.tsx†L89-L103】
- 匯出功能會將當前資料轉成 CSV，若列表為空則彈出 `alert` 提示無資料可匯出。【F:pages/settings/identity-access/AuditLogsPage.tsx†L105-L124】

**API 與資料流**
- 讀取流程同樣呼叫 `GET /api/v1/iam/audit-logs`、`GET /api/v1/settings/column-config/{pageKey}`、`GET /api/v1/pages/columns/{pageKey}`；後端支援排序參數並進行分頁。【F:pages/settings/identity-access/AuditLogsPage.tsx†L39-L68】【F:mock-server/handlers.ts†L2680-L2711】
- 統一搜尋模態為取得使用者清單會額外呼叫 `GET /api/v1/iam/users`，用於篩選下拉選單。【F:components/UnifiedSearchModal.tsx†L62-L75】
- 匯出於前端執行，不追加後端呼叫；若後續需求增加需評估後端批次匯出能力。【F:pages/settings/identity-access/AuditLogsPage.tsx†L105-L124】【F:services/export.ts†L7-L46】

**需求與規格定義**
- 使用者需能依操作人、動作與時間範圍檢索稽核日誌，並於點擊列時查看完整 JSON；系統需確保 Drawer 內容易讀並可複製。【F:pages/settings/identity-access/AuditLogsPage.tsx†L126-L208】
- 欄位設定需跨頁維持，儲存失敗時需提供重試入口（目前僅顯示 Toast，可考慮加入重試按鈕）。【F:pages/settings/identity-access/AuditLogsPage.tsx†L89-L103】
- 匯出功能不應在資料為空時彈出 `alert`，建議改以 Toast 或禁用按鈕提示。【F:pages/settings/identity-access/AuditLogsPage.tsx†L105-L124】
- [NEEDS CLARIFICATION: 是否需支援批次匯出整批資料而非僅匯出當頁？]

---

### identity-audit-log-detail.png

**現況描述**
- 詳情 Drawer 以固定寬度（螢幕寬度的一半）顯示，標題包含日誌 ID，內容區塊以 JSON 字串格式呈現完整紀錄資料。【F:pages/settings/identity-access/AuditLogsPage.tsx†L197-L208】
- Drawer 支援 ESC 鍵與背景點擊關閉，並鎖定背景滾動避免雙重滾動。【F:components/Drawer.tsx†L13-L54】

**互動流程**
- 點擊列表任一列即更新 `selectedLog` 狀態並開啟 Drawer，關閉時將狀態設回 `null`；無額外編輯功能。【F:pages/settings/identity-access/AuditLogsPage.tsx†L173-L208】
- JSON 內容使用 `JSON.stringify` 直接序列化，缺乏語法高亮或欄位說明；若日誌結構變更將直接反映於輸出。【F:pages/settings/identity-access/AuditLogsPage.tsx†L197-L206】

**API 與資料流**
- Drawer 無額外 API 呼叫，僅重用列表查詢取得的 `AuditLog` 物件；資料結構由 `mock-server` 定義包含 `details` 任意欄位。【F:pages/settings/identity-access/AuditLogsPage.tsx†L39-L208】【F:mock-server/db.ts†L1634-L1665】

**需求與規格定義**
- 詳情視圖需確保大筆 JSON 仍可閱讀（目前僅單純字串化），建議加入格式化或欄位說明；亦可提供複製按鈕方便取用。【F:pages/settings/identity-access/AuditLogsPage.tsx†L197-L206】
- Drawer 需提供錯誤防護，避免在資料為空時顯示 `undefined`；目前已透過條件渲染確保 `selectedLog` 存在才顯示內容。【F:pages/settings/identity-access/AuditLogsPage.tsx†L197-L206】
- [NEEDS CLARIFICATION: 是否需要提供直接匯出單筆日誌或連結到原始操作詳細頁？]

