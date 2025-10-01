# 分頁與排序標準化規範

本文件定義 SRE Platform API 的分頁和排序標準，確保所有列表端點的一致性和可預測性。

---

## 📋 概述

所有返回列表資料的 API 端點必須遵循統一的分頁和排序規範，以確保：
- **一致性** - 所有端點使用相同的查詢參數和回應格式
- **可預測性** - 前端可以統一處理所有列表請求
- **效能** - 避免一次性返回大量資料
- **易用性** - 清晰的分頁資訊和導航

## 🎯 適用範圍

本規範適用於所有返回集合資料的 `GET` 端點，包括但不限於：
- `/dashboards` - 儀表板列表
- `/incidents` - 事件列表
- `/alert-rules` - 告警規則列表
- `/resources` - 資源列表
- `/users`, `/teams`, `/roles` - IAM 相關列表
- `/automation/playbooks`, `/automation/executions`, `/automation/triggers` - 自動化相關列表
- `/notifications/channels`, `/notifications/strategies`, `/notifications/history` - 通知相關列表
- 其他所有集合端點

## 📊 查詢參數規範

### 1. 分頁參數

所有列表端點**必須**支援以下分頁參數：

#### `page` (可選)
- **類型**: `integer`
- **預設值**: `1`
- **最小值**: `1`
- **說明**: 當前頁碼（從 1 開始）
- **範例**: `?page=2`

#### `page_size` (可選)
- **類型**: `integer`
- **預設值**: `20`
- **最小值**: `1`
- **最大值**: `100`
- **說明**: 每頁返回的項目數量
- **範例**: `?page_size=50`

#### 參數處理邏輯

```typescript
// 標準化參數處理
const pageNum = Number(params.page) || 1;
const pageSize = Math.min(Math.max(Number(params.page_size) || 20, 1), 100);
```

**重要規則**:
- 如果 `page` 未提供或無效，使用 `1`
- 如果 `page_size` 未提供或無效，使用 `20`
- `page_size` 必須在 1-100 範圍內，超出範圍自動調整
- 負數或 0 自動調整為預設值

### 2. 排序參數

所有列表端點**應該**支援以下排序參數：

#### `sort_by` (可選)
- **類型**: `string`
- **預設值**: 依端點而定（通常為 `created_at`）
- **說明**: 排序欄位名稱
- **範例**: `?sort_by=name`

**支援的欄位**:
- `created_at` - 創建時間（預設）
- `updated_at` - 更新時間
- `name` - 名稱
- 其他實體特定欄位（如 `severity`, `status`, `type` 等）

#### `sort_order` (可選)
- **類型**: `string`
- **預設值**: `desc`
- **允許值**: `asc`, `desc`
- **說明**: 排序方向
- **範例**: `?sort_order=asc`

#### 排序規則

1. **預設排序**：
   - 如果未提供 `sort_by` 和 `sort_order`，使用 `created_at desc`（最新的在前）

2. **單一欄位排序**：
   - 只能按單一欄位排序
   - 不支援多欄位排序

3. **NULL 值處理**：
   - NULL 值排在最後（無論升序或降序）

4. **型別處理**：
   ```typescript
   // 數字型別
   if (typeof valA === 'number' && typeof valB === 'number') {
       return sortOrder === 'asc' ? valA - valB : valB - valA;
   }

   // 字串型別（使用 locale-aware 比較）
   if (typeof valA === 'string' && typeof valB === 'string') {
       return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
   }

   // 布林型別
   if (typeof valA === 'boolean' && typeof valB === 'boolean') {
       const valueA = Number(valA);
       const valueB = Number(valB);
       return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
   }

   // 日期型別（ISO 8601 字串）
   // 直接使用字串比較（ISO 8601 格式天生可排序）
   return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
   ```

### 3. 過濾參數

除了分頁和排序，列表端點通常還支援特定的過濾參數：

#### `keyword` (可選，通用過濾)
- **類型**: `string`
- **說明**: 模糊搜尋關鍵字（通常搜尋 `name`, `description` 等欄位）
- **範例**: `?keyword=web`

#### 實體特定過濾參數

每個端點可以定義自己的過濾參數，例如：

**Incidents**:
- `status` - 事件狀態
- `severity` - 嚴重程度
- `assignee` - 負責人

**Resources**:
- `type` - 資源類型
- `status` - 資源狀態
- `provider` - 雲端供應商
- `region` - 區域

**Dashboards**:
- `type` - 儀表板類型
- `category` - 分類

## 📤 回應格式規範

### 標準分頁回應結構

所有分頁端點**必須**返回以下格式：

```json
{
  "page": 1,
  "page_size": 20,
  "total": 145,
  "items": [
    { /* 項目 1 */ },
    { /* 項目 2 */ },
    ...
  ]
}
```

#### 欄位說明

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `page` | `integer` | ✅ | 當前頁碼 |
| `page_size` | `integer` | ✅ | 每頁項目數量 |
| `total` | `integer` | ✅ | 總項目數（過濾後） |
| `items` | `array` | ✅ | 當前頁的項目陣列 |

#### 計算總頁數

```typescript
const totalPages = Math.ceil(total / page_size);
```

### 範例回應

#### 範例 1: 第一頁

```http
GET /api/v1/incidents?page=1&page_size=20&sort_by=created_at&sort_order=desc
```

```json
{
  "page": 1,
  "page_size": 20,
  "total": 145,
  "items": [
    {
      "id": "INC-001",
      "summary": "CPU 使用率超過 90%",
      "status": "New",
      "severity": "Critical",
      "created_at": "2024-01-15T10:30:00Z"
    },
    // ... 19 more items
  ]
}
```

#### 範例 2: 最後一頁（不足 page_size）

```http
GET /api/v1/incidents?page=8&page_size=20
```

```json
{
  "page": 8,
  "page_size": 20,
  "total": 145,
  "items": [
    // 只有 5 個項目（145 % 20 = 5）
  ]
}
```

#### 範例 3: 空結果

```http
GET /api/v1/incidents?page=1&page_size=20&status=NonExistent
```

```json
{
  "page": 1,
  "page_size": 20,
  "total": 0,
  "items": []
}
```

## 🔧 實現指南

### Backend 實現 (TypeScript/Node.js)

#### 標準分頁函數

```typescript
/**
 * 標準分頁函數
 * @param array 資料陣列
 * @param page 頁碼（可以是 string 或 number）
 * @param pageSize 每頁大小（可以是 string 或 number）
 * @returns 分頁結果物件
 */
const paginate = (
  array: any[],
  page: any,
  pageSize: any
) => {
  const pageNum = Number(page) || 1;
  const size = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const startIndex = (pageNum - 1) * size;

  return {
    page: pageNum,
    page_size: size,
    total: array.length,
    items: array.slice(startIndex, startIndex + size),
  };
};
```

#### 標準排序函數

```typescript
/**
 * 標準排序函數
 * @param data 資料陣列
 * @param sortBy 排序欄位
 * @param sortOrder 排序方向（'asc' | 'desc'）
 * @returns 排序後的陣列（新陣列，不修改原陣列）
 */
const sortData = (
  data: any[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
) => {
  return [...data].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    // NULL 值處理（排在最後）
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    // 數字型別
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }

    // 字串型別（使用 locale-aware 比較）
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    // 布林型別
    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      const valueA = Number(valA);
      const valueB = Number(valB);
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }

    // 通用比較（fallback）
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};
```

#### 完整使用範例

```typescript
// GET /incidents 端點實現
case 'GET /incidents': {
  // 1. 獲取基礎資料（過濾已刪除項目）
  let incidents = getActive(DB.incidents);

  // 2. 應用業務過濾
  if (params) {
    if (params.status) {
      incidents = incidents.filter(i => i.status === params.status);
    }
    if (params.severity) {
      incidents = incidents.filter(i => i.severity === params.severity);
    }
    if (params.assignee) {
      incidents = incidents.filter(i => i.assignee === params.assignee);
    }
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      incidents = incidents.filter(i =>
        i.summary.toLowerCase().includes(keyword) ||
        i.resource.toLowerCase().includes(keyword)
      );
    }
  }

  // 3. 應用排序（如果提供）
  if (params?.sort_by && params?.sort_order) {
    incidents = sortData(incidents, params.sort_by, params.sort_order);
  }

  // 4. 應用分頁並返回
  return paginate(incidents, params?.page, params?.page_size);
}
```

### SQL 實現 (PostgreSQL)

```sql
-- 標準分頁查詢範例
SELECT
  id,
  name,
  status,
  created_at,
  updated_at
FROM incidents
WHERE
  deleted_at IS NULL
  AND ($1::text IS NULL OR status = $1)
  AND ($2::text IS NULL OR severity = $2)
  AND ($3::text IS NULL OR summary ILIKE '%' || $3 || '%')
ORDER BY
  CASE WHEN $6 = 'asc' THEN
    CASE $5
      WHEN 'name' THEN name
      WHEN 'status' THEN status
      ELSE created_at::text
    END
  END ASC NULLS LAST,
  CASE WHEN $6 = 'desc' THEN
    CASE $5
      WHEN 'name' THEN name
      WHEN 'status' THEN status
      ELSE created_at::text
    END
  END DESC NULLS LAST
LIMIT $4::integer
OFFSET ($7::integer - 1) * $4::integer;

-- 參數:
-- $1: status (過濾)
-- $2: severity (過濾)
-- $3: keyword (過濾)
-- $4: page_size
-- $5: sort_by
-- $6: sort_order
-- $7: page

-- 總數查詢（相同的過濾條件）
SELECT COUNT(*) as total
FROM incidents
WHERE
  deleted_at IS NULL
  AND ($1::text IS NULL OR status = $1)
  AND ($2::text IS NULL OR severity = $2)
  AND ($3::text IS NULL OR summary ILIKE '%' || $3 || '%');
```

### Frontend 實現 (TypeScript/React)

#### 型別定義

```typescript
// 分頁回應介面
interface PaginatedResponse<T> {
  page: number;
  page_size: number;
  total: number;
  items: T[];
}

// 分頁請求參數
interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: any; // 其他過濾參數
}
```

#### API 呼叫範例

```typescript
// 使用 axios 或 fetch
const fetchIncidents = async (params: PaginationParams) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);

  // 添加其他過濾參數
  Object.entries(params).forEach(([key, value]) => {
    if (!['page', 'page_size', 'sort_by', 'sort_order'].includes(key) && value) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/v1/incidents?${queryParams}`);
  return response.json() as Promise<PaginatedResponse<Incident>>;
};
```

#### React Hook 範例

```typescript
const useIncidents = (params: PaginationParams) => {
  const [data, setData] = useState<PaginatedResponse<Incident> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchIncidents(params);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(params)]);

  return { data, loading, error };
};
```

## ⚠️ 特殊情況處理

### 1. 超出頁碼範圍

**情況**: 客戶端請求 `page=999` 但實際只有 10 頁

**處理方式**:
- ✅ **推薦**: 返回空結果（`items: []`），但保持 `page=999`, `total` 為實際總數
- ❌ **不推薦**: 返回 404 錯誤（使用者體驗不佳）
- ❌ **不推薦**: 自動重定向到第一頁或最後一頁

```json
{
  "page": 999,
  "page_size": 20,
  "total": 145,
  "items": []
}
```

### 2. 無效的排序欄位

**情況**: 客戶端請求 `sort_by=nonexistent_field`

**處理方式**:
- ✅ **推薦**: 忽略排序參數，使用預設排序
- ❌ **不推薦**: 返回 400 錯誤（太嚴格）

### 3. 大量資料匯出

**情況**: 需要匯出所有資料（不分頁）

**處理方式**:
- 提供專門的匯出 API 端點：`GET /incidents/export`
- 支援不同格式：`?format=csv`, `?format=xlsx`, `?format=json`
- 使用非同步任務處理大量資料
- 不要透過設置 `page_size=999999` 來繞過分頁

### 4. 即時資料（WebSocket/SSE）

**情況**: 需要即時更新的列表

**處理方式**:
- 初始載入使用標準分頁 API
- 即時更新透過 WebSocket 或 Server-Sent Events
- 新增項目自動插入列表前端
- 提供手動重新整理按鈕

## 🧪 測試建議

### API 測試案例

#### 基本分頁測試

```typescript
describe('GET /incidents - Pagination', () => {
  it('should return first page with default page_size', async () => {
    const response = await request(app).get('/api/v1/incidents');
    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.page_size).toBe(20);
    expect(response.body.items.length).toBeLessThanOrEqual(20);
  });

  it('should respect custom page_size', async () => {
    const response = await request(app).get('/api/v1/incidents?page_size=5');
    expect(response.body.page_size).toBe(5);
    expect(response.body.items.length).toBeLessThanOrEqual(5);
  });

  it('should cap page_size at 100', async () => {
    const response = await request(app).get('/api/v1/incidents?page_size=500');
    expect(response.body.page_size).toBe(100);
  });

  it('should handle out-of-range page gracefully', async () => {
    const response = await request(app).get('/api/v1/incidents?page=999');
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });
});
```

#### 排序測試

```typescript
describe('GET /incidents - Sorting', () => {
  it('should sort by created_at desc by default', async () => {
    const response = await request(app).get('/api/v1/incidents');
    const items = response.body.items;
    for (let i = 1; i < items.length; i++) {
      expect(new Date(items[i-1].created_at).getTime())
        .toBeGreaterThanOrEqual(new Date(items[i].created_at).getTime());
    }
  });

  it('should sort by name asc', async () => {
    const response = await request(app)
      .get('/api/v1/incidents?sort_by=summary&sort_order=asc');
    const items = response.body.items;
    for (let i = 1; i < items.length; i++) {
      expect(items[i-1].summary.localeCompare(items[i].summary))
        .toBeLessThanOrEqual(0);
    }
  });

  it('should ignore invalid sort_by field', async () => {
    const response = await request(app)
      .get('/api/v1/incidents?sort_by=invalid_field');
    expect(response.status).toBe(200); // Should not fail
  });
});
```

## 📚 OpenAPI 規範範例

```yaml
/incidents:
  get:
    summary: List incidents
    parameters:
      - $ref: '#/components/parameters/PageParam'
      - $ref: '#/components/parameters/PageSizeParam'
      - $ref: '#/components/parameters/SortByParam'
      - $ref: '#/components/parameters/SortOrderParam'
      - name: status
        in: query
        schema:
          type: string
          enum: [New, Acknowledged, Investigating, Resolved, Closed]
      - name: severity
        in: query
        schema:
          type: string
          enum: [Critical, Warning, Info]
    responses:
      '200':
        description: Successful response
        content:
          application/json:
            schema:
              type: object
              required: [page, page_size, total, items]
              properties:
                page:
                  type: integer
                  example: 1
                page_size:
                  type: integer
                  example: 20
                total:
                  type: integer
                  example: 145
                items:
                  type: array
                  items:
                    $ref: '#/components/schemas/Incident'

components:
  parameters:
    PageParam:
      name: page
      in: query
      description: Page number (starts from 1)
      schema:
        type: integer
        minimum: 1
        default: 1
      example: 1

    PageSizeParam:
      name: page_size
      in: query
      description: Number of items per page
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      example: 20

    SortByParam:
      name: sort_by
      in: query
      description: Field to sort by
      schema:
        type: string
        default: created_at
      example: created_at

    SortOrderParam:
      name: sort_order
      in: query
      description: Sort order
      schema:
        type: string
        enum: [asc, desc]
        default: desc
      example: desc
```

## 📖 最佳實踐總結

### ✅ DO (推薦做法)

1. **始終返回標準分頁格式** - 即使資料量少也使用分頁
2. **提供預設值** - `page=1`, `page_size=20`, `sort_order=desc`
3. **限制 page_size** - 最大 100，避免效能問題
4. **使用 snake_case** - `page_size`, `sort_by`, `sort_order`
5. **NULL 值排最後** - 無論升序降序
6. **保持一致性** - 所有端點使用相同的參數名稱
7. **測試邊界情況** - 空結果、超出範圍、無效參數
8. **文檔化排序欄位** - 明確列出支援的 `sort_by` 欄位
9. **提供總數** - 始終包含 `total` 欄位
10. **支援關鍵字搜尋** - 提供 `keyword` 參數

### ❌ DON'T (避免做法)

1. **不要省略分頁** - 即使資料少也不要直接返回陣列
2. **不要使用 0-based 頁碼** - 使用 1-based（更符合直覺）
3. **不要使用 camelCase** - 使用 snake_case 與資料庫一致
4. **不要對超出範圍拋錯** - 返回空結果即可
5. **不要支援無限 page_size** - 必須有上限
6. **不要在 URL 路徑中包含頁碼** - 使用查詢參數
7. **不要混用分頁策略** - 有些用 offset/limit，有些用 page/size
8. **不要忽略排序的型別** - 字串和數字排序邏輯不同
9. **不要硬編碼預設值** - 使用常數或配置
10. **不要忘記軟刪除過濾** - 始終過濾 `deleted_at IS NULL`

## 🔄 版本歷史

| 版本 | 日期 | 變更內容 | 作者 |
|------|------|----------|------|
| 1.0.0 | 2025-10-02 | 初始版本 - 定義標準分頁排序規範 | Claude Code |

## 📞 相關資源

- **OpenAPI 規範**: `openapi-specs/01-common-parameters.yaml`
- **實現參考**: `mock-server/handlers.ts` (paginate, sortData 函數)
- **型別定義**: `types.ts`
- **資料庫 Schema**: `db_schema.sql`

---

**維護者**: SRE Platform Team
**最後更新**: 2025-10-02
**狀態**: ✅ 正式版 (Production Ready)
