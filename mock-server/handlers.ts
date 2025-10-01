import { DB, uuidv4 } from './db';
import type { ConnectionStatus, DiscoveryJob, Incident, NotificationStrategy, ResourceLink, ConfigVersion, TabConfigMap, TagDefinition, NotificationChannelType } from '../types';
import { auditLogMiddleware } from './auditLog';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const getActive = (collection: any[] | undefined) => {
    if (!collection) {
        return [];
    }
    return collection.filter(item => !item.deleted_at);
}

const validateEnum = <T>(value: any, allowedValues: T[], fieldName: string): T => {
    if (!allowedValues.includes(value as T)) {
        throw {
            status: 400,
            message: `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`
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

/**
 * 自動填充 team 和 owner 標籤（從關聯實體自動生成）
 * @param entity 實體物件（需要有 teamId 和/或 ownerId 欄位）
 */
const autoPopulateReadonlyTags = (entity: any): void => {
    if (!entity.tags) {
        entity.tags = {};
    }

    // 自動填充 team 標籤
    if (entity.team_id) {
        const team = DB.teams.find((t: any) => t.id === entity.team_id);
        if (team) {
            entity.tags.team = team.name;
        }
    }

    // 自動填充 owner 標籤
    if (entity.owner_id) {
        const owner = DB.users.find((u: any) => u.id === entity.owner_id);
        if (owner) {
            entity.tags.owner = owner.name;
        }
    }
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
                    const selectedRules = DB.silenceRules.filter((rule: any) => ruleIds.includes(rule.id));
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
                    if (action === 'delete') DB.dashboards.forEach((d: any) => { if (ids.includes(d.id)) d.deleted_at = new Date().toISOString(); });
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
                    'CREATE',
                    'Dashboard',
                    newDashboardData.id,
                    { name: newDashboardData.name, owner: newDashboardData.owner }
                );
                return newDashboardData;
            }
            case 'PATCH /dashboards': {
                const index = DB.dashboards.findIndex((d: any) => d.id === id);
                if (index === -1) throw { status: 404 };
                const existing = DB.dashboards[index];
                // 更新 updated_at 時間戳
                const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
                DB.dashboards[index] = updated;
                // Audit log for dashboard update
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'UPDATE',
                    'Dashboard',
                    id,
                    { old_name: existing.name, new_name: updated.name }
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
                        'DELETE',
                        'Dashboard',
                        id,
                        { name: dashboard.name, owner: dashboard.owner }
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
                if (!id) {
                    const { summary, resource_id, rule_id, severity, impact, assignee } = body || {};
                    if (!summary || !resource_id || !rule_id || !severity || !impact) {
                        throw { status: 400, message: 'Missing required fields for creating an incident.' };
                    }

                    // 驗證枚舉值
                    validateEnum(severity, ['Critical', 'Warning', 'Info'], 'severity');
                    validateEnum(impact, ['High', 'Medium', 'Low'], 'impact');

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
                    const normalizedSeverity = (severity as string)?.charAt(0).toUpperCase() + (severity as string)?.slice(1).toLowerCase();
                    const normalizedImpact = (impact as string)?.charAt(0).toUpperCase() + (impact as string)?.slice(1).toLowerCase();
                    const newIncident: Incident = {
                        id: newIncidentId,
                        summary,
                        resource: resource.name,
                        resource_id,
                        impact: normalizedImpact as Incident['impact'],
                        rule: rule.name,
                        rule_id,
                        status: 'New',
                        severity: normalizedSeverity as Incident['severity'],
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
                        'CREATE',
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
                        channel_type: 'System' as NotificationChannelType,
                        recipient: 'Admin',
                        status: 'success' as const,
                        content: `手動觸發通知: ${incident.summary}`
                    };

                    DB.notification_history.unshift(notificationRecord);

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'NOTIFY',
                        'Incident',
                        id,
                        { summary: incident.summary }
                    );

                    return {
                        success: true,
                        message: `成功發送通知: ${incident.summary}`,
                        notificationId: notificationRecord.id
                    };
                }
                if (subId === 'actions') {
                    const { action: incidentAction, assigneeName, durationHours, details } = body;
                    const index = DB.incidents.findIndex((i: any) => i.id === id);
                    if (index === -1) throw { status: 404 };

                    const currentUser = DB.users[0];
                    const timestamp = new Date().toISOString();

                    if (incidentAction === 'acknowledge') {
                        const oldStatus = DB.incidents[index].status;
                        DB.incidents[index].status = 'Acknowledged';
                        DB.incidents[index].assignee = currentUser.name;
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Acknowledged', details: `Status changed from '${oldStatus}' to 'Acknowledged'.` });
                    }
                    if (incidentAction === 'resolve') {
                        const oldStatus = DB.incidents[index].status;
                        DB.incidents[index].status = 'Resolved';
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Resolved', details: `Status changed from '${oldStatus}' to 'Resolved'.` });
                    }
                    if (incidentAction === 'assign') {
                        const oldAssignee = DB.incidents[index].assignee || 'Unassigned';
                        DB.incidents[index].assignee = assigneeName;
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Re-assigned', details: `Assignee changed from ${oldAssignee} to ${assigneeName}.` });
                    }
                    if (incidentAction === 'silence') {
                        const oldStatus = DB.incidents[index].status;
                        DB.incidents[index].status = 'Silenced';
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Silenced', details: `Incident silenced for ${durationHours} hour(s). Status changed from '${oldStatus}' to 'Silenced'.` });
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
                        impact: 'Low',
                        rule: rule.name,
                        rule_id: rule.id,
                        status: 'New',
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
                        'CREATE',
                        'Incident',
                        newIncident.id,
                        { summary: newIncident.summary, severity: newIncident.severity, resource: newIncident.resource }
                    );

                    return {
                        success: true,
                        message: `成功觸發告警規則: ${rule.name}`,
                        incidentId: newIncident.id
                    };
                }
                if (subId === 'test') {
                    const ruleId = id;
                    const { payload } = body;
                    const rule = DB.alert_rules.find((r: any) => r.id === ruleId);
                    if (!rule) throw { status: 404, message: 'Rule not found' };
                    const condition = rule.conditionGroups?.[0]?.conditions?.[0];
                    if (condition && payload.metric === condition.metric && payload.value > condition.threshold) {
                        return {
                            matches: true,
                            preview: `事件: ${rule.titleTemplate?.replace('{{resource.name}}', payload.resource).replace('{{severity}}', rule.severity)}`
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
                if (body.automation?.enabled && body.automation?.playbook_id) {
                    const playbook = DB.playbooks.find(p => p.id === body.automation.playbook_id && !p.deleted_at);
                    if (!playbook) {
                        throw { status: 404, message: 'Automation playbook not found.' };
                    }
                }

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
                    'CREATE',
                    'AlertRule',
                    newRule.id,
                    { name: newRule.name, severity: newRule.severity }
                );

                return newRule;
            case 'PATCH /alert-rules':
                const ruleIndex = DB.alert_rules.findIndex((r: any) => r.id === id);
                if (ruleIndex === -1) throw { status: 404 };
                const oldRule = { ...DB.alert_rules[ruleIndex] };
                // 更新 updated_at 時間戳
                DB.alert_rules[ruleIndex] = { ...DB.alert_rules[ruleIndex], ...body, automation_enabled: !!body.automation?.enabled, updated_at: new Date().toISOString() };

                // 紀錄審計日誌
                const currentUser2 = getCurrentUser();
                auditLogMiddleware(
                    currentUser2.id,
                    'UPDATE',
                    'AlertRule',
                    id,
                    { oldName: oldRule.name, newName: body.name, oldSeverity: oldRule.severity, newSeverity: body.severity }
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
                        'DELETE',
                        'AlertRule',
                        id,
                        { name: rule.name, severity: rule.severity }
                    );
                }
                return {};
            }

            case 'GET /silence-rules': {
                if (id === 'templates') return DB.silence_rule_templates;
                let rules = getActive(DB.silenceRules);
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
                    ids.forEach((ruleId: string) => {
                        const ruleIndex = DB.silenceRules.findIndex((rule: any) => rule.id === ruleId);
                        if (ruleIndex === -1) return;
                        if (action === 'delete') {
                            DB.silenceRules.splice(ruleIndex, 1);
                        } else if (action === 'enable') {
                            DB.silenceRules[ruleIndex].enabled = true;
                        } else if (action === 'disable') {
                            DB.silenceRules[ruleIndex].enabled = false;
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
                DB.silenceRules.unshift(newSilenceRule);
                // Audit log for silence rule creation
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'CREATE',
                    'SilenceRule',
                    newSilenceRule.id,
                    { name: newSilenceRule.name, enabled: newSilenceRule.enabled }
                );
                return newSilenceRule;
            case 'PATCH /silence-rules':
                const silenceIndex = DB.silenceRules.findIndex((r: any) => r.id === id);
                if (silenceIndex === -1) throw { status: 404 };
                const existingSilenceRule = DB.silenceRules[silenceIndex];
                // 更新 updated_at 時間戳
                const updatedSilenceRule = { ...existingSilenceRule, ...body, updated_at: new Date().toISOString() };
                DB.silenceRules[silenceIndex] = updatedSilenceRule;
                // Audit log for silence rule update
                const currentUser4 = getCurrentUser();
                auditLogMiddleware(
                    currentUser4.id,
                    'UPDATE',
                    'SilenceRule',
                    id,
                    { old_name: existingSilenceRule.name, new_name: updatedSilenceRule.name, old_enabled: existingSilenceRule.enabled, new_enabled: updatedSilenceRule.enabled }
                );
                return updatedSilenceRule;
            case 'DELETE /silence-rules': {
                const ruleIndex = DB.silenceRules.findIndex((r: any) => r.id === id);
                if (ruleIndex > -1) {
                    const rule = DB.silenceRules[ruleIndex];
                    DB.silenceRules[ruleIndex].deleted_at = new Date().toISOString();
                    // Audit log for silence rule deletion
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'DELETE',
                        'SilenceRule',
                        id,
                        { name: rule.name, enabled: rule.enabled }
                    );
                }
                return {};
            }

            // Resources
            case 'GET /resources': {
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
                    return resourceItem;
                }
                let resources = getActive(DB.resources);
                if (params?.bookmarked) resources = resources.slice(0, 4);
                if (params?.sort_by && params?.sort_order) {
                    resources = sortData(resources, params.sort_by, params.sort_order);
                }
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
                    if (action === 'delete') {
                        DB.datasources.forEach((ds: any) => {
                            if (ids.includes(ds.id)) {
                                ds.deleted_at = new Date().toISOString();
                                updated += 1;
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
                    if (action === 'delete') {
                        DB.discovery_jobs.forEach((job: any) => {
                            if (ids.includes(job.id)) {
                                job.deleted_at = new Date().toISOString();
                                updated += 1;
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
                        const { url, id: payloadId } = body || {};
                        if (!url) throw { status: 400, message: '缺少測試連線所需的 URL。' };
                        const latency_ms = Math.floor(50 + Math.random() * 200);
                        const success = Math.random() > 0.2;
                        const status: ConnectionStatus = success ? 'ok' : 'error';
                        if (payloadId) {
                            const idx = DB.datasources.findIndex((d: any) => d.id === payloadId);
                            if (idx > -1) {
                                DB.datasources[idx].status = status;
                            }
                        }
                        const message = success
                            ? `成功連線至 ${url}。`
                            : `無法連線至 ${url}，請檢查設定。`;

                        return { success, status, latency_ms, message };
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
                        return { success, status, latency_ms, message };
                    }

                    // 驗證必填欄位
                    const { name, type, url, auth_method } = body;
                    if (!name || !type || !url || !auth_method) {
                        throw { status: 400, message: 'Missing required fields: name, type, url, auth_method' };
                    }

                    const timestamp = new Date().toISOString();
                    const newDs = { ...body, id: `ds-${uuidv4()}`, created_at: timestamp, status: 'pending' };
                    DB.datasources.unshift(newDs);
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
                                DB.discovery_jobs[idx].status = Math.random() > 0.2 ? 'success' : 'partial_failure';
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
                        status: 'success',
                        kind: body?.kind || 'K8s',
                        target_config: body?.target_config || {},
                        exporter_binding: body?.exporter_binding || { template_id: 'node_exporter' },
                        edge_gateway: body?.edge_gateway || { enabled: false },
                        tags: body?.tags || [],
                        created_at: timestamp,
                        updated_at: timestamp,
                    };
                    DB.discovery_jobs.unshift(newJob);
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
                        validateEnum(body.status, ['healthy', 'warning', 'critical', 'offline'], 'status');
                    }

                    const timestamp = new Date().toISOString();
                    const newResource = {
                        ...body,
                        id: `res-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.resources.unshift(newResource);
                    // 自動填充唯讀標籤
                    autoPopulateReadonlyTags(newResource);

                    // 紀錄審計日誌
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'CREATE',
                        'Resource',
                        newResource.id,
                        { name: newResource.name, type: newResource.type }
                    );

                    return newResource;
                }
            }
            case 'POST /resource-links': {
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
                    'CREATE',
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
                    // 更新 updated_at 時間戳
                    DB.datasources[index] = { ...DB.datasources[index], ...body, updated_at: new Date().toISOString() };
                    return DB.datasources[index];
                }
                if (id === 'discovery-jobs') {
                    const jobId = subId;
                    const index = DB.discovery_jobs.findIndex((j: any) => j.id === jobId);
                    if (index === -1) throw { status: 404 };
                    const existingJob = DB.discovery_jobs[index];
                    // 更新 updated_at 時間戳
                    DB.discovery_jobs[index] = {
                        ...existingJob,
                        ...body,
                        target_config: body?.target_config || existingJob.target_config,
                        exporter_binding: body?.exporter_binding || existingJob.exporter_binding,
                        edge_gateway: body?.edge_gateway || existingJob.edge_gateway,
                        tags: Array.isArray(body?.tags) ? body.tags : existingJob.tags,
                        updated_at: new Date().toISOString(),
                    };
                    return DB.discovery_jobs[index];
                }
                const resIndex = DB.resources.findIndex((r: any) => r.id === id);
                if (resIndex === -1) throw { status: 404 };
                const oldResource = { ...DB.resources[resIndex] };
                // 更新 updated_at 時間戳
                DB.resources[resIndex] = { ...DB.resources[resIndex], ...body, updated_at: new Date().toISOString() };

                // 紀錄審計日誌
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'UPDATE',
                    'Resource',
                    id,
                    { oldName: oldResource.name, newName: body.name, oldType: oldResource.type, newType: body.type }
                );

                return DB.resources[resIndex];
            }
            case 'PATCH /resource-links': {
                const linkIndex = DB.resource_links.findIndex((link: any) => link.id === id);
                if (linkIndex === -1) throw { status: 404 };
                const existingLink = DB.resource_links[linkIndex];
                // 更新 updated_at 時間戳
                DB.resource_links[linkIndex] = { ...existingLink, ...body, updated_at: new Date().toISOString() };
                // Audit log for resource link update
                const currentUser = getCurrentUser();
                auditLogMiddleware(
                    currentUser.id,
                    'UPDATE',
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
                    if (index > -1) (DB.datasources[index] as any).deleted_at = new Date().toISOString();
                    return {};
                }
                if (id === 'discovery-jobs') {
                    const jobId = subId;
                    const index = DB.discovery_jobs.findIndex((j: any) => j.id === jobId);
                    if (index > -1) (DB.discovery_jobs[index] as any).deleted_at = new Date().toISOString();
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
                        'DELETE',
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
                        'DELETE',
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
                    if (action === 'delete') {
                        DB.resource_groups.forEach((group: any) => {
                            if (ids.includes(group.id)) {
                                group.deleted_at = new Date().toISOString();
                                updated += 1;
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

                const timestamp = new Date().toISOString();
                const newGroup = {
                    ...body,
                    id: `rg-${uuidv4()}`,
                    created_at: timestamp,
                    updated_at: timestamp
                };
                DB.resource_groups.unshift(newGroup);
                // Audit log for resource group creation
                const currentUser5 = getCurrentUser();
                auditLogMiddleware(
                    currentUser5.id,
                    'CREATE',
                    'ResourceGroup',
                    newGroup.id,
                    { name: newGroup.name, type: newGroup.type }
                );
                return newGroup;
            case 'PUT /resource-groups':
                const groupIndex = DB.resource_groups.findIndex((g: any) => g.id === id);
                if (groupIndex === -1) throw { status: 404 };
                const existingGroup = DB.resource_groups[groupIndex];
                // 更新 updated_at 時間戳
                const updatedGroup = { ...existingGroup, ...body, updated_at: new Date().toISOString() };
                DB.resource_groups[groupIndex] = updatedGroup;
                // Audit log for resource group update
                const currentUser6 = getCurrentUser();
                auditLogMiddleware(
                    currentUser6.id,
                    'UPDATE',
                    'ResourceGroup',
                    id,
                    { old_name: existingGroup.name, new_name: updatedGroup.name, old_type: existingGroup.type, new_type: updatedGroup.type }
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
                        'DELETE',
                        'ResourceGroup',
                        id,
                        { name: group.name, type: group.type }
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
                        if (params.playbookId) executions = executions.filter((e: any) => e.script_id === params.playbookId);
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
                        if (batchAction === 'delete') {
                            DB.playbooks.forEach((script: any) => {
                                if (ids.includes(script.id)) {
                                    script.deleted_at = new Date().toISOString();
                                    updated += 1;
                                }
                            });
                        } else {
                            throw { status: 400, message: `Unsupported batch action: ${batchAction}` };
                        }
                        return { success: true, updated };
                    }
                    if (action === 'execute') {
                        const scriptId = subId;
                        if (!scriptId) {
                            throw { status: 400, message: 'Script ID is required to execute an automation playbook.' };
                        }
                        const script = DB.playbooks.find((p: any) => p.id === scriptId);
                        if (!script) throw { status: 404, message: 'Automation playbook not found.' };
                        const newExec = {
                            id: `exec-${uuidv4()}`,
                            script_id: scriptId,
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
                        'CREATE',
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
                        DB.automation_triggers.forEach((trigger: any) => {
                            if (!ids.includes(trigger.id)) return;
                            if (batchAction === 'enable') trigger.enabled = true;
                            if (batchAction === 'disable') trigger.enabled = false;
                            if (batchAction === 'delete') trigger.deleted_at = now;
                            updated += 1;
                        });
                        return { success: true, updated };
                    }

                    // 驗證必填欄位
                    const { name, type, enabled, target_playbook_id } = body;
                    if (!name || !type || enabled === undefined || !target_playbook_id) {
                        throw { status: 400, message: 'Missing required fields for automation trigger' };
                    }
                    if (!['Schedule', 'Webhook', 'Event'].includes(type)) {
                        throw { status: 400, message: 'Invalid trigger type' };
                    }

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
                        id: `trig-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.automation_triggers.unshift(newTrigger);
                    // Audit log for automation trigger creation
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'CREATE',
                        'AutomationTrigger',
                        newTrigger.id,
                        { name: newTrigger.name, type: newTrigger.type }
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
                    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
                    DB.playbooks[index] = updated;
                    // Audit log for automation playbook update
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'UPDATE',
                        'AutomationPlaybook',
                        itemId,
                        { old_name: existing.name, new_name: updated.name }
                    );
                    return updated;
                }
                if (id === 'triggers') {
                    const itemId = subId;
                    const index = DB.automation_triggers.findIndex((t: any) => t.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existing = DB.automation_triggers[index];
                    // 更新 updated_at 時間戳
                    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
                    DB.automation_triggers[index] = updated;
                    // Audit log for automation trigger update
                    const currentUser = getCurrentUser();
                    auditLogMiddleware(
                        currentUser.id,
                        'UPDATE',
                        'AutomationTrigger',
                        itemId,
                        { old_name: existing.name, new_name: updated.name, old_enabled: existing.enabled, new_enabled: updated.enabled }
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
                            'DELETE',
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
                            'DELETE',
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
                        if (batchAction === 'delete') DB.users.forEach((u: any) => { if (ids.includes(u.id)) u.deleted_at = new Date().toISOString(); });
                        if (batchAction === 'disable') DB.users.forEach((u: any) => { if (ids.includes(u.id)) u.status = 'inactive'; });
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
                        if (!['Admin', 'SRE', 'Developer', 'Viewer'].includes(role)) {
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
                            'CREATE',
                            'User',
                            newUser.id,
                            { name: newUser.name, email: newUser.email }
                        );
                        return newUser;
                    }
                }
                if (id === 'teams') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') DB.teams.forEach((t: any) => { if (ids.includes(t.id)) t.deleted_at = new Date().toISOString(); });
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
                        'CREATE',
                        'Team',
                        newTeam.id,
                        { name: newTeam.name, owner_id: newTeam.owner_id }
                    );
                    return newTeam;
                }
                if (id === 'roles') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') DB.roles.forEach((r: any) => { if (ids.includes(r.id)) r.deleted_at = new Date().toISOString(); });
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
                        'CREATE',
                        'Role',
                        newRole.id,
                        { name: newRole.name, enabled: newRole.enabled }
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
                    ? { old_name: existing.name, new_name: baseUpdate.name, old_email: existing.email, new_email: baseUpdate.email }
                    : id === 'teams'
                        ? { old_name: existing.name, new_name: baseUpdate.name }
                        : { old_name: existing.name, new_name: baseUpdate.name };
                auditLogMiddleware(
                    currentUser.id,
                    'UPDATE',
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
                    auditLogMiddleware(
                        currentUser.id,
                        'DELETE',
                        entityType,
                        itemId,
                        { name: item.name, email: item.email }
                    );
                }
                return {};
            }

            // Analysis
            case 'GET /analysis': {
                if (id === 'overview') {
                    return DB.analysis_overview_data;
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
                            timeRangeOptions: DB.capacity_time_options,
                        },
                    };
                }
                break;
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
                    if (!DB.mail_settings.encryptionModes) {
                        DB.mail_settings.encryptionModes = ['none', 'tls', 'ssl'];
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
                    if (action === 'delete') {
                        DB.notification_channels.forEach((channel: any) => {
                            if (ids.includes(channel.id)) {
                                channel.deleted_at = new Date().toISOString();
                                updated += 1;
                            }
                        });
                    } else if (action === 'enable') {
                        DB.notification_channels.forEach((channel: any) => {
                            if (ids.includes(channel.id)) {
                                channel.enabled = true;
                                channel.updated_at = new Date().toISOString();
                                updated += 1;
                            }
                        });
                    } else if (action === 'disable') {
                        DB.notification_channels.forEach((channel: any) => {
                            if (ids.includes(channel.id)) {
                                channel.enabled = false;
                                channel.updated_at = new Date().toISOString();
                                updated += 1;
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
                    if (action === 'delete') {
                        DB.notification_strategies.forEach((strategy: any) => {
                            if (ids.includes(strategy.id)) {
                                strategy.deleted_at = new Date().toISOString();
                                updated += 1;
                            }
                        });
                    } else if (action === 'enable') {
                        DB.notification_strategies.forEach((strategy: any) => {
                            if (ids.includes(strategy.id)) {
                                strategy.enabled = true;
                                strategy.updated_at = new Date().toISOString();
                                updated += 1;
                            }
                        });
                    } else if (action === 'disable') {
                        DB.notification_strategies.forEach((strategy: any) => {
                            if (ids.includes(strategy.id)) {
                                strategy.enabled = false;
                                strategy.updated_at = new Date().toISOString();
                                updated += 1;
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
                        DB.tag_definitions.forEach((tag: any) => {
                            if (ids.includes(tag.id)) {
                                tag.deleted_at = new Date().toISOString();
                                updated += 1;
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
                        'CREATE',
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
                    channel.last_test_result = 'success';
                    channel.last_tested_at = new Date().toISOString();
                    return { success: true, message: `測試通知已送出至「${channel.name}」。` };
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
                    return { success: true, message: 'Test email sent successfully.' };
                }
                if (id === 'grafana' && subId === 'test') {
                    const { url, apiKey } = body;
                    if (url.includes('fail')) {
                        return { success: false, message: '連線失敗：無效的 URL 或網路問題。' };
                    }
                    if (apiKey === 'invalid-key') {
                        return { success: false, message: '連線失敗：API Key 無效或權限不足。' };
                    }
                    return { success: true, message: '連線成功！偵測到 Grafana v10.1.2。' };
                }
                if (id === 'notification-strategies') {
                    const fallbackOptions = DB.notification_strategy_options || { severity_levels: [], impact_levels: [] };
                    const severityLevels = Array.isArray(body?.severity_levels) && body.severity_levels.length > 0
                        ? body.severity_levels
                        : fallbackOptions.severity_levels;
                    const impactLevels = Array.isArray(body?.impact_levels) && body.impact_levels.length > 0
                        ? body.impact_levels
                        : fallbackOptions.impact_levels;

                    const timestamp = new Date().toISOString();
                    const newStrategy: NotificationStrategy = {
                        ...body,
                        id: `strat-${uuidv4()}`,
                        last_updated: timestamp,
                        creator: 'Admin User',
                        severity_levels: severityLevels,
                        impact_levels: impactLevels,
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
                        'CREATE',
                        'NotificationStrategy',
                        newStrategy.id,
                        { name: newStrategy.name, enabled: newStrategy.enabled }
                    );
                    return newStrategy;
                }
                if (id === 'notification-channels') {
                    // 驗證必填欄位
                    const { name, type, enabled, config } = body;
                    if (!name || !type || enabled === undefined || !config) {
                        throw { status: 400, message: 'Missing required fields: name, type, enabled, config' };
                    }
                    const validTypes: NotificationChannelType[] = ['Email', 'Webhook (通用)', 'Slack', 'LINE Notify', 'SMS'];
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
                        'CREATE',
                        'NotificationChannel',
                        newChannel.id,
                        { name: newChannel.name, type: newChannel.type }
                    );
                    return newChannel;
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
                    const severityLevels = Array.isArray(body?.severity_levels) && body?.severity_levels.length > 0
                        ? body.severity_levels
                        : existingStrategy.severity_levels;
                    const impactLevels = Array.isArray(body?.impact_levels) && body?.impact_levels.length > 0
                        ? body.impact_levels
                        : existingStrategy.impact_levels;

                    const timestamp = new Date().toISOString();
                    DB.notification_strategies[index] = {
                        ...existingStrategy,
                        ...body,
                        severity_levels: severityLevels,
                        impact_levels: impactLevels,
                        last_updated: timestamp,
                        updated_at: timestamp
                    };
                    return DB.notification_strategies[index];
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
                        'UPDATE',
                        'NotificationChannel',
                        itemId,
                        { old_name: existing.name, new_name: updated.name, old_enabled: existing.enabled, new_enabled: updated.enabled }
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
                        'UPDATE',
                        'TagDefinition',
                        itemId,
                        { old_key: existing.key, new_key: next.key, old_scopes: existing.scopes, new_scopes: next.scopes }
                    );
                }
                break;
            }
            case 'DELETE /settings': {
                const collectionId = urlParts[1];
                const itemId = urlParts[2];

                if (collectionId === 'notification-strategies') {
                    const index = DB.notification_strategies.findIndex((s: any) => s.id === itemId);
                    if (index > -1) (DB.notification_strategies[index] as any).deleted_at = new Date().toISOString();
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
                            'DELETE',
                            'NotificationChannel',
                            itemId,
                            { name: channel.name, type: channel.type }
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
                            'DELETE',
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
                return DB.notifications;
            }
            case 'POST /config-versions': {
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
        }
    } catch (e: any) {
        throw e;
    }

    throw { status: 404, message: `[Mock] Endpoint Not Found: ${method} ${url}` };
};

export { handleRequest };
export type { HttpMethod };
