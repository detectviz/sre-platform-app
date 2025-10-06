# Feature Specification: 團隊管理 (Identity Teams)

**Feature Branch**: `[identity-team-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/identity-spec-pages.md` → ``identity-teams-list.png``、 `docs/specs/identity-spec-pages.md` → ``identity-edit-team-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/identity-team-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `identity-teams-list.png`

**現況描述**
- **頁面導覽**: 位於「身份與存取」下的「團隊管理」頁籤。
- **工具列**:
    - **左側**: 搜尋和篩選按鈕。
    - **右側**: 欄位設定、新增團隊 (主按鈕)。
    - **批次操作 (勾選後出現)**: 刪除。
- **團隊列表**:
    - 以表格形式呈現，包含欄位：團隊名稱、擁有者、成員數、創建時間、操作。
    - **操作**: 每行提供「編輯」和「刪除」按鈕。
- **列表功能**:
    - 支援複選框進行多選。
    - 底部提供分頁控制。

**互動流程**
- **新增團隊**:
    - 使用者點擊右上角的「新增團隊」按鈕。
    - 系統彈出 `identity-edit-team-modal.png` 視窗 (此處為共用視窗，標題為「新增團隊」)。
- **編輯團隊**:
    - 使用者點擊任一列的「編輯」圖示按鈕。
    - 系統彈出 `identity-edit-team-modal.png` 視窗，並載入該團隊的現有資料。
- **刪除團隊**:
    - 使用者點擊任一列的「刪除」圖示按鈕。
    - 系統彈出確認對話框，詢問「您確定要刪除團隊 [團隊名稱] 嗎？此操作無法復原，但不會刪除團隊內的成員。」
    - 確認後，該團隊被刪除，列表自動更新。
- **批次刪除**:
    - 使用者勾選列表中的一個或多個項目。
    - 工具列出現批次操作按鈕「刪除」。
    - 點擊按鈕後，系統將對所有選中項目執行刪除。

### `identity-edit-team-modal.png`

**現況描述**
- **標題**: 編輯團隊 (新增時標題為「新增團隊」)
- **表單欄位**:
    - **團隊名稱**: 文字輸入框，必填。
    - **擁有者**: 下拉選單，可從現有使用者中指派。
    - **描述**: 多行文字輸入框。
- **成員管理**:
    - **可用的用戶**: 顯示尚未加入此團隊的所有使用者列表。
    - **團隊成員**: 顯示已加入此團隊的使用者列表。
    - 透過左右箭頭按鈕，在兩個列表間移動使用者，以加入或移除成員。
- **按鈕**:
    - **取消**: 關閉視窗。
    - **儲存**: 提交變更。

**互動流程**
- **新增團隊**:
    - 使用者填寫「團隊名稱」，並可選填「描述」。
    - 使用者從「擁有者」下拉選單中選擇一位團隊擁有者。
    - 使用者可從「可用的用戶」列表中，將成員加入到「團隊成員」列表中。
- **編輯團隊**:
    - 視窗打開時，表單會自動填入該團隊的現有資料。
    - 使用者可以修改團隊名稱、擁有者、描述及成員列表。
- **新增/移除成員**:
    - 在「可用的用戶」列表中點擊一位使用者，該使用者會被移至「團隊成員」列表。
    - 在「團隊成員」列表中點擊一位使用者，該使用者會被移回「可用的用戶」列表。
- **儲存**:
    - 點擊「儲存」按鈕，若驗證通過，則提交變更並關閉視窗。
    - **驗證**: 「團隊名稱」為必填項。

## Requirements *(mandatory)*
**API 與資料流**
- **載入團隊列表**:
    - **API**: `GET /api/v1/iam/teams`
    - **傳入參數**:
        - `page`: 當前頁碼
        - `page_size`: 每頁數量
        - `filters`: (可選) 篩選條件
    - **傳出資料**: `{ "items": Team[], "total": number }`
    - **流程**: 頁面載入時，呼叫此 API 獲取團隊資料並渲染列表。同時，會非同步載入所有使用者資料 (`GET /api/v1/iam/users`)，用於顯示團隊擁有者名稱。
- **刪除團隊**:
    - **API**: `DELETE /api/v1/iam/teams/:id`
    - **傳入參數**: `id` (團隊 ID)
    - **流程**: 使用者確認刪除後，呼叫此 API，成功後重新整理列表。
- **批次刪除團隊**:
    - **API**: `POST /api/v1/iam/teams/batch-actions`
    - **傳入參數**: `{ "action": "delete", "ids": string[] }`

**需求與規格定義**
- **需求 1**: 系統必須以列表形式，展示所有團隊。
- **規格 1.1**: 列表應顯示團隊名稱、擁有者、成員數量和創建時間。
- **需求 2**: 使用者應能夠新增團隊。
- **規格 2.1**: 需提供「新增團隊」按鈕，點擊後開啟新增表單。
- **需求 3**: 使用者應能夠編輯現有團隊的資訊。
- **規格 3.1**: 每個團隊旁需有「編輯」按鈕，點擊後開啟編輯表單。
- **需求 4**: 使用者應能夠刪除團隊。
- **規格 4.1**: 每個團隊旁需有「刪除」按鈕。
- **規格 4.2**: 刪除操作前，必須有警告提示與二次確認步驟。
- **規格 4.3**: 刪除團隊的操作不應影響團隊內成員帳號本身的存在。

---

**API 與資料流**
- **載入初始資料**:
    - **API**: `GET /api/v1/iam/users`
    - **流程**: 為了填充「擁有者」下拉選單和「可用的用戶」列表，Modal 需要獲取所有使用者的資料。這通常在父層級 (`TeamManagementPage`) 就已獲取。
- **新增團隊**:
    - **API**: `POST /api/v1/iam/teams`
    - **傳入參數**: `{ "name": string, "owner_id": string, "description": string, "member_ids": string[] }`
    - **流程**: 點擊儲存後，呼叫此 API，成功後關閉視窗並刷新團隊列表。
- **更新團隊**:
    - **API**: `PATCH /api/v1/iam/teams/:id`
    - **傳入參數**: 同上。
    - **流程**: 點擊儲存後，呼叫此 API，成功後關閉視窗並刷新團隊列表。

**需求與規格定義**
- **需求 1**: 系統必須提供一個表單，讓管理者可以新增或編輯團隊。
- **規格 1.1**: 表單必須包含團隊名稱 (必填)、擁有者、描述和成員管理功能。
- **需求 2**: 管理者應能夠為團隊指派一位擁有者。
- **規格 2.1**: 擁有者必須從現有的系統使用者中選擇。
- **需求 3**: 管理者應能夠管理團隊的成員。
- **規格 3.1**: 介面需清楚劃分「團隊成員」與「非團隊成員」。
- **規格 3.2**: 需提供直觀的操作方式（如按鈕或拖放），讓管理者可以新增或移除團隊成員。
- **[NEEDS CLARIFICATION: 需補充說明的問題]**: 一位使用者是否可以同時屬於多個團隊？從目前的介面來看，似乎是支援的，但需要確認。

---

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 需補充說明的問題

## Source Evidence
- ### `identity-teams-list.png` （來源：`docs/specs/identity-spec-pages.md`）
- ### `identity-edit-team-modal.png` （來源：`docs/specs/identity-spec-pages.md`）

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

