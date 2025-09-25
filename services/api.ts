import { DB, uuidv4 } from '../mock-server/db';
import { Dashboard } from '../types';
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

            // SRE War Room
            case 'GET /sre-war-room': {
                if (id === 'briefing') return DB.aiBriefing;
                break;
            }
            case 'POST /sre-war-room': {
                if (id === 'briefing' && action === 'generate') {
                    // In a real backend, this would trigger a new LLM call.
                    // Here, we just return the stored mock data.
                    return DB.aiBriefing;
                }
                break;
            }

            // Dashboards
            case 'GET /dashboards': {
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
                if (id === 'infrastructure-insights' && action === 'risk-prediction') {
                    return DB.aiRiskPrediction;
                }
                if (id) {
                    const dashboard = DB.dashboards.find((d: any) => d.id === id);
                    if (!dashboard) throw { status: 404 };
                    return dashboard;
                }
                let dashboards = getActive(DB.dashboards);
                if (params.category && params.category !== 'All') dashboards = dashboards.filter((d: any) => d.category === params.category);
                if (params.keyword) dashboards = dashboards.filter((d: any) => d.name.toLowerCase().includes(params.keyword.toLowerCase()));
                return paginate(dashboards, params.page, params.page_size);
            }
            case 'POST /dashboards':
                if (id === 'batch-actions') {
                    const { action, ids } = body;
                    if (action === 'delete') DB.dashboards.forEach((d: any) => { if (ids.includes(d.id)) d.deleted_at = new Date().toISOString(); });
                    return { success: true };
                }
                const newDashboard = { ...body, id: `db-${uuidv4()}` };
                DB.dashboards.unshift(newDashboard);
                return newDashboard;
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
            case 'GET /events': {
                if (id) {
                    const incident = DB.incidents.find((i: any) => i.id === id);
                    if (!incident) throw { status: 404 };
                    return incident;
                }
                return paginate(DB.incidents, params.page, params.page_size);
            }
            case 'POST /events': {
                if (id === 'ai-analysis') {
                    const { incident_ids } = body;
                    if (incident_ids.length > 1) {
                        return DB.multiIncidentAnalysis;
                    }
                    return DB.singleIncidentAnalysis;
                }
                if (action === 'actions') {
                    const { action: eventAction } = body;
                    const index = DB.incidents.findIndex((i: any) => i.id === id);
                    if (index === -1) throw { status: 404 };
                    if (eventAction === 'acknowledge') DB.incidents[index].status = 'acknowledged';
                    if (eventAction === 'resolve') DB.incidents[index].status = 'resolved';
                    return DB.incidents[index];
                }
                break;
            }
            
            case 'GET /alert-rules':
                if (id === 'templates') return DB.alertRuleTemplates;
                return DB.alertRules;
            case 'POST /alert-rules':
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
            
            case 'GET /silence-rules': 
                if (id === 'templates') return DB.silenceRuleTemplates;
                return DB.silenceRules;
            case 'POST /silence-rules':
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
                if (id === 'topology') return { nodes: getActive(DB.resources), links: DB.resourceLinks };
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
                if (params.bookmarked) resources = resources.slice(0, 4);
                return paginate(resources, params.page, params.page_size);
            }
            case 'POST /resources':
                if (id === 'batch-actions') {
                     const { action: batchAction, ids } = body;
                    if (batchAction === 'delete') DB.resources.forEach((r: any) => { if (ids.includes(r.id)) r.deleted_at = new Date().toISOString(); });
                    return { success: true };
                } else {
                     const newResource = { ...body, id: `res-${uuidv4()}` };
                     DB.resources.unshift(newResource);
                     return newResource;
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
                if (id === 'scripts') return getActive(DB.playbooks);
                if (id === 'triggers') return getActive(DB.automationTriggers);
                if (id === 'executions') return paginate(DB.automationExecutions, params.page, params.page_size);
                break;
            }
             case 'POST /automation': {
                if (id === 'scripts') {
                    if (action === 'generate-with-ai') {
                        return DB.generatedPlaybook;
                    }
                    if (action === 'execute') {
                        const scriptId = urlParts[2];
                        const script = DB.playbooks.find((p: any) => p.id === scriptId);
                        if (!script) throw { status: 404 };
                        const newExec = { id: `exec-${uuidv4()}`, scriptId, scriptName: script.name, status: 'success', triggerSource: 'manual', triggeredBy: 'Admin User', startTime: new Date().toISOString(), durationMs: Math.random() * 5000, parameters: body.parameters, logs: { stdout: 'Mock execution successful.', stderr: '' } };
                        DB.automationExecutions.unshift(newExec);
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
                    let users = getActive(DB.users);
                    if (params.keyword) users = users.filter((u: any) => u.name.toLowerCase().includes(params.keyword.toLowerCase()) || u.email.toLowerCase().includes(params.keyword.toLowerCase()));
                    return paginate(users, params.page, params.page_size);
                }
                if (id === 'teams') return getActive(DB.teams);
                if (id === 'roles') return getActive(DB.roles);
                if (id === 'permissions') return DB.availablePermissions;
                if (id === 'audit-logs') return paginate(DB.auditLogs, params.page, params.page_size);
                break;
            }
            case 'POST /iam': {
                if (id === 'users') {
                    if (action === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') DB.users.forEach((u: any) => { if (ids.includes(u.id)) u.deleted_at = new Date().toISOString(); });
                        if (batchAction === 'disable') DB.users.forEach((u: any) => { if (ids.includes(u.id)) u.status = 'inactive'; });
                        return { success: true };
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
                if (id === 'ai-insights') {
                    if (action === 'health-score') return DB.aiHealthScore;
                    if (action === 'anomalies') return DB.aiAnomalies;
                    if (action === 'suggestions') return DB.aiSuggestions;
                }
                break;
            }
            case 'GET /logs': return paginate(DB.logs, params.page, params.page_size);
            case 'GET /traces': return DB.traces;

            // Settings
            case 'GET /settings': {
                if (id === 'layouts') return DB.layouts;
                if (id === 'widgets') return DB.layoutWidgets;
                if (id === 'tags') {
                    if (action === 'options') return { categories: DB.tagCategories };
                    return DB.tagDefinitions;
                }
                if (id === 'notification-strategies') return DB.notificationStrategies;
                if (id === 'notification-channels') return DB.notificationChannels;
                if (id === 'notification-history') return paginate(DB.notificationHistory, params.page, params.page_size);
                if (id === 'mail') return DB.mailSettings;
                if (id === 'auth') return DB.authSettings;
                break;
            }
            case 'PUT /settings': {
                if (id === 'layouts') {
                    DB.layouts = body;
                    return DB.layouts;
                }
                if (id === 'mail') {
                    DB.mailSettings = { ...DB.mailSettings, ...body };
                    return DB.mailSettings;
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
                break;
            }
            case 'GET /kpi-data': {
                return DB.kpiData;
            }
             case 'GET /notifications': {
                return DB.notifications;
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
            showToast(`GET ${url.split('?')[0]} failed!`);
            throw err;
        }
    },
    post: async <T>(url: string, body?: any): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('POST', url, null, body);
            return { data };
        } catch (err: any) {
            showToast(`POST ${url.split('?')[0]} failed!`);
            throw err;
        }
    },
    put: async <T>(url: string, body: any): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('PUT', url, null, body);
            return { data };
        } catch (err: any) {
            showToast(`PUT ${url.split('?')[0]} failed!`);
            throw err;
        }
    },
    patch: async <T>(url: string, body: any): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('PATCH', url, null, body);
            return { data };
        } catch (err: any) {
            showToast(`PATCH ${url.split('?')[0]} failed!`);
            throw err;
        }
    },
    del: async <T>(url: string): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('DELETE', url, null, null);
            return { data };
        } catch (err: any) {
            showToast(`DELETE ${url.split('?')[0]} failed!`);
            throw err;
        }
    }
};

export default api;
