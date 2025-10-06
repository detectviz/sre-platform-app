# Feature Specification: 資源拓撲視圖 (Resource Topology)

**Feature Branch**: `[resources-topology-spec]`
**Created**: 2025-10-06
**Status**: Draft
**Input**: 逆向自 `docs/specs/resources-spec-pages.md` → ``resources-topology-view.png``

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 `.specify/specs/modules/resources-topology-spec.md`。

## User Scenarios & Testing *(mandatory)*
### `resources-topology-view.png`

**現況描述**
- 此頁面為「資源拓撲視圖 (Resource Topology View)」，使用圖形化方式展示系統中所有資源及其相互關聯。
- **主要區域**：
    - **控制列**：位於頁面頂部，提供「版型」和「類型」兩個下拉式選單，用於調整拓撲圖的佈局和篩選顯示的資源。
    - **圖例**：位於左側，標示出圖中不同資源類型對應的圖示或顏色。
    - **拓撲圖區域**：佔據頁面大部分空間，顯示節點和連線。節點顏色會根據資源的健康狀態（Healthy, Warning, Critical）而變化。
- **節點**：代表一個獨立的資源。
- **連線**：代表兩個資源之間的關聯。

**互動流程**
- **載入頁面**：
    1. 頁面載入時，呼叫 API 獲取拓撲資料（節點和連線）。
    2. 同時獲取拓撲圖的設定選項（如可用的佈局類型）。
    3. 渲染拓撲圖。若 API 呼叫失敗，顯示錯誤訊息與重試按鈕。
- **視圖操作**：
    1. 使用者可以使用滑鼠滾輪縮放視圖、按住拖曳平移視圖。
    2. 使用者可以點擊並拖曳單一節點。
- **調整版型**：
    1. 使用者從「版型」下拉選單中選擇一個新的佈局（如 `force`, `circular`）。
    2. 前端 ECharts 元件會重新計算並以動畫效果切換到新的佈局。
- **篩選類型**：
    1. 使用者從「類型」下拉選單中選擇一個資源類型。
    2. 拓撲圖會篩選並僅顯示該類型的資源節點及其相關的連線。
- **快捷操作 (右鍵選單)**：
    1. 使用者在任一資源節點上按下滑鼠右鍵。
    2. 在滑鼠指標位置彈出一個快捷選單。
    3. 選單提供「查看資源詳情」、「檢視相關事件」、「執行腳本」等選項。
    4. 點擊選項後，系統會導航到對應的功能頁面，並可能帶上該資源的 ID 作為參數。
- **查看節點資訊 (懸浮提示)**：
    1. 使用者將滑鼠懸停在任一節點上。
    2. 系統顯示一個 Tooltip，展示該資源的詳細資訊，如名稱、類型、狀態、擁有者等。

## Requirements *(mandatory)*
**API 與資料流**
- **獲取拓撲資料**：
    - `GET /api/v1/resources/topology`
    - **傳出資料**：`{ nodes: Resource[], links: { source: string, target: string }[] }`，包含所有資源節點和關聯連結。
- **獲取設定選項**：
    - `GET /api/v1/ui/options`
    - **傳出資料**：在 `topology.layouts` 欄位中包含可用的佈局選項陣列。

**需求與規格定義**
- **使用者需求**：
    - 我希望能有一個全局視圖，直觀地了解我所有資源以及它們之間的依賴關係。
    - 當系統出現問題時，我希望能快速從拓撲圖中定位到故障節點及其影響範圍。
    - 我希望能直接在拓撲圖上進行一些快捷操作，例如直接跳轉到某個資源的詳情頁。
- **功能規格**：
    - **R-TOPO-001**：系統必須提供一個拓撲視圖頁面，以網路圖的形式展示所有資源（節點）及其關聯（連線）。
    - **R-TOPO-002**：節點的顏色必須能反映其對應資源的即時健康狀態。
    - **R-TOPO-003**：使用者必須能夠透過下拉選單切換不同的圖表佈局演算法（如力導向、環形）。
    - **R-TOPO-004**：使用者必須能夠根據資源類型篩選圖中顯示的節點。
    - **R-TOPO-005**：在節點上按下滑鼠右鍵，必須彈出一個包含快捷操作的上下文選單。
    - **R-TOPO-006**：快捷操作至少應包含導向至「資源詳情」頁面的連結。
    - **R-TOPO-007**：滑鼠懸停在節點上時，必須顯示包含該資源關鍵資訊的提示框。

## Source Evidence
- ### `resources-topology-view.png` （來源：`docs/specs/resources-spec-pages.md`）

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

