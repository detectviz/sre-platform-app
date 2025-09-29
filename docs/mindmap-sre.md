# SRE Platform

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

- 採集器 (snmp_exporter / node_exporter/ ...)

- 物件儲存 (S3 / MinIO)

- 認證安全 Keycloak (IdP, OIDC/OAuth2, RBAC/SSO)

- 告警 / 視覺化（Grafana）

## 網站地圖

### 事件管理

- 事件列表

- 告警事件

- 靜音規則

### 資源

- 資源列表

- 資源群組

- Datasource 管理

- 自動掃描

- 拓撲視圖

### 儀表板

- 儀表板列表

- 範本市集

### 智慧排查

- 分析總覽

- 日誌探索

- 容量規劃

### 自動化

- 腳本庫

- 觸發器

- 運行歷史

### 設定 - 身份與存取

- 人員管理

- 團隊管理

- 角色管理

- 審計日誌

### 設定 - 通知

- 通知管道

- 通知策略

- 發送歷史

### 設定 - 平台

- 標籤管理

- 郵件設定

- 身份驗證

- 版面管理

- Grafana 設定

- License

### 個人設定

- 個人資訊

- 安全設定

- 偏好設定

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

## 平台介紹

### 差異化

- Grafana：不只視覺化，還有事件、自動化、知識治理

- Datadog/NewRelic：專注 AI 與 Agent 協作，而非大而全

- PagerDuty/Opsgenie：事件管理之外，還有數據治理與自動化

- Elastic：不只是搜尋，而是平台級治理與決策支援

- 相對 n8n：不只是 Workflow，還有 SRE 知識治理與血緣

### 核心價值

- 打破知識孤島 → 集中管理資產

- 建立閉環 → 事件 ➝ 資料 ➝ 行動 ➝ 觀測 ➝ 知識化

- 提供統一介面 → 在 Grafana/Keycloak 等工具之上

- 數據血緣透明化與可視化 → 可追蹤、可解釋、可信任

- AI Ready → 乾淨資料循環

- 擴展性 → 插件化、多租戶

- DataOps 三支柱（資產目錄、數據可觀測性、數據血緣）

- 開發與操作體驗一致化（UX / DX）

### 延伸點

- AIOps / 自動化決策

- 行業垂直化（半導體、金融、工控）

- SaaS 化，支援 MSP/大型企業

- 知識共享平台（跨團隊復用）

- Marketplace / 插件生態

### 價值主張

- 不是再造監控工具，而是 知識資產型 SRE 平台

- 將資料、事件、腳本與儀表板轉換成 可行動智慧

- 數據血緣驅動 AI：確保輸入可追溯、輸出可解釋

- AI 原生設計，支援 Agent 協作

### 獨特賣點 (USP)

- Agent 驅動閉環（執行 ➝ 記錄 ➝ 分析 ➝ 優化）

- 內建數據血緣追蹤 → 提高可信度與合規性

- 集中式知識庫（Dashboards + Scripts + Insights）

- 插件化與多租戶設計

- 更貼近真實 SRE 工作流的 UX

- AI Agent 四大角色：RCA Agent、Remediation Agent、Forecast Agent、Postmortem Agent

- ADK = 頭腦（智能決策）

- n8n = 手腳（自動化執行）

- 平台 = 中樞神經（治理、觀測、血緣、知識）

- 事件血緣可視化（rule ➝ metric ➝ resource ➝ action）

- 通知與升級治理 (管道、策略、路由、升級處理)

### 產品區隔

- 企業監控套件：提供「知識治理 + AI Agent」

- 內部 SRE 團隊：集中數據 + 自動化閉環

- SaaS / MSP：多租戶 + 擴展性 + AI Ready

### 自動化引擎

- 觸發方式：事件、排程、手動、Webhook

- 循環：觸發 ➝ 執行 ➝ 記錄 ➝ 回饋

### 數據血緣治理

- 來源 (Sources)：Exporter, Logs, Traces, Events

- 處理 (Processing)：清洗、聚合、標籤、轉換

- 存放 (Storage)：DB, TSDB, VectorDB, Object Store

- 使用 (Consumption)：Dashboards, Alerts, Incidents, Insights, Playbooks

- 回饋 (Feedback)：Incident 處理結果、Playbook 執行紀錄

- 事件血緣 (Event Lineage)：rule ➝ metric ➝ resource ➝ action

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

