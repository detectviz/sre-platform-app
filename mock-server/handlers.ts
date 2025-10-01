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
                return DB.navItems;
            }
            case 'POST /discovery': {
                if (id === 'batch-ignore') {
                    const { resourceIds = [] } = body || {};
                    if (!Array.isArray(resourceIds)) {
                        throw { status: 400, message: 'Invalid payload for batch ignore.' };
                    }
                    resourceIds.forEach((resourceId: string) => {
                        const index = DB.discoveredResources.findIndex((res: any) => res.id === resourceId);
                        if (index > -1) {
                            DB.discoveredResources[index].status = 'ignored';
                            DB.discoveredResources[index].ignored_at = new Date().toISOString();
                        }
                    });
                    return { success: true, updated: resourceIds.length };
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
                    return DB.pageMetadata;
                }
                if (id === 'columns' && subId) {
                    const pageKey = subId as keyof typeof DB.allColumns;
                    return DB.allColumns[pageKey] || [];
                }
                break;
            }
            // UI Configs
            case 'GET /ui': {
                if (id === 'options') {
                    return DB.allOptions;
                }
                if (id === 'themes' && subId === 'charts') return DB.chartColors;
                if (id === 'content') {
                    if (action === 'command-palette') return DB.commandPaletteContent;
                    if (action === 'execution-log-detail') return DB.executionLogDetailContent;
                    if (action === 'import-modal') return DB.importModalContent;
                    return DB.pageContent;
                }
                if (id === 'icons') return DB.iconMap;
                if (id === 'tabs') {
                    const edition = process.env.SRE_PLATFORM_EDITION ?? 'community';
                    let tabsConfig = JSON.parse(JSON.stringify(DB.tabConfigs)) as TabConfigMap;
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
                if (id === 'icons-config') return DB.notificationChannelIcons;
                break;
            }
            // Me / Profile
            case 'GET /me': {
                if (id === 'login-history') {
                    return paginate(DB.loginHistory, params.page, params.page_size);
                }
                if (id === 'preferences') {
                    return DB.userPreferences;
                }
                return DB.users[0];
            }
            case 'PUT /me': {
                if (id === 'preferences') {
                    DB.userPreferences = { ...DB.userPreferences, ...body };
                    return DB.userPreferences;
                }
                break;
            }
            case 'POST /me': {
                if (id === 'change-password') {
                    const { oldPassword, newPassword } = body;
                    // Mock validation: In a real app, this would be a secure check.
                    if (oldPassword === 'wrongpassword') {
                        throw { status: 400, message: '舊密碼不正確。' };
                    }
                    if (!newPassword || newPassword.length < 6) {
                        throw { status: 400, message: '新密碼長度至少需要 6 個字元。' };
                    }
                    // Success, return empty object which will result in a 204 No Content.
                    return {};
                }
                break;
            }

            // AI Copilot
            case 'GET /ai': {
                if (id === 'briefing') return DB.aiBriefing;
                if (id === 'infra' && subId === 'risk-prediction') return DB.aiRiskPrediction;
                break;
            }
            case 'POST /ai': {
                if (id === 'briefing' && subId === 'generate') return DB.aiBriefing;
                if (id === 'incidents' && subId === 'analyze') {
                    const { incident_ids } = body;
                    return incident_ids.length > 1 ? DB.multiIncidentAnalysis : DB.singleIncidentAnalysis;
                }
                if (id === 'alert-rules' && subId === 'analyze') {
                    const ruleIds = Array.isArray(body?.rule_ids) ? body.rule_ids : [];
                    if (ruleIds.length === 0) {
                        throw { status: 400, message: '請至少選擇一項告警規則進行分析。' };
                    }
                    const selectedRules = DB.alertRules.filter((rule: any) => ruleIds.includes(rule.id));
                    if (selectedRules.length === 0) {
                        throw { status: 404, message: '找不到對應的告警規則。' };
                    }
                    const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
                        critical: 'high',
                        warning: 'medium',
                        info: 'low',
                    };
                    const analysis = JSON.parse(JSON.stringify(DB.alertRuleAnalysis));
                    analysis.evaluatedRules = selectedRules.map((rule: any) => ({
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
                    const analysis = JSON.parse(JSON.stringify(DB.silenceRuleAnalysis));
                    analysis.evaluatedRules = selectedRules.map((rule: any) => ({
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
                if (id === 'automation' && subId === 'generate-script') return DB.generatedPlaybook;
                if (id === 'logs' && subId === 'summarize') {
                    return DB.logAnalysis;
                }
                if (id === 'resources' && subId === 'analyze') {
                    const { resourceIds } = body;
                    // Mock: just return the same analysis regardless of input ids
                    return DB.resourceAnalysis;
                }
                break;
            }

            // Dashboards
            case 'GET /dashboards': {
                if (id === 'sre-war-room') {
                    if (subId === 'service-health') return DB.serviceHealthData;
                    if (subId === 'resource-group-status') return DB.resourceGroupStatusData;
                }
                if (id === 'infrastructure-insights' && subId === 'options') {
                    return DB.allOptions.infraInsights;
                }
                if (id === 'available-grafana') {
                    const linkedUids = getActive(DB.dashboards).filter((d: any) => d.type === 'grafana' && d.grafana_dashboard_uid).map((d: any) => d.grafana_dashboard_uid);
                    return DB.availableGrafanaDashboards.filter((d: any) => !linkedUids.includes(d.uid));
                }
                if (id === 'templates') return DB.dashboardTemplates;
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
                const newDashboardData = { ...body, id: `db-${uuidv4()}` };
                if (!newDashboardData.path) {
                    newDashboardData.path = `/dashboard/${newDashboardData.id}`;
                }
                // 設置創建和更新時間戳
                const timestamp = new Date().toISOString();
                newDashboardData.created_at = timestamp;
                newDashboardData.updated_at = timestamp;
                DB.dashboards.unshift(newDashboardData);
                return newDashboardData;
            }
            case 'PATCH /dashboards': {
                const index = DB.dashboards.findIndex((d: any) => d.id === id);
                if (index === -1) throw { status: 404 };
                // 更新 updated_at 時間戳
                DB.dashboards[index] = { ...DB.dashboards[index], ...body, updated_at: new Date().toISOString() };
                return DB.dashboards[index];
            }
            case 'DELETE /dashboards': {
                const index = DB.dashboards.findIndex((d: any) => d.id === id);
                if (index > -1) DB.dashboards[index].deleted_at = new Date().toISOString();
                return {};
            }

            // Incidents, Rules, Silences
            case 'GET /incidents': {
                if (id === 'alert-rules') {
                    // Redirect /incidents/alert-rules to the alert-rules handler
                    if (subId === 'templates') return DB.alertRuleTemplates;
                    if (subId === 'resource-types') return DB.resourceTypes;
                    if (subId === 'exporter-types') return DB.exporterTypes;
                    if (subId === 'metrics') return DB.metricMetadata;
                    if (subId === 'count') {
                        let rules = getActive(DB.alertRules);
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
                    let rules = getActive(DB.alertRules);
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
                    const executions = DB.automationExecutions.filter((e: any) =>
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

                    const resource = DB.resources.find((r: any) => r.id === resource_id);
                    if (!resource) {
                        throw { status: 404, message: 'Resource not found.' };
                    }

                    const rule = DB.alertRules.find((r: any) => r.id === rule_id);
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

                    DB.notificationHistory.unshift(notificationRecord);

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
                    const rule = DB.alertRules.find((r: any) => r.id === id);
                    if (!rule) {
                        throw { status: 404, message: '找不到告警規則。' };
                    }
                    return rule;
                }
                // 新增反向查詢端點：GET /alert-rules/{id}/incidents
                if (id && subId === 'incidents') {
                    // 查找與指定告警規則關聯的事件
                    const rule = DB.alertRules.find((r: any) => r.id === id);
                    if (!rule) throw { status: 404, message: 'Alert rule not found.' };

                    // 查找關聯的事件記錄
                    const incidents = DB.incidents.filter((i: any) =>
                        i.rule_id === id
                    );

                    return incidents;
                }
                if (id === 'templates') {
                    if (subId === 'default') {
                        return DB.alertRuleDefault;
                    }
                    return DB.alertRuleTemplates;
                }
                if (id === 'resource-types') return DB.resourceTypes;
                if (id === 'exporter-types') return DB.exporterTypes;
                if (id === 'metrics') return DB.metricMetadata;
                if (id === 'count') {
                    let rules = getActive(DB.alertRules);
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
                let rules = getActive(DB.alertRules);
                if (params) {
                    if (params.keyword) rules = rules.filter((r: any) => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params.severity) rules = rules.filter((r: any) => r.severity === params.severity);
                    if (params.enabled !== undefined) rules = rules.filter((r: any) => String(r.enabled) === params.enabled);
                }
                if (params?.sort_by && params?.sort_order) {
                    rules = sortData(rules, params.sort_by, params.sort_order);
                }
                return rules;
            }
            case 'POST /alert-rules':
                if (id === 'import') {
                    return { message: '成功匯入 8 條告警規則。' };
                }
                if (id && subId === 'trigger') {
                    // 手動觸發告警規則（用於測試）
                    const rule = DB.alertRules.find((r: any) => r.id === id);
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
                    const rule = DB.alertRules.find((r: any) => r.id === ruleId);
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
                const timestamp1 = new Date().toISOString();
                const newRule = {
                    ...body,
                    id: `rule-${uuidv4()}`,
                    automation_enabled: !!body.automation?.enabled,
                    created_at: timestamp1,
                    updated_at: timestamp1
                };
                DB.alertRules.unshift(newRule);

                // 紀錄審計日誌
                const currentUser1 = getCurrentUser();
                auditLogMiddleware(
                    currentUser1.id,
                    'CREATE',
                    'AlertRule',
                    newRule.id,
                    { name: newRule.name, severity: newRule.severity }
                );

                return newRule;
            case 'PATCH /alert-rules':
                const ruleIndex = DB.alertRules.findIndex((r: any) => r.id === id);
                if (ruleIndex === -1) throw { status: 404 };
                const oldRule = { ...DB.alertRules[ruleIndex] };
                // 更新 updated_at 時間戳
                DB.alertRules[ruleIndex] = { ...DB.alertRules[ruleIndex], ...body, automation_enabled: !!body.automation?.enabled, updated_at: new Date().toISOString() };

                // 紀錄審計日誌
                const currentUser2 = getCurrentUser();
                auditLogMiddleware(
                    currentUser2.id,
                    'UPDATE',
                    'AlertRule',
                    id,
                    { oldName: oldRule.name, newName: body.name, oldSeverity: oldRule.severity, newSeverity: body.severity }
                );

                return DB.alertRules[ruleIndex];
            case 'DELETE /alert-rules': {
                const ruleIndex = DB.alertRules.findIndex((r: any) => r.id === id);
                if (ruleIndex > -1) {
                    const rule = DB.alertRules[ruleIndex];
                    DB.alertRules[ruleIndex].deleted_at = new Date().toISOString();

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
                if (id === 'templates') return DB.silenceRuleTemplates;
                let rules = getActive(DB.silenceRules);
                if (params) {
                    if (params.keyword) rules = rules.filter((r: any) => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params.type) rules = rules.filter((r: any) => r.type === params.type);
                    if (params.enabled !== undefined) rules = rules.filter((r: any) => String(r.enabled) === params.enabled);
                }
                if (params?.sort_by && params?.sort_order) {
                    rules = sortData(rules, params.sort_by, params.sort_order);
                }
                return rules;
            }
            case 'GET /system': {
                if (id === 'config') {
                    return DB.systemConfig;
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
                const timestamp2 = new Date().toISOString();
                const newSilenceRule = {
                    ...body,
                    id: `sil-${uuidv4()}`,
                    created_at: timestamp2,
                    updated_at: timestamp2
                };
                DB.silenceRules.unshift(newSilenceRule);
                return newSilenceRule;
            case 'PATCH /silence-rules':
                const silenceIndex = DB.silenceRules.findIndex((r: any) => r.id === id);
                if (silenceIndex === -1) throw { status: 404 };
                // 更新 updated_at 時間戳
                DB.silenceRules[silenceIndex] = { ...DB.silenceRules[silenceIndex], ...body, updated_at: new Date().toISOString() };
                return DB.silenceRules[silenceIndex];
            case 'DELETE /silence-rules': {
                const ruleIndex = DB.silenceRules.findIndex((r: any) => r.id === id);
                if (ruleIndex > -1) DB.silenceRules[ruleIndex].deleted_at = new Date().toISOString();
                return {};
            }

            // Resources
            case 'GET /resources': {
                if (id === 'datasources') {
                    let datasources = getActive(DB.datasources);
                    if (params?.sort_by && params?.sort_order) {
                        datasources = sortData(datasources, params.sort_by, params.sort_order);
                    }
                    return datasources;
                }
                if (id === 'discovery-jobs') {
                    if (subId && action === 'results') {
                        return DB.discoveredResources;
                    }
                    let jobs = getActive(DB.discoveryJobs);
                    if (params?.sort_by && params?.sort_order) {
                        jobs = sortData(jobs, params.sort_by, params.sort_order);
                    }
                    return jobs;
                }
                if (id === 'overview') {
                    return DB.resourceOverviewData;
                }
                if (id === 'count') {
                    const query = params.query || '';
                    if (!query) return { count: DB.resources.length };
                    const randomCount = Math.floor(Math.random() * (DB.resources.length / 2)) + 5;
                    return { count: randomCount };
                }
                if (id === 'topology') {
                    if (subId === 'options') return DB.allOptions.topology;
                    return { nodes: DB.resources, links: DB.resourceLinks };
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
                    const rules = DB.alertRules.filter((r: any) =>
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
                let links = getActive(DB.resourceLinks);
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
                if (id === 'batch-tags') {
                    const { resourceIds = [], tags = [] } = body || {};
                    if (!Array.isArray(resourceIds) || !Array.isArray(tags)) {
                        throw { status: 400, message: 'Invalid payload for batch tagging.' };
                    }
                    const cleanedTags = tags.filter((tag: any) => tag?.key && tag?.value);
                    resourceIds.forEach((resourceId: string) => {
                        const resourceIndex = DB.resources.findIndex((resource: any) => resource.id === resourceId);
                        if (resourceIndex > -1) {
                            cleanedTags.forEach((tag: any) => {
                                const duplicate = DB.resources[resourceIndex].tags?.some((existing: any) => existing.key === tag.key && existing.value === tag.value);
                                if (!duplicate) {
                                    if (!DB.resources[resourceIndex].tags) DB.resources[resourceIndex].tags = [];
                                    DB.resources[resourceIndex].tags.push({ id: `tag-${uuidv4()}`, key: tag.key, value: tag.value });
                                }
                            });
                        }
                        const discoveryIndex = DB.discoveredResources.findIndex((res: any) => res.id === resourceId);
                        if (discoveryIndex > -1) {
                            cleanedTags.forEach((tag: any) => {
                                const duplicate = DB.discoveredResources[discoveryIndex].tags.some((existing: any) => existing.key === tag.key && existing.value === tag.value);
                                if (!duplicate) {
                                    DB.discoveredResources[discoveryIndex].tags.push({ id: `tag-${uuidv4()}`, key: tag.key, value: tag.value });
                                }
                            });
                        }
                    });
                    return { success: true, updated: resourceIds.length };
                }
                if (id === 'datasources') {
                    if (subId === 'test' && !action) {
                        const { url, id: payloadId } = body || {};
                        if (!url) throw { status: 400, message: '缺少測試連線所需的 URL。' };
                        const latencyMs = Math.floor(50 + Math.random() * 200);
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

                        return { success, status, latencyMs, message };
                    }
                    if (subId && action === 'test') {
                        const dsId = subId;
                        const index = DB.datasources.findIndex((d: any) => d.id === dsId);
                        if (index === -1) throw { status: 404, message: '找不到指定的 Datasource。' };
                        const latencyMs = Math.floor(50 + Math.random() * 200);
                        const success = Math.random() > 0.2;
                        const status: ConnectionStatus = success ? 'ok' : 'error';
                        DB.datasources[index].status = status;
                        const dsName = DB.datasources[index].name || '資料來源';
                        const message = success
                            ? `成功連線至 ${dsName}。`
                            : `無法連線至 ${dsName}，請檢查設定。`;
                        return { success, status, latencyMs, message };
                    }
                    const timestamp = new Date().toISOString();
                    const newDs = { ...body, id: `ds-${uuidv4()}`, created_at: timestamp, status: 'pending' };
                    DB.datasources.unshift(newDs);
                    return newDs;
                }
                if (id === 'discovery-jobs') {
                    if (subId === 'test' && !action) {
                        const success = Math.random() > 0.2;
                        const discoveredCount = success ? Math.floor(Math.random() * 20) + 1 : 0;
                        const warnings = [] as string[];
                        if (success && Math.random() > 0.7) {
                            warnings.push('部分節點需要額外憑證才能完成匯入。');
                        }
                        const message = success
                            ? '測試掃描成功。'
                            : '測試掃描失敗，請檢查目標配置。';
                        return { success, discoveredCount, message, warnings };
                    }
                    if (subId && action === 'run') {
                        const jobId = subId;
                        const jobIndex = DB.discoveryJobs.findIndex((j: any) => j.id === jobId);
                        if (jobIndex === -1) throw { status: 404 };
                        DB.discoveryJobs[jobIndex].status = 'running';
                        setTimeout(() => {
                            const idx = DB.discoveryJobs.findIndex((j: any) => j.id === jobId);
                            if (idx > -1) {
                                DB.discoveryJobs[idx].status = Math.random() > 0.2 ? 'success' : 'partial_failure';
                                DB.discoveryJobs[idx].last_run = new Date().toISOString();
                            }
                        }, 3000);
                        return { message: 'Run triggered.' };
                    }
                    const timestamp = new Date().toISOString();
                    const newJob: DiscoveryJob = {
                        ...body,
                        id: `dj-${uuidv4()}`,
                        last_run: 'N/A',
                        status: 'success',
                        kind: body?.kind || 'K8s',
                        target_config: body?.target_config || {},
                        exporter_binding: body?.exporter_binding || { template_id: 'node_exporter' },
                        edge_gateway: body?.edge_gateway || { enabled: false },
                        tags: body?.tags || [],
                        created_at: timestamp,
                        updated_at: timestamp,
                    };
                    DB.discoveryJobs.unshift(newJob);
                    return newJob;
                }
                if (id === 'import-discovered') {
                    const { discoveredResourceIds, jobId, deployAgent } = body;
                    discoveredResourceIds.forEach((resId: string) => {
                        const resIndex = DB.discoveredResources.findIndex((r: any) => r.id === resId);
                        if (resIndex > -1) {
                            DB.discoveredResources[resIndex].status = 'imported';
                            const newResource = {
                                id: `res-${uuidv4()}`,
                                name: DB.discoveredResources[resIndex].name,
                                status: 'healthy',
                                type: DB.discoveredResources[resIndex].type,
                                provider: 'Discovered',
                                region: 'N/A',
                                owner: 'Unassigned',
                                last_check_in: new Date().toISOString(),
                                discovered_by_job_id: jobId,
                                monitoring_agent: deployAgent ? 'node_exporter' : undefined
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
                    const timestamp = new Date().toISOString();
                    const newResource = {
                        ...body,
                        id: `res-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.resources.unshift(newResource);

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
                DB.resourceLinks.unshift(newLink);
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
                    const index = DB.discoveryJobs.findIndex((j: any) => j.id === jobId);
                    if (index === -1) throw { status: 404 };
                    const existingJob = DB.discoveryJobs[index];
                    // 更新 updated_at 時間戳
                    DB.discoveryJobs[index] = {
                        ...existingJob,
                        ...body,
                        target_config: body?.target_config || existingJob.target_config,
                        exporter_binding: body?.exporter_binding || existingJob.exporter_binding,
                        edge_gateway: body?.edge_gateway || existingJob.edge_gateway,
                        tags: Array.isArray(body?.tags) ? body.tags : existingJob.tags,
                        updated_at: new Date().toISOString(),
                    };
                    return DB.discoveryJobs[index];
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
                const linkIndex = DB.resourceLinks.findIndex((link: any) => link.id === id);
                if (linkIndex === -1) throw { status: 404 };
                // 更新 updated_at 時間戳
                DB.resourceLinks[linkIndex] = { ...DB.resourceLinks[linkIndex], ...body, updated_at: new Date().toISOString() };
                return DB.resourceLinks[linkIndex];
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
                    const index = DB.discoveryJobs.findIndex((j: any) => j.id === jobId);
                    if (index > -1) (DB.discoveryJobs[index] as any).deleted_at = new Date().toISOString();
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
                const linkIndex = DB.resourceLinks.findIndex((link: any) => link.id === id);
                if (linkIndex > -1) DB.resourceLinks[linkIndex].deleted_at = new Date().toISOString();
                return {};
            }

            case 'GET /resource-groups': {
                let groups = getActive(DB.resourceGroups);
                if (params?.sort_by && params?.sort_order) {
                    groups = sortData(groups, params.sort_by, params.sort_order);
                }
                return groups;
            }
            case 'POST /resource-groups':
                const timestamp = new Date().toISOString();
                const newGroup = {
                    ...body,
                    id: `rg-${uuidv4()}`,
                    created_at: timestamp,
                    updated_at: timestamp
                };
                DB.resourceGroups.unshift(newGroup);
                return newGroup;
            case 'PUT /resource-groups':
                const groupIndex = DB.resourceGroups.findIndex((g: any) => g.id === id);
                if (groupIndex === -1) throw { status: 404 };
                // 更新 updated_at 時間戳
                DB.resourceGroups[groupIndex] = { ...DB.resourceGroups[groupIndex], ...body, updated_at: new Date().toISOString() };
                return DB.resourceGroups[groupIndex];
            case 'DELETE /resource-groups':
                const delGroupIndex = DB.resourceGroups.findIndex((g: any) => g.id === id);
                if (delGroupIndex > -1) DB.resourceGroups[delGroupIndex].deleted_at = new Date().toISOString();
                return {};

            // Automation
            case 'GET /automation': {
                if (id === 'scripts') {
                    return getActive(DB.playbooks);
                }
                if (id === 'triggers') {
                    let triggers = getActive(DB.automationTriggers);
                    if (params?.keyword) {
                        triggers = triggers.filter((t: any) => t.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    }
                    return paginate(triggers, params?.page, params?.page_size);
                }
                if (id === 'executions') {
                    let executions = [...DB.automationExecutions];
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
                        DB.automationExecutions.unshift(newExec);
                        setTimeout(() => {
                            const index = DB.automationExecutions.findIndex((e: any) => e.id === newExec.id);
                            if (index > -1) {
                                DB.automationExecutions[index].status = 'success';
                                DB.automationExecutions[index].end_time = new Date().toISOString();
                                DB.automationExecutions[index].duration_ms = 3000;
                                DB.automationExecutions[index].logs.stdout += '\nExecution finished.';
                            }
                        }, 3000);
                        return newExec;
                    }
                    const timestamp = new Date().toISOString();
                    const newScript = {
                        ...body,
                        id: `play-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.playbooks.unshift(newScript);
                    return newScript;
                }
                if (id === 'executions' && action === 'retry') {
                    const executionId = subId;
                    if (!executionId) {
                        throw { status: 400, message: 'Execution ID is required to retry automation.' };
                    }
                    const executionIndex = DB.automationExecutions.findIndex((e: any) => e.id === executionId);
                    if (executionIndex === -1) throw { status: 404, message: 'Automation execution not found.' };
                    const originalExec = DB.automationExecutions[executionIndex];
                    const newExec = {
                        ...originalExec,
                        id: `exec-${uuidv4()}`,
                        status: 'pending',
                        start_time: new Date().toISOString(),
                        end_time: undefined,
                        duration_ms: undefined
                    };
                    DB.automationExecutions.unshift(newExec);
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
                        DB.automationTriggers.forEach((trigger: any) => {
                            if (!ids.includes(trigger.id)) return;
                            if (batchAction === 'enable') trigger.enabled = true;
                            if (batchAction === 'disable') trigger.enabled = false;
                            if (batchAction === 'delete') trigger.deleted_at = now;
                            updated += 1;
                        });
                        return { success: true, updated };
                    }
                    const timestamp = new Date().toISOString();
                    const newTrigger = {
                        ...body,
                        id: `trig-${uuidv4()}`,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.automationTriggers.unshift(newTrigger);
                    return newTrigger;
                }
                break;
            }
            case 'PATCH /automation': {
                if (id === 'scripts') {
                    const itemId = subId;
                    const index = DB.playbooks.findIndex((p: any) => p.id === itemId);
                    if (index === -1) throw { status: 404 };
                    // 更新 updated_at 時間戳
                    DB.playbooks[index] = { ...DB.playbooks[index], ...body, updated_at: new Date().toISOString() };
                    return DB.playbooks[index];
                }
                if (id === 'triggers') {
                    const itemId = subId;
                    const index = DB.automationTriggers.findIndex((t: any) => t.id === itemId);
                    if (index === -1) throw { status: 404 };
                    // 更新 updated_at 時間戳
                    DB.automationTriggers[index] = { ...DB.automationTriggers[index], ...body, updated_at: new Date().toISOString() };
                    return DB.automationTriggers[index];
                }
                break;
            }
            case 'DELETE /automation': {
                if (id === 'scripts') {
                    const itemId = subId;
                    const index = DB.playbooks.findIndex((item: any) => item.id === itemId);
                    if (index > -1) (DB.playbooks[index] as any).deleted_at = new Date().toISOString();
                    return {};
                }
                if (id === 'triggers') {
                    const itemId = subId;
                    const index = DB.automationTriggers.findIndex((item: any) => item.id === itemId);
                    if (index > -1) (DB.automationTriggers[index] as any).deleted_at = new Date().toISOString();
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
                if (id === 'permissions') return DB.availablePermissions;
                if (id === 'audit-logs') {
                    let logs = DB.auditLogs;
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
                        return newUser;
                    }
                }
                if (id === 'teams') {
                    if (subId === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') DB.teams.forEach((t: any) => { if (ids.includes(t.id)) t.deleted_at = new Date().toISOString(); });
                        return { success: true };
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
                    return newRole;
                }
                break;
            }
            case 'PATCH /iam': {
                const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
                const itemId = subId;
                const index = collection.findIndex((item: any) => item.id === itemId);
                if (index === -1) throw { status: 404 };
                const timestamp = new Date().toISOString();
                const baseUpdate = { ...collection[index], ...body };
                if ('updated_at' in baseUpdate) {
                    baseUpdate.updated_at = timestamp;
                }
                collection[index] = baseUpdate;
                return collection[index];
            }
            case 'DELETE /iam': {
                const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
                const itemId = subId;
                const index = collection.findIndex((item: any) => item.id === itemId);
                if (index > -1) (collection[index] as any).deleted_at = new Date().toISOString();
                return {};
            }

            // Analysis
            case 'GET /analysis': {
                if (id === 'overview') {
                    return DB.analysisOverviewData;
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
                        suggestions: DB.capacitySuggestions,
                        resource_analysis: DB.capacityResourceAnalysis,
                        options: {
                            timeRangeOptions: DB.capacityTimeOptions,
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
                return paginate(logs, params?.page, params?.page_size);
            }

            // Settings
            case 'GET /settings': {
                if (id === 'layouts') return DB.layouts;
                if (id === 'widgets') return DB.layoutWidgets;
                if (id === 'tags') {
                    let tags = DB.tagDefinitions;
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
                    const pageKey = subId as keyof typeof DB.columnConfigs;
                    return DB.columnConfigs[pageKey] || [];
                }
                if (id === 'notification-strategies') {
                    let strategies = getActive(DB.notificationStrategies);
                    if (params?.keyword) strategies = strategies.filter((s: any) => s.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params?.sort_by && params?.sort_order) {
                        strategies = sortData(strategies, params.sort_by, params.sort_order);
                    }
                    return strategies;
                }
                if (id === 'notification-channels') {
                    let channels = getActive(DB.notificationChannels);
                    if (params?.keyword) channels = channels.filter((c: any) => c.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params?.sort_by && params?.sort_order) {
                        channels = sortData(channels, params.sort_by, params.sort_order);
                    }
                    return channels;
                }
                if (id === 'notification-history') {
                    let history = DB.notificationHistory;
                    if (params?.sort_by && params?.sort_order) {
                        history = sortData(history, params.sort_by, params.sort_order);
                    }
                    return paginate(history, params?.page, params?.page_size);
                }
                if (id === 'mail') {
                    if (!DB.mailSettings.encryptionModes) {
                        DB.mailSettings.encryptionModes = ['none', 'tls', 'ssl'];
                    }
                    return DB.mailSettings;
                }
                if (id === 'auth') return DB.authSettings;
                if (id === 'platform') return DB.platformSettings;
                if (id === 'preferences' && subId === 'options') return DB.preferenceOptions;
                if (id === 'grafana') {
                    return DB.grafanaSettings;
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
                    const pageKey = subId as keyof typeof DB.columnConfigs;
                    DB.columnConfigs[pageKey] = body;
                    return DB.columnConfigs[pageKey];
                }
                if (id === 'mail') {
                    DB.mailSettings = { ...DB.mailSettings, ...body };
                    return DB.mailSettings;
                }
                if (id === 'grafana') {
                    DB.grafanaSettings = { ...DB.grafanaSettings, ...body };
                    return DB.grafanaSettings;
                }
                if (urlParts[1] === 'tags' && urlParts[3] === 'values') {
                    const tagId = urlParts[2];
                    const tagIndex = DB.tagDefinitions.findIndex((t: any) => t.id === tagId);
                    if (tagIndex === -1) {
                        throw { status: 404, message: '標籤不存在。' };
                    }
                    DB.tagDefinitions[tagIndex].allowed_values = Array.isArray(body) ? body : [];
                    return DB.tagDefinitions[tagIndex];
                }
                break;
            }
            case 'POST /settings': {
                if (id === 'tags') {
                    // 創建新標籤定義
                    if (!body.key || !body.scopes || !body.writable_roles) {
                        throw { status: 400, message: '缺少必要欄位。' };
                    }

                    // 檢查標籤鍵是否已存在
                    const existingTag = DB.tagDefinitions.find((t: any) => t.key === body.key);
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

                    DB.tagDefinitions.push(newTag);
                    return newTag;
                }
                if (urlParts[1] === 'notification-channels' && action === 'test') {
                    const channelId = subId;
                    const channel = DB.notificationChannels.find((c: any) => c.id === channelId);
                    if (!channel) {
                        throw { status: 404, message: 'Notification channel not found.' };
                    }
                    channel.last_test_result = 'success';
                    channel.last_tested_at = new Date().toISOString();
                    return { success: true, message: `測試通知已送出至「${channel.name}」。` };
                }
                if (urlParts[1] === 'notification-history' && action === 'resend') {
                    const recordId = subId;
                    const record = DB.notificationHistory.find((r: any) => r.id === recordId);
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
                    const fallbackOptions = DB.notificationStrategyOptions || { severity_levels: [], impact_levels: [] };
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
                    DB.notificationStrategies.unshift(newStrategy);
                    return newStrategy;
                }
                if (id === 'notification-channels') {
                    const timestamp = new Date().toISOString();
                    const newChannel = {
                        ...body,
                        id: `chan-${uuidv4()}`,
                        last_test_result: 'pending',
                        last_tested_at: timestamp,
                        created_at: timestamp,
                        updated_at: timestamp
                    };
                    DB.notificationChannels.unshift(newChannel);
                    return newChannel;
                }
                if (id === 'tags') {
                    const fallbackRoles = DB.allOptions?.tagManagement?.writable_roles || ['platform_admin'];
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

                    DB.tagDefinitions.unshift(payload);
                    return payload;
                }
                break;
            }
            case 'PATCH /settings': {
                const collectionId = urlParts[1];
                const itemId = urlParts[2];

                if (collectionId === 'notification-strategies') {
                    const index = DB.notificationStrategies.findIndex((s: any) => s.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existingStrategy = DB.notificationStrategies[index];
                    const severityLevels = Array.isArray(body?.severity_levels) && body?.severity_levels.length > 0
                        ? body.severity_levels
                        : existingStrategy.severity_levels;
                    const impactLevels = Array.isArray(body?.impact_levels) && body?.impact_levels.length > 0
                        ? body.impact_levels
                        : existingStrategy.impact_levels;

                    const timestamp = new Date().toISOString();
                    DB.notificationStrategies[index] = {
                        ...existingStrategy,
                        ...body,
                        severity_levels: severityLevels,
                        impact_levels: impactLevels,
                        last_updated: timestamp,
                        updated_at: timestamp
                    };
                    return DB.notificationStrategies[index];
                }
                if (collectionId === 'notification-channels') {
                    const index = DB.notificationChannels.findIndex((c: any) => c.id === itemId);
                    if (index === -1) throw { status: 404 };
                    // 更新 updated_at 時間戳
                    DB.notificationChannels[index] = { ...DB.notificationChannels[index], ...body, updated_at: new Date().toISOString() };
                    return DB.notificationChannels[index];
                }
                if (collectionId === 'tags') {
                    const index = DB.tagDefinitions.findIndex((t: any) => t.id === itemId);
                    if (index === -1) throw { status: 404 };
                    const existing = DB.tagDefinitions[index];
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

                    DB.tagDefinitions[index] = next;
                }
                break;
            }
            case 'DELETE /settings': {
                const collectionId = urlParts[1];
                const itemId = urlParts[2];

                if (collectionId === 'notification-strategies') {
                    const index = DB.notificationStrategies.findIndex((s: any) => s.id === itemId);
                    if (index > -1) (DB.notificationStrategies[index] as any).deleted_at = new Date().toISOString();
                    return {};
                }
                if (collectionId === 'notification-channels') {
                    const index = DB.notificationChannels.findIndex((c: any) => c.id === itemId);
                    if (index > -1) (DB.notificationChannels[index] as any).deleted_at = new Date().toISOString();
                    return {};
                }
                if (collectionId === 'tags') {
                    const index = DB.tagDefinitions.findIndex((t: any) => t.id === itemId);
                    if (index > -1) {
                        if (DB.tagDefinitions[index].system) {
                            throw { status: 400, message: '系統保留標籤不可刪除。' };
                        }
                        DB.tagDefinitions[index].deleted_at = new Date().toISOString();
                    }
                    return {};
                }
                break;
            }
            case 'GET /system': {
                if (id === 'config') {
                    return DB.systemConfig;
                }
                break;
            }
            case 'GET /config-versions': {
                let versions = getActive(DB.configVersions);
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
                return DB.kpiData;
            }
            case 'GET /notifications': {
                if (id === 'options') {
                    return DB.notificationOptions;
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
                DB.configVersions.unshift(newVersion);
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
