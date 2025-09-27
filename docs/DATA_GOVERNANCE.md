# DATA_GOVERNANCE (SRE Platform)

## 文件目的
定義 SRE Platform 的數據治理策略，確保資料可追溯、可信任，並支援 AI Agent、合規性與多租戶環境。

## DataOps 三支柱
1. **資產目錄 (Data Catalog)**
   - 所有數據資產（Metrics、Logs、Traces、Dashboards、Scripts、Incidents）皆需註冊。
   - 每個資產需有 metadata（擁有者、來源、標籤、更新頻率）。
   - 提供搜尋與分類功能，避免知識孤島。

2. **數據可觀測性 (Data Observability)**
   - 偵測數據異常（延遲、缺失、品質下降）。
   - 監控數據流量、處理延遲與可用性。
   - 每個 Pipeline 都有健康檢查指標。

3. **數據血緣 (Data Lineage)**
   - 來源 → 處理 → 存放 → 使用 → 回饋 全鏈路可追蹤。
   - 每筆 Incident 或 Insight 需能回溯所依賴的數據來源。
   - Workflow 執行結果需寫回 Lineage，形成閉環。

## 數據治理原則
- **一致性**：不同來源數據需經標準化。
- **可追溯性**：每個數據點需能追蹤至來源與處理流程。
- **安全性**：數據存取需受 RBAC 與多租戶隔離控制。
- **合規性**：日誌與數據保留策略需符合法規要求（如 GDPR）。
- **AI Ready**：數據治理需為 AI Agent 訓練與推理提供乾淨的輸入。

## 數據治理流程
1. **收集 (Collect)**  
   - Exporter (snmp_exporter, node_exporter)  
   - OTel Collector (Logs, Traces)  
   - API/Webhook 事件  
2. **處理 (Process)**  
   - 清洗與轉換 (標準化 JSON/OTel 格式)  
   - 標籤化 (資源 ID、環境、租戶)  
   - 聚合與降維 (Prometheus Rules, Downsampling)  
3. **存放 (Store)**  
   - PostgreSQL → 業務資料 (IAM, Incidents, Playbooks)  
   - Prometheus/VictoriaMetrics → 時序資料  
   - Chroma/Weaviate → 向量資料 (AI RAG)  
   - S3/MinIO → 歷史日誌/報表  
4. **使用 (Consume)**  
   - Dashboards, Alerts, Incidents, Insights, Playbooks  
5. **回饋 (Feedback)**  
   - Incident 與 Playbook 執行結果回寫 Lineage  
   - AI Insight 輸出與決策過程紀錄  

## 與平台模組對應
- IAM → 控制數據存取權限  
- Observability → 數據收集與呈現  
- Automation → Workflow 執行回寫 Lineage  
- Analysis → AI Insights 與數據解釋  
- Platform Settings → 數據保留策略與合規性設定  

## 結論
數據治理是 SRE Platform 的基礎，確保所有模組在 **可信數據** 之上運行，並為 AI Agent 提供可解釋、可追溯的資料支持。