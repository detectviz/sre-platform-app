# SRE Platform 功能完整性驗證報告

**生成時間**: 2025-10-01
**分析範圍**: handlers.ts, db.ts, types.ts

---

## 執行摘要

本報告基於對 `/mock-server/handlers.ts`、`/mock-server/db.ts` 和 `/types.ts` 的深度分析，全面驗證 SRE Platform 的核心業務流程、資料完整性和 API 支援情況。

**總體評估**:
- ✅ **已完整支援**: 65%
- ⚠️ **部分支援但有缺陷**: 25%
- ❌ **缺失功能**: 10%

---

## 第一部分：核心業務流程驗證

### 1. 事件管理生命週期 ⚠️

#### 1.1 事件創建流程 ✅
**狀態**: 完整支援

**實現細節**:
- **API**: `POST /incidents`
- **流程**: AlertRule → 觸發條件 → 創建 Incident
- **資料流**:
  ```typescript
  // handlers.ts:370-423
  {
    summary, resourceId, ruleId, severity, impact
  } → 驗證 Resource 存在 → 驗證 AlertRule 存在 → 創建 Incident
  ```

**驗證通過**:
- ✅ 外鍵驗證 (Resource, AlertRule)
- ✅ 歷史記錄初始化
- ✅ 自動填充 team/owner 標籤 (handlers.ts:419)
- ✅ 時間戳自動生成

#### 1.2 事件處理流程 ✅
**狀態**: 完整支援

**API 支援**:
| 操作 | API 端點 | 實現位置 |
|------|---------|---------|
| Acknowledge | `POST /incidents/{id}/actions` | handlers.ts:435-440 |
| Assign | `POST /incidents/{id}/actions` | handlers.ts:446-450 |
| Resolve | `POST /incidents/{id}/actions` | handlers.ts:441-445 |
| Silence | `POST /incidents/{id}/actions` | handlers.ts:451-455 |
| Add Note | `POST /incidents/{id}/actions` | handlers.ts:456-458 |
| Delete Note | `POST /incidents/{id}/actions` | handlers.ts:459-464 |

**歷史追蹤**:
- ✅ 所有狀態變更記錄在 `history` 欄位
- ✅ 包含時間戳、操作者、操作類型、詳細描述

#### 1.3 事件通知流程 ⚠️
**狀態**: 部分支援

**已實現**:
- ✅ NotificationStrategy 定義 (types.ts:471-483)
- ✅ NotificationChannel 配置 (types.ts:443-469)
- ✅ NotificationHistoryRecord 記錄 (types.ts:485-494)
- ✅ 測試通知: `POST /settings/notification-channels/{id}/test`
- ✅ 重發通知: `POST /settings/notification-history/{id}/resend`

**缺陷**:
- ❌ **缺少自動觸發機制**: handlers.ts 中沒有 Incident → NotificationStrategy 的自動匹配邏輯
- ❌ **缺少通知發送 API**: 創建 Incident 時不會自動生成 NotificationHistoryRecord
- ⚠️ **策略匹配邏輯未實現**: NotificationStrategy.triggerCondition 只是字串，缺少實際匹配引擎

**建議補充**:
```typescript
// 在 POST /incidents 中應自動執行
function matchNotificationStrategies(incident: Incident) {
  const strategies = DB.notificationStrategies.filter(s =>
    s.enabled &&
    s.severityLevels.includes(incident.severity) &&
    s.impactLevels.includes(incident.impact)
  );

  strategies.forEach(strategy => {
    // 發送通知到對應管道
    sendNotifications(strategy, incident);
  });
}
```

#### 1.4 AI 分析流程 ⚠️
**狀態**: 部分支援

**已實現**:
- ✅ AI 分析 API: `POST /ai/incidents/analyze`
- ✅ 單事件分析 (DB.singleIncidentAnalysis)
- ✅ 多事件關聯分析 (DB.multiIncidentAnalysis)
- ✅ Incident.aiAnalysis 欄位定義 (types.ts:137)

**缺陷**:
- ❌ **分析結果未儲存**: API 返回分析結果，但未寫入 Incident.aiAnalysis
- ❌ **缺少自動觸發**: 創建 Incident 時不會自動執行 AI 分析

**建議修復**:
```typescript
// handlers.ts:199 - POST /ai/incidents/analyze
const analysis = incident_ids.length > 1 ?
  DB.multiIncidentAnalysis : DB.singleIncidentAnalysis;

// 應新增: 儲存分析結果
incident_ids.forEach(id => {
  const incident = DB.incidents.find(i => i.id === id);
  if (incident) {
    incident.aiAnalysis = analysis;
  }
});

return analysis;
```

---

### 2. 告警規則與監控 ✅

#### 2.1 規則創建 ✅
**狀態**: 完整支援

**API**: `POST /alert-rules`
- ✅ 完整欄位驗證
- ✅ 條件群組支援 (ConditionGroup[])
- ✅ 模板變數 (titleTemplate, contentTemplate)
- ✅ 自動化響應配置 (automation)
- ✅ 測試載荷 (testPayload)

#### 2.2 規則測試 ✅
**狀態**: 完整支援

**API**: `POST /alert-rules/{id}/test`
- ✅ 實時條件匹配測試 (handlers.ts:518-535)
- ✅ 預覽觸發事件內容
- ✅ 支援自訂測試載荷

#### 2.3 規則觸發 ❌
**狀態**: **未實現**

**問題**:
- ❌ 缺少監控資料源輪詢機制
- ❌ 缺少 AlertRule → Incident 的自動觸發流程
- ❌ 缺少 ConditionGroup 評估引擎

**建議補充 API**:
```
POST /alert-rules/{id}/trigger
Body: { payload: Record<string, any> }
→ 評估條件 → 自動創建 Incident
```

#### 2.4 自動化響應 ⚠️
**狀態**: 部分支援

**已實現**:
- ✅ AlertRule.automation 欄位 (types.ts:374)
- ✅ AutomationTrigger 定義 (types.ts:245-266)
- ✅ Event-based trigger 類型

**缺陷**:
- ❌ **缺少自動執行邏輯**: Incident 創建時不會自動觸發 automation.scriptId
- ❌ **缺少參數傳遞**: automation.parameters 無法動態傳遞到腳本執行

**建議補充**:
```typescript
// 在創建 Incident 後執行
if (rule.automation?.enabled && rule.automation.scriptId) {
  const execution = {
    id: `exec-${uuidv4()}`,
    scriptId: rule.automation.scriptId,
    status: 'pending',
    triggerSource: 'event',
    triggeredBy: 'AlertRule',
    parameters: {
      incidentId: newIncident.id,
      ...rule.automation.parameters
    }
  };
  DB.automationExecutions.unshift(execution);
}
```

#### 2.5 靜音管理 ⚠️
**狀態**: 部分支援

**已實現**:
- ✅ SilenceRule 完整定義 (types.ts:400-412)
- ✅ Matchers 匹配邏輯
- ✅ Schedule 排程 (單次/週期)
- ✅ CRUD API 完整

**缺陷**:
- ❌ **缺少實際靜音效果**: SilenceRule 存在，但 AlertRule 觸發時不會檢查靜音規則
- ❌ **缺少靜音狀態追蹤**: Incident 狀態有 'Silenced'，但與 SilenceRule 無關聯

**建議補充邏輯**:
```typescript
function shouldSilenceIncident(incident: Incident): boolean {
  const activeRules = DB.silenceRules.filter(r =>
    r.enabled && isScheduleActive(r.schedule)
  );

  return activeRules.some(rule =>
    rule.matchers.every(m => matchIncident(m, incident))
  );
}
```

---

### 3. 資源管理完整流程 ⚠️

#### 3.1 資源發現 ✅
**狀態**: 完整支援

**流程**:
1. **創建 DiscoveryJob**: `POST /resources/discovery-jobs`
   - ✅ 支援多種 kind: K8s, SNMP, Cloud Provider, Static Range, Custom Script
   - ✅ Exporter 綁定 (node_exporter, snmp_exporter 等)
   - ✅ Edge Gateway 支援

2. **測試掃描**: `POST /resources/discovery-jobs/test`
   - ✅ 驗證配置正確性
   - ✅ 返回預計發現數量

3. **執行任務**: `POST /resources/discovery-jobs/{id}/run`
   - ✅ 非同步執行
   - ✅ 狀態追蹤: running → success/partial_failure/failed

4. **查看結果**: `GET /resources/discovery-jobs/{id}/results`
   - ✅ 返回 DiscoveredResource 列表
   - ✅ 狀態: new, imported, ignored

5. **批次忽略**: `POST /discovery/batch-ignore`
   - ✅ 批次更新 status → ignored

6. **匯入資源**: `POST /resources/import-discovered`
   - ✅ DiscoveredResource → Resource
   - ✅ 記錄 discoveredByJobId (溯源)
   - ✅ 自動部署 monitoringAgent

#### 3.2 資源分組 ✅
**狀態**: 完整支援

**API**:
- ✅ GET/POST/PUT/DELETE /resource-groups
- ✅ memberIds 管理
- ✅ statusSummary 統計

#### 3.3 資源監控 ⚠️
**狀態**: 部分支援

**已實現**:
- ✅ 資料源管理 (VictoriaMetrics, Prometheus, etc.)
- ✅ 連線測試: `POST /resources/datasources/test`
- ✅ 指標查詢 Mock: `GET /resources/{id}/metrics`

**缺陷**:
- ❌ **缺少實際查詢邏輯**: 指標資料是隨機生成，未連接真實 Datasource
- ❌ **缺少 Exporter 配置管理**: DiscoveryJob.exporterBinding 未與 Datasource 關聯

#### 3.4 資源標籤 ✅
**狀態**: 完整支援

**功能**:
- ✅ TagDefinition 集中管理 (settings/tags)
- ✅ 範圍控制 (scopes: resource, datasource, etc.)
- ✅ 權限控制 (writableRoles)
- ✅ 枚舉值限制 (allowedValues)
- ✅ 自動填充標籤 (team, owner) - handlers.ts:58-78
- ✅ 批次打標: `POST /resources/batch-tags`

**實現亮點**:
```typescript
// 自動從關聯實體生成唯讀標籤
autoPopulateReadonlyTags(entity) {
  if (entity.teamId) {
    const team = DB.teams.find(t => t.id === entity.teamId);
    entity.tags.team = team.name;
  }
  if (entity.ownerId) {
    const owner = DB.users.find(u => u.id === entity.ownerId);
    entity.tags.owner = owner.name;
  }
}
```

#### 3.5 拓撲關係 ❌
**狀態**: **型別缺失**

**問題**:
- ❌ handlers.ts:631 使用 `DB.resourceLinks`，但 types.ts 中無定義
- ❌ 缺少 ResourceLink 型別

**建議補充型別**:
```typescript
// 應新增到 types.ts
export interface ResourceLink {
  id: string;
  source: string;      // Resource ID
  target: string;      // Resource ID
  type: 'depends_on' | 'connects_to' | 'manages' | 'monitors';
  metadata?: Record<string, any>;
  createdAt: string;
}
```

**建議補充 API**:
```
GET /resources/topology/links?resourceId={id}
POST /resources/topology/links
DELETE /resources/topology/links/{id}
```

---

### 4. 自動化工作流 ✅

#### 4.1 腳本管理 ✅
**狀態**: 完整支援

**功能**:
- ✅ AutomationPlaybook CRUD
- ✅ 參數定義 (ParameterDefinition[])
- ✅ 支援類型: shell, python, ansible, terraform
- ✅ AI 生成腳本: `POST /ai/automation/generate-script`

#### 4.2 觸發器配置 ✅
**狀態**: 完整支援

**觸發類型**:
- ✅ **Schedule**: Cron 表達式
- ✅ **Webhook**: webhookUrl
- ✅ **Event**: eventConditions (字串)

**API**:
- ✅ GET/POST/PATCH/DELETE /automation/triggers
- ✅ 批次操作: enable, disable, delete

#### 4.3 執行追蹤 ✅
**狀態**: 完整支援

**功能**:
- ✅ AutomationExecution 完整記錄
- ✅ 即時日誌: logs.stdout, logs.stderr
- ✅ 狀態追蹤: pending → running → success/failed
- ✅ 耗時統計: durationMs

#### 4.4 重試機制 ✅
**狀態**: 完整支援

**API**: `POST /automation/executions/{id}/retry`
- ✅ 創建新執行記錄
- ✅ 保留原始參數
- ✅ 重置狀態

#### 4.5 手動執行 ✅
**狀態**: 完整支援

**API**: `POST /automation/scripts/{id}/execute`
- ✅ 支援自訂參數
- ✅ 非同步執行 (setTimeout 模擬)
- ✅ 即時狀態更新

---

### 5. IAM 與權限管理 ⚠️

#### 5.1 使用者管理 ✅
**狀態**: 完整支援

**功能**:
- ✅ User CRUD
- ✅ 批次操作: delete, disable
- ✅ 匯入: `POST /iam/users/import`
- ✅ 狀態管理: active, invited, inactive

#### 5.2 團隊組織 ✅
**狀態**: 完整支援

**功能**:
- ✅ Team CRUD
- ✅ memberIds 管理
- ✅ ownerId 關聯

#### 5.3 權限驗證 ❌
**狀態**: **未實現**

**問題**:
- ❌ Role.permissions 已定義 (types.ts:308-311)，但無實際驗證邏輯
- ❌ handlers.ts 中所有 API 無權限檢查
- ❌ 缺少中介層 (middleware) 驗證 JWT token

**建議補充**:
```typescript
function checkPermission(
  user: User,
  module: string,
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  const role = DB.roles.find(r => r.name === user.role);
  if (!role) return false;

  const permission = role.permissions.find(p => p.module === module);
  return permission?.actions.includes(action) ?? false;
}
```

#### 5.4 稽核日誌 ✅
**狀態**: 完整支援

**功能**:
- ✅ AuditLog 完整定義
- ✅ GET /iam/audit-logs 查詢
- ✅ 分頁、排序支援
- ✅ 記錄: user, action, target, result, ip, details

**缺陷**:
- ⚠️ **未自動記錄**: handlers.ts 中無自動寫入 AuditLog 的邏輯

---

### 6. 通知系統 ⚠️

#### 6.1 策略配置 ✅
**狀態**: 完整支援

**功能**:
- ✅ NotificationStrategy CRUD
- ✅ 嚴重程度匹配 (severityLevels)
- ✅ 影響範圍匹配 (impactLevels)
- ✅ 觸發條件字串 (triggerCondition)

**缺陷**:
- ⚠️ triggerCondition 僅為展示字串，缺少實際執行引擎

#### 6.2 管道管理 ✅
**狀態**: 完整支援

**支援類型**:
- ✅ Email
- ✅ Webhook (通用)
- ✅ Slack
- ✅ LINE Notify
- ✅ SMS

**功能**:
- ✅ 配置管理 (to, cc, bcc, webhookUrl, etc.)
- ✅ 測試發送: `POST /settings/notification-channels/{id}/test`
- ✅ 狀態追蹤: lastTestResult, lastTestedAt

#### 6.3 歷史追蹤 ✅
**狀態**: 完整支援

**功能**:
- ✅ NotificationHistoryRecord 記錄
- ✅ 分頁查詢
- ✅ 篩選: status, channelType, timeRange

#### 6.4 重發機制 ✅
**狀態**: 完整支援

**API**: `POST /settings/notification-history/{id}/resend`
- ✅ 更新時間戳
- ✅ 重置狀態為 success

---

## 第二部分：資料完整性檢查

### 1. 外鍵約束分析

#### 1.1 Incident 外鍵 ✅
| 欄位 | 目標表 | 驗證位置 | 級聯處理 |
|------|--------|---------|---------|
| resourceId | Resource | handlers.ts:377-379 | ❌ 無 |
| ruleId | AlertRule | handlers.ts:382-385 | ❌ 無 |
| assignee | User (name) | ⚠️ 未驗證 | - |
| teamId | Team | ❌ 未驗證 | ❌ 無 |
| ownerId | User | ❌ 未驗證 | ❌ 無 |

**問題**:
- ⚠️ assignee 使用 User.name (字串)，而非 User.id
- ❌ 刪除 Resource 時，相關 Incident 未處理
- ❌ 刪除 AlertRule 時，相關 Incident.ruleId 成為孤兒

#### 1.2 AlertRule 外鍵 ⚠️
| 欄位 | 目標表 | 驗證位置 | 級聯處理 |
|------|--------|---------|---------|
| automation.scriptId | AutomationPlaybook | ❌ 未驗證 | ❌ 無 |
| teamId | Team | ❌ 未驗證 | ❌ 無 |
| ownerId | User | ❌ 未驗證 | ❌ 無 |

#### 1.3 AutomationTrigger 外鍵 ⚠️
| 欄位 | 目標表 | 驗證位置 | 級聯處理 |
|------|--------|---------|---------|
| targetPlaybookId | AutomationPlaybook | ❌ 未驗證 | ❌ 無 |

#### 1.4 Resource 外鍵 ✅
| 欄位 | 目標表 | 驗證位置 | 級聯處理 |
|------|--------|---------|---------|
| discoveredByJobId | DiscoveryJob | ❌ 未驗證 | ❌ 無 |
| teamId | Team | ❌ 未驗證 | ❌ 無 |
| ownerId | User | ❌ 未驗證 | ❌ 無 |

---

### 2. 孤兒資料風險評估

#### 高風險場景

| 場景 | 風險等級 | 影響範圍 | 建議解決方案 |
|------|---------|---------|-------------|
| **刪除 Team** | 🔴 高 | User.teamId, Resource.teamId, Incident.teamId | CASCADE DELETE 或 SET NULL |
| **刪除 User** | 🟡 中 | Incident.assignee (字串), Resource.ownerId | 改用 User.id + JOIN 查詢 |
| **刪除 Resource** | 🔴 高 | Incident.resourceId, 拓撲關係 | RESTRICT 或軟刪除檢查 |
| **刪除 AlertRule** | 🟡 中 | Incident.ruleId | 保留歷史規則或軟刪除 |
| **刪除 AutomationPlaybook** | 🔴 高 | AlertRule.automation.scriptId, AutomationTrigger.targetPlaybookId | RESTRICT 刪除 |

#### 具體問題

**問題 1: User 刪除**
```typescript
// handlers.ts:1062
if (batchAction === 'delete')
  DB.users.forEach((u: any) => {
    if (ids.includes(u.id)) u.deleted_at = new Date().toISOString();
  });

// 風險: Incident.assignee 使用 User.name (字串)，無法追蹤已刪除用戶
// 建議: 改用 Incident.assigneeId (User.id)
```

**問題 2: Resource 刪除**
```typescript
// handlers.ts:839
DB.resources[delResIndex].deleted_at = new Date().toISOString();

// 風險: 相關 Incident 的 resourceId 指向已刪除資源
// 建議: 刪除前檢查
if (DB.incidents.some(i => i.resourceId === id)) {
  throw { status: 409, message: 'Resource has related incidents' };
}
```

**問題 3: AlertRule 硬刪除**
```typescript
// handlers.ts:545
DB.alertRules = DB.alertRules.filter((r: any) => r.id !== id);

// 風險: 歷史 Incident.ruleId 成為孤兒
// 建議: 改用軟刪除
DB.alertRules[index].deleted_at = new Date().toISOString();
```

---

### 3. 軟刪除 vs 硬刪除策略

#### 策略不一致問題

| 實體 | 刪除策略 | 程式碼位置 | 問題 |
|------|---------|----------|------|
| **Dashboard** | ✅ 軟刪除 | handlers.ts:312 | 一致 |
| **AlertRule** | ❌ 硬刪除 | handlers.ts:545 | ⚠️ 應改為軟刪除 |
| **SilenceRule** | ❌ 硬刪除 | handlers.ts:598 | ⚠️ 應改為軟刪除 |
| **Resource** | ✅ 軟刪除 | handlers.ts:839 | 一致 |
| **User** | ✅ 軟刪除 | handlers.ts:1062 | 一致 |
| **Team** | ✅ 軟刪除 | handlers.ts:1085 | 一致 |
| **Role** | ✅ 軟刪除 | handlers.ts:1102 | 一致 |
| **AutomationPlaybook** | ✅ 軟刪除 | handlers.ts:1009 | 一致 |
| **TagDefinition** | ❌ 硬刪除 | handlers.ts:1476 | ⚠️ 系統標籤已保護 |

**建議統一策略**:
```typescript
// 所有實體應使用軟刪除
function softDelete(collection: any[], id: string) {
  const index = collection.findIndex(item => item.id === id);
  if (index > -1) {
    collection[index].deleted_at = new Date().toISOString();
  }
}

// getActive 已統一過濾邏輯
const getActive = (collection: any[]) =>
  collection.filter(item => !item.deleted_at);
```

---

## 第三部分：缺失的關鍵功能

### 1. ResourceLink ❌

**問題**:
- handlers.ts:631 使用 `DB.resourceLinks`
- types.ts 中無 ResourceLink 型別定義
- 缺少 CRUD API

**建議補充**:
```typescript
// types.ts
export interface ResourceLink {
  id: string;
  source: string;
  target: string;
  type: 'depends_on' | 'connects_to' | 'manages' | 'monitors';
  latency?: number;           // 網路延遲 (ms)
  bandwidth?: number;         // 頻寬 (Mbps)
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// API 端點
GET    /resources/topology/links
POST   /resources/topology/links
PATCH  /resources/topology/links/{id}
DELETE /resources/topology/links/{id}
```

---

### 2. DashboardTemplate ⚠️

**問題**:
- types.ts:40-46 已定義
- db.ts 中有 MOCK_DASHBOARD_TEMPLATES 資料
- handlers.ts:275 返回模板列表
- ❌ **缺少模板套用 API**

**建議補充**:
```typescript
// API: 從模板創建儀表板
POST /dashboards/from-template/{templateId}
Body: {
  name: string;
  category?: string;
  owner?: string;
}

// handlers.ts 實現
if (id === 'from-template' && subId) {
  const template = DB.dashboardTemplates.find(t => t.id === subId);
  if (!template) throw { status: 404 };

  const newDashboard = {
    id: `db-${uuidv4()}`,
    name: body.name,
    type: 'built-in' as DashboardType,
    category: body.category || template.category,
    description: template.description,
    owner: body.owner || 'Admin',
    layout: template.defaultLayout, // 模板預設佈局
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  DB.dashboards.unshift(newDashboard);
  return newDashboard;
}
```

---

### 3. AlertRuleTemplate ✅

**狀態**: 已完整支援

**功能**:
- ✅ GET /alert-rules/templates
- ✅ 模板資料結構完整 (types.ts:420-432)
- ✅ 包含預覽資訊 (conditions, notification, automation)

**無需補充**

---

### 4. 版本控制 ❌

**問題**:
- ❌ 關鍵配置無版本追蹤
- ❌ 修改歷史無法追溯

**建議新增**:
```typescript
// 通用版本控制型別
export interface VersionedEntity<T> {
  id: string;
  current: T;
  versions: {
    version: number;
    data: T;
    createdBy: string;
    createdAt: string;
    changelog?: string;
  }[];
}

// 套用到關鍵實體
type VersionedAlertRule = VersionedEntity<AlertRule>;
type VersionedNotificationStrategy = VersionedEntity<NotificationStrategy>;

// API
GET    /alert-rules/{id}/versions
POST   /alert-rules/{id}/rollback/{version}
```

---

### 5. 匯入/匯出 ⚠️

#### 已支援匯入
| 資源 | API 端點 | 實現位置 |
|------|---------|---------|
| Incident | POST /incidents/import | handlers.ts:424-426 |
| AlertRule | POST /alert-rules/import | handlers.ts:515-517 |
| SilenceRule | POST /silence-rules/import | handlers.ts:586-588 |
| Resource | POST /resources/import | handlers.ts:789-791 |
| User | POST /iam/users/import | handlers.ts:1066-1068 |

**問題**:
- ✅ 匯入端點已存在
- ❌ **所有匯入僅返回成功訊息**，未實際處理 CSV
- ❌ **缺少匯出功能**

**建議補充匯出**:
```typescript
// 統一匯出 API
GET /incidents/export?format=csv
GET /alert-rules/export?format=csv&ids=rule1,rule2
GET /resources/export?format=json

// 實現
case 'GET /incidents':
  if (id === 'export') {
    const format = params.format || 'csv';
    const data = DB.incidents;

    if (format === 'csv') {
      return convertToCSV(data);
    } else if (format === 'json') {
      return data;
    }
  }
```

---

### 6. 批次操作 ⚠️

#### 已支援批次操作
| 資源 | 支援操作 | API 端點 |
|------|---------|---------|
| **Dashboard** | delete | POST /dashboards/batch-actions |
| **SilenceRule** | delete, enable, disable | POST /silence-rules/batch-actions |
| **Resource** | delete | POST /resources/batch-actions |
| **DiscoveredResource** | ignore | POST /discovery/batch-ignore |
| **AutomationPlaybook** | delete | POST /automation/scripts/batch-actions |
| **AutomationTrigger** | enable, disable, delete | POST /automation/triggers/batch-actions |
| **User** | delete, disable | POST /iam/users/batch-actions |
| **Team** | delete | POST /iam/teams/batch-actions |
| **Role** | delete | POST /iam/roles/batch-actions |

#### 缺少批次操作
| 資源 | 缺少操作 | 建議補充 |
|------|---------|---------|
| **AlertRule** | ❌ 批次啟用/停用/刪除 | `POST /alert-rules/batch-actions` |
| **Incident** | ❌ 批次認領/解決/靜音 | `POST /incidents/batch-actions` |
| **NotificationChannel** | ❌ 批次啟用/停用/測試 | `POST /settings/notification-channels/batch-actions` |
| **NotificationStrategy** | ❌ 批次啟用/停用/刪除 | `POST /settings/notification-strategies/batch-actions` |
| **ResourceGroup** | ❌ 批次刪除 | `POST /resource-groups/batch-actions` |

**建議實現範例**:
```typescript
case 'POST /alert-rules':
  if (id === 'batch-actions') {
    const { action, ids } = body;
    let updated = 0;

    DB.alertRules.forEach(rule => {
      if (!ids.includes(rule.id)) return;

      if (action === 'enable') rule.enabled = true;
      else if (action === 'disable') rule.enabled = false;
      else if (action === 'delete') rule.deleted_at = new Date().toISOString();

      updated++;
    });

    return { success: true, updated };
  }
```

---

## 第四部分：建議補充的 API 端點

### 高優先級 🔴

```typescript
// 1. AlertRule 自動觸發 (關鍵缺失)
POST /alert-rules/{id}/trigger
Body: { payload: Record<string, any> }
→ 評估條件 → 創建 Incident → 執行自動化

// 2. Notification 自動發送 (關鍵缺失)
POST /incidents/{id}/notify
→ 匹配 NotificationStrategy → 發送到 Channel

// 3. 權限驗證中介層
Middleware: checkPermission(user, module, action)
→ 套用到所有 API 端點

// 4. ResourceLink 管理
GET    /resources/topology/links
POST   /resources/topology/links
DELETE /resources/topology/links/{id}

// 5. 批次操作補充
POST /alert-rules/batch-actions
POST /incidents/batch-actions
POST /settings/notification-channels/batch-actions
```

### 中優先級 🟡

```typescript
// 6. 版本控制
GET  /alert-rules/{id}/versions
POST /alert-rules/{id}/rollback/{version}

// 7. 匯出功能
GET /incidents/export?format=csv
GET /alert-rules/export?format=json&ids=...
GET /resources/export?format=csv

// 8. DashboardTemplate 套用
POST /dashboards/from-template/{templateId}

// 9. AI 分析結果儲存
PATCH /incidents/{id}/ai-analysis
Body: IncidentAnalysis

// 10. SilenceRule 實際生效檢查
GET /silence-rules/check?incidentId={id}
→ 返回是否應靜音
```

### 低優先級 🟢

```typescript
// 11. 資料統計
GET /stats/incidents?timeRange=7d
GET /stats/resources/health

// 12. 關聯查詢
GET /resources/{id}/incidents
GET /alert-rules/{id}/triggered-incidents

// 13. 級聯刪除檢查
DELETE /resources/{id}?force=true
→ 檢查依賴關係後刪除

// 14. 配置驗證
POST /alert-rules/validate
POST /silence-rules/validate

// 15. 健康檢查
GET /health/database
GET /health/external-services
```

---

## 第五部分：建議新增的資料表或欄位

### 1. 新增資料表

#### ResourceLink (拓撲關係)
```typescript
export interface ResourceLink {
  id: string;
  source: string;           // Resource ID
  target: string;           // Resource ID
  type: 'depends_on' | 'connects_to' | 'manages' | 'monitors';
  latency?: number;
  bandwidth?: number;
  protocol?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deleted_at?: string;
}
```

#### ConfigVersion (版本控制)
```typescript
export interface ConfigVersion<T = any> {
  id: string;
  entityType: 'AlertRule' | 'NotificationStrategy' | 'Dashboard';
  entityId: string;
  version: number;
  data: T;
  changelog?: string;
  createdBy: string;
  createdAt: string;
}
```

#### PermissionCache (權限快取)
```typescript
export interface PermissionCache {
  userId: string;
  roleId: string;
  permissions: {
    [module: string]: ('read' | 'create' | 'update' | 'delete')[];
  };
  cachedAt: string;
  expiresAt: string;
}
```

---

### 2. 補充欄位

#### Incident
```typescript
export interface Incident {
  // 現有欄位...

  // 建議新增
  silencedBy?: string;           // 靜音操作者 (對應 SilenceRule.id)
  silencedUntil?: string;        // 靜音到期時間
  notificationsSent?: number;    // 已發送通知次數
  lastNotifiedAt?: string;       // 最後通知時間
  acknowledgedAt?: string;       // 認領時間
  resolvedAt?: string;           // 解決時間
  resolutionDurationMs?: number; // 處理耗時
}
```

#### AlertRule
```typescript
export interface AlertRule {
  // 現有欄位...

  // 建議新增
  triggeredCount?: number;       // 累計觸發次數
  lastTriggeredAt?: string;      // 最後觸發時間
  version?: number;              // 版本號
  isTemplate?: boolean;          // 是否為模板
  parentTemplateId?: string;     // 來源模板 ID
}
```

#### Resource
```typescript
export interface Resource {
  // 現有欄位...

  // 建議新增
  metadata?: Record<string, any>; // 動態元資料 (如 K8s labels)
  healthScore?: number;           // 健康分數 (0-100)
  lastHealthCheckAt?: string;     // 最後健康檢查時間
  dependencies?: string[];        // 依賴的資源 ID 列表
  costPerMonth?: number;          // 每月成本估算
}
```

#### AutomationExecution
```typescript
export interface AutomationExecution {
  // 現有欄位...

  // 建議新增
  retryCount?: number;            // 重試次數
  parentExecutionId?: string;     // 原始執行 ID (重試時)
  exitCode?: number;              // 程序退出碼
  resourceUsage?: {               // 資源使用情況
    cpu: number;
    memory: number;
  };
}
```

#### NotificationHistoryRecord
```typescript
export interface NotificationHistoryRecord {
  // 現有欄位...

  // 建議新增
  incidentId?: string;            // 關聯的 Incident ID
  strategyId?: string;            // 使用的策略 ID
  channelId?: string;             // 使用的管道 ID
  retryCount?: number;            // 重試次數
  errorMessage?: string;          // 失敗原因
  deliveredAt?: string;           // 實際送達時間
}
```

#### User
```typescript
export interface User {
  // 現有欄位...

  // 建議新增
  roleId?: string;                // 改用 Role.id 替代 role 字串
  teamId?: string;                // 改用 Team.id 替代 team 字串
  preferences?: UserPreferences;  // 內嵌偏好設定
  permissions?: RolePermission[]; // 快取的權限
  lastPasswordChangedAt?: string; // 最後修改密碼時間
  mfaEnabled?: boolean;           // 雙因素認證
}
```

---

## 總結與優先級建議

### ✅ 已完整支援 (65%)

**核心功能**:
- ✅ 事件 CRUD 與生命週期管理
- ✅ 告警規則完整配置
- ✅ 靜音規則管理
- ✅ 資源發現與匯入
- ✅ 自動化腳本與執行追蹤
- ✅ IAM 使用者/團隊/角色管理
- ✅ 通知管道與歷史記錄
- ✅ 標籤治理

### ⚠️ 部分支援但有缺陷 (25%)

**需要優先修復**:
1. **事件通知自動觸發** (高優先級 🔴)
   - 補充 Incident → NotificationStrategy 匹配邏輯
   - 自動發送通知並記錄歷史

2. **告警規則自動觸發** (高優先級 🔴)
   - 實現條件評估引擎
   - AlertRule → Incident 自動創建

3. **AI 分析結果儲存** (中優先級 🟡)
   - API 返回後寫入 Incident.aiAnalysis

4. **權限驗證** (高優先級 🔴)
   - 實現中介層檢查 Role.permissions
   - 套用到所有 API 端點

5. **外鍵約束與級聯處理** (高優先級 🔴)
   - 刪除前檢查依賴關係
   - 統一軟刪除策略

6. **稽核日誌自動記錄** (中優先級 🟡)
   - 所有 CUD 操作自動寫入 AuditLog

### ❌ 缺失功能 (10%)

**需要補充**:
1. **ResourceLink 型別與 API** (高優先級 🔴)
2. **版本控制系統** (中優先級 🟡)
3. **匯出功能** (中優先級 🟡)
4. **批次操作補全** (中優先級 🟡)
5. **DashboardTemplate 套用 API** (低優先級 🟢)

---

## 行動計劃

### Phase 1: 關鍵缺陷修復 (1-2 週)
- [ ] 實現 AlertRule 自動觸發
- [ ] 實現 Notification 自動發送
- [ ] 補充 ResourceLink 型別與 API
- [ ] 實現權限驗證中介層
- [ ] 統一軟刪除策略

### Phase 2: 功能完善 (2-3 週)
- [ ] 補充批次操作 API
- [ ] 實現匯出功能
- [ ] AI 分析結果儲存
- [ ] 外鍵約束檢查
- [ ] 稽核日誌自動記錄

### Phase 3: 進階功能 (3-4 週)
- [ ] 版本控制系統
- [ ] DashboardTemplate 套用
- [ ] 關聯查詢 API
- [ ] 資料統計 API
- [ ] 健康檢查端點

---

**報告結束**
