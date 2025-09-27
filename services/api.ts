import { DB, uuidv4 } from '../mock-server/db';
import { AutomationExecution, Dashboard, GrafanaOptions } from '../types';
import { showToast } from './toast';

const getActive = (collection: any[] | undefined) => {
    // Safety check to prevent crashes if a collection is unexpectedly undefined.
    if (!collection) {
        console.error("API handler tried to access a non-existent data collection.");
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

const handleRequest = async (method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, params: any, body: any) => {
    try {
        console.log(`[Mock API] ${method} ${url}`, { params, body });
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200)); // Simulate latency

        const urlParts = url.split('?')[0].split('/').filter(Boolean);
        const resource = urlParts[0];
        const id = urlParts[1];
        const action = urlParts[2];
        const subAction = urlParts[3];

        switch (`${method} /${resource}`) {
            // Navigation
            case 'GET /navigation': {
                return DB.navItems;
            }
            // Page Metadata
            case 'GET /pages': {
                if (id === 'metadata') {
                    return DB.pageMetadata;
                }
                break;
            }
            // UI Configs
            case 'GET /ui': {
                if (id === 'icons') return DB.iconMap;
                if (id === 'themes' && action === 'charts') return DB.chartColors;
                if (id === 'tabs') return DB.tabConfigs;
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
                    localStorage.setItem('default-dashboard', body.defaultPage);
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
                if (id === 'infra' && action === 'risk-prediction') return DB.aiRiskPrediction;
                if (id === 'insights') {
                    if (action === 'health-score') return DB.aiHealthScore;
                    if (action === 'anomalies') return DB.aiAnomalies;
                    if (action === 'suggestions') return DB.aiSuggestions;
                }
                break;
            }
            case 'POST /ai': {
                if (id === 'briefing' && action === 'generate') return DB.aiBriefing;
                if (id === 'incidents' && action === 'analyze') {
                    const { incident_ids } = body;
                    return incident_ids.length > 1 ? DB.multiIncidentAnalysis : DB.singleIncidentAnalysis;
                }
                if (id === 'automation' && action === 'generate-script') return DB.generatedPlaybook;
                if (id === 'logs' && action === 'summarize') {
                    return DB.logAnalysis;
                }
                if (id === 'traces' && action === 'analyze') {
                    return DB.traceAnalysis;
                }
                break;
            }
            
            // Dashboards
            case 'GET /dashboards': {
                 if (id === 'sre-war-room') {
                    if (action === 'service-health') return DB.serviceHealthData;
                    if (action === 'resource-group-status') return DB.resourceGroupStatusData;
                }
                if (id === 'infrastructure-insights' && action === 'options') {
                    return { timeOptions: DB.grafanaOptions.timeOptions };
                }
                if (id === 'available-grafana') {
                    const linkedUids = getActive(DB.dashboards).filter((d: any) => d.type === 'grafana' && d.grafana_dashboard_uid).map((d: any) => d.grafana_dashboard_uid);
                    return DB.availableGrafanaDashboards.filter((d: any) => !linkedUids.includes(d.uid));
                }
                if (id === 'options') {
                     const categories = [...new Set(DB.dashboards.map((d: any) => d.category))];
                     const owners = [...new Set(DB.teams.map((t: any) => t.name))];
                     return { categories, owners };
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
                DB.dashboards.unshift(newDashboardData);
                return newDashboardData;
            }
            case 'PATCH /dashboards': {
                const index = DB.dashboards.findIndex((d: any) => d.id === id);
                if (index === -1) throw { status: 404 };
                DB.dashboards[index] = { ...DB.dashboards[index], ...body, updatedAt: new Date().toISOString() };
                return DB.dashboards[index];
            }
            case 'DELETE /dashboards': {
                const index = DB.dashboards.findIndex((d: any) => d.id === id);
                if (index > -1) DB.dashboards[index].deleted_at = new Date().toISOString();
                return {};
            }

            // Incidents, Rules, Silences
            case 'GET /incidents': {
                if (id === 'options') {
                    return { quickSilenceDurations: DB.quickSilenceDurations };
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
                return paginate(incidents, params?.page, params?.page_size);
            }
            case 'POST /incidents': {
                if (id === 'import') {
                    return { message: '成功匯入 12 筆事件。' };
                }
                if (action === 'actions') {
                    const { action: incidentAction } = body;
                    const index = DB.incidents.findIndex((i: any) => i.id === id);
                    if (index === -1) throw { status: 404 };
                    if (incidentAction === 'acknowledge') DB.incidents[index].status = 'acknowledged';
                    if (incidentAction === 'resolve') DB.incidents[index].status = 'resolved';
                    return DB.incidents[index];
                }
                break;
            }
            
            case 'GET /alert-rules': {
                if (id === 'templates') return DB.alertRuleTemplates;
                let rules = getActive(DB.alertRules);
                if (params) {
                    if (params.keyword) rules = rules.filter((r: any) => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params.severity) rules = rules.filter((r: any) => r.severity === params.severity);
                    if (params.enabled !== undefined) rules = rules.filter((r: any) => String(r.enabled) === params.enabled);
                }
                return rules;
            }
            case 'POST /alert-rules':
                if (id === 'import') {
                    return { message: '成功匯入 8 條告警規則。' };
                }
                if (action === 'test') {
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
                const newRule = { ...body, id: `rule-${uuidv4()}` };
                DB.alertRules.unshift(newRule);
                return newRule;
            case 'PATCH /alert-rules':
                const ruleIndex = DB.alertRules.findIndex((r: any) => r.id === id);
                if (ruleIndex === -1) throw { status: 404 };
                DB.alertRules[ruleIndex] = { ...DB.alertRules[ruleIndex], ...body };
                return DB.alertRules[ruleIndex];
            case 'DELETE /alert-rules':
                DB.alertRules = DB.alertRules.filter((r: any) => r.id !== id);
                return {};
            
            case 'GET /silence-rules': {
                if (id === 'templates') return DB.silenceRuleTemplates;
                if (id === 'options') return DB.silenceRuleOptions;
                let rules = getActive(DB.silenceRules);
                if (params) {
                    if (params.keyword) rules = rules.filter((r: any) => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    if (params.type) rules = rules.filter((r: any) => r.type === params.type);
                    if (params.enabled !== undefined) rules = rules.filter((r: any) => String(r.enabled) === params.enabled);
                }
                return rules;
            }
            case 'POST /silence-rules':
                if (id === 'import') {
                    return { message: '成功匯入 3 條靜音規則。' };
                }
                const newSilenceRule = { ...body, id: `sil-${uuidv4()}` };
                DB.silenceRules.unshift(newSilenceRule);
                return newSilenceRule;
            case 'PATCH /silence-rules':
                const silenceIndex = DB.silenceRules.findIndex((r: any) => r.id === id);
                if (silenceIndex === -1) throw { status: 404 };
                DB.silenceRules[silenceIndex] = { ...DB.silenceRules[silenceIndex], ...body };
                return DB.silenceRules[silenceIndex];
            case 'DELETE /silence-rules':
                DB.silenceRules = DB.silenceRules.filter((r: any) => r.id !== id);
                return {};

            // Resources
            case 'GET /resources': {
                if (id === 'options') {
                    return { 
                        types: [...new Set(DB.resources.map((r: any) => r.type))],
                        providers: [...new Set(DB.resources.map((r: any) => r.provider))],
                        regions: [...new Set(DB.resources.map((r: any) => r.region))],
                        owners: [...new Set(DB.resources.map((r: any) => r.owner))],
                    };
                }
                if (id === 'topology') {
                    if (action === 'options') return { layouts: [{value: 'force', label: 'Force Directed'}, {value: 'circular', label: 'Circular'}] };
                    return { nodes: getActive(DB.resources), links: DB.resourceLinks };
                }
                if (id && action === 'metrics') {
                    const generateMetricData = (base: number, variance: number): [string, number][] => Array.from({ length: 30 }, (_, i) => [new Date(Date.now() - (29 - i) * 60000).toISOString(), Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance))]);
                    return { cpu: generateMetricData(50, 20), memory: generateMetricData(60, 15) };
                }
                if (id) {
                    const resourceItem = DB.resources.find((r: any) => r.id === id);
                    if (!resourceItem) throw { status: 404 };
                    return resourceItem;
                }
                let resources = getActive(DB.resources);
                if (params?.bookmarked) resources = resources.slice(0, 4);
                return paginate(resources, params?.page, params?.page_size);
            }
            case 'POST /resources': {
                if (id && action === 'silence') {
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
                     const newResource = { ...body, id: `res-${uuidv4()}` };
                     DB.resources.unshift(newResource);
                     return newResource;
                }
            }
            case 'PATCH /resources':
                const resIndex = DB.resources.findIndex((r: any) => r.id === id);
                if (resIndex === -1) throw { status: 404 };
                DB.resources[resIndex] = { ...DB.resources[resIndex], ...body };
                return DB.resources[resIndex];
            case 'DELETE /resources':
                 const delResIndex = DB.resources.findIndex((r: any) => r.id === id);
                 if (delResIndex > -1) DB.resources[delResIndex].deleted_at = new Date().toISOString();
                 return {};
            
            case 'GET /resource-groups': return getActive(DB.resourceGroups);
            case 'POST /resource-groups':
                const newGroup = { ...body, id: `rg-${uuidv4()}` };
                DB.resourceGroups.unshift(newGroup);
                return newGroup;
            case 'PUT /resource-groups':
                const groupIndex = DB.resourceGroups.findIndex((g: any) => g.id === id);
                if (groupIndex === -1) throw { status: 404 };
                DB.resourceGroups[groupIndex] = { ...DB.resourceGroups[groupIndex], ...body };
                return DB.resourceGroups[groupIndex];
            case 'DELETE /resource-groups':
                const delGroupIndex = DB.resourceGroups.findIndex((g: any) => g.id === id);
                if (delGroupIndex > -1) DB.resourceGroups[delGroupIndex].deleted_at = new Date().toISOString();
                return {};

            // Automation
            case 'GET /automation': {
                if (id === 'scripts') {
                    if (action === 'options') {
                         return { 
                            playbookTypes: [{value: 'shell', label: 'Shell'}, {value: 'python', label: 'Python'}],
                            parameterTypes: [{value: 'string', label: 'String'}, {value: 'number', label: 'Number'}]
                        };
                    }
                    return getActive(DB.playbooks);
                }
                if (id === 'triggers') {
                    if (action === 'options') {
                        return { triggerTypes: [{value: 'Schedule', label: 'Schedule'}, {value: 'Webhook', label: 'Webhook'}], conditionKeys: ['severity'] };
                    }
                    let triggers = getActive(DB.automationTriggers);
                    if (params && params.keyword) triggers = triggers.filter((t: any) => t.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    return triggers;
                }
                if (id === 'executions') {
                    if (action === 'options') {
                        return { statuses: [{value: 'success', label: 'Success'}, {value: 'failed', label: 'Failed'}]};
                    }
                    let executions = [...DB.automationExecutions];
                    if (params) {
                        if (params.playbookId) executions = executions.filter((e: any) => e.scriptId === params.playbookId);
                        if (params.status) executions = executions.filter((e: any) => e.status === params.status);
                    }
                    if (params?.sort_by) {
                        const { sort_by, sort_order } = params;
                        executions.sort((a, b) => {
                            const key = sort_by as keyof AutomationExecution;
                            const valA = a[key];
                            const valB = b[key];
                            
                            if (valA === undefined || valA === null) return 1;
                            if (valB === undefined || valB === null) return -1;
                    
                            if (valA < valB) return sort_order === 'asc' ? -1 : 1;
                            if (valA > valB) return sort_order === 'asc' ? 1 : -1;
                            return 0;
                        });
                    }
                    return paginate(executions, params?.page, params?.page_size);
                }
                break;
            }
             case 'POST /automation': {
                if (id === 'scripts') {
                    if (action === 'execute') {
                        const scriptId = urlParts[2];
                        const script = DB.playbooks.find((p: any) => p.id === scriptId);
                        if (!script) throw { status: 404 };
                        const newExec = { id: `exec-${uuidv4()}`, scriptId, scriptName: script.name, status: 'running', triggerSource: 'manual', triggeredBy: 'Admin User', startTime: new Date().toISOString(), parameters: body.parameters, logs: { stdout: 'Execution started...', stderr: '' } };
                        DB.automationExecutions.unshift(newExec);
                        setTimeout(() => { const index = DB.automationExecutions.findIndex(e => e.id === newExec.id); if (index > -1) { DB.automationExecutions[index].status = 'success'; DB.automationExecutions[index].endTime = new Date().toISOString(); DB.automationExecutions[index].durationMs = 3000; DB.automationExecutions[index].logs.stdout += '\nExecution finished.'; }}, 3000);
                        return newExec;
                    }
                    const newScript = { ...body, id: `play-${uuidv4()}` };
                    DB.playbooks.unshift(newScript);
                    return newScript;
                }
                if (id === 'triggers') {
                    const newTrigger = { ...body, id: `trig-${uuidv4()}` };
                    DB.automationTriggers.unshift(newTrigger);
                    return newTrigger;
                }
                if (id === 'executions' && action === 'retry') {
                    const executionId = urlParts[2];
                    const executionIndex = DB.automationExecutions.findIndex((e: any) => e.id === executionId);
                    if (executionIndex === -1) throw { status: 404 };
                    const originalExec = DB.automationExecutions[executionIndex];
                    const newExec = { ...originalExec, id: `exec-${uuidv4()}`, status: 'pending', startTime: new Date().toISOString(), endTime: undefined, durationMs: undefined };
                    DB.automationExecutions.unshift(newExec);
                    return newExec;
                }
                break;
            }
            case 'PATCH /automation': { 
                const collection = id === 'scripts' ? DB.playbooks : DB.automationTriggers;
                const itemId = urlParts[2];
                const index = collection.findIndex((p: any) => p.id === itemId);
                if (index === -1) throw { status: 404 };
                collection[index] = { ...collection[index], ...body };
                return collection[index];
            }
            case 'DELETE /automation': {
                const collection = id === 'scripts' ? DB.playbooks : DB.automationTriggers;
                const itemId = urlParts[2];
                const index = collection.findIndex((item: any) => item.id === itemId);
                if (index > -1) collection[index].deleted_at = new Date().toISOString();
                return {};
            }


            // IAM
            case 'GET /iam': {
                if (id === 'users') {
                    if(action === 'options') {
                        return { statuses: DB.userStatuses };
                    }
                    let users = getActive(DB.users);
                    if (params && params.keyword) users = users.filter((u: any) => u.name.toLowerCase().includes(params.keyword.toLowerCase()) || u.email.toLowerCase().includes(params.keyword.toLowerCase()));
                    return paginate(users, params?.page, params?.page_size);
                }
                if (id === 'teams') return getActive(DB.teams);
                if (id === 'roles') return getActive(DB.roles);
                if (id === 'permissions') return DB.availablePermissions;
                if (id === 'audit-logs') return paginate(DB.auditLogs, params?.page, params?.page_size);
                break;
            }
            case 'POST /iam': {
                if (id === 'users') {
                    if (action === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') DB.users.forEach((u: any) => { if (ids.includes(u.id)) u.deleted_at = new Date().toISOString(); });
                        if (batchAction === 'disable') DB.users.forEach((u: any) => { if (ids.includes(u.id)) u.status = 'inactive'; });
                        return { success: true };
                    }
                    if (action === 'import') {
                        return { message: '成功匯入 25 位人員。' };
                    } else {
                        const newUser = { ...body, id: `usr-${uuidv4()}`, status: 'invited', lastLogin: 'N/A' };
                        DB.users.unshift(newUser);
                        return newUser;
                    }
                }
                if (id === 'teams') {
                    const newTeam = { ...body, id: `team-${uuidv4()}` };
                    DB.teams.unshift(newTeam);
                    return newTeam;
                }
                if (id === 'roles') {
                    const newRole = { ...body, id: `role-${uuidv4()}` };
                    DB.roles.unshift(newRole);
                    return newRole;
                }
                break;
            }
            case 'PATCH /iam': {
                const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
                const itemId = urlParts[2];
                const index = collection.findIndex((item: any) => item.id === itemId);
                if (index === -1) throw { status: 404 };
                collection[index] = { ...collection[index], ...body };
                return collection[index];
            }
            case 'DELETE /iam': {
                const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
                const itemId = urlParts[2];
                const index = collection.findIndex((item: any) => item.id === itemId);
                if (index > -1) collection[index].deleted_at = new Date().toISOString();
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
                if (id === 'options') {
                    return { timeRangeOptions: DB.logTimeOptions };
                }
                return paginate(DB.logs, params?.page, params?.page_size);
            }
            case 'GET /traces': return DB.traces;

            // Settings
            case 'GET /settings': {
                if (id === 'layouts') return DB.layouts;
                if (id === 'widgets') return DB.layoutWidgets;
                if (id === 'tags') {
                    if (action === 'options') return { categories: DB.tagCategories };
                    return DB.tagDefinitions;
                }
                if (id === 'column-config') {
                    const pageKey = action as keyof typeof DB.columnConfigs;
                    return DB.columnConfigs[pageKey] || [];
                }
                if (id === 'notification-strategies') {
                    if (action === 'options') {
                        const options = JSON.parse(JSON.stringify(DB.notificationStrategyOptions));
                        options.tagKeys = DB.tagDefinitions.map((t: any) => t.key);
                        options.tagValues = {};
                        DB.tagDefinitions.forEach((t: any) => {
                            if (t.allowedValues.length > 0) {
                                (options.tagValues as any)[t.key] = t.allowedValues.map((v: any) => v.value);
                            }
                        });
                        return options;
                    }
                    let strategies = getActive(DB.notificationStrategies);
                    if (params?.keyword) strategies = strategies.filter((s: any) => s.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    return strategies;
                }
                if (id === 'notification-channels') {
                    let channels = getActive(DB.notificationChannels);
                    if (params?.keyword) channels = channels.filter((c: any) => c.name.toLowerCase().includes(params.keyword.toLowerCase()));
                    return channels;
                }
                if (id === 'notification-history') {
                    if (action === 'options') {
                        return { 
                            statuses: [{value: 'success', label: 'Success'}, {value: 'failed', label: 'Failed'}],
                            channelTypes: [{value: 'Email', label: 'Email'}, {value: 'Slack', label: 'Slack'}, {value: 'Webhook', label: 'Webhook'}]
                        };
                    }
                    return paginate(DB.notificationHistory, params?.page, params?.page_size);
                }
                if (id === 'mail') {
                    if (!DB.mailSettings.encryptionModes) {
                        DB.mailSettings.encryptionModes = ['none', 'tls', 'ssl'];
                    }
                    return DB.mailSettings;
                }
                if (id === 'auth') return DB.authSettings;
                if (id === 'platform') return DB.platformSettings;
                if (id === 'preferences' && action === 'options') return DB.preferenceOptions;
                if (id === 'grafana') {
                    if (action === 'options') {
                        return DB.grafanaOptions as GrafanaOptions;
                    }
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
                            existingLayout.widgetIds = newLayouts[key].widgetIds;
                            existingLayout.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            existingLayout.updatedBy = 'Admin User';
                        }
                    });
                    return DB.layouts;
                }
                if (id === 'column-config') {
                    const pageKey = action as keyof typeof DB.columnConfigs;
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
                    if (tagIndex > -1) DB.tagDefinitions[tagIndex].allowedValues = body;
                    return DB.tagDefinitions[tagIndex];
                }
                break;
            }
             case 'POST /settings': {
                if (urlParts[1] === 'notification-channels' && action === 'test') {
                    return { success: true, message: 'Test initiated.' };
                }
                if (urlParts[1] === 'notification-history' && action === 'resend') {
                    return { success: true };
                }
                if (id === 'mail' && action === 'test') {
                    return { success: true, message: 'Test email sent successfully.' };
                }
                if (id === 'grafana' && action === 'test') {
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
                    const newStrategy = { ...body, id: `strat-${uuidv4()}`, lastUpdated: new Date().toISOString(), creator: 'Admin User' };
                    DB.notificationStrategies.unshift(newStrategy);
                    return newStrategy;
                }
                if (id === 'notification-channels') {
                    const newChannel = { ...body, id: `chan-${uuidv4()}`, lastTestResult: 'pending', lastTestedAt: new Date().toISOString() };
                    DB.notificationChannels.unshift(newChannel);
                    return newChannel;
                }
                if (id === 'tags') {
                    const newTag = { ...body, id: `tag-${uuidv4()}`, allowedValues: [], usageCount: 0 };
                    DB.tagDefinitions.unshift(newTag);
                    return newTag;
                }
                break;
            }
            case 'PATCH /settings': {
                const collectionId = urlParts[1];
                const itemId = urlParts[2];

                if (collectionId === 'notification-strategies') {
                    const index = DB.notificationStrategies.findIndex((s: any) => s.id === itemId);
                    if (index === -1) throw { status: 404 };
                    DB.notificationStrategies[index] = { ...DB.notificationStrategies[index], ...body, lastUpdated: new Date().toISOString() };
                    return DB.notificationStrategies[index];
                }
                if (collectionId === 'notification-channels') {
                    const index = DB.notificationChannels.findIndex((c: any) => c.id === itemId);
                    if (index === -1) throw { status: 404 };
                    DB.notificationChannels[index] = { ...DB.notificationChannels[index], ...body };
                    return DB.notificationChannels[index];
                }
                if (collectionId === 'tags') {
                    const index = DB.tagDefinitions.findIndex((t: any) => t.id === itemId);
                    if (index === -1) throw { status: 404 };
                    DB.tagDefinitions[index] = { ...DB.tagDefinitions[index], ...body };
                    return DB.tagDefinitions[index];
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
                    if (index > -1) DB.tagDefinitions.splice(index, 1);
                    return {};
                }
                break;
            }
            case 'GET /kpi-data': {
                return DB.kpiData;
            }
             case 'GET /notifications': {
                return DB.notifications;
            }
            case 'POST /notifications': {
                if (id === 'read-all') {
                    DB.notifications.forEach((n: any) => n.status = 'read');
                    return { success: true };
                }
                if (id && action === 'read') {
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
        console.error(`[Mock ${method} Error] ${url.split('?')[0]}`, e.message);
        throw e;
    }

    throw { status: 404, message: `[Mock] Endpoint Not Found: ${method} ${url}` };
};

const api = {
    get: async <T>(url: string, config?: { params: any }): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('GET', url, config?.params, null);
            return { data };
        } catch (err: any) {
            console.error(`[API GET Error] ${url}`, err);
            throw err;
        }
    },
    post: async <T>(url: string, body?: any): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('POST', url, null, body);
            return { data };
        } catch (err: any) {
            console.error(`[API POST Error] ${url}`, err);
            throw err;
        }
    },
    put: async <T>(url: string, body: any): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('PUT', url, null, body);
            return { data };
        } catch (err: any) {
            console.error(`[API PUT Error] ${url}`, err);
            throw err;
        }
    },
    patch: async <T>(url: string, body: any): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('PATCH', url, null, body);
            return { data };
        } catch (err: any) {
            console.error(`[API PATCH Error] ${url}`, err);
            throw err;
        }
    },
    del: async <T>(url: string): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('DELETE', url, null, null);
            return { data };
        } catch (err: any) {
            console.error(`[API DELETE Error] ${url}`, err);
            throw err;
        }
    }
};

export default api;