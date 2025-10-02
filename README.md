# SRE 平台

一個現代化的 Site Reliability Engineering (SRE) 平台，提供全面的系統監控、事件管理、資源管理與自動化運維功能。

![SRE Platform Demo](demo.gif)

## ✨ 主要特色

- **📊 儀表板管理**: 自訂儀表板整合 Grafana，支持多雲資源健康狀態監控
- **🚨 事件管理**: 智慧事件規則引擎，支援告警規則、靜音規則與自動化回應
- **🔧 資源管理**: 統一資源拓撲視圖，支援多雲資源納管與健康監控
- **🤖 自動化中心**: 可視化自動化腳本編輯器，支持排程任務與事件觸發
- **📈 分析中心**: AI 驅動的根因分析、日誌探索與追蹤分析
- **👥 身份與存取管理**: 完整的角色權限系統與審計日誌
- **📢 通知管理**: 多渠道通知策略，支援 Email、Slack、Webhook
- **⚙️ 平台設定**: 靈活的頁面佈局配置與系統設定

## 🚀 快速開始

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
   # 建議建立或更新 .env 檔案，讓前端知道 Mock API 的 Base URL
   cat <<'EOF' > .env
   VITE_API_BASE_URL=http://localhost:4000/api/v1
   EOF
   ```
   若已存在其他環境設定檔，請確保 `VITE_API_BASE_URL` 變數的值正確指向目標 API。

4. **啟動 Mock Server**
   ```bash
   # 在新終端視窗中執行
   node mock-server/server.js
   ```
   Mock Server 將在 `http://localhost:4000` 啟動

5. **啟動前端應用**
   ```bash
   npm run dev
   ```
   應用將在 `http://localhost:5173` 啟動

### 生產環境部署

```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

## 📁 專案結構

```
sre-platform-app/
├── components/          # React 元件
├── layouts/            # 頁面佈局元件
├── pages/              # 頁面元件
│   ├── incidents/      # 事件管理
│   ├── resources/      # 資源管理
│   ├── dashboards/     # 儀表板管理
│   ├── automation/     # 自動化中心
│   ├── analysis/       # 分析中心
│   └── settings/       # 設定頁面
├── services/           # API 服務層
├── mock-server/        # 開發用 Mock API 伺服器
├── docs/               # 📚 專案文檔
│   ├── analysis/       # 分析報告
│   ├── reports/        # 完成報告
│   └── guides/         # 執行指引
├── types.ts            # TypeScript 型別定義
├── openapi.yaml        # API 規範文件
```

## 🔧 開發指南

### Mock Server

專案包含完整的 Mock API Server，用於前端開發與測試：

- **API 端點**: 預設透過 `VITE_API_BASE_URL` 指定（例如 `http://localhost:4000/api/v1`）
- **資料持久性**: 記憶體儲存，重啟後重置
- **完整功能**: 支援所有核心功能 CRUD 操作
- **跨域支援**: 允許前端應用程式跨域存取

### 技術棧

- **前端框架**: React 19 + TypeScript
- **建置工具**: Vite
- **UI 框架**: 自訂元件系統
- **圖表庫**: ECharts
- **狀態管理**: React Hooks + Context
- **路由**: React Router v7
- **HTTP 客戶端**: Axios
- **AI 整合**: Google Gemini API

### 可用指令

```bash
npm run dev          # 開發模式啟動
npm run build        # 生產環境建置
npm run preview      # 預覽建置結果
```

## 📚 文檔導航

### 📖 核心文檔（必讀）

| 文檔 | 用途 | 優先級 |
|------|------|--------|
| [README.md](README.md) | 專案說明與快速開始 | ⭐⭐⭐ |
| [TASKS.md](TASKS.md) | 📋 **集中改進任務清單**（逐項執行） | ⭐⭐⭐ |

### 🔧 執行指引

- [AGENT.md](AGENT.md) - 🤖 AI Agent 執行指引（任務清單、執行步驟）⭐
- [`docs/guides/ai_prompts_for_improvement.md`](docs/guides/ai_prompts_for_improvement.md) - 6 個結構化改進提示詞

### 📐 架構文檔

- [architecture.md](architecture.md) - 系統架構說明
- [specs.md](specs.md) - 功能規格說明
- [pages.md](pages.md) - 頁面結構與路由
- [ai_agent_plan.md](ai_agent_plan.md) - AI Agent 整合計畫

---

**注意**: 此為前端展示專案，包含完整的 Mock API Server 用於開發測試。生產環境部署時，請將 API 請求指向真實的後端服務。
