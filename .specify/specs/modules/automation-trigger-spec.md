# Feature Specification: 自動化觸發器 (Automation Triggers)

**Feature Branch**: `[automation-trigger-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/automation-spec-pages.md` → ``automation-triggers-list.png``、 `docs/specs/automation-spec-pages.md` → ``automation-edit-trigger-event.png` / `automation-edit-trigger-schedule.png` / `automation-edit-trigger-webhook.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/automation-trigger-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `automation-triggers-list.png`

**現況描述**
- 此頁面為「自動化觸發器」列表，以表格形式呈現所有已設定的觸發器。
- 介面包含一個工具列和觸發器列表。
- 工具列提供「搜尋和篩選」、「欄位設定」和「新增觸發器」功能。
- 表格支援多選，選擇後會顯示批次操作工具列，提供「啟用」、「停用」和「刪除」功能。
- 列表欄位包含：啟用狀態 (開關)、名稱、類型、目標腳本、上次觸發時間及操作。
- 「類型」欄位根據其值（排程、Webhook、事件）顯示不同顏色的藥丸 (Pill) 樣式。

**互動流程**
- **新增觸發器**: 使用者點擊「新增觸發器」按鈕，應彈出「新增觸發器」互動視窗 (對應 `automation-edit-trigger-*.png`)。
- **編輯觸發器**: 使用者點擊任一觸發器右側的「編輯」圖示按鈕，應彈出對應的「編輯觸發器」互動視窗，並預先填入該觸發器的資料。
- **啟用/停用**: 使用者可直接點擊列表中的「啟用」開關，快速切換該觸發器的狀態。
- **刪除觸發器**: 使用者點擊單一觸發器的「刪除」圖示按鈕，應彈出確認刪除的提示視窗。
- **批次操作**: 使用者勾選多個觸發器後，可點擊批次操作列上的按鈕，對所有選中項目進行啟用、停用或刪除。
- **搜尋與篩選**: 使用者點擊「搜尋和篩選」按鈕，應彈出互動視窗，允許使用者根據關鍵字、類型等條件過濾列表。

### `automation-edit-trigger-event.png` / `automation-edit-trigger-schedule.png` / `automation-edit-trigger-webhook.png`

**現況描述**
- 此為「新增/編輯觸發器」的互動視窗，它會根據使用者選擇的「觸發器類型」動態改變下方的設定區域。
- **通用欄位**: 名稱、描述、目標腳本、觸發器類型。
- **類型切換**: 使用者可以透過一個按鈕群組在「排程」、「Webhook」和「事件」三種類型間切換。
- **排程模式 (`-schedule.png`)**: 當類型為「排程」時，顯示一個用於輸入 Cron 表達式的欄位。
- **Webhook 模式 (`-webhook.png`)**: 當類型為「Webhook」時，顯示一個唯讀的 Webhook URL。URL 在儲存後由後端生成。
- **事件模式 (`-event.png`)**: 當類型為「事件」時，顯示一個條件編輯器，允許使用者設定一或多個觸發條件。

**互動流程**
- **類型切換**: 使用者點擊類型按鈕（例如從「排程」切換到「事件」），下方的設定區域會立即更新，顯示對應的表單欄位，並填入該類型的預設值。
- **設定排程**: 在排程模式下，使用者需要輸入一個有效的 Cron 表達式。
- **處理 Webhook**: 在 Webhook 模式下，URL 是唯讀的。使用者可以點擊旁邊的「複製」按鈕，將 URL 複製到剪貼簿。
- **設定事件條件**:
    - 在事件模式下，使用者可以點擊「新增條件」來增加一行條件規則。
    - 每行規則包含 `鍵`、`運算子` 和 `值`。
    - `鍵` 的下拉選單包含了所有可用的條件欄位（例如 `severity`, `tags` 等）。
    - `值` 的輸入框會根據所選的 `鍵` 變化：如果 `鍵` 有預定義的選項（如 `severity`），`值` 會變成一個下拉選單；否則為文字輸入框。
    - 使用者可以隨時移除任一條件。
- **儲存**: 使用者填寫完畢後點擊「儲存」，系統會根據當前選擇的類型，將 `config` 物件與其他通用欄位一起送出。

## Requirements *(mandatory)*
**API 與資料流**
- **載入頁面**:
  - `GET /api/v1/automation/triggers`: 獲取觸發器列表資料，支援分頁、排序和篩選。
    - **傳出參數**: `page`, `page_size`, `sort_by`, `sort_order`, `filters`
    - **傳入資料**: `items: AutomationTrigger[]`, `total: number`
  - `GET /api/v1/automation/scripts`: 獲取所有腳本，用於將 `target_playbook_id` 轉換為可讀的名稱。
- **更新觸發器狀態**:
  - `PATCH /api/v1/automation/triggers/{id}`: 當使用者切換啟用開關時呼叫。
    - **傳出參數**: `id` (觸發器 ID), `enabled: boolean`
    - **傳入資料**: 更新後的 `AutomationTrigger` 物件。
- **批次操作**:
  - `POST /api/v1/automation/triggers/batch-actions`: 進行批次啟用/停用/刪除。
    - **傳出參數**: `action: 'enable' | 'disable' | 'delete'`, `ids: string[]`
    - **傳入資料**: 成功或失敗的狀態訊息。
- **資料模型**: `AutomationTrigger`
  ```typescript
  // 自動化觸發器
  export interface AutomationTrigger {
    id: string;
    name: string;
    description: string;
    type: TriggerType; // 'schedule' | 'webhook' | 'event'
    enabled: boolean;
    target_playbook_id: string;
    retry_policy?: RetryPolicy;
    config: {
      cron?: string;
      cron_description?: string;
      webhook_url?: string;
      event_conditions?: string; // e.g., "severity = 'critical' AND tags.has_owner = 'true'"
    };
    last_triggered_at: string;
    creator: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
  }
  ```

**需求與規格定義**
- **需求 1: 集中管理所有觸發器**
  - **規格 1.1**: 系統必須提供一個頁面，以表格形式展示所有自動化觸發器。
  - **規格 1.2**: 使用者必須能直接在列表上快速啟用或停用一個觸發器。
  - **規格 1.3**: 系統需清楚標示每個觸發器的類型（排程、Webhook、事件）。
- **需求 2: 建立與維護觸發器**
  - **規格 2.1**: 系統必須提供「新增觸發器」的入口。
  - **規格 2.2**: 使用者應能在列表上直接「編輯」或「刪除」任一觸發器。
  - **規格 2.3**: 刪除操作需有二次確認。
- **需求 3: 高效率操作**
  - **規格 3.1**: 系統必須支援對觸發器進行批次啟用、停用和刪除。
  - **規格 3.2**: 系統必須提供強大的搜尋和篩選功能，幫助使用者在大量觸發器中快速定位目標。
---

**API 與資料流**
- **載入選項**:
  - `GET /api/v1/options`: 獲取 `automation_triggers` 的相關選項，包括類型、預設設定、條件鍵等。
  - `GET /api/v1/settings/tags`: 獲取標籤定義，用於「事件」模式下，當條件鍵為標籤時，動態生成值的下拉選單。
- **儲存觸發器 (新增)**:
  - `POST /api/v1/automation/triggers`: 當建立新觸發器時呼叫。
    - **傳出參數**: `Partial<AutomationTrigger>` (完整的表單資料，包括 `config` 物件)
    - **傳入資料**: 新建立的 `AutomationTrigger` 物件 (包含後端生成的 `webhook_url`)。
- **儲存觸發器 (更新)**:
  - `PATCH /api/v1/automation/triggers/{id}`: 當更新現有觸發器時呼叫。
    - **傳出參數**: `id`, `Partial<AutomationTrigger>`
    - **傳入資料**: 更新後的 `AutomationTrigger` 物件。
- **資料模型**: `AutomationTrigger['config']`
  - 此互動視窗的核心是動態建構 `config` 物件。
  - **排程**: `{ "cron": "0 * * * *" }`
  - **Webhook**: `{ "webhook_url": "https://.../..." }` (由後端生成)
  - **事件**: `{ "event_conditions": "severity = 'critical' AND tags.app = 'nginx'" }` (由前端條件編輯器序列化生成)

**需求與規格定義**
- **需求 1: 支援多種類型的觸發器設定**
  - **規格 1.1**: 系統必須在同一個編輯視窗中，提供對「排程」、「Webhook」、「事件」三種觸發器類型的設定支援。
  - **規格 1.2**: 介面必須根據使用者選擇的類型，動態且即時地顯示對應的設定欄位。
- **需求 2: 提供清晰的排程設定**
  - **規格 2.1**: 對於排程觸發器，系統必須提供一個欄位讓使用者輸入標準的 Cron 表達式。
  - **規格 2.2**: [NEEDS CLARIFICATION: 是否需要提供 Cron 表達式的語法提示或人類可讀的描述？]
- **需求 3: 提供安全的 Webhook 整合**
  - **規格 3.1**: 對於 Webhook 觸發器，其唯一的、不可預測的 URL 必須由後端生成，並在儲存後才顯示。
  - **規格 3.2**: 系統必須提供一個方便的「複製」按鈕，讓使用者能輕易地取得該 URL。
- **需求 4: 提供強大的事件驅動設定**
  - **規格 4.1**: 對於事件觸發器，系統必須提供一個條件編輯器，讓使用者可以定義一或多個觸發條件。
  - **規格 4.2**: 條件之間應為「AND」邏輯關係，即所有條件均滿足時才觸發。
  - **規格 4.3**: 條件編輯器應盡可能提供下拉選單來引導使用者輸入，減少錯誤。
---

## Outstanding Clarifications
- [NEEDS CLARIFICATION] 是否需要提供 Cron 表達式的語法提示或人類可讀的描述？

## Source Evidence
- ### `automation-triggers-list.png` （來源：`docs/specs/automation-spec-pages.md`）
- ### `automation-edit-trigger-event.png` / `automation-edit-trigger-schedule.png` / `automation-edit-trigger-webhook.png` （來源：`docs/specs/automation-spec-pages.md`）

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

