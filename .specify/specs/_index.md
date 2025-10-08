# SRE 平台規格文件索引

**建立日期**: 2025-10-06
**最後更新**: 2025-10-08
**狀態**: Final
**憲法版本**: 1.3.0
**總文件數**: 24 份

---

## 一、概覽

本索引涵蓋 SRE 平台的完整規格文件體系,包含:
- **16 份模組級規格** (Module Specifications) - 經整合優化後
- **8 份系統層規範** (System-level Specifications)

所有規格文件皆依據 `.specify/memory/constitution.md` v1.3.0 制定,確保符合平台憲法原則。

**整合更新**: 根據 `USER_SCENARIOS_ENHANCEMENT_GUIDE.md` v3.0.0，已將原本 24 個模組整合為 16 個模組，提升維護效率與使用者體驗。

---

## 二、模組級規格 (16 份)

### Incidents (事件管理) - 2 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 | 整合說明 |
|---------|----------|----------|----------|----------|
| incidents-list | 事件列表管理 | [incidents-list-spec.md](modules/incidents-list-spec.md) | pages/incidents/IncidentListPage.tsx | 獨立維護 |
| incident-rules | 事件規則管理 | [incident-rules-spec.md](modules/incident-rules-spec.md) | pages/incidents/IncidentRulesPage.tsx | 整合 `incidents-alert` + `incidents-silence` |

### Resources (資源管理) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 | 整合說明 |
|---------|----------|----------|----------|----------|
| resources-management | 資源管理與探索 | [resources-management-spec.md](modules/resources-management-spec.md) | pages/resources/ResourceManagementPage.tsx | 整合 `resources-discovery` + `resources-management` |

### Dashboards (儀表板) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| dashboards-management | 儀表板管理 | [dashboards-management-spec.md](modules/dashboards-management-spec.md) | pages/dashboards/DashboardManagementPage.tsx |

### Insights (洞察分析) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| insights-analysis | 洞察分析 | [insights-analysis-spec.md](modules/insights-analysis-spec.md) | pages/analysis/InsightsAnalysisPage.tsx |

### Automation (自動化) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 | 整合說明 |
|---------|----------|----------|----------|----------|
| automation-management | 自動化管理 | [automation-management-spec.md](modules/automation-management-spec.md) | pages/automation/AutomationManagementPage.tsx | 整合 `automation-playbook` + `automation-trigger` + `automation-history` |

### Identity (身份與存取) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| identity-access-management | 身份與存取管理 | [identity-access-management-spec.md](modules/identity-access-management-spec.md) | pages/settings/identity-access/AccessManagementPage.tsx |

### Notifications (通知管理) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 | 整合說明 |
|---------|----------|----------|----------|----------|
| notification-management | 通知管理 | [notification-management-spec.md](modules/notification-management-spec.md) | pages/settings/notification-management/NotificationManagementPage.tsx | 整合 `notification-channel` + `notification-strategy` + `notification-history` |

> **整合說明**：  
> 原有的三個模組已整合為統一的通知管理介面，包含完整的通知生命週期管理：  
> - **設定層**：定義通知傳輸管道與配置  
> - **邏輯層**：設定發送規則與觸發條件  
> - **觀測層**：記錄所有通知事件與結果追蹤  
> 整合後提升操作流暢度，減少頁面跳轉，提升使用者體驗。

### Platform (平台設定) - 5 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 |
|---------|----------|----------|----------|
| platform-auth | 身份驗證設定 | [platform-auth-spec.md](modules/platform-auth-spec.md) | pages/settings/platform/AuthSettingsPage.tsx |
| platform-grafana | Grafana 整合 | [platform-grafana-spec.md](modules/platform-grafana-spec.md) | pages/settings/platform/GrafanaSettingsPage.tsx |
| platform-mail | 郵件設定 | [platform-mail-spec.md](modules/platform-mail-spec.md) | pages/settings/platform/MailSettingsPage.tsx |
| platform-tag | 標籤管理 | [platform-tag-spec.md](modules/platform-tag-spec.md) | pages/settings/platform/TagManagementPage.tsx |
| platform-license | 授權管理 | [platform-license-spec.md](modules/platform-license-spec.md) | pages/settings/platform/LicensePage.tsx |

### Profile (個人設定) - 1 份

| 模組 ID | 模組名稱 | 檔案路徑 | 來源頁面 | 整合說明 |
|---------|----------|----------|----------|----------|
| user-profile | 使用者個人資料 | [user-profile-spec.md](modules/user-profile-spec.md) | pages/profile/UserProfilePage.tsx | 整合 `profile-info` + `profile-preference` + `profile-security` |

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

| 類別 | 總數 | Draft | Review | Approved | 整合說明 |
|------|------|-------|--------|----------|----------|
| 模組規格 | 16 | 0 | 0 | 16 | 經整合優化（原24個→16個） |
| 系統層規範 | 8 | 0 | 0 | 8 | - |
| **合計** | **24** | **0** | **0** | **24** | 減少8個重複模組文件 |

---

## 八、快速導航

### 依功能分類

- **事件與告警**: incidents-list, incident-rules
- **資源管理**: resources-management (整合探索與管理)
- **視覺化**: dashboards-management
- **分析洞察**: insights-analysis
- **自動化**: automation-management (整合劇本、觸發器與歷史)
- **身份與權限**: identity-access-management
- **通知**: notification-management (整合管道、策略與歷史)
- **系統設定**: platform-* (5 份), user-profile (整合個人設定)

### 依優先級分類

#### P0 (關鍵功能)
- incidents-list, incident-rules
- resources-management
- dashboards-management
- identity-access-management

#### P1 (重要功能)
- automation-management
- notification-management

#### P2 (輔助功能)
- insights-analysis
- platform-* (5 份)

#### P3 (個人化)
- user-profile

---

## 九、更新記錄

| 日期 | 變更內容 | 變更者 |
|------|----------|--------|
| 2025-10-08 | 根據 USER_SCENARIOS_ENHANCEMENT_GUIDE.md 整合模組規格：24個模組 → 16個模組 | Claude Code Assistant |
| 2025-10-08 | 合併 automation-* (3個) → automation-management-spec.md | Claude Code Assistant |
| 2025-10-08 | 合併 notification-* (3個) → notification-management-spec.md | Claude Code Assistant |
| 2025-10-08 | 合併 profile-* (3個) → user-profile-spec.md | Claude Code Assistant |
| 2025-10-08 | 合併 resources-* (2個) → resources-management-spec.md (擴展版) | Claude Code Assistant |
| 2025-10-08 | 合併 incidents-alert + incidents-silence → incident-rules-spec.md | Claude Code Assistant |
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
- [使用者情境補充指南 (User Scenarios Enhancement Guide)](modules/USER_SCENARIOS_ENHANCEMENT_GUIDE.md)

---

## 十一、聯絡與回饋

如發現規格文件缺失、不一致或需要澄清的內容,請標記 `[NEEDS CLARIFICATION]` 並提交至檢查報告。

---

## 十二、專案成果總結

- **模組規格**：成功產生固定的 16 份模組級規格文件（經整合優化，原24個模組精簡為16個），存放於 `specs/modules/`。
- **系統層規範**：維持 8 份系統層規範文件，涵蓋 Scenes 架構、CRUD 互動、治理觀測等核心規範。
- **模組整合**：根據 `USER_SCENARIOS_ENHANCEMENT_GUIDE.md` 完成模組整合優化：
  - Automation 群集：3個模組 → 1個整合模組
  - Notification 群集：3個模組 → 1個整合模組
  - Profile 群集：3個模組 → 1個整合模組
  - Resources 群集：2個模組 → 1個擴展模組
  - Incidents 群集：3個模組 → 2個模組（部分整合）
- **釐清與解決**：透過與使用者多輪的互動，成功解決了初始版本中標記的 285 項 `[NEEDS CLARIFICATION]` 問題，並將解決方案整合至所有相關文件中。
- **品質校閱**：產出 `_review.md` 報告，確保所有文件符合模板、憲法，並標記出已解決的 `[VIOLATION]` 項目。

此提交代表了整個規格逆向工程任務的整合優化成果，提升了文檔維護效率與使用者體驗。
