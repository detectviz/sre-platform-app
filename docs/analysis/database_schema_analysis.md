# SRE Platform 資料庫結構分析報告

> 基於檔案分析: `/Users/zoe/Downloads/sre-platform-app/types.ts` 和 `/Users/zoe/Downloads/sre-platform-app/mock-server/db.ts`

## 目錄
- [1. Dashboard (儀表板)](#1-dashboard-儀表板)
- [2. Incident (事件)](#2-incident-事件)
- [3. AlertRule (告警規則)](#3-alertrule-告警規則)
- [4. SilenceRule (靜音規則)](#4-silencerule-靜音規則)
- [5. Resource (資源)](#5-resource-資源)
- [6. ResourceGroup (資源群組)](#6-resourcegroup-資源群組)
- [7. AutomationPlaybook (自動化腳本)](#7-automationplaybook-自動化腳本)
- [8. AutomationExecution (自動化執行記錄)](#8-automationexecution-自動化執行記錄)
- [9. AutomationTrigger (自動化觸發器)](#9-automationtrigger-自動化觸發器)
- [10. User (使用者)](#10-user-使用者)
- [11. Team (團隊)](#11-team-團隊)
- [12. Role (角色)](#12-role-角色)
- [13. AuditLog (稽核日誌)](#13-auditlog-稽核日誌)
- [14. TagDefinition (標籤定義)](#14-tagdefinition-標籤定義)
- [15. NotificationChannel (通知管道)](#15-notificationchannel-通知管道)
- [16. NotificationStrategy (通知策略)](#16-notificationstrategy-通知策略)
- [17. NotificationHistoryRecord (通知歷史記錄)](#17-notificationhistoryrecord-通知歷史記錄)
- [18. NotificationItem (通知項目)](#18-notificationitem-通知項目)
- [19. LoginHistoryRecord (登入歷史記錄)](#19-loginhistoryrecord-登入歷史記錄)
- [20. LogEntry (日誌條目)](#20-logentry-日誌條目)
- [21. Datasource (資料來源)](#21-datasource-資料來源)
- [22. DiscoveryJob (探索作業)](#22-discoveryjob-探索作業)
- [23. DiscoveredResource (已探索資源)](#23-discoveredresource-已探索資源)
- [24. 關聯關係圖](#24-關聯關係圖)

---

## 1. Dashboard (儀表板)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 儀表板名稱 | - |
| type | DashboardType | ✓ | - | 儀表板類型 | - |
| category | string | ✓ | - | 儀表板分類 | INDEX |
| description | string | ✓ | - | 描述 | - |
| owner | string | ✓ | - | 擁有者名稱 | - |
| teamId | string | ✗ | - | 團隊 ID | FK → Team.id |
| ownerId | string | ✗ | - | 擁有者 ID | FK → User.id |
| tags | Record<string, string> | ✗ | - | 標籤鍵值對 | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| path | string | ✓ | - | 儀表板路徑 | UNIQUE |
| grafanaUrl | string | ✗ | - | Grafana URL | - |
| grafana_dashboard_uid | string | ✗ | - | Grafana 儀表板 UID | - |
| grafana_folder_uid | string | ✗ | - | Grafana 資料夾 UID | - |
| layout | DashboardLayoutItem[] | ✗ | - | 內建儀表板佈局 | - |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**DashboardType**
- `built-in`: 內建儀表板
- `grafana`: Grafana 儀表板

### 索引建議
```sql
CREATE INDEX idx_dashboard_category ON dashboards(category);
CREATE INDEX idx_dashboard_owner ON dashboards(ownerId);
CREATE INDEX idx_dashboard_team ON dashboards(teamId);
CREATE INDEX idx_dashboard_deleted ON dashboards(deleted_at);
CREATE UNIQUE INDEX idx_dashboard_path ON dashboards(path);
```

---

## 2. Incident (事件)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| summary | string | ✓ | - | 事件摘要 | - |
| resource | string | ✓ | - | 資源名稱 | - |
| resourceId | string | ✓ | - | 資源 ID | FK → Resource.id |
| status | IncidentStatus | ✓ | - | 事件狀態 | INDEX |
| severity | IncidentSeverity | ✓ | - | 嚴重程度 | INDEX |
| impact | IncidentImpact | ✓ | - | 影響範圍 | INDEX |
| rule | string | ✓ | - | 規則名稱 | - |
| ruleId | string | ✓ | - | 規則 ID | FK → AlertRule.id |
| assignee | string | ✗ | - | 處理人名稱 | - |
| teamId | string | ✗ | - | 團隊 ID | FK → Team.id |
| ownerId | string | ✗ | - | 擁有者 ID | FK → User.id |
| tags | Record<string, string> | ✗ | - | 標籤鍵值對 | - |
| occurredAt | string | ✓ | - | 發生時間 (ISO 8601) | INDEX |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| history | IncidentEvent[] | ✓ | [] | 事件歷史 (JSON) | - |
| aiAnalysis | IncidentAnalysis | ✗ | - | AI 分析結果 (JSON) | - |

### 枚舉值

**IncidentStatus**
- `New`: 新建
- `Acknowledged`: 已認領
- `Resolved`: 已解決
- `Silenced`: 已靜音

**IncidentSeverity**
- `Critical`: 嚴重
- `Warning`: 警告
- `Info`: 資訊

**IncidentImpact**
- `High`: 高
- `Medium`: 中
- `Low`: 低

### 索引建議
```sql
CREATE INDEX idx_incident_status ON incidents(status);
CREATE INDEX idx_incident_severity ON incidents(severity);
CREATE INDEX idx_incident_impact ON incidents(impact);
CREATE INDEX idx_incident_resource ON incidents(resourceId);
CREATE INDEX idx_incident_rule ON incidents(ruleId);
CREATE INDEX idx_incident_occurred ON incidents(occurredAt);
CREATE INDEX idx_incident_team ON incidents(teamId);
```

---

## 3. AlertRule (告警規則)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 規則名稱 | - |
| description | string | ✓ | - | 規則描述 | - |
| enabled | boolean | ✓ | true | 是否啟用 | INDEX |
| target | string | ✓ | - | 監控目標 | - |
| conditionsSummary | string | ✓ | - | 條件摘要 | - |
| severity | AlertSeverity | ✓ | 'warning' | 嚴重程度 | INDEX |
| automationEnabled | boolean | ✓ | false | 是否啟用自動化 | - |
| creator | string | ✓ | - | 建立者名稱 | - |
| teamId | string | ✗ | - | 團隊 ID | FK → Team.id |
| ownerId | string | ✗ | - | 擁有者 ID | FK → User.id |
| tags | Record<string, string> | ✗ | - | 標籤鍵值對 | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| labels | string[] | ✗ | [] | 標籤列表 | - |
| conditionGroups | ConditionGroup[] | ✗ | - | 條件群組 (JSON) | - |
| titleTemplate | string | ✗ | - | 標題模板 | - |
| contentTemplate | string | ✗ | - | 內容模板 | - |
| automation | AutomationSetting | ✗ | - | 自動化設定 (JSON) | - |
| testPayload | Record<string, unknown> | ✗ | - | 測試負載 (JSON) | - |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**AlertSeverity**
- `critical`: 嚴重
- `warning`: 警告
- `info`: 資訊

### 索引建議
```sql
CREATE INDEX idx_alert_rule_enabled ON alert_rules(enabled);
CREATE INDEX idx_alert_rule_severity ON alert_rules(severity);
CREATE INDEX idx_alert_rule_team ON alert_rules(teamId);
CREATE INDEX idx_alert_rule_deleted ON alert_rules(deleted_at);
```

---

## 4. SilenceRule (靜音規則)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 規則名稱 | - |
| description | string | ✓ | - | 規則描述 | - |
| enabled | boolean | ✓ | true | 是否啟用 | INDEX |
| type | SilenceType | ✓ | - | 靜音類型 | INDEX |
| matchers | SilenceMatcher[] | ✓ | [] | 匹配條件 (JSON) | - |
| schedule | SilenceSchedule | ✓ | - | 排程設定 (JSON) | - |
| creator | string | ✓ | - | 建立者名稱 | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**SilenceType**
- `single`: 單次事件
- `repeat`: 週期性
- `condition`: 條件式

### 索引建議
```sql
CREATE INDEX idx_silence_rule_enabled ON silence_rules(enabled);
CREATE INDEX idx_silence_rule_type ON silence_rules(type);
CREATE INDEX idx_silence_rule_deleted ON silence_rules(deleted_at);
```

---

## 5. Resource (資源)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 資源名稱 | INDEX |
| status | ResourceStatus | ✓ | - | 資源狀態 | INDEX |
| type | string | ✓ | - | 資源類型 | INDEX |
| provider | string | ✓ | - | 雲端提供商 | INDEX |
| region | string | ✓ | - | 區域 | INDEX |
| owner | string | ✓ | - | 擁有者名稱 | - |
| teamId | string | ✗ | - | 團隊 ID | FK → Team.id |
| ownerId | string | ✗ | - | 擁有者 ID | FK → User.id |
| tags | Record<string, string> | ✗ | - | 標籤鍵值對 | - |
| lastCheckInAt | string | ✓ | - | 最後簽到時間 (ISO 8601) | INDEX |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| discoveredByJobId | string | ✗ | - | 探索作業 ID | FK → DiscoveryJob.id |
| monitoringAgent | string | ✗ | - | 監控代理程式 | - |

### 枚舉值

**ResourceStatus**
- `healthy`: 健康
- `warning`: 警告
- `critical`: 嚴重
- `offline`: 離線

### 索引建議
```sql
CREATE INDEX idx_resource_status ON resources(status);
CREATE INDEX idx_resource_type ON resources(type);
CREATE INDEX idx_resource_provider ON resources(provider);
CREATE INDEX idx_resource_region ON resources(region);
CREATE INDEX idx_resource_name ON resources(name);
CREATE INDEX idx_resource_team ON resources(teamId);
CREATE INDEX idx_resource_discovery ON resources(discoveredByJobId);
```

---

## 6. ResourceGroup (資源群組)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 群組名稱 | INDEX |
| description | string | ✓ | - | 群組描述 | - |
| ownerTeam | string | ✓ | - | 擁有團隊名稱 | - |
| memberIds | string[] | ✓ | [] | 成員資源 ID 列表 | - |
| statusSummary | StatusSummary | ✓ | - | 狀態摘要 (JSON) | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### StatusSummary 結構
```typescript
{
  healthy: number;   // 健康資源數
  warning: number;   // 警告資源數
  critical: number;  // 嚴重資源數
}
```

### 索引建議
```sql
CREATE INDEX idx_resource_group_name ON resource_groups(name);
CREATE INDEX idx_resource_group_deleted ON resource_groups(deleted_at);
```

---

## 7. AutomationPlaybook (自動化腳本)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 腳本名稱 | INDEX |
| description | string | ✓ | - | 腳本描述 | - |
| trigger | string | ✓ | - | 觸發條件描述 | - |
| type | PlaybookType | ✓ | - | 腳本類型 | INDEX |
| content | string | ✓ | - | 腳本內容 | - |
| lastRunAt | string | ✓ | - | 最後執行時間 (ISO 8601) | INDEX |
| lastRunStatus | ExecutionStatus | ✓ | - | 最後執行狀態 | INDEX |
| runCount | number | ✓ | 0 | 執行次數 | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| parameters | ParameterDefinition[] | ✗ | [] | 參數定義 (JSON) | - |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**PlaybookType**
- `shell`: Shell 腳本
- `python`: Python 腳本
- `ansible`: Ansible Playbook
- `terraform`: Terraform 腳本

**ExecutionStatus**
- `success`: 成功
- `failed`: 失敗
- `running`: 執行中

### 索引建議
```sql
CREATE INDEX idx_playbook_type ON automation_playbooks(type);
CREATE INDEX idx_playbook_status ON automation_playbooks(lastRunStatus);
CREATE INDEX idx_playbook_deleted ON automation_playbooks(deleted_at);
```

---

## 8. AutomationExecution (自動化執行記錄)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| scriptId | string | ✓ | - | 腳本 ID | FK → AutomationPlaybook.id |
| scriptName | string | ✓ | - | 腳本名稱 | - |
| status | ExecutionDetailStatus | ✓ | - | 執行狀態 | INDEX |
| triggerSource | TriggerSource | ✓ | - | 觸發來源 | INDEX |
| triggeredBy | string | ✓ | - | 觸發者描述 | - |
| startTime | string | ✓ | - | 開始時間 (ISO 8601) | INDEX |
| endTime | string | ✗ | - | 結束時間 (ISO 8601) | INDEX |
| durationMs | number | ✗ | - | 執行時長(毫秒) | - |
| parameters | Record<string, any> | ✗ | - | 執行參數 (JSON) | - |
| logs | ExecutionLogs | ✓ | - | 執行日誌 (JSON) | - |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**ExecutionDetailStatus**
- `success`: 成功
- `failed`: 失敗
- `running`: 執行中
- `pending`: 待執行

**TriggerSource**
- `manual`: 手動觸發
- `event`: 事件觸發
- `schedule`: 排程觸發
- `webhook`: Webhook 觸發

### 索引建議
```sql
CREATE INDEX idx_execution_script ON automation_executions(scriptId);
CREATE INDEX idx_execution_status ON automation_executions(status);
CREATE INDEX idx_execution_source ON automation_executions(triggerSource);
CREATE INDEX idx_execution_start ON automation_executions(startTime);
CREATE INDEX idx_execution_deleted ON automation_executions(deleted_at);
```

---

## 9. AutomationTrigger (自動化觸發器)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 觸發器名稱 | - |
| description | string | ✓ | - | 觸發器描述 | - |
| type | TriggerType | ✓ | - | 觸發器類型 | INDEX |
| enabled | boolean | ✓ | true | 是否啟用 | INDEX |
| targetPlaybookId | string | ✓ | - | 目標腳本 ID | FK → AutomationPlaybook.id |
| config | TriggerConfig | ✓ | - | 觸發器配置 (JSON) | - |
| lastTriggeredAt | string | ✓ | - | 最後觸發時間 (ISO 8601) | INDEX |
| creator | string | ✓ | - | 建立者名稱 | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**TriggerType**
- `Schedule`: 排程觸發
- `Webhook`: Webhook 觸發
- `Event`: 事件觸發

### TriggerConfig 結構
```typescript
{
  cron?: string;              // Schedule: Cron 表達式
  cronDescription?: string;   // Schedule: 人類可讀描述
  webhookUrl?: string;        // Webhook: URL
  eventConditions?: string;   // Event: 條件字串
}
```

### 索引建議
```sql
CREATE INDEX idx_trigger_type ON automation_triggers(type);
CREATE INDEX idx_trigger_enabled ON automation_triggers(enabled);
CREATE INDEX idx_trigger_playbook ON automation_triggers(targetPlaybookId);
CREATE INDEX idx_trigger_deleted ON automation_triggers(deleted_at);
```

---

## 10. User (使用者)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 使用者名稱 | INDEX |
| email | string | ✓ | - | 電子郵件 | UNIQUE |
| role | UserRole | ✓ | - | 使用者角色 | INDEX |
| team | string | ✓ | - | 團隊名稱 | - |
| status | UserStatus | ✓ | - | 使用者狀態 | INDEX |
| lastLoginAt | string / null | ✓ | null | 最後登入時間 (ISO 8601) | INDEX |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |

### 枚舉值

**UserRole**
- `Admin`: 管理員
- `SRE`: SRE 工程師
- `Developer`: 開發者
- `Viewer`: 檢視者

**UserStatus**
- `active`: 啟用
- `invited`: 已邀請
- `inactive`: 停用

### 索引建議
```sql
CREATE UNIQUE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_status ON users(status);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_last_login ON users(lastLoginAt);
```

---

## 11. Team (團隊)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 團隊名稱 | UNIQUE |
| description | string | ✓ | - | 團隊描述 | - |
| ownerId | string | ✓ | - | 擁有者 ID | FK → User.id |
| memberIds | string[] | ✓ | [] | 成員 ID 列表 | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 索引建議
```sql
CREATE UNIQUE INDEX idx_team_name ON teams(name);
CREATE INDEX idx_team_owner ON teams(ownerId);
CREATE INDEX idx_team_deleted ON teams(deleted_at);
```

---

## 12. Role (角色)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 角色名稱 | UNIQUE |
| description | string | ✓ | - | 角色描述 | - |
| userCount | number | ✓ | 0 | 使用者數量 | - |
| enabled | boolean | ✓ | true | 是否啟用 | INDEX |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| permissions | RolePermission[] | ✓ | [] | 權限列表 (JSON) | - |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### RolePermission 結構
```typescript
{
  module: string;                                              // 模組名稱
  actions: ('read'|'create'|'update'|'delete'|'execute')[];  // 操作列表
}
```

### 索引建議
```sql
CREATE UNIQUE INDEX idx_role_name ON roles(name);
CREATE INDEX idx_role_enabled ON roles(enabled);
CREATE INDEX idx_role_deleted ON roles(deleted_at);
```

---

## 13. AuditLog (稽核日誌)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| timestamp | string | ✓ | - | 時間戳 (ISO 8601) | INDEX |
| user | UserInfo | ✓ | - | 使用者資訊 (JSON) | - |
| action | string | ✓ | - | 操作類型 | INDEX |
| target | TargetInfo | ✓ | - | 目標資訊 (JSON) | - |
| result | ActionResult | ✓ | - | 操作結果 | INDEX |
| ip | string | ✓ | - | 來源 IP 地址 | INDEX |
| details | Record<string, any> | ✓ | - | 詳細資訊 (JSON) | - |

### 枚舉值

**ActionResult**
- `success`: 成功
- `failure`: 失敗

### UserInfo 結構
```typescript
{
  id: string;    // 使用者 ID
  name: string;  // 使用者名稱
}
```

### TargetInfo 結構
```typescript
{
  type: string;  // 目標類型
  name: string;  // 目標名稱
}
```

### 索引建議
```sql
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_result ON audit_logs(result);
CREATE INDEX idx_audit_ip ON audit_logs(ip);
```

---

## 14. TagDefinition (標籤定義)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| key | string | ✓ | - | 標籤鍵 | UNIQUE |
| description | string | ✓ | - | 標籤描述 | - |
| scopes | TagScope[] | ✓ | [] | 適用範圍列表 | - |
| required | boolean | ✓ | false | 是否必填 | INDEX |
| writableRoles | string[] | ✓ | [] | 可寫入角色列表 | - |
| readonly | boolean | ✗ | false | 是否唯讀 | - |
| linkToEntity | string | ✗ | - | 關聯實體類型 | - |
| allowedValues | TagValue[] | ✓ | [] | 允許的值列表 (JSON) | - |
| usageCount | number | ✓ | 0 | 使用次數 | - |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**TagScope**
- `resource`: 資源
- `datasource`: 資料來源
- `discovery_job`: 探索作業
- `exporter`: 匯出器
- `dashboard`: 儀表板
- `alert_rule`: 告警規則
- `incident`: 事件
- `notification_policy`: 通知策略
- `automation`: 自動化
- `analysis`: 分析
- `tenant`: 租戶
- `team`: 團隊
- `user`: 使用者

### TagValue 結構
```typescript
{
  id: string;           // 值 ID
  value: string;        // 值內容
  description?: string; // 值描述
  usageCount: number;   // 使用次數
}
```

### 索引建議
```sql
CREATE UNIQUE INDEX idx_tag_key ON tag_definitions(key);
CREATE INDEX idx_tag_required ON tag_definitions(required);
CREATE INDEX idx_tag_deleted ON tag_definitions(deleted_at);
```

---

## 15. NotificationChannel (通知管道)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 管道名稱 | INDEX |
| type | NotificationChannelType | ✓ | - | 管道類型 | INDEX |
| enabled | boolean | ✓ | true | 是否啟用 | INDEX |
| config | ChannelConfig | ✓ | - | 管道配置 (JSON) | - |
| lastTestResult | TestResult | ✓ | - | 最後測試結果 | - |
| lastTestedAt | string | ✓ | - | 最後測試時間 (ISO 8601) | INDEX |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**NotificationChannelType**
- `Email`: 電子郵件
- `Webhook (通用)`: 通用 Webhook
- `Slack`: Slack
- `LINE Notify`: LINE Notify
- `SMS`: 簡訊

**TestResult**
- `success`: 成功
- `failed`: 失敗
- `pending`: 待測試

### ChannelConfig 結構
```typescript
{
  // Email
  to?: string;          // 收件人
  cc?: string;          // 副本
  bcc?: string;         // 密件副本

  // Webhook (通用) & Slack
  webhookUrl?: string;  // Webhook URL

  // Webhook (通用) only
  httpMethod?: 'POST' | 'PUT' | 'GET';

  // Slack only
  mention?: string;     // 提及用戶

  // LINE Notify
  accessToken?: string; // 存取權杖

  // SMS
  phoneNumber?: string; // 電話號碼
}
```

### 索引建議
```sql
CREATE INDEX idx_channel_type ON notification_channels(type);
CREATE INDEX idx_channel_enabled ON notification_channels(enabled);
CREATE INDEX idx_channel_deleted ON notification_channels(deleted_at);
```

---

## 16. NotificationStrategy (通知策略)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 策略名稱 | INDEX |
| enabled | boolean | ✓ | true | 是否啟用 | INDEX |
| triggerCondition | string | ✓ | - | 觸發條件 | - |
| channelCount | number | ✓ | 0 | 管道數量 | - |
| severityLevels | IncidentSeverity[] | ✓ | [] | 嚴重程度列表 | - |
| impactLevels | IncidentImpact[] | ✓ | [] | 影響層級列表 | - |
| creator | string | ✓ | - | 建立者名稱 | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 索引建議
```sql
CREATE INDEX idx_strategy_enabled ON notification_strategies(enabled);
CREATE INDEX idx_strategy_deleted ON notification_strategies(deleted_at);
```

---

## 17. NotificationHistoryRecord (通知歷史記錄)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| timestamp | string | ✓ | - | 時間戳 (ISO 8601) | INDEX |
| strategy | string | ✓ | - | 策略名稱 | - |
| channel | string | ✓ | - | 管道名稱 | - |
| channelType | NotificationChannelType | ✓ | - | 管道類型 | INDEX |
| recipient | string | ✓ | - | 接收者 | INDEX |
| status | NotificationStatus | ✓ | - | 發送狀態 | INDEX |
| content | string | ✓ | - | 通知內容 | - |

### 枚舉值

**NotificationStatus**
- `success`: 成功
- `failed`: 失敗

### 索引建議
```sql
CREATE INDEX idx_notification_history_timestamp ON notification_history(timestamp);
CREATE INDEX idx_notification_history_status ON notification_history(status);
CREATE INDEX idx_notification_history_type ON notification_history(channelType);
CREATE INDEX idx_notification_history_recipient ON notification_history(recipient);
```

---

## 18. NotificationItem (通知項目)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| title | string | ✓ | - | 通知標題 | - |
| description | string | ✓ | - | 通知描述 | - |
| severity | NotificationSeverity | ✓ | - | 嚴重程度 | INDEX |
| status | NotificationItemStatus | ✓ | - | 閱讀狀態 | INDEX |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| linkUrl | string | ✗ | - | 連結 URL | - |

### 枚舉值

**NotificationSeverity**
- `critical`: 嚴重
- `warning`: 警告
- `info`: 資訊
- `success`: 成功

**NotificationItemStatus**
- `unread`: 未讀
- `read`: 已讀

### 索引建議
```sql
CREATE INDEX idx_notification_severity ON notification_items(severity);
CREATE INDEX idx_notification_status ON notification_items(status);
CREATE INDEX idx_notification_created ON notification_items(createdAt);
```

---

## 19. LoginHistoryRecord (登入歷史記錄)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| timestamp | string | ✓ | - | 時間戳 (ISO 8601) | INDEX |
| ip | string | ✓ | - | 來源 IP 地址 | INDEX |
| device | string | ✓ | - | 裝置資訊 | - |
| status | LoginStatus | ✓ | - | 登入狀態 | INDEX |

### 枚舉值

**LoginStatus**
- `success`: 成功
- `failed`: 失敗

### 索引建議
```sql
CREATE INDEX idx_login_history_timestamp ON login_history(timestamp);
CREATE INDEX idx_login_history_ip ON login_history(ip);
CREATE INDEX idx_login_history_status ON login_history(status);
```

---

## 20. LogEntry (日誌條目)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| timestamp | string | ✓ | - | 時間戳 (ISO 8601) | INDEX |
| level | LogLevel | ✓ | - | 日誌等級 | INDEX |
| service | string | ✓ | - | 服務名稱 | INDEX |
| message | string | ✓ | - | 日誌訊息 | - |
| details | Record<string, any> | ✓ | - | 詳細資訊 (JSON) | - |

### 枚舉值

**LogLevel**
- `info`: 資訊
- `warning`: 警告
- `error`: 錯誤
- `debug`: 除錯

### 索引建議
```sql
CREATE INDEX idx_log_timestamp ON log_entries(timestamp);
CREATE INDEX idx_log_level ON log_entries(level);
CREATE INDEX idx_log_service ON log_entries(service);
```

---

## 21. Datasource (資料來源)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 資料來源名稱 | INDEX |
| type | DatasourceType | ✓ | - | 資料來源類型 | INDEX |
| status | ConnectionStatus | ✓ | - | 連線狀態 | INDEX |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| url | string | ✓ | - | 資料來源 URL | - |
| authMethod | AuthMethod | ✓ | - | 認證方法 | INDEX |
| tags | KeyValueTag[] | ✓ | [] | 標籤列表 (JSON) | - |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**DatasourceType**
- `VictoriaMetrics`: VictoriaMetrics
- `Grafana`: Grafana
- `Elasticsearch`: Elasticsearch
- `Prometheus`: Prometheus
- `Custom`: 自訂

**ConnectionStatus**
- `ok`: 正常
- `error`: 錯誤
- `pending`: 待測試

**AuthMethod**
- `Token`: Token 認證
- `Basic Auth`: 基本認證
- `Keycloak Integration`: Keycloak 整合
- `None`: 無認證

### KeyValueTag 結構
```typescript
{
  id: string;    // 標籤 ID
  key: string;   // 標籤鍵
  value: string; // 標籤值
}
```

### 索引建議
```sql
CREATE INDEX idx_datasource_type ON datasources(type);
CREATE INDEX idx_datasource_status ON datasources(status);
CREATE INDEX idx_datasource_auth ON datasources(authMethod);
CREATE INDEX idx_datasource_deleted ON datasources(deleted_at);
```

---

## 22. DiscoveryJob (探索作業)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 作業名稱 | INDEX |
| kind | DiscoveryJobKind | ✓ | - | 作業類型 | INDEX |
| schedule | string | ✓ | - | 排程 (Cron) | - |
| lastRunAt | string | ✓ | - | 最後執行時間 (ISO 8601) | INDEX |
| status | DiscoveryJobStatus | ✓ | - | 執行狀態 | INDEX |
| targetConfig | Record<string, any> | ✓ | - | 目標配置 (JSON) | - |
| exporterBinding | ExporterBinding | ✗ | null | 匯出器綁定 (JSON) | - |
| edgeGateway | EdgeGateway | ✗ | null | 邊緣閘道 (JSON) | - |
| tags | KeyValueTag[] | ✓ | [] | 標籤列表 (JSON) | - |
| createdAt | string | ✓ | - | 建立時間 (ISO 8601) | INDEX |
| updatedAt | string | ✓ | - | 更新時間 (ISO 8601) | INDEX |
| deleted_at | string | ✗ | - | 軟刪除時間 | INDEX |

### 枚舉值

**DiscoveryJobKind**
- `K8s`: Kubernetes
- `SNMP`: SNMP
- `Cloud Provider`: 雲端提供商
- `Static Range`: 靜態範圍
- `Custom Script`: 自訂腳本

**DiscoveryJobStatus**
- `success`: 成功
- `partial_failure`: 部分失敗
- `failed`: 失敗
- `running`: 執行中

**ExporterTemplateId**
- `none`: 無
- `node_exporter`: Node Exporter
- `snmp_exporter`: SNMP Exporter
- `modbus_exporter`: Modbus Exporter
- `ipmi_exporter`: IPMI Exporter

### ExporterBinding 結構
```typescript
{
  templateId: ExporterTemplateId;  // 匯出器模板 ID
  overridesYaml?: string;          // 覆寫 YAML
  mibProfileId?: string;           // MIB 設定檔 ID
}
```

### EdgeGateway 結構
```typescript
{
  enabled: boolean;    // 是否啟用
  gatewayId?: string;  // 閘道 ID
}
```

### 索引建議
```sql
CREATE INDEX idx_discovery_job_kind ON discovery_jobs(kind);
CREATE INDEX idx_discovery_job_status ON discovery_jobs(status);
CREATE INDEX idx_discovery_job_last_run ON discovery_jobs(lastRunAt);
CREATE INDEX idx_discovery_job_deleted ON discovery_jobs(deleted_at);
```

---

## 23. DiscoveredResource (已探索資源)

### 欄位定義

| 欄位名稱 | 資料型別 | 必填 | 預設值 | 說明 | 外鍵/索引 |
|---------|---------|------|--------|------|----------|
| id | string | ✓ | - | 主鍵 | PK |
| name | string | ✓ | - | 資源名稱 | INDEX |
| ip | string | ✓ | - | IP 地址 | INDEX |
| type | string | ✓ | - | 資源類型 | INDEX |
| tags | KeyValueTag[] | ✓ | [] | 標籤列表 (JSON) | - |
| status | DiscoveredResourceStatus | ✓ | - | 資源狀態 | INDEX |
| ignoredAt | string | ✗ | - | 忽略時間 (ISO 8601) | - |

### 枚舉值

**DiscoveredResourceStatus**
- `new`: 新發現
- `imported`: 已匯入
- `ignored`: 已忽略

### 索引建議
```sql
CREATE INDEX idx_discovered_resource_status ON discovered_resources(status);
CREATE INDEX idx_discovered_resource_type ON discovered_resources(type);
CREATE INDEX idx_discovered_resource_ip ON discovered_resources(ip);
```

---

## 24. 關聯關係圖

### 核心實體關聯

```
User (使用者)
  ├─ 1:N → Team (團隊) [ownerId]
  ├─ 1:N → Dashboard (儀表板) [ownerId]
  ├─ 1:N → Resource (資源) [ownerId]
  ├─ 1:N → Incident (事件) [ownerId]
  └─ 1:N → AlertRule (告警規則) [ownerId]

Team (團隊)
  ├─ 1:N → Dashboard (儀表板) [teamId]
  ├─ 1:N → Resource (資源) [teamId]
  ├─ 1:N → Incident (事件) [teamId]
  └─ 1:N → AlertRule (告警規則) [teamId]

Resource (資源)
  ├─ 1:N → Incident (事件) [resourceId]
  ├─ M:N → ResourceGroup (資源群組) [memberIds]
  └─ N:1 → DiscoveryJob (探索作業) [discoveredByJobId]

AlertRule (告警規則)
  ├─ 1:N → Incident (事件) [ruleId]
  └─ 1:1 → AutomationPlaybook (自動化腳本) [automation.scriptId]

AutomationPlaybook (自動化腳本)
  ├─ 1:N → AutomationExecution (自動化執行記錄) [scriptId]
  └─ 1:N → AutomationTrigger (自動化觸發器) [targetPlaybookId]

NotificationStrategy (通知策略)
  └─ 1:N → NotificationHistoryRecord (通知歷史記錄) [strategy]

DiscoveryJob (探索作業)
  ├─ 1:N → Resource (資源) [discoveredByJobId]
  └─ 1:N → DiscoveredResource (已探索資源) [隱含關聯]
```

### 標籤系統關聯

```
TagDefinition (標籤定義)
  └─ 適用於多個實體的 tags 欄位:
      ├─ Dashboard.tags
      ├─ Resource.tags
      ├─ Incident.tags
      ├─ AlertRule.tags
      ├─ Datasource.tags
      └─ DiscoveryJob.tags
```

### 時間戳欄位摘要

所有實體均包含以下時間戳欄位 (除特別標註外):

| 欄位名稱 | 說明 | 格式 |
|---------|------|------|
| createdAt | 建立時間 | ISO 8601 |
| updatedAt | 更新時間 | ISO 8601 |
| deleted_at | 軟刪除時間 (選填) | ISO 8601 |

特殊時間戳欄位:
- **Incident**: `occurredAt` (事件發生時間)
- **Resource**: `lastCheckInAt` (最後簽到時間)
- **AutomationPlaybook**: `lastRunAt` (最後執行時間)
- **AutomationExecution**: `startTime`, `endTime` (開始/結束時間)
- **AutomationTrigger**: `lastTriggeredAt` (最後觸發時間)
- **User**: `lastLoginAt` (最後登入時間)
- **NotificationChannel**: `lastTestedAt` (最後測試時間)
- **DiscoveredResource**: `ignoredAt` (忽略時間, 選填)

---

## SQL Schema 生成建議

### 通用欄位定義
```sql
-- 時間戳欄位
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at TIMESTAMP NULL DEFAULT NULL

-- 標籤欄位 (JSON)
tags JSON NULL

-- UUID 主鍵
id VARCHAR(36) PRIMARY KEY
```

### 軟刪除查詢模式
```sql
-- 查詢未刪除的記錄
SELECT * FROM table_name WHERE deleted_at IS NULL;

-- 軟刪除操作
UPDATE table_name SET deleted_at = NOW() WHERE id = ?;
```

### JSON 欄位索引 (MySQL 5.7+)
```sql
-- 為 tags 的特定鍵建立虛擬列索引
ALTER TABLE incidents
  ADD COLUMN tag_env VARCHAR(50)
  AS (JSON_UNQUOTE(JSON_EXTRACT(tags, '$.env'))) VIRTUAL;

CREATE INDEX idx_incident_tag_env ON incidents(tag_env);
```

---

## 注意事項

1. **時間格式**: 所有時間戳欄位使用 ISO 8601 格式 (例: `2025-09-23T14:05:10Z`)
2. **軟刪除**: 大多數實體支援軟刪除 (`deleted_at` 欄位)
3. **JSON 欄位**: 許多配置和結構化資料存儲為 JSON 格式
4. **標籤系統**: 使用 `Record<string, string>` 或 `KeyValueTag[]` 實現靈活的標籤系統
5. **外鍵約束**: 建議在實際資料庫中實施外鍵約束以保持資料完整性
6. **索引策略**: 根據查詢模式建立適當的索引以提升效能
7. **UUID vs Auto-increment**: 目前使用字串型 ID，可考慮改用 UUID 或 Auto-increment 整數

---

**報告生成時間**: 2025-10-01
**分析檔案版本**: 最新版本
**資料表數量**: 23 個主要實體
