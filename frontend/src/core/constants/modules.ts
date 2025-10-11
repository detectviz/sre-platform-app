export const MODULE_IDS = {
  AUTH: 'platform-auth',
  IAM: 'identity-access-management',
  NAVIGATION: 'platform-navigation',
  MAIL: 'platform-mail',
  TAG: 'platform-tag',
  GRAFANA: 'platform-grafana',
  RESOURCES: 'resources-management',
  INSIGHT_LOG: 'insight-log',
  INSIGHT_ANALYSIS: 'insight-analysis',
  INCIDENT_RULES: 'incident-rules',
  INCIDENT_LIST: 'incident-list',
  NOTIFICATION: 'notification-management',
  AUTOMATION: 'automation-management',
  DASHBOARDS: 'dashboards-management',
  PROFILE: 'user-profile',
} as const;

export const RBAC_RESOURCES = {
  SETTINGS: 'settings',
  NAVIGATION: 'navigation',
  RESOURCES: 'resources',
  INCIDENTS: 'incidents',
  DASHBOARDS: 'dashboards',
  AUTOMATION: 'automation',
  NOTIFICATION: 'notification',
  PROFILE: 'profile',
} as const;
