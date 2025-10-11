# SRE Platform Frontend Scaffold

本前端骨架依照 Grafana `public/app` 架構與 Scenes SDK 慣例建置，提供 SRE Platform 模組化開發的基礎。所有模組均對應 `/specs` 目錄的定義，保留規格名稱（不含目錄編號）。

## 目錄導覽

```
frontend/
├── public/
│   └── locales/                  # i18n 字詞 (en/zh)
├── scripts/                      # 自動檢查腳本骨架
├── src/
│   ├── core/                     # 核心框架 (contexts, services, navigation)
│   ├── features/                 # 功能模組 (依 specs 分區)
│   ├── scenes/                   # 全域 Scenes 集合
│   ├── ui/                       # 共用 UI 元件與主題封裝
│   ├── App.tsx                   # 應用容器，注入導覽與主題
│   ├── main.tsx                  # React/Vite 入口
│   └── routes.tsx                # 單一來源的路由宣告
├── index.html                    # Vite 模板
├── package.json                  # 依賴與腳本
├── tsconfig.json                 # TypeScript 設定
└── vite.config.ts                # Vite 設定
```

## 模組對應

| Specs 模組 | Feature 路徑 | Page | Scene |
|------------|---------------|------|-------|
| 001-platform-auth | `features/settings/platform-auth` | `AuthSettingsPage` | `AuthSettingsScene` |
| 002-identity-access-management | `features/iam/identity-access-management` | `PersonnelManagementPage`, `TeamManagementPage`, `RoleManagementPage` | `IamOverviewScene` |
| 003-platform-navigation | `features/settings/platform-navigation`, `features/navigation/platform-navigation` | `NavigationSettingsPage`, `NavigationWorkbenchPage` | `NavigationModelScene` |
| 004-platform-mail | `features/settings/platform-mail` | `MailSettingsPage` | `MailPipelineScene` |
| 005-platform-tag | `features/settings/platform-tag` | `TagManagementPage` | `TagGovernanceScene` |
| 006-platform-grafana | `features/settings/platform-grafana` | `GrafanaSettingsPage` | `GrafanaBridgeScene` |
| 007-resources-management | `features/resources/resources-management` | `ResourceListPage` 等 | `ResourceTopologyScene` |
| 008-insight-log | `features/insight/insight-log` | `LogExplorerPage` | `LogInsightScene` |
| 009-insight-analysis | `features/insight/insight-analysis` | `BacktestingPage`, `CapacityPlanningPage` | `InsightForecastScene` |
| 010-incident-rules | `features/incidents/incident-rules` | `AlertRulePage`, `SilenceRulePage` | `IncidentRulesScene` |
| 011-incident-list | `features/incidents/incident-list` | `IncidentListPage` | `IncidentTimelineScene` |
| 012-notification-management | `features/notification/notification-management` | `NotificationStrategyPage` 等 | `NotificationFlowScene` |
| 013-automation-management | `features/automation/automation-management` | `AutomationPlaybooksPage` 等 | `AutomationRunbookScene` |
| 014-dashboards-management | `features/dashboards/dashboards-management` | `DashboardListPage` 等 | `SreDashboardScene` |
| 015-user-profile | `features/profile/user-profile` | `PersonalInfoPage` 等 | `UserPreferenceScene` |

## Grafana 對照

- **Header / Sidebar**：`core/components/navigation` 下的 `NavHeader`、`NavSidebar` 參照 `grafana/public/app/core/components/AppChrome` 實作。
- **Page 結構**：所有 Page 採用 `@grafana/ui` 的 `Page`, `PageHeader`, `PageToolbar`。
- **Scenes**：各模組的 Scenes 封裝於 `features/**/scenes`，並集中由 `src/scenes/index.ts` 匯出。
- **路由**：`src/routes.tsx` 為唯一路由宣告點，模組透過動態掛載註冊。

## 品質檢查

`scripts/` 目錄提供六大自動檢查骨架，對應 Observability、Security、Consistency、i18n、Data Closed Loop 與 Mock Consistency。實際邏輯可依 CI 需求擴充。

## 開發步驟

1. `npm install`
2. `npm run dev`
3. 若需驗證規格對齊，執行 `pnpm check:all`

所有實作需遵循 `.specify/memory/constitution.md` 與 `.specify/memory/development-guideline.md`。
