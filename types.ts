import React from 'react';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

export type DashboardType = 'built-in' | 'grafana';

export interface DashboardLayoutItem {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Dashboard {
  id: string;
  name: string;
  type: DashboardType;
  category: string;
  description: string;
  owner: string;
  updatedAt: string;
  path: string;
  grafanaUrl?: string;
  grafana_dashboard_uid?: string;
  grafana_folder_uid?: string;
  layout?: DashboardLayoutItem[];
  deleted_at?: string;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface IncidentEvent {
  timestamp: string;
  user: string;
  action: string;
  details?: string;
}

export interface Recommendation {
  description: string;
  action_text?: string;
  action_link?: string;
  playbook_id?: string;
}

export interface GroupActionRecommendation extends Recommendation {
    target_incident_ids?: string[];
}

export interface IncidentAnalysis {
  summary: string;
  root_causes: string[];
  recommendations: Recommendation[];
}

export interface MultiIncidentAnalysis {
  summary: string;
  common_patterns: string[];
  group_actions: GroupActionRecommendation[];
}

export interface Incident {
  id: string;
  summary: string;
  resource: string;
  resourceId: string;
  serviceImpact: 'High' | 'Medium' | 'Low';
  rule: string;
  ruleId: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'silenced';
  severity: 'critical' | 'warning' | 'info';
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  assignee?: string;
  triggeredAt: string;
  history: IncidentEvent[];
  aiAnalysis?: IncidentAnalysis;
}

export interface LayoutWidget {
    id: string;
    name: string;
    description: string;
    supportedPages: string[];
}

export interface Resource {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  type: string;
  provider: string;
  region: string;
  owner: string;
  lastCheckIn: string;
}

export interface ResourceFilters {
  keyword?: string;
  status?: Resource['status'];
  type?: string;
  provider?: string;
  region?: string;
}

export interface ResourceGroup {
  id: string;
  name: string;
  description: string;
  ownerTeam: string;
  memberIds: string[];
  statusSummary: {
    healthy: number;
    warning: number;
    critical: number;
  };
  deleted_at?: string;
}

export interface ParameterDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface AutomationPlaybook {
  id: string;
  name: string;
  description: string;
  trigger: string;
  type: 'shell' | 'python' | 'ansible' | 'terraform';
  content: string;
  lastRun: string;
  lastRunStatus: 'success' | 'failed' | 'running';
  runCount: number;
  parameters?: ParameterDefinition[];
  deleted_at?: string;
}

export interface AutomationExecution {
  id: string;
  scriptId: string;
  scriptName: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  triggerSource: 'manual' | 'event' | 'schedule';
  triggeredBy: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  parameters?: Record<string, any>;
  logs: {
    stdout: string;
    stderr: string;
  };
  deleted_at?: string;
}

export type TriggerType = 'Schedule' | 'Webhook' | 'Event';

export interface AutomationTrigger {
  id: string;
  name: string;
  description: string;
  type: TriggerType;
  enabled: boolean;
  targetPlaybookId: string;
  config: {
    // Schedule
    cron?: string;
    // Webhook
    webhookUrl?: string;
    // Event
    eventConditions?: string; // Simplified condition string
  };
  lastTriggered: string;
  creator: string;
  deleted_at?: string;
}

export interface MailSettings {
    smtpServer: string;
    port: number;
    username: string;
    senderName: string;
    senderEmail: string;
    encryption: 'none' | 'tls' | 'ssl';
    encryptionModes?: string[];
}

export interface GrafanaSettings {
  enabled: boolean;
  url: string;
  apiKey: string;
  orgId: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'SRE' | 'Developer' | 'Viewer';
  team: string;
  status: 'active' | 'invited' | 'inactive';
  lastLogin: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  deleted_at?: string;
}

export interface RolePermission {
    module: string;
    actions: ('read' | 'create' | 'update' | 'delete' | 'execute')[];
}

export interface Role {
    id: string;
    name: string;
    description: string;
    userCount: number;
    status: 'active' | 'inactive';
    createdAt: string;
    permissions: RolePermission[];
    deleted_at?: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    user: { id: string, name: string };
    action: string;
    target: { type: string, name: string };
    result: 'success' | 'failure';
    ip: string;
    details: Record<string, any>;
}

export interface RuleCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=';
  threshold: number;
  durationMinutes: number;
}

export interface ConditionGroup {
  logic: 'AND' | 'OR';
  conditions: RuleCondition[];
  severity: 'critical' | 'warning' | 'info';
}

export interface AutomationSetting {
  enabled: boolean;
  scriptId?: string;
  parameters?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  target: string;
  conditionsSummary: string;
  severity: 'critical' | 'warning' | 'info';
  automationEnabled: boolean;
  creator: string;
  lastUpdated: string;
  labels?: string[];
  conditionGroups?: ConditionGroup[];
  titleTemplate?: string;
  contentTemplate?: string;
  automation?: AutomationSetting;
  deleted_at?: string;
}

export interface SilenceMatcher {
  key: string;
  operator: '=' | '!=' | '~=';
  value: string;
}

export interface SilenceSchedule {
  type: 'single' | 'recurring';
  startsAt?: string;
  endsAt?: string;
  cron?: string;
  timezone?: string;
}

export interface SilenceRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'single' | 'repeat' | 'condition';
  matchers: SilenceMatcher[];
  schedule: SilenceSchedule;
  creator: string;
  createdAt: string;
  deleted_at?: string;
}

export interface AlertRuleTemplate {
  id: string;
  name: string;
  emoji: string;
  data: Partial<AlertRule>;
}

export interface SilenceRuleTemplate {
  id: string;
  name: string;
  emoji: string;
  data: Partial<SilenceRule>;
}

export type NotificationChannelType = 'Email' | 'Slack' | 'Webhook';

export interface NotificationChannel {
  id: string;
  name: string;
  type: NotificationChannelType;
  enabled: boolean;
  config: {
    // Webhook
    webhookUrl?: string;
    httpMethod?: 'POST' | 'PUT' | 'GET';
    headers?: string; // JSON string
    bodyTemplate?: string; // JSON string
    // Email
    smtpServer?: string;
    port?: number;
    username?: string;
  };
  lastTestResult: 'success' | 'failed' | 'pending';
  lastTestedAt: string;
  deleted_at?: string;
}

export interface NotificationStrategy {
  id: string;
  name: string;
  enabled: boolean;
  triggerCondition: string;
  channelCount: number;
  priority: 'High' | 'Medium' | 'Low';
  creator: string;
  lastUpdated: string;
  deleted_at?: string;
}

export interface NotificationHistoryRecord {
  id: string;
  timestamp: string;
  strategy: string;
  channel: string;
  channelType: NotificationChannelType;
  recipient: string;
  status: 'success' | 'failed';
  content: string;
}

export interface LoginHistoryRecord {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  status: 'success' | 'failed';
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: 'en' | 'zh-TW';
  timezone: string;
  defaultPage: string;
}

export interface AuthSettings {
  provider: 'Keycloak' | 'Auth0' | 'Google' | 'Custom';
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  realm: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  idpAdminUrl: string;
}

export interface TagValue {
  id: string;
  value: string;
  description?: string;
  usageCount: number;
}

export interface TagDefinition {
  id: string;
  key: string;
  category: 'Infrastructure' | 'Application' | 'Business' | 'Security';
  description: string;
  allowedValues: TagValue[];
  required: boolean;
  usageCount: number;
  deleted_at?: string;
}

export interface TagManagementFilters {
  keyword?: string;
  category?: string;
}

export interface AuditLogFilters {
  keyword?: string;
  user?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardFilters {
  keyword?: string;
  category?: string;
}

export interface AutomationHistoryFilters {
  keyword?: string;
  playbookId?: string;
  status?: AutomationExecution['status'];
  startDate?: string;
  endDate?: string;
}

export interface PersonnelFilters {
  keyword?: string;
}

export interface ResourceGroupFilters {
  keyword?: string;
}

export interface AutomationTriggerFilters {
  keyword?: string;
}

export interface NotificationStrategyFilters {
  keyword?: string;
}

export interface NotificationChannelFilters {
  keyword?: string;
}

export interface NotificationHistoryFilters {
  keyword?: string;
  status?: NotificationHistoryRecord['status'];
  channelType?: NotificationChannelType;
  startDate?: string;
  endDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  status: 'unread' | 'read';
  createdAt: string; // ISO string
  linkUrl?: string;
}

export interface SpanLog {
  timestamp: number; // unix timestamp in ms
  fields: Record<string, any>;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentId?: string;
  operationName: string;
  serviceName: string;
  startTime: number; // unix timestamp in ms
  duration: number; // in ms
  status: 'ok' | 'error';
  tags: Record<string, any>;
  logs: SpanLog[];
}

export interface Trace {
  traceId: string;
  spans: Span[];
  root: {
    serviceName: string;
    operationName: string;
  };
  duration: number; // total duration in ms
  services: string[];
  errorCount: number;
  startTime: number; // unix timestamp in ms
}

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';
export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    service: string;
    message: string;
    details: Record<string, any>;
}

export interface LogAnalysis {
  summary: string;
  patterns: {
    description: string;
    count: number;
    level: LogLevel;
  }[];
  recommendations: string[];
}

export interface Bottleneck {
  span_name: string;
  service_name: string;
  duration_percent: number;
  description: string;
}

export interface TraceAnalysis {
  summary: string;
  bottlenecks: Bottleneck[];
  recommendations: string[];
}

export type TimeSeriesData = [string, number][];

export interface ServiceHealthData {
    heatmap_data: [number, number, number][];
    x_axis_labels: string[];
    y_axis_labels: string[];
}

export interface ResourceGroupStatusData {
    group_names: string[];
    series: {
        name: '健康' | '警告' | '嚴重';
        data: number[];
    }[];
}

export interface AnalysisOverviewData {
    health_score_data: { name: string; value: [Date, number] }[];
    event_correlation_data: {
        nodes: { id: string; name: string; value: number; symbolSize: number; category: number }[];
        links: { source: string; target: string }[];
        categories: { name: string }[];
    };
    recent_logs: LogEntry[];
}

export interface CapacityPlanningData {
    trends: {
        cpu: { historical: TimeSeriesData; forecast: TimeSeriesData };
        memory: { historical: TimeSeriesData; forecast: TimeSeriesData };
        storage: { historical: TimeSeriesData; forecast: TimeSeriesData };
    };
    forecast_model: {
        prediction: TimeSeriesData;
        confidence_band: [TimeSeriesData, TimeSeriesData];
    };
    suggestions: {
        title: string;
        impact: '高' | '中' | '低';
        effort: '高' | '中' | '低';
        details: string;
    }[];
    resource_analysis: {
        name: string;
        current: string;
        predicted: string;
        recommended: string;
        cost: string;
    }[];
    options: {
      timeRangeOptions: { label: string; value: string }[];
    };
}

export interface PageMetadata {
  columnConfigKey: string;
}
export type PageMetadataMap = Record<string, PageMetadata>;

export interface TabItemConfig {
  label: string;
  path: string;
  icon?: string;
}
export type TabConfigMap = Record<string, TabItemConfig[]>;

export interface PlatformSettings {
  helpUrl: string;
}

export interface PreferenceOptions {
  defaults: UserPreferences;
  timezones: string[];
  languages: { value: string; label: string }[];
  themes: { value: string; label: string }[];
}

// --- API Option Types (v2.17 Refactor) ---

export interface StyleDescriptor<T extends string = string> {
    value: T;
    label: string;
    className: string;
}
export interface ColorDescriptor<T extends string = string> {
    value: T;
    label: string;
    color: string;
}

export interface GrafanaOptions {
    timeOptions: { label: string, value: string }[];
    refreshOptions: { label: string, value: string }[];
    tvModeOptions: { label: string, value: string }[];
    themeOptions: { label: string, value: string }[];
}

export interface LogOptions {
    timeRangeOptions: { label: string, value: string }[];
}

export interface SilenceRuleOptions {
    keys: string[];
    values: Record<string, string[]>;
    defaultMatcher: SilenceMatcher;
    weekdays: { value: number, label: string }[];
    types: { value: SilenceRule['type'], label: string }[];
    statuses: { value: boolean, label: string }[];
    recurrenceTypes: { value: 'daily' | 'weekly' | 'monthly' | 'custom', label: string }[];
}

export interface InfraInsightsOptions {
    timeOptions: { label: string, value: string }[];
    riskLevels: ColorDescriptor[];
}

export interface IncidentOptions {
    statuses: StyleDescriptor<Incident['status']>[];
    severities: StyleDescriptor<Incident['severity']>[];
    priorities: StyleDescriptor<Incident['priority']>[];
    serviceImpacts: StyleDescriptor<Incident['serviceImpact']>[];
    quickSilenceDurations: { label: string, value: number }[];
}

export interface AlertRuleOptions {
    severities: { value: AlertRule['severity'], label: string, className: string }[];
    statuses: { value: boolean, label: string }[];
}

export interface AutomationExecutionOptions {
    statuses: StyleDescriptor<AutomationExecution['status']>[];
}

export interface AutomationPlaybookOptions {
    statuses: StyleDescriptor<AutomationPlaybook['lastRunStatus']>[];
}

export interface NotificationHistoryOptions {
    statuses: { value: NotificationHistoryRecord['status'], label: string }[];
    channelTypes: { value: NotificationChannelType, label: string }[];
}

export interface NotificationOptions {
    severities: StyleDescriptor<NotificationItem['severity']>[];
}

export interface ResourceOptions {
    statuses: StyleDescriptor<Resource['status']>[];
    statusColors: ColorDescriptor<Resource['status']>[];
    types: string[];
    providers: string[];
    regions: string[];
    owners: string[];
}

export interface Anomaly {
  severity: 'critical' | 'warning' | 'info';
  description: string;
  timestamp: string;
}

export interface Suggestion {
  title: string;
  impact: '高' | '中' | '低';
  effort: '高' | '中' | '低';
  details: string;
  action_button_text?: string;
  action_link?: string;
}

export interface AIInsightsOptions {
    severities: StyleDescriptor<Anomaly['severity']>[];
    impacts: StyleDescriptor<Suggestion['impact']>[];
    efforts: StyleDescriptor<Suggestion['effort']>[];
}

export interface PersonnelOptions {
    statuses: StyleDescriptor<User['status']>[];
}

export interface AuditLogOptions {
    actionTypes: string[];
}

export interface AutomationScriptOptions {
    playbookTypes: { value: AutomationPlaybook['type'], label: string }[];
    parameterTypes: { value: ParameterDefinition['type'], label: string }[];
}

export interface NotificationChannelOptions {
    channelTypes: { value: NotificationChannelType, label: string }[];
    httpMethods: ('POST' | 'PUT' | 'GET')[];
}

export interface NotificationStrategyOptions {
    priorities: ('High' | 'Medium' | 'Low')[];
    defaultCondition: string;
    conditionKeys: Record<string, string[]>;
    tagKeys: string[];
    tagValues: Record<string, string[]>;
    stepTitles: string[];
}

export interface AutomationTriggerOptions {
    triggerTypes: { value: TriggerType, label: string }[];
    conditionKeys: string[];
    defaultConfigs: Record<TriggerType, Partial<AutomationTrigger['config']>>;
}

export interface TopologyOptions {
    layouts: { value: string, label: string }[];
}

export interface DashboardOptions {
    categories: string[];
    owners: string[];
}

export interface TagManagementOptions {
    categories: string[];
}

export interface AllOptions {
    // Existing
    incidents: IncidentOptions;
    alertRules: AlertRuleOptions;
    silenceRules: SilenceRuleOptions;
    resources: ResourceOptions;
    automationScripts: AutomationScriptOptions;
    notificationChannels: NotificationChannelOptions;
    automationTriggers: AutomationTriggerOptions;
    personnel: PersonnelOptions;
    // New additions for v2.24
    dashboards: DashboardOptions;
    notificationStrategies: NotificationStrategyOptions;
    grafana: GrafanaOptions;
    auditLogs: AuditLogOptions;
    logs: LogOptions;
    infraInsights: InfraInsightsOptions;
    tagManagement: TagManagementOptions;
    topology: TopologyOptions;
    automationExecutions: AutomationExecutionOptions;
    notificationHistory: NotificationHistoryOptions;
}
