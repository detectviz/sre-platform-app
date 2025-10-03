import { DB, uuidv4 } from './db';
import type { AlertRule, BacktestingResultsResponse, BacktestingRuleResult, ConnectionStatus, DiscoveryJob, Incident, NotificationStrategy, Resource, ResourceLink, ConfigVersion, TabConfigMap, TagDefinition, NotificationChannelType, RetryPolicy, DatasourceConnectionTestLog, TagBulkImportJob, UserPreferenceExportJob } from '../types';
import { auditLogMiddleware } from './auditLog';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const INCIDENT_STATUS_LABELS: Record<Incident['status'], string> = {
    new: 'New',
    acknowledged: 'acknowledged',
    resolved: 'resolved',
    silenced: 'silenced',
};

/**
 * 根據儀表板類別返回預設的資源 ID 列表
 */
function getDefaultResourcesByCategory(category: string): string[] {
    switch (category) {
        case '業務與 SLA':
            // API 服務和邊緣網關相關資源
            return ['res-001', 'res-007'];
        case '基礎設施':
            // 所有核心基礎設施資源
            return ['res-001', 'res-002', 'res-003', 'res-004'];
        case '營運與容量':
            // Web 服務和前端相關資源
            return ['res-004'];
        case '團隊自訂':
            // 核心資源子集
            return ['res-001', 'res-002', 'res-003'];
        default:
            // 默認包含主要資源
            return ['res-001', 'res-002'];
    }
}

const INCIDENT_STATUS_VALUES = Object.keys(INCIDENT_STATUS_LABELS) as Incident['status'][];

const normalizeIncidentStatus = (status: unknown): Incident['status'] => {
    if (typeof status !== 'string') {
        throw {
            status: 400,
            message: 'Incident status must be provided as a string.',
        };
    }
    const normalized = status.toLowerCase() as Incident['status'];
    if (!INCIDENT_STATUS_VALUES.includes(normalized)) {
        throw {
            status: 400,
            message: `Invalid incident status. Allowed values: ${INCIDENT_STATUS_VALUES.join(', ')}`,
        };
    }
    return normalized;
};

const formatIncidentStatus = (status: string | undefined): string => {
    if (!status) {
        return 'unknown';
    }
    const normalized = status.toLowerCase() as Incident['status'];
    return INCIDENT_STATUS_LABELS[normalized] ?? status;
};

const getActive = (collection: any[] | undefined) => {
    if (!collection) {
        return [];
    }
    return collection.filter(item => !item.deleted_at);
}

const validateEnum = <T>(value: any, allowed_values: T[], fieldName: string): T => {
    if (!allowed_values.includes(value as T)) {
        throw {
            status: 400,
            message: `Invalid ${fieldName}. Allowed values: ${allowed_values.join(', ')}`
        };
    }
    return value as T;
};

const paginate = (array: any[], page: any, pageSize: any) => {
    const pageNum = Number(page) || 1;
    const size = Number(pageSize) || 10;
    const startIndex = (pageNum - 1) * size;
    return {
        page: pageNum,
        page_size: size,
        total: array.length,
        items: array.slice(startIndex, startIndex + size),
    };
};

const sortData = (data: any[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            const valueA = Number(valA);
            const valueB = Number(valB);
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        }

        // Fallback for other types
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
};

const isActiveEntity = (entity: any) => entity && !entity.deleted_at;

const TIME_RANGE_UNIT_IN_MS: Record<string, number> = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};

const parseTimeRangeToMs = (value: unknown): number | null => {
    if (typeof value !== 'string') {
        return null;
    }

    const match = value.trim().match(/^(\d+)([mhd])$/);
    if (!match) {
        return null;
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const unitInMs = TIME_RANGE_UNIT_IN_MS[unit];

    if (!Number.isFinite(amount) || amount <= 0 || !unitInMs) {
        return null;
    }

    return amount * unitInMs;
};

const validateForeignKey = (collection: any[], id: string | undefined | null, entityLabel: string) => {
    if (!id) {
        return;
    }
    const exists = collection.some(item => item?.id === id && isActiveEntity(item));
    if (!exists) {
        throw {
            status: 404,
            message: `${entityLabel} not found.`
        };
    }
};

const validateForeignKeys = (collection: any[], ids: string[] | undefined | null, entityLabel: string) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        return;
    }
    const missing = ids.filter(id => !collection.some(item => item?.id === id && isActiveEntity(item)));
    if (missing.length > 0) {
        throw {
            status: 404,
            message: `The following ${entityLabel} could not be found: ${missing.join(', ')}`
        };
    }
};

const resolveAutomationScriptId = (automation: any) => {
    if (!automation) {
        return undefined;
    }
    return automation.script_id ?? automation.playbook_id;
};

const getConfigEntityCollection = (entityType: ConfigVersion['entity_type']) => {
    switch (entityType) {
        case 'alertrule':
            return { collection: DB.alert_rules, label: 'Alert rule' };
        case 'automationplaybook':
            return { collection: DB.playbooks, label: 'Automation playbook' };
        case 'dashboard':
            return { collection: DB.dashboards, label: 'Dashboard' };
        case 'notificationstrategy':
            return { collection: DB.notification_strategies, label: 'Notification strategy' };
        case 'silencerule':
            return { collection: DB.silence_rules, label: 'Silence rule' };
        case 'resource':
            return { collection: DB.resources, label: 'Resource' };
        case 'team':
            return { collection: DB.teams, label: 'Team' };
        case 'user':
            return { collection: DB.users, label: 'User' };
        default:
            return null;
    }
};

const ensureArrayTags = (tags: any): { id: string; key: string; value: string }[] => {
    if (Array.isArray(tags)) {
        return tags
            .filter(tag => tag && typeof tag.key === 'string' && typeof tag.value === 'string')
            .map(tag => ({ id: tag.id ?? `tag-${uuidv4()}`, key: tag.key, value: tag.value }));
    }
    if (tags && typeof tags === 'object') {
        return Object.entries(tags).map(([key, value]) => ({
            id: `tag-${uuidv4()}`,
            key,
            value: String(value)
        }));
    }
    return [];
};

const setArrayTag = (entity: any, key: string, value: string | undefined): void => {
    if (!value) {
        return;
    }
    entity.tags = ensureArrayTags(entity.tags);
    const existing = entity.tags.find((tag: any) => tag.key === key);
    if (existing) {
        existing.value = value;
        if (!existing.id) {
            existing.id = `tag-${uuidv4()}`;
        }
    } else {
        entity.tags.push({ id: `tag-${uuidv4()}`, key, value });
    }
};

const populateOwnerName = (entity: any): void => {
    if (!entity) {
        return;
    }
    if (entity.owner_id) {
        const owner = DB.users.find((u: any) => u.id === entity.owner_id && !u.deleted_at);
        if (owner) {
            entity.owner = owner.name;
            return;
        }
    }
    if (entity.team_id) {
        const team = DB.teams.find((t: any) => t.id === entity.team_id && !t.deleted_at);
        if (team) {
            entity.owner = team.name;
            return;
        }
    }
    if (!entity.owner) {
        entity.owner = 'Unassigned';
    }
};

/**
 * 自動填充 team 和 owner 標籤（從關聯實體自動生成）
 * @param entity 實體物件（需要有 team_id 和/或 owner_id 欄位）
 * @param options 控制標籤輸出格式
 */
const autoPopulateReadonlyTags = (entity: any, options: { asArray?: boolean } = {}): void => {
    const { asArray = false } = options;

    if (asArray) {
        entity.tags = ensureArrayTags(entity.tags);
    } else {
        if (!entity.tags || typeof entity.tags !== 'object' || Array.isArray(entity.tags)) {
            entity.tags = {};
        }
    }

    const team = entity.team_id ? DB.teams.find((t: any) => t.id === entity.team_id) : undefined;
    const owner = entity.owner_id ? DB.users.find((u: any) => u.id === entity.owner_id) : undefined;

    if (asArray) {
        if (team) {
            setArrayTag(entity, 'team', team.name);
        }
        if (owner) {
            setArrayTag(entity, 'owner', owner.name);
        }
    } else {
        if (team) {
            entity.tags.team = team.name;
        }
        if (owner) {
            entity.tags.owner = owner.name;
        }
    }
};

const normalizeResourceEntity = (resource: any) => {
    if (!resource) {
        return resource;
    }
    autoPopulateReadonlyTags(resource, { asArray: true });
    populateOwnerName(resource);
    return resource;
};

/**
 * 獲取當前用戶（模擬認證）
 * @returns 當前用戶對象
 */
const getCurrentUser = () => {
    // In a real application, this would come from authentication middleware
    // For now, we'll use the first user as the current user
    return DB.users[0];
};


const handleRequest = async (method: HttpMethod, url: string, params: any, body: any) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const urlParts = url.split('?')[0].split('/').filter(Boolean);
        const resource = urlParts[0];
        const id = urlParts[1];
        const subId = urlParts[2];
        const action = urlParts[3];

        switch (`${method} /${resource}`) {
            // Navigation
            case 'GET /navigation': {
                return DB.nav_items;
            }
            case 'POST /discovery': {
                if (id === 'batch-ignore') {
                    const { action, resource_ids = [] } = body || {};
                    if ((action && action !== 'ignore') || !Array.isArray(resource_ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    resource_ids.forEach((resource_id: string) => {
                        const index = DB.discovered_resources.findIndex((res: any) => res.id === resource_id);
                        if (index > -1) {
                            DB.discovered_resources[index].status = 'ignored';
                            DB.discovered_resources[index].ignored_at = new Date().toISOString();
                        }
                    });
                    return { success: true, updated: resource_ids.length };
                }
                break;
            }
            // Commands
            case 'GET /commands': {
                return DB.commands;
            }
            // Page Metadata
            case 'GET /pages': {
                if (id === 'metadata') {
                    return DB.page_metadata;
                }
                if (id === 'columns' && subId) {
                    const pageKey = subId as keyof typeof DB.all_columns;
                    return DB.all_columns[pageKey] || [];
                }
                break;
            }
            // UI Configs
            case 'GET /ui': {
                if (id === 'options') {
                    return DB.all_options;
                }
                if (id === 'themes' && subId === 'charts') return DB.chart_colors;
                if (id === 'content') {
                    if (action === 'command-palette') return DB.command_palette_content;
                    if (action === 'execution-log-detail') return DB.execution_log_detail_content;
                    if (action === 'import-modal') return DB.import_modal_content;
                    return DB.page_content;
                }
                if (id === 'icons') return DB.icon_map;
                if (id === 'tabs') {
                    const edition = process.env.SRE_PLATFORM_EDITION ?? 'community';
                    let tabsConfig = JSON.parse(JSON.stringify(DB.tab_configs)) as TabConfigMap;
                    if (edition === 'community') {
                        const platformSettingsTabs = tabsConfig.platformSettings;
                        if (platformSettingsTabs) {
                            const licenseTab = platformSettingsTabs.find(t => t.path.endsWith('/license'));
                            if (licenseTab) {
                                licenseTab.disabled = true;
                            }
                        }
                    }
                    return tabsConfig;
                }
                if (id === 'icons-config') return DB.notification_channel_icons;
                break;
            }
            // Me / Profile
            case 'GET /me': {
                if (id === 'login-history') {
                    return paginate(DB.login_history, params.page, params.page_size);
                }
                if (id === 'preferences') {
                    return DB.user_preferences;
                }
                return DB.users[0];
            }
            case 'PUT /me': {
                if (id === 'preferences') {
                    DB.user_preferences = { ...DB.user_preferences, ...body };
                    return DB.user_preferences;
                }
                break;
            }
            case 'POST /me': {
                if (id === 'change-password') {
                    const { old_password, new_password } = body;
                    // Mock validation: In a real app, this would be a secure check.
                    if (old_password === 'wrongpassword') {
                        throw { status: 400, message: '舊密碼不正確。' };
                    }
                    if (!new_password || new_password.length < 6) {
                        throw { status: 400, message: '新密碼長度至少需要 6 個字元。' };
                    }
                    // Success, return empty object which will result in a 204 No Content.
                    return {};
                }
                if (id === 'preferences' && subId === 'export') {
                    const format = typeof body?.format === 'string' && body.format.trim() ? body.format : 'json';
                    const currentUser = getCurrentUser();
                    const timestamp = new Date().toISOString();
                    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                    const baseUrl = process.env.MOCK_API_BASE_URL ?? 'http://localhost:4000/api/v1';
                    const job: UserPreferenceExportJob = {
                        id: `pref-export-${uuidv4()}`,
                        user_id: currentUser.id,
                        format,
                        status: 'success',
                        download_url: `${baseUrl}/downloads/preferences/${currentUser.id}-preferences.${format}`,
                        expires_at: expiresAt,
                        created_at: timestamp,
                        completed_at: timestamp
                    };
                    DB.user_preference_export_jobs.unshift(job);
                    DB.user_preferences = {
                        ...DB.user_preferences,
                        last_exported_at: job.completed_at,
                        last_export_format: format
                    };
                    return {
                        download_url: job.download_url,
                        expires_at: job.expires_at,
                        format,
                        job: {
                            id: job.id,
                            status: job.status,
                            created_at: job.created_at,
                            completed_at: job.completed_at
                        }
                    };
                }
                break;
            }

            // AI Copilot
            case 'GET /ai': {
                if (id === 'briefing') return DB.ai_briefing;
                if (id === 'infra' && subId === 'risk-prediction') return DB.ai_risk_prediction;
                break;
            }
            case 'POST /ai': {
                if (id === 'briefing' && subId === 'generate') return DB.ai_briefing;
                if (id === 'incidents' && subId === 'analyze') {
                    const { incident_ids } = body;
                    return incident_ids.length > 1 ? DB.multi_incident_analysis : DB.single_incident_analysis;
                }
                if (id === 'alert-rules' && subId === 'analyze') {
                    const ruleIds = Array.isArray(body?.rule_ids) ? body.rule_ids : [];
                    if (ruleIds.length === 0) {
                        throw { status: 400, message: '請至少選擇一項告警規則進行分析。' };
                    }
                    const selectedRules = DB.alert_rules.filter((rule: any) => ruleIds.includes(rule.id));
                    if (selectedRules.length === 0) {
                        throw { status: 404, message: '找不到對應的告警規則。' };
                    }
                    const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
                        critical: 'high',
                        warning: 'medium',
                        info: 'low',
                    };
                    const analysis = JSON.parse(JSON.stringify(DB.alert_rule_analysis));
                    analysis.evaluated_rules = selectedRules.map((rule: any) => ({
                        id: rule.id,
                        name: rule.name,
                        status: rule.enabled ? '已啟用' : '已停用',
                        severity: severityMap[rule.severity] ?? 'medium',
                    }));
                    if (typeof analysis.summary === 'string') {
                        analysis.summary = analysis.summary.replace('所選告警規則', `所選 ${selectedRules.length} 項告警規則`);
                    }
                    return analysis;
                }
                if (id === 'silence-rules' && subId === 'analyze') {
                    const ruleIds = Array.isArray(body?.rule_ids) ? body.rule_ids : [];
                    if (ruleIds.length === 0) {
                        throw { status: 400, message: '請至少選擇一項靜音規則進行分析。' };
                    }
                    const selectedRules = DB.silence_rules.filter((rule: any) => ruleIds.includes(rule.id));
                    if (selectedRules.length === 0) {
                        throw { status: 404, message: '找不到對應的靜音規則。' };
                    }
                    const analysis = JSON.parse(JSON.stringify(DB.silence_rule_analysis));
                    analysis.evaluated_rules = selectedRules.map((rule: any) => ({
                        id: rule.id,
                        name: rule.name,
                        status: rule.enabled ? '已啟用' : '已停用',
                        type: rule.type,
                    }));
                    if (typeof analysis.summary === 'string') {
                        analysis.summary = analysis.summary.replace('靜音規則', `靜音規則（共 ${selectedRules.length} 項）`);
                    }
                    return analysis;
                }
                if (id === 'automation' && subId === 'generate-script') return DB.generated_playbook;
                if (id === 'logs' && subId === 'summarize') {
                    return DB.log_analysis;
                }
                if (id === 'resources' && subId === 'analyze') {
                    const { resource_ids } = body;
                    // Mock: just return the same analysis regardless of input ids
                    return DB.resource_analysis;
                }
                break;
            }

            // Dashboards
            case 'GET /dashboards': {
                if (id === 'sre-war-room') {
                    if (subId === 'service-health') return DB.service_health_data;
                    if (subId === 'resource-group-status') return DB.resource_group_status_data;
                }
                if (id === 'infrastructure-insights' && subId === 'options') {
                    return DB.all_options.infraInsights;
                }
                if (id === 'available-grafana') {
                    const linkedUids = getActive(DB.dashboards).filter((d: any) => d.type === 'grafana' && d.grafanaDashboardUid).map((d: any) => d.grafanaDashboardUid);
                    return DB.available_grafana_dashboards.filter((d: any) => !linkedUids.includes(d.uid));
                }
                if (id === 'templates') return DB.dashboard_templates;
                if (id) {
                    const dashboard = DB.dashboards.find((d: any) => d.id === id);
                    if (!dashboard) throw { status: 404 };
                    return dashboard;
                }
                let dashboards = getActive(DB.dashboards);
                if (params) {
                    if (params.category && params.category !== 'All') dashboards = dashboards.filter((d: any) => d.category === params.category);
                    if (params.keyword) dashboards = dashboards.filter((d: any) => d.name.toLowerCase().includes(params.keyword.toLowerCase()));
                }
                if (params?.sort_by && params?.sort_order) {
                    dashboards = sortData(dashboards, params.sort_by, params.sort_order);
                }
                return paginate(dashboards, params?.page, params?.page_size);
            }
            case 'POST /dashboards': {
                if (id === 'batch-actions') {
                    const { action, ids } = body;
                    if (action === 'delete') {
                        const currentUser = getCurrentUser();
                        DB.dashboards.forEach((d: any) => {
                            if (!ids.includes(d.id)) return;
                            d.deleted_at = new Date().toISOString();
                            auditLogMiddleware(
                                currentUser.id,
                                'delete',
                                'Dashboard',
                                d.id,
                                { name: d.name, type: d.type, category: d.category }
                            );
                        });
                    }
                    return { success: true };
                }
                // 驗證必填欄位
                const { name, type, category } = body;
                if (!name || !type || !category) {
                    throw { status: 400, message: 'Missing required fields: name, type, category' };
                }

                const newDashboardData = { ...body, id: `db-${uuidv4()}` };
                if (!newDashboardData.path) {
                    newDashboardData.path = `/dashboard/${newDashboardData.id}`;
                }

                // 根據類別自動填充 resource_ids
                if (!newDashboardData.resource_ids || newDashboardData.resource_ids.length === 0) {
                    newDashboardData.resource_ids = getDefaultResourcesByCategory(category);
                }

                // 驗證外鍵
                if (newDashboardData.team_id) {
                    const team = DB.teams.find(t => t.id === newDashboardData.team_id && !t.deleted_at);
                    if (!team) {
                        throw { status: 404, message: 'Team not found.' };
                    }
                }
                if (newDashboardData.owner_id) {
                    const owner = DB.users.find(u => u.id === newDashboardData.owner_id && !u.deleted_at);
                    if (!owner) {
                        throw { status: 404, message: 'Owner (user) not found.' };
                    }
                }

                populateOwnerName(newDashboardData);

                // 設置創建和更新時間戳
                const timestamp = new Date().toISOString();
                newDashboardData.created_at = timestamp;
                newDashboardData.updated_at = timestamp;
                DB.dashboards.unshift(newDashboardData);
                // 自動填充唯讀標籤
                autoPopulateReadonlyTags(newDashboardData);
                // Audit log for dashboard creation
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'create',
                    'Dashboard',
                    newDashboardData.id,
                    { name: newDashboardData.name, type: newDashboardData.type, category: newDashboardData.category }
                );
                return newDashboardData;
            }
            case 'PATCH /dashboards': {
                const index = DB.dashboards.findIndex((d: any) => d.id === id);
                if (index === -1) throw { status: 404 };
                const existing = DB.dashboards[index];
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'team_id')) {
                    validateForeignKey(DB.teams, body?.team_id, 'Team');
                }
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'owner_id')) {
                    validateForeignKey(DB.users, body?.owner_id, 'Owner (user)');
                }
                // 更新 updated_at 時間戳
                const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
                populateOwnerName(updated);
                autoPopulateReadonlyTags(updated);
                DB.dashboards[index] = updated;
                // Audit log for dashboard update
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'update',
                    'Dashboard',
                    id,
                    {
                        old_name: existing.name,
                        new_name: updated.name,
                        old_type: existing.type,
                        new_type: updated.type,
                        old_category: existing.category,
                        new_category: updated.category
                    }
                );
                return updated;
            }
            case 'DELETE /dashboards': {
                const index = DB.dashboards.findIndex((d: any) => d.id === id);
                if (index > -1) {
                    const dashboard = DB.dashboards[index];
                    DB.dashboards[index].deleted_at = new Date().toISOString();
                    // Audit log for dashboard deletion
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        'Dashboard',
                        id,
                        { name: dashboard.name, type: dashboard.type, category: dashboard.category }
                    );
                }
                return {};
            }

            // Incidents, Rules, Silences
            case 'GET /incidents': {
                if (id === 'alert-rules') {
                    // Redirect /incidents/alert-rules to the alert-rules handler
                    if (subId === 'templates') return DB.alert_rule_templates;
                    if (subId === 'resource-types') return DB.resource_types;
                    if (subId === 'exporter-types') return DB.exporter_types;
                    if (subId === 'metrics') return DB.metric_metadata;
                    if (subId === 'count') {
                        let rules = getActive(DB.alert_rules);
                        if (params?.matchers) {
                            const matchers = JSON.parse(params.matchers);
                            matchers.forEach((matcher: any) => {
                                if (matcher.key === 'severity') {
                                    rules = rules.filter((r: any) => r.severity === matcher.value);
                                }
                            });
                        }
                        return { count: rules.length };
                    }
                    let rules = getActive(DB.alert_rules);
                    if (params?.severity) {
                        rules = rules.filter((r: any) => r.severity === params.severity);
                    }
                    if (params?.enabled !== undefined) {
                        rules = rules.filter((r: any) => r.enabled === (params.enabled === 'true'));
                    }
                    if (params?.search) {
                        const search = params.search.toLowerCase();
                        rules = rules.filter((r: any) =>
                            r.name.toLowerCase().includes(search) ||
                            r.target.toLowerCase().includes(search) ||
                            r.conditions_summary.toLowerCase().includes(search)
                        );
                    }
                    if (params?.sort_by && params?.sort_order) {
                        rules = sortData(rules, params.sort_by, params.sort_order);
                    }
                    return rules;
                }
                // 新增反向查詢端點：GET /incidents/{id}/executions
                if (id && subId === 'executions') {
                    // 查找與指定事件關聯的自動化執行
                    const incident = DB.incidents.find((i: any) => i.id === id);
                    if (!incident) throw { status: 404, message: 'Incident not found.' };

                    // 查找關聯的自動化執行記錄
                    const executions = DB.automation_executions.filter((e: any) =>
                        e.incident_id === id
                    );

                    return executions;
                }
                if (id) {
                    const incident = DB.incidents.find((i: any) => i.id === id);
                    if (!incident) throw { status: 404 };
                    return incident;
                }
                let incidents = DB.incidents;
                if (params?.resource_name) {
                    incidents = incidents.filter((i: any) => i.resource === params.resource_name);
                }
                if (params?.sort_by && params?.sort_order) {
                    incidents = sortData(incidents, params.sort_by, params.sort_order);
                }
                return paginate(incidents, params?.page, params?.page_size);
            }
            case 'POST /incidents': {
                if (id === 'batch-close') {
                    const { incident_ids = [], resolution_note } = body || {};
                    if (!Array.isArray(incident_ids) || incident_ids.length === 0) {
                        throw { status: 400, message: 'incident_ids must be a non-empty array.' };
                    }

                    const uniqueIncidentIds = Array.from(new Set(incident_ids));
                    const currentUser = getCurrentUser();
                    const timestamp = new Date().toISOString();
                    let updated = 0;
                    const skipped_ids: string[] = [];

                    uniqueIncidentIds.forEach((incidentId: string) => {
                        const incident = DB.incidents.find((i: any) => i.id === incidentId && !i.deleted_at);
                        if (!incident) {
                            skipped_ids.push(incidentId);
                            return;
                        }

                        const currentStatus = normalizeIncidentStatus(incident.status);
                        if (currentStatus === 'resolved') {
                            skipped_ids.push(incidentId);
                            return;
                        }

                        const previousStatus = currentStatus;
                        incident.status = 'resolved';
                        incident.resolved_at = timestamp;
                        incident.updated_at = timestamp;
                        incident.history.push({
                            timestamp,
                            user: currentUser.name,
                            action: 'Resolved',
                            details: `Status changed from '${formatIncidentStatus(previousStatus)}' to '${formatIncidentStatus('resolved')}'.`
                        });

                        if (resolution_note) {
                            incident.history.push({
                                timestamp,
                                user: currentUser.name,
                                action: 'Note Added',
                                details: resolution_note
                            });
                        }

                        auditLogMiddleware(
                            currentUser.id,
                            'update',
                            'Incident',
                            incident.id,
                            {
                                action: 'batch_close',
                                previous_status: previousStatus,
                                new_status: incident.status
                            }
                        );

                        updated += 1;
                    });

                    return { success: true, updated, skipped_ids };
                }

                if (id === 'batch-assign') {
                    const { incident_ids = [], assignee_id, assignee_name } = body || {};
                    if (!Array.isArray(incident_ids) || incident_ids.length === 0) {
                        throw { status: 400, message: 'incident_ids must be a non-empty array.' };
                    }

                    if (!assignee_id && !assignee_name) {
                        throw { status: 400, message: 'assignee_id or assignee_name is required for batch assignment.' };
                    }

                    let resolvedAssigneeName = assignee_name as string | undefined;
                    let assigneeUser: any = undefined;
                    if (assignee_id) {
                        validateForeignKey(DB.users, assignee_id, 'Assignee');
                        assigneeUser = DB.users.find((user: any) => user.id === assignee_id && isActiveEntity(user));
                        resolvedAssigneeName = assigneeUser?.name ?? resolvedAssigneeName;
                    } else if (assignee_name) {
                        assigneeUser = DB.users.find((user: any) => user.name === assignee_name && isActiveEntity(user));
                    }

                    if (!resolvedAssigneeName) {
                        throw { status: 400, message: 'Unable to resolve assignee name for batch assignment.' };
                    }

                    const currentUser = getCurrentUser();
                    const timestamp = new Date().toISOString();
                    const uniqueIncidentIds = Array.from(new Set(incident_ids));
                    let updated = 0;
                    const skipped_ids: string[] = [];

                    uniqueIncidentIds.forEach((incidentId: string) => {
                        const incident = DB.incidents.find((i: any) => i.id === incidentId && !i.deleted_at);
                        if (!incident) {
                            skipped_ids.push(incidentId);
                            return;
                        }

                        const previousAssignee = incident.assignee || 'Unassigned';
                        incident.assignee = resolvedAssigneeName;
                        if (assigneeUser?.id) {
                            incident.owner_id = assigneeUser.id;
                        }
                        incident.updated_at = timestamp;
                        incident.history.push({
                            timestamp,
                            user: currentUser.name,
                            action: 'Re-assigned',
                            details: `Assignee changed from ${previousAssignee} to ${resolvedAssigneeName}.`
                        });

                        auditLogMiddleware(
                            currentUser.id,
                            'update',
                            'Incident',
                            incident.id,
                            {
                                action: 'batch_assign',
                                previous_assignee: previousAssignee,
                                new_assignee: resolvedAssigneeName,
                                assignee_id: assigneeUser?.id ?? assignee_id ?? null
                            }
                        );

                        updated += 1;
                    });

                    return {
                        success: true,
                        updated,
                        skipped_ids,
                        assignee: resolvedAssigneeName,
                        assignee_id: assigneeUser?.id ?? assignee_id ?? null
                    };
                }

                if (!id) {
                    const { summary, resource_id, rule_id, severity, impact, assignee } = body || {};
                    if (!summary || !resource_id || !rule_id || !severity || !impact) {
                        throw { status: 400, message: 'Missing required fields for creating an incident.' };
                    }

                    const resource = DB.resources.find((r: any) => r.id === resource_id);
                    if (!resource) {
                        throw { status: 404, message: 'Resource not found.' };
                    }

                    const rule = DB.alert_rules.find((r: any) => r.id === rule_id);
                    if (!rule) {
                        throw { status: 404, message: 'Alert rule not found.' };
                    }

                    const timestamp = new Date().toISOString();
                    const newIncidentId = `INC-${uuidv4().slice(0, 8).toUpperCase()}`;
                    const severityValue = validateEnum(severity, ['critical', 'warning', 'info'], 'severity');
                    const impactValue = validateEnum(impact, ['high', 'medium', 'low'], 'impact');
                    const normalizedSeverity = (severityValue as string).toLowerCase() as Incident['severity'];
                    const normalizedImpact = (impactValue as string).toLowerCase() as Incident['impact'];
                    const newIncident: Incident = {
                        id: newIncidentId,
                        summary,
                        resource: resource.name,
                        resource_id,
                        impact: normalizedImpact,
                        rule: rule.name,
                        rule_id,
                        status: 'new',
                        severity: normalizedSeverity,
                        assignee: assignee || undefined,
                        team_id: body.team_id,
                        owner_id: body.owner_id,
                        tags: body.tags || {},
                        occurred_at: timestamp,
                        created_at: timestamp,
                        updated_at: timestamp,
                        history: [
                            {
                                timestamp,
                                user: 'System',
                                action: 'Created',
                                details: `Incident created from rule "${rule.name}".`,
                            },
                        ],
                    };

                    // 自動填充 team 和 owner 標籤
                    autoPopulateReadonlyTags(newIncident);

                    DB.incidents.unshift(newIncident);

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'Incident',
                        newIncident.id,
                        { summary: newIncident.summary, severity: newIncident.severity, resource: newIncident.resource }
                    );

                    return newIncident;
                }
                if (id === 'import') {
                    return { message: '成功匯入 12 筆事件。' };
                }
                if (id && subId === 'notify') {
                    // 手動觸發通知發送
                    const incident = DB.incidents.find((i: any) => i.id === id);
                    if (!incident) throw { status: 404, message: 'Incident not found' };

                    // 模擬發送通知
                    const timestamp = new Date().toISOString();
                    const notificationRecord = {
                        id: `notif-${uuidv4()}`,
                        timestamp,
                        strategy: 'Manual Notification',
                        channel: 'System',
                        channel_type: 'email' as NotificationChannelType,
                        recipient: 'Admin',
                        status: 'sent' as const,
                        content: `手動觸發通知: ${incident.summary}`
                    };

                    DB.notification_history.unshift(notificationRecord);

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'execute',
                        'Incident',
                        id,
                        { summary: incident.summary }
                    );

                    return {
                        success: true,
                        message: `成功發送通知: ${incident.summary}`,
                        notification_id: notificationRecord.id
                    };
                }
                if (subId === 'actions') {
                    const {
                        action: incidentAction,
                        assignee_name: assigneeName,
                        duration_hours: durationHours,
                        details
                    } = body;
                    const index = DB.incidents.findIndex((i: any) => i.id === id);
                    if (index === -1) throw { status: 404 };

                    const currentUser = DB.users[0];
                    const timestamp = new Date().toISOString();

                    if (incidentAction === 'acknowledge') {
                        const oldStatus = normalizeIncidentStatus(DB.incidents[index].status);
                        DB.incidents[index].status = 'acknowledged';
                        DB.incidents[index].assignee = currentUser.name;
                        DB.incidents[index].history.push({
                            timestamp,
                            user: currentUser.name,
                            action: 'Acknowledged',
                            details: `Status changed from '${formatIncidentStatus(oldStatus)}' to '${formatIncidentStatus('acknowledged')}'.`
                        });
                    }
                    if (incidentAction === 'resolve') {
                        const oldStatus = normalizeIncidentStatus(DB.incidents[index].status);
                        DB.incidents[index].status = 'resolved';
                        DB.incidents[index].history.push({
                            timestamp,
                            user: currentUser.name,
                            action: 'Resolved',
                            details: `Status changed from '${formatIncidentStatus(oldStatus)}' to '${formatIncidentStatus('resolved')}'.`
                        });
                    }
                    if (incidentAction === 'assign') {
                        const oldAssignee = DB.incidents[index].assignee || 'Unassigned';
                        DB.incidents[index].assignee = assigneeName;
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Re-assigned', details: `Assignee changed from ${oldAssignee} to ${assigneeName}.` });
                    }
                    if (incidentAction === 'silence') {
                        const oldStatus = normalizeIncidentStatus(DB.incidents[index].status);
                        DB.incidents[index].status = 'silenced';
                        DB.incidents[index].silenced_by = currentUser.name;
                        DB.incidents[index].history.push({
                            timestamp,
                            user: currentUser.name,
                            action: 'Silenced',
                            details: `Incident silenced for ${durationHours} hour(s). Status changed from '${formatIncidentStatus(oldStatus)}' to '${formatIncidentStatus('silenced')}'.`
                        });
                    }
                    if (incidentAction === 'add_note') {
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Note Added', details });
                    }
                    if (incidentAction === 'delete_note') {
                        const noteTimestamp = details;
                        DB.incidents[index].history = DB.incidents[index].history.filter(
                            (event: any) => !(event.timestamp === noteTimestamp && event.user === currentUser.name)
                        );
                    }
                    // 更新 updated_at 時間戳
                    DB.incidents[index].updated_at = timestamp;
                    return DB.incidents[index];
                }
                break;
            }
            case 'PATCH /incidents': {
                const incidentIndex = DB.incidents.findIndex((i: any) => i.id === id);
                if (incidentIndex === -1) throw { status: 404 };
                const existingIncident = DB.incidents[incidentIndex];
                const currentUser = getCurrentUser();
                const timestamp = new Date().toISOString();
                const normalizedExistingStatus = normalizeIncidentStatus(existingIncident.status);
                const updates: Partial<Incident> = { ...body };

                if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
                    updates.status = normalizeIncidentStatus(updates.status);
                }
                if (Object.prototype.hasOwnProperty.call(updates ?? {}, 'severity') && updates.severity) {
                    updates.severity = validateEnum(
                        (updates.severity as string).toLowerCase(),
                        ['critical', 'warning', 'info'],
                        'severity'
                    );
                }
                if (Object.prototype.hasOwnProperty.call(updates ?? {}, 'impact') && updates.impact) {
                    updates.impact = validateEnum(
                        (updates.impact as string).toLowerCase(),
                        ['high', 'medium', 'low'],
                        'impact'
                    );
                }

                const updatedIncident = {
                    ...existingIncident,
                    ...updates,
                    status: updates.status ?? normalizedExistingStatus,
                    updated_at: timestamp
                } as Incident;

                if (Object.prototype.hasOwnProperty.call(updates, 'status') && updates.status !== normalizedExistingStatus) {
                    updatedIncident.history = [
                        ...existingIncident.history,
                        {
                            timestamp,
                            user: currentUser.name,
                            action: 'Status Updated',
                            details: `Status changed from '${formatIncidentStatus(normalizedExistingStatus)}' to '${formatIncidentStatus(updates.status)}'.`
                        }
                    ];
                } else if (updates && Object.keys(updates).length) {
                    updatedIncident.history = existingIncident.history;
                }

                DB.incidents[incidentIndex] = updatedIncident;

                const auditDetails: Record<string, any> = {
                    summary: updatedIncident.summary,
                    resource: updatedIncident.resource
                };
                if (Object.prototype.hasOwnProperty.call(updates, 'status') && updates.status !== normalizedExistingStatus) {
                    auditDetails.old_status = normalizedExistingStatus;
                    auditDetails.new_status = updates.status;
                }
                if (Object.prototype.hasOwnProperty.call(updates ?? {}, 'assignee') && updates.assignee !== existingIncident.assignee) {
                    auditDetails.old_assignee = existingIncident.assignee;
                    auditDetails.new_assignee = updates.assignee;
                }
                if (Object.prototype.hasOwnProperty.call(updates ?? {}, 'severity') && updates.severity !== existingIncident.severity) {
                    auditDetails.old_severity = existingIncident.severity;
                    auditDetails.new_severity = updates.severity;
                }

                auditLogMiddleware(
                    currentUser.id,
                    'update',
                    'Incident',
                    id,
                    auditDetails
                );

                return updatedIncident;
            }
            case 'DELETE /incidents': {
                const incidentIndex = DB.incidents.findIndex((i: any) => i.id === id);
                if (incidentIndex > -1) {
                    const incident = DB.incidents[incidentIndex];
                    DB.incidents[incidentIndex].deleted_at = new Date().toISOString();
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        'Incident',
                        id,
                        { summary: incident.summary, severity: incident.severity, resource: incident.resource }
                    );
                }
                return {};
            }

            case 'GET /alert-rules': {
                const specialIds = new Set(['templates', 'resource-types', 'exporter-types', 'metrics', 'count']);
                if (id && !specialIds.has(id)) {
                    const rule = DB.alert_rules.find((r: any) => r.id === id);
                    if (!rule) {
                        throw { status: 404, message: '找不到告警規則。' };
                    }
                    return rule;
                }
                // 新增反向查詢端點：GET /alert-rules/{id}/incidents
                if (id && subId === 'incidents') {
                    // 查找與指定告警規則關聯的事件
                    const rule = DB.alert_rules.find((r: any) => r.id === id);
                    if (!rule) throw { status: 404, message: 'Alert rule not found.' };

                    // 查找關聯的事件記錄
                    const incidents = DB.incidents.filter((i: any) =>
                        i.rule_id === id
                    );

                    return incidents;
                }
                if (id === 'templates') {
                    if (subId === 'default') {
                        return DB.alert_rule_default;
                    }
                    return DB.alert_rule_templates;
                }
                if (id === 'resource-types') return DB.resource_types;
                if (id === 'exporter-types') return DB.exporter_types;
                if (id === 'metrics') return DB.metric_metadata;
                if (id === 'count') {
                    let rules = getActive(DB.alert_rules);
                    if (params?.matchers) {
                        const matchers = JSON.parse(params.matchers);
                        matchers.forEach((matcher: any) => {
                            if (matcher.key === 'severity') {
                                rules = rules.filter((r: any) => r.severity === matcher.value);
                            }
                            if (matcher.key === 'target') {
                                rules = rules.filter((r: any) => r.target.includes(matcher.value));
                            }
                        });
                    }
                    return { count: rules.length };
                }
                let rules = getActive(DB.alert_rules);
                if (params) {
                    if (params.keyword) rules = rules.filter((r: any) => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params.severity) rules = rules.filter((r: any) => r.severity === params.severity);
                    if (params.enabled !== undefined) rules = rules.filter((r: any) => String(r.enabled) === params.enabled);
                }
                if (params?.sort_by && params?.sort_order) {
                    rules = sortData(rules, params.sort_by, params.sort_order);
                }
                return paginate(rules, params?.page, params?.page_size);
            }
            case 'POST /alert-rules':
                if (id === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!action || !Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    let updated = 0;
                    if (action === 'delete') {
                        DB.alert_rules.forEach((rule: any) => {
                            if (ids.includes(rule.id)) {
                                rule.deleted_at = new Date().toISOString();
                                updated += 1;
                            }
                        });
                    } else if (action === 'enable') {
                        DB.alert_rules.forEach((rule: any) => {
                            if (ids.includes(rule.id)) {
                                rule.enabled = true;
                                rule.updated_at = new Date().toISOString();
                                updated += 1;
                            }
                        });
                    } else if (action === 'disable') {
                        DB.alert_rules.forEach((rule: any) => {
                            if (ids.includes(rule.id)) {
                                rule.enabled = false;
                                rule.updated_at = new Date().toISOString();
                                updated += 1;
                            }
                        });
                    } else {
                        throw { status: 400, message: `Unsupported batch action: ${action}` };
                    }
                    return { success: true, updated };
                }
                if (id === 'import') {
                    return { message: '成功匯入 8 條告警規則。' };
                }
                if (id && subId === 'trigger') {
                    // 手動觸發告警規則（用於測試）
                    const rule = DB.alert_rules.find((r: any) => r.id === id);
                    if (!rule) throw { status: 404, message: 'Rule not found' };

                    // 模擬觸發告警
                    const timestamp = new Date().toISOString();
                    const newIncidentId = `INC-${uuidv4().slice(0, 8).toUpperCase()}`;
                    const newIncident: Incident = {
                        id: newIncidentId,
                        summary: `手動觸發: ${rule.name}`,
                        resource: 'Test Resource',
                        resource_id: 'res-test',
                        impact: 'low',
                        rule: rule.name,
                        rule_id: rule.id,
                        status: 'new',
                        severity: rule.severity as Incident['severity'],
                        assignee: undefined,
                        tags: {},
                        occurred_at: timestamp,
                        created_at: timestamp,
                        updated_at: timestamp,
                        history: [
                            {
                                timestamp,
                                user: 'System',
                                action: 'Created',
                                details: `Manual trigger of rule "${rule.name}".`,
                            },
                        ],
                    };

                    DB.incidents.unshift(newIncident);

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'Incident',
                        newIncident.id,
                        { summary: newIncident.summary, severity: newIncident.severity, resource: newIncident.resource }
                    );

                    return {
                        success: true,
                        message: `成功觸發告警規則: ${rule.name}`,
                        incident_id: newIncident.id
                    };
                }
                if (subId === 'test') {
                    const rule_id = id;
                    const { payload } = body;
                    const rule = DB.alert_rules.find((r: any) => r.id === rule_id);
                    if (!rule) throw { status: 404, message: 'Rule not found' };
                    const condition = rule.condition_groups?.[0]?.conditions?.[0];
                    if (condition && payload.metric === condition.metric && payload.value > condition.threshold) {
                        return {
                            matches: true,
                            preview: `事件: ${rule.title_template?.replace('{{resource.name}}', payload.resource).replace('{{severity}}', rule.severity)}`
                        };
                    } else {
                        return {
                            matches: false,
                            preview: `條件不匹配: ${condition?.metric} (${payload.value}) 未超過 ${condition?.threshold}`
                        };
                    }
                }

                // 驗證必填欄位
                const { name: alertRuleName, enabled: alertRuleEnabled, severity: alertRuleSeverity } = body;
                if (!alertRuleName || alertRuleEnabled === undefined || !alertRuleSeverity) {
                    throw { status: 400, message: 'Missing required fields for alert rule' };
                }
                if (!['critical', 'warning', 'info'].includes(alertRuleSeverity)) {
                    throw { status: 400, message: 'Invalid severity value' };
                }

                // 驗證外鍵
                if (body.team_id) {
                    const team = DB.teams.find(t => t.id === body.team_id && !t.deleted_at);
                    if (!team) throw { status: 404, message: 'Team not found.' };
                }
                if (body.owner_id) {
                    const owner = DB.users.find(u => u.id === body.owner_id && !u.deleted_at);
                    if (!owner) throw { status: 404, message: 'Owner not found.' };
                }
                const automationScriptId = resolveAutomationScriptId(body.automation);
                if (body.automation?.enabled && automationScriptId) {
                    validateForeignKey(DB.playbooks, automationScriptId, 'Automation playbook');
                }
                validateForeignKeys(DB.resources, body.target_resource_ids, 'resource IDs');

                const timestamp1 = new Date().toISOString();
                const newRule = {
                    ...body,
                    id: `rule-${uuidv4()}`,
                    automation_enabled: !!body.automation?.enabled,
                    created_at: timestamp1,
                    updated_at: timestamp1
                };
                DB.alert_rules.unshift(newRule);
                // 自動填充唯讀標籤
                autoPopulateReadonlyTags(newRule);

                // 紀錄審計日誌
                const currentUser3 = getCurrentUser();
                auditLogMiddleware(
                    currentUser3.id,
                    'create',
                    'AlertRule',
                    newRule.id,
                    { name: newRule.name, severity: newRule.severity }
                );

                return newRule;
            case 'PATCH /alert-rules':
                const ruleIndex = DB.alert_rules.findIndex((r: any) => r.id === id);
                if (ruleIndex === -1) throw { status: 404 };
                const oldRule = { ...DB.alert_rules[ruleIndex] };
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'team_id')) {
                    validateForeignKey(DB.teams, body?.team_id, 'Team');
                }
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'owner_id')) {
                    validateForeignKey(DB.users, body?.owner_id, 'Owner (user)');
                }
                const automationScriptIdForUpdate = resolveAutomationScriptId(body?.automation);
                if (automationScriptIdForUpdate) {
                    validateForeignKey(DB.playbooks, automationScriptIdForUpdate, 'Automation playbook');
                }
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'target_resource_ids')) {
                    if (body?.target_resource_ids !== undefined && !Array.isArray(body?.target_resource_ids)) {
                        throw { status: 400, message: 'target_resource_ids must be an array.' };
                    }
                    validateForeignKeys(DB.resources, body?.target_resource_ids, 'resource IDs');
                }
                // 更新 updated_at 時間戳
                DB.alert_rules[ruleIndex] = { ...DB.alert_rules[ruleIndex], ...body, automation_enabled: !!body.automation?.enabled, updated_at: new Date().toISOString() };

                // 紀錄審計日誌
                const currentUser2 = getCurrentUser();
                auditLogMiddleware(
                    currentUser2.id,
                    'update',
                    'AlertRule',
                    id,
                    {
                        old_name: oldRule.name,
                        new_name: body.name,
                        old_severity: oldRule.severity,
                        new_severity: body.severity
                    }
                );

                return DB.alert_rules[ruleIndex];
            case 'DELETE /alert-rules': {
                const ruleIndex = DB.alert_rules.findIndex((r: any) => r.id === id);
                if (ruleIndex > -1) {
                    const rule = DB.alert_rules[ruleIndex];
                    DB.alert_rules[ruleIndex].deleted_at = new Date().toISOString();

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        'AlertRule',
                        id,
                        { name: rule.name, severity: rule.severity }
                    );
                }
                return {};
            }

            case 'GET /silence-rules': {
                if (id === 'templates') return DB.silence_rule_templates;
                let rules = getActive(DB.silence_rules);
                if (params) {
                    if (params.keyword) rules = rules.filter((r: any) => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params.type) rules = rules.filter((r: any) => r.type === params.type);
                    if (params.enabled !== undefined) rules = rules.filter((r: any) => String(r.enabled) === params.enabled);
                }
                if (params?.sort_by && params?.sort_order) {
                    rules = sortData(rules, params.sort_by, params.sort_order);
                }
                return paginate(rules, params?.page, params?.page_size);
            }
            case 'GET /system': {
                if (id === 'config') {
                    return DB.system_config;
                }
                break;
            }
            case 'POST /silence-rules':
                if (id === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    const currentUser = getCurrentUser();
                    ids.forEach((rule_id: string) => {
                        const ruleIndex = DB.silence_rules.findIndex((rule: any) => rule.id === rule_id);
                        if (ruleIndex === -1) return;
                        const rule = DB.silence_rules[ruleIndex];
                        if (action === 'delete') {
                            rule.deleted_at = new Date().toISOString();
                            auditLogMiddleware(
                                currentUser.id,
                                'delete',
                                'SilenceRule',
                                rule_id,
                                { name: rule.name, type: rule.type, enabled: rule.enabled }
                            );
                        } else if (action === 'enable') {
                            const oldEnabled = rule.enabled;
                            DB.silence_rules[ruleIndex].enabled = true;
                            DB.silence_rules[ruleIndex].updated_at = new Date().toISOString();
                            if (oldEnabled !== true) {
                                auditLogMiddleware(
                                    currentUser.id,
                                    'update',
                                    'SilenceRule',
                                    rule_id,
                                    { name: rule.name, old_enabled: oldEnabled, new_enabled: true }
                                );
                            }
                        } else if (action === 'disable') {
                            const oldEnabled = rule.enabled;
                            DB.silence_rules[ruleIndex].enabled = false;
                            DB.silence_rules[ruleIndex].updated_at = new Date().toISOString();
                            if (oldEnabled !== false) {
                                auditLogMiddleware(
                                    currentUser.id,
                                    'update',
                                    'SilenceRule',
                                    rule_id,
                                    { name: rule.name, old_enabled: oldEnabled, new_enabled: false }
                                );
                            }
                        }
                    });
                    return { success: true };
                }
                if (id === 'import') {
                    return { message: '成功匯入 3 條靜音規則。' };
                }

                // 驗證必填欄位
                const { name: silenceRuleName, enabled: silenceRuleEnabled, type: silenceRuleType, matchers: silenceRuleMatchers, schedule: silenceRuleSchedule } = body;
                if (!silenceRuleName || silenceRuleEnabled === undefined || !silenceRuleType || !silenceRuleMatchers || !silenceRuleSchedule) {
                    throw { status: 400, message: 'Missing required fields for silence rule' };
                }
                if (!['single', 'repeat', 'condition'].includes(silenceRuleType)) {
                    throw { status: 400, message: 'Invalid type value' };
                }

                const timestamp2 = new Date().toISOString();
                const newSilenceRule = {
                    ...body,
                    id: `sil-${uuidv4()}`,
                    created_at: timestamp2,
                    updated_at: timestamp2
                };
                DB.silence_rules.unshift(newSilenceRule);
                // Audit log for silence rule creation
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'create',
                    'SilenceRule',
                    newSilenceRule.id,
                    { name: newSilenceRule.name, type: newSilenceRule.type, enabled: newSilenceRule.enabled }
                );
                return newSilenceRule;
            case 'PATCH /silence-rules':
                const silenceIndex = DB.silence_rules.findIndex((r: any) => r.id === id);
                if (silenceIndex === -1) throw { status: 404 };
                const existingSilenceRule = DB.silence_rules[silenceIndex];
                // 更新 updated_at 時間戳
                const updatedSilenceRule = { ...existingSilenceRule, ...body, updated_at: new Date().toISOString() };
                DB.silence_rules[silenceIndex] = updatedSilenceRule;
                // Audit log for silence rule update
                const currentUser4 = getCurrentUser();
                auditLogMiddleware(
                    currentUser4.id,
                    'update',
                    'SilenceRule',
                    id,
                    {
                        old_name: existingSilenceRule.name,
                        new_name: updatedSilenceRule.name,
                        old_type: existingSilenceRule.type,
                        new_type: updatedSilenceRule.type,
                        old_enabled: existingSilenceRule.enabled,
                        new_enabled: updatedSilenceRule.enabled
                    }
                );
                return updatedSilenceRule;
            case 'DELETE /silence-rules': {
                const ruleIndex = DB.silence_rules.findIndex((r: any) => r.id === id);
                if (ruleIndex > -1) {
                    const rule = DB.silence_rules[ruleIndex];
                    DB.silence_rules[ruleIndex].deleted_at = new Date().toISOString();
                    // Audit log for silence rule deletion
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        'SilenceRule',
                        id,
                        { name: rule.name, type: rule.type, enabled: rule.enabled }
                    );
                }
                return {};
            }

            // Resources
            case 'GET /resources': {
                DB.resources.forEach(normalizeResourceEntity);
                if (id === 'datasources' && subId && action === 'connection-tests') {
                    const datasource = DB.datasources.find((d: any) => d.id === subId && !d.deleted_at);
                    if (!datasource) {
                        throw { status: 404, message: 'Datasource not found.' };
                    }
                    const logs = DB.datasource_connection_tests.filter((log: DatasourceConnectionTestLog) => log.datasource_id === subId);
                    return paginate(logs, params?.page, params?.page_size);
                }
                if (id === 'datasources') {
                    let datasources = getActive(DB.datasources);
                    if (params?.sort_by && params?.sort_order) {
                        datasources = sortData(datasources, params.sort_by, params.sort_order);
                    }
                    return paginate(datasources, params?.page, params?.page_size);
                }
                if (id === 'discovery-jobs') {
                    if (subId && action === 'results') {
                        return DB.discovered_resources;
                    }
                    let jobs = getActive(DB.discovery_jobs);
                    if (params?.sort_by && params?.sort_order) {
                        jobs = sortData(jobs, params.sort_by, params.sort_order);
                    }
                    return paginate(jobs, params?.page, params?.page_size);
                }
                if (id === 'overview') {
                    return DB.resource_overview_data;
                }
                if (id === 'count') {
                    const query = params.query || '';
                    if (!query) return { count: DB.resources.length };
                    const randomCount = Math.floor(Math.random() * (DB.resources.length / 2)) + 5;
                    return { count: randomCount };
                }
                if (id === 'topology') {
                    if (subId === 'options') return DB.all_options.topology;
                    return { nodes: DB.resources, links: DB.resource_links };
                }
                if (id && subId === 'metrics') {
                    const generateMetricData = (base: number, variance: number): [string, number][] => Array.from({ length: 30 }, (_, i) => [new Date(Date.now() - (29 - i) * 60000).toISOString(), Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance))]);
                    return { cpu: generateMetricData(50, 20), memory: generateMetricData(60, 15) };
                }
                // 新增反向查詢端點：GET /resources/{id}/alert-rules
                if (id && subId === 'alert-rules') {
                    // 查找與指定資源關聯的告警規則
                    const resource = DB.resources.find((r: any) => r.id === id);
                    if (!resource) throw { status: 404, message: 'Resource not found.' };

                    // 查找關聯的告警規則（通過target_resource_ids或target字段）
                    const rules = DB.alert_rules.filter((r: any) =>
                        r.target_resource_ids?.includes(id) ||
                        r.target.includes(resource.name) ||
                        r.target.includes(id)
                    );

                    return rules;
                }
                if (id) {
                    const resourceItem = DB.resources.find((r: any) => r.id === id);
                    if (!resourceItem) throw { status: 404 };
                    return normalizeResourceEntity(resourceItem);
                }
                let resources = getActive(DB.resources);
                if (params?.bookmarked) resources = resources.slice(0, 4);
                if (params?.sort_by && params?.sort_order) {
                    resources = sortData(resources, params.sort_by, params.sort_order);
                }
                resources.forEach(normalizeResourceEntity);
                return paginate(resources, params?.page, params?.page_size);
            }
            case 'GET /resource-links': {
                let links = getActive(DB.resource_links);
                if (params?.source_resource_id) {
                    links = links.filter((link: any) => link.source_resource_id === params.source_resource_id);
                }
                if (params?.target_resource_id) {
                    links = links.filter((link: any) => link.target_resource_id === params.target_resource_id);
                }
                if (params?.link_type) {
                    links = links.filter((link: any) => link.link_type === params.link_type);
                }
                if (params?.sort_by && params?.sort_order) {
                    links = sortData(links, params.sort_by, params.sort_order);
                }
                return paginate(links, params?.page, params?.page_size);
            }
            case 'POST /resources': {
                if (id === 'datasources' && subId === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!action || !Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    let updated = 0;
                    const currentUser = getCurrentUser();
                    if (action === 'delete') {
                        DB.datasources.forEach((ds: any) => {
                            if (ids.includes(ds.id)) {
                                ds.deleted_at = new Date().toISOString();
                                updated += 1;
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'Datasource',
                                    ds.id,
                                    { name: ds.name, type: ds.type, status: ds.status }
                                );
                            }
                        });
                    } else {
                        throw { status: 400, message: `Unsupported batch action: ${action}` };
                    }
                    return { success: true, updated };
                }
                if (id === 'discovery-jobs' && subId === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!action || !Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    let updated = 0;
                    const currentUser = getCurrentUser();
                    if (action === 'delete') {
                        DB.discovery_jobs.forEach((job: any) => {
                            if (ids.includes(job.id)) {
                                job.deleted_at = new Date().toISOString();
                                updated += 1;
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'DiscoveryJob',
                                    job.id,
                                    { name: job.name, kind: job.kind }
                                );
                            }
                        });
                    } else {
                        throw { status: 400, message: `Unsupported batch action: ${action}` };
                    }
                    return { success: true, updated };
                }
                if (id === 'batch-tags') {
                    const { resource_ids = [], tags = [] } = body || {};
                    if (!Array.isArray(resource_ids) || !Array.isArray(tags)) {
                        throw { status: 400, message: 'Invalid payload for batch tagging.' };
                    }
                    const cleanedTags = tags.filter((tag: any) => tag?.key && tag?.value);
                    resource_ids.forEach((resource_id: string) => {
                        const resourceIndex = DB.resources.findIndex((resource: any) => resource.id === resource_id);
                        if (resourceIndex > -1) {
                            cleanedTags.forEach((tag: any) => {
                                const duplicate = DB.resources[resourceIndex].tags?.some((existing: any) => existing.key === tag.key && existing.value === tag.value);
                                if (!duplicate) {
                                    if (!DB.resources[resourceIndex].tags) DB.resources[resourceIndex].tags = [];
                                    DB.resources[resourceIndex].tags.push({ id: `tag-${uuidv4()}`, key: tag.key, value: tag.value });
                                }
                            });
                        }
                        const discoveryIndex = DB.discovered_resources.findIndex((res: any) => res.id === resource_id);
                        if (discoveryIndex > -1) {
                            cleanedTags.forEach((tag: any) => {
                                const duplicate = DB.discovered_resources[discoveryIndex].tags.some((existing: any) => existing.key === tag.key && existing.value === tag.value);
                                if (!duplicate) {
                                    DB.discovered_resources[discoveryIndex].tags.push({ id: `tag-${uuidv4()}`, key: tag.key, value: tag.value });
                                }
                            });
                        }
                    });
                    return { success: true, updated: resource_ids.length };
                }
                if (id === 'datasources') {
                    if (subId === 'test' && !action) {
                        const {
                            id: payloadId,
                            name,
                            type,
                            url,
                            auth_method,
                            tags
                        } = body || {};
                        if (!url || typeof url !== 'string' || !url.trim()) {
                            throw { status: 400, message: '缺少測試連線所需的 URL。' };
                        }
                        if (!type || typeof type !== 'string') {
                            throw { status: 400, message: '缺少測試連線所需的類型。' };
                        }
                        if (!auth_method || typeof auth_method !== 'string') {
                            throw { status: 400, message: '缺少測試連線所需的驗證方式。' };
                        }

                        const datasourceOptions = DB.all_options?.datasources;
                        const allowedTypes = Array.isArray(datasourceOptions?.types)
                            ? datasourceOptions.types.map((option: any) => option.value)
                            : ['victoriametrics', 'grafana', 'elasticsearch', 'prometheus', 'custom'];
                        const allowedAuthMethods = Array.isArray(datasourceOptions?.auth_methods)
                            ? datasourceOptions.auth_methods.map((option: any) => option.value)
                            : ['token', 'basic_auth', 'keycloak_integration', 'none'];

                        validateEnum(type, allowedTypes, 'datasource type');
                        validateEnum(auth_method, allowedAuthMethods, 'auth_method');

                        if (tags && !Array.isArray(tags)) {
                            throw { status: 400, message: 'tags 必須為陣列。' };
                        }

                        const latency_ms = Math.floor(50 + Math.random() * 200);
                        const success = Math.random() > 0.2;
                        const status: ConnectionStatus = success ? 'ok' : 'error';
                        const currentUser = getCurrentUser();
                        const tested_at = new Date().toISOString();
                        const result = success ? 'success' : 'failed';
                        if (payloadId) {
                            const idx = DB.datasources.findIndex((d: any) => d.id === payloadId);
                            if (idx > -1) {
                                DB.datasources[idx].status = status;
                                const logEntry: DatasourceConnectionTestLog = {
                                    id: `ds-test-${uuidv4()}`,
                                    datasource_id: payloadId,
                                    status,
                                    result,
                                    latency_ms,
                                    message: success
                                        ? `成功連線至 ${DB.datasources[idx].name || payloadId}。`
                                        : `無法連線至 ${DB.datasources[idx].name || payloadId}，請檢查設定。`,
                                    tested_by: currentUser.id,
                                    tested_at
                                };
                                DB.datasource_connection_tests.unshift(logEntry);
                            }
                        }
                        const displayName = name || url;
                        const message = success
                            ? `成功連線至 ${displayName}。`
                            : `無法連線至 ${displayName}，請檢查設定。`;
                        return { success, status, result, latency_ms, message, tested_at, tested_by: currentUser.id };
                    }
                    if (subId && action === 'test') {
                        const dsId = subId;
                        const index = DB.datasources.findIndex((d: any) => d.id === dsId);
                        if (index === -1) throw { status: 404, message: '找不到指定的 Datasource。' };
                        const latency_ms = Math.floor(50 + Math.random() * 200);
                        const success = Math.random() > 0.2;
                        const status: ConnectionStatus = success ? 'ok' : 'error';
                        DB.datasources[index].status = status;
                        const dsName = DB.datasources[index].name || '資料來源';
                        const message = success
                            ? `成功連線至 ${dsName}。`
                            : `無法連線至 ${dsName}，請檢查設定。`;
                        const currentUser = getCurrentUser();
                        const tested_at = new Date().toISOString();
                        const logEntry: DatasourceConnectionTestLog = {
                            id: `ds-test-${uuidv4()}`,
                            datasource_id: dsId,
                            status,
                            result: success ? 'success' : 'failed',
                            latency_ms,
                            message,
                            tested_by: currentUser.id,
                            tested_at
                        };
                        DB.datasource_connection_tests.unshift(logEntry);
                        return { success, status, result: logEntry.result, latency_ms, message, tested_at, tested_by: currentUser.id };
                    }

                    // 驗證必填欄位
                    const { name, type, url, auth_method } = body;
                    if (!name || !type || !url || !auth_method) {
                        throw { status: 400, message: 'Missing required fields: name, type, url, auth_method' };
                    }

                    const timestamp = new Date().toISOString();
                    const newDs = { ...body, id: `ds-${uuidv4()}`, created_at: timestamp, updated_at: timestamp, status: 'pending' };
                    DB.datasources.unshift(newDs);
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'Datasource',
                        newDs.id,
                        { name: newDs.name, type: newDs.type, status: newDs.status }
                    );
                    return newDs;
                }
                if (id === 'discovery-jobs') {
                    if (subId === 'test' && !action) {
                        const success = Math.random() > 0.2;
                        const discovered_count = success ? Math.floor(Math.random() * 20) + 1 : 0;
                        const warnings = [] as string[];
                        if (success && Math.random() > 0.7) {
                            warnings.push('部分節點需要額外憑證才能完成匯入。');
                        }
                        const message = success
                            ? '測試掃描成功。'
                            : '測試掃描失敗，請檢查目標配置。';
                        return { success, discovered_count, message, warnings };
                    }
                    if (subId && action === 'run') {
                        const job_id = subId;
                        const jobIndex = DB.discovery_jobs.findIndex((j: any) => j.id === job_id);
                        if (jobIndex === -1) throw { status: 404 };
                        DB.discovery_jobs[jobIndex].status = 'running';
                        setTimeout(() => {
                            const idx = DB.discovery_jobs.findIndex((j: any) => j.id === job_id);
                            if (idx > -1) {
                                DB.discovery_jobs[idx].status = Math.random() > 0.2 ? 'success' : 'failed';
                                DB.discovery_jobs[idx].last_run_at = new Date().toISOString();
                            }
                        }, 3000);
                        return { message: 'Run triggered.' };
                    }

                    // 驗證必填欄位
                    const { name, kind, schedule } = body;
                    if (!name || !kind || !schedule) {
                        throw { status: 400, message: 'Missing required fields: name, kind, schedule' };
                    }

                    const timestamp = new Date().toISOString();
                    const newJob: DiscoveryJob = {
                        ...body,
                        id: `dj-${uuidv4()}`,
                        last_run_at: 'N/A',
                        status: 'pending',
                        kind: body?.kind || 'k8s',
                        target_config: body?.target_config || {},
                        exporter_binding: body?.exporter_binding || { template_id: 'node_exporter' },
                        edge_gateway: body?.edge_gateway || { enabled: false },
                        tags: body?.tags || [],
                        created_at: timestamp,
                        updated_at: timestamp,
                    };
                    DB.discovery_jobs.unshift(newJob);
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'DiscoveryJob',
                        newJob.id,
                        { name: newJob.name, kind: newJob.kind, schedule: newJob.schedule }
                    );
                    return newJob;
                }
                if (id === 'import-discovered') {
                    const { discovered_resource_ids, job_id, deploy_agent } = body;
                    (discovered_resource_ids || []).forEach((res_id: string) => {
                        const resIndex = DB.discovered_resources.findIndex((r: any) => r.id === res_id);
                        if (resIndex > -1) {
                            DB.discovered_resources[resIndex].status = 'imported';
                            const newResource = {
                                id: `res-${uuidv4()}`,
                                name: DB.discovered_resources[resIndex].name,
                                status: 'healthy',
                                type: DB.discovered_resources[resIndex].type,
                                provider: 'Discovered',
                                region: 'N/A',
                                owner: 'Unassigned',
                                last_check_in_at: new Date().toISOString(),
                                discovered_by_job_id: job_id,
                                monitoring_agent: deploy_agent ? 'node_exporter' : undefined
                            };
                            DB.resources.unshift(newResource);
                        }
                    });
                    return { message: 'Import successful' };
                }
                if (id && subId === 'silence') {
                    const resourceToSilence = DB.resources.find((r: any) => r.id === id);
                    if (!resourceToSilence) throw { status: 404 };
                    return { message: `Resource ${resourceToSilence.name} silenced successfully for ${body.duration}.` };
                }
                if (id === 'batch-actions') {
                    const { action: batchAction, ids } = body;
                    if (batchAction === 'delete') DB.resources.forEach((r: any) => { if (ids.includes(r.id)) r.deleted_at = new Date().toISOString(); });
                    return { success: true };
                }
                if (id === 'import') {
                    return { message: '成功匯入 15 筆資源。' };
                } else {
                    // 驗證外鍵
                    if (body.team_id) {
                        const team = DB.teams.find(t => t.id === body.team_id && !t.deleted_at);
                        if (!team) throw { status: 404, message: 'Team not found.' };
                    }
                    if (body.owner_id) {
                        const owner = DB.users.find(u => u.id === body.owner_id && !u.deleted_at);
                        if (!owner) throw { status: 404, message: 'Owner not found.' };
                    }
                    if (body.datasource_id) {
                        const datasource = DB.datasources.find(d => d.id === body.datasource_id && !d.deleted_at);
                        if (!datasource) throw { status: 404, message: 'Datasource not found.' };
                    }

                    // 驗證枚舉值
                    if (body.status) {
                        validateEnum(body.status, ['healthy', 'warning', 'critical', 'offline', 'unknown'], 'status');
                    }

                    const timestamp = new Date().toISOString();
                    const newResource = {
                        ...body,
                        id: `res-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    populateOwnerName(newResource);
                    DB.resources.unshift(newResource);
                    // 自動填充唯讀標籤
                    autoPopulateReadonlyTags(newResource, { asArray: true });

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'Resource',
                        newResource.id,
                        { name: newResource.name, type: newResource.type }
                    );

                    return newResource;
                }
            }
            case 'POST /resource-links': {
                const { source_resource_id, target_resource_id, link_type } = body || {};
                if (!source_resource_id || !target_resource_id || !link_type) {
                    throw { status: 400, message: 'Missing required fields: source_resource_id, target_resource_id, link_type' };
                }
                validateForeignKey(DB.resources, source_resource_id, 'Source resource');
                validateForeignKey(DB.resources, target_resource_id, 'Target resource');
                const timestamp = new Date().toISOString();
                const newLink: ResourceLink = {
                    ...body,
                    id: `rl-${uuidv4()}`,
                    created_at: timestamp,
                    updated_at: timestamp
                };
                DB.resource_links.unshift(newLink);
                // Audit log for resource link creation
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'create',
                    'ResourceLink',
                    newLink.id,
                    { source_resource_id: newLink.source_resource_id, target_resource_id: newLink.target_resource_id, link_type: newLink.link_type }
                );
                return newLink;
            }
            case 'PATCH /resources': {
                if (id === 'datasources') {
                    const dsId = subId;
                    const index = DB.datasources.findIndex((d: any) => d.id === dsId);
                    if (index === -1) throw { status: 404 };
                    const existing = DB.datasources[index];
                    // 更新 updated_at 時間戳
                    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
                    DB.datasources[index] = updated;
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'update',
                        'Datasource',
                        dsId,
                        {
                            old_name: existing.name,
                            new_name: updated.name,
                            old_type: existing.type,
                            new_type: updated.type,
                            old_status: existing.status,
                            new_status: updated.status
                        }
                    );
                    return updated;
                }
                if (id === 'discovery-jobs') {
                    const job_id = subId;
                    const index = DB.discovery_jobs.findIndex((j: any) => j.id === job_id);
                    if (index === -1) throw { status: 404 };
                    const existingJob = DB.discovery_jobs[index];
                    // 更新 updated_at 時間戳
                    const updatedJob = {
                        ...existingJob,
                        ...body,
                        target_config: body?.target_config || existingJob.target_config,
                        exporter_binding: body?.exporter_binding || existingJob.exporter_binding,
                        edge_gateway: body?.edge_gateway || existingJob.edge_gateway,
                        tags: Array.isArray(body?.tags) ? body.tags : existingJob.tags,
                        updated_at: new Date().toISOString(),
                    };
                    DB.discovery_jobs[index] = updatedJob;
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'update',
                        'DiscoveryJob',
                        job_id,
                        {
                            name: updatedJob.name,
                            old_kind: existingJob.kind,
                            new_kind: updatedJob.kind,
                            old_schedule: existingJob.schedule,
                            new_schedule: updatedJob.schedule
                        }
                    );
                    return updatedJob;
                }
                const resIndex = DB.resources.findIndex((r: any) => r.id === id);
                if (resIndex === -1) throw { status: 404 };
                const oldResource = { ...DB.resources[resIndex] };
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'team_id')) {
                    validateForeignKey(DB.teams, body?.team_id, 'Team');
                }
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'owner_id')) {
                    validateForeignKey(DB.users, body?.owner_id, 'Owner (user)');
                }
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'datasource_id')) {
                    validateForeignKey(DB.datasources, body?.datasource_id, 'Datasource');
                }
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'status') && body?.status) {
                    validateEnum(body.status, ['healthy', 'warning', 'critical', 'offline', 'unknown'], 'status');
                }
                // 更新 updated_at 時間戳
                DB.resources[resIndex] = { ...DB.resources[resIndex], ...body, updated_at: new Date().toISOString() };
                populateOwnerName(DB.resources[resIndex]);
                autoPopulateReadonlyTags(DB.resources[resIndex], { asArray: true });

                // 紀錄審計日誌
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'update',
                    'Resource',
                    id,
                    {
                        old_name: oldResource.name,
                        new_name: body.name,
                        old_type: oldResource.type,
                        new_type: body.type
                    }
                );

                return DB.resources[resIndex];
            }
            case 'PATCH /resource-links': {
                const linkIndex = DB.resource_links.findIndex((link: any) => link.id === id);
                if (linkIndex === -1) throw { status: 404 };
                const existingLink = DB.resource_links[linkIndex];
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'source_resource_id')) {
                    validateForeignKey(DB.resources, body?.source_resource_id, 'Source resource');
                }
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'target_resource_id')) {
                    validateForeignKey(DB.resources, body?.target_resource_id, 'Target resource');
                }
                // 更新 updated_at 時間戳
                DB.resource_links[linkIndex] = { ...existingLink, ...body, updated_at: new Date().toISOString() };
                // Audit log for resource link update
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'update',
                    'ResourceLink',
                    id,
                    {
                        old_link_type: existingLink.link_type,
                        new_link_type: body.link_type || existingLink.link_type,
                        source_resource_id: existingLink.source_resource_id,
                        target_resource_id: existingLink.target_resource_id
                    }
                );
                return DB.resource_links[linkIndex];
            }
            case 'DELETE /resources': {
                if (id === 'datasources') {
                    const dsId = subId;
                    const index = DB.datasources.findIndex((d: any) => d.id === dsId);
                    if (index > -1) {
                        const datasource = DB.datasources[index];
                        (DB.datasources[index] as any).deleted_at = new Date().toISOString();
                        const currentUser = getCurrentUser();
                        auditLogMiddleware(
                            currentUser.id,
                            'delete',
                            'Datasource',
                            dsId,
                            { name: datasource.name, type: datasource.type, status: datasource.status }
                        );
                    }
                    return {};
                }
                if (id === 'discovery-jobs') {
                    const job_id = subId;
                    const index = DB.discovery_jobs.findIndex((j: any) => j.id === job_id);
                    if (index > -1) {
                        const job = DB.discovery_jobs[index];
                        (DB.discovery_jobs[index] as any).deleted_at = new Date().toISOString();
                        const currentUser = getCurrentUser();
                        auditLogMiddleware(
                            currentUser.id,
                            'delete',
                            'DiscoveryJob',
                            job_id,
                            { name: job.name, kind: job.kind }
                        );
                    }
                    return {};
                }
                const delResIndex = DB.resources.findIndex((r: any) => r.id === id);
                if (delResIndex > -1) {
                    const resource = DB.resources[delResIndex];
                    DB.resources[delResIndex].deleted_at = new Date().toISOString();

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        'Resource',
                        id,
                        { name: resource.name, type: resource.type }
                    );
                }
                return {};
            }
            case 'DELETE /resource-links': {
                const linkIndex = DB.resource_links.findIndex((link: any) => link.id === id);
                if (linkIndex > -1) {
                    const link = DB.resource_links[linkIndex];
                    DB.resource_links[linkIndex].deleted_at = new Date().toISOString();
                    // Audit log for resource link deletion
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        'ResourceLink',
                        id,
                        {
                            source_resource_id: link.source_resource_id,
                            target_resource_id: link.target_resource_id,
                            link_type: link.link_type
                        }
                    );
                }
                return {};
            }

            case 'GET /resource-groups': {
                let groups = getActive(DB.resource_groups);
                if (params?.sort_by && params?.sort_order) {
                    groups = sortData(groups, params.sort_by, params.sort_order);
                }
                return paginate(groups, params?.page, params?.page_size);
            }
            case 'POST /resource-groups':
                if (id === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!action || !Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    let updated = 0;
                    const currentUser = getCurrentUser();
                    if (action === 'delete') {
                        DB.resource_groups.forEach((group: any) => {
                            if (ids.includes(group.id)) {
                                group.deleted_at = new Date().toISOString();
                                updated += 1;
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'ResourceGroup',
                                    group.id,
                                    {
                                        name: group.name,
                                        type: group.type,
                                        owner_team: group.owner_team,
                                        member_count: Array.isArray(group.member_ids) ? group.member_ids.length : 0
                                    }
                                );
                            }
                        });
                    } else {
                        throw { status: 400, message: `Unsupported batch action: ${action}` };
                    }
                    return { success: true, updated };
                }
                // 驗證必填欄位
                const { name: resourceGroupName, owner_team, member_ids } = body;
                if (!resourceGroupName || !owner_team || !Array.isArray(member_ids)) {
                    throw { status: 400, message: 'Missing required fields: name, owner_team, member_ids' };
                }
                validateForeignKeys(DB.resources, member_ids, 'resource IDs');

                const timestamp = new Date().toISOString();
                const newGroup = {
                    ...body,
                    id: `rg-${uuidv4()}`,
                    created_at: timestamp,
                    updated_at: timestamp
                };
                DB.resource_groups.unshift(newGroup);
                // Audit log for resource group creation
                const currentUserForResourceGroupCreate = getCurrentUser();
                auditLogMiddleware(
                    currentUserForResourceGroupCreate.id,
                    'create',
                    'ResourceGroup',
                    newGroup.id,
                    {
                        name: newGroup.name,
                        type: newGroup.type,
                        owner_team: newGroup.owner_team,
                        member_count: Array.isArray(newGroup.member_ids) ? newGroup.member_ids.length : 0
                    }
                );
                return newGroup;
            case 'PUT /resource-groups':
                const groupIndex = DB.resource_groups.findIndex((g: any) => g.id === id);
                if (groupIndex === -1) throw { status: 404 };
                const existingGroup = DB.resource_groups[groupIndex];
                if (Object.prototype.hasOwnProperty.call(body ?? {}, 'member_ids')) {
                    if (body?.member_ids !== undefined && !Array.isArray(body?.member_ids)) {
                        throw { status: 400, message: 'member_ids must be an array.' };
                    }
                    validateForeignKeys(DB.resources, body?.member_ids, 'resource IDs');
                }
                // 更新 updated_at 時間戳
                const updatedGroup = { ...existingGroup, ...body, updated_at: new Date().toISOString() };
                DB.resource_groups[groupIndex] = updatedGroup;
                // Audit log for resource group update
                const currentUserForResourceGroupUpdate = getCurrentUser();
                auditLogMiddleware(
                    currentUserForResourceGroupUpdate.id,
                    'update',
                    'ResourceGroup',
                    id,
                    {
                        old_name: existingGroup.name,
                        new_name: updatedGroup.name,
                        old_type: existingGroup.type,
                        new_type: updatedGroup.type,
                        old_member_count: Array.isArray(existingGroup.member_ids) ? existingGroup.member_ids.length : 0,
                        new_member_count: Array.isArray(updatedGroup.member_ids) ? updatedGroup.member_ids.length : 0,
                        old_owner_team: existingGroup.owner_team,
                        new_owner_team: updatedGroup.owner_team
                    }
                );
                return updatedGroup;
            case 'DELETE /resource-groups':
                const delGroupIndex = DB.resource_groups.findIndex((g: any) => g.id === id);
                if (delGroupIndex > -1) {
                    const group = DB.resource_groups[delGroupIndex];
                    DB.resource_groups[delGroupIndex].deleted_at = new Date().toISOString();
                    // Audit log for resource group deletion
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        'ResourceGroup',
                        id,
                        {
                            name: group.name,
                            type: group.type,
                            owner_team: group.owner_team,
                            member_count: Array.isArray(group.member_ids) ? group.member_ids.length : 0
                        }
                    );
                }
                return {};

            // Automation
            case 'GET /automation': {
                if (id === 'scripts') {
                    let scripts = getActive(DB.playbooks);
                    if (params?.sort_by && params?.sort_order) {
                        scripts = sortData(scripts, params.sort_by, params.sort_order);
                    }
                    return paginate(scripts, params?.page, params?.page_size);
                }
                if (id === 'triggers') {
                    let triggers = getActive(DB.automation_triggers);
                    if (params?.keyword) {
                        triggers = triggers.filter((t: any) => t.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    }
                    if (params?.sort_by && params?.sort_order) {
                        triggers = sortData(triggers, params.sort_by, params.sort_order);
                    }
                    return paginate(triggers, params?.page, params?.page_size);
                }
                if (id === 'executions') {
                    let executions = getActive(DB.automation_executions);
                    if (params) {
                        if (params.playbook_id) executions = executions.filter((e: any) => e.script_id === params.playbook_id);
                        if (params.status) executions = executions.filter((e: any) => e.status === params.status);
                    }
                    if (params?.sort_by && params?.sort_order) {
                        executions = sortData(executions, params.sort_by, params.sort_order);
                    }
                    return paginate(executions, params?.page, params?.page_size);
                }
                break;
            }
            case 'POST /automation': {
                if (id === 'scripts') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids = [] } = body || {};
                        if (!batchAction || !Array.isArray(ids)) {
                            throw { status: 400, message: 'Invalid batch action payload for automation scripts.' };
                        }
                        let updated = 0;
                        const currentUser = getCurrentUser();
                        if (batchAction === 'delete') {
                            DB.playbooks.forEach((script: any) => {
                                if (ids.includes(script.id)) {
                                    script.deleted_at = new Date().toISOString();
                                    updated += 1;
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'delete',
                                        'AutomationPlaybook',
                                        script.id,
                                        { name: script.name, type: script.type }
                                    );
                                }
                            });
                        } else {
                            throw { status: 400, message: `Unsupported batch action: ${batchAction}` };
                        }
                        return { success: true, updated };
                    }
                    if (action === 'execute') {
                        const script_id = subId;
                        if (!script_id) {
                            throw { status: 400, message: 'Script ID is required to execute an automation playbook.' };
                        }
                        const script = DB.playbooks.find((p: any) => p.id === script_id);
                        if (!script) throw { status: 404, message: 'Automation playbook not found.' };
                        const newExec = {
                            id: `exec-${uuidv4()}`,
                            script_id: script_id,
                            script_name: script.name,
                            status: 'running',
                            trigger_source: 'manual',
                            triggered_by: 'Admin User',
                            start_time: new Date().toISOString(),
                            parameters: body?.parameters ?? {},
                            logs: { stdout: 'Execution started...', stderr: '' }
                        };
                        DB.automation_executions.unshift(newExec);
                        setTimeout(() => {
                            const index = DB.automation_executions.findIndex((e: any) => e.id === newExec.id);
                            if (index > -1) {
                                DB.automation_executions[index].status = 'success';
                                DB.automation_executions[index].end_time = new Date().toISOString();
                                DB.automation_executions[index].duration_ms = 3000;
                                DB.automation_executions[index].logs.stdout += '\nExecution finished.';
                            }
                        }, 3000);
                        return newExec;
                    }

                    // 驗證必填欄位
                    const { name, type, content } = body;
                    if (!name || !type || !content) {
                        throw { status: 400, message: 'Missing required fields: name, type, content' };
                    }
                    if (!['shell', 'python', 'ansible', 'terraform'].includes(type)) {
                        throw { status: 400, message: 'Invalid playbook type' };
                    }

                    const timestamp = new Date().toISOString();
                    const newScript = {
                        ...body,
                        id: `play-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.playbooks.unshift(newScript);
                    // Audit log for automation playbook creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'AutomationPlaybook',
                        newScript.id,
                        { name: newScript.name, type: newScript.type }
                    );
                    return newScript;
                }
                if (id === 'executions' && action === 'retry') {
                    const executionId = subId;
                    if (!executionId) {
                        throw { status: 400, message: 'Execution ID is required to retry automation.' };
                    }
                    const executionIndex = DB.automation_executions.findIndex((e: any) => e.id === executionId);
                    if (executionIndex === -1) throw { status: 404, message: 'Automation execution not found.' };
                    const originalExec = DB.automation_executions[executionIndex];
                    const newExec = {
                        ...originalExec,
                        id: `exec-${uuidv4()}`,
                        status: 'pending',
                        start_time: new Date().toISOString(),
                        end_time: undefined,
                        duration_ms: undefined
                    };
                    DB.automation_executions.unshift(newExec);
                    return newExec;
                }
                if (id === 'triggers') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids = [] } = body || {};
                        if (!batchAction || !Array.isArray(ids)) {
                            throw { status: 400, message: 'Invalid batch action payload for automation triggers.' };
                        }
                        if (!['enable', 'disable', 'delete'].includes(batchAction)) {
                            throw { status: 400, message: `Unsupported batch action: ${batchAction}` };
                        }
                        let updated = 0;
                        const now = new Date().toISOString();
                        const currentUser = getCurrentUser();
                        DB.automation_triggers.forEach((trigger: any) => {
                            if (!ids.includes(trigger.id)) return;
                            if (batchAction === 'enable') {
                                const oldEnabled = trigger.enabled;
                                trigger.enabled = true;
                                trigger.updated_at = now;
                                if (oldEnabled !== true) {
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'update',
                                        'AutomationTrigger',
                                        trigger.id,
                                        { name: trigger.name, old_enabled: oldEnabled, new_enabled: true }
                                    );
                                }
                            }
                            if (batchAction === 'disable') {
                                const oldEnabled = trigger.enabled;
                                trigger.enabled = false;
                                trigger.updated_at = now;
                                if (oldEnabled !== false) {
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'update',
                                        'AutomationTrigger',
                                        trigger.id,
                                        { name: trigger.name, old_enabled: oldEnabled, new_enabled: false }
                                    );
                                }
                            }
                            if (batchAction === 'delete') {
                                trigger.deleted_at = now;
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'AutomationTrigger',
                                    trigger.id,
                                    { name: trigger.name, type: trigger.type }
                                );
                            }
                            updated += 1;
                        });
                        return { success: true, updated };
                    }

                    // 驗證必填欄位
                    const { name, type, enabled, target_playbook_id } = body;
                    if (!name || !type || enabled === undefined || !target_playbook_id) {
                        throw { status: 400, message: 'Missing required fields for automation trigger' };
                    }
                    if (!['schedule', 'webhook', 'event'].includes(type)) {
                        throw { status: 400, message: 'Invalid trigger type' };
                    }

                    const retryPolicy = validateEnum(
                        (body.retry_policy ?? 'none') as RetryPolicy,
                        ['none', 'fixed', 'exponential'] as RetryPolicy[],
                        'retry_policy'
                    );

                    // 驗證外鍵
                    if (body.target_playbook_id) {
                        const playbook = DB.playbooks.find(p => p.id === body.target_playbook_id && !p.deleted_at);
                        if (!playbook) {
                            throw { status: 404, message: 'Target playbook not found.' };
                        }
                    }

                    const timestamp = new Date().toISOString();
                    const newTrigger = {
                        ...body,
                        retry_policy: retryPolicy,
                        id: `trig-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.automation_triggers.unshift(newTrigger);
                    // Audit log for automation trigger creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'AutomationTrigger',
                        newTrigger.id,
                        { name: newTrigger.name, type: newTrigger.type, enabled: newTrigger.enabled }
                    );
                    return newTrigger;
                }
                break;
            }
            case 'PATCH /automation': {
                if (id === 'scripts') {
                    const itemId = subId;
                    const index = DB.playbooks.findIndex((p: any) => p.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existing = DB.playbooks[index];
                    // 更新 updated_at 時間戳
                    let normalizedRetryPolicy: RetryPolicy = (existing.retry_policy as RetryPolicy) ?? 'none';
                    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'retry_policy')) {
                        if (body?.retry_policy !== undefined) {
                            normalizedRetryPolicy = validateEnum(
                                body.retry_policy as RetryPolicy,
                                ['none', 'fixed', 'exponential'] as RetryPolicy[],
                                'retry_policy'
                            );
                        }
                    }
                    const updated = { ...existing, ...body, retry_policy: normalizedRetryPolicy, updated_at: new Date().toISOString() };
                    DB.playbooks[index] = updated;
                    // Audit log for automation playbook update
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'update',
                        'AutomationPlaybook',
                        itemId,
                        { old_name: existing.name, new_name: updated.name, old_type: existing.type, new_type: updated.type }
                    );
                    return updated;
                }
                if (id === 'triggers') {
                    const itemId = subId;
                    const index = DB.automation_triggers.findIndex((t: any) => t.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existing = DB.automation_triggers[index];
                    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'target_playbook_id')) {
                        const targetPlaybookId = body?.target_playbook_id;
                        if (targetPlaybookId) {
                            validateForeignKey(DB.playbooks, targetPlaybookId, 'Automation playbook');
                        }
                    }
                    // 更新 updated_at 時間戳
                    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
                    DB.automation_triggers[index] = updated;
                    // Audit log for automation trigger update
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'update',
                        'AutomationTrigger',
                        itemId,
                        {
                            old_name: existing.name,
                            new_name: updated.name,
                            old_type: existing.type,
                            new_type: updated.type,
                            old_enabled: existing.enabled,
                            new_enabled: updated.enabled
                        }
                    );
                    return updated;
                }
                break;
            }
            case 'DELETE /automation': {
                if (id === 'scripts') {
                    const itemId = subId;
                    const index = DB.playbooks.findIndex((item: any) => item.id === itemId);
                    if (index > -1) {
                        const playbook = DB.playbooks[index];
                        (DB.playbooks[index] as any).deleted_at = new Date().toISOString();
                        // Audit log for automation playbook deletion
                        const currentUser = getCurrentUser();
                        auditLogMiddleware(
                            currentUser.id,
                            'delete',
                            'AutomationPlaybook',
                            itemId,
                            { name: playbook.name, type: playbook.type }
                        );
                    }
                    return {};
                }
                if (id === 'triggers') {
                    const itemId = subId;
                    const index = DB.automation_triggers.findIndex((item: any) => item.id === itemId);
                    if (index > -1) {
                        const trigger = DB.automation_triggers[index];
                        (DB.automation_triggers[index] as any).deleted_at = new Date().toISOString();
                        // Audit log for automation trigger deletion
                        const currentUser = getCurrentUser();
                        auditLogMiddleware(
                            currentUser.id,
                            'delete',
                            'AutomationTrigger',
                            itemId,
                            { name: trigger.name, type: trigger.type }
                        );
                    }
                    return {};
                }
                break;
            }


            // IAM
            case 'GET /iam': {
                if (id === 'users') {
                    let users = getActive(DB.users);
                    if (params && params.keyword) users = users.filter((u: any) => u.name.toLowerCase().includes(params.keyword.toLowerCase()) || u.email.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params?.sort_by && params?.sort_order) {
                        users = sortData(users, params.sort_by, params.sort_order);
                    }
                    return paginate(users, params?.page, params?.page_size);
                }
                if (id === 'teams') {
                    let teams = getActive(DB.teams);
                    if (params?.keyword) teams = teams.filter((t: any) => t.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params?.sort_by && params?.sort_order) {
                        teams = sortData(teams, params.sort_by, params.sort_order);
                    }
                    return paginate(teams, params?.page, params?.page_size);
                }
                if (id === 'roles') {
                    let roles = getActive(DB.roles);
                    if (params?.keyword) roles = roles.filter((r: any) => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params?.sort_by && params?.sort_order) {
                        roles = sortData(roles, params.sort_by, params.sort_order);
                    }
                    return paginate(roles, params?.page, params?.page_size);
                }
                if (id === 'permissions') return DB.available_permissions;
                if (id === 'audit-logs') {
                    let logs = DB.audit_logs;
                    if (params?.sort_by && params?.sort_order) {
                        logs = sortData(logs, params.sort_by, params.sort_order);
                    }
                    return paginate(logs, params?.page, params?.page_size);
                }
                break;
            }
            case 'POST /iam': {
                if (id === 'users') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        const currentUser = getCurrentUser();
                        if (batchAction === 'delete') {
                            DB.users.forEach((u: any) => {
                                if (!ids.includes(u.id)) return;
                                u.deleted_at = new Date().toISOString();
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'User',
                                    u.id,
                                    { name: u.name, email: u.email, role: u.role }
                                );
                            });
                        }
                        if (batchAction === 'disable') {
                            DB.users.forEach((u: any) => {
                                if (!ids.includes(u.id)) return;
                                const oldStatus = u.status;
                                u.status = 'inactive';
                                if (oldStatus !== 'inactive') {
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'update',
                                        'User',
                                        u.id,
                                        { name: u.name, old_status: oldStatus, new_status: 'inactive' }
                                    );
                                }
                            });
                        }
                        return { success: true };
                    }
                    if (subId === 'import') {
                        return { message: '成功匯入 25 位人員。' };
                    } else {
                        // 驗證必填欄位
                        const { name, email, role, team } = body;
                        if (!name || !email || !role || !team) {
                            throw { status: 400, message: 'Missing required fields: name, email, role, team' };
                        }
                        if (!['admin', 'sre', 'developer', 'viewer'].includes(role)) {
                            throw { status: 400, message: 'Invalid role value' };
                        }

                        const timestamp = new Date().toISOString();
                        const newUser = {
                            ...body,
                            id: `usr-${uuidv4()}`,
                            status: body?.status ?? 'invited',
                            last_login_at: body?.last_login_at ?? null,
                            created_at: timestamp,
                            updated_at: timestamp,
                        };
                        DB.users.unshift(newUser);
                        // Audit log for user creation
                        const currentUser = getCurrentUser();
                        auditLogMiddleware(
                            currentUser.id,
                            'create',
                            'User',
                            newUser.id,
                            { name: newUser.name, email: newUser.email, role: newUser.role }
                        );
                        return newUser;
                    }
                }
                if (id === 'teams') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') {
                            const currentUser = getCurrentUser();
                            DB.teams.forEach((t: any) => {
                                if (!ids.includes(t.id)) return;
                                t.deleted_at = new Date().toISOString();
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'Team',
                                    t.id,
                                    { name: t.name, member_count: Array.isArray(t.member_ids) ? t.member_ids.length : 0 }
                                );
                            });
                        }
                        return { success: true };
                    }

                    // 驗證外鍵
                    if (body.owner_id) {
                        const owner = DB.users.find(u => u.id === body.owner_id && !u.deleted_at);
                        if (!owner) {
                            throw { status: 404, message: 'Owner user not found.' };
                        }
                    }

                    const timestamp = new Date().toISOString();
                    const newTeam = {
                        member_ids: [],
                        ...body,
                        id: `team-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp,
                    };
                    DB.teams.unshift(newTeam);
                    // Audit log for team creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'Team',
                        newTeam.id,
                        { name: newTeam.name, owner_id: newTeam.owner_id, member_count: newTeam.member_ids?.length ?? 0 }
                    );
                    return newTeam;
                }
                if (id === 'roles') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') {
                            const currentUser = getCurrentUser();
                            DB.roles.forEach((r: any) => {
                                if (!ids.includes(r.id)) return;
                                r.deleted_at = new Date().toISOString();
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'Role',
                                    r.id,
                                    { name: r.name, permissions_count: Array.isArray(r.permissions) ? r.permissions.length : 0 }
                                );
                            });
                        }
                        return { success: true };
                    }
                    const timestamp = new Date().toISOString();
                    const newRole = {
                        permissions: [],
                        ...body,
                        id: `role-${uuidv4()}`,
                        user_count: 0,
                        enabled: body?.enabled ?? true,
                        created_at: timestamp,
                        updated_at: timestamp,
                    };
                    DB.roles.unshift(newRole);
                    // Audit log for role creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'Role',
                        newRole.id,
                        { name: newRole.name, enabled: newRole.enabled, permissions_count: newRole.permissions?.length ?? 0 }
                    );
                    return newRole;
                }
                break;
            }
            case 'PATCH /iam': {
                const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
                const itemId = subId;
                const index = collection.findIndex((item: any) => item.id === itemId);
                if (index === -1) throw { status: 404 };
                const existing = collection[index];
                if (id === 'teams') {
                    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'owner_id')) {
                        validateForeignKey(DB.users, body?.owner_id, 'Owner (user)');
                    }
                    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'member_ids')) {
                        if (body?.member_ids !== undefined && !Array.isArray(body?.member_ids)) {
                            throw { status: 400, message: 'member_ids must be an array.' };
                        }
                        validateForeignKeys(DB.users, body?.member_ids, 'user IDs');
                    }
                }
                const timestamp = new Date().toISOString();
                const baseUpdate = { ...existing, ...body };
                if ('updated_at' in baseUpdate) {
                    baseUpdate.updated_at = timestamp;
                }
                collection[index] = baseUpdate;
                // Audit log for update
                const currentUser = getCurrentUser();
                const entityType = id === 'users' ? 'User' : id === 'teams' ? 'Team' : 'Role';
                const entityDetails = id === 'users'
                    ? {
                        old_name: existing.name,
                        new_name: baseUpdate.name,
                        old_email: existing.email,
                        new_email: baseUpdate.email,
                        old_role: existing.role,
                        new_role: baseUpdate.role,
                        old_status: existing.status,
                        new_status: baseUpdate.status
                    }
                    : id === 'teams'
                        ? {
                            old_name: existing.name,
                            new_name: baseUpdate.name,
                            old_member_count: Array.isArray(existing.member_ids) ? existing.member_ids.length : 0,
                            new_member_count: Array.isArray(baseUpdate.member_ids) ? baseUpdate.member_ids.length : 0
                        }
                        : {
                            old_name: existing.name,
                            new_name: baseUpdate.name,
                            old_permissions_count: Array.isArray(existing.permissions) ? existing.permissions.length : 0,
                            new_permissions_count: Array.isArray(baseUpdate.permissions) ? baseUpdate.permissions.length : 0
                        };
                auditLogMiddleware(
                    currentUser.id,
                    'update',
                    entityType,
                    itemId,
                    entityDetails
                );
                return collection[index];
            }
            case 'DELETE /iam': {
                const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
                const itemId = subId;
                const index = collection.findIndex((item: any) => item.id === itemId);
                if (index > -1) {
                    const item = collection[index];
                    (collection[index] as any).deleted_at = new Date().toISOString();
                    // Audit log for deletion
                    const currentUser = getCurrentUser();
                    const entityType = id === 'users' ? 'User' : id === 'teams' ? 'Team' : 'Role';
                    const details = id === 'users'
                        ? { name: item.name, email: item.email, role: item.role }
                        : id === 'teams'
                            ? { name: item.name, member_count: Array.isArray(item.member_ids) ? item.member_ids.length : 0 }
                            : { name: item.name, permissions_count: Array.isArray(item.permissions) ? item.permissions.length : 0 };
                    auditLogMiddleware(
                        currentUser.id,
                        'delete',
                        entityType,
                        itemId,
                        details
                    );
                }
                return {};
            }

            // Analysis
            case 'GET /analysis': {
                if (id === 'overview') {
                    const overview = JSON.parse(JSON.stringify(DB.analysis_overview_data));
                    const timeRangeParam = params?.time_range;
                    const rangeInMs = parseTimeRangeToMs(timeRangeParam);

                    if (Array.isArray(overview?.recent_logs) && rangeInMs !== null) {
                        const now = Date.now();
                        overview.recent_logs = overview.recent_logs.filter((log: any) => {
                            const timestamp = new Date(log.timestamp).getTime();
                            if (Number.isNaN(timestamp)) {
                                return true;
                            }
                            return now - timestamp <= rangeInMs;
                        });
                    }

                    return overview;
                }
                if (id === 'capacity-planning') {
                    const generateTrendData = (base: number, trend: number, variance: number) => {
                        const historical: [string, number][] = []; let lastValue = base;
                        for (let i = 60; i > 0; i--) { historical.push([new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(), Math.max(0, Math.min(100, lastValue += (Math.random() - 0.5) * variance))]); }
                        const forecast: [string, number][] = [[historical[historical.length - 1][0], historical[historical.length - 1][1]]]; let forecastValue = lastValue;
                        for (let i = 1; i < 30; i++) { forecast.push([new Date(Date.now() + i * 24 * 3600 * 1000).toISOString(), Math.max(0, Math.min(100, forecastValue += trend + (Math.random() - 0.5) * variance * 1.5))]); }
                        return { historical, forecast };
                    };
                    const cpuForecast = generateTrendData(45, 0.5, 5).forecast;
                    return {
                        trends: { cpu: generateTrendData(45, 0.5, 5), memory: generateTrendData(60, 0.2, 3), storage: generateTrendData(70, 0.1, 1) },
                        forecast_model: {
                            prediction: cpuForecast,
                            confidence_band: [
                                cpuForecast.map(([time, val]) => [time, Math.max(0, val - 5 - Math.random() * 5)]),
                                cpuForecast.map(([time, val]) => [time, Math.min(100, val + 5 + Math.random() * 5)])
                            ]
                        },
                        suggestions: DB.capacity_suggestions,
                        resource_analysis: DB.capacity_resource_analysis,
                        options: {
                            time_range_options: DB.capacity_time_options,
                        },
                    };
                }
                break;
            }
            case 'POST /analysis': {
                if (id === 'incidents') {
                    if (subId === 'multi') {
                        const incidentIds = Array.isArray(body?.incident_ids) ? body.incident_ids.filter(Boolean) : [];
                        if (incidentIds.length < 2) {
                            throw { status: 400, message: '請至少提供兩個 incident_ids 進行關聯分析。' };
                        }
                        const missing = incidentIds.filter((incidentId: string) => !DB.incidents.some((incident: Incident) => incident.id === incidentId));
                        if (missing.length > 0) {
                            throw { status: 404, message: `找不到以下事件：${missing.join(', ')}` };
                        }
                        const analysis = JSON.parse(JSON.stringify(DB.analysis_multi_incident_report));
                        analysis.incident_ids = incidentIds;
                        analysis.timeline = Array.isArray(analysis.timeline)
                            ? analysis.timeline.map((entry: any, index: number) => ({
                                ...entry,
                                incident_id: incidentIds[index % incidentIds.length],
                            }))
                            : [];
                        return analysis;
                    }

                    if (!subId) {
                        throw { status: 404, message: '找不到指定的事件。' };
                    }

                    const incident = DB.incidents.find((item: Incident) => item.id === subId);
                    if (!incident) {
                        throw { status: 404, message: '找不到指定的事件。' };
                    }

                    const analysis = JSON.parse(JSON.stringify(DB.analysis_incident_report));
                    if (body?.include_related === false) {
                        analysis.related_incidents = [];
                    } else if (Array.isArray(analysis.related_incidents) && !analysis.related_incidents.includes(subId)) {
                        analysis.related_incidents.unshift(subId);
                    }
                    analysis.analysis_time = new Date().toISOString();
                    return analysis;
                }

                if (id === 'resources') {
                    if (subId === 'batch') {
                        const resourceIds = Array.isArray(body?.resource_ids) ? body.resource_ids.filter(Boolean) : [];
                        if (resourceIds.length === 0) {
                            throw { status: 400, message: 'resource_ids 欄位為必填。' };
                        }
                        const missingResources = resourceIds.filter((resourceId: string) => !DB.resources.some((resource: Resource) => resource.id === resourceId));
                        if (missingResources.length > 0) {
                            throw { status: 404, message: `找不到以下資源：${missingResources.join(', ')}` };
                        }

                        const batchAnalysis = JSON.parse(JSON.stringify(DB.analysis_batch_resource_report));
                        batchAnalysis.analyses = Array.isArray(batchAnalysis.analyses)
                            ? batchAnalysis.analyses.map((item: any, index: number) => {
                                const resourceId = resourceIds[index] ?? resourceIds[index % resourceIds.length];
                                const resource = DB.resources.find((res: Resource) => res.id === resourceId);
                                return {
                                    ...item,
                                    resource_id: resourceId,
                                    resource_name: resource?.name ?? item.resource_name,
                                    analysis_time: new Date().toISOString(),
                                };
                            })
                            : [];
                        batchAnalysis.summary = {
                            total_resources: resourceIds.length,
                            high_risk_count: batchAnalysis.analyses.filter((item: any) => ['high', 'critical'].includes((item.risk_level || '').toString().toLowerCase())).length,
                            recommendations_count: batchAnalysis.analyses.reduce(
                                (total: number, item: any) => total + (Array.isArray(item.optimization_suggestions) ? item.optimization_suggestions.length : 0),
                                0
                            ),
                        };
                        return batchAnalysis;
                    }

                    if (!subId) {
                        throw { status: 404, message: '找不到指定的資源。' };
                    }

                    const resource = DB.resources.find((item: Resource) => item.id === subId);
                    if (!resource) {
                        throw { status: 404, message: '找不到指定的資源。' };
                    }

                    const resourceAnalysis = JSON.parse(JSON.stringify(DB.analysis_resource_report));
                    resourceAnalysis.resource_id = subId;
                    resourceAnalysis.resource_name = resource.name ?? resourceAnalysis.resource_name;
                    resourceAnalysis.analysis_time = new Date().toISOString();
                    return resourceAnalysis;
                }

                if (id === 'logs') {
                    const { query, time_range } = body || {};
                    if (!query || !time_range?.start || !time_range?.end) {
                        throw { status: 400, message: '請提供 query、time_range.start 與 time_range.end 欄位。' };
                    }
                    const logAnalysis = JSON.parse(JSON.stringify(DB.analysis_log_report));
                    logAnalysis.query = query;
                    logAnalysis.time_range = time_range;
                    return logAnalysis;
                }

                if (id === 'predict') {
                    if (subId === 'capacity') {
                        const { resource_id, metrics } = body || {};
                        if (!resource_id) {
                            throw { status: 400, message: 'resource_id 欄位為必填。' };
                        }
                        const resource = DB.resources.find((item: Resource) => item.id === resource_id);
                        if (!resource) {
                            throw { status: 404, message: '找不到指定的資源。' };
                        }
                        const capacityPrediction = JSON.parse(JSON.stringify(DB.analysis_capacity_prediction));
                        capacityPrediction.resource_id = resource_id;
                        capacityPrediction.resource_name = resource.name ?? capacityPrediction.resource_name;
                        if (Array.isArray(metrics) && metrics.length > 0) {
                            capacityPrediction.predictions = capacityPrediction.predictions.filter((prediction: any) => metrics.includes(prediction.metric));
                            if (capacityPrediction.predictions.length === 0) {
                                capacityPrediction.predictions = metrics.map((metric: string) => ({
                                    metric,
                                    current_value: 0,
                                    predicted_values: [],
                                    threshold_breach_date: null,
                                    recommendation: '沒有足夠的歷史資料可供預測。',
                                }));
                            }
                        }
                        return capacityPrediction;
                    }

                    if (subId === 'incidents') {
                        const { resource_ids, min_probability } = body || {};
                        if (min_probability !== undefined && (typeof min_probability !== 'number' || min_probability < 0 || min_probability > 1)) {
                            throw { status: 400, message: 'min_probability 必須介於 0 與 1 之間。' };
                        }

                        const incidentPrediction = JSON.parse(JSON.stringify(DB.analysis_incident_prediction));
                        if (Array.isArray(resource_ids) && resource_ids.length > 0) {
                            const filtered = incidentPrediction.predictions.filter((prediction: any) => resource_ids.includes(prediction.resource_id));
                            if (filtered.length > 0) {
                                incidentPrediction.predictions = filtered;
                            } else {
                                incidentPrediction.predictions = resource_ids.map((resourceId: string) => {
                                    const resource = DB.resources.find((item: Resource) => item.id === resourceId);
                                    return {
                                        resource_id: resourceId,
                                        resource_name: resource?.name ?? '未知資源',
                                        predicted_issue: '系統負載可能異常升高',
                                        probability: 0.58,
                                        estimated_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
                                        severity: 'warning',
                                        preventive_actions: ['檢查監控閾值設定', '安排預防性維護'],
                                    };
                                });
                            }
                        }
                        if (typeof min_probability === 'number') {
                            incidentPrediction.predictions = incidentPrediction.predictions.filter((prediction: any) => prediction.probability >= min_probability);
                        }
                        incidentPrediction.analysis_timestamp = new Date().toISOString();
                        return incidentPrediction;
                    }
                }

                if (id === 'anomalies') {
                    const resourceIds = Array.isArray(body?.resource_ids) ? body.resource_ids.filter(Boolean) : [];
                    const timeRange = body?.time_range || {};
                    if (resourceIds.length === 0) {
                        throw { status: 400, message: 'resource_ids 欄位為必填。' };
                    }
                    if (!timeRange.start || !timeRange.end) {
                        throw { status: 400, message: 'time_range.start 與 time_range.end 欄位為必填。' };
                    }
                    const missingResources = resourceIds.filter((resourceId: string) => !DB.resources.some((resource: Resource) => resource.id === resourceId));
                    if (missingResources.length > 0) {
                        throw { status: 404, message: `找不到以下資源：${missingResources.join(', ')}` };
                    }

                    const anomalyDetection = JSON.parse(JSON.stringify(DB.analysis_anomaly_detection));
                    anomalyDetection.anomalies = Array.isArray(anomalyDetection.anomalies)
                        ? anomalyDetection.anomalies.map((item: any, index: number) => {
                            const resourceId = resourceIds[index % resourceIds.length];
                            const resource = DB.resources.find((res: Resource) => res.id === resourceId);
                            return {
                                ...item,
                                resource_id: resourceId,
                                resource_name: resource?.name ?? item.resource_name,
                            };
                        })
                        : [];
                    anomalyDetection.summary = {
                        total_anomalies: anomalyDetection.anomalies.length,
                        high_severity_count: anomalyDetection.anomalies.filter((item: any) => (item.severity || '').toLowerCase() === 'high').length,
                    };
                    return anomalyDetection;
                }

                throw { status: 404, message: '找不到對應的分析端點。' };
            }
            case 'GET /logs': {
                let logs = DB.logs;
                if (params?.keyword) {
                    const keyword = params.keyword.toLowerCase();
                    logs = logs.filter((log: any) =>
                        log.message.toLowerCase().includes(keyword) ||
                        log.service.toLowerCase().includes(keyword)
                    );
                }
                if (params?.sort_by && params?.sort_order) {
                    logs = sortData(logs, params.sort_by, params.sort_order);
                }
                return paginate(logs, params?.page, params?.page_size);
            }

            // Settings
            case 'GET /settings': {
                if (id === 'layouts') return DB.layouts;
                if (id === 'widgets') return DB.layout_widgets;
                if (id === 'tags') {
                    let tags = getActive(DB.tag_definitions);
                    if (params?.sort_by && params?.sort_order) {
                        tags = sortData(tags, params.sort_by, params.sort_order);
                    }
                    // 支持分頁
                    const page = Number(params?.page) || 1;
                    const pageSize = Number(params?.page_size) || 10;
                    const startIndex = (page - 1) * pageSize;
                    const paginatedTags = tags.slice(startIndex, startIndex + pageSize);
                    return {
                        items: paginatedTags,
                        total: tags.length
                    };
                }
                if (id === 'column-config') {
                    const pageKey = subId as keyof typeof DB.column_configs;
                    return DB.column_configs[pageKey] || [];
                }
                if (id === 'notification-strategies') {
                    let strategies = getActive(DB.notification_strategies);
                    if (params?.keyword) strategies = strategies.filter((s: any) => s.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params?.sort_by && params?.sort_order) {
                        strategies = sortData(strategies, params.sort_by, params.sort_order);
                    }
                    return paginate(strategies, params?.page, params?.page_size);
                }
                if (id === 'notification-channels') {
                    let channels = getActive(DB.notification_channels);
                    if (params?.keyword) channels = channels.filter((c: any) => c.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params?.sort_by && params?.sort_order) {
                        channels = sortData(channels, params.sort_by, params.sort_order);
                    }
                    return paginate(channels, params?.page, params?.page_size);
                }
                if (id === 'notification-history') {
                    let history = DB.notification_history;
                    if (params?.sort_by && params?.sort_order) {
                        history = sortData(history, params.sort_by, params.sort_order);
                    }
                    return paginate(history, params?.page, params?.page_size);
                }
                if (id === 'mail') {
                    if (!DB.mail_settings.encryption_modes) {
                        DB.mail_settings.encryption_modes = ['none', 'tls', 'ssl'];
                    }
                    return DB.mail_settings;
                }
                if (id === 'auth') return DB.auth_settings;
                if (id === 'platform') return DB.platform_settings;
                if (id === 'preferences' && subId === 'options') return DB.preference_options;
                if (id === 'grafana') {
                    return DB.grafana_settings;
                }
                break;
            }
            case 'PUT /settings': {
                if (id === 'layouts') {
                    const newLayouts = body;
                    Object.keys(newLayouts).forEach(key => {
                        const existingLayout = DB.layouts[key as keyof typeof DB.layouts];
                        if (existingLayout) {
                            existingLayout.widget_ids = newLayouts[key].widget_ids;
                            existingLayout.updated_at = new Date().toISOString();
                            existingLayout.updated_by = 'Admin User';
                        }
                    });
                    return DB.layouts;
                }
                if (id === 'column-config') {
                    const pageKey = subId as keyof typeof DB.column_configs;
                    DB.column_configs[pageKey] = body;
                    return DB.column_configs[pageKey];
                }
                if (id === 'mail') {
                    DB.mail_settings = { ...DB.mail_settings, ...body };
                    return DB.mail_settings;
                }
                if (id === 'grafana') {
                    DB.grafana_settings = { ...DB.grafana_settings, ...body };
                    return DB.grafana_settings;
                }
                if (urlParts[1] === 'tags' && urlParts[3] === 'values') {
                    const tagId = urlParts[2];
                    const tagIndex = DB.tag_definitions.findIndex((t: any) => t.id === tagId);
                    if (tagIndex === -1) {
                        throw { status: 404, message: '標籤不存在。' };
                    }
                    DB.tag_definitions[tagIndex].allowed_values = Array.isArray(body) ? body : [];
                    return DB.tag_definitions[tagIndex];
                }
                break;
            }
            case 'POST /settings': {
                if (id === 'notification-channels' && subId === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!action || !Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    let updated = 0;
                    const currentUser = getCurrentUser();
                    if (action === 'delete') {
                        DB.notification_channels.forEach((channel: any) => {
                            if (ids.includes(channel.id)) {
                                channel.deleted_at = new Date().toISOString();
                                updated += 1;
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'NotificationChannel',
                                    channel.id,
                                    { name: channel.name, type: channel.type, enabled: channel.enabled }
                                );
                            }
                        });
                    } else if (action === 'enable') {
                        DB.notification_channels.forEach((channel: any) => {
                            if (ids.includes(channel.id)) {
                                const oldEnabled = channel.enabled;
                                channel.enabled = true;
                                channel.updated_at = new Date().toISOString();
                                updated += 1;
                                if (oldEnabled !== true) {
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'update',
                                        'NotificationChannel',
                                        channel.id,
                                        { name: channel.name, type: channel.type, old_enabled: oldEnabled, new_enabled: true }
                                    );
                                }
                            }
                        });
                    } else if (action === 'disable') {
                        DB.notification_channels.forEach((channel: any) => {
                            if (ids.includes(channel.id)) {
                                const oldEnabled = channel.enabled;
                                channel.enabled = false;
                                channel.updated_at = new Date().toISOString();
                                updated += 1;
                                if (oldEnabled !== false) {
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'update',
                                        'NotificationChannel',
                                        channel.id,
                                        { name: channel.name, type: channel.type, old_enabled: oldEnabled, new_enabled: false }
                                    );
                                }
                            }
                        });
                    } else {
                        throw { status: 400, message: `Unsupported batch action: ${action}` };
                    }
                    return { success: true, updated };
                }
                if (id === 'notification-strategies' && subId === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!action || !Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    let updated = 0;
                    const currentUser = getCurrentUser();
                    if (action === 'delete') {
                        DB.notification_strategies.forEach((strategy: any) => {
                            if (ids.includes(strategy.id)) {
                                strategy.deleted_at = new Date().toISOString();
                                updated += 1;
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'NotificationStrategy',
                                    strategy.id,
                                    { name: strategy.name, enabled: strategy.enabled }
                                );
                            }
                        });
                    } else if (action === 'enable') {
                        DB.notification_strategies.forEach((strategy: any) => {
                            if (ids.includes(strategy.id)) {
                                const oldEnabled = strategy.enabled;
                                strategy.enabled = true;
                                strategy.updated_at = new Date().toISOString();
                                updated += 1;
                                if (oldEnabled !== true) {
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'update',
                                        'NotificationStrategy',
                                        strategy.id,
                                        { name: strategy.name, old_enabled: oldEnabled, new_enabled: true }
                                    );
                                }
                            }
                        });
                    } else if (action === 'disable') {
                        DB.notification_strategies.forEach((strategy: any) => {
                            if (ids.includes(strategy.id)) {
                                const oldEnabled = strategy.enabled;
                                strategy.enabled = false;
                                strategy.updated_at = new Date().toISOString();
                                updated += 1;
                                if (oldEnabled !== false) {
                                    auditLogMiddleware(
                                        currentUser.id,
                                        'update',
                                        'NotificationStrategy',
                                        strategy.id,
                                        { name: strategy.name, old_enabled: oldEnabled, new_enabled: false }
                                    );
                                }
                            }
                        });
                    } else {
                        throw { status: 400, message: `Unsupported batch action: ${action}` };
                    }
                    return { success: true, updated };
                }
                if (id === 'tags' && subId === 'batch-actions') {
                    const { action, ids = [] } = body || {};
                    if (!action || !Array.isArray(ids)) {
                        throw { status: 400, message: 'Invalid payload for batch actions.' };
                    }
                    let updated = 0;
                    if (action === 'delete') {
                        const currentUser = getCurrentUser();
                        DB.tag_definitions.forEach((tag: any) => {
                            if (ids.includes(tag.id)) {
                                tag.deleted_at = new Date().toISOString();
                                updated += 1;
                                auditLogMiddleware(
                                    currentUser.id,
                                    'delete',
                                    'TagDefinition',
                                    tag.id,
                                    { key: tag.key, scopes: tag.scopes }
                                );
                            }
                        });
                    } else {
                        throw { status: 400, message: `Unsupported batch action: ${action}` };
                    }
                    return { success: true, updated };
                }
                if (id === 'tags') {
                    // 創建新標籤定義
                    if (!body.key || !body.scopes || !body.writable_roles) {
                        throw { status: 400, message: '缺少必要欄位。' };
                    }

                    // 檢查標籤鍵是否已存在
                    const existingTag = DB.tag_definitions.find((t: any) => t.key === body.key);
                    if (existingTag) {
                        throw { status: 400, message: `標籤鍵「${body.key}」已存在。` };
                    }

                    const newTag: TagDefinition = {
                        id: `tag-${uuidv4()}`,
                        key: body.key,
                        description: body.description || '',
                        scopes: body.scopes,
                        required: body.required || false,
                        writable_roles: body.writable_roles,
                        allowed_values: Array.isArray(body.allowed_values)
                            ? body.allowed_values
                            : [],
                        usage_count: 0,
                    };

                    DB.tag_definitions.push(newTag);
                    // Audit log for tag definition creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'TagDefinition',
                        newTag.id,
                        { key: newTag.key, scopes: newTag.scopes }
                    );
                    return newTag;
                }
                if (urlParts[1] === 'notification-channels' && action === 'test') {
                    const channelId = subId;
                    const channel = DB.notification_channels.find((c: any) => c.id === channelId);
                    if (!channel) {
                        throw { status: 404, message: 'Notification channel not found.' };
                    }
                    const tested_at = new Date().toISOString();
                    const shouldFail = channel?.config?.webhook_url?.includes('fail');
                    const result: 'success' | 'failed' = shouldFail ? 'failed' : 'success';
                    channel.last_test_result = result;
                    channel.last_tested_at = tested_at;
                    const message = result === 'success'
                        ? `測試通知已送出至「${channel.name}」。`
                        : `無法將測試通知送至「${channel.name}」，請檢查設定。`;
                    return { success: result === 'success', result, message, tested_at };
                }
                if (urlParts[1] === 'notification-history' && action === 'resend') {
                    const recordId = subId;
                    const record = DB.notification_history.find((r: any) => r.id === recordId);
                    if (!record) {
                        throw { status: 404, message: 'Notification record not found.' };
                    }
                    record.status = 'success';
                    record.timestamp = new Date().toISOString();
                    return { success: true, message: '通知已重新發送。' };
                }
                if (id === 'mail' && subId === 'test') {
                    const settings = DB.mail_settings;
                    const tested_at = new Date().toISOString();
                    const recipientEmail = body?.recipient_email as string | undefined;
                    const shouldFail = settings.smtp_server?.includes('invalid') || recipientEmail?.includes('fail');
                    const result = shouldFail ? 'failed' : 'success';
                    const message = result === 'success'
                        ? '測試郵件已成功送出。'
                        : '連線失敗：請確認 SMTP 設定或收件人。';
                    return { success: result === 'success', result, message, tested_at };
                }
                if (id === 'grafana' && subId === 'test') {
                    const { url, apiKey } = body;
                    const tested_at = new Date().toISOString();
                    if (typeof url !== 'string' || !url.trim()) {
                        throw { status: 400, message: 'Grafana URL 為必填欄位。' };
                    }
                    if (url.includes('fail')) {
                        return { success: false, result: 'failed', message: '連線失敗：無效的 URL 或網路問題。', tested_at };
                    }
                    if (apiKey === 'invalid-key') {
                        return { success: false, result: 'failed', message: '連線失敗：API Key 無效或權限不足。', tested_at };
                    }
                    const detectedVersion = 'Grafana v10.1.2';
                    return { success: true, result: 'success', message: `連線成功！偵測到 ${detectedVersion}。`, detected_version: detectedVersion, tested_at };
                }
                if (id === 'notification-strategies') {
                    const fallbackOptions = DB.notification_strategy_options || { severity_levels: [], impact_levels: [] };
                    const severity_levels = Array.isArray(body?.severity_levels) && body.severity_levels.length > 0
                        ? body.severity_levels
                        : fallbackOptions.severity_levels;
                    const impact_levels = Array.isArray(body?.impact_levels) && body.impact_levels.length > 0
                        ? body.impact_levels
                        : fallbackOptions.impact_levels;
                    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'channel_ids')) {
                        if (body?.channel_ids !== undefined && !Array.isArray(body?.channel_ids)) {
                            throw { status: 400, message: 'channel_ids must be an array.' };
                        }
                        validateForeignKeys(DB.notification_channels, body?.channel_ids, 'notification channel IDs');
                    }

                    const timestamp = new Date().toISOString();
                    const newStrategy: NotificationStrategy = {
                        ...body,
                        id: `strat-${uuidv4()}`,
                        last_updated: timestamp,
                        creator: 'Admin User',
                        severity_levels: severity_levels,
                        impact_levels: impact_levels,
                        channel_count: body?.channel_count ?? 0,
                        enabled: body?.enabled ?? true,
                        created_at: timestamp,
                        updated_at: timestamp,
                    };
                    DB.notification_strategies.unshift(newStrategy);
                    // Audit log for notification strategy creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'NotificationStrategy',
                        newStrategy.id,
                        {
                            name: newStrategy.name,
                            enabled: newStrategy.enabled,
                            severity_levels: newStrategy.severity_levels,
                            impact_levels: newStrategy.impact_levels
                        }
                    );
                    return newStrategy;
                }
                if (id === 'notification-channels') {
                    // 驗證必填欄位
                    const { name, type, enabled, config } = body;
                    if (!name || !type || enabled === undefined || !config) {
                        throw { status: 400, message: 'Missing required fields: name, type, enabled, config' };
                    }
                    const validTypes: NotificationChannelType[] = ['email', 'webhook', 'slack', 'line', 'sms'];
                    if (!validTypes.includes(type)) {
                        throw { status: 400, message: 'Invalid channel type' };
                    }

                    const timestamp = new Date().toISOString();
                    const newChannel = {
                        ...body,
                        id: `chan-${uuidv4()}`,
                        last_test_result: 'pending',
                        last_tested_at: timestamp,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.notification_channels.unshift(newChannel);
                    // Audit log for notification channel creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'NotificationChannel',
                        newChannel.id,
                        { name: newChannel.name, type: newChannel.type, enabled: newChannel.enabled }
                    );
                    return newChannel;
                }
                if (id === 'tags' && subId === 'import') {
                    const filename = body?.filename;
                    if (!filename) {
                        throw { status: 400, message: '匯入檔案名稱為必填欄位。' };
                    }
                    const dryRun = Boolean(body?.dry_run);
                    const currentUser = getCurrentUser();
                    const timestamp = new Date().toISOString();
                    const total_records = 20 + Math.floor(Math.random() * 6);
                    const failed_records = dryRun ? 0 : Math.floor(Math.random() * 3);
                    const imported_records = Math.max(0, total_records - failed_records);
                    const job: TagBulkImportJob = {
                        id: `tag-import-${uuidv4()}`,
                        filename,
                        status: 'success',
                        total_records,
                        imported_records,
                        failed_records,
                        error_log: failed_records > 0 ? ['標籤 key 不可為空值', 'writable_roles 需為有效角色 ID'] : [],
                        uploaded_by: currentUser.id,
                        created_at: timestamp,
                        completed_at: timestamp
                    };
                    DB.tag_bulk_import_jobs.unshift(job);
                    const summary = {
                        imported: job.imported_records,
                        failed: job.failed_records,
                        skipped: Math.max(0, job.total_records - job.imported_records - job.failed_records)
                    };
                    const message = dryRun
                        ? `匯入試跑完成，預計可匯入 ${job.imported_records} 筆標籤。`
                        : `已匯入 ${job.imported_records} 筆標籤，${job.failed_records} 筆資料需要修正。`;
                    return { job, summary, message };
                }
                if (id === 'tags') {
                    const fallbackRoles = DB.all_options?.tagManagement?.writable_roles || ['platform_admin'];
                    const payload = {
                        id: `tag-${uuidv4()}`,
                        allowed_values: Array.isArray(body?.allowed_values) ? body.allowed_values : [],
                        usage_count: 0,
                        scopes: Array.isArray(body?.scopes) ? body.scopes : [],
                        writable_roles: Array.isArray(body?.writable_roles) && body.writable_roles.length > 0 ? body.writable_roles : fallbackRoles,
                        required: Boolean(body?.required),
                        description: body?.description ?? '',
                        system: Boolean(body?.system),
                        key: body?.key,
                    } as TagDefinition;

                    if (!payload.key) {
                        throw { status: 400, message: '標籤鍵為必填項目。' };
                    }
                    if (!payload.scopes.length) {
                        throw { status: 400, message: '至少需指定一個適用範圍。' };
                    }

                    DB.tag_definitions.unshift(payload);
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'create',
                        'TagDefinition',
                        payload.id,
                        { key: payload.key, scopes: payload.scopes, writable_roles: payload.writable_roles }
                    );
                    return payload;
                }
                break;
            }
            case 'PATCH /settings': {
                const collectionId = urlParts[1];
                const itemId = urlParts[2];

                if (collectionId === 'notification-strategies') {
                    const index = DB.notification_strategies.findIndex((s: any) => s.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existingStrategy = DB.notification_strategies[index];
                    const severity_levels = Array.isArray(body?.severity_levels) && body?.severity_levels.length > 0
                        ? body.severity_levels
                        : existingStrategy.severity_levels;
                    const impact_levels = Array.isArray(body?.impact_levels) && body?.impact_levels.length > 0
                        ? body.impact_levels
                        : existingStrategy.impact_levels;
                    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'channel_ids')) {
                        if (body?.channel_ids !== undefined && !Array.isArray(body?.channel_ids)) {
                            throw { status: 400, message: 'channel_ids must be an array.' };
                        }
                        validateForeignKeys(DB.notification_channels, body?.channel_ids, 'notification channel IDs');
                    }

                    const timestamp = new Date().toISOString();
                    const updatedStrategy = {
                        ...existingStrategy,
                        ...body,
                        severity_levels: severity_levels,
                        impact_levels: impact_levels,
                        last_updated: timestamp,
                        updated_at: timestamp
                    };
                    DB.notification_strategies[index] = updatedStrategy;
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'update',
                        'NotificationStrategy',
                        itemId,
                        {
                            name: updatedStrategy.name,
                            old_enabled: existingStrategy.enabled,
                            new_enabled: updatedStrategy.enabled,
                            old_severity_levels: existingStrategy.severity_levels,
                            new_severity_levels: updatedStrategy.severity_levels,
                            old_impact_levels: existingStrategy.impact_levels,
                            new_impact_levels: updatedStrategy.impact_levels
                        }
                    );
                    return updatedStrategy;
                }
                if (collectionId === 'notification-channels') {
                    const index = DB.notification_channels.findIndex((c: any) => c.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existing = DB.notification_channels[index];
                    // 更新 updated_at 時間戳
                    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
                    DB.notification_channels[index] = updated;
                    // Audit log for notification channel update
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'update',
                        'NotificationChannel',
                        itemId,
                        {
                            old_name: existing.name,
                            new_name: updated.name,
                            old_type: existing.type,
                            new_type: updated.type,
                            old_enabled: existing.enabled,
                            new_enabled: updated.enabled
                        }
                    );
                    return updated;
                }
                if (collectionId === 'tags') {
                    const index = DB.tag_definitions.findIndex((t: any) => t.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existing = DB.tag_definitions[index];
                    const next: TagDefinition = {
                        ...existing,
                        ...body,
                    };

                    if (existing.system) {
                        next.key = existing.key;
                        next.scopes = existing.scopes;
                    } else if (Array.isArray(body?.scopes)) {
                        next.scopes = body.scopes;
                    }

                    if (Array.isArray(body?.writable_roles) && body.writable_roles.length > 0) {
                        next.writable_roles = body.writable_roles;
                    }

                    if (Array.isArray(body?.allowed_values)) {
                        next.allowed_values = body.allowed_values;
                    }

                    DB.tag_definitions[index] = next;
                    // Audit log for tag definition update
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'update',
                        'TagDefinition',
                        itemId,
                        {
                            old_key: existing.key,
                            new_key: next.key,
                            old_scopes: existing.scopes,
                            new_scopes: next.scopes,
                            old_allowed_values: existing.allowed_values,
                            new_allowed_values: next.allowed_values
                        }
                    );
                }
                break;
            }
            case 'DELETE /settings': {
                const collectionId = urlParts[1];
                const itemId = urlParts[2];

                if (collectionId === 'notification-strategies') {
                    const index = DB.notification_strategies.findIndex((s: any) => s.id === itemId);
                    if (index > -1) {
                        const strategy = DB.notification_strategies[index];
                        (DB.notification_strategies[index] as any).deleted_at = new Date().toISOString();
                        const currentUser = getCurrentUser();
                        auditLogMiddleware(
                            currentUser.id,
                            'delete',
                            'NotificationStrategy',
                            itemId,
                            { name: strategy.name, enabled: strategy.enabled }
                        );
                    }
                    return {};
                }
                if (collectionId === 'notification-channels') {
                    const index = DB.notification_channels.findIndex((c: any) => c.id === itemId);
                    if (index > -1) {
                        const channel = DB.notification_channels[index];
                        (DB.notification_channels[index] as any).deleted_at = new Date().toISOString();
                        // Audit log for notification channel deletion
                        const currentUser = getCurrentUser();
                        auditLogMiddleware(
                            currentUser.id,
                            'delete',
                            'NotificationChannel',
                            itemId,
                            { name: channel.name, type: channel.type, enabled: channel.enabled }
                        );
                    }
                    return {};
                }
                if (collectionId === 'tags') {
                    const index = DB.tag_definitions.findIndex((t: any) => t.id === itemId);
                    if (index > -1) {
                        if (DB.tag_definitions[index].system) {
                            throw { status: 400, message: '系統保留標籤不可刪除。' };
                        }
                        DB.tag_definitions[index].deleted_at = new Date().toISOString();
                        // Audit log for tag definition deletion
                        const currentUser = getCurrentUser();
                        const tag = DB.tag_definitions[index];
                        auditLogMiddleware(
                            currentUser.id,
                            'delete',
                            'TagDefinition',
                            itemId,
                            { key: tag.key, scopes: tag.scopes }
                        );
                    }
                    return {};
                }
                break;
            }
            case 'GET /system': {
                if (id === 'config') {
                    return DB.system_config;
                }
                break;
            }
            case 'GET /config-versions': {
                let versions = getActive(DB.config_versions);
                if (params?.entity_type) {
                    versions = versions.filter((version: any) => version.entity_type === params.entity_type);
                }
                if (params?.entity_id) {
                    versions = versions.filter((version: any) => version.entity_id === params.entity_id);
                }
                if (params?.sort_by && params?.sort_order) {
                    versions = sortData(versions, params.sort_by, params.sort_order);
                }
                return paginate(versions, params?.page, params?.page_size);
            }
            case 'GET /kpi-data': {
                return DB.kpi_data;
            }
            case 'GET /notifications': {
                if (id === 'options') {
                    return DB.notification_options;
                }
                let notifications = DB.notifications;
                if (params?.sort_by && params?.sort_order) {
                    notifications = sortData(notifications, params.sort_by, params.sort_order);
                }
                return paginate(notifications, params?.page, params?.page_size);
            }
            case 'POST /config-versions': {
                const { entity_type, entity_id, changed_by } = body || {};
                if (!entity_type || !entity_id || !changed_by) {
                    throw { status: 400, message: 'Missing required fields: entity_type, entity_id, changed_by' };
                }
                const entityCollectionInfo = getConfigEntityCollection(entity_type);
                if (!entityCollectionInfo) {
                    throw { status: 400, message: `Unsupported entity_type: ${entity_type}` };
                }
                validateForeignKey(DB.users, changed_by, 'Changed-by user');
                validateForeignKey(entityCollectionInfo.collection, entity_id, entityCollectionInfo.label);
                const timestamp = new Date().toISOString();
                const newVersion: ConfigVersion = {
                    ...body,
                    id: `cv-${uuidv4()}`,
                    created_at: timestamp
                };
                DB.config_versions.unshift(newVersion);
                return newVersion;
            }
            case 'POST /notifications': {
                if (id === 'read-all') {
                    DB.notifications.forEach((n: any) => n.status = 'read');
                    return { success: true };
                }
                if (id && subId === 'read') {
                    const index = DB.notifications.findIndex((n: any) => n.id === id);
                    if (index > -1) {
                        DB.notifications[index].status = 'read';
                        return DB.notifications[index];
                    }
                    throw { status: 404 };
                }
                break;
            }
            case 'POST /backtesting': {
                if (id === 'run') {
                    // Simulate backtesting task creation
                    const taskId = `task-${Date.now()}`;
                    const submittedAt = new Date().toISOString();
                    const requestedRuleIds: string[] = Array.isArray(body?.rule_ids) && body.rule_ids.length > 0
                        ? body.rule_ids
                        : ['rule-001'];

                    const response = {
                        task_id: taskId,
                        status: 'running' as const,
                        submitted_at: submittedAt,
                        rule_count: requestedRuleIds.length,
                        estimated_completion_time: new Date(Date.now() + 30000).toISOString(), // 30 seconds
                    };

                    // Persist a placeholder so polling returns a running status instead of 404
                    DB.backtesting_results[taskId] = {
                        task_id: taskId,
                        status: 'running',
                        requested_at: submittedAt,
                        rule_results: [],
                        message: 'Backtesting task is running. Results will be available shortly.',
                    } as BacktestingResultsResponse;

                    // Simulate task completion after 2 seconds
                    setTimeout(() => {
                        const baseResult = DB.backtesting_results['task-001'];
                        if (baseResult) {
                            // Create a deep copy and update it
                            const result = JSON.parse(JSON.stringify(baseResult));

                            const templateResults: BacktestingRuleResult[] = Array.isArray(result.rule_results) && result.rule_results.length > 0
                                ? result.rule_results
                                : [];

                            // Tailor the response to the requested rules
                            const updatedRuleResults: BacktestingRuleResult[] = requestedRuleIds.map((ruleId, index) => {
                                const template = templateResults[index % Math.max(templateResults.length, 1)] ?? {
                                    rule_id: ruleId,
                                    rule_name: ruleId,
                                    triggered_count: 0,
                                    trigger_points: [],
                                    metric_series: [],
                                    actual_events: [],
                                    false_positive_count: 0,
                                    false_negative_count: 0,
                                    precision: null,
                                    recall: null,
                                    recommendations: [],
                                };
                                const matchedRule = DB.alert_rules.find((item: AlertRule) => item.id === ruleId);
                                return {
                                    ...template,
                                    rule_id: ruleId,
                                    rule_name: matchedRule?.name ?? template.rule_name ?? ruleId,
                                };
                            });

                            const totalTriggers = updatedRuleResults.reduce((sum, rule) => sum + (rule.triggered_count ?? 0), 0);

                            result.task_id = taskId;
                            result.status = 'completed';
                            result.completed_at = new Date().toISOString();
                            result.requested_at = submittedAt;
                            result.duration_seconds = result.duration_seconds ?? 150;
                            result.rule_results = updatedRuleResults;
                            if (result.batch_summary) {
                                result.batch_summary.total_rules = updatedRuleResults.length;
                                result.batch_summary.total_triggers = totalTriggers;
                            }

                            DB.backtesting_results[taskId] = result;
                        } else {
                            DB.backtesting_results[taskId] = {
                                task_id: taskId,
                                status: 'failed',
                                requested_at: submittedAt,
                                completed_at: new Date().toISOString(),
                                rule_results: [],
                                message: 'Backtesting template data is unavailable in the mock server.',
                            } as BacktestingResultsResponse;
                        }
                    }, 2000);

                    return response;
                }
                break;
            }
            case 'GET /backtesting': {
                if (id === 'results' && subId && DB.backtesting_results[subId]) {
                    return DB.backtesting_results[subId];
                }
                throw { status: 404, message: 'Backtesting task not found' };
            }
        }
    } catch (e: any) {
        throw e;
    }

    throw { status: 404, message: `[Mock] Endpoint Not Found: ${method} ${url}` };
};

export { handleRequest };
export type { HttpMethod };
