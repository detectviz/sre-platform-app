# SRE 平台規格文件索引

**建立日期**: 2025-10-06
**最後更新**: 2025-10-07
**狀態**: Production Ready
**憲法版本**: 1.2.0
**總文件數**: 52 份

---

## 一、概覽

本索引涵蓋 SRE 平台的完整規格文件體系,包含:
- **33 份模組級規格** (Module Specifications)
- **8 份元件級規格** (Component Specifications)
- **3 份通用規範** (Common Specifications)
- **5 份 API 與整合規範** (API & Integration Specifications) - 🆕 NEW
- **3 份階段性報告** (Phase Reports)

所有規格文件皆依據 `.specify/memory/constitution.md` v1.2.0 制定,確保符合平台憲法原則。

**重要里程碑**: ✅ 所有 78 項 NEEDS CLARIFICATION 已解決完成 (2025-10-07)

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

## 三、元件級規格 (8 份)

| 元件 ID | 元件名稱 | 檔案路徑 | 使用次數 | 主要使用模組 |
|---------|----------|----------|----------|--------------|
| unified-search-modal | 統一搜尋模態框 | [unified-search-modal-spec.md](components/unified-search-modal-spec.md) | 10 | incidents-list, alert-rules, resources-list |
| column-settings-modal | 欄位設定模態框 | [column-settings-modal-spec.md](components/column-settings-modal-spec.md) | 9 | incidents-list, alert-rules, resources-list |
| table-container | 表格容器 | [table-container-spec.md](components/table-container-spec.md) | 12 | incidents-list, alert-rules, resources-list |
| toolbar | 工具列 | [toolbar-spec.md](components/toolbar-spec.md) | 13 | incidents-list, alert-rules, resources-list |
| pagination | 分頁元件 | [pagination-spec.md](components/pagination-spec.md) | 12 | incidents-list, alert-rules, resources-list |
| drawer | 抽屜元件 | [drawer-spec.md](components/drawer-spec.md) | 8 | incidents-list, resources-list, resource-groups |
| modal | 模態框元件 | [modal-spec.md](components/modal-spec.md) | 11 | incidents-list, alert-rules, resources-list |
| quick-filter-bar | 快速篩選列 | [quick-filter-bar-spec.md](components/quick-filter-bar-spec.md) | 6 | resources-list, incidents-list, dashboards |

---

## 四、通用規範 (3 份)

| 規範 ID | 規範名稱 | 檔案路徑 | 適用範圍 |
|---------|----------|----------|----------|
| crud-base | CRUD 基礎需求 | [crud-base-requirements.md](common/crud-base-requirements.md) | 所有 CRUD 模組(20+) |
| table-design | 表格設計系統 | [table-design-system.md](common/table-design-system.md) | 所有表格模組(18+) |
| modal-pattern | Modal 互動模式 | [modal-interaction-pattern.md](common/modal-interaction-pattern.md) | 所有使用 Modal/Drawer 的模組(15+) |

---

## 五、API 與整合規範 (5 份) 🆕

### 5.1 核心 API 規範

| 規範 ID | 規範名稱 | 檔案路徑 | 說明 |
|---------|----------|----------|------|
| api-contract | API Contract 總規範 | [_api-contract-spec.md](_api-contract-spec.md) | 統一 API 設計原則、認證授權、快取策略 |
| backend-params | 後端參數 API 規範 | [_backend-parameters-spec.md](_backend-parameters-spec.md) | 32 項後端參數 API 定義 (認證/保留/並行/權限/業務規則) |
| collaboration | 跨域協作 API 規範 | [_collaboration-spec.md](_collaboration-spec.md) | 10 項前後端協作功能 API 定義 |

### 5.2 開發工具與指南

| 規範 ID | 規範名稱 | 檔案路徑 | 說明 |
|---------|----------|----------|------|
| mock-server | Mock Server 設定指南 | [_mock-server-setup.md](_mock-server-setup.md) | MSW + OpenTelemetry 整合指南 |
| resolution-plan-3 | 第三階段解決方案 | [_resolution-plan-phase3.md](_resolution-plan-phase3.md) | API Contract First 開發策略與時程規劃 |

### 5.3 API 涵蓋範圍

**後端參數 API (32 項)**:
- 認證與金鑰管理 (4 項)
- 資料保留與歸檔 (7 項)
- 並行與限流 (6 項)
- 權限與隔離 (6 項)
- 業務規則 (9 項)

**跨域協作 API (10 項)**:
- Drawer 預載入、KPI 更新、趨勢圖粒度
- 儀表板權限/版本、團隊權限繼承
- 批次操作限制、通知重試、觸發器防抖

---

## 六、階段性報告 (3 份)

| 階段 | 報告名稱 | 檔案路徑 | 解決項目 | 完成日期 |
|------|---------|----------|---------|---------|
| Phase 1 | 第一階段更新報告 | [_update-report.md](_update-report.md) | 15 項前端 UI/UX | 2025-10-06 |
| Phase 2 | 第二階段更新報告 | [_update-report-phase2.md](_update-report-phase2.md) | 21 項前端 UI/UX | 2025-10-06 |
| Phase 3 | 第三階段更新報告 | [_update-report-phase3.md](_update-report-phase3.md) | 32 項後端參數 + 10 項跨域協作 | 2025-10-07 |

**總計**: 78 項 NEEDS CLARIFICATION 全部解決 ✅

---

## 七、依賴關係圖

### 元件被模組使用統計

```
Toolbar (13)
  ├─ incidents-list
  ├─ incidents-alert
  ├─ incidents-silence
  ├─ resources-list
  ├─ resources-group
  ├─ dashboards-list
  └─ ...

TableContainer (12)
  ├─ incidents-list
  ├─ incidents-alert
  ├─ resources-list
  └─ ...

Pagination (12)
  ├─ incidents-list
  ├─ incidents-alert
  ├─ resources-list
  └─ ...

Modal (11)
  ├─ AlertRuleEditModal → incidents-alert
  ├─ SilenceRuleEditModal → incidents-silence
  ├─ ResourceEditModal → resources-list
  └─ ...

UnifiedSearchModal (10)
  ├─ incidents-list
  ├─ incidents-alert
  ├─ incidents-silence
  ├─ resources-list
  └─ ...

ColumnSettingsModal (9)
  ├─ incidents-list
  ├─ incidents-alert
  ├─ resources-list
  └─ ...

Drawer (8)
  ├─ IncidentDetailPage → incidents-list
  ├─ ResourceDetailPage → resources-list
  └─ ...

QuickFilterBar (6)
  ├─ resources-list
  ├─ incidents-list
  └─ ...
```

### 通用規範應用統計

- **CRUD 基礎需求**: 適用 20+ 模組
- **表格設計系統**: 適用 18+ 模組
- **Modal 互動模式**: 適用 15+ 模組

---

## 八、文件狀態統計

| 類別 | 總數 | Draft | Review | Production Ready |
|------|------|-------|--------|----------|
| 模組規格 | 33 | 33 | 0 | 0 |
| 元件規格 | 8 | 8 | 0 | 0 |
| 通用規範 | 3 | 3 | 0 | 0 |
| API 與整合規範 | 5 | 0 | 0 | 5 ✅ |
| 階段性報告 | 3 | 0 | 0 | 3 ✅ |
| **合計** | **52** | **44** | **0** | **8** |

**NEEDS CLARIFICATION 解決進度**: 78 / 78 項 (100%) ✅

---

## 九、快速導航

### 依功能分類

**業務功能模組**:
- **事件與告警**: incidents-list, incidents-alert, incidents-silence
- **資源管理**: resources-* (6 份)
- **視覺化**: dashboards-* (2 份)
- **分析洞察**: insights-* (3 份)
- **自動化**: automation-* (3 份)
- **身份與權限**: identity-* (4 份)
- **通知**: notification-* (3 份)
- **系統設定**: platform-* (6 份), profile-* (3 份)

**技術規範與整合** 🆕:
- **API 規範**: api-contract, backend-params, collaboration
- **開發工具**: mock-server-setup, resolution-plan-phase3
- **階段報告**: update-report (Phase 1-3)

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

## 十、更新記錄

| 日期 | 變更內容 | 變更者 | 影響範圍 |
|------|----------|--------|---------|
| 2025-10-06 | 初始建立,包含 33 份模組、8 份元件、3 份通用規範 | Claude Code | 44 份文件 |
| 2025-10-06 | 第一階段: 解決 15 項前端 UI/UX 決策 | Claude Code | 10 份模組/元件規格 |
| 2025-10-06 | 第二階段: 解決 21 項前端 UI/UX 決策 | Claude Code | 12 份模組/元件/通用規格 |
| 2025-10-07 | 第三階段: 新增 5 份 API 規範,解決 42 項後端參數與跨域協作 | Claude Code | +5 份新文件 + 3 份報告 |
| 2025-10-07 | 更新索引,標記 Production Ready 狀態 | Claude Code | _index.md |

**重大里程碑**:
- ✅ 2025-10-07: 所有 78 項 NEEDS CLARIFICATION 解決完成
- ✅ 2025-10-07: API Contract First 開發策略確立
- ✅ 2025-10-07: Mock Server + OpenTelemetry 整合指南完成

---

## 十一、相關文件

**核心參考**:
- [憲法 (Constitution)](../memory/constitution.md)
- [規格模板 (Spec Template)](../templates/spec-template.md)
- [檢查報告 (Review Report)](./_review.md)

**參考規範** (外部):
- [RBAC 規範](../../specs/RBAC.md)
- [Observability 規範](../../specs/Observability.md)
- [Auditing 規範](../../specs/Auditing.md)
- [Clarifications 記錄](../../specs/Clarifications.md)

**開發指南** 🆕:
- [API Contract 總規範](./_api-contract-spec.md) - RESTful API 設計標準
- [Mock Server 設定指南](./_mock-server-setup.md) - MSW + OpenTelemetry
- [第三階段解決方案](./_resolution-plan-phase3.md) - 實作策略與時程

---

## 十二、聯絡與回饋

**問題回報**:
- 規格文件缺失、不一致或需澄清的內容,請標記 `[NEEDS CLARIFICATION]`
- 所有 NEEDS CLARIFICATION 已解決,新問題請提交至 GitHub Issues

**文件貢獻**:
- 遵循 `.specify/templates/spec-template.md` 格式
- 符合 `.specify/memory/constitution.md` 原則
- 前後端協作項目需雙方 Review

---

## 十三、快速開始指南 🆕

### 前端開發者
1. 閱讀 [API Contract 總規範](./_api-contract-spec.md) 了解 API 設計原則
2. 閱讀 [Mock Server 設定指南](./_mock-server-setup.md) 建置開發環境
3. 參考對應模組 SPEC 實作 UI

### 後端開發者
1. 閱讀 [API Contract 總規範](./_api-contract-spec.md) 了解統一格式
2. 閱讀 [後端參數 API 規範](./_backend-parameters-spec.md) 實作配置 API
3. 閱讀 [跨域協作 API 規範](./_collaboration-spec.md) 實作協作功能

### 架構師/PM
1. 閱讀 [第三階段解決方案](./_resolution-plan-phase3.md) 了解整體策略
2. 閱讀 [第三階段執行報告](./_update-report-phase3.md) 了解完成狀況
3. 參考階段報告追蹤進度

---

**文件索引完成日期**: 2025-10-07
**維護者**: Claude Code (Spec Architect)
**狀態**: Production Ready ✅
