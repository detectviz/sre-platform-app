# Feature Specification: 個人資訊 (Profile Information)

**Feature Branch**: `[profile-info-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/profile-spec-pages.md` → ``profile-personal-info.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/profile-info-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `profile-personal-info.png`

**現況描述**
- 此頁面為「個人資訊」分頁，以唯讀形式展示當前登入使用者的基本資料。
- 顯示的欄位包含：名稱、電子郵件、角色、團隊、狀態。
- 頁面底部提供一個外部連結，引導使用者至身分驗證提供商（IdP）的管理介面（例如 Keycloak）進行更深入的管理。
- 頁面頂部有三個資訊卡，顯示「最近 7 日登入次數」、「上次密碼變更」和「MFA 狀態」，但這些資訊似乎來自父組件或佈局，而非此頁面本身邏輯。

**互動流程**
- **資料載入**：
  - 進入頁面時，系統會自動發出請求以獲取使用者資訊和驗證設定。
  - 載入期間應顯示一個載入中指示器。
  - 若資料獲取失敗，應顯示錯誤訊息。
- **查看資訊**：
  - 使用者只能查看頁面上顯示的所有個人資料，無法進行編輯。
- **外部管理**：
  - 使用者可以點擊「在 Keycloak 中管理」連結。
  - 點擊後，系統會在新的瀏覽器分頁中開啟 `idp_admin_url` 對應的網址。

## Requirements *(mandatory)*
**API 與資料流**
1.  **獲取使用者資訊**
    - **API**: `GET /api/v1/me`
    - **傳出參數**: 無
    - **傳入資料 (Response)**:
      ```json
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "UserRole", // 'admin' | 'sre' | 'developer' | 'viewer'
        "team": "string",
        "status": "UserStatus" // 'active' | 'invited' | 'inactive'
      }
      ```
    - **資料流**: 前端發送請求，後端回傳當前登入使用者的 `User` 物件，並將其顯示在對應的欄位中。

2.  **獲取驗證設定**
    - **API**: `GET /api/v1/settings/auth`
    - **傳出參數**: 無
    - **傳入資料 (Response)**:
      ```json
      {
        "provider": "string", // 'keycloak' | 'auth0' etc.
        "idp_admin_url": "string" // e.g., "https://idp.example.com/admin/realm/users"
      }
      ```
    - **資料流**: 前端發送請求，後端回傳 IdP 的設定。如果 `idp_admin_url` 存在，則顯示前往該 URL 的連結。

**需求與規格定義**
- **使用者需求**
  - **UR-01**: 作為一名使用者，我希望能查看我的基本個人資料，以確認我的帳號資訊是否正確。
  - **UR-02**: 作為一名使用者，如果我的帳號是透過外部系統（如 Keycloak）管理的，我希望能有一個快速連結前往該系統來管理我的帳號。
- **功能規格**
  - **FS-01**: 系統必須在「個人資訊」頁面載入時，自動從 `GET /api/v1/me` 獲取並顯示使用者的「名稱」、「電子郵件」、「角色」、「團隊」和「狀態」。
  - **FS-02**: 頁面上顯示的所有個人資料欄位均為唯讀，使用者不可直接在此頁面修改。
  - **FS-03**: 系統必須在頁面載入時，從 `GET /api/v1/settings/auth` 獲取驗證設定。
  - **FS-04**: 若 `GET /api/v1/settings/auth` 回傳的資料中包含 `idp_admin_url`，系統必須顯示一個連結，其文字為「在 [provider] 中管理」（例如「在 Keycloak 中管理」）。
  - **FS-05**: 點擊該外部管理連結後，必須在新分頁中開啟 `idp_admin_url`。
  - **FS-06**: 若任一 API 請求失敗，系統必須顯示一個清晰的錯誤訊息，例如「無法獲取個人資訊或驗證設定」。

---

## Source Evidence
- ### `profile-personal-info.png` （來源：`docs/specs/profile-spec-pages.md`）

## Review & Acceptance Checklist
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness Checklist
- [x] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

