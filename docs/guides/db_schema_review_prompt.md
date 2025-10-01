# 資料庫 Schema 審查提示詞

本文件提供給 AI 審查員使用，用於全面審查 SRE Platform 的 PostgreSQL 資料庫 Schema 設計。

---

## 📋 審查任務說明

你是一位專業的資料庫架構審查專家，負責審查 SRE Platform 的 PostgreSQL 資料庫 Schema 設計。請按照以下檢查清單，對 `db_schema.sql` 檔案進行全面審查。

## 🎯 審查目標

1. **完整性** - 確保所有實體、欄位、關聯都已定義
2. **一致性** - 確保命名規範、資料型別在整個 Schema 中保持一致
3. **正確性** - 確保外鍵約束、索引、觸發器正確設置
4. **效能** - 確保索引策略能支援常見查詢模式
5. **可維護性** - 確保 Schema 易於理解和維護
6. **與 TypeScript 型別一致** - 確保與 `types.ts` 定義相符

## 📂 審查檔案

- **主要檔案**: `db_schema.sql`
- **參考檔案**: `types.ts` (TypeScript 型別定義)
- **資料庫**: PostgreSQL 14+

## 🔍 詳細審查檢查清單

### 1. ENUM 類型審查

檢查所有 ENUM 類型定義的完整性和正確性：

#### 必要的 ENUM 類型清單

- [ ] `dashboard_type` - 值：'built-in', 'custom', 'grafana'
- [ ] `incident_status` - 值：'New', 'Acknowledged', 'Investigating', 'Resolved', 'Closed'
- [ ] `incident_severity` - 值：'Critical', 'Warning', 'Info'
- [ ] `incident_impact` - 值：'High', 'Medium', 'Low'
- [ ] `resource_status` - 值：'Healthy', 'Warning', 'Critical', 'Unknown'
- [ ] `playbook_type` - 值：'Shell Script', 'Python', 'Ansible', 'Terraform'
- [ ] `execution_status` - 值：'Pending', 'Running', 'Success', 'Failed', 'Cancelled'
- [ ] `trigger_source` - 值：'Manual', 'Scheduled', 'Webhook', 'Incident', 'Alert'
- [ ] `trigger_type` - 值：'Schedule (Cron)', 'Webhook', 'Event (Incident/Alert)'
- [ ] `user_role` - 值：'Admin', 'SRE', 'Developer', 'Viewer'
- [ ] `user_status` - 值：'active', 'invited', 'inactive'
- [ ] `alert_severity` - 值：'Critical', 'Warning', 'Info'
- [ ] `notification_channel_type` - 值：'Email', 'Webhook (通用)', 'Slack', 'LINE Notify', 'SMS'
- [ ] `notification_status` - 值：'sent', 'failed', 'pending'
- [ ] `test_result` - 值：'success', 'failed', 'not_tested'
- [ ] `audit_action` - 值：'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE'
- [ ] `audit_result` - 值：'success', 'failure'

#### ENUM 檢查項目

對每個 ENUM：
- [ ] ENUM 名稱使用 snake_case
- [ ] ENUM 值與 types.ts 中的對應型別完全一致
- [ ] ENUM 值的大小寫與 API 回應一致
- [ ] 沒有遺漏的枚舉值
- [ ] 沒有多餘的枚舉值

#### types.ts 對照檢查

檢查以下 TypeScript 型別是否都有對應的 ENUM：
- [ ] `DashboardType` → `dashboard_type`
- [ ] `IncidentStatus` → `incident_status`
- [ ] `IncidentSeverity` → `incident_severity`
- [ ] `IncidentImpact` → `incident_impact`
- [ ] `Resource['status']` → `resource_status`
- [ ] `AutomationPlaybook['type']` → `playbook_type`
- [ ] `AutomationExecution['status']` → `execution_status`
- [ ] `AutomationExecution['trigger_source']` → `trigger_source`
- [ ] `TriggerType` → `trigger_type`
- [ ] `User['role']` → `user_role`
- [ ] `User['status']` → `user_status`
- [ ] `NotificationChannelType` → `notification_channel_type`

### 2. 核心資料表結構審查

#### 2.1 Users Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `email` VARCHAR(255) NOT NULL UNIQUE
- [ ] `role` user_role NOT NULL
- [ ] `status` user_status NOT NULL DEFAULT 'invited'
- [ ] `avatar_url` TEXT (nullable)
- [ ] `last_login_at` TIMESTAMPTZ (nullable)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_users_email` ON email
- [ ] `idx_users_role` ON role
- [ ] `idx_users_deleted_at` ON deleted_at

**額外檢查**:
- [ ] email 欄位有 UNIQUE 約束
- [ ] 與 types.ts 中的 User 介面欄位一致

#### 2.2 Teams Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `description` TEXT (nullable)
- [ ] `owner_id` VARCHAR(255) NOT NULL REFERENCES users(id)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**關聯表**:
- [ ] `team_members` 表存在
- [ ] team_members 包含 (team_id, user_id) PRIMARY KEY
- [ ] team_members 有適當的外鍵約束

**索引**:
- [ ] `idx_teams_owner_id` ON owner_id
- [ ] `idx_teams_deleted_at` ON deleted_at
- [ ] `idx_team_members_user_id` ON team_members(user_id)

#### 2.3 Resources Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `type` VARCHAR(255) NOT NULL
- [ ] `status` resource_status NOT NULL DEFAULT 'Unknown'
- [ ] `provider` VARCHAR(255) (nullable)
- [ ] `region` VARCHAR(255) (nullable)
- [ ] `team_id` VARCHAR(255) REFERENCES teams(id) (nullable)
- [ ] `owner_id` VARCHAR(255) REFERENCES users(id) (nullable)
- [ ] `datasource_id` VARCHAR(255) REFERENCES datasources(id) (nullable)
- [ ] `metadata` JSONB DEFAULT '{}'
- [ ] `tags` JSONB DEFAULT '{}'
- [ ] `metrics` JSONB DEFAULT '{}'
- [ ] `last_check_in_at` TIMESTAMPTZ (nullable)
- [ ] `discovered_by_job_id` VARCHAR(255) (nullable)
- [ ] `monitoring_agent` VARCHAR(255) (nullable)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_resources_type` ON type
- [ ] `idx_resources_status` ON status
- [ ] `idx_resources_provider` ON provider
- [ ] `idx_resources_region` ON region
- [ ] `idx_resources_team_id` ON team_id
- [ ] `idx_resources_owner_id` ON owner_id
- [ ] `idx_resources_datasource_id` ON datasource_id
- [ ] `idx_resources_deleted_at` ON deleted_at
- [ ] `idx_resources_tags` ON tags USING gin

**額外檢查**:
- [ ] tags 使用 GIN 索引支援 JSONB 查詢
- [ ] metadata 和 metrics 為 JSONB 型別

#### 2.4 Alert Rules Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `description` TEXT (nullable)
- [ ] `enabled` BOOLEAN NOT NULL DEFAULT true
- [ ] `resource_type` VARCHAR(255) NOT NULL
- [ ] `metric_name` VARCHAR(255) NOT NULL
- [ ] `severity` alert_severity NOT NULL
- [ ] `team_id` VARCHAR(255) REFERENCES teams(id) (nullable)
- [ ] `owner_id` VARCHAR(255) REFERENCES users(id) (nullable)
- [ ] `target_scope` VARCHAR(50) CHECK (target_scope IN ('specific', 'group', 'tag'))
- [ ] `target_resource_ids` TEXT[] (nullable)
- [ ] `condition_groups` JSONB NOT NULL
- [ ] `notification_strategy_ids` TEXT[] (nullable)
- [ ] `title_template` TEXT (nullable)
- [ ] `content_template` TEXT (nullable)
- [ ] `automation_enabled` BOOLEAN DEFAULT false
- [ ] `automation_config` JSONB (nullable)
- [ ] `test_payload` JSONB (nullable)
- [ ] `triggered_count` INTEGER DEFAULT 0
- [ ] `version` INTEGER DEFAULT 1
- [ ] `tags` JSONB DEFAULT '{}'
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_alert_rules_enabled` ON enabled
- [ ] `idx_alert_rules_resource_type` ON resource_type
- [ ] `idx_alert_rules_severity` ON severity
- [ ] `idx_alert_rules_team_id` ON team_id
- [ ] `idx_alert_rules_owner_id` ON owner_id
- [ ] `idx_alert_rules_deleted_at` ON deleted_at

**額外檢查**:
- [ ] target_scope 有 CHECK 約束
- [ ] condition_groups 為 JSONB 型別，儲存條件陣列

#### 2.5 Incidents Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `summary` TEXT NOT NULL
- [ ] `resource` VARCHAR(255) NOT NULL
- [ ] `resource_id` VARCHAR(255) NOT NULL REFERENCES resources(id)
- [ ] `rule` VARCHAR(255) NOT NULL
- [ ] `rule_id` VARCHAR(255) NOT NULL REFERENCES alert_rules(id)
- [ ] `status` incident_status NOT NULL DEFAULT 'New'
- [ ] `severity` incident_severity NOT NULL
- [ ] `impact` incident_impact NOT NULL
- [ ] `assignee` VARCHAR(255) (nullable)
- [ ] `team_id` VARCHAR(255) REFERENCES teams(id) (nullable)
- [ ] `owner_id` VARCHAR(255) REFERENCES users(id) (nullable)
- [ ] `silenced_by` VARCHAR(255) REFERENCES users(id) (nullable)
- [ ] `tags` JSONB DEFAULT '{}'
- [ ] `history` JSONB DEFAULT '[]'
- [ ] `ai_analysis` JSONB (nullable)
- [ ] `occurred_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `acknowledged_at` TIMESTAMPTZ (nullable)
- [ ] `resolved_at` TIMESTAMPTZ (nullable)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_incidents_resource_id` ON resource_id
- [ ] `idx_incidents_rule_id` ON rule_id
- [ ] `idx_incidents_status` ON status
- [ ] `idx_incidents_severity` ON severity
- [ ] `idx_incidents_impact` ON impact
- [ ] `idx_incidents_assignee` ON assignee
- [ ] `idx_incidents_team_id` ON team_id
- [ ] `idx_incidents_occurred_at` ON occurred_at
- [ ] `idx_incidents_deleted_at` ON deleted_at

**額外檢查**:
- [ ] history 為 JSONB 陣列，儲存事件歷史
- [ ] 三個時間戳：occurred_at, acknowledged_at, resolved_at

#### 2.6 Automation Playbooks Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `description` TEXT (nullable)
- [ ] `type` playbook_type NOT NULL
- [ ] `content` TEXT NOT NULL
- [ ] `enabled` BOOLEAN NOT NULL DEFAULT true
- [ ] `timeout_seconds` INTEGER DEFAULT 300
- [ ] `parameters` JSONB DEFAULT '[]'
- [ ] `execution_count` INTEGER DEFAULT 0
- [ ] `last_run_at` TIMESTAMPTZ (nullable)
- [ ] `last_run_status` execution_status (nullable)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_playbooks_type` ON type
- [ ] `idx_playbooks_enabled` ON enabled
- [ ] `idx_playbooks_deleted_at` ON deleted_at

#### 2.7 Automation Executions Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `playbook_id` VARCHAR(255) NOT NULL REFERENCES automation_playbooks(id)
- [ ] `playbook_name` VARCHAR(255) NOT NULL
- [ ] `incident_id` VARCHAR(255) REFERENCES incidents(id) (nullable)
- [ ] `alert_rule_id` VARCHAR(255) REFERENCES alert_rules(id) (nullable)
- [ ] `target_resource_id` VARCHAR(255) REFERENCES resources(id) (nullable)
- [ ] `status` execution_status NOT NULL DEFAULT 'Pending'
- [ ] `trigger_type` trigger_source NOT NULL
- [ ] `triggered_by` VARCHAR(255) NOT NULL REFERENCES users(id)
- [ ] `parameters` JSONB DEFAULT '{}'
- [ ] `output` TEXT (nullable)
- [ ] `error_message` TEXT (nullable)
- [ ] `resolved_incident` BOOLEAN DEFAULT false
- [ ] `started_at` TIMESTAMPTZ (nullable)
- [ ] `completed_at` TIMESTAMPTZ (nullable)
- [ ] `duration_ms` INTEGER (nullable)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_executions_playbook_id` ON playbook_id
- [ ] `idx_executions_incident_id` ON incident_id
- [ ] `idx_executions_status` ON status
- [ ] `idx_executions_trigger_type` ON trigger_type
- [ ] `idx_executions_started_at` ON started_at
- [ ] `idx_executions_deleted_at` ON deleted_at

**額外檢查**:
- [ ] 支援三種觸發來源追蹤：incident_id, alert_rule_id, target_resource_id

#### 2.8 Notification Channels Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `type` notification_channel_type NOT NULL
- [ ] `enabled` BOOLEAN NOT NULL DEFAULT true
- [ ] `config` JSONB NOT NULL
- [ ] `last_test_result` test_result DEFAULT 'not_tested'
- [ ] `last_tested_at` TIMESTAMPTZ (nullable)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_notification_channels_type` ON type
- [ ] `idx_notification_channels_enabled` ON enabled
- [ ] `idx_notification_channels_deleted_at` ON deleted_at

#### 2.9 Notification Strategies Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `enabled` BOOLEAN NOT NULL DEFAULT true
- [ ] `trigger_condition` TEXT NOT NULL
- [ ] `severity_levels` incident_severity[] (陣列，nullable)
- [ ] `impact_levels` incident_impact[] (陣列，nullable)
- [ ] `channel_ids` TEXT[] (陣列，nullable)
- [ ] `creator` VARCHAR(255) NOT NULL REFERENCES users(id)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_notification_strategies_enabled` ON enabled
- [ ] `idx_notification_strategies_deleted_at` ON deleted_at

**額外檢查**:
- [ ] severity_levels 和 impact_levels 使用 ENUM 陣列型別
- [ ] channel_ids 為 TEXT 陣列

#### 2.10 Dashboards Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `name` VARCHAR(255) NOT NULL
- [ ] `type` dashboard_type NOT NULL
- [ ] `category` VARCHAR(255) NOT NULL
- [ ] `description` TEXT (nullable)
- [ ] `owner` VARCHAR(255) NOT NULL
- [ ] `team_id` VARCHAR(255) REFERENCES teams(id) (nullable)
- [ ] `owner_id` VARCHAR(255) REFERENCES users(id) (nullable)
- [ ] `path` VARCHAR(500) NOT NULL
- [ ] `grafana_url` TEXT (nullable)
- [ ] `grafana_dashboard_uid` VARCHAR(255) (nullable)
- [ ] `grafana_folder_uid` VARCHAR(255) (nullable)
- [ ] `layout` JSONB DEFAULT '[]'
- [ ] `resource_ids` TEXT[] (nullable)
- [ ] `tags` JSONB DEFAULT '{}'
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_dashboards_type` ON type
- [ ] `idx_dashboards_category` ON category
- [ ] `idx_dashboards_team_id` ON team_id
- [ ] `idx_dashboards_owner_id` ON owner_id
- [ ] `idx_dashboards_deleted_at` ON deleted_at

### 3. 關聯表與外鍵檢查

#### 3.1 Many-to-Many 關聯

檢查以下關聯表是否正確定義：

**team_members**:
- [ ] PRIMARY KEY (team_id, user_id)
- [ ] FOREIGN KEY team_id REFERENCES teams(id) ON DELETE CASCADE
- [ ] FOREIGN KEY user_id REFERENCES users(id) ON DELETE CASCADE
- [ ] 索引：idx_team_members_user_id

**resource_group_members**:
- [ ] PRIMARY KEY (group_id, resource_id)
- [ ] FOREIGN KEY group_id REFERENCES resource_groups(id) ON DELETE CASCADE
- [ ] FOREIGN KEY resource_id REFERENCES resources(id) ON DELETE CASCADE
- [ ] 索引：idx_resource_group_members_resource_id

**role_permissions**:
- [ ] PRIMARY KEY (role_id, permission)
- [ ] FOREIGN KEY role_id REFERENCES roles(id) ON DELETE CASCADE
- [ ] 索引：idx_role_permissions_permission

#### 3.2 外鍵約束檢查

對於每個外鍵：
- [ ] 外鍵欄位名稱遵循 `{entity}_id` 格式
- [ ] 外鍵有對應的索引
- [ ] 級聯刪除設定合理（ON DELETE CASCADE 或無設定）
- [ ] 可為 NULL 的外鍵標記為 nullable

#### 3.3 自參照外鍵

檢查以下表的自參照關係：

**resource_links**:
- [ ] source_resource_id REFERENCES resources(id) ON DELETE CASCADE
- [ ] target_resource_id REFERENCES resources(id) ON DELETE CASCADE
- [ ] link_type 有 CHECK 約束
- [ ] 兩個外鍵都有索引

### 4. AI 分析相關表

#### 4.1 Incident Analyses Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `incident_id` VARCHAR(255) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE
- [ ] `summary` TEXT NOT NULL
- [ ] `root_cause` TEXT (nullable)
- [ ] `impact_assessment` TEXT (nullable)
- [ ] `recommended_actions` TEXT[] (nullable)
- [ ] `related_incidents` TEXT[] (nullable)
- [ ] `confidence_score` DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1)
- [ ] `analysis_time` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**索引**:
- [ ] `idx_incident_analyses_incident_id` ON incident_id
- [ ] `idx_incident_analyses_analysis_time` ON analysis_time

**額外檢查**:
- [ ] confidence_score 有 CHECK 約束確保在 0-1 之間
- [ ] recommended_actions 和 related_incidents 為 TEXT 陣列

#### 4.2 Resource Analyses Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `resource_id` VARCHAR(255) NOT NULL REFERENCES resources(id) ON DELETE CASCADE
- [ ] `resource_name` VARCHAR(255) NOT NULL
- [ ] `risk_level` risk_level NOT NULL
- [ ] `risk_analysis` TEXT (nullable)
- [ ] `optimization_suggestions` JSONB DEFAULT '[]'
- [ ] `predicted_issues` JSONB DEFAULT '[]'
- [ ] `confidence_score` DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1)
- [ ] `analysis_time` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**索引**:
- [ ] `idx_resource_analyses_resource_id` ON resource_id
- [ ] `idx_resource_analyses_risk_level` ON risk_level
- [ ] `idx_resource_analyses_analysis_time` ON analysis_time

**額外檢查**:
- [ ] risk_level 使用 ENUM 型別
- [ ] optimization_suggestions 和 predicted_issues 為 JSONB 陣列

#### 4.3 Multi-Incident Analyses Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `incident_ids` TEXT[] NOT NULL
- [ ] `correlation_found` BOOLEAN NOT NULL
- [ ] `correlation_summary` TEXT (nullable)
- [ ] `common_root_cause` TEXT (nullable)
- [ ] `timeline` JSONB DEFAULT '[]'
- [ ] `recommended_actions` TEXT[] (nullable)
- [ ] `confidence_score` DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1)
- [ ] `analysis_time` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**索引**:
- [ ] `idx_multi_incident_analyses_analysis_time` ON analysis_time

#### 4.4 Log Analyses Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `query` TEXT NOT NULL
- [ ] `time_range_start` TIMESTAMPTZ NOT NULL
- [ ] `time_range_end` TIMESTAMPTZ NOT NULL
- [ ] `total_logs` INTEGER NOT NULL
- [ ] `error_count` INTEGER NOT NULL
- [ ] `warning_count` INTEGER NOT NULL
- [ ] `patterns_found` JSONB DEFAULT '[]'
- [ ] `anomalies` JSONB DEFAULT '[]'
- [ ] `insights` TEXT (nullable)
- [ ] `analysis_time` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**索引**:
- [ ] `idx_log_analyses_time_range` ON (time_range_start, time_range_end)
- [ ] `idx_log_analyses_analysis_time` ON analysis_time

### 5. 系統管理表

#### 5.1 Audit Logs Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `user_id` VARCHAR(255) NOT NULL REFERENCES users(id)
- [ ] `user_name` VARCHAR(255) NOT NULL
- [ ] `action` audit_action NOT NULL
- [ ] `entity_type` VARCHAR(100) NOT NULL
- [ ] `entity_id` VARCHAR(255) NOT NULL
- [ ] `entity_name` VARCHAR(255) (nullable)
- [ ] `changes` JSONB (nullable)
- [ ] `result` audit_result NOT NULL DEFAULT 'success'
- [ ] `ip_address` VARCHAR(45) (nullable)
- [ ] `user_agent` TEXT (nullable)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**索引**:
- [ ] `idx_audit_logs_user_id` ON user_id
- [ ] `idx_audit_logs_action` ON action
- [ ] `idx_audit_logs_entity_type` ON entity_type
- [ ] `idx_audit_logs_entity_id` ON entity_id
- [ ] `idx_audit_logs_created_at` ON created_at
- [ ] `idx_audit_logs_result` ON result

**額外檢查**:
- [ ] 沒有 updated_at 和 deleted_at（audit logs 不可變）
- [ ] changes 為 JSONB，儲存變更前後的資料

#### 5.2 Config Versions Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `entity_type` VARCHAR(100) NOT NULL CHECK (entity_type IN (...))
- [ ] `entity_id` VARCHAR(255) NOT NULL
- [ ] `version` INTEGER NOT NULL
- [ ] `config_snapshot` JSONB NOT NULL
- [ ] `change_summary` TEXT (nullable)
- [ ] `changed_by` VARCHAR(255) NOT NULL REFERENCES users(id)
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**索引**:
- [ ] `idx_config_versions_entity` ON (entity_type, entity_id)
- [ ] `idx_config_versions_version` ON (entity_type, entity_id, version)
- [ ] `idx_config_versions_created_at` ON created_at

**額外檢查**:
- [ ] entity_type 有 CHECK 約束列舉所有支援的實體類型
- [ ] 沒有 updated_at 和 deleted_at（版本記錄不可變）

#### 5.3 Tag Definitions Table

**必須欄位**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `key` VARCHAR(255) NOT NULL UNIQUE
- [ ] `description` TEXT (nullable)
- [ ] `scopes` TEXT[] NOT NULL
- [ ] `required` BOOLEAN DEFAULT false
- [ ] `readonly` BOOLEAN DEFAULT false
- [ ] `writable_roles` TEXT[] (nullable)
- [ ] `link_to_entity` VARCHAR(255) (nullable)
- [ ] `usage_count` INTEGER DEFAULT 0
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- [ ] `deleted_at` TIMESTAMPTZ (nullable)

**索引**:
- [ ] `idx_tag_definitions_key` ON key
- [ ] `idx_tag_definitions_deleted_at` ON deleted_at

**額外檢查**:
- [ ] key 有 UNIQUE 約束
- [ ] scopes 為 TEXT 陣列

#### 5.4 System Settings & User Preferences

**system_settings**:
- [ ] `key` VARCHAR(255) PRIMARY KEY
- [ ] `value` JSONB NOT NULL
- [ ] `description` TEXT (nullable)
- [ ] `updated_by` VARCHAR(255) REFERENCES users(id) (nullable)
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**user_preferences**:
- [ ] `user_id` VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
- [ ] `theme` VARCHAR(50) DEFAULT 'system' CHECK (theme IN ('dark', 'light', 'system'))
- [ ] `language` VARCHAR(10) DEFAULT 'zh-TW' CHECK (language IN ('en', 'zh-TW'))
- [ ] `timezone` VARCHAR(100) DEFAULT 'Asia/Taipei'
- [ ] `default_page` VARCHAR(255) (nullable)
- [ ] `settings` JSONB DEFAULT '{}'
- [ ] `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

**login_history**:
- [ ] `id` VARCHAR(255) PRIMARY KEY
- [ ] `user_id` VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE
- [ ] `ip_address` VARCHAR(45) NOT NULL
- [ ] `device` VARCHAR(255) (nullable)
- [ ] `user_agent` TEXT (nullable)
- [ ] `status` VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed'))
- [ ] `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 6. 索引策略審查

#### 6.1 必要索引檢查

對於每個表，檢查以下索引是否存在：

**基本索引**:
- [ ] 所有外鍵欄位都有索引
- [ ] deleted_at 欄位有索引（支援軟刪除查詢）
- [ ] 狀態欄位有索引（status, enabled 等）
- [ ] 類型欄位有索引（type, kind 等）

**時間戳索引**:
- [ ] created_at 在需要時間排序的表上有索引
- [ ] 時間範圍查詢使用複合索引（如 time_range_start, time_range_end）

**JSONB 索引**:
- [ ] tags 欄位使用 GIN 索引
- [ ] 其他需要查詢的 JSONB 欄位考慮使用 GIN 索引

**複合索引**:
- [ ] 需要多欄位查詢的情況有適當的複合索引
- [ ] 例如：(entity_type, entity_id) 在 config_versions

#### 6.2 索引命名規範

- [ ] 單欄位索引：`idx_{table}_{column}`
- [ ] 複合索引：`idx_{table}_{column1}_{column2}`
- [ ] GIN 索引也遵循相同命名規範

#### 6.3 效能考量

- [ ] 頻繁查詢的欄位有索引
- [ ] JOIN 操作的欄位有索引
- [ ] WHERE 條件常用的欄位有索引
- [ ] 避免過度索引（每個表不超過 10 個索引為佳）

### 7. 觸發器與自動化

#### 7.1 Updated At 觸發器

**函數定義**:
- [ ] `update_updated_at_column()` 函數存在
- [ ] 函數使用 plpgsql 語言
- [ ] 函數正確設置 NEW.updated_at = NOW()

**觸發器應用**:
檢查以下表是否有 updated_at 觸發器：
- [ ] users
- [ ] teams
- [ ] roles
- [ ] resources
- [ ] resource_groups
- [ ] resource_links
- [ ] datasources
- [ ] discovery_jobs
- [ ] discovered_resources
- [ ] alert_rules
- [ ] incidents
- [ ] silence_rules
- [ ] automation_playbooks
- [ ] automation_executions
- [ ] automation_triggers
- [ ] notification_channels
- [ ] notification_strategies
- [ ] dashboards
- [ ] tag_definitions
- [ ] user_preferences

**觸發器檢查**:
- [ ] 每個觸發器命名為 `update_{table}_updated_at`
- [ ] 觸發器類型為 BEFORE UPDATE
- [ ] 觸發器適用於 FOR EACH ROW

#### 7.2 不應有觸發器的表

以下表不應有 updated_at 觸發器（因為不可變或沒有 updated_at）：
- [ ] audit_logs（不可變）
- [ ] config_versions（不可變）
- [ ] notification_history（不可變）
- [ ] login_history（不可變）
- [ ] team_members（關聯表）
- [ ] resource_group_members（關聯表）
- [ ] role_permissions（關聯表）
- [ ] incident_analyses（分析結果不可變）
- [ ] resource_analyses（分析結果不可變）
- [ ] multi_incident_analyses（分析結果不可變）
- [ ] log_analyses（分析結果不可變）

### 8. 資料型別與約束

#### 8.1 命名規範一致性

**欄位命名**:
- [ ] 所有欄位名稱使用 snake_case
- [ ] 時間戳統一命名：created_at, updated_at, deleted_at
- [ ] 特殊時間戳：occurred_at, acknowledged_at, resolved_at, started_at, completed_at, sent_at
- [ ] 外鍵統一命名：{entity}_id
- [ ] 陣列欄位使用複數：resource_ids, member_ids, channel_ids

**表命名**:
- [ ] 表名使用複數 snake_case（users, teams, resources）
- [ ] 關聯表使用 {table1}_{table2} 格式（team_members, resource_group_members）

#### 8.2 資料型別正確性

**VARCHAR 長度**:
- [ ] ID 欄位：VARCHAR(255)
- [ ] 名稱欄位：VARCHAR(255)
- [ ] Email：VARCHAR(255)
- [ ] 短文字：VARCHAR(100) 或 VARCHAR(50)
- [ ] 長文字/描述：TEXT

**時間戳**:
- [ ] 所有時間欄位使用 TIMESTAMPTZ (含時區)
- [ ] 不使用 TIMESTAMP (無時區)

**數字型別**:
- [ ] 計數器：INTEGER
- [ ] 毫秒時長：INTEGER (duration_ms)
- [ ] 百分比分數：DECIMAL(3,2) (confidence_score)

**布林型別**:
- [ ] 使用 BOOLEAN 而非 INTEGER
- [ ] 適當的 DEFAULT 值（true/false）

**JSONB vs JSON**:
- [ ] 所有 JSON 欄位使用 JSONB（不是 JSON）
- [ ] 適當的 DEFAULT 值（'{}' 或 '[]'）

**陣列型別**:
- [ ] TEXT[] 用於 ID 陣列或字串陣列
- [ ] ENUM[] 用於枚舉值陣列（如 severity_levels）

#### 8.3 約束完整性

**NOT NULL 約束**:
- [ ] 主鍵有 NOT NULL
- [ ] 必填欄位有 NOT NULL
- [ ] 外鍵根據業務邏輯決定是否 NOT NULL

**UNIQUE 約束**:
- [ ] users.email 有 UNIQUE
- [ ] tag_definitions.key 有 UNIQUE
- [ ] roles.name 有 UNIQUE
- [ ] 其他需要唯一性的欄位有 UNIQUE

**CHECK 約束**:
- [ ] confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
- [ ] theme CHECK (theme IN (...))
- [ ] language CHECK (language IN (...))
- [ ] status CHECK (status IN (...)) 在適當的地方
- [ ] target_scope, link_type 等枚舉式欄位有 CHECK

**DEFAULT 值**:
- [ ] BOOLEAN 欄位有適當的 DEFAULT
- [ ] TIMESTAMPTZ 欄位使用 DEFAULT NOW() 或 DEFAULT CURRENT_TIMESTAMP
- [ ] JSONB 欄位有 DEFAULT '{}' 或 '[]'
- [ ] 計數器欄位有 DEFAULT 0
- [ ] 狀態欄位有適當的 DEFAULT

### 9. 與 types.ts 一致性檢查

#### 9.1 介面欄位對應

對於每個主要介面，檢查資料表欄位是否完全對應：

**Dashboard (types.ts:20-40) ↔ dashboards table**:
- [ ] id ↔ id
- [ ] name ↔ name
- [ ] type ↔ type
- [ ] category ↔ category
- [ ] description ↔ description
- [ ] owner ↔ owner
- [ ] team_id ↔ team_id
- [ ] owner_id ↔ owner_id
- [ ] tags ↔ tags
- [ ] created_at ↔ created_at
- [ ] updated_at ↔ updated_at
- [ ] path ↔ path
- [ ] grafana_url ↔ grafana_url
- [ ] grafana_dashboard_uid ↔ grafana_dashboard_uid
- [ ] grafana_folder_uid ↔ grafana_folder_uid
- [ ] layout ↔ layout
- [ ] deleted_at ↔ deleted_at
- [ ] resource_ids ↔ resource_ids

**Incident (types.ts:136-164) ↔ incidents table**:
- [ ] 所有欄位一致
- [ ] 特別檢查：history (JSONB), ai_analysis (JSONB), notifications_sent (應從關聯表查詢)

**Resource (types.ts:182-201) ↔ resources table**:
- [ ] 所有欄位一致
- [ ] 特別檢查：tags, metadata (JSONB)

**User (types.ts:316-327) ↔ users table**:
- [ ] 所有欄位一致
- [ ] 特別檢查：team 欄位在資料庫中透過 team_members 關聯

**AlertRule (types.ts:387-416) ↔ alert_rules table**:
- [ ] 所有欄位一致
- [ ] 特別檢查：condition_groups (JSONB), automation (JSONB as automation_config)

#### 9.2 型別對應檢查

TypeScript 型別 → PostgreSQL 型別：
- [ ] `string` → `VARCHAR(255)` 或 `TEXT`
- [ ] `number` → `INTEGER` 或 `DECIMAL`
- [ ] `boolean` → `BOOLEAN`
- [ ] `string[]` → `TEXT[]`
- [ ] `Record<string, any>` → `JSONB`
- [ ] `Date` 或 `string (ISO 8601)` → `TIMESTAMPTZ`
- [ ] Enum 字串聯合型別 → ENUM 型別或 CHECK 約束

#### 9.3 缺失欄位檢查

檢查 types.ts 中的欄位是否在資料庫中有對應：
- [ ] 計算欄位（如 channel_count, member_count）不應在資料庫中
- [ ] 關聯資料（如 User.team）透過 JOIN 查詢，不儲存在主表
- [ ] 其他所有欄位都應有資料庫對應

### 10. 進階資料表檢查

#### 10.1 Datasources & Discovery

**datasources table**:
- [ ] 包含所有必要欄位
- [ ] type 使用 datasource_type ENUM
- [ ] status 使用 connection_status ENUM
- [ ] auth_method 使用 auth_method ENUM

**discovery_jobs table**:
- [ ] kind 使用 discovery_job_kind ENUM
- [ ] status 使用 discovery_job_status ENUM
- [ ] target_config, exporter_binding, edge_gateway 為 JSONB

**discovered_resources table**:
- [ ] status 使用 discovered_resource_status ENUM
- [ ] job_id 外鍵正確設置

#### 10.2 Silence Rules

**silence_rules table**:
- [ ] type CHECK 約束包含：'single', 'repeat', 'condition'
- [ ] matchers 為 JSONB 陣列
- [ ] schedule 為 JSONB 物件

#### 10.3 Resource Links (Topology)

**resource_links table**:
- [ ] link_type CHECK 約束包含所有拓樸關係類型
- [ ] source_resource_id 和 target_resource_id 都有索引
- [ ] 支援軟刪除（deleted_at）

### 11. 效能與可擴展性

#### 11.1 分區策略考量

對於大量資料的表，評估是否需要分區：
- [ ] audit_logs - 考慮按時間分區
- [ ] notification_history - 考慮按時間分區
- [ ] login_history - 考慮按時間分區
- [ ] log_analyses - 考慮按時間分區

#### 11.2 索引效能

- [ ] 避免在高寫入表上建立過多索引
- [ ] GIN 索引只用在真正需要 JSONB 查詢的欄位
- [ ] 複合索引欄位順序符合查詢模式

#### 11.3 資料保留策略

檢查是否需要資料保留策略的表：
- [ ] audit_logs - 建議保留 1-2 年
- [ ] notification_history - 建議保留 6-12 個月
- [ ] login_history - 建議保留 6-12 個月
- [ ] *_analyses - 考慮定期歸檔

### 12. 初始資料與種子資料

#### 12.1 必要初始資料

- [ ] 預設管理員使用者（usr-admin）
- [ ] 系統設定（platform_name, platform_version, help_url）

#### 12.2 種子資料檢查

- [ ] 初始資料的 ID 格式一致
- [ ] 時間戳使用 NOW() 而非硬編碼
- [ ] 密碼等敏感資料標註需要更改

### 13. 文檔與註解

#### 13.1 表註解

- [ ] 所有主要資料表都有 COMMENT ON TABLE
- [ ] 註解清楚說明表的用途
- [ ] 註解使用中文且易於理解

#### 13.2 特殊欄位註解

對於複雜或不明顯的欄位，檢查是否有註解：
- [ ] JSONB 欄位的結構說明
- [ ] 陣列欄位的內容說明
- [ ] 特殊約束的業務邏輯說明

### 14. SQL 語法與相容性

#### 14.1 PostgreSQL 特性使用

- [ ] 使用 TIMESTAMPTZ（PostgreSQL 推薦）
- [ ] 使用 JSONB（效能優於 JSON）
- [ ] 使用 TEXT（PostgreSQL 中 VARCHAR 無效能優勢）
- [ ] 陣列型別使用 PostgreSQL 原生語法

#### 14.2 版本相容性

- [ ] 確認使用的特性支援 PostgreSQL 14+
- [ ] ENUM 型別語法正確
- [ ] CREATE EXTENSION 語法正確
- [ ] 觸發器語法正確

#### 14.3 SQL 標準

- [ ] 遵循 SQL 標準命名規範
- [ ] 避免使用保留字作為欄位名
- [ ] 字串使用單引號（不是雙引號）

## 📤 審查報告格式

請以以下格式輸出審查結果：

```markdown
# 資料庫 Schema 審查報告

**審查日期**: YYYY-MM-DD
**審查員**: [AI 名稱/版本]
**資料庫**: PostgreSQL 14+
**審查範圍**: db_schema.sql

## 📊 審查統計

- 總資料表數: XX
- ENUM 類型數: XX
- 索引數量: XX
- 觸發器數量: XX
- 外鍵約束數: XX
- 發現問題: Y 個
- 嚴重程度: 🔴 Critical: A | 🟡 Warning: B | 🔵 Info: C

## ✅ 通過項目

### ENUM 類型
- ✅ 所有 XX 個 ENUM 類型定義正確
- ✅ ENUM 值與 types.ts 完全一致

### 資料表結構
- ✅ 核心表 (XX/XX) 結構完整
- ✅ 關聯表 (X/X) 正確定義
- ✅ 分析表 (X/X) 符合需求

### 索引策略
- ✅ 外鍵索引 100% 覆蓋
- ✅ 軟刪除索引完整
- ✅ JSONB GIN 索引適當

## ❌ 發現的問題

### 🔴 Critical Issues (必須修復)

#### 問題 1: [簡短描述]
- **位置**: 表名/行數
- **問題描述**: 詳細說明問題
- **影響**: 說明此問題的影響
- **修復建議**:
```sql
-- 建議的修復 SQL
```

### 🟡 Warning Issues (建議修復)

#### 問題 2: [簡短描述]
- **位置**: 表名/行數
- **問題描述**: 詳細說明問題
- **建議**: 改進建議

### 🔵 Info/Suggestions (可選優化)

#### 建議 1: [簡短描述]
- **位置**: 表名
- **說明**: 優化建議
- **預期效益**: 說明優化後的好處

## 🔍 詳細檢查結果

### 1. ENUM 類型審查 (XX/XX 通過)
- ✅ dashboard_type
- ✅ incident_status
- ⚠️ notification_channel_type - 缺少某個值
...

### 2. 核心資料表審查

#### users table (✅ 通過)
- ✅ 所有必要欄位存在
- ✅ 索引完整
- ✅ 外鍵正確

#### resources table (⚠️ 1 個 warning)
- ✅ 欄位定義正確
- ✅ 索引完整
- ⚠️ 建議為 metadata 添加 GIN 索引

...

### 3. 外鍵與關聯審查
- ✅ 所有外鍵有索引
- ✅ 級聯刪除設定合理
- ✅ Many-to-many 關聯表結構正確

### 4. 索引策略審查
- ✅ 基本索引: XX/XX
- ✅ 時間戳索引: XX/XX
- ✅ JSONB 索引: XX/XX
- ⚠️ 建議索引: X 處

### 5. 觸發器審查
- ✅ updated_at 觸發器: XX/XX
- ✅ 不可變表無觸發器: 正確

### 6. 與 types.ts 一致性
- ✅ Dashboard 介面: 100% 一致
- ✅ Incident 介面: 100% 一致
- ⚠️ User 介面: team 欄位需透過 JOIN 查詢
- ✅ Resource 介面: 100% 一致
...

### 7. 命名規範審查
- ✅ 欄位命名: 100% snake_case
- ✅ 表命名: 符合規範
- ✅ 索引命名: 符合規範
- ✅ 觸發器命名: 符合規範

### 8. 資料型別審查
- ✅ VARCHAR 長度合理
- ✅ 時間戳使用 TIMESTAMPTZ
- ✅ JSONB vs JSON: 正確
- ✅ 陣列型別: 正確使用

### 9. 約束完整性
- ✅ NOT NULL 約束: XX 處
- ✅ UNIQUE 約束: XX 處
- ✅ CHECK 約束: XX 處
- ✅ DEFAULT 值: 適當設置

## 📈 一致性檢查

### 命名規範
- ✅ snake_case 使用率: 100%
- ✅ 外鍵命名一致性: 100%
- ✅ 時間戳命名一致性: 100%

### 與 types.ts 對照
- ✅ 欄位對應: XX/XX (XX%)
- ✅ 型別對應: 正確
- ✅ ENUM 對應: 100%

### PostgreSQL 最佳實踐
- ✅ TIMESTAMPTZ 使用
- ✅ JSONB 使用
- ✅ 索引策略
- ⚠️ 分區策略建議

## 💡 效能優化建議

1. **高優先級**
   - [建議 1]
   - [建議 2]

2. **中優先級**
   - [建議 3]
   - [建議 4]

3. **長期優化**
   - [建議 5]
   - [建議 6]

## 🎯 總體評估

[總結這份資料庫 Schema 的整體品質]

### 優點
- [優點 1]
- [優點 2]

### 需要改進
- [改進點 1]
- [改進點 2]

### 建議下一步
- [下一步 1]
- [下一步 2]

---

**審查完成度**: [百分比]
**是否可進入生產環境**: [是/否 - 理由]
**建議下一步行動**: [具體建議]
```

## 🔧 審查工具建議

審查完成後，建議使用以下工具進行自動驗證：

```bash
# 1. 語法檢查
psql -U postgres -d template1 -f db_schema.sql --dry-run

# 2. 在測試資料庫中執行
psql -U postgres -d sre_platform_test -f db_schema.sql

# 3. 檢查表結構
psql -U postgres -d sre_platform_test -c "\dt"
psql -U postgres -d sre_platform_test -c "\dT"

# 4. 檢查索引
psql -U postgres -d sre_platform_test -c "\di"

# 5. 檢查外鍵
psql -U postgres -d sre_platform_test -c "
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
"

# 6. 檢查觸發器
psql -U postgres -d sre_platform_test -c "\dft"
```

## 📋 快速檢查清單總結

### 必須檢查 (Critical)
- [ ] 所有 ENUM 類型與 types.ts 一致
- [ ] 所有主要實體表存在且結構完整
- [ ] 所有外鍵有索引
- [ ] 所有外鍵約束正確
- [ ] 命名規範 100% 一致（snake_case）
- [ ] 所有時間戳使用 TIMESTAMPTZ
- [ ] 軟刪除欄位 deleted_at 有索引

### 建議檢查 (Important)
- [ ] updated_at 觸發器完整
- [ ] JSONB 欄位有適當的 DEFAULT 值
- [ ] CHECK 約束設置合理
- [ ] 表註解完整
- [ ] 初始資料正確

### 優化檢查 (Nice to have)
- [ ] 索引策略優化
- [ ] 分區策略評估
- [ ] 效能測試建議
- [ ] 資料保留策略

## 📞 問題回報

如發現問題，請在審查報告中：
1. 明確標示問題的嚴重程度（Critical/Warning/Info）
2. 提供具體的位置（表名、欄位名、行數）
3. 給出可執行的修復 SQL
4. 說明問題的業務影響和技術影響

---

**提示詞版本**: 1.0
**適用範圍**: SRE Platform PostgreSQL Schema
**最後更新**: 2025-10-02
