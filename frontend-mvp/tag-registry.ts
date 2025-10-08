import { TagDefinition, TagRegistryEntry, TagScope, TagKind } from './types';

// 預設可寫入標籤的角色清單
const DEFAULT_WRITABLE_ROLES = ['platform_admin', 'sre_lead'];
const COMPLIANCE_WRITABLE_ROLES = ['platform_admin', 'compliance_officer'];

export const TAG_SCOPE_OPTIONS: { value: TagScope; label: string; description: string }[] = [
  { value: 'resource', label: '資源 (resource)', description: '資源與基礎設施資產。' },
  { value: 'datasource', label: '資料來源 (datasource)', description: '監控資料來源與匯入介面。' },
  { value: 'discovery_job', label: '自動探勘 (discovery_job)', description: '自動發現任務與掃描作業。' },
  { value: 'exporter', label: '匯出器 (exporter)', description: '監控匯出器與代理服務。' },
  { value: 'dashboard', label: '儀表板 (dashboard)', description: '可視化儀表板與報表。' },
  { value: 'alert_rule', label: '告警規則 (alert_rule)', description: '告警規則與閾值設定。' },
  { value: 'incident', label: '事件 (incident)', description: '事件紀錄與處理流程。' },
  { value: 'notification_policy', label: '通知策略 (notification_policy)', description: '通知路由與告警升級策略。' },
  { value: 'automation', label: '自動化 (automation)', description: '自動化腳本、排程與執行歷史。' },
  { value: 'analysis', label: '分析 (analysis)', description: '日誌、追蹤與洞察分析。' },
  { value: 'tenant', label: '租戶 (tenant)', description: '多租戶與隔離相關設定。' },
  { value: 'team', label: '團隊 (team)', description: '組織與團隊管理。' },
  { value: 'user', label: '使用者 (user)', description: '使用者與權限管理。' },
];


const ALL_SCOPES = TAG_SCOPE_OPTIONS.map(option => option.value);

// ============================================================================
// 核心標籤定義（最小必要集）
// ============================================================================

const CORE_TAGS: TagRegistryEntry[] = [
  // 基礎分類標籤
  { key: 'env', description: '部署環境。', scopes: ALL_SCOPES, required: true, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },
  { key: 'service', description: '所屬服務名稱。', scopes: ALL_SCOPES, required: false, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },

  // 事件核心屬性（系統依賴這些標籤）
  { key: 'status', description: '事件狀態。', scopes: ['incident', 'notification_policy', 'automation'], required: true, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },
  { key: 'severity', description: '事件嚴重度。', scopes: ['incident', 'notification_policy', 'automation'], required: true, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },
  { key: 'impact', description: '事件影響層級。', scopes: ['incident', 'notification_policy', 'automation'], required: true, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },
];

// ============================================================================
// 擴展標籤（可選，根據需求使用）
// ============================================================================

const EXTENDED_TAGS: TagRegistryEntry[] = [
  // 資源標識
  { key: 'resource_type', description: '資源種類。', scopes: ['resource', 'incident'], required: false, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },
  { key: 'cluster', description: '叢集名稱。', scopes: ['resource', 'incident'], required: false, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },

  // 監控相關
  { key: 'datasource_type', description: '資料來源類型。', scopes: ['datasource', 'incident'], required: false, writable_roles: DEFAULT_WRITABLE_ROLES, kind: 'enum' },

  // 組織相關（自動從關聯實體填充，唯讀）
  { key: 'team', description: '所屬團隊名稱（自動填充，不可編輯）。', scopes: ['resource', 'incident', 'dashboard', 'alert_rule'], required: false, writable_roles: [], readonly: true, link_to_entity: 'team', kind: 'reference' },
  { key: 'owner', description: '負責人姓名（自動填充，不可編輯）。', scopes: ['resource', 'incident', 'dashboard', 'alert_rule'], required: false, writable_roles: [], readonly: true, link_to_entity: 'personnel', kind: 'reference' },
];

// ============================================================================
// 標籤註冊表組合
// ============================================================================

const registry: TagRegistryEntry[] = [
  ...CORE_TAGS,
  ...EXTENDED_TAGS,
];

// ============================================================================
// 輔助函數
// ============================================================================

const DEFAULT_KIND_FALLBACK: TagKind = 'text';

const createTagDefinition = (entry: TagRegistryEntry): TagDefinition => {
  // 為系統標籤設置預設的 allowed_values
  const defaultAllowedValues: Record<string, Array<{ id: string; value: string; usage_count: number }>> = {
    'env': [
      { id: 'env-production', value: 'production', usage_count: 0 },
      { id: 'env-staging', value: 'staging', usage_count: 0 },
      { id: 'env-development', value: 'development', usage_count: 0 },
    ],
    'service': [
      { id: 'service-api-gateway', value: 'api-gateway', usage_count: 0 },
      { id: 'service-user-service', value: 'user-service', usage_count: 0 },
      { id: 'service-order-service', value: 'order-service', usage_count: 0 },
      { id: 'service-payment-service', value: 'payment-service', usage_count: 0 },
      { id: 'service-notification-service', value: 'notification-service', usage_count: 0 },
    ],
    'status': [
      { id: 'status-new', value: 'new', usage_count: 0 },
      { id: 'status-acknowledged', value: 'acknowledged', usage_count: 0 },
      { id: 'status-resolved', value: 'resolved', usage_count: 0 },
      { id: 'status-silenced', value: 'silenced', usage_count: 0 },
    ],
    'severity': [
      { id: 'severity-critical', value: 'critical', usage_count: 0 },
      { id: 'severity-warning', value: 'warning', usage_count: 0 },
      { id: 'severity-info', value: 'info', usage_count: 0 },
    ],
    'impact': [
      { id: 'impact-high', value: 'high', usage_count: 0 },
      { id: 'impact-medium', value: 'medium', usage_count: 0 },
      { id: 'impact-low', value: 'low', usage_count: 0 },
    ],
    'cluster': [
      { id: 'cluster-prod-us-east', value: 'prod-us-east', usage_count: 0 },
      { id: 'cluster-prod-us-west', value: 'prod-us-west', usage_count: 0 },
      { id: 'cluster-staging', value: 'staging', usage_count: 0 },
      { id: 'cluster-dev', value: 'dev', usage_count: 0 },
    ],
    'resource_type': [
      { id: 'resource_type-vm', value: 'vm', usage_count: 0 },
      { id: 'resource_type-pod', value: 'pod', usage_count: 0 },
      { id: 'resource_type-service', value: 'service', usage_count: 0 },
      { id: 'resource_type-device', value: 'device', usage_count: 0 },
    ],
    'datasource_type': [
      { id: 'datasource_type-victoriametrics', value: 'victoriametrics', usage_count: 0 },
      { id: 'datasource_type-grafana', value: 'grafana', usage_count: 0 },
      { id: 'datasource_type-elasticsearch', value: 'elasticsearch', usage_count: 0 },
      { id: 'datasource_type-prometheus', value: 'prometheus', usage_count: 0 },
      { id: 'datasource_type-custom', value: 'custom', usage_count: 0 },
    ],
  };

  const resolvedKind: TagKind = entry.kind
    ? entry.kind
    : (defaultAllowedValues[entry.key] ? 'enum' : DEFAULT_KIND_FALLBACK);

  return {
    id: `tag-${entry.key}`,
    ...entry,
    allowed_values: defaultAllowedValues[entry.key] || [], // 使用預設值或空陣列
    usage_count: 0,
    kind: resolvedKind,
  };
};

export const createTagDefinitions = (): TagDefinition[] => registry.map(entry => createTagDefinition(entry));
export const getEnumValuesForTag = (key: string): string[] => {
  // 為系統標籤提供預設值
  const defaultValues: Record<string, string[]> = {
    'status': ['new', 'acknowledged', 'resolved', 'silenced'],
    'severity': ['critical', 'warning', 'info'],
    'impact': ['high', 'medium', 'low'],
    'env': ['production', 'staging', 'development'],
    'service': ['api-gateway', 'user-service', 'order-service', 'payment-service', 'notification-service'],
    'cluster': ['prod-us-east', 'prod-us-west', 'staging', 'dev'],
    'resource_type': ['vm', 'pod', 'service', 'device'],
    'datasource_type': ['victoriametrics', 'grafana', 'elasticsearch', 'prometheus', 'custom'],
  };
  return defaultValues[key] ?? [];
};
