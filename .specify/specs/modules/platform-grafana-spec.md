# Feature Specification: Grafana 整合設定 (Platform Grafana)

**Feature Branch**: `[platform-grafana-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/platform-spec-pages.md` → ``platform-grafana-settings.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/platform-grafana-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `platform-grafana-settings.png`

**現況描述**
- 此頁面提供了一個表單，用於設定與外部 Grafana 實例的整合。
- 頁面頂部有一個提示框，說明此設定的用途。
- 表單包含一個「啟用 Grafana 整合」的開關、Grafana URL、Grafana API Key 和組織 ID (Org ID) 等欄位。
- API Key 為密碼欄位，並提供一個眼睛圖示來切換可見性。
- 頁面底部有「測試連線」、「取消」和「儲存變更」三個操作按鈕。

**互動流程**
1.  **載入頁面**：
    -   使用者進入頁面時，系統會自動發送請求，獲取目前的 Grafana 設定並填入表單。
    -   API Key 會被前端以 `**********` 遮蔽。
2.  **修改設定**：
    -   使用者可以點擊開關來啟用或停用 Grafana 整合。
    -   使用者可以修改 URL、API Key 和 Org ID。
3.  **測試連線**：
    -   使用者點擊「測試連線」按鈕。
    -   系統會使用**目前表單中**的設定（包括使用者新輸入的 API Key）發送請求進行測試。
    -   按鈕會進入「測試中...」的禁用狀態。
    -   測試完成後，會在表單下方顯示結果，包括成功或失敗的訊息、偵測到的 Grafana 版本以及測試時間。
4.  **儲存變更**：
    -   使用者點擊「儲存變更」按鈕。
    -   系統會將表單中的所有設定資料（包括使用者新輸入的 API Key）發送到後端進行儲存。
    -   儲存成功後，系統應提示成功訊息，並重新載入設定（以再次遮蔽 API Key）。
    -   若儲存失敗，系統應提示錯誤訊息。
5.  **取消變更**：
    -   使用者點擊「取消」按鈕。
    -   系統會重新抓取一次已儲存的設定，放棄所有本地的修改。

## Requirements *(mandatory)*
**API 與資料流**
1.  **取得 Grafana 設定**
    -   **API**: `GET /api/v1/settings/grafana`
    -   **傳出參數**: 無
    -   **傳入資料 (Response)**: `GrafanaSettings` 物件。
        ```json
        {
          "enabled": true,
          "url": "http://localhost:3000",
          "api_key": "glsa_xxxxxxxxxxxxxxxxxxxxxxxx",
          "org_id": 1
        }
        ```
2.  **更新 Grafana 設定**
    -   **API**: `PUT /api/v1/settings/grafana`
    -   **傳出參數 (Request Body)**: `GrafanaSettings` 物件。
    -   **傳入資料 (Response)**: 更新後的 `GrafanaSettings` 物件。
3.  **測試 Grafana 連線**
    -   **API**: `POST /api/v1/settings/grafana/test`
    -   **傳出參數 (Request Body)**: `GrafanaSettings` 物件。
    -   **傳入資料 (Response)**: `GrafanaTestResponse` 物件。
        ```json
        // 成功
        {
          "success": true,
          "result": "success",
          "message": "連線成功！偵測到 Grafana v10.1.2。",
          "detected_version": "Grafana v10.1.2",
          "tested_at": "2025-10-02T12:30:00Z"
        }
        // 失敗
        {
          "success": false,
          "result": "failed",
          "message": "連線失敗：API Key 無效或權限不足。",
          "tested_at": "2025-10-02T12:31:00Z"
        }
        ```

**需求與規格定義**
- **USR-PLATFORM-GRAFANA-001**: 作為平台管理員，我需要能夠設定與 Grafana 的整合，以便在平台內管理和檢視 Grafana 儀表板。
- **SPEC-PLATFORM-GRAFANA-001.1**: 系統必須提供一個表單，讓使用者可以輸入 Grafana URL、API Key 和 Org ID。
- **SPEC-PLATFORM-GRAFANA-001.2**: 系統必須提供一個開關，讓使用者可以啟用或停用此整合。
- **SPEC-PLATFORM-GRAFANA-001.3**: API Key 欄位必須預設為密碼遮蔽，並提供一個可切換可見性的按鈕。
- **USR-PLATFORM-GRAFANA-002**: 在儲存設定前，我希望能先測試連線是否成功。
- **SPEC-PLATFORM-GRAFANA-002.1**: 系統必須提供一個「測試連線」按鈕，觸發 `POST /api/v1/settings/grafana/test` API。
- **SPEC-PLATFORM-GRAFANA-002.2**: 測試結果（包括成功訊息、失敗訊息、偵測到的版本）必須在畫面上清晰地展示給使用者。
- **USR-PLATFORM-GRAFANA-003**: 我需要能夠儲存我的 Grafana 設定。
- **SPEC-PLATFORM-GRAFANA-003.1**: 系統必須提供一個「儲存變更」按鈕，觸發 `PUT /api/v1/settings/grafana` 來保存設定。
- **SPEC-PLATFORM-GRAFANA-003.2**: 儲存成功後，應重新載入設定，確保 API Key 在畫面上恢復為遮蔽狀態。

## Source Evidence
- ### `platform-grafana-settings.png` （來源：`docs/specs/platform-spec-pages.md`）

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

