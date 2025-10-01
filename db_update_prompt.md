# db.ts 更新提示詞

## 任務目標
更新 `/Users/zoe/Downloads/sre-platform-app/mock-server/db.ts` 檔案中的所有初始化資料，使其匹配新的 snake_case 型別定義。

## 背景資訊
- types.ts 已經全面改為 snake_case（如 `resourceId` → `resource_id`, `createdAt` → `created_at`）
- handlers.ts 已經完成更新
- 現在需要更新 db.ts 中的模擬資料（mock data）

## 需要更新的欄位對照表

### 時間戳欄位
```typescript
createdAt → created_at
updatedAt → updated_at
deletedAt → deleted_at
occurredAt → occurred_at
lastLoginAt → last_login_at
lastRunAt → last_run_at
lastCheckInAt → last_check_in_at
lastTestedAt → last_tested_at
lastTriggeredAt → last_triggered_at
ignoredAt → ignored_at
```

### ID 欄位
```typescript
resourceId → resource_id
ruleId → rule_id
teamId → team_id
ownerId → owner_id
scriptId → script_id
incidentId → incident_id
playbookId → playbook_id
datasourceId → datasource_id
```

### 複合詞欄位
```typescript
// Incident
aiAnalysis → ai_analysis

// AlertRule
conditionsSummary → conditions_summary
automationEnabled → automation_enabled
targetResourceIds → target_resource_ids
conditionGroups → condition_groups
titleTemplate → title_template
contentTemplate → content_template
testPayload → test_payload

// Resource
lastCheckIn → last_check_in
discoveredByJobId → discovered_by_job_id
monitoringAgent → monitoring_agent

// AutomationExecution
scriptName → script_name
triggerSource → trigger_source
triggeredBy → triggered_by
startTime → start_time
endTime → end_time
durationMs → duration_ms

// AutomationPlaybook
lastRunAt → last_run_at
lastRunStatus → last_run_status
runCount → run_count

// AutomationTrigger
targetPlaybookId → target_playbook_id
lastTriggeredAt → last_triggered_at
cronDescription → cron_description
webhookUrl → webhook_url
eventConditions → event_conditions

// User
lastLoginAt → last_login_at

// Team
ownerId → owner_id
memberIds → member_ids

// Role
userCount → user_count

// NotificationChannel
webhookUrl → webhook_url
httpMethod → http_method
accessToken → access_token
phoneNumber → phone_number
lastTestResult → last_test_result
lastTestedAt → last_tested_at

// NotificationStrategy
triggerCondition → trigger_condition
channelCount → channel_count
severityLevels → severity_levels
impactLevels → impact_levels
channelIds → channel_ids

// NotificationHistoryRecord
channelType → channel_type
incidentId → incident_id

// DiscoveryJob
lastRunAt → last_run_at
targetConfig → target_config
exporterBinding → exporter_binding
edgeGateway → edge_gateway

// DiscoveryJobExporterBinding
templateId → template_id
overridesYaml → overrides_yaml
mibProfileId → mib_profile_id

// DiscoveryJobEdgeGateway
gatewayId → gateway_id

// DiscoveredResource
ignoredAt → ignored_at

// ResourceGroup
ownerTeam → owner_team
memberIds → member_ids
statusSummary → status_summary

// TagDefinition
writableRoles → writable_roles
allowedValues → allowed_values
usageCount → usage_count

// GrafanaSettings
apiKey → api_key
orgId → org_id

// MailSettings
smtpServer → smtp_server
senderName → sender_name
senderEmail → sender_email
encryptionModes → encryption_modes

// AuthSettings
clientId → client_id
clientSecret → client_secret
authUrl → auth_url
tokenUrl → token_url
userInfoUrl → user_info_url
idpAdminUrl → idp_admin_url

// UserPreferences
defaultPage → default_page

// Layout
widgetIds → widget_ids
updatedBy → updated_by

// ResourceOverview
distributionByType → distribution_by_type
distributionByProvider → distribution_by_provider
recentlyDiscovered → recently_discovered
discoveredAt → discovered_at
jobId → job_id
groupsWithMostAlerts → groups_with_most_alerts

// ResourceRisk & OptimizationSuggestion
resourceId → resource_id
resourceName → resource_name
riskLevel → risk_level
riskAnalysis → risk_analysis
optimizationSuggestions → optimization_suggestions

// LicenseInfo
expiresAt → expires_at

// Dashboard
grafanaUrl → grafana_url
resourceIds → resource_ids
```

## 執行步驟

### 第 1 步：讀取 db.ts 檔案
```bash
使用 Read 工具讀取完整的 db.ts 檔案
```

### 第 2 步：系統化替換
依照以下順序進行替換：

1. **時間戳欄位** - 全局替換所有時間戳欄位
2. **ID 欄位** - 替換所有 ID 相關欄位
3. **複合詞欄位** - 逐一替換各實體的複合詞欄位

### 第 3 步：特別注意事項

#### A. 物件字面量中的屬性
```typescript
// 修改前
const incident = {
  resourceId: 'res-1',
  ruleId: 'rule-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

// 修改後
const incident = {
  resource_id: 'res-1',
  rule_id: 'rule-1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
}
```

#### B. 巢狀物件
```typescript
// 修改前
const alertRule = {
  conditionGroups: [
    { conditions: [...] }
  ],
  automation: {
    scriptId: 'script-1'
  }
}

// 修改後
const alertRule = {
  condition_groups: [
    { conditions: [...] }
  ],
  automation: {
    script_id: 'script-1'
  }
}
```

#### C. 陣列中的物件
```typescript
// 修改前
incidents: [
  { resourceId: 'res-1', createdAt: '2024-01-01' },
  { resourceId: 'res-2', createdAt: '2024-01-02' }
]

// 修改後
incidents: [
  { resource_id: 'res-1', created_at: '2024-01-01' },
  { resource_id: 'res-2', created_at: '2024-01-02' }
]
```

### 第 4 步：不要修改的項目
- ❌ 變數名稱（如 `const resourceId = ...` 變數名可以保持）
- ❌ 註解和字串內容
- ❌ import 語句
- ❌ export 語句
- ❌ 函數名稱

### 第 5 步：驗證
完成後檢查：
1. 所有物件屬性都使用 snake_case
2. 沒有遺留的 camelCase 屬性
3. 巢狀物件和陣列中的物件都已更新
4. 時間戳欄位統一為 `created_at`, `updated_at`, `deleted_at` 等

## 預期的主要資料集

db.ts 包含以下主要資料集需要更新：

1. **DB.dashboards** - Dashboard 列表
2. **DB.incidents** - Incident 列表
3. **DB.alertRules** - AlertRule 列表
4. **DB.silenceRules** - SilenceRule 列表
5. **DB.resources** - Resource 列表
6. **DB.resourceGroups** - ResourceGroup 列表
7. **DB.resourceLinks** - ResourceLink 列表
8. **DB.playbooks** - AutomationPlaybook 列表
9. **DB.automationExecutions** - AutomationExecution 列表
10. **DB.automationTriggers** - AutomationTrigger 列表
11. **DB.users** - User 列表
12. **DB.teams** - Team 列表
13. **DB.roles** - Role 列表
14. **DB.notificationChannels** - NotificationChannel 列表
15. **DB.notificationStrategies** - NotificationStrategy 列表
16. **DB.notificationHistory** - NotificationHistoryRecord 列表
17. **DB.datasources** - Datasource 列表
18. **DB.discoveryJobs** - DiscoveryJob 列表
19. **DB.discoveredResources** - DiscoveredResource 列表
20. **DB.tagDefinitions** - TagDefinition 列表
21. **DB.auditLogs** - AuditLog 列表
22. **DB.configVersions** - ConfigVersion 列表
23. **DB.mailSettings** - MailSettings 物件
24. **DB.grafanaSettings** - GrafanaSettings 物件
25. **DB.authSettings** - AuthSettings 物件
26. **DB.userPreferences** - UserPreferences 物件
27. **DB.layouts** - Layout 物件
28. **DB.resourceOverviewData** - ResourceOverviewData 物件
29. **其他模擬資料**

## 使用 Edit 工具的建議

由於 db.ts 檔案很大，建議分區域進行編輯：

1. 先處理 **時間戳欄位**（created_at, updated_at, deleted_at 等）- 一次性全局替換
2. 再處理 **ID 欄位**（resource_id, rule_id, team_id 等）- 按實體分批替換
3. 最後處理 **特定實體的複合詞欄位** - 逐個實體處理

## 完成後回報

請回報：
1. 修改的總行數
2. 更新的主要資料集列表
3. 是否遇到任何需要特別注意的問題
4. 驗證結果（是否還有遺留的 camelCase 欄位）

## 範例

### 修改前
```typescript
export const DB = {
  incidents: [
    {
      id: 'INC-001',
      resourceId: 'res-web-prod-1',
      ruleId: 'rule-cpu-high',
      createdAt: '2024-12-20T08:00:00Z',
      updatedAt: '2024-12-20T09:30:00Z',
      occurredAt: '2024-12-20T08:00:00Z',
      aiAnalysis: {
        summary: 'High CPU usage detected'
      }
    }
  ],
  alertRules: [
    {
      id: 'rule-cpu-high',
      conditionsSummary: 'CPU > 80%',
      automationEnabled: true,
      targetResourceIds: ['res-1', 'res-2'],
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z'
    }
  ]
}
```

### 修改後
```typescript
export const DB = {
  incidents: [
    {
      id: 'INC-001',
      resource_id: 'res-web-prod-1',
      rule_id: 'rule-cpu-high',
      created_at: '2024-12-20T08:00:00Z',
      updated_at: '2024-12-20T09:30:00Z',
      occurred_at: '2024-12-20T08:00:00Z',
      ai_analysis: {
        summary: 'High CPU usage detected'
      }
    }
  ],
  alertRules: [
    {
      id: 'rule-cpu-high',
      conditions_summary: 'CPU > 80%',
      automation_enabled: true,
      target_resource_ids: ['res-1', 'res-2'],
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    }
  ]
}
```

---

**執行者**：請使用 Edit 工具系統化地進行替換
**完成標準**：所有物件屬性都使用 snake_case，沒有遺留的 camelCase 欄位
