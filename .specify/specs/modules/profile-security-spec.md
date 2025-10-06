# Feature Specification: 安全設定 (Profile Security)

**Feature Branch**: `[profile-security-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/profile-spec-pages.md` → ``profile-security-settings.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/profile-security-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `profile-security-settings.png`

**現況描述**
- 此頁面為「安全設定」分頁，提供兩項核心安全功能。
- **變更密碼**：一個表單，包含「舊密碼」、「新密碼」和「確認新密碼」三個輸入欄位，以及一個「更新密碼」按鈕。
- **最近登入活動**：一個表格，以分頁形式顯示使用者的登入歷史，欄位包含「時間」、「IP 位址」、「裝置」和「狀態」。

**互動流程**
- **變更密碼**：
  - 使用者在表單中輸入密碼。
  - 點擊「更新密碼」按鈕時，前端會進行驗證：
    - 所有欄位均不可為空。
    - 「新密碼」和「確認新密碼」必須一致。
    - 「新密碼」長度必須符合系統要求（例如，至少 6 個字元）。
  - 驗證通過後，系統會發出 `POST` 請求。
  - 請求期間，「更新密碼」按鈕應處於禁用狀態並顯示載入中動畫。
  - 成功後，應清空所有輸入欄位，並顯示成功提示，例如「密碼已成功更新」。
  - 失敗後（例如，舊密碼錯誤），應顯示從後端回傳的錯誤訊息。
- **查看登入歷史**：
  - 進入頁面時，系統會自動獲取第一頁的登入歷史。
  - 載入期間，表格應顯示載入中狀態。
  - 若獲取失敗，應顯示錯誤訊息及重試按鈕。
  - 使用者可以透過底部的分頁控制項來切換頁碼或調整每頁顯示的項目數量。

## Requirements *(mandatory)*
**API 與資料流**
1.  **變更密碼**
    - **API**: `POST /api/v1/me/change-password`
    - **傳出資料 (Request Body)**:
      ```json
      {
        "old_password": "string",
        "new_password": "string"
      }
      ```
    - **資料流**: 前端將使用者輸入的密碼傳送至後端進行驗證與更新。後端回傳成功或失敗狀態。

2.  **獲取登入歷史**
    - **API**: `GET /api/v1/me/login-history`
    - **傳出參數**: `page`, `page_size`
    - **傳入資料 (Response)**:
      ```json
      {
        "items": [
          {
            "id": "string",
            "timestamp": "string",
            "ip": "string",
            "device": "string",
            "status": "LoginStatus" // 'success' | 'failed'
          }
        ],
        "total": "number"
      }
      ```
    - **資料流**: 前端根據分頁狀態請求特定範圍的登入紀錄，後端回傳對應的資料列表及總數。

**需求與規格定義**
- **使用者需求**
  - **UR-08**: 作為一名使用者，我希望能變更我的登入密碼，以增強帳號安全性。
  - **UR-09**: 作為一名使用者，我希望能查看我最近的登入活動，以監控是否有未經授權的存取。
- **功能規格**
  - **FS-13**: 系統必須提供一個表單讓使用者可以輸入舊密碼、新密碼和確認新密碼。
  - **FS-14**: 在提交密碼變更請求前，系統必須在前端驗證：a) 所有欄位都已填寫；b) 新密碼與確認密碼相符；c) 新密碼滿足最小長度要求。
  - **FS-15**: 驗證通過後，系統必須透過 `POST /api/v1/me/change-password` 提交更新。
  - **FS-16**: 系統必須透過 `GET /api/v1/me/login-history` 獲取登入歷史，並以分頁表格的形式顯示。
  - **FS-17**: 登入歷史表格必須包含「時間」、「IP 位址」、「裝置」和「狀態」欄位。
  - **FS-18**: 登入狀態為 "success" 的紀錄應以綠色文字顯示，"failed" 則以紅色文字顯示，以提高可讀性。
  - **FS-19**: 系統必須提供分頁功能，允許使用者瀏覽所有登入歷史紀錄。
  - **FS-20**: 所有 API 操作後，都必須提供清晰的成功或失敗視覺回饋（Toast）。

## Source Evidence
- ### `profile-security-settings.png` （來源：`docs/specs/profile-spec-pages.md`）

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

