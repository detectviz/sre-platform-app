-- SRE Platform 資料庫結構
-- 版本: 1.0
-- 設計者: Jules
-- 註: 本結構使用 PostgreSQL 語法。

-- 啟用 pgcrypto 以支援 UUID 生成
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 核心 IAM (身分與存取管理)
-- =============================================================================

-- 儲存所有角色定義
CREATE TABLE "roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ -- 用於軟刪除
);
COMMENT ON TABLE "roles" IS '儲存角色定義，如管理員、SRE、開發者等。';
COMMENT ON COLUMN "roles"."status" IS '角色的狀態 (啟用/停用)';

-- 儲存每個角色的具體權限
CREATE TABLE "role_permissions" (
    "id" BIGSERIAL PRIMARY KEY,
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "module" VARCHAR(255) NOT NULL,
    "action" VARCHAR(50) NOT NULL CHECK (action IN ('read', 'create', 'update', 'delete', 'execute')),
    UNIQUE("role_id", "module", "action")
);
COMMENT ON TABLE "role_permissions" IS '定義角色對不同模組的操作權限，採正規化設計。';
COMMENT ON COLUMN "role_permissions"."module" IS '權限所屬模組，如 "IAM", "Dashboards"';
COMMENT ON COLUMN "role_permissions"."action" IS '允許的操作，如 "read", "create"';

-- 儲存所有使用者帳號
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "avatar_url" TEXT,
    "role_id" UUID REFERENCES "roles"("id") ON DELETE SET NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'invited' CHECK (status IN ('active', 'invited', 'inactive')),
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "users" IS '平台的使用者帳號資料。';
COMMENT ON COLUMN "users"."role_id" IS '使用者所屬的角色 ID。';
COMMENT ON COLUMN "users"."status" IS '使用者帳號狀態 (啟用/已邀請/停用)';

-- 儲存團隊定義
CREATE TABLE "teams" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "owner_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "teams" IS '使用者組成的團隊。';
COMMENT ON COLUMN "teams"."owner_id" IS '團隊負責人的使用者 ID。';

-- 使用者與團隊的多對多關聯表
CREATE TABLE "team_memberships" (
    "team_id" UUID NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("team_id", "user_id")
);
COMMENT ON TABLE "team_memberships" IS '紀錄使用者與團隊的從屬關係。';

-- 審計日誌，記錄所有重要操作
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL PRIMARY KEY,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "user_name_snapshot" VARCHAR(255),
    "action" VARCHAR(255) NOT NULL,
    "target_type" VARCHAR(100),
    "target_id" VARCHAR(255),
    "result" VARCHAR(50) NOT NULL CHECK (result IN ('success', 'failure')),
    "client_ip" INET,
    "details" JSONB
);

COMMENT ON TABLE "audit_logs" IS '記錄系統中的所有重要操作，用於追蹤與稽核。';
COMMENT ON COLUMN "audit_logs"."user_name_snapshot" IS '操作當下使用者名稱的快照，避免使用者改名後無法追溯。';
COMMENT ON COLUMN "audit_logs"."target_type" IS '操作目標的類型，如 "Team", "Role"。';
COMMENT ON COLUMN "audit_logs"."target_id" IS '操作目標的 ID。';
COMMENT ON COLUMN "audit_logs"."client_ip" IS '發起操作的客戶端 IP 位址。';
COMMENT ON COLUMN "audit_logs"."details" IS '操作的詳細資訊 (JSON 格式)。';

-- 為常用查詢建立索引
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role_id" ON "users"("role_id");
CREATE INDEX "idx_teams_owner_id" ON "teams"("owner_id");
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_target" ON "audit_logs"("target_type", "target_id");
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp" DESC);

-- 自動更新 updated_at 時間戳的通用函式
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為需要自動更新 updated_at 的資料表掛上觸發器
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "roles"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "teams"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of IAM Schema


-- =============================================================================
-- 個人化設定
-- =============================================================================

-- 儲存使用者的個人化偏好設定
CREATE TABLE "user_preferences" (
    "user_id" UUID PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
    "theme" VARCHAR(50) NOT NULL DEFAULT 'system' CHECK (theme IN ('dark', 'light', 'system')),
    "language" VARCHAR(10) NOT NULL DEFAULT 'zh-TW' CHECK (language IN ('en', 'zh-TW')),
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'Asia/Taipei',
    "default_page" VARCHAR(255) NOT NULL DEFAULT '/dashboard',
    "layouts" JSONB,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "user_preferences" IS '儲存使用者的個人化偏好，如主題、語言、版面配置等。';
COMMENT ON COLUMN "user_preferences"."user_id" IS '關聯的使用者 ID。';
COMMENT ON COLUMN "user_preferences"."layouts" IS '儲存使用者自訂的頁面版面配置，格式為 {"page_id": ["widget1", "widget2"]}。';

-- 使用者登入歷史紀錄
CREATE TABLE "login_history" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_ip" INET NOT NULL,
    "user_agent" TEXT,
    "status" VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed')),
    "failure_reason" TEXT
);
COMMENT ON TABLE "login_history" IS '記錄使用者的登入活動。';
COMMENT ON COLUMN "login_history"."user_agent" IS '從 User-Agent 解析出的裝置/瀏覽器資訊。';
COMMENT ON COLUMN "login_history"."failure_reason" IS '登入失敗的原因，僅在 status 為 "failed" 時有值。';

-- 為登入歷史建立索引
CREATE INDEX "idx_login_history_user_id_timestamp" ON "login_history"("user_id", "timestamp" DESC);

-- 為 user_preferences 掛上 updated_at 觸發器
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "user_preferences"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of Personalization Schema


-- =============================================================================
-- 核心 SRE 資產
-- =============================================================================

-- 儲存所有受監控的資源
CREATE TABLE "resources" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(100),
    "region" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'offline' CHECK (status IN ('healthy', 'warning', 'critical', 'offline')),
    "owner_team_id" UUID REFERENCES "teams"("id") ON DELETE SET NULL,
    "last_check_in_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "resources" IS '平台監控的基礎設施或應用程式資源。';
COMMENT ON COLUMN "resources"."owner_team_id" IS '負責此資源的團隊。';
COMMENT ON COLUMN "resources"."last_check_in_at" IS '資源上次回報心跳的時間。';

-- 資源群組
CREATE TABLE "resource_groups" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "owner_team_id" UUID REFERENCES "teams"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "resource_groups" IS '將多個資源組合成一個邏輯單元，方便管理。';

-- 資源與資源群組的多對多關聯表
CREATE TABLE "resource_group_members" (
    "group_id" UUID NOT NULL REFERENCES "resource_groups"("id") ON DELETE CASCADE,
    "resource_id" UUID NOT NULL REFERENCES "resources"("id") ON DELETE CASCADE,
    PRIMARY KEY ("group_id", "resource_id")
);
COMMENT ON TABLE "resource_group_members" IS '定義資源與資源群組的成員關係。';

-- 資源依賴關係 (用於拓撲圖)
CREATE TABLE "resource_dependencies" (
    "source_resource_id" UUID NOT NULL REFERENCES "resources"("id") ON DELETE CASCADE,
    "target_resource_id" UUID NOT NULL REFERENCES "resources"("id") ON DELETE CASCADE,
    PRIMARY KEY ("source_resource_id", "target_resource_id")
);
COMMENT ON TABLE "resource_dependencies" IS '定義資源之間的依賴關係，用於繪製拓撲圖。';

-- 儀表板定義
CREATE TABLE "dashboards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'built-in' CHECK (type IN ('built-in', 'grafana')),
    "category" VARCHAR(100),
    "description" TEXT,
    "owner_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "grafana_url" TEXT,
    "grafana_dashboard_uid" VARCHAR(100),
    "grafana_folder_uid" VARCHAR(100),
    "layout" JSONB, -- 用於儲存內建儀表板的佈局
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "dashboards" IS '儲存儀表板的設定與資訊。';
COMMENT ON COLUMN "dashboards"."layout" IS '儲存 built-in 類型儀表板的網格與元件佈局。';

-- 為核心資產建立索引
CREATE INDEX "idx_resources_type" ON "resources"("type");
CREATE INDEX "idx_resources_status" ON "resources"("status");
CREATE INDEX "idx_resources_owner_team_id" ON "resources"("owner_team_id");
CREATE INDEX "idx_dashboards_owner_id" ON "dashboards"("owner_id");

-- 為 SRE 資產相關資料表掛上 updated_at 觸發器
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "resources"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "resource_groups"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "dashboards"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "page_layouts"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of SRE Core Assets Schema


-- =============================================================================
-- 事件與告警系統
-- =============================================================================

-- 告警規則
CREATE TABLE "alert_rules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "target" TEXT NOT NULL,
    "conditions_summary" TEXT,
    "severity" VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    "automation_enabled" BOOLEAN NOT NULL DEFAULT false,
    "automation_playbook_id" UUID, -- REFERENCES "automation_playbooks"("id") ON DELETE SET NULL,
    "creator_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "labels" JSONB,
    "condition_groups" JSONB,
    "title_template" TEXT,
    "content_template" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "alert_rules" IS '儲存告警偵測規則，與 Grafana 的規則模型對應。';
COMMENT ON COLUMN "alert_rules"."target" IS '告警規則監控的目標，例如資源 ID 或標籤查詢。';
COMMENT ON COLUMN "alert_rules"."condition_groups" IS '告警的詳細觸發條件 (JSON 格式)。';

-- 事件 (由告警規則觸發)
CREATE TABLE "incidents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "summary" TEXT NOT NULL,
    "resource_id" UUID REFERENCES "resources"("id") ON DELETE SET NULL,
    "service_impact" VARCHAR(50) CHECK (service_impact IN ('High', 'Medium', 'Low')),
    "alert_rule_id" UUID REFERENCES "alert_rules"("id") ON DELETE SET NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved', 'silenced')),
    "severity" VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    "priority" VARCHAR(10) CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    "assignee_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "triggered_at" TIMESTAMPTZ NOT NULL,
    "acknowledged_at" TIMESTAMPTZ,
    "resolved_at" TIMESTAMPTZ,
    "ai_analysis" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "incidents" IS '記錄由告警規則觸發的具體事件。';
COMMENT ON COLUMN "incidents"."ai_analysis" IS '儲存由 AI 提供的事件分析與建議。';

-- 事件歷史 (狀態變更、評論等)
CREATE TABLE "incident_history" (
    "id" BIGSERIAL PRIMARY KEY,
    "incident_id" UUID NOT NULL REFERENCES "incidents"("id") ON DELETE CASCADE,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(255) NOT NULL,
    "details" TEXT
);
COMMENT ON TABLE "incident_history" IS '記錄單一事件的生命週期內的所有變更。';

-- 靜音規則
CREATE TABLE "silence_rules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "matchers" JSONB NOT NULL,
    "schedule" JSONB NOT NULL,
    "creator_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "silence_rules" IS '用於在特定條件或時間內抑制告警通知。';
COMMENT ON COLUMN "silence_rules"."matchers" IS '定義此規則要匹配哪些事件標籤的條件。';
COMMENT ON COLUMN "silence_rules"."schedule" IS '定義靜音的排程，如單次、週期性等。';

-- 為事件與告警系統建立索引
CREATE INDEX "idx_alert_rules_enabled" ON "alert_rules"("enabled");
CREATE INDEX "idx_incidents_status" ON "incidents"("status");
CREATE INDEX "idx_incidents_resource_id" ON "incidents"("resource_id");
CREATE INDEX "idx_incidents_assignee_id" ON "incidents"("assignee_id");
CREATE INDEX "idx_incidents_triggered_at" ON "incidents"("triggered_at" DESC);
CREATE INDEX "idx_incident_history_incident_id" ON "incident_history"("incident_id");
CREATE INDEX "idx_silence_rules_enabled" ON "silence_rules"("enabled");

-- 為事件與告警系統相關資料表掛上 updated_at 觸發器
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "alert_rules"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "incidents"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "silence_rules"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of Incidents & Alerting Schema


-- =============================================================================
-- 自動化中心
-- =============================================================================

-- 自動化腳本 (Playbook)
CREATE TABLE "automation_playbooks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL CHECK (type IN ('shell', 'python', 'ansible', 'terraform')),
    "content" TEXT NOT NULL,
    "parameters" JSONB, -- 儲存參數定義
    "creator_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "automation_playbooks" IS '儲存可被執行的自動化腳本。';
COMMENT ON COLUMN "automation_playbooks"."parameters" IS '定義腳本可接受的參數 (JSON 格式)。';

-- 自動化觸發器
CREATE TABLE "automation_triggers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "type" VARCHAR(50) NOT NULL CHECK (type IN ('Schedule', 'Webhook', 'Event')),
    "target_playbook_id" UUID NOT NULL REFERENCES "automation_playbooks"("id") ON DELETE CASCADE,
    "config" JSONB NOT NULL,
    "creator_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "last_triggered_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "automation_triggers" IS '定義觸發自動化腳本的條件。';
COMMENT ON COLUMN "automation_triggers"."config" IS '儲存觸發器的特定設定，如 cron 表達式、webhook URL 等。';

-- 自動化執行歷史
CREATE TABLE "automation_executions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "playbook_id" UUID NOT NULL REFERENCES "automation_playbooks"("id") ON DELETE CASCADE,
    "trigger_id" UUID REFERENCES "automation_triggers"("id") ON DELETE SET NULL,
    "trigger_source" VARCHAR(50) NOT NULL CHECK (trigger_source IN ('manual', 'event', 'schedule')),
    "triggered_by_user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "status" VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'running', 'pending')),
    "parameters" JSONB,
    "start_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMPTZ,
    "duration_ms" INTEGER,
    "logs" JSONB -- 儲存 stdout 和 stderr
);
COMMENT ON TABLE "automation_executions" IS '記錄自動化腳本的每一次執行。';
COMMENT ON COLUMN "automation_executions"."logs" IS '儲存執行的標準輸出與標準錯誤。';

-- 現在可以安全地為 alert_rules 加上外鍵
ALTER TABLE "alert_rules"
ADD CONSTRAINT "fk_alert_rules_automation_playbook"
FOREIGN KEY ("automation_playbook_id")
REFERENCES "automation_playbooks"("id")
ON DELETE SET NULL;

-- 為自動化中心建立索引
CREATE INDEX "idx_automation_playbooks_type" ON "automation_playbooks"("type");
CREATE INDEX "idx_automation_triggers_target_playbook_id" ON "automation_triggers"("target_playbook_id");
CREATE INDEX "idx_automation_executions_playbook_id" ON "automation_executions"("playbook_id");
CREATE INDEX "idx_automation_executions_status" ON "automation_executions"("status");
CREATE INDEX "idx_automation_executions_start_time" ON "automation_executions"("start_time" DESC);

-- 為自動化中心相關資料表掛上 updated_at 觸發器
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "automation_playbooks"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "automation_triggers"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of Automation Center Schema


-- =============================================================================
-- 分析中心 (Observability)
-- 註: logs 和 spans 資料表預期會有大量寫入，強烈建議使用 TimescaleDB
-- 並將其轉換為超級表 (Hypertable)，或使用 PostgreSQL 原生分區。
-- =============================================================================

-- 日誌條目
CREATE TABLE "logs" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "service" VARCHAR(255),
    "level" VARCHAR(50) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'debug')),
    "message" TEXT,
    "details" JSONB,
    "trace_id" VARCHAR(255),
    "span_id" VARCHAR(255),
    PRIMARY KEY ("id", "timestamp")
);
COMMENT ON TABLE "logs" IS '儲存來自各個服務的日誌數據。';
COMMENT ON COLUMN "logs"."trace_id" IS '關聯的追蹤 ID，用於日誌與追蹤的整合。';

-- 追蹤數據
CREATE TABLE "traces" (
    "trace_id" VARCHAR(255) PRIMARY KEY,
    "root_service_name" VARCHAR(255),
    "root_operation_name" VARCHAR(255),
    "start_time" TIMESTAMPTZ NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "service_count" INTEGER,
    "span_count" INTEGER,
    "error_count" INTEGER
);
COMMENT ON TABLE "traces" IS '儲存分散式追蹤的摘要資訊。';

-- 跨距數據 (組成追蹤的基本單位)
CREATE TABLE "spans" (
    "span_id" VARCHAR(255) NOT NULL,
    "trace_id" VARCHAR(255) NOT NULL, -- REFERENCES "traces"("trace_id") ON DELETE CASCADE,
    "parent_span_id" VARCHAR(255),
    "operation_name" VARCHAR(255) NOT NULL,
    "service_name" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL CHECK (status IN ('ok', 'error')),
    "tags" JSONB,
    "logs" JSONB,
    PRIMARY KEY ("span_id", "trace_id", "start_time")
);
COMMENT ON TABLE "spans" IS '儲存分散式追蹤中的每一個跨距(Span)的詳細資訊。';
COMMENT ON COLUMN "spans"."trace_id" IS '此 Span 所屬的 Trace ID。';

-- 建議: 將 logs 和 spans 轉換為 TimescaleDB 超級表
-- SELECT create_hypertable('logs', 'timestamp');
-- SELECT create_hypertable('spans', 'start_time');

-- 為分析中心建立索引
CREATE INDEX "idx_logs_timestamp" ON "logs" ("timestamp" DESC);
CREATE INDEX "idx_logs_service_level" ON "logs" ("service", "level");
CREATE INDEX "idx_logs_trace_id" ON "logs"("trace_id");
CREATE INDEX "idx_traces_start_time" ON "traces"("start_time" DESC);
CREATE INDEX "idx_traces_root_service" ON "traces"("root_service_name");
CREATE INDEX "idx_spans_trace_id" ON "spans"("trace_id");
CREATE INDEX "idx_spans_start_time" ON "spans"("start_time" DESC);

-- End of Observability Schema


-- =============================================================================
-- 通知系統
-- =============================================================================

-- 通知管道
CREATE TABLE "notification_channels" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL CHECK (type IN ('Email', 'Slack', 'Webhook')),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "last_test_result" VARCHAR(50) DEFAULT 'pending' CHECK (last_test_result IN ('success', 'failed', 'pending')),
    "last_tested_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "notification_channels" IS '儲存發送通知的具體管道設定，如 Email SMTP、Slack Webhook URL。';
COMMENT ON COLUMN "notification_channels"."config" IS '儲存該管道類型的特定設定。';

-- 通知策略
CREATE TABLE "notification_strategies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "trigger_condition" TEXT NOT NULL,
    "priority" VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    "creator_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
COMMENT ON TABLE "notification_strategies" IS '定義何時、以及如何發送通知的規則。';
COMMENT ON COLUMN "notification_strategies"."trigger_condition" IS '觸發此策略的條件，例如 "severity=critical AND service=api-gateway"。';

-- 通知策略與管道的關聯表
CREATE TABLE "strategy_channel_bindings" (
    "strategy_id" UUID NOT NULL REFERENCES "notification_strategies"("id") ON DELETE CASCADE,
    "channel_id" UUID NOT NULL REFERENCES "notification_channels"("id") ON DELETE CASCADE,
    PRIMARY KEY ("strategy_id", "channel_id")
);
COMMENT ON TABLE "strategy_channel_bindings" IS '將通知策略與一個或多個通知管道綁定。';


-- 通知發送歷史
CREATE TABLE "notification_history" (
    "id" BIGSERIAL PRIMARY KEY,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "strategy_id" UUID REFERENCES "notification_strategies"("id") ON DELETE SET NULL,
    "channel_id" UUID REFERENCES "notification_channels"("id") ON DELETE SET NULL,
    "channel_type" VARCHAR(50),
    "recipient" TEXT,
    "status" VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed')),
    "content" TEXT,
    "error_message" TEXT
);
COMMENT ON TABLE "notification_history" IS '記錄每一次嘗試發送通知的歷史。';

-- 為通知系統建立索引
CREATE INDEX "idx_notification_channels_type" ON "notification_channels"("type");
CREATE INDEX "idx_notification_history_status" ON "notification_history"("status");
CREATE INDEX "idx_notification_history_timestamp" ON "notification_history"("timestamp" DESC);

-- 為通知系統相關資料表掛上 updated_at 觸發器
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "notification_channels"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "notification_strategies"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of Notification System Schema


-- =============================================================================
-- 平台全域設定
-- =============================================================================

-- 標籤定義
CREATE TABLE "tag_definitions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" VARCHAR(255) NOT NULL UNIQUE,
    "category" VARCHAR(100) CHECK (category IN ('Infrastructure', 'Application', 'Business', 'Security')),
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "tag_definitions" IS '定義全平台可用的標籤 (Tag) 的鍵 (Key)。';

-- 標籤允許值
CREATE TABLE "tag_values" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tag_definition_id" UUID NOT NULL REFERENCES "tag_definitions"("id") ON DELETE CASCADE,
    "value" VARCHAR(255) NOT NULL,
    "description" TEXT,
    UNIQUE("tag_definition_id", "value")
);
COMMENT ON TABLE "tag_values" IS '定義特定標籤鍵允許使用的值。';

-- 資源與標籤的關聯表 (多對多)
CREATE TABLE "resource_tags" (
    "resource_id" UUID NOT NULL REFERENCES "resources"("id") ON DELETE CASCADE,
    "tag_value_id" UUID NOT NULL REFERENCES "tag_values"("id") ON DELETE CASCADE,
    PRIMARY KEY ("resource_id", "tag_value_id")
);
COMMENT ON TABLE "resource_tags" IS '將標籤應用於資源。';

-- 系統設定 (鍵值對)
CREATE TABLE "system_settings" (
    "key" VARCHAR(255) PRIMARY KEY,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "system_settings" IS '以鍵值對形式儲存系統級設定，如郵件伺服器、認證提供商等。';

-- 為平台設定建立索引
CREATE INDEX "idx_tag_definitions_key" ON "tag_definitions"("key");
CREATE INDEX "idx_resource_tags_resource_id" ON "resource_tags"("resource_id");
CREATE INDEX "idx_resource_tags_tag_value_id" ON "resource_tags"("tag_value_id");

-- 為平台設定相關資料表掛上 updated_at 觸發器
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "tag_definitions"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "system_settings"
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- End of Platform Settings Schema