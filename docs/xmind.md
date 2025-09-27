# SRE Platform 心智圖

## 架構
- 前端
  - React + TypeScript + Ant Design
  - Vite 開發環境
  - ECharts / 自訂圖表組件
- 後端
  - Go / Python 微服務
  - gRPC + REST API
  - 工廠模式 (Factory Pattern)
  - AI Agent Framework：Agent Development Kit (ADK)
  - 自動化引擎：n8n (Workflow Orchestration)
- 資料層
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

## 運維與可持續性
- 災難復原 (DR) / 備援策略
- 成本治理 (FinOps)
- 插件生命週期管理

- 認證與安全
  - Keycloak (IdP, OIDC/OAuth2, RBAC/SSO)
  - 多租戶隔離
  - 審計日誌

## 技術棧
React, TypeScript, Ant Design, Go, Python  
Grafana, Prometheus, OpenTelemetry  
ADK (Factory Pattern，可切換 Provider: Gemini API / Ollama / 其他), RAG, Playbooks  
Docker Compose, K8s, Proxmox VM  

## 核心任務
- 資料治理（收集、清洗、索引、標準化）
- 數據血緣 (Data Lineage)：追蹤來源 ➝ 處理 ➝ 存儲 ➝ 使用 ➝ 回饋
- 集中觀測（Metrics, Logs, Traces, Dashboards）
- 事件與可靠性管理（Incident lifecycle）
- 自動化（Playbooks, Triggers, Executions）
- 知識資產化（Dashboards, Scripts, Insights）
- AI 增強（Insights, 預測, 根因分析）
- 多租戶與安全治理（權限, 隔離, 合規性）
- 合規與審計
- 運維韌性（備援、災難復原、升級策略）
- 成本與資源治理 (Cost Monitoring / FinOps)
- 開發者體驗（DX 改善、快速入門流程）
- 智能決策 (ADK Agent)
- 自動化執行 (n8n Workflow)

## 模組
- IAM：使用者、團隊、角色、權限、審計
- Observability：Dashboard、Metrics、Alerts(代理 Grafana)、Incidents
- Resources：清單、群組、拓撲
- Automation：腳本、Playbooks、Triggers、排程、執行
- Notifications：Channels、Strategies、History
- Analysis：AI Insights、Log Explorer、Trace、Capacity
- Platform Settings：Auth、Grafana、Mail、Layout、Tag、Integrations
- Lineage：來源、處理、存放、應用、回饋的鏈路追蹤

## 自動化引擎
- 觸發方式：事件、排程、手動、Webhook
- 循環：觸發 ➝ 執行 ➝ 記錄 ➝ 回饋

## 核心價值
- 打破知識孤島 → 集中管理資產
- 建立閉環 → 事件 ➝ 資料 ➝ 行動 ➝ 觀測 ➝ 知識化
- 提供統一介面 → 在 Grafana/Keycloak 等工具之上
- 數據血緣透明化 → 可追蹤、可解釋、可信任
- AI Ready → 乾淨資料循環
- 擴展性 → 插件化、多租戶
- DataOps 三支柱（資產目錄、數據可觀測性、數據血緣）
- 開發與操作體驗一致化（UX / DX）

## 延伸點
- AIOps / 自動化決策
- 行業垂直化（半導體、金融、工控）
- SaaS 化，支援 MSP/大型企業
- 知識共享平台（跨團隊復用）
- Marketplace / 插件生態

## 價值主張
- 不是再造監控工具，而是 知識資產型 SRE 平台
- 將資料、事件、腳本與儀表板轉換成 可行動智慧
- 數據血緣驅動 AI：確保輸入可追溯、輸出可解釋
- AI 原生設計，支援 Agent 協作

## 獨特賣點 (USP)
- Agent 驅動閉環（執行 ➝ 記錄 ➝ 分析 ➝ 優化）
- 內建數據血緣追蹤 → 提高可信度與合規性
- 集中式知識庫（Dashboards + Scripts + Insights）
- 插件化與多租戶設計
- 更貼近真實 SRE 工作流的 UX
- AI Agent 四大角色：RCA Agent、Remediation Agent、Forecast Agent、Postmortem Agent
- ADK = 頭腦（智能決策）  
- n8n = 手腳（自動化執行）  
- 平台 = 中樞神經（治理、觀測、血緣、知識）

## 差異化
- Grafana：不只視覺化，還有事件、自動化、知識治理
- Datadog/NewRelic：專注 AI 與 Agent 協作，而非大而全
- PagerDuty/Opsgenie：事件管理之外，還有數據治理與自動化
- Elastic：不只是搜尋，而是平台級治理與決策支援

## 設計脈絡
Prototype.html (UI 驗證), openapi.yaml (API 合約), db_schema.sql (資料治理), mock-server (迭代), architecture.md/specs.md (藍圖對齊)

## 產品區隔
- 企業監控套件：提供「知識治理 + AI Agent」
- 內部 SRE 團隊：集中數據 + 自動化閉環
- SaaS / MSP：多租戶 + 擴展性 + AI Ready