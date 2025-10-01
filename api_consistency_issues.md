# API 一致性問題分析報告

生成時間：2025-10-01
分析範圍：types.ts, handlers.ts

---

## 1. 欄位命名一致性問題

### 1.1 時間戳欄位命名不一致

**問題描述：** 在 types.ts 中混用了 `createdAt`/`updatedAt` 和 `deleted_at` 兩種命名風格。

**具體位置：**

- **types.ts** - camelCase 風格：
  - Dashboard (line 30-31): `createdAt`, `updatedAt`
  - Incident (line 134-135): `createdAt`, `updatedAt`
  - Resource (line 168-169): `createdAt`, `updatedAt`
  - AutomationPlaybook (line 219-220): `createdAt`, `updatedAt`
  - AutomationTrigger (line 263-264): `createdAt`, `updatedAt`
  - User (line 293-294): `createdAt`, `updatedAt`
  - Team (line 303-304): `createdAt`, `updatedAt`
  - Role (line 319-320): `createdAt`, `updatedAt`
  - AlertRule (line 368-369): `createdAt`, `updatedAt`
  - SilenceRule (line 409-410): `createdAt`, `updatedAt`
  - NotificationChannel (line 466-467): `createdAt`, `updatedAt`
  - NotificationStrategy (line 480-481): `createdAt`, `updatedAt`

- **types.ts** - snake_case 風格：
  - Dashboard (line 37): `deleted_at`
  - ResourceGroup (line 196): `deleted_at`
  - AutomationPlaybook (line 222): `deleted_at`
  - AutomationExecution (line 240): `deleted_at`
  - AutomationTrigger (line 265): `deleted_at`
  - Team (line 305): `deleted_at`
  - Role (line 322): `deleted_at`
  - AlertRule (line 376): `deleted_at`
  - SilenceRule (line 411): `deleted_at`
  - NotificationChannel (line 468): `deleted_at`
  - NotificationStrategy (line 482): `deleted_at`
  - TagDefinition (line 560): `deleted_at`
  - Datasource (line 1017): `deleted_at`
  - DiscoveryJob (line 1049): `deleted_at`

**建議修復方式：**
統一使用 camelCase 風格，將所有 `deleted_at` 改為 `deletedAt`，以保持與其他時間戳欄位的一致性。

```typescript
// 修改前
deleted_at?: string;

// 修改後
deletedAt?: string;
```

同時需要更新 handlers.ts 中所有使用 `deleted_at` 的地方 (約 30+ 處)。

---

### 1.2 其他欄位命名不一致

**問題描述：** Dashboard 介面中混用了 snake_case 和 camelCase。

**具體位置：**
- **types.ts:34-35** - Dashboard 介面：
  ```typescript
  grafana_dashboard_uid?: string;
  grafana_folder_uid?: string;
  ```

**建議修復方式：**
改為 camelCase 風格：
```typescript
grafanaDashboardUid?: string;
grafanaFolderUid?: string;
```

同時更新 handlers.ts:272 中的使用處。

---

## 2. 外鍵關聯完整性問題

### 2.1 缺少外鍵驗證的端點

**問題 1：Dashboard 的 teamId/ownerId 未驗證**

**具體位置：** handlers.ts:291-302 (POST /dashboards)

**問題描述：** 創建 Dashboard 時未驗證 `teamId` 和 `ownerId` 是否存在。

**建議修復方式：**
```typescript
// 在 line 297 之後添加
if (body.teamId) {
    const team = DB.teams.find((t: any) => t.id === body.teamId && !t.deleted_at);
    if (!team) {
        throw { status: 404, message: 'Team not found.' };
    }
}
if (body.ownerId) {
    const owner = DB.users.find((u: any) => u.id === body.ownerId && !u.deleted_at);
    if (!owner) {
        throw { status: 404, message: 'Owner not found.' };
    }
}
```

---

**問題 2：AlertRule 的 teamId/ownerId 未驗證**

**具體位置：** handlers.ts:514-538 (POST /alert-rules)

**問題描述：** 創建告警規則時未驗證 `teamId` 和 `ownerId`。

**建議修復方式：**
```typescript
// 在 line 536 之前添加驗證
if (body.teamId) {
    const team = DB.teams.find((t: any) => t.id === body.teamId && !t.deleted_at);
    if (!team) throw { status: 404, message: 'Team not found.' };
}
if (body.ownerId) {
    const owner = DB.users.find((u: any) => u.id === body.ownerId && !u.deleted_at);
    if (!owner) throw { status: 404, message: 'Owner not found.' };
}
```

---

**問題 3：AutomationTrigger 的 targetPlaybookId 未驗證**

**具體位置：** handlers.ts:962-984 (POST /automation - triggers)

**問題描述：** 創建自動化觸發器時未驗證關聯的 Playbook 是否存在。

**建議修復方式：**
```typescript
// 在 line 982 之前添加
if (body.targetPlaybookId) {
    const playbook = DB.playbooks.find((p: any) => p.id === body.targetPlaybookId && !p.deleted_at);
    if (!playbook) {
        throw { status: 404, message: 'Target playbook not found.' };
    }
}
```

---

**問題 4：Resource 的 teamId/ownerId 未驗證**

**具體位置：** handlers.ts:789-795 (POST /resources)

**問題描述：** 創建資源時未驗證團隊和負責人 ID。

**建議修復方式：**
```typescript
// 在 line 792 之前添加
if (body.teamId) {
    const team = DB.teams.find((t: any) => t.id === body.teamId && !t.deleted_at);
    if (!team) throw { status: 404, message: 'Team not found.' };
}
if (body.ownerId) {
    const owner = DB.users.find((u: any) => u.id === body.ownerId && !u.deleted_at);
    if (!owner) throw { status: 404, message: 'Owner not found.' };
}
```

---

**問題 5：Team 的 ownerId 未驗證**

**具體位置：** handlers.ts:1082-1097 (POST /iam - teams)

**問題描述：** 創建團隊時未驗證 ownerId 是否指向有效的用戶。

**建議修復方式：**
```typescript
// 在 line 1088 之後添加
if (body.ownerId) {
    const owner = DB.users.find((u: any) => u.id === body.ownerId && !u.deleted_at);
    if (!owner) {
        throw { status: 404, message: 'Owner user not found.' };
    }
}
```

---

### 2.2 已正確驗證的外鍵

以下端點已正確實作外鍵驗證：

- **handlers.ts:370-386** - POST /incidents：正確驗證 `resourceId` 和 `ruleId`
- **handlers.ts:914** - POST /automation (execute)：正確驗證 `scriptId`
- **handlers.ts:948** - POST /automation (retry)：正確驗證 execution ID

---

## 3. 必填欄位驗證問題

### 3.1 缺少必填欄位驗證的端點

**問題 1：POST /dashboards 缺少必填欄位驗證**

**具體位置：** handlers.ts:291-302

**問題描述：** 根據 Dashboard 介面，`name`, `type`, `category` 等欄位應為必填，但未驗證。

**建議修復方式：**
```typescript
// 在 line 297 之前添加
const { name, type, category } = body;
if (!name || !type || !category) {
    throw { status: 400, message: 'Missing required fields: name, type, category' };
}
```

---

**問題 2：POST /alert-rules 缺少必填欄位驗證**

**具體位置：** handlers.ts:514-538

**問題描述：** 未驗證告警規則的必填欄位如 `name`, `enabled`, `severity` 等。

**建議修復方式：**
```typescript
// 在 line 536 之前添加
const { name, enabled, severity } = body;
if (!name || enabled === undefined || !severity) {
    throw { status: 400, message: 'Missing required fields for alert rule' };
}
if (!['critical', 'warning', 'info'].includes(severity)) {
    throw { status: 400, message: 'Invalid severity value' };
}
```

---

**問題 3：POST /silence-rules 缺少必填欄位驗證**

**具體位置：** handlers.ts:567-591

**問題描述：** 未驗證靜音規則的必填欄位。

**建議修復方式：**
```typescript
// 在 line 589 之前添加
const { name, enabled, type, matchers, schedule } = body;
if (!name || enabled === undefined || !type || !matchers || !schedule) {
    throw { status: 400, message: 'Missing required fields for silence rule' };
}
if (!['single', 'repeat', 'condition'].includes(type)) {
    throw { status: 400, message: 'Invalid type value' };
}
```

---

**問題 4：POST /automation/scripts 缺少必填欄位驗證**

**具體位置：** handlers.ts:889-941

**問題描述：** 未驗證自動化腳本的必填欄位。

**建議修復方式：**
```typescript
// 在 line 939 之前添加
const { name, type, content } = body;
if (!name || !type || !content) {
    throw { status: 400, message: 'Missing required fields: name, type, content' };
}
if (!['shell', 'python', 'ansible', 'terraform'].includes(type)) {
    throw { status: 400, message: 'Invalid playbook type' };
}
```

---

**問題 5：POST /automation/triggers 缺少必填欄位驗證**

**具體位置：** handlers.ts:962-984

**問題描述：** 未驗證觸發器的必填欄位。

**建議修復方式：**
```typescript
// 在 line 982 之前添加
const { name, type, enabled, targetPlaybookId } = body;
if (!name || !type || enabled === undefined || !targetPlaybookId) {
    throw { status: 400, message: 'Missing required fields for automation trigger' };
}
if (!['Schedule', 'Webhook', 'Event'].includes(type)) {
    throw { status: 400, message: 'Invalid trigger type' };
}
```

---

**問題 6：POST /resources/datasources 缺少必填欄位驗證**

**具體位置：** handlers.ts:679-713

**問題描述：** 未驗證數據源的必填欄位。

**建議修復方式：**
```typescript
// 在 line 711 之前添加
const { name, type, url, authMethod } = body;
if (!name || !type || !url || !authMethod) {
    throw { status: 400, message: 'Missing required fields: name, type, url, authMethod' };
}
```

---

**問題 7：POST /resources/discovery-jobs 缺少必填欄位驗證**

**具體位置：** handlers.ts:715-754

**問題描述：** 未驗證發現任務的必填欄位。

**建議修復方式：**
```typescript
// 在 line 742 之前添加
const { name, kind, schedule } = body;
if (!name || !kind || !schedule) {
    throw { status: 400, message: 'Missing required fields: name, kind, schedule' };
}
```

---

**問題 8：POST /resource-groups 缺少必填欄位驗證**

**具體位置：** handlers.ts:850-853

**問題描述：** 未驗證資源組的必填欄位。

**建議修復方式：**
```typescript
// 在 line 851 之前添加
const { name, ownerTeam, memberIds } = body;
if (!name || !ownerTeam || !Array.isArray(memberIds)) {
    throw { status: 400, message: 'Missing required fields: name, ownerTeam, memberIds' };
}
```

---

**問題 9：POST /settings/notification-channels 缺少必填欄位驗證**

**具體位置：** handlers.ts:1366-1369

**問題描述：** 未驗證通知通道的必填欄位。

**建議修復方式：**
```typescript
// 在 line 1367 之前添加
const { name, type, enabled, config } = body;
if (!name || !type || enabled === undefined || !config) {
    throw { status: 400, message: 'Missing required fields: name, type, enabled, config' };
}
const validTypes: NotificationChannelType[] = ['Email', 'Webhook (通用)', 'Slack', 'LINE Notify', 'SMS'];
if (!validTypes.includes(type)) {
    throw { status: 400, message: 'Invalid channel type' };
}
```

---

**問題 10：POST /iam/users 缺少必填欄位驗證**

**具體位置：** handlers.ts:1059-1080

**問題描述：** 未驗證用戶的必填欄位。

**建議修復方式：**
```typescript
// 在 line 1070 之前添加
const { name, email, role, team } = body;
if (!name || !email || !role || !team) {
    throw { status: 400, message: 'Missing required fields: name, email, role, team' };
}
if (!['Admin', 'SRE', 'Developer', 'Viewer'].includes(role)) {
    throw { status: 400, message: 'Invalid role value' };
}
```

---

### 3.2 已正確實作必填欄位驗證的端點

以下端點已正確驗證必填欄位：

- **handlers.ts:370-386** - POST /incidents：驗證 `summary`, `resourceId`, `ruleId`, `severity`, `impact`
- **handlers.ts:1284-1293** - POST /settings/tags：驗證 `key`, `scopes`, `writableRoles`

---

## 4. 時間戳欄位處理問題

### 4.1 實體時間戳欄位對照表

| 實體 | createdAt | updatedAt | deleted_at | 其他時間欄位 |
|------|-----------|-----------|------------|-------------|
| Dashboard | ✓ | ✓ | ✓ | - |
| Incident | ✓ | ✓ | - | occurredAt |
| Resource | ✓ | ✓ | - | lastCheckInAt |
| ResourceGroup | ✓ | ✓ | ✓ | - |
| AutomationPlaybook | ✓ | ✓ | ✓ | lastRunAt |
| AutomationExecution | - | - | ✓ | startTime, endTime |
| AutomationTrigger | ✓ | ✓ | ✓ | lastTriggeredAt |
| User | ✓ | ✓ | - | lastLoginAt |
| Team | ✓ | ✓ | ✓ | - |
| Role | ✓ | ✓ | ✓ | - |
| AlertRule | ✓ | ✓ | ✓ | - |
| SilenceRule | ✓ | ✓ | ✓ | - |
| NotificationChannel | ✓ | ✓ | ✓ | lastTestedAt |
| NotificationStrategy | ✓ | ✓ | ✓ | - |
| TagDefinition | - | - | ✓ | - |
| Datasource | ✓ | - | ✓ | - |
| DiscoveryJob | ✓ | ✓ | ✓ | lastRunAt |

---

### 4.2 PATCH 端點中 updatedAt 欄位更新問題

**問題 1：PATCH /dashboards 正確更新 updatedAt**

**具體位置：** handlers.ts:304-309

**狀態：** ✓ 已正確實作
```typescript
DB.dashboards[index] = { ...DB.dashboards[index], ...body, updatedAt: new Date().toISOString() };
```

---

**問題 2：PATCH /alert-rules 缺少 updatedAt 更新**

**具體位置：** handlers.ts:539-543

**問題描述：** 未更新 `updatedAt` 欄位。

**建議修復方式：**
```typescript
// 修改 line 542
DB.alertRules[ruleIndex] = {
    ...DB.alertRules[ruleIndex],
    ...body,
    automationEnabled: !!body.automation?.enabled,
    updatedAt: new Date().toISOString()
};
```

---

**問題 3：PATCH /silence-rules 缺少 updatedAt 更新**

**具體位置：** handlers.ts:592-596

**問題描述：** 未更新 `updatedAt` 欄位。

**建議修復方式：**
```typescript
// 修改 line 595
DB.silenceRules[silenceIndex] = {
    ...DB.silenceRules[silenceIndex],
    ...body,
    updatedAt: new Date().toISOString()
};
```

---

**問題 4：PATCH /resources 缺少 updatedAt 更新**

**具體位置：** handlers.ts:820-823

**問題描述：** 未更新 `updatedAt` 欄位。

**建議修復方式：**
```typescript
// 修改 line 822
DB.resources[resIndex] = {
    ...DB.resources[resIndex],
    ...body,
    updatedAt: new Date().toISOString()
};
```

---

**問題 5：PATCH /resources/datasources 缺少 updatedAt**

**具體位置：** handlers.ts:797-803

**問題描述：** Datasource 類型定義中沒有 `updatedAt`，但應該添加以保持一致性。

**建議修復方式：**
1. 在 types.ts:1008-1018 的 Datasource 介面中添加 `updatedAt?: string;`
2. 在 handlers.ts:802 添加時間戳更新：
```typescript
DB.datasources[index] = {
    ...DB.datasources[index],
    ...body,
    updatedAt: new Date().toISOString()
};
```

---

**問題 6：PATCH /resources/discovery-jobs 正確更新 updatedAt**

**具體位置：** handlers.ts:805-818

**問題描述：** 未明確更新 `updatedAt`，但透過展開運算符可能會包含 body 中的值。

**建議修復方式：**
```typescript
// 修改 line 810-817
DB.discoveryJobs[index] = {
    ...existingJob,
    ...body,
    targetConfig: body?.targetConfig || existingJob.targetConfig,
    exporterBinding: body?.exporterBinding || existingJob.exporterBinding,
    edgeGateway: body?.edgeGateway || existingJob.edgeGateway,
    tags: Array.isArray(body?.tags) ? body.tags : existingJob.tags,
    updatedAt: new Date().toISOString()
};
```

---

**問題 7：PUT /resource-groups 缺少 updatedAt 更新**

**具體位置：** handlers.ts:854-858

**問題描述：** 未更新 `updatedAt` 欄位。

**建議修復方式：**
```typescript
// 修改 line 857
DB.resourceGroups[groupIndex] = {
    ...DB.resourceGroups[groupIndex],
    ...body,
    updatedAt: new Date().toISOString()
};
```

---

**問題 8：PATCH /automation/scripts 缺少 updatedAt 更新**

**具體位置：** handlers.ts:988-995

**問題描述：** 未更新 `updatedAt` 欄位。

**建議修復方式：**
```typescript
// 修改 line 993
DB.playbooks[index] = {
    ...DB.playbooks[index],
    ...body,
    updatedAt: new Date().toISOString()
};
```

---

**問題 9：PATCH /automation/triggers 缺少 updatedAt 更新**

**具體位置：** handlers.ts:996-1002

**問題描述：** 未更新 `updatedAt` 欄位。

**建議修復方式：**
```typescript
// 修改 line 1000
DB.automationTriggers[index] = {
    ...DB.automationTriggers[index],
    ...body,
    updatedAt: new Date().toISOString()
};
```

---

**問題 10：PATCH /iam (users/teams/roles) 已實作**

**具體位置：** handlers.ts:1120-1132

**狀態：** ✓ 已正確實作 (line 1127-1129)

---

**問題 11：PATCH /settings/notification-channels 缺少 updatedAt 更新**

**具體位置：** handlers.ts:1421-1425

**問題描述：** 未更新 `updatedAt` 欄位。

**建議修復方式：**
```typescript
// 修改 line 1424
DB.notificationChannels[index] = {
    ...DB.notificationChannels[index],
    ...body,
    updatedAt: new Date().toISOString()
};
```

---

### 4.3 POST 端點中時間戳欄位初始化問題

**缺少 createdAt/updatedAt 初始化的端點：**

1. **POST /dashboards** (line 297-301) - 缺少時間戳
2. **POST /alert-rules** (line 536-537) - 缺少時間戳
3. **POST /silence-rules** (line 589-590) - 缺少時間戳
4. **POST /resources** (line 792-794) - 缺少時間戳
5. **POST /resource-groups** (line 851-852) - 缺少時間戳
6. **POST /automation/scripts** (line 939-940) - 缺少時間戳
7. **POST /automation/triggers** (line 982-983) - 缺少時間戳
8. **POST /settings/notification-channels** (line 1367-1368) - 缺少時間戳

**建議修復範例：**
```typescript
const timestamp = new Date().toISOString();
const newEntity = {
    ...body,
    id: `prefix-${uuidv4()}`,
    createdAt: timestamp,
    updatedAt: timestamp
};
```

**已正確實作時間戳的端點：**
- POST /incidents (line 387-421) ✓
- POST /iam/users (line 1069-1078) ✓
- POST /iam/teams (line 1088-1095) ✓
- POST /iam/roles (line 1105-1114) ✓
- POST /resources/datasources (line 711) ✓

---

## 5. 枚舉值一致性問題

### 5.1 枚舉定義與驗證對照

| 枚舉類型 | types.ts 定義 | handlers.ts 驗證 | 狀態 |
|---------|--------------|-----------------|------|
| IncidentStatus | 'New' \| 'Acknowledged' \| 'Resolved' \| 'Silenced' | 部分驗證 (line 436-454) | ⚠️ 缺少完整驗證 |
| IncidentSeverity | 'Critical' \| 'Warning' \| 'Info' | 有大小寫正規化 (line 389-390) | ⚠️ 缺少枚舉驗證 |
| IncidentImpact | 'High' \| 'Medium' \| 'Low' | 有大小寫正規化 (line 390) | ⚠️ 缺少枚舉驗證 |
| Resource.status | 'healthy' \| 'warning' \| 'critical' \| 'offline' | ✗ 無驗證 | ❌ 缺少 |
| User.role | 'Admin' \| 'SRE' \| 'Developer' \| 'Viewer' | ✗ 無驗證 | ❌ 缺少 |
| User.status | 'active' \| 'invited' \| 'inactive' | ✗ 無驗證 | ❌ 缺少 |
| AlertRule.severity | 'critical' \| 'warning' \| 'info' | ✗ 無驗證 | ❌ 缺少 |
| SilenceRule.type | 'single' \| 'repeat' \| 'condition' | ✗ 無驗證 | ❌ 缺少 |
| AutomationPlaybook.type | 'shell' \| 'python' \| 'ansible' \| 'terraform' | ✗ 無驗證 | ❌ 缺少 |
| AutomationExecution.status | 'success' \| 'failed' \| 'running' \| 'pending' | ✗ 無驗證 | ❌ 缺少 |
| TriggerType | 'Schedule' \| 'Webhook' \| 'Event' | ✗ 無驗證 | ❌ 缺少 |
| DatasourceType | 'VictoriaMetrics' \| 'Grafana' \| ... | ✗ 無驗證 | ❌ 缺少 |
| ConnectionStatus | 'ok' \| 'error' \| 'pending' | ✓ 部分驗證 (line 685, 703) | ⚠️ 硬編碼值 |
| DiscoveryJobKind | 'K8s' \| 'SNMP' \| 'Cloud Provider' \| ... | ✗ 無驗證 | ❌ 缺少 |

---

### 5.2 建議修復方式

**方案 1：在 handlers.ts 中添加枚舉驗證函數**

```typescript
// 在 handlers.ts 開頭添加
const validateEnum = <T>(value: any, allowedValues: T[], fieldName: string): T => {
    if (!allowedValues.includes(value as T)) {
        throw {
            status: 400,
            message: `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`
        };
    }
    return value as T;
};
```

**方案 2：為每個 POST/PATCH 端點添加枚舉驗證**

範例：
```typescript
// POST /incidents (在 line 389 前)
validateEnum(severity, ['Critical', 'Warning', 'Info'], 'severity');
validateEnum(impact, ['High', 'Medium', 'Low'], 'impact');

// POST /alert-rules (在 line 536 前)
validateEnum(body.severity, ['critical', 'warning', 'info'], 'severity');

// POST /iam/users (在 line 1070 前)
validateEnum(body.role, ['Admin', 'SRE', 'Developer', 'Viewer'], 'role');
```

---

### 5.3 大小寫不一致問題

**問題描述：** 某些枚舉使用 PascalCase，某些使用 lowercase。

**具體位置：**
- IncidentStatus: **PascalCase** ('New', 'Acknowledged')
- IncidentSeverity: **PascalCase** ('Critical', 'Warning')
- IncidentImpact: **PascalCase** ('High', 'Medium')
- Resource.status: **lowercase** ('healthy', 'warning')
- AlertRule.severity: **lowercase** ('critical', 'warning')
- User.role: **PascalCase** ('Admin', 'SRE')

**建議修復方式：**
統一使用 lowercase 風格，或在 API 層進行大小寫轉換。

---

## 6. 軟刪除實作問題

### 6.1 軟刪除實作狀態

| 實體 | 有 deleted_at | DELETE 實作軟刪除 | GET 過濾 deleted_at | 狀態 |
|------|--------------|------------------|-------------------|------|
| Dashboard | ✓ | ✓ (line 312) | ✓ (line 281) | ✓ 完整 |
| ResourceGroup | ✓ | ✓ (line 861) | ✓ (line 844) | ✓ 完整 |
| AutomationPlaybook | ✓ | ✓ (line 1009) | ✓ (line 867) | ✓ 完整 |
| AutomationExecution | ✓ | ✗ 無 DELETE 端點 | ✗ 無過濾 (line 877) | ⚠️ 部分 |
| AutomationTrigger | ✓ | ✓ (line 1015) | ✓ (line 870) | ✓ 完整 |
| Team | ✓ | ✓ (line 1137) | ✓ (line 1033) | ✓ 完整 |
| Role | ✓ | ✓ (line 1137) | ✓ (line 1041) | ✓ 完整 |
| AlertRule | ✓ | ✗ 硬刪除 (line 545) | ✓ (line 503) | ❌ 不一致 |
| SilenceRule | ✓ | ✗ 硬刪除 (line 598) | ✓ (line 550) | ❌ 不一致 |
| NotificationChannel | ✓ | ✓ (line 1467) | ✓ (line 1217) | ✓ 完整 |
| NotificationStrategy | ✓ | ✓ (line 1462) | ✓ (line 1209) | ✓ 完整 |
| TagDefinition | ✓ | ✗ 硬刪除 (line 1476) | ✗ 無過濾 (line 1190) | ❌ 不一致 |
| Datasource | ✓ | ✓ (line 829) | ✓ (line 604) | ✓ 完整 |
| DiscoveryJob | ✓ | ✓ (line 835) | ✓ (line 614) | ✓ 完整 |
| Resource | ✗ 無 deleted_at | 軟刪除 (line 839) | ✓ (line 642) | ⚠️ 類型缺欄位 |
| User | ✗ 無 deleted_at | 軟刪除 (line 1137) | ✓ (line 1025) | ⚠️ 類型缺欄位 |
| Incident | ✗ 無 deleted_at | ✗ 無 DELETE 端點 | ✗ 無過濾 | - |

---

### 6.2 關鍵問題

**問題 1：AlertRule 和 SilenceRule 使用硬刪除**

**具體位置：**
- handlers.ts:544-546 (DELETE /alert-rules)
- handlers.ts:597-599 (DELETE /silence-rules)

**問題描述：** 雖然類型定義有 `deleted_at`，但 DELETE 端點使用 `filter()` 進行硬刪除。

**建議修復方式：**
```typescript
// DELETE /alert-rules (修改 line 544-546)
case 'DELETE /alert-rules': {
    const ruleIndex = DB.alertRules.findIndex((r: any) => r.id === id);
    if (ruleIndex > -1) DB.alertRules[ruleIndex].deleted_at = new Date().toISOString();
    return {};
}

// DELETE /silence-rules (修改 line 597-599)
case 'DELETE /silence-rules': {
    const ruleIndex = DB.silenceRules.findIndex((r: any) => r.id === id);
    if (ruleIndex > -1) DB.silenceRules[ruleIndex].deleted_at = new Date().toISOString();
    return {};
}
```

---

**問題 2：TagDefinition 使用硬刪除**

**具體位置：** handlers.ts:1470-1478

**問題描述：** 使用 `splice()` 進行硬刪除。

**建議修復方式：**
```typescript
// 修改 line 1476
DB.tagDefinitions[index].deleted_at = new Date().toISOString();
```

同時修改 GET /settings/tags (line 1190) 以過濾已刪除項目：
```typescript
let tags = DB.tagDefinitions.filter((t: any) => !t.deleted_at);
```

---

**問題 3：Resource 和 User 類型缺少 deleted_at 欄位**

**具體位置：**
- types.ts:156-173 (Resource 介面)
- types.ts:285-295 (User 介面)

**問題描述：** handlers.ts 中使用了軟刪除，但類型定義缺少 `deleted_at` 欄位。

**建議修復方式：**
在 types.ts 中添加欄位：
```typescript
// Resource 介面 (line 173 後)
deleted_at?: string;

// User 介面 (line 295 後)
deleted_at?: string;
```

---

**問題 4：AutomationExecution 的 GET 端點未過濾軟刪除**

**具體位置：** handlers.ts:876-885

**問題描述：** 直接使用 `DB.automationExecutions` 而非 `getActive(DB.automationExecutions)`。

**建議修復方式：**
```typescript
// 修改 line 877
let executions = getActive(DB.automationExecutions);
```

---

### 6.3 批次刪除操作一致性

**已正確實作軟刪除的批次操作：**
- POST /dashboards/batch-actions (line 294) ✓
- POST /resources/batch-actions (line 786) ✓
- POST /iam/users/batch-actions (line 1062) ✓
- POST /iam/teams/batch-actions (line 1085) ✓
- POST /iam/roles/batch-actions (line 1102) ✓
- POST /automation/scripts/batch-actions (line 898-901) ✓
- POST /automation/triggers/batch-actions (line 977) ✓

**使用硬刪除的批次操作：**
- POST /silence-rules/batch-actions (line 576-577) - 使用 `splice()` ❌

**建議修復：**
```typescript
// 修改 line 576-577
if (action === 'delete') {
    DB.silenceRules[ruleIndex].deleted_at = new Date().toISOString();
}
```

---

## 7. 分頁與排序支援

### 7.1 分頁支援狀態

| 端點 | 支援分頁 | 實作位置 |
|------|---------|---------|
| GET /incidents | ✓ | line 368 |
| GET /dashboards | ✓ | line 289 |
| GET /resources | ✓ | line 647 |
| GET /automation/triggers | ✓ | line 874 |
| GET /automation/executions | ✓ | line 885 |
| GET /iam/users | ✓ | line 1030 |
| GET /iam/teams | ✓ | line 1038 |
| GET /iam/roles | ✓ | line 1046 |
| GET /iam/audit-logs | ✓ | line 1054 |
| GET /settings/notification-history | ✓ | line 1229 |
| GET /settings/tags | ✓ | line 1195-1202 |
| GET /logs | ✓ | line 1182 |
| GET /me/login-history | ✓ | line 161 |

**未支援分頁的列表端點：**
- GET /alert-rules (line 512) - 回傳完整陣列 ❌
- GET /silence-rules (line 559) - 回傳完整陣列 ❌
- GET /resources/datasources (line 608) - 回傳完整陣列 ❌
- GET /resources/discovery-jobs (line 618) - 回傳完整陣列 ❌
- GET /resource-groups (line 848) - 回傳完整陣列 ❌
- GET /automation/scripts (line 867) - 回傳完整陣列 ❌
- GET /settings/notification-strategies (line 1214) - 回傳完整陣列 ❌
- GET /settings/notification-channels (line 1222) - 回傳完整陣列 ❌

**建議修復：**
所有列表端點都應支援分頁，範例：
```typescript
// 修改 GET /alert-rules (line 512)
return paginate(rules, params?.page, params?.page_size);
```

---

### 7.2 排序支援狀態

| 端點 | 支援排序 | 實作位置 |
|------|---------|---------|
| GET /dashboards | ✓ | line 286-288 |
| GET /incidents | ✓ | line 365-367 |
| GET /alert-rules | ✓ | line 509-511 |
| GET /silence-rules | ✓ | line 556-558 |
| GET /resources | ✓ | line 644-646 |
| GET /resources/datasources | ✓ | line 605-607 |
| GET /resources/discovery-jobs | ✓ | line 615-617 |
| GET /resource-groups | ✓ | line 845-847 |
| GET /automation/executions | ✓ | line 882-884 |
| GET /iam/users | ✓ | line 1027-1029 |
| GET /iam/teams | ✓ | line 1035-1037 |
| GET /iam/roles | ✓ | line 1043-1045 |
| GET /iam/audit-logs | ✓ | line 1051-1053 |
| GET /settings/notification-strategies | ✓ | line 1211-1213 |
| GET /settings/notification-channels | ✓ | line 1219-1221 |
| GET /settings/notification-history | ✓ | line 1226-1228 |
| GET /settings/tags | ✓ | line 1191-1193 |

**未支援排序的列表端點：**
- GET /automation/scripts (line 867) ❌
- GET /automation/triggers (line 874) - 只有分頁 ❌
- GET /logs (line 1182) - 只有分頁 ❌

**建議修復：**
```typescript
// 修改 GET /automation/scripts (在 line 867 前添加)
if (params?.sort_by && params?.sort_order) {
    scripts = sortData(scripts, params.sort_by, params.sort_order);
}

// 修改 GET /automation/triggers (在 line 874 前添加)
if (params?.sort_by && params?.sort_order) {
    triggers = sortData(triggers, params.sort_by, params.sort_order);
}

// 修改 GET /logs (在 line 1182 前添加)
if (params?.sort_by && params?.sort_order) {
    logs = sortData(logs, params.sort_by, params.sort_order);
}
```

---

## 8. 批次操作一致性

### 8.1 批次操作支援對照

| 資源類型 | 端點 | 支援操作 | 實作位置 |
|---------|------|---------|---------|
| Dashboard | POST /dashboards/batch-actions | delete | line 292-295 |
| Resource | POST /resources/batch-actions | delete | line 784-787 |
| DiscoveredResource | POST /discovery/batch-ignore | ignore | line 97-110 |
| SilenceRule | POST /silence-rules/batch-actions | delete, enable, disable | line 568-584 |
| User | POST /iam/users/batch-actions | delete, disable | line 1060-1064 |
| Team | POST /iam/teams/batch-actions | delete | line 1083-1086 |
| Role | POST /iam/roles/batch-actions | delete | line 1100-1103 |
| AutomationScript | POST /automation/scripts/batch-actions | delete | line 891-907 |
| AutomationTrigger | POST /automation/triggers/batch-actions | enable, disable, delete | line 963-980 |

**缺少批次操作的資源類型：**
- AlertRule ❌
- NotificationChannel ❌
- NotificationStrategy ❌
- ResourceGroup ❌
- Datasource ❌
- DiscoveryJob ❌
- TagDefinition ❌

---

### 8.2 批次操作參數一致性問題

**問題描述：** 不同批次操作端點使用不同的參數名稱。

**具體位置：**
- 大部分使用 `{ action, ids }` ✓
- POST /discovery/batch-ignore 使用 `{ resourceIds }` (line 98) ⚠️

**建議修復方式：**
統一使用 `{ action, ids }` 格式：
```typescript
// 修改 line 97-110
if (id === 'batch-actions') {
    const { action, ids = [] } = body || {};
    if (action !== 'ignore' || !Array.isArray(ids)) {
        throw { status: 400, message: 'Invalid payload for batch actions.' };
    }
    ids.forEach((resourceId: string) => {
        const index = DB.discoveredResources.findIndex((res: any) => res.id === resourceId);
        if (index > -1) {
            DB.discoveredResources[index].status = 'ignored';
            DB.discoveredResources[index].ignoredAt = new Date().toISOString();
        }
    });
    return { success: true, updated: ids.length };
}
```

---

### 8.3 批次操作錯誤處理

**問題描述：** 大部分批次操作未驗證 action 參數的有效性。

**建議修復方式：**
在所有批次操作中添加 action 驗證：
```typescript
const validActions = ['delete', 'enable', 'disable']; // 根據端點調整
if (!validActions.includes(action)) {
    throw { status: 400, message: `Unsupported action: ${action}` };
}
```

**已正確實作的範例：**
- POST /automation/scripts/batch-actions (line 905) ✓
- POST /automation/triggers/batch-actions (line 968-970) ✓

---

## 9. 其他發現的問題

### 9.1 自動填充標籤不一致

**問題描述：** `autoPopulateReadonlyTags()` 函數只在 POST /incidents 中使用，其他實體未使用。

**具體位置：**
- 函數定義：handlers.ts:58-78
- 使用處：handlers.ts:419 (僅 POST /incidents)

**應該使用但未使用的地方：**
- POST /dashboards (line 297) - Dashboard 有 teamId/ownerId
- POST /alert-rules (line 536) - AlertRule 有 teamId/ownerId
- POST /resources (line 792) - Resource 有 teamId/ownerId

**建議修復方式：**
在所有創建有 teamId/ownerId 的實體時調用此函數：
```typescript
// 在創建實體後調用
autoPopulateReadonlyTags(newEntity);
```

---

### 9.2 Datasource 的 lastRun vs lastRunAt 不一致

**問題描述：** DiscoveryJob 在 handlers.ts 中使用 `lastRun`，但 types.ts 定義為 `lastRunAt`。

**具體位置：**
- types.ts:1041 - 定義為 `lastRunAt: string;`
- handlers.ts:745 - 使用 `lastRun: 'N/A'`
- handlers.ts:737 - 使用 `lastRun`

**建議修復方式：**
修改 handlers.ts 使用正確的欄位名：
```typescript
// line 745
lastRunAt: 'N/A',

// line 737
DB.discoveryJobs[idx].lastRunAt = new Date().toISOString();
```

---

### 9.3 NotificationStrategy 的 lastUpdated vs updatedAt 不一致

**問題描述：** handlers.ts 使用 `lastUpdated`，但 types.ts 定義為 `updatedAt`。

**具體位置：**
- types.ts:481 - 定義為 `updatedAt: string;`
- handlers.ts:1356 - 使用 `lastUpdated`
- handlers.ts:1417 - 使用 `lastUpdated`

**建議修復方式：**
修改 handlers.ts 使用 `updatedAt`：
```typescript
// line 1356
updatedAt: new Date().toISOString(),

// line 1417
updatedAt: new Date().toISOString()
```

---

### 9.4 缺少 createdAt/updatedAt 的類型定義

**問題描述：** 以下類型定義缺少 `createdAt` 和/或 `updatedAt` 欄位。

**具體位置：**
- AutomationExecution (types.ts:225-241) - 缺少兩者
- TagDefinition (types.ts:556-561) - 缺少兩者
- AuditLog (types.ts:325-334) - 只有 timestamp，缺少 createdAt
- NotificationHistoryRecord (types.ts:485-494) - 只有 timestamp，缺少 createdAt

**建議修復方式：**
1. AutomationExecution 和 TagDefinition 應添加：
```typescript
createdAt: string;
updatedAt: string;
```

2. AuditLog 和 NotificationHistoryRecord 的 `timestamp` 實際上就是 `createdAt`，可保持現狀或添加別名。

---

### 9.5 ResourceGroup 的 ownerTeam vs teamId 不一致

**問題描述：** ResourceGroup 使用 `ownerTeam: string`，而其他實體使用 `teamId: string`。

**具體位置：**
- types.ts:187 - ResourceGroup 使用 `ownerTeam: string;`
- 其他實體使用 `teamId?: string;`

**建議修復方式：**
為保持一致性，考慮：
1. 將 `ownerTeam` 改為 `teamId`，或
2. 添加 `teamId` 欄位並棄用 `ownerTeam`

---

## 總結

### 問題統計

| 問題類型 | 發現數量 | 嚴重程度 |
|---------|---------|---------|
| 欄位命名不一致 | 15+ 處 | 🔴 高 |
| 缺少外鍵驗證 | 5 個端點 | 🔴 高 |
| 缺少必填欄位驗證 | 10 個端點 | 🔴 高 |
| updatedAt 未更新 | 10 個端點 | 🟡 中 |
| createdAt 未初始化 | 8 個端點 | 🟡 中 |
| 缺少枚舉驗證 | 12 個枚舉類型 | 🟡 中 |
| 軟刪除實作不一致 | 6 個實體 | 🔴 高 |
| 缺少分頁支援 | 8 個端點 | 🟢 低 |
| 缺少排序支援 | 3 個端點 | 🟢 低 |
| 批次操作不一致 | 7 個資源類型 | 🟡 中 |
| 其他問題 | 5 項 | 🟡 中 |

### 優先修復建議

**第一優先 (P0)：**
1. 統一時間戳欄位命名 (deleted_at → deletedAt)
2. 修復軟刪除不一致 (AlertRule, SilenceRule, TagDefinition)
3. 為所有 POST 端點添加必填欄位驗證
4. 為所有 PATCH 端點添加 updatedAt 更新

**第二優先 (P1)：**
5. 添加外鍵關聯驗證
6. 添加枚舉值驗證
7. 統一批次操作參數格式
8. 為 POST 端點添加時間戳初始化

**第三優先 (P2)：**
9. 為列表端點添加分頁支援
10. 為列表端點添加排序支援
11. 修復欄位名稱不一致 (lastRun, lastUpdated 等)
12. 擴展 autoPopulateReadonlyTags 使用範圍

---

**報告完成**
