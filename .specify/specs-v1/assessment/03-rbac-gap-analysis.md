# RBAC 權限使用分析報告 (RBAC Gap Analysis)

**評估日期**: 2025-10-07
**評估者**: Spec Architect
**目標**: 分析現有權限控制與 RBAC 規範的對齊度

---

## 執行摘要

### 📊 整體評估

| 項目 | 現狀 | 規範要求 | 對齊度 | 優先級 |
|------|------|----------|--------|--------|
| **權限資料結構** | 🟡 Module + Actions | ✅ `resource:action` | 🟡 60% | P1 |
| **前端權限檢查** | ❌ 無統一機制 | ✅ `usePermissions()` Hook | 🔴 0% | P0 |
| **UI 權限控制** | ❌ 不一致 | ✅ 隱藏/禁用 + Tooltip | 🔴 10% | P0 |
| **API 權限驗證** | ❌ 無前端檢查 | ✅ Request Interceptor | 🔴 0% | P1 |
| **權限選擇器** | ✅ 樹狀結構 | ✅ 樹狀 + 分組 | 🟢 80% | P2 |
| **後端權限驗證** | ❓ 未知 | ✅ 必須實作 | - | - |

**總體對齊度**: **25%** 🔴

---

## 一、現有權限實作分析

### 1.1 權限資料結構

**發現**: `components/RoleEditModal.tsx` 中有權限管理 UI

```typescript
// 現有結構 (從程式碼推斷)
interface RolePermission {
  module: string;        // 例: "incidents", "resources"
  actions: string[];     // 例: ["read", "create", "update", "delete"]
}

interface AvailablePermission {
  module: string;
  availableActions: string[];
}
```

**規範要求**:
```typescript
// 應該是 resource:action 格式
type Permission = string;  // 例: "incidents:read", "incidents:create"

interface UserPermissions {
  permissions: Permission[];
}
```

#### 對齊度分析

| 項目 | 現狀 | 規範 | 符合度 | 說明 |
|------|------|------|--------|------|
| 資料結構 | Module + Actions 陣列 | `resource:action` 字串 | 🟡 60% | 需轉換格式 |
| 權限粒度 | Module 級別 | Resource 級別 | 🟢 100% | 概念一致 |
| 動作類型 | 自定義陣列 | 統一 CRUD | 🟢 80% | 基本一致 |

**轉換方案**:
```typescript
// 將現有格式轉換為規範格式
const convertToStandardFormat = (rolePerms: RolePermission[]): Permission[] => {
  return rolePerms.flatMap(rp =>
    rp.actions.map(action => `${rp.module}:${action}`)
  );
};

// 例:
// Input: [{ module: "incidents", actions: ["read", "create"] }]
// Output: ["incidents:read", "incidents:create"]
```

---

### 1.2 前端權限檢查

**現狀**: ❌ **無統一權限檢查機制**

從程式碼搜尋結果:
```bash
grep -r "permission\|hasPermission\|canAccess" hooks/*.ts
# 結果: No auth hooks found
```

**問題**:
1. ❌ 無 `usePermissions()` Hook
2. ❌ 無 `useAuth()` Hook
3. ❌ 無統一的權限檢查邏輯
4. ❌ UI 元件無權限控制

**影響**:
- 所有使用者看到相同的 UI
- 無權限的按鈕可點擊,呼叫 API 後才失敗
- 使用者體驗差

---

### 1.3 UI 權限控制

**現狀**: ❌ **幾乎無 UI 權限控制**

#### 檢查結果

搜尋常見權限控制模式:
```bash
# 搜尋條件渲染
grep -r "canDelete\|canEdit\|canCreate" components/*.tsx
# 結果: 未找到明顯的權限控制模式
```

**推論**:
- 大部分 UI 元件無權限控制
- 可能依賴後端 API 返回 403 錯誤
- 使用者會看到無權限的按鈕/選單

#### 應有的實作

**規範要求**:
```typescript
// 按鈕權限控制
const DeleteButton = () => {
  const { hasPermission } = usePermissions();

  if (!hasPermission('incidents:delete')) {
    return null;  // 完全無權限: 隱藏
  }

  return <Button danger>刪除</Button>;
};

// 或部分權限: 禁用 + Tooltip
const DeleteButton = ({ canDelete }) => {
  const { hasPermission } = usePermissions();

  const disabled = !hasPermission('incidents:delete') || !canDelete;
  const tooltipText = !hasPermission('incidents:delete')
    ? '您沒有權限刪除此項目'
    : '請先選擇要刪除的項目';

  return (
    <Tooltip title={disabled ? tooltipText : ''}>
      <Button danger disabled={disabled}>刪除</Button>
    </Tooltip>
  );
};
```

---

### 1.4 權限選擇器 UI

**現狀**: ✅ **已有權限選擇器實作**

**檔案**: `components/RoleEditModal.tsx`

```typescript
// 推斷實作 (部分程式碼)
const [permissions, setPermissions] = useState<RolePermission[]>([]);

useEffect(() => {
  api.get<AvailablePermission[]>('/iam/permissions')
    .then(response => {
      const initialPerms = response.data.map(p => ({
        module: p.module,
        actions: role?.permissions.find(rp => rp.module === p.module)?.actions || []
      }));
      setPermissions(initialPerms);
    });
}, [isOpen]);
```

**優勢**:
- ✅ 已實作權限選擇 UI
- ✅ 按 Module 分組
- ✅ 支援多選 Actions

**改善空間**:
- 🟡 格式需轉換為 `resource:action`
- 🟡 UI 可優化(樹狀結構、搜尋、全選)

---

## 二、RBAC 規範要求

### 2.1 核心概念

**參考**: `.specify/specs/common/rbac.md`

#### 權限格式

```typescript
// 統一格式: resource:action
type Permission = string;

// 範例
const permissions = [
  "incidents:read",
  "incidents:create",
  "incidents:update",
  "incidents:delete",
  "resources:read",
  "resources:update",
  "dashboards:create",
  // ...
];
```

#### 資源與動作

**標準資源** (Resources):
- `incidents` - 事件管理
- `resources` - 資源管理
- `automation` - 自動化
- `dashboards` - 儀表板
- `identity` - 身份管理
- `settings` - 系統設定
- ... (30+ 模組)

**標準動作** (Actions):
- `read` - 讀取/查看
- `create` - 建立
- `update` - 更新/編輯
- `delete` - 刪除
- `execute` - 執行 (自動化劇本)
- `export` - 匯出
- `import` - 匯入

---

### 2.2 前端實作要求

#### usePermissions Hook

```typescript
// hooks/usePermissions.ts
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // 檢查是否有此權限
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
```

#### UI 權限控制模式

**模式 1: 完全隱藏**
```typescript
const { hasPermission } = usePermissions();

if (!hasPermission('incidents:delete')) {
  return null;
}

return <DeleteButton />;
```

**模式 2: 禁用 + Tooltip**
```typescript
const { hasPermission } = usePermissions();
const disabled = !hasPermission('incidents:delete');

return (
  <Tooltip title={disabled ? "您沒有權限刪除此項目" : ""}>
    <Button disabled={disabled}>刪除</Button>
  </Tooltip>
);
```

**模式 3: 批次操作部分權限**
```typescript
const { hasPermission } = usePermissions();

const handleBatchDelete = () => {
  const deletableItems = selectedItems.filter(item =>
    hasPermission(`incidents:delete`) && item.canDelete
  );

  if (deletableItems.length === 0) {
    showToast('沒有可刪除的項目', 'warning');
    return;
  }

  if (deletableItems.length < selectedItems.length) {
    showConfirm({
      title: '部分項目無法刪除',
      content: `選擇了 ${selectedItems.length} 筆,僅能刪除 ${deletableItems.length} 筆`,
      onOk: () => performDelete(deletableItems),
    });
  } else {
    performDelete(deletableItems);
  }
};
```

---

## 三、缺口分析

### 3.1 關鍵缺失

| 缺失項目 | 影響 | 優先級 | 工作量 |
|----------|------|--------|--------|
| ❌ useAuth Hook | 無法取得使用者資訊 | P0 | 3 天 |
| ❌ usePermissions Hook | 無法檢查權限 | P0 | 2 天 |
| ❌ UI 權限控制 | 顯示無權限按鈕 | P0 | 5 天 |
| ❌ API 權限檢查 | 無效 API 呼叫 | P1 | 2 天 |
| 🟡 權限格式轉換 | 格式不統一 | P1 | 1 天 |

---

### 3.2 影響範圍

**高影響元件** (需權限控制):

| 元件類型 | 數量 | 範例 | 權限需求 |
|----------|------|------|----------|
| 刪除按鈕 | 20+ | Table Actions | `{resource}:delete` |
| 編輯按鈕 | 30+ | Table Actions | `{resource}:update` |
| 新增按鈕 | 15+ | Toolbar | `{resource}:create` |
| 批次操作 | 10+ | Toolbar | `{resource}:delete/update` |
| 匯入/匯出 | 8+ | Toolbar | `{resource}:import/export` |
| 設定頁面 | 10+ | Settings | `settings:update` |

**預估工作量**:
- P0 項目: 10 天
- P1 項目: 3 天
- **總計**: 約 13 天 (2.5 週)

---

## 四、實作建議

### 4.1 Phase 1: 基礎建設 (Week 1)

#### Step 1: 建立 AuthContext

```typescript
// contexts/AuthContext.tsx
interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];  // ["incidents:read", "incidents:create", ...]
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>(null!);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 從 localStorage 或 API 載入使用者資訊
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Step 2: 建立 useAuth Hook

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### Step 3: 建立 usePermissions Hook

```typescript
// hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]) => {
    return permissions.some(hasPermission);
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]) => {
    return permissions.every(hasPermission);
  }, [hasPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
```

**工作量**: 3 天

---

### 4.2 Phase 2: UI 權限控制 (Week 2)

#### Step 1: 建立權限控制元件

```typescript
// components/PermissionGate.tsx
interface PermissionGateProps {
  permission: string | string[];
  mode?: 'hide' | 'disable';
  fallback?: ReactNode;
  children: ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  mode = 'hide',
  fallback,
  children,
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const permitted = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!permitted) {
    if (mode === 'hide') {
      return fallback ? <>{fallback}</> : null;
    }

    // mode === 'disable'
    return (
      <Tooltip title="您沒有權限執行此操作">
        <span>
          {React.cloneElement(children as React.ReactElement, { disabled: true })}
        </span>
      </Tooltip>
    );
  }

  return <>{children}</>;
};
```

**使用範例**:
```typescript
// 完全隱藏
<PermissionGate permission="incidents:delete">
  <Button danger>刪除</Button>
</PermissionGate>

// 禁用 + Tooltip
<PermissionGate permission="incidents:delete" mode="disable">
  <Button danger>刪除</Button>
</PermissionGate>

// 多個權限 (任一即可)
<PermissionGate permission={["incidents:update", "incidents:delete"]}>
  <Dropdown />
</PermissionGate>
```

#### Step 2: 更新 Toolbar 元件

```typescript
// components/Toolbar.tsx 或頁面中的 Toolbar
const IncidentsListToolbar = () => {
  return (
    <div className="toolbar">
      <PermissionGate permission="incidents:create">
        <Button type="primary" icon={<PlusOutlined />}>
          新增事件
        </Button>
      </PermissionGate>

      <PermissionGate permission="incidents:import">
        <Button icon={<ImportOutlined />}>匯入</Button>
      </PermissionGate>

      <PermissionGate permission="incidents:export">
        <Button icon={<ExportOutlined />}>匯出</Button>
      </PermissionGate>

      {selectedCount > 0 && (
        <>
          <PermissionGate permission="incidents:delete" mode="disable">
            <Button danger icon={<DeleteOutlined />}>
              刪除 ({selectedCount})
            </Button>
          </PermissionGate>
        </>
      )}
    </div>
  );
};
```

#### Step 3: 更新 Table Actions

```typescript
// 表格操作列
const columns = [
  // ... 其他欄位
  {
    title: '操作',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <PermissionGate permission="incidents:update">
          <Button size="small" onClick={() => handleEdit(record)}>
            編輯
          </Button>
        </PermissionGate>

        <PermissionGate permission="incidents:delete" mode="disable">
          <Button size="small" danger onClick={() => handleDelete(record)}>
            刪除
          </Button>
        </PermissionGate>
      </Space>
    ),
  },
];
```

**工作量**: 5 天 (需更新 20+ 個頁面)

---

### 4.3 Phase 3: API 權限檢查 (Week 3)

```typescript
// services/api.ts (新增 request interceptor)
client.interceptors.request.use(
  (config) => {
    // 從 config.meta 取得權限需求
    const permission = config.meta?.permission;

    if (permission) {
      const user = getUserFromStorage();  // 或從 Context
      if (!user || !user.permissions.includes(permission)) {
        return Promise.reject(
          new ApiError('您沒有權限執行此操作', {
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
// 刪除操作前檢查權限
await api.delete(`/incidents/${id}`, {
  meta: { permission: 'incidents:delete' }
});

// 批次刪除
await api.post('/incidents/batch-delete', ids, {
  meta: { permission: 'incidents:delete' }
});
```

**工作量**: 2 天

---

### 4.4 Phase 4: 權限格式轉換 (Week 3)

```typescript
// utils/permissions.ts

// 轉換現有格式 → 標準格式
export const convertPermissions = (
  rolePerms: RolePermission[]
): string[] => {
  return rolePerms.flatMap(rp =>
    rp.actions.map(action => `${rp.module}:${action}`)
  );
};

// 轉換標準格式 → 現有格式 (用於編輯)
export const convertToRolePermissions = (
  permissions: string[]
): RolePermission[] => {
  const grouped = permissions.reduce((acc, perm) => {
    const [module, action] = perm.split(':');
    if (!acc[module]) acc[module] = [];
    acc[module].push(action);
    return acc;
  }, {} as Record<string, string[]>);

  return Object.entries(grouped).map(([module, actions]) => ({
    module,
    actions,
  }));
};
```

**工作量**: 1 天

---

## 五、測試策略

### 5.1 單元測試

```typescript
// hooks/usePermissions.test.ts
describe('usePermissions', () => {
  it('should check permission correctly', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => (
        <AuthProvider value={{ user: { permissions: ['incidents:read'] } }}>
          {children}
        </AuthProvider>
      ),
    });

    expect(result.current.hasPermission('incidents:read')).toBe(true);
    expect(result.current.hasPermission('incidents:delete')).toBe(false);
  });
});
```

### 5.2 整合測試

```typescript
// components/PermissionGate.test.tsx
describe('PermissionGate', () => {
  it('should hide children when no permission', () => {
    render(
      <AuthProvider value={{ user: { permissions: [] } }}>
        <PermissionGate permission="incidents:delete">
          <button>Delete</button>
        </PermissionGate>
      </AuthProvider>
    );

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should disable children when mode is disable', () => {
    render(
      <AuthProvider value={{ user: { permissions: [] } }}>
        <PermissionGate permission="incidents:delete" mode="disable">
          <button>Delete</button>
        </PermissionGate>
      </AuthProvider>
    );

    expect(screen.getByText('Delete')).toBeDisabled();
  });
});
```

---

## 六、總結

### 6.1 現狀評估

**RBAC 實作完整度**: 🔴 **不足** (25% 對齊度)

**主要問題**:
- ❌ 無 AuthContext 與 useAuth Hook
- ❌ 無 usePermissions Hook
- ❌ UI 幾乎無權限控制
- ❌ API 呼叫無權限檢查

**優勢**:
- ✅ 已有權限選擇器 UI
- ✅ 權限資料結構接近規範

### 6.2 改善建議

**總工作量**: 約 13 天 (2.5 週)

**優先順序**:
1. **P0 (Week 1)**: 建立 AuthContext + useAuth + usePermissions (3 天)
2. **P0 (Week 2)**: 實作 UI 權限控制 (5 天)
3. **P1 (Week 3)**: API 權限檢查 + 格式轉換 (3 天)
4. **P1 (Week 3)**: 測試與文件 (2 天)

**預期效果**:
- 對齊度提升至 90%+
- 使用者體驗顯著改善
- 減少無效 API 呼叫

---

**報告版本**: v1.0
**建立日期**: 2025-10-07
**下次更新**: P0 項目完成後
