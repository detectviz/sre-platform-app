# SRE Platform Frontend Scaffold

This scaffold mirrors the structure of Grafana's frontend (`grafana-frontend/`) while aligning with the SpecKit-driven modules defined under `/specs`. It is intended as the extensible baseline for the SRE Platform Scenes application.

## Directory Layout

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── routes.tsx
    ├── core/
    │   ├── components/
    │   │   ├── layout/
    │   │   └── navigation/
    │   ├── constants/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── i18n/
    │   └── services/
    ├── features/
    │   ├── platform-auth/
    │   ├── identity-access-management/
    │   ├── platform-navigation/
    │   ├── platform-mail/
    │   ├── platform-tag/
    │   ├── platform-grafana/
    │   ├── resources-management/
    │   ├── insight-log/
    │   ├── insight-analysis/
    │   ├── incident-rules/
    │   ├── incident-list/
    │   ├── notification-management/
    │   ├── automation-management/
    │   ├── dashboards-management/
    │   ├── user-profile/
    │   ├── navigation/
    │   └── settings/
    ├── scenes/
    │   ├── dashboards/
    │   ├── incidents/
    │   ├── insight/
    │   ├── navigation/
    │   └── resources/
    └── ui/
        └── components/
```

## Module Mapping

Each feature directory aligns with the corresponding specification under `/specs` and follows Grafana's feature module conventions:

| Spec | Feature Directory | Primary Pages |
| ---- | ----------------- | ------------- |
| 001-platform-auth | `features/platform-auth` | `AuthSettingsPage` |
| 002-identity-access-management | `features/identity-access-management` | `PersonnelManagementPage`, `TeamManagementPage`, `RoleManagementPage` |
| 003-platform-navigation | `features/platform-navigation` | `NavigationSettingsPage` |
| 004-platform-mail | `features/platform-mail` | `MailSettingsPage` |
| 005-platform-tag | `features/platform-tag` | `TagManagementPage` |
| 006-platform-grafana | `features/platform-grafana` | `GrafanaSettingsPage` |
| 007-resources-management | `features/resources-management` | `ResourceListPage`, `ResourceGroupPage`, `AutoDiscoveryPage`, `DatasourceManagementPage`, `ResourceTopologyPage` |
| 008-insight-log | `features/insight-log` | `LogExplorerPage` |
| 009-insight-analysis | `features/insight-analysis` | `BacktestingPage`, `CapacityPlanningPage` |
| 010-incident-rules | `features/incident-rules` | `AlertRulePage`, `SilenceRulePage` |
| 011-incident-list | `features/incident-list` | `IncidentListPage` |
| 012-notification-management | `features/notification-management` | `NotificationStrategyPage`, `NotificationChannelPage`, `NotificationHistoryPage` |
| 013-automation-management | `features/automation-management` | `AutomationPlaybooksPage`, `AutomationTriggersPage`, `AutomationHistoryPage` |
| 014-dashboards-management | `features/dashboards-management` | `DashboardListPage`, `DashboardEditorPage`, `SREWarRoomPage` |
| 015-user-profile | `features/user-profile` | `UserProfilePage` |

The `features/navigation` module provides dynamic navigation registration, while `features/settings` consolidates system settings with lazy loading to satisfy the dynamic mount requirement.

## Grafana Alignment

- **Navigation Shell**: `core/components/navigation` reproduces the Grafana Chrome header, sidebar, and breadcrumb patterns.
- **Theme**: All components use Theme2 tokens through `useTheme2` from `@grafana/ui`.
- **Scenes**: Each visualization-heavy module exposes a scene under `src/scenes` to integrate with Grafana Scenes SDK.
- **Observability & Security**: Core services provide logging, metrics, notification, audit, and RBAC enforcement consistent with the platform constitution.

## Scripts

Quality gates mandated by the platform constitution are implemented as Node scripts under `frontend/scripts`. They are referenced by npm scripts in `package.json` and act as placeholders for the CI automation that validates observability, security, consistency, i18n, data closed-loop, mock fidelity, and contract generation.
