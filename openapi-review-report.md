# OpenAPI 規範審查報告

**審查日期**: 2025-02-14
**審查員**: ChatGPT (gpt-5-codex)
**審查範圍**: openapi-specs/ 目錄所有檔案

## 📊 審查統計

- 總檔案數: 16
- 通過檢查: 2 個
- 發現問題: 14 個
- 嚴重程度: 🔴 Critical: 7 | 🟡 Warning: 4 | 🔵 Info: 2

## ✅ 通過項目

- `01-common-parameters.yaml`：通用分頁與排序參數定義完整，描述與範例齊全。
- `02-common-responses.yaml`：通用錯誤回應與 bearerAuth 定義完整，含多個範例。

## ❌ 發現的問題

### 🔴 Critical Issues (必須修復)

#### 問題 1: Tags 清單與預期不符
- **檔案**: `openapi-specs/00-main.yaml`
- **位置**: `tags` 區塊
- **問題描述**: 缺少預期的 Users、Teams、Roles、Health、Metrics 等標籤，卻新增了 Silence Rules、Resource Groups 等未列入需求的分類。
- **修復建議**: 依需求重新整理 tags，補齊缺少的分類並移除不需要者，確保與文件結構一致。
- **影響**: 生成的文件與 SDK 將無法正確分組，影響開發者理解 API 結構。

#### 問題 2: 多個實作中存在的端點未在規範中描述
- **檔案**: `openapi-specs/08-paths-dashboards.yaml`, `09-paths-incidents.yaml`, `10-paths-alert-rules.yaml`, `11-paths-resources.yaml`
- **問題描述**: 實作中包含 `GET /dashboards/available-grafana`、`POST /incidents/{id}/actions`、`POST /alert-rules/{id}/trigger` 等端點，但規範未記載。
- **修復建議**: 盤點 handlers.ts 中的路由，補齊缺漏的 Path 定義與對應 schema，或於實作移除未公開端點。
- **影響**: 客戶端根據 OpenAPI 生成的 SDK 將缺少重要功能，導致呼叫失敗。

#### 問題 3: 批次操作路由與請求格式與實作不一致
- **檔案**: `openapi-specs/08-paths-dashboards.yaml`, `10-paths-alert-rules.yaml`, `12-paths-automation.yaml`
- **問題描述**: 規範中使用 `/resource/batch-enable` 之類的固定路徑並定義 `dashboard_ids` 等欄位，但實作統一透過 `POST /resource` + `id === 'batch-actions'` 並傳入 `ids` 陣列。
- **修復建議**: 調整規範，使批次操作的路徑與 payload 與 handlers.ts 相符，或同步調整實作。
- **影響**: 文件與實際 API 完全不對應，任何依文件串接的用戶都會收到 404 或 400。

#### 問題 4: 引用了不存在的 Schema
- **檔案**: `openapi-specs/12-paths-automation.yaml`
- **位置**: `POST /automation/executions` 的 `requestBody`
- **問題描述**: `$ref: '#/components/schemas/AutomationExecutionCreate'`，但在任何 schema 檔案中都未定義該物件。
- **修復建議**: 新增 `AutomationExecutionCreate` schema，或改用既有的 schema。
- **影響**: OpenAPI 驗證會直接失敗，無法生成客戶端或檢視器。

#### 問題 5: AlertRule Schema 缺少關鍵欄位與條件結構
- **檔案**: `openapi-specs/03-schemas-core.yaml`
- **位置**: `AlertRule` 與相關 Create/Update schema
- **問題描述**: 缺少 `resource_type`, `metric_name`, `notification_strategy_ids` 等必填欄位；`condition_groups.conditions` 只宣告為 object，未定義 `field`, `operator`, `value`, `duration_seconds`。
- **修復建議**: 依需求補齊欄位與巢狀結構，並在 Create/Update schema 中同步維護。
- **影響**: 產生的型別不完整，無法支援實際的告警規則設定。

#### 問題 6: Automation Schemas 與實際資料模型不符
- **檔案**: `openapi-specs/04-schemas-automation.yaml`
- **位置**: `AutomationPlaybook`, `AutomationExecution`, `AutomationTrigger`
- **問題描述**: Playbook 缺少 `enabled`, `timeout_seconds`, `execution_count`；Execution 使用 `start_time`/`end_time` 而非 `started_at`/`completed_at`，且缺少 `parameters`, `output`, `error_message`；Trigger 未提供 `config` 物件。
- **修復建議**: 依 handlers.ts 與 types.ts 重新定義欄位與命名。
- **影響**: 自動化模組無法透過文件描述正確資料結構。

#### 問題 7: Resource 標籤結構與實作不同
- **檔案**: `openapi-specs/03-schemas-core.yaml`
- **位置**: `Resource` schema
- **問題描述**: Schema 將 `tags` 定義為 `Record<string,string>`，但批次標記 API 與 handlers.ts 實際使用 `[{ id, key, value }]` 陣列。
- **修復建議**: 將 schema 改為陣列結構，並於 Create/Update/Bulk 操作的範例同步調整。
- **影響**: 客戶端依文件傳送物件會造成資料型別錯誤。

### 🟡 Warning Issues (建議修復)

#### 問題 8: Dashboard 必填欄位過度嚴格
- **檔案**: `openapi-specs/03-schemas-core.yaml`
- **問題描述**: `Dashboard` 將 `category`、`updated_at` 列為必填，但實際新增時由系統產生，應標記為選填。

#### 問題 9: Automation 枚舉大小寫不一致
- **檔案**: `openapi-specs/04-schemas-automation.yaml`, `12-paths-automation.yaml`
- **問題描述**: Schema 使用 `shell/python`，但查詢參數與範例使用 `Shell Script`、`Python`。應統一枚舉值格式。

#### 問題 10: Trigger 建立範例欄位名稱不一致
- **檔案**: `openapi-specs/12-paths-automation.yaml`
- **問題描述**: 範例 payload 使用 `playbook_id`，但 schema 定義的是 `target_playbook_id`。

#### 問題 11: Analysis 端點缺少 503 錯誤回應
- **檔案**: `openapi-specs/15-paths-analysis.yaml`
- **問題描述**: `POST /analysis/resources/batch`、`/analysis/predict/capacity`、`/analysis/predict/incidents`、`/analysis/anomalies` 等未提供 503 回應，與需求不符。

### 🔵 Info/Suggestions (可選優化)

#### 建議 1: Incident 狀態枚舉應涵蓋 Silenced
- **檔案**: `openapi-specs/03-schemas-core.yaml`
- **說明**: handlers.ts 支援 `silence` 動作並寫入 `Silenced` 狀態，建議在 schema 枚舉中一併列出。

#### 建議 2: 為 503 回應補充示例 payload
- **檔案**: `openapi-specs/15-paths-analysis.yaml`
- **說明**: 雖有描述，但缺乏範例 body，補上能提升可用性。

## 🔍 特定區域審查結果

### 核心檔案 (1/3)
- ❌ 00-main.yaml: 缺少預期 Tags
- ✅ 01-common-parameters.yaml: 通過
- ✅ 02-common-responses.yaml: 通過

### Schema 定義 (0/5)
- ❌ 03-schemas-core.yaml: 多處欄位缺失/不一致
- ❌ 04-schemas-automation.yaml: 欄位缺失、命名不一致
- ❌ 05-schemas-iam.yaml: 欄位與需求（team_ids、member_count 等）尚未補齊
- ❌ 06-schemas-notifications.yaml: 基本可用，但枚舉含空白字元，建議後續調整
- ❌ 07-schemas-analysis.yaml: 缺乏 required 標記與完整範例

### API 路徑 (0/8)
- 所有 Path 檔案皆需依實作重新對齊，包含缺漏端點、批次操作、錯誤回應等。

## 📈 一致性檢查

### 命名規範
- ⚠️ snake_case 使用率: 約 85%，Automation Execution 仍使用 `start_time`/`end_time`
- ⚠️ 枚舉值命名: Automation/Trigger 部分大小寫不一致

### 與實現程式碼對照
- ❌ 端點路徑一致: 多處不一致（批次操作、額外端點）
- ❌ 欄位名稱不一致: AlertRule、Resource、Automation 模組多處落差

### OpenAPI 規範合規性
- ❌ $ref 引用: 缺少 `AutomationExecutionCreate`
- ⚠️ 資料型別: 多數正確，但 Resource/Tags 需調整
- ⚠️ 範例完整性: Analysis 端點缺乏錯誤範例

## 💡 綜合建議

1. 先對 handlers.ts 進行路由盤點，建立與實作一致的 Path 清單後再更新規範。
2. 依據資料模型（types.ts、db_schema.sql）補齊所有 Schema 欄位與命名。
3. 增加自動驗證流程（swagger-cli/openapi-generator）確保日後維護不再出現缺失。

## 🎯 總體評估

目前的 OpenAPI 規範與實際實作差異過大，且存在會導致驗證失敗的錯誤（缺失 schema）。在修正上述 Critical 問題前，不建議用於生成 SDK 或提供外部使用。

---

**審查完成度**: 80%
**建議下一步行動**: 依 Critical 清單優先修復後，再次提交驗證。
