# Feature Specification: 人員管理 (Identity Personnel)

**Feature Branch**: `[identity-personnel-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/identity-spec-pages.md` → ``identity-users-list.png``、 `docs/specs/identity-spec-pages.md` → ``identity-invite-member-modal.png``、 `docs/specs/identity-spec-pages.md` → ``identity-edit-member-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/identity-personnel-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `identity-users-list.png`

**現況描述**
- **頁面標題**: 身份與存取，統一管理身份認證、存取權限和組織架構。
- **KPI 指標卡**:
    - **使用者總數**: 顯示目前系統內的總用戶數 (例如 124)。
    - **活躍使用者**: 顯示處於活躍狀態的用戶數 (例如 98) 及活躍比例。
    - **登入失敗 (24H)**: 顯示過去 24 小時內，來自不同 IP 的登入失敗次數。
- **頁籤導覽**:
    - 人員管理 (預設選中)
    - 團隊管理
    - 角色管理
    - 審計日誌
- **工具列**:
    - **左側**: 搜尋和篩選按鈕。
    - **右側**: 匯入、匯出、欄位設定、邀請人員 (主按鈕)。
    - **批次操作 (勾選後出現)**: 停用、刪除。
- **使用者列表**:
    - 以表格形式呈現，包含欄位：名稱 (含頭像與 Email)、角色、團隊、狀態、上次登入、操作。
    - **狀態**: 使用不同顏色的標籤 (Pill) 標示，例如 `Active` (綠色)、`Inactive` (灰色)、`Invited` (黃色)。
    - **操作**: 每行提供「編輯」和「刪除」按鈕。
- **列表功能**:
    - 支援複選框進行多選。
    - 底部提供分頁控制。

**互動流程**
- **邀請人員**:
    - 使用者點擊右上角的「邀請人員」按鈕。
    - 系統彈出 `identity-invite-member-modal.png` 視窗。
- **編輯人員**:
    - 使用者點擊任一列的「編輯」圖示按鈕。
    - 系統彈出 `identity-edit-member-modal.png` 視窗，並載入該人員的現有資料。
- **刪除人員**:
    - 使用者點擊任一列的「刪除」圖示按鈕。
    - 系統彈出確認對話框，詢問「您確定要刪除使用者 [使用者名稱] 嗎？此操作無法復原。」
    - 確認後，該使用者被刪除，列表自動更新。
- **批次操作**:
    - 使用者勾選列表中的一個或多個項目。
    - 工具列出現「已選取 [N] 個項目」以及「停用」、「刪除」等批次操作按鈕。
    - 點擊批次操作按鈕，系統將對所有選中項目執行該操作。
- **搜尋與篩選**:
    - 使用者點擊「搜尋和篩選」按鈕。
    - 系統彈出 `UnifiedSearchModal` 視窗，提供基於多個條件的搜尋功能。
    - **實現細節**: 目前僅支援關鍵字過濾；清除篩選會將頁碼重置至第一頁 【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L361-L371】【F:components/UnifiedSearchModal.tsx†L317-L358】
- **分頁**:
    - 使用者可以點擊分頁元件來切換頁碼或調整每頁顯示的項目數量。
- **編輯人員**:
    - **實現細節**: 顯示不可變更的電子郵件與姓名欄位，並允許調整角色、團隊與狀態；儲存後觸發 API 更新並關閉模態 【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L317-L329】【F:components/UserEditModal.tsx†L16-L101】
- **邀請人員**:
    - **實現細節**: 必填電子郵件與角色，提交後會重置表單欄位；若缺少必填欄位則不送出 【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L120-L131】【F:components/InviteUserModal.tsx†L21-L117】

### `identity-invite-member-modal.png`

**現況描述**
- **標題**: 邀請新成員
- **表單欄位**:
    - **電子郵件**: 文字輸入框，必填。
    - **姓名 (選填)**: 文字輸入框，可選。
    - **角色**: 下拉選單，必選。
    - **團隊**: 下拉選單，必選。
- **按鈕**:
    - **取消**: 關閉視窗。
    - **發送邀請**: 提交表單。

**互動流程**
- 使用者在「電子郵件」欄位輸入被邀請者的 Email。
- 使用者可選擇性填寫「姓名」。
- 使用者從「角色」和「團隊」下拉選單中選擇對應的選項。
- **驗證**:
    - 「電子郵件」為必填項，格式需符合 Email 規則。
    - 「角色」和「團隊」為必選項。
    - 若未填寫必填項，點擊「發送邀請」時應提示錯誤。
- 點擊「發送邀請」按鈕，若驗證通過，則提交邀請並關閉視窗。

### `identity-edit-member-modal.png`

**現況描述**
- **標題**: 編輯成員: [Admin User]
- **表單欄位**:
    - **電子郵件**: 文字輸入框，唯讀 (disabled)。
    - **姓名**: 文字輸入框，唯讀。
    - **角色**: 下拉選單，可編輯。
    - **團隊**: 下拉選單，可編輯。
    - **狀態**: 下拉選單，可編輯。
- **按鈕**:
    - **取消**: 關閉視窗，不儲存任何變更。
    - **儲存變更**: 提交表單。

**互動流程**
- 視窗打開時，表單會自動填入該使用者的現有資料。
- 使用者可以修改「角色」、「團隊」和「狀態」欄位。
- 「電子郵件」和「姓名」為顯示資訊，不可在此修改。
- 點擊「儲存變更」按鈕，提交修改。
- 點擊「取消」按鈕，放棄所有變更並關閉視窗。

## Requirements *(mandatory)*
**API 與資料流**
- **載入使用者列表**:
    - **API**: `GET /api/v1/iam/users`
    - **傳入參數**:
        - `page`: 當前頁碼 (例如 `1`)
        - `page_size`: 每頁數量 (例如 `10`)
        - `filters`: (可選) 篩選條件物件
    - **傳出資料**: `{ "items": User[], "total": number }`
    - **流程**: 頁面載入時，呼叫此 API 獲取第一頁的使用者資料並渲染列表。
    - **實現細節**: 同時呼叫 `GET /api/v1/settings/column-config/{pageKey}` 與 `GET /api/v1/pages/columns/{pageKey}` 取得欄位定義與個人化設定 【F:pages/settings/identity-access/PersonnelManagementPage.tsx†L52-L90】【F:mock-server/handlers.ts†L2680-L2703】
- **刪除使用者**:
    - **API**: `DELETE /api/v1/iam/users/:id`
    - **傳入參數**: `id` (使用者 ID)
    - **流程**: 使用者確認刪除後，呼叫此 API，成功後重新整理列表。
- **批次刪除使用者**:
    - **API**: `POST /api/v1/iam/users/batch-actions`
    - **傳入參數**: `{ "action": "delete", "ids": string[] }`
    - **流程**: 使用者執行批次刪除後，呼叫此 API，成功後重新整理列表。

**需求與規格定義**
- **需求 1**: 系統必須以分頁列表形式，展示所有使用者帳號。
- **規格 1.1**: 列表應預設顯示使用者頭像、名稱、Email、角色、團隊、狀態、上次登入時間。
- **規格 1.2**: 使用者狀態（如：活躍、停用、已邀請）需使用不同顏色的標籤清晰標示。
- **需求 2**: 使用者應能夠邀請新成員加入系統。
- **規格 2.1**: 需提供「邀請人員」按鈕，點擊後開啟邀請表單。
- **需求 3**: 使用者應能夠編輯現有成員的資訊。
- **規格 3.1**: 每位成員旁需有「編輯」按鈕，點擊後開啟編輯表單。
- **需求 4**: 使用者應能夠刪除成員。
- **規格 4.1**: 每位成員旁需有「刪除」按鈕。
- **規格 4.2**: 刪除操作前，必須有警告提示與二次確認步驟。
- **需求 5**: 系統應支援對使用者進行批次操作。
- **規格 5.1**: 列表需支援多選功能。
- **規格 5.2**: 當至少選擇一項時，應顯示批次操作選項，至少包含批次刪除。

---

**API 與資料流**
- **發送邀請**:
    - **API**: `POST /api/v1/iam/users`
    - **傳入參數**: `{ "email": "user@example.com", "name": "使用者全名", "role": "Admin", "team": "SRE Platform" }`
    - **流程**:
        1. 使用者填寫完表單並點擊「發送邀請」。
        2. 前端呼叫 API，將表單資料作為 payload 送出。
        3. API 成功回應後 (HTTP 201)，關閉此 modal。
        4. 父頁面 (`PersonnelManagementPage`) 重新呼叫 `GET /api/v1/iam/users` 以更新使用者列表，新邀請的使用者狀態應為「Invited」。

**需求與規格定義**
- **需求 1**: 系統必須提供一個表單，讓管理者可以透過 Email 邀請新成員。
- **規格 1.1**: 表單必須包含電子郵件、姓名、角色和團隊欄位。
- **規格 1.2**: 電子郵件為必填項，且後端需驗證其唯一性。
- **規格 1.3**: 姓名為選填項。
- **規格 1.4**: 角色和團隊為必選項，其選項應來自系統已有的角色和團隊列表。
- **需求 2**: 邀請成功後，系統應給予明確回饋。
- **規格 2.1**: 成功發送邀請後，邀請視窗應自動關閉。
- **規格 2.2**: 使用者列表應自動刷新，並顯示剛被邀請的使用者，其狀態為「已邀請」。

---

**API 與資料流**
- **儲存變更**:
    - **API**: `PATCH /api/v1/iam/users/:id`
    - **傳入參數**:
        - `id`: 使用者 ID
        - **Payload**: `{ "role": "New Role", "team": "New Team", "status": "Active" }`
    - **流程**:
        1. 使用者修改資料後點擊「儲存變更」。
        2. 前端呼叫 API，將修改後的資料作為 payload 送出。
        3. API 成功回應後 (HTTP 200)，關閉此 modal。
        4. 父頁面 (`PersonnelManagementPage`) 重新整理使用者列表，以顯示更新後的資料。

**需求與規格定義**
- **需求 1**: 系統必須允許管理者編輯現有成員的資訊。
- **規格 1.1**: 編輯表單應包含使用者的角色、團隊和狀態。
- **規格 1.2**: 為確保帳號一致性，使用者的電子郵件和姓名在此介面中應為唯讀。
- **規格 1.3**: 角色、團隊和狀態的選項應來自系統設定。
- **需求 2**: 儲存成功後，變更應立即生效。
- **規格 2.1**: 成功儲存後，編輯視窗應自動關閉。
- **規格 2.2**: 使用者列表應自動刷新，以反映最新的使用者資訊。
- **[NEEDS CLARIFICATION: 需補充說明的問題]**: 更改使用者狀態（例如從「活躍」到「停用」）是否應觸發其他系統行為，例如立即終止其 session？

---

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 需補充說明的問題

## Source Evidence
- ### `identity-users-list.png` （來源：`docs/specs/identity-spec-pages.md`）
- ### `identity-invite-member-modal.png` （來源：`docs/specs/identity-spec-pages.md`）
- ### `identity-edit-member-modal.png` （來源：`docs/specs/identity-spec-pages.md`）

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

