const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

// In-memory data store
let DB = {};

// Helper to generate UUIDs
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function initializeDatabase() {
  // Data copied from constants.ts, converted to CommonJS style and simplified
  const MOCK_DATA = {
    MOCK_DASHBOARDS: [
        { id: 'sre-war-room', name: 'SRE 戰情室', type: 'built-in', category: '業務與 SLA', description: '跨團隊即時戰情看板，聚焦重大事件與 SLA 指標。', owner: '事件指揮中心', updatedAt: '2025/09/18 17:15', path: '/sre-war-room' },
        { id: 'infrastructure-insights', name: '基礎設施洞察', type: 'built-in', category: '基礎設施', description: '整合多雲與多中心資源健康狀態。', owner: 'SRE 平台團隊', updatedAt: '2025/09/18 16:30', path: '/dashboard/infrastructure-insights' },
        { id: 'api-service-status', name: 'API 服務狀態', type: 'grafana', category: '業務與 SLA', description: 'API 響應時間、錯誤率、吞吐量等服務指標。', owner: 'SRE 平台團隊', updatedAt: '2025/09/18 16:45', path: '/dashboard/api-service-status', grafanaUrl: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5', grafana_dashboard_uid: 'aead3d54-423b-4a91-b91c-dbdf40d7fff5', grafana_folder_uid: 'biz-folder' },
        { id: 'user-experience-monitoring', name: '用戶體驗監控', type: 'grafana', category: '營運與容量', description: '頁面載入時間、用戶行為分析、錯誤追蹤。', owner: '前端團隊', updatedAt: '2025/09/18 17:00', path: '/dashboard/user-experience-monitoring', grafanaUrl: 'http://localhost:3000/d/another-dashboard-id-for-ux', grafana_dashboard_uid: 'another-dashboard-id-for-ux', grafana_folder_uid: 'ux-folder' },
    ],
    MOCK_INCIDENTS: [
        { id: 'INC-001', summary: 'API 延遲超過閾值', resource: 'api-server-01', serviceImpact: 'High', rule: 'API 延遲規則', status: 'new', severity: 'warning', priority: 'P1', assignee: '張三', triggeredAt: '2024-01-15 10:30:00', history: [ { timestamp: '2024-01-15 10:30:00', user: 'System', action: 'Incident created from rule "API 延遲規則".' } ] },
        { id: 'INC-002', summary: '資料庫連接超時', resource: 'db-primary', serviceImpact: 'High', rule: '資料庫連接規則', status: 'acknowledged', severity: 'critical', priority: 'P0', assignee: '李四', triggeredAt: '2024-01-15 10:15:00', history: [ { timestamp: '2024-01-15 10:15:00', user: 'System', action: 'Incident created from rule "資料庫連接規則".' } ] },
        { id: 'INC-003', summary: 'CPU 使用率異常', resource: 'web-prod-12', serviceImpact: 'Medium', rule: 'CPU 使用率規則', status: 'resolved', severity: 'warning', priority: 'P2', assignee: '王五', triggeredAt: '2024-01-15 09:45:00', history: [ { timestamp: '2024-01-15 09:45:00', user: 'System', action: 'Incident created from rule "CPU 使用率規則".' } ] },
    ],
    MOCK_ALERT_RULES: [
        { id: 'rule-001', name: 'CPU 使用率過高', description: '當任何伺服器的 CPU 使用率連續 5 分鐘超過 90% 時觸發。', enabled: true, target: '所有伺服器', conditionsSummary: 'CPU > 90% for 5m', severity: 'critical', automationEnabled: true, creator: 'Admin User', lastUpdated: '2025-09-22 10:00:00', automation: { enabled: true, scriptId: 'play-002' } },
        { id: 'rule-002', name: 'API 延遲規則', description: 'API Gateway 的 p95 延遲超過 500ms。', enabled: true, target: 'api-gateway-prod', conditionsSummary: 'Latency > 500ms', severity: 'warning', automationEnabled: false, creator: 'Emily White', lastUpdated: '2025-09-21 15:30:00' },
    ],
    MOCK_SILENCE_RULES: [
        { id: 'sil-001', name: '週末維護窗口', description: '週末例行維護期間静音所有 staging 環境的告警。', enabled: true, type: 'repeat', matchers: [{ key: 'env', operator: '=', value: 'staging' }], schedule: { type: 'recurring', cron: '0 22 * * 5', timezone: 'Asia/Taipei' }, creator: 'Admin User', createdAt: '2025-09-20 18:00:00' },
        { id: 'sil-002', name: 'API 服務部署靜音', description: '在 API 服務 v2.1.5 部署期間靜音相關告警。', enabled: false, type: 'single', matchers: [{ key: 'service', operator: '=', value: 'api-service' }], schedule: { type: 'single', startsAt: '2025-09-23 02:00:00', endsAt: '2025-09-23 03:00:00' }, creator: 'Emily White', createdAt: '2025-09-22 16:00:00' }
    ],
    MOCK_RESOURCES: [
        { id: 'res-001', name: 'api-gateway-prod-01', status: 'healthy', type: 'API Gateway', provider: 'AWS', region: 'us-east-1', owner: 'SRE Team', lastCheckIn: '30s ago' },
        { id: 'res-002', name: 'rds-prod-main', status: 'critical', type: 'RDS Database', provider: 'AWS', region: 'us-east-1', owner: 'DBA Team', lastCheckIn: '2m ago' },
        { id: 'res-003', name: 'k8s-prod-cluster', status: 'healthy', type: 'EKS Cluster', provider: 'AWS', region: 'us-west-2', owner: 'SRE Team', lastCheckIn: '1m ago' },
    ],
    MOCK_RESOURCE_GROUPS: [
      { id: 'rg-001', name: 'Production Web Servers', description: 'All production-facing web servers', ownerTeam: 'Web Team', memberIds: ['res-004'], statusSummary: { healthy: 12, warning: 1, critical: 0 } },
      { id: 'rg-002', name: 'Core Databases', description: 'Primary and replica databases for core services', ownerTeam: 'DBA Team', memberIds: ['res-002'], statusSummary: { healthy: 8, warning: 0, critical: 1 } },
    ],
    MOCK_PLAYBOOKS: [
        { id: 'play-001', name: '重啟故障 Pod', description: '自動重啟處於 CrashLoopBackOff 狀態的 Pod。', trigger: 'K8s 告警', lastRun: '5分鐘前', lastRunStatus: 'success', runCount: 12, type: 'shell', content: '#!/bin/bash...', parameters: [{ name: 'namespace', label: '命名空間', type: 'string', required: true }] },
        { id: 'play-002', name: '擴展 Web 層', description: '向 Web 伺服器自動擴展組增加更多 EC2 實例。', trigger: '高 CPU', lastRun: '1小時前', lastRunStatus: 'success', runCount: 3, type: 'python', content: 'import boto3...', parameters: [{ name: 'instance_count', label: '實例數量', type: 'number', required: true, defaultValue: 2 }] },
    ],
    MOCK_AUTOMATION_EXECUTIONS: [
      { id: 'exec-001', scriptId: 'play-001', scriptName: '重啟故障 Pod', status: 'success', triggerSource: 'event', triggeredBy: 'Event Rule: K8s 告警', startTime: '2025-09-23 14:05:10', endTime: '2025-09-23 14:05:15', durationMs: 5000, parameters: { namespace: 'production' }, logs: { stdout: 'Successfully restarted pod.', stderr: '' } },
      { id: 'exec-002', scriptId: 'play-005', scriptName: '歸檔舊日誌', status: 'failed', triggerSource: 'schedule', triggeredBy: 'Daily Cleanup Schedule', startTime: '2025-09-23 03:00:00', endTime: '2025-09-23 03:01:20', durationMs: 80000, parameters: { days_to_keep: 30 }, logs: { stdout: 'Starting...', stderr: 'Access denied.' } },
    ],
    MOCK_AUTOMATION_TRIGGERS: [
        { id: 'trig-001', name: '每日日誌歸檔', description: '在每天凌晨 3 點運行「歸檔舊日誌」腳本。', type: 'Schedule', enabled: true, targetPlaybookId: 'play-005', config: { cron: '0 3 * * *' }, lastTriggered: '18 小時前', creator: 'Admin User' },
        { id: 'trig-002', name: 'CI/CD 部署觸發器', description: '從 Jenkins 觸發部署前檢查的 Webhook。', type: 'Webhook', enabled: true, targetPlaybookId: 'play-006', config: { webhookUrl: 'https://sre.platform/api/v1/webhooks/hook-abcdef123456' }, lastTriggered: '2 小時前', creator: 'Emily White' },
    ],
    MOCK_USERS: [
      { id: 'usr-001', name: 'Admin User', email: 'admin@sre.platform', role: 'Admin', team: 'SRE Platform', status: 'active', lastLogin: '2分鐘前' },
      { id: 'usr-002', name: 'Emily White', email: 'emily.w@example.com', role: 'SRE', team: 'Core Infrastructure', status: 'active', lastLogin: '1小時前' },
      { id: 'usr-003', name: 'John Doe', email: 'john.d@example.com', role: 'Developer', team: 'API Services', status: 'active', lastLogin: '5小時前' },
      { id: 'usr-004', name: 'Sarah Connor', email: 'sarah.c@example.com', role: 'Viewer', team: 'Marketing', status: 'inactive', lastLogin: '3天前' },
      { id: 'usr-005', name: 'pending.invite@example.com', email: 'pending.invite@example.com', role: 'Developer', team: 'API Services', status: 'invited', lastLogin: 'N/A' },
    ],
    MOCK_TEAMS: [
      { id: 'team-001', name: 'SRE Platform', description: 'Manages the SRE platform itself.', ownerId: 'usr-001', memberIds: ['usr-001'], createdAt: '2024-01-01 10:00:00' },
      { id: 'team-002', name: 'Core Infrastructure', description: 'Maintains core infrastructure services.', ownerId: 'usr-002', memberIds: ['usr-002'], createdAt: '2024-01-02 11:00:00' },
      { id: 'team-003', name: 'API Services', description: 'Develops and maintains all public APIs.', ownerId: 'usr-003', memberIds: ['usr-003', 'usr-005'], createdAt: '2024-01-03 12:00:00' },
    ],
    MOCK_ROLES: [
        { id: 'role-001', name: 'Administrator', description: '擁有所有權限', userCount: 1, status: 'active', createdAt: '2024-01-01 09:00:00', permissions: [] },
        { id: 'role-002', name: 'SRE Engineer', description: '擁有事件、資源、自動化管理權限', userCount: 1, status: 'active', createdAt: '2024-01-01 09:00:00', permissions: [] },
    ],
    MOCK_AUDIT_LOGS: [
        { id: 'log-001', timestamp: '2024-01-15 11:05:00', user: {id: 'usr-001', name: 'Admin User'}, action: 'LOGIN_SUCCESS', target: { type: 'System', name: 'Authentication' }, result: 'success', ip: '192.168.1.10', details: { client: 'WebApp' } },
        { id: 'log-002', timestamp: '2024-01-15 11:10:00', user: {id: 'usr-002', name: 'Emily White'}, action: 'UPDATE_EVENT_RULE', target: { type: 'EventRule', name: 'API 延遲規則' }, result: 'success', ip: '10.0.0.5', details: { from: { severity: 'info' }, to: { severity: 'warning' } } },
    ],
    MOCK_TAG_DEFINITIONS: [
        { id: 'tag-001', key: 'env', category: 'Infrastructure', description: 'Deployment environment', allowedValues: [{ id: 'val-001', value: 'production', usageCount: 150 }], required: true, usageCount: 350 },
        { id: 'tag-002', key: 'service', category: 'Application', description: 'Name of the microservice', allowedValues: [{ id: 'val-004', value: 'api-gateway', usageCount: 1 }], required: true, usageCount: 9 },
    ],
    DEFAULT_LAYOUTS: {
        "事件管理": ['incident_pending_count', 'incident_in_progress', 'incident_resolved_today'],
        "資源管理": ['resource_total_count', 'resource_health_rate', 'resource_alerting'],
        "自動化中心": ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts'],
    },
  };
  // Deep clone to make it mutable
  DB = JSON.parse(JSON.stringify(MOCK_DATA));
}

initializeDatabase();

const router = express.Router();

// Helper for pagination
const paginate = (array, page, pageSize) => {
  const pageNum = parseInt(page, 10) || 1;
  const size = parseInt(pageSize, 10) || 10;
  const startIndex = (pageNum - 1) * size;
  return {
    page: pageNum,
    page_size: size,
    total: array.length,
    items: array.slice(startIndex, startIndex + size),
  };
};

const getActive = (collection) => collection.filter(item => !item.deleted_at);

// ===========================================================================
// DASHBOARDS
// ===========================================================================
router.get('/dashboards', (req, res) => {
    const { page, page_size, category, keyword } = req.query;
    let dashboards = getActive(DB.MOCK_DASHBOARDS);
    if (category && category !== 'All') {
        dashboards = dashboards.filter(d => d.category === category);
    }
    if (keyword) {
        dashboards = dashboards.filter(d => d.name.toLowerCase().includes(keyword.toLowerCase()));
    }
    res.json(paginate(dashboards, page, page_size));
});
router.post('/dashboards', (req, res) => {
    const newDashboard = { ...req.body, id: `db-${uuidv4()}` };
    DB.MOCK_DASHBOARDS.unshift(newDashboard);
    res.status(201).json(newDashboard);
});
router.get('/dashboards/:id', (req, res) => {
    const item = DB.MOCK_DASHBOARDS.find(d => d.id === req.params.id);
    item ? res.json(item) : res.status(404).send();
});
router.patch('/dashboards/:id', (req, res) => {
    const index = DB.MOCK_DASHBOARDS.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).send();
    DB.MOCK_DASHBOARDS[index] = { ...DB.MOCK_DASHBOARDS[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(DB.MOCK_DASHBOARDS[index]);
});
router.delete('/dashboards/:id', (req, res) => {
    const index = DB.MOCK_DASHBOARDS.findIndex(d => d.id === req.params.id);
    if (index > -1) DB.MOCK_DASHBOARDS[index].deleted_at = new Date().toISOString();
    res.status(204).send();
});
router.post('/dashboards/batch-actions', (req, res) => {
    const { action, ids } = req.body;
    if (action === 'delete') {
        DB.MOCK_DASHBOARDS.forEach(dash => {
            if (ids.includes(dash.id)) dash.deleted_at = new Date().toISOString();
        });
    }
    res.json({ success: true });
});

// ===========================================================================
// INCIDENTS, RULES, SILENCES
// ===========================================================================
router.get('/events', (req, res) => res.json(paginate(DB.MOCK_INCIDENTS, req.query.page, req.query.page_size)));
router.post('/events/:id/actions', (req, res) => {
    const { action } = req.body;
    const index = DB.MOCK_INCIDENTS.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).send();
    if (action === 'acknowledge') DB.MOCK_INCIDENTS[index].status = 'acknowledged';
    if (action === 'resolve') DB.MOCK_INCIDENTS[index].status = 'resolved';
    res.json(DB.MOCK_INCIDENTS[index]);
});
router.get('/alert-rules', (req, res) => res.json(DB.MOCK_ALERT_RULES));
router.get('/silence-rules', (req, res) => res.json(DB.MOCK_SILENCE_RULES));

// ===========================================================================
// RESOURCES
// ===========================================================================
router.get('/resources', (req, res) => res.json(paginate(getActive(DB.MOCK_RESOURCES), req.query.page, req.query.page_size)));
router.post('/resources', (req, res) => {
    const newResource = { ...req.body, id: `res-${uuidv4()}` };
    DB.MOCK_RESOURCES.unshift(newResource);
    res.status(201).json(newResource);
});
router.patch('/resources/:resource_id', (req, res) => {
  const index = DB.MOCK_RESOURCES.findIndex(r => r.id === req.params.resource_id);
  if (index === -1) return res.status(404).send();
  DB.MOCK_RESOURCES[index] = { ...DB.MOCK_RESOURCES[index], ...req.body };
  res.json(DB.MOCK_RESOURCES[index]);
});
router.delete('/resources/:resource_id', (req, res) => {
    const index = DB.MOCK_RESOURCES.findIndex(r => r.id === req.params.resource_id);
    if (index > -1) DB.MOCK_RESOURCES[index].deleted_at = new Date().toISOString();
    res.status(204).send();
});
router.post('/resources/batch-actions', (req, res) => {
    const { action, ids } = req.body;
    if (action === 'delete') {
        DB.MOCK_RESOURCES.forEach(resource => {
            if (ids.includes(resource.id)) resource.deleted_at = new Date().toISOString();
        });
    }
    res.json({ success: true });
});
router.get('/resource-groups', (req, res) => res.json(DB.MOCK_RESOURCE_GROUPS));

// ===========================================================================
// AUTOMATION
// ===========================================================================
router.get('/automation/scripts', (req, res) => res.json(getActive(DB.MOCK_PLAYBOOKS)));
router.post('/automation/scripts', (req, res) => {
    const newScript = { ...req.body, id: `play-${uuidv4()}` };
    DB.MOCK_PLAYBOOKS.unshift(newScript);
    res.status(201).json(newScript);
});
router.patch('/automation/scripts/:script_id', (req, res) => {
    const index = DB.MOCK_PLAYBOOKS.findIndex(p => p.id === req.params.script_id);
    if (index === -1) return res.status(404).send();
    DB.MOCK_PLAYBOOKS[index] = { ...DB.MOCK_PLAYBOOKS[index], ...req.body };
    res.json(DB.MOCK_PLAYBOOKS[index]);
});
router.delete('/automation/scripts/:script_id', (req, res) => {
    const index = DB.MOCK_PLAYBOOKS.findIndex(p => p.id === req.params.script_id);
    if (index > -1) DB.MOCK_PLAYBOOKS[index].deleted_at = new Date().toISOString();
    res.status(204).send();
});
router.post('/automation/scripts/:script_id/execute', (req, res) => {
    const script = DB.MOCK_PLAYBOOKS.find(p => p.id === req.params.script_id);
    if (!script) return res.status(404).send();

    const newExecution = {
        id: `exec-${uuidv4()}`,
        scriptId: script.id,
        scriptName: script.name,
        status: 'running',
        triggerSource: 'manual',
        triggeredBy: 'Admin User',
        startTime: new Date().toISOString(),
        parameters: req.body.parameters,
        logs: { stdout: 'Execution started...', stderr: '' }
    };

    DB.MOCK_AUTOMATION_EXECUTIONS.unshift(newExecution);

    setTimeout(() => {
        const index = DB.MOCK_AUTOMATION_EXECUTIONS.findIndex(e => e.id === newExecution.id);
        if (index > -1) {
            DB.MOCK_AUTOMATION_EXECUTIONS[index].status = Math.random() > 0.2 ? 'success' : 'failed';
            DB.MOCK_AUTOMATION_EXECUTIONS[index].endTime = new Date().toISOString();
            DB.MOCK_AUTOMATION_EXECUTIONS[index].durationMs = 5000 + Math.random() * 5000;
            DB.MOCK_AUTOMATION_EXECUTIONS[index].logs.stdout += '\nExecution finished.';
        }
    }, 5000);

    res.status(202).json(newExecution);
});


router.get('/automation/triggers', (req, res) => res.json(DB.MOCK_AUTOMATION_TRIGGERS));
router.get('/automation/executions', (req, res) => res.json(paginate(DB.MOCK_AUTOMATION_EXECUTIONS, req.query.page, req.query.page_size)));

// ===========================================================================
// IAM
// ===========================================================================
router.get('/iam/users', (req, res) => {
  const { page, page_size, keyword } = req.query;
  let users = getActive(DB.MOCK_USERS);
  if (keyword) {
    users = users.filter(user =>
        user.name.toLowerCase().includes(keyword.toLowerCase()) ||
        user.email.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  res.json(paginate(users, page, page_size));
});
router.post('/iam/users', (req, res) => {
  const newUser = { ...req.body, id: `usr-${uuidv4()}`, status: 'invited', lastLogin: 'N/A' };
  DB.MOCK_USERS.unshift(newUser);
  res.status(201).json(newUser);
});
router.patch('/iam/users/:id', (req, res) => {
  const index = DB.MOCK_USERS.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).send();
  DB.MOCK_USERS[index] = { ...DB.MOCK_USERS[index], ...req.body };
  res.json(DB.MOCK_USERS[index]);
});
router.delete('/iam/users/:id', (req, res) => {
    const index = DB.MOCK_USERS.findIndex(u => u.id === req.params.id);
    if (index > -1) DB.MOCK_USERS[index].deleted_at = new Date().toISOString();
    res.status(204).send();
});
router.post('/iam/users/batch-actions', (req, res) => {
    const { action, ids } = req.body;
    if (action === 'delete') {
        DB.MOCK_USERS.forEach(user => {
            if (ids.includes(user.id)) user.deleted_at = new Date().toISOString();
        });
    } else if (action === 'disable') {
        DB.MOCK_USERS.forEach(user => {
            if (ids.includes(user.id)) user.status = 'inactive';
        });
    }
    res.json({ success: true });
});

router.get('/iam/teams', (req, res) => res.json(getActive(DB.MOCK_TEAMS)));
router.post('/iam/teams', (req, res) => {
    const newTeam = { ...req.body, id: `team-${uuidv4()}`, createdAt: new Date().toISOString() };
    DB.MOCK_TEAMS.unshift(newTeam);
    res.status(201).json(newTeam);
});
router.patch('/iam/teams/:id', (req, res) => {
    const index = DB.MOCK_TEAMS.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send();
    DB.MOCK_TEAMS[index] = { ...DB.MOCK_TEAMS[index], ...req.body };
    res.json(DB.MOCK_TEAMS[index]);
});
router.delete('/iam/teams/:id', (req, res) => {
    const index = DB.MOCK_TEAMS.findIndex(t => t.id === req.params.id);
    if (index > -1) DB.MOCK_TEAMS[index].deleted_at = new Date().toISOString();
    res.status(204).send();
});

router.get('/iam/roles', (req, res) => res.json(getActive(DB.MOCK_ROLES)));
router.get('/iam/audit-logs', (req, res) => res.json(paginate(DB.MOCK_AUDIT_LOGS, req.query.page, req.query.page_size)));

// ===========================================================================
// SETTINGS
// ===========================================================================
router.get('/settings/layouts', (req, res) => res.json(DB.DEFAULT_LAYOUTS));
router.put('/settings/layouts', (req, res) => {
    DB.DEFAULT_LAYOUTS = req.body;
    res.json(DB.DEFAULT_LAYOUTS);
});
router.get('/settings/tags', (req, res) => res.json(DB.MOCK_TAG_DEFINITIONS));

// Catch-all for unhandled routes
router.use((req, res) => {
  console.log(`[${req.method}] Unhandled route: ${req.path}`);
  res.status(404).json({ message: `Endpoint [${req.method}] ${req.path} not found on mock server.` });
});

app.use('/api/v1', router);

app.listen(port, () => {
  console.log(`SRE Platform Mock Server is running on http://localhost:${port}`);
  console.log('API base URL: http://localhost:4000/api/v1');
  console.log('Data is in-memory and will reset on restart.');
});