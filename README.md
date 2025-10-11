# SRE 平台

一個現代化的 Site Reliability Engineering (SRE) 平台，提供全面的系統監控、事件管理、資源管理與自動化運維功能。

## 快速開始

### 環境需求

- Node.js 18+ (建議使用 LTS 版本)
- npm 或 yarn 套件管理器

### 本地開發

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd sre-platform-app
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設定環境變數**
   ```bash
   cat <<'EOF' > .env
   VITE_API_BASE_URL=http://localhost:4000/api/v1
   EOF
   ```

4. **啟動 Mock Server**
   ```bash
   node mock-server/server.js
   ```
   Mock Server 將於 `http://localhost:4000` 啟動，提供開發與測試用途。  
   所有 API 回應遵循 `/specs` 目錄下各模組的 `spec.md` 文件中定義的技術實現細節。

5. **啟動前端應用**
   ```bash
   npm run dev
   ```
   應用將於 `http://localhost:5173` 啟動。

### 生產環境部署

```bash
npm run build
npm run preview
```

---

## 開發指南

### 開發模式說明

目前專案採用 **Frontend-First + Mock 驅動開發策略**：

- 前端為正式實作階段，所有元件、畫面、互動皆屬最終產品結構。
- 後端尚未開發，所有 API 由 Mock Server 提供。
- 所有規格文件以 `/specs` 目錄為唯一事實來源（Spec-driven Development）。

### Mock Server
提供完整的開發與測試 API 端點，支援核心功能的 CRUD 操作。  
重啟後資料會重置。

---

## 技術棧

### 核心語言與框架
- **TypeScript 5.5 + React 18** – 現代化前端語言與函式元件架構
- **Go + FastAPI [FUTURE]** – 混合式後端架構，支援高併發與微服務協作
- **Grafana UI / Scenes SDK** – 前端主體框架，統一設計語言與可組態化介面
- **OpenAPI 3.1 / gRPC** – 跨服務 API 契約與規格驅動開發
- **Keycloak OIDC** – 單一登入與細粒度權限控管（RBAC / SSO）

### 前端架構
- **React + Vite** – Scenes 應用開發基礎，支援快速構建與熱重載
- **ECharts + Grafana Visualization** – 統計圖與監控指標視覺化
- **React Query + Redux Toolkit** – 狀態與資料快取管理
- **Axios / Fetch API** – 後端 API 通訊與 Grafana Proxy 支援

### 後端與資料架構
- **Mock Server (Node.js)** – 暫代後端 API，完全遵守 `/specs` 中的定義
- **Go + FastAPI [FUTURE]** – 後端服務層（未啟動）
- **Database:** SQLite（開發）/ PostgreSQL 15（生產）
- **Timeseries:** VictoriaMetrics（時序資料存儲）
- **Cache:** InMemory（輕量）/ Redis 7（集中式快取與佇列）
- **Analytics:** Grafana（統一儀表板與分析模組）
- **OpenTelemetry Collector** – 日誌、追蹤與指標統一收集

### AI 與智慧功能
- **Google ADK + Gemini** – 多代理協作與 AI 推理
- **Agent Framework** – FastAPI 作為代理執行層
- **Knowledge Base** – ChromaDB 向量資料庫 + Redis 狀態存儲

### 觀測性與監控
- **Grafana Stack** – 統一觀測平台（Loki 日誌 / Prometheus 指標 / Tempo 追蹤）
- **Sentry + Web Vitals** – 前端錯誤監控與性能追蹤
- **Data Collectors** – snmp_exporter / node_exporter / Alloy
- **Alerting** – 整合告警機制與儀表板治理  
  > MVP 階段採用 Mock 資料驅動 Grafana Scenes 測試視圖。

---

## 架構原則
**以 Grafana UI 為中心**：所有模組視圖、控制元件與交互均以 Grafana Scenes 為核心構建。  
- **Frontend-First + Mock-based**：前端為正式實作，後端暫緩並由 Mock Server 驗證資料流。  
- **Spec-driven**：所有行為均由 `/specs` 定義，為唯一事實來源。  
- **Observability by Design**：從資料、API 到 UI 皆具可追蹤性與審計能力。  
- **Event-driven**：透過事件流維持模組間一致性。  

---

## 文件導航

### 核心文件
| 文件 | 用途 |
|------|------|
| [README.md](README.md) | 專案說明與快速開始 |
| [.specify/memory/constitution.md](.specify/memory/constitution.md) | 平台憲法：全域治理與技術標準 |
| [.specify/memory/development-guideline.md](.specify/memory/development-guideline.md) | 開發執行指導原則（Frontend-First + Mock 驅動） |