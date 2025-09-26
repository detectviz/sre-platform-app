# SRE 平台功能規格 v2.5

本文件旨在記錄 SRE 平台在持續開發過程中的重要功能規格與架構決策，作為開發與測試的依據。

---

## 1. 功能: 頁面版面配置 API 化 (Page Layout Customization API Integration)

-   **模組**: 平台設定 (Platform Settings)
-   **版本**: v2.1
-   **狀態**: ✅ 已完成

### 1.1 使用者故事

**身為** 一名平台管理員，
**我想要** 自訂各個主要頁面上顯示的關鍵效能指標 (KPI) 卡片，
**使得** 這些設定能夠被儲存在伺服器上，以便在不同裝置和瀏覽器間保持一致，提升我的工作效率。

### 1.2 行為變更

-   **數據獲取**: 「版面管理」頁面 (`LayoutSettingsPage.tsx`) 現在會在載入時，向 `/api/v1/settings/layouts` 端點發起 `GET` 請求，以獲取所有頁面的最新版面配置，而非從 `localStorage` 或靜態常數初始化。
-   **數據持久化**: 當使用者儲存對某個頁面版面的修改時，前端會向 `/api/v1/settings/layouts` 端點發起 `PUT` 請求，將**完整的**、更新後的版面配置物件傳送至後端進行儲存。
-   **本地快取與即時更新**: 為了在不刷新頁面的情況下，讓其他頁面（尤其是 `PageKPIs.tsx` 元件）能即時反應版面變更，在成功儲存到後端後，前端會同時更新 `localStorage` 中的版面配置副本，並觸發一個 `storage` 事件。這提供了一種高效能的樂觀更新機制。
-   **使用者體驗**: 頁面新增了載入中 (Loading) 與錯誤 (Error) 狀態的視覺回饋，提升了非同步操作的健壯性。

### 1.3 使用的 API 端點

-   `GET /api/v1/settings/layouts`: 用於讀取當前所有頁面的版面配置。
-   `PUT /api/v1/settings/layouts`: 用於儲存更新後的完整版面配置。

---

## 2. 功能: 資源拓撲圖動態化 (Resource Topology View API Integration)

-   **模組**: 資源管理 (Resource Management)
-   **版本**: v2.1
-   **狀態**: ✅ 已完成

### 2.1 使用者故事

**身為** 一名 SRE 工程師，
**我想要** 查看一個即時、由後端數據驅動的資源依賴拓撲圖，
**使得** 我能快速理解系統的真實架構，並在發生事件時迅速評估潛在的影響範圍。

### 2.2 行為變更

-   **數據獲取**: 「拓撲視圖」頁面 (`ResourceTopologyPage.tsx`) 現在會向新建立的 `GET /api/v1/resources/topology` 端點發起請求，以獲取拓撲圖所需的節點（資源）與連結（依賴關係）數據。
-   **動態視覺化**: 拓撲圖現在完全基於 API 回傳的數據進行動態渲染，確保了其內容的即時性與準確性。
-   **API 契約擴充**: 為了支援此功能，`openapi.yaml` 文件中新增了 `/resources/topology` 端點的定義。
-   **使用者體驗**: 頁面同樣增加了載入中與錯誤狀態的處理，確保在數據獲取過程中提供清晰的視覺回饋。

### 2.3 使用的 API 端點

-   `GET /api/v1/resources/topology`: (新增) 用於一次性獲取所有資源節點及其依賴關係連結。

---

## 3. 功能: 個人設定模組 API 化 (Profile Module API Integration)

-   **模組**: 個人設定 (Profile)
-   **版本**: v2.2
-   **狀態**: ✅ 已完成

### 3.1 使用者故事

**身為** 一名已登入的使用者，
**我想要** 我的個人資訊、安全設定（如登入歷史）以及偏好設定都能從後端 API 動態載入並儲存，
**使得** 我的設定能夠在所有裝置間保持同步，並確保數據的準確性與安全性。

### 3.2 行為變更

-   **個人資訊 (`PersonalInfoPage`)**: 頁面不再讀取靜態模擬數據，而是向 `/api/v1/me` 發起 `GET` 請求，以獲取當前登入使用者的資訊。
-   **安全設定 (`SecuritySettingsPage`)**: 頁面中的「登入歷史」列表，現在透過向 `/api/v1/me/login-history` 發起 `GET` 請求來動態獲取，並支援分頁。
-   **偏好設定 (`PreferenceSettingsPage`)**:
    -   **數據獲取**: 頁面載入時，會向 `/api/v1/me/preferences` 發起 `GET` 請求來獲取使用者的偏好設定，取代了原有的 `localStorage` 讀取邏輯。
    -   **數據持久化**: 當使用者儲存設定時，會向同一個端點發起 `PUT` 請求，將更新後的設定持久化到後端。
-   **使用者體驗**: 所有相關頁面都增加了載入中與錯誤狀態的處理，提升了非同步操作的健壯性。

### 3.3 使用的 API 端點

-   `GET /api/v1/me`: (新增) 取得當前登入者的個人資訊。
-   `GET /api/v1/me/login-history`: (新增) 取得登入者的登入歷史紀錄。
-   `GET /api/v1/me/preferences`: (新增) 取得使用者的偏好設定。
-   `PUT /api/v1/me/preferences`: (新增) 更新使用者的偏好設定。

---

## 4. 功能: 分析中心數據動態化 (Analysis Center API Integration)

-   **模組**: 分析中心 (Analysis Center)
-   **版本**: v2.2
-   **狀態**: ✅ 已完成

### 4.1 使用者故事

**身為** 一名 SRE 或開發人員，
**我想要** 在「日誌探索」和「追蹤分析」頁面中，能夠查詢和瀏覽來自後端的即時數據，
**使得** 我可以對系統的真實運行狀況進行深入分析，快速定位問題。

### 4.2 行為變更

-   **日誌探索 (`LogExplorerPage`)**: 頁面不再使用 `MOCK_LOGS` 靜態數據。現在，它會向 `GET /api/v1/logs` 端點發起請求，獲取日誌數據。API 支援篩選與分頁，讓前端能更有效地處理大量日誌。
-   **追蹤分析 (`TraceAnalysisPage`)**:
    -   **數據獲取**: 「追蹤列表」現在透過向 `GET /api/v1/traces` 端點發起請求來填充。
    -   **動態載入**: 點擊列表中的追蹤項目時，其詳細的 Span 資訊會被動態載入和渲染，取代了原有的靜態數據依賴。
-   **API 契約擴充**: `openapi.yaml` 文件中新增了「分析中心」相關的 `/logs` 和 `/traces` 端點定義。
-   **使用者體驗**: 頁面同樣增加了載入中與錯誤狀態的處理，確保在數據獲取過程中提供清晰的視覺回饋。

### 4.3 使用的 API 端點

-   `GET /api/v1/logs`: (新增) 取得日誌數據，支援篩選與分頁。
-   `GET /api/v1/traces`: (新增) 取得追蹤列表。
-   `GET /api/v1/traces/{trace_id}`: (新增) 取得單一追蹤的詳細資訊，包含所有 Spans。
---

## 5. 功能: 全面 API 化 - 詳情、表單與配置 (Full API Integration)

-   **模組**: 全局
-   **版本**: v2.4
-   **狀態**: ✅ 已完成

### 5.1 使用者故事

**身為** 一名平台使用者，
**我想要** 應用程式中所有的動態內容，包括詳情頁的圖表、編輯表單的下拉選單、以及列表頁的篩選條件，都能從後端 API 動態載入，
**使得** 平台完全擺脫前端的靜態資料依賴，確保我看到的永遠是最新、最準確的資訊，並提升系統的整體可維護性。

### 5.2 行為變更

-   **資源詳情頁 (`ResourceDetailPage`)**:
    -   **動態指標圖表**: 頁面中的 CPU 和記憶體圖表，不再使用前端生成的模擬數據。現在，它們會在載入時向新增的 `GET /resources/{resourceId}/metrics` 端點發起請求，以獲取真實的歷史指標數據並進行渲染。

-   **編輯與新增模態框 (`Edit/Add Modals`)**:
    -   **通用模式**: 所有先前使用 `constants.ts` 中硬編碼陣列來填充下拉選單的模態框，都已被重構為在開啟時向對應的 API 端點發起 `GET` 請求。
    -   **受影響的元件**:
        -   `ResourceEditModal`: 從 `GET /resources/options` 獲取資源類型、提供商、區域和擁有者列表。
        -   `ResourceGroupEditModal`: 從 `GET /iam/teams` 獲取擁有團隊列表。
        -   `DashboardEditModal`: 從 `GET /dashboards/options` 獲取儀表板類別和擁有者列表。
        -   `InviteUserModal`: 從 `GET /iam/roles` 和 `GET /iam/teams` 分別獲取角色和團隊列表。
        -   `NotificationStrategyEditModal`: 從 `GET /settings/tags` 獲取觸發條件的可用標籤鍵。

-   **列表頁篩選器 (`List Page Filters`)**:
    -   `DashboardListPage`: 頁面頂部的「類別」篩選按鈕，現在基於 `GET /dashboards/options` 的回應動態生成。
    -   `UnifiedSearchModal`: 用於篩選資源的下拉選單選項，現在基於 `GET /resources/options` 的回應動態生成。

### 5.3 新增的 API 端點

-   `GET /resources/options`: (新增) 集中提供資源相關的所有可選項（類型、提供商、區域、擁有者），優化前端請求效率。
-   `GET /dashboards/options`: (新增) 提供儀表板相關的可選項（類別、擁有者）。
-   `GET /resources/{resourceId}/metrics`: (新增) 提供特定資源的歷史指標數據。
-   (重用) `GET /iam/teams`, `GET /iam/roles`, `GET /settings/tags` 等現有端點被更廣泛地用於填充各類表單選項。

---

## 6. 功能: 最終 API 化 - 範本、權限與通知 (Final API Integration)

-   **模組**: 全局
-   **版本**: v2.5
-   **狀態**: ✅ 已完成

### 6.1 使用者故事

**身為** 一名平台使用者，
**我想要** 平台中所有剩餘的靜態配置數據，例如儀表板範本、可用權限、通知列表、以及 KPI 卡片數據，都能從後端 API 動態載入，
**使得** 整個應用程式達到 100% API 驅動，最大化系統的靈活性、可維護性，並確保所有使用者介面元素都反映了後端的唯一真實來源 (SSOT)。

### 6.2 行為變更

-   **儀表板範本 (`DashboardTemplatesPage`)**: 頁面不再讀取 `MOCK_DASHBOARD_TEMPLATES`，而是向 `GET /dashboards/templates` 發起請求來動態獲取所有可用的儀表板範本。
-   **角色權限配置 (`RoleEditModal`)**: 角色編輯器中的權限列表，不再依賴 `AVAILABLE_PERMISSIONS` 常數，而是向 `GET /iam/permissions` 請求，以獲取後端定義的所有可用模組與操作權限。
-   **規則範本 (`AlertRuleEditModal`, `SilenceRuleEditModal`)**: 這兩個編輯器現在分別向 `GET /alert-rules/templates` 和 `GET /silence-rules/templates` 發起請求，以動態載入可用的規則範本，取代了原有的靜態常數。
-   **通知中心 (`NotificationCenter`)**: 頂部導航列的通知中心，不再顯示 `MOCK_NOTIFICATIONS`。它現在會向 `GET /notifications` 端點發起請求，以獲取當前使用者的即時通知列表。
-   **KPI 卡片數據 (`PageKPIs`)**:
    -   遍佈於各個頁面的 KPI 卡片，其顯示的數值不再來自前端的 `KPI_DATA` 常數。現在，`PageKPIs` 元件會向 `GET /kpi-data` 端點發起請求，獲取所有 KPI 的即時數值。
    -   `SREWarRoomPage` 和 `InfrastructureInsightsPage` 已被重構，移除其內部硬編碼的 KPI 卡片，轉而使用統一的、由 API 驅動的 `PageKPIs` 元件。
-   **版面小工具定義 (`LayoutSettingsPage`)**: 版面設定頁面中「可用的小工具」列表，不再依賴 `LAYOUT_WIDGETS` 常數，而是向 `GET /settings/widgets` 發起請求來動態獲取。
-   **標籤分類 (`TagDefinitionEditModal`)**: 標籤編輯器中的「分類」下拉選單，現在透過 `GET /settings/tags/options` 獲取可選項，取代了 `constants.ts` 中的靜態陣列。

### 6.3 新增的 API 端點

-   `GET /dashboards/templates`: (新增) 取得所有儀表板範本。
-   `GET /iam/permissions`: (新增) 取得所有可用於角色的權限定義。
-   `GET /alert-rules/templates`: (新增) 取得所有告警規則範本。
-   `GET /silence-rules/templates`: (新增) 取得所有靜音規則範本。
-   `GET /notifications`: (新增) 取得使用者的通知列表。
-   `GET /settings/widgets`: (新增) 取得所有可用的版面小工具定義。
-   `GET /kpi-data`: (新增) 取得所有 KPI 卡片的即時數據。
-   `GET /settings/tags/options`: (新增) 取得標籤定義的可用選項（如分類）。
-   `GET /dashboards/{dashboard_id}`: (擴充) `DashboardViewPage` 現在使用此端點獲取儀表板詳情。
-   `GET /resources`: (擴充) 支援 `bookmarked=true` 參數，用於基礎設施洞察頁。
---

## 7. 功能: 通用列表頁面操作 (Common List Page Actions)

-   **模組**: 全局
-   **版本**: v2.5.1
-   **狀態**: ✅ 已完成

### 7.1 使用者故事

**身為** 一名平台使用者，
**我想要** 在點擊列表頁面上目前尚未啟用的功能按鈕（如「匯入」、「匯出」、「欄位設定」）時，能收到一個明確的提示，
**使得** 我能知道這些功能正在開發中，而不是誤以為按鈕無效或系統出錯，從而提升使用者體驗的一致性與可預測性。

### 7.2 行為變更

-   **啟用禁用按鈕**: 在多個核心列表頁面的工具列 (`Toolbar`) 中，原先被設定為 `disabled` 並帶有 `title="功能開發中"` 的按鈕，現在已被啟用。
-   **統一提示框**: 點擊這些按鈕後，會觸發一個統一的 `PlaceholderModal` 元件。
-   **動態內容**: 該提示框會動態顯示被點擊的功能名稱（例如「匯出報表」），告知使用者「此功能目前正在開發中，敬請期待！」。
-   **受影響的頁面**:
    -   `DashboardListPage`: 「欄位設定」按鈕。
    -   `ResourceListPage`: 「匯入」、「匯出」、「欄位設定」按鈕。
    -   `PersonnelManagementPage`: 「匯入」、「匯出」、「欄位設定」按鈕。
    -   `AlertRulePage`: 「匯入」、「匯出」、「欄位設定」按鈕。
    -   `SilenceRulePage`: 「匯入」、「匯出」、「欄位設定」按鈕。
    -   `AuditLogsPage`: 「匯出」按鈕。
    -   `AnalysisOverviewPage`, `NotificationHistoryPage`: 原有的「匯出」功能也統一使用此模式。

### 7.3 使用的元件

-   `components/Toolbar.tsx`: 修改 `ToolbarButton` 的 `disabled` 屬性為 `onClick` 事件。
-   `components/PlaceholderModal.tsx`: 重用現有的佔位提示框元件，以提供一致的使用者回饋。
---

## 8. 功能: 資料匯出 (Data Export)

-   **模組**: 全局
-   **版本**: v2.6 / v2.10 (擴充)
-   **狀態**: ✅ 已完成

### 8.1 使用者故事

**身為** 一名 SRE 工程師或平台管理員，
**我想要** 將各個列表與分析頁面的數據匯出為 CSV 檔案，
**使得** 我可以進行離線分析、製作報告或將數據導入其他系統。

### 8.2 行為變更

-   **通用匯出邏輯**:
    -   在多個核心頁面中，原先顯示「功能開發中」的「匯出」按鈕現在已啟用並實作功能。
    -   點擊「匯出」按鈕會觸發一個 CSV 檔案的下載。
    -   如果列表支援多選，且有項目被選中，則只匯出選中的項目。若無，則匯出當前頁面顯示的所有項目。
    -   對於分析頁面，則匯出當前檢視的主要數據。
    -   匯出的檔案名稱格式為 `[page-name]-[YYYY-MM-DD].csv`。

-   **已實作匯出的頁面**:
    -   **列表頁**:
        -   資源列表 (`ResourceListPage`)
        -   人員管理 (`PersonnelManagementPage`)
        -   告警規則 (`AlertRulePage`)
        -   靜音規則 (`SilenceRulePage`)
        -   審計日誌 (`AuditLogsPage`)
        -   通知歷史 (`NotificationHistoryPage`)
    -   **分析與洞察頁 (v2.10 新增)**:
        -   日誌探索 (`LogExplorerPage`)
        -   追蹤分析 (`TraceAnalysisPage`)
        -   分析概覽 (`AnalysisOverviewPage`)
        -   容量規劃 (`CapacityPlanningPage`)
        -   AI 洞察 (`AIInsightsPage`)
        -   基礎設施洞察 (`InfrastructureInsightsPage`)

### 8.3 使用的元件與服務

-   `services/export.ts`: 提供一個通用的 `exportToCsv` 輔助函式，用於處理數據到 CSV 的轉換和下載。
-   所有受影響的頁面元件都已更新，以調用此匯出服務。
---

## 9. 功能: 表格欄位自訂 (Table Column Customization)

-   **模組**: 全局
-   **版本**: v2.7
-   **狀態**: ✅ 已完成

### 9.1 使用者故事

**身為** 一名平台使用者，
**我想要** 在各個列表頁面上自訂顯示的欄位及其順序，
**使得** 我可以專注於對我最重要的資訊，隱藏不必要的欄位，從而提升我的工作效率和資訊瀏覽體驗。

### 9.2 行為變更

-   **功能啟用**: 在以下五個核心列表頁面，原先顯示「功能開發中」的「欄位設定」按鈕現在已啟用並實作功能：
    -   `DashboardListPage`
    -   `ResourceListPage`
    -   `PersonnelManagementPage`
    -   `AlertRulePage`
    -   `SilenceRulePage`

-   **互動介面**:
    -   點擊「欄位設定」按鈕會開啟一個新的 `ColumnSettingsModal` 模態框。
    -   模態框中提供一個雙欄選擇器，左側為「可用欄位」，右側為「顯示欄位」。
    -   使用者可以將欄位在兩欄之間移動，並使用上下箭頭按鈕調整「顯示欄位」中的順序。

-   **數據持久化**:
    -   使用者的欄位配置會透過新的 API 端點儲存在後端。
    -   前端在頁面載入時會請求對應的欄位配置，若無個人配置則使用系統預設值。

-   **即時更新**:
    -   儲存設定後，模態框關閉，對應的列表頁表格會**立即**根據新的配置重新渲染，無需刷新頁面。
    -   表格的標頭 (`<thead>`) 和內容 (`<tbody>`) 都會動態生成，以符合使用者選擇的欄位和順序。

### 9.3 使用的元件與服務

-   `components/ColumnSettingsModal.tsx`: (新增) 提供一個可重用的、用於管理表格欄位的模態框元件。
-   `services/api.ts`: (擴充) 新增了 `GET` 和 `PUT` `/settings/column-config/{pageKey}` 的 API 處理邏輯。
-   `openapi.yaml`: (擴充) 新增了 `/settings/column-config/{pageKey}` 的 API 端點定義。
-   `mock-server/db.ts`: (擴充) 新增了 `columnConfigs` 的預設資料。
-   所有受影響的列表頁面元件都已更新，以整合欄位設定功能。
---

## 10. 功能: 密碼管理 (Password Management)

-   **模組**: 個人設定 (Profile)
-   **版本**: v2.8
-   **狀態**: ✅ 已完成

### 10.1 使用者故事

**身為** 一名已登入的使用者，
**我想要** 在「安全設定」頁面中安全地變更我的登入密碼，
**使得** 我可以定期更新我的憑證，保障帳戶安全。

### 10.2 行為變更

-   **功能啟用**: 「安全設定」頁面 (`SecuritySettingsPage.tsx`) 中的「更新密碼」功能已從佔位行為改為完整實作。
-   **前端驗證**: 在提交前，前端會進行基本驗證：
    -   所有密碼欄位（舊、新、確認）皆為必填。
    -   新密碼與確認密碼必須相符。
    -   新密碼有最小長度限制。
-   **API 整合**: 驗證通過後，前端會向新增的 `POST /me/change-password` 端點發起請求，並傳送舊密碼與新密碼。
-   **使用者回饋**:
    -   API 請求期間，「更新密碼」按鈕會顯示載入中狀態。
    -   操作成功後，會顯示成功的 toast 提示，並清空所有密碼欄位。
    -   若操作失敗（例如，舊密碼錯誤），則會顯示從後端回傳的具體錯誤訊息 toast。

### 10.3 使用的 API 端點

-   `POST /me/change-password`: (新增) 用於變更當前登入者的密碼。
---

## 11. 功能: API 契約重構 (API Contract Refactoring)

-   **模組**: 全局
-   **版本**: v2.9
-   **狀態**: ✅ 已完成

### 11.1 重構目標

此版本重構旨在提升 API 契約的一致性、組織性與可維護性，主要解決兩個問題：
1.  **術語不一致**：`Event` (事件) 與 `Incident` (事故) 混用，`Incident` 是 SRE 領域更標準的術語。
2.  **AI 功能分散**：AI 相關的端點散落在各個業務模組下，缺乏統一的管理與識別性。

### 11.2 行為變更

-   **術語統一 (Event → Incident)**:
    -   所有 API 端點中的 `/events` 路徑已全部重命名為 `/incidents`。
    -   相關的 API 標籤從「事件管理」更新為「事故管理 (Incidents)」。
    -   受影響的前端頁面 (`IncidentListPage`, `IncidentDetailPage`) 已同步更新 API 請求路徑。

-   **AI 功能整合**:
    -   新增了一個頂層的 `/ai` 路由，用於統一管理所有 AI 驅動的功能。
    -   新增了 `AI Copilot` API 標籤。
    -   所有原先分散的 AI 端點已遷移至新路徑下：
        -   `GET /sre-war-room/briefing` → `GET /ai/briefing`
        -   `POST /events/ai-analysis` → `POST /ai/incidents/analyze`
        -   `POST /automation/scripts/generate-with-ai` → `POST /ai/automation/generate-script`
        -   `GET /dashboards/infrastructure-insights/risk-prediction` → `GET /ai/infra/risk-prediction`
        -   `GET /analysis/ai-insights/*` → `GET /ai/insights/*`
    -   所有相關的前端元件 (`SREWarRoomPage`, `IncidentListPage`, `GeneratePlaybookWithAIModal` 等) 已同步更新 API 請求路徑。

### 11.3 影響的 API 端點

-   **更名**:
    -   `/events` → `/incidents`
    -   `/events/{id}` → `/incidents/{id}`
    -   `/events/{id}/actions` → `/incidents/{id}/actions`
-   **遷移與重組**:
    -   所有 AI 功能端點遷移至 `/ai/*`。
---

## 12. 功能: 資料匯入 (CSV)

-   **模組**: 全局
-   **版本**: v2.11
-   **狀態**: ✅ 已完成

### 12.1 使用者故事

**身為** 一名平台管理員，
**我想要** 從 CSV 檔案批次匯入資源、人員、告警規則和靜音規則的資料，
**使得** 我可以快速地初始化或大量更新系統配置，而無需逐條手動輸入。

### 12.2 行為變更

-   **功能啟用**: 在以下四個核心列表頁面，原先顯示「功能開發中」的「匯入」按鈕現在已啟用並實作功能：
    -   資源列表 (`ResourceListPage`)
    -   人員管理 (`PersonnelManagementPage`)
    -   告警規則 (`AlertRulePage`)
    -   靜音規則 (`SilenceRulePage`)

-   **可重用元件**: 新增了一個 `ImportFromCsvModal.tsx` 元件，提供統一的匯入體驗。

-   **使用者流程**:
    1.  使用者點擊「匯入」按鈕，開啟匯入模態框。
    2.  模態框內提供一個連結，供使用者下載對應資料類型的 CSV 範本，以確保格式正確。
    3.  使用者可以透過拖曳檔案或點擊上傳區域來選擇已填寫好的 CSV 檔案。
    4.  上傳後，模態框會顯示檔案名稱和大小，供使用者確認。
    5.  點擊「開始匯入」按鈕，前端會向後端對應的 `/import` 端點發起請求。

-   **使用者回饋**:
    -   匯入過程中，按鈕會顯示載入中狀態。
    -   操作成功後，會顯示成功的 toast 提示，說明匯入結果，並自動刷新頁面上的列表。
    -   若操作失敗（如檔案格式錯誤），則會顯示錯誤的 toast 提示。

### 12.3 新增的 API 端點

-   `POST /resources/import`
-   `POST /iam/users/import`
-   `POST /alert-rules/import`
-   `POST /silence-rules/import`
---

## 13. 功能: 儀表板管理 CRUD (Dashboard Management CRUD)

-   **模組**: 儀表板管理 (Dashboard Management)
-   **版本**: v2.12
-   **狀態**: ✅ 已完成

### 13.1 使用者故事

**身為** 一名 SRE 工程師或團隊主管，
**我想要** 能夠自由地建立、查看、編輯和刪除儀表板，包括連結外部的 Grafana 儀表板和使用平台內建工具建立自訂儀表板，
**使得** 我可以為我的團隊或特定場景打造專屬的監控視圖，提升監控效率與洞察力。

### 13.2 行為變更

-   **儀表板建立 (`DashboardEditorPage`, `AddDashboardModal`)**:
    -   使用者現在可以透過「新增儀表板」流程，選擇建立「內建儀表板」或連結「Grafana 儀表板」。
    -   **內建儀表板**:
        -   提供了一個儀表板編輯器 (`DashboardEditorPage`)，使用者可以為新的儀表板命名，並從可用的小工具 (Widgets) 列表中選擇要顯示的 KPI 卡片。
        -   點擊「儲存儀表板」後，系統會透過 `POST /dashboards` API 將新的儀表板配置（包含其版面 `layout` 中的小工具 ID 列表）持久化到後端。
        -   儲存成功後，使用者會被導向儀表板列表頁，並能看到新建立的儀表板。
    -   **Grafana 儀表板**: 流程與之前相同，從可用的 Grafana 儀表板列表中選擇並連結。

-   **儀表板查看 (`DashboardViewPage`)**:
    -   `DashboardViewPage` 現在能夠智能地渲染不同類型的儀表板。
    -   點擊一個**使用者建立的內建儀表板**時，頁面會動態地根據其儲存的 `layout` 屬性，渲染出一個包含正確 KPI 卡片的通用儀表板視圖 (`GenericBuiltInDashboardPage`)。
    -   點擊一個**連結的 Grafana 儀表板**時，頁面會渲染 `DashboardViewer` 元件，以 iframe 形式嵌入 Grafana 儀表板。
    -   特殊的系統級儀表板（如「SRE 戰情室」）仍會導向其專屬的頁面。

-   **儀表板更新與刪除 (`DashboardListPage`)**:
    -   使用者可以透過列表中的操作選單來「設定」（編輯）或「刪除」任何儀表板。
    -   **差異化編輯流程**:
        -   **內建儀表板**: 點擊「設定」會將使用者導向至完整的儀表板編輯器 (`/dashboards/{id}/edit`)，允許他們視覺化地修改儀表板名稱、以及新增、移除或重新排序 KPI 小工具。儲存後會透過 `PATCH /dashboards/{id}` API 更新儀表板的 `layout`。
        -   **Grafana 儀表板**: 點擊「設定」會開啟 `DashboardEditModal`，僅允許修改儀表板的元數據（如名稱、描述）。
    -   刪除操作會彈出確認框，並透過 `DELETE /dashboards/{id}` API 進行軟刪除。

### 13.3 使用的 API 端點

-   `POST /dashboards`: (擴充) 現在支援建立 `type: 'built-in'` 的儀表板，並接受 `layout` 屬性。
-   `GET /dashboards/{id}`: (擴充) 對於內建儀表板，現在會回傳 `layout` 屬性。
-   (重用) `GET /dashboards`, `PATCH /dashboards/{id}`, `DELETE /dashboards/{id}`。
---

## 14. 功能: 表格欄位自訂 (Table Column Customization)

-   **模組**: 全局
-   **版本**: v2.13
-   **狀態**: ✅ 已完成

### 14.1 使用者故事

**身為** 一名平台使用者，
**我想要** 在各個列表頁面上自訂顯示的欄位及其順序，
**使得** 我可以專注於對我最重要的資訊，隱藏不必要的欄位，從而提升我的工作效率和資訊瀏覽體驗。

### 14.2 行為變更

-   **功能啟用**: 在以下五個核心列表頁面，原先的佔位「欄位設定」按鈕現在已實作完整功能：
    -   `DashboardListPage`
    -   `ResourceListPage`
    -   `PersonnelManagementPage`
    -   `AlertRulePage`
    -   `SilenceRulePage`

-   **互動介面**:
    -   點擊「欄位設定」按鈕會開啟一個新的 `ColumnSettingsModal` 模態框。
    -   模態框中提供一個雙欄選擇器，左側為「可用欄位」，右側為「顯示欄位」。
    -   使用者可以將欄位在兩欄之間移動，並使用上下箭頭按鈕調整「顯示欄位」中的順序。

-   **數據持久化**:
    -   使用者的欄位配置會透過新的 API 端點儲存在後端。
    -   前端在頁面載入時會請求對應的欄位配置，若無個人配置則使用系統預設值。

-   **即時更新**:
    -   儲存設定後，模態框關閉，對應的列表頁表格會**立即**根據新的配置重新渲染，無需刷新頁面。
    -   表格的標頭 (`<thead>`) 和內容 (`<tbody>`) 都會動態生成，以符合使用者選擇的欄位和順序。

### 14.3 使用的元件與服務

-   `components/ColumnSettingsModal.tsx`: (新增) 提供一個可重用的、用於管理表格欄位的模態框元件。
-   `services/api.ts`: (擴充) 新增了 `GET` 和 `PUT` `/settings/column-config/{pageKey}` 的 API 處理邏輯。
-   `openapi.yaml`: (擴充) 新增了 `/settings/column-config/{pageKey}` 的 API 端點定義。
-   `mock-server/db.ts`: (擴充) 新增了 `columnConfigs` 的預設資料。
-   所有受影響的列表頁面元件都已更新，以整合欄位設定功能。