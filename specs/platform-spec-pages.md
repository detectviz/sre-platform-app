### `platform-email-settings.png`

**現況描述**
- 此頁面提供了一個表單，用於設定系統的 SMTP 郵件伺服器。
- 表單包含 SMTP 伺服器、埠號、加密方式、使用者名稱、密碼、寄件人名稱和寄件人地址等欄位。
- 頁面頂部有一個提示框，說明此設定將用於所有系統通知。
- 頁面底部有「發送測試郵件」和「儲存變更」兩個操作按鈕。
- 密碼欄位預設顯示為星號遮蔽。

**互動流程**
1.  **載入頁面**：
    -   使用者進入頁面時，系統會自動發送請求，獲取目前的郵件設定並填入表單。
2.  **修改設定**：
    -   使用者可以修改表單中的任何欄位。
    -   所有欄位變更會即時更新到前端的狀態中。
    -   必填欄位（SMTP 伺服器、埠號、寄件人地址）需填寫才能成功儲存。
3.  **儲存變更**：
    -   使用者點擊「儲存變更」按鈕。
    -   系統會將表單中的所有設定資料發送到後端進行儲存。
    -   儲存成功後，系統應提示「設定已成功儲存」。
    -   若儲存失敗，系統應提示錯誤訊息。
4.  **測試連線**：
    -   使用者點擊「發送測試郵件」按鈕。
    -   系統會使用**目前表單中**的設定（而非已儲存的設定）來嘗試發送一封測試郵件。
    -   按鈕會進入「測試中...」的禁用狀態，並顯示載入圖示。
    -   測試完成後，會在按鈕下方顯示測試結果，包括成功或失敗的訊息以及測試時間。
    -   **實現細節**: 點擊「發送測試郵件」會在按鈕上顯示載入狀態，收到回應後顯示成功/失敗訊息與時間戳 【F:pages/settings/platform/MailSettingsPage.tsx†L114-L127】

**API 與資料流**
1.  **取得郵件設定**
    -   **API**: `GET /api/v1/settings/mail`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: `MailSettings` 物件。
        ```json
        {
          "smtp_server": "smtp.example.com",
          "port": 587,
          "username": "noreply@sre.platform",
          "sender_name": "SRE Platform",
          "sender_email": "noreply@sre.platform",
          "encryption": "tls",
          "encryption_modes": ["none", "tls", "ssl"]
        }
        ```
    -   **實現細節**: 首次進入頁面觸發 `fetchSettings()` 呼叫 API 載入當前設定，根據回應刷新狀態或顯示錯誤訊息 【F:pages/settings/platform/MailSettingsPage.tsx†L15-L30】
2.  **更新郵件設定**
    -   **API**: `PUT /api/v1/settings/mail`
    -   **傳出參數 (Request Body)**: `MailSettings` 物件 (不含 `encryption_modes`)。
    -   **傳入資料 (Response)**: 更新後的 `MailSettings` 物件。
    -   **實現細節**: 儲存流程直接將目前 `settings` 物件送出；若請求失敗則跳出 alert，未使用頁面統一的 toast 機制 【F:pages/settings/platform/MailSettingsPage.tsx†L51-L121】
3.  **測試郵件設定**
    -   **API**: `POST /api/v1/settings/mail/test`
    -   **傳出參數 (Request Body)**: 目前表單的郵件設定。
    -   **實現細節**: 觸發測試郵件；若伺服器地址或收件人包含 `invalid`/`fail` 會回傳失敗訊息 【F:pages/settings/platform/MailSettingsPage.tsx†L38-L47】【F:mock-server/handlers.ts†L3533-L3542】
    -   **傳入資料 (Response)**: `MailTestResponse` 物件。
        ```json
        // 成功
        {
          "success": true,
          "result": "success",
          "message": "測試郵件已成功送出。",
          "tested_at": "2025-10-02T12:00:00Z"
        }
        // 失敗
        {
          "success": false,
          "result": "failed",
          "message": "連線失敗：請確認 SMTP 設定或收件人。",
          "tested_at": "2025-10-02T12:01:00Z"
        }
        ```

**需求與規格定義**
- **USR-PLATFORM-MAIL-001**: 作為平台管理員，我需要能夠設定系統的 SMTP 伺服器，以便平台可以發送通知郵件。
- **SPEC-PLATFORM-MAIL-001.1**: 系統必須提供一個表單，包含 SMTP 伺服器、埠號、加密方式、使用者名稱、密碼、寄件人名稱、寄件人地址等欄位。
- **SPEC-PLATFORM-MAIL-001.2**: SMTP 伺服器、埠號、寄件人地址為必填欄位。
- **SPEC-PLATFORM-MAIL-001.3**: 加密方式必須提供一個下拉選單，選項應從 API (`GET /settings/mail` 的 `encryption_modes` 欄位) 動態載入。
- **USR-PLATFORM-MAIL-002**: 在儲存設定前，我希望能先測試目前的設定是否能成功連線並發送郵件。
- **SPEC-PLATFORM-MAIL-002.1**: 系統必須提供一個「發送測試郵件」按鈕，點擊後會觸發 `POST /api/v1/settings/mail/test`。
- **SPEC-PLATFORM-MAIL-002.2**: 測試郵件的 API 請求應包含一個收件人地址，用於接收測試郵件 `[NEEDS CLARIFICATION: 目前 API 未定義測試收件人地址，建議 API 增加 `recipient_email` 欄位]`。
- **SPEC-PLATFORM-MAIL-002.3**: 測試結果（無論成功或失敗）都必須在畫面上清晰地展示給使用者。
- **USR-PLATFORM-MAIL-003**: 我需要能夠儲存我修改後的郵件設定。
- **SPEC-PLATFORM-MAIL-003.1**: 系統必須提供一個「儲存變更」按鈕，點擊後會觸發 `PUT /api/v1/settings/mail` 來保存設定。
- **SPEC-PLATFORM-MAIL-003.2**: 系統應在儲存操作完成後提供明確的成功或失敗回饋。

### `platform-grafana-settings.png`

**現況描述**
- 此頁面提供了一個表單，用於設定與外部 Grafana 實例的整合。
- 頁面頂部有一個提示框，說明此設定的用途。
- 表單包含一個「啟用 Grafana 整合」的開關、Grafana URL、Grafana API Key 和組織 ID (Org ID) 等欄位。
- API Key 為密碼欄位，並提供一個眼睛圖示來切換可見性。
- 頁面底部有「測試連線」、「取消」和「儲存變更」三個操作按鈕。

**互動流程**
1.  **載入頁面**：
    -   使用者進入頁面時，系統會自動發送請求，獲取目前的 Grafana 設定並填入表單。
    -   API Key 會被前端以 `**********` 遮蔽。
2.  **修改設定**：
    -   使用者可以點擊開關來啟用或停用 Grafana 整合。
    -   使用者可以修改 URL、API Key 和 Org ID。
3.  **測試連線**：
    -   使用者點擊「測試連線」按鈕。
    -   系統會使用**目前表單中**的設定（包括使用者新輸入的 API Key）發送請求進行測試。
    -   按鈕會進入「測試中...」的禁用狀態。
    -   測試完成後，會在表單下方顯示結果，包括成功或失敗的訊息、偵測到的 Grafana 版本以及測試時間。
4.  **儲存變更**：
    -   使用者點擊「儲存變更」按鈕。
    -   系統會將表單中的所有設定資料（包括使用者新輸入的 API Key）發送到後端進行儲存。
    -   儲存成功後，系統應提示成功訊息，並重新載入設定（以再次遮蔽 API Key）。
    -   若儲存失敗，系統應提示錯誤訊息。
5.  **取消變更**：
    -   使用者點擊「取消」按鈕。
    -   系統會重新抓取一次已儲存的設定，放棄所有本地的修改。

**API 與資料流**
1.  **取得 Grafana 設定**
    -   **API**: `GET /api/v1/settings/grafana`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: `GrafanaSettings` 物件。
        ```json
        {
          "enabled": true,
          "url": "http://localhost:3000",
          "api_key": "glsa_xxxxxxxxxxxxxxxxxxxxxxxx",
          "org_id": 1
        }
        ```
2.  **更新 Grafana 設定**
    -   **API**: `PUT /api/v1/settings/grafana`
    -   **傳出參數 (Request Body)**: `GrafanaSettings` 物件。
    -   **傳入資料 (Response)**: 更新後的 `GrafanaSettings` 物件。
3.  **測試 Grafana 連線**
    -   **API**: `POST /api/v1/settings/grafana/test`
    -   **傳出參數 (Request Body)**: `GrafanaSettings` 物件。
    -   **傳入資料 (Response)**: `GrafanaTestResponse` 物件。
        ```json
        // 成功
        {
          "success": true,
          "result": "success",
          "message": "連線成功！偵測到 Grafana v10.1.2。",
          "detected_version": "Grafana v10.1.2",
          "tested_at": "2025-10-02T12:30:00Z"
        }
        // 失敗
        {
          "success": false,
          "result": "failed",
          "message": "連線失敗：API Key 無效或權限不足。",
          "tested_at": "2025-10-02T12:31:00Z"
        }
        ```

**需求與規格定義**
- **USR-PLATFORM-GRAFANA-001**: 作為平台管理員，我需要能夠設定與 Grafana 的整合，以便在平台內管理和檢視 Grafana 儀表板。
- **SPEC-PLATFORM-GRAFANA-001.1**: 系統必須提供一個表單，讓使用者可以輸入 Grafana URL、API Key 和 Org ID。
- **SPEC-PLATFORM-GRAFANA-001.2**: 系統必須提供一個開關，讓使用者可以啟用或停用此整合。
- **SPEC-PLATFORM-GRAFANA-001.3**: API Key 欄位必須預設為密碼遮蔽，並提供一個可切換可見性的按鈕。
- **USR-PLATFORM-GRAFANA-002**: 在儲存設定前，我希望能先測試連線是否成功。
- **SPEC-PLATFORM-GRAFANA-002.1**: 系統必須提供一個「測試連線」按鈕，觸發 `POST /api/v1/settings/grafana/test` API。
- **SPEC-PLATFORM-GRAFANA-002.2**: 測試結果（包括成功訊息、失敗訊息、偵測到的版本）必須在畫面上清晰地展示給使用者。
- **USR-PLATFORM-GRAFANA-003**: 我需要能夠儲存我的 Grafana 設定。
- **SPEC-PLATFORM-GRAFANA-003.1**: 系統必須提供一個「儲存變更」按鈕，觸發 `PUT /api/v1/settings/grafana` 來保存設定。
- **SPEC-PLATFORM-GRAFANA-003.2**: 儲存成功後，應重新載入設定，確保 API Key 在畫面上恢復為遮蔽狀態。

### `platform-identity-settings.png`

**現況描述**
- 此頁面用於顯示平台當前的 OIDC (OpenID Connect) 身份驗證設定。
- 所有欄位均為**唯讀**，無法直接在此頁面進行修改。
- 頁面頂部有一個醒目的警告框，提示使用者此為敏感配置，不當修改可能導致無法登入。
- 顯示的欄位包含：啟用狀態、提供商、領域/網域、Client ID、客戶端密鑰（已遮蔽）以及各個 OIDC 端點 URL。
- 頁面上沒有任何「儲存」或「編輯」按鈕。

**互動流程**
1.  **載入頁面**：
    -   使用者進入頁面時，系統會自動發送請求，獲取目前的身份驗證設定並顯示在唯讀的表單中。
    -   所有欄位皆不可編輯。

**API 與資料流**
1.  **取得身份驗證設定**
    -   **API**: `GET /api/v1/settings/auth`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: `AuthSettings` 物件。
        ```json
        {
          "provider": "keycloak",
          "enabled": true,
          "client_id": "sre-platform-client",
          "client_secret": "...", // 後端應回傳已遮蔽或不回傳此欄位
          "realm": "sre",
          "auth_url": "...",
          "token_url": "...",
          "user_info_url": "...",
          "idp_admin_url": "..." // IDP 管理後台 URL
        }
        ```

**需求與規格定義**
- **USR-PLATFORM-AUTH-001**: 作為平台管理員，我需要能夠檢視目前系統所使用的 OIDC 身份驗證設定，以便於問題排查和確認配置。
- **SPEC-PLATFORM-AUTH-001.1**: 系統必須提供一個唯讀頁面，用以展示從 `GET /api/v1/settings/auth` API 獲取的 OIDC 設定。
- **SPEC-PLATFORM-AUTH-001.2**: 所有設定欄位（包括啟用開關）在此頁面都必須是不可編輯的，以防止使用者誤操作。
- **SPEC-PLATFORM-AUTH-001.3**: 客戶端密鑰 (`client_secret`) 欄位必須始終以星號 ( `**********` ) 遮蔽，不應在前端顯示明文。
- **SPEC-PLATFORM-AUTH-001.4**: 頁面必須包含一個明確的警告訊息，告知使用者這些設定的敏感性，以及修改它們的潛在風險。
- **[NEEDS CLARIFICATION: 這些設定的實際修改方式是什麼？是透過後端設定檔、環境變數，還是有另一個未被發現的管理介面？規格應補充說明此設定的來源與管理方式。]`**

### `platform-layout-manager.png` & `platform-layout-edit-kpi-modal.png`

**現況描述**
- 此頁面用於管理平台內各個主要頁面頂部顯示的 KPI (Key Performance Indicator) 卡片。
- 主畫面是一個可折疊的列表 (Accordion)，每個項目代表一個可設定的頁面（例如 SREWarRoom, 事件, 資源等）。
- 展開一個項目後，會顯示該頁面「目前顯示的卡片」列表，以及最後更新的資訊。
- 每個項目都有一個「Edit」按鈕，點擊後會彈出一個雙欄選擇器 (Dual Listbox) 的編輯視窗。
- 編輯視窗左側為「可選欄位」，右側為「已顯示欄位」。

**互動流程**
1.  **載入頁面**：
    -   使用者進入頁面時，系統會自動載入所有頁面的佈局設定和所有可用的小工具 (Widgets) 定義。
2.  **檢視佈局**：
    -   使用者可以點擊任一頁面標題來展開或收合，以檢視其目前配置的 KPI 卡片。
3.  **編輯佈局**：
    -   使用者點擊任一頁面旁的「Edit」按鈕，開啟編輯視窗。
    -   在視窗中，使用者可以：
        -   從左側「可選欄位」點擊項目，將其新增至右側「已顯示欄位」。
        -   從右側「已顯示欄位」點擊項目，將其移回左側。
        -   使用右側項目旁的上下箭頭，調整卡片的顯示順序。
4.  **儲存變更**：
    -   使用者在編輯視窗中點擊「儲存」按鈕。
    -   系統會將**所有頁面**的完整佈局設定一次性發送到後端進行儲存。
    -   儲存成功後，視窗關閉，主畫面的列表會更新以反映變更。
5.  **取消變更**：
    -   使用者在編輯視窗中點擊「取消」或關閉按鈕，所有在該視窗中的變更都會被捨棄。

**API 與資料流**
1.  **取得所有頁面佈局**
    -   **API**: `GET /api/v1/settings/layouts`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: 一個物件，鍵為頁面名稱，值為該頁面的佈局設定。
        ```json
        {
          "SREWarRoom": {
            "widget_ids": ["sre_pending_incidents", "sre_in_progress"],
            "updated_at": "2025-09-24T10:30:00Z",
            "updated_by": "Admin User"
          },
          "事件": { ... }
        }
        ```
2.  **取得所有可用的小工具 (Widgets)**
    -   **API**: `GET /api/v1/settings/widgets`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: `LayoutWidget` 物件的陣列。
        ```json
        [
          {
            "id": "incident_pending_count",
            "name": "待處理事件",
            "description": "...",
            "supported_pages": ["事件"]
          },
          ...
        ]
        ```
3.  **更新所有頁面佈局**
    -   **API**: `PUT /api/v1/settings/layouts`
    -   **傳出參數 (Request Body)**: 與 `GET /api/v1/settings/layouts` 格式相同的完整佈局物件。
    -   **傳入資料 (Response)**: 更新後的完整佈局物件。

**需求與規格定義**
- **USR-PLATFORM-LAYOUT-001**: 作為平台管理員，我需要能夠自訂各個主要頁面頂部顯示的 KPI 卡片，以便快速掌握我最關心的指標。
- **SPEC-PLATFORM-LAYOUT-001.1**: 系統必須提供一個介面，列出所有可設定 KPI 卡片的頁面。
- **SPEC-PLATFORM-LAYOUT-001.2**: 對於每個頁面，使用者必須能夠檢視目前已選的 KPI 卡片及其順序。
- **USR-PLATFORM-LAYOUT-002**: 我需要能夠為每個頁面獨立新增、移除和排序 KPI 卡片。
- **SPEC-PLATFORM-LAYOUT-002.1**: 系統必須提供一個編輯介面 (Modal)，其中包含「可選欄位」和「已顯示欄位」兩個列表。
- **SPEC-PLATFORM-LAYOUT-002.2**: 「可選欄位」列表必須根據當前編輯的頁面進行過濾，只顯示該頁面支援的小工具。
- **SPEC-PLATFORM-LAYOUT-002.3**: 使用者必須能夠調整「已顯示欄位」中卡片的順序。
- **SPEC-PLATFORM-LAYOUT-002.4**: 儲存時，系統必須透過 `PUT /api/v1/settings/layouts` API 提交完整的佈局設定。

### `platform-license-page.png`

**現況描述**
- 此頁面為一個靜態資訊頁面，用於展示當前的軟體版本（社群版）並推廣商業版。
- 頁面內容包含版本標題、功能描述、商業版功能列表以及一個聯絡升級的郵件連結。
- 此頁面沒有任何表單或可供使用者設定的選項。

**互動流程**
1.  **載入頁面**：
    -   使用者點擊 "License" 頁籤後，系統會直接渲染靜態內容。
    -   頁面內容是預先定義好的，不涉及後端 API 呼叫來獲取頁面資料。
2.  **聯絡升級**：
    -   使用者點擊「聯絡我們以升級」連結。
    -   系統會觸發一個 `mailto:` 動作，開啟使用者本地的郵件客戶端，並預填好銷售團隊的郵件地址。

**API 與資料流**
- **頁面內容**:
    -   此頁面內容為靜態，不透過 API 獲取。
    -   所有文字內容定義在前端的 `ContentContext` 中，其資料來源為 `mock-server/db.ts` 內的 `PAGE_CONTENT.LICENSE_PAGE` 物件。
- **頁籤可見性**:
    -   **API**: `GET /api/v1/ui/tabs`
    -   **說明**: License 頁籤是否可見（或是否被禁用）是由後端根據平台版本（例如 `SRE_PLATFORM_EDITION` 環境變數）決定的。在社群版中，此頁籤可能會被禁用。

**需求與規格定義**
- **USR-PLATFORM-LICENSE-001**: 作為平台使用者，我想了解我目前使用的版本資訊以及如何升級到功能更完整的商業版。
- **SPEC-PLATFORM-LICENSE-001.1**: 系統必須提供一個靜態的 License 頁面，清楚地標示目前為「社群版」。
- **SPEC-PLATFORM-LICENSE-001.2**: 頁面必須條列商業版的主要功能，以吸引使用者升級。
- **SPEC-PLATFORM-LICENSE-001.3**: 頁面必須提供一個有效的聯絡方式（例如 `mailto:` 連結），方便使用者洽詢升級事宜。
- **SPEC-PLATFORM-LICENSE-002.1**: 此頁面的可見性應由後端配置控制。若為商業版，此頁面應顯示對應的商業授權資訊 `[NEEDS CLARIFICATION: 商業版的 License 頁面外觀與內容為何？需要提供對應的截圖與規格]`。

### `platform-tags-overview.png`

**現況描述**
- 此頁面為一個功能完整的標籤治理 (Tag Governance) 介面，用於定義全平台可用的標籤。
- 頁面頂部有針對平台管理員的警告訊息。
- 工具列提供搜尋、匯入、匯出、欄位設定和新增標籤等功能。
- 標籤以表格形式呈現，欄位包含：標籤鍵、說明、預設標籤值、是否必填、可寫入角色以及操作按鈕。
- 表格支援多選和批次操作。
- 系統標籤（如 `env`）旁有鎖頭圖示，且其操作按鈕為禁用狀態。

**互動流程**
1.  **載入頁面**：
    -   系統載入第一頁的標籤定義列表。
2.  **新增/編輯標籤**：
    -   點擊「新增標籤」或任一標籤的「編輯」按鈕，會彈出一個表單視窗。
    -   使用者可以在此視窗中定義或修改標籤的鍵、說明、適用範圍、是否必填、可寫入角色等屬性。
3.  **管理標籤值**：
    -   點擊「管理標籤值」按鈕（列表圖示），會彈出一個專門的視窗，讓使用者可以新增/刪除此標籤的預定義值（Enum）。
4.  **刪除標籤**：
    -   點擊單一標籤的「刪除」按鈕，會彈出確認視窗。
    -   勾選多個標籤後，點擊工具列的「刪除」按鈕，可進行批次刪除。
    -   系統保留的標籤（有鎖頭圖示）不可被刪除。
5.  **搜尋與篩選**：
    -   點擊「搜索和篩選」按鈕，彈出搜尋視窗，可依關鍵字、適用範圍等條件過濾標籤列表。
6.  **匯入/匯出**：
    -   點擊「匯出」會將當前篩選結果下載為 CSV 檔案。
    -   點擊「匯入」會彈出視窗，引導使用者上傳 CSV 檔案以批次建立標籤。
7.  **欄位設定**：
    -   點擊「欄位設定」，使用者可以自訂表格要顯示哪些欄位。

**API 與資料流**
1.  **取得標籤定義列表**
    -   **API**: `GET /api/v1/settings/tags`
    -   **傳出參數**: `page`, `page_size`, 以及其他篩選條件。
    -   **傳入資料 (Response)**: `{ items: TagDefinition[], total: number }`
2.  **新增標籤定義**
    -   **API**: `POST /api/v1/settings/tags`
    -   **傳出參數 (Request Body)**: `Partial<TagDefinition>` 物件。
3.  **更新標籤定義**
    -   **API**: `PATCH /api/v1/settings/tags/{id}`
    -   **傳出參數 (Request Body)**: `Partial<TagDefinition>` 物件。
4.  **刪除標籤定義**
    -   **API**: `DELETE /api/v1/settings/tags/{id}`
5.  **更新標籤的允許值**
    -   **API**: `PUT /api/v1/settings/tags/{id}/values`
    -   **傳出參數 (Request Body)**: `TagValue[]` (e.g., `[{value: "v1", label: "V1"}, ...]`)
6.  **批次匯入標籤**
    -   **API**: `POST /api/v1/settings/tags/import`
    -   **傳出參數 (Request Body)**: `FormData` 包含 CSV 檔案。
7.  **取得/更新欄位顯示設定**
    -   **API**: `GET / PUT /api/v1/settings/column-config/{pageKey}`

**需求與規格定義**
- **USR-PLATFORM-TAG-001**: 作為平台管理員，我需要一個中央介面來定義和管理全平台的標籤，以確保標籤的一致性和標準化。
- **SPEC-PLATFORM-TAG-001.1**: 系統必須提供一個表格來展示所有已定義的標籤，包含其鍵、說明、預設值、必填狀態和權限等核心屬性。
- **SPEC-PLATFORM-TAG-001.2**: 系統必須支援對標籤定義的完整 CRUD（建立、讀取、更新、刪除）操作。
- **SPEC-PLATFORM-TAG-001.3**: 系統必須能夠區分「系統標籤」和「使用者自訂標籤」，系統標籤應為唯讀或不可刪除。
- **USR-PLATFORM-TAG-002**: 對於某些標籤，我希望能預先定義好固定的可選值（Enum），以限制使用者只能從中選擇。
- **SPEC-PLATFORM-TAG-002.1**: 系統必須提供一個獨立的介面，用於管理特定標籤的「允許值」列表。
- **USR-PLATFORM-TAG-003**: 我需要能夠批次管理標籤，例如批次刪除或透過 CSV 檔案匯入/匯出。
- **SPEC-PLATFORM-TAG-003.1**: 表格必須支援多選功能。
- **SPEC-PLATFORM-TAG-003.2**: 系統必須提供批次刪除功能。
- **SPEC-PLATFORM-TAG-003.3**: 系統必須提供匯出為 CSV 和從 CSV 匯入的功能。
- **USR-PLATFORM-TAG-004**: 我希望能自訂表格的欄位，只看我關心的資訊。
- **SPEC-PLATFORM-TAG-004.1**: 系統必須提供一個「欄位設定」功能，讓使用者可以自訂表格的顯示欄位，且此設定需要被保存。