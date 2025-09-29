# SRE Platform 心智圖

## 架構

### 前端

- React + TypeScript + Ant Design

- Vite 開發環境

- ECharts / 自訂圖表組件

### 後端

- Go / Python 微服務

- gRPC + REST API

- 工廠模式 (Factory Pattern)

- AI Agent Framework：Agent Development Kit (ADK)

- 自動化 (Playbooks, Triggers, Executions, n8n Workflow)

- 通知與升級治理 (管道、策略、路由、升級處理)

### 資料層

- PostgreSQL（核心資料庫）

- Redis / 向量資料庫 (Chroma / Weaviate)

- 時序數據 (Prometheus / VictoriaMetrics)

- 採集器 (snmp_exporter / node_exporter)

- 物件儲存 (S3 / MinIO)

- 數據血緣治理

	- 來源 (Sources)：Exporter, Logs, Traces, Events

	- 處理 (Processing)：清洗、聚合、標籤、轉換

	- 存放 (Storage)：DB, TSDB, VectorDB, Object Store

	- 使用 (Consumption)：Dashboards, Alerts, Incidents, Insights, Playbooks

	- 回饋 (Feedback)：Incident 處理結果、Playbook 執行紀錄

	- 事件血緣 (Event Lineage)：rule ➝ metric ➝ resource ➝ action

## 運維與可持續性

### 災難復原 (DR) / 備援策略

### 成本治理 (FinOps)

### 插件生命週期管理

### 認證與安全

- Keycloak (IdP, OIDC/OAuth2, RBAC/SSO)

- 多租戶隔離

- 審計日誌

## 網站地圖

### IAM：使用者、團隊、角色、權限、審計

### 多租戶管理 (Tenant)

### Observability：Dashboard（SRE 戰情室、基礎設施洞察）、Metrics、Alerts(代理 Grafana)、Incidents

### 事件管理

- 頁籤

	- 事件列表

	- 告警事件

	- 靜音規則

### Resources

#### 管理面
- 統一資源列表（Table 規格）
  - 欄位：名稱、資源類型(VM/Service/Pod/Network/PLC/…)、狀態、來源(exporter/datasource)、標籤、最後更新、操作
  - 篩選：資源類型、標籤、來源、健康狀態
  - 批次動作：加標籤、啟停監控、刪除、套用規則模板
- 資源群組
- 標籤管理（跨模組標籤統一治理）

#### 來源面
- Datasource 管理
  - 分頁：Datasource 列表
  - Table 欄位：名稱、類型(Prometheus/VM/Grafana/ES…)、連線狀態、建立時間、操作
  - 動作：新增、編輯、刪除、測試連線、批次啟停
  - Drawer 表單：名稱、類型、Endpoint/URL、驗證(Token/Basic/Keycloak)、標籤(Key-Value)
  - 校驗：即時測試連線；結果回饋(成功/延遲/錯誤碼)
  - 備註：Datasource 本身也是一種資源，需納入資源清單進行標籤化治理、權限控管與審計，並參與數據血緣 - datasource ➝ metric/log/trace ➝ rule ➝ event ➝ action。

- 自動掃描 (Discovery)
  - 分頁：Discovery Jobs、結果預覽
  - Job Table 欄位：名稱、掃描類型(K8s/SNMP/Cloud/Static)、排程、最後執行、狀態、操作
  - 動作：新增 Job、手動執行、查看結果、停用/啟用
  - Drawer 表單：名稱、掃描類型、目標配置(Kubeconfig/IP Range/SNMP/Cloud)、Cron 排程、標籤
  - Exporter 綁定：在建立掃描任務時即選擇對應的 Exporter 模板
    - VM/Linux ➝ node_exporter
    - Network Device ➝ snmp_exporter（可選 MIB profile）
    - PLC/Modbus ➝ modbus_exporter（部署於 Gateway）
    - Server BMC ➝ ipmi_exporter 或 textfile collector
    - Kubernetes ➝ cAdvisor / kube-state-metrics
    - 允許使用範本卡片選取或自訂 YAML 配置
  - Edge Gateway 模式：支援邊緣裝置 (Edge Devices) 的採集與匯總
    - 在現場部署輕量 Agent/Gateway，支援 SNMP、Modbus、IPMI、MQTT 等協議
    - 提供本地暫存功能，網路中斷時先緩存，恢復後再批次回傳
    - 平台 Discovery 支援自動識別邊緣裝置並綁定對應 Exporter 或 Gateway
    - 拓撲視圖顯示 Edge Gateway 與其下游裝置的關聯
  - 結果頁 Table：資源識別(IP/Name/Type/狀態/標籤)
  - 匯入動作：
    - 批次加標籤、匯入至資源清單、忽略(黑名單)
    - 覆寫/補充 Exporter：允許針對特定資源覆寫既有設定或新增額外 exporter
    - 套用告警規則模板（依資源標籤/類型自動匹配）

#### 視覺面
- 拓撲視圖（Topology）
  - 節點：資源(VM/Service/Pod/Device/PLC)；邊：依關聯(Service ➝ Pod、VM ➝ Exporter、PLC ➝ Gateway)
  - 篩選：依標籤 env/team/service；支援縮放/群聚/高亮告警
- 健康視圖（Resource Health Overview）

### 自動化

- 腳本庫

- 排程管理

- 執行日誌

### 智慧排查

- Logs

- Traces

- AI Insights

- 容量規劃

### 設定

- 權限管理

	- 人員管理

	- 團隊管理

	- 審計日誌

	- 角色管理

- 通知

	- 通知管道

	- 通知策略

- 平台設定

	- 標籤管理

	- 郵件設定

	- 身份驗證

	- Grafana 整合設定

### Lineage：來源、處理、存放、應用、回饋的鏈路追蹤

- Datasource Lineage：datasource → metric/log/trace → rule → event → action

- Discovery Lineage：discovery_job → discovered_resource → group/tag → rule

## 技術棧

### 前端

- React + TypeScript + Ant Design

- Vite 開發環境

- ECharts / 自訂圖表組件

### 後端

- Go / Python 微服務

- gRPC + REST API

- 工廠模式 (Factory Pattern)

- AI Agent Framework：Agent Development Kit (ADK)

- 自動化 (Playbooks, Triggers, Executions, n8n Workflow)

- 通知與升級治理 (管道、策略、路由、升級處理)

### 資料與可觀測性

- PostgreSQL（核心資料庫）

- Redis

- 向量資料庫：Chroma / Weaviate

- 時序數據庫：Prometheus / VictoriaMetrics

- 物件儲存：S3 / MinIO

- Exporters：snmp_exporter, node_exporter

- OpenTelemetry

- Grafana (Dashboards/Alerts)

### AI 與智能化

- ADK (可切換 Provider: Gemini API / Ollama / 其他)

- RAG（檢索增強生成）

- AI Insights、預測、根因分析

- Playbooks (AI 輔助決策)

### 基礎設施與部署

- Docker Compose

- Kubernetes (K8s)

- Proxmox VM

  <br>
  ## 模組
## 自動化引擎

### 觸發方式：事件、排程、手動、Webhook

### 循環：觸發 ➝ 執行 ➝ 記錄 ➝ 回饋

## 核心任務

### 資料治理（收集、清洗、索引、標準化）

### 數據血緣透明化與可視化 → 可追溯、可解釋、可信任

### 集中觀測（Metrics, Logs, Traces, Dashboards）

### 事件管理 (Incident lifecycle)

### 自動化 (Playbooks, Triggers, Executions, n8n Workflow)

### 知識資產化（Dashboards, Scripts, Insights）

### AI 增強（Insights, 預測, 根因分析）

### 多租戶與安全治理（權限, 隔離, 合規性）

### 合規與審計

### 運維韌性（備援、災難復原、升級策略）

### 成本與資源治理 (Cost Monitoring / FinOps)

### 開發者體驗（DX 改善、快速入門流程）

### 智能決策 (ADK Agent)

### 通知與升級治理 (管道、策略、路由、升級處理)

### 平台整合（Grafana、Keycloak、n8n 等外部系統）

## 核心價值

### 打破知識孤島 → 集中管理資產

### 建立閉環 → 事件 ➝ 資料 ➝ 行動 ➝ 觀測 ➝ 知識化

### 提供統一介面 → 在 Grafana/Keycloak 等工具之上

### 數據血緣透明化與可視化 → 可追蹤、可解釋、可信任

### AI Ready → 乾淨資料循環

### 擴展性 → 插件化、多租戶

### DataOps 三支柱（資產目錄、數據可觀測性、數據血緣）

### 開發與操作體驗一致化（UX / DX）

## 延伸點

### AIOps / 自動化決策

### 行業垂直化（半導體、金融、工控）

### SaaS 化，支援 MSP/大型企業

### 知識共享平台（跨團隊復用）

### Marketplace / 插件生態

## 價值主張

### 不是再造監控工具，而是 知識資產型 SRE 平台

### 將資料、事件、腳本與儀表板轉換成 可行動智慧

### 數據血緣驅動 AI：確保輸入可追溯、輸出可解釋

### AI 原生設計，支援 Agent 協作

## 獨特賣點 (USP)

### Agent 驅動閉環（執行 ➝ 記錄 ➝ 分析 ➝ 優化）

### 內建數據血緣追蹤 → 提高可信度與合規性

### 集中式知識庫（Dashboards + Scripts + Insights）

### 插件化與多租戶設計

### 更貼近真實 SRE 工作流的 UX

### AI Agent 四大角色：RCA Agent、Remediation Agent、Forecast Agent、Postmortem Agent

### ADK = 頭腦（智能決策）

### n8n = 手腳（自動化執行）

### 平台 = 中樞神經（治理、觀測、血緣、知識）

### 事件血緣可視化（rule ➝ metric ➝ resource ➝ action）

### 通知與升級治理 (管道、策略、路由、升級處理)

## 差異化

### Grafana：不只視覺化，還有事件、自動化、知識治理

### Datadog/NewRelic：專注 AI 與 Agent 協作，而非大而全

### PagerDuty/Opsgenie：事件管理之外，還有數據治理與自動化

### Elastic：不只是搜尋，而是平台級治理與決策支援

### 相對 n8n：不只是 Workflow，還有 SRE 知識治理與血緣

## 產品區隔

### 企業監控套件：提供「知識治理 + AI Agent」

### 內部 SRE 團隊：集中數據 + 自動化閉環

### SaaS / MSP：多租戶 + 擴展性 + AI Ready

## 實作流程

### 前端

- 1. Prototype 驗證 → 根據設計稿規劃元件與操作流程。

- 2. Mock-Server 接入 → 使用 mock-server/server.js、db.ts 提供假資料。

- 3. 前端開發 → React + TypeScript + Ant Design，串接 mock API。

- 4. API 合約 → 從前端 UI 驗證過的需求導出 openapi.yaml。

- 5. 對齊後端 → 更新呼叫邏輯，移除 mock-server。

- 6. 資源模組擴充：完成 Datasource CRUD/測試 與 Discovery Job/結果匯入的 UI。

### 後端

- 1. Schema 設計 → 根據 UI/UX 與 openapi.yaml 建立 db_schema.sql。

- 2. API 開發 → 依 openapi.yaml 實作 Go/Python 微服務，涵蓋 CRUD、分頁、批次操作。

- 3. 整合外部系統 → 接入 Grafana (Dashboards/Alerts)、Keycloak (Auth)、n8n (Workflow)。

- 4. 審計與血緣 → 所有操作寫入審計日誌；事件流補充 Event Lineage。

- 5. 資料表補齊：datasources、discovery_jobs、discovery_results；串接測試連線與掃描器。

### 測試與驗證

- 1. Mock 測試 → 使用 mock-server 驗證前端操作閉環。

- 2. API 測試 → 以 Swagger / Postman 驗證 openapi.yaml 與後端實作一致。

- 3. 整合測試 → 驗證前後端串接，確保規則 ➝ 事件 ➝ 通知 ➝ 自動化閉環。

- 4. 実際場景驗證 → 接入真實 Metrics/Logs/Traces 來源，測試事件觸發與自動化。

### 部署與迭代

- 1. Dev 環境：Docker Compose 啟動本地開發。

- 2. Stage 環境：K8s 部署，模擬多租戶。

- 3. Prod 環境：落地 Proxmox VM / K8s，啟用完整 RBAC 與監控。

- 4. 迭代更新：以 mock-server 驅動前端快速開發，後端逐步替換，保持文件 (openapi.yaml、db_schema.sql) 與實作一致。

## Use Cases

### 1. 資源接入與監控閉環
- 新增 Datasource（如 Prometheus/VM）
- 自動掃描新增資源（VM/K8s/Network）
- 自動綁定 Exporter，開始指標採集
- 匯入至資源清單並加標籤
- 建立告警規則與通知策略
- 異常事件觸發後，自動執行 Playbook

### 2. 事件處理與智慧排查
- 告警事件進入事件管理中心
- 自動關聯血緣：rule ➝ metric ➝ resource ➝ action
- AI Insights 提供可能原因與影響範圍
- 工程師透過 Logs/Traces 進一步排查
- 執行或調整自動化 Playbook
- 事件結束後輸出 Postmortem 報告

### 3. 多租戶管理與合規
- 租戶管理模組新增新團隊
- Keycloak 建立對應 Realm/Role
- 設定租戶資源邊界與 RBAC 規則
- 事件與審計日誌分區記錄
- 租戶可擁有獨立的 Datasource/Dashboard/自動化

### 4. 知識資產化與共享
- 儀表板匯入至平台並加上標籤
- 常用告警規則存成模板
- 自動化腳本 Playbooks 分享到 Marketplace
- 事件 Postmortem 報告存入知識庫
- 他人可直接複用 Dashboard/Rules/Playbooks

### 5. AI 增強場景
- RCA Agent 分析資源異常根因
- Remediation Agent 建議或直接執行修復動作
- Forecast Agent 預測資源使用趨勢與瓶頸
- Postmortem Agent 輔助生成事件回顧
- 全部過程透過血緣可追蹤、可解釋
