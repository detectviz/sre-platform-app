# SRE 平台規格文件索引

**建立日期**: 2025-10-06
**狀態**: Final
**憲法版本**: 1.2.0
**總文件數**: 46 份

---

## 一、概覽

本索引涵蓋 SRE 平台的完整規格文件體系,包含:
- **33 份模組級規格** (Module Specifications)
- **7 份元件級規格** (Component Specifications)
- **3 份通用規範** (Common Specifications)
- **3 份平台規範** (Platform Specifications)

所有規格文件皆依據 `.specify/memory/constitution.md` v1.2.0 制定,確保符合平台憲法原則。

---

## 二、模組級規格 (33 份)

### Incidents (事件管理) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| incidents-list | 事件列表管理 | [incidents-list-spec.md](modules/incidents-list-spec.md) | pages/incidents/IncidentListPage.tsx |
| incidents-alert | 告警規則管理 | [incidents-alert-spec.md](modules/incidents-alert-spec.md) | pages/incidents/AlertRulePage.tsx |
| incidents-silence | 靜音規則管理 | [incidents-silence-spec.md](modules/incidents-silence-spec.md) | pages/incidents/SilenceRulePage.tsx |

### Resources (資源管理) - 6 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| resources-group | 資源群組管理 | [resources-group-spec.md](modules/resources-group-spec.md) | pages/resources/ResourceGroupPage.tsx |
| resources-list | 資源列表管理 | [resources-list-spec.md](modules/resources-list-spec.md) | pages/resources/ResourceListPage.tsx |
| resources-topology | 資源拓撲圖 | [resources-topology-spec.md](modules/resources-topology-spec.md) | pages/resources/ResourceTopologyPage.tsx |
| resources-discovery | 資源探索 | [resources-discovery-spec.md](modules/resources-discovery-spec.md) | pages/resources/ResourceOverviewPage.tsx |
| resources-datasource | 資料源管理 | [resources-datasource-spec.md](modules/resources-datasource-spec.md) | pages/resources/DatasourceManagementPage.tsx |
| resources-auto-discovery | 自動發現配置 | [resources-auto-discovery-spec.md](modules/resources-auto-discovery-spec.md) | pages/resources/AutoDiscoveryPage.tsx |

### Dashboards (儀表板) - 2 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| dashboards-list | 儀表板列表 | [dashboards-list-spec.md](modules/dashboards-list-spec.md) | pages/dashboards/DashboardListPage.tsx |
| dashboards-template | 儀表板範本 | [dashboards-template-spec.md](modules/dashboards-template-spec.md) | pages/dashboards/DashboardTemplatesPage.tsx |

### Insights (洞察分析) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| insights-backtesting | 回測分析 | [insights-backtesting-spec.md](modules/insights-backtesting-spec.md) | pages/analysis/BacktestingPage.tsx |
| insights-capacity | 容量規劃 | [insights-capacity-spec.md](modules/insights-capacity-spec.md) | pages/analysis/CapacityPlanningPage.tsx |
| insights-log | 日誌探索 | [insights-log-spec.md](modules/insights-log-spec.md) | pages/analysis/LogExplorerPage.tsx |

### Automation (自動化) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| automation-playbook | 自動化劇本 | [automation-playbook-spec.md](modules/automation-playbook-spec.md) | pages/automation/AutomationPlaybooksPage.tsx |
| automation-trigger | 觸發器管理 | [automation-trigger-spec.md](modules/automation-trigger-spec.md) | pages/automation/AutomationTriggersPage.tsx |
| automation-history | 執行歷史 | [automation-history-spec.md](modules/automation-history-spec.md) | pages/automation/AutomationHistoryPage.tsx |

### Identity (身份與存取) - 4 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| identity-personnel | 人員管理 | [identity-personnel-spec.md](modules/identity-personnel-spec.md) | pages/settings/identity-access/PersonnelManagementPage.tsx |
| identity-role | 角色管理 | [identity-role-spec.md](modules/identity-role-spec.md) | pages/settings/identity-access/RoleManagementPage.tsx |
| identity-team | 團隊管理 | [identity-team-spec.md](modules/identity-team-spec.md) | pages/settings/identity-access/TeamManagementPage.tsx |
| identity-audit | 審計日誌 | [identity-audit-spec.md](modules/identity-audit-spec.md) | pages/settings/identity-access/AuditLogsPage.tsx |

### Notifications (通知管理) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| notification-channel | 通知渠道 | [notification-channel-spec.md](modules/notification-channel-spec.md) | pages/settings/notification-management/NotificationChannelPage.tsx |
| notification-strategy | 通知策略 | [notification-strategy-spec.md](modules/notification-strategy-spec.md) | pages/settings/notification-management/NotificationStrategyPage.tsx |
| notification-history | 通知歷史 | [notification-history-spec.md](modules/notification-history-spec.md) | pages/settings/notification-management/NotificationHistoryPage.tsx |

### Platform (平台設定) - 6 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| platform-auth | 身份驗證設定 | [platform-auth-spec.md](modules/platform-auth-spec.md) | pages/settings/platform/AuthSettingsPage.tsx |
| platform-grafana | Grafana 整合 | [platform-grafana-spec.md](modules/platform-grafana-spec.md) | pages/settings/platform/GrafanaSettingsPage.tsx |
| platform-mail | 郵件設定 | [platform-mail-spec.md](modules/platform-mail-spec.md) | pages/settings/platform/MailSettingsPage.tsx |
| platform-tag | 標籤管理 | [platform-tag-spec.md](modules/platform-tag-spec.md) | pages/settings/platform/TagManagementPage.tsx |
| platform-layout | 版面設定 | [platform-layout-spec.md](modules/platform-layout-spec.md) | pages/settings/platform/LayoutSettingsPage.tsx |
| platform-license | 授權管理 | [platform-license-spec.md](modules/platform-license-spec.md) | pages/settings/platform/LicensePage.tsx |

### Profile (個人設定) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| profile-info | 個人資訊 | [profile-info-spec.md](modules/profile-info-spec.md) | pages/profile/PersonalInfoPage.tsx |
| profile-preference | 偏好設定 | [profile-preference-spec.md](modules/profile-preference-spec.md) | pages/profile/PreferenceSettingsPage.tsx |
| profile-security | 安全設定 | [profile-security-spec.md](modules/profile-security-spec.md) | pages/profile/SecuritySettingsPage.tsx |

---

## 三、元件級規格 (7 份)

| 元件 ID | 元件名稱 | 檔案路徑 | 使用次數 | 主要使用模組 |
|---------|----------|----------|----------|--------------|
| unified-search-modal | 統一搜尋模態框 | [unified-search-modal-spec.md](components/unified-search-modal-spec.md) | 15+ | incidents-list, alert-rules, resources-list |
| column-settings-modal | 欄位設定模態框 | [column-settings-modal-spec.md](components/column-settings-modal-spec.md) | 12+ | incidents-list, alert-rules, resources-list |
| table-container | 表格容器 | [table-container-spec.md](components/table-container-spec.md) | 21 | incidents-list, alert-rules, resources-list |
| toolbar | 工具列 | [toolbar-spec.md](components/toolbar-spec.md) | 22 | incidents-list, alert-rules, resources-list |
| pagination | 分頁元件 | [pagination-spec.md](components/pagination-spec.md) | 21 | incidents-list, alert-rules, resources-list |
| drawer | 抽屜元件 | [drawer-spec.md](components/drawer-spec.md) | 10+ | incidents-list, resources-list, resource-groups |
| quick-filter-bar | 快速篩選列 | [quick-filter-bar-spec.md](components/quick-filter-bar-spec.md) | 8+ | resources-list, incidents-list, dashboards |

---

## 四、通用規範 (3 份)

| 規範 ID | 規範名稱 | 檔案路徑 | 適用範圍 |
|---------|----------|----------|----------|
| crud-interaction-pattern | CRUD 互動模式 | [crud-interaction-pattern.md](common/crud-interaction-pattern.md) | 所有 CRUD 模組(20+) |
| table-design-system | 表格設計系統 | [table-design-system.md](common/table-design-system.md) | 所有表格模組(18+) |
| modal-interaction-pattern | Modal 互動模式 | [modal-interaction-pattern.md](common/modal-interaction-pattern.md) | 所有使用 Modal/Drawer 的模組(15+) |

---

## 五、平台規範 (3 份)

| 規範 ID | 規範名稱 | 檔案路徑 | 適用範圍 |
|---------|----------|----------|----------|
| rbac | RBAC 權限系統 | [RBAC.md](RBAC.md) | 全平台權限管理 |
| auditing | 審計日誌系統 | [Auditing.md](Auditing.md) | 全平台操作審計 |
| observability | 觀測性規範 | [Observability.md](Observability.md) | 全平台監控與追蹤 |

---

## 六、依賴關係圖

### 元件被模組使用統計

```
Toolbar (22)
  ├─ incidents-list, incidents-alert, incidents-silence
  ├─ resources-list, resources-group, resources-datasource
  ├─ automation-playbook, automation-trigger, automation-history
  ├─ identity-personnel, identity-role, identity-team
  ├─ notification-channel, notification-strategy, notification-history
  └─ dashboards-list, platform-tag, insights-log, ...

TableContainer (21)
  ├─ incidents-list, incidents-alert, incidents-silence
  ├─ resources-list, resources-group, resources-datasource
  ├─ automation-playbook, automation-trigger, automation-history
  ├─ identity-personnel, identity-role, identity-team
  ├─ notification-channel, notification-strategy, notification-history
  └─ dashboards-list, platform-tag, profile-security, ...

Pagination (21)
  ├─ incidents-list, incidents-alert, incidents-silence
  ├─ resources-list, resources-group, resources-datasource
  ├─ automation-playbook, automation-trigger, automation-history
  ├─ identity-personnel, identity-role, identity-team
  ├─ notification-channel, notification-strategy, notification-history
  └─ dashboards-list, platform-tag, profile-security, ...

Modal/Drawer (87+)
  ├─ AlertRuleEditModal → incidents-alert
  ├─ SilenceRuleEditModal → incidents-silence
  ├─ ResourceEditModal → resources-list
  └─ ... (分散在各模組的編輯、新增 Modal)
```

### 通用規範應用統計

- **CRUD 互動模式**: 適用 20+ 模組
- **表格設計系統**: 適用 18+ 模組
- **Modal 互動模式**: 適用 15+ 模組
- **RBAC 權限系統**: 全平台適用
- **審計日誌系統**: 全平台適用
- **觀測性規範**: 全平台適用

---

## 七、文件狀態統計

| 類別 | 總數 | Draft | Review | Approved |
|------|------|-------|--------|----------|
| 模組規格 | 33 | 0 | 0 | 33 |
| 元件規格 | 7 | 0 | 0 | 7 |
| 通用規範 | 3 | 0 | 0 | 3 |
| 平台規範 | 3 | 0 | 0 | 3 |
| **合計** | **46** | **0** | **0** | **46** |

---

## 八、快速導航

### 依功能分類

- **事件與告警**: incidents-list, incidents-alert, incidents-silence
- **資源管理**: resources-* (6 份)
- **視覺化**: dashboards-* (2 份)
- **分析洞察**: insights-* (3 份)
- **自動化**: automation-* (3 份)
- **身份與權限**: identity-* (4 份)
- **通知**: notification-* (3 份)
- **系統設定**: platform-* (6 份), profile-* (3 份)

### 依優先級分類

#### P0 (關鍵功能)
- incidents-list, incidents-alert
- resources-list, resources-group
- dashboards-list
- identity-personnel, identity-role

#### P1 (重要功能)
- incidents-silence
- resources-topology, resources-datasource
- automation-playbook, automation-trigger
- notification-channel, notification-strategy

#### P2 (輔助功能)
- insights-*, automation-history
- identity-team, identity-audit
- notification-history
- platform-*

#### P3 (個人化)
- profile-*

---

## 九、更新記錄

| 日期 | 變更內容 | 變更者 |
|------|----------|--------|
| 2025-10-06 | 初始建立,包含 33 份模組、7 份元件、3 份通用規範、3 份平台規範 | AI Agent |
| 2025-10-06 | 完成所有規格文件的審查與最終定版 | AI Agent |

---

## 十、相關文件

- [憲法 (Constitution)](../.specify/memory/constitution.md)
- [規格模板 (Spec Template)](../.specify/templates/spec-template.md)
- [檢查報告 (Review Report)](./_review.md)
- [釐清事項 (Clarifications)](./Clarifications.md)

---

## 十一、聯絡與回饋

如發現規格文件缺失、不一致或需要澄清的內容,請標記 `[NEEDS CLARIFICATION]` 並提交至檢查報告。

---

## 十二、專案成果總結

- **模組規格**：成功產生固定的 33 份模組級規格文件，存放於 `specs/modules/`。
- **元件規格**：根據元件的重用性與複雜度，動態生成了 7 份關鍵元件規格，如 `Toolbar`, `Drawer`, `UnifiedSearchModal` 等。
- **通用規範**：抽象出 3 份通用設計規範，包括表格設計、CRUD 互動模式、以及模態框與抽屜的互動模式。
- **平台規範**：建立 3 份平台級規範，涵蓋 RBAC 權限、審計日誌、觀測性等核心平台功能。
- **釐清與解決**：透過與使用者多輪的互動，成功解決了初始版本中標記的 285 項 `[NEEDS CLARIFICATION]` 問題，並將解決方案整合至所有相關文件中。
- **品質校閱**：產出 `_review.md` 報告，確保所有文件符合模板、憲法，並標記出已解決的 `[VIOLATION]` 項目。

此提交代表了整個規格逆向工程任務的最終交付成果。
