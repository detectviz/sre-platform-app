-- =====================================================
-- SRE Platform Database Schema
-- =====================================================
-- Generated from: types.ts
-- Database: PostgreSQL 14+
-- Generated: 2025-10-02
-- Version: 1.0.0
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Dashboard Types
CREATE TYPE dashboard_type AS ENUM ('built-in', 'custom', 'grafana');

-- Incident Types
CREATE TYPE incident_status AS ENUM ('New', 'Acknowledged', 'Investigating', 'Resolved', 'Closed');
CREATE TYPE incident_severity AS ENUM ('Critical', 'Warning', 'Info');
CREATE TYPE incident_impact AS ENUM ('High', 'Medium', 'Low');

-- Resource Types
CREATE TYPE resource_status AS ENUM ('Healthy', 'Warning', 'Critical', 'Unknown');

-- Automation Types
CREATE TYPE playbook_type AS ENUM ('Shell Script', 'Python', 'Ansible', 'Terraform');
CREATE TYPE execution_status AS ENUM ('Pending', 'Running', 'Success', 'Failed', 'Cancelled');
CREATE TYPE trigger_source AS ENUM ('Manual', 'Scheduled', 'Webhook', 'Incident', 'Alert');
CREATE TYPE trigger_type AS ENUM ('Schedule (Cron)', 'Webhook', 'Event (Incident/Alert)');

-- User & IAM Types
CREATE TYPE user_role AS ENUM ('Admin', 'SRE', 'Developer', 'Viewer');
CREATE TYPE user_status AS ENUM ('active', 'invited', 'inactive');

-- Alert Rule Types
CREATE TYPE alert_severity AS ENUM ('Critical', 'Warning', 'Info');
CREATE TYPE condition_operator AS ENUM ('>', '<', '>=', '<=', '==', '!=');
CREATE TYPE condition_logic AS ENUM ('AND', 'OR');

-- Notification Types
CREATE TYPE notification_channel_type AS ENUM ('Email', 'Webhook (通用)', 'Slack', 'LINE Notify', 'SMS');
CREATE TYPE notification_status AS ENUM ('sent', 'failed', 'pending');
CREATE TYPE test_result AS ENUM ('success', 'failed', 'not_tested');

-- Audit Types
CREATE TYPE audit_action AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE');
CREATE TYPE audit_result AS ENUM ('success', 'failure');

-- Datasource Types
CREATE TYPE datasource_type AS ENUM ('VictoriaMetrics', 'Grafana', 'Elasticsearch', 'Prometheus', 'Custom');
CREATE TYPE auth_method AS ENUM ('Token', 'Basic Auth', 'Keycloak Integration', 'None');
CREATE TYPE connection_status AS ENUM ('ok', 'error', 'pending');

-- Discovery Types
CREATE TYPE discovery_job_kind AS ENUM ('K8s', 'SNMP', 'Cloud Provider', 'Static Range', 'Custom Script');
CREATE TYPE discovery_job_status AS ENUM ('success', 'partial_failure', 'failed', 'running');
CREATE TYPE discovered_resource_status AS ENUM ('new', 'imported', 'ignored');

-- Analysis Types
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE optimization_type AS ENUM ('performance', 'cost', 'security', 'reliability');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users Table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'invited',
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Teams Table
CREATE TABLE teams (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id VARCHAR(255) NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_deleted_at ON teams(deleted_at);

-- Team Members (Many-to-Many)
CREATE TABLE team_members (
    team_id VARCHAR(255) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Roles Table
CREATE TABLE roles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_roles_enabled ON roles(enabled);
CREATE INDEX idx_roles_deleted_at ON roles(deleted_at);

-- Role Permissions (stored as JSONB array)
CREATE TABLE role_permissions (
    role_id VARCHAR(255) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission)
);

CREATE INDEX idx_role_permissions_permission ON role_permissions(permission);

-- =====================================================
-- RESOURCE MANAGEMENT
-- =====================================================

-- Datasources Table
CREATE TABLE datasources (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type datasource_type NOT NULL,
    url TEXT NOT NULL,
    auth_method auth_method NOT NULL,
    status connection_status NOT NULL DEFAULT 'pending',
    tags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_datasources_type ON datasources(type);
CREATE INDEX idx_datasources_status ON datasources(status);
CREATE INDEX idx_datasources_deleted_at ON datasources(deleted_at);

-- Resources Table
CREATE TABLE resources (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    status resource_status NOT NULL DEFAULT 'Unknown',
    provider VARCHAR(255),
    region VARCHAR(255),
    team_id VARCHAR(255) REFERENCES teams(id),
    owner_id VARCHAR(255) REFERENCES users(id),
    datasource_id VARCHAR(255) REFERENCES datasources(id),
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    last_check_in_at TIMESTAMPTZ,
    discovered_by_job_id VARCHAR(255),
    monitoring_agent VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_provider ON resources(provider);
CREATE INDEX idx_resources_region ON resources(region);
CREATE INDEX idx_resources_team_id ON resources(team_id);
CREATE INDEX idx_resources_owner_id ON resources(owner_id);
CREATE INDEX idx_resources_datasource_id ON resources(datasource_id);
CREATE INDEX idx_resources_deleted_at ON resources(deleted_at);
CREATE INDEX idx_resources_tags ON resources USING gin(tags);

-- Resource Groups Table
CREATE TABLE resource_groups (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_team VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_resource_groups_deleted_at ON resource_groups(deleted_at);

-- Resource Group Members (Many-to-Many)
CREATE TABLE resource_group_members (
    group_id VARCHAR(255) NOT NULL REFERENCES resource_groups(id) ON DELETE CASCADE,
    resource_id VARCHAR(255) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, resource_id)
);

CREATE INDEX idx_resource_group_members_resource_id ON resource_group_members(resource_id);

-- Resource Links (Topology Relationships)
CREATE TABLE resource_links (
    id VARCHAR(255) PRIMARY KEY,
    source_resource_id VARCHAR(255) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    target_resource_id VARCHAR(255) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    link_type VARCHAR(50) NOT NULL CHECK (link_type IN ('depends_on', 'connects_to', 'includes', 'manages', 'monitors')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_resource_links_source ON resource_links(source_resource_id);
CREATE INDEX idx_resource_links_target ON resource_links(target_resource_id);
CREATE INDEX idx_resource_links_type ON resource_links(link_type);
CREATE INDEX idx_resource_links_deleted_at ON resource_links(deleted_at);

-- Discovery Jobs Table
CREATE TABLE discovery_jobs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    kind discovery_job_kind NOT NULL,
    schedule VARCHAR(255) NOT NULL,
    status discovery_job_status NOT NULL DEFAULT 'success',
    target_config JSONB NOT NULL,
    exporter_binding JSONB,
    edge_gateway JSONB,
    tags JSONB DEFAULT '{}',
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_discovery_jobs_kind ON discovery_jobs(kind);
CREATE INDEX idx_discovery_jobs_status ON discovery_jobs(status);
CREATE INDEX idx_discovery_jobs_deleted_at ON discovery_jobs(deleted_at);

-- Discovered Resources Table
CREATE TABLE discovered_resources (
    id VARCHAR(255) PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL REFERENCES discovery_jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    type VARCHAR(255) NOT NULL,
    status discovered_resource_status NOT NULL DEFAULT 'new',
    tags JSONB DEFAULT '{}',
    ignored_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discovered_resources_job_id ON discovered_resources(job_id);
CREATE INDEX idx_discovered_resources_status ON discovered_resources(status);

-- =====================================================
-- ALERT & INCIDENT MANAGEMENT
-- =====================================================

-- Alert Rules Table
CREATE TABLE alert_rules (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    resource_type VARCHAR(255) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    severity alert_severity NOT NULL,
    team_id VARCHAR(255) REFERENCES teams(id),
    owner_id VARCHAR(255) REFERENCES users(id),
    target_scope VARCHAR(50) CHECK (target_scope IN ('specific', 'group', 'tag')),
    target_resource_ids TEXT[],
    condition_groups JSONB NOT NULL,
    notification_strategy_ids TEXT[],
    title_template TEXT,
    content_template TEXT,
    automation_enabled BOOLEAN DEFAULT false,
    automation_config JSONB,
    test_payload JSONB,
    triggered_count INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    tags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX idx_alert_rules_resource_type ON alert_rules(resource_type);
CREATE INDEX idx_alert_rules_severity ON alert_rules(severity);
CREATE INDEX idx_alert_rules_team_id ON alert_rules(team_id);
CREATE INDEX idx_alert_rules_owner_id ON alert_rules(owner_id);
CREATE INDEX idx_alert_rules_deleted_at ON alert_rules(deleted_at);

-- Incidents Table
CREATE TABLE incidents (
    id VARCHAR(255) PRIMARY KEY,
    summary TEXT NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255) NOT NULL REFERENCES resources(id),
    rule VARCHAR(255) NOT NULL,
    rule_id VARCHAR(255) NOT NULL REFERENCES alert_rules(id),
    status incident_status NOT NULL DEFAULT 'New',
    severity incident_severity NOT NULL,
    impact incident_impact NOT NULL,
    assignee VARCHAR(255),
    team_id VARCHAR(255) REFERENCES teams(id),
    owner_id VARCHAR(255) REFERENCES users(id),
    silenced_by VARCHAR(255) REFERENCES users(id),
    tags JSONB DEFAULT '{}',
    history JSONB DEFAULT '[]',
    ai_analysis JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_incidents_resource_id ON incidents(resource_id);
CREATE INDEX idx_incidents_rule_id ON incidents(rule_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_impact ON incidents(impact);
CREATE INDEX idx_incidents_assignee ON incidents(assignee);
CREATE INDEX idx_incidents_team_id ON incidents(team_id);
CREATE INDEX idx_incidents_occurred_at ON incidents(occurred_at);
CREATE INDEX idx_incidents_deleted_at ON incidents(deleted_at);

-- Silence Rules Table
CREATE TABLE silence_rules (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    type VARCHAR(50) NOT NULL CHECK (type IN ('single', 'repeat', 'condition')),
    matchers JSONB NOT NULL,
    schedule JSONB NOT NULL,
    creator VARCHAR(255) NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_silence_rules_enabled ON silence_rules(enabled);
CREATE INDEX idx_silence_rules_type ON silence_rules(type);
CREATE INDEX idx_silence_rules_deleted_at ON silence_rules(deleted_at);

-- =====================================================
-- AUTOMATION
-- =====================================================

-- Automation Playbooks Table
CREATE TABLE automation_playbooks (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type playbook_type NOT NULL,
    content TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    timeout_seconds INTEGER DEFAULT 300,
    parameters JSONB DEFAULT '[]',
    execution_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    last_run_status execution_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_playbooks_type ON automation_playbooks(type);
CREATE INDEX idx_playbooks_enabled ON automation_playbooks(enabled);
CREATE INDEX idx_playbooks_deleted_at ON automation_playbooks(deleted_at);

-- Automation Executions Table
CREATE TABLE automation_executions (
    id VARCHAR(255) PRIMARY KEY,
    playbook_id VARCHAR(255) NOT NULL REFERENCES automation_playbooks(id),
    playbook_name VARCHAR(255) NOT NULL,
    incident_id VARCHAR(255) REFERENCES incidents(id),
    alert_rule_id VARCHAR(255) REFERENCES alert_rules(id),
    target_resource_id VARCHAR(255) REFERENCES resources(id),
    status execution_status NOT NULL DEFAULT 'Pending',
    trigger_type trigger_source NOT NULL,
    triggered_by VARCHAR(255) NOT NULL REFERENCES users(id),
    parameters JSONB DEFAULT '{}',
    output TEXT,
    error_message TEXT,
    resolved_incident BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_executions_playbook_id ON automation_executions(playbook_id);
CREATE INDEX idx_executions_incident_id ON automation_executions(incident_id);
CREATE INDEX idx_executions_status ON automation_executions(status);
CREATE INDEX idx_executions_trigger_type ON automation_executions(trigger_type);
CREATE INDEX idx_executions_started_at ON automation_executions(started_at);
CREATE INDEX idx_executions_deleted_at ON automation_executions(deleted_at);

-- Automation Triggers Table
CREATE TABLE automation_triggers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type trigger_type NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    playbook_id VARCHAR(255) NOT NULL REFERENCES automation_playbooks(id),
    config JSONB NOT NULL,
    last_triggered_at TIMESTAMPTZ,
    creator VARCHAR(255) NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_triggers_type ON automation_triggers(type);
CREATE INDEX idx_triggers_enabled ON automation_triggers(enabled);
CREATE INDEX idx_triggers_playbook_id ON automation_triggers(playbook_id);
CREATE INDEX idx_triggers_deleted_at ON automation_triggers(deleted_at);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notification Channels Table
CREATE TABLE notification_channels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type notification_channel_type NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL,
    last_test_result test_result DEFAULT 'not_tested',
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notification_channels_type ON notification_channels(type);
CREATE INDEX idx_notification_channels_enabled ON notification_channels(enabled);
CREATE INDEX idx_notification_channels_deleted_at ON notification_channels(deleted_at);

-- Notification Strategies Table
CREATE TABLE notification_strategies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    trigger_condition TEXT NOT NULL,
    severity_levels incident_severity[],
    impact_levels incident_impact[],
    channel_ids TEXT[],
    creator VARCHAR(255) NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notification_strategies_enabled ON notification_strategies(enabled);
CREATE INDEX idx_notification_strategies_deleted_at ON notification_strategies(deleted_at);

-- Notification History Table
CREATE TABLE notification_history (
    id VARCHAR(255) PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL REFERENCES notification_channels(id),
    channel_type notification_channel_type NOT NULL,
    strategy_id VARCHAR(255) REFERENCES notification_strategies(id),
    incident_id VARCHAR(255) REFERENCES incidents(id),
    status notification_status NOT NULL,
    recipients TEXT[],
    message TEXT NOT NULL,
    error TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_notification_history_channel_id ON notification_history(channel_id);
CREATE INDEX idx_notification_history_strategy_id ON notification_history(strategy_id);
CREATE INDEX idx_notification_history_incident_id ON notification_history(incident_id);
CREATE INDEX idx_notification_history_status ON notification_history(status);
CREATE INDEX idx_notification_history_sent_at ON notification_history(sent_at);

-- =====================================================
-- DASHBOARDS
-- =====================================================

-- Dashboards Table
CREATE TABLE dashboards (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type dashboard_type NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    owner VARCHAR(255) NOT NULL,
    team_id VARCHAR(255) REFERENCES teams(id),
    owner_id VARCHAR(255) REFERENCES users(id),
    path VARCHAR(500) NOT NULL,
    grafana_url TEXT,
    grafana_dashboard_uid VARCHAR(255),
    grafana_folder_uid VARCHAR(255),
    layout JSONB DEFAULT '[]',
    resource_ids TEXT[],
    tags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_dashboards_type ON dashboards(type);
CREATE INDEX idx_dashboards_category ON dashboards(category);
CREATE INDEX idx_dashboards_team_id ON dashboards(team_id);
CREATE INDEX idx_dashboards_owner_id ON dashboards(owner_id);
CREATE INDEX idx_dashboards_deleted_at ON dashboards(deleted_at);

-- =====================================================
-- ANALYSIS & AI
-- =====================================================

-- Incident Analysis Table
CREATE TABLE incident_analyses (
    id VARCHAR(255) PRIMARY KEY,
    incident_id VARCHAR(255) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    root_cause TEXT,
    impact_assessment TEXT,
    recommended_actions TEXT[],
    related_incidents TEXT[],
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    analysis_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_analyses_incident_id ON incident_analyses(incident_id);
CREATE INDEX idx_incident_analyses_analysis_time ON incident_analyses(analysis_time);

-- Resource Analysis Table
CREATE TABLE resource_analyses (
    id VARCHAR(255) PRIMARY KEY,
    resource_id VARCHAR(255) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    resource_name VARCHAR(255) NOT NULL,
    risk_level risk_level NOT NULL,
    risk_analysis TEXT,
    optimization_suggestions JSONB DEFAULT '[]',
    predicted_issues JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    analysis_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resource_analyses_resource_id ON resource_analyses(resource_id);
CREATE INDEX idx_resource_analyses_risk_level ON resource_analyses(risk_level);
CREATE INDEX idx_resource_analyses_analysis_time ON resource_analyses(analysis_time);

-- Multi-Incident Analysis Table
CREATE TABLE multi_incident_analyses (
    id VARCHAR(255) PRIMARY KEY,
    incident_ids TEXT[] NOT NULL,
    correlation_found BOOLEAN NOT NULL,
    correlation_summary TEXT,
    common_root_cause TEXT,
    timeline JSONB DEFAULT '[]',
    recommended_actions TEXT[],
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    analysis_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_multi_incident_analyses_analysis_time ON multi_incident_analyses(analysis_time);

-- Log Analysis Table
CREATE TABLE log_analyses (
    id VARCHAR(255) PRIMARY KEY,
    query TEXT NOT NULL,
    time_range_start TIMESTAMPTZ NOT NULL,
    time_range_end TIMESTAMPTZ NOT NULL,
    total_logs INTEGER NOT NULL,
    error_count INTEGER NOT NULL,
    warning_count INTEGER NOT NULL,
    patterns_found JSONB DEFAULT '[]',
    anomalies JSONB DEFAULT '[]',
    insights TEXT,
    analysis_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_log_analyses_time_range ON log_analyses(time_range_start, time_range_end);
CREATE INDEX idx_log_analyses_analysis_time ON log_analyses(analysis_time);

-- =====================================================
-- AUDIT & CONFIGURATION
-- =====================================================

-- Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    action audit_action NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255),
    changes JSONB,
    result audit_result NOT NULL DEFAULT 'success',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_result ON audit_logs(result);

-- Config Versions Table (Version Control for Entities)
CREATE TABLE config_versions (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL CHECK (entity_type IN ('AlertRule', 'AutomationPlaybook', 'Dashboard', 'NotificationStrategy', 'SilenceRule', 'Resource', 'Team', 'User')),
    entity_id VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL,
    config_snapshot JSONB NOT NULL,
    change_summary TEXT,
    changed_by VARCHAR(255) NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_config_versions_entity ON config_versions(entity_type, entity_id);
CREATE INDEX idx_config_versions_version ON config_versions(entity_type, entity_id, version);
CREATE INDEX idx_config_versions_created_at ON config_versions(created_at);

-- Tag Definitions Table (Tag Management)
CREATE TABLE tag_definitions (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    scopes TEXT[] NOT NULL,
    required BOOLEAN DEFAULT false,
    readonly BOOLEAN DEFAULT false,
    writable_roles TEXT[],
    link_to_entity VARCHAR(255),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tag_definitions_key ON tag_definitions(key);
CREATE INDEX idx_tag_definitions_deleted_at ON tag_definitions(deleted_at);

-- Tag Values Table
CREATE TABLE tag_values (
    id VARCHAR(255) PRIMARY KEY,
    tag_definition_id VARCHAR(255) NOT NULL REFERENCES tag_definitions(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tag_definition_id, value)
);

CREATE INDEX idx_tag_values_tag_definition_id ON tag_values(tag_definition_id);

-- =====================================================
-- SYSTEM & SETTINGS
-- =====================================================

-- System Settings Table (Key-Value Store)
CREATE TABLE system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(255) REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE user_preferences (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'system' CHECK (theme IN ('dark', 'light', 'system')),
    language VARCHAR(10) DEFAULT 'zh-TW' CHECK (language IN ('en', 'zh-TW')),
    timezone VARCHAR(100) DEFAULT 'Asia/Taipei',
    default_page VARCHAR(255),
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Login History Table
CREATE TABLE login_history (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    device VARCHAR(255),
    user_agent TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at);
CREATE INDEX idx_login_history_status ON login_history(status);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_groups_updated_at BEFORE UPDATE ON resource_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_links_updated_at BEFORE UPDATE ON resource_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_datasources_updated_at BEFORE UPDATE ON datasources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discovery_jobs_updated_at BEFORE UPDATE ON discovery_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discovered_resources_updated_at BEFORE UPDATE ON discovered_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_silence_rules_updated_at BEFORE UPDATE ON silence_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_playbooks_updated_at BEFORE UPDATE ON automation_playbooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_executions_updated_at BEFORE UPDATE ON automation_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_triggers_updated_at BEFORE UPDATE ON automation_triggers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_channels_updated_at BEFORE UPDATE ON notification_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_strategies_updated_at BEFORE UPDATE ON notification_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tag_definitions_updated_at BEFORE UPDATE ON tag_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS ON TABLES
-- =====================================================

COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE teams IS 'User teams for resource and permission management';
COMMENT ON TABLE roles IS 'Custom roles with fine-grained permissions';
COMMENT ON TABLE resources IS 'Monitored infrastructure resources';
COMMENT ON TABLE resource_groups IS 'Logical grouping of resources';
COMMENT ON TABLE resource_links IS 'Relationships between resources for topology visualization';
COMMENT ON TABLE datasources IS 'External data sources for metrics and monitoring';
COMMENT ON TABLE discovery_jobs IS 'Automated resource discovery jobs';
COMMENT ON TABLE alert_rules IS 'Alert rules for monitoring and notifications';
COMMENT ON TABLE incidents IS 'Incident records from triggered alerts';
COMMENT ON TABLE silence_rules IS 'Rules for silencing alerts based on conditions';
COMMENT ON TABLE automation_playbooks IS 'Automation scripts for incident response';
COMMENT ON TABLE automation_executions IS 'Execution history of automation playbooks';
COMMENT ON TABLE automation_triggers IS 'Triggers for automatic playbook execution';
COMMENT ON TABLE notification_channels IS 'Communication channels for notifications';
COMMENT ON TABLE notification_strategies IS 'Strategies for routing notifications';
COMMENT ON TABLE notification_history IS 'Historical record of sent notifications';
COMMENT ON TABLE dashboards IS 'Custom and Grafana dashboards';
COMMENT ON TABLE incident_analyses IS 'AI-powered incident analysis results';
COMMENT ON TABLE resource_analyses IS 'AI-powered resource analysis and optimization suggestions';
COMMENT ON TABLE multi_incident_analyses IS 'Correlation analysis across multiple incidents';
COMMENT ON TABLE log_analyses IS 'Log pattern analysis and anomaly detection';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system operations';
COMMENT ON TABLE config_versions IS 'Version control for entity configurations';
COMMENT ON TABLE tag_definitions IS 'Tag registry for standardized tagging';
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';
COMMENT ON TABLE user_preferences IS 'User-specific preferences and settings';
COMMENT ON TABLE login_history IS 'User login history for security auditing';

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert default system admin user (password should be changed on first login)
INSERT INTO users (id, name, email, role, status, created_at, updated_at) VALUES
('usr-admin', 'System Admin', 'admin@sre-platform.local', 'Admin', 'active', NOW(), NOW());

-- Insert default system settings
INSERT INTO system_settings (key, value, description, updated_at) VALUES
('platform_name', '"SRE Platform"', 'Platform display name', NOW()),
('platform_version', '"1.0.0"', 'Platform version', NOW()),
('help_url', '"https://docs.sre-platform.local"', 'Help documentation URL', NOW());

-- =====================================================
-- END OF SCHEMA
-- =====================================================
