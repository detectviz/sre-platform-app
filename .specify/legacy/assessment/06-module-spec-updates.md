# Module SPEC 更新建議 (Module Spec Update Plan)

## 📋 文件資訊

| 項目 | 內容 |
|-----|------|
| **版本** | 1.0.0 |
| **建立日期** | 2025-10-07 |
| **目的** | 根據評估報告更新 33 個 Module SPEC |
| **待處理項目** | 68 個 NEEDS CLARIFICATION |
| **關聯報告** | 01-components, 02-api, 03-rbac, 04-priority-matrix, 05-roadmap |

---

## 🎯 更新策略

### 為什麼需要更新 Module SPEC?

**現況**:
- ✅ 33 個 Module SPEC 已定義完整業務需求
- ❌ 68 個 NEEDS CLARIFICATION 待解決
- ❌ 缺少與現有程式碼的對齊度分析
- ❌ 缺少重構優先級標註

**目標**:
- ✅ 解決所有 NEEDS CLARIFICATION (根據評估報告)
- ✅ 標註每個 Module 的重構需求 (P0/P1/P2)
- ✅ 建立 FR (功能需求) → 現有程式碼的追蹤矩陣
- ✅ 補充實作建議 (連結執行路線圖)

---

## 📊 Module 分類與優先級

### 核心模組 (需優先重構)

#### 1. **Incidents 模組** (3 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| incidents-list-spec.md | 65% 🟡 | P1 | 缺少虛擬滾動、React Query |
| incidents-alert-spec.md | 60% 🟡 | P1 | 缺少 RBAC 權限檢查 |
| incidents-silence-spec.md | 55% 🟡 | P2 | Modal 需統一為 BaseModal |

**待確認事項 (共 6 項)**:
- ✅ 事件自動關閉策略 → 已在 incidents-list-spec.md § 6 解決
- 🔄 AI 分析回應時間 SLA → 需補充：由 `_backend-parameters-spec.md` § 5.9 定義
- 🔄 批次操作數量上限 → 需補充：由 `_backend-parameters-spec.md` § 3 定義

**重構建議**:
```
P1.2 - React Query 整合
  ├─ IncidentListPage.tsx
  ├─ 使用 useApiQuery(['incidents', filters], '/incidents')
  └─ 移除既有 useState + useEffect

P1.4 - Virtual Scrolling
  ├─ 當事件 > 100 筆時啟用 VirtualTable
  └─ 整合至 TableContainer

P0.1 - RBAC 權限
  ├─ 使用 PermissionGate 包裹操作按鈕
  └─ 權限: incidents:read, incidents:create, incidents:update, incidents:delete
```

---

#### 2. **Identity 模組** (4 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| identity-role-spec.md | 30% 🔴 | P0 | **無 RBAC 實作，權限格式錯誤** |
| identity-personnel-spec.md | 35% 🔴 | P0 | 無 useAuth Hook |
| identity-team-spec.md | 50% 🟡 | P1 | Modal 需統一 |
| identity-audit-spec.md | 55% 🟡 | P2 | 缺少 OpenTelemetry 追蹤 |

**待確認事項 (共 8 項)**:
- ✅ 權限項目粒度與命名 → 已在 identity-role-spec.md § 8 解決
- 🔄 角色變更生效時機 → 需補充：**立即生效 + JWT Token 刷新機制**
- 🔄 人員停用後的資料處理 → 需補充：軟刪除 (soft delete) + 180 天保留期

**重構建議**:
```
P0.1 - RBAC 系統建立 (最高優先級!)
  ├─ contexts/AuthContext.tsx (新建)
  ├─ hooks/useAuth.ts (新建)
  ├─ hooks/usePermissions.ts (新建)
  ├─ components/PermissionGate.tsx (新建)
  └─ 轉換權限格式: { module, actions }[] → "resource:action"

P1.1 - BaseModal 統一
  ├─ RoleEditModal → 使用 BaseModal
  ├─ PersonnelEditModal → 使用 BaseModal
  └─ TeamEditModal → 使用 BaseModal
```

**權限格式轉換範例**:
```typescript
// 現有格式 (錯誤)
interface RolePermission {
  module: string;        // "incidents"
  actions: string[];     // ["read", "create"]
}

// 目標格式 (正確)
type Permission = string;  // "incidents:read", "incidents:create"

// 轉換邏輯
const convertPermissions = (oldPerms: RolePermission[]): Permission[] => {
  return oldPerms.flatMap(p =>
    p.actions.map(action => `${p.module}:${action}`)
  );
};
```

---

#### 3. **Resources 模組** (5 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| resources-datasource-spec.md | 60% 🟡 | P1 | API 格式需修正 |
| resources-list-spec.md | 70% 🟡 | P1 | 需虛擬滾動 (500+ 筆) |
| resources-topology-spec.md | 50% 🟡 | P2 | 效能問題 |
| resources-group-spec.md | 65% 🟡 | P2 | Modal 統一 |
| resources-auto-discovery-spec.md | 55% 🟡 | P2 | WebSocket 整合 |
| resources-discovery-spec.md | 55% 🟡 | P2 | 狀態管理 |

**待確認事項 (共 12 項)**:
- 🔄 敏感資料遮罩策略 → 已在 resources-datasource-spec.md § 6 解決
- 🔄 拓撲圖效能優化 (>1000 節點) → 需補充：**使用 Canvas 渲染 + 虛擬化**
- 🔄 自動發現頻率與策略 → 需補充：由 `_backend-parameters-spec.md` § 5.4 定義

**重構建議**:
```
P0.2 - API 格式修正
  ├─ 修正 services/api.ts 雙重包裝問題
  └─ 影響所有 Resources API 呼叫

P1.4 - Virtual Scrolling
  ├─ ResourceListPage.tsx (500+ 筆資源)
  └─ 使用 VirtualTable

P2.1 - OpenTelemetry
  ├─ 追蹤拓撲圖渲染時間
  └─ 追蹤自動發現執行時間
```

---

#### 4. **Notification 模組** (3 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| notification-strategy-spec.md | 55% 🟡 | P1 | 複雜表單需優化 |
| notification-channel-spec.md | 60% 🟡 | P2 | Modal 統一 |
| notification-history-spec.md | 65% 🟡 | P2 | 虛擬滾動 |

**待確認事項 (共 6 項)**:
- 🔄 通知優先級計算邏輯 → 需補充：由 `_backend-parameters-spec.md` § 5.1 定義
- 🔄 通知失敗重試策略 → 需補充：指數退避 (1s, 2s, 4s, 8s) + 最多 3 次
- 🔄 通知歷史保留期限 → 需補充：90 天 (可由 `_backend-parameters-spec.md` § 2 配置)

---

#### 5. **Dashboard 模組** (2 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| dashboards-list-spec.md | 60% 🟡 | P1 | React Query 整合 |
| dashboards-template-spec.md | 55% 🟡 | P2 | Modal 統一 |

**待確認事項 (共 4 項)**:
- 🔄 Dashboard 權限繼承規則 → 需補充：**Team > User > Public (優先級遞減)**
- 🔄 模板變數驗證規則 → 需補充：正規表達式 `^[a-zA-Z_][a-zA-Z0-9_]*$`

---

#### 6. **Platform 模組** (6 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| platform-auth-spec.md | 25% 🔴 | P0 | **無 AuthContext 實作** |
| platform-layout-spec.md | 70% 🟡 | P1 | Theme 整合 |
| platform-license-spec.md | 60% 🟡 | P2 | API 格式 |
| platform-grafana-spec.md | 65% 🟡 | P2 | 嵌入權限 |
| platform-mail-spec.md | 55% 🟡 | P2 | 測試連線 UI |
| platform-tag-spec.md | 60% 🟡 | P2 | Tag 管理 |

**待確認事項 (共 12 項)**:
- 🔄 SSO 整合方式 → 需補充：**OAuth 2.0 + OIDC (支援 Google, Azure AD, Okta)**
- 🔄 Session 過期策略 → 需補充：30 分鐘 idle timeout + 自動續期
- 🔄 Logo 圖片限制 → ✅ 已解決：PNG/SVG, 最大 2MB, 512x512px

**重構建議**:
```
P0.1 - AuthContext 建立
  ├─ platform-auth-spec.md 直接受益
  ├─ 實作 login/logout/refreshToken
  └─ 整合 SSO (OAuth 2.0)

P1.1 - BaseModal
  ├─ LicenseUploadModal → 使用 BaseModal
  └─ MailTestModal → 使用 BaseModal
```

---

#### 7. **Profile 模組** (3 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| profile-preference-spec.md | 65% 🟡 | P1 | 通知偏好整合 |
| profile-info-spec.md | 70% 🟡 | P2 | 頭像上傳 |
| profile-security-spec.md | 60% 🟡 | P2 | 密碼強度檢查 |

**待確認事項 (共 6 項)**:
- ✅ 通知偏好優先級 → 已解決：參見 `_backend-parameters-spec.md` § 5.1
- 🔄 頭像上傳大小限制 → 需補充：2MB, 支援 JPG/PNG, 自動壓縮至 256x256px
- 🔄 密碼複雜度要求 → 需補充：**至少 8 碼 + 大小寫 + 數字 + 特殊符號**

---

#### 8. **Automation 模組** (3 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| automation-playbook-spec.md | 55% 🟡 | P1 | 複雜表單 |
| automation-trigger-spec.md | 60% 🟡 | P2 | 條件編輯器 |
| automation-history-spec.md | 65% 🟡 | P2 | 虛擬滾動 |

**待確認事項 (共 6 項)**:
- 🔄 Playbook 執行逾時限制 → 需補充：預設 30 分鐘 (可配置至 2 小時)
- 🔄 Trigger 條件語法驗證 → 需補充：使用 JSONLogic 格式
- 🔄 執行歷史保留期限 → 需補充：180 天

---

#### 9. **Insights 模組** (3 個 SPEC)
| 檔案 | 對齊度 | 重構優先級 | 主要問題 |
|-----|-------|----------|---------|
| insights-capacity-spec.md | 50% 🟡 | P2 | 圖表效能 |
| insights-log-spec.md | 60% 🟡 | P2 | 虛擬滾動 |
| insights-backtesting-spec.md | 55% 🟡 | P2 | 複雜計算 |

**待確認事項 (共 6 項)**:
- 🔄 容量預測演算法 → 需補充：**線性回歸 + 移動平均 (可配置)**
- 🔄 日誌查詢語法 → 需補充：支援 Lucene Query Syntax
- 🔄 回測時間範圍限制 → 需補充：最多 1 年

---

## 🔧 統一更新範本

所有 Module SPEC 新增以下章節:

### 新增章節: 九、重構建議 (Refactoring Recommendations)

```markdown
## 九、重構建議 (Refactoring Recommendations)

**評估日期**: 2025-10-07
**對齊度**: XX% 🟡
**優先級**: PX

### 現況分析

**已實作功能**:
- ✅ [列出符合 SPEC 的功能]

**缺失功能**:
- ❌ [列出需要補充的功能]

**技術債**:
- ⚠️ [列出需要重構的項目]

### 重構項目

#### RX.1 - [重構項目名稱]
**優先級**: P0/P1/P2
**工作量**: Xh
**關聯**: [連結到 04-refactoring-priority-matrix.md § PX.X]

**變更內容**:
- [具體變更說明]

**程式碼範例**:
```typescript
// 修正前
// ...

// 修正後
// ...
```

**測試案例**:
- [ ] [測試項目]

**相依性**:
- [列出前置項目]

### 實作檢查清單

- [ ] 所有 FR (功能需求) 已實作
- [ ] 所有 NEEDS CLARIFICATION 已解決
- [ ] 單元測試覆蓋率 > 80%
- [ ] RBAC 權限檢查完成
- [ ] 符合 API Contract SPEC
- [ ] 符合 UI/UX SPEC
```

---

## 📝 NEEDS CLARIFICATION 統一解決方案

### 類別 1: 後端參數配置 (已有 SPEC 可參照)

**問題範例**:
- 自動關閉策略、輪詢間隔、重試次數、保留期限、並發限制...

**統一解法**:
```markdown
- ✅ ~~[NEEDS CLARIFICATION: XXX]~~ → **已解決: 由 `_backend-parameters-spec.md` § X.X 定義**
  - API: `GET /api/v1/config/xxx`
  - 前端: 從 API 取得參數，動態調整行為
  - 範例: `retentionDays`, `maxConcurrent`, `pollingInterval`
```

**影響的 Module** (約 35 項):
- 事件自動關閉策略 (incidents-list)
- 通知重試次數 (notification-strategy)
- 日誌保留期限 (insights-log)
- 批次操作上限 (incidents-list, resources-list)

---

### 類別 2: RBAC 權限相關 (P0 必須解決)

**問題範例**:
- 角色變更生效時機、權限粒度、權限繼承規則...

**統一解法**:
```markdown
- ✅ ~~[NEEDS CLARIFICATION: 角色變更生效時機]~~ → **已解決: 立即生效 + JWT Token 刷新**
  - 實作: 角色變更後立即呼叫 `POST /api/v1/auth/refresh-token`
  - 前端: 更新 AuthContext，重新檢查所有權限
  - UX: 顯示 Toast 「權限已更新，請重新整理頁面」
```

**影響的 Module** (約 8 項):
- identity-role-spec.md
- identity-personnel-spec.md
- platform-auth-spec.md

---

### 類別 3: UI/UX 設計決策 (前端決定)

**問題範例**:
- Modal 關閉動畫時長、Toast 顯示時間、圖示選擇...

**統一解法**:
```markdown
- ✅ ~~[NEEDS CLARIFICATION: Modal 關閉動畫]~~ → **已解決: 300ms 淡出動畫 (Ant Design 預設)**
  - 實作: 參見 `_collaboration-spec.md` § 2
  - BaseModal 自動處理延遲卸載
```

**影響的 Module** (約 10 項):
- 所有使用 Modal 的 Module

---

### 類別 4: API 契約相關 (需查閱 _api-contract-spec.md)

**問題範例**:
- API 回應格式、錯誤碼定義、分頁策略...

**統一解法**:
```markdown
- ✅ ~~[NEEDS CLARIFICATION: API 分頁格式]~~ → **已解決: 參見 `_api-contract-spec.md` § 2**
  - Request: `?page=1&pageSize=20`
  - Response: `{ data: [...], meta: { total, page, pageSize } }`
```

**影響的 Module** (約 15 項):
- 所有列表類 Module

---

## 🎯 更新執行計畫

### 階段 1: 高優先級 Module (Week 1-2)

**更新 Module**:
1. **identity-role-spec.md** (P0)
   - 補充 RBAC 實作建議
   - 解決權限格式、生效時機 NEEDS CLARIFICATION
   - 連結到 P0.1 RBAC 系統建立

2. **identity-personnel-spec.md** (P0)
   - 補充 useAuth Hook 使用範例
   - 解決人員停用處理 NEEDS CLARIFICATION

3. **platform-auth-spec.md** (P0)
   - 補充 AuthContext 完整實作
   - 解決 SSO、Session 過期 NEEDS CLARIFICATION

**工作量**: 6-8 小時

---

### 階段 2: 核心業務 Module (Week 3-4)

**更新 Module**:
1. **incidents-list-spec.md** (P1)
   - 補充 React Query + Virtual Scrolling 實作
   - 解決 AI 分析、批次操作 NEEDS CLARIFICATION

2. **resources-list-spec.md** (P1)
   - 補充 Virtual Scrolling 實作
   - 解決拓撲圖效能 NEEDS CLARIFICATION

3. **notification-strategy-spec.md** (P1)
   - 補充通知優先級、重試策略
   - 連結到 `_backend-parameters-spec.md`

**工作量**: 8-10 小時

---

### 階段 3: 其他 Module (Week 5-6)

**批次更新**:
- 所有 P2 Module (20+ 個)
- 統一補充「九、重構建議」章節
- 解決剩餘 NEEDS CLARIFICATION

**工作量**: 12-16 小時

---

## ✅ 更新檢查清單

每個 Module SPEC 更新後需確認:

- [ ] 所有 NEEDS CLARIFICATION 已解決或標註參考文件
- [ ] 新增「九、重構建議」章節
- [ ] 標註對齊度與優先級 (P0/P1/P2)
- [ ] 連結到執行路線圖相關項目
- [ ] 補充程式碼範例 (至少 1 個)
- [ ] 補充測試案例 (FR 對應)
- [ ] 更新決策記錄 (DR-XXX)

---

## 🔗 相關文件

- [Components 對齊度分析](./01-components-gap-analysis.md)
- [API 呼叫格式分析](./02-api-gap-analysis.md)
- [RBAC 權限使用分析](./03-rbac-gap-analysis.md)
- [重構優先級矩陣](./04-refactoring-priority-matrix.md)
- [執行路線圖](./05-execution-roadmap.md)
- [API Contract SPEC](../specs/_api-contract-spec.md)
- [Backend Parameters SPEC](../specs/_backend-parameters-spec.md)
- [Collaboration SPEC](../specs/_collaboration-spec.md)

---

## 📊 進度追蹤

| 階段 | Module 數量 | 狀態 | 完成日期 |
|-----|-----------|------|---------|
| 階段 1 (P0) | 3 個 | 📝 待開始 | - |
| 階段 2 (P1) | 10 個 | 📝 待開始 | - |
| 階段 3 (P2) | 20 個 | 📝 待開始 | - |

**總進度**: 0/33 (0%)

---

**建立日期**: 2025-10-07
**負責人**: [待指派]
**狀態**: 📝 規劃中
