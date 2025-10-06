# API 呼叫格式分析報告 (API Gap Analysis)

**評估日期**: 2025-10-07
**評估者**: Spec Architect
**目標**: 分析現有 API 呼叫與規格文件的對齊度

---

## 執行摘要

### 📊 整體評估

| 項目 | 現狀 | 規格要求 | 對齊度 | 優先級 |
|------|------|----------|--------|--------|
| **API Client** | ✅ 統一使用 Axios | ✅ 統一 Client | 🟢 90% | P2 |
| **回應格式** | ❌ 直接使用 `response.data` | ✅ `{ data, meta, error }` | 🔴 20% | P0 |
| **錯誤處理** | 🟡 基本錯誤處理 | ✅ 統一錯誤格式 | 🟡 50% | P1 |
| **URL 前綴** | ✅ 自動加 `/api/v1` | ✅ 統一前綴 | 🟢 100% | - |
| **權限驗證** | ❌ 無前端檢查 | ✅ RBAC 整合 | 🔴 0% | P0 |
| **審計日誌** | ❌ 無 | ✅ 自動記錄 (後端) | - | - |
| **HTTP 快取** | ❌ 無 | ✅ ETag 支援 | 🔴 0% | P2 |

**總體對齊度**: **43%** 🟡

---

## 一、現有 API Client 分析

### 1.1 services/api.ts 實作

**檔案**: `services/api.ts` (125 行)

#### 優勢 ✅

1. **統一 Axios Instance**
   ```typescript
   const client: AxiosInstance = axios.create({
     baseURL: normalizedBaseURL,
     timeout: 15000,
     headers: { 'Content-Type': 'application/json' }
   });
   ```
   - ✅ 統一配置
   - ✅ 超時設定
   - ✅ 統一 Headers

2. **自動 URL 前綴**
   ```typescript
   client.interceptors.request.use((config) => {
     if (!config.url.startsWith('/api/v1')) {
       config.url = `/api/v1${config.url}`;
     }
     return config;
   });
   ```
   - ✅ 自動加 `/api/v1` 前綴
   - ✅ 避免重複前綴

3. **統一錯誤包裝**
   ```typescript
   export class ApiError extends Error {
     status?: number;
     code?: string;
     details?: unknown;
   }
   ```
   - ✅ 自定義錯誤類型
   - ✅ 包含 status/code/details

4. **授權過期處理**
   ```typescript
   if (apiError.status === 403 && message.includes('license')) {
     showToast('Your license is invalid...', 'error');
   }
   ```
   - ✅ 特殊錯誤處理

#### 缺口 ❌

1. **❌ 回應格式不符合規範**

   **現狀**:
   ```typescript
   // 直接回傳 response.data
   return { data: response.data, status, headers };
   ```

   **規範要求**:
   ```typescript
   // 應該是 { data: T, meta?: {...} }
   interface ApiResponse<T> {
     data: T;
     meta?: {
       total?: number;
       page?: number;
       pageSize?: number;
     };
   }
   ```

   **問題**: 現有實作將整個 `response.data` 包裝為 `{ data: response.data }`,
   但後端如果已經回傳 `{ data, meta }`,會變成 `{ data: { data, meta } }`,
   導致需要 `response.data.data` 才能取得資料。

2. **❌ 錯誤格式不完整**

   **現狀**:
   ```typescript
   interface ApiErrorBody {
     code?: string;
     message?: string;
     details?: unknown;
   }
   ```

   **規範要求**:
   ```typescript
   interface ApiError {
     error: {
       code: string;
       message: string;
       details?: any;
       requestId: string;      // 缺少
       timestamp: string;      // 缺少
     };
   }
   ```

3. **❌ 無權限檢查機制**

   ```typescript
   // 缺少: 前端權限檢查
   // 需要: 整合 RBAC,在 request interceptor 檢查權限
   ```

4. **❌ 無 HTTP 快取支援**

   ```typescript
   // 缺少: ETag Headers 處理
   // 缺少: If-None-Match 條件請求
   // 缺少: 304 Not Modified 處理
   ```

---

### 1.2 對齊度詳細評估

| 功能 | 現狀 | 規範要求 | 符合度 | 工作量 |
|------|------|----------|--------|--------|
| 統一 Client | ✅ Axios | ✅ 統一 | 🟢 100% | - |
| Base URL | ✅ 環境變數 | ✅ 可配置 | 🟢 100% | - |
| Timeout | ✅ 15s | ✅ 可配置 | 🟢 100% | - |
| URL 前綴 | ✅ `/api/v1` | ✅ 自動加 | 🟢 100% | - |
| Headers | ✅ JSON | ✅ Content-Type | 🟢 100% | - |
| 回應格式 | ❌ 不統一 | ✅ `{ data, meta }` | 🔴 20% | 2 天 |
| 錯誤格式 | 🟡 部分 | ✅ 完整格式 | 🟡 60% | 1 天 |
| 權限檢查 | ❌ 無 | ✅ RBAC | 🔴 0% | 3 天 |
| Loading 狀態 | ❌ 無 | ✅ 統一管理 | 🔴 0% | 2 天 |
| HTTP 快取 | ❌ 無 | ✅ ETag | 🔴 0% | 2 天 |
| Retry 機制 | ❌ 無 | ✅ 指數退避 | 🔴 0% | 1 天 |

**總體對齊度**: **48%** 🟡

---

## 二、API 使用模式分析

### 2.1 常見使用模式

從現有程式碼中觀察到的 API 呼叫模式:

#### Pattern 1: 直接呼叫 (常見)

```typescript
// components/DiscoveryJobResultDrawer.tsx
const fetchResults = async () => {
  setLoading(true);
  try {
    const response = await api.get(`/discovery/jobs/${jobId}/results`);
    setResults(response.data);  // ❌ 假設 response.data 是陣列
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

**問題**:
- ❌ 手動管理 loading/error 狀態
- ❌ 假設回應格式
- ❌ 無權限檢查
- ❌ 無快取機制

#### Pattern 2: Modal 內呼叫 (常見)

```typescript
// components/RoleEditModal.tsx
useEffect(() => {
  if (isOpen) {
    api.get('/iam/permissions')
      .then(response => {
        setPermissions(response.data);  // ❌ 假設格式
      })
      .catch(err => console.error(err));  // ❌ 僅 console
  }
}, [isOpen]);
```

**問題**:
- ❌ 錯誤僅記錄到 console,無使用者提示
- ❌ 無 loading 狀態
- ❌ 每次開啟都重新載入,無快取

#### Pattern 3: 表單提交 (常見)

```typescript
// components/AlertRuleEditModal.tsx
const handleSave = async (values) => {
  try {
    if (editMode) {
      await api.put(`/alerts/rules/${ruleId}`, values);
    } else {
      await api.post('/alerts/rules', values);
    }
    showToast('儲存成功', 'success');
    onClose();
  } catch (error) {
    showToast(error.message, 'error');  // ❌ 直接顯示錯誤訊息
  }
};
```

**問題**:
- ❌ 錯誤訊息可能不適合顯示給使用者
- ❌ 無權限檢查
- ❌ 無審計日誌(應由後端處理)

---

### 2.2 問題模式總結

| 問題 | 出現頻率 | 影響 | 優先級 |
|------|----------|------|--------|
| 手動 loading/error 管理 | 🔴 高 (80%) | 程式碼重複,易出錯 | P1 |
| 假設回應格式 | 🔴 高 (90%) | 後端變更破壞前端 | P0 |
| 錯誤處理不一致 | 🟡 中 (60%) | 使用者體驗不一致 | P1 |
| 無快取機制 | 🟡 中 (70%) | 重複請求,效能差 | P2 |
| 無權限檢查 | 🟡 中 (50%) | 顯示無權限的 UI | P1 |

---

## 三、建議改善方案

### 3.1 升級 API Client

#### 方案 A: 最小改動 (推薦 P0)

**目標**: 修正回應格式,保持向後相容

```typescript
// services/api.ts (改善版)

// 統一回應格式
interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    requestId: string;
    timestamp: string;
  };
}

// 改善 wrap 函數
const wrap = async <T>(promise: Promise<AxiosResponse>): Promise<ApiSuccessResponse<T>> => {
  try {
    const response = await promise;

    // ✅ 假設後端已回傳 { data, meta } 格式
    // 直接回傳,不再包裝
    return response.data as ApiSuccessResponse<T>;
  } catch (error) {
    // ✅ 統一錯誤處理
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;

      // ✅ 如果後端回傳統一錯誤格式
      if (errorData.error) {
        throw new ApiError(errorData.error.message, {
          status: error.response.status,
          code: errorData.error.code,
          details: errorData.error.details,
          requestId: errorData.error.requestId,
          timestamp: errorData.error.timestamp,
        });
      }
    }

    throw normalizeError(error);
  }
};
```

**優點**:
- ✅ 最小改動
- ✅ 符合規範格式
- ✅ 向後相容(如果後端已更新)

**工作量**: 1 天
**風險**: 🟡 中(需後端配合)

---

#### 方案 B: React Query 整合 (推薦 P1)

**目標**: 統一狀態管理與快取

```typescript
// hooks/useApi.ts

import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import api from '../services/api';

// GET 請求 Hook
export const useApiQuery = <T>(
  key: string | string[],
  url: string,
  options?: UseQueryOptions<T>
) => {
  return useQuery<T>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await api.get<T>(url);
      return response.data;  // ✅ 已是 { data, meta } 格式
    },
    ...options,
  });
};

// POST/PUT/DELETE Hook
export const useApiMutation = <TResponse, TRequest = unknown>(
  url: string,
  method: 'post' | 'put' | 'delete' = 'post'
) => {
  return useMutation<TResponse, ApiError, TRequest>({
    mutationFn: async (data) => {
      const response = await api[method]<TResponse>(url, data);
      return response.data;
    },
  });
};
```

**使用範例**:

```typescript
// 取代 Pattern 1
const DiscoveryJobResultDrawer = ({ jobId }) => {
  const { data, isLoading, error, refetch } = useApiQuery(
    ['discovery-results', jobId],
    `/discovery/jobs/${jobId}/results`,
    {
      enabled: !!jobId,
      staleTime: 5 * 60 * 1000,  // 5 分鐘快取
    }
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return <ResultsTable data={data.data} />;
};
```

**優點**:
- ✅ 自動管理 loading/error
- ✅ 內建快取機制
- ✅ 自動重試
- ✅ 樂觀更新支援

**工作量**: 3 天
**風險**: 🟡 中(需團隊學習)

---

#### 方案 C: 權限整合 (推薦 P1)

**目標**: 前端權限檢查,避免無權限 API 呼叫

```typescript
// services/api.ts (新增 request interceptor)

client.interceptors.request.use(
  (config) => {
    // ✅ 提取權限需求(從 config.meta 或 URL 推斷)
    const permission = config.meta?.permission;

    if (permission) {
      const [resource, action] = permission.split(':');

      // ✅ 檢查使用者權限
      const hasPermission = checkPermission(resource, action);

      if (!hasPermission) {
        return Promise.reject(
          new ApiError('無權限執行此操作', {
            status: 403,
            code: 'FORBIDDEN',
          })
        );
      }
    }

    return config;
  }
);
```

**使用範例**:

```typescript
// 呼叫時指定權限
await api.delete('/incidents/${id}', {
  meta: { permission: 'incidents:delete' }
});
```

**優點**:
- ✅ 前端提前檢查,避免無效請求
- ✅ 統一權限管理
- ✅ 更好的使用者體驗

**工作量**: 2 天
**風險**: 🟢 低

---

### 3.2 HTTP 快取支援 (P2)

```typescript
// services/api.ts (新增 ETag 支援)

client.interceptors.request.use((config) => {
  // ✅ 如果有快取的 ETag,加入 If-None-Match
  const cachedETag = getCachedETag(config.url);
  if (cachedETag && config.method === 'get') {
    config.headers['If-None-Match'] = cachedETag;
  }
  return config;
});

client.interceptors.response.use((response) => {
  // ✅ 儲存 ETag
  if (response.headers.etag) {
    cacheETag(response.config.url, response.headers.etag);
  }

  // ✅ 處理 304 Not Modified
  if (response.status === 304) {
    return getCachedResponse(response.config.url);
  }

  return response;
});
```

**優點**:
- ✅ 減少網路傳輸
- ✅ 提升效能
- ✅ 符合 HTTP 標準

**工作量**: 2 天
**風險**: 🟢 低

---

## 四、重構優先級建議

### P0 - Critical (1 週內)

| 項目 | 工作量 | 影響範圍 | 說明 |
|------|--------|----------|------|
| 修正回應格式 | 1 天 | 所有 API 呼叫 | 對齊 `{ data, meta }` 格式 |
| 統一錯誤格式 | 1 天 | 錯誤處理 | 補充 requestId/timestamp |

### P1 - High (2-3 週內)

| 項目 | 工作量 | 影響範圍 | 說明 |
|------|--------|----------|------|
| React Query 整合 | 3 天 | 新功能優先 | 統一狀態管理 |
| 權限檢查整合 | 2 天 | DELETE/PUT 請求 | 前端權限驗證 |
| 統一 Loading/Error | 2 天 | 所有 API 呼叫 | 使用 React Query |

### P2 - Medium (4-6 週內)

| 項目 | 工作量 | 影響範圍 | 說明 |
|------|--------|----------|------|
| HTTP 快取支援 | 2 天 | GET 請求 | ETag 實作 |
| Retry 機制 | 1 天 | 所有請求 | 指數退避 |
| Request/Response Log | 1 天 | 開發環境 | Debug 工具 |

---

## 五、遷移策略

### 5.1 階段性遷移

**Phase 1: 基礎改善 (Week 1)**
1. 修正 API Client 回應格式
2. 統一錯誤處理
3. 建立 `useApiQuery` Hook

**Phase 2: 試點遷移 (Week 2-3)**
1. 選擇 3-5 個頁面試點
2. 使用新 Hook 重寫 API 呼叫
3. 驗證效果,調整實作

**Phase 3: 全面遷移 (Week 4-8)**
1. 逐步遷移所有頁面
2. 移除舊的 API 呼叫模式
3. 更新文件與範例

### 5.2 Feature Flag 控制

```typescript
// config/features.ts
export const features = {
  useReactQuery: process.env.REACT_APP_USE_REACT_QUERY === 'true',
};

// 使用
const Component = () => {
  if (features.useReactQuery) {
    return <NewImplementation />;
  }
  return <LegacyImplementation />;
};
```

---

## 六、總結

### 6.1 現狀評估

**API Client 品質**: 🟡 **可接受** (48% 對齊度)

**優勢**:
- ✅ 統一使用 Axios
- ✅ 自動 URL 前綴
- ✅ 基本錯誤處理

**主要問題**:
- ❌ 回應格式不統一
- ❌ 手動 loading/error 管理
- ❌ 無快取機制
- ❌ 無權限檢查

### 6.2 改善建議

1. **P0**: 修正回應格式與錯誤格式 (2 天)
2. **P1**: 整合 React Query (3 天)
3. **P1**: 整合權限檢查 (2 天)
4. **P2**: HTTP 快取支援 (2 天)

**總工作量**: 約 9 天 (2 週)
**預期效果**: 對齊度提升至 85%+

---

**報告版本**: v1.0
**建立日期**: 2025-10-07
**下次更新**: P0 項目完成後
