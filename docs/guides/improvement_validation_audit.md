# 改進任務提示詞

你是一位資深全端工程師，請依據以下清單逐項完成任務，確保功能完整落實，並與既有架構 (openapi.yaml、db_schema.sql、mock-server、前端 UI) 保持一致。

---

## 任務清單

### 前端可先做
6. **AnalysisOverview 採用 Hook**
   - 移除硬編碼，重構頁面邏輯使用 `timeRangeOptions` Hook。

9. **Dashboard ↔ Resource**
   - 儀表板初始化資料需正確填入對應的 `resource_ids`。

---

### 後端待做
1. **事件通知自動化**
   - 實作 Incident 建立時，自動匹配 NotificationStrategy 並寫入 NotificationHistory。

5. **SilenceRule 生效檢查**
   - 在告警評估邏輯中整合 SilenceRule，符合條件時應忽略事件。

7. **AutomationExecution ↔ Incident 寫回**
   - 確保 `POST /automation` API 在寫入紀錄時，同步更新 `incident_id`。

8. **NotificationStrategy ↔ History**
   - 發送通知時，正確記錄對應的 NotificationStrategy ID。

10. **SilenceRule 實際靜音生效邏輯**
    - 在告警引擎中實作 SilenceRule 的真正過濾，避免無效告警。

---

## 輸出要求
- 修改對應檔案，提供完整代碼片段。
- 說明修改原因與影響範圍。
- 確保與 `openapi.yaml`、`db_schema.sql`、`mock-server`、前端程式一致。
