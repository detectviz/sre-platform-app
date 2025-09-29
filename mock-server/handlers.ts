import { DB, uuidv4 } from './db';
import type { TabConfigMap } from '../types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
            // FIX: Explicitly convert boolean to number to avoid type errors during arithmetic sort operation.
            const valueA = Number(valA);
            const valueB = Number(valB);
            // FIX: Use the converted number variables for subtraction.
            // FIX: Corrected the arithmetic operation to use the numeric representations of booleans (`valueA`, `valueB`) instead of the boolean values themselves, resolving the type error.
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // Fallback for other types
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
};


const handleRequest = async (method: HttpMethod, url: string, params: any, body: any) => {
    try {
        console.log(`[Mock API] ${method} ${url}`, { params, body });
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200)); // Simulate latency

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
                            DB.discoveredResources[index].ignoredAt = new Date().toISOString();
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
                    // FIX: Property 'allColumns' does not exist on type '{ ... }'.
                    const pageKey = subId as keyof typeof DB.allColumns;
                    // FIX: Property 'allColumns' does not exist on type '{ ... }'.
                    return DB.allColumns[pageKey] || [];
                }
                break;
            }
            // UI Configs
            case 'GET /ui': {
                if (id === 'options') {
                    return DB.allOptions;
                }
                if (id === 'content') {
                    return DB.pageContent;
                }
                if (id === 'icons') return DB.iconMap;
                if (id === 'themes' && subId === 'charts') return DB.chartColors;
                if (id === 'tabs') {
                    const VITE_EDITION = 'community'; // Simulate portfolio mode
                    let tabsConfig = JSON.parse(JSON.stringify(DB.tabConfigs)) as TabConfigMap;
                    if (VITE_EDITION === 'community') {
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
                if (id === 'content') {
                    if (action === 'command-palette') return DB.commandPaletteContent;
                    if (action === 'execution-log-detail') return DB.executionLogDetailContent;
                    if (action === 'import-modal') return DB.importModalContent;
                }
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
                            r.conditionsSummary.toLowerCase().includes(search)
                        );
                    }
                    if (params?.sort_by && params?.sort_order) {
                        rules = sortData(rules, params.sort_by, params.sort_order);
                    }
                    return rules;
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
                if (id === 'import') {
                    return { message: '成功匯入 12 筆事件。' };
                }
                if (subId === 'actions') {
                    const { action: incidentAction, assigneeName, durationHours, details } = body;
                    const index = DB.incidents.findIndex((i: any) => i.id === id);
                    if (index === -1) throw { status: 404 };

                    const currentUser = DB.users[0];
                    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

                    if (incidentAction === 'acknowledge') {
                        const oldStatus = DB.incidents[index].status;
                        DB.incidents[index].status = 'acknowledged';
                        DB.incidents[index].assignee = currentUser.name;
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Acknowledged', details: `Status changed from '${oldStatus}' to 'acknowledged'.` });
                    }
                    if (incidentAction === 'resolve') {
                        const oldStatus = DB.incidents[index].status;
                        DB.incidents[index].status = 'resolved';
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Resolved', details: `Status changed from '${oldStatus}' to 'resolved'.` });
                    }
                    if (incidentAction === 'assign') {
                        const oldAssignee = DB.incidents[index].assignee || 'Unassigned';
                        DB.incidents[index].assignee = assigneeName;
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Re-assigned', details: `Assignee changed from ${oldAssignee} to ${assigneeName}.` });
                    }
                    if (incidentAction === 'silence') {
                        const oldStatus = DB.incidents[index].status;
                        DB.incidents[index].status = 'silenced';
                        DB.incidents[index].history.push({ timestamp, user: currentUser.name, action: 'Silenced', details: `Incident silenced for ${durationHours} hour(s). Status changed from '${oldStatus}' to 'silenced'.` });
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
                    return DB.incidents[index];
                }
                break;
            }
            
            case 'GET /alert-rules': {
                if (id === 'templates') return DB.alertRuleTemplates;
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
                const newRule = { ...body, id: `rule-${uuidv4()}`, automationEnabled: !!body.automation?.enabled };
                DB.alertRules.unshift(newRule);
                return newRule;
            case 'PATCH /alert-rules':
                const ruleIndex = DB.alertRules.findIndex((r: any) => r.id === id);
                if (ruleIndex === -1) throw { status: 404 };
                DB.alertRules[ruleIndex] = { ...DB.alertRules[ruleIndex], ...body, automationEnabled: !!body.automation?.enabled };
                return DB.alertRules[ruleIndex];
            case 'DELETE /alert-rules':
                DB.alertRules = DB.alertRules.filter((r: any) => r.id !== id);
                return {};
            
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
                    if (subId && action === 'test') {
                        const dsId = subId;
                        const ds = DB.datasources.find((d: any) => d.id === dsId);
                        if (!ds) throw { status: 404 };
                        ds.status = 'pending';
                        setTimeout(() => {
                            const idx = DB.datasources.findIndex((d: any) => d.id === dsId);
                            if (idx > -1) DB.datasources[idx].status = Math.random() > 0.3 ? 'ok' : 'error';
                        }, 1500);
                        return { success: true, message: 'Test initiated.' };
                    }
                    const newDs = { ...body, id: `ds-${uuidv4()}`, createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '), status: 'pending' };
                    DB.datasources.unshift(newDs);
                    return newDs;
                }
                if (id === 'discovery-jobs') {
                    if (subId && action === 'run') {
                        const jobId = subId;
                        const jobIndex = DB.discoveryJobs.findIndex((j: any) => j.id === jobId);
                        if (jobIndex === -1) throw { status: 404 };
                        DB.discoveryJobs[jobIndex].status = 'running';
                        setTimeout(() => {
                           const idx = DB.discoveryJobs.findIndex((j: any) => j.id === jobId);
                           if (idx > -1) {
                               DB.discoveryJobs[idx].status = Math.random() > 0.2 ? 'success' : 'partial_failure';
                               DB.discoveryJobs[idx].lastRun = new Date().toISOString().slice(0, 19).replace('T', ' ');
                           }
                        }, 3000);
                        return { message: 'Run triggered.' };
                    }
                    const newJob = { ...body, id: `dj-${uuidv4()}`, lastRun: 'N/A', status: 'success' };
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
                                lastCheckIn: new Date().toISOString(),
                                discoveredByJobId: jobId,
                                monitoringAgent: deployAgent ? 'node_exporter' : undefined
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
                     const newResource = { ...body, id: `res-${uuidv4()}` };
                     DB.resources.unshift(newResource);
                     return newResource;
                }
            }
            case 'PATCH /resources': {
                if (id === 'datasources') {
                    const dsId = subId;
                    const index = DB.datasources.findIndex((d: any) => d.id === dsId);
                    if (index === -1) throw { status: 404 };
                    DB.datasources[index] = { ...DB.datasources[index], ...body };
                    return DB.datasources[index];
                }
                if (id === 'discovery-jobs') {
                    const jobId = subId;
                    const index = DB.discoveryJobs.findIndex((j: any) => j.id === jobId);
                    if (index === -1) throw { status: 404 };
                    DB.discoveryJobs[index] = { ...DB.discoveryJobs[index], ...body };
                    return DB.discoveryJobs[index];
                }
                const resIndex = DB.resources.findIndex((r: any) => r.id === id);
                if (resIndex === -1) throw { status: 404 };
                DB.resources[resIndex] = { ...DB.resources[resIndex], ...body };
                return DB.resources[resIndex];
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
                if (delResIndex > -1) DB.resources[delResIndex].deleted_at = new Date().toISOString();
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
                        if (params.playbookId) executions = executions.filter((e: any) => e.scriptId === params.playbookId);
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
                    if (subId === 'execute') {
                        const scriptId = id;
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
                if (id === 'executions' && subId === 'retry') {
                    const executionId = urlParts[2];
                    const executionIndex = DB.automationExecutions.findIndex((e: any) => e.id === executionId);
                    if (executionIndex === -1) throw { status: 404 };
                    const originalExec = DB.automationExecutions[executionIndex];
                    const newExec = { ...originalExec, id: `exec-${uuidv4()}`, status: 'pending', startTime: new Date().toISOString(), endTime: undefined, durationMs: undefined };
                    DB.automationExecutions.unshift(newExec);
                    return newExec;
                }
                if (id === 'triggers') {
                    const newTrigger = { ...body, id: `trig-${uuidv4()}` };
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
                    DB.playbooks[index] = { ...DB.playbooks[index], ...body };
                    return DB.playbooks[index];
                }
                if (id === 'triggers') {
                     const itemId = subId;
                    const index = DB.automationTriggers.findIndex((t: any) => t.id === itemId);
                    if (index === -1) throw { status: 404 };
                    DB.automationTriggers[index] = { ...DB.automationTriggers[index], ...body };
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
                        const newUser = { ...body, id: `usr-${uuidv4()}`, status: 'invited', lastLogin: 'N/A' };
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
                    const newTeam = { ...body, id: `team-${uuidv4()}` };
                    DB.teams.unshift(newTeam);
                    return newTeam;
                }
                if (id === 'roles') {
                     if (subId === 'batch-actions') {
                        const { action: batchAction, ids } = body;
                        if (batchAction === 'delete') DB.roles.forEach((r: any) => { if (ids.includes(r.id)) r.deleted_at = new Date().toISOString(); });
                        return { success: true };
                    }
                    const newRole = { ...body, id: `role-${uuidv4()}`, userCount: 0, status: 'active', createdAt: new Date().toISOString() };
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
                collection[index] = { ...collection[index], ...body };
                return collection[index];
            }
            case 'DELETE /iam': {
                const collection = id === 'users' ? DB.users : id === 'teams' ? DB.roles : DB.teams;
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
                    return tags;
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
                            existingLayout.widgetIds = newLayouts[key].widgetIds;
                            existingLayout.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            existingLayout.updatedBy = 'Admin User';
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
                    if (tagIndex > -1) DB.tagDefinitions[tagIndex].allowedValues = body;
                    return DB.tagDefinitions[tagIndex];
                }
                break;
            }
             case 'POST /settings': {
                if (urlParts[1] === 'notification-channels' && subId === 'test') {
                    return { success: true, message: 'Test initiated.' };
                }
                if (urlParts[1] === 'notification-history' && subId === 'resend') {
                    return { success: true };
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
            case 'GET /system': {
                if (id === 'config') {
                    return DB.systemConfig;
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
        const errorMessage = e?.message ?? e?.toString() ?? 'Unknown error';
        console.error(`[Mock ${method} Error] ${url.split('?')[0]}`, errorMessage);
        if (e?.status === 403 && (e?.message?.toLowerCase?.().includes('license') || e?.code === 'LICENSE_INVALID')) {
            console.warn('License invalid or expired');
        }
        throw e;
    }

    throw { status: 404, message: `[Mock] Endpoint Not Found: ${method} ${url}` };
};

export { handleRequest };
export type { HttpMethod };
