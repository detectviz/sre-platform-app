# SRE 平台 Mock Server 指南

**版本**: 2.0
**目標**: 為 SRE 平台前端提供一個完整、一致且易於使用的本地 Mock API 伺服器。

## 📋 概覽

此 Mock Server 是一個基於 Node.js 和 Express 的輕量級伺服器，旨在完整模擬 `openapi.yaml` (v4.0.1) 中定義的所有 API 端點。它使前端開發人員能夠在沒有真實後端的情況下進行完整的開發和測試，從而實現前後端的並行開發。

## ✨ 主要特色

- **100% API 契約對齊**: 完全基於 `openapi.yaml` v4.0.1 規範實現。
- **完整的 CRUD 操作**: 支援所有核心資源（如人員、團隊、儀表板、資源等）的增、刪、改、查操作。
- **記憶體資料庫**: 伺服器啟動時會載入 `constants.ts` 中的模擬資料。所有變更都儲存在記憶體中，伺服器重新啟動後會重置為初始狀態。
- **支援軟刪除**: 核心資源的刪除操作為軟刪除 (`deleted_at`)，與真實後端架構保持一致。
- **分頁與篩選**: 為列表端點（如人員列表）實現了後端分頁與基本的篩選邏輯。
- **低延遲**: 所有回應幾乎是即時的（< 50ms），加速了本地開發。
- **跨域支援**: 內建 `cors` 支援，允許從任何來源的前端應用程式進行調用。

## 🚀 如何執行

### 前提條件

- 已安裝 [Node.js](https://nodejs.org/) (建議 v16 或更高版本)。
- 已安裝 `express`、`cors` 和 `body-parser` 套件。如果尚未安裝，請在專案根目錄執行：
  ```bash
  npm install express cors body-parser
  ```

### 必填環境變數

Mock Server 依賴以下環境變數以產生連結與外部系統 URL，啟動時若缺失將直接中止並顯示提示：

| 環境變數 | 說明 |
| --- | --- |
| `MOCK_API_BASE_URL` | 提供給 mock 資料中的 API 基礎 URL（例如 `http://127.0.0.1:4000/api/v1`）。 |
| `MOCK_GRAFANA_BASE_URL` | 提供儀表板與探索頁面所需的 Grafana 入口網址。 |
| `MOCK_IDP_ADMIN_URL` | 提供 IAM 頁面指向身分提供者管理主控台的網址。 |

可透過 shell 匯出或在 `.env` 檔案中設定：

```bash
export MOCK_API_BASE_URL="http://127.0.0.1:4000/api/v1"
export MOCK_GRAFANA_BASE_URL="https://grafana.internal.example"
export MOCK_IDP_ADMIN_URL="https://idp.internal.example/admin/master/console/"
```

### 啟動伺服器

1.  開啟您的終端機。
2.  導覽至專案的根目錄。
3.  執行以下命令來啟動伺服器：

    ```bash
    node mock-server/server.js
    ```

4.  如果成功，您將在終端機中看到以下訊息（實際主機與埠號取決於您的環境變數設定）：
    ```
    SRE Platform Mock Server is running on http://127.0.0.1:4000
    ```

### API 端點

- **基礎 URL**: 由 `MOCK_API_BASE_URL` 決定（例如 `http://127.0.0.1:4000/api/v1`）。
- 所有可用的端點請參考 `openapi.yaml` 檔案。

##  Fired Endpoints (v2.0)

Mock Server 已大幅擴充，涵蓋了 `openapi.yaml` 中定義的大部分 API。

### 儀表板 (`/dashboards`)
- `GET /dashboards`: 取得儀表板的分頁列表。
- `POST /dashboards`: 建立新的儀表板。
- `GET /dashboards/{id}`: 依 ID 取得單一儀表板。
- `PATCH /dashboards/{id}`: 更新儀表板。
- `DELETE /dashboards/{id}`: **軟刪除**儀表板。

### 事件管理 (`/events`)
- `GET /events`: 取得事件的分頁列表。
- `POST /events/{id}/actions`: 確認 (Acknowledge) 或解決 (Resolve) 事件。

### 規則管理 (`/alert-rules`, `/silence-rules`)
- `GET /alert-rules`: 取得告警規則列表 (唯讀)。
- `GET /silence-rules`: 取得靜音規則列表 (唯讀)。

### 資源管理 (`/resources`, `/resource-groups`)
- `GET /resources`: 取得資源的分頁列表。
- `POST /resources`: 建立新資源。
- `DELETE /resources/{id}`: **軟刪除**資源。
- `GET /resource-groups`: 取得資源群組列表。

### 自動化 (`/automation`)
- `GET /automation/scripts`: 取得自動化腳本列表。
- `GET /automation/triggers`: 取得觸發器列表。
- `GET /automation/executions`: 取得執行歷史的分頁列表。

### 身份與存取 (IAM) (`/iam`)
- `GET /iam/users`: 取得人員的分頁和篩選列表。
- `POST /iam/users`: 邀請新人員。
- `PATCH /iam/users/{id}`: 更新人員資訊。
- `DELETE /iam/users/{id}`: **軟刪除**人員。
- `POST /iam/users/batch-actions`: 批次停用或**軟刪除**人員。
- `GET /iam/teams`: 取得團隊列表。
- `POST /iam/teams`: 建立團隊。
- `PATCH /iam/teams/{id}`: 更新團隊。
- `DELETE /iam/teams/{id}`: **軟刪除**團隊。
- `GET /iam/roles`: 取得角色列表。
- `GET /iam/audit-logs`: 取得審計日誌的分頁列表。

### 平台設定 (`/settings`)
- `GET /settings/layouts`: 取得頁面版面配置。
- `PUT /settings/layouts`: 儲存頁面版面配置。
- `GET /settings/tags`: 取得標籤定義列表。

## 🔧 前端整合

前端應用程式應將 API 請求指向 Mock Server 的基礎 URL。我們提供了一個統一的 API 服務 (`src/services/api.ts`) 來處理所有請求。

**範例: 取得人員列表**
```typescript
import api from '../services/api';

const fetchUsers = async () => {
  try {
    const response = await api.get('/iam/users?page=1&page_size=10');
    // response.data 將包含 { page, page_size, total, items }
    console.log(response.data.items);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};
```

## 📦 資料持久性

請注意，此 Mock Server 使用 **記憶體儲存**。這意味著您透過 API 進行的任何新增、修改或刪除操作都 **不會** 在伺服器重新啟動後保留。每次重新啟動伺服器，資料都會重置為初始狀態。這對於保持一個乾淨、可預測的測試環境非常有用。