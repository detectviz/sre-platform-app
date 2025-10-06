export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  DASHBOARD: '/dashboard',
  DASHBOARD_INFRASTRUCTURE_INSIGHTS: '/dashboard/infrastructure-insights',
  DASHBOARD_RESOURCE_OVERVIEW: '/dashboard/resource-overview',
  DASHBOARDS: '/dashboards',
  DASHBOARDS_NEW: '/dashboards/new',
  DASHBOARDS_TEMPLATES: '/dashboards/templates',
  DASHBOARDS_EDIT: '/dashboards/:dashboardId/edit',
  SRE_WAR_ROOM: '/sre-war-room',
  RESOURCES: '/resources',
  RESOURCES_LIST: '/resources/list',
  RESOURCES_GROUPS: '/resources/groups',
  RESOURCES_DATASOURCES: '/resources/datasources',
  RESOURCES_DISCOVERY: '/resources/discovery',
  RESOURCES_TOPOLOGY: '/resources/topology',
  INCIDENTS: '/incidents',
  AUTOMATION: '/automation',
  PROFILE: '/profile',
  ANALYSIS_LOGS: '/analyzing/logs',
} as const;

const trimTrailingSegments = (path: string) => path.replace(/\/$/, '');

export const buildRoute = {
  dashboardDetails: (dashboardId: string) => `${trimTrailingSegments(ROUTES.DASHBOARD)}/${dashboardId}`,
  dashboardEdit: (dashboardId: string) => `${ROUTES.DASHBOARDS}/${dashboardId}/edit`,
  resourceDetails: (resourceId: string) => `${ROUTES.RESOURCES_LIST}/${resourceId}`,
  incidentDetails: (incidentId: string) => `${ROUTES.INCIDENTS}/${incidentId}`,
};
