# OpenAPI 規範審查提示詞

本文件提供給 AI 審查員使用，用於全面審查 SRE Platform 的 OpenAPI 3.0 規範檔案。

---

## 📋 審查任務說明

你是一位專業的 API 架構審查專家，負責審查 SRE Platform 的 OpenAPI 3.0 規範檔案。請按照以下檢查清單，對 `openapi-specs/` 目錄下的所有 YAML 檔案進行全面審查。

## 🎯 審查目標

1. **完整性** - 確保所有必要的端點、參數、回應都有涵蓋
2. **一致性** - 確保命名規範、資料結構在整個 API 中保持一致
3. **正確性** - 確保符合 OpenAPI 3.0 規範，無語法錯誤
4. **可用性** - 確保文檔清晰易懂，範例合理且實用
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

---

## 🔍 詳細審查檢查原則 (概念層級)

### 1. 核心檔案
- OpenAPI 版本是否正確
- API 基本資訊（title, version, description）是否清楚
- Server URL 是否正確定義
- tags 是否完整，並有描述
- 全域 security 設定是否正確

### 2. Schema 定義
- 欄位命名是否統一（建議 snake_case）
- 必填欄位是否清楚標記
- 每個欄位是否有型別與描述
- 枚舉值是否有明確定義並合理
- 時間欄位是否使用 `date-time` 格式
- 是否有提供實際且可讀的範例
- Create/Update schema 是否避免包含唯讀欄位（例如 id, created_at）
- **舉例**：事件 (Incident) Schema 應包含 id、summary、severity、status 等核心欄位

### 3. API 路徑
- 每個 operation 是否有唯一的 operationId
- summary 與 description 是否清楚
- tags 是否分類合理
- 參數是否有描述與範例
- 回應是否涵蓋常見 HTTP 狀態碼（200, 400, 401, 404, 500）
- 成功回應是否提供 schema 與範例
- 批次操作是否回傳標準的批次結果格式
- **舉例**：`GET /resources` 應支援分頁與篩選，回應包含 items 與 total

### 4. 命名規範與一致性
- 欄位命名是否一致（例如 created_at, updated_at）
- 外鍵欄位是否統一使用 *_id
- 陣列欄位是否使用複數形式
- 枚舉值是否採一致風格（例如全小寫或首字大寫，不要混用）

### 5. 與實作對照
- API 路由是否與 `src/handlers.ts` 中的實作對應
- 請求與回應欄位是否一致
- 必填欄位檢查邏輯是否對齊
- 枚舉值是否與程式內定義一致

### 6. OpenAPI 合規性
- `$ref` 引用是否正確
- components 是否正確組織（schemas, parameters, responses）
- 沒有重複 key 或 YAML 語法錯誤
- 型別使用是否正確（string, integer, boolean, object, array）
- 是否有適當的長度或範圍限制
- 是否有提供真實感的範例資料

### 7. 文檔品質
- 描述是否完整且易於理解
- 是否有涵蓋不同情境的範例（成功與失敗）
- 範例是否真實且貼近使用情境
- 文件結構是否清晰，易於閱讀

---

## 📤 審查報告格式

請輸出一份審查報告，包含：
- 審查統計（檔案數、通過數、問題數）
- 優點與符合規範的部分
- 問題與改進建議（標記 Critical/Warning/Info）
- 一致性檢查結果（命名、枚舉、型別）
- 綜合建議與總體評估

---

**提示詞版本**: 2.0  
**適用範圍**: SRE Platform OpenAPI 3.0 規範  
**最後更新**: 2025-10-02