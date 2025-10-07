# 重構優先級矩陣 (Refactoring Priority Matrix)

## 📋 摘要資訊

| 項目 | 內容 |
|-----|------|
| **文件版本** | 1.0.0 |
| **建立日期** | 2025-10-07 |
| **評估範圍** | 72 個現有元件 + 基礎架構 |
| **整體對齊度** | 43% (Components: 60%, API: 43%, RBAC: 25%) |
| **預估工作量** | 12 週 (240 工時) |
| **風險等級** | 中 (採用漸進式重構) |

---

## 🎯 優先級定義

| 等級 | 標準 | 預期影響 | 時程 |
|-----|------|---------|------|
| **P0** | 阻塞性、安全性問題，必須立即處理 | 系統穩定性、安全性 | 1-2 週 |
| **P1** | 核心功能、高頻使用，影響使用者體驗 | 使用者滿意度、開發效率 | 3-6 週 |
| **P2** | 最佳化、體驗提升，可延後處理 | 長期維護性、效能 | 7-12 週 |

---

## 🔥 P0 項目 (第 1-2 週：基礎架構)

### P0.1 - RBAC 權限系統建立
**問題**: 無 `useAuth` / `usePermissions` Hook，前端無權限檢查
**影響**: 安全性風險，所有使用者看到相同 UI
**對齊度**: 25% 🔴

**解決方案**:
```typescript
// 1. 建立 AuthContext
interface AuthContextValue {
  user: User | null;
  permissions: string[];
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// 2. 建立 usePermissions Hook
export const usePermissions = () => {
  const { permissions } = useAuth();

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return { hasPermission };
};

// 3. 建立 PermissionGate 元件
<PermissionGate permission="incidents:delete">
  <Button danger>刪除</Button>
</PermissionGate>
```

**檔案變更**:
- `contexts/AuthContext.tsx` (新建)
- `hooks/useAuth.ts` (新建)
- `hooks/usePermissions.ts` (新建)
- `components/PermissionGate.tsx` (新建)

**工作量**: 16 工時
**相依性**: 無
**風險**: 低 (獨立功能)

---

### P0.2 - API 回應格式修正
**問題**: `services/api.ts` 雙重包裝 `{ data: { data, meta } }`
**影響**: 所有 API 呼叫格式錯誤，需額外解構
**對齊度**: 43% 🟡

**解決方案**:
```typescript
// 修正前
async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await this.instance.request<T>(config);
  return {
    data: response.data,  // ❌ 如果 response.data 已是 { data, meta }，變成雙重包裝
    status: response.status,
    headers: response.headers,
  };
}

// 修正後
async request<T>(config: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
  const response = await this.instance.request<ApiSuccessResponse<T>>(config);
  return response.data;  // ✅ 直接回傳 { data, meta }
}
```

**檔案變更**:
- `services/api.ts` (修改 `request` / `get` / `post` / `put` / `delete` 方法)
- `types/api.ts` (統一 `ApiSuccessResponse<T>` / `ApiErrorResponse` 型別)

**工作量**: 8 工時
**相依性**: 無
**風險**: 中 (需測試所有 API 呼叫)

---

### P0.3 - MSW (Mock Service Worker) 基礎建置
**問題**: 無 Mock 機制，前後端開發互相阻塞
**影響**: 開發效率低，無法獨立測試
**對齊度**: 0% 🔴

**解決方案**:
```typescript
// 1. 安裝 MSW
npm install msw --save-dev

// 2. 初始化 Service Worker
npx msw init public/

// 3. 建立 Handlers
// src/mocks/handlers/incidents.ts
export const incidentsHandlers = [
  http.get('/api/v1/incidents', () => {
    return HttpResponse.json({
      data: mockIncidents,
      meta: { total: 100, page: 1, pageSize: 20 }
    });
  })
];

// 4. 啟動 MSW
// src/index.tsx
if (process.env.REACT_APP_MOCK_ENABLED === 'true') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start();
  });
}
```

**檔案變更**:
- `src/mocks/browser.ts` (新建)
- `src/mocks/handlers/index.ts` (新建)
- `src/mocks/data/` (新建 mock 資料)
- `.env.development` (新增 `REACT_APP_MOCK_ENABLED=true`)

**工作量**: 24 工時 (含 mock data 準備)
**相依性**: P0.2 (需先統一 API 格式)
**風險**: 低

---

## 🚀 P1 項目 (第 3-6 週：核心功能)

### P1.1 - 統一 Modal 元件 (BaseModal)
**問題**: 20+ Modal 元件重複實作，無統一 Z-index / 生命週期管理
**影響**: 維護困難、Stack 管理混亂
**對齊度**: 62% 🟡

**解決方案**:
```typescript
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  level?: number;           // Z-index 層級 (1, 2, 3...)
  destroyOnClose?: boolean; // 關閉時銷毀內容
  footer?: ReactNode;
  loading?: boolean;
  error?: string;
  children: ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  level = 1,
  destroyOnClose = false,
  isOpen,
  onClose,
  children,
  ...props
}) => {
  const zIndex = 1000 + (level - 1) * 50;
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <Modal
      {...props}
      open={isOpen}
      onCancel={onClose}
      style={{ zIndex }}
      destroyOnClose={destroyOnClose}
    >
      {children}
    </Modal>
  );
};
```

**遷移計畫**:
1. 建立 `BaseModal` 元件
2. 重構高頻 Modal (IncidentEditModal, AlertRuleEditModal)
3. 提供 Migration Guide 給團隊

**檔案變更**:
- `components/BaseModal.tsx` (新建)
- `components/modals/IncidentEditModal.tsx` (重構)
- `components/modals/AlertRuleEditModal.tsx` (重構)
- `docs/migration/base-modal.md` (新建)

**工作量**: 32 工時
**相依性**: 無
**風險**: 低

---

### P1.2 - React Query 整合
**問題**: 無統一資料快取、狀態管理，重複 API 呼叫
**影響**: 效能差、使用者體驗不佳
**對齊度**: 35% 🟡

**解決方案**:
```typescript
// 1. 建立統一 Hook
export const useApiQuery = <T>(
  key: string | string[],
  url: string,
  options?: UseQueryOptions<T>
) => {
  return useQuery<T>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await api.get<T>(url);
      return response.data;
    },
    ...options,
  });
};

// 2. 使用範例
const IncidentList = () => {
  const { data, isLoading, error } = useApiQuery<Incident[]>(
    ['incidents', { status: 'open' }],
    '/incidents?status=open'
  );

  if (isLoading) return <Spin />;
  if (error) return <ErrorDisplay error={error} />;

  return <Table dataSource={data.data} />;
};
```

**檔案變更**:
- `hooks/useApiQuery.ts` (新建)
- `hooks/useApiMutation.ts` (新建)
- `App.tsx` (加入 `QueryClientProvider`)
- 重構 3-5 個高頻頁面

**工作量**: 40 工時
**相依性**: P0.2 (需先修正 API 格式)
**風險**: 中 (需處理既有 API 呼叫)

---

### P1.3 - Drawer 預載入與快取
**問題**: 無 Drawer 預載入機制，開啟時卡頓
**影響**: 使用者體驗差，感覺系統慢
**對齊度**: 40% 🟡

**解決方案**:
```typescript
// 1. Drawer 預載入 API
GET /api/v1/drawer/preload/:type/:id
Headers: If-None-Match: "etag-123"
Response:
{
  "data": { /* 詳細資料 */ },
  "meta": {
    "cacheTTL": 300,
    "lastModified": "2025-10-07T10:00:00Z"
  }
}
Headers:
  ETag: "etag-123"
  Cache-Control: max-age=300

// 2. 前端實作
const useDrawerPreload = (type: string, id: string) => {
  return useQuery({
    queryKey: ['drawer', type, id],
    queryFn: () => api.get(`/drawer/preload/${type}/${id}`),
    staleTime: 5 * 60 * 1000, // 5 分鐘
    enabled: !!id,
  });
};

// 3. Table onRow 觸發預載入
<Table
  onRow={(record) => ({
    onMouseEnter: () => {
      queryClient.prefetchQuery(['drawer', 'incident', record.id]);
    }
  })}
/>
```

**檔案變更**:
- `hooks/useDrawerPreload.ts` (新建)
- `components/Drawer.tsx` (整合預載入)
- 重構 Table 元件

**工作量**: 24 工時
**相依性**: P1.2 (需 React Query)
**風險**: 低

---

### P1.4 - Table 虛擬滾動 (Virtual Scrolling)
**問題**: 長列表效能差 (>100 項)
**影響**: 頁面卡頓、記憶體佔用高
**對齊度**: 45% 🟡

**解決方案**:
```typescript
import { FixedSizeList } from 'react-window';

interface VirtualTableProps {
  data: any[];
  rowHeight?: number;
  height?: number;
}

export const VirtualTable: React.FC<VirtualTableProps> = ({
  data,
  rowHeight = 54,
  height = 600,
}) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TableRow data={data[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={height}
      itemCount={data.length}
      itemSize={rowHeight}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

**適用場景**:
- Incident List (1000+ 筆)
- Resource Inventory (500+ 筆)
- Log Viewer (無限滾動)

**檔案變更**:
- `components/VirtualTable.tsx` (新建)
- `components/TableContainer.tsx` (整合虛擬滾動判斷)
- 重構 3 個高頻頁面

**工作量**: 32 工時
**相依性**: 無
**風險**: 中 (需處理排序、篩選)

---

## 🎨 P2 項目 (第 7-12 週：最佳化)

### P2.1 - OpenTelemetry 前端可觀測性
**問題**: 無前端效能監控、錯誤追蹤
**影響**: 無法定位前端效能瓶頸
**對齊度**: 0% 🔴

**解決方案**:
```typescript
// 1. 安裝套件
npm install @opentelemetry/sdk-trace-web \
             @opentelemetry/instrumentation-fetch \
             @opentelemetry/exporter-trace-otlp-http

// 2. 初始化 Tracer
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'sre-platform-frontend',
  })
});

// 3. 自動追蹤 Fetch/XHR
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
registerInstrumentations({
  instrumentations: [new FetchInstrumentation()],
});

// 4. Web Vitals 追蹤
import { onCLS, onFID, onLCP } from 'web-vitals';

onLCP((metric) => {
  const span = tracer.startSpan('web-vitals.lcp');
  span.setAttribute('metric.value', metric.value);
  span.end();
});
```

**收集指標**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- API 請求時長
- 元件渲染時間

**檔案變更**:
- `utils/telemetry.ts` (新建)
- `App.tsx` (初始化 Tracer)
- `reportWebVitals.ts` (整合 OTEL)

**工作量**: 24 工時
**相依性**: 無
**風險**: 低

---

### P2.2 - Column Settings 完整實作
**問題**: 無儲存範圍選擇、未儲存變更警告
**影響**: 使用者體驗不完整
**對齊度**: 55% 🟡

**解決方案**:
```typescript
interface ColumnSettingsModalProps {
  saveScope?: 'user' | 'team';  // 儲存範圍
  onSave: (settings: ColumnSettings, scope: 'user' | 'team') => Promise<void>;
}

const ColumnSettingsModal = ({ saveScope, onSave }: ColumnSettingsModalProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'user' | 'team'>(saveScope || 'user');

  // 未儲存變更警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    try {
      await onSave(currentSettings, selectedScope);
      setHasUnsavedChanges(false);
    } catch (error) {
      // 失敗時 Rollback
      setCurrentSettings(originalSettings);
      message.error('儲存失敗，已恢復原設定');
    }
  };

  return (
    <Modal>
      <Radio.Group value={selectedScope} onChange={(e) => setSelectedScope(e.target.value)}>
        <Radio value="user">僅套用於我</Radio>
        <Radio value="team">套用至團隊</Radio>
      </Radio.Group>
      {/* ... */}
    </Modal>
  );
};
```

**檔案變更**:
- `components/ColumnSettingsModal.tsx` (重構)

**工作量**: 16 工時
**相依性**: 無
**風險**: 低

---

### P2.3 - Pact Contract Testing
**問題**: 無前後端契約測試，API 變更易出錯
**影響**: 整合測試成本高
**對齊度**: 0% 🔴

**解決方案**:
```typescript
// 1. 前端定義 Pact
import { PactV3 } from '@pact-foundation/pact';

const provider = new PactV3({
  consumer: 'sre-platform-frontend',
  provider: 'sre-platform-backend',
});

// 2. 定義 API 契約
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
    body: {
      data: eachLike({ id: like('inc-001'), title: like('API Error') }),
      meta: { total: like(10), page: 1, pageSize: 20 },
    },
  });

// 3. 執行測試
await provider.executeTest(async (mockServer) => {
  const api = new ApiClient(mockServer.url);
  const response = await api.getIncidents({ page: 1, pageSize: 20 });
  expect(response.data).toHaveLength(10);
});
```

**檔案變更**:
- `tests/pact/incidents.pact.test.ts` (新建)
- `tests/pact/setup.ts` (新建)
- CI/CD pipeline (加入 Pact 驗證)

**工作量**: 32 工時
**相依性**: P0.2, P1.2 (需先統一 API 格式)
**風險**: 中 (需後端配合)

---

### P2.4 - 進階篩選整合
**問題**: QuickFilterBar 與 UnifiedSearchModal 未整合
**影響**: 篩選邏輯分散，難以維護
**對齊度**: 50% 🟡

**解決方案**:
```typescript
// 1. 統一 Filter State
interface UnifiedFilterState {
  quickFilters: Record<string, any>;    // QuickFilterBar
  advancedFilters: Record<string, any>; // UnifiedSearchModal
  searchText: string;
}

// 2. 建立 useUnifiedFilter Hook
const useUnifiedFilter = () => {
  const [filters, setFilters] = useState<UnifiedFilterState>({
    quickFilters: {},
    advancedFilters: {},
    searchText: '',
  });

  const mergedFilters = useMemo(() => ({
    ...filters.quickFilters,
    ...filters.advancedFilters,
    q: filters.searchText,
  }), [filters]);

  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(mergedFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    navigate({ search: params.toString() });
  }, [mergedFilters]);

  return { filters, setFilters, mergedFilters, syncToUrl };
};

// 3. 整合使用
const IncidentList = () => {
  const { mergedFilters, syncToUrl } = useUnifiedFilter();
  const { data } = useApiQuery(['incidents', mergedFilters], `/incidents?${new URLSearchParams(mergedFilters)}`);

  return (
    <>
      <QuickFilterBar onChange={(quick) => setFilters(f => ({ ...f, quickFilters: quick }))} />
      <UnifiedSearchModal onChange={(advanced) => setFilters(f => ({ ...f, advancedFilters: advanced }))} />
    </>
  );
};
```

**檔案變更**:
- `hooks/useUnifiedFilter.ts` (新建)
- `components/QuickFilterBar.tsx` (重構)
- `components/UnifiedSearchModal.tsx` (重構)

**工作量**: 24 工時
**相依性**: 無
**風險**: 低

---

## 📊 優先級矩陣總覽

| 項目 | 優先級 | 工作量 | 對齊度 | 風險 | 週次 | 相依性 |
|-----|-------|-------|-------|-----|-----|--------|
| RBAC 權限系統 | P0.1 | 16h | 25% 🔴 | 低 | W1 | - |
| API 格式修正 | P0.2 | 8h | 43% 🟡 | 中 | W1 | - |
| MSW 建置 | P0.3 | 24h | 0% 🔴 | 低 | W2 | P0.2 |
| BaseModal | P1.1 | 32h | 62% 🟡 | 低 | W3-4 | - |
| React Query | P1.2 | 40h | 35% 🟡 | 中 | W3-4 | P0.2 |
| Drawer 預載入 | P1.3 | 24h | 40% 🟡 | 低 | W5 | P1.2 |
| Virtual Scrolling | P1.4 | 32h | 45% 🟡 | 中 | W5-6 | - |
| OpenTelemetry | P2.1 | 24h | 0% 🔴 | 低 | W7-8 | - |
| Column Settings | P2.2 | 16h | 55% 🟡 | 低 | W9 | - |
| Pact Testing | P2.3 | 32h | 0% 🔴 | 中 | W10-11 | P0.2, P1.2 |
| 進階篩選整合 | P2.4 | 24h | 50% 🟡 | 低 | W12 | - |

**總工作量**: 272 工時 (≈ 12 週 @ 1 位全職開發者)

---

## 🔗 相依性圖

```
P0.2 (API 格式修正)
  ├─→ P0.3 (MSW)
  ├─→ P1.2 (React Query)
  └─→ P2.3 (Pact Testing)

P1.2 (React Query)
  ├─→ P1.3 (Drawer 預載入)
  └─→ P2.3 (Pact Testing)

獨立項目 (可並行):
  - P0.1 (RBAC)
  - P1.1 (BaseModal)
  - P1.4 (Virtual Scrolling)
  - P2.1 (OpenTelemetry)
  - P2.2 (Column Settings)
  - P2.4 (進階篩選)
```

---

## ⚠️ 風險評估

### 高風險項目
*無*

### 中風險項目

#### P0.2 - API 格式修正
- **風險**: 影響所有現有 API 呼叫
- **緩解**:
  1. 建立完整測試案例
  2. 漸進式遷移 (先 Mock，後真實 API)
  3. Feature Flag 控制切換

#### P1.2 - React Query 整合
- **風險**: 既有狀態管理邏輯複雜
- **緩解**:
  1. 先遷移簡單頁面 (Dashboard)
  2. 提供 Migration Guide
  3. 保留舊 API Client 作為 Fallback

#### P1.4 - Virtual Scrolling
- **風險**: 排序、篩選邏輯需調整
- **緩解**:
  1. 僅用於 >100 項的列表
  2. 保留原 Table 作為預設
  3. 使用 Feature Flag 控制

#### P2.3 - Pact Testing
- **風險**: 需後端團隊配合
- **緩解**:
  1. 前端先定義契約
  2. 生成 Pact 文件供後端驗證
  3. 逐步導入 (先核心 API)

---

## 🎯 快速勝利 (Quick Wins)

以下項目可優先執行，快速展現成效:

### 1. RBAC 權限系統 (P0.1) - 1 週
- **成效**: 立即解決安全性問題
- **可見度**: 高 (UI 會根據權限變化)
- **技術債**: 清除 25% 技術債

### 2. BaseModal 統一 (P1.1) - 1 週
- **成效**: 減少 20+ Modal 重複程式碼
- **可見度**: 中 (開發者體驗提升)
- **技術債**: 清除 30% 元件技術債

### 3. OpenTelemetry (P2.1) - 1 週
- **成效**: 建立前端監控能力
- **可見度**: 高 (Grafana Dashboard 可視化)
- **技術債**: 新增可觀測性基礎

---

## 📈 成功指標

### 技術指標
- ✅ **API 格式統一率**: 100% (所有 API 遵循 SPEC)
- ✅ **元件對齊度**: 從 60% → 90%
- ✅ **權限覆蓋率**: 從 25% → 95% (關鍵功能)
- ✅ **Mock 覆蓋率**: 80% (核心 API)

### 效能指標
- ✅ **LCP (Largest Contentful Paint)**: < 2.5s
- ✅ **FID (First Input Delay)**: < 100ms
- ✅ **API 回應時間**: P95 < 500ms
- ✅ **長列表渲染**: 1000 項 < 100ms (使用 Virtual Scrolling)

### 開發效率指標
- ✅ **前端獨立開發**: 無需等待後端 API (MSW)
- ✅ **重複程式碼減少**: 40% (BaseModal, 統一 Hook)
- ✅ **整合測試時間**: 減少 60% (Pact)

---

## 📅 建議執行順序

### 第 1-2 週：基礎建設 (P0)
```
Week 1:
  ├─ P0.1 RBAC 系統 (16h)
  └─ P0.2 API 格式修正 (8h)

Week 2:
  └─ P0.3 MSW 建置 (24h)
```

### 第 3-6 週：核心功能 (P1)
```
Week 3-4:
  ├─ P1.1 BaseModal (32h)
  └─ P1.2 React Query (40h)  # 並行

Week 5-6:
  ├─ P1.3 Drawer 預載入 (24h)
  └─ P1.4 Virtual Scrolling (32h)  # 並行
```

### 第 7-12 週：最佳化 (P2)
```
Week 7-8:
  └─ P2.1 OpenTelemetry (24h)

Week 9:
  └─ P2.2 Column Settings (16h)

Week 10-11:
  └─ P2.3 Pact Testing (32h)

Week 12:
  └─ P2.4 進階篩選整合 (24h)
```

---

## 🔄 迭代策略

採用 **Strangler Fig Pattern** 漸進式重構:

```
第 1 階段 (W1-2): 建立新架構
  - 新系統與舊系統共存
  - Feature Flag 控制切換
  - 無功能影響

第 2 階段 (W3-6): 核心遷移
  - 高頻功能優先遷移
  - 保留舊功能作 Fallback
  - A/B Testing 驗證

第 3 階段 (W7-12): 最佳化與清理
  - 全面遷移至新架構
  - 移除舊程式碼
  - 效能調校
```

---

## 📝 檢查清單

### 開始前
- [ ] 確認團隊對 SPEC 理解一致
- [ ] 建立 Feature Branch (`refactor/phase-1`)
- [ ] 設定 Feature Flag 機制
- [ ] 備份現有程式碼

### 每個 P0/P1 項目完成後
- [ ] 單元測試覆蓋率 > 80%
- [ ] 整合測試通過
- [ ] Code Review 完成
- [ ] 更新文件

### 全部完成後
- [ ] 所有 API 格式統一
- [ ] 權限檢查覆蓋所有關鍵功能
- [ ] 效能指標達標 (LCP < 2.5s, FID < 100ms)
- [ ] Mock 覆蓋率 > 80%
- [ ] 移除舊程式碼與 Feature Flag
- [ ] 發佈 v2.0.0

---

## 🔗 相關文件

- [Components 對齊度分析](./01-components-gap-analysis.md)
- [API 呼叫格式分析](./02-api-gap-analysis.md)
- [RBAC 權限使用分析](./03-rbac-gap-analysis.md)
- [重構計畫](../.specify/specs/REFACTORING-PLAN.md)
- [API Contract SPEC](../.specify/specs/_api-contract-spec.md)
- [Backend Parameters SPEC](../.specify/specs/_backend-parameters-spec.md)
- [Collaboration SPEC](../.specify/specs/_collaboration-spec.md)

---

**最後更新**: 2025-10-07
**下一次審查**: W4 (第一階段完成後)
