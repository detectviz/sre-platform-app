# SRE Platform 改進建議彙總

> 基於以下分析報告的綜合建議
> - platform_functionality_verification.md
> - database_schema_analysis.md
> - data_lineage_verification.md
> - api_consistency_issues.md
> - ai_agent_plan.md

## 執行摘要

**整體評估**：
- 功能完整性：65% ✅ / 25% ⚠️ / 10% ❌
- 資料流閉環：3.7/10 ❌
- API 一致性：中等（多處不一致）
- 數據血緣追蹤：嚴重缺失 ❌

**關鍵發現**：
1. AuditLog 機制幾乎未實現
2. 多處關鍵外鍵關聯缺失
3. 命名規範不一致（camelCase vs snake_case）
4. 軟刪除策略不統一
5. 反向追溯能力嚴重不足

---

## 第一階段：緊急修復（P0）

### 1. 資料表結構增強

#### 1.1 補充關鍵外鍵欄位

**AutomationExecution 表**
```sql
ALTER TABLE automation_executions
ADD COLUMN incident_id VARCHAR(255) COMMENT '關聯的事件 ID',
ADD COLUMN alert_rule_id VARCHAR(255) COMMENT '觸發的告警規則 ID',
ADD INDEX idx_incident_id (incident_id),
ADD INDEX idx_alert_rule_id (alert_rule_id);
```

**NotificationHistoryRecord 表**
```sql
ALTER TABLE notification_history
ADD COLUMN incident_id VARCHAR(255) COMMENT '關聯的事件 ID',
ADD INDEX idx_incident_id (incident_id);
```

**Resource 表**
```sql
ALTER TABLE resources
ADD COLUMN datasource_id VARCHAR(255) COMMENT '資料來源 ID',
ADD INDEX idx_datasource_id (datasource_id);
```

**Dashboard 表**
```sql
ALTER TABLE dashboards
ADD COLUMN resource_ids JSON COMMENT '關聯的資源 ID 列表',
ADD INDEX idx_dashboard_type (type);
```

**AlertRule 表**
```sql
ALTER TABLE alert_rules
ADD COLUMN target_resource_ids JSON COMMENT '目標資源 ID 列表',
ADD COLUMN triggered_count INT DEFAULT 0 COMMENT '觸發次數',
ADD COLUMN version INT DEFAULT 1 COMMENT '版本號';
```

**Incident 表**
```sql
ALTER TABLE incidents
ADD COLUMN silenced_by VARCHAR(255) COMMENT '執行靜音的使用者',
ADD COLUMN notifications_sent JSON COMMENT '已發送的通知記錄',
ADD COLUMN acknowledged_at DATETIME COMMENT '確認時間',
ADD COLUMN resolved_at DATETIME COMMENT '解決時間';
```

**NotificationStrategy 表**
```sql
ALTER TABLE notification_strategies
ADD COLUMN channel_ids JSON COMMENT '關聯的管道 ID 列表';
```

#### 1.2 新增缺失的資料表

**ResourceLink 表（資源拓撲關係）**
```sql
CREATE TABLE resource_links (
  id VARCHAR(255) PRIMARY KEY,
  source_resource_id VARCHAR(255) NOT NULL COMMENT '來源資源',
  target_resource_id VARCHAR(255) NOT NULL COMMENT '目標資源',
  link_type VARCHAR(50) NOT NULL COMMENT '關係類型: depends_on, connects_to, includes',
  metadata JSON COMMENT '額外的元數據',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_source (source_resource_id),
  INDEX idx_target (target_resource_id),
  INDEX idx_link_type (link_type),
  INDEX idx_deleted (deleted_at),
  CONSTRAINT fk_resource_link_source FOREIGN KEY (source_resource_id) REFERENCES resources(id),
  CONSTRAINT fk_resource_link_target FOREIGN KEY (target_resource_id) REFERENCES resources(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='資源拓撲關係';
```

**ConfigVersion 表（配置版本控制）**
```sql
CREATE TABLE config_versions (
  id VARCHAR(255) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL COMMENT 'alert_rule, automation_playbook, etc.',
  entity_id VARCHAR(255) NOT NULL COMMENT '實體 ID',
  version INT NOT NULL COMMENT '版本號',
  config_snapshot JSON NOT NULL COMMENT '配置快照',
  changed_by VARCHAR(255) NOT NULL COMMENT '變更人',
  change_summary TEXT COMMENT '變更摘要',
  created_at DATETIME NOT NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_version (entity_type, entity_id, version),
  INDEX idx_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配置版本歷史';
```

### 2. 欄位命名統一化

#### 2.1 時間戳欄位統一改為 snake_case

所有表的時間戳欄位統一命名：
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `occurredAt` → `occurred_at`
- `lastLoginAt` → `last_login_at`
- ...

#### 2.2 Grafana 相關欄位統一

Dashboard 表：
- 保持 `grafana_dashboard_uid`（snake_case）
- 保持 `grafana_folder_uid`（snake_case）

### 3. 軟刪除策略統一

#### 3.1 所有實體統一使用軟刪除

為以下表補充 `deleted_at` 欄位（如果缺失）：
- AlertRule
- SilenceRule
- User
- Team
- Role
- AutomationPlaybook
- AutomationTrigger
- Resource
- ResourceGroup
- Datasource
- DiscoveryJob

#### 3.2 禁止硬刪除

修改所有 DELETE 端點改為軟刪除：
```typescript
// 錯誤寫法
DB.alertRules = DB.alertRules.filter((r: any) => r.id !== id);

// 正確寫法
const index = DB.alertRules.findIndex((r: any) => r.id === id);
if (index > -1) DB.alertRules[index].deleted_at = new Date().toISOString();
```

### 4. 實現 AuditLog 自動記錄

#### 4.1 中間件實現

```typescript
// 新增 auditLog.ts
export const auditLogMiddleware = (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: any
) => {
  const log = {
    id: `audit-${uuidv4()}`,
    userId,
    userName: DB.users.find(u => u.id === userId)?.name || 'Unknown',
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1', // mock
    changes: details || {}
  };
  DB.auditLogs.unshift(log);
};
```

#### 4.2 應用到所有變更操作

在所有 POST/PATCH/DELETE 端點中調用：
```typescript
case 'POST /alert-rules':
  const newRule = { ...body, id: `rule-${uuidv4()}` };
  DB.alertRules.unshift(newRule);

  // 記錄稽核日誌
  auditLogMiddleware(
    currentUser.id,
    'CREATE',
    'AlertRule',
    newRule.id,
    { name: newRule.name }
  );

  return newRule;
```

---

## 第二階段：重要補強（P1）

### 1. 新增 API 端點

#### 1.1 自動觸發機制

**POST /alert-rules/{id}/trigger** - 手動觸發告警規則（用於測試）
**POST /incidents/{id}/notify** - 手動觸發通知發送

#### 1.2 反向查詢端點

**GET /resources/{id}/alert-rules** - 查詢資源關聯的告警規則
**GET /incidents/{id}/executions** - 查詢事件關聯的自動化執行
**GET /alert-rules/{id}/incidents** - 查詢規則產生的所有事件

#### 1.3 批次操作補充

為以下資源補充批次操作：
- AlertRule
- Incident
- NotificationChannel
- Resource (已有 batch-tags，新增 batch-actions)

### 2. 增強驗證邏輯

#### 2.1 外鍵驗證

所有 POST/PATCH 端點驗證外鍵存在性：
```typescript
case 'POST /incidents':
  const { resourceId, ruleId } = body;

  // 驗證 Resource 存在
  const resource = DB.resources.find((r: any) => r.id === resourceId);
  if (!resource) {
    throw { status: 404, message: 'Resource not found.' };
  }

  // 驗證 AlertRule 存在
  const rule = DB.alertRules.find((r: any) => r.id === ruleId);
  if (!rule) {
    throw { status: 404, message: 'Alert rule not found.' };
  }

  // ... 繼續創建
```

#### 2.2 枚舉值驗證

為所有枚舉欄位添加驗證：
```typescript
const VALID_INCIDENT_STATUSES = ['New', 'Acknowledged', 'Resolved', 'Silenced'];
const VALID_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

if (!VALID_INCIDENT_STATUSES.includes(body.status)) {
  throw { status: 400, message: `Invalid status: ${body.status}` };
}
```

#### 2.3 必填欄位驗證

統一使用驗證函數：
```typescript
const validateRequired = (obj: any, fields: string[]) => {
  const missing = fields.filter(f => !obj[f]);
  if (missing.length > 0) {
    throw {
      status: 400,
      message: `Missing required fields: ${missing.join(', ')}`
    };
  }
};

// 使用
validateRequired(body, ['name', 'type', 'provider']);
```

### 3. 時間戳自動管理

#### 3.1 統一時間戳處理

```typescript
const withTimestamps = (obj: any, isCreate: boolean = false) => {
  const now = new Date().toISOString();
  if (isCreate) {
    obj.created_at = now;
  }
  obj.updated_at = now;
  return obj;
};

// POST 使用
const newResource = withTimestamps({ ...body, id: `res-${uuidv4()}` }, true);

// PATCH 使用
DB.resources[index] = withTimestamps({ ...DB.resources[index], ...body });
```

---

## 第三階段：功能完善（P2）

### 1. 匯入/匯出實現

#### 1.1 匯出端點

為以下資源新增匯出功能：
- **GET /incidents/export** - 匯出事件列表（CSV/JSON）
- **GET /alert-rules/export** - 匯出告警規則
- **GET /resources/export** - 匯出資源列表
- **GET /users/export** - 匯出使用者列表

#### 1.2 匯入處理

將現有的 mock 匯入端點改為實際處理：
```typescript
case 'POST /incidents/import':
  const { file } = body; // CSV 內容
  const parsedIncidents = parseCSV(file);

  parsedIncidents.forEach((inc: any) => {
    // 驗證並創建
    const newIncident = { ...inc, id: `INC-${uuidv4()}` };
    DB.incidents.unshift(newIncident);
  });

  return {
    success: true,
    imported: parsedIncidents.length,
    message: `成功匯入 ${parsedIncidents.length} 筆事件。`
  };
```

### 2. Dashboard Template 應用流程

**POST /dashboards/from-template** - 從模板創建儀表板
```typescript
case 'POST /dashboards/from-template':
  const { templateId, name } = body;
  const template = DB.dashboardTemplates.find(t => t.id === templateId);
  if (!template) throw { status: 404 };

  const newDashboard = {
    ...template,
    id: `db-${uuidv4()}`,
    name,
    parentTemplateId: templateId,
    created_at: new Date().toISOString()
  };

  DB.dashboards.unshift(newDashboard);
  return newDashboard;
```

### 3. 權限驗證中間件

```typescript
// 新增 permissions.ts
export const checkPermission = (
  user: User,
  action: string,
  resource: string
): boolean => {
  const role = DB.roles.find(r => r.name === user.role);
  if (!role) return false;

  const requiredPermission = `${resource}:${action}`;
  return role.permissions.includes(requiredPermission) ||
         role.permissions.includes(`${resource}:*`);
};

// 在 handlers 中使用
case 'POST /alert-rules':
  const currentUser = DB.users[0]; // 從 auth token 取得
  if (!checkPermission(currentUser, 'create', 'alert_rules')) {
    throw { status: 403, message: 'Permission denied' };
  }
  // ... 繼續處理
```

---

## 第四階段：進階功能（P3）

### 1. 級聯刪除與依賴檢查

#### 1.1 依賴檢查

刪除前檢查關聯：
```typescript
case 'DELETE /resources/{id}':
  // 檢查是否有 Incident 關聯
  const relatedIncidents = DB.incidents.filter(i => i.resourceId === id);
  if (relatedIncidents.length > 0) {
    throw {
      status: 400,
      message: `Cannot delete resource with ${relatedIncidents.length} active incidents.`
    };
  }

  // 檢查是否有 AlertRule 關聯
  const relatedRules = DB.alertRules.filter(r =>
    r.target_resource_ids?.includes(id)
  );
  if (relatedRules.length > 0) {
    throw {
      status: 400,
      message: `Resource is monitored by ${relatedRules.length} alert rules.`
    };
  }

  // 軟刪除
  const index = DB.resources.findIndex(r => r.id === id);
  if (index > -1) DB.resources[index].deleted_at = new Date().toISOString();
  return {};
```

#### 1.2 級聯軟刪除

刪除 Team 時，自動處理關聯：
```typescript
case 'DELETE /iam/teams/{id}':
  // 軟刪除 Team
  const teamIndex = DB.teams.findIndex(t => t.id === id);
  if (teamIndex > -1) {
    DB.teams[teamIndex].deleted_at = new Date().toISOString();

    // 清除 User 的 teamId
    DB.users.forEach(u => {
      if (u.teamId === id) {
        u.teamId = null;
      }
    });
  }
  return {};
```

### 2. 通知自動發送

#### 2.1 Incident 創建時自動通知

```typescript
const sendNotifications = async (incident: Incident) => {
  // 查找匹配的 NotificationStrategy
  const matchingStrategies = DB.notificationStrategies.filter(s =>
    s.enabled &&
    s.severityLevels.includes(incident.severity.toLowerCase()) &&
    s.impactLevels.includes(incident.impact.toLowerCase())
  );

  for (const strategy of matchingStrategies) {
    const channels = DB.notificationChannels.filter(c =>
      strategy.channel_ids.includes(c.id) && c.enabled
    );

    for (const channel of channels) {
      // 發送通知
      const historyRecord = {
        id: `notif-${uuidv4()}`,
        incident_id: incident.id,
        channel_id: channel.id,
        channel_name: channel.name,
        channel_type: channel.type,
        status: 'success',
        message: incident.summary,
        timestamp: new Date().toISOString()
      };
      DB.notificationHistory.unshift(historyRecord);
    }
  }
};

// 在創建 Incident 時調用
case 'POST /incidents':
  const newIncident = { /* ... */ };
  DB.incidents.unshift(newIncident);

  // 自動發送通知
  await sendNotifications(newIncident);

  return newIncident;
```

### 3. AI 分析結果儲存

```typescript
case 'POST /ai/incidents/analyze':
  const { incident_ids } = body;
  const analysis = incident_ids.length > 1
    ? DB.multiIncidentAnalysis
    : DB.singleIncidentAnalysis;

  // 儲存到 Incident.aiAnalysis
  incident_ids.forEach((incidentId: string) => {
    const index = DB.incidents.findIndex(i => i.id === incidentId);
    if (index > -1) {
      DB.incidents[index].aiAnalysis = analysis;
      DB.incidents[index].updated_at = new Date().toISOString();
    }
  });

  return analysis;
```

---

## 實施優先級總結

| 階段 | 項目 | 預估工作量 | 優先級 | 預期效益 |
|------|------|------------|--------|----------|
| P0 | 補充關鍵外鍵欄位 | 2 天 | 🔴 緊急 | 支援數據血緣追蹤 |
| P0 | 新增 ResourceLink 和 ConfigVersion 表 | 1 天 | 🔴 緊急 | 拓撲與版本控制 |
| P0 | 欄位命名統一化 | 3 天 | 🔴 緊急 | 提升程式碼可維護性 |
| P0 | 軟刪除策略統一 | 2 天 | 🔴 緊急 | 防止資料遺失 |
| P0 | 實現 AuditLog 中間件 | 2 天 | 🔴 緊急 | 稽核合規 |
| P1 | 新增自動觸發 API | 1 天 | 🟡 重要 | 完整事件流程 |
| P1 | 新增反向查詢 API | 1 天 | 🟡 重要 | 支援追溯 |
| P1 | 增強驗證邏輯 | 3 天 | 🟡 重要 | 提升資料品質 |
| P1 | 時間戳自動管理 | 1 天 | 🟡 重要 | 簡化程式碼 |
| P2 | 實現匯入/匯出 | 3 天 | 🟢 建議 | 提升易用性 |
| P2 | Dashboard Template 應用 | 1 天 | 🟢 建議 | 快速配置 |
| P2 | 權限驗證中間件 | 2 天 | 🟢 建議 | 安全性提升 |
| P3 | 級聯刪除與依賴檢查 | 2 天 | ⚪ 未來 | 防止誤刪 |
| P3 | 通知自動發送 | 2 天 | ⚪ 未來 | 完整告警閉環 |
| P3 | AI 分析結果儲存 | 1 天 | ⚪ 未來 | AI 功能完善 |

**總計**：
- P0（緊急）：10 天
- P1（重要）：6 天
- P2（建議）：6 天
- P3（未來）：5 天

**建議實施順序**：
1. 第 1-2 週：P0 緊急修復（建立穩固基礎）
2. 第 3 週：P1 重要補強（完善核心功能）
3. 第 4 週：P2 功能完善（提升易用性）
4. 未來迭代：P3 進階功能（持續優化）

---

## 後續行動

### 1. 立即行動（本週）
- [ ] 與團隊 Review 本文件
- [ ] 確認改進優先級
- [ ] 分配開發任務
- [ ] 建立改進分支

### 2. 驗證機制
- [ ] 為所有改進項目編寫測試案例
- [ ] 建立資料遷移腳本
- [ ] 更新 API 文檔
- [ ] 進行整合測試

### 3. 文件更新
- [ ] 更新 README.md
- [ ] 更新 API 規格（OpenAPI）
- [ ] 更新資料庫 Schema 文件
- [ ] 編寫遷移指南

---

## 附錄：參考文件

1. **api_consistency_issues.md** - API 一致性問題詳細清單
2. **platform_functionality_verification.md** - 平台功能完整性驗證
3. **data_lineage_verification.md** - 數據血緣追蹤驗證
4. **database_schema_analysis.md** - 資料庫結構分析
5. **ai_agent_plan.md** - AI Agent 整合計畫

---

**最後更新**：2025-10-01
**責任人**：SRE Platform Team
**狀態**：已審核
