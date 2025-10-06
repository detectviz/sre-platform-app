# 待處理項目解決方案建議書 (第二階段 - 前端 UI/UX)

**文件版本**: 2.0.0
**建立日期**: 2025-10-06
**狀態**: Draft
**依據**: `.specify/specs/_remaining-clarifications.md`
**範圍**: **剩餘 21 項前端 UI/UX 決策**

---

## ⚠️ 重要聲明

本文件為第二階段解決方案,專注於處理**剩餘 21 項前端 UI/UX 項目**。

### 📋 進度概覽

- ✅ **第一階段完成**: 15 項前端 UI/UX 決策 (已更新至 SPEC)
- 🔄 **第二階段進行中**: 21 項前端 UI/UX 決策 (本文件)
- ⏳ **後續階段**: 32 項後端參數 + 10 項跨域協作

---

## 一、Component Specs 項目 (16 項)

---

### 1.1 Modal 元件 (2 項)

#### 1.1.1 巢狀模態框的顯示優先級

**問題**: 當多層 Modal 開啟時，Z-index 優先級與焦點管理未明確。

**前端決策** (推薦方案):

**Z-index 優先級規則**:
```css
.modal-level-1 { z-index: 1000; }  /* 主 Modal */
.modal-level-2 { z-index: 1050; }  /* 子 Modal */
.drawer       { z-index: 1100; }   /* Drawer 永遠最上層 */
.toast        { z-index: 9999; }   /* Toast 通知最上層 */
```

**焦點管理**:
- 開啟新 Modal 時，焦點自動移至最上層 Modal
- 關閉子 Modal 時，焦點回到父 Modal
- ESC 鍵優先關閉最上層 Modal

**背景遮罩處理**:
- 每層 Modal 共用同一個背景遮罩 (不重疊多層遮罩)
- 點擊背景遮罩關閉最上層 Modal
- 背景遮罩透明度: 第一層 `bg-black/50`，第二層不增加透明度

**實作範例**:
```tsx
// Modal Stack Context
const ModalStackContext = createContext<{
  level: number;
  push: () => void;
  pop: () => void;
}>({ level: 0, push: () => {}, pop: () => {} });

const Modal: React.FC<ModalProps> = ({ children, ...props }) => {
  const { level, push, pop } = useModalStack();

  useEffect(() => {
    push(); // 開啟時推入堆疊
    return () => pop(); // 關閉時彈出堆疊
  }, []);

  const zIndex = 1000 + level * 50;

  return (
    <AntModal
      {...props}
      zIndex={zIndex}
      className={`modal-level-${level}`}
    >
      {children}
    </AntModal>
  );
};
```

**更新 SPEC**: `components/modal-spec.md` § 5

---

#### 1.1.2 模態框內容的生命週期管理

**問題**: Modal 內容應在何時掛載/卸載？

**前端決策** (推薦方案):

**生命週期策略矩陣**:

| Modal 類型 | 掛載時機 | 卸載時機 | 理由 |
|-----------|---------|---------|------|
| **簡單表單** | 開啟時 (open=true) | 關閉後延遲 300ms | 等待動畫完成 |
| **複雜編輯** | 首次開啟時 | 頁面卸載時 | 避免重複初始化 |
| **詳情檢視** | 開啟時 | 關閉後立即卸載 | 確保資料最新 |
| **確認對話框** | 首次開啟時 | 頁面卸載時 | 確認框經常使用 |

**推薦模式**: **延遲卸載 (Lazy Unmount)**

```tsx
const Modal: React.FC<ModalProps> = ({
  open,
  destroyOnClose = false, // 預設不卸載
  children
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else if (destroyOnClose) {
      // 延遲卸載，等待動畫完成
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [open, destroyOnClose]);

  return (
    <AntModal open={open}>
      {shouldRender ? children : null}
    </AntModal>
  );
};
```

**使用指引**:
- 一般表單: 使用 `destroyOnClose={false}` (預設，保留 DOM)
- 需重新初始化: 使用 `destroyOnClose={true}` (關閉後卸載)
- 大型內容 (如圖表): 使用 `destroyOnClose={true}` (釋放記憶體)

**效能考量**:
- 保留 DOM 優勢: 快速重新開啟，保留表單狀態
- 卸載 DOM 優勢: 釋放記憶體，確保資料最新

**更新 SPEC**: `components/modal-spec.md` § 6

---

### 1.2 ColumnSettingsModal 元件 (2 項)

#### 1.2.1 欄位設定的儲存位置 (使用者級或團隊級)

**問題**: 欄位設定應存在使用者偏好或團隊設定？

**前端決策** (推薦方案):

**UI 設計**: 提供儲存範圍選擇器

```
┌─────────────────────────────────────┐
│ 欄位設定                        [✕] │
├─────────────────────────────────────┤
│ ☑️ 事件 ID                          │
│ ☑️ 狀態                             │
│ ☑️ 嚴重性                           │
│ ☐ 建立時間                          │
│ ☑️ 負責人                           │
├─────────────────────────────────────┤
│ 儲存範圍:                           │
│ ○ 僅我自己 (預設)                   │
│ ○ 套用至整個團隊                    │
│   [ℹ️ 需要團隊管理員權限]            │
├─────────────────────────────────────┤
│           [取消]  [儲存]            │
└─────────────────────────────────────┘
```

**儲存邏輯**:
```tsx
const saveColumnSettings = async (settings: ColumnConfig) => {
  const scope = selectedScope; // 'user' | 'team'

  if (scope === 'team' && !hasTeamAdminPermission) {
    showToast('需要團隊管理員權限', 'error');
    return;
  }

  const endpoint = scope === 'user'
    ? `/api/v1/users/me/column-config/${pageKey}`
    : `/api/v1/teams/${teamId}/column-config/${pageKey}`;

  await api.put(endpoint, settings);
  showToast('欄位設定已儲存', 'success');
};
```

**載入優先級**:
1. 檢查使用者級設定
2. 若無，檢查團隊級設定
3. 若無，使用預設設定

**前端顯示**:
- 如果使用使用者設定: 顯示「自訂設定」標籤
- 如果使用團隊設定: 顯示「團隊設定」標籤
- 如果使用預設設定: 顯示「預設設定」標籤

**API 格式**:
```typescript
// GET /api/v1/users/me/column-config/{pageKey}
// GET /api/v1/teams/{teamId}/column-config/{pageKey}
{
  "columns": ["id", "status", "severity", "assignee"],
  "order": ["id", "status", "severity", "assignee"],
  "scope": "user" | "team",
  "updatedAt": "2025-10-06T12:00:00Z"
}
```

**更新 SPEC**: `components/column-settings-modal-spec.md` § 4

---

#### 1.2.2 欄位排序的持久化策略

**問題**: 拖曳排序後何時儲存？

**前端決策** (推薦方案):

**儲存時機**: **點擊「儲存」按鈕統一儲存** (推薦)

理由:
- 避免頻繁 API 呼叫 (每次拖曳都儲存)
- 允許使用者取消變更
- 符合使用者心智模型 (明確儲存動作)

**UI 互動流程**:
```
1. 使用者拖曳欄位調整順序
2. UI 即時更新預覽 (本地狀態)
3. 未儲存時顯示「未儲存變更」提示
4. 使用者點擊「儲存」→ 呼叫 API 儲存
5. 使用者點擊「取消」→ 恢復原始順序
```

**實作範例**:
```tsx
const ColumnSettingsModal: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDragEnd = (result: DragResult) => {
    const reordered = reorder(columns, result.source.index, result.destination.index);
    setColumns(reordered);
    setHasChanges(true); // 標記有變更
  };

  const handleSave = async () => {
    await api.put(`/api/v1/users/me/column-config/${pageKey}`, {
      columns: columns.map(col => col.key),
      order: columns.map(col => col.key)
    });
    setHasChanges(false);
    showToast('欄位設定已儲存', 'success');
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      confirm('有未儲存的變更，確定要關閉嗎？', () => {
        setColumns(initialColumns); // 恢復原始順序
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      title="欄位設定"
      footer={[
        <Button key="cancel" onClick={handleCancel}>取消</Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          disabled={!hasChanges}
        >
          儲存
        </Button>
      ]}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {columns.map((col, index) => (
                <Draggable key={col.key} draggableId={col.key} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Checkbox checked={col.visible} onChange={() => toggleColumn(col.key)}>
                        {col.label}
                      </Checkbox>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {hasChanges && <Alert message="有未儲存的變更" type="warning" />}
    </Modal>
  );
};
```

**失敗時的回滾機制**:
```tsx
const handleSave = async () => {
  const backup = [...columns]; // 備份當前狀態
  try {
    await api.put(`/api/v1/users/me/column-config/${pageKey}`, {
      columns: columns.map(col => col.key)
    });
    showToast('儲存成功', 'success');
  } catch (error) {
    setColumns(backup); // 回滾至備份狀態
    showToast('儲存失敗，已恢復原設定', 'error');
  }
};
```

**更新 SPEC**: `components/column-settings-modal-spec.md` § 5

---

### 1.3 Toolbar 元件 (2 項)

#### 1.3.1 批次操作的權限控制機制

**問題**: 無權限時應隱藏按鈕或禁用按鈕？

**前端決策** (推薦方案):

**權限控制策略矩陣**:

| 權限類型 | UI 顯示方式 | 理由 |
|---------|-----------|------|
| **完全無權限** | 隱藏按鈕 | 避免使用者困惑 |
| **部分權限** | 顯示 + 禁用 + Tooltip | 告知權限不足原因 |
| **有權限但不可用** | 顯示 + 禁用 + Tooltip | 告知前置條件 (如未選取資料) |

**實作範例**:
```tsx
interface ToolbarButtonProps {
  label: string;
  permission: string; // 如 'incidents:delete'
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  permission,
  disabled,
  disabledReason,
  onClick
}) => {
  const hasPermission = usePermission(permission);

  // 完全無權限: 隱藏按鈕
  if (!hasPermission) {
    return null;
  }

  // 有權限但禁用: 顯示 Tooltip
  if (disabled) {
    return (
      <Tooltip title={disabledReason || '無法執行此操作'}>
        <Button disabled icon={<DeleteIcon />}>
          {label}
        </Button>
      </Tooltip>
    );
  }

  // 有權限且可用: 正常顯示
  return (
    <Button onClick={onClick} icon={<DeleteIcon />}>
      {label}
    </Button>
  );
};

// 使用範例
<ToolbarButton
  label="刪除"
  permission="incidents:delete"
  disabled={selectedItems.length === 0}
  disabledReason="請先選擇要刪除的項目"
  onClick={handleDelete}
/>
```

**批次操作特殊處理**:
```tsx
// 部分項目有權限、部分無權限
const handleBatchDelete = () => {
  const deletableItems = selectedItems.filter(item =>
    hasPermission('incidents:delete', item)
  );

  if (deletableItems.length === 0) {
    showToast('您沒有權限刪除所選項目', 'error');
    return;
  }

  if (deletableItems.length < selectedItems.length) {
    confirm(
      `您有權刪除 ${deletableItems.length} 筆，其餘 ${selectedItems.length - deletableItems.length} 筆無權限，是否繼續？`,
      () => performDelete(deletableItems)
    );
  } else {
    performDelete(deletableItems);
  }
};
```

**更新 SPEC**: `components/toolbar-spec.md` § 4

---

#### 1.3.2 工具列在不同螢幕尺寸的響應式佈局

**問題**: 小螢幕時按鈕如何排列？

**前端決策** (推薦方案):

**響應式策略**: **按鈕收合至「更多」下拉選單** (推薦)

**斷點定義**:
```css
/* 大螢幕 (>= 1024px): 顯示所有按鈕 */
/* 中螢幕 (768px - 1023px): 顯示主要按鈕 (3-4 個) + 更多選單 */
/* 小螢幕 (< 768px): 顯示 1-2 個按鈕 + 更多選單 */
```

**UI 設計**:
```
[大螢幕]
┌────────────────────────────────────────┐
│ [新增] [匯入] [匯出] [刪除] [欄位設定]  │
└────────────────────────────────────────┘

[中螢幕]
┌────────────────────────────────────────┐
│ [新增] [匯入] [匯出] [更多 ▼]           │
│                       └─ 刪除          │
│                       └─ 欄位設定      │
└────────────────────────────────────────┘

[小螢幕]
┌────────────────────────────────────────┐
│ [新增] [更多 ▼]                         │
│         └─ 匯入                        │
│         └─ 匯出                        │
│         └─ 刪除                        │
│         └─ 欄位設定                    │
└────────────────────────────────────────┘
```

**實作範例**:
```tsx
const Toolbar: React.FC = () => {
  const screenSize = useScreenSize(); // 'sm' | 'md' | 'lg'

  const primaryButtons = [
    { key: 'add', label: '新增', icon: <PlusIcon />, priority: 1 },
    { key: 'import', label: '匯入', icon: <ImportIcon />, priority: 2 },
    { key: 'export', label: '匯出', icon: <ExportIcon />, priority: 3 },
  ];

  const secondaryButtons = [
    { key: 'delete', label: '刪除', icon: <DeleteIcon />, priority: 4 },
    { key: 'settings', label: '欄位設定', icon: <SettingsIcon />, priority: 5 },
  ];

  const maxVisible = screenSize === 'lg' ? 5 : screenSize === 'md' ? 3 : 1;
  const allButtons = [...primaryButtons, ...secondaryButtons];
  const visibleButtons = allButtons.slice(0, maxVisible);
  const hiddenButtons = allButtons.slice(maxVisible);

  return (
    <div className="toolbar">
      {visibleButtons.map(btn => (
        <Button key={btn.key} icon={btn.icon}>
          {btn.label}
        </Button>
      ))}
      {hiddenButtons.length > 0 && (
        <Dropdown
          menu={{
            items: hiddenButtons.map(btn => ({
              key: btn.key,
              label: btn.label,
              icon: btn.icon,
            }))
          }}
        >
          <Button icon={<MoreIcon />}>更多</Button>
        </Dropdown>
      )}
    </div>
  );
};

// 使用 Tailwind 響應式
<div className="flex gap-2">
  <Button className="inline-flex">新增</Button>
  <Button className="hidden md:inline-flex">匯入</Button>
  <Button className="hidden md:inline-flex">匯出</Button>
  <Button className="hidden lg:inline-flex">刪除</Button>
  <Dropdown className="inline-flex md:hidden lg:hidden">更多</Dropdown>
</div>
```

**更新 SPEC**: `components/toolbar-spec.md` § 5

---

### 1.4 Drawer 元件 (2 項)

#### 1.4.1 多層抽屜的堆疊管理機制

**問題**: Drawer 與 Modal 巢狀時如何管理？

**前端決策**: **參照 modal-interaction-pattern.md 已確認的方案**

**解決方案**: 已在 `common/modal-interaction-pattern.md` § 5.3 解決

- Drawer 始終使用 `z-index: 1100` (高於所有 Modal)
- Drawer 可以疊加在 Modal 之上 (用於第 3 層互動)
- 關閉 Drawer 時焦點回到 Modal

**同步更新**: 直接引用 `modal-interaction-pattern.md` 決策

**更新 SPEC**: `components/drawer-spec.md` § 4 (引用 common spec)

---

#### 1.4.2 抽屜內容的預載入策略

**問題**: Drawer 內容何時載入？

**前端決策** (推薦方案):

**預載入策略矩陣**:

| Drawer 類型 | 載入時機 | 快取策略 | 理由 |
|------------|---------|---------|------|
| **事件詳情** | 開啟時載入 | 快取 5 分鐘 | 資料可能變更 |
| **資源詳情** | 開啟時載入 | 快取 10 分鐘 | 資料較穩定 |
| **操作日誌** | 開啟時載入 | 不快取 | 需即時資料 |
| **說明文件** | 預先載入 | 永久快取 | 靜態內容 |

**實作範例**:
```tsx
const DetailDrawer: React.FC<{ id: string; open: boolean }> = ({ id, open }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['incident-detail', id],
    queryFn: () => api.get(`/api/v1/incidents/${id}`),
    enabled: open, // 僅在開啟時載入
    staleTime: 5 * 60 * 1000, // 快取 5 分鐘
    cacheTime: 10 * 60 * 1000, // 保留 10 分鐘
  });

  return (
    <Drawer open={open}>
      {isLoading && <Skeleton />}
      {error && <ErrorState message={error.message} onRetry={refetch} />}
      {data && <DetailContent data={data} />}
    </Drawer>
  );
};
```

**快取失效提示**:
```tsx
// 顯示資料更新時間
<div className="drawer-header">
  <span>最後更新: {formatDistanceToNow(data.updatedAt)}</span>
  <Button size="small" icon={<RefreshIcon />} onClick={refetch}>
    刷新
  </Button>
</div>

// 資料過時警告
{isStale && (
  <Alert
    type="warning"
    message="資料可能過時，點擊刷新按鈕獲取最新資料"
    action={<Button onClick={refetch}>刷新</Button>}
  />
)}
```

**後端協作**: 使用 HTTP `Cache-Control` Header
```
Cache-Control: max-age=300, must-revalidate
ETag: "abc123"
```

**更新 SPEC**: `components/drawer-spec.md` § 5

---

### 1.5 Pagination 元件 (2 項)

#### 1.5.1 分頁資訊的持久化 (跨頁面保留)

**問題**: 離開列表頁再返回時，是否保留分頁狀態？

**前端決策** (推薦方案):

**持久化策略**: **URL Query String + SessionStorage 備份**

**優勢**:
- URL 可分享、可書籤
- 重新整理頁面後保留狀態
- 瀏覽器前進/後退按鈕正常運作

**實作範例**:
```tsx
const ListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 從 URL 讀取分頁資訊
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '20');
  const filters = JSON.parse(searchParams.get('filters') || '{}');

  // 更新分頁時同步至 URL
  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      page_size: pageSize.toString(),
      filters: JSON.stringify(filters),
    });
  };

  // 備份至 SessionStorage (防止 URL 過長)
  useEffect(() => {
    sessionStorage.setItem('list-page-state', JSON.stringify({
      page,
      pageSize,
      filters,
      timestamp: Date.now(),
    }));
  }, [page, pageSize, filters]);

  return (
    <Table
      dataSource={data}
      pagination={{
        current: page,
        pageSize,
        onChange: handlePageChange,
      }}
    />
  );
};
```

**URL 格式**:
```
/incidents?page=2&page_size=50&filters=%7B%22status%22%3A%22open%22%7D

解碼後:
/incidents?page=2&page_size=50&filters={"status":"open"}
```

**SessionStorage 備份** (當 filters 過於複雜時):
```tsx
// 儲存完整篩選條件
const saveState = () => {
  const state = {
    page,
    pageSize,
    filters,
    sortBy,
    sortOrder,
    selectedColumns,
  };
  sessionStorage.setItem(`list-state-${pageKey}`, JSON.stringify(state));
};

// 恢復狀態
const restoreState = () => {
  const saved = sessionStorage.getItem(`list-state-${pageKey}`);
  if (saved) {
    const state = JSON.parse(saved);
    // 檢查是否過期 (超過 30 分鐘則不恢復)
    if (Date.now() - state.timestamp < 30 * 60 * 1000) {
      return state;
    }
  }
  return null;
};
```

**跨頁導航恢復**:
```tsx
// 從列表頁進入詳情頁
<Link to={`/incidents/${id}`} state={{ returnPage: page, returnFilters: filters }}>
  查看詳情
</Link>

// 詳情頁返回列表頁
const navigate = useNavigate();
const location = useLocation();

const handleBack = () => {
  const { returnPage, returnFilters } = location.state || {};
  navigate('/incidents', {
    state: { page: returnPage, filters: returnFilters }
  });
};
```

**更新 SPEC**: `components/pagination-spec.md` § 4

---

#### 1.5.2 大資料量時的分頁策略 (前端或後端)

**問題**: 前端分頁或後端分頁？

**前端決策**: **參照 table-design-system.md 已確認的方案**

**解決方案**: 已在 `common/table-design-system.md` § 7.1 解決

- 資料量 > 1000 筆: 使用後端分頁 (Server-side Pagination)
- 單頁資料 > 100 筆: 啟用虛擬滾動 (react-window)
- 前端分頁僅用於小資料量 (< 1000 筆)

**決策矩陣**:

| 資料量 | 分頁策略 | 虛擬滾動 | API 呼叫 |
|-------|---------|---------|---------|
| < 1000 | 前端分頁 | 否 | 一次載入全部 |
| 1000-10000 | 後端分頁 | 是 (單頁 > 100) | 按需載入 |
| > 10000 | 後端分頁 | 是 | 按需載入 + Cursor |

**同步更新**: 直接引用 `table-design-system.md` 決策

**更新 SPEC**: `components/pagination-spec.md` § 5 (引用 common spec)

---

### 1.6 UnifiedSearchModal 元件 (2 項)

#### 1.6.1 不同頁面的篩選條件來源與格式統一機制

**問題**: 如何統一各頁面的篩選欄位定義？

**前端決策** (推薦方案):

**統一格式**: **JSON Schema 定義篩選欄位**

**Filter Schema 範例**:
```typescript
// 事件列表篩選 Schema
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
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
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
    {
      key: 'keyword',
      label: '關鍵字',
      type: 'text',
      placeholder: '搜尋事件 ID、標題或描述',
    },
  ],
};
```

**動態渲染表單元件**:
```tsx
const FilterForm: React.FC<{ schema: FilterSchema }> = ({ schema }) => {
  const [filters, setFilters] = useState({});

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'select':
        return (
          <Form.Item label={field.label} key={field.key}>
            <Select
              mode={field.multiple ? 'multiple' : undefined}
              options={field.options}
              onChange={(value) => setFilters({ ...filters, [field.key]: value })}
              defaultValue={field.defaultValue}
            />
          </Form.Item>
        );

      case 'user-select':
        return (
          <Form.Item label={field.label} key={field.key}>
            <UserSelect
              mode={field.multiple ? 'multiple' : undefined}
              api={field.api}
              onChange={(value) => setFilters({ ...filters, [field.key]: value })}
            />
          </Form.Item>
        );

      case 'date-range':
        return (
          <Form.Item label={field.label} key={field.key}>
            <DateRangePicker
              onChange={(value) => setFilters({ ...filters, [field.key]: value })}
              defaultValue={field.defaultValue}
            />
          </Form.Item>
        );

      case 'text':
        return (
          <Form.Item label={field.label} key={field.key}>
            <Input
              placeholder={field.placeholder}
              onChange={(e) => setFilters({ ...filters, [field.key]: e.target.value })}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Form>
      {schema.fields.map(renderField)}
    </Form>
  );
};
```

**使用範例**:
```tsx
// 事件列表頁
import { incidentFilterSchema } from '@/schemas/filters';

<UnifiedSearchModal
  schema={incidentFilterSchema}
  onSearch={(filters) => fetchData(filters)}
/>

// 資源列表頁
import { resourceFilterSchema } from '@/schemas/filters';

<UnifiedSearchModal
  schema={resourceFilterSchema}
  onSearch={(filters) => fetchData(filters)}
/>
```

**後端 API 格式統一**:
```typescript
// GET /api/v1/incidents?filters={"status":["open"],"severity":["critical"]}
// GET /api/v1/resources?filters={"type":["server"],"status":["online"]}

// 後端解析統一格式
interface FilterParams {
  [key: string]: string | string[] | number | DateRange;
}
```

**更新 SPEC**: `components/unified-search-modal-spec.md` § 4

---

#### 1.6.2 進階搜尋 (複雜條件組合) 的支援範圍

**問題**: 是否支援 AND/OR/NOT 邏輯組合？

**前端決策** (推薦方案):

**第一階段**: **簡化版 (AND 邏輯)** - 推薦優先實作

所有篩選條件使用 AND 邏輯組合 (最常見需求)

```
範例: status = "open" AND severity IN ["critical", "high"] AND assignee = "Alice"
```

**UI 設計** (簡化版):
```
┌─────────────────────────────────────┐
│ 進階搜尋                        [✕] │
├─────────────────────────────────────┤
│ 狀態:    ☑️ 進行中 ☐ 已解決 ☐ 已關閉│
│ 嚴重性:  ☑️ Critical ☑️ High ☐ Medium│
│ 負責人:  [Alice ▼]                  │
│ 建立時間: [最近 7 天 ▼]             │
│ 關鍵字:  [___________________]      │
├─────────────────────────────────────┤
│ 所有條件需同時滿足 (AND 邏輯)        │
├─────────────────────────────────────┤
│           [重置]  [搜尋]            │
└─────────────────────────────────────┘
```

**第二階段**: **進階版 (AND/OR/NOT)** - 未來擴展

支援複雜邏輯組合 (適用於進階使用者)

```
範例:
(status = "open" OR status = "in_progress")
AND
(severity = "critical" OR assignee = "Alice")
AND NOT
(team = "Platform")
```

**UI 設計** (進階版):
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

**實作建議**:
1. **第一階段** (MVP): 實作簡化版 (AND 邏輯)
2. **第二階段** (可選): 基於使用者反饋決定是否實作進階版

**資料結構** (進階版):
```typescript
interface FilterQuery {
  operator: 'AND' | 'OR';
  conditions: Array<{
    field: string;
    operator: '=' | '!=' | 'IN' | 'NOT IN' | '>' | '<';
    value: any;
  } | FilterQuery>; // 支援巢狀
}

// 範例
{
  operator: 'AND',
  conditions: [
    { field: 'status', operator: '=', value: 'open' },
    { field: 'severity', operator: 'IN', value: ['critical', 'high'] },
    {
      operator: 'OR',
      conditions: [
        { field: 'assignee', operator: '=', value: 'Alice' },
        { field: 'team', operator: '=', value: 'SRE' },
      ]
    }
  ]
}
```

**更新 SPEC**: `components/unified-search-modal-spec.md` § 5

---

### 1.7 QuickFilterBar 元件 (2 項)

#### 1.7.1 快速篩選與進階搜尋的整合方式

**問題**: 快速篩選與進階搜尋如何協同工作？

**前端決策** (推薦方案):

**整合策略**: **快速篩選自動填入進階搜尋 + AND 合併**

**UI 流程**:
```
1. 使用者點擊快速篩選「Critical」
   → 篩選條件: { severity: ['critical'] }

2. 使用者點擊進階搜尋按鈕
   → 進階搜尋 Modal 開啟，severity 欄位已預填 ['critical']

3. 使用者在進階搜尋中新增其他條件
   → 新增 status: ['open']
   → 合併條件: { severity: ['critical'], status: ['open'] }

4. 使用者點擊搜尋
   → 套用合併後的條件
```

**實作範例**:
```tsx
const ListPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  // 快速篩選
  const handleQuickFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  // 開啟進階搜尋時，傳入當前篩選條件
  const openAdvancedSearch = () => {
    setAdvancedSearchOpen(true);
  };

  // 進階搜尋結果合併
  const handleAdvancedSearch = (newFilters: FilterParams) => {
    // 合併快速篩選與進階搜尋結果 (AND 邏輯)
    setFilters({ ...filters, ...newFilters });
    setAdvancedSearchOpen(false);
  };

  return (
    <>
      <QuickFilterBar
        filters={filters}
        onFilter={handleQuickFilter}
        onAdvancedSearch={openAdvancedSearch}
      />

      <UnifiedSearchModal
        open={advancedSearchOpen}
        initialFilters={filters} // 傳入當前篩選條件
        onSearch={handleAdvancedSearch}
        onClose={() => setAdvancedSearchOpen(false)}
      />

      <Table data={data} />
    </>
  );
};
```

**QuickFilterBar 元件**:
```tsx
const QuickFilterBar: React.FC = ({ filters, onFilter, onAdvancedSearch }) => {
  return (
    <div className="quick-filter-bar">
      {/* 快速篩選按鈕 */}
      <Button
        type={filters.severity?.includes('critical') ? 'primary' : 'default'}
        onClick={() => onFilter('severity', ['critical'])}
      >
        Critical
      </Button>

      <Button
        type={filters.status?.includes('open') ? 'primary' : 'default'}
        onClick={() => onFilter('status', ['open'])}
      >
        進行中
      </Button>

      {/* 進階搜尋按鈕 */}
      <Button icon={<FilterIcon />} onClick={onAdvancedSearch}>
        進階搜尋
        {Object.keys(filters).length > 0 && ` (${Object.keys(filters).length})`}
      </Button>

      {/* 清除篩選 */}
      {Object.keys(filters).length > 0 && (
        <Button icon={<CloseIcon />} onClick={() => onFilter({})}>
          清除篩選
        </Button>
      )}
    </div>
  );
};
```

**視覺化篩選狀態**:
```
┌─────────────────────────────────────┐
│ [Critical] [High] [進行中] [進階搜尋] │
│  (已選)   (未選)  (已選)   (3 個條件) │
├─────────────────────────────────────┤
│ 當前篩選: Critical · 進行中 · 負責人=Alice │
│ [清除篩選]                           │
└─────────────────────────────────────┘
```

**更新 SPEC**: `components/quick-filter-bar-spec.md` § 4

---

#### 1.7.2 篩選狀態的 URL 同步機制

**問題**: 篩選條件是否同步至 URL？

**前端決策** (推薦方案):

**同步策略**: **URL Query String (與分頁持久化一致)**

**URL 格式**:
```
/incidents?filters={"severity":["critical"],"status":["open"]}&page=2&page_size=20
```

**實作範例** (與 Pagination 整合):
```tsx
const ListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 從 URL 解析篩選條件
  const filters = JSON.parse(searchParams.get('filters') || '{}');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '20');

  // 更新篩選條件並同步至 URL
  const updateFilters = (newFilters: FilterParams) => {
    setSearchParams({
      filters: JSON.stringify(newFilters),
      page: '1', // 重置至第一頁
      page_size: pageSize.toString(),
    });
  };

  // QuickFilter 點擊
  const handleQuickFilter = (key: string, value: any) => {
    updateFilters({ ...filters, [key]: value });
  };

  // 清除篩選
  const handleClearFilters = () => {
    setSearchParams({ page: '1', page_size: pageSize.toString() });
  };

  return (
    <>
      <QuickFilterBar
        filters={filters}
        onFilter={handleQuickFilter}
        onClear={handleClearFilters}
      />
      <Table data={data} />
    </>
  );
};
```

**URL 編碼處理**:
```tsx
// 序列化 (支援複雜物件)
const serializeFilters = (filters: FilterParams): string => {
  return encodeURIComponent(JSON.stringify(filters));
};

// 反序列化 (容錯處理)
const deserializeFilters = (encoded: string | null): FilterParams => {
  if (!encoded) return {};
  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch {
    return {};
  }
};
```

**URL 過長處理**:
```tsx
// 當 URL 長度 > 2000 時，使用 SessionStorage 備份
const updateFilters = (newFilters: FilterParams) => {
  const url = new URL(window.location.href);
  url.searchParams.set('filters', JSON.stringify(newFilters));

  if (url.href.length > 2000) {
    // URL 過長，使用 hash 方式
    const hash = hashCode(JSON.stringify(newFilters));
    sessionStorage.setItem(`filters-${hash}`, JSON.stringify(newFilters));
    setSearchParams({ filters_hash: hash, page: '1', page_size: '20' });
  } else {
    setSearchParams({
      filters: JSON.stringify(newFilters),
      page: '1',
      page_size: '20'
    });
  }
};
```

**分享功能**:
```tsx
const handleShareFilters = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  showToast('已複製篩選連結', 'success');
};

<Button icon={<ShareIcon />} onClick={handleShareFilters}>
  分享篩選
</Button>
```

**更新 SPEC**: `components/quick-filter-bar-spec.md` § 5

---

### 1.8 TableContainer 元件 (2 項)

#### 1.8.1 表格高度的自適應策略

**問題**: 表格高度如何自適應視窗大小？

**前端決策** (推薦方案):

**自適應策略**: **固定高度 + ResizeObserver 監聽**

**實作方案**:
```tsx
const TableContainer: React.FC = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(600);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        // 計算可用高度: 視窗高度 - 頂部偏移 - 底部預留 - 分頁高度
        const availableHeight = window.innerHeight - rect.top - 80 - 64;
        setTableHeight(Math.max(400, availableHeight)); // 最小 400px
      }
    };

    // 初始計算
    updateHeight();

    // 監聽視窗大小變化
    window.addEventListener('resize', updateHeight);

    // 使用 ResizeObserver 監聽容器變化
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="table-container">
      <div style={{ height: tableHeight, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};
```

**CSS 方案** (使用 CSS Grid):
```css
.page-layout {
  display: grid;
  grid-template-rows: auto auto 1fr auto; /* header, toolbar, table, pagination */
  height: 100vh;
}

.table-container {
  overflow: auto;
  min-height: 400px;
}
```

**Tailwind 方案**:
```tsx
<div className="flex flex-col h-screen">
  <Header /> {/* flex-none */}
  <Toolbar /> {/* flex-none */}
  <div className="flex-1 overflow-auto min-h-[400px]">
    <Table />
  </div>
  <Pagination /> {/* flex-none */}
</div>
```

**響應式斷點**:
```tsx
const getTableHeight = () => {
  const screenHeight = window.innerHeight;

  if (screenHeight < 768) {
    // 小螢幕: 固定高度 400px
    return 400;
  } else if (screenHeight < 1024) {
    // 中螢幕: 60% 視窗高度
    return screenHeight * 0.6;
  } else {
    // 大螢幕: 計算剩餘空間
    return screenHeight - headerHeight - toolbarHeight - paginationHeight - 80;
  }
};
```

**更新 SPEC**: `components/table-container-spec.md` § 4

---

#### 1.8.2 虛擬滾動的觸發條件

**問題**: 何時啟用虛擬滾動？

**前端決策**: **參照 table-design-system.md 已確認的方案**

**解決方案**: 已在 `common/table-design-system.md` § 11.2 解決

- 觸發條件: 單頁資料 > 100 筆
- 使用技術: react-window (FixedSizeList)
- 效能目標: 初次渲染 < 100ms, FPS > 55

**同步更新**: 直接引用 `table-design-system.md` 決策

**更新 SPEC**: `components/table-container-spec.md` § 5 (引用 common spec)

---

## 二、Common Specs 項目 (3 項)

---

### 2.1 table-design-system.md (2 項)

#### 2.1.1 表格固定列 (sticky rows) 的支援需求

**問題**: 是否支援釘選特定列至頂部？

**前端決策** (推薦方案):

**支援範圍**: **Sticky Header (已支援) + Sticky First Column (可選)**

**不支援**: Sticky Rows (釘選資料列)

**理由**:
- Sticky Header 已滿足大部分需求
- Sticky Rows 實作複雜 (與虛擬滾動衝突)
- 使用場景少 (列表頁通常不需要釘選資料列)

**如需類似功能**: 使用「置頂」功能 (後端排序)

**Sticky First Column 實作** (可選功能):
```tsx
// 固定第一欄 (如 Checkbox 或主要識別欄)
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

**CSS 實作**:
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

**更新 SPEC**: `common/table-design-system.md` § 12

---

#### 2.1.2 行內編輯 (inline edit) 的統一實作方式

**問題**: 表格行內編輯的觸發與儲存機制？

**前端決策** (推薦方案):

**觸發方式**: **點擊儲存格進入編輯模式**

**編輯完成觸發**:
- **Enter 鍵**: 儲存並進入下一列同欄位
- **Tab 鍵**: 儲存並進入右側欄位
- **失焦**: 儲存變更
- **ESC 鍵**: 取消編輯，恢復原值

**實作範例**:
```tsx
interface EditableCellProps {
  value: string;
  record: any;
  dataIndex: string;
  onSave: (record: any, dataIndex: string, value: string) => Promise<void>;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  record,
  dataIndex,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const save = async () => {
    try {
      await onSave(record, dataIndex, tempValue);
      setEditing(false);
    } catch (error) {
      showToast('儲存失敗', 'error');
      setTempValue(value); // 恢復原值
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      save();
      // TODO: 聚焦至下一列同欄位
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="editable-cell-input"
      />
    );
  }

  return (
    <div
      className="editable-cell"
      onClick={() => setEditing(true)}
    >
      {value || <span className="text-slate-500">點擊編輯</span>}
      <EditIcon className="editable-cell-icon" />
    </div>
  );
};
```

**Table 使用**:
```tsx
<Table
  columns={[
    {
      title: '事件標題',
      dataIndex: 'title',
      render: (text, record) => (
        <EditableCell
          value={text}
          record={record}
          dataIndex="title"
          onSave={handleCellSave}
        />
      ),
    },
  ]}
  dataSource={data}
/>
```

**儲存策略**:
```tsx
const handleCellSave = async (
  record: any,
  dataIndex: string,
  value: string
) => {
  // 樂觀更新: 先更新 UI
  const newData = data.map(item =>
    item.id === record.id ? { ...item, [dataIndex]: value } : item
  );
  setData(newData);

  try {
    // 呼叫 API 儲存
    await api.patch(`/api/v1/incidents/${record.id}`, {
      [dataIndex]: value,
    });
    showToast('儲存成功', 'success');
  } catch (error) {
    // 失敗時回滾
    setData(data);
    showToast('儲存失敗', 'error');
    throw error;
  }
};
```

**驗證失敗提示**:
```tsx
const EditableCell: React.FC<EditableCellProps> = ({ ... }) => {
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    // 前端驗證
    if (!tempValue.trim()) {
      setError('此欄位不可為空');
      return;
    }

    try {
      await onSave(record, dataIndex, tempValue);
      setEditing(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <>
      <Input {...inputProps} status={error ? 'error' : undefined} />
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </>
  );
};
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

.editable-cell-input {
  margin: -4px -8px;
}
```

**更新 SPEC**: `common/table-design-system.md` § 13

---

### 2.2 modal-interaction-pattern.md (1 項)

#### 2.2.1 Modal 內表單的自動儲存草稿機制

**問題**: 是否提供草稿自動儲存功能？

**前端決策** (推薦方案):

**草稿儲存策略**: **LocalStorage + 定時儲存**

**觸發時機**:
- 欄位變更後 2 秒自動儲存 (debounce)
- Modal 關閉前儲存 (beforeunload)
- 不觸發: 點擊「取消」按鈕時不儲存

**實作範例**:
```tsx
interface DraftFormProps {
  formKey: string; // 唯一識別 (如 'incident-create')
  children: React.ReactNode;
}

const DraftForm: React.FC<DraftFormProps> = ({ formKey, children }) => {
  const [form] = Form.useForm();
  const draftKey = `draft-${formKey}-${userId}`;

  // 載入草稿
  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const data = JSON.parse(draft);
        // 顯示恢復提示
        Modal.confirm({
          title: '發現未儲存的草稿',
          content: `上次編輯時間: ${formatDistanceToNow(data.timestamp)}`,
          okText: '恢復草稿',
          cancelText: '捨棄草稿',
          onOk: () => {
            form.setFieldsValue(data.values);
          },
          onCancel: () => {
            localStorage.removeItem(draftKey);
          },
        });
      } catch {
        localStorage.removeItem(draftKey);
      }
    }
  }, []);

  // 自動儲存草稿
  const saveDraft = useDebouncedCallback(() => {
    const values = form.getFieldsValue();
    localStorage.setItem(draftKey, JSON.stringify({
      values,
      timestamp: Date.now(),
    }));
  }, 2000); // 2 秒後儲存

  // 監聽欄位變更
  const handleValuesChange = () => {
    saveDraft();
  };

  // 提交成功後清除草稿
  const handleSubmit = async (values: any) => {
    await api.post('/api/v1/incidents', values);
    localStorage.removeItem(draftKey);
    showToast('建立成功', 'success');
  };

  return (
    <Form
      form={form}
      onValuesChange={handleValuesChange}
      onFinish={handleSubmit}
    >
      {children}
    </Form>
  );
};
```

**使用範例**:
```tsx
const CreateIncidentModal: React.FC = ({ open, onClose }) => {
  return (
    <Modal open={open} onCancel={onClose}>
      <DraftForm formKey="incident-create">
        <Form.Item label="標題" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <TextArea />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          建立
        </Button>
      </DraftForm>
    </Modal>
  );
};
```

**草稿管理**:
```tsx
// 草稿清單頁面 (可選功能)
const DraftListPage: React.FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    // 掃描 localStorage 中的草稿
    const allDrafts = Object.keys(localStorage)
      .filter(key => key.startsWith('draft-'))
      .map(key => {
        const data = JSON.parse(localStorage.getItem(key)!);
        return {
          key,
          formKey: key.replace('draft-', ''),
          timestamp: data.timestamp,
          values: data.values,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    setDrafts(allDrafts);
  }, []);

  return (
    <List
      dataSource={drafts}
      renderItem={(draft) => (
        <List.Item
          actions={[
            <Button onClick={() => restoreDraft(draft)}>恢復</Button>,
            <Button onClick={() => deleteDraft(draft)}>刪除</Button>,
          ]}
        >
          <List.Item.Meta
            title={draft.formKey}
            description={`上次編輯: ${formatDistanceToNow(draft.timestamp)}`}
          />
        </List.Item>
      )}
    />
  );
};
```

**過期草稿清理**:
```tsx
// 清理 7 天前的草稿
const cleanExpiredDrafts = () => {
  const now = Date.now();
  const expireTime = 7 * 24 * 60 * 60 * 1000; // 7 天

  Object.keys(localStorage)
    .filter(key => key.startsWith('draft-'))
    .forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (now - data.timestamp > expireTime) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
};

// 頁面載入時執行清理
useEffect(() => {
  cleanExpiredDrafts();
}, []);
```

**更新 SPEC**: `common/modal-interaction-pattern.md` § 8

---

## 三、Module Specs 項目 (2 項)

---

### 3.1 profile-preference-spec.md

#### 3.1.1 語言切換的即時生效範圍

**問題**: 切換語言後是否需要重新整理頁面？

**前端決策** (推薦方案):

**生效策略**: **即時生效 (無需重新整理)**

**實作方式**: 使用 React Context + i18n 熱更新

**實作範例**:
```tsx
// i18n 設定
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'en-US': { translation: enUS },
    },
    lng: localStorage.getItem('language') || 'zh-TW',
    fallbackLng: 'zh-TW',
    interpolation: { escapeValue: false },
  });

// 語言切換元件
const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = async (lang: string) => {
    // 1. 更新 i18n
    await i18n.changeLanguage(lang);

    // 2. 儲存至 localStorage
    localStorage.setItem('language', lang);

    // 3. 同步至後端 (使用者偏好)
    await api.put('/api/v1/users/me/preferences', { language: lang });

    // 4. 顯示成功提示
    showToast('語言已切換', 'success');

    // 無需重新整理頁面，React Context 自動更新所有元件
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      options={[
        { value: 'zh-TW', label: '繁體中文' },
        { value: 'en-US', label: 'English' },
        { value: 'ja-JP', label: '日本語' },
      ]}
    />
  );
};
```

**即時生效範圍**:
- ✅ 所有 UI 文案 (使用 `useTranslation()` 的元件)
- ✅ 動態內容 (使用 `t()` 函式的文字)
- ✅ 日期格式 (dayjs locale)
- ✅ 數字格式 (Intl.NumberFormat)
- ❌ 後端回傳的文字 (需重新載入資料)

**日期格式同步**:
```tsx
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';

const handleChange = async (lang: string) => {
  await i18n.changeLanguage(lang);

  // 同步 dayjs locale
  const dayjsLocale = {
    'zh-TW': 'zh-tw',
    'en-US': 'en',
    'ja-JP': 'ja',
  }[lang];
  dayjs.locale(dayjsLocale);

  // 同步 Ant Design locale
  const antdLocale = {
    'zh-TW': zhTW,
    'en-US': enUS,
    'ja-JP': jaJP,
  }[lang];
  ConfigProvider.config({ locale: antdLocale });
};
```

**特殊情況處理**:
```tsx
// 某些頁面需要重新載入資料 (如後端回傳的多語言內容)
const { data, refetch } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
});

const handleLanguageChange = async (lang: string) => {
  await i18n.changeLanguage(lang);

  // 重新載入包含後端文字的資料
  refetch();

  showToast('語言已切換，正在重新載入資料...', 'info');
};
```

**更新 SPEC**: `modules/profile-preference-spec.md` § 5

---

### 3.2 platform-layout-spec.md

#### 3.2.1 主題色變更的即時生效機制

**問題**: 修改主題色後如何即時生效？

**前端決策** (推薦方案):

**生效策略**: **CSS Variables 動態更新 (即時預覽)**

**實作方式**: 修改 CSS 自訂屬性 (CSS Custom Properties)

**實作範例**:
```tsx
// 主題色設定元件
const ThemeColorPicker: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#0284C7'); // sky-600
  const [previewMode, setPreviewMode] = useState(false);

  // 即時預覽
  const handleColorChange = (color: string) => {
    setPrimaryColor(color);

    if (previewMode) {
      applyThemeColor(color);
    }
  };

  // 套用主題色
  const applyThemeColor = (color: string) => {
    // 計算相關色階
    const colors = generateColorPalette(color);

    // 更新 CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors[600]);
    root.style.setProperty('--color-primary-hover', colors[700]);
    root.style.setProperty('--color-primary-active', colors[800]);
    root.style.setProperty('--color-primary-light', colors[100]);

    // 更新 Ant Design 主題
    ConfigProvider.config({
      theme: {
        token: {
          colorPrimary: color,
        },
      },
    });
  };

  // 儲存主題色
  const handleSave = async () => {
    try {
      await api.put('/api/v1/settings/theme', { primaryColor });

      // 儲存至 localStorage
      localStorage.setItem('theme-color', primaryColor);

      showToast('主題色已更新', 'success');
      setPreviewMode(false);
    } catch (error) {
      showToast('儲存失敗', 'error');
    }
  };

  // 取消預覽
  const handleCancel = () => {
    const savedColor = localStorage.getItem('theme-color') || '#0284C7';
    applyThemeColor(savedColor);
    setPrimaryColor(savedColor);
    setPreviewMode(false);
  };

  return (
    <div className="theme-color-picker">
      <label>主題色</label>
      <ColorPicker
        value={primaryColor}
        onChange={handleColorChange}
        showText
      />

      <Checkbox
        checked={previewMode}
        onChange={(e) => setPreviewMode(e.target.checked)}
      >
        即時預覽
      </Checkbox>

      <div className="preview-banner">
        <Alert
          type="info"
          message="預覽模式"
          description="目前正在預覽主題色效果，點擊「儲存」套用變更"
          showIcon
        />
      </div>

      <div className="actions">
        <Button onClick={handleCancel}>取消</Button>
        <Button type="primary" onClick={handleSave}>
          儲存
        </Button>
      </div>
    </div>
  );
};
```

**色階生成**:
```tsx
import Color from 'color';

const generateColorPalette = (baseColor: string) => {
  const color = Color(baseColor);

  return {
    50: color.lighten(0.4).hex(),
    100: color.lighten(0.3).hex(),
    200: color.lighten(0.2).hex(),
    300: color.lighten(0.1).hex(),
    400: color.lighten(0.05).hex(),
    500: color.hex(), // base
    600: color.darken(0.05).hex(),
    700: color.darken(0.1).hex(),
    800: color.darken(0.2).hex(),
    900: color.darken(0.3).hex(),
  };
};
```

**Tailwind 整合**:
```css
/* globals.css */
:root {
  --color-primary: #0284C7;
  --color-primary-hover: #0369A1;
  --color-primary-active: #075985;
  --color-primary-light: #E0F2FE;
}

/* Tailwind 配置 */
@layer utilities {
  .bg-primary {
    background-color: var(--color-primary);
  }
  .text-primary {
    color: var(--color-primary);
  }
  .border-primary {
    border-color: var(--color-primary);
  }
}
```

**載入時恢復主題色**:
```tsx
// App.tsx
useEffect(() => {
  const savedColor = localStorage.getItem('theme-color') || '#0284C7';
  applyThemeColor(savedColor);
}, []);
```

**更新 SPEC**: `modules/platform-layout-spec.md` § 6

---

## 四、更新 SPEC 文件清單

以下 SPEC 文件需要更新補充對應章節:

### Component Specs (8 個)

1. **components/modal-spec.md**
   - § 5: 巢狀模態框的顯示優先級 (Z-index + 焦點管理)
   - § 6: 模態框內容的生命週期管理 (延遲卸載策略)

2. **components/column-settings-modal-spec.md**
   - § 4: 欄位設定的儲存位置 (使用者級/團隊級選擇器)
   - § 5: 欄位排序的持久化策略 (點擊儲存 + 回滾機制)

3. **components/toolbar-spec.md**
   - § 4: 批次操作的權限控制機制 (隱藏/禁用策略)
   - § 5: 工具列響應式佈局 (更多選單收合)

4. **components/drawer-spec.md**
   - § 4: 多層抽屜的堆疊管理機制 (引用 common spec)
   - § 5: 抽屜內容的預載入策略 (快取策略矩陣)

5. **components/pagination-spec.md**
   - § 4: 分頁資訊的持久化 (URL + SessionStorage)
   - § 5: 大資料量時的分頁策略 (引用 common spec)

6. **components/unified-search-modal-spec.md**
   - § 4: 篩選條件格式統一機制 (JSON Schema)
   - § 5: 進階搜尋支援範圍 (簡化版 + 進階版)

7. **components/quick-filter-bar-spec.md**
   - § 4: 快速篩選與進階搜尋整合 (自動填入 + AND 合併)
   - § 5: 篩選狀態的 URL 同步機制 (Query String)

8. **components/table-container-spec.md**
   - § 4: 表格高度的自適應策略 (ResizeObserver)
   - § 5: 虛擬滾動的觸發條件 (引用 common spec)

### Common Specs (2 個)

9. **common/table-design-system.md**
   - § 12: 表格固定列支援需求 (Sticky Header + First Column)
   - § 13: 行內編輯統一實作方式 (點擊編輯 + Enter/Tab/ESC)

10. **common/modal-interaction-pattern.md**
    - § 8: Modal 內表單的自動儲存草稿機制 (LocalStorage + 定時儲存)

### Module Specs (2 個)

11. **modules/profile-preference-spec.md**
    - § 5: 語言切換的即時生效範圍 (i18n 熱更新 + dayjs locale)

12. **modules/platform-layout-spec.md**
    - § 6: 主題色變更的即時生效機制 (CSS Variables + 即時預覽)

---

## 五、總結

### 完成項目統計

| 階段 | 前端 UI/UX | 後端參數 | 跨域協作 | 總計 |
|------|-----------|---------|---------|------|
| **第一階段** | ✅ 15 | - | - | 15 |
| **第二階段** | 🔄 21 | - | - | 21 |
| **待處理** | - | ⏳ 32 | ⏳ 10 | 42 |
| **總計** | 36 | 32 | 10 | 78 |

### 第二階段實作建議

**優先級排序**:

**P0 (必須優先)** - 影響核心體驗 (4 項):
1. ✅ 表格行內編輯統一實作
2. ✅ 分頁資訊持久化 (URL + SessionStorage)
3. ✅ 響應式工具列佈局
4. ✅ 語言切換即時生效

**P1 (高優先級)** - 常用功能 (8 項):
5. ✅ 篩選條件格式統一 (JSON Schema)
6. ✅ 快速篩選與進階搜尋整合
7. ✅ 篩選狀態 URL 同步
8. ✅ 欄位設定儲存位置選擇
9. ✅ 欄位排序持久化
10. ✅ 批次操作權限控制
11. ✅ Drawer 預載入策略
12. ✅ 主題色即時生效

**P2 (中優先級)** - 進階功能 (6 項):
13. ✅ Modal 生命週期管理
14. ✅ Modal 草稿自動儲存
15. ✅ 進階搜尋複雜條件
16. ✅ 表格高度自適應
17. ✅ Modal Z-index 優先級
18. ✅ Sticky First Column

**P3 (低優先級)** - 優化項目 (3 項):
19. ✅ 多層 Drawer 堆疊管理 (引用現有規範)
20. ✅ 虛擬滾動觸發條件 (引用現有規範)
21. ✅ 大資料量分頁策略 (引用現有規範)

### 預計工時

- **P0 項目**: 3-4 人天
- **P1 項目**: 6-8 人天
- **P2 項目**: 4-6 人天
- **P3 項目**: 1-2 人天

**總計**: 14-20 人天 (約 3-4 週,假設 1 人全職投入)

### 後續步驟

1. **SPEC 更新** (2-3 天):
   - 根據本文件建議，更新 12 個 SPEC 檔案
   - 新增對應章節與決策記錄 (DR-XXX)
   - 標記 NEEDS CLARIFICATION 為已解決

2. **前端實作** (14-20 天):
   - 按優先級順序實作 21 項前端 UI/UX 功能
   - 建立可複用元件 (EditableCell, DraftForm 等)
   - 撰寫單元測試與整合測試

3. **文件審查** (1-2 天):
   - 前端團隊審查 SPEC 更新內容
   - 確認所有決策符合專案需求
   - 調整優先級排序

4. **第三階段啟動**:
   - 處理 32 項後端參數項目 (後端團隊)
   - 處理 10 項跨域協作項目 (前後端共同)

---

**文件完成日期**: 2025-10-06
**撰寫人員**: Claude Code (Spec Architect)
**審核狀態**: 待前端團隊審閱
