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
-   **API 契約擴充**: `openapi.yaml` 文件中新增了 `/resources/topology` 端點的定義。
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
-   **使用者體驗**: 所有相關頁面都增加了完整的載入中與錯誤狀態的處理，提升了非同步操作的健壯性。

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
        -   `DashboardEditModal`: 從 `GET /dashboards/options` 獲取儀表板類別和擁有者列表。
        -   `InviteUserModal`: 從 `GET /iam/roles` 和 `GET /iam/teams` 分別獲取角色和團隊列表。
        -   `NotificationStrategyEditModal`: 從 `GET /settings/tags` 獲取觸發條件的可用標籤鍵。
        -   `UnifiedSearchModal` (資源篩選): 從 `GET /resources/options` 獲取篩選條件的選項。


-   **列表頁篩選器 (`List Page Filters`)**:
    -   `DashboardListPage`: 頁面頂部的「類別」篩選按鈕，現在基於 `GET /dashboards/options` 的回應動態生成。

### 5.3 新增的 API 端點

-   `GET /resources/options`: (新增) 集中提供資源相關的所有可選項（類型、提供商、區域、擁有者），優化前端請求效率。
-   `GET /dashboards/options`: (新增) 提供儀表板相關的可選項（類別、擁有者）。
-   `GET /resources/{resource_id}/metrics`: (新增) 提供特定資源的歷史指標數據。
-   (重用) `GET /iam/teams`, `GET /iam/roles`, `GET /settings/tags` 等現有端點被更廣泛地用於填充各類表單選項。

---

## 6. 功能: 互動式儀表板與功能測試 (Interactive Dashboards & Functional Testing)

-   **模組**: 儀表板、分析中心、告警規則
-   **版本**: v2.5
-   **狀態**: ✅ 已完成

### 6.1 使用者故事

**身為** 一名 SRE，
**我想要** 看到我核心儀表板（如「SRE 戰情室」、「分析總覽」）上的數據是即時從後端獲取的，並且能夠用一個模擬後端來測試我新建立的告警規則，
**使得** 我可以完全信任平台所呈現的數據來進行日常維運，並在部署告警規則前有信心它能如預期般運作。

### 6.2 行為變更

-   **SRE 戰情室 (`SREWarRoomPage`)**:
    -   **動態圖表**: 頁面中的「服務健康度總覽」和「資源群組狀態」圖表，現在會在載入時分別向 `GET /dashboards/sre-war-room/service-health` 和 `GET /dashboards/sre-war-room/resource-group-status` 端點請求數據，取代了原有的前端靜態資料。
    -   **使用者體驗**: 圖表在數據載入期間會顯示骨架 (Skeleton) 載入動畫，並在 API 請求失敗時顯示清晰的錯誤提示與重試按鈕。

-   **分析總覽 (`AnalysisOverviewPage`)**:
    -   **統一數據源**: 頁面上的所有元件，包括「系統健康評分圖」、「事件關聯分析圖」以及「最近日誌列表」，現在都從一個統一的 `GET /analysis/overview` 端點獲取數據，確保了數據的一致性。
    -   **使用者體驗**: 與戰情室類似，所有元件都增加了載入中和錯誤狀態的處理。

-   **告警規則測試 (`TestRuleModal`)**:
    -   **後端驗證**: 「測試規則」模態框中的「執行測試」按鈕，現在會將使用者輸入的測試 Payload 發送到後端的 `POST /alert-rules/{rule_id}/test` 端點。
    -   **真實回饋**: 後端會模擬規則的評估邏輯，並回傳一個結構化的 JSON 物件，明確指出條件是否匹配，並提供一個基於規則模板生成的事件預覽。這取代了原有的純前端模擬邏輯，提供了更真實的測試體驗。

### 6.3 新增的 API 端點

-   `GET /dashboards/sre-war-room/service-health`: (新增) 提供 SRE 戰情室「服務健康度」熱圖的數據。
-   `GET /dashboards/sre-war-room/resource-group-status`: (新增) 提供 SRE 戰情室「資源群組狀態」長條圖的數據。
-   `GET /analysis/overview`: (新增) 提供分析總覽頁所需的所有聚合數據。
-   `POST /alert-rules/{rule_id}/test`: (新增) 接收一個測試用的 Payload，模擬對特定告警規則的評估，並回傳評估結果。