import { 
    Dashboard, DashboardTemplate, Incident, AlertRule, AlertRuleTemplate, SilenceRule, SilenceRuleTemplate,
    Resource, ResourceGroup, AutomationPlaybook, AutomationExecution, AutomationTrigger, User, Team, Role, 
    AuditLog, TagDefinition, NotificationItem, NotificationStrategy, NotificationChannel,
    NotificationHistoryRecord, LoginHistoryRecord, LogEntry, Trace, MailSettings, AuthSettings, LayoutWidget,
    UserPreferences,
    DashboardType,
    IncidentAnalysis,
    MultiIncidentAnalysis
} from '../types';

// Helper to generate UUIDs
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// --- ALL MOCK DATA DEFINITIONS ---

const MOCK_DASHBOARDS: Dashboard[] = [
    { id: 'sre-war-room', name: 'SRE 戰情室', type: DashboardType.BuiltIn, category: '業務與 SLA', description: '跨團隊即時戰情看板，聚焦重大事件與 SLA 指標。', owner: '事件指揮中心', updatedAt: '2025/09/18 17:15', path: '/sre-war-room' },
    { id: 'infrastructure-insights', name: '基礎設施洞察', type: DashboardType.BuiltIn, category: '基礎設施', description: '整合多雲與多中心資源健康狀態。', owner: 'SRE 平台團隊', updatedAt: '2025/09/18 16:30', path: '/dashboard/infrastructure-insights' },
    { id: 'api-service-status', name: 'API 服務狀態', type: DashboardType.Grafana, category: '業務與 SLA', description: 'API 響應時間、錯誤率、吞吐量等服務指標。', owner: 'SRE 平台團隊', updatedAt: '2025/09/18 16:45', path: '/dashboard/api-service-status', grafanaUrl: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5', grafana_dashboard_uid: 'aead3d54-423b-4a91-b91c-dbdf40d7fff5', grafana_folder_uid: 'biz-folder' },
    { id: 'user-experience-monitoring', name: '用戶體驗監控', type: DashboardType.Grafana, category: '營運與容量', description: '頁面載入時間、用戶行為分析、錯誤追蹤。', owner: '前端團隊', updatedAt: '2025/09/18 17:00', path: '/dashboard/user-experience-monitoring', grafanaUrl: 'http://localhost:3000/d/another-dashboard-id-for-ux', grafana_dashboard_uid: 'another-dashboard-id-for-ux', grafana_folder_uid: 'ux-folder' },
];
const MOCK_AVAILABLE_GRAFANA_DASHBOARDS = [
  { uid: 'grafana-uid-1', title: 'Service Health', url: 'http://localhost:3000/d/grafana-uid-1', folderTitle: 'Production', folderUid: 'prod-folder' },
  { uid: 'grafana-uid-2', title: 'Kubernetes Cluster', url: 'http://localhost:3000/d/grafana-uid-2', folderTitle: 'Infrastructure', folderUid: 'infra-folder' },
];
const MOCK_DASHBOARD_TEMPLATES: DashboardTemplate[] = [
    { id: 'tpl-001', name: 'Microservice Health', description: 'Monitor a single microservice, including latency, traffic, errors, and saturation.', icon: 'server', category: 'Application' },
    { id: 'tpl-002', name: 'Business KPI Overview', description: 'Track key business metrics like user sign-ups, revenue, and conversion rates.', icon: 'briefcase', category: 'Business' },
];
const MOCK_INCIDENTS: Incident[] = [
    { id: 'INC-001', summary: 'API 延遲超過閾值', resource: 'api-server-01', serviceImpact: 'High', rule: 'API 延遲規則', status: 'new', severity: 'warning', priority: 'P1', assignee: '張三', triggeredAt: '2024-01-15 10:30:00', history: [ { timestamp: '2024-01-15 10:30:00', user: 'System', action: 'Incident created from rule "API 延遲規則".' } ] },
    { id: 'INC-002', summary: '資料庫連接超時', resource: 'db-primary', serviceImpact: 'High', rule: '資料庫連接規則', status: 'acknowledged', severity: 'critical', priority: 'P0', assignee: '李四', triggeredAt: '2024-01-15 10:15:00', history: [ { timestamp: '2024-01-15 10:15:00', user: 'System', action: 'Incident created from rule "資料庫連接規則".' } ] },
];
const MOCK_ALERT_RULES: AlertRule[] = [
    { id: 'rule-001', name: 'CPU 使用率過高', description: '當任何伺服器的 CPU 使用率連續 5 分鐘超過 90% 時觸發。', enabled: true, target: '所有伺服器', conditionsSummary: 'CPU > 90% for 5m', severity: 'critical', automationEnabled: true, creator: 'Admin User', lastUpdated: '2025-09-22 10:00:00', automation: { enabled: true, scriptId: 'play-002' } },
    { id: 'rule-002', name: 'API 延遲規則', description: 'API Gateway 的 p95 延遲超過 500ms。', enabled: true, target: 'api-gateway-prod', conditionsSummary: 'Latency > 500ms', severity: 'warning', automationEnabled: false, creator: 'Emily White', lastUpdated: '2025-09-21 15:30:00' },
];
const MOCK_ALERT_RULE_TEMPLATES: AlertRuleTemplate[] = [
    { id: 'art-001', name: 'High CPU Usage', emoji: '🔥', data: { description: 'Monitors CPU usage and alerts when it exceeds a threshold.', conditionGroups: [{ logic: 'OR', severity: 'warning', conditions: [{ metric: 'cpu_usage_percent', operator: '>', threshold: 80, durationMinutes: 5 }] }] } },
];
const MOCK_SILENCE_RULES: SilenceRule[] = [
    { id: 'sil-001', name: '週末維護窗口', description: '週末例行維護期間静音所有 staging 環境的告警。', enabled: true, type: 'repeat', matchers: [{ key: 'env', operator: '=', value: 'staging' }], schedule: { type: 'recurring', cron: '0 22 * * 5', timezone: 'Asia/Taipei' }, creator: 'Admin User', createdAt: '2025-09-20 18:00:00' },
];
const MOCK_SILENCE_RULE_TEMPLATES: SilenceRuleTemplate[] = [
    { id: 'srt-001', name: 'Staging Maintenance', emoji: '🚧', data: { description: 'Silence all alerts from the staging environment.', matchers: [{ key: 'env', operator: '=', value: 'staging' }] } },
];
const MOCK_RESOURCES: Resource[] = [
    { id: 'res-001', name: 'api-gateway-prod-01', status: 'healthy', type: 'API Gateway', provider: 'AWS', region: 'us-east-1', owner: 'SRE Team', lastCheckIn: '30s ago' },
    { id: 'res-002', name: 'rds-prod-main', status: 'critical', type: 'RDS Database', provider: 'AWS', region: 'us-east-1', owner: 'DBA Team', lastCheckIn: '2m ago' },
];
const MOCK_RESOURCE_GROUPS: ResourceGroup[] = [
    { id: 'rg-001', name: 'Production Web Servers', description: 'All production-facing web servers', ownerTeam: 'Web Team', memberIds: ['res-004'], statusSummary: { healthy: 12, warning: 1, critical: 0 } },
];
const MOCK_PLAYBOOKS: AutomationPlaybook[] = [
    { id: 'play-001', name: '重啟故障 Pod', description: '自動重啟處於 CrashLoopBackOff 狀態的 Pod。', trigger: 'K8s 告警', lastRun: '5分鐘前', lastRunStatus: 'success', runCount: 12, type: 'shell', content: '#!/bin/bash...', parameters: [{ name: 'namespace', label: '命名空間', type: 'string', required: true }] },
];
const MOCK_AUTOMATION_EXECUTIONS: AutomationExecution[] = [
    { id: 'exec-001', scriptId: 'play-001', scriptName: '重啟故障 Pod', status: 'success', triggerSource: 'event', triggeredBy: 'Event Rule: K8s 告警', startTime: '2025-09-23 14:05:10', endTime: '2025-09-23 14:05:15', durationMs: 5000, parameters: { namespace: 'production' }, logs: { stdout: 'Successfully restarted pod.', stderr: '' } },
];
const MOCK_AUTOMATION_TRIGGERS: AutomationTrigger[] = [
    { id: 'trig-001', name: '每日日誌歸檔', description: '在每天凌晨 3 點運行「歸檔舊日誌」腳本。', type: 'Schedule', enabled: true, targetPlaybookId: 'play-005', config: { cron: '0 3 * * *' }, lastTriggered: '18 小時前', creator: 'Admin User' },
];
const MOCK_USERS: User[] = [
    { id: 'usr-001', name: 'Admin User', email: 'admin@sre.platform', role: 'Admin', team: 'SRE Platform', status: 'active', lastLogin: '2分鐘前' },
    { id: 'usr-002', name: 'Emily White', email: 'emily.w@example.com', role: 'SRE', team: 'Core Infrastructure', status: 'active', lastLogin: '1小時前' },
];
const MOCK_TEAMS: Team[] = [
    { id: 'team-001', name: 'SRE Platform', description: 'Manages the SRE platform itself.', ownerId: 'usr-001', memberIds: ['usr-001'], createdAt: '2024-01-01 10:00:00' },
];
const MOCK_ROLES: Role[] = [
    { id: 'role-001', name: 'Administrator', description: '擁有所有權限', userCount: 1, status: 'active', createdAt: '2024-01-01 09:00:00', permissions: [] },
];
const AVAILABLE_PERMISSIONS = [
    { module: 'Incidents', description: 'Manage incidents and alerts', actions: [{key: 'read', label: 'Read'}, {key: 'update', label: 'Update'}] },
];
const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log-001', timestamp: '2024-01-15 11:05:00', user: {id: 'usr-001', name: 'Admin User'}, action: 'LOGIN_SUCCESS', target: { type: 'System', name: 'Authentication' }, result: 'success', ip: '192.168.1.10', details: { client: 'WebApp' } },
];
const MOCK_TAG_DEFINITIONS: TagDefinition[] = [
    { id: 'tag-001', key: 'env', category: 'Infrastructure', description: 'Deployment environment', allowedValues: [{ id: 'val-001', value: 'production', usageCount: 150 }], required: true, usageCount: 350 },
];
const MOCK_TAG_CATEGORIES = ['Infrastructure', 'Application', 'Business', 'Security'];
const MOCK_NOTIFICATIONS: NotificationItem[] = [
    { id: 'notif-1', title: 'Critical: DB CPU > 95%', description: 'The production database is under heavy load.', severity: 'critical', status: 'unread', createdAt: new Date(Date.now() - 60000 * 5).toISOString(), linkUrl: '/incidents/INC-002' },
];
const MOCK_NOTIFICATION_STRATEGIES: NotificationStrategy[] = [
    { id: 'strat-1', name: 'Critical Database Alerts', enabled: true, triggerCondition: 'severity = critical AND resource_type = RDS', channelCount: 2, priority: 'High', creator: 'Admin', lastUpdated: '2025-09-20 10:00:00' }
];
const MOCK_NOTIFICATION_CHANNELS: NotificationChannel[] = [
    { id: 'chan-1', name: 'SRE On-call Email', type: 'Email', enabled: true, config: { smtpServer: 'smtp.example.com' }, lastTestResult: 'success', lastTestedAt: '2025-09-22 11:00:00' },
];
const MOCK_NOTIFICATION_HISTORY: NotificationHistoryRecord[] = [
    { id: 'nh-1', timestamp: '2025-09-23 14:05:10', strategy: 'Critical Database Alerts', channel: 'SRE On-call Email', channelType: 'Email', recipient: 'sre-team@example.com', status: 'success', content: 'DB CPU > 95%' },
];
const MOCK_LOGIN_HISTORY: LoginHistoryRecord[] = [
    { id: 'lh-1', timestamp: '2025-09-23 10:00:00', ip: '192.168.1.1', device: 'Chrome on macOS', status: 'success' },
];
const MOCK_LOGS: LogEntry[] = [
    { id: 'log-1', timestamp: new Date().toISOString(), level: 'error', service: 'payment-service', message: 'Failed to process payment', details: { transactionId: 'txn-123' } },
];
const MOCK_TRACES: Trace[] = [
    { traceId: 'trace-1', spans: [], root: { serviceName: 'api-gateway', operationName: 'POST /checkout' }, duration: 1250.5, services: ['api-gateway', 'payment-service'], errorCount: 1, startTime: Date.now() - 100000 },
];
const MOCK_MAIL_SETTINGS: MailSettings = { smtpServer: 'smtp.example.com', port: 587, username: 'noreply@sre.platform', senderName: 'SRE Platform', senderEmail: 'noreply@sre.platform', encryption: 'tls' };
const MOCK_AUTH_SETTINGS: AuthSettings = { provider: 'Keycloak', enabled: true, clientId: 'sre-platform-client', clientSecret: '...', realm: 'sre', authUrl: '...', tokenUrl: '...', userInfoUrl: '...' };
const LAYOUT_WIDGETS: LayoutWidget[] = [
    { id: 'incident_pending_count', name: '待處理事件', description: '顯示目前狀態為「新」的事件總數。', supportedPages: ['事件管理'] },
    { id: 'incident_in_progress', name: '處理中事件', description: '顯示目前狀態為「已認領」的事件總數。', supportedPages: ['事件管理'] },
    { id: 'incident_resolved_today', name: '今日已解決', description: '顯示今天已解決的事件總數。', supportedPages: ['事件管理'] },
    { id: 'sre_pending_incidents', name: '待處理事件', description: '顯示待處理的事件總數。', supportedPages: ['SREWarRoom'] },
    { id: 'sre_in_progress', name: '處理中', description: '顯示正在處理中的事件。', supportedPages: ['SREWarRoom'] },
    { id: 'sre_resolved_today', name: '今日已解決', description: '顯示今日已解決的事件。', supportedPages: ['SREWarRoom'] },
    { id: 'sre_automation_rate', name: '自動化率', description: '顯示自動化處理的事件比例。', supportedPages: ['SREWarRoom'] },
    { id: 'infra_total_resources', name: '總資源數', description: '顯示所有監控的資源總數。', supportedPages: ['InfrastructureInsights'] },
    { id: 'infra_running', name: '運行中', description: '顯示當前運行中的資源數量。', supportedPages: ['InfrastructureInsights'] },
    { id: 'infra_anomalies', name: '異常', description: '顯示存在異常狀態的資源數量。', supportedPages: ['InfrastructureInsights'] },
    { id: 'infra_offline', name: '離線', description: '顯示當前離線的資源數量。', supportedPages: ['InfrastructureInsights'] },
];
const DEFAULT_LAYOUTS: Record<string, string[]> = {
    "SREWarRoom": ['sre_pending_incidents', 'sre_in_progress', 'sre_resolved_today', 'sre_automation_rate'],
    "InfrastructureInsights": ['infra_total_resources', 'infra_running', 'infra_anomalies', 'infra_offline'],
    "事件管理": ['incident_pending_count', 'incident_in_progress', 'incident_resolved_today'],
    "資源管理": ['resource_total_count', 'resource_health_rate', 'resource_alerting'],
    "自動化中心": ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts'],
    "儀表板管理": [],
    "分析中心": [],
    "身份與存取管理": [],
    "通知管理": [],
    "平台設定": [],
    "個人設定": [],
};
const KPI_DATA: Record<string, any> = {
    'incident_pending_count': { value: '5', description: '2 嚴重', icon: 'shield-alert', iconBgColor: 'bg-red-500' },
    'incident_in_progress': { value: '3', description: '↓15% vs yesterday', icon: 'clock', iconBgColor: 'bg-yellow-500' },
    'incident_resolved_today': { value: '12', description: '↑8% vs yesterday', icon: 'check-circle', iconBgColor: 'bg-green-500' },
    'sre_pending_incidents': { value: '5', description: '2 嚴重', icon: 'shield-alert', iconBgColor: 'bg-red-500' },
    'sre_in_progress': { value: '3', description: '↓15% vs yesterday', icon: 'clock', iconBgColor: 'bg-yellow-500' },
    'sre_resolved_today': { value: '12', description: '↑8% vs yesterday', icon: 'check-circle', iconBgColor: 'bg-green-500' },
    'sre_automation_rate': { value: '35.2%', description: '4 事件自動解決', icon: 'bot', iconBgColor: 'bg-sky-500' },
    'infra_total_resources': { value: '120', description: '跨雲供應商', icon: 'database-zap', iconBgColor: 'bg-blue-500' },
    'infra_running': { value: '115', description: '95.8% 健康', icon: 'heart-pulse', iconBgColor: 'bg-green-500' },
    'infra_anomalies': { value: '5', description: '4.2% 需要關注', icon: 'siren', iconBgColor: 'bg-orange-500' },
    'infra_offline': { value: '0', description: '0% 離線', icon: 'cloud-off', iconBgColor: 'bg-slate-500' },
};
const MOCK_AI_BRIEFING = {
    "stability_summary": "系統整體穩定，但支付 API 錯誤率略高於正常水平，需持續關注。",
    "key_anomaly": { "description": "支付 API 的錯誤率達到 5%，可能影響交易成功率。", "resource_name": "支付 API", "resource_path": "/dashboard/api-service-status" },
    "recommendation": { "action_text": "由於錯誤率上升，建議立即檢視支付 API 的日誌以找出根本原因。", "button_text": "查看日誌", "button_link": "/analyzing/logs" }
};
const MOCK_LINKS = [{ source: 'res-001', target: 'res-003' }];
const MOCK_USER_PREFERENCES: UserPreferences = { theme: 'dark', language: 'zh-TW', timezone: 'Asia/Taipei', defaultPage: 'sre-war-room' };

// New AI Mock Data
const MOCK_AI_RISK_PREDICTION = {
    summary: "預計 API 閘道因延遲尖峰與部署失敗，可能在接下來的 24 小時內發生服務降級。資料庫資源因高記憶體使用率也存在風險。",
    risk_breakdown: { low: 60, medium: 30, high: 10 },
    top_risky_resources: [
        { name: "api-gateway-prod-01", risk: "服務降級或中斷" },
        { name: "user-service", risk: "因部署失敗導致功能異常" },
        { name: "rds-prod-main", risk: "資料庫效能緩慢或無回應" }
    ]
};

const MOCK_AI_HEALTH_SCORE = { score: 75, summary: "系統因 API 延遲與錯誤率上升而處於警告狀態，但關鍵基礎設施尚屬穩定。" };

const MOCK_AI_ANOMALIES = [
    { severity: 'critical', description: 'API Latency p99 has spiked to 1200ms.', timestamp: '5 minutes ago' },
    { severity: 'warning', description: 'Error rate increased to 5.2% after `api-service` deployment.', timestamp: '2 hours ago' },
    { severity: 'warning', description: 'Database connection pool is at 95% capacity.', timestamp: '15 minutes ago' },
];

const MOCK_AI_SUGGESTIONS = [
    { title: '擴展 Kubernetes API 服務', impact: '高', effort: '中', details: '`api-service` 的 CPU 使用率持續偏高，建議增加副本數以應對流量。', action_button_text: '查看資源', action_link: '/resources/res-007' },
];

const MOCK_SINGLE_INCIDENT_ANALYSIS: IncidentAnalysis = {
    summary: '此事件由 API 延遲規則觸發，根本原因可能與最近的 `api-server-01` 部署有關。',
    root_causes: ['`api-server-01` 最近的程式碼變更引入了效能迴歸。', '下游 `user-service` 回應緩慢。'],
    recommendations: [{ description: '建議回滾 `api-server-01` 的部署。', action_text: '執行回滾腳本', playbook_id: 'play-003' }]
};

const MOCK_MULTI_INCIDENT_ANALYSIS: MultiIncidentAnalysis = {
    summary: '多個事件均指向 `db-primary` 資料庫效能問題。',
    common_patterns: ['所有事件都在高流量時段發生。', '皆涉及資料庫讀取密集型操作。'],
    group_actions: [{ description: '建議對 `db-primary` 進行緊急擴容。', action_text: '執行資料庫擴容', playbook_id: 'play-004' }]
};

const MOCK_GENERATED_PLAYBOOK = {
    type: 'shell',
    content: '#!/bin/bash\n\nNAMESPACE=$1\nPOD_NAME=$2\n\nif [ -z "$NAMESPACE" ] || [ -z "$POD_NAME" ]; then\n  echo "Error: Both namespace and pod_name are required."\n  exit 1\nfi\n\necho "Attempting to restart pod $POD_NAME in namespace $NAMESPACE..."\nkubectl delete pod $POD_NAME -n $NAMESPACE\n\nif [ $? -eq 0 ]; then\n  echo "Pod $POD_NAME successfully deleted. It will be restarted by its controller."\nelse\n  echo "Error: Failed to delete pod $POD_NAME."\n  exit 1\nfi',
    parameters: [
        { name: 'namespace', label: 'Namespace', type: 'string', required: true, placeholder: 'e.g., production' },
        { name: 'pod_name', label: 'Pod Name', type: 'string', required: true, placeholder: 'e.g., api-gateway-xyz' }
    ]
};


function createInitialDB() {
    // Deep clone to make it mutable
    return {
        dashboards: JSON.parse(JSON.stringify(MOCK_DASHBOARDS)),
        availableGrafanaDashboards: JSON.parse(JSON.stringify(MOCK_AVAILABLE_GRAFANA_DASHBOARDS)),
        dashboardTemplates: JSON.parse(JSON.stringify(MOCK_DASHBOARD_TEMPLATES)),
        incidents: JSON.parse(JSON.stringify(MOCK_INCIDENTS)),
        alertRules: JSON.parse(JSON.stringify(MOCK_ALERT_RULES)),
        alertRuleTemplates: JSON.parse(JSON.stringify(MOCK_ALERT_RULE_TEMPLATES)),
        silenceRules: JSON.parse(JSON.stringify(MOCK_SILENCE_RULES)),
        silenceRuleTemplates: JSON.parse(JSON.stringify(MOCK_SILENCE_RULE_TEMPLATES)),
        resources: JSON.parse(JSON.stringify(MOCK_RESOURCES)),
        resourceGroups: JSON.parse(JSON.stringify(MOCK_RESOURCE_GROUPS)),
        resourceLinks: JSON.parse(JSON.stringify(MOCK_LINKS)),
        playbooks: JSON.parse(JSON.stringify(MOCK_PLAYBOOKS)),
        automationExecutions: JSON.parse(JSON.stringify(MOCK_AUTOMATION_EXECUTIONS)),
        automationTriggers: JSON.parse(JSON.stringify(MOCK_AUTOMATION_TRIGGERS)),
        users: JSON.parse(JSON.stringify(MOCK_USERS)),
        teams: JSON.parse(JSON.stringify(MOCK_TEAMS)),
        roles: JSON.parse(JSON.stringify(MOCK_ROLES)),
        availablePermissions: JSON.parse(JSON.stringify(AVAILABLE_PERMISSIONS)),
        auditLogs: JSON.parse(JSON.stringify(MOCK_AUDIT_LOGS)),
        tagDefinitions: JSON.parse(JSON.stringify(MOCK_TAG_DEFINITIONS)),
        tagCategories: JSON.parse(JSON.stringify(MOCK_TAG_CATEGORIES)),
        notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)),
        notificationStrategies: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_STRATEGIES)),
        notificationChannels: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_CHANNELS)),
        notificationHistory: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_HISTORY)),
        loginHistory: JSON.parse(JSON.stringify(MOCK_LOGIN_HISTORY)),
        logs: JSON.parse(JSON.stringify(MOCK_LOGS)),
        traces: JSON.parse(JSON.stringify(MOCK_TRACES)),
        mailSettings: JSON.parse(JSON.stringify(MOCK_MAIL_SETTINGS)),
        authSettings: JSON.parse(JSON.stringify(MOCK_AUTH_SETTINGS)),
        userPreferences: JSON.parse(JSON.stringify(MOCK_USER_PREFERENCES)),
        layouts: JSON.parse(JSON.stringify(DEFAULT_LAYOUTS)),
        layoutWidgets: JSON.parse(JSON.stringify(LAYOUT_WIDGETS)),
        kpiData: JSON.parse(JSON.stringify(KPI_DATA)),
        // AI DATA
        aiBriefing: JSON.parse(JSON.stringify(MOCK_AI_BRIEFING)),
        aiRiskPrediction: JSON.parse(JSON.stringify(MOCK_AI_RISK_PREDICTION)),
        aiHealthScore: JSON.parse(JSON.stringify(MOCK_AI_HEALTH_SCORE)),
        aiAnomalies: JSON.parse(JSON.stringify(MOCK_AI_ANOMALIES)),
        aiSuggestions: JSON.parse(JSON.stringify(MOCK_AI_SUGGESTIONS)),
        singleIncidentAnalysis: JSON.parse(JSON.stringify(MOCK_SINGLE_INCIDENT_ANALYSIS)),
        multiIncidentAnalysis: JSON.parse(JSON.stringify(MOCK_MULTI_INCIDENT_ANALYSIS)),
        generatedPlaybook: JSON.parse(JSON.stringify(MOCK_GENERATED_PLAYBOOK)),
    };
}

// Create and export the database as a constant to ensure it's initialized on module load.
export const DB = createInitialDB();
