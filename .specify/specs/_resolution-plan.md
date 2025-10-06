# 待處理項目解決方案建議書（前端規格專用）

**文件版本**: 1.0.0
**建立日期**: 2025-10-06
**狀態**: Draft
**依據**: `.specify/specs/_review.md`
**範圍**: **僅前端 UI/UX 規格，不含後端 API 內部邏輯**

---

## ⚠️ 重要聲明

本文件**僅處理前端層面**的待確認項目：

### ✅ 前端職責範圍
- 使用者互動流程 (User Flow)
- UI 元件行為與狀態
- 前端資料驗證與錯誤處理
- 使用者體驗 (UX) 設計決策
- **前端顯示邏輯** (如何呈現後端提供的資料)

### ❌ 後端職責範圍（不在本文件）
- **後端 API 實作細節**
- **資料庫設計**
- **伺服器端邏輯**
- **資料/設定性參數**（如：並行上限、保留天數、演算法選擇等）

### 🔄 後端參數傳遞原則
對於**純資料/設定參數**（不涉及 UI 控制）：
- 後端全權決策並定義參數值
- 透過 API 回傳給前端
- 前端**僅負責顯示**，不參與決策

**範例**：
- ❌ 前端不決策：「並行上限為 5」
- ✅ 前端僅顯示：「目前執行中任務：{runningCount}/{maxConcurrent}」（maxConcurrent 由 API 提供）

---

## 一、執行摘要

本文件針對**前端規格審查**中發現的 40 個 NEEDS CLARIFICATION 項目進行分類：

### 📊 項目分類

| 類別 | 數量 | 處理方式 |
|------|------|----------|
| **前端 UI/UX 決策** | 15 項 | 本文件提供解決方案 |
| **後端參數設定** | 20 項 | 後端決策，前端僅顯示 |
| **跨域協作** | 5 項 | 需前後端共同討論 |

### ✅ 前端決策項目（15 項）

- 🔴 **前端高優先級 (5 項)** - 核心 UI/UX 體驗
- 🟠 **UI/UX 設計決策 (4 項)** - 互動流程設計
- 🟡 **前端技術選型 (3 項)** - 實作方案選擇
- 🟢 **顯示規則 (3 項)** - 介面呈現標準

### 🔄 後端參數（前端僅顯示，20 項）

以下項目**由後端決策**，前端透過 API 接收並顯示：
- 並行任務上限 (maxConcurrent)
- 資料保留天數 (retentionDays)
- 自動關閉時長 (autoCloseAfter)
- 策略優先級數值 (priority)
- 拓撲更新頻率 (updateInterval)
- 預測演算法類型 (algorithm)
- 告警閾值預設值 (defaultThreshold)
- 靜音時長範圍 (silenceDuration)
- 權限粒度定義 (permissionGranularity)
- 加密演算法 (encryptionAlgorithm)
- SSO 協定類型 (ssoProtocol)
- 軟刪除保留期 (softDeleteRetention)
- 群組層級上限 (maxGroupLevel)
- 探索任務逾時 (discoveryTimeout)
- 標籤值長度限制 (tagMaxLength)
- 劇本步驟上限 (maxPlaybookSteps)
- 資料歸檔策略 (archivePolicy)
- 頻率限制配額 (rateLimit)
- 快取過期時間 (cacheTTL)
- 重試次數上限 (maxRetries)

---

## 二、前端高優先級項目 (P0)

> **注意**：本節僅涵蓋前端 UI/UX 決策。權限粒度定義、並行上限等**資料參數由後端決策**。

### 2.1 權限選擇器 UI 設計 🔴

**前端問題**: `identity-role-spec.md` 中前端如何顯示與選擇權限項目未明確。

**影響範圍**: 角色管理、團隊管理等權限配置介面

**前端決策點**:

#### 選項 A: 樹狀結構選擇器 (推薦)
```
UI 結構:
├─ 📦 incidents (模組)
│  ├─ ☑️ view (檢視)
│  ├─ ☑️ create (建立)
│  ├─ ☑️ update (更新)
│  └─ ☐ delete (刪除)
├─ 📦 resources (模組)
   └─ ...

互動行為:
- 點擊模組名稱 → 全選/取消全選該模組權限
- 支援搜尋過濾權限項目
- 已選權限顯示標記數量 (如: incidents (3/4))
```

#### 選項 B: 分組 Checkbox 列表
```
UI 結構:
[incidents 事件管理]
☑️ 檢視事件  ☑️ 建立事件  ☐ 刪除事件

[resources 資源管理]
☑️ 檢視資源  ☑️ 編輯資源  ☐ 刪除資源
```

**推薦**: **選項 A (樹狀結構)**
- 更清晰的層級關係
- 支援大量權限項目
- 符合企業級應用習慣

**前端實作要點**:
1. 使用 Ant Design Tree Component
2. **權限資料結構以 API 回傳為準**,前端僅負責渲染
3. 搜尋功能使用前端過濾 (lodash filter)
4. 選中狀態儲存為 `string[]` (權限 key 陣列)

**後端提供資料格式範例**:
```typescript
// API: GET /api/v1/permissions/tree
{
  "permissions": [
    {
      "module": "incidents",
      "label": "事件管理",
      "actions": [
        { "key": "incidents:view", "label": "檢視" },
        { "key": "incidents:create", "label": "建立" },
        { "key": "incidents:delete", "label": "刪除" }
      ]
    }
  ]
}
```

**前端僅決策**: UI 佈局、互動方式、搜尋邏輯
**後端決策**: 權限粒度、命名規範、繼承規則

**決策期限**: 1 週內

---

### 2.2 錯誤處理 UI/UX 策略 🔴

**前端問題**: 當後端服務失敗時,前端如何優雅降級與提示使用者。

**影響範圍**: SSO、Grafana、郵件等整合模組的前端介面

**前端決策點**:

#### UI 降級策略矩陣 (推薦)

| 前端場景 | 錯誤情境 | UI 降級方案 | 使用者提示 |
|----------|----------|-------------|------------|
| **SSO 登入** | API 無回應 | 顯示「使用本地帳號」按鈕 | "SSO 服務暫時無法使用,請使用本地帳號登入" |
| **Grafana 圖表** | iframe 載入失敗 | 顯示佔位圖 + 重試按鈕 | "圖表載入失敗,點擊重試" |
| **Grafana 圖表** | 長時間無回應 | 顯示骨架屏 + 取消按鈕 | "載入中... (可點擊取消)" |
| **郵件測試** | 發送失敗 | Toast 錯誤提示 | "測試郵件發送失敗: {錯誤訊息}" |
| **批次操作** | 部分失敗 | Modal 顯示成功/失敗清單 | "成功 8 筆,失敗 2 筆,點擊查看詳情" |

**前端錯誤邊界設計**:
```tsx
// 整合模組錯誤邊界
<ErrorBoundary
  fallback={(error) => (
    <div className="error-state">
      <Icon name="alert-circle" />
      <p>服務暫時無法使用</p>
      <Button onClick={retry}>重試</Button>
      <Button variant="ghost" onClick={useFallback}>
        使用替代方案
      </Button>
    </div>
  )}
>
  <GrafanaIframe />
</ErrorBoundary>
```

**前端重試策略**:
- 使用者主動重試: 顯示「重試」按鈕
- 自動重試 (限 1 次): 顯示 Loading 狀態
- 禁止無限自動重試 (避免 API 轟炸)

**決策期限**: 1 週內

---

### 2.3 並行任務 UI 狀態顯示 🔴

**前端問題**: 當使用者觸發多個耗時任務時,前端如何顯示任務狀態與限制。

**影響範圍**: 自動化劇本、AI 分析、資源探索等耗時操作

> **後端參數**：並行上限 (maxConcurrent) 由後端決策並透過 API 提供

**前端決策點**:

#### UI 任務狀態顯示方案 (推薦)

**方案 A: 任務中心 (Task Center) - 推薦**
```
UI 位置: 右上角鈴鐺旁新增「任務」圖示

點擊展開:
┌─────────────────────────────┐
│ 🔄 執行中 (2)  ✅ 已完成 (5) │
├─────────────────────────────┤
│ 🔄 分析事件 INC-001          │
│    進度: 80% | 剩餘 30 秒    │
│    [取消]                    │
├─────────────────────────────┤
│ 🔄 執行劇本 Playbook-5       │
│    步驟 3/5 | 剩餘 1 分鐘    │
│    [取消]                    │
└─────────────────────────────┘

超過限制時:
❌ 無法啟動新任務
   目前有 3 個任務執行中 (上限 3)
   請等待任務完成或取消現有任務
```

**方案 B: 頁面內進度條**
```
每個頁面顯示該頁面相關任務:

[自動化劇本頁]
┌─────────────────────────────┐
│ ⚠️ 執行中的劇本 (2/5)        │
│ • Playbook-5: 步驟 3/5       │
│ • Playbook-8: 步驟 1/3       │
└─────────────────────────────┘
```

**推薦**: **方案 A (任務中心)**
- 統一管理所有任務
- 跨頁面可見
- 符合現代應用習慣

**前端行為規則**:
```typescript
// 並行上限由 API 提供
const { maxConcurrent, runningTasks } = await api.get('/tasks/status');

// 觸發新任務前檢查
if (runningTasks.length >= maxConcurrent) {
  showToast(
    `目前有 ${runningTasks.length} 個任務執行中 (上限 ${maxConcurrent}),請稍後再試`,
    'warning'
  );
  return;
}

// 顯示預估時間 (由 API 回傳)
<div>預估完成時間: {task.estimated_completion}</div>

// 支援取消任務
<Button onClick={() => cancelTask(task.id)}>取消</Button>
```

**前端僅決策**: 任務中心 UI、進度顯示方式
**後端決策**: 並行上限值、排隊策略、優先級規則

**決策期限**: 2 週內

---

### 2.4 歷史資料查詢時間範圍 UI 🔴

**前端問題**: 審計日誌、通知歷史等頁面的時間範圍選擇器預設值與上限。

**影響範圍**: 審計日誌、通知歷史、執行歷史等時序資料頁面

> **後端參數**：各類資料的保留天數、查詢上限由後端定義並透過 API 提供

**前端決策點**:

#### 時間範圍選擇器設計 (推薦)

**前端從 API 取得設定**:
```typescript
// API: GET /api/v1/pages/{page-key}/query-config
{
  "audit_logs": {
    "defaultRange": 7,        // 預設 7 天
    "maxRange": 90,           // 最大 90 天
    "retentionDays": 365      // 保留 365 天
  },
  "notification_history": {
    "defaultRange": 1,        // 預設 1 天
    "maxRange": 30,
    "retentionDays": 90
  }
}
```

**前端 UI 設計**（使用後端提供的範圍）:
| 頁面 | 預設範圍 | 最大範圍 | 快速選項 |
|------|----------|----------|----------|
| **審計日誌** | API 提供 | API 提供 | 今天/昨天/7天/30天/自訂 |
| **通知歷史** | API 提供 | API 提供 | 1小時/24小時/7天/自訂 |
| **事件歷史** | API 提供 | API 提供 | 今天/7天/30天/90天/自訂 |
| **執行日誌** | API 提供 | API 提供 | 1小時/24小時/7天/自訂 |

**UI 設計**（動態使用 API 配置）:
```tsx
// 從 API 取得配置
const { defaultRange, maxRange } = queryConfig;

<DateRangePicker
  defaultValue={[dayjs().subtract(defaultRange, 'day'), dayjs()]}
  maxRange={maxRange}
  presets={[
    { label: '今天', value: [dayjs().startOf('day'), dayjs()] },
    { label: `最近 ${defaultRange} 天`, value: [dayjs().subtract(defaultRange, 'day'), dayjs()] },
    { label: `最近 ${maxRange} 天`, value: [dayjs().subtract(maxRange, 'day'), dayjs()] },
  ]}
  onChange={handleDateChange}
  disabledDate={(current) => {
    // 禁止選擇超過最大範圍的日期
    return current && current < dayjs().subtract(maxRange, 'day');
  }}
/>
```

**超過範圍的 UX 處理**（使用 API 提供的 maxRange）:
```tsx
// 動態錯誤訊息
if (selectedRange > maxRange) {
  showAlert(
    `⚠️ 查詢範圍過大
     最多支援 ${maxRange} 天範圍查詢
     請縮小時間範圍或聯絡管理員匯出歷史資料`
  );
}
```

**前端快取策略**:
- 使用 React Query 快取最近 5 次查詢結果
- 快取時間: 5 分鐘（可由 API 提供 cacheTTL）
- 切換時間範圍自動重新查詢

**前端僅決策**: 日期選擇器 UI、快速選項排列、錯誤提示方式
**後端決策**: 保留天數、查詢上限、快取過期時間

**決策期限**: 1 週內

---

### 2.5 巢狀 Modal 層級限制 🔴

**前端問題**: `modal-interaction-pattern.md` 未定義 Modal 可以巢狀的最大層級。

**影響範圍**: 所有使用 Modal 的功能模組

**前端決策點**:

#### Modal 巢狀規則 (推薦)

**最大層級: 2 層**
```
層級 1 (主 Modal):
┌─────────────────────────┐
│ 編輯事件                 │
│ [表單內容...]            │
│                         │
│ 點擊「選擇負責人」→      │
│   ↓ 開啟層級 2           │
└─────────────────────────┘

層級 2 (子 Modal):
  ┌───────────────────┐
  │ 選擇負責人         │
  │ [搜尋...]          │
  │ • Alice           │
  │ • Bob             │
  │ [確認] [取消]      │
  └───────────────────┘
```

**禁止第 3 層**:
```tsx
// 在第 2 層 Modal 中禁止再開啟 Modal
if (modalStackDepth >= 2) {
  // 改用 Drawer 或內嵌展開
  return <InlineExpand />;
}
```

**替代方案**:
- 第 3 層改用 **Drawer** (從右側滑出)
- 或使用 **內嵌展開** (Inline Expand)
- 或使用 **分步驟 Wizard** (Step by Step)

**z-index 管理**:
```css
.modal-level-1 { z-index: 1000; }
.modal-level-2 { z-index: 1050; }
.drawer { z-index: 1100; }  /* 永遠在最上層 */
```

**決策期限**: 1 週內

---

## 三、UI/UX 設計決策 (P1)

> **注意**：本節僅涵蓋前端顯示邏輯。自動關閉策略、優先級規則等**業務邏輯由後端決策**。

### 3.1 事件狀態變更 UI 提示 🟠

**前端問題**: `incidents-list-spec.md` 未定義當事件自動關閉時的前端提示。

**影響範圍**: 事件列表、事件詳情頁

**前端決策點**:

#### 狀態變更通知方案 (推薦)

**即時通知 (WebSocket)**:
```tsx
// 當事件狀態變更時
<Toast
  type="info"
  message="事件 INC-001 已自動關閉"
  description="原因: 告警已恢復超過 5 分鐘"
  action={
    <Button size="small" onClick={() => navigate('/incidents/INC-001')}>
      查看詳情
    </Button>
  }
  duration={5000}
/>
```

**列表頁面標記**:
```
[事件列表]
┌─────────────────────────────────────┐
│ INC-001  ⏱️ 自動關閉 2 分鐘前        │
│ 嚴重度: Low | 負責人: Alice          │
│ 📝 關閉原因: 告警已恢復              │
└─────────────────────────────────────┘

手動關閉:
┌─────────────────────────────────────┐
│ INC-002  👤 手動關閉 10 分鐘前       │
│ 嚴重度: High | 負責人: Bob           │
│ 📝 關閉原因: 已部署修復              │
└─────────────────────────────────────┘
```

**詳情頁時間軸**:
```
[事件時間軸]
⏱️ 2025-10-06 14:30  系統自動關閉
   └─ 原因: 告警持續恢復超過 5 分鐘
   └─ 關聯告警: ALR-123 (已解決)

👤 2025-10-06 14:00  Alice 確認處理
   └─ 備註: 已重啟服務

🔔 2025-10-06 13:55  告警觸發
   └─ CPU 使用率 > 90%
```

**前端輪詢策略**（輪詢間隔可由 API 提供）:
```typescript
// API 提供輪詢配置
const { pollingInterval = 30000 } = config; // 預設 30 秒

// 列表頁輪詢
useEffect(() => {
  const interval = setInterval(fetchIncidents, pollingInterval);
  return () => clearInterval(interval);
}, [pollingInterval]);
```

- 列表頁: 依 API 提供的間隔輪詢（預設 30 秒）
- 詳情頁: WebSocket 即時更新（優先）
- 使用者離開頁面時停止輪詢

**前端僅決策**: Toast 樣式、時間軸佈局、標記圖示
**後端決策**: 自動關閉策略、輪詢間隔、WebSocket 推送規則

**決策期限**: 1 週內

---

### 3.2 通知策略衝突 UI 提示 🟠

**前端問題**: `notification-strategy-spec.md` 未定義多個策略衝突時的前端顯示。

**影響範圍**: 通知策略管理頁面

**前端決策點**:

#### 策略衝突視覺化 (推薦)

**編輯策略時的衝突警告**:
```tsx
// 使用者建立/編輯策略時
<Alert type="warning" showIcon>
  <p>⚠️ 此策略與現有策略可能衝突:</p>
  <ul>
    <li>「Critical 事件通知」(優先級 80) - 條件重疊</li>
    <li>「Platform 團隊預設」(優先級 50) - 目標重疊</li>
  </ul>
  <p>
    最終生效: <strong>優先級較高的策略</strong>
    <Button type="link" onClick={showPriorityHelp}>
      了解優先級規則
    </Button>
  </p>
</Alert>
```

**策略列表優先級視覺化**:
```
[通知策略列表]
┌─────────────────────────────────────┐
│ 🔴 Critical 事件立即通知  優先級: 100│
│    條件: severity = critical        │
│    渠道: PagerDuty + Slack + Email  │
├─────────────────────────────────────┤
│ 🟠 Platform 團隊預設     優先級: 50 │
│    條件: team = platform            │
│    渠道: Slack                      │
│    ⚠️ 可能被更高優先級策略覆蓋      │
└─────────────────────────────────────┘
```

**策略測試工具**:
```
[測試策略]
輸入條件:
  • 嚴重度: Critical
  • 團隊: Platform
  • 事件 ID: INC-001

匹配結果:
✅ Critical 事件立即通知 (優先級 100) → 生效
❌ Platform 團隊預設 (優先級 50) → 被覆蓋

最終渠道: PagerDuty, Slack, Email
```

**前端衝突檢查**（衝突規則由 API 提供）:
```typescript
// API 提供衝突檢查
const { conflicts } = await api.post('/notification-strategies/validate', newStrategy);

if (conflicts.length > 0) {
  showConflictWarning(conflicts);
  // 讓使用者確認是否繼續
}
```

**前端僅決策**: 衝突警告 UI、優先級視覺化、測試工具介面
**後端決策**: 優先級規則、衝突解決演算法、頻率限制

**決策期限**: 2 週內

---

### 3.3 資源拓撲圖更新提示 🟠

**前端問題**: `resources-topology-spec.md` 未定義拓撲圖資料更新時的 UI 反饋。

**影響範圍**: 資源拓撲圖頁面

**前端決策點**:

#### 資料更新視覺化 (推薦)

**即時更新標記**:
```tsx
// 拓撲圖右上角狀態指示器
<StatusIndicator>
  <Icon name="radio" className="text-green-500 animate-pulse" />
  <span>即時更新 | 最後更新: 2 秒前</span>
  <Tooltip>
    透過 WebSocket 即時同步依賴關係變更
  </Tooltip>
</StatusIndicator>

// 資料來源標記
<Badge>
  資料來源: APM 追蹤 (5分鐘) + 人工標註 (即時)
</Badge>
```

**依賴關係置信度顯示**:
```
[拓撲圖節點]
API Gateway
  ↓ 高置信度 (APM 追蹤)
  ├─→ Auth Service
  ├─→ User Service
  │
  ↓ 中置信度 (配置檔)
  └─→ Database
      │
      ↓ 低置信度 (人工標註)
      └─→ Redis

圖例:
━━━ 高置信度 (實際追蹤)
╍╍╍ 中置信度 (配置推斷)
┄┄┄ 低置信度 (人工維護)
```

**手動刷新選項**:
```tsx
<Toolbar>
  <Button
    icon={<Icon name="refresh-cw" />}
    onClick={handleRefresh}
    loading={isRefreshing}
  >
    手動刷新
  </Button>

  <Select
    defaultValue="auto"
    options={[
      { value: 'auto', label: '自動更新 (推薦)' },
      { value: 'manual', label: '手動更新' },
    ]}
    onChange={setUpdateMode}
  />
</Toolbar>
```

**資料過時警告**:
```
⚠️ 資料可能過時
   最後同步時間: 15 分鐘前
   [立即刷新] [忽略]
```

**前端輪詢策略**（更新頻率由 API 提供）:
```typescript
// API 提供更新配置
const { updateMode, pollingInterval } = topologyConfig;

if (updateMode === 'websocket') {
  // WebSocket 連線
  connectWebSocket();
} else {
  // 降級輪詢
  setInterval(fetchTopology, pollingInterval);
}
```

- WebSocket 連線成功: 停止輪詢
- WebSocket 斷線: 降級為 API 提供的輪詢間隔
- 使用者離開頁面: 停止所有更新

**前端僅決策**: 狀態指示器 UI、置信度顏色、圖例設計
**後端決策**: 資料來源、更新頻率、置信度演算法

**決策期限**: 2 週內

---

### 3.4 容量預測演算法選擇 🟠

**模組**: `insights-capacity-spec.md`
**問題**: 預測演算法與模型訓練機制未明確

**建議方案**:

#### 階段式演算法策略 (推薦)

**階段 1: MVP (即刻實施)**
- **線性回歸 (Linear Regression)**
  - 適用: CPU、記憶體等穩定成長指標
  - 優勢: 簡單、可解釋、計算快
  - 實作: Python scikit-learn

- **移動平均 (Moving Average)**
  - 適用: 週期性波動指標
  - 優勢: 無需訓練、即時計算
  - 實作: Pandas rolling window

**階段 2: 進階 (3 個月後)**
- **ARIMA (自回歸整合移動平均)**
  - 適用: 時間序列預測
  - 優勢: 處理趨勢與季節性
  - 實作: statsmodels

- **Prophet (Facebook)**
  - 適用: 業務指標預測
  - 優勢: 自動處理異常值與假日
  - 實作: Prophet library

**階段 3: 智慧化 (6 個月後)**
- **LSTM (長短期記憶網路)**
  - 適用: 複雜非線性模式
  - 優勢: 高準確度
  - 實作: TensorFlow/PyTorch

**模型訓練機制**:
```yaml
training_schedule:
  frequency: daily
  time: "03:00"
  data_range: 90d  # 使用最近 90 天資料
  validation_split: 0.2

model_selection:
  method: auto  # 自動選擇最佳模型
  metrics:
    - RMSE  # 均方根誤差
    - MAPE  # 平均絕對百分比誤差
  threshold:
    MAPE: < 10%  # 誤差小於 10% 才採用
```

---

### 3.5 其他 UI/UX 設計決策 (簡要)

| 項目 | 模組 | 前端方案 |
|------|------|----------|
| 告警聚合顯示 | incidents-alert | 折疊卡片 + 「顯示 X 個相似告警」按鈕 |
| 靜音規則衝突提示 | incidents-silence | 編輯時警告「此規則優先級低於現有規則」 |
| 探索任務進度 | resources-discovery | 進度條 + 「已發現 X 個資源」即時更新 |
| 標籤值重複警告 | platform-tag | 輸入時 Tooltip 提示「已存在相似值: xxx」 |
| 回測時間選擇 | insights-backtesting | DatePicker 限制最大 90 天,超過顯示警告 |
| AI 分析載入狀態 | incidents-*, resources-* | 骨架屏 + 「AI 分析中... 預計 30 秒」 |
| 批次操作確認 | 通用 CRUD | Modal 顯示「影響 X 筆資料,確認執行?」 |
| 表格欄位過長 | 通用 Table | Tooltip 顯示完整內容 + 「點擊複製」 |

---

## 四、前端技術選型 (P1)

### 4.1 虛擬滾動實作方案 🟡

**前端問題**: `table-design-system.md` 大量資料表格的虛擬滾動方案選擇。

**影響範圍**: 所有列表型頁面

**前端決策點**:

#### 方案比較

| 方案 | 優勢 | 劣勢 | 適用場景 | 推薦度 |
|------|------|------|----------|--------|
| **react-window** | 輕量 (3KB)、效能佳、API 簡單 | 功能較少 | 標準列表/表格 | ⭐⭐⭐⭐⭐ |
| **react-virtualized** | 功能豐富、社群大 | 體積大 (27KB)、複雜 | 複雜互動表格 | ⭐⭐⭐ |
| **TanStack Virtual** | 框架無關、TS 友善 | 較新、範例少 | 現代專案 | ⭐⭐⭐⭐ |

**推薦**: **react-window** + 按需擴展

**前端實施策略**:
```typescript
// 基礎實作
import { FixedSizeList } from 'react-window';

// 觸發虛擬滾動的閾值
const VIRTUAL_SCROLL_THRESHOLD = 100; // 超過 100 筆啟用

const TableComponent = ({ data }: { data: any[] }) => {
  if (data.length > VIRTUAL_SCROLL_THRESHOLD) {
    return <VirtualizedTable data={data} />;
  } else {
    return <StandardTable data={data} />;
  }
};
```

**使用者體驗要求**:
- ✅ 初次渲染: < 100ms (1000 筆資料)
- ✅ 滾動 FPS: > 55 FPS
- ✅ 滾動位置記憶 (返回頁面恢復位置)
- ✅ 支援鍵盤導航 (↑↓ 鍵)

---

### 4.2 敏感資料前端遮罩顯示 🟡

**前端問題**: `resources-datasource-spec.md` 資料源認證資訊的前端顯示策略。

**影響範圍**: 資料源管理、個人資訊等敏感資料頁面

**前端決策點**:

#### 遮罩顯示策略 (推薦)

**敏感欄位前端處理**:
| 欄位類型 | 顯示方式 | 互動行為 |
|----------|----------|----------|
| password | `••••••••` (8 個點) | 點擊眼睛圖示顯示/隱藏 |
| api_token | `sk_test_****abc123` (前後 4 碼) | 點擊複製完整 Token |
| private_key | `-----BEGIN...****END-----` | 點擊「查看」開啟 Modal |
| connection_string | `mysql://user:***@host:3306/db` | 密碼部分遮罩 |

**前端實作範例**:
```tsx
// Password Input 元件
<Input.Password
  value={password}
  iconRender={(visible) =>
    visible ? <Icon name="eye-off" /> : <Icon name="eye" />
  }
  placeholder="輸入密碼"
/>

// Token 遮罩顯示
<div className="flex items-center gap-2">
  <code className="text-xs">
    {maskToken(token)} {/* sk_test_****abc123 */}
  </code>
  <Tooltip title="複製完整 Token">
    <IconButton
      icon="copy"
      onClick={() => {
        navigator.clipboard.writeText(fullToken);
        showToast('已複製', 'success');
      }}
    />
  </Tooltip>
</div>

// Private Key Modal
<Button onClick={() => setShowKeyModal(true)}>
  查看 Private Key
</Button>
<Modal
  title="Private Key"
  visible={showKeyModal}
  footer={[
    <Button onClick={() => copyToClipboard(privateKey)}>
      複製
    </Button>,
    <Button onClick={() => setShowKeyModal(false)}>
      關閉
    </Button>
  ]}
>
  <pre className="bg-slate-900 p-4 rounded overflow-x-auto">
    <code>{privateKey}</code>
  </pre>
</Modal>
```

**安全注意事項**:
- ⚠️ 前端遮罩僅為視覺效果,不代表加密
- ⚠️ 完整值由 API 回傳後儲存於 state,離開頁面清除
- ⚠️ 不可在前端 localStorage 儲存敏感資料

---

### 4.3 SSO 登入流程 UI 設計 🟡

**前端問題**: `platform-auth-spec.md` SSO 登入流程的使用者介面設計。

**影響範圍**: 登入頁面

**前端決策點**:

#### 登入頁面設計 (推薦)

**選項 A: 統一登入頁 (推薦)**
```tsx
<LoginPage>
  {/* 主要登入方式 */}
  <Button
    size="large"
    block
    onClick={handleSSOLogin}
    icon={<Icon name="log-in" />}
  >
    使用 SSO 登入
  </Button>

  <Divider>或</Divider>

  {/* 備用本地登入 */}
  <Collapse>
    <Collapse.Panel header="使用本地帳號登入">
      <Form>
        <Input placeholder="帳號" />
        <Input.Password placeholder="密碼" />
        <Button type="primary" htmlType="submit">
          登入
        </Button>
      </Form>
    </Collapse.Panel>
  </Collapse>
</LoginPage>
```

**選項 B: 分離式登入**
```tsx
// 預設顯示 SSO 登入
<SSOLoginPage>
  <Button onClick={handleSSOLogin}>
    使用企業帳號登入
  </Button>
  <Link to="/login/local">改用本地帳號</Link>
</SSOLoginPage>

// 本地登入獨立頁面
<LocalLoginPage>
  <Form>...</Form>
  <Link to="/login/sso">改用 SSO 登入</Link>
</LocalLoginPage>
```

**推薦**: **選項 A (統一頁面)**
- 使用者體驗更好
- 降低認知負擔
- SSO 為主,本地為輔

**SSO 流程狀態提示**:
```tsx
// 點擊 SSO 登入後
<LoadingModal visible={isSSORedirecting}>
  <Spin size="large" />
  <p>正在跳轉至企業登入頁...</p>
  <p className="text-xs text-slate-400">
    若未自動跳轉,請點擊
    <Button type="link" onClick={forceRedirect}>
      這裡
    </Button>
  </p>
</LoadingModal>

// SSO 回調處理中
<LoadingPage>
  <Spin />
  <p>登入驗證中,請稍候...</p>
</LoadingPage>

// SSO 失敗降級
<Alert type="error">
  SSO 登入失敗: {errorMessage}
  <Button onClick={retrySSO}>重試</Button>
  <Button onClick={switchToLocal}>使用本地帳號</Button>
</Alert>
```

---

### 4.4 其他前端技術選型 (簡要)

| 項目 | 前端技術 | 方案 | 理由 |
|------|----------|------|------|
| 圖表渲染 | dashboards-* | ECharts 5 (已採用) | 功能豐富、效能佳、支援 CDN |
| 拓撲圖佈局 | resources-topology | D3.js force-directed | 彈性高、視覺化效果好 |
| 程式碼編輯器 | automation-playbook | Monaco Editor (推薦) | VS Code 核心、語法高亮 |
| Markdown 渲染 | 通用 | react-markdown | 輕量、支援 GFM |
| 日期選擇器 | 通用 | Ant Design DatePicker | 符合設計系統、已整合 |
| 狀態管理 | 全域 | Context + Hooks (已採用) | 符合 React 19,避免過度設計 |
| 表單驗證 | 通用 | Ant Design Form + 自訂規則 | 與 UI 元件緊密整合 |
| WebSocket | 即時更新 | Native WebSocket + 重連機制 | 原生支援、無額外依賴 |

**決策期限**: 各項目啟動前 1 週

---

## 五、前端顯示規則與預設值 (P2)

### 5.1 權限繼承視覺化顯示 🟢

**前端問題**: `identity-role-spec.md` 使用者的最終權限如何清晰顯示。

**影響範圍**: 人員管理、角色管理頁面

**前端決策點**:

#### 權限來源視覺化 (推薦)

**使用者詳情頁權限展示**:
```tsx
<PermissionDisplay user={alice}>
  <Tabs>
    <Tabs.Panel key="effective" tab="最終權限">
      <Tree
        treeData={[
          {
            title: '✅ incidents:view',
            key: 'incidents:view',
            icon: <Icon name="check-circle" className="text-green-500" />,
            description: '來源: 角色 (SRE Engineer)'
          },
          {
            title: '✅ incidents:create',
            key: 'incidents:create',
            icon: <Icon name="check-circle" className="text-green-500" />,
            description: '來源: 角色 (SRE Engineer)'
          },
          {
            title: '❌ incidents:delete',
            key: 'incidents:delete',
            icon: <Icon name="x-circle" className="text-red-500" />,
            description: '來源: 個人拒絕 (覆蓋角色權限)'
          },
          {
            title: '✅ resources:*',
            key: 'resources:*',
            icon: <Icon name="check-circle" className="text-green-500" />,
            description: '來源: 團隊 (Platform Team)'
          }
        ]}
      />
    </Tabs.Panel>

    <Tabs.Panel key="role" tab="角色權限">
      {/* 來自角色的權限 */}
    </Tabs.Panel>

    <Tabs.Panel key="team" tab="團隊權限">
      {/* 來自團隊的權限 */}
    </Tabs.Panel>

    <Tabs.Panel key="personal" tab="個人權限">
      {/* 個人明確允許/拒絕 */}
    </Tabs.Panel>
  </Tabs>
</PermissionDisplay>
```

**權限衝突標記**:
```
┌─────────────────────────────────────┐
│ ⚠️ 權限衝突警告                      │
│                                     │
│ incidents:delete                    │
│ • 角色 (SRE Engineer): ✅ 允許      │
│ • 個人設定: ❌ 拒絕                 │
│                                     │
│ 最終結果: ❌ 拒絕 (個人設定優先)    │
└─────────────────────────────────────┘
```

---

### 5.2 刪除確認 UI 設計 🟢

**前端問題**: `crud-base-requirements.md` 刪除操作的使用者確認流程。

**影響範圍**: 所有 CRUD 模組

**前端決策點**:

#### 刪除確認模式 (推薦)

**軟刪除 (可恢復)**:
```tsx
// 單筆刪除
<Modal
  title="確認刪除"
  visible={isDeleteModalOpen}
  onOk={handleSoftDelete}
  okText="刪除"
  okButtonProps={{ danger: true }}
>
  <p>確定要刪除事件 <strong>{incident.id}</strong> 嗎?</p>
  <Alert
    type="info"
    message="此事件將被移至回收站,30 天內可恢復"
    showIcon
  />
</Modal>

// 批次刪除
<Modal
  title="批次刪除"
  visible={isBatchDeleteModalOpen}
>
  <p>即將刪除 <strong>{selectedIds.length}</strong> 筆資料</p>
  <Alert type="info" message="刪除後 30 天內可在回收站恢復" />
  <Checkbox onChange={(e) => setConfirmed(e.target.checked)}>
    我了解此操作的影響
  </Checkbox>
  <Button
    danger
    disabled={!confirmed}
    onClick={handleBatchDelete}
  >
    確認刪除
  </Button>
</Modal>
```

**硬刪除 (永久刪除)**:
```tsx
<Modal
  title="⚠️ 永久刪除警告"
  visible={isHardDeleteModalOpen}
  closable={false}  // 強制確認
>
  <Alert
    type="error"
    message="此操作無法復原"
    description="資料將被永久刪除,無法恢復"
    showIcon
  />

  <p className="my-4">
    請輸入 <code className="bg-red-900/20 px-2 py-1">DELETE</code> 確認:
  </p>

  <Input
    value={confirmText}
    onChange={(e) => setConfirmText(e.target.value)}
    placeholder="輸入 DELETE 確認"
  />

  <div className="mt-4 flex justify-end gap-2">
    <Button onClick={handleCancel}>取消</Button>
    <Button
      danger
      disabled={confirmText !== 'DELETE'}
      onClick={handleHardDelete}
    >
      永久刪除
    </Button>
  </div>
</Modal>
```

**回收站功能** (軟刪除適用):
```
[回收站頁面]
┌─────────────────────────────────────┐
│ 🗑️ 回收站 (12 筆)                   │
│                                     │
│ • 事件 INC-001 | 刪除於 2 天前       │
│   [恢復] [永久刪除]                  │
│                                     │
│ • 告警規則 ALR-005 | 刪除於 5 天前   │
│   [恢復] [永久刪除]                  │
│                                     │
│ ⚠️ 30 天後自動永久刪除               │
└─────────────────────────────────────┘
```

---

### 5.3 其他前端顯示規則 (簡要)

> **後端參數優先**：以下數值若 API 有提供則使用 API 值，否則使用前端預設值

| 項目 | 模組 | 前端規則 | 後端參數來源 |
|------|------|----------|--------------|
| 告警閾值輸入 | incidents-alert | InputNumber,後綴「%」 | API 提供預設值、範圍 |
| 靜音時長選擇 | incidents-silence | Select 顯示選項 | API 提供可選時長陣列 |
| 資源群組層級 | resources-group | Tree 顯示層級限制提示 | API 提供 maxLevel |
| 探索逾時設定 | resources-discovery | Slider 顯示範圍 | API 提供 min/max/default |
| 標籤值輸入限制 | platform-tag | Input maxLength 限制 | API 提供 maxKeyLength/maxValueLength |
| 劇本步驟數量 | automation-playbook | 列表顯示 X/maxSteps | API 提供 maxSteps |
| 表格分頁大小 | 通用 | Select 選項,記憶選擇 | API 可提供 defaultPageSize |
| 搜尋防抖時間 | 通用 | 前端固定 300ms | - |
| Toast 顯示時長 | 通用 | 前端固定 Success: 3s, Error: 5s | - |
| Modal 最大寬度 | 通用 | 前端固定 預設 520px, 大型 80vw | - |

**原則**：
- ✅ 前端決策：UI 元件類型、佈局、樣式、互動方式
- 🔄 API 優先：數值範圍、預設值、限制上限由 API 提供
- 📌 前端預設：僅在 API 未提供時使用前端 fallback 值

---

## 六、前端實施路線圖

### 階段 1: 高優先級 UI/UX (Week 1-2) 🔴

| 週次 | 前端任務 | 產出 |
|------|----------|------|
| W1 | 權限選擇器 + 錯誤降級 UI + 巢狀 Modal 限制 | React 元件 + 文件 |
| W2 | 任務中心 + 時間範圍選擇器 + 規格更新 | 功能完成 + 測試 |

### 階段 2: UI/UX 設計完善 (Week 3-4) 🟠

| 週次 | 前端任務 | 產出 |
|------|----------|------|
| W3 | 事件狀態通知 + 策略衝突提示 + 拓撲更新指示器 | UI 元件庫 |
| W4 | 容量預測圖表 + 其他視覺化元件 | 圖表元件 + Demo |

### 階段 3: 技術實作 (Week 5-6) 🟡

| 週次 | 前端任務 | 產出 |
|------|----------|------|
| W5 | 虛擬滾動整合 + 敏感資料遮罩 + SSO 登入 UI | 核心功能 |
| W6 | 程式碼編輯器 + WebSocket 整合 + 效能優化 | 技術元件 |

### 階段 4: 顯示規則配置 (Week 7-8) 🟢

| 週次 | 前端任務 | 產出 |
|------|----------|------|
| W7 | 權限視覺化 + 刪除確認 UI + 表單預設值 | UI 完善 |
| W8 | 最終測試 + 文件更新 + 規格 v2.0 發布 | 完整前端規格 |

---

## 七、前端驗收標準

### 7.1 文件驗收

- ✅ 前端相關 NEEDS CLARIFICATION 項目已解決 (約 36 項)
- ✅ 所有 UI/UX 設計決策已文件化
- ✅ 前端規格文件狀態更新為 "Approved"
- ✅ 規格版本更新為 v2.0

### 7.2 前端技術驗收

- ✅ 關鍵 UI 元件實作完成 (虛擬滾動、權限樹、任務中心)
- ✅ 使用者體驗測試通過 (載入時間、互動流暢度)
- ✅ 無障礙測試通過 (WCAG AA 標準)
- ✅ 瀏覽器相容性測試 (Chrome/Firefox/Safari/Edge)

### 7.3 使用者驗收

- ✅ 產品團隊確認 UI/UX 設計符合需求
- ✅ 使用者測試回饋收集與改進
- ✅ 前端效能指標達標 (FCP < 1.5s, LCP < 2.5s)

---

## 八、前端風險與依賴

### 8.1 前端風險

| 風險 | 影響 | 機率 | 緩解措施 |
|------|------|------|----------|
| 虛擬滾動與現有表格元件衝突 | 高 | 中 | 漸進式遷移,保留舊版相容 |
| 大量 WebSocket 連線影響效能 | 中 | 中 | 連線池管理,離開頁面斷線 |
| 瀏覽器相容性問題 | 中 | 低 | Polyfill + 漸進增強策略 |
| UI 設計與使用者預期不符 | 高 | 中 | 早期使用者測試 + 快速迭代 |

### 8.2 前端依賴

- **設計依賴**: UI/UX 設計稿確認
- **後端依賴**: API 規格穩定,Mock 資料完整
- **測試依賴**: 使用者測試環境、效能測試工具

---

## 九、附錄

### 9.1 前端決策記錄範本

```markdown
# FE-ADR-001: 虛擬滾動方案選擇

**日期**: 2025-10-XX
**狀態**: Proposed / Accepted / Deprecated
**決策者**: 前端團隊

## 背景
需要解決大量資料表格渲染效能問題...

## 方案比較
| 方案 | 優勢 | 劣勢 |
|------|------|------|
| react-window | 輕量、效能佳 | 功能較少 |
| react-virtualized | 功能豐富 | 體積大 |

## 決策
選擇 react-window,理由:
- 符合專案輕量化原則
- 效能滿足需求
- API 簡單易維護

## 影響
- 正面: 渲染效能提升 80%
- 負面: 需要重構部分表格元件

## 實作計畫
1. 建立 VirtualizedTable 元件
2. 遷移關鍵列表頁面
3. 效能測試驗證
```

### 9.2 前端參考資料

- React 19 官方文件
- Ant Design 5 設計規範
- WCAG 2.1 AA 標準 (無障礙)
- Web Vitals (效能指標)
- Material Design (互動模式參考)

---

## 十、總結

本解決方案建議書 (前端專用) 提供:

### ✅ 前端決策項目 (15 項)
- **5 個高優先級項目**的 UI/UX 解決方案
- **4 個 UI/UX 設計決策**的明確建議
- **3 個前端技術選型**的方案比較
- **3 個顯示規則**的標準定義
- **8 週前端實施路線圖**與驗收標準

### 🔄 後端參數項目 (20 項)
以下項目**由後端全權決策**，前端透過 API 接收：
- 並行上限、保留天數、自動關閉時長
- 策略優先級、更新頻率、預測演算法
- 告警閾值、靜音時長、權限粒度
- 加密演算法、SSO 協定、刪除保留期
- 群組層級、探索逾時、標籤長度限制
- 劇本步驟上限、歸檔策略、頻率限制
- 快取過期、重試次數... 等

### 📋 前後端協作原則

| 項目類型 | 前端職責 | 後端職責 |
|----------|----------|----------|
| **UI/UX 設計** | ✅ 決策 | - |
| **互動流程** | ✅ 決策 | - |
| **技術選型** | ✅ 決策 | - |
| **顯示邏輯** | ✅ 決策 | - |
| **資料參數** | 📥 接收顯示 | ✅ 決策 |
| **業務規則** | 📥 接收顯示 | ✅ 決策 |
| **演算法/策略** | 📥 接收顯示 | ✅ 決策 |

### 🔗 API 設計要求

為確保前端正確顯示後端參數，API 需提供：

```typescript
// 範例: 頁面配置 API
GET /api/v1/pages/{page-key}/config

Response:
{
  "query": {
    "defaultRange": 7,        // 預設查詢範圍
    "maxRange": 90,           // 最大查詢範圍
    "retentionDays": 365      // 資料保留天數
  },
  "concurrency": {
    "maxConcurrent": 5,       // 最大並行數
    "pollingInterval": 30000  // 輪詢間隔 (ms)
  },
  "validation": {
    "maxKeyLength": 64,       // 標籤 key 長度
    "maxValueLength": 256,    // 標籤 value 長度
    "maxGroupLevel": 5        // 群組最大層級
  },
  "ui": {
    "defaultPageSize": 10,    // 預設分頁大小
    "cacheTTL": 300           // 快取過期時間 (秒)
  }
}
```

### 🎯 下一步行動

1. **前端團隊**:
   - 召開前端規格審查會議
   - 確認 15 項前端決策
   - 啟動 UI/UX 實施

2. **後端團隊**:
   - 確認 20 項後端參數值
   - 設計配置 API 格式
   - 提供 Mock 資料

3. **協作**:
   - 定義 API 合約
   - 前端使用 API 提供的參數
   - 8 週後發布規格 v2.0

### 📝 文件維護
- 前端決策建立 `FE-ADR-XXX`
- 後端參數記錄於 `BE-CONFIG-XXX`
- 更新進度至 `_resolution-progress.md`
- 合併回各模組規格文件

---

**文件結束**

**重要提醒**:
- ✅ 前端決策 15 項已完成方案設計
- 🔄 後端參數 20 項需後端團隊定義
- 📋 前後端需協作定義配置 API 格式
