import { lazy, Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import { AuthGuard } from './core/contexts/AuthGuard';
import { LoadingOverlay } from './core/components/loading/LoadingOverlay';

const LoginPage = lazy(() => import('./features/platform-auth/pages/LoginPage'));
const AuthSettingsPage = lazy(() => import('./features/platform-auth/pages/AuthSettingsPage'));
const NavigationSettingsPage = lazy(() => import('./features/platform-navigation/pages/NavigationSettingsPage'));
const MailSettingsPage = lazy(() => import('./features/platform-mail/pages/MailSettingsPage'));
const TagManagementPage = lazy(() => import('./features/platform-tag/pages/TagManagementPage'));
const GrafanaSettingsPage = lazy(() => import('./features/platform-grafana/pages/GrafanaSettingsPage'));
const SettingsLandingPage = lazy(() => import('./features/settings/pages/SettingsLandingPage'));
const PersonnelManagementPage = lazy(() => import('./features/identity-access-management/pages/PersonnelManagementPage'));
const TeamManagementPage = lazy(() => import('./features/identity-access-management/pages/TeamManagementPage'));
const RoleManagementPage = lazy(() => import('./features/identity-access-management/pages/RoleManagementPage'));
const ResourceListPage = lazy(() => import('./features/resources-management/pages/ResourceListPage'));
const ResourceGroupPage = lazy(() => import('./features/resources-management/pages/ResourceGroupPage'));
const AutoDiscoveryPage = lazy(() => import('./features/resources-management/pages/AutoDiscoveryPage'));
const DatasourceManagementPage = lazy(() => import('./features/resources-management/pages/DatasourceManagementPage'));
const ResourceTopologyPage = lazy(() => import('./features/resources-management/pages/ResourceTopologyPage'));
const LogExplorerPage = lazy(() => import('./features/insight-log/pages/LogExplorerPage'));
const BacktestingPage = lazy(() => import('./features/insight-analysis/pages/BacktestingPage'));
const CapacityPlanningPage = lazy(() => import('./features/insight-analysis/pages/CapacityPlanningPage'));
const AlertRulePage = lazy(() => import('./features/incident-rules/pages/AlertRulePage'));
const SilenceRulePage = lazy(() => import('./features/incident-rules/pages/SilenceRulePage'));
const IncidentListPage = lazy(() => import('./features/incident-list/pages/IncidentListPage'));
const NotificationStrategyPage = lazy(() => import('./features/notification-management/pages/NotificationStrategyPage'));
const NotificationChannelPage = lazy(() => import('./features/notification-management/pages/NotificationChannelPage'));
const NotificationHistoryPage = lazy(() => import('./features/notification-management/pages/NotificationHistoryPage'));
const AutomationPlaybooksPage = lazy(() => import('./features/automation-management/pages/AutomationPlaybooksPage'));
const AutomationTriggersPage = lazy(() => import('./features/automation-management/pages/AutomationTriggersPage'));
const AutomationHistoryPage = lazy(() => import('./features/automation-management/pages/AutomationHistoryPage'));
const DashboardListPage = lazy(() => import('./features/dashboards-management/pages/DashboardListPage'));
const DashboardEditorPage = lazy(() => import('./features/dashboards-management/pages/DashboardEditorPage'));
const SREWarRoomPage = lazy(() => import('./features/dashboards-management/pages/SREWarRoomPage'));
const UserProfilePage = lazy(() => import('./features/user-profile/pages/UserProfilePage'));
const NavigationRegistryPage = lazy(() => import('./features/navigation/pages/NavigationRegistryPage'));

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/settings',
    element: (
      <AuthGuard resource="settings" action="view">
        <SettingsLandingPage />
      </AuthGuard>
    ),
    children: [
      {
        path: 'auth',
        element: (
          <AuthGuard resource="platform-auth" action="manage">
            <AuthSettingsPage />
          </AuthGuard>
        )
      },
      {
        path: 'navigation',
        element: (
          <AuthGuard resource="platform-navigation" action="manage">
            <NavigationSettingsPage />
          </AuthGuard>
        )
      },
      {
        path: 'mail',
        element: (
          <AuthGuard resource="platform-mail" action="manage">
            <MailSettingsPage />
          </AuthGuard>
        )
      },
      {
        path: 'tags',
        element: (
          <AuthGuard resource="platform-tag" action="manage">
            <TagManagementPage />
          </AuthGuard>
        )
      },
      {
        path: 'grafana',
        element: (
          <AuthGuard resource="platform-grafana" action="manage">
            <GrafanaSettingsPage />
          </AuthGuard>
        )
      }
    ]
  },
  {
    path: '/iam/personnel',
    element: (
      <AuthGuard resource="iam" action="manage_personnel">
        <PersonnelManagementPage />
      </AuthGuard>
    )
  },
  {
    path: '/iam/teams',
    element: (
      <AuthGuard resource="iam" action="manage_teams">
        <TeamManagementPage />
      </AuthGuard>
    )
  },
  {
    path: '/iam/roles',
    element: (
      <AuthGuard resource="iam" action="manage_roles">
        <RoleManagementPage />
      </AuthGuard>
    )
  },
  {
    path: '/resources/list',
    element: (
      <AuthGuard resource="resources" action="view_inventory">
        <ResourceListPage />
      </AuthGuard>
    )
  },
  {
    path: '/resources/groups',
    element: (
      <AuthGuard resource="resources" action="manage_groups">
        <ResourceGroupPage />
      </AuthGuard>
    )
  },
  {
    path: '/resources/discovery',
    element: (
      <AuthGuard resource="resources" action="manage_discovery">
        <AutoDiscoveryPage />
      </AuthGuard>
    )
  },
  {
    path: '/resources/datasources',
    element: (
      <AuthGuard resource="resources" action="manage_datasources">
        <DatasourceManagementPage />
      </AuthGuard>
    )
  },
  {
    path: '/resources/topology',
    element: (
      <AuthGuard resource="resources" action="view_topology">
        <ResourceTopologyPage />
      </AuthGuard>
    )
  },
  {
    path: '/insight/logs',
    element: (
      <AuthGuard resource="insight" action="view_logs">
        <LogExplorerPage />
      </AuthGuard>
    )
  },
  {
    path: '/insight/backtesting',
    element: (
      <AuthGuard resource="insight" action="run_backtesting">
        <BacktestingPage />
      </AuthGuard>
    )
  },
  {
    path: '/insight/capacity',
    element: (
      <AuthGuard resource="insight" action="view_capacity">
        <CapacityPlanningPage />
      </AuthGuard>
    )
  },
  {
    path: '/incidents/rules',
    element: (
      <AuthGuard resource="incidents" action="manage_rules">
        <AlertRulePage />
      </AuthGuard>
    )
  },
  {
    path: '/incidents/silences',
    element: (
      <AuthGuard resource="incidents" action="manage_silences">
        <SilenceRulePage />
      </AuthGuard>
    )
  },
  {
    path: '/incidents/list',
    element: (
      <AuthGuard resource="incidents" action="view_list">
        <IncidentListPage />
      </AuthGuard>
    )
  },
  {
    path: '/notifications/strategies',
    element: (
      <AuthGuard resource="notifications" action="manage_strategies">
        <NotificationStrategyPage />
      </AuthGuard>
    )
  },
  {
    path: '/notifications/channels',
    element: (
      <AuthGuard resource="notifications" action="manage_channels">
        <NotificationChannelPage />
      </AuthGuard>
    )
  },
  {
    path: '/notifications/history',
    element: (
      <AuthGuard resource="notifications" action="view_history">
        <NotificationHistoryPage />
      </AuthGuard>
    )
  },
  {
    path: '/automation/playbooks',
    element: (
      <AuthGuard resource="automation" action="manage_playbooks">
        <AutomationPlaybooksPage />
      </AuthGuard>
    )
  },
  {
    path: '/automation/triggers',
    element: (
      <AuthGuard resource="automation" action="manage_triggers">
        <AutomationTriggersPage />
      </AuthGuard>
    )
  },
  {
    path: '/automation/history',
    element: (
      <AuthGuard resource="automation" action="view_history">
        <AutomationHistoryPage />
      </AuthGuard>
    )
  },
  {
    path: '/dashboards/list',
    element: (
      <AuthGuard resource="dashboards" action="view_library">
        <DashboardListPage />
      </AuthGuard>
    )
  },
  {
    path: '/dashboards/editor',
    element: (
      <AuthGuard resource="dashboards" action="edit">
        <DashboardEditorPage />
      </AuthGuard>
    )
  },
  {
    path: '/dashboards/war-room',
    element: (
      <AuthGuard resource="dashboards" action="view_war_room">
        <SREWarRoomPage />
      </AuthGuard>
    )
  },
  {
    path: '/profile',
    element: (
      <AuthGuard resource="profile" action="view">
        <UserProfilePage />
      </AuthGuard>
    )
  },
  {
    path: '/navigation/registry',
    element: (
      <AuthGuard resource="navigation" action="view">
        <NavigationRegistryPage />
      </AuthGuard>
    )
  },
  {
    path: '/',
    element: (
      <AuthGuard resource="settings" action="view">
        <SettingsLandingPage />
      </AuthGuard>
    )
  }
];

export function AppRoutes() {
  const element = useRoutes(routes);
  return <Suspense fallback={<LoadingOverlay />}>{element}</Suspense>;
}
