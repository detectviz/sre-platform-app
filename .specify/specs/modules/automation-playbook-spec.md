# Feature Specification: 自動化劇本 (Automation Playbooks)

**Feature Branch**: `[automation-playbook-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/automation-spec-pages.md` → ``automation-scripts-list.png``、 `docs/specs/automation-spec-pages.md` → ``automation-edit-script-modal.png``、 `docs/specs/automation-spec-pages.md` → ``automation-ai-generate-script-modal.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/automation-playbook-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `automation-scripts-list.png`

**現況描述**
- 此頁面為「自動化腳本」列表，以表格形式呈現所有已建立的自動化腳本 (Playbook)。
- 主要介面包含一個工具列、腳本列表、以及每列的操作按鈕。
- 工具列提供「新增腳本」及「欄位設定」功能。
- 表格支援多選 (checkbox)，選擇項目後會顯示批次操作工具列，目前提供「刪除」功能。
- 列表欄位包含：腳本名稱/描述、觸發方式、上次執行狀態、上次執行時間、執行次數及操作。
- 「上次執行狀態」以不同顏色的藥丸 (Pill) 樣式呈現，例如成功 (綠)、失敗 (紅)、執行中 (藍)。

**互動流程**
- **新增腳本**: 使用者點擊「新增腳本」按鈕，應彈出「新增腳本」互動視窗 (對應 `automation-edit-script-modal.png`)。
- **編輯腳本**: 使用者點擊任一腳本右側的「編輯」圖示按鈕，應彈出對應的「編輯腳本」互動視窗，並預先填入該腳本的資料。
- **執行腳本**: 使用者點擊「運行」圖示按鈕，應彈出「執行腳本」確認視窗。
- **刪除腳本**: 
  - 使用者點擊單一腳本的「刪除」圖示按鈕，應彈出確認刪除的提示視窗。
  - 使用者勾選多個腳本後，點擊批次操作列的「刪除」按鈕，應能一次刪除所有選中的腳本。
- **欄位設定**: 使用者點擊「欄位設定」按鈕，應彈出互動視窗，允許使用者自訂表格顯示的欄位。
- **查看**: 腳本名稱下方會顯示該腳本的簡短描述。

### `automation-edit-script-modal.png`

**現況描述**
- 此為「新增/編輯自動化腳本」的互動視窗 (Modal)。
- 表單包含基本資訊（名稱、類型、描述）、腳本內容編輯區，以及一個可動態增減的參數設定區。
- 腳本內容區塊右上角有兩個輔助功能：「上傳腳本」和「AI 產生腳本」。
- 參數區允許使用者定義執行腳本時可傳入的變數，每個參數可設定名稱、標籤、類型（字串、數字、布林、枚舉）、是否必填、預設值等。

**互動流程**
- **開啟視窗**:
  - 點擊列表頁的「新增腳本」時，開啟此視窗，表單為空白。
  - 點擊列表項的「編輯」時，開啟此視窗，表單預先填入該腳本的現有資料。
- **填寫表單**: 使用者可以填寫或修改腳本的名稱、描述、類型和內容。
- **上傳腳本**: 使用者點擊「上傳腳本」，可從本機選擇檔案 (`.sh`, `.py` 等)。選擇後，檔案內容會自動填入「腳本內容」欄位，系統會嘗試根據副檔名更新「類型」欄位。
- **AI 產生腳本**: 使用者點擊「AI 產生腳本」，會開啟另一個互動視窗 (對應 `automation-ai-generate-script-modal.png`)。
- **管理參數**:
  - 使用者可點擊「新增參數」來增加一個新的參數列。
  - 對於每個參數，使用者可以輸入其屬性。
  - 如果參數類型為 `enum`，使用者可以動態新增/移除該枚舉的選項 (鍵值對)。
  - 使用者可隨時移除不需要的參數。
- **儲存**: 使用者點擊「儲存」，會將表單資料送出，關閉視窗並更新腳本列表。

### `automation-ai-generate-script-modal.png`

**現況描述**
- 此為「AI 產生腳本」功能的互動視窗，從「編輯腳本」視窗中觸發。
- 介面包含一個文字輸入框，讓使用者輸入需求 (Prompt)。
- 一個「產生」按鈕，用於觸發 AI 處理。
- 一個結果預覽區，用於顯示 AI 回傳的腳本類型、內容和解析出的參數。
- 一個「套用」按鈕，僅在成功產生結果後顯示。

**互動流程**
- **輸入需求**: 使用者在文字框中輸入想實現的自動化任務，例如「寫一個 python 腳本，檢查指定 URL 的 HTTP 狀態碼」。
- **產生腳本**: 使用者點擊「產生」按鈕，系統顯示載入中狀態，並向後端發送請求。
    - **實現細節**: 期間顯示 loading 狀態並清空上次結果 【F:components/GeneratePlaybookWithAIModal.tsx†L33-L116】
- **預覽結果**: 後端處理完畢後，在結果區顯示建議的腳本類型、腳本內容和參數。
    - **實現細節**: 結果區支援腳本類型、內容與參數列表，但目前僅以長文區塊呈現且高度依賴使用者自行捲動 【F:components/GeneratePlaybookWithAIModal.tsx†L75-L145】
- **套用結果**: 使用者檢視結果後，若滿意，可點擊「套用」。系統會將結果回填至「編輯腳本」視窗的對應欄位，並關閉此 AI 視窗。
    - **實現細節**: 套用時同步關閉視窗，並將資料傳遞至父層腳本編輯模態 【F:components/GeneratePlaybookWithAIModal.tsx†L86-L145】【F:components/AutomationPlaybookEditModal.tsx†L106-L112】
- **關閉**: 使用者可隨時點擊「取消」或關閉按鈕，放棄此次操作。

## Requirements *(mandatory)*
**API 與資料流**
- **載入頁面**:
  - `GET /api/v1/automation/scripts`: 獲取腳本列表資料。
    - **傳出參數**: (無)
    - **傳入資料**: `items: AutomationPlaybook[]`, `total: number`
- **刪除腳本**:
  - `DELETE /api/v1/automation/scripts/{id}`: 刪除指定的單一腳本。
    - **傳出參數**: `id` (腳本 ID)
    - **傳入資料**: 成功或失敗的狀態訊息。
- **批次刪除**:
  - `POST /api/v1/automation/scripts/batch-actions`: 進行批次操作。
    - **傳出參數**: `action: 'delete'`, `ids: string[]` (腳本 ID 列表)
    - **傳入資料**: 成功或失敗的狀態訊息。
- **資料模型**: `AutomationPlaybook`
  ```typescript
  // 自動化腳本 (Playbook) 的資料結構
  export interface AutomationPlaybook {
    id: string;                      // 唯一識別碼
    name: string;                    // 腳本名稱
    description: string;             // 腳本描述
    trigger: string;                 // 觸發方式的簡短描述 (例如 "手動")
    type: AutomationPlaybookType;    // 腳本類型 (shell, python 等)
    content: string;                 // 腳本內容
    last_run_at: string;             // 上次執行時間 (ISO 8601 格式)
    last_run_status: ExecutionStatus;// 上次執行狀態 (success, failed 等)
    run_count: number;               // 總執行次數
    created_at: string;              // 建立時間
    updated_at: string;              // 更新時間
    parameters?: ParameterDefinition[]; // 腳本參數定義
    deleted_at?: string;              // 軟刪除標記
  }
  ```

**需求與規格定義**
- **需求 1: 查看所有自動化腳本**
  - **規格 1.1**: 系統必須提供一個頁面，以表格形式展示所有未被軟刪除的自動化腳本。
  - **規格 1.2**: 表格應預設顯示腳本名稱、觸發方式、上次執行狀態、上次執行時間、執行次數等核心欄位。
  - **規格 1.3**: 「上次執行狀態」需根據不同狀態（`success`, `failed`, `running`）顯示對應的顏色標籤，方便使用者快速識別。
- **需求 2: 建立與管理腳本**
  - **規格 2.1**: 系統必須提供「新增腳本」的入口，點擊後開啟建立新腳本的表單。
  - **規格 2.2**: 使用者應能在列表上直接「編輯」或「刪除」任一腳本。
  - **規格 2.3**: 刪除操作前，必須有二次確認機制，防止誤刪。
- **需求 3: 執行與操作**
  - **規格 3.1**: 使用者應能在列表上直接觸發「執行」操作。
  - **規格 3.2**: 系統必須支援對腳本進行批次刪除。
- **需求 4: 個人化檢視**
  - **規格 4.1**: 使用者應能自訂表格顯示的欄位，並儲存其偏好設定。
---

**API 與資料流**
- **儲存腳本 (新增)**:
  - `POST /api/v1/automation/scripts`: 當編輯的 `playbook` 物件為 `null` 時呼叫。
    - **傳出參數**: `Partial<AutomationPlaybook>` (表單資料)
    - **傳入資料**: 新建立的 `AutomationPlaybook` 物件。
- **儲存腳本 (更新)**:
  - `PATCH /api/v1/automation/scripts/{id}`: 當編輯現有的 `playbook` 物件時呼叫。
    - **傳出參數**: `id` (腳本 ID), `Partial<AutomationPlaybook>` (表單資料)
    - **傳入資料**: 更新後的 `AutomationPlaybook` 物件。
- **資料模型**: `AutomationPlaybook`, `ParameterDefinition`
  ```typescript
  // 腳本參數定義
  export interface ParameterDefinition {
    name: string;                      // 參數名稱 (變數名)
    label: string;                     // 顯示標籤
    type: 'string' | 'number' | 'enum' | 'boolean'; // 參數類型
    required: boolean;                 // 是否為必填
    default_value?: string | number | boolean; // 預設值
    options?: { value: string; label: string }[]; // enum 類型的選項
    placeholder?: string;              // 輸入提示
  }
  ```

**需求與規格定義**
- **需求 1: 提供腳本編輯介面**
  - **規格 1.1**: 系統必須提供一個互動視窗，用於建立和編輯自動化腳本。
  - **規格 1.2**: 表單必須包含腳本名稱、類型、描述、腳本內容等欄位。名稱為必填項。
- **需求 2: 支援腳本參數化**
  - **規格 2.1**: 使用者應能為腳本定義一或多個執行參數。
  - **規格 2.2**: 每個參數必須能定義其名稱、標籤、類型和是否必填。
  - **規格 2.3**: 當參數類型為 `enum` 時，必須允許使用者自訂選項列表。
- **需求 3: 提供腳本撰寫輔助功能**
  - **規格 3.1**: 系統應允許使用者從本機上傳腳本檔案，以快速填充內容。
  - **規格 3.2**: 系統必須整合 AI 輔助功能，協助使用者根據自然語言描述產生腳本。

---

**API 與資料流**
- **產生腳本**:
  - `POST /api/v1/ai/automation/generate-script`: 發送使用者需求以產生腳本。
    - **傳出參數**: `prompt: string` (使用者輸入的需求)
    - **傳入資料**: `GeneratedPlaybook` 物件
    - **實現細節**: mock server 直接回傳預生成腳本範本，回傳結構包含 `type`, `content`, `parameters` 【F:components/GeneratePlaybookWithAIModal.tsx†L33-L41】【F:mock-server/handlers.ts†L521-L523】【F:mock-server/db.ts†L2103-L2109】
- **資料模型**: `GeneratedPlaybook`
  ```typescript
  // AI 產生的腳本物件
  interface GeneratedPlaybook {
    type: AutomationPlaybook['type']; // 建議的腳本類型
    content: string;                  // 產生的腳本內容
    parameters: ParameterDefinition[];// 解析出的參數
  }
  ```

**需求與規格定義**
- **需求 1: 透過 AI 輔助產生腳本**
  - **規格 1.1**: 系統必須提供一個介面，讓使用者能以自然語言描述來產生自動化腳本。
  - **規格 1.2**: 使用者點擊產生後，系統應呼叫後端 AI 服務，並將使用者輸入的 prompt 傳遞過去。
- **需求 2: 預覽與套用 AI 結果**
  - **規格 2.1**: AI 服務回傳結果後，系統必須在介面上清晰地展示產生的腳本類型、內容和建議的參數。
  - **規格 2.2**: 使用者必須能夠將 AI 產生的結果一鍵「套用」回腳本編輯表單中。
  - **規格 2.3**: 如果 AI 服務處理失敗，必須向使用者顯示明確的錯誤提示。
---

## Source Evidence
- ### `automation-scripts-list.png` （來源：`docs/specs/automation-spec-pages.md`）
- ### `automation-edit-script-modal.png` （來源：`docs/specs/automation-spec-pages.md`）
- ### `automation-ai-generate-script-modal.png` （來源：`docs/specs/automation-spec-pages.md`）

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

