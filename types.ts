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
  team_id?: string;
  owner_id?: string;
  tags?: Record<string, string>;
  created_at: string;
  updated_at: string;
  path: string;
  grafana_url?: string;
  grafana_dashboard_uid?: string;
  grafana_folder_uid?: string;
  layout?: DashboardLayoutItem[];
  deleted_at?: string;
  /** Identifiers of resources displayed on the dashboard. */
  resource_ids?: string[];
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

export interface NotificationRecord {
  /** Unique identifier for the notification attempt associated with an incident. */
  id: string;
  /** Identifier of the notification channel used to deliver the notification. */
  channel_id: string;
  /** Identifier of the notification strategy that generated the notification. */
  strategy_id?: string;
  /** Delivery status for the notification attempt. */
  status: 'success' | 'failed';
  /** ISO 8601 timestamp describing when the notification was sent. */
  sent_at: string;
  /** Optional metadata that provides additional delivery details. */
  metadata?: Record<string, any>;
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

export type RuleAnalysisSeverity = 'low' | 'medium' | 'high';

export interface RuleAnalysisEvaluatedRule {
  id: string;
  name: string;
  status: string;
  severity?: RuleAnalysisSeverity;
  type?: string;
}

export interface RuleAnalysisMetric {
  label: string;
  value: string;
  description?: string;
}

export interface RuleAnalysisInsight {
  title: string;
  detail: string;
  severity: RuleAnalysisSeverity;
}

export interface RuleAnalysisRecommendation {
  action: string;
  description: string;
  priority: RuleAnalysisSeverity;
}

export interface RuleAnalysisReport {
  report_type: 'alert' | 'silence';
  summary: string;
  evaluated_rules: RuleAnalysisEvaluatedRule[];
  metrics: RuleAnalysisMetric[];
  insights: RuleAnalysisInsight[];
  recommendations: RuleAnalysisRecommendation[];
}

export type IncidentStatus = 'New' | 'Acknowledged' | 'Resolved' | 'Silenced';
export type IncidentSeverity = 'Critical' | 'Warning' | 'Info';
export type IncidentImpact = 'High' | 'Medium' | 'Low';

export interface Incident {
  id: string;
  summary: string;
  resource: string;
  resource_id: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  impact: IncidentImpact;
  rule: string;
  rule_id: string;
  assignee?: string;
  team_id?: string;
  owner_id?: string;
  tags?: Record<string, string>;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  history: IncidentEvent[];
  ai_analysis?: IncidentAnalysis;
  /** Identifier of the user who silenced the incident. */
  silenced_by?: string;
  /** Records of notifications that have been sent for this incident. */
  notifications_sent?: NotificationRecord[];
  /** ISO 8601 timestamp for when the incident was acknowledged. */
  acknowledged_at?: string;
  /** ISO 8601 timestamp for when the incident was resolved. */
  resolved_at?: string;
  deleted_at?: string;
}

export interface IncidentCreateRequest {
  summary: string;
  resource_id: string;
  rule_id: string;
  severity: IncidentSeverity;
  impact: IncidentImpact;
  assignee?: string;
}

export interface LayoutWidget {
  id: string;
  name: string;
  description: string;
  supported_pages: string[];
}

export interface Resource {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  type: string;
  provider: string;
  region: string;
  owner: string;
  team_id?: string;
  owner_id?: string;
  tags?: Record<string, string>;
  last_check_in_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  discovered_by_job_id?: string;
  monitoring_agent?: string;
  /** Identifier for the datasource linked to the resource. */
  datasource_id?: string;
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
  owner_team: string;
  member_ids: string[];
  status_summary: {
    healthy: number;
    warning: number;
    critical: number;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ParameterDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  required: boolean;
  default_value?: string | number | boolean;
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
  last_run_at: string;
  last_run_status: 'success' | 'failed' | 'running';
  run_count: number;
  created_at: string;
  updated_at: string;
  parameters?: ParameterDefinition[];
  deleted_at?: string;
}

export interface AutomationExecution {
  id: string;
  script_id: string;
  script_name: string;
  /** Identifier of the incident that triggered the automation. */
  incident_id?: string;
  /** Identifier of the alert rule responsible for the automation trigger. */
  alert_rule_id?: string;
  target_resource_id?: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  trigger_source: 'manual' | 'event' | 'schedule' | 'webhook';
  triggered_by: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  resolved_incident?: boolean;
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
  target_playbook_id: string;
  config: {
    cron?: string;
    cron_description?: string;
    webhook_url?: string;
    event_conditions?: string;
  };
  last_triggered_at: string;
  creator: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MailSettings {
  smtp_server: string;
  port: number;
  username: string;
  sender_name: string;
  sender_email: string;
  encryption: 'none' | 'tls' | 'ssl';
  encryption_modes?: string[];
}

export interface GrafanaSettings {
  enabled: boolean;
  url: string;
  api_key: string;
  org_id: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'SRE' | 'Developer' | 'Viewer';
  team: string;
  status: 'active' | 'invited' | 'inactive';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  member_ids: string[];
  created_at: string;
  updated_at: string;
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
  user_count: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
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
  duration_minutes: number;
}

export interface ConditionGroup {
  logic: 'AND' | 'OR';
  conditions: RuleCondition[];
  severity: 'critical' | 'warning' | 'info';
}

export interface AutomationSetting {
  enabled: boolean;
  script_id?: string;
  parameters?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  target: string;
  conditions_summary: string;
  severity: 'critical' | 'warning' | 'info';
  automation_enabled: boolean;
  creator: string;
  team_id?: string;
  owner_id?: string;
  tags?: Record<string, string>;
  created_at: string;
  updated_at: string;
  labels?: string[];
  condition_groups?: ConditionGroup[];
  title_template?: string;
  content_template?: string;
  automation?: AutomationSetting;
  test_payload?: Record<string, unknown>;
  deleted_at?: string;
  /** Identifiers for the resources targeted by the alert rule. */
  target_resource_ids?: string[];
  target_scope?: 'specific' | 'group' | 'tag';
  /** Number of times the alert rule has triggered. */
  triggered_count?: number;
  /** Version number for the alert rule configuration. */
  version?: number;
}

export interface MetricMetadata {
  id: string;
  name: string;
  unit: string | null;
}

export interface SilenceMatcher {
  key: string;
  operator: '=' | '!=' | '~=';
  value: string;
}

export interface SilenceSchedule {
  type: 'single' | 'recurring';
  starts_at?: string;
  ends_at?: string;
  cron?: string;
  cron_description?: string; // 人類可讀的 cron 描述
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
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ResourceType {
  id: string;
  name: string;
  icon: string;
}

export interface AlertRuleTemplate {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  data: Partial<AlertRule>;
  preview: {
    conditions: string[];
    notification: string;
    automation?: string;
  };
}

export interface SilenceRuleTemplate {
  id: string;
  name: string;
  data: Partial<SilenceRule>;
}

export type NotificationChannelType = 'Email' | 'Webhook (通用)' | 'Slack' | 'LINE Notify' | 'SMS';

export interface NotificationChannel {
  id: string;
  name: string;
  type: NotificationChannelType;
  enabled: boolean;
  config: {
    to?: string;
    cc?: string;
    bcc?: string;
    webhook_url?: string;
    http_method?: 'POST' | 'PUT' | 'GET';
    mention?: string;
    access_token?: string;
    phone_number?: string;
  };
  last_test_result: 'success' | 'failed' | 'pending';
  last_tested_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface NotificationStrategy {
  id: string;
  name: string;
  enabled: boolean;
  trigger_condition: string;
  channel_count: number;
  severity_levels: IncidentSeverity[];
  impact_levels: IncidentImpact[];
  creator: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  /** Identifiers of notification channels linked to the strategy. */
  channel_ids?: string[];
}

export interface NotificationHistoryRecord {
  id: string;
  timestamp: string;
  strategy: string;
  channel: string;
  channel_type: NotificationChannelType;
  recipient: string;
  status: 'success' | 'failed';
  content: string;
  /** Identifier of the incident associated with the notification event. */
  incident_id?: string;
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
  default_page: string;
}

export interface AuthSettings {
  provider: 'Keycloak' | 'Auth0' | 'Google' | 'Custom';
  enabled: boolean;
  client_id: string;
  client_secret: string;
  realm: string;
  auth_url: string;
  token_url: string;
  user_info_url: string;
  idp_admin_url: string;
}

export type TagScope =
  | 'resource'
  | 'datasource'
  | 'discovery_job'
  | 'exporter'
  | 'dashboard'
  | 'alert_rule'
  | 'incident'
  | 'notification_policy'
  | 'automation'
  | 'analysis'
  | 'tenant'
  | 'team'
  | 'user';


export interface TagValue {
  id: string;
  value: string;
  description?: string;
  usage_count: number;
}

export interface TagRegistryEntry {
  key: string;
  description: string;
  scopes: TagScope[];
  required: boolean;
  writable_roles: string[];
  readonly?: boolean;
  link_to_entity?: string;
}

export interface TagDefinition extends TagRegistryEntry {
  id: string;
  allowed_values: TagValue[];
  usage_count: number;
  deleted_at?: string;
}

export interface TagManagementFilters {
  keyword?: string;
  scope?: TagScope;
}

export interface AuditLogFilters {
  keyword?: string;
  user?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}

export interface DashboardFilters {
  keyword?: string;
  category?: string;
}

export interface AutomationHistoryFilters {
  keyword?: string;
  playbook_id?: string;
  status?: AutomationExecution['status'];
  start_date?: string;
  end_date?: string;
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
  channel_type?: NotificationChannelType;
  start_date?: string;
  end_date?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  status: 'unread' | 'read';
  created_at: string;
  link_url?: string;
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

export type TimeSeriesData = [string, number][];

export interface MetricsData {
  cpu: TimeSeriesData;
  memory: TimeSeriesData;
}

export interface ServiceHealthData {
  heatmap_data: [number, number, number][];
  x_axis_labels: string[];
  y_axis_labels: string[];
}

export type ResourceGroupStatusKey = 'healthy' | 'warning' | 'critical';

export interface ResourceGroupStatusSeries {
  key: ResourceGroupStatusKey;
  label: string;
  data: number[];
}

export interface ResourceGroupStatusData {
  group_names: string[];
  series: ResourceGroupStatusSeries[];
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

export interface HealthScore {
  score: number;
  summary: string;
}

export interface AnalysisOverviewData {
  health_score: HealthScore;
  anomalies: Anomaly[];
  suggestions: Suggestion[];
  event_correlation_data: {
    nodes: { id: string; name: string; value: number; symbol_size: number; category: number }[];
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
  suggestions: CapacityPlanningSuggestion[];
  resource_analysis: CapacityPlanningResourceInsight[];
  options: {
    time_range_options: CapacityPlanningTimeRangeOption[];
  };
}

export type CapacityPlanningImpactLevel = '高' | '中' | '低';
export type CapacityPlanningRecommendationSeverity = 'critical' | 'warning' | 'info';
export type CapacityPlanningRecommendationAction = 'scale_up' | 'monitor' | 'optimize';

export interface CapacityPlanningSuggestion {
  id: string;
  title: string;
  impact: CapacityPlanningImpactLevel;
  effort: CapacityPlanningImpactLevel;
  details: string;
  detected_at: string;
  resource_id?: string;
}

export interface CapacityPlanningResourceInsight {
  id: string;
  resource_id: string;
  resource_name: string;
  current_utilization: number;
  forecast_utilization: number;
  recommendation: {
    label: string;
    action: CapacityPlanningRecommendationAction;
    severity: CapacityPlanningRecommendationSeverity;
  };
  cost_impact: {
    label: string;
    monthly_delta: number | null;
    currency: string | null;
  };
  lastEvaluated_at: string;
}

export interface CapacityPlanningTimeRangeOption {
  label: string;
  value: string;
  default?: boolean;
}

export interface PageMetadata {
  column_config_key: string;
}
export type PageMetadataMap = Record<string, PageMetadata>;

export interface TabItemConfig {
  label: string;
  path: string;
  icon?: string;
  disabled?: boolean;
}
export type TabConfigMap = Record<string, TabItemConfig[]>;

export interface PlatformSettings {
  help_url: string;
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
  class_name: string;
}
export interface ColorDescriptor<T extends string = string> {
  value: T;
  label: string;
  color: string;
}

export interface ChartTheme {
  palette: string[];
  text: {
    primary: string;
    secondary: string;
  };
  grid: {
    axis: string;
    split_line: string;
  };
  background: {
    card: string;
    accent: string;
  };
  health_gauge: {
    critical: string;
    warning: string;
    healthy: string;
  };
  event_correlation: string[];
  severity: {
    critical: string;
    warning: string;
    info: string;
  };
  log_levels: {
    error: string;
    warning: string;
    info: string;
    debug: string;
  };
  capacity_planning: {
    cpu: string;
    memory: string;
    storage: string;
    forecast: string;
    baseline: string;
  };
  resource_distribution: {
    primary: string;
    border: string;
    axis: string;
  };
  pie: {
    high: string;
    medium: string;
    low: string;
  };
  topology: {
    node_border: string;
    node_label: string;
    edge: string;
  };
  heatmap: {
    critical: string;
    warning: string;
    healthy: string;
  };
}

export interface GrafanaOptions {
  time_options: { label: string, value: string }[];
  refresh_options: { label: string, value: string }[];
  tv_mode_options: { label: string, value: string }[];
  theme_options: { label: string, value: string }[];
  // New additions for data centralization
  theme_label: string;
  tv_mode_label: string;
  refresh_label: string;
  time_label: string;
}

export interface LogOptions {
  time_range_options: { label: string, value: string }[];
}

export interface SilenceRuleOptions {
  keys: string[];
  values: Record<string, string[]>;
  default_matcher: SilenceMatcher;
  weekdays: { value: number, label: string }[];
  types: { value: SilenceRule['type'], label: string }[];
  statuses: { value: boolean, label: string }[];
  recurrence_types: { value: 'daily' | 'weekly' | 'monthly' | 'custom', label: string }[];
}

export interface InfraInsightsOptions {
  time_options: { label: string, value: string }[];
  risk_levels: ColorDescriptor[];
  refresh_options: { label: string, value: string }[];
  tv_mode_options: { label: string, value: string }[];
  theme_options: { label: string, value: string }[];
}

export interface IncidentOptions {
  statuses: StyleDescriptor<Incident['status']>[];
  severities: StyleDescriptor<Incident['severity']>[];
  impacts: StyleDescriptor<Incident['impact']>[];
  quick_silence_durations: { label: string, value: number }[];
}

export interface AlertRuleOptions {
  severities: { value: AlertRule['severity'], label: string, class_name: string }[];
  statuses: { value: boolean, label: string }[];
  operators: string[];
  scope_modes: { value: string; label: string; }[];
  variables: string[];
  step_titles: string[];
}

export interface AutomationExecutionOptions {
  statuses: StyleDescriptor<AutomationExecution['status']>[];
  trigger_sources: { value: AutomationExecution['trigger_source']; label: string }[];
}

export interface AutomationPlaybookOptions {
  statuses: StyleDescriptor<AutomationPlaybook['last_run_status']>[];
}

export interface NotificationHistoryOptions {
  statuses: { value: NotificationHistoryRecord['status'], label: string }[];
  channel_types: { value: NotificationChannelType, label: string }[];
}

export interface NotificationOptions {
  severities: StyleDescriptor<NotificationItem['severity']>[];
}

export interface ResourceOptions {
  statuses: StyleDescriptor<Resource['status']>[];
  status_colors: ColorDescriptor<Resource['status']>[];
  types: string[];
  providers: string[];
  regions: string[];
  owners: string[];
}

export interface PersonnelOptions {
  statuses: StyleDescriptor<User['status']>[];
}

export interface AuditLogOptions {
  action_types: string[];
}

export interface AutomationScriptOptions {
  playbook_types: { value: AutomationPlaybook['type'], label: string }[];
  parameter_types: { value: ParameterDefinition['type'], label: string }[];
}

export interface NotificationChannelOptions {
  channel_types: { value: NotificationChannelType, label: string }[];
  http_methods: ('POST' | 'PUT' | 'GET')[];
}

export interface NotificationStrategyOptions {
  severity_levels: IncidentSeverity[];
  impact_levels: IncidentImpact[];
  default_condition: string;
  condition_keys: Record<string, string[]>;
  tag_keys: string[];
  tag_values: Record<string, string[]>;
  step_titles: string[];
}

export interface AutomationTriggerOptions {
  trigger_types: { value: TriggerType, label: string }[];
  condition_keys: string[];
  severity_options: { value: AlertRule['severity'], label: string }[];
  default_configs: Record<TriggerType, Partial<AutomationTrigger['config']>>;
}

export interface TopologyOptions {
  layouts: { value: string, label: string }[];
}

export interface DashboardOptions {
  categories: string[];
  owners: string[];
}

export interface TagManagementOptions {
  scopes: { value: TagScope; label: string; description: string }[];
  writable_roles: string[];
  governance_notes?: string;
}

export interface LogExplorerFilters {
  keyword?: string;
  time_range?: string;
}

// --- Datasource & Discovery Types ---
export type DatasourceType = 'VictoriaMetrics' | 'Grafana' | 'Elasticsearch' | 'Prometheus' | 'Custom' | '自訂';
export type AuthMethod = 'Token' | 'Basic Auth' | 'Keycloak Integration' | 'Keycloak 整合' | 'None' | '無';
export type ConnectionStatus = 'ok' | 'error' | 'pending';

export interface DatasourceTestResponse {
  success: boolean;
  status: ConnectionStatus;
  latency_ms?: number;
  message: string;
}

export interface KeyValueTag {
  id: string;
  key: string;
  value: string;
}

// 新增 ResourceLink 接口定義
export interface ResourceLink {
  id: string;
  source_resource_id: string;      // 來源資源 ID
  target_resource_id: string;      // 目標資源 ID
  link_type: 'depends_on' | 'connects_to' | 'includes' | 'manages' | 'monitors';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// 新增 ConfigVersion 接口定義
export interface ConfigVersion<T = any> {
  id: string;
  entity_type: 'AlertRule' | 'AutomationPlaybook' | 'Dashboard' | 'NotificationStrategy' | 'SilenceRule' | 'Resource' | 'Team' | 'User';
  entity_id: string;
  version: number;
  config_snapshot: T;
  change_summary?: string;
  changed_by: string;  // User ID
  created_at: string;
}

export interface Datasource {
  id: string;
  name: string;
  type: DatasourceType;
  status: ConnectionStatus;
  created_at: string;
  url: string;
  auth_method: AuthMethod;
  tags: KeyValueTag[];
  deleted_at?: string;
}

export type DiscoveryJobKind = 'K8s' | 'SNMP' | 'Cloud Provider' | 'Static Range' | 'Custom Script';
export type DiscoveryJobStatus = 'success' | 'partial_failure' | 'failed' | 'running';

export type ExporterTemplateId = 'none' | 'node_exporter' | 'snmp_exporter' | 'modbus_exporter' | 'ipmi_exporter';

export interface DiscoveryJobExporterBinding {
  template_id: ExporterTemplateId;
  overrides_yaml?: string;
  mib_profile_id?: string;
}

export interface DiscoveryJobEdgeGateway {
  enabled: boolean;
  gateway_id?: string;
}

export interface DiscoveryJob {
  id: string;
  name: string;
  kind: DiscoveryJobKind;
  schedule: string;
  last_run_at: string;
  status: DiscoveryJobStatus;
  target_config: Record<string, any>;
  exporter_binding?: DiscoveryJobExporterBinding | null;
  edge_gateway?: DiscoveryJobEdgeGateway | null;
  tags: KeyValueTag[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DiscoveryTestResponse {
  success: boolean;
  discovered_count: number;
  message: string;
  warnings?: string[];
}

export interface DatasourceFilters {
  keyword?: string;
  type?: DatasourceType;
}

export interface DiscoveryJobFilters {
  keyword?: string;
  kind?: DiscoveryJobKind;
  status?: DiscoveryJobStatus;
}

export type DiscoveredResourceStatus = 'new' | 'imported' | 'ignored';

export interface DiscoveredResource {
  id: string;
  name: string;
  ip: string;
  type: string;
  tags: KeyValueTag[];
  status: DiscoveredResourceStatus;
  ignored_at?: string;
}

export interface ResourceOverviewData {
  distribution_by_type: { value: number; name: string }[];
  distribution_by_provider: { provider: string; count: number }[];
  recently_discovered: { id: string; name: string; type: string; discovered_at: string; job_id: string }[];
  groups_with_most_alerts: { id: string; name: string; criticals: number; warnings: number }[];
}
// --- AI Resource Analysis Types ---
export interface ResourceRisk {
  resource_id: string;
  resource_name: string;
  risk_level: 'High' | 'Medium' | 'Low';
  reason: string;
  recommendation: string;
}

export interface OptimizationSuggestion {
  resource_id: string;
  resource_name: string;
  suggestion: string;
  type: 'Cost' | 'Performance' | 'Security';
}

export interface ResourceAnalysis {
  summary: string;
  risk_analysis: ResourceRisk[];
  optimization_suggestions: OptimizationSuggestion[];
}
// ------------------------------------

export interface LicenseInfo {
  status: "valid" | "invalid";
  expires_at?: string;
}

export interface DatasourceOptions {
  types: DatasourceType[];
  auth_methods: AuthMethod[];
}

export interface ExporterTemplateOption {
  id: ExporterTemplateId;
  name: string;
  description?: string;
  supports_mib_profile?: boolean;
  supports_overrides?: boolean;
}

export interface MibProfileOption {
  id: string;
  name: string;
  description?: string;
  template_id: ExporterTemplateId;
}

export interface EdgeGatewayOption {
  id: string;
  name: string;
  location?: string;
  description?: string;
}

export interface AutoDiscoveryOptions {
  job_kinds: DiscoveryJobKind[];
  exporter_templates: ExporterTemplateOption[];
  mib_profiles: MibProfileOption[];
  edge_gateways: EdgeGatewayOption[];
}

export interface AllOptions {
  // Existing
  incidents: IncidentOptions;
  alert_rules: AlertRuleOptions;
  silence_rules: SilenceRuleOptions;
  resources: ResourceOptions;
  automation_scripts: AutomationScriptOptions;
  notification_channels: NotificationChannelOptions;
  automation_triggers: AutomationTriggerOptions;
  personnel: PersonnelOptions;
  // New additions for v2.24
  dashboards: DashboardOptions;
  notification_strategies: NotificationStrategyOptions;
  grafana: GrafanaOptions;
  audit_logs: AuditLogOptions;
  logs: LogOptions;
  infra_insights: InfraInsightsOptions;
  tag_management: TagManagementOptions;
  topology: TopologyOptions;
  automation_executions: AutomationExecutionOptions;
  notification_history: NotificationHistoryOptions;
  // New additions for data centralization
  datasources: DatasourceOptions;
  auto_discovery: AutoDiscoveryOptions;
}

// New additions for data centralization
export interface TableColumn {
  key: string;
  label: string;
}
