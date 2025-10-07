# 通用規範: 表格設計系統

**類型 (Type)**: Common
**適用範圍**: 所有包含資料表格的模組
**建立日期 (Created)**: 2025-10-06
**狀態 (Status)**: Draft
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md`

---

## 一、設計原則

所有表格必須遵循統一的設計系統,確保視覺一致性、操作直覺性與效能最佳化。

### 核心原則

1. **一致性優先**: 表格結構、樣式、互動行為必須統一。
2. **效能優先**: 大資料量時啟用虛擬滾動或伺服器端分頁。
3. **可存取性**: 支援鍵盤導航、螢幕閱讀器、ARIA 標籤。
4. **主題支援**: 使用 Theme Token,支援深淺色主題切換。

---

## 二、表格結構標準

### 2.1 容器結構

```
TableContainer
  └─ Table (固定高度滾動區域)
       ├─ thead (sticky header)
       │    └─ tr
       │         ├─ th (checkbox 欄)
       │         ├─ th (資料欄 × N)
       │         └─ th (操作欄)
       └─ tbody
            └─ tr × N
                 ├─ td (checkbox)
                 ├─ td (資料 × N)
                 └─ td (操作按鈕)
  └─ Pagination (固定於底部)
```

### 2.2 標準 CSS 類別

- `app-table`: 表格基礎樣式
- `app-table__head`: 表頭樣式
- `app-table__head-row`: 表頭列樣式
- `app-table__header-cell`: 表頭儲存格
- `app-table__row`: 資料列樣式
- `app-table__cell`: 資料儲存格
- `app-table__cell--center`: 置中儲存格
- `app-table__actions`: 操作按鈕容器

---

## 三、欄位類型規範

### 3.1 核心欄位類型

| 類型 | 說明 | 寬度建議 | 元件 |
|------|------|----------|------|
| Checkbox | 批次選取 | `w-12` | `<input type="checkbox">` |
| Status | 狀態標籤 | `w-20` ~ `w-28` | `<StatusTag>` |
| Name/Title | 主要識別 | `w-48` ~ `w-64` | 粗體文字 + 副標題 |
| Text | 一般文字 | `w-32` ~ `w-40` | 純文字或連結 |
| Datetime | 時間戳記 | `w-40` | 相對時間或格式化日期 |
| Number | 數值 | `w-24` | 右對齊,tabular-nums |
| Actions | 操作按鈕 | `w-32` | IconButton × N |

### 3.2 欄位排序優先級

標準排序(由左至右):
1. Checkbox (選取欄)
2. Status (狀態)
3. Name/Title (主要識別)
4. 核心屬性欄位
5. 次要屬性欄位
6. Datetime (時間)
7. Actions (操作欄)

---

## 四、互動行為規範

### 4.1 選取與批次操作

- **全選**: 表頭 checkbox 控制當前頁面所有項目選取。
- **單選**: 每列 checkbox 控制該項目選取。
- **不確定狀態**: 部分選取時,全選 checkbox 顯示 indeterminate 狀態。
- **選取反饋**: 選取列背景色變為 `bg-sky-900/50`。
- **批次操作**: 選取數量 > 0 時,工具列切換為批次操作模式。

### 4.2 排序功能

- **可排序欄位**: 表頭顯示排序圖示(↑↓)。
- **點擊排序**: 首次點擊升冪,再次點擊降冪,第三次點擊取消排序。
- **排序指示**: 當前排序欄位高亮顯示,圖示指向對應方向。
- **預設排序**: 多數列表預設依建立時間或更新時間降冪排序。

### 4.3 列點擊行為

- **整列點擊**: 跳轉至詳情頁面或開啟詳情抽屜。
- **例外區域**: Checkbox、操作按鈕、連結點擊不觸發列點擊。
- **視覺回饋**: Hover 時背景色變為 `hover:bg-slate-800/40`。

---

## 五、載入與錯誤狀態

### 5.1 載入狀態

- 使用 `<TableLoader colSpan={n}>` 元件。
- 顯示骨架屏動畫,佔據整個表格區域。
- colSpan 必須等於表頭欄位數(含 checkbox 與 actions)。

### 5.2 錯誤狀態

- 使用 `<TableError colSpan={n} message={error} onRetry={fn}>` 元件。
- 顯示錯誤圖示、錯誤訊息、重試按鈕。
- 錯誤訊息使用友善語言,避免技術術語。

### 5.3 空資料狀態

- 顯示空狀態圖示與提示文字。
- 提供建立第一筆資料的引導按鈕。
- 文案範例: "尚未建立任何 {資源名稱},點擊上方「新增」按鈕開始。"

---

## 六、欄位自訂功能

### 6.1 欄位設定模態框

- 點擊工具列「欄位設定」按鈕開啟。
- 顯示所有可用欄位,勾選框控制顯示/隱藏。
- 支援拖曳調整欄位順序。
- 儲存後即時更新表格顯示。

### 6.2 設定持久化

- 使用者欄位偏好儲存至 API: `PUT /settings/column-config/{pageKey}`
- pageKey 從 `PageMetadataContext` 取得。
- 載入時優先使用使用者設定,否則使用預設欄位。

---

## 七、效能最佳化

### 7.1 大資料量處理

- **伺服器端分頁**: 資料量 > 1000 筆時,必須使用伺服器端分頁。
- **虛擬滾動**: 單頁資料 > 100 筆時,考慮使用虛擬滾動(如 react-window)。
- **延遲載入**: 圖片、圖示等資源使用 lazy loading。

### 7.2 渲染最佳化

- 使用 `React.memo` 包裝表格列元件,避免不必要的重新渲染。
- 使用 `useCallback` 包裝事件處理函式。
- 避免在 renderCellContent 中進行複雜計算,預先計算或使用 `useMemo`。

---

## 八、無障礙存取 (Accessibility)

### 8.1 鍵盤導航

- Tab 鍵依序聚焦: Checkbox → 操作按鈕 → 下一列。
- Enter 鍵觸發當前聚焦按鈕點擊。
- Space 鍵切換 checkbox 狀態。

### 8.2 ARIA 屬性

- 表格使用 `role="table"`。
- 表頭使用 `role="columnheader"`。
- 資料列使用 `role="row"`。
- 操作按鈕提供 `aria-label` 說明。

---

## 九、主題與樣式

### 9.1 顏色使用

- **表頭背景**: `bg-slate-800/50`
- **列 Hover**: `hover:bg-slate-800/40`
- **選取列**: `bg-sky-900/50`
- **邊框**: `border-slate-800`
- **文字**: 主要 `text-white`, 次要 `text-slate-300`, 淡化 `text-slate-500`

### 9.2 Theme Token 使用

- 狀態標籤使用語義色: `StatusTag` 元件自動映射。
- 圖示顏色使用 `text-slate-400`, Hover 時 `text-white`。
- 所有顏色透過 CSS 變數或 Tailwind 語義類別存取,禁止硬編碼色碼。

---

## 十、採用此模式的模組清單

以下模組必須遵循此表格設計系統:

- incidents-list
- incidents-alert
- incidents-silence
- resources-list
- resources-group
- resources-datasource
- resources-auto-discovery
- dashboards-list
- automation-playbook
- automation-trigger
- automation-history
- identity-personnel
- identity-role
- identity-team
- identity-audit
- notification-channel
- notification-strategy
- notification-history

---

## 十一、虛擬滾動實作規範 ✅

### 11.1 技術選型（已確認）

**採用方案**: **react-window**

| 方案 | 優勢 | 劣勢 | 適用場景 | 評分 |
|------|------|------|----------|------|
| **react-window** ✅ | 輕量 (3KB)、效能佳、API 簡單 | 功能較少 | 標準列表/表格 | ⭐⭐⭐⭐⭐ |
| react-virtualized | 功能豐富、社群大 | 體積大 (27KB)、複雜 | 複雜互動表格 | ⭐⭐⭐ |
| TanStack Virtual | 框架無關、TS 友善 | 較新、範例少 | 現代專案 | ⭐⭐⭐⭐ |

**決策依據**: `_resolution-plan.md` 4.1 節

### 11.2 觸發條件

```typescript
const VIRTUAL_SCROLL_THRESHOLD = 100; // 超過 100 筆啟用虛擬滾動

const TableComponent = ({ data }: { data: any[] }) => {
  if (data.length > VIRTUAL_SCROLL_THRESHOLD) {
    return <VirtualizedTable data={data} />;
  } else {
    return <StandardTable data={data} />;
  }
};
```

### 11.3 效能要求

| 指標 | 要求 | 測試條件 |
|------|------|----------|
| **初次渲染** | < 100ms | 1000 筆資料 |
| **滾動 FPS** | > 55 FPS | 持續滾動 |
| **記憶體佔用** | < 50MB | 10000 筆資料 |
| **滾動位置記憶** | 支援 | 返回頁面恢復位置 |
| **鍵盤導航** | 支援 | ↑↓ 鍵切換列 |

### 11.4 實作要點

```typescript
import { FixedSizeList } from 'react-window';

interface VirtualizedTableProps {
  data: any[];
  columns: TableColumn[];
  rowHeight?: number;
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  data,
  columns,
  rowHeight = 48
}) => {
  const Row = ({ index, style }) => (
    <div style={style} className="table-row">
      {columns.map(col => (
        <div key={col.key} className="table-cell">
          {data[index][col.key]}
        </div>
      ))}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={data.length}
      itemSize={rowHeight}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 11.5 何時不使用虛擬滾動

- 資料量 < 100 筆
- 需要列高度動態變化（使用 `VariableSizeList`）
- 需要水平滾動 + 固定欄位（使用 `react-window` Grid 模式）

---

## 十二、表格固定列支援需求 (Sticky Rows Support)

### 12.1 支援範圍

**支援項目**:
- ✅ **Sticky Header** (固定表頭) - 已支援
- ✅ **Sticky First Column** (固定第一欄) - 可選功能
- ❌ **Sticky Rows** (釘選資料列) - 不支援

### 12.2 不支援 Sticky Rows 的理由

- Sticky Header 已滿足大部分需求
- Sticky Rows 實作複雜,與虛擬滾動衝突
- 使用場景少,列表頁通常不需要釘選資料列
- 如需類似功能,建議使用「置頂」功能 (後端排序)

### 12.3 Sticky First Column 實作

**使用場景**:
- 固定 Checkbox 欄位
- 固定主要識別欄位 (如 ID、名稱)

**實作方式**:
```typescript
<Table
  columns={[
    {
      key: 'select',
      fixed: 'left',
      width: 48,
      render: () => <Checkbox />,
    },
    {
      key: 'id',
      fixed: 'left',
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    // ... 其他欄位
  ]}
  scroll={{ x: 1500, y: 600 }}
/>
```

**CSS 樣式**:
```css
.table-cell--fixed-left {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--color-bg-table);
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.table-header-cell--fixed {
  z-index: 3; /* Header 優先級更高 */
}
```

### 12.4 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| Sticky Header 實作 | ✅ | - |
| Sticky First Column 實作 | ✅ | - |
| 置頂功能 (替代 Sticky Rows) | - | ✅ |
| 排序邏輯 (置頂項目優先) | - | ✅ |

---

## 十三、行內編輯統一實作方式 (Inline Edit)

### 13.1 觸發方式

**點擊儲存格進入編輯模式**

### 13.2 編輯完成觸發

| 操作 | 行為 | 說明 |
|------|------|------|
| **Enter 鍵** | 儲存並進入下一列同欄位 | 快速連續編輯 |
| **Tab 鍵** | 儲存並進入右側欄位 | 橫向編輯 |
| **失焦** | 儲存變更 | 點擊其他區域 |
| **ESC 鍵** | 取消編輯,恢復原值 | 放棄變更 |

### 13.3 實作要點

**可編輯儲存格元件**:
- 點擊時進入編輯模式
- 顯示對應的輸入元件 (Input、Select、DatePicker)
- 提供即時驗證
- 支援鍵盤快捷鍵

**儲存策略**:
- **樂觀更新**: 先更新 UI,再呼叫 API
- **失敗回滾**: API 失敗時恢復原值
- **成功提示**: 顯示成功 Toast

**驗證失敗提示**:
- 欄位下方顯示錯誤訊息
- 輸入框標記為錯誤狀態 (`status="error"`)
- 阻止儲存操作

### 13.4 視覺規範

**編輯前**:
```
┌──────────────────┐
│ 事件標題         │ ← 點擊進入編輯
│ (hover 顯示圖示) │
└──────────────────┘
```

**編輯中**:
```
┌──────────────────┐
│ [事件標題______] │ ← 顯示輸入框
│ (聚焦狀態)       │
└──────────────────┘
```

**樣式規範**:
```css
.editable-cell {
  position: relative;
  padding: 4px 8px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.editable-cell:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border);
}

.editable-cell-icon {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.editable-cell:hover .editable-cell-icon {
  opacity: 1;
}
```

### 13.5 API 呼叫

**單一欄位更新**:
```
PATCH /api/v1/incidents/{id}
{
  "title": "新的事件標題"
}
```

**回應**:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "新的事件標題",
    "updatedAt": "2025-10-06T12:00:00Z"
  }
}
```

### 13.6 前後端分工

| 項目 | 前端 | 後端 |
|------|------|------|
| 可編輯儲存格元件 | ✅ | - |
| 鍵盤快捷鍵處理 | ✅ | - |
| 即時驗證 | ✅ | ✅ |
| 樂觀更新與回滾 | ✅ | - |
| PATCH API 實作 | - | ✅ |
| 欄位值驗證 | - | ✅ |

---

## 十四、待確認事項

- ✅ ~~虛擬滾動的實作方案選擇~~ → **已確認：react-window**
- ✅ ~~[NEEDS CLARIFICATION: 表格固定列(sticky rows)的支援需求]~~ → **已解決: 支援 Sticky Header 與 Sticky First Column,不支援 Sticky Rows**
- ✅ ~~[NEEDS CLARIFICATION: 行內編輯(inline edit)的統一實作方式]~~ → **已解決: 點擊進入編輯,Enter/Tab/ESC 鍵控制,樂觀更新策略**

---

## 十五、決策記錄

### DR-001: 虛擬滾動方案選擇

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan.md` 4.1 節

**決策內容**:
- 採用 **react-window** 作為虛擬滾動方案
- 資料量 > 100 筆時啟用
- 效能目標: 渲染 < 100ms, FPS > 55

**理由**:
- 輕量級，符合專案原則
- 效能滿足需求
- API 簡單，易於維護
- 社群成熟，文件完整

---

### DR-002: Sticky Rows 支援範圍

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 2.1.1
**決策者**: Spec Architect

**決策內容**:
- 支援 Sticky Header (固定表頭)
- 支援 Sticky First Column (固定第一欄)
- 不支援 Sticky Rows (釘選資料列)

**理由**:
- Sticky Header 已滿足大部分需求
- Sticky Rows 實作複雜,與虛擬滾動衝突
- 使用場景少,建議使用後端置頂功能替代

**前後端分工**:
- 前端: Sticky Header、Sticky First Column 實作
- 後端: 置頂功能實作、排序邏輯

---

### DR-003: 行內編輯統一實作方式

**決策日期**: 2025-10-06
**決策依據**: `_resolution-plan-phase2.md` § 2.1.2
**決策者**: Spec Architect

**決策內容**:
- 點擊儲存格進入編輯模式
- Enter/Tab/ESC 鍵控制編輯流程
- 樂觀更新策略 (先更新 UI,再呼叫 API)
- 失敗時自動回滾

**理由**:
- 提升使用者體驗
- 降低操作複雜度
- 統一行內編輯互動模式

**前後端分工**:
- 前端: 可編輯儲存格元件、鍵盤快捷鍵、樂觀更新與回滾
- 後端: PATCH API 實作、欄位值驗證
