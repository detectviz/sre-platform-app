# Quick Start: Platform Auth Implementation

## Overview

本指南幫助開發團隊快速理解和實作 Platform Auth 功能，包括多 IdP 管理、高可用性配置和敏感資訊保護。

## Prerequisites

- [x] 閱讀完 `specs/001-platform-auth/spec.md`
- [x] 熟悉 `constitution.md` 的安全和觀測性要求
- [x] 設定好開發環境（TypeScript, React, Grafana UI）

## Development Workflow

### 階段 1: 環境設定

```bash
# 1. 安裝依賴
npm install @grafana/ui react-hook-form zod axios

# 2. 啟動 Mock Server
npm run mock-server

# 3. 設定 TypeScript 型別
# 參考 data-model.md 中的實體定義
```

### 階段 2: 核心元件實作

```bash
# 1. 實作 IdP 清單元件
# 使用 Grafana UI Table 顯示 IdP 列表

# 2. 實作 IdP 配置表單
# 使用 React Hook Form + Zod 驗證

# 3. 實作敏感資訊欄位
# 遮蔽顯示 + 一鍵複製功能
```

### 階段 3: 功能整合

```bash
# 1. 整合連線測試功能
# 顯示測試結果和錯誤訊息

# 2. 實作故障轉移邏輯
# 監控 IdP 狀態並自動切換

# 3. 加入審計追蹤
# 記錄所有敏感操作
```

## Key Components Guide

### IdPList 元件
```typescript
// 使用 Grafana Table 顯示 IdP 列表
import { Table } from '@grafana/ui';

const columns = [
  { id: 'name', header: '名稱' },
  { id: 'type', header: '類型' },
  { id: 'status', header: '狀態' },
  { id: 'priority', header: '優先順序' },
  { id: 'actions', header: '操作' }
];
```

### IdPForm 元件
```typescript
// 動態表單基於 IdP 類型
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(1, '名稱不能為空'),
  type: z.enum(['keycloak', 'auth0', 'azure_ad']),
  // 動態欄位根據 type 新增
});
```

### SecretField 元件
```typescript
// 敏感資訊欄位組件
const [showSecret, setShowSecret] = useState(false);

const handleCopy = async () => {
  await navigator.clipboard.writeText(secretValue);
  // 顯示成功提示
};
```

## Configuration Examples

### 新增 Keycloak IdP
```json
{
  "name": "公司 Keycloak",
  "type": "keycloak",
  "configurations": [
    {
      "config_key": "client_id",
      "config_value": "platform-client",
      "data_type": "string",
      "is_required": true
    },
    {
      "config_key": "client_secret",
      "config_value": "encrypted-secret-value",
      "data_type": "string",
      "is_encrypted": true,
      "is_required": true
    }
  ]
}
```

### 高可用性配置
```json
{
  "primary_idp": "keycloak-main",
  "backup_idp": "auth0-backup",
  "failover_timeout": 5000,
  "retry_attempts": 3,
  "health_check_interval": 30000
}
```

## Security Best Practices

### 敏感資訊處理
- ✅ Client Secret 預設遮蔽顯示
- ✅ 使用一鍵複製功能避免明文顯示
- ✅ 後端加密儲存敏感資訊
- ✅ 審計所有敏感操作

### 權限控制
```typescript
// 使用權限檢查
const canManageIdp = usePermission('settings:auth:update');
const canViewSecrets = usePermission('settings:auth:secret:view');

if (!canManageIdp) {
  return <AccessDenied />;
}
```

## Testing Strategy

### 單元測試
```typescript
describe('IdPForm', () => {
  it('should validate required fields', () => {
    // 測試表單驗證
  });

  it('should handle dynamic fields', () => {
    // 測試動態欄位生成
  });
});
```

### 整合測試
```typescript
describe('IdP Management', () => {
  it('should create and test IdP connection', async () => {
    // 測試完整流程
    const idp = await createIdp(testData);
    const result = await testConnection(idp.id);
    expect(result.status).toBe('success');
  });
});
```

### E2E 測試
```typescript
// 使用 Playwright
test('IdP configuration workflow', async ({ page }) => {
  await page.goto('/settings/auth');
  await page.click('text=新增 IdP');
  // 完整使用者流程測試
});
```

## Troubleshooting

### 常見問題

#### Mock Server 連線問題
```bash
# 檢查 Mock Server 狀態
curl http://localhost:4000/api/v1/health

# 重新啟動服務
npm run mock-server
```

#### TypeScript 編譯錯誤
```typescript
// 檢查型別定義
import type { IdentityProvider } from '@/types/idp';

// 確保所有必要屬性
const idp: IdentityProvider = {
  id: '123',
  name: 'Test IdP',
  type: 'keycloak',
  is_active: true,
  priority_order: 1,
  // ... 其他必要屬性
};
```

#### 權限檢查失敗
```typescript
// 確認權限定義
const requiredPermissions = [
  'settings:auth:read',
  'settings:auth:create',
  'settings:auth:update'
];

// 檢查使用者權限
const hasPermission = usePermissions(requiredPermissions);
```

## Performance Optimization

### 快取策略
- IdP 配置快取 5 分鐘
- 連線測試結果快取 1 分鐘
- 使用者權限快取階段性

### 載入優化
- 懶載入 IdP 詳細配置
- 分頁載入大型列表
- 預載入常用 IdP

## Deployment Checklist

### 開發環境
- [ ] Mock Server 正常運行
- [ ] TypeScript 編譯通過
- [ ] ESLint 檢查通過
- [ ] 單元測試覆蓋 > 80%

### 測試環境
- [ ] 整合測試通過
- [ ] E2E 測試通過
- [ ] 效能測試符合要求
- [ ] 安全掃描通過

### 生產環境
- [ ] HTTPS 啟用
- [ ] 敏感資訊加密
- [ ] 審計日誌啟用
- [ ] 監控告警配置

## Next Steps

1. **實作核心元件**：從 IdPList 和 IdPForm 開始
2. **整合 API**：連接 Mock Server 驗證功能
3. **新增測試**：建立完整的測試覆蓋
4. **安全強化**：實作所有安全要求
5. **效能優化**：確保符合效能目標

## Resources

- 📋 **功能規格**: `specs/001-platform-auth/spec.md`
- 🏗️ **資料模型**: `specs/001-platform-auth/data-model.md`
- 🔌 **API 契約**: `specs/001-platform-auth/contracts/auth-api.yaml`
- 🔒 **憲法**: `.specify/memory/constitution.md`

記住：所有實作必須符合憲法要求，並通過完整的測試覆蓋！
