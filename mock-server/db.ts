import {
    MOCK_DASHBOARDS,
    MOCK_INCIDENTS,
    MOCK_ALERT_RULES,
    MOCK_SILENCE_RULES,
    MOCK_RESOURCES,
    MOCK_RESOURCE_GROUPS,
    MOCK_PLAYBOOKS,
    MOCK_AUTOMATION_EXECUTIONS,
    MOCK_AUTOMATION_TRIGGERS,
    MOCK_USERS,
    MOCK_TEAMS,
    MOCK_ROLES,
    MOCK_AUDIT_LOGS,
    MOCK_TAG_DEFINITIONS,
    MOCK_NOTIFICATION_STRATEGIES,
    MOCK_NOTIFICATION_CHANNELS,
    MOCK_NOTIFICATION_HISTORY,
    MOCK_LOGIN_HISTORY,
    MOCK_LOGS,
    MOCK_TRACES,
    MOCK_MAIL_SETTINGS,
    MOCK_AUTH_SETTINGS,
    DEFAULT_LAYOUTS,
} from '../constants';
import { UserPreferences } from '../types';

// Helper to generate UUIDs
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const MOCK_AI_BRIEFING = {
    "stability_summary": "系統整體穩定，但支付 API 錯誤率略高於正常水平，需持續關注。",
    "key_anomaly": {
        "description": "支付 API 的錯誤率達到 5%，可能影響交易成功率。",
        "resource_name": "支付 API",
        "resource_path": "/dashboard/api-service-status"
    },
    "recommendation": {
        "action_text": "由於錯誤率上升，建議立即檢視支付 API 的日誌以找出根本原因。",
        "button_text": "查看日誌",
        "button_link": "/analyzing/logs"
    }
};

const MOCK_LINKS = [
    { source: 'res-001', target: 'res-003' }, // api-gateway -> k8s-cluster
    { source: 'res-004', target: 'res-001' }, // web-prod-12 -> api-gateway
    { source: 'res-003', target: 'res-002' }, // k8s-cluster -> rds-prod-main
    { source: 'res-003', target: 'res-005' }, // k8s-cluster -> elasticache
    { source: 'res-006', target: 'res-007' }, // gke-staging -> vm-ci-runner
];

const MOCK_USER_PREFERENCES: UserPreferences = {
    theme: 'dark',
    language: 'zh-TW',
    timezone: 'Asia/Taipei',
    defaultPage: 'sre-war-room',
};


// In-memory data store
let DB: {
    dashboards: any[],
    incidents: any[],
    alertRules: any[],
    silenceRules: any[],
    resources: any[],
    resourceGroups: any[],
    resourceLinks: any[],
    playbooks: any[],
    automationExecutions: any[],
    automationTriggers: any[],
    users: any[],
    teams: any[],
    roles: any[],
    auditLogs: any[],
    tagDefinitions: any[],
    notificationStrategies: any[],
    notificationChannels: any[],
    notificationHistory: any[],
    loginHistory: any[],
    logs: any[],
    traces: any[],
    mailSettings: any,
    authSettings: any,
    userPreferences: any,
    aiBriefing: any,
    layouts: Record<string, string[]>,
} = {
    dashboards: [],
    incidents: [],
    alertRules: [],
    silenceRules: [],
    resources: [],
    resourceGroups: [],
    resourceLinks: [],
    playbooks: [],
    automationExecutions: [],
    automationTriggers: [],
    users: [],
    teams: [],
    roles: [],
    auditLogs: [],
    tagDefinitions: [],
    notificationStrategies: [],
    notificationChannels: [],
    notificationHistory: [],
    loginHistory: [],
    logs: [],
    traces: [],
    mailSettings: {},
    authSettings: {},
    userPreferences: {},
    aiBriefing: {},
    layouts: {},
};

export function initializeDatabase() {
  // Deep clone to make it mutable
  DB = {
    dashboards: JSON.parse(JSON.stringify(MOCK_DASHBOARDS)),
    incidents: JSON.parse(JSON.stringify(MOCK_INCIDENTS)),
    alertRules: JSON.parse(JSON.stringify(MOCK_ALERT_RULES)),
    silenceRules: JSON.parse(JSON.stringify(MOCK_SILENCE_RULES)),
    resources: JSON.parse(JSON.stringify(MOCK_RESOURCES)),
    resourceGroups: JSON.parse(JSON.stringify(MOCK_RESOURCE_GROUPS)),
    resourceLinks: JSON.parse(JSON.stringify(MOCK_LINKS)),
    playbooks: JSON.parse(JSON.stringify(MOCK_PLAYBOOKS)),
    automationExecutions: JSON.parse(JSON.stringify(MOCK_AUTOMATION_EXECUTIONS)),
    automationTriggers: JSON.parse(JSON.stringify(MOCK_AUTOMATION_TRIGGERS)),
    users: JSON.parse(JSON.stringify(MOCK_USERS)),
    teams: JSON.parse(JSON.stringify(MOCK_TEAMS)),
    roles: JSON.parse(JSON.stringify(MOCK_ROLES)),
    auditLogs: JSON.parse(JSON.stringify(MOCK_AUDIT_LOGS)),
    tagDefinitions: JSON.parse(JSON.stringify(MOCK_TAG_DEFINITIONS)),
    notificationStrategies: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_STRATEGIES)),
    notificationChannels: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_CHANNELS)),
    notificationHistory: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_HISTORY)),
    loginHistory: JSON.parse(JSON.stringify(MOCK_LOGIN_HISTORY)),
    logs: JSON.parse(JSON.stringify(MOCK_LOGS)),
    traces: JSON.parse(JSON.stringify(MOCK_TRACES)),
    mailSettings: JSON.parse(JSON.stringify(MOCK_MAIL_SETTINGS)),
    authSettings: JSON.parse(JSON.stringify(MOCK_AUTH_SETTINGS)),
    userPreferences: JSON.parse(JSON.stringify(MOCK_USER_PREFERENCES)),
    aiBriefing: JSON.parse(JSON.stringify(MOCK_AI_BRIEFING)),
    layouts: JSON.parse(JSON.stringify(DEFAULT_LAYOUTS)),
  };
}

// Initialize once on load
initializeDatabase();

export default DB;