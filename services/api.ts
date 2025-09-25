import DB, { initializeDatabase, uuidv4 } from '../mock-server/db';
import { Dashboard } from '../types';
import { showToast } from './toast';

// Initialize the DB on first load. It will be reset on page refresh.
initializeDatabase();

const getActive = (collection: any[]) => collection.filter(item => !item.deleted_at);

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
    console.log(`[Mock API] ${method} ${url}`, { params, body });
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200)); // Simulate latency

    const urlParts = url.split('?')[0].split('/').filter(Boolean);
    const resource = urlParts[0];
    const id = urlParts[1];
    const action = urlParts[2];

    switch (`${method} /${resource}`) {
        // Me / Profile
        case 'GET /me': {
            if (id === 'login-history') {
                return paginate(DB.loginHistory, params.page, params.page_size);
            }
            if (id === 'preferences') {
                return DB.userPreferences;
            }
            // Default to /me
            return DB.users[0];
        }
        case 'PUT /me': {
            if (id === 'preferences') {
                DB.userPreferences = { ...DB.userPreferences, ...body };
                return DB.userPreferences;
            }
            break;
        }

        // SRE War Room
        case 'GET /sre-war-room': {
            if (id === 'briefing') {
                return DB.aiBriefing;
            }
            break;
        }
        case 'POST /sre-war-room': {
            if (id === 'briefing') {
                DB.aiBriefing = body; // Update the in-memory briefing
                return DB.aiBriefing;
            }
            break;
        }

        // Dashboards
        case 'GET /dashboards': {
            let dashboards = getActive(DB.dashboards);
            if (params.category && params.category !== 'All') dashboards = dashboards.filter(d => d.category === params.category);
            if (params.keyword) dashboards = dashboards.filter(d => d.name.toLowerCase().includes(params.keyword.toLowerCase()));
            return paginate(dashboards, params.page, params.page_size);
        }
        case 'POST /dashboards':
            if (id === 'batch-actions') {
                const { action, ids } = body;
                if (action === 'delete') DB.dashboards.forEach(d => { if (ids.includes(d.id)) d.deleted_at = new Date().toISOString(); });
                return { success: true };
            }
            const newDashboard = { ...body, id: `db-${uuidv4()}` };
            DB.dashboards.unshift(newDashboard);
            return newDashboard;
        case 'PATCH /dashboards': {
            const index = DB.dashboards.findIndex(d => d.id === id);
            if (index === -1) throw { status: 404 };
            DB.dashboards[index] = { ...DB.dashboards[index], ...body, updatedAt: new Date().toISOString() };
            return DB.dashboards[index];
        }
        case 'DELETE /dashboards': {
            const index = DB.dashboards.findIndex(d => d.id === id);
            if (index > -1) DB.dashboards[index].deleted_at = new Date().toISOString();
            return {};
        }

        // Incidents
        case 'GET /events': {
            if (id) {
                const incident = DB.incidents.find(i => i.id === id);
                if (!incident) throw { status: 404 };
                return incident;
            }
            let incidents = DB.incidents;
            if (params.keyword) incidents = incidents.filter(i => i.summary.toLowerCase().includes(params.keyword.toLowerCase()) || i.resource.toLowerCase().includes(params.keyword.toLowerCase()));
            if (params.status) incidents = incidents.filter(i => i.status === params.status);
            if (params.severity) incidents = incidents.filter(i => i.severity === params.severity);
            return paginate(incidents, params.page, params.page_size);
        }
        case 'POST /events': {
            if (action === 'actions') {
                const { action: eventAction } = body;
                const index = DB.incidents.findIndex(i => i.id === id);
                if (index === -1) throw { status: 404 };
                if (eventAction === 'acknowledge') DB.incidents[index].status = 'acknowledged';
                if (eventAction === 'resolve') DB.incidents[index].status = 'resolved';
                return DB.incidents[index];
            }
            break;
        }
        
        // Rules
        case 'GET /alert-rules': return DB.alertRules;
        case 'POST /alert-rules': {
            if (id === 'batch-actions') {
                const { action, ids } = body;
                DB.alertRules.forEach(rule => {
                    if (ids.includes(rule.id)) {
                        if (action === 'enable') rule.enabled = true;
                        if (action === 'disable') rule.enabled = false;
                    }
                });
                if (action === 'delete') DB.alertRules = DB.alertRules.filter(r => !ids.includes(r.id));
                return { success: true };
            }
            const newRule = { ...body, id: `rule-${uuidv4()}` };
            DB.alertRules.unshift(newRule);
            return newRule;
        }
        case 'PATCH /alert-rules': {
            const index = DB.alertRules.findIndex(r => r.id === id);
            if (index === -1) throw { status: 404 };
            DB.alertRules[index] = { ...DB.alertRules[index], ...body };
            return DB.alertRules[index];
        }
        case 'DELETE /alert-rules': {
            DB.alertRules = DB.alertRules.filter(r => r.id !== id);
            return {};
        }

        // Silence Rules
        case 'GET /silence-rules': return DB.silenceRules;
        case 'POST /silence-rules': {
            if (id === 'batch-actions') {
                const { action, ids } = body;
                DB.silenceRules.forEach(rule => {
                    if (ids.includes(rule.id)) {
                        if (action === 'enable') rule.enabled = true;
                        if (action === 'disable') rule.enabled = false;
                    }
                });
                if (action === 'delete') DB.silenceRules = DB.silenceRules.filter(r => !ids.includes(r.id));
                return { success: true };
            }
            const newRule = { ...body, id: `sil-${uuidv4()}` };
            DB.silenceRules.unshift(newRule);
            return newRule;
        }
        case 'PATCH /silence-rules': {
            const index = DB.silenceRules.findIndex(r => r.id === id);
            if (index === -1) throw { status: 404 };
            DB.silenceRules[index] = { ...DB.silenceRules[index], ...body };
            return DB.silenceRules[index];
        }
        case 'DELETE /silence-rules': {
            DB.silenceRules = DB.silenceRules.filter(r => r.id !== id);
            return {};
        }
        
        // Resources
        case 'GET /resources': {
            if (id === 'topology') {
                return { nodes: getActive(DB.resources), links: DB.resourceLinks };
            }
            let resources = getActive(DB.resources);
            if (params.keyword) resources = resources.filter(r => r.name.toLowerCase().includes(params.keyword.toLowerCase()));
            if (params.status) resources = resources.filter(r => r.status === params.status);
            return paginate(resources, params.page, params.page_size);
        }
        case 'POST /resources':
            if (id === 'batch-actions') {
                 const { action, ids } = body;
                if (action === 'delete') DB.resources.forEach(r => { if (ids.includes(r.id)) r.deleted_at = new Date().toISOString(); });
                return { success: true };
            } else {
                 const newResource = { ...body, id: `res-${uuidv4()}` };
                 DB.resources.unshift(newResource);
                 return newResource;
            }
        case 'PATCH /resources': {
            const index = DB.resources.findIndex(r => r.id === id);
            if (index === -1) throw { status: 404 };
            DB.resources[index] = { ...DB.resources[index], ...body };
            return DB.resources[index];
        }
        case 'DELETE /resources': {
             const index = DB.resources.findIndex(r => r.id === id);
             if (index > -1) DB.resources[index].deleted_at = new Date().toISOString();
             return {};
        }
        case 'GET /resource-groups': return getActive(DB.resourceGroups);
        case 'POST /resource-groups':
            const newGroup = { ...body, id: `rg-${uuidv4()}` };
            DB.resourceGroups.unshift(newGroup);
            return newGroup;
        case 'PUT /resource-groups': {
            const index = DB.resourceGroups.findIndex(g => g.id === id);
            if (index === -1) throw { status: 404 };
            DB.resourceGroups[index] = { ...DB.resourceGroups[index], ...body };
            return DB.resourceGroups[index];
        }
        case 'DELETE /resource-groups': {
            const index = DB.resourceGroups.findIndex(g => g.id === id);
            if (index > -1) DB.resourceGroups[index].deleted_at = new Date().toISOString();
            return {};
        }

        // Automation
        case 'GET /automation': {
            if (id === 'scripts') return getActive(DB.playbooks);
            if (id === 'triggers') return getActive(DB.automationTriggers);
            if (id === 'executions') {
                let executions = DB.automationExecutions;
                if(params.playbookId) executions = executions.filter(e => e.scriptId === params.playbookId);
                if(params.status) executions = executions.filter(e => e.status === params.status);
                if(params.startDate) executions = executions.filter(e => new Date(e.startTime) >= new Date(params.startDate));
                if(params.endDate) executions = executions.filter(e => new Date(e.startTime) <= new Date(params.endDate));
                return paginate(executions, params.page, params.page_size);
            }
        }
        case 'POST /automation': {
            if (urlParts[1] === 'scripts') {
                if(action === 'execute') {
                    const scriptId = id;
                    const script = DB.playbooks.find(p => p.id === scriptId);
                    if (!script) throw { status: 404 };
                    const newExec = { id: `exec-${uuidv4()}`, scriptId, scriptName: script.name, status: 'success', triggerSource: 'manual', triggeredBy: 'Admin User', startTime: new Date().toISOString(), durationMs: Math.random() * 5000, parameters: body.parameters, logs: { stdout: 'Mock execution successful.', stderr: '' } };
                    DB.automationExecutions.unshift(newExec);
                    return newExec;
                } else { // create script
                    const newScript = { ...body, id: `play-${uuidv4()}` };
                    DB.playbooks.unshift(newScript);
                    return newScript;
                }
            }
             if (id === 'triggers') {
                const newTrigger = { ...body, id: `trig-${uuidv4()}` };
                DB.automationTriggers.unshift(newTrigger);
                return newTrigger;
            }
            if (id === 'executions' && action === 'retry') {
                const executionId = urlParts[2];
                const originalExec = DB.automationExecutions.find(e => e.id === executionId);
                if (!originalExec) throw { status: 404 };
                const newExec = { ...originalExec, id: `exec-${uuidv4()}`, status: 'success', startTime: new Date().toISOString(), durationMs: Math.random() * 3000 };
                DB.automationExecutions.unshift(newExec);
                return newExec;
            }
        }
        case 'PATCH /automation': { 
            const collection = id === 'scripts' ? DB.playbooks : DB.automationTriggers;
            const itemId = urlParts[2];
            const index = collection.findIndex(p => p.id === itemId);
            if (index === -1) throw { status: 404 };
            collection[index] = { ...collection[index], ...body };
            return collection[index];
        }
        case 'DELETE /automation': {
            const collection = id === 'scripts' ? DB.playbooks : DB.automationTriggers;
            const itemId = urlParts[2];
            const index = collection.findIndex(p => p.id === itemId);
            if (index > -1) collection[index].deleted_at = new Date().toISOString();
            return {};
        }

        // Analysis Center
        case 'GET /logs': {
            let logs = DB.logs;
            if (params.keyword) {
                logs = logs.filter(l => l.message.toLowerCase().includes(params.keyword.toLowerCase()));
            }
            if (params.level) {
                logs = logs.filter(l => l.level === params.level);
            }
            return paginate(logs, params.page, params.page_size);
        }
        case 'GET /traces': {
            if (id) {
                return DB.traces.find(t => t.traceId === id);
            }
            return DB.traces;
        }


        // IAM
        case 'GET /iam': {
            if (id === 'users') {
                 let users = getActive(DB.users);
                 if (params.keyword) users = users.filter(u => u.name.toLowerCase().includes(params.keyword.toLowerCase()) || u.email.toLowerCase().includes(params.keyword.toLowerCase()));
                 return paginate(users, params.page, params.page_size);
            }
            if (id === 'teams') return getActive(DB.teams);
            if (id === 'roles') return getActive(DB.roles);
            if (id === 'audit-logs') {
                let logs = DB.auditLogs;
                if(params.user) logs = logs.filter(l => l.user.id === params.user);
                if(params.action) logs = logs.filter(l => l.action === params.action);
                if(params.startDate) logs = logs.filter(l => new Date(l.timestamp) >= new Date(params.startDate));
                if(params.endDate) logs = logs.filter(l => new Date(l.timestamp) <= new Date(params.endDate));
                return paginate(logs, params.page, params.page_size);
            }
        }
        case 'POST /iam': {
            if (id === 'users') {
                if(action === 'batch-actions') {
                    const { action: userAction, ids } = body;
                    if (userAction === 'delete') DB.users.forEach(u => { if (ids.includes(u.id)) u.deleted_at = new Date().toISOString(); });
                    if (userAction === 'disable') DB.users.forEach(u => { if (ids.includes(u.id)) u.status = 'inactive'; });
                    return { success: true };
                } else {
                    const newUser = { ...body, id: `usr-${uuidv4()}`, status: 'invited', lastLogin: 'N/A' };
                    DB.users.unshift(newUser);
                    return newUser;
                }
            }
            if (id === 'teams') {
                const newTeam = { ...body, id: `team-${uuidv4()}`, createdAt: new Date().toISOString() };
                DB.teams.unshift(newTeam);
                return newTeam;
            }
            if (id === 'roles') {
                const newRole = { ...body, id: `role-${uuidv4()}`, createdAt: new Date().toISOString() };
                DB.roles.unshift(newRole);
                return newRole;
            }
        }
        case 'PATCH /iam': {
            const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
            const itemId = urlParts[2];
            const index = collection.findIndex(item => item.id === itemId);
            if (index === -1) throw { status: 404 };
            collection[index] = { ...collection[index], ...body };
            return collection[index];
        }
        case 'DELETE /iam': {
            const collection = id === 'users' ? DB.users : id === 'teams' ? DB.teams : DB.roles;
            const itemId = urlParts[2];
            const index = collection.findIndex(item => item.id === itemId);
            if (index > -1) collection[index].deleted_at = new Date().toISOString();
            return {};
        }

        // Settings
        case 'GET /settings': {
            if (id === 'layouts') return DB.layouts;
            if (id === 'notification-strategies') return getActive(DB.notificationStrategies);
            if (id === 'notification-channels') return getActive(DB.notificationChannels);
            if (id === 'notification-history') return paginate(DB.notificationHistory, params.page, params.page_size);
            if (id === 'tags') return getActive(DB.tagDefinitions);
            if (id === 'mail') return DB.mailSettings;
            if (id === 'auth') return DB.authSettings;
        }
        case 'POST /settings': {
            if (id === 'notification-strategies') {
                const newStrat = { ...body, id: `strat-${uuidv4()}` };
                DB.notificationStrategies.unshift(newStrat);
                return newStrat;
            }
            if (id === 'notification-channels') {
                const channelId = urlParts[2];
                if (channelId && action === 'test') return { success: true, message: 'Test email sent successfully.'};
                const newChan = { ...body, id: `chan-${uuidv4()}` };
                DB.notificationChannels.unshift(newChan);
                return newChan;
            }
            if (id === 'notification-history') { // resend
                return { success: true };
            }
            if (id === 'tags') {
                const newTag = { ...body, id: `tag-${uuidv4()}` };
                DB.tagDefinitions.unshift(newTag);
                return newTag;
            }
            if (id === 'mail' && action === 'test') {
                 return { success: true, message: 'Connection successful.' };
            }
        }
        case 'PATCH /settings': {
            const collection = id === 'notification-strategies' ? DB.notificationStrategies : id === 'notification-channels' ? DB.notificationChannels : DB.tagDefinitions;
            const itemId = urlParts[2];
            const index = collection.findIndex(item => item.id === itemId);
            if (index === -1) throw { status: 404 };
            collection[index] = { ...collection[index], ...body };
            return collection[index];
        }
        case 'DELETE /settings': {
             const collection = id === 'notification-strategies' ? DB.notificationStrategies : id === 'notification-channels' ? DB.notificationChannels : DB.tagDefinitions;
            const itemId = urlParts[2];
            const index = collection.findIndex(item => item.id === itemId);
            if (index > -1) collection[index].deleted_at = new Date().toISOString();
            return {};
        }
        case 'PUT /settings': {
            if (id === 'layouts') {
                DB.layouts = body;
                return DB.layouts;
            }
            if (id === 'tags') { // update tag values
                const tagId = urlParts[2];
                const index = DB.tagDefinitions.findIndex(t => t.id === tagId);
                if (index > -1) DB.tagDefinitions[index].allowedValues = body;
                return DB.tagDefinitions[index];
            }
            if (id === 'mail') {
                 DB.mailSettings = { ...DB.mailSettings, ...body };
                 return DB.mailSettings;
            }
        }

    }

    throw new Error(`[Mock API] Unhandled route: ${method} ${url}`);
};


const api = {
    get: async <T>(url: string, config: { params?: any } = {}): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('GET', url.substring(1), config.params || {}, null);
            return { data: data as T };
        } catch (error: any) {
            const message = error.message || 'An unexpected error occurred while fetching data.';
            console.error(`[Mock GET Error] ${url}`, error);
            showToast(message, 'error');
            throw error;
        }
    },
    post: async <T>(url: string, body: any = {}, config = {}): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('POST', url.substring(1), {}, body);
            return { data: data as T };
        } catch (error: any) {
            const message = error.message || 'An unexpected error occurred while sending data.';
            console.error(`[Mock POST Error] ${url}`, error);
            showToast(message, 'error');
            throw error;
        }
    },
    put: async <T>(url: string, body: any = {}, config = {}): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('PUT', url.substring(1), {}, body);
            return { data: data as T };
        } catch (error: any) {
            const message = error.message || 'An unexpected error occurred while updating data.';
            console.error(`[Mock PUT Error] ${url}`, error);
            showToast(message, 'error');
            throw error;
        }
    },
    patch: async <T>(url: string, body: any = {}, config = {}): Promise<{ data: T }> => {
        try {
            const data = await handleRequest('PATCH', url.substring(1), {}, body);
            return { data: data as T };
        } catch (error: any) {
            const message = error.message || 'An unexpected error occurred while updating data.';
            console.error(`[Mock PATCH Error] ${url}`, error);
            showToast(message, 'error');
            throw error;
        }
    },
    del: async <T>(url: string, config = {}): Promise<{ data: T }> => {
         try {
            const data = await handleRequest('DELETE', url.substring(1), {}, null);
            return { data: data as T };
        } catch (error: any) {
            const message = error.message || 'An unexpected error occurred while deleting data.';
            console.error(`[Mock DELETE Error] ${url}`, error);
            showToast(message, 'error');
            throw error;
        }
    },
};

export default api;