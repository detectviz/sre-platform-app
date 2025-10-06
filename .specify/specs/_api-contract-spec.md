# API Contract 總規範 (API Contract Specification)

**建立日期**: 2025-10-07
**狀態**: Draft
**目的**: 定義前後端 API 協作契約,支援 Mock Server 驅動開發
**依據**: `_resolution-plan-phase3.md` + RBAC + Observability + Auditing

---

## 一、API 設計原則

### 1.1 RESTful API 基礎原則

- **資源導向**: 使用名詞表示資源 (`/api/incidents`, `/api/users`)
- **HTTP 方法語義**:
  - `GET` - 查詢
  - `POST` - 建立
  - `PUT/PATCH` - 更新
  - `DELETE` - 刪除
- **版本控制**: 所有 API 使用 `/api/v1/` 路徑前綴
- **統一格式**: JSON 格式請求與回應

### 1.2 前後端職責劃分

| 項目 | 前端職責 | 後端職責 |
|------|---------|---------|
| **權限控制** | UI 顯示/隱藏 (UX 優化) | API 層級嚴格驗證 (安全保障) |
| **資料驗證** | 即時回饋 (提升體驗) | 最終驗證 (確保資料完整性) |
| **業務邏輯** | 視覺化與互動 | 計算與持久化 |
| **審計日誌** | 無需介入 | 自動記錄所有 CUD 操作 |
| **可觀測性** | 上報前端指標 | 提供 API 效能追蹤 |

---

## 二、統一 API 回應格式

### 2.1 成功回應格式

#### 2.1.1 單一資源查詢 (GET /api/resources/:id)
```json
{
  "data": {
    "id": "res-001",
    "name": "Resource Name",
    "status": "active",
    "createdAt": "2025-10-06T10:00:00Z",
    "updatedAt": "2025-10-06T10:00:00Z"
  }
}
```

#### 2.1.2 列表查詢 (GET /api/resources)
```json
{
  "data": [
    { "id": "res-001", "name": "Resource 1" },
    { "id": "res-002", "name": "Resource 2" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### 2.1.3 建立資源 (POST /api/resources)
```json
{
  "data": {
    "id": "res-003",
    "name": "New Resource",
    "createdAt": "2025-10-06T10:00:00Z"
  },
  "message": "資源建立成功"
}
```

**HTTP 狀態碼**: `201 Created`

#### 2.1.4 更新資源 (PUT/PATCH /api/resources/:id)
```json
{
  "data": {
    "id": "res-001",
    "name": "Updated Resource",
    "updatedAt": "2025-10-06T10:05:00Z"
  },
  "message": "資源更新成功"
}
```

**HTTP 狀態碼**: `200 OK`

#### 2.1.5 刪除資源 (DELETE /api/resources/:id)
```json
{
  "message": "資源刪除成功"
}
```

**HTTP 狀態碼**: `204 No Content` (無 Body) 或 `200 OK` (有 Body)

---

### 2.2 錯誤回應格式

#### 2.2.1 統一錯誤結構
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "使用者可讀的錯誤訊息",
    "details": {
      "field": "email",
      "reason": "格式不正確"
    },
    "requestId": "req-abc123",
    "timestamp": "2025-10-06T10:00:00Z"
  }
}
```

#### 2.2.2 常見錯誤碼

| HTTP 狀態碼 | 錯誤碼 | 用途 | 範例訊息 |
|-----------|-------|------|---------|
| 400 | `VALIDATION_ERROR` | 參數驗證失敗 | 「email 欄位格式不正確」 |
| 400 | `INVALID_REQUEST` | 請求格式錯誤 | 「缺少必填欄位 name」 |
| 401 | `UNAUTHORIZED` | 未授權 | 「未登入或 Token 已過期」 |
| 403 | `FORBIDDEN` | 權限不足 | 「您沒有權限執行此操作」 |
| 404 | `NOT_FOUND` | 資源不存在 | 「找不到 ID 為 res-001 的資源」 |
| 409 | `CONFLICT` | 資源衝突 | 「資源名稱已存在」 |
| 422 | `BUSINESS_LOGIC_ERROR` | 業務邏輯驗證失敗 | 「無法刪除已被引用的資源」 |
| 429 | `RATE_LIMIT_EXCEEDED` | 速率限制 | 「請求過於頻繁,請稍後再試」 |
| 500 | `INTERNAL_SERVER_ERROR` | 伺服器內部錯誤 | 「系統發生錯誤,請聯繫管理員」 |
| 503 | `SERVICE_UNAVAILABLE` | 服務暫時無法使用 | 「系統維護中,請稍後再試」 |

#### 2.2.3 欄位驗證錯誤範例
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "輸入資料驗證失敗",
    "details": {
      "fields": [
        { "field": "email", "message": "格式不正確" },
        { "field": "age", "message": "必須大於 0" }
      ]
    },
    "requestId": "req-abc123",
    "timestamp": "2025-10-06T10:00:00Z"
  }
}
```

---

## 三、認證與授權 (RBAC)

### 3.1 認證機制

#### 3.1.1 JWT Token 格式
```
Authorization: Bearer <jwt-token>
```

#### 3.1.2 登入 API
```
POST /api/v1/auth/login
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-abc123",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "name": "User Name",
      "avatar": "https://..."
    }
  }
}
```

#### 3.1.3 刷新 Token API
```
POST /api/v1/auth/refresh
Request:
{
  "refreshToken": "refresh-token-abc123"
}

Response (200 OK):
{
  "data": {
    "accessToken": "new-jwt-token...",
    "expiresIn": 3600
  }
}
```

#### 3.1.4 登出 API
```
POST /api/v1/auth/logout
Response (204 No Content)
```

---

### 3.2 權限控制 (RBAC)

#### 3.2.1 權限格式

權限採用 `resource:action` 格式:

| 權限字串 | 說明 |
|---------|------|
| `incidents:read` | 查看事件 |
| `incidents:update` | 修改事件 (認領/解決/指派) |
| `incidents:delete` | 刪除事件 |
| `users:create` | 建立使用者 (邀請) |
| `users:delete` | 刪除使用者 |
| `settings:roles:write` | 管理角色 |
| `settings:auth:read` | 查看驗證設定 |
| `alert-rules:create` | 建立告警規則 |
| `alert-rules:update` | 修改告警規則 |

#### 3.2.2 獲取當前使用者權限 API
```
GET /api/v1/me/permissions

Response (200 OK):
{
  "data": {
    "permissions": [
      "incidents:read",
      "incidents:update",
      "users:create",
      "settings:roles:write"
    ],
    "roles": [
      { "id": "role-001", "name": "Admin" }
    ]
  }
}
```

#### 3.2.3 前端權限檢查

**React Hook 範例**:
```typescript
const { hasPermission } = usePermissions();

// 單一權限檢查
if (hasPermission('incidents:delete')) {
  return <Button danger>刪除</Button>;
}

// 多權限檢查 (任一即可)
if (hasPermission(['incidents:update', 'incidents:delete'])) {
  return <ActionMenu />;
}
```

**路由保護範例**:
```typescript
<Route
  path="/settings"
  element={
    <RequirePermission permission="settings:read">
      <SettingsPage />
    </RequirePermission>
  }
/>
```

#### 3.2.4 後端權限驗證

**後端必須在 API 層級嚴格驗證權限**:
```
// 範例: 刪除事件
DELETE /api/v1/incidents/:id

// 後端檢查邏輯
if (!user.hasPermission('incidents:delete')) {
  return 403 Forbidden {
    "error": {
      "code": "FORBIDDEN",
      "message": "您沒有權限刪除事件"
    }
  }
}
```

---

## 四、分頁、篩選、排序

### 4.1 分頁參數

#### 4.1.1 Query String 格式
```
GET /api/v1/resources?page=1&pageSize=20
```

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `page` | number | 1 | 頁碼 (從 1 開始) |
| `pageSize` | number | 20 | 每頁筆數 |

#### 4.1.2 回應格式
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 4.2 篩選參數

#### 4.2.1 Query String 格式
```
GET /api/v1/incidents?filter[status]=active&filter[severity]=critical
```

**格式**: `filter[fieldName]=value`

#### 4.2.2 支援的運算子

| 運算子 | Query String | 範例 |
|-------|-------------|------|
| 等於 | `filter[status]=active` | 狀態等於 active |
| 不等於 | `filter[status][ne]=resolved` | 狀態不等於 resolved |
| 包含 | `filter[tags][in]=prod,staging` | 標籤包含 prod 或 staging |
| 範圍 | `filter[createdAt][gte]=2025-01-01` | 建立時間 >= 2025-01-01 |
| 模糊搜尋 | `filter[name][like]=%server%` | 名稱包含 server |

#### 4.2.3 複雜篩選 (JSON 格式)

對於複雜篩選條件,使用 POST 請求:
```
POST /api/v1/resources/search
Request:
{
  "filters": {
    "and": [
      { "field": "status", "operator": "eq", "value": "active" },
      { "field": "severity", "operator": "in", "value": ["critical", "high"] }
    ]
  },
  "page": 1,
  "pageSize": 20
}
```

---

### 4.3 排序參數

#### 4.3.1 Query String 格式
```
GET /api/v1/incidents?sort=-createdAt,severity
```

**格式**:
- 升序: `sort=fieldName`
- 降序: `sort=-fieldName` (前綴 `-`)
- 多欄位: `sort=-createdAt,severity` (逗號分隔)

#### 4.3.2 預設排序

每個 API 應定義預設排序規則:
- 列表頁面: `-createdAt` (最新優先)
- 搜尋結果: `relevance` (相關性優先)

---

## 五、快取策略

### 5.1 HTTP 快取標頭

#### 5.1.1 強快取 (Cache-Control)
```
Cache-Control: max-age=300, public
```

**適用場景**:
- 靜態配置 API (如 `/api/options`)
- 不常變動的資料 (如標籤列表)

#### 5.1.2 協商快取 (ETag)
```
Response Headers:
  ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
  Cache-Control: no-cache

Request Headers (後續請求):
  If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

Response (304 Not Modified):
  (無 Body,使用快取)
```

**適用場景**:
- 資源詳情頁面
- Drawer 預載入內容

#### 5.1.3 禁用快取
```
Cache-Control: no-store, no-cache, must-revalidate
```

**適用場景**:
- 即時資料 (如事件列表)
- 敏感資料 (如使用者權限)

---

### 5.2 快取時間 (TTL) 參數

#### 5.2.1 API 回應包含快取時間
```json
{
  "data": {...},
  "meta": {
    "cacheTTL": 300,
    "updatedAt": "2025-10-06T10:00:00Z"
  }
}
```

#### 5.2.2 前端快取策略 (React Query)
```typescript
// 使用後端提供的 cacheTTL
const { data } = useQuery({
  queryKey: ['resources', id],
  queryFn: fetchResource,
  staleTime: data.meta.cacheTTL * 1000, // 轉換為毫秒
  cacheTime: data.meta.cacheTTL * 1000 * 2
});
```

---

## 六、審計日誌 (Auditing)

### 6.1 審計日誌觸發原則

**後端必須記錄所有 CUD 操作**:
- ✅ **Create**: 建立資源 (POST)
- ✅ **Update**: 更新資源 (PUT/PATCH)
- ✅ **Delete**: 刪除資源 (DELETE)
- ✅ **高風險 Read**: 查看敏感設定 (如 SMTP 密碼)
- ✅ **Execute**: 執行操作 (如執行 Playbook)

### 6.2 審計日誌格式

#### 6.2.1 日誌欄位
```json
{
  "id": "audit-001",
  "timestamp": "2025-10-06T10:00:00Z",
  "actor": {
    "userId": "user-001",
    "userName": "admin@example.com",
    "userIp": "192.168.1.100"
  },
  "action": "INCIDENT.RESOLVE",
  "target": {
    "targetId": "inc-001",
    "targetType": "incident",
    "targetName": "系統告警"
  },
  "result": "success",
  "details": {
    "before": { "status": "active" },
    "after": { "status": "resolved" }
  }
}
```

#### 6.2.2 操作類型 (Action)

格式: `RESOURCE.ACTION`

| Action | 說明 | 範例 |
|--------|------|------|
| `USER.CREATE` | 建立使用者 | 邀請新使用者 |
| `USER.UPDATE` | 更新使用者 | 修改使用者資料 |
| `USER.DELETE` | 刪除使用者 | 刪除使用者帳號 |
| `ROLE.UPDATE` | 修改角色 | 更新角色權限 |
| `INCIDENT.RESOLVE` | 解決事件 | 關閉告警事件 |
| `PLAYBOOK.EXECUTE` | 執行劇本 | 手動執行自動化劇本 |
| `CONFIG.UPDATE` | 更新配置 | 修改系統設定 |

### 6.3 前端職責

**前端無需主動發送審計日誌**,僅需:
- 呼叫 API 時傳遞完整資訊
- 提供審計日誌查詢頁面 (讀取後端日誌)

---

## 七、可觀測性 (Observability)

### 7.1 前端可觀測性

#### 7.1.1 整合 SDK (Sentry / OpenTelemetry)
```typescript
// src/index.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://...',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### 7.1.2 自動收集指標
- **Core Web Vitals**: LCP, FID/INP, CLS
- **API 呼叫**: 延遲、狀態碼、大小
- **錯誤追蹤**: JavaScript 錯誤、未處理的 Promise Rejection

#### 7.1.3 自訂效能標記
```typescript
// 複雜元件效能追蹤
const transaction = Sentry.startTransaction({
  name: 'TopologyGraphRender',
});

// 渲染拓撲圖
renderTopologyGraph();

transaction.finish();
```

---

### 7.2 後端可觀測性

#### 7.2.1 API 回應包含追蹤 ID
```
Response Headers:
  X-Request-ID: req-abc123
  X-Trace-ID: trace-xyz789
```

**前端可將此 ID 用於錯誤回報與日誌追蹤**

#### 7.2.2 API 效能指標
後端應提供 Prometheus 格式指標:
- `http_request_duration_seconds` (API 延遲)
- `http_request_total` (API 請求總數)
- `http_request_errors_total` (API 錯誤總數)

---

## 八、批次操作 API

### 8.1 批次操作設計

#### 8.1.1 批次刪除
```
POST /api/v1/incidents/batch-delete
Request:
{
  "ids": ["inc-001", "inc-002", "inc-003"]
}

Response (200 OK):
{
  "data": {
    "success": ["inc-001", "inc-002"],
    "failed": [
      { "id": "inc-003", "reason": "權限不足" }
    ],
    "total": 3,
    "successCount": 2,
    "failedCount": 1
  },
  "message": "批次刪除完成,2 個成功,1 個失敗"
}
```

#### 8.1.2 批次更新
```
POST /api/v1/incidents/batch-update
Request:
{
  "ids": ["inc-001", "inc-002"],
  "updates": {
    "status": "resolved",
    "assignee": "user-001"
  }
}

Response (200 OK):
{
  "data": {
    "success": ["inc-001", "inc-002"],
    "failed": [],
    "successCount": 2,
    "failedCount": 0
  }
}
```

---

### 8.2 批次操作限制

#### 8.2.1 獲取批次限制 API
```
GET /api/v1/config/batch-limits

Response (200 OK):
{
  "data": {
    "maxBatchSize": 100,
    "recommendedBatchSize": 50,
    "limits": {
      "delete": 20,
      "update": 100,
      "export": 1000
    }
  }
}
```

#### 8.2.2 超過限制錯誤
```
Response (400 Bad Request):
{
  "error": {
    "code": "BATCH_SIZE_EXCEEDED",
    "message": "批次操作最多 100 個資源",
    "details": {
      "maxBatchSize": 100,
      "requestedSize": 150
    }
  }
}
```

---

## 九、配置參數 API (Config API)

### 9.1 統一配置端點

#### 9.1.1 保留時長配置
```
GET /api/v1/config/retention/:type

Parameters:
  :type = automation-history | audit-logs | logs | notification-history

Response (200 OK):
{
  "data": {
    "retentionDays": 90,
    "minRetentionDays": 7,
    "maxRetentionDays": 365,
    "archiveEnabled": true,
    "archiveAfterDays": 30
  }
}
```

#### 9.1.2 並行限制配置
```
GET /api/v1/config/concurrency/:type

Parameters:
  :type = backtesting | log-queries | playbooks | triggers

Response (200 OK):
{
  "data": {
    "maxConcurrentTasks": 3,
    "queueSize": 10,
    "priorityLevels": ["high", "normal", "low"],
    "highPrioritySlots": 1
  }
}
```

#### 9.1.3 速率限制配置
```
GET /api/v1/config/rate-limit/:type

Parameters:
  :type = mail | api | automation

Response (200 OK):
{
  "data": {
    "maxRequestsPerMinute": 100,
    "maxRequestsPerHour": 1000,
    "burstAllowance": 20,
    "retryAfterSeconds": 60
  }
}
```

---

### 9.2 選項 API (Options API)

#### 9.2.1 統一選項端點
```
GET /api/v1/options

Response (200 OK):
{
  "data": {
    "statuses": [
      { "value": "active", "label": "啟用", "color": "success" },
      { "value": "inactive", "label": "停用", "color": "default" }
    ],
    "severities": [
      { "value": "critical", "label": "嚴重", "color": "error" },
      { "value": "high", "label": "高", "color": "warning" },
      { "value": "medium", "label": "中", "color": "info" },
      { "value": "low", "label": "低", "color": "default" }
    ],
    "operators": [
      { "value": "=", "label": "等於" },
      { "value": "!=", "label": "不等於" },
      { "value": "~=", "label": "包含 (正規表示式)" },
      { "value": ">", "label": "大於" },
      { "value": "<", "label": "小於" }
    ]
  }
}
```

**快取策略**: `Cache-Control: max-age=3600, public` (1 小時)

#### 9.2.2 動態選項 (資源選擇器)
```
GET /api/v1/options/users?search=admin

Response (200 OK):
{
  "data": [
    { "value": "user-001", "label": "admin@example.com", "avatar": "..." },
    { "value": "user-002", "label": "admin2@example.com", "avatar": "..." }
  ]
}
```

---

## 十、時間與日期格式

### 10.1 統一時間格式

**所有時間欄位使用 ISO 8601 格式**:
```
2025-10-06T10:00:00Z           # UTC 時間
2025-10-06T18:00:00+08:00      # 帶時區
```

### 10.2 時間範圍查詢
```
GET /api/v1/incidents?filter[createdAt][gte]=2025-10-01T00:00:00Z&filter[createdAt][lte]=2025-10-06T23:59:59Z
```

### 10.3 相對時間查詢
```
GET /api/v1/incidents?filter[createdAt][range]=last-7-days
```

**支援的相對時間**:
- `last-1-hour`
- `last-24-hours`
- `last-7-days`
- `last-30-days`
- `last-90-days`

---

## 十一、檔案上傳與下載

### 11.1 檔案上傳

#### 11.1.1 單檔上傳
```
POST /api/v1/upload
Content-Type: multipart/form-data

Form Data:
  file: (binary)

Response (200 OK):
{
  "data": {
    "fileId": "file-001",
    "fileName": "logo.png",
    "fileSize": 102400,
    "fileUrl": "https://cdn.example.com/files/file-001.png",
    "mimeType": "image/png"
  }
}
```

#### 11.1.2 大檔案分片上傳
```
POST /api/v1/upload/chunk
Request:
{
  "fileId": "file-001",
  "chunkIndex": 0,
  "totalChunks": 10,
  "chunkData": "base64..."
}

Response (200 OK):
{
  "data": {
    "uploaded": true,
    "progress": 10
  }
}
```

---

### 11.2 檔案下載

#### 11.2.1 直接下載
```
GET /api/v1/download/:fileId

Response Headers:
  Content-Type: application/octet-stream
  Content-Disposition: attachment; filename="export.csv"

Response Body:
  (binary data)
```

#### 11.2.2 匯出任務 (非同步)
```
POST /api/v1/export/incidents
Request:
{
  "format": "csv",
  "filters": {...}
}

Response (202 Accepted):
{
  "data": {
    "taskId": "task-001",
    "status": "processing",
    "estimatedTime": 60
  }
}

// 輪詢狀態
GET /api/v1/export/tasks/:taskId

Response (200 OK):
{
  "data": {
    "taskId": "task-001",
    "status": "completed",
    "downloadUrl": "https://cdn.example.com/exports/task-001.csv",
    "expiresAt": "2025-10-07T10:00:00Z"
  }
}
```

---

## 十二、WebSocket 即時通訊

### 12.1 連線建立

#### 12.1.1 WebSocket URL
```
wss://api.example.com/ws?token=<jwt-token>
```

#### 12.1.2 連線確認
```
Client → Server:
{
  "type": "ping"
}

Server → Client:
{
  "type": "pong",
  "timestamp": "2025-10-06T10:00:00Z"
}
```

---

### 12.2 訂閱事件

#### 12.2.1 訂閱請求
```
Client → Server:
{
  "type": "subscribe",
  "channel": "incidents",
  "filters": {
    "status": "active",
    "severity": ["critical", "high"]
  }
}

Server → Client:
{
  "type": "subscribed",
  "channel": "incidents",
  "subscriptionId": "sub-001"
}
```

#### 12.2.2 接收事件
```
Server → Client:
{
  "type": "event",
  "channel": "incidents",
  "event": "created",
  "data": {
    "id": "inc-001",
    "title": "系統告警",
    "severity": "critical"
  },
  "timestamp": "2025-10-06T10:00:00Z"
}
```

#### 12.2.3 取消訂閱
```
Client → Server:
{
  "type": "unsubscribe",
  "subscriptionId": "sub-001"
}
```

---

## 十三、API 版本控制

### 13.1 版本策略

- **路徑版本**: `/api/v1/`, `/api/v2/`
- **向後相容**: 同一版本內不破壞相容性
- **棄用通知**: Header 提示即將棄用

```
Response Headers:
  X-API-Version: v1
  X-API-Deprecated: true
  X-API-Sunset: 2026-01-01
  X-API-Migration-Guide: https://docs.example.com/v2-migration
```

### 13.2 版本遷移

**前端應檢查棄用標頭並提前升級**:
```typescript
axios.interceptors.response.use((response) => {
  if (response.headers['x-api-deprecated'] === 'true') {
    console.warn('API 即將棄用:', response.config.url);
    console.warn('遷移指南:', response.headers['x-api-migration-guide']);
  }
  return response;
});
```

---

## 十四、Mock Server 契約

### 14.1 Mock 資料規範

#### 14.1.1 真實性要求
- 資料格式必須與 API Contract 一致
- 資料內容符合業務邏輯 (如狀態流轉)
- 時間戳使用近期時間

#### 14.1.2 資料完整性
- 提供正常場景資料
- 提供邊界場景資料 (空列表、單筆資料、大量資料)
- 提供錯誤場景資料 (400/403/404/500)

---

### 14.2 Mock Handlers 範例

#### 14.2.1 MSW Handler
```typescript
// src/mocks/handlers/incidents.ts
import { rest } from 'msw';

export const incidentHandlers = [
  // 列表查詢
  rest.get('/api/v1/incidents', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 20;

    return res(
      ctx.status(200),
      ctx.json({
        data: mockIncidents.slice((page - 1) * pageSize, page * pageSize),
        pagination: {
          page,
          pageSize,
          total: mockIncidents.length,
          totalPages: Math.ceil(mockIncidents.length / pageSize),
          hasNext: page * pageSize < mockIncidents.length,
          hasPrevious: page > 1
        }
      })
    );
  }),

  // 單筆查詢
  rest.get('/api/v1/incidents/:id', (req, res, ctx) => {
    const { id } = req.params;
    const incident = mockIncidents.find(i => i.id === id);

    if (!incident) {
      return res(
        ctx.status(404),
        ctx.json({
          error: {
            code: 'NOT_FOUND',
            message: `找不到 ID 為 ${id} 的事件`
          }
        })
      );
    }

    return res(ctx.status(200), ctx.json({ data: incident }));
  }),

  // 模擬延遲
  rest.get('/api/v1/incidents/slow', (req, res, ctx) => {
    return res(
      ctx.delay(3000),
      ctx.status(200),
      ctx.json({ data: mockIncidents })
    );
  }),

  // 模擬錯誤
  rest.get('/api/v1/incidents/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '系統發生錯誤'
        }
      })
    );
  })
];
```

---

### 14.3 環境切換

#### 14.3.1 開發環境啟用 Mock
```typescript
// src/index.tsx
if (process.env.REACT_APP_MOCK_ENABLED === 'true') {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}
```

#### 14.3.2 環境變數設定
```bash
# .env.development
REACT_APP_MOCK_ENABLED=true
REACT_APP_API_BASE_URL=/api/v1

# .env.production
REACT_APP_MOCK_ENABLED=false
REACT_APP_API_BASE_URL=https://api.example.com/api/v1
```

---

## 十五、Contract Testing

### 15.1 Pact 測試框架

#### 15.1.1 前端 Consumer 測試
```typescript
// src/tests/pact/incidents.spec.ts
import { pactWith } from 'jest-pact';
import { getIncidents } from '@/services/incidents';

pactWith({ consumer: 'Frontend', provider: 'Backend' }, (provider) => {
  describe('GET /api/v1/incidents', () => {
    beforeEach(() => {
      const interaction = {
        state: 'incidents exist',
        uponReceiving: 'a request for incidents',
        withRequest: {
          method: 'GET',
          path: '/api/v1/incidents',
          query: { page: '1', pageSize: '20' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            data: Matchers.eachLike({
              id: Matchers.string('inc-001'),
              title: Matchers.string('系統告警'),
              status: Matchers.term({ matcher: 'active|resolved', generate: 'active' })
            }),
            pagination: {
              page: 1,
              pageSize: 20,
              total: Matchers.integer(100),
              totalPages: Matchers.integer(5)
            }
          }
        }
      };

      return provider.addInteraction(interaction);
    });

    it('returns incidents list', async () => {
      const response = await getIncidents({ page: 1, pageSize: 20 });
      expect(response.data).toHaveLength(20);
      expect(response.pagination.total).toBeGreaterThan(0);
    });
  });
});
```

#### 15.1.2 後端 Provider 驗證
```bash
# 執行 Pact 驗證
pact-provider-verifier \
  --provider-base-url=http://localhost:3000 \
  --pact-urls=./pacts/frontend-backend.json \
  --provider-states-setup-url=http://localhost:3000/pact/setup
```

---

## 十六、API 文件生成

### 16.1 OpenAPI 3.0 規範

#### 16.1.1 基礎結構
```yaml
openapi: 3.0.0
info:
  title: SRE Platform API
  version: 1.0.0
  description: API 契約文件
servers:
  - url: https://api.example.com/api/v1
    description: 正式環境
  - url: http://localhost:3000/api/v1
    description: 開發環境
paths:
  /incidents:
    get:
      summary: 查詢事件列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/IncidentListResponse'
components:
  schemas:
    IncidentListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Incident'
        pagination:
          $ref: '#/components/schemas/Pagination'
```

#### 16.1.2 自動生成工具
- **Swagger UI**: 互動式 API 文件
- **Redoc**: 美觀的 API 文件
- **Prism**: Mock Server 生成

---

## 十七、總結

### 17.1 核心價值

1. ✅ **統一規範**: 所有 API 遵循一致的格式與規則
2. ✅ **前後端分離**: 透過 Contract 清晰劃分職責
3. ✅ **Mock 驅動**: 支援前端獨立開發與測試
4. ✅ **安全保障**: RBAC + 審計日誌 + 權限驗證
5. ✅ **可觀測性**: 全鏈路追蹤 + 效能監控

### 17.2 實施檢查清單

- [ ] 所有 API 符合統一格式
- [ ] 錯誤回應包含 `requestId`
- [ ] 權限驗證在後端嚴格執行
- [ ] 所有 CUD 操作記錄審計日誌
- [ ] API 回應包含快取標頭
- [ ] Mock Server 提供完整場景資料
- [ ] Contract Testing 通過

---

**文件完成日期**: 2025-10-07
**撰寫人員**: Claude Code (Spec Architect)
**審核狀態**: 待前後端團隊審閱
**版本**: v1.0.0
