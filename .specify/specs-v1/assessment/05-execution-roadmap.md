# 執行路線圖與建議 (Execution Roadmap)

## 📋 文件資訊

| 項目 | 內容 |
|-----|------|
| **版本** | 1.0.0 |
| **建立日期** | 2025-10-07 |
| **執行期間** | 12 週 (2025-10-14 ~ 2026-01-06) |
| **總工作量** | 272 工時 |
| **建議團隊規模** | 2-3 位前端工程師 |
| **風險等級** | 中 (採用漸進式重構降低風險) |

---

## 🎯 執行目標

### 短期目標 (W1-4)
- ✅ 建立 RBAC 權限系統，解決安全性問題
- ✅ 統一 API 回應格式，修正雙重包裝問題
- ✅ 建置 MSW Mock Server，前後端開發解耦
- ✅ 建立 BaseModal，統一 20+ Modal 實作

### 中期目標 (W5-8)
- ✅ 整合 React Query，提升資料管理效率
- ✅ 實作 Drawer 預載入，改善使用者體驗
- ✅ 導入 Virtual Scrolling，解決長列表效能問題
- ✅ 建置 OpenTelemetry，建立前端可觀測性

### 長期目標 (W9-12)
- ✅ 完善 Column Settings 功能
- ✅ 建立 Pact Contract Testing，提升前後端協作品質
- ✅ 整合進階篩選邏輯，統一 Filter State
- ✅ 達成 90% 元件對齊度，完成重構

---

## 📅 詳細時程規劃

### 第 1-2 週：基礎建設 (P0 項目)

#### Week 1 (2025-10-14 ~ 2025-10-20)

**P0.1 - RBAC 權限系統** (16 工時)

**執行步驟**:
```
Day 1-2 (8h): 建立 AuthContext 與 useAuth Hook
  ├─ contexts/AuthContext.tsx
  ├─ hooks/useAuth.ts
  └─ 整合現有 Login/Logout 邏輯

Day 3 (4h): 建立 usePermissions Hook
  ├─ hooks/usePermissions.ts
  └─ 實作 hasPermission() / hasAnyPermission() / hasAllPermissions()

Day 4 (4h): 建立 PermissionGate 元件
  ├─ components/PermissionGate.tsx
  └─ 支援 render / hide / disable 三種模式
```

**測試案例**:
```typescript
// 測試權限檢查
it('should hide button without permission', () => {
  render(
    <PermissionGate permission="incidents:delete">
      <button>Delete</button>
    </PermissionGate>
  );
  expect(screen.queryByText('Delete')).not.toBeInTheDocument();
});

// 測試 disable 模式
it('should disable button without permission', () => {
  render(
    <PermissionGate permission="incidents:edit" mode="disable">
      <button>Edit</button>
    </PermissionGate>
  );
  expect(screen.getByText('Edit')).toBeDisabled();
});
```

**交付成果**:
- [ ] AuthContext 與 useAuth Hook
- [ ] usePermissions Hook (hasPermission 等方法)
- [ ] PermissionGate 元件 (render/hide/disable)
- [ ] 單元測試覆蓋率 > 80%
- [ ] 使用文件 (docs/hooks/usePermissions.md)

---

**P0.2 - API 回應格式修正** (8 工時)

**執行步驟**:
```
Day 5 (4h): 修正 services/api.ts
  ├─ 移除雙重包裝邏輯
  ├─ 統一回傳 ApiSuccessResponse<T>
  └─ 更新錯誤處理

Day 5 (4h): 更新型別定義
  ├─ types/api.ts (統一 ApiSuccessResponse / ApiErrorResponse)
  └─ 更新所有 API 呼叫型別
```

**程式碼變更**:
```typescript
// 修正前 (services/api.ts)
async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await this.instance.request<T>(config);
  return {
    data: response.data,  // ❌ 雙重包裝
    status: response.status,
    headers: response.headers,
  };
}

// 修正後
async request<T>(config: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
  const response = await this.instance.request<ApiSuccessResponse<T>>(config);
  return response.data;  // ✅ 直接回傳 { data, meta }
}

// 型別定義 (types/api.ts)
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
    timestamp?: string;
  };
}
```

**測試案例**:
```typescript
// 測試成功回應
it('should return { data, meta } directly', async () => {
  const response = await api.get('/incidents');
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('meta');
  expect(response.data).toBeInstanceOf(Array);  // ✅ 直接是陣列，非 { data: [...] }
});

// 測試錯誤回應
it('should return ApiErrorResponse on error', async () => {
  try {
    await api.delete('/incidents/999');
  } catch (error) {
    expect(error).toHaveProperty('error.code');
    expect(error).toHaveProperty('error.message');
  }
});
```

**交付成果**:
- [ ] services/api.ts 修正完成
- [ ] types/api.ts 型別統一
- [ ] 所有現有 API 呼叫測試通過
- [ ] Migration Guide (docs/migration/api-format.md)

---

#### Week 2 (2025-10-21 ~ 2025-10-27)

**P0.3 - MSW (Mock Service Worker) 建置** (24 工時)

**執行步驟**:
```
Day 1 (4h): 安裝與初始化
  ├─ npm install msw --save-dev
  ├─ npx msw init public/
  └─ 建立基礎架構

Day 2-3 (12h): 建立 Mock Handlers
  ├─ src/mocks/handlers/incidents.ts
  ├─ src/mocks/handlers/alerts.ts
  ├─ src/mocks/handlers/resources.ts
  ├─ src/mocks/handlers/dashboard.ts
  └─ src/mocks/handlers/auth.ts

Day 4-5 (8h): 建立 Mock Data & 測試
  ├─ src/mocks/data/incidents.ts (100 筆模擬資料)
  ├─ src/mocks/data/alerts.ts
  └─ 整合測試
```

**Mock Handler 範例**:
```typescript
// src/mocks/handlers/incidents.ts
import { http, HttpResponse } from 'msw';
import { mockIncidents } from '../data/incidents';

export const incidentsHandlers = [
  // GET /api/v1/incidents
  http.get('/api/v1/incidents', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const status = url.searchParams.get('status');

    let filtered = mockIncidents;
    if (status) {
      filtered = mockIncidents.filter(inc => inc.status === status);
    }

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data,
      meta: {
        total: filtered.length,
        page,
        pageSize,
      },
    });
  }),

  // POST /api/v1/incidents
  http.post('/api/v1/incidents', async ({ request }) => {
    const body = await request.json();
    const newIncident = {
      id: `inc-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };
    mockIncidents.push(newIncident);
    return HttpResponse.json({ data: newIncident }, { status: 201 });
  }),

  // PATCH /api/v1/incidents/:id
  http.patch('/api/v1/incidents/:id', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    const index = mockIncidents.findIndex(inc => inc.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          error: {
            code: 'INCIDENT_NOT_FOUND',
            message: `Incident ${id} not found`,
            requestId: `req-${Date.now()}`,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      );
    }

    mockIncidents[index] = { ...mockIncidents[index], ...body };
    return HttpResponse.json({ data: mockIncidents[index] });
  }),

  // DELETE /api/v1/incidents/:id
  http.delete('/api/v1/incidents/:id', ({ params }) => {
    const { id } = params;
    const index = mockIncidents.findIndex(inc => inc.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: { code: 'INCIDENT_NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      );
    }

    mockIncidents.splice(index, 1);
    return HttpResponse.json({ data: { success: true } });
  }),
];
```

**啟動邏輯**:
```typescript
// src/index.tsx
async function enableMocking() {
  if (process.env.REACT_APP_MOCK_ENABLED !== 'true') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'warn',
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

**環境變數設定**:
```bash
# .env.development
REACT_APP_MOCK_ENABLED=true

# .env.production
REACT_APP_MOCK_ENABLED=false
```

**交付成果**:
- [ ] MSW 基礎架構建立
- [ ] 核心 API Handlers (Incidents, Alerts, Resources, Dashboard, Auth)
- [ ] Mock 資料 (每個 API 至少 50 筆)
- [ ] 啟動/停止文件 (README.md 更新)
- [ ] 開發者使用指南 (docs/development/mock-server.md)

---

### 第 3-4 週：核心功能 (P1.1 & P1.2)

#### Week 3 (2025-10-28 ~ 2025-11-03)

**P1.1 - BaseModal 統一元件** (32 工時 - 第 1 週)

**執行步驟**:
```
Day 1-2 (12h): 建立 BaseModal
  ├─ components/BaseModal.tsx
  ├─ 實作 Z-index 管理 (level prop)
  ├─ 實作生命週期管理 (延遲卸載)
  └─ 實作 destroyOnClose

Day 3 (8h): 建立 useModalStack Hook
  ├─ hooks/useModalStack.ts
  ├─ 追蹤當前開啟的 Modal 層級
  └─ 自動計算 Z-index

Day 4-5 (12h): 重構範例 Modal
  ├─ IncidentEditModal
  ├─ AlertRuleEditModal
  └─ 整合測試
```

**BaseModal 實作**:
```typescript
// components/BaseModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, ModalProps } from 'antd';

interface BaseModalProps extends Omit<ModalProps, 'open' | 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
  level?: number;           // Z-index 層級 (1, 2, 3...)
  destroyOnClose?: boolean; // 關閉時銷毀內容
  loading?: boolean;
  error?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  level = 1,
  destroyOnClose = false,
  loading = false,
  error,
  children,
  ...modalProps
}) => {
  const zIndex = 1000 + (level - 1) * 50;
  const [shouldRender, setShouldRender] = useState(isOpen);

  // 延遲卸載，確保關閉動畫完成
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // 等待 Modal 關閉動畫 (300ms)
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender && destroyOnClose) {
    return null;
  }

  return (
    <Modal
      {...modalProps}
      open={isOpen}
      onCancel={onClose}
      style={{ zIndex }}
      destroyOnClose={destroyOnClose}
      confirmLoading={loading}
    >
      {error && (
        <div className="modal-error" style={{ marginBottom: 16, color: 'red' }}>
          {error}
        </div>
      )}
      {children}
    </Modal>
  );
};
```

**useModalStack Hook**:
```typescript
// hooks/useModalStack.ts
import { create } from 'zustand';

interface ModalStackStore {
  stack: string[];
  push: (id: string) => void;
  pop: (id: string) => void;
  getLevel: (id: string) => number;
}

export const useModalStack = create<ModalStackStore>((set, get) => ({
  stack: [],

  push: (id: string) => {
    set((state) => ({
      stack: [...state.stack, id],
    }));
  },

  pop: (id: string) => {
    set((state) => ({
      stack: state.stack.filter((modalId) => modalId !== id),
    }));
  },

  getLevel: (id: string) => {
    const index = get().stack.indexOf(id);
    return index === -1 ? 1 : index + 1;
  },
}));

// 使用範例
export const useModal = (id: string) => {
  const { push, pop, getLevel } = useModalStack();

  useEffect(() => {
    if (isOpen) {
      push(id);
    } else {
      pop(id);
    }
  }, [isOpen, id, push, pop]);

  return {
    level: getLevel(id),
  };
};
```

**交付成果**:
- [ ] BaseModal 元件 (Z-index, 生命週期, destroyOnClose)
- [ ] useModalStack Hook (自動層級管理)
- [ ] 重構 3 個範例 Modal (Incident, AlertRule, Dashboard)
- [ ] Migration Guide (docs/migration/base-modal.md)
- [ ] 單元測試 > 80%

---

**P1.2 - React Query 整合** (40 工時 - 第 1 週)

**執行步驟**:
```
Day 1 (4h): 安裝與設定
  ├─ npm install @tanstack/react-query
  ├─ 建立 QueryClient
  └─ 整合至 App.tsx

Day 2-3 (12h): 建立統一 Hooks
  ├─ hooks/useApiQuery.ts
  ├─ hooks/useApiMutation.ts
  └─ hooks/useApiInfiniteQuery.ts

Day 4-5 (16h): 重構範例頁面
  ├─ pages/IncidentList
  ├─ pages/Dashboard
  └─ 測試與驗證
```

**QueryClient 設定**:
```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分鐘
      cacheTime: 10 * 60 * 1000, // 10 分鐘
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**統一 Query Hook**:
```typescript
// hooks/useApiQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ApiSuccessResponse } from '@/types/api';

export const useApiQuery = <T>(
  key: string | string[],
  url: string,
  options?: UseQueryOptions<ApiSuccessResponse<T>>
) => {
  return useQuery<ApiSuccessResponse<T>>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      return await api.get<T>(url);
    },
    ...options,
  });
};

// hooks/useApiMutation.ts
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useApiMutation = <TData, TVariables>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string | ((variables: TVariables) => string),
  options?: UseMutationOptions<TData, Error, TVariables>
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const finalUrl = typeof url === 'function' ? url(variables) : url;
      const response = await api[method]<TData>(finalUrl, variables);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // 自動 invalidate 相關 queries
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
```

**使用範例**:
```typescript
// pages/IncidentList.tsx
const IncidentList = () => {
  const [filters, setFilters] = useState({ status: 'open', page: 1 });

  // Query
  const { data, isLoading, error } = useApiQuery<Incident[]>(
    ['incidents', filters],
    `/incidents?${new URLSearchParams(filters as any)}`
  );

  // Mutation
  const deleteMutation = useApiMutation<void, string>(
    'delete',
    (id) => `/incidents/${id}`,
    {
      onSuccess: () => {
        message.success('刪除成功');
      },
    }
  );

  if (isLoading) return <Spin />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <Table
      dataSource={data?.data}
      pagination={{
        total: data?.meta?.total,
        current: filters.page,
        onChange: (page) => setFilters({ ...filters, page }),
      }}
      columns={[
        // ...
        {
          key: 'actions',
          render: (_, record) => (
            <Button
              danger
              onClick={() => deleteMutation.mutate(record.id)}
              loading={deleteMutation.isLoading}
            >
              刪除
            </Button>
          ),
        },
      ]}
    />
  );
};
```

**交付成果**:
- [ ] QueryClient 設定完成
- [ ] useApiQuery / useApiMutation Hooks
- [ ] 重構 2-3 個範例頁面
- [ ] Migration Guide (docs/migration/react-query.md)

---

#### Week 4 (2025-11-04 ~ 2025-11-10)

繼續完成 **P1.1** 與 **P1.2** 剩餘工作:

**P1.1 剩餘工作** (繼續)
```
Day 1-2: 重構更多 Modal
  ├─ RoleEditModal
  ├─ ResourceEditModal
  └─ DashboardEditModal

Day 3: 建立 Migration Checklist
  └─ 提供團隊 Step-by-step 遷移指南
```

**P1.2 剩餘工作** (繼續)
```
Day 4-5: 重構更多頁面
  ├─ AlertList
  ├─ ResourceInventory
  └─ 完整測試所有頁面
```

**交付成果**:
- [ ] 至少 5 個 Modal 重構完成
- [ ] 至少 3 個頁面整合 React Query
- [ ] 所有測試通過
- [ ] 開發團隊培訓完成

---

### 第 5-6 週：體驗提升 (P1.3 & P1.4)

#### Week 5 (2025-11-11 ~ 2025-11-17)

**P1.3 - Drawer 預載入與快取** (24 工時)

**執行步驟**:
```
Day 1-2 (12h): 建立預載入 Hook
  ├─ hooks/useDrawerPreload.ts
  ├─ 實作 Prefetch 邏輯
  └─ ETag 快取支援

Day 3 (8h): 整合至 Drawer 元件
  ├─ components/Drawer.tsx
  └─ 自動觸發預載入

Day 4 (4h): 整合至 Table
  ├─ components/TableContainer.tsx
  └─ onMouseEnter 觸發 prefetch
```

**實作細節**:
```typescript
// hooks/useDrawerPreload.ts
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export const useDrawerPreload = (type: string, id?: string) => {
  const queryClient = useQueryClient();

  const prefetch = (targetId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['drawer', type, targetId],
      queryFn: async () => {
        return await api.get(`/drawer/preload/${type}/${targetId}`);
      },
      staleTime: 5 * 60 * 1000, // 5 分鐘
    });
  };

  const { data, isLoading } = useApiQuery(
    ['drawer', type, id],
    `/drawer/preload/${type}/${id}`,
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );

  return { data, isLoading, prefetch };
};

// components/Drawer.tsx
interface DrawerProps {
  type: 'incident' | 'alert' | 'resource';
  id?: string;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ type, id, onClose }) => {
  const { data, isLoading } = useDrawerPreload(type, id);

  return (
    <AntDrawer open={!!id} onClose={onClose}>
      {isLoading ? <Spin /> : <DetailView data={data?.data} />}
    </AntDrawer>
  );
};

// components/TableContainer.tsx
<Table
  dataSource={incidents}
  onRow={(record) => ({
    onMouseEnter: () => {
      // Prefetch drawer 資料
      prefetch(record.id);
    },
    onClick: () => {
      // 開啟 drawer (資料已預載入)
      openDrawer(record.id);
    },
  })}
/>
```

**交付成果**:
- [ ] useDrawerPreload Hook
- [ ] Drawer 元件整合預載入
- [ ] Table onMouseEnter 觸發 prefetch
- [ ] 效能測試 (Drawer 開啟時間 < 100ms)

---

**P1.4 - Virtual Scrolling (虛擬滾動)** (32 工時)

**執行步驟**:
```
Day 1 (4h): 安裝與研究
  ├─ npm install react-window
  └─ 研究整合方式

Day 2-3 (16h): 建立 VirtualTable
  ├─ components/VirtualTable.tsx
  ├─ 支援固定高度行
  └─ 支援動態高度行

Day 4-5 (12h): 整合至現有頁面
  ├─ IncidentList (1000+ 筆)
  ├─ ResourceInventory (500+ 筆)
  └─ 效能測試
```

**VirtualTable 實作**:
```typescript
// components/VirtualTable.tsx
import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualTableProps<T> {
  data: T[];
  columns: ColumnType<T>[];
  rowHeight?: number;
  onRowClick?: (record: T) => void;
}

export const VirtualTable = <T extends { id: string }>({
  data,
  columns,
  rowHeight = 54,
  onRowClick,
}: VirtualTableProps<T>) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const record = data[index];

    return (
      <div
        style={{
          ...style,
          display: 'flex',
          borderBottom: '1px solid #f0f0f0',
          cursor: 'pointer',
        }}
        onClick={() => onRowClick?.(record)}
      >
        {columns.map((col) => (
          <div
            key={col.key as string}
            style={{
              flex: col.width ? `0 0 ${col.width}px` : 1,
              padding: '12px 16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {col.render ? col.render(record[col.dataIndex], record, index) : record[col.dataIndex]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0', fontWeight: 600 }}>
        {columns.map((col) => (
          <div
            key={col.key as string}
            style={{
              flex: col.width ? `0 0 ${col.width}px` : 1,
              padding: '12px 16px',
            }}
          >
            {col.title}
          </div>
        ))}
      </div>

      {/* Virtual List */}
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height - 48} // 扣除 Header 高度
            itemCount={data.length}
            itemSize={rowHeight}
            width={width}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};
```

**整合至 TableContainer**:
```typescript
// components/TableContainer.tsx
export const TableContainer = ({ data, columns, ...props }) => {
  const shouldUseVirtualScrolling = data.length > 100;

  if (shouldUseVirtualScrolling) {
    return <VirtualTable data={data} columns={columns} {...props} />;
  }

  return <Table dataSource={data} columns={columns} {...props} />;
};
```

**交付成果**:
- [ ] VirtualTable 元件 (固定高度)
- [ ] 整合至 TableContainer (自動判斷)
- [ ] 重構 2-3 個長列表頁面
- [ ] 效能測試 (1000 項渲染 < 100ms)

---

#### Week 6 (2025-11-18 ~ 2025-11-24)

繼續完成 **P1.4** 與整合測試:

**P1.4 進階功能**
```
Day 1-2: 支援排序與篩選
  └─ 整合 Virtual Scrolling 與 Filter/Sort

Day 3-4: 效能調校
  ├─ 測試 1000/5000/10000 項效能
  └─ Memoization 優化

Day 5: 文件與培訓
  └─ 使用指南 (何時使用 Virtual Scrolling)
```

**交付成果**:
- [ ] 支援排序與篩選
- [ ] 效能報告 (各種數據量測試)
- [ ] 使用文件 (docs/components/virtual-table.md)

---

### 第 7-8 週：可觀測性 (P2.1)

#### Week 7-8 (2025-11-25 ~ 2025-12-08)

**P2.1 - OpenTelemetry 前端可觀測性** (24 工時)

**執行步驟**:
```
Day 1 (4h): 安裝套件
  ├─ npm install @opentelemetry/sdk-trace-web
  ├─ npm install @opentelemetry/instrumentation-fetch
  ├─ npm install @opentelemetry/exporter-trace-otlp-http
  └─ npm install web-vitals

Day 2-3 (12h): 建立 Telemetry 系統
  ├─ utils/telemetry.ts (初始化 Tracer)
  ├─ utils/webVitals.ts (Web Vitals 追蹤)
  └─ 整合至 App.tsx

Day 4 (4h): 自訂 Span 追蹤
  ├─ 元件渲染時間追蹤
  └─ 使用者操作追蹤

Day 5 (4h): Grafana Dashboard
  └─ 建立前端監控 Dashboard
```

**Telemetry 初始化**:
```typescript
// utils/telemetry.ts
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

export const initTelemetry = () => {
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'sre-platform-frontend',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
    }),
  });

  const exporter = new OTLPTraceExporter({
    url: process.env.REACT_APP_OTEL_EXPORTER_URL || 'http://localhost:4318/v1/traces',
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  // 自動追蹤 Fetch/XHR
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/.*/],
        clearTimingResources: true,
      }),
    ],
  });

  return provider.getTracer('sre-platform-frontend');
};

export const tracer = initTelemetry();
```

**Web Vitals 追蹤**:
```typescript
// utils/webVitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';
import { tracer } from './telemetry';

export const reportWebVitals = () => {
  onLCP((metric) => {
    const span = tracer.startSpan('web-vitals.lcp', {
      startTime: metric.startTime,
    });
    span.setAttribute('metric.value', metric.value);
    span.setAttribute('metric.rating', metric.rating);
    span.end(metric.startTime + metric.value);
  });

  onFID((metric) => {
    const span = tracer.startSpan('web-vitals.fid', {
      startTime: metric.startTime,
    });
    span.setAttribute('metric.value', metric.value);
    span.setAttribute('metric.rating', metric.rating);
    span.end(metric.startTime + metric.value);
  });

  onCLS((metric) => {
    const span = tracer.startSpan('web-vitals.cls');
    span.setAttribute('metric.value', metric.value);
    span.setAttribute('metric.rating', metric.rating);
    span.end();
  });

  onFCP((metric) => {
    const span = tracer.startSpan('web-vitals.fcp', {
      startTime: metric.startTime,
    });
    span.setAttribute('metric.value', metric.value);
    span.end(metric.startTime + metric.value);
  });

  onTTFB((metric) => {
    const span = tracer.startSpan('web-vitals.ttfb', {
      startTime: metric.startTime,
    });
    span.setAttribute('metric.value', metric.value);
    span.end(metric.startTime + metric.value);
  });
};

// App.tsx
import { reportWebVitals } from './utils/webVitals';

useEffect(() => {
  reportWebVitals();
}, []);
```

**自訂 Span 追蹤**:
```typescript
// hooks/useTraceRender.ts
import { tracer } from '@/utils/telemetry';
import { useEffect, useRef } from 'react';

export const useTraceRender = (componentName: string) => {
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - startTimeRef.current;
    const span = tracer.startSpan(`component.render.${componentName}`, {
      startTime: startTimeRef.current,
    });
    span.setAttribute('render.duration', renderTime);
    span.end(startTimeRef.current + renderTime);
  }, [componentName]);
};

// 使用範例
const IncidentList = () => {
  useTraceRender('IncidentList');
  // ...
};
```

**Grafana Dashboard 範例**:
```yaml
# grafana-dashboard.json (簡化版)
{
  "panels": [
    {
      "title": "Frontend Performance - LCP",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(web_vitals_lcp_bucket[5m]))"
        }
      ]
    },
    {
      "title": "API Request Duration (P95)",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(http_client_duration_ms_bucket[5m]))"
        }
      ]
    },
    {
      "title": "Component Render Time",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(component_render_duration_ms_bucket[5m]))"
        }
      ]
    }
  ]
}
```

**交付成果**:
- [ ] OpenTelemetry 初始化完成
- [ ] Web Vitals 自動追蹤 (LCP, FID, CLS, FCP, TTFB)
- [ ] 自訂 Span (元件渲染、使用者操作)
- [ ] Grafana Dashboard (前端效能監控)
- [ ] 使用文件 (docs/observability/frontend-telemetry.md)

---

### 第 9 週：體驗完善 (P2.2)

#### Week 9 (2025-12-09 ~ 2025-12-15)

**P2.2 - Column Settings 完整實作** (16 工時)

**執行步驟**:
```
Day 1-2 (8h): 新增儲存範圍選擇
  ├─ 加入 Radio Group (user/team)
  └─ 更新 API 呼叫

Day 3 (4h): 未儲存變更警告
  ├─ beforeunload 事件
  └─ Modal 關閉前確認

Day 4 (4h): 儲存失敗 Rollback
  └─ 錯誤處理與狀態回滾
```

**實作細節**:
```typescript
// components/ColumnSettingsModal.tsx
interface ColumnSettingsModalProps {
  saveScope?: 'user' | 'team';
  onSave: (settings: ColumnSettings, scope: 'user' | 'team') => Promise<void>;
}

const ColumnSettingsModal = ({ saveScope = 'user', onSave }: ColumnSettingsModalProps) => {
  const [currentSettings, setCurrentSettings] = useState(initialSettings);
  const [originalSettings] = useState(initialSettings); // 保留原始設定
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'user' | 'team'>(saveScope);

  // 未儲存變更警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未儲存的變更，確定要離開嗎？';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    try {
      await onSave(currentSettings, selectedScope);
      setHasUnsavedChanges(false);
      message.success('儲存成功');
      onClose();
    } catch (error) {
      // 失敗時 Rollback
      setCurrentSettings(originalSettings);
      message.error('儲存失敗，已恢復原設定');
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '確定要關閉嗎？',
        content: '您有未儲存的變更',
        onOk: () => {
          setCurrentSettings(originalSettings);
          onClose();
        },
      });
    } else {
      onClose();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Column Settings">
      <Radio.Group
        value={selectedScope}
        onChange={(e) => setSelectedScope(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        <Radio value="user">僅套用於我</Radio>
        <Radio value="team">套用至團隊 (需管理員權限)</Radio>
      </Radio.Group>

      {/* Column list with drag-and-drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* ... */}
      </DragDropContext>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button onClick={handleClose} style={{ marginRight: 8 }}>
          取消
        </Button>
        <Button type="primary" onClick={handleSave} disabled={!hasUnsavedChanges}>
          儲存
        </Button>
      </div>
    </BaseModal>
  );
};
```

**交付成果**:
- [ ] 儲存範圍選擇 (user/team)
- [ ] 未儲存變更警告 (beforeunload + Modal 關閉確認)
- [ ] 儲存失敗 Rollback
- [ ] 單元測試 > 80%

---

### 第 10-11 週：契約測試 (P2.3)

#### Week 10-11 (2025-12-16 ~ 2025-12-29)

**P2.3 - Pact Contract Testing** (32 工時)

**執行步驟**:
```
Week 10:
  Day 1 (4h): 安裝與設定
    ├─ npm install --save-dev @pact-foundation/pact
    └─ 建立 Pact 測試架構

  Day 2-3 (12h): 建立核心 API Pact
    ├─ tests/pact/incidents.pact.test.ts
    ├─ tests/pact/alerts.pact.test.ts
    └─ tests/pact/auth.pact.test.ts

  Day 4-5 (8h): CI/CD 整合
    ├─ 生成 Pact 文件
    └─ 發佈至 Pact Broker

Week 11:
  Day 1-3 (16h): 更多 API Pact
    ├─ Resources API
    ├─ Dashboard API
    └─ Config API

  Day 4-5 (8h): 後端驗證與文件
    └─ 協助後端設定 Provider 驗證
```

**Pact 測試範例**:
```typescript
// tests/pact/incidents.pact.test.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { api } from '@/services/api';

const { eachLike, like, string, integer } = MatchersV3;

const provider = new PactV3({
  consumer: 'sre-platform-frontend',
  provider: 'sre-platform-backend',
  dir: path.resolve(process.cwd(), 'pacts'),
});

describe('Incidents API Pact', () => {
  describe('GET /api/v1/incidents', () => {
    it('should return incident list with pagination', async () => {
      await provider
        .given('有 10 筆 Incidents')
        .uponReceiving('取得 Incident 列表')
        .withRequest({
          method: 'GET',
          path: '/api/v1/incidents',
          query: { page: '1', pageSize: '20' },
        })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            data: eachLike({
              id: like('inc-001'),
              title: string('API Error'),
              status: like('open'),
              severity: like('high'),
              createdAt: string('2025-10-07T10:00:00Z'),
            }),
            meta: {
              total: integer(10),
              page: integer(1),
              pageSize: integer(20),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const testApi = new ApiClient(mockServer.url);
        const response = await testApi.get('/incidents?page=1&pageSize=20');

        expect(response.data).toHaveLength(10);
        expect(response.meta.total).toBe(10);
      });
    });
  });

  describe('POST /api/v1/incidents', () => {
    it('should create new incident', async () => {
      await provider
        .given('使用者有 incidents:create 權限')
        .uponReceiving('建立新 Incident')
        .withRequest({
          method: 'POST',
          path: '/api/v1/incidents',
          headers: { 'Content-Type': 'application/json' },
          body: {
            title: like('New Incident'),
            description: like('Description'),
            severity: like('high'),
          },
        })
        .willRespondWith({
          status: 201,
          headers: { 'Content-Type': 'application/json' },
          body: {
            data: {
              id: like('inc-002'),
              title: like('New Incident'),
              status: like('open'),
              createdAt: string('2025-10-07T10:00:00Z'),
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const testApi = new ApiClient(mockServer.url);
        const response = await testApi.post('/incidents', {
          title: 'New Incident',
          description: 'Description',
          severity: 'high',
        });

        expect(response.data.id).toBeTruthy();
        expect(response.data.status).toBe('open');
      });
    });
  });
});
```

**CI/CD 整合**:
```yaml
# .github/workflows/pact.yml
name: Pact Tests

on: [push, pull_request]

jobs:
  pact-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Pact tests
        run: npm run test:pact

      - name: Publish Pact to Broker
        if: github.ref == 'refs/heads/main'
        run: |
          npm run pact:publish
        env:
          PACT_BROKER_BASE_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
```

**package.json scripts**:
```json
{
  "scripts": {
    "test:pact": "jest --testMatch='**/*.pact.test.ts'",
    "pact:publish": "pact-broker publish ./pacts --consumer-app-version=$GITHUB_SHA --broker-base-url=$PACT_BROKER_BASE_URL --broker-token=$PACT_BROKER_TOKEN"
  }
}
```

**交付成果**:
- [ ] 核心 API Pact 測試 (Incidents, Alerts, Auth, Resources, Dashboard)
- [ ] CI/CD 自動執行 Pact 測試
- [ ] Pact Broker 整合
- [ ] 後端 Provider 驗證設定
- [ ] 使用文件 (docs/testing/pact.md)

---

### 第 12 週：收尾與優化 (P2.4)

#### Week 12 (2025-12-30 ~ 2026-01-06)

**P2.4 - 進階篩選整合** (24 工時)

**執行步驟**:
```
Day 1-2 (12h): 建立 useUnifiedFilter Hook
  ├─ hooks/useUnifiedFilter.ts
  ├─ 合併 QuickFilter + AdvancedFilter
  └─ URL 同步

Day 3 (8h): 重構 QuickFilterBar
  └─ 整合 useUnifiedFilter

Day 4 (4h): 重構 UnifiedSearchModal
  └─ 整合 useUnifiedFilter
```

**實作細節**:
```typescript
// hooks/useUnifiedFilter.ts
import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UnifiedFilterState {
  quickFilters: Record<string, any>;
  advancedFilters: Record<string, any>;
  searchText: string;
}

export const useUnifiedFilter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 從 URL 初始化
  const initialFilters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const filters: UnifiedFilterState = {
      quickFilters: {},
      advancedFilters: {},
      searchText: params.get('q') || '',
    };

    params.forEach((value, key) => {
      if (key !== 'q') {
        if (key.startsWith('adv_')) {
          filters.advancedFilters[key.replace('adv_', '')] = value;
        } else {
          filters.quickFilters[key] = value;
        }
      }
    });

    return filters;
  }, [location.search]);

  const [filters, setFilters] = useState<UnifiedFilterState>(initialFilters);

  // 合併所有 filter
  const mergedFilters = useMemo(() => {
    const merged: Record<string, any> = {
      ...filters.quickFilters,
      ...filters.advancedFilters,
    };

    if (filters.searchText) {
      merged.q = filters.searchText;
    }

    return merged;
  }, [filters]);

  // 同步至 URL
  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(filters.quickFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });

    Object.entries(filters.advancedFilters).forEach(([key, value]) => {
      if (value) params.set(`adv_${key}`, String(value));
    });

    if (filters.searchText) {
      params.set('q', filters.searchText);
    }

    navigate({ search: params.toString() }, { replace: true });
  }, [filters, navigate]);

  // 更新 filter
  const updateQuickFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters((prev) => ({
      ...prev,
      quickFilters: { ...prev.quickFilters, ...newFilters },
    }));
  }, []);

  const updateAdvancedFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters((prev) => ({
      ...prev,
      advancedFilters: { ...prev.advancedFilters, ...newFilters },
    }));
  }, []);

  const updateSearchText = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, searchText: text }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      quickFilters: {},
      advancedFilters: {},
      searchText: '',
    });
  }, []);

  return {
    filters,
    mergedFilters,
    updateQuickFilters,
    updateAdvancedFilters,
    updateSearchText,
    resetFilters,
    syncToUrl,
  };
};
```

**使用範例**:
```typescript
// pages/IncidentList.tsx
const IncidentList = () => {
  const {
    mergedFilters,
    updateQuickFilters,
    updateAdvancedFilters,
    updateSearchText,
    resetFilters,
    syncToUrl,
  } = useUnifiedFilter();

  const { data } = useApiQuery(
    ['incidents', mergedFilters],
    `/incidents?${new URLSearchParams(mergedFilters as any)}`
  );

  useEffect(() => {
    syncToUrl(); // 每次 filter 變更時同步至 URL
  }, [mergedFilters, syncToUrl]);

  return (
    <>
      <QuickFilterBar
        filters={mergedFilters}
        onChange={updateQuickFilters}
      />

      <UnifiedSearchModal
        filters={mergedFilters}
        onChange={updateAdvancedFilters}
      />

      <Input.Search
        value={mergedFilters.q}
        onChange={(e) => updateSearchText(e.target.value)}
        placeholder="搜尋..."
      />

      <Button onClick={resetFilters}>清除所有篩選</Button>

      <Table dataSource={data?.data} />
    </>
  );
};
```

**交付成果**:
- [ ] useUnifiedFilter Hook (合併 Quick + Advanced Filter)
- [ ] URL 同步機制
- [ ] QuickFilterBar 與 UnifiedSearchModal 重構
- [ ] 使用文件 (docs/hooks/useUnifiedFilter.md)

---

## 📊 資源分配建議

### 團隊配置

**建議團隊規模**: 2-3 位前端工程師

**角色分工**:
```
工程師 A (資深):
  - P0 項目主導 (RBAC, API 格式, MSW)
  - P1.1 BaseModal 設計
  - P2.1 OpenTelemetry 建置
  - Code Review 與技術決策

工程師 B (中階):
  - P1.2 React Query 整合
  - P1.3 Drawer 預載入
  - P2.2 Column Settings
  - P2.4 進階篩選整合

工程師 C (中階 - 選配):
  - P1.4 Virtual Scrolling
  - P2.3 Pact Testing
  - 文件撰寫
  - 測試案例補充
```

### 時間分配

| 週次 | 工時 (1 人) | 工時 (2 人) | 工時 (3 人) | 重點項目 |
|-----|------------|------------|------------|----------|
| W1-2 | 48h | 24h | 16h | P0 基礎建設 |
| W3-4 | 72h | 36h | 24h | P1.1/1.2 核心功能 |
| W5-6 | 56h | 28h | 18h | P1.3/1.4 體驗提升 |
| W7-8 | 24h | 12h | 8h | P2.1 可觀測性 |
| W9 | 16h | 8h | 5h | P2.2 Column Settings |
| W10-11 | 32h | 16h | 10h | P2.3 Pact Testing |
| W12 | 24h | 12h | 8h | P2.4 進階篩選 |

**總工時**: 272h (1 人 = 12 週 @ 23h/週, 2 人 = 6 週 @ 23h/週, 3 人 = 4.5 週 @ 20h/週)

---

## ⚠️ 風險管理

### 技術風險

**風險 1: API 格式修正影響現有功能**
- **發生機率**: 高
- **影響程度**: 高
- **緩解措施**:
  1. 建立完整測試案例 (覆蓋所有 API 呼叫)
  2. 先使用 MSW Mock 測試，確認無誤後再切真實 API
  3. Feature Flag 控制切換，出問題可快速 Rollback

**風險 2: React Query 整合複雜度高**
- **發生機率**: 中
- **影響程度**: 中
- **緩解措施**:
  1. 先遷移簡單頁面 (Dashboard、單純的列表頁)
  2. 提供詳細 Migration Guide
  3. 保留舊 API Client 作為 Fallback (Feature Flag)

**風險 3: Pact 需要後端配合**
- **發生機率**: 中
- **影響程度**: 低
- **緩解措施**:
  1. 前端先定義契約，提供 Pact 文件
  2. 逐步導入 (先核心 API: Incidents, Alerts)
  3. 若後端無法配合，前端仍可單獨執行 Pact 測試

### 時程風險

**風險 4: 工時估算不準確**
- **發生機率**: 中
- **影響程度**: 中
- **緩解措施**:
  1. 每週檢視進度，及時調整
  2. P2 項目可延後 (非核心功能)
  3. 預留 Buffer (實際 12 週可延至 14 週)

**風險 5: 人力不足或異動**
- **發生機率**: 低
- **影響程度**: 高
- **緩解措施**:
  1. 文件完善 (每個項目都有 Migration Guide)
  2. Code Review 確保知識共享
  3. P0/P1 優先，P2 可彈性調整

---

## 📈 成功指標與檢查點

### Week 2 檢查點 (P0 完成)
- [ ] RBAC 系統上線，所有關鍵功能有權限控制
- [ ] API 格式統一，所有 API 測試通過
- [ ] MSW 可正常運作，開發者可獨立開發
- [ ] 技術債清除: 30%

### Week 4 檢查點 (P1.1/1.2 完成)
- [ ] 至少 5 個 Modal 使用 BaseModal
- [ ] 至少 3 個頁面整合 React Query
- [ ] 開發效率提升: 25% (前後端解耦)
- [ ] 技術債清除: 50%

### Week 6 檢查點 (P1.3/1.4 完成)
- [ ] Drawer 開啟時間 < 100ms (預載入生效)
- [ ] 長列表 (>1000 項) 渲染 < 100ms
- [ ] 效能指標達標: LCP < 2.5s
- [ ] 技術債清除: 70%

### Week 8 檢查點 (P2.1 完成)
- [ ] OpenTelemetry 追蹤所有 API 與 Web Vitals
- [ ] Grafana Dashboard 可視化前端效能
- [ ] 可觀測性建立完成

### Week 12 檢查點 (全部完成)
- [ ] 所有 P0/P1/P2 項目完成
- [ ] 元件對齊度: 90%
- [ ] 技術債清除: 85%
- [ ] 團隊培訓完成，可自行維護新架構

---

## 🎯 下一步行動

### 立即開始 (本週)
1. **召開 Kick-off Meeting**
   - 確認團隊成員與分工
   - 確認 12 週時程可行性
   - 討論技術細節與疑問

2. **建立開發環境**
   - 建立 Feature Branch (`refactor/phase-1`)
   - 設定 Feature Flag 機制 (使用 LaunchDarkly 或自建)
   - 準備測試資料

3. **開始 P0.1 (RBAC)**
   - 建立 `contexts/AuthContext.tsx`
   - 建立 `hooks/useAuth.ts`
   - 建立 `hooks/usePermissions.ts`
   - 建立 `components/PermissionGate.tsx`

### 第一週目標
- [ ] P0.1 RBAC 系統完成 (16h)
- [ ] P0.2 API 格式修正完成 (8h)
- [ ] 所有測試通過
- [ ] Code Review 完成

---

## 📚 相關文件

- [重構優先級矩陣](./04-refactoring-priority-matrix.md) - 詳細優先級分析
- [Components 對齊度分析](./01-components-gap-analysis.md) - 元件現況評估
- [API 呼叫格式分析](./02-api-gap-analysis.md) - API 格式問題分析
- [RBAC 權限使用分析](./03-rbac-gap-analysis.md) - 權限系統缺口分析
- [重構計畫](../specs/REFACTORING-PLAN.md) - Strangler Fig 漸進式重構策略
- [快速開始指南](../specs/QUICKSTART.md) - 30 分鐘快速上手

---

**建立日期**: 2025-10-07
**下次審查**: Week 2 (P0 完成後)
**負責人**: [填入負責人]
**狀態**: 📝 待開始
