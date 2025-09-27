

# DEPLOYMENT_GUIDE (SRE Platform)

## 文件目的
本文件提供 SRE Platform 的部署指南，涵蓋本地開發環境、私有化部署 (Proxmox/Kubernetes)、以及 SaaS 模式的考量。

## 部署模式

### 1. 本地開發環境
- **工具**：Docker Compose
- **目的**：快速啟動完整開發環境，支援前後端協作與 API 測試。
- **步驟**：
  1. 安裝 Docker / Docker Compose。
  2. 執行 `make setup-dev` 初始化資料庫與服務。
  3. 執行 `make start-services` 啟動依賴服務 (Keycloak, ChromaDB, Prometheus, Grafana Mock API)。
  4. 啟動前端 `npm run dev` 與後端 `go run main.go` / `python main.py`。
- **特色**：支援熱重載、mock-server、資料快速重置。

### 2. 私有化部署 (Proxmox / Kubernetes)
- **Proxmox VM 部署**：
  - 適用於單一企業內部自管環境。
  - 可將前端、後端、資料庫分別封裝於 VM 或 LXC Container。
  - 建議搭配 `init.sh` 或 Ansible Playbook 做自動化安裝。
- **Kubernetes 部署**：
  - 適用於大型或多租戶場景。
  - 部署組件：
    - 前端 (React SPA, Nginx 容器)
    - 後端服務 (Go / Python 微服務)
    - 資料庫 (PostgreSQL, Redis, VectorDB)
    - Observability (Prometheus, Grafana, Loki)
    - Keycloak (認證與存取控制)
    - n8n (Workflow Engine)
  - 建議搭配 Helm Chart 與 GitOps (ArgoCD / Flux)。
  - 多租戶支援：使用 K8s Namespace + ResourceQuota + NetworkPolicy。

### 3. SaaS 模式
- **定位**：多租戶雲端服務，由平台運營團隊管理基礎設施。
- **需求**：
  - 使用者隔離：DB schema per tenant 或 Row-level Security。
  - 資料合規：支援 GDPR / 個資法要求。
  - 彈性伸縮：K8s HPA/VPA，自動化調度。
- **監控**：
  - 系統健康檢查 `/health`。
  - 資源使用追蹤 (Prometheus + Grafana)。

## CI/CD 流程
- **版本控制**：GitHub / GitLab
- **CI/CD 工具**：GitHub Actions / GitLab CI
- **流程**：
  1. Push → 自動觸發 Lint/Test
  2. Build → 前端/後端 Docker Image
  3. Deploy → Docker Compose (Dev) / Helm (K8s)
- **環境分層**：
  - Dev → Staging → Prod
  - 每層皆有獨立 DB 與 Keycloak Realm

## 安全與合規
- TLS/HTTPS 強制加密
- Keycloak 管控 SSO 與 RBAC
- 多租戶隔離與審計日誌
- 資料保留策略 (90 天 / 1 年，可配置)
- 整合 SIEM (Splunk / Sentinel) 以便安全事件監控

## 結論
SRE Platform 提供靈活的部署模式，能從 **本地開發 → 企業私有化 → SaaS 多租戶** 平順演進，並透過 CI/CD 與安全治理確保高可靠性與合規性。