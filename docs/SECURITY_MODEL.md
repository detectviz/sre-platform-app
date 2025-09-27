# SECURITY_MODEL (SRE Platform)

## 文件目的
定義 SRE Platform 的安全模型，涵蓋多租戶隔離、身分驗證與授權、審計日誌，以及合規性考量。確保平台在企業級場景下具備可信度。

## 安全設計原則
- **最小權限 (Least Privilege)**：所有使用者與服務僅能存取必要資源。
- **職責分離 (Separation of Duties)**：管理員、操作員、審計員需有不同角色。
- **可追溯性 (Traceability)**：所有操作需被完整記錄。
- **多租戶隔離 (Tenant Isolation)**：不同租戶間數據與資源需完全隔離。
- **合規性 (Compliance Ready)**：支援 GDPR、ISO27001 等合規需求。

## 身分與存取控制
- **Keycloak (IdP)**  
  - 負責使用者驗證 (OIDC / OAuth2)。  
  - 管理使用者、群組、角色。  
  - 與平台 IAM 模組對接，統一 RBAC 與 SSO。  

- **角色型存取控制 (RBAC)**  
  - 系統角色範例：`admin`, `sre.operator`, `auditor`。  
  - 權限對應模組：Observability、Automation、Resources、Analysis 等。  

- **細粒度權限**  
  - 基於資源 ID、租戶 ID 的存取控制。  
  - 支援自訂 Policy，限制跨租戶存取。  

## 多租戶隔離
- **資料隔離**  
  - 每個租戶有獨立的資料分區 (PostgreSQL schema, TSDB tenant, VectorDB namespace)。  
- **運算隔離**  
  - Job/Workflow 執行時以租戶上下文封裝，避免資源互相影響。  
- **網路隔離**  
  - K8s Namespace 與網路策略限制跨租戶流量。  

## 審計與日誌
- **審計日誌 (Audit Logs)**  
  - 記錄使用者操作 (登入、配置修改、Workflow 執行)。  
  - 保存於 PostgreSQL 與集中式日誌系統 (ELK/Promtail + Loki)。  

- **不可竄改 (Immutable Logs)**  
  - 日誌需具備防篡改能力，可透過 WORM 儲存 (Write Once, Read Many)。  

- **存取與分析**  
  - 提供 Audit Viewer，允許審計員過濾、查詢操作紀錄。  

## 安全監控
- **身分異常偵測**：異常登入嘗試、多重失敗警告。  
- **資源異常偵測**：跨租戶資源存取告警。  
- **整合 SIEM**：支援將安全日誌輸出至外部 SIEM (Splunk, Sentinel)。  

## 合規性考量
- **資料保留策略**：日誌與事件需根據政策保留 (例如 90 天、1 年)。  
- **隱私與遮罩**：敏感資訊 (密碼、金鑰) 需在日誌中遮罩。  
- **地區合規**：支援多區部署，符合資料在地法規 (如 GDPR, 台灣個資法)。  

## 模組對應
- IAM → Keycloak + RBAC 管控  
- Observability → 操作與查詢需審計  
- Automation → Workflow 執行需記錄與授權檢查  
- Analysis → Insights 查詢需遵守租戶隔離  
- Platform Settings → 安全策略與合規性配置  

## 結論
SRE Platform 的安全模型透過 **Keycloak 驗證、RBAC 授權、多租戶隔離、審計日誌、合規支援**，提供企業級可信的基礎，確保平台能在嚴格安全需求下落地。