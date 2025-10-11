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

## 專案架構

### 完整目錄結構

```bash
sre-platform-app/
├── 📁 .specify/                          # SpecKit 工具與配置
│   ├── 📁 memory/                        # 平台憲法與開發指南
│   │   ├── 📄 constitution.md            # 平台憲法：全域治理與技術標準
│   │   └── 📄 development-guideline.md   # 開發執行指導原則
│   ├── 📁 scripts/                       # SpecKit 腳本工具
│   ├── 📁 templates/                     # SpecKit 範本檔案
│   └── 📄 spec-driven.md                 # Spec-driven 開發哲學
│
├── 📁 docs/                              # 專案文檔
│
├── 📁 specs/                              # 功能規格定義 (Spec-driven)
│   ├── 📁 001-platform-auth/              # 🔐 身份驗證管理模組
│   ├── 📁 002-identity-access-management/ # 👥 身份與存取管理
│   ├── 📁 003-platform-navigation/        # 🧭 導航系統管理
│   ├── 📁 004-platform-mail/              # 📧 郵件通知管理
│   ├── 📁 005-platform-tag/               # 🏷️ 標籤系統管理
│   ├── 📁 006-platform-grafana/           # 📊 Grafana 平台整合
│   ├── 📁 007-resources-management/       # 🖥️ 資源總覽管理
│   ├── 📁 008-insight-log/                # 📝 日誌洞察分析
│   ├── 📁 009-insight-analysis/           # 🔍 智慧分析與預測
│   ├── 📁 010-incident-rules/             # 🚨 事件規則配置
│   ├── 📁 011-incident-list/              # 📋 事件列表管理
│   ├── 📁 012-notification-management/    # 🔔 通知管道管理
│   ├── 📁 013-automation-management/      # 🤖 自動化腳本管理
│   ├── 📁 014-dashboards-management/      # 📈 儀表板管理
│   └── 📁 015-user-profile/               # 👤 用戶個人設定
│
├── 📁 frontend/                           # 🎨 前端應用主入口
│   ├── 📁 src/
│   │   ├── 📁 core/                       # 核心框架
│   │   │   ├── 📁 components/             # Layout, Page, Toolbar, Navigation
│   │   │   ├── 📁 hooks/                  # useAuth, useApi, useTheme...
│   │   │   ├── 📁 contexts/               # AuthContext, ConfigContext
│   │   │   └── 📁 services/               # apiClient, config, logging
│   │   │
│   │   ├── 📁 features/
│   │   │   ├── 📁 settings/ 
│   │   │   │   └── pages/     
│   │   │   │       ├── AuthSettingsPage.tsx       # 身份驗證 [001-platform-auth]
│   │   │   │       ├── NavigationSettingsPage.tsx # 導航設定 [003-platform-navigation]
│   │   │   │       ├── MailSettingsPage.tsx       # 郵件通知 [004-platform-mail]
│   │   │   │       ├── TagManagementPage.tsx      # 標籤管理 [005-platform-tag]
│   │   │   │       └── GrafanaSettingsPage.tsx    # Grafana 設定 [006-platform-grafana]
│   │   │   │
│   │   │   ├── 📁 iam/  
│   │   │   │   └── pages/
│   │   │   │       ├── PersonnelManagementPage.tsx   # 人員管理 [002-identity-access-management]
│   │   │   │       ├── TeamManagementPage.tsx        # 團隊管理 [002-identity-access-management]
│   │   │   │       └── RoleManagementPage.tsx        # 角色管理 [002-identity-access-management]
│   │   │   │
│   │   │   ├── 📁 resources/
│   │   │   │   └── pages/
│   │   │   │       ├── ResourceListPage.tsx           # 資源列表 [007-resources-management]
│   │   │   │       ├── ResourceGroupPage.tsx          # 資源群組 [007-resources-management]
│   │   │   │       ├── AutoDiscoveryPage.tsx          # 自動掃描 [007-resources-management]
│   │   │   │       ├── DatasourceManagementPage.tsx   # 資料源管理 [007-resources-management]
│   │   │   │       └── ResourceTopologyPage.tsx       # 拓撲視圖 [007-resources-management]
│   │   │   │
│   │   │   ├── 📁 insight/
│   │   │   │   └── pages/ 
│   │   │   │       ├── LogExplorerPage.tsx       # 日誌探索 [specs/008-insight-log]
│   │   │   │       ├── BacktestingPage.tsx       # 回測分析 [specs/009-insight-analysis]
│   │   │   │       └── CapacityPlanningPage.tsx  # 容量規劃 [specs/009-insight-analysis]
│   │   │   │
│   │   │   ├── 📁 incidents/
│   │   │   │   └── pages/  
│   │   │   │       ├── AlertRulePage.tsx    # 告警規則 [specs/010-incident-rules]
│   │   │   │       ├── SilenceRulePage.tsx  # 靜音規則 [specs/010-incident-rules]
│   │   │   │       └── IncidentListPage.tsx # 事件列表 [specs/011-incident-list]
│   │   │   │
│   │   │   ├── 📁 notification/
│   │   │   │   └── pages/ 
│   │   │   │       ├── NotificationStrategyPage.tsx # 通知策略 [012-notification-management]
│   │   │   │       ├── NotificationChannelPage.tsx  # 通知管道 [012-notification-management]
│   │   │   │       └── NotificationHistoryPage.tsx  # 發送歷史 [012-notification-management]
│   │   │   │
│   │   │   ├── 📁 automation/            
│   │   │   │   └── pages/ 
│   │   │   │       ├── AutomationPlaybooksPage.tsx # 腳本庫 [013-automation-management]
│   │   │   │       ├── AutomationTriggersPage.tsx  # 觸發器 [013-automation-management]
│   │   │   │       └── AutomationHistoryPage.tsx   # 運行歷史 [013-automation-management]
│   │   │   │
│   │   │   ├── 📁 dashboards/            
│   │   │   │   └── pages/ 
│   │   │   │       ├── DashboardListPage.tsx      # 儀表板列表 [014-dashboards-management]
│   │   │   │       ├── DashboardEditorPage.tsx    # 儀表板編輯 [014-dashboards-management]
│   │   │   │       └── SREWarRoomPage.tsx         # 內建儀表板 [014-dashboards-management]
│   │   │   │
│   │   │   ├── 📁 profile/
│   │   │   │   └── pages/  
│   │   │   │       ├── PersonalInfoPage.tsx       # 個人資料 [specs/015-user-profile]
│   │   │   │       ├── PreferenceSettingsPage.tsx # 偏好設定 [specs/015-user-profile]
│   │   │   │       └── SecuritySettingsPage.tsx   # 安全設定 [specs/015-user-profile]
│   │   │   │
│   │   ├── 📁 ui/                        # 共用 UI 元件庫
│   │   │   ├── 📁 components/            # Table, Drawer, KPIBlock...
│   │   │   └── 📁 theme/                 # 顏色、字體定義
│   │   │
│   │   ├── 📁 scenes/                    # Grafana Scenes 整合層
│   │   │   ├── 📄 SreDashboardScene.ts   # 自訂儀表板場景
│   │   │   └── 📄 index.ts               # Scenes 匯出
│   │   │
│   │   ├── 📄 App.tsx                    # 主應用組件
│   │   ├── 📄 routes.tsx                 # 路由配置
│   │   └── 📄 index.tsx                  # 應用入口
│   │
│   ├── 📁 scripts/                       # 前端建構腳本
│   ├── 📄 package.json                   # 依賴管理
│   ├── 📄 tsconfig.json                  # TypeScript 配置
│   ├── 📄 vite.config.ts                 # Vite 建構配置
│   └── 📄 index.html                     # HTML 模板
│
├── 📁 packages/                          # 📦 可重用套件
│   ├── 📁 sre-ui/                        # 自定 UI 元件庫
│   ├── 📁 sre-data/                      # 資料結構與 DTO
│   ├── 📁 sre-runtime/                   # 前端運行時 (API, Plugin, Session)
│   ├── 📁 sre-plugin-sdk/                # 外掛開發 SDK
│   └── 📁 sre-scenes/                    # Scenes 擴充封裝
│
├── 📁 scripts/                           # 🔧 專案腳本工具
│   ├── 📄 build.ts                       # 統一建構腳本
│   ├── 📄 check-spec-consistency.ts      # 規格一致性檢查
│   └── 📄 sync-openapi.ts                # OpenAPI 同步工具
│
├── 📄 README.md                          # 專案說明文件
├── 📄 LICENSE                            # 授權文件
├── 📄 package.json                       # 根專案依賴
└── 📄 tsconfig.json                      # 根 TypeScript 配置
```

### 功能模組對應表

| 模組編號 | 功能模組 | 負責範圍 | 技術重點 |
|---------|---------|---------|---------|
| **001** | 🔐 身份驗證管理 | Keycloak, Auth0, Azure AD 整合 | 多 IdP 支援、Session 管理 |
| **002** | 👥 身份存取管理 | RBAC, 角色權限、使用者管理 | 細粒度權限控制 |
| **003** | 🧭 導航系統 | 動態選單、權限導航、書籤功能 | 事件驅動導航更新 |
| **004** | 📧 郵件通知 | SMTP 配置、多通道通知、範本管理 | 高可用郵件服務 |
| **005** | 🏷️ 標籤系統 | 資源標籤、標籤綱要、合規檢查 | 標籤治理、自動化標記 |
| **006** | 📊 Grafana 整合 | 外部 Grafana 代理、API Key 管理 | 安全代理模式 |
| **007** | 🖥️ 資源管理 | 多雲資源納管、健康監控、拓撲視圖 | 統一資源抽象層 |
| **008** | 📝 日誌洞察 | 結構化日誌查詢、AI 分析、效能優化 | 大數據日誌處理 |
| **009** | 🔍 智慧分析 | 容量預測、異常檢測、趨勢分析 | ML 驅動的洞察 |
| **010** | 🚨 事件規則 | 告警規則配置、靜音管理、AI 優化 | 智慧規則引擎 |
| **011** | 📋 事件列表 | 事件管理、AI 根因分析、分派處理 | Webhook 整合 |
| **012** | 🔔 通知管理 | 多通道通知、動態表單、智慧重試 | 通知管道抽象 |
| **013** | 🤖 自動化管理 | 腳本執行、事件觸發、容器化環境 | 安全腳本執行 |
| **014** | 📈 儀表板管理 | 自訂儀表板、外部整合、權限控制 | Grafana Scenes |
| **015** | 👤 用戶個人資料 | 偏好設定、主題切換、多語言支援 | 用戶體驗優化 |

### 架構原則

- **以 Grafana UI 為中心**：所有模組視圖、控制元件與交互均以 Grafana Scenes 為核心構建。  
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