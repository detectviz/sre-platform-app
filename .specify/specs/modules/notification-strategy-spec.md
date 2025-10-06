# Feature Specification: 通知策略 (Notification Strategies)

**Feature Branch**: `[notification-strategy-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/notifications-spec-pages.md` → ``notifications-strategies-list.png``、 `docs/specs/notifications-spec-pages.md` → ``notifications-strategy-step1.png`, `notifications-strategy-step2.png`, `notifications-strategy-step3.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/notification-strategy-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `notifications-strategies-list.png`

**現況描述**
- 此頁面為「通知策略」的管理中心，以表格形式展示所有已建立的通知策略。
- 頁面頂部有一個工具列，包含「搜尋與篩選」、「欄位設定」和「新增策略」按鈕。
- 表格支援多選功能，選取項目後，工具列會顯示批次操作按鈕，包括「啟用」、「停用」和「刪除」。
- 表格主要欄位包括：啟用狀態、策略名稱、觸發條件、管道數量、嚴重性等級、影響等級、建立者、更新時間。
- 「觸發條件」、「嚴重性等級」、「影響等級」等欄位會以標籤 (Tag) 或藥丸 (Pill) 的形式呈現，方便閱讀。
- 每一列末端都有「編輯」、「複製」和「刪除」的獨立操作按鈕。

**互動流程**
- **新增策略**：使用者點擊「新增策略」按鈕，會開啟一個多步驟的模態視窗 (Wizard) 來建立新策略。
- **編輯策略**：使用者點擊「編輯」圖示，會開啟同一個模態視窗，並載入該策略的現有設定以供修改。
- **複製策略**：使用者點擊「複製」圖示，會開啟新增策略的模態視窗，並自動填入被複製策略的資訊，策略名稱預設為 `Copy of [原名稱]`。
- **刪除策略**：使用者點擊「刪除」圖示，會跳出一個確認對話框。確認後，該策略將被刪除。
- **啟用/停用**：使用者可以直接點擊「啟用」欄位下的開關 (Toggle)，即時切換該策略的啟用狀態。
- **批次操作**：使用者可透過勾選核取方塊來選取多個策略，並執行批次的「啟用」、「停用」或「刪除」操作。
- **搜尋與篩選**：使用者點擊「搜尋與篩選」按鈕，可根據關鍵字等條件篩選策略列表。
- **欄位設定**：使用者點擊「欄位設定」，可以自訂表格中要顯示或隱藏的欄位。

### `notifications-strategy-step1.png`, `notifications-strategy-step2.png`, `notifications-strategy-step3.png`

**現況描述**
- 此為一個三步驟的精靈 (Wizard) 介面，用於新增或編輯通知策略。
- 介面頂部有步驟指示器，顯示目前所在的步驟：「基本資訊與範圍」、「通知管道」、「附加條件」。
- 介面底部有導覽按鈕：「上一步」、「下一步」和「完成」。

- **步驟 1: 基本資訊與範圍**
    - 欄位包含：策略名稱、涵蓋嚴重度、涵蓋影響範圍、資源群組。
    - 「涵蓋嚴重度」、「涵蓋影響範圍」、「資源群組」皆為多選下拉式選單。

- **步驟 2: 通知管道**
    - 欄位包含：接收團隊 (下拉選單)、通知管道 (可複選的列表)。
    - 系統會根據步驟 1 選擇的資源群組，自動建議一個「接收團隊」。

- **步驟 3: 附加條件**
    - 允許使用者定義更精細的觸發條件。
    - 使用者可以新增多個「標籤鍵 - 運算子 - 標籤值」的組合。
    - 所有附加條件之間以 `AND` 邏輯結合。

**互動流程**
- **導覽**：使用者點擊「下一步」和「上一步」按鈕在三個步驟之間切換。使用者也可以直接點擊頂部的步驟指示器來跳轉。
- **步驟 1**：
    1. 使用者輸入策略名稱。
    2. 使用者從下拉選單中勾選一或多個「嚴重度」、「影響範圍」和「資源群組」。
- **步驟 2**：
    1. 使用者從下拉選單選擇一個「接收團隊」。
    2. 使用者勾選一或多個要使用的「通知管道」。
- **步驟 3**：
    1. 使用者點擊「新增 AND 條件」來增加一列條件設定。
    2. 在每一列中，使用者從下拉選單選擇「標籤鍵」和「運算子 (`=`, `!=`, `~=`)」，並輸入或選擇「標籤值」。
    3. 使用者可以隨時移除任一條件列。
- **完成**：在最後一步，使用者點擊「完成」按鈕，系統會將所有步驟收集到的資訊組合起來，並儲存此策略。

## Requirements *(mandatory)*
**API 與資料流**
- **載入頁面**：
    - `GET /settings/notification-strategies`：向後端請求策略列表。可傳入篩選參數。
    - **回傳**：回傳一個包含 `items` (策略陣列) 和 `total` (總數) 的物件。每個策略物件的結構遵循 `NotificationStrategy` 型別。
- **切換啟用狀態**：
    - `PATCH /settings/notification-strategies/:id`：傳送一個僅包含 `enabled` 欄位的物件來更新狀態。
- **儲存 (新增/編輯/複製)**：
    - **新增/複製**：`POST /settings/notification-strategies`，Body 中包含完整的 `NotificationStrategy` 物件。
    - **編輯**：`PATCH /settings/notification-strategies/:id`，Body 中包含被修改的 `NotificationStrategy` 物件欄位。
- **刪除**：
    - `DELETE /settings/notification-strategies/:id`：刪除指定 ID 的策略。
- **批次操作**：
    - `POST /settings/notification-strategies/batch-actions`：
    - **傳入**：`{ action: 'enable' | 'disable' | 'delete', ids: string[] }`。

**需求與規格定義**
- **使用者需求**
    - 作為系統管理員，我需要能夠定義一組規則 (策略)，來決定「在什麼情況下」要「透過哪些管道」發送通知。
    - 我希望能方便地管理這些策略，包括建立、修改、複製和刪除。
    - 我希望能快速啟用或停用某個策略，以應對臨時情況。
    - 當策略很多時，我需要搜尋功能來快速定位。
- **功能規格**
    - **[R-NS-01]** 系統必須提供一個頁面，以表格形式展示所有已設定的通知策略。
    - **[R-NS-02]** 表格必須能清晰地展示策略的關鍵資訊，包括：啟用狀態、名稱、觸發條件、關聯的管道數等。
    - **[R-NS-03]** 系統必須提供「新增策略」功能。
    - **[R-NS-04]** 每一筆策略記錄都必須提供「編輯」、「複製」和「刪除」操作。
        - **[R-NS-04-01]** 刪除操作前，必須有再次確認的提示。
        - **[R-NS-04-02]** 複製操作應預填所有資訊，並提示使用者修改名稱。
    - **[R-NS-05]** 系統必須支援對單一策略的「啟用/停用」操作。
    - **[R-NS-06]** 系統必須支援對策略的批次「啟用」、「停用」及「刪除」操作。
    - **[R-NS-07]** 系統必須提供搜尋與篩選功能。
    - **[R-NS-08]** 系統必須允許使用者自訂表格顯示的欄位。

---

**API 與資料流**
- **載入精靈**：
    - `GET /resource-groups`：在步驟 1 載入資源群組選項。
    - `GET /iam/teams`：在步驟 2 載入接收團隊選項。
    - `GET /settings/notification-channels`：在步驟 2 載入通知管道列表。
    - `GET /ui/options` (透過 `useOptions` context)：獲取步驟 1 的嚴重性/影響等級選項，以及步驟 3 的標籤鍵/值選項。
- **儲存**：
    - `POST` (新增) 或 `PATCH` (編輯) `/settings/notification-strategies`
    - **組合 `trigger_condition`**：前端會將步驟 1 選擇的「資源群組」和步驟 3 設定的「附加條件」組合成一個字串，用 `AND` 連接。例如：`resource.group IN ("Group A", "Group B") AND tag.service = "core-api"`。
    - **傳入**：Body 中包含 `NotificationStrategy` 物件，其中 `trigger_condition` 為上述組合的字串，並包含 `name`, `severity_levels`, `impact_levels`, `channel_ids` 等欄位。

**需求與規格定義**
- **使用者需求**
    - 我希望能有一個引導式的流程來幫助我設定複雜的通知策略，避免遺漏重要設定。
    - 我希望能根據事件的嚴重性、影響範圍和發生的資源群組來觸發通知。
    - 我希望能進一步根據標籤 (Tag) 來過濾事件，讓觸發條件更精準。
    - 我希望能將通知發送給特定的團隊和指定的管道。
- **功能規格**
    - **[R-NS-09]** 系統必須提供一個多步驟的精靈介面來引導使用者建立/編輯通知策略。
    - **[R-NS-10]** **步驟 1 (基本資訊與範圍)** 必須包含以下設定：
        - **[R-NS-10-01]** 策略名稱 (必填)。
        - **[R-NS-10-02]** 涵蓋嚴重度 (多選，必填)。
        - **[R-NS-10-03]** 涵蓋影響範圍 (多選，必填)。
        - **[R-NS-10-04]** 資源群組 (多選，必填)。
    - **[R-NS-11]** **步驟 2 (通知管道)** 必須包含以下設定：
        - **[R-NS-11-01]** 接收團隊 (單選)。
        - **[R-NS-11-02]** 通知管道 (多選，必填)。
        - **[R-NS-11-03]** 系統應根據所選資源群組的負責團隊，提供智慧推薦。
    - **[R-NS-12]** **步驟 3 (附加條件)** 必須允許使用者新增一或多個以 `AND` 邏輯組合的標籤條件。
        - **[R-NS-12-01]** 每個條件由「標籤鍵」、「運算子」和「標籤值」組成。
    - **[R-NS-13]** 系統必須在使用者完成精靈後，將所有輸入轉換為一個 `NotificationStrategy` 物件發送至後端。

---

## Source Evidence
- ### `notifications-strategies-list.png` （來源：`docs/specs/notifications-spec-pages.md`）
- ### `notifications-strategy-step1.png`, `notifications-strategy-step2.png`, `notifications-strategy-step3.png` （來源：`docs/specs/notifications-spec-pages.md`）

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

