import { ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { AuthGuard } from '@core/contexts/AuthGuard';
import { ForbiddenPage } from '@core/components/layout/ForbiddenPage';
import { MODULE_IDS, RBAC_RESOURCES } from '@core/constants/modules';
import { AuthSettingsPage } from '@features/settings/platform-auth/pages/AuthSettingsPage';
import { NavigationSettingsPage } from '@features/settings/platform-navigation/pages/NavigationSettingsPage';
import { MailSettingsPage } from '@features/settings/platform-mail/pages/MailSettingsPage';
import { TagManagementPage } from '@features/settings/platform-tag/pages/TagManagementPage';
import { GrafanaSettingsPage } from '@features/settings/platform-grafana/pages/GrafanaSettingsPage';
import { PersonnelManagementPage } from '@features/iam/identity-access-management/pages/PersonnelManagementPage';
import { TeamManagementPage } from '@features/iam/identity-access-management/pages/TeamManagementPage';
import { RoleManagementPage } from '@features/iam/identity-access-management/pages/RoleManagementPage';
import { ResourceListPage } from '@features/resources/resources-management/pages/ResourceListPage';
import { ResourceGroupPage } from '@features/resources/resources-management/pages/ResourceGroupPage';
import { AutoDiscoveryPage } from '@features/resources/resources-management/pages/AutoDiscoveryPage';
import { DatasourceManagementPage } from '@features/resources/resources-management/pages/DatasourceManagementPage';
import { ResourceTopologyPage } from '@features/resources/resources-management/pages/ResourceTopologyPage';
import { LogExplorerPage } from '@features/insight/insight-log/pages/LogExplorerPage';
import { BacktestingPage } from '@features/insight/insight-analysis/pages/BacktestingPage';
import { CapacityPlanningPage } from '@features/insight/insight-analysis/pages/CapacityPlanningPage';
import { AlertRulePage } from '@features/incidents/incident-rules/pages/AlertRulePage';
import { SilenceRulePage } from '@features/incidents/incident-rules/pages/SilenceRulePage';
import { IncidentListPage } from '@features/incidents/incident-list/pages/IncidentListPage';
import { NotificationStrategyPage } from '@features/notification/notification-management/pages/NotificationStrategyPage';
import { NotificationChannelPage } from '@features/notification/notification-management/pages/NotificationChannelPage';
import { NotificationHistoryPage } from '@features/notification/notification-management/pages/NotificationHistoryPage';
import { AutomationPlaybooksPage } from '@features/automation/automation-management/pages/AutomationPlaybooksPage';
import { AutomationTriggersPage } from '@features/automation/automation-management/pages/AutomationTriggersPage';
import { AutomationHistoryPage } from '@features/automation/automation-management/pages/AutomationHistoryPage';
import { DashboardListPage } from '@features/dashboards/dashboards-management/pages/DashboardListPage';
import { DashboardEditorPage } from '@features/dashboards/dashboards-management/pages/DashboardEditorPage';
import { SREWarRoomPage } from '@features/dashboards/dashboards-management/pages/SREWarRoomPage';
import { PersonalInfoPage } from '@features/profile/user-profile/pages/PersonalInfoPage';
import { PreferenceSettingsPage } from '@features/profile/user-profile/pages/PreferenceSettingsPage';
import { SecuritySettingsPage } from '@features/profile/user-profile/pages/SecuritySettingsPage';
import { LoginPage } from '@features/settings/platform-auth/pages/LoginPage';
import { NavigationWorkbenchPage } from '@features/navigation/platform-navigation/pages/NavigationWorkbenchPage';

export interface AppRoute {
  id: string;
  path: string;
  titleKey: string;
  resource: string;
  action: string;
  moduleId: string;
  element: ReactNode;
}

export const settingsModuleRoutes: AppRoute[] = [
  {
    id: 'settings-auth',
    path: '/settings/auth',
    titleKey: 'pages.authSettings.title',
    resource: RBAC_RESOURCES.SETTINGS,
    action: 'read',
    moduleId: MODULE_IDS.AUTH,
    element: <AuthSettingsPage />,
  },
  {
    id: 'settings-navigation',
    path: '/settings/navigation',
    titleKey: 'pages.navigationSettings.title',
    resource: RBAC_RESOURCES.NAVIGATION,
    action: 'write',
    moduleId: MODULE_IDS.NAVIGATION,
    element: <NavigationSettingsPage />,
  },
  {
    id: 'settings-mail',
    path: '/settings/mail',
    titleKey: 'pages.mailSettings.title',
    resource: RBAC_RESOURCES.SETTINGS,
    action: 'write',
    moduleId: MODULE_IDS.MAIL,
    element: <MailSettingsPage />,
  },
  {
    id: 'settings-tags',
    path: '/settings/tags',
    titleKey: 'pages.tagManagement.title',
    resource: RBAC_RESOURCES.SETTINGS,
    action: 'write',
    moduleId: MODULE_IDS.TAG,
    element: <TagManagementPage />,
  },
  {
    id: 'settings-grafana',
    path: '/settings/grafana',
    titleKey: 'pages.grafanaSettings.title',
    resource: RBAC_RESOURCES.SETTINGS,
    action: 'write',
    moduleId: MODULE_IDS.GRAFANA,
    element: <GrafanaSettingsPage />,
  },
];

export const navigationWorkbenchRoutes: AppRoute[] = [
  {
    id: 'navigation-workbench',
    path: '/navigation/workbench',
    titleKey: 'nav.navigationWorkbench',
    resource: RBAC_RESOURCES.NAVIGATION,
    action: 'write',
    moduleId: MODULE_IDS.NAVIGATION,
    element: <NavigationWorkbenchPage />,
  },
];

const staticRoutes: AppRoute[] = [
  {
    id: 'iam-personnel',
    path: '/iam/personnel',
    titleKey: 'pages.personnelManagement.title',
    resource: RBAC_RESOURCES.NAVIGATION,
    action: 'read',
    moduleId: MODULE_IDS.IAM,
    element: <PersonnelManagementPage />,
  },
  {
    id: 'iam-teams',
    path: '/iam/teams',
    titleKey: 'pages.teamManagement.title',
    resource: RBAC_RESOURCES.NAVIGATION,
    action: 'read',
    moduleId: MODULE_IDS.IAM,
    element: <TeamManagementPage />,
  },
  {
    id: 'iam-roles',
    path: '/iam/roles',
    titleKey: 'pages.roleManagement.title',
    resource: RBAC_RESOURCES.NAVIGATION,
    action: 'write',
    moduleId: MODULE_IDS.IAM,
    element: <RoleManagementPage />,
  },
  {
    id: 'resources-list',
    path: '/resources/list',
    titleKey: 'pages.resourceList.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
    moduleId: MODULE_IDS.RESOURCES,
    element: <ResourceListPage />,
  },
  {
    id: 'resources-groups',
    path: '/resources/groups',
    titleKey: 'pages.resourceGroup.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
    moduleId: MODULE_IDS.RESOURCES,
    element: <ResourceGroupPage />,
  },
  {
    id: 'resources-auto',
    path: '/resources/auto-discovery',
    titleKey: 'pages.autoDiscovery.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'write',
    moduleId: MODULE_IDS.RESOURCES,
    element: <AutoDiscoveryPage />,
  },
  {
    id: 'resources-datasource',
    path: '/resources/datasources',
    titleKey: 'pages.datasourceManagement.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'write',
    moduleId: MODULE_IDS.RESOURCES,
    element: <DatasourceManagementPage />,
  },
  {
    id: 'resources-topology',
    path: '/resources/topology',
    titleKey: 'pages.resourceTopology.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
    moduleId: MODULE_IDS.RESOURCES,
    element: <ResourceTopologyPage />,
  },
  {
    id: 'insight-log',
    path: '/insight/logs',
    titleKey: 'pages.logExplorer.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
    moduleId: MODULE_IDS.INSIGHT_LOG,
    element: <LogExplorerPage />,
  },
  {
    id: 'insight-backtesting',
    path: '/insight/backtesting',
    titleKey: 'pages.backtesting.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
    moduleId: MODULE_IDS.INSIGHT_ANALYSIS,
    element: <BacktestingPage />,
  },
  {
    id: 'insight-capacity',
    path: '/insight/capacity',
    titleKey: 'pages.capacityPlanning.title',
    resource: RBAC_RESOURCES.RESOURCES,
    action: 'read',
    moduleId: MODULE_IDS.INSIGHT_ANALYSIS,
    element: <CapacityPlanningPage />,
  },
  {
    id: 'incident-rules',
    path: '/incidents/rules',
    titleKey: 'pages.alertRule.title',
    resource: RBAC_RESOURCES.INCIDENTS,
    action: 'write',
    moduleId: MODULE_IDS.INCIDENT_RULES,
    element: <AlertRulePage />,
  },
  {
    id: 'incident-silence',
    path: '/incidents/silence',
    titleKey: 'pages.silenceRule.title',
    resource: RBAC_RESOURCES.INCIDENTS,
    action: 'write',
    moduleId: MODULE_IDS.INCIDENT_RULES,
    element: <SilenceRulePage />,
  },
  {
    id: 'incident-list',
    path: '/incidents/list',
    titleKey: 'pages.incidentList.title',
    resource: RBAC_RESOURCES.INCIDENTS,
    action: 'read',
    moduleId: MODULE_IDS.INCIDENT_LIST,
    element: <IncidentListPage />,
  },
  {
    id: 'notification-strategy',
    path: '/notifications/strategies',
    titleKey: 'pages.notificationStrategy.title',
    resource: RBAC_RESOURCES.NOTIFICATION,
    action: 'write',
    moduleId: MODULE_IDS.NOTIFICATION,
    element: <NotificationStrategyPage />,
  },
  {
    id: 'notification-channel',
    path: '/notifications/channels',
    titleKey: 'pages.notificationChannel.title',
    resource: RBAC_RESOURCES.NOTIFICATION,
    action: 'write',
    moduleId: MODULE_IDS.NOTIFICATION,
    element: <NotificationChannelPage />,
  },
  {
    id: 'notification-history',
    path: '/notifications/history',
    titleKey: 'pages.notificationHistory.title',
    resource: RBAC_RESOURCES.NOTIFICATION,
    action: 'read',
    moduleId: MODULE_IDS.NOTIFICATION,
    element: <NotificationHistoryPage />,
  },
  {
    id: 'automation-playbooks',
    path: '/automation/playbooks',
    titleKey: 'pages.automationPlaybooks.title',
    resource: RBAC_RESOURCES.AUTOMATION,
    action: 'write',
    moduleId: MODULE_IDS.AUTOMATION,
    element: <AutomationPlaybooksPage />,
  },
  {
    id: 'automation-triggers',
    path: '/automation/triggers',
    titleKey: 'pages.automationTriggers.title',
    resource: RBAC_RESOURCES.AUTOMATION,
    action: 'write',
    moduleId: MODULE_IDS.AUTOMATION,
    element: <AutomationTriggersPage />,
  },
  {
    id: 'automation-history',
    path: '/automation/history',
    titleKey: 'pages.automationHistory.title',
    resource: RBAC_RESOURCES.AUTOMATION,
    action: 'read',
    moduleId: MODULE_IDS.AUTOMATION,
    element: <AutomationHistoryPage />,
  },
  {
    id: 'dashboards-list',
    path: '/dashboards/catalog',
    titleKey: 'pages.dashboardList.title',
    resource: RBAC_RESOURCES.DASHBOARDS,
    action: 'read',
    moduleId: MODULE_IDS.DASHBOARDS,
    element: <DashboardListPage />,
  },
  {
    id: 'dashboards-editor',
    path: '/dashboards/editor',
    titleKey: 'pages.dashboardEditor.title',
    resource: RBAC_RESOURCES.DASHBOARDS,
    action: 'write',
    moduleId: MODULE_IDS.DASHBOARDS,
    element: <DashboardEditorPage />,
  },
  {
    id: 'dashboards-warroom',
    path: '/dashboards/war-room',
    titleKey: 'pages.sreWarRoom.title',
    resource: RBAC_RESOURCES.DASHBOARDS,
    action: 'read',
    moduleId: MODULE_IDS.DASHBOARDS,
    element: <SREWarRoomPage />,
  },
  {
    id: 'profile-info',
    path: '/profile/info',
    titleKey: 'pages.personalInfo.title',
    resource: RBAC_RESOURCES.PROFILE,
    action: 'read',
    moduleId: MODULE_IDS.PROFILE,
    element: <PersonalInfoPage />,
  },
  {
    id: 'profile-preference',
    path: '/profile/preferences',
    titleKey: 'pages.preferenceSettings.title',
    resource: RBAC_RESOURCES.PROFILE,
    action: 'write',
    moduleId: MODULE_IDS.PROFILE,
    element: <PreferenceSettingsPage />,
  },
  {
    id: 'profile-security',
    path: '/profile/security',
    titleKey: 'pages.securitySettings.title',
    resource: RBAC_RESOURCES.PROFILE,
    action: 'write',
    moduleId: MODULE_IDS.PROFILE,
    element: <SecuritySettingsPage />,
  },
];

const dynamicModuleRoutes = new Map<string, AppRoute[]>();

export function registerModuleRoutes(moduleId: string, routes: AppRoute[]) {
  const existing = dynamicModuleRoutes.get(moduleId) ?? [];
  dynamicModuleRoutes.set(moduleId, [...existing, ...routes]);
}

export function getAllRoutes(): AppRoute[] {
  const dynamic = Array.from(dynamicModuleRoutes.values()).flat();
  return [...staticRoutes, ...dynamic];
}

function asRouteObject(route: AppRoute): RouteObject {
  return {
    path: route.path,
    element: <AuthGuard resource={route.resource} action={route.action}>{route.element}</AuthGuard>,
  };
}

export function createAppRouter() {
  const routeObjects: RouteObject[] = getAllRoutes().map(asRouteObject);

  routeObjects.push({ path: '/403', element: <ForbiddenPage /> });
  routeObjects.push({ path: '/login', element: <LoginPage /> });
  routeObjects.push({ path: '/', element: <Navigate to="/dashboards/catalog" replace /> });
  routeObjects.push({ path: '*', element: <Navigate to="/dashboards/catalog" replace /> });

  return createBrowserRouter(routeObjects);
}
