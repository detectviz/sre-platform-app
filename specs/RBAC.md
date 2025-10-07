# 角色為基礎的存取控制 (RBAC)

**目標**：建立一個清晰、可擴展的前端權限控制模型，讓 UI 能動態地根據使用者的權限來顯示/隱藏/禁用對應的功能。

**1. 權限的獲取與格式：**

- **權限來源**：當使用者登入後，前端應立即向後端 API (建議端點：`GET /api/v1/me/permissions`) 請求當前使用者的完整權限列表。
- **儲存方式**：此權限列表應儲存在一個全域的 React Context 中（例如 `AuthContext` 或 `UserContext`），以便在應用的任何地方都能方便地存取。
- **權限格式**：權限應以 `resource:action` 的字串格式定義，例如：
    - `incidents:read`
    - `incidents:update` (可涵蓋認領、解決、指派等多個寫入操作)
    - `users:create` (邀請)
    - `users:delete`
    - `settings:roles:write` (管理角色)
    - `settings:auth:read` (查看驗證設定)

**2. 前端權限的應用：**

- **建立 `usePermissions` Hook**:
    - 我們將建立一個自訂的 Hook：`usePermissions()`。
    - 此 Hook 將提供一個核心函式：`hasPermission(permission: string | string[]): boolean`。
    - 此函式用於檢查當前使用者是否擁有指定的單一權限或一組權限中的任一個。
- **元件級控制**:
    - 所有對應到具體操作的 UI 元件（如按鈕、連結、輸入框），都**必須**使用 `hasPermission()` 進行包裹。
    - **範例**：一個「刪除」按鈕的渲染邏輯應如下：

        ```
        const { hasPermission } = usePermissions();

        return (
          <>
            {hasPermission('incidents:delete') && (
              <Button danger>刪除事件</Button>
            )}
          </>
        );
        ```

- **頁面級/路由級控制**:
    - 對於需要特定權限才能存取的整個頁面（例如所有位於 `/settings` 下的管理頁面），我們將建立一個路由包裝元件 `<RequirePermission permission="settings:read">`。
    - 如果使用者不具備所需權限，他們將被重導向到一個標準的「權限不足」頁面，而不是看到一個空白或功能殘缺的頁面。

**3. 前後端職責劃分：**

- **前端職責**：根據從後端獲取的權限列表，動態渲染 UI，「隱藏」或「禁用」使用者無權操作的功能，以提供流暢的使用者體驗並避免不必要的 API 請求。
- **後端職責**：後端 API **必須**對每一個請求進行嚴格的權限驗證，確保即使有使用者繞過前端限制，也無法執行未經授權的操作。前端的控制是為了提升體驗，後端的驗證則是為了保障安全。

---

### 1 `incidents-list-spec.md` 中的 RBAC 需求**

**目標**：將先前標記為 `[NEEDS CLARIFICATION]` 的 RBAC 相關問題，轉化為明確、可執行的功能規格。

**1. 權限定義 (Permissions Schema):** 我建議為「事件列表」模組定義以下權限字串：

- `incidents:list:read`: 允許使用者**查看**事件列表頁面。
- `incidents:list:update`: 允許使用者**修改**事件，包括「認領」、「解決」、「重新指派」和「快速靜音」。
- `incidents:list:analyze`: 允許使用者觸發「AI 分析」功能。
- `incidents:list:export`: 允許使用者**匯出**事件資料。
- `incidents:list:import`: 允許使用者**匯入**事件資料。
- `incidents:list:config`: 允許使用者修改「欄位設定」。

**2. UI 控制邏輯 (UI Mapping):** 所有相關的 UI 元件都將使用 `usePermissions()` hook 來進行權限檢查。

- **頁面存取**：整個 `IncidentListPage` 將被 `<RequirePermission permission="incidents:list:read">` 包裹。沒有此權限的使用者將無法進入頁面。
- **工具列按鈕**：
    - 「匯入」按鈕：需要 `incidents:list:import` 權限。
    - 「匯出」按鈕：需要 `incidents:list:export` 權限。
    - 「欄位設定」按鈕：需要 `incidents:list:config` 權限。
- **批次操作按鈕**：
    - 「AI 分析」按鈕：需要 `incidents:list:analyze` 權限。
    - 「認領」、「解決」按鈕：需要 `incidents:list:update` 權限。
- **表格內行內操作**：
    - 「認領」、「重新指派」、「靜音」按鈕：均需要 `incidents:list:update` 權限。
---
### **提案：澄清 `incidents-alert-spec.md` 中的 RBAC 需求**

**目標**：為告警規則管理模組定義明確的權限，並將其對應到 UI 控制。

**1. 權限定義 (Permissions Schema):** 我建議為「告警規則」模組定義以下權限字串：

- `alert-rules:read`: 允許使用者**查看**告警規則列表。
- `alert-rules:create`: 允許使用者**建立**新的告警規則。
- `alert-rules:update`: 允許使用者**修改**現有的告警規則（包括編輯、複製、啟用/停用）。
- `alert-rules:delete`: 允許使用者**刪除**告警規則。
- `alert-rules:analyze`: 允許使用者觸發「AI 分析」功能。
- `alert-rules:config`: 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `AlertRulePage` 將被 `<RequirePermission permission="alert-rules:read">` 包裹。
- **工具列按鈕**：
    - 「新增規則」按鈕：需要 `alert-rules:create` 權限。
    - 「匯入」、「匯出」、「欄位設定」按鈕：均需要 `alert-rules:config` 權限。
- **批次操作按鈕**：
    - 「AI 分析」按鈕：需要 `alert-rules:analyze` 權限。
    - 「啟用」、「停用」按鈕：需要 `alert-rules:update` 權限。
    - 「刪除」按鈕：需要 `alert-rules:delete` 權限。
- **表格內行內操作**：
    - 「編輯」、「複製」按鈕：需要 `alert-rules:update` 權限。
    - 行內的「啟用/停用」開關：需要 `alert-rules:update` 權限。
    - 「刪除」按鈕：需要 `alert-rules:delete` 權限。
---
### **提案：澄清 `incidents-silence-spec.md` 中的 RBAC 需求**

**目標**：為靜默規則管理模組定義明確的權限，並將其對應到 UI 控制。

**1. 權限定義 (Permissions Schema):** 我建議為「靜默規則」模組定義以下權限字串：

- `silence-rules:read`: 允許使用者**查看**靜默規則列表。
- `silence-rules:create`: 允許使用者**建立**新的靜默規則。
- `silence-rules:update`: 允許使用者**修改**現有的靜默規則（包括編輯、延長、啟用/停用）。
- `silence-rules:delete`: 允許使用者**刪除**靜默規則。
- `silence-rules:analyze`: 允許使用者觸發「AI 分析」功能。
- `silence-rules:config`: 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `SilenceRulePage` 將被 `<RequirePermission permission="silence-rules:read">` 包裹。
- **工具列按鈕**：
    - 「新增規則」按鈕：需要 `silence-rules:create` 權限。
    - 「匯入」、「匯出」、「欄位設定」按鈕：均需要 `silence-rules:config` 權限。
- **批次操作按鈕**：
    - 「AI 分析」按鈕：需要 `silence-rules:analyze` 權限。
    - 「啟用」、「停用」按鈕：需要 `silence-rules:update` 權限。
    - 「刪除」按鈕：需要 `silence-rules:delete` 權限。
- **表格內行內操作**：
    - 「延長」、「編輯」按鈕：需要 `silence-rules:update` 權限。
    - 行內的「啟用/停用」開關：需要 `silence-rules:update` 權限。
    - 「刪除」按鈕：需要 `silence-rules:delete` 權限。

---

### **提案：澄清 `resources-group-spec.md` 中的 RBAC 需求**

**目標**：為資源群組管理模組定義明確的權限，並將其對應到 UI 控制。

**1. 權限定義 (Permissions Schema):** 我建議為「資源群組」模組定義以下權限字串：

- `resource-groups:read`: 允許使用者**查看**資源群組列表及其詳細資訊。
- `resource-groups:create`: 允許使用者**建立**新的資源群組。
- `resource-groups:update`: 允許使用者**修改**現有的資源群組（包括編輯名稱、描述、成員）。
- `resource-groups:delete`: 允許使用者**刪除**資源群組。
- `resource-groups:config`: 允許使用者管理頁面設定，如「欄位設定」。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `ResourceGroupPage` 將被 `<RequirePermission permission="resource-groups:read">` 包裹。
- **工具列按鈕**：
    - 「新增群組」按鈕：需要 `resource-groups:create` 權限。
    - 「欄位設定」按鈕：需要 `resource-groups:config` 權限。
- **表格內行內操作**：
    - 「檢視群組」按鈕：需要 `resource-groups:read` 權限。
    - 「編輯群組」按鈕：需要 `resource-groups:update` 權限。
    - 「刪除群組」按鈕：需要 `resource-groups:delete` 權限。

---

### **提案：澄清 `resources-list-spec.md` 中的 RBAC 需求**

**目標**：為資源列表（資產清單）模組定義明確的權限，並將其對應到 UI 控制。

**1. 權限定義 (Permissions Schema):** 我建議為「資源列表」模組定義以下權限字串：

- `resources:read`: 允許使用者**查看**資源列表及資源詳情頁面。
- `resources:create`: 允許使用者**建立**新的資源。
- `resources:update`: 允許使用者**修改**現有的資源。
- `resources:delete`: 允許使用者**刪除**資源。
- `resources:analyze`: 允許使用者觸發「AI 分析」功能。
- `resources:config`: 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `ResourceListPage` 將被 `<RequirePermission permission="resources:read">` 包裹。
- **工具列按鈕**：
    - 「新增資源」按鈕：需要 `resources:create` 權限。
    - 「匯入」、「匯出」、「欄位設定」按鈕：均需要 `resources:config` 權限。
- **批次操作按鈕**：
    - 「AI 分析」按鈕：需要 `resources:analyze` 權限。
    - 「刪除」按鈕：需要 `resources:delete` 權限。
- **表格內行內操作**：
    - 「查看詳情」按鈕：需要 `resources:read` 權限。
    - 「編輯資源」按鈕：需要 `resources:update` 權限。
    - 「刪除資源」按鈕：需要 `resources:delete` 權限。
---
### **提案：澄清 `resources-topology-spec.md` 中的 RBAC 需求**

**目標**：為資源拓撲圖模組定義明確的權限，並將其對應到 UI 控制和後端資料過濾。

**1. 權限定義 (Permissions Schema):**

- `resources:topology:read`: 允許使用者**查看**資源拓撲圖頁面。這是存取此頁面的基礎權限。

**2. UI 控制與後端資料過濾邏輯:**

- **頁面存取**：整個 `ResourceTopologyPage` 將被 `<RequirePermission permission="resources:topology:read">` 包裹。
- **資料過濾 (後端職責)**：為了實現真正的權限隔離，後端 API (`/resources/topology`) **必須**根據發起請求的使用者權限，來過濾回傳的節點（資源）和連線。例如，如果一個使用者只能看到隸屬於「團隊A」的資源，則 API 應只回傳屬於「團隊A」的資源以及它們之間的直接連線。前端只負責渲染收到的資料。
- **右鍵選單操作 (Context Menu)**：選單中每個操作的**可見性**將由其**目標模組**的權限決定。
    - 「查看資源詳情」選項：需要 `resources:read` 權限。
    - 「檢視相關事件」選項：需要 `incidents:list:read` 權限。
    - 「執行腳本」選項：需要 `automation:playbooks:execute` 權限（一個待定義的權限）。

---

### **提案：澄清 `resources-discovery-spec.md` 中的 RBAC 需求**

**目標**：為資源總覽（發現）模組定義明確的權限，並強調後端資料聚合時的權限過濾。

**1. 權限定義 (Permissions Schema):**

- `resources:discovery:read`: 允許使用者**查看**資源總覽儀表板。

**2. UI 控制與後端資料過濾邏輯:**

- **頁面存取**：整個 `ResourceOverviewPage` 將被 `<RequirePermission permission="resources:discovery:read">` 包裹。
- **資料聚合過濾 (後端核心職責)**：此頁面的所有數據都必須在後端 API (`/resources/overview`) 層級根據請求者的權限進行計算和過濾。前端只負責渲染收到的聚合結果。
    - **KPIs**：所有頂部 KPI（如總資源數、健康度）的計算範圍必須僅限於該使用者有權查看的資源。
    - **分佈圖表**：資源類型和提供商的分佈圖，其統計基礎同樣必須是該使用者可見的資源。
    - **列表卡片**：「最近發現的資源」和「需要關注的資源群組」列表，應只顯示該使用者有權查看的掃描任務或資源群組。
- **導航連結**：
    - 頁面上的所有導航連結（如「查看資源列表」、「查看掃描任務」）的目標頁面，將由其自身的頁面級權限進行存取控制。例如，點擊「查看資源列表」後，使用者仍需具備 `resources:read` 權限才能看到列表。
---
### **提案：澄清 `resources-datasource-spec.md` 中的 RBAC 需求**

**目標**：為資料來源管理模組定義明確的權限，並將其對應到 UI 控制。管理資料來源是敏感操作，因為它直接關係到平台與外部系統的連接。

**1. 權限定義 (Permissions Schema):**

- `datasources:read`: 允許使用者**查看**已設定的資料來源列表。
- `datasources:create`: 允許使用者**建立**新的資料來源。
- `datasources:update`: 允許使用者**修改**現有資料來源的設定。
- `datasources:delete`: 允許使用者**刪除**資料來源。
- `datasources:test`: 允許使用者觸發「連線測試」。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `DatasourceManagementPage` 將被 `<RequirePermission permission="datasources:read">` 包裹。
- **工具列按鈕**：
    - 「新增資料來源」按鈕：需要 `datasources:create` 權限。
- **表格內行內操作**：
    - 「編輯」按鈕：需要 `datasources:update` 權限。
    - 「刪除」按鈕：需要 `datasources:delete` 權限。
    - (建議新增)「測試連線」按鈕：需要 `datasources:test` 權限。
- **編輯模態框**：
    - 儲存操作：在新增時需要 `datasources:create` 權限，在編輯時需要 `datasources:update` 權限。
---
### **提案：澄清 `resources-auto-discovery-spec.md` 中的 RBAC 需求**

**目標**：為自動發現任務管理模組定義明確的權限，並將其對應到 UI 控制。管理和執行掃描任務是高權限操作。

**1. 權限定義 (Permissions Schema):** 我建議為「自動發現」模組定義以下權限字串：

- `auto-discovery:read`: 允許使用者**查看**自動發現任務列表。
- `auto-discovery:create`: 允許使用者**建立**新的掃描任務。
- `auto-discovery:update`: 允許使用者**修改**現有掃描任務的設定。
- `auto-discovery:delete`: 允許使用者**刪除**掃描任務。
- `auto-discovery:execute`: 允許使用者**手動執行**一個掃描任務。
- `auto-discovery:results:read`: 允許使用者**查看**掃描任務的執行結果。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `AutoDiscoveryPage` 將被 `<RequirePermission permission="auto-discovery:read">` 包裹。
- **工具列按鈕**：
    - 「新增掃描」按鈕：需要 `auto-discovery:create` 權限。
- **表格內行內操作**：
    - 「查看結果」按鈕：需要 `auto-discovery:results:read` 權限。
    - 「手動執行」按鈕：需要 `auto-discovery:execute` 權限。
    - 「編輯掃描」按鈕：需要 `auto-discovery:update` 權限。
    - 「刪除掃描」按鈕：需要 `auto-discovery:delete` 權限。
----
### **提案：澄清 `dashboards-list-spec.md` 中的 RBAC 需求**

**目標**：為儀表板列表模組定義明確的權限，並將其對應到 UI 控制。

**1. 權限定義 (Permissions Schema):** 我建議為「儀表板列表」模組定義以下權限字串：

- `dashboards:list:read`: 允許使用者**查看**儀表板列表。
- `dashboards:create`: 允許使用者**建立**新的儀表板。
- `dashboards:update`: 允許使用者**修改**儀表板的元數據（如名稱、描述）。
- `dashboards:delete`: 允許使用者**刪除**自訂儀表板。
- `dashboards:config`: 允許使用者管理頁面設定，如「欄位設定」、「匯入」、「匯出」。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `DashboardListPage` 將被 `<RequirePermission permission="dashboards:list:read">` 包裹。
- **工具列按鈕**：
    - 「新增儀表板」按鈕：需要 `dashboards:create` 權限。
    - 「匯入」、「匯出」、「欄位設定」按鈕：均需要 `dashboards:config` 權限。
- **批次操作按鈕**：
    - 「刪除」按鈕：需要 `dashboards:delete` 權限。
- **表格內行內操作**：
    - 「設為首頁」按鈕：此為個人化功能，任何具備 `dashboards:list:read` 權限的使用者都應可以為自己設定首頁，**無需**額外權限。
    - 「編輯」按鈕：需要 `dashboards:update` 權限。
    - 「刪除」按鈕：需要 `dashboards:delete` 權限。系統應在後端額外檢查，防止使用者刪除內建的（built-in）儀表板。
---
### **提案：澄清 `dashboards-template-spec.md` 中的 RBAC 需求**

**目標**：為儀表板範本模組定義明確的權限。此頁面主要為展示性質，核心操作是引導使用者去建立新的儀表板。

**1. 權限定義 (Permissions Schema):** 我建議為「儀表板範本」模組定義以下單一權限：

- `dashboards:templates:read`: 允許使用者**查看**儀表板範本庫頁面。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `DashboardTemplatesPage` 將被 `<RequirePermission permission="dashboards:templates:read">` 包裹。
- **「使用此範本」按鈕**：
    - 此按鈕的**可見性**應與頁面可見性一致，即擁有 `dashboards:templates:read` 權限即可看見。
    - 點擊此按鈕會導航至「新增儀表板」的流程。該流程的**最終成功與否**將由 `dashboards:create` 權限來控制。這確保了職責分離：能看範本不代表一定能用範本建立儀表板。
---
### **提案：澄清 `insights-backtesting-spec.md` 中的 RBAC 需求**

**目標**：為回測分析模組定義明確的權限，區分查看權限與執行權限。

**1. 權限定義 (Permissions Schema):** 我建議為「回測分析」模組定義以下權限字串：

- `insights:backtesting:read`: 允許使用者**查看**回測分析頁面，包括選擇規則和時間範圍的介面。
- `insights:backtesting:execute`: 允許使用者**執行**回測任務。這是一個高權限操作，因為它會消耗大量計算資源。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `BacktestingPage` 將被 `<RequirePermission permission="insights:backtesting:read">` 包裹。
- **「開始回放」按鈕**：此按鈕將被 `hasPermission('insights:backtesting:execute')` 檢查。沒有此權限的使用者將看到一個被禁用的按鈕，或按鈕根本不顯示。這確保了只有授權使用者才能觸發昂貴的後端計算任務。
- **查看歷史結果**：[NEEDS CLARIFICATION] 查看過去的回測結果是否也需要 `insights:backtesting:read` 權限？我建議是的，但這需要後端 API 在回傳結果列表時進行權限過濾。
---
### **提案：澄清 `insights-capacity-spec.md` 中的 RBAC 需求**

**目標**：為容量規劃模組定義明確的權限，區分查看敏感數據和觸發重分析的操作。

**1. 權限定義 (Permissions Schema):** 我建議為「容量規劃」模組定義以下權限字串：

- `insights:capacity:read`: 允許使用者**查看**容量規劃頁面，包括趨勢圖、預測模型和 AI 建議。
- `insights:capacity:execute`: 允許使用者點擊「觸發 AI 分析」按鈕，這會消耗計算資源並產生新的報告。
- `insights:capacity:export`: 允許使用者**匯出**包含成本影響等潛在敏感資訊的詳細分析報告。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `CapacityPlanningPage` 將被 `<RequirePermission permission="insights:capacity:read">` 包裹。
- **工具列按鈕**：
    - 「觸發 AI 分析」按鈕：需要 `insights:capacity:execute` 權限。
    - 「匯出報表」按鈕：需要 `insights:capacity:export` 權限。
---
### **提案：澄清 `insights-log-spec.md` 中的 RBAC 需求**

**目標**：為日誌探索模組定義明確的權限，並強調後端應根據使用者權限過濾可見的日誌來源。

**1. 權限定義 (Permissions Schema):** 我建議為「日誌探索」模組定義以下權限字串：

- `logs:read`: 允許使用者**查看**日誌探索頁面並執行查詢。
- `logs:analyze`: 允許使用者觸發「AI 總結」功能。
- `logs:export`: 允許使用者**匯出**日誌資料。

**2. UI 控制與後端資料過濾邏輯:**

- **頁面存取**：整個 `LogExplorerPage` 將被 `<RequirePermission permission="logs:read">` 包裹。
- **資料過濾 (後端核心職責)**：後端 API (`/logs`) **必須**根據發起請求的使用者權限，來過濾其可查詢的日誌範圍。例如，一個使用者可能只能看到特定服務或命名空間的日誌。前端只負責渲染後端回傳的結果。
- **工具列按鈕**：
    - 「AI 總結」按鈕：需要 `logs:analyze` 權限。
    - 「匯出報表」按鈕：需要 `logs:export` 權限。

---

### **提案：澄清 `automation-playbook-spec.md` 中的 RBAC 需求**

**目標**：為自動化腳本（Playbook）管理模組定義明確的權限，嚴格區分管理權限與執行權限。

**1. 權限定義 (Permissions Schema):** 我建議為「自動化腳本」模組定義以下權限字串：

- `automation:playbooks:read`: 允許使用者**查看**自動化腳本列表。
- `automation:playbooks:create`: 允許使用者**建立**新的腳本。
- `automation:playbooks:update`: 允許使用者**修改**現有腳本的定義（如名稱、描述、內容）。
- `automation:playbooks:delete`: 允許使用者**刪除**腳本。
- `automation:playbooks:execute`: 允許使用者**手動執行**一個腳本。這應被視為一個獨立的高風險權限。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `AutomationPlaybooksPage` 將被 `<RequirePermission permission="automation:playbooks:read">` 包裹。
- **工具列按鈕**：
    - 「新增腳本」按鈕：需要 `automation:playbooks:create` 權限。
- **批次操作按鈕**：
    - 「刪除」按鈕：需要 `automation:playbooks:delete` 權限。
- **表格內行內操作**：
    - 「執行腳本」按鈕：需要 `automation:playbooks:execute` 權限。
    - 「編輯腳本」按鈕：需要 `automation:playbooks:update` 權限。
    - 「刪除腳本」按鈕：需要 `automation:playbooks:delete` 權限。
---

### **提案：澄清 `automation-trigger-spec.md` 中的 RBAC 需求**

**目標**：為自動化觸發器管理模組定義明確的權限。管理觸發器意味著控制自動化流程的啟動條件，屬於高風險操作。

**1. 權限定義 (Permissions Schema):** 我建議為「自動化觸發器」模組定義以下權限字串：

- `automation:triggers:read`: 允許使用者**查看**觸發器列表。
- `automation:triggers:create`: 允許使用者**建立**新的觸發器。
- `automation:triggers:update`: 允許使用者**修改**現有觸發器的設定（包括啟用/停用）。
- `automation:triggers:delete`: 允許使用者**刪除**觸發器。

**2. UI 控制邏輯 (UI Mapping):**

- **頁面存取**：整個 `AutomationTriggersPage` 將被 `<RequirePermission permission="automation:triggers:read">` 包裹。
- **工具列按鈕**：
    - 「新增觸發器」按鈕：需要 `automation:triggers:create` 權限。
- **批次操作按鈕**：
    - 「啟用」、「停用」按鈕：需要 `automation:triggers:update` 權限。
    - 「刪除」按鈕：需要 `automation:triggers:delete` 權限。
- **表格內行內操作**：
    - 行內的「啟用/停用」開關：需要 `automation:triggers:update` 權限。
    - 「編輯觸發器」按鈕：需要 `automation:triggers:update` 權限。
    - 「刪除觸發器」按鈕：需要 `automation:triggers:delete` 權限。
---
### **提案：澄清 `automation-history-spec.md` 中的 RBAC 需求**

**目標**：為自動化執行歷史模組定義明確的權限，並強調後端應根據使用者權限過濾可見的歷史紀錄。

**1. 權限定義 (Permissions Schema):** 我建議為「自動化執行歷史」模組定義以下權限字串：

- `automation:history:read`: 允許使用者**查看**執行歷史列表和單次執行的詳細日誌。
- `automation:history:retry`: 允許使用者**重試**一個執行失敗的任務。
- `automation:history:export`: 允許使用者**匯出**執行歷史資料。

**2. UI 控制與後端資料過濾邏輯:**

- **頁面存取**：整個 `AutomationHistoryPage` 將被 `<RequirePermission permission="automation:history:read">` 包裹。
- **資料過濾 (後端核心職責)**：後端 API (`/automation/executions`) **必須**根據發起請求的使用者權限，來過濾其可見的執行歷史。例如，一個使用者可能只能看到由他自己或他所在團隊觸發的執行紀錄，或者只能看到他們有權限查看的腳本的執行紀錄。
- **表格內行內操作**：
    - 點擊查看詳情（打開抽屜）：需要 `automation:history:read` 權限。
    - 「重試」按鈕：需要 `automation:history:retry` 權限。
- **工具列按鈕**：
    - 「匯出」按鈕：需要 `automation:history:export` 權限。
---


### **1. `identity-personnel` (人員管理)**

- **權限定義**:
    - `users:read`: 查看人員列表與詳情。
    - `users:create`: 邀請新成員。
    - `users:update`: 修改使用者資訊（角色、團隊、狀態）。
    - `users:delete`: 刪除使用者。
    - `users:config`: 匯入/匯出、欄位設定。
- **UI 控制**:
    - 頁面存取: `users:read`
    - 「邀請人員」按鈕: `users:create`
    - 「編輯」按鈕: `users:update`
    - 「刪除」按鈕: `users:delete`
    - 批次停用: `users:update`
    - 批次刪除: `users:delete`

### **2. `identity-role` (角色管理)**

- **權限定義**:
    - `roles:read`: 查看角色列表。
    - `roles:create`: 建立新角色。
    - `roles:update`: 修改角色（名稱、權限、啟用狀態）。
    - `roles:delete`: 刪除角色。
- **UI 控制**:
    - 頁面存取: `roles:read`
    - 「新增角色」按鈕: `roles:create`
    - 「編輯」、「啟用/停用」按鈕: `roles:update`
    - 「刪除」按鈕: `roles:delete`

### **3. `identity-team` (團隊管理)**

- **權限定義**:
    - `teams:read`: 查看團隊列表與詳情。
    - `teams:create`: 建立新團隊。
    - `teams:update`: 修改團隊（名稱、成員、擁有者）。
    - `teams:delete`: 刪除團隊。
- **UI 控制**:
    - 頁面存取: `teams:read`
    - 「新增團隊」按鈕: `teams:create`
    - 「編輯」、「變更擁有者」按鈕: `teams:update`
    - 「刪除」按鈕: `teams:delete`

### **4. `identity-audit` (審計日誌)**

- **權限定義**:
    - `audit-logs:read`: 查看審計日誌。
    - `audit-logs:export`: 匯出審計日誌。
- **UI 控制**:
    - 頁面存取: `audit-logs:read`
    - 「匯出」按鈕: `audit-logs:export`
    - **後端職責**: API 必須根據使用者權限過濾可見的日誌範圍。

---


### **1. `notification-channel` (通知管道)**

- **權限定義**:
    - `notification-channels:read`: 查看管道。
    - `notification-channels:create`: 建立管道。
    - `notification-channels:update`: 修改管道。
    - `notification-channels:delete`: 刪除管道。
    - `notification-channels:test`: 測試管道連線。
- **UI 控制**:
    - 頁面存取: `notification-channels:read`
    - 「新增」按鈕: `notification-channels:create`
    - 「編輯」、「啟用/停用」按鈕: `notification-channels:update`
    - 「刪除」按鈕: `notification-channels:delete`
    - 「測試」按鈕: `notification-channels:test`

### **2. `notification-strategy` (通知策略)**

- **權限定義**:
    - `notification-strategies:read`: 查看策略。
    - `notification-strategies:create`: 建立策略。
    - `notification-strategies:update`: 修改策略。
    - `notification-strategies:delete`: 刪除策略。
- **UI 控制**:
    - 頁面存取: `notification-strategies:read`
    - 「新增」按鈕: `notification-strategies:create`
    - 「編輯」、「啟用/停用」按鈕: `notification-strategies:update`
    - 「刪除」按鈕: `notification-strategies:delete`

### **3. `notification-history` (通知歷史)**

- **權限定義**:
    - `notification-history:read`: 查看通知歷史。
    - `notification-history:resend`: 重新發送失敗的通知。
- **UI 控制**:
    - 頁面存取: `notification-history:read`
    - 「重新發送」按鈕: `notification-history:resend`
    - **後端職責**: API 必須根據使用者權限過濾可見的歷史紀錄。

---

### **1. `platform-auth` (身份驗證設定)**

- **權限定義**:
    - `settings:auth:read`: 查看身份驗證設定頁面（高權限唯讀）。
- **UI 控制**: 頁面存取。

### **2. `platform-grafana` (Grafana 整合)**

- **權限定義**:
    - `settings:grafana:read`: 查看 Grafana 設定。
    - `settings:grafana:update`: 修改並儲存 Grafana 設定。
    - `settings:grafana:test`: 測試 Grafana 連線。
- **UI 控制**:
    - 頁面存取: `settings:grafana:read`
    - 「儲存變更」按鈕: `settings:grafana:update`
    - 「測試連線」按鈕: `settings:grafana:test`

### **3. `platform-mail` (郵件伺服器設定)**

- **權限定義**:
    - `settings:mail:read`: 查看郵件設定。
    - `settings:mail:update`: 修改並儲存郵件設定。
    - `settings:mail:test`: 發送測試郵件。
- **UI 控制**:
    - 頁面存取: `settings:mail:read`
    - 「儲存變更」按鈕: `settings:mail:update`
    - 「發送測試郵件」按鈕: `settings:mail:test`

### **4. `platform-tag` (標籤治理)**

- **權限定義**:
    - `tags:read`: 查看標籤定義。
    - `tags:create`: 建立新的標籤定義。
    - `tags:update`: 修改標籤定義（包括其允許值）。
    - `tags:delete`: 刪除標籤定義。
- **UI 控制**:
    - 頁面存取: `tags:read`
    - 「新增」按鈕: `tags:create`
    - 「編輯」、「管理標籤值」按鈕: `tags:update`
    - 「刪除」按鈕: `tags:delete`

### **5. `platform-layout` (版面配置)**

- **權限定義**:
    - `settings:layout:read`: 查看版面配置頁面。
    - `settings:layout:update`: 修改並儲存所有頁面的版面配置。
- **UI 控制**:
    - 頁面存取: `settings:layout:read`
    - 「編輯版面」及模態框中的「儲存」按鈕: `settings:layout:update`

### **6. `platform-license` (授權管理)**

- **權限定義**:
    - `settings:license:read`: 查看授權資訊頁面。
- **UI 控制**: 頁面存取。

---

### **1. `profile-info` (個人資訊)**

- **權限定義**: 無需特定權限字串，任何登入使用者均可查看自己的資訊。
- **UI 控制**: 頁面存取由登入狀態決定。

### **2. `profile-preference` (個人偏好設定)**

- **權限定義**:
    - `profile:preferences:read`: 查看自己的偏好設定。
    - `profile:preferences:update`: 修改並儲存自己的偏好設定。
- **UI 控制**:
    - 頁面存取: `profile:preferences:read` (或僅限登入使用者)
    - 「儲存設定」、「重置為預設」按鈕: `profile:preferences:update`

### **3. `profile-security` (安全設定)**

- **權限定義**:
    - `profile:security:read`: 查看自己的安全設定和登入歷史。
    - `profile:security:change-password`: 變更自己的密碼。
    - `profile:security:revoke-sessions`: 登出其他裝置。
- **UI 控制**:
    - 頁面存取: `profile:security:read` (或僅限登入使用者)
    - 「更新密碼」按鈕: `profile:security:change-password`
    - 「登出其他裝置」按鈕: `profile:security:revoke-sessions`