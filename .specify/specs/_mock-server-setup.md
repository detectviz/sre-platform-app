# Mock Server 設定指南 (Mock Server Setup Guide)

**建立日期**: 2025-10-07
**狀態**: Draft
**目的**: 提供完整的 Mock Server 建置與使用指南
**技術選型**: MSW (Mock Service Worker) + OpenTelemetry

---

## 一、技術選型

### 1.1 Mock Service Worker (MSW)

**選擇理由**:
- ✅ 不需獨立伺服器,直接攔截網路請求
- ✅ 支援 TypeScript,型別安全
- ✅ 開發與測試環境共用
- ✅ 瀏覽器與 Node.js 皆支援
- ✅ 熱更新 Mock 資料

**官方文件**: https://mswjs.io/

---

## 二、安裝與初始化

### 2.1 安裝依賴

```bash
# 安裝 MSW
npm install msw --save-dev

# 初始化 Service Worker
npx msw init public/ --save
```

### 2.2 目錄結構

```
src/
├── mocks/
│   ├── browser.ts           # 瀏覽器環境入口
│   ├── server.ts            # Node.js 環境入口 (測試用)
│   ├── handlers/            # API Handlers
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── incidents.ts
│   │   ├── resources.ts
│   │   ├── config.ts
│   │   └── ...
│   └── data/                # Mock 資料
│       ├── incidents.ts
│       ├── resources.ts
│       └── ...
```

---

## 三、基礎設定

### 3.1 瀏覽器環境設定

**src/mocks/browser.ts**:
```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**src/index.tsx** (應用入口):
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 開發環境啟用 Mock Server
if (process.env.REACT_APP_MOCK_ENABLED === 'true') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'warn', // 未處理的請求發出警告
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

---

### 3.2 測試環境設定

**src/mocks/server.ts**:
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**src/setupTests.ts**:
```typescript
import { server } from './mocks/server';

// 所有測試前啟動 Mock Server
beforeAll(() => server.listen());

// 每個測試後重置 Handlers
afterEach(() => server.resetHandlers());

// 所有測試後關閉 Mock Server
afterAll(() => server.close());
```

---

## 四、Mock Handlers 實作

### 4.1 認證相關 (auth.ts)

```typescript
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // 登入
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email, password } = await request.json();

    // 模擬驗證邏輯
    if (email === 'admin@example.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          accessToken: 'mock-jwt-token-abc123',
          refreshToken: 'mock-refresh-token-xyz789',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 'user-001',
            email: 'admin@example.com',
            name: 'Admin User',
            avatar: 'https://i.pravatar.cc/150?u=admin'
          }
        }
      });
    }

    return HttpResponse.json(
      {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '帳號或密碼錯誤'
        }
      },
      { status: 401 }
    );
  }),

  // 獲取當前使用者權限
  http.get('/api/v1/me/permissions', () => {
    return HttpResponse.json({
      data: {
        permissions: [
          'incidents:read',
          'incidents:update',
          'incidents:delete',
          'users:create',
          'settings:roles:write'
        ],
        roles: [
          { id: 'role-001', name: 'Admin' }
        ]
      }
    });
  }),

  // 登出
  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json(null, { status: 204 });
  })
];
```

---

### 4.2 配置參數 (config.ts)

```typescript
import { http, HttpResponse } from 'msw';
import { mockRetentionConfig, mockConcurrencyConfig } from '../data/config';

export const configHandlers = [
  // 保留時長配置
  http.get('/api/v1/config/retention/:type', ({ params }) => {
    const { type } = params;
    const config = mockRetentionConfig[type as string] || mockRetentionConfig['default'];

    return HttpResponse.json({ data: config });
  }),

  // 並行限制配置
  http.get('/api/v1/config/concurrency/:type', ({ params }) => {
    const { type } = params;
    const config = mockConcurrencyConfig[type as string] || mockConcurrencyConfig['default'];

    return HttpResponse.json({ data: config });
  }),

  // 授權限制
  http.get('/api/v1/license/limits', () => {
    return HttpResponse.json({
      data: {
        maxUsers: 100,
        currentUsers: 85,
        maxResources: 1000,
        currentResources: 750,
        maxDashboards: 50,
        currentDashboards: 35,
        enforcement: 'hard',
        gracePeriodDays: 0,
        features: {
          premium: true,
          multiTenant: false,
          advancedAnalytics: true
        }
      }
    });
  })
];
```

---

### 4.3 事件列表 (incidents.ts)

```typescript
import { http, HttpResponse, delay } from 'msw';
import { mockIncidents } from '../data/incidents';

export const incidentHandlers = [
  // 列表查詢 (支援分頁、篩選、排序)
  http.get('/api/v1/incidents', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const status = url.searchParams.get('filter[status]');
    const severity = url.searchParams.get('filter[severity]');

    // 篩選
    let filtered = [...mockIncidents];
    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }
    if (severity) {
      filtered = filtered.filter(i => i.severity === severity);
    }

    // 分頁
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return HttpResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
        hasNext: end < filtered.length,
        hasPrevious: page > 1
      }
    });
  }),

  // 單筆查詢
  http.get('/api/v1/incidents/:id', ({ params }) => {
    const { id } = params;
    const incident = mockIncidents.find(i => i.id === id);

    if (!incident) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `找不到 ID 為 ${id} 的事件`
          }
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: incident });
  }),

  // 批次刪除
  http.post('/api/v1/incidents/batch-delete', async ({ request }) => {
    const { ids } = await request.json();

    // 模擬批次處理
    const success = ids.slice(0, Math.floor(ids.length * 0.9));
    const failed = ids.slice(Math.floor(ids.length * 0.9));

    return HttpResponse.json({
      data: {
        success,
        failed: failed.map(id => ({ id, reason: '權限不足' })),
        total: ids.length,
        successCount: success.length,
        failedCount: failed.length
      }
    });
  }),

  // 模擬延遲 (測試載入狀態)
  http.get('/api/v1/incidents/slow', async () => {
    await delay(3000);
    return HttpResponse.json({ data: mockIncidents });
  }),

  // 模擬錯誤 (測試錯誤處理)
  http.get('/api/v1/incidents/error', () => {
    return HttpResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '系統發生錯誤',
          requestId: 'req-mock-error-001'
        }
      },
      { status: 500 }
    );
  })
];
```

---

### 4.4 Handlers 總入口 (index.ts)

```typescript
import { authHandlers } from './auth';
import { incidentHandlers } from './incidents';
import { resourceHandlers } from './resources';
import { configHandlers } from './config';
import { dashboardHandlers } from './dashboards';
import { notificationHandlers } from './notifications';

export const handlers = [
  ...authHandlers,
  ...incidentHandlers,
  ...resourceHandlers,
  ...configHandlers,
  ...dashboardHandlers,
  ...notificationHandlers
];
```

---

## 五、Mock 資料管理

### 5.1 事件資料 (data/incidents.ts)

```typescript
export const mockIncidents = [
  {
    id: 'inc-001',
    title: 'CPU 使用率過高',
    description: '主機 server-001 的 CPU 使用率持續超過 90%',
    status: 'active',
    severity: 'critical',
    assignee: {
      id: 'user-001',
      name: 'admin@example.com',
      avatar: 'https://i.pravatar.cc/150?u=admin'
    },
    createdAt: '2025-10-06T09:30:00Z',
    updatedAt: '2025-10-06T09:32:00Z',
    affectedResources: ['server-001'],
    tags: ['production', 'high-priority']
  },
  {
    id: 'inc-002',
    title: '資料庫連線異常',
    description: '主資料庫無法連線',
    status: 'active',
    severity: 'critical',
    assignee: null,
    createdAt: '2025-10-06T08:15:00Z',
    updatedAt: '2025-10-06T08:15:00Z',
    affectedResources: ['db-primary-001'],
    tags: ['database', 'production']
  },
  // ... 更多資料
];
```

---

### 5.2 配置資料 (data/config.ts)

```typescript
export const mockRetentionConfig = {
  'automation-history': {
    retentionDays: 90,
    minRetentionDays: 7,
    maxRetentionDays: 365,
    archiveEnabled: true,
    archiveAfterDays: 30
  },
  'audit-logs': {
    retentionDays: 180,
    minRetentionDays: 30,
    maxRetentionDays: 730,
    archiveEnabled: true,
    archiveAfterDays: 90,
    canDelete: false
  },
  'default': {
    retentionDays: 90,
    minRetentionDays: 7,
    maxRetentionDays: 365,
    archiveEnabled: true
  }
};

export const mockConcurrencyConfig = {
  'backtesting': {
    maxConcurrentTasks: 3,
    queueSize: 10,
    priorityLevels: ['high', 'normal', 'low'],
    timeoutSeconds: 600
  },
  'playbooks': {
    maxConcurrentTasks: 5,
    queueSize: 20,
    priorityLevels: ['high', 'normal', 'low'],
    timeoutSeconds: 300
  },
  'default': {
    maxConcurrentTasks: 3,
    queueSize: 10,
    priorityLevels: ['high', 'normal', 'low']
  }
};
```

---

## 六、進階功能

### 6.1 動態 Mock 資料 (狀態保持)

```typescript
import { http, HttpResponse } from 'msw';

// 使用 Map 儲存狀態
const incidentsStore = new Map(mockIncidents.map(i => [i.id, i]));

export const incidentHandlers = [
  // 更新事件
  http.patch('/api/v1/incidents/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();

    const incident = incidentsStore.get(id as string);
    if (!incident) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    // 更新狀態
    const updated = { ...incident, ...updates, updatedAt: new Date().toISOString() };
    incidentsStore.set(id as string, updated);

    return HttpResponse.json({ data: updated });
  }),

  // 查詢時返回最新狀態
  http.get('/api/v1/incidents/:id', ({ params }) => {
    const { id } = params;
    const incident = incidentsStore.get(id as string);

    if (!incident) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    return HttpResponse.json({ data: incident });
  })
];
```

---

### 6.2 錯誤場景模擬

```typescript
// 模擬網路錯誤
http.get('/api/v1/incidents/network-error', () => {
  return HttpResponse.error();
});

// 模擬逾時
http.get('/api/v1/incidents/timeout', async () => {
  await delay(120000); // 超過 timeout 設定
  return HttpResponse.json({ data: [] });
});

// 模擬隨機錯誤 (80% 成功率)
http.get('/api/v1/incidents/random-error', () => {
  if (Math.random() > 0.8) {
    return HttpResponse.json(
      { error: { code: 'RANDOM_ERROR', message: '隨機錯誤' } },
      { status: 500 }
    );
  }
  return HttpResponse.json({ data: mockIncidents });
});
```

---

### 6.3 模擬速率限制

```typescript
let requestCount = 0;
const RATE_LIMIT = 10;
const WINDOW_MS = 60000; // 1 分鐘

setInterval(() => {
  requestCount = 0;
}, WINDOW_MS);

http.get('/api/v1/rate-limited-endpoint', () => {
  requestCount++;

  if (requestCount > RATE_LIMIT) {
    return HttpResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '請求過於頻繁,請稍後再試',
          retryAfter: 60
        }
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + WINDOW_MS)
        }
      }
    );
  }

  return HttpResponse.json({ data: 'success' });
});
```

---

## 七、環境配置

### 7.1 環境變數設定

**.env.development**:
```bash
# 啟用 Mock Server
REACT_APP_MOCK_ENABLED=true

# API Base URL
REACT_APP_API_BASE_URL=/api/v1
```

**.env.production**:
```bash
# 禁用 Mock Server
REACT_APP_MOCK_ENABLED=false

# 正式環境 API
REACT_APP_API_BASE_URL=https://api.example.com/api/v1
```

---

### 7.2 條件式啟用

```typescript
// src/index.tsx
async function enableMocking() {
  if (process.env.REACT_APP_MOCK_ENABLED !== 'true') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  return worker.start({
    onUnhandledRequest(request, print) {
      // 忽略靜態資源
      if (request.url.includes('/static/')) {
        return;
      }
      print.warning();
    }
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
});
```

---

## 八、前端可觀測性 (OpenTelemetry)

### 8.1 OpenTelemetry 整合

#### 安裝依賴
```bash
npm install @opentelemetry/api \
            @opentelemetry/sdk-trace-web \
            @opentelemetry/instrumentation-fetch \
            @opentelemetry/instrumentation-xml-http-request \
            @opentelemetry/exporter-trace-otlp-http \
            @opentelemetry/context-zone
```

#### 初始化設定

**src/telemetry/index.ts**:
```typescript
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ZoneContextManager } from '@opentelemetry/context-zone';

// 初始化 Tracer Provider
const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'sre-platform-frontend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV
  })
});

// 配置 OTLP Exporter
const exporter = new OTLPTraceExporter({
  url: process.env.REACT_APP_OTEL_EXPORTER_URL || 'http://localhost:4318/v1/traces',
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_OTEL_AUTH_TOKEN}`
  }
});

// 使用 Batch Processor (效能優化)
provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
  maxQueueSize: 100,
  scheduledDelayMillis: 5000
}));

// 註冊 Provider
provider.register({
  contextManager: new ZoneContextManager()
});

// 自動追蹤 Fetch 與 XHR
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: [
        /^https:\/\/api\.example\.com\/.*/
      ],
      clearTimingResources: true,
      applyCustomAttributesOnSpan: (span, request, response) => {
        // 添加自訂屬性
        span.setAttribute('http.request.id', response.headers.get('X-Request-ID') || 'unknown');
        span.setAttribute('http.user.id', localStorage.getItem('userId') || 'anonymous');
      }
    }),
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: [
        /^https:\/\/api\.example\.com\/.*/
      ]
    })
  ]
});

export default provider;
```

---

### 8.2 應用入口整合

**src/index.tsx**:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './telemetry'; // 引入 OpenTelemetry 初始化

// 啟用 Mock Server (開發環境)
if (process.env.REACT_APP_MOCK_ENABLED === 'true') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

---

### 8.3 自訂追蹤與 Span

#### 追蹤複雜元件渲染

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('sre-platform-frontend');

const TopologyGraph = () => {
  useEffect(() => {
    const span = tracer.startSpan('topology.graph.render');

    try {
      // 渲染拓撲圖
      renderTopologyGraph();
      span.setStatus({ code: 1 }); // OK
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message }); // ERROR
    } finally {
      span.end();
    }
  }, [data]);

  return <div>...</div>;
};
```

#### 追蹤使用者互動

```typescript
const handleSearch = async (query: string) => {
  const span = tracer.startSpan('user.search', {
    attributes: {
      'search.query': query,
      'search.filters': JSON.stringify(filters)
    }
  });

  try {
    const results = await searchAPI(query, filters);
    span.setAttribute('search.results.count', results.length);
    span.setStatus({ code: 1 });
    return results;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message });
    throw error;
  } finally {
    span.end();
  }
};
```

---

### 8.4 Core Web Vitals 自動追蹤

**src/telemetry/web-vitals.ts**:
```typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('sre-platform-frontend');

// 追蹤 Core Web Vitals
export function initWebVitals() {
  onCLS((metric) => {
    const span = tracer.startSpan('web-vitals.cls');
    span.setAttribute('metric.name', 'CLS');
    span.setAttribute('metric.value', metric.value);
    span.setAttribute('metric.rating', metric.rating);
    span.end();
  });

  onFID((metric) => {
    const span = tracer.startSpan('web-vitals.fid');
    span.setAttribute('metric.name', 'FID');
    span.setAttribute('metric.value', metric.value);
    span.setAttribute('metric.rating', metric.rating);
    span.end();
  });

  onLCP((metric) => {
    const span = tracer.startSpan('web-vitals.lcp');
    span.setAttribute('metric.name', 'LCP');
    span.setAttribute('metric.value', metric.value);
    span.setAttribute('metric.rating', metric.rating);
    span.end();
  });

  onFCP((metric) => {
    const span = tracer.startSpan('web-vitals.fcp');
    span.setAttribute('metric.name', 'FCP');
    span.setAttribute('metric.value', metric.value);
    span.end();
  });

  onTTFB((metric) => {
    const span = tracer.startSpan('web-vitals.ttfb');
    span.setAttribute('metric.name', 'TTFB');
    span.setAttribute('metric.value', metric.value);
    span.end();
  });
}
```

**src/index.tsx**:
```typescript
import { initWebVitals } from './telemetry/web-vitals';

// 初始化 Web Vitals 追蹤
initWebVitals();
```

---

### 8.5 錯誤邊界 (Error Boundary) 整合

```typescript
import React, { Component, ErrorInfo } from 'react';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('sre-platform-frontend');

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 記錄錯誤至 OpenTelemetry
    const span = tracer.startSpan('error.boundary.catch');
    span.recordException(error);
    span.setAttribute('error.stack', errorInfo.componentStack || '');
    span.setStatus({ code: 2, message: error.message });
    span.end();

    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>發生錯誤</h1>
          <p>請重新整理頁面或聯繫管理員</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**src/App.tsx**:
```typescript
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ... */}
      </Routes>
    </ErrorBoundary>
  );
}
```

---

### 8.6 OpenTelemetry Collector 設定

**docker-compose.yml** (開發環境):
```yaml
version: '3.8'
services:
  otel-collector:
    image: otel/opentelemetry-collector:latest
    command: ["--config=/etc/otel-config.yaml"]
    volumes:
      - ./otel-config.yaml:/etc/otel-config.yaml
    ports:
      - "4318:4318" # OTLP HTTP
      - "4317:4317" # OTLP gRPC
      - "13133:13133" # Health check
```

**otel-config.yaml**:
```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 5s
    send_batch_size: 100

exporters:
  logging:
    loglevel: debug

  # 匯出至 Jaeger (可視化)
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging, jaeger]
```

---

## 九、測試與驗證

### 9.1 單元測試

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import IncidentList from './IncidentList';

describe('IncidentList', () => {
  it('應正常顯示事件列表', async () => {
    render(<IncidentList />);

    await waitFor(() => {
      expect(screen.getByText('CPU 使用率過高')).toBeInTheDocument();
    });
  });

  it('應處理 API 錯誤', async () => {
    // 覆寫 Handler (僅本測試)
    server.use(
      http.get('/api/v1/incidents', () => {
        return HttpResponse.json(
          { error: { code: 'SERVER_ERROR' } },
          { status: 500 }
        );
      })
    );

    render(<IncidentList />);

    await waitFor(() => {
      expect(screen.getByText('載入失敗')).toBeInTheDocument();
    });
  });
});
```

---

### 9.2 手動測試腳本

**scripts/test-mock-api.sh**:
```bash
#!/bin/bash

# 啟動開發伺服器 (Mock Server 自動啟用)
npm run dev &

# 等待啟動
sleep 5

# 測試 API 端點
echo "Testing API endpoints..."

# 測試登入
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 測試事件列表
curl http://localhost:3000/api/v1/incidents?page=1&pageSize=20

echo "All tests completed"
```

---

## 十、最佳實踐

### 10.1 Mock 資料設計原則

1. ✅ **真實性**: 資料格式與正式環境一致
2. ✅ **完整性**: 包含正常/邊界/錯誤場景
3. ✅ **可維護性**: 集中管理於 `data/` 目錄
4. ✅ **可擴展性**: 支援動態資料與狀態保持

### 10.2 Handler 設計原則

1. ✅ **單一職責**: 每個 Handler 處理一個端點
2. ✅ **型別安全**: 使用 TypeScript 定義請求/回應型別
3. ✅ **錯誤處理**: 提供完整的錯誤場景模擬
4. ✅ **效能優化**: 避免不必要的延遲與計算

### 10.3 OpenTelemetry 最佳實踐

1. ✅ **自動化優先**: 使用自動 Instrumentation
2. ✅ **適度追蹤**: 僅追蹤關鍵路徑,避免過度追蹤
3. ✅ **語義屬性**: 使用 Semantic Conventions 標準屬性
4. ✅ **批次處理**: 使用 BatchSpanProcessor 提升效能
5. ✅ **敏感資訊**: 避免記錄密碼、Token 等敏感資訊

---

## 十一、故障排除

### 11.1 Mock Server 未啟動

**症狀**: 請求直接發送至真實 API

**解決方案**:
```bash
# 檢查環境變數
echo $REACT_APP_MOCK_ENABLED

# 檢查 Service Worker 註冊
# 瀏覽器 Console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('ServiceWorker registrations:', registrations);
});

# 重新初始化 Service Worker
npx msw init public/ --save
```

---

### 11.2 CORS 錯誤

**症狀**: 跨域請求被阻擋

**解決方案**:
MSW 自動處理 CORS,無需額外設定。若仍有問題,檢查:
```typescript
worker.start({
  onUnhandledRequest: 'bypass', // 未處理的請求直接通過
});
```

---

### 11.3 OpenTelemetry 資料未匯出

**症狀**: 無法在 Jaeger/Grafana 看到 Trace

**解決方案**:
```typescript
// 檢查 Exporter URL
console.log('OTEL Exporter URL:', process.env.REACT_APP_OTEL_EXPORTER_URL);

// 檢查 Span 是否正常建立
const span = tracer.startSpan('test');
console.log('Span context:', span.spanContext());
span.end();

// 檢查 Network Tab 是否有請求至 Collector
```

---

## 十二、總結

### 12.1 完成項目

✅ MSW 安裝與初始化
✅ 完整 Handlers 範例 (認證/事件/配置)
✅ Mock 資料管理策略
✅ 進階功能 (狀態保持/錯誤模擬/速率限制)
✅ OpenTelemetry 前端可觀測性整合
✅ 測試與驗證方法

### 12.2 下一步

1. 實作所有 42 個 API 端點的 Mock Handlers
2. 建立完整的 Mock 資料集
3. 整合 OpenTelemetry 至 CI/CD
4. 設定 Jaeger/Grafana 可視化

---

**文件完成日期**: 2025-10-07
**撰寫人員**: Claude Code (Spec Architect)
**技術選型**: MSW + OpenTelemetry
**審核狀態**: 待前端團隊審閱
