# 跨域協作 API 規範 (Frontend-Backend Collaboration Specification)

**建立日期**: 2025-10-07
**狀態**: Draft
**目的**: 定義需要前後端共同協作的 10 項功能 API 介面
**依據**: `_resolution-plan-phase3.md` + `_api-contract-spec.md`

---

## 使用說明

本文件定義**需要前後端共同討論與協作**的功能 API 規範。這些功能涉及複雜的 UI/UX 決策與後端邏輯,需要雙方緊密配合。

**引用方式**:
```markdown
## N. [功能名稱] (Frontend-Backend Collaboration)

**定義**: 參見 `_collaboration-spec.md` § X

**前端職責**: UI 實作與使用者互動
**後端職責**: 業務邏輯與資料處理
```

---

## 一、Drawer 內容預載入策略與快取

**關聯模組**: `common/modal-interaction-pattern.md`

### 1.1 功能概述

當使用者 Hover 或點擊項目時,Drawer 應預先載入內容並快取,以提升開啟速度。

### 1.2 前端職責

#### UI/UX 決策
- **預載入觸發時機**: Hover 500ms 後觸發預載入
- **快取策略**: React Query (staleTime + cacheTime)
- **載入狀態**: Skeleton Loading (開啟 Drawer 時)
- **錯誤處理**: 顯示錯誤訊息與「重試」按鈕

#### 實作要點
```typescript
// Hover 預載入
const handleMouseEnter = () => {
  const timeoutId = setTimeout(() => {
    prefetchDrawerContent(id);
  }, 500);
  return () => clearTimeout(timeoutId);
};

// React Query 快取
const { data } = useQuery({
  queryKey: ['drawer', type, id],
  queryFn: () => fetchDrawerContent(type, id),
  staleTime: cacheTTL * 1000,
  cacheTime: cacheTTL * 1000 * 2,
  enabled: false // 手動觸發
});
```

---

### 1.3 後端職責

#### API 設計

**預載入端點**:
```
GET /api/v1/drawer/preload/:type/:id
Headers:
  If-None-Match: "etag-value"
```

**回應格式**:
```json
{
  "data": {
    "id": "evt-001",
    "type": "incident",
    "title": "系統告警",
    "status": "active",
    "severity": "critical",
    "details": {
      "description": "CPU 使用率過高",
      "affectedResources": ["server-001", "server-002"],
      "timeline": [...]
    }
  },
  "meta": {
    "cacheTTL": 300,
    "lastModified": "2025-10-06T10:00:00Z"
  }
}
```

**Headers**:
```
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Cache-Control: max-age=300
```

#### 快取參數提供

| 參數 | 類型 | 說明 |
|------|------|------|
| `cacheTTL` | number | 快取時間 (秒),前端據此設定 staleTime |
| `lastModified` | string | 最後修改時間,用於版本比對 |
| `ETag` | header | 協商快取標識 |

#### 支援的類型

| Type | 說明 | Cache TTL |
|------|------|-----------|
| `incident` | 事件詳情 | 300s (5 分鐘) |
| `resource` | 資源詳情 | 600s (10 分鐘) |
| `audit-log` | 操作日誌 | 0s (不快取) |
| `documentation` | 說明文件 | 86400s (永久快取) |

---

### 1.4 Mock 資料

```json
{
  "data": {
    "id": "inc-001",
    "type": "incident",
    "title": "資料庫連線異常",
    "status": "active",
    "severity": "critical",
    "createdAt": "2025-10-06T09:30:00Z",
    "details": {
      "description": "主資料庫無法連線,影響所有服務",
      "affectedResources": ["db-primary-001"],
      "timeline": [
        {
          "timestamp": "2025-10-06T09:30:00Z",
          "event": "告警觸發",
          "user": null
        },
        {
          "timestamp": "2025-10-06T09:32:00Z",
          "event": "已認領",
          "user": "admin@example.com"
        }
      ]
    }
  },
  "meta": {
    "cacheTTL": 300,
    "lastModified": "2025-10-06T09:32:00Z"
  }
}
```

---

### 1.5 協作介面定義

#### 前端向後端請求的資訊
- 快取時間 (cacheTTL)
- 資料版本 (ETag / lastModified)
- 完整內容 (依 type 不同)

#### 後端向前端提供的保證
- 回應時間 < 500ms (p95)
- 支援 ETag 協商快取 (304 Not Modified)
- 快取失效時自動更新 lastModified

---

## 二、Modal 關閉動畫完成前是否允許重新開啟

**關聯模組**: `common/modal-interaction-pattern.md`

### 2.1 功能概述

防止使用者在 Modal 關閉動畫執行期間快速重新開啟,導致狀態混亂。

### 2.2 前端職責 (完全由前端決策)

#### 決策結果
**策略**: 動畫完成前禁止重新開啟

**理由**:
- 避免狀態混亂 (opening/closing 同時存在)
- 防止記憶體洩漏 (DOM 未完全卸載)
- 提升使用者體驗 (避免畫面閃爍)

#### 實作方式

```typescript
type ModalState = 'closed' | 'opening' | 'opened' | 'closing';

const [modalState, setModalState] = useState<ModalState>('closed');
const ANIMATION_DURATION = 300; // 毫秒

const openModal = () => {
  if (modalState !== 'closed') {
    console.warn('Modal is not in closed state, ignoring open request');
    return;
  }

  setModalState('opening');
  setTimeout(() => setModalState('opened'), ANIMATION_DURATION);
};

const closeModal = () => {
  if (modalState !== 'opened') {
    console.warn('Modal is not in opened state, ignoring close request');
    return;
  }

  setModalState('closing');
  setTimeout(() => setModalState('closed'), ANIMATION_DURATION);
};
```

#### 配置參數

| 參數 | 預設值 | 說明 |
|------|--------|------|
| `animationDuration` | 300ms | 動畫時長 |
| `allowInterrupt` | false | 是否允許中斷動畫 |

---

### 2.3 後端職責

**無需後端介入** (純前端決策)

---

## 三、KPI 數值的更新頻率與快取策略

**關聯模組**: `resources-discovery-spec.md`

### 3.1 功能概述

資源 KPI 數值 (總數/健康度/告警數) 需要平衡即時性與效能,採用快取策略。

### 3.2 前端職責

#### UI/UX 決策
- 顯示更新時間 (「5 分鐘前更新」)
- 提供「立即刷新」按鈕
- 快取過期前使用快取資料
- 背景自動刷新 (可選)

#### 實作方式
```typescript
const { data, refetch } = useQuery({
  queryKey: ['kpi', 'resources'],
  queryFn: fetchResourceKPI,
  staleTime: data?.meta.cacheTTL * 1000, // 後端提供
  refetchInterval: data?.meta.updateIntervalSeconds * 1000, // 背景刷新
  refetchOnWindowFocus: true
});

// 手動刷新
const handleRefresh = () => {
  refetch();
};
```

---

### 3.3 後端職責

#### API 定義
```
GET /api/v1/resources/kpi
```

#### 回應格式
```json
{
  "data": {
    "totalResources": 1250,
    "healthyCount": 1190,
    "healthyPercentage": 95.2,
    "warningCount": 55,
    "criticalCount": 5,
    "unknownCount": 0,
    "byType": {
      "server": 800,
      "database": 200,
      "service": 250
    }
  },
  "meta": {
    "updatedAt": "2025-10-06T10:00:00Z",
    "updateIntervalSeconds": 300,
    "cacheTTL": 300,
    "nextUpdateAt": "2025-10-06T10:05:00Z"
  }
}
```

#### 快取策略

| 參數 | 值 | 說明 |
|------|-----|------|
| `updateIntervalSeconds` | 300 | 後端計算頻率 (5 分鐘) |
| `cacheTTL` | 300 | 前端快取時間 (5 分鐘) |
| `Cache-Control` | `max-age=300` | HTTP 快取標頭 |

---

### 3.4 Mock 資料

```json
{
  "data": {
    "totalResources": 1250,
    "healthyCount": 1190,
    "healthyPercentage": 95.2,
    "warningCount": 55,
    "criticalCount": 5,
    "unknownCount": 0,
    "byType": {
      "server": 800,
      "database": 200,
      "service": 250
    },
    "byStatus": {
      "healthy": 1190,
      "warning": 55,
      "critical": 5,
      "unknown": 0
    }
  },
  "meta": {
    "updatedAt": "2025-10-06T10:00:00Z",
    "updateIntervalSeconds": 300,
    "cacheTTL": 300,
    "nextUpdateAt": "2025-10-06T10:05:00Z"
  }
}
```

---

## 四、趨勢圖的資料粒度與聚合邏輯

**關聯模組**: `resources-discovery-spec.md`

### 4.1 功能概述

根據使用者選擇的時間範圍,自動選擇合適的資料粒度,平衡資料點數量與精確度。

### 4.2 前端職責

#### UI/UX 決策
- 時間範圍選擇器 (1h / 6h / 24h / 7d / 30d)
- 根據範圍自動選擇粒度 (前端或後端決定)
- 圖表渲染 (ECharts)
- 顯示資料點數量與聚合方式

#### 粒度選擇策略

| 時間範圍 | 粒度 | 資料點數量 | 決策方 |
|---------|------|-----------|--------|
| 1 小時 | 1 分鐘 | 60 | 前端建議,後端確認 |
| 6 小時 | 5 分鐘 | 72 | 前端建議,後端確認 |
| 24 小時 | 5 分鐘 | 288 | 前端建議,後端確認 |
| 7 天 | 1 小時 | 168 | 前端建議,後端確認 |
| 30 天 | 1 天 | 30 | 前端建議,後端確認 |

#### 實作方式
```typescript
const getGranularity = (range: string): string => {
  const granularityMap = {
    '1h': '1m',
    '6h': '5m',
    '24h': '5m',
    '7d': '1h',
    '30d': '1d'
  };
  return granularityMap[range] || '5m';
};

const { data } = useQuery({
  queryKey: ['trend', range, granularity],
  queryFn: () => fetchTrend({ range, granularity: getGranularity(range) })
});
```

---

### 4.3 後端職責

#### API 定義
```
GET /api/v1/resources/trend?range=24h&granularity=5m
```

**參數**:
- `range`: 時間範圍 (`1h` / `6h` / `24h` / `7d` / `30d`)
- `granularity`: 資料粒度 (`1m` / `5m` / `1h` / `1d`) - 可選,後端自動選擇

#### 回應格式
```json
{
  "data": {
    "dataPoints": [
      { "timestamp": "2025-10-06T09:00:00Z", "value": 95.2, "count": 1250 },
      { "timestamp": "2025-10-06T09:05:00Z", "value": 94.8, "count": 1248 },
      { "timestamp": "2025-10-06T09:10:00Z", "value": 95.5, "count": 1252 }
    ],
    "summary": {
      "min": 92.1,
      "max": 97.8,
      "avg": 95.2,
      "current": 95.5
    }
  },
  "meta": {
    "range": "24h",
    "granularity": "5m",
    "aggregation": "avg",
    "dataPointCount": 288,
    "startTime": "2025-10-05T10:00:00Z",
    "endTime": "2025-10-06T10:00:00Z"
  }
}
```

#### 聚合方法

| 指標類型 | 聚合方法 | 說明 |
|---------|---------|------|
| 健康度百分比 | `avg` | 平均值 |
| 資源數量 | `last` | 最後值 (時間點快照) |
| CPU/Memory | `avg` | 平均值 |
| 告警數量 | `sum` | 總和 |

---

### 4.4 Mock 資料

```json
{
  "data": {
    "dataPoints": [
      { "timestamp": "2025-10-06T00:00:00Z", "value": 95.2, "count": 1250 },
      { "timestamp": "2025-10-06T00:05:00Z", "value": 94.8, "count": 1248 },
      { "timestamp": "2025-10-06T00:10:00Z", "value": 95.5, "count": 1252 },
      { "timestamp": "2025-10-06T00:15:00Z", "value": 93.9, "count": 1245 }
    ],
    "summary": {
      "min": 92.1,
      "max": 97.8,
      "avg": 95.2,
      "current": 93.9
    }
  },
  "meta": {
    "range": "24h",
    "granularity": "5m",
    "aggregation": "avg",
    "dataPointCount": 288,
    "startTime": "2025-10-05T10:00:00Z",
    "endTime": "2025-10-06T10:00:00Z"
  }
}
```

---

## 五、儀表板的權限繼承與分享機制

**關聯模組**: `modules/dashboards-list-spec.md`

### 5.1 功能概述

儀表板支援多層級權限 (私人/團隊/公開) 與分享連結功能。

### 5.2 前端職責

#### UI/UX 設計
- 權限選擇器 (Radio: 私人/團隊/公開)
- 分享對話框 (連結 + 過期時間)
- 顯示權限來源標籤 (「繼承自團隊 XXX」)
- 權限列表 (直接授予的使用者/團隊)

#### 實作範例
```typescript
<Select value={visibility} onChange={handleVisibilityChange}>
  <Option value="private">
    <Icon type="lock" /> 私人 (僅我可見)
  </Option>
  <Option value="team">
    <Icon type="team" /> 團隊 (團隊成員可見)
  </Option>
  <Option value="public">
    <Icon type="global" /> 公開 (所有人可見)
  </Option>
</Select>
```

---

### 5.3 後端職責

#### 查詢權限 API
```
GET /api/v1/dashboards/:id/permissions
```

**回應格式**:
```json
{
  "data": {
    "owner": {
      "id": "user-001",
      "name": "admin@example.com"
    },
    "visibility": "team",
    "inheritedFrom": {
      "id": "team-001",
      "name": "Backend Team",
      "type": "team"
    },
    "directPermissions": [
      {
        "subjectId": "user-002",
        "subjectType": "user",
        "subjectName": "developer@example.com",
        "role": "viewer",
        "grantedAt": "2025-10-01T00:00:00Z"
      }
    ],
    "effectivePermissions": [
      {
        "subjectId": "user-001",
        "role": "owner",
        "source": "direct"
      },
      {
        "subjectId": "user-002",
        "role": "viewer",
        "source": "direct"
      },
      {
        "subjectId": "team-001",
        "role": "editor",
        "source": "inherited"
      }
    ]
  }
}
```

#### 分享連結 API
```
POST /api/v1/dashboards/:id/share
Request:
{
  "visibility": "public",
  "expiresAt": "2025-11-06T10:00:00Z"
}

Response:
{
  "data": {
    "shareUrl": "https://example.com/share/abc123def456",
    "shareToken": "abc123def456",
    "expiresAt": "2025-11-06T10:00:00Z",
    "createdAt": "2025-10-06T10:00:00Z"
  }
}
```

#### 撤銷分享 API
```
DELETE /api/v1/dashboards/:id/share/:token
```

---

### 5.4 權限計算邏輯 (後端)

**優先級**: Owner > Direct > Inherited

**繼承規則**:
- 儀表板歸屬於團隊 → 團隊成員自動獲得權限
- 子團隊可繼承父團隊的儀表板 (可選)

---

### 5.5 Mock 資料

```json
{
  "data": {
    "owner": {
      "id": "user-001",
      "name": "admin@example.com"
    },
    "visibility": "team",
    "inheritedFrom": {
      "id": "team-001",
      "name": "Backend Team",
      "type": "team"
    },
    "directPermissions": [
      {
        "subjectId": "user-002",
        "subjectType": "user",
        "subjectName": "developer@example.com",
        "role": "viewer",
        "grantedAt": "2025-10-01T00:00:00Z"
      }
    ],
    "effectivePermissions": [
      { "subjectId": "user-001", "role": "owner", "source": "direct" },
      { "subjectId": "user-002", "role": "viewer", "source": "direct" },
      { "subjectId": "team-001", "role": "editor", "source": "inherited" }
    ]
  }
}
```

---

## 六、儀表板版本控制與復原功能

**關聯模組**: `modules/dashboards-list-spec.md`

### 6.1 功能概述

儀表板每次儲存自動建立版本,支援版本比較與復原。

### 6.2 前端職責

#### UI/UX 設計
- 版本列表 (時間軸)
- 版本比較檢視 (Diff)
- 復原確認對話框
- 顯示當前版本標記

#### 實作範例
```typescript
<Timeline>
  {versions.map(v => (
    <Timeline.Item key={v.version}>
      <Text strong>{v.version}</Text> {v.current && <Tag>當前版本</Tag>}
      <div>{v.createdBy} · {formatDate(v.createdAt)}</div>
      <div>{v.changes}</div>
      <Button onClick={() => handleRestore(v.version)}>復原</Button>
    </Timeline.Item>
  ))}
</Timeline>
```

---

### 6.3 後端職責

#### 版本列表 API
```
GET /api/v1/dashboards/:id/versions
```

**回應格式**:
```json
{
  "data": {
    "versions": [
      {
        "version": "v1.2.3",
        "createdAt": "2025-10-06T10:00:00Z",
        "createdBy": {
          "id": "user-001",
          "name": "admin@example.com"
        },
        "changes": "更新 CPU 使用率圖表配置",
        "changesSummary": {
          "panelsAdded": 1,
          "panelsModified": 2,
          "panelsRemoved": 0
        }
      },
      {
        "version": "v1.2.2",
        "createdAt": "2025-10-05T15:30:00Z",
        "createdBy": {
          "id": "user-001",
          "name": "admin@example.com"
        },
        "changes": "新增記憶體趨勢圖",
        "changesSummary": {
          "panelsAdded": 1,
          "panelsModified": 0,
          "panelsRemoved": 0
        }
      }
    ],
    "currentVersion": "v1.2.3",
    "totalVersions": 15
  }
}
```

#### 版本比較 API
```
GET /api/v1/dashboards/:id/versions/compare?from=v1.2.2&to=v1.2.3
```

**回應格式**:
```json
{
  "data": {
    "from": "v1.2.2",
    "to": "v1.2.3",
    "diff": {
      "panels": {
        "added": [
          { "id": "panel-new", "title": "CPU 使用率", "type": "graph" }
        ],
        "modified": [
          {
            "id": "panel-001",
            "title": "記憶體趨勢",
            "changes": {
              "query": { "before": "...", "after": "..." }
            }
          }
        ],
        "removed": []
      }
    }
  }
}
```

#### 版本復原 API
```
POST /api/v1/dashboards/:id/restore/:version
```

**回應格式**:
```json
{
  "data": {
    "success": true,
    "restoredVersion": "v1.2.2",
    "newVersion": "v1.2.4",
    "message": "已復原至版本 v1.2.2,建立新版本 v1.2.4"
  }
}
```

---

### 6.4 版本策略 (後端)

**版本號格式**: `v{major}.{minor}.{patch}`
- **Major**: 重大變更 (手動升級)
- **Minor**: 新增功能 (自動儲存)
- **Patch**: 小修改 (自動儲存)

**儲存策略**: Git-like (僅儲存 diff,非完整內容)

**保留策略**: 保留最近 30 個版本,30 天前版本歸檔

---

### 6.5 Mock 資料

```json
{
  "data": {
    "versions": [
      {
        "version": "v1.2.3",
        "createdAt": "2025-10-06T10:00:00Z",
        "createdBy": { "id": "user-001", "name": "admin@example.com" },
        "changes": "更新 CPU 使用率圖表配置",
        "changesSummary": { "panelsAdded": 1, "panelsModified": 2, "panelsRemoved": 0 }
      },
      {
        "version": "v1.2.2",
        "createdAt": "2025-10-05T15:30:00Z",
        "createdBy": { "id": "user-001", "name": "admin@example.com" },
        "changes": "新增記憶體趨勢圖",
        "changesSummary": { "panelsAdded": 1, "panelsModified": 0, "panelsRemoved": 0 }
      }
    ],
    "currentVersion": "v1.2.3",
    "totalVersions": 15
  }
}
```

---

## 七、子團隊的權限繼承與覆寫規則

**關聯模組**: `modules/identity-team-spec.md`

### 7.1 功能概述

子團隊可繼承父團隊權限,也可覆寫特定權限。

### 7.2 前端職責

#### UI/UX 設計
- 權限樹狀圖視覺化
- 繼承路徑顯示 (Root → Parent → Current)
- 覆寫標記 (圖示 ⚠️)
- 有效權限計算結果顯示

#### 實作範例
```typescript
<Tree>
  <TreeNode title="Root 團隊" permissions={['incident.read']}>
    <TreeNode title="父團隊" permissions={['resource.read']} inherited={['incident.read']}>
      <TreeNode
        title="當前團隊"
        permissions={['resource.write']}
        inherited={['incident.read', 'resource.read']}
        overridden={['resource.delete']}
      />
    </TreeNode>
  </TreeNode>
</Tree>
```

---

### 7.3 後端職責

#### 查詢繼承權限 API
```
GET /api/v1/teams/:id/permissions/inherited
```

**回應格式**:
```json
{
  "data": {
    "teamId": "team-current",
    "teamName": "Frontend Team",
    "directPermissions": ["resource.write"],
    "inheritedPermissions": ["incident.read", "resource.read"],
    "overriddenPermissions": ["resource.delete"],
    "effectivePermissions": ["incident.read", "resource.read", "resource.write"],
    "inheritancePath": [
      {
        "teamId": "team-root",
        "teamName": "Root Team",
        "permissions": ["incident.read"]
      },
      {
        "teamId": "team-parent",
        "teamName": "Backend Team",
        "permissions": ["resource.read"]
      },
      {
        "teamId": "team-current",
        "teamName": "Frontend Team",
        "permissions": ["resource.write"],
        "overrides": ["resource.delete"]
      }
    ]
  }
}
```

#### 權限計算邏輯 (後端)

**繼承規則**:
1. 子團隊繼承所有父團隊權限
2. 子團隊可新增自己的權限
3. 子團隊可覆寫 (禁用) 繼承的權限

**有效權限** = (繼承權限 ∪ 直接權限) - 覆寫權限

---

### 7.4 前端視覺化範例

```
團隊階層            權限
─────────────────────────────────────────────
Root 團隊         incident.read (繼承) ✓
  └─ 父團隊       resource.read (繼承) ✓
      └─ 當前團隊 resource.write (直接) ✓
                  resource.delete (覆寫禁止) ⚠️
```

---

### 7.5 Mock 資料

```json
{
  "data": {
    "teamId": "team-003",
    "teamName": "Frontend Team",
    "directPermissions": ["resource.write", "dashboard.create"],
    "inheritedPermissions": ["incident.read", "resource.read"],
    "overriddenPermissions": ["resource.delete"],
    "effectivePermissions": ["incident.read", "resource.read", "resource.write", "dashboard.create"],
    "inheritancePath": [
      {
        "teamId": "team-001",
        "teamName": "Root Team",
        "permissions": ["incident.read"]
      },
      {
        "teamId": "team-002",
        "teamName": "Engineering Team",
        "permissions": ["resource.read", "resource.delete"]
      },
      {
        "teamId": "team-003",
        "teamName": "Frontend Team",
        "permissions": ["resource.write", "dashboard.create"],
        "overrides": ["resource.delete"]
      }
    ]
  }
}
```

---

## 八、資源批次操作的數量上限

**關聯模組**: `modules/resources-list-spec.md`

### 8.1 功能概述

批次操作 (刪除/更新) 需要限制數量,避免效能問題與誤操作。

### 8.2 前端職責

#### UI/UX 設計
- 選擇超過上限時禁用批次按鈕
- 顯示提示訊息 (「最多選擇 100 個資源」)
- 提供「全選」與「取消全選」功能
- 全選時僅選擇當前頁面 (不跨頁)

#### 實作範例
```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const { data: limits } = useQuery({
  queryKey: ['batch-limits'],
  queryFn: fetchBatchLimits
});

const maxBatchSize = limits?.maxBatchSize || 100;
const isOverLimit = selectedIds.length > maxBatchSize;

<Alert
  type="warning"
  show={isOverLimit}
  message={`最多選擇 ${maxBatchSize} 個資源,當前已選擇 ${selectedIds.length} 個`}
/>

<Button
  disabled={isOverLimit || selectedIds.length === 0}
  onClick={handleBatchDelete}
>
  批次刪除
</Button>
```

---

### 8.3 後端職責

#### 查詢批次限制 API
```
GET /api/v1/config/resources/batch-limits
```

**回應格式**:
```json
{
  "data": {
    "maxBatchSize": 100,
    "recommendedBatchSize": 50,
    "limits": {
      "delete": 20,
      "update": 100,
      "export": 1000
    },
    "warningThreshold": 80
  }
}
```

#### 批次操作 API (驗證)
```
POST /api/v1/resources/batch-delete
Request:
{
  "resourceIds": ["res-001", "res-002", ...]
}

Response (錯誤):
{
  "error": {
    "code": "BATCH_SIZE_EXCEEDED",
    "message": "批次刪除最多 20 個資源",
    "details": {
      "maxBatchSize": 20,
      "requestedSize": 50
    }
  }
}
```

---

### 8.4 Mock 資料

```json
{
  "data": {
    "maxBatchSize": 100,
    "recommendedBatchSize": 50,
    "limits": {
      "delete": 20,
      "update": 100,
      "export": 1000,
      "tag": 50
    },
    "warningThreshold": 80
  }
}
```

---

## 九、通知重試的策略與上限次數

**關聯模組**: `modules/notification-history-spec.md`

### 9.1 功能概述

通知發送失敗時自動重試,採用指數退避策略。

### 9.2 前端職責

#### UI/UX 設計
- 顯示重試次數 (「重試 2/3 次」)
- 顯示重試狀態標籤 (等待重試/重試中/已放棄)
- 提供「手動重試」按鈕
- 顯示下次重試時間 (「1 分鐘後重試」)

#### 實作範例
```typescript
const getRetryStatusTag = (notification) => {
  const { status, retryCount, maxRetries } = notification;

  if (status === 'success') return <Tag color="success">已發送</Tag>;
  if (status === 'failed' && retryCount >= maxRetries) return <Tag color="error">已放棄</Tag>;
  if (status === 'retrying') return <Tag color="warning">重試中 ({retryCount}/{maxRetries})</Tag>;
  if (status === 'waiting_retry') return <Tag color="processing">等待重試</Tag>;
};
```

---

### 9.3 後端職責

#### 查詢重試策略 API
```
GET /api/v1/config/notification/retry-policy
```

**回應格式**:
```json
{
  "data": {
    "maxRetries": 3,
    "retryDelaySeconds": [60, 300, 900],
    "retryStrategy": "exponential_backoff",
    "abandonAfterHours": 24,
    "retryableErrors": ["timeout", "connection_refused", "rate_limited"]
  }
}
```

#### 查詢通知狀態 API
```
GET /api/v1/notifications/:id
```

**回應格式**:
```json
{
  "data": {
    "id": "notif-001",
    "status": "waiting_retry",
    "channel": "email",
    "retryCount": 2,
    "maxRetries": 3,
    "nextRetryAt": "2025-10-06T10:15:00Z",
    "lastError": {
      "code": "SMTP_TIMEOUT",
      "message": "SMTP 伺服器連線逾時",
      "occurredAt": "2025-10-06T10:10:00Z"
    },
    "retryHistory": [
      {
        "attempt": 1,
        "timestamp": "2025-10-06T10:01:00Z",
        "error": "Connection timeout"
      },
      {
        "attempt": 2,
        "timestamp": "2025-10-06T10:06:00Z",
        "error": "SMTP timeout"
      }
    ]
  }
}
```

#### 手動重試 API
```
POST /api/v1/notifications/:id/retry
```

---

### 9.4 重試策略 (後端)

**指數退避**:
- 第 1 次重試: 1 分鐘後
- 第 2 次重試: 5 分鐘後
- 第 3 次重試: 15 分鐘後

**放棄條件**:
- 重試次數達上限 (3 次)
- 超過放棄時間 (24 小時)
- 遇到不可重試錯誤 (如 401 Unauthorized)

---

### 9.5 Mock 資料

```json
{
  "data": {
    "id": "notif-001",
    "status": "waiting_retry",
    "channel": "slack",
    "recipient": "#alerts",
    "subject": "系統告警: CPU 使用率過高",
    "retryCount": 2,
    "maxRetries": 3,
    "nextRetryAt": "2025-10-06T10:15:00Z",
    "lastError": {
      "code": "RATE_LIMITED",
      "message": "Slack API 速率限制",
      "occurredAt": "2025-10-06T10:10:00Z"
    },
    "retryHistory": [
      {
        "attempt": 1,
        "timestamp": "2025-10-06T10:01:00Z",
        "error": "Network timeout",
        "duration": 5000
      },
      {
        "attempt": 2,
        "timestamp": "2025-10-06T10:06:00Z",
        "error": "Rate limited",
        "duration": 3000
      }
    ]
  }
}
```

---

## 十、觸發器防抖的時間窗口與策略

**關聯模組**: `modules/automation-trigger-spec.md`

### 10.1 功能概述

觸發器執行後進入冷卻期,避免短時間內重複觸發。

### 10.2 前端職責

#### UI/UX 設計
- 顯示防抖狀態 (「冷卻中,剩餘 3 分鐘」)
- 提供防抖時間設定滑桿 (1-60 分鐘)
- 冷卻期間禁用「立即觸發」按鈕
- 顯示上次觸發時間

#### 實作範例
```typescript
const DebounceStatus = ({ trigger }) => {
  const { status, cooldownUntil, remainingSeconds } = trigger;

  if (status !== 'cooling_down') return null;

  return (
    <Alert type="info">
      <Icon type="clock-circle" />
      冷卻中,剩餘 {formatSeconds(remainingSeconds)}
      <Progress percent={(1 - remainingSeconds / 300) * 100} />
    </Alert>
  );
};
```

---

### 10.3 後端職責

#### 查詢防抖配置 API
```
GET /api/v1/config/triggers/debounce
```

**回應格式**:
```json
{
  "data": {
    "defaultDebounceMinutes": 5,
    "minDebounceMinutes": 1,
    "maxDebounceMinutes": 60,
    "allowPerTriggerDebounce": true,
    "debounceStrategy": "sliding_window"
  }
}
```

#### 查詢觸發器狀態 API
```
GET /api/v1/triggers/:id/status
```

**回應格式**:
```json
{
  "data": {
    "id": "trigger-001",
    "name": "CPU 告警觸發器",
    "status": "cooling_down",
    "lastTriggeredAt": "2025-10-06T10:00:00Z",
    "cooldownUntil": "2025-10-06T10:05:00Z",
    "remainingSeconds": 180,
    "debounceMinutes": 5,
    "triggerCount": 12,
    "lastTriggerResult": "success"
  }
}
```

#### 強制觸發 API (忽略防抖)
```
POST /api/v1/triggers/:id/force-trigger
Request:
{
  "reason": "緊急修復測試"
}
```

---

### 10.4 防抖策略 (後端)

**Sliding Window** (滑動窗口):
- 每次觸發後,重新計算冷卻時間
- 例如: 設定 5 分鐘冷卻,在 10:00 觸發,則 10:05 前禁止觸發

**Fixed Window** (固定窗口) - 可選:
- 每個固定時間窗口內僅觸發一次
- 例如: 每 5 分鐘窗口內僅觸發 1 次

---

### 10.5 Mock 資料

```json
{
  "data": {
    "id": "trigger-001",
    "name": "高 CPU 使用率觸發器",
    "status": "cooling_down",
    "enabled": true,
    "lastTriggeredAt": "2025-10-06T10:00:00Z",
    "cooldownUntil": "2025-10-06T10:05:00Z",
    "remainingSeconds": 180,
    "debounceMinutes": 5,
    "triggerCount": 12,
    "lastTriggerResult": "success",
    "lastTriggerDuration": 2350,
    "averageDuration": 1800
  }
}
```

---

## 十一、總結

### 11.1 涵蓋項目

本文件定義了 **10 項跨域協作** 的完整 API 規範與前後端職責劃分:

| 項目 | 前端職責 | 後端職責 | 章節 |
|------|---------|---------|------|
| Drawer 預載入 | 觸發時機、快取策略 | API、ETag、TTL | § 1 |
| Modal 動畫控制 | 狀態管理、防抖 | 無需介入 | § 2 |
| KPI 更新頻率 | 顯示更新時間、手動刷新 | 計算頻率、快取 TTL | § 3 |
| 趨勢圖粒度 | 時間範圍選擇、圖表渲染 | 粒度計算、聚合邏輯 | § 4 |
| 儀表板權限 | 權限選擇器、分享對話框 | 權限計算、繼承邏輯 | § 5 |
| 儀表板版本 | 版本列表、比較 UI | 版本儲存、復原邏輯 | § 6 |
| 團隊權限繼承 | 權限樹視覺化、覆寫標記 | 繼承計算、有效權限 | § 7 |
| 批次操作限制 | 禁用超限按鈕、提示 | 限制參數、API 驗證 | § 8 |
| 通知重試 | 重試狀態顯示、手動重試 | 重試策略、指數退避 | § 9 |
| 觸發器防抖 | 冷卻狀態顯示、設定 | 防抖邏輯、窗口計算 | § 10 |

### 11.2 使用方式

各模組 SPEC 透過引用本文件,避免重複定義:

```markdown
## N. [功能名稱] (Frontend-Backend Collaboration)

**定義**: 參見 `_collaboration-spec.md` § X

**前端實作**: (簡要說明)
**後端實作**: (簡要說明)
**API Mock**: 已提供於 Mock Server
```

### 11.3 後續步驟

- [ ] 前後端團隊共同審查 API 設計
- [ ] Mock Server 實作所有端點
- [ ] 前端實作 UI 與互動邏輯
- [ ] 後端實作業務邏輯與 API
- [ ] Contract Testing 驗證一致性

---

**文件完成日期**: 2025-10-07
**撰寫人員**: Claude Code (Spec Architect)
**審核狀態**: 待前後端團隊共同審閱
