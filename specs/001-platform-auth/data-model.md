# Data Model: Platform Auth

## Overview

Platform Auth 的資料模型主要關注身份提供商（IdP）的管理、認證配置、安全審計等核心實體。本模型定義了多租戶身份認證系統的資料結構和關係。

## Core Entities

### IdentityProvider
身份提供商的核心實體，代表已配置的外部認證服務。

**屬性**:
- `id`: string (primary key)
- `name`: string (IdP 顯示名稱)
- `type`: enum ("keycloak", "auth0", "azure_ad", "custom") (IdP 類型)
- `is_active`: boolean (啟用狀態)
- `priority_order`: integer (優先順序，用於故障轉移)
- `created_at`: timestamp
- `updated_at`: timestamp
- `tenant_id`: string (多租戶支援)

### IdPConfiguration
IdP 特定的配置參數實體。

**屬性**:
- `id`: string
- `idp_id`: string (foreign key to IdentityProvider)
- `config_key`: string (配置鍵名)
- `config_value`: string (配置值，加密儲存)
- `is_encrypted`: boolean (是否加密)
- `data_type`: enum ("string", "number", "boolean", "json") (資料型別)
- `is_required`: boolean (是否必填)
- `validation_rules`: json (驗證規則)

### IdPConnectionTest
IdP 連線測試結果實體。

**屬性**:
- `id`: string
- `idp_id`: string (foreign key to IdentityProvider)
- `test_timestamp`: timestamp (測試時間)
- `status`: enum ("success", "failed", "timeout") (測試狀態)
- `response_time_ms`: integer (回應時間)
- `error_message`: string (錯誤訊息)
- `version_info`: json (版本資訊)

### IdPFailoverLog
IdP 故障轉移記錄實體。

**屬性**:
- `id`: string
- `from_idp_id`: string (來源 IdP)
- `to_idp_id`: string (目標 IdP)
- `failover_timestamp`: timestamp (轉移時間)
- `reason`: enum ("connection_failed", "timeout", "auth_error") (轉移原因)
- `recovery_timestamp`: timestamp (恢復時間)
- `status`: enum ("completed", "failed", "pending") (轉移狀態)

### IdPAuditLog
IdP 操作審計日誌實體。

**屬性**:
- `id`: string
- `idp_id`: string (foreign key to IdentityProvider)
- `user_id`: string (操作使用者)
- `action`: enum ("create", "update", "delete", "test", "enable", "disable") (操作類型)
- `action_timestamp`: timestamp (操作時間)
- `ip_address`: string (操作 IP)
- `user_agent`: string (使用者代理)
- `changes`: json (變更內容)
- `result`: enum ("success", "failed") (操作結果)

### AuthConfiguration
認證系統的全域配置實體。

**屬性**:
- `id`: string
- `category`: enum ("security", "performance", "ui", "audit") (配置類別)
- `key`: string (配置鍵)
- `value`: string (配置值)
- `data_type`: enum ("string", "number", "boolean", "json") (資料型別)
- `is_sensitive`: boolean (是否敏感資訊)
- `updated_by`: string (更新者)
- `updated_at`: timestamp

## Relationships

### IdentityProvider → IdPConfiguration
- 一對多關係：一個 IdP 可以有多個配置參數
- 級聯刪除：刪除 IdP 時刪除所有相關配置

### IdentityProvider → IdPConnectionTest
- 一對多關係：一個 IdP 可以有多個測試記錄
- 級聯刪除：刪除 IdP 時刪除所有測試記錄

### IdentityProvider → IdPFailoverLog
- 一對多關係：一個 IdP 可以是故障轉移的來源或目標
- 參考完整性：不允許刪除被引用的 IdP

### IdentityProvider → IdPAuditLog
- 一對多關係：一個 IdP 可以有多個審計記錄
- 級聯刪除：刪除 IdP 時保留審計記錄（合規要求）

## Data Validation Rules

### IdentityProvider
- `name` 必須在租戶內唯一
- `type` 必須是支援的 IdP 類型之一
- `priority_order` 在同一租戶內必須唯一且正整數
- 至少需要一個啟用的 IdP

### IdPConfiguration
- `config_key` 在同一個 IdP 內必須唯一
- 如果 `is_encrypted` 為 true，則 `config_value` 必須加密
- `validation_rules` 必須是有效的 JSON 結構

### IdPConnectionTest
- `response_time_ms` 必須大於 0
- 如果 `status` 為 "failed"，則 `error_message` 不能為空
- 測試記錄保留期限為 90 天

### IdPFailoverLog
- `from_idp_id` 和 `to_idp_id` 不能相同
- 如果 `status` 為 "completed"，則 `recovery_timestamp` 不能為空
- 故障轉移記錄永久保留

### IdPAuditLog
- `changes` 必須記錄完整的變更前後狀態
- 審計記錄永久保留（合規要求）
- `ip_address` 必須是有效的 IP 地址格式

### AuthConfiguration
- `key` 在同一類別內必須唯一
- 如果 `is_sensitive` 為 true，則值必須加密儲存
- 配置變更必須記錄審計日誌

## Business Logic Constraints

### IdP 管理規則
- 系統必須始終保持至少一個啟用的 IdP
- 主要 IdP（priority_order = 1）必須始終啟用
- IdP 配置變更需要管理員權限

### 安全約束
- Client Secret 等敏感資訊必須加密儲存
- 審計日誌不得被修改或刪除
- 敏感操作需要雙因素驗證

### 高可用性規則
- 故障轉移必須在 5 秒內完成
- 系統必須支援最多 10 個 IdP 同時配置
- 連線測試失敗後自動停用相關 IdP

## Indexing Strategy

### 效能優化索引
- `IdentityProvider(tenant_id, is_active, priority_order)`: IdP 查詢和故障轉移
- `IdPConfiguration(idp_id, config_key)`: 配置參數查詢
- `IdPAuditLog(idp_id, action_timestamp)`: 審計日誌查詢
- `AuthConfiguration(category, key)`: 配置查詢

### 複合索引
- `IdPFailoverLog(from_idp_id, failover_timestamp)`: 故障轉移歷史
- `IdPConnectionTest(idp_id, status, test_timestamp)`: 測試結果分析

## Data Retention Policy

### 操作日誌保留
- IdPConnectionTest: 90 天
- IdPFailoverLog: 永久保留
- IdPAuditLog: 永久保留（合規要求）

### 配置歷史保留
- AuthConfiguration 變更歷史: 1 年
- IdentityProvider 變更歷史: 永久保留

### 清理策略
- 過期的測試記錄定期清理
- 保留關鍵的故障轉移和審計記錄
- 符合 GDPR 資料保留要求
