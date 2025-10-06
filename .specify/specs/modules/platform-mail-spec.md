# Feature Specification: 郵件伺服器設定 (Platform Mail)

**Feature Branch**: `[platform-mail-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/platform-spec-pages.md` → ``platform-email-settings.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/platform-mail-spec.md`。

## User Scenarios & Testing *(mandatory)*
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

## Requirements *(mandatory)*
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

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 目前 API 未定義測試收件人地址，建議 API 增加 `recipient_email` 欄位

## Source Evidence
- ### `platform-email-settings.png` （來源：`docs/specs/platform-spec-pages.md`）

## Review & Acceptance Checklist
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness Checklist
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [ ] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

