# AI 提示詞：完善 SRE Platform 骨架

> 使用這些提示詞系統化地完善平台架構
>
> **使用方式**：依序執行，每個提示詞專注於單一任務

---

## 🎯 Prompt 1: 補充型別定義（優先級：P0）

### 目標
補充 `types.ts` 中缺失的欄位定義，確保與 handlers.ts 的使用一致。

### 提示詞

```
請分析 ./mock-server/handlers.ts 和 ./types.ts，完成以下任務：

## 任務目標
補充 types.ts 中缺失的型別欄位定義，確保與 handlers.ts 的實際使用一致。

## 需要補充的欄位

### AutomationExecution
在 handlers.ts 中使用但 types.ts 缺少定義：
- Line 380: `e.incidentId === id` - 需要 incidentId?: string
- 建議新增: alertRuleId?: string（用於追蹤觸發來源）

### AlertRule
在 handlers.ts 中使用但 types.ts 缺少定義：
- Line 717: `r.targetResourceIds?.includes(id)` - 需要 targetResourceIds?: string[]
- 建議新增:
  - triggeredCount?: number（觸發次數統計）
  - version?: number（版本控制）

### Incident
建議新增以下欄位以支援完整生命週期管理：
- silencedBy?: string（執行靜音的使用者）
- notificationsSent?: NotificationRecord[]（已發送的通知記錄）
- acknowledgedAt?: string（確認時間）
- resolvedAt?: string（解決時間）

### Resource
- datasourceId?: string（關聯的資料來源 ID）

### Dashboard
- resourceIds?: string[]（關聯的資源 ID 列表）

### NotificationStrategy
- channelIds?: string[]（關聯的管道 ID 列表）

### NotificationHistoryRecord
- incidentId?: string（關聯的事件 ID）

## 執行要求

1. **檢查現有定義**
   - 閱讀 types.ts 中的現有型別定義
   - 確認哪些欄位已存在，哪些需要新增

2. **補充缺失欄位**
   - 為每個型別補充上述缺失的欄位
   - 使用正確的 TypeScript 語法
   - 添加 JSDoc 註解說明欄位用途

3. **保持一致性**
   - 時間戳欄位使用 `string`（ISO 8601 格式）
   - 可選欄位使用 `?:`
   - 陣列欄位使用 `Type[]` 格式

4. **輸出格式**
   - 使用 Edit tool 更新 types.ts
   - 僅修改需要補充的部分，保持其他內容不變

## 範例

```typescript
export interface AutomationExecution {
  // ... 現有欄位

  // 新增欄位
  incidentId?: string;       // 關聯的事件 ID（觸發來源）
  alertRuleId?: string;      // 觸發的告警規則 ID
}

export interface AlertRule {
  // ... 現有欄位

  // 新增欄位
  targetResourceIds?: string[];  // 目標資源 ID 列表
  triggeredCount?: number;       // 觸發次數統計
  version?: number;              // 配置版本號
}
```

請開始執行，使用 Read tool 閱讀檔案，使用 Edit tool 更新 types.ts。
```

---

## 🎯 Prompt 2: 統一命名規範為 snake_case（優先級：P0）

### 目標
將所有時間戳欄位統一改為 snake_case，確保命名一致性。

### 提示詞

```
請統一 SRE Platform 專案中的時間戳欄位命名規範，從混用的 camelCase 改為統一的 snake_case。

## 背景說明
目前專案存在命名不一致的問題：
- created_at, updated_at (snake_case) ✅
- deleted_at, occurredAt, lastLoginAt (camelCase) ❌

需要統一為 snake_case 以符合資料庫慣例。

## 任務目標

### 1. 更新 types.ts
需要重命名的欄位：
- deleted_at → deleted_at
- occurredAt → occurred_at
- lastLoginAt → last_login_at
- lastCheckIn → last_check_in
- lastRun → last_run
- lastUpdated → last_updated
- lastTestResult → last_test_result
- lastTestedAt → last_tested_at

### 2. 更新 mock-server/handlers.ts
將所有使用上述欄位的地方改為 snake_case：
- 讀取: `item.deleted_at` → `item.deleted_at`
- 寫入: `deleted_at: new Date().toISOString()`
- 過濾函數已正確使用 `!item.deleted_at`，改為 `!item.deleted_at`

### 3. 更新 mock-server/db.ts
- 初始化資料時使用 snake_case
- 確保所有 mock 資料的時間戳欄位一致

## 執行步驟

1. **先備份（可選）**
   ```bash
   git add -A
   git commit -m "Before: unify timestamp naming"
   ```

2. **閱讀檔案**
   - Read types.ts
   - Read handlers.ts
   - Read db.ts

3. **執行替換**
   使用 Edit tool 系統化地替換：

   ```typescript
   // types.ts 範例
   export interface Resource {
     // ... 其他欄位
     lastCheckIn: string;        // 舊
     last_check_in: string;      // 新
     deleted_at?: string;        // 統一為 snake_case
   }

   // handlers.ts 範例
   // 舊
   if (item.deleted_at) { ... }
   item.lastLoginAt = timestamp;

   // 新
   if (item.deleted_at) { ... }
   item.last_login_at = timestamp;
   ```

4. **特別注意**
   - getActive 函數: `!item.deleted_at` → `!item.deleted_at`
   - 所有軟刪除操作: `.deleted_at =` → `.deleted_at =`
   - User 的 lastLoginAt 欄位
   - DiscoveryJob 的 lastRun 欄位
   - NotificationChannel 的 lastTestResult, lastTestedAt

5. **驗證**
   完成後執行：
   ```bash
   cd mock-server
   npm run build
   ```
   確保沒有 TypeScript 編譯錯誤。

## 注意事項
- 這是大範圍的重構，請逐檔案處理
- 使用 Edit tool 的 replace_all 功能提高效率
- 完成後需要同步更新前端元件（不在此任務範圍）

請開始執行。
```

---

## 🎯 Prompt 3: 擴展 AuditLog 覆蓋到所有實體（優先級：P0）

### 目標
為所有 CRUD 操作添加 auditLog 記錄，從 20% 提升到 100%。

### 提示詞

```
請為 SRE Platform 的所有變更操作添加 AuditLog 記錄，實現完整的稽核追蹤。

## 背景
目前 auditLog 僅應用於：
- AlertRule (CREATE, UPDATE, DELETE) ✅
- Resource (CREATE, UPDATE, DELETE) ✅
- Incident (CREATE, NOTIFY) ✅

其他 12 個實體尚未實現 auditLog。

## 任務目標
為以下實體的所有 CRUD 操作添加 auditLogMiddleware 調用。

### 需要添加 AuditLog 的實體（按優先級）

#### 第一優先（核心配置）
1. **Dashboard** - POST, PATCH, DELETE
2. **SilenceRule** - POST, PATCH, DELETE
3. **NotificationStrategy** - POST, PATCH, DELETE
4. **NotificationChannel** - POST, PATCH, DELETE

#### 第二優先（IAM）
5. **User** - POST, PATCH, DELETE
6. **Team** - POST, PATCH, DELETE
7. **Role** - POST, PATCH, DELETE

#### 第三優先（自動化與資源）
8. **AutomationPlaybook** - POST, PATCH, DELETE
9. **AutomationTrigger** - POST, PATCH, DELETE
10. **ResourceGroup** - POST, PUT, DELETE
11. **Datasource** - POST, PATCH, DELETE
12. **DiscoveryJob** - POST, PATCH, DELETE

#### 第四優先（完善現有）
13. **Incident** - PATCH（狀態變更）, DELETE
14. **ResourceLink** - POST, PATCH, DELETE
15. **TagDefinition** - POST, PATCH, DELETE

## 執行模板

### CREATE 操作
```typescript
case 'POST /entity-name':
  const timestamp = new Date().toISOString();
  const newEntity = {
    ...body,
    id: \`prefix-\${uuidv4()}\`,
    created_at: timestamp,
    updated_at: timestamp
  };
  DB.entities.unshift(newEntity);

  // 新增 AuditLog
  const currentUser = getCurrentUser();
  auditLogMiddleware(
    currentUser.id,
    'CREATE',
    'EntityName',
    newEntity.id,
    {
      name: newEntity.name,
      // 其他關鍵欄位
    }
  );

  return newEntity;
```

### UPDATE 操作
```typescript
case 'PATCH /entity-name':
  const index = DB.entities.findIndex((e: any) => e.id === id);
  if (index === -1) throw { status: 404 };

  const oldEntity = { ...DB.entities[index] };
  DB.entities[index] = {
    ...DB.entities[index],
    ...body,
    updated_at: new Date().toISOString()
  };

  // 新增 AuditLog
  const currentUser = getCurrentUser();
  auditLogMiddleware(
    currentUser.id,
    'UPDATE',
    'EntityName',
    id,
    {
      oldName: oldEntity.name,
      newName: body.name,
      // 記錄變更的關鍵欄位
    }
  );

  return DB.entities[index];
```

### DELETE 操作（軟刪除）
```typescript
case 'DELETE /entity-name':
  const index = DB.entities.findIndex((e: any) => e.id === id);
  if (index > -1) {
    const entity = DB.entities[index];
    DB.entities[index].deleted_at = new Date().toISOString();

    // 新增 AuditLog
    const currentUser = getCurrentUser();
    auditLogMiddleware(
      currentUser.id,
      'DELETE',
      'EntityName',
      id,
      {
        name: entity.name,
        // 保留被刪除項目的關鍵資訊
      }
    );
  }
  return {};
```

### 批次操作
```typescript
case 'POST /entity-name/batch-actions':
  const { action, ids } = body;
  const currentUser = getCurrentUser();

  ids.forEach((itemId: string) => {
    const index = DB.entities.findIndex((e: any) => e.id === itemId);
    if (index === -1) return;

    const entity = DB.entities[index];

    if (action === 'delete') {
      DB.entities[index].deleted_at = new Date().toISOString();

      // 為每個項目記錄 AuditLog
      auditLogMiddleware(
        currentUser.id,
        'DELETE',
        'EntityName',
        itemId,
        { name: entity.name }
      );
    }
    // ... 其他 action
  });

  return { success: true };
```

## 執行步驟

1. **閱讀現有實現**
   ```
   Read handlers.ts (lines 536-610)
   ```
   參考 AlertRule 的 auditLog 實現模式。

2. **逐實體添加**
   按上述優先級順序，為每個實體添加 auditLog。

3. **測試驗證**
   完成後執行：
   ```bash
   cd mock-server
   npm run build
   node server.js
   ```

   測試任一變更操作，檢查 DB.auditLogs 是否有新記錄。

4. **驗證端點**
   ```bash
   curl http://localhost:4000/api/v1/iam/audit-logs
   ```
   確認 auditLog 正確記錄。

## 關鍵細節記錄

每個 auditLog 應記錄的關鍵資訊：
- **Dashboard**: name, type, category
- **User**: name, email, role
- **Team**: name, memberIds.length
- **Role**: name, permissions.length
- **AutomationPlaybook**: name, type
- **NotificationChannel**: name, type, enabled
- **AlertRule**: name, severity, enabled
- **Resource**: name, type, status

## 預期結果
完成後：
- AuditLog 覆蓋率：20% → 100%
- 所有 CREATE/UPDATE/DELETE 操作都有審計記錄
- 批次操作也有詳細記錄
- 可追溯誰在何時做了什麼變更

請開始執行，優先處理第一優先的 4 個實體。
```

---

## 🎯 Prompt 4: 添加外鍵驗證（優先級：P1）

### 目標
為所有外鍵關聯添加存在性驗證，防止資料不一致。

### 提示詞

```
請為 SRE Platform 的所有外鍵關聯添加存在性驗證，確保資料完整性。

## 背景
目前僅 POST /incidents 有完整的外鍵驗證（resourceId, ruleId）。
其他端點缺少驗證，可能導致孤兒資料。

## 任務目標
為以下操作添加外鍵驗證。

### 需要驗證的端點

#### Dashboard (POST, PATCH)
```typescript
// 驗證項目
if (body.teamId) {
  const team = DB.teams.find(t => t.id === body.teamId && !t.deleted_at);
  if (!team) {
    throw { status: 404, message: 'Team not found.' };
  }
}

if (body.ownerId) {
  const owner = DB.users.find(u => u.id === body.ownerId && !u.deleted_at);
  if (!owner) {
    throw { status: 404, message: 'Owner (user) not found.' };
  }
}

if (body.resourceIds && Array.isArray(body.resourceIds)) {
  const invalidIds = body.resourceIds.filter(rid =>
    !DB.resources.find(r => r.id === rid && !r.deleted_at)
  );
  if (invalidIds.length > 0) {
    throw {
      status: 404,
      message: \`Resources not found: \${invalidIds.join(', ')}\`
    };
  }
}
```

#### AlertRule (POST, PATCH)
```typescript
// 驗證 automation.playbookId
if (body.automation?.enabled && body.automation?.playbookId) {
  const playbook = DB.playbooks.find(p =>
    p.id === body.automation.playbookId && !p.deleted_at
  );
  if (!playbook) {
    throw {
      status: 404,
      message: 'Automation playbook not found.'
    };
  }
}

// 驗證 targetResourceIds
if (body.targetResourceIds && Array.isArray(body.targetResourceIds)) {
  const invalidIds = body.targetResourceIds.filter(rid =>
    !DB.resources.find(r => r.id === rid && !r.deleted_at)
  );
  if (invalidIds.length > 0) {
    throw {
      status: 404,
      message: \`Target resources not found: \${invalidIds.join(', ')}\`
    };
  }
}
```

#### AutomationExecution (POST /automation/scripts/{id}/execute)
```typescript
// 驗證 scriptId
const script = DB.playbooks.find(p => p.id === scriptId && !p.deleted_at);
if (!script) {
  throw { status: 404, message: 'Automation playbook not found.' };
}

// 如果關聯 Incident
if (body.incidentId) {
  const incident = DB.incidents.find(i => i.id === body.incidentId);
  if (!incident) {
    throw { status: 404, message: 'Incident not found.' };
  }
}
```

#### Resource (POST, PATCH)
```typescript
// 驗證 datasourceId
if (body.datasourceId) {
  const datasource = DB.datasources.find(d =>
    d.id === body.datasourceId && !d.deleted_at
  );
  if (!datasource) {
    throw { status: 404, message: 'Datasource not found.' };
  }
}

// 驗證 teamId, ownerId（同 Dashboard）
```

#### ResourceLink (POST, PATCH)
```typescript
// 驗證 source_resource_id
const sourceResource = DB.resources.find(r =>
  r.id === body.source_resource_id && !r.deleted_at
);
if (!sourceResource) {
  throw { status: 404, message: 'Source resource not found.' };
}

// 驗證 target_resource_id
const targetResource = DB.resources.find(r =>
  r.id === body.target_resource_id && !r.deleted_at
);
if (!targetResource) {
  throw { status: 404, message: 'Target resource not found.' };
}
```

#### NotificationStrategy (POST, PATCH)
```typescript
// 驗證 channelIds
if (body.channelIds && Array.isArray(body.channelIds)) {
  const invalidIds = body.channelIds.filter(cid =>
    !DB.notificationChannels.find(c => c.id === cid && !c.deleted_at)
  );
  if (invalidIds.length > 0) {
    throw {
      status: 404,
      message: \`Notification channels not found: \${invalidIds.join(', ')}\`
    };
  }
}
```

#### User (POST, PATCH)
```typescript
// 驗證 teamId
if (body.teamId) {
  const team = DB.teams.find(t => t.id === body.teamId && !t.deleted_at);
  if (!team) {
    throw { status: 404, message: 'Team not found.' };
  }
}

// 驗證 role（如果 role 存在於 DB.roles）
if (body.role && DB.roles.length > 0) {
  const role = DB.roles.find(r => r.name === body.role && !r.deleted_at);
  if (!role) {
    throw { status: 404, message: \`Role '\${body.role}' not found.\` };
  }
}
```

#### Team (PATCH - memberIds)
```typescript
// 驗證 memberIds
if (body.memberIds && Array.isArray(body.memberIds)) {
  const invalidIds = body.memberIds.filter(uid =>
    !DB.users.find(u => u.id === uid && !u.deleted_at)
  );
  if (invalidIds.length > 0) {
    throw {
      status: 404,
      message: \`Users not found: \${invalidIds.join(', ')}\`
    };
  }
}
```

## 執行步驟

1. **建立驗證輔助函數（可選）**
   ```typescript
   // 在 handlers.ts 頂部新增
   const validateEntityExists = (
     collection: any[],
     id: string,
     entityName: string
   ) => {
     const entity = collection.find(e => e.id === id && !e.deleted_at);
     if (!entity) {
       throw { status: 404, message: \`\${entityName} not found.\` };
     }
     return entity;
   };

   const validateEntitiesExist = (
     collection: any[],
     ids: string[],
     entityName: string
   ) => {
     const invalidIds = ids.filter(id =>
       !collection.find(e => e.id === id && !e.deleted_at)
     );
     if (invalidIds.length > 0) {
       throw {
         status: 404,
         message: \`\${entityName} not found: \${invalidIds.join(', ')}\`
       };
     }
   };
   ```

2. **逐端點添加驗證**
   按上述順序為每個端點添加驗證邏輯。

3. **測試驗證**
   使用 curl 測試錯誤情況：
   ```bash
   # 測試不存在的 teamId
   curl -X POST http://localhost:4000/api/v1/dashboards \\
     -H "Content-Type: application/json" \\
     -d '{"name":"Test","teamId":"invalid-id"}'

   # 預期回應
   {"message":"Team not found."}
   ```

## 預期結果
- 所有外鍵關聯都有驗證
- 友好的錯誤訊息
- 防止孤兒資料產生
- 提升資料完整性

請開始執行。
```

---

## 🎯 Prompt 5: 生成完整的 openapi.yaml（優先級：P1）

### 目標
基於改進後的架構生成完整的 OpenAPI 3.0 規範文件。

### 提示詞

```
請基於改進後的 SRE Platform 架構，生成完整且符合 OpenAPI 3.0.3 規範的 API 文檔。

## 前置條件
確認以下改進已完成：
- ✅ types.ts 已補充所有缺失欄位
- ✅ 命名規範已統一為 snake_case
- ✅ AuditLog 已覆蓋所有操作
- ✅ 外鍵驗證已添加

## 輸入資料
1. handlers.ts - 所有 API 端點實作
2. types.ts - 完整的型別定義
3. database_schema_analysis.md - 資料模型分析
4. improvement_recommendations.md - 改進建議

## 生成要求

### 基本結構
```yaml
openapi: 3.0.3
info:
  title: SRE Platform API
  version: 1.0.0
  description: |
    統一的 SRE 平台 API，支援事件管理、資源監控、自動化和可觀測性

    ## 重要說明
    - 所有時間戳使用 ISO 8601 格式（YYYY-MM-DDTHH:mm:ss.sssZ）
    - 分頁參數：page (預設 1), page_size (預設 10)
    - 軟刪除：GET 端點自動過濾 deleted_at 不為 null 的資料
    - 驗證：大部分端點需要 Bearer Token

servers:
  - url: /api/v1
    description: API v1

security:
  - bearerAuth: []
```

### Components

#### 1. Security Schemes
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

#### 2. Common Parameters
定義可重用的參數：
- PageParam, PageSizeParam
- SortByParam, SortOrderParam
- KeywordParam

#### 3. Common Responses
定義標準回應：
- 200 Success
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

#### 4. Schemas
為所有型別創建完整的 schema 定義：

**必須包含的 schemas**（按優先級）：
1. 核心資料模型
   - Incident, AlertRule, SilenceRule
   - Resource, ResourceGroup, ResourceLink
   - Dashboard

2. 自動化相關
   - AutomationPlaybook, AutomationExecution, AutomationTrigger
   - ParameterDefinition

3. IAM 相關
   - User, Team, Role
   - AuditLog

4. 通知相關
   - NotificationChannel, NotificationStrategy
   - NotificationHistoryRecord

5. 配置相關
   - TagDefinition
   - ConfigVersion
   - Datasource, DiscoveryJob, DiscoveredResource

6. 通用 schemas
   - Error
   - SuccessResponse
   - PaginatedResponse

**Schema 要求**：
- 包含所有欄位（含新增的外鍵欄位）
- 使用正確的 type (string, number, boolean, array, object)
- required 陣列標記必填欄位
- 為每個欄位添加 description
- 枚舉欄位使用 enum
- 時間戳欄位使用 format: date-time
- 提供 example 範例值

**範例**：
```yaml
Incident:
  type: object
  required:
    - id
    - summary
    - resource
    - resourceId
    - status
    - severity
    - impact
    - rule
    - ruleId
    - occurred_at
    - created_at
    - updated_at
    - history
  properties:
    id:
      type: string
      description: 事件 ID
      example: "INC-A1B2C3D4"
    summary:
      type: string
      description: 事件摘要
      example: "Database CPU usage exceeded 90%"
    resourceId:
      type: string
      description: 資源 ID（外鍵 → Resource.id）
      example: "res-001"
    ruleId:
      type: string
      description: 告警規則 ID（外鍵 → AlertRule.id）
      example: "rule-001"
    status:
      type: string
      enum: [New, Acknowledged, Resolved, Silenced]
      description: 事件狀態
    severity:
      type: string
      enum: [Critical, High, Medium, Low]
      description: 嚴重程度
    occurred_at:
      type: string
      format: date-time
      description: 發生時間
    created_at:
      type: string
      format: date-time
      description: 建立時間
    updated_at:
      type: string
      format: date-time
      description: 更新時間
    deleted_at:
      type: string
      format: date-time
      nullable: true
      description: 軟刪除時間
    acknowledged_at:
      type: string
      format: date-time
      nullable: true
      description: 確認時間
    resolved_at:
      type: string
      format: date-time
      nullable: true
      description: 解決時間
    # ... 其他欄位
```

### Paths

#### 分組標籤
```yaml
tags:
  - name: Navigation
  - name: Profile
  - name: AI
  - name: Dashboards
  - name: Incidents
  - name: Alert Rules
  - name: Silence Rules
  - name: Resources
  - name: Automation
  - name: IAM
  - name: Analysis
  - name: Logs
  - name: Settings
  - name: System
  - name: Notifications
```

#### 端點定義要求
為每個端點提供：
1. **tags** - 分組標籤
2. **summary** - 簡短摘要（一句話）
3. **description** - 詳細說明
   - 功能描述
   - 權限要求
   - 特殊行為（如自動過濾 deleted_at）
   - 已知問題（使用 ⚠️ 標記）
4. **parameters** - 路徑、查詢參數
5. **requestBody** - POST/PUT/PATCH 的請求體
6. **responses** - 各種狀態碼的回應
7. **security** - 是否需要驗證

#### 端點優先級順序
1. 核心 CRUD（Incidents, AlertRules, Resources, Dashboards）
2. 反向查詢（/resources/{id}/alert-rules, /incidents/{id}/executions）
3. 手動觸發（/alert-rules/{id}/trigger, /incidents/{id}/notify）
4. IAM
5. Automation
6. Settings
7. AI

**範例**：
```yaml
/incidents:
  get:
    tags: [Incidents]
    summary: 取得事件列表
    description: |
      返回事件列表，支援分頁、排序和過濾

      **權限**：需要 incident:read 權限

      **過濾規則**：
      - 自動過濾 deleted_at 不為 null 的記錄
      - 支援按 resource_name 過濾

    parameters:
      - name: resource_name
        in: query
        description: 按資源名稱過濾
        schema:
          type: string
      - $ref: '#/components/parameters/PageParam'
      - $ref: '#/components/parameters/PageSizeParam'
      - $ref: '#/components/parameters/SortByParam'
      - $ref: '#/components/parameters/SortOrderParam'
    responses:
      '200':
        description: 成功
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/PaginatedResponse'
                - type: object
                  properties:
                    items:
                      type: array
                      items:
                        $ref: '#/components/schemas/Incident'
  post:
    tags: [Incidents]
    summary: 創建事件
    description: |
      手動創建新事件

      **權限**：需要 incident:create 權限

      **驗證**：
      - resourceId 必須存在於 resources 表
      - ruleId 必須存在於 alert_rules 表

      **自動處理**：
      - severity 和 impact 自動規範化為首字母大寫
      - 自動設定 created_at, updated_at
      - 自動創建初始 history 記錄
      - 自動記錄到 AuditLog
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/IncidentCreate'
    responses:
      '200':
        description: 成功創建
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Incident'
      '400':
        description: 缺少必要欄位
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
      '404':
        description: 資源或規則不存在
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
```

### 新增端點文檔
特別為以下改進後的端點提供完整文檔：

1. **反向查詢**
   - GET /resources/{id}/alert-rules
   - GET /incidents/{id}/executions
   - GET /alert-rules/{id}/incidents

2. **手動觸發**
   - POST /alert-rules/{id}/trigger
   - POST /incidents/{id}/notify

3. **ResourceLink**
   - GET /resource-links
   - POST /resource-links
   - PATCH /resource-links/{id}
   - DELETE /resource-links/{id}

4. **ConfigVersion**
   - GET /config-versions
   - POST /config-versions

## 執行步驟

1. **閱讀輸入檔案**
   ```
   Read handlers.ts
   Read types.ts
   Read database_schema_analysis.md
   ```

2. **生成檔案**
   ```
   Write ./openapi.yaml
   ```

3. **驗證**
   使用線上工具驗證：
   https://editor.swagger.io/

4. **文件結構**
   - 總行數預估：3000-5000 行
   - 使用 2 空格縮排
   - 所有 $ref 引用正確
   - 符合 OpenAPI 3.0.3 規範

## 預期結果
一份完整、可用於：
1. 自動生成 API 客戶端（TypeScript, Python, Go 等）
2. API 文檔網站（Swagger UI, ReDoc）
3. API 測試（Postman, Insomnia）
4. 契約測試（Pact, Dredd）
5. Mock Server 生成

請開始執行，生成完整的 openapi.yaml。
```

---

## 🎯 Prompt 6: 生成完整的 db_schema.sql（優先級：P1）

### 目標
基於改進後的架構生成 MySQL 資料庫 Schema。

### 提示詞

```
請基於改進後的 SRE Platform 架構，生成完整的 MySQL 資料庫 Schema（db_schema.sql）。

## 前置條件
- ✅ types.ts 已補充所有欄位
- ✅ 命名規範已統一為 snake_case
- ✅ 軟刪除策略已統一
- ✅ ResourceLink, ConfigVersion 已實現

## 輸入資料
1. types.ts - 完整的型別定義
2. database_schema_analysis.md - 資料模型分析
3. improvement_recommendations.md - 改進建議（特別是 P0 階段的資料表結構增強）

## 生成要求

### 資料庫配置
```sql
-- SRE Platform Database Schema
-- Version: 1.0.0
-- Generated: 2025-10-01
-- Database: MySQL 8.0+

-- 設定字元集和排序規則
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 建立資料庫（可選）
CREATE DATABASE IF NOT EXISTS sre_platform
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sre_platform;
```

### 資料表生成順序（依賴關係）

#### 第一層（無依賴）
1. users
2. teams
3. roles
4. datasources

#### 第二層（依賴第一層）
5. resources
6. dashboards
7. alert_rules
8. silence_rules
9. automation_playbooks

#### 第三層（依賴第二層）
10. incidents
11. automation_triggers
12. automation_executions
13. resource_groups
14. resource_links
15. notification_channels
16. notification_strategies
17. tag_definitions

#### 第四層（歷史與日誌）
18. audit_logs
19. notification_history
20. login_history
21. config_versions
22. discovery_jobs
23. discovered_resources

### 通用欄位規範
所有資料表應包含：
```sql
-- 主鍵
id VARCHAR(255) PRIMARY KEY COMMENT '主鍵',

-- 時間戳（統一使用 snake_case）
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

-- 軟刪除（大部分資料表）
deleted_at DATETIME NULL COMMENT '軟刪除時間',

-- 索引
INDEX idx_created_at (created_at),
INDEX idx_deleted_at (deleted_at)
```

### 資料表範例

#### users 表
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY COMMENT '使用者 ID',
  name VARCHAR(255) NOT NULL COMMENT '姓名',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT '電子郵件',
  role VARCHAR(50) NOT NULL COMMENT '角色：platform_admin, team_admin, engineer, viewer',
  status VARCHAR(50) NOT NULL DEFAULT 'invited' COMMENT '狀態：active, inactive, invited',
  team_id VARCHAR(255) NULL COMMENT '團隊 ID（外鍵 → teams.id）',
  last_login_at DATETIME NULL COMMENT '最後登入時間',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_team (team_id),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),

  CONSTRAINT fk_user_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='使用者';
```

#### incidents 表（包含新增欄位）
```sql
CREATE TABLE incidents (
  id VARCHAR(255) PRIMARY KEY COMMENT '事件 ID',
  summary TEXT NOT NULL COMMENT '事件摘要',
  resource VARCHAR(255) NOT NULL COMMENT '資源名稱',
  resource_id VARCHAR(255) NOT NULL COMMENT '資源 ID（外鍵 → resources.id）',
  status VARCHAR(50) NOT NULL COMMENT '狀態：New, Acknowledged, Resolved, Silenced',
  severity VARCHAR(50) NOT NULL COMMENT '嚴重程度：Critical, High, Medium, Low',
  impact VARCHAR(50) NOT NULL COMMENT '影響範圍：Critical, Major, Minor',
  rule VARCHAR(255) NOT NULL COMMENT '規則名稱',
  rule_id VARCHAR(255) NOT NULL COMMENT '規則 ID（外鍵 → alert_rules.id）',
  assignee VARCHAR(255) NULL COMMENT '處理人名稱',
  team_id VARCHAR(255) NULL COMMENT '團隊 ID（外鍵 → teams.id）',
  owner_id VARCHAR(255) NULL COMMENT '擁有者 ID（外鍵 → users.id）',
  tags JSON NULL COMMENT '標籤（鍵值對）',
  occurred_at DATETIME NOT NULL COMMENT '發生時間',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- 新增欄位（P0 改進）
  silenced_by VARCHAR(255) NULL COMMENT '執行靜音的使用者',
  notifications_sent JSON NULL COMMENT '已發送的通知記錄',
  acknowledged_at DATETIME NULL COMMENT '確認時間',
  resolved_at DATETIME NULL COMMENT '解決時間',

  history JSON NOT NULL COMMENT '事件歷史記錄',
  ai_analysis JSON NULL COMMENT 'AI 分析結果',

  INDEX idx_resource (resource_id),
  INDEX idx_rule (rule_id),
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_occurred_at (occurred_at),
  INDEX idx_created_at (created_at),
  INDEX idx_team (team_id),
  INDEX idx_owner (owner_id),

  CONSTRAINT fk_incident_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE,
  CONSTRAINT fk_incident_rule FOREIGN KEY (rule_id)
    REFERENCES alert_rules(id) ON DELETE CASCADE,
  CONSTRAINT fk_incident_team FOREIGN KEY (team_id)
    REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_incident_owner FOREIGN KEY (owner_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='事件';
```

#### alert_rules 表（包含新增欄位）
```sql
CREATE TABLE alert_rules (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  severity VARCHAR(50) NOT NULL COMMENT 'critical, warning, info',
  target TEXT NOT NULL COMMENT '目標資源',
  conditions_summary TEXT NOT NULL,
  condition_groups JSON NULL,
  title_template TEXT NULL,
  body_template TEXT NULL,
  automation JSON NULL COMMENT '自動化配置',
  automation_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- 新增欄位（P0 改進）
  target_resource_ids JSON NULL COMMENT '目標資源 ID 列表',
  triggered_count INT NOT NULL DEFAULT 0 COMMENT '觸發次數統計',
  version INT NOT NULL DEFAULT 1 COMMENT '配置版本號',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,

  INDEX idx_enabled (enabled),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='告警規則';
```

#### automation_executions 表（包含新增欄位）
```sql
CREATE TABLE automation_executions (
  id VARCHAR(255) PRIMARY KEY,
  script_id VARCHAR(255) NOT NULL COMMENT '腳本 ID（外鍵 → automation_playbooks.id）',
  script_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL COMMENT 'pending, running, success, failed',
  trigger_source VARCHAR(50) NOT NULL COMMENT 'manual, scheduled, event',
  triggered_by VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  duration_ms INT NULL,
  parameters JSON NULL,
  logs JSON NULL,

  -- 新增欄位（P0 改進）
  incident_id VARCHAR(255) NULL COMMENT '關聯的事件 ID（外鍵 → incidents.id）',
  alert_rule_id VARCHAR(255) NULL COMMENT '觸發的告警規則 ID（外鍵 → alert_rules.id）',

  INDEX idx_script (script_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_incident (incident_id),
  INDEX idx_alert_rule (alert_rule_id),

  CONSTRAINT fk_execution_script FOREIGN KEY (script_id)
    REFERENCES automation_playbooks(id) ON DELETE CASCADE,
  CONSTRAINT fk_execution_incident FOREIGN KEY (incident_id)
    REFERENCES incidents(id) ON DELETE SET NULL,
  CONSTRAINT fk_execution_alert_rule FOREIGN KEY (alert_rule_id)
    REFERENCES alert_rules(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='自動化執行記錄';
```

#### resource_links 表（新增表）
```sql
CREATE TABLE resource_links (
  id VARCHAR(255) PRIMARY KEY,
  source_resource_id VARCHAR(255) NOT NULL COMMENT '來源資源 ID（外鍵 → resources.id）',
  target_resource_id VARCHAR(255) NOT NULL COMMENT '目標資源 ID（外鍵 → resources.id）',
  link_type VARCHAR(50) NOT NULL COMMENT '關係類型：depends_on, connects_to, includes',
  metadata JSON NULL COMMENT '額外的元數據',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,

  INDEX idx_source (source_resource_id),
  INDEX idx_target (target_resource_id),
  INDEX idx_link_type (link_type),
  INDEX idx_deleted_at (deleted_at),

  CONSTRAINT fk_resource_link_source FOREIGN KEY (source_resource_id)
    REFERENCES resources(id) ON DELETE CASCADE,
  CONSTRAINT fk_resource_link_target FOREIGN KEY (target_resource_id)
    REFERENCES resources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='資源拓撲關係';
```

#### config_versions 表（新增表）
```sql
CREATE TABLE config_versions (
  id VARCHAR(255) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL COMMENT '實體類型：AlertRule, AutomationPlaybook, etc.',
  entity_id VARCHAR(255) NOT NULL COMMENT '實體 ID',
  version INT NOT NULL COMMENT '版本號',
  config_snapshot JSON NOT NULL COMMENT '配置快照',
  changed_by VARCHAR(255) NOT NULL COMMENT '變更人',
  change_summary TEXT NULL COMMENT '變更摘要',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_version (entity_type, entity_id, version),
  INDEX idx_changed_by (changed_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配置版本歷史';
```

### 其他所有資料表
按相同模式生成：
- teams, roles, resources, dashboards
- silence_rules, automation_playbooks, automation_triggers
- resource_groups, datasources, discovery_jobs, discovered_resources
- notification_channels, notification_strategies, notification_history
- tag_definitions, audit_logs, login_history

### 結尾
```sql
-- 重新啟用外鍵檢查
SET FOREIGN_KEY_CHECKS = 1;

-- 建立視圖（可選）
CREATE OR REPLACE VIEW v_active_incidents AS
SELECT * FROM incidents WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW v_active_alert_rules AS
SELECT * FROM alert_rules WHERE deleted_at IS NULL;

-- 初始化資料（可選）
-- INSERT INTO users ...
```

## 執行步驟

1. **閱讀輸入檔案**
   ```
   Read types.ts
   Read database_schema_analysis.md
   ```

2. **生成檔案**
   ```
   Write ./db_schema.sql
   ```

3. **驗證**
   ```bash
   mysql -u root -p < db_schema.sql
   ```

## 預期結果
- 包含所有 23 個資料表
- 正確的外鍵約束
- 適當的索引（提升查詢效能）
- 軟刪除支援
- JSON 欄位支援
- 完整的註解

請開始執行，生成完整的 db_schema.sql。
```

---

## 📋 執行順序建議

### Week 1（本週）
```bash
# Day 1-2: 型別與命名
1. 執行 Prompt 1: 補充型別定義（2 小時）
2. 執行 Prompt 2: 統一命名規範（4 小時）
3. 驗證編譯無錯誤

# Day 3-4: AuditLog
4. 執行 Prompt 3: 擴展 AuditLog（1 天）
5. 測試審計記錄功能

# Day 5: 驗證
6. 執行 Prompt 4: 外鍵驗證（1 天）
```

### Week 2（下週）
```bash
# Day 1-2: 生成契約文件
7. 執行 Prompt 5: 生成 openapi.yaml（1 天）
8. 執行 Prompt 6: 生成 db_schema.sql（1 天）

# Day 3-5: 驗證與調整
9. 驗證 OpenAPI 規範
10. 測試資料庫 Schema
11. 整合測試
```

---

## ✅ 檢查清單

每個 Prompt 執行後，確認：

- [ ] **Prompt 1 完成**
  - [ ] types.ts 無 TypeScript 錯誤
  - [ ] 所有欄位都有 JSDoc 註解
  - [ ] handlers.ts 中使用的欄位都已定義

- [ ] **Prompt 2 完成**
  - [ ] 無 camelCase 時間戳欄位
  - [ ] mock-server 編譯成功
  - [ ] getActive 函數使用 deleted_at

- [ ] **Prompt 3 完成**
  - [ ] AuditLog 覆蓋率 100%
  - [ ] GET /iam/audit-logs 可查詢記錄
  - [ ] 批次操作也有記錄

- [ ] **Prompt 4 完成**
  - [ ] 所有外鍵都有驗證
  - [ ] 錯誤訊息友好
  - [ ] 測試不存在的 ID 回傳 404

- [ ] **Prompt 5 完成**
  - [ ] openapi.yaml 通過 Swagger Editor 驗證
  - [ ] 所有端點都有文檔
  - [ ] Schema 定義完整

- [ ] **Prompt 6 完成**
  - [ ] db_schema.sql 可成功執行
  - [ ] 所有外鍵約束正確
  - [ ] 索引建立完整

---

**建議**：每次執行一個 Prompt，驗證通過後再執行下一個。這樣可以確保每個階段的品質。
