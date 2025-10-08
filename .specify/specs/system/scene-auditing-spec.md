# Scene Auditing Specification（Scenes 架構審計規範）

**模組名稱 (Module)**: Scene Auditing Specification   
**來源 (Source)**: `SceneEventBus`, `SceneTelemetry`, `SceneStatusHandler`, `SceneAppProvider`  
**建立日期 (Created)**: 2025-10-09  
**狀態 (Status)**: Active  
**依據憲法條款 (Based on)**: `.specify/memory/constitution.md` (v2.0)

---

## 一、目標（Objective）

確保所有對系統狀態有影響的操作都被可靠地追蹤與記錄，以支援：
- 安全審計與合規需求  
- 故障排查與行為追蹤  
- 問責與行為透明化  

Scenes 架構中，審計紀錄由後端生成，但前端需負責**事件識別與觀測上報**。

---

## 二、審計日誌的觸發與內容（Audit Event Schema）

### 觸發原則
- 任意執行 **Create, Update, Delete (CUD)** 操作的 API，於後端成功處理後必須產生審計事件。  
- 高風險的 **Read** 或 **Execute** 操作（例如檢視密鑰、執行 Playbook）也應觸發審計記錄。  
- 前端若觸發此類操作，需透過 `SceneEventBus` 廣播事件以供追蹤。

### 審計日誌結構 (Schema)
每條審計紀錄包含以下欄位：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `timestamp` | string (ISO 8601) | 操作發生時間 |
| `actor` | object | 包含 `user_id`, `user_name` |
| `source_ip` | string | 請求來源 IP |
| `action` | string | 操作類型，格式為 `RESOURCE.ACTION`（如 `USER.CREATE`） |
| `target` | object | 包含 `target_id`, `target_type` |
| `result` | string | `success` 或 `failed` |
| `details` | object | 變更細節，含 `before` 與 `after` 狀態 |
| `audit_id` | string | 唯一追蹤識別碼 |
| `latency_ms` | number | 操作耗時，前端由 Telemetry 上報 |

---

## 三、前端與後端職責（Responsibilities）

### 前端 (Scenes)
- 不直接生成審計紀錄，但需：
  - 廣播 `SceneEventBus` 事件，包含操作名稱、資源與使用者上下文。
  - 使用 `SceneTelemetry` 上報互動耗時與結果狀態。
  - 顯示後端回傳的 `auditId`（由 `SceneStatusHandler` 呈現）。

### 後端
- 負責生成不可篡改的審計日誌，並確保資料儲存與查詢一致性。
- 可依事件嚴重性分類（normal / elevated / critical）。

---

## 四、模組審計覆蓋範圍（Scope by Module）

| 模組 | 審計行為 | 優先級 |
|------|-----------|--------|
| **Identity & Settings** | 使用者、角色、群組、通知設定、標籤 CRUD 操作 | 高 |
| **Incidents** | 事件的 `acknowledge`、`resolve`、`assign`、`silence` | 高 |
| **Automation** | Playbook、Trigger CRUD 以及每次執行行為 | 高 |
| **Platform Security** | 檢視或變更敏感設定（認證、密碼、撤銷會話） | Critical |
| **Resources** | 新增、刪除、標記、重新命名資源 | 中 |

---

## 五、治理與觀測性（Governance & Observability）

| 項目 | 狀態 | 說明 |
|------|------|------|
| Logging | ✅ | 所有 SceneEventBus 廣播事件應帶有 `auditContext` |
| Telemetry | ✅ | 上報每次操作的延遲與結果狀態 |
| AuditId 顯示 | ✅ | 由 `SceneStatusHandler` 顯示成功訊息與追蹤連結 |
| RBAC 驗證 | ✅ | 權限不足操作應記錄拒絕事件 |
| i18n 支援 | ✅ | 審計訊息文字需多語化 |

---

## 六、範例（Examples）

### 1. 前端廣播事件範例
```ts
SceneEventBus.emit("audit:event", {
  action: "INCIDENT.RESOLVE",
  target: { id: "inc_123", type: "incident" },
  result: "success",
  latency_ms: 142,
});
```

### 2. 後端產生日誌範例
```json
{
  "timestamp": "2025-10-09T14:25:03Z",
  "actor": { "user_id": "u-42", "user_name": "alice" },
  "source_ip": "10.1.2.3",
  "action": "INCIDENT.RESOLVE",
  "target": { "target_id": "inc_123", "target_type": "incident" },
  "result": "success",
  "details": { "before": { "status": "open" }, "after": { "status": "resolved" } },
  "audit_id": "AUD-20251009-014523",
  "latency_ms": 142
}
```

---

## 七、結語（Conclusion）

本文件定義了 Grafana Scenes 架構下的審計行為模型，  
強調「前端事件可觀測、後端紀錄不可變」，  
以確保系統操作的完整性、安全性與責任追溯性。