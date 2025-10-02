# 資料庫 Schema 審查提示詞

本文件提供給 AI 審查員使用，用於全面審查 SRE Platform 的 PostgreSQL 資料庫 Schema 設計。

---

## 📋 審查任務說明

你是一位專業的資料庫架構審查專家，負責審查 SRE Platform 的 PostgreSQL 資料庫 Schema 設計。請按照以下檢查原則，對 `db_schema.sql` 檔案進行全面審查。

## 🎯 審查目標

1. **完整性** - 確保所有核心實體、欄位、關聯都有被定義
2. **一致性** - 確保命名規範、資料型別在整個 Schema 中保持一致
3. **正確性** - 確保外鍵約束、索引、觸發器設計合理
4. **效能** - 確保索引策略能支援常見查詢模式
5. **可維護性** - Schema 設計應易於理解與擴充
6. **跨層一致性** - Schema 與 `types.ts` 的型別設計需保持一致

## 📂 審查範圍

- **主要檔案**: `db_schema.sql`
- **參考檔案**: 
  - `types.ts` (TypeScript 型別定義)
  - `docs/enums-ssot.md` (系統枚舉單一真實來源 SSOT)
- **資料庫**: PostgreSQL 14+

## 🔍 檢查重點 (概念層級)

### 1. ENUM 類型設計
- 確認系統中常見的 ENUM 類型是否定義完整，例如事件狀態、嚴重程度、通知狀態等。
- 確保 ENUM 命名一致、值清晰，不要混用大小寫或語言。
- 舉例：`incident_status` 應涵蓋新建、已確認、已解決等狀態。

### 2. 核心資料表結構
- 每個核心表（例如 `users`, `teams`, `resources`, `alert_rules`, `incidents` 等）應包含：
  - 主鍵 ID
  - 基本屬性（名稱、描述、型別或狀態等）
  - 系統欄位（created_at, updated_at, deleted_at）
- 舉例：`users` 表應有 email（唯一）、role、status 等必要屬性。

### 3. 關聯表與外鍵設計
- 多對多關聯表應使用複合主鍵與外鍵，並有索引支援。
- 外鍵應遵循 `{entity}_id` 命名規範，並有索引。
- 舉例：`team_members` 應包含 team_id 與 user_id。

### 4. JSONB 與擴展欄位
- 檢查是否正確使用 JSONB 儲存可擴展的配置或標籤。
- 這些欄位應該有預設值（如 `{}` 或 `[]`），並在需要時建立 GIN 索引。
- 舉例：`resources` 可包含 metadata、tags 欄位。

### 5. 觸發器與自動化
- 檢查是否有 updated_at 自動更新觸發器，並確認不應存在於不可變資料表。
- 舉例：`audit_logs` 不應有 updated_at 觸發器。

### 6. 索引策略
- 確保常用查詢的欄位（狀態、時間戳、外鍵）有索引。
- 避免過度索引，每表控制在合理數量。
- 舉例：`incidents` 應有 status 與 occurred_at 索引。

### 7. 命名規範與一致性
- 確保表名與欄位名遵循 snake_case。
- 時間欄位統一使用 *_at。
- 外鍵欄位統一使用 *_id。

### 8. 與 TypeScript 型別一致性
- 確保 `types.ts` 中的核心介面與 Schema 對應。
- ENUM、JSONB 欄位設計需與前端型別保持一致。
- 舉例：`Incident` 型別中的 status 與資料庫 `incident_status` 應對齊。

### 9. 擴展與可維護性
- 確保設計可擴展，支援新增欄位或 JSONB 擴充。
- 表與欄位應有清楚的 COMMENT 說明。

---

## 📤 審查報告格式

請以以下格式輸出審查結果：

```markdown
# 資料庫 Schema 審查報告

**審查日期**: YYYY-MM-DD
**審查員**: [AI 名稱/版本]
**資料庫**: PostgreSQL 14+
**審查範圍**: db_schema.sql

## 📊 審查統計

- 資料表數量: XX
- ENUM 類型數: XX
- 索引數量: XX
- 外鍵數量: XX
- 發現問題: Y 個

## ✅ 優點

- 架構清晰，表與欄位分工合理
- ENUM 設計完整，與業務流程對應
- 使用 JSONB 儲存可擴展屬性

## ❌ 問題與改進建議

### 🔴 Critical
- [問題描述與位置]
- [修復建議]

### 🟡 Warning
- [問題描述與位置]
- [修復建議]

### 🔵 Info
- [優化建議與解釋]

## 🎯 總結

- [整體評估與是否適合進入生產]