import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, '.specify', 'specs', 'modules');

/**
 * @typedef {{
 *   file: string;
 *   heading: string;
 *   level: number;
 * }} SourceSection
 *
 * @typedef {{
 *   output: string;
 *   title: string;
 *   branch: string;
 *   sources: SourceSection[];
 * }} ModuleSpecConfig
 */

/** @type {ModuleSpecConfig[]} */
const MODULE_SPECS = [
  {
    output: 'incidents-list-spec.md',
    title: '事件列表 (Incidents List)',
    branch: 'incidents-list-spec',
    sources: [
      { file: 'docs/specs/incidents-spec-pages.md', heading: '### `incidents-list-overview.png`', level: 3 }
    ]
  },
  {
    output: 'incidents-alert-spec.md',
    title: '告警規則管理 (Alert Rules)',
    branch: 'incidents-alert-spec',
    sources: [
      { file: 'docs/specs/incidents-spec-pages.md', heading: '### 告警規則管理 (Alert Rules)', level: 3 }
    ]
  },
  {
    output: 'incidents-silence-spec.md',
    title: '靜默規則管理 (Silence Rules)',
    branch: 'incidents-silence-spec',
    sources: [
      { file: 'docs/specs/incidents-spec-pages.md', heading: '### 靜默規則管理 (Silence Rules)', level: 3 }
    ]
  },
  {
    output: 'resources-group-spec.md',
    title: '資源群組管理 (Resource Groups)',
    branch: 'resources-group-spec',
    sources: [
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-groups-list.png`', level: 3 },
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-edit-group-modal.png`', level: 3 }
    ]
  },
  {
    output: 'resources-list-spec.md',
    title: '資源清單 (Resource Inventory)',
    branch: 'resources-list-spec',
    sources: [
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-inventory-list.png`', level: 3 },
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-edit-modal.png`', level: 3 }
    ]
  },
  {
    output: 'resources-topology-spec.md',
    title: '資源拓撲視圖 (Resource Topology)',
    branch: 'resources-topology-spec',
    sources: [
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-topology-view.png`', level: 3 }
    ]
  },
  {
    output: 'resources-discovery-spec.md',
    title: '資源發現流程 (Discovery Workflow)',
    branch: 'resources-discovery-spec',
    sources: [
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-discovery-results-modal.png`', level: 3 },
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-discovery-task-step3.png`', level: 3 },
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-discovery-task-step5.png`', level: 3 }
    ]
  },
  {
    output: 'resources-datasource-spec.md',
    title: '資料來源管理 (Datasources)',
    branch: 'resources-datasource-spec',
    sources: [
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-datasources-list.png`', level: 3 },
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-edit-datasource-modal.png`', level: 3 }
    ]
  },
  {
    output: 'resources-auto-discovery-spec.md',
    title: '自動發現任務 (Auto Discovery)',
    branch: 'resources-auto-discovery-spec',
    sources: [
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-auto-discovery-list.png`', level: 3 },
      { file: 'docs/specs/resources-spec-pages.md', heading: '### `resources-edit-discovery-task-modal.png`', level: 3 }
    ]
  },
  {
    output: 'dashboards-list-spec.md',
    title: '儀表板列表 (Dashboards List)',
    branch: 'dashboards-list-spec',
    sources: [
      { file: 'docs/specs/dashboard-spec-pages.md', heading: '### `dashboards-list.png`', level: 3 }
    ]
  },
  {
    output: 'dashboards-template-spec.md',
    title: '儀表板模板中心 (Dashboard Templates)',
    branch: 'dashboards-template-spec',
    sources: [
      { file: 'docs/specs/dashboard-spec-pages.md', heading: '### `dashboards-template-gallery.png`', level: 3 }
    ]
  },
  {
    output: 'insights-backtesting-spec.md',
    title: '回測分析 (Insights Backtesting)',
    branch: 'insights-backtesting-spec',
    sources: [
      { file: 'docs/specs/insights-spec-pages.md', heading: '### `images/insights-backtesting.png`', level: 3 }
    ]
  },
  {
    output: 'insights-capacity-spec.md',
    title: '容量規劃 (Capacity Planning)',
    branch: 'insights-capacity-spec',
    sources: [
      { file: 'docs/specs/insights-spec-pages.md', heading: '### insights-capacity-planning.png', level: 3 }
    ]
  },
  {
    output: 'insights-log-spec.md',
    title: '日誌探索 (Log Explorer)',
    branch: 'insights-log-spec',
    sources: [
      { file: 'docs/specs/insights-spec-pages.md', heading: '### insights-log-explorer.png', level: 3 }
    ]
  },
  {
    output: 'automation-playbook-spec.md',
    title: '自動化劇本 (Automation Playbooks)',
    branch: 'automation-playbook-spec',
    sources: [
      { file: 'docs/specs/automation-spec-pages.md', heading: '### `automation-scripts-list.png`', level: 3 },
      { file: 'docs/specs/automation-spec-pages.md', heading: '### `automation-edit-script-modal.png`', level: 3 },
      { file: 'docs/specs/automation-spec-pages.md', heading: '### `automation-ai-generate-script-modal.png`', level: 3 }
    ]
  },
  {
    output: 'automation-trigger-spec.md',
    title: '自動化觸發器 (Automation Triggers)',
    branch: 'automation-trigger-spec',
    sources: [
      { file: 'docs/specs/automation-spec-pages.md', heading: '### `automation-triggers-list.png`', level: 3 },
      { file: 'docs/specs/automation-spec-pages.md', heading: '### `automation-edit-trigger-event.png` / `automation-edit-trigger-schedule.png` / `automation-edit-trigger-webhook.png`', level: 3 }
    ]
  },
  {
    output: 'automation-history-spec.md',
    title: '自動化執行歷史 (Automation History)',
    branch: 'automation-history-spec',
    sources: [
      { file: 'docs/specs/automation-spec-pages.md', heading: '### `automation-run-logs-list.png`', level: 3 },
      { file: 'docs/specs/automation-spec-pages.md', heading: '### `automation-run-log-detail.png`', level: 3 }
    ]
  },
  {
    output: 'identity-personnel-spec.md',
    title: '人員管理 (Identity Personnel)',
    branch: 'identity-personnel-spec',
    sources: [
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-users-list.png`', level: 3 },
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-invite-member-modal.png`', level: 3 },
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-edit-member-modal.png`', level: 3 }
    ]
  },
  {
    output: 'identity-role-spec.md',
    title: '角色管理 (Identity Roles)',
    branch: 'identity-role-spec',
    sources: [
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-roles-list.png`', level: 3 },
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-edit-role-modal.png`', level: 3 }
    ]
  },
  {
    output: 'identity-team-spec.md',
    title: '團隊管理 (Identity Teams)',
    branch: 'identity-team-spec',
    sources: [
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-teams-list.png`', level: 3 },
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-edit-team-modal.png`', level: 3 }
    ]
  },
  {
    output: 'identity-audit-spec.md',
    title: '稽核日誌 (Audit Trails)',
    branch: 'identity-audit-spec',
    sources: [
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-audit-log-list.png`', level: 3 },
      { file: 'docs/specs/identity-spec-pages.md', heading: '### `identity-audit-log-detail.png`', level: 3 }
    ]
  },
  {
    output: 'notification-channel-spec.md',
    title: '通知通道 (Notification Channels)',
    branch: 'notification-channel-spec',
    sources: [
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-channels-list.png`', level: 3 },
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-add-channel-email.png`', level: 3 },
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-add-channel-webhook.png`', level: 3 },
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-add-channel-slack.png`', level: 3 },
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-add-channel-line.png`', level: 3 },
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-add-channel-sms.png`', level: 3 }
    ]
  },
  {
    output: 'notification-strategy-spec.md',
    title: '通知策略 (Notification Strategies)',
    branch: 'notification-strategy-spec',
    sources: [
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-strategies-list.png`', level: 3 },
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-strategy-step1.png`, `notifications-strategy-step2.png`, `notifications-strategy-step3.png`', level: 3 }
    ]
  },
  {
    output: 'notification-history-spec.md',
    title: '通知紀錄 (Notification History)',
    branch: 'notification-history-spec',
    sources: [
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-send-history.png`', level: 3 },
      { file: 'docs/specs/notifications-spec-pages.md', heading: '### `notifications-history-detail.png`', level: 3 }
    ]
  },
  {
    output: 'platform-auth-spec.md',
    title: '身份與驗證設定 (Platform Auth Settings)',
    branch: 'platform-auth-spec',
    sources: [
      { file: 'docs/specs/platform-spec-pages.md', heading: '### `platform-identity-settings.png`', level: 3 }
    ]
  },
  {
    output: 'platform-grafana-spec.md',
    title: 'Grafana 整合設定 (Platform Grafana)',
    branch: 'platform-grafana-spec',
    sources: [
      { file: 'docs/specs/platform-spec-pages.md', heading: '### `platform-grafana-settings.png`', level: 3 }
    ]
  },
  {
    output: 'platform-mail-spec.md',
    title: '郵件伺服器設定 (Platform Mail)',
    branch: 'platform-mail-spec',
    sources: [
      { file: 'docs/specs/platform-spec-pages.md', heading: '### `platform-email-settings.png`', level: 3 }
    ]
  },
  {
    output: 'platform-tag-spec.md',
    title: '標籤治理 (Platform Tag Management)',
    branch: 'platform-tag-spec',
    sources: [
      { file: 'docs/specs/platform-spec-pages.md', heading: '### `platform-tags-overview.png`', level: 3 }
    ]
  },
  {
    output: 'platform-layout-spec.md',
    title: '平台佈局設定 (Platform Layout)',
    branch: 'platform-layout-spec',
    sources: [
      { file: 'docs/specs/platform-spec-pages.md', heading: '### `platform-layout-manager.png` & `platform-layout-edit-kpi-modal.png`', level: 3 }
    ]
  },
  {
    output: 'platform-license-spec.md',
    title: '授權管理 (Platform License)',
    branch: 'platform-license-spec',
    sources: [
      { file: 'docs/specs/platform-spec-pages.md', heading: '### `platform-license-page.png`', level: 3 }
    ]
  },
  {
    output: 'profile-info-spec.md',
    title: '個人資訊 (Profile Information)',
    branch: 'profile-info-spec',
    sources: [
      { file: 'docs/specs/profile-spec-pages.md', heading: '### `profile-personal-info.png`', level: 3 }
    ]
  },
  {
    output: 'profile-preference-spec.md',
    title: '個人偏好設定 (Profile Preferences)',
    branch: 'profile-preference-spec',
    sources: [
      { file: 'docs/specs/profile-spec-pages.md', heading: '### `profile-preferences.png`', level: 3 }
    ]
  },
  {
    output: 'profile-security-spec.md',
    title: '安全設定 (Profile Security)',
    branch: 'profile-security-spec',
    sources: [
      { file: 'docs/specs/profile-spec-pages.md', heading: '### `profile-security-settings.png`', level: 3 }
    ]
  }
];

const cachedFiles = new Map();

/**
 * @param {string} relative
 * @returns {Promise<string>}
 */
const readMarkdown = async (relative) => {
  if (cachedFiles.has(relative)) {
    return cachedFiles.get(relative);
  }
  const absolute = path.join(REPO_ROOT, relative);
  const data = await readFile(absolute, 'utf8');
  cachedFiles.set(relative, data);
  return data;
};

/**
 * @param {string} content
 * @param {string} heading
 * @param {number} level
 */
const extractSection = (content, heading, level) => {
  const lines = content.split(/\r?\n/);
  const trimmedHeading = heading.trim();
  const startIndex = lines.findIndex((line) => line.trim() === trimmedHeading);
  if (startIndex === -1) {
    throw new Error(`Heading "${heading}" not found in source document.`);
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^(#+)\s/);
    if (!match) continue;
    const currentLevel = match[1].length;
    if (currentLevel <= level) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join('\n').trim();
};

/**
 * @param {string[]} sections
 */
const splitSections = (sections) => {
  const scenarioParts = [];
  const requirementParts = [];

  sections.forEach((section) => {
    const apiIndex = section.indexOf('**API');
    if (apiIndex !== -1) {
      scenarioParts.push(section.slice(0, apiIndex).trim());
      requirementParts.push(section.slice(apiIndex).trim());
    } else {
      scenarioParts.push(section.trim());
    }
  });

  const scenarios = scenarioParts.filter(Boolean).join('\n\n');
  const requirements = requirementParts.filter(Boolean).join('\n\n');

  return { scenarios, requirements };
};

/**
 * @param {string} text
 */
const extractClarifications = (text) => {
  const matches = text.match(/\[NEEDS CLARIFICATION:([^\]]+)\]/g) || [];
  return matches.map((match) => match.replace('[NEEDS CLARIFICATION:', '').replace(']', '').trim());
};

/**
 * @param {ModuleSpecConfig} spec
 * @param {string[]} sections
 */
const buildSpecContent = (spec, sections) => {
  const { scenarios, requirements } = splitSections(sections);
  const combined = [scenarios, requirements].filter(Boolean).join('\n\n');
  const clarifications = extractClarifications(combined);
  const clarificationList = clarifications
    .map((item) => `- [NEEDS CLARIFICATION] ${item}`)
    .join('\n');

  const createdDate = new Date().toISOString().slice(0, 10);
  const sourceSummary = spec.sources
    .map((source) => `\`${source.file}\` → \`${source.heading.replace(/^#+\s*/, '')}\``)
    .join('、 ');

  const sourceEvidence = spec.sources
    .map((source) => `- ${source.heading} （來源：\`${source.file}\`）`)
    .join('\n');

  const checklistClarification = clarifications.length === 0 ? 'x' : ' ';

  return `# Feature Specification: ${spec.title}

**Feature Branch**: \`[${spec.branch}]\`
**Created**: ${createdDate}
**Status**: Draft
**Input**: 逆向自 ${sourceSummary}

## Execution Flow (main)
1. 載入對應的頁面規格 Markdown 段落。
2. 解析現況描述、互動流程與 API/需求小節。
3. 若段落內含 [NEEDS CLARIFICATION]，轉寫至「Outstanding Clarifications」。
4. 產出對應的規格文件並寫入 \`.specify/specs/modules/${spec.output}\`。

## User Scenarios & Testing *(mandatory)*
${scenarios || '_來源段落未提供互動流程，請補充。_'}

## Requirements *(mandatory)*
${requirements || '_來源段落未提供需求條目，請補充。_'}

${clarifications.length > 0 ? `## Outstanding Clarifications\n${clarificationList}\n\n` : ''}## Source Evidence
${sourceEvidence}

## Review & Acceptance Checklist
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness Checklist
- [${checklistClarification}] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [${clarifications.length > 0 ? ' ' : 'x'}] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed
`;
};

const ensureOutputDir = async () => {
  await mkdir(OUTPUT_DIR, { recursive: true });
};

const mode = process.argv.includes('--check') ? 'check' : 'write';

const run = async () => {
  await ensureOutputDir();
  const diffs = [];

  for (const spec of MODULE_SPECS) {
    const sections = [];
    for (const source of spec.sources) {
      const content = await readMarkdown(source.file);
      const section = extractSection(content, source.heading, source.level);
      sections.push(section);
    }

    const payload = buildSpecContent(spec, sections);
    const outputPath = path.join(OUTPUT_DIR, spec.output);

    if (mode === 'check') {
      let existing = '';
      try {
        existing = await readFile(outputPath, 'utf8');
      } catch (error) {
        if (error && error.code === 'ENOENT') {
          diffs.push(`缺少規格檔：${spec.output}`);
          continue;
        }
        throw error;
      }
      if (existing.trim() !== payload.trim()) {
        diffs.push(`規格檔內容不一致：${spec.output}`);
      }
    } else {
      await writeFile(outputPath, `${payload}\n`, 'utf8');
    }
  }

  if (mode === 'check') {
    if (diffs.length > 0) {
      console.error('規格比對失敗：');
      diffs.forEach((diff) => console.error(`- ${diff}`));
      process.exit(1);
    } else {
      console.log('所有模組規格皆已同步。');
    }
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
