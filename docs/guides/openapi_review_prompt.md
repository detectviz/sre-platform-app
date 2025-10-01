# OpenAPI 規範審查提示詞

本文件提供給 AI 審查員使用，用於全面審查 SRE Platform 的 OpenAPI 3.0 規範檔案。

---

## 📋 審查任務說明

你是一位專業的 API 架構審查專家，負責審查 SRE Platform 的 OpenAPI 3.0 規範檔案。請按照以下檢查清單，對 `openapi-specs/` 目錄下的所有 YAML 檔案進行全面審查。

## 🎯 審查目標

1. **完整性** - 確保所有必要的端點、參數、回應都已定義
2. **一致性** - 確保命名規範、資料結構在整個 API 中保持一致
3. **正確性** - 確保符合 OpenAPI 3.0 規範，無語法錯誤
4. **可用性** - 確保文檔清晰易懂，範例完整可用
5. **與實現一致** - 確保與 `src/handlers.ts` 實際實現相符

## 📂 審查檔案清單

請審查以下 16 個檔案：

### 核心檔案
- [ ] `00-main.yaml`
- [ ] `01-common-parameters.yaml`
- [ ] `02-common-responses.yaml`

### Schema 定義
- [ ] `03-schemas-core.yaml`
- [ ] `04-schemas-automation.yaml`
- [ ] `05-schemas-iam.yaml`
- [ ] `06-schemas-notifications.yaml`
- [ ] `07-schemas-analysis.yaml`

### API 路徑
- [ ] `08-paths-dashboards.yaml`
- [ ] `09-paths-incidents.yaml`
- [ ] `10-paths-alert-rules.yaml`
- [ ] `11-paths-resources.yaml`
- [ ] `12-paths-automation.yaml`
- [ ] `13-paths-iam.yaml`
- [ ] `14-paths-notifications.yaml`
- [ ] `15-paths-analysis.yaml`

## 🔍 詳細審查檢查清單

### 1. 核心檔案審查

#### 00-main.yaml
- [ ] OpenAPI 版本正確（3.0.0 或更高）
- [ ] API 基本資訊完整（title, version, description）
- [ ] 伺服器 URL 定義正確
- [ ] 所有 tags 都已定義且有描述
- [ ] security 全域配置正確

**預期 Tags（共 13 個）**:
- Dashboards, Incidents, Alert Rules, Resources
- Automation, IAM, Notifications, Analysis
- Users, Teams, Roles, Health, Metrics

#### 01-common-parameters.yaml
- [ ] `IdParam` - 路徑參數定義
- [ ] `PageParam` - 分頁參數（預設值：1）
- [ ] `PageSizeParam` - 每頁筆數（預設值：20，範圍：1-100）
- [ ] `SortByParam` - 排序欄位
- [ ] `SortOrderParam` - 排序方向（asc/desc）
- [ ] 所有參數都有 description 和 example

#### 02-common-responses.yaml
- [ ] `BadRequest` (400) - 請求參數錯誤
- [ ] `Unauthorized` (401) - 未授權
- [ ] `Forbidden` (403) - 無權限
- [ ] `NotFound` (404) - 資源不存在
- [ ] `InternalServerError` (500) - 伺服器錯誤
- [ ] `bearerAuth` security scheme 定義（JWT）
- [ ] 每個回應都有 schema 和 example

### 2. Schema 定義審查

對於每個 schema，請檢查：

#### 通用檢查項目
- [ ] 所有欄位使用 **snake_case** 命名（不是 camelCase）
- [ ] 必填欄位使用 `required` 陣列明確標記
- [ ] 每個欄位都有 `type` 定義
- [ ] 重要欄位有 `description` 說明
- [ ] 枚舉值使用 `enum` 定義且完整
- [ ] 時間戳欄位使用 `format: date-time`
- [ ] 每個 schema 都有實際的 `example`
- [ ] Create/Update schema 不包含唯讀欄位（id, created_at, updated_at）

#### 03-schemas-core.yaml

**Dashboard Schema**:
- [ ] 必填欄位：id, name, type, created_at
- [ ] type 枚舉：built-in, custom, grafana
- [ ] 包含：grafana_url, grafana_dashboard_uid, resource_ids
- [ ] 軟刪除支援：deleted_at (nullable)

**Incident Schema**:
- [ ] 必填欄位：id, resource_id, rule_id, summary, severity, status, created_at
- [ ] severity 枚舉：Critical, Warning, Info
- [ ] status 枚舉：New, Acknowledged, Investigating, Resolved, Closed
- [ ] impact 枚舉：High, Medium, Low
- [ ] 包含：assignee, resolved_at, resolution_note, tags

**AlertRule Schema**:
- [ ] 必填欄位：id, name, resource_type, metric_name, severity, enabled, created_at
- [ ] condition_groups 結構正確（operator, conditions 陣列）
- [ ] condition 包含：field, operator, value, duration_seconds
- [ ] notification_strategy_ids 陣列

**Resource Schema**:
- [ ] 必填欄位：id, name, type, status, created_at
- [ ] status 枚舉：Healthy, Warning, Critical, Unknown
- [ ] 包含：metadata (object), tags (object), metrics (object)

**BatchResult Schema**:
- [ ] 必填欄位：success, updated
- [ ] 包含：skipped_ids (陣列), message

#### 04-schemas-automation.yaml

**AutomationPlaybook**:
- [ ] type 枚舉：Shell Script, Python, Ansible, Terraform
- [ ] 包含：content, enabled, timeout_seconds
- [ ] execution_count 統計欄位

**AutomationExecution**:
- [ ] status 枚舉：Pending, Running, Success, Failed, Cancelled
- [ ] trigger_type 枚舉：Manual, Scheduled, Webhook, Incident, Alert
- [ ] 包含：parameters, output, error_message
- [ ] 時間欄位：started_at, completed_at

**AutomationTrigger**:
- [ ] type 枚舉：Schedule (Cron), Webhook, Event (Incident/Alert)
- [ ] config 為 object（根據 type 不同而異）

#### 05-schemas-iam.yaml

**User**:
- [ ] 必填欄位：id, name, email, role
- [ ] role 枚舉：Admin, SRE, Developer, Viewer
- [ ] 包含：team_ids (陣列), avatar_url, last_login_at

**Team**:
- [ ] 必填欄位：id, name, owner_id
- [ ] 包含：member_ids (陣列), member_count

**Role**:
- [ ] 必填欄位：id, name, permissions
- [ ] permissions 為字串陣列
- [ ] 範例權限格式：`resource:action`（如 incidents:read）

#### 06-schemas-notifications.yaml

**NotificationChannel**:
- [ ] type 枚舉：Email, Webhook (通用), Slack, LINE Notify, SMS
- [ ] config 為 object（不同類型配置不同）
- [ ] last_test_result 枚舉：success, failed, not_tested

**NotificationStrategy**:
- [ ] 必填欄位：id, name, enabled, trigger_condition
- [ ] severity_levels 陣列
- [ ] impact_levels 陣列
- [ ] channel_ids 陣列，channel_count 數量

**NotificationHistoryRecord**:
- [ ] status 枚舉：sent, failed, pending
- [ ] 包含：incident_id, recipients (陣列), message, error

#### 07-schemas-analysis.yaml

**IncidentAnalysis**:
- [ ] 包含：summary, root_cause, impact_assessment
- [ ] recommended_actions 陣列
- [ ] related_incidents 陣列
- [ ] confidence_score (0-1 之間的浮點數)

**ResourceAnalysis**:
- [ ] risk_level 枚舉：low, medium, high, critical
- [ ] optimization_suggestions 陣列（包含 type, priority, suggestion, estimated_impact）
- [ ] predicted_issues 陣列（包含 issue_type, probability, timeframe）

**MultiIncidentAnalysis**:
- [ ] incident_ids 陣列
- [ ] correlation_found 布林值
- [ ] timeline 陣列（包含 timestamp, incident_id, event）

**LogAnalysis**:
- [ ] query, time_range 定義
- [ ] total_logs, error_count, warning_count 計數
- [ ] patterns_found 陣列
- [ ] anomalies 陣列

### 3. API 路徑審查

對於每個 API 端點，請檢查：

#### 通用檢查項目
- [ ] operationId 唯一且符合命名規範（camelCase 動詞+名詞）
- [ ] summary 簡短清晰（5-10 字）
- [ ] description 詳細說明功能
- [ ] tags 正確分類
- [ ] 所有參數都有 description 和適當的 example
- [ ] 回應包含所有可能的 HTTP 狀態碼
- [ ] 成功回應有完整的 schema 和 example
- [ ] 錯誤回應使用 `$ref` 引用通用回應
- [ ] 需要認證的端點在 responses 中包含 401

#### 標準 CRUD 端點檢查

**GET /resources** (列表)
- [ ] 支援分頁參數：page, page_size
- [ ] 支援排序參數：sort_by, sort_order
- [ ] 支援過濾參數（根據資源特性）
- [ ] 回應 200 包含：page, page_size, total, items
- [ ] 回應 400 (參數錯誤), 401 (未授權)

**POST /resources** (創建)
- [ ] requestBody 必須使用 Create schema
- [ ] requestBody 有完整範例
- [ ] 回應 201 返回完整的資源物件
- [ ] 回應 400 (驗證失敗), 401, 404 (外鍵不存在，如適用)

**GET /resources/{id}** (單一資源)
- [ ] 路徑參數使用 `$ref: '#/components/parameters/IdParam'`
- [ ] 回應 200 返回完整物件
- [ ] 回應 404, 401

**PATCH /resources/{id}** (更新)
- [ ] requestBody 使用 Update schema
- [ ] requestBody 有多個範例展示不同更新場景
- [ ] 回應 200 返回更新後的完整物件
- [ ] 回應 400, 404, 401

**DELETE /resources/{id}** (刪除)
- [ ] 回應 204 (無內容)
- [ ] 回應 404, 401
- [ ] description 說明是否為軟刪除

#### 批次操作端點檢查

所有批次端點應：
- [ ] 使用 POST 方法
- [ ] requestBody 包含 `resource_ids` 陣列（minItems: 1）
- [ ] 回應 200 返回 BatchResult schema
- [ ] BatchResult 範例包含 success, updated, skipped_ids, message

#### 08-paths-dashboards.yaml

檢查端點：
- [ ] GET /dashboards - 列表（過濾：type, category）
- [ ] POST /dashboards - 創建（範例：grafana 和 custom）
- [ ] GET /dashboards/{id}
- [ ] PATCH /dashboards/{id}
- [ ] DELETE /dashboards/{id} - 軟刪除
- [ ] POST /dashboards/batch-actions - 批次刪除

#### 09-paths-incidents.yaml

檢查端點：
- [ ] GET /incidents - 列表（過濾：status, severity, assignee）
- [ ] POST /incidents - 創建
- [ ] GET /incidents/{id}
- [ ] PATCH /incidents/{id}
- [ ] DELETE /incidents/{id}
- [ ] POST /incidents/batch-close - 批次關閉（含 resolution_note）
- [ ] POST /incidents/batch-assign - 批次指派（assignee_id 或 assignee_name）
- [ ] POST /incidents/batch-ignore - 批次忽略

特別檢查：
- [ ] batch-assign 範例展示兩種指派方式（by ID 和 by name）

#### 10-paths-alert-rules.yaml

檢查端點：
- [ ] GET /alert-rules - 列表（過濾：enabled, severity, resource_type）
- [ ] POST /alert-rules - 創建
- [ ] GET /alert-rules/{id}
- [ ] PATCH /alert-rules/{id}
- [ ] DELETE /alert-rules/{id}
- [ ] POST /alert-rules/batch-enable
- [ ] POST /alert-rules/batch-disable
- [ ] POST /alert-rules/batch-delete

#### 11-paths-resources.yaml

檢查端點：
- [ ] GET /resources - 列表（過濾：type, status, environment, team_id）
- [ ] POST /resources - 創建
- [ ] GET /resources/{id}
- [ ] PATCH /resources/{id}
- [ ] DELETE /resources/{id}
- [ ] GET /resources/{id}/metrics - 取得指標（time_range 參數）
- [ ] POST /resources/batch-tag - 批次標記（支援 merge 和 replace 模式）
- [ ] POST /resources/batch-delete

特別檢查：
- [ ] metrics 端點回應包含 current, average, max, min, unit

#### 12-paths-automation.yaml

檢查三大區塊：

**Playbooks**:
- [ ] GET /automation/playbooks - 列表（過濾：type, enabled）
- [ ] POST /automation/playbooks - 創建（範例：Ansible 和 Shell）
- [ ] GET /automation/playbooks/{id}
- [ ] PATCH /automation/playbooks/{id}
- [ ] DELETE /automation/playbooks/{id}
- [ ] POST /automation/playbooks/batch-enable
- [ ] POST /automation/playbooks/batch-disable

**Executions**:
- [ ] GET /automation/executions - 列表（過濾：status, playbook_id, trigger_type）
- [ ] POST /automation/executions - 手動觸發
- [ ] GET /automation/executions/{id}
- [ ] DELETE /automation/executions/{id} - 取消執行（說明限制條件）

**Triggers**:
- [ ] GET /automation/triggers - 列表（過濾：type, enabled）
- [ ] POST /automation/triggers - 創建（範例：Schedule 和 Event）
- [ ] GET /automation/triggers/{id}
- [ ] PATCH /automation/triggers/{id}
- [ ] DELETE /automation/triggers/{id}

#### 13-paths-iam.yaml

檢查三大區塊：

**Users**:
- [ ] GET /iam/users - 列表（過濾：role, team_id）
- [ ] POST /iam/users
- [ ] GET /iam/users/{id}
- [ ] PATCH /iam/users/{id}
- [ ] DELETE /iam/users/{id}
- [ ] POST /iam/users/batch-update-role
- [ ] POST /iam/users/batch-delete

**Teams**:
- [ ] GET /iam/teams
- [ ] POST /iam/teams
- [ ] GET /iam/teams/{id}
- [ ] PATCH /iam/teams/{id}
- [ ] DELETE /iam/teams/{id}
- [ ] POST /iam/teams/{id}/members - 新增成員
- [ ] DELETE /iam/teams/{id}/members - 移除成員

**Roles**:
- [ ] GET /iam/roles
- [ ] POST /iam/roles - 創建（permissions 範例）
- [ ] GET /iam/roles/{id}
- [ ] PATCH /iam/roles/{id}
- [ ] DELETE /iam/roles/{id}

特別檢查：
- [ ] 所有修改端點包含 403 Forbidden 回應
- [ ] Role permissions 範例格式正確（resource:action）

#### 14-paths-notifications.yaml

檢查三大區塊：

**Channels**:
- [ ] GET /notifications/channels - 列表（過濾：type, enabled）
- [ ] POST /notifications/channels - 創建（範例：Email 和 Slack）
- [ ] GET /notifications/channels/{id}
- [ ] PATCH /notifications/channels/{id}
- [ ] DELETE /notifications/channels/{id}
- [ ] POST /notifications/channels/{id}/test - 測試通知（特殊端點）
- [ ] POST /notifications/channels/batch-enable
- [ ] POST /notifications/channels/batch-disable

**Strategies**:
- [ ] GET /notifications/strategies - 列表（過濾：enabled）
- [ ] POST /notifications/strategies - 創建
- [ ] GET /notifications/strategies/{id}
- [ ] PATCH /notifications/strategies/{id}
- [ ] DELETE /notifications/strategies/{id}
- [ ] POST /notifications/strategies/batch-enable
- [ ] POST /notifications/strategies/batch-disable

**History**:
- [ ] GET /notifications/history - 列表（過濾：channel_type, status, incident_id, start_date, end_date）
- [ ] GET /notifications/history/{id}

特別檢查：
- [ ] test 端點回應包含 success 和 error 兩種情境
- [ ] history 支援時間範圍過濾

#### 15-paths-analysis.yaml

檢查 AI 分析端點：

**Incident Analysis**:
- [ ] POST /analysis/incidents/{id} - 單一事件分析
- [ ] POST /analysis/incidents/multi - 多事件關聯分析

**Resource Analysis**:
- [ ] POST /analysis/resources/{id} - 單一資源分析
- [ ] POST /analysis/resources/batch - 批次資源分析

**Log Analysis**:
- [ ] POST /analysis/logs - 日誌分析（必須參數：query, time_range）

**Predictive Analysis**:
- [ ] POST /analysis/predict/capacity - 容量預測
- [ ] POST /analysis/predict/incidents - 事件預測

**Anomaly Detection**:
- [ ] POST /analysis/anomalies - 異常檢測

特別檢查：
- [ ] 所有分析端點包含 503 (AI service unavailable) 回應
- [ ] requestBody 參數合理（time_window, analysis_depth, sensitivity）
- [ ] 回應包含 confidence_score 或 probability
- [ ] 預測回應包含時間序列資料結構

### 4. 命名規範一致性審查

檢查整個 API 的命名一致性：

#### 欄位命名
- [ ] **全部使用 snake_case**（如 created_at, resource_id, page_size）
- [ ] 時間戳欄位統一命名：created_at, updated_at, deleted_at, resolved_at, started_at, completed_at
- [ ] 外鍵統一命名：{resource}_id（如 resource_id, user_id, team_id）
- [ ] 陣列欄位複數形式：resource_ids, member_ids, permissions

#### 操作命名
- [ ] operationId 使用 camelCase
- [ ] 格式：動詞 + 名詞（如 listIncidents, createDashboard, batchAssignIncidents）
- [ ] 批次操作前綴：batch（如 batchEnableAlertRules）

#### 枚舉值命名
- [ ] Dashboard type: built-in, custom, grafana（小寫 kebab-case）
- [ ] Incident status: New, Acknowledged, Investigating, Resolved, Closed（首字母大寫）
- [ ] Severity: Critical, Warning, Info（首字母大寫）
- [ ] Impact: High, Medium, Low（首字母大寫）
- [ ] 確認整個 API 的枚舉值風格一致

### 5. 與實現程式碼對照

請對照 `src/handlers.ts` 檢查：

#### 端點路徑一致性
- [ ] handlers.ts 中的路由與 OpenAPI paths 完全對應
- [ ] HTTP 方法一致（GET, POST, PATCH, DELETE）
- [ ] 路徑參數名稱一致

#### 請求/回應欄位一致性
- [ ] handlers.ts 中使用的欄位名稱與 schema 定義一致
- [ ] 必填欄位檢查邏輯與 required 定義一致
- [ ] 枚舉值驗證與 enum 定義一致

#### 批次操作一致性
檢查以下批次操作是否在 handlers.ts 和 OpenAPI 中都存在：
- [ ] POST /incidents/batch-close
- [ ] POST /incidents/batch-assign
- [ ] POST /incidents/batch-ignore
- [ ] POST /dashboards/batch-actions
- [ ] POST /alert-rules/batch-enable, batch-disable, batch-delete
- [ ] POST /resources/batch-tag, batch-delete
- [ ] POST /automation/playbooks/batch-enable, batch-disable
- [ ] (其他批次操作...)

### 6. OpenAPI 3.0 規範合規性

#### 語法檢查
- [ ] 所有 `$ref` 引用正確且存在
- [ ] components 區塊正確組織（schemas, parameters, responses, securitySchemes）
- [ ] 沒有重複的 key
- [ ] YAML 語法正確（縮排、引號使用）

#### 資料型別檢查
- [ ] type 使用正確（string, integer, number, boolean, array, object）
- [ ] format 正確使用（date-time, email, uri, uuid）
- [ ] 數字型別有適當的 minimum, maximum 限制
- [ ] 字串型別有適當的 minLength, maxLength 限制
- [ ] 陣列型別有 items 定義和 minItems 限制（如適用）

#### 範例資料檢查
- [ ] 所有 schema 都有實際的 example
- [ ] 範例資料符合 schema 定義
- [ ] 範例使用真實感的資料（不是 "string", 123 這種占位符）
- [ ] 中文範例資料自然合理

### 7. 文檔品質審查

#### 描述完整性
- [ ] 每個端點都有清晰的 summary 和 description
- [ ] 重要參數都有 description 說明用途
- [ ] 枚舉值有註解說明含義（如適用）
- [ ] 複雜的 schema 有使用說明

#### 範例完整性
- [ ] 每個端點至少一個完整的請求範例
- [ ] 複雜端點有多個範例展示不同場景
- [ ] 錯誤回應有範例
- [ ] 範例資料真實可用

#### 易讀性
- [ ] 組織結構清晰
- [ ] 相關端點分組合理
- [ ] 註解適當使用
- [ ] 中英文混用時不影響閱讀

## 📤 審查報告格式

請以以下格式輸出審查結果：

```markdown
# OpenAPI 規範審查報告

**審查日期**: YYYY-MM-DD
**審查員**: [AI 名稱/版本]
**審查範圍**: openapi-specs/ 目錄所有檔案

## 📊 審查統計

- 總檔案數: 16
- 通過檢查: X 個
- 發現問題: Y 個
- 嚴重程度: 🔴 Critical: A | 🟡 Warning: B | 🔵 Info: C

## ✅ 通過項目

列出完全符合規範的檔案或檢查項目...

## ❌ 發現的問題

### 🔴 Critical Issues (必須修復)

#### 問題 1: [簡短描述]
- **檔案**: `檔案路徑`
- **位置**: 行數或 schema/path 名稱
- **問題描述**: 詳細說明問題
- **預期結果**: 應該如何
- **實際結果**: 目前如何
- **修復建議**: 具體的修復方法
- **影響**: 說明此問題的影響範圍

### 🟡 Warning Issues (建議修復)

#### 問題 2: [簡短描述]
...

### 🔵 Info/Suggestions (可選優化)

#### 建議 1: [簡短描述]
...

## 🔍 特定區域審查結果

### 核心檔案 (3/3)
- ✅ 00-main.yaml: 通過
- ⚠️ 01-common-parameters.yaml: 1 個 warning
- ✅ 02-common-responses.yaml: 通過

### Schema 定義 (5/5)
...

### API 路徑 (8/8)
...

## 📈 一致性檢查

### 命名規範
- ✅ snake_case 使用率: 100%
- ⚠️ 枚舉值命名不一致處: X 處

### 與實現程式碼對照
- ✅ 端點路徑一致: 100%
- ❌ 欄位名稱不一致: Y 處

### OpenAPI 規範合規性
- ✅ $ref 引用: 全部正確
- ✅ 資料型別: 正確使用
- ⚠️ 範例完整性: 缺少 Z 個範例

## 💡 綜合建議

1. [優先級最高的改進建議]
2. [次要改進建議]
3. [優化建議]

## 🎯 總體評估

[總結這份 OpenAPI 規範的整體品質，是否可以進入下一階段（合併、生成客戶端 SDK 等）]

---

**審查完成度**: [百分比]
**建議下一步行動**: [具體建議]
```

## 🔧 審查工具建議

審查完成後，建議使用以下工具進行自動驗證：

```bash
# 1. 使用 swagger-cli 驗證語法
npx swagger-cli validate openapi.yaml

# 2. 使用 openapi-generator 驗證
openapi-generator validate -i openapi.yaml

# 3. 使用 Swagger UI 視覺化檢查
npx swagger-ui-watcher openapi.yaml

# 4. 使用 Redoc 生成文檔預覽
npx redoc-cli serve openapi.yaml
```

## 📋 審查檢查清單總結

### 必須檢查 (Critical)
- [ ] 所有欄位使用 snake_case
- [ ] 所有必填欄位正確標記
- [ ] 所有 $ref 引用存在且正確
- [ ] 所有端點有完整的 HTTP 狀態碼回應
- [ ] 與 handlers.ts 實現一致

### 建議檢查 (Important)
- [ ] 所有 schema 有實際範例
- [ ] 枚舉值完整且一致
- [ ] 批次操作回應使用 BatchResult
- [ ] 分頁排序參數使用通用定義
- [ ] 錯誤回應使用 $ref 引用通用回應

### 優化檢查 (Nice to have)
- [ ] 描述文字清晰易懂
- [ ] 複雜端點有多個範例
- [ ] 中文內容自然流暢
- [ ] 組織結構優化

## 📞 問題回報

如發現問題，請在審查報告中：
1. 明確標示問題的嚴重程度（Critical/Warning/Info）
2. 提供具體的檔案位置和行數
3. 給出可執行的修復建議
4. 說明問題的影響範圍

---

**提示詞版本**: 1.0
**適用範圍**: SRE Platform OpenAPI 3.0 規範
**最後更新**: 2025-10-02
