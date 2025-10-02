# SRE Platform 枚舉值規範 (Single Source of Truth)

## 概述

本文件定義了 SRE Platform 系統中所有枚舉值，確保整個系統（前端、后端、資料庫、API 文檔）的一致性。所有枚舉值統一使用小寫英文字母。

## 枚舉值定義

### 1. 事件管理 (Incident Management)

#### 事件狀態 (IncidentStatus)
```typescript
enum: ['new', 'acknowledged', 'resolved', 'silenced']
```
- `new`: 新建立的事件，等待處理
- `acknowledged`: 已認領處理的事件
- `resolved`: 已解決的事件
- `silenced`: 已靜音的事件

#### 事件嚴重度 (IncidentSeverity)
```typescript
enum: ['critical', 'warning', 'info']
```
- `critical`: 關鍵等級，需要立即處理
- `warning`: 警告等級，需要關注
- `info`: 資訊等級，記錄參考

#### 事件影響程度 (IncidentImpact)
```typescript
enum: ['high', 'medium', 'low']
```
- `high`: 高影響，影響多個用戶或關鍵業務
- `medium`: 中等影響，影響部分用戶或非關鍵業務
- `low`: 低影響，影響有限，業務基本正常

#### 事件優先級 (IncidentPriority)
```typescript
enum: ['p0', 'p1', 'p2', 'p3']
```

#### 事件類別 (IncidentCategory)
```typescript
enum: ['infrastructure', 'application', 'network', 'security', 'other']
```

### 2. 資源管理 (Resource Management)

#### 資源狀態 (ResourceStatus)
```typescript
enum: ['healthy', 'warning', 'critical', 'offline', 'unknown']
```
- `healthy`: 資源正常運行
- `warning`: 資源存在警告，需要關注
- `critical`: 資源處於關鍵狀態，需要立即處理
- `offline`: 資源離線或不可用
- `unknown`: 資源狀態未知

#### 發現作業種類 (DiscoveryJobKind)
```typescript
enum: ['k8s', 'snmp', 'cloud_provider', 'static_range', 'custom_script']
```
- `k8s`: Kubernetes 叢集資源發現
- `snmp`: SNMP 網路設備資源發現
- `cloud_provider`: 雲服務商資源發現
- `static_range`: 靜態 IP 範圍掃描
- `custom_script`: 自定義腳本資源發現

#### 發現資源狀態 (DiscoveredResourceStatus)
```typescript
enum: ['new', 'imported', 'ignored']
```
- `new`: 新發現的資源
- `imported`: 已匯入系統的資源
- `ignored`: 已忽略的資源

### 3. 告警規則 (Alert Rules)

#### 條件邏輯 (ConditionLogic)
```typescript
enum: ['and', 'or']
```
- `and`: AND 邏輯，所有條件必須同時滿足
- `or`: OR 邏輯，任一條件滿足即可

#### HTTP 方法 (HttpMethod)
```typescript
enum: ['get', 'post', 'put', 'patch', 'delete']
```
- `get`: GET 請求
- `post`: POST 請求
- `put`: PUT 請求
- `patch`: PATCH 請求
- `delete`: DELETE 請求

### 4. 自動化 (Automation)

#### 腳本類型 (AutomationPlaybookType)
```typescript
enum: ['shell', 'python', 'ansible', 'terraform']
```
- `shell`: Shell 腳本
- `python`: Python 腳本
- `ansible`: Ansible Playbook
- `terraform`: Terraform 配置

#### 執行狀態 (ExecutionStatus)
```typescript
enum: ['pending', 'running', 'success', 'failed', 'cancelled']
```
- `pending`: 等待執行
- `running`: 正在執行
- `success`: 執行成功
- `failed`: 執行失敗
- `cancelled`: 執行取消

#### 觸發來源 (TriggerSource)
```typescript
enum: ['manual', 'schedule', 'webhook', 'event', 'custom', 'grafana']
```
- `manual`: 手動觸發
- `schedule`: 排程觸發
- `webhook`: Webhook 觸發
- `event`: 事件觸發
- `custom`: 自定義儀表板或內部整合觸發
- `grafana`: Grafana 外部儀表板觸發

#### 觸發器類型 (TriggerType)
```typescript
enum: ['schedule', 'webhook', 'event']
```
- `schedule`: 排程觸發器
- `webhook`: Webhook 觸發器
- `event`: 事件觸發器

#### 重試策略 (RetryPolicy)
```typescript
enum: ['none', 'fixed', 'exponential']
```

### 5. 通知系統 (Notifications)

#### 通知通道類型 (NotificationChannelType)
```typescript
enum: ['email', 'webhook', 'slack', 'line', 'sms']
```
- `email`: 電子郵件通知
- `webhook`: Webhook 通知
- `slack`: Slack 通知
- `line`: LINE Notify 通知
- `sms`: 簡訊通知

#### 通知狀態 (NotificationStatus)
```typescript
enum: ['pending', 'sent', 'failed']
```
- `pending`: 等待發送
- `sent`: 已成功發送
- `failed`: 發送失敗

#### 測試結果 (TestResult)
```typescript
enum: ['success', 'failed', 'not_tested']
```
- `success`: 測試成功
- `failed`: 測試失敗
- `not_tested`: 尚未測試

### 6. 身份認證與授權 (IAM)

#### 用戶角色 (UserRole)
```typescript
enum: ['admin', 'sre', 'developer', 'viewer']
```
- `admin`: 系統管理員，擁有所有權限
- `sre`: SRE 工程師，負責系統可靠性
- `developer`: 開發工程師，具有應用相關權限
- `viewer`: 唯讀使用者，只能查看資料

#### 用戶狀態 (UserStatus)
```typescript
enum: ['active', 'invited', 'inactive']
```
- `active`: 活躍用戶
- `invited`: 已邀請但未激活的用戶
- `inactive`: 已停用的用戶

### 7. 儀表板 (Dashboards)

#### 儀表板類型 (DashboardType)
```typescript
enum: ['built-in', 'custom', 'grafana']
```
- `built-in`: 內建儀表板
- `custom`: 自定義儀表板
- `grafana`: Grafana 外部儀表板

### 8. 資料來源 (Datasources)

#### 資料來源類型 (DatasourceType)
```typescript
enum: ['victoriametrics', 'grafana', 'elasticsearch', 'prometheus', 'custom']
```
- `victoriametrics`: VictoriaMetrics 時序資料庫
- `grafana`: Grafana 可視化平台
- `elasticsearch`: Elasticsearch 搜尋引擎
- `prometheus`: Prometheus 監控系統
- `custom`: 自定義資料來源

#### 認證方法 (AuthMethod)
```typescript
enum: ['token', 'basic_auth', 'keycloak_integration', 'none']
```
- `token`: Token 認證
- `basic_auth`: 基本認證 (用戶名密碼)
- `keycloak_integration`: Keycloak 整合認證
- `none`: 無認證

#### 連接狀態 (ConnectionStatus)
```typescript
enum: ['ok', 'error', 'pending']
```
- `ok`: 連接正常
- `error`: 連接錯誤
- `pending`: 連接待驗證

### 9. 審計日誌 (Audit Logs)

#### 審計動作 (AuditAction)
```typescript
enum: ['create', 'read', 'update', 'delete', 'execute', 'login', 'logout', 'permission_change']
```
- `create`: 創建操作
- `read`: 讀取操作
- `update`: 更新操作
- `delete`: 刪除操作
- `execute`: 執行操作
- `login`: 登入操作
- `logout`: 登出操作
- `permission_change`: 權限變更操作

#### 審計結果 (AuditResult)
```typescript
enum: ['success', 'failure']
```
- `success`: 操作成功
- `failure`: 操作失敗

### 10. 分析與洞察 (Analysis & Insights)

#### 風險等級 (RiskLevel)
```typescript
enum: ['high', 'medium', 'low']
```
- `high`: 高風險，需要立即處理
- `medium`: 中等風險，需要關注
- `low`: 低風險，可接受

#### 優化建議類型 (OptimizationType)
```typescript
enum: ['cost', 'performance', 'security']
```
- `cost`: 成本優化建議
- `performance`: 性能優化建議
- `security`: 安全優化建議

#### 洞察類型 (InsightType)
```typescript
enum: ['trend', 'anomaly', 'forecast']
```

### 11. 配置版本控制 (Config Versioning)

#### 實體類型 (EntityType)
```typescript
enum: ['alertrule', 'automationplaybook', 'dashboard', 'notificationstrategy', 'silencerule', 'resource', 'team', 'user']
```
- `alertrule`: 告警規則
- `automationplaybook`: 自動化腳本
- `dashboard`: 儀表板
- `notificationstrategy`: 通知策略
- `silencerule`: 靜音規則
- `resource`: 資源
- `team`: 團隊
- `user`: 用戶

## 實作規範

### 1. 命名規則
- 所有枚舉值必須使用小寫英文字母
- 多個單詞使用下劃線 `_` 分隔
- 中文枚舉值保持原有格式

### 2. 一致性要求
- 前端 TypeScript 類型定義必須與此文件完全一致
- 後端資料庫枚舉類型必須與此文件完全一致
- API OpenAPI 文檔必須與此文件完全一致
- Mock Server 數據必須與此文件完全一致

### 3. 新增枚舉值流程
1. 在此文件中定義新的枚舉值
2. 更新 TypeScript 類型定義
3. 更新資料庫 schema
4. 更新 OpenAPI 文檔
5. 更新 Mock Server 數據
6. 更新前端組件邏輯

### 4. 維護責任
- 此文件為枚舉值的唯一真實來源 (SSOT)
- 任何枚舉值的修改必須首先在此文件中更新
- 相關團隊必須同步更新各自負責的代碼部分

## 版本歷史

- v1.0.0 (2025-01-15): 初始版本，定義所有現有枚舉值
- v1.1.0 (2025-01-16): 統一所有枚舉值為小寫格式
- v1.2.0 (2025-10-02): 清理中英文混雜枚舉，補充 incident priority/category、automation retry policy、audit login/logout、analysis insight type
