# 審計日誌 (Auditing)

**目標**：確保所有對系統狀態有影響的關鍵操作都被記錄下來，以便於安全審計、故障排查和責任追溯。

**1. 審計日誌的觸發與內容：**

- **觸發原則**：任何執行 **Create, Update, Delete (CUD)** 操作的 API 端點，在後端成功處理請求後，**必須**產生一筆對應的審計日誌。此外，部分高風險的讀取（Read）或執行（Execute）操作也應被記錄。
- **日誌內容綱要 (Schema)**：每條審計日誌應包含以下標準欄位：
    - `timestamp`: 事件發生的精確時間 (ISO 8601)。
    - `actor`: 操作發起者的資訊，至少包含 `user_id` 和 `user_name`。
    - `source_ip`: 發起請求的來源 IP 位址。
    - `action`: 操作類型，採用 `RESOURCE.ACTION` 格式，例如 `USER.CREATE`, `ROLE.UPDATE`, `INCIDENT.RESOLVE`。
    - `target`: 操作目標的資訊，包含 `target_id` 和 `target_type` (如 `user`, `role`, `incident`)。
    - `result`: 操作結果 (`success` 或 `failed`)。
    - `details`: (JSON 物件) 包含該次操作的上下文細節。對於 `Update` 操作，應盡可能同時包含 `before` 和 `after` 的狀態，以便追蹤變更。

**2. 前端職責：**

- 前端**無需**也**不應**主動發送審計日誌。審計日誌的產生是後端的責任，以確保其不可篡改性和完整性。
- 前端只需確保在呼叫 API 時，傳遞了所有必要的資訊（例如，要修改的資源 ID 和新的資料）。

**3. 具體模組的審計要求：**

- **Identity & Settings**: 對於 `users`, `roles`, `teams`, `datasources`, `notification channels/strategies`, `tags` 等的所有 CRUD 操作都必須記錄。
- **Incidents**: 對於 `acknowledge`, `resolve`, `assign`, `silence` 等改變事件狀態的操作必須記錄。
- **Automation**: 對於 Playbook 和 Trigger 的 CRUD 操作，以及**每一次** Playbook 的執行（無論手動或自動），都必須記錄。
- **Security**: 查看敏感設定（如 `platform-auth`）和變更安全設定（如修改密碼、撤銷會話）等操作，必須記錄為**高優先級**的安全審計事件。