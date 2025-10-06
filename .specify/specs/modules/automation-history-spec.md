# Feature Specification: 自動化執行歷史 (Automation History)

**Feature Branch**: `[automation-history-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/automation-spec-pages.md` → ``automation-run-logs-list.png``、 `docs/specs/automation-spec-pages.md` → ``automation-run-log-detail.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/automation-history-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `automation-run-logs-list.png`

**現況描述**
- 此頁面為「自動化執行歷史」，即執行日誌 (Run Logs) 列表。
- 介面包含一個工具列、可排序的表格、以及分頁控制器。
- 工具列提供「搜尋和篩選」、「匯出」和「欄位設定」功能。
- 表格欄位包含：腳本名稱、狀態、觸發來源、啟動者、開始時間、執行耗時等。
- 表頭支援點擊排序。
- 「狀態」欄位以不同顏色的藥丸樣式呈現，對於「失敗」的紀錄，旁邊會出現一個「重試」按鈕。
- 整個表格支援多選，用於匯出時指定範圍。

**互動流程**
- **查看詳情**: 使用者點擊列表中的任一筆紀錄，會從右側滑出一個抽屜 (Drawer)，顯示該次執行的詳細日誌 (對應 `automation-run-log-detail.png`)。
- **排序**: 使用者點擊表頭的欄位名稱（如「開始時間」），列表會根據該欄位進行升序或降序排序。
- **重試**: 使用者點擊「失敗」紀錄旁的「重試」圖示按鈕，系統應會重新執行該任務。
- **匯出**: 使用者點擊「匯出」按鈕，可以將目前列表的資料（或勾選的資料）下載為 `.csv` 檔案。
- **篩選**: 使用者點擊「搜尋和篩選」按鈕，可開啟搜尋視窗，根據腳本名稱、狀態、日期範圍等條件過濾紀錄。
- **分頁**: 使用者可透過底部的分頁控制器來瀏覽不同頁面的紀錄。

### `automation-run-log-detail.png`

**現況描述**
- 此為單次「執行日誌」的詳細資訊畫面，通常在一個從右側滑出的抽屜 (Drawer) 元件中顯示。
- 介面頂部是摘要區，包含：狀態、腳本名稱、觸發來源、執行耗時。
- 如果該次執行有使用參數，會有一個專門的區塊以格式化的 JSON 顯示傳入的所有參數。
- 介面主要部分分為兩個區塊：「標準輸出 (STDOUT)」和「標準錯誤 (STDERR)」。
- 「標準錯誤」區塊只有在 `stderr` 有內容時才會顯示。

**互動流程**
- **檢視**: 此畫面為唯讀，使用者無法進行任何修改操作。
- **捲動**: 當 STDOUT 或 STDERR 的日誌內容過長時，使用者可以在其各自的區塊內獨立捲動。
- **關閉**: 使用者可以點擊抽屜右上角的關閉按鈕，或點擊抽屜外的區域來關閉此詳細視圖，返回日誌列表。

## Requirements *(mandatory)*
**API 與資料流**
- **載入/搜尋紀錄**:
  - `GET /api/v1/automation/executions`: 獲取執行歷史紀錄。
    - **傳出參數**: `page`, `page_size`, `sort_by`, `sort_order`, `filters` (篩選條件物件)
    - **傳入資料**: `items: AutomationExecution[]`, `total: number`
- **重試執行**:
  - `POST /api/v1/automation/executions/{executionId}/retry`: 重新執行一個失敗的任務。
    - **傳出參數**: `executionId` (執行紀錄 ID)
    - **傳入資料**: 成功或失敗的狀態訊息。
- **資料模型**: `AutomationExecution`
  ```typescript
  // 自動化執行紀錄
  export interface AutomationExecution {
    id: string;
    playbook_id: string;
    playbook_name: string;
    status: ExecutionStatus; // 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
    trigger_source: TriggerSource; // 'manual' | 'schedule' | 'webhook' | 'event'
    triggered_by: string; // User or system component
    start_time: string;
    end_time?: string;
    duration_ms?: number;
    parameters?: Record<string, any>;
    logs: {
      stdout: string;
      stderr: string;
    };
    deleted_at?: string;
  }
  ```

**需求與規格定義**
- **需求 1: 提供完整的執行歷史查詢**
  - **規格 1.1**: 系統必須提供一個可分頁、可排序的列表，展示所有自動化腳本的執行紀錄。
  - **規格 1.2**: 列表應清晰展示每次執行的核心資訊，包括腳本名稱、狀態、觸發方式與時間。
  - **規格 1.3**: 系統必須提供篩選功能，讓使用者能根據腳本、狀態、日期等多維度查詢歷史紀錄。
- **需求 2: 支援問題排查與追蹤**
  - **規格 2.1**: 使用者必須能夠點擊任一筆紀錄，查看其完整的執行詳情，包括參數、標準輸出和錯誤輸出。
  - **規格 2.2**: 對於執行失敗的任務，系統必須提供一鍵「重試」的功能。
- **需求 3: 支援資料匯出**
  - **規格 3.1**: 系統必須提供將執行紀錄匯出為 CSV 檔案的功能，以便進行離線分析或歸檔。
  - **規格 3.2**: 匯出功能應支援匯出所有篩選結果，或僅匯出使用者手動勾選的項目。
---

**API 與資料流**
- **資料來源**: 此元件不直接呼叫 API。
- **資料傳遞**: 它是被動的，從父元件（`AutomationHistoryPage`）接收一個完整的 `AutomationExecution` 物件作為 props，並將其內容渲染出來。

**需求與規格定義**
- **需求 1: 提供詳細的執行日誌內容**
  - **規格 1.1**: 系統必須為每一次執行紀錄提供一個詳細的檢視畫面。
  - **規格 1.2**: 畫面必須清楚地展示該次執行的摘要資訊（如狀態、耗時）、使用的參數、完整的標準輸出和標準錯誤日誌。
- **需求 2: 提升日誌的可讀性**
  - **規格 2.1**: 所有日誌內容（STDOUT, STDERR）和參數物件都應使用等寬字體 (monospaced font) 顯示在預格式化的區塊中，以保持程式碼和日誌的對齊與可讀性。
  - **規格 2.2**: 「標準錯誤」區塊應有明顯的視覺區分（例如使用紅色系的背景或邊框），以警示使用者。
  - **規格 2.3**: 如果沒有標準輸出或標準錯誤，系統應在對應區塊顯示明確的提示文字（例如「無標準輸出」），而非留白。

## Source Evidence
- ### `automation-run-logs-list.png` （來源：`docs/specs/automation-spec-pages.md`）
- ### `automation-run-log-detail.png` （來源：`docs/specs/automation-spec-pages.md`）

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

