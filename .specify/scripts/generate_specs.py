#!/usr/bin/env python3
"""
自動生成 SRE 平台規格文件
根據程式碼逆向產生完整的規格文件體系
"""

import os
import json
from datetime import datetime
from pathlib import Path

# 模組對應表 - 33個模組及其對應的頁面檔案
MODULE_MAPPING = {
    # Incidents (3)
    "incidents-list": "pages/incidents/IncidentListPage.tsx",
    "incidents-alert": "pages/incidents/AlertRulePage.tsx",
    "incidents-silence": "pages/incidents/SilenceRulePage.tsx",

    # Resources (6)
    "resources-group": "pages/resources/ResourceGroupPage.tsx",
    "resources-list": "pages/resources/ResourceListPage.tsx",
    "resources-topology": "pages/resources/ResourceTopologyPage.tsx",
    "resources-discovery": "pages/resources/ResourceOverviewPage.tsx",  # Discovery功能在Overview中
    "resources-datasource": "pages/resources/DatasourceManagementPage.tsx",
    "resources-auto-discovery": "pages/resources/AutoDiscoveryPage.tsx",

    # Dashboards (2)
    "dashboards-list": "pages/dashboards/DashboardListPage.tsx",
    "dashboards-template": "pages/dashboards/DashboardTemplatesPage.tsx",

    # Insights (3)
    "insights-backtesting": "pages/analysis/BacktestingPage.tsx",
    "insights-capacity": "pages/analysis/CapacityPlanningPage.tsx",
    "insights-log": "pages/analysis/LogExplorerPage.tsx",

    # Automation (3)
    "automation-playbook": "pages/automation/AutomationPlaybooksPage.tsx",
    "automation-trigger": "pages/automation/AutomationTriggersPage.tsx",
    "automation-history": "pages/automation/AutomationHistoryPage.tsx",

    # Identity (4)
    "identity-personnel": "pages/settings/identity-access/PersonnelManagementPage.tsx",
    "identity-role": "pages/settings/identity-access/RoleManagementPage.tsx",
    "identity-team": "pages/settings/identity-access/TeamManagementPage.tsx",
    "identity-audit": "pages/settings/identity-access/AuditLogsPage.tsx",

    # Notifications (3)
    "notification-channel": "pages/settings/notification-management/NotificationChannelPage.tsx",
    "notification-strategy": "pages/settings/notification-management/NotificationStrategyPage.tsx",
    "notification-history": "pages/settings/notification-management/NotificationHistoryPage.tsx",

    # Platform (6)
    "platform-auth": "pages/settings/platform/AuthSettingsPage.tsx",
    "platform-grafana": "pages/settings/platform/GrafanaSettingsPage.tsx",
    "platform-mail": "pages/settings/platform/MailSettingsPage.tsx",
    "platform-tag": "pages/settings/platform/TagManagementPage.tsx",
    "platform-layout": "pages/settings/platform/LayoutSettingsPage.tsx",
    "platform-license": "pages/settings/platform/LicensePage.tsx",

    # Profile (3)
    "profile-info": "pages/profile/PersonalInfoPage.tsx",
    "profile-preference": "pages/profile/PreferenceSettingsPage.tsx",
    "profile-security": "pages/profile/SecuritySettingsPage.tsx",
}

# 模組中文名稱對應
MODULE_NAMES = {
    "incidents-list": "事件列表管理",
    "incidents-alert": "告警規則管理",
    "incidents-silence": "靜音規則管理",
    "resources-group": "資源群組管理",
    "resources-list": "資源列表管理",
    "resources-topology": "資源拓撲圖",
    "resources-discovery": "資源探索",
    "resources-datasource": "資料源管理",
    "resources-auto-discovery": "自動發現配置",
    "dashboards-list": "儀表板列表",
    "dashboards-template": "儀表板範本",
    "insights-backtesting": "回測分析",
    "insights-capacity": "容量規劃",
    "insights-log": "日誌探索",
    "automation-playbook": "自動化劇本",
    "automation-trigger": "觸發器管理",
    "automation-history": "執行歷史",
    "identity-personnel": "人員管理",
    "identity-role": "角色管理",
    "identity-team": "團隊管理",
    "identity-audit": "審計日誌",
    "notification-channel": "通知渠道",
    "notification-strategy": "通知策略",
    "notification-history": "通知歷史",
    "platform-auth": "身份驗證設定",
    "platform-grafana": "Grafana 整合",
    "platform-mail": "郵件設定",
    "platform-tag": "標籤管理",
    "platform-layout": "版面設定",
    "platform-license": "授權管理",
    "profile-info": "個人資訊",
    "profile-preference": "偏好設定",
    "profile-security": "安全設定",
}

def generate_spec_content(module_id: str, module_name: str, source_path: str) -> str:
    """根據模板生成規格文件內容"""
    today = datetime.now().strftime("%Y-%m-%d")

    # 基於模組類型定義不同的使用者故事和需求
    specs = get_module_specs(module_id, module_name)

    return f"""# 功能規格書(Feature Specification)

**模組名稱 (Module)**: {module_name}
**類型 (Type)**: Module
**來源路徑 (Source Path)**: {source_path}
**建立日期 (Created)**: {today}
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、主要使用者情境(User Scenarios & Testing)

### 主要使用者故事(Primary User Story)
{specs['user_story']}

### 驗收情境(Acceptance Scenarios)
{specs['acceptance_scenarios']}

### 邊界案例(Edge Cases)
{specs['edge_cases']}

---

## 二、功能需求(Functional Requirements)

{specs['functional_requirements']}

---

## 三、關鍵資料實體(Key Entities)
{specs['key_entities']}

---

## 四、觀測性與治理檢查(Observability & Governance Checklist)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 記錄與追蹤 (Logging/Tracing) | {specs['observability']['logging']} | {specs['observability']['logging_desc']} |
| 指標與告警 (Metrics & Alerts) | {specs['observability']['metrics']} | {specs['observability']['metrics_desc']} |
| RBAC 權限與審計 | {specs['observability']['rbac']} | {specs['observability']['rbac_desc']} |
| i18n 文案 | {specs['observability']['i18n']} | {specs['observability']['i18n_desc']} |
| Theme Token 使用 | {specs['observability']['theme']} | {specs['observability']['theme_desc']} |

---

## 五、審查與驗收清單(Review & Acceptance Checklist)

- [ ] 無技術實作語句。
- [ ] 所有必填段落皆存在。
- [ ] 所有 FR 可測試且明確。
- [ ] 無未標註的模糊需求。
- [ ] 符合 `.specify/memory/constitution.md`。

---

## 六、模糊與待確認事項(Clarifications)

{specs['clarifications']}
"""

def get_module_specs(module_id: str, module_name: str) -> dict:
    """根據模組ID返回對應的規格內容"""

    # 根據不同模組類型生成對應內容
    if module_id.startswith("incidents"):
        return get_incidents_specs(module_id, module_name)
    elif module_id.startswith("resources"):
        return get_resources_specs(module_id, module_name)
    elif module_id.startswith("dashboards"):
        return get_dashboards_specs(module_id, module_name)
    elif module_id.startswith("insights"):
        return get_insights_specs(module_id, module_name)
    elif module_id.startswith("automation"):
        return get_automation_specs(module_id, module_name)
    elif module_id.startswith("identity"):
        return get_identity_specs(module_id, module_name)
    elif module_id.startswith("notification"):
        return get_notification_specs(module_id, module_name)
    elif module_id.startswith("platform"):
        return get_platform_specs(module_id, module_name)
    elif module_id.startswith("profile"):
        return get_profile_specs(module_id, module_name)
    else:
        return get_default_specs(module_id, module_name)

def get_incidents_specs(module_id: str, module_name: str) -> dict:
    """事件管理類別規格"""
    if "list" in module_id:
        return {
            'user_story': """SRE 工程師需要查看、篩選、管理系統事件，以快速定位問題並進行處置。支援批次操作、AI 分析、認領指派等功能。""",
            'acceptance_scenarios': """1. **Given** 使用者進入事件列表頁面，**When** 系統載入事件資料，**Then** 應顯示包含狀態、嚴重性、影響範圍、負責人等資訊的表格
2. **Given** 使用者選擇一個或多個事件，**When** 點擊「認領」按鈕，**Then** 系統應將事件指派給當前使用者並更新狀態
3. **Given** 使用者選擇多個事件，**When** 點擊「AI 分析」，**Then** 系統應生成包含根因分析和建議的報告""",
            'edge_cases': """- 當事件數量超過 1000 筆時，系統應使用分頁或虛擬滾動以保持效能
- 當事件已被其他使用者認領時,應顯示衝突提示並拒絕重複認領
- 當 API 回傳錯誤時,應顯示友善錯誤訊息並提供重試選項""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援依狀態、嚴重性、時間範圍、負責人等條件篩選事件。
- **FR-002**: 系統必須(MUST)支援批次認領、解決、靜音操作,且需記錄操作者與時間戳記。
- **FR-003**: 系統必須(MUST)提供事件詳情抽屜,顯示完整資訊、時間線、關聯資源。
- **FR-004**: 系統應該(SHOULD)支援欄位自訂顯示與排序,並儲存使用者偏好。
- **FR-005**: 系統應該(SHOULD)整合 AI 分析功能,提供多事件關聯分析與根因推斷。
- **FR-006**: 系統必須(MUST)支援 CSV 匯入匯出,含欄位驗證與錯誤回報。
- **FR-007**: 系統可以(MAY)提供事件趨勢圖表,協助識別異常模式。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Incident | 事件實體,包含狀態、嚴重性、影響、負責人等屬性 | 關聯 AlertRule, Resource, User |
| AlertRule | 觸發事件的告警規則 | 被 Incident 參照 |
| User | 事件負責人或操作者 | 與 Incident 多對多關聯 |
| SilenceRule | 靜音規則,可抑制特定事件 | 透過 matcher 關聯 Incident |""",
            'observability': {
                'logging': '✅', 'logging_desc': '記錄所有事件狀態變更、批次操作、AI 分析請求',
                'metrics': '✅', 'metrics_desc': '追蹤事件數量、處理時長、認領率等指標',
                'rbac': '✅', 'rbac_desc': '依角色控制查看、編輯、刪除權限,審計所有操作',
                'i18n': '✅', 'i18n_desc': '所有文案透過 useContent 存取,無硬編碼',
                'theme': '✅', 'theme_desc': '狀態標籤、圖示使用 Theme Token 與語義色'
            },
            'clarifications': """- [NEEDS CLARIFICATION: 事件自動關閉策略 - 解決後多久自動歸檔？]
- [NEEDS CLARIFICATION: AI 分析的回應時間 SLA 與逾時處理機制]
- [NEEDS CLARIFICATION: 批次操作的數量上限與並行處理策略]"""
        }
    elif "alert" in module_id:
        return {
            'user_story': """SRE 工程師需要建立、編輯、管理告警規則,以主動監控系統狀態並在異常時觸發事件。""",
            'acceptance_scenarios': """1. **Given** 使用者點擊「新增規則」,**When** 填寫規則條件與動作,**Then** 系統應驗證並儲存規則
2. **Given** 使用者選擇多條規則,**When** 點擊「AI 分析」,**Then** 系統應評估規則重疊性與優化建議
3. **Given** 規則被觸發,**When** 條件持續滿足,**Then** 系統應依設定頻率發送告警""",
            'edge_cases': """- 當規則條件互相衝突時,應標記並提示使用者
- 當目標資源不存在時,應在規則列表中顯示警告狀態
- 當規則觸發頻率過高時,應自動啟用抑制機制""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援基於資源、指標、閾值、時間窗口的條件組合。
- **FR-002**: 系統必須(MUST)支援規則啟用/停用切換,並記錄變更歷史。
- **FR-003**: 系統應該(SHOULD)提供規則測試功能,模擬觸發場景。
- **FR-004**: 系統應該(SHOULD)支援規則複製,加速相似規則建立。
- **FR-005**: 系統必須(MUST)整合自動化劇本,觸發時可執行預定義動作。
- **FR-006**: 系統可以(MAY)提供規則範本庫,快速套用常見監控場景。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| AlertRule | 告警規則,定義觸發條件與動作 | 產生 Incident |
| Condition | 規則條件,支援多條件組合 | 屬於 AlertRule |
| AutomationPlaybook | 觸發時執行的自動化劇本 | 可被 AlertRule 綁定 |""",
            'observability': {
                'logging': '✅', 'logging_desc': '記錄規則建立、修改、刪除、觸發事件',
                'metrics': '✅', 'metrics_desc': '追蹤規則觸發次數、成功率、執行耗時',
                'rbac': '✅', 'rbac_desc': '區分規則建立、編輯、刪除權限,審計所有變更',
                'i18n': '✅', 'i18n_desc': '規則名稱、描述支援多語言',
                'theme': '✅', 'theme_desc': '嚴重性標籤使用語義色彩'
            },
            'clarifications': """- [NEEDS CLARIFICATION: 規則優先級機制與衝突解決策略]
- [NEEDS CLARIFICATION: 規則觸發後的冷卻時間(cooldown)設定]"""
        }
    else:  # silence
        return {
            'user_story': """SRE 工程師需要建立靜音規則,在維護期間或已知問題期間抑制特定告警,避免噪音干擾。""",
            'acceptance_scenarios': """1. **Given** 使用者建立單次靜音規則,**When** 設定時間範圍與匹配條件,**Then** 系統應在該時段內抑制符合條件的告警
2. **Given** 使用者建立週期性靜音規則,**When** 設定 cron 表達式,**Then** 系統應按週期自動啟用/停用靜音
3. **Given** 靜音規則即將到期,**When** 使用者點擊「延長」,**Then** 系統應允許延長時間或修改排程""",
            'edge_cases': """- 當靜音規則過期後,應自動停用並歸檔
- 當多個靜音規則匹配同一告警時,應依優先級或建立時間決定
- 當靜音規則數量過多時,應提供批次管理與清理功能""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援單次與週期性兩種靜音類型。
- **FR-002**: 系統必須(MUST)提供靜音規則延長功能,支援預設時長與自訂時長。
- **FR-003**: 系統應該(SHOULD)支援基於標籤、資源、規則名稱的靈活匹配條件。
- **FR-004**: 系統必須(MUST)記錄靜音規則的建立者、建立時間、修改歷史。
- **FR-005**: 系統應該(SHOULD)在靜音即將到期時發送提醒通知。
- **FR-006**: 系統可以(MAY)提供靜音規則效果分析,統計抑制的告警數量。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| SilenceRule | 靜音規則,定義抑制條件與時間範圍 | 匹配 Incident 或 AlertRule |
| Matcher | 匹配條件,支援等於、包含、正則表達式 | 屬於 SilenceRule |
| Schedule | 排程設定,定義靜音時段 | 屬於 SilenceRule |""",
            'observability': {
                'logging': '✅', 'logging_desc': '記錄靜音規則建立、延長、刪除事件',
                'metrics': '✅', 'metrics_desc': '追蹤靜音規則數量、抑制的告警數、覆蓋率',
                'rbac': '✅', 'rbac_desc': '控制靜音規則的建立與管理權限',
                'i18n': '✅', 'i18n_desc': '規則名稱、描述、排程說明支援多語言',
                'theme': '✅', 'theme_desc': '規則類型標籤使用語義色'
            },
            'clarifications': """- [NEEDS CLARIFICATION: 靜音規則與告警規則的優先級關係]
- [NEEDS CLARIFICATION: 過期靜音規則的自動清理策略與保留時長]"""
        }

def get_resources_specs(module_id: str, module_name: str) -> dict:
    """資源管理類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄資源 CRUD 操作、狀態變更事件',
        'metrics': '✅', 'metrics_desc': '追蹤資源數量、狀態分布、效能指標',
        'rbac': '✅', 'rbac_desc': '依團隊與角色控制資源存取權限',
        'i18n': '✅', 'i18n_desc': '所有文案透過 Content Context 存取',
        'theme': '✅', 'theme_desc': '狀態標籤、圖表使用 Theme Token'
    }

    if "list" in module_id:
        return {
            'user_story': """SRE 工程師需要查看與管理所有監控資源,快速了解資源狀態、效能指標、事件數量,並進行批次操作。""",
            'acceptance_scenarios': """1. **Given** 使用者進入資源列表,**When** 系統載入資料,**Then** 應顯示資源名稱、狀態、類型、CPU/記憶體使用率、事件數等資訊
2. **Given** 使用者點擊資源,**When** 開啟詳情抽屜,**Then** 應顯示完整資源資訊、指標圖表、關聯事件
3. **Given** 使用者選擇多個資源,**When** 點擊「AI 分析」,**Then** 系統應生成容量與效能分析報告""",
            'edge_cases': """- 當資源數量超過 10000 筆時,應啟用虛擬滾動或伺服器端分頁
- 當資源狀態為 unknown 時,應顯示重新檢查選項
- 當資源被刪除但仍有關聯事件時,應標記為已移除但保留歷史資料""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援依狀態、類型、提供商、區域、擁有者篩選資源。
- **FR-002**: 系統必須(MUST)即時顯示 CPU、記憶體使用率,並以顏色區分正常/警告/危險。
- **FR-003**: 系統必須(MUST)顯示資源最近 24 小時事件數量,點擊可展開事件清單。
- **FR-004**: 系統應該(SHOULD)支援批次標籤操作、批次刪除、批次匯出。
- **FR-005**: 系統應該(SHOULD)整合 AI 分析,提供資源效能診斷與優化建議。
- **FR-006**: 系統必須(MUST)支援欄位自訂與排序,儲存使用者偏好設定。
- **FR-007**: 系統可以(MAY)提供資源拓撲視圖,顯示資源間依賴關係。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Resource | 監控資源實體,包含狀態、指標、標籤等屬性 | 屬於 ResourceGroup, 產生 Incident |
| ResourceMetrics | 資源效能指標(CPU, Memory, Disk) | 屬於 Resource |
| ResourceEvent | 資源相關事件記錄 | 關聯 Resource |
| ResourceGroup | 資源群組,邏輯分組管理 | 包含多個 Resource |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 資源指標的更新頻率與歷史資料保留策略]
- [NEEDS CLARIFICATION: 資源批次操作的數量上限]
- [NEEDS CLARIFICATION: 資源狀態判定邏輯 - 基於哪些指標與閾值]"""
        }
    elif "group" in module_id:
        return {
            'user_story': """SRE 工程師需要建立資源群組,將相關資源邏輯分組,以便批次管理與統一監控。""",
            'acceptance_scenarios': """1. **Given** 使用者建立資源群組,**When** 選擇成員資源並設定擁有團隊,**Then** 系統應建立群組並計算狀態摘要
2. **Given** 使用者查看群組詳情,**When** 開啟詳情抽屜,**Then** 應顯示成員列表、狀態分布、最近更新時間
3. **Given** 使用者編輯群組,**When** 新增或移除成員,**Then** 系統應即時更新狀態摘要""",
            'edge_cases': """- 當群組包含超過 100 個資源時,應分頁顯示成員列表
- 當群組中的資源被刪除時,應自動從群組移除
- 當群組無任何成員時,應顯示空狀態提示""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除資源群組。
- **FR-002**: 系統必須(MUST)自動計算群組內資源的狀態摘要(健康/警告/危險數量)。
- **FR-003**: 系統應該(SHOULD)支援群組搜尋與篩選,依擁有團隊、成員數量分類。
- **FR-004**: 系統應該(SHOULD)提供群組詳情視圖,列出所有成員及其狀態。
- **FR-005**: 系統可以(MAY)支援巢狀群組,允許群組包含其他群組。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| ResourceGroup | 資源群組,邏輯分組容器 | 包含多個 Resource |
| StatusSummary | 群組狀態摘要統計 | 屬於 ResourceGroup |
| Team | 擁有團隊 | 管理 ResourceGroup |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 群組成員數量上限]
- [NEEDS CLARIFICATION: 是否支援動態群組(基於標籤或條件自動加入成員)]"""
        }
    elif "topology" in module_id:
        return {
            'user_story': """SRE 工程師需要視覺化檢視資源拓撲關係,快速理解系統架構與依賴連結。""",
            'acceptance_scenarios': """1. **Given** 使用者進入拓撲頁面,**When** 系統載入資源關係,**Then** 應以圖形方式顯示資源節點與連線
2. **Given** 使用者點擊資源節點,**When** 選中節點,**Then** 應高亮該節點及其相關連線,並顯示詳情面板
3. **Given** 使用者篩選資源類型,**When** 勾選類型,**Then** 圖形應僅顯示選定類型的資源""",
            'edge_cases': """- 當資源數量超過 50 個時,應提供縮放與平移功能
- 當資源無任何連線時,應顯示為孤立節點
- 當拓撲圖過於複雜時,應提供分層或聚合視圖""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)以圖形化方式展示資源節點與依賴連線。
- **FR-002**: 系統必須(MUST)支援節點顏色依狀態區分(正常/警告/危險)。
- **FR-003**: 系統應該(SHOULD)支援拖曳調整節點位置,並儲存布局設定。
- **FR-004**: 系統應該(SHOULD)提供篩選器,依類型、狀態、團隊篩選顯示。
- **FR-005**: 系統可以(MAY)支援拓撲圖匯出為圖片或 JSON 格式。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| TopologyNode | 拓撲節點,代表資源 | 對應 Resource |
| TopologyEdge | 拓撲連線,代表依賴關係 | 連接兩個 TopologyNode |
| LayoutConfig | 布局設定,儲存節點位置 | 使用者偏好設定 |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 依賴關係的資料來源與更新機制]
- [NEEDS CLARIFICATION: 拓撲圖的自動布局演算法選擇]"""
        }
    elif "datasource" in module_id:
        return {
            'user_story': """管理員需要配置與管理資料源連線,包括 Prometheus、Grafana、日誌系統等,確保資料正確採集。""",
            'acceptance_scenarios': """1. **Given** 管理員新增資料源,**When** 填寫連線資訊並測試,**Then** 系統應驗證連線並儲存設定
2. **Given** 資料源連線失敗,**When** 系統偵測到錯誤,**Then** 應標記狀態為異常並發送告警
3. **Given** 管理員編輯資料源,**When** 修改 URL 或認證資訊,**Then** 系統應重新測試連線""",
            'edge_cases': """- 當資料源需要複雜認證(OAuth, mTLS)時,應提供進階設定選項
- 當資料源暫時不可用時,應支援重試機制與降級策略
- 當刪除資料源時,應檢查是否有依賴並提示影響範圍""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援新增、編輯、刪除資料源設定。
- **FR-002**: 系統必須(MUST)提供連線測試功能,驗證資料源可用性。
- **FR-003**: 系統應該(SHOULD)支援多種資料源類型(Prometheus, Grafana, Loki, Elasticsearch)。
- **FR-004**: 系統必須(MUST)加密儲存資料源認證資訊(密碼、Token)。
- **FR-005**: 系統應該(SHOULD)定期檢查資料源健康狀態,異常時發送告警。
- **FR-006**: 系統可以(MAY)支援資料源版本相容性檢查與升級提示。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Datasource | 資料源配置,包含連線資訊與認證 | 提供資料給 Dashboard, Alert |
| DatasourceCredential | 資料源認證資訊(加密儲存) | 屬於 Datasource |
| HealthCheck | 資料源健康檢查記錄 | 關聯 Datasource |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 資料源認證資訊的加密演算法與金鑰管理]
- [NEEDS CLARIFICATION: 資料源健康檢查的頻率與逾時設定]"""
        }
    elif "auto-discovery" in module_id:
        return {
            'user_story': """管理員需要配置自動發現任務,定期掃描雲端或內部環境,自動註冊新資源到監控系統。""",
            'acceptance_scenarios': """1. **Given** 管理員建立自動發現任務,**When** 設定掃描範圍與排程,**Then** 系統應按時執行並回報發現的資源
2. **Given** 自動發現任務執行完成,**When** 發現新資源,**Then** 系統應自動註冊並標記為新發現
3. **Given** 使用者查看發現結果,**When** 開啟結果抽屜,**Then** 應顯示發現的資源清單與匯入選項""",
            'edge_cases': """- 當發現任務執行時間過長時,應支援中斷與恢復機制
- 當發現的資源已存在時,應提供更新或跳過選項
- 當發現任務頻繁失敗時,應自動停用並通知管理員""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除自動發現任務。
- **FR-002**: 系統必須(MUST)支援多種發現來源(AWS, Azure, GCP, Kubernetes)。
- **FR-003**: 系統應該(SHOULD)支援排程執行(單次、週期性)。
- **FR-004**: 系統必須(MUST)記錄每次執行結果,包含發現數量、匯入數量、錯誤訊息。
- **FR-005**: 系統應該(SHOULD)提供發現規則過濾,僅匯入符合條件的資源。
- **FR-006**: 系統可以(MAY)支援發現結果預覽與手動確認匯入。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| DiscoveryJob | 自動發現任務配置 | 產生 DiscoveryResult |
| DiscoveryResult | 發現結果記錄 | 關聯 DiscoveryJob |
| DiscoveredResource | 發現的資源項目 | 可轉換為 Resource |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 自動發現的並行任務數上限]
- [NEEDS CLARIFICATION: 發現結果的保留時長與清理策略]"""
        }
    else:  # discovery/overview
        return {
            'user_story': """SRE 工程師需要總覽資源狀態,快速了解整體健康度、分布情況、關鍵指標,作為決策依據。""",
            'acceptance_scenarios': """1. **Given** 使用者進入資源總覽頁面,**When** 系統載入資料,**Then** 應顯示 KPI 卡片、狀態分布圖、資源清單
2. **Given** 使用者點擊狀態分布圖,**When** 選擇特定狀態,**Then** 應篩選並跳轉到對應資源列表
3. **Given** 使用者查看 KPI 卡片,**When** 數值異常,**Then** 應以顏色或圖示標示警示""",
            'edge_cases': """- 當資源總數為 0 時,應顯示引導建立資源的提示
- 當 KPI 計算失敗時,應顯示錯誤訊息而非錯誤數值
- 當資料載入緩慢時,應顯示骨架屏或進度指示器""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)顯示資源總數、健康資源數、警告資源數、危險資源數 KPI。
- **FR-002**: 系統必須(MUST)提供狀態分布圓餅圖或長條圖,可點擊跳轉篩選。
- **FR-003**: 系統應該(SHOULD)顯示資源類型分布、提供商分布統計圖表。
- **FR-004**: 系統應該(SHOULD)提供快速搜尋與篩選功能,支援關鍵字與標籤。
- **FR-005**: 系統可以(MAY)顯示資源趨勢圖,展示最近 7 天或 30 天變化。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| ResourceSummary | 資源總覽統計資料 | 聚合自 Resource |
| StatusDistribution | 狀態分布統計 | 聚合自 Resource |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: KPI 數值的更新頻率與快取策略]
- [NEEDS CLARIFICATION: 趨勢圖的資料粒度與聚合邏輯]"""
        }

def get_dashboards_specs(module_id: str, module_name: str) -> dict:
    """儀表板類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄儀表板建立、修改、刪除、檢視事件',
        'metrics': '✅', 'metrics_desc': '追蹤儀表板使用率、載入時間、錯誤率',
        'rbac': '✅', 'rbac_desc': '控制儀表板的檢視、編輯、刪除權限',
        'i18n': '✅', 'i18n_desc': '儀表板標題、描述支援多語言',
        'theme': '✅', 'theme_desc': '圖表使用 useChartTheme 統一配色'
    }

    if "list" in module_id:
        return {
            'user_story': """使用者需要查看與管理所有儀表板,快速找到需要的監控視圖,並進行建立、編輯、刪除操作。""",
            'acceptance_scenarios': """1. **Given** 使用者進入儀表板列表,**When** 系統載入資料,**Then** 應顯示儀表板名稱、描述、建立者、更新時間
2. **Given** 使用者點擊儀表板,**When** 開啟檢視頁面,**Then** 應顯示完整圖表與資料
3. **Given** 使用者點擊「新增儀表板」,**When** 選擇範本或空白建立,**Then** 應跳轉至編輯器""",
            'edge_cases': """- 當儀表板數量過多時,應提供分類、標籤篩選功能
- 當儀表板被刪除但仍被收藏時,應標記為已移除
- 當儀表板載入失敗時,應顯示錯誤訊息與重試選項""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援儀表板列表顯示、搜尋、篩選功能。
- **FR-002**: 系統必須(MUST)支援建立、編輯、刪除儀表板。
- **FR-003**: 系統應該(SHOULD)支援儀表板收藏、排序功能。
- **FR-004**: 系統應該(SHOULD)提供儀表板預覽縮圖,快速識別內容。
- **FR-005**: 系統可以(MAY)支援儀表板分享,產生公開連結或嵌入代碼。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Dashboard | 儀表板實體,包含配置與面板 | 包含多個 Panel |
| Panel | 儀表板面板,顯示圖表或指標 | 屬於 Dashboard |
| DashboardTemplate | 儀表板範本 | 可複製為 Dashboard |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 儀表板的權限繼承與分享機制]
- [NEEDS CLARIFICATION: 儀表板版本控制與復原功能]"""
        }
    else:  # template
        return {
            'user_story': """使用者需要從範本庫快速建立常見監控儀表板,節省配置時間並遵循最佳實踐。""",
            'acceptance_scenarios': """1. **Given** 使用者瀏覽範本庫,**When** 查看範本列表,**Then** 應顯示範本名稱、描述、適用場景、預覽圖
2. **Given** 使用者選擇範本,**When** 點擊「使用範本」,**Then** 系統應複製範本並允許自訂參數
3. **Given** 使用者套用範本,**When** 儲存儀表板,**Then** 應建立新儀表板並跳轉至檢視頁面""",
            'edge_cases': """- 當範本需要特定資料源時,應檢查並提示使用者配置
- 當範本參數不完整時,應標記必填欄位並阻止儲存
- 當範本版本更新時,應提示使用者同步更新""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)提供預定義範本庫,涵蓋基礎設施、應用、業務監控場景。
- **FR-002**: 系統必須(MUST)支援範本預覽與參數自訂。
- **FR-003**: 系統應該(SHOULD)支援範本分類與標籤,快速篩選。
- **FR-004**: 系統應該(SHOULD)允許使用者儲存自訂範本供團隊使用。
- **FR-005**: 系統可以(MAY)提供範本評分與使用統計,推薦熱門範本。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| DashboardTemplate | 儀表板範本,含預設配置 | 可複製為 Dashboard |
| TemplateParameter | 範本參數,允許自訂 | 屬於 DashboardTemplate |
| TemplateCategory | 範本分類 | 組織 DashboardTemplate |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 範本的版本管理與更新通知機制]
- [NEEDS CLARIFICATION: 使用者自訂範本的審核與分享流程]"""
        }

def get_insights_specs(module_id: str, module_name: str) -> dict:
    """洞察分析類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄分析任務建立、執行、結果查詢',
        'metrics': '✅', 'metrics_desc': '追蹤分析任務執行時間、成功率、資源消耗',
        'rbac': '✅', 'rbac_desc': '控制分析功能的存取與執行權限',
        'i18n': '✅', 'i18n_desc': '分析報告與 UI 文案支援多語言',
        'theme': '✅', 'theme_desc': '分析圖表使用統一 Theme Token'
    }

    if "backtesting" in module_id:
        return {
            'user_story': """SRE 工程師需要回測告警規則,模擬歷史資料驗證規則效果,優化閾值與條件設定。""",
            'acceptance_scenarios': """1. **Given** 使用者選擇告警規則,**When** 設定回測時間範圍,**Then** 系統應使用歷史資料模擬觸發並產生報告
2. **Given** 回測完成,**When** 查看報告,**Then** 應顯示觸發次數、誤報率、漏報率、建議調整
3. **Given** 使用者調整規則參數,**When** 重新回測,**Then** 應比較新舊結果差異""",
            'edge_cases': """- 當歷史資料不足時,應提示並建議縮短時間範圍
- 當回測任務耗時過長時,應支援背景執行與通知
- 當多個規則同時回測時,應排隊處理並顯示進度""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援選擇告警規則與時間範圍進行回測。
- **FR-002**: 系統必須(MUST)使用歷史指標資料模擬規則觸發,產生詳細報告。
- **FR-003**: 系統應該(SHOULD)計算並顯示誤報率、漏報率、準確率指標。
- **FR-004**: 系統應該(SHOULD)提供參數調整建議,協助優化規則。
- **FR-005**: 系統可以(MAY)支援批次回測多個規則,產生比較分析。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| BacktestJob | 回測任務,含規則與時間範圍 | 關聯 AlertRule |
| BacktestResult | 回測結果,含觸發統計與建議 | 屬於 BacktestJob |
| HistoricalMetric | 歷史指標資料 | 回測資料來源 |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 回測任務的並行數限制與優先級機制]
- [NEEDS CLARIFICATION: 歷史資料的存取權限與資料隱私保護]"""
        }
    elif "capacity" in module_id:
        return {
            'user_story': """SRE 工程師需要進行容量規劃,預測資源使用趨勢,提前擴容避免效能瓶頸。""",
            'acceptance_scenarios': """1. **Given** 使用者選擇資源與指標,**When** 設定預測時間範圍,**Then** 系統應使用歷史資料預測未來趨勢
2. **Given** 預測完成,**When** 查看報告,**Then** 應顯示趨勢圖、達到閾值時間點、擴容建議
3. **Given** 使用者調整預測模型,**When** 重新計算,**Then** 應更新預測結果與建議""",
            'edge_cases': """- 當歷史資料呈現異常波動時,應標記並提示可能影響準確度
- 當預測結果超出合理範圍時,應發出警告並建議人工審核
- 當資源類型不支援預測時,應明確提示並建議替代方案""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援選擇資源、指標、預測時間範圍。
- **FR-002**: 系統必須(MUST)使用時間序列演算法(如線性回歸、ARIMA)預測趨勢。
- **FR-003**: 系統應該(SHOULD)顯示預測信賴區間與準確度評估。
- **FR-004**: 系統應該(SHOULD)提供擴容建議,包含時間點與容量大小。
- **FR-005**: 系統可以(MAY)整合成本估算,計算擴容費用。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| CapacityPlan | 容量規劃任務 | 關聯 Resource |
| ForecastResult | 預測結果,含趨勢與建議 | 屬於 CapacityPlan |
| ScalingRecommendation | 擴容建議 | 基於 ForecastResult |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 預測演算法的選擇與模型訓練機制]
- [NEEDS CLARIFICATION: 預測結果的準確度評估標準]"""
        }
    else:  # log
        return {
            'user_story': """SRE 工程師需要探索與分析日誌,快速定位問題根因,支援複雜查詢與視覺化分析。""",
            'acceptance_scenarios': """1. **Given** 使用者輸入日誌查詢語法,**When** 執行查詢,**Then** 系統應顯示符合條件的日誌條目與統計
2. **Given** 使用者選擇時間範圍,**When** 縮小範圍,**Then** 系統應即時更新日誌列表與分布圖
3. **Given** 使用者點擊日誌條目,**When** 展開詳情,**Then** 應顯示完整日誌內容、上下文、關聯追蹤""",
            'edge_cases': """- 當查詢結果超過 10000 筆時,應分頁或限制顯示並提示精確查詢
- 當日誌來源不可用時,應顯示錯誤並建議檢查資料源配置
- 當查詢語法錯誤時,應高亮錯誤位置並提供修正建議""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援日誌查詢語言(如 LogQL, Lucene),含關鍵字、欄位、時間篩選。
- **FR-002**: 系統必須(MUST)顯示日誌條目列表、時間分布圖、欄位統計。
- **FR-003**: 系統應該(SHOULD)支援日誌上下文查詢,顯示前後相關日誌。
- **FR-004**: 系統應該(SHOULD)整合分散式追蹤,關聯 Trace ID 跳轉詳情。
- **FR-005**: 系統可以(MAY)提供日誌異常偵測,自動標記可疑模式。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| LogQuery | 日誌查詢,含語法與時間範圍 | 產生 LogResult |
| LogResult | 查詢結果,含日誌條目與統計 | 關聯 LogQuery |
| LogEntry | 日誌條目,含時間戳、等級、內容 | 來自日誌資料源 |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 日誌查詢的並行數與逾時限制]
- [NEEDS CLARIFICATION: 日誌資料的保留策略與查詢範圍限制]"""
        }

def get_automation_specs(module_id: str, module_name: str) -> dict:
    """自動化類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄劇本建立、執行、結果事件',
        'metrics': '✅', 'metrics_desc': '追蹤劇本執行次數、成功率、耗時',
        'rbac': '✅', 'rbac_desc': '控制劇本的建立、執行、審批權限',
        'i18n': '✅', 'i18n_desc': '劇本名稱、步驟描述支援多語言',
        'theme': '✅', 'theme_desc': '狀態標籤使用統一語義色'
    }

    if "playbook" in module_id:
        return {
            'user_story': """SRE 工程師需要建立與管理自動化劇本,定義故障處理流程,實現自動化響應與修復。""",
            'acceptance_scenarios': """1. **Given** 使用者建立劇本,**When** 定義步驟與參數,**Then** 系統應驗證並儲存劇本
2. **Given** 使用者手動執行劇本,**When** 輸入執行參數,**Then** 系統應依序執行步驟並回報結果
3. **Given** 劇本被告警規則觸發,**When** 條件滿足,**Then** 系統應自動執行劇本並記錄""",
            'edge_cases': """- 當劇本步驟執行失敗時,應依設定重試或中止,並發送告警
- 當劇本需要人工審批時,應暫停執行並通知審批者
- 當劇本執行時間過長時,應支援中斷與回滾""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除自動化劇本。
- **FR-002**: 系統必須(MUST)支援多種步驟類型(API 呼叫、腳本執行、等待、條件分支)。
- **FR-003**: 系統應該(SHOULD)提供劇本測試功能,模擬執行並驗證邏輯。
- **FR-004**: 系統應該(SHOULD)支援劇本版本控制與復原。
- **FR-005**: 系統可以(MAY)整合 AI,根據事件描述自動產生劇本草稿。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Playbook | 自動化劇本,含步驟與參數 | 被 Trigger 觸發 |
| PlaybookStep | 劇本步驟,定義具體動作 | 屬於 Playbook |
| PlaybookExecution | 劇本執行記錄 | 關聯 Playbook |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 劇本並行執行的限制與優先級]
- [NEEDS CLARIFICATION: 劇本執行失敗後的告警與通知機制]"""
        }
    elif "trigger" in module_id:
        return {
            'user_story': """SRE 工程師需要配置觸發器,定義何時自動執行劇本,實現事件驅動的自動化。""",
            'acceptance_scenarios': """1. **Given** 使用者建立觸發器,**When** 設定觸發條件與綁定劇本,**Then** 系統應驗證並儲存
2. **Given** 觸發條件滿足,**When** 事件發生,**Then** 系統應執行綁定的劇本並記錄
3. **Given** 使用者查看觸發歷史,**When** 開啟歷史列表,**Then** 應顯示觸發時間、條件、執行結果""",
            'edge_cases': """- 當觸發器頻繁觸發時,應啟用防抖機制避免過度執行
- 當綁定的劇本不存在時,應標記觸發器為無效並告警
- 當觸發條件過於寬鬆時,應提示可能影響系統效能""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除觸發器。
- **FR-002**: 系統必須(MUST)支援多種觸發條件(事件、排程、Webhook、手動)。
- **FR-003**: 系統應該(SHOULD)支援觸發器優先級,高優先級優先執行。
- **FR-004**: 系統應該(SHOULD)記錄所有觸發事件與執行結果。
- **FR-005**: 系統可以(MAY)支援觸發器依賴,串接多個劇本執行。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Trigger | 觸發器,定義觸發條件 | 綁定 Playbook |
| TriggerCondition | 觸發條件,支援多條件組合 | 屬於 Trigger |
| TriggerHistory | 觸發歷史記錄 | 關聯 Trigger, Playbook |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 觸發器的並行執行數限制]
- [NEEDS CLARIFICATION: 觸發器防抖的時間窗口與策略]"""
        }
    else:  # history
        return {
            'user_story': """SRE 工程師需要查看自動化執行歷史,追蹤劇本執行狀況,分析成功率與失敗原因。""",
            'acceptance_scenarios': """1. **Given** 使用者進入執行歷史頁面,**When** 系統載入資料,**Then** 應顯示執行時間、劇本名稱、狀態、耗時
2. **Given** 使用者點擊執行記錄,**When** 開啟詳情抽屜,**Then** 應顯示每個步驟的執行日誌與結果
3. **Given** 使用者篩選失敗記錄,**When** 勾選失敗狀態,**Then** 應僅顯示失敗的執行記錄""",
            'edge_cases': """- 當執行歷史數量過多時,應提供分頁與日期範圍篩選
- 當執行步驟包含敏感資訊時,應遮罩或脫敏顯示
- 當執行記錄被刪除時,應保留摘要資訊用於統計""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)記錄所有劇本執行歷史,含開始時間、結束時間、狀態、觸發來源。
- **FR-002**: 系統必須(MUST)顯示每個步驟的執行日誌、輸入參數、輸出結果。
- **FR-003**: 系統應該(SHOULD)支援依劇本、狀態、時間範圍篩選歷史。
- **FR-004**: 系統應該(SHOULD)提供執行統計,計算成功率、平均耗時等指標。
- **FR-005**: 系統可以(MAY)支援執行記錄匯出,用於審計或分析。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| ExecutionHistory | 執行歷史記錄 | 關聯 Playbook, Trigger |
| ExecutionStep | 執行步驟記錄,含日誌與結果 | 屬於 ExecutionHistory |
| ExecutionMetrics | 執行統計指標 | 聚合自 ExecutionHistory |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 執行歷史的保留時長與歸檔策略]
- [NEEDS CLARIFICATION: 敏感資訊的脫敏規則與權限控制]"""
        }

def get_identity_specs(module_id: str, module_name: str) -> dict:
    """身份與存取管理類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄所有身份變更、權限調整、登入事件',
        'metrics': '✅', 'metrics_desc': '追蹤使用者活躍度、權限分布、異常登入',
        'rbac': '✅', 'rbac_desc': '嚴格控制身份管理權限,僅管理員可操作',
        'i18n': '✅', 'i18n_desc': '所有 UI 文案支援多語言',
        'theme': '✅', 'theme_desc': '狀態標籤使用語義色'
    }

    if "personnel" in module_id:
        return {
            'user_story': """管理員需要管理使用者帳號,包含建立、編輯、停用、重設密碼等操作,確保存取安全。""",
            'acceptance_scenarios': """1. **Given** 管理員建立使用者,**When** 填寫基本資訊與角色,**Then** 系統應驗證並發送啟用邀請
2. **Given** 管理員停用使用者,**When** 確認操作,**Then** 系統應撤銷所有 Token 並禁止登入
3. **Given** 管理員重設密碼,**When** 確認操作,**Then** 系統應發送重設連結並強制下次登入修改""",
            'edge_cases': """- 當使用者正在執行關鍵操作時被停用,應保留操作記錄並發送通知
- 當使用者郵箱重複時,應拒絕建立並提示
- 當批次匯入使用者資料格式錯誤時,應標記錯誤列並允許修正後重試""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、停用、刪除使用者。
- **FR-002**: 系統必須(MUST)支援重設密碼,發送安全連結至使用者郵箱。
- **FR-003**: 系統應該(SHOULD)支援批次匯入使用者,含驗證與錯誤回報。
- **FR-004**: 系統應該(SHOULD)顯示使用者最後登入時間、活躍狀態。
- **FR-005**: 系統可以(MAY)整合 SSO(SAML, OAuth),支援第三方身份提供商。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| User | 使用者帳號,含基本資訊與狀態 | 屬於 Team, 擁有 Role |
| UserCredential | 使用者認證資訊(密碼雜湊、Token) | 屬於 User |
| UserSession | 使用者登入會話 | 關聯 User |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 使用者帳號的自動清理策略(長期未登入)]
- [NEEDS CLARIFICATION: SSO 整合的身份同步機制]"""
        }
    elif "role" in module_id:
        return {
            'user_story': """管理員需要定義與管理角色,設定權限範圍,實現基於角色的存取控制(RBAC)。""",
            'acceptance_scenarios': """1. **Given** 管理員建立角色,**When** 設定權限項目,**Then** 系統應驗證並儲存角色
2. **Given** 管理員編輯角色權限,**When** 新增或移除權限,**Then** 系統應即時更新並通知受影響使用者
3. **Given** 管理員刪除角色,**When** 確認操作,**Then** 系統應檢查是否有使用者使用該角色並提示影響""",
            'edge_cases': """- 當角色權限過於寬鬆(如擁有所有權限)時,應發出警告
- 當刪除角色時仍有使用者使用,應拒絕刪除或提供轉移選項
- 當角色繼承關係形成循環時,應偵測並拒絕""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除角色。
- **FR-002**: 系統必須(MUST)提供細粒度權限項目,涵蓋所有功能模組。
- **FR-003**: 系統應該(SHOULD)支援角色繼承,子角色自動獲得父角色權限。
- **FR-004**: 系統應該(SHOULD)顯示角色使用統計,含使用者數量、權限覆蓋率。
- **FR-005**: 系統可以(MAY)提供權限模板,快速建立常見角色。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Role | 角色,定義權限集合 | 被 User 引用 |
| Permission | 權限項目,對應具體操作 | 屬於 Role |
| RoleHierarchy | 角色繼承關係 | 關聯父子 Role |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 權限項目的粒度與命名規範]
- [NEEDS CLARIFICATION: 角色變更後的權限生效時機(即時或下次登入)]"""
        }
    elif "team" in module_id:
        return {
            'user_story': """管理員需要建立與管理團隊,組織使用者,實現團隊級別的資源隔離與權限管理。""",
            'acceptance_scenarios': """1. **Given** 管理員建立團隊,**When** 設定團隊名稱與成員,**Then** 系統應建立團隊並分配預設權限
2. **Given** 管理員編輯團隊,**When** 新增或移除成員,**Then** 系統應更新成員關聯並調整資源存取權限
3. **Given** 管理員刪除團隊,**When** 確認操作,**Then** 系統應檢查團隊資源並提示轉移或刪除""",
            'edge_cases': """- 當團隊成員數量過多時,應提供分頁與搜尋功能
- 當刪除團隊時仍有關聯資源,應拒絕刪除或提供批次轉移
- 當團隊巢狀層級過深時,應限制並提示""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除團隊。
- **FR-002**: 系統必須(MUST)支援團隊成員管理,含新增、移除、角色指派。
- **FR-003**: 系統應該(SHOULD)支援團隊層級資源隔離,團隊僅可存取所屬資源。
- **FR-004**: 系統應該(SHOULD)顯示團隊統計,含成員數、資源數、活躍度。
- **FR-005**: 系統可以(MAY)支援子團隊,實現組織架構映射。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Team | 團隊,組織使用者 | 包含多個 User |
| TeamMembership | 團隊成員關係 | 關聯 Team 與 User |
| TeamResource | 團隊資源關聯 | 關聯 Team 與 Resource |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 團隊資源隔離的實作機制與例外處理]
- [NEEDS CLARIFICATION: 子團隊的權限繼承與覆寫規則]"""
        }
    else:  # audit
        return {
            'user_story': """管理員與稽核人員需要查看審計日誌,追蹤所有關鍵操作,滿足合規要求。""",
            'acceptance_scenarios': """1. **Given** 使用者進入審計日誌頁面,**When** 系統載入資料,**Then** 應顯示操作時間、操作者、操作類型、目標物件、結果
2. **Given** 使用者篩選特定操作者,**When** 選擇使用者,**Then** 應僅顯示該使用者的操作記錄
3. **Given** 使用者匯出審計日誌,**When** 選擇時間範圍與格式,**Then** 系統應產生檔案並下載""",
            'edge_cases': """- 當審計日誌數量龐大時,應提供高效能查詢與分頁
- 當敏感操作發生時,應即時告警並標記
- 當日誌儲存空間不足時,應觸發歸檔與清理機制""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)記錄所有關鍵操作,含建立、修改、刪除、登入、權限變更。
- **FR-002**: 系統必須(MUST)記錄操作者、時間戳記、IP 位址、操作詳情。
- **FR-003**: 系統應該(SHOULD)支援依操作者、操作類型、時間範圍篩選。
- **FR-004**: 系統應該(SHOULD)支援審計日誌匯出,含 CSV、JSON 格式。
- **FR-005**: 系統可以(MAY)提供異常行為偵測,自動標記可疑操作。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| AuditLog | 審計日誌記錄 | 關聯 User |
| AuditAction | 審計操作類型 | 被 AuditLog 參照 |
| AuditTarget | 審計目標物件 | 被 AuditLog 參照 |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 審計日誌的保留時長與歸檔策略]
- [NEEDS CLARIFICATION: 敏感操作的定義與告警機制]"""
        }

def get_notification_specs(module_id: str, module_name: str) -> dict:
    """通知管理類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄通知發送、失敗、重試事件',
        'metrics': '✅', 'metrics_desc': '追蹤通知發送量、成功率、延遲',
        'rbac': '✅', 'rbac_desc': '控制通知配置的編輯與管理權限',
        'i18n': '✅', 'i18n_desc': '通知範本與 UI 支援多語言',
        'theme': '✅', 'theme_desc': '狀態標籤使用語義色'
    }

    if "channel" in module_id:
        return {
            'user_story': """管理員需要配置通知渠道,包含 Email、Slack、Webhook 等,確保告警訊息正確送達。""",
            'acceptance_scenarios': """1. **Given** 管理員新增通知渠道,**When** 填寫配置並測試,**Then** 系統應驗證連線並發送測試訊息
2. **Given** 管理員編輯渠道,**When** 修改設定,**Then** 系統應重新測試並更新
3. **Given** 渠道發送失敗,**When** 系統偵測錯誤,**Then** 應標記狀態為異常並告警""",
            'edge_cases': """- 當渠道需要複雜認證(OAuth)時,應提供授權流程引導
- 當渠道暫時不可用時,應啟用重試機制與降級通知
- 當刪除渠道時仍被策略使用,應拒絕刪除或提示影響""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除通知渠道。
- **FR-002**: 系統必須(MUST)支援多種渠道類型(Email, Slack, Webhook, SMS)。
- **FR-003**: 系統應該(SHOULD)提供渠道測試功能,發送測試訊息驗證設定。
- **FR-004**: 系統必須(MUST)加密儲存渠道認證資訊(Token, 密碼)。
- **FR-005**: 系統應該(SHOULD)定期檢查渠道健康狀態,異常時告警。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| NotificationChannel | 通知渠道配置 | 被 NotificationStrategy 使用 |
| ChannelCredential | 渠道認證資訊(加密) | 屬於 NotificationChannel |
| ChannelHealthCheck | 渠道健康檢查記錄 | 關聯 NotificationChannel |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 渠道認證資訊的金鑰管理機制]
- [NEEDS CLARIFICATION: 渠道健康檢查的頻率與逾時設定]"""
        }
    elif "strategy" in module_id:
        return {
            'user_story': """管理員需要配置通知策略,定義哪些事件通過哪些渠道發送給哪些接收者。""",
            'acceptance_scenarios': """1. **Given** 管理員建立通知策略,**When** 設定匹配條件、渠道、接收者,**Then** 系統應驗證並儲存
2. **Given** 事件觸發通知,**When** 匹配策略條件,**Then** 系統應依序發送至指定渠道與接收者
3. **Given** 管理員測試策略,**When** 模擬事件,**Then** 系統應顯示匹配結果與發送預覽""",
            'edge_cases': """- 當多個策略匹配同一事件時,應依優先級發送或合併通知
- 當接收者不存在時,應跳過並記錄錯誤
- 當策略過於頻繁觸發時,應啟用聚合與限流機制""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除通知策略。
- **FR-002**: 系統必須(MUST)支援基於事件類型、嚴重性、標籤的匹配條件。
- **FR-003**: 系統應該(SHOULD)支援多渠道與多接收者設定。
- **FR-004**: 系統應該(SHOULD)支援通知範本,自訂訊息格式。
- **FR-005**: 系統可以(MAY)支援通知聚合,合併相似事件減少噪音。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| NotificationStrategy | 通知策略,定義發送規則 | 使用 NotificationChannel |
| StrategyMatcher | 策略匹配條件 | 屬於 NotificationStrategy |
| NotificationTemplate | 通知範本 | 被 NotificationStrategy 使用 |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 策略優先級機制與衝突解決]
- [NEEDS CLARIFICATION: 通知聚合的時間窗口與觸發條件]"""
        }
    else:  # history
        return {
            'user_story': """使用者需要查看通知歷史,追蹤訊息發送狀況,排查通知失敗原因。""",
            'acceptance_scenarios': """1. **Given** 使用者進入通知歷史頁面,**When** 系統載入資料,**Then** 應顯示發送時間、渠道、接收者、狀態
2. **Given** 使用者篩選失敗記錄,**When** 勾選失敗狀態,**Then** 應僅顯示失敗的通知並標記錯誤原因
3. **Given** 使用者點擊通知記錄,**When** 開啟詳情,**Then** 應顯示完整訊息內容、發送時間線、重試記錄""",
            'edge_cases': """- 當通知歷史數量過多時,應提供分頁與時間範圍篩選
- 當通知內容包含敏感資訊時,應遮罩顯示
- 當通知重試多次仍失敗時,應標記為永久失敗並告警""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)記錄所有通知發送歷史,含時間、渠道、接收者、狀態。
- **FR-002**: 系統必須(MUST)顯示通知失敗原因與重試次數。
- **FR-003**: 系統應該(SHOULD)支援依渠道、狀態、時間範圍篩選。
- **FR-004**: 系統應該(SHOULD)提供通知統計,計算發送量、成功率、延遲。
- **FR-005**: 系統可以(MAY)支援通知記錄匯出,用於審計或分析。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| NotificationHistory | 通知歷史記錄 | 關聯 NotificationStrategy |
| NotificationRetry | 通知重試記錄 | 屬於 NotificationHistory |
| NotificationMetrics | 通知統計指標 | 聚合自 NotificationHistory |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 通知歷史的保留時長與歸檔策略]
- [NEEDS CLARIFICATION: 通知重試的策略與上限次數]"""
        }

def get_platform_specs(module_id: str, module_name: str) -> dict:
    """平台設定類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄所有設定變更事件',
        'metrics': '⚠️', 'metrics_desc': '追蹤設定變更頻率,無即時指標',
        'rbac': '✅', 'rbac_desc': '僅管理員可修改平台設定',
        'i18n': '✅', 'i18n_desc': '設定項目標籤與說明支援多語言',
        'theme': '✅', 'theme_desc': '表單與狀態標籤使用語義色'
    }

    if "auth" in module_id:
        return {
            'user_story': """管理員需要配置身份驗證設定,包含 SSO、密碼策略、登入限制等,確保系統安全。""",
            'acceptance_scenarios': """1. **Given** 管理員配置 SSO,**When** 填寫 SAML 或 OAuth 設定並測試,**Then** 系統應驗證並儲存
2. **Given** 管理員設定密碼策略,**When** 調整複雜度要求,**Then** 系統應立即生效並通知使用者
3. **Given** 管理員啟用 MFA,**When** 儲存設定,**Then** 系統應要求所有使用者下次登入時設定 MFA""",
            'edge_cases': """- 當 SSO 配置錯誤導致無法登入時,應保留本機管理員帳號作為後門
- 當密碼策略過於嚴格導致使用者無法設定時,應提示並建議調整
- 當 MFA 設備遺失時,應提供恢復流程""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援 SSO 配置(SAML 2.0, OAuth 2.0, OIDC)。
- **FR-002**: 系統必須(MUST)支援密碼策略設定(長度、複雜度、過期時間)。
- **FR-003**: 系統應該(SHOULD)支援多因素驗證(MFA),含 TOTP、SMS。
- **FR-004**: 系統應該(SHOULD)支援登入限制,含 IP 白名單、失敗次數鎖定。
- **FR-005**: 系統可以(MAY)整合企業目錄服務(LDAP, AD),同步使用者資訊。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| AuthConfig | 身份驗證配置 | 系統級設定 |
| SSOProvider | SSO 提供商配置 | 屬於 AuthConfig |
| PasswordPolicy | 密碼策略 | 屬於 AuthConfig |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: SSO 配置錯誤時的降級與恢復機制]
- [NEEDS CLARIFICATION: MFA 恢復流程的安全驗證方式]"""
        }
    elif "grafana" in module_id:
        return {
            'user_story': """管理員需要配置 Grafana 整合,嵌入外部儀表板或同步資料源,擴展監控能力。""",
            'acceptance_scenarios': """1. **Given** 管理員配置 Grafana 連線,**When** 填寫 URL 與 API Key 並測試,**Then** 系統應驗證連線並同步儀表板清單
2. **Given** 管理員啟用儀表板嵌入,**When** 選擇儀表板並設定顯示選項,**Then** 系統應在頁面中嵌入 iframe 顯示
3. **Given** Grafana 連線失敗,**When** 系統偵測錯誤,**Then** 應標記狀態為異常並告警""",
            'edge_cases': """- 當 Grafana 版本不相容時,應提示並建議升級
- 當 API Key 權限不足時,應明確標示缺少的權限項目
- 當嵌入的儀表板包含敏感資料時,應依 RBAC 控制存取""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援 Grafana 連線配置,含 URL、API Key、組織 ID。
- **FR-002**: 系統必須(MUST)提供連線測試功能,驗證 Grafana 可用性。
- **FR-003**: 系統應該(SHOULD)支援儀表板清單同步與嵌入顯示。
- **FR-004**: 系統應該(SHOULD)支援資料源同步,共享 Prometheus、Loki 等配置。
- **FR-005**: 系統可以(MAY)支援 Grafana 告警規則同步,統一管理。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| GrafanaConfig | Grafana 整合配置 | 系統級設定 |
| GrafanaDashboard | 同步的 Grafana 儀表板 | 關聯 GrafanaConfig |
| GrafanaDatasource | 同步的資料源 | 關聯 GrafanaConfig |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: Grafana 儀表板的同步頻率與策略]
- [NEEDS CLARIFICATION: 嵌入儀表板的權限控制與資料隔離]"""
        }
    elif "mail" in module_id:
        return {
            'user_story': """管理員需要配置郵件伺服器,用於發送通知、邀請、重設密碼等郵件。""",
            'acceptance_scenarios': """1. **Given** 管理員配置 SMTP 伺服器,**When** 填寫主機、埠、認證資訊並測試,**Then** 系統應驗證連線並發送測試郵件
2. **Given** 管理員設定寄件者資訊,**When** 修改寄件人名稱與郵箱,**Then** 系統應更新並立即生效
3. **Given** SMTP 連線失敗,**When** 系統偵測錯誤,**Then** 應標記狀態為異常並記錄錯誤""",
            'edge_cases': """- 當 SMTP 需要 TLS 加密時,應提供證書驗證選項
- 當郵件發送失敗時,應記錄錯誤並提供重試機制
- 當郵件伺服器有發送限制時,應支援速率控制""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援 SMTP 伺服器配置,含主機、埠、認證、加密。
- **FR-002**: 系統必須(MUST)提供連線測試功能,發送測試郵件驗證設定。
- **FR-003**: 系統應該(SHOULD)支援寄件者資訊設定,含名稱、郵箱、回覆地址。
- **FR-004**: 系統必須(MUST)加密儲存 SMTP 認證資訊。
- **FR-005**: 系統可以(MAY)支援多個 SMTP 配置,依優先級或負載均衡使用。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| MailConfig | 郵件伺服器配置 | 系統級設定 |
| SMTPCredential | SMTP 認證資訊(加密) | 屬於 MailConfig |
| MailHealthCheck | 郵件伺服器健康檢查 | 關聯 MailConfig |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: SMTP 認證資訊的金鑰管理]
- [NEEDS CLARIFICATION: 郵件發送速率限制的策略]"""
        }
    elif "tag" in module_id:
        return {
            'user_story': """管理員需要定義與管理標籤體系,統一標籤鍵值,用於資源分類、篩選、成本分攤。""",
            'acceptance_scenarios': """1. **Given** 管理員建立標籤定義,**When** 設定鍵、描述、允許值,**Then** 系統應驗證並儲存
2. **Given** 管理員編輯標籤值,**When** 新增或移除允許值,**Then** 系統應更新並檢查現有資源是否使用
3. **Given** 管理員刪除標籤定義,**When** 確認操作,**Then** 系統應檢查使用情況並提示影響""",
            'edge_cases': """- 當標籤鍵重複時,應拒絕建立並提示
- 當刪除標籤定義時仍被資源使用,應拒絕刪除或提供清理選項
- 當標籤值過多時,應提供分頁與搜尋功能""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援建立、編輯、刪除標籤定義。
- **FR-002**: 系統必須(MUST)支援標籤鍵、描述、允許值(可選)設定。
- **FR-003**: 系統應該(SHOULD)顯示標籤使用統計,含使用資源數量。
- **FR-004**: 系統應該(SHOULD)支援標籤值管理,新增、編輯、刪除允許值。
- **FR-005**: 系統可以(MAY)支援標籤策略,強制特定資源必須包含特定標籤。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| TagDefinition | 標籤定義,含鍵與描述 | 被資源參照 |
| TagValue | 標籤允許值 | 屬於 TagDefinition |
| TagUsage | 標籤使用統計 | 關聯 TagDefinition |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 標籤策略的驗證與強制執行機制]
- [NEEDS CLARIFICATION: 標籤值的命名規範與驗證規則]"""
        }
    elif "layout" in module_id:
        return {
            'user_story': """管理員需要配置系統版面設定,包含 Logo、標題、主題色、導覽選單等,客製化平台外觀。""",
            'acceptance_scenarios': """1. **Given** 管理員上傳 Logo,**When** 選擇圖片並儲存,**Then** 系統應更新並即時顯示於導覽列
2. **Given** 管理員修改主題色,**When** 選擇顏色並儲存,**Then** 系統應更新 CSS 變數並即時生效
3. **Given** 管理員調整導覽選單,**When** 拖曳排序或隱藏項目,**Then** 系統應更新並即時反映於側邊欄""",
            'edge_cases': """- 當 Logo 圖片過大時,應自動壓縮或提示大小限制
- 當主題色對比度不足時,應警告並建議調整
- 當隱藏所有導覽項目時,應拒絕並保留至少一個""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援 Logo 上傳與顯示設定。
- **FR-002**: 系統必須(MUST)支援系統標題與副標題設定。
- **FR-003**: 系統應該(SHOULD)支援主題色設定,即時預覽與套用。
- **FR-004**: 系統應該(SHOULD)支援導覽選單自訂,含排序、隱藏、重新命名。
- **FR-005**: 系統可以(MAY)支援多套版面配置,依團隊或使用者切換。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| LayoutConfig | 版面配置 | 系統級設定 |
| ThemeCustomization | 主題自訂設定 | 屬於 LayoutConfig |
| NavigationMenu | 導覽選單配置 | 屬於 LayoutConfig |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: Logo 圖片的格式與大小限制]
- [NEEDS CLARIFICATION: 主題色變更的即時生效機制]"""
        }
    else:  # license
        return {
            'user_story': """管理員需要查看與管理授權資訊,包含授權狀態、到期時間、使用量限制等。""",
            'acceptance_scenarios': """1. **Given** 管理員進入授權頁面,**When** 系統載入資料,**Then** 應顯示授權類型、到期時間、使用量、限制
2. **Given** 授權即將到期,**When** 距離到期少於 30 天,**Then** 系統應顯示警告並發送提醒郵件
3. **Given** 管理員上傳新授權,**When** 選擇授權檔案並匯入,**Then** 系統應驗證並更新授權資訊""",
            'edge_cases': """- 當授權過期時,應限制功能存取並顯示續約提示
- 當使用量超過限制時,應拒絕新增並通知管理員
- 當授權檔案格式錯誤時,應拒絕匯入並顯示錯誤訊息""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)顯示授權類型、到期時間、使用量、限制。
- **FR-002**: 系統必須(MUST)支援授權檔案上傳與匯入,驗證簽章與有效性。
- **FR-003**: 系統應該(SHOULD)在授權即將到期時發送提醒通知。
- **FR-004**: 系統應該(SHOULD)依授權限制控制功能存取與資源配額。
- **FR-005**: 系統可以(MAY)提供授權歷史記錄,追蹤變更與續約。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| License | 授權資訊,含類型與限制 | 系統級設定 |
| LicenseUsage | 授權使用量統計 | 關聯 License |
| LicenseHistory | 授權歷史記錄 | 關聯 License |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 授權檔案的簽章驗證機制]
- [NEEDS CLARIFICATION: 授權限制的強制執行策略]"""
        }

def get_profile_specs(module_id: str, module_name: str) -> dict:
    """個人設定類別規格"""
    base_observability = {
        'logging': '✅', 'logging_desc': '記錄設定變更事件',
        'metrics': '⚠️', 'metrics_desc': '追蹤設定變更頻率,無即時指標',
        'rbac': '✅', 'rbac_desc': '使用者僅可修改自己的設定',
        'i18n': '✅', 'i18n_desc': '所有設定項目支援多語言',
        'theme': '✅', 'theme_desc': '表單與狀態使用語義色'
    }

    if "info" in module_id:
        return {
            'user_story': """使用者需要查看與編輯個人資訊,包含名稱、郵箱、頭像等基本資料。""",
            'acceptance_scenarios': """1. **Given** 使用者進入個人資訊頁面,**When** 系統載入資料,**Then** 應顯示當前名稱、郵箱、頭像、角色
2. **Given** 使用者編輯名稱,**When** 修改並儲存,**Then** 系統應更新並即時反映於導覽列
3. **Given** 使用者上傳頭像,**When** 選擇圖片並儲存,**Then** 系統應更新並即時顯示""",
            'edge_cases': """- 當頭像圖片過大時,應自動壓縮或提示大小限制
- 當郵箱已被其他使用者使用時,應拒絕修改並提示
- 當必填欄位為空時,應標記錯誤並阻止儲存""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)顯示使用者名稱、郵箱、頭像、角色、所屬團隊。
- **FR-002**: 系統必須(MUST)支援名稱、頭像編輯與儲存。
- **FR-003**: 系統應該(SHOULD)支援郵箱修改,需驗證新郵箱所有權。
- **FR-004**: 系統應該(SHOULD)顯示帳號建立時間與最後登入時間。
- **FR-005**: 系統可以(MAY)支援個人簡介、聯絡方式等擴展欄位。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| UserProfile | 使用者個人資訊 | 屬於 User |
| UserAvatar | 使用者頭像 | 屬於 UserProfile |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 頭像圖片的格式與大小限制]
- [NEEDS CLARIFICATION: 郵箱修改的驗證流程]"""
        }
    elif "preference" in module_id:
        return {
            'user_story': """使用者需要設定個人偏好,包含語言、時區、主題、通知偏好等,客製化使用體驗。""",
            'acceptance_scenarios': """1. **Given** 使用者進入偏好設定頁面,**When** 系統載入資料,**Then** 應顯示當前語言、時區、主題、通知偏好
2. **Given** 使用者切換語言,**When** 選擇語言並儲存,**Then** 系統應更新並即時切換介面語言
3. **Given** 使用者調整通知偏好,**When** 勾選或取消通知類型,**Then** 系統應更新並影響後續通知發送""",
            'edge_cases': """- 當切換時區時,應即時更新所有時間顯示
- 當停用所有通知時,應警告並確認是否繼續
- 當主題設定與系統衝突時,應提供覆寫選項""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援語言設定,即時切換介面語言。
- **FR-002**: 系統必須(MUST)支援時區設定,即時更新時間顯示。
- **FR-003**: 系統應該(SHOULD)支援主題設定(淺色/深色/自動)。
- **FR-004**: 系統應該(SHOULD)支援通知偏好,勾選接收的通知類型與渠道。
- **FR-005**: 系統可以(MAY)支援介面密度設定(緊湊/標準/寬鬆)。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| UserPreference | 使用者偏好設定 | 屬於 User |
| NotificationPreference | 通知偏好 | 屬於 UserPreference |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: 語言切換的即時生效範圍]
- [NEEDS CLARIFICATION: 通知偏好的優先級與策略繼承]"""
        }
    else:  # security
        return {
            'user_story': """使用者需要管理安全設定,包含密碼修改、MFA 設定、登入裝置管理等,保護帳號安全。""",
            'acceptance_scenarios': """1. **Given** 使用者修改密碼,**When** 輸入舊密碼與新密碼並儲存,**Then** 系統應驗證並更新,強制重新登入
2. **Given** 使用者啟用 MFA,**When** 掃描 QR Code 並輸入驗證碼,**Then** 系統應綁定並要求後續登入驗證
3. **Given** 使用者查看登入裝置,**When** 檢視列表,**Then** 應顯示所有活躍會話,可遠端登出""",
            'edge_cases': """- 當新密碼不符合策略時,應標記錯誤並提示要求
- 當 MFA 裝置遺失時,應提供恢復碼驗證流程
- 當遠端登出其他裝置時,應即時撤銷 Token""",
            'functional_requirements': """- **FR-001**: 系統必須(MUST)支援密碼修改,驗證舊密碼並符合策略。
- **FR-002**: 系統必須(MUST)支援 MFA 啟用/停用,含 TOTP 與恢復碼。
- **FR-003**: 系統應該(SHOULD)顯示活躍登入會話,含裝置、IP、時間,可遠端登出。
- **FR-004**: 系統應該(SHOULD)記錄所有安全變更事件,含密碼修改、MFA 變更。
- **FR-005**: 系統可以(MAY)提供登入歷史查詢,追蹤異常登入行為。""",
            'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| UserSecurity | 使用者安全設定 | 屬於 User |
| MFAConfig | MFA 配置,含 Secret 與恢復碼 | 屬於 UserSecurity |
| LoginSession | 登入會話 | 關聯 User |""",
            'observability': base_observability,
            'clarifications': """- [NEEDS CLARIFICATION: MFA 恢復碼的生成與管理機制]
- [NEEDS CLARIFICATION: 遠端登出的 Token 撤銷實作方式]"""
        }

def get_default_specs(module_id: str, module_name: str) -> dict:
    """預設規格(用於未分類模組)"""
    return {
        'user_story': f"""使用者需要使用 {module_name} 功能,完成特定業務目標。""",
        'acceptance_scenarios': """1. **Given** 使用者進入頁面,**When** 執行操作,**Then** 系統應正確回應
2. **Given** 使用者輸入資料,**When** 提交表單,**Then** 系統應驗證並儲存""",
        'edge_cases': """- 當資料驗證失敗時,應顯示明確錯誤訊息
- 當操作失敗時,應提供重試或回退選項""",
        'functional_requirements': """- **FR-001**: 系統必須(MUST)提供 {module_name} 核心功能。
- **FR-002**: 系統應該(SHOULD)支援資料篩選與排序。
- **FR-003**: 系統可以(MAY)提供進階功能增強使用體驗。
- **FR-004**: [NEEDS CLARIFICATION: 具體功能需求待確認]""",
        'key_entities': """| 實體名稱 | 描述 | 關聯 |
|-----------|------|------|
| Entity | 主要資料實體 | 待定義 |""",
        'observability': {
            'logging': '⚠️', 'logging_desc': '需補充記錄策略',
            'metrics': '⚠️', 'metrics_desc': '需補充指標定義',
            'rbac': '⚠️', 'rbac_desc': '需補充權限設計',
            'i18n': '⚠️', 'i18n_desc': '需補充多語言支援',
            'theme': '⚠️', 'theme_desc': '需補充主題 Token 使用'
        },
        'clarifications': f"""- [NEEDS CLARIFICATION: {module_name} 的完整功能範圍與邊界]
- [NEEDS CLARIFICATION: 與其他模組的整合方式]"""
    }

def main():
    """主程式"""
    project_root = Path("/Users/zoe/Desktop/sre-platform-app")
    specs_dir = project_root / ".specify/specs/modules"
    specs_dir.mkdir(parents=True, exist_ok=True)

    print("開始生成 33 份模組級規格文件...")
    print(f"目標目錄: {specs_dir}")
    print("-" * 60)

    generated_count = 0
    for module_id, source_path in MODULE_MAPPING.items():
        module_name = MODULE_NAMES.get(module_id, module_id)
        spec_filename = f"{module_id}-spec.md"
        spec_path = specs_dir / spec_filename

        print(f"生成: {spec_filename} ({module_name})")

        spec_content = generate_spec_content(module_id, module_name, source_path)

        with open(spec_path, 'w', encoding='utf-8') as f:
            f.write(spec_content)

        generated_count += 1

    print("-" * 60)
    print(f"✅ 成功生成 {generated_count} 份模組級規格文件")
    print(f"📁 儲存位置: {specs_dir}")

if __name__ == "__main__":
    main()
