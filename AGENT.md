# AGENT.md - AI Agent 執行指引

**版本**：v1.0
**更新日期**：2025-10-01
**適用對象**：AI Agent（Claude Code、ChatGPT、其他 LLM）、自動化工具

---

## 📋 目的

本文件為 **AI Agent 提供結構化的執行指引**，用於協助完成 SRE Platform 的骨架完善工作。

---

## 🎯 當前專案狀態

### 整體進度
- **總進度**：95%（P0-P3 四階段）
- **P0 緊急修復**：100% ✅ 已完成
- **P1 重要補強**：100% ✅ 已完成
- **P2 功能完善**：90% ✅ 已完成
- **P3 進階功能**：30% ⚠️ 部分完成
- **預估剩餘工時**：2-3 天（僅剩 P3 優化任務）

### 已完成項目 ✅
1. ✅ **型別定義補充**（types.ts）- 21+ 個新欄位
2. ✅ **命名規範統一**（全棧）- 所有欄位統一為 snake_case
3. ✅ **軟刪除策略統一** - 9 個實體使用 `deleted_at`
4. ✅ **AuditLog 中間件實現** - 100% 覆蓋率
5. ✅ **枚舉值驗證** - validateEnum 全面實現
6. ✅ **外鍵驗證** - validateForeignKey/validateForeignKeys
7. ✅ **OpenAPI 規範生成** - 16 個 YAML 文件
8. ✅ **資料庫 Schema 生成** - 從 TypeScript 自動生成
9. ✅ **分頁排序標準化** - 全端點統一實現

### 待完成項目 ⏳
1. ⏳ **程式碼分割優化** - Bundle size 優化（731KB → 目標 500KB）
2. ⏳ **匯入/匯出功能** - CSV/JSON 檔案處理
3. ⏳ **效能測試** - 負載測試與優化
4. ⏳ **validateEnum 擴展** - 移除剩餘內建枚舉檢查

---

## 🔧 可用的執行提示詞

專案中包含多個結構化提示詞文件，可供 AI Agent 直接執行：

| 提示詞文件 | 用途 | 狀態 | 優先級 |
|-----------|------|------|--------|
| **docs/guides/reports_improvement_audit_prompt.md** | 審查報告改進驗證 | ✅ 新增 | ⭐⭐⭐ 高 |
| **docs/guides/enum-audit-prompt.md** | 枚舉值一致性審查 | ✅ 可用 | ⭐⭐⭐ 高 |
| **docs/guides/db_schema_review_prompt.md** | 資料庫架構審查 | ✅ 可用 | ⭐⭐ 高 |
| **docs/guides/openapi_review_prompt.md** | OpenAPI 規範審查 | ✅ 可用 | ⭐⭐ 中 |

---

## 📦 任務清單（按優先級）

### 🚨 高優先級（本週內完成）

#### 任務 1：更新 db.ts - 初始化資料
**狀態**：⏳ 待執行
**預估時間**：2-3 小時
**提示詞文件**：`db_update_prompt.md`

**執行步驟**：
1. 讀取 `db_update_prompt.md` 獲取完整指引
2. 讀取 `/Users/zoe/Downloads/sre-platform-app/mock-server/db.ts`
3. 依照提示詞中的欄位對照表進行替換：
   - 時間戳欄位（created_at, updated_at, deleted_at 等）
   - ID 欄位（resource_id, rule_id, team_id 等）
   - 複合詞欄位（ai_analysis, automation_enabled 等）
4. 使用 Edit 工具系統化替換（約 27 個資料集）
5. 回報修改統計

**完成標準**：
- ✅ 所有物件屬性使用 snake_case
- ✅ 無遺留 camelCase 欄位
- ✅ 巢狀物件和陣列中的物件都已更新

**回報格式**：
```markdown
## db.ts 更新完成報告

### 統計
- 修改總行數：XXX
- 欄位替換數：XXX
- 資料集更新數：XXX/27

### 更新的主要資料集
- DB.dashboards
- DB.incidents
- DB.alertRules
- ...（列出所有）

### 遺留問題
- （如有）
```

---

#### 任務 2：編譯測試與錯誤修復
**狀態**：⏳ 待執行
**前置條件**：任務 1 完成
**預估時間**：1-2 小時

**執行步驟**：
1. 執行 TypeScript 編譯：`npm run build` 或 `npx tsc`
2. 記錄所有編譯錯誤
3. 分類錯誤類型：
   - 型別不匹配
   - 缺失欄位
   - 命名不一致
4. 系統化修復錯誤
5. 確認 mock-server 可正常啟動

**完成標準**：
- ✅ 無 TypeScript 編譯錯誤
- ✅ mock-server 正常啟動（測試端點回應）

---

#### 任務 3：擴展 AuditLog 覆蓋率
**狀態**：⏳ 待執行
**當前進度**：20% → 目標 100%
**預估時間**：1 天
**提示詞文件**：`ai_prompts_for_improvement.md` (Prompt 3)

**已完成實體** (3/15)：
- ✅ AlertRule (CREATE, UPDATE, DELETE)
- ✅ Resource (CREATE, UPDATE, DELETE)
- ✅ Incident (CREATE, NOTIFY)

**待完成實體** (12/15)：
- Dashboard CRUD
- User CRUD
- Team CRUD
- Role CRUD
- AutomationPlaybook CRUD
- AutomationTrigger CRUD
- NotificationChannel CRUD
- NotificationStrategy CRUD
- SilenceRule CRUD
- ResourceGroup CRUD
- Datasource CRUD
- DiscoveryJob CRUD

**執行步驟**：
1. 讀取 `ai_prompts_for_improvement.md` 的 Prompt 3
2. 在 `handlers.ts` 中為每個實體的 CREATE/UPDATE/DELETE 操作加入 `auditLogMiddleware` 呼叫
3. 參考已完成的 AlertRule 實現（handlers.ts:566, 583, 600）
4. 測試每個端點確保 AuditLog 正確記錄

**完成標準**：
- ✅ 12 個實體的 CRUD 操作都有 AuditLog
- ✅ AuditLog 覆蓋率達 100%

---

### 🔵 中優先級（1-2 週內）

#### 任務 4：外鍵驗證完整化
**預估時間**：1 天
**提示詞文件**：`ai_prompts_for_improvement.md` (Prompt 4)

**執行步驟**：
1. 讀取 Prompt 4 獲取詳細指引
2. 為所有外鍵欄位加入驗證邏輯
3. 返回 404 或 400 錯誤當關聯資源不存在

---

#### 任務 5：生成 OpenAPI 規範
**預估時間**：0.5 天
**提示詞文件**：`ai_prompts_for_improvement.md` (Prompt 5)

**輸出**：`openapi.yaml`

---

#### 任務 6：生成資料庫 Schema
**預估時間**：0.5 天
**提示詞文件**：`ai_prompts_for_improvement.md` (Prompt 6)

**輸出**：`db_schema.sql`

---

## 📚 文檔導航（必讀）

### 核心文檔
| 文檔 | 用途 |
|------|------|
| [TASKS.md](TASKS.md) | 📋 集中改進任務清單（逐項執行） |
| **AGENT.md** | 🤖 AI Agent 執行指引（本文件） |

### 分析報告
| 文檔 | 內容 | 用途 |
|------|------|------|
| **docs/reports/platform_functionality_verification.md** | 平台功能完整性驗證 | 了解功能缺口 |
| **docs/reports/database_schema_analysis.md** | 資料庫結構分析 | 了解資料模型 |
| **docs/reports/data_lineage_verification.md** | 數據血緣追蹤驗證 | 評估追蹤能力 |


### 執行指引
| 文檔 | 用途 | 目標讀者 |
|------|------|----------|
| **ai_prompts_for_improvement.md** | 6 個結構化提示詞 | AI/開發者 |

---

## 🎯 執行策略

### 推薦執行順序

```
第 1 步：db.ts 更新（使用 db_update_prompt.md）
   ↓
第 2 步：編譯測試與錯誤修復
   ↓
第 3 步：AuditLog 擴展至 100%
   ↓
第 4 步：外鍵驗證完整化
   ↓
第 5 步：生成 OpenAPI 和 SQL Schema
```

### 替代策略（如遇阻塞）

如果 db.ts 更新遇到困難：
- **選項 A**：先完成 AuditLog 擴展
- **選項 B**：先完成外鍵驗證
- **選項 C**：先生成 OpenAPI/SQL Schema（基於當前狀態）

---

## 🔍 關鍵檔案位置

| 檔案 | 路徑 | 用途 |
|------|------|------|
| **types.ts** | `/Users/zoe/Downloads/sre-platform-app/types.ts` | 型別定義（✅ 已更新） |
| **handlers.ts** | `/Users/zoe/Downloads/sre-platform-app/mock-server/handlers.ts` | API 處理邏輯（✅ 已更新） |
| **db.ts** | `/Users/zoe/Downloads/sre-platform-app/mock-server/db.ts` | 模擬資料（⏳ 待更新） |
| **auditLog.ts** | `/Users/zoe/Downloads/sre-platform-app/mock-server/auditLog.ts` | AuditLog 中間件（✅ 已完成） |

---

## 📊 命名規範（重要！）

### Snake_case 轉換規則

所有欄位名稱必須使用 **snake_case**：

#### 時間戳欄位
```typescript
createdAt      → created_at
updatedAt      → updated_at
deletedAt      → deleted_at
occurredAt     → occurred_at
lastLoginAt    → last_login_at
lastRunAt      → last_run_at
```

#### ID 欄位
```typescript
resourceId     → resource_id
ruleId         → rule_id
teamId         → team_id
ownerId        → owner_id
incidentId     → incident_id
```

#### 複合詞欄位
```typescript
aiAnalysis           → ai_analysis
automationEnabled    → automation_enabled
conditionsSummary    → conditions_summary
targetResourceIds    → target_resource_ids
lastLoginAt          → last_login_at
```

**完整對照表**：參見 `db_update_prompt.md` 或 `naming_unification_report.md`

---

## ⚠️ 重要注意事項

### 不要修改的項目
- ❌ 變數名稱（如 `const resourceId = ...` 可保持）
- ❌ 函數名稱
- ❌ 註解和字串內容
- ❌ import/export 語句

### 只修改的項目
- ✅ 物件屬性名稱（object literal properties）
- ✅ 介面欄位名稱（interface field names）
- ✅ 型別定義（type definitions）

### Breaking Changes 警告
- ⚠️ 命名改為 snake_case 是 **Breaking Change**
- ⚠️ 前端元件需同步更新（約 230+ 處）
- ⚠️ 無向後兼容，直接全面轉換

---

## 🧪 測試與驗證

### 編譯測試
```bash
cd /Users/zoe/Downloads/sre-platform-app
npm run build
# 或
npx tsc
```

### 啟動 Mock Server
```bash
cd /Users/zoe/Downloads/sre-platform-app/mock-server
npm run dev
# 或
node index.js
```

### 測試端點（範例）
```bash
# 測試 GET /api/incidents
curl http://localhost:3001/api/incidents

# 測試 POST /api/incidents
curl -X POST http://localhost:3001/api/incidents \
  -H "Content-Type: application/json" \
  -d '{"resource_id": "res-1", "rule_id": "rule-1", ...}'
```

---

## 📝 回報格式

完成任務後，請提供以下格式的報告：

```markdown
## 任務完成報告：[任務名稱]

### 執行摘要
- 任務名稱：
- 執行時間：
- 完成狀態：✅ / ⚠️ / ❌

### 統計數據
- 修改檔案數：
- 修改行數：
- 新增/刪除/修改：

### 完成項目
- [ ] 項目 1
- [ ] 項目 2
- ...

### 遺留問題（如有）
- 問題 1：描述 + 建議解決方案
- 問題 2：...

### 驗證結果
- [ ] 編譯通過
- [ ] 測試通過
- [ ] Mock Server 正常啟動

### 下一步建議
- 建議 1
- 建議 2
```

---

## 🚀 開始執行

### 快速啟動（推薦）

**立即執行高優先級任務 1：**

```bash
# 1. 讀取執行指引
Read: /Users/zoe/Downloads/sre-platform-app/db_update_prompt.md

# 2. 讀取目標檔案
Read: /Users/zoe/Downloads/sre-platform-app/mock-server/db.ts

# 3. 依照 db_update_prompt.md 的指引系統化替換
# 4. 使用 Edit 工具進行替換
# 5. 完成後回報統計
```

---

## 📞 支援與協作

- **進度追蹤**：更新 `implementation_progress.md`
- **總覽更新**：更新 `progress_summary.md`
- **問題回報**：在任務完成報告中詳細說明

---

## 📌 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| v1.0 | 2025-10-01 | 初始版本 - 建立 AI Agent 執行指引 |

---

**維護者**：Claude Code
**最後更新**：2025-10-01
**狀態**：Active - 可供 AI Agent 執行使用
