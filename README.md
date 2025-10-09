# SRE 平台

一個現代化的 Site Reliability Engineering (SRE) 平台，提供全面的系統監控、事件管理、資源管理與自動化運維功能。

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
   cat <<'EOF' > .env
   VITE_API_BASE_URL=http://localhost:4000/api/v1
   EOF
   ```

4. **啟動 Mock Server**
   ```bash
   node mock-server/server.js
   ```
   Mock Server 將於 `http://localhost:4000` 啟動，提供開發與測試用途。

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

## 🔧 開發指南

### Mock Server
提供完整的開發與測試 API 端點，支援核心功能的 CRUD 操作。  
重啟後資料會重置。

### 技術棧
- 待更新

### 可用指令
```bash
npm run dev          # 開發模式
npm run build        # 生產建置
npm run preview      # 本地預覽
```

## 📚 文件導航

### 📖 核心文檔
| 文檔 | 用途 |
|------|------|
| [README.md](README.md) | 專案說明與快速開始 |
| [docs/specs/scene/_index.md](docs/specs/scene/_index.md) | 系統層規範索引 |
| [docs/specs/modules/_index.md](docs/specs/modules/_index.md) | 模組級規格索引 |