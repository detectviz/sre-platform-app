# Feature Specification: 角色管理 (Identity Roles)

**Feature Branch**: `[identity-role-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/identity-spec-pages.md` → ``identity-roles-list.png``、 `docs/specs/identity-spec-pages.md` → ``identity-edit-role-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/identity-role-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `identity-roles-list.png`

**現況描述**
- **頁面導覽**: 位於「身份與存取」下的「角色管理」頁籤。
- **工具列**:
    - **左側**: 搜尋和篩選按鈕。
    - **右側**: 欄位設定、新增角色 (主按鈕)。
- **角色列表**:
    - 以表格形式呈現，包含欄位：啟用 (開關)、角色名稱 (含描述)、使用者數量、創建時間、操作。
    - **啟用/停用**: 提供一個 Toggle Switch，可直接在列表上快速啟用或停用該角色。
    - **操作**: 每行提供「編輯」和「刪除」按鈕。
- **列表功能**:
    - 支援複選框進行多選。
    - 底部提供分頁控制。

**互動流程**
- **新增角色**:
    - 使用者點擊右上角的「新增角色」按鈕。
    - 系統彈出 `identity-edit-role-modal.png` 視窗 (標題為「新增角色」)。
- **編輯角色**:
    - 使用者點擊任一列的「編輯」圖示按鈕。
    - 系統彈出 `identity-edit-role-modal.png` 視窗，並載入該角色的現有資料。
- **刪除角色**:
    - 使用者點擊任一列的「刪除」圖示按鈕。
    - 系統彈出確認對話框，詢問「您確定要刪除角色 [角色名稱] 嗎？擁有此角色的使用者將失去相關權限。」
    - 確認後，該角色被刪除，列表自動更新。
- **啟用/停用角色**:
    - 使用者點擊「啟用」欄位下的開關。
    - 系統立即更新該角色的狀態，無需進入編輯頁面。
    - `handleToggleEnabled` 函式觸發 `PATCH /api/v1/iam/roles/:id` 來更新狀態。

### `identity-edit-role-modal.png`

**現況描述**
- **標題**: 編輯角色 (新增時為「新增角色」)
- **表單欄位**:
    - **角色名稱**: 文字輸入框，必填。
    - **描述**: 多行文字輸入框。
- **權限設定**:
    - 以功能模組 (如 Incidents, Resources) 進行分組。
    - 每個模組可展開，顯示具體的權限項目 (如 全選、讀取、建立、更新、刪除)。
    - 使用核取方塊 (Checkbox) 進行權限的勾選。
- **按鈕**:
    - **取消**: 關閉視窗。
    - **儲存**: 提交變更。

**互動流程**
- **設定權限**:
    - 使用者可以展開任一功能模組。
    - 勾選「全選」會自動選取該模組下的所有權限。
    - 可單獨勾選或取消勾選「讀取」、「建立」、「更新」、「刪除」等權限。
- **儲存**:
    - 點擊「儲存」按鈕，若驗證通過，則提交變更並關閉視窗。
    - **驗證**: 「角色名稱」為必填項。

## Requirements *(mandatory)*
**API 與資料流**
- **載入角色列表**:
    - **API**: `GET /api/v1/iam/roles`
    - **傳入參數**:
        - `page`: 當前頁碼
        - `page_size`: 每頁數量
        - `filters`: (可選) 篩選條件
    - **傳出資料**: `{ "items": Role[], "total": number }`
    - **流程**: 頁面載入時，呼叫此 API 獲取角色資料並渲染列表。
- **刪除角色**:
    - **API**: `DELETE /api/v1/iam/roles/:id`
    - **傳入參數**: `id` (角色 ID)
    - **流程**: 使用者確認刪除後，呼叫此 API，成功後重新整理列表。
- **更新角色啟用狀態**:
    - **API**: `PATCH /api/v1/iam/roles/:id`
    - **傳入參數**: `{ "enabled": boolean }`
    - **流程**: 使用者點擊啟用開關時，呼叫此 API 更新狀態，成功後刷新列表。

**需求與規格定義**
- **需求 1**: 系統必須以列表形式，展示所有可用的角色。
- **規格 1.1**: 列表應顯示角色名稱、描述、使用者計數和創建時間。
- **規格 1.2**: 必須提供快速啟用/停用角色的功能，例如使用開關 (Toggle Switch)。
- **需求 2**: 使用者應能夠新增自訂角色。
- **規格 2.1**: 需提供「新增角色」按鈕，點擊後開啟角色建立表單。
- **需求 3**: 使用者應能夠編輯現有角色的權限。
- **規格 3.1**: 每個角色旁需有「編輯」按鈕，點擊後開啟權限編輯介面。
- **需求 4**: 使用者應能夠刪除角色。
- **規格 4.1**: 每個角色旁需有「刪除」按鈕。
- **規格 4.2**: 刪除操作前，必須有警告提示與二次確認步驟。
- **規格 4.3**: 系統內建的預設角色 (如 Administrator) 可能不允許被刪除或編輯。 `[NEEDS CLARIFICATION: 需確認哪些角色是系統保留，不可操作的]`

---

**API 與資料流**
- **載入權限定義**:
    - **API**: `[NEEDS CLARIFICATION: 未在程式碼中明確找到，推測為 GET /api/v1/iam/permissions 或類似端點]`
    - **流程**: 為了渲染權限設定樹，Modal 需要獲取所有可用的權限項定義。
- **新增角色**:
    - **API**: `POST /api/v1/iam/roles`
    - **傳入參數**: `{ "name": string, "description": string, "permissions": { [resource: string]: string[] } }`
    - **流程**: 點擊儲存後，呼叫此 API 建立新角色，成功後關閉視窗並刷新角色列表。
- **更新角色**:
    - **API**: `PATCH /api/v1/iam/roles/:id`
    - **傳入參數**: 同上。
    - **流程**: 點擊儲存後，呼叫此 API 更新角色，成功後關閉視窗並刷新角色列表。

**需求與規格定義**
- **需求 1**: 系統必須提供一個表單，讓管理者可以定義角色的名稱、描述與權限。
- **規格 1.1**: 角色名稱為必填項。
- **需求 2**: 權限設定必須以功能模組分組，提供清晰的層級結構。
- **規格 2.1**: 每個功能模組下應提供細分的權限選項（例如 CRUD - Create, Read, Update, Delete）。
- **規格 2.2**: 應提供「全選」功能，方便管理者快速授予某個模組的所有權限。
- **[NEEDS CLARIFICATION: 需補充說明的問題]**: 權限之間的依賴關係為何？例如，是否必須先有「讀取」權限才能勾選「更新」或「刪除」？

---

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 需確認哪些角色是系統保留，不可操作的
- [NEEDS CLARIFICATION] 未在程式碼中明確找到，推測為 GET /api/v1/iam/permissions 或類似端點
- [NEEDS CLARIFICATION] 需補充說明的問題

## Source Evidence
- ### `identity-roles-list.png` （來源：`docs/specs/identity-spec-pages.md`）
- ### `identity-edit-role-modal.png` （來源：`docs/specs/identity-spec-pages.md`）

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

