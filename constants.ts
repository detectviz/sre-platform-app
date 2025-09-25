

import React from 'react';
import { NavItem, Dashboard, DashboardType, Incident, LayoutWidget, Resource, ResourceGroup, AutomationPlaybook, AutomationExecution, AutomationTrigger, MailSettings, User, Team, Role, RolePermission, AuditLog, AlertRule, SilenceRule, AlertRuleTemplate, SilenceRuleTemplate, NotificationChannel, NotificationStrategy, NotificationHistoryRecord, LoginHistoryRecord, TagDefinition, AuthSettings, NotificationItem, Trace, Span, DashboardTemplate } from './types';

export const NAV_ITEMS: NavItem[] = [
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
       {
        key: 'settings/identity-access-management',
        label: '身份與存取',
        icon: 'users',
      },
      {
        key: 'settings/notification-management',
        label: '通知管理',
        icon: 'bell',
      },
      {
        key: 'settings/platform-settings',
        label: '平台設定',
        icon: 'sliders-horizontal',
      },
    ],
  },
];

export const MOCK_DASHBOARDS: Dashboard[] = [
  {
    id: 'sre-war-room',
    name: 'SRE 戰情室',
    type: DashboardType.BuiltIn,
    category: '業務與 SLA',
    description: '跨團隊即時戰情看板，聚焦重大事件與 SLA 指標。',
    owner: '事件指揮中心',
    updatedAt: '2025/09/18 17:15',
    path: '/sre-war-room',
  },
  {
    id: 'infrastructure-insights',
    name: '基礎設施洞察',
    type: DashboardType.BuiltIn,
    category: '基礎設施',
    description: '整合多雲與多中心資源健康狀態。',
    owner: 'SRE 平台團隊',
    updatedAt: '2025/09/18 16:30',
    path: '/dashboard/infrastructure-insights',
  },
  {
    id: 'api-service-status',
    name: 'API 服務狀態',
    type: DashboardType.Grafana,
    category: '業務與 SLA',
    description: 'API 響應時間、錯誤率、吞吐量等服務指標。',
    owner: 'SRE 平台團隊',
    updatedAt: '2025/09/18 16:45',
    path: '/dashboard/api-service-status',
    grafanaUrl: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    grafana_dashboard_uid: 'aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    grafana_folder_uid: 'biz-folder',
  },
  {
    id: 'user-experience-monitoring',
    name: '用戶體驗監控',
    type: DashboardType.Grafana,
    category: '營運與容量',
    description: '頁面載入時間、用戶行為分析、錯誤追蹤。',
    owner: '前端團隊',
    updatedAt: '2025/09/18 17:00',
    path: '/dashboard/user-experience-monitoring',
    grafanaUrl: 'http://localhost:3000/d/another-dashboard-id-for-ux',
    grafana_dashboard_uid: 'another-dashboard-id-for-ux',
    grafana_folder_uid: 'ux-folder',
  },
];

export const MOCK_AVAILABLE_GRAFANA_DASHBOARDS: {
    uid: string;
    title: string;
    url: string;
    folderTitle: string;
    folderUid: string;
}[] = [
  {
    uid: 'g-dash-prod-overview',
    title: 'Production Overview',
    url: 'http://localhost:3000/d/g-dash-prod-overview/production-overview',
    folderTitle: 'Production',
    folderUid: 'prod-folder'
  },
  {
    uid: 'g-dash-staging-api',
    title: 'Staging API Metrics',
    url: 'http://localhost:3000/d/g-dash-staging-api/staging-api-metrics',
    folderTitle: 'Staging',
    folderUid: 'staging-folder'
  },
  {
    uid: 'g-dash-db-perf',
    title: 'Database Performance',
    url: 'http://localhost:3000/d/g-dash-db-perf/database-performance',
    folderTitle: 'Infrastructure',
    folderUid: 'infra-folder'
  },
  {
    uid: 'g-dash-billing',
    title: 'Billing Service Dashboard',
    url: 'http://localhost:3000/d/g-dash-billing/billing-service-dashboard',
    folderTitle: 'Business & SLA',
    folderUid: 'biz-folder'
  }
];

export const MOCK_DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'tpl-api-health',
    name: 'API 服務健康度',
    description: '監控 API 服務的關鍵指標，包括延遲、錯誤率和請求吞吐量。',
    icon: 'activity',
    category: '應用程式'
  },
  {
    id: 'tpl-k8s-overview',
    name: 'Kubernetes 叢集總覽',
    description: '提供 Kubernetes 叢集的高層級視圖，包括節點狀態、Pod 健康度和資源利用率。',
    icon: 'box',
    category: '基礎設施'
  },
  {
    id: 'tpl-db-performance',
    name: '資料庫效能',
    description: '追蹤基本的資料庫指標，如查詢延遲、連線數和複製延遲。',
    icon: 'database',
    category: '基礎設施'
  },
  {
    id: 'tpl-biz-kpi',
    name: '業務 KPI 儀表板',
    description: '專注於關鍵業務指標，如用戶註冊數、收入和轉換率。',
    icon: 'trending-up',
    category: '業務與 SLA'
  }
];

export const MOCK_INCIDENTS: Incident[] = [
    { 
      id: 'INC-001', 
      summary: 'API 延遲超過閾值', 
      resource: 'api-server-01', 
      serviceImpact: 'High', 
      rule: 'API 延遲規則', 
      status: 'new', 
      severity: 'warning', 
      priority: 'P1',
      assignee: '張三', 
      triggeredAt: '2024-01-15 10:30:00',
      history: [
        { timestamp: '2024-01-15 10:30:00', user: 'System', action: 'Incident created from rule "API 延遲規則".' },
        { timestamp: '2024-01-15 10:30:01', user: 'AI Agent', action: 'Automatic analysis completed.' },
        { timestamp: '2024-01-15 10:31:00', user: 'System', action: 'Notification sent to SRE on-call channel.' },
      ],
      aiAnalysis: {
        summary: 'API 服務延遲可能由最近的部署或下游依賴問題引起。',
        root_causes: [
            "最近部署的 `api-service` v2.5.1 版本可能存在性能迴歸。 ",
            "下游 `payment-service` 響應緩慢，導致請求堆積。",
            "資源 `api-server-01` 的 CPU 使用率處於高位，可能資源不足。"
        ],
        recommendations: [
            {
                description: "檢查 `api-server-01` 的 CPU 和內存指標。",
                action_text: "查看資源指標",
                action_link: "/resources/res-001",
            },
            {
                description: "考慮回滾 `api-service` 至上一穩定版本。",
                action_text: "執行回滾腳本",
                playbook_id: "play-003",
            },
        ]
      }
    },
    { 
      id: 'INC-002', 
      summary: '資料庫連接超時', 
      resource: 'db-primary', 
      serviceImpact: 'High', 
      rule: '資料庫連接規則', 
      status: 'acknowledged', 
      severity: 'critical', 
      priority: 'P0',
      assignee: '李四', 
      triggeredAt: '2024-01-15 10:15:00',
      history: [
        { timestamp: '2024-01-15 10:15:00', user: 'System', action: 'Incident created from rule "資料庫連接規則".' },
        { timestamp: '2024-01-15 10:16:00', user: 'System', action: 'Notification sent to DBA on-call channel.' },
        { timestamp: '2024-01-15 10:18:00', user: '李四', action: 'Acknowledged the incident.' },
        { timestamp: '2024-01-15 10:20:00', user: '李四', action: 'Added note: "Starting investigation. Primary DB is not responding to pings."' },
      ]
    },
    { 
      id: 'INC-003', 
      summary: 'CPU 使用率異常', 
      resource: 'web-prod-12', 
      serviceImpact: 'Medium', 
      rule: 'CPU 使用率規則', 
      status: 'resolved', 
      severity: 'warning', 
      priority: 'P2',
      assignee: '王五', 
      triggeredAt: '2024-01-15 09:45:00',
      history: [
        { timestamp: '2024-01-15 09:45:00', user: 'System', action: 'Incident created from rule "CPU 使用率規則".' },
        { timestamp: '2024-01-15 09:47:00', user: 'Automation', action: 'Executed playbook "Restart Failing Pod".' },
        { timestamp: '2024-01-15 09:50:00', user: '王五', action: 'Acknowledged the incident.' },
        { timestamp: '2024-01-15 10:05:00', user: '王五', action: 'Resolved incident.', details: 'Root cause was a memory leak in the latest deployment. The pod restart resolved the immediate issue. A hotfix is being prepared.' },
      ]
    },
];

export const MOCK_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-001',
    name: 'CPU 使用率過高',
    description: '當任何伺服器的 CPU 使用率連續 5 分鐘超過 90% 時觸發。',
    enabled: true,
    target: '所有伺服器',
    conditionsSummary: 'CPU > 90% for 5m',
    severity: 'critical',
    automationEnabled: true,
    creator: 'Admin User',
    lastUpdated: '2025-09-22 10:00:00',
    automation: { enabled: true, scriptId: 'play-002' }
  },
  {
    id: 'rule-002',
    name: 'API 延遲規則',
    description: 'API Gateway 的 p95 延遲超過 500ms。',
    enabled: true,
    target: 'api-gateway-prod',
    conditionsSummary: 'Latency > 500ms',
    severity: 'warning',
    automationEnabled: false,
    creator: 'Emily White',
    lastUpdated: '2025-09-21 15:30:00',
  },
  {
    id: 'rule-003',
    name: '資料庫連接規則',
    description: '資料庫連接池使用率超過 85%。',
    enabled: false,
    target: 'rds-prod-main',
    conditionsSummary: 'Connections > 85%',
    severity: 'warning',
    automationEnabled: false,
    creator: 'Admin User',
    lastUpdated: '2025-09-20 09:00:00',
  },
  {
    id: 'rule-004',
    name: '磁碟空間不足',
    description: '當任何伺服器的磁碟使用率超過 95% 時觸發。',
    enabled: true,
    target: '所有伺服器',
    conditionsSummary: 'Disk Usage > 95%',
    severity: 'critical',
    automationEnabled: true,
    creator: 'Admin User',
    lastUpdated: '2025-09-22 11:00:00',
    automation: { enabled: true, scriptId: 'play-005' }
  }
];

export const MOCK_SILENCE_RULES: SilenceRule[] = [
  {
    id: 'sil-001',
    name: '週末維護窗口',
    description: '週末例行維護期間静音所有 staging 環境的告警。',
    enabled: true,
    type: 'repeat',
    matchers: [{ key: 'env', operator: '=', value: 'staging' }],
    schedule: { type: 'recurring', cron: '0 22 * * 5', timezone: 'Asia/Taipei' }, // Every Friday 22:00
    creator: 'Admin User',
    createdAt: '2025-09-20 18:00:00',
  },
  {
    id: 'sil-002',
    name: 'API 服務部署靜音',
    description: '在 API 服務 v2.1.5 部署期間靜音相關告警。',
    enabled: false,
    type: 'single',
    matchers: [{ key: 'service', operator: '=', value: 'api-service' }],
    schedule: { type: 'single', startsAt: '2025-09-23 02:00:00', endsAt: '2025-09-23 03:00:00' },
    creator: 'Emily White',
    createdAt: '2025-09-22 16:00:00',
  }
];

export const MOCK_RESOURCES: Resource[] = [
    { id: 'res-001', name: 'api-gateway-prod-01', status: 'healthy', type: 'API Gateway', provider: 'AWS', region: 'us-east-1', owner: 'SRE Team', lastCheckIn: '30s ago' },
    { id: 'res-002', name: 'rds-prod-main', status: 'critical', type: 'RDS Database', provider: 'AWS', region: 'us-east-1', owner: 'DBA Team', lastCheckIn: '2m ago' },
    { id: 'res-003', name: 'k8s-prod-cluster', status: 'healthy', type: 'EKS Cluster', provider: 'AWS', region: 'us-west-2', owner: 'SRE Team', lastCheckIn: '1m ago' },
    { id: 'res-004', name: 'web-prod-12', status: 'warning', type: 'EC2 Instance', provider: 'AWS', region: 'us-east-1', owner: 'Web Team', lastCheckIn: '5m ago' },
    { id: 'res-005', name: 'elasticache-prod-03', status: 'healthy', type: 'ElastiCache', provider: 'AWS', region: 'us-east-1', owner: 'SRE Team', lastCheckIn: '45s ago' },
    { id: 'res-006', name: 'gke-staging-cluster', status: 'offline', type: 'GKE Cluster', provider: 'GCP', region: 'us-central1', owner: 'DevOps', lastCheckIn: '1h ago' },
    { id: 'res-007', name: 'vm-ci-runner-01', status: 'healthy', type: 'Compute Engine', provider: 'GCP', region: 'europe-west1', owner: 'DevOps', lastCheckIn: '2m ago' },
];

export const MOCK_RESOURCE_GROUPS: ResourceGroup[] = [
  { id: 'rg-001', name: 'Production Web Servers', description: 'All production-facing web servers', ownerTeam: 'Web Team', memberIds: ['res-004'], statusSummary: { healthy: 12, warning: 1, critical: 0 } },
  { id: 'rg-002', name: 'Core Databases', description: 'Primary and replica databases for core services', ownerTeam: 'DBA Team', memberIds: ['res-002'], statusSummary: { healthy: 8, warning: 0, critical: 1 } },
  { id: 'rg-003', name: 'Staging Environment', description: 'Resources for the staging environment', ownerTeam: 'DevOps', memberIds: ['res-006'], statusSummary: { healthy: 15, warning: 1, critical: 2 } },
  { id: 'rg-004', name: 'AWS US-East-1 Resources', description: 'All resources deployed in the US-East-1 region', ownerTeam: 'SRE Team', memberIds: ['res-001', 'res-002', 'res-004', 'res-005'], statusSummary: { healthy: 9, warning: 4, critical: 0 } },
];

export const MOCK_PLAYBOOKS: AutomationPlaybook[] = [
    { 
        id: 'play-001', 
        name: '重啟故障 Pod', 
        description: '自動重啟處於 CrashLoopBackOff 狀態的 Pod。', 
        trigger: 'K8s 告警', 
        lastRun: '5分鐘前', 
        lastRunStatus: 'success', 
        runCount: 12,
        type: 'shell',
        content: `#!/bin/bash
# Restart a failing pod
NAMESPACE="$1"
POD_PATTERN="$2"

POD_NAME=$(kubectl get pods -n "$NAMESPACE" | grep "$POD_PATTERN" | grep CrashLoopBackOff | awk '{print $1}')

if [ -n "$POD_NAME" ]; then
  echo "Restarting pod: $POD_NAME in namespace: $NAMESPACE"
  kubectl delete pod -n "$NAMESPACE" "$POD_NAME"
else
  echo "No failing pods found matching pattern."
fi`,
        parameters: [
            { name: 'namespace', label: '命名空間', type: 'string', required: true, placeholder: 'e.g., default' },
            { name: 'pod_name_pattern', label: 'Pod 名稱模式', type: 'string', required: true, placeholder: 'e.g., api-service-*' }
        ]
    },
    { 
        id: 'play-002', 
        name: '擴展 Web 層', 
        description: '向 Web 伺服器自動擴展組增加更多 EC2 實例。', 
        trigger: '高 CPU', 
        lastRun: '1小時前', 
        lastRunStatus: 'success', 
        runCount: 3,
        type: 'python',
        content: `import boto3

def scale_up(asg_name, instance_count):
    client = boto3.client('autoscaling')
    response = client.describe_auto_scaling_groups(AutoScalingGroupNames=[asg_name])
    
    if not response['AutoScalingGroups']:
        print(f"Error: Auto Scaling Group '{asg_name}' not found.")
        return

    asg = response['AutoScalingGroups'][0]
    current_capacity = asg['DesiredCapacity']
    new_capacity = current_capacity + instance_count
    
    print(f"Scaling up {asg_name} from {current_capacity} to {new_capacity} instances.")
    client.set_desired_capacity(
        AutoScalingGroupName=asg_name,
        DesiredCapacity=new_capacity,
        HonorCooldown=False
    )

# Parameters are passed as environment variables or arguments
# scale_up(os.environ['ASG_NAME'], int(os.environ['INSTANCE_COUNT']))`,
        parameters: [
            { name: 'instance_count', label: '實例數量', type: 'number', required: true, defaultValue: 2, placeholder: '要增加的實例數量' },
            { name: 'tier', label: '目標層級', type: 'enum', required: true, defaultValue: 'web', options: [{value: 'web', label: 'Web 層'}, {value: 'api', label: 'API 層'}] }
        ]
    },
    { 
        id: 'play-003', 
        name: '資料庫故障轉移', 
        description: '在主資料庫故障時將讀取副本提升為主庫。', 
        trigger: '手動', 
        lastRun: '2天前', 
        lastRunStatus: 'success', 
        runCount: 1,
        type: 'shell',
        content: `#!/bin/bash
# Promote RDS Replica
REPLICA_ID="db-replica-01"
echo "Promoting replica \${REPLICA_ID} to primary..."
# aws rds promote-read-replica --db-instance-identifier $REPLICA_ID
sleep 5
echo "Promotion complete."`,
    },
    { 
        id: 'play-004', 
        name: '清除快取', 
        description: '為特定服務刷新 Redis 快取。', 
        trigger: '手動', 
        lastRun: '15分鐘前', 
        lastRunStatus: 'running', 
        runCount: 5,
        type: 'python',
        content: `import redis

def clear_cache(service_name):
    r = redis.Redis(host='redis.internal', port=6379, db=0)
    pattern = f"{service_name}:*"
    print(f"Clearing cache for pattern: {pattern}")
    keys_to_delete = r.keys(pattern)
    if keys_to_delete:
        r.delete(*keys_to_delete)
        print(f"Deleted {len(keys_to_delete)} keys.")
    else:
        print("No keys found to delete.")`,
        parameters: [
            { name: 'service_name', label: '服務名稱', type: 'enum', required: true, defaultValue: 'api-service', options: [{value: 'api-service', label: 'API 服務'}, {value: 'auth-service', label: '認證服務'}, {value: 'payment-service', label: '支付服務'}] }
        ]
    },
    { 
        id: 'play-005', 
        name: '歸檔舊日誌', 
        description: '將超過 30 天的日誌從熱儲存移至冷儲存。', 
        trigger: '排程 (每日)', 
        lastRun: '22小時前', 
        lastRunStatus: 'failed', 
        runCount: 30,
        type: 'shell',
        content: `#!/bin/bash
DAYS_TO_KEEP=$1
TARGET_BUCKET=$2

echo "Archiving logs older than \${DAYS_TO_KEEP} days to \${TARGET_BUCKET}"
# find /var/log/app -type f -mtime +\${DAYS_TO_KEEP} -exec aws s3 mv {} \${TARGET_BUCKET}/ \\;
echo "Archival process finished."`,
        parameters: [
            { name: 'days_to_keep', label: '保留天數', type: 'number', required: true, defaultValue: 30 },
            { name: 'target_storage', label: '目標儲存', type: 'string', required: true, defaultValue: 's3://archive-bucket' }
        ]
    },
    { 
        id: 'play-006', 
        name: '部署前檢查', 
        description: '執行部署前的健康檢查和環境驗證。', 
        trigger: '手動', 
        lastRun: '從未', 
        lastRunStatus: 'success',
        runCount: 0,
        type: 'python',
        content: `def run_checks(target_env):
    print(f"Running pre-deployment checks for environment: {target_env}")
    # Check DB connectivity
    # Check service health endpoints
    # Check disk space
    print("All checks passed.")
    return True`,
        parameters: [
            { name: 'target_env', label: '目標環境', type: 'enum', required: true, defaultValue: 'staging', options: [{value: 'staging', label: 'Staging'}, {value: 'production', label: 'Production'}] },
            { name: 'force_deploy', label: '強制部署 (忽略警告)', type: 'boolean', required: false, defaultValue: false }
        ]
    },
];

export const MOCK_AUTOMATION_EXECUTIONS: AutomationExecution[] = [
  { 
    id: 'exec-001', 
    scriptId: 'play-001', 
    scriptName: '重啟故障 Pod', 
    status: 'success', 
    triggerSource: 'event', 
    triggeredBy: 'Event Rule: K8s 告警',
    startTime: '2025-09-23 14:05:10', 
    endTime: '2025-09-23 14:05:15',
    durationMs: 5000,
    parameters: { namespace: 'production', pod_name_pattern: 'api-service-*' },
    logs: { stdout: 'Successfully restarted pod api-service-xyz123.', stderr: '' }
  },
  { 
    id: 'exec-002', 
    scriptId: 'play-005', 
    scriptName: '歸檔舊日誌', 
    status: 'failed', 
    triggerSource: 'schedule', 
    triggeredBy: 'Daily Cleanup Schedule',
    startTime: '2025-09-23 03:00:00',
    endTime: '2025-09-23 03:01:20',
    durationMs: 80000,
    parameters: { days_to_keep: 30, target_storage: 's3://archive-bucket' },
    logs: { stdout: 'Starting archival process...', stderr: 'Error: S3 bucket access denied.' }
  },
  { 
    id: 'exec-003', 
    scriptId: 'play-004', 
    scriptName: '清除快取', 
    status: 'running', 
    triggerSource: 'manual', 
    triggeredBy: 'Admin User',
    startTime: '2025-09-23 15:00:00',
    parameters: { service_name: 'payment-service' },
    logs: { stdout: 'Connecting to Redis... Cache clear in progress for payment-service.', stderr: '' }
  },
   { 
    id: 'exec-004', 
    scriptId: 'play-002', 
    scriptName: '擴展 Web 層', 
    status: 'success', 
    triggerSource: 'event', 
    triggeredBy: 'Event Rule: 高 CPU',
    startTime: '2025-09-22 18:30:00',
    endTime: '2025-09-22 18:31:00',
    durationMs: 60000,
    parameters: { instance_count: 2, tier: 'web' },
    logs: { stdout: 'Successfully added 2 instances to the web auto-scaling group.', stderr: '' }
  },
  { 
    id: 'exec-005', 
    scriptId: 'play-006', 
    scriptName: '部署前檢查', 
    status: 'pending', 
    triggerSource: 'manual', 
    triggeredBy: 'Emily White',
    startTime: '2025-09-23 15:10:00',
    parameters: { target_env: 'production', force_deploy: false },
    logs: { stdout: 'Awaiting execution...', stderr: '' }
  },
];

export const MOCK_AUTOMATION_TRIGGERS: AutomationTrigger[] = [
  {
    id: 'trig-001',
    name: '每日日誌歸檔',
    description: '在每天凌晨 3 點運行「歸檔舊日誌」腳本。',
    type: 'Schedule',
    enabled: true,
    targetPlaybookId: 'play-005',
    config: { cron: '0 3 * * *' },
    lastTriggered: '18 小時前',
    creator: 'Admin User',
  },
  {
    id: 'trig-002',
    name: 'CI/CD 部署觸發器',
    description: '從 Jenkins 觸發部署前檢查的 Webhook。',
    type: 'Webhook',
    enabled: true,
    targetPlaybookId: 'play-006',
    config: { webhookUrl: 'https://sre.platform/api/v1/webhooks/hook-abcdef123456' },
    lastTriggered: '2 小時前',
    creator: 'Emily White',
  },
  {
    id: 'trig-003',
    name: '高 CPU 自動擴展',
    description: '當發生高 CPU 事件時觸發 Web 層擴展。',
    type: 'Event',
    enabled: false,
    targetPlaybookId: 'play-002',
    config: { eventConditions: 'severity = critical AND resource_type = EC2' },
    lastTriggered: '3 天前',
    creator: 'Admin User',
  },
];

export const MOCK_MAIL_SETTINGS: MailSettings = {
    smtpServer: 'smtp.sre.platform',
    port: 587,
    username: 'notify@sre.platform',
    senderName: 'SRE Platform',
    senderEmail: 'notify@sre.platform',
    encryption: 'tls',
};

export const MOCK_USERS: User[] = [
  { id: 'usr-001', name: 'Admin User', email: 'admin@sre.platform', role: 'Admin', team: 'SRE Platform', status: 'active', lastLogin: '2分鐘前' },
  { id: 'usr-002', name: 'Emily White', email: 'emily.w@example.com', role: 'SRE', team: 'Core Infrastructure', status: 'active', lastLogin: '1小時前' },
  { id: 'usr-003', name: 'John Doe', email: 'john.d@example.com', role: 'Developer', team: 'API Services', status: 'active', lastLogin: '5小時前' },
  { id: 'usr-004', name: 'Sarah Connor', email: 'sarah.c@example.com', role: 'Viewer', team: 'Marketing', status: 'inactive', lastLogin: '3天前' },
  { id: 'usr-005', name: 'pending.invite@example.com', email: 'pending.invite@example.com', role: 'Developer', team: 'API Services', status: 'invited', lastLogin: 'N/A' },
];

export const MOCK_TEAMS: Team[] = [
  { id: 'team-001', name: 'SRE Platform', description: 'Manages the SRE platform itself.', ownerId: 'usr-001', memberIds: ['usr-001'], createdAt: '2024-01-01 10:00:00' },
  { id: 'team-002', name: 'Core Infrastructure', description: 'Maintains core infrastructure services.', ownerId: 'usr-002', memberIds: ['usr-002'], createdAt: '2024-01-02 11:00:00' },
  { id: 'team-003', name: 'API Services', description: 'Develops and maintains all public APIs.', ownerId: 'usr-003', memberIds: ['usr-003', 'usr-005'], createdAt: '2024-01-03 12:00:00' },
];

export const AVAILABLE_PERMISSIONS: { module: string; description: string; actions: { key: RolePermission['actions'][0], label: string }[] }[] = [
    { module: 'Event Management', description: '事件、規則、靜音管理', actions: [{ key: 'read', label: '讀取' }, { key: 'create', label: '建立' }, { key: 'update', label: '更新' }, { key: 'delete', label: '刪除' }] },
    { module: 'Resource Management', description: '資源、群組、拓撲管理', actions: [{ key: 'read', label: '讀取' }, { key: 'create', label: '建立' }, { key: 'update', label: '更新' }, { key: 'delete', label: '刪除' }] },
    { module: 'Automation Center', description: '腳本、排程、歷史管理', actions: [{ key: 'read', label: '讀取' }, { key: 'create', label: '建立' }, { key: 'update', label: '更新' }, { key: 'delete', label: '刪除' }, { key: 'execute', label: '執行' }] },
    { module: 'User Management', description: '人員、團隊、角色管理', actions: [{ key: 'read', label: '讀取' }, { key: 'create', label: '建立' }, { key: 'update', label: '更新' }, { key: 'delete', label: '刪除' }] },
];

export const MOCK_ROLES: Role[] = [
    { id: 'role-001', name: 'Administrator', description: '擁有所有權限', userCount: 1, status: 'active', createdAt: '2024-01-01 09:00:00', permissions: AVAILABLE_PERMISSIONS.map(p => ({ module: p.module, actions: p.actions.map(a => a.key) })) },
    { id: 'role-002', name: 'SRE Engineer', description: '擁有事件、資源、自動化管理權限', userCount: 1, status: 'active', createdAt: '2024-01-01 09:00:00', permissions: [
        { module: 'Event Management', actions: ['read', 'create', 'update', 'delete'] },
        { module: 'Resource Management', actions: ['read', 'create', 'update', 'delete'] },
        { module: 'Automation Center', actions: ['read', 'create', 'update', 'delete', 'execute'] },
    ]},
    { id: 'role-003', name: 'Developer', description: '擁有資源讀取和自動化執行權限', userCount: 2, status: 'active', createdAt: '2024-01-01 09:00:00', permissions: [
        { module: 'Resource Management', actions: ['read'] },
        { module: 'Automation Center', actions: ['read', 'execute'] },
    ]},
    { id: 'role-004', name: 'Viewer', description: '僅能查看儀表板和事件列表', userCount: 1, status: 'inactive', createdAt: '2024-01-01 09:00:00', permissions: [
        { module: 'Event Management', actions: ['read'] },
    ]},
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log-001', timestamp: '2024-01-15 11:05:00', user: {id: 'usr-001', name: 'Admin User'}, action: 'LOGIN_SUCCESS', target: { type: 'System', name: 'Authentication' }, result: 'success', ip: '192.168.1.10', details: { client: 'WebApp', browser: 'Chrome 120' } },
    { id: 'log-002', timestamp: '2024-01-15 11:10:00', user: {id: 'usr-002', name: 'Emily White'}, action: 'UPDATE_EVENT_RULE', target: { type: 'EventRule', name: 'API 延遲規則' }, result: 'success', ip: '10.0.0.5', details: { from: { severity: 'info' }, to: { severity: 'warning' } } },
    { id: 'log-003', timestamp: '2024-01-15 11:12:00', user: {id: 'usr-003', name: 'John Doe'}, action: 'EXECUTE_PLAYBOOK', target: { type: 'Playbook', name: '清除快取' }, result: 'success', ip: '172.16.0.20', details: { params: { service_name: 'api-service' } } },
    { id: 'log-004', timestamp: '2024-01-15 11:15:00', user: {id: 'usr-001', name: 'Admin User'}, action: 'DELETE_USER', target: { type: 'User', name: 'test.user@example.com' }, result: 'failure', ip: '192.168.1.10', details: { error: 'User has active incidents assigned.' } },
];


export const MOCK_ALERT_RULE_TEMPLATES: AlertRuleTemplate[] = [
    { id: 'tpl-cpu', name: 'CPU 使用率過高', emoji: '🔥', data: { name: 'High CPU Utilization', severity: 'critical', conditionGroups: [{ logic: 'OR', severity: 'critical', conditions: [{ metric: 'cpu_usage_percent', operator: '>', threshold: 90, durationMinutes: 5 }] }], titleTemplate: '🚨 [CRITICAL] High CPU on {{resource.name}}', contentTemplate: 'CPU usage is at {{value}}%, exceeding the threshold of 90% for 5 minutes.', automation: { enabled: true, scriptId: 'play-002' } } },
    { id: 'tpl-mem', name: '記憶體使用率過高', emoji: '💧', data: { name: 'High Memory Utilization', severity: 'warning', conditionGroups: [{ logic: 'OR', severity: 'warning', conditions: [{ metric: 'memory_usage_percent', operator: '>', threshold: 85, durationMinutes: 10 }] }], titleTemplate: '⚠️ [WARNING] High Memory on {{resource.name}}', contentTemplate: 'Memory usage is at {{value}}%, exceeding the threshold of 85% for 10 minutes.' } },
    { id: 'tpl-disk', name: '磁碟空間不足', emoji: '💾', data: { name: 'Low Disk Space', severity: 'critical', conditionGroups: [{ logic: 'OR', severity: 'critical', conditions: [{ metric: 'disk_space_percent_free', operator: '<', threshold: 10, durationMinutes: 1 }] }], titleTemplate: '🚨 [CRITICAL] Low Disk Space on {{resource.name}}', contentTemplate: 'Free disk space is at {{value}}%, which is below the 10% threshold.', automation: { enabled: true, scriptId: 'play-005' } } },
    { id: 'tpl-latency', name: 'API 延遲', emoji: '⏳', data: { name: 'API Latency High', severity: 'warning', conditionGroups: [{ logic: 'OR', severity: 'warning', conditions: [{ metric: 'api_latency_p95_ms', operator: '>', threshold: 500, durationMinutes: 5 }] }], titleTemplate: '⚠️ [WARNING] High API Latency detected', contentTemplate: 'P95 API latency is {{value}}ms, exceeding the 500ms threshold for 5 minutes.' } },
];

export const MOCK_SILENCE_RULE_TEMPLATES: SilenceRuleTemplate[] = [
    { id: 'tpl-sil-weekend', name: '週末維護窗口', emoji: '🛠️', data: { name: 'Weekend Maintenance Window', type: 'repeat', matchers: [{ key: 'env', operator: '=', value: 'staging' }], schedule: { type: 'recurring', cron: '0 22 * * 5', timezone: 'Asia/Taipei' } } },
    { id: 'tpl-sil-nightly', name: '每日深夜維護', emoji: '🌙', data: { name: 'Daily Nightly Maintenance', type: 'repeat', matchers: [{ key: 'env', operator: '=', value: 'development' }], schedule: { type: 'recurring', cron: '0 2 * * *', timezone: 'Asia/Taipei' } } },
    { id: 'tpl-sil-deploy', name: 'API 部署靜音 (1hr)', emoji: '🚀', data: { name: 'API Deployment Silence (1hr)', type: 'single', matchers: [{ key: 'service', operator: '=', value: 'api-service' }], schedule: { type: 'single', startsAt: new Date().toISOString().slice(0, 16), endsAt: new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16) } } },
];

export const MOCK_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  { id: 'chan-001', name: 'Default Email', type: 'Email', enabled: true, config: { smtpServer: 'smtp.sre.platform', port: 587, username: 'notify@sre.platform' }, lastTestResult: 'success', lastTestedAt: '2025-09-23 10:00:00' },
  { id: 'chan-002', name: 'SRE Slack Alerts', type: 'Slack', enabled: true, config: { webhookUrl: 'https://hooks.slack.com/services/...' }, lastTestResult: 'success', lastTestedAt: '2025-09-23 10:05:00' },
  { id: 'chan-003', name: 'Critical Incidents Webhook', type: 'Webhook', enabled: false, config: { webhookUrl: 'https://api.thirdparty.com/notify' }, lastTestResult: 'failed', lastTestedAt: '2025-09-22 15:30:00' },
];

export const MOCK_NOTIFICATION_STRATEGIES: NotificationStrategy[] = [
  { id: 'strat-001', name: 'Critical Production Alerts', enabled: true, triggerCondition: 'severity = critical AND env = production', channelCount: 2, priority: 'High', creator: 'Admin User', lastUpdated: '2025-09-23 11:00:00' },
  { id: 'strat-002', name: 'Staging Environment Warnings', enabled: true, triggerCondition: 'severity = warning AND env = staging', channelCount: 1, priority: 'Medium', creator: 'Emily White', lastUpdated: '2025-09-22 18:00:00' },
  { id: 'strat-003', name: 'DBA Team Notifications', enabled: false, triggerCondition: 'resource_type = database', channelCount: 1, priority: 'Medium', creator: 'Admin User', lastUpdated: '2025-09-21 09:45:00' },
];

export const MOCK_NOTIFICATION_HISTORY: NotificationHistoryRecord[] = [
  { id: 'hist-001', timestamp: '2025-09-23 12:05:30', strategy: 'Critical Production Alerts', channel: 'SRE Slack Alerts', channelType: 'Slack', recipient: '#sre-alerts', status: 'success', content: 'INC-002: 資料庫連接超時' },
  { id: 'hist-002', timestamp: '2025-09-23 12:05:31', strategy: 'Critical Production Alerts', channel: 'Default Email', channelType: 'Email', recipient: 'sre-oncall@example.com', status: 'success', content: 'INC-002: 資料庫連接超時' },
  { id: 'hist-003', timestamp: '2025-09-23 11:50:10', strategy: 'Staging Environment Warnings', channel: 'SRE Slack Alerts', channelType: 'Slack', recipient: '#staging-alerts', status: 'failed', content: 'API 延遲超過閾值' },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '嚴重: API 服務延遲',
    description: 'payment-api 的 p99 延遲超過 2000ms。',
    severity: 'critical',
    status: 'unread',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    linkUrl: '/incidents/INC-001',
  },
  {
    id: 'notif-2',
    title: '警告: 資料庫 CPU 使用率',
    description: 'rds-prod-main 的 CPU 使用率已達 85%。',
    severity: 'warning',
    status: 'unread',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    linkUrl: '/resources/res-002',
  },
  {
    id: 'notif-3',
    title: '自動化執行成功',
    description: '腳本「清除快取」已成功執行。',
    severity: 'success',
    status: 'unread',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    linkUrl: '/automation/history/exec-004',
  },
    {
    id: 'notif-4',
    title: '資訊: 新版本部署完成',
    description: 'Web 前端 v1.2.5 已成功部署至生產環境。',
    severity: 'info',
    status: 'read',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
    {
    id: 'notif-5',
    title: '自動化執行失敗',
    description: '腳本「歸檔舊日誌」執行失敗。',
    severity: 'critical',
    status: 'read',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    linkUrl: '/automation/history/exec-002',
  },
];


export const MOCK_LOGIN_HISTORY: LoginHistoryRecord[] = [
    { id: 'lh-001', timestamp: '2025-09-23 14:00:00', ip: '192.168.1.10', device: 'Chrome on macOS', status: 'success' },
    { id: 'lh-002', timestamp: '2025-09-23 09:30:00', ip: '10.0.5.12', device: 'Firefox on Windows', status: 'success' },
    { id: 'lh-003', timestamp: '2025-09-22 18:45:00', ip: '203.0.113.55', device: 'Safari on iOS', status: 'failed' },
];

export const MOCK_AUTH_SETTINGS: AuthSettings = {
    provider: 'Keycloak',
    enabled: true,
    clientId: 'sre-platform-client',
    clientSecret: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
    realm: 'sre-platform',
    authUrl: 'https://keycloak.sre.local/auth/realms/sre-platform/protocol/openid-connect/auth',
    tokenUrl: 'https://keycloak.sre.local/auth/realms/sre-platform/protocol/openid-connect/token',
    userInfoUrl: 'https://keycloak.sre.local/auth/realms/sre-platform/protocol/openid-connect/userinfo',
};

export const LAYOUT_WIDGETS: LayoutWidget[] = [
    { id: 'incident_pending_count', name: '待處理事件', supportedPages: ["事件管理", "SRE 戰情室", "分析中心", "通知管理"], description: '顯示待處理的事件數量。' },
    { id: 'incident_in_progress', name: '處理中事件', supportedPages: ["事件管理"], description: '追蹤目前由工程師處理的事件。' },
    { id: 'incident_resolved_today', name: '今日已解決', supportedPages: ["事件管理", "SRE 戰情室", "儀表板管理"], description: '顯示今日已關閉的事件數量。' },
    { id: 'resource_total_count', name: '總資源數', supportedPages: ["資源管理", "SRE 戰情室", "分析中心", "儀表板管理"], description: '顯示納管的資源總數。' },
    { id: 'resource_health_rate', name: '健康率', supportedPages: ["資源管理", "SRE 戰情室"], description: '顯示健康資源的百分比。' },
    { id: 'resource_alerting', name: '告警中資源', supportedPages: ["資源管理", "儀表板管理"], description: '顯示處於告警或離線狀態的資源數量。' },
    { id: 'automation_runs_today', name: '今日自動化執行', supportedPages: ["自動化中心", "SRE 戰情室", "分析中心", "通知管理"], description: '顯示今日觸發的自動化任務數量。' },
    { id: 'automation_success_rate', name: '成功率', supportedPages: ["自動化中心"], description: '顯示自動化任務的成功比例。' },
    { id: 'automation_suppressed_alerts', name: '自動化抑制告警', supportedPages: ["自動化中心"], description: '顯示由自動化處理而抑制的告警。' },
    { id: 'user_total_count', name: '總人員數', supportedPages: ["身份與存取管理", "通知管理", "平台設定", "個人設定"], description: '顯示系統中的總用戶數。' },
    { id: 'user_online_count', name: '在線人員', supportedPages: ["身份與存取管理", "平台設定", "個人設定", "儀表板管理"], description: '顯示目前在線的用戶數。' },
    { id: 'user_team_count', name: '團隊數量', supportedPages: ["身份與存取管理", "平台設定"], description: '顯示系統中的團隊總數。' },
    { id: 'user_pending_invites', name: '待處理邀請', supportedPages: ["身份與存取管理", "個人設定"], description: '顯示待處理的用戶邀請。' },
];

export const DEFAULT_LAYOUTS: Record<string, string[]> = {
    "事件管理": ['incident_pending_count', 'incident_in_progress', 'incident_resolved_today'],
    "資源管理": ['resource_total_count', 'resource_health_rate', 'resource_alerting'],
    "自動化中心": ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts'],
    "儀表板管理": ['resource_total_count', 'user_online_count', 'incident_resolved_today', 'resource_alerting'],
    "分析中心": ['incident_pending_count', 'resource_total_count', 'automation_runs_today'],
    "身份與存取管理": ['user_total_count', 'user_online_count', 'user_team_count', 'user_pending_invites'],
    "通知管理": ['incident_pending_count', 'automation_runs_today', 'user_total_count'],
    "平台設定": ['user_total_count', 'user_online_count', 'user_team_count'],
    "個人設定": ['user_total_count', 'user_online_count', 'user_pending_invites'],
};

// FIX: Replaced JSX with React.createElement to be compatible with a .ts file.
export const KPI_DATA: Record<string, { value: string; description: React.ReactNode; icon: string; iconBgColor: string }> = {
    'incident_pending_count': { value: '5', description: React.createElement("span", { className: "text-red-400 font-semibold" }, "2 嚴重"), icon: 'shield-alert', iconBgColor: 'bg-red-500' },
    'incident_in_progress': { value: '3', description: React.createElement(React.Fragment, null, React.createElement("span", { className: "text-green-400" }, "↓15%"), " vs yesterday"), icon: 'clock', iconBgColor: 'bg-yellow-500' },
    'incident_resolved_today': { value: '12', description: React.createElement(React.Fragment, null, React.createElement("span", { className: "text-green-400" }, "↑8%"), " vs yesterday"), icon: 'check-circle', iconBgColor: 'bg-green-500' },
    'resource_total_count': { value: '374', description: "Across all systems", icon: 'database-zap', iconBgColor: 'bg-blue-500' },
    'resource_health_rate': { value: '98.2%', description: "326 healthy", icon: 'heart-pulse', iconBgColor: 'bg-green-500' },
    'resource_alerting': { value: '35', description: "Needs attention", icon: 'siren', iconBgColor: 'bg-orange-500' },
    'automation_runs_today': { value: '127', description: "92.5% success rate", icon: 'bot', iconBgColor: 'bg-sky-500' },
    'automation_success_rate': { value: '92.5%', description: "117 successful runs", icon: 'trending-up', iconBgColor: 'bg-green-500' },
    'automation_suppressed_alerts': { value: '42', description: "Handled automatically", icon: 'volume-x', iconBgColor: 'bg-indigo-500' },
    'user_total_count': { value: '156', description: "142 active", icon: 'users', iconBgColor: 'bg-purple-500' },
    'user_online_count': { value: '89', description: React.createElement(React.Fragment, null, React.createElement("span", { className: "text-green-400" }, "↑12.1%"), " from last hour"), icon: 'wifi', iconBgColor: 'bg-teal-500' },
    'user_team_count': { value: '12', description: "0% change", icon: 'user-cog', iconBgColor: 'bg-slate-500' },
    'user_pending_invites': { value: '5', description: React.createElement(React.Fragment, null, React.createElement("span", { className: "text-green-400" }, "↑25%"), " vs last week"), icon: 'user-plus', iconBgColor: 'bg-yellow-500' },
};

export const TAG_CATEGORIES: TagDefinition['category'][] = ['Infrastructure', 'Application', 'Business', 'Security'];

export const MOCK_TAG_DEFINITIONS: TagDefinition[] = [
  { 
    id: 'tag-001', 
    key: 'env', 
    category: 'Infrastructure', 
    description: 'Deployment environment', 
    allowedValues: [
      { id: 'val-001', value: 'production', usageCount: 150 },
      { id: 'val-002', value: 'staging', usageCount: 80 },
      { id: 'val-003', value: 'development', usageCount: 120 },
    ], 
    required: true, 
    usageCount: 350 
  },
  { 
    id: 'tag-002', 
    key: 'service', 
    category: 'Application', 
    description: 'Name of the microservice', 
    allowedValues: [
      { id: 'val-004', value: 'api-gateway', usageCount: 1 },
      { id: 'val-005', value: 'auth-service', usageCount: 5 },
      { id: 'val-006', value: 'payment-service', usageCount: 3 },
    ], 
    required: true, 
    usageCount: 9 
  },
  { 
    id: 'tag-003', 
    key: 'owner-team', 
    category: 'Business', 
    description: 'Team responsible for the resource', 
    allowedValues: [
      { id: 'val-007', value: 'SRE Team', usageCount: 4 },
      { id: 'val-008', value: 'DBA Team', usageCount: 1 },
      { id: 'val-009', value: 'Web Team', usageCount: 1 },
    ], 
    required: false, 
    usageCount: 6 
  },
    { 
    id: 'tag-004', 
    key: 'data-classification', 
    category: 'Security', 
    description: 'Data sensitivity level', 
    allowedValues: [
      { id: 'val-010', value: 'public', usageCount: 50 },
      { id: 'val-011', value: 'internal', usageCount: 200 },
      { id: 'val-012', value: 'confidential', usageCount: 100 },
    ], 
    required: true, 
    usageCount: 350 
  },
];

type LogLevel = 'info' | 'warning' | 'error' | 'debug';
interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    service: string;
    message: string;
    details: Record<string, any>;
}

export const MOCK_LOGS: LogEntry[] = Array.from({ length: 500 }).map((_, i) => {
    const levels: LogLevel[] = ['info', 'info', 'info', 'info', 'warning', 'warning', 'error', 'debug'];
    const services = ['api-gateway', 'payment-service', 'auth-service', 'frontend-web', 'database-replicator'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const timestamp = new Date(Date.now() - i * Math.random() * 60000).toISOString();
    let message = '';
    let details: Record<string, any> = { traceId: `trace-${(Math.random() + 1).toString(36).substring(7)}`, host: `prod-server-${Math.floor(Math.random() * 20)}` };

    switch (level) {
        case 'info':
            message = `User 'user-${i}' successfully logged in from IP 192.168.1.${i % 255}`;
            details.userId = `user-${i}`;
            details.path = '/api/login';
            details.status = 200;
            break;
        case 'warning':
            message = `DB connection pool nearing capacity. Current size: ${80 + Math.floor(Math.random() * 15)}/100`;
            details.poolSize = 80 + Math.floor(Math.random() * 15);
            details.maxSize = 100;
            break;
        case 'error':
            message = `Failed to process payment for order 'ord-${i}': Timeout connecting to payment provider`;
            details.orderId = `ord-${i}`;
            details.error_code = 'E_PAYMENT_TIMEOUT';
            details.status = 503;
            break;
        case 'debug':
            message = `Executing query: SELECT * FROM users WHERE id = ${i}`;
            details.query = `SELECT * FROM users WHERE id = ${i}`;
            break;
    }

    return { id: `log-${i}`, timestamp, level, service, message, details };
});

const now = Date.now();
const createSpansForTrace = (traceId: string, error: boolean = false): Span[] => {
    const startTime = now - Math.floor(Math.random() * 3600000); // within the last hour
    const spans: Span[] = [
        { traceId, spanId: `${traceId}-a`, serviceName: 'api-gateway', operationName: 'POST /api/orders', startTime, duration: 850, status: 'ok', tags: { 'http.method': 'POST', 'http.status_code': 201 }, logs: [] },
        { traceId, spanId: `${traceId}-b`, parentId: `${traceId}-a`, serviceName: 'order-service', operationName: 'createOrder', startTime: startTime + 20, duration: 600, status: 'ok', tags: { 'db.system': 'postgres' }, logs: [] },
        { traceId, spanId: `${traceId}-c`, parentId: `${traceId}-b`, serviceName: 'product-service', operationName: 'checkStock', startTime: startTime + 50, duration: 250, status: 'ok', tags: { 'items': 3 }, logs: [] },
        { traceId, spanId: `${traceId}-d`, parentId: `${traceId}-b`, serviceName: 'payment-service', operationName: 'processPayment', startTime: startTime + 320, duration: 250, status: error ? 'error' : 'ok', tags: { 'payment.provider': 'stripe' }, logs: error ? [{ timestamp: startTime + 450, fields: { event: 'error', message: 'Card declined' } }] : [] },
        { traceId, spanId: `${traceId}-e`, parentId: `${traceId}-a`, serviceName: 'auth-service', operationName: 'verifyToken', startTime: startTime + 10, duration: 50, status: 'ok', tags: {}, logs: [] },
        { traceId, spanId: `${traceId}-f`, parentId: `${traceId}-d`, serviceName: 'payment-db', operationName: 'SELECT accounts', startTime: startTime + 350, duration: 100, status: 'ok', tags: { 'db.statement': 'SELECT * FROM accounts WHERE ...' }, logs: [] }
    ];
    return spans;
};

const processTrace = (spans: Span[]): Trace => {
    const traceId = spans[0].traceId;
    const rootSpan = spans.find(s => !s.parentId);
    if (!rootSpan) throw new Error("No root span found");

    const minStartTime = Math.min(...spans.map(s => s.startTime));
    const maxEndTime = Math.max(...spans.map(s => s.startTime + s.duration));

    return {
        traceId,
        spans,
        root: {
            serviceName: rootSpan.serviceName,
            operationName: rootSpan.operationName,
        },
        duration: maxEndTime - minStartTime,
        services: [...new Set(spans.map(s => s.serviceName))],
        errorCount: spans.filter(s => s.status === 'error').length,
        startTime: minStartTime,
    };
};

export const MOCK_TRACES: Trace[] = [
    processTrace(createSpansForTrace('trace-1', true)),
    processTrace([
        { traceId: 'trace-2', spanId: 't2-a', serviceName: 'frontend-web', operationName: 'page load /', startTime: now - 50000, duration: 1200, status: 'ok', tags: {}, logs: [] },
        { traceId: 'trace-2', spanId: 't2-b', parentId: 't2-a', serviceName: 'api-gateway', operationName: 'GET /api/home', startTime: now - 49800, duration: 800, status: 'ok', tags: {}, logs: [] },
        { traceId: 'trace-2', spanId: 't2-c', parentId: 't2-b', serviceName: 'recommendation-service', operationName: 'getRecs', startTime: now - 49750, duration: 500, status: 'ok', tags: {}, logs: [] },
        { traceId: 'trace-2', spanId: 't2-d', parentId: 't2-b', serviceName: 'user-service', operationName: 'getUserProfile', startTime: now - 49780, duration: 300, status: 'ok', tags: {}, logs: [] }
    ]),
    processTrace(createSpansForTrace('trace-3')),
    processTrace([
        { traceId: 'trace-4', spanId: 't4-a', serviceName: 'batch-processor', operationName: 'process daily jobs', startTime: now - 900000, duration: 3500, status: 'error', tags: {}, logs: [{timestamp: now-897000, fields: {event: 'error', message: 'Job failed: timeout'}}]}
    ])
];