# 後端參數規範總覽 (Backend Parameters Specification)

**建立日期**: 2025-10-07
**狀態**: Draft
**目的**: 集中定義所有後端參數 API 規範,支援前端 Mock 開發
**依據**: `_resolution-plan-phase3.md` + `_api-contract-spec.md`

---

## 使用說明

本文件集中定義所有**由後端決定的配置參數** API 規範。各模組 SPEC 僅需引用本文件對應章節即可。

**引用方式**:
```markdown
## N. [參數名稱] (Backend Parameter)

**定義**: 參見 `_backend-parameters-spec.md` § X.Y

**前端實作**: 透過 API 動態獲取參數,根據參數值調整 UI 行為。
```

---

## 一、認證與金鑰管理 (Authentication & Key Management)

### 1.1 SMTP 認證資訊的金鑰管理

**關聯模組**: `platform-mail-spec.md`

#### API 定義
```
GET /api/v1/config/mail/encryption
```

#### 回應格式
```json
{
  "data": {
    "encryptionEnabled": true,
    "keyManagementSystem": "vault",
    "encryptedFields": ["password", "apiKey"],
    "supportedAlgorithms": ["AES-256-GCM"]
  }
}
```

#### 參數說明

| 參數 | 類型 | 說明 |
|------|------|------|
| `encryptionEnabled` | boolean | 是否啟用加密 |
| `keyManagementSystem` | string | 金鑰管理系統 (`vault` / `kms` / `local`) |
| `encryptedFields` | string[] | 需加密的欄位列表 |
| `supportedAlgorithms` | string[] | 支援的加密演算法 |

#### Mock 資料
```json
{
  "data": {
    "encryptionEnabled": true,
    "keyManagementSystem": "vault",
    "encryptedFields": ["password", "apiKey", "token"],
    "supportedAlgorithms": ["AES-256-GCM", "RSA-2048"]
  }
}
```

#### 前端實作要求
- 顯示加密狀態圖示 (✅ 已加密)
- 敏感欄位使用密碼輸入框 (`type="password"`)
- 不允許讀取已儲存的密碼 (後端不回傳)
- 提供「測試連線」功能驗證認證資訊

---

### 1.2 渠道認證資訊的金鑰管理機制

**關聯模組**: `notification-channel-spec.md`

#### API 定義
```
GET /api/v1/channels/:id/credentials
```

#### 回應格式
```json
{
  "data": {
    "hasCredentials": true,
    "lastUpdated": "2025-10-06T10:00:00Z",
    "encryptionMethod": "AES-256-GCM",
    "fieldsRequired": ["apiKey", "apiSecret"],
    "expiresAt": null
  }
}
```

#### 參數說明

| 參數 | 類型 | 說明 |
|------|------|------|
| `hasCredentials` | boolean | 是否已設定認證資訊 |
| `lastUpdated` | string | 最後更新時間 (ISO 8601) |
| `encryptionMethod` | string | 加密方法 |
| `fieldsRequired` | string[] | 必填的認證欄位 |
| `expiresAt` | string | null | 認證過期時間 (若適用) |

#### Mock 資料
```json
{
  "data": {
    "hasCredentials": true,
    "lastUpdated": "2025-10-06T10:00:00Z",
    "encryptionMethod": "AES-256-GCM",
    "fieldsRequired": ["apiKey", "apiSecret", "webhookUrl"],
    "expiresAt": null
  }
}
```

#### 前端實作要求
- 顯示「已設定認證」狀態標籤
- 提供「更新認證」按鈕
- 不顯示實際認證資訊 (僅顯示「********」)
- 過期時間接近時顯示警告

---

### 1.3 授權檔案的簽章驗證機制

**關聯模組**: `platform-license-spec.md`

#### API 定義
```
POST /api/v1/license/verify
```

#### 請求格式
```json
{
  "licenseFile": "base64-encoded-file-content"
}
```

#### 回應格式 (成功)
```json
{
  "data": {
    "valid": true,
    "signature": "verified",
    "issuer": "SRE Platform Inc.",
    "issuedAt": "2025-01-01T00:00:00Z",
    "expiresAt": "2026-12-31T23:59:59Z",
    "licensedTo": "Example Corp",
    "features": ["premium", "multi-tenant"],
    "limits": {
      "maxUsers": 100,
      "maxResources": 1000
    }
  }
}
```

#### 回應格式 (失敗)
```json
{
  "error": {
    "code": "INVALID_LICENSE",
    "message": "授權檔案簽章驗證失敗",
    "details": {
      "reason": "signature_mismatch"
    }
  }
}
```

#### Mock 資料
```json
{
  "data": {
    "valid": true,
    "signature": "verified",
    "issuer": "SRE Platform Inc.",
    "issuedAt": "2025-01-01T00:00:00Z",
    "expiresAt": "2026-12-31T23:59:59Z",
    "licensedTo": "Example Corp",
    "features": ["premium", "multi-tenant", "advanced-analytics"],
    "limits": {
      "maxUsers": 100,
      "maxResources": 1000,
      "maxDashboards": 50
    }
  }
}
```

#### 前端實作要求
- 提供授權檔案上傳介面
- 顯示驗證進度 (Loading)
- 驗證成功: 顯示授權資訊 (發行者/有效期/授權對象)
- 驗證失敗: 顯示失敗原因 (紅色 Alert)

---

### 1.4 MFA 恢復碼的生成與管理機制

**關聯模組**: `profile-security-spec.md`

#### API 定義
```
POST /api/v1/user/mfa/recovery-codes/generate
```

#### 回應格式
```json
{
  "data": {
    "recoveryCodes": [
      "A1B2-C3D4-E5F6-G7H8",
      "I9J0-K1L2-M3N4-O5P6",
      "Q7R8-S9T0-U1V2-W3X4",
      "Y5Z6-A7B8-C9D0-E1F2",
      "G3H4-I5J6-K7L8-M9N0",
      "O1P2-Q3R4-S5T6-U7V8",
      "W9X0-Y1Z2-A3B4-C5D6",
      "E7F8-G9H0-I1J2-K3L4"
    ],
    "generatedAt": "2025-10-06T10:00:00Z",
    "expiresAt": null,
    "usedCodes": []
  }
}
```

#### 查詢恢復碼狀態 API
```
GET /api/v1/user/mfa/recovery-codes

Response:
{
  "data": {
    "totalCodes": 8,
    "usedCodes": 2,
    "remainingCodes": 6,
    "lastGeneratedAt": "2025-10-06T10:00:00Z"
  }
}
```

#### Mock 資料
```json
{
  "data": {
    "recoveryCodes": [
      "ABCD-1234-EFGH-5678",
      "IJKL-9012-MNOP-3456",
      "QRST-7890-UVWX-1234",
      "YZAB-5678-CDEF-9012",
      "GHIJ-3456-KLMN-7890",
      "OPQR-1234-STUV-5678",
      "WXYZ-9012-ABCD-3456",
      "EFGH-7890-IJKL-1234"
    ],
    "generatedAt": "2025-10-06T10:00:00Z",
    "expiresAt": null,
    "usedCodes": []
  }
}
```

#### 前端實作要求
- 生成後立即顯示恢復碼列表
- 提供「下載」按鈕 (TXT 檔案)
- 提供「列印」按鈕
- 顯示「請妥善保管,每個恢復碼僅能使用一次」警告
- 已使用的恢復碼標記為「已使用」(刪除線)

---

## 二、資料保留與歸檔 (Data Retention & Archiving)

### 2.1 統一保留策略 API

#### API 定義
```
GET /api/v1/config/retention/:type
```

**支援的類型 (type)**:
- `automation-history` - 自動化執行歷史
- `audit-logs` - 審計日誌
- `logs` - 日誌資料
- `notification-history` - 通知歷史
- `discovery-results` - 發現結果
- `incident-silence` - 靜音規則 (過期後)
- `resource-metrics` - 資源指標

#### 回應格式
```json
{
  "data": {
    "retentionDays": 90,
    "minRetentionDays": 7,
    "maxRetentionDays": 365,
    "archiveEnabled": true,
    "archiveAfterDays": 30,
    "compressionEnabled": true,
    "storageQuotaGB": 100,
    "currentUsageGB": 45.6
  }
}
```

#### 參數說明

| 參數 | 類型 | 說明 |
|------|------|------|
| `retentionDays` | number | 當前保留天數 |
| `minRetentionDays` | number | 最小保留天數 |
| `maxRetentionDays` | number | 最大保留天數 |
| `archiveEnabled` | boolean | 是否啟用歸檔 |
| `archiveAfterDays` | number | 多少天後歸檔 |
| `compressionEnabled` | boolean | 是否啟用壓縮 |
| `storageQuotaGB` | number | 儲存空間配額 (GB) |
| `currentUsageGB` | number | 當前使用量 (GB) |

---

### 2.2 特殊保留策略

#### 2.2.1 審計日誌 (audit-logs)

**特殊要求**:
- 最低保留期限: **30 天** (法規要求)
- 無法刪除,僅能歸檔
- 支援長期歸檔至外部儲存 (S3 / NAS)

```json
{
  "data": {
    "retentionDays": 180,
    "minRetentionDays": 30,
    "maxRetentionDays": 730,
    "archiveEnabled": true,
    "archiveAfterDays": 90,
    "archiveDestination": "s3://audit-logs-archive",
    "canDelete": false
  }
}
```

#### 2.2.2 靜音規則 (incident-silence)

**說明**: 過期靜音規則的清理策略

```json
{
  "data": {
    "autoCleanupEnabled": true,
    "cleanupAfterExpiredDays": 30,
    "keepHistoryDays": 90,
    "notifyBeforeCleanup": true
  }
}
```

#### 2.2.3 資源指標 (resource-metrics)

**說明**: 支援多級聚合保留策略

```json
{
  "data": {
    "aggregationLevels": {
      "raw": { "retentionDays": 7, "granularity": "1m" },
      "5min": { "retentionDays": 30, "granularity": "5m" },
      "1hour": { "retentionDays": 90, "granularity": "1h" },
      "1day": { "retentionDays": 365, "granularity": "1d" }
    },
    "updateIntervalSeconds": 60
  }
}
```

---

### 2.3 Mock 資料範例

#### automation-history
```json
{
  "data": {
    "retentionDays": 90,
    "minRetentionDays": 7,
    "maxRetentionDays": 365,
    "archiveEnabled": true,
    "archiveAfterDays": 30,
    "compressionEnabled": true,
    "storageQuotaGB": 50,
    "currentUsageGB": 12.3
  }
}
```

#### logs
```json
{
  "data": {
    "retentionDays": 30,
    "minRetentionDays": 7,
    "maxRetentionDays": 90,
    "maxQueryRangeDays": 90,
    "archiveEnabled": false,
    "compressionEnabled": true,
    "storageQuotaGB": 100,
    "currentUsageGB": 78.5
  }
}
```

---

### 2.4 前端實作要求

**設定頁面**:
- 顯示當前保留天數
- 提供滑桿調整 (限制在 min~max 範圍)
- 顯示儲存空間使用率進度條
- 接近配額時顯示警告 (> 80%)
- 審計日誌不提供刪除選項

**列表頁面**:
- 顯示資料保留期限提示
- 超過保留期限的資料標記為「即將清理」
- 歸檔的資料顯示「已歸檔」標籤

---

## 三、並行與限流 (Concurrency & Rate Limiting)

### 3.1 統一並行限制 API

#### API 定義
```
GET /api/v1/config/concurrency/:type
```

**支援的類型 (type)**:
- `backtesting` - 回測任務
- `log-queries` - 日誌查詢
- `playbooks` - 劇本執行
- `triggers` - 觸發器執行
- `auto-discovery` - 自動發現

#### 回應格式
```json
{
  "data": {
    "maxConcurrentTasks": 3,
    "queueSize": 10,
    "priorityLevels": ["high", "normal", "low"],
    "prioritySlots": {
      "high": 1,
      "normal": 2,
      "low": 0
    },
    "timeoutSeconds": 300
  }
}
```

#### 參數說明

| 參數 | 類型 | 說明 |
|------|------|------|
| `maxConcurrentTasks` | number | 最大並行任務數 |
| `queueSize` | number | 佇列大小 |
| `priorityLevels` | string[] | 支援的優先級 |
| `prioritySlots` | object | 各優先級保留槽位數 |
| `timeoutSeconds` | number | 任務逾時時間 (秒) |

---

### 3.2 統一速率限制 API

#### API 定義
```
GET /api/v1/config/rate-limit/:type
```

**支援的類型 (type)**:
- `mail` - 郵件發送
- `api` - API 請求
- `automation` - 自動化執行

#### 回應格式
```json
{
  "data": {
    "maxRequestsPerMinute": 100,
    "maxRequestsPerHour": 1000,
    "maxRequestsPerDay": 10000,
    "burstAllowance": 20,
    "retryAfterSeconds": 60,
    "algorithm": "token_bucket"
  }
}
```

#### 參數說明

| 參數 | 類型 | 說明 |
|------|------|------|
| `maxRequestsPerMinute` | number | 每分鐘最大請求數 |
| `maxRequestsPerHour` | number | 每小時最大請求數 |
| `maxRequestsPerDay` | number | 每天最大請求數 |
| `burstAllowance` | number | 突發流量容許量 |
| `retryAfterSeconds` | number | 限流後重試等待時間 |
| `algorithm` | string | 限流演算法 |

---

### 3.3 任務狀態查詢 API

#### API 定義
```
GET /api/v1/tasks/:type/status
```

#### 回應格式
```json
{
  "data": {
    "running": 2,
    "queued": 5,
    "maxConcurrent": 3,
    "queueSize": 10,
    "tasks": [
      {
        "id": "task-001",
        "status": "running",
        "priority": "high",
        "startedAt": "2025-10-06T10:00:00Z",
        "estimatedCompletionAt": "2025-10-06T10:05:00Z"
      },
      {
        "id": "task-002",
        "status": "queued",
        "priority": "normal",
        "queuePosition": 1,
        "estimatedStartAt": "2025-10-06T10:05:00Z"
      }
    ]
  }
}
```

---

### 3.4 Mock 資料範例

#### backtesting
```json
{
  "data": {
    "maxConcurrentTasks": 3,
    "queueSize": 10,
    "priorityLevels": ["high", "normal", "low"],
    "prioritySlots": {
      "high": 1,
      "normal": 2,
      "low": 0
    },
    "timeoutSeconds": 600,
    "currentRunning": 2,
    "currentQueued": 4
  }
}
```

#### mail
```json
{
  "data": {
    "maxRequestsPerMinute": 100,
    "maxRequestsPerHour": 1000,
    "maxRequestsPerDay": 10000,
    "burstAllowance": 20,
    "retryAfterSeconds": 60,
    "algorithm": "token_bucket",
    "currentUsage": {
      "minute": 45,
      "hour": 320,
      "day": 2150
    }
  }
}
```

---

### 3.5 前端實作要求

**並行控制**:
- 顯示「當前執行中: 2 / 3」
- 提供優先級選擇器
- 佇列已滿時禁用「執行」按鈕並顯示提示
- 顯示預估等待時間

**速率限制**:
- 發送失敗時顯示「請稍後再試 (60 秒後)」
- 接近限制時顯示警告 (> 80%)
- 顯示當前使用量統計

---

## 四、權限與隔離 (Permissions & Isolation)

### 4.1 敏感資訊脫敏規則

**關聯模組**: `automation-history-spec.md`, `identity-audit-spec.md`

#### API 定義
```
GET /api/v1/config/privacy/masking-rules
```

#### 回應格式
```json
{
  "data": {
    "enabled": true,
    "maskingPatterns": [
      {
        "fieldType": "password",
        "pattern": "********",
        "requirePermission": "admin.view_sensitive_data"
      },
      {
        "fieldType": "apiKey",
        "pattern": "****-****-****-****",
        "requirePermission": "admin.view_sensitive_data"
      },
      {
        "fieldType": "token",
        "pattern": "***...***",
        "showLength": 6,
        "requirePermission": "admin.view_sensitive_data"
      },
      {
        "fieldType": "email",
        "pattern": "u***@example.com",
        "requirePermission": null
      }
    ],
    "autoMaskFields": ["password", "apiKey", "token", "secret"]
  }
}
```

#### Mock 資料
```json
{
  "data": {
    "enabled": true,
    "maskingPatterns": [
      { "fieldType": "password", "pattern": "********" },
      { "fieldType": "apiKey", "pattern": "sk_**********************abc123" },
      { "fieldType": "token", "pattern": "eyJ***...***xyz" }
    ],
    "autoMaskFields": ["password", "apiKey", "token", "secret", "privateKey"]
  }
}
```

#### 前端實作要求
- 自動脫敏敏感欄位
- 管理員可點擊「顯示」按鈕查看原始值 (需權限)
- 顯示時記錄審計日誌 (後端自動處理)

---

### 4.2 敏感操作定義與告警

**關聯模組**: `identity-audit-spec.md`

#### API 定義
```
GET /api/v1/config/audit/sensitive-operations
```

#### 回應格式
```json
{
  "data": {
    "sensitiveOperations": [
      "user.delete",
      "role.modify_admin",
      "license.update",
      "config.modify_security",
      "playbook.execute_critical"
    ],
    "alertEnabled": true,
    "alertRecipients": ["admin@example.com", "security@example.com"],
    "alertChannels": ["email", "slack"],
    "requireConfirmation": true,
    "confirmationMethod": "password"
  }
}
```

#### 前端實作要求
- 標記敏感操作 (紅色標籤 「敏感操作」)
- 執行前顯示二次確認對話框
- 要求輸入密碼確認 (依 `confirmationMethod`)
- 顯示「此操作將記錄審計日誌並發送告警」提示

---

### 4.3 團隊資源隔離機制

**關聯模組**: `identity-team-spec.md`

#### API 定義
```
GET /api/v1/config/isolation/team-resources
```

#### 回應格式
```json
{
  "data": {
    "isolationEnabled": true,
    "crossTeamAccessAllowed": false,
    "exceptions": [
      { "resourceType": "dashboard", "shareAllowed": true },
      { "resourceType": "playbook", "shareAllowed": true },
      { "resourceType": "incident", "shareAllowed": false }
    ],
    "inheritanceEnabled": true
  }
}
```

#### 前端實作要求
- 僅顯示當前團隊資源
- 可分享的資源類型顯示「分享」按鈕
- 子團隊可繼承父團隊資源 (依 `inheritanceEnabled`)

---

### 4.4 SSO 整合身份同步

**關聯模組**: `identity-personnel-spec.md`

#### API 定義
```
GET /api/v1/config/sso/sync
```

#### 回應格式
```json
{
  "data": {
    "syncEnabled": true,
    "syncIntervalMinutes": 60,
    "lastSyncAt": "2025-10-06T10:00:00Z",
    "nextSyncAt": "2025-10-06T11:00:00Z",
    "autoProvisionEnabled": true,
    "autoDeProvisionEnabled": false,
    "attributeMapping": {
      "email": "mail",
      "displayName": "cn",
      "firstName": "givenName",
      "lastName": "sn",
      "teams": "memberOf"
    },
    "syncStatus": "success",
    "lastSyncStats": {
      "usersAdded": 5,
      "usersUpdated": 12,
      "usersRemoved": 0,
      "errors": 0
    }
  }
}
```

#### 手動觸發同步 API
```
POST /api/v1/sso/sync/trigger

Response:
{
  "data": {
    "taskId": "sync-task-001",
    "status": "processing",
    "estimatedTime": 120
  }
}
```

#### 前端實作要求
- 顯示同步狀態與上次同步時間
- 提供「立即同步」按鈕
- 顯示同步統計資訊 (新增/更新/移除使用者數)
- 同步失敗時顯示錯誤詳情

---

## 五、業務規則 (Business Rules)

### 5.1 通知偏好優先級與繼承

**關聯模組**: `profile-preference-spec.md`

#### API 定義
```
GET /api/v1/config/notification/preference-inheritance
```

#### 回應格式
```json
{
  "data": {
    "inheritanceEnabled": true,
    "priorityOrder": ["user", "team", "global"],
    "allowOverride": true,
    "inheritedSettings": {
      "email": {
        "enabled": true,
        "source": "team",
        "canOverride": true
      },
      "slack": {
        "enabled": false,
        "source": "global",
        "canOverride": true
      },
      "webhook": {
        "enabled": true,
        "source": "user",
        "canOverride": false
      }
    }
  }
}
```

#### 前端實作要求
- 顯示偏好來源標籤 (「來自團隊設定」)
- 提供「覆寫此設定」選項
- 不可覆寫的設定顯示為禁用狀態

---

### 5.2 靜音規則與告警規則優先級

**關聯模組**: `incidents-silence-spec.md`

#### API 定義
```
GET /api/v1/config/incidents/rule-priority
```

#### 回應格式
```json
{
  "data": {
    "silenceOverridesAlert": true,
    "priorityEvaluationOrder": ["silence", "alert", "default"],
    "conflictResolution": "silence_wins",
    "allowManualOverride": true
  }
}
```

#### 前端實作要求
- 顯示規則優先級說明
- 衝突時顯示「此告警已被靜音」提示
- 提供「強制觸發」選項 (依 `allowManualOverride`)

---

### 5.3 群組成員數量上限

**關聯模組**: `resources-group-spec.md`

#### API 定義
```
GET /api/v1/config/resources/group-limits
```

#### 回應格式
```json
{
  "data": {
    "maxMembersPerGroup": 1000,
    "maxGroupsPerResource": 10,
    "warningThreshold": 800,
    "recommendedSize": 100
  }
}
```

#### 前端實作要求
- 成員數接近上限時顯示警告 (> 800)
- 達到上限時禁用「新增成員」按鈕
- 顯示當前成員數 (「850 / 1000」)

---

### 5.4 動態群組支援

**關聯模組**: `resources-group-spec.md`

#### API 定義
```
GET /api/v1/config/resources/dynamic-groups
```

#### 回應格式
```json
{
  "data": {
    "enabled": true,
    "supportedConditions": [
      { "field": "tags", "operators": ["contains", "not_contains"] },
      { "field": "type", "operators": ["equals", "not_equals"] },
      { "field": "status", "operators": ["equals"] },
      { "field": "location", "operators": ["equals", "in"] }
    ],
    "maxConditionsPerGroup": 5,
    "updateIntervalMinutes": 10,
    "allowNested": false
  }
}
```

#### 前端實作要求
- 提供「靜態群組」/「動態群組」選擇器
- 動態群組顯示條件編輯器 (條件列表)
- 顯示「每 10 分鐘自動更新成員」提示
- 限制條件數量 (最多 5 個)

---

### 5.5 授權限制強制執行

**關聯模組**: `platform-license-spec.md`

#### API 定義
```
GET /api/v1/license/limits
```

#### 回應格式
```json
{
  "data": {
    "maxUsers": 100,
    "currentUsers": 85,
    "maxResources": 1000,
    "currentResources": 750,
    "maxDashboards": 50,
    "currentDashboards": 35,
    "enforcement": "hard",
    "gracePeriodDays": 0,
    "features": {
      "premium": true,
      "multiTenant": false,
      "advancedAnalytics": true
    }
  }
}
```

#### 前端實作要求
- 顯示授權使用狀況進度條
- 接近上限時顯示警告 (> 80%)
- 達到上限時禁用新增功能並顯示「授權額度已滿」
- 未授權的功能隱藏或禁用

---

### 5.6 標籤策略驗證與強制執行

**關聯模組**: `platform-tag-spec.md`

#### API 定義
```
GET /api/v1/config/tags/policy
```

#### 回應格式
```json
{
  "data": {
    "enforcementEnabled": true,
    "requiredTags": ["env", "owner"],
    "allowedKeys": ["env", "owner", "project", "cost-center", "team"],
    "validation": {
      "keyPattern": "^[a-z][a-z0-9-]*$",
      "valuePattern": "^[a-zA-Z0-9-_]+$",
      "maxKeyLength": 50,
      "maxValueLength": 100
    },
    "predefinedValues": {
      "env": ["dev", "staging", "prod"],
      "team": ["backend", "frontend", "ops"]
    }
  }
}
```

#### 前端實作要求
- 標記必填標籤 (紅色星號)
- 即時驗證標籤鍵/值格式 (正規表示式)
- 違反策略時禁止儲存並顯示錯誤訊息
- 提供預定義值的下拉選單 (依 `predefinedValues`)

---

### 5.7 資源狀態判定邏輯

**關聯模組**: `resources-list-spec.md`

#### API 定義
```
GET /api/v1/config/resources/status-rules
```

#### 回應格式
```json
{
  "data": {
    "statusLevels": ["healthy", "warning", "critical", "unknown"],
    "thresholds": {
      "cpu": { "warning": 80, "critical": 90 },
      "memory": { "warning": 85, "critical": 95 },
      "disk": { "warning": 90, "critical": 95 }
    },
    "unknownAfterMinutes": 5,
    "aggregationMethod": "worst_status",
    "customRules": [
      {
        "condition": "cpu > 90 AND memory > 90",
        "status": "critical",
        "priority": 1
      }
    ]
  }
}
```

#### 前端實作要求
- 根據閾值顯示狀態圖示與顏色
- Tooltip 顯示判定依據 (「CPU 85% > 80%」)
- 超過 5 分鐘無資料顯示「未知」狀態

---

### 5.8 告警規則冷卻時間

**關聯模組**: `incidents-alert-spec.md`

#### API 定義
```
GET /api/v1/config/alerts/cooldown
```

#### 回應格式
```json
{
  "data": {
    "defaultCooldownMinutes": 5,
    "minCooldownMinutes": 1,
    "maxCooldownMinutes": 60,
    "allowPerRuleCooldown": true,
    "cooldownStrategy": "sliding_window"
  }
}
```

#### 查詢規則冷卻狀態 API
```
GET /api/v1/alerts/:id/cooldown-status

Response:
{
  "data": {
    "inCooldown": true,
    "lastTriggeredAt": "2025-10-06T10:00:00Z",
    "cooldownUntil": "2025-10-06T10:05:00Z",
    "remainingSeconds": 180
  }
}
```

#### 前端實作要求
- 提供冷卻時間滑桿 (1-60 分鐘)
- 顯示「冷卻中,剩餘 3 分鐘」狀態
- 冷卻期間禁用「立即觸發」按鈕

---

## 六、Mock Server 整合範例

### 6.1 MSW Handlers

```typescript
// src/mocks/handlers/config.ts
import { rest } from 'msw';

export const configHandlers = [
  // 保留時長
  rest.get('/api/v1/config/retention/:type', (req, res, ctx) => {
    const { type } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          retentionDays: 90,
          minRetentionDays: 7,
          maxRetentionDays: 365,
          archiveEnabled: true
        }
      })
    );
  }),

  // 並行限制
  rest.get('/api/v1/config/concurrency/:type', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          maxConcurrentTasks: 3,
          queueSize: 10,
          priorityLevels: ['high', 'normal', 'low']
        }
      })
    );
  }),

  // 授權限制
  rest.get('/api/v1/license/limits', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          maxUsers: 100,
          currentUsers: 85,
          maxResources: 1000,
          currentResources: 750,
          enforcement: 'hard'
        }
      })
    );
  })
];
```

---

## 七、總結

### 7.1 涵蓋項目

本文件定義了 **32 項後端參數** 的完整 API 規範:

| 類別 | 數量 | 章節 |
|------|------|------|
| 認證與金鑰管理 | 4 項 | § 1 |
| 資料保留與歸檔 | 7 項 | § 2 |
| 並行與限流 | 6 項 | § 3 |
| 權限與隔離 | 6 項 | § 4 |
| 業務規則 | 9 項 | § 5 |

### 7.2 使用方式

各模組 SPEC 透過引用本文件,避免重複定義:

```markdown
## N. [參數名稱] (Backend Parameter)

**定義**: 參見 `_backend-parameters-spec.md` § X.Y

**API Mock**: 已提供於 Mock Server
```

### 7.3 後續步驟

- [ ] 各模組 SPEC 添加引用章節
- [ ] Mock Server 實作所有端點
- [ ] 前端實作參數動態獲取邏輯
- [ ] Contract Testing 驗證

---

**文件完成日期**: 2025-10-07
**撰寫人員**: Claude Code (Spec Architect)
**審核狀態**: 待後端團隊審閱
