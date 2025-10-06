# 元件規格書 (Component Specification)

**元件名稱 (Component)**: 統一搜尋模態框
**類型 (Type)**: Component
**來源路徑 (Source Path)**: components/UnifiedSearchModal.tsx
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`
**使用次數**: 10 次
**使用模組**: incidents-list, alert-rules, silence-rules, resources-list, resource-groups

---

## 一、功能概述 (Functional Overview)

提供統一的搜尋與篩選介面,支援多種頁面與條件組合

---

## 二、操作邏輯 (User Flow)

### 主要使用流程
1. 使用者點擊「搜尋和篩選」按鈕
2. 系統開啟模態框,載入可用篩選條件
3. 使用者選擇條件並輸入值
4. 使用者點擊「搜尋」
5. 系統關閉模態框,回傳篩選條件至父元件
6. 父元件依條件重新載入資料

### 互動事件
- `onClose`: 關閉模態框
- `onSearch`: 使用者點擊搜尋,回傳篩選條件物件
- `onReset`: 使用者重置篩選條件
- 各條件欄位的 onChange 事件

---

## 三、狀態管理 (State Management)

### 內部狀態
- `filters`: 當前篩選條件物件
- `tempFilters`: 暫存篩選條件(未套用前)
- `availableOptions`: 可用的篩選選項(從 API 或 Context 取得)

### 外部控制
- `isOpen`: 控制顯示/隱藏(由父元件管理)
- `initialFilters`: 初始篩選條件(由父元件傳入)

---

## 四、可配置屬性 (Props)

| 屬性名稱 | 類型 | 必填 | 預設值 | 說明 |
|----------|------|------|--------|------|
| isOpen | boolean | ✅ | - | 控制顯示/隱藏 |
| onClose | () => void | ✅ | - | 關閉事件 |
| onSearch | (filters) => void | ✅ | - | 搜尋事件 |
| page | string | ✅ | - | 頁面識別碼 |
| initialFilters | object | ❌ | {} | 初始篩選條件 |

---

## 五、錯誤與例外處理 (Error Handling)

- 當 API 載入篩選選項失敗時,顯示錯誤訊息並提供重試按鈕
- 當必填篩選條件未填寫時,標記欄位錯誤並阻止搜尋
- 當搜尋條件組合無效時,顯示提示訊息

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **alert-rules**
- **silence-rules**
- **resources-list**
- **resource-groups**

---

## 七、設計原則遵循 (Design Principles)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 可重用性 (Reusability) | ✅ | 元件設計為通用,可跨多個模組使用 |
| 一致性 (Consistency) | ✅ | 遵循統一的 UI 設計系統與互動模式 |
| 可存取性 (Accessibility) | ✅ | 支援鍵盤導航與 ARIA 屬性 |
| 主題支援 (Theme Support) | ✅ | 使用 Theme Token,支援深淺色主題 |
| i18n 支援 (i18n) | ✅ | 所有文案透過 useContent 存取 |

---

## 四、篩選條件格式統一機制 (Filter Schema Unification)

### 4.1 JSON Schema 定義篩選欄位

為確保不同頁面的篩選條件格式統一,採用 **JSON Schema** 定義篩選欄位結構。

#### Filter Schema 結構

```typescript
interface FilterSchema {
  fields: FilterField[];
}

interface FilterField {
  key: string;                    // 欄位唯一識別碼
  label: string;                  // 顯示標籤
  type: FieldType;                // 欄位類型
  options?: SelectOption[];       // 選項(select 類型)
  multiple?: boolean;             // 是否多選
  defaultValue?: any;             // 預設值
  placeholder?: string;           // 提示文字
  api?: string;                   // API 端點(動態選項)
}

type FieldType = 'select' | 'user-select' | 'date-range' | 'text' | 'number';
```

#### 使用範例

**事件列表篩選 Schema**:
```typescript
export const incidentFilterSchema: FilterSchema = {
  fields: [
    {
      key: 'status',
      label: '狀態',
      type: 'select',
      options: [
        { value: 'open', label: '進行中' },
        { value: 'resolved', label: '已解決' },
        { value: 'closed', label: '已關閉' },
      ],
      multiple: true,
      defaultValue: ['open'],
    },
    {
      key: 'severity',
      label: '嚴重性',
      type: 'select',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
      ],
      multiple: true,
    },
    {
      key: 'assignee',
      label: '負責人',
      type: 'user-select',
      multiple: true,
      api: '/api/v1/users',
    },
    {
      key: 'created_at',
      label: '建立時間',
      type: 'date-range',
      defaultValue: { start: 'now-7d', end: 'now' },
    },
  ],
};
```

### 4.2 動態渲染表單元件

根據 Schema 動態渲染對應的表單元件:

- `select`: 下拉選單 (Ant Design Select)
- `user-select`: 使用者選擇器 (支援搜尋)
- `date-range`: 日期範圍選擇器
- `text`: 文字輸入框
- `number`: 數值輸入框

### 4.3 後端 API 格式統一

**請求格式**:
```
GET /api/v1/incidents?filters={"status":["open"],"severity":["critical"]}
GET /api/v1/resources?filters={"type":["server"],"status":["online"]}
```

**後端解析**:
```typescript
interface FilterParams {
  [key: string]: string | string[] | number | DateRange;
}
```

### 4.4 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| Filter Schema 定義 | ✅ | - |
| 動態表單渲染 | ✅ | - |
| 篩選條件驗證 | ✅ | ✅ |
| API 端點提供選項資料 | - | ✅ |
| 篩選邏輯執行 | - | ✅ |

---

## 五、進階搜尋支援範圍 (Advanced Search)

### 5.1 第一階段: 簡化版 (AND 邏輯)

**推薦優先實作** - 所有篩選條件使用 AND 邏輯組合

**邏輯範例**:
```
status = "open" AND severity IN ["critical", "high"] AND assignee = "Alice"
```

**UI 設計**:
```
┌─────────────────────────────────────┐
│ 進階搜尋                        [✕] │
├─────────────────────────────────────┤
│ 狀態:    ☑ 進行中 ☐ 已解決 ☐ 已關閉│
│ 嚴重性:  ☑ Critical ☑ High ☐ Medium│
│ 負責人:  [Alice ▼]                  │
│ 建立時間: [最近 7 天 ▼]             │
│ 關鍵字:  [___________________]      │
├─────────────────────────────────────┤
│ 所有條件需同時滿足 (AND 邏輯)        │
├─────────────────────────────────────┤
│           [重置]  [搜尋]            │
└─────────────────────────────────────┘
```

**特點**:
- 簡單直覺,符合大多數使用場景
- 降低學習成本
- 實作簡單,維護容易

### 5.2 第二階段: 進階版 (AND/OR/NOT)

**未來擴展** - 支援複雜邏輯組合,適用於進階使用者

**邏輯範例**:
```
(status = "open" OR status = "in_progress")
AND
(severity = "critical" OR assignee = "Alice")
AND NOT
(team = "Platform")
```

**UI 設計**:
```
┌─────────────────────────────────────┐
│ 進階搜尋 (條件建構器)           [✕] │
├─────────────────────────────────────┤
│ ┌─ 條件群組 1 ─────────────────┐   │
│ │ AND/OR: [AND ▼]              │   │
│ │                              │   │
│ │ • 狀態 = [進行中 ▼]           │   │
│ │ • 嚴重性 IN [Critical, High]  │   │
│ │                              │   │
│ │ [+ 新增條件] [✕ 刪除群組]     │   │
│ └──────────────────────────────┘   │
│                                     │
│ [AND ▼] (群組間邏輯)                │
│                                     │
│ ┌─ 條件群組 2 ─────────────────┐   │
│ │ AND/OR: [OR ▼]               │   │
│ │                              │   │
│ │ • 負責人 = [Alice ▼]          │   │
│ │ • 團隊 = [SRE ▼]              │   │
│ │                              │   │
│ │ [+ 新增條件]                  │   │
│ └──────────────────────────────┘   │
│                                     │
│ [+ 新增群組]                        │
├─────────────────────────────────────┤
│ SQL 預覽:                           │
│ WHERE (status = 'open' AND          │
│        severity IN ('critical'))    │
│   AND (assignee = 'Alice' OR        │
│        team = 'SRE')                │
├─────────────────────────────────────┤
│           [重置]  [搜尋]            │
└─────────────────────────────────────┘
```

**資料結構**:
```typescript
interface FilterQuery {
  operator: 'AND' | 'OR';
  conditions: Array<{
    field: string;
    operator: '=' | '!=' | 'IN' | 'NOT IN' | '>' | '<';
    value: any;
  } | FilterQuery>; // 支援巢狀
}
```

### 5.3 實作建議

1. **第一階段** (MVP): 實作簡化版 (AND 邏輯)
2. **第二階段** (可選): 基於使用者反饋決定是否實作進階版

### 5.4 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 簡化版篩選 UI | ✅ | - |
| 進階版條件建構器 | ✅ | - |
| AND 邏輯組合 | ✅ | ✅ |
| OR/NOT 邏輯組合 | ✅ | ✅ |
| SQL 預覽生成 | ✅ | - |
| 條件驗證與執行 | - | ✅ |

---

## 六、關聯模組 (Related Modules)

以下模組使用此元件:
- **incidents-list**
- **alert-rules**
- **silence-rules**
- **resources-list**
- **resource-groups**

---

## 七、設計原則遵循 (Design Principles)

| 項目 | 狀態 | 說明 |
|------|------|------|
| 可重用性 (Reusability) | ✅ | 元件設計為通用,可跨多個模組使用 |
| 一致性 (Consistency) | ✅ | 遵循統一的 UI 設計系統與互動模式 |
| 可存取性 (Accessibility) | ✅ | 支援鍵盤導航與 ARIA 屬性 |
| 主題支援 (Theme Support) | ✅ | 使用 Theme Token,支援深淺色主題 |
| i18n 支援 (i18n) | ✅ | 所有文案透過 useContent 存取 |

---

## 八、待確認事項 (Clarifications)

- ✅ ~~[NEEDS CLARIFICATION: 不同頁面的篩選條件來源與格式統一機制]~~ → **已解決: 採用 JSON Schema 定義篩選欄位**
- ✅ ~~[NEEDS CLARIFICATION: 進階搜尋(複雜條件組合)的支援範圍]~~ → **已解決: 第一階段實作簡化版 (AND 邏輯),第二階段可選進階版 (AND/OR/NOT)**

---

## 九、決策記錄 (Decision Records)

### DR-001: 篩選條件格式統一

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.6.1
**決策者**: Spec Architect

**決策內容**:
- 採用 JSON Schema 定義篩選欄位
- 支援動態表單渲染
- 統一後端 API 格式

**理由**:
- 確保不同頁面篩選格式一致
- 降低維護成本
- 提升開發效率

**前後端分工**:
- 前端: Schema 定義、動態表單渲染、條件驗證
- 後端: API 端點提供選項資料、篩選邏輯執行

---

### DR-002: 進階搜尋支援範圍

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 1.6.2
**決策者**: Spec Architect

**決策內容**:
- 第一階段: 實作簡化版 (AND 邏輯)
- 第二階段: 基於反饋實作進階版 (AND/OR/NOT)

**理由**:
- 簡化版滿足大多數使用場景
- 降低學習成本與實作複雜度
- 預留進階功能擴展空間

**前後端分工**:
- 前端: 條件建構器 UI、SQL 預覽生成
- 後端: 複雜邏輯執行、條件驗證
