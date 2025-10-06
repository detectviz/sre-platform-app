# Feature Specification: 身份與驗證設定 (Platform Auth Settings)

**Feature Branch**: `[platform-auth-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/platform-spec-pages.md` → ``platform-identity-settings.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/platform-auth-spec.md`。

## User Scenarios & Testing *(mandatory)*
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

## Requirements *(mandatory)*
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

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 這些設定的實際修改方式是什麼？是透過後端設定檔、環境變數，還是有另一個未被發現的管理介面？規格應補充說明此設定的來源與管理方式。

## Source Evidence
- ### `platform-identity-settings.png` （來源：`docs/specs/platform-spec-pages.md`）

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

