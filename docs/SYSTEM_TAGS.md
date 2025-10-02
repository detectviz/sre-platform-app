# SRE Platform 系統標籤清單

以下清單依據 `tag-registry.ts` 內標記為系統保留（`system: true`）的定義彙整，並依主要情境分類。除非另有說明，所有鍵的命名規範皆遵循 `^[a-z0-9_]{1,32}$`，值長度不超過 128 個字元，布林值限定為 `true | false`，時間以 ISO 8601 格式表示。

## 通用（Environment & Organization）
- **env**（字串） — 建議值：`production`、`staging`、`development`
- **region**（字串）
- **zone**（字串）
- **site**（字串）
- **rack**（字串）
- **team**（字串）
- **owner**（字串）
- **service**（字串）
- **component**（字串）
- **role**（字串）
- **business_unit**（字串）
- **cost_center**（字串）
- **version**（字串）
- **commit**（字串）
- **build**（字串）
- **tags.schema_version**（字串，唯一且僅限平台管理員調整）

## 資源（Resource）
- **resource_type**（枚舉） — `vm`、`pod`、`service`、`device`
- **os**（字串）
- **distro**（字串）
- **kernel**（字串）
- **ip**（字串，需唯一）
- **hostname**（字串，需唯一）
- **vendor**（字串）
- **model**（字串）
- **cluster**（字串）
- **namespace**（字串）
- **workload**（字串）
- **discovery_job_id**（字串）
- **edge_gateway**（布林）

## 資料來源與匯出器（Datasource & Exporter）
- **datasource_type**（枚舉） — `victoriametrics`、`grafana`、`elasticsearch`、`prometheus`、`custom`
- **datasource_id**（字串，需唯一）
- **exporter_type**（枚舉） — `node`、`snmp`、`modbus`、`ipmi`、`cadvisor`、`kube_state`
- **protocol**（枚舉） — `snmp`、`modbus`、`opcua`、`ipmi`、`mqtt`
- **edge_gateway**（布林）
- **gateway_id**（字串，需唯一）
- **ip**（字串，需唯一）
- **hostname**（字串，需唯一）

## 自動探勘（Discovery Job）
- **protocol**（枚舉） — `snmp`、`modbus`、`opcua`、`ipmi`、`mqtt`
- **discovery_job_id**（字串，需唯一）
- **edge_gateway**（布林）
- **gateway_id**（字串，需唯一）
- **cluster**（字串）
- **region**（字串）
- **team**（字串）

## 告警（Alerting）
- **rule_id**（字串，需唯一）
- **rule_template**（字串）
- **metric**（字串）
- **metric_family**（字串）
- **threshold_profile**（字串）
- **window**（字串，使用 ISO 8601 duration）
- **operator**（枚舉） — `>`、`>=`、`<`、`<=`
- **datasource_type**（枚舉） — `victoriametrics`、`grafana`、`elasticsearch`、`prometheus`、`custom`
- **resource_type**（枚舉） — `vm`、`pod`、`service`、`device`
- **cluster**（字串）
- **namespace**（字串）
- **workload**（字串）
- **team**（字串）
- **service**（字串）
- **slo**（字串）
- **sla**（字串）

## 事件（Incident）
- **status**（枚舉） — `new`、`acknowledged`、`resolved`、`silenced`
- **severity**（枚舉） — `critical`、`warning`、`info`
- **impact**（枚舉） — `high`、`medium`、`low`
- **resource_type**（枚舉） — `vm`、`pod`、`service`、`device`
- **datasource_type**（枚舉） — `victoriametrics`、`grafana`、`elasticsearch`、`prometheus`、`custom`
- **cluster**（字串）
- **namespace**（字串）
- **workload**（字串）
- **service**（字串）
- **resource_id**（字串）
- **affected_service**（字串）
- **oncall_team**（字串）
- **slo**（字串）
- **sla**（字串）
- **lineage_id**（字串）
- **tenant**（字串）
- **user**（字串）
- **playbook_id**（字串）
- **silenced**（布林）
- **maintenance_window**（字串）

## 通知（Notification Policy）
- **channel**（枚舉） — `email`、`webhook`、`slack`、`line`、`sms`
- **routing_key**（字串，需唯一）
- **oncall_team**（字串）
- **status**（枚舉） — `new`、`acknowledged`、`resolved`、`silenced`
- **severity**（枚舉） — `critical`、`warning`、`info`
- **impact**（枚舉） — `high`、`medium`、`low`
- **service**（字串）
- **team**（字串）
- **sla**（字串）

## 自動化（Automation）
- **playbook_type**（枚舉） — `shell`、`python`、`ansible`、`terraform`
- **playbook_id**（字串）
- **safe_mode**（布林）
- **status**（枚舉） — `new`、`acknowledged`、`resolved`、`silenced`
- **severity**（枚舉） — `critical`、`warning`、`info`
- **impact**（枚舉） — `high`、`medium`、`low`
- **resource_id**（字串）
- **service**（字串）
- **component**（字串）
- **team**（字串）
- **user**（字串）
- **tenant**（字串）

## 分析與合規（Analysis & Compliance）
- **metric**（字串）
- **metric_family**（字串）
- **dataset**（字串）
- **lineage_id**（字串）
- **pii**（枚舉） — `none`、`low`、`high`
- **retention_class**（枚舉） — `hot`、`warm`、`cold`、`archive`
- **compliance**（枚舉） — `iso27001`、`soc2`、`pci`
- **cluster**（字串）
- **service**（字串）
- **tenant**（字串）

## 多租戶與身分管理（Tenant, Team & User）
- **tenant**（字串）
- **realm**（字串）
- **team**（字串）
- **role**（字串）
- **user**（字串）
- **business_unit**（字串）

> 所有模組均需透過「標籤管理」頁面建立或維護上述鍵與值域，前端模組僅能引用既有定義，禁止在業務流程中臨時創建新鍵。
