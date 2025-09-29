


# SRE Platform DB Schema 心智圖

## 現有 (程式碼中已有)
- 儀表板 (dashboards)
- 事件 (events)
- 告警規則 (alert_rules)
- 靜音規則 (silence_rules)
- 資源 (resources)
- 資源群組 (resource_groups)
- 自動化腳本 (automation_scripts)
- 自動化觸發器 (automation_triggers)
- 自動化執行歷史 (automation_executions)
- 使用者 (users)
- 團隊 (teams)
- 角色 (roles)
- 審計日誌 (audit_logs)
- 版面配置 (layouts)
- 標籤 (tags)

## UI 規劃但尚未落地
- 通知策略 (notification_strategies)
- 通知管道 (notification_channels)
- 通知發送歷史 (notification_history)
- 日誌 (logs)
- 鏈路追蹤 (traces)
- 容量建議 (capacity_suggestions)
- 身份驗證設定 (settings_auth)
- Grafana 設定 (settings_grafana)
- 郵件設定 (settings_mail)
- 租戶 (tenants)

## 總結
- 目前程式碼已實作：15 張表  
- 預計補充：10 張表  
- 完整 Schema：約 25 張表