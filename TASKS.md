# SRE Platform 改進任務清單

**版本**：v2.0
**更新日期**：2025-10-01
**目的**：集中逐項改進執行清單

---

## 📊 整體進度總覽

| 階段 | 完成度 | 狀態 | 預估剩餘 |
|------|--------|------|----------|
| **P0 緊急修復** | **85%** | 🟢 接近完成 | 1.5 天 |
| P1 重要補強 | 50% | 🟡 進行中 | 5 天 |
| P2 功能完善 | 0% | ⚪ 未開始 | 5 天 |
| P3 進階功能 | 0% | ⚪ 未開始 | 4 天 |
| **總計** | **58%** | 🟡 進行中 | **15.5 天** |

---

## 🎯 P0 階段：緊急修復（10 天）

### ✅ 已完成（85%）

#### ✅ P0.1 - 補充關鍵外鍵欄位
**完成日期**：2025-10-01
**檔案**：`types.ts`
**內容**：新增 16 個關鍵欄位
- AutomationExecution: incident_id, alert_rule_id, target_resource_id, resolved_incident
- NotificationHistoryRecord: incident_id
- Resource: datasource_id
- Dashboard: resource_ids
- AlertRule: target_resource_ids, target_scope, triggered_count, version
- Incident: silenced_by, notifications_sent, acknowledged_at, resolved_at
- NotificationStrategy: channel_ids

**影響**：數據血緣追蹤能力從 3.7/10 提升至預估 7.5/10

---

#### ✅ P0.2 - 新增缺失的資料表
**完成日期**：2025-10-01
**檔案**：`types.ts`, `handlers.ts`
**內容**：
- ResourceLink (資源拓撲關係)
- ConfigVersion (配置版本控制)

---

#### ✅ P0.3 - 欄位命名統一化（types.ts + handlers.ts）
**完成日期**：2025-10-01
**檔案**：
- `types.ts` - 46+ 實體，250+ 欄位改為 snake_case
- `handlers.ts` - 589 行變更，42 個欄位轉換

**命名規則**：全面採用 snake_case
```typescript
createdAt → created_at
resourceId → resource_id
automationEnabled → automation_enabled
conditionsSummary → conditions_summary
```

---

#### ✅ P0.4 - 軟刪除策略統一
**完成日期**：2025-10-01
**檔案**：`handlers.ts`
**內容**：9 個實體統一使用 `deleted_at` 軟刪除
- AlertRule, SilenceRule, User, Team, Role
- AutomationPlaybook, AutomationTrigger, Resource, Dashboard

---

#### ✅ P0.5 - AuditLog 中間件實現
**完成日期**：已完成
**檔案**：`mock-server/auditLog.ts`
**內容**：實現 auditLogMiddleware 函數

---

### ⏳ 待完成（15%）

#### 🔴 P0.6 - db.ts 欄位命名更新
**狀態**：⏳ 待執行
**優先級**：⭐⭐⭐ 最高
**預估時間**：2-3 小時
**前置條件**：無
**檔案**：`mock-server/db.ts`

**任務內容**：
將所有模擬資料的欄位名稱改為 snake_case（約 27 個資料集）

**執行步驟**：
1. 讀取 `mock-server/db.ts`
2. 依序替換：
   - 時間戳欄位（created_at, updated_at, deleted_at 等）
   - ID 欄位（resource_id, rule_id, team_id 等）
   - 複合詞欄位（ai_analysis, automation_enabled 等）
3. 確保巢狀物件和陣列內的物件都已更新

**完成標準**：
- ✅ 所有物件屬性使用 snake_case
- ✅ 無遺留 camelCase 欄位
- ✅ 約 27 個資料集全部更新

**欄位對照表**：
```typescript
// 時間戳
createdAt → created_at
updatedAt → updated_at
deletedAt → deleted_at
occurredAt → occurred_at
lastLoginAt → last_login_at

// ID 欄位
resourceId → resource_id
ruleId → rule_id
teamId → team_id
incidentId → incident_id

// 複合詞
aiAnalysis → ai_analysis
automationEnabled → automation_enabled
conditionsSummary → conditions_summary
targetResourceIds → target_resource_ids
```

**資料集清單**（27 個）：
```
DB.dashboards
DB.incidents
DB.alertRules
DB.silenceRules
DB.resources
DB.resourceGroups
DB.resourceLinks
DB.playbooks
DB.automationExecutions
DB.automationTriggers
DB.users
DB.teams
DB.roles
DB.notificationChannels
DB.notificationStrategies
DB.notificationHistory
DB.datasources
DB.discoveryJobs
DB.discoveredResources
DB.tagDefinitions
DB.auditLogs
DB.configVersions
DB.mailSettings
DB.grafanaSettings
DB.authSettings
DB.userPreferences
DB.layouts
DB.resourceOverviewData
```

---

#### 🔴 P0.7 - 編譯測試與錯誤修復
**狀態**：⏳ 待執行
**優先級**：⭐⭐⭐ 高
**預估時間**：1-2 小時
**前置條件**：P0.6 完成
**檔案**：整個專案

**任務內容**：
確保專案可以正常編譯並執行

**執行步驟**：
1. 執行 TypeScript 編譯
   ```bash
   npm run build
   # 或
   npx tsc
   ```
2. 記錄所有編譯錯誤
3. 分類錯誤：
   - 型別不匹配
   - 缺失欄位
   - 命名不一致
4. 系統化修復錯誤
5. 測試 mock-server 啟動
   ```bash
   node mock-server/server.js
   ```
6. 測試端點回應
   ```bash
   curl http://localhost:4000/api/v1/incidents
   ```

**完成標準**：
- ✅ 無 TypeScript 編譯錯誤
- ✅ Mock server 正常啟動
- ✅ API 端點正常回應

---

#### 🟡 P0.8 - AuditLog 覆蓋率擴展（20% → 100%）
**狀態**：⏳ 待執行
**優先級**：⭐⭐ 中高
**預估時間**：1 天
**前置條件**：P0.7 完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
為所有實體的 CREATE/UPDATE/DELETE 操作加入 AuditLog

**已完成**（3/15）：
- ✅ AlertRule (CREATE: 566, UPDATE: 583, DELETE: 600)
- ✅ Resource (CREATE: 895, UPDATE: 915, DELETE: 988)
- ✅ Incident (CREATE: 440, NOTIFY: 474)

**待完成**（12/15）：
- [ ] Dashboard CRUD
- [ ] User CRUD
- [ ] Team CRUD
- [ ] Role CRUD
- [ ] AutomationPlaybook CRUD
- [ ] AutomationTrigger CRUD
- [ ] NotificationChannel CRUD
- [ ] NotificationStrategy CRUD
- [ ] SilenceRule CRUD
- [ ] ResourceGroup CRUD
- [ ] Datasource CRUD
- [ ] DiscoveryJob CRUD

**執行步驟**：
1. 找到每個實體的 POST (CREATE)、PUT (UPDATE)、DELETE 端點
2. 在操作成功後加入：
   ```typescript
   auditLogMiddleware(
     userId,        // 操作者 ID
     'CREATE',      // 操作類型
     'Dashboard',   // 實體類型
     newItem.id,    // 實體 ID
     { /* 詳細資訊 */ }
   );
   ```
3. 參考 AlertRule 實現（handlers.ts:566, 583, 600）

**完成標準**：
- ✅ 12 個實體的 CRUD 操作都有 AuditLog
- ✅ AuditLog 覆蓋率達 100%

---

## 🎯 P1 階段：重要補強（10 天）

### ⏳ P1.1 - 外鍵驗證完整化
**狀態**：⏳ 待執行
**優先級**：⭐⭐ 中
**預估時間**：1 天
**前置條件**：P0 完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
為所有外鍵欄位加入驗證邏輯

**執行步驟**：
1. 識別所有外鍵欄位（resource_id, rule_id, team_id 等）
2. 在 CREATE/UPDATE 端點中加入驗證：
   ```typescript
   // 驗證 resource_id 存在
   const resource = DB.resources.find(r => r.id === resource_id && !r.deleted_at);
   if (!resource) {
     return res.status(404).json({ error: 'Resource not found' });
   }
   ```
3. 返回適當的錯誤訊息（404 或 400）

**待驗證的外鍵**（約 30+ 個）：
- AutomationExecution: incident_id, alert_rule_id, target_resource_id
- Incident: resource_id, rule_id, silenced_by
- NotificationHistoryRecord: incident_id
- Dashboard: resource_ids (陣列)
- AlertRule: target_resource_ids (陣列)
- 等等...

**完成標準**：
- ✅ 所有外鍵欄位都有驗證
- ✅ 無效外鍵返回 404 錯誤
- ✅ 錯誤訊息清晰

---

### ⏳ P1.2 - 枚舉值驗證
**狀態**：⏳ 待執行
**優先級**：⭐⭐ 中
**預估時間**：0.5 天
**前置條件**：P0 完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
為所有枚舉欄位加入驗證

**執行步驟**：
1. 識別所有枚舉欄位（status, severity, type 等）
2. 在 CREATE/UPDATE 端點中加入驗證：
   ```typescript
   const validStatuses = ['open', 'investigating', 'resolved'];
   if (!validStatuses.includes(status)) {
     return res.status(400).json({
       error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
     });
   }
   ```

**待驗證的枚舉**（約 20+ 個）：
- Incident.status: 'open', 'investigating', 'resolved', 'closed'
- Incident.severity: 'critical', 'high', 'medium', 'low'
- Resource.status: 'healthy', 'degraded', 'down', 'unknown'
- AlertRule.severity: 'critical', 'high', 'medium', 'low', 'info'
- 等等...

**完成標準**：
- ✅ 所有枚舉欄位都有驗證
- ✅ 無效值返回 400 錯誤
- ✅ 錯誤訊息列出有效值

---

### ⏳ P1.3 - 必填欄位驗證
**狀態**：⏳ 待執行
**優先級**：⭐⭐ 中
**預估時間**：0.5 天
**前置條件**：P0 完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
為所有必填欄位加入驗證

**執行步驟**：
1. 識別所有必填欄位（參考 types.ts 中非 optional 的欄位）
2. 在 CREATE 端點中驗證：
   ```typescript
   const requiredFields = ['name', 'resource_id', 'rule_id'];
   const missing = requiredFields.filter(f => !req.body[f]);
   if (missing.length > 0) {
     return res.status(400).json({
       error: `Missing required fields: ${missing.join(', ')}`
     });
   }
   ```

**完成標準**：
- ✅ 所有必填欄位都有驗證
- ✅ 缺失必填欄位返回 400 錯誤
- ✅ 錯誤訊息列出缺失欄位

---

### ⏳ P1.4 - 批次操作補充
**狀態**：⏳ 待執行
**優先級**：⭐ 中低
**預估時間**：1 天
**前置條件**：P1.1-P1.3 完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
補充批次操作端點

**待補充的批次操作**：
- [ ] POST /api/v1/incidents/batch-close - 批次關閉事件
- [ ] POST /api/v1/incidents/batch-assign - 批次指派事件
- [ ] POST /api/v1/resources/batch-tag - 批次標籤資源
- [ ] DELETE /api/v1/resources/batch - 批次刪除資源
- [ ] POST /api/v1/alert-rules/batch-enable - 批次啟用規則
- [ ] POST /api/v1/alert-rules/batch-disable - 批次停用規則

**執行步驟**：
1. 為每個批次操作建立端點
2. 支援 ID 陣列輸入
3. 返回成功/失敗統計
4. 加入 AuditLog 記錄

**完成標準**：
- ✅ 6 個批次操作端點實現
- ✅ 支援交易式操作（全部成功或全部失敗）
- ✅ 返回詳細的操作結果

---

## 🎯 P2 階段：功能完善（5 天）

### ⏳ P2.1 - 生成 OpenAPI 規範
**狀態**：⏳ 待執行
**優先級**：⭐⭐ 中
**預估時間**：2 天
**前置條件**：P0, P1 完成
**輸出檔案**：`openapi.yaml`

**任務內容**：
根據當前 API 實現生成完整的 OpenAPI 3.0 規範

**執行步驟**：
1. 分析 handlers.ts 中所有端點
2. 提取 Request/Response Schema（參考 types.ts）
3. 生成 OpenAPI YAML
4. 包含範例 (examples)

**完成標準**：
- ✅ 完整的 OpenAPI 3.0 規範
- ✅ 所有端點都有文檔
- ✅ 所有 Schema 定義完整
- ✅ 包含請求/回應範例

---

### ⏳ P2.2 - 生成資料庫 Schema
**狀態**：⏳ 待執行
**優先級**：⭐⭐ 中
**預估時間**：2 天
**前置條件**：P0, P1 完成
**輸出檔案**：`db_schema.sql`

**任務內容**：
根據 types.ts 生成完整的資料庫 Schema（MySQL/PostgreSQL）

**執行步驟**：
1. 分析 types.ts 中所有介面
2. 生成 CREATE TABLE 語句
3. 加入外鍵約束
4. 加入索引定義
5. 加入註解說明

**完成標準**：
- ✅ 完整的 SQL Schema
- ✅ 所有表都有定義
- ✅ 外鍵約束正確
- ✅ 索引完整
- ✅ 註解清晰

---

### ⏳ P2.3 - 分頁、排序、過濾標準化
**狀態**：⏳ 待執行
**優先級**：⭐ 中低
**預估時間**：1 天
**前置條件**：P0 完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
統一所有列表端點的分頁、排序、過濾參數

**標準化參數**：
```typescript
// 分頁
?page=1&page_size=20

// 排序
?sort_by=created_at&sort_order=desc

// 過濾
?status=open&severity=critical
?created_after=2024-01-01&created_before=2024-12-31
```

**完成標準**：
- ✅ 所有列表端點支援分頁
- ✅ 所有列表端點支援排序
- ✅ 所有列表端點支援基本過濾
- ✅ 參數命名一致

---

## 🎯 P3 階段：進階功能（4 天）

### ⏳ P3.1 - 前端元件更新
**狀態**：⏳ 待執行
**優先級**：⭐⭐⭐ 高（Breaking Change）
**預估時間**：2 天
**前置條件**：P0 完成並測試
**檔案**：前端元件（約 230+ 處）

**任務內容**：
將前端所有欄位引用從 camelCase 改為 snake_case

**執行步驟**：
1. 搜尋所有使用 camelCase 欄位的地方
   ```bash
   grep -r "resourceId" components/ pages/
   grep -r "createdAt" components/ pages/
   ```
2. 系統化替換為 snake_case
3. 測試每個頁面功能

**預估影響範圍**（230+ 處）：
- components/ - 約 150 處
- pages/ - 約 80 處

**完成標準**：
- ✅ 所有前端欄位使用 snake_case
- ✅ 所有頁面功能正常
- ✅ 無 API 呼叫錯誤

---

### ⏳ P3.2 - 資料導入導出功能
**狀態**：⏳ 待執行
**優先級**：⭐ 低
**預估時間**：1 天
**前置條件**：P2 完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
實現資料的批次導入導出

**執行步驟**：
1. 實現 CSV 導出端點
   ```
   GET /api/v1/resources/export?format=csv
   GET /api/v1/incidents/export?format=csv
   ```
2. 實現 CSV 導入端點
   ```
   POST /api/v1/resources/import
   POST /api/v1/incidents/import
   ```
3. 加入資料驗證
4. 加入錯誤處理

**完成標準**：
- ✅ 支援 CSV 導出
- ✅ 支援 CSV 導入
- ✅ 資料驗證完整
- ✅ 錯誤處理完善

---

### ⏳ P3.3 - 效能優化
**狀態**：⏳ 待執行
**優先級**：⭐ 低
**預估時間**：1 天
**前置條件**：所有功能完成
**檔案**：`mock-server/handlers.ts`

**任務內容**：
優化 API 回應速度

**執行步驟**：
1. 加入記憶體快取（for mock server）
2. 優化陣列操作（reduce 搜尋次數）
3. 加入資料預載入
4. 壓縮回應資料

**完成標準**：
- ✅ 列表端點回應時間 < 100ms
- ✅ 詳情端點回應時間 < 50ms
- ✅ 記憶體使用穩定

---

## 📋 執行策略

### 推薦執行順序（逐項完成）

```
第 1 項：P0.6 - db.ts 更新（2-3 小時）⭐⭐⭐
   ↓
第 2 項：P0.7 - 編譯測試（1-2 小時）⭐⭐⭐
   ↓
第 3 項：P0.8 - AuditLog 擴展（1 天）⭐⭐
   ↓
第 4 項：P1.1 - 外鍵驗證（1 天）⭐⭐
   ↓
第 5 項：P1.2 - 枚舉值驗證（0.5 天）⭐⭐
   ↓
第 6 項：P1.3 - 必填欄位驗證（0.5 天）⭐⭐
   ↓
第 7 項：P1.4 - 批次操作（1 天）⭐
   ↓
第 8 項：P2.1 - OpenAPI 生成（2 天）⭐⭐
   ↓
第 9 項：P2.2 - DB Schema 生成（2 天）⭐⭐
   ↓
第 10 項：P2.3 - 分頁排序標準化（1 天）⭐
   ↓
第 11 項：P3.1 - 前端元件更新（2 天）⭐⭐⭐
   ↓
第 12 項：P3.2 - 導入導出（1 天）⭐
   ↓
第 13 項：P3.3 - 效能優化（1 天）⭐
```

### 每日建議進度

**Day 1** (今天)：
- ✅ P0.6 - db.ts 更新
- ✅ P0.7 - 編譯測試

**Day 2-3**：
- [ ] P0.8 - AuditLog 擴展

**Day 4**：
- [ ] P1.1 - 外鍵驗證

**Day 5**：
- [ ] P1.2 - 枚舉值驗證
- [ ] P1.3 - 必填欄位驗證

**Day 6**：
- [ ] P1.4 - 批次操作

**Day 7-8**：
- [ ] P2.1 - OpenAPI 生成

**Day 9-10**：
- [ ] P2.2 - DB Schema 生成

**Day 11**：
- [ ] P2.3 - 分頁排序標準化

**Day 12-13**：
- [ ] P3.1 - 前端元件更新

**Day 14**：
- [ ] P3.2 - 導入導出

**Day 15**：
- [ ] P3.3 - 效能優化

---

## 🔍 任務狀態圖例

- ✅ **已完成** - 任務已完成並驗證
- 🔴 **待執行（高優先級）** - 緊急，需立即執行
- 🟡 **待執行（中優先級）** - 重要，按順序執行
- ⚪ **待執行（低優先級）** - 可延後執行
- ⏳ **準備中** - 前置條件未滿足

---

## 📝 任務執行檢查表

每完成一項任務，請：
1. ✅ 標記任務狀態為「已完成」
2. ✅ 更新完成日期
3. ✅ 記錄修改的檔案和行數
4. ✅ 執行測試驗證
5. ✅ 更新整體進度百分比
6. ✅ Git commit 變更

---

## 📞 參考文檔

- **詳細進度追蹤**：`implementation_progress.md`
- **改進建議原文**：`improvement_recommendations.md`
- **快速總覽**：`progress_summary.md`
- **AI 執行指引**：`AGENT.md`
- **分析報告**：`docs/analysis/`
- **完成報告**：`docs/reports/`

---

**維護者**：Claude Code
**最後更新**：2025-10-01
**狀態**：Active - 逐項執行中
