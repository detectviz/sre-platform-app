import { 
    Dashboard, DashboardTemplate, Incident, AlertRule, AlertRuleTemplate, SilenceRule, SilenceRuleTemplate,
    Resource, ResourceGroup, AutomationPlaybook, AutomationExecution, AutomationTrigger, User, Team, Role, 
    AuditLog, TagDefinition, NotificationItem, NotificationStrategy, NotificationChannel,
    NotificationHistoryRecord, LoginHistoryRecord, LogEntry, Trace, MailSettings, AuthSettings, LayoutWidget,
    UserPreferences,
    DashboardType,
    IncidentAnalysis,
    MultiIncidentAnalysis,
    LogAnalysis,
    LogLevel,
    TraceAnalysis,
    Span,
    NavItem,
    TabConfigMap,
    PlatformSettings,
    PreferenceOptions,
    GrafanaSettings,
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

const MOCK_PAGE_METADATA: Record<string, { columnConfigKey: string }> = {
  'dashboards': { columnConfigKey: 'dashboards' },
  'incidents': { columnConfigKey: 'incidents' },
  'resources': { columnConfigKey: 'resources' },
  'personnel': { columnConfigKey: 'personnel' },
  'alert_rules': { columnConfigKey: 'alert_rules' },
  'silence_rules': { columnConfigKey: 'silence_rules' },
};

const MOCK_ICON_MAP: Record<string, string> = {
    'home': 'home',
    'incidents': 'shield-alert',
    'resources': 'database-zap',
    'dashboard': 'layout-dashboard',
    'analyzing': 'activity',
    'automation': 'bot',
    'settings': 'settings',
    'identity-access-management': 'users',
    'notification-management': 'bell',
    'platform-settings': 'sliders-horizontal',
    'MenuFoldOutlined': 'menu',
    'MenuUnfoldOutlined': 'menu',
    'menu-fold': 'align-justify',
    'menu-unfold': 'align-left',
    'deployment-unit': 'box',
};

const MOCK_CHART_COLORS: string[] = ['#38bdf8', '#a78bfa', '#34d399', '#f87171', '#fbbf24', '#60a5fa'];

const MOCK_NAV_ITEMS: NavItem[] = [
    { key: 'home', label: '首頁', icon: 'home' },
    { key: 'incidents', label: '事件管理', icon: 'shield-alert' },
    { key: 'resources', label: '資源管理', icon: 'database-zap' },
    { key: 'dashboards', label: '儀表板管理', icon: 'layout-dashboard' },
    { key: 'analyzing', label: '分析中心', icon: 'activity' },
    { key: 'automation', label: '自動化中心', icon: 'bot' },
    {
      key: 'settings',
      label: '設定',
      icon: 'settings',
      children: [
         { key: 'settings/identity-access-management', label: '身份與存取', icon: 'users' },
         { key: 'settings/notification-management', label: '通知管理', icon: 'bell' },
         { key: 'settings/platform-settings', label: '平台設定', icon: 'sliders-horizontal' },
      ],
    },
];
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
    { id: 'INC-001', summary: 'API 延遲超過閾值', resource: 'api-server-01', resourceId: 'res-001', serviceImpact: 'High', rule: 'API 延遲規則', ruleId: 'rule-002', status: 'new', severity: 'warning', priority: 'P1', assignee: '張三', triggeredAt: '2024-01-15 10:30:00', history: [ { timestamp: '2024-01-15 10:30:00', user: 'System', action: 'Incident created from rule "API 延遲規則".' } ] },
    { id: 'INC-002', summary: '資料庫連接超時', resource: 'db-primary', resourceId: 'res-002', serviceImpact: 'High', rule: '資料庫連接規則', ruleId: 'rule-db-conn', status: 'acknowledged', severity: 'critical', priority: 'P0', assignee: '李四', triggeredAt: '2024-01-15 10:15:00', history: [ { timestamp: '2024-01-15 10:15:00', user: 'System', action: 'Incident created from rule "資料庫連接規則".' } ] },
];
const MOCK_QUICK_SILENCE_DURATIONS = [1, 2, 4, 8, 12, 24]; // hours
const MOCK_ALERT_RULES: AlertRule[] = [
    { id: 'rule-001', name: 'CPU 使用率過高', description: '當任何伺服器的 CPU 使用率連續 5 分鐘超過 90% 時觸發。', enabled: true, target: '所有伺服器', conditionsSummary: 'CPU > 90% for 5m', severity: 'critical', automationEnabled: true, creator: 'Admin User', lastUpdated: '2025-09-22 10:00:00', automation: { enabled: true, scriptId: 'play-002' } },
    { id: 'rule-002', name: 'API 延遲規則', description: 'API Gateway 的 p95 延遲超過 500ms。', enabled: true, target: 'api-gateway-prod', conditionsSummary: 'Latency > 500ms', severity: 'warning', automationEnabled: false, creator: 'Emily White', lastUpdated: '2025-09-21 15:30:00' },
];
const MOCK_ALERT_RULE_TEMPLATES: AlertRuleTemplate[] = [
    { id: 'art-001', name: 'High CPU Usage', emoji: '🔥', data: { description: 'Monitors CPU usage and alerts when it exceeds a threshold.', conditionGroups: [{ logic: 'OR', severity: 'warning', conditions: [{ metric: 'cpu_usage_percent', operator: '>', threshold: 80, durationMinutes: 5 }] }] } },
    { id: 'art-002', name: 'Low Disk Space', emoji: '💾', data: { description: 'Alerts when disk space is critically low.', conditionGroups: [{ logic: 'OR', severity: 'critical', conditions: [{ metric: 'disk_free_percent', operator: '<', threshold: 10, durationMinutes: 15 }] }] } },
];
const MOCK_SILENCE_RULES: SilenceRule[] = [
    { id: 'sil-001', name: '週末維護窗口', description: '週末例行維護期間静音所有 staging 環境的告警。', enabled: true, type: 'repeat', matchers: [{ key: 'env', operator: '=', value: 'staging' }], schedule: { type: 'recurring', cron: '0 22 * * 5', timezone: 'Asia/Taipei' }, creator: 'Admin User', createdAt: '2025-09-20 18:00:00' },
];
const MOCK_SILENCE_RULE_TEMPLATES: SilenceRuleTemplate[] = [
    { id: 'srt-001', name: 'Staging Maintenance', emoji: '🚧', data: { description: 'Silence all alerts from the staging environment.', matchers: [{ key: 'env', operator: '=', value: 'staging' }] } },
    { id: 'srt-002', name: 'Weekend Silence', emoji: '😴', data: { description: 'Silence non-critical alerts over the weekend.', matchers: [{ key: 'severity', operator: '!=', value: 'critical' }], schedule: { type: 'recurring', cron: '0 0 * * 6' } } },
];
const MOCK_SILENCE_RULE_OPTIONS = {
    keys: ['severity', 'env', 'service', 'resource_type'],
    values: {
        severity: ['critical', 'warning', 'info'],
        env: ['production', 'staging', 'development'],
    }
};
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
const MOCK_USER_STATUSES: User['status'][] = ['active', 'invited', 'inactive'];
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
const MOCK_NOTIFICATION_STRATEGY_OPTIONS = {
    priorities: ['High', 'Medium', 'Low'],
    conditionKeys: {
        severity: ['critical', 'warning', 'info'],
        resource_type: ['API Gateway', 'RDS Database', 'EKS Cluster'],
    }
};
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
const trace1StartTime = Date.now() - 100000;
const MOCK_TRACES: Trace[] = [
    { 
        traceId: 'trace-1', 
        spans: [
            { traceId: 'trace-1', spanId: 'span-1a', operationName: 'POST /checkout', serviceName: 'api-gateway', startTime: trace1StartTime, duration: 1250, status: 'error', tags: { 'http.status_code': 500 }, logs: [] },
            { traceId: 'trace-1', spanId: 'span-1b', parentId: 'span-1a', operationName: 'authorize', serviceName: 'auth-service', startTime: trace1StartTime + 50, duration: 200, status: 'ok', tags: {}, logs: [] },
            { traceId: 'trace-1', spanId: 'span-1c', parentId: 'span-1a', operationName: 'processPayment', serviceName: 'payment-service', startTime: trace1StartTime + 250, duration: 1000, status: 'error', tags: { 'error': true, 'db.statement': 'SELECT * FROM users' }, logs: [] },
            { traceId: 'trace-1', spanId: 'span-1d', parentId: 'span-1c', operationName: 'DB Query', serviceName: 'payment-db', startTime: trace1StartTime + 300, duration: 800, status: 'error', tags: { 'db.statement': 'SELECT * FROM credit_cards WHERE user_id = ?' }, logs: [] }
        ], 
        root: { serviceName: 'api-gateway', operationName: 'POST /checkout' }, 
        duration: 1250.5, 
        services: ['api-gateway', 'auth-service', 'payment-service', 'payment-db'], 
        errorCount: 3, 
        startTime: trace1StartTime
    },
    {
        traceId: 'trace-2',
        spans: [
             { traceId: 'trace-2', spanId: 'span-2a', operationName: 'GET /products', serviceName: 'product-service', startTime: trace1StartTime + 2000, duration: 350, status: 'ok', tags: { 'http.status_code': 200 }, logs: [] }
        ],
        root: { serviceName: 'product-service', operationName: 'GET /products' },
        duration: 350,
        services: ['product-service'],
        errorCount: 0,
        startTime: trace1StartTime + 2000
    }
];
const MOCK_MAIL_SETTINGS: MailSettings = { smtpServer: 'smtp.example.com', port: 587, username: 'noreply@sre.platform', senderName: 'SRE Platform', senderEmail: 'noreply@sre.platform', encryption: 'tls' };
const MOCK_GRAFANA_SETTINGS: GrafanaSettings = { enabled: true, url: 'http://localhost:3000', apiKey: 'glsa_xxxxxxxxxxxxxxxxxxxxxxxx', orgId: 1 };
const MOCK_AUTH_SETTINGS: AuthSettings = { provider: 'Keycloak', enabled: true, clientId: 'sre-platform-client', clientSecret: '...', realm: 'sre', authUrl: '...', tokenUrl: '...', userInfoUrl: '...', idpAdminUrl: 'http://localhost:8080/admin/master/console/' };
const LAYOUT_WIDGETS: LayoutWidget[] = [
    // Incident Management
    { id: 'incident_pending_count', name: '待處理事件', description: '顯示目前狀態為「新」的事件總數。', supportedPages: ['事件管理'] },
    { id: 'incident_in_progress', name: '處理中事件', description: '顯示目前狀態為「已認領」的事件總數。', supportedPages: ['事件管理'] },
    { id: 'incident_resolved_today', name: '今日已解決', description: '顯示今天已解決的事件總數。', supportedPages: ['事件管理'] },
    // SREWarRoom
    { id: 'sre_pending_incidents', name: '待處理事件', description: '顯示待處理的事件總數。', supportedPages: ['SREWarRoom'] },
    { id: 'sre_in_progress', name: '處理中', description: '顯示正在處理中的事件。', supportedPages: ['SREWarRoom'] },
    { id: 'sre_resolved_today', name: '今日已解決', description: '顯示今日已解決的事件。', supportedPages: ['SREWarRoom'] },
    { id: 'sre_automation_rate', name: '自動化率', description: '顯示自動化處理的事件比例。', supportedPages: ['SREWarRoom'] },
    // InfrastructureInsights
    { id: 'infra_total_resources', name: '總資源數', description: '顯示所有監控的資源總數。', supportedPages: ['InfrastructureInsights'] },
    { id: 'infra_running', name: '運行中', description: '顯示當前運行中的資源數量。', supportedPages: ['InfrastructureInsights'] },
    { id: 'infra_anomalies', name: '異常', description: '顯示存在異常狀態的資源數量。', supportedPages: ['InfrastructureInsights'] },
    { id: 'infra_offline', name: '離線', description: '顯示當前離線的資源數量。', supportedPages: ['InfrastructureInsights'] },
    
    // NEW WIDGETS START HERE
    // Resource Management
    { id: 'resource_total_count', name: '資源總數', description: '顯示所有已註冊的資源總數。', supportedPages: ['資源管理'] },
    { id: 'resource_health_rate', name: '資源健康率', description: '處於健康狀態的資源百分比。', supportedPages: ['資源管理'] },
    { id: 'resource_alerting', name: '告警中資源', description: '目前處於警告或嚴重狀態的資源數。', supportedPages: ['資源管理'] },

    // Dashboard Management
    { id: 'dashboard_total_count', name: '儀表板總數', description: '平台中所有儀表板的數量。', supportedPages: ['儀表板管理'] },
    { id: 'dashboard_custom_count', name: '自訂儀表板', description: '使用者自訂的內建儀表板數量。', supportedPages: ['儀表板管理'] },
    { id: 'dashboard_grafana_count', name: 'Grafana 儀表板', description: '從 Grafana 連結的儀表板數量。', supportedPages: ['儀表板管理'] },

    // Analysis Center
    { id: 'analysis_critical_anomalies', name: '嚴重異常 (24H)', description: '過去 24 小時内偵測到的嚴重異常事件。', supportedPages: ['分析中心'] },
    { id: 'analysis_log_volume', name: '日誌量 (24H)', description: '過去 24 小時的總日誌量。', supportedPages: ['分析中心'] },
    { id: 'analysis_trace_errors', name: '追蹤錯誤率', description: '包含錯誤的追蹤佔比。', supportedPages: ['分析中心'] },
    
    // Automation Center
    { id: 'automation_runs_today', name: '今日運行次數', description: '所有自動化腳本今日的總運行次數。', supportedPages: ['自動化中心'] },
    { id: 'automation_success_rate', name: '成功率', description: '自動化腳本的整體執行成功率。', supportedPages: ['自動化中心'] },
    { id: 'automation_suppressed_alerts', name: '已抑制告警', description: '因自動化成功執行而抑制的告警數。', supportedPages: ['自動化中心'] },

    // IAM
    { id: 'iam_total_users', name: '使用者總數', description: '平台中的總使用者帳號數。', supportedPages: ['身份與存取管理'] },
    { id: 'iam_active_users', name: '活躍使用者', description: '過去 7 天内有登入活動的使用者。', supportedPages: ['身份與存取管理'] },
    { id: 'iam_login_failures', name: '登入失敗 (24H)', description: '過去 24 小時內的登入失敗次數。', supportedPages: ['身份與存取管理'] },

    // Notification Management
    { id: 'notification_sent_today', name: '今日已發送', description: '今日透過所有管道發送的通知總數。', supportedPages: ['通知管理'] },
    { id: 'notification_failure_rate', name: '發送失敗率', description: '通知發送的整體失敗率。', supportedPages: ['通知管理'] },
    { id: 'notification_channels', name: '啟用中管道', description: '目前已啟用並可用的通知管道數。', supportedPages: ['通知管理'] },

    // Platform Settings
    { id: 'platform_tags_defined', name: '標籤總數', description: '平台中定義的標籤鍵總數。', supportedPages: ['平台設定'] },
    { id: 'platform_auth_provider', name: '認證提供商', description: '目前使用的身份驗證提供商。', supportedPages: ['平台設定'] },
    { id: 'platform_mail_status', name: '郵件服務狀態', description: '郵件發送服務的健康狀態。', supportedPages: ['平台設定'] },

    // Personal Settings
    { id: 'profile_login_count_7d', name: '最近 7 日登入次數', description: '過去 7 天內的成功登入次數。', supportedPages: ['個人設定'] },
    { id: 'profile_last_password_change', name: '上次密碼變更', description: '您的密碼上次更新的時間。', supportedPages: ['個人設定'] },
    { id: 'profile_mfa_status', name: 'MFA 狀態', description: '多因素驗證 (MFA) 的啟用狀態。', supportedPages: ['個人設定'] },
];
const DEFAULT_LAYOUTS: Record<string, { widgetIds: string[]; updatedAt: string; updatedBy: string; }> = {
    "SREWarRoom": { widgetIds: ['sre_pending_incidents', 'sre_in_progress', 'sre_resolved_today', 'sre_automation_rate'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "InfrastructureInsights": { widgetIds: ['infra_total_resources', 'infra_running', 'infra_anomalies', 'infra_offline'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "事件管理": { widgetIds: ['incident_pending_count', 'incident_in_progress', 'incident_resolved_today'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "資源管理": { widgetIds: ['resource_total_count', 'resource_health_rate', 'resource_alerting'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "儀表板管理": { widgetIds: ['dashboard_total_count', 'dashboard_custom_count', 'dashboard_grafana_count'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "分析中心": { widgetIds: ['analysis_critical_anomalies', 'analysis_log_volume', 'analysis_trace_errors'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "自動化中心": { widgetIds: ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "身份與存取管理": { widgetIds: ['iam_total_users', 'iam_active_users', 'iam_login_failures'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "通知管理": { widgetIds: ['notification_sent_today', 'notification_failure_rate', 'notification_channels'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "平台設定": { widgetIds: ['platform_tags_defined', 'platform_auth_provider', 'platform_mail_status'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
    "個人設定": { widgetIds: ['profile_login_count_7d', 'profile_last_password_change', 'profile_mfa_status'], updatedAt: '2025-09-24 10:30:00', updatedBy: 'Admin User' },
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
    
    // NEW DATA
    'resource_total_count': { value: '345', description: '↑2% vs last week', icon: 'database', iconBgColor: 'bg-blue-500' },
    'resource_health_rate': { value: '98.5%', description: '340 健康', icon: 'heart-pulse', iconBgColor: 'bg-green-500' },
    'resource_alerting': { value: '5', description: '3 critical, 2 warning', icon: 'siren', iconBgColor: 'bg-orange-500' },

    'dashboard_total_count': { value: '28', description: '↑3 vs last month', icon: 'layout-dashboard', iconBgColor: 'bg-indigo-500' },
    'dashboard_custom_count': { value: '12', description: 'Built-in dashboards', icon: 'layout', iconBgColor: 'bg-sky-500' },
    'dashboard_grafana_count': { value: '16', description: 'Linked from Grafana', icon: 'area-chart', iconBgColor: 'bg-green-500' },

    'analysis_critical_anomalies': { value: '3', description: '↑1 vs yesterday', icon: 'zap', iconBgColor: 'bg-red-500' },
    'analysis_log_volume': { value: '25.1 GB', description: '↓5% vs yesterday', icon: 'file-text', iconBgColor: 'bg-teal-500' },
    'analysis_trace_errors': { value: '1.2%', description: '↑0.3% vs last hour', icon: 'git-fork', iconBgColor: 'bg-orange-500' },
    
    'automation_runs_today': { value: '1,283', description: '↑10% vs yesterday', icon: 'bot', iconBgColor: 'bg-sky-500' },
    'automation_success_rate': { value: '99.8%', description: '2 failures', icon: 'check-circle', iconBgColor: 'bg-green-500' },
    'automation_suppressed_alerts': { value: '45', description: 'Saved 2 hours of toil', icon: 'bell-off', iconBgColor: 'bg-purple-500' },

    'iam_total_users': { value: '124', description: '↑5 new users this month', icon: 'users', iconBgColor: 'bg-cyan-500' },
    'iam_active_users': { value: '98', description: '79% active rate', icon: 'user-check', iconBgColor: 'bg-green-500' },
    'iam_login_failures': { value: '8', description: 'From 3 unique IPs', icon: 'shield-off', iconBgColor: 'bg-red-500' },

    'notification_sent_today': { value: '342', description: '25 critical alerts', icon: 'send', iconBgColor: 'bg-blue-500' },
    'notification_failure_rate': { value: '0.5%', description: '2 failed sends', icon: 'alert-triangle', iconBgColor: 'bg-orange-500' },
    'notification_channels': { value: '8', description: 'Email, Slack, Webhook', icon: 'share-2', iconBgColor: 'bg-teal-500' },

    'platform_tags_defined': { value: '42', description: '12 required tags', icon: 'tags', iconBgColor: 'bg-indigo-500' },
    'platform_auth_provider': { value: 'Keycloak', description: 'OIDC Enabled', icon: 'key', iconBgColor: 'bg-yellow-500' },
    'platform_mail_status': { value: 'Healthy', description: 'SMTP service is operational', icon: 'mail', iconBgColor: 'bg-green-500' },

    // Personal Settings
    'profile_login_count_7d': { value: '8', description: '來自 2 個不同 IP', icon: 'log-in', iconBgColor: 'bg-blue-500' },
    'profile_last_password_change': { value: '3 天前', description: '建議每 90 天更新一次', icon: 'key', iconBgColor: 'bg-yellow-500' },
    'profile_mfa_status': { value: '已啟用', description: '您的帳戶受到保護', icon: 'shield-check', iconBgColor: 'bg-green-500' },
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
    { title: '擴展 Kubernetes API 服務', impact: '高' as '高', effort: '中' as '中', details: '`api-service` 的 CPU 使用率持續偏高，建議增加副本數以應對流量。', action_button_text: '查看資源', action_link: '/resources/res-007' },
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

const MOCK_LOG_ANALYSIS: LogAnalysis = {
    summary: '在過去 15 分鐘內，系統偵測到大量與支付服務相關的錯誤日誌。主要問題似乎與資料庫連線逾時有關，導致交易處理失敗。同時，API 閘道出現了少量的警告，可能是上游問題的連鎖反應。',
    patterns: [
        { description: '`payment-service`: Database connection timeout', count: 42, level: 'error' },
        { description: '`api-gateway`: Upstream service unavailable', count: 15, level: 'warning' },
        { description: '`auth-service`: Successful login', count: 120, level: 'info' },
    ],
    recommendations: [
        '立即檢查 `payment-service` 與 `payment-db` 之間的網路連線與防火牆規則。',
        '檢視 `payment-db` 的連線池設定，確認是否已滿。',
        '考慮為 `payment-service` 的資料庫查詢增加重試機制與超時控制。',
    ]
};

const MOCK_TRACE_ANALYSIS: TraceAnalysis = {
    summary: '此追蹤的主要延遲來自 `payment-service` 中的 `processPayment` 操作，佔總時長的 85%。瓶頸在於對 `payment-db` 的一次慢查詢，耗時超過 1 秒。',
    bottlenecks: [
        {
            span_name: 'SELECT user_balance',
            service_name: 'payment-db',
            duration_percent: 60,
            description: '資料庫查詢耗時 1050ms，缺少索引。'
        },
        {
            span_name: 'HTTP POST /api/v1/receipts',
            service_name: 'receipt-service',
            duration_percent: 20,
            description: '下游收據服務回應緩慢，耗時 350ms。'
        }
    ],
    recommendations: [
        '為 `user_transactions` 表的 `user_id` 和 `timestamp` 欄位新增複合索引。',
        '為對 `receipt-service` 的呼叫增加非同步處理或快取機制。',
        '檢視 `processPayment` 操作中的業務 logique，確認是否有可優化的部分。'
    ]
};

const MOCK_EVENT_CORRELATION_DATA = {
    nodes: [
        { id: '0', name: 'High DB CPU', value: 10, symbolSize: 50, category: 0 },
        { id: '1', name: 'API Latency Spike', value: 8, symbolSize: 40, category: 1 },
        { id: '2', name: 'Deployment', value: 5, symbolSize: 30, category: 2 },
        { id: '3', name: '5xx Errors', value: 9, symbolSize: 45, category: 1 },
        { id: '4', name: 'Low Disk Space', value: 6, symbolSize: 35, category: 0 },
    ],
    links: [
        { source: '0', target: '1' },
        { source: '1', target: '3' },
        { source: '2', target: '1' },
        { source: '0', target: '4' },
    ],
    categories: [
        { name: 'DB Alerts' },
        { name: 'API Errors' },
        { name: 'Infra Changes' },
    ],
};
const MOCK_CAPACITY_SUGGESTIONS = [
    { title: '擴展 Kubernetes 生產集群', impact: '高' as '高', effort: '中' as '中', details: '`k8s-prod-cluster` 的 CPU 預計在 15 天内達到 95%。建議增加 2 個節點以避免效能下降。' },
    { title: '升級 RDS 資料庫實例類型', impact: '中' as '中', effort: '高' as '高', details: '`rds-prod-main` 的記憶體使用率持續增長。建議從 `db.t3.large` 升級至 `db.t3.xlarge`。' },
    { title: '清理舊的 S3 儲存桶日誌', impact: '低' as '低', effort: '低' as '低', details: '`s3-log-archive` 儲存桶已超過 5TB。建議設定生命週期規則以降低成本。' },
];
const MOCK_CAPACITY_RESOURCE_ANALYSIS = [
    { name: 'api-gateway-prod-01', current: '55%', predicted: '75%', recommended: '擴展', cost: '+$150/月' },
    { name: 'rds-prod-main', current: '62%', predicted: '68%', recommended: '觀察', cost: '-' },
    { name: 'k8s-prod-cluster-node-1', current: '85%', predicted: '98%', recommended: '緊急擴展', cost: '+$200/月' },
    { name: 'elasticache-prod-03', current: '40%', predicted: '45%', recommended: '觀察', cost: '-' },
];
const MOCK_SERVICE_HEALTH_DATA = {
    heatmap_data: [
        [0,0,98],[0,1,100],[0,2,95],[0,3,99],
        [1,0,100],[1,1,100],[1,2,92],[1,3,98],
        [2,0,85],[2,1,90],[2,2,88],[2,3,91],
        [3,0,99],[3,1,99],[3,2,97],[3,3,100],
    ],
    x_axis_labels: ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1'],
    y_axis_labels: ['API Gateway', 'Database', 'Cache', 'Auth Service'],
};

const MOCK_RESOURCE_GROUP_STATUS_DATA = {
    group_names: ['Production Web', 'Core Databases', 'Cache Cluster', 'Logging Stack', 'API Services'],
    series: [
        { name: '健康' as const, data: [12, 8, 5, 10, 22] },
        { name: '警告' as const, data: [1, 0, 1, 2, 3] },
        { name: '嚴重' as const, data: [0, 1, 0, 0, 1] },
    ],
};

const now = Date.now();
const MOCK_ANALYSIS_OVERVIEW_DATA = {
    health_score_data: Array.from({ length: 60 }, (_, i) => ({
        name: new Date(now - (59 - i) * 60000).toString(),
        value: [new Date(now - (59 - i) * 60000), Math.floor(80 + Math.random() * 20 - i * 0.1)] as [Date, number],
    })),
    event_correlation_data: MOCK_EVENT_CORRELATION_DATA,
    recent_logs: MOCK_LOGS.slice(0, 10),
};

const MOCK_PLATFORM_SETTINGS: PlatformSettings = {
    helpUrl: 'https://docs.sre-platform.dev/help-center'
};

const MOCK_PREFERENCE_OPTIONS: PreferenceOptions = {
    defaults: {
        theme: 'dark',
        language: 'zh-TW',
        timezone: 'Asia/Taipei',
        defaultPage: 'sre-war-room',
    },
    timezones: ['Asia/Taipei', 'UTC', 'America/New_York', 'Europe/London'],
    languages: [{ value: 'en', label: 'English' }, { value: 'zh-TW', label: '繁體中文' }],
    themes: [{ value: 'dark', label: '深色' }, { value: 'light', label: '淺色' }, { value: 'system', label: '跟隨系統' }],
};

const MOCK_TAB_CONFIGS: TabConfigMap = {
    incidents: [
        { label: '事件列表', path: '/incidents', icon: 'list' },
        { label: '告警規則', path: '/incidents/rules', icon: 'settings-2' },
        { label: '靜音規則', path: '/incidents/silence', icon: 'bell-off' },
    ],
    resources: [
        { label: '資源列表', path: '/resources', icon: 'database' },
        { label: '資源群組', path: '/resources/groups', icon: 'layout-grid' },
        { label: '拓撲視圖', path: '/resources/topology', icon: 'share-2' },
    ],
    dashboards: [
        { label: '儀表板列表', path: '/dashboards', icon: 'layout-dashboard' },
        { label: '範本市集', path: '/dashboards/templates', icon: 'album' },
    ],
    analysis: [
        { label: '分析總覽', path: '/analyzing', icon: 'bar-chart-2' },
        { label: '日誌探索', path: '/analyzing/logs', icon: 'search' },
        { label: '鏈路追蹤', path: '/analyzing/traces', icon: 'git-fork' },
        { label: '容量規劃', path: '/analyzing/capacity', icon: 'bar-chart-big' },
        { label: 'AI 洞察', path: '/analyzing/insights', icon: 'brain-circuit' },
    ],
    automation: [
        { label: '腳本庫', path: '/automation', icon: 'notebook-tabs' },
        { label: '運行歷史', path: '/automation/history', icon: 'history' },
        { label: '觸發器', path: '/automation/triggers', icon: 'zap' },
    ],
    iam: [
        { label: '人員管理', path: '/settings/identity-access-management', icon: 'users' },
        { label: '團隊管理', path: '/settings/identity-access-management/teams', icon: 'users-2' },
        { label: '角色管理', path: '/settings/identity-access-management/roles', icon: 'shield' },
        { label: '審計日誌', path: '/settings/identity-access-management/audit-logs', icon: 'file-text' },
    ],
    notification: [
        { label: '通知策略', path: '/settings/notification-management', icon: 'list-checks' },
        { label: '通知管道', path: '/settings/notification-management/channels', icon: 'share-2' },
        { label: '發送歷史', path: '/settings/notification-management/history', icon: 'history' },
    ],
    platformSettings: [
        { label: '標籤管理', path: '/settings/platform-settings', icon: 'tags' },
        { label: '郵件設定', path: '/settings/platform-settings/mail', icon: 'mail' },
        { label: '身份驗證', path: '/settings/platform-settings/auth', icon: 'key' },
        { label: '版面管理', path: '/settings/platform-settings/layout', icon: 'layout' },
        { label: 'Grafana 設定', path: '/settings/platform-settings/grafana', icon: 'area-chart' },
    ],
    profile: [
        { label: '個人資訊', path: '/profile', icon: 'user' },
        { label: '安全設定', path: '/profile/security', icon: 'lock' },
        { label: '偏好設定', path: '/profile/preferences', icon: 'sliders-horizontal' },
    ]
};

function createInitialDB() {
    // Deep clone to make it mutable
    return {
        pageMetadata: JSON.parse(JSON.stringify(MOCK_PAGE_METADATA)),
        iconMap: JSON.parse(JSON.stringify(MOCK_ICON_MAP)),
        chartColors: JSON.parse(JSON.stringify(MOCK_CHART_COLORS)),
        navItems: JSON.parse(JSON.stringify(MOCK_NAV_ITEMS)),
        dashboards: JSON.parse(JSON.stringify(MOCK_DASHBOARDS)),
        availableGrafanaDashboards: JSON.parse(JSON.stringify(MOCK_AVAILABLE_GRAFANA_DASHBOARDS)),
        dashboardTemplates: JSON.parse(JSON.stringify(MOCK_DASHBOARD_TEMPLATES)),
        incidents: JSON.parse(JSON.stringify(MOCK_INCIDENTS)),
        quickSilenceDurations: JSON.parse(JSON.stringify(MOCK_QUICK_SILENCE_DURATIONS)),
        alertRules: JSON.parse(JSON.stringify(MOCK_ALERT_RULES)),
        alertRuleTemplates: JSON.parse(JSON.stringify(MOCK_ALERT_RULE_TEMPLATES)),
        silenceRules: JSON.parse(JSON.stringify(MOCK_SILENCE_RULES)),
        silenceRuleTemplates: JSON.parse(JSON.stringify(MOCK_SILENCE_RULE_TEMPLATES)),
        silenceRuleOptions: JSON.parse(JSON.stringify(MOCK_SILENCE_RULE_OPTIONS)),
        resources: JSON.parse(JSON.stringify(MOCK_RESOURCES)),
        resourceGroups: JSON.parse(JSON.stringify(MOCK_RESOURCE_GROUPS)),
        resourceLinks: JSON.parse(JSON.stringify(MOCK_LINKS)),
        playbooks: JSON.parse(JSON.stringify(MOCK_PLAYBOOKS)),
        automationExecutions: JSON.parse(JSON.stringify(MOCK_AUTOMATION_EXECUTIONS)),
        automationTriggers: JSON.parse(JSON.stringify(MOCK_AUTOMATION_TRIGGERS)),
        users: JSON.parse(JSON.stringify(MOCK_USERS)),
        userStatuses: JSON.parse(JSON.stringify(MOCK_USER_STATUSES)),
        teams: JSON.parse(JSON.stringify(MOCK_TEAMS)),
        roles: JSON.parse(JSON.stringify(MOCK_ROLES)),
        availablePermissions: JSON.parse(JSON.stringify(AVAILABLE_PERMISSIONS)),
        auditLogs: JSON.parse(JSON.stringify(MOCK_AUDIT_LOGS)),
        tagDefinitions: JSON.parse(JSON.stringify(MOCK_TAG_DEFINITIONS)),
        tagCategories: JSON.parse(JSON.stringify(MOCK_TAG_CATEGORIES)),
        notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)),
        notificationStrategies: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_STRATEGIES)),
        notificationStrategyOptions: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_STRATEGY_OPTIONS)),
        notificationChannels: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_CHANNELS)),
        notificationHistory: JSON.parse(JSON.stringify(MOCK_NOTIFICATION_HISTORY)),
        loginHistory: JSON.parse(JSON.stringify(MOCK_LOGIN_HISTORY)),
        logs: JSON.parse(JSON.stringify(MOCK_LOGS)),
        traces: JSON.parse(JSON.stringify(MOCK_TRACES)),
        mailSettings: JSON.parse(JSON.stringify(MOCK_MAIL_SETTINGS)),
        grafanaSettings: JSON.parse(JSON.stringify(MOCK_GRAFANA_SETTINGS)),
        authSettings: JSON.parse(JSON.stringify(MOCK_AUTH_SETTINGS)),
        userPreferences: JSON.parse(JSON.stringify(MOCK_USER_PREFERENCES)),
        layouts: JSON.parse(JSON.stringify(DEFAULT_LAYOUTS)),
        layoutWidgets: JSON.parse(JSON.stringify(LAYOUT_WIDGETS)),
        kpiData: JSON.parse(JSON.stringify(KPI_DATA)),
        columnConfigs: {
            dashboards: ['name', 'type', 'category', 'owner', 'updatedAt'],
            resources: ['status', 'name', 'type', 'provider', 'region', 'owner', 'lastCheckIn'],
            personnel: ['name', 'role', 'team', 'status', 'lastLogin'],
            alert_rules: ['name', 'target', 'conditionsSummary', 'severity', 'automationEnabled', 'creator', 'lastUpdated'],
            silence_rules: ['name', 'type', 'matchers', 'schedule', 'creator', 'createdAt'],
        },
        // NEW DYNAMIC UI CONFIGS
        tabConfigs: JSON.parse(JSON.stringify(MOCK_TAB_CONFIGS)),
        platformSettings: JSON.parse(JSON.stringify(MOCK_PLATFORM_SETTINGS)),
        preferenceOptions: JSON.parse(JSON.stringify(MOCK_PREFERENCE_OPTIONS)),
        // AI DATA
        aiBriefing: JSON.parse(JSON.stringify(MOCK_AI_BRIEFING)),
        aiRiskPrediction: JSON.parse(JSON.stringify(MOCK_AI_RISK_PREDICTION)),
        aiHealthScore: JSON.parse(JSON.stringify(MOCK_AI_HEALTH_SCORE)),
        aiAnomalies: JSON.parse(JSON.stringify(MOCK_AI_ANOMALIES)),
        aiSuggestions: JSON.parse(JSON.stringify(MOCK_AI_SUGGESTIONS)),
        singleIncidentAnalysis: JSON.parse(JSON.stringify(MOCK_SINGLE_INCIDENT_ANALYSIS)),
        multiIncidentAnalysis: JSON.parse(JSON.stringify(MOCK_MULTI_INCIDENT_ANALYSIS)),
        generatedPlaybook: JSON.parse(JSON.stringify(MOCK_GENERATED_PLAYBOOK)),
        logAnalysis: JSON.parse(JSON.stringify(MOCK_LOG_ANALYSIS)),
        traceAnalysis: JSON.parse(JSON.stringify(MOCK_TRACE_ANALYSIS)),
        eventCorrelationData: JSON.parse(JSON.stringify(MOCK_EVENT_CORRELATION_DATA)),
        capacitySuggestions: JSON.parse(JSON.stringify(MOCK_CAPACITY_SUGGESTIONS)),
        capacityResourceAnalysis: JSON.parse(JSON.stringify(MOCK_CAPACITY_RESOURCE_ANALYSIS)),
        serviceHealthData: JSON.parse(JSON.stringify(MOCK_SERVICE_HEALTH_DATA)),
        resourceGroupStatusData: JSON.parse(JSON.stringify(MOCK_RESOURCE_GROUP_STATUS_DATA)),
        analysisOverviewData: JSON.parse(JSON.stringify(MOCK_ANALYSIS_OVERVIEW_DATA)),
    };
}

// Create and export the database as a constant to ensure it's initialized on module load.
export const DB = createInitialDB();