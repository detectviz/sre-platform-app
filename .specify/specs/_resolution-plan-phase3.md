# 第三階段解決方案 - 後端參數與跨域協作 (Phase 3 Resolution Plan)

**建立日期**: 2025-10-07
**狀態**: Draft
**範圍**: 42 項待處理項目 (32 項後端參數 + 10 項跨域協作)
**策略**: API Contract First + Mock Server 驅動開發

---

## 一、執行策略總覽

### 1.1 核心策略

**API Contract First 開發模式**:
- 先定義 API Contract (OpenAPI 3.0)
- 前端使用 Mock Server 進行開發
- 後端根據 Contract 實作 API
- 透過 Contract Testing 確保一致性

### 1.2 技術架構

```
┌─────────────────────────────────────────────────┐
│                  前端應用                        │
│  (基於 Mock Server 進行開發與測試)               │
└─────────────────┬───────────────────────────────┘
                  │
                  ├──→ 開發環境: Mock Server (MSW)
                  │    • 模擬所有 API 回應
                  │    • 支援錯誤場景測試
                  │    • 即時修改 Mock 資料
                  │
                  └──→ 正式環境: 後端 API
                       • 符合 API Contract 規範
                       • 通過 Contract Testing
                       • 無縫切換
```

### 1.3 前後端分工

| 項目 | 前端職責 | 後端職責 |
|------|---------|---------|
| **API Contract** | 參與定義 UI 需求 | 參與定義技術限制 |
| **Mock Server** | 建置與維護 | 無需介入 |
| **UI 實作** | 基於 Mock 開發 | 無需介入 |
| **API 實作** | 無需介入 | 符合 Contract 實作 |
| **整合測試** | Contract Testing | Contract Testing |

---

## 二、待處理項目分析

### 2.1 項目分類統計

| 類別 | 數量 | 複雜度 | 預計工時 |
|------|------|--------|---------|
| **後端參數項目** | 32 項 | 低-中 | 3-4 天 (SPEC 更新) |
| **跨域協作項目** | 10 項 | 中-高 | 2-3 天 (SPEC 更新) |
| **API Contract 定義** | 42 個端點 | 中 | 2-3 天 |
| **Mock Server 建置** | 1 套系統 | 中 | 1-2 天 |

**總計**: 約 8-12 天 (SPEC 更新與 Mock 建置)

---

## 三、後端參數項目解決方案 (32 項)

### 3.1 認證與金鑰管理 (4 項)

#### 3.1.1 SMTP 認證資訊的金鑰管理
**檔案**: `modules/platform-mail-spec.md`

**後端 API 設計**:
```
GET /api/config/mail/encryption
Response:
{
  "encryptionEnabled": true,
  "keyManagementSystem": "vault",
  "encryptedFields": ["password", "apiKey"]
}
```

**前端實作**:
- 顯示加密狀態圖示
- 敏感欄位使用密碼輸入框
- 不允許讀取已儲存的密碼

**Mock 資料**:
```json
{
  "encryptionEnabled": true,
  "keyManagementSystem": "vault",
  "encryptedFields": ["password", "apiKey"]
}
```

---

#### 3.1.2 渠道認證資訊的金鑰管理機制
**檔案**: `modules/notification-channel-spec.md`

**後端 API 設計**:
```
GET /api/channels/:id/credentials
Response:
{
  "hasCredentials": true,
  "lastUpdated": "2025-10-06T10:00:00Z",
  "encryptionMethod": "AES-256-GCM",
  "fieldsRequired": ["apiKey", "apiSecret"]
}
```

**前端實作**:
- 顯示「已設定認證」狀態
- 提供「更新認證」按鈕
- 不顯示實際認證資訊

---

#### 3.1.3 授權檔案的簽章驗證機制
**檔案**: `modules/platform-license-spec.md`

**後端 API 設計**:
```
POST /api/license/verify
Request: { "licenseFile": "base64..." }
Response:
{
  "valid": true,
  "signature": "verified",
  "issuer": "SRE Platform Inc.",
  "expiresAt": "2026-10-06"
}
```

**前端實作**:
- 上傳授權檔案
- 顯示驗證進度
- 顯示驗證結果 (通過/失敗原因)

---

#### 3.1.4 MFA 恢復碼的生成與管理機制
**檔案**: `modules/profile-security-spec.md`

**後端 API 設計**:
```
POST /api/user/mfa/recovery-codes/generate
Response:
{
  "recoveryCodes": [
    "XXXX-XXXX-XXXX-XXXX",
    "YYYY-YYYY-YYYY-YYYY",
    ...
  ],
  "generatedAt": "2025-10-06T10:00:00Z",
  "expiresAt": null
}
```

**前端實作**:
- 顯示恢復碼列表
- 提供「下載」與「列印」功能
- 顯示「已使用」狀態標記

---

### 3.2 資料保留與歸檔 (7 項)

#### 3.2.1 執行歷史的保留時長與歸檔策略
**檔案**: `modules/automation-history-spec.md`

**後端 API 設計**:
```
GET /api/config/retention/automation-history
Response:
{
  "retentionDays": 90,
  "minRetentionDays": 7,
  "maxRetentionDays": 365,
  "archiveEnabled": true,
  "archiveAfterDays": 30
}
```

**前端實作**:
- 顯示保留期限設定
- 提供滑桿調整 (7-365 天)
- 顯示「歸檔已啟用」狀態

---

#### 3.2.2 審計日誌的保留時長與歸檔策略
**檔案**: `modules/identity-audit-spec.md`

**API 設計**: 同上,端點為 `/api/config/retention/audit-logs`

**特殊需求**:
- 最低保留期限: 30 天 (法規要求)
- 無法刪除,僅能歸檔

---

#### 3.2.3 日誌資料的保留策略與查詢範圍限制
**檔案**: `modules/insights-log-spec.md`

**後端 API 設計**:
```
GET /api/config/retention/logs
Response:
{
  "retentionDays": 30,
  "maxQueryRangeDays": 90,
  "compressionEnabled": true,
  "storageQuotaGB": 100
}
```

**前端實作**:
- 日期選擇器限制查詢範圍 (≤ 90 天)
- 超過範圍時顯示警告
- 顯示儲存空間使用狀況

---

#### 3.2.4 過期靜音規則的自動清理策略與保留時長
**檔案**: `modules/incidents-silence-spec.md`

**後端 API 設計**:
```
GET /api/config/cleanup/silence-rules
Response:
{
  "autoCleanupEnabled": true,
  "cleanupAfterExpiredDays": 30,
  "keepHistoryDays": 90
}
```

**前端實作**:
- 顯示「過期後 30 天自動清理」提示
- 提供「立即清理過期規則」按鈕

---

#### 3.2.5 通知歷史的保留時長與歸檔策略
**檔案**: `modules/notification-history-spec.md`

**API 設計**: 同 3.2.1,端點為 `/api/config/retention/notification-history`

---

#### 3.2.6 發現結果的保留時長與清理策略
**檔案**: `modules/resources-auto-discovery-spec.md`

**後端 API 設計**:
```
GET /api/config/retention/discovery-results
Response:
{
  "retentionDays": 60,
  "autoCleanupEnabled": true,
  "keepFailedResultsDays": 7
}
```

**前端實作**:
- 顯示保留期限
- 失敗結果僅保留 7 天 (特殊處理)

---

#### 3.2.7 資源指標的更新頻率與歷史資料保留策略
**檔案**: `modules/resources-list-spec.md`

**後端 API 設計**:
```
GET /api/config/metrics/resources
Response:
{
  "updateIntervalSeconds": 60,
  "historyRetentionDays": 90,
  "aggregationLevels": {
    "raw": 7,
    "5min": 30,
    "1hour": 90,
    "1day": 365
  }
}
```

**前端實作**:
- 顯示「每 60 秒更新」
- 根據時間範圍自動選擇聚合級別

---

### 3.3 並行與限流 (6 項)

#### 3.3.1 郵件發送速率限制的策略
**檔案**: `modules/platform-mail-spec.md`

**後端 API 設計**:
```
GET /api/config/rate-limit/mail
Response:
{
  "maxEmailsPerMinute": 100,
  "maxEmailsPerHour": 1000,
  "burstAllowance": 20,
  "retryAfterSeconds": 60
}
```

**前端實作**:
- 顯示速率限制資訊
- 發送失敗時顯示「請稍後再試」

---

#### 3.3.2 回測任務的並行數限制與優先級機制
**檔案**: `modules/insights-backtesting-spec.md`

**後端 API 設計**:
```
GET /api/config/concurrency/backtesting
Response:
{
  "maxConcurrentTasks": 3,
  "queueSize": 10,
  "priorityLevels": ["high", "normal", "low"],
  "highPrioritySlots": 1
}
```

**前端實作**:
- 顯示「當前執行中: 2 / 3」
- 提供優先級選擇器
- 佇列已滿時禁用「執行」按鈕

---

#### 3.3.3 日誌查詢的並行數與逾時限制
**檔案**: `modules/insights-log-spec.md`

**後端 API 設計**:
```
GET /api/config/concurrency/log-queries
Response:
{
  "maxConcurrentQueries": 5,
  "queryTimeoutSeconds": 30,
  "maxResultRows": 10000
}
```

**前端實作**:
- 查詢超過 30 秒顯示逾時提示
- 結果超過 10000 筆顯示「部分結果」警告

---

#### 3.3.4 劇本並行執行的限制與優先級
**檔案**: `modules/automation-playbook-spec.md`

**API 設計**: 同 3.3.2,端點為 `/api/config/concurrency/playbooks`

---

#### 3.3.5 觸發器的並行執行數限制
**檔案**: `modules/automation-trigger-spec.md`

**後端 API 設計**:
```
GET /api/config/concurrency/triggers
Response:
{
  "maxConcurrentTriggers": 10,
  "perTriggerMaxConcurrency": 1,
  "queueSize": 50
}
```

**前端實作**:
- 顯示觸發器執行狀態 (執行中/等待中)
- 佇列已滿時顯示警告

---

#### 3.3.6 自動發現的並行任務數上限
**檔案**: `modules/resources-auto-discovery-spec.md`

**API 設計**: 同 3.3.2,端點為 `/api/config/concurrency/auto-discovery`

---

### 3.4 權限與隔離 (6 項)

#### 3.4.1 敏感資訊的脫敏規則與權限控制
**檔案**: `modules/automation-history-spec.md`

**後端 API 設計**:
```
GET /api/config/privacy/masking-rules
Response:
{
  "enabled": true,
  "maskingPatterns": [
    { "field": "password", "pattern": "***" },
    { "field": "apiKey", "pattern": "****-****-****" },
    { "field": "token", "pattern": "***...***" }
  ],
  "requiredPermission": "admin.view_sensitive_data"
}
```

**前端實作**:
- 自動脫敏敏感欄位
- 管理員可點擊「顯示」按鈕查看原始值

---

#### 3.4.2 敏感操作的定義與告警機制
**檔案**: `modules/identity-audit-spec.md`

**後端 API 設計**:
```
GET /api/config/audit/sensitive-operations
Response:
{
  "sensitiveOperations": [
    "user.delete",
    "role.modify_admin",
    "license.update",
    "config.modify_security"
  ],
  "alertEnabled": true,
  "alertRecipients": ["admin@example.com"]
}
```

**前端實作**:
- 標記敏感操作 (紅色標籤)
- 執行前顯示二次確認對話框

---

#### 3.4.3 歷史資料的存取權限與資料隱私保護
**檔案**: `modules/insights-backtesting-spec.md`

**後端 API 設計**:
```
GET /api/config/privacy/historical-data
Response:
{
  "dataRetentionDays": 90,
  "anonymizationEnabled": true,
  "requiredPermission": "insights.view_historical_data",
  "exportAllowed": false
}
```

**前端實作**:
- 根據權限顯示/隱藏歷史資料
- 匿名化處理 (隱藏使用者名稱等)
- 禁用匯出按鈕

---

#### 3.4.4 團隊資源隔離的實作機制與例外處理
**檔案**: `modules/identity-team-spec.md`

**後端 API 設計**:
```
GET /api/config/isolation/team-resources
Response:
{
  "isolationEnabled": true,
  "crossTeamAccessAllowed": false,
  "exceptions": [
    { "resourceType": "dashboard", "shareAllowed": true },
    { "resourceType": "playbook", "shareAllowed": true }
  ]
}
```

**前端實作**:
- 僅顯示當前團隊資源
- 可分享的資源類型顯示「分享」按鈕

---

#### 3.4.5 嵌入儀表板的權限控制與資料隔離
**檔案**: `modules/platform-grafana-spec.md`

**後端 API 設計**:
```
GET /api/config/embedding/grafana
Response:
{
  "embeddingEnabled": true,
  "requireAuth": true,
  "dataIsolationEnabled": true,
  "allowedOrigins": ["https://example.com"]
}
```

**前端實作**:
- 嵌入前驗證使用者權限
- 僅顯示有權限的資料

---

#### 3.4.6 SSO 整合的身份同步機制
**檔案**: `modules/identity-personnel-spec.md`

**後端 API 設計**:
```
GET /api/config/sso/sync
Response:
{
  "syncEnabled": true,
  "syncIntervalMinutes": 60,
  "autoProvisionEnabled": true,
  "autoDeProvisionEnabled": false,
  "attributeMapping": {
    "email": "mail",
    "displayName": "cn",
    "teams": "memberOf"
  }
}
```

**前端實作**:
- 顯示同步狀態與上次同步時間
- 提供「立即同步」按鈕

---

### 3.5 業務規則 (9 項)

#### 3.5.1 通知偏好的優先級與策略繼承
**檔案**: `modules/profile-preference-spec.md`

**後端 API 設計**:
```
GET /api/config/notification/preference-inheritance
Response:
{
  "inheritanceEnabled": true,
  "priorityOrder": ["user", "team", "global"],
  "allowOverride": true,
  "inheritedSettings": {
    "email": { "enabled": true, "source": "team" },
    "slack": { "enabled": false, "source": "global" }
  }
}
```

**前端實作**:
- 顯示偏好來源標籤 (「來自團隊設定」)
- 提供「覆寫此設定」選項

---

#### 3.5.2 靜音規則與告警規則的優先級關係
**檔案**: `modules/incidents-silence-spec.md`

**後端 API 設計**:
```
GET /api/config/incidents/rule-priority
Response:
{
  "silenceOverridesAlert": true,
  "priorityEvaluationOrder": ["silence", "alert", "default"],
  "conflictResolution": "silence_wins"
}
```

**前端實作**:
- 顯示規則優先級說明
- 衝突時顯示「此告警已被靜音」提示

---

#### 3.5.3 群組成員數量上限
**檔案**: `modules/resources-group-spec.md`

**後端 API 設計**:
```
GET /api/config/resources/group-limits
Response:
{
  "maxMembersPerGroup": 1000,
  "maxGroupsPerResource": 10,
  "warningThreshold": 800
}
```

**前端實作**:
- 成員數接近上限時顯示警告
- 達到上限時禁用「新增成員」按鈕

---

#### 3.5.4 是否支援動態群組
**檔案**: `modules/resources-group-spec.md`

**後端 API 設計**:
```
GET /api/config/resources/dynamic-groups
Response:
{
  "enabled": true,
  "supportedConditions": ["tags", "type", "status", "location"],
  "maxConditionsPerGroup": 5,
  "updateIntervalMinutes": 10
}
```

**前端實作**:
- 提供「靜態群組」/「動態群組」選擇器
- 動態群組顯示條件編輯器
- 顯示「每 10 分鐘更新成員」提示

---

#### 3.5.5 授權限制的強制執行策略
**檔案**: `modules/platform-license-spec.md`

**後端 API 設計**:
```
GET /api/license/limits
Response:
{
  "maxUsers": 100,
  "currentUsers": 85,
  "maxResources": 1000,
  "currentResources": 750,
  "enforcement": "hard",
  "gracePeriodDays": 0
}
```

**前端實作**:
- 顯示授權使用狀況進度條
- 接近上限時顯示警告
- 達到上限時禁用新增功能

---

#### 3.5.6 標籤策略的驗證與強制執行機制
**檔案**: `modules/platform-tag-spec.md`

**後端 API 設計**:
```
GET /api/config/tags/policy
Response:
{
  "enforcementEnabled": true,
  "requiredTags": ["env", "owner"],
  "allowedKeys": ["env", "owner", "project", "cost-center"],
  "validation": {
    "keyPattern": "^[a-z][a-z0-9-]*$",
    "valuePattern": "^[a-zA-Z0-9-_]+$"
  }
}
```

**前端實作**:
- 標記必填標籤 (紅色星號)
- 即時驗證標籤鍵/值格式
- 違反策略時禁止儲存

---

#### 3.5.7 標籤值的命名規範與驗證規則
**檔案**: `modules/platform-tag-spec.md`

**API 設計**: 同 3.5.6 (已包含驗證規則)

---

#### 3.5.8 資源狀態判定邏輯
**檔案**: `modules/resources-list-spec.md`

**後端 API 設計**:
```
GET /api/config/resources/status-rules
Response:
{
  "statusLevels": ["healthy", "warning", "critical", "unknown"],
  "healthyThresholds": {
    "cpu": 80,
    "memory": 85,
    "disk": 90
  },
  "warningThresholds": {
    "cpu": 90,
    "memory": 95,
    "disk": 95
  },
  "unknownAfterMinutes": 5
}
```

**前端實作**:
- 根據閾值顯示狀態圖示
- Tooltip 顯示判定依據

---

#### 3.5.9 規則觸發後的冷卻時間設定
**檔案**: `modules/incidents-alert-spec.md`

**後端 API 設計**:
```
GET /api/config/alerts/cooldown
Response:
{
  "defaultCooldownMinutes": 5,
  "minCooldownMinutes": 1,
  "maxCooldownMinutes": 60,
  "allowPerRuleCooldown": true
}
```

**前端實作**:
- 提供冷卻時間滑桿 (1-60 分鐘)
- 顯示「冷卻中」狀態標記

---

## 四、跨域協作項目解決方案 (10 項)

### 4.1 Drawer 內容的預載入策略與快取

**檔案**: `common/modal-interaction-pattern.md`

#### 前端職責
- 決定預載入時機 (Hover / Click)
- 實作快取邏輯 (React Query)
- 顯示載入與錯誤狀態

#### 後端職責
- 提供預載入 API
- 設定快取 TTL 參數
- 支援 ETag / Last-Modified

#### API Contract
```
GET /api/drawer/preload/:type/:id
Headers:
  If-None-Match: "etag-value"
Response:
{
  "data": {...},
  "cacheTTL": 300,
  "lastModified": "2025-10-06T10:00:00Z"
}
Headers:
  ETag: "etag-value"
  Cache-Control: max-age=300
```

#### Mock 資料
```json
{
  "data": {
    "id": "evt-001",
    "title": "系統告警",
    "status": "active",
    "details": "..."
  },
  "cacheTTL": 300,
  "lastModified": "2025-10-06T10:00:00Z"
}
```

---

### 4.2 Modal 關閉動畫完成前是否允許重新開啟

**檔案**: `common/modal-interaction-pattern.md`

#### 前端職責
- 管理 Modal 狀態 (opening/opened/closing/closed)
- 動畫時長設定 (預設 300ms)
- 防抖處理 (禁止快速開關)

#### 後端職責
- 無關 (純前端決策)

#### 前端決策
**策略**: 動畫完成前禁止重新開啟
- 防止狀態混亂
- 避免記憶體洩漏
- 提升使用者體驗 (避免閃爍)

**實作範例**:
```typescript
const [modalState, setModalState] = useState<'closed' | 'opening' | 'opened' | 'closing'>('closed');

const openModal = () => {
  if (modalState === 'closed') {
    setModalState('opening');
    setTimeout(() => setModalState('opened'), 300);
  }
};

const closeModal = () => {
  if (modalState === 'opened') {
    setModalState('closing');
    setTimeout(() => setModalState('closed'), 300);
  }
};
```

---

### 4.3 KPI 數值的更新頻率與快取策略

**檔案**: `modules/resources-discovery-spec.md`

#### 前端職責
- 顯示更新時間 (「5 分鐘前更新」)
- 提供「立即刷新」按鈕
- 實作快取邏輯

#### 後端職責
- 設定更新頻率參數
- 提供快取 TTL
- 計算 KPI 數值

#### API Contract
```
GET /api/resources/kpi
Response:
{
  "totalResources": 1250,
  "healthyPercentage": 95.2,
  "updatedAt": "2025-10-06T10:00:00Z",
  "updateIntervalSeconds": 300,
  "cacheTTL": 300
}
Headers:
  Cache-Control: max-age=300
```

#### Mock 資料
```json
{
  "totalResources": 1250,
  "healthyPercentage": 95.2,
  "criticalCount": 5,
  "warningCount": 55,
  "updatedAt": "2025-10-06T10:00:00Z",
  "updateIntervalSeconds": 300,
  "cacheTTL": 300
}
```

---

### 4.4 趨勢圖的資料粒度與聚合邏輯

**檔案**: `modules/resources-discovery-spec.md`

#### 前端職責
- 時間範圍選擇器 UI (1h / 6h / 24h / 7d / 30d)
- 根據範圍選擇粒度
- 圖表渲染 (ECharts)

#### 後端職責
- 計算資料粒度
- 聚合邏輯 (平均/最大/最小)
- 資料降採樣

#### API Contract
```
GET /api/resources/trend?range=24h&granularity=5m
Response:
{
  "dataPoints": [
    { "timestamp": "2025-10-06T09:00:00Z", "value": 95.2 },
    { "timestamp": "2025-10-06T09:05:00Z", "value": 94.8 },
    ...
  ],
  "granularity": "5m",
  "aggregation": "avg"
}
```

#### 粒度選擇邏輯
| 時間範圍 | 粒度 | 資料點數量 |
|---------|------|-----------|
| 1 小時 | 1 分鐘 | 60 |
| 6 小時 | 5 分鐘 | 72 |
| 24 小時 | 5 分鐘 | 288 |
| 7 天 | 1 小時 | 168 |
| 30 天 | 1 天 | 30 |

---

### 4.5 儀表板的權限繼承與分享機制

**檔案**: `modules/dashboards-list-spec.md`

#### 前端職責
- 權限選擇器 UI (私人/團隊/公開)
- 分享對話框
- 顯示權限來源 (繼承/直接授予)

#### 後端職責
- 權限繼承計算
- 分享連結生成
- 權限驗證

#### API Contract
```
GET /api/dashboards/:id/permissions
Response:
{
  "owner": "user-001",
  "visibility": "team",
  "inheritedFrom": "team-001",
  "directPermissions": [
    { "userId": "user-002", "role": "viewer" }
  ],
  "effectivePermissions": [
    { "userId": "user-002", "role": "viewer" },
    { "teamId": "team-001", "role": "editor" }
  ]
}

POST /api/dashboards/:id/share
Request:
{
  "visibility": "public",
  "expiresAt": "2025-11-06T10:00:00Z"
}
Response:
{
  "shareUrl": "https://example.com/share/abc123",
  "expiresAt": "2025-11-06T10:00:00Z"
}
```

---

### 4.6 儀表板版本控制與復原功能

**檔案**: `modules/dashboards-list-spec.md`

#### 前端職責
- 版本列表 UI (時間軸)
- 版本比較檢視
- 復原確認對話框

#### 後端職責
- 版本儲存 (Git-like)
- 版本比較邏輯
- 復原執行

#### API Contract
```
GET /api/dashboards/:id/versions
Response:
{
  "versions": [
    {
      "version": "v1.2.3",
      "createdAt": "2025-10-06T10:00:00Z",
      "createdBy": "user-001",
      "changes": "更新圖表配置"
    },
    ...
  ],
  "currentVersion": "v1.2.3"
}

POST /api/dashboards/:id/restore/:version
Response:
{
  "success": true,
  "restoredVersion": "v1.2.2",
  "newVersion": "v1.2.4"
}
```

---

### 4.7 子團隊的權限繼承與覆寫規則

**檔案**: `modules/identity-team-spec.md`

#### 前端職責
- 權限樹狀圖視覺化
- 繼承路徑顯示
- 覆寫標記 (圖示)

#### 後端職責
- 權限繼承計算
- 覆寫規則驗證
- 有效權限計算

#### API Contract
```
GET /api/teams/:id/permissions/inherited
Response:
{
  "directPermissions": ["resource.read", "resource.write"],
  "inheritedPermissions": ["incident.read"],
  "overriddenPermissions": ["resource.delete"],
  "effectivePermissions": ["resource.read", "resource.write", "incident.read"],
  "inheritancePath": [
    { "teamId": "team-root", "permissions": ["incident.read"] },
    { "teamId": "team-parent", "permissions": ["resource.read"] },
    { "teamId": "team-current", "permissions": ["resource.write"], "overrides": ["resource.delete"] }
  ]
}
```

#### 前端視覺化
```
團隊階層            權限
─────────────────────────────────────
Root 團隊         incident.read (繼承)
  └─ 父團隊       resource.read (繼承)
      └─ 當前團隊 resource.write (直接)
                  resource.delete (覆寫禁止) ⚠️
```

---

### 4.8 資源批次操作的數量上限

**檔案**: `modules/resources-list-spec.md`

#### 前端職責
- 選擇超過上限時禁用批次按鈕
- 顯示提示訊息 (「最多選擇 100 個資源」)
- 提供「全選」與「取消全選」功能

#### 後端職責
- 提供 maxBatchSize 參數
- API 層級驗證批次數量
- 返回錯誤訊息

#### API Contract
```
GET /api/config/resources/batch-limits
Response:
{
  "maxBatchSize": 100,
  "recommendedBatchSize": 50,
  "maxBatchSizeForDelete": 20
}

POST /api/resources/batch-delete
Request:
{
  "resourceIds": ["res-001", "res-002", ...]
}
Response (錯誤):
{
  "error": "BATCH_SIZE_EXCEEDED",
  "message": "批次操作最多 100 個資源",
  "maxBatchSize": 100,
  "requestedSize": 150
}
```

---

### 4.9 通知重試的策略與上限次數

**檔案**: `modules/notification-history-spec.md`

#### 前端職責
- 顯示重試次數 (「重試 2/3 次」)
- 顯示重試狀態 (等待重試/重試中/已放棄)
- 提供「手動重試」按鈕

#### 後端職責
- 重試策略 (指數退避)
- 設定重試上限
- 失敗處理

#### API Contract
```
GET /api/config/notification/retry-policy
Response:
{
  "maxRetries": 3,
  "retryDelaySeconds": [60, 300, 900],
  "retryStrategy": "exponential_backoff",
  "abandonAfterHours": 24
}

GET /api/notifications/:id
Response:
{
  "id": "notif-001",
  "status": "retrying",
  "retryCount": 2,
  "maxRetries": 3,
  "nextRetryAt": "2025-10-06T10:15:00Z",
  "lastError": "Connection timeout"
}
```

---

### 4.10 觸發器防抖的時間窗口與策略

**檔案**: `modules/automation-trigger-spec.md`

#### 前端職責
- 顯示防抖狀態 (「冷卻中,剩餘 3 分鐘」)
- 提供防抖時間設定滑桿 (1-60 分鐘)
- 禁用冷卻中的觸發器

#### 後端職責
- 實作防抖邏輯
- 記錄上次觸發時間
- 計算剩餘冷卻時間

#### API Contract
```
GET /api/config/triggers/debounce
Response:
{
  "defaultDebounceMinutes": 5,
  "minDebounceMinutes": 1,
  "maxDebounceMinutes": 60,
  "allowPerTriggerDebounce": true
}

GET /api/triggers/:id/status
Response:
{
  "id": "trigger-001",
  "status": "cooling_down",
  "lastTriggeredAt": "2025-10-06T10:00:00Z",
  "cooldownUntil": "2025-10-06T10:05:00Z",
  "remainingSeconds": 180
}
```

---

## 五、API Contract 統一規範

### 5.1 通用 API 設計原則

#### 5.1.1 統一錯誤回應格式
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "使用者可讀的錯誤訊息",
    "details": {
      "field": "具體欄位",
      "reason": "詳細原因"
    },
    "requestId": "req-abc123",
    "timestamp": "2025-10-06T10:00:00Z"
  }
}
```

#### 5.1.2 統一分頁格式
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

#### 5.1.3 統一篩選與排序
```
GET /api/resources?filter[status]=active&sort=-createdAt&page=1&pageSize=20
```

### 5.2 HTTP 狀態碼規範

| 狀態碼 | 用途 | 範例 |
|-------|------|------|
| 200 | 成功 | GET 查詢成功 |
| 201 | 已建立 | POST 建立資源成功 |
| 204 | 無內容 | DELETE 刪除成功 |
| 400 | 請求錯誤 | 參數驗證失敗 |
| 401 | 未授權 | 未登入或 Token 過期 |
| 403 | 禁止存取 | 權限不足 |
| 404 | 找不到 | 資源不存在 |
| 409 | 衝突 | 資源已存在 |
| 422 | 無法處理 | 業務邏輯驗證失敗 |
| 429 | 請求過多 | 速率限制 |
| 500 | 伺服器錯誤 | 內部錯誤 |

### 5.3 認證與授權

#### 5.3.1 JWT Token 格式
```
Authorization: Bearer <jwt-token>
```

#### 5.3.2 Token 回應格式
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "refresh-token-abc123"
}
```

### 5.4 時間格式統一

所有時間欄位使用 ISO 8601 格式:
```
2025-10-06T10:00:00Z (UTC)
2025-10-06T18:00:00+08:00 (有時區)
```

---

## 六、Mock Server 實作規範

### 6.1 技術選型: MSW (Mock Service Worker)

#### 優勢
- ✅ 不需獨立伺服器
- ✅ 支援 TypeScript
- ✅ 開發與測試環境共用
- ✅ 攔截網路請求,透明化

#### 安裝與設定
```bash
npm install msw --save-dev
npx msw init public/ --save
```

### 6.2 Mock Handlers 結構

```typescript
// src/mocks/handlers/config.ts
import { rest } from 'msw';

export const configHandlers = [
  // 保留時長 API
  rest.get('/api/config/retention/:type', (req, res, ctx) => {
    const { type } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        retentionDays: 90,
        minRetentionDays: 7,
        maxRetentionDays: 365,
        archiveEnabled: true,
        archiveAfterDays: 30
      })
    );
  }),

  // 並行限制 API
  rest.get('/api/config/concurrency/:type', (req, res, ctx) => {
    const { type } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        maxConcurrentTasks: 3,
        queueSize: 10,
        priorityLevels: ['high', 'normal', 'low']
      })
    );
  })
];
```

### 6.3 Mock 資料管理

```typescript
// src/mocks/data/config.ts
export const mockRetentionConfig = {
  'automation-history': {
    retentionDays: 90,
    minRetentionDays: 7,
    maxRetentionDays: 365,
    archiveEnabled: true
  },
  'audit-logs': {
    retentionDays: 180,
    minRetentionDays: 30,
    maxRetentionDays: 730,
    archiveEnabled: true
  }
};
```

### 6.4 錯誤場景模擬

```typescript
// 模擬 500 錯誤
rest.get('/api/config/error-test', (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '伺服器內部錯誤',
        requestId: 'req-abc123'
      }
    })
  );
});

// 模擬延遲
rest.get('/api/config/slow', (req, res, ctx) => {
  return res(
    ctx.delay(3000), // 3 秒延遲
    ctx.status(200),
    ctx.json({ data: 'success' })
  );
});
```

### 6.5 開發環境啟用

```typescript
// src/index.tsx
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser');
  worker.start();
}
```

---

## 七、SPEC 更新規範

### 7.1 後端參數項目更新範本

每個後端參數項目需新增以下章節:

```markdown
## N. [章節名稱] (Backend API Parameters)

### N.1 參數定義

**後端 API**: `[HTTP Method] [Endpoint Path]`

**回應格式**:
```json
{
  "parameterName": "value",
  "description": "說明"
}
```

### N.2 參數說明

| 參數名稱 | 資料型別 | 預設值 | 說明 |
|---------|---------|--------|------|
| parameterName | type | default | 說明 |

### N.3 前端實作要求

- 透過 API 動態獲取參數
- 根據參數值調整 UI 行為
- 驗證使用者輸入

### N.4 Mock 資料

```json
{
  "parameterName": "mockValue"
}
```

### N.5 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 參數定義 | - | ✅ |
| API 提供 | - | ✅ |
| UI 顯示 | ✅ | - |
| 輸入驗證 | ✅ (客戶端) | ✅ (伺服器端) |

---

## [決策記錄] DR-XXX: [決策標題]

**決策日期**: 2025-10-07
**決策依據**: `_resolution-plan-phase3.md`
**決策者**: Backend Team + Frontend Team

**決策內容**:
- 參數由後端 API 提供
- 前端動態獲取並渲染

**理由**:
- 支援動態配置
- 降低前端硬編碼
- 提升系統彈性
```

### 7.2 跨域協作項目更新範本

```markdown
## N. [章節名稱] (Frontend-Backend Collaboration)

### N.1 前端職責

- UI 設計與實作
- 狀態管理
- 使用者互動

### N.2 後端職責

- 業務邏輯計算
- 資料持久化
- 權限驗證

### N.3 API Contract

**Endpoint**: `[HTTP Method] [Path]`

**Request**:
```json
{
  "field": "value"
}
```

**Response**:
```json
{
  "result": "value"
}
```

### N.4 Mock 資料

```json
{
  "mockField": "mockValue"
}
```

### N.5 整合測試要求

- Contract Testing (Pact)
- E2E Testing (Cypress)
- API Compatibility Check

---

## [決策記錄] DR-XXX: [決策標題]

**決策日期**: 2025-10-07
**決策依據**: `_resolution-plan-phase3.md`
**決策者**: Frontend Team + Backend Team

**決策內容**:
- 前端負責 UI 與互動
- 後端負責邏輯與驗證
- API Contract 作為協作介面

**理由**:
- 清晰職責劃分
- 支援並行開發
- 降低整合風險
```

---

## 八、執行時程規劃

### 8.1 第三階段時程 (8-12 天)

| 階段 | 工作內容 | 預計工時 | 負責人 |
|------|---------|---------|--------|
| **Day 1-2** | 制定 API Contract 規範 | 2 天 | Spec Architect |
| **Day 3-6** | 更新 32 項後端參數 SPEC | 4 天 | Spec Architect |
| **Day 7-9** | 更新 10 項跨域協作 SPEC | 3 天 | Spec Architect |
| **Day 10-11** | 生成 Mock Server 文件 | 2 天 | Spec Architect + Frontend Lead |
| **Day 12** | 生成第三階段執行報告 | 1 天 | Spec Architect |

**總計**: 12 天

### 8.2 後續實作時程 (前後端並行)

| 階段 | 工作內容 | 預計工時 | 負責人 |
|------|---------|---------|--------|
| **Week 1-2** | Mock Server 建置 | 2-3 天 | Frontend Team |
| **Week 1-3** | 前端 UI 實作 (基於 Mock) | 10-15 天 | Frontend Team |
| **Week 2-4** | 後端 API 實作 | 15-20 天 | Backend Team |
| **Week 5** | 整合測試與調整 | 3-5 天 | Frontend + Backend |

**總計**: 約 5 週 (前後端並行,實際約 3-4 週)

---

## 九、驗收標準

### 9.1 SPEC 更新驗收

- ✅ 所有 42 項 NEEDS CLARIFICATION 已解決
- ✅ 每項補充「API 參數規範」或「前後端協作」章節
- ✅ 提供 Mock 資料範例
- ✅ 新增決策記錄 (DR-XXX)
- ✅ 標記為已解決 (✅ ~~...~~)

### 9.2 API Contract 驗收

- ✅ 提供 OpenAPI 3.0 規範文件
- ✅ 定義所有 42 個端點
- ✅ 包含請求/回應範例
- ✅ 統一錯誤處理格式
- ✅ 統一分頁格式

### 9.3 Mock Server 驗收

- ✅ 支援所有 42 個端點
- ✅ 提供真實的 Mock 資料
- ✅ 模擬錯誤場景 (400/401/403/500)
- ✅ 模擬延遲與逾時
- ✅ 開發環境啟用正常

### 9.4 文件驗收

- ✅ 第三階段執行報告完整
- ✅ Mock Server 設定文件清晰
- ✅ 前後端分工明確
- ✅ 後續實作指南完整

---

## 十、風險與應對

### 10.1 風險識別

| 風險 | 影響 | 機率 | 應對措施 |
|------|------|------|---------|
| API Contract 定義不完整 | 高 | 中 | 前後端共同 Review |
| Mock 資料與實際 API 不一致 | 高 | 中 | Contract Testing |
| 後端實作延遲 | 中 | 低 | 前端基於 Mock 持續開發 |
| 整合測試發現不相容 | 中 | 中 | 預留調整緩衝時間 |

### 10.2 應對措施

1. **API Contract Review**
   - 前後端共同審查 API 設計
   - 使用 OpenAPI 自動驗證

2. **Contract Testing**
   - 前端使用 Pact Consumer
   - 後端使用 Pact Provider
   - CI/CD 自動執行

3. **定期同步**
   - 每週前後端同步會議
   - 即時更新 API Contract
   - 追蹤實作進度

---

## 十一、總結

### 11.1 第三階段目標

✅ 解決 42 項待處理項目 (32 項後端參數 + 10 項跨域協作)
✅ 定義完整 API Contract
✅ 建立 Mock Server 支援前端開發
✅ 實現前後端並行開發

### 11.2 核心價值

- **前後端分離**: 透過 API Contract 清晰劃分職責
- **並行開發**: Mock Server 支援前端獨立開發
- **降低風險**: Contract Testing 確保一致性
- **提升效率**: 減少整合等待時間

### 11.3 後續步驟

1. ✅ 制定 API Contract 總規範
2. ✅ 更新 32 項後端參數 SPEC
3. ✅ 更新 10 項跨域協作 SPEC
4. ✅ 生成 Mock Server 設定文件
5. ✅ 生成第三階段執行報告

---

**文件完成日期**: 2025-10-07
**撰寫人員**: Claude Code (Spec Architect)
**審核狀態**: 待前後端團隊審閱
**第三階段狀態**: 🚀 準備啟動
