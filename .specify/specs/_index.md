# SRE 平台規格文件索引

**建立日期**: 2025-10-06
**狀態**: Final
**憲法版本**: 1.2.0
**總文件數**: 32 份

---

## 一、概覽

本索引涵蓋 SRE 平台的完整規格文件體系,包含:
- **24 份模組級規格** (Module Specifications)
- **8 份系統層規範** (System-level Specifications)

所有規格文件皆依據 `.specify/memory/constitution.md` v1.2.0 制定,確保符合平台憲法原則。

---

## 二、模組級規格 (23 份)

### Incidents (事件管理) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| incidents-list | 事件列表管理 | [incidents-list-spec.md](modules/incidents-list-spec.md) | pages/incidents/IncidentListPage.tsx |
| incidents-alert | 告警規則管理 | [incidents-alert-spec.md](modules/incidents-alert-spec.md) | pages/incidents/AlertRulePage.tsx |
| incidents-silence | 靜音規則管理 | [incidents-silence-spec.md](modules/incidents-silence-spec.md) | pages/incidents/SilenceRulePage.tsx |

### Resources (資源管理) - 2 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| resources-management | 資源管理 | [resources-management-spec.md](modules/resources-management-spec.md) | pages/resources/ResourceManagementPage.tsx |
| resources-discovery | 資源探索 | [resources-discovery-spec.md](modules/resources-discovery-spec.md) | pages/resources/ResourceOverviewPage.tsx |

### Dashboards (儀表板) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| dashboards-management | 儀表板管理 | [dashboards-management-spec.md](modules/dashboards-management-spec.md) | pages/dashboards/DashboardManagementPage.tsx |

### Insights (洞察分析) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| insights-analysis | 洞察分析 | [insights-analysis-spec.md](modules/insights-analysis-spec.md) | pages/analysis/InsightsAnalysisPage.tsx |

### Automation (自動化) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| automation-playbook | 自動化劇本 | [automation-playbook-spec.md](modules/automation-playbook-spec.md) | pages/automation/AutomationPlaybooksPage.tsx |
| automation-trigger | 觸發器管理 | [automation-trigger-spec.md](modules/automation-trigger-spec.md) | pages/automation/AutomationTriggersPage.tsx |
| automation-history | 執行歷史 | [automation-history-spec.md](modules/automation-history-spec.md) | pages/automation/AutomationHistoryPage.tsx |

### Identity (身份與存取) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| identity-access-management | 身份與存取管理 | [identity-access-management-spec.md](modules/identity-access-management-spec.md) | pages/settings/identity-access/AccessManagementPage.tsx |

### Notifications (通知管理) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| notification-channel | 通知渠道 | [notification-channel-spec.md](modules/notification-channel-spec.md) | pages/settings/notification-management/NotificationChannelPage.tsx |
| notification-strategy | 通知策略 | [notification-strategy-spec.md](modules/notification-strategy-spec.md) | pages/settings/notification-management/NotificationStrategyPage.tsx |
| notification-history | 通知歷史 | [notification-history-spec.md](modules/notification-history-spec.md) | pages/settings/notification-management/NotificationHistoryPage.tsx |

> **業務流關聯說明**：  
> 三個模組共同構成完整的通知生命週期：  
> `notification-channel` 為 **設定層**，定義通知傳輸方式；  
> `notification-strategy` 為 **邏輯層**，設定發送規則與條件；  
> `notification-history` 為 **觀測層**，負責記錄所有通知事件與結果。  
> 三者形成自下而上的依賴鏈：「Channel → Strategy → History」，確保通知流程可控、可追蹤與可審計。

### Platform (平台設定) - 5 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| platform-auth | 身份驗證設定 | [platform-auth-spec.md](modules/platform-auth-spec.md) | pages/settings/platform/AuthSettingsPage.tsx |
| platform-grafana | Grafana 整合 | [platform-grafana-spec.md](modules/platform-grafana-spec.md) | pages/settings/platform/GrafanaSettingsPage.tsx |
| platform-mail | 郵件設定 | [platform-mail-spec.md](modules/platform-mail-spec.md) | pages/settings/platform/MailSettingsPage.tsx |
| platform-tag | 標籤管理 | [platform-tag-spec.md](modules/platform-tag-spec.md) | pages/settings/platform/TagManagementPage.tsx |
| platform-license | 授權管理 | [platform-license-spec.md](modules/platform-license-spec.md) | pages/settings/platform/LicensePage.tsx |

### Profile (個人設定) - 3 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| profile-info | 個人資訊 | [profile-info-spec.md](modules/profile-info-spec.md) | pages/profile/PersonalInfoPage.tsx |
| profile-preference | 偏好設定 | [profile-preference-spec.md](modules/profile-preference-spec.md) | pages/profile/PreferenceSettingsPage.tsx |
| profile-security | 安全設定 | [profile-security-spec.md](modules/profile-security-spec.md) | pages/profile/SecuritySettingsPage.tsx |

---

## 四、系統層規範 (8 份)

| 規範 ID | 規範名稱 | 檔案路徑 | 適用範圍 |
|---------|----------|----------|----------|
| scene-architecture-plan | Scenes 架構計畫 | [scene-architecture-plan.md](system/scene-architecture-plan.md) | 全平台結構與模組關聯 |
| scene-crud-interaction-pattern | CRUD 互動模式 | [scene-crud-interaction-pattern.md](system/scene-crud-interaction-pattern.md) | 所有 CRUD 模組(20+) |
| scene-governance-observability-spec | 治理與觀測規範 | [scene-governance-observability-spec.md](system/scene-governance-observability-spec.md) | 全平台治理與觀測 |
| scene-interaction-pattern | 互動層規範 | [scene-interaction-pattern.md](system/scene-interaction-pattern.md) | 所有上下文場景互動 |
| scene-table-guideline | 表格行為與設計系統 | [scene-table-guideline.md](system/scene-table-guideline.md) | 所有表格模組(18+) |
| scene-auditing-spec | 審計規範 | [scene-auditing-spec.md](system/scene-auditing-spec.md) | 全平台審計與行為追蹤 |
| scene-observability-spec | 可觀測性規範 | [scene-observability-spec.md](system/scene-observability-spec.md) | 全平台監測與遙測 |
| scene-rbac-spec | 權限控制規範 | [scene-rbac-spec.md](system/scene-rbac-spec.md) | 全平台權限管理 |

---

## 五、平台規範 (0 份)

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
- **表格行為與設計系統**: 適用 18+ 模組
- **互動層規範**: 所有上下文場景互動
- **治理與觀測規範**: 全平台治理與觀測
- **Scenes 架構計畫**: 全平台結構與模組關聯

---

## 七、文件狀態統計

| 類別 | 總數 | Draft | Review | Approved |
|------|------|-------|--------|----------|
| 模組規格 | 23 | 0 | 0 | 23 |
| 通用規範 | 8 | 0 | 0 | 8 |
| 平台規範 | 0 | 0 | 0 | 0 |
| **合計** | **31** | **0** | **0** | **31** |

---

## 八、快速導航

### 依功能分類

- **事件與告警**: incidents-list, incidents-alert, incidents-silence
- **資源管理**: resources-management, resources-discovery
- **視覺化**: dashboards-management
- **分析洞察**: insights-analysis
- **自動化**: automation-* (3 份)
- **身份與權限**: identity-access-management
- **通知**: notification-* (3 份)
- **系統設定**: platform-* (5 份), profile-* (3 份)

### 依優先級分類

#### P0 (關鍵功能)
- incidents-list, incidents-alert
- resources-management
- dashboards-management
- identity-access-management

#### P1 (重要功能)
- incidents-silence
- resources-discovery
- automation-playbook, automation-trigger
- notification-channel, notification-strategy

#### P2 (輔助功能)
- insights-analysis, automation-history
- notification-history
- platform-*

#### P3 (個人化)
- profile-*

---

## 九、更新記錄

| 日期 | 變更內容 | 變更者 |
|------|----------|--------|
| 2025-10-10 | 將 common/ 重新命名為 system/ ，統一為系統層規範 | AI Agent |
| 2025-10-09 | 移除平台規範 (3 份)，整併至通用 Scenes 規範層 | AI Agent |
| 2025-10-09 | 移除元件級規格 (7 份)，整併為通用 Scenes 規範 | AI Agent |
| 2025-10-08 | 更新通用規範為 Scenes 架構版本，擴充至 5 份文件 | AI Agent |
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

- **模組規格**：成功產生固定的 23 份模組級規格文件，存放於 `specs/modules/`。
- **元件規格**：根據元件的重用性與複雜度，動態生成了 7 份關鍵元件規格，如 `Toolbar`, `Drawer`, `UnifiedSearchModal` 等。
- **通用規範**：抽象出 5 份通用設計規範，包括 Scenes 架構計畫、CRUD 互動模式、治理與觀測規範、互動層規範、表格行為與設計系統。
- **平台規範**：建立 3 份平台級規範，涵蓋 RBAC 權限、審計日誌、觀測性等核心平台功能。
- **釐清與解決**：透過與使用者多輪的互動，成功解決了初始版本中標記的 285 項 `[NEEDS CLARIFICATION]` 問題，並將解決方案整合至所有相關文件中。
- **品質校閱**：產出 `_review.md` 報告，確保所有文件符合模板、憲法，並標記出已解決的 `[VIOLATION]` 項目。

此提交代表了整個規格逆向工程任務的最終交付成果。
