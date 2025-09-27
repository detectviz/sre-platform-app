# AUTOMATION_ENGINE (SRE Platform)

## 文件目的
定義 SRE Platform 的自動化引擎設計，涵蓋觸發方式、Workflow 執行、結果回饋與數據血緣整合。此文件同時說明 n8n 與 ADK 的角色定位與分工。

## 自動化引擎設計理念
- **標準化閉環**：觸發 ➝ 執行 ➝ 記錄 ➝ 回饋。
- **可插拔**：底層引擎可由 n8n 或其他 Workflow Orchestrator 替換。
- **智能化**：ADK Agent 負責決策與判斷，n8n 負責具體執行。
- **可追溯**：所有執行需納入數據血緣，支援 Incident 後分析與 AI 訓練。

## 觸發方式
1. **事件觸發 (Event-driven)**  
   - 由 Observability/Alerts/Incidents 觸發。  
   - 例如：Grafana Alert 透過 Webhook 通知平台，自動啟動 Workflow。  

2. **排程觸發 (Scheduled)**  
   - 依據 Cron 規則或固定時間執行。  
   - 適合日常檢查、備份、資源清理。  

3. **手動觸發 (Manual)**  
   - 使用者在平台 UI 中點擊操作。  
   - 適合驗證性或一次性操作。  

4. **Webhook/API 觸發 (Integration-driven)**  
   - 外部系統透過 API 呼叫 Workflow。  
   - 適合與 ITSM/Jira/CI/CD 系統整合。  

## Workflow 執行
- **引擎**：n8n 作為主要 Workflow Orchestration 引擎。  
- **Playbook**：平台內的腳本、動作集合，會被封裝為 n8n Workflow 節點。  
- **安全性**：所有 Workflow 執行需符合 IAM 權限檢查，多租戶隔離。  
- **擴展性**：支援自訂節點（Node），封裝常見 SRE 操作。  

## AI 與自動化的分工
- **ADK (Agent Development Kit)**  
  - 負責「頭腦」：判斷要不要執行 Workflow、選擇哪個 Playbook。  
  - 可根據數據血緣與歷史執行紀錄做出智能決策。  

- **n8n**  
  - 負責「手腳」：確保 Workflow 被可靠執行。  
  - 包含執行腳本、API 請求、通知整合。  

- **SRE 平台核心**  
  - 扮演「中樞神經」：記錄、觀測、血緣治理、知識資產化。  

## 數據血緣與回饋
- 每一次 Workflow 執行需記錄：  
  - **輸入**：事件來源、觸發條件、使用者操作。  
  - **處理**：Workflow 節點序列、外部系統互動。  
  - **輸出**：執行結果、狀態、回饋訊息。  
- 這些紀錄需回寫到數據血緣系統 (Lineage)，支援：  
  - Incident Postmortem  
  - AI Insight 再訓練  
  - 審計與合規追蹤  

## 模組對應
- **Automation 模組**：管理 Playbooks、Triggers、Executions。  
- **Observability 模組**：產生事件觸發 Workflow。  
- **IAM 模組**：管控 Workflow 執行權限。  
- **Analysis 模組**：利用 Workflow 執行紀錄做 Root Cause Analysis。  

## 結論
SRE Platform 的自動化引擎不是單純的 Workflow 系統，而是結合 **ADK 智能決策 + n8n 執行引擎 + 數據血緣治理** 的閉環架構，確保所有自動化具備智能性、可靠性與可追溯性。